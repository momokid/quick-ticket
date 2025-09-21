"use server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";
import { getCurrentUser } from "@/lib/current.user";

export async function createTicket(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      logEvent("Unauthorized ticket creation attempt", "auth", {}, "warning");
      return {
        success: false,
        message: "You must be logged in to create ticket",
      };
    }
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    if (!subject || !description || !priority) {
      logEvent(
        "Validation: Error: Missing tickets field",
        "ticket",
        { subject, description, priority },
        "warning"
      );
      return { success: false, message: "All fields are required" };
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        descrtiption: description,
        priority,
        user: { connect: { id: user.id } },
      },
    });
    logEvent(
      `Ticket created succesfully: ${ticket.id}`,
      "ticket",
      { ticketId: ticket.id },
      "info"
    );

    revalidatePath("/tickets");

    return {
      success: true,
      message: "Ticket created successfully",
    };
  } catch (error) {
    logEvent(
      "An error occurred while create the ticket",
      "ticket",
      { formData: Object.fromEntries(formData.entries()) },
      "error",
      error
    );

    return {
      success: false,
      message: "An eror occurred while creating the ticket",
    };
  }
}

export async function getTickets() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      logEvent("Unauthorised access to ticket list", "ticket", {}, "warning");

      return [];
    }
    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    logEvent(
      "Fetched ticket list",
      "ticket",
      { count: tickets.length },
      "info"
    );

    return tickets;
  } catch (error) {
    logEvent("Error fetching tickets", "ticket", {}, "error", error);
    return [];
  }
}

export async function getTicketById(id: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) },
    });

    if (!ticket) {
      logEvent("Ticket not found", "ticket", { ticketid: id }, "warning");
    }

    return ticket;
  } catch (error) {
    logEvent(
      "Error fetching ticket details",
      "ticket",
      { ticketId: id },
      "error",
      error
    );

    return null;
  }
}

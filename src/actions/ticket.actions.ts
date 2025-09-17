"use server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";

export async function createTicket(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
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
      data: { subject, descrtiption: description, priority },
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

export default createTicket;

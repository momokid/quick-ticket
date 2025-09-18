import { verifyAuthToken, getAuthCookie } from "./auth";
import { prisma } from "@/db/prisma";

type AuthPayload = {
  userId: string;
};

export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();

    if (!token) return null;

    const payload = (await verifyAuthToken(token)) as AuthPayload;

    console.log("PAYLOAD Data b4:", payload.userId);

    if (!payload?.userId) return null;

    console.log("PAYLOAD Data AFTER:", payload);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    console.log("User from Token:", user);
    return user;
  } catch (error) {
    console.log("Error getting the current user", error);

    return null;
  }
}

"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { logEvent } from "@/utils/sentry";
import { signAuthToken, setAuthCookie, removeAuthCookies } from "@/lib/auth";

type ResponseResult = {
  success: boolean;
  message: string;
};
//Register User
export async function registerUser(
  prevState: ResponseResult,
  formData: FormData
): Promise<ResponseResult> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      logEvent(
        "Validation error: Missing register fields",
        "auth",
        { name, email },
        "warning"
      );

      return { success: false, message: "All fields are required" };
    }

    //check if user exist
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      logEvent(
        `Registration failed: User already exists - ${email}`,
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "User already exists" };
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    //sigin and set auth token
    const token = await signAuthToken({ userId: user.id });
    await setAuthCookie(token);

    logEvent(
      `User registered successfully: ${email}`,
      "auth",
      { userId: user.id, email },
      "info"
    );

    return {
      success: true,
      message: "Registration successful",
    };
  } catch (error) {
    logEvent(
      `Unexpected error during registration`,
      "auth",
      {},
      "error",
      error
    );

    return {
      success: false,
      message: "Something went wrong. Please try again",
    };
  }
}

//Log user out and remove auth cookie
export async function logOutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await removeAuthCookies();

    logEvent("User ogged out successfully", "auth", {}, "info");
    return {
      success: true,
      message: "User logged out successfully",
    };
  } catch (error) {
    logEvent(
      "Unexpected error during log out",
      "auth",
      { error },
      "error",
      error
    );
    return {
      success: false,
      message: `Log out failed. Please try again`,
    };
  }
}

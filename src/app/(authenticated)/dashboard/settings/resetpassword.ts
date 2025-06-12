'use server'

import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/authOptions"
import db from "@/lib/prisma.db";
import bcrypt from 'bcrypt'
import { z } from "zod";
import { redirect } from "next/navigation"; // Import redirect

const resetPasswordSchema = z.object({
  oldPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function resetPassword(formData: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const validatedFields = resetPasswordSchema.parse(formData);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { password: true }
    });

    if (!user?.password) {
      return { success: false, error: "User not found" };
    }
    const verifyOldPassword = await bcrypt.compare(validatedFields.oldPassword, user.password);
    if (!verifyOldPassword) {
      return { success: false, error: "Current password is incorrect" };
    }
    const hashedPassword = await bcrypt.hash(validatedFields.newPassword, 12);
    await db.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    });


  } catch (error) {
    console.log(error)
    return { success: false, error: "Something went wrong" };
  }
  redirect("/sign-in");
}
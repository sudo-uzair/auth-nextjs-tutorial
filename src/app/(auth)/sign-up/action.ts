"use server";

import prisma from "@/lib/prisma.db";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { validationSchema } from "@/lib/validations/auth";

export async function signUpAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const parsed = validationSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid input");
  }
  const { email, password } = parsed.data;   
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  redirect("/sign-in");
}

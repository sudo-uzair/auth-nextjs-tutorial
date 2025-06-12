// File: app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user ||user.resetToken !== token) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    return NextResponse.json({ success: true, message: "Password reset" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

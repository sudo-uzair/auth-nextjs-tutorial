import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest,) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Please Enter Valid Email" });
    }
    const token = randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
      },
    });
    return NextResponse.json({
      token,
      email,
    });
  } catch (error) {
    console.error("Error", error);
  }
}

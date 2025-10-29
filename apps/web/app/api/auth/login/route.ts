import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signJwt } from "@/app/../lib/api/auth";
import { dbConnect } from "@/app/../lib/db";
import { User } from "@/app/../models/User";

const schema = z.object({
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  hederaAccountId: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const data = schema.parse(body);
    let user = null;
    if (data.username) {
      user = await User.findOne({ username: data.username });
      if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (data.password) {
        const valid = await bcrypt.compare(
          data.password,
          user.passwordHash || ""
        );
        if (!valid)
          return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          );
      }
    } else if (data.hederaAccountId) {
      user = await User.findOne({ hederaAccountId: data.hederaAccountId });
      if (!user) {
        user = await User.create({
          username: `wallet_${data.hederaAccountId.replace(/\./g, "_")}`,
          hederaAccountId: data.hederaAccountId,
          isKYCVerified: false,
        });
      }
    } else {
      return NextResponse.json(
        { error: "Provide username or hederaAccountId" },
        { status: 400 }
      );
    }
    const token = signJwt({ sub: user!.id, username: user!.username });
    return NextResponse.json({
      token,
      user: {
        id: user!.id,
        username: user!.username,
        isKYCVerified: user!.isKYCVerified,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 400 }
    );
  }
}

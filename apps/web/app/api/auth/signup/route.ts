import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signJwt } from "@/app/../lib/api/auth";
import { dbConnect } from "@/app/../lib/db";
import { User } from "@/app/../models/User";
import { createDIDIdentifier } from "@/lib/hedera/did";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().min(6),
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
    const existing = await User.findOne({ username: data.username });
    if (existing)
      return NextResponse.json({ error: "Username exists" }, { status: 409 });
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create DID identifier if Hedera account ID is provided
    let did: string | undefined;
    if (data.hederaAccountId) {
      did = createDIDIdentifier(data.hederaAccountId);
    }

    const user = await User.create({
      username: data.username,
      email: data.email,
      passwordHash,
      hederaAccountId: data.hederaAccountId,
      did: did,
      isKYCVerified: false,
    });
    const token = signJwt({ sub: user.id, username: user.username });
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          isKYCVerified: user.isKYCVerified,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Signup failed" },
      { status: 400 }
    );
  }
}

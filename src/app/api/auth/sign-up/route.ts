import { TOKEN_AGE } from "@/config";
import db from "@/db/postgres";
import { auth, users } from "@/db/postgres/schema";
import { getToken } from "@/lib/utils";
import { signUpSchema, userResponseSchema } from "@/lib/zod/auth-schemas";
import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { data, success } = signUpSchema.safeParse(body);

    if (!success) return new NextResponse(null, { status: 400, statusText: "Invalid SignUp Data." });

    const { email, name, password } = data;

    const [userExist] = await db
      .select()
      .from(auth)
      .where(and(eq(auth.email, email), eq(auth.authType, "email")));

    if (userExist)
      return new NextResponse(null, { status: 409, statusText: `User already exists with email ${email}` });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await db.transaction(async (tx) => {
      const [user] = await db.insert(users).values({ email, name }).returning();
      await db.insert(auth).values({ userId: user.id, authType: "email", email, hashedPass });
      return user;
    });

    const response = new NextResponse(JSON.stringify(userResponseSchema.parse(user)), {
      status: 201,
      statusText: "Successfully signed up user.",
    });
    response.cookies.set("token", getToken(user), {
      maxAge: TOKEN_AGE,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    });
    return response;
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
      statusText: error instanceof Error ? error.message : "Something went wrong!",
    });
  }
};

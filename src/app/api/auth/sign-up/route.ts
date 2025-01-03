import db from "@/db/postgres";
import { getAuthCookie } from "@/lib/jose";
import { signUpSchema } from "@/lib/zod/auth-schemas";
import { createAuth, createUser, getUserData } from "@/services/auth";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { data, success } = signUpSchema.safeParse(body);

    if (!success) return NextResponse.json({ message: "Invalid SignUp Data." }, { status: 400 });

    const { email, name, password } = data;

    const userExist = await getUserData(email);

    if (userExist) return NextResponse.json({ message: `User already exists with email ${email}` }, { status: 409 });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await db.transaction(async () => {
      const user = await createUser({ email, name });
      await createAuth({ userId: user.id, authType: "email", email, hashedPass });
      return user;
    });

    const response = NextResponse.json({ message: "Successfully signed in." }, { status: 200 });
    const { token, options } = await getAuthCookie(user);
    response.cookies.set("token", token, options);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong!" },
      { status: 500 }
    );
  }
};

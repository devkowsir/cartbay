import { signToken, validateToken } from "@/lib/jose";
import { sendMail } from "@/lib/nodemailer";
import { resetPasswordSchema } from "@/lib/zod/auth-schemas";
import { getUserData, setResetPasswordCode, updatePassword } from "@/services/auth";
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const email = new URL(req.url).searchParams.get("email");

    if (!email) return NextResponse.json({ message: "Email is required." }, { status: 400 });

    const user = await getUserData(email);

    if (!user)
      return NextResponse.json(
        { message: `User not found with email '${email}' for password reset.` },
        { status: 400 }
      );

    const code = await signToken({ authId: user.authId }, 5 * 60);
    const resetLink = `${new URL(req.url).origin}/reset-password?code=${code}`;

    await setResetPasswordCode(user.authId, code);

    const response = await sendMail(
      email,
      "Reset Password.",
      `<div>
        <p style="margin-bottom: 1rem">If you have requested to reset password follow the link below, otherwise ignore.</p>
        <p style="margin-bottom: 1rem">The link will expire within 5 miniutes.</p>
        <p><a href="${resetLink}" style="font-size: 1.25rem; text-align: center; color: #2841a4;">Reset password</a></p>
      </div>`
    );
    return NextResponse.json({ message: response }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong!" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { success, data } = resetPasswordSchema.safeParse(body);
    if (!success) return NextResponse.json({ message: "Invalid data." }, { status: 400 });

    const payload = await validateToken<{ authId: string }>(data.code);
    if (payload == null)
      return NextResponse.json({ message: "Invalid token. Please retry within 1h." }, { status: 400 });

    const hashedPass = await hash(data.newPassword, 10);

    await updatePassword(payload.authId, hashedPass);

    return NextResponse.json({ message: "Password has been updated." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong!" },
      { status: 500 }
    );
  }
};

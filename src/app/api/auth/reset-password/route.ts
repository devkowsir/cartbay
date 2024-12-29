import { signToken, validateToken } from "@/lib/jose";
import { sendMail } from "@/lib/nodemailer";
import { resetPasswordSchema } from "@/lib/zod/auth-schemas";
import { getUserData, setResetPasswordCode, updatePassword } from "@/services/auth";
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const email = new URL(req.url).searchParams.get("email");

    if (!email) return new NextResponse(null, { status: 400, statusText: "Email is required." });

    const user = await getUserData(email);

    if (!user)
      return new NextResponse(null, {
        status: 400,
        statusText: `User not found with email '${email}' for password reset.`,
      });

    const code = await signToken({ authId: user.authId }, 60 * 60);
    const resetLink = `${new URL(req.url).origin}/reset-password?code=${code}`;

    await setResetPasswordCode(user.authId, code);

    const response = await sendMail(
      email,
      "Reset Password.",
      `<div>
        <p style="margin-bottom: 1rem">If you have requested to reset password follow the link below, otherwise ignore.</p>
        <p><a href="${resetLink}" style="font-size: 1.25rem; text-align: center; color: #2841a4;">Reset password</a></p>
      </div>`
    );
    return new NextResponse(null, { status: 200, statusText: response });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
      statusText: error instanceof Error ? error.message : "Something went wrong!",
    });
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { success, data } = resetPasswordSchema.safeParse(body);
    if (!success) return new NextResponse(null, { status: 400, statusText: "Invalid data." });

    const payload = await validateToken<{ authId: string }>(data.code);
    if (payload == null)
      return new NextResponse(null, { status: 400, statusText: "Invalid token. Please retry within 1h." });

    const hashedPass = await hash(data.newPassword, 10);

    await updatePassword(payload.authId, hashedPass);

    return new NextResponse(null, { status: 200, statusText: "Password has been updated." });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
      statusText: error instanceof Error ? error.message : "Something went wrong!",
    });
  }
};

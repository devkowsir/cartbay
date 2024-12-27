import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  secure: process.env.NODE_ENV == "production",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async (reciever: string, subject: string, html: string) => {
  const { response } = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: reciever,
    subject,
    html,
  });
  return response;
};

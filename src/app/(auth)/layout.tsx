import { Toaster } from "@/components/ui/toaster";
import UrlMessages from "@/components/url-messages";
import { type Metadata } from "next";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import { ReactNode } from "react";

import "../globals.css";

const fontMontserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CartBay",
  description: "Connecting Customers and Sellers—Securely, Seamlessly, Successfully!",
  icons: ["/images/logo-sm.png", "/images/logo-md.png"],
};

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html className={`${fontMontserrat.className}`} lang="en">
      <body className="h-dvh">
        <div className="h-full flex justify-center items-center">
          <div className="w-1/2 h-full hidden md:flex items-center bg-primary/10">
            <div className="relative w-full h-full">
              <Image src={"/images/authentication.svg"} alt="Secure Authentication" fill />
            </div>
          </div>
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center gap-2 bg-primary/10 md:bg-transparent">
            <div className="w-80">
              <div className="mb-8 flex gap-2">
                <Image src={"/images/logo-lg.png"} alt="Cartbay Logo" width={32} height={32} />
                <span className="font-bold text-primary text-lg">CartBay</span>
              </div>
              {children}
            </div>
          </div>
        </div>
        <Toaster />
        <UrlMessages />
      </body>
    </html>
  );
};

export default AuthLayout;

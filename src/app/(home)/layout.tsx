import { Toaster } from "@/components/ui/toaster";
import UrlMessages from "@/components/url-messages";
import { type Metadata } from "next";
import { Montserrat } from "next/font/google";

import "../globals.css";

const fontMonstserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CartBay",
  description: "Connecting Customers and Sellers—Securely, Seamlessly, Successfully!",
  icons: ["/images/logo-sm.png", "/images/logo-md.png"],
};

function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontMonstserrat.className}`}>
        {children}
        <Toaster />
        <UrlMessages />
      </body>
    </html>
  );
}

export default HomeLayout;

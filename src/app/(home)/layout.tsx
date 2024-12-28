import { Montserrat } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import UrlMessages from "@/components/url-messages";
import "../globals.css";

const fontMonstserrat = Montserrat({ subsets: ["latin"] });

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

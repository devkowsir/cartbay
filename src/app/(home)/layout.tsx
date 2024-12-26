import { Montserrat } from "next/font/google";

import "../globals.css";

const fontMonstserrat = Montserrat({ subsets: ["latin"] });

function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontMonstserrat.className}`}>{children}</body>
    </html>
  );
}

export default HomeLayout;

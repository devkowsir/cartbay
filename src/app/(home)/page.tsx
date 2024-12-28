import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CartBay",
  description: "Connecting Customers and Sellers—Securely, Seamlessly, Successfully!",
  icons: ["/images/logo-sm.png", "/images/logo-md.png"],
};

async function Page() {
  return <div>Welcome to Cartbay</div>;
}

export default Page;

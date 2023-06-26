import NavBar from "@/components/NavBar";
import Provider from "@/components/Provider";
import getBreweries from "@/lib/getBreweries";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beer Flow",
  description: "Generated by create next app",
};
// Segment-level Caching. Revalidate data every 60 seconds app wide
export const revalidate = 86400; // 1 day

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breweries = await getBreweries();
  // const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <Provider>
        <body className={inter.className}>
          {/* @ts-expect-error Server Component */}
          <NavBar breweries={breweries} />
          {/* <Chat /> */}
          {children}
        </body>
      </Provider>
    </html>
  );
}

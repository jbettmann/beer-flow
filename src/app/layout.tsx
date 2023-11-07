import NavBar from "@/components/NavBar";
import Provider from "@/components/Provider";
import getBreweries from "@/lib/getBreweries";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { authOptions } from "./api/auth/[...nextauth]/route";
import localFont from "next/font/local";

const myFont = localFont({
  src: [
    { path: "../assets/fonts/SF-Pro.ttf", weight: "normal", style: "normal" },
    { path: "../assets/fonts/SF-Pro.ttf", weight: "bold", style: "bold" },
    { path: "../assets/fonts/SF-Pro.ttf", weight: "normal", style: "italic" },
  ],
  display: "swap",
  variable: "--font-sf-pro",
});
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brett",
  description: "Keep your brewery up-to-date.",
};
// Segment-level Caching. Revalidate data every 60 seconds app wide
export const revalidate = 86400; // 1 day

export default async function Layout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const breweries = await getBreweries();
  const session = await getServerSession(authOptions);

  return (
    <html lang="en ">
      <Provider>
        <body className={`${myFont.variable} ${inter.className}`}>
          {session && <NavBar breweries={breweries} user={session.user} />}

          {/* <Chat /> */}
          {props.children}
          {props.modal}
        </body>
      </Provider>
    </html>
  );
}

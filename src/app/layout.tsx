import Provider from "@/components/Provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
const myFont = localFont({
  src: [
    { path: "../assets/fonts/SF-Pro.ttf", weight: "normal", style: "normal" },
    { path: "../assets/fonts/SF-Pro.ttf", weight: "bold", style: "bold" },
    { path: "../assets/fonts/SF-Pro.ttf", weight: "normal", style: "italic" },
  ],
  display: "swap",
  variable: "--font-sf-pro",
});

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

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          `${myFont.variable} ${inter.className}`
        )}
      >
        <Provider>
          <SidebarProvider>
            {/* <Chat /> */}
            {props.children}
            {props.modal}
          </SidebarProvider>
        </Provider>
      </body>
    </html>
  );
}

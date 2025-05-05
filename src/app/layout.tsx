import Provider from "@/components/Provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
const myFont = localFont({
  src: [
    { path: "../assets/fonts/SF-Pro.ttf", weight: "normal", style: "normal" },
    { path: "../assets/fonts/SF-Pro.ttf", weight: "bold", style: "bold" },
    { path: "../assets/fonts/SF-Pro.ttf", weight: "normal", style: "italic" },
  ],
  display: "swap",
  variable: "--font-sf-pro",
});

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};
export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background overflow-hidden",
          `${myFont.variable} ${inter.className}`
        )}
      >
        <Provider>
          <SidebarProvider>
            {/* <Chat /> */}
            {props.children}
            {props.modal}
            <Toaster />
          </SidebarProvider>
        </Provider>
      </body>
    </html>
  );
}

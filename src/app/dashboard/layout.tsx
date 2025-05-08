import { auth } from "@/auth";
import Header from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import getBreweries from "@/lib/getBreweries";
import { revalidatePath } from "next/cache";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();
  const breweries = (await getBreweries()) || [];

  return (
    <div className="flex w-full">
      <AppSidebar breweries={breweries} user={session?.user} />
      <SidebarInset>
        <Header />
        {/* page main content */}
        {children}
        {modal}
        {/* page main content ends */}
      </SidebarInset>
    </div>
  );
}

import { auth } from "@/auth";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import getBreweries from "@/lib/getBreweries";
import { revalidatePath } from "next/cache";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const breweries = (await getBreweries()) || [];
  const session = await auth();
  return (
    <div className="flex w-full">
      <AppSidebar breweries={breweries} user={session} />
      <SidebarTrigger />

      {/* <Sidebar /> */}
      <main className="w-full flex-1 overflow-hidden">
        {children}
        {modal}
      </main>
    </div>
  );
}

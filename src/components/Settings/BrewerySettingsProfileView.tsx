"use client";

import AlertDialog from "@/components/Alerts/AlertDialog";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import EditBreweryProfile from "@/components/Settings/EditBreweryProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getBreweryMemberId, getBreweryMemberIds } from "@/lib/brewery-members";
import deleteBrewery from "@/lib/DELETE/deleteBrewery";
import removeBreweryFromUser from "@/lib/DELETE/removeBreweryFromUser";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { getInitials } from "@/lib/utils";
import { Users } from "@/types/users";
import { ArrowLeft, Pencil, Trash2, UsersRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export default function BrewerySettingsProfileView({ breweryId }: { breweryId: string }) {
  const { data: session, update } = useSession();
  const { data: brewery, error, isLoading, mutate } = useSWR([`https://beer-bible-api.vercel.app/breweries/${breweryId}`], getSingleBrewery);
  const [editOpen, setEditOpen] = useState(false);
  const [editPresentation, setEditPresentation] = useState<"dialog" | "drawer">("dialog");
  const [confirmAction, setConfirmAction] = useState<"delete" | "remove" | null>(null);
  const [acting, setActing] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { addToast } = useToast();
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();

  if (isLoading) return <div className="space-y-4" aria-label="Loading brewery settings"><Skeleton className="h-10 w-44" /><Skeleton className="h-64 w-full rounded-xl" /><Skeleton className="h-36 w-full rounded-xl" /></div>;
  if (error) return <Card><CardHeader><CardTitle>Couldn’t load brewery</CardTitle><CardDescription>Check your connection and try again.</CardDescription></CardHeader><CardContent><Button type="button" onClick={() => mutate()}>Try again</Button></CardContent></Card>;
  if (!brewery?._id) return <Card><CardHeader><CardTitle>Brewery not found</CardTitle><CardDescription>This brewery may have been removed or you may no longer have access.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link href="/settings/breweries">Back to breweries</Link></Button></CardContent></Card>;

  const ownerId = getBreweryMemberId(brewery.owner);
  const owner = ownerId === session?.user.id;
  const admin = getBreweryMemberIds(brewery.admin).includes(session?.user.id ?? "");
  const ownerName = typeof brewery.owner === "object" ? (brewery.owner as Users).fullName : "Brewery owner";
  const staffCount = (brewery.staff?.length ?? 0) + 1;

  const handleAction = async () => {
    if (!confirmAction || acting) return;
    setActing(true);
    try {
      const result = confirmAction === "delete"
        ? await deleteBrewery({ breweryId, accessToken: session?.user.accessToken })
        : await removeBreweryFromUser({ breweryId, userId: session?.user.id, accessToken: session?.user.accessToken });
      await update({ removeBreweryId: breweryId });
      if (selectedBrewery?._id === breweryId) {
        setSelectedBrewery(null as any);
        localStorage.removeItem("selectedBreweryId");
        window.dispatchEvent(new CustomEvent("selectedBreweryChanged"));
      }
      addToast(result?.message ?? (confirmAction === "delete" ? "Brewery deleted" : "Access removed"), "success");
      router.replace("/settings/breweries");
      router.refresh();
    } catch (actionError) {
      addToast(actionError instanceof Error ? actionError.message : "Unable to complete that action.", "error");
    } finally { setActing(false); setConfirmAction(null); }
  };

  const editForm = <EditBreweryProfile brewery={brewery} onClose={() => setEditOpen(false)} />;

  return <div className="space-y-5">
    <Button asChild variant="ghost" className="-ml-3"><Link href="/settings/breweries"><ArrowLeft className="size-4" />All breweries</Link></Button>
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-5 text-center sm:flex-row sm:text-left">
        {brewery.image ? <ImageDisplay item={brewery} className="size-24 rounded-full object-cover" /> : <div className="flex size-24 items-center justify-center rounded-full bg-muted text-2xl font-semibold">{getInitials(brewery.companyName)}</div>}
        <div className="min-w-0 flex-1"><h1 className="truncate text-2xl font-semibold">{brewery.companyName}</h1><div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start"><Badge variant="secondary">Owner: {owner ? "You" : ownerName}</Badge><Badge variant="outline">{owner ? "Owner" : admin ? "Admin" : "Crew"}</Badge></div></div>
        {owner && <Button type="button" variant="outline" onClick={() => { setEditPresentation(isMobile ? "drawer" : "dialog"); setEditOpen(true); }}><Pencil className="size-4" />Edit profile</Button>}
      </CardContent>
    </Card>
    <Card><CardHeader><CardTitle>People</CardTitle><CardDescription>View the people with access to this brewery.</CardDescription></CardHeader><CardContent>{owner || admin ? <Button asChild variant="outline"><Link href={`/dashboard/breweries/${breweryId}/staff`}><UsersRound className="size-4" />{staffCount} staff {staffCount === 1 ? "member" : "members"}</Link></Button> : <Badge variant="outline"><UsersRound className="mr-1 size-3" />{staffCount} staff {staffCount === 1 ? "member" : "members"}</Badge>}</CardContent></Card>
    <Card className="border-destructive/30"><CardHeader><CardTitle>Danger zone</CardTitle><CardDescription>{owner ? "Deleting a brewery permanently removes all of its data." : "Remove this brewery from your account."}</CardDescription></CardHeader><CardContent><Button type="button" variant="destructive" onClick={() => setConfirmAction(owner ? "delete" : "remove")}><Trash2 className="size-4" />{owner ? "Delete brewery" : "Remove access"}</Button></CardContent></Card>
    <AlertDialog title={owner ? "Delete brewery?" : "Remove access?"} isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleAction} message={owner ? `This permanently deletes ${brewery.companyName} and all of its data.` : `You will no longer be able to access ${brewery.companyName}.`} confirmButtonText={acting ? "Working…" : owner ? "Delete brewery" : "Remove access"} />
    {editPresentation === "drawer" ? <Drawer open={editOpen} onOpenChange={setEditOpen} dismissible={false}><DrawerContent className="max-h-[calc(100dvh-env(safe-area-inset-top))]"><DrawerHeader className="text-left"><DrawerTitle>Edit brewery profile</DrawerTitle><DrawerDescription>Update the name or logo.</DrawerDescription></DrawerHeader><div className="overflow-y-auto px-4 pb-4">{editForm}</div></DrawerContent></Drawer> : <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent onInteractOutside={(event) => event.preventDefault()}><DialogHeader><DialogTitle>Edit brewery profile</DialogTitle><DialogDescription>Update the name or logo.</DialogDescription></DialogHeader>{editForm}</DialogContent></Dialog>}
  </div>;
}

"use client";

import CreateBreweryForm from "@/components/CreateBreweryForm";
import SetBreweryIdStorage from "@/components/Buttons/SetBreweryIdStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Brewery } from "@/types/brewery";
import { Building2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Breweries({ breweries }: { breweries: Brewery[] }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState<"dialog" | "drawer">("dialog");
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("credentialsLogin")) {
      sessionStorage.removeItem("credentialsLogin");
      router.refresh();
    }
  }, [router]);

  const form = <CreateBreweryForm onClose={() => setOpen(false)} />;
  const openCreate = () => {
    setPresentation(isMobile ? "drawer" : "dialog");
    setOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Breweries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Open a brewery workspace or create a new one.</p>
        </div>
        <Button type="button" onClick={openCreate} className="w-full sm:w-auto"><Plus className="size-4" />Add brewery</Button>
      </header>

      {breweries.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {breweries.map((brewery) => (
            <Card key={brewery._id} className="py-0 transition-colors hover:border-primary/40">
              <CardContent className="p-5 [&_a]:min-h-20 [&_a]:justify-start [&_a]:text-left">
                <SetBreweryIdStorage brewery={brewery} href={`/dashboard/breweries/${brewery._id}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center px-5 py-10 text-center">
            <span className="mb-4 rounded-full bg-muted p-3"><Building2 className="size-6 text-muted-foreground" /></span>
            <h2 className="font-semibold">No breweries yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create your first brewery to manage beers, categories, and staff.</p>
            <Button type="button" onClick={openCreate} className="mt-5"><Plus className="size-4" />Create brewery</Button>
          </CardContent>
        </Card>
      )}

      {presentation === "drawer" ? (
        <Drawer open={open} onOpenChange={setOpen} dismissible={false}>
          <DrawerContent className="max-h-[calc(100dvh-env(safe-area-inset-top))]">
            <DrawerHeader className="text-left"><DrawerTitle>Add brewery</DrawerTitle><DrawerDescription>Create a workspace for your brewery.</DrawerDescription></DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">{form}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={(next) => { if (!next) setOpen(false); }}>
          <DialogContent onInteractOutside={(event) => event.preventDefault()}>
            <DialogHeader><DialogTitle>Add brewery</DialogTitle><DialogDescription>Create a workspace for your brewery.</DialogDescription></DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

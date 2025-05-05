"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Beer } from "@/types/beer";
import { ReactNode, useState } from "react";
import BeerCard from "../cards/beer-card";

interface BeerViewDialogProps {
  beer: Beer;
  children?: ReactNode | string;
}

export function BeerDialogWrapper({ beer, children }: BeerViewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full sm:max-w-xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{beer.name}</DialogTitle>
        </DialogHeader>
        <BeerCard
          beer={beer}
          cardClassName={"border-none h-full w-full bg-background"}
        />
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

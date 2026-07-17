"use client";

import { ChevronsUpDown, Factory } from "lucide-react";

import { Brewery } from "@/types/brewery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useBreweryContext } from "@/context/brewery-beer";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import ImageDisplay from "../ImageDisplay/ImageDisplay";

export function BrewerySwitcher({ breweries }: { breweries: Brewery[] }) {
  const { isMobile } = useSidebar();
  const { selectedBrewery, selectBrewery } = useBreweryContext();
  const hasBreweries = breweries.length > 0;
  const hasSelectedBrewery = Boolean(selectedBrewery?._id);

  const handleBreweryClick = async (brewery: Brewery) => {
    await selectBrewery(brewery);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                {hasSelectedBrewery && selectedBrewery?.image ? (
                  <ImageDisplay item={selectedBrewery} className="h-6" />
                ) : hasSelectedBrewery ? (
                  selectedBrewery?.companyName && (
                    <div className="logo__default  text-base!">
                      {getInitials(selectedBrewery?.companyName as string)}
                    </div>
                  )
                ) : (
                  <Factory className="size-4 text-sidebar-foreground" />
                )}
              </div>

              <span className="truncate font-semibold text-sm">
                {hasSelectedBrewery
                  ? selectedBrewery?.companyName
                  : hasBreweries
                    ? "Select a brewery"
                    : "No breweries yet"}
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={"bottom"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {hasBreweries ? "Breweries" : "No breweries yet"}
            </DropdownMenuLabel>
            {!hasBreweries ? (
              <DropdownMenuItem asChild className="gap-2 p-2">
                <Link
                  href="/dashboard/breweries"
                  className="flex flex-row items-center gap-2 text-left"
                >
                  <Factory className="size-4" />
                  Create or manage breweries
                </Link>
              </DropdownMenuItem>
            ) : (
              breweries.map((brewery, index) => (
                <DropdownMenuItem
                  key={brewery.companyName + index}
                  onClick={() => handleBreweryClick(brewery)}
                  className="gap-2 p-2"
                >
                  <div className="flex flex-row items-center text-left gap-4">
                    <div className="flex size-6 items-center justify-center rounded-sm ">
                      {brewery?.image ? (
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                          <ImageDisplay
                            item={brewery}
                            className="logo w-6! h-6!"
                          />
                        </div>
                      ) : (
                        brewery?.companyName && (
                          <div className="logo__default  text-base!">
                            {getInitials(brewery?.companyName as string)}
                          </div>
                        )
                      )}
                    </div>
                    {brewery.companyName}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

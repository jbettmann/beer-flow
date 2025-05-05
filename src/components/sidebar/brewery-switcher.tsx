"use client";

import { ChevronsUpDown } from "lucide-react";

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
import { useEffect } from "react";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { useSession } from "next-auth/react";

export function BrewerySwitcher({ breweries }: { breweries: Brewery[] }) {
  const { isMobile } = useSidebar();
  const { update } = useSession();
  const { selectedBrewery } = useBreweryContext();

  const handleBreweryClick = async (brewery: Brewery) => {
    await update({ selectedBreweryId: brewery._id });
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                  {selectedBrewery?.image ? (
                    <ImageDisplay item={selectedBrewery} className="h-6" />
                  ) : (
                    selectedBrewery?.companyName && (
                      <div className="logo__default  !text-base">
                        {getInitials(selectedBrewery?.companyName as string)}
                      </div>
                    )
                  )}
                </div>

                <span className="truncate font-semibold">
                  {selectedBrewery?.companyName}
                </span>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Breweries
              </DropdownMenuLabel>
              {breweries.map((brewery, index) => (
                <DropdownMenuItem
                  key={brewery.companyName + index}
                  onClick={() => handleBreweryClick(brewery)}
                  className="gap-2 p-2"
                >
                  <Link
                    href={`/dashboard/breweries/${brewery._id}/beers`}
                    key={brewery._id}
                    className="flex flex-row items-center text-left gap-4"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm ">
                      {brewery?.image ? (
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                          <ImageDisplay
                            item={brewery}
                            className="logo !w-6 !h-6"
                          />
                        </div>
                      ) : (
                        brewery?.companyName && (
                          <div className="logo__default  !text-base">
                            {getInitials(brewery?.companyName as string)}
                          </div>
                        )
                      )}
                    </div>
                    {brewery.companyName}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

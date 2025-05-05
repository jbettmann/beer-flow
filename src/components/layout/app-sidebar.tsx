"use client";

import * as React from "react";

import { BrewerySwitcher } from "@/components/sidebar/brewery-switcher";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";

import { Brewery } from "@/types/brewery";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useBreweryContext } from "@/context/brewery-beer";
import { useMemo } from "react";

// This is sample data.

export function AppSidebar({
  breweries,
  user,
  ...props
}: {
  breweries: Brewery[];
  user: any;
} & React.ComponentProps<typeof Sidebar>) {
  const { selectedBrewery } = useBreweryContext();

  const navItems = useMemo(() => {
    const data = {
      nonAuthNav: [
        {
          title: "Dashboard",
          url: `/dashboard/overview`,
          icon: "dashboard",
          isActive: true,
        },
      ],
      authNav: [
        {
          title: "Beers",
          url: `/dashboard/breweries/${selectedBrewery?._id}/beers`,
          icon: "beer",
        },
        {
          title: "Staff",
          url: `/dashboard/breweries/${selectedBrewery?._id}/staff`,
          icon: "users",
        },
      ],
      navGenerals: [
        {
          title: "Help",
          url: "/help",
          icon: "help",
          items: [
            {
              title: "FAQ",
              url: "#",
            },
          ],
        },
        {
          title: "Settings",
          url: "/settings",
          icon: "settings",
          items: [
            {
              title: "General",
              url: "#",
            },
            {
              title: "Breweries",
              url: "/settings/breweries",
            },
            {
              title: "Billing",
              url: "#",
            },
            {
              title: "Limits",
              url: "#",
            },
          ],
        },
      ],
    };
    return data;
  }, [selectedBrewery]);

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <BrewerySwitcher breweries={breweries} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navItems.nonAuthNav} />
          <SidebarSeparator />
          <NavMain items={navItems.authNav} />
          {/* <NavProjects projects={navItems.projects} /> */}
          <div className="mt-auto">
            <NavMain items={navItems.navGenerals} />
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

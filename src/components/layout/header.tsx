"use client";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";

import { SearchIcon } from "lucide-react";
import SearchModal from "../Alerts/SearchModal";
import SideDrawer from "../Drawers/SideDrawer";
import { Search } from "../Search/Search";
import ThemeToggle from "./ThemeToggle/theme-toggle";

export default function Header() {
  const { isMobile } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {isMobile ? (
        <SideDrawer isOpen={isSearchOpen}>
          <Search isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
        </SideDrawer>
      ) : (
        <SearchModal isOpen={isSearchOpen}>
          <Search isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
        </SearchModal>
      )}
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {/* <Breadcrumbs /> */}
      </div>

      <div className="flex items-center gap-4 px-4">
        <SearchIcon
          size={22}
          strokeWidth={1}
          className="hover:cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        />

        <ThemeToggle />
      </div>
    </header>
  );
}

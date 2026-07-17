"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBreweryContext } from "@/context/brewery-beer";
import { getBreweryMemberId } from "@/lib/brewery-members";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import StaffTable from "./staff-table";
import StaffInviteDialog from "./staff-invite-dialog";
import { UserPlus } from "lucide-react";
import { Users } from "@/types/users";

type Props = {};

const StaffContainer = (props: Props) => {
  const { selectedBrewery, isAdmin, mutateBrewery } = useBreweryContext();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const numberOfStaff = useMemo(() => {
    if (!selectedBrewery) {
      return 0;
    }

    const memberIds = new Set<string>();
    const addPopulatedMemberIds = (group: Array<string | number | Users>) => {
      for (const member of group) {
        if (member && typeof member === "object") {
          const memberId = getBreweryMemberId(member);

          if (memberId) {
            memberIds.add(memberId);
          }
        }
      }
    };

    addPopulatedMemberIds(
      selectedBrewery.staff as Array<string | number | Users>,
    );
    addPopulatedMemberIds(
      selectedBrewery.admin as Array<string | number | Users>,
    );

    const ownerId = getBreweryMemberId(selectedBrewery.owner);
    if (ownerId) {
      memberIds.add(ownerId);
    }

    return memberIds.size;
  }, [selectedBrewery]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Staff</h2>
          <Badge
            variant="secondary"
            className="rounded-full border border-border"
          >
            {numberOfStaff}
          </Badge>
        </div>
        {isAdmin && selectedBrewery ? (
          <Button type="button" onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite staff
          </Button>
        ) : null}
      </div>

      <Separator />
      {isAdmin ? (
        <StaffTable />
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
          <h3 className="text-base font-semibold">
            Admin authorization required
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Only brewery admins can access staff management for{" "}
            {selectedBrewery?.companyName || "this brewery"}.
          </p>
        </div>
      )}

      {selectedBrewery ? (
        <StaffInviteDialog
          breweryId={selectedBrewery._id}
          breweryName={selectedBrewery.companyName}
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          onInvitesSent={mutateBrewery}
        />
      ) : null}
    </div>
  );
};

export default StaffContainer;

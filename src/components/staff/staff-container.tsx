"use client";
import React, { use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreweryContext } from "@/context/brewery-beer";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import StaffTable from "./staff-table";

type Props = {};

const StaffContainer = (props: Props) => {
  const { selectedBrewery, isAdmin } = useBreweryContext();
  const numberOfStaff = selectedBrewery?.staff.length || 0;
  return (
    // <div>

    // </div>
    <Tabs defaultValue="staff" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="staff">
          Staff
          <Badge
            variant={"secondary"}
            className="rounded-full ml-1 border border-border"
          >
            {numberOfStaff}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="invitations">
          Invitations{" "}
          <Badge
            variant={"secondary"}
            className="rounded-full ml-1 border border-border"
          >
            0
          </Badge>
        </TabsTrigger>
      </TabsList>
      <Separator className="-mt-2.25 mb-4" />
      <div className="ml-auto">
        <Button>Invite</Button>
      </div>

      <TabsContent value="staff">
        <StaffTable />
        {/* <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card> */}
      </TabsContent>
      <TabsContent value="invitations">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default StaffContainer;

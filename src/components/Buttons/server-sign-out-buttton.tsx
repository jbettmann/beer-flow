"use client";
import React from "react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

type Props = {
  title?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
};

const ServerSignOutButton = ({
  title = "Sign Out",
  variant = "default",
  ...props
}: Props) => {
  return (
    <Button onClick={() => signOut()} variant={variant} {...props}>
      {title}
    </Button>
  );
};

export default ServerSignOutButton;

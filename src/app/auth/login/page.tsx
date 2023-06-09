"use client";

import { signIn, useSession } from "next-auth/react";
import TextareaAutosize from "react-textarea-autosize";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

type Props = {};

const LoginPage = () => {
  const { data: session } = useSession();

  const onSignIn = async () => {
    const result = await signIn(undefined, {
      redirect: true,
      callbackUrl: "/",
    });
  };

  if (session) redirect("/");

  return (
    <div>
      <h1>Beer Flow</h1>
      <p>Get beer info from the brewery to your staff, in one easy flow</p>
      <button onClick={onSignIn}>Login</button>
    </div>
  );
};

export default LoginPage;

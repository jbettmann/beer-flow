import BackArrow from "@/components/Buttons/BackArrow";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);
  return (
    <div className="lg:w-10/12 mx-auto">
      {!session && (
        <div className=" mx-auto flex justify-between text-primary absolute top-0 left-0 right-0 p-4 md:px-10 lg:px-12 2xl:px-32 ">
          <Link href={"/"}>
            <h1 className="text-primary font-medium xxs:px-4">Brett</h1>
          </Link>
          <div className="flex gap-1 xxs:gap-3 xxs:px-4 ">
            <Link
              href="/auth/login"
              className=" flex w-28 text-primary text-md justify-center items-center"
            >
              Log In
            </Link>
            <Link
              href="/auth/create/account"
              className=" flex justify-center items-center w-full rounded-full bg-accent hover:shadow-xl transition-all ease-in-out text-sm  text-primary shadow-sm font-medium hover:bg-[#68cdc0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
      {/* @ts-expect-error Server component */}
      <BackArrow />
      {children}
    </div>
  );
};

export default layout;

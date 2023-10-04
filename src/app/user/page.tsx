import { Metadata } from "next";
import { Users } from "@/app/types/users";
// import { PageProps } from "../../../.next/types/app/layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import fetchAllUsers from "@/lib/getAllUsers";
import Link from "next/link";
import BackArrow from "@/components/Buttons/BackArrow";
export const metadata: Metadata = {
  title: "Users",
  description: "Users of Beer Flow",
};

// Server Component Example ***************************

const UserPage = async () => {
  const userData: Promise<Users[]> = fetchAllUsers();

  const users = await userData;

  console.log(users);

  const content = (
    <section>
      <Link href="/">
        {/* @ts-expect-error Server component */}
        <BackArrow />
      </Link>

      <br />
      {users.map((user) => {
        return (
          <>
            <p key={user._id}>
              <Link href={`/user/${user.email}`}>{user.fullName}</Link>
            </p>
          </>
        );
      })}
    </section>
  );

  return content;
};

export default UserPage;

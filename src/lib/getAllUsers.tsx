import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users } from "@/types/users";

import { Session, getServerSession } from "next-auth";
import { Dispatch, SetStateAction } from "react";

//  Fetch all users
export default async function fetchAllUsers() {
  const session = await auth();

  // session: Session,
  // setUsers: Dispatch<SetStateAction<User[]>>
  const res = await fetch("https://beer-bible-api.vercel.app/users", {
    method: "GET",
    headers: {
      authorization: `bearer ${session?.user.accessToken}`,
    },
  });
  const data = await res.json();

  return data;

  // setUsers(data);
}

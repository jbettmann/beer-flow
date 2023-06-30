import { Metadata } from "next";
import { Users } from "@/app/types/users";
// import { PageProps } from "../../../.next/types/app/layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import getAllBreweries from "@/lib/getAllBreweries";
import Link from "next/link";
import { Brewery } from "../types/brewery";

// export async function generateMetadata({
//   params,
// }: PageProps): Promise<Metadata> {
//   // const res = await fetch(`https://beer-bible-api.vercel.app/users/`);
//   const data = (await res.json()) as Users;
//   console.log(data);

//   return { title: data.username };
// }

// export async function generateStaticParams() {
//   const brewery = ["brewery-1", "brewery-2"];

//   return brewery.map((brew) => {
//     return {
//       breweryId: brew,
//     };
//   });
// }

const Page = async () => {
  const breweryData: Promise<Brewery[]> = getAllBreweries();

  const breweries = await breweryData;

  const content = (
    <section>
      <h2>
        <Link href="/">Back Home</Link>
      </h2>
      <br />
      {breweries.map((brewery) => {
        return (
          <>
            <p key={brewery._id}>
              <Link href={`/breweries/${brewery._id}`}>
                {brewery.companyName}
              </Link>
            </p>
          </>
        );
      })}
    </section>
  );

  return content;
};
// console.log(getAllBreweries());
// const { data: session, update } = useSession();

// const [users, setUsers] = useState(null);

// const fetchUsers = async () => {
//   const res = await axios.get("https://beer-bible-api.vercel.app/users", {
//     headers: {
//       authorization: `bearer ${session?.user.accessToken}`,
//     },
//   });
//   const data = await res.data;

//   setUsers(data);
// };

// const deleteUsers = async (userId: string) => {
//   const res = await axios.delete(
//     `https://beer-bible-api.vercel.app/users/${userId}`,
//     {
//       headers: {
//         authorization: `bearer ${session?.user.accessToken}`,
//       },
//     }
//   );
//   const data = await res.data;

//   console.log(data);
// };
// console.log({ session, users });

// useEffect(() => {
//   fetchUsers();
// }, []);

// return (
//   <div>
//     {/* {users ? (
//       users.map((user) => <p key={user._id}>{user.email}</p>)
//     ) : (
//       <p>No Good </p>
//     )} */}
//   </div>
// );

export default Page;

// import { PageProps } from "../../../.next/types/app/layout";
import getAllBreweries from "@/lib/getAllBreweries";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Brewery } from "../types/brewery";
import getBreweries from "@/lib/getBreweries";
import { redirect } from "next/dist/server/api-utils";
import BackArrow from "@/components/Buttons/BackArrow";
import SetBreweryIdStorage from "@/components/Buttons/SetBreweryIdStorage";

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

const BreweriesPage = async () => {
  const breweryData: Promise<Brewery[]> = getBreweries();
  const breweries = await breweryData;

  return (
    <section className="w-full">
      <h2>
        <Link href="/">
          <BackArrow width={"60"} height={"30"} />
        </Link>
      </h2>
      <br />
      <div className="flex justify-center">
        {breweries.length > 0 &&
          breweries.map((brewery) => {
            return (
              <>
                <p key={brewery._id}>
                  <SetBreweryIdStorage
                    brewery={brewery}
                    href={`/breweries/${brewery._id}`}
                  />
                </p>
              </>
            );
          })}
        <Link
          href={"/create/brewery"}
          className="btn btn-accent text-indigo-900"
        >
          Create A Brewery
        </Link>
      </div>
    </section>
  );
};

export default BreweriesPage;

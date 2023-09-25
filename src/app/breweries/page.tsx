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
import { Plus } from "lucide-react";

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
    <section className="w-full h-screen">
      {/* <h2>
        <Link href={``}>
          <BackArrow width={"60"} height={"30"} />
        </Link>
      </h2> */}
      <br />
      <div className="flex flex-col justify-center items-center w-[80%] mx-auto text-center gap-6">
        {breweries.length > 0 &&
          breweries.map((brewery) => {
            return (
              <>
                <div
                  key={brewery._id}
                  className="category-card w-full md:w-1/2 rounded-xl p-6"
                >
                  <SetBreweryIdStorage
                    brewery={brewery}
                    href={`/breweries/${brewery._id}`}
                  />
                </div>
              </>
            );
          })}
        <div className="fixed right-5 bottom-20 p-1 z-[2] lg:hidden ">
          <Link
            href={"/create/brewery"}
            className="btn btn-circle btn-white create-btn !btn-lg"
          >
            <Plus size={28} />
          </Link>
          <p className="hidden m-0 text-lg lg:flex">Beer</p>
        </div>
        <div className="hidden lg:flex justify-center items-center mt-10 gap-2">
          <Link
            href={"/create/brewery"}
            className=" lg: block btn btn-circle btn-white create-btn !btn-lg "
          >
            <Plus size={28} />
          </Link>
          <h4> Brewery</h4>
        </div>
      </div>
    </section>
  );
};

export default BreweriesPage;

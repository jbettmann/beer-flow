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

const BreweriesPage = async () => {
  const breweryData: Promise<Brewery[]> = getBreweries();
  const breweries = await breweryData;

  return (
    <section className="w-full h-screen py-3 sm:p-8">
      {/* <h2>
        <Link href={``}>
          <BackArrow width={"60"} height={"30"} />
        </Link>
      </h2> */}

      <div className="flex flex-col justify-center  mx-auto text-center gap-6">
        <div className="flex justify-between md:p-5 ">
          <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
            <h3 className="text-center lg:text-left">Breweries</h3>
          </div>
          <div className="hidden lg:flex justify-center items-center gap-2">
            <Link href={"/create/brewery"} className="create-btn  ">
              + Brewery
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-center w-[80%] items-center mx-auto gap-8">
          {breweries.length > 0 &&
            breweries.map((brewery) => {
              return (
                <>
                  <div
                    key={brewery._id}
                    className="category-card w-full md:w-1/2 rounded-xl p-5 sm:p-6"
                  >
                    <SetBreweryIdStorage
                      brewery={brewery}
                      href={`/breweries/${brewery._id}`}
                    />
                  </div>
                </>
              );
            })}
        </div>
        <div className="fixed right-5 bottom-20 p-1 z-[2] lg:hidden ">
          <Link
            href={"/create/brewery"}
            className="btn btn-circle btn-white create-btn !btn-lg"
          >
            <Plus size={28} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BreweriesPage;

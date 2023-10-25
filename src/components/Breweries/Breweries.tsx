"use client";
import { Brewery } from "@/app/types/brewery";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SetBreweryIdStorage from "../Buttons/SetBreweryIdStorage";
import { Plus } from "lucide-react";
import { debounce } from "@/lib/utils";
import BottomDrawer from "../Drawers/BottomDrawer";
import EditModal from "../Alerts/EditModal";
import CreateBreweryForm from "../CreateBreweryForm";

type Props = {
  breweries: Brewery[];
};

const Breweries = ({ breweries }: Props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCreateBrewery, setIsCreateBrewery] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    const debouncedResize = debounce(handleResize, 250); // 250ms delay

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center  mx-auto text-center gap-6">
      <div className="flex justify-between md:p-5 ">
        <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
          <h3 className="text-center lg:text-left">Breweries</h3>
        </div>
        <div className="hidden lg:flex justify-center items-center gap-2">
          <button
            onClick={() => setIsCreateBrewery(true)}
            className="create-btn  "
          >
            + Brewery
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-center w-[80%] items-center mx-auto gap-8">
        {breweries.length > 0 ? (
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
          })
        ) : (
          <div>
            <h4>You have no breweries</h4>
            <p>Let get started!</p>
            <div className="hidden lg:flex justify-center items-center gap-2">
              <button
                onClick={() => setIsCreateBrewery(true)}
                className="create-btn  "
              >
                + Brewery
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="fixed right-5 bottom-10 p-1 z-[2] lg:hidden ">
        <button
          onClick={() => setIsCreateBrewery(true)}
          className="btn btn-circle btn-white create-btn !btn-lg"
        >
          <Plus size={28} />
        </button>
      </div>
      {isMobile ? (
        <BottomDrawer isOpen={isCreateBrewery}>
          <CreateBreweryForm onClose={() => setIsCreateBrewery(false)} />
        </BottomDrawer>
      ) : (
        <EditModal isOpen={isCreateBrewery} title="Create Brewery">
          <CreateBreweryForm onClose={() => setIsCreateBrewery(false)} />
        </EditModal>
      )}
    </div>
  );
};

export default Breweries;

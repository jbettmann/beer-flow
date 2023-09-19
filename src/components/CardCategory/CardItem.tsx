"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import { beerInCategory, convertDate } from "@/lib/utils";
import {
  Beer as BeerMug,
  Check,
  Flame,
  LogIn,
  Scissors,
  Skull,
} from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  category: Category;
  beer: Beer;
  isChecked: boolean;
  handleCheckbox: (beerId: string, isChecked: boolean) => void;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean | string>>;
  setMoveAlertOpen: React.Dispatch<React.SetStateAction<boolean | string>>;
};

const CardItem = ({
  category,
  beer,
  handleCheckbox,
  isChecked,
  setAlertOpen,
  setMoveAlertOpen,
}: Props) => {
  const isInMultipleCategories = beer.category && beer.category.length > 1;
  const [checked, setChecked] = useState(isChecked);

  // Update the local state if the isChecked prop changes
  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  // detect source of click
  const handleClick = () => {
    // Ignore clicks on input or label elements

    const newChecked = !checked;
    setChecked(newChecked);
    handleCheckbox(beer._id, newChecked);
  };

  return (
    <div
      className={`flex justify-between items-center relative my-2 p-2 transition-all  ${
        checked ? "selected rounded-lg" : ""
      }`}
      onClick={handleClick}
    >
      <div className="hover:cursor-pointer px-2 py-6">
        <div className="flex items-center space-x-3 ">
          <label>
            <input type="checkbox" className="hidden" checked={checked} />
            {checked ? (
              <div className=" bg-primary rounded-full p-1">
                <Check size={24} color="#f9fafb" />
              </div>
            ) : (
              <BeerMug size={24} strokeWidth={1} className="" />
            )}
          </label>

          <div>
            <div className="font-bold flex">
              {beer.name}
              {isInMultipleCategories && (
                <span
                  className=" text-gray-600 cursor-pointer "
                  title={`Beer is in more than one category`}
                >
                  <Flame size={12} strokeWidth={2} />
                </span>
              )}
            </div>

            <div className="hover:cursor-pointer text-xs ">
              <div>{beer.style ? beer.style : null}</div>
            </div>
          </div>
        </div>
      </div>

      {checked ? (
        <div className="inline-flex justify-center items-center">
          {isInMultipleCategories && (
            <button
              onClick={() => setAlertOpen(true)}
              className={`btn btn-circle ${
                isChecked ? "btn-error " : "btn-disabled"
              } `}
            >
              <span title="Remove from Category">
                <Scissors strokeWidth={1} size={20} />
              </span>
            </button>
          )}
          <button
            onClick={() => setMoveAlertOpen(true)}
            className={`btn btn-circle ml-2 ${
              isChecked ? "btn-warning" : "btn-disabled"
            } `}
          >
            <span title="Move to different Category">
              <LogIn size={20} strokeWidth={1} />
            </span>
          </button>
        </div>
      ) : (
        <>
          <div
            className="hover:cursor-pointer text-base font-bold"
            onClick={handleClick}
          >
            <div>{beer.abv ? beer.abv + "%" : null} </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardItem;

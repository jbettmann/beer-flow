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

const CategoryItem = ({
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
    <tr className={`relative ${checked ? "table-row__checked" : ""}`}>
      <th className="rounded-l-lg">
        <label>
          <input
            type="checkbox"
            className="checkbox"
            onClick={handleClick}
            checked={checked}
          />
        </label>
      </th>
      <td className="hover:cursor-pointer p-6" onClick={handleClick}>
        <div className="flex items-center space-x-3 ">
          <BeerMug size={24} strokeWidth={1} className="" />

          <div>
            <div className="font-bold flex">
              {beer.name}{" "}
              {isInMultipleCategories && (
                <span
                  className="ml-2 text-gray-600 cursor-pointer"
                  title={`Beer is in more than one category`}
                >
                  <Flame size={12} strokeWidth={2} />
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="hover:cursor-pointer" onClick={handleClick}>
        <div>{beer.style ? beer.style : null}</div>
      </td>
      <td className="hover:cursor-pointer" onClick={handleClick}>
        <div>{beer.abv ? beer.abv + "%" : null} </div>
      </td>
      <td className="hover:cursor-pointer" onClick={handleClick}>
        <div>{beer.updatedAt ? convertDate(beer.updatedAt) : null}</div>
      </td>
      <th className="absolute right-0">
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
      </th>
    </tr>
  );
};

export default CategoryItem;

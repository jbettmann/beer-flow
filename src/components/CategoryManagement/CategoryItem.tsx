"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import { Beer as BeerMug, Check, Flame, LogIn, Scissors } from "lucide-react";
import { useState } from "react";

type Props = {
  category: Category;
  beer: Beer;
  isChecked: boolean;
  handleCheckbox: (beerId: string, isChecked: boolean) => void;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean | string>>;
};

const CategoryItem = ({
  category,
  beer,
  handleCheckbox,
  isChecked,
  setAlertOpen,
}: Props) => {
  const isInMultipleCategories = beer.category && beer.category.length > 1;
  const [checked, setChecked] = useState(isChecked);

  // detect source of click
  const handleClick = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => {
    // Ignore clicks on input or label elements
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLLabelElement
    )
      return;

    const newChecked = !checked;
    setChecked(newChecked);
    handleCheckbox(beer._id, newChecked);
  };

  return (
    <tr className="relative">
      <th></th>
      <td className="hover:cursor-pointer" onClick={handleClick}>
        <div className="flex items-center space-x-3 ">
          <label className=" swap btn btn-circle">
            <input type="checkbox" checked={checked} />

            <BeerMug size={24} className="swap-off " />

            <Check size={24} className=" swap-on" />
          </label>
          <div>
            <div className="font-bold flex">
              {beer.name}{" "}
              {isInMultipleCategories && (
                <span
                  className="ml-2 text-gray-600 cursor-pointer"
                  title={`Beer is in more than one category`}
                >
                  <Flame size={12} />
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="hover:cursor-pointer" onClick={handleClick}>
        <button className="btn btn-ghost btn-xs">
          {category.name ? category.name : null}
        </button>
      </td>
      <th className="absolute right-0">
        {isInMultipleCategories && (
          <button
            onClick={() => setAlertOpen(true)}
            className={`btn btn-circle ${
              isChecked ? "btn-error" : "btn-disabled"
            } `}
          >
            <span title="Remove from Category">
              <Scissors size={20} />
            </span>
          </button>
        )}
        <button
          onClick={() => setAlertOpen(beer._id)}
          className={`btn btn-circle ml-2 ${
            isChecked ? "btn-warning" : "btn-disabled"
          } `}
        >
          <span title="Move to different Category">
            <LogIn size={20} />
          </span>
        </button>
      </th>
    </tr>
  );
};

export default CategoryItem;

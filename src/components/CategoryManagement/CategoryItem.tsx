"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import { convertDate } from "@/lib/utils";
import { Beer as BeerMug, Flame } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  category: Category;
  beer: Beer;
  isChecked: boolean;
  isOpen: boolean;
  handleCheckbox: (beerId: string, isChecked: boolean) => void;
};

const CategoryItem = ({
  category,
  beer,
  isOpen,
  handleCheckbox,
  isChecked,
}: Props) => {
  const isInMultipleCategories = beer.category && beer.category.length > 1;
  const [checked, setChecked] = useState(isChecked);

  // detect source of click
  const handleClick = () => {
    // Ignore clicks on input or label elements

    const newChecked = !checked;
    setChecked(newChecked);
    handleCheckbox(beer._id, newChecked);
  };

  // Update the local state if the isChecked prop changes
  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  useEffect(() => {
    if (isOpen) {
      return;
    } else {
      setChecked(false);
    }
  }, [isOpen]);

  return (
    <>
      <tr className={`relative ${checked ? "table-row__checked" : ""}`}>
        <th className="rounded-l-lg !py-6">
          <label>
            <input
              type="checkbox"
              className="checkbox"
              onClick={handleClick}
              checked={checked}
            />
          </label>
        </th>
        <td className="hover:cursor-pointer " onClick={handleClick}>
          <div className="flex items-center space-x-3 ">
            <BeerMug size={24} strokeWidth={1} className="" />

            <div>
              <div className="font-bold flex">
                {beer.name}
                {isInMultipleCategories && (
                  <span
                    className="ml-2  cursor-pointer"
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
        <td
          className="hover:cursor-pointer rounded-r-lg "
          onClick={handleClick}
        >
          <div>{beer.updatedAt ? convertDate(beer.updatedAt) : null}</div>
        </td>
      </tr>
    </>
  );
};

export default CategoryItem;

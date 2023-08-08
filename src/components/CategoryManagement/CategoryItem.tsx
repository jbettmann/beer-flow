"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import {
  BadgeInfo,
  Beer as BeerMug,
  Boxes,
  Check,
  Files,
  Blocks,
  ArrowLeftSquare,
  Scissors,
  Flame,
} from "lucide-react";

import React, { useState } from "react";

type Props = {
  category: Category;
  beer: Beer;
  isChecked: boolean;
  handleCheckbox: (beerId: string, isChecked: boolean) => void;
};

const CategoryItem = ({ category, beer, handleCheckbox, isChecked }: Props) => {
  const isInMultipleCategories = beer.category && beer.category.length > 1;
  return (
    <tr className="relative">
      <th></th>
      <td>
        <div className="flex items-center space-x-3 ">
          <label className=" swap btn btn-circle">
            <input
              type="checkbox"
              onChange={(e) => handleCheckbox(beer._id, e.target.checked)}
            />

            {/* this hidden checkbox controls the state */}
            <BeerMug size={24} className="swap-off " />

            <Check size={24} className=" swap-on" />
          </label>
          <div>
            <div className="font-bold flex">
              {beer.name}{" "}
              {isInMultipleCategories && (
                <span
                  className="ml-2 text-gray-600 cursor-pointer"
                  title={`${beer.name} is in more than one category`}
                >
                  <Flame size={12} />
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td>
        <button className="btn btn-ghost btn-xs">
          {category.name ? category.name : null}
        </button>
      </td>
      <th className="absolute right-0">
        {isInMultipleCategories && (
          <button
            onClick={() => handleRemove(beer._id)}
            className={`btn btn-circle btn-sm ${
              isChecked ? "btn-error" : "btn-disabled"
            } `}
          >
            <Scissors size={20} />
          </button>
        )}
        <button
          onClick={() => handleRemove(beer._id)}
          className={`btn btn-circle btn-sm ml-2 ${
            isChecked ? "btn-warning" : "btn-disabled"
          } `}
        >
          <ArrowLeftSquare size={20} />
        </button>
      </th>
    </tr>
  );
};

export default CategoryItem;

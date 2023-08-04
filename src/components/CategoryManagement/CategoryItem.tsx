"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import { Beer as BeerMug } from "lucide-react";
import React, { useState } from "react";

type Props = {
  categories: Category[];
  beers: Beer[];
};

const CategoryItem = ({ categories, beers }: Props) => {
  const [openStates, setOpenStates] = useState<{ [index: number]: boolean }>(
    {}
  );

  const handleOpen = (index: number) => {
    setOpenStates({ ...openStates, [index]: !openStates[index] });
  };

  return (
    categories &&
    beers &&
    categories.map((category, index) => {
      // Filter the beers that belong to this category
      const beersInCategory = beers?.filter((beer) => {
        return beer.category
          ? beer.category.some((cat) => cat.name === category.name)
          : false;
      });
      const isOpen = openStates[index] || false;
      return (
        <>
          <tr key={index}>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <td>
              <div className="flex items-center space-x-3">
                <div className="avatar">
                  <div className="mask mask-squircle w-12 h-12">
                    <BeerMug size={24} />
                  </div>
                </div>
                <div>
                  <div className="font-bold">{category.name}</div>
                  <div className="text-sm opacity-50">
                    Beers associated with category
                  </div>
                </div>
              </div>
            </td>
            <td>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => handleOpen(index)}
              >
                {" "}
                {beersInCategory?.length || 0}
              </button>
            </td>
            <td>Purple</td>
            <th>details</th>
          </tr>
          <tr>
            <div className="collapse">
              <input type="checkbox" checked={isOpen} className="hidden" />

              <div className="collapse-content">
                {/* head */}
                <thead>
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Favorite Color</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {beersInCategory?.map((beer) => {
                    return (
                      <tr key={beer._id}>
                        <th>
                          <label>
                            <input type="checkbox" className="checkbox" />
                          </label>
                        </th>
                        <td>
                          <div className="font-bold">{beer.name}</div>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-xs">
                            {category.name
                              ? beer.category.includes(category.name)
                              : null}
                          </button>
                        </td>
                        <td>Purple</td>
                        <th>details</th>
                      </tr>
                    );
                  })}
                </tbody>
              </div>
            </div>
          </tr>
        </>
      );
    })
  );
};

export default CategoryItem;

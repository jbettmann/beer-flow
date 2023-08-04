"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { Beer } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type Props = {};

const CategoryList = (props: Props) => {
  const { selectedBeers, selectedBrewery } = useBreweryContext();
  const [categories, setCategories] = useState<Category[]>(
    selectedBrewery?.categories || []
  );

  const [isOpen, setIsOpen] = useState<boolean[]>(categories.map(() => false));

  const handleOpen = (index: number) => {
    const newIsOpen = [...isOpen];
    newIsOpen[index] = !newIsOpen[index];
    setIsOpen(newIsOpen);
  };

  useEffect(() => {
    setCategories(selectedBrewery?.categories || []);
  }, [selectedBrewery]);

  console.log({ selectedBeers });
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra ">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <th>Name</th>
            <th>Beers Under Category</th>
            <th>Favorite Color</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}

          {categories &&
            categories.map((category, index) => {
              // Filter the beers that belong to this category
              const beersInCategory = selectedBeers?.filter((beer) => {
                return beer.category
                  ? beer.category.some((cat) => cat.name === category.name)
                  : false;
              });
              return (
                <>
                  <tr key={index} className="">
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <Beer size={24} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold ">{category.name}</div>
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
                    <td colSpan={5}>
                      <div
                        className={`collapse transition-all duration-300 overflow-hidden ${
                          isOpen[index] ? "max-h-[500px]" : "max-h-0"
                        } `}
                      >
                        <input
                          type="checkbox"
                          checked={isOpen[index]}
                          className="hidden"
                        />

                        <div className="collapse-content table table-zebra">
                          <thead>
                            <tr>
                              <th>
                                <label></label>
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
                                      <input
                                        type="checkbox"
                                        className="checkbox"
                                      />
                                    </label>
                                  </th>
                                  <td>
                                    <div className="font-bold">{beer.name}</div>
                                  </td>
                                  <td>
                                    <button className="btn btn-ghost btn-xs">
                                      {category.name ? category.name : null}
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
                    </td>
                  </tr>
                </>
              );
            })}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Beers Under Category</th>
            <th>Favorite Color</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CategoryList;

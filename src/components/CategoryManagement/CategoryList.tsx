"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CategoryRow from "./CategoryRow";

type Props = {};

const CategoryList = (props: Props) => {
  const {  selectedBrewery } =
    useBreweryContext();
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

            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}

          {categories &&
            categories.map((category, index) => {
              return (
                <CategoryRow
                  category={category}
                  key={index}
                  index={index}
                  isOpen={isOpen[index]}
                  handleOpen={handleOpen}
                />
              );
            })}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Beers Under Category</th>

            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CategoryList;

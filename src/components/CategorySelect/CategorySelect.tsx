import { Category } from "@/app/types/category";
import { create } from "domain";
import React, { KeyboardEventHandler, use, useEffect } from "react";

import CreatableSelect from "react-select/creatable";
import { Tag } from "react-tag-input";
import { FormValues } from "../CreateBeerForm/types";
import { set } from "mongoose";

type Props = {
  selectedValues: Option[];
  setValues: (values: FormValues) => void;
  categories: Option[];
};
const components = {
  DropdownIndicator: null,
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

const CategorySelect = ({ selectedValues, setValues, categories }: Props) => {
  const [options, setOptions] = React.useState<Option[]>(categories);
  const [selectedOptions, setSelectedOptions] =
    React.useState<Option[]>(selectedValues);

  console.log(selectedOptions);
  // // sets selectedOptions to selectedValues from localSession
  useEffect(() => {
    setSelectedOptions(selectedValues || []);
  }, [selectedValues]);

  console.log(selectedOptions);
  // Creates new category and adds it to selectedOptions
  const handleCreate = (inputValue: string) => {
    if (!inputValue) return;
    const newCategory = createOption(inputValue);
    setSelectedOptions((prevOptions) => [...prevOptions, newCategory]);
    setOptions((prevOptions) => [...prevOptions, newCategory]);
    setValues((prevValues) => ({
      ...prevValues,
      category: [...(prevValues.category || []), newCategory as string],
    }));
  };

  // removes from selectedOptions
  const handleChange = (newValue: Option[]) => {
    setSelectedOptions(newValue as Option[]);
    // map incoming newValues to string array

    setValues((prevValues) => ({
      ...prevValues,
      category: [...(newValue || [])],
    }));
  };

  return (
    <>
      <p className="m-0">Category</p>
      <CreatableSelect
        className="text-black"
        options={options}
        isMulti
        onChange={handleChange}
        onCreateOption={handleCreate}
        value={selectedOptions}
        placeholder="Create or search category..."
      />
    </>
  );
};

export default CategorySelect;

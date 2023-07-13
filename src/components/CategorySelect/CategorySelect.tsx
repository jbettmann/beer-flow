import { create } from "domain";
import React, { KeyboardEventHandler } from "react";

import CreatableSelect from "react-select/creatable";
import { Tag } from "react-tag-input";

type Props = {
  values: FormData;
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

const CategorySelect = ({ values, setValues, categories }: Props) => {
  const [inputValue, setInputValue] = React.useState("");

  console.log(categories, inputValue);

  const handleCreate = (inputValue: string) => {
    if (!inputValue) return;
    const newCategory = createOption(inputValue);

    setValues({
      ...values,
      category: [...values.category, newCategory],
    });
  };

  return (
    <>
      <p className="m-0">Category</p>
      <CreatableSelect
        className="text-black"
        options={categories}
        isMulti
        onCreateOption={handleCreate}
        placeholder="Create or search category..."
      />
    </>
  );
};

export default CategorySelect;

"use client";
import React, { RefObject, use, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { FormValues } from "../CreateBeerForm/types";
import { useBreweryContext } from "@/context/brewery-beer";

type Props = {
  selectedValues: Option[] | null;
  setValues: (values: any) => void;
  categories: Option[];
  handleBlur: (field: keyof FormValues) => (e: any) => void | null;
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

const CategorySelect = ({
  selectedValues,
  setValues,
  categories,
  handleBlur,
}: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [options, setOptions] = React.useState<Option[]>(categories);
  const [selectedOptions, setSelectedOptions] = React.useState<Option[] | null>(
    selectedValues
  );

  useEffect(() => {
    const categoryUpdate = selectedBrewery?.categories?.map((cat) => ({
      label: cat.name,
      value: cat.name,
    }));
    setOptions(categoryUpdate as Option[]);
  }, [selectedBrewery]);

  // // sets selectedOptions to selectedValues from localSession
  useEffect(() => {
    setSelectedOptions(selectedValues || []);
  }, [selectedValues]);

  // Creates new category and adds it to selectedOptions
  const handleCreate = (inputValue: string) => {
    if (!inputValue) return;
    const newCategory = createOption(inputValue);
    setSelectedOptions((prevOptions) => [
      ...(prevOptions as Option[]),
      newCategory,
    ]);
    setOptions((prevOptions) => [...prevOptions, newCategory]);
    setValues((prevValues: { category: any }) => ({
      ...prevValues,
      category: [
        ...(prevValues.category || []),
        newCategory as unknown as string,
      ],
    }));
  };

  // removes from selectedOptions
  const handleChange = (newValue: Option[]) => {
    setSelectedOptions(newValue as Option[]);
    // map incoming newValues to string array

    setValues((prevValues: any) => ({
      ...prevValues,
      category: [...(newValue || [])],
    }));
  };

  return (
    <>
      <label className="beer-card__label-text">Category</label>

      <CreatableSelect
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "primary",
            padding: "0.25rem",
            color: "#f6f1e",
            borderRadius: "9999px",
            borderColor: "#a8a29e",
          }),
          menu: (base) => ({
            ...base,
            zIndex: 1,
            backgroundColor: "background",
            color: "#2B2B2B",
          }),
          option: (base, { isSelected }) => ({
            ...base,
            backgroundColor: isSelected ? "#1fcdbc" : "b#f6f1e9",
            color: isSelected ? "#2B2B2B" : "#2B2B2B",
          }),
        }}
        onBlur={handleBlur("category")}
        options={options}
        isMulti
        onChange={handleChange as any}
        onCreateOption={handleCreate}
        value={selectedOptions}
        placeholder="Create or search category..."
      />
    </>
  );
};

export default CategorySelect;

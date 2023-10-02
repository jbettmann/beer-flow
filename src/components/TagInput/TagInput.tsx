import React from "react";
import { Tag, WithContext as Tags } from "react-tag-input";
import { FormValues } from "../CreateBeerForm/types";

interface Suggestions {
  name: string;
  id: string;
}

type Props = {
  valueInput: keyof FormValues;
  values: FormValues;
  setValues: (values: FormValues) => void;
  tags: Tag[];
  suggestions: Suggestions[] | null;
};

interface ExtendedTagProps extends Tags {
  onTagUpdate?: (i: number, newTag: Tag) => void;
}

const TagInput = ({
  valueInput,
  values,
  setValues,
  tags,
  suggestions,
}: Props) => {
  // Key codes for enter and comma
  const KeyCodes = {
    tab: 9,
    comma: 188,
    enter: 13,
  };

  // New hop created when enter and , are pressed
  const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.tab];

  // Handle tag deletions by filtering
  const handleDelete = (i: number) => {
    if (valueInput === "hops") {
      setValues({
        ...values,
        hops: values.hops.filter((_, index) => index !== i),
      });
    }
    if (valueInput === "malt") {
      setValues({
        ...values,
        malt: values.malt.filter((_, index) => index !== i),
      });
    }
  };

  // Handle tag additions
  const handleAddition = (name: keyof FormValues) => (newTags: Tag) => {
    setValues({ ...values, [name]: [...(values[name] as Tag[]), newTags] });
  };

  // Handle tag edits
  const handleUpdate = (i: number, newTag: Tag) => {
    if (valueInput === "hops") {
      setValues({
        ...values,
        hops: values.hops.map((tag, index) => (index === i ? newTag : tag)),
      });
    }
    if (valueInput === "malt") {
      setValues({
        ...values,
        malt: values.malt.map((tag, index) => (index === i ? newTag : tag)),
      });
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="container-create__form">
      <label htmlFor={valueInput}>{capitalizeFirstLetter(valueInput)}:</label>
      <Tags
        id={valueInput}
        name={valueInput}
        placeholder={`Enter ${valueInput} and press enter`}
        tags={tags}
        delimiters={delimiters}
        // readOnly={admin? false : true}
        handleAddition={handleAddition(valueInput)}
        handleDelete={handleDelete}
        labelField={"name"}
        allowDeleteFromEmptyInput={false}
        inputFieldPosition="inline"
        allowDragDrop={false}
        autocomplete={true}
        suggestions={suggestions ? suggestions : ([] as any)}
        // onTagUpdate={handleUpdate}
      />
    </div>
  );
};

export default TagInput;

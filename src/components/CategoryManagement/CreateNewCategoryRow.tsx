import { LayoutGrid } from "lucide-react";
import React, { useState } from "react";
import SaveButton from "../Buttons/SaveButton";

type Props = {
  handleSaveNewCategory: (categoryName: string) => void;
  setCreateNewCategory: (creatingNewCategory: boolean) => void;
  isLoading: boolean;
};

const CreateNewCategoryRow = ({
  setCreateNewCategory,
  handleSaveNewCategory,
  isLoading,
}: Props) => {
  const [inputValue, setInputValue] = useState<string>("");
  //  Runs name change save on keydown "Enter"
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSaveNewCategory(inputValue);
      event.preventDefault(); // To prevent any default behavior, e.g., form submission
    }
  };
  return (
    <tr className={"new-category relative "}>
      <th className="rounded-l-lg"></th>
      <td className="!py-6 ">
        <div className="flex items-center space-x-3  ">
          <label className=" ">
            <LayoutGrid size={28} strokeWidth={1} />
          </label>

          <div className="font-bold ">
            <input
              type="text"
              value={inputValue}
              className="input bg-primary text-background rounded-full border-none  font-semibold "
              autoFocus
              placeholder="Category name"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
      </td>
      <td></td>

      <td></td>
      <th className="flex gap-3 !py-6 absolute top-0 right-0 rounded-r-lg">
        <button
          className="btn btn-ghost text-primary " // Made the button more visible
          onClick={() => setCreateNewCategory(false)}
        >
          Cancel
        </button>
        <SaveButton
          isLoading={isLoading}
          disabled={inputValue === "" ? true : false}
          onClick={() => handleSaveNewCategory(inputValue)}
        />
      </th>
    </tr>
  );
};

export default CreateNewCategoryRow;

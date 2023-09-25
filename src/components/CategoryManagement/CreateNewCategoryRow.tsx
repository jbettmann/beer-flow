import { LayoutGrid } from "lucide-react";
import React from "react";

type Props = {
  handleSaveNewCategory: (categoryName: string) => void;
  setCreateNewCategory: (creatingNewCategory: boolean) => void;
};

const CreateNewCategoryRow = ({
  setCreateNewCategory,
  handleSaveNewCategory,
}: Props) => {
  //  Runs name change save on keydown "Enter"
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const target = event.target as HTMLInputElement;
      handleSaveNewCategory(target.value);
      event.preventDefault(); // To prevent any default behavior, e.g., form submission
    }
  };
  return (
    <tr className={"shadow-sm"}>
      <th></th>
      <td>
        <div className="flex items-center space-x-3 ">
          <label className=" ">
            <LayoutGrid size={28} strokeWidth={1} className="fill-primary " />
          </label>

          <div className="font-bold ">
            <input
              type="text"
              className="input font-semibold "
              autoFocus
              placeholder="Category name"
              onBlur={(e) => handleSaveNewCategory(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
      </td>

      <th>
        <button
          className="btn btn-error  " // Made the button more visible
          onClick={() => setCreateNewCategory(false)}
        >
          Cancel
        </button>
      </th>
      <th>
        <button className="btn btn-accent ">Save</button>
      </th>
    </tr>
  );
};

export default CreateNewCategoryRow;

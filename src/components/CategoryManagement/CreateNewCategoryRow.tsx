import { BookMarked } from "lucide-react";
import React from "react";

type Props = {
  handleSaveNewCategory: (categoryName: string) => void;
  setCreatingNewCategory: (creatingNewCategory: boolean) => void;
};

const CreateNewCategoryRow = ({
  setCreatingNewCategory,
  handleSaveNewCategory,
}: Props) => {
  return (
    <tr className={"shadow-sm"}>
      <th></th>
      <td>
        <div className="flex items-center space-x-3 ">
          <label className="  btn btn-circle ">
            {/* this hidden checkbox controls the state */}

            <BookMarked size={24} strokeWidth={1} />
          </label>
          <div>
            <div className="font-bold ">
              <input
                type="text"
                className="input input-bordered input-accent"
                autoFocus
                placeholder="Enter category name"
                onBlur={(e) => handleSaveNewCategory(e.target.value)}
              />
            </div>
          </div>
        </div>
      </td>
      <td></td>

      <th>
        <button
          className="btn btn-outline btn-error"
          onClick={() => setCreatingNewCategory(false)}
        >
          Cancel
        </button>
      </th>
    </tr>
  );
};

export default CreateNewCategoryRow;

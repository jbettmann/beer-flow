import { X } from "lucide-react";
import React from "react";

type Props = {
  onClose: () => void;
  onSave: () => void;
};

const EditBreweryProfile = ({ onClose, onSave }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex w-full justify-between items-center">
        {" "}
        <button onClick={onClose} className="btn m-4">
          <X size={24} />
        </button>
        <h4>Edit Brewery Profile</h4>
        <button onClick={onSave} className="btn btn-accent m-4">
          Save
        </button>
      </div>
    </div>
  );
};

export default EditBreweryProfile;

import React, { useState } from "react";
type Props = {
  toggleStates: string[];
  setToggleStates: React.Dispatch<React.SetStateAction<string>>;
};
const ToggleButton = ({ toggleStates, setToggleStates }: Props) => {
  // Initialize state to "Overview"
  const [toggleState, setToggleState] = useState(toggleStates[0]);

  // Function to handle toggle click
  const handleToggle = (state: string) => {
    setToggleState(state);
    setToggleStates(state);
  };

  return (
    <div className="flex items-center w-3/4 h-10 lg:w-1/2 my-3 relative bg-fourth-color rounded-full justify-around overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full transition-transform duration-300 ease-in-out rounded-full ${
          toggleState === toggleStates[0]
            ? "w-1/2 transform translate-x-0 bg-accent"
            : "w-1/2 transform translate-x-full bg-accent"
        }`}
      ></div>

      <button
        onClick={() => handleToggle(toggleStates[0])}
        className={`flex-1 text-center z-1 transition-colors duration-300 lg:text-sm ${
          toggleState === toggleStates[0] ? "text-primary font-bold" : ""
        }`}
      >
        {toggleStates[0]}
      </button>

      <button
        onClick={() => handleToggle(toggleStates[1])}
        className={`flex-1 text-center z-1 transition-colors duration-300 lg:text-sm ${
          toggleState === toggleStates[1] ? "text-primary font-bold" : ""
        }`}
      >
        {toggleStates[1]}
      </button>
    </div>
  );
};

export default ToggleButton;

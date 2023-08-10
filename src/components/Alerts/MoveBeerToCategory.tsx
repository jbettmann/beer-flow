"use client";
import { Category } from "@/app/types/category";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import CategorySelect from "../CategorySelect/CategorySelect";
import { FormValues } from "../UpdateCategory/types";
import { useBreweryContext } from "@/context/brewery-beer";

type Props = {
  category: Category;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToMoveContinue: React.Dispatch<React.SetStateAction<boolean>>;
  alertOpen: boolean;
  setValues: (values: FormValues) => void;
  checkedBeers: Category[];
};

const MoveBeerToCategory = ({
  alertOpen,
  setToMoveContinue,
  setAlertOpen,
  setValues,
  checkedBeers,
}: Props) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (alertOpen) {
      if (modalRef.current) {
        modalRef.current.showModal();
      }
    }
    console.log({ modalRef });
  }, [alertOpen]);

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
      setAlertOpen(false);
    }
  };

  return (
    <dialog
      ref={modalRef}
      id="my_modal_1"
      className="modal modal-bottom sm:modal-middle"
    >
      <form method="dialog" className="modal-box p-0">
        <div className="p-6 flex flex-col alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <CategorySelect
            setValues={setValues}
            selectedValues={null}
            categories={checkedBeers.map((cat) => ({
              label: cat.name,
              value: cat.name,
            }))}
            handleBlur={() => null}
          />

          <div>
            <button
              className="btn btn-sm"
              onClick={() => {
                setToMoveContinue(false);
                closeModal();
              }}
            >
              Cancel
            </button>
            <button
              className="ml-2 btn btn-sm btn-accent"
              onClick={() => {
                setToMoveContinue(true);
                closeModal();
              }}
            >
              Move
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default MoveBeerToCategory;

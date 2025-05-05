"use client";
import { Category } from "@/types/category";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../Modal";

type Props = {
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToContinue: React.Dispatch<React.SetStateAction<boolean>>;
  alertOpen: boolean;
};

const OnlyEmptyCategoryDelete = ({
  alertOpen,
  setToContinue,
  setAlertOpen,
}: Props) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (alertOpen) {
      if (modalRef.current) {
        modalRef.current.showModal();
      }
    }
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
      id="my_modal_5"
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
          <span>{`Only Categories that are empty will be deleted`}</span>

          <div>
            <button
              className="btn btn-sm"
              onClick={(e) => {
                e.preventDefault();
                setToContinue(false);
                closeModal();
              }}
            >
              Cancel
            </button>
            <button
              className="ml-2 btn btn-sm btn-accent"
              onClick={(e) => {
                e.preventDefault();
                setToContinue(true);

                closeModal();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default OnlyEmptyCategoryDelete;

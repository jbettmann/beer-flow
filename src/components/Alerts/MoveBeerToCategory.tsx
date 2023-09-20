"use client";
import { Category } from "@/app/types/category";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import CategorySelect from "../CategorySelect/CategorySelect";
import { FormValues } from "../UpdateCategory/types";
import { useBreweryContext } from "@/context/brewery-beer";

type Props = {
  title?: string;
  message: string | JSX.Element;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;

  setValues: (value: FormValues) => void;
  checkedBeers: Category[];
};

const MoveBeerToCategory = ({
  title = "Alert",
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  setValues,

  checkedBeers,
}: Props) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isOpen]);
  console.log({ isOpen, modalRef });
  return (
    <dialog ref={modalRef} id="alert_modal" className="modal modal-middle ">
      <form method="dialog" className="modal-box p-0 rounded-md">
        <div className="p-6 flex text-center flex-col alert">
          <h2>{title}</h2>
          <span>{message}</span>
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
            <button className="btn btn-sm" onClick={onClose}>
              {cancelButtonText}
            </button>
            <button className="ml-2 btn btn-sm btn-accent" onClick={onConfirm}>
              {confirmButtonText}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default MoveBeerToCategory;

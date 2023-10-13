"use client";
import { Category } from "@/app/types/category";
import { useEffect, useRef } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";

type Props = {
  title?: string;
  message: string | JSX.Element;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;

  setValues: (value: any) => void;
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

  return (
    <dialog ref={modalRef} id="alert_modal" className="modal modal-middle ">
      <form
        method="dialog"
        className="modal-box p-5 rounded-md overflow-visible bg-primary "
      >
        <div className="p-6 flex text-center flex-col alert alert-modal">
          <h4 className="text-accent">{title}</h4>
          <span className="text-background ">{message}</span>
          <div>
            <CategorySelect
              setValues={setValues}
              selectedValues={null}
              categories={checkedBeers.map((cat) => ({
                label: cat.name,
                value: cat.name,
              }))}
              handleBlur={() => null as any}
            />
          </div>

          <div>
            <button
              className="btn border-none bg-transparent hover:bg-background hover:text-primary text-background"
              onClick={onClose}
              type="button"
            >
              {cancelButtonText}
            </button>
            <button
              className="ml-2 create-btn inverse "
              onClick={onConfirm}
              type="button"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default MoveBeerToCategory;

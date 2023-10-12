import React, { FC, useEffect, useRef } from "react";

type AlertDialogProps = {
  title?: string;
  message: string | JSX.Element;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

const AlertDialog: FC<AlertDialogProps> = ({
  title = "Alert",
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}) => {
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
      <form method="dialog" className="modal-box p-5 bg-primary ">
        <div className="p-6 flex text-center flex-col alert alert-modal">
          <h4 className="text-accent">{title}</h4>
          <span className="text-background ">{message}</span>
          <div>
            <button
              className="btn border-none bg-transparent hover:bg-background hover:text-primary text-background"
              onClick={onClose}
            >
              {cancelButtonText}
            </button>
            <button className="ml-2 create-btn inverse " onClick={onConfirm}>
              {confirmButtonText}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default AlertDialog;

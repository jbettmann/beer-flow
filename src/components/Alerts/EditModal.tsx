import React, { FC, useEffect, useRef } from "react";

type EditModalProps = {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
};

const EditModal: FC<EditModalProps> = ({ title = "", children, isOpen }) => {
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
      <div className="modal-box p-5 bg-primary ">
        <div className="flex text-center flex-col alert alert-modal">
          <h4>{title}</h4>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </dialog>
  );
};

export default EditModal;

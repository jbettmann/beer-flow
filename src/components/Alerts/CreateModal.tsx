import React, { FC, useEffect, useRef } from "react";

type CreateModalProps = {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
};

const CreateModal: FC<CreateModalProps> = ({
  title = "Create",
  children,
  isOpen,
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
    <dialog ref={modalRef} id="alert_modal" className="modal modal-middle">
      <div className="modal-box pt-0 px-1 pb-4 bg-primary text-background ">
        <div className="flex flex-col  items-center w-full">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </dialog>
  );
};

export default CreateModal;

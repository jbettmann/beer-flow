import React, { FC, useEffect, useRef } from "react";

type SearchModalProps = {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
};

const SearchModal: FC<SearchModalProps> = ({
  title = "",
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
    <dialog
      ref={modalRef}
      id="alert_modal"
      className="modal modal-middle bg-primary/50  "
    >
      <div className=" w-1/2 overflow-y-auto bg-transparent absolute top-1/3 h-fit max-h-[32rem] transition-all ease-in-out">
        <div className="w-full p-0">{children}</div>
      </div>
    </dialog>
  );
};

export default SearchModal;

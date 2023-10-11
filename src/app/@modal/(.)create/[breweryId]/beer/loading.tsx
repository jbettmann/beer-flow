import BeerCardLS from "@/components/LoadingSkeleton/BeerCardLS";
import Modal from "@/components/Modal";
import React from "react";

type Props = {};

const loading = (props: Props) => {
  return (
    <Modal closeButtonOnly={true}>
      <BeerCardLS />
    </Modal>
  );
};

export default loading;

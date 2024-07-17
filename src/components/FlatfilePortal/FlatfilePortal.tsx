"use client";
import React from "react";
import blueprint from "../../flatfile/blueprint";
import { Sheet, useFlatfile } from "@flatfile/react";
type Props = {};

const FlatfilePortal = () => {
  const { openPortal } = useFlatfile();

  return (
    <>
      <button className="btn btn-outline" onClick={openPortal}>
        Open Portal!
      </button>
      <Sheet
        config={blueprint}
        onSubmit={async ({ sheet }) => {
          const data = await sheet.allData();
          console.log("onSubmit", data);
        }}
      />
    </>
  );
};

export default FlatfilePortal;

import React from "react";

type Props = {
  breweryId: string;
};

const SingleBreweryPage = ({ breweryId }: Props) => {
  return <div>{breweryId}</div>;
};

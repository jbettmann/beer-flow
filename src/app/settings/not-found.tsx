import Link from "next/link";
import React from "react";

// default name and page for not found dynamic page
export default function NotFound() {
  return (
    <div>
      Could not access setting at this time. Return to
      <Link className="link" href={"/breweries"}>
        {" "}
        Breweries
      </Link>
    </div>
  );
}

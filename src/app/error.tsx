"use client";

import Link from "next/link";

const error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
      <Link href={"/"}>Go Back Home</Link>
    </div>
  );
};

export default error;

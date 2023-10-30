"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";
const error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="mt-20 w-full mx-auto px-2 sm:px-12">
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
      <Link href={"/"}>
        <MoveLeft size={24} />
      </Link>
    </div>
  );
};

export default error;

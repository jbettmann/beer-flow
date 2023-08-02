"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";
const error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
      <Link href={"/"}>
        <MoveLeft size={24} />
      </Link>
    </div>
  );
};

export default error;

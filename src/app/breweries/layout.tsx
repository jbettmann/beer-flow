import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { compareSync } from "bcrypt";

export default async function BreweriesLayout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div>
      {props.children}
      {props.modal}
    </div>
  );
}

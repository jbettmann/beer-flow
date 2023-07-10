"use client";
import BreweryForm from "@/components/BreweryForm";
import Modal from "@/components/Modal";
import { FormInput } from "lucide-react";

type Props = {};

export default async function CreateBrewery(props: Props) {
  return (
    <Modal closeButtonOnly={true}>
      <BreweryForm />
    </Modal>
  );
}

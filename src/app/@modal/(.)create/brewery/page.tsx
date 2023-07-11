"use client";
import CreateBreweryForm from "@/components/CreateBreweryForm";
import Modal from "@/components/Modal";
import { FormInput } from "lucide-react";

type Props = {};

export default async function CreateBrewery(props: Props) {
  return (
    <Modal closeButtonOnly={true}>
      <CreateBreweryForm />
    </Modal>
  );
}

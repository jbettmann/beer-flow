"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

type Props = {};

const AdminPage: React.FC<Props> = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      console.error("No file selected");
      alert("No file selected");
      return;
    }

    // upload image
    const filename = `${uuidv4()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("Images")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log(data, error);
    // const filepath = data.path;
    // save filepath in database
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="image" onChange={handleFileSelected} />
      <button type="submit">Upload image</button>
    </form>
  );
};

export default AdminPage;

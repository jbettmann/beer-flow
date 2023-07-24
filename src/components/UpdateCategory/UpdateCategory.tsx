"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import handleUpdateBeer from "@/lib/handleSubmit/handleUpdateBeer";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";

import ErrorField from "../ErrorField/ErrorField";

import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { updateImage } from "@/lib/supabase/updateImage";
import validateFields from "@/lib/validators/forms";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import DeleteBeerButton from "../Buttons/DeleteBeerButton";
import { ErrorValues, FormValues, RefsType } from "./types";
import { Category } from "@/app/types/category";
import useSWRMutation from "swr/mutation";
import updateCategory from "@/lib/PUT/updateCategory";
// import createBeer from "@/lib/createBeer";

type pageProps = {
  breweryId: string;
  categoryId: string;
};

const UpdateCategory = ({ breweryId, categoryId }: pageProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  // const { trigger } = useSWRMutation(
  //   `https://beer-bible-api.vercel.app/categories/${categoryId}`,
  //   updateCategory,
  //   { revalidate: true }
  // );
  const { selectedBrewery } = useBreweryContext();

  const [values, setValues] = useState<FormValues>({
    __v: undefined,
    _id: "",
    name: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState(null);

  const isSubmitting = useRef(false);

  // Create a map that connects field names to their refs
  const fieldRefs: RefsType = {
    name: useRef<HTMLInputElement>(null),
  };

  // updated beer card state and isEditing to false

  // Validate fields and persist state on every render
  useEffect(() => {
    const selectedCat = selectedBrewery?.categories?.find(
      (category) => category._id === categoryId
    );
    if (selectedCat) {
      setValues({
        _id: selectedCat?._id,
        name: selectedCat?.name,
      });
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    isSubmitting.current = true;
    // Mark all fields as touched
    setTouched({
      name: true,
    });

    // Don't submit if there are validation errors
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const errorContainer = fieldRefs[firstErrorKey].current;
      if (errorContainer) {
        const { top } = errorContainer.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + top - 30, // Adjust the scroll position as needed
          behavior: "smooth",
        });
      }
      isSubmitting.current = false;
      return;
    }

    setIsLoading(true); // Set loading state to true

    try {
      let updatedCategory: FormValues = values;

      const updatedCatRes = await updateCategory({
        updatedCategory,
        categoryId,
        token: session?.user?.accessToken,
      });

      if (updatedCatRes) {
        const catIndex = selectedBrewery?.categories.findIndex(
          (b) => b._id === updatedCategory._id
        );
        // Replace the beer at that index with the updated beer
        const updatedCategories = [...selectedBrewery?.categories];
        updatedCategories[catIndex] = updatedCatRes;

        // forced revalidation of the beers
        mutate(updatedCatRes);
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      isSubmitting.current = false;
      setIsLoading(false); // Set loading state to false
    }
  };

  // Define a new state to track "touched" status for each field
  const [touched, setTouched] = useState<{ [K in keyof FormValues]: boolean }>({
    name: false,
  });

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" p-4 form flex flex-col justify-between mx-auto rounded-lg shadow-2xl text-white"
    >
      {/* Name */}
      <div className="container-create__form">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          ref={fieldRefs.name}
          className="form__input"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          onBlur={handleBlur("name")}
        />
        {touched.name && errors.name && <ErrorField message={errors.name} />}
      </div>

      <div className="flex justify-between">
        {submitError && <div>Error: {submitError}</div>}
        {/* <DeleteBeerButton
          isSubmitting={isSubmitting}
          beer={beer}
          breweryId={brewery?._id}
          token={session?.user.accessToken}
          mutate={mutate}
        /> */}

        <button
          className="create__btn"
          type="submit"
          disabled={isSubmitting.current}
        >
          {isLoading ? (
            <span className="loading loading-spinner text-accent"></span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
};
export default UpdateCategory;

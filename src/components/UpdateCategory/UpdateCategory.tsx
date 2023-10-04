"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";

import ErrorField from "../ErrorField/ErrorField";

import { Brewery } from "@/app/types/brewery";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { handleDeleteCategory } from "@/lib/handleSubmit/handleDeleteCategory";
import handleUpdateCategory from "@/lib/handleSubmit/handleUpdateCategory";
import { useRouter } from "next/navigation";
import DeleteBeerButton from "../Buttons/DeleteBeerButton";
import { ErrorValues, FormValues, RefsType } from "./types";
// import createBeer from "@/lib/createBeer";

type pageProps = {
  breweryId: string;
  categoryId: string;
};

type RefsType = {
  [key: string]: React.RefObject<HTMLInputElement>;
  name: React.RefObject<HTMLInputElement>;
};

const UpdateCategory = ({ breweryId, categoryId }: pageProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const {
    selectedBrewery,
    setSelectedBrewery,
    selectedBeers,
    setSelectedBeers,
  } = useBreweryContext();

  const [values, setValues] = useState<Category>({
    __v: "",
    _id: "",
    name: "",
  });
  // Define a new state to track "touched" status for each field
  const [touched, setTouched] = useState<{ [K in keyof FormValues]: boolean }>({
    name: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        _id: selectedCat._id || "",
        name: selectedCat?.name,
      });
    }
  }, [selectedBrewery]);

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
      let updatedCategory: Category = values;

      await handleUpdateCategory({
        categoryId,
        updatedCategory,
        accessToken: session?.user?.accessToken,
        setBreweryState: {
          selectedBeers,
          selectedBrewery,
          setSelectedBeers,
          setSelectedBrewery,
        },
      });

      router.back();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      isSubmitting.current = false;
      setIsLoading(false); // Set loading state to false
    }
  };

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  const handleDelete = async () => {
    isSubmitting.current = true;
    setIsLoading(true); // Set loading state to true
    try {
      if (selectedBeers && selectedBrewery && session) {
        const updatedBreweryCat = await handleDeleteCategory({
          categoryId,
          breweryId,
          selectedBeers,
          selectedBrewery,
          token: session?.user?.accessToken,
        });
        router.back();
        // if !updatedBreweryCat then state doesnt get set
        if (updatedBreweryCat) setSelectedBrewery(updatedBreweryCat as Brewery);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      isSubmitting.current = false;
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 form flex flex-col justify-between mx-auto rounded-lg shadow-2xl text-white"
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
        <DeleteBeerButton
          isSubmitting={isSubmitting}
          handleDelete={handleDelete}
        />

        <button
          className="create-btn"
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

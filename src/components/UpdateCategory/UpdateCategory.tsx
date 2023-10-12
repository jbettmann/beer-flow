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
import { ErrorValues, FormValues } from "./types";
import SaveButton from "../Buttons/SaveButton";
import { useToast } from "@/context/toast";
import { X } from "lucide-react";
// import createBeer from "@/lib/createBeer";

type Props = {
  category: Category | undefined;
  onClose: () => void;
};

type RefsType = {
  [key: string]: React.RefObject<HTMLInputElement>;
  name: React.RefObject<HTMLInputElement>;
};

const UpdateCategory = ({ category, onClose }: Props) => {
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

  const [initialName, setInitialName] = useState<string>(category?.name || "");
  const [hasEdited, setHasEdited] = useState<boolean>(false);

  const { addToast } = useToast();

  // Create a map that connects field names to their refs
  const fieldRefs: RefsType = {
    name: useRef<HTMLInputElement>(null),
  };

  // updated beer card state and isEditing to false

  // Validate fields and persist state on every render

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

      return;
    }
    if (values.name.trim() !== initialName) {
      setIsLoading(true); // Set loading state to true

      try {
        let updatedCategory: Category = values;
        if (category) {
          const updatedCatName = await handleUpdateCategory({
            categoryId: category._id,
            updatedCategory,
            accessToken: session?.user?.accessToken,
            setBreweryState: {
              selectedBeers,
              selectedBrewery,
              setSelectedBeers,
              setSelectedBrewery,
            },
          });

          if (updatedCatName) {
            addToast(`Category ${updatedCatName.name} updated`, "success");
            router.back();
          }
        }
      } catch (err: any) {
        console.error(err);
        addToast(`Unable to rename category. Try again later`, "error");
        setSubmitError(err.message);
      } finally {
        setIsLoading(false); // Set loading state to false
        onClose();
      }
    } else {
      onClose();
    } // no change made
  };

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  useEffect(() => {
    const selectedCat = selectedBrewery?.categories?.find(
      (cat) => cat._id === category?._id
    );
    if (selectedCat) {
      setValues({
        _id: selectedCat._id || "",
        name: selectedCat?.name,
      });
    }
  }, [selectedBrewery]);

  return (
    <div className="flex flex-col justify-center items-center z-50 text-background my-auto ">
      <div className="flex w-full h-full justify-between items-center p-3 lg:hidden">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (hasEdited) {
              setValues({ ...values, name: initialName });
              setHasEdited(false);
            }
          }}
          className="btn btn-ghost "
        >
          <X size={24} />
        </button>
        <h4>Edit Category Name</h4>
        <SaveButton
          isLoading={isLoading}
          type="submit"
          onClick={handleSubmit}
          className={`ghost`}
          disabled={!hasEdited}
        />
      </div>
      <form className="p-4 form flex flex-col justify-between mx-auto rounded-lg text-white lg:w-3/4 lg:p-0">
        {/* Name */}
        <div className="container-create__form text-left ">
          <label
            className="label-text text-background pl-3 lg:hidden"
            htmlFor="name"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            ref={fieldRefs.name}
            className="form__input text-center "
            value={values.name}
            onChange={(e) => {
              setValues({ ...values, name: e.target.value });
              setHasEdited(true);
            }}
            onBlur={handleBlur("name")}
          />
          {touched.name && errors.name && <ErrorField message={errors.name} />}
        </div>

        <div className="flex justify-between p-3 lg:mt-2 lg:pb-0  ">
          {submitError && <div>Error: {submitError}</div>}
          <div className=" hidden lg:flex justify-between items-center w-full">
            {submitError && <div>Error: {submitError}</div>}

            <button
              className="btn border-none bg-transparent hover:bg-background hover:text-primary text-background"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>

            <SaveButton
              isLoading={isLoading}
              type="submit"
              onClick={handleSubmit}
              className=" ml-2 inverse"
              disabled={!hasEdited}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
export default UpdateCategory;

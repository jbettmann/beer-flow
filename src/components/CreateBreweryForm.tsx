"use client";
import saveImage from "@/lib/supabase/saveImage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";

import createBrewery from "@/lib/createBrewery";
import ErrorField from "./ErrorField/ErrorField";
import SaveButton from "./Buttons/SaveButton";
import { X } from "lucide-react";

interface FormValues {
  companyName: string;
  image: File | null | string;
}

interface ErrorValues {
  companyName?: string;
  image?: string;
}

type Props = {
  onClose: () => void;
};

// Utility function to validate form fields
const validateFields = (values: FormValues) => {
  const errors: ErrorValues = {};

  // validate companyName
  if (!values.companyName) {
    errors.companyName = "Company Name is required.";
  }
  if (values.companyName && values.companyName.length < 2) {
    errors.companyName = "Company Name must be at least 2 characters long.";
  }

  return errors;
};

const CreateBreweryForm = ({ onClose }: Props) => {
  const [values, setValues] = useState<FormValues>({
    companyName: "",
    image: null,
  });
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasCreated, setHasCreated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isSubmitting = useRef(false);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  // Load persisted state on initial render
  useEffect(() => {
    const persistedState = sessionStorage.getItem("breweryForm");
    if (persistedState) {
      setValues(JSON.parse(persistedState));
    }
  }, []);

  // Validate fields and persist state on every render
  useEffect(() => {
    setErrors(validateFields(values));
    sessionStorage.setItem("breweryForm", JSON.stringify(values));
    // Clear the error message when the form fields change
    setSubmitError(null);
  }, [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Don't submit if there are validation errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    isSubmitting.current = true;

    try {
      const companyImage = values.image
        ? await saveImage({ file: values.image } as any)
        : undefined;

      const newBrewery = {
        companyName: values.companyName,
        image: companyImage,
      };

      const responseBrewery = (await createBrewery({
        brewery: newBrewery,
        accessToken: session?.user?.accessToken as string,
      })) as any;

      setValues({ companyName: "", image: null });
      onDismiss();

      await update({
        newBreweryId: responseBrewery.savedBrewery._id,
      });
      router.push(`/breweries/${responseBrewery.savedBrewery._id}`);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      isSubmitting.current = false;
    }
  };

  // Define a new state to track "touched" status for each field
  const [touched, setTouched] = useState<{ [K in keyof FormValues]: boolean }>({
    companyName: false,
    image: false,
  });

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  return (
    <div className="flex flex-col justify-center items-center z-50 text-background my-auto ">
      <div className="flex w-full h-full justify-between items-center p-3 lg:hidden">
        <button
          onClick={() => {
            onClose();
            if (hasCreated) {
              setHasCreated(false);
            }
          }}
          className="btn btn-ghost "
        >
          <X size={24} />
        </button>
        <h4>Create Brewery</h4>
        <SaveButton
          isLoading={isLoading}
          type="submit"
          className={`ghost`}
          disabled={!hasCreated}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 form flex flex-col justify-between mx-auto rounded-lg text-white lg:w-3/4 lg:p-0"
      >
        <div className="flex flex-col items-center p-6 pt-7 w-full">
          <h5>Image</h5>
          <div className="relative w-32 h-32">
            {" "}
            {/* Set a fixed size for responsiveness */}
            <label
              className="absolute top-0 left-0 w-full h-full rounded-full border border-background bg-gray-200"
              htmlFor="image"
            >
              {/* You can add a spinner or any loading animation here */}
            </label>
          </div>

          <input
            id="image"
            name="image"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (file && file.size > 2 * 1024 * 1024) {
                // Check if file size is greater than 2MB
                alert("File is too large. Please select a file less than 2MB.");
                e.target.value = ""; // Clear the selected file
              } else {
                setValues({
                  ...values,
                  image: file,
                });
              }
            }}
            onBlur={handleBlur("image")}
          />
          {touched.image && errors.image && (
            <ErrorField message={errors.image} />
          )}
        </div>
        <div className="text-center mt-10 w-full sm:w-1/2 lg:w-fit">
          <label className="beer-card__label-text" htmlFor="companyName">
            Company Name
          </label>
          <input
            id="companyName"
            name="companyName"
            className="form__input w -full !font-bold !text-2xl text-primary text-center focus:outline-none "
            placeholder="Company Name"
            value={values.companyName}
            onChange={(e) =>
              setValues({ ...values, companyName: e.target.value })
            }
            onBlur={handleBlur("companyName")}
          />
          {touched.companyName && errors.companyName && (
            <ErrorField message={errors.companyName} />
          )}
        </div>
        <div>
          {submitError && <div>Error: {submitError}</div>}
          <button
            className="create-btn"
            type="submit"
            disabled={isSubmitting.current}
          >
            Create Brewery
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBreweryForm;

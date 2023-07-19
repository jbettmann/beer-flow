"use client";
import saveImage from "@/lib/supabase/saveImage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

import createBrewery from "@/lib/createBrewery";
import ErrorField from "./ErrorField/ErrorField";

interface FormValues {
  companyName: string;
  image: File | null | string;
}

interface ErrorValues {
  companyName?: string;
  image?: string;
}

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

  // validate image
  if (!values.image) {
    errors.image = "Image is required.";
  }

  return errors;
};

const CreateBreweryForm: React.FC = () => {
  const [values, setValues] = useState<FormValues>({
    companyName: "",
    image: null,
  });
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        ? await saveImage({ file: values.image })
        : undefined;

      const newBrewery = {
        companyName: values.companyName,
        image: companyImage,
      };

      const responseBrewery = await createBrewery({
        brewery: newBrewery,
        accessToken: session?.user?.accessToken,
      });

      setValues({ companyName: "", image: null });
      onDismiss();

      await update({
        newBreweryId: responseBrewery.savedBrewery._id,
      });
      router.push(`/breweries/${responseBrewery.savedBrewery._id}`);
    } catch (err) {
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
    <form
      onSubmit={handleSubmit}
      className="form bg-slate-100 p-12 justify-between"
    >
      <div>
        <label htmlFor="companyName">Company Name:</label>
        <input
          id="companyName"
          name="companyName"
          className="form__input "
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
        <label htmlFor="image">Image:</label>
        <input
          id="image"
          name="image"
          type="file"
          className="form__input-file"
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
        {touched.image && errors.image && <ErrorField message={errors.image} />}
      </div>
      <div>
        {submitError && <div>Error: {submitError}</div>}
        <button
          className="create__btn"
          type="submit"
          disabled={isSubmitting.current}
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default CreateBreweryForm;

"use client";
import saveImage from "@/lib/saveImage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tag, WithContext as Tags } from "react-tag-input";

// import createBeer from "@/lib/createBeer";

// Utility function to validate form fields
const validateFields = (values: FormValues) => {
  const errors: ErrorValues = {};

  // validate name
  if (!values.name || values.name.length < 3) {
    errors.name = "Name is required and must be at least 3 characters long.";
  }

  // validate style
  if (!values.style) {
    errors.style = "Style is required.";
  }

  // validate abv
  if (!values.abv) {
    errors.abv = "ABV is required.";
  } else if (!/^(\d+(\.\d{1,2})?)$/.test(values.abv)) {
    errors.abv = "ABV must be a number or decimal.";
  }

  // validate category
  if (!values.category) {
    errors.category = "A category is required.";
  }

  // ...continue with validations for other fields...

  // validate image
  if (!values.image) {
    errors.image = "Image is required.";
  }

  return errors;
};

const CreateBeerForm: React.FC = () => {
  const [values, setValues] = useState<FormValues>({
    name: "",
    abv: "",
    style: "",
    malt: [],
    hops: [],
    description: "",
    category: [],
    nameSake: "",
    notes: "",
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
    const persistedState = sessionStorage.getItem("beerForm");
    if (persistedState) {
      setValues(JSON.parse(persistedState));
    }
  }, []);

  // Validate fields and persist state on every render
  useEffect(() => {
    setErrors(validateFields(values));
    sessionStorage.setItem("beerForm", JSON.stringify(values));
    // Clear the error message when the form fields change
    setSubmitError(null);
  }, [values]);

  //  Handle tag deletions
  const handleHopDelete = (i: number) => {
    setValues({
      ...values,
      hops: values.hops.filter((_, index) => index !== i),
    });
  };
  // Handle tag additions
  const handleAddition = (name: keyof FormValues) => (newTags: Tag) => {
    setValues({ ...values, [name]: [...(values[name] as Tag[]), newTags] });
  };

  // Key codes for enter and comma
  const KeyCodes = {
    comma: 188,
    enter: 13,
  };
  const delimiters = [KeyCodes.comma, KeyCodes.enter];

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Don't submit if there are validation errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    isSubmitting.current = true;

    try {
      const beerImage = values.image
        ? await saveImage({ file: values.image })
        : undefined;

      const newBeer = {
        ...values,
        image: beerImage,
      };

      const responseBeer = await createBeer({
        beer: newBeer,
        accessToken: session?.user?.accessToken,
      });

      setValues({
        name: "",
        abv: "",
        style: "",
        malt: [],
        hops: [],
        description: "",
        category: [],
        nameSake: "",
        notes: "",
        image: null,
      });
      sessionStorage.removeItem("beerForm"); // Remove the saved form
      onDismiss();

      // await update({
      //   newBeerId: responseBeer.savedBeer._id,
      // });
      // router.push(`/beers/${responseBeer.savedBeer._id}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      isSubmitting.current = false;
    }
  };

  // Define a new state to track "touched" status for each field
  const [touched, setTouched] = useState<{ [K in keyof FormValues]: boolean }>({
    name: false,
    abv: false,
    style: false,
    malt: false,
    hops: false,
    description: false,
    category: false,
    nameSake: false,
    notes: false,
    image: false,
  });

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-100 h-40 flex flex-col justify-between"
    >
      {/* Name */}
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          placeholder="Name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          onBlur={handleBlur("name")}
        />
        {touched.name && errors.name && <div>{errors.name}</div>}
      </div>

      {/* Style */}
      <div>
        <label htmlFor="name">Style:</label>
        <input
          id="style"
          name="style"
          placeholder="Beer Style"
          value={values.style}
          onChange={(e) => setValues({ ...values, style: e.target.value })}
          onBlur={handleBlur("style")}
        />
        {touched.style && errors.style && <div>{errors.style}</div>}
      </div>

      {/* ABV */}
      <div>
        <label htmlFor="abv">ABV:</label>
        <input
          id="abv"
          name="abv"
          placeholder="ABV"
          pattern="\d+(\.\d{1,2})?"
          value={values.abv}
          onChange={(e) => {
            // Ensure input value is only numbers or decimal
            if (e.target.validity.valid || e.target.value === "") {
              setValues({ ...values, abv: e.target.value });
            }
          }}
          onBlur={handleBlur("abv")}
        />
        {touched.abv && errors.abv && <div>{errors.abv}</div>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="name">Description:</label>
        <textarea
          id="description"
          name="description"
          placeholder="Description"
          value={values.description}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          onBlur={handleBlur("description")}
        />
        {touched.description && errors.description && (
          <div>{errors.description}</div>
        )}
      </div>

      {/* Hops */}
      <div>
        <label htmlFor="hops">Hops:</label>
        <Tags
          id="hops"
          name="hops"
          placeholder="Enter hops and press enter"
          tags={values.hops}
          delimiters={delimiters}
          handleAddition={handleAddition("hops")}
          handleDelete={handleHopDelete}
        />
      </div>
      {/* Add similar input fields for the other properties */}

      <div>
        <label htmlFor="image">Image:</label>
        <input
          id="image"
          name="image"
          type="file"
          onChange={(e) =>
            setValues({
              ...values,
              image: e.target.files ? e.target.files[0] : null,
            })
          }
          onBlur={handleBlur("image")}
        />
        {touched.image && errors.image && <div>{errors.image}</div>}
      </div>
      <div>
        {submitError && <div>Error: {submitError}</div>}
        <button type="submit" disabled={isSubmitting.current}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default CreateBeerForm;

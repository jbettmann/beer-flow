"use client";
import { Brewery } from "@/app/types/brewery";
import saveImage from "@/lib/saveImage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import TagInput from "../TagInput/TagInput";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import { ErrorValues, FormValues } from "./types";
import createCategory from "@/lib/createCategory";
import { Category, NewCategory } from "@/app/types/category";
import createBeer from "@/lib/createBeer";
import { Console } from "console";

// import createBeer from "@/lib/createBeer";

type pageProps = {
  brewery: Brewery;
};

// Utility function to validate form fields
const validateFields = (values: FormValues) => {
  const errors: ErrorValues = {};

  // validate name

  if (!values.name || values.name.trim() === "") {
    errors.name = "Name is required.";
  }

  // validate style
  if (!values.style || values.style.trim() === "") {
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

const CreateBeerForm = ({ brewery }: pageProps) => {
  const [values, setValues] = useState<FormValues>({
    name: "",
    abv: "",
    ibu: "",
    style: "",
    malt: [],
    hops: [],
    description: "",
    category: [],
    nameSake: "",
    notes: "",
    image: null,
    releasedOn: "",
    archived: false,
  });

  console.log({ brewery });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isSubmitting = useRef(false);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);
  console.log({ brewery });
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
    console.log({ values });
  }, [values]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Don't submit if there are validation errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true); // Set loading state to true

    try {
      // Save the image to the database and create link
      const beerImage = values.image
        ? await saveImage({ file: values.image })
        : undefined;

      // Converting brewery categories to a Set for O(1) lookup times
      const existingCategories = new Set(
        brewery.categories.map((cat) => cat.name)
      );

      // Only include categories that are not already in the brewery's categories
      const newCategories = values.category.filter(
        (category: { value: string }) => !existingCategories.has(category.value)
      );

      console.log({ newCategories, existingCategories });

      // Call createCategory for each new category
      const createNewCategories = await Promise.all(
        newCategories.map((category) => {
          const newCategory = { name: category.value };
          return createCategory({
            newCategory,
            breweryId: brewery._id,
            accessToken: session?.user?.accessToken,
          });
        })
      );
      console.log({ createNewCategories });

      const newBeer = {
        ...values,
        hops: values.hops.map((hop) => hop.name),
        malt: values.malt.map((malt) => malt.name),
        category: createNewCategories.map((category: Category) => category._id),
        image: beerImage,
      };
      console.log({ newBeer });

      const newBeerRes = await createBeer({
        newBeer,
        breweryId: brewery._id,
        accessToken: session?.user?.accessToken,
      });

      console.log({ newBeerRes });
      setValues({
        name: "",
        abv: "",
        ibu: "",
        style: "",
        malt: [],
        hops: [],
        description: "",
        category: [],
        nameSake: "",
        notes: "",
        image: null,
        releasedOn: "",
        archived: false,
      });
      sessionStorage.removeItem("beerForm"); // Remove the saved form
      onDismiss();

      // router.push(`/beers/${newBeerRes.savedBeer._id}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      isSubmitting.current = false;
      setIsLoading(false); // Set loading state to false
    }
  };

  // Define a new state to track "touched" status for each field
  const [touched, setTouched] = useState<{ [K in keyof FormValues]: boolean }>({
    name: false,
    abv: false,
    ibu: false,
    style: false,
    malt: false,
    hops: false,
    description: false,
    category: false,
    nameSake: false,
    notes: false,
    image: false,
    releasedOn: false,
    archived: false,
  });

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-800 h-fit p-4  flex flex-col justify-between mx-auto rounded-lg shadow-2xl text-white"
    >
      {/* Name */}
      <div className="container-create__form">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          className="form__input"
          placeholder="Beer name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          onBlur={handleBlur("name")}
        />
        {touched.name && errors.name && <div>{errors.name}</div>}
      </div>

      {/* Style */}
      <div className="container-create__form">
        <label htmlFor="style">Style</label>
        <input
          id="style"
          name="style"
          className="form__input"
          placeholder="West Coast IPA, Pilsner, Swchwarzbier..."
          value={values.style}
          onChange={(e) => setValues({ ...values, style: e.target.value })}
          onBlur={handleBlur("style")}
        />
        {touched.style && errors.style && <div>{errors.style}</div>}
      </div>

      {/* ABV */}
      <div className="container-create__form">
        <label htmlFor="abv">ABV %</label>
        <input
          id="abv"
          name="abv"
          type="number"
          step="0.01"
          min={0}
          className="form__input"
          placeholder="ABV %"
          value={values.abv}
          onChange={(e) => {
            setValues({ ...values, abv: parseFloat(e.target.value) });
          }}
          onBlur={handleBlur("abv")}
        />
        {touched.abv && errors.abv && <div>{errors.abv}</div>}

        {/* IBUs   */}
        <label htmlFor="ibu">IBUs</label>
        <input
          id="ibu"
          name="ibu"
          type="number"
          step="1"
          min={0}
          className="form__input"
          placeholder="33, 70, 90..."
          value={values.ibu}
          onChange={(e) => {
            setValues({ ...values, ibu: parseFloat(e.target.value) });
          }}
          onBlur={handleBlur("ibu")}
        />
      </div>

      <CategorySelect
        setValues={setValues}
        selectedValues={values.category}
        categories={brewery?.categories?.map((cat) => ({
          label: cat.name,
          value: cat.name,
        }))}
      />

      {/* Description */}
      <div className="container-create__form">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form__input-textarea"
          placeholder="Description"
          value={values.description}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          maxLength={2500}
        />
      </div>

      {/* Name Details */}
      <div className="container-create__form">
        <label htmlFor="nameSake">Name Details</label>
        <textarea
          id="nameSake"
          name="nameSake"
          className="form__input-textarea"
          placeholder="Let staff know about any fun deets..."
          value={values.nameSake}
          onChange={(e) => setValues({ ...values, nameSake: e.target.value })}
          maxLength={2500}
        />
      </div>

      {/* Hops */}
      <TagInput
        valueInput={"hops"}
        values={values}
        setValues={setValues}
        tags={values.hops}
        suggestions={hopSuggestions}
      />

      {/* Malt */}
      <TagInput
        valueInput={"malt"}
        values={values}
        setValues={setValues}
        tags={values.malt}
        suggestions={maltSuggestions}
      />

      {/* Release Date */}
      <div className="container-create__form">
        <label htmlFor="releasedOn">Release Date</label>
        <input
          id="releasedOn"
          name="releasedOn"
          type="date"
          className="form__input"
          placeholder="Beer release date"
          value={values.releasedOn}
          onChange={(e) => setValues({ ...values, releasedOn: e.target.value })}
        />
      </div>

      {/* Archived */}
      <div className="container-create__form">
        <label htmlFor="archived">Archive</label>
        <input
          id="archived"
          name="archived"
          type="checkbox"
          className="checkbox-accent"
          placeholder="Beer release date"
          checked={values.archived}
          onChange={(e) => setValues({ ...values, archived: e.target.checked })}
        />
      </div>

      {/* Other Notes */}
      <div className="container-create__form">
        <label htmlFor="notes">Other notess</label>
        <textarea
          id="notes"
          name="notes"
          className="form__input-textarea"
          placeholder="Additional info... barrels aged in, collaboration, etc."
          value={values.notes}
          onChange={(e) => setValues({ ...values, notes: e.target.value })}
          maxLength={2500}
        />
      </div>

      {/*  Beer Image */}
      <div className="container-create__form">
        <label htmlFor="image">Image</label>
        <input
          id="image"
          name="image"
          className="file-input file-input-bordered file-input-accent w-full max-w-xs text-black"
          type="file"
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
          disabled={values.name && values.category ? false : true}
          onBlur={handleBlur("image")}
        />
        {touched.image && errors.image && <div>{errors.image}</div>}
      </div>
      <div>
        {submitError && <div>Error: {submitError}</div>}
        <button
          className="btn btn-accent"
          type="submit"
          disabled={isSubmitting.current}
        >
          {isLoading ? (
            <span className="loading loading-spinner text-accent"></span>
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateBeerForm;

"use client";
import { Brewery } from "@/app/types/brewery";
import handleCreateBeer from "@/lib/handleSubmit/handleCreateBeer";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import validateFields from "@/lib/validators/forms";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import ErrorField from "../ErrorField/ErrorField";
import TagInput from "../TagInput/TagInput";
import { ErrorValues, FormValues, RefsType } from "./types";
import { useSession } from "next-auth/react";

// import createBeer from "@/lib/createBeer";

type pageProps = {
  brewery?: Brewery;
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

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isSubmitting = useRef(false);

  // Create a map that connects field names to their refs
  const fieldRefs: RefsType = {
    name: useRef<HTMLInputElement>(null),
    abv: useRef<HTMLInputElement>(null),
    category: useRef<HTMLInputElement>(null),
    style: useRef<HTMLInputElement>(null),
    image: useRef<HTMLInputElement>(null),
  };

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
    console.log({ values, errors, touched });
  }, [values]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    isSubmitting.current = true;
    // Mark all fields as touched
    setTouched({
      name: true,
      abv: true,
      ibu: true,
      style: true,
      malt: true,
      hops: true,
      description: true,
      category: true,
      nameSake: true,
      notes: true,
      image: true,
      releasedOn: true,
      archived: true,
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
      await handleCreateBeer(values, brewery, session?.user?.accessToken);

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
    } catch (err) {
      // router.push(`/beers/${newBeerRes.savedBeer._id}`);
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
          placeholder="Beer name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          onBlur={handleBlur("name")}
        />
        {touched.name && errors.name && <ErrorField message={errors.name} />}
      </div>

      {/* Style */}
      <div className="container-create__form">
        <label htmlFor="style">Style</label>
        <input
          id="style"
          name="style"
          ref={fieldRefs.style}
          className="form__input"
          placeholder="West Coast IPA, Pilsner, Swchwarzbier..."
          value={values.style}
          onChange={(e) => setValues({ ...values, style: e.target.value })}
          onBlur={handleBlur("style")}
        />
        {touched.style && errors.style && <ErrorField message={errors.style} />}
      </div>

      {/* ABV */}
      <div className="container-create__form">
        <label htmlFor="abv">ABV %</label>
        <input
          id="abv"
          name="abv"
          ref={fieldRefs.abv}
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
        {touched.abv && errors.abv && <ErrorField message={errors.abv} />}

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

      {/* Categories  */}
      <div ref={fieldRefs.category}>
        <CategorySelect
          setValues={setValues}
          selectedValues={values.category}
          categories={brewery?.categories?.map((cat) => ({
            label: cat.name,
            value: cat.name,
          }))}
          handleBlur={handleBlur}
        />
        {touched.category && errors.category && (
          <ErrorField message={errors.category} />
        )}
      </div>

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
          ref={fieldRefs.image}
          className="form__input-file w-full max-w-xs text-black"
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
        {touched.image && errors.image && <ErrorField message={errors.image} />}
      </div>
      <div>
        {submitError && <div>Error: {submitError}</div>}
        <button
          className="create__btn"
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

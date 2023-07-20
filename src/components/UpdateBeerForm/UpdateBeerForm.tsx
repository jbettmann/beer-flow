"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import { getImagePublicURL } from "@/lib/utils";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import ErrorField from "../ErrorField/ErrorField";
import TagInput from "../TagInput/TagInput";
import { ErrorValues, FormValues, RefsType } from "../CreateBeerForm/types";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import handleUpdateBeer from "@/lib/handleSubmit/handleUpdateBeer";
import { useSession } from "next-auth/react";
import { revalidatePath } from "next/cache";

import { set } from "mongoose";
import { updateImage } from "@/lib/supabase/updateImage";
import { useBreweryContext } from "@/context/brewery-beer";
import useSWR from "swr";
import getBreweryBeers from "@/lib/getBreweryBeers";

// import createBeer from "@/lib/createBeer";

type pageProps = {
  brewery?: Brewery;
  beer?: Beer;
};

const UpdateBeerForm = ({ brewery, beer }: pageProps) => {
  const { data: session } = useSession();

  const {
    data: allBeers,
    error: beersError,
    mutate,
  } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${brewery._id}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );

  const [values, setValues] = useState<FormValues>({
    _id: beer?._id || "",
    name: beer?.name || "",
    abv: beer?.abv || "",
    ibu: beer?.ibu || "",
    style: beer?.style || "",
    malt: beer?.malt.map((item) => ({ id: item, name: item })) || [],
    hops: beer?.hops.map((item) => ({ id: item, name: item })) || [],
    description: beer?.description || "",
    category:
      beer?.category.map((cat) => ({
        label: cat.name,
        value: cat.name,
      })) || [],
    nameSake: beer?.nameSake || "",
    notes: beer?.notes || "",
    image: beer?.image || null,
    releasedOn: beer?.releasedOn || "",
    archived: beer?.archived || false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);

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

  useEffect(() => {
    let date = new Date(beer?.releasedOn);
    let formattedDate = `${date.getFullYear()}-${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
    setValues((prevValues: FormValues) => ({
      ...prevValues,

      releasedOn: formattedDate,
    }));
    console.log({ allBeers });
  }, []);

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
      let updatedBeer: FormValues = values;

      if (beer?.image !== values.image) {
        const newImage = await updateImage(beer.image, values.image);
        updatedBeer = { ...values, image: newImage };
      }
      const updateBeerRes = await handleUpdateBeer(
        updatedBeer,
        brewery?._id,
        session?.user?.accessToken
      );

      const beerIndex = allBeers.findIndex((b) => b._id === updatedBeer._id);

      // Replace the beer at that index with the updated beer
      const updatedBeers = [...allBeers];
      updatedBeers[beerIndex] = updateBeerRes;
      // allows hard navigation back to brewery page
      // setUpdateSuccess(true);
      mutate(updatedBeers);
      router.back();
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

  // allows hard navigation back to brewery page
  if (updateSuccess) {
    setUpdateSuccess(false);
    redirect(`/breweries/${brewery?._id}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className=" p-4 form flex flex-col justify-between mx-auto rounded-lg shadow-2xl text-white"
    >
      <div className="flex justify-around">
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
        {/*  Beer Image */}
        <div className="flex flex-col  items-center">
          {/*  Existing Beer Image */}
          {beer?.image && !previewImage && (
            <div>
              <ImageDisplay className="beer-card__image " item={beer} />
            </div>
          )}
          {/* Preview of new image */}
          {previewImage && (
            <div>
              <label>New Image:</label>
              <Image
                className="beer-card__image"
                alt="New Beer Image preview"
                src={previewImage}
                width={50}
                height={50}
              />
            </div>
          )}
          {/*  Image input field */}
          <div className="container-create__form">
            <label htmlFor="image">Image</label>
            <input
              id="image"
              name="image"
              ref={fieldRefs.image}
              className="form__input-file-sx text-black"
              type="file"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file && file.size > 2 * 1024 * 1024) {
                  // Check if file size is greater than 2MB
                  alert(
                    "File is too large. Please select a file less than 2MB."
                  );
                  e.target.value = ""; // Clear the selected file
                } else {
                  setValues({
                    ...values,
                    image: file,
                  });
                  // Generate a URL for the new image and set it as the preview
                  const url = URL.createObjectURL(file);
                  setPreviewImage(url);
                }
              }}
              disabled={values.name && values.category ? false : true}
              onBlur={handleBlur("image")}
            />
            {touched.image && errors.image && (
              <ErrorField message={errors.image} />
            )}
          </div>
        </div>
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

      <div>
        {submitError && <div>Error: {submitError}</div>}
        <button
          className="create__btn"
          type="submit"
          disabled={isSubmitting.current}
          // onClick={() => handleAction(values)}
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
export default UpdateBeerForm;

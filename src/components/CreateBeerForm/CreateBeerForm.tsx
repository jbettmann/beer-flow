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
import useSWR from "swr";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { useBreweryContext } from "@/context/brewery-beer";
import { Beer } from "@/app/types/beer";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/context/toast";
import TrashCanIcon from "../Buttons/TrashCanIcon";
import SaveButton from "../Buttons/SaveButton";
import DefaultBeerImage from "../../assets/img/beer.png";
import getSingleBrewery from "@/lib/getSingleBrewery";

type pageProps = {
  setIsCreateBeer?: (value: boolean) => void;
};

const CreateBeerForm = ({ setIsCreateBeer }: pageProps) => {
  const { data: session, status, update } = useSession();

  const { selectedBeers, selectedBrewery } = useBreweryContext();

  const { mutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${selectedBrewery?._id}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );

  const { mutate: mutateBrewery } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${selectedBrewery?._id}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [isClearing, setIsClearing] = useState<boolean>(false); // Track if form is being cleared

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

  const router = useRouter();
  const { addToast } = useToast();
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
    if (setIsCreateBeer) setIsCreateBeer(false);
    router.back();
  }, [router]);

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
      if (selectedBrewery && session?.user) {
        const newBeerRes = await handleCreateBeer(
          values,
          selectedBrewery,
          session?.user?.accessToken
        );

        if (newBeerRes) {
          // forced revalidation of the beers
          mutate([...(selectedBeers as Beer[]), newBeerRes]);
          mutateBrewery();
          handleClear(); // Clear the form
          addToast(`${newBeerRes.name} successfully created!`, "success");
          onDismiss();
        }
      }
    } catch (err: string | any) {
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

  const handleClear = () => {
    setIsClearing(true); // Set to true at the start of clearing
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

    setTouched({
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

    sessionStorage.removeItem("beerForm"); // Remove the saved form
    setPreviewImage(null);
    setIsClearing(false); // Set to false at the end of clearing
  };

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  // Load persisted state on initial render
  useEffect(() => {
    const persistedState = sessionStorage.getItem("beerForm");
    if (persistedState) {
      setValues(JSON.parse(persistedState));
    }
  }, []);

  // Validate fields and persist state on every render
  useEffect(() => {
    if (!isClearing) {
      setErrors(validateFields(values));
    }
    sessionStorage.setItem("beerForm", JSON.stringify(values));
    // Clear the error message when the form fields change
    setSubmitError(null);
  }, [values]);

  return (
    <form
      onSubmit={handleSubmit}
      className=" p-4 form flex flex-col justify-between mx-auto rounded-lg shadow-2xl"
    >
      <div className="flex w-full justify-between mb-2  md:mb-0 bg-primary py-3 sticky top-[-2px] h-10 z-20 md:z-0 md:h-auto md:bg-transparent md:block md:py-0">
        <button
          type="button"
          className="mr-auto text-sm lg:text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
        >
          Clear
        </button>
        <button
          className={`md:hidden link link-hover text-background`}
          onClick={(e) => {
            e.stopPropagation();
            setIsCreateBeer && setIsCreateBeer(false);
          }}
          type="button"
        >
          <X size={20} strokeWidth={1} />
        </button>
      </div>
      <div className="flex flex-col md:flex-row-reverse justify-between p-2 md:p-4 ">
        {/*  Beer Image */}
        <div className="flex flex-col items-center justify-between xl:items-end w-full md:w-[45%] p-2 pt-4 md:pt-2">
          <div className="flex flex-col items-center md:items-start w-full h-full max-h-[550px]">
            <label
              htmlFor="image"
              className="beer-card__label-text hover:underline hover:cursor-pointer"
            >
              Photo
            </label>
            {/*  Image input field */}
            <input
              type="file"
              id="image"
              name="image"
              ref={fieldRefs.image}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file && file.size > 2 * 1024 * 1024) {
                  // Check if file size is greater than 2MB
                  addToast(
                    "File is too large. Please select a file less than 2MB.",
                    "error"
                  );
                  e.target.value = ""; // Clear the selected file
                } else {
                  setValues({
                    ...values,
                    image: file,
                  });
                  // Generate a URL for the new image and set it as the preview
                  const url = URL.createObjectURL(file as Blob);
                  setPreviewImage(url as any);
                }
              }}
              onBlur={handleBlur("image")}
            />
            {/* Preview of new image */}
            {previewImage ? (
              <>
                <div className="flex flex-col items-center justify-center p-3 w-48 h-60 md:h-full md:w-full  relative">
                  <Image
                    className="bg-transparent border border-stone-400 rounded-xl  h-60 w-full  object-cover"
                    alt="New Beer Image preview"
                    src={previewImage as any}
                    width={50}
                    height={50}
                  />
                  <div className="absolute bottom-0 right-0 p-4 z-10">
                    <TrashCanIcon
                      onClick={() => {
                        URL.revokeObjectURL(previewImage);
                        setPreviewImage(null);
                        setValues({
                          ...values,
                          image: null,
                        });
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <label
                htmlFor="image"
                className="border border-stone-400 rounded-xl w-48 h-60 md:h-full md:w-full hover:cursor-pointer relative"
              >
                <div className="absolute border border-stone-400 flex justify-center items-center top-0 left-0 rounded-xl w-full h-full bg-primary/40">
                  <ImagePlus size={40} strokeWidth={1} />
                </div>
                <Image
                  src={DefaultBeerImage}
                  className={`w-full h-full object-cover rounded-xl`}
                  alt={"Default Beer Image"}
                  width={50}
                  height={50}
                />
              </label>
            )}

            {touched.image && errors.image && (
              <ErrorField message={errors.image} />
            )}
          </div>
          {/* Release Date */}
          <div className="flex flex-col items-center md:items-start w-full mt-4">
            <label className="beer-card__label-text " htmlFor="releasedOn">
              Release Date
            </label>
            <input
              id="releasedOn"
              name="releasedOn"
              type="date"
              className="bg-primary text-accent p-2 rounded-full border border-stone-400 lg:h-9 text-sm"
              placeholder="Beer release date"
              value={values.releasedOn as string}
              onChange={(e) =>
                setValues({ ...values, releasedOn: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex flex-col items-start justify-between w- md:w-1/2">
          {/* Name */}
          <div className="container-create__form">
            <label className="beer-card__label-text" htmlFor="name">
              Name
            </label>
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
            {touched.name && errors.name && (
              <ErrorField message={errors.name} />
            )}
          </div>

          {/* Style */}
          <div className="container-create__form">
            <label className="beer-card__label-text" htmlFor="style">
              Style
            </label>
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
            {touched.style && errors.style && (
              <ErrorField message={errors.style} />
            )}
          </div>

          {/* ABV */}

          <div className="container-create__form">
            <label className="beer-card__label-text" htmlFor="abv">
              ABV %
            </label>
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
          </div>

          <div className="container-create__form">
            {/* IBUs   */}
            <label className="beer-card__label-text" htmlFor="ibu">
              IBUs
            </label>
            <input
              id="ibu"
              name="ibu"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
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
        </div>
      </div>
      {/* Categories  */}
      <div ref={fieldRefs.category} className="container-create__form">
        <CategorySelect
          setValues={setValues}
          selectedValues={values.category as Option[] | null}
          categories={
            selectedBrewery?.categories?.map((cat) => ({
              label: cat.name,
              value: cat.name,
            })) as Option[]
          }
          handleBlur={handleBlur}
        />
        {touched.category && errors.category && (
          <ErrorField message={errors.category} />
        )}
      </div>

      <div className="container-create__form">
        {/* Hops */}
        <TagInput
          valueInput={"hops"}
          values={values}
          setValues={setValues}
          tags={values.hops}
          suggestions={hopSuggestions}
        />
      </div>
      <div className="container-create__form">
        {/* Malt */}
        <TagInput
          valueInput={"malt"}
          values={values}
          setValues={setValues}
          tags={values.malt}
          suggestions={maltSuggestions}
        />
      </div>

      {/* Description */}
      <div className="container-create__form">
        <label className="beer-card__label-text " htmlFor="description">
          Description
        </label>
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

      {/* Additional Notes */}
      <div className="container-create__form">
        <label className="beer-card__label-text" htmlFor="notes">
          Additional notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="form__input-textarea"
          placeholder="..."
          value={values.notes}
          onChange={(e) => setValues({ ...values, notes: e.target.value })}
          maxLength={2500}
        />
      </div>

      {/* Name Details */}
      <div className="container-create__form ">
        <label className="beer-card__label-text" htmlFor="nameSake">
          Name Details
        </label>
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

      <div className="flex py-5 px-3 justify-between items-center">
        {submitError && <div>Error: {submitError}</div>}
        {/* Archived */}
        <div className="flex flex-col justify-center items-center">
          <label className="beer-card__label-text" htmlFor="archived">
            Archive
          </label>
          <input
            id="archived"
            name="archived"
            type="checkbox"
            className="checkbox checkbox-accent"
            placeholder="Beer release date"
            checked={values.archived}
            onChange={(e) =>
              setValues({ ...values, archived: e.target.checked })
            }
          />
        </div>
        <SaveButton
          title="Create"
          isLoading={isLoading}
          className="create-btn inverse"
          type="submit"
          disabled={
            isSubmitting.current ||
            !values.name ||
            !values.style ||
            !(values.category && values.category.length) ||
            !values.abv
          }
        />
      </div>
    </form>
  );
};
export default CreateBeerForm;

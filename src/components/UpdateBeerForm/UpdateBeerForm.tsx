"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import handleUpdateBeer from "@/lib/handleSubmit/handleUpdateBeer";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import { ErrorValues, FormValues, RefsType } from "../CreateBeerForm/types";
import ErrorField from "../ErrorField/ErrorField";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import TagInput from "../TagInput/TagInput";

import { useBreweryContext } from "@/context/brewery-beer";
import deleteBeers from "@/lib/DELETE/deleteBeers";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { deleteImage } from "@/lib/supabase/deleteImage";
import { updateImage } from "@/lib/supabase/updateImage";
import validateFields from "@/lib/validators/forms";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DeleteBeerButton from "../Buttons/DeleteBeerButton";

import { useToast } from "@/context/toast";
import getSingleBrewery from "@/lib/getSingleBrewery";
import AlertDialog from "../Alerts/AlertDialog";
import SaveButton from "../Buttons/SaveButton";
import TrashCanIcon from "../Buttons/TrashCanIcon";
import { Pencil } from "lucide-react";

// import createBeer from "@/lib/createBeer";

type pageProps = {
  brewery: Brewery | null;
  beer: Beer;

  setBeer: (beer: Beer) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
};

const UpdateBeerForm = ({
  brewery,
  beer,
  setBeer,
  setIsEditing,
  isEditing,
}: pageProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const { mutate: beerMutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${brewery?._id}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );
  const { mutate: breweryMutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${brewery?._id}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
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

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState<boolean>(false); // delete alert confirmation
  const { selectedBeers } = useBreweryContext();

  const isSubmitting = useRef(false);

  // Create a map that connects field names to their refs
  const fieldRefs: RefsType = {
    name: useRef<HTMLInputElement>(null),
    malt: useRef<HTMLInputElement>(null),
    abv: useRef<HTMLInputElement>(null),
    category: useRef<HTMLInputElement>(null),
    style: useRef<HTMLInputElement>(null),
    image: useRef<HTMLInputElement>(null),
  };

  // updated beer card state and isEditing to false
  const updateBeerState = (beer: Beer) => {
    setIsEditing(false);
    setBeer(beer);
  };

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

      if (beer?.image !== values.image && values.image) {
        const newImage = await updateImage(beer.image, values.image as File);
        updatedBeer = { ...values, image: newImage as any };
      }
      const updateBeerRes = await handleUpdateBeer(
        updatedBeer,
        brewery,
        session?.user?.accessToken
      );

      if (updateBeerRes) {
        const beerIndex = selectedBeers?.findIndex(
          (b) => b._id === updatedBeer._id
        );
        // Replace the beer at that index with the updated beer
        const updatedBeers = [...(selectedBeers as Beer[])];
        updatedBeers[beerIndex as number] = updateBeerRes;

        // forced revalidation of the beers
        beerMutate(updatedBeers);
        breweryMutate();

        addToast(`${updateBeerRes.name} has been updated.`, "success");
        // set beer to updated beer and edit to false
        updateBeerState(updateBeerRes);
      }
    } catch (err: any) {
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

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  //  Delete Beer
  const handleDelete = async () => {
    if (deleteAlert) {
      try {
        setDeleteAlert(false);
        isSubmitting.current = true;

        const deletedBeer = await deleteBeers({
          beerId: beer?._id,
          breweryId: brewery?._id,
          token: session?.user.accessToken as string,
        });
        if (deletedBeer) {
          await deleteImage(beer?.image);
          // forced revalidation of the beers
          addToast(`${beer?.name} has been deleted.`, "success");
          beerMutate();
          router.back();
        }
      } catch (err) {
        console.error(err);
      } finally {
        isSubmitting.current = false;
      }
    } else return;
  };

  useEffect(() => {
    let date = new Date(beer?.releasedOn as Date);
    let formattedDate = `${date.getFullYear()}-${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
    setValues((prevValues: FormValues) => ({
      ...prevValues,

      releasedOn: formattedDate,
    }));
  }, []);

  // Validate fields and persist state on every render
  useEffect(() => {
    setErrors(validateFields(values));
  }, [values]);

  return (
    <>
      <AlertDialog
        title="Delete Beer"
        message={
          <>
            Are you sure you want to delete this beer?
            <br />
            This action cannot be undone.
          </>
        }
        isOpen={deleteAlert}
        onClose={() => setDeleteAlert(false)}
        onConfirm={handleDelete}
      />
      <form
        onSubmit={handleSubmit}
        className={` flex flex-col justify-between mx-auto rounded-lg `}
      >
        <div className="flex flex-col md:flex-row-reverse justify-between w-full ">
          {/*  Beer Image */}
          <div className="flex flex-col items-center justify-between  w-full md:w-[45%] p-2 pt-4 md:pt-2">
            <div className="flex flex-col items-center md:items-start w-full h-full  max-h-[550px]">
              <label
                htmlFor="update_image"
                className="beer-card__label-text hover:underline hover:cursor-pointer"
              >
                Photo
              </label>

              <input
                type="file"
                id="update_image"
                name="update_image"
                ref={fieldRefs.image}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  if (file && file.size > 5 * 1024 * 1024) {
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
                    const url = URL.createObjectURL(file as any);
                    setPreviewImage(url as any);
                  }
                }}
                onBlur={handleBlur("image")}
              />

              {/*  Beer Image */}

              {/*  Existing Beer Image */}
              {!previewImage ? (
                <label
                  htmlFor="update_image"
                  className="border border-stone-400 rounded-xl w-48 h-60 md:h-full md:w-full hover:cursor-pointer relative"
                >
                  <ImageDisplay
                    className=" rounded-xl w-full h-full object-cover"
                    item={beer}
                  />

                  <Pencil
                    size={24}
                    className="absolute bottom-0 right-0 p-4 z-10 hover:cursor-pointer"
                  />
                </label>
              ) : (
                //  Preview of new image
                <div className="relative">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center p-3 w-48 h-60 md:h-full md:w-full hover:cursor-pointer "
                  >
                    <Image
                      className="bg-transparent border border-stone-400 rounded-xl  h-60 w-full object-cover"
                      alt="New Beer Image preview"
                      src={previewImage}
                      width={50}
                      height={50}
                    />
                  </label>
                  <TrashCanIcon
                    onClick={(e) => {
                      URL.revokeObjectURL(previewImage as any);
                      setPreviewImage(null);
                      setValues({
                        ...values,
                        image: null,
                      });
                    }}
                    className="absolute bottom-0 right-0 p-4 z-10 hover:cursor-pointer"
                  />
                </div>
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
          <div className="flex flex-col items-start justify-between pt-2 md:w-1/2">
            <span className="text-xs pl-4">
              <span className="error">*</span> REQUIRED FIELD
            </span>
            {/* Name */}
            <div className="container-create__form">
              <label className="beer-card__label-text" htmlFor="name">
                Name<span className="error">*</span>
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
                Style<span className="error">*</span>
              </label>
              <input
                id="style"
                name="style"
                ref={fieldRefs.style}
                className="form__input"
                placeholder="West Coast IPA, Pilsner, Swchwarzbier..."
                value={values.style}
                onChange={(e) =>
                  setValues({ ...values, style: e.target.value })
                }
                onBlur={handleBlur("style")}
              />
              {touched.style && errors.style && (
                <ErrorField message={errors.style} />
              )}
            </div>

            {/* ABV */}
            <div className="container-create__form">
              <label className="beer-card__label-text" htmlFor="abv">
                ABV %<span className="error">*</span>
              </label>
              <input
                id="abv"
                name="abv"
                ref={fieldRefs.abv}
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="0.01"
                min={0}
                className="form__input"
                placeholder="ABV %"
                value={values.abv}
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const abvValue = Number(e.target.value);
                  setValues({
                    ...values,
                    abv: isNaN(abvValue) || abvValue === 0 ? "" : abvValue,
                  });
                }}
                onBlur={handleBlur("abv")}
              />
              {touched.abv && errors.abv && <ErrorField message={errors.abv} />}
            </div>
            {/* IBUs   */}
            <div className="container-create__form">
              <label className="beer-card__label-text" htmlFor="ibu">
                IBU
              </label>
              <input
                id="ibu"
                name="ibu"
                type="number"
                inputMode="numeric"
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
            selectedValues={values.category as any}
            categories={
              brewery?.categories?.map((cat) => ({
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
        {/* Hops */}
        <div className="container-create__form">
          <TagInput
            valueInput={"hops"}
            values={values}
            setValues={setValues}
            tags={values.hops}
            suggestions={hopSuggestions}
          />
        </div>

        {/* Malt */}
        <div className="container-create__form">
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
          <label className="beer-card__label-text" htmlFor="description">
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
        <div className="container-create__form">
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

        {/* Archived */}
        <div className="flex flex-col justify-start items-start p-3">
          <div className="flex flex-col items-center">
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
        </div>

        <div className="flex py-5 px-3 justify-between items-center">
          {submitError && <div>Error: {submitError}</div>}
          <DeleteBeerButton
            isSubmitting={isSubmitting}
            handleDelete={() => setDeleteAlert(true)}
          />
          <SaveButton
            title="Save"
            isLoading={isLoading}
            disabled={isSubmitting.current}
            className="inverse "
            type="submit"
          />
        </div>
      </form>
    </>
  );
};
export default UpdateBeerForm;

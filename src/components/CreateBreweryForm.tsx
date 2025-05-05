"use client";
import saveImage from "@/lib/supabase/saveImage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
  FC,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import createBrewery from "@/lib/createBrewery";
import ErrorField from "./ErrorField/ErrorField";
import SaveButton from "./Buttons/SaveButton";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/context/toast";
import { useBreweryContext } from "@/context/brewery-beer";
import { User } from "next-auth";

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
  const { setSelectedBrewery } = useBreweryContext();
  const [values, setValues] = useState<FormValues>({
    companyName: "",
    image: null,
  });
  const [errors, setErrors] = useState<ErrorValues>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasCreated, setHasCreated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { data: session, status, update } = useSession();
  const { addToast } = useToast();
  const router = useRouter();
  const isSubmitting = useRef(false);

  // Define a new state to track "touched" status for each field
  const [touched, setTouched] = useState<{ [K in keyof FormValues]: boolean }>({
    companyName: false,
    image: false,
  });

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  const onDismiss = () => {
    if (hasCreated) {
      setHasCreated(false);
      setValues({ companyName: "", image: null });
    }

    setTouched({ companyName: false, image: false });
    onClose();
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Don't submit if there are validation errors
      if (Object.keys(errors).length > 0) {
        return;
      }
      setIsLoading(true);
      isSubmitting.current = true;

      try {
        const companyImage = values.image
          ? await saveImage({ file: values.image } as any)
          : undefined;

        const newBrewery = {
          companyName: values.companyName,
          image: companyImage ?? undefined,
        };

        const responseBrewery = (await createBrewery({
          brewery: newBrewery,
          accessToken: session?.user?.accessToken as string,
        })) as any;

        if (responseBrewery) {
          addToast(
            `${responseBrewery.savedBrewery.companyName} successfully created!`,
            "success"
          );
          await update({
            newBreweryId: responseBrewery.savedBrewery._id,
          });
          localStorage.setItem(
            "selectedBreweryId",
            responseBrewery.savedBrewery._id
          );
          setSelectedBrewery(responseBrewery.savedBrewery);
          router.push(
            `/dashboard/breweries/${responseBrewery.savedBrewery._id}`
          );
        } else {
          addToast(`Error creating brewery`, "error");
        }
      } catch (err: any) {
        console.error(err);
        setSubmitError(err.message);
        addToast(err.message, "error");
      } finally {
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
          setPreviewImage(null);
        }
        onDismiss();
        setIsLoading(false);
        isSubmitting.current = false;
      }
    },
    [errors, values, session, router, update, setSelectedBrewery]
  );

  // Handling Enter key press within input fields
  const handleEnterKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isSubmitting.current) {
        handleSubmit(event as any); // Typecasting to align with expected event type
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    // Adding Enter key press event listener
    window.addEventListener("keydown", handleEnterKeyPress);

    return () => {
      // Removing the event listener on cleanup
      window.removeEventListener("keydown", handleEnterKeyPress);
    };
  }, [handleEnterKeyPress]);

  // Validate fields and persist state on every render
  useEffect(() => {
    setErrors(validateFields(values));

    // Clear the error message when the form fields change
    setSubmitError(null);
    if (values.companyName === "") {
      setHasCreated(false);
    }
  }, [values]);

  return (
    <div className="flex flex-col justify-center items-center z-50 text-background my-auto ">
      <div className="flex w-full h-full justify-between items-center p-3 lg:hidden">
        <button onClick={onDismiss} className="btn btn-ghost " type="button">
          <X size={24} />
        </button>
        <h4>Create Brewery</h4>
        <SaveButton
          isLoading={isLoading}
          onClick={handleSubmit}
          title="Create"
          className={`ghost`}
          disabled={!hasCreated}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 form flex flex-col justify-between mx-auto rounded-lg text-white lg:w-3/4 lg:p-0"
      >
        <div className="flex flex-col items-center p-6 pt-7 w-full">
          <label htmlFor="image" className="beer-card__label-text">
            Photo
          </label>
          <div className="relative w-32 h-32 ">
            {/* Set a fixed size for responsiveness */}
            <label
              htmlFor="image"
              className="absolute top-0 left-0 w-full h-full flex justify-center items-center rounded-full border border-background bg-background/50 object-cover overflow-hidden text-primary"
            >
              {previewImage ? (
                <Image
                  className="bg-transparent border border-stone-400 rounded-xl w-full object-cover"
                  alt="Company image preview"
                  src={previewImage as any}
                  width={50}
                  height={50}
                />
              ) : (
                <ImagePlus size={120} strokeWidth={1} />
              )}
            </label>
          </div>

          <input
            id="image"
            name="image"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (file && file.size > 5 * 1024 * 1024) {
                // Check if file size is greater than 2MB
                addToast(
                  "File is too large. Please select a file less than 5MB.",
                  "error"
                );
                e.target.value = ""; // Clear the selected file
              } else {
                setValues({
                  ...values,
                  image: file,
                });
                if (previewImage) {
                  URL.revokeObjectURL(previewImage);
                }
                // Generate a URL for the new image and set it as the preview
                const url = URL.createObjectURL(file as any);
                setPreviewImage(url as any);
              }
            }}
            onBlur={handleBlur("image")}
          />
          {touched.image && errors.image && (
            <ErrorField message={errors.image} />
          )}
        </div>
        <div>
          <div className="flex flex-col mt-6 w-full  lg:w-fit relative">
            {hasCreated && (
              <button
                aria-label="Clear input"
                className="absolute inset-y-0 right-2 flex items-center  cursor-pointer  text-accent/50"
                onClick={() => {
                  setValues({ ...values, companyName: "" }),
                    setTouched({ ...touched, companyName: false });
                  setHasCreated(false);
                }}
              >
                <X size={20} strokeWidth={3} />
              </button>
            )}
            <input
              id="companyName"
              name="companyName"
              className="form__input w-full font-bold! text-2xl! text-primary text-center pr-7! lg:h-11!"
              placeholder="Company Name"
              autoComplete="off"
              value={values.companyName}
              onChange={(e) => {
                setValues({ ...values, companyName: e.target.value });
                setHasCreated(true);
              }}
              onBlur={handleBlur("companyName")}
            />
          </div>
          {touched.companyName && errors.companyName && (
            <ErrorField message={errors.companyName} />
          )}
        </div>
        <div className="flex justify-between p-3 lg:mt-2 lg:pb-0  ">
          {submitError && <div>Error: {submitError}</div>}
          <div className=" hidden lg:flex justify-between items-center w-full">
            {submitError && <div>Error: {submitError}</div>}

            <button
              className="btn border-none bg-transparent hover:bg-background hover:text-primary text-background"
              onClick={onDismiss}
              type="button"
            >
              Cancel
            </button>

            <SaveButton
              isLoading={isLoading}
              type="submit"
              onClick={handleSubmit}
              className=" ml-2 inverse"
              disabled={!hasCreated}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBreweryForm;

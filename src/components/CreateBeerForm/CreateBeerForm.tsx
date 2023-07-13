"use client";
import { Brewery } from "@/app/types/brewery";
import saveImage from "@/lib/saveImage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import TagInput from "../TagInput/TagInput";

// import createBeer from "@/lib/createBeer";

type pageProps = {
  brewery: Brewery;
};

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

const CreateBeerForm = ({ brewery }: pageProps) => {
  const [values, setValues] = useState<FormValues>({
    name: "",
    abv: "",
    style: "",
    malt: [],
    hops: [],
    description: "",
    category:
      brewery?.categories.map((cat) => ({
        label: cat.name,
        value: cat.name,
      })) || [],
    nameSake: "",
    notes: "",
    image: null,
    releaseDate: "",
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
    console.log({ values });
  }, [values]);

  // Suggested hops for autocomplete
  // With labelField of `name`
  const hopSuggestions = [
    { id: "cascade", name: "Cascade" },
    { id: "centennial", name: "Centennial" },
    { id: "citra", name: "Citra" },
    { id: "columbus", name: "Columbus" },
    { id: "amarillo", name: "Amarillo" },
    { id: "simcoe", name: "Simcoe" },
    { id: "chinook", name: "Chinook" },
    { id: "hallertau-mittelfruh", name: "Hallertau Mittelfrüh" },
    { id: "saaz", name: "Saaz" },
    { id: "tettnang", name: "Tettnang" },
    { id: "fuggle", name: "Fuggle" },
    { id: "willamette", name: "Willamette" },
    { id: "east-kent-goldings", name: "East Kent Goldings" },
    { id: "galaxy", name: "Galaxy" },
    { id: "mosaic", name: "Mosaic" },
    { id: "nelson-sauvin", name: "Nelson Sauvin" },
    { id: "sorachi-ace", name: "Sorachi Ace" },
    { id: "styrian-goldings", name: "Styrian Goldings" },
    { id: "magnum", name: "Magnum" },
    { id: "perle", name: "Perle" },
  ];
  // Suggested malt for autocomplete
  // With labelField of `name`
  const maltSuggestions = [
    { id: "pale-malt", name: "Pale Malt" },
    { id: "pilsner", name: "Pilsner" },
    { id: "maris-otter", name: "Maris Otter" },
    { id: "vienna", name: "Vienna" },
    { id: "munich", name: "Munich" },
    { id: "wheat", name: "Wheat" },
    {
      id: "crystal/caramel-(various-levels-of-darkness)",
      name: "Crystal/Caramel (various levels of darkness)",
    },
    { id: "rye", name: "Rye" },
    { id: "aromatic", name: "Aromatic" },
    { id: "biscuit", name: "Biscuit" },
    { id: "special-b", name: "Special B" },
    { id: "roasted-barley", name: "Roasted Barley" },
    { id: "chocolate -alt", name: "Chocolate Malt" },
    { id: "black-patent", name: "Black Patent" },
    { id: "carapils/dextrin", name: "Carapils/Dextrin" },
    { id: "flaked-oats", name: "Flaked Oats" },
    { id: "flaked-barley", name: "Flaked Barley" },
    { id: "flaked-wheat", name: "Flaked Wheat" },
    { id: "carafoam", name: "Carafoam" },
    { id: "caramunich", name: "CaraMunich" },
    { id: "carafa-special-I", name: "Carafa Special I" },
    { id: "carafa-special-II", name: "Carafa Special II" },
    { id: "carafa-special-III", name: "Carafa Special III" },
    { id: "honey-malt", name: "Honey Malt" },
    { id: "victory", name: "Victory" },
    { id: "acidulated", name: "Acidulated" },
    { id: "smoked-malt", name: "Smoked Malt" },
    { id: "melanoidin", name: "Melanoidin" },
    { id: "amber", name: "Amber" },
    { id: "pale-wheat", name: "Pale Wheat" },
    { id: "dark-munich", name: "Dark Munich" },
    { id: "aromatic-munich", name: "Aromatic Munich" },
    { id: "carared", name: "Carared" },
    { id: "roasted-wheat", name: "Roasted Wheat" },
    { id: "peated-malt", name: "Peated Malt" },
    { id: "caramel-wheat", name: "Caramel Wheat" },
    { id: "caramel-rye", name: "Caramel Rye" },
    { id: "caraaroma", name: "CaraAroma" },
    { id: "carabrown", name: "Carabrown" },
    { id: "spelt", name: "Spelt" },
    { id: "raw-wheat", name: "Raw Wheat" },
    { id: "raw-rye", name: "Raw Rye" },
    { id: "oat", name: "Oat" },
    { id: "coffee-malt", name: "Coffee Malt" },
    { id: "midnight-wheat", name: "Midnight Wheat" },
    { id: "roasted-buckwheat", name: "Roasted Buckwheat" },
    { id: "kiln-coffee-malt", name: "Kiln Coffee Malt" },
    { id: "belgian-special-b", name: "Belgian Special B" },
    { id: "belgian-aromatic", name: "Belgian Aromatic" },
    { id: "belgian-biscuit", name: "Belgian Biscuit" },
  ];

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
        hops: values.hops.map((hop) => hop.name),
        malt: values.malt.map((malt) => malt.name),
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
        category:
          brewery?.categories.map((cat) => ({
            label: cat.name,
            value: cat.name,
          })) || [],
        nameSake: "",
        notes: "",
        image: null,
        releaseDate: "",
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
    releaseDate: false,
  });

  // Handle blur events for the inputs
  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-800 h-fit p-4 w-1/2 flex flex-col justify-between mx-auto rounded-lg shadow-2xl text-white"
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
        <label htmlFor="name">Style</label>
        <input
          id="style"
          name="style"
          className="form__input"
          placeholder="Beer Style"
          value={values.style}
          onChange={(e) => setValues({ ...values, style: e.target.value })}
          onBlur={handleBlur("style")}
        />
        {touched.style && errors.style && <div>{errors.style}</div>}
      </div>

      {/* ABV */}
      <div className="container-create__form">
        <label htmlFor="abv">ABV</label>
        <input
          id="abv"
          name="abv"
          className="form__input"
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

      <CategorySelect
        setValues={setValues}
        values={values}
        categories={values.category}
      />

      {/* Description */}
      <div className="container-create__form">
        <label htmlFor="name">Description</label>
        <textarea
          id="description"
          name="description"
          className="form__input"
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
        <label htmlFor="name">Release Date</label>
        <input
          id="releaseDate"
          name="releaseDate"
          type="date"
          className="form__input"
          placeholder="Beer release date"
          value={values.releaseDate}
          onChange={(e) =>
            setValues({ ...values, releaseDate: e.target.value })
          }
        />
      </div>
      {/* Add similar input fields for the other properties */}

      <div className="container-create__form">
        <label htmlFor="image">Image</label>
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
        <button
          className="btn btn-accent"
          type="submit"
          disabled={isSubmitting.current}
        >
          Create
        </button>
      </div>
    </form>
  );
};

export default CreateBeerForm;

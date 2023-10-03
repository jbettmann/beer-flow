import { ErrorValues, FormValues } from "@/components/CreateBeerForm/types";

// Utility function to validate form fields
const validateFields = (values: FormValues) => {
  const errors: ErrorValues = {};

  console.log("values", values);

  // validate name

  if (!values.name || values.name.trim() === "") {
    errors.name = "Name is required.";
  }

  // validate style
  if (!values.style || values.style.trim() === "") {
    errors.style = "Style is required.";
  }

  // validate abv
  if (!/^(\d+(\.\d{1,2})?)$/.test(values.abv as string)) {
    errors.abv = "ABV must be a number.";
  }

  if (!/^(\d+(\.\d{1,2})?)$/.test(values.ibu as string)) {
    errors.ibu = "IBU must be a number.";
  }

  // validate category
  if (values.category.length === 0) {
    errors.category = "A category is required.";
  }

  return errors;
};

export default validateFields;

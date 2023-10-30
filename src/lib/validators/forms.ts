import { ErrorValues, FormValues } from "@/components/CreateBeerForm/types";

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
  } else if (!values.abv || isNaN(Number(values.abv))) {
    errors.abv = "ABV must be a valid number.";
  } else if (!/^(\d+(\.\d{1,2})?)$/.test(values.abv as any)) {
    errors.abv = "ABV can only have up to two decimal places.";
  }

  // validate category
  if (values.category.length === 0) {
    errors.category = "A category is required.";
  }

  return errors;
};

export default validateFields;

import { ErrorValues, FormValues } from "@/components/CreateBeerForm/types";
import exp from "constants";

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
  if (!/^(\d+(\.\d{1,2})?)$/.test(values.abv)) {
    errors.abv = "ABV must be a number.";
  }

  if (!/^(\d+(\.\d{1,2})?)$/.test(values.ibu)) {
    errors.ibu = "IBU must be a number.";
  }

  // validate category
  if (values.category.length === 0) {
    errors.category = "A category is required.";
  }

  // validate image
  if (!values.image) {
    errors.image = "Image is required.";
  }

  return errors;
};

export default validateFields;

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { toast } from "sonner";
import { z } from "zod";

export function getErrorMessage(err: unknown) {
  const unknownError = "Something went wrong, please try again later.";

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return errors.join("\n");
  } else if (err instanceof Error) {
    return err.message;
  } else if (isRedirectError(err)) {
    throw err;
  } else if (err && typeof err === "object" && "message" in err) {
    return String(err.message);
  } else if (typeof err === "string") {
    return err;
  } else {
    return err ? String(err) : unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);
  return toast.error(
    errorMessage || "Failed to save company information and documents"
  );
}

export const onFormError = (errors: any) => {
  showErrorToast(errors);
  console.log("Form errors:", errors);
};

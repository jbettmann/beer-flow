"use client";
import React, { useEffect, useState } from "react";
import ErrorField from "../ErrorField/ErrorField";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import SaveButton from "../Buttons/SaveButton";
import { set } from "mongoose";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {};

interface Errors {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const CreateAccount = (props: Props) => {
  const searchParams = useSearchParams();
  const acceptInviteUrl = searchParams.get("next");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<any>(null);

  const [interactedFields, setInteractedFields] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Errors>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  console.log({ errors });
  // changes the interactedFields state to true
  const handleInputInteraction = (field: keyof typeof interactedFields) => {
    setInteractedFields((prev) => ({ ...prev, [field]: true }));
  };

  const validateInputs = () => {
    let tempErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (fullName.length === 0) {
      tempErrors.fullName = "Full Name is required.";
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      tempErrors.email = "Email does not appear to be valid.";
    }

    if (!password) {
      tempErrors.password = "Password is required.";
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(tempErrors);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateInputs();

    setInteractedFields({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check if there are any errors before proceeding.
    if (Object.values(errors).some((error) => error)) return;

    setIsCreateLoading(true);
    try {
      const response = await fetch("https://beer-bible-api.vercel.app/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Redirect or handle success
        if (data.errors) {
          setErrors(data.errors.map((error: any) => error.msg));
        }
      } else {
        // Handle error responses
        console.log("User created successfully:", data);
        await signIn("credentials", {
          email,
          password,
          callbackUrl: acceptInviteUrl || "http://localhost:3000/" || "/",
        });
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err);
    } finally {
      setIsCreateLoading(false);
    }
  };

  useEffect(() => {
    validateInputs();
  }, [fullName, email, password, confirmPassword]);

  return (
    <div className="w-full md:w-2/3 lg:w-1/2  mx-auto justify-center items-center shadow-lg rounded-lg p-4 xs:p-6 md:p-12 mt-6 bg-white ">
      <h3>Create Account</h3>

      <div className="pt-8">
        <button
          onClick={() => {
            setIsGoogleLoading(true);
            signIn("google");
          }}
          disabled={isGoogleLoading}
          className=" flex justify-center items-center w-full p-4 mx-auto rounded-md bg-white border border-primary hover:shadow-xl transition-all ease-in-out"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg
              className="mr-2 h-6 w-6"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="github"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
          )}
          Google
        </button>
      </div>
      <div className="divider my-6">
        <h5 className="my-3">OR</h5>
      </div>
      <form
        className="flex flex-col justify-center mx-auto w-full  h-full gap-3"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label
            className="beer-card__label-text !text-primary"
            htmlFor="fullName"
          >
            Full Name
          </label>
          <input
            className="form-input__create-account"
            type="text"
            placeholder="Full Name"
            name="fullName"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => handleInputInteraction("fullName")}
          />
          <div className="">
            {interactedFields.fullName && errors.fullName && (
              <ErrorField message={errors.fullName} />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label
            className="beer-card__label-text !text-primary"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="form-input__create-account"
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleInputInteraction("email")}
          />
          <div className="">
            {interactedFields.email && errors.email && (
              <ErrorField message={errors.email} />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label
            className="beer-card__label-text !text-primary"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="form-input__create-account"
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleInputInteraction("password")}
          />
          <div className="">
            {interactedFields.password && errors.password && (
              <ErrorField message={errors.password} />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label
            className="beer-card__label-text !text-primary"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            className="form-input__create-account"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleInputInteraction("confirmPassword")}
          />
          <div className="">
            {interactedFields.confirmPassword && errors.confirmPassword && (
              <ErrorField message={errors.confirmPassword} />
            )}
          </div>
        </div>
        {submitError && <div className="error"> {submitError}</div>}
        <SaveButton
          isLoading={isCreateLoading}
          title="Create Account"
          className="create-btn !bg-accent !text-primary my-6"
          type="submit"
        />
        <div className="text-sm inline-flex gap-2 mx-auto">
          <p className="m-0 ">Already have an account?</p>
          <span className="link link-accent">
            <Link href={"/auth/login"}>Log in here</Link>
          </span>
        </div>
      </form>
    </div>
  );
};
export default CreateAccount;

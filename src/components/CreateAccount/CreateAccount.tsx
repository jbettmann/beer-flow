"use client";
import React, { useState } from "react";

type Props = {};

const CreateAccount = (props: Props) => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const validateInputs = () => {
    let tempErrors: string[] = [];
    if (fullName.length < 2) {
      tempErrors.push("Full Name should have at least 2 characters.");
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      tempErrors.push("Email does not appear to be valid.");
    }
    if (!password) {
      tempErrors.push("Password is required.");
    }
    if (password !== confirmPassword) {
      tempErrors.push("Passwords do not match.");
    }
    setErrors(tempErrors);
    return tempErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await fetch("https://beer-bible-api.vercel.app/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        console.log("User created successfully:", data);
        // Redirect or handle success
      } else {
        // Handle error responses
        if (data.errors) {
          setErrors(data.errors.map((error: any) => error.msg));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      className="flex flex-col justify-center items-center w-full h-full bg-primary p-4 gap-3 rounded-xl"
      onSubmit={handleSubmit}
    >
      {errors &&
        errors.map((error, index) => (
          <p key={index} className="text-red-500">
            {error}
          </p>
        ))}
      <div>
        <label className="beer-card__label-text" htmlFor="fullName">
          Full Name
        </label>
        <input
          className="form__input"
          type="text"
          name="fullName"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label className="beer-card__label-text" htmlFor="email">
          Email
        </label>
        <input
          className="form__input"
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="beer-card__label-text" htmlFor="password">
          Password
        </label>
        <input
          className="form__input"
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="beer-card__label-text" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          className="form__input"
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="create-btn inverse">
        Create Account
      </button>
    </form>
  );
};
export default CreateAccount;

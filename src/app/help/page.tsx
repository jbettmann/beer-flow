import React from "react";

type Props = {};

const HelpPage = (props: Props) => {
  return (
    <div className="h-full lg:h-screen mb-auto w-full flex flex-col justify-center items-center text-primary bg-background gap-2">
      <h2>Help!</h2>
      <h5>We are currently working on getting you all the answers.</h5>
      <p className="w-full md:w-1/2 text-center">
        In the meantime, please feel free to send an email to{" "}
        <a className="link link-accent" href="mailto:hello@jordanbettmann.com">
          hello@jordanbettmann.com
        </a>{" "}
        with your question. We will do our best to get back to you as soon as we
        possibly can.
      </p>
      <p className="text-center">
        Thank you for your understand and patience. <br /> 🍻Cheers!
      </p>
    </div>
  );
};

export default HelpPage;

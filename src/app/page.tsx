import GoogleSignInButton from "@/components/Buttons/GoogleSignInButton";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import homepageImage from "../assets/img/homepage.png";
import mobilePhoneImage from "../assets/img/mobile.png";
import logo from "../../public/Brett_Logo.svg";

export default async function Home() {
  // let savedBreweryId;
  // if (typeof window !== "undefined") {
  //   savedBreweryId = localStorage.getItem("selectedBreweryId");
  // }
  // if (session?.user && savedBreweryId) {
  //   redirect(`/dashboard/breweries/${savedBreweryId}`);
  // }

  // if (session?.user && !savedBreweryId && session.user.breweries.length > 0) {
  //   redirect(`/breweries`);
  // }

  // if (session?.user && !savedBreweryId) {
  //   let savedBreweryId = session?.user.breweries[0];
  //   redirect(`/dashboard/breweries/${savedBreweryId}`);
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <div className="w-full mx-auto max-w-7xl">
        <div className=" mx-auto flex justify-between text-primary absolute top-0 left-0 right-0 p-4 md:px-10 lg:px-12 2xl:px-32 ">
          <Link
            href={"/"}
            className="inline-flex justify-center items-center xxs:px-4"
          >
            <Image
              width={50}
              height={50}
              src={logo}
              alt="Brett Logo"
              className="w-16"
            />

            <h1 className="text-primary font-medium ">Brett</h1>
          </Link>
          <div className="flex items-center  gap-1 xxs:gap-3 xxs:px-4 ">
            <Link
              href="/auth/login"
              className=" flex w-28 text-primary text-md justify-center items-center"
            >
              Log In
            </Link>
            <Link
              href="/auth/create/account"
              className=" flex justify-center items-center w-full h-3/4 rounded-full bg-accent hover:shadow-xl transition-all ease-in-out text-sm  text-primary shadow-sm font-medium hover:bg-[#68cdc0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-accent/70 px-6 pt-16 shadow-2xl rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                  <stop stopColor="#fff" />
                  <stop offset={1} stopColor="#b1faef" />
                </radialGradient>
              </defs>
            </svg>
            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight  sm:text-4xl">
                Keep your brewery,
                <br />
                up-to-date.
              </h2>
              <p className="mt-6 text-lg font-thin leading-8  ">
                Brett is the vital bridge between your front and back of house,
                ensuring accurate and detailed information, in real-time.
              </p>
              <div className="mt-10 flex flex-col lg:flex-row gap-3 items-center justify-center gap-x-6 lg:justify-start">
                <GoogleSignInButton title="Sign up with Google" />

                <Link
                  href="/auth/create/account"
                  className=" flex justify-center items-center w-full md:w-1/2 rounded-full bg-primary hover:shadow-xl transition-all ease-in-out px-3.5 py-2.5 text-sm  text-background shadow-sm hover:bg-[#1e1e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white gap-2"
                >
                  <Mail size={24} strokeWidth={1} color="#f7f4ea" /> Sign up
                  with Email
                </Link>
              </div>
            </div>
            <div className="relative mt-16 h-80 lg:mt-8 ">
              <Image
                className="absolute left-5 top-0 w-[57rem] max-w-none rounded-lg bg-white/5 ring-1 ring-white/10 "
                src={homepageImage}
                alt="App screenshot"
                width={1824}
              />
            </div>
            <Image
              className="hidden lg:block absolute lg:left-[60%] xl:left-[48%] lg:bottom-[-2.5rem] w-40 max-w-none rounded-xl   bg-transparent drop-shadow-lg  "
              src={mobilePhoneImage}
              alt="App screenshot"
              width={1824}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

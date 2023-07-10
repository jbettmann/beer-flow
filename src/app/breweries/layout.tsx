import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Breweries",
  description: "Generated by create next app",
};

export default async function Layout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {props.children}
        {props.modal}
      </body>
    </html>
  );
}
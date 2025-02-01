import BackArrow from "@/components/Buttons/BackArrow";

export default async function BreweriesLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* @ts-expect-error Server component */}
      <BackArrow />
      {props.children}
    </>
  );
}

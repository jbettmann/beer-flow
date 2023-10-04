import BackArrow from "@/components/Buttons/BackArrow";

export default async function CreatePageLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full h-full ">
      {/* @ts-expect-error Server component */}
      <BackArrow />
      {props.children}
    </section>
  );
}

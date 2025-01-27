import BackArrow from "@/components/Buttons/BackArrow";

export default async function BreweriesLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full py-3 mt-8 lg:py-8 lg:pr-12">
      {/* @ts-expect-error Server component */}
      <BackArrow />
      {props.children}
    </div>
  );
}

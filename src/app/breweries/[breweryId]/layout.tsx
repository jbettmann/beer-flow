export default async function BreweriesIdLayout(props: {
  children: React.ReactNode;
  createBeerModal: React.ReactNode;
}) {
  return (
    <div className="h-full">
      {props.children}
      {props.createBeerModal}
    </div>
  );
}

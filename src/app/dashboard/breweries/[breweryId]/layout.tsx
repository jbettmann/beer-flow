export default async function BreweriesIdLayout(props: {
  children: React.ReactNode;
  createBeerModal: React.ReactNode;
}) {
  return (
    <>
      {props.children}
      {props.createBeerModal}
    </>
  );
}

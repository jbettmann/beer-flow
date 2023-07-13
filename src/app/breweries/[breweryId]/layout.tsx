export default async function BreweriesIdLayout(props: {
  children: React.ReactNode;
  createBeerModal: React.ReactNode;
}) {
  return (
    <div>
      {props.children}
      {props.createBeerModal}
    </div>
  );
}

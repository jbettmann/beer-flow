export default async function BreweriesLayout(props: {
  children: React.ReactNode;
}) {
  return <div className="h-full">{props.children}</div>;
}

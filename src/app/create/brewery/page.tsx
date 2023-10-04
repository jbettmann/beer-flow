import BreweryForm from "@/components/CreateBreweryForm";

type Props = {};

const CreateBrewery = (props: Props) => {
  return (
    <section className="w-full sm:w-2/3 lg:w-1/2 mx-auto h-full ">
      <BreweryForm />
    </section>
  );
};

export default CreateBrewery;

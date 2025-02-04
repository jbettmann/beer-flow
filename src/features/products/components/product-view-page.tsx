import { fakeProducts, Product } from "@/constants/mock-api";
import { notFound } from "next/navigation";
import BeerForm from "./beer-form";
import { Beer } from "@/app/types/beer";

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId,
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = "Create New Beer";

  if (productId !== "new") {
    const data = await fakeProducts.getProductById(Number(productId));
    product = data as any;
    if (!product) {
      notFound();
    }
    pageTitle = `Edit ${product.name}`;
  }

  return <BeerForm initialData={product} pageTitle={pageTitle} />;
}

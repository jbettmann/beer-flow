"use client";
import { Product } from "@/constants/data";
import { DataTable as ProductTable } from "@/components/ui/table/data-table";
import { columns } from "./product-tables/columns";
import { Beer } from "@/app/types/beer";
import { useSearchParams } from "next/navigation";
import { useBreweryContext } from "@/context/brewery-beer";

export default function ProductListingPage() {
  const { selectedBeers } = useBreweryContext();
  const searchParams = useSearchParams();

  // Get params directly from URL using Next.js navigation hook
  const page = searchParams.get("page");
  const search = searchParams.get("q");
  const pageLimit = searchParams.get("limit");
  const categories = searchParams.get("categories");

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories }),
  };

  const data = selectedBeers;
  const totalProducts = data?.length || 0;
  const products: Beer[] = selectedBeers || [];
  return (
    <ProductTable
      columns={columns}
      data={products}
      totalItems={totalProducts}
    />
  );
}

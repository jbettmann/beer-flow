"use client";
import { Product } from "@/constants/data";
import { DataTable as ProductTable } from "@/components/ui/table/data-table";
import { columns } from "./product-tables/columns";
import { Beer } from "@/app/types/beer";
import { useSearchParams } from "next/navigation";
import { useBreweryContext } from "@/context/brewery-beer";
import { useMemo } from "react";

export default function ProductListingPage() {
  const { selectedBeers } = useBreweryContext();
  const searchParams = useSearchParams();

  // Get params directly from URL using Next.js navigation hook
  const page = searchParams.get("page");
  const search = searchParams.get("q");
  const pageLimit = searchParams.get("limit");
  const categoriesParam = searchParams.get("categories");
  const stylesParam = searchParams.get("styles");

  const selectedCategories = categoriesParam ? categoriesParam.split(".") : [];
  const selectedStyles = stylesParam ? stylesParam.split(".") : [];

  // Combined filter function
  const filteredBeers = useMemo(() => {
    if (!selectedBeers) return [];

    return selectedBeers.filter((beer) => {
      // Category filter
      const categoryMatch =
        selectedCategories.length === 0 ||
        (beer.category &&
          beer.category.some((cat) => selectedCategories.includes(cat.name)));

      // Style filter
      const styleMatch =
        selectedStyles.length === 0 ||
        (beer.style && selectedStyles.includes(beer.style));
      console.log(styleMatch);
      return categoryMatch && styleMatch;
    });
  }, [selectedBeers, selectedCategories, selectedStyles]);

  return (
    <ProductTable
      columns={columns}
      data={filteredBeers}
      totalItems={filteredBeers.length}
    />
  );
}

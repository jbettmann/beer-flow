import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import BeerViewPage from "@/components/beers/beer-view-page";
import FormCardSkeleton from "@/components/skeletons/form-card-skeleton";

export const metadata = {
  title: "Dashboard : Beer View",
};

type PageProps = { params: Promise<{ beerId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        {/* @ts-expect-error Server Component */}
        <BeerViewPage beerId={params.beerId} />
      </div>
    </PageContainer>
  );
}

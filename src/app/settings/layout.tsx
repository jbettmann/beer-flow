import BackArrow from "@/components/Buttons/BackArrow";
import SettingTabs from "@/components/Settings/SettingTabs";

type Props = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function SettingsLayout({ children }: Props) {
  return (
    <>
      <div className="mt-14 md:hidden">
        {/* @ts-expect-error Server component */}
        <BackArrow />
      </div>
      <div className="mx-auto h-[calc(100dvh-3.5rem)] w-full max-w-6xl overflow-y-auto overscroll-contain p-4 text-primary md:h-dvh md:p-8 md:py-12">
        <SettingTabs>{children}</SettingTabs>
      </div>
    </>
  );
}

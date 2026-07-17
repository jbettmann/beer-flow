import BackArrow from "@/components/Buttons/BackArrow";
import SettingTabs from "@/components/Settings/SettingTabs";

type Props = {
  children: React.ReactNode;
};

export default async function SettingsLayout({ children }: Props) {
  return (
    <>
      <div className="mt-14 md:hidden">
        {/* @ts-expect-error Server component */}
        <BackArrow />
      </div>
      <div className="mx-auto h-full w-full max-w-6xl p-4 text-primary md:p-8 md:py-16">
        <SettingTabs>{children}</SettingTabs>
      </div>
    </>
  );
}

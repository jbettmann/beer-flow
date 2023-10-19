import BackArrow from "@/components/Buttons/BackArrow";
import SettingTabs from "@/components/Settings/SettingTabs";

type Props = {
  children: React.ReactNode;
};

export default async function SettingsLayout({ children }: Props) {
  return (
    <>
      <div className="pt-4 md:hidden">
        {/* @ts-expect-error Server component */}
        <BackArrow />
      </div>
      <div className="h-full p-4 md:p-8 text-primary md:py-16 md:w-10/12 mx-auto">
        <SettingTabs>{children}</SettingTabs>

        <div className="hidden md:block md:w-2/3 px-10">{children}</div>
      </div>
    </>
  );
}

import BackArrow from "@/components/Buttons/BackArrow";
import SettingTabs from "@/components/Settings/SettingTabs";

type Props = {
  children: React.ReactNode;
};

export default async function SettingsLayout({ children }: Props) {
  return (
    <div className="h-full p-3 md:p-8 text-primary">
      {/* @ts-expect-error Server component */}
      <BackArrow />
      <SettingTabs>{children}</SettingTabs>

      <div className="hidden md:block md:w-3/4 px-10">{children}</div>
    </div>
  );
}

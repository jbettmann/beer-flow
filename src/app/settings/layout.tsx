import BackArrow from "@/components/Buttons/BackArrow";
import SettingTabs from "@/components/Settings/SettingTabs";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default async function SettingsLayout({ children }: Props) {
  return (
    <div className=" p-3 md:p-8 text-primary">
      {/* @ts-expect-error Server component */}
      <BackArrow />
      <SettingTabs />
      <div className=" lg:w-3/4 px-10">{children}</div>
    </div>
  );
}

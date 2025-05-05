type Props = {
  isOpen: boolean | any;
  children: React.ReactNode;
};
function SideDrawer({ isOpen, children }: Props) {
  return (
    <div className={`side-drawer z-30 ${isOpen ? "open" : ""}`}>
      <div className="bg-primary h-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default SideDrawer;

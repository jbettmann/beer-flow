type Props = {
  isOpen: boolean;

  children: React.ReactNode;
};
function SideDrawer({ isOpen, children }: Props) {
  return (
    <div className={`side-drawer z-20 ${isOpen ? "open" : ""}`}>
      <div className="bg-primary h-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default SideDrawer;

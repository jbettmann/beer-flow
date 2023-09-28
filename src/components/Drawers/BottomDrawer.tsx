type Props = {
  isOpen: boolean;

  children: React.ReactNode;
};
function BottomDrawer({ isOpen, children }: Props) {
  return (
    <div className={`bottom-drawer  ${isOpen ? "open" : ""}`}>
      <div className=" h-screen bg-primary text-background ">{children}</div>
    </div>
  );
}

export default BottomDrawer;

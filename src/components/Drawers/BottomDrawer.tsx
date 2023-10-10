type Props = {
  isOpen: boolean;

  children: React.ReactNode;
};
function BottomDrawer({ isOpen, children }: Props) {
  return (
    <div
      className={`bottom-drawer  overflow-y-auto md:overflow-y-visible ${
        isOpen ? "open" : ""
      }`}
    >
      <div className=" h-screen bg-primary text-background relative">
        {children}
      </div>
    </div>
  );
}

export default BottomDrawer;

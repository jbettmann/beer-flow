type Props = {
  isOpen: boolean;

  children: React.ReactNode;
};
function BottomDrawer({ isOpen, children }: Props) {
  return (
    <div className={`bottom-drawer  ${isOpen ? "open" : ""}`}>
      <div className=" h-screen bg-third-color ">{children}</div>
    </div>
  );
}

export default BottomDrawer;

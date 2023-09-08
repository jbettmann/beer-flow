type Props = {
  isOpen: boolean;

  children: React.ReactNode;
};
function BottomDrawer({ isOpen, children }) {
  return (
    <div className={`bottom-drawer ${isOpen ? "open" : ""}`}>
      <div className="bg-white h-full">{children}</div>
    </div>
  );
}

export default BottomDrawer;

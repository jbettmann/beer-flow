type Props = {
  isOpen: boolean;

  children: React.ReactNode;
};
function BottomDrawer({ isOpen, children }) {
  return (
    <div className={`bottom-drawer ${isOpen ? "open" : ""}`}>
      <div className="bg-white h-1/2">{children}</div>
    </div>
  );
}

export default BottomDrawer;

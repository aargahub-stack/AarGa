export const metadata = {
  title: "Flowchart Maker — AarGa Workspace",
  description: "Custom drag-and-drop flowchart builder for AarGa Workspace.",
};

export default function FlowchartLayout({ children }) {
  return (
    <div className="font-sans min-h-[calc(100vh-80px)]">
      {children}
    </div>
  );
}

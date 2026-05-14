import Shell from "@/components/Shell";

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <Shell modal={modal}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {children}
          </div>
        </div>
      </div>
    </Shell>
  );
}

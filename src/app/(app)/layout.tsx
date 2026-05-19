import Shell from "@/components/Shell";
import { auth } from "@/auth";

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();

  return (
    <Shell modal={modal} session={session}>
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


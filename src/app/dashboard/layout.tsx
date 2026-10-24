import Sidebar from "./sidebar";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 pb-10 pt-2 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}

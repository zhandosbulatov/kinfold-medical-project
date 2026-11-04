import { TabBar } from "./tab-bar";

// Anna's app shell. Static; each page streams its own data inside <Suspense>.
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex flex-1 flex-col pb-20">
      {children}
      <TabBar />
    </div>
  );
}

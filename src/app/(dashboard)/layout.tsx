import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden bg-[#080D1A] text-slate-100 antialiased">
      <Sidebar user={session.user as any} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080D1A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,39,82,0.35),rgba(8,13,26,0))]">
          <div className="w-full max-w-[1680px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

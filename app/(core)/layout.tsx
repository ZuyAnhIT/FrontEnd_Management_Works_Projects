import { ReactNode } from 'react';
import CoreSidebar from '@/components/layout/CoreSidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function CoreLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) redirect('/login');
  
  return (
    <div className="flex h-screen bg-gray-50">
      <CoreSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
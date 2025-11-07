import { ReactNode } from 'react';
import CompanySidebar from '@/components/layout/CompanySidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user || user.role !== 'COMPANY_ADMIN') {
    redirect('/(admin)');
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <CompanySidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

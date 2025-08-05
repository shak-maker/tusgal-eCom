"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // Check authentication and admin status
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [user, loading, isAdmin, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h1>
        <p className="text-gray-600">This page will contain order management functionality.</p>
      </div>
    </div>
  );
}

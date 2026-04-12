/**
 * @file App root
 * @description Root component with providers and router
 * @module app/App
 */

import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/app/routes';
import { Component } from 'react';

// Simple ErrorBoundary as a class component (legacy-style but reliable)
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("App Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-black text-neutral-900 mb-4">Упс! Что-то пошло не так.</h1>
            <p className="text-neutral-500 mb-8">Приложение столкнулось с неожиданной ошибкой. Попробуйте обновить страницу.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// app/admin/layout.tsx
'use client';

// This layout no longer needs to check auth itself!
// It will just render a loading state while the page it wraps tries to fetch data.
// If the page fetch gets a 401, the page's code will handle the redirect.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can keep a simple loading state for initial page loads if we want,
  // but the real auth check happens inside the page components.
  return <div className="admin-container">{children}</div>;
}
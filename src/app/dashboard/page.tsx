import { redirect } from 'next/navigation';

// Alte Dashboard-Route → Redirect auf neue Home-Route
export default function DashboardRedirect() {
  redirect('/');
}

import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | Souleya',
  description: 'Dein Souleya Pre-Launch Dashboard – Seeds, Referral-Link und Aktivitäten.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}

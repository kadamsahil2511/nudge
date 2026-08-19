import './globals.css';
import type { Metadata } from 'next';
import { BudgetProvider } from '@/state/BudgetContext';
export const metadata: Metadata = {
  title: 'Nudge · Monthly budget',
  description: 'Plan money by day, without the spreadsheet.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BudgetProvider>{children}</BudgetProvider>
      </body>
    </html>
  );
}

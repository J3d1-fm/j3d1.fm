import type { Metadata } from 'next';
import FinanceReader from './reader';

export const metadata: Metadata = {
  title: 'DZO / GTR — J3D1.FM',
  description: 'Финансовый дашборд DZO / GTR.',
  alternates: {canonical: '/dzo-gtr/'},
  robots: {index: false, follow: false},
};

export default function FinancePage() {return <FinanceReader />;}

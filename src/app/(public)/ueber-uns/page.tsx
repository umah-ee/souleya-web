import type { Metadata } from 'next';
import UeberUnsClient from './UeberUnsClient';

export const metadata: Metadata = {
  title: 'Über uns | Souleya',
  description: 'Lerne die Menschen hinter Souleya kennen – Andreas und Steffi bauen eine Community für echtes Wachstum.',
};

export default function UeberUnsPage() {
  return <UeberUnsClient />;
}

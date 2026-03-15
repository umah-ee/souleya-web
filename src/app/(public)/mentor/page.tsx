import type { Metadata } from 'next';
import MentorContent from './MentorContent';

export const metadata: Metadata = {
  title: 'Als Mentor bewerben – Souleya',
  description:
    'Werde Teil von Souleya als Mentor. Teile dein Wissen, begleite Menschen auf ihrem Weg und verdiene dabei – ohne Plattformkosten.',
};

export default function MentorPage() {
  return <MentorContent />;
}

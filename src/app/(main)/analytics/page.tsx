import { Icon } from '@/components/ui/Icon';

export default function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
      >
        <Icon name="chart-dots" size={28} style={{ color: 'var(--gold)' }} />
      </div>
      <h1 className="font-heading text-xl mb-2" style={{ color: 'var(--text-h)' }}>
        Analytics
      </h1>
      <p className="font-body text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Auswertungen fuer Mentoren – Kursstatistiken, Teilnehmerverhalten, Umsaetze und Engagement deiner Angebote auf einen Blick.
      </p>
      <p className="font-label text-[0.6rem] tracking-[0.15em] uppercase mt-6" style={{ color: 'var(--gold-text)' }}>
        Bald verfuegbar
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: '#2C2A35' }}>
      <h1 style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: '3rem',
        fontWeight: 300,
        color: '#C8A96E',
        letterSpacing: '0.36em',
        textTransform: 'uppercase',
      }}>
        Souleya
      </h1>
      <p style={{
        fontFamily: 'var(--font-josefin)',
        fontSize: '0.75rem',
        color: '#a09a90',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginTop: '1rem',
      }}>
        Community für Wachstum
      </p>
    </main>
  );
}

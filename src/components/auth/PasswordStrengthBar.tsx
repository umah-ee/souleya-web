'use client';

interface PasswordStrengthBarProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'var(--text-muted)' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Schwach', color: 'var(--error)' };
  if (score <= 2) return { score, label: 'Okay', color: 'var(--gold-text)' };
  if (score <= 3) return { score, label: 'Gut', color: 'var(--gold-text)' };
  return { score, label: 'Stark', color: 'var(--success)' };
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= score ? color : 'var(--divider-l)',
            }}
          />
        ))}
      </div>
      <span
        className="text-[0.7rem] font-label tracking-[0.05em]"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

import React from 'react';

/**
 * Leichtes Markdown-Rendering fuer Chat-Nachrichten.
 * Unterstuetzt: **fett**, *kursiv*, `code`
 */
export function renderMarkdown(text: string): React.ReactNode {
  // Regex: Code → Bold → Italic (Reihenfolge verhindert Konflikte)
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Text vor dem Match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const raw = match[0];
    if (match[1]) {
      // `code`
      parts.push(
        <code
          key={key++}
          style={{
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            borderRadius: 4,
            padding: '0 4px',
            fontFamily: 'monospace',
            fontSize: '0.85em',
          }}
        >
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (match[2]) {
      // **bold**
      parts.push(<strong key={key++}>{raw.slice(2, -2)}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{raw.slice(1, -1)}</em>);
    }

    lastIndex = match.index + raw.length;
  }

  // Rest nach letztem Match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Wenn kein Match → puren Text zurueckgeben (kein unnoeiges Fragment)
  if (parts.length === 0) return text;
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

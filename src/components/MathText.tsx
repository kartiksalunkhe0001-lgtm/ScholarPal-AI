import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split on $$...$$ for display math, or $...$ for inline math
  const parts: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const raw = match[0];
    const isBlock = raw.startsWith('$$') && raw.endsWith('$$');
    const mathContent = isBlock ? raw.slice(2, -2) : raw.slice(1, -1);

    try {
      const html = katex.renderToString(mathContent, {
        displayMode: isBlock,
        throwOnError: false,
      });
      parts.push(
        <span
          key={`math-${match.index}`}
          dangerouslySetInnerHTML={{ __html: html }}
          className={isBlock ? 'block my-2 text-center' : 'inline-block mx-0.5'}
        />
      );
    } catch (err) {
      parts.push(<span key={`fallback-${match.index}`}>{raw}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};

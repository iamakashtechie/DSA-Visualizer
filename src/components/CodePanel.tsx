import { useEffect, useState, useRef } from 'react';
import { Icon } from './Icon';

interface CodePanelProps {
  code: string;
  language?: string;
}

export function CodePanel({ code, language = 'cpp' }: CodePanelProps) {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { codeToHtml } = await import('shiki');
        const result = await codeToHtml(code, {
          lang: language,
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        });
        if (!cancelled) setHtml(result);
      } catch {
        // Fallback: plain text
        if (!cancelled) setHtml(`<pre class="shiki-fallback"><code>${escapeHtml(code)}</code></pre>`);
      }
    })();
    return () => { cancelled = true; };
  }, [code, language]);

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-[--border] bg-[--surface]">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied!' : 'Copy code'}
        title={copied ? 'Copied!' : 'Copy code'}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium bg-[--surface-2] text-[--text-muted] hover:text-[--text] border border-[--border] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
      >
        <Icon name={copied ? 'check' : 'content_copy'} size={14} />
        {copied ? 'Copied' : 'Copy'}
      </button>

      {/* Code */}
      {html ? (
        <div
          className="overflow-x-auto text-sm p-4 font-mono code-panel"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto text-sm p-4 font-mono text-[--text]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

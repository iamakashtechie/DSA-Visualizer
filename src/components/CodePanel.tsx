import { useEffect, useState, useRef, useMemo } from 'react';
import { Icon } from './Icon';

interface CodePanelProps {
  code: string;
  language?: string;
  /** 1-based active line number to highlight (synced to player step) */
  activeLine?: number;
}

/** Post-process Shiki HTML to inject "line--active" class on the active line. */
function injectActiveLine(html: string, activeLine: number): string {
  let lineCount = 0;
  return html.replace(/class="line([^"]*)"/g, (_match, extra: string) => {
    lineCount++;
    const isActive = lineCount === activeLine;
    return `class="line${extra}${isActive ? ' line--active' : ''}"`;
  });
}

export function CodePanel({ code, language = 'cpp', activeLine }: CodePanelProps) {
  const [rawHtml, setRawHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Shiki once when code/language changes
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
        if (!cancelled) setRawHtml(result);
      } catch {
        if (!cancelled)
          setRawHtml(`<pre class="shiki-fallback"><code>${escapeHtml(code)}</code></pre>`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  // Inject active-line class whenever rawHtml or activeLine changes (cheap operation)
  const processedHtml = useMemo(() => {
    if (!rawHtml || !activeLine) return rawHtml;
    return injectActiveLine(rawHtml, activeLine);
  }, [rawHtml, activeLine]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (!containerRef.current || !activeLine) return;
    const activeEl = containerRef.current.querySelector<HTMLElement>('.line--active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeLine, processedHtml]);

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-auto max-h-[480px] text-sm p-4 font-mono code-panel"
      >
        {processedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
        ) : (
          <pre className="text-[--text] whitespace-pre">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

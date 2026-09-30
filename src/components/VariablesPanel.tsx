interface VariablesPanelProps {
  vars: Record<string, string | number | boolean | null | undefined>;
}

export function VariablesPanel({ vars }: VariablesPanelProps) {
  const entries = Object.entries(vars).filter(([, v]) => v !== null && v !== undefined);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-[--text-muted] px-2 py-4 text-center">
        No variables at this step.
      </p>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-[--surface] border border-[--border]">
      <table className="w-full text-sm" aria-label="C++ variables at current step">
        <thead>
          <tr className="border-b border-[--border]">
            <th className="text-left text-xs text-[--text-muted] font-medium pb-2 pr-4 w-1/3">
              Variable
            </th>
            <th className="text-left text-xs text-[--text-muted] font-medium pb-2">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-[--border]/50 last:border-b-0">
              <td className="py-1.5 pr-4 font-mono text-xs text-[--text-muted]">{key}</td>
              <td className="py-1.5 font-mono text-sm font-semibold text-[--text]">
                {formatValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return `"${v}"`;
}

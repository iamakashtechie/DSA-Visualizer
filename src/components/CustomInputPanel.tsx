import { useState, useEffect } from 'react';
import { InputSchema } from '../traces/lib/types';
import { Icon } from './Icon';

interface CustomInputPanelProps {
  schema: InputSchema;
  defaultInput: any;
  onSubmit: (input: any) => void;
}

export function CustomInputPanel({ schema, defaultInput, onSubmit }: CustomInputPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const [key, field] of Object.entries(schema)) {
      if (field.type === 'int-array' || field.type === 'int-grid') {
        init[key] = JSON.stringify(defaultInput[key] || []);
      } else {
        init[key] = String(defaultInput[key] ?? '');
      }
    }
    setValues(init);
  }, [schema, defaultInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed: any = {};

    try {
      for (const [key, field] of Object.entries(schema)) {
        const strVal = values[key];
        if (field.type === 'int-array') {
          const arr = JSON.parse(strVal);
          if (!Array.isArray(arr)) throw new Error(`${key} must be an array`);
          if (field.max && arr.length > field.max) throw new Error(`${key} length exceeds max of ${field.max}`);
          parsed[key] = arr.map(Number);
        } else if (field.type === 'int-grid') {
          const grid = JSON.parse(strVal);
          if (!Array.isArray(grid)) throw new Error(`${key} must be a 2D array`);
          if (field.max && grid.length > field.max) throw new Error(`${key} row count exceeds max of ${field.max}`);
          parsed[key] = grid.map((r: any) => {
             if (!Array.isArray(r)) throw new Error(`${key} must be a 2D array`);
             if (field.max && r.length > field.max) throw new Error(`${key} col count exceeds max of ${field.max}`);
             return r.map(Number);
          });
        } else if (field.type === 'int') {
          const num = Number(strVal);
          if (isNaN(num)) throw new Error(`${key} must be a number`);
          if (field.max !== undefined && num > field.max) throw new Error(`${key} exceeds max of ${field.max}`);
          if (field.min !== undefined && num < field.min) throw new Error(`${key} is below min of ${field.min}`);
          parsed[key] = num;
        } else if (field.type === 'string') {
          const s = strVal;
          if (field.max && s.length > field.max) throw new Error(`${key} length exceeds max of ${field.max}`);
          parsed[key] = s;
        } else {
          parsed[key] = JSON.parse(strVal);
        }
      }
      onSubmit(parsed);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    const init: Record<string, string> = {};
    for (const [key, field] of Object.entries(schema)) {
      if (field.type === 'int-array' || field.type === 'int-grid') {
        init[key] = JSON.stringify(defaultInput[key] || []);
      } else {
        init[key] = String(defaultInput[key] ?? '');
      }
    }
    setValues(init);
    setError(null);
    onSubmit(defaultInput);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-[--border] bg-[--surface] mt-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[--text]">Custom Input</h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[--text-muted] hover:text-[--text] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus] rounded px-1.5 py-0.5"
        >
          Reset to default
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(schema).map(([key, field]) => (
          <div key={key} className="flex flex-col gap-1">
            <label htmlFor={`input-${key}`} className="text-xs font-medium text-[--text-muted]">
              {field.label} {field.max ? `(max: ${field.max})` : ''}
            </label>
            <input
              id={`input-${key}`}
              type="text"
              value={values[key] ?? ''}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              className="px-3 py-1.5 rounded-lg border border-[--border] bg-[--bg] text-sm text-[--text] font-mono focus:border-[--accent] focus:outline-none transition-colors"
              placeholder={field.description}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="text-xs text-[--viz-danger] flex items-start gap-1.5 bg-[--viz-danger]/10 p-2 rounded border border-[--viz-danger]/20">
          <Icon name="error" size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-[--accent] text-[--accent-contrast] text-sm font-medium rounded-lg hover:bg-[--accent]/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]"
      >
        Run Trace
      </button>
    </form>
  );
}

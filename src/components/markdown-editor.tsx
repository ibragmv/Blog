import { Eye, LayoutTemplate, PenLine } from 'lucide-react';
import { useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
  placeholder?: string;
  rows?: number;
}

type ViewMode = 'write' | 'preview' | 'split';

export function MarkdownEditor({
  value,
  onChange,
  label,
  id,
  placeholder,
  rows = 15,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('write');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-400">
          {label}
        </label>
        <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('write')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'write'
                ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Write"
          >
            <PenLine size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'split'
                ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Split View"
          >
            <LayoutTemplate size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'preview'
                ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Preview"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      <div
        className={`relative w-full bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden ${
          viewMode === 'split' ? 'grid grid-cols-2 divide-x divide-zinc-800' : ''
        }`}
      >
        {/* Write Pane */}
        <div className={`${viewMode === 'preview' ? 'hidden' : 'block'} h-full`}>
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="w-full h-full px-3 py-2 bg-zinc-900 text-zinc-200 placeholder-zinc-600 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-700"
            placeholder={placeholder}
          />
        </div>

        {/* Preview Pane */}
        <div
          className={`${
            viewMode === 'write' ? 'hidden' : 'block'
          } h-full bg-zinc-900/50 overflow-y-auto px-4 py-2`}
          style={{ maxHeight: viewMode === 'split' ? `${rows * 1.5}rem` : undefined }}
        >
          <div className="prose prose-invert prose-sm max-w-none">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-zinc-600 italic">Nothing to preview</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

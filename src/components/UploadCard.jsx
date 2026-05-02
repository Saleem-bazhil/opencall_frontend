import { useRef } from "react";
import { formatSize } from "../utils/formatters";

export default function UploadCard({ title, subtitle, file, onFileSelect, onRemove, dragActive, onDragEnter, onDragLeave, onDrop, index }) {
  const inputRef = useRef(null);

  const baseClasses = `
    relative overflow-hidden rounded-2xl p-9 text-center cursor-pointer
    transition-all duration-300 ease-in-out card-bar
    border-[1.5px]
  `;

  const stateClasses = file
    ? "border-solid border-success bg-bg-card card-bar-green active"
    : dragActive
      ? "border-dashed border-accent bg-accent/5 shadow-[0_0_30px_rgba(99,102,241,0.15),inset_0_0_30px_rgba(99,102,241,0.05)]"
      : "border-dashed border-border-default bg-bg-card hover:border-border-active hover:bg-bg-card-hover hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] card-bar-indigo";

  const iconBg = index === 0
    ? "bg-gradient-to-br from-accent/15 to-purple-500/15"
    : "bg-gradient-to-br from-sky-500/15 to-accent/15";

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onClick={() => !file && inputRef.current?.click()}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
          e.target.value = "";
        }}
      />

      {/* Remove button */}
      {file && (
        <button
          className={`
            absolute top-3 right-3 w-7 h-7 rounded-lg border-none
            bg-error-bg text-error cursor-pointer
            flex items-center justify-center
            transition-all duration-200 opacity-100 hover:bg-error/20
          `}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Remove file"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Icon */}
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${iconBg}`}>
        {index === 0 ? (
          <svg className="w-7 h-7 text-accent-hover transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-accent-hover transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        )}
      </div>

      {/* Title & subtitle */}
      <h3 className="text-lg font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-[13px] text-text-muted mb-5">{subtitle}</p>

      {/* Drop text or file info */}
      {!file ? (
        <p className="text-sm text-text-secondary">
          Drag & drop or <span className="text-accent-hover font-semibold">browse</span>
        </p>
      ) : (
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-success-bg rounded-[10px] mt-4">
          <svg className="w-[18px] h-[18px] text-success shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          <span className="text-[13px] font-medium text-success truncate max-w-[200px]" title={file.name}>{file.name}</span>
          <span className="text-xs text-text-muted shrink-0">{formatSize(file.size)}</span>
        </div>
      )}
    </div>
  );
}

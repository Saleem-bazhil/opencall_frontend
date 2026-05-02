import { useState, useRef, useCallback } from "react";
import "./App.css";

const API_URL = "http://localhost:3001/api/opencall";

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function UploadCard({ title, subtitle, file, onFileSelect, onRemove, dragActive, onDragEnter, onDragLeave, onDrop, index }) {
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

function App() {
  const [flexWipFile, setFlexWipFile] = useState(null);
  const [callPlanFile, setCallPlanFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState({ flex: false, call: false });

  const handleDrag = useCallback((key, active) => {
    setDragActive((prev) => ({ ...prev, [key]: active }));
  }, []);

  const handleDrop = useCallback((key, setter, e) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [key]: false }));
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setter(droppedFile);
  }, []);

  const handleSubmit = async () => {
    if (!flexWipFile || !callPlanFile) {
      setStatus({ type: "error", message: "Please upload both files before submitting." });
      return;
    }

    setLoading(true);
    setStatus(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("flexWip", flexWipFile);
      formData.append("callPlan", callPlanFile);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: "success", message: data.message });
        setResult({
          flexWipRows: data.flexWipRows,
          callPlanRows: data.callPlanRows,
          totalInserted: data.totalInserted,
        });
        setFlexWipFile(null);
        setCallPlanFile(null);
      } else {
        setStatus({ type: "error", message: data.message || "Upload failed." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Is the backend running?" });
    } finally {
      setLoading(false);
    }
  };

  const bothFilesReady = flexWipFile && callPlanFile;

  return (
    <div className="max-w-[960px] mx-auto px-6 py-10">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-glow border border-accent/30 rounded-full text-xs font-semibold text-accent-hover uppercase tracking-wider mb-5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16,16 12,12 8,16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          Open Call Upload
        </div>
        <h1 className="text-4xl md:text-[40px] font-extrabold tracking-tight leading-tight text-gradient mb-3">
          Upload Daily Call Data
        </h1>
        <p className="text-text-secondary text-[17px] max-w-[480px] mx-auto">
          Upload your Flex WIP and Call Plan Excel files to process and store the daily call plan data.
        </p>
      </header>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <UploadCard
          title="FIELD EZ"
          subtitle=".xlsx / .xls / .csv"
          file={flexWipFile}
          onFileSelect={setFlexWipFile}
          onRemove={() => setFlexWipFile(null)}
          dragActive={dragActive.flex}
          onDragEnter={(e) => { e.preventDefault(); handleDrag("flex", true); }}
          onDragLeave={() => handleDrag("flex", false)}
          onDrop={(e) => handleDrop("flex", setFlexWipFile, e)}
          index={0}
        />
        <UploadCard
          title="FLEX WIP"
          subtitle=".xlsx / .xls / .csv"
          file={callPlanFile}
          onFileSelect={setCallPlanFile}
          onRemove={() => setCallPlanFile(null)}
          dragActive={dragActive.call}
          onDragEnter={(e) => { e.preventDefault(); handleDrag("call", true); }}
          onDragLeave={() => handleDrag("call", false)}
          onDrop={(e) => handleDrop("call", setCallPlanFile, e)}
          index={1}
        />
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          className={`
            btn-shimmer relative overflow-hidden inline-flex items-center justify-center gap-2.5
            px-12 py-3.5 bg-gradient-to-br from-accent to-purple-500
            text-white border-none rounded-xl text-base font-semibold
            font-sans cursor-pointer transition-all duration-300
            shadow-[0_4px_15px_rgba(99,102,241,0.3)]
            hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(99,102,241,0.4)]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
          `}
          disabled={!bothFilesReady || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-[2.5px] border-white/25 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16,16 12,12 8,16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              Upload & Process
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`
            mt-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-2.5
            animate-[slideUp_0.3s_ease]
            ${status.type === "success"
              ? "bg-success-bg border border-success/20 text-success"
              : "bg-error-bg border border-error/20 text-error"
            }
          `}
        >
          {status.type === "success" ? (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {status.message}
        </div>
      )}

      {/* Result Stats */}
      {result && (
        <div className="flex flex-col md:flex-row gap-4 mt-6 animate-[slideUp_0.4s_ease]">
          <div className="flex-1 p-5 bg-bg-card border border-border-default rounded-xl text-center">
            <div className="text-3xl font-extrabold text-gradient-accent">{result.flexWipRows}</div>
            <div className="text-[13px] text-text-muted mt-1 font-medium">Flex WIP Rows</div>
          </div>
          <div className="flex-1 p-5 bg-bg-card border border-border-default rounded-xl text-center">
            <div className="text-3xl font-extrabold text-gradient-accent">{result.callPlanRows}</div>
            <div className="text-[13px] text-text-muted mt-1 font-medium">Call Plan Rows</div>
          </div>
          <div className="flex-1 p-5 bg-bg-card border border-border-default rounded-xl text-center">
            <div className="text-3xl font-extrabold text-gradient-accent">{result.totalInserted}</div>
            <div className="text-[13px] text-text-muted mt-1 font-medium">Total Inserted</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

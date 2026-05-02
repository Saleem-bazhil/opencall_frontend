import { useState, useCallback } from "react";
import UploadCard from "../components/UploadCard";
import { ENDPOINTS } from "../api";

export default function UploadPage() {
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

      const res = await fetch(ENDPOINTS.OPENCALL_UPLOAD, {
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

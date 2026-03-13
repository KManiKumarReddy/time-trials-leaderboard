import React from "react";
import { X, AlertCircle, Loader2, Save } from "lucide-react";

interface PublishModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
  changeSummary: string[];
  publishError: string | null;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  onConfirm,
  onCancel,
  isSaving,
  changeSummary,
  publishError,
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl uppercase tracking-wider">
            Review & Publish
          </h3>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {publishError && (
          <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
            <div className="text-red-200 text-xs font-bold leading-tight">
              {publishError}
            </div>
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 text-sm space-y-1 overflow-y-auto max-h-48 scrollbar-thin">
          <div className="text-text-muted font-bold text-xs uppercase tracking-widest mb-2">
            Change Summary
          </div>
          {changeSummary.map((line, i) => (
            <div key={i} className="text-white/80">
              {line}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-text-muted border border-[#333] rounded-lg hover:bg-[#222] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 py-3 text-sm font-bold bg-brand-red hover:bg-brand-red-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Publishing..." : "Confirm & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

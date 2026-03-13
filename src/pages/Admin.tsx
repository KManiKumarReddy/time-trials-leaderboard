import React from "react";
import {
  PlusCircle,
  Settings,
  Globe,
  Heart,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AppData, Edition, Entry } from "../types";
import { LockScreen } from "../components/admin/LockScreen";
import { PublishModal } from "../components/admin/PublishModal";
import { EditionSection } from "../components/admin/EditionSection";
import { useAdmin } from "../hooks/useAdmin";

interface AdminProps {
  data: AppData;
  onLocalDataUpdate: (newData: AppData) => void;
}

export default function Admin({ data, onLocalDataUpdate }: AdminProps) {
  const {
    localData,
    isDirty,
    canUndo,
    undo,
    isLocked,
    isVerifying,
    authError,
    handleUnlock,
    showModal,
    setShowModal,
    isSaving,
    modalError,
    handlePublish,
    msg,
    expandedEdition,
    setExpandedEdition,
    handleConfigChange,
    handleAddEdition,
    dispatch,
  } = useAdmin(data, onLocalDataUpdate);

  if (!localData) return null;
  const { config, editions, entries, runners } = localData;

  const getChangeSummary = () => {
    const lines = [];
    if (JSON.stringify(data.config) !== JSON.stringify(localData.config))
      lines.push(`⚙️ Config modified`);
    if (data.runners.length !== localData.runners.length)
      lines.push(`👥 Runners added`);
    if (data.entries.length !== localData.entries.length)
      lines.push(`📝 Entries changed`);
    return lines.length > 0 ? lines : ["Changes detected..."];
  };

  const sortedEditions = [...editions].sort((a, b) => b.num - a.num);

  return (
    <div className="py-6 sm:py-12 max-w-4xl mx-auto space-y-8 pb-32">
      {isLocked ? (
        <LockScreen
          onUnlock={handleUnlock}
          error={authError}
          isVerifying={isVerifying}
        />
      ) : (
        <>
          {showModal && (
            <PublishModal
              onConfirm={handlePublish}
              onCancel={() => setShowModal(false)}
              isSaving={isSaving}
              changeSummary={getChangeSummary()}
              publishError={modalError}
            />
          )}

          {/* Hero Header */}
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Settings size={180} className="text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-brand-red/10 p-2 rounded-xl border border-brand-red/20 text-brand-red">
                    <Settings size={28} />
                  </div>
                  <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-wider">
                    Console
                  </h2>
                </div>
                <p className="text-text-muted text-sm sm:text-base max-w-md">
                  Manage editions and logs for {config.club}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {canUndo && (
                  <button
                    onClick={undo}
                    className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest border border-white/10 transition-all font-sans"
                  >
                    Undo Changes
                  </button>
                )}
                {isDirty && (
                  <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/30 rounded-full px-4 py-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-brand-red" />
                    <span className="text-brand-red text-[0.7rem] font-bold uppercase tracking-widest font-sans">
                      Unsaved
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {msg && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${msg.type === "error" ? "bg-red-950/50 border-brand-red text-red-200" : "bg-green-950/50 border-green-500/50 text-green-200"}`}
            >
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">{msg.text}</span>
            </div>
          )}

          {/* Editions List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                <Globe className="text-brand-red" size={24} /> Records
              </h3>
              <button
                onClick={handleAddEdition}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 font-sans"
              >
                <PlusCircle size={16} className="text-brand-red" /> New Edition
              </button>
            </div>

            <div className="space-y-4 font-sans">
              {sortedEditions.map((ed) => (
                <EditionSection
                  key={ed.id}
                  edition={ed}
                  entries={entries.filter((e) => e.editionId === ed.id)}
                  runners={runners}
                  isExpanded={expandedEdition === ed.id}
                  onToggleExpand={() =>
                    setExpandedEdition(expandedEdition === ed.id ? null : ed.id)
                  }
                  onDeleteEdition={() => {
                    if (confirm("Delete this edition?"))
                      dispatch({ type: "DELETE_EDITION", id: ed.id });
                  }}
                  onUpdateEdition={(field, value) =>
                    dispatch({
                      type: "UPDATE_EDITION",
                      id: ed.id,
                      field,
                      value,
                    })
                  }
                  onAddEntry={(runnerId) => {
                    const newId = `en_${Date.now()}`;
                    dispatch({
                      type: "ADD_ENTRY",
                      payload: {
                        id: newId,
                        editionId: ed.id,
                        runnerId,
                        time: "",
                        status: "dns",
                      },
                    });
                  }}
                  onAddNewRunner={(name, gender) => {
                    const rId = `r_${Date.now()}`;
                    const enId = `en_${Date.now() + 1}`;
                    dispatch({
                      type: "ADD_RUNNER",
                      payload: { id: rId, name, gender },
                    });
                    dispatch({
                      type: "ADD_ENTRY",
                      payload: {
                        id: enId,
                        editionId: ed.id,
                        runnerId: rId,
                        time: "",
                        status: "dns",
                      },
                    });
                  }}
                  onUpdateEntry={(id, field, value) => {
                    const status =
                      field === "time" && value && value.includes(":")
                        ? ("ok" as const)
                        : undefined;
                    dispatch({ type: "UPDATE_ENTRY", id, field, value });
                    if (status)
                      dispatch({
                        type: "UPDATE_ENTRY",
                        id,
                        field: "status",
                        value: status,
                      });
                  }}
                  onToggleDnf={(id) => {
                    const ent = entries.find((e) => e.id === id);
                    if (ent)
                      dispatch({
                        type: "UPDATE_ENTRY",
                        id,
                        field: "status",
                        value: ent.status === "dnf" ? "dns" : "dnf",
                      });
                  }}
                  onDeleteEntry={(id) => {
                    if (confirm("Remove entry?"))
                      dispatch({ type: "DELETE_ENTRY", id });
                  }}
                />
              ))}
            </div>
          </div>

          {/* Global Config */}
          <div className="space-y-6 pt-6 font-sans">
            <h3 className="font-display font-bold text-xl uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
              <Heart className="text-brand-red" size={24} /> Configuration
            </h3>
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                    Club Name
                  </label>
                  <input
                    type="text"
                    name="club"
                    value={config.club}
                    onChange={handleConfigChange}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                    Season
                  </label>
                  <input
                    type="text"
                    name="season"
                    value={config.season}
                    onChange={handleConfigChange}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                    Typical Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={config.location}
                    onChange={handleConfigChange}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                    Default Distance
                  </label>
                  <input
                    type="text"
                    name="distance"
                    value={config.distance}
                    onChange={handleConfigChange}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                  Event Description (Markdown/Text)
                </label>
                <textarea
                  name="description"
                  value={config.description}
                  onChange={handleConfigChange}
                  rows={5}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="pt-6 border-t border-white/5">
                <h4 className="text-text-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
                  SEO Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Page Title
                    </label>
                    <input
                      type="text"
                      name="seo.title"
                      value={config.seo.title}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      name="seo.ogImage"
                      value={config.seo.ogImage}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Meta Description
                    </label>
                    <textarea
                      name="seo.description"
                      value={config.seo.description}
                      onChange={handleConfigChange}
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red resize-none text-sm leading-relaxed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Meta Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      name="seo.keywords"
                      value={config.seo.keywords}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h4 className="text-text-muted text-[0.65rem] font-bold uppercase tracking-widest mb-4">
                  Social Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Website
                    </label>
                    <input
                      type="text"
                      name="social.website"
                      value={config.social.website || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="social.instagram"
                      value={config.social.instagram || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Twitter
                    </label>
                    <input
                      type="text"
                      name="social.twitter"
                      value={config.social.twitter || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Facebook
                    </label>
                    <input
                      type="text"
                      name="social.facebook"
                      value={config.social.facebook || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      YouTube
                    </label>
                    <input
                      type="text"
                      name="social.youtube"
                      value={config.social.youtube || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Email
                    </label>
                    <input
                      type="text"
                      name="social.email"
                      value={config.social.email || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Affiliation (Club/Group)
                    </label>
                    <input
                      type="text"
                      name="social.affiliation"
                      value={config.social.affiliation || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[0.65rem] font-bold uppercase text-text-muted mb-2 tracking-widest">
                      Affiliation URL
                    </label>
                    <input
                      type="text"
                      name="social.affiliationUrl"
                      value={config.social.affiliationUrl || ""}
                      onChange={handleConfigChange}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-brand-red"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          {isDirty && (
            <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-50">
              <div className="max-w-[1100px] w-full mx-auto px-4 h-full flex items-end pb-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-display font-black py-4 rounded-2xl uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  Review & Publish
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useRef, useMemo, useEffect } from 'react';
import { updateStats } from '../api/github';
import { PlusCircle, Save, Settings, Loader2, Lock, X, Trash2, AlertCircle, Share2, Globe, Heart, UserPlus, Search, CheckCircle2 } from 'lucide-react';
import CryptoJS from 'crypto-js';

// Split MM:SS input component
function TimeInput({ value, onChange, disabled }) {
  const [mm, ss] = (value || '').split(':');
  const minRef = useRef(null);
  const secRef = useRef(null);

  const handleMinChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 2);
    onChange(`${v}:${ss || ''}`);
    if (v.length >= 2) secRef.current?.focus();
  };

  const handleSecChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 2);
    onChange(`${mm || ''}:${v}`);
  };

  const handleSecKeyDown = (e) => {
    if (e.key === 'Backspace' && (ss === '' || ss === undefined)) {
      e.preventDefault();
      minRef.current?.focus();
    }
  };

  return (
    <div className={`flex items-center gap-0.5 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <input
        ref={minRef}
        inputMode="numeric"
        placeholder="00"
        value={mm || ''}
        onChange={handleMinChange}
        className="w-10 bg-[#0a0a0a] border border-[#333] rounded py-2 text-sm text-white font-mono outline-none focus:border-brand-red text-center"
      />
      <span className="text-white/40 font-mono text-lg">:</span>
      <input
        ref={secRef}
        inputMode="numeric"
        placeholder="00"
        value={ss || ''}
        onChange={handleSecChange}
        onKeyDown={handleSecKeyDown}
        className="w-10 bg-[#0a0a0a] border border-[#333] rounded py-2 text-sm text-white font-mono outline-none focus:border-brand-red text-center"
      />
    </div>
  );
}

// Searchable Runner Picker
function RunnerPicker({ runners, onSelect, onAddNew }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [gender, setGender] = useState('M');
  const dropdownRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return [];
    return runners.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query, runners]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input 
            type="text"
            placeholder="Search for a runner..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-brand-red outline-none"
          />
        </div>
        {isOpen && query && !filtered.find(r => r.name.toLowerCase() === query.toLowerCase()) && (
          <select 
            value={gender} 
            onChange={(e) => setGender(e.target.value)}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-brand-red"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        )}
      </div>

      {isOpen && (query || filtered.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r.id);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-brand-red/10 hover:text-white transition-colors border-b border-white/5 last:border-0 flex justify-between items-center"
            >
              <span>{r.name}</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted">{r.gender === 'F' ? 'Female' : 'Male'}</span>
            </button>
          ))}
          {query && !filtered.find(r => r.name.toLowerCase() === query.toLowerCase()) && (
            <button
              onClick={() => {
                onAddNew(query, gender);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-brand-red font-bold hover:bg-brand-red/5 transition-colors flex items-center gap-2"
            >
              <UserPlus size={14} /> Add "{query}" as {gender === 'F' ? 'Female' : 'Male'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Publish confirmation modal
function PublishModal({ onConfirm, onCancel, isSaving, changeSummary, publishError }) {
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleConfirm = () => {
    if (!password) {
      setValidationError('Password is required.');
      return;
    }
    setValidationError('');
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl uppercase tracking-wider">Review & Publish</h3>
          <button onClick={onCancel} className="text-text-muted hover:text-white"><X size={20} /></button>
        </div>

        {(validationError || publishError) && (
          <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
            <div className="text-red-200 text-xs font-bold leading-tight">
              {validationError || publishError}
            </div>
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 text-sm space-y-1 overflow-y-auto max-h-48 scrollbar-thin">
          <div className="text-text-muted font-bold text-xs uppercase tracking-widest mb-2">Change Summary</div>
          {changeSummary.map((line, i) => (
            <div key={i} className="text-white/80">{line}</div>
          ))}
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-widest text-[#a3a3a3] mb-2">
            <Lock size={12} /> Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            placeholder="••••••••"
            autoFocus
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all font-mono text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-text-muted border border-[#333] rounded-lg hover:bg-[#222] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="flex-1 py-3 text-sm font-bold bg-brand-red hover:bg-brand-red-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Publishing...' : 'Confirm & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin({ data, reloadData, onLocalDataUpdate }) {
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedEdition, setExpandedEdition] = useState(null);

  // Local state copy
  const [localData, setLocalData] = useState(() => {
    return data ? JSON.parse(JSON.stringify(data)) : null;
  });

  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(localData);
  }, [data, localData]);

  if (!localData) return null;

  const { config, editions, entries, runners } = localData;

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setLocalData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [parent]: { ...prev.config[parent], [child]: value }
        }
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        config: { ...prev.config, [name]: value }
      }));
    }
  };

  const handleAddEdition = () => {
    const newId = `ed_${Date.now()}`;
    const nextNum = editions.length > 0 ? Math.max(...editions.map(e => e.num)) + 1 : 1;
    setLocalData(prev => ({
      ...prev,
      editions: [...prev.editions, { id: newId, num: nextNum, date: new Date().toISOString().split('T')[0], location: config.location || '' }]
    }));
    setExpandedEdition(newId);
  };

  const handleDeleteEdition = (id) => {
    if (confirm('Delete this edition and ALL linked entries?')) {
      setLocalData(prev => ({
        ...prev,
        editions: prev.editions.filter(e => e.id !== id),
        entries: prev.entries.filter(e => e.editionId !== id)
      }));
    }
  };

  const handleEditionChange = (id, field, value) => {
    setLocalData(prev => ({
      ...prev,
      editions: prev.editions.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const handleAddEntryToEdition = (editionId, runnerId) => {
    const newId = `entry_${Date.now()}`;
    setLocalData(prev => ({
      ...prev,
      entries: [{ id: newId, editionId, runnerId, time: '', status: 'dns' }, ...prev.entries]
    }));
  };

  const handleAddNewRunnerAndAddEntry = (editionId, name, gender) => {
    const runnerId = `runner_${Date.now()}`;
    const entryId = `entry_${Date.now() + 1}`;
    setLocalData(prev => ({
      ...prev,
      runners: [...prev.runners, { id: runnerId, name, gender }],
      entries: [{ id: entryId, editionId, runnerId, time: '', status: 'dns' }, ...prev.entries]
    }));
  };

  const handleEntryChange = (id, field, value) => {
    setLocalData(prev => {
      const newEntries = prev.entries.map(e => {
        if (e.id === id) {
          const update = { ...e, [field]: value };
          // Logic: If time is added, status becomes finish (ok)
          if (field === 'time' && value && value.includes(':') && value.length >= 4) {
             update.status = 'ok';
          }
          return update;
        }
        return e;
      });
      return { ...prev, entries: newEntries };
    });
  };

  const deleteEntry = (id) => {
    if(confirm('Delete this entry?')) {
      setLocalData(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e.id !== id)
      }));
    }
  };

  const getChangeSummary = () => {
    const lines = [];
    if (JSON.stringify(data.config) !== JSON.stringify(localData.config)) lines.push(`⚙️  App Configuration modified`);
    if (data.runners.length !== localData.runners.length) lines.push(`👥  ${localData.runners.length - data.runners.length} new runners added`);
    
    const edDiff = localData.editions.length - data.editions.length;
    if (edDiff !== 0) lines.push(`📅  ${Math.abs(edDiff)} edition(s) ${edDiff > 0 ? 'added' : 'removed'}`);
    
    const entryDiff = localData.entries.length - data.entries.length;
    const modifiedCount = localData.entries.filter(e => {
      const orig = data.entries.find(o => o.id === e.id);
      return orig && JSON.stringify(orig) !== JSON.stringify(e);
    }).length;
    
    if (entryDiff !== 0) lines.push(`🏃  ${Math.abs(entryDiff)} entry(ies) ${entryDiff > 0 ? 'added' : 'removed'}`);
    if (modifiedCount > 0) lines.push(`✏️  ${modifiedCount} performance(s) updated`);
    
    return lines.length > 0 ? lines : ['No changes detected.'];
  };

  const handlePublish = async (password) => {
    setIsSaving(true);
    setModalError(null);
    try {
      const encryptedPat = import.meta.env.VITE_ENCRYPTED_PAT;
      const bytes = CryptoJS.AES.decrypt(encryptedPat, password);
      const decryptedPat = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedPat || decryptedPat.length < 10) throw new Error('Incorrect Password.');

      await updateStats(decryptedPat, localData);
      onLocalDataUpdate(localData);
      setMsg({ type: 'success', text: 'Changes published successfully!' });
      setShowModal(false);
      setTimeout(() => setMsg(null), 5000);
    } catch(err) {
      setModalError(err.message || 'Publish failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Grouped entries by Edition
  const editionGroups = useMemo(() => {
    const sortedEds = [...editions].sort((a, b) => b.num - a.num);
    return sortedEds.map(ed => ({
      ...ed,
      entries: entries.filter(e => e.editionId === ed.id)
    }));
  }, [editions, entries]);

  return (
    <div className="py-6 sm:py-12 max-w-4xl mx-auto space-y-8 pb-32">
      {showModal && (
        <PublishModal
          onConfirm={handlePublish}
          onCancel={() => { setShowModal(false); setModalError(null); }}
          isSaving={isSaving}
          changeSummary={getChangeSummary()}
          publishError={modalError}
        />
      )}

      {/* Hero Header */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Settings size={180} className="text-white" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-red/10 p-2 rounded-xl border border-brand-red/20 text-brand-red">
                <Settings size={28} />
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-wider">Console</h2>
            </div>
            <p className="text-text-muted text-sm sm:text-base max-w-md">Manage editions, log runner times, and optimize SEO for {config.club}.</p>
          </div>
          {isDirty && (
            <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/30 rounded-full px-4 py-2 animate-pulse shadow-lg shadow-brand-red/5">
              <div className="w-2 h-2 rounded-full bg-brand-red" />
              <span className="text-brand-red text-[0.7rem] font-bold uppercase tracking-widest">Unsaved Changes</span>
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl ${msg.type === 'error' ? 'bg-red-950/50 border-brand-red text-red-200' : 'bg-green-950/50 border-green-500/50 text-green-200'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold tracking-wide">{msg.text}</span>
        </div>
      )}

      {/* Hierarchy: Editions & Entries */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl uppercase tracking-widest flex items-center gap-3">
            <Globe className="text-brand-red" size={24} /> Records & Editions
          </h3>
          <button onClick={handleAddEdition} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-all hover:scale-105">
            <PlusCircle size={16} className="text-brand-red" /> New Edition
          </button>
        </div>

        <div className="space-y-4">
          {editionGroups.map(ed => (
            <div key={ed.id} className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden shadow-lg transition-all hover:border-white/10">
              {/* Edition Header */}
              <div 
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${expandedEdition === ed.id ? 'bg-white/5' : 'hover:bg-white-[0.02]'}`}
                onClick={() => setExpandedEdition(expandedEdition === ed.id ? null : ed.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#0a0a0a] border border-[#333] px-3 py-1.5 rounded-lg text-brand-red font-display font-black text-xl">
                    {ed.num}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm sm:text-base">Edition {ed.num}</div>
                    <div className="text-text-muted text-[0.65rem] sm:text-xs uppercase tracking-widest font-bold">
                      {ed.date || 'No Date'} • {ed.entries.length} Entries
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteEdition(ed.id); }} className="text-[#444] hover:text-brand-red p-2 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className={`text-text-muted transition-transform duration-300 ${expandedEdition === ed.id ? 'rotate-180' : ''}`}>
                    <PlusCircle size={20} />
                  </div>
                </div>
              </div>

              {/* Expanded Edition Content */}
              {expandedEdition === ed.id && (
                <div className="p-4 sm:p-6 bg-[#0c0c0c] border-t border-[#333] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Edition Settings */}
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                    <div>
                      <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-2">Event Date</label>
                      <input type="date" value={ed.date} onChange={e => handleEditionChange(ed.id, 'date', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-red" />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-2">Location</label>
                      <input type="text" value={ed.location} onChange={e => handleEditionChange(ed.id, 'location', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-red" />
                    </div>
                  </div>

                  {/* Entry Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[0.65rem] font-bold tracking-widest uppercase text-text-muted">Runner Logs</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 bg-[#111] p-3 rounded-xl border border-[#222]">
                      <RunnerPicker 
                        runners={runners} 
                        onSelect={(runnerId) => handleAddEntryToEdition(ed.id, runnerId)}
                        onAddNew={(name, gender) => handleAddNewRunnerAndAddEntry(ed.id, name, gender)}
                      />
                    </div>

                    <div className="space-y-2">
                      {ed.entries.map(entry => {
                        const runner = runners.find(r => r.id === entry.runnerId);
                        const isDns = entry.status === 'dns';
                        const isDnf = entry.status === 'dnf';
                        const isOk = entry.status === 'ok';
                        
                        return (
                          <div key={entry.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center bg-[#0a0a0a] border border-[#222] p-3 rounded-xl transition-all hover:border-brand-red/20 group">
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2">
                                 <div className="text-white font-bold text-sm truncate">{runner?.name || 'Unknown'}</div>
                                 <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted font-black">{runner?.gender || 'M'}</span>
                               </div>
                               <div className="text-[0.6rem] text-text-muted uppercase tracking-widest font-bold mt-0.5">
                                 {isOk ? 'Finished' : isDnf ? 'DNF' : 'DNS'}
                               </div>
                            </div>
                            <div className="flex gap-4 items-center self-end sm:self-auto">
                              <div className="flex items-center gap-3">
                                <TimeInput 
                                  value={entry.time} 
                                  onChange={(val) => handleEntryChange(entry.id, 'time', val)}
                                  disabled={isDns || isDnf}
                                />
                                <div className="h-8 w-px bg-[#333] hidden sm:block" />
                                <div className="flex items-center gap-3">
                                  <div className="flex rounded-lg overflow-hidden border border-[#333]">
                                    <button 
                                      onClick={() => handleEntryChange(entry.id, 'status', 'dns')}
                                      className={`px-3 py-1.5 text-[0.6rem] font-bold tracking-widest uppercase transition-colors ${isDns ? 'bg-brand-red text-white' : 'bg-[#0a0a0a] text-text-muted hover:text-white'}`}
                                    >
                                      DNS
                                    </button>
                                    <button 
                                      onClick={() => handleEntryChange(entry.id, 'status', 'dnf')}
                                      className={`px-3 py-1.5 text-[0.6rem] font-bold tracking-widest uppercase transition-colors ${isDnf ? 'bg-orange-600 text-white' : 'bg-[#0a0a0a] text-text-muted hover:text-white'}`}
                                    >
                                      DNF
                                    </button>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} className="text-[#555] hover:text-brand-red p-2 transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Global Settings (BOTTOM) */}
      <div className="space-y-6 pt-6">
        <h3 className="font-display font-bold text-xl uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-3">
           <Heart className="text-brand-red" size={24} /> Branding & Config
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Core Info */}
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 space-y-5">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-red/80 pb-2 border-b border-white/5 mb-4">Core Settings</div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Club Name</label>
                <input type="text" name="club" value={config.club || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Default Distance</label>
                <input type="text" name="distance" value={config.distance || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Logo Path (public/logo.png)</label>
                <input type="text" name="logoUrl" value={config.logoUrl || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Cover Photo URL</label>
                <input type="text" name="coverPhotoUrl" value={config.coverPhotoUrl || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* Social Presence */}
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 space-y-5">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-red/80 pb-2 border-b border-white/5 mb-4">Social & Links</div>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Instagram URL</label>
                <input type="text" name="social.instagram" value={config.social?.instagram || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Facebook URL</label>
                <input type="text" name="social.facebook" value={config.social?.facebook || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">X/Twitter URL</label>
                <input type="text" name="social.twitter" value={config.social?.twitter || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">YouTube URL</label>
                <input type="text" name="social.youtube" value={config.social?.youtube || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Registration Link</label>
                <input type="text" name="googleForm" value={config.googleForm || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Optimization */}
        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 space-y-5">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-red/80 pb-2 border-b border-white/5 mb-4">SEO Optimization</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Meta Title</label>
                <input type="text" name="seo.title" value={config.seo?.title || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Keywords (comma separated)</label>
                <input type="text" name="seo.keywords" value={config.seo?.keywords || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2">Meta Description</label>
              <textarea name="seo.description" value={config.seo?.description || ''} onChange={handleConfigChange} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-brand-red outline-none h-[116px] text-sm resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Home Description */}
        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 pt-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-red/50" />
          <div className="text-xs font-bold uppercase tracking-widest text-brand-red/80 mb-4">Leaderboard Description (with Line Breaks)</div>
          <textarea 
            name="description" 
            value={config.description || ''} 
            onChange={handleConfigChange} 
            placeholder="Introduce the season and distance..."
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-brand-red outline-none h-40 text-sm leading-relaxed"
          ></textarea>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-50 transition-opacity duration-300" style={{ opacity: isDirty ? 1 : 0 }}>
        <div className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 h-full flex items-end pb-6">
          <button 
            onClick={() => setShowModal(true)}
            className="w-full pointer-events-auto bg-brand-red hover:bg-brand-red-dark text-white font-display font-black text-sm sm:text-base py-4 rounded-2xl uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            Review & Publish Changes
          </button>
        </div>
      </div>
    </div>
  );
}

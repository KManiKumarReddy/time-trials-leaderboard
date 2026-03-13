import { useState, useRef } from 'react';
import { updateStats } from '../api/github';
import { PlusCircle, Save, Settings, Loader2, Lock, X, Trash2 } from 'lucide-react';
import CryptoJS from 'crypto-js';

// Split MM:SS input component
function TimeInput({ value, onChange }) {
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
    <div className="flex items-center gap-0.5">
      <input
        ref={minRef}
        inputMode="numeric"
        placeholder="MM"
        value={mm || ''}
        onChange={handleMinChange}
        className="w-10 bg-[#0a0a0a] border border-[#333] rounded py-2 text-sm text-white font-mono outline-none focus:border-brand-red text-center"
      />
      <span className="text-white/40 font-mono text-lg">:</span>
      <input
        ref={secRef}
        inputMode="numeric"
        placeholder="SS"
        value={ss || ''}
        onChange={handleSecChange}
        onKeyDown={handleSecKeyDown}
        className="w-10 bg-[#0a0a0a] border border-[#333] rounded py-2 text-sm text-white font-mono outline-none focus:border-brand-red text-center"
      />
    </div>
  );
}

// Publish confirmation modal
function PublishModal({ onConfirm, onCancel, isSaving, changeSummary }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!password) {
      setError('Password is required.');
      return;
    }
    setError('');
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl uppercase tracking-wider">Review & Publish</h3>
          <button onClick={onCancel} className="text-text-muted hover:text-white"><X size={20} /></button>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 text-sm space-y-1">
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
          {error && <p className="text-red-400 text-xs mt-2 font-bold">{error}</p>}
        </div>

        <div className="flex gap-3">
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

export default function Admin({ data, reloadData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bulkNames, setBulkNames] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Local state copy of the data that we can mutate
  const [localData, setLocalData] = useState(() => {
    return data ? JSON.parse(JSON.stringify(data)) : null;
  });

  if (!localData) return null;

  const { config, editions, entries } = localData;

  const handleConfigChange = (e) => {
    setLocalData(prev => ({
      ...prev,
      config: { ...prev.config, [e.target.name]: e.target.value }
    }));
  };

  const handleAddEdition = () => {
    const newId = `ed_${Date.now()}`;
    const nextNum = editions.length > 0 ? editions[editions.length - 1].num + 1 : 1;
    setLocalData(prev => ({
      ...prev,
      editions: [...prev.editions, { id: newId, num: nextNum, date: new Date().toISOString().split('T')[0], location: '' }]
    }));
  };

  const handleDeleteEdition = (id) => {
    if (confirm('Delete this edition and all its entries?')) {
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

  const handleAddEntry = () => {
    const newId = `entry_${Date.now()}`;
    setLocalData(prev => ({
      ...prev,
      entries: [{ id: newId, editionId: editions[editions.length-1]?.id || '', name: '', time: '', status: 'ok' }, ...prev.entries]
    }));
  };

  const handleEntryChange = (id, field, value) => {
    setLocalData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const deleteEntry = (id) => {
    if(confirm('Delete this entry?')) {
      setLocalData(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e.id !== id)
      }));
    }
  }

  const handleBulkAdd = () => {
    if (!bulkNames.trim()) return;
    const names = bulkNames.split('\n').map(n => n.trim()).filter(n => n);
    const editionId = editions[editions.length-1]?.id || '';
    
    const newEntries = names.map((name, i) => ({
      id: `entry_${Date.now()}_${i}`,
      editionId,
      name,
      time: '',
      status: 'dns'
    }));
    
    setLocalData(prev => ({
      ...prev,
      entries: [...newEntries, ...prev.entries]
    }));
    setBulkNames('');
  };

  // Build a change summary for the modal
  const getChangeSummary = () => {
    const original = data ? JSON.parse(JSON.stringify(data)) : { config: {}, editions: [], entries: [] };
    const lines = [];
    
    // Config changes
    const configKeys = Object.keys({ ...original.config, ...localData.config });
    const configChanges = configKeys.filter(k => original.config[k] !== localData.config[k]);
    if (configChanges.length > 0) lines.push(`⚙️  ${configChanges.length} setting(s) modified`);
    
    // Edition changes
    const newEditions = localData.editions.filter(e => !original.editions.find(o => o.id === e.id));
    const removedEditions = original.editions.filter(e => !localData.editions.find(o => o.id === e.id));
    if (newEditions.length > 0) lines.push(`📅  ${newEditions.length} edition(s) added`);
    if (removedEditions.length > 0) lines.push(`🗑️  ${removedEditions.length} edition(s) removed`);
    
    // Entry changes
    const newEntries = localData.entries.filter(e => !original.entries.find(o => o.id === e.id));
    const removedEntries = original.entries.filter(e => !localData.entries.find(o => o.id === e.id));
    const modifiedEntries = localData.entries.filter(e => {
      const orig = original.entries.find(o => o.id === e.id);
      return orig && JSON.stringify(orig) !== JSON.stringify(e);
    });
    if (newEntries.length > 0) lines.push(`🏃  ${newEntries.length} entry(ies) added`);
    if (removedEntries.length > 0) lines.push(`❌  ${removedEntries.length} entry(ies) removed`);
    if (modifiedEntries.length > 0) lines.push(`✏️  ${modifiedEntries.length} entry(ies) modified`);
    
    if (lines.length === 0) lines.push('No changes detected.');
    return lines;
  };

  const handlePublish = async (password) => {
    setIsSaving(true);
    setMsg(null);
    
    try {
      const encryptedPat = import.meta.env.VITE_ENCRYPTED_PAT;
      
      if (!encryptedPat) {
        throw new Error('No encrypted PAT found in build. Ensure env variables are set in GitHub Actions.');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedPat, password);
      const decryptedPat = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPat || decryptedPat.length < 10) {
        throw new Error('Incorrect Password. Decryption failed.');
      }

      await updateStats(decryptedPat, localData);
      setMsg({ type: 'success', text: 'Published! Changes are live instantly.' });
      setShowModal(false);
      reloadData();
    } catch(err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update. Check console.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-6 sm:py-12 max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-28">
      
      {showModal && (
        <PublishModal
          onConfirm={handlePublish}
          onCancel={() => setShowModal(false)}
          isSaving={isSaving}
          changeSummary={getChangeSummary()}
        />
      )}

      {/* Top Banner */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-[2px] pointer-events-none hidden sm:block">
          <Settings size={120} className="text-white" />
        </div>
        
        <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider mb-2">Admin Dashboard</h2>
        <p className="text-text-muted text-sm">Make your changes below. Tap "Review & Publish" when ready — changes go live instantly.</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg border text-sm font-bold ${msg.type === 'error' ? 'bg-red-950/50 border-brand-red text-red-200' : 'bg-green-950/50 border-green-500 text-green-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Configuration Section */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider border-b border-border-subtle pb-2">Global Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Club Name</label>
            <input type="text" name="club" value={config.club || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none text-sm" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Season String</label>
            <input type="text" name="season" value={config.season || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none text-sm" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Distance</label>
            <input type="text" name="distance" value={config.distance || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none text-sm" />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Cover Photo URL</label>
            <input type="text" name="coverPhotoUrl" value={config.coverPhotoUrl || ''} onChange={handleConfigChange} placeholder="coverpic.jpg or https://..." className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none text-sm" />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Description</label>
            <textarea name="description" value={config.description || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none h-16 text-sm"></textarea>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Signup / Google Form Link</label>
            <input type="text" name="googleForm" value={config.googleForm || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none text-sm" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Location</label>
            <input type="text" name="location" value={config.location || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none text-sm" />
          </div>
        </div>
      </div>

      {/* Editions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider">Editions</h3>
          <button onClick={handleAddEdition} className="flex items-center gap-1.5 text-xs text-brand-red font-bold hover:text-brand-red-dark">
            <PlusCircle size={14} /> Add
          </button>
        </div>
        
        {editions.length === 0 && <div className="text-text-muted text-sm italic py-4">No editions yet. Create one!</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {editions.map(edition => (
            <div key={edition.id} className="bg-[#111] border border-[#333] p-3 sm:p-4 rounded-xl space-y-3">
              <div className="flex gap-2">
                <div className="w-14">
                  <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-1">Num</label>
                  <input type="number" inputMode="numeric" value={edition.num} onChange={e => handleEditionChange(edition.id, 'num', Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-white font-mono text-sm outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-1">Date</label>
                  <input type="date" value={edition.date} onChange={e => handleEditionChange(edition.id, 'date', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-white text-sm outline-none" />
                </div>
                <button onClick={() => handleDeleteEdition(edition.id)} className="self-end text-[#555] hover:text-brand-red p-1.5"><Trash2 size={14} /></button>
              </div>
              <div>
                <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-1">Location</label>
                <input type="text" value={edition.location} onChange={e => handleEditionChange(edition.id, 'location', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-white text-sm outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Times Entry Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider">Entries</h3>
          <button onClick={handleAddEntry} className="flex items-center gap-1.5 text-xs text-brand-red font-bold hover:text-brand-red-dark">
            <PlusCircle size={14} /> Add
          </button>
        </div>

        <div className="bg-[#111] border border-[#333] p-3 sm:p-4 rounded-xl space-y-3">
          <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Bulk Add Participants (1 name per line)</label>
          <div className="flex gap-2 items-start">
            <textarea 
              value={bulkNames} 
              onChange={e => setBulkNames(e.target.value)} 
              placeholder={"John Doe\nJane Smith\n..."}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none h-20 text-sm"
            ></textarea>
            <button onClick={handleBulkAdd} className="bg-[#222] hover:bg-[#333] text-white px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm tracking-wide rounded-lg whitespace-nowrap h-20 border border-border-subtle hover:border-brand-red transition-all">
              Add
            </button>
          </div>
          <p className="text-xs text-text-muted">Added as DNS to the latest edition. Edit times later.</p>
        </div>
        
        {entries.length === 0 && <div className="text-text-muted text-sm italic py-4">No entries yet.</div>}

        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center bg-[#111] border border-[#333] p-3 rounded-xl">
              {/* Row 1 on mobile: Edition + Name */}
              <div className="flex gap-2 w-full sm:w-auto sm:contents">
                <div className="w-24 shrink-0">
                  <select value={entry.editionId} onChange={e => handleEntryChange(entry.id, 'editionId', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded py-2 px-2 text-xs outline-none text-white">
                    <option value="">Ed.</option>
                    {editions.map(ed => <option key={ed.id} value={ed.id}>Ed. {ed.num}</option>)}
                  </select>
                </div>
                <div className="flex-1 sm:flex-1">
                  <input type="text" placeholder="Runner Name" value={entry.name} onChange={e => handleEntryChange(entry.id, 'name', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded py-2 px-3 text-sm text-white font-bold outline-none focus:border-brand-red" />
                </div>
              </div>

              {/* Row 2 on mobile: Time + Status + Delete */}
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <TimeInput
                  value={entry.time}
                  onChange={(newTime) => handleEntryChange(entry.id, 'time', newTime)}
                />
                <select value={entry.status} onChange={e => handleEntryChange(entry.id, 'status', e.target.value)} className="bg-[#0a0a0a] border border-[#333] rounded py-2 px-2 text-xs outline-none text-white font-bold flex-1 sm:flex-none sm:w-24">
                  <option value="ok">FINISHED</option>
                  <option value="dnf">DNF</option>
                  <option value="dns">DNS</option>
                </select>
                <button onClick={() => deleteEntry(entry.id)} className="w-9 h-9 flex items-center justify-center text-[#555] hover:text-brand-red hover:bg-red-950/20 rounded shrink-0">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-t border-border-subtle py-3 sm:py-4 px-4 sm:px-6 z-50">
        <div className="max-w-[1100px] w-full mx-auto flex justify-end">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-display font-bold px-5 sm:px-8 py-3 rounded-lg uppercase tracking-widest transition-colors text-sm sm:text-base"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            Review & Publish
          </button>
        </div>
      </div>
    </div>
  );
}

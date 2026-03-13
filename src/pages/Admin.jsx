import { useState } from 'react';
import { updateStats } from '../api/github';
import { PlusCircle, Save, Settings, Loader2, Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function Admin({ data, reloadData }) {
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bulkNames, setBulkNames] = useState('');

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

  const saveChanges = async () => {
    if(!password) {
      setMsg({ type: 'error', text: 'Admin Password is required to decrypt publishing credentials.' });
      return;
    }
    
    setIsSaving(true);
    setMsg(null);
    
    try {
      // 1. Attempt to decrypt the PAT embedded in the Vite build
      const encryptedPat = import.meta.env.VITE_ENCRYPTED_PAT;
      
      if (!encryptedPat) {
        throw new Error('No encrypted PAT found in build. Ensure env variables are set in GitHub Actions.');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedPat, password);
      const decryptedPat = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPat || !decryptedPat.startsWith('ghp_') && !decryptedPat.startsWith('github_pat_')) {
        throw new Error('Incorrect Password. Decryption failed.');
      }

      // 2. Use the decrypted PAT to update GitHub
      const res = await updateStats(decryptedPat, localData);
      setMsg({ type: 'success', text: 'Data saved to GitHub successfully! It will show up on the site in ~1 minute after rebuild.' });
      reloadData(); // Refresh parent data
    } catch(err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update remote. Check console logs.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto space-y-8">
      
      {/* Top Banner & Secret Key */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-[2px] pointer-events-none">
          <Settings size={120} className="text-white" />
        </div>
        
        <h2 className="font-display font-black text-3xl uppercase tracking-wider mb-2">Admin Dashboard</h2>
        <p className="text-text-muted text-sm mb-6">Make your changes below and deploy to GitHub. Modifying this will trigger a new website deployment immediately.</p>
        
        <div className="max-w-md">
          <label className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-widest text-[#a3a3a3] mb-2">
            <Lock size={12} /> Admin Password
          </label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all font-mono text-sm"
          />
          <p className="text-xs text-text-muted mt-2">Required to authenticate your deployment.</p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg border text-sm font-bold ${msg.type === 'error' ? 'bg-red-950/50 border-brand-red text-red-200' : 'bg-green-950/50 border-green-500 text-green-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Configuration Section */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl uppercase tracking-wider border-b border-border-subtle pb-2">Global Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Club Name</label>
            <input type="text" name="club" value={config.club || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Season String</label>
            <input type="text" name="season" value={config.season || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Distance (e.g. 5K)</label>
            <input type="text" name="distance" value={config.distance || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">GitHub Owner</label>
            <input type="text" name="githubOwner" value={config.githubOwner || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">GitHub Repo</label>
            <input type="text" name="githubRepo" value={config.githubRepo || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Cover Photo URL (optional)</label>
            <input type="text" name="coverPhotoUrl" value={config.coverPhotoUrl || ''} onChange={handleConfigChange} placeholder="https://..." className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Description (Markdown disabled, just text)</label>
            <textarea name="description" value={config.description || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none h-20" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Link to Signup / Google Form</label>
            <input type="text" name="googleForm" value={config.googleForm || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Location</label>
            <input type="text" name="location" value={config.location || ''} onChange={handleConfigChange} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none" />
          </div>
        </div>
      </div>

      {/* Editions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="font-display font-bold text-xl uppercase tracking-wider">Editions</h3>
          <button onClick={handleAddEdition} className="flex items-center gap-1.5 text-xs text-brand-red font-bold hover:text-brand-red-dark">
            <PlusCircle size={14} /> Add Edition
          </button>
        </div>
        
        {editions.length === 0 && <div className="text-text-muted text-sm italic py-4">No editions mapped. Create one!</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editions.map(edition => (
            <div key={edition.id} className="bg-[#111] border border-[#333] p-4 rounded-xl space-y-3">
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-1">Num</label>
                  <input type="number" value={edition.num} onChange={e => handleEditionChange(edition.id, 'num', Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-[#333] rounded md px-2 py-1.5 text-white font-mono text-sm outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-1">Date</label>
                  <input type="date" value={edition.date} onChange={e => handleEditionChange(edition.id, 'date', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded md px-2 py-1.5 text-white text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-1">Location</label>
                <input type="text" value={edition.location} onChange={e => handleEditionChange(edition.id, 'location', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded md px-2 py-1.5 text-white text-sm outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Times Entry Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="font-display font-bold text-xl uppercase tracking-wider">Leaderboard Entries</h3>
          <button onClick={handleAddEntry} className="flex items-center gap-1.5 text-xs text-brand-red font-bold hover:text-brand-red-dark">
            <PlusCircle size={14} /> Add Entry
          </button>
        </div>

        <div className="bg-[#111] border border-[#333] p-4 rounded-xl space-y-3 mb-6">
          <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-1">Bulk Add / Preload Participants (1 name per line)</label>
          <div className="flex gap-2 items-start">
            <textarea 
              value={bulkNames} 
              onChange={e => setBulkNames(e.target.value)} 
              placeholder="John Doe\nJane Smith\n..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-brand-red outline-none h-24 text-sm"
            />
            <button onClick={handleBulkAdd} className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 font-bold text-sm tracking-wide rounded-lg whitespace-nowrap h-24 border border-border-subtle hover:border-brand-red transition-all">
              Add Names
            </button>
          </div>
          <p className="text-xs text-text-muted">Names will be added to the most recent Edition, set as DNS (Did Not Start), with empty times. You can edit their times later.</p>
        </div>
        
        {entries.length === 0 && <div className="text-text-muted text-sm italic py-4">No entries yet.</div>}

        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-[#111] border border-[#333] p-3 rounded-xl">
              <div className="w-full md:w-32">
                <select value={entry.editionId} onChange={e => handleEntryChange(entry.id, 'editionId', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded py-2 px-2 text-xs outline-none text-white">
                  <option value="">Select Ed</option>
                  {editions.map(ed => <option key={ed.id} value={ed.id}>Ed. {ed.num}</option>)}
                </select>
              </div>
              
              <div className="w-full md:flex-1">
                <input type="text" placeholder="Runner Name" value={entry.name} onChange={e => handleEntryChange(entry.id, 'name', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded py-2 px-3 text-sm text-white font-bold outline-none focus:border-brand-red" />
              </div>

              <div className="w-1/2 md:w-24">
                <input type="text" placeholder="MM:SS" value={entry.time} onChange={e => handleEntryChange(entry.id, 'time', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded py-2 px-3 text-sm text-white font-mono outline-none focus:border-brand-red text-center" />
              </div>

              <div className="w-1/3 md:w-28">
                <select value={entry.status} onChange={e => handleEntryChange(entry.id, 'status', e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded py-2 px-2 text-xs outline-none text-white font-bold">
                  <option value="ok">FINISHED</option>
                  <option value="dnf">DNF</option>
                  <option value="dns">DNS</option>
                </select>
              </div>

              <button onClick={() => deleteEntry(entry.id)} className="w-10 h-10 flex items-center justify-center text-[#555] hover:text-brand-red hover:bg-red-950/20 rounded ml-auto">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-t border-border-subtle py-4 px-6 z-50 flex justify-end">
        <div className="max-w-[1100px] w-full mx-auto flex justify-end">
          <button 
            onClick={saveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-display font-bold px-8 py-3 rounded-lg uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Updating Repo...' : 'Save & Publish Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

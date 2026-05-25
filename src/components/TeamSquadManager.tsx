import React, { useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';
import { Team, Player } from '../types';
import { Plus, Trash2, Printer, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export function TeamSquadManager({ teams }: { teams: Team[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  const handleSelectTeam = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    setSaveSuccess(false);
    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      setPlayers(team?.players || []);
    } else {
      setPlayers([]);
    }
  };

  const handleAddPlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const jersey = fd.get('jersey') as string;
    const position = fd.get('position') as string;
    
    if (!name) return;
    
    setPlayers([...players, { id: Date.now().toString(), name, jersey, position }]);
    (e.target as HTMLFormElement).reset();
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    if (!selectedTeamId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateDoc(doc(db, 'teams', selectedTeamId), {
        players
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'teams');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Sort players by jersey number (numerically if possible, else alphabetically)
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = parseInt(a.jersey || '999');
    const numB = parseInt(b.jersey || '999');
    return numA - numB;
  });

  // Split players into pages of 15
  const chunks: Player[][] = [];
  for (let i = 0; i < sortedPlayers.length; i += 15) {
    chunks.push(sortedPlayers.slice(i, i + 15));
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Admin Controls Area - Hidden in Print */}
      <div className="print-hidden space-y-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1 w-full max-w-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-neon mb-2 block">Select Team for Squad Management</label>
              <select 
                value={selectedTeamId} 
                onChange={handleSelectTeam}
                className="w-full bg-[#05060A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-neon transition-colors appearance-none text-white"
              >
                <option value="">-- Choose a Team --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            {selectedTeam && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-6 py-3 bg-brand-neon/10 hover:bg-brand-neon/20 border border-brand-neon/30 text-brand-neon font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  {isSaving ? <span className="animate-spin text-xl leading-none w-4 h-4 rounded-full border-2 border-brand-neon border-t-transparent"></span> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save Squad'}
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Printer size={16} /> Print / PDF
                </button>
              </div>
            )}
          </div>
          
          {saveSuccess && (
             <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00ff66] font-bold">
               <CheckCircle2 size={14} /> Squad saved successfully
             </div>
          )}
        </div>

        {selectedTeam && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Add Player Form */}
            <div className="glass-card p-6 rounded-3xl h-min">
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white/50 border-b border-white/10 pb-4 mb-4">Add Player</h3>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50">Player Name *</label>
                  <input name="name" required className="w-full bg-[#05060A] text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-neon transition-colors" placeholder="e.g. Cristiano Ronaldo" />
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50">Jersey No.</label>
                    <input name="jersey" type="number" className="w-full bg-[#05060A] text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-neon transition-colors" placeholder="7" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50">Position</label>
                    <input name="position" className="w-full bg-[#05060A] text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-neon transition-colors" placeholder="FW" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Add to Squad
                </button>
              </form>
            </div>

            {/* Admin Player List Preview */}
            <div className="glass-card p-6 rounded-3xl lg:col-span-2">
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white/50 border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
                <span>Current Squad Preview</span>
                <span className="text-brand-neon text-xs bg-brand-neon/10 px-2 py-1 rounded-md">{players.length} Players</span>
              </h3>
              
              {players.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-white/30 gap-2 border border-dashed border-white/10 rounded-2xl">
                  <AlertCircle size={32} className="opacity-50" />
                  <p className="text-xs uppercase tracking-widest font-bold">No players added yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {sortedPlayers.map((p, index) => (
                    <div key={p.id} className="flex items-center gap-4 bg-[#05060A] border border-white/5 rounded-xl p-3 group">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 font-bold text-sm truncate">{p.name}</div>
                      <div className="w-12 text-center text-xs font-mono text-brand-neon border border-brand-neon/20 rounded bg-brand-neon/5 py-1">
                        {p.jersey || '-'}
                      </div>
                      <div className="w-16 text-center text-xs text-white/50 font-bold uppercase">
                        {p.position || '-'}
                      </div>
                      <button 
                        onClick={() => handleRemovePlayer(p.id)}
                        className="p-2 text-white/30 hover:text-brand-red transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ---------------- PRINTABLE AREA ---------------- */}
      {selectedTeam && (
        <div className="hidden print-block w-[210mm] min-h-[297mm] mx-auto bg-white text-black print-document" ref={printRef}>
          {chunks.length === 0 ? (
             <div className="print-page w-[210mm] h-[297mm] bg-white p-[20mm] relative flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold font-sans">No Players in Squad</h1>
             </div>
          ) : chunks.map((chunk, pageIndex) => (
            <div key={pageIndex} className="print-page w-[210mm] h-[297mm] bg-white p-[15mm] relative flex flex-col" style={{ pageBreakAfter: pageIndex < chunks.length - 1 ? 'always' : 'auto' }}>
              
              {/* Header - Only on First Page */}
              {pageIndex === 0 && (
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
                  {/* Left KGHS Logo Placeholder - Using Text since no logo is provided for KGHS */}
                  <div className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded overflow-hidden p-1 shrink-0 bg-gray-50">
                    <span className="font-bold text-lg leading-none text-center">KGHS<br/><span className="text-[10px]">SPORTS</span></span>
                  </div>

                  {/* Center Text */}
                  <div className="flex-1 px-4 text-center">
                    <h1 className="font-bold text-xl uppercase font-sans tracking-wide">KGHS INTER SSC FOOTBALL TOURNAMENT 2026</h1>
                    <h2 className="font-bold text-2xl mt-2 font-display tracking-wider" style={{ color: '#000' }}>{selectedTeam.name}</h2>
                    <p className="text-sm uppercase font-bold text-gray-600 tracking-widest mt-1">Player Registration List</p>
                  </div>

                  {/* Right Team Logo */}
                  <div className="w-20 h-20 flex items-center justify-center shrink-0">
                    {selectedTeam.logo ? (
                      <img src={selectedTeam.logo} alt="Team Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 font-bold">NO LOGO</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Minimal Header for Sequential Pages */}
              {pageIndex > 0 && (
                <div className="border-b-2 border-black pb-2 mb-4">
                  <h2 className="font-bold text-lg font-sans uppercase">
                    {selectedTeam.name} - Squad List (Page {pageIndex + 1})
                  </h2>
                </div>
              )}

              {/* Table Table */}
              <div className="flex-1">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-black">
                      <th className="py-2 px-3 text-left font-bold text-xs uppercase tracking-wider w-16 border-r border-gray-300">Sr. No</th>
                      <th className="py-2 px-3 text-left font-bold text-xs uppercase tracking-wider border-r border-gray-300">Player Name</th>
                      <th className="py-2 px-3 text-center font-bold text-xs uppercase tracking-wider w-24 border-r border-gray-300">Jersey NO.</th>
                      <th className="py-2 px-3 text-center font-bold text-xs uppercase tracking-wider w-32">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-300">
                        <td className="py-2 px-3 font-bold border-r border-gray-300 text-sm">{(pageIndex * 15) + i + 1}</td>
                        <td className="py-2 px-3 font-bold uppercase border-r border-gray-300 text-sm">{p.name}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono border-r border-gray-300 text-sm">{p.jersey || '-'}</td>
                        <td className="py-2 px-3 text-center font-bold uppercase text-gray-600 text-sm">{p.position || '-'}</td>
                      </tr>
                    ))}
                    {/* Fill empty rows if less than 15 so table looks uniform */}
                    {Array.from({ length: 15 - chunk.length }).map((_, i) => (
                      <tr key={`empty-${i}`} className="border-b border-gray-200">
                         <td className="py-6 px-3 border-r border-gray-200"></td>
                         <td className="py-6 px-3 border-r border-gray-200"></td>
                         <td className="py-6 px-3 border-r border-gray-200"></td>
                         <td className="py-6 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase shrink-0 w-full">
                <span className="font-bold">https://kghspa.vercel.app</span>
                <span>Page {pageIndex + 1} of {chunks.length || 1}</span>
                <span className="font-bold text-black">KGHS SPORTS</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

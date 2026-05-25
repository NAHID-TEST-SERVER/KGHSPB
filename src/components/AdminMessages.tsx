import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, MessageSquare, Check, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  name: string;
  content: string;
  createdAt: any;
  read: boolean;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const activeMsgs: ChatMessage[] = [];
      snap.forEach(doc => {
        activeMsgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(activeMsgs);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (e) {
      console.error("Error deleting message:", e);
    }
  };

  const handleMarkRead = async (id: string, readStatus: boolean) => {
    try {
      if (readStatus) return; // already read
      await updateDoc(doc(db, 'messages', id), { read: true });
    } catch (e) {
      console.error("Error updating message:", e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl tracking-wider text-white">Live Messages</h2>
              <p className="text-xs uppercase tracking-widest font-mono text-white/50 mt-1">Viewer Feedbacks</p>
            </div>
         </div>
         <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold font-mono text-white/50">
            TOTAL: {messages.length}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-neon border-t-transparent animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/30 gap-3 border border-dashed border-white/10 rounded-3xl">
            <MessageSquare size={32} className="opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest">No Messages Yet</span>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id} 
              className={`glass-card p-5 rounded-2xl border transition-colors flex flex-col ${
                !msg.read ? 'border-brand-neon/50 bg-brand-neon/5' : 'border-white/5 bg-[#0A0A0C]'
              }`}
            >
              <div className="flex items-start justify-between mb-3 border-b border-white/5 pb-3">
                <div className="flex flex-col truncate pr-2">
                   <h4 className="font-bold text-sm tracking-wide text-white truncate max-w-[200px]">{msg.name}</h4>
                   <span className="text-[9px] uppercase tracking-widest text-white/40 mt-1 font-mono">
                     {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString() : 'Just now'}
                   </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!msg.read && (
                    <button 
                      onClick={() => handleMarkRead(msg.id, msg.read)}
                      className="p-2 text-white/40 hover:text-brand-neon bg-white/5 hover:bg-brand-neon/10 rounded-lg transition-colors border border-transparent hover:border-brand-neon/30"
                      title="Mark as Read"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-white/40 hover:text-brand-red bg-white/5 hover:bg-brand-red/10 rounded-lg transition-colors border border-transparent hover:border-brand-red/30"
                    title="Delete Message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

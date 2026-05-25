import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageCircle, X, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !name.trim()) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        name: name,
        content: message,
        createdAt: serverTimestamp(),
        read: false
      });
      setSent(true);
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setSent(false), 300); // Reset after closing
      }, 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSending(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 md:bottom-4 z-50 p-2.5 rounded-full bg-brand-neon text-black shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:scale-105 transition-transform group flex items-center justify-center",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <MessageCircle size={20} className="group-hover:animate-bounce" />
      </button>

      {/* Chat Form Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 md:bottom-6 w-[320px] max-w-[calc(100vw-32px)] z-50 glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ backgroundColor: '#05060A' }}
          >
            <div className="bg-brand-neon/10 border-b border-brand-neon/20 p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-wider uppercase text-brand-neon leading-none">Live Chat</span>
                <span className="text-[9px] uppercase tracking-widest text-white/50 mt-1">Message to Admin</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-8 text-brand-neon gap-3 text-center">
                  <CheckCircle2 size={40} className="animate-bounce" />
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">Message Sent</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Admin will see it shortly</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider pl-1">Your Name</label>
                    <input 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Viewer 1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-neon transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider pl-1">Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-neon transition-colors resize-none custom-scrollbar"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSending || !message.trim() || !name.trim()}
                    className="w-full py-3.5 bg-brand-neon text-black font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-brand-neon/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin shrink-0"></span>
                    ) : (
                      <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

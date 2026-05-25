import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store';
import { Shield, Hexagon, Lock, Fingerprint, Activity, Facebook, Github, Phone, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function AdminLogin() {
  const { setIsAdmin } = useAuthStore();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    // Handle pasting multiple digits
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newPin[index + i] = pasted[i];
      }
      setPin(newPin);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newPin[index] = value;
    setPin(newPin);
    setIsError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin.length !== 6) return;

    setIsLoading(true);
    
    // Simulate network delay for premium feel
    await new Promise(r => setTimeout(r, 800));
    
    // 515357 is the new 6-digit passcode. Old one was 51535759. 
    // We can support both or just adapt to 6 digits by using 515357
    if (enteredPin === '515357') {
      localStorage.setItem('admin_passcode', '51535759'); // use original internally if needed or just set true
      setIsAdmin(true);
    } else {
      setIsError(true);
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  // Auto submit when 6 digits are filled
  useEffect(() => {
    if (pin.join('').length === 6 && !isLoading && !isError) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <div className="min-h-[85vh] bg-[#020305] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans selection:bg-brand-neon/30 py-12">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-neon/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-accent/5 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[320px] z-10 px-4"
      >
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Card Top Glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-neon/50 to-transparent"></div>

          {/* Header */}
          <div className="flex flex-col items-center mb-8 relative">
             <div className="w-12 h-12 bg-black/50 border border-white/5 rounded-xl flex items-center justify-center mb-4 relative group">
               <Shield className="text-brand-neon w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-brand-neon/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             </div>
             <h2 className="font-display text-[14px] font-bold tracking-[0.2em] uppercase text-white mb-1">System Access</h2>
             <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono flex items-center gap-1.5">
               <Activity className="w-3 h-3 text-brand-neon animate-pulse" /> Secure Connection
             </p>
          </div>

          {/* Login Form */}
          <motion.div
            animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 mb-3 block text-center w-full">Admin Passcode</label>
              
              <div className="flex justify-center gap-2 mb-6 w-full">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className={cn(
                      "w-[38px] h-[46px] bg-black/40 border rounded-lg text-center font-display text-lg font-bold text-white transition-all focus:outline-none placeholder-white/10",
                      digit ? "border-brand-neon shadow-[0_0_10px_rgba(0,255,102,0.15)] text-brand-neon bg-brand-neon/5" : "border-white/10 focus:border-white/30",
                      isError && "border-brand-red text-brand-red shadow-[0_0_15px_rgba(255,45,85,0.2)] bg-brand-red/5"
                    )}
                    placeholder="·"
                  />
                ))}
              </div>

              <div className="h-4 mb-4 flex items-center justify-center w-full">
                <AnimatePresence mode="wait">
                  {isError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[9px] text-brand-red font-bold uppercase tracking-widest flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" /> Invalid Authorization
                    </motion.div>
                  )}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[9px] text-brand-neon font-bold uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <div className="w-2.5 h-2.5 border-2 border-brand-neon border-t-transparent rounded-full animate-spin" /> Authenticating
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={pin.join('').length !== 6 || isLoading}
                className={cn(
                  "hidden w-full py-3.5 rounded-lg flex justify-center items-center gap-2 transition-all duration-300 relative overflow-hidden group border",
                  pin.join('').length === 6 && !isLoading
                    ? "bg-brand-neon/10 border-brand-neon shadow-[0_0_15px_rgba(0,255,102,0.2)] hover:bg-brand-neon/20 cursor-pointer"
                    : "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                <Fingerprint className={cn("w-4 h-4", pin.join('').length === 6 ? "text-brand-neon" : "text-white/30")} />
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-[0.2em] mt-[1px]",
                  pin.join('').length === 6 ? "text-brand-neon" : "text-white/30"
                )}>
                  Access Panel
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* Admin Info Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="fixed bottom-8 left-0 right-0 z-20 flex justify-center px-4"
      >
         <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full max-w-md mx-auto">
            <div className="px-6 pt-2 border-b border-white/5 pb-3 mb-1 text-center w-full">
              <span className="text-[10px] text-brand-neon uppercase tracking-[0.2em] block mb-1 font-mono">System Administrator</span>
              <span className="text-[14px] font-bold text-white uppercase tracking-widest">MD. Nahidul Islam</span>
            </div>
            
            <div className="flex items-center gap-4 px-2 pb-2">
              <a href="https://www.facebook.com/nahidul407" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/30 transition-all group shadow-lg">
                <Facebook className="w-5 h-5 text-white/50 group-hover:text-[#1877F2] transition-colors" />
              </a>
              <a href="https://github.com/CYBERCOP-404" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white hover:border-white/30 transition-all group shadow-lg">
                <Github className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              </a>
              <a href="tel:01328276240" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-500 hover:border-green-500/30 transition-all group shadow-lg">
                <Phone className="w-5 h-5 text-white/50 group-hover:text-green-500 transition-colors" />
              </a>
              <a href="https://wa.me/8801328276240" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/30 transition-all group shadow-lg">
                <MessageCircle className="w-5 h-5 text-white/50 group-hover:text-[#25D366] transition-colors" />
              </a>
            </div>
         </div>
      </motion.div>

    </div>
  );
}

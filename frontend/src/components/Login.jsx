import React from 'react';
import { motion } from 'framer-motion';

export function Login({ onLogin }) {
  // In a real app, this would redirect to your FastAPI /auth/google endpoint
  const handleGoogleLogin = () => {
    // For demo purposes, we'll simulate a successful neural handshake
    onLogin({ name: 'Neural User', email: 'user@boardroom.ai' });
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-[#020408] flex items-center justify-center p-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-radial-gradient opacity-30" />
      <div className="scanline" />
      
      {/* Animated Corner Brackets */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-20 border border-[rgba(0,242,255,0.1)] rounded-[50px]"
      />

      <div className="text-center relative z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-7xl font-black tracking-tighter text-glow mb-2">
            BOARDROOM<span className="text-white">.AI</span>
          </h1>
          <p className="text-xs tracking-[1em] text-[rgba(255,255,255,0.4)] uppercase mb-20">
            Secure Neural Access Portal // v5.0
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hud-panel p-16 max-w-lg mx-auto"
        >
          <div className="text-[10px] font-bold tracking-[0.5em] text-[#00f2ff] mb-8">IDENTITY VERIFICATION REQUIRED</div>
          
          <button 
            onClick={handleGoogleLogin}
            className="cyber-btn w-full flex items-center justify-center gap-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Neural Handshake with Google
          </button>

          <div className="mt-8 text-[9px] text-[rgba(255,255,255,0.3)] leading-relaxed">
            By authenticating, you agree to grant the Neural Boardroom access to strategic processing cycles and cross-agent communication protocols.
          </div>
        </motion.div>

        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mt-20 text-[10px] text-[#7000ff] font-mono"
        >
          _ WAITING_FOR_BIOMETRIC_INPUT...
        </motion.div>
      </div>
    </div>
  );
}

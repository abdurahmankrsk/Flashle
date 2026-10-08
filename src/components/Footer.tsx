import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <>
      <footer className="w-full text-center py-8 px-4 mt-auto select-none flex flex-col items-center gap-4">
        {/* Social / Support Links (GitHub, LinkedIn, Ko-fi) — Big & Vibrant Brand Coloured */}
        <div className="flex items-center justify-center gap-4 sm:gap-5">
          {/* GitHub: Official Dark Brand Badge */}
          <a
            href="https://github.com/abdurahmankrsk"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub: abdurahmankrsk"
            aria-label="GitHub"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#24292e] border-2 border-[#30363d] flex items-center justify-center text-white hover:bg-[#2f363d] hover:border-white/60 hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* LinkedIn: Official LinkedIn Blue Badge */}
          <a
            href="https://www.linkedin.com/in/abdurahman-kari%C5%A1ik-872446268/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn: Abdurahman Karišik"
            aria-label="LinkedIn"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0a66c2] border-2 border-[#004182] flex items-center justify-center text-white hover:bg-[#004182] hover:border-[#70b5f9] hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(10,102,194,0.45)] cursor-pointer"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-white" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
            </svg>
          </a>

          {/* Ko-fi: Official Ko-fi Coral Red Badge */}
          <a
            href="https://ko-fi.com/abdurahmank"
            target="_blank"
            rel="noopener noreferrer"
            title="Support on Ko-fi"
            aria-label="Ko-fi"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#ff5e5b] border-2 border-[#e04744] flex items-center justify-center text-white hover:bg-[#e04744] hover:border-[#ff9b99] hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,94,91,0.45)] cursor-pointer"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-white" viewBox="0 0 24 24">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.683-2.566.28-2.146.425-4.053.483-5.228 1.942.179 4.298-.444 5.441-2.856zm-6.223 1.701c-.139 1.464-.325 3.125-.562 4.673-.131.859-1.041.979-1.041.979H3.143c-.87 0-.964-.813-.964-.813-.081-3.649-.047-9.584-.047-9.584h15.58s.005.127.021.365c-.02.482-.047 2.115-.075 4.38zm3.921-1.026c-.347.728-1.059 1.052-1.956 1.052-.078-.711-.186-1.554-.316-2.457 1.258.077 2.496.657 2.272 1.405z"/>
              <path d="M9.82 9.073c-.947-.946-2.482-.946-3.429 0-.946.947-.946 2.482 0 3.429l3.429 3.429 3.428-3.429c.947-.947.947-2.482 0-3.429-.947-.946-2.482-.946-3.428 0l-.001.001-.001-.001z" />
            </svg>
          </a>
        </div>

        <p className="text-xs text-zinc-400 font-medium">
          Flashle — 2026 •{' '}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="hover:text-zinc-200 transition-colors underline underline-offset-2 cursor-pointer"
          >
            Privacy Policy
          </button>
        </p>
      </footer>

      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-[#0e111b] border-2 border-[#262c3e] rounded-lg max-w-md w-full p-6 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-tech text-lg font-bold text-white mb-2">Privacy Policy</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Flashle is an unofficial fan-made daily guessing game. We do not collect, track, or share any personal information. All game progress, daily streaks, and statistics are stored exclusively in your browser’s local storage.
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
              <em>The Flash</em> and all associated characters and trademarks are the property of DC Comics and Warner Bros. Television.
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white font-tech font-bold text-xs uppercase rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

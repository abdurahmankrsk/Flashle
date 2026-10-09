import React from 'react';
import { X } from 'lucide-react';
import { FlashEmblem } from './FlashEmblem';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d0f18] border-2 border-[#2c3349] rounded-[8px] p-5 sm:p-7 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded hover:bg-[#1b1f2e] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-3">
          <FlashEmblem size={28} variant="emblem" />
          <h2 className="font-heading text-2xl sm:text-3xl uppercase italic tracking-wider">
            How to Play <span className="text-[#dc2626]">Flashle</span>
          </h2>
        </div>

        <p className="font-body text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed">
          Identify the mystery character from <strong>The CW's The Flash (2014–2023)</strong> in <strong>8 attempts</strong>.
          Every guess unlocks attribute clues comparing your character to the secret character.
        </p>

        {/* Indicators guide */}
        <div className="space-y-2.5 mb-5">
          <h3 className="font-tech text-xs uppercase font-bold text-gray-400 tracking-wider">
            Attribute Indicators
          </h3>

          <div className="flex items-start gap-3 bg-[#111420] p-2.5 rounded-[6px] border border-[#23293d]">
            <span className="w-8 h-8 rounded-[4px] bg-[#15803d] border-2 border-[#22c55e] flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.7)] text-white">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟩</span>
            </span>
            <div>
              <h4 className="font-tech text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Green (Exact Match)</h4>
              <p className="font-body text-xs text-gray-400">
                The attribute exactly matches the mystery character.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#111420] p-2.5 rounded-[6px] border border-[#23293d]">
            <span className="w-8 h-8 rounded-[4px] bg-[#ca8a04] border-2 border-[#facc15] flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.7)] text-white">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟨</span>
            </span>
            <div>
              <h4 className="font-tech text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Yellow (Partial Match / Close)</h4>
              <p className="font-body text-xs text-gray-400">
                Shared team (e.g. Team Flash), related power category, related alignment, or debut season is off by only <strong>1 season</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#111420] p-2.5 rounded-[6px] border border-[#23293d]">
            <span className="w-8 h-8 rounded-[4px] bg-[#991b1b] border-2 border-[#ef4444] flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.7)] text-white">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟥</span>
            </span>
            <div>
              <h4 className="font-tech text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Red (No Match)</h4>
              <p className="font-body text-xs text-gray-400">
                There is no overlap or relationship with the secret character.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Example */}
        <div className="bg-[#11131e] p-3 rounded-[6px] border border-[#23283a] mb-5">
          <span className="font-tech text-[10px] uppercase font-bold text-gray-400 block mb-1.5 tracking-wider">
            Example Guess: Wally West
          </span>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs font-tech font-bold uppercase">
            <div className="p-1.5 rounded-[4px] bg-[#15803d] border-2 border-[#22c55e] text-white shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1">
              <span>Male</span>
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟩</span>
            </div>
            <div className="p-1.5 rounded-[4px] bg-[#15803d] border-2 border-[#22c55e] text-white shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1">
              <span>Super Speed</span>
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟩</span>
            </div>
            <div className="p-1.5 rounded-[4px] bg-[#ca8a04] border-2 border-[#facc15] text-white shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1">
              <span>S2</span>
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟨</span>
            </div>
            <div className="p-1.5 rounded-[4px] bg-[#991b1b] border-2 border-[#ef4444] text-white shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1">
              <span>Villain</span>
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🟥</span>
            </div>
          </div>
          <p className="font-body text-[11px] text-gray-400 mt-2">
            In this example, the secret character is a male with Super Speed who debuted near Season 2 and is not a villain!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-white font-tech font-bold rounded-[4px] transition-transform active:scale-95 uppercase tracking-wider text-sm shadow-md cursor-pointer"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
};

import { Mic, Camera } from 'lucide-react';

export default function QuickActions({ onVoice, onScan }) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onVoice}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <Mic className="w-4 h-4" />
        Voice Entry
      </button>
      <button
        onClick={onScan}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <Camera className="w-4 h-4" />
        Scan Receipt
      </button>
    </div>
  );
}

import React from 'react';
import { 
  YouTubePlaylists, 
  YouTubeWatchLater, 
  YouTubeSave, 
  YouTubeShare 
} from './YouTubeIcons';
import { 
  Download, 
  Trash2, 
  History, 
  PlusSquare, 
  Share2, 
  Ban, 
  Flag,
  Scissors,
  CheckCircle2
} from 'lucide-react';

export type YoutubeMenuType = 
  | 'search_reg' 
  | 'search_shorts' 
  | 'history_shorts' 
  | 'history_reg' 
  | 'liked' 
  | 'watch_later' 
  | 'watch_suggested' 
  | 'home'
  | 'shorts';

interface YoutubeMenuProps {
  type: YoutubeMenuType;
  onClose: () => void;
}

export const YoutubeMenu: React.FC<YoutubeMenuProps> = ({ type, onClose }) => {
  const menuItems = [
    { icon: <PlusSquare size={18} />, label: "הוסף לתור" },
    { icon: <YouTubeWatchLater size={18} />, label: "שמירה ב'לצפייה בהמשך'" },
    { icon: <YouTubeSave size={18} />, label: "שמירה בפלייליסט" },
    { icon: <Download size={18} />, label: "הורדה" },
    { icon: <Share2 size={18} />, label: "שתף" },
  ];

  if (type.includes('history')) {
    menuItems.push({ icon: <Trash2 size={18} />, label: "הסרה מהיסטוריית הצפייה" });
  }

  if (type === 'home' || type === 'watch_suggested') {
    menuItems.push({ icon: <Ban size={18} />, label: "לא מעוניין" });
    menuItems.push({ icon: <Ban size={18} />, label: "אל תמליץ על הערוץ" });
    menuItems.push({ icon: <Flag size={18} />, label: "דיווח" });
  }

  return (
    <div 
      className="absolute left-0 top-8 w-64 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl z-[2500] py-2 overflow-hidden"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-[var(--secondary)] transition-colors text-right text-[14px] text-[var(--foreground)]"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <span className="text-[var(--foreground)] opacity-90">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

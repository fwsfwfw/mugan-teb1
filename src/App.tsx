/**234
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Menu, 
  Search, 
  Mic, 
  Video, 
  Bell, 
  User, 
  Home, 
  Compass, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  History, 
  ChevronRight,
  ChevronUp,
  MoreVertical,
  Share2,
  Download,
  Scissors,
  Flag,
  HelpCircle,
  Settings,
  MessageSquarePlus,
  ListMusic,
  X,
  Plus,
  LogOut,
  Moon,
  Languages,
  Shield,
  Globe,
  Keyboard,
  ShieldCheck,
  BellRing,
  MoreHorizontal,
  Radio,
  Newspaper,
  Image,
  ChevronLeft,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Terminal,
  AlertTriangle,
  Copy,
  Play,
  Bookmark,
  Check,
  Star,
  Pencil,
  Trash2,
  Pause,
  Repeat,
  ThumbsDown,
  Shuffle,
  Forward,
  Share,
  ArrowRight,
  Youtube,
  ChevronDown,
  Loader2,
  Activity
} from 'lucide-react';
import { 
  YTIconGoogleAccount, YTIconAppearance, YTIconLanguage, YTIconKeyboard, 
  YTIconHelp, YTIconFeedback, YTIconSignOut, YTIconData, YTIconChevronLeft,
  YouTubeShare, YouTubeLike, YouTubeHome, YouTubeHistory, YouTubeWatchLater,
  YouTubeLiked, YouTubePlaylists, YouTubeSave, YouTubeShorts, YouTubeSubscriptions,
  YouTubeYou
} from './components/YouTubeIcons';
import { VolumeBooster } from './components/VolumeBooster';
import { YoutubeMenu, YoutubeMenuType } from './components/YoutubeMenu';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './services/supabase';
import { GoogleGenAI } from "@google/genai";
import { searchVideos, getPopularTorahVideos, YouTubeVideo, searchChannels, getChannelDetails, getVideosByChannel, isApiKeyValid, subscribeToChannelOnYouTube, unsubscribeFromChannelOnYouTube, getVideosFromChannels, getSubscriptions, getSubscriptionsWithFallback, getRelatedVideos, getSearchSuggestions, getChannelShorts, getChannelLiveStreams, getChannelPlaylists, getPlaylistVideosFromAPI, getChannelCommunity, getVideoDetails, getChannelHome, getHaredimMusicVideos, getHaredimArtistChannels, SearchFilters, getTorahShorts } from './services/youtube';
import { setBackendCache, getBackendCache, toggleLikeOnBackend, getLikesFromBackend, trackUserOnBackend, getActiveUsersFromBackend, getUserKey, checkPaymentStatus, recordPaymentOnBackend, checkIfUserLikedVideo, toggleUserLikeOnBackend, addUserActivity, removeUserActivity, getUserActivity, loginToBackend, verifyBackendSession, logoutFromBackend, getUserPlaylists, createUserPlaylist, addVideoToUserPlaylist, removeVideoFromUserPlaylist, getPlaylistVideos, deleteUserPlaylist, editUserPlaylist, saveVideoProgress, getLocalVideoProgress, loadVideoProgressFromBackend, saveFilterStatus, getLocalFilterStatuses, loadFilterStatusesFromBackend } from './services/backend';

const YouTubeBell = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M16 19a4 4 0 11-8 0H4.765C3.21 19 2.25 17.304 3.05 15.97l1.806-3.01A1 1 0 005 12.446V8a7 7 0 0114 0v4.446c0 .181.05.36.142.515l1.807 3.01c.8 1.333-.161 3.029-1.716 3.029H16ZM12 3a5 5 0 00-5 5v4.446a3 3 0 01-.428 1.543L4.765 17h14.468l-1.805-3.01A3 3 0 0117 12.445V8a5 5 0 00-5-5Zm-2 16a2 2 0 104 0h-4Z"></path>
  </svg>
);

const YouTubeBellActive = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M16 19a4 4 0 11-8 0H4.765C3.21 19 2.25 17.304 3.05 15.97l1.806-3.01A1 1 0 005 12.446V8a7 7 0 0114 0v4.446c0 .181.05.36.142.515l1.807 3.01c.8 1.333-.161 3.029-1.716 3.029H16ZM12 3a5 5 0 00-5 5v4.446a3 3 0 01-.428 1.543L4.765 17h14.468l-1.805-3.01A3 3 0 0117 12.445V8a5 5 0 00-5-5Z"></path>
  </svg>
);

const YouTubeMenuIcon = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M20 5H4a1 1 0 000 2h16a1 1 0 100-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Z"></path>
  </svg>
);


const LOGO_URL = "https://i.ibb.co/cK1mqd6X/Generated-Image-April-24-2026-3-21-AM.png";
const LOGO_DARK_URL = "https://i.ibb.co/tMyCy4HH/Generated-Image-April-28-2026-9-08-PM.png";
const LOGO_DARK_USER = "https://i.ibb.co/tMyCy4HH/Generated-Image-April-28-2026-9-08-PM.png"; 

// ─── Suppress Vite HMR WebSocket errors in production (Render.com) ────────────
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('WebSocket closed without opened') ||
      msg.includes('WebSocket') ||
      msg.includes('[vite]')
    ) {
      event.preventDefault();
    }
  });
  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (msg.includes('WebSocket') || msg.includes('[vite]')) {
      event.preventDefault();
      return true;
    }
  });
}

const colorCache = new Map<string, string>();

const useDominantColor = (imageUrl: string | undefined) => {
  const [color, setColor] = useState<string>('transparent');
  useEffect(() => {
    if (!imageUrl) return;
    if (colorCache.has(imageUrl)) { setColor(colorCache.get(imageUrl)!); return; }
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 10; canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        const colorCounts: Record<string, number> = {};
        let dominantRgb = [0, 0, 0];
        let maxCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          // skip very dark or very bright colors
          if ((r < 30 && g < 30 && b < 30) || (r > 240 && g > 240 && b > 240)) continue;
          
          const binFactor = 32; 
          const bin = `${Math.floor(r/binFactor)},${Math.floor(g/binFactor)},${Math.floor(b/binFactor)}`;
          colorCounts[bin] = (colorCounts[bin] || 0) + 1;
          if (colorCounts[bin] > maxCount) {
            maxCount = colorCounts[bin];
            dominantRgb = [r, g, b];
          }
        }
        
        if (maxCount === 0) {
           dominantRgb = [data[0], data[1], data[2]];
        }

        const hsl = rgbToHsl(dominantRgb[0], dominantRgb[1], dominantRgb[2]);
        const v = hslToRgb(hsl.h, Math.min(1, hsl.s * 1.5), Math.max(0.4, hsl.l));
        const c = `rgba(${v.r},${v.g},${v.b},0.3)`;
        colorCache.set(imageUrl, c); setColor(c);
      } catch(_) {}
    };
    img.onerror = () => { colorCache.set(imageUrl,'transparent'); setColor('transparent'); };
  }, [imageUrl]);
  return color;
};

function rgbToHsl(r: number, g: number, b: number) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
    h/=6;
  }
  return{h,s,l};
}

function hslToRgb(h: number, s: number, l: number){
  let r,g,b;
  if(s===0){r=g=b=l;}else{
    const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
    const f=(p:number,q:number,t:number)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
    r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3);
  }
  return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};
}

const checkNetfreePolicy = async (query: string): Promise<string | true> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `אתה מנוע סינון תוכן לציבור החרדי (כמו נטפרי).
המשתמש מחפש ביוטיוב: "${query}"

עליך להחליט אם החיפוש הזה ראוי ותואם למדיניות.
דברים שאסור לחפש: סדרות, סרטים, תוכן פוגעני, אלימות, משחקי מחשב, תוכן הקשור לנשים/בנות/בחורות, דברים שלא מתאימים לציבור החרדי, זמרים חילונים, דברים נגד חרדים.
דברים שמותר: הרצאות, שיעורי תורה, מוזיקה חרדית, סקירת מוצרים, הרכבת מחשבים, דברים טכניים תמימים, וכו'.
אל תחמיר סתם. אם החיפוש הוא על משהו טכני, לימודי או תמים, הוא מותר. רק דברים שברור שאסורים לפי ההנחיות למעלה יש לחסום.

אם החיפוש בסדר, ענה אך ורק במילה אחת: "אושר"
אם החיפוש אסור, ענה ב1-2 מילים בלבד את סיבת החסימה (לדוגמה: "משחקי מחשב", "נשים", "סרטים", "תוכן פוגעני" וכדומה). אל תכתוב "חסום", פשוט ענה את סיבת החסימה בקצרה.`,
    });
    
    if (!response || !response.text) return true;
    
    const text = response.text.trim();
    if (text === "אושר" || text.includes("אושר")) {
      return true;
    }
    return text || "תוכן לא ראוי";
  } catch (error) {
    // Silently allow on API errors or ad-blocker XHR issues to prevent breaking the app experience
    console.log("Netfree policy check via Gemini failed or blocked; defaulting to allow.");
    return true;
  }
};

// Debounced backend cache helper
let cacheTimeout: any = null;
const debouncedSetBackendCache = (key: string, data: any) => {
  if (cacheTimeout) clearTimeout(cacheTimeout);
  cacheTimeout = setTimeout(() => {
    try {
      const serialized = JSON.stringify(data);
      if (serialized) {
        setBackendCache(key, data).catch(err => {
          console.error(`Backend set_cache error for key ${key}:`, err);
        });
      }
    } catch (e) {
      console.error(`Failed to serialize data for key ${key}:`, e);
      if (Array.isArray(data)) {
        const cleanData = data.map(item => {
          if (item && typeof item === 'object') {
            const { ...clean } = item;
            delete (clean as any)._owner;
            delete (clean as any)._store;
            return clean;
          }
          return item;
        });
        setBackendCache(key, cleanData).catch(() => {});
      }
    }
  }, 10000);
};

function parseEnglishRelTime(str: string): string | null {
  const s = str.toLowerCase().trim();
  const m = s.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+(ago|old)$/);
  if (!m) return null;
  const n = parseInt(m[1]);
  const unit = m[2];
  if (unit === 'second') return n < 60 ? 'ממש עכשיו' : `לפני ${n} שניות`;
  if (unit === 'minute') { if (n === 1) return 'לפני דקה'; if (n === 2) return 'לפני דקותיים'; return `לפני ${n} דקות`; }
  if (unit === 'hour') { if (n === 1) return 'לפני שעה'; if (n === 2) return 'לפני שעתיים'; return `לפני ${n} שעות`; }
  if (unit === 'day') { if (n === 1) return 'אתמול'; if (n === 2) return 'שלשום'; return `לפני ${n} ימים`; }
  if (unit === 'week') { if (n === 1) return 'לפני שבוע'; if (n === 2) return 'לפני שבועיים'; return `לפני ${n} שבועות`; }
  if (unit === 'month') { if (n === 1) return 'לפני חודש'; if (n === 2) return 'לפני חודשיים'; return `לפני ${n} חודשים`; }
  if (unit === 'year') { if (n === 1) return 'לפני שנה'; if (n === 2) return 'לפני שנתיים'; return `לפני ${n} שנים`; }
  return null;
}

function getRelativeTime(dateString: string): string {
  if (!dateString) return '';
  if (dateString.includes('לפני') || dateString.includes('ממש עכשיו')) return dateString;
  if (dateString.includes('ago') || dateString.includes('just now')) {
    if (dateString === 'just now') return 'ממש עכשיו';
    const cleaned = dateString.replace(/^(streamed|premiered|uploaded|shared)\s+/i, '');
    const parsed = parseEnglishRelTime(cleaned);
    if (parsed) return parsed;
    return cleaned;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'ממש עכשיו';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) return 'לפני דקה';
  if (diffInMinutes === 2) return 'לפני דקותיים';
  if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return 'לפני שעה';
  if (diffInHours === 2) return 'לפני שעתיים';
  if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'אתמול';
  if (diffInDays === 2) return 'שלשום';
  if (diffInDays < 7) return `לפני ${diffInDays} ימים`;
  if (diffInDays < 14) return 'לפני שבוע';
  if (diffInDays < 21) return 'לפני שבועיים';
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return 'לפני חודש';
  if (diffInMonths === 2) return 'לפני חודשיים';
  if (diffInMonths < 12) return `לפני ${diffInMonths} חודשים`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  if (diffInYears === 1) return 'לפני שנה';
  if (diffInYears === 2) return 'לפני שנתיים';
  return `לפני ${diffInYears} שנים`;
}

function parseYouTubeCount(count: any): number {
  if (count === undefined || count === null) return 0;
  const countStr = String(count).toUpperCase().trim();
  if (countStr === "" || countStr === "NULL" || countStr === "UNDEFINED") return 0;
  
  let multiplier = 1;
  if (countStr.includes('K') || countStr.includes('אלף')) multiplier = 1000;
  else if (countStr.includes('M') || countStr.includes('מיליון')) multiplier = 1000000;
  else if (countStr.includes('B') || countStr.includes('מיליארד')) multiplier = 1000000000;

  const directNum = parseInt(countStr.replace(/,/g, ''));
  if (!isNaN(directNum) && multiplier === 1) {
    return directNum;
  }

  let cleanStr = countStr.replace(/[^0-9.]/g, '');
  
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return 0;
  
  return Math.floor(num * multiplier);
}

function formatCount(count: any): string {
  if (count === undefined || count === null) return "";
  let countStr = String(count).trim();
  if (countStr === "" || countStr === "null" || countStr === "undefined") return "";

  // Strip any pre-existing "views" / "צפיות" labels so callers can safely append " צפיות"
  countStr = countStr.replace(/views?/gi, '').replace(/צפיות/g, '').replace(/צפייה/g, '').trim();
  // Collapse extra spaces
  countStr = countStr.replace(/\s+/g, ' ');
  if (countStr === "") return "";

  if (/[^\d,.\s]/.test(countStr)) return countStr;

  const num = Number(countStr.replace(/,/g, ''));
  if (isNaN(num)) return countStr;

  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';

  return num.toLocaleString();
}

function formatSubscribers(count: any): string {
  if (count === undefined || count === null) return "";
  let countStr = String(count).trim();
  if (countStr === "" || countStr === "null" || countStr === "undefined" || countStr === "0") return "";
  countStr = countStr.replace(/subscribers?/i, '').replace(/מנויים/i, '').trim();
  if (!/[^\d,.\s]/.test(countStr)) {
    const num = Number(countStr.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toLocaleString();
    }
  }
  return countStr;
}

let globalLogs: {id: string, message: string, type: 'error' | 'info' | 'warning', timestamp: string}[] = [];
const logListeners = new Set<() => void>();

const addGlobalLog = (message: string, type: 'error' | 'info' | 'warning' = 'error') => {
  const id = Math.random().toString(36).substring(7);
  const timestamp = new Date().toLocaleTimeString('he-IL');
  globalLogs = [{id, message, type, timestamp}, ...globalLogs].slice(0, 100);
  logListeners.forEach(listener => listener());
};

const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
  const message = args.map(arg => {
    if (arg instanceof Error) return arg.stack || arg.message;
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');
  // Suppress Vite HMR / WebSocket noise
  if (message.includes('WebSocket') || message.includes('[vite]') || message.includes('failed to connect')) return;
  addGlobalLog(message, 'error');
  originalConsoleError.apply(console, args);
};

console.log = (...args: any[]) => {
  const message = args.map(arg => {
    if (arg instanceof Error) return arg.stack || arg.message;
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');
  if (message.includes('CONNECTED') || message.includes('RapidAPI') || message.includes('YouTube') || message.includes('OAuth')) {
    addGlobalLog(message, 'info');
  }
  originalConsoleLog.apply(console, args);
};

function LogViewer({ isOpen, onToggle, isSidebarOpen }: { isOpen: boolean, onToggle: () => void, isSidebarOpen: boolean }) {
  // Log viewer is hidden — returns nothing
  return null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): any {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    addGlobalLog(`CRITICAL ERROR: ${error.message}`, 'error');
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-8 text-center" dir="rtl">
          <div className="bg-red-600/20 p-6 rounded-full mb-6">
            <AlertTriangle size={64} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">אופס! משהו השתבש</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            האפליקציה נתקלה בשגיאה קריטית. אל דאגה, הלוגים נשמרו וניתן לראות אותם למטה.
          </p>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-red-900/30 mb-8 w-full max-w-2xl text-left font-mono text-sm overflow-auto max-h-40">
            {(this as any).state.errorMessage}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-colors"
          >
            רענן את הדף
          </button>
          <LogViewer isOpen={true} onToggle={() => {}} isSidebarOpen={false} />
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const getThumbnailUrls = (videoId: string) => [
  `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/default.jpg`
];

const VideoThumbnail = ({ video, className, alt }: { video: any, className?: string, alt?: string }) => {
  const videoId = typeof video?.id === 'string' ? video.id : (video?.id?.videoId || (typeof video?.id === 'object' ? null : video?.id));
  
  const urls = videoId ? getThumbnailUrls(videoId) : [`https://picsum.photos/seed/${video?.snippet?.title || 'video'}/480/270`];
  
  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setSrcIndex(0);
  }, [videoId]);

  // If we've exhausted all urls and the last one failed (or is a 120px grey box), we could show a placeholder,
  // but the handleError/handleLoad will just stop at the last index.
  // Let's add a final fallback to the urls array.
  const finalUrls = [...urls, `https://picsum.photos/seed/${videoId || 'video'}/480/270`];
  const src = finalUrls[srcIndex];

  if (!src) return <div className={`bg-gray-200 animate-pulse ${className}`} />;

  return (
    <img 
      src={src} 
      alt={alt || video?.snippet?.title || "Thumbnail"} 
      className={className} 
      referrerPolicy="no-referrer" 
      loading="lazy"
      onError={() => {
        if (srcIndex < finalUrls.length - 1) {
          setSrcIndex(prev => prev + 1);
        }
      }}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 120 && srcIndex < finalUrls.length - 1) {
          setSrcIndex(prev => prev + 1);
        }
      }}
    />
  );
};

export const isShortVideo = (video: YouTubeVideo) => {
  if (video.isShort) return true;
  const dur = String(video.snippet?.duration || video.durationText || "");
  if (!dur || dur.toUpperCase() === "LIVE") return false;
  // Use the robust parseDurationSecs if available or a similar logic
  try {
    const totalSecs = parseDurationSecs(dur);
    return totalSecs > 0 && totalSecs <= 63;
  } catch (e) {
    if (dur.includes(':')) {
      const parts = dur.split(":");
      if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0) <= 63;
      if (parts.length === 1) return (parseInt(parts[0]) || 0) <= 63;
    }
    return false;
  }
};

const GlobalStyles = () => (
  <style>{`
    html {
      font-size: 14px;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    body {
      overflow-x: hidden;
    }

    /* מסכים קטנים */
    @media (max-width: 767px) {
      html {
        font-size: 12px;
      }
    }

    /* טאבלטים / לפטופים קטנים */
    @media (min-width: 768px) and (max-width: 1023px) {
      html {
        font-size: 11px;
      }
    }

/* לפטופים רגילים */
    @media (min-width: 1024px) and (max-width: 1365px) {
      html {
        font-size: 9px;
      }
    }

    /* לפטופים בינוניים */
    @media (min-width: 1366px) and (max-width: 1599px) {
      html {
        font-size: 10px;
      }
    }

    /* דסקטופ רגיל */
    @media (min-width: 1600px) and (max-width: 1919px) {
      html {
        font-size: 12px;
      }
    }

    /* מסכים גדולים */
    @media (min-width: 1920px) {
      html {
        font-size: 13px;
      }
    }
      `}</style>
);

// ─── Shabbat & Jewish Holiday Detection ──────────────────────────────────────
const JEWISH_HOLIDAY_RANGES: [string, string, string][] = [
  // [start, end, name] — all dates in YYYY-MM-DD Israel timezone
  // 5784 (2023-2024)
  ['2023-09-15', '2023-09-17', 'ראש השנה'], ['2023-09-24', '2023-09-25', 'יום כיפור'],
  ['2023-09-29', '2023-10-07', 'סוכות ושמיני עצרת'],
  ['2024-04-22', '2024-04-29', 'פסח'], ['2024-06-11', '2024-06-12', 'שבועות'],
  // 5785 (2024-2025)
  ['2024-10-02', '2024-10-04', 'ראש השנה'], ['2024-10-11', '2024-10-12', 'יום כיפור'],
  ['2024-10-16', '2024-10-24', 'סוכות ושמיני עצרת'],
  ['2025-04-12', '2025-04-19', 'פסח'], ['2025-06-01', '2025-06-02', 'שבועות'],
  // 5786 (2025-2026)
  ['2025-09-22', '2025-09-24', 'ראש השנה'], ['2025-10-01', '2025-10-02', 'יום כיפור'],
  ['2025-10-06', '2025-10-14', 'סוכות ושמיני עצרת'],
  ['2026-03-31', '2026-04-07', 'פסח'], ['2026-05-20', '2026-05-21', 'שבועות'],
  // 5787 (2026-2027)
  ['2026-09-11', '2026-09-13', 'ראש השנה'], ['2026-09-20', '2026-09-21', 'יום כיפור'],
  ['2026-09-25', '2026-10-03', 'סוכות ושמיני עצרת'],
];

const getIsraelDateStr = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
};

const getIsraelDayOfWeek = (date: Date): number => {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short' }).format(date);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(day);
};

const checkShabbatOrHoliday = (publishedAt: string): { isRestricted: boolean; reason: string } => {
  if (!publishedAt) return { isRestricted: false, reason: '' };
  try {
    const date = new Date(publishedAt);
    if (isNaN(date.getTime())) return { isRestricted: false, reason: '' };
    const dow = getIsraelDayOfWeek(date);
    if (dow === 6) return { isRestricted: true, reason: 'שבת' };
    const dateStr = getIsraelDateStr(date);
    for (const [start, end, name] of JEWISH_HOLIDAY_RANGES) {
      if (dateStr >= start && dateStr <= end) return { isRestricted: true, reason: name };
    }
    return { isRestricted: false, reason: '' };
  } catch { return { isRestricted: false, reason: '' }; }
};

// ─── ShabbatWarningModal ──────────────────────────────────────────────────────
function ShabbatWarningModal({ video, reason, onClose, onWatchAnyway }: {
  video: any; reason: string; onClose: () => void; onWatchAnyway: () => void;
}) {
  const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || '');
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const ticketMsg = `אנא בדקו את הסרטון: ${videoUrl}\nחשוב לציין שהסרטון עלה ב${reason} ולפי ההלכה אסור לראות אותו אלא אם כן זה צולם שלא לצורך הנאה וכו'... בדקו את הנושא...`;
  const [copied, setCopied] = useState(false);

  const handleOpenNetFree = () => {
    window.open('https://netfree.link/app/#/tickets/new', '_blank', 'noopener');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketMsg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-md overflow-hidden"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-amber-50 dark:bg-amber-900/20">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">סרטון שהועלה ב{reason}</h2>
              <p className="text-xs text-[var(--muted)]">נדרשת בדיקה לפני צפייה</p>
            </div>
            <button onClick={onClose} className="mr-auto p-1.5 hover:bg-[var(--secondary)] rounded-full text-[var(--muted)]">
              <X size={18} />
            </button>
          </div>

          {/* Thumbnail + title */}
          <div className="flex items-center gap-3 px-5 py-3 bg-[var(--secondary)]/50">
            <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--secondary)]">
              <img
                src={video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url}
                alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-sm font-medium line-clamp-2 text-[var(--foreground)]">{video.snippet?.title}</p>
          </div>

          {/* Message */}
          <div className="px-5 py-4">
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
              סרטון זה הועלה ב<strong className="text-[var(--foreground)]">{reason}</strong> ולפי ההלכה אסור לראות אותו אלא אם כן זה צולם שלא לצורך הנאה.
              <br/>ניתן לשלוח פנייה לנטפרי לבדיקת הסרטון:
            </p>

            {/* Message to copy */}
            <div className="bg-[var(--secondary)] rounded-xl p-3 mb-4 text-xs text-[var(--muted)] leading-relaxed font-mono break-all">
              {ticketMsg}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { handleCopy(); handleOpenNetFree(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
                {copied ? 'הועתק! פתח פנייה...' : 'העתק הודעה ופתח פנייה לנטפרי'}
              </button>
              <button
                onClick={onWatchAnyway}
                className="w-full px-4 py-2.5 bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--muted)] rounded-xl font-medium transition-colors text-sm"
              >
                צפה בכל זאת (על אחריותי)
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Parse video duration string to seconds ──────────────────────────────────
function parseDurationSecs(dur: string | undefined): number {
  if (!dur || dur === 'LIVE' || dur === '') return 0;
  const parts = dur.trim().split(':').map(s => parseInt(s, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">מדיניות פרטיות עבור MugenTube</h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">1. המידע שאנו אוספים</h2>
          <p>אנו אוספים מידע בסיסי בלבד דרך חשבון גוגל שלך בעת ההתחברות:</p>
          <ul className="list-disc list-inside pr-4 space-y-1">
            <li>שם מלא.</li>
            <li>כתובת אימייל.</li>
            <li>תמונת פרופיל.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">2. כיצד אנו משתמשים במידע</h2>
          <p>המידע משמש אך ורק עבור:</p>
          <ul className="list-disc list-inside pr-4 space-y-1">
            <li>זיהוי המשתמש באתר ומתן גישה לשירותים.</li>
            <li>התאמה אישית של חוויית המשתמש.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">3. שיתוף מידע עם צד שלישי</h2>
          <p>אנו לא מוכרים, משכירים או משתפים את המידע האישי שלך עם אף גורם חיצוני.</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">4. אבטחת מידע</h2>
          <p>אנו נוקטים באמצעי זהירות טכנולוגיים כדי להגן על המידע האישי שלך המאוחסן בשרתינו.</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">5. יצירת קשר</h2>
          <p>לכל שאלה בנושא פרטיות, ניתן לפנות אלינו בכתובת: yehokarpel100@gmail.com.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [homeCategory, setHomeCategory] = useState<string>('הכול');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [homeVideos, setHomeVideos] = useState<YouTubeVideo[]>([]);
  const [homeNextPageToken, setHomeNextPageToken] = useState<string | undefined>(undefined);
  const [homeShorts, setHomeShorts] = useState<YouTubeVideo[]>([]);
  const [searchShorts, setSearchShorts] = useState<YouTubeVideo[]>([]);
  const [rabbiShorts, setRabbiShorts] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (loading || isNavigating) {
      setShowProgress(true);
      setProgress(30);
      const timer = setTimeout(() => setProgress(80), 500);
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, isNavigating]);

  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [searchShortsNextPageToken, setSearchShortsNextPageToken] = useState<string | undefined>(undefined);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedVideoChannel, setSelectedVideoChannel] = useState<any | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<boolean>(false);
  const [channelVideos, setChannelVideos] = useState<YouTubeVideo[]>([]);
  const [channelNextPageToken, setChannelNextPageToken] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [foundChannel, setFoundChannel] = useState<any | null>(null);
  const [foundChannels, setFoundChannels] = useState<any[]>([]);
  const [error, setError] = useState<{ code: number, message: string, reason: string } | null>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<any[]>([]);
  const [isBellActive, setIsBellActive] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const isSubscribed = useMemo(() => {
    const channelId = selectedChannel?.id || selectedVideoChannel?.id || selectedVideo?.snippet?.channelId;
    if (!channelId) return false;
    return subscribedChannels.some(c => c.id === channelId);
  }, [subscribedChannels, selectedChannel, selectedVideoChannel, selectedVideo]);
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);
  const [isSubscriptionsView, setIsSubscriptionsView] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'videos' | 'shorts' | 'podcasts' | 'music'>('all');
  const [likedVideosFilter, setLikedVideosFilter] = useState<'all' | 'videos' | 'shorts'>('all');
  const [showHiddenVideosBar, setShowHiddenVideosBar] = useState<boolean>(true);
  const shortsScrollRef = useRef<HTMLDivElement>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySearchInput, setHistorySearchInput] = useState('');
  const [isLikedVideosView, setIsLikedVideosView] = useState(false);
  const [isWatchLaterView, setIsWatchLaterView] = useState(false);
  const [isMusicView, setIsMusicView] = useState(false);
  const [isPlaylistsView, setIsPlaylistsView] = useState(false);
  // ─── Search filters & spell correction ──────────────────────────────────
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [tempFilters, setTempFilters] = useState<SearchFilters>({});
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [musicVideos, setMusicVideos] = useState<YouTubeVideo[]>([]);
  const [musicNextPageToken, setMusicNextPageToken] = useState<string | undefined>(undefined);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [musicArtists, setMusicArtists] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<YouTubeVideo[]>([]);
  const [likedVideos, setLikedVideos] = useState<YouTubeVideo[]>([]);
  const [watchLater, setWatchLater] = useState<YouTubeVideo[]>([]);
  // videoProgressMap: videoId -> { currentTime, duration }
  const [videoProgressMap, setVideoProgressMap] = useState<Record<string, { currentTime: number; duration: number }>>(() => {
    try {
      const raw = localStorage.getItem('video_progress_map_v1');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState("מקשיב...");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [showMoreShorts, setShowMoreShorts] = useState<{ [key: number]: boolean }>({});

  const renderSearchResults = () => {
    let filteredVideos = videos;
    let filteredShorts = searchShorts;
    
    // Apply local filters
    if (searchFilters.type === 'short') {
      // In shorts-only mode, don't show shelves, just render everything as regular results
      // Or we can just let filteredVideos be only shorts, and clear filteredShorts so it doesn't render shelves
      filteredVideos = [...filteredVideos.filter(v => isShortVideo(v)), ...filteredShorts];
      filteredShorts = [];
    } else if (searchFilters.type === 'video') {
      filteredVideos = filteredVideos.filter(v => !isShortVideo(v));
      filteredShorts = []; // No shorts shelves
    } else if (searchFilters.type === 'channel') {
      filteredVideos = [];
      filteredShorts = [];
    }
    
    if (searchFilters._fake === 'watched') {
      const isWatched = (v: any) => watchHistory.some(h => (typeof h.id === 'string' ? h.id : h.id?.videoId) === (typeof v.id === 'string' ? v.id : v.id?.videoId));
      filteredVideos = filteredVideos.filter(isWatched);
      filteredShorts = filteredShorts.filter(isWatched);
    } else if (searchFilters._fake === 'unwatched') {
      const isWatched = (v: any) => watchHistory.some(h => (typeof h.id === 'string' ? h.id : h.id?.videoId) === (typeof v.id === 'string' ? v.id : v.id?.videoId));
      filteredVideos = filteredVideos.filter(v => !isWatched(v));
      filteredShorts = filteredShorts.filter(v => !isWatched(v));
    }

    const regularVideos = searchFilters.type === 'short' ? filteredVideos : filteredVideos.filter(v => !isShortVideo(v));
    const elements = [];
    let regularIndex = 0;
    let shortsIndex = 0;
    let shelfIndex = 0;
    let firstIter = true;

    // Use filteredShorts for the regular shelves logic
    while (regularIndex < regularVideos.length || (firstIter && shortsIndex < filteredShorts.length)) {
      // First batch: shortsFirstPosition (random 0 or 2), subsequent batches: 23 videos
      const batchSize = firstIter ? shortsFirstPosition : 23;
      const nextRegular = regularVideos.slice(regularIndex, regularIndex + batchSize);
      
      if (nextRegular.length === 0 && !firstIter) {
        break;
      }
      
      nextRegular.forEach((video, idx) => {
        const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
        if (vId) {
          elements.push(
            <div key={`reg-${vId}-${regularIndex + idx}`} className="w-full">
              <SearchVideoCard 
                video={video} 
                onClick={() => handleVideoSelect(video)}
                onChannelClick={() => handleChannelClick(video.snippet.channelId)}
                videoProgress={videoProgressMap[vId]}
                onToggleReport={handleToggleReport}
                isReportSelected={reportVideos.has(vId)}
                contextType="search_reg"
              />
            </div>
          );
        }
      });
      regularIndex += batchSize;

      // Shorts shelf
      // Only show the Shorts shelf if we actually had enough regular videos to fill the batch OR if it's the very first batch
      if (filteredShorts.length > 0 && (nextRegular.length === batchSize || (regularIndex === 2 && regularVideos.length >= 2))) {
        const currentShelfIndex = shelfIndex;
        const isExpanded = showMoreShorts[currentShelfIndex];
        const shortsToShowCount = isExpanded ? 15 : 5;
        
        const shelfShorts = [];
        for (let i = 0; i < shortsToShowCount; i++) {
          shelfShorts.push(filteredShorts[(shortsIndex + i) % filteredShorts.length]);
        }
        
        if (shelfShorts.length > 0) {
          elements.push(
            <div key={`shorts-shelf-${currentShelfIndex}`} className="w-full my-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" focusable="false" aria-hidden="true" style={{ pointerEvents: 'none', display: 'inherit', width: '100%', height: '100%' }}>
                    <path d="m19.45,3.88c1.12,1.82.48,4.15-1.42,5.22l-1.32.74.94.41c1.36.58,2.27,1.85,2.35,3.27.08,1.43-.68,2.77-1.97,3.49l-8,4.47c-1.91,1.06-4.35.46-5.48-1.35-1.12-1.82-.48-4.15,1.42-5.22l1.33-.74-.94-.41c-1.36-.58-2.27-1.85-2.35-3.27-.08-1.43.68-2.77,1.97-3.49l8-4.47c1.91-1.06,4.35-.46,5.48,1.35Z" fill="#f03"></path>
                    <path d="m10,15l5-3-5-3v6Z" fill="#fff"></path>
                  </svg>
                </span>
                <h2 className="text-[20px] font-bold text-[var(--foreground)]">Shorts</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-2 gap-y-4">
                {shelfShorts.map((video, idx) => {
                  const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                  return (
                    <div key={`short-${vId}-${idx}`} className="w-full">
                      <ShortCard 
                        video={video} 
                        onClick={() => handleVideoSelect(video, false, filteredShorts)}
                        onChannelClick={() => handleChannelClick(video.snippet.channelId)}
                        videoProgress={videoProgressMap[vId]}
                        contextType="search_shorts"
                      />
                    </div>
                  );
                })}
              </div>
              {filteredShorts.length > shortsIndex + 5 && (
                <div className="mt-6 flex justify-center items-center relative w-full">
                  <hr className="w-full absolute border-t border-[var(--border)]" />
                  <button 
                    onClick={() => setShowMoreShorts(prev => ({ ...prev, [currentShelfIndex]: !prev[currentShelfIndex] }))}
                    className="relative z-10 inline-flex w-full max-w-[360px] items-center justify-center gap-2 h-[42px] rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)] text-[15px] font-medium"
                  >
                    <span>מידע נוסף</span>
                    <span className="flex items-center justify-center" style={{ width: '28px', height: '28px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" focusable="false" aria-hidden="true" style={{ pointerEvents: 'none', display: 'inherit', width: '100%', height: '100%', fill: 'currentColor', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        <path d="M18.707 8.793a1 1 0 00-1.414 0L12 14.086 6.707 8.793a1 1 0 10-1.414 1.414L12 16.914l6.707-6.707a1 1 0 000-1.414Z"></path>
                      </svg>
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
          
          shortsIndex += shortsToShowCount;
          shelfIndex++;
        }
      }
      firstIter = false;
    }
    return elements;
  };
  const [isRestored, setIsRestored] = useState(false);
  const [shabbatWarning, setShabbatWarning] = useState<{ video: any; reason: string } | null>(null);
  // NetFree multi-video reporting
  const [reportVideos, setReportVideos] = useState<Map<string, YouTubeVideo>>(new Map());
  const [userOwnPlaylists, setUserOwnPlaylists] = useState<any[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistModalVideo, setPlaylistModalVideo] = useState<YouTubeVideo | null>(null);
  const [editPlaylistModal, setEditPlaylistModal] = useState<any | null>(null);
  const [appSaveToast, setAppSaveToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const appSaveToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showAppSaveToast = (message: string) => {
    if (appSaveToastTimeout.current) clearTimeout(appSaveToastTimeout.current);
    setAppSaveToast({ message, visible: true });
    appSaveToastTimeout.current = setTimeout(() => setAppSaveToast({ message: '', visible: false }), 3000);
  };
  const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null);
  const [viewingPlaylistVideos, setViewingPlaylistVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingPlaylistVideos, setIsLoadingPlaylistVideos] = useState(false);
  
  const [viewingChannelPlaylist, setViewingChannelPlaylist] = useState<any | null>(null);
  const [viewingChannelPlaylistVideos, setViewingChannelPlaylistVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingChannelPlaylistVideos, setIsLoadingChannelPlaylistVideos] = useState(false);
  const [activePlaylistContext, setActivePlaylistContext] = useState<{
    id: string; name: string; videos: YouTubeVideo[]; currentIndex: number;
  } | null>(null);
  const [activeShortsContext, setActiveShortsContext] = useState<{
    shorts: YouTubeVideo[]; currentIndex: number;
  } | null>(null);

  // ─── תיקון 1: קריאה מ-localStorage במקום sessionStorage בלבד ───
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('youtube_user_v1') || sessionStorage.getItem('youtube_user_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('youtube_access_token_v1') || sessionStorage.getItem('youtube_access_token_v1');
  });
  // ──────────────────────────────────────────────────────────────

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('youtube_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('youtube_language') || 'עברית');
    
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('youtube_dark_mode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('youtube_language', language);
  }, [language]);

  const [lastQueryUsed, setLastQueryUsed] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(true);

  // Random position for shorts shelf in search results - 0 = appear first, 2 = appear after 2 regular videos
  // Re-randomizes only when search query changes, so position is stable during a single search
  const shortsFirstPosition = useMemo(() => Math.random() < 0.35 ? 0 : 2, [lastQueryUsed]);

  const fetchUserOwnPlaylists = useCallback(async () => {
    if (!user?.email) return;
    try {
      const playlists = await getUserPlaylists(user.email);
      // Fix missing thumbnails
      let hasUpdates = false;
      const updatedPlaylists = await Promise.all(playlists.map(async (pl: any) => {
        if (!pl.thumbnail && pl.videoCount > 0) {
          const videos = await getPlaylistVideos(user.email, pl.id);
          if (videos && videos.length > 0) {
            const firstVideo = videos[0];
            pl.thumbnail = firstVideo.snippet?.thumbnails?.high?.url || firstVideo.snippet?.thumbnails?.medium?.url || firstVideo.snippet?.thumbnails?.default?.url;
            hasUpdates = true;
          }
        }
        return pl;
      }));
      if (hasUpdates) {
        await setBackendCache(`playlists_${user.email}`, updatedPlaylists);
      }
      setUserOwnPlaylists(updatedPlaylists || []);
    } catch(e) {}
  }, [user?.email]);

  const handlePlaylistVideoSelect = useCallback((videos: YouTubeVideo[], index: number, playlistName: string, playlistId: string) => {
    setActivePlaylistContext({ id: playlistId, name: playlistName, videos, currentIndex: index });
    const video = videos[index];
    setSelectedVideo(video);
    const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || '');
    if (videoId) window.history.pushState({ view: 'video', video }, '', `?v=${videoId}`);
    addUserActivity('history', { ...video, _watchedAt: new Date().toISOString() });
    setWatchHistory(prev => {
      const filtered = prev.filter(v => { const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || ''); return vId !== videoId; });
      return [{ ...video, _watchedAt: new Date().toISOString() } as any, ...filtered].slice(0, 100);
    });
  }, []);

  const handlePlaylistNext = useCallback(() => {
    if (!activePlaylistContext) return;
    const nextIndex = activePlaylistContext.currentIndex + 1;
    if (nextIndex < activePlaylistContext.videos.length) {
      const nextVideo = activePlaylistContext.videos[nextIndex];
      setActivePlaylistContext(prev => prev ? { ...prev, currentIndex: nextIndex } : null);
      setSelectedVideo(nextVideo);
      const videoId = typeof nextVideo.id === 'string' ? nextVideo.id : (nextVideo.id?.videoId || '');
      if (videoId) window.history.pushState({ view: 'video', video: nextVideo }, '', `?v=${videoId}`);
      addUserActivity('history', { ...nextVideo, _watchedAt: new Date().toISOString() });
      setWatchHistory(prev => {
        const filtered = prev.filter(v => { const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || ''); return vId !== videoId; });
        return [{ ...nextVideo, _watchedAt: new Date().toISOString() } as any, ...filtered].slice(0, 100);
      });
    }
  }, [activePlaylistContext]);

  const addErrorLog = useCallback((message: string, type: 'error' | 'info' = 'error') => {
    addGlobalLog(message, type);
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    const modeWhenStarted = isSearchMode ? 'search' : isMusicView ? 'music' : isSubscriptionsView ? 'subs' : selectedChannel ? 'channel' : 'home';
    const query = lastQueryUsed || searchQuery || "שיעורי תורה";
    let result;
    let moreShortsResult;
    try {
      if (isMusicView) {
        result = await getHaredimMusicVideos(nextPageToken);
      } else if (!isSearchMode && !isSubscriptionsView && !selectedChannel) {
        if (homeCategory === 'הכול') {
          result = await getPopularTorahVideos(nextPageToken);
        } else if (homeCategory === 'מוזיקה') {
          result = await searchVideos('מוזיקה חרדית ישי ריבו אברהם פריד שירים חסידיים', true, nextPageToken, undefined);
        } else if (homeCategory === 'פודקאסטים') {
          result = await searchVideos('פודקאסט יהדות רבנים', true, nextPageToken, undefined);
        } else if (homeCategory === 'מיקסים') {
          result = await searchVideos('מיקס שירים חסידיים ווקאלי', true, nextPageToken, undefined);
        } else if (homeCategory === 'לילדים') {
          result = await searchVideos('סרטוני יהדות לילדים פרפר נחמד', true, nextPageToken, undefined);
        } else if (homeCategory === 'שידור חי') {
          result = await searchVideos('שידור חי הכותל רדיו קול חי יהדות', true, nextPageToken, undefined);
        } else if (homeCategory === 'הועלו לאחרונה') {
          result = await searchVideos('שיעורי תורה חדשים', true, nextPageToken, undefined);
        } else if (homeCategory === 'נצפו') {
          result = await searchVideos('שיעור תורה ויראלי נצפו ביותר', true, nextPageToken, undefined);
        } else if (homeCategory === 'חדש בשבילך') {
          result = await searchVideos('חיזוק באמונה ובטחון הרב', true, nextPageToken, undefined);
        } else {
          result = await getPopularTorahVideos(nextPageToken);
        }
      } else {
        const promises: Promise<any>[] = [searchVideos(query, isSearchMode, nextPageToken)];
        if (searchShortsNextPageToken) {
          promises.push(searchVideos(`${query} #shorts`, isSearchMode, searchShortsNextPageToken));
        }
        const results = await Promise.all(promises);
        result = results[0];
        if (results.length > 1) moreShortsResult = results[1];
      }
    } catch (_) {
      result = { items: [], nextPageToken: undefined };
    }
    if (!result) result = { items: [], nextPageToken: undefined };
    
    let newItems = result.items || [];
    if (!isSearchMode && !isSubscriptionsView && !selectedChannel && !isMusicView) {
      newItems = [...newItems].sort(() => 0.5 - Math.random());
    }
    
    setVideos(prev => {
      // If we navigated away while fetching, discard the results
      const currentMode = isSearchMode ? 'search' : isMusicView ? 'music' : isSubscriptionsView ? 'subs' : selectedChannel ? 'channel' : 'home';
      if (currentMode !== modeWhenStarted) {
        return prev;
      }
      const updated = [...prev, ...newItems];
      if (!isSearchMode && !isSubscriptionsView && !selectedChannel && !isMusicView) {
        setHomeVideos(updated);
      }
      return updated;
    });

    if (moreShortsResult && moreShortsResult.items) {
      setSearchShorts(prev => {
        const existingIds = new Set(prev.map(v => typeof v.id === 'string' ? v.id : (v.id?.videoId || "")));
        const uniqueNewShorts = moreShortsResult.items.filter((v: YouTubeVideo) => {
          const id = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
          return id && !existingIds.has(id) && isShortVideo(v);
        });
        return [...prev, ...uniqueNewShorts];
      });
      setSearchShortsNextPageToken(moreShortsResult.nextPageToken);
    }

    setNextPageToken(result.nextPageToken);
    
    if (!isSearchMode && !isSubscriptionsView && !selectedChannel && !isMusicView) {
      setHomeNextPageToken(result.nextPageToken);
      // Caching disabled per user request
    }
    
    setLoadingMore(false);
  }, [nextPageToken, searchShortsNextPageToken, loadingMore, lastQueryUsed, searchQuery, isSearchMode, isSubscriptionsView, selectedChannel, isMusicView, homeCategory]);

  const loadMoreChannelVideos = useCallback(async () => {
    if (!selectedChannel || !channelNextPageToken || loadingMore) return;
    setLoadingMore(true);
    const result = await getVideosByChannel(selectedChannel.id, channelNextPageToken);
    
    setChannelVideos(prev => {
      const updatedVideos = [...prev, ...result.items];
      
      const cacheKey = `channel_cache_v7_${selectedChannel.id}`;
      // Caching disabled per user request
      
      return updatedVideos;
    });
    
    setChannelNextPageToken(result.nextPageToken);
    setLoadingMore(false);
  }, [selectedChannel, channelNextPageToken, loadingMore]);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const isSearchTriggeredRef = useRef(false);
  const activeSearchIdRef = useRef(0);
  const isFirstLoadRef = useRef(true);
  const userEmailRef = useRef<string | null>(null);
  const scrollPositionRef = useRef<{ [key: string]: number }>({});
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore || !nextPageToken) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1, rootMargin: '800px' });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, nextPageToken, loadMore]);

  const channelObserver = useRef<IntersectionObserver | null>(null);
  const lastChannelVideoRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore || !channelNextPageToken) return;
    if (channelObserver.current) channelObserver.current.disconnect();
    channelObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreChannelVideos();
      }
    }, { threshold: 0.1, rootMargin: '800px' });
    if (node) channelObserver.current.observe(node);
  }, [loading, loadingMore, channelNextPageToken, loadMoreChannelVideos]);

  useEffect(() => {
    if (loading) return;
    
    const navState = {
      selectedVideo,
      selectedVideoChannel,
      selectedChannel,
      channelVideos,
      channelNextPageToken,
      isSearchMode,
      isSubscriptionsView,
      isHistoryView,
      isLikedVideosView,
      isWatchLaterView,
      isMusicView,
      isPlaylistsView,
      searchQuery,
      lastQueryUsed,
      videos: videos.slice(0, 100),
      homeVideos: homeVideos.slice(0, 100),
      homeShorts,
      rabbiShorts,
      nextPageToken,
      homeNextPageToken,
      isSubscribed,
      isBellActive
    };
    try { localStorage.setItem(getUserKey('youtube_nav_state_v2'), JSON.stringify(navState)); } catch(e) {}
    if (user && isRestored) {
      debouncedSetBackendCache(getUserKey('youtube_nav_state_v2'), navState);
    }
  }, [
    selectedVideo, 
    selectedVideoChannel, 
    selectedChannel, 
    channelVideos, 
    channelNextPageToken, 
    isSearchMode, 
    isSubscriptionsView, 
    isHistoryView,
    isLikedVideosView,
    isWatchLaterView,
    isMusicView,
    isPlaylistsView,
    searchQuery, 
    lastQueryUsed,
    videos,
    homeVideos,
    homeShorts,
    rabbiShorts,
    nextPageToken,
    homeNextPageToken,
    isSubscribed,
    isBellActive,
    loading,
    user,
    isRestored
  ]);

  useEffect(() => {
    if (watchHistory.length > 0 || isRestored) {
      try { localStorage.setItem(getUserKey('youtube_watch_history_v1'), JSON.stringify(watchHistory)); } catch(e) {}
    }
    if (user && isRestored) {
      debouncedSetBackendCache(getUserKey('youtube_watch_history_v1'), watchHistory);
    }
  }, [watchHistory, user, isRestored]);

  useEffect(() => {
    if (likedVideos.length > 0 || isRestored) {
      try { localStorage.setItem(getUserKey('liked_videos_v1'), JSON.stringify(likedVideos)); } catch(e) {}
    }
    if (user && isRestored) {
      debouncedSetBackendCache(getUserKey('liked_videos_v1'), likedVideos);
    }
  }, [likedVideos, user, isRestored]);

  useEffect(() => {
    if (watchLater.length > 0 || isRestored) {
      try { localStorage.setItem(getUserKey('watch_later_v1'), JSON.stringify(watchLater)); } catch(e) {}
    }
    if (user && isRestored) {
      debouncedSetBackendCache(getUserKey('watch_later_v1'), watchLater);
    }
  }, [watchLater, user, isRestored]);

  useEffect(() => {
    // תמיד שומרים — גם מערך ריק — כדי שמחיקות יישמרו ב-localStorage
    if (isRestored) {
      try { localStorage.setItem(getUserKey('recent_searches_v1'), JSON.stringify(recentSearches)); } catch(e) {}
      try { localStorage.setItem(getUserKey('recent_searches_local'), JSON.stringify(recentSearches)); } catch(e) {}
    }
    if (user && isRestored) {
      debouncedSetBackendCache(getUserKey('recent_searches_v1'), recentSearches);
    }
  }, [recentSearches, user, isRestored]);

  useEffect(() => {
    if (subscribedChannels.length > 0 || isRestored) {
      try { localStorage.setItem(getUserKey('subscribed_channels_v2'), JSON.stringify(subscribedChannels)); } catch(e) {}
    }
    if (user && isRestored) {
      debouncedSetBackendCache(getUserKey('subscribed_channels_v2'), subscribedChannels);
    }
  }, [subscribedChannels, user, isRestored]);

  useEffect(() => {
    const track = async () => {
      await trackUserOnBackend();
      const count = await getActiveUsersFromBackend();
      setActiveUsers(count);
    };
    track();
    const interval = setInterval(track, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Save video progress before page unloads (refresh / close) ───────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      // The WatchView timer saves on its cleanup, but beforeunload may run before React cleanup.
      // We signal the WatchView to save by dispatching a custom event.
      window.dispatchEvent(new CustomEvent('saveVideoProgress'));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLikeToggle = useCallback((video: YouTubeVideo, isLiked: boolean) => {
    const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
    if (!videoId) return;
    
    setLikedVideos(prev => {
      const sanitizedPrev = prev.filter(v => v && typeof v === 'object' && v.id);
      
      if (isLiked) {
        if (!sanitizedPrev.some(v => {
          const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
          return vId === videoId;
        })) {
          addUserActivity('likes', video);
          return [video, ...sanitizedPrev];
        }
        return sanitizedPrev;
      } else {
        removeUserActivity('likes', videoId);
        return sanitizedPrev.filter(v => {
          const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
          return vId !== videoId;
        });
      }
    });
  }, []);

  const handleWatchLaterToggle = useCallback((video: YouTubeVideo, isAdded: boolean) => {
    const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
    if (!videoId) return;

    setWatchLater(prev => {
      const sanitizedPrev = prev.filter(v => v && typeof v === 'object' && v.id);
      
      if (isAdded) {
        if (!sanitizedPrev.some(v => {
          const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
          return vId === videoId;
        })) {
          addUserActivity('watch_later', video);
          return [video, ...sanitizedPrev];
        }
        return sanitizedPrev;
      } else {
        removeUserActivity('watch_later', videoId);
        return sanitizedPrev.filter(v => {
          const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
          return vId !== videoId;
        });
      }
    });
  }, []);

  const handleVideoSelect = useCallback((video: YouTubeVideo, skipPushState = false, contextShorts?: YouTubeVideo[]) => {
    const scrollContainer = document.getElementById('home-view-main');
    if (scrollContainer) {
      scrollPositionRef.current[isSearchMode ? 'search' : 'home'] = scrollContainer.scrollTop;
    }
    
    const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
    if (!videoId) return;

    // ─── Shabbat / Holiday check ─────────────────────────────────────────────
    // מציגים דף חסימה בתוך אזור הצפייה — לא מאפשרים לפתוח את הוידאו
    const publishedAt = video.snippet?.publishedAt;
    const { isRestricted, reason } = checkShabbatOrHoliday(publishedAt);
    if (isRestricted) {
      setShabbatWarning({ video, reason });
      // עדיין מנווטים לדף הצפייה כדי להציג את הודעת החסימה
      setIsNavigating(true);
      setSelectedVideo(video);
      if (!skipPushState) {
        window.history.pushState({ view: 'video', video }, '', `?v=${videoId}`);
      }
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    setIsNavigating(true);
    setSelectedVideo(video);
    
    // Auto-close sidebar when entering video page
    setIsSidebarOpen(false);
    
    if (contextShorts && isShortVideo(video)) {
      const currentIndex = contextShorts.findIndex(v => {
        const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
        return vId === videoId;
      });
      if (currentIndex !== -1) {
        setActiveShortsContext({ shorts: contextShorts, currentIndex });
      } else {
        setActiveShortsContext({ shorts: [video], currentIndex: 0 });
      }
    } else {
      setActiveShortsContext(null);
    }
    
    if (!skipPushState) {
      window.history.pushState({ view: 'video', video }, '', `?v=${videoId}`);
    }
    
    addUserActivity('history', { ...video, _watchedAt: new Date().toISOString() });

    setWatchHistory(prev => {
      const filtered = prev.filter(v => {
        const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
        return vId !== videoId;
      });
      return [{ ...video, _watchedAt: new Date().toISOString() } as any, ...filtered].slice(0, 100);
    });
    
    setTimeout(() => setIsNavigating(false), 500);
  }, [isSearchMode]);

  const loadInitialVideos = useCallback(async (forceRefreshArg: any = false, silent = false, skipPushState = false, category?: string) => {
    const currentCat = category || homeCategory;
    const forceRefresh = forceRefreshArg === true;

    if (!silent) {
      if (!skipPushState) {
        window.history.pushState({ view: 'home' }, '', '/');
      }
      setIsSearchMode(false);
      setIsSubscriptionsView(false);
      setIsHistoryView(false);
      setIsLikedVideosView(false);
      setIsWatchLaterView(false);
      setIsMusicView(false);
      setIsPlaylistsView(false);
      setSelectedChannel(null);
      setSelectedVideo(null);
      setSearchQuery('');
      setLastQueryUsed("שיעורי תורה");
      setError(null);
      setActivePlaylistContext(null);
    }

    if (!silent && !forceRefresh && (selectedChannel || selectedVideo || isSearchMode || isSubscriptionsView || isHistoryView || searchQuery !== '')) {
      // Caching disabled per user request
    }

    setLoading(true);
    setError(null);
    try {
      const RABBI_CHANNELS = [
        "@ravmeireliyahu",
        "@HaravZamirCohen",
        "@TVhidabroot",
        "@anafeam",
        "@ravronen",
        "@HaravSnirGueta",
        "@RabbiEyalAmrami",
        "@RabbiRosenblum",
        "@Maran_1",
        "@HaravOvadiaYosef",
        "@tv-2000",
        "@RabbiFanger"
      ];
      
      const randomPage = String(Math.floor(Math.random() * 10) + 1);
      
      let fetchVideosPromise;
      if (currentCat === 'הכול') {
        fetchVideosPromise = getPopularTorahVideos(randomPage);
      } else if (currentCat === 'מוזיקה') {
        fetchVideosPromise = searchVideos('מוזיקה חרדית ישי ריבו אברהם פריד שירים חסידיים', true, undefined, undefined);
      } else if (currentCat === 'פודקאסטים') {
        fetchVideosPromise = searchVideos('פודקאסט יהדות רבנים', true, undefined, undefined);
      } else if (currentCat === 'מיקסים') {
        fetchVideosPromise = searchVideos('מיקס שירים חסידיים ווקאלי', true, undefined, undefined);
      } else if (currentCat === 'לילדים') {
        fetchVideosPromise = searchVideos('סרטוני יהדות לילדים פרפר נחמד', true, undefined, undefined);
      } else if (currentCat === 'שידור חי') {
        fetchVideosPromise = searchVideos('שידור חי הכותל רדיו קול חי יהדות', true, undefined, undefined);
      } else if (currentCat === 'הועלו לאחרונה') {
        fetchVideosPromise = searchVideos('שיעורי תורה חדשים', true, undefined, undefined);
      } else if (currentCat === 'נצפו') {
        fetchVideosPromise = searchVideos('שיעור תורה ויראלי נצפו ביותר', true, undefined, undefined);
      } else if (currentCat === 'חדש בשבילך') {
        fetchVideosPromise = searchVideos('חיזוק באמונה ובטחון הרב', true, undefined, undefined);
      } else {
        fetchVideosPromise = getPopularTorahVideos(randomPage);
      }

      let fetchShortsPromise;
      if (currentCat === 'הכול') {
        fetchShortsPromise = getTorahShorts(randomPage);
      } else if (currentCat === 'מוזיקה') {
        fetchShortsPromise = searchVideos('מוזיקה חרדית שירים #shorts', true, undefined, undefined);
      } else if (currentCat === 'פודקאסטים') {
        fetchShortsPromise = searchVideos('פודקאסט יהדות רבנים #shorts', true, undefined, undefined);
      } else if (currentCat === 'מיקסים') {
        fetchShortsPromise = searchVideos('מיקס שירים חסידיים #shorts', true, undefined, undefined);
      } else if (currentCat === 'לילדים') {
        fetchShortsPromise = searchVideos('סרטוני יהדות לילדים #shorts', true, undefined, undefined);
      } else if (currentCat === 'שידור חי') {
        fetchShortsPromise = searchVideos('שידור חי יהדות #shorts', true, undefined, undefined);
      } else if (currentCat === 'הועלו לאחרונה') {
        fetchShortsPromise = searchVideos('שיעורי תורה #shorts', true, undefined, undefined);
      } else if (currentCat === 'נצפו') {
        fetchShortsPromise = searchVideos('שיעור תורה ויראלי #shorts', true, undefined, undefined);
      } else if (currentCat === 'חדש בשבילך') {
        fetchShortsPromise = searchVideos('חיזוק באמונה #shorts', true, undefined, undefined);
      } else {
        fetchShortsPromise = getTorahShorts(randomPage);
      }

      const [result, shortsResult] = await Promise.all([
        fetchVideosPromise,
        fetchShortsPromise
      ]);
      
      if (result && result.items && result.items.length > 0) {
        let finalVideos = [...result.items];
        if (currentCat === 'הכול') {
          finalVideos.sort(() => 0.5 - Math.random());
        }
        setVideos(finalVideos);
        setHomeVideos(finalVideos);
        setNextPageToken(result.nextPageToken || null);
        setHomeNextPageToken(result.nextPageToken || null);
      } else if (!result || !result.items || result.items.length === 0) {
        setVideos([]);
        setHomeVideos([]);
      }
      
      let allShorts: YouTubeVideo[] = shortsResult && shortsResult.items ? shortsResult.items : [];
      
      if (allShorts.length > 0) {
        const shuffledShorts = [...allShorts].sort(() => 0.5 - Math.random());
        setHomeShorts(shuffledShorts.slice(0, 5));
        setRabbiShorts(shuffledShorts.slice(5, 10));
      }
    } catch (err: any) {
      console.error("Error loading home videos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, selectedVideo, isSearchMode, isSubscriptionsView, isHistoryView, searchQuery, homeCategory]);

  const returnToHome = useCallback((skipPushState = false) => {
    activeSearchIdRef.current++;
    if (!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView && !selectedVideo && searchQuery === '') {
      const scrollContainer = document.getElementById('home-view-main');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    
    if (homeVideos.length > 0) {
      if (!skipPushState) {
        window.history.pushState({ view: 'home' }, '', '/');
      }
      setIsSearchMode(false);
      setIsSubscriptionsView(false);
      setIsHistoryView(false);
      setIsLikedVideosView(false);
      setIsWatchLaterView(false);
      setIsMusicView(false);
      setIsPlaylistsView(false);
      setSelectedChannel(null);
      setSelectedVideo(null);
      setSearchQuery('');
      setLastQueryUsed("שיעורי תורה");
      setError(null);
      setActivePlaylistContext(null);
      setLoading(false);
      setVideos(homeVideos);
      setNextPageToken(homeNextPageToken);
      
      setTimeout(() => {
        const scrollContainer = document.getElementById('home-view-main');
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      loadInitialVideos(true, false, skipPushState);
    }
  }, [isSubscriptionsView, isHistoryView, isLikedVideosView, isWatchLaterView, selectedChannel, isSearchMode, isMusicView, isPlaylistsView, selectedVideo, searchQuery, homeVideos, homeNextPageToken, loadInitialVideos]);

  const clearAllState = useCallback(() => {
    setSubscribedChannels([]);
    setWatchHistory([]);
    setLikedVideos([]);
    setWatchLater([]);
    setRecentSearches([]);
    setSelectedVideo(null);
    setSelectedVideoChannel(null);
    setSelectedChannel(null);
    setChannelVideos([]);
    setIsSearchMode(false);
    setIsSubscriptionsView(false);
    setIsHistoryView(false);
    setIsLikedVideosView(false);
    setIsWatchLaterView(false);
    setIsMusicView(false);
    setIsPlaylistsView(false);
    setVideos([]);
    setHomeVideos([]);
    setHomeShorts([]);
    setRabbiShorts([]);
    setNextPageToken(null);
    setHomeNextPageToken(undefined);
    setSearchQuery('');
    setLastQueryUsed('');
    
    sessionStorage.removeItem('subscribed_channels_v2');
    sessionStorage.removeItem('youtube_watch_history_v1');
    sessionStorage.removeItem('liked_videos_v1');
    sessionStorage.removeItem('watch_later_v1');
    sessionStorage.removeItem('recent_searches_v1');
    sessionStorage.removeItem('youtube_nav_state_v2');
    sessionStorage.removeItem('youtube_user_v1');
    sessionStorage.removeItem('youtube_access_token_v1');
    
    localStorage.removeItem('subscribed_channels_v2');
    localStorage.removeItem('youtube_watch_history_v1');
    localStorage.removeItem('liked_videos_v1');
    localStorage.removeItem('watch_later_v1');
    localStorage.removeItem('recent_searches_v1');
    localStorage.removeItem('youtube_nav_state_v2');
    // Clear per-user search history
    try { localStorage.removeItem(getUserKey('recent_searches_local')); } catch(_) {}
  }, []);

  const handlePopStateRef = useRef<((event: PopStateEvent) => void) | null>(null);

  handlePopStateRef.current = (event: PopStateEvent) => {
    const state = event.state;
    if (state) {
      switch (state.view) {
        case 'home':
          returnToHome(true);
          break;
        case 'search':
          setSearchQuery(state.query);
          if (isSearchMode && lastQueryUsed === state.query) {
            setSelectedVideo(null);
            setSelectedChannel(null);
            setTimeout(() => {
              const scrollContainer = document.getElementById('home-view-main');
              if (scrollContainer && scrollPositionRef.current['search'] !== undefined) {
                scrollContainer.scrollTop = scrollPositionRef.current['search'];
              }
            }, 50);
          } else {
            handleSearch(null, state.query, true);
          }
          break;
        case 'video':
          handleVideoSelect(state.video, true);
          break;
        case 'channel':
          handleChannelClick(state.channelId, true);
          break;
        case 'subscriptions':
          loadSubscriptionsView(true);
          break;
        case 'history':
          loadHistoryView(true);
          break;
        case 'liked':
          loadLikedVideosView(true);
          break;
        case 'watch_later':
          loadWatchLaterView(true);
          break;
        case 'music':
          loadMusicView(true);
          break;
        case 'playlists':
          loadPlaylistsView(true);
          break;
        default:
          returnToHome(true);
      }
    } else {
      returnToHome(true);
    }
  };

  useEffect(() => {
    const listener = (e: PopStateEvent) => {
      if (handlePopStateRef.current) {
        handlePopStateRef.current(e);
      }
    };
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  useEffect(() => {
    let title = "מוגן טיוב";
    if (selectedVideo) {
      title = `מוגן טיוב | ${selectedVideo.snippet.title}`;
    } else if (selectedChannel) {
      title = `מוגן טיוב | ${selectedChannel.snippet.title}`;
    } else if (isHistoryView) {
      title = "מוגן טיוב | היסטוריה";
    } else if (isLikedVideosView) {
      title = "מוגן טיוב | סרטונים שאהבתי";
    } else if (isWatchLaterView) {
      title = "מוגן טיוב | לצפייה בהמשך";
    } else if (isPlaylistsView) {
      title = "מוגן טיוב | פלייליסטים";
    } else if (isSearchMode && searchQuery) {
      title = `מוגן טיוב | חיפוש: ${searchQuery}`;
    } else {
      title = "מוגן טיוב | דף הבית";
    }
    document.title = title;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, 64, 64);
        const drawWidth = 64;
        const drawHeight = (img.height / img.width) * drawWidth;
        const yOffset = (64 - drawHeight) / 2;
        ctx.drawImage(img, 0, yOffset, drawWidth, drawHeight);
        link.href = canvas.toDataURL('image/png');
      }
    };
    img.src = "https://i.ibb.co/CpKg2mH0/Generated-Image-April-28-2026-8-28-PM.png";
  }, [selectedVideo, selectedChannel, isHistoryView, isLikedVideosView, isWatchLaterView, isPlaylistsView, isSearchMode, searchQuery]);

  const restoreState = useCallback(async () => {
    const isOAuthRedirect = window.location.hash.includes('access_token=') || window.location.search.includes('type=recovery') || window.location.search.includes('type=signup');
    
    let savedSubs = await getBackendCache(getUserKey('subscribed_channels_v2'));
    let hasBackendError = false;
    if (savedSubs && savedSubs.__backend_error) {
      hasBackendError = true;
      savedSubs = null;
    }
    
    if (savedSubs && Array.isArray(savedSubs) && savedSubs.length > 0) {
      setSubscribedChannels(savedSubs);
    } else {
      const localSubsStr = localStorage.getItem(getUserKey('subscribed_channels_v2')) || localStorage.getItem('subscribed_channels_v2');
      if (localSubsStr) {
        try {
          const parsed = JSON.parse(localSubsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSubscribedChannels(parsed);
          }
        } catch (e) {}
      }
    }

    const localStateStr = localStorage.getItem(getUserKey('youtube_nav_state_v2')) || sessionStorage.getItem('youtube_nav_state_v2') || localStorage.getItem('youtube_nav_state_v2');
    let savedState = null;
    if (localStateStr) {
      try { savedState = JSON.parse(localStateStr); } catch(e) {}
    }
    if (!savedState || !savedState.videos) {
      savedState = await getBackendCache(getUserKey('youtube_nav_state_v2'));
    }
    
    let restored = false;
    let restoredVideosLength = 0;
    
    if (savedState && savedState.videos) {
      try {
        const parsed = savedState;
        
        if (parsed.selectedVideo && !isOAuthRedirect) setSelectedVideo(parsed.selectedVideo);
        if (parsed.selectedVideoChannel && !isOAuthRedirect) setSelectedVideoChannel(parsed.selectedVideoChannel);
        if (parsed.selectedChannel) setSelectedChannel(parsed.selectedChannel);
        if (parsed.channelVideos) setChannelVideos(parsed.channelVideos);
        if (parsed.channelNextPageToken) setChannelNextPageToken(parsed.channelNextPageToken);
        
        if (parsed.isSearchMode && !parsed.selectedVideo) setIsSearchMode(parsed.isSearchMode);
        
        if (parsed.isSubscriptionsView) setIsSubscriptionsView(parsed.isSubscriptionsView);
        if (parsed.isHistoryView) setIsHistoryView(parsed.isHistoryView);
        if (parsed.isLikedVideosView) setIsLikedVideosView(parsed.isLikedVideosView);
        if (parsed.isWatchLaterView) setIsWatchLaterView(parsed.isWatchLaterView);
        if (parsed.isMusicView) setIsMusicView(parsed.isMusicView);
        if (parsed.isPlaylistsView) setIsPlaylistsView(parsed.isPlaylistsView);
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.lastQueryUsed) setLastQueryUsed(parsed.lastQueryUsed);
        
        const isReload = window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType("navigation").length > 0 && (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type === "reload";
        const isHomeView = !parsed.selectedVideo && !parsed.selectedChannel && !parsed.isSearchMode && !parsed.isSubscriptionsView && !parsed.isHistoryView && !parsed.isLikedVideosView && !parsed.isWatchLaterView && !parsed.isMusicView && !parsed.isPlaylistsView;

        if (!(isReload && isHomeView)) {
          if (parsed.videos) {
            setVideos(parsed.videos);
            restoredVideosLength = parsed.videos.length;
          }
          if (parsed.homeVideos) {
            setHomeVideos(parsed.homeVideos);
          }
          if (parsed.homeShorts) {
            setHomeShorts(parsed.homeShorts);
          }
          if (parsed.rabbiShorts) {
            setRabbiShorts(parsed.rabbiShorts);
          }
          if (parsed.nextPageToken) setNextPageToken(parsed.nextPageToken);
          if (parsed.homeNextPageToken) setHomeNextPageToken(parsed.homeNextPageToken);
        }
        
        if (parsed.isBellActive !== undefined) setIsBellActive(parsed.isBellActive);
        
        const hasHomeContent = parsed.homeVideos && parsed.homeVideos.length > 0 && parsed.homeShorts && parsed.homeShorts.length > 0;
        const hasVideosContent = parsed.videos && parsed.videos.length > 0 && parsed.homeShorts && parsed.homeShorts.length > 0;
        
        if (parsed.selectedVideo || parsed.selectedChannel || parsed.isSearchMode || parsed.isSubscriptionsView || parsed.isHistoryView || parsed.isLikedVideosView || parsed.isWatchLaterView || parsed.isMusicView || parsed.isPlaylistsView || ((hasHomeContent || hasVideosContent) && !(isReload && isHomeView))) {
          setLoading(false);
          restored = true;
        }
      } catch (e) {
        console.error("Failed to restore navigation state", e);
      }
    }

    const savedLiked = await getUserActivity('likes');
    const oldLiked = await getBackendCache(getUserKey('liked_videos_v1'));
    const localLikedStr = localStorage.getItem(getUserKey('liked_videos_v1')) || localStorage.getItem('liked_videos_v1');
    let localLiked = [];
    if (localLikedStr) {
      try { localLiked = JSON.parse(localLikedStr); } catch(e) {}
    }
    
    let mergedLiked: YouTubeVideo[] = [];
    
    if (savedLiked && Array.isArray(savedLiked)) {
      mergedLiked = [...savedLiked];
    }
    
    if (oldLiked && Array.isArray(oldLiked)) {
      oldLiked.forEach(oldItem => {
        const oldId = typeof oldItem.id === 'string' ? oldItem.id : (oldItem.id?.videoId || "");
        const exists = mergedLiked.some(mItem => {
          const mId = typeof mItem.id === 'string' ? mItem.id : (mItem.id?.videoId || "");
          return mId === oldId;
        });
        if (!exists && oldId) {
          mergedLiked.push(oldItem);
        }
      });
    }

    if (Array.isArray(localLiked)) {
      localLiked.forEach(oldItem => {
        const oldId = typeof oldItem.id === 'string' ? oldItem.id : (oldItem.id?.videoId || "");
        const exists = mergedLiked.some(mItem => {
          const mId = typeof mItem.id === 'string' ? mItem.id : (mItem.id?.videoId || "");
          return mId === oldId;
        });
        if (!exists && oldId) {
          mergedLiked.push(oldItem);
        }
      });
    }
    
    if (mergedLiked.length > 0) {
      const sanitized = mergedLiked.filter(v => v && typeof v === 'object' && v.id);
      setLikedVideos(sanitized);
    }

    const savedWatchLater = await getUserActivity('watch_later');
    const oldWatchLater = await getBackendCache(getUserKey('watch_later_v1'));
    const localWatchLaterStr = localStorage.getItem(getUserKey('watch_later_v1')) || localStorage.getItem('watch_later_v1');
    let localWatchLater = [];
    if (localWatchLaterStr) {
      try { localWatchLater = JSON.parse(localWatchLaterStr); } catch(e) {}
    }
    
    let mergedWatchLater: YouTubeVideo[] = [];
    
    if (savedWatchLater && Array.isArray(savedWatchLater)) {
      mergedWatchLater = [...savedWatchLater];
    }
    
    if (oldWatchLater && Array.isArray(oldWatchLater)) {
      oldWatchLater.forEach(oldItem => {
        const oldId = typeof oldItem.id === 'string' ? oldItem.id : (oldItem.id?.videoId || "");
        const exists = mergedWatchLater.some(mItem => {
          const mId = typeof mItem.id === 'string' ? mItem.id : (mItem.id?.videoId || "");
          return mId === oldId;
        });
        if (!exists && oldId) {
          mergedWatchLater.push(oldItem);
        }
      });
    }

    if (Array.isArray(localWatchLater)) {
      localWatchLater.forEach(oldItem => {
        const oldId = typeof oldItem.id === 'string' ? oldItem.id : (oldItem.id?.videoId || "");
        const exists = mergedWatchLater.some(mItem => {
          const mId = typeof mItem.id === 'string' ? mItem.id : (mItem.id?.videoId || "");
          return mId === oldId;
        });
        if (!exists && oldId) {
          mergedWatchLater.push(oldItem);
        }
      });
    }
    
    if (mergedWatchLater.length > 0) {
      const sanitized = mergedWatchLater.filter(v => v && typeof v === 'object' && v.id);
      setWatchLater(sanitized);
    }

    // Fast path: load from localStorage immediately (תצוגה זמנית עד שה-PHP יגיב)
    const localSearchesStr = localStorage.getItem(getUserKey('recent_searches_local')) || localStorage.getItem(getUserKey('recent_searches_v1')) || localStorage.getItem('recent_searches_local') || localStorage.getItem('recent_searches_v1');
    if (localSearchesStr) {
      try {
        const parsed = JSON.parse(localSearchesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.slice(0, 10));
        }
      } catch(_) {}
    }

    // PHP הוא הסמכות — הרשימה שלו מחליפה את localStorage (לא מאחדת!)
    // כך מחיקה ב-PHP תשתקף גם אחרי רענון
    const savedSearches = await getUserActivity('searches');
    
    if (savedSearches && Array.isArray(savedSearches) && savedSearches.length > 0) {
      const phpList = savedSearches.filter((s: any) => typeof s === 'string').slice(0, 10);
      setRecentSearches(phpList);
      try { localStorage.setItem(getUserKey('recent_searches_local'), JSON.stringify(phpList)); } catch(_) {}
      try { localStorage.setItem(getUserKey('recent_searches_v1'), JSON.stringify(phpList)); } catch(_) {}
    } else if (!savedSearches || (Array.isArray(savedSearches) && savedSearches.length === 0)) {
      // אם PHP ריק אבל יש ב-localStorage היסטוריה, אולי המשתמש בדיוק שודרג. לכן נשמור את מה שיש ב-localStorage
      // רק אם לא מצאנו כלום ב-localStorage נאפס.
      if (!localSearchesStr && user?.email) {
        setRecentSearches([]);
        try { localStorage.setItem(getUserKey('recent_searches_local'), JSON.stringify([])); } catch(_) {}
        try { localStorage.setItem(getUserKey('recent_searches_v1'), JSON.stringify([])); } catch(_) {}
      } else if (localSearchesStr && user?.email) {
        // שמירת הגיבוי לחשבון ה-PHP
        try {
          const parsed = JSON.parse(localSearchesStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
             debouncedSetBackendCache(getUserKey('recent_searches_v1'), parsed.slice(0, 10));
          }
        } catch(_) {}
      }
    }

    const savedHistory = await getUserActivity('history');
    const oldHistory = await getBackendCache(getUserKey('youtube_watch_history_v1'));
    const localHistoryStr = localStorage.getItem(getUserKey('youtube_watch_history_v1')) || localStorage.getItem('youtube_watch_history_v1');
    let localHistory = [];
    if (localHistoryStr) {
      try { localHistory = JSON.parse(localHistoryStr); } catch(e) {}
    }
    
    let mergedHistory: YouTubeVideo[] = [];
    
    if (savedHistory && Array.isArray(savedHistory)) {
      mergedHistory = [...savedHistory];
    }
    
    if (oldHistory && Array.isArray(oldHistory)) {
      oldHistory.forEach(oldItem => {
        const oldId = typeof oldItem.id === 'string' ? oldItem.id : (oldItem.id?.videoId || "");
        const exists = mergedHistory.some(mItem => {
          const mId = typeof mItem.id === 'string' ? mItem.id : (mItem.id?.videoId || "");
          return mId === oldId;
        });
        if (!exists && oldId) {
          mergedHistory.push(oldItem);
        }
      });
    }

    if (Array.isArray(localHistory)) {
      localHistory.forEach(oldItem => {
        const oldId = typeof oldItem.id === 'string' ? oldItem.id : (oldItem.id?.videoId || "");
        const exists = mergedHistory.some(mItem => {
          const mId = typeof mItem.id === 'string' ? mItem.id : (mItem.id?.videoId || "");
          return mId === oldId;
        });
        if (!exists && oldId) {
          mergedHistory.push(oldItem);
        }
      });
    }
    
    if (mergedHistory.length > 0) {
      const sanitized = mergedHistory.filter(v => v && typeof v === 'object' && v.id).slice(0, 100);
      setWatchHistory(sanitized);
    }

    setIsRestored(true);

    // Load persisted filter statuses into videoStatusCache
    try {
      const filterStatuses = await loadFilterStatusesFromBackend();
      Object.entries(filterStatuses).forEach(([videoId, status]) => {
        videoStatusCache.set(videoId, status as 'open' | 'blocked');
      });
    } catch (_) {}

    // Load video progress from backend and merge with localStorage
    try {
      const progressMap = await loadVideoProgressFromBackend();
      if (Object.keys(progressMap).length > 0) {
        setVideoProgressMap(progressMap);
      }
    } catch (_) {}

    if (!restored) {
      loadInitialVideos(true);
    } else if (restoredVideosLength === 0) {
      loadInitialVideos(true, true);
    }
  }, [loadInitialVideos]);

  useEffect(() => {
    if (user?.email && user.email !== userEmailRef.current) {
      if (userEmailRef.current !== null) {
        console.log("User changed in effect, clearing state to prevent data mixing");
        clearAllState();
      }
      userEmailRef.current = user.email;
    }
  }, [user?.email, clearAllState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      isFirstLoadRef.current = false;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    restoreState();
    
    // Check backend session first
    verifyBackendSession().then(backendUser => {
      if (backendUser) {
        setUser(backendUser);
        sessionStorage.setItem('youtube_user_v1', JSON.stringify(backendUser));
        localStorage.setItem('youtube_user_v1', JSON.stringify(backendUser));
        if (backendUser.email) {
        }
      } else {
        // Fallback to Supabase
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (session) {
            setUser(session.user);
            sessionStorage.setItem('youtube_user_v1', JSON.stringify(session.user));
            localStorage.setItem('youtube_user_v1', JSON.stringify(session.user));
            if (session.user.email) {
            }
            if (session.provider_token) {
              setAccessToken(session.provider_token);
              sessionStorage.setItem('youtube_access_token_v1', session.provider_token);
              localStorage.setItem('youtube_access_token_v1', session.provider_token);
            }
            // Login to backend to create session
            loginToBackend(session.user);
          } else {
            const savedUser = localStorage.getItem('youtube_user_v1') || sessionStorage.getItem('youtube_user_v1');
            const savedToken = localStorage.getItem('youtube_access_token_v1') || sessionStorage.getItem('youtube_access_token_v1');
            if (savedUser && !user) {
              try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                if (parsedUser.email) {
                }
                if (savedToken) setAccessToken(savedToken);
              } catch (e) {
                console.error('Failed to parse saved user', e);
              }
            }
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const isNewUser = !userEmailRef.current || userEmailRef.current !== session.user.email;
        if (isNewUser) {
          console.log("New user detected in onAuthStateChange, clearing state");
          clearAllState();
          userEmailRef.current = session.user.email || null;
        }
        setUser(session.user);
        sessionStorage.setItem('youtube_user_v1', JSON.stringify(session.user));
        localStorage.setItem('youtube_user_v1', JSON.stringify(session.user));
        if (session.user.email) {
        }
        if (session.provider_token) {
          setAccessToken(session.provider_token);
          sessionStorage.setItem('youtube_access_token_v1', session.provider_token);
          localStorage.setItem('youtube_access_token_v1', session.provider_token);
        }
        // Login to backend to create session
        loginToBackend(session.user);
        if (isNewUser) {
          restoreState();
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        if (event === 'SIGNED_OUT') {
          clearAllState();
          setUser(null);
          setAccessToken(null);
          sessionStorage.removeItem('youtube_user_v1');
          sessionStorage.removeItem('youtube_access_token_v1');
          
          localStorage.removeItem('youtube_user_v1');
          localStorage.removeItem('youtube_access_token_v1');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchRealSubscriptions();
    }
  }, [accessToken]);

  useEffect(() => {
    if (user?.email && isRestored) {
      fetchUserOwnPlaylists();
    }
  }, [user?.email, isRestored]);

  const fetchRealSubscriptions = async () => {
    if (!accessToken && !user?.email) return;

    const savedIds = subscribedChannels.map(c => typeof c.id === 'string' ? c.id : (c.id?.channelId || "")).filter(Boolean);
    const { items, error } = accessToken
      ? await getSubscriptions(accessToken)
      : { items: [], error: null };

    if (!error && items.length > 0) {
      setSubscriptionError(false);
      setSubscribedChannels(items);
      debouncedSetBackendCache(getUserKey('subscribed_channels_v2'), items);
      return;
    }

    if (error) {
      const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
      if (errorStr.includes('"code":401') || errorStr.includes('UNAUTHENTICATED') || errorStr.includes('Invalid Credentials')) {
        setAccessToken(null);
        sessionStorage.removeItem('youtube_access_token_v1');
        localStorage.removeItem('youtube_access_token_v1');
        setSubscriptionError(true);
      } else if (errorStr.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || errorStr.includes('insufficient authentication scopes')) {
        setSubscriptionError(true);
      } else if (errorStr.includes('subscriptionForbidden')) {
        setSubscriptionError(true);
      }
    }

    // Fallback: try to enrich saved channels via RapidAPI
    if (savedIds.length > 0) {
      try {
        const { items: fallbackItems, source } = await getSubscriptionsWithFallback(null, savedIds);
        if (fallbackItems.length > 0) {
          setSubscriptionError(false);
          setSubscribedChannels(fallbackItems);
          debouncedSetBackendCache(getUserKey('subscribed_channels_v2'), fallbackItems);
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (isSearchTriggeredRef.current || isFirstLoadRef.current) {
        if (isSearchTriggeredRef.current && searchQuery.trim().length > 0) {
        } else {
          isSearchTriggeredRef.current = false;
        }
        
        if (isFirstLoadRef.current) {
          isFirstLoadRef.current = false;
        }
        setShowSuggestions(false);
        return;
      }
      
      if (searchQuery === lastQueryUsed) {
        setShowSuggestions(false);
        return;
      }

      if (searchQuery.trim().length > 1) {
        const results = await getSearchSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    setAccessToken(null);
    localStorage.removeItem('youtube_access_token_v1');
    
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      console.log('Signing in with redirect to:', redirectUrl);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      addErrorLog('שגיאה בהתחברות: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await logoutFromBackend();
    await supabase.auth.signOut();
    setAccessToken(null);
    clearAllState();
    setIsProfileOpen(false);
  };

  const fetchVideoChannelDetails = async (channelId: string) => {
    if (!channelId) return;
    
    // Run primary channel details fetch and RapidAPI subscriber fetch IN PARALLEL
    // so the avatar can show as soon as primary returns, without waiting for subscriber count
    const primaryPromise = getChannelDetails(channelId);
    const rapidPromise = fetch(`https://youtube138.p.rapidapi.com/channel/details/?id=${channelId}&hl=iw&gl=IL`, {
      headers: {
        'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
        'x-rapidapi-host': 'youtube138.p.rapidapi.com'
      }
    }).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Wait for primary first - set channel immediately so avatar appears fast
    const details = await primaryPromise;
    if (details) {
      setSelectedVideoChannel(details);
    }
    
    // Now enrich with subscriber count from RapidAPI (don't wait if it's already done)
    try {
      const rapidData = await rapidPromise;
      if (rapidData) {
        const rapidSubs = rapidData?.stats?.subscribers
          || rapidData?.stats?.subscribersText
          || rapidData?.subscriberCount
          || rapidData?.subscriberCountText
          || rapidData?.statistics?.subscriberCount
          || rapidData?.meta?.subscriberCountText
          || rapidData?.subscribers
          || rapidData?.subscribersCount;
        if (rapidSubs && details) {
          if (!details.statistics) details.statistics = {};
          if (!details.stats) details.stats = {};
          details.statistics.subscriberCount = rapidSubs;
          details.stats.subscribers = rapidSubs;
          details.stats.subscribersText = typeof rapidSubs === 'string' ? rapidSubs : String(rapidSubs);
          details.subscriberCount = rapidSubs;
          // Update state with enriched details
          setSelectedVideoChannel({ ...details });
        }
      }
    } catch (e) {
      console.error("RapidAPI channel details fetch error:", e);
    }
    
    // Additional fallback: try alternative RapidAPI endpoint if subscribers still missing
    if (details && !details.statistics?.subscriberCount && !details.stats?.subscribers) {
      try {
        const altRes = await fetch(`https://youtube-v31.p.rapidapi.com/channels?part=statistics&id=${channelId}`, {
          headers: {
            'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
            'x-rapidapi-host': 'youtube-v31.p.rapidapi.com'
          }
        });
        if (altRes.ok) {
          const altData = await altRes.json();
          const altSubs = altData?.items?.[0]?.statistics?.subscriberCount;
          if (altSubs) {
            if (!details.statistics) details.statistics = {};
            if (!details.stats) details.stats = {};
            details.statistics.subscriberCount = altSubs;
            details.stats.subscribers = altSubs;
            details.stats.subscribersText = String(altSubs);
            details.subscriberCount = altSubs;
            setSelectedVideoChannel({ ...details });
          }
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    if (selectedVideo) {
      fetchVideoChannelDetails(selectedVideo.snippet.channelId);
    } else {
      setSelectedVideoChannel(null);
    }
  }, [selectedVideo]);

  const handleSearch = async (e?: React.FormEvent | null, queryOverride?: string, skipPushState = false, filtersOverride?: SearchFilters) => {
    if (e) e.preventDefault();
    
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;
    
    if (!skipPushState) {
      window.history.pushState({ view: 'search', query }, '', `?search=${encodeURIComponent(query)}`);
    }
    
    const searchId = ++activeSearchIdRef.current;
    
    isSearchTriggeredRef.current = true;
    setShowSuggestions(false);
    
    setRecentSearches(prev => {
      const newRecent = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      // Save immediately to localStorage per-user
      if (user?.email) {
        try { localStorage.setItem(getUserKey('recent_searches_local'), JSON.stringify(newRecent)); } catch(_) {}
      }
      return newRecent;
    });
    
    if (user) {
      addUserActivity('searches', query);
    }

    setShowSuggestions(false);
    setSuggestions([]);
    setSearchShorts([]);
    setLoading(true);
    setIsSearchMode(true);
    setIsHistoryView(false);
    setIsSubscriptionsView(false);
    setIsLikedVideosView(false);
    setIsWatchLaterView(false);
    setIsMusicView(false);
    setIsPlaylistsView(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
    setError(null);
    setLastQueryUsed(query);
    setDidYouMean(null);
    setIsFilterOpen(false);
    
    // Check Netfree policy first
    const isAllowed = await checkNetfreePolicy(query);
    if (isAllowed !== true) {
      if (searchId !== activeSearchIdRef.current) return;
      setLoading(false);
      setError({ code: 403, message: `החיפוש נחסם עקב: ${isAllowed}`, reason: 'netfree_blocked' });
      setVideos([]);
      setFoundChannels([]);
      setSearchShorts([]);
      return;
    }
    
    const activeFilters = filtersOverride !== undefined ? filtersOverride : searchFilters;
    
    // Fire all 3 requests in parallel - shorts no longer waits for main results
    const [videoResult, channelResult, shortsInitialResult] = await Promise.all([
      searchVideos(query, true, undefined, activeFilters),
      searchChannels(query),
      searchVideos(`${query} #shorts`, true, undefined, activeFilters)
    ]);
    
    // Show initial shorts immediately from the parallel fetch
    const initialShorts = shortsInitialResult.items.filter(v => isShortVideo(v));
    setSearchShorts(initialShorts);
    setSearchShortsNextPageToken(shortsInitialResult.nextPageToken);
    
    // Fetch more shorts in background only if needed (fewer than 12 from first batch)
    const fetchMoreShortsIfNeeded = async () => {
      if (initialShorts.length >= 12 || !shortsInitialResult.nextPageToken) return;
      try {
        let shorts = [...initialShorts];
        let token = shortsInitialResult.nextPageToken;
        let attempts = 0;
        while (shorts.length < 18 && token && attempts < 2) {
          attempts++;
          const nextResult = await searchVideos(`${query} #shorts`, true, token, activeFilters);
          const newShorts = nextResult.items.filter(v => isShortVideo(v));
          const existingIds = new Set(shorts.map(s => typeof s.id === 'string' ? s.id : s.id?.videoId));
          for (const s of newShorts) {
            const id = typeof s.id === 'string' ? s.id : s.id?.videoId;
            if (!existingIds.has(id)) shorts.push(s);
          }
          token = nextResult.nextPageToken;
        }
        
        setSearchShorts(shorts);
        setSearchShortsNextPageToken(token);
      } catch (err) {
        console.error("Error fetching shorts:", err);
      }
    };
    fetchMoreShortsIfNeeded();
    
    if (searchId !== activeSearchIdRef.current) return;
    
    if (videoResult.error) setError(videoResult.error);
    
    setVideos(videoResult.items);
    setNextPageToken(videoResult.nextPageToken);
    if (videoResult.queryUsed) setLastQueryUsed(videoResult.queryUsed);
    setFoundChannels(channelResult || []);
    const channel = channelResult[0] || null;
    if (channel) {
      setFoundChannel(channel);
      getChannelDetails(channel.id?.channelId || channel.id).then(det => {
        if (det && activeSearchIdRef.current === searchId) {
          setFoundChannel(det);
        }
      }).catch(() => {});
    } else {
      setFoundChannel(null);
    }

    
    // "האם התכוונת ל..." — הצע תיקון אם מעט/אין תוצאות
    if (videoResult.items.length < 3) {
      try {
        const suggs = await getSearchSuggestions(query);
        if (suggs && suggs.length > 0 && suggs[0].toLowerCase() !== query.toLowerCase()) {
          setDidYouMean(suggs[0]);
        }
      } catch (_) {}
    }
    
    setLoading(false);
  };

  const startVoiceSearch = () => {
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotifications(prev => ["הדפדפן שלך לא תומך בחיפוש קולי", ...prev]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setShowVoiceSearchModal(true);
      setVoiceSearchText("מקשיב...");
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setVoiceSearchText(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMsg = "שגיאה בחיפוש קולי";
      if (event.error === 'no-speech') errorMsg = "לא זוהה דיבור. נסה שוב.";
      if (event.error === 'audio-capture') errorMsg = "לא נמצא מיקרופון תקין.";
      if (event.error === 'not-allowed') errorMsg = "הגישה למיקרופון נחסמה.";
      
      addErrorLog(errorMsg, 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
      // Wait a moment for final words to process
      setTimeout(() => {
        setShowVoiceSearchModal(false);
        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          handleSearch(undefined, finalTranscript);
        } else if (voiceSearchText && voiceSearchText !== "מקשיב...") {
          // If we had interim text but no final transcript (sometimes happens on quick inputs)
          setSearchQuery(voiceSearchText);
          handleSearch(undefined, voiceSearchText);
        }
      }, 500);
    };

    recognition.start();
  };

  const handleChannelClick = async (channelIdOrEvent: any, skipPushState = false) => {
    const channelId = (channelIdOrEvent && typeof channelIdOrEvent === 'object' && channelIdOrEvent.target) 
      ? null 
      : (typeof channelIdOrEvent === 'string' ? channelIdOrEvent : null);

    if (!channelId) return;

    // Open the channel directly on YouTube in a new tab
    window.open(`https://www.youtube.com/channel/${channelId}`, '_blank', 'noopener,noreferrer');
  };

  const toggleSubscribe = async (channelToToggle?: any) => {
    
    try {
      const isEvent = channelToToggle && typeof channelToToggle === 'object' && ('target' in channelToToggle || 'nativeEvent' in channelToToggle);
      const actualChannel = isEvent ? null : channelToToggle;
      
      const channel = actualChannel || selectedChannel || selectedVideoChannel;
      if (!channel || !channel.id) return;
      
      const channelIdStr = typeof channel.id === 'string' ? channel.id : (channel.id.channelId || "");
      if (!channelIdStr) return;
      
      const isAlreadySubscribed = subscribedChannels.some(c => {
         const cId = typeof c.id === 'string' ? c.id : (c.id?.channelId || "");
         return cId === channelIdStr;
      });
      
      if (isAlreadySubscribed) {
        setSubscribedChannels(prev => prev.filter(c => {
           const cId = typeof c.id === 'string' ? c.id : (c.id?.channelId || "");
           return cId !== channelIdStr;
        }));
        if (accessToken) {
          await unsubscribeFromChannelOnYouTube(channelIdStr, accessToken);
        }
        // Sync subscription change to backend (best-effort, errors swallowed).
        try {
          const userKey = getUserKey();
          if (userKey) {
            const base = (window as any).__API_BASE__
              || (window as any).BACKEND_URL
              || `${window.location.origin}/api.php`;
            fetch(`${base}?action=track_subscription&user_email=${encodeURIComponent(userKey)}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channelId: channelIdStr,
                channelTitle: channel.snippet?.title || channel.snippet?.channelTitle || '',
                channelThumbnail: channel.snippet?.thumbnails?.default?.url || '',
                subscribed: false,
              }),
            }).catch(() => {});
          }
        } catch (_) {}
      } else {
        const serializableChannel = {
          id: channelIdStr,
          snippet: {
            title: channel.snippet?.title || channel.snippet?.channelTitle || 'ערוץ',
            thumbnails: channel.snippet?.thumbnails || {},
            channelId: channelIdStr,
          },
          statistics: channel.statistics,
          brandingSettings: channel.brandingSettings
        };
        // Update sidebar immediately
        setSubscribedChannels(prev => {
          if (prev.some(c => {
             const cId = typeof c.id === 'string' ? c.id : (c.id?.channelId || "");
             return cId === channelIdStr;
          })) return prev;
          const updated = [serializableChannel, ...prev];
          try { localStorage.setItem(getUserKey('subscribed_channels_v2'), JSON.stringify(updated)); } catch(_) {}
          return updated;
        });
        setNotifications(prev => [`נרשמת לערוץ ${serializableChannel.snippet.title}!`, ...prev]);

        if (accessToken) {
          await subscribeToChannelOnYouTube(channelIdStr, accessToken);
        }
        // Sync subscription change to backend (best-effort, errors swallowed).
        try {
          const userKey = getUserKey();
          if (userKey) {
            const base = (window as any).__API_BASE__
              || (window as any).BACKEND_URL
              || `${window.location.origin}/api.php`;
            fetch(`${base}?action=track_subscription&user_email=${encodeURIComponent(userKey)}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channelId: channelIdStr,
                channelTitle: serializableChannel.snippet.title,
                channelThumbnail: serializableChannel.snippet.thumbnails?.default?.url || '',
                subscribed: true,
              }),
            }).catch(() => {});
          }
        } catch (_) {}
      }
    } catch (error) {
      console.error("Error in toggleSubscribe:", error);
      setNotifications(prev => ["שגיאה בפעולת ההרשמה", ...prev]);
    }
  };

  const toggleBell = () => {
    setIsBellActive(!isBellActive);
    if (!isBellActive) {
      setNotifications(prev => ["התראות הופעלו לערוץ זה", ...prev]);
    }
  };

  const loadSubscriptionsView = async (skipPushState = false) => {
    
    
    if (!skipPushState) {
      window.history.pushState({ view: 'subscriptions' }, '', '/?feed=subscriptions');
    }
    
    setLoading(true);
    setIsSubscriptionsView(true);
    setIsHistoryView(false);
    setIsLikedVideosView(false);
    setIsWatchLaterView(false);
    setIsMusicView(false);
    setIsPlaylistsView(false);
    setIsSearchMode(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
    
    const channelIds = subscribedChannels.map(c => typeof c.id === 'string' ? c.id : (c.id?.channelId || ""));
    const validIds = channelIds.filter(id => typeof id === 'string' && id.length > 0);
    const result = await getVideosFromChannels(validIds, "1");
    setVideos(result.items);
    setNextPageToken(result.nextPageToken);
    setLoading(false);
  };

  const loadHistoryView = (skipPushState = false) => {
    
    
    if (!skipPushState) {
      window.history.pushState({ view: 'history' }, '', '/?feed=history');
    }
    
    setIsHistoryView(true);
    setIsSubscriptionsView(false);
    setIsLikedVideosView(false);
    setIsWatchLaterView(false);
    setIsMusicView(false);
    setIsPlaylistsView(false);
    setIsSearchMode(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
  };

  const loadLikedVideosView = (skipPushState = false) => {
    
    
    if (!skipPushState) {
      window.history.pushState({ view: 'liked' }, '', '/?feed=liked');
    }
    
    setIsLikedVideosView(true);
    setIsHistoryView(false);
    setIsSubscriptionsView(false);
    setIsWatchLaterView(false);
    setIsMusicView(false);
    setIsPlaylistsView(false);
    setIsSearchMode(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
  };

  const loadWatchLaterView = (skipPushState = false) => {
    
    
    if (!skipPushState) {
      window.history.pushState({ view: 'watch_later' }, '', '/?feed=watch_later');
    }
    
    setIsWatchLaterView(true);
    setIsHistoryView(false);
    setIsSubscriptionsView(false);
    setIsLikedVideosView(false);
    setIsMusicView(false);
    setIsPlaylistsView(false);
    setIsSearchMode(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
  };

  const loadMusicView = async (skipPushState = false) => {
    
    if (!skipPushState) {
      window.history.pushState({ view: 'music' }, '', '/?feed=music');
    }
    setLoading(true);
    setIsMusicView(true);
    setIsSubscriptionsView(false);
    setIsHistoryView(false);
    setIsLikedVideosView(false);
    setIsWatchLaterView(false);
    setIsPlaylistsView(false);
    setIsSearchMode(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
    const [result, artists] = await Promise.all([
      getHaredimMusicVideos(),
      musicArtists.length === 0 ? getHaredimArtistChannels() : Promise.resolve(musicArtists),
    ]);
    setVideos(result.items);
    setNextPageToken(result.nextPageToken);
    if (artists.length > 0) setMusicArtists(artists);
    setLoading(false);
  };

  const loadPlaylistsView = (skipPushState = false) => {
    
    if (!skipPushState) {
      window.history.pushState({ view: 'playlists' }, '', '/?feed=playlists');
    }
    setIsPlaylistsView(true);
    setViewingPlaylistId(null);
    setIsMusicView(false);
    setIsHistoryView(false);
    setIsSubscriptionsView(false);
    setIsLikedVideosView(false);
    setIsWatchLaterView(false);
    setIsSearchMode(false);
    setSelectedChannel(null);
    setSelectedVideo(null);
    setIsProfileOpen(false);
    fetchUserOwnPlaylists();
  };

  const handleToggleReport = useCallback((video: YouTubeVideo) => {
    const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || '');
    if (!vId) return;
    setReportVideos(prev => {
      const next = new Map(prev);
      if (next.has(vId)) next.delete(vId);
      else next.set(vId, video);
      return next;
    });
  }, []);

  const handleHomeClick = () => {
    returnToHome(false);
  };

  const isApiKeyMissing = !isApiKeyValid();

  return (
    <>
      <GlobalStyles />
      <div className={`h-screen bg-[var(--background)] flex flex-col overflow-hidden ${isSidebarOpen ? 'overflow-hidden' : ''}`} dir="rtl">
        {/* Loading Progress Bar */}
        <div 
          className="fixed top-0 left-0 h-[3px] bg-red-600 z-[100] transition-all ease-out"
          style={{ 
            width: `${progress}%`, 
            opacity: showProgress ? 1 : 0,
            transitionDuration: (loading || isNavigating) ? '3s' : '0.3s'
          }}
        />
        {/* Main Content Area */}
          <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;900&display=swap');
        body, html, *, *::before, *::after {
          font-family: 'Roboto', 'Arial', sans-serif !important;
        }
        .ytp-pause-overlay,
        .ytp-pause-overlay-container,
        .ytm-pause-overlay,
        .ytmVideoInfoVideoTitleContainer,
        .ytm-video-info,
        .ytm-info-bar,
        .c3-player .ytp-pause-overlay,
        iframe .ytp-pause-overlay { 
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        iframe { background: #000; }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
      {/* Unified Header & Navigation Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 backdrop-blur-xl border-b border-transparent flex flex-col"
        style={{ 
          backgroundColor: darkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)'
        }}
      >
        <header className="flex items-center px-4 h-[72px] w-full shrink-0">
          <div className="flex items-center gap-4 w-[240px] flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--foreground)]"
              title="תפריט"
            >
              <YouTubeMenuIcon size={24} />
            </button>
            <div className="flex items-center cursor-pointer overflow-hidden h-[50px] w-[118px] relative shrink-0" onClick={handleHomeClick}>
              <img 
                src={darkMode ? LOGO_DARK_USER : LOGO_URL} 
                alt="TorahTube Logo" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[110%] max-w-none h-auto pointer-events-none" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = darkMode ? LOGO_DARK_URL : "https://picsum.photos/seed/torah/200/200";
                }}
              />
            </div>
          </div>

          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-[600px] flex items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex relative">
                <div className="flex w-full relative">
                  <input
                    type="text"
                    placeholder="חיפוש"
                    className="w-full pl-12 pr-5 py-[0.85rem] border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-r-full focus:outline-none focus:border-blue-500 text-[1.4rem] md:text-[1.5rem] placeholder:text-[1.4rem] md:placeholder:text-[1.5rem]"
                    value={searchQuery}
                    onChange={(e) => {
                      isSearchTriggeredRef.current = false;
                      setSearchQuery(e.target.value);
                    }}
                    onFocus={() => (searchQuery.trim().length > 1 || recentSearches.length > 0) && !isSearchTriggeredRef.current && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                  />
                  
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setShowSuggestions(false);
                          const input = document.querySelector('input[placeholder="חיפוש"]') as HTMLInputElement;
                          if (input) input.focus();
                        }}
                        className="absolute left-[72px] top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
                        title="מחק חיפוש"
                      >
                        <X size={18} strokeWidth={2} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <button 
                    type="submit"
                    className="px-6 py-[0.85rem] bg-[var(--secondary)] border border-[var(--border)] border-r-0 rounded-l-full hover:bg-[var(--hover)] transition-colors"
                  >
                    <Search size={22} strokeWidth={1.8} className="text-[var(--foreground)]" />
                  </button>
                </div>

                <AnimatePresence>
                  {showSuggestions && (suggestions.length > 0 || (searchQuery.trim() === "" && recentSearches.length > 0)) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-xl z-[100] mt-2 overflow-hidden"
                    >
                      <ul className="py-2">
                        {(searchQuery.trim() === "" ? recentSearches : suggestions).map((suggestion, index) => (
                          <li 
                            key={index}
                            onClick={() => {
                              setSearchQuery(suggestion);
                              setShowSuggestions(false);
                              handleSearch(null, suggestion);
                            }}
                            className="px-4 py-3.5 hover:bg-[var(--secondary)] cursor-pointer flex items-center gap-5 text-[1.65rem] text-[var(--foreground)] group/item"
                          >
                            {searchQuery.trim() === "" ? <History size={22} strokeWidth={1.8} className="text-[var(--foreground)] flex-shrink-0" /> : <Search size={22} strokeWidth={1.8} className="text-[var(--foreground)] flex-shrink-0" />}
                            <span className="font-medium flex-1">{suggestion}</span>
                            {searchQuery.trim() === "" && (
                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const removed = suggestion;
                                  setRecentSearches(prev => {
                                    const updated = prev.filter(s => s !== removed);
                                    try { localStorage.setItem(getUserKey('recent_searches_local'), JSON.stringify(updated)); } catch(_) {}
                                    try { localStorage.setItem(getUserKey('recent_searches_v1'), JSON.stringify(updated)); } catch(_) {}
                                    if (user?.email) {
                                      removeUserActivity('searches', removed);
                                    }
                                    return updated;
                                  });
                                }}
                                className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-[var(--border)] rounded-full transition-all flex-shrink-0"
                                title="הסר מההיסטוריה"
                              >
                                <X size={14} className="text-[var(--muted)]" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
              <button 
                onClick={startVoiceSearch}
                className={`w-[40px] h-[40px] rounded-full transition-all flex items-center justify-center flex-shrink-0 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[var(--secondary)] hover:bg-[var(--secondary)] text-[var(--foreground)]'}`}
                title="חיפוש קולי"
              >
                <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style={{ pointerEvents: "none", display: "block", width: "24px", height: "24px" }} fill="currentColor"><path d="M18.063 14.5a1 1 0 111.73 1A8.998 8.998 0 0113 19.942V22a1 1 0 11-2 0v-2.058A8.999 8.999 0 014.206 15.5l.866-.5.865-.5a7.002 7.002 0 0012.125 0ZM12 1a5 5 0 015 5v5a5 5 0 01-10 0V6a5 5 0 015-5ZM4.572 14.134a1 1 0 011.365.366l-1.731 1a1 1 0 01.366-1.366ZM12 3a3 3 0 00-3 3v5a3 3 0 106 0V6a3 3 0 00-3-3Z"></path></svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-[240px] justify-end flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-full hidden sm:block relative text-[var(--foreground)]"
                >
                  <YouTubeBell size={24} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-[var(--background)]">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-80 bg-[var(--background)] rounded-xl shadow-xl border border-[var(--border)] z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                        <h3 className="font-bold text-[var(--foreground)]">התראות</h3>
                        <button onClick={() => setIsNotificationsOpen(false)} className="text-[var(--foreground)]"><X size={18} strokeWidth={1.8} /></button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif, i) => (
                            <div key={i} className="p-4 hover:bg-[var(--secondary)] border-b border-[var(--border)] last:border-0 flex gap-3 items-start">
                              <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-[var(--foreground)]">{notif}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 flex flex-col items-center justify-center text-[var(--muted)] gap-3">
                            <YouTubeBell size={48} className="opacity-10" />
                            <p className="text-sm font-medium">אין התראות חדשות</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={profileRef}>
                {user ? (
                  <>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--border)] hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      <img 
                        src={user?.user_metadata?.avatar_url || (user?.email ? `https://ui-avatars.com/api/?name=${user.email}` : '')} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 mt-2 w-72 bg-[var(--background)] rounded-xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden"
                        >
                          <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
                            <img 
                              src={user?.user_metadata?.avatar_url || (user?.email ? `https://ui-avatars.com/api/?name=${user.email}` : '')} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full"
                              referrerPolicy="no-referrer"
                            />
                            <div className="overflow-hidden">
                              <p className="font-bold truncate text-base text-[var(--foreground)]">{user?.user_metadata?.full_name || user?.email}</p>
                              <p className="text-sm text-[var(--muted)] truncate">{user?.email}</p>
                              <button className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700">ניהול חשבון Google</button>
                            </div>
                          </div>
                          
                          <div className="py-2 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="border-b border-[var(--border)] pb-2 mb-2">
                              <ProfileMenuItem icon={<YTIconGoogleAccount size={24} />} label="חשבון Google" />
                              <ProfileMenuItem icon={<YTIconData size={24} />} label="הנתונים שלך בכושר טיוב" />
                            </div>
                            
                            <div className="border-b border-[var(--border)] pb-2 mb-2">
                              <ProfileMenuItem 
                                icon={<YTIconAppearance size={24} />} 
                                label={`מראה: ${darkMode ? 'כהה' : 'בהיר'}`} 
                                rightIcon={<YTIconChevronLeft size={24} />} 
                                onClick={() => setDarkMode(!darkMode)}
                              />
                              <ProfileMenuItem 
                                icon={<YTIconLanguage size={24} />} 
                                label={`שפה: ${language}`} 
                                rightIcon={<YTIconChevronLeft size={24} />} 
                                onClick={() => setLanguage(language === 'עברית' ? 'English' : 'עברית')}
                              />
                            </div>
                            
                            <div className="border-b border-[var(--border)] pb-2 mb-2">
                              <ProfileMenuItem icon={<YTIconKeyboard size={24} />} label="קיצורי מקלדת" />
                            </div>
                            
                            <div className="pb-2">
                              <ProfileMenuItem icon={<YTIconHelp size={24} />} label="עזרה" />
                              <ProfileMenuItem icon={<Shield size={24} />} label="מדיניות פרטיות" onClick={() => window.open('/privacy', '_blank')} />
                              <ProfileMenuItem icon={<YTIconFeedback size={24} />} label="שליחת משוב" />
                              <ProfileMenuItem 
                                icon={<YTIconSignOut size={24} />} 
                                label="התנתקות" 
                                onClick={handleSignOut}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <button 
                    onClick={handleSignIn}
                    className="flex items-center gap-2 border border-[var(--border)] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-full font-medium transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center overflow-hidden relative">
                      <div className="w-2h-2 bg-current rounded-full mb-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="w-4 h-2 bg-current border-t-full absolute -bottom-1 left-1/2 transform -translate-x-1/2" style={{ borderRadius: '10px 10px 0 0' }}></div>
                    </div>
                    היכנס
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Categories Bar inside the blurred header */}
        {(!isSearchMode && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isPlaylistsView && !isSubscriptionsView && !selectedChannel && !selectedVideo) && (
          <div 
            className={`w-full flex pb-2 pt-2 overflow-x-auto hide-scrollbar transition-all duration-300 ${isSidebarOpen ? 'pr-[260px]' : 'sm:pr-[72px] pr-0'}`}
          >
            <div className="flex gap-3 pb-1 min-w-max px-4 sm:px-6">
              {[
                { id: 'all', label: 'הכול' },
                { id: 'music', label: 'מוזיקה' },
                { id: 'podcasts', label: 'פודקאסטים' },
                { id: 'mixes', label: 'מיקסים' },
                { id: 'kids', label: 'לילדים' },
                { id: 'live', label: 'שידור חי' },
                { id: 'recent', label: 'הועלו לאחרונה' },
                { id: 'viewed', label: 'נצפו' },
                { id: 'foryou', label: 'חדש בשבילך' }
              ].map((chip) => {
                const isActive = homeCategory === chip.label;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setHomeCategory(chip.label);
                      loadInitialVideos(true, false, false, chip.label);
                    }}
                    className={`whitespace-nowrap px-3 py-0 h-[32px] rounded-[8px] text-[14px] font-medium transition-colors flex-shrink-0 ${
                      isActive 
                        ? 'bg-[var(--foreground)] text-[var(--background)]' 
                        : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Filters Bar inside the blurred header */}
        {isSearchMode && !selectedVideo && (
          <div 
            className={`w-full h-14 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 transition-all duration-300 ${isSidebarOpen ? 'pr-[260px]' : 'sm:pr-[72px] pr-0'}`} 
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center gap-3 px-4 sm:px-6 w-full">
              {[
                { id: 'all', label: 'הכול', filter: {} },
                { id: 'shorts', label: 'Shorts', filter: { type: 'short' } },
                { id: 'unwatched', label: 'לא נצפו', filter: { _fake: 'unwatched' } },
                { id: 'watched', label: 'נצפו', filter: { _fake: 'watched' } },
                { id: 'videos', label: 'סרטונים', filter: { type: 'video' } },
                { id: 'recent', label: 'הועלו לאחרונה', filter: { uploadDate: 'this_week' } },
                { id: 'live', label: 'שידור חי', filter: { features: 'live' } }
              ].map((chip) => {
                const isActive = chip.id === 'all' 
                  ? Object.keys(searchFilters).length === 0 
                  : Object.entries(chip.filter).every(([k, v]) => (searchFilters as any)[k] === v);
                
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setSearchFilters(chip.filter);
                      handleSearch(null, undefined, false, chip.filter);
                    }}
                    className={`whitespace-nowrap px-3 py-0 h-[32px] rounded-[8px] text-[14px] font-medium transition-colors flex-shrink-0 ${
                      isActive 
                        ? 'bg-[var(--foreground)] text-[var(--background)]' 
                        : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
              <button
                onClick={() => { setTempFilters(searchFilters); setIsFilterOpen(true); }}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 h-[32px] rounded-[8px] text-[15px] font-medium transition-all flex-shrink-0 hover:bg-[var(--secondary)] mr-auto`}
              >
                <span className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24" width="32" focusable="false" aria-hidden="true" style={{ pointerEvents: "none", display: "inherit", width: "100%", height: "100%", fill: "currentColor" }}>
                    <path d="M9 3a4 4 0 00-3.874 3H3a1 1 0 000 2h2.126a4.002 4.002 0 007.748 0H21a1 1 0 100-2h-8.126A4 4 0 009 3Zm0 2a2 2 0 110 4 2 2 0 010-4Zm6 8a4 4 0 00-3.874 3H3a1 1 0 000 2h8.126a4.002 4.002 0 007.748 0H21a1 1 0 000-2h-2.126A4 4 0 0015 13Zm0 2a2 2 0 110 4 2 2 0 010-4Z"></path>
                  </svg>
                </span>
                מסננים
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {showVoiceSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/60 flex items-start justify-center pt-16"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-[var(--background)] w-full max-w-2xl mx-4 rounded-3xl shadow-2xl overflow-hidden border border-[var(--border)] relative"
            >
              <button 
                onClick={() => {
                  setShowVoiceSearchModal(false);
                  setIsListening(false);
                  setVoiceSearchText("");
                }}
                className="absolute top-4 left-4 w-10 h-10 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center text-[var(--foreground)] transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 md:p-12 flex flex-col min-h-[300px]">
                <h2 className="text-2xl text-[var(--foreground)] font-medium mb-8">
                  {voiceSearchText === "מקשיב..." ? "מקשיב..." : voiceSearchText}
                </h2>
                
                <div className="mt-auto flex justify-center pb-4">
                  <div className="relative">
                    {/* Pulsing background rings */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 bg-red-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1.5], opacity: [0.5, 0.2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
                      className="absolute inset-0 bg-red-400 rounded-full"
                    />
                    
                    {/* Mic Button */}
                    <button className="relative w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg z-10">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        {/* Backdrop overlay - only when sidebar is open AND watching a regular video (not shorts) */}
        <AnimatePresence>
          {isSidebarOpen && selectedVideo && !activeShortsContext && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 z-[55]"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        {/* Sidebar placeholder - reserves space in flex flow since sidebar is now fixed */}
        <div 
          className={`hidden sm:block flex-shrink-0 transition-all duration-300 ${
            (selectedVideo && !activeShortsContext)
              ? 'w-0'
              : !isSidebarOpen
                ? 'w-[72px]'
                : 'w-[260px]'
          }`} 
        />
        {/* Animated open sidebar in video page - separate component for smooth open/close animation */}
        <AnimatePresence>
          {selectedVideo && !activeShortsContext && isSidebarOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[var(--background)] fixed top-0 right-0 h-full z-[102] w-[260px] border-l border-[var(--border)] overflow-y-auto px-2"
            >
              <div className="flex flex-col gap-0.5 p-3 w-full">
                {/* ─── Header ─── */}
                <div className="flex items-center gap-4 px-2 pt-1 pb-3 mb-1">
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--foreground)]"
                    title="תפריט"
                  >
                    <YouTubeMenuIcon size={24} />
                  </button>
                  <div className="flex items-center cursor-pointer overflow-hidden h-[50px] w-[118px] relative shrink-0" onClick={handleHomeClick}>
                    <img 
                      src={darkMode ? LOGO_DARK_USER : LOGO_URL} 
                      alt="TorahTube Logo" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[110%] max-w-none h-auto pointer-events-none" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = darkMode ? LOGO_DARK_URL : "https://picsum.photos/seed/torah/200/200";
                      }}
                    />
                  </div>
                </div>
                {/* ─── Home ─── */}
                <SidebarItem 
                  icon={<YouTubeHome size={22} active={!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView} />} 
                  label="דף הבית" 
                  active={!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView} 
                  full={true} 
                  onClick={handleHomeClick} 
                />
                <div className="my-2 border-t border-[var(--border)]" />
                {/* ─── Subscriptions ─── */}
                {subscribedChannels.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[16px] font-medium text-[var(--foreground)]">מינויים</span>
                      <ChevronLeft size={18} className="text-[var(--muted)]" />
                    </div>
                    {(showAllSubscriptions ? subscribedChannels : subscribedChannels.slice(0, 7)).map(channel => {
                      const cId = typeof channel.id === 'string' ? channel.id : (channel.id?.channelId || Math.random().toString());
                      return (
                        <button 
                          key={cId}
                          onClick={() => handleChannelClick(cId)}
                          className="flex items-center gap-6 px-3 py-2 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right"
                        >
                          <img 
                            src={channel.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${cId}/200/200`}
                            alt={channel.snippet?.title || "Channel"}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${cId}/200/200`; }}
                          />
                          <span className="text-[14px] truncate flex-1 text-[var(--foreground)]">{channel.snippet?.title || "ערוץ"}</span>
                        </button>
                      );
                    })}
                    {subscribedChannels.length > 7 && (
                      <button 
                        onClick={() => setShowAllSubscriptions(!showAllSubscriptions)}
                        className="flex items-center gap-6 px-3 py-2 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right text-[14px] text-[var(--foreground)]"
                      >
                        <ChevronDown size={20} className={`transition-transform ${showAllSubscriptions ? 'rotate-180' : ''}`} />
                        <span className="text-[14px]">{showAllSubscriptions ? 'הצג פחות' : 'תוצאות נוספות'}</span>
                      </button>
                    )}
                  </div>
                )}
                <div className="my-2 border-t border-[var(--border)]" />
                {/* ─── You section ─── */}
                <div className="flex items-center justify-between px-3 py-1.5 mt-2">
                  <span className="text-[16px] font-medium text-[var(--foreground)]">אתה</span>
                  <ChevronLeft size={18} className="text-[var(--muted)]" />
                </div>
                <SidebarItem icon={<YouTubeHistory size={22} />} label="היסטוריה" active={isHistoryView} full={true} onClick={loadHistoryView} />
                <SidebarItem icon={<YouTubeWatchLater size={22} />} label="לצפייה בהמשך" active={isWatchLaterView} full={true} onClick={loadWatchLaterView} />
                <SidebarItem icon={<YouTubeLiked size={22} />} label="סרטונים שאהבתי" active={isLikedVideosView} full={true} onClick={loadLikedVideosView} />
                <SidebarItem icon={<YouTubePlaylists size={22} />} label="פלייליסטים" active={isPlaylistsView} full={true} onClick={loadPlaylistsView} />
                <div className="my-2 border-t border-[var(--border)]" />
                <div className="px-3 py-2 flex flex-col gap-3">
                  <p className="text-[11px] text-[var(--muted)]">© 2026 כושר טיוב</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      { href: 'https://netfree.link/', src: 'https://netfree.link/img/logo/icon.svg', alt: 'NetFree' },
                      { href: 'https://etrog.net.il/', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREBM76btkb5EkYg1ZrB-krpF1jG3z6viWpTg&s', alt: 'Etrog' },
                      { href: 'https://hadran.net/', src: 'https://i.ibb.co/nsGYngq9/image.png', alt: 'Hadran' },
                      { href: 'https://www.enativ.com/', src: 'https://d3m9l0v76dty0.cloudfront.net/system/photos/17979991/original/dba2e885f6e68cd73f57f137e3fb1afc.png', alt: 'Nativ' },
                    ].map(f => (
                      <a key={f.alt} href={f.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                        <img src={f.src} alt={f.alt} className="h-6 w-auto object-contain" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        {/* Sidebar */}
        {!(selectedVideo && !activeShortsContext) && (
          <aside 
            className={`bg-[var(--background)] flex-shrink-0 fixed right-0 top-[72px] h-[calc(100vh-72px)] z-[101] transition-all duration-300 ${isSidebarOpen ? `w-[260px] border-l border-[var(--border)] overflow-y-auto px-2` : 'w-[72px] hidden sm:flex flex-col items-center pb-2 overflow-visible'}`}
          >
            {isSidebarOpen ? (
            <div className="flex flex-col gap-0.5 p-3 w-full">
              {/* ─── Header (only when sidebar is open in video page) ─── */}
              {selectedVideo && !activeShortsContext && (
                <div className="flex items-center gap-4 px-2 pt-1 pb-3 mb-1">
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--foreground)]"
                    title="תפריט"
                  >
                    <YouTubeMenuIcon size={24} />
                  </button>
                  <div className="flex items-center cursor-pointer overflow-hidden h-[50px] w-[118px] relative shrink-0" onClick={handleHomeClick}>
                    <img 
                      src={darkMode ? LOGO_DARK_USER : LOGO_URL} 
                      alt="TorahTube Logo" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[110%] max-w-none h-auto pointer-events-none" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = darkMode ? LOGO_DARK_URL : "https://picsum.photos/seed/torah/200/200";
                      }}
                    />
                  </div>
                </div>
              )}
              {/* ─── Home ───────────────────────────────────── */}
              <SidebarItem 
                icon={<YouTubeHome size={22} active={!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView} />} 
                label="דף הבית" 
                active={!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView} 
                full={true} 
                onClick={handleHomeClick} 
              />

              <div className="my-2 border-t border-[var(--border)]" />

              {/* ─── Subscriptions ──────────────────────────── */}
              {subscribedChannels.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[16px] font-medium text-[var(--foreground)]">מינויים</span>
                    <ChevronLeft size={18} className="text-[var(--muted)]" />
                  </div>
                  {(showAllSubscriptions ? subscribedChannels : subscribedChannels.slice(0, 7)).map(channel => {
                    const cId = typeof channel.id === 'string' ? channel.id : (channel.id?.channelId || Math.random().toString());
                    return (
                      <button 
                        key={cId}
                        onClick={() => handleChannelClick(cId)}
                        className="flex items-center gap-6 px-3 py-2 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right"
                      >
                        <img 
                          src={channel.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${cId}/200/200`}
                          alt={channel.snippet?.title || "Channel"}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${cId}/200/200`; }}
                        />
                        <span className="text-[14px] truncate flex-1 text-[var(--foreground)]">{channel.snippet?.title || "ערוץ"}</span>
                      </button>
                    );
                  })}
                  {subscribedChannels.length > 7 && (
                    <button 
                      onClick={() => setShowAllSubscriptions(!showAllSubscriptions)}
                      className="flex items-center gap-6 px-3 py-2 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right text-[14px] text-[var(--foreground)]"
                    >
                      <ChevronDown size={20} className={`transition-transform ${showAllSubscriptions ? 'rotate-180' : ''}`} />
                      <span className="text-[14px]">{showAllSubscriptions ? 'הצג פחות' : 'תוצאות נוספות'}</span>
                    </button>
                  )}
                </div>
              )}

              <div className="my-2 border-t border-[var(--border)]" />

              {/* ─── You section ────────────────────────────── */}
              <div className="flex items-center justify-between px-3 py-1.5 mt-2">
                <span className="text-[16px] font-medium text-[var(--foreground)]">אתה</span>
                <ChevronLeft size={18} className="text-[var(--muted)]" />
              </div>
              <SidebarItem icon={<YouTubeHistory size={22} />} label="היסטוריה" active={isHistoryView} full={true} onClick={loadHistoryView} />
              <SidebarItem icon={<YouTubeWatchLater size={22} />} label="לצפייה בהמשך" active={isWatchLaterView} full={true} onClick={loadWatchLaterView} />
              <SidebarItem icon={<YouTubeLiked size={22} />} label="סרטונים שאהבתי" active={isLikedVideosView} full={true} onClick={loadLikedVideosView} />
              <SidebarItem icon={<YouTubePlaylists size={22} />} label="פלייליסטים" active={isPlaylistsView} full={true} onClick={loadPlaylistsView} />

              <>
                  <div className="my-2 border-t border-[var(--border)]" />
                  <div className="px-3 py-2 flex flex-col gap-3">
                    <p className="text-[11px] text-[var(--muted)]">© 2026 כושר טיוב</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {[
                        { href: 'https://netfree.link/', src: 'https://netfree.link/img/logo/icon.svg', alt: 'NetFree' },
                        { href: 'https://etrog.net.il/', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREBM76btkb5EkYg1ZrB-krpF1jG3z6viWpTg&s', alt: 'Etrog' },
                        { href: 'https://hadran.net/', src: 'https://i.ibb.co/nsGYngq9/image.png', alt: 'Hadran' },
                        { href: 'https://www.enativ.com/', src: 'https://d3m9l0v76dty0.cloudfront.net/system/photos/17979991/original/dba2e885f6e68cd73f57f137e3fb1afc.png', alt: 'Nativ' },
                      ].map(f => (
                        <a key={f.alt} href={f.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                          <img src={f.src} alt={f.alt} className="h-6 w-auto object-contain" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-1 px-1">
              {/* Home */}
              <button 
                onClick={handleHomeClick}
                title="דף הבית"
                className={`w-full flex w-16 flex-col items-center justify-center gap-1 py-4 hover:bg-[var(--secondary)] rounded-xl transition-colors ${(!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView) ? 'text-[var(--foreground)]' : 'text-[var(--foreground)] opacity-90 hover:opacity-100'}`}
              >
                <YouTubeHome size={24} active={!isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSearchMode && !isMusicView && !isPlaylistsView} />
                <span className="text-[10px] mt-1 whitespace-nowrap overflow-hidden text-clip w-full text-center">דף הבית</span>
              </button>

              {/* Subscriptions */}
              <div className="relative group/mini w-full">
                <button 
                  onClick={(e) => e.preventDefault()}
                  title="מינויים"
                  className={`w-full flex w-16 flex-col items-center justify-center gap-1 py-4 hover:bg-[var(--secondary)] rounded-xl transition-colors ${isSubscriptionsView ? 'text-[var(--foreground)]' : 'text-[var(--foreground)] opacity-90 hover:opacity-100'}`}
                >
                  <YouTubeSubscriptions size={24} active={isSubscriptionsView} />
                  <span className="text-[10px] mt-1 whitespace-nowrap overflow-hidden text-clip w-full text-center">מינויים</span>
                </button>
                {/* Hover Menu */}
                {subscribedChannels.length > 0 && (
                  <div className="absolute right-full top-0 hidden group-hover/mini:flex min-w-[300px] z-50 mr-2 before:content-[''] before:absolute before:right-[-12px] before:top-0 before:bottom-0 before:w-3">
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl p-2 max-h-[75vh] overflow-y-auto w-full">
                      <div className="text-[18px] font-bold text-[var(--foreground)] px-3 py-3 border-b border-[var(--border)] mb-2">מינויים</div>
                      {subscribedChannels.slice(0, 7).map(channel => (
                        <button 
                          key={channel.id}
                          onClick={() => handleChannelClick(channel.id)}
                          className="flex items-center gap-4 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right"
                        >
                          <img 
                            src={channel.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${channel.id}/200/200`}
                            alt={channel.snippet?.title || "Channel"}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${channel.id}/200/200`; }}
                          />
                          <span className="text-[14px] truncate flex-1 text-[var(--foreground)]">{channel.snippet?.title || "ערוץ"}</span>
                        </button>
                      ))}
                      {subscribedChannels.length > 7 && (
                        <button 
                          onClick={() => { setIsSubscriptionsView(true); setIsHistoryView(false); setIsLikedVideosView(false); setIsWatchLaterView(false); setIsPlaylistsView(false); setIsSearchMode(false); setSelectedChannel(null); setSelectedVideo(null); setIsMusicView(false); }}
                          className="flex items-center gap-4 px-3 py-2.5 mt-1 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right"
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--foreground)] opacity-80">
                            <ChevronDown size={20} />
                          </div>
                          <span className="text-[14px] font-medium truncate flex-1 text-[var(--foreground)]">ראה עוד</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* You */}
              <div className="relative group/mini w-full">
                <button 
                  onClick={(e) => e.preventDefault()}
                  title="אתה"
                  className={`w-full flex w-16 flex-col items-center justify-center gap-1 py-4 hover:bg-[var(--secondary)] rounded-xl transition-colors ${(isHistoryView || isWatchLaterView || isLikedVideosView || isPlaylistsView) ? 'text-[var(--foreground)]' : 'text-[var(--foreground)] opacity-90 hover:opacity-100'}`}
                >
                  <YouTubeYou size={24} active={isHistoryView || isWatchLaterView || isLikedVideosView || isPlaylistsView} />
                  <span className="text-[10px] mt-1 whitespace-nowrap overflow-hidden text-clip w-full text-center">אתה</span>
                </button>
                {/* Hover Menu */}
                <div className="absolute right-full top-0 hidden group-hover/mini:flex min-w-[300px] z-50 mr-2 before:content-[''] before:absolute before:right-[-12px] before:top-0 before:bottom-0 before:w-3">
                  <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl p-2 w-full">
                    <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border)] mb-2 cursor-pointer hover:bg-[var(--secondary)] rounded-t-lg transition-colors" onClick={() => loadHistoryView()}>
                      <span className="text-[18px] font-bold text-[var(--foreground)]">אתה</span>
                      <ChevronLeft size={20} className="text-[var(--foreground)]" />
                    </div>
                    <button onClick={() => loadHistoryView()} className="flex items-center gap-4 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right text-[var(--foreground)]">
                      <YouTubeHistory size={22} />
                      <span className="text-[14px] flex-1">היסטוריה</span>
                    </button>
                    <button onClick={() => loadWatchLaterView()} className="flex items-center gap-4 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right text-[var(--foreground)]">
                      <YouTubeWatchLater size={22} />
                      <span className="text-[14px] flex-1">לצפייה בהמשך</span>
                    </button>
                    <button onClick={() => loadLikedVideosView()} className="flex items-center gap-4 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right text-[var(--foreground)]">
                      <YouTubeLiked size={22} />
                      <span className="text-[14px] flex-1">סרטונים שאהבתי</span>
                    </button>
                    <button onClick={() => loadPlaylistsView()} className="flex items-center gap-4 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors w-full text-right text-[var(--foreground)]">
                      <YouTubePlaylists size={22} />
                      <span className="text-[14px] flex-1">פלייליסטים</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden bg-[var(--background)]">
          {/* WatchView */}
          <main 
            id="watch-view-main"
            dir="ltr"
            className={`absolute inset-0 overflow-x-hidden bg-[var(--background)] transition-opacity duration-300 pt-0 ${activeShortsContext ? 'overflow-hidden' : 'overflow-y-auto'}`} 
            style={{ 
              opacity: selectedVideo ? 1 : 0, 
              pointerEvents: selectedVideo ? 'auto' : 'none',
              visibility: selectedVideo ? 'visible' : 'hidden',
              zIndex: 30 
            }}
          >
            <div dir="rtl">
              <div className="h-[72px] w-full flex-shrink-0 pointer-events-none" />
              {/* Force the WatchView logic inside to be aware of the container */}
            {selectedVideo && (() => {
              // ─── בדיקת שבת/חג — הצגת דף חסימה במקום הנגן ───────────────
              const selVId = typeof selectedVideo.id === 'string' ? selectedVideo.id : (selectedVideo.id?.videoId || "");
              const isShabbatBlocked = shabbatWarning && (
                (typeof shabbatWarning.video.id === 'string' ? shabbatWarning.video.id : (shabbatWarning.video.id?.videoId || "")) === selVId
              );

              if (isShabbatBlocked) {
                return (
                  <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center" dir="rtl">
                    <div className="max-w-md w-full bg-[var(--background)] rounded-2xl border border-amber-300 dark:border-amber-700 shadow-2xl overflow-hidden">
                      <div className="bg-amber-50 dark:bg-amber-900/30 px-6 py-8 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                          <AlertTriangle size={36} className="text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--foreground)]">
                          הסרטון הועלה ב{shabbatWarning.reason}
                        </h1>
                        <p className="text-base text-[var(--muted)] leading-relaxed">
                          סרטון זה הועלה ב<strong className="text-[var(--foreground)]">{shabbatWarning.reason}</strong> ואסור בצפייה על פי ההלכה.
                        </p>
                      </div>

                      {/* תמונה ושם */}
                      <div className="flex items-center gap-3 px-5 py-3 bg-[var(--secondary)]/60 border-t border-[var(--border)]">
                        <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--secondary)]">
                          <img
                            src={selectedVideo.snippet?.thumbnails?.medium?.url || selectedVideo.snippet?.thumbnails?.default?.url || ""}
                            alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-sm font-medium line-clamp-2 text-[var(--foreground)] text-right">{selectedVideo.snippet?.title}</p>
                      </div>

                      {/* כפתורי פעולה */}
                      <div className="px-5 py-5 flex flex-col gap-3">
                        <button
                          onClick={() => {
                            const videoUrl = `https://www.youtube.com/watch?v=${selVId}`;
                            const msg = `אנא בדקו את הסרטון: ${videoUrl}\nחשוב לציין שהסרטון עלה ב${shabbatWarning.reason} ולפי ההלכה אסור לראות אותו אלא אם כן זה צולם שלא לצורך הנאה.`;
                            navigator.clipboard.writeText(msg).catch(() => {});
                            window.open('https://netfree.link/app/#/tickets/new', '_blank', 'noopener');
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
                          העתק הודעה ופתח פנייה לנטפרי
                        </button>
                        <button
                          onClick={() => { setShabbatWarning(null); setSelectedVideo(null); window.history.back(); }}
                          className="w-full px-4 py-2.5 bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-xl font-medium transition-colors text-sm"
                        >
                          חזור לדף הבית
                        </button>
                        <button
                          onClick={() => {
                            setShabbatWarning(null);
                            // פותחים את הוידאו בעקיפת הבדיקה
                            setIsNavigating(true);
                            setActiveShortsContext(null);
                            addUserActivity('history', { ...selectedVideo, _watchedAt: new Date().toISOString() });
                            setWatchHistory(prev => {
                              const filtered = prev.filter(v => { const vId2 = typeof v.id === 'string' ? v.id : (v.id?.videoId || ''); return vId2 !== selVId; });
                              return [{ ...selectedVideo, _watchedAt: new Date().toISOString() } as any, ...filtered].slice(0, 100);
                            });
                            setTimeout(() => setIsNavigating(false), 500);
                          }}
                          className="w-full px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] text-xs transition-colors"
                        >
                          צפה בכל זאת (על אחריותי)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
              <WatchView 
                key={selVId}
                video={selectedVideo}
                channel={selectedVideoChannel}
                onVideoClick={handleVideoSelect}
                onChannelClick={handleChannelClick}
                onLikeToggle={handleLikeToggle}
                onWatchLaterToggle={handleWatchLaterToggle}
                isSubscribed={isSubscribed}
                toggleSubscribe={toggleSubscribe}
                isBellActive={isBellActive}
                toggleBell={toggleBell}
                user={user}
                handleSignIn={handleSignIn}
                watchLater={watchLater}
                likedVideos={likedVideos}
                watchHistory={watchHistory}
                subscribedChannels={subscribedChannels}
                onOpenSaveModal={(v) => {
                  setPlaylistModalVideo(v);
                  setShowPlaylistModal(true);
                  fetchUserOwnPlaylists();
                }}
                playlistContext={activePlaylistContext}
                shortsContext={activeShortsContext}
                onShortsNext={() => {
                  if (activeShortsContext && activeShortsContext.currentIndex < activeShortsContext.shorts.length - 1) {
                    const nextShort = activeShortsContext.shorts[activeShortsContext.currentIndex + 1];
                    handleVideoSelect(nextShort, false, activeShortsContext.shorts);
                  }
                }}
                onShortsPrev={() => {
                  if (activeShortsContext && activeShortsContext.currentIndex > 0) {
                    const prevShort = activeShortsContext.shorts[activeShortsContext.currentIndex - 1];
                    handleVideoSelect(prevShort, false, activeShortsContext.shorts);
                  }
                }}
                onPlaylistVideoSelect={(idx) => {
                  if (!activePlaylistContext) return;
                  handlePlaylistVideoSelect(activePlaylistContext.videos, idx, activePlaylistContext.name, activePlaylistContext.id);
                }}
                onPlaylistNext={handlePlaylistNext}
                savedProgress={videoProgressMap[selVId]}
                onProgressUpdate={(videoId, currentTime, duration) => {
                  setVideoProgressMap(prev => ({ ...prev, [videoId]: { currentTime, duration } }));
                  saveVideoProgress(videoId, currentTime, duration);
                }}
                isDark={darkMode}
              />
              );
            })()}
            </div>
          </main>

          {/* ChannelView */}
          <main 
            id="channel-view-main"
            dir="ltr"
            className="absolute inset-0 overflow-y-auto bg-[var(--background)] transition-opacity duration-300 pt-0" 
            style={{ 
              opacity: !selectedVideo && selectedChannel ? 1 : 0, 
              pointerEvents: !selectedVideo && selectedChannel ? 'auto' : 'none',
              visibility: !selectedVideo && selectedChannel ? 'visible' : 'hidden',
              zIndex: 20 
            }}
          >
            <div dir="rtl">
              <div 
                className={`w-full flex-shrink-0 pointer-events-none transition-all duration-300`} 
                style={{ height: (!isSearchMode && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isPlaylistsView && !isSubscriptionsView && !selectedChannel && !selectedVideo) || isSearchMode ? '128px' : '72px' }} 
              />
            {selectedChannel && (
              <ChannelView 
                channel={selectedChannel} 
                videos={channelVideos} 
                onVideoClick={(v, ctx) => handleVideoSelect(v, false, ctx)}
                onLoadMore={loadMoreChannelVideos}
                loadingMore={loadingMore}
                hasMore={channelNextPageToken}
                lastVideoRef={lastChannelVideoRef}
                isSubscribed={isSubscribed}
                isBellActive={isBellActive}
                setIsBellActive={setIsBellActive}
                toggleSubscribe={toggleSubscribe}
                toggleBell={toggleBell}
                loading={loading}
                isDark={darkMode}
              />
            )}
            </div>
          </main>

          {/* Home/Search View */}
          <main 
            id="home-view-main"
            dir="ltr"
            className="absolute inset-0 overflow-y-auto transition-opacity duration-300 pt-0" 
            style={{ 
              opacity: !selectedVideo && !selectedChannel ? 1 : 0, 
              pointerEvents: !selectedVideo && !selectedChannel ? 'auto' : 'none',
              visibility: !selectedVideo && !selectedChannel ? 'visible' : 'hidden',
              zIndex: 10,
              background: isMusicView ? '#0a0a0a' : 'var(--background)',
            }}
          >
            <div dir="rtl" className="pt-0 px-4 sm:px-6 pb-6">
              <div 
                className={`w-full flex-shrink-0 pointer-events-none transition-all duration-300`} 
                style={{ height: (!isSearchMode && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isPlaylistsView && !isSubscriptionsView && !selectedChannel && !selectedVideo) || isSearchMode ? '128px' : '72px' }} 
              />
              {!loading && videos.length === 0 && !isSearchMode && !isSubscriptionsView && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isPlaylistsView && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6 text-[var(--muted)]">
                    <Search size={64} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">הדף לא נמצא</h2>
                  <p className="text-[var(--muted)] mb-8 max-w-md">
                    מצטערים, לא הצלחנו למצוא את התוכן שחיפשת. נסה לחפש משהו אחר או לחזור לדף הבית.
                  </p>
                  <button 
                    onClick={() => returnToHome()}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-colors"
                  >
                    חזרה לדף הבית
                  </button>
                </div>
              )}

              {isSubscriptionsView && subscriptionError && (
                <div className="mb-8 p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl text-center max-w-2xl mx-auto">
                  <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                    <AlertCircle size={48} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-3">דרושות הרשאות נוספות</h3>
                  <p className="text-red-700 dark:text-red-300 mb-8 leading-relaxed">
                    כדי להציג את רשימת המינויים שלך, עליך להתחבר מחדש ולאשר את הגישה ל-YouTube. 
                    אנא וודא שאתה מסמן את כל תיבות הסימון במסך האישור של Google.
                  </p>
                  <button 
                    onClick={handleSignIn}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <LogOut size={20} className="rotate-180" />
                    התחבר מחדש ועדכן הרשאות
                  </button>
                 </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                  {error.reason === 'netfree_blocked' ? (
                    <>
                      <p className="font-bold mb-1 text-lg">החיפוש נחסם</p>
                      <p className="text-base">{error.message}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold mb-1">שגיאת API ({error.code})</p>
                      <p>{error.message}</p>
                      <button 
                        onClick={() => { setError(null); loadInitialVideos(true); }}
                        className="mt-2 text-xs font-bold underline"
                      >
                        נסה שוב
                      </button>
                    </>
                  )}
                </div>
              )}
              {loading ? (
                <div className="w-full px-4">
                  {(!isSearchMode && !isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isMusicView && !isPlaylistsView && !isSubscriptionsView) ? (
                    <VideoSkeletonGrid count={8} largeMode={!isMusicView} />
                  ) : (
                    <div className="flex justify-center items-center py-20 mt-10">
                      <Loader2 size={40} className="animate-spin text-[var(--muted)]" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full px-4">
                  {/* ─── Search Filter Bar ──────────────────────────────────── */}
                  {isSearchMode && (
                    <div className="hidden">
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {[
                          { id: 'all', label: 'הכול', filter: {} },
                          { id: 'shorts', label: 'Shorts', filter: { type: 'short' } },
                          { id: 'unwatched', label: 'לא נצפו', filter: { _fake: 'unwatched' } },
                          { id: 'watched', label: 'נצפו', filter: { _fake: 'watched' } },
                          { id: 'videos', label: 'סרטונים', filter: { type: 'video' } },
                          { id: 'recent', label: 'הועלו לאחרונה', filter: { uploadDate: 'this_week' } },
                          { id: 'live', label: 'שידור חי', filter: { features: 'live' } }
                        ].map((chip) => {
                          const isActive = chip.id === 'all' 
                            ? Object.keys(searchFilters).length === 0 
                            : Object.entries(chip.filter).every(([k, v]) => (searchFilters as any)[k] === v);
                          
                          return (
                            <button
                              key={chip.id}
                              onClick={() => {
                                setSearchFilters(chip.filter);
                                handleSearch(null, undefined, false, chip.filter);
                              }}
                              className={`whitespace-nowrap px-3 py-0 h-[32px] rounded-[8px] text-[14px] font-medium transition-colors flex-shrink-0 ${
                                isActive 
                                  ? 'bg-[var(--foreground)] text-[var(--background)]' 
                                  : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'
                              }`}
                            >
                              {chip.label}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => { setTempFilters(searchFilters); setIsFilterOpen(true); }}
                          className={`flex items-center justify-center gap-2 px-3 py-1.5 h-[32px] rounded-[8px] text-[15px] font-medium transition-all flex-shrink-0 hover:bg-[var(--secondary)] mr-auto`}
                        >
                          <span className="w-10 h-10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24" width="32" focusable="false" aria-hidden="true" style={{ pointerEvents: "none", display: "inherit", width: "100%", height: "100%", fill: "currentColor" }}>
                              <path d="M9 3a4 4 0 00-3.874 3H3a1 1 0 000 2h2.126a4.002 4.002 0 007.748 0H21a1 1 0 100-2h-8.126A4 4 0 009 3Zm0 2a2 2 0 110 4 2 2 0 010-4Zm6 8a4 4 0 00-3.874 3H3a1 1 0 000 2h8.126a4.002 4.002 0 007.748 0H21a1 1 0 000-2h-2.126A4 4 0 0015 13Zm0 2a2 2 0 110 4 2 2 0 010-4Z"></path>
                            </svg>
                          </span>
                          מסננים
                        </button>
                      </div>
                      <AnimatePresence>
                        {isFilterOpen && (
                          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center p-4 pt-[54px]">
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                              className="bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-2xl border border-[var(--border)] w-full max-w-[902px] max-h-[647px] overflow-y-auto" dir="rtl"
                            >
                              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-[var(--border)]">
                                <h3 className="text-[16px] font-medium text-[var(--foreground)]">מסנני חיפוש</h3>
                                <button onClick={() => { setIsFilterOpen(false); setTempFilters(searchFilters); }} aria-label="ביטול" className="p-2 hover:bg-[var(--secondary)] rounded-full text-[var(--foreground)]"><X size={20}/></button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-4 px-6 py-5">
                                {([
                                  { key: 'type', label: 'סוג', options: [{ v: 'video', l: 'סרטונים' }, { v: 'short', l: 'סרטוני Shorts' }, { v: 'channel', l: 'ערוצים' }, { v: 'playlist', l: 'פלייליסטים' }, { v: 'movie', l: 'סרטים' }]},
                                  { key: 'duration', label: 'משך זמן', options: [{ v: 'short', l: 'פחות מ-3 דקות' }, { v: 'medium', l: '4 עד 20 דקות' }, { v: 'long', l: 'יותר מ-20 דקות' }]},
                                  { key: 'uploadDate', label: 'תאריך העלאה', options: [{ v: 'last_hour', l: 'בשעה האחרונה' }, { v: 'today', l: 'היום' }, { v: 'this_week', l: 'השבוע' }, { v: 'this_month', l: 'החודש' }, { v: 'this_year', l: 'השנה' }]},
                                  { key: 'features', label: 'תכונות', options: [{ v: 'live', l: 'שידור חי' }, { v: '4k', l: '4K' }, { v: 'hd', l: 'HD' }, { v: 'subtitles', l: 'כתוביות/כתוביות סמויות' }, { v: 'creative_commons', l: 'Creative Commons' }, { v: '360', l: '360°' }, { v: 'vr180', l: 'VR180' }, { v: '3d', l: 'תלת ממד' }, { v: 'hdr', l: 'HDR' }, { v: 'location', l: 'מיקום' }, { v: 'purchased', l: 'נרכש' }]},
                                  { key: 'sortBy', label: 'תעדוף לפי', options: [{ v: 'relevance', l: 'רלוונטיות' }, { v: 'view_count', l: 'פופולריות' }, { v: 'upload_date', l: 'תאריך העלאה' }, { v: 'rating', l: 'דירוג' }]},
                                ] as Array<{key: string, label: string, options: Array<{v: string, l: string}>}>).map(({ key, label, options }) => (
                                  <div key={key}>
                                    <h4 className="text-[14px] font-normal text-[var(--muted)] mb-2 pb-2 border-b border-[var(--border)]">{label}</h4>
                                    <div className="flex flex-col">
                                      {options.map(({ v, l }) => {
                                        const isActive = (tempFilters as any)[key] === v;
                                        return (
                                          <button key={v}
                                            onClick={() => { const newF: SearchFilters = { ...tempFilters }; if (isActive) delete (newF as any)[key]; else (newF as any)[key] = v; setTempFilters(newF); }}
                                            className={`text-right text-[14px] py-1.5 transition-colors ${isActive ? 'font-bold text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                                          >{l}</button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="px-6 py-3 border-t border-[var(--border)] flex justify-end gap-3">
                                <button onClick={() => { setTempFilters({}); setSearchFilters({}); setIsFilterOpen(false); handleSearch(null, undefined, false, {}); }} className="px-5 h-9 bg-transparent text-[14px] font-medium text-[var(--foreground)] rounded-full hover:bg-[var(--secondary)] transition-colors">נקה הכל</button>
                                <button onClick={() => { setSearchFilters(tempFilters); setIsFilterOpen(false); handleSearch(null, undefined, false, tempFilters); }} className="px-5 h-9 bg-transparent text-[var(--foreground)] font-bold rounded-full text-[14px] hover:bg-[var(--secondary)] transition-colors">החל סינון</button>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                      {didYouMean && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 mb-4 text-sm text-[var(--muted)]">
                          האם התכוונת ל:{" "}
                          <button onClick={() => { setSearchQuery(didYouMean); setDidYouMean(null); handleSearch(null, didYouMean); }} className="text-blue-500 hover:underline font-medium">{didYouMean}</button>?
                        </motion.div>
                      )}
                    </div>
                  )}
                  {isSubscriptionsView && (
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold mb-2 text-[var(--foreground)]">מינויים</h1>
                      <p className="text-sm text-[var(--muted)]">הסרטונים האחרונים מהערוצים שאתה עוקב אחריהם</p>
                    </div>
                  )}

                  {isLikedVideosView && (
                    <div className="hidden"></div>
                  )}

                  {isWatchLaterView && (
                    <div className="hidden"></div>
                  )}

                  {isMusicView && (
                    <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-8">
                      <div className="bg-gradient-to-b from-[#1a0a2e] via-[#0f0f1a] to-[#0a0a0a] px-4 sm:px-6 pb-8 pt-8 relative overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-96 h-48 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute top-0 right-1/4 w-72 h-48 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="relative z-10 mb-8">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-3xl">🎵</span>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">מוזיקה חרדית</h1>
                          </div>
                          <p className="text-gray-400 text-sm mt-1 mr-14">שירים, ניגונים ומוזיקה מהאמנים הגדולים</p>
                        </div>

                        {musicArtists.length > 0 && (
                          <div className="relative z-10">
                            <h2 className="text-lg font-bold text-white mb-4 opacity-90">זמרים מובילים</h2>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                              {musicArtists.map((artist, i) => (
                                <button
                                  key={artist.id + i}
                                  onClick={() => handleChannelClick(artist.id)}
                                  className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
                                  style={{ minWidth: '100px' }}
                                >
                                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#2a1a4a] shadow-lg ring-2 ring-transparent group-hover:ring-purple-500 transition-all duration-300">
                                    {artist.thumbnail ? (
                                      <img
                                        src={artist.thumbnail}
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/200/200`;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-purple-800 to-blue-900">🎤</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full" />
                                  </div>
                                  <span className="text-white text-xs font-medium text-center line-clamp-2 max-w-[96px] leading-tight group-hover:text-purple-300 transition-colors">
                                    {artist.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {musicArtists.length === 0 && (
                          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0" style={{ minWidth: '100px' }}>
                                <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
                                <div className="w-16 h-3 bg-white/10 rounded animate-pulse" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-[#0a0a0a] px-4 sm:px-6 pt-6 pb-2">
                        <h2 className="text-xl font-bold text-white mb-1">סרטונים ואלבומים</h2>
                        <p className="text-gray-500 text-sm">כל הסרטונים, קונצרטים ואלבומים</p>
                      </div>
                    </div>
                  )}

                  {isPlaylistsView && !viewingPlaylistId && (
                    <div className="mb-8">
                      <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-[var(--foreground)]">פלייליסטים שלי</h1>
                      <p className="text-sm text-[var(--muted)]">הפלייליסטים שלך</p>
                    </div>
                  )}
                  
                  {isSearchMode && foundChannels.length > 0 && searchFilters.type === 'channel' && (
                    <div className="flex flex-col gap-4 mb-8">
                      {foundChannels.map((channel, i) => (
                        <div key={i} className="border-b border-[var(--border)] pb-4">
                          <ChannelCard 
                            channel={channel} 
                            onClick={() => handleChannelClick(channel.id.channelId || channel.id)} 
                            isSubscribed={subscribedChannels.some(c => {
                              const cId = typeof c.id === 'string' ? c.id : (c.id?.channelId || "");
                              const fId = channel.id.channelId || channel.id || "";
                              return cId === fId;
                            })}
                            onSubscribe={(e) => {
                              e.stopPropagation();
                              toggleSubscribe(channel);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Removed single channel display here as requested */}

                  
                  {isPlaylistsView ? (
                    <div className="w-full">
                      {viewingPlaylistId ? (
                        <div>
                          {isLoadingPlaylistVideos ? (
                            <div className="flex justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : viewingPlaylistVideos.length > 0 ? (
                            <div className="flex flex-col lg:flex-row gap-4 w-full">
                              {/* Left panel – playlist info */}
                              <div className="lg:w-[360px] flex-shrink-0">
                                <div className="lg:sticky lg:top-[88px] rounded-2xl overflow-hidden text-white min-h-[calc(100vh-120px)] relative flex flex-col shadow-xl" style={{ backgroundColor: 'rgb(15, 15, 15)' }}>
                                  {/* Blurred background image for dominant color effect */}
                                  {viewingPlaylistVideos[0] && (
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                                      <div 
                                        className="absolute inset-0 bg-cover bg-center blur-[100px] scale-[2.5] opacity-60"
                                        style={{ backgroundImage: `url(${viewingPlaylistVideos[0].snippet?.thumbnails?.high?.url || viewingPlaylistVideos[0].snippet?.thumbnails?.medium?.url || viewingPlaylistVideos[0].snippet?.thumbnails?.default?.url})` }}
                                      />
                                      <div className="absolute inset-0 bg-black/20" />
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f0f]/80 to-[#0f0f0f]" />
                                    </div>
                                  )}
                                  <div className="relative z-10 p-6 flex flex-col h-full">
                                    <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-black/30 shadow-2xl">
                                      {viewingPlaylistVideos[0] && (
                                        <VideoThumbnail video={viewingPlaylistVideos[0]} alt="Playlist cover" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <h2 className="text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                                      {userOwnPlaylists.find((p: any) => p.id === viewingPlaylistId)?.name || 'פלייליסט'}
                                    </h2>
                                    <div className="flex items-center gap-2 mb-1">
                                      {user?.user_metadata?.avatar_url && (
                                        <img src={user?.user_metadata?.avatar_url} alt="User Avatar" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                                      )}
                                      <p className="text-white/90 font-medium text-base">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'משתמש'}</p>
                                    </div>
                                    <p className="text-white/70 text-sm mb-6">
                                      פלייליסט · {viewingPlaylistVideos.length} סרטונים · עודכן היום
                                    </p>
                                    <div className="flex gap-3 mb-6">
                                      <button
                                        onClick={() => {
                                          const pl = userOwnPlaylists.find((p: any) => p.id === viewingPlaylistId);
                                          handlePlaylistVideoSelect(viewingPlaylistVideos, 0, pl?.name || 'פלייליסט', viewingPlaylistId);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-medium py-2.5 rounded-full hover:bg-gray-200 transition-colors"
                                      >
                                        <Play size={20} className="fill-black" />
                                        הפעל הכל
                                      </button>
                                      <button
                                        onClick={() => {
                                          const pl = userOwnPlaylists.find((p: any) => p.id === viewingPlaylistId);
                                          const randomIndex = Math.floor(Math.random() * viewingPlaylistVideos.length);
                                          handlePlaylistVideoSelect(viewingPlaylistVideos, randomIndex, pl?.name || 'פלייליסט', viewingPlaylistId);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-2.5 rounded-full hover:bg-white/20 transition-colors"
                                      >
                                        <Shuffle size={20} />
                                        הפעל באקראי
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                        <Share size={20} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Right panel – video list */}
                              <div className="flex-1 lg:py-4">
                                <div className="flex flex-col gap-1 w-full">
                                  {viewingPlaylistVideos.map((video: YouTubeVideo, idx: number) => {
                                    const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || '');
                                    const pl = userOwnPlaylists.find((p: any) => p.id === viewingPlaylistId);
                                    return (
                                      <div
                                        key={vId + idx}
                                        onClick={() => handlePlaylistVideoSelect(viewingPlaylistVideos, idx, pl?.name || 'פלייליסט', viewingPlaylistId)}
                                        className="flex items-center gap-2 p-3 rounded-xl hover:bg-[var(--secondary)] cursor-pointer group transition-colors w-full"
                                      >
                                        <span className="text-base font-medium text-[var(--muted)] w-6 text-center flex-shrink-0">{idx + 1}</span>
                                        <div className="relative w-56 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-[var(--secondary)]">
                                          <VideoThumbnail video={video} alt={video.snippet?.title} className="w-full h-full object-cover" />
                                          <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[12px] px-1.5 py-0.5 rounded font-medium">{video.snippet.duration}</span>
                                          <VideoFilterStatus videoId={typeof video.id === 'string' ? video.id : (video.id?.videoId || "")} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-3">
                                          <p className="text-lg font-medium line-clamp-2 text-[var(--foreground)] transition-colors">{video.snippet?.title}</p>
                                          <p className="text-sm text-[var(--muted)] mt-1">{video.snippet.channelTitle} • {video.snippet.viewCount ? `${formatCount(video.snippet.viewCount)} צפיות` : ''}</p>
                                        </div>
                                        <button 
                                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[var(--hover)] rounded-full text-[var(--foreground)] transition-all mr-auto flex-shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                        >
                                          <MoreVertical size={20} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-[var(--muted)]">אין סרטונים בפלייליסט זה</div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userOwnPlaylists.map((pl: any) => (
                            <UserPlaylistCard
                              key={pl.id}
                              playlist={pl}
                              onClick={async () => {
                                setViewingPlaylistId(pl.id);
                                if (user?.email) {
                                  setIsLoadingPlaylistVideos(true);
                                  const videos = await getPlaylistVideos(user.email, pl.id);
                                  setViewingPlaylistVideos(videos || []);
                                  setIsLoadingPlaylistVideos(false);
                                } else {
                                  setViewingPlaylistVideos([]);
                                }
                              }}
                              onDelete={async () => {
                                if (!user?.email) return;
                                await deleteUserPlaylist(user.email, pl.id);
                                await fetchUserOwnPlaylists();
                              }}
                              onEdit={() => {
                                setEditPlaylistModal(pl);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : isHistoryView ? (
                    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
                      {/* Main Content */}
                      <div className="flex-1 flex flex-col w-full">
                        <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
                          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)]">היסטוריית צפייה</h1>
                          
                          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mt-2">
                            {['all', 'videos', 'shorts', 'podcasts', 'music'].map((filter) => (
                              <button
                                key={filter}
                                onClick={() => setHistoryFilter(filter as any)}
                                className={`px-5 py-2 rounded-xl text-base font-medium whitespace-nowrap transition-colors ${historyFilter === filter ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)]'}`}
                              >
                                {filter === 'all' ? 'כל' : filter === 'videos' ? 'סרטונים' : filter === 'shorts' ? 'מכנסיים קצרים' : filter === 'podcasts' ? 'פודקאסטים' : 'מוסיקה'}
                              </button>
                            ))}
                          </div>
                          
                          {watchHistory.length > 0 ? (() => {
                            // Group history by date
                            const now = new Date();
                            const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
                            const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate()-1);
                            const dayBeforeStart = new Date(todayStart); dayBeforeStart.setDate(dayBeforeStart.getDate()-2);
                            const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate()-7);

                            const dateGroups: { label: string; videos: (YouTubeVideo & { _watchedAt?: string })[] }[] = [
                              { label: 'היום', videos: [] },
                              { label: 'אתמול', videos: [] },
                              { label: 'שלשום', videos: [] },
                              { label: 'השבוע', videos: [] },
                              { label: 'ישן יותר', videos: [] },
                            ];

                            (watchHistory as (YouTubeVideo & { _watchedAt?: string })[]).forEach(video => {
                              const wt = video._watchedAt ? new Date(video._watchedAt) : null;
                              if (!wt || isNaN(wt.getTime())) { dateGroups[0].videos.push(video); return; }
                              if (wt >= todayStart) dateGroups[0].videos.push(video);
                              else if (wt >= yesterdayStart) dateGroups[1].videos.push(video);
                              else if (wt >= dayBeforeStart) dateGroups[2].videos.push(video);
                              else if (wt >= weekStart) dateGroups[3].videos.push(video);
                              else dateGroups[4].videos.push(video);
                            });

                            const activeGroups = dateGroups.filter(g => g.videos.length > 0);

                            const filterVideos = (videos: YouTubeVideo[]) => videos.filter(v => {
                              if (historySearchQuery && !v.snippet.title.toLowerCase().includes(historySearchQuery.toLowerCase())) return false;
                              if (historyFilter === 'all') return true;
                              if (historyFilter === 'shorts') return isShortVideo(v);
                              if (historyFilter === 'videos') return !isShortVideo(v);
                              if (historyFilter === 'podcasts') return !isShortVideo(v) && (v.snippet.title.includes('פודקאסט') || (v.snippet.duration && v.snippet.duration.includes(':') && v.snippet.duration.split(':').length >= 2 && parseInt(v.snippet.duration.split(':')[0]) > 20));
                              if (historyFilter === 'music') return !isShortVideo(v) && (v.snippet.title.includes('שיר') || v.snippet.title.includes('קליפ') || v.snippet.title.includes('music'));
                              return true;
                            });

                            return (
                              <div className="flex flex-col gap-10">
                                {activeGroups.map((group, gi) => {
                                  const filteredVideos = filterVideos(group.videos);
                                  if (filteredVideos.length === 0) return null;
                                  const shorts = filteredVideos.filter(v => isShortVideo(v));
                                  const regulars = filteredVideos.filter(v => !isShortVideo(v));
                                  return (
                                    <div key={group.label + gi} className="flex flex-col gap-6">
                                      <h2 className="text-xl font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2">{group.label}</h2>

                                      {(historyFilter === 'all' || historyFilter === 'shorts') && shorts.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-2 mb-4">
                                            <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" focusable="false" aria-hidden="true" style={{ pointerEvents: 'none', display: 'inherit', width: '100%', height: '100%' }}>
                                                <path d="m19.45,3.88c1.12,1.82.48,4.15-1.42,5.22l-1.32.74.94.41c1.36.58,2.27,1.85,2.35,3.27.08,1.43-.68,2.77-1.97,3.49l-8,4.47c-1.91,1.06-4.35.46-5.48-1.35-1.12-1.82-.48-4.15,1.42-5.22l1.33-.74-.94-.41c-1.36-.58-2.27-1.85-2.35-3.27-.08-1.43.68-2.77,1.97-3.49l8-4.47c1.91-1.06,4.35-.46,5.48,1.35Z" fill="#f03"></path>
                                                <path d="m10,15l5-3-5-3v6Z" fill="#fff"></path>
                                              </svg>
                                            </span>
                                            <h2 className="text-[20px] font-bold text-[var(--foreground)]">Shorts</h2>
                                          </div>
                                          <div className="relative group/sc">
                                            <button onClick={() => { const c = document.getElementById(`hs-${gi}`); if (c) c.scrollBy({ left: 600, behavior: 'smooth' }); }} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--background)] border border-[var(--border)] shadow-md hover:bg-[var(--secondary)] text-[var(--foreground)] p-2 rounded-full opacity-0 group-hover/sc:opacity-100 transition-opacity translate-x-1/2">
                                              <ChevronRight size={20} />
                                            </button>
                                            <div id={`hs-${gi}`} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-4" style={{ scrollBehavior: 'smooth' }}>
                                              {shorts.map((video, index) => {
                                                const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                                                if (!vId) return null;
                                                return (
                                                  <div key={vId + index} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] flex-shrink-0 snap-start">
                                                    <ShortCard video={video} onClick={() => handleVideoSelect(video, false, shorts)} onChannelClick={() => handleChannelClick(video.snippet.channelId)} videoProgress={videoProgressMap[vId]} contextType="history_shorts" />
                                                  </div>
                                                );
                                              })}
                                            </div>
                                            <button onClick={() => { const c = document.getElementById(`hs-${gi}`); if (c) c.scrollBy({ left: -600, behavior: 'smooth' }); }} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--background)] border border-[var(--border)] shadow-md hover:bg-[var(--secondary)] text-[var(--foreground)] p-2 rounded-full opacity-0 group-hover/sc:opacity-100 transition-opacity -translate-x-1/2">
                                              <ChevronLeft size={20} />
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {historyFilter !== 'shorts' && regulars.length > 0 && (
                                        <div className="flex flex-col gap-4 w-full">
                                          {regulars.map((video, index) => {
                                            const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                                            if (!vId) return null;
                                            return (
                                              <div key={vId + index} className="w-full relative group/hitem">
                                                <SearchVideoCard video={video} onClick={() => handleVideoSelect(video)} onChannelClick={() => handleChannelClick(video.snippet.channelId)} videoProgress={videoProgressMap[vId]} contextType="history_reg" />
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); setWatchHistory(prev => prev.filter(v => { const id = typeof v.id === 'string' ? v.id : (v.id?.videoId || ''); return id !== vId; })); removeUserActivity('history', vId); }}
                                                  className="absolute top-2 left-2 opacity-0 group-hover/hitem:opacity-100 p-1 hover:bg-[var(--border)] rounded-full transition-all"
                                                  title="הסר מההיסטוריה"
                                                >
                                                  <X size={14} className="text-[var(--muted)]" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })() : (
                            <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                              <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
                              <p className="text-lg font-medium mb-2">היסטוריית הצפייה שלך ריקה</p>
                              <button 
                                onClick={loadInitialVideos}
                                className="mt-4 text-blue-600 hover:underline font-medium"
                              >
                                חזור לדף הבית כדי למצוא ערוצים מעניינים
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sidebar - Right Side */}
                      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 pt-2">
                        {/* Search Bar */}
                        <div className="mb-4 relative border-b border-[var(--foreground)] pb-3 flex items-center w-full">
                          <input 
                            type="text" 
                            placeholder="חיפוש בהיסטוריית הצפייה" 
                            value={historySearchInput}
                            onChange={(e) => setHistorySearchInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setHistorySearchQuery(historySearchInput);
                              }
                            }}
                            className="w-full bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none text-lg" 
                          />
                          <button onClick={() => setHistorySearchQuery(historySearchInput)}>
                            <Search size={22} className="text-[var(--foreground)] mr-2 cursor-pointer" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => {
                              if (window.confirm('האם אתה בטוח שברצונך לנקות את כל היסטוריית הצפייה?')) {
                                setWatchHistory([]);
                              }
                            }}
                            className="flex items-center gap-3 text-[var(--foreground)] hover:bg-[var(--secondary)] px-4 py-3 rounded-full transition-colors"
                          >
                            <Trash2 size={20} strokeWidth={1.5} />
                            <span className="text-base font-medium">נקה את כל היסטוריית הצפייה</span>
                          </button>
                          <button className="flex items-center gap-3 text-[var(--foreground)] hover:bg-[var(--secondary)] px-4 py-3 rounded-full transition-colors">
                            <Pause size={20} strokeWidth={1.5} />
                            <span className="text-base font-medium">השהיית היסטוריית הצפייה</span>
                          </button>
                          <button className="flex items-center gap-3 text-[var(--foreground)] hover:bg-[var(--secondary)] px-4 py-3 rounded-full transition-colors">
                            <Settings size={20} strokeWidth={1.5} />
                            <span className="text-base font-medium">ניהול כל ההיסטוריה</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (videos.length > 0 || (isLikedVideosView && likedVideos.length > 0) || (isWatchLaterView && watchLater.length > 0)) ? (
                    <>
                      {(!isSearchMode && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isPlaylistsView && !isSubscriptionsView) ? (
                        <div className="flex flex-col gap-8">
                          {(() => {
                            const regularVideos = videos.filter(v => !isShortVideo(v));
                            // Split regular videos: first 3, then next 3, then the rest
                            const reg1 = regularVideos.slice(0, 3);
                            const reg2 = regularVideos.slice(3, 6);
                            const regRest = regularVideos.slice(6);
                            // Shorts: first 8, then next 8 (max 2 rows, no more after that)
                            const shorts1 = homeShorts.slice(0, 5);
                            const shorts2 = rabbiShorts.slice(0, 5);

                            const renderRegularRow = (vids: typeof regularVideos, keyPrefix: string) => (
                              vids.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5 gap-y-8">
                                  {vids.map((video, index) => {
                                    const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                                    if (!vId) return null;
                                    return (
                                      <VideoCard key={keyPrefix + vId + index} video={video} onClick={() => handleVideoSelect(video)} onChannelClick={() => handleChannelClick(video.snippet.channelId)} videoProgress={videoProgressMap[vId]} onToggleReport={handleToggleReport} isReportSelected={reportVideos.has(vId)} largeMode={true} />
                                    );
                                  })}
                                </div>
                              ) : null
                            );

                            const renderShortsRow = (vids: typeof homeShorts, rowId: string, fullContext: typeof homeShorts) => (
                              vids.length > 0 ? (
                                <div className="w-full my-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" focusable="false" aria-hidden="true" style={{ pointerEvents: 'none', display: 'inherit', width: '100%', height: '100%' }}>
                                        <path d="m19.45,3.88c1.12,1.82.48,4.15-1.42,5.22l-1.32.74.94.41c1.36.58,2.27,1.85,2.35,3.27.08,1.43-.68,2.77-1.97,3.49l-8,4.47c-1.91,1.06-4.35.46-5.48-1.35-1.12-1.82-.48-4.15,1.42-5.22l1.33-.74-.94-.41c-1.36-.58-2.27-1.85-2.35-3.27-.08-1.43.68-2.77,1.97-3.49l8-4.47c1.91-1.06,4.35-.46,5.48,1.35Z" fill="#f03"></path>
                                        <path d="m10,15l5-3-5-3v6Z" fill="#fff"></path>
                                      </svg>
                                    </span>
                                    <h2 className="text-[20px] font-bold text-[var(--foreground)]">Shorts</h2>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-2 gap-y-4">
                                    {vids.map((video, idx) => {
                                      const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                                      if (!vId) return null;
                                      return (
                                        <div key={rowId + vId + idx} className="w-full">
                                          <ShortCard video={video} onClick={() => handleVideoSelect(video, false, fullContext)} onChannelClick={() => handleChannelClick(video.snippet.channelId)} videoProgress={videoProgressMap[vId]} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : null
                            );

                            return (
                              <>
                                {/* Row 1: 4 regular videos */}
                                {renderRegularRow(reg1, 'reg1-')}
                                {/* Row 2: up to 4 shorts (large, 9/16) */}
                                {renderShortsRow(shorts1, 'sh1-', homeShorts)}
                                {/* Row 3: next 4 regular videos */}
                                {renderRegularRow(reg2, 'reg2-')}
                                {/* Row 4: up to 4 more shorts */}
                                {renderShortsRow(shorts2, 'sh2-', rabbiShorts)}
                                {/* Remaining regular videos — no more shorts */}
                                {renderRegularRow(regRest, 'regrest-')}
                              </>
                            );
                          })()}
                        </div>
                      ) : (isLikedVideosView || isWatchLaterView) ? (
                        <div className="flex flex-col lg:flex-row gap-6 max-w-[2000px] mx-auto w-full items-start lg:items-start relative px-2">
                          {(() => {
                            const vids = isLikedVideosView ? likedVideos : watchLater;
                            const firstVideo = vids[0] || {} as any;
                            const thumbnailUrl = firstVideo?.snippet?.thumbnails?.high?.url || firstVideo?.snippet?.thumbnails?.medium?.url || firstVideo?.snippet?.thumbnails?.default?.url;
                            const title = isLikedVideosView ? "סרטונים שאהבתי" : "לצפייה בהמשך";
                            const dateStr = isLikedVideosView ? "עודכן לפני יומיים" : "עודכן לפני 5 ימים";
                            
                            return (
                                <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 lg:self-start lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] overflow-hidden rounded-[24px] shadow-xl flex flex-col" style={{ backgroundColor: '#0f0f0f', alignSelf: 'flex-start' }}>
                                  {thumbnailUrl && (
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px] z-0">
                                      <div 
                                        className="absolute inset-0 bg-cover bg-center blur-[80px] scale-[2.5] opacity-60"
                                        style={{ backgroundImage: `url(${thumbnailUrl})` }}
                                      />
                                      <div className="absolute inset-0 bg-black/20" />
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0f0f0f] to-90%" />
                                    </div>
                                  )}
                                  <div className="relative z-10 p-6 sm:p-8 flex flex-col text-center text-white flex-1 min-h-[450px]">
                                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-2xl relative bg-black/40 flex items-center justify-center">
                                      {thumbnailUrl && (
                                        <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      )}
                                    </div>
                                    
                                    <div className="mb-4">
                                      <img 
                                          src={isLikedVideosView ? "https://i.ibb.co/PGV8K8yC/2026-05-03-214925.png" : "https://i.ibb.co/GfSsfJ4g/2026-05-03-215252.png"}
                                          alt={title}
                                          className="w-[200px] sm:w-[240px] max-w-full object-contain drop-shadow-md mx-auto"
                                          draggable="false"
                                      />
                                    </div>
                                    <div className="font-bold text-[14px] sm:text-[15px] mb-3 text-white/95 drop-shadow-sm text-center px-2" style={{ fontFamily: "'YouTube Sans', sans-serif" }}>
                                      מאגר הסרטונים המסוננים SAFENET
                                    </div>
                                  <div className="text-white/80 text-[13px] mb-6 flex flex-wrap items-center justify-center gap-1.5 font-medium px-2">
                                    <span>{vids.length} סרטונים</span>
                                    <span>אין צפיות</span>
                                    <span>{dateStr}</span>
                                  </div>
                                  
                                  <div className="flex w-full justify-center items-center mt-2 mb-6 px-2">
                                     <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{pointerEvents: 'none', display: 'inherit', width: '24px', height: '24px', fill: 'currentColor'}}><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
                                     </button>
                                  </div>

                                  <div className="flex gap-2 w-full mt-auto mb-2 px-2">
                                    <button className="flex-1 min-w-0 flex items-center justify-center gap-2 bg-white text-black font-medium py-2 rounded-full hover:bg-gray-200 transition-colors shadow-md text-[14px]">
                                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{pointerEvents: 'none', display: 'inherit', width: '24px', height: '24px', fill: 'currentColor', flexShrink: 0}}><path d="M5 4.623V19.38a1.5 1.5 0 002.26 1.29L22 12 7.26 3.33A1.5 1.5 0 005 4.623Z"></path></svg>
                                      <span className="truncate min-w-0 max-w-[110px]">להפעלת כל הסרטונים</span>
                                    </button>
                                    <button className="flex-1 min-w-0 flex items-center justify-center gap-2 bg-white/20 text-white font-medium py-2 rounded-full hover:bg-white/30 transition-colors text-[14px]">
                                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{pointerEvents: 'none', display: 'inherit', width: '24px', height: '24px', fill: 'currentColor', flexShrink: 0}}><path d="M16.293 1.293a1 1 0 00-.001 1.415L18.585 5H17.21a7 7 0 00-5.823 3.118L6.95 14.774A5 5 0 012.79 17H2a1 1 0 000 2h.79a7 7 0 005.822-3.117l4.438-6.656A5 5 0 0117.21 7h1.376l-2.293 2.293a1 1 0 001.414 1.414L22.414 6l-4.707-4.707a1 1 0 00-1.414 0ZM2.789 5H2a1 1 0 000 2h.79a5 5 0 014.159 2.227l.647.97 1.202-1.802-.185-.277A7 7 0 002.789 5Zm13.504 8.293a1 1 0 00-.001 1.414L18.585 17H17.21a5 5 0 01-4.16-2.226l-.648-.972-1.202 1.803.186.278A7 7 0 0017.21 19h1.376l-2.293 2.294-.068.076a1 1 0 001.406 1.406l.076-.07L22.414 18l-4.707-4.707a1 1 0 00-1.414 0Z"></path></svg>
                                      <span className="truncate min-w-0">הפעלה אקראית</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Videos list */}
                          <div className="flex-1 flex flex-col w-full">
                             {isLikedVideosView && (
                               <div className="flex flex-col w-full mb-6 pr-[12px] sm:pr-[48px]">
                                 {showHiddenVideosBar && (
                                   <div className="bg-[var(--secondary)] rounded-lg py-5 px-4 flex justify-between items-center w-full mb-4">
                                     <span className="text-[var(--foreground)] text-[14px] font-medium">סרטונים שלא זמינים מוסתרים</span>
                                     <X size={20} onClick={() => setShowHiddenVideosBar(false)} className="text-[var(--foreground)] cursor-pointer hover:opacity-70 transition-opacity" />
                                   </div>
                                 )}
                                 <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                                   <button onClick={() => setLikedVideosFilter('all')} className={`px-3 py-1.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-colors ${likedVideosFilter === 'all' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>הכול</button>
                                   <button onClick={() => setLikedVideosFilter('videos')} className={`px-3 py-1.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-colors ${likedVideosFilter === 'videos' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>סרטונים</button>
                                   <button onClick={() => setLikedVideosFilter('shorts')} className={`px-3 py-1.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-colors ${likedVideosFilter === 'shorts' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>סרטוני Shorts</button>
                                 </div>
                               </div>
                             )}
                             {(isLikedVideosView ? likedVideos : watchLater).filter(video => {
                                if (likedVideosFilter === 'all') return true;
                                if (likedVideosFilter === 'shorts') return isShortVideo(video);
                                if (likedVideosFilter === 'videos') return !isShortVideo(video);
                                return true;
                             }).map((video, index) => {
                                const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                                if (!vId) return null;
                                return (
                                  <div key={vId + index} className="flex flex-row items-center gap-2 w-full group/plitem relative rounded-xl hover:bg-[var(--secondary)] transition-colors p-2">
                                      <div className="relative w-6 flex-shrink-0 flex items-center justify-center h-full">
                                        <span className="text-[14px] font-medium text-[var(--muted)] group-hover/plitem:opacity-0 transition-opacity absolute">{index + 1}</span>
                                        <button className="text-[var(--foreground)] opacity-0 group-hover/plitem:opacity-100 transition-opacity absolute">
                                          <Play size={14} className="fill-current" />
                                        </button>
                                      </div>
                                      <div className="flex-1 min-w-0 pr-2 relative">
                                        <SearchVideoCard 
                                          video={video} 
                                          onClick={() => handleVideoSelect(video)}
                                          onChannelClick={() => handleChannelClick(video.snippet.channelId)}
                                          videoProgress={videoProgressMap[vId]}
                                          compact={true}
                                          contextType={isLikedVideosView ? 'liked' : 'watch_later'}
                                        />
                                      </div>
                                  </div>
                                );
                             })}
                           </div>
                        </div>
                      ) : (
                        <div className={
                          isSearchMode 
                            ? "flex flex-col gap-4 max-w-[1600px] mx-auto w-full" 
                            : isMusicView 
                              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-3 gap-y-8"
                              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-12"
                        }>
                          {isSearchMode ? renderSearchResults() : (isMusicView ? videos : videos).map((video, index) => {
                            const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                            if (!vId) return null;
                            
                            return (
                              <div 
                                key={vId + index} 
                                className="w-full"
                              >
                                {isMusicView ? (
                                  <MusicVideoCard
                                    video={video}
                                    onClick={() => handleVideoSelect(video)}
                                    onChannelClick={() => handleChannelClick(video.snippet.channelId)}
                                  />
                                ) : (
                                  <VideoCard 
                                    video={video} 
                                    onClick={() => handleVideoSelect(video)}
                                    onChannelClick={() => handleChannelClick(video.snippet.channelId)}
                                    videoProgress={videoProgressMap[vId]}
                                    largeMode={!isSearchMode && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isSubscriptionsView && !isHistoryView && !selectedChannel}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {!loading && !error && nextPageToken && !isHistoryView && (
                        <div ref={lastVideoElementRef} className="w-full flex items-center justify-center mt-2">
                          {loadingMore && (
                            (!isSearchMode && !isLikedVideosView && !isWatchLaterView && !isMusicView && !isSubscriptionsView && !isHistoryView && !selectedChannel && !isPlaylistsView) ? (
                              <VideoSkeletonGrid count={6} largeMode={true} />
                            ) : !isSearchMode ? (
                              <div className="flex items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                      {isHistoryView ? <History size={48} strokeWidth={1} className={`mb-4 opacity-20 ${isMusicView ? 'text-purple-300' : ''}`} /> : <PlaySquare size={48} strokeWidth={1} className={`mb-4 opacity-20 ${isMusicView ? 'text-purple-300' : ''}`} />}
                      <p className="text-lg font-medium mb-2">
                        {isHistoryView 
                          ? 'היסטוריית הצפייה שלך ריקה'
                          : isSubscriptionsView 
                            ? (subscribedChannels.length === 0 ? 'עדיין לא נרשמת לערוצים' : 'טוען סרטוני מינויים...') 
                            : isLikedVideosView
                              ? 'עדיין לא סימנת סרטונים בלייק'
                              : isMusicView
                                ? 'לא נמצאה מוזיקה חרדית כרגע'
                            : isWatchLaterView
                                ? 'רשימת הצפייה בהמשך שלך ריקה'
                                : error?.reason === 'quotaExceeded' 
                                  ? 'מכסת החיפושים היומית של YouTube הסתיימה' 
                                  : 'לא נמצאו סרטונים להצגה'}
                      </p>
                      {(isSubscriptionsView || isHistoryView || isLikedVideosView || isWatchLaterView || isMusicView) ? (
                        <button 
                          onClick={loadInitialVideos}
                          className="mt-4 text-blue-600 hover:underline font-medium"
                        >
                          חזור לדף הבית כדי למצוא ערוצים מעניינים
                        </button>
                      ) : error?.reason === 'quotaExceeded' ? (
                        <p className="text-sm max-w-md text-center">
                          מפתח ה-API של YouTube הגיע למגבלה שלו. המכסה מתאפסת בכל יום בחצות (שעון ארה"ב). אנא נסה שוב מחר או השתמש במפתח API אחר.
                        </p>
                      ) : (
                        <button 
                          onClick={() => loadInitialVideos(true)}
                          className="mt-4 text-blue-600 hover:underline font-medium"
                        >
                          נסה לרענן את הדף
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <LogViewer isOpen={isLogViewerOpen} onToggle={() => setIsLogViewerOpen(!isLogViewerOpen)} isSidebarOpen={isSidebarOpen} />
      {showPlaylistModal && playlistModalVideo && (
        <PlaylistSaveModal
          video={playlistModalVideo}
          playlists={userOwnPlaylists}
          userEmail={user?.email || undefined}
          isInWatchLater={watchLater.some(v => {
            const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
            const mId = typeof playlistModalVideo.id === 'string' ? playlistModalVideo.id : (playlistModalVideo.id?.videoId || '');
            return vId === mId;
          })}
          onClose={() => setShowPlaylistModal(false)}
          onWatchLater={(video, isAdded) => { 
            handleWatchLaterToggle(video, isAdded);
            showAppSaveToast(isAdded ? 'נשמר ל"צפייה בהמשך"' : 'הוסר מ"צפייה בהמשך"');
          }}
          onAddToPlaylist={async (video, playlistId) => {
            if (!user?.email) return;
            // Optimistic count update
            setUserOwnPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, videoCount: (p.videoCount || 0) + 1 } : p));
            await addVideoToUserPlaylist(user.email, playlistId, video);
            setTimeout(() => fetchUserOwnPlaylists(), 2000);
            const pl = userOwnPlaylists.find((p: any) => p.id === playlistId);
            showAppSaveToast(pl ? `נשמר לפלייליסט "${pl.name}"` : 'נשמר לפלייליסט');
          }}
          onRemoveFromPlaylist={async (video, playlistId) => {
            if (!user?.email) return;
            const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || '');
            await removeVideoFromUserPlaylist(user.email, playlistId, videoId);
            await fetchUserOwnPlaylists();
          }}
          onCreatePlaylist={async (video, name) => {
            if (!user?.email) return;
            const result = await createUserPlaylist(user.email, name);
            if (result?.id) {
              // Optimistic update to prevent disappearing while waiting for backend
              const newPl = {
                id: result.id,
                name,
                createdAt: new Date().toISOString(),
                videoCount: 1,
                thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url
              };
              setUserOwnPlaylists(prev => {
                if (prev.some(p => p.id === result.id)) return prev;
                return [newPl, ...prev];
              });
              
              await addVideoToUserPlaylist(user.email, result.id, video);
              // Delay/skip re-fetch to avoid blanking out if backend has challenge
              setTimeout(() => fetchUserOwnPlaylists(), 2000); 
              
              showAppSaveToast(`נשמר לפלייליסט "${name}"`);
              return result.id;
            }
          }}
          onDeletePlaylist={async (playlistId) => {
            if (!user?.email) return;
            await deleteUserPlaylist(user.email, playlistId);
            await fetchUserOwnPlaylists();
          }}
        />
      )}
      {/* Global Save Toast */}
      <AnimatePresence>
        {appSaveToast.visible && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-6 left-6 z-[9999] bg-[#282828] text-white text-sm font-medium pl-2 pr-4 py-1.5 rounded-lg shadow-2xl flex items-center gap-4 min-w-[280px]"
            dir="rtl"
          >
            <div className="flex items-center gap-3 flex-1">
              <Check size={18} className="text-white" />
              <span>{appSaveToast.message}</span>
            </div>
            <button 
              onClick={() => {
                setPlaylistModalVideo(playlistModalVideo); // Keep current video
                setShowPlaylistModal(true);
                fetchUserOwnPlaylists();
                setAppSaveToast(prev => ({ ...prev, visible: false }));
              }}
              className="text-blue-400 font-bold hover:bg-blue-400/10 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              שינוי
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {editPlaylistModal && (
        <EditPlaylistModal
          playlist={editPlaylistModal}
          onClose={() => setEditPlaylistModal(null)}
          onSave={async (name, description, voting) => {
            if (!user?.email) return;
            await editUserPlaylist(user.email, editPlaylistModal.id, { name, description, voting });
            await fetchUserOwnPlaylists();
            setEditPlaylistModal(null);
          }}
        />
      )}

      {/* NetFree multi-video report floating bar */}
      {(isSearchMode || (!isHistoryView && !isLikedVideosView && !isWatchLaterView && !selectedChannel && !isSubscriptionsView && !isMusicView && !isPlaylistsView && !selectedVideo)) && reportVideos.size > 0 && (
        <FloatingNetFreeBar
          videos={Array.from(reportVideos.values())}
          onClear={() => setReportVideos(new Map())}
        />
      )}
    </div>
    </>
  );
}


function EditPlaylistModal({ playlist, onClose, onSave }: { playlist: any, onClose: () => void, onSave: (name: string, description: string, voting: string) => void }) {
  const [name, setName] = useState(playlist.name || '');
  const [description, setDescription] = useState(playlist.description || '');
  const [voting, setVoting] = useState(playlist.voting || 'Off');

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-[var(--background)] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl border border-[var(--border)]" dir="rtl">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">עריכת פלייליסט</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-full text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-[var(--secondary)]">
            {playlist.thumbnail ? (
              <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ListMusic size={48} className="text-[var(--muted)] opacity-50" />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-xs text-[var(--muted)] mb-1">כותרת</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value.slice(0, 150))}
              className="w-full bg-transparent border-b border-[var(--border)] focus:border-[var(--foreground)] outline-none py-1 text-[var(--foreground)] text-sm"
            />
            <div className="text-left text-[10px] text-[var(--muted)] mt-1">{name.length}/150</div>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs text-[var(--muted)] mb-1">תיאור</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
              rows={1}
              className="w-full bg-transparent border-b border-[var(--border)] focus:border-[var(--foreground)] outline-none py-1 text-[var(--foreground)] resize-none text-sm"
            />
            <div className="text-left text-[10px] text-[var(--muted)] mt-1">{description.length}/5000</div>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs text-[var(--muted)] mb-1">הצבעה</label>
            <select 
              value={voting}
              onChange={(e) => setVoting(e.target.value)}
              className="w-full bg-transparent border-b border-dashed border-[var(--border)] focus:border-[var(--foreground)] outline-none py-1 text-[var(--muted)] appearance-none text-sm"
            >
              <option value="Off">כבוי</option>
              <option value="On">פעיל</option>
            </select>
          </div>
          
          <button 
            onClick={() => onSave(name, description, voting)}
            disabled={!name.trim()}
            className="w-full py-2.5 bg-[var(--secondary)] hover:bg-[var(--border)] disabled:opacity-50 text-[var(--foreground)] rounded-full font-medium transition-colors text-sm"
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DescriptionRenderer ──────────────────────────────────────────────────────
function DescriptionRenderer({ text, collapsed }: { text: string; collapsed: boolean }) {
  const getSocialInfo = (url: string): { icon: React.ReactNode; label: string; color: string; bg: string } | null => {
    const u = url.toLowerCase();
    if (u.includes('instagram.com') || u.includes('instagr.am')) {
      const handle = url.match(/instagram\.com\/([^/?#\s&]+)/)?.[1] || 'Instagram';
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
            <defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient></defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)"/>
            <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="1.8"/>
            <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
          </svg>
        ),
        label: handle.startsWith('@') ? handle : `@${handle}`,
        color: '#C13584', bg: 'rgba(193,53,132,0.1)',
      };
    }
    if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.me')) {
      const handle = url.match(/(?:facebook\.com|fb\.com)\/([^/?#\s&]+)/)?.[1] || 'Facebook';
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="#1877F2">
            <rect width="24" height="24" rx="5" fill="#1877F2"/>
            <path d="M16 8h-2a1 1 0 00-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 014-4h2v3z" fill="white"/>
          </svg>
        ),
        label: handle.startsWith('@') ? handle : handle,
        color: '#1877F2', bg: 'rgba(24,119,242,0.08)',
      };
    }
    if (u.includes('tiktok.com')) {
      const handle = url.match(/tiktok\.com\/@?([^/?#\s&]+)/)?.[1] || 'TikTok';
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
            <rect width="24" height="24" rx="5" fill="#010101"/>
            <path d="M19 8a3.5 3.5 0 01-3.5-3.5V4h-3v11.5a2 2 0 11-2-2V10a5 5 0 105 5V9.5A7 7 0 0019 11V8z" fill="white"/>
          </svg>
        ),
        label: `@${handle}`,
        color: '#010101', bg: 'rgba(1,1,1,0.08)',
      };
    }
    if (u.includes('twitter.com') || u.includes('x.com')) {
      const handle = url.match(/(?:twitter|x)\.com\/([^/?#\s&]+)/)?.[1] || 'X';
      if (handle === 'share' || handle === 'intent') return null;
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="#000">
            <rect width="24" height="24" rx="5" fill="#000"/>
            <path d="M18 5l-5.5 6.3L18.5 19H14l-3.5-4.5L7 19H4.5l5.8-6.7L4 5h4.5l3.2 4.1L16 5H18z" fill="white"/>
          </svg>
        ),
        label: `@${handle}`,
        color: '#000', bg: 'rgba(0,0,0,0.07)',
      };
    }
    if (u.includes('youtube.com') || u.includes('youtu.be')) {
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
            <rect width="24" height="24" rx="5" fill="#FF0000"/>
            <polygon points="10,8 16,12 10,16" fill="white"/>
          </svg>
        ),
        label: 'YouTube',
        color: '#FF0000', bg: 'rgba(255,0,0,0.08)',
      };
    }
    if (u.includes('t.me') || u.includes('telegram.me') || u.includes('telegram.org')) {
      const handle = url.match(/(?:t\.me|telegram\.me)\/([^/?#\s&]+)/)?.[1] || 'Telegram';
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
            <rect width="24" height="24" rx="12" fill="#2CA5E0"/>
            <path d="M5 12l3 2 7-6-5 7v3l2-2.5L15 18l4-13-14 7z" fill="white"/>
          </svg>
        ),
        label: handle.startsWith('@') ? handle : `@${handle}`,
        color: '#2CA5E0', bg: 'rgba(44,165,224,0.1)',
      };
    }
    if (u.includes('whatsapp.com') || u.includes('wa.me')) {
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
            <rect width="24" height="24" rx="12" fill="#25D366"/>
            <path d="M12 4a8 8 0 00-6.8 12.2L4 20l3.9-1.2A8 8 0 1012 4zm0 14a6 6 0 01-3.1-.86l-.22-.13-2.3.7.7-2.24-.14-.23A6 6 0 1112 18zm3.3-4.4c-.18-.09-1.06-.52-1.22-.58-.17-.06-.28-.09-.4.09s-.47.58-.57.69c-.1.11-.21.12-.39.04a4.87 4.87 0 01-1.43-.88 5.3 5.3 0 01-.99-1.23c-.1-.18-.01-.27.08-.36l.28-.32c.09-.1.12-.18.18-.3.06-.11.03-.22-.01-.3-.04-.09-.4-.96-.55-1.31-.14-.34-.29-.3-.4-.3h-.33a.64.64 0 00-.46.21 1.94 1.94 0 00-.6 1.44c0 .85.62 1.67.7 1.79.1.11 1.22 1.86 2.95 2.6.41.18.73.28.98.36.41.13.79.11 1.08.07.33-.05 1.02-.42 1.16-.82.15-.4.15-.74.1-.82-.04-.07-.15-.11-.32-.2z" fill="white"/>
          </svg>
        ),
        label: 'WhatsApp',
        color: '#25D366', bg: 'rgba(37,211,102,0.1)',
      };
    }
    if (u.includes('spotify.com') || u.includes('open.spotify')) {
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
            <rect width="24" height="24" rx="12" fill="#1DB954"/>
            <path d="M12 6a6 6 0 100 12A6 6 0 0012 6zm2.74 8.65c-.11.17-.34.22-.51.11-1.4-.86-3.16-1.05-5.23-.57-.2.05-.4-.08-.44-.28-.05-.2.08-.4.28-.44 2.27-.52 4.22-.3 5.79.66.17.11.22.34.11.52zm.73-1.62c-.14.21-.42.28-.63.14-1.6-1-4.04-1.28-5.93-.7-.23.07-.48-.06-.55-.3-.07-.23.06-.47.29-.54 2.16-.66 4.85-.34 6.68.8.22.13.29.42.14.6zm.06-1.68C13.44 10.24 10.36 10.13 8.5 10.7c-.28.08-.57-.07-.65-.35-.08-.28.07-.57.35-.65 2.12-.64 5.64-.52 7.87.87.25.15.33.47.18.72-.15.25-.47.33-.72.18z" fill="white"/>
          </svg>
        ),
        label: 'Spotify',
        color: '#1DB954', bg: 'rgba(29,185,84,0.1)',
      };
    }
    return null;
  };

  const URL_REGEX = /(https?:\/\/[^\s<>"\]]+)/g;
  const lines = text.split("\n");
  
  return (
    <div className="whitespace-pre-wrap break-words" dir="auto">
      {lines.map((line, lineIdx) => {
        const parts: Array<{ type: string; content: string; url?: string; social?: any }> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        const regex = new RegExp(URL_REGEX.source, "g");
        
        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ type: "text", content: line.slice(lastIndex, match.index) });
          }
          const url = match[0].replace(/[.,;:!?)]+$/, "");
          const social = getSocialInfo(url);
          parts.push({ type: social ? "social" : "link", content: url, url, social });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < line.length) {
          parts.push({ type: "text", content: line.slice(lastIndex) });
        }
        if (parts.length === 0 && line.trim() === "") {
          return <br key={lineIdx} />;
        }
        
        return (
          <React.Fragment key={lineIdx}>
            {parts.map((part, pIdx) => {
              if (part.type === "text") {
                return <span key={pIdx}>{part.content}</span>;
              }
              if (part.type === "social" && part.social) {
                const s = part.social;
                return (
                  <a
                    key={pIdx}
                    href={part.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={part.url}
                    className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 no-underline align-middle"
                    style={{ 
                      color: s.color, 
                      background: s.bg, 
                      borderColor: `${s.color}30`,
                    }}
                  >
                    {s.icon}
                    <span className="max-w-[140px] truncate">{s.label}</span>
                  </a>
                );
              }
              const display = (part.url || "").replace(/^https?:\/\//, "").replace(/^www\./, "");
              return (
                <a
                  key={pIdx}
                  href={part.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-500 hover:underline break-all mx-1"
                >
                  {display.length > 55 ? display.slice(0, 55) + "…" : display}
                </a>
              );
            })}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── AmbientBackground — אפקט רקע דינמי בזמן אמת ───────────────────────────
// מציג את הסרטון עצמו מטושטש מאוד כרקע של כל דף הצפייה.
// הסרטון מתנגן בזמן אמת ↔ הרקע משתנה בזמן אמת לפי הפריים הנוכחי.
// dark mode בלבד — ב-light mode שקוף לחלוטין.
function AmbientBackground({ videoId, startTime = 0, isShort = false, isDark = true }: { videoId: string; startTime?: number; isShort?: boolean; isDark?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // מעקב אחרי מצב הנגן הראשי
  const mainPlayerStateRef = useRef<number>(-1); // -1=unstarted, 1=playing, 2=paused, 0=ended
  const mainPlayerTimeRef = useRef<number>(startTime);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  const sendToAmbient = useCallback((func: string, args: any[] = []) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch (_) {}
  }, []);

  // פולינג — שואל את הנגן הראשי את הזמן הנוכחי כל שנייה
  useEffect(() => {
    let mainIframe = document.getElementById('main-youtube-player') as HTMLIFrameElement | null;
    if (mainIframe && mainIframe.tagName !== 'IFRAME') {
      mainIframe = mainIframe.querySelector('iframe') as HTMLIFrameElement | null;
    }

    const requestTime = () => {
      try {
        mainIframe?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'getCurrentTime', args: [] }),
          '*'
        );
      } catch (_) {}
    };

    syncIntervalRef.current = setInterval(() => {
      // רק אם מנגן
      if (mainPlayerStateRef.current === 1) {
        requestTime();
      }
    }, 1000);

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // תגובה לonStateChange מהנגן הראשי
        if (data?.event === 'onStateChange' || data?.info !== undefined) {
          const state = typeof data.info === 'number' ? data.info : -1;

          if (state === 1) {
            // התחיל לנגן — מסנכרן זמן ואז מנגן
            mainPlayerStateRef.current = 1;
            const currentTime = mainPlayerTimeRef.current;
            const timeDiff = Math.abs(currentTime - lastSyncTimeRef.current);
            if (timeDiff > 2) {
              // היה דילוג — מסנכרן
              sendToAmbient('seekTo', [currentTime, true]);
              lastSyncTimeRef.current = currentTime;
            }
            sendToAmbient('playVideo');
          } else if (state === 2) {
            // עצר
            mainPlayerStateRef.current = 2;
            sendToAmbient('pauseVideo');
          } else if (state === 0) {
            // הסתיים
            mainPlayerStateRef.current = 0;
            sendToAmbient('pauseVideo');
          } else if (state === 3) {
            // בufferring — ממשיך
            mainPlayerStateRef.current = 3;
          }
        }

        // תגובה לgetCurrentTime — מגיע כ-info עם מספר
        if (data?.event === 'infoDelivery' && data?.info?.currentTime !== undefined) {
          const currentTime = data.info.currentTime;
          const timeDiff = Math.abs(currentTime - lastSyncTimeRef.current);
          mainPlayerTimeRef.current = currentTime;

          if (timeDiff > 3) {
            // דילוג — מסנכרן מיידית
            sendToAmbient('seekTo', [currentTime, true]);
            lastSyncTimeRef.current = currentTime;
          }
        }

        // YouTube player postMessage format (onReady / getCurrentTime response)
        if (typeof data?.info === 'number' && data?.info > 0 && data?.event === undefined) {
          // זמן נוכחי מהנגן
          const currentTime = data.info;
          const timeDiff = Math.abs(currentTime - lastSyncTimeRef.current);
          mainPlayerTimeRef.current = currentTime;
          if (timeDiff > 3) {
            sendToAmbient('seekTo', [currentTime, true]);
            lastSyncTimeRef.current = currentTime;
          }
        }

      } catch (_) {}
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [sendToAmbient]);

  // Hide ambient background effect in light mode for regular videos (only show in dark mode or for shorts)
  if (!isShort && !isDark) {
    return null;
  }

  return (
    <div
      className={`absolute z-0 pointer-events-none ${isShort ? 'inset-0 overflow-hidden' : ''}`}
      aria-hidden="true"
      style={isShort ? { isolation: 'isolate' } : {
        top: '-20%',
        left: '-15%',
        right: '-15%',
        bottom: '-20%',
        isolation: 'isolate',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* iframe של הסרטון — מתנגן בלי שמע, ללא כפתורים, מטושטש מאוד */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&disablekb=1&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${videoId}&enablejsapi=1${startTime > 0 ? `&start=${Math.floor(startTime)}` : ''}`}
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        style={{
          width: isShort ? '200%' : '100%',
          height: isShort ? '200%' : '100%',
          transform: isShort ? 'translate(-25%, -25%)' : 'scale(1.4)',
          filter: isShort
            ? 'blur(80px) saturate(2.5) brightness(0.55)'
            : isDark
              ? 'blur(55px) saturate(2.2) brightness(0.85)'
              : 'blur(55px) saturate(1.4) brightness(1.1)',
          opacity: isShort ? 0.8 : isDark ? 0.75 : 0.18,
          pointerEvents: 'none',
          border: 'none',
          transition: 'opacity 0.6s ease, filter 0.6s ease',
        }}
      />
      {/* שכבת כהות עדינה מעל כדי שהרקע לא יהיה חזק מדי */}
      {!isShort && (
        <div style={{
          position: 'absolute', inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 35%, transparent 25%, var(--background) 68%)'
            : 'radial-gradient(ellipse at 50% 35%, transparent 15%, var(--background) 60%)',
          transition: 'background 0.6s ease',
        }} />
      )}
      {isShort && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
        }} />
      )}
    </div>
  );
}

interface WatchViewProps {
  video: YouTubeVideo;
  channel: any;
  onVideoClick: (v: YouTubeVideo) => void;
  onChannelClick: (id: string) => void;
  onLikeToggle?: (video: YouTubeVideo, isLiked: boolean) => void;
  onWatchLaterToggle?: (video: YouTubeVideo, isAdded: boolean) => void;
  onOpenSaveModal?: (video: YouTubeVideo) => void;
  isSubscribed: boolean;
  watchLater: YouTubeVideo[];
  likedVideos: YouTubeVideo[];
  toggleSubscribe: (channel?: any) => void;
  isBellActive: boolean;
  toggleBell: () => void;
  user: any;
  handleSignIn: () => void;
  playlistContext?: { id: string; name: string; videos: YouTubeVideo[]; currentIndex: number } | null;
  shortsContext?: { shorts: YouTubeVideo[]; currentIndex: number } | null;
  onShortsNext?: () => void;
  onShortsPrev?: () => void;
  onPlaylistVideoSelect?: (index: number) => void;
  onPlaylistNext?: () => void;
  savedProgress?: { currentTime: number; duration: number } | null;
  onProgressUpdate?: (videoId: string, currentTime: number, duration: number) => void;
  isDark?: boolean;
  watchHistory?: YouTubeVideo[];
  subscribedChannels?: any[];
}

const WatchView: React.FC<WatchViewProps> = ({ 
  video, 
  channel, 
  onVideoClick, 
  onChannelClick,
  isSubscribed,
  toggleSubscribe,
  isBellActive,
  toggleBell,
  user,
  handleSignIn,
  onLikeToggle,
  onWatchLaterToggle,
  onOpenSaveModal,
  watchLater,
  likedVideos,
  playlistContext,
  shortsContext,
  onShortsNext,
  onShortsPrev,
  onPlaylistVideoSelect,
  onPlaylistNext,
  savedProgress,
  onProgressUpdate,
  isDark = true,
  watchHistory = [],
  subscribedChannels = [],
}) => {
  const videoId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedProgressRef = useRef<{ currentTime: number; duration: number } | null>(null);
  // Capture initial start time ONCE at mount — never changes, prevents iframe reloading
  const initialStartTimeRef = useRef<number>(
    savedProgress && savedProgress.currentTime > 10 ? Math.floor(savedProgress.currentTime) : 0
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBoosted, setIsBoosted] = useState(() => {
    try {
      return localStorage.getItem('volume_boost_enabled') === 'true';
    } catch { return false; }
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAddedToWatchLater, setIsAddedToWatchLater] = useState(false);
  const [fullDescription, setFullDescription] = useState(video.snippet.description);
  const [likesCount, setLikesCount] = useState<string | number | null>(null);
  const [viewCount, setViewCount] = useState(video.snippet?.viewCount || "");
  const userToggledLike = useRef(false);

  const [youtubeLikes, setYoutubeLikes] = useState<number>(0);
  const [backendLikes, setBackendLikes] = useState<number>(0);

  const [activeTag, setActiveTag] = useState<string>('all');
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideo[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [relatedPageToken, setRelatedPageToken] = useState<string | undefined>(undefined);
  const [loadingMoreRelated, setLoadingMoreRelated] = useState(false);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Attempt to remove YouTube's internal title overlay inside the iframe.
  // Note: Due to CORS, this will only execute if the browser has web security disabled or runs in a controlled environment.
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const iframe = document.getElementById('main-youtube-player') as HTMLIFrameElement;
        const innerDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (innerDoc) {
          const elements = innerDoc.querySelectorAll('.ytmVideoInfoVideoTitle, .ytmVideoInfoVideoTitleContainer, .ytp-chrome-top');
          elements.forEach((el) => el.remove());
        }
      } catch (e) {
        // Expected cross-origin error in normal browsers.
      }
    }, 500);
    return () => clearInterval(interval);
  }, [videoId]);

  // ─── Mixed-feed state (for the 'all' tab on the watch page) ────────────────
  // The 'all' tab pulls from FOUR sources and mixes them by percentage:
  //   50% popular videos (Israeli + worldwide, mostly Israeli)
  //   25% videos related to what the user is watching now
  //   15% from history / channels watched in the past
  //   15% from channels the user watches frequently right now
  //
  // Each source has its OWN pagination token, so "load more" can keep pulling
  // fresh items from each source independently — no more dead-end after one page.
  const [profileData, setProfileData] = useState<{
    activeChannels: any[];
    abandonedChannels: any[];
    subscribedChannels: any[];
  }>({ activeChannels: [], abandonedChannels: [], subscribedChannels: [] });

  // Per-source pagination tokens. `undefined` = not started yet, `null` = exhausted.
  const popularIsraeliTokenRef    = useRef<string | undefined | null>(undefined);
  const popularWorldwideTokenRef  = useRef<string | undefined | null>(undefined);
  const relatedTokenRef           = useRef<string | undefined | null>(undefined);
  // Pool of buffered videos per source — we top up the pools as needed and pick
  // by quota each time. This way load-more always returns the right mix.
  const activeChannelsPoolRef = useRef<YouTubeVideo[]>([]);
  const popularPoolRef        = useRef<YouTubeVideo[]>([]);
  const relatedPoolRef        = useRef<YouTubeVideo[]>([]);
  const historyPoolRef        = useRef<YouTubeVideo[]>([]);
  // Channels we've already pulled from (and how deep) for the active-channels pool.
  const activeChannelCursorRef = useRef<{ idx: number; tokens: Record<string, string | null | undefined> }>({ idx: 0, tokens: {} });
  // Cursor into history pool (so we don't repeat the same items).
  const historyCursorRef = useRef<number>(0);
  // Whether each source is still capable of producing more items.
  const sourceExhaustedRef = useRef<{ active: boolean; popular: boolean; related: boolean; history: boolean }>({
    active: false, popular: false, related: false, history: false,
  });

  // ─── Backend helpers ────────────────────────────────────────────────────────
  const apiBase = (window as any).__API_BASE__
    || (window as any).BACKEND_URL
    || `${window.location.origin}/api.php`;

  const backendFetch = async (action: string, body?: any, method: 'GET' | 'POST' = 'POST') => {
    try {
      const userKey = (typeof getUserKey === 'function') ? getUserKey() : '';
      if (!userKey) return null;
      const url = `${apiBase}?action=${encodeURIComponent(action)}&user_email=${encodeURIComponent(userKey)}`;
      const opts: RequestInit = {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      };
      if (method === 'POST' && body) opts.body = JSON.stringify(body);
      const res = await fetch(url, opts);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  // Track that the user is viewing this video's channel (for affinity scoring).
  useEffect(() => {
    if (!user || !video?.snippet?.channelId) return;
    backendFetch('track_channel_view', {
      channelId:        video.snippet.channelId,
      channelTitle:     video.snippet.channelTitle || '',
      channelThumbnail: video.snippet.thumbnails?.default?.url
                     || '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Load profile data once on mount / user change.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const data = await backendFetch('get_user_profile_data', null, 'GET');
      if (cancelled || !data) return;
      setProfileData({
        activeChannels:     Array.isArray(data.activeChannels)     ? data.activeChannels     : [],
        abandonedChannels:  Array.isArray(data.abandonedChannels)  ? data.abandonedChannels  : [],
        subscribedChannels: Array.isArray(data.subscribedChannels) ? data.subscribedChannels : [],
      });
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── Pool helpers ──────────────────────────────────────────────────────────
  const isShortOrTooSmall = (v: YouTubeVideo): boolean => {
    if (!v) return true;
    if ((v as any).isShort) return true;
    if (v.snippet?.duration && v.snippet.duration !== 'LIVE') {
      const secs = parseDurationSecs(v.snippet.duration);
      if (secs <= 63) return true;
    }
    return false;
  };

  const getVidId = (v: YouTubeVideo): string =>
    typeof v.id === 'string' ? v.id : (v.id?.videoId || '');

  // Fetch more items into the popular pool (Israeli + worldwide, mostly Israeli).
  const refillPopularPool = async (alreadySeen: Set<string>) => {
    if (sourceExhaustedRef.current.popular) return;
    try {
      const israeliToken = popularIsraeliTokenRef.current;

      const promises: Promise<any>[] = [];
      if (israeliToken !== null) {
        promises.push(
          searchVideos('סרטונים פופולאריים בישראל', false, israeliToken)
            .catch(() => ({ items: [], nextPageToken: null }))
        );
        promises.push(
          searchVideos('סרטונים מובילים ישראל', false, israeliToken)
            .catch(() => ({ items: [], nextPageToken: null }))
        );
      }

      const results = await Promise.all(promises);

      // Update tokens.
      if (israeliToken !== null && results[0]) {
        popularIsraeliTokenRef.current = results[0].nextPageToken || null;
      }

      // Merge — Israeli
      const merged: YouTubeVideo[] = [];
      for (const r of results) {
        for (const v of (r?.items || [])) {
          if (isShortOrTooSmall(v)) continue;
          const id = getVidId(v);
          if (!id || alreadySeen.has(id)) continue;
          alreadySeen.add(id);
          merged.push(v);
        }
      }

      popularPoolRef.current.push(...merged);

      if (popularIsraeliTokenRef.current === null && merged.length === 0) {
        sourceExhaustedRef.current.popular = true;
      }
    } catch (e) {
      sourceExhaustedRef.current.popular = true;
    }
  };

  // Fetch more items into the related pool (matching the current video).
  const refillRelatedPool = async (alreadySeen: Set<string>) => {
    if (sourceExhaustedRef.current.related) return;
    try {
      const token = relatedTokenRef.current;
      if (token === null) {
        sourceExhaustedRef.current.related = true;
        return;
      }
      const res = await searchVideos(video.snippet?.title || '', false, token).catch(() => ({ items: [], nextPageToken: null }));
      relatedTokenRef.current = res.nextPageToken || null;

      const fresh: YouTubeVideo[] = [];
      for (const v of (res.items || [])) {
        if (isShortOrTooSmall(v)) continue;
        const id = getVidId(v);
        if (!id || alreadySeen.has(id) || id === videoId) continue;
        alreadySeen.add(id);
        fresh.push(v);
      }
      relatedPoolRef.current.push(...fresh);

      if (relatedTokenRef.current === null && fresh.length === 0) {
        sourceExhaustedRef.current.related = true;
      }
    } catch (e) {
      sourceExhaustedRef.current.related = true;
    }
  };

  // Fetch more items into the active-channels pool. Cycles through the user's
  // top channels (from profileData.activeChannels), 1-2 videos per channel per pass.
  const refillActiveChannelsPool = async (alreadySeen: Set<string>) => {
    if (sourceExhaustedRef.current.active) return;
    const channels = profileData.activeChannels || [];
    if (channels.length === 0) {
      sourceExhaustedRef.current.active = true;
      return;
    }
    try {
      const cursor = activeChannelCursorRef.current;
      // Try up to 4 channels per refill.
      let pulled = 0;
      const fresh: YouTubeVideo[] = [];
      let attempts = 0;
      while (pulled < 4 && attempts < channels.length) {
        const ch = channels[cursor.idx % channels.length];
        cursor.idx++;
        attempts++;
        if (!ch?.channelId) continue;
        const tk = cursor.tokens[ch.channelId];
        if (tk === null) continue; // exhausted for this channel
        try {
          const r = await getVideosByChannel(ch.channelId, tk);
          cursor.tokens[ch.channelId] = r.nextPageToken || null;
          for (const v of (r.items || []).slice(0, 2)) {
            if (isShortOrTooSmall(v)) continue;
            const id = getVidId(v);
            if (!id || alreadySeen.has(id) || id === videoId) continue;
            alreadySeen.add(id);
            fresh.push(v);
          }
          pulled++;
        } catch { /* skip channel */ }
      }
      activeChannelsPoolRef.current.push(...fresh);

      // If every channel is exhausted AND we got nothing, mark source done.
      const allExhausted = channels.every(c => c?.channelId && cursor.tokens[c.channelId] === null);
      if (allExhausted && fresh.length === 0) {
        sourceExhaustedRef.current.active = true;
      }
    } catch (e) {
      sourceExhaustedRef.current.active = true;
    }
  };

  // Fetch more items into the history pool. History is finite — once consumed, done.
  const refillHistoryPool = (alreadySeen: Set<string>) => {
    if (sourceExhaustedRef.current.history) return;
    const hist = Array.isArray(watchHistory) ? watchHistory : [];
    while (historyCursorRef.current < hist.length) {
      const v = hist[historyCursorRef.current++];
      if (!v || isShortOrTooSmall(v)) continue;
      const id = getVidId(v);
      if (!id || alreadySeen.has(id) || id === videoId) continue;
      alreadySeen.add(id);
      historyPoolRef.current.push(v);
      if (historyPoolRef.current.length >= 8) break; // top up in chunks
    }
    if (historyCursorRef.current >= hist.length && historyPoolRef.current.length === 0) {
      sourceExhaustedRef.current.history = true;
    }
  };

  // Reset all pools and tokens — called when video or tag changes.
  const resetAllPools = () => {
    popularIsraeliTokenRef.current   = undefined;
    popularWorldwideTokenRef.current = undefined;
    relatedTokenRef.current          = undefined;
    activeChannelsPoolRef.current = [];
    popularPoolRef.current        = [];
    relatedPoolRef.current        = [];
    historyPoolRef.current        = [];
    activeChannelCursorRef.current = { idx: 0, tokens: {} };
    historyCursorRef.current = 0;
    sourceExhaustedRef.current = { active: false, popular: false, related: false, history: false };
  };

  // Build a batch of N videos from the pools, by percentage:
  //   50% popular, 25% related, 15% history, 15% active channels.
  // Refills pools as needed. Returns the picked items and whether more is available.
  const buildMixedBatch = async (batchSize: number, alreadySeen: Set<string>): Promise<{ items: YouTubeVideo[]; hasMore: boolean }> => {
    // Compute quotas. Round so they sum to batchSize.
    let quotaPopular = Math.round(batchSize * 0.50);
    let quotaRelated = Math.round(batchSize * 0.25);
    let quotaHistory = Math.round(batchSize * 0.15);
    let quotaActive  = batchSize - quotaPopular - quotaRelated - quotaHistory;
    if (quotaActive < 0) { quotaPopular += quotaActive; quotaActive = 0; }

    // Make sure each pool has enough items (refill if low).
    const ensurePool = async (
      pool: React.MutableRefObject<YouTubeVideo[]>,
      need: number,
      refillFn: () => Promise<void> | void,
      sourceKey: 'active' | 'popular' | 'related' | 'history'
    ) => {
      let attempts = 0;
      while (pool.current.length < need && !sourceExhaustedRef.current[sourceKey] && attempts < 3) {
        await refillFn();
        attempts++;
      }
    };

    // Refill pools in parallel where possible.
    await Promise.all([
      ensurePool(popularPoolRef,        quotaPopular, () => refillPopularPool(alreadySeen),       'popular'),
      ensurePool(relatedPoolRef,        quotaRelated, () => refillRelatedPool(alreadySeen),       'related'),
      ensurePool(activeChannelsPoolRef, quotaActive,  () => refillActiveChannelsPool(alreadySeen),'active'),
    ]);
    ensurePool(historyPoolRef, quotaHistory, () => refillHistoryPool(alreadySeen), 'history');

    // Pick from each pool up to its quota.
    const picked: YouTubeVideo[] = [];
    const takeFromPool = (pool: YouTubeVideo[], n: number) => {
      let taken = 0;
      while (pool.length > 0 && taken < n) {
        picked.push(pool.shift()!);
        taken++;
      }
      return taken;
    };

    const tookPopular = takeFromPool(popularPoolRef.current, quotaPopular);
    const tookRelated = takeFromPool(relatedPoolRef.current, quotaRelated);
    const tookHistory = takeFromPool(historyPoolRef.current, quotaHistory);
    const tookActive  = takeFromPool(activeChannelsPoolRef.current, quotaActive);

    // If any quota fell short, fill the remainder from popular (the workhorse).
    const shortBy = batchSize - (tookPopular + tookRelated + tookHistory + tookActive);
    if (shortBy > 0) {
      // Try popular first.
      await ensurePool(popularPoolRef, shortBy, () => refillPopularPool(alreadySeen), 'popular');
      takeFromPool(popularPoolRef.current, shortBy);
    }

    // Interleave so the order isn't all-popular-then-all-related: we shuffle in
    // light groups of 4 to keep the mix visually varied while still front-loading
    // active-channel items slightly (familiar channels first feels good).
    // Actually: keep the takeFromPool order but interleave the buckets.
    // Re-order: distribute items so they alternate sources.
    const buckets = {
      popular: picked.slice(0, tookPopular),
      related: picked.slice(tookPopular, tookPopular + tookRelated),
      history: picked.slice(tookPopular + tookRelated, tookPopular + tookRelated + tookHistory),
      active:  picked.slice(tookPopular + tookRelated + tookHistory),
    };
    const interleaved: YouTubeVideo[] = [];
    // Front-load 1-2 active channel items, then alternate.
    if (buckets.active.length > 0) interleaved.push(buckets.active.shift()!);
    while (buckets.popular.length || buckets.related.length || buckets.history.length || buckets.active.length) {
      if (buckets.popular.length) interleaved.push(buckets.popular.shift()!);
      if (buckets.popular.length) interleaved.push(buckets.popular.shift()!);
      if (buckets.related.length) interleaved.push(buckets.related.shift()!);
      if (buckets.active.length)  interleaved.push(buckets.active.shift()!);
      if (buckets.popular.length) interleaved.push(buckets.popular.shift()!);
      if (buckets.history.length) interleaved.push(buckets.history.shift()!);
      if (buckets.related.length) interleaved.push(buckets.related.shift()!);
    }

    // Has more if any source isn't exhausted OR popular pool still has items.
    const hasMore =
      !sourceExhaustedRef.current.popular ||
      !sourceExhaustedRef.current.related ||
      !sourceExhaustedRef.current.active  ||
      !sourceExhaustedRef.current.history ||
      popularPoolRef.current.length > 0   ||
      relatedPoolRef.current.length > 0   ||
      activeChannelsPoolRef.current.length > 0 ||
      historyPoolRef.current.length > 0;

    return { items: interleaved, hasMore };
  };

  // Intersection observer hook for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollTagsLeft, setCanScrollTagsLeft] = useState(false);
  const [canScrollTagsRight, setCanScrollTagsRight] = useState(false);

  useEffect(() => {
    const fetchRelated = async (isLoadMore = false) => {
      if (!videoId) return;
      if (!hasMoreRelated && isLoadMore) return;
      
      if (!isLoadMore) {
        setLoadingRelated(true);
        setRelatedPageToken(undefined);
      } else {
        setLoadingMoreRelated(true);
      }
      
      const currentToken = isLoadMore ? relatedPageToken : undefined;

      try {
        let results: YouTubeVideo[] = [];
        let nextToken: string | undefined = undefined;

        if (activeTag === 'all') {
             // 'all' tab uses the mixed-feed batch builder (4 sources, mixed by %).
             // Reset pools on initial load only — load-more keeps using existing pools.
             if (!isLoadMore) {
                 resetAllPools();
             }
             // Build seen set from current state to avoid duplicates across batches.
             const seen = new Set<string>([videoId]);
             setRelatedVideos(prev => {
                 if (isLoadMore) {
                     for (const v of prev) {
                         const id = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
                         if (id) seen.add(id);
                     }
                 }
                 return prev;
             });
             const batchSize = isLoadMore ? 20 : 25;
             const batch = await buildMixedBatch(batchSize, seen);
             results = batch.items;
             // Use a sentinel token so 'hasMore' reflects pool state, not a real token.
             nextToken = batch.hasMore ? `mixed_${Date.now()}` : undefined;
        } else if (activeTag === 'search') {
             const res = await searchVideos(video.snippet?.title || '', false, currentToken);
             results = res.items || [];
             nextToken = res.nextPageToken;
        } else if (activeTag === 'channel') {
             if (video.snippet?.channelId) {
                const res = await getVideosByChannel(video.snippet.channelId, currentToken);
                results = res.items || [];
                nextToken = res.nextPageToken;
             }
        } else if (activeTag === 'kupa') {
             // kupa removed
             results = [];
             nextToken = null;
        } else if (activeTag === 'related') {
             // getRelatedVideos might not support pageToken correctly, but we'll try to use search API as fallback if it doesn't
             const res = await searchVideos(video.snippet?.title || '', false, currentToken);
             results = res.items || [];
             nextToken = res.nextPageToken;
        } else if (activeTag === 'foryou') {
             const res = await getPopularTorahVideos(currentToken);
             results = res.items || [];
             nextToken = res.nextPageToken;
        } else if (activeTag === 'recent') {
             const res = await searchVideos(video.snippet?.channelTitle || '', false, currentToken);
             results = res.items || [];
             nextToken = res.nextPageToken;
        } else if (activeTag === 'viewed') {
             if (watchHistory && watchHistory.length > 0) {
                 results = watchHistory;
             }
             nextToken = undefined;
        }
        
        // Remove duplicates, current video, and Shorts
        let filtered = results.filter(v => {
           if (!v) return false;
           // חסימת שורטס
           if (v.isShort) return false;
           if (v.snippet?.duration && v.snippet.duration !== 'LIVE') {
              const secs = parseDurationSecs(v.snippet.duration);
              if (secs <= 63) return false;
           }
           let id = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
           return id && id !== videoId;
        });

        setRelatedVideos(prev => {
          const combined = isLoadMore ? [...prev, ...filtered] : filtered;
          const unique: YouTubeVideo[] = [];
          const seen = new Set<string>();
          for (const v of combined) {
             let id = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
             if (!seen.has(id)) {
                seen.add(id);
                unique.push(v);
             }
          }
          return unique;
        });

        setRelatedPageToken(nextToken);
        setHasMoreRelated(!!nextToken);

      } catch (err) {
        console.error("Failed to fetch related videos", err);
        setHasMoreRelated(false);
      } finally {
        setLoadingRelated(false);
        setLoadingMoreRelated(false);
      }
    };

    fetchRelated();
  // Re-run when video / tab changes, OR when profile data first arrives —
  // so the 'all' tab can include the user's frequently-watched channels
  // even if they only loaded after the initial render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, activeTag, profileData.activeChannels.length]);

  const loadMoreRelatedVideos = async () => {
    if (!videoId || !hasMoreRelated || loadingRelated || loadingMoreRelated) return;
    setLoadingMoreRelated(true);
    
    try {
      let results: YouTubeVideo[] = [];
      let nextToken: string | undefined = undefined;

      if (activeTag === 'all') {
           // 'all' tab uses the mixed-feed builder for load-more too,
           // pulling 20 more items split by the 50/25/15/15 ratios.
           // We pass the IDs we already have so the new batch doesn't repeat them.
           const seen = new Set<string>([videoId]);
           // Snapshot current list synchronously via a state read trick.
           // (We use a setState callback below; here we just compute from the closure.)
           // Instead, we collect from the current relatedVideos via state callback inside setRelatedVideos.
           // For seen-set we use a synchronous approach: rely on the pools' internal alreadySeen tracking.
           const batch = await buildMixedBatch(20, seen);
           results = batch.items;
           nextToken = batch.hasMore ? `mixed_${Date.now()}` : undefined;
      } else if (activeTag === 'search') {
           const res = await searchVideos(video.snippet?.title || '', false, relatedPageToken);
           results = res.items || [];
           nextToken = res.nextPageToken;
      } else if (activeTag === 'channel') {
           if (video.snippet?.channelId) {
              const res = await getVideosByChannel(video.snippet.channelId, relatedPageToken);
              results = res.items || [];
              nextToken = res.nextPageToken;
           }
      } else if (activeTag === 'kupa') {
           // kupa removed
           results = [];
           nextToken = null;
      } else if (activeTag === 'related') {
           const res = await searchVideos(video.snippet?.title || '', false, relatedPageToken);
           results = res.items || [];
           nextToken = res.nextPageToken;
      } else if (activeTag === 'foryou') {
           const res = await getPopularTorahVideos(relatedPageToken);
           results = res.items || [];
           nextToken = res.nextPageToken;
      } else if (activeTag === 'recent') {
           const res = await searchVideos(video.snippet?.channelTitle || '', false, relatedPageToken);
           results = res.items || [];
           nextToken = res.nextPageToken;
      } else if (activeTag === 'viewed') {
           nextToken = undefined;
      }
      
      // Remove duplicates, current video, and Shorts
      let filtered = results.filter(v => {
         if (!v) return false;
         // חסימת שורטס
         if (v.isShort) return false;
         if (v.snippet?.duration && v.snippet.duration !== 'LIVE') {
            const secs = parseDurationSecs(v.snippet.duration);
            if (secs <= 63) return false;
         }
         let id = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
         return id && id !== videoId;
      });

      setRelatedVideos(prev => {
        const combined = [...prev, ...filtered];
        const unique: YouTubeVideo[] = [];
        const seen = new Set<string>();
        for (const v of combined) {
           let id = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
           if (!seen.has(id)) {
              seen.add(id);
              unique.push(v);
           }
        }
        return unique;
      });

      setRelatedPageToken(nextToken);
      setHasMoreRelated(!!nextToken);

    } catch (err) {
      console.error("Failed to load more related videos", err);
      setHasMoreRelated(false);
    } finally {
      setLoadingMoreRelated(false);
    }
  };

  useEffect(() => {
    const scrollContainer = document.getElementById('watch-view-main') || null;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreRelatedVideos();
      }
    }, { 
      root: scrollContainer,
      rootMargin: '400px', 
      threshold: 0.01 
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMoreRelatedVideos]);

  const updateTagsScroll = () => {
    if (tagsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tagsContainerRef.current;
      setCanScrollTagsRight(scrollLeft > 0 || scrollLeft < 0); // Works for positive/negative RTL
      setCanScrollTagsLeft(Math.abs(scrollLeft) + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    updateTagsScroll();
    window.addEventListener('resize', updateTagsScroll);
    return () => window.removeEventListener('resize', updateTagsScroll);
  }, []);

  useEffect(() => {
    userToggledLike.current = false;
    const fetchDetails = async () => {
      if (!videoId) return;
      
      setIsAddedToWatchLater(watchLater.some(v => {
        const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
        return vId === videoId;
      }));

      setIsLiked(likedVideos.some(v => {
        const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
        return vId === videoId;
      }));

      try {
        const details = await getVideoDetails(videoId);
        let ytLikes = 0;
        if (details) {
          const plainDesc = details.description
            || (details.descriptionHtml
                ? details.descriptionHtml
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<a[^>]*href="([^"]+)"[^>]*>.*?<\/a>/gi, "$1")
                    .replace(/<[^>]+>/g, "")
                : "")
            || video.snippet.description
            || "";
          setFullDescription(plainDesc);
          const rawViews = details.viewCount ?? details.stats?.views ?? details.stats?.viewCount ?? "";
          if (rawViews) setViewCount(rawViews);
          
          const rawLikes = details.likeCount
            ?? details.stats?.likes
            ?? details.stats?.likesText
            ?? details.likes
            ?? details.statistics?.likeCount
            ?? details.like_count
            ?? details.likesCount
            ?? null;
            
          if (rawLikes !== null && rawLikes !== 0) {
            ytLikes = typeof rawLikes === 'number' ? rawLikes : parseYouTubeCount(rawLikes);
          } else {
            ytLikes = parseYouTubeCount(video.likes || "0");
          }
          setYoutubeLikes(ytLikes);
        } else {
          setFullDescription(video.snippet.description || "");
          ytLikes = parseYouTubeCount(video.likes || (video as any).snippet?.likeCount || "0");
          setYoutubeLikes(ytLikes);
        }
        
        // Fetch likes from RapidAPI and Backend in parallel
        let rapidApiPromise = fetch(`https://youtube138.p.rapidapi.com/video/details/?id=${videoId}&hl=iw&gl=IL`, {
          headers: {
            'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
            'x-rapidapi-host': 'youtube138.p.rapidapi.com'
          }
        }).then(res => res.ok ? res.json() : null).catch(e => {
          console.error("RapidAPI likes fetch error:", e);
          return null;
        });

        const [rapidData, bLikes] = await Promise.all([
          rapidApiPromise,
          getLikesFromBackend(videoId)
        ]);

        if (rapidData) {
          if (rapidData?.description) {
            setFullDescription(typeof rapidData.description === 'string' ? rapidData.description : rapidData.description?.content || video.snippet.description || "");
          }
          const rLikes = rapidData?.stats?.likes 
            || rapidData?.stats?.likesText
            || rapidData?.likes 
            || rapidData?.likeCount 
            || rapidData?.statistics?.likeCount
            || rapidData?.videoDetails?.stats?.likes
            || rapidData?.videoDetails?.likeCount
            || rapidData?.videoDetails?.likes;
          if (rLikes) {
            const parsedRLikes = typeof rLikes === 'number' ? rLikes : parseYouTubeCount(String(rLikes));
            if (parsedRLikes > 0) {
              ytLikes = parsedRLikes;
              setYoutubeLikes(ytLikes);
            }
          }
        }
        
        setBackendLikes(bLikes);
        
        let liked = false;
        if (user) {
          liked = await checkIfUserLikedVideo(videoId);
          // Also check local likedVideos array - the server might not be synced yet
          // if user just liked the video. Use OR so we don't lose recent local likes.
          const localLiked = likedVideos.some(v => {
            const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
            return vId === videoId;
          });
          setIsLiked(liked || localLiked);
          
          addUserActivity('history', video);
        } else {
          liked = likedVideos.some(v => {
            const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
            return vId === videoId;
          });
        }

        if (!userToggledLike.current) {
          // מציג לייקים מ-RapidAPI בלבד (המספר המדויק של YouTube)
          if (ytLikes > 0) {
            setLikesCount(ytLikes);
          } else if (bLikes > 0) {
            setLikesCount(bLikes);
          } else {
            setLikesCount(null);
          }
        }
      } catch (e) {
        console.error("Error in fetchDetails:", e);
      }
    };
    fetchDetails();
  }, [videoId, user]);

  useEffect(() => {
    const mainElement = document.getElementById('watch-view-main');
    if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });

    const interval = setInterval(() => {
      const overlays = document.querySelectorAll('.ytp-pause-overlay');
      overlays.forEach(el => (el as HTMLElement).style.display = 'none');
    }, 1000);

    return () => clearInterval(interval);
  }, [videoId, video.snippet?.title]);

  // Auto-advance to next playlist video when current ends
  useEffect(() => {
    if (!onPlaylistNext) return;
    const handler = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onStateChange' && data?.info === 0) {
          onPlaylistNext();
        }
      } catch(_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onPlaylistNext]);

  // ─── Video progress tracking — local wall-clock timer ────────────────────
  useEffect(() => {
    if (!videoId) return;

    const videoStartPos = initialStartTimeRef.current;
    let totalPlayedMs = 0;
    let lastPlayStartMs: number | null = Date.now();
    let isPlaying = true;

    const getEstimatedCurrentTime = () => {
      const runningMs = isPlaying && lastPlayStartMs !== null ? (Date.now() - lastPlayStartMs) : 0;
      return videoStartPos + (totalPlayedMs + runningMs) / 1000;
    };

    const doSave = () => {
      const ct = getEstimatedCurrentTime();
      // Use video.snippet.duration for accurate duration (parsed from "MM:SS" format)
      const durSecs = parseDurationSecs(video.snippet?.duration);
      if (ct > 8 && onProgressUpdate) onProgressUpdate(videoId, ct, durSecs);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onStateChange') {
          const state = data?.info;
          if (state === 1 && !isPlaying) {
            isPlaying = true;
            setIsPlaying(true);
            lastPlayStartMs = Date.now();
          } else if (state !== 1 && isPlaying) {
            isPlaying = false;
            setIsPlaying(false);
            if (lastPlayStartMs !== null) { totalPlayedMs += Date.now() - lastPlayStartMs; lastPlayStartMs = null; }
            if (state === 0 && onProgressUpdate) onProgressUpdate(videoId, 0, 0); // ended → reset to beginning
            else doSave(); // paused → save immediately
          }
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('saveVideoProgress', doSave);
    progressIntervalRef.current = setInterval(doSave, 8000);

    // Update currentTime state for VolumeBooster
    const timeUpdateInterval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(getEstimatedCurrentTime());
      }
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('saveVideoProgress', doSave);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      clearInterval(timeUpdateInterval);
      doSave(); // Final save on unmount / page unload
    };
  }, [videoId]);

  const hasDescription = fullDescription && fullDescription.trim().length > 0;
  const isDescriptionLong = hasDescription && fullDescription.length > 150;

  const handleLikeToggle = async () => {
    
    if (!videoId) return;
    userToggledLike.current = true;
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    // עדכון אופטימיסטי — הספירה נשארת, לא מתאפסת מהשרת
    const diff = newIsLiked ? 1 : -1;
    setLikesCount(prev => {
      if (prev === null) return null;
      const current = typeof prev === 'number' ? prev : parseYouTubeCount(String(prev || '0'));
      return Math.max(0, current + diff);
    });
    try {
      if (onLikeToggle) onLikeToggle(video, newIsLiked);
      await toggleUserLikeOnBackend(videoId, newIsLiked, video);
    } catch (e) {
      console.error("Error in handleLikeToggle:", e);
      setIsLiked(!newIsLiked);
      if (onLikeToggle) onLikeToggle(video, !newIsLiked);
      setLikesCount(prev => {
        if (prev === null) return null;
        const current = typeof prev === 'number' ? prev : parseYouTubeCount(String(prev || '0'));
        return Math.max(0, current - diff);
      });
    }
  };

  const handleBoostToggle = (boosted: boolean) => {
    setIsBoosted(boosted);
    try {
      localStorage.setItem('volume_boost_enabled', String(boosted));
      const mainIframe = document.getElementById('main-youtube-player') as HTMLIFrameElement | null;
      mainIframe?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: boosted ? 'mute' : 'unMute', args: [] }),
        '*'
      );
    } catch (_) {}
  };

  // ── All hooks must come before any conditional return ──
  const [saveToast, setSaveToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const saveToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef(0);
  const [shortsDirection, setShortsDirection] = useState<'up' | 'down'>('up');
  const wheelCooldown = useRef(false);

  const showSaveToast = (message: string) => {
    if (saveToastTimeout.current) clearTimeout(saveToastTimeout.current);
    setSaveToast({ message, visible: true });
    saveToastTimeout.current = setTimeout(() => setSaveToast({ message: '', visible: false }), 3000);
  };

  const handleWatchLaterClick = () => {
    
    const newIsAdded = !isAddedToWatchLater;
    setIsAddedToWatchLater(newIsAdded);
    if (onWatchLaterToggle) {
      onWatchLaterToggle(video, newIsAdded);
    }
    if (newIsAdded) {
      showSaveToast('נשמר ל"צפייה בהמשך"');
    } else {
      showSaveToast('הוסר מ"צפייה בהמשך"');
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (wheelCooldown.current) return;
    if (e.deltaY > 50 && onShortsNext) {
      setShortsDirection('up');
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 600);
      onShortsNext();
    } else if (e.deltaY < -50 && onShortsPrev) {
      setShortsDirection('down');
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 600);
      onShortsPrev();
    }
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 50 && onShortsNext) {
      setShortsDirection('up');
      onShortsNext();
    } else if (diff < -50 && onShortsPrev) {
      setShortsDirection('down');
      onShortsPrev();
    }
  };

  // isShort check comes AFTER all hooks
  const isShort = !!shortsContext;

  // Keyboard navigation for Shorts
  useEffect(() => {
    if (!isShort) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input text field (like search or comment)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowDown' || e.keyCode === 40) {
        e.preventDefault();
        if (onShortsNext) {
          setShortsDirection('up');
          onShortsNext();
        }
      } else if (e.key === 'ArrowUp' || e.keyCode === 38) {
        e.preventDefault();
        if (onShortsPrev) {
          setShortsDirection('down');
          onShortsPrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShort, onShortsNext, onShortsPrev]);

  if (isShort) {
    return (
      <div 
        className="flex flex-col bg-[var(--background)] w-full items-center justify-center overflow-hidden relative"
        style={{ height: 'calc(100vh - 6rem)' }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
        
        {/* Ambient Background (Dark Mode Only) */}
        {/* Removed AmbientBackground as requested */}

        {/* Shorts Navigation Arrows (Fixed Position) */}
        <div className="absolute right-4 xl:right-12 xl:mr-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4 z-40 hidden md:flex">
          <button 
            onClick={(e) => { e.stopPropagation(); if (onShortsPrev) { setShortsDirection('down'); onShortsPrev(); } }}
            disabled={!onShortsPrev || (shortsContext && shortsContext.currentIndex === 0)}
            className={`w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all disabled:opacity-0 cursor-pointer shadow-none ${isDark ? 'bg-[#333333] hover:bg-[#444444] text-white' : 'bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f]'}`}
          >
            <div className="mb-0.5 mt-0.5">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </div>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); if (onShortsNext) { setShortsDirection('up'); onShortsNext(); } }}
            disabled={!onShortsNext || (shortsContext && shortsContext.currentIndex === shortsContext.shorts.length - 1)}
            className={`w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all disabled:opacity-0 cursor-pointer shadow-none ${isDark ? 'bg-[#333333] hover:bg-[#444444] text-white' : 'bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f]'}`}
          >
            <div className="mt-0.5 mb-0.5">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </div>
          </button>
        </div>

        <AnimatePresence initial={false}>
          <motion.div
            key={videoId}
            initial={{ y: shortsDirection === 'up' ? 'calc(100vh - 6rem)' : 'calc(-100vh + 6rem)', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: shortsDirection === 'up' ? 'calc(-100vh + 6rem)' : 'calc(100vh - 6rem)', opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-row items-end justify-center gap-2 sm:gap-4 w-full h-full py-4 sm:py-6 absolute inset-0 z-10"
          >
            {/* Right Side (in RTL): Action Buttons */}
            <div className="flex flex-col gap-6 pb-4 items-center flex-shrink-0 hidden md:flex w-24">
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={handleLikeToggle}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors relative overflow-hidden group ${isLiked ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)]'}`}
                >
                  <YouTubeLike size={24} active={isLiked} />
                  <div aria-hidden="true" className="ytSpecTouchFeedbackShapeHost ytSpecTouchFeedbackShapeTouchResponse">
                    <div className="ytSpecTouchFeedbackShapeStroke"></div>
                    <div className="ytSpecTouchFeedbackShapeFill"></div>
                  </div>
                </button>
                <span className="text-[14px] text-[var(--muted)] font-medium">
                  {(() => {
                    if (likesCount === null) return '';
                    if (likesCount === '' || likesCount === undefined) return '0';
                    const n = typeof likesCount === 'number' ? likesCount : parseYouTubeCount(String(likesCount));
                    if (isNaN(n)) return '0';
                    return formatCount(n);
                  })()}
                </span>
              </div>
            
            <div className="flex flex-col items-center gap-1.5">
              <button className="w-14 h-14 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full flex items-center justify-center text-[var(--foreground)] transition-colors">
                <YouTubeShare size={24} />
              </button>
              <span className="text-[14px] text-[var(--muted)] font-medium">שתף</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <button className="w-14 h-14 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full flex items-center justify-center text-[var(--foreground)] transition-colors">
                <Repeat size={24} />
              </button>
              <span className="text-[14px] text-[var(--muted)] font-medium">Remix</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 mt-2">
              <div 
                className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--secondary)] cursor-pointer border-2 border-[var(--background)]"
                onClick={() => onChannelClick(video.snippet.channelId)}
              >
                <img src={channel?.avatarUrl || channel?.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${video.snippet.channelId}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>

            {/* Center: Video Player */}
            <div className="h-full aspect-[9/16] rounded-[20px] overflow-hidden bg-black relative flex-shrink-0 shadow-2xl z-10 group/player">
              <iframe
                id="main-youtube-player"
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${typeof video.id === 'string' ? video.id : (video.id?.videoId || "")}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&cc_load_policy=0&disablekb=0&playsinline=1&controls=1&enablejsapi=1&hl=he&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                title={video.snippet?.title || "Video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={(e) => {
                  try {
                    const iframe = e.target as HTMLIFrameElement;
                    iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
                  } catch (_) {}
                }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '20px' }}
              ></iframe>
              
              {/* Invisible overlay for wheel/swipe and click-to-pause (doesn't block top/bottom menus) */}
              <div 
                className="absolute top-[20%] bottom-[35%] left-0 right-0 z-10 cursor-pointer"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  const iframe = document.getElementById('main-youtube-player') as HTMLIFrameElement;
                  if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: isPlaying ? 'pauseVideo' : 'playVideo' }), '*');
                    setIsPlaying(!isPlaying);
                  }
                }}
              >
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md text-white border border-white/10">
                      <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" className="ml-2"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Gradient overlay for mobile where info is inside */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none md:hidden z-10" />
              
              {/* Mobile Info Overlay */}
              <div className="absolute bottom-4 left-4 right-16 flex flex-col gap-3 md:hidden z-20 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => onChannelClick(video.snippet.channelId)}>
                  <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-gray-600 flex-shrink-0 border border-white/20">
                    <img src={channel?.avatarUrl || channel?.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${video.snippet.channelId}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-bold text-white text-[15px] truncate drop-shadow-md">{video.snippet.channelTitle}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSubscribe(channel); }}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold ml-2 pointer-events-auto transition-colors ${isSubscribed ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-black text-white hover:bg-gray-900 border border-white/20'}`}
                  >
                    {isSubscribed ? 'רשום' : 'הירשם'}
                  </button>
                </div>
                <h1 className="text-[17px] font-medium text-white line-clamp-2 drop-shadow-md leading-tight">{video.snippet?.title}</h1>
              </div>
            </div>

            {/* Left Side (in RTL): Channel Info & Title */}
            <div className="flex flex-col gap-3 w-[340px] pb-4 hidden md:flex">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChannelClick(video.snippet.channelId)}>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--secondary)] flex-shrink-0">
                    {(channel?.avatarUrl || channel?.snippet?.thumbnails?.high?.url || channel?.snippet?.thumbnails?.default?.url) ? (
                      <img 
                        src={channel?.avatarUrl || channel?.snippet?.thumbnails?.high?.url || channel?.snippet?.thumbnails?.default?.url} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`;
                        }}
                      />
                    ) : (
                      <img src={`https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <span className="font-medium text-[14px] leading-[20px] text-[var(--foreground)] truncate max-w-[150px]" dir="ltr">@{video.snippet.channelTitle}</span>
                </div>
                
                <button 
                  onClick={() => toggleSubscribe(channel)}
                  className={`px-5 h-[42px] rounded-full text-[14px] font-normal transition-all flex-shrink-0 ${isSubscribed ? 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]' : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'}`}
                >
                  {isSubscribed ? 'רשום כמנוי' : 'הירשם כמנוי'}
                </button>
              </div>
              
              <h1 className="text-[19px] font-bold text-[var(--foreground)] line-clamp-3 leading-snug">{video.snippet?.title || "סרטון"}</h1>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--background)] min-h-full pb-20 overflow-x-hidden relative">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
      <div className={`flex flex-col lg:flex-row justify-start gap-0 lg:gap-5 px-2 sm:px-6 pt-0 sm:pt-0 relative z-10 mx-auto w-full max-w-[1780px]`}>
        {/* Video + Info */}
        <div className={`min-w-0 relative ${playlistContext ? 'flex-1' : 'w-full lg:w-auto lg:flex-1 lg:max-w-[calc((100vh-160px)*1.7778)]'}`}>
          {/* ═══ Ambient Background — רקע דינמי בזמן אמת (dark mode בלבד) ══════ */}
          <AmbientBackground videoId={typeof video.id === 'string' ? video.id : (video.id?.videoId || "")} startTime={initialStartTimeRef.current} isDark={isDark} />
          <div className={`w-full relative`} style={{ marginInlineStart: '0', marginInlineEnd: '0' }}>

            <div className="w-full bg-transparent pt-0 pb-0 relative">
              <div className="w-full aspect-video bg-black relative" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <iframe
            ref={iframeRef}
            id="main-youtube-player"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${typeof video.id === 'string' ? video.id : (video.id?.videoId || "")}?autoplay=1&rel=0&iv_load_policy=3&showinfo=0&cc_load_policy=0&disablekb=0&playsinline=1&controls=1&enablejsapi=1&hl=he&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}${initialStartTimeRef.current > 0 ? `&start=${initialStartTimeRef.current}` : ''}`}
            title={video.snippet?.title || "Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
          ></iframe>
        </div>
      </div>

      <div className="w-full pt-4 pb-6">
        <h1 className="text-[20px] sm:text-[22px] font-bold leading-[30px] mb-4 text-right text-[var(--foreground)]">{video.snippet?.title || "סרטון"}</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="h-12 w-12 sm:h-14 sm:w-14 bg-[var(--secondary)] rounded-full flex items-center justify-center font-bold text-[var(--muted)] overflow-hidden cursor-pointer shadow-sm flex-shrink-0"
              onClick={() => onChannelClick(video.snippet.channelId)}
            >
              {(() => {
                const avatarSrc = channel?.avatarUrl 
                  || channel?.snippet?.thumbnails?.high?.url 
                  || channel?.snippet?.thumbnails?.default?.url
                  || (video.snippet as any)?.channelThumbnail
                  || (video.snippet as any)?.channelAvatar
                  || `https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`;
                return (
                  <img 
                    src={avatarSrc} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`;
                    }}
                  />
                );
              })()}
            </div>
            <div className="cursor-pointer min-w-0" onClick={() => onChannelClick(video.snippet.channelId)}>
              <p className="font-medium text-[17px] sm:text-[18px] leading-[22px] transition-colors truncate text-[var(--foreground)]">{video.snippet.channelTitle}</p>
              <p className="text-[12px] text-[var(--muted)] truncate mt-0.5 min-h-[16px]">
                {(() => {
                  const sub = channel?.statistics?.subscriberCount
                    ?? channel?.stats?.subscribersText
                    ?? channel?.stats?.subscribers
                    ?? channel?.stats?.subscriberCountText
                    ?? channel?.subscriberCount
                    ?? channel?.subscriberCountText
                    ?? channel?.subscribersCount
                    ?? channel?.meta?.subscriberCountText
                    ?? channel?.subscribers;
                  const formatted = formatSubscribers(sub);
                  if (formatted) {
                    // If the formatted text already contains "subscribers" or "מנויים", don't double-add
                    if (/מנויים|subscriber/i.test(formatted)) return formatted;
                    return `${formatted} מנויים`;
                  }
                  // Show subtle skeleton while channel data is still loading
                  if (!channel) return <span className="inline-block w-16 h-3 bg-[var(--secondary)] rounded animate-pulse align-middle"></span>;
                  return null;
                })()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mr-4 sm:mr-6">
              <button 
                onClick={() => toggleSubscribe(channel)}
                className={`px-6 sm:px-8 h-[38px] sm:h-[40px] rounded-full text-[14px] sm:text-[15px] transition-all flex-shrink-0 ${isSubscribed ? 'font-normal bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]' : 'font-[500] bg-black text-white dark:bg-white dark:text-black hover:opacity-90'}`}
              >
                {isSubscribed ? 'רשום כמנוי' : 'הרשמה למנוי'}
              </button>
              {isSubscribed && (
                <button 
                  onClick={toggleBell}
                  className={`p-2.5 rounded-full transition-all ${isBellActive ? 'bg-[var(--secondary)] text-[var(--foreground)]' : 'hover:bg-[var(--secondary)] text-[var(--muted)]'}`}
                >
                  {isBellActive ? <YouTubeBellActive size={22} /> : <YouTubeBell size={22} />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[10px] overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button 
              onClick={handleLikeToggle}
              className="flex items-center gap-2 px-5 h-[38px] sm:h-[40px] rounded-full text-[14px] font-normal transition-colors flex-shrink-0 cursor-pointer bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] relative overflow-hidden group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <YouTubeLike size={22} active={isLiked} />
              <span className="font-[500]">{(() => {
                if (likesCount === null) return '';
                if (likesCount === '' || likesCount === undefined) return '0';
                const n = typeof likesCount === 'number' ? likesCount : parseYouTubeCount(String(likesCount));
                if (isNaN(n)) return '0';
                return formatCount(n);
              })()}</span>
              <div aria-hidden="true" className="ytSpecTouchFeedbackShapeHost ytSpecTouchFeedbackShapeTouchResponse">
                <div className="ytSpecTouchFeedbackShapeStroke"></div>
                <div className="ytSpecTouchFeedbackShapeFill"></div>
              </div>
            </button>
            <button 
              onClick={() => {
                if (onOpenSaveModal) {
                  onOpenSaveModal(video);
                } else {
                  handleWatchLaterClick();
                }
              }}
              className="flex items-center gap-2 px-5 h-[38px] sm:h-[40px] rounded-full text-[14px] font-normal transition-colors flex-shrink-0 cursor-pointer bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)]"
            >
              <YouTubeSave size={22} />
              <span>שמור</span>
            </button>
            <button className="flex items-center gap-2 px-5 h-[38px] sm:h-[40px] bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full text-[14px] font-normal transition-colors flex-shrink-0 cursor-pointer text-[var(--foreground)]">
              <YouTubeShare size={22} />
              <span>שתף</span>
            </button>
            <button className="flex items-center gap-2 px-5 h-[38px] sm:h-[40px] bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full text-[14px] font-normal transition-colors flex-shrink-0 cursor-pointer text-[var(--foreground)]">
              <Download size={22} strokeWidth={2} />
              <span>הורדה</span>
            </button>
            <button className="p-2.5 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-full transition-colors flex-shrink-0 cursor-pointer text-[var(--foreground)]">
              <MoreHorizontal size={22} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div 
          className="mt-4 p-5 bg-[var(--secondary)] rounded-2xl hover:bg-[var(--border)] transition-colors cursor-pointer" 
          onClick={() => isDescriptionLong && setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
          <div className="flex gap-2 text-base font-bold mb-3 text-[var(--foreground)]">
            <span>{viewCount ? (String(viewCount).includes('צפיות') ? viewCount : `${formatCount(viewCount)} צפיות`) : ""}</span>
            {viewCount && <span>•</span>}
            <span>{getRelativeTime(video.snippet.publishedAt)}</span>
          </div>
          <div className={`text-base leading-relaxed text-[var(--foreground)] ${isDescriptionExpanded ? '' : 'line-clamp-3'} overflow-hidden`}>
            {hasDescription 
              ? <DescriptionRenderer text={fullDescription} collapsed={!isDescriptionExpanded} />
              : <span className="text-[var(--muted)]">אין תיאור זמין לסרטון זה.</span>
            }
          </div>
          {isDescriptionLong && (
            <button className="text-sm font-bold mt-4 hover:underline text-[var(--muted)] block cursor-pointer">
              {isDescriptionExpanded ? 'הצג פחות' : 'הצג עוד'}
            </button>
          )}
        </div>
      </div>
          </div>
        </div>{/* end Video + Info */}

        {/* Playlist / Related Videos Sidebar */}
        {playlistContext ? (
          <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-[88px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto bg-[var(--secondary)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-0.5">רשימת השמעה</span>
                <h3 className="text-sm font-extrabold text-[var(--foreground)] truncate" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                  {playlistContext.name}
                </h3>
                <span className="text-xs text-[var(--muted)]">{playlistContext.currentIndex + 1} / {playlistContext.videos.length}</span>
              </div>
            </div>
            <div className="flex flex-col">
              {playlistContext.videos.map((pv: YouTubeVideo, idx: number) => {
                const pvId = typeof pv.id === 'string' ? pv.id : (pv.id?.videoId || '');
                const isCurrent = idx === playlistContext.currentIndex;
                return (
                  <div
                    key={pvId + idx}
                    onClick={() => onPlaylistVideoSelect?.(idx)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${isCurrent ? 'bg-[var(--border)]' : 'hover:bg-[var(--border)]/60'}`}
                  >
                    <span className="text-xs text-[var(--muted)] w-5 text-center flex-shrink-0">
                      {isCurrent ? <Play size={12} className="fill-blue-500 text-blue-500 mx-auto" /> : idx + 1}
                    </span>
                    <div className="relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                      <VideoThumbnail video={pv} alt={pv.snippet?.title} className="w-full h-full object-cover" />
                      <VideoFilterStatus videoId={typeof pv.id === 'string' ? pv.id : (pv.id?.videoId || "")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs line-clamp-2 leading-tight ${isCurrent ? 'font-bold text-[var(--foreground)]' : 'text-[var(--foreground)]'}`}>{pv.snippet?.title}</p>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">{pv.snippet.channelTitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
            <div className="w-full lg:w-[400px] flex-shrink-0 pt-6 lg:pt-0 pb-8 relative">
               {/* Tags */}
               <div className="relative group/tags mb-4">
                 {canScrollTagsRight && (
                   <>
                     <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--background)] from-[20%] via-[var(--background)]/80 to-transparent pointer-events-none z-10" />
                     <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end z-20 pr-1">
                       <button 
                         aria-label="הקודם"
                         onClick={() => {
                            if (tagsContainerRef.current) tagsContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                         }}
                         className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[var(--secondary)] bg-[var(--background)]/80 rounded-full transition-colors text-[var(--foreground)]"
                         style={{
                           backgroundAttachment: "scroll", backgroundClip: "border-box", backgroundOrigin: "padding-box", backgroundRepeat: "repeat", backgroundSize: "auto"
                         }}
                       >
                         <ChevronLeft size={30} strokeWidth={2.8} />
                       </button>
                     </div>
                   </>
                 )}
                 {canScrollTagsLeft && (
                   <>
                     <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--background)] from-[20%] via-[var(--background)]/80 to-transparent pointer-events-none z-10" />
                     <div className="absolute left-0 top-0 bottom-0 flex items-center justify-start z-20 pl-1">
                       <button 
                         aria-label="הבא"
                         onClick={() => {
                            if (tagsContainerRef.current) tagsContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                         }}
                         className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[var(--secondary)] bg-[var(--background)]/80 rounded-full transition-colors text-[var(--foreground)]"
                         style={{
                           backgroundAttachment: "scroll", backgroundClip: "border-box", backgroundOrigin: "padding-box", backgroundRepeat: "repeat", backgroundSize: "auto"
                         }}
                       >
                         <ChevronRight size={30} strokeWidth={2.8} />
                       </button>
                     </div>
                   </>
                 )}
                 <div ref={tagsContainerRef} onScroll={updateTagsScroll} className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 px-1" style={{ scrollBehavior: 'smooth' }}>
                   {[
                     { id: 'all', label: 'הכול' },
                     { id: 'search', label: 'מהחיפוש שלך' },
                     { id: 'channel', label: `הועלה על ידי ${video.snippet?.channelTitle || 'הערוץ'}` },
                     { id: 'related', label: 'קשורים' },
                     { id: 'foryou', label: 'בשבילך' },
                     { id: 'recent', label: 'הועלו לאחרונה' },
                     { id: 'viewed', label: 'נצפו' }
                   ].map(tag => (
                     <button
                       key={tag.id}
                       onClick={() => setActiveTag(tag.id)}
                       className={`px-3 py-1.5 h-[32px] rounded-lg whitespace-nowrap text-[14px] font-medium transition-colors flex-shrink-0 ${activeTag === tag.id ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)]'}`}
                     >
                       {tag.label}
                     </button>
                   ))}
                 </div>
               </div>
               
               {/* Related Videos List */}
               <div className="flex flex-col gap-3 pb-4">
                 {loadingRelated && relatedVideos.length === 0 ? (
                   [...Array(8)].map((_, i) => (
                     <div key={i} className="flex gap-3 w-full animate-pulse">
                       <div className="w-[168px] aspect-video rounded-xl bg-[var(--secondary)] flex-shrink-0"></div>
                       <div className="flex-1 py-1 flex flex-col gap-2">
                         <div className="w-[90%] h-4 bg-[var(--secondary)] rounded"></div>
                         <div className="w-[60%] h-3 bg-[var(--secondary)] rounded"></div>
                       </div>
                     </div>
                   ))
                 ) : relatedVideos.length > 0 ? (
                   relatedVideos.map((rv, idx) => {
                      const rvId = typeof rv.id === 'string' ? rv.id : (rv.id?.videoId || '');
                      const isLive = rv.snippet?.liveBroadcastContent === 'live';
                      return (
                        <div key={rvId + idx} className="flex gap-2 cursor-pointer group" onClick={() => onVideoClick(rv)}>
                          <div className="w-[168px] aspect-video rounded-xl overflow-hidden bg-[var(--secondary)] flex-shrink-0 relative">
                            <VideoThumbnail video={rv} alt={rv.snippet?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {!isLive && <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[12px] px-1 rounded font-medium">{rv.snippet.duration || rv.durationText}</span>}
                            <VideoFilterStatus videoId={rvId} />
                          </div>
                          <div className="flex-1 min-w-0 flex items-start justify-between py-0.5 pr-2">
                            <div className="flex-1 min-w-0 pr-1">
                              <h3 className="text-[14px] font-medium line-clamp-2 leading-tight text-[var(--foreground)] mb-1 transition-colors text-right" dir="rtl">{rv.snippet?.title}</h3>
                              <p className="text-[12px] text-[var(--muted)] truncate">{rv.snippet?.channelTitle}</p>
                              {isLive ? (
                                <div className="mt-1 badge-shape ytBadgeSupportedRendererBadgeShape inline-flex items-center gap-1 bg-[#cc0000]/10 text-[#cc0000] rounded-sm px-[4px] py-[2px]">
                                  <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 12 12" width="12" focusable="false" aria-hidden="true" style={{ fill: 'currentColor' }}><path clipRule="evenodd" d="M2.111 2.111a.5.5 0 11.707.707 4.501 4.501 0 000 6.364.5.5 0 01-.707.707 5.5 5.5 0 010-7.778Zm7.07 0a.5.5 0 01.708 0 5.5 5.5 0 010 7.778.5.5 0 11-.707-.707 4.5 4.5 0 000-6.364.5.5 0 010-.707ZM3.703 3.702a.5.5 0 11.707.707 2.25 2.25 0 000 3.182.5.5 0 01-.707.707 3.25 3.25 0 01-.705-3.542 3.25 3.25 0 01.705-1.054Zm3.889 0a.5.5 0 01.707 0 3.25 3.25 0 010 4.596.5.5 0 01-.707-.707 2.25 2.25 0 000-3.182.5.5 0 010-.707ZM6 5a1 1 0 110 2 1 1 0 010-2Z" fillRule="evenodd"></path></svg>
                                  <span className="text-[12px] font-medium tracking-wide">בשידור חי</span>
                                </div>
                              ) : (
                                <div className="text-[12px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                                  <span>{formatCount(rv.snippet?.viewCount || (rv as any).views || 0)} צפיות</span>
                                  <span className="text-[10px]">•</span>
                                  <span>{getRelativeTime(rv.snippet?.publishedAt)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 pt-0.5 -ml-1 relative" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === rvId ? null : rvId); }}>
                              <button aria-label="פעולות נוספות" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--secondary)] text-[var(--foreground)]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{ pointerEvents: 'none', display: 'block', width: '24px', height: '24px', fill: 'currentColor' }}><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
                              </button>
                              {openMenuId === rvId && <YoutubeMenu type="watch_suggested" onClose={() => setOpenMenuId(null)} />}
                            </div>
                          </div>
                        </div>
                      );
                   })
                 ) : (
                   <div className="text-center text-[var(--muted)] py-6 text-[14px]">לא נמצאו סרטונים קשורים</div>
                 )}
                 
                 {hasMoreRelated && relatedVideos.length > 0 && (
                   <div ref={loadMoreRef} className="w-full flex justify-center py-4 opacity-50">
                     {loadingMoreRelated && <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--foreground)]"></span>}
                   </div>
                 )}
               </div>
            </div>
        )}
      </div>{/* end flex row */}
    </div>
  );
}

const PlaylistCard: React.FC<{ playlist: any, onClick?: () => void }> = ({ playlist, onClick }) => {
  return (
    <div 
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={onClick || (() => window.open(`https://www.youtube.com/playlist?list=${playlist.id}`, '_blank'))}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--secondary)] shadow-sm">
        <VideoThumbnail 
          video={{ id: playlist.id, snippet: { thumbnails: { high: { url: playlist.thumbnail } } } }}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlaySquare size={32} className="text-white mb-2" />
          <span className="text-white font-medium text-sm">הפעל הכל</span>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          <ListMusic size={12} />
          {playlist.videoCount} סרטונים
        </div>
      </div>
      <h3 className="text-[16px] font-medium line-clamp-2 leading-tight text-[var(--foreground)] transition-colors mt-1">
        {playlist.title}
      </h3>
      <p className="text-sm text-[var(--muted)]">צפה בפלייליסט המלא</p>
    </div>
  );
};

const PostCard: React.FC<{ post: any, channel: any }> = ({ post, channel }) => {
  const channelAvatar = channel.avatarUrl || channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url;
  
  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto w-full mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={channelAvatar} 
          alt="Channel" 
          className="w-10 h-10 rounded-full object-cover" 
          referrerPolicy="no-referrer" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://picsum.photos/seed/${channel.id || 'channel'}/100/100`;
          }}
        />
        <div>
          <h3 className="font-bold text-sm text-[var(--foreground)]">{channel.snippet?.title}</h3>
          <p className="text-xs text-[var(--muted)]">{getRelativeTime(post.publishedTime)}</p>
        </div>
      </div>
      <div className="text-sm sm:text-base whitespace-pre-wrap mb-4 leading-relaxed text-[var(--foreground)]" dangerouslySetInnerHTML={{ __html: post.text ? post.text.replace(/\n/g, '<br/>') : '' }} />
      {post.attachment && post.attachment.type === 'image' && post.attachment.thumbnails?.[0]?.url && (
        <div className="rounded-xl overflow-hidden mb-4 border border-[var(--border)]">
          <VideoThumbnail 
            video={{ snippet: { thumbnails: { high: { url: post.attachment.thumbnails[0].url } } } }}
            alt="Post attachment" 
            className="w-full max-h-[500px] object-contain bg-[var(--secondary)]" 
          />
        </div>
      )}
      <div className="flex items-center gap-6 text-[var(--muted)] mt-2 pt-4 border-t border-[var(--border)]">
        <button className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer">
          <ThumbsUp size={18} />
          <span className="text-sm font-medium">{formatCount(post.stats?.likesText)}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer">
          <MessageSquarePlus size={18} />
          <span className="text-sm font-medium">{formatCount(post.stats?.commentsText)}</span>
        </button>
      </div>
    </div>
  );
}

function ChannelView({ 
  channel, 
  videos: initialVideos, 
  onVideoClick, 
  onLoadMore, 
  loadingMore: initialLoadingMore, 
  hasMore: initialHasMore, 
  lastVideoRef: initialLastVideoRef,
  isSubscribed,
  isBellActive,
  setIsBellActive,
  toggleSubscribe,
  toggleBell,
  loading: initialLoading,
  isDark = false
}: { 
  channel: any, 
  videos: YouTubeVideo[], 
  onVideoClick: (v: YouTubeVideo, contextShorts?: YouTubeVideo[]) => void, 
  onLoadMore: () => void, 
  loadingMore: boolean, 
  hasMore: string | undefined,
  lastVideoRef: (node: HTMLDivElement | null) => void,
  isSubscribed: boolean,
  isBellActive: boolean,
  setIsBellActive: (v: boolean) => void,
  toggleSubscribe: () => void,
  toggleBell: () => void,
  loading: boolean,
  isDark?: boolean
}) {
  const [channelDetails, setChannelDetails] = useState<any>(channel);
  const bannerUrl = channelDetails.bannerUrl || channelDetails.brandingSettings?.image?.bannerExternalUrl || channelDetails.banner?.url || channelDetails.banner?.[0]?.url || null;
  const [activeTab, setActiveTab] = useState("דף הבית");
  const [sort, setSort] = useState<'newest' | 'popular' | 'oldest'>('newest');
  const [shortsSort, setShortsSort] = useState<'newest' | 'popular' | 'oldest'>('newest');
  const [liveSort, setLiveSort] = useState<'newest' | 'popular' | 'oldest'>('newest');
  
  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const res = await fetch(`https://youtube138.p.rapidapi.com/channel/details/?id=${channel.id}&hl=iw&gl=IL`, {
          headers: {
            'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
            'x-rapidapi-host': 'youtube138.p.rapidapi.com'
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Extract banner - try multiple formats
          const extractBannerUrl = (bannerData: any): string | null => {
            if (!bannerData) return null;
            if (typeof bannerData === 'string') return bannerData;
            if (Array.isArray(bannerData) && bannerData.length > 0) {
              // sort by width descending for highest quality
              const sorted = [...bannerData].sort((a, b) => (b.width || 0) - (a.width || 0));
              return sorted[0]?.url || bannerData[bannerData.length - 1]?.url || null;
            }
            if (bannerData.desktop && Array.isArray(bannerData.desktop)) {
              const sorted = [...bannerData.desktop].sort((a, b) => (b.width || 0) - (a.width || 0));
              return sorted[0]?.url || null;
            }
            if (bannerData.tv && Array.isArray(bannerData.tv)) return bannerData.tv[bannerData.tv.length - 1]?.url || null;
            if (bannerData.mobile && Array.isArray(bannerData.mobile)) return bannerData.mobile[bannerData.mobile.length - 1]?.url || null;
            return bannerData.url || null;
          };
          const newBannerUrl = extractBannerUrl(data.banner) || extractBannerUrl(data.channelBanner) || null;
          
          // Extract subscriber count and video count from stats
          const newSubscriberCount = data.stats?.subscribersText || data.stats?.subscribers 
            || data.meta?.subscriberCountText || data.subscriberCountText || data.subscribersCount || null;
          const newVideoCount = data.stats?.videosText || data.stats?.videos
            || data.meta?.videosCountText || data.videosCountText || data.videos_count || data.videoCount || null;

          setChannelDetails((prev: any) => ({
            ...prev,
            bannerUrl: newBannerUrl || prev.bannerUrl,
            brandingSettings: {
              ...prev.brandingSettings,
              image: { bannerExternalUrl: newBannerUrl || prev.bannerUrl }
            },
            snippet: {
              ...prev.snippet,
              thumbnails: {
                ...prev.snippet?.thumbnails,
                default: { url: data.avatar?.[0]?.url || data.avatar?.[data.avatar?.length - 1]?.url || prev.snippet?.thumbnails?.default?.url }
              }
            },
            statistics: {
              ...prev.statistics,
              subscriberCount: newSubscriberCount || prev.statistics?.subscriberCount,
              videoCount: newVideoCount || prev.statistics?.videoCount,
            }
          }));
        }
      } catch (e) {
        console.error("Failed to fetch channel details from RapidAPI", e);
      }
    };
    
    fetchChannelDetails();
  }, [channel.id]);
  
  const [viewingChannelPlaylist, setViewingChannelPlaylist] = useState<any | null>(null);
  const [viewingChannelPlaylistVideos, setViewingChannelPlaylistVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingChannelPlaylistVideos, setIsLoadingChannelPlaylistVideos] = useState(false);
  
  const [tabData, setTabData] = useState<any>({
    "דף הבית": initialVideos,
    "סרטונים": initialVideos,
    "שורטס": [],
    "לייבים": [],
    "פלייליסטים": [],
    "פוסטים": []
  });
  
  const [tabLoading, setTabLoading] = useState<any>({
    "דף הבית": false,
    "שורטס": false,
    "סרטונים": false,
    "לייבים": false,
    "פלייליסטים": false,
    "פוסטים": false
  });

  const [tabNextPageToken, setTabNextPageToken] = useState<any>({
    "דף הבית": initialHasMore,
    "סרטונים": initialHasMore,
    "שורטס": null,
    "לייבים": null,
    "פלייליסטים": null,
    "פוסטים": null
  });

  useEffect(() => {
    const restoreChannelTabs = async () => {
      let loadedFromCache = false;

      if (!loadedFromCache) {
        setActiveTab("דף הבית");
        setTabData({
          "דף הבית": [],
          "סרטונים": initialVideos,
          "שורטס": [],
          "לייבים": [],
          "פלייליסטים": [],
          "פוסטים": []
        });
        setTabNextPageToken({
          "דף הבית": initialHasMore,
          "סרטונים": initialHasMore,
          "שורטס": null,
          "לייבים": null,
          "פלייליסטים": null,
          "פוסטים": null
        });
        setTabLoading({
          "דף הבית": false,
          "שורטס": false,
          "סרטונים": false,
          "לייבים": false,
          "פלייליסטים": false,
          "פוסטים": false
        });
      }

      const mainElement = document.getElementById('channel-view-main');
      if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'instant' });
    };

    restoreChannelTabs();
  }, [channel.id]);

  const tabCacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (tabData["דף הבית"]?.length > 0 || tabData["סרטונים"]?.length > 0 || tabData["שורטס"]?.length > 0 || tabData["לייבים"]?.length > 0 || tabData["פלייליסטים"]?.length > 0) {
      if (tabCacheTimeoutRef.current) clearTimeout(tabCacheTimeoutRef.current);
      tabCacheTimeoutRef.current = setTimeout(() => {
        // Caching disabled per user request
      }, 3000);
    }
    return () => {
      if (tabCacheTimeoutRef.current) clearTimeout(tabCacheTimeoutRef.current);
    };
  }, [activeTab, tabData, tabNextPageToken, channel.id]);

  useEffect(() => {
    if (initialVideos && initialVideos.length > 0) {
      setTabData(prev => ({
        ...prev,
        "דף הבית": prev["דף הבית"]?.length === 0 ? initialVideos : prev["דף הבית"],
        "סרטונים": prev["סרטונים"]?.length === 0 ? initialVideos : prev["סרטונים"]
      }));
      setTabNextPageToken(prev => ({
        ...prev,
        "דף הבית": prev["דף הבית"]?.length === 0 ? initialHasMore : prev["דף הבית"],
        "סרטונים": prev["סרטונים"]?.length === 0 ? initialHasMore : prev["סרטונים"]
      }));
    }
  }, [initialVideos, initialHasMore]);

  useEffect(() => {
    if (activeTab === "דף הבית" && tabData["דף הבית"].length === 0) {
      fetchTabHome();
    } else if (activeTab === "סרטונים" && (tabData["סרטונים"].length === 0 || tabData["סרטונים"] === initialVideos)) {
      fetchTabVideos(sort);
    } else if (activeTab === "שורטס" && tabData["שורטס"].length === 0) {
      fetchTabShorts(shortsSort);
    } else if (activeTab === "לייבים" && tabData["לייבים"].length === 0) {
      fetchTabLive(liveSort);
    } else if (activeTab === "פלייליסטים" && tabData["פלייליסטים"].length === 0) {
      fetchTabPlaylists();
    } else if (activeTab === "פוסטים" && tabData["פוסטים"].length === 0) {
      fetchTabPosts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "סרטונים") {
      setTabData(prev => ({ ...prev, "סרטונים": [] }));
      fetchTabVideos(sort);
    }
  }, [sort]);

  useEffect(() => {
    if (activeTab === "שורטס") {
      setTabData(prev => ({ ...prev, "שורטס": [] }));
      fetchTabShorts(shortsSort);
    }
  }, [shortsSort]);

  useEffect(() => {
    if (activeTab === "לייבים") {
      setTabData(prev => ({ ...prev, "לייבים": [] }));
      fetchTabLive(liveSort);
    }
  }, [liveSort]);

  const fetchTabHome = async () => {
    setTabLoading(prev => ({ ...prev, "דף הבית": true }));
    try {
      const homeResult = await getChannelHome(channel.id);
      if (homeResult.items.length > 0) {
        setTabData(prev => ({ ...prev, "דף הבית": homeResult.items }));
        setTabLoading(prev => ({ ...prev, "דף הבית": false }));
        return;
      }
    } catch (_) {}
    if (initialVideos.length > 0) {
      setTabData(prev => ({ ...prev, "דף הבית": initialVideos }));
    }
    setTabLoading(prev => ({ ...prev, "דף הבית": false }));
  };

  const fetchTabVideos = async (currentSort: 'newest' | 'popular' | 'oldest') => {
    setTabLoading(prev => ({ ...prev, "סרטונים": true }));
    try {
      let filter = 'videos_latest';
      if (currentSort === 'popular') filter = 'videos_popular';
      if (currentSort === 'oldest') filter = 'videos_oldest';
      
      const res = await fetch(`https://youtube138.p.rapidapi.com/channel/videos/?id=${channel.id}&filter=${filter}&hl=iw&gl=IL`, {
        headers: {
          'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.contents || []).map((item: any) => {
          const v = item.video;
          if (!v) return null;
          return {
            id: v.videoId,
            snippet: {
              title: v.title,
              thumbnails: {
                high: { url: v.thumbnails?.[v.thumbnails.length - 1]?.url || v.thumbnails?.[0]?.url },
                medium: { url: v.thumbnails?.[0]?.url },
                default: { url: v.thumbnails?.[0]?.url }
              },
              channelTitle: channel.snippet?.title || "",
              channelId: channel.id,
              publishedAt: v.publishedTimeText || "",
              duration: v.lengthText || ""
            },
            views: v.viewCountText || ""
          };
        }).filter(Boolean);
        
        setTabData(prev => ({ ...prev, "סרטונים": items }));
        setTabNextPageToken(prev => ({ ...prev, "סרטונים": data.cursorNext }));
        setTabLoading(prev => ({ ...prev, "סרטונים": false }));
        return;
      }
    } catch (e) {
      console.error("RapidAPI videos fetch error:", e);
    }

    // Fallback
    const result = await getVideosByChannel(channel.id, undefined, currentSort);
    if (result) {
      setTabData(prev => {
        const newData = { ...prev, "סרטונים": result.items };
        return newData;
      });
      setTabNextPageToken(prev => ({ ...prev, "סרטונים": result.nextPageToken }));
    }
    setTabLoading(prev => ({ ...prev, "סרטונים": false }));
  };

  const fetchTabShorts = async (currentSort: 'newest' | 'popular' | 'oldest' = 'newest') => {
    setTabLoading(prev => ({ ...prev, "שורטס": true }));
    try {
      let filter = 'shorts_latest';
      if (currentSort === 'popular') filter = 'shorts_popular';
      if (currentSort === 'oldest') filter = 'shorts_oldest';
      
      const res = await fetch(`https://youtube138.p.rapidapi.com/channel/videos/?id=${channel.id}&filter=${filter}&hl=iw&gl=IL`, {
        headers: {
          'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.contents || []).map((item: any) => {
          const v = item.video;
          if (!v) return null;
          return {
            id: v.videoId,
            snippet: {
              title: v.title,
              thumbnails: {
                high: { url: v.thumbnails?.[v.thumbnails.length - 1]?.url || v.thumbnails?.[0]?.url },
                medium: { url: v.thumbnails?.[0]?.url },
                default: { url: v.thumbnails?.[0]?.url }
              },
              channelTitle: channel.snippet?.title || "",
              channelId: channel.id,
              publishedAt: v.publishedTimeText || "",
              duration: v.lengthText || ""
            },
            views: v.viewCountText || ""
          };
        }).filter(Boolean);
        
        setTabData(prev => ({ ...prev, "שורטס": items }));
        setTabNextPageToken(prev => ({ ...prev, "שורטס": data.cursorNext }));
        setTabLoading(prev => ({ ...prev, "שורטס": false }));
        return;
      }
    } catch (e) {
      console.error("RapidAPI shorts fetch error:", e);
    }
    
    // Fallback
    const result = await getChannelShorts(channel.id, undefined, currentSort);
    if (result) {
      setTabData(prev => {
        const newData = { ...prev, "שורטס": result.items };
        return newData;
      });
      setTabNextPageToken(prev => ({ ...prev, "שורטס": result.nextPageToken }));
    }
    setTabLoading(prev => ({ ...prev, "שורטס": false }));
  };

  const fetchTabLive = async (currentSort: 'newest' | 'popular' | 'oldest' = 'newest') => {
    setTabLoading(prev => ({ ...prev, "לייבים": true }));
    try {
      let filter = 'streams_latest';
      if (currentSort === 'popular') filter = 'streams_popular';
      if (currentSort === 'oldest') filter = 'streams_oldest';
      
      const res = await fetch(`https://youtube138.p.rapidapi.com/channel/videos/?id=${channel.id}&filter=${filter}&hl=iw&gl=IL`, {
        headers: {
          'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.contents || []).map((item: any) => {
          const v = item.video;
          if (!v) return null;
          return {
            id: v.videoId,
            snippet: {
              title: v.title,
              thumbnails: {
                high: { url: v.thumbnails?.[v.thumbnails.length - 1]?.url || v.thumbnails?.[0]?.url },
                medium: { url: v.thumbnails?.[0]?.url },
                default: { url: v.thumbnails?.[0]?.url }
              },
              channelTitle: channel.snippet?.title || "",
              channelId: channel.id,
              publishedAt: v.publishedTimeText || "",
              duration: v.lengthText || "LIVE"
            },
            views: v.viewCountText || ""
          };
        }).filter(Boolean);
        
        setTabData(prev => ({ ...prev, "לייבים": items }));
        setTabNextPageToken(prev => ({ ...prev, "לייבים": data.cursorNext }));
        setTabLoading(prev => ({ ...prev, "לייבים": false }));
        return;
      }
    } catch (e) {
      console.error("RapidAPI live fetch error:", e);
    }

    // Fallback
    const result = await getChannelLiveStreams(channel.id, undefined, currentSort);
    if (result) {
      setTabData(prev => {
        const newData = { ...prev, "לייבים": result.items };
        return newData;
      });
      setTabNextPageToken(prev => ({ ...prev, "לייבים": result.nextPageToken }));
    }
    setTabLoading(prev => ({ ...prev, "לייבים": false }));
  };

  const fetchTabPlaylists = async () => {
    setTabLoading(prev => ({ ...prev, "פלייליסטים": true }));
    try {
      const res = await fetch(`https://youtube138.p.rapidapi.com/channel/playlists/?id=${channel.id}&hl=iw&gl=IL`, {
        headers: {
          'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.contents || []).map((item: any) => {
          const p = item.playlist;
          if (!p) return null;
          return {
            id: p.playlistId,
            snippet: {
              title: p.title,
              thumbnails: {
                high: { url: p.thumbnails?.[p.thumbnails.length - 1]?.url || p.thumbnails?.[0]?.url }
              },
              channelTitle: channel.snippet?.title || "",
              channelId: channel.id
            },
            itemCount: p.stats?.videos || p.videoCount || ""
          };
        }).filter(Boolean);
        
        setTabData(prev => ({ ...prev, "פלייליסטים": items }));
        setTabNextPageToken(prev => ({ ...prev, "פלייליסטים": data.cursorNext }));
        setTabLoading(prev => ({ ...prev, "פלייליסטים": false }));
        return;
      }
    } catch (e) {
      console.error("RapidAPI playlists fetch error:", e);
    }

    // Fallback
    const result = await getChannelPlaylists(channel.id);
    if (result) {
      setTabData(prev => {
        const newData = { ...prev, "פלייליסטים": result.items };
        return newData;
      });
      setTabNextPageToken(prev => ({ ...prev, "פלייליסטים": result.nextPageToken }));
    }
    setTabLoading(prev => ({ ...prev, "פלייליסטים": false }));
  };

  const fetchTabPosts = async () => {
    setTabLoading(prev => ({ ...prev, "פוסטים": true }));
    try {
      const res = await fetch(`https://youtube138.p.rapidapi.com/channel/community/?id=${channel.id}&hl=iw&gl=IL`, {
        headers: {
          'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.contents || []).map((item: any) => {
          const p = item.post;
          if (!p) return null;
          return {
            id: p.postId,
            authorText: p.author?.title || channel.snippet?.title,
            authorThumbnail: p.author?.avatar?.[0]?.url || channel.snippet?.thumbnails?.default?.url,
            contentText: p.text || "",
            publishedTimeText: p.publishedTimeText || "",
            likesCount: p.stats?.likes || "",
            commentsCount: p.stats?.comments || "",
            attachment: p.attachment?.image ? {
              type: 'image',
              imageUrls: p.attachment.image.map((img: any) => img.source?.[img.source.length - 1]?.url || img.source?.[0]?.url).filter(Boolean)
            } : p.attachment?.poll ? {
              type: 'poll',
              choices: p.attachment.poll.choices?.map((c: any) => c.text) || []
            } : p.attachment?.video ? {
              type: 'video',
              videoId: p.attachment.video.videoId,
              title: p.attachment.video.title,
              thumbnail: p.attachment.video.thumbnails?.[p.attachment.video.thumbnails.length - 1]?.url
            } : null
          };
        }).filter(Boolean);
        
        setTabData(prev => ({ ...prev, "פוסטים": items }));
        setTabNextPageToken(prev => ({ ...prev, "פוסטים": data.cursorNext }));
        setTabLoading(prev => ({ ...prev, "פוסטים": false }));
        return;
      }
    } catch (e) {
      console.error("RapidAPI community fetch error:", e);
    }

    // Fallback
    const result = await getChannelCommunity(channel.id);
    if (result) {
      setTabData(prev => {
        const newData = { ...prev, "פוסטים": result.items };
        return newData;
      });
      setTabNextPageToken(prev => ({ ...prev, "פוסטים": result.nextPageToken }));
    }
    setTabLoading(prev => ({ ...prev, "פוסטים": false }));
  };

  const loadMoreTabRef = useRef<() => Promise<void>>(async () => {});
  const loadMoreTab = useCallback(async () => {
    const currentTab = activeTab;
    if (tabLoading[currentTab] || !tabNextPageToken[currentTab]) return;
    
    setTabLoading(prev => ({ ...prev, [currentTab]: true }));
    
    try {
      let endpoint = '';
      let filter = '';
      if (currentTab === "סרטונים" || currentTab === "דף הבית") {
        endpoint = 'videos';
        filter = sort === 'popular' ? 'videos_popular' : sort === 'oldest' ? 'videos_oldest' : 'videos_latest';
      } else if (currentTab === "שורטס") {
        endpoint = 'videos';
        filter = shortsSort === 'popular' ? 'shorts_popular' : shortsSort === 'oldest' ? 'shorts_oldest' : 'shorts_latest';
      } else if (currentTab === "לייבים") {
        endpoint = 'videos';
        filter = liveSort === 'popular' ? 'streams_popular' : liveSort === 'oldest' ? 'streams_oldest' : 'streams_latest';
      } else if (currentTab === "פלייליסטים") {
        endpoint = 'playlists';
      } else if (currentTab === "פוסטים") {
        endpoint = 'community';
      }

      if (endpoint) {
        const res = await fetch(`https://youtube138.p.rapidapi.com/channel/${endpoint}/?id=${channel.id}${filter ? `&filter=${filter}` : ''}&cursor=${tabNextPageToken[currentTab]}&hl=iw&gl=IL`, {
          headers: {
            'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
            'x-rapidapi-host': 'youtube138.p.rapidapi.com'
          }
        });
        if (res.ok) {
          const data = await res.json();
          let items = [];
          if (endpoint === 'videos') {
            items = (data.contents || []).map((item: any) => {
              const v = item.video;
              if (!v) return null;
              return {
                id: v.videoId,
                snippet: {
                  title: v.title,
                  thumbnails: {
                    high: { url: v.thumbnails?.[v.thumbnails.length - 1]?.url || v.thumbnails?.[0]?.url },
                    medium: { url: v.thumbnails?.[0]?.url },
                    default: { url: v.thumbnails?.[0]?.url }
                  },
                  channelTitle: channel.snippet?.title || "",
                  channelId: channel.id,
                  publishedAt: v.publishedTimeText || "",
                  duration: v.lengthText || (currentTab === "לייבים" ? "LIVE" : "")
                },
                views: v.viewCountText || ""
              };
            }).filter(Boolean);
          } else if (endpoint === 'playlists') {
            items = (data.contents || []).map((item: any) => {
              const p = item.playlist;
              if (!p) return null;
              return {
                id: p.playlistId,
                snippet: {
                  title: p.title,
                  thumbnails: {
                    high: { url: p.thumbnails?.[p.thumbnails.length - 1]?.url || p.thumbnails?.[0]?.url }
                  },
                  channelTitle: channel.snippet?.title || "",
                  channelId: channel.id
                },
                itemCount: p.stats?.videos || p.videoCount || ""
              };
            }).filter(Boolean);
          } else if (endpoint === 'community') {
            items = (data.contents || []).map((item: any) => {
              const p = item.post;
              if (!p) return null;
              return {
                id: p.postId,
                authorText: p.author?.title || channel.snippet?.title,
                authorThumbnail: p.author?.avatar?.[0]?.url || channel.snippet?.thumbnails?.default?.url,
                contentText: p.text || "",
                publishedTimeText: p.publishedTimeText || "",
                likesCount: p.stats?.likes || "",
                commentsCount: p.stats?.comments || "",
                attachment: p.attachment?.image ? {
                  type: 'image',
                  imageUrls: p.attachment.image.map((img: any) => img.source?.[img.source.length - 1]?.url || img.source?.[0]?.url).filter(Boolean)
                } : p.attachment?.poll ? {
                  type: 'poll',
                  choices: p.attachment.poll.choices?.map((c: any) => c.text) || []
                } : p.attachment?.video ? {
                  type: 'video',
                  videoId: p.attachment.video.videoId,
                  title: p.attachment.video.title,
                  thumbnail: p.attachment.video.thumbnails?.[p.attachment.video.thumbnails.length - 1]?.url
                } : null
              };
            }).filter(Boolean);
          }

          setTabData(prev => {
            const existingIds = new Set(prev[currentTab].map((item: any) => item.id));
            const newItems = items.filter((item: any) => !existingIds.has(item.id));
            return { ...prev, [currentTab]: [...prev[currentTab], ...newItems] };
          });
          setTabNextPageToken(prev => ({ ...prev, [currentTab]: data.cursorNext }));
          setTabLoading(prev => ({ ...prev, [currentTab]: false }));
          return;
        }
      }
    } catch (e) {
      console.error("RapidAPI loadMore fetch error:", e);
    }

    // Fallback
    let result;
    if (currentTab === "סרטונים" || currentTab === "דף הבית") {
      result = await getVideosByChannel(channel.id, tabNextPageToken[currentTab], currentTab === "סרטונים" ? sort : 'newest');
    } else if (currentTab === "שורטס") {
      result = await getChannelShorts(channel.id, tabNextPageToken[currentTab], shortsSort);
    } else if (currentTab === "לייבים") {
      result = await getChannelLiveStreams(channel.id, tabNextPageToken[currentTab], liveSort);
    } else if (currentTab === "פלייליסטים") {
      result = await getChannelPlaylists(channel.id, tabNextPageToken[currentTab]);
    } else if (currentTab === "פוסטים") {
      result = await getChannelCommunity(channel.id, tabNextPageToken[currentTab]);
    }

    if (result) {
      setTabData(prev => {
        let newData = [...prev[currentTab], ...(result.items || [])];
        return { ...prev, [currentTab]: newData };
      });
      setTabNextPageToken(prev => ({ ...prev, [currentTab]: result.nextPageToken }));
    }
    setTabLoading(prev => ({ ...prev, [currentTab]: false }));
  }, [activeTab, tabLoading, tabNextPageToken, channel.id, sort, shortsSort, liveSort]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastTabElementRef = useCallback((node: HTMLDivElement | null) => {
    if (tabLoading[activeTab] || !tabNextPageToken[activeTab]) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreTab();
      }
    }, { threshold: 0.1, rootMargin: '400px' });
    if (node) observer.current.observe(node);
  }, [tabLoading, tabNextPageToken, activeTab, loadMoreTab]);

  if (initialLoading && initialVideos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-32">
        <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
      </div>
    );
  }
  
  const channelAvatar = channel.avatarUrl || channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${channel.id || 'channel'}/400/400`;

  return (
    <div className="flex flex-col bg-[var(--background)] min-h-full">
      <div className="w-full px-4 sm:px-6 pt-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="w-full h-32 sm:h-44 md:h-56 bg-[var(--secondary)] overflow-hidden relative rounded-2xl">
            {bannerUrl ? (
              <img 
                src={bannerUrl} 
                alt="Banner" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-gray-300 opacity-30">
                  <Image size={120} strokeWidth={0.5} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className="relative group">
          <img 
            src={channelAvatar} 
            alt={channel.snippet?.title || "Channel"} 
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-[var(--background)] shadow-md object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://picsum.photos/seed/${channel.id || 'channel'}/400/400`;
            }}
          />
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-right flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">{channel.snippet?.title || "ערוץ"}</h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-base text-[var(--muted)] mt-2">
            {(channelDetails.snippet?.customUrl || channel.snippet?.customUrl) && (
              <><span>{channelDetails.snippet?.customUrl || channel.snippet?.customUrl}</span><span>•</span></>
            )}
            {(() => {
              const vidVal = channelDetails.statistics?.videoCount
                || channel.statistics?.videoCount;
              const subVal = channelDetails.statistics?.subscriberCount
                || channel.statistics?.subscriberCount
                || channel.stats?.subscribersText
                || channel.stats?.subscribers
                || channel.stats?.subscriberCountText
                || channel.subscriberCount
                || channel.subscribersCount;
              const formattedVid = formatCount(vidVal);
              const formattedSub = formatSubscribers(subVal);
              return (
                <>
                  {formattedVid && (
                    <span>{"סרטונים: "}<span className="font-semibold text-[var(--foreground)]">{formattedVid}</span></span>
                  )}
                  {formattedVid && formattedSub && <span>•</span>}
                  {formattedSub && (
                    <span>{"מנויים: "}<span className="font-semibold text-[var(--foreground)]">{formattedSub}</span></span>
                  )}
                </>
              );
            })()}
          </div>
          <p className="text-base text-[var(--muted)] mt-4 line-clamp-2 max-w-3xl leading-relaxed">
            {channel.snippet?.description}
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button 
              onClick={toggleSubscribe}
              className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${isSubscribed ? 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'}`}
            >
              {isSubscribed ? 'רשום כמנוי' : 'הירשם כמנוי'}
            </button>
            {isSubscribed && (
              <button 
                onClick={toggleBell}
                className={`p-2.5 rounded-full transition-all ${isBellActive ? 'bg-[var(--secondary)] text-[var(--foreground)]' : 'hover:bg-[var(--secondary)] text-[var(--muted)]'}`}
              >
                {isBellActive ? <YouTubeBellActive size={22} /> : <YouTubeBell size={22} />}
              </button>
            )}
            <button className="bg-[var(--secondary)] px-8 py-2.5 rounded-full font-bold text-sm hover:bg-[var(--border)] transition-all text-[var(--foreground)]">
              הצטרפות
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-b border-[var(--border)] sticky top-[72px] z-40 shadow-sm backdrop-blur-md" style={{ backgroundColor: isDark ? 'rgba(15, 15, 15, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-10 overflow-x-auto no-scrollbar scroll-smooth">
          {["דף הבית", "סרטונים", "שורטס", "לייבים", "פלייליסטים", "פוסטים"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => {
                setActiveTab(tab);
                setViewingChannelPlaylist(null);
                setViewingChannelPlaylistVideos([]);
              }}
              className={`py-4 text-base font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer flex-shrink-0 ${activeTab === tab ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {activeTab === "דף הבית" ? (
          <div className="flex flex-col gap-12">
            {tabData["דף הבית"].length > 0 ? (
              <>
                <div className="flex flex-col md:flex-row gap-8 bg-[var(--secondary)] p-6 sm:p-8 rounded-3xl cursor-pointer hover:bg-[var(--border)] transition-all group" onClick={() => onVideoClick(tabData["דף הבית"][0])}>
                  <div className="w-full md:w-[500px] lg:w-[600px] aspect-video rounded-2xl overflow-hidden shadow-xl bg-[var(--secondary)] relative">
                    <VideoThumbnail 
                      video={tabData["דף הבית"][0]} 
                      alt="Featured" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <VideoFilterStatus videoId={typeof tabData["דף הבית"][0].id === 'string' ? tabData["דף הבית"][0].id : (tabData["דף הבית"][0].id?.videoId || "")} />
                  </div>
                  <div className="flex-1 flex flex-col gap-4 py-2">
                    <h2 className="text-2xl sm:text-3xl font-bold line-clamp-2 leading-tight transition-colors text-[var(--foreground)]">
                      {tabData["דף הבית"][0].snippet?.title || "סרטון"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)] font-medium">
                      <span>{formatCount(tabData["דף הבית"][0].snippet?.viewCount)} צפיות</span>
                      <span>•</span>
                      <span>{getRelativeTime(tabData["דף הבית"][0].snippet?.publishedAt)}</span>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--muted)] line-clamp-4 leading-relaxed mt-2">
                      {tabData["דף הבית"][0].snippet?.description}
                    </p>
                    <div className="mt-auto pt-4">
                      <button className="bg-[var(--foreground)] text-[var(--background)] px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-all">
                        צפה עכשיו
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">סרטונים שהועלו לאחרונה</h3>
                    <button 
                      onClick={() => setActiveTab("סרטונים")}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      הצג הכל
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-4 gap-y-12">
                    {tabData["דף הבית"].slice(1).map((video: any, index: number) => {
                      const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                      return (
                        <div key={vId + index}>
                          <VideoCard video={video} onClick={() => onVideoClick(video)} channelAvatar={channelAvatar} />
                        </div>
                      );
                    })}
                  </div>
                  {tabLoading["דף הבית"] && (
                    <div className="flex justify-center py-8">
                      <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                    </div>
                  )}
                  <div ref={lastTabElementRef} className="h-20 w-full mt-4" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                <PlaySquare size={64} strokeWidth={1.2} className="mb-6 opacity-10" />
                <p className="text-xl font-medium text-[var(--foreground)]">אין סרטונים להצגה בערוץ זה</p>
              </div>
            )}
          </div>
        ) : activeTab === "סרטונים" ? (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSort('newest')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${sort === 'newest' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}
              >
                הכי חדש
              </button>
              <button 
                onClick={() => setSort('popular')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${sort === 'popular' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}
              >
                פופולרי
              </button>
              <button 
                onClick={() => setSort('oldest')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${sort === 'oldest' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}
              >
                הכי ישן
              </button>
            </div>
            
            {tabLoading["סרטונים"] && tabData["סרטונים"].length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
              </div>
            ) : tabData["סרטונים"].length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-4 gap-y-12">
                  {tabData["סרטונים"].map((video: any, index: number) => {
                    const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                    return (
                      <div key={vId + index}>
                        <VideoCard video={video} onClick={() => onVideoClick(video)} channelAvatar={channelAvatar} />
                      </div>
                    );
                  })}
                </div>
                {tabLoading["סרטונים"] && (
                  <div className="flex justify-center py-8">
                    <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                  </div>
                )}
                <div ref={lastTabElementRef} className="h-20 w-full mt-4" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                <PlaySquare size={64} strokeWidth={1.2} className="mb-6 opacity-10" />
                <p className="text-xl font-medium">אין סרטונים להצגה</p>
              </div>
            )}
          </div>
        ) : activeTab === "שורטס" ? (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <button onClick={() => setShortsSort('newest')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${shortsSort === 'newest' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>הכי חדש</button>
              <button onClick={() => setShortsSort('popular')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${shortsSort === 'popular' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>פופולרי</button>
              <button onClick={() => setShortsSort('oldest')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${shortsSort === 'oldest' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>הכי ישן</button>
            </div>
            {tabLoading["שורטס"] && tabData["שורטס"].length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
              </div>
            ) : tabData["שורטס"].length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                  {tabData["שורטס"].map((video: any, index: number) => {
                    const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                    return (
                      <div key={vId + index} className="flex flex-col gap-2 cursor-pointer group" onClick={() => onVideoClick(video, tabData["שורטס"])}>
                        <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gray-200 relative">
                          <VideoThumbnail video={video} alt="Short" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-2 right-2 text-white text-xs font-bold drop-shadow-md">
                            {formatCount(video.snippet.viewCount)} צפיות
                          </div>
                          <VideoFilterStatus videoId={vId} />
                        </div>
                        <h3 className="text-sm font-bold line-clamp-2 leading-tight">{video.snippet.title}</h3>
                      </div>
                    );
                  })}
                </div>
                {tabLoading["שורטס"] && (
                  <div className="flex justify-center py-8">
                    <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                  </div>
                )}
                <div ref={lastTabElementRef} className="h-20 w-full mt-4" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                <PlaySquare size={64} strokeWidth={1.2} className="mb-6 opacity-10" />
                <p className="text-xl font-medium">אין סרטוני Shorts להצגה</p>
              </div>
            )}
          </div>
        ) : activeTab === "לייבים" ? (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <button onClick={() => setLiveSort('newest')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${liveSort === 'newest' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>הכי חדש</button>
              <button onClick={() => setLiveSort('popular')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${liveSort === 'popular' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>פופולרי</button>
              <button onClick={() => setLiveSort('oldest')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${liveSort === 'oldest' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'}`}>הכי ישן</button>
            </div>
            {tabLoading["לייבים"] && tabData["לייבים"].length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
              </div>
            ) : tabData["לייבים"].length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-4 gap-y-12">
                  {tabData["לייבים"].map((video: any, index: number) => {
                    const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || "");
                    return (
                      <div key={vId + index}>
                        <VideoCard video={video} onClick={() => onVideoClick(video)} channelAvatar={channelAvatar} />
                      </div>
                    );
                  })}
                </div>
                {tabLoading["לייבים"] && (
                  <div className="flex justify-center py-8">
                    <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                  </div>
                )}
                <div ref={lastTabElementRef} className="h-20 w-full mt-4" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                <Radio size={64} strokeWidth={1.2} className="mb-6 opacity-10" />
                <p className="text-xl font-medium">אין שידורים חיים להצגה</p>
              </div>
            )}
          </div>
        ) : activeTab === "פלייליסטים" ? (
          <div className="flex flex-col gap-8">
            {viewingChannelPlaylist ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 mb-4">
                  <button 
                    onClick={() => {
                      setViewingChannelPlaylist(null);
                      setViewingChannelPlaylistVideos([]);
                    }}
                    className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors"
                  >
                    <ArrowRight size={24} />
                  </button>
                  <h2 className="text-2xl font-bold">{viewingChannelPlaylist.title}</h2>
                </div>
                
                {isLoadingChannelPlaylistVideos ? (
                  <div className="flex justify-center py-20">
                    <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                  </div>
                ) : viewingChannelPlaylistVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                    {viewingChannelPlaylistVideos.map((video, index) => (
                      <VideoCard key={video.id.videoId + index} video={video} onClick={() => onVideoClick(video)} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                    <p className="text-xl font-medium">אין סרטונים בפלייליסט זה</p>
                  </div>
                )}
              </div>
            ) : tabLoading["פלייליסטים"] && tabData["פלייליסטים"].length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
              </div>
            ) : tabData["פלייליסטים"].length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                  {tabData["פלייליסטים"].map((playlist: any, index: number) => (
                    <PlaylistCard 
                      key={playlist.id + index} 
                      playlist={playlist} 
                      onClick={async () => {
                        setViewingChannelPlaylist(playlist);
                        setIsLoadingChannelPlaylistVideos(true);
                        const result = await getPlaylistVideosFromAPI(playlist.id);
                        setViewingChannelPlaylistVideos(result.items || []);
                        setIsLoadingChannelPlaylistVideos(false);
                      }}
                    />
                  ))}
                </div>
                {tabLoading["פלייליסטים"] && (
                  <div className="flex justify-center py-8">
                    <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                  </div>
                )}
                <div ref={lastTabElementRef} className="h-20 w-full mt-4" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                <ListMusic size={64} strokeWidth={1.2} className="mb-6 opacity-10" />
                <p className="text-xl font-medium">אין פלייליסטים להצגה</p>
              </div>
            )}
          </div>
        ) : activeTab === "פוסטים" ? (
          <div className="flex flex-col gap-8">
            {tabLoading["פוסטים"] && tabData["פוסטים"].length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
              </div>
            ) : tabData["פוסטים"].length > 0 ? (
              <>
                <div className="flex flex-col gap-6">
                  {tabData["פוסטים"].map((post: any, index: number) => (
                    <PostCard key={post.id + index} post={post} channel={channel} />
                  ))}
                </div>
                {tabLoading["פוסטים"] && (
                  <div className="flex justify-center py-8">
                    <div className="spinner"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>
                  </div>
                )}
                <div ref={lastTabElementRef} className="h-20 w-full mt-4" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                <Newspaper size={64} strokeWidth={1.2} className="mb-6 opacity-10" />
                <p className="text-xl font-medium">אין פוסטים להצגה</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}



function ChannelCard({ channel, onClick, isSubscribed, onSubscribe }: { channel: any, onClick: () => void, isSubscribed?: boolean, onSubscribe?: (e: React.MouseEvent) => void }) {
  const channelAvatar = channel.avatarUrl || channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || `https://picsum.photos/seed/${channel.id?.channelId || channel.id || 'channel'}/400/400`;
  const subs = channel.statistics?.subscriberCount || '';
  const subsText = subs ? `${subs} מנויים • ` : "";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer group max-w-5xl mx-auto p-4 w-full" onClick={onClick} dir="rtl">
      
      {/* Right side: Avatar */}
      <div className="flex-shrink-0">
        <img 
          src={channelAvatar} 
          alt={channel.snippet?.title || "Channel"} 
          className="h-32 w-32 sm:h-36 sm:w-36 rounded-full group-hover:scale-105 transition-transform object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://picsum.photos/seed/${channel.id?.channelId || 'channel'}/400/400`;
          }}
        />
      </div>

      {/* Middle: Info */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-right flex-1 sm:px-8">
        <h2 className="text-2xl sm:text-3xl font-medium transition-colors text-[var(--foreground)]">{channel.snippet?.title || "ערוץ"}</h2>
        <p className="text-sm sm:text-base text-[var(--muted)] mt-1">
          {subsText}{channel.snippet?.customUrl || `@${channel.snippet?.title?.replace(/\s+/g,'')}`}
        </p>
        <p className="text-[14px] sm:text-[15px] text-[var(--muted)] mt-3 hidden sm:line-clamp-2 leading-relaxed" style={{ direction: 'ltr', textAlign: 'right' }}>
          {channel.snippet?.description}
        </p>
      </div>

      {/* Left side: Subscribe Button */}
      <div className="flex-shrink-0 mt-4 sm:mt-0 sm:mr-auto sm:pr-8 md:pr-16">
        <button 
          onClick={onSubscribe}
          className={`px-8 py-3.5 sm:px-12 sm:py-3.5 rounded-full font-bold text-[17px] sm:text-[19px] transition-all ${isSubscribed ? 'bg-[var(--secondary)] text-[var(--foreground)]' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'}`}
        >
          {isSubscribed ? 'רשום כמנוי' : 'הרשמה למינוי'}
        </button>
      </div>
    </div>
  );
}

function SearchVideoCard({ video, onClick, onChannelClick, videoProgress, onToggleReport, isReportSelected, compact, extraCompact, contextType = 'search_reg' }: { video: YouTubeVideo, onClick: () => void, onChannelClick?: () => void, key?: string, videoProgress?: { currentTime: number; duration: number }, onToggleReport?: (video: YouTubeVideo) => void, isReportSelected?: boolean, compact?: boolean, extraCompact?: boolean, contextType?: YoutubeMenuType }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use stored duration if available (more reliable), fallback to parsing snippet
  const _vidDurSecs = (videoProgress?.duration && videoProgress.duration > 10) 
    ? videoProgress.duration 
    : parseDurationSecs(video.snippet?.duration);
  const progressPct = videoProgress && videoProgress.currentTime > 5 && _vidDurSecs > 0 ? Math.min(98, (videoProgress.currentTime / _vidDurSecs) * 100) : 0;
  return (
    <motion.div 
      whileHover={{ scale: 1.002 }}
      className={`relative flex flex-col sm:flex-row ${compact || extraCompact ? 'gap-3 sm:gap-4' : 'gap-6'} cursor-pointer group bg-[var(--background)] rounded-2xl transition-all p-2 hover:bg-[var(--secondary)] w-full`}
      dir="rtl"
      onClick={onClick}
      style={{ zIndex: showMenu ? 2300 : undefined }}
    >
      <div className={`relative w-full ${extraCompact ? 'sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px]' : compact ? 'sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[320px]' : 'sm:w-[365px] md:w-[400px] lg:w-[438px] xl:w-[495px]'} flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-[var(--secondary)] shadow-sm`}>
        <VideoThumbnail 
          video={video} 
          alt={video.snippet?.title || "Video"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {onToggleReport && (
          <NetFreeReportButton video={video} isSelected={!!isReportSelected} onToggle={onToggleReport} />
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded font-medium">
          {video.snippet.duration || "15:20"}
        </div>
        <VideoFilterStatus videoId={typeof video.id === 'string' ? video.id : (video.id?.videoId || "")} />
        {progressPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-gray-500/50" style={{ direction: 'ltr' }}>
            <div className="h-full transition-none rounded-r-sm" style={{ width: `${progressPct}%`, backgroundColor: '#FF0033' }} />
          </div>
        )}
      </div>
      <div className={`flex flex-col ${extraCompact ? 'gap-1' : 'gap-2'} flex-1 py-1 sm:py-2 px-2 overflow-hidden`}>
        <h3 className={`${extraCompact ? 'text-[1.0rem] sm:text-[1.1rem]' : compact ? 'text-[1.2rem] sm:text-[1.3rem]' : 'text-[1.4rem] sm:text-[1.8rem] md:text-[2.1rem]'} ${compact ? 'font-semibold' : 'font-medium'} line-clamp-2 leading-tight text-[var(--foreground)] transition-colors`}>
          {video.snippet?.title || "סרטון"}
        </h3>
          <div className={`${extraCompact ? 'text-[0.9rem]' : 'text-[1.15rem]'} text-[var(--muted)] flex items-center gap-1`}>
            <span>{video.snippet.viewCount ? (String(video.snippet.viewCount).includes('צפיות') ? video.snippet.viewCount : `${formatCount(video.snippet.viewCount)} צפיות`) : ""}</span>
            {video.snippet.viewCount && <span>•</span>}
            <span>{getRelativeTime(video.snippet.publishedAt)}</span>
          </div>
        <div className={`flex items-center ${extraCompact ? 'gap-2 mt-0.5 mb-1' : 'gap-3 mt-1 mb-2'}`} onClick={(e) => { e.stopPropagation(); onChannelClick?.(); }}>
          <div className={`${extraCompact ? 'h-6 w-6' : 'h-10 w-10'} bg-[var(--secondary)] rounded-full flex items-center justify-center font-bold text-[var(--muted)] text-xs overflow-hidden border border-[var(--border)]`}>
            {video.channelThumbnail && video.channelThumbnail !== "" ? (
              <img 
                src={video.channelThumbnail} 
                alt="Channel" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`;
                }}
              />
            ) : (
              <img src={`https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`} alt="Channel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
          <span className="hover:text-[var(--foreground)] transition-colors text-[1.1rem] font-medium text-[var(--muted)]">{video.snippet.channelTitle}</span>
        </div>
        <p className="text-[14px] text-[var(--muted)] truncate hidden md:block max-w-2xl mb-1">
          {video.snippet.description}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {video.snippet.liveBroadcastContent === 'live' && <span className="px-1.5 py-0.5 bg-red-600/10 text-red-500 text-[10px] font-bold rounded">שידור חי</span>}
          {(video as any).contentDetails?.definition === 'hd' && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">HD</span>}
          {((video as any).contentDetails?.definition === '4k' || video.snippet.title.toLowerCase().includes('4k')) && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">4K</span>}
          {((video as any).contentDetails?.caption === 'true' || video.snippet.description?.toLowerCase().includes('cc')) && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">כתוביות</span>}
          {video.snippet.description?.toLowerCase().includes('creative commons') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">Creative Commons</span>}
          {video.snippet.description?.toLowerCase().includes('360') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">360°</span>}
          {video.snippet.description?.toLowerCase().includes('vr180') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">VR180</span>}
          {video.snippet.description?.toLowerCase().includes('3d') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">תלת ממד</span>}
          {video.snippet.description?.toLowerCase().includes('hdr') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">HDR</span>}
          {video.snippet.description?.toLowerCase().includes('location') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">מיקום</span>}
          {video.snippet.description?.toLowerCase().includes('purchased') && <span className="px-1.5 py-0.5 bg-[var(--secondary)] text-[var(--muted)] text-[10px] font-bold rounded">נרכש</span>}
        </div>
      </div>
      <div className="absolute left-2 top-3 z-10" ref={menuRef}>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
          aria-label="תפריט פעולות"
          className="p-2 rounded-full hover:bg-[var(--border)] text-[var(--foreground)] transition-colors inline-flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{pointerEvents: 'none', display: 'inherit', width: '24px', height: '24px', fill: 'currentColor'}}><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
        </button>
        {showMenu && <YoutubeMenu type={contextType} onClose={() => setShowMenu(false)} />}
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active = false, full = true, onClick }: { icon: React.ReactNode, label: string, active?: boolean, full?: boolean, onClick?: () => void }) {
  // Clone element to increase icon size slightly when sidebar is fully open, and forward the active prop so icons can render their filled variant
  const enhancedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as any, { ...(full ? { size: 26 } : {}), active })
    : icon;

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${
      active ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--secondary)]'
    } ${!full ? 'justify-center px-0' : ''}`}>
      <div className="text-[var(--foreground)]">{enhancedIcon}</div>
      {full && <span className="text-[14px] text-[var(--foreground)]">{label}</span>}
    </div>
  );
}

function ProfileMenuItem({ icon, label, onClick, rightIcon }: { icon: React.ReactNode, label: string, onClick?: () => void, rightIcon?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-2 hover:bg-[var(--secondary)] transition-colors text-right text-[14px] text-[var(--foreground)]"
    >
      <div className="text-[var(--foreground)] opacity-90 flex-shrink-0">
        {icon}
      </div>
      <span className="flex-1 truncate">{label}</span>
      {rightIcon && (
        <div className="text-[var(--foreground)] opacity-70 flex-shrink-0 ml-2">
          {rightIcon}
        </div>
      )}
    </button>
  );
}

function MusicVideoCard({ video, onClick, onChannelClick }: { video: YouTubeVideo, onClick: () => void, onChannelClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="flex flex-col gap-2 cursor-pointer group bg-[#1a1a2e]/60 hover:bg-[#2a1a4a]/80 p-3 rounded-2xl transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a2e] shadow-lg">
        <VideoThumbnail 
          video={video}
          alt={video.snippet?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-purple-600/90 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={20} className="text-white fill-white ml-0.5" />
          </div>
        </div>
        {video.snippet.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
            {video.snippet.duration}
          </div>
        )}
        <VideoFilterStatus videoId={typeof video.id === 'string' ? video.id : (video.id?.videoId || "")} />
      </div>
      
      <div className="px-1">
        <h3 className="text-[13px] font-semibold line-clamp-2 leading-tight text-white/90 group-hover:text-white transition-colors">
          {video.snippet?.title || "סרטון"}
        </h3>
        <p
          className="text-[11px] text-purple-300/70 mt-1 truncate hover:text-purple-300 cursor-pointer transition-colors"
          onClick={(e) => { e.stopPropagation(); onChannelClick?.(); }}
        >
          {video.snippet.channelTitle}
        </p>
        {video.snippet.viewCount && (
          <p className="text-[10px] text-white/30 mt-0.5">
            {String(video.snippet.viewCount).includes('צפיות') ? video.snippet.viewCount : `${formatCount(video.snippet.viewCount)} צפיות`}
          </p>
        )}
      </div>
    </motion.div>
  );
}


function ShortCard({ video, onClick, onChannelClick, videoProgress, contextType = 'shorts' }: { video: YouTubeVideo, onClick: () => void, onChannelClick?: () => void, key?: string, videoProgress?: { currentTime: number; duration: number }, contextType?: YoutubeMenuType }) {
  const thumbUrl = video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url;
  const dominantColor = useDominantColor(thumbUrl);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use stored duration if available (more reliable), fallback to parsing snippet
  const _vidDurSecs = (videoProgress?.duration && videoProgress.duration > 10) 
    ? videoProgress.duration 
    : parseDurationSecs(video.snippet?.duration);
  const progressPct = videoProgress && videoProgress.currentTime > 5 && _vidDurSecs > 0 ? Math.min(98, (videoProgress.currentTime / _vidDurSecs) * 100) : 0;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="relative flex flex-col gap-2 cursor-pointer group w-full p-1 rounded-2xl transition-all duration-300"
      onClick={onClick}
      style={{ zIndex: showMenu ? 2300 : undefined }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: dominantColor }}
      />
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-[var(--secondary)] w-full shadow-sm">
        <VideoThumbnail 
          video={video} 
          alt={video.snippet?.title || "Short"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          שורטס
        </div>
        <VideoFilterStatus videoId={typeof video.id === 'string' ? video.id : (video.id?.videoId || "")} />
        {progressPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-gray-500/50" style={{ direction: 'ltr' }}>
            <div className="h-full transition-none rounded-r-sm" style={{ width: `${progressPct}%`, backgroundColor: '#FF0033' }} />
          </div>
        )}
      </div>
      <div className="flex justify-between items-start px-1 relative z-10 mt-2 gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-[16px] leading-[22px] font-medium line-clamp-2 text-[var(--foreground)] transition-colors">
            {video.snippet?.title || "שורטס"}
          </h3>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            {video.snippet.viewCount ? String(video.snippet.viewCount).replace(/views/i, '').replace(/צפיות/i,'').trim() + " צפיות" : "אין צפיות"}
          </p>
        </div>
        <div className="relative self-start" ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
            aria-label="פעולות נוספות"
            className="p-1.5 -mr-1.5 -mt-1 rounded-full hover:bg-[var(--border)] text-[var(--foreground)] transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{pointerEvents: 'none', display: 'inherit', width: '24px', height: '24px', fill: 'currentColor'}}><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
          </button>
          {showMenu && <YoutubeMenu type={contextType} onClose={() => setShowMenu(false)} />}
        </div>
      </div>
    </motion.div>
  );
}

type CheckTask = () => Promise<void>;

class VideoCheckQueue {
  private queue: { task: CheckTask, priority: boolean }[] = [];
  private activeCount = 0;
  private maxConcurrent = 12;

  add(task: CheckTask, priority: boolean = false) {
    if (priority) {
      this.queue.unshift({ task, priority });
    } else {
      this.queue.push({ task, priority });
    }
    this.processNext();
  }

  prioritize(task: CheckTask) {
    const index = this.queue.findIndex(item => item.task === task);
    if (index > 0) {
      const [item] = this.queue.splice(index, 1);
      this.queue.unshift(item);
    }
  }

  private processNext() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (item) {
      this.activeCount++;
      item.task().finally(() => {
        this.activeCount--;
        this.processNext();
      });
    }
  }
}

const videoCheckQueue = new VideoCheckQueue();

export const videoStatusCache = new Map<string, 'open' | 'blocked' | 'unknown'>();

const checkNetFreeStatus = async (videoId: string) => {
  try {
    const youtubeUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
    const res = await fetch(`https://www.google.com/~netfree/test-url?u=${youtubeUrl}&h=000000000000000000`);
    if (res.ok) {
      const data = await res.json();
      const block = data.block;
      if (block === 'deny' || block === 'custom') return 'blocked';
      if (block === 'unknown' || block === 'unknown-video' || block === 'indev') return 'unknown';
      if (block === '' || block === undefined || block === null) return 'open';
      return 'blocked';
    }
  } catch (e) {}
  return null;
};

const checkHtmlStatus = async (videoId: string): Promise<'open' | 'blocked' | 'unknown' | null> => {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const text = await res.text();
    
    if (text.includes('שלח את הוידאו לבדיקה') || text.includes('submit video for review') || text.includes('video-tov')) {
      return 'unknown';
    }
    if (text.includes('netfree') || text.includes('חסום') || text.includes('block') || text.includes('NetFree')) {
      return 'blocked';
    }
  } catch (e) {
    // CORS error means it's likely open (YouTube blocks CORS) or NetFree blocked without CORS
  }
  return null;
};

const VideoFilterStatus = ({ videoId }: { videoId: string }) => {
  const [status, setStatus] = useState<'checking' | 'open' | 'blocked' | 'unknown'>(videoStatusCache.get(videoId) || 'checking');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoId) return;
    
    if (videoStatusCache.has(videoId)) {
      setStatus(videoStatusCache.get(videoId)!);
      return;
    }

    // Check localStorage persisted filter statuses first
    try {
      const raw = localStorage.getItem('video_filter_status_v1');
      if (raw) {
        const map = JSON.parse(raw);
        if (map[videoId] === 'open' || map[videoId] === 'blocked') {
          videoStatusCache.set(videoId, map[videoId]);
          setStatus(map[videoId]);
          return;
        }
      }
    } catch (_) {}
    
    let player: any;
    let resolved = false;
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    let isMounted = true;
    let resolvePromise: (() => void) | null = null;

    const updateStatus = (newStatus: 'open' | 'blocked' | 'unknown') => {
      videoStatusCache.set(videoId, newStatus);
      if (isMounted) setStatus(newStatus);
      // Only persist open/blocked — not unknown
      if (newStatus === 'open' || newStatus === 'blocked') {
        try {
          const raw = localStorage.getItem('video_filter_status_v1');
          const map = raw ? JSON.parse(raw) : {};
          map[videoId] = newStatus;
          localStorage.setItem('video_filter_status_v1', JSON.stringify(map));
          // Async sync to backend
          saveFilterStatus(videoId, newStatus).catch(() => {});
        } catch (_) {}
      }
    };

    const checkStatusTask = () => new Promise<void>(async (resolveTask) => {
      resolvePromise = resolveTask;
      if (!isMounted) {
        resolveTask();
        return;
      }

      if (videoStatusCache.has(videoId)) {
        updateStatus(videoStatusCache.get(videoId)!);
        resolveTask();
        return;
      }

      // 1. Try NetFree API first (Fastest and most accurate if on NetFree)
      const nfStatus = await checkNetFreeStatus(videoId);
      if (nfStatus && isMounted) {
        resolved = true;
        updateStatus(nfStatus);
        resolveTask();
        return;
      }

      // 2. Try HTML parsing (NetFree block pages)
      const htmlStatus = await checkHtmlStatus(videoId);
      if (htmlStatus && isMounted) {
        resolved = true;
        updateStatus(htmlStatus);
        resolveTask();
        return;
      }

      // 3. Fallback to YouTube Player API
      const checkStatus = () => {
        if (!(window as any).YT || !(window as any).YT.Player) {
          if (retryCount < 15) {
            retryCount++;
            timeoutId = setTimeout(checkStatus, 200);
          } else {
            if (!resolved) {
              resolved = true;
              updateStatus('unknown'); // Fallback to unknown if we can't verify
              resolveTask();
            }
          }
          return;
        }

        const playerId = `yt-check-${videoId}-${Math.random().toString(36).substring(2, 9)}`;
        if (containerRef.current) {
          const div = document.createElement('div');
          div.id = playerId;
          div.style.display = 'none';
          containerRef.current.appendChild(div);

          try {
            player = new (window as any).YT.Player(playerId, {
              height: '1',
              width: '1',
              videoId: videoId,
              playerVars: {
                autoplay: 0,
                controls: 0,
                rel: 0,
                origin: window.location.origin
              },
              events: {
                onReady: () => {
                  if (resolved) return;
                  resolved = true;
                  updateStatus('open');
                  resolveTask();
                },
                onStateChange: (event: any) => {
                  if (resolved) return;
                  if (event.data === (window as any).YT.PlayerState.CUED || event.data === (window as any).YT.PlayerState.PLAYING) {
                    resolved = true;
                    updateStatus('open');
                    resolveTask();
                  }
                },
                onError: () => {
                  if (resolved) return;
                  resolved = true;
                  updateStatus('blocked');
                  resolveTask();
                }
              }
            });
          } catch (e) {
            if (!resolved) {
              resolved = true;
              updateStatus('unknown');
              resolveTask();
            }
          }

          timeoutId = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              // If it times out, we assume it's unknown because the HTML check would have caught blocked ones.
              updateStatus('unknown');
              resolveTask();
            }
          }, 3000);
        } else {
          resolveTask();
        }
      };

      checkStatus();
    });

    if (!(window as any).YT) {
      if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
    
    videoCheckQueue.add(checkStatusTask);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        videoCheckQueue.prioritize(checkStatusTask);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      resolved = true;
      clearTimeout(timeoutId);
      observer.disconnect();
      if (player && player.destroy) {
        try { player.destroy(); } catch (e) {}
      }
      if (resolvePromise) {
        resolvePromise();
      }
    };
  }, [videoId]);

  return (
    <div ref={containerRef} className="absolute bottom-2 left-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 z-10" title={status === 'checking' ? 'בודק...' : status === 'open' ? 'פתוח' : status === 'blocked' ? 'לא זמין / חסום' : 'לא ניתן לאמת'}>
      {status === 'checking' && <Loader2 size={12} className="animate-spin" />}
      {status === 'open' && <Check size={12} className="text-green-400" />}
      {status === 'blocked' && <X size={12} className="text-red-400" />}
      {status === 'unknown' && <HelpCircle size={12} className="text-yellow-400" />}
    </div>
  );
};

// ─── NetFree Report Button (appears on hover over video cards) ───────────────
function NetFreeReportButton({ video, isSelected, onToggle }: {
  video: YouTubeVideo; isSelected: boolean; onToggle: (video: YouTubeVideo) => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(video); }}
      title={isSelected ? 'בטל בחירה' : 'שלח לבדיקה בנטפרי'}
      className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md
        ${isSelected
          ? 'bg-amber-500 text-white opacity-100 scale-100'
          : 'bg-black/70 text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
        }`}
    >
      {isSelected ? <Check size={14} strokeWidth={3} /> : <Flag size={13} strokeWidth={2} />}
    </button>
  );
}

// ─── Floating NetFree submit bar (appears when videos are selected) ───────────
function FloatingNetFreeBar({ videos, onClear }: { videos: YouTubeVideo[]; onClear: () => void }) {
  const [sent, setSent] = useState(false);

  if (videos.length === 0) return null;

  const handleSend = () => {
    const urls = videos.map(v => {
      const id = typeof v.id === 'string' ? v.id : (v.id?.videoId || '');
      return `https://www.youtube.com/watch?v=${id}`;
    }).join('\n');

    const subject = videos.length === 1
      ? `בקשה לבדיקת סרטון: ${videos[0].snippet?.title?.slice(0, 60)}`
      : `בקשה לבדיקת ${videos.length} סרטונים`;

    const body = `שלום,\n\nאנא בדקו את הסרטונים הבאים:\n\n${urls}\n\nהסרטונים הללו ייתכן שלא עברו בדיקה מתאימה. אשמח אם תבדקו אותם ותודיעו על תוצאת הבדיקה.\n\nתודה רבה.`;

    navigator.clipboard.writeText(`${subject}\n\n${body}`).catch(() => {});
    setSent(true);
    window.open('https://netfree.link/app/#/tickets/new', '_blank', 'noopener');
    setTimeout(() => { setSent(false); onClear(); }, 3000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 bg-[#1a1a1a] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Flag size={13} className="fill-white text-white" />
          </div>
          <span className="text-sm font-semibold">{videos.length} סרטון{videos.length > 1 ? 'ים' : ''} נבחר{videos.length > 1 ? 'ו' : ''}</span>
        </div>
        <button
          onClick={handleSend}
          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          {sent ? 'נשלח! ✓' : 'שלח לבדיקה בנטפרי'}
        </button>
        <button onClick={onClear} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoSkeleton({ largeMode = false }: { largeMode?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 w-full animate-pulse ${largeMode ? 'mb-8' : ''}`}>
      <div className={`w-full bg-[var(--border)] rounded-xl relative ${largeMode ? 'aspect-[16/9]' : 'aspect-video'}`}></div>
      <div className="flex gap-3 mt-1">
        <div className="w-9 h-9 rounded-full bg-[var(--border)] flex-shrink-0"></div>
        <div className="flex flex-col gap-2 flex-grow overflow-hidden pt-1">
          <div className="h-4 bg-[var(--border)] rounded w-11/12"></div>
          <div className="h-4 bg-[var(--border)] rounded w-3/4"></div>
          <div className="h-3 bg-[var(--border)] rounded w-1/2 mt-1"></div>
        </div>
      </div>
    </div>
  );
}

function VideoSkeletonGrid({ count = 8, largeMode = false }: { count?: number, largeMode?: boolean }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5 gap-y-8 mt-8 w-full`}>
      {Array(count).fill(0).map((_, i) => (
        <VideoSkeleton key={i} largeMode={largeMode} />
      ))}
    </div>
  );
}

function VideoCard({ video, onClick, onChannelClick, channelAvatar, videoProgress, onToggleReport, isReportSelected, largeMode = false, contextType = 'home' }: { video: YouTubeVideo, onClick: () => void, onChannelClick?: () => void, key?: string, channelAvatar?: string, videoProgress?: { currentTime: number; duration: number }, onToggleReport?: (video: YouTubeVideo) => void, isReportSelected?: boolean, largeMode?: boolean, contextType?: YoutubeMenuType }) {
  const thumbUrl = video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url;
  const dominantColor = useDominantColor(thumbUrl);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Use stored duration if available (more reliable), fallback to parsing snippet
  const _vidDurSecs = (videoProgress?.duration && videoProgress.duration > 10) 
    ? videoProgress.duration 
    : parseDurationSecs(video.snippet?.duration);
  const progressPct = videoProgress && videoProgress.currentTime > 5 && _vidDurSecs > 0 ? Math.min(98, (videoProgress.currentTime / _vidDurSecs) * 100) : 0;

  // ─── Hover preview (only for 'open' / ✓ videos) ────────────────────────
  const vId = typeof video.id === 'string' ? video.id : (video.id?.videoId || '');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpenVideo = videoStatusCache.get(vId) === 'open';

  const handleMouseEnter = () => {
    if (!isOpenVideo) return;
    hoverTimerRef.current = setTimeout(() => setShowPreview(true), 900);
  };
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    setShowPreview(false);
    setPreviewMuted(true);
  };

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="relative flex flex-col gap-3 cursor-pointer group w-full p-2 rounded-2xl transition-all duration-300"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: showMenu ? 2300 : undefined }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: dominantColor }}
      />
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--secondary)] w-full shadow-sm">
        <VideoThumbnail 
          video={video} 
          alt={video.snippet?.title || "Video"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ─── Hover preview iframe ─── */}
        {showPreview && isOpenVideo && vId && (
          <div className="absolute inset-0 z-20 bg-black rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${vId}?autoplay=1&mute=${previewMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&showinfo=0`}
              className="w-full h-full pointer-events-none"
              allow="autoplay; encrypted-media"
              title="preview"
            />
            {/* Preview controls overlay */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div />
              <div className="flex items-center justify-between px-2 pb-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setPreviewMuted(m => !m)}
                  className="bg-black/80 text-white p-1.5 rounded-full hover:bg-black transition-colors"
                  title={previewMuted ? 'הפעל קול' : 'השתק'}
                >
                  {previewMuted ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={onClick}
                  className="bg-black/80 text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-black transition-colors"
                >
                  צפה
                </button>
              </div>
            </div>
          </div>
        )}

        {onToggleReport && (
          <NetFreeReportButton video={video} isSelected={!!isReportSelected} onToggle={onToggleReport} />
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded font-medium">
          {video.snippet.duration || "24:15"}
        </div>
        <VideoFilterStatus videoId={typeof video.id === 'string' ? video.id : (video.id?.videoId || "")} />
        {progressPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-gray-500/50" style={{ direction: 'ltr' }}>
            <div className="h-full transition-none rounded-r-sm" style={{ width: `${progressPct}%`, backgroundColor: '#FF0033' }} />
          </div>
        )}
      </div>
      <div className="flex gap-3 px-1 relative z-10">
        {!channelAvatar && (
          <div 
            onClick={(e) => { e.stopPropagation(); onChannelClick?.(); }}
            className={`flex-shrink-0 ${largeMode ? 'h-14 w-14' : 'h-10 w-10'} bg-[var(--secondary)] rounded-full flex items-center justify-center font-bold text-[var(--muted)] text-sm hover:bg-[var(--secondary)] transition-all overflow-hidden border border-[var(--border)]`}
          >
            {video.channelThumbnail && video.channelThumbnail !== "" ? (
              <img 
                src={video.channelThumbnail} 
                alt="Channel" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`;
                }}
              />
            ) : (
              <img src={`https://picsum.photos/seed/${video.snippet.channelId || video.snippet.channelTitle}/100/100`} alt="Channel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-[16px] leading-[22px] font-normal line-clamp-2 text-[var(--foreground)] transition-colors">
            {video.snippet?.title || "סרטון"}
          </h3>
          <div className={`${largeMode ? 'text-[13px]' : 'text-[14px]'} text-[var(--muted)] flex flex-col mt-1`}>
            {/* Hide channel title when inside channel page */}
            {!channelAvatar && (
              <span className="hover:text-[var(--foreground)] transition-colors" onClick={(e) => { e.stopPropagation(); onChannelClick?.(); }}>{video.snippet.channelTitle}</span>
            )}
            <div className="flex items-center gap-1 text-[var(--muted)]">
              <span>{video.snippet.viewCount ? (String(video.snippet.viewCount).includes('צפיות') ? video.snippet.viewCount : `${formatCount(video.snippet.viewCount)} צפיות`) : ""}</span>
              {video.snippet.viewCount && <span>•</span>}
              <span>{getRelativeTime(video.snippet.publishedAt)}</span>
            </div>
          </div>
        </div>
        {/* Three-dot context menu */}
        <div className="relative self-start" ref={menuRef}>
          <button 
            className="p-1.5 hover:bg-[var(--secondary)] rounded-full transition-all text-[var(--muted)]"
            aria-label="פעולות נוספות"
            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{pointerEvents: 'none', display: 'inherit', width: '24px', height: '24px', fill: 'currentColor'}}><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
          </button>
          {showMenu && <YoutubeMenu type={contextType} onClose={() => setShowMenu(false)} />}
        </div>
      </div>
    </motion.div>
  );
}

// ─── PlaylistSaveModal ────────────────────────────────────────────────────────
interface PlaylistSaveModalProps {
  video: YouTubeVideo;
  playlists: any[];
  isInWatchLater: boolean;
  userEmail?: string;
  onClose: () => void;
  onWatchLater: (video: YouTubeVideo, isAdded: boolean) => void;
  onAddToPlaylist: (video: YouTubeVideo, playlistId: string) => Promise<void>;
  onRemoveFromPlaylist: (video: YouTubeVideo, playlistId: string) => Promise<void>;
  onCreatePlaylist: (video: YouTubeVideo, name: string) => Promise<any>;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
}

function PlaylistSaveModal({
  video, playlists, isInWatchLater, userEmail, onClose,
  onWatchLater, onAddToPlaylist, onRemoveFromPlaylist, onCreatePlaylist, onDeletePlaylist,
}: PlaylistSaveModalProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [videoInPlaylists, setVideoInPlaylists] = useState<Set<string>>(new Set());
  const [watchLaterChecked, setWatchLaterChecked] = useState(isInWatchLater);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (creating && inputRef.current) inputRef.current.focus(); }, [creating]);

  useEffect(() => {
    const checkPlaylists = async () => {
      if (!userEmail) return;
      const inPlaylists = new Set<string>();
      const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
      await Promise.all(playlists.map(async (pl) => {
        const videos = await getPlaylistVideos(userEmail, pl.id);
        if (videos.some((v: any) => {
          const vId = typeof v.id === 'string' ? v.id : v.id.videoId;
          return vId === videoId;
        })) {
          inPlaylists.add(pl.id);
        }
      }));
      setVideoInPlaylists(inPlaylists);
    };
    checkPlaylists();
  }, [userEmail, playlists, video]);

  const togglePlaylist = async (playlistId: string) => {
    setSaving(playlistId);
    const isCurrentlyIn = videoInPlaylists.has(playlistId);
    const next = new Set(videoInPlaylists);
    if (isCurrentlyIn) { 
      next.delete(playlistId); 
      await onRemoveFromPlaylist(video, playlistId);
    } else { 
      next.add(playlistId); 
      await onAddToPlaylist(video, playlistId); 
    }
    setVideoInPlaylists(next);
    setSaving(null);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving('new');
    
    // Create highly unlikely temp ID first to show checkmark instantly
    const optimisticTempId = 'optimistic_' + Date.now();
    setVideoInPlaylists(prev => {
      const next = new Set(prev);
      next.add(optimisticTempId);
      return next;
    });

    try {
      const result = await onCreatePlaylist(video, name);
      if (result) {
         setVideoInPlaylists(prev => {
           const next = new Set(prev);
           next.delete(optimisticTempId);
           next.add(result);
           return next;
         });
      }
    } finally {
      setSaving(null); setCreating(false); setNewName('');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.18 }}
          className="bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-sm overflow-hidden"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--foreground)]">שמור אל</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--muted)]">
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-[var(--secondary)]/50">
            <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--secondary)]">
              <VideoThumbnail video={video} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-medium line-clamp-2 text-[var(--foreground)]">{video.snippet?.title}</p>
          </div>

          <div className="px-2 py-3 max-h-72 overflow-y-auto">
            <button
              onClick={() => { const next = !watchLaterChecked; setWatchLaterChecked(next); onWatchLater(video, next); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-xl transition-colors group"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${watchLaterChecked ? 'bg-blue-600 border-blue-600' : 'border-[var(--muted)] group-hover:border-[var(--foreground)]'}`}>
                {watchLaterChecked && <Check size={12} strokeWidth={3} className="text-white" />}
              </div>
              <Clock size={18} strokeWidth={1.8} className="text-[var(--muted)] flex-shrink-0" />
              <span className="text-sm font-medium text-[var(--foreground)]">לצפייה בהמשך</span>
            </button>

            {playlists.length > 0 && <div className="border-t border-[var(--border)] my-2 mx-3" />}

            {playlists.map((pl: any) => {
              const isIn = videoInPlaylists.has(pl.id);
              const isSav = saving === pl.id;
              return (
                <button key={pl.id} onClick={() => !isSav && togglePlaylist(pl.id)} disabled={isSav}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-xl transition-colors group"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isIn ? 'bg-blue-600 border-blue-600' : 'border-[var(--muted)] group-hover:border-[var(--foreground)]'}`}>
                    {isIn && !isSav && <Check size={12} strokeWidth={3} className="text-white" />}
                    {isSav && <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0 bg-[var(--secondary)]">
                    {pl.thumbnail ? <img src={pl.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : <div className="w-full h-full flex items-center justify-center"><ListMusic size={14} className="text-[var(--muted)]" /></div>}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-[var(--foreground)] line-clamp-1">{pl.name}</p>
                    <p className="text-xs text-[var(--muted)]">{pl.videoCount} סרטונים</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--border)] px-2 py-3">
            {creating ? (
              <div className="flex items-center gap-2 px-3">
                <input ref={inputRef} type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); }}}
                  placeholder="שם הפלייליסט"
                  className="flex-1 px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  maxLength={60}
                />
                <button onClick={handleCreate} disabled={!newName.trim() || saving === 'new'}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving === 'new' ? '...' : 'צור'}
                </button>
                <button onClick={() => { setCreating(false); setNewName(''); }} className="p-2 hover:bg-[var(--secondary)] rounded-lg text-[var(--muted)]">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => setCreating(true)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--secondary)] rounded-xl transition-colors text-blue-600">
                <Plus size={20} strokeWidth={2} />
                <span className="text-sm font-bold">יצור פלייליסט חדש</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── UserPlaylistCard ─────────────────────────────────────────────────────────
interface UserPlaylistCardProps {
  playlist: { id: string; name: string; videoCount: number; thumbnail: string | null; createdAt?: string; description?: string; voting?: string };
  onClick: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onEdit: () => void | Promise<void>;
}

const UserPlaylistCard: React.FC<UserPlaylistCardProps> = ({ playlist, onClick, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  return (
    <div className="flex flex-col gap-2 cursor-pointer group" onClick={onClick}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--secondary)] shadow-sm">
        {/* Stack effect */}
        <div className="absolute top-0 left-2 right-2 h-2 bg-white/30 rounded-t-xl -translate-y-1" />
        <div className="absolute top-0 left-4 right-4 h-2 bg-white/20 rounded-t-xl -translate-y-2" />
        
        {playlist.thumbnail ? (
          <>
            <img 
              src={playlist.thumbnail} 
              alt={playlist.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('maxresdefault.jpg')) {
                  target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                } else if (target.src.includes('hqdefault.jpg')) {
                  target.src = target.src.replace('hqdefault.jpg', 'mqdefault.jpg');
                } else {
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                  target.nextElementSibling?.classList.add('flex');
                }
              }}
            />
            <div className="hidden w-full h-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <ListMusic size={32} strokeWidth={1.2} className="text-blue-400 mb-2" />
              <span className="text-xs text-blue-400 font-medium">פלייליסט</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <ListMusic size={32} strokeWidth={1.2} className="text-blue-400 mb-2" />
            <span className="text-xs text-blue-400 font-medium">פלייליסט</span>
          </div>
        )}
        <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-white text-xs font-medium">
            <Play size={12} className="fill-white" /><span>הפעל הכל</span>
          </div>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          <ListMusic size={10} />{playlist.videoCount} סרטונים
        </div>
      </div>
      <div className="px-1 flex items-start justify-between relative">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium line-clamp-2 leading-tight text-[var(--foreground)] transition-colors">{playlist.name}</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">רשימת השמעה · פרטי</p>
          <p className="text-[11px] text-[var(--muted)] mt-1 hover:text-[var(--foreground)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick(); }}>צפה ברשימת ההשמעה המלאה</p>
        </div>
        <div ref={menuRef} onClick={(e) => e.stopPropagation()} className="flex-shrink-0 mr-2">
          <button onClick={() => setShowMenu(v => !v)} className="p-1.5 hover:bg-[var(--secondary)] rounded-full transition-all text-[var(--foreground)]">
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <div className="absolute top-8 left-0 w-40 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl z-50 py-1 overflow-hidden" dir="rtl">
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--secondary)] text-sm text-[var(--foreground)] transition-colors">
                <div style={{ width: '24px', height: '24px', flexShrink: 0  }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style={{ pointerEvents: 'none', display: 'inherit', width: '100%', height: '100%' }}><path fill="currentColor" d="M19 3h-4V2a1 1 0 00-1-1h-4a1 1 0 00-1 1v1H5a2 2 0 00-2 2h18a2 2 0 00-2-2ZM6 19V7H4v12a4 4 0 004 4h8a4 4 0 004-4V7h-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2Zm4-11a1 1 0 00-1 1v8a1 1 0 102 0V9a1 1 0 00-1-1Zm4 0a1 1 0 00-1 1v8a1 1 0 002 0V9a1 1 0 00-1-1Z"></path></svg>
                </div>
                מחיקה
              </button>
              <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--secondary)] text-sm text-[var(--foreground)] transition-colors">
                <Pencil size={16} />עריכה
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
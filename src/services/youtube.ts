import { getBackendCache, setBackendCache } from './backend';

const USE_PROXY = true;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const getApiKey = () => {
  return (import.meta as any).env?.VITE_YOUTUBE_API_KEY || "";
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════
// YOUTUBEI.JS API
// ═══════════════════════════════════════════════════════════════

// Fetch from local youtubei.js endpoints
const throttledFetch = async (endpoint: string, params: any = {}): Promise<any> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const url = new URL(origin + `/api/youtubei/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error(`Timeout: ${endpoint}`);
    throw error;
  }
};

export const isApiKeyValid = () => true; // Always valid — Invidious only

export interface YouTubeVideo {
  id: { videoId: string; };
  snippet: {
    title: string; description: string;
    thumbnails: { 
      default: { url: string | null }; 
      medium: { url: string | null }; 
      high: { url: string | null }; 
      standard?: { url: string | null }; 
      maxres?: { url: string | null }; 
    };
    channelTitle: string; channelId: string; publishedAt: string;
    viewCount?: string; duration?: string;
    liveBroadcastContent?: string;
  };
  channelThumbnail?: string;
  likes?: string | number;
  durationText?: string;
  isShort?: boolean;
  contentDetails?: {
    definition?: string;
    caption?: string;
  };
}

export interface YouTubeResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  error?: { code: number; message: string; reason: string; };
  queryUsed?: string;
}

const getHighResThumbnail = (thumbnails: any, videoId?: string) => {
  let url = null;
  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    const hasWidth = thumbnails.some(t => t.width !== undefined);
    url = hasWidth
      ? [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0))[0].url
      : thumbnails[thumbnails.length - 1].url;
  } else if (thumbnails) {
    url = thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.standard?.url
       || thumbnails?.medium?.url || thumbnails?.default?.url || null;
  }
  if (url && url.includes("sqp=")) url = url.split("?")[0];
  if (!url && videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return url;
};

// mapRapidVideo kept for fallback reference — not actively called
const mapRapidVideo = (item: any): YouTubeVideo => {
  const video = item.video || item;
  const videoId = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
  const authorAvatar = video.author?.avatar || video.author?.thumbnails || video.author?.thumbnail || [];
  let channelThumbnail = null;
  if (Array.isArray(authorAvatar) && authorAvatar.length > 0) {
    channelThumbnail = authorAvatar[authorAvatar.length - 1]?.url || authorAvatar[0]?.url;
  } else if (authorAvatar && typeof authorAvatar === "object") {
    channelThumbnail = authorAvatar.high?.url || authorAvatar.medium?.url || authorAvatar.default?.url || authorAvatar.url || null;
  }
  if (!channelThumbnail) channelThumbnail = video.author_thumbnail || video.channelThumbnail || null;

  const durationText = video.lengthText || video.duration || video.video_length || (video.lengthSeconds ? `${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}` : "");
  
  let isShort = video.isShort || video.isShorts || video.type === "short";
  if (!isShort && (video.lengthSeconds && video.lengthSeconds <= 63)) isShort = true;
  if (!isShort && durationText && durationText.toUpperCase() !== "LIVE") {
    const parts = durationText.split(":");
    if (parts.length === 2 && (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0) <= 63) isShort = true;
    if (parts.length === 1 && (parseInt(parts[0]) || 0) <= 63) isShort = true;
  }

  return {
    id: { videoId },
    snippet: {
      title: video.title || "ללא כותרת",
      description: video.description || video.descriptionSnippet || "",
      thumbnails: {
        default: { url: `https://i.ytimg.com/vi/${videoId}/default.jpg` },
        medium:  { url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` },
        high:    { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
        standard: { url: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg` },
        maxres:  { url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` },
      },
      channelTitle: video.author?.title || video.author || "ערוץ לא ידוע",
      channelId: video.author?.channelId || video.author_id || "",
      publishedAt: video.publishedTimeText || video.published_at || new Date().toISOString(),
      viewCount: video.viewCountText || video.view_count_text || video.viewCount || video.viewsCount
               || video.view_count || video.views || video.statistics?.viewCount
               || video.stats?.views || video.stats?.viewCount || "0",
      duration: durationText,
    },
    channelThumbnail,
    likes: video.likes || video.likeCount || video.stats?.likes || video.stats?.likesText
         || video.statistics?.likeCount || video.like_count || video.likesCount || "0",
    durationText,
    isShort
  };
};

// ─── Video Details ───────────────────────
export const getVideoDetails = async (videoId: string): Promise<any> => {
  if (!videoId) return null;

  // RapidAPI fallback
  try {
    return await throttledFetch("video/details", { id: videoId, hl: "iw", gl: "IL" });
  } catch (_) {}
  return null;
};

// ─── Search ──────────────────────────────────────────────────────────
export interface SearchFilters {
  type?: string;       // 'video'|'short'|'channel'|'playlist'
  duration?: string;   // 'short'|'medium'|'long'
  uploadDate?: string; // 'today'|'week'|'month'|'year'
  features?: string;   // 'hd'|'live'|'4k'|'subtitles'|'creative_commons'|'3d'|'360'|'vr180'|'hdr'
  sortBy?: string;     // 'relevance'|'view_count'|'upload_date'|'rating'
  _fake?: string;
}

// ─── YouTube Data API v3 (official Google API) ─────────────────────
// Used as the PRIMARY backend when search filters are active, since
// youtubei.js sometimes ignores filters. This API has a 10,000 unit
// daily quota so we only use it for filtered searches.
const OFFICIAL_YT_API_KEY = 'AIzaSyA0Pe752gy43oEdQUzYFDzU1nyteus7sE4';

// Convert ISO 8601 duration (PT4M32S) to a display string ("4:32")
const isoDurationToText = (iso: string): string => {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${min}:${String(s).padStart(2,'0')}`;
};

const isoDurationToSeconds = (iso: string): number => {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + min * 60 + s;
};

// Map YouTube Data API v3 video to our YouTubeVideo format
const mapOfficialApiVideo = (v: any): YouTubeVideo => {
  const videoId = typeof v.id === 'string' ? v.id : (v.id?.videoId || v.id?.video_id || '');
  const durationText = isoDurationToText(v.contentDetails?.duration || '');
  const durationSecs = isoDurationToSeconds(v.contentDetails?.duration || '');
  const isShort = durationSecs > 0 && durationSecs <= 63;
  const thumbs = v.snippet?.thumbnails || {};

  return {
    id: { videoId },
    snippet: {
      title: v.snippet?.title || "ללא כותרת",
      description: v.snippet?.description || "",
      thumbnails: {
        default:  { url: thumbs.default?.url   || `https://i.ytimg.com/vi/${videoId}/default.jpg` },
        medium:   { url: thumbs.medium?.url    || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` },
        high:     { url: thumbs.high?.url      || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
        standard: { url: thumbs.standard?.url  || `https://i.ytimg.com/vi/${videoId}/sddefault.jpg` },
        maxres:   { url: thumbs.maxres?.url    || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` },
      },
      channelTitle: v.snippet?.channelTitle || "ערוץ לא ידוע",
      channelId: v.snippet?.channelId || "",
      publishedAt: v.snippet?.publishedAt || new Date().toISOString(),
      viewCount: v.statistics?.viewCount || "0",
      duration: durationText,
      liveBroadcastContent: v.snippet?.liveBroadcastContent,
    },
    likes: v.statistics?.likeCount || "0",
    durationText,
    isShort,
    contentDetails: {
      definition: v.contentDetails?.definition,
      caption: v.contentDetails?.caption,
    },
  };
};

// Search using YouTube Data API v3 (official). Returns null on failure.
const searchViaOfficialApi = async (
  query: string,
  pageToken: string | undefined,
  filters: SearchFilters | undefined
): Promise<YouTubeResponse | null> => {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '25',
      regionCode: 'IL',
      relevanceLanguage: 'iw',
      key: OFFICIAL_YT_API_KEY,
    });
    if (pageToken) params.set('pageToken', pageToken);

    // Map our filters → YouTube Data API v3 params
    if (filters?.duration) {
      // 'short' | 'medium' | 'long' — already matches API enum
      params.set('videoDuration', filters.duration);
    }

    if (filters?.uploadDate) {
      const now = Date.now();
      const ranges: { [k: string]: number } = {
        last_hour:  60 * 60 * 1000,
        today:      24 * 60 * 60 * 1000,
        this_week:  7 * 24 * 60 * 60 * 1000,
        this_month: 30 * 24 * 60 * 60 * 1000,
        this_year:  365 * 24 * 60 * 60 * 1000,
      };
      const ms = ranges[filters.uploadDate];
      if (ms) params.set('publishedAfter', new Date(now - ms).toISOString());
    }

    if (filters?.sortBy) {
      const sortMap: { [k: string]: string } = {
        relevance:   'relevance',
        view_count:  'viewCount',
        upload_date: 'date',
        rating:      'rating',
      };
      params.set('order', sortMap[filters.sortBy] || 'relevance');
    }

    if (filters?.features) {
      const feat = String(filters.features).toLowerCase();
      if (feat === 'live')             params.set('eventType', 'live');
      if (feat === 'hd' || feat === '4k') params.set('videoDefinition', 'high');
      if (feat === '3d')               params.set('videoDimension', '3d');
      if (feat === 'subtitles')        params.set('videoCaption', 'closedCaption');
      if (feat === 'creative_commons') params.set('videoLicense', 'creativeCommon');
    }

    if (filters?.type === 'movie')   params.set('videoType', 'movie');
    if (filters?.type === 'episode') params.set('videoType', 'episode');
    // 'short' is handled via videoDuration=short below
    if (filters?.type === 'short')   params.set('videoDuration', 'short');

    // Step 1: search to get video IDs
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.error('YouTube Data API search error:', searchRes.status);
      return null;
    }
    const searchData = await searchRes.json();
    if (searchData.error) {
      console.error('YouTube Data API error:', searchData.error?.message);
      return null;
    }
    const ids = (searchData.items || [])
      .map((it: any) => it.id?.videoId)
      .filter(Boolean);
    if (ids.length === 0) {
      return { items: [], nextPageToken: searchData.nextPageToken, queryUsed: query };
    }

    // Step 2: fetch full details (duration, definition, statistics) in one call
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids.join(',')}&key=${OFFICIAL_YT_API_KEY}&hl=iw&regionCode=IL`;
    const detailsRes = await fetch(detailsUrl);
    if (!detailsRes.ok) return null;
    const detailsData = await detailsRes.json();

    let items: YouTubeVideo[] = (detailsData.items || []).map(mapOfficialApiVideo);

    // YouTube Data API only has videoDefinition=high (HD+). For real 4K
    // filtering we must post-filter on title/description hints.
    if (filters?.features && String(filters.features).toLowerCase() === '4k') {
      items = items.filter(v => {
        const txt = `${v.snippet?.title || ''} ${v.snippet?.description || ''}`.toLowerCase();
        return txt.includes('4k') || txt.includes('2160') || txt.includes('uhd');
      });
    }

    return {
      items,
      nextPageToken: searchData.nextPageToken,
      queryUsed: query,
    };
  } catch (e) {
    console.error('YouTube Data API exception:', e);
    return null;
  }
};

export const searchVideos = async (query: string, isGeneral = false, pageToken?: string, filters?: SearchFilters): Promise<YouTubeResponse> => {
  let finalQuery = isGeneral || query.includes("שיעור") || query.includes("תורה") ? query : `${query} שיעור תורה`;
  
  // ── 1. PRIMARY path when filters are active: YouTube Data API v3 ──────────
  // The official API correctly applies videoDuration, publishedAfter, order,
  // videoDefinition, eventType, videoCaption, videoLicense, etc. We only use
  // it for filtered searches because of the daily quota.
  const hasMeaningfulFilter = filters && (
    filters.duration || filters.uploadDate || filters.sortBy ||
    (filters.features && filters.features !== 'purchased' && filters.features !== 'location' &&
     filters.features !== 'hdr' && filters.features !== 'vr180' && filters.features !== '360') ||
    filters.type === 'movie' || filters.type === 'episode' || filters.type === 'short'
  );

  if (hasMeaningfulFilter) {
    const officialResult = await searchViaOfficialApi(finalQuery, pageToken, filters);
    if (officialResult && officialResult.items.length > 0) {
      return officialResult;
    }
    // If official API returned nothing or failed, fall through to the
    // youtubei.js path so the user still sees results.
  }
  
  const searchParams: any = { q: finalQuery, hl: "iw", gl: "IL", cursor: pageToken || "" };

  if (filters) {
    if (filters.duration) searchParams.duration = filters.duration;
    if (filters.type) searchParams.type = filters.type;
    if (filters.uploadDate) searchParams.upload_date = filters.uploadDate;
    if (filters.sortBy) searchParams.sort_by = filters.sortBy;
    if (filters.features) {
      // Send features both as 'features' (string) and 'features[]' (array-like) so
      // backend variations can handle either. Some youtubei.js wrappers expect array.
      searchParams.features = filters.features;
    }
  }

  // ── 2. RapidAPI emergency fallback ────────────────────────────────────────
  try {
    const data = await throttledFetch("search", searchParams);
    if (data.message && !data.videos && !data.contents) {
      return { items: [], error: { code: 400, message: data.message, reason: "api_error" } };
    }
    let videoList = (data.videos || data.contents || []).filter((item: any) => {
      const video = item.video || item;
      const type = item.type || (item.video ? "video" : "");
      const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
      return (type === "video" || type === "short" || !type) && vid && video.title;
    });

    // Local fallback filtering: if the backend ignored a feature filter, apply it client-side
    // by inspecting video metadata (e.g. title, badges, description).
    if (filters?.features) {
      const feat = String(filters.features).toLowerCase();
      videoList = videoList.filter((item: any) => {
        const video = item.video || item;
        const title = String(video.title || "").toLowerCase();
        const desc = String(video.descriptionSnippet || video.description || "").toLowerCase();
        const badges = JSON.stringify(video.badges || video.thumbnailOverlays || video.movingThumbnails || "").toLowerCase();
        const haystack = `${title} ${desc} ${badges}`;
        if (feat === '4k') return haystack.includes('4k') || haystack.includes('2160');
        if (feat === 'hd') return haystack.includes('hd') || haystack.includes('1080');
        if (feat === 'live') return haystack.includes('live') || haystack.includes('שידור חי') || video.isLive === true || video.liveBroadcastContent === 'live';
        if (feat === 'hdr') return haystack.includes('hdr');
        if (feat === '360') return haystack.includes('360');
        if (feat === 'vr180') return haystack.includes('vr180') || haystack.includes('vr 180');
        if (feat === '3d') return haystack.includes('3d') || haystack.includes('תלת ממד');
        if (feat === 'subtitles') return haystack.includes('subtitle') || haystack.includes('caption') || haystack.includes('כתוביות') || video.hasCaption === true;
        if (feat === 'creative_commons') return haystack.includes('creative commons');
        return true;
      });
    }

    // Local fallback for uploadDate (when backend ignores it)
    if (filters?.uploadDate) {
      const now = Date.now();
      const ranges: { [k: string]: number } = {
        last_hour: 60 * 60 * 1000,
        today:     24 * 60 * 60 * 1000,
        this_week: 7 * 24 * 60 * 60 * 1000,
        this_month: 30 * 24 * 60 * 60 * 1000,
        this_year: 365 * 24 * 60 * 60 * 1000,
      };
      const limitMs = ranges[filters.uploadDate];
      if (limitMs) {
        videoList = videoList.filter((item: any) => {
          const video = item.video || item;
          // Try absolute timestamp first
          const ts = video.publishedTimestamp || video.uploadedAt || video.publishedAt;
          if (ts) {
            const tsMs = typeof ts === 'number' ? (ts < 1e12 ? ts * 1000 : ts) : Date.parse(ts);
            if (!isNaN(tsMs)) return (now - tsMs) <= limitMs;
          }
          // Fallback: parse relative text like "לפני 3 ימים" / "3 days ago"
          const txt = String(video.publishedTimeText || video.publishedText || video.publishDate || "").toLowerCase();
          if (!txt) return true; // unknown date — keep it rather than drop everything
          const isHe = /לפני/.test(txt);
          if (filters.uploadDate === 'last_hour') return /(שעה|hour|דקה|minute|second|שניה)/.test(txt) || /^now/.test(txt);
          if (filters.uploadDate === 'today') return /(שעה|hour|דקה|minute|second|שניה|today|היום)/.test(txt);
          if (filters.uploadDate === 'this_week') return /(שעה|hour|דקה|minute|second|שניה|today|היום|day|ימים|יום|week|שבוע)/.test(txt);
          if (filters.uploadDate === 'this_month') return /(שעה|hour|דקה|minute|today|היום|day|ימים|יום|week|שבוע|month|חודש)/.test(txt);
          if (filters.uploadDate === 'this_year') return !/(year|שנה|שנים|years)/.test(txt) || /^(לפני )?(1|שנה אחת|שנה|a year|one year)/.test(txt);
          return true;
        });
      }
    }

    return {
      items: videoList.map(mapRapidVideo),
      nextPageToken: data.cursorNext || data.cursor || data.next || data.continuation,
      queryUsed: finalQuery,
    };
  } catch (_) {}
  return { items: [] };
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (_) { return []; }
};

const searchChannelsCache = new Map<string, { data: any[], timestamp: number }>();

export const searchChannels = async (query: string): Promise<any[]> => {
  const cacheKey = query;
  const cached = searchChannelsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60 * 24) { // 24 hours cache
    return cached.data;
  }

  // ── 2. RapidAPI emergency fallback ────────────────────────────────────────
  try {
    const data = await throttledFetch("search", { q: query, type: "channel", hl: "iw", gl: "IL" });
    const channelList = (data.channels || data.contents || []).filter((item: any) => {
      const channel = item.channel || item;
      const type = item.type || (item.channel ? "channel" : "");
      return (type === "channel" || !type) && (channel.channelId || channel.channel_id) && channel.title;
    });
    const result = channelList.map((item: any) => {
      const channel = item.channel || item;
      const avatars = channel.avatar || channel.thumbnails || channel.thumbnail || [];
      const defaultAvatar = Array.isArray(avatars) ? avatars[0]?.url : (avatars?.default?.url || avatars?.url || null);
      const highAvatar = Array.isArray(avatars) ? (avatars[avatars.length - 1]?.url || avatars[0]?.url) : (avatars?.high?.url || avatars?.default?.url || avatars?.url || null);
      return {
        id: { channelId: channel.channelId || channel.channel_id || channel.id },
        snippet: {
          title: channel.title,
          description: channel.descriptionSnippet || channel.description,
          thumbnails: { default: { url: defaultAvatar }, high: { url: highAvatar } },
          customUrl: channel.customUrl || channel.custom_url,
        },
      };
    });
    searchChannelsCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (_) { return []; }
  return [];
};

// ─── Channel Details ─────────────────
export const getChannelDetails = async (channelId: string): Promise<any> => {
  if (!channelId) return null;

  let localData: any = null;
  try {
    localData = await throttledFetch("channel/details", { id: channelId, hl: "iw", gl: "IL" });
  } catch (_) {}

  let rapidApiData: any = null;
  try {
    const res = await fetch(`https://youtube138.p.rapidapi.com/channel/details/?id=${channelId}&hl=iw&gl=IL`, {
      headers: {
        'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
        'x-rapidapi-host': 'youtube138.p.rapidapi.com'
      }
    });
    if (res.ok) {
      rapidApiData = await res.json();
    }
  } catch (e) {
    console.error("RapidAPI channel fetch error:", e);
  }

  try {
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${getApiKey()}`);
    if (ytRes.ok) {
      const ytData = await ytRes.json();
      if (ytData.items && ytData.items.length > 0) {
        if (!rapidApiData) rapidApiData = {};
        if (!rapidApiData.stats) rapidApiData.stats = {};
        rapidApiData.stats.subscribersText = ytData.items[0].statistics.subscriberCount;
      }
    }
  } catch (e) {}

  const data = localData || rapidApiData || {};
  if (!localData && !rapidApiData) return null;

  const extractUrl = (obj: any): string | null => {
    if (!obj) return null;
    if (typeof obj === "string") return obj;
    if (Array.isArray(obj)) {
      const last = obj[obj.length - 1];
      return last?.url || (typeof last === "string" ? last : null);
    }
    if (obj.desktop && Array.isArray(obj.desktop)) return obj.desktop[obj.desktop.length - 1]?.url || null;
    if (obj.tv && Array.isArray(obj.tv)) return obj.tv[obj.tv.length - 1]?.url || null;
    if (obj.mobile && Array.isArray(obj.mobile)) return obj.mobile[obj.mobile.length - 1]?.url || null;
    if (obj.thumbnails && Array.isArray(obj.thumbnails)) return obj.thumbnails[obj.thumbnails.length - 1]?.url || null;
    if (obj.high?.url) return obj.high.url;
    if (obj.medium?.url) return obj.medium.url;
    if (obj.default?.url) return obj.default.url;
    return obj.url || null;
  };

  // Banner
  const bannerRaw = extractUrl(data.banner) || extractUrl(data.channelBanner) || null;

  let finalBannerUrl = bannerRaw;
  if (finalBannerUrl && (finalBannerUrl.includes("googleusercontent.com") || finalBannerUrl.includes("ggpht.com"))) {
    finalBannerUrl = (finalBannerUrl.includes("=")
      ? finalBannerUrl.split("=")[0]
      : finalBannerUrl) + "=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj";
  }

  // Avatar
  let avatarUrl: string | null = null;
  if (!avatarUrl) {
    avatarUrl = extractUrl(data.meta?.avatar) || extractUrl(data.avatar)
      || extractUrl(data.author?.avatar) || extractUrl(data.thumbnails) || extractUrl(data.image) || null;
  }

  // Subscriber count
  const subscriberCount = rapidApiData?.stats?.subscribersText || rapidApiData?.stats?.subscribers
       || rapidApiData?.meta?.subscriberCountText || rapidApiData?.subscriberCountText
       || rapidApiData?.subscribers || rapidApiData?.subscribersCount
       || data.stats?.subscribersText || data.stats?.subscribers
       || data.meta?.subscriberCountText || data.subscriberCountText
       || data.subscribers || data.subscribersCount || null;

  const videoCount = rapidApiData?.stats?.videosText || rapidApiData?.stats?.videos
       || rapidApiData?.meta?.videosCountText || rapidApiData?.videosCountText
       || rapidApiData?.videos_count || rapidApiData?.videoCount
       || data.stats?.videosText || data.stats?.videos
       || data.meta?.videosCountText || data.videosCountText
       || data.videos_count || data.videoCount || null;

  const channelId2 = data.channelId || data.channel_id || data.meta?.channelId || channelId;

  return {
    id: channelId2,
    bannerUrl: finalBannerUrl,
    stats: null,
    invData: null, // keep raw Invidious data for tabs
    snippet: {
      title: data.title || data.meta?.title || "ערוץ לא ידוע",
      description: data.description || data.meta?.description || "",
      thumbnails: {
        default: { url: avatarUrl },
        medium: { url: avatarUrl },
        high: { url: avatarUrl },
      },
      customUrl: data.customUrl || data.custom_url || data.meta?.customUrl || null,
    },
    statistics: { subscriberCount, videoCount },
    brandingSettings: { image: { bannerExternalUrl: finalBannerUrl } },
  };
};

// ─── Channel Videos ─────────────────────────────────────────
export const getVideosByChannel = async (channelId: string, pageToken?: string, sort: string = "newest"): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  try {
    const order = sort === "popular" ? "viewCount" : "date";
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=${order}&type=video&key=${getApiKey()}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    if (videoIds) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${getApiKey()}`;
      const detailsRes = await fetch(detailsUrl);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        return { items: detailsData.items, nextPageToken: data.nextPageToken };
      }
    }
    return { items: data.items, nextPageToken: data.nextPageToken };
  } catch (e) {
    return { items: [] };
  }
};

// ─── Channel Home ─────────────────────────
export const getChannelHome = async (channelId: string): Promise<{ items: YouTubeVideo[] }> => {
  if (!channelId) return { items: [] };

  try {
    const data = await throttledFetch("channel/videos", { id: channelId, hl: "iw", gl: "IL", sort: "n" });
    const videoList = (data.videos || data.contents || []).filter((item: any) => {
      const video = item.video || item;
      const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
      return vid && video.title;
    });
    return { items: videoList.slice(0, 10).map(mapRapidVideo) };
  } catch (_) { return { items: [] }; }
};

// ─── Shorts ──────────────────────────────────────────────────
export const getChannelShorts = async (channelId: string, pageToken?: string, sort: string = "newest"): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  try {
    const order = sort === "popular" ? "viewCount" : "date";
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=${order}&type=video&videoDuration=short&key=${getApiKey()}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    if (videoIds) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${getApiKey()}`;
      const detailsRes = await fetch(detailsUrl);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        const shorts = detailsData.items.filter((v: any) => {
          const dur = String(v.contentDetails?.duration || "");
          const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (!match) return false;
          const h = parseInt(match[1] || '0');
          const m = parseInt(match[2] || '0');
          const s = parseInt(match[3] || '0');
          const totalSeconds = h * 3600 + m * 60 + s;
          return totalSeconds <= 63;
        });
        return { items: shorts, nextPageToken: data.nextPageToken };
      }
    }
    return { items: [], nextPageToken: data.nextPageToken };
  } catch (e) {
    return { items: [] };
  }
};

// ─── Live Streams ───────────────────────────────────────────
export const getChannelLiveStreams = async (channelId: string, pageToken?: string, sort: string = "newest"): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  try {
    const order = sort === "popular" ? "viewCount" : "date";
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=${order}&type=video&eventType=completed&key=${getApiKey()}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    if (videoIds) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${getApiKey()}`;
      const detailsRes = await fetch(detailsUrl);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        return { items: detailsData.items, nextPageToken: data.nextPageToken };
      }
    }
    return { items: data.items, nextPageToken: data.nextPageToken };
  } catch (e) {
    return { items: [] };
  }
};

// ─── Playlists ──────────────────────────────────────────────
export const getChannelPlaylists = async (channelId: string, pageToken?: string): Promise<{ items: any[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  try {
    // Try the direct endpoint first
    try {
      const data = await throttledFetch("channel/playlists", { 
        id: channelId, hl: "iw", gl: "IL", 
        cursor: pageToken || "" 
      });
      let contents = data.playlists || data.contents || data.items || data.results || [];
      if (contents.length === 0) {
        for (const key in data) {
          if (Array.isArray(data[key]) && data[key].length > 0) { contents = data[key]; break; }
        }
      }
      
      if (contents.length > 0) {
        const items = contents
          .filter((item: any) => { const p = item.playlist || item.item || item.collection || item; return !!(p.playlistId || p.id || p.title); })
          .map((item: any) => {
            const p = item.playlist || item.item || item.collection || item;
            return {
              id: p.playlistId || p.id || Math.random().toString(),
              title: p.title || "פלייליסט ללא כותרת",
              thumbnail: getHighResThumbnail(p.thumbnails || p.thumbnail) || p.thumbnail || null,
              videoCount: p.videoCount || p.video_count || p.stats?.videos || "0",
            };
          });
        if (items.length > 0) {
          return { items, nextPageToken: data.cursorNext || data.cursor || data.next };
        }
      }
    } catch (e) {
      // Ignore and fallback
    }

    // Fallback: Use search endpoint with type=playlist
    let searchQuery = channelId;
    try {
      const channelData = await getChannelDetails(channelId);
      if (channelData && channelData.title) {
        searchQuery = channelData.title;
      }
    } catch (e) {
      // Ignore error and fallback to channelId
    }

    const data = await throttledFetch("search", { q: searchQuery, type: "playlist", hl: "iw", gl: "IL", cursor: pageToken || "" });
    if (data.error) return { items: [] };
    
    let contents = data.playlists || data.contents || data.items || data.results || (Array.isArray(data) ? data : []);
    
    if (contents.length === 0) {
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) { contents = data[key]; break; }
      }
    }
    
    const items = contents
      .filter((item: any) => { const p = item.playlist || item.item || item.collection || item; return !!(p.playlistId || p.id || p.title); })
      .map((item: any) => {
        const p = item.playlist || item.item || item.collection || item;
        return {
          id: p.playlistId || p.id || Math.random().toString(),
          title: p.title || "פלייליסט ללא כותרת",
          thumbnail: getHighResThumbnail(p.thumbnails || p.thumbnail) || p.thumbnail || null,
          videoCount: p.videoCount || p.video_count || p.stats?.videos || "0",
        };
      });
    return { items, nextPageToken: data.cursorNext || data.cursor || data.next };
  } catch (_) { return { items: [] }; }
};

export const getPlaylistVideosFromAPI = async (playlistId: string, pageToken?: string): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!playlistId) return { items: [] };
  try {
    const data = await throttledFetch("playlist/videos", { id: playlistId, hl: "iw", gl: "IL", cursor: pageToken || "" });
    const contents = data.videos || data.contents || data.items || [];
    const videos = contents.filter((item: any) => {
      const v = item.video || item;
      return (v.videoId || v.video_id || v.id) && v.title;
    });
    return { items: videos.map(mapRapidVideo), nextPageToken: data.cursorNext || data.cursor || data.next };
  } catch (_) { return { items: [] }; }
};

// ─── Community ─────────────────────────────────────────────────────────────────
export const getChannelCommunity = async (channelId: string, pageToken?: string): Promise<{ items: any[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };
  try {
    const data = await throttledFetch("channel/community", { id: channelId, hl: "iw", gl: "IL", cursor: pageToken || "" });
    if (data.error) return { items: [] };
    let contents = data.community || data.contents || data.items || (Array.isArray(data) ? data : []);
    if (contents.length === 0 && data.community?.contents) contents = data.community.contents;
    if (contents.length === 0) {
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) { contents = data[key]; break; }
      }
    }
    const items = contents
      .filter((item: any) => {
        const p = item.post || item.communityPost || item.item || item;
        return p && (p.postId || p.id || (typeof p.text === "string" && p.text.length > 0) || (typeof p.contentText === "string" && p.contentText.length > 0));
      })
      .map((item: any) => {
        const p = item.post || item.communityPost || item.item || item;
        let imageUrl: string | null = null;
        if (p.attachment?.images?.[0]?.source?.[0]?.url) {
          imageUrl = p.attachment.images[0].source.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0]?.url;
        } else if (p.attachment?.thumbnails?.[0]?.url) {
          imageUrl = p.attachment.thumbnails[0].url;
        }
        if (imageUrl?.includes("sqp=")) imageUrl = imageUrl.split("?")[0];
        return {
          id: p.postId || p.id || Math.random().toString(),
          text: p.contentText || p.content_text || p.text || p.content || "",
          publishedTime: p.publishedTimeText || p.published_time_text || p.published_at || "",
          attachment: imageUrl ? { type: "image", thumbnails: [{ url: imageUrl }] } : (p.attachment || null),
          author: p.author || null,
          stats: { likesText: p.stats?.likesText || "0", commentsText: p.stats?.commentsText || "0" },
        };
      });
    return { items, nextPageToken: data.cursorNext || data.cursor };
  } catch (_) { return { items: [] }; }
};

export const getRelatedVideos = async (videoId: string, videoTitle: string): Promise<YouTubeResponse> => {
  if (!videoId && !videoTitle) return { items: [] };

  // ── 2. RapidAPI emergency fallback ────────────────────────────────────────
  try {
    const data = await throttledFetch("search", { q: videoTitle, hl: "iw", gl: "IL" });
    const items = (data.videos || data.contents || [])
      .filter((item: any) => {
        const v = item.video || item;
        const type = item.type || (item.video ? "video" : "");
        const vId = v.videoId || v.video_id || (v.id && typeof v.id === "string" ? v.id : "");
        return (type === "video" || !type) && vId && vId !== videoId;
      })
      .map(mapRapidVideo);
    return { items };
  } catch (_) { return { items: [] }; }
};

export const getSubscriptions = async (accessToken: string): Promise<{ items: any[], error?: any }> => {
  try {
    let allItems: any[] = [];
    let pageToken: string | undefined = undefined;
    do {
      const url = `${BASE_URL}/subscriptions?part=snippet&mine=true&maxResults=50&order=alphabetical${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.error) return { items: allItems.length > 0 ? allItems : [], error: data.error };
      const pageItems = (data.items || []).map((item: any) => ({
        id: item.snippet.resourceId.channelId,
        snippet: {
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails,
          channelId: item.snippet.resourceId.channelId,
        }
      }));
      allItems = [...allItems, ...pageItems];
      pageToken = data.nextPageToken;
    } while (pageToken && allItems.length < 500);
    return { items: allItems };
  } catch (error) { return { items: [], error }; }
};

// Popular Torah videos — diverse mix of different rabbis/channels
export const getPopularTorahVideos = async (pageToken?: string): Promise<YouTubeResponse> => {
  const page = parseInt(pageToken || "1", 10);

  const allQueries = [
    "הרב זמיר כהן שיעור",
    "הרב יגאל כהן",
    "הרב רונן שאולוב",
    "הרב יצחק פנגר",
    "הרב משה פינטו",
    "שיעורי תורה יהדות",
    "הרב שלום ארוש",
    "הרב דוד קנירשי",
  ];

  // Each page picks 4 different queries, cycling through the list
  const startIdx = ((page - 1) * 4) % allQueries.length;
  const pageQueries = [
    allQueries[startIdx % allQueries.length],
    allQueries[(startIdx + 1) % allQueries.length],
    allQueries[(startIdx + 2) % allQueries.length],
    allQueries[(startIdx + 3) % allQueries.length],
  ];

  // RapidAPI fallback
  try {
    const rapidResults = await Promise.allSettled(
      pageQueries.map(q => throttledFetch("search", { q, hl: "iw", gl: "IL", sort_by: "view_count", upload_date: "this_year" }).then(data => {
        const videoList = (data.videos || data.contents || []).filter((item: any) => {
          const video = item.video || item;
          const type = item.type || (item.video ? "video" : "");
          const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
          return (type === "video" || !type) && vid && video.title;
        });
        return videoList.slice(0, 10).map(mapRapidVideo);
      }))
    );

    const rapidBuckets: YouTubeVideo[][] = rapidResults
      .filter((r): r is PromiseFulfilledResult<YouTubeVideo[]> => r.status === "fulfilled" && r.value.length > 0)
      .map(r => r.value);

    if (rapidBuckets.length > 0) {
      const interleaved: YouTubeVideo[] = [];
      const maxLen = Math.max(...rapidBuckets.map(b => b.length));
      for (let i = 0; i < maxLen; i++) {
        for (const bucket of rapidBuckets) {
          if (bucket[i]) interleaved.push(bucket[i]);
        }
      }
      const seen = new Set<string>();
      const unique = interleaved.filter(v => {
        const id = typeof v.id === "string" ? v.id : (v.id?.videoId || "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      if (unique.length > 0) {
        return { items: unique, queryUsed: "diverse-torah", nextPageToken: (page + 1).toString() };
      }
    }
    
    // Fallback if the specific queries failed
    const fallbackData = await throttledFetch("search", { q: "שיעור תורה", hl: "iw", gl: "IL", sort_by: "view_count", upload_date: "this_year" });
    if (fallbackData && (fallbackData.videos || fallbackData.contents)) {
      const videoList = (fallbackData.videos || fallbackData.contents || []).filter((item: any) => {
        const video = item.video || item;
        const type = item.type || (item.video ? "video" : "");
        const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
        return (type === "video" || !type) && vid && video.title;
      });
      const fallbackVideos = videoList.slice(0, 20).map(mapRapidVideo);
      if (fallbackVideos.length > 0) {
        return { items: fallbackVideos, queryUsed: "diverse-torah-fallback", nextPageToken: (page + 1).toString() };
      }
    }
  } catch (_) {}

  return { items: [], error: { code: 503, message: "לא ניתן לטעון סרטונים כרגע", reason: "unavailable" } };
};

export const getTorahShorts = async (pageToken?: string): Promise<YouTubeResponse> => {
  const page = parseInt(pageToken || "1", 10);
  const allQueries = [
    "הרב זמיר כהן #shorts",
    "הרב יצחק יוסף #shorts",
    "הרב יגאל כהן #shorts",
    "הרב שניר גואטה #shorts",
    "שיעור תורה קצר #shorts",
    "הרב פנגר #shorts",
    "הרב מאיר אליהו #shorts",
    "חיזוק יומי #shorts"
  ];
  const start = ((page - 1) * 2) % allQueries.length;
  const pageQueries = [
    allQueries[start % allQueries.length],
    allQueries[(start + 1) % allQueries.length],
  ];

  try {
    const rapidResults = await Promise.allSettled(
      pageQueries.map(q => throttledFetch("search", { q, hl: "iw", gl: "IL", sort_by: "view_count", upload_date: "this_year" }).then(data => {
        const videoList = (data.videos || data.contents || []).filter((item: any) => {
          const video = item.video || item;
          const type = item.type || (item.video ? "video" : "");
          const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
          
          if (!((type === "video" || !type) && vid && video.title)) return false;
          
          // Filter for actual shorts (duration <= 63s)
          if (video.lengthSeconds && video.lengthSeconds <= 63) return true;
          if (video.isShort || video.isShorts || video.type === "short") return true;
          const dur = String(video.lengthText || video.duration || video.video_length || "");
          if (!dur || dur.toUpperCase() === "LIVE") return false;
          const parts = dur.split(":");
          if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0) <= 63;
          if (parts.length === 1) return (parseInt(parts[0]) || 0) <= 63;
          return false;
        });
        return videoList.slice(0, 8).map(mapRapidVideo);
      }))
    );

    const rapidBuckets: YouTubeVideo[][] = rapidResults
      .filter((r): r is PromiseFulfilledResult<YouTubeVideo[]> => r.status === "fulfilled" && r.value.length > 0)
      .map(r => r.value);

    let unique: YouTubeVideo[] = [];
    if (rapidBuckets.length > 0) {
      const interleaved: YouTubeVideo[] = [];
      const maxLen = Math.max(...rapidBuckets.map(b => b.length));
      for (let i = 0; i < maxLen; i++) {
        for (const bucket of rapidBuckets) {
          if (bucket[i]) interleaved.push(bucket[i]);
        }
      }
      const seen = new Set<string>();
      unique = interleaved.filter(v => {
        const id = typeof v.id === "string" ? v.id : (v.id?.videoId || "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }
    
    if (unique.length >= 12) {
      return { items: unique, queryUsed: "torah-shorts", nextPageToken: (page + 1).toString() };
    }
    
    // Fallback if the specific queries failed or didn't return enough results
    const fallbackData = await throttledFetch("search", { q: "הרב #shorts", hl: "iw", gl: "IL", sort_by: "view_count", upload_date: "this_year" });
    if (fallbackData && (fallbackData.videos || fallbackData.contents)) {
      const videoList = (fallbackData.videos || fallbackData.contents || []).filter((item: any) => {
        const video = item.video || item;
        const type = item.type || (item.video ? "video" : "");
        const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
        
        if (!((type === "video" || !type) && vid && video.title)) return false;
        
        if (video.lengthSeconds && video.lengthSeconds <= 63) return true;
        if (video.isShort || video.isShorts || video.type === "short") return true;
        const dur = String(video.lengthText || video.duration || video.video_length || "");
        if (!dur || dur.toUpperCase() === "LIVE") return false;
        const parts = dur.split(":");
        if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0) <= 63;
        if (parts.length === 1) return (parseInt(parts[0]) || 0) <= 63;
        return false;
      });
      const fallbackVideos = videoList.slice(0, 20).map(mapRapidVideo);
      
      const seen = new Set(unique.map(v => typeof v.id === "string" ? v.id : (v.id?.videoId || "")));
      for (const v of fallbackVideos) {
        const id = typeof v.id === "string" ? v.id : (v.id?.videoId || "");
        if (!seen.has(id)) {
          seen.add(id);
          unique.push(v);
        }
      }
      
      if (unique.length > 0) {
        return { items: unique, queryUsed: "torah-shorts-fallback", nextPageToken: (page + 1).toString() };
      }
    }
  } catch (_) {}

  return { items: [], error: { code: 503, message: "לא ניתן לטעון שורטס כרגע", reason: "unavailable" } };
};

export const subscribeToChannelOnYouTube = async (channelId: string, accessToken: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/subscriptions?part=snippet`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ snippet: { resourceId: { kind: "youtube#channel", channelId } } }),
    });
    return res.ok;
  } catch (_) { return false; }
};

export const unsubscribeFromChannelOnYouTube = async (channelId: string, accessToken: string): Promise<boolean> => {
  try {
    // First find the subscription ID for this channel
    const searchRes = await fetch(`${BASE_URL}/subscriptions?part=id&mine=true&forChannelId=${channelId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const searchData = await searchRes.json();
    if (searchData.error || !searchData.items || searchData.items.length === 0) return false;
    const subscriptionId = searchData.items[0].id;
    // Now delete the subscription
    const deleteRes = await fetch(`${BASE_URL}/subscriptions?id=${subscriptionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return deleteRes.ok || deleteRes.status === 204;
  } catch (_) { return false; }
};

export const getVideosFromChannels = async (channelIds: string[], pageToken?: string): Promise<YouTubeResponse> => {
  if (channelIds.length === 0) return { items: [] };
  const page = parseInt(pageToken || "1", 10);
  // Shuffle channels for variety; rotate through them on each page
  const shuffled = [...channelIds].sort(() => Math.random() - 0.5);
  const startIdx = ((page - 1) * 4) % Math.max(shuffled.length, 1);
  const selected = shuffled.slice(startIdx, startIdx + 4);
  if (selected.length === 0) return { items: [] };
  try {
    // Alternate newest/popular per channel for a mix of fresh and classic content
    const results = await Promise.allSettled(
      selected.map((id, i) =>
        getVideosByChannel(id, undefined, i % 2 === 0 ? "newest" : "popular")
      )
    );
    const allItems = results
      .filter((r): r is PromiseFulfilledResult<{items: YouTubeVideo[], nextPageToken?: string}> => r.status === "fulfilled")
      .flatMap(r => r.value.items);
    // Shuffle so newest and popular are interleaved, not grouped by channel
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }
    // Deduplicate
    const seen = new Set<string>();
    const unique = allItems.filter(v => {
      const id = typeof v.id === "string" ? v.id : (v.id?.videoId || "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return { items: unique, nextPageToken: unique.length > 0 ? (page + 1).toString() : undefined };
  } catch (_) { return { items: [] }; }
};

// ─── Haredi Music Videos (for Music sidebar category) ────────────────────────
export const getHaredimMusicVideos = async (pageToken?: string): Promise<YouTubeResponse> => {
  const page = parseInt(pageToken || "1", 10);
  const allQueries = [
    "מרדכי בן דוד שירים",
    "אברהם פריד שירים",
    "יעקב שוואקי שירים",
    "מוטי שטינמץ שירים",
    "לוי פרקוביץ שירים",
    "שלמה כהן שירים חסידי",
    "איסי מרלוב שירים חרדי",
    "שמחה לייבוביץ שירים",
  ];
  const start = ((page - 1) * 3) % allQueries.length;
  const pageQueries = [
    allQueries[start % allQueries.length],
    allQueries[(start + 1) % allQueries.length],
    allQueries[(start + 2) % allQueries.length],
  ];

  try {
    const rapidResults = await Promise.allSettled(
      pageQueries.map(q => throttledFetch("search", { q, hl: "iw", gl: "IL" }).then(data => {
        const videoList = (data.videos || data.contents || []).filter((item: any) => {
          const video = item.video || item;
          const type = item.type || (item.video ? "video" : "");
          const vid = video.videoId || video.video_id || (video.id && typeof video.id === "string" ? video.id : "");
          return (type === "video" || !type) && vid && video.title;
        });
        return videoList.slice(0, 6).map(mapRapidVideo);
      }))
    );

    const buckets = rapidResults
      .filter((r): r is PromiseFulfilledResult<YouTubeVideo[]> => r.status === "fulfilled" && r.value.length > 0)
      .map(r => r.value);

    if (buckets.length > 0) {
      const interleaved: YouTubeVideo[] = [];
      const maxLen = Math.max(...buckets.map(b => b.length));
      for (let i = 0; i < maxLen; i++) {
        for (const b of buckets) { if (b[i]) interleaved.push(b[i]); }
      }
      const seen = new Set<string>();
      const unique = interleaved.filter(v => {
        const id = typeof v.id === "string" ? v.id : (v.id?.videoId || "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      if (unique.length > 0) return { items: unique, nextPageToken: (page + 1).toString() };
    }
  } catch (_) {}
  return { items: [] };
};
// ─── Haredi Artist Channels (for Spotify-like Music browser) ─────────────────
export const getHaredimArtistChannels = async (): Promise<any[]> => {
  // Search for haredi music artists dynamically — no hardcoded IDs
  const artistQueries = [
    "מרדכי בן דוד זמר",
    "אברהם פריד זמר",
    "יעקב שוואקי זמר",
    "מוטי שטינמץ זמר",
    "לוי פרקוביץ זמר",
    "שלמה כהן זמר חרדי",
    "איסי מרלוב זמר",
    "שמחה לייבוביץ זמר",
    "מנחם ייפה זמר",
    "פרץ רונאל זמר",
    "יצחק מאיר זמר",
    "ניגון חסידי שירים",
  ];

  try {
    const rapidResults = await Promise.allSettled(
      artistQueries.map(q => throttledFetch("search", { q, hl: "iw", gl: "IL" }).then(data => {
        const channels = (data.channels || data.contents || []).filter((item: any) => {
          const type = item.type || (item.channel ? "channel" : "");
          return type === "channel" || item.channelId;
        });
        if (channels.length > 0) {
          const c = channels[0].channel || channels[0];
          return {
            id: c.channelId || c.id,
            title: c.title,
            thumbnails: c.avatar || c.thumbnails || []
          };
        }
        return null;
      }))
    );

    return rapidResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value !== null && r.value?.id)
      .map(r => r.value);
  } catch (_) {}
  return [];
};

// ─── Get subscriptions with RapidAPI fallback ──────────────────────────────
// Primary: YouTube Data API v3 with OAuth token (gets all channels user subscribed to)
// Fallback: Saved channels from local state (channels subscribed via the app)
export const getSubscriptionsWithFallback = async (
  accessToken: string | null,
  savedChannelIds: string[] = []
): Promise<{ items: any[]; source: 'youtube' | 'local' | 'none' }> => {
  // Try YouTube OAuth first
  if (accessToken) {
    try {
      let allItems: any[] = [];
      let pageToken: string | undefined = undefined;
      do {
        const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50&order=alphabetical${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!res.ok) break;
        const data = await res.json();
        if (data.error) break;
        const pageItems = (data.items || []).map((item: any) => ({
          id: item.snippet.resourceId.channelId,
          snippet: {
            title: item.snippet.title,
            thumbnails: item.snippet.thumbnails,
            channelId: item.snippet.resourceId.channelId,
          }
        }));
        allItems = [...allItems, ...pageItems];
        pageToken = data.nextPageToken;
      } while (pageToken && allItems.length < 500);
      if (allItems.length > 0) return { items: allItems, source: 'youtube' };
    } catch (_) {}
  }

  // Fallback: enrich saved channel IDs with details via RapidAPI
  if (savedChannelIds.length > 0) {
    try {
      const results = await Promise.allSettled(
        savedChannelIds.slice(0, 20).map(id =>
          throttledFetch('channel/details', { id, hl: 'iw', gl: 'IL' })
        )
      );
      const items = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
        .map(r => {
          const d = r.value;
          return {
            id: d.channelId || d.id,
            snippet: {
              title: d.title || d.channelTitle || 'ערוץ',
              thumbnails: {
                default: { url: (Array.isArray(d.avatar) ? d.avatar[0]?.url : d.avatar?.url) || null }
              },
              channelId: d.channelId || d.id,
            }
          };
        })
        .filter(c => c.id);
      if (items.length > 0) return { items, source: 'local' };
    } catch (_) {}
  }

  return { items: [], source: 'none' };
};
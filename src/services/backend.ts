/**
 * TorahTube Backend Service
 * Communicates with the PHP Cache & Data Manager via a local proxy
 */

import { YouTubeVideo } from './youtube';

const BACKEND_URL = '/api/backend/proxy';

// Robust fetch with retry and timeout
const robustFetch = async (url: string, options: RequestInit = {}, retries = 2): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch')))) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return robustFetch(url, options, retries - 1);
    }
    throw error;
  }
};

// Generate or get a unique user ID for session-specific memory
const getUserId = () => {
  // Check if we have a logged in user in sessionStorage (saved by App.tsx)
  const sessionUser = sessionStorage.getItem('youtube_user_v1');
  if (sessionUser) {
    try {
      const user = JSON.parse(sessionUser);
      if (user && user.email) {
        return user.email;
      }
    } catch (e) {}
  }

  // Fallback to localStorage for migration or non-session users
  const savedUser = localStorage.getItem('youtube_user_v1');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user && user.email) {
        return user.email;
      }
    } catch (e) {}
  }

  let userId = localStorage.getItem('torah_tube_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('torah_tube_user_id', userId);
  }
  return userId;
};

// --- New User Activity Functions (v14) ---

const safeJsonResponse = async (response: Response, errorPrefix: string) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (text.includes('<!doctype html>') || text.includes('<html')) {
      return null;
    }
    console.error(`${errorPrefix} JSON parse error:`, e, 'Response text:', text.substring(0, 200));
    return null;
  }
};

export const addUserActivity = async (type: 'history' | 'likes' | 'searches' | 'bells' | 'watch_later', data: any) => {
  try {
    const userEmail = getUserId();
    const response = await robustFetch(`${BACKEND_URL}?action=add_activity&user_email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });
    return await safeJsonResponse(response, `addUserActivity (${type})`);
  } catch (error) {
    console.error(`addUserActivity error (${type}):`, error);
    return null;
  }
};

export const removeUserActivity = async (type: 'history' | 'likes' | 'searches' | 'bells' | 'watch_later', itemId: string) => {
  try {
    const userEmail = getUserId();
    const response = await robustFetch(`${BACKEND_URL}?action=remove_activity&user_email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id: itemId }),
    });
    return await safeJsonResponse(response, `removeUserActivity (${type})`);
  } catch (error) {
    console.error(`removeUserActivity error (${type}):`, error);
    return null;
  }
};

export const getUserActivity = async (type: 'history' | 'likes' | 'searches' | 'bells' | 'watch_later') => {
  try {
    const userEmail = getUserId();
    const response = await robustFetch(`${BACKEND_URL}?action=get_activity&type=${type}&user_email=${encodeURIComponent(userEmail)}`);
    if (!response.ok) return [];
    const data = await safeJsonResponse(response, `getUserActivity (${type})`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`getUserActivity error (${type}):`, error);
    return [];
  }
};

export const setBackendCache = async (key: string, data: any) => {
  try {
    const userEmail = getUserId();
    const response = await robustFetch(`${BACKEND_URL}?action=set_cache&key=${encodeURIComponent(key)}&user_email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`Backend set_cache failed with status ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const result = JSON.parse(text);
      if (result && result.isRaw) {
        console.warn('Backend set_cache returned raw data:', result.data);
      }
      return result;
    } catch (e) {
      console.error('Backend set_cache JSON parse error:', e, 'Response text:', text.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Backend set_cache error:', error);
    return null;
  }
};

export const getBackendCache = async (key: string) => {
  try {
    const userEmail = getUserId();
    const response = await robustFetch(`${BACKEND_URL}?action=get_cache&key=${encodeURIComponent(key)}&user_email=${encodeURIComponent(userEmail)}&_t=${Date.now()}`);
    
    if (!response.ok) {
      console.error(`Backend get_cache failed with status ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Backend get_cache JSON parse error:', e, 'Response text:', text.substring(0, 200));
      return null;
    }
    
    if (data && data.isRaw) {
      console.warn('Backend get_cache returned raw data:', data.data);
      return null;
    }

    // If it's an object with status 'not_found' or 'expired', it's a cache miss
    if (data && typeof data === 'object' && !Array.isArray(data) && (data.status === 'not_found' || data.status === 'expired')) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Backend get_cache error:', error);
    return null;
  }
};

export const toggleLikeOnBackend = async (videoId: string, isLiked: boolean) => {
  try {
    const response = await robustFetch(`${BACKEND_URL}?action=toggle_like&videoId=${videoId}&isLiked=${isLiked}`);
    
    if (!response.ok) {
      console.error(`Backend toggle_like failed with status ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data && data.isRaw) {
        console.warn('Backend toggle_like returned raw data:', data.data);
        return null;
      }
      return data;
    } catch (e) {
      if (text.includes('<!doctype html>') || text.includes('<html')) {
        return null;
      }
      console.error('Backend toggle_like JSON parse error:', e, 'Response text:', text.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Backend toggle_like error:', error);
    return null;
  }
};

export const getLikesFromBackend = async (videoId: string) => {
  try {
    const response = await robustFetch(`${BACKEND_URL}?action=get_likes&videoId=${videoId}`);
    
    if (!response.ok) {
      console.error(`Backend get_likes failed with status ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data && data.isRaw) {
        console.warn('Backend get_likes returned raw data:', data.data);
        return 0;
      }
      return data.likes || 0;
    } catch (e) {
      console.error('Backend get_likes JSON parse error:', e, 'Response text:', text.substring(0, 200));
      return 0;
    }
  } catch (error) {
    console.error('Backend get_likes error:', error);
    return 0;
  }
};

export const trackUserOnBackend = async () => {
  try {
    const userId = getUserId();
    const response = await robustFetch(`${BACKEND_URL}?action=track_user&userId=${userId}`);
    
    if (!response.ok) {
      console.error(`Backend track_user failed with status ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data && data.isRaw) {
        console.warn('Backend track_user returned raw data:', data.data);
      }
      return data;
    } catch (e) {
      console.error('Backend track_user JSON parse error:', e, 'Response text:', text.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Backend track_user error:', error);
    return null;
  }
};

export const getActiveUsersFromBackend = async () => {
  try {
    const response = await robustFetch(`${BACKEND_URL}?action=get_active_users`);
    
    if (!response.ok) {
      console.error(`Backend get_active_users failed with status ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data && data.isRaw) {
        console.warn('Backend get_active_users returned raw data:', data.data);
        return 0;
      }
      // Handle both active_users and activeUsers for compatibility
      return data.active_users || data.activeUsers || 0;
    } catch (e) {
      console.error('Backend get_active_users JSON parse error:', e, 'Response text:', text.substring(0, 200));
      return 0;
    }
  } catch (error) {
    console.error('Backend get_active_users error:', error);
    return 0;
  }
};

// Helper for user-specific keys
export const getUserKey = (baseKey: string = "") => {
  if (!baseKey) return getUserId();
  return `${getUserId()}_${baseKey}`;
};

export const checkPaymentStatus = async (email: string) => {
  try {
    const response = await robustFetch(`${BACKEND_URL}?action=check_payment&email=${encodeURIComponent(email)}`);
    if (!response.ok) return { paid: false };
    const data = await safeJsonResponse(response, 'check_payment');
    return data || { paid: false };
  } catch (error) {
    console.error('Backend check_payment error:', error);
    return { paid: false };
  }
};

export const recordPaymentOnBackend = async (email: string, orderId: string) => {
  try {
    const response = await robustFetch(`${BACKEND_URL}?action=record_payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, orderId }),
    });
    if (!response.ok) return { status: 'error' };
    const data = await safeJsonResponse(response, 'record_payment');
    return data || { status: 'error' };
  } catch (error) {
    console.error('Backend record_payment error:', error);
    return { status: 'error' };
  }
};

export const toggleUserLikeOnBackend = async (videoId: string, isLiked: boolean, video?: YouTubeVideo) => {
  try {
    if (isLiked && video) {
      await addUserActivity('likes', video);
    } else {
      await removeUserActivity('likes', videoId);
    }
    
    // Also update the total global likes count
    return await toggleLikeOnBackend(videoId, isLiked);
  } catch (error) {
    console.error('Backend toggleUserLikeOnBackend error:', error);
    return null;
  }
};

export const checkIfUserLikedVideo = async (videoId: string) => {
  try {
    const likedVideos = await getUserActivity('likes');
    if (!likedVideos || !Array.isArray(likedVideos)) return false;
    
    return likedVideos.some((v: any) => {
      const vId = typeof v.id === 'string' ? v.id : (v.id?.videoId || "");
      return vId === videoId;
    });
  } catch (error) {
    console.error('Backend checkIfUserLikedVideo error:', error);
    return false;
  }
};

export const loginToBackend = async (user: any) => {
  try {
    const response = await robustFetch(`${BACKEND_URL}?action=login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.full_name || user.name || '',
        avatar: user.user_metadata?.avatar_url || user.avatar || ''
      }),
    });
    if (!response.ok) return null;
    const data = await safeJsonResponse(response, 'login');
    if (data && data.status === 'success' && data.token) {
      localStorage.setItem('youtube_access_token_v1', data.token);
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Backend login error:', error);
    return null;
  }
};

export const verifyBackendSession = async () => {
  try {
    const token = localStorage.getItem('youtube_access_token_v1');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await robustFetch(`${BACKEND_URL}?action=verify_session`, {
      credentials: 'include',
      headers
    });
    if (!response.ok) return null;
    const data = await safeJsonResponse(response, 'verify_session');
    if (data && data.status === 'success') {
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Backend verify session error:', error);
    return null;
  }
};

export const logoutFromBackend = async () => {
  try {
    localStorage.removeItem('youtube_access_token_v1');
    sessionStorage.removeItem('youtube_access_token_v1');
    await robustFetch(`${BACKEND_URL}?action=logout`, {
      credentials: 'include'
    });
  } catch (error) {
    console.error('Backend logout error:', error);
  }
};

export const getUserPlaylists = async (email: string) => {
  try {
    const data = await getBackendCache(`playlists_${email}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting user playlists:', error);
    return [];
  }
};

export const createUserPlaylist = async (email: string, name: string) => {
  try {
    const playlists = await getUserPlaylists(email);
    const newPlaylist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      videoCount: 0
    };
    playlists.push(newPlaylist);
    await setBackendCache(`playlists_${email}`, playlists);
    return newPlaylist;
  } catch (error) {
    console.error('Error creating user playlist:', error);
    return null;
  }
};

export const addVideoToUserPlaylist = async (email: string, playlistId: string, video: YouTubeVideo) => {
  try {
    const videosKey = `playlist_videos_${playlistId}`;
    let videos = await getBackendCache(videosKey);
    if (!Array.isArray(videos)) {
      videos = [];
    }
    
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    
    if (!videos.some((v: any) => {
      const vId = typeof v.id === 'string' ? v.id : v.id.videoId;
      return vId === videoId;
    })) {
      videos.push(video);
      await setBackendCache(videosKey, videos);
      
      const playlists = await getUserPlaylists(email);
      const playlistIndex = playlists.findIndex((p: any) => p.id === playlistId);
      if (playlistIndex !== -1) {
        playlists[playlistIndex].videoCount = videos.length;
        if (videos.length === 1) {
          const thumb = video.snippet?.thumbnails?.maxres?.url || video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url;
          playlists[playlistIndex].thumbnail = thumb;
        }
        await setBackendCache(`playlists_${email}`, playlists);
      }
    }
    return true;
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    return false;
  }
};

export const removeVideoFromUserPlaylist = async (email: string, playlistId: string, videoId: string) => {
  try {
    const videosKey = `playlist_videos_${playlistId}`;
    let videos = await getBackendCache(videosKey);
    if (!Array.isArray(videos)) return false;
    
    const initialLength = videos.length;
    videos = videos.filter((v: any) => {
      const vId = typeof v.id === 'string' ? v.id : v.id.videoId;
      return vId !== videoId;
    });
    
    if (videos.length !== initialLength) {
      await setBackendCache(videosKey, videos);
      
      const playlists = await getUserPlaylists(email);
      const playlistIndex = playlists.findIndex((p: any) => p.id === playlistId);
      if (playlistIndex !== -1) {
        playlists[playlistIndex].videoCount = videos.length;
        if (videos.length > 0) {
          const firstVideo = videos[0];
          const thumb = firstVideo.snippet?.thumbnails?.maxres?.url || firstVideo.snippet?.thumbnails?.high?.url || firstVideo.snippet?.thumbnails?.medium?.url || firstVideo.snippet?.thumbnails?.default?.url;
          playlists[playlistIndex].thumbnail = thumb;
        } else {
          playlists[playlistIndex].thumbnail = undefined;
        }
        await setBackendCache(`playlists_${email}`, playlists);
      }
    }
    return true;
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    return false;
  }
};

export const getPlaylistVideos = async (email: string, playlistId: string) => {
  try {
    const videosKey = `playlist_videos_${playlistId}`;
    const videos = await getBackendCache(videosKey);
    return Array.isArray(videos) ? videos : [];
  } catch (error) {
    console.error('Error getting playlist videos:', error);
    return [];
  }
};

export const deleteUserPlaylist = async (email: string, playlistId: string) => {
  try {
    const playlists = await getUserPlaylists(email);
    const updatedPlaylists = playlists.filter((p: any) => p.id !== playlistId);
    await setBackendCache(`playlists_${email}`, updatedPlaylists);
    
    await setBackendCache(`playlist_videos_${playlistId}`, []);
    return true;
  } catch (error) {
    console.error('Error deleting user playlist:', error);
    return false;
  }
};

export const editUserPlaylist = async (email: string, playlistId: string, updates: { name?: string, description?: string, voting?: string }) => {
  try {
    const playlists = await getUserPlaylists(email);
    const playlistIndex = playlists.findIndex((p: any) => p.id === playlistId);
    if (playlistIndex !== -1) {
      playlists[playlistIndex] = { ...playlists[playlistIndex], ...updates };
      await setBackendCache(`playlists_${email}`, playlists);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error editing user playlist:', error);
    return false;
  }
};

// ─── VIDEO PROGRESS — שמירת מיקום צפייה ────────────────────────────────────

const PROGRESS_LS_KEY = 'video_progress_map_v1';

export const getLocalVideoProgress = (): Record<string, { currentTime: number; duration: number; savedAt?: number }> => {
  try {
    const raw = localStorage.getItem(PROGRESS_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

export const saveVideoProgress = async (videoId: string, currentTime: number, duration: number): Promise<void> => {
  if (!videoId || currentTime < 5) return;
  try {
    // Save to localStorage immediately
    const map = getLocalVideoProgress();
    map[videoId] = { currentTime, duration, savedAt: Date.now() };
    // Keep max 300 entries
    const keys = Object.keys(map);
    if (keys.length > 300) {
      keys.sort((a, b) => (map[a].savedAt || 0) - (map[b].savedAt || 0));
      keys.slice(0, keys.length - 300).forEach(k => delete map[k]);
    }
    localStorage.setItem(PROGRESS_LS_KEY, JSON.stringify(map));

    // Sync to PHP server in background
    const userEmail = getUserId();
    if (!userEmail || userEmail.startsWith('user_')) return;
    robustFetch(`${BACKEND_URL}?action=save_video_progress&user_email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, currentTime, duration }),
    }).catch(() => {});
  } catch (e) {
    console.error('saveVideoProgress error:', e);
  }
};

export const loadVideoProgressFromBackend = async (): Promise<Record<string, { currentTime: number; duration: number }>> => {
  try {
    const userEmail = getUserId();
    if (!userEmail || userEmail.startsWith('user_')) return getLocalVideoProgress();
    const response = await robustFetch(`${BACKEND_URL}?action=get_video_progress&user_email=${encodeURIComponent(userEmail)}`);
    const serverMap = await safeJsonResponse(response, 'loadVideoProgressFromBackend');
    if (!serverMap || typeof serverMap !== 'object') return getLocalVideoProgress();
    // Merge: server wins unless localStorage has newer savedAt
    const localMap = getLocalVideoProgress();
    const merged: Record<string, { currentTime: number; duration: number; savedAt?: number }> = { ...serverMap };
    for (const [vid, local] of Object.entries(localMap)) {
      const srv = serverMap[vid];
      if (!srv || (local.savedAt && (!srv.savedAt || local.savedAt > srv.savedAt))) {
        merged[vid] = local;
      }
    }
    localStorage.setItem(PROGRESS_LS_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('loadVideoProgressFromBackend error:', e);
    return getLocalVideoProgress();
  }
};

// ─── FILTER STATUSES — זיכרון סינון נטפרי ──────────────────────────────────

const FILTER_LS_KEY = 'video_filter_status_v1';

export const getLocalFilterStatuses = (): Record<string, 'open' | 'blocked'> => {
  try {
    const raw = localStorage.getItem(FILTER_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

export const saveFilterStatus = async (videoId: string, status: 'open' | 'blocked'): Promise<void> => {
  if (!videoId) return;
  try {
    const map = getLocalFilterStatuses();
    map[videoId] = status;
    localStorage.setItem(FILTER_LS_KEY, JSON.stringify(map));

    const userEmail = getUserId();
    if (!userEmail || userEmail.startsWith('user_')) return;
    robustFetch(`${BACKEND_URL}?action=save_filter_statuses&user_email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [videoId]: status }),
    }).catch(() => {});
  } catch (e) {
    console.error('saveFilterStatus error:', e);
  }
};

export const loadFilterStatusesFromBackend = async (): Promise<Record<string, 'open' | 'blocked'>> => {
  try {
    const userEmail = getUserId();
    if (!userEmail || userEmail.startsWith('user_')) return getLocalFilterStatuses();
    const response = await robustFetch(`${BACKEND_URL}?action=get_filter_statuses&user_email=${encodeURIComponent(userEmail)}`);
    const serverMap = await safeJsonResponse(response, 'loadFilterStatusesFromBackend');
    if (!serverMap || typeof serverMap !== 'object') return getLocalFilterStatuses();
    const merged = { ...getLocalFilterStatuses(), ...serverMap };
    localStorage.setItem(FILTER_LS_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('loadFilterStatusesFromBackend error:', e);
    return getLocalFilterStatuses();
  }
};
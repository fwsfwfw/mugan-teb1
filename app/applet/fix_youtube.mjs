import fs from 'fs';

let content = fs.readFileSync('src/services/youtube.ts', 'utf8');

content = content.replace(/};\n\n};\n\s*\/\/ RapidAPI fallback\n\s*try \{\n\s*return await throttledFetch\("video\/details"/, 
`};

// ─── Video Details ───────────────────────
export const getVideoDetails = async (videoId: string): Promise<any> => {
  if (!videoId) return null;

  // RapidAPI fallback
  try {
    return await throttledFetch("video/details"`);

content = content.replace(/};\n\s*return \{ items: \[\] \};\n};\n\n\s*\/\/ RapidAPI fallback\n\s*try \{\n\s*const data = await throttledFetch\("channel\/videos"/,
`};

// ─── Channel Videos ─────────────────────────────────────────
export const getVideosByChannel = async (channelId: string, pageToken?: string, sort: string = "newest"): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  // RapidAPI fallback
  try {
    const data = await throttledFetch("channel/videos"`);

content = content.replace(/};\n\s*return \{ items: \[\] \};\n};\n\n\s*\/\/ RapidAPI fallback\n\s*try \{\n\s*\/\/ Since channel\/shorts/,
`};

// ─── Shorts ──────────────────────────────────────────────────
export const getChannelShorts = async (channelId: string, pageToken?: string): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  // RapidAPI fallback
  try {
    // Since channel/shorts`);

content = content.replace(/};\n\s*return \{ items: \[\] \};\n};\n\n\s*\/\/ RapidAPI fallback — filter long videos/,
`};

// ─── Live Streams ───────────────────────────────────────────
export const getChannelLiveStreams = async (channelId: string, pageToken?: string): Promise<{ items: YouTubeVideo[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  // RapidAPI fallback — filter long videos`);

content = content.replace(/};\n\s*return \{ items: \[\] \};\n};\n\n\s*\/\/ RapidAPI fallback\n\s*try \{\n\s*const data = await throttledFetch\("channel\/playlists"/,
`};

// ─── Playlists ──────────────────────────────────────────────
export const getChannelPlaylists = async (channelId: string, pageToken?: string): Promise<{ items: any[], nextPageToken?: string }> => {
  if (!channelId) return { items: [] };

  // RapidAPI fallback
  try {
    const data = await throttledFetch("channel/playlists"`);

content = content.replace(/\/\/ Fallback: single trending query\n\s*\n\n\s*\/\/ RapidAPI fallback/,
`// Fallback: single trending query

  // RapidAPI fallback`);

fs.writeFileSync('src/services/youtube.ts', content);

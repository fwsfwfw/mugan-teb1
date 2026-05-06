import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import cookieParser from "cookie-parser";
import { Innertube } from "youtubei.js";

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use((req, res, next) => {
  express.json({ limit: '50mb', strict: false })(req, res, (err) => {
    if (err) {
      console.error("JSON Parsing Error:", err.message);
      return res.status(400).json({ error: "Invalid JSON", message: err.message });
    }
    next();
  });
});
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = process.env.APP_URL 
  ? `${process.env.APP_URL}/auth/callback` 
  : "http://localhost:3000/auth/callback";

const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

let yt: Innertube | null = null;
Innertube.create().then(instance => {
  yt = instance;
  console.log("YouTubei.js initialized");
}).catch(console.error);

// Cache for search continuations
const searchCache = new Map<string, any>();

// API routes
app.get("/api/youtubei/search", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { q, type, cursor, duration, sort_by, upload_date, features } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });
    
    let results;
    // We append the filters to the cache key so they don't overlap
    const filtersKey = `${type || 'all'}_${duration || ''}_${sort_by || ''}_${upload_date || ''}_${features || ''}`;
    const cacheKey = `${q}_${filtersKey}`;
    
    if (cursor && searchCache.has(cacheKey)) {
      const cachedSearch = searchCache.get(cacheKey);
      if (cachedSearch.has_continuation) {
        results = await cachedSearch.getContinuation();
        searchCache.set(cacheKey, results); // Update cache with new continuation
      } else {
        return res.json({ contents: [], hasContinuation: false });
      }
    } else {
      const searchOptions: any = { type: (type as string) || 'all' };
      if (duration) searchOptions.duration = duration;
      if (sort_by) searchOptions.sort_by = sort_by;
      if (upload_date) searchOptions.upload_date = upload_date;
      if (features) searchOptions.features = (features as string).split(',');

      results = await yt.search(q as string, searchOptions);
      searchCache.set(cacheKey, results);
    }
    
    const itemsArray = results.results || results.items || results.contents || (Array.isArray(results) ? results : []);
    const items = itemsArray.flatMap((item: any) => {
      if (item.type === 'Video') {
        return [{
          type: 'video',
          video: {
            videoId: item.id,
            title: item.title?.text || item.title,
            description: item.description?.text || '',
            lengthText: item.duration?.text || '',
            lengthSeconds: item.duration?.seconds || 0,
            viewCountText: item.view_count?.text || '',
            publishedTimeText: item.published?.text || '',
            thumbnails: item.thumbnails,
            isShort: item.is_short || false,
            author: {
              channelId: item.author?.id,
              title: item.author?.name,
              avatar: item.author?.thumbnails
            }
          }
        }];
      } else if (item.type === 'Channel') {
        return [{
          type: 'channel',
          channel: {
            channelId: item.id,
            title: item.author?.name || item.title?.text || item.title,
            description: item.descriptionSnippet?.text || item.description?.text || item.description || '',
            avatar: item.author?.thumbnails || item.thumbnails,
            subscriberCountText: item.subscriber_count?.text || item.subscribers?.text || ''
          }
        }];
      } else if (item.type === 'Shelf') {
        // Handle shorts shelf
        if (item.title?.text?.toLowerCase().includes('shorts')) {
          return item.content?.items?.map((shortItem: any) => ({
            type: 'short',
            video: {
              videoId: shortItem.id,
              title: shortItem.title?.text || shortItem.title,
              viewCountText: shortItem.view_count?.text || '',
              thumbnails: shortItem.thumbnails,
              isShort: true,
              author: {
                title: shortItem.author?.name || '',
              }
            }
          })) || [];
        }
      }
      return [];
    });
    
    res.json({ 
      contents: items, 
      hasContinuation: results.has_continuation,
      cursorNext: results.has_continuation ? (parseInt(cursor as string || "1") + 1).toString() : undefined
    });
  } catch (error) {
    console.error("YouTubei Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/api/youtubei/channel/details", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Channel ID is required" });
    
    const channel = await yt.getChannel(id as string);
    res.json({
      channelId: (channel.metadata as any).ucid,
      title: (channel.metadata as any).title,
      description: (channel.metadata as any).description,
      avatar: (channel.metadata as any).avatar,
      banner: (channel.metadata as any).banner,
      subscriberCountText: (channel.header as any)?.subscribers?.text || ''
    });
  } catch (error) {
    console.error("YouTubei Channel Details Error:", error);
    res.status(500).json({ error: "Failed to get channel details" });
  }
});

app.get("/api/youtubei/channel/videos", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Channel ID is required" });
    
    const channel = await yt.getChannel(id as string);
    const videos = await channel.getVideos();
    
    const items = videos.videos.map((item: any) => ({
      type: 'video',
      video: {
        videoId: item.id,
        title: item.title?.text || item.title,
        lengthText: item.duration?.text || '',
        lengthSeconds: item.duration?.seconds || 0,
        viewCountText: item.view_count?.text || '',
        publishedTimeText: item.published?.text || '',
        thumbnails: item.thumbnails,
        author: {
          channelId: (channel.metadata as any).ucid,
          title: (channel.metadata as any).title,
          avatar: (channel.metadata as any).avatar
        }
      }
    }));
    
    res.json({ contents: items });
  } catch (error) {
    console.error("YouTubei Channel Videos Error:", error);
    res.status(500).json({ error: "Failed to get channel videos" });
  }
});

app.get("/api/youtubei/channel/shorts", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Channel ID is required" });
    
    const channel = await yt.getChannel(id as string);
    const shorts = await channel.getShorts();
    
    const items = shorts.videos.map((item: any) => ({
      type: 'short',
      video: {
        videoId: item.id,
        title: item.title?.text || item.title,
        viewCountText: item.view_count?.text || '',
        thumbnails: item.thumbnails,
        isShort: true,
        author: {
          channelId: (channel.metadata as any).ucid,
          title: (channel.metadata as any).title,
          avatar: (channel.metadata as any).avatar
        }
      }
    }));
    
    res.json({ contents: items });
  } catch (error) {
    console.error("YouTubei Channel Shorts Error:", error);
    res.status(500).json({ error: "Failed to get channel shorts" });
  }
});

app.get("/api/youtubei/channel/playlists", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Channel ID is required" });
    
    const channel = await yt.getChannel(id as string);
    const playlists = await channel.getPlaylists();
    
    const items = playlists.playlists.map((item: any) => ({
      type: 'playlist',
      playlist: {
        playlistId: item.id,
        title: item.title?.text || item.title,
        videoCount: item.video_count?.text || '',
        thumbnails: item.thumbnails,
        author: {
          channelId: (channel.metadata as any).ucid,
          title: (channel.metadata as any).title
        }
      }
    }));
    
    res.json({ contents: items });
  } catch (error) {
    console.error("YouTubei Channel Playlists Error:", error);
    res.status(500).json({ error: "Failed to get channel playlists" });
  }
});

app.get("/api/youtubei/playlist/videos", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Playlist ID is required" });
    
    const playlist = await yt.getPlaylist(id as string);
    
    const items = playlist.items.map((item: any) => ({
      type: 'video',
      video: {
        videoId: item.id,
        title: item.title?.text || item.title,
        lengthText: item.duration?.text || '',
        lengthSeconds: item.duration?.seconds || 0,
        thumbnails: item.thumbnails,
        author: {
          channelId: item.author?.id,
          title: item.author?.name
        }
      }
    }));
    
    res.json({ contents: items });
  } catch (error) {
    console.error("YouTubei Playlist Videos Error:", error);
    res.status(500).json({ error: "Failed to get playlist videos" });
  }
});

app.get("/api/youtubei/video/details", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Video ID is required" });
    
    const video = await yt.getBasicInfo(id as string);
    
    res.json({
      videoId: video.basic_info.id,
      title: video.basic_info.title,
      description: video.basic_info.short_description,
      lengthSeconds: video.basic_info.duration,
      viewCount: video.basic_info.view_count,
      author: {
        channelId: video.basic_info.channel_id,
        title: video.basic_info.channel?.name
      }
    });
  } catch (error) {
    console.error("YouTubei Video Details Error:", error);
    res.status(500).json({ error: "Failed to get video details" });
  }
});

app.get("/api/youtubei/video/stream", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Video ID is required" });
    
    const info = await yt.getInfo(id as string);
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    
    if (!format || !format.url) {
      return res.status(404).json({ error: "No audio stream found" });
    }
    
    res.json({ url: format.url });
  } catch (error) {
    console.error("YouTubei Stream Error:", error);
    res.status(500).json({ error: "Failed to get stream" });
  }
});

app.get("/api/youtubei/channel/streams", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Channel ID is required" });
    
    const channel = await yt.getChannel(id as string);
    const streams = await channel.getLiveStreams();
    
    const items = streams.videos.map((item: any) => ({
      type: 'video',
      video: {
        videoId: item.id,
        title: item.title?.text || item.title,
        viewCountText: item.view_count?.text || '',
        thumbnails: item.thumbnails,
        isLive: true,
        author: {
          channelId: (channel.metadata as any).ucid,
          title: (channel.metadata as any).title,
          avatar: (channel.metadata as any).avatar
        }
      }
    }));
    
    res.json({ contents: items });
  } catch (error) {
    console.error("YouTubei Channel Streams Error:", error);
    res.status(500).json({ error: "Failed to get channel streams" });
  }
});

app.get("/api/youtubei/channel/community", async (req, res) => {
  if (!yt) return res.status(503).json({ error: "YouTube API not ready" });
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Channel ID is required" });
    
    const channel = await yt.getChannel(id as string);
    const community = await channel.getCommunity();
    
    const items = community.posts.map((item: any) => ({
      type: 'post',
      post: {
        postId: item.id,
        text: item.content?.text || '',
        publishedTimeText: item.published?.text || '',
        attachment: item.attachment ? {
          type: item.attachment.type,
          thumbnails: item.attachment.thumbnails || item.attachment.images?.map((img: any) => img.source?.[0]) || []
        } : null,
        author: {
          channelId: (channel.metadata as any).ucid,
          title: (channel.metadata as any).title,
          avatar: (channel.metadata as any).avatar
        },
        stats: {
          likesText: item.likes?.text || '0',
          commentsText: item.comments?.text || '0'
        }
      }
    }));
    
    res.json({ contents: items });
  } catch (error) {
    console.error("YouTubei Channel Community Error:", error);
    res.status(500).json({ error: "Failed to get channel community" });
  }
});

app.get("/api/youtube/suggestions", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(q as string)}&hl=iw&oe=utf-8`;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    // The response is in a format like: window.google.ac.h(["query",[["suggestion1",0],["suggestion2",0]]])
    // We need to extract the suggestions array.
    const match = text.match(/\((.*)\)/);
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      const suggestions = data[1].map((item: any) => item[0]);
      res.json(suggestions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Suggestions Error:", error);
    res.json([]);
  }
});

app.get("/api/auth/url", (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: "YouTube Client ID or Secret is missing in environment variables" });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.force-ssl"
    ],
    prompt: "consent"
  });

  res.json({ url });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // Store tokens in a cookie (secure and sameSite=none for iframe)
    res.cookie("youtube_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'YOUTUBE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>התחברת בהצלחה! החלון ייסגר כעת...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/status", (req, res) => {
  const tokens = req.cookies.youtube_tokens;
  if (tokens) {
    res.json({ authenticated: true, tokens: JSON.parse(tokens) });
  } else {
    res.json({ authenticated: false });
  }
});

app.get("/api/netfree/check", async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Video ID is required" });

  try {
    const url = `https://www.google.com/~netfree/test-url?u=https://www.youtube.com/watch?v=${videoId}&h=000000000000000000`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from NetFree" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("NetFree Proxy Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Proxy for PHP Backend to avoid Mixed Content (HTTP from HTTPS)
app.all("/api/backend/proxy", async (req, res) => {
  const BACKEND_PHP_URL = 'http://yehokarpel-test.xo.je/ai_studio_code.php';
  const action = req.query.action || 'unknown';
  
  // console.log(`[Backend Proxy] Action: ${action}, Method: ${req.method}`);
  
  const url = new URL(BACKEND_PHP_URL);
  Object.entries(req.query).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    const options: RequestInit = {
      method: req.method,
      headers: {}
    };

    if (req.method === 'POST' || req.method === 'PUT') {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(req.body);
    }

    // console.log(`Backend Proxy: ${req.method} ${url.toString()}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(url.toString(), {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get("content-type");
    
    const text = await response.text();
    const cleanText = text.trim();
    
    if (contentType && contentType.includes("application/json")) {
      if (!cleanText) {
        return res.status(response.status).json({});
      }
      try {
        // Try to find valid JSON within the response (in case of PHP warnings/errors)
        let jsonToParse = cleanText;
        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');
        const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
        
        if (start !== -1) {
          const lastBrace = cleanText.lastIndexOf('}');
          const lastBracket = cleanText.lastIndexOf(']');
          const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;
          
          if (end !== -1 && end > start) {
            jsonToParse = cleanText.substring(start, end + 1);
          }
        }

        const data = JSON.parse(jsonToParse);
        res.status(response.status).json(data);
      } catch (e) {
        // Silently handle invalid JSON from backend by returning it as raw data
        res.status(response.status).json({ 
          status: "error", 
          message: "Failed to parse JSON from backend", 
          data: cleanText,
          isRaw: true 
        });
      }
    } else {
      console.log(`Backend Proxy: Received non-JSON response (${response.status})`);
      
      // If it's not JSON, we still want to return it as a string or an error
      try {
        // Try to parse it anyway in case content-type was wrong
        const data = JSON.parse(text);
        res.status(response.status).json(data);
      } catch (e) {
        // If it's really not JSON, return it as a JSON object with the raw text
        res.status(response.status).json({ 
          status: response.status, 
          data: text,
          isRaw: true,
          message: "Non-JSON response from backend"
        });
      }
    }
  } catch (error) {
    console.error("Backend Proxy Error:", error);
    res.status(500).json({ 
      status: "error", 
      error: "Failed to fetch from PHP backend", 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

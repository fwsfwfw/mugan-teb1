import fs from 'fs';

let content = fs.readFileSync('src/services/youtube.ts', 'utf8');

// Remove mapInvidiousVideo
content = content.replace(/\/\/ Map an Invidious video object[\s\S]*?const mapInvidiousVideo = \([\s\S]*?};\n/g, '');

// Remove Invidious blocks
content = content.replace(/\s*\/\/\s*── 1\. Try Invidious ──────────────────────────────────────────────────────[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/\s*\/\/\s*─── Video Details \(Invidious first, RapidAPI fallback\) ───────────────────────[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/\s*\/\/\s*─── Channel Videos \(Invidious first\) ─────────────────────────────────────────[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/\s*\/\/\s*─── Channel Home \(Invidious latestVideos \+ featured\) ─────────────────────────[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/\s*\/\/\s*─── Shorts \(Invidious first\) ──────────────────────────────────────────────────[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/\s*\/\/\s*─── Live Streams \(Invidious first\) ───────────────────────────────────────────[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/\s*\/\/\s*─── Playlists \(Invidious first\) ──────────────────────────────────────────────[\s\S]*?catch \(_\) \{\}/g, '');

// Remove other invidiousFetch calls
content = content.replace(/try\s*\{\s*let invData: any = null;\s*invData = await invidiousFetch[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/try\s*\{\s*const inv = await invidiousFetch[\s\S]*?catch \(_\) \{\}/g, '');
content = content.replace(/const results = await Promise\.allSettled\(\s*pageQueries\.map\(q =>\s*invidiousFetch[\s\S]*?\)\s*\);/g, '');
content = content.replace(/const results = await Promise\.allSettled\(\s*artistQueries\.map\(async \(q\) => \{\s*try \{\s*const inv = await invidiousFetch[\s\S]*?catch \(_\) \{ return null; \}\s*\}\)\s*\);/g, '');

fs.writeFileSync('src/services/youtube.ts', content);

import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create();
  
  // 1. Search
  const search = await yt.search('שיעור תורה');
  console.log('Search:', search.results.length);
  
  // 2. Channel Details
  const channel = await yt.getChannel('UC2G7zKbsBNpoVYbwb-NS56w');
  console.log('Channel:', channel.metadata.title);
  
  // 3. Channel Videos
  const videos = await channel.getVideos();
  console.log('Channel Videos:', videos.videos.length);
  
  // 4. Channel Shorts
  const shorts = await channel.getShorts();
  console.log('Channel Shorts:', shorts.videos.length);
  
  // 5. Channel Playlists
  const playlists = await channel.getPlaylists();
  console.log('Channel Playlists:', playlists.playlists.length);
  
  // 6. Playlist Videos
  const playlist = await yt.getPlaylist('PL_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1_1'); // fake id
  
  // 7. Video Details
  const video = await yt.getBasicInfo('dQw4w9WgXcQ');
  console.log('Video:', video.basic_info.title);
}
test().catch(console.error);

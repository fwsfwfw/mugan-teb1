import { getPopularTorahVideos } from './src/services/youtube';

getPopularTorahVideos().then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);

import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create();
  const search = await yt.search('test');
  console.log(search.results.length);
}
test().catch(console.error);

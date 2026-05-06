import { searchChannels } from '../src/services/youtube';

const handles = [
  "ravmeireliyahu",
  "HaravZamirCohen",
  "TVhidabroot",
  "anafeam",
  "ravronen",
  "HaravSnirGueta",
  "RabbiEyalAmrami",
  "RabbiRosenblum",
  "Maran_1",
  "HaravOvadiaYosef",
  "tv-2000",
  "RabbiFanger"
];

async function run() {
  for (const handle of handles) {
    try {
      const res = await searchChannels(handle);
      if (res && res.length > 0) {
        console.log(`Handle: ${handle}, ID: ${res[0].id}, Title: ${res[0].title}`);
      } else {
        console.log(`Handle: ${handle}, ID: NOT FOUND`);
      }
    } catch (e) {
      console.error(`Error for ${handle}:`, e);
    }
  }
}

run();

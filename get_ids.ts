const handles = [
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

async function run() {
  for (const handle of handles) {
    try {
      const res = await fetch(`https://yewtu.be/api/v1/search?q=${handle}&type=channel`);
      const json = await res.json();
      if (json && json.length > 0) {
        console.log(`"${handle}": "${json[0].authorId}",`);
      } else {
        console.log(`"${handle}": "NOT_FOUND",`);
      }
    } catch (e) {
      console.log(`"${handle}": "ERROR",`);
    }
  }
}

run();

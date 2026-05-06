const fetch = require('node-fetch'); // wait, fetch is built-in in node 22
async function run() {
  const res = await fetch('https://youtube138.p.rapidapi.com/channel/details?id=UC0gZ2-X8N6LvYae1DubqMcQ&hl=iw&gl=IL', {
    headers: {
      'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
      'x-rapidapi-host': 'youtube138.p.rapidapi.com'
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();

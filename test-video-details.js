import https from 'https';

const options = {
  hostname: 'youtube138.p.rapidapi.com',
  port: 443,
  path: '/video/details/?id=dQw4w9WgXcQ&hl=en&gl=US',
  method: 'GET',
  headers: {
    'x-rapidapi-key': '04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44',
    'x-rapidapi-host': 'youtube138.p.rapidapi.com'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json.stats, null, 2));
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();

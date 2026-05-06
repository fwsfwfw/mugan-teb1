import dotenv from 'dotenv';
dotenv.config();

const apiKey = "04088663c0mshd99c7b3acd3b5f4p1be9bajsnaae6748fef44";

async function test() {
  const url = `https://youtube138.p.rapidapi.com/search/?q=${encodeURIComponent('שיעור תורה #shorts')}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'youtube138.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result.contents.slice(0, 2).map(v => v.video.lengthSeconds));
  } catch (error) {
    console.error(error);
  }
}

test();

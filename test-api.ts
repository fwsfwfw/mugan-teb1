fetch('http://localhost:3000/api/youtubei/search?q=test').then(r=>r.json()).then(d=>console.log(d.contents ? d.contents.length : d)).catch(console.error);

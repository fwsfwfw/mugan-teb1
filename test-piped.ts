fetch('https://pipedapi.adminforge.de/search?q=test&filter=all').then(r=>r.json()).then(d=>console.log(d.items ? d.items.length : d)).catch(console.error);

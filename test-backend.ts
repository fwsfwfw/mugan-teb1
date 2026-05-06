
async function test() {
  try {
    const res = await fetch('http://yehokarpel-test.xo.je/ai_studio_code.php?action=get_active_users');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.substring(0, 100));
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
test();

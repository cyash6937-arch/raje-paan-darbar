const webpush = require('web-push');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { idToken, subscription, title, body } = req.body || {};
    if (!idToken || !subscription || !subscription.endpoint) return res.status(400).json({ error: 'bad request' });

    // Only the shop's staff account may send notifications
    const apiKey = process.env.FIREBASE_API_KEY;
    const v = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!v.ok) return res.status(401).json({ error: 'unauthorized' });
    const data = await v.json();
    const email = data.users && data.users[0] && data.users[0].email;
    if (!email || email.toLowerCase() !== String(process.env.STAFF_EMAIL).toLowerCase()) {
      return res.status(403).json({ error: 'not staff' });
    }

    webpush.setVapidDetails('mailto:' + process.env.STAFF_EMAIL, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    await webpush.sendNotification(subscription, JSON.stringify({
      title: String(title || '').slice(0, 100),
      body: String(body || '').slice(0, 200)
    }), { TTL: 3600, urgency: 'high' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e.statusCode || e.message) });
  }
};

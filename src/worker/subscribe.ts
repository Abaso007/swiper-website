import { Hono } from 'hono';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ORIGINS = [
  'https://swiperjs.com',
  'https://www.swiperjs.com',
  'http://localhost:3000',
  'http://localhost:8080',
];

export const subscribeApp = new Hono<{ Bindings: CloudflareBindings }>();

subscribeApp.post('/subscribe', async (c) => {
  const origin = c.req.header('origin') || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const apiKey = c.env.BEEHIIV_API_KEY;
  const publicationId = c.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    console.error('subscribe: missing Beehiiv env vars');
    return c.json({ error: 'Subscription is not configured' }, 500);
  }

  let payload: { email?: unknown; website?: unknown };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  if (typeof payload.website === 'string' && payload.website.length > 0) {
    return c.json({ ok: true });
  }

  const email =
    typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return c.json({ error: 'Please enter a valid email' }, 422);
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          send_welcome_email: true,
          reactivate_existing: true,
          utm_source: 'swiperjs.com',
          utm_medium: 'nav-modal',
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('Beehiiv subscribe failed', res.status, body);
      return c.json({ error: 'Subscription failed. Please try again.' }, 502);
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error('Beehiiv subscribe error', err);
    return c.json({ error: 'Subscription failed. Please try again.' }, 502);
  }
});

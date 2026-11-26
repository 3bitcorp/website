/**
 * Netlify Function: POST /api/contact
 *
 * 1. Verifies the Cloudflare Turnstile token (server-side)
 * 2. If valid, forwards the submission to Netlify Forms
 *    (which triggers email notification to your inbox)
 * 3. Returns JSON so the frontend can show success/error
 *
 * Required env var in Netlify UI:
 *   TURNSTILE_SECRET  — your Cloudflare Turnstile secret key
 */

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { name, email, company, service, message, turnstileToken } = body;

  // ── 1. Basic field validation ───────────────────────────
  if (!name || !email || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name, email and message are required.' }),
    };
  }

  // ── 2. Verify Turnstile token ───────────────────────────
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.error('TURNSTILE_SECRET env var is not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: turnstileToken || '',
      remoteip: event.headers['x-forwarded-for'] || '',
    }).toString(),
  });

  const verifyData = await verifyRes.json();

  if (!verifyData.success) {
    console.warn('Turnstile verification failed:', verifyData['error-codes']);
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Security check failed. Please try again.' }),
    };
  }

  // ── 3. Forward to Netlify Forms ─────────────────────────
  // Netlify Forms listens on the same site's /__forms endpoint.
  // We POST as application/x-www-form-urlencoded with form-name matching
  // the hidden <form name="contact"> element in index.html.
  const siteUrl = process.env.URL || 'http://localhost:8888';

  const formPayload = new URLSearchParams({
    'form-name': 'contact',
    name,
    email,
    company: company || '',
    service: service || '',
    message,
  });

  const netlifyFormRes = await fetch(`${siteUrl}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formPayload.toString(),
  });

  if (!netlifyFormRes.ok) {
    // Non-fatal: log but still return success to user since Turnstile passed.
    // You can add a secondary notification (email via Resend, etc.) here later.
    console.warn('Netlify Forms POST failed:', netlifyFormRes.status);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true }),
  };
};

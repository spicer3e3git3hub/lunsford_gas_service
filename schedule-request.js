// Cloudflare Pages Function — handles POST /api/schedule-request
//
// Setup required before this works (see README.md):
//   1. Create a free Resend account at resend.com and verify your domain.
//   2. In the Cloudflare Pages dashboard, add these environment variables:
//        RESEND_API_KEY   the Resend API key
//        NOTIFY_EMAIL     the office email that should receive requests
//        FROM_EMAIL       a verified sender address, e.g. requests@lunsfordgaslogs.com

const SERVICE_LABELS = {
  'gas-logs': 'Gas logs not working or needing service',
  'new-logs': 'New gas log installation',
  'firepit': 'Gas fire pit install or service',
  
  'outdoor-kitchen': 'Outdoor kitchen equipment installation',
  'gas-leak': 'Possible gas leak or gas smell',
  'other': 'Other'
};

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const required = ['name', 'phone', 'address', 'serviceType'];
  const missing = required.filter((field) => !data[field] || !String(data[field]).trim());
  if (missing.length) {
    return jsonResponse({ error: 'Missing required fields', missing }, 400);
  }

  const serviceLabel = SERVICE_LABELS[data.serviceType] || data.serviceType;
  const isUrgent = data.serviceType === 'gas-leak';

  const subject = (isUrgent ? '[POSSIBLE GAS LEAK] ' : '') + 'New appointment request from ' + data.name;

  const bodyLines = [
    'New appointment request from the website:',
    '',
    'Name: ' + data.name,
    'Phone: ' + data.phone,
    'Email: ' + (data.email || 'Not provided'),
    'Address: ' + data.address,
    'Service: ' + serviceLabel,
    data.otherDetail ? 'Details: ' + data.otherDetail : null,
    'Preferred date: ' + (data.preferredDate || 'No preference'),
    'Preferred time: ' + (data.preferredWindow || 'Flexible'),
    data.notes ? 'Notes: ' + data.notes : null
  ].filter(Boolean).join('\n');

  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL || !env.FROM_EMAIL) {
    // Environment variables have not been configured yet in the Cloudflare Pages
    // dashboard. Fail clearly instead of pretending the email sent.
    return jsonResponse(
      { error: 'Email is not configured yet. See functions/api/schedule-request.js and README.md.' },
      500
    );
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: env.NOTIFY_EMAIL,
        reply_to: data.email || undefined,
        subject: subject,
        text: bodyLines
      })
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      return jsonResponse({ error: 'Email provider rejected the message', detail }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: 'Unexpected error sending email' }, 500);
  }
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

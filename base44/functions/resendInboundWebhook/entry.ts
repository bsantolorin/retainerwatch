import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Webhook } from 'npm:svix@1.76.0';

function extractEmail(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.match(/<([^>]+)>/)?.[1] || value;
  return value.email || value.address || '';
}

function extractEmails(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(extractEmail).filter(Boolean);
  return [extractEmail(value)].filter(Boolean);
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ ok: true });
    }

    const signingSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (!signingSecret) return Response.json({ error: 'RESEND_WEBHOOK_SECRET is not configured' }, { status: 500 });

    const body = await req.text();
    const webhook = new Webhook(signingSecret);
    let event;

    try {
      event = webhook.verify(body, {
        'svix-id': req.headers.get('svix-id') || '',
        'svix-timestamp': req.headers.get('svix-timestamp') || '',
        'svix-signature': req.headers.get('svix-signature') || ''
      });
    } catch (_error) {
      return Response.json({ error: 'Invalid Resend webhook signature' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const data = event.data || {};
    const fromEmail = extractEmail(data.from);
    const toEmails = extractEmails(data.to);
    const toEmail = toEmails[0] || '';

    if (event.type === 'email.received') {
      await base44.asServiceRole.entities.EmailMessage.create({
        direction: 'inbound',
        owner_email: toEmail,
        from_email: fromEmail,
        to_email: toEmail,
        to_emails: toEmails,
        subject: data.subject || '',
        text: data.text || data.text_body || '',
        html: data.html || data.html_body || '',
        resend_id: data.id || event.id || '',
        event_type: event.type,
        status: 'received'
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, role } = await req.json();
    if (!email) return Response.json({ error: 'Email required' }, { status: 400 });

    // Always invite as 'user' (default role) to avoid admin-only restrictions.
    // The app uses custom roles (attorney/client) set separately after registration.
    await base44.auth.inviteUser(email, 'user');

    // Then send branded email (best-effort, may fail for unregistered users)
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'RetainerWatch AI',
      subject: `You're invited to join RetainerWatch`,
      body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're Invited</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:40px 48px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 16px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">⚖️ RetainerWatch</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.3;">You've Been Invited</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">Join the retainer management platform trusted by legal professionals</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;">
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">Hello,</p>
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                <strong style="color:#1e3a5f;">${user.full_name || user.email}</strong> has invited you to join 
                <strong style="color:#2563eb;">RetainerWatch</strong> as a 
                <strong style="color:#1e3a5f;">${role === 'admin' ? 'Attorney' : 'Client'}</strong>.
              </p>

              <!-- Role card -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#f0f7ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0;color:#1e3a5f;font-size:14px;font-weight:600;">Your role: ${role === 'admin' ? 'Attorney' : 'Client'}</p>
                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">
                      ${role === 'admin'
                        ? 'You will have access to manage cases, log billing entries, and communicate with clients.'
                        : 'You will be able to monitor retainer balances, review charges, and communicate with your attorney.'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);">
                    <a href="https://retainerwatch.base44.app/register" 
                       style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Accept Invitation →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                Use <strong>${email}</strong> to register your account.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">
                This invitation was sent by RetainerWatch AI on behalf of ${user.full_name || user.email}.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 RetainerWatch · Legal Retainer Management Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }).catch(() => {}); // branded email is best-effort

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { base44 } from '@/api/base44Client';

export async function applyInvitationRoleForCurrentUser(emailOverride) {
  const currentUser = emailOverride ? { email: emailOverride } : await base44.auth.me();
  const email = currentUser.email?.trim().toLowerCase();
  if (!email) return null;

  const invitations = await base44.entities.Invitation.filter({ email });
  const invitation = invitations.find(inv => inv.status === 'pending') || invitations[0];
  if (!invitation) return null;

  const role = invitation.role === 'attorney' ? 'attorney' : 'client';
  await base44.auth.updateMe({ role });
  await base44.entities.Invitation.update(invitation.id, { status: 'accepted' });
  return role;
}
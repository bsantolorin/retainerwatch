import { base44 } from '@/api/base44Client';

/**
 * Fire all relevant alerts after logging a billing entry.
 * Call this after updating the case balance.
 */
export async function createBillingAlerts({ caseData, amount, newBalance, clientEmail }) {
  const notifications = [];
  const initial = caseData.initial_retainer || 0;
  const prevBalance = newBalance + amount;
  const prevPct = initial > 0 ? (prevBalance / initial) * 100 : 100;
  const newPct = initial > 0 ? (newBalance / initial) * 100 : 100;

  const crossed = threshold => prevPct > threshold && newPct <= threshold;

  // Balance threshold crossings
  if (crossed(50)) {
    notifications.push({
      user_email: clientEmail,
      type: 'low_balance',
      title: 'Retainer Below 50%',
      message: `Your retainer for "${caseData.title}" has dropped below 50%. Remaining: $${newBalance.toFixed(2)}.`,
      case_id: caseData.id,
      read: false,
    });
  }
  if (crossed(25)) {
    notifications.push({
      user_email: clientEmail,
      type: 'low_balance',
      title: 'Retainer Below 25%',
      message: `Your retainer for "${caseData.title}" is getting critically low (below 25%). Remaining: $${newBalance.toFixed(2)}.`,
      case_id: caseData.id,
      read: false,
    });
  }
  if (crossed(10)) {
    notifications.push({
      user_email: clientEmail,
      type: 'low_balance',
      title: '⚠️ Retainer Below 10%',
      message: `Your retainer for "${caseData.title}" is nearly exhausted (below 10%). Remaining: $${newBalance.toFixed(2)}.`,
      case_id: caseData.id,
      read: false,
    });
  }

  // Also keep the existing alert_threshold logic
  if (newBalance <= (caseData.alert_threshold || 0) && !crossed(10) && !crossed(25) && !crossed(50)) {
    notifications.push({
      user_email: clientEmail,
      type: 'low_balance',
      title: 'Low Retainer Balance',
      message: `Your retainer for "${caseData.title}" is low: $${newBalance.toFixed(2)} remaining.`,
      case_id: caseData.id,
      read: false,
    });
  }

  // Large charge alert (>$500)
  if (amount > 500) {
    notifications.push({
      user_email: clientEmail,
      type: 'new_entry',
      title: 'Large Charge Added',
      message: `A charge of $${amount.toFixed(2)} was logged against "${caseData.title}".`,
      case_id: caseData.id,
      read: false,
    });
  }

  if (notifications.length > 0) {
    await Promise.all(notifications.map(n => base44.entities.Notification.create(n)));
  }
}
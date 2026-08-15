import { apiRequest } from './api-client';

export type AdminActionType =
  | 'service_created'
  | 'service_updated'
  | 'service_deleted'
  | 'service_toggled'
  | 'availability_changed'
  | 'payment_method_updated'
  | 'social_contact_updated'
  | 'message_template_updated'
  | 'terms_published'
  | 'profile_updated'
  | 'review_moderated';

export async function logAdminActivity(
  actionType: AdminActionType,
  description: string,
  details: Record<string, any> = {}
) {
  try {
    await apiRequest('/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        action_type: actionType,
        description,
        details,
      }),
    });
  } catch (err) {
    console.warn('Error logging admin activity:', err);
  }
}

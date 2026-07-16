/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminSettings } from './types';

/**
 * Normalizes and cleans phone numbers for WhatsApp API transmission.
 * Removes symbols, spaces, and handles leading zeroes for international format (e.g., Pakistan +92).
 */
export function cleanPhoneNumber(phone: string): string {
  // Remove non-digit characters
  let digits = phone.replace(/\D/g, '');

  // For Pakistan (03xx xxxxxxx) -> 923xx xxxxxxx
  if (digits.startsWith('03')) {
    digits = '92' + digits.slice(1);
  } else if (digits.startsWith('0092')) {
    digits = digits.slice(2);
  }

  return digits;
}

interface SendWhatsAppParams {
  to: string;
  message: string;
  settings: AdminSettings;
}

/**
 * Sends an automated WhatsApp message in the background by calling our secure backend proxy.
 * This completely bypasses browser CORS restrictions and keeps credentials safe.
 */
export async function sendAutomatedWhatsAppMessage({
  to,
  message,
  settings
}: SendWhatsAppParams): Promise<{ success: boolean; error?: string }> {
  // Check client-side configuration first to fast-fail if disabled
  if (!settings.enableWhatsappApi) {
    return { success: false, error: 'Automated WhatsApp dispatch is disabled in settings.' };
  }

  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, message, settings })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('[Client WhatsApp Service] Automated WhatsApp sent successfully:', data);
      return { success: true };
    } else {
      console.error('[Client WhatsApp Service] Failed to send via proxy:', data);
      return { success: false, error: data.error || 'Server rejected request' };
    }
  } catch (err: any) {
    console.error('[Client WhatsApp Service] Proxy connection error:', err);
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

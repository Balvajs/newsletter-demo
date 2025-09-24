// Mock email service for development
// In production, replace with real email service like SendGrid, Postmark, etc.

import { prisma } from './prisma';

export interface NewsletterEmailData {
  recipients: string[];
  subject: string;
  content: string;
  postId: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  recipientCount: number;
  errors?: string[];
}

export async function sendNewsletterEmail(
  data: NewsletterEmailData
): Promise<EmailResult> {
  const { recipients, subject, content, postId } = data;

  // Mock implementation - logs to console
  console.log('=== MOCK EMAIL SERVICE ===');
  console.log(`Sending newsletter email for post ${postId}`);
  console.log(`Subject: ${subject}`);
  console.log(`Recipients: ${recipients.length} subscribers`);
  console.log(
    'Recipients:',
    recipients.slice(0, 3).join(', ') + (recipients.length > 3 ? '...' : '')
  );
  console.log('Content preview:', content.substring(0, 100) + '...');
  console.log('========================');

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Simulate some failures (5% failure rate)
  const failures: string[] = [];
  const successfulRecipients = recipients.filter(email => {
    if (Math.random() < 0.05) {
      failures.push(`Failed to send to ${email}: Simulated bounce`);
      return false;
    }
    return true;
  });

  return {
    success: failures.length === 0,
    messageId: `mock-${Date.now()}-${postId}`,
    recipientCount: successfulRecipients.length,
    errors: failures.length > 0 ? failures : undefined,
  };
}

export async function trackEmailDelivery(
  messageId: string,
  postId: string,
  recipients: string[]
) {
  // In production, store delivery tracking in database
  console.log(
    `Tracking email delivery: ${messageId} for post ${postId} to ${recipients.length} recipients`
  );

  // if success, log the email
  await prisma.emailLog.createMany({
    data: recipients.map(email => ({
      postId,
      email,
      status: 'SENT',
    })),
  });
}

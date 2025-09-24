import Queue from 'bull';
import { sendNewsletterEmail } from './email';
import { prisma } from './prisma';
import { PostModel } from '../generated/prisma/models';

interface SendEmailJobData {
  postId: string;
  recipients: string[];
  subject: string;
  content: string;
}

if (!process.env.REDIS_PORT || !process.env.REDIS_HOST) {
  throw new Error('REDIS_HOST and REDIS_PORT env variables must be defined');
}

export const emailQueue = new Queue<SendEmailJobData>('send email', {
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    backoff: {
      type: 'exponential',
      delay: 60000, // Initial delay of 1 minute
    },
  },
});

export const setupEmailProcessing = () => {
  // Process email sending jobs
  emailQueue.process(async job => {
    const { postId, recipients, subject, content } = job.data;

    console.log(
      `Processing email job for post ${postId} to ${recipients.length} recipients`
    );

    try {
      // Send email to all recipients
      const result = await sendNewsletterEmail({
        recipients,
        subject,
        content,
        postId,
      });

      console.log(`Email sent successfully for post ${postId}`);
      return result;
    } catch (error) {
      console.error(`Error sending email for post ${postId}:`, error);
      throw error;
    }
  });
};

emailQueue.on('completed', job => console.log(`Email job ${job.id} completed`));
emailQueue.on('error', error => console.log('Email queue error:', error));
emailQueue.on('failed', job =>
  console.log(`Email queue ${job.id} failed:`, job.failedReason)
);

export const scheduleEmailQueue = async (post: PostModel) => {
  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  if (subscribers.length > 0) {
    // Queue email job
    await emailQueue.add({
      postId: post.id,
      recipients: subscribers.map((s: { email: string }) => s.email),
      subject: `New post: ${post.title}`,
      content: post.content,
    });
  }
};

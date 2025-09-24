import Queue from 'bull';
import { emailQueue } from './email-queue';
import { prisma } from './prisma';

interface PublishPostJobData {
  postId: string;
}

// Create job queues
export const publishPostQueue = new Queue<PublishPostJobData>('publish post', {
  redis: {
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    backoff: {
      type: 'fixed',
      delay: 60000, // Delay of 1 minute
    },
  },
});

export const setupPublishPostProcessing = () => {
  // Process post publishing jobs
  publishPostQueue.process(async job => {
    const { postId } = job.data;

    console.log(`Processing publish job for post ${postId}`);

    try {
      // Update post status to published
      const post = await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      console.log(`Post ${postId} published successfully`);

      // Get active subscribers
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

        console.log(`Queued email job for ${subscribers.length} subscribers`);
      }

      return { success: true, postId, subscribersNotified: subscribers.length };
    } catch (error) {
      console.error(`Error publishing post ${postId}:`, error);
      throw error;
    }
  });
};

publishPostQueue.on('completed', job =>
  console.log(`Publish post ${job.id} completed`)
);
publishPostQueue.on('error', error =>
  console.log('Publish post queue error:', error)
);
publishPostQueue.on('failed', job =>
  console.log(`Publish post ${job.id} failed:`, job.failedReason)
);

// Utility function to schedule a post
export async function schedulePost(postId: string, scheduledFor: Date) {
  const delay = scheduledFor.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error('Scheduled time must be in the future');
  }

  const job = await publishPostQueue.add(
    { postId },
    {
      delay,
      jobId: `publish-${postId}`, // Unique job ID to prevent duplicates
    }
  );

  console.log(`Scheduled post ${postId} for ${scheduledFor.toISOString()}`);
  return job;
}

// Utility function to cancel a scheduled post
export async function cancelScheduledPost(postId: string) {
  const job = await publishPostQueue.getJob(`publish-${postId}`);
  if (job) {
    await job.remove();
    console.log(`Cancelled scheduled job for post ${postId}`);
    return true;
  }
  return false;
}

// Utility function to get job status
export async function getScheduledPostStatus(postId: string) {
  const job = await publishPostQueue.getJob(`publish-${postId}`);
  if (!job) {
    return null;
  }

  return {
    id: job.id,
    delay: job.opts.delay,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason,
  };
}

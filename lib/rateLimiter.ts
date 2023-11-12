import { TRPCError } from "@trpc/server";
import redis from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

const rateLimiter = async (identifier: string = "api") => {
  const UPSATCH_ENV_FOUND =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSATCH_ENV_FOUND) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Upstash Environment variables are not present`,
    });
  }

  const limiter = new Ratelimit({
    redis,
    analytics: true,
    prefix: "ratelimit",
    limiter: Ratelimit.fixedWindow(10, "60s"),
  });

  const { success } = await limiter.limit(identifier);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in few seconds.`,
    });
  }
};

export default rateLimiter;

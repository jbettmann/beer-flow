import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, "30s"),
  prefix: "@upstash/ratelimit",
});

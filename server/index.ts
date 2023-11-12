import { z } from "zod";
import { OpenAI } from "openai";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import getIP from "@/lib/get-ip";
import rateLimiter from "@/lib/rateLimiter";
import redis from "@/lib/redis";

import { publicProcedure, router } from "./trpc";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

export const appRouter = router({
  generateImage: publicProcedure
    .input(
      z.object({
        roleName: z.string(),
        roleDescription: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await rateLimiter();

      try {
        const { roleName, roleDescription } = input;

        const response = await openai.images.generate({
          prompt: roleDescription,
          n: 1,
          size: "256x256",
        });
        const result = response.data;
        console.log(result);

        // Storing Images in the Redis
        const imageUrls: string[] = [];
        result.forEach((image) => {
          const { url } = image;
          if (!!url) imageUrls.push(url);
        });

        await redis.set(roleDescription, imageUrls);

        return { result: result, success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  generateImageVariations: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      await rateLimiter();

      try {
        const { url } = input;
        const image = fs.createReadStream(url);
        // image should be less than 4MB to work

        const response = await openai.images.createVariation({
          image,
        });
        const result = response.data;
        console.log(result);

        return { result, success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
  getAllImages: publicProcedure
    .input(z.number().optional())
    .query(async ({ input }) => {
      const cursor = input;

      try {
      } catch (err) {
        console.log("error getting all the images", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
});

export type AppRouter = typeof appRouter;

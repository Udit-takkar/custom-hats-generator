import { z } from "zod";
import { OpenAI } from "openai";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import getIP from "@/lib/get-ip";
import rateLimiter from "@/lib/rateLimiter";

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

        console.log(response.data);
        return { result: response.data, success: true };
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

        console.log(response.data);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An unexpected error occurred, please try again later.",
          cause: error,
        });
      }
    }),
});

export type AppRouter = typeof appRouter;

import { z } from "zod";
import { OpenAI } from "openai";

import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  generateImage: publicProcedure
    .input(
      z.object({
        roleName: z.string(),
        roleDescription: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { roleName, roleDescription } = input;

        const apiKey = process.env.OPENAI_API_KEY;

        const openai = new OpenAI({
          apiKey,
        });

        const response = await openai.images.generate({
          prompt: roleDescription,
          n: 1,
          size: "256x256",
        });

        console.log(response.data);
        return { result: response.data, success: true };
      } catch (error) {
        return { result: "something went wrong", success: false };
      }
    }),
});

export type AppRouter = typeof appRouter;

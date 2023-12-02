import { z } from "zod";
import { OpenAI } from "openai";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import getIP from "@/lib/get-ip";
import rateLimiter from "@/lib/rateLimiter";
import { v2 as cloudinary } from "cloudinary";
import { publicProcedure, router } from "./trpc";

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type ResourceType = {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
  url: string;
  secure_url: string;
};

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
        const prompt = roleDescription;

        const response = await openai.images.generate({
          prompt,
          n: 1,
          size: "256x256",
        });
        const result = response.data;
        console.log(result);

        // Storing Images in the CDN
        const imageUrls: string[] = [];

        result.forEach(async (image) => {
          const { url } = image;
          if (!!url) {
            imageUrls.push(url);
          }
        });

        await Promise.all(
          imageUrls.map(async (url) => {
            cloudinary.uploader.upload(
              url,
              {
                folder: "hats",
              },
              function (error, result) {
                console.error(error, result);
                if (error) {
                  throw new Error("Error Uploading to Cloudinary");
                }
              }
            );
          })
        );

        return { result: imageUrls, success: true };
      } catch (error) {
        console.error("err", error);
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
        const res = await cloudinary.api.resources({
          type: "upload",
          prefix: "hats",
        });

        const images: Array<ResourceType> = res.resources;

        return images;
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

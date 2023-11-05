"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Sparkles, Loader } from "lucide-react";
import { FadeInStagger } from "@/components/ui/fade-in";

import Image from "next/image";

import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { trpc } from "@/app/_trpc/client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  roleName: z.string().min(2).max(50),
  roleDescription: z.string().min(10).max(500),
});

const PromptForm = () => {
  const [images, setImages] = useState<
    { b64_json?: string | undefined; url?: string | undefined }[] | null
  >(null);

  const generate = trpc.generateImage.useMutation({
    onSuccess: (res) => {
      if (res.success && typeof res.result !== "string") {
        setImages(res.result);
      }
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleName: "",
      roleDescription: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    generate.mutate(values);
  };

  const promptDescription = watch("roleDescription");
  const promptRoleName = watch("roleName");

  return (
    <>
      <div className="rounded-lg  border border-neutral-200 w-full max-w-xl overflow-hidden shadow-md mt-8 text-left p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hat Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Builder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hat Role Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your description here."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end">
              <Button
                disabled={generate.isLoading}
                size="sm"
                type="submit"
                className="gap-1.5"
              >
                {generate.isLoading ? (
                  <Loader className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {images && (
        <FadeInStagger className="mt-12 w-full grid grid-cols-4 gap-4">
          {images.map((image) => {
            return (
              <div
                key={image?.url}
                className="rounded-md w-[256px] border border-neutral-200 bg-neutral-50 col-span-2 shadow-sm text-left overflow-hidden"
              >
                <div className="flex justify-center  items-center overflow-hidden">
                  {image?.url && (
                    <div className="flex flex-col w-full h-full max-w-[256px]">
                      <Zoom
                        zoomImg={{
                          src: image.url,
                          height: 1024,
                          width: 1024,
                        }}
                        zoomMargin={0}
                      >
                        <Image
                          className="h-full w-full aspect-square object-cover"
                          src={image.url}
                          alt={image.url}
                          height={256}
                          width={256}
                        />
                      </Zoom>
                      <div className="p-4 bg-neutral-100 ">
                        <p className="text-xs text-neutral-400 break-words">
                          <span className="font-semibold">Full Prompt:</span>{" "}
                          {promptDescription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {/* </div> */}
              </div>
            );
          })}
        </FadeInStagger>
      )}
    </>
  );
};

export default PromptForm;

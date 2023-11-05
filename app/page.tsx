import Image from "next/image";
import { Metadata } from "next";
import { FadeIn, FadeInStagger } from "@/components/ui/fade-in";
import PromptForm from "@/components/PromptForm";

export const metadata: Metadata = {
  title: "Hats Generator",
  description: "AI-powered tool to generate your hats",
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20 h-auto z-10 my-16">
      <FadeInStagger
        faster
        className="flex flex-col w-full items-center justify-center text-center"
      >
        <FadeIn>
          <h1 className="font-calSans text-4xl text-neutral-800">
            Hats Generator.
          </h1>
        </FadeIn>
        <PromptForm />
        {/* <FadeIn className="w-full flex self-center items-center justify-center">
                    <ImagineForm />
                </FadeIn>
                <FadeIn className="w-full flex items-center mt-10">
                    <ImagineRecord />
                </FadeIn> */}
      </FadeInStagger>
    </div>
  );
}

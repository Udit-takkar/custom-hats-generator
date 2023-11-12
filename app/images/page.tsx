import { Metadata } from "next";
import { FadeIn, FadeInStagger } from "@/components/ui/fade-in";
import AllImages from "@/components/AllImages";

export const metadata: Metadata = {
  title: "Hats Generator",
  description: "AI-powered tool to generate your hats",
};

export default function Images() {
  return (
    <FadeInStagger
      faster
      className="flex flex-col w-full items-center justify-center text-center"
    >
      <AllImages />
    </FadeInStagger>
  );
}

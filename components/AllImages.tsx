"use client";
import { trpc } from "@/app/_trpc/client";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Image from "next/image";
import { FadeInStagger } from "@/components/ui/fade-in";

const AllImages = () => {
  const { data: images } = trpc.getAllImages.useQuery();

  return (
    <div className="my-8">
      <h1 className="font-calSans text-4xl text-neutral-800">
        Previously Generated Images
      </h1>

      {images && (
        <FadeInStagger className="mt-12 w-full grid grid-cols-4 gap-4">
          {images?.map((image) => {
            return (
              <div
                key={image?.asset_id}
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
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </FadeInStagger>
      )}
    </div>
  );
};

export default AllImages;

import React, { useState } from "react";
import { Heart, Database, ArrowUp, Minus, Sparkles, Leaf, Sun, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvestmentCardProps {
  id: number;
  image: string;
  images?: string[]; // Add support for multiple images
  location: string;
  title: string;
  description: string;
  category: string;
  apy: string;
  value: string;
  status: "Open" | "Closed";
  availability: string;
  ownership: string;
}

// Icon mapping for different categories
const categoryIcons = {
  forest: Leaf,
  solar: Sun,
  "real-estate": Home,
  "real estate": Home,
  // Fallback for other categories
  default: Database,
};

export default function InvestmentCard({
  id,
  image,
  images = [],
  location,
  title,
  description,
  category,
  apy,
  value,
  status,
  availability,
  ownership,
}: InvestmentCardProps) {
  const isMobile = useIsMobile();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const imageArray = images.length > 0 ? images : [image];
  const currentImage = imageError ? "/placeholder.svg" : imageArray[currentImageIndex];

  // Get the appropriate icon for the category
  const IconComponent = categoryIcons[category.toLowerCase() as keyof typeof categoryIcons] || categoryIcons.default;

  const handleHeartClick = () => setIsLiked((p) => !p);
  const handleDotClick = (index: number) => setCurrentImageIndex(index);
  const handleImageClick = () => {
    if (imageArray.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
    }
  };

  const isOpen = status === "Open";

  return (
    <div
      className="group relative flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:shadow-xl"
      role="article"
      aria-labelledby={`investment-title-${id}`}
    >
      {/* Image / Gallery */}
      {/* Image wrapper uses a 4:3 aspect ratio; adjust by swapping aspect-[4/3] utility if different needed */}
      <div className="relative w-full overflow-hidden aspect-[4/3] rounded-t-xl">
        <img
          src={currentImage}
          // Using title for alt as a simple accessible fallback
          alt={title}
          onClick={handleImageClick}
          onError={() => setImageError(true)}
          className="h-full w-full cursor-pointer object-cover transition-transform duration-700 group-hover:scale-105"
          draggable={false}
        />
        {/* Gradient overlay bottom for better dot & text contrast */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status + Heart */}
        <div className="absolute left-2.5 top-2.5 right-2.5 flex items-start justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-[0_3px_5px_-1px_rgba(0,0,0,0.05)] ring-1 ring-inset ${
              isOpen
                ? "bg-white/90 text-gray-900 ring-gray-200 backdrop-blur"
                : "bg-white text-red-600 ring-red-100"
            }`}
          >
            {status}
          </span>
          <button
            onClick={handleHeartClick}
            aria-label={
              isLiked ? "Remove from favourites" : "Add to favourites"
            }
            className={`rounded-full p-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900/40 ${
              isLiked
                ? "text-red-500 hover:text-red-500"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Heart
              className="h-5 w-5 drop-shadow"
              fill={isLiked ? "currentColor" : "none"}
              strokeWidth={isLiked ? 0 : 1.5}
            />
          </button>
        </div>

        {/* Gallery dots */}
        {imageArray.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-0.5 backdrop-blur-sm">
            {imageArray.map((_, index) => {
              const active = index === currentImageIndex;
              return (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    active
                      ? "scale-110 bg-white shadow-inner"
                      : "bg-white/60 hover:bg-white"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col ${isMobile ? 'px-3 pt-2 pb-3' : 'px-4 pt-3 pb-4'}`}>
        <div className="flex flex-col gap-0.5">
          <p className={`${isMobile ? 'text-[11px]' : 'text-[10px]'} font-medium tracking-wide text-gray-500`}>
            {location}
          </p>
          <h3
            id={`investment-title-${id}`}
            className={`${isMobile ? 'text-lg' : 'text-base'} font-semibold leading-snug text-gray-900 line-clamp-1`}
          >
            {title}
          </h3>
          <div className="flex items-start gap-2 text-sm text-gray-500 mt-0.5">
            <Sparkles className={`mt-[5px] ${isMobile ? 'h-[11px] w-[11px]' : 'h-[10px] w-[10px]'} shrink-0 text-gray-400`} />
            <p className={`line-clamp-1 ${isMobile ? 'text-[12px]' : 'text-[11px]'} leading-snug`}>
              {description}
            </p>
          </div>
        </div>

        <div className={`${isMobile ? 'mb-2 mt-1.5' : 'mb-3 mt-2'} flex items-center justify-between ${isMobile ? 'text-[12px]' : 'text-[11px]'}`}>
          <div className="flex items-center gap-2 text-gray-500">
            <span className={`flex ${isMobile ? 'h-6 w-6' : 'h-5 w-5'} items-center justify-center rounded-full bg-gray-100`}>
              <IconComponent className={`${isMobile ? 'h-3.5 w-3.5' : 'h-3 w-3'} text-gray-800`} />
            </span>
            <span className={`${isMobile ? 'text-[12px]' : 'text-[11px]'} font-medium text-gray-500`}>
              {category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUp className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} text-emerald-600`} />
            <span className={`${isMobile ? 'text-[12px]' : 'text-[11px]'} font-semibold text-emerald-600`}>
              {apy}
            </span>
          </div>
        </div>

        <div className={`${isMobile ? 'mb-2' : 'mb-3'} h-px w-full bg-gray-200`} />

        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`${isMobile ? 'text-2xl' : 'text-xl'} font-semibold tracking-tight text-gray-900`}>
              {value}
            </span>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium text-gray-500`}>
              Total value
            </span>
          </div>
          <div className="text-right">
            <p className={`${isMobile ? 'text-[12px]' : 'text-[11px]'} font-semibold text-gray-900`}>
              {availability}
            </p>
            <p className={`${isMobile ? 'text-[10px]' : 'text-[9px]'} font-medium leading-tight text-gray-500`}>
              {ownership}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

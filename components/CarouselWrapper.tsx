"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselWrapperProps {
  children: React.ReactNode[];
  itemsPerPage?: number;
  autoSlideInterval?: number;
}

export function CarouselWrapper({
  children,
  itemsPerPage = 6,
  autoSlideInterval = 5000,
}: CarouselWrapperProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalPages = Math.ceil(children.length / itemsPerPage);

  const nextSlide = () => {
    if (totalPages <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    if (totalPages <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToSlide = (index: number) => {
    if (totalPages <= 1 || index === currentSlide) return;
    setCurrentSlide(index);
  };

  // Auto slide functionality
  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(interval);
  }, [currentSlide, totalPages, autoSlideInterval]);

  if (children.length === 0) {
    return <div className="text-center py-12 text-gray-500">No events found</div>;
  }

  // Get current page items
  const startIdx = currentSlide * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = children.slice(startIdx, endIdx);

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {/* {totalPages > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 
                       bg-white/80 hover:bg-white border border-gray-300 
                       rounded-full p-2 shadow-md hover:shadow-lg transition-all 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={totalPages <= 1}
            aria-label="Previous events"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 
                       bg-white/80 hover:bg-white border border-gray-300 
                       rounded-full p-2 shadow-md hover:shadow-lg transition-all 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={totalPages <= 1}
            aria-label="Next events"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )} */}

      {/* Current Slide Content - No animation */}
      <div className="px-6 py-4">
        <div className="grid grid-rows-3 gap-5">
          {Array.from({ length: 3 }).map((_, rowIndex) => {
            const item1 = currentItems[rowIndex * 2];
            const item2 = currentItems[rowIndex * 2 + 1];

            return (
              <div key={`${currentSlide}-${rowIndex}`} className="grid grid-cols-2 gap-5">
                {item1 && <div>{item1}</div>}
                {item2 && <div>{item2}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
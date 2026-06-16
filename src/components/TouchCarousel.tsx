import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TouchCarouselProps {
  children: React.ReactNode[];
  className?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
}

const TouchCarousel = ({
  children,
  className = "",
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  loop = true,
}: TouchCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const totalItems = children.length;
  const minSwipeDistance = 50;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || totalItems <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, currentIndex, totalItems]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= totalItems - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [totalItems, loop]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return loop ? totalItems - 1 : prev;
      }
      return prev - 1;
    });
  }, [totalItems, loop]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse handlers for desktop drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !touchStart) return;
    setDragOffset(e.clientX - touchStart);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !touchStart) return;
    
    const distance = touchStart - e.clientX;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      setTouchStart(null);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main carousel container */}
      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 select-none"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalItems > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            disabled={!loop && currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={!loop && currentIndex === totalItems - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && totalItems > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar for mobile */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default TouchCarousel;

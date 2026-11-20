import { useState } from 'react';
import type { Screenshot } from '@/lib/types';

export function ScreenshotGallery({ shots }: { shots: Screenshot[] }) {
  const [index, setIndex] = useState(0);
  if (!shots.length) return null;
  const shot = shots[index] ?? shots[0];

  function go(delta: number) {
    setIndex((current) => (current + delta + shots.length) % shots.length);
  }

  return (
    <div
      role="region"
      aria-label="Screenshots"
      tabIndex={0}
      className="overflow-hidden rounded-xl border border-border bg-muted"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        go(event.key === 'ArrowRight' ? 1 : -1);
      }}
    >
      <img
        src={shot.src}
        alt={shot.alt}
        width={960}
        height={540}
        className="aspect-video w-full cursor-pointer bg-muted object-cover"
        onClick={() => go(1)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {index + 1} / {shots.length}. Left and right arrow keys change the screenshot.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold"
            aria-label="Previous screenshot"
            onClick={() => go(-1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold"
            aria-label="Next screenshot"
            onClick={() => go(1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function QualityInput({ defaultValue = 3 }: { defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name="quality" value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Qualidade ${n}`}
          onClick={() => setValue(n)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "size-5",
              n <= value
                ? "fill-primary text-primary"
                : "fill-none text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

import type { CourseSection } from "../course-format/types.ts";
import { ListIcon } from "./icons.tsx";

type TableOfContentsProps = {
  sections: readonly Pick<CourseSection, "id" | "label">[];
  activeId: string;
};

export function TableOfContents({ sections, activeId }: TableOfContentsProps) {
  return (
    <nav aria-label="On this page" class="px-6 py-10">
      <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        <ListIcon class="size-3.5" />
        On this page
      </div>

      <ol class="relative mt-5 space-y-1 border-l border-line">
        {sections.map((section, index) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                class={`relative block py-1.5 pl-4 text-[11px] leading-4 transition-colors before:absolute before:-left-px before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors ${
                  isActive
                    ? "font-semibold text-ink before:bg-accent"
                    : "text-muted before:bg-transparent hover:text-ink"
                }`}
                aria-current={isActive ? "location" : undefined}
              >
                <span class="mr-2 text-[9px] tabular-nums text-faint">0{index + 1}</span>
                {section.label}
              </a>
            </li>
          );
        })}
      </ol>

      <div class="mt-10 rounded-2xl bg-soft p-4">
        <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Reading progress
        </p>
        <div class="mt-3 h-1 overflow-hidden rounded-full bg-line">
          <div
            class="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{
              width: `${Math.max(1, sections.findIndex((section) => section.id === activeId) + 1) * (100 / sections.length)}%`,
            }}
          />
        </div>
      </div>
    </nav>
  );
}

import { useAutoAnimate } from "@formkit/auto-animate/preact";
import type { CourseDocument } from "../course-format/types.ts";
import { Brand } from "./brand.tsx";
import { ChevronIcon } from "./icons.tsx";

type CourseSidebarProps = {
  courses: readonly CourseDocument[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  onNavigate?: () => void;
};

export function CourseSidebar({ courses, activeSlug, onSelect, onNavigate }: CourseSidebarProps) {
  const [courseListRef] = useAutoAnimate();

  return (
    <div class="flex h-full flex-col px-5 py-6 lg:px-6 lg:py-8">
      <Brand />

      <div class="mt-10 flex items-center justify-between">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Courses</p>
        <span class="rounded-full bg-soft px-2 py-1 text-[10px] font-semibold text-muted">
          {courses.length}
        </span>
      </div>

      <nav ref={courseListRef} class="mt-4 space-y-2" aria-label="Courses">
        {courses.map((course) => {
          const isActive = course.slug === activeSlug;
          return (
            <a
              key={course.slug}
              href={`?course=${course.slug}`}
              onClick={(event) => {
                event.preventDefault();
                onSelect(course.slug);
                onNavigate?.();
              }}
              class={`group block rounded-2xl border px-4 py-4 transition-colors ${
                isActive
                  ? "border-line bg-surface-raised shadow-[0_16px_45px_rgba(0,0,0,0.16)]"
                  : "border-transparent hover:bg-surface"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div class="flex items-center justify-between gap-3">
                <p
                  class={`text-[13px] font-semibold tracking-[-0.01em] ${
                    isActive ? "text-ink" : "text-muted group-hover:text-ink"
                  }`}
                >
                  {course.title}
                </p>
                <ChevronIcon
                  class={`size-3.5 transition-transform ${
                    isActive ? "text-accent" : "text-faint group-hover:translate-x-0.5"
                  }`}
                />
              </div>
              <p class="mt-2 line-clamp-2 text-[11px] leading-4 text-muted">{course.description}</p>
              <p class="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-faint">
                {course.sections.length} sections
              </p>
            </a>
          );
        })}
      </nav>

      <div class="mt-auto border-t border-line pt-5 text-[10px] leading-4 text-faint">
        Free, open, and opinionated.
        <br />
        Built for curious people.
      </div>
    </div>
  );
}

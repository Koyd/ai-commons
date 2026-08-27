import { useAutoAnimate } from "@formkit/auto-animate/preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Brand } from "./components/brand.tsx";
import { CourseSidebar } from "./components/course-sidebar.tsx";
import { CloseIcon, MenuIcon } from "./components/icons.tsx";
import { TableOfContents } from "./components/table-of-contents.tsx";
import { CourseRenderer } from "./course-format/course-renderer.tsx";
import type { CourseDocument, CourseSection } from "./course-format/types.ts";
import { useActiveSection } from "./hooks/use-active-section.ts";

const courseModules = import.meta.glob<{ default: CourseDocument }>("../courses/*.course", {
  eager: true,
});

const courses = Object.values(courseModules)
  .map((module) => module.default)
  .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));

function requestedCourseSlug() {
  return new URL(window.location.href).searchParams.get("course");
}

function MobileContents({
  sections,
  activeId,
}: {
  sections: readonly CourseSection[];
  activeId: string;
}) {
  return (
    <div class="no-scrollbar -mx-5 flex gap-2 overflow-x-auto border-y border-line px-5 py-3 sm:-mx-8 sm:px-8 lg:hidden">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          class={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors ${
            activeId === section.id
              ? "bg-accent text-[#1b100b]"
              : "bg-soft text-muted hover:text-ink"
          }`}
        >
          {section.label}
        </a>
      ))}
    </div>
  );
}

function CoursePage({ course, activeId }: { course: CourseDocument; activeId: string }) {
  return (
    <main class="min-w-0 px-5 pb-28 pt-24 sm:px-8 lg:px-12 lg:pt-10 xl:px-14">
      <div class="mx-auto max-w-[47rem]">
        <MobileContents sections={course.sections} activeId={activeId} />
        <CourseRenderer course={course} />
      </div>
    </main>
  );
}

export function App() {
  const initialCourse =
    courses.find((course) => course.slug === requestedCourseSlug()) ?? courses[0];
  if (!initialCourse) throw new Error("No .course files were compiled");

  const [activeSlug, setActiveSlug] = useState(initialCourse.slug);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavRef] = useAutoAnimate({ duration: 180 });
  const activeCourse = courses.find((course) => course.slug === activeSlug) ?? initialCourse;
  const sectionIds = useMemo(
    () => activeCourse.sections.map((section) => section.id),
    [activeCourse],
  );
  const activeId = useActiveSection(sectionIds);

  useEffect(() => {
    document.title = `${activeCourse.title} — AI Commons`;
  }, [activeCourse.title]);

  const selectCourse = (slug: string, updateHistory = true) => {
    if (!courses.some((course) => course.slug === slug)) return;
    setActiveSlug(slug);
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set("course", slug);
      url.hash = "";
      window.history.pushState({ course: slug }, "", url);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    const onPopState = () => {
      selectCourse(requestedCourseSlug() ?? initialCourse.slug, false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <div class="min-h-screen bg-canvas">
      <header class="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-5 backdrop-blur-lg lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          class="grid size-9 place-items-center rounded-xl border border-line bg-surface text-ink"
          aria-label={mobileNavOpen ? "Close course navigation" : "Open course navigation"}
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      <div ref={mobileNavRef}>
        {mobileNavOpen ? (
          <div
            class="fixed inset-0 z-30 bg-black/65 pt-16 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <aside
              class="h-[calc(100dvh-4rem)] w-[min(21rem,90vw)] overflow-y-auto border-r border-line bg-canvas shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <CourseSidebar
                courses={courses}
                activeSlug={activeCourse.slug}
                onSelect={selectCourse}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </aside>
          </div>
        ) : null}
      </div>

      <div class="mx-auto grid min-h-screen max-w-[96rem] lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,52rem)_15rem]">
        <aside class="sticky top-0 hidden h-screen overflow-y-auto border-r border-line lg:block">
          <CourseSidebar courses={courses} activeSlug={activeCourse.slug} onSelect={selectCourse} />
        </aside>

        <CoursePage course={activeCourse} activeId={activeId} />

        <aside class="sticky top-0 hidden h-screen border-l border-line xl:block">
          <TableOfContents sections={activeCourse.sections} activeId={activeId} />
        </aside>
      </div>
    </div>
  );
}

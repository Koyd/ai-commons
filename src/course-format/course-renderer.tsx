import type { ComponentChildren } from "preact";
import { getCourseComponent } from "./component-registry.tsx";
import type { CourseBlock, CourseDocument } from "./types.ts";

function inline(text: string): ComponentChildren {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} class="rounded bg-soft px-1.5 py-0.5 text-[0.9em] text-accent-strong">
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const href = /^(https?:|mailto:|#|\/)/.test(link[2]) ? link[2] : "#";
      return (
        <a
          key={index}
          href={href}
          class="text-accent underline decoration-accent/40 underline-offset-4"
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function Block({ block }: { block: CourseBlock }) {
  if (block.type === "heading") {
    return block.depth === 2 ? (
      <h2 class="font-display text-3xl leading-tight font-medium tracking-[-0.035em] text-ink sm:text-4xl">
        {inline(block.text)}
      </h2>
    ) : (
      <h3 class="text-base font-semibold tracking-[-0.015em] text-ink">{inline(block.text)}</h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p class="text-[15px] leading-7 text-body sm:text-base sm:leading-8">{inline(block.text)}</p>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote class="border-l-2 border-accent pl-5 text-[13px] leading-6 text-muted">
        {inline(block.text)}
      </blockquote>
    );
  }

  if (block.type === "list") {
    return (
      <ul class="space-y-2 pl-5 text-[15px] leading-7 text-body marker:text-accent sm:text-base">
        {block.items.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>
    );
  }

  const Component = getCourseComponent(block.name);
  return <Component {...block.props} />;
}

export function CourseRenderer({ course }: { course: CourseDocument }) {
  return (
    <article id="top" class="pt-10 lg:pt-0">
      <header>
        <h1 class="max-w-2xl font-display text-[clamp(3rem,8vw,6rem)] leading-[0.92] font-medium tracking-[-0.055em] text-ink">
          {course.title}
        </h1>
        {course.description ? (
          <p class="mt-7 max-w-2xl text-[17px] leading-7 text-muted sm:text-lg sm:leading-8">
            {course.description}
          </p>
        ) : null}
      </header>

      {course.sections.map((section) => (
        <section
          id={section.id}
          key={section.id}
          class="scroll-mt-16 pt-8 last:pb-16 sm:pt-10 sm:last:pb-24"
        >
          <div class="space-y-6">
            {section.blocks.map((block, blockIndex) => (
              <Block key={`${section.id}-${blockIndex}`} block={block} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}

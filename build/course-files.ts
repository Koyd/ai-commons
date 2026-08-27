import { readFile } from "node:fs/promises";
import type { Plugin } from "vite-plus";
import { parse } from "../course-format/generated/course-parser.mjs";
import { COURSE_COMPONENT_NAMES } from "../src/course-format/types.ts";
import type { CourseDocument } from "../src/course-format/types.ts";

type PeggyError = Error & {
  format?: (sources: readonly { source: string; text: string }[]) => string;
};

function validateCourse(course: CourseDocument, file: string) {
  if (!course.title || !course.slug) throw new Error(`${file}: a course needs a title and slug`);
  if (course.sections.length === 0) throw new Error(`${file}: a course needs at least one section`);

  const sectionIds = new Set<string>();
  const componentNames = new Set<string>(COURSE_COMPONENT_NAMES);

  for (const section of course.sections) {
    if (sectionIds.has(section.id))
      throw new Error(`${file}: duplicate section id "${section.id}"`);
    sectionIds.add(section.id);

    for (const block of section.blocks) {
      if (block.type === "component" && !componentNames.has(block.name)) {
        throw new Error(`${file}: unknown course component "${block.name}"`);
      }
    }
  }
}

export function courseFiles(): Plugin {
  return {
    name: "ai-commons-course-files",
    enforce: "pre",
    async load(id) {
      const file = id.split("?", 1)[0];
      if (!file?.endsWith(".course")) return null;

      const source = await readFile(file, "utf8");
      try {
        const course = parse(source, { grammarSource: file }) as CourseDocument;
        validateCourse(course, file);
        return {
          code: `export default ${JSON.stringify(course)};`,
          map: null,
        };
      } catch (cause) {
        const error = cause as PeggyError;
        const message = error.format?.([{ source: file, text: source }]) ?? error.message;
        throw new Error(`Could not compile course file:\n${message}`, { cause });
      }
    },
  };
}

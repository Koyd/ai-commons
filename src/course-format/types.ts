export type CourseTextBlock =
  | { type: "heading"; depth: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: readonly string[] };

export type CourseComponentBlock = {
  type: "component";
  name: CourseComponentName;
  props: Record<string, unknown>;
};

export type CourseBlock = CourseTextBlock | CourseComponentBlock;

export type CourseSection = {
  id: string;
  label: string;
  blocks: readonly CourseBlock[];
};

export type CourseDocument = {
  slug: string;
  title: string;
  description: string;
  order: number;
  sections: readonly CourseSection[];
};

export const COURSE_COMPONENT_NAMES = [
  "Callout",
  "Steps",
  "YouTubePlaylist",
  "NextLesson",
] as const;

export type CourseComponentName = (typeof COURSE_COMPONENT_NAMES)[number];

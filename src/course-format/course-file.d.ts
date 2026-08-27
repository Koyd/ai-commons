declare module "*.course" {
  import type { CourseDocument } from "./types.ts";

  const course: CourseDocument;
  export default course;
}

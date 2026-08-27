# AI Commons

A free, opinionated, client-side learning resource for modern language models.

## Run locally

```bash
vp install
vp dev
```

Use Vite+ for the normal project workflow:

```bash
vp check
vp build
vp preview
```

`npx` is used for one-off package CLIs. For example, regenerate the course parser after changing
its grammar with:

```bash
npx peggy --format es -o course-format/generated/course-parser.mjs course-format/course.peggy
```

The same command is available as `vp run generate:course-parser`.

## Course files

Every `courses/*.course` file becomes one course in the left sidebar. The Vite plugin parses these
files with Peggy during development and production builds, validates section and component names,
then emits a framework-neutral course AST. Preact only appears in the small renderer layer.

A minimal course looks like this:

```md
# Modern LLMs

@slug: modern-llms
@description: From neural-network foundations to useful language models.
@order: 1

@section prerequisites | Prerequisites

## This is not a calculus course.

Normal Markdown-like paragraphs, **strong text**, `inline code`, links, lists, and quotes work here.

- First point
- Second point
```

The `@section` fields are:

1. A unique anchor ID.
2. The label shown in the right sidebar.

Adding another `@section` closes the current section and creates another right-sidebar entry.

## Embedded components

Registered reactive components can appear anywhere inside a section. Props are JSON so the course
compiler can validate and serialize them without executing course-authored JavaScript.

```md
::component YouTubePlaylist
{
"title": "Neural networks from first principles",
"videos": [
"aircAruvnKk",
"https://youtu.be/IHZwWFHWa-w"
]
}
::end
```

Available components are `Callout`, `Steps`, `YouTubePlaylist`, and `NextLesson`.

To add one, include its name in `COURSE_COMPONENT_NAMES` and register its renderer with
`defineCourseComponent` in `src/course-format/component-registry.tsx`. This contract is the only
framework-specific boundary; the grammar and compiled course data remain portable.

The syntax is defined in `course-format/course.peggy`, while the build-time compiler lives in
`build/course-files.ts`.

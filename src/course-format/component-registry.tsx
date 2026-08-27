import type { FunctionComponent } from "preact";
import { ArrowIcon, CheckIcon } from "../components/icons.tsx";
import { YouTubePlaylist, type YouTubeVideo } from "../components/youtube-playlist.tsx";
import type { CourseComponentName } from "./types.ts";

type AnyCourseProps = Record<string, unknown>;

export type CourseComponentDefinition = {
  name: CourseComponentName;
  render: FunctionComponent<AnyCourseProps>;
};

export function defineCourseComponent<Props extends object>(
  name: CourseComponentName,
  render: FunctionComponent<Props>,
): CourseComponentDefinition {
  return {
    name,
    render: render as unknown as FunctionComponent<AnyCourseProps>,
  };
}

function Callout({ title, body }: { title: string; body: string }) {
  return (
    <aside class="rounded-[1.35rem] border border-accent/25 bg-accent-soft/60 p-5 sm:p-6">
      <div class="flex gap-4">
        <span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-surface-raised text-accent shadow-sm">
          <CheckIcon class="size-4" />
        </span>
        <div>
          <p class="text-[12px] font-semibold text-ink">{title}</p>
          <p class="mt-1.5 text-[13px] leading-6 text-body">{body}</p>
        </div>
      </div>
    </aside>
  );
}

type Step = { title: string; description: string };

function Steps({ items }: { items: readonly Step[] }) {
  return (
    <div class="grid gap-px overflow-hidden rounded-[1.35rem] border border-line bg-line sm:grid-cols-3">
      {items.map((item, index) => (
        <div key={item.title} class="bg-surface p-5">
          <span class="text-[10px] font-semibold tabular-nums text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 class="mt-5 text-[13px] font-semibold text-ink">{item.title}</h3>
          <p class="mt-2 text-[11px] leading-5 text-muted">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function PlaylistBlock({ title, videos }: { title?: string; videos: readonly YouTubeVideo[] }) {
  return <YouTubePlaylist title={title} videos={videos} />;
}

function NextLesson({ label, title }: { label: string; title: string }) {
  return (
    <div class="group flex cursor-default items-center justify-between rounded-[1.35rem] border border-line bg-surface-raised p-5 sm:p-6">
      <div>
        <p class="text-[9px] font-semibold uppercase tracking-[0.15em] text-faint">{label}</p>
        <p class="mt-2 font-display text-2xl tracking-[-0.03em] text-ink">{title}</p>
      </div>
      <span class="grid size-10 place-items-center rounded-full bg-soft text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink">
        <ArrowIcon />
      </span>
    </div>
  );
}

function isStep(value: unknown): value is Step {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Step).title === "string" &&
    typeof (value as Step).description === "string"
  );
}

function isVideo(value: unknown): value is YouTubeVideo {
  return (
    typeof value === "string" ||
    (typeof value === "object" &&
      value !== null &&
      typeof (value as { url?: unknown }).url === "string")
  );
}

function stringProp(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

const definitions = [
  defineCourseComponent("Callout", (props: AnyCourseProps) => (
    <Callout title={stringProp(props.title, "Note")} body={stringProp(props.body, "")} />
  )),
  defineCourseComponent("Steps", (props: AnyCourseProps) => (
    <Steps items={Array.isArray(props.items) ? props.items.filter(isStep) : []} />
  )),
  defineCourseComponent("YouTubePlaylist", (props: AnyCourseProps) => (
    <PlaylistBlock
      title={typeof props.title === "string" ? props.title : undefined}
      videos={Array.isArray(props.videos) ? props.videos.filter(isVideo) : []}
    />
  )),
  defineCourseComponent("NextLesson", (props: AnyCourseProps) => (
    <NextLesson
      label={stringProp(props.label, "Up next")}
      title={stringProp(props.title, "Next lesson")}
    />
  )),
] satisfies readonly CourseComponentDefinition[];

const registry = Object.fromEntries(
  definitions.map((definition) => [definition.name, definition.render]),
) as Record<CourseComponentName, FunctionComponent<AnyCourseProps>>;

export function getCourseComponent(name: CourseComponentName) {
  return registry[name];
}

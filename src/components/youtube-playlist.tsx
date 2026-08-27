import { useAutoAnimate } from "@formkit/auto-animate/preact";
import { useMemo, useState } from "preact/hooks";
import { ListIcon, PlayIcon } from "./icons.tsx";

export type YouTubeVideo =
  | string
  | {
      url: string;
      title?: string;
      author?: string;
    };

type YouTubePlaylistProps = {
  title?: string;
  videos: readonly YouTubeVideo[];
};

type NormalizedVideo = {
  id: string;
  title: string;
  author?: string;
};

function getYouTubeId(source: string) {
  const value = source.trim();
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (url.searchParams.has("v")) return url.searchParams.get("v") ?? "";

    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => part === "embed" || part === "shorts");
    return marker >= 0 ? (parts[marker + 1] ?? "") : "";
  } catch {
    return "";
  }
}

export function YouTubePlaylist({ title = "Video playlist", videos }: YouTubePlaylistProps) {
  const normalizedVideos = useMemo(
    () =>
      videos
        .map((source, index): NormalizedVideo | null => {
          const url = typeof source === "string" ? source : source.url;
          const id = getYouTubeId(url);
          if (!id) return null;

          return {
            id,
            title:
              typeof source === "string"
                ? `Video ${index + 1}`
                : (source.title ?? `Video ${index + 1}`),
            author: typeof source === "string" ? undefined : source.author,
          };
        })
        .filter((video): video is NormalizedVideo => video !== null),
    [videos],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [playerRef] = useAutoAnimate({ duration: 180 });
  const activeVideo = normalizedVideos[activeIndex] ?? normalizedVideos[0];

  if (!activeVideo) return null;

  return (
    <section class="not-prose overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
      <header class="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
        <div class="flex items-center gap-2.5">
          <span class="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
            <PlayIcon class="size-3.5" />
          </span>
          <div>
            <p class="text-[12px] font-semibold text-ink">{title}</p>
            <p class="text-[10px] text-muted">{normalizedVideos.length} hand-picked videos</p>
          </div>
        </div>
        <span class="hidden items-center gap-1.5 text-[10px] font-medium text-muted sm:flex">
          <ListIcon class="size-3.5" />
          {activeIndex + 1} / {normalizedVideos.length}
        </span>
      </header>

      <div class="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(230px,0.8fr)]">
        <div ref={playerRef} class="bg-black">
          <div key={activeVideo.id} class="aspect-video">
            <iframe
              class="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?rel=0`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <ol class="max-h-[22rem] space-y-1 overflow-y-auto border-t border-line bg-surface-raised p-2 lg:max-h-none lg:border-l lg:border-t-0">
          {normalizedVideos.map((video, index) => {
            const isActive = activeIndex === index;
            return (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  class={`group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                    isActive ? "bg-soft shadow-sm" : "hover:bg-soft/70"
                  }`}
                  aria-pressed={isActive}
                >
                  <span class="relative w-[5.25rem] shrink-0 overflow-hidden rounded-lg bg-ink">
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                      alt=""
                      class={`aspect-video w-full object-cover transition-opacity ${isActive ? "opacity-75" : "opacity-90 group-hover:opacity-100"}`}
                      loading="lazy"
                    />
                    {isActive ? (
                      <span class="absolute inset-0 grid place-items-center text-white">
                        <span class="grid size-6 place-items-center rounded-full bg-accent shadow-sm">
                          <PlayIcon class="size-3 fill-current" />
                        </span>
                      </span>
                    ) : null}
                  </span>
                  <span class="min-w-0 pr-1">
                    <span
                      class={`line-clamp-2 text-[11px] font-medium leading-4 ${isActive ? "text-ink" : "text-muted"}`}
                    >
                      {video.title}
                    </span>
                    {video.author ? (
                      <span class="mt-1 block text-[9px] text-faint">{video.author}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

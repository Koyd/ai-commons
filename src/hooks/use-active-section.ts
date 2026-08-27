import { useEffect, useState } from "preact/hooks";

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const marker = Math.min(180, window.innerHeight * 0.24);
      let current = sectionIds[0] ?? "";

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= marker) {
          current = id;
        }
      }

      const atPageEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActiveId(atPageEnd ? (sectionIds.at(-1) ?? current) : current);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [sectionIds]);

  return activeId;
}

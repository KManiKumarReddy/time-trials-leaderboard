import { useEffect } from "react";
import { Config } from "../types";

const DEFAULT_SEO: Required<Config["seo"]> = {
  title: "Time Trial Leaderboard",
  description:
    "Track the latest time trial performances, discover personal bests, and compare pace across editions.",
  keywords:
    "time trial, running, leaderboard, pace, personal best, race results",
  ogImage: "/logo.png",
};

export function useSEO(seo?: Partial<Config["seo"]>) {
  useEffect(() => {
    const safeSeo = { ...DEFAULT_SEO, ...(seo || {}) };

    document.title = safeSeo.title;

    const updateMeta = (
      name: string,
      content: string,
      attr: string = "name",
    ) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", safeSeo.description);
    updateMeta("keywords", safeSeo.keywords);
    updateMeta("og:title", safeSeo.title, "property");
    updateMeta("og:description", safeSeo.description, "property");
    updateMeta("og:image", safeSeo.ogImage, "property");
    updateMeta("twitter:card", "summary_large_image");
  }, [seo]);
}

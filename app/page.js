import { getLatestEntries } from "@/lib/entries";
import HomeClient from "./HomeClient";

export async function generateMetadata() {
  const entries = getLatestEntries(1);
  const latest = entries.length > 0 ? entries[0] : null;

  if (!latest) return {};

  const youtubeThumbnail = `https://img.youtube.com/vi/${latest.youtubeId}/maxresdefault.jpg`;

  return {
    openGraph: {
      images: [
        {
          url: youtubeThumbnail,
          width: 1200,
          height: 630,
          alt: "Lunch Time With Jesus - Latest Episode",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [youtubeThumbnail],
    },
  };
}

export default function Page() {
  return <HomeClient />;
}

import { getEntryByDate } from "@/lib/entries";
import PlayerClient from "./PlayerClient";

export async function generateMetadata({ params }) {
  const { date } = params;
  const entry = getEntryByDate(date);

  if (!entry) {
    return {
      title: "Word not found",
    };
  }

  const youtubeThumbnail = `https://img.youtube.com/vi/${entry.youtubeId}/maxresdefault.jpg`;
  const description = entry.note || "A daily audio word to carry you through the day.";

  return {
    title: entry.title,
    description: description,
    openGraph: {
      title: entry.title,
      description: description,
      url: `https://lunchtimewithjesus.netlify.app/player/${date}`,
      siteName: "Lunch Time With Jesus",
      images: [
        {
          url: youtubeThumbnail,
          width: 1200,
          height: 630,
          alt: entry.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: description,
      images: [youtubeThumbnail],
    },
  };
}

export default function Page({ params }) {
  return <PlayerClient params={params} />;
}

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      router.push(`/lms/track/${slug}/stream`);
    }
  }, [slug, router]);

  return null;
}

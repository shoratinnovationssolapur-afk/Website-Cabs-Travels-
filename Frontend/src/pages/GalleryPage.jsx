import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Camera, MapPin } from "lucide-react";
import { db } from "../firebase";

const PRIMARY_GALLERY_COLLECTION = "trip_Memories_Gallery";
const FALLBACK_GALLERY_COLLECTION = "user_images";

function getCreatedAtValue(item) {
  if (item?.createdAt?.toMillis) return item.createdAt.toMillis();
  if (typeof item?.createdAt === "number") return item.createdAt;
  if (typeof item?.createdAt === "string") {
    const parsed = Date.parse(item.createdAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function normalizeGalleryDocs(snapshot, source) {
  return snapshot.docs.map((item) => ({
    id: `${source}-${item.id}`,
    source,
    ...item.data(),
  }));
}

export default function GalleryPage() {
  const [memories, setMemories] = useState([]);

  const galleryImages = useMemo(
    () => {
      const seenImageUrls = new Set();

      return memories.flatMap((memory) => {
        const imageEntries = Array.isArray(memory.images) && memory.images.length > 0
          ? memory.images
          : memory.imageUrl
            ? [{ imageUrl: memory.imageUrl }]
            : [];

        return imageEntries
          .map((image, index) => {
            const imageUrl = typeof image === "string" ? image : image?.imageUrl;

            if (!imageUrl || seenImageUrls.has(imageUrl)) return null;
            seenImageUrls.add(imageUrl);

            return {
              id: `${memory.id}-${index}`,
              imageUrl,
              imageName: typeof image === "string" ? "" : image?.imageName || "",
              title: memory.title,
              location: memory.location,
              tripDate: memory.tripDate,
              description: memory.description,
              createdAt: memory.createdAt,
            };
          })
          .filter(Boolean);
      });
    },
    [memories]
  );

  useEffect(() => {
    let primaryDocs = [];
    let fallbackDocs = [];

    const syncMemories = () => {
      const merged = [...primaryDocs, ...fallbackDocs].sort(
        (a, b) => getCreatedAtValue(b) - getCreatedAtValue(a)
      );
      setMemories(merged);
    };

    const unsubscribePrimary = onSnapshot(
      collection(db, PRIMARY_GALLERY_COLLECTION),
      (snapshot) => {
        primaryDocs = normalizeGalleryDocs(snapshot, PRIMARY_GALLERY_COLLECTION);
        syncMemories();
      },
      (error) => {
        console.error("Error loading gallery:", error);
      }
    );

    const unsubscribeFallback = onSnapshot(
      collection(db, FALLBACK_GALLERY_COLLECTION),
      (snapshot) => {
        fallbackDocs = normalizeGalleryDocs(snapshot, FALLBACK_GALLERY_COLLECTION);
        syncMemories();
      },
      (error) => {
        console.error("Error loading fallback gallery:", error);
      }
    );

    return () => {
      unsubscribePrimary();
      unsubscribeFallback();
    };
  }, []);

  return(
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,#020617,#0f172a)] px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-yellow-300">
            <Camera size={16} />
            Travel Memories
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
            A gallery of rides, tours, and moments shared on the road.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Explore the memories uploaded by our admin team from customer journeys, tours, and special travel moments.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        {galleryImages.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/15 bg-white/5 px-8 py-16 text-center text-slate-300">
            No memories have been uploaded yet.
          </div>
        ) : (
          <div className="columns-1 gap-6 space-y-6 md:columns-2 xl:columns-3">
            {galleryImages.map((image) => (
              <article
                key={image.id}
                className="break-inside-avoid overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
              >
                <img
                  src={image.imageUrl}
                  alt={image.imageName || image.title || "Travel memory"}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />

                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {image.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} />
                        {image.location}
                      </span>
                    ) : null}
                    <span>
                      {image.tripDate || (image.createdAt?.toDate ? image.createdAt.toDate().toLocaleDateString("en-IN") : "Recent")}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {image.title || "Unforgettable Journey"}
                  </h2>

                  {image.description ? (
                    <p className="text-sm leading-7 text-slate-300">{image.description}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

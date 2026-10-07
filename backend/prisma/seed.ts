/**
 * seed.ts — SkillSwap rich development seed
 *
 * Creates:
 *   • 6 user accounts (all email-verified via direct DB write — no email flow)
 *   • 12 categories + 10 skills
 *   • 18 listings (8 SKILL_OFFER + 10 TOOL_LISTING)
 *     — real Porto / Lisbon / Braga coordinates
 *     — listing + avatar images downloaded from Unsplash into the media volume
 *       (`/media/listings/`, `/media/avatars/`) for Express static serving
 *
 * Run:  npm run db:seed
 * Idempotent: bails out if seed marker user already exists.
 */

import { PrismaClient } from "@prisma/client";
import { createAuthClient } from "better-auth/client";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const prisma = new PrismaClient();

const AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";
const MEDIA_ROOT = path.resolve(process.env.MEDIA_PATH ?? "/app/media");
const LISTINGS_DIR = path.join(MEDIA_ROOT, "listings");
const AVATARS_DIR = path.join(MEDIA_ROOT, "avatars");

const authClient = createAuthClient({
  baseURL: AUTH_URL,
  basePath: "/api/auth",
});

// ─── Image downloader ─────────────────────────────────────────────────────────

type MediaSubdir = "listings" | "avatars";

/**
 * Downloads a remote image into <MEDIA_ROOT>/<subdir>/<filename>
 * and returns the URL path Express serves: /media/<subdir>/<filename>
 *
 * Skips the download if the file already exists (re-run safe).
 * Falls back gracefully — caller can omit the path if download fails.
 */
async function downloadImage(
  url: string,
  filename: string,
  subdir: MediaSubdir = "listings",
): Promise<string | null> {
  const dir = subdir === "listings" ? LISTINGS_DIR : AVATARS_DIR;
  const dest = path.join(dir, filename);
  const urlPath = `/media/${subdir}/${filename}`;

  try {
    await fs.access(dest);
    return urlPath; // already on disk
  } catch {
    // file doesn't exist yet — continue
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SkillSwap-Seed/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buffer);
    return urlPath;
  } catch (err) {
    console.warn(`  ⚠  Could not download ${filename}: ${(err as Error).message}`);
    return null;
  }
}

// ─── Unsplash source URLs (stable CDN links, no API key needed) ───────────────

const UNSPLASH: Record<string, string> = {
  guitar:         "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
  woodworking:    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
  yoga:           "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80",
  coding:         "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
  cooking:        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  language:       "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
  photo:          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
  drawing:        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  drill:          "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
  ladder:         "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  camera:         "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  projector:      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
  mixer:          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  sewing:         "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  kayak:          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  telescope:      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
  pressurewasher: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
  vinyl:          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
};

/** Portrait URLs for seeded user avatars (same download path as listing images). */
const AVATAR_UNSPLASH: Record<string, string> = {
  ana:     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  joao:    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  mariana: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  tiago:   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  sofia:   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  admin:   "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
};

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function signUpAndVerify(opts: {
  name: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
  isIdentityVerified?: boolean;
}) {
  const { error } = await authClient.signUp.email({
    name: opts.name,
    email: opts.email,
    password: opts.password,
    fetchOptions: { headers: { origin: AUTH_URL } },
  });

  if (error) {
    if (error.message?.toLowerCase().includes("already")) {
      console.log(`  ↩  ${opts.email} already exists, skipping`);
      return null;
    }
    throw new Error(`signUp failed for ${opts.email}: ${error.message}`);
  }

  // Mark email verified directly — no email delivery needed in dev
  const user = await prisma.user.update({
    where: { email: opts.email },
    data: { emailVerified: true },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bio: opts.bio ?? null,
      location: opts.location ?? null,
      latitude: opts.latitude ?? null,
      longitude: opts.longitude ?? null,
      avatarUrl: opts.avatarUrl ?? null,
      isIdentityVerified: opts.isIdentityVerified ?? false,
    },
    update: {
      bio: opts.bio ?? null,
      location: opts.location ?? null,
      latitude: opts.latitude ?? null,
      longitude: opts.longitude ?? null,
      avatarUrl: opts.avatarUrl ?? null,
      isIdentityVerified: opts.isIdentityVerified ?? false,
    },
  });

  console.log(`  ✓  ${opts.email}`);
  return user;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Seed skipped — never run in production.");
    return;
  }

  // Idempotency guard
  const marker = await prisma.user.findUnique({ where: { email: "ana.silva@example.com" } });
  if (marker) {
    console.log("Rich seed already applied. Nothing to do.");
    return;
  }

  console.log("\n🌱  Seeding database…\n");

  // Ensure media dirs exist on the volume
  fsSync.mkdirSync(LISTINGS_DIR, { recursive: true });
  fsSync.mkdirSync(AVATARS_DIR, { recursive: true });
  console.log(`📁  Media dirs: ${LISTINGS_DIR}, ${AVATARS_DIR}`);

  async function downloadBatch(
    sources: Record<string, string>,
    subdir: MediaSubdir,
    label: string,
  ): Promise<Record<string, string | null>> {
    const map: Record<string, string | null> = {};
    const batchKeys = Object.keys(sources);
    for (let i = 0; i < batchKeys.length; i += 4) {
      await Promise.all(
        batchKeys.slice(i, i + 4).map(async (key) => {
          const filename = `seed-${key}.jpg`;
          map[key] = await downloadImage(sources[key]!, filename, subdir);
          if (map[key]) console.log(`  ✓  ${label}/${filename}`);
        }),
      );
    }
    return map;
  }

  console.log("\n🖼   Downloading listing images…");
  const imageMap = await downloadBatch(UNSPLASH, "listings", "listings");

  console.log("\n👤  Downloading avatar images…");
  const avatarMap = await downloadBatch(AVATAR_UNSPLASH, "avatars", "avatars");

  // ── Categories ────────────────────────────────────────────────────────────

  console.log("\n📦  Categories");
  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
      { name: "Home & Repair",    slug: "home-repair",    icon: "wrench",   order: 1  },
      { name: "Garden & Outdoor", slug: "garden-outdoor", icon: "leaf",     order: 2  },
      { name: "Kitchen",          slug: "kitchen",        icon: "chef",     order: 3  },
      { name: "Tech & Coding",    slug: "tech-coding",    icon: "code",     order: 4  },
      { name: "Music",            slug: "music",          icon: "music",    order: 5  },
      { name: "Languages",        slug: "languages",      icon: "globe",    order: 6  },
      { name: "Fitness & Sport",  slug: "fitness-sport",  icon: "dumbbell", order: 7  },
      { name: "Art & Craft",      slug: "art-craft",      icon: "palette",  order: 8  },
      { name: "Auto & Bike",      slug: "auto-bike",      icon: "car",      order: 9  },
      { name: "Photo & Video",    slug: "photo-video",    icon: "camera",   order: 10 },
      { name: "Tutoring",         slug: "tutoring",       icon: "book",     order: 11 },
      { name: "Events & Party",   slug: "events-party",   icon: "party",    order: 12 },
    ],
  });

  const cats = await prisma.category.findMany();
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!;

  // ── Skills ────────────────────────────────────────────────────────────────

  console.log("🎓  Skills");
  await prisma.skill.createMany({
    skipDuplicates: true,
    data: [
      { name: "Guitar",              slug: "guitar",             category: "music"         },
      { name: "Woodworking",         slug: "woodworking",        category: "home-repair"   },
      { name: "Yoga",                slug: "yoga",               category: "fitness-sport" },
      { name: "Web Development",     slug: "web-development",    category: "tech-coding"   },
      { name: "Portuguese Cooking",  slug: "portuguese-cooking", category: "kitchen"       },
      { name: "English Tutoring",    slug: "english-tutoring",   category: "languages"     },
      { name: "Photography",         slug: "photography",        category: "photo-video"   },
      { name: "Drawing & Sketching", slug: "drawing-sketching",  category: "art-craft"     },
      { name: "Bicycle Repair",      slug: "bicycle-repair",     category: "auto-bike"     },
      { name: "Event Planning",      slug: "event-planning",     category: "events-party"  },
    ],
  });

  const skills = await prisma.skill.findMany();
  const skill = (slug: string) => skills.find((s) => s.slug === slug)!;

  // ── Users ─────────────────────────────────────────────────────────────────

  console.log("\n👤  Users");
  const PASS = "Seedpass123!";

  const ana = await signUpAndVerify({
    name: "Ana Silva", email: "ana.silva@example.com", password: PASS,
    bio: "Guitar teacher and woodworking hobbyist based in Porto.",
    location: "Bonfim, Porto", latitude: 41.1496, longitude: -8.5979,
    avatarUrl: avatarMap.ana ?? undefined,
    isIdentityVerified: true,
  });

  const joao = await signUpAndVerify({
    name: "João Ferreira", email: "joao.ferreira@example.com", password: PASS,
    bio: "Freelance web developer and yoga enthusiast.",
    location: "Cedofeita, Porto", latitude: 41.1579, longitude: -8.6151,
    avatarUrl: avatarMap.joao ?? undefined,
    isIdentityVerified: true,
  });

  const mariana = await signUpAndVerify({
    name: "Mariana Costa", email: "mariana.costa@example.com", password: PASS,
    bio: "Photographer and language teacher based in Lisbon.",
    location: "Baixa, Lisboa", latitude: 38.7139, longitude: -9.1395,
    avatarUrl: avatarMap.mariana ?? undefined,
    isIdentityVerified: false,
  });

  const tiago = await signUpAndVerify({
    name: "Tiago Mendes", email: "tiago.mendes@example.com", password: PASS,
    bio: "DIY enthusiast with a garage full of tools. Based in Braga.",
    location: "Braga Centro", latitude: 41.5518, longitude: -8.4229,
    avatarUrl: avatarMap.tiago ?? undefined,
    isIdentityVerified: true,
  });

  const sofia = await signUpAndVerify({
    name: "Sofia Rodrigues", email: "sofia.rodrigues@example.com", password: PASS,
    bio: "Chef and cooking instructor in Matosinhos.",
    location: "Matosinhos, Porto", latitude: 41.1833, longitude: -8.6963,
    avatarUrl: avatarMap.sofia ?? undefined,
    isIdentityVerified: false,
  });

  await signUpAndVerify({
    name: "Admin User", email: "admin@example.com", password: PASS,
    bio: "Platform admin / test account.",
    location: "Porto", latitude: 41.1496, longitude: -8.6109,
    avatarUrl: avatarMap.admin ?? undefined,
    isIdentityVerified: true,
  });

  await signUpAndVerify({
    name: "Test User", email: "test@example.com", password: "Password123!",
    bio: "Test account for development.",
    location: "Porto", latitude: 41.1496, longitude: -8.6109,
    isIdentityVerified: false,
  });

  if (!ana || !joao || !mariana || !tiago || !sofia) {
    console.log("\n⚠️  Some users were skipped — not creating listings to avoid orphans.\n");
    return;
  }

  // ── Listing helpers ───────────────────────────────────────────────────────

  async function addMedia(listingId: string, imageKey: string) {
    const p = imageMap[imageKey];
    if (!p) return;
    await prisma.listingMedia.create({
      data: { listingId, type: "IMAGE", path: p, mimeType: "image/jpeg", order: 0 },
    });
  }

  async function createSkillListing(opts: {
    userId: string; title: string; description: string; tags: string[];
    categorySlug: string; skillSlug: string; estimatedHours: number;
    deliveryMethod: "IN_PERSON" | "REMOTE" | "BOTH"; exchangeFor: string;
    latitude: number; longitude: number; locationName: string; imageKey: string;
  }) {
    const listing = await prisma.listing.create({
      data: {
        userId: opts.userId, type: "SKILL_OFFER", title: opts.title,
        description: opts.description, tags: opts.tags, status: "ACTIVE",
        categoryId: cat(opts.categorySlug).id,
        latitude: opts.latitude, longitude: opts.longitude, locationName: opts.locationName,
        skillDetail: {
          create: {
            skillId: skill(opts.skillSlug).id,
            estimatedHours: opts.estimatedHours,
            deliveryMethod: opts.deliveryMethod,
            exchangeFor: opts.exchangeFor,
          },
        },
      },
    });
    await addMedia(listing.id, opts.imageKey);
    console.log(`  ✓  [SKILL] ${opts.title}`);
  }

  async function createToolListing(opts: {
    userId: string; title: string; description: string; tags: string[];
    categorySlug: string; toolCategory: string; condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
    depositAmount?: number; maxBorrowDays?: number; pickupLocation?: string;
    latitude: number; longitude: number; locationName: string; imageKey: string;
  }) {
    const listing = await prisma.listing.create({
      data: {
        userId: opts.userId, type: "TOOL_LISTING", title: opts.title,
        description: opts.description, tags: opts.tags, status: "ACTIVE",
        categoryId: cat(opts.categorySlug).id,
        latitude: opts.latitude, longitude: opts.longitude, locationName: opts.locationName,
        toolDetail: {
          create: {
            category: opts.toolCategory, condition: opts.condition,
            depositAmount: opts.depositAmount ?? null,
            maxBorrowDays: opts.maxBorrowDays ?? null,
            pickupLocation: opts.pickupLocation ?? null,
          },
        },
      },
    });
    await addMedia(listing.id, opts.imageKey);
    console.log(`  ✓  [TOOL]  ${opts.title}`);
  }

  // ── Skill listings ────────────────────────────────────────────────────────

  console.log("\n📋  Listings");

  await createSkillListing({
    userId: ana.id, title: "Guitar lessons for beginners",
    description: "I've been playing classical and acoustic guitar for 15 years and love teaching. Sessions are relaxed and fun — great for complete beginners or people returning after a break. I can come to you or we meet in my flat in Bonfim. Happy to swap for woodworking help, cooking lessons or anything creative.",
    tags: ["guitar", "music", "beginner", "classical", "acoustic"],
    categorySlug: "music", skillSlug: "guitar", estimatedHours: 2, deliveryMethod: "IN_PERSON",
    exchangeFor: "Woodworking help, cooking lessons, or any creative skill",
    latitude: 41.1496, longitude: -8.5979, locationName: "Bonfim, Porto", imageKey: "guitar",
  });

  await createSkillListing({
    userId: ana.id, title: "Woodworking & basic carpentry",
    description: "I can help with small furniture repairs, building shelves, fitting doors, or just getting started with hand tools. I have my own tools but can use yours too. Based in Porto — Bonfim and nearby areas.",
    tags: ["woodworking", "carpentry", "DIY", "furniture", "repairs"],
    categorySlug: "home-repair", skillSlug: "woodworking", estimatedHours: 3, deliveryMethod: "IN_PERSON",
    exchangeFor: "Guitar lessons or Portuguese cooking lessons",
    latitude: 41.1512, longitude: -8.6001, locationName: "Bonfim / Campanhã, Porto", imageKey: "woodworking",
  });

  await createSkillListing({
    userId: joao.id, title: "React & Next.js web development tutoring",
    description: "Senior frontend developer offering 1-on-1 sessions on React, Next.js, TypeScript and modern web tooling. Whether you're a complete beginner or stuck on a specific project — I can help. Remote sessions preferred but I'm also in Cedofeita.",
    tags: ["react", "nextjs", "typescript", "frontend", "coding", "web"],
    categorySlug: "tech-coding", skillSlug: "web-development", estimatedHours: 2, deliveryMethod: "BOTH",
    exchangeFor: "Yoga classes, cooking lessons, or any fitness/wellness skill",
    latitude: 41.1579, longitude: -8.6151, locationName: "Cedofeita, Porto", imageKey: "coding",
  });

  await createSkillListing({
    userId: joao.id, title: "Yoga for stress & flexibility — all levels",
    description: "Certified Hatha yoga teacher offering group or 1-on-1 sessions. Great for stress relief, flexibility and building a morning routine. I teach in parks (Jardim da Cordoaria is my favourite spot), community centres or your home.",
    tags: ["yoga", "fitness", "wellness", "mindfulness", "flexibility"],
    categorySlug: "fitness-sport", skillSlug: "yoga", estimatedHours: 1, deliveryMethod: "IN_PERSON",
    exchangeFor: "Tech help, photography sessions, or cooking lessons",
    latitude: 41.1455, longitude: -8.6164, locationName: "Jardim da Cordoaria, Porto", imageKey: "yoga",
  });

  await createSkillListing({
    userId: mariana.id, title: "English conversation & business English",
    description: "Native-level English speaker offering conversation practice and business English coaching. Focus on natural speaking, pronunciation and confidence. Great for professionals preparing for meetings or interviews.",
    tags: ["english", "language", "conversation", "business", "tutoring"],
    categorySlug: "languages", skillSlug: "english-tutoring", estimatedHours: 1, deliveryMethod: "BOTH",
    exchangeFor: "Photography tips, Portuguese lessons, or creative skills",
    latitude: 38.7139, longitude: -9.1395, locationName: "Baixa, Lisboa", imageKey: "language",
  });

  await createSkillListing({
    userId: mariana.id, title: "Portrait & street photography workshop",
    description: "Professional photographer offering 2-hour walking workshops in Lisbon. We'll cover composition, light reading, and editing basics in Lightroom. Perfect for people with a DSLR or mirrorless camera who want to go beyond auto mode.",
    tags: ["photography", "portrait", "street", "lightroom", "workshop"],
    categorySlug: "photo-video", skillSlug: "photography", estimatedHours: 2, deliveryMethod: "IN_PERSON",
    exchangeFor: "Language lessons, design skills, or cooking",
    latitude: 38.7223, longitude: -9.1393, locationName: "Alfama, Lisboa", imageKey: "photo",
  });

  await createSkillListing({
    userId: sofia.id, title: "Authentic Portuguese cooking — bacalhau & more",
    description: "Born and raised in Matosinhos, I'll teach you the real deal: bacalhau à brás, caldo verde, pastéis de nata from scratch. Classes are hands-on in my kitchen, groups of up to 4. We eat everything at the end!",
    tags: ["cooking", "portuguese", "bacalhau", "traditional", "kitchen"],
    categorySlug: "kitchen", skillSlug: "portuguese-cooking", estimatedHours: 3, deliveryMethod: "IN_PERSON",
    exchangeFor: "Web development help, photography, or any creative skill",
    latitude: 41.1833, longitude: -8.6963, locationName: "Matosinhos, Porto", imageKey: "cooking",
  });

  await createSkillListing({
    userId: sofia.id, title: "Drawing & illustration for beginners",
    description: "Self-taught illustrator offering relaxed sketching sessions. We'll cover proportion, shading, and building confidence with pen and paper. No experience needed. I usually set up in Parque da Cidade when weather is good.",
    tags: ["drawing", "illustration", "sketching", "art", "beginner"],
    categorySlug: "art-craft", skillSlug: "drawing-sketching", estimatedHours: 2, deliveryMethod: "IN_PERSON",
    exchangeFor: "Cooking lessons, yoga, or outdoor activities",
    latitude: 41.1693, longitude: -8.6949, locationName: "Parque da Cidade, Porto", imageKey: "drawing",
  });

  // ── Tool listings ─────────────────────────────────────────────────────────

  await createToolListing({
    userId: tiago.id, title: "Bosch cordless drill + bit set (18V)",
    description: "Bosch GSR 18V-55 — great condition, barely used. Comes with 2 batteries, charger, and a full 40-piece bit set. Perfect for shelves, flatpack assembly, or any home project.",
    tags: ["drill", "cordless", "bosch", "DIY", "home-repair"],
    categorySlug: "home-repair", toolCategory: "Power Tools", condition: "LIKE_NEW",
    depositAmount: 3000, maxBorrowDays: 7, pickupLocation: "Braga Centro (near Arco da Porta Nova)",
    latitude: 41.5518, longitude: -8.4229, locationName: "Braga Centro", imageKey: "drill",
  });

  await createToolListing({
    userId: tiago.id, title: "6m aluminium extension ladder",
    description: "Heavy duty aluminium ladder, extends from 3m to 6m. Great for painting, gutters, tree pruning. Solid and stable. You'll need a van or roof bars to pick up.",
    tags: ["ladder", "aluminium", "extension", "painting", "outdoor"],
    categorySlug: "home-repair", toolCategory: "Ladders & Access", condition: "GOOD",
    depositAmount: 2000, maxBorrowDays: 3, pickupLocation: "Braga — garage access from Rua do Souto",
    latitude: 41.5488, longitude: -8.4265, locationName: "Braga", imageKey: "ladder",
  });

  await createToolListing({
    userId: mariana.id, title: "Sony A7III + 35mm f/1.8 lens for rent",
    description: "My personal Sony A7III full-frame mirrorless body with a beautiful 35mm f/1.8 prime. Perfect for events, portraits, travel. Includes memory card and bag. You should have some camera experience. Lisbon pickup.",
    tags: ["sony", "a7iii", "mirrorless", "camera", "full-frame", "rental"],
    categorySlug: "photo-video", toolCategory: "Cameras", condition: "LIKE_NEW",
    depositAmount: 15000, maxBorrowDays: 5, pickupLocation: "Príncipe Real, Lisboa",
    latitude: 38.7143, longitude: -9.1510, locationName: "Príncipe Real, Lisboa", imageKey: "camera",
  });

  await createToolListing({
    userId: joao.id, title: "Portable projector + 100\" screen",
    description: "Anker Nebula Cosmos portable projector, 1080p, 900 ANSI lumens. Comes with a 100-inch pull-up screen and HDMI cable. Great for outdoor movie nights, presentations, or parties.",
    tags: ["projector", "portable", "cinema", "events", "1080p"],
    categorySlug: "events-party", toolCategory: "AV Equipment", condition: "GOOD",
    depositAmount: 5000, maxBorrowDays: 3, pickupLocation: "Cedofeita, Porto",
    latitude: 41.1579, longitude: -8.6151, locationName: "Cedofeita, Porto", imageKey: "projector",
  });

  await createToolListing({
    userId: sofia.id, title: "KitchenAid stand mixer — baking loans",
    description: "Classic KitchenAid Artisan in empire red, 4.8L bowl. Perfect for baking bread, cakes, pastry. Also includes the pasta roller attachment. Pickup from Matosinhos.",
    tags: ["kitchenaid", "mixer", "baking", "kitchen", "stand-mixer"],
    categorySlug: "kitchen", toolCategory: "Kitchen Appliances", condition: "GOOD",
    depositAmount: 8000, maxBorrowDays: 4, pickupLocation: "Matosinhos — near the market",
    latitude: 41.1833, longitude: -8.6963, locationName: "Matosinhos, Porto", imageKey: "mixer",
  });

  await createToolListing({
    userId: ana.id, title: "Brother sewing machine — ideal for beginners",
    description: "Brother FS40 computerised sewing machine with 40 stitch patterns. Very easy to use, great for curtains, clothing repairs, simple projects. Comes with original manual and spare bobbins.",
    tags: ["sewing", "machine", "brother", "craft", "textile"],
    categorySlug: "art-craft", toolCategory: "Craft Equipment", condition: "LIKE_NEW",
    depositAmount: 4000, maxBorrowDays: 7, pickupLocation: "Bonfim, Porto",
    latitude: 41.1496, longitude: -8.5979, locationName: "Bonfim, Porto", imageKey: "sewing",
  });

  await createToolListing({
    userId: tiago.id, title: "Sit-on-top kayak — single seat",
    description: "Stable and easy to paddle 3m sit-on-top kayak. Comes with a paddle and buoyancy aid (size M/L). Pickup from Braga — you'll need a roof rack. Ideal for a weekend trip to Gerês.",
    tags: ["kayak", "outdoor", "water", "adventure", "sport"],
    categorySlug: "fitness-sport", toolCategory: "Water Sports", condition: "GOOD",
    depositAmount: 5000, maxBorrowDays: 3, pickupLocation: "Braga (garage — by appointment)",
    latitude: 41.5518, longitude: -8.4229, locationName: "Braga", imageKey: "kayak",
  });

  await createToolListing({
    userId: joao.id, title: "Celestron telescope — stargazing nights",
    description: "Celestron AstroMaster 70AZ refractor telescope. Great for the moon, planets and star clusters. Easy to set up — comes with two eyepieces and a star map. Porto pickup.",
    tags: ["telescope", "astronomy", "stargazing", "science", "celestron"],
    categorySlug: "garden-outdoor", toolCategory: "Optics", condition: "LIKE_NEW",
    depositAmount: 6000, maxBorrowDays: 5, pickupLocation: "Cedofeita, Porto",
    latitude: 41.1550, longitude: -8.6180, locationName: "Cedofeita, Porto", imageKey: "telescope",
  });

  await createToolListing({
    userId: tiago.id, title: "Kärcher K4 pressure washer",
    description: "Kärcher K4 Full Control, 1800W. Perfect for patios, driveways, fences, garden furniture or a car wash. All standard attachments included including the Vario and Dirt Blaster lances.",
    tags: ["pressure-washer", "karcher", "cleaning", "outdoor", "garden"],
    categorySlug: "garden-outdoor", toolCategory: "Cleaning Equipment", condition: "GOOD",
    depositAmount: 4000, maxBorrowDays: 2, pickupLocation: "Braga Centro",
    latitude: 41.5505, longitude: -8.4215, locationName: "Braga", imageKey: "pressurewasher",
  });

  await createToolListing({
    userId: ana.id, title: "Vinyl record player (belt-drive, Bluetooth)",
    description: "Audio-Technica AT-LP120XBT — great condition. Plays 33/45/78 RPM, built-in preamp and Bluetooth output. Includes original dust cover. For music lovers wanting to explore a vinyl collection.",
    tags: ["vinyl", "record-player", "audio-technica", "music", "hifi"],
    categorySlug: "music", toolCategory: "Audio Equipment", condition: "LIKE_NEW",
    depositAmount: 7000, maxBorrowDays: 7, pickupLocation: "Bonfim, Porto",
    latitude: 41.1488, longitude: -8.5956, locationName: "Bonfim, Porto", imageKey: "vinyl",
  });

  console.log("\n✅  Seed complete!\n");
  console.log("  Accounts (password for all: Seedpass123!)");
  console.log("  ─────────────────────────────────────────");
  console.log("  ana.silva@example.com       Porto, verified ✓");
  console.log("  joao.ferreira@example.com   Porto, verified ✓");
  console.log("  mariana.costa@example.com   Lisboa");
  console.log("  tiago.mendes@example.com    Braga, verified ✓");
  console.log("  sofia.rodrigues@example.com Matosinhos");
  console.log("  admin@example.com           Porto, verified ✓");
  console.log("  test@example.com            Porto  (password: Password123!)\n");
}

main()
  .catch((e) => {
    console.error("\n💥  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

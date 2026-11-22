import type { Architecture, Hop } from "@/components/arch/types";

/*
 * Market Price Pro — backend architecture.
 * Floor plan is 1200 × 600 units: clients on the left, the EKS cluster in the
 * middle, data on the right. Flows are illustrative (no measured timings).
 */

/**
 * one user reading today's rates during a burst, answered from Redis.
 * Only the lead request of each client leaves tags, so six requests don't stack six tags.
 */
const burstRead = (client: "ios" | "android", lead = false): Hop[] => [
  { kind: "travel", link: `${client}-api`, tone: "info", label: lead ? "GET /rates" : undefined, quick: true },
  { kind: "travel", link: "api-redis", tone: "info", quick: true },
  ...(lead ? [{ kind: "pulse", node: "redis", tone: "ok", tag: "cache HIT" } as Hop] : []),
  { kind: "travel", link: "api-redis", reverse: true, tone: "ok", quick: true },
  { kind: "travel", link: `${client}-api`, reverse: true, tone: "ok", quick: true },
  ...(lead ? [{ kind: "pulse", node: client, tone: "ok", tag: "200 from cache" } as Hop] : []),
];

export const marketPricePro: Architecture = {
  scene: {
    width: 1200,
    height: 600,
    groups: [{ id: "eks", label: "AWS · Amazon EKS", x: 320, y: 40, w: 500, h: 420 }],
    nodes: [
      { id: "ios", kind: "mobile", x: 120, y: 160, title: "iOS app", subtitle: "App Store", labelSide: "left" },
      { id: "android", kind: "mobile", x: 120, y: 330, title: "Android app", subtitle: "APK", labelSide: "left" },
      { id: "admin", kind: "browser", x: 120, y: 500, title: "Admin panel", subtitle: "web · admin role", labelSide: "left" },
      { id: "api", kind: "server", x: 480, y: 200, title: "NestJS API", subtitle: "REST · JWT admin / user" },
      { id: "cron", kind: "job", x: 640, y: 385, title: "Cron job", subtitle: "daily price snapshot", labelSide: "right" },
      { id: "redis", kind: "cache", x: 1030, y: 140, title: "Redis", subtitle: "hot price cache", labelSide: "right" },
      { id: "mysql", kind: "db", x: 1030, y: 400, title: "MySQL", subtitle: "prices · history", labelSide: "right" },
      { id: "fcm", kind: "external", x: 480, y: 525, title: "Firebase", subtitle: "FCM push · iOS + Android", labelSide: "bottom" },
    ],
    links: [
      { id: "ios-api", from: "ios", to: "api" },
      { id: "android-api", from: "android", to: "api" },
      { id: "admin-api", from: "admin", to: "api" },
      { id: "api-redis", from: "api", to: "redis" },
      { id: "api-mysql", from: "api", to: "mysql" },
      { id: "cron-mysql", from: "cron", to: "mysql" },
      { id: "api-fcm", from: "api", to: "fcm" },
      { id: "fcm-ios", from: "fcm", to: "ios" },
      { id: "fcm-android", from: "fcm", to: "android" },
    ],
  },

  flows: [
    {
      id: "read",
      label: "Read prices",
      note: "Most reads never touch MySQL: today's price lists are served straight from the Redis cache.",
      lanes: [
        [
          { kind: "travel", link: "ios-api", tone: "info", label: "GET /prices" },
          { kind: "pulse", node: "api", tone: "info", tag: "JWT ok · user" },
          { kind: "travel", link: "api-redis", tone: "info" },
          { kind: "pulse", node: "redis", tone: "ok", tag: "cache HIT" },
          { kind: "travel", link: "api-redis", reverse: true, tone: "ok", quick: true },
          { kind: "travel", link: "ios-api", reverse: true, tone: "ok", label: "200" },
          { kind: "pulse", node: "ios", tone: "ok", tag: "prices shown" },
        ],
      ],
    },
    {
      id: "history",
      label: "Price history",
      note: "On a cache miss the API reads one page of history from MySQL, converts times to the user's time zone, then caches the page.",
      lanes: [
        [
          { kind: "travel", link: "android-api", tone: "info", label: "GET /history?page=2" },
          { kind: "pulse", node: "api", tone: "info", tag: "tz: Asia/Bangkok" },
          { kind: "travel", link: "api-redis", tone: "info", quick: true },
          { kind: "pulse", node: "redis", tone: "replay", tag: "cache MISS" },
          { kind: "travel", link: "api-mysql", tone: "info", label: "SELECT … LIMIT 20" },
          { kind: "pulse", node: "mysql", tone: "info", tag: "paginated query" },
          { kind: "travel", link: "api-mysql", reverse: true, tone: "ok", quick: true },
          { kind: "travel", link: "api-redis", tone: "info", label: "SET + TTL", quick: true },
          { kind: "pulse", node: "redis", tone: "ok", tag: "page cached" },
          { kind: "travel", link: "android-api", reverse: true, tone: "ok", label: "200" },
          { kind: "pulse", node: "android", tone: "ok", tag: "chart drawn" },
        ],
      ],
    },
    {
      id: "burst",
      label: "Peak burst",
      note: "When a rate is announced, many users open the app at the same moment. Every request is answered from Redis, so the burst never reaches MySQL.",
      stagger: 260,
      lanes: [burstRead("ios", true), burstRead("android", true), burstRead("ios"), burstRead("android"), burstRead("ios"), burstRead("android")],
    },
    {
      id: "update",
      label: "Admin update → push",
      note: "Only the admin role can write. The new price is saved, the cached copy is cleared, and Firebase pushes the change to both apps.",
      lanes: [
        [
          { kind: "travel", link: "admin-api", tone: "info", label: "PUT /admin/prices" },
          { kind: "pulse", node: "api", tone: "info", tag: "JWT ok · admin role" },
          { kind: "travel", link: "api-mysql", tone: "info", label: "UPDATE" },
          { kind: "pulse", node: "mysql", tone: "ok", tag: "price saved" },
          { kind: "travel", link: "api-redis", tone: "replay", label: "DEL", quick: true },
          { kind: "pulse", node: "redis", tone: "replay", tag: "stale entry cleared" },
          { kind: "travel", link: "admin-api", reverse: true, tone: "ok", label: "200", quick: true },
          { kind: "travel", link: "api-fcm", tone: "info", label: "send" },
          { kind: "pulse", node: "fcm", tone: "info", tag: "push queued" },
          { kind: "travel", link: "fcm-ios", tone: "ok", quick: true },
          { kind: "pulse", node: "ios", tone: "ok", tag: "🔔 new price" },
          { kind: "travel", link: "fcm-android", tone: "ok", quick: true },
          { kind: "pulse", node: "android", tone: "ok", tag: "🔔 new price" },
        ],
      ],
    },
    {
      id: "cron",
      label: "Daily snapshot",
      note: "A scheduled job runs once a day and stores the latest prices as a dated snapshot, so every day's prices are kept for the history charts.",
      lanes: [
        [
          { kind: "pulse", node: "cron", tone: "info", tag: "scheduled run" },
          { kind: "travel", link: "cron-mysql", tone: "info", label: "INSERT snapshot" },
          { kind: "pulse", node: "mysql", tone: "ok", tag: "today's prices kept" },
        ],
      ],
    },
  ],
};

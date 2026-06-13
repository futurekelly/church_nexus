import type { Sermon } from "../types/sermon.types";

const createSvgPlaceholder = (title: string, color1: string, color2: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="400" cy="250" r="150" fill="white" opacity="0.05" />
    <circle cx="150" cy="150" r="80" fill="white" opacity="0.03" />
    <circle cx="650" cy="350" r="120" fill="white" opacity="0.04" />
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="44" fill="white" opacity="0.9">
      ${title}
    </text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="medium" font-size="20" fill="white" opacity="0.65">
      SERMON AUDIO &amp; VIDEO
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const now = new Date();
const daysAgo = (d: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - d);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const MOCK_SERMONS: Sermon[] = [
  {
    id: "se-001",
    title: "Walking in Grace",
    description: "An deep exposition of Romans 5, exploring how God's unmerited favor redeems our failures and empowers our daily walk with Him.",
    scripture_reference: "Romans 5:1-11",
    sermon_date: daysAgo(3),
    status: "Published",
    thumbnail: createSvgPlaceholder("Walking in Grace", "#3b82f6", "#8b5cf6"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4", // Free public video for simulation
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Free public audio for simulation
    speaker: "Rev. David Kamau",
    category: "Grace",
    featured: true,
    notes: `## Sermon Outline
1. **The Foundation of Peace (v. 1-2)**
   - Justified by faith, we have peace with God through Jesus.
   - We stand in grace and rejoice in the hope of God's glory.

2. **The Purpose of Trials (v. 3-5)**
   - Sufferings produce perseverance, character, and hope.
   - God's love is poured into our hearts by the Holy Spirit.

3. **The Demonstration of Love (v. 6-8)**
   - Christ died for us while we were still sinners.

### Reflection Questions
1. How does knowing you are justified by faith change your daily relationship with God?
2. In what areas of your life do you need to rely more on His grace rather than your own strength?`,
    tags: ["Grace", "Faith", "Salvation"],
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: "se-002",
    title: "The Power of Persistent Prayer",
    description: "Discover how persistent, heartfelt prayer changes hearts, align us with God's will, and unleashes spiritual breakthroughs.",
    scripture_reference: "Luke 18:1-8",
    sermon_date: daysAgo(10),
    status: "Published",
    thumbnail: createSvgPlaceholder("Persistent Prayer", "#a855f7", "#ec4899"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    speaker: "Rev. Grace Wanjiku",
    category: "Prayer",
    featured: false,
    notes: `## Outline
1. **The Parable of the Persistent Widow**
   - Cry out to Him night and day.
   - God is quick to bring justice to His chosen ones.

2. **Aligning with His Will**
   - Prayer is not about bending God to our will, but bending our will to His.`,
    tags: ["Prayer", "Hope", "Breakthrough"],
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  },
  {
    id: "se-003",
    title: "Building a Solid Family Foundation",
    description: "Practical and biblical principles for strengthening marriages and raising children in an atmosphere of love, respect, and faith.",
    scripture_reference: "Joshua 24:14-18",
    sermon_date: daysAgo(17),
    status: "Published",
    thumbnail: createSvgPlaceholder("Family Foundation", "#f97316", "#ef4444"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    speaker: "Pastor Samuel Ochieng",
    category: "Family",
    featured: true,
    notes: `## Outline
1. **Choose Whom You Will Serve**
   - Decision-making begins with the head of the household.
   - 'As for me and my house, we will serve the Lord.'`,
    tags: ["Family", "Love", "Home"],
    created_at: daysAgo(17),
    updated_at: daysAgo(17),
  },
  {
    id: "se-004",
    title: "Hope in Times of Uncertainty",
    description: "When the storms of life hit, where is your anchor? Learn how to find resting hope in the unfailing promises of God.",
    scripture_reference: "Hebrews 6:13-20",
    sermon_date: daysAgo(24),
    status: "Published",
    thumbnail: createSvgPlaceholder("Anchor of Hope", "#0ea5e9", "#14b8a6"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    speaker: "Pastor John Smith",
    category: "Hope",
    featured: false,
    notes: `## Outline
1. **The Certainty of God's Promise**
   - God swore by Himself; His counsel is immutable.
   - We have strong encouragement to hold fast to the hope set before us.`,
    tags: ["Hope", "Promises", "Anchor"],
    created_at: daysAgo(24),
    updated_at: daysAgo(24),
  },
  {
    id: "se-005",
    title: "Servant Leadership in Ministry",
    description: "Following Christ's example of leadership. True greatness is found not in being served, but in serving others.",
    scripture_reference: "Mark 10:35-45",
    sermon_date: daysAgo(31),
    status: "Published",
    thumbnail: createSvgPlaceholder("Servant Leadership", "#6366f1", "#06b6d4"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    speaker: "Rev. David Kamau",
    category: "Leadership",
    featured: false,
    notes: `## Outline
1. **The Request of James and John**
   - Asking for seats of honor.
   - Jesus redirects them to the cup of suffering.`,
    tags: ["Leadership", "Service", "Humility"],
    created_at: daysAgo(31),
    updated_at: daysAgo(31),
  },
  {
    id: "se-006",
    title: "Living Out God's Love",
    description: "Exploring the depth of 1 Corinthians 13 and what it means to practice unconditional love in a divided world.",
    scripture_reference: "1 Corinthians 13:1-13",
    sermon_date: daysAgo(38),
    status: "Published",
    thumbnail: createSvgPlaceholder("Unconditional Love", "#ec4899", "#f43f5e"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    speaker: "Pastor Peter Mwangi",
    category: "Love",
    featured: false,
    notes: `## Outline
1. **The Necessity of Love**
   - Without love, our spiritual gifts and sacrifices are nothing.`,
    tags: ["Love", "Fellowship", "Character"],
    created_at: daysAgo(38),
    updated_at: daysAgo(38),
  },
  {
    id: "se-007",
    title: "Understanding True Worship",
    description: "Worship is more than a song on Sunday. It is a daily lifestyle of surrender and devotion to our Creator.",
    scripture_reference: "John 4:19-24",
    sermon_date: daysAgo(45),
    status: "Published",
    thumbnail: createSvgPlaceholder("Worship in Spirit", "#10b981", "#84cc16"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    speaker: "Rev. Grace Wanjiku",
    category: "Worship",
    featured: false,
    notes: `## Outline
1. **Worship in Spirit and Truth**
   - Not bound to a specific mountain or temple.
   - Father seeks those who worship Him in spirit and truth.`,
    tags: ["Worship", "Devotion", "Surrender"],
    created_at: daysAgo(45),
    updated_at: daysAgo(45),
  },
  {
    id: "se-008",
    title: "Redeemed by His Blood",
    description: "A profound theological study of Christ's substitutionary atonement and the freedom we receive through His cross.",
    scripture_reference: "Ephesians 1:3-14",
    sermon_date: daysAgo(52),
    status: "Published",
    thumbnail: createSvgPlaceholder("Redeemed by Blood", "#ef4444", "#991b1b"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    speaker: "Pastor Samuel Ochieng",
    category: "Salvation",
    featured: false,
    notes: `## Outline
1. **Redemption Through His Blood**
   - The forgiveness of our trespasses according to the riches of His grace.`,
    tags: ["Salvation", "Redemption", "Atonement"],
    created_at: daysAgo(52),
    updated_at: daysAgo(52),
  },
  {
    id: "se-009",
    title: "Developing Strong Faith",
    description: "How to grow a resilient faith that survives intellectual doubts, life challenges, and cultural pressures.",
    scripture_reference: "Hebrews 11:1-6",
    sermon_date: daysAgo(59),
    status: "Published",
    thumbnail: createSvgPlaceholder("Resilient Faith", "#84cc16", "#0ea5e9"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    speaker: "Pastor John Smith",
    category: "Faith",
    featured: false,
    notes: `## Outline
1. **The Definition of Faith**
   - Substance of things hoped for, evidence of things not seen.`,
    tags: ["Faith", "Growth", "Hebrews"],
    created_at: daysAgo(59),
    updated_at: daysAgo(59),
  },
  {
    id: "se-010",
    title: "The Kingdom Assignment",
    description: "Preparing a new series on the Great Commission and our local church mission in the community.",
    scripture_reference: "Matthew 28:16-20",
    sermon_date: daysAgo(1),
    status: "Draft",
    thumbnail: createSvgPlaceholder("Kingdom Assignment", "#4b5563", "#1f2937"),
    video_url: "",
    audio_url: "",
    speaker: "Rev. David Kamau",
    category: "Leadership",
    featured: false,
    notes: `Draft sermon outline. Detailed notes pending.`,
    tags: ["Outreach", "Mission", "Draft"],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: "se-011",
    title: "A Study on Biblical Stewardship",
    description: "Archives of Pastor Samuel's financial stewardship sermon delivered in late 2025.",
    scripture_reference: "Malachi 3:8-12",
    sermon_date: daysAgo(120),
    status: "Archived",
    thumbnail: createSvgPlaceholder("Biblical Stewardship", "#d97706", "#78350f"),
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    speaker: "Pastor Samuel Ochieng",
    category: "Leadership",
    featured: false,
    notes: `Archived notes on tithing and church growth finances.`,
    tags: ["Stewardship", "Finances", "Archived"],
    created_at: daysAgo(125),
    updated_at: daysAgo(120),
  }
];

export const MOCK_SPEAKERS = [
  "Rev. David Kamau",
  "Rev. Grace Wanjiku",
  "Pastor Samuel Ochieng",
  "Pastor John Smith",
  "Pastor Peter Mwangi",
];

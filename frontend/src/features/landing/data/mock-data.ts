import type {
  Announcement,
  DailyScripture,
  FeaturedSermon,
  LandingStatistic,
  Ministry,
  Testimonial,
  UpcomingEvent,
} from "@/features/landing/types/landing.types";

export const mockAnnouncement: Announcement = {
  message:
    "Join us this Sunday for worship at 10:00 AM — in-person and livestream available.",
  link_label: "View Events",
  link_href: "#events",
};

export const mockDailyScripture: DailyScripture = {
  verse_reference: "Jeremiah 29:11",
  scripture_text:
    "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
  reflection:
    "Trust in God's purpose for your life today. His plans are rooted in hope and restoration.",
  display_date: new Date().toISOString().split("T")[0],
};

export const mockStatistics: LandingStatistic[] = [
  { id: "members", label: "Members", value: 1240, suffix: "+" },
  { id: "ministries", label: "Ministries", value: 12 },
  { id: "events", label: "Events", value: 48, suffix: "+" },
  { id: "livestream", label: "Livestream Views", value: 18500, suffix: "+" },
];

export const mockFeaturedSermons: FeaturedSermon[] = [
  {
    id: 1,
    title: "Walking in Faith",
    description:
      "Discover how to strengthen your faith through daily obedience and prayer.",
    speaker: "Pastor Michael Adeyemi",
    sermon_date: "2026-05-28",
    thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&h=400&fit=crop",
    duration: "42 min",
  },
  {
    id: 2,
    title: "The Power of Community",
    description:
      "God designed us for fellowship. Learn how community transforms spiritual growth.",
    speaker: "Pastor Michael Adeyemi",
    sermon_date: "2026-05-21",
    thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop",
    duration: "38 min",
  },
  {
    id: 3,
    title: "Hope in Every Season",
    description:
      "Finding God's presence through life's challenges and victories.",
    speaker: "Pastor Sarah Okonkwo",
    sermon_date: "2026-05-14",
    thumbnail: "https://images.unsplash.com/photo-1519491050282-cf00c82424bc?w=600&h=400&fit=crop",
    duration: "45 min",
  },
];

export const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: 1,
    title: "Sunday Worship Service",
    description: "Join us for worship, prayer, and an inspiring message.",
    location: "Main Sanctuary",
    start_date: "2026-06-08T10:00:00",
    end_date: "2026-06-08T12:00:00",
    banner: "https://images.unsplash.com/photo-1501386761578-eacae83aa7be?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Youth Night",
    description: "An evening of worship, games, and fellowship for ages 13–18.",
    location: "Youth Hall",
    start_date: "2026-06-12T18:00:00",
    end_date: "2026-06-12T21:00:00",
    banner: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Community Outreach",
    description: "Serve our neighborhood through food distribution and prayer.",
    location: "Community Center",
    start_date: "2026-06-15T09:00:00",
    end_date: "2026-06-15T14:00:00",
    banner: "https://images.unsplash.com/photo-1469571486292-7bba39a2bb6b?w=600&h=400&fit=crop",
  },
];

export const mockMinistries: Ministry[] = [
  {
    id: "youth",
    name: "Youth Ministry",
    description: "Empowering the next generation through faith, mentorship, and fellowship.",
    icon: "youth",
    member_count: 86,
  },
  {
    id: "choir",
    name: "Choir",
    description: "Leading the congregation in worship through music and praise.",
    icon: "choir",
    member_count: 42,
  },
  {
    id: "ushers",
    name: "Ushers",
    description: "Creating a welcoming atmosphere and assisting during services.",
    icon: "ushers",
    member_count: 24,
  },
  {
    id: "media",
    name: "Media Team",
    description: "Broadcasting services and managing digital content for the church.",
    icon: "media",
    member_count: 18,
  },
  {
    id: "womens",
    name: "Women's Ministry",
    description: "Building sisterhood through Bible study, prayer, and community care.",
    icon: "womens",
    member_count: 64,
  },
  {
    id: "mens",
    name: "Men's Fellowship",
    description: "Equipping men to lead with integrity at home, work, and church.",
    icon: "mens",
    member_count: 52,
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    author: "Grace Mwangi",
    role: "Church Member",
    content:
      "This church became a second home for my family. The community, teaching, and care have transformed our walk with God.",
    avatar_initials: "GM",
  },
  {
    id: 2,
    author: "David Chen",
    role: "Visitor turned Member",
    content:
      "From my first visit, I felt genuinely welcomed. The online platform makes it easy to stay connected all week.",
    avatar_initials: "DC",
  },
  {
    id: 3,
    author: "Amara Okafor",
    role: "Youth Leader",
    content:
      "Serving in ministry here has deepened my faith and given me purpose. The leadership truly invests in people.",
    avatar_initials: "AO",
  },
];

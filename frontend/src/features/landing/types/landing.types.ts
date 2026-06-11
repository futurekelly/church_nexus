export interface DailyScripture {
  verse_reference: string;
  scripture_text: string;
  reflection: string;
  display_date: string;
}

export interface LandingStatistic {
  id: string;
  label: string;
  value: number;
  suffix?: string;
}

export interface FeaturedSermon {
  id: number;
  title: string;
  description: string;
  speaker: string;
  sermon_date: string;
  thumbnail: string;
  duration: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  banner: string;
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: string;
  member_count: number;
}

export interface Testimonial {
  id: number;
  author: string;
  role: string;
  content: string;
  avatar_initials: string;
}

export interface Announcement {
  message: string;
  link_label?: string;
  link_href?: string;
}

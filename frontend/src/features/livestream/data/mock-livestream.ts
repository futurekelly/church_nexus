import type { LivestreamStatus, ChatMessage } from "../types/livestream.types";

export const INITIAL_LIVESTREAM: LivestreamStatus = {
  id: "live-session-1",
  is_live: true,
  title: "Sunday Praise & Thanksgiving Service",
  preacher: "Sir. Kelvin Mbise",
  description: "Welcome to our Sunday morning service! We are celebrating God's goodness and standing together in prayer and worship.",
  stream_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Free testing video URL
  viewer_count: 342,
  started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  branch_id: "branch-hq-dar", // HQ branch
};

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender_name: "Sir. Kelvin Mbise",
    sender_role: "Pastor",
    sender_id: "usr-pastor",
    message: "Bwana Yesu asifiwe! Karibuni sana kwenye ibada yetu ya leo.",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "msg-2",
    sender_name: "Sarah Jenkins",
    sender_role: "Member",
    sender_id: "mem-3",
    message: "Amen! Standing in agreement from Arusha. Praise the Lord!",
    timestamp: new Date(Date.now() - 2500000).toISOString(),
  },
  {
    id: "msg-3",
    sender_name: "Kelvin Mbise",
    sender_role: "Member",
    sender_id: "mem-2",
    message: "Good morning family! Blessed to be tuning in online today.",
    timestamp: new Date(Date.now() - 2000000).toISOString(),
  },
  {
    id: "msg-4",
    sender_name: "Grace Mrema",
    sender_role: "Member",
    sender_id: "mem-5",
    message: "Worship team is doing amazing. The presence of God is here.",
    timestamp: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: "msg-5",
    sender_name: "Michael Smith",
    sender_role: "Member",
    sender_id: "mem-4",
    message: "Amen to that! Ready for the word.",
    timestamp: new Date(Date.now() - 1000000).toISOString(),
  },
];

// Pool of random messages to pick from for simulated live chat traffic
export const SIMULATED_CHAT_POOL = [
  "Glory to God! 🙌",
  "Amen! Asante kwa neno zuri Mchungaji.",
  "Watching from Mwanza, God bless you all!",
  "What a powerful praise and worship session!",
  "Amen! God is good all the time.",
  "Tunabarikiwa sana na ibada hii.",
  "Praise the Lord! Standing in faith for healing.",
  "The sound is great today, thank you media team!",
  "Hallelujah! Amen.",
  "Receive strength in Jesus name.",
  "Amen! God bless the preacher.",
  "Praise the Lord! Watching with my family.",
  "Ujumbe huu una nguvu sana. Amina.",
  "Greetings from Nairobi, Kenya! 🇰🇪",
  "Amen, thank you for sharing the scripture reference.",
];

export const MOCK_DONORS_NAMES = [
  "Emmanuel Massawe",
  "Joyce Kimaro",
  "David Luoga",
  "Neema Shayo",
  "Bahati Mbowe",
  "Josephine Temu",
];

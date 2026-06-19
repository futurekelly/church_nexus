import type { MediaAsset, MediaCollection } from "../types/media.types";

export const MOCK_MEDIA_COLLECTIONS: MediaCollection[] = [
  {
    id: "a1a8c9e4-8db9-469b-980b-78891cf2c462",
    name: "Sermons 2026",
    description: "Media assets used in Sunday and mid-week sermons for the year 2026.",
    branch_id: "branch-001",
    created_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    created_at: "2026-01-15T10:00:00Z"
  },
  {
    id: "b2b9d0f5-9ec0-478c-a91c-89902df3d573",
    name: "Youth Ministry Media",
    description: "Marketing graphics, event photos, and announcements for Youth Church.",
    branch_id: "branch-001",
    created_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    created_at: "2026-02-10T14:30:00Z"
  },
  {
    id: "c3c0e1a6-0fd1-489d-ba2d-9aa13ef4e684",
    name: "Financial Audits & Reports",
    description: "Annual and quarterly financial documentation, receipts templates, and budgets.",
    branch_id: "branch-001",
    created_by: "f4c18495-e224-4fd3-b6e9-d94e7961d3f4",
    created_at: "2026-03-01T08:15:00Z"
  }
];

export const MOCK_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "e5015b57-61c0-43b9-b883-bd86c55cb04c",
    title: "Sunday Worship Sermon Slide - The Power of Grace",
    description: "Title background slides for the sermon preached on May 10, 2026.",
    file_name: "sermon_grace_slide.png",
    file_type: "image",
    file_size: 2048576, // 2MB
    file_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&h=150&fit=crop",
    category: "Sermon",
    branch_id: "branch-001",
    uploaded_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    uploaded_by_name: "Pastor Kelvin Mbise",
    is_public: true,
    download_count: 45,
    is_archived: false,
    archived_at: null,
    status: "Ready",
    created_at: "2026-05-10T12:30:00Z",
    updated_at: "2026-05-10T12:30:00Z"
  },
  {
    id: "f6126c68-72d1-44ca-c994-ce97d66dc15d",
    title: "Youth Conference 2026 Theme Video",
    description: "Opening promo video for the upcoming youth conference in Dar es Salaam.",
    file_name: "youth_conf_promo.mp4",
    file_type: "video",
    file_size: 47185920, // 45MB
    file_url: "https://assets.mixkit.co/videos/preview/mixkit-hands-clapping-at-a-music-concert-40245-large.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop",
    category: "Event",
    branch_id: "branch-001",
    uploaded_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    uploaded_by_name: "Pastor Kelvin Mbise",
    is_public: true,
    download_count: 128,
    is_archived: false,
    archived_at: null,
    status: "Ready",
    created_at: "2026-05-15T15:20:00Z",
    updated_at: "2026-05-15T15:20:00Z"
  },
  {
    id: "a7237d79-83e2-45db-da05-df08e77ed26e",
    title: "Faith Declaration Audio Devotional",
    description: "Weekly declarations audio recording for church members' morning meditation.",
    file_name: "weekly_faith_declarations.mp3",
    file_type: "audio",
    file_size: 8388608, // 8MB
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnail_url: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=150&h=150&fit=crop",
    category: "Social",
    branch_id: "branch-001",
    uploaded_by: "e5d08495-d224-4fd3-b6e9-d94e7961d3f4",
    uploaded_by_name: "Media Coordinator",
    is_public: true,
    download_count: 89,
    is_archived: false,
    archived_at: null,
    status: "Ready",
    created_at: "2026-05-20T06:00:00Z",
    updated_at: "2026-05-20T06:00:00Z"
  },
  {
    id: "b8348e8a-94f3-46ec-eb16-ef19f88fe37f",
    title: "Q1 Financial Reconciliation Statement",
    description: "Confidential financial ledger spreadsheet for treasurer review.",
    file_name: "Q1_financials_2026.pdf",
    file_type: "document",
    file_size: 1572864, // 1.5MB
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    thumbnail_url: null,
    category: "Document",
    branch_id: "branch-001",
    uploaded_by: "f4c18495-e224-4fd3-b6e9-d94e7961d3f4",
    uploaded_by_name: "Treasurer Sinza",
    is_public: false, // Private document, role gating restricted
    download_count: 5,
    is_archived: false,
    archived_at: null,
    status: "Ready",
    created_at: "2026-04-05T09:00:00Z",
    updated_at: "2026-04-05T09:00:00Z"
  },
  {
    id: "c9459f9b-a5f4-47fd-fc27-f02af99ff48a",
    title: "Tabata HQ Campus Groundbreaking Banner",
    description: "Archived graphic for the campus groundbreaking event.",
    file_name: "groundbreaking_banner.jpg",
    file_type: "image",
    file_size: 3145728, // 3MB
    file_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=150&h=150&fit=crop",
    category: "Other",
    branch_id: "branch-001",
    uploaded_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    uploaded_by_name: "Pastor Kelvin Mbise",
    is_public: true,
    download_count: 12,
    is_archived: true, // Soft-deleted item
    archived_at: "2026-06-01T12:00:00Z",
    status: "Ready",
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-06-01T12:00:00Z"
  }
];

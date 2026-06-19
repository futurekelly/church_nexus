import type { DocumentTemplate, GeneratedDocument, DocumentAuditLog } from "../types/documents.types";

export const MOCK_TEMPLATES: DocumentTemplate[] = [
  {
    id: "tmpl-baptism",
    name: "Standard Baptism Certificate",
    category: "certificate",
    template_version: 1,
    html_layout: "<h1>Certificate of Holy Baptism</h1><p>This certifies that {{member_name}} was baptized on {{baptism_date}} at {{baptism_place}} by {{baptism_officiant}}.</p>",
    stylesheet_tokens: {
      primaryColor: "#4f46e5",
      fontFamily: "Outfit",
      borderStyle: "double"
    },
    active: true,
    signature_asset_url: "https://church-nexus-signatures.s3.amazonaws.com/pastor-john.png",
    generated_count: 5,
    download_count: 8,
    last_downloaded_at: "2026-06-15T10:00:00Z",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z"
  },
  {
    id: "tmpl-salvation",
    name: "Salvation & Confirmation Certificate",
    category: "certificate",
    template_version: 1,
    html_layout: "<h1>Certificate of Confirmation</h1><p>Commemorating the salvation step taken by {{member_name}} on {{salvation_date}}.</p>",
    stylesheet_tokens: {
      primaryColor: "#059669",
      fontFamily: "Outfit",
      borderStyle: "solid"
    },
    active: true,
    signature_asset_url: "https://church-nexus-signatures.s3.amazonaws.com/pastor-john.png",
    generated_count: 3,
    download_count: 5,
    last_downloaded_at: "2026-06-14T11:00:00Z",
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-05T09:00:00Z"
  },
  {
    id: "tmpl-member-giving",
    name: "Year-End Member Giving Statement",
    category: "statement",
    template_version: 2,
    html_layout: "<h1>Individual Giving Statement</h1><p>Contributions ledger details for member {{member_name}} ({{membership_number}}) for the year {{year}}.</p>",
    stylesheet_tokens: {
      primaryColor: "#2563eb",
      fontFamily: "Inter",
      borderStyle: "none"
    },
    active: true,
    signature_asset_url: null,
    generated_count: 12,
    download_count: 24,
    last_downloaded_at: "2026-06-16T12:00:00Z",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-05-20T14:30:00Z"
  },
  {
    id: "tmpl-household-giving",
    name: "Year-End Household Giving Statement",
    category: "statement",
    template_version: 1,
    html_layout: "<h1>Household Giving Statement</h1><p>Consolidated contributions for the family: {{family_name}} for the year {{year}}.</p>",
    stylesheet_tokens: {
      primaryColor: "#2563eb",
      fontFamily: "Inter",
      borderStyle: "none"
    },
    active: true,
    signature_asset_url: null,
    generated_count: 4,
    download_count: 10,
    last_downloaded_at: "2026-06-16T13:00:00Z",
    created_at: "2026-01-12T11:00:00Z",
    updated_at: "2026-01-12T11:00:00Z"
  },
  {
    id: "tmpl-event-rsvp",
    name: "Event Attendance Roster",
    category: "roster",
    template_version: 1,
    html_layout: "<h1>Event Roster: {{event_name}}</h1><p>Registration logs and check-in audit lists.</p>",
    stylesheet_tokens: {
      primaryColor: "#db2777",
      fontFamily: "Inter",
      borderStyle: "dotted"
    },
    active: true,
    signature_asset_url: null,
    generated_count: 8,
    download_count: 12,
    last_downloaded_at: "2026-06-12T09:00:00Z",
    created_at: "2026-02-15T08:00:00Z",
    updated_at: "2026-02-15T08:00:00Z"
  }
];

export const MOCK_DOCUMENTS: GeneratedDocument[] = [
  {
    id: "doc-001",
    branch_id: "branch-001",
    document_type: "BAPTISM_CERT",
    format: "PDF",
    file_url: "/statements/stmt-m001-baptism.pdf",
    status: "Completed",
    template_version: 1,
    source_type: "Member",
    source_id: "m001", // David Kamau
    expires_at: null, // certificates never expire
    retention_policy: "PERMANENT",
    download_count: 3,
    last_downloaded_at: "2026-06-15T10:00:00Z",
    requested_by: "user-pastor-uuid",
    requested_at: "2026-06-15T09:45:00Z",
    completed_at: "2026-06-15T09:45:05Z",
    filter_metadata: { memberId: "m001" },
    is_archived: false
  },
  {
    id: "doc-002",
    branch_id: "branch-001",
    document_type: "MEMBER_STMT",
    format: "PDF",
    file_url: "/statements/stmt-m001-2026.pdf",
    status: "Completed",
    template_version: 2,
    source_type: "Member",
    source_id: "m001",
    expires_at: "2026-06-23T10:00:00Z", // expires in 7 days
    retention_policy: "7_DAYS",
    download_count: 2,
    last_downloaded_at: "2026-06-16T12:00:00Z",
    requested_by: "m001",
    requested_at: "2026-06-16T09:58:00Z",
    completed_at: "2026-06-16T09:58:04Z",
    filter_metadata: { memberId: "m001", year: 2026 },
    is_archived: false
  },
  {
    id: "doc-003",
    branch_id: "branch-001",
    document_type: "EVENT_RSVP",
    format: "CSV",
    file_url: null,
    status: "Failed",
    template_version: 1,
    source_type: "Event",
    source_id: "evt-001",
    expires_at: "2026-07-16T08:00:00Z",
    retention_policy: "30_DAYS",
    download_count: 0,
    last_downloaded_at: null,
    requested_by: "user-admin-uuid",
    requested_at: "2026-06-16T08:00:00Z",
    completed_at: null,
    filter_metadata: { eventId: "evt-001" },
    is_archived: false
  }
];

export const MOCK_AUDIT_LOGS: DocumentAuditLog[] = [
  {
    id: "log-doc-001",
    user_id: "user-pastor-uuid",
    action: "GENERATE",
    document_id: "doc-001",
    ip_address: "192.168.1.10",
    timestamp: "2026-06-15T09:45:00Z",
    details: "Generated Water Baptism Certificate for David Kamau (MBR-2020-000001)"
  },
  {
    id: "log-doc-002",
    user_id: "m001",
    action: "DOWNLOAD",
    document_id: "doc-002",
    ip_address: "192.168.1.15",
    timestamp: "2026-06-16T12:00:00Z",
    details: "Downloaded individual giving statement PDF for year 2026"
  }
];

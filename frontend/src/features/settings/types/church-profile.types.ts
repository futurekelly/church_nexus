export interface SocialMediaLinks {
  facebook?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
}

export interface ChurchProfileSettings {
  church_name: string;
  slogan?: string;
  logo_url: string;
  favicon_url?: string;
  website: string;
  email: string;
  phone: string;
  social_media: SocialMediaLinks;
  headquarters_branch_id: string;
}

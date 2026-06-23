export interface ParentDetail {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  parents: string[]; // Member IDs
  parent_details?: ParentDetail[];
  allergy_alerts?: string;
  special_needs?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
  age?: number;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
  capacity: number;
  room_leader?: string; // User ID
  created_at: string;
  updated_at: string;
}

export interface CheckInLog {
  id: string;
  child: string; // Child ID
  child_details?: {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    allergy_alerts?: string;
    special_needs?: string;
    parents: Array<{
      id: string;
      first_name: string;
      last_name: string;
      phone_number: string;
    }>;
  };
  classroom: string; // Classroom ID
  classroom_details?: {
    id: string;
    name: string;
  };
  check_in_time: string;
  check_out_time?: string;
  security_code: string;
  checked_in_by: string; // Member ID
  checked_in_by_details?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  checked_out_by?: string; // Member ID
  checked_out_by_details?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  status: 'Checked In' | 'Checked Out';
  created_at: string;
  updated_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          user_id: string;
          slug: string | null;
          event_type: string;
          title: string;
          template_id: string;
          status: "draft" | "published" | "archived";
          payload: Json;
          revision: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug?: string | null;
          event_type?: string;
          title: string;
          template_id?: string;
          status?: "draft" | "published" | "archived";
          payload: Json;
          revision?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitations"]["Insert"]>;
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          invitation_id: string;
          name: string;
          phone: string | null;
          attending: boolean;
          guest_count: number;
          memo: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          name: string;
          phone?: string | null;
          attending?: boolean;
          guest_count?: number;
          memo?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rsvps"]["Insert"]>;
        Relationships: [];
      };
      guestbook_entries: {
        Row: {
          id: string;
          invitation_id: string;
          nickname: string;
          message: string;
          is_approved: boolean;
          anonymous_id: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          nickname: string;
          message: string;
          is_approved?: boolean;
          anonymous_id?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guestbook_entries"]["Insert"]>;
        Relationships: [];
      };
      visits: {
        Row: {
          id: number;
          invitation_id: string;
          user_agent: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          invitation_id: string;
          user_agent?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["visits"]["Insert"]>;
        Relationships: [];
      };
      blocked_users: {
        Row: {
          id: string;
          invitation_id: string;
          ip_hash: string | null;
          anonymous_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          ip_hash?: string | null;
          anonymous_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_users"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_invitation: {
        Args: {
          p_id: string;
          p_payload: Json;
          p_expected_revision: number;
          p_status?: string;
        };
        Returns: Array<{
          success: boolean;
          error_code: string | null;
          current_revision: number;
          server_payload: Json | null;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

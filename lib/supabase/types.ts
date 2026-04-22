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
      invitations: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string;
          category: string;
          template_id: string;
          status: "draft" | "payment_pending" | "paid" | "published" | "refund_pending" | "refunded" | "payment_failed";
          payload: Json;
          repurchase_required: boolean;
          paid_payload_snapshot: Json | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          title: string;
          category: string;
          template_id: string;
          status?: "draft" | "payment_pending" | "paid" | "published" | "refund_pending" | "refunded" | "payment_failed";
          payload: Json;
          repurchase_required?: boolean;
          paid_payload_snapshot?: Json | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitations"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invitation_id: string;
          user_id: string;
          provider: "kakaopay" | "naverpay" | "credit_card" | "bank_transfer" | "apple_iap" | "google_play";
          status: "payment_pending" | "paid" | "refund_pending" | "refunded" | "payment_failed";
          amount: number;
          currency: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone: string;
          provider_tid: string | null;
          provider_order_id: string;
          ready_payload: Json | null;
          approved_at: string | null;
          cancelled_at: string | null;
          refund_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          user_id: string;
          provider?: "kakaopay" | "naverpay" | "credit_card" | "bank_transfer" | "apple_iap" | "google_play";
          status?: "payment_pending" | "paid" | "refund_pending" | "refunded" | "payment_failed";
          amount: number;
          currency?: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone: string;
          provider_tid?: string | null;
          provider_order_id: string;
          ready_payload?: Json | null;
          approved_at?: string | null;
          cancelled_at?: string | null;
          refund_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      payment_audit_logs: {
        Row: {
          id: string;
          payment_id: string;
          action: "ready" | "approve" | "cancel" | "fail";
          request_payload: Json | null;
          response_payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          action: "ready" | "approve" | "cancel" | "fail";
          request_payload?: Json | null;
          response_payload?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_audit_logs"]["Insert"]>;
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          invitation_id: string;
          guest_name: string;
          guest_phone: string | null;
          attending: boolean;
          guests: number;
          side: "groom" | "bride" | "shared";
          meal_preference: "yes" | "no" | "undecided";
          shuttle_needed: boolean;
          companion_names: string | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_name: string;
          guest_phone?: string | null;
          attending?: boolean;
          guests?: number;
          side?: "groom" | "bride" | "shared";
          meal_preference?: "yes" | "no" | "undecided";
          shuttle_needed?: boolean;
          companion_names?: string | null;
          memo?: string | null;
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
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          nickname: string;
          message: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guestbook_entries"]["Insert"]>;
        Relationships: [];
      };
      memory_photos: {
        Row: {
          id: string;
          invitation_id: string;
          nickname: string;
          message: string | null;
          storage_path: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          nickname: string;
          message?: string | null;
          storage_path: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memory_photos"]["Insert"]>;
        Relationships: [];
      };
      rate_limits: {
        Row: {
          bucket_key: string;
          count: number;
          reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          bucket_key: string;
          count: number;
          reset_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rate_limits"]["Insert"]>;
        Relationships: [];
      };
      view_logs: {
        Row: {
          id: number;
          invitation_id: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          invitation_id: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["view_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_rate_limit: {
        Args: {
          bucket_key: string;
          max_hits: number;
          window_seconds: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

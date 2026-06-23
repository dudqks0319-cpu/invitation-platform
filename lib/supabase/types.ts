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
      invitation_variants: {
        Row: {
          id: string;
          invitation_id: string;
          audience_key: string;
          audience_label: string;
          slug: string;
          payload_patch: Json;
          section_patch: Json;
          share_image_path: string | null;
          qr_image_path: string | null;
          is_default: boolean;
          status: "active" | "hidden" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          audience_key: string;
          audience_label: string;
          slug: string;
          payload_patch?: Json;
          section_patch?: Json;
          share_image_path?: string | null;
          qr_image_path?: string | null;
          is_default?: boolean;
          status?: "active" | "hidden" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitation_variants"]["Insert"]>;
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
          variant_id: string | null;
          guest_name: string;
          guest_phone: string | null;
          attending: boolean;
          guests: number;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          variant_id?: string | null;
          guest_name: string;
          guest_phone?: string | null;
          attending?: boolean;
          guests?: number;
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
          variant_id: string | null;
          nickname: string;
          message: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          variant_id?: string | null;
          nickname: string;
          message: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guestbook_entries"]["Insert"]>;
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
          variant_id: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          invitation_id: string;
          variant_id?: string | null;
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

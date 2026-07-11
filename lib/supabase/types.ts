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
          guest_owner_token_hash: string | null;
          guest_owner_created_at: string | null;
          guest_owner_last_verified_at: string | null;
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
          guest_owner_token_hash?: string | null;
          guest_owner_created_at?: string | null;
          guest_owner_last_verified_at?: string | null;
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
      user_entitlements: {
        Row: {
          id: string;
          user_id: string;
          platform: "ios" | "android";
          product_id: string;
          transaction_id: string;
          entitlement: string;
          quantity: number;
          consumed_quantity: number;
          raw_event: Json | null;
          purchased_at: string;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: "ios" | "android";
          product_id: string;
          transaction_id: string;
          entitlement: string;
          quantity?: number;
          consumed_quantity?: number;
          raw_event?: Json | null;
          purchased_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_entitlements"]["Insert"]>;
        Relationships: [];
      };
      publish_credits: {
        Row: {
          user_id: string;
          credits: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          credits?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["publish_credits"]["Insert"]>;
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
          visitor_key: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          invitation_id: string;
          visitor_key?: string | null;
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
      grant_publish_credit: {
        Args: {
          p_user_id: string;
          p_platform: "ios" | "android";
          p_product_id: string;
          p_transaction_id: string;
          p_entitlement: string;
          p_quantity: number;
          p_purchased_at: string;
          p_raw_event: Json;
        };
        Returns: boolean;
      };
      revoke_publish_credit: {
        Args: {
          p_transaction_id: string;
          p_revoked_at: string;
          p_raw_event: Json;
        };
        Returns: number;
      };
      publish_invitation_with_credit: {
        Args: {
          p_user_id: string;
          p_invitation_id: string;
          p_published_payload: Json;
          p_paid_payload_snapshot: Json;
        };
        Returns: {
          success: boolean;
          remaining_credits: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

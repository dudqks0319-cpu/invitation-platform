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
          status: "draft" | "payment_pending" | "paid" | "published" | "refund_pending" | "refunded" | "payment_failed" | "deletion_pending";
          payload: Json;
          repurchase_required: boolean;
          paid_payload_snapshot: Json | null;
          guest_publish_idempotency_key_hash: string | null;
          guest_publish_request_hash: string | null;
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
          status?: "draft" | "payment_pending" | "paid" | "published" | "refund_pending" | "refunded" | "payment_failed" | "deletion_pending";
          payload: Json;
          repurchase_required?: boolean;
          paid_payload_snapshot?: Json | null;
          guest_publish_idempotency_key_hash?: string | null;
          guest_publish_request_hash?: string | null;
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
          idempotency_key_hash: string | null;
          request_hash: string | null;
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
          idempotency_key_hash?: string | null;
          request_hash?: string | null;
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
          idempotency_key_hash: string | null;
          request_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          nickname: string;
          message: string;
          approved?: boolean;
          idempotency_key_hash?: string | null;
          request_hash?: string | null;
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
          identity_kind: "authenticated" | "anonymous_session" | "ip" | null;
          user_agent: string | null;
          idempotency_key_hash: string | null;
          request_hash: string | null;
          cost_units: number;
          identity_expires_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          invitation_id: string;
          visitor_key?: string | null;
          identity_kind?: "authenticated" | "anonymous_session" | "ip" | null;
          user_agent?: string | null;
          idempotency_key_hash?: string | null;
          request_hash?: string | null;
          cost_units?: number;
          identity_expires_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["view_logs"]["Insert"]>;
        Relationships: [];
      };
      account_deletion_requests: {
        Row: {
          id: string;
          user_id: string | null;
          subject_hash: string;
          idempotency_key_hash: string | null;
          reauth_ticket_hash: string | null;
          request_hash: string | null;
          export_disposition: "downloaded" | "skipped";
          status: "pending" | "processing" | "retry_wait" | "blocked" | "completed";
          stage: "storage" | "provider" | "auth" | "finalize" | "completed";
          attempt_count: number;
          lease_hash: string | null;
          lease_expires_at: string | null;
          next_retry_at: string;
          last_error_code: "storage_unavailable" | "provider_unavailable" | "auth_unavailable" | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          identity_expires_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          subject_hash: string;
          idempotency_key_hash?: string | null;
          reauth_ticket_hash?: string | null;
          request_hash?: string | null;
          export_disposition: "downloaded" | "skipped";
          status?: "pending" | "processing" | "retry_wait" | "blocked" | "completed";
          stage?: "storage" | "provider" | "auth" | "finalize" | "completed";
          attempt_count?: number;
          lease_hash?: string | null;
          lease_expires_at?: string | null;
          next_retry_at?: string;
          last_error_code?: "storage_unavailable" | "provider_unavailable" | "auth_unavailable" | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          identity_expires_at?: string;
          expires_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["account_deletion_requests"]["Insert"]>;
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
      record_invitation_view: {
        Args: {
          p_invitation_id: string;
          p_visitor_key: string;
          p_identity_kind: "authenticated" | "anonymous_session" | "ip";
          p_idempotency_key_hash: string;
          p_request_hash: string;
          p_issued_at: string;
        };
        Returns: { outcome: "inserted" | "replayed" | "collision" | "not_found" }[];
      };
      cleanup_view_logs: {
        Args: { batch_size?: number };
        Returns: { redacted_count: number; deleted_count: number }[];
      };
      account_is_active: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      is_account_deletion_pending: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      begin_account_deletion: {
        Args: {
          p_user_id: string;
          p_subject_hash: string;
          p_idempotency_key_hash: string;
          p_reauth_ticket_hash: string;
          p_request_hash: string;
          p_export_disposition: "downloaded" | "skipped";
          p_ticket_issued_at: string;
        };
        Returns: {
          request_id: string | null;
          outcome: "inserted" | "replayed" | "collision" | "in_progress" | "retention_required";
          status: string;
          stage: string | null;
        }[];
      };
      claim_account_deletion: {
        Args: { p_request_id: string; p_lease_hash: string };
        Returns: { claimed: boolean; stage: "storage" | "provider" | "auth" | "finalize"; attempt_count: number }[];
      };
      advance_account_deletion: {
        Args: { p_request_id: string; p_lease_hash: string; p_completed_stage: "storage" | "provider" | "auth" | "finalize" };
        Returns: { advanced: boolean }[];
      };
      fail_account_deletion: {
        Args: { p_request_id: string; p_lease_hash: string; p_error_code: "storage_unavailable" | "provider_unavailable" | "auth_unavailable" };
        Returns: { recorded: boolean; blocked: boolean }[];
      };
      cleanup_account_deletion_requests: {
        Args: { batch_size?: number };
        Returns: { redacted_count: number; deleted_count: number }[];
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

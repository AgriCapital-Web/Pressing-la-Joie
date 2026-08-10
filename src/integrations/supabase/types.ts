export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          assistant_response: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          language: string | null
          model: string | null
          retry_count: number
          session_id: string
          status: string
          tokens_total: number | null
          user_message: string
        }
        Insert: {
          assistant_response: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          language?: string | null
          model?: string | null
          retry_count?: number
          session_id: string
          status?: string
          tokens_total?: number | null
          user_message: string
        }
        Update: {
          assistant_response?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          language?: string | null
          model?: string | null
          retry_count?: number
          session_id?: string
          status?: string
          tokens_total?: number | null
          user_message?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auto_responses: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          priority: number
          response_ar: string | null
          response_de: string | null
          response_en: string | null
          response_es: string | null
          response_fr: string
          response_zh: string | null
          trigger_keyword: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          response_ar?: string | null
          response_de?: string | null
          response_en?: string | null
          response_es?: string | null
          response_fr: string
          response_zh?: string | null
          trigger_keyword: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          response_ar?: string | null
          response_de?: string | null
          response_en?: string | null
          response_es?: string | null
          response_fr?: string
          response_zh?: string | null
          trigger_keyword?: string
          updated_at?: string
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string | null
          destination: string | null
          error_message: string | null
          file_size: string | null
          format: string
          google_drive_file_id: string | null
          id: string
          status: string | null
          tables_included: Json | null
        }
        Insert: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string | null
          destination?: string | null
          error_message?: string | null
          file_size?: string | null
          format: string
          google_drive_file_id?: string | null
          id?: string
          status?: string | null
          tables_included?: Json | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string | null
          destination?: string | null
          error_message?: string | null
          file_size?: string | null
          format?: string
          google_drive_file_id?: string | null
          id?: string
          status?: string | null
          tables_included?: Json | null
        }
        Relationships: []
      }
      backup_settings: {
        Row: {
          auto_backup_enabled: boolean | null
          backup_destination: string | null
          backup_interval: string | null
          created_at: string | null
          google_drive_folder_id: string | null
          id: string
          last_backup_at: string | null
          next_backup_at: string | null
          updated_at: string | null
        }
        Insert: {
          auto_backup_enabled?: boolean | null
          backup_destination?: string | null
          backup_interval?: string | null
          created_at?: string | null
          google_drive_folder_id?: string | null
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_backup_enabled?: boolean | null
          backup_destination?: string | null
          backup_interval?: string | null
          created_at?: string | null
          google_drive_folder_id?: string | null
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      broken_image_logs: {
        Row: {
          first_seen_at: string
          hits: number
          id: string
          image_url: string
          last_seen_at: string
          page_url: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          first_seen_at?: string
          hits?: number
          id?: string
          image_url: string
          last_seen_at?: string
          page_url?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          first_seen_at?: string
          hits?: number
          id?: string
          image_url?: string
          last_seen_at?: string
          page_url?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      dataroom_access_logs: {
        Row: {
          action: string
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          progress_pct: number | null
          publication_id: string | null
          signatory_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          progress_pct?: number | null
          publication_id?: string | null
          signatory_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          progress_pct?: number | null
          publication_id?: string | null
          signatory_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_access_logs_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataroom_access_logs_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "dataroom_signatories"
            referencedColumns: ["id"]
          },
        ]
      }
      dataroom_comments: {
        Row: {
          admin_reply: string | null
          approved: boolean
          body: string
          created_at: string
          id: string
          publication_id: string
          signatory_id: string
        }
        Insert: {
          admin_reply?: string | null
          approved?: boolean
          body: string
          created_at?: string
          id?: string
          publication_id: string
          signatory_id: string
        }
        Update: {
          admin_reply?: string | null
          approved?: boolean
          body?: string
          created_at?: string
          id?: string
          publication_id?: string
          signatory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_comments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataroom_comments_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "dataroom_signatories"
            referencedColumns: ["id"]
          },
        ]
      }
      dataroom_download_links: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          expires_at: string
          id: string
          last_used_at: string | null
          max_uses: number
          publication_id: string
          revoked: boolean
          signatory_id: string | null
          token_hash: string
          updated_at: string
          used_count: number
          visibility_scope: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          expires_at: string
          id?: string
          last_used_at?: string | null
          max_uses?: number
          publication_id: string
          revoked?: boolean
          signatory_id?: string | null
          token_hash: string
          updated_at?: string
          used_count?: number
          visibility_scope?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          max_uses?: number
          publication_id?: string
          revoked?: boolean
          signatory_id?: string | null
          token_hash?: string
          updated_at?: string
          used_count?: number
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_download_links_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataroom_download_links_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "dataroom_signatories"
            referencedColumns: ["id"]
          },
        ]
      }
      dataroom_intents: {
        Row: {
          created_at: string
          id: string
          intent_type: string
          message: string
          publication_id: string | null
          signatory_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent_type: string
          message: string
          publication_id?: string | null
          signatory_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          intent_type?: string
          message?: string
          publication_id?: string | null
          signatory_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_intents_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataroom_intents_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "dataroom_signatories"
            referencedColumns: ["id"]
          },
        ]
      }
      dataroom_publications: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          current_version: number
          description: string | null
          downloads_count: number
          dynamic_fields: Json
          file_url: string | null
          id: string
          is_published: boolean
          platform_login: string | null
          platform_password: string | null
          platform_type: string | null
          platform_url: string | null
          preview_description: string | null
          preview_image_url: string | null
          preview_title: string | null
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          source_file_name: string | null
          source_file_size: number | null
          source_mime_type: string | null
          title: string
          type: string
          updated_at: string
          video_url: string | null
          views_count: number
          visibility: string
          watermark_enabled: boolean
          workflow_status: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          downloads_count?: number
          dynamic_fields?: Json
          file_url?: string | null
          id?: string
          is_published?: boolean
          platform_login?: string | null
          platform_password?: string | null
          platform_type?: string | null
          platform_url?: string | null
          preview_description?: string | null
          preview_image_url?: string | null
          preview_title?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          source_file_name?: string | null
          source_file_size?: number | null
          source_mime_type?: string | null
          title: string
          type: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
          visibility?: string
          watermark_enabled?: boolean
          workflow_status?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          downloads_count?: number
          dynamic_fields?: Json
          file_url?: string | null
          id?: string
          is_published?: boolean
          platform_login?: string | null
          platform_password?: string | null
          platform_type?: string | null
          platform_url?: string | null
          preview_description?: string | null
          preview_image_url?: string | null
          preview_title?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          source_file_name?: string | null
          source_file_size?: number | null
          source_mime_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
          visibility?: string
          watermark_enabled?: boolean
          workflow_status?: string
        }
        Relationships: []
      }
      dataroom_reactions: {
        Row: {
          created_at: string
          id: string
          publication_id: string
          rating: number | null
          reaction: string
          signatory_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          publication_id: string
          rating?: number | null
          reaction: string
          signatory_id: string
        }
        Update: {
          created_at?: string
          id?: string
          publication_id?: string
          rating?: number | null
          reaction?: string
          signatory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_reactions_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataroom_reactions_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "dataroom_signatories"
            referencedColumns: ["id"]
          },
        ]
      }
      dataroom_review_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          id: string
          publication_id: string
          status_at_comment: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          publication_id: string
          status_at_comment?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          publication_id?: string
          status_at_comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_review_comments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      dataroom_signatories: {
        Row: {
          access_code_hash: string
          access_level: string
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          id_document_url: string | null
          id_verified: boolean
          ip_address: string | null
          nda_pdf_url: string | null
          nda_signed_at: string
          newsletter_optin: boolean
          organization: string | null
          phone: string | null
          profession: string | null
          profile_type: string | null
          updated_at: string
          user_agent: string | null
          whatsapp: string | null
        }
        Insert: {
          access_code_hash: string
          access_level?: string
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          id_document_url?: string | null
          id_verified?: boolean
          ip_address?: string | null
          nda_pdf_url?: string | null
          nda_signed_at?: string
          newsletter_optin?: boolean
          organization?: string | null
          phone?: string | null
          profession?: string | null
          profile_type?: string | null
          updated_at?: string
          user_agent?: string | null
          whatsapp?: string | null
        }
        Update: {
          access_code_hash?: string
          access_level?: string
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          id_document_url?: string | null
          id_verified?: boolean
          ip_address?: string | null
          nda_pdf_url?: string | null
          nda_signed_at?: string
          newsletter_optin?: boolean
          organization?: string | null
          phone?: string | null
          profession?: string | null
          profile_type?: string | null
          updated_at?: string
          user_agent?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      dataroom_versions: {
        Row: {
          change_note: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          publication_id: string
          snapshot: Json
          source_file_name: string | null
          source_file_size: number | null
          source_mime_type: string | null
          title: string | null
          version_number: number
        }
        Insert: {
          change_note?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          publication_id: string
          snapshot?: Json
          source_file_name?: string | null
          source_file_size?: number | null
          source_mime_type?: string | null
          title?: string | null
          version_number: number
        }
        Update: {
          change_note?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          publication_id?: string
          snapshot?: Json
          source_file_name?: string | null
          source_file_size?: number | null
          source_mime_type?: string | null
          title?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataroom_versions_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "dataroom_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          body: string
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: []
      }
      email_recipients: {
        Row: {
          created_at: string
          email: string
          group_name: string | null
          id: string
          is_active: boolean
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          group_name?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          group_name?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
        }
        Relationships: []
      }
      email_signatures: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          data: Json
          form_id: string | null
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          data?: Json
          form_id?: string | null
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          data?: Json
          form_id?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "site_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          category: string | null
          content_ar: string | null
          content_de: string | null
          content_en: string | null
          content_es: string | null
          content_fr: string
          content_zh: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_de: string | null
          excerpt_en: string | null
          excerpt_es: string | null
          excerpt_fr: string | null
          excerpt_zh: string | null
          featured_image: string | null
          id: string
          images: Json | null
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          shares_count: number
          slug: string
          title_ar: string | null
          title_de: string | null
          title_en: string | null
          title_es: string | null
          title_fr: string
          title_zh: string | null
          updated_at: string
          videos: Json | null
          views_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr: string
          content_zh?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_de?: string | null
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_fr?: string | null
          excerpt_zh?: string | null
          featured_image?: string | null
          id?: string
          images?: Json | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          shares_count?: number
          slug: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr: string
          title_zh?: string | null
          updated_at?: string
          videos?: Json | null
          views_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string
          content_zh?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_de?: string | null
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_fr?: string | null
          excerpt_zh?: string | null
          featured_image?: string | null
          id?: string
          images?: Json | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          shares_count?: number
          slug?: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr?: string
          title_zh?: string | null
          updated_at?: string
          videos?: Json | null
          views_count?: number | null
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          audience_type: string | null
          created_at: string
          failed_recipients: Json | null
          html_content: string | null
          html_preview: string | null
          id: string
          sent_by: string | null
          subject: string
          total_failed: number
          total_recipients: number
          total_sent: number
        }
        Insert: {
          audience_type?: string | null
          created_at?: string
          failed_recipients?: Json | null
          html_content?: string | null
          html_preview?: string | null
          id?: string
          sent_by?: string | null
          subject: string
          total_failed?: number
          total_recipients?: number
          total_sent?: number
        }
        Update: {
          audience_type?: string | null
          created_at?: string
          failed_recipients?: Json | null
          html_content?: string | null
          html_preview?: string | null
          id?: string
          sent_by?: string | null
          subject?: string
          total_failed?: number
          total_recipients?: number
          total_sent?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          domain: string | null
          id: string
          latitude: number | null
          longitude: number | null
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      partnership_requests: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          company_logo_url: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          investment_amount: number | null
          land_area_hectares: number | null
          language: string | null
          last_name: string | null
          message: string | null
          notes: string | null
          partner_type: string
          phone: string | null
          photo_url: string | null
          preferred_offer: string | null
          request_type: string
          status: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          investment_amount?: number | null
          land_area_hectares?: number | null
          language?: string | null
          last_name?: string | null
          message?: string | null
          notes?: string | null
          partner_type: string
          phone?: string | null
          photo_url?: string | null
          preferred_offer?: string | null
          request_type: string
          status?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          investment_amount?: number | null
          land_area_hectares?: number | null
          language?: string | null
          last_name?: string | null
          message?: string | null
          notes?: string | null
          partner_type?: string
          phone?: string | null
          photo_url?: string | null
          preferred_offer?: string | null
          request_type?: string
          status?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          benefits: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          partner_count: number | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          partner_count?: number | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          partner_count?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_ar: string | null
          content_de: string | null
          content_en: string | null
          content_es: string | null
          content_fr: string | null
          content_zh: string | null
          created_at: string
          id: string
          is_active: boolean
          key: string
          type: string
          updated_at: string
        }
        Insert: {
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          type?: string
          updated_at?: string
        }
        Update: {
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_forms: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          is_active: boolean
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_media: {
        Row: {
          alt_text_en: string | null
          alt_text_fr: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: string
          url: string
        }
        Insert: {
          alt_text_en?: string | null
          alt_text_fr?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type?: string
          url: string
        }
        Update: {
          alt_text_en?: string | null
          alt_text_fr?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      site_menu: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label_ar: string | null
          label_de: string | null
          label_en: string | null
          label_es: string | null
          label_fr: string
          label_zh: string | null
          order_index: number
          parent_id: string | null
          target: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label_ar?: string | null
          label_de?: string | null
          label_en?: string | null
          label_es?: string | null
          label_fr: string
          label_zh?: string | null
          order_index?: number
          parent_id?: string | null
          target?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label_ar?: string | null
          label_de?: string | null
          label_en?: string | null
          label_es?: string | null
          label_fr?: string
          label_zh?: string | null
          order_index?: number
          parent_id?: string | null
          target?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_menu_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_menu"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          created_at: string
          description_ar: string | null
          description_de: string | null
          description_en: string | null
          description_es: string | null
          description_fr: string | null
          description_zh: string | null
          id: string
          is_active: boolean
          is_home: boolean
          meta_description_ar: string | null
          meta_description_de: string | null
          meta_description_en: string | null
          meta_description_es: string | null
          meta_description_fr: string | null
          meta_description_zh: string | null
          meta_title_ar: string | null
          meta_title_de: string | null
          meta_title_en: string | null
          meta_title_es: string | null
          meta_title_fr: string | null
          meta_title_zh: string | null
          order_index: number
          slug: string
          title_ar: string | null
          title_de: string | null
          title_en: string | null
          title_es: string | null
          title_fr: string
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_de?: string | null
          description_en?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_zh?: string | null
          id?: string
          is_active?: boolean
          is_home?: boolean
          meta_description_ar?: string | null
          meta_description_de?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_zh?: string | null
          meta_title_ar?: string | null
          meta_title_de?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_fr?: string | null
          meta_title_zh?: string | null
          order_index?: number
          slug: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr: string
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_de?: string | null
          description_en?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_zh?: string | null
          id?: string
          is_active?: boolean
          is_home?: boolean
          meta_description_ar?: string | null
          meta_description_de?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_zh?: string | null
          meta_title_ar?: string | null
          meta_title_de?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_fr?: string | null
          meta_title_zh?: string | null
          order_index?: number
          slug?: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr?: string
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          content_ar: string | null
          content_de: string | null
          content_en: string | null
          content_es: string | null
          content_fr: string | null
          content_zh: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          order_index: number
          page_id: string | null
          settings: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          page_id?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Update: {
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          page_id?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          type: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_agricapital_subscriber: boolean | null
          last_name: string
          photo_url: string | null
          status: string | null
          testimonial: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_agricapital_subscriber?: boolean | null
          last_name: string
          photo_url?: string | null
          status?: string | null
          testimonial: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_agricapital_subscriber?: boolean | null
          last_name?: string
          photo_url?: string | null
          status?: string | null
          testimonial?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_contacts: {
        Row: {
          collected_via: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          phone: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          collected_via?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          collected_via?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      partnerships_public: {
        Row: {
          benefits: string | null
          created_at: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          partner_count: number | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          partner_count?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          partner_count?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials_public: {
        Row: {
          approved: boolean | null
          created_at: string | null
          first_name: string | null
          id: string | null
          is_agricapital_subscriber: boolean | null
          last_name: string | null
          photo_url: string | null
          status: string | null
          testimonial: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_agricapital_subscriber?: boolean | null
          last_name?: string | null
          photo_url?: string | null
          status?: string | null
          testimonial?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_agricapital_subscriber?: boolean | null
          last_name?: string | null
          photo_url?: string | null
          status?: string | null
          testimonial?: string | null
        }
        Relationships: []
      }
      visitor_counters: {
        Row: {
          id: string | null
          total_visitors: number | null
          weekly_visitors: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_visitor_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_dataroom_download: {
        Args: { _publication_id: string }
        Returns: undefined
      }
      increment_dataroom_view: {
        Args: { _publication_id: string }
        Returns: undefined
      }
      increment_news_share: { Args: { p_news_id: string }; Returns: number }
      increment_news_view: { Args: { p_news_id: string }; Returns: number }
      report_broken_image: {
        Args: { _image_url: string; _page_url: string; _user_agent: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

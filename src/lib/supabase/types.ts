// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      files: {
        Row: {
          created_at: string | null
          id: string
          name: string
          optimized_size: number
          original_size: number
          status: string | null
          thumbnail: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          optimized_size: number
          original_size: number
          status?: string | null
          thumbnail?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          optimized_size?: number
          original_size?: number
          status?: string | null
          thumbnail?: string | null
          type?: string
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          created_at: string | null
          duration: number | null
          file_id: string | null
          id: string
          order: number
          playlist_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_id?: string | null
          id?: string
          order: number
          playlist_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_id?: string | null
          id?: string
          order?: number
          playlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'playlist_items_file_id_fkey'
            columns: ['file_id']
            isOneToOne: false
            referencedRelation: 'files'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'playlist_items_playlist_id_fkey'
            columns: ['playlist_id']
            isOneToOne: false
            referencedRelation: 'playlists'
            referencedColumns: ['id']
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          effect: string
          effect_duration: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          effect?: string
          effect_duration?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          effect?: string
          effect_duration?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      tvs: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          playlist_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id: string
          location: string
          name: string
          playlist_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          playlist_id?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: files
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   url: text (not null)
//   type: text (not null)
//   original_size: bigint (not null)
//   optimized_size: bigint (not null)
//   thumbnail: text (nullable)
//   status: text (nullable, default: 'ready'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   title: text (not null)
//   message: text (not null)
//   read: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: playlist_items
//   id: uuid (not null, default: gen_random_uuid())
//   playlist_id: uuid (nullable)
//   file_id: uuid (nullable)
//   order: integer (not null)
//   duration: integer (nullable, default: 10)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: playlists
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   effect: text (not null, default: 'fade-in'::text)
//   effect_duration: numeric (not null, default: 1.0)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   avatar_url: text (nullable)
// Table: tvs
//   id: text (not null)
//   name: text (not null)
//   location: text (not null)
//   status: text (not null, default: 'offline'::text)
//   playlist_id: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: files
//   PRIMARY KEY files_pkey: PRIMARY KEY (id)
// Table: notifications
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: playlist_items
//   FOREIGN KEY playlist_items_file_id_fkey: FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
//   PRIMARY KEY playlist_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY playlist_items_playlist_id_fkey: FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
// Table: playlists
//   PRIMARY KEY playlists_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: tvs
//   PRIMARY KEY tvs_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: files
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_select_files" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: notifications
//   Policy "Users can insert notifications" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Users can update their own notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (user_id IS NULL))
//     WITH CHECK: ((user_id = auth.uid()) OR (user_id IS NULL))
//   Policy "Users can view their own notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (user_id IS NULL))
// Table: playlist_items
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_select_playlist_items" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: playlists
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_select_playlists" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: profiles
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tvs
//   Policy "tvs_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tvs_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "tvs_select_policy" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "tvs_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email)
//     VALUES (NEW.id, NEW.email)
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//

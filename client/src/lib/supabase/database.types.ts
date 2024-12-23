export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_list: {
        Row: {
          alias: string
          date: string
          event: string
        }
        Insert: {
          alias: string
          date: string
          event: string
        }
        Update: {
          alias?: string
          date?: string
          event?: string
        }
        Relationships: []
      }
      event_match_data: {
        Row: {
          alliance: Database["public"]["Enums"]["alliance"]
          data: Json
          data_raw: Json
          event: string
          match: string
          name: string
          team: string
          timestamp: string
          uid: string | null
        }
        Insert: {
          alliance: Database["public"]["Enums"]["alliance"]
          data: Json
          data_raw: Json
          event: string
          match: string
          name: string
          team: string
          timestamp?: string
          uid?: string | null
        }
        Update: {
          alliance?: Database["public"]["Enums"]["alliance"]
          data?: Json
          data_raw?: Json
          event?: string
          match?: string
          name?: string
          team?: string
          timestamp?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_match_data_match_event_team_fkey"
            columns: ["match", "event", "team"]
            isOneToOne: false
            referencedRelation: "event_schedule"
            referencedColumns: ["match", "event", "team"]
          },
          {
            foreignKeyName: "event_match_data_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["uid"]
          },
        ]
      }
      event_picklist: {
        Row: {
          event: string
          picklist: Json
          timestamp: string
          title: string
          type: Database["public"]["Enums"]["pick_type"]
          uid: string
          uname: string
        }
        Insert: {
          event: string
          picklist?: Json
          timestamp?: string
          title: string
          type?: Database["public"]["Enums"]["pick_type"]
          uid?: string
          uname: string
        }
        Update: {
          event?: string
          picklist?: Json
          timestamp?: string
          title?: string
          type?: Database["public"]["Enums"]["pick_type"]
          uid?: string
          uname?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_list_event_fkey"
            columns: ["event"]
            isOneToOne: true
            referencedRelation: "event_list"
            referencedColumns: ["event"]
          },
          {
            foreignKeyName: "event_schedule_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["uid"]
          },
        ]
      }
      event_schedule: {
        Row: {
          alliance: Database["public"]["Enums"]["alliance"]
          event: string
          match: string
          name: string | null
          team: string
          uid: string | null
        }
        Insert: {
          alliance: Database["public"]["Enums"]["alliance"]
          event: string
          match: string
          name?: string | null
          team: string
          uid?: string | null
        }
        Update: {
          alliance?: Database["public"]["Enums"]["alliance"]
          event?: string
          match?: string
          name?: string | null
          team?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_schedule_event_fkey"
            columns: ["event", "team"]
            isOneToOne: false
            referencedRelation: "event_team_data"
            referencedColumns: ["event", "team"]
          },
          {
            foreignKeyName: "event_schedule_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["uid"]
          },
        ]
      }
      event_team_data: {
        Row: {
          assigned: string | null
          data: Json
          event: string
          name: string | null
          team: string
          timestamp: string
          uid: string | null
        }
        Insert: {
          assigned?: string | null
          data?: Json
          event: string
          name?: string | null
          team: string
          timestamp?: string
          uid?: string | null
        }
        Update: {
          assigned?: string | null
          data?: Json
          event?: string
          name?: string | null
          team?: string
          timestamp?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_team_data_event_fkey"
            columns: ["event"]
            isOneToOne: false
            referencedRelation: "event_list"
            referencedColumns: ["event"]
          },
          {
            foreignKeyName: "event_team_data_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["uid"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          expiry: string
          type: Database["public"]["Enums"]["invite_code"]
        }
        Insert: {
          code: string
          expiry: string
          type: Database["public"]["Enums"]["invite_code"]
        }
        Update: {
          code?: string
          expiry?: string
          type?: Database["public"]["Enums"]["invite_code"]
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          accuracy: number
          missed: number
          name: string
          role: Database["public"]["Enums"]["role"]
          scouted: number
          settings: Json
          uid: string
        }
        Insert: {
          accuracy?: number
          missed?: number
          name?: string
          role?: Database["public"]["Enums"]["role"]
          scouted?: number
          settings?: Json
          uid?: string
        }
        Update: {
          accuracy?: number
          missed?: number
          name?: string
          role?: Database["public"]["Enums"]["role"]
          scouted?: number
          settings?: Json
          uid?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["perm"]
          role: Database["public"]["Enums"]["role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["perm"]
          role: Database["public"]["Enums"]["role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["perm"]
          role?: Database["public"]["Enums"]["role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["perm"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
    }
    Enums: {
      alliance: "red" | "blue"
      invite_code: "promote.scouter" | "promote.admin"
      perm:
        | "data.view"
        | "data.write"
        | "schedule.view"
        | "schedule.write"
        | "event.write"
        | "profiles.view"
        | "profiles.write"
        | "picklist.write"
        | "picklist.view"
      pick_type: "public" | "default" | "private"
      role: "user" | "scouter" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

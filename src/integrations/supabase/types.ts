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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      compras: {
        Row: {
          articulo: string
          created_at: string
          dias_duracion: number
          email: string
          fecha_compra: string
          fecha_renovacion: string
          id: string
          nombre: string
          notas: string | null
          shopify_customer_id: string | null
          shopify_synced: boolean
          telefono: string
        }
        Insert: {
          articulo: string
          created_at?: string
          dias_duracion: number
          email: string
          fecha_compra: string
          fecha_renovacion: string
          id?: string
          nombre: string
          notas?: string | null
          shopify_customer_id?: string | null
          shopify_synced?: boolean
          telefono: string
        }
        Update: {
          articulo?: string
          created_at?: string
          dias_duracion?: number
          email?: string
          fecha_compra?: string
          fecha_renovacion?: string
          id?: string
          nombre?: string
          notas?: string | null
          shopify_customer_id?: string | null
          shopify_synced?: boolean
          telefono?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          nombre: string | null
          origen: string | null
          telefono: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nombre?: string | null
          origen?: string | null
          telefono?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nombre?: string | null
          origen?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      perros: {
        Row: {
          codigo_acceso: string
          created_at: string
          dueno_email: string | null
          dueno_nombre: string | null
          dueno_telefono: string | null
          foto_url: string | null
          id: string
          nombre: string
          notas: string | null
          raza: string | null
          updated_at: string
        }
        Insert: {
          codigo_acceso: string
          created_at?: string
          dueno_email?: string | null
          dueno_nombre?: string | null
          dueno_telefono?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          notas?: string | null
          raza?: string | null
          updated_at?: string
        }
        Update: {
          codigo_acceso?: string
          created_at?: string
          dueno_email?: string | null
          dueno_nombre?: string | null
          dueno_telefono?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          raza?: string | null
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
      visitas: {
        Row: {
          actividades: string | null
          comportamiento: string | null
          created_at: string
          fecha_entrada: string
          fecha_salida: string
          fotos_galeria: string[] | null
          id: string
          perro_id: string
          recomendaciones: string | null
          updated_at: string
        }
        Insert: {
          actividades?: string | null
          comportamiento?: string | null
          created_at?: string
          fecha_entrada: string
          fecha_salida: string
          fotos_galeria?: string[] | null
          id?: string
          perro_id: string
          recomendaciones?: string | null
          updated_at?: string
        }
        Update: {
          actividades?: string | null
          comportamiento?: string | null
          created_at?: string
          fecha_entrada?: string
          fecha_salida?: string
          fotos_galeria?: string[] | null
          id?: string
          perro_id?: string
          recomendaciones?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_perro_id_fkey"
            columns: ["perro_id"]
            isOneToOne: false
            referencedRelation: "perros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "colaborador"
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
      app_role: ["admin", "colaborador"],
    },
  },
} as const

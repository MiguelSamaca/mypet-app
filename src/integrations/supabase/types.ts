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
      categorias_boutique: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          proveedor_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          proveedor_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          proveedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_boutique_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_finanzas: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          naturaleza: Database["public"]["Enums"]["naturaleza_gasto"] | null
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          naturaleza?: Database["public"]["Enums"]["naturaleza_gasto"] | null
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          naturaleza?: Database["public"]["Enums"]["naturaleza_gasto"] | null
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Relationships: []
      }
      clientes_boutique: {
        Row: {
          activo: boolean
          ciudad: string | null
          created_at: string
          email: string | null
          fecha_creacion: string
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          ciudad?: string | null
          created_at?: string
          email?: string | null
          fecha_creacion?: string
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          ciudad?: string | null
          created_at?: string
          email?: string | null
          fecha_creacion?: string
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      marcas_boutique: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          proveedor_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          proveedor_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          proveedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marcas_boutique_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos: {
        Row: {
          cantidad: number
          categoria_id: string | null
          cliente: string | null
          cliente_boutique_id: string | null
          costo: number
          created_at: string
          detalle: string | null
          fecha: string
          fecha_salida: string | null
          id: string
          no_pro_serv: string | null
          no_venta: string | null
          notas: string | null
          pagado_por_miguel: boolean
          perro_id: string | null
          producto: string
          tarifa_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
          unidad_negocio: Database["public"]["Enums"]["unidad_negocio"]
          updated_at: string
          ventas: number
          visita_id: string | null
        }
        Insert: {
          cantidad?: number
          categoria_id?: string | null
          cliente?: string | null
          cliente_boutique_id?: string | null
          costo?: number
          created_at?: string
          detalle?: string | null
          fecha?: string
          fecha_salida?: string | null
          id?: string
          no_pro_serv?: string | null
          no_venta?: string | null
          notas?: string | null
          pagado_por_miguel?: boolean
          perro_id?: string | null
          producto: string
          tarifa_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
          unidad_negocio?: Database["public"]["Enums"]["unidad_negocio"]
          updated_at?: string
          ventas?: number
          visita_id?: string | null
        }
        Update: {
          cantidad?: number
          categoria_id?: string | null
          cliente?: string | null
          cliente_boutique_id?: string | null
          costo?: number
          created_at?: string
          detalle?: string | null
          fecha?: string
          fecha_salida?: string | null
          id?: string
          no_pro_serv?: string | null
          no_venta?: string | null
          notas?: string | null
          pagado_por_miguel?: boolean
          perro_id?: string | null
          producto?: string
          tarifa_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimiento"]
          unidad_negocio?: Database["public"]["Enums"]["unidad_negocio"]
          updated_at?: string
          ventas?: number
          visita_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_finanzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_perro_id_fkey"
            columns: ["perro_id"]
            isOneToOne: false
            referencedRelation: "perros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_tarifa_id_fkey"
            columns: ["tarifa_id"]
            isOneToOne: false
            referencedRelation: "tarifas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          costo_unitario: number
          created_at: string
          fecha: string
          id: string
          movimiento_id: string | null
          notas: string | null
          producto_id: string
          tipo: string
        }
        Insert: {
          cantidad: number
          costo_unitario?: number
          created_at?: string
          fecha?: string
          id?: string
          movimiento_id?: string | null
          notas?: string | null
          producto_id: string
          tipo: string
        }
        Update: {
          cantidad?: number
          costo_unitario?: number
          created_at?: string
          fecha?: string
          id?: string
          movimiento_id?: string | null
          notas?: string | null
          producto_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_boutique"
            referencedColumns: ["id"]
          },
        ]
      }
      perros: {
        Row: {
          codigo_acceso: string
          created_at: string
          descripcion_especial: string | null
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
          descripcion_especial?: string | null
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
          descripcion_especial?: string | null
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
      productos_boutique: {
        Row: {
          activo: boolean
          categoria_id: string | null
          color: string | null
          costo_unitario: number
          created_at: string
          id: string
          marca_id: string | null
          nombre: string
          notas: string | null
          precio_venta: number
          producto_padre_id: string | null
          proveedor_id: string
          stock: number
          talla: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria_id?: string | null
          color?: string | null
          costo_unitario?: number
          created_at?: string
          id?: string
          marca_id?: string | null
          nombre: string
          notas?: string | null
          precio_venta?: number
          producto_padre_id?: string | null
          proveedor_id: string
          stock?: number
          talla?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria_id?: string | null
          color?: string | null
          costo_unitario?: number
          created_at?: string
          id?: string
          marca_id?: string | null
          nombre?: string
          notas?: string | null
          precio_venta?: number
          producto_padre_id?: string | null
          proveedor_id?: string
          stock?: number
          talla?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_boutique_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_boutique"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_boutique_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas_boutique"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_boutique_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          activo: boolean
          contacto: string | null
          created_at: string
          email: string | null
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tarifas: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          orden: number
          precio_hotel: number
          precio_manada: number
          seccion: string
          unidad_negocio: Database["public"]["Enums"]["unidad_negocio"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          precio_hotel?: number
          precio_manada?: number
          seccion: string
          unidad_negocio?: Database["public"]["Enums"]["unidad_negocio"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          precio_hotel?: number
          precio_manada?: number
          seccion?: string
          unidad_negocio?: Database["public"]["Enums"]["unidad_negocio"]
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
          consenticion: number | null
          created_at: string
          descanso: number | null
          energia: number | null
          fecha_entrada: string
          fecha_salida: string
          fotos_galeria: string[] | null
          id: string
          interaccion_social: number | null
          notas_admin: string | null
          obediencia: number | null
          perro_id: string
          recomendaciones: string | null
          tarifa_pagada: number | null
          updated_at: string
        }
        Insert: {
          actividades?: string | null
          comportamiento?: string | null
          consenticion?: number | null
          created_at?: string
          descanso?: number | null
          energia?: number | null
          fecha_entrada: string
          fecha_salida: string
          fotos_galeria?: string[] | null
          id?: string
          interaccion_social?: number | null
          notas_admin?: string | null
          obediencia?: number | null
          perro_id: string
          recomendaciones?: string | null
          tarifa_pagada?: number | null
          updated_at?: string
        }
        Update: {
          actividades?: string | null
          comportamiento?: string | null
          consenticion?: number | null
          created_at?: string
          descanso?: number | null
          energia?: number | null
          fecha_entrada?: string
          fecha_salida?: string
          fotos_galeria?: string[] | null
          id?: string
          interaccion_social?: number | null
          notas_admin?: string | null
          obediencia?: number | null
          perro_id?: string
          recomendaciones?: string | null
          tarifa_pagada?: number | null
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
      get_perro_publico: {
        Args: { _codigo: string }
        Returns: {
          codigo_acceso: string
          descripcion_especial: string
          dueno_nombre: string
          foto_url: string
          id: string
          nombre: string
          notas: string
          raza: string
        }[]
      }
      get_visitas_publicas: {
        Args: { _codigo: string }
        Returns: {
          actividades: string
          comportamiento: string
          consenticion: number
          descanso: number
          energia: number
          fecha_entrada: string
          fecha_salida: string
          fotos_galeria: string[]
          id: string
          interaccion_social: number
          obediencia: number
          recomendaciones: string
        }[]
      }
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
      app_role: "admin" | "colaborador" | "superadmin"
      naturaleza_gasto: "fijo" | "variable"
      tipo_movimiento: "ingreso" | "gasto"
      unidad_negocio: "HOTEL" | "TIENDA" | "PASEOS" | "OTRO"
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
      app_role: ["admin", "colaborador", "superadmin"],
      naturaleza_gasto: ["fijo", "variable"],
      tipo_movimiento: ["ingreso", "gasto"],
      unidad_negocio: ["HOTEL", "TIENDA", "PASEOS", "OTRO"],
    },
  },
} as const

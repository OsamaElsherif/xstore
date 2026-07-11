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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      offers: {
        Row: {
          id: string
          name: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      offer_products: {
        Row: {
          id: string
          offer_id: string
          product_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          offer_id: string
          product_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          offer_id?: string
          product_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_products_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          id: string
          name: string
          event_key: string
          body_ar: string
          body_en: string
          variables: string[]
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          event_key: string
          body_ar: string
          body_en: string
          variables: string[]
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          event_key?: string
          body_ar?: string
          body_en?: string
          variables?: string[]
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          is_secret: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          is_secret?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          is_secret?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          image_url: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Insert: {
          id?: string
          image_url?: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Update: {
          id?: string
          image_url?: string | null
          name_ar?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          id: string
          request_number: string | null
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          device_type: string
          device_brand: string
          issue_description: string
          estimated_cost: number | null
          actual_cost: number | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          assigned_to: string | null
          admin_notes: string | null
          customer_notes: string | null
          submitted_at: string | null
          updated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          request_number?: string | null
          user_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          device_type: string
          device_brand: string
          issue_description: string
          estimated_cost?: number | null
          actual_cost?: number | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          assigned_to?: string | null
          admin_notes?: string | null
          customer_notes?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          request_number?: string | null
          user_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          device_type?: string
          device_brand?: string
          issue_description?: string
          estimated_cost?: number | null
          actual_cost?: number | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          assigned_to?: string | null
          admin_notes?: string | null
          customer_notes?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          snapshot_name: string
          snapshot_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          snapshot_name: string
          snapshot_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          snapshot_name?: string
          snapshot_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          city?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          city?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category_id: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_service: boolean | null
          name_ar: string
          name_en: string
          price: number
          rating: number | null
          reviews_count: number | null
          stock_quantity: number | null
          subcategory_id: string | null
          sub_subcategory_id: string | null
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_service?: boolean | null
          name_ar: string
          name_en: string
          price: number
          rating?: number | null
          reviews_count?: number | null
          stock_quantity?: number | null
          subcategory_id?: string | null
          sub_subcategory_id?: string | null
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_service?: boolean | null
          name_ar?: string
          name_en?: string
          price?: number
          rating?: number | null
          reviews_count?: number | null
          stock_quantity?: number | null
          subcategory_id?: string | null
          sub_subcategory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_subcategory_id_fkey"
            columns: ["sub_subcategory_id"]
            isOneToOne: false
            referencedRelation: "sub_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name_en: string
          name_ar: string
          slug: string
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          category_id: string
          name_en: string
          name_ar: string
          slug: string
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          name_en?: string
          name_ar?: string
          slug?: string
          image_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_subcategories: {
        Row: {
          id: string
          subcategory_id: string
          name_en: string
          name_ar: string
          slug: string
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          subcategory_id: string
          name_en: string
          name_ar: string
          slug: string
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          subcategory_id?: string
          name_en?: string
          name_ar?: string
          slug?: string
          image_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_subcategories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      maintenance_status: 'PENDING' | 'REVIEWED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'DONE' | 'CANCELLED'
      order_status: "NOT_DONE" | "UNDER_REPAIR" | "DONE"
      payment_status: "PAID" | "UNPAID"
      user_role: "ADMIN" | "CASHIER" | "ORDER_RECEIVER" | "CUSTOMER"
      discount_type: "PERCENTAGE" | "FIXED"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: ["NOT_DONE", "UNDER_REPAIR", "DONE"],
      payment_status: ["PAID", "UNPAID"],
      user_role: ["ADMIN", "CASHIER", "ORDER_RECEIVER", "CUSTOMER"],
    },
  },
} as const

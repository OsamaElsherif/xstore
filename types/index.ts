import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Subcategory = Tables<'subcategories'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Wishlist = Tables<'wishlists'>
export type MaintenanceRequest = Tables<'maintenance_requests'>
export type AppSetting = Tables<'app_settings'>
export type WhatsAppTemplate = Tables<'whatsapp_templates'>

// Typed settings map — used throughout the app
export type SettingsMap = {
  // Green API (replaces Meta WhatsApp Business API)
  greenapi_instance_id: string
  greenapi_api_token: string
  // WhatsApp notification toggles
  whatsapp_notify_orders: string          // 'true' | 'false'
  whatsapp_notify_maintenance: string
  whatsapp_notify_credentials: string
  whatsapp_notify_status_update: string
  // Meta
  meta_access_token: string
  meta_ad_account_id: string
  meta_pixel_id: string
  meta_page_id: string
  meta_app_id: string
  // Store
  store_name: string
  store_phone: string
  store_email: string
  store_address: string
}

// Event keys — match event_key column in whatsapp_templates table
export type EventKey =
  | 'order_placed'
  | 'maintenance_received'
  | 'maintenance_status_update'
  | 'account_created'

export type OrderStatus = Enums<'order_status'>    // 'NOT_DONE' | 'UNDER_REPAIR' | 'DONE'
export type PaymentStatus = Enums<'payment_status'> // 'PAID' | 'UNPAID'
export type UserRole = Enums<'user_role'>            // 'ADMIN' | 'CASHIER' | 'ORDER_RECEIVER' | 'CUSTOMER'
export type MaintenanceStatus = Enums<'maintenance_status'>

// Joined type for admin dashboard
export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: Product | null })[]
}

export type WishlistWithProduct = Wishlist & { products: Product }

// Category with nested subcategories
export type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[]
}

// Product with both category and subcategory
export type ProductWithRelations = Product & {
  categories: Category | null
  subcategories: Subcategory | null
}


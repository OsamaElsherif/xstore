import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Subcategory = Tables<'subcategories'>
export type SubSubcategory = Tables<'sub_subcategories'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Wishlist = Tables<'wishlists'>
export type MaintenanceRequest = Tables<'maintenance_requests'>
export type AppSetting = Tables<'app_settings'>
export type WhatsAppTemplate = Tables<'whatsapp_templates'>
export type Offer = Tables<'offers'>
export type OfferProduct = Tables<'offer_products'>
export type DiscountType = Enums<'discount_type'>

// Typed settings map — used throughout the app
export type SettingsMap = {
  // Wasender API credentials
  wasender_personal_access_token: string  // session management (connect/QR/disconnect)
  wasender_session_id: string             // the session to manage
  wasender_api_key: string                // sending messages + status + account info
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
  | 'whatsapp_optin'

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

// Subcategory with its sub-subcategories nested
export type SubcategoryWithChildren = Subcategory & {
  sub_subcategories: SubSubcategory[]
}

// Category with full nested tree (3 levels)
export type CategoryWithFullTree = Category & {
  subcategories: SubcategoryWithChildren[]
}

// Product with both category and subcategory
export type ProductWithRelations = Product & {
  categories: Category | null
  subcategories: Subcategory | null
  sub_subcategories: SubSubcategory | null
}

// ─── Offers & Discounts ────────────────────────────────────────────────────────

export type OfferWithProducts = Offer & {
  offer_products: (OfferProduct & { products: Product | null })[]
}

export type ProductWithOffer = Product & {
  active_offer: Offer | null
  discounted_price: number | null
}

/**
 * Pure helper — computes the effective price for a product given an active offer.
 * Returns the original price if no offer is provided or the offer is invalid.
 */
export function computeDiscountedPrice(originalPrice: number, offer: Offer | null | undefined): number {
  if (!offer) return originalPrice
  if (offer.discount_type === 'PERCENTAGE') {
    const discount = Math.min(100, Math.max(0, offer.discount_value))
    return Math.max(0, originalPrice * (1 - discount / 100))
  }
  // FIXED
  return Math.max(0, originalPrice - offer.discount_value)
}

// ─── Wasender Session Management ──────────────────────────────────────────────

export type WasenderSession = {
  id: number
  name: string
  phone_number: string
  status: string
  account_protection: boolean
  log_messages: boolean
  webhook_url: string | null
  webhook_enabled: boolean
  webhook_events: string[] | null
  api_key?: string          // only present in details response
  webhook_secret?: string   // only present in details response
  created_at: string
  updated_at: string
}

export type WasenderSessionStatus =
  | 'connected'
  | 'DISCONNECTED'
  | 'disconnected'
  | 'need_scan'
  | 'connecting'
  | 'logged_out'
  | 'unknown'

export type UpdateSessionPayload = {
  name?: string
  phone_number?: string
  account_protection?: boolean
  log_messages?: boolean
  webhook_url?: string
  webhook_enabled?: boolean
  webhook_events?: string[]
  read_incoming_messages?: boolean
  auto_reject_calls?: boolean
  always_online?: boolean
}

import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Wishlist = Tables<'wishlists'>
export type MaintenanceRequest = Tables<'maintenance_requests'>

export type OrderStatus = Enums<'order_status'>    // 'NOT_DONE' | 'UNDER_REPAIR' | 'DONE'
export type PaymentStatus = Enums<'payment_status'> // 'PAID' | 'UNPAID'
export type UserRole = Enums<'user_role'>            // 'ADMIN' | 'CASHIER' | 'ORDER_RECEIVER' | 'CUSTOMER'
export type MaintenanceStatus = Enums<'maintenance_status'>

// Joined type for admin dashboard
export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: Product | null })[]
}

export type WishlistWithProduct = Wishlist & { products: Product }

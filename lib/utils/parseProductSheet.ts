import * as XLSX from 'xlsx'
import { Category } from '@/types'
import { TablesInsert } from '@/types/database.types'

type ProductInsert = TablesInsert<'products'>

export type ParsedRow = {
  rowNumber: number
  data: Partial<ProductInsert>
  isValid: boolean
  errors: string[]
}

export async function parseProductSheet(
  file: File,
  categories: Category[]
): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON array of objects
        const rows = XLSX.utils.sheet_to_json(worksheet)
        
        const parsedRows: ParsedRow[] = rows.map((row: any, index) => {
          const rowNumber = index + 2 // XLSX starts from 1, header is row 1
          const errors: string[] = []
          
          const name_en = row.name_en?.toString().trim()
          const name_ar = row.name_ar?.toString().trim()
          const category_slug = row.category_slug?.toString().trim()
          const price = parseFloat(row.price)
          const stock_quantity = parseInt(row.stock_quantity)
          const is_service = ['true', '1', 'yes'].includes(row.is_service?.toString().toLowerCase())

          // Validations
          if (!name_en) errors.push('English name is required')
          if (!name_ar) errors.push('Arabic name is required')
          if (!category_slug) {
            errors.push('Category slug is required')
          } else {
            const category = categories.find(c => c.slug === category_slug)
            if (!category) {
              errors.push(`Category slug "${category_slug}" not found`)
            }
          }

          if (isNaN(price) || price <= 0) errors.push('Price must be greater than 0')
          if (!is_service && (isNaN(stock_quantity) || stock_quantity < 0)) {
            errors.push('Stock quantity must be 0 or greater')
          }

          const category = categories.find(c => c.slug === category_slug)

          return {
            rowNumber,
            isValid: errors.length === 0,
            errors,
            data: {
              name_en,
              name_ar,
              description_en: row.description_en?.toString().trim() || null,
              description_ar: row.description_ar?.toString().trim() || null,
              category_id: category?.id || '',
              price: price || 0,
              stock_quantity: is_service ? 0 : (stock_quantity || 0),
              badge: row.badge?.toString().trim() || null,
              is_service,
            } as ProductInsert
          }
        })

        resolve(parsedRows)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  })
}

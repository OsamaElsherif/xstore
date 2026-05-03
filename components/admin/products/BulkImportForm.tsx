'use client'

import { useState, useRef } from 'react'
import { Category, Product } from '@/types'
import { Download, Upload, AlertCircle, CheckCircle2, FileSpreadsheet, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { parseProductSheet, ParsedRow } from '@/lib/utils/parseProductSheet'
import { createProductsBulk } from '@/lib/actions/products'

interface BulkImportFormProps {
  categories: Category[]
  onImported: () => void
}

export default function BulkImportForm({ categories, onImported }: BulkImportFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const headers = [
      'name_en', 'name_ar', 'description_en', 'description_ar', 
      'category_slug', 'price', 'stock_quantity', 'badge', 'is_service'
    ]
    const example = [
      'iPhone 15 Pro', 'ايفون ١٥ برو', 'Latest Apple flagship', 'أحدث إصدار من ابل',
      'mobile-phones', '55000', '10', 'New', 'false'
    ]
    
    const ws = XLSX.utils.aoa_to_sheet([headers, example])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Products")
    XLSX.writeFile(wb, "jacob_store_products_template.xlsx")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsParsing(true)
    setImportResult(null)

    try {
      const rows = await parseProductSheet(selectedFile, categories)
      setParsedRows(rows)
    } catch (err) {
      alert('Error parsing file. Please ensure it is a valid .xlsx or .csv file.')
      setFile(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = async () => {
    const validProducts = parsedRows
      .filter(row => row.isValid)
      .map(row => row.data as any)

    if (validProducts.length === 0) return

    setIsImporting(true)
    try {
      const result = await createProductsBulk(validProducts)
      setImportResult(result)
      if (result.success > 0) {
        // Clear file and preview on partial success
        setFile(null)
        setParsedRows([])
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch (err) {
      alert('An error occurred during import.')
    } finally {
      setIsImporting(false)
    }
  }

  const validCount = parsedRows.filter(r => r.isValid).length
  const invalidCount = parsedRows.length - validCount

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Bulk Import Products</h2>
          <p className="text-gray-500 text-sm">Upload an Excel or CSV file to add multiple products at once.</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap"
        >
          <Download size={18} />
          Download Template
        </button>
      </div>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .csv"
            className="hidden"
          />
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
            <Upload size={32} />
          </div>
          <p className="text-gray-800 font-bold mb-1">Click to upload or drag and drop</p>
          <p className="text-gray-500 text-sm">Excel (.xlsx) or CSV (.csv) files only</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Status Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setParsedRows([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className={`p-4 rounded-xl border ${importResult.failed === 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'}`}>
              <div className="flex items-center gap-2 mb-2 font-bold">
                {importResult.failed === 0 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                Import Complete
              </div>
              <p className="text-sm">
                Successfully imported {importResult.success} products. {importResult.failed} products failed.
              </p>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 text-xs space-y-1 list-disc list-inside opacity-80">
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more errors</li>}
                </ul>
              )}
              {importResult.success > 0 && (
                <button 
                  onClick={onImported}
                  className="mt-4 px-4 py-2 bg-white border border-current rounded-lg text-sm font-bold hover:bg-opacity-10 transition-colors"
                >
                  Refresh Product List
                </button>
              )}
            </div>
          )}

          {/* Preview Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-sm font-bold text-gray-700">File Preview</p>
              <div className="flex gap-4">
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {validCount} valid rows
                </span>
                {invalidCount > 0 && (
                  <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {invalidCount} invalid rows
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-3 font-medium">Row</th>
                    <th className="p-3 font-medium">Name (EN)</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Stock</th>
                    <th className="p-3 font-medium">Valid?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isParsing ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                        Parsing file...
                      </td>
                    </tr>
                  ) : (
                    parsedRows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? '' : 'bg-red-50/50'}>
                        <td className="p-3 text-sm text-gray-500">{row.rowNumber}</td>
                        <td className="p-3">
                          <p className="text-sm font-medium text-gray-800">{row.data.name_en || <span className="text-red-400 italic">Missing</span>}</p>
                          <p className="text-xs text-gray-400 font-arabic" dir="rtl">{row.data.name_ar}</p>
                        </td>
                        <td className="p-3 text-sm font-medium">{row.data.price}</td>
                        <td className="p-3 text-sm text-gray-600">{row.data.stock_quantity}</td>
                        <td className="p-3">
                          {row.isValid ? (
                            <CheckCircle2 className="text-green-500" size={18} />
                          ) : (
                            <div className="group relative cursor-help">
                              <AlertCircle className="text-red-500" size={18} />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-xl z-50">
                                <ul className="list-disc list-inside">
                                  {row.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleImport}
              disabled={isImporting || validCount === 0}
              className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Importing {validCount} Products...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Import {validCount} Valid Rows
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

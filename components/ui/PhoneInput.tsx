'use client'
import { toLocalDigits } from '@/lib/utils/phone'
type PhoneInputProps = {
  value: string                     // stores only the digits after +20
  onChange: (value: string) => void // returns the raw local digits
  placeholder?: string
  required?: boolean
  className?: string
}
export function PhoneInput({
  value, onChange, placeholder = '1012345678', required, className
}: PhoneInputProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl
                    focus-within:border-indigo-400 overflow-hidden w-full">
      {/* Fixed +20 prefix — never editable */}
      <span className="px-3 py-2.5 bg-gray-50 border-e border-gray-200
                       text-sm font-medium text-gray-600 select-none
                       flex-shrink-0">
        +20
      </span>
      <input
        type="tel"
        value={value}
        onChange={e => {
          const digits = toLocalDigits(e.target.value)
          onChange(digits)
        }}
        placeholder={placeholder}
        required={required}
        className={`flex-1 px-3 py-2.5 text-sm outline-none bg-white ${className ?? ''}`}
      />
    </div>
  )
}
export default PhoneInput
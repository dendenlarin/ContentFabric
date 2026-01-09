"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select"

import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SimpleSelectProps {
  label?: string
  value: string
  onChange: (e: { target: { value: string } }) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Простой Select с API совместимым со старой версией
 * Обёртка над shadcn Select
 */
export function SimpleSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Выберите...",
  className,
  disabled,
}: SimpleSelectProps) {
  const handleValueChange = (newValue: string) => {
    onChange({ target: { value: newValue } })
  }

  // Фильтруем опции с пустым value (Radix UI не поддерживает пустые строки)
  const validOptions = options.filter((opt) => opt.value !== '')

  const selectedOption = validOptions.find((opt) => opt.value === value)

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select value={value || undefined} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedOption?.label || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {validOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

"use client"

import * as React from "react"
import { InputHTMLAttributes } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  error?: string
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  required,
  defaultValue,
  onChange,
  className,
  error,
  ...props
}: InputFieldProps) {
  return (
    <div className="grid gap-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Input
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange}
        aria-invalid={!!error}
        className={cn(
          "border border-gray-300 rounded-md px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 h-12 text-md",
          error && "border-red-500 focus:ring-red-500",
          className 
        )}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

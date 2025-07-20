"use client"

import { ToggleSwitch } from "flowbite-react"

interface ToggleProps {
  checked?: boolean
  label?: string
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export default function Toggle({
  checked = false,
  label,
  onChange = () => {},
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <ToggleSwitch
      checked={checked}
      label={label}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  )
}

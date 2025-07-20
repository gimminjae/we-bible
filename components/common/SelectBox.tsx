import { Label, Select } from "flowbite-react"

interface Props {
  options: { val: any; txt: string }[]
  label?: string
  id: string
  required?: boolean
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  value?: any
  haveDefault?: boolean
  sizing?: "sm" | "md" | "lg"
  disabled?: boolean
}

export default function SelectBox({
  options,
  label,
  id,
  required,
  onChange,
  value,
  haveDefault = true,
  sizing = "md",
  disabled,
}: Props) {
  return (
    <div className="max-w-md">
      <div className="block">
        <Label htmlFor={id}>{label}</Label>
      </div>
      <Select
        id={id}
        required={required}
        onChange={onChange}
        value={value}
        disabled={disabled}
        sizing={sizing}
      >
        {haveDefault && <option value="">선택</option>}
        {options?.map((option) => (
          <option key={option.val} value={option.val}>
            {option.txt}
          </option>
        ))}
      </Select>
    </div>
  )
}

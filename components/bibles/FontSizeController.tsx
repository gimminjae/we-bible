"use client"

import { useEffect, useState } from "react"
import { getBibleSearchInfo, setBibleSearchInfo } from "@/utils/local-db"

interface FontSizeControllerProps {
  initialFontSize?: number
}

function FontSizeController({ initialFontSize = 16 }: FontSizeControllerProps) {
  const [fontSize, setFontSize] = useState(initialFontSize)

  useEffect(() => {
    const saved = getBibleSearchInfo()
    setFontSize(saved.fontScale || initialFontSize)
  }, [initialFontSize])

  // CSS 변수를 통해 폰트 크기 변경
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
    document.documentElement.style.setProperty('--verse-size', `${fontSize + 5}px`)

    const saved = getBibleSearchInfo()
    setBibleSearchInfo({
      ...saved,
      fontScale: fontSize,
    })
  }, [fontSize])

  const handleFontSizeChange = (newSize: number) => {
    // 최소/최대 폰트 크기 제한
    const clampedSize = Math.max(12, Math.min(32, newSize))
    setFontSize(clampedSize)
  }

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => handleFontSizeChange(fontSize - 2)}
        className="btn btn-sm btn-outline"
        disabled={fontSize <= 12}
      >
        A-
      </button>
      <span className="min-w-[2rem] text-center text-sm text-base-content/70">
        {fontSize}
      </span>
      <button
        onClick={() => handleFontSizeChange(fontSize + 2)}
        className="btn btn-sm btn-outline"
        disabled={fontSize >= 32}
      >
        A+
      </button>
    </div>
  )
}

export default FontSizeController 
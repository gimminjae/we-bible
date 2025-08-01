"use client"

import { useEffect, useState } from "react"
import { Cookies } from "react-cookie"

interface FontSizeControllerProps {
  initialFontSize?: number
}

function FontSizeController({ initialFontSize = 16 }: FontSizeControllerProps) {
  const cookies = new Cookies()
  const [fontSize, setFontSize] = useState(Number(cookies.get('fontSize')) || initialFontSize)

  // CSS 변수를 통해 폰트 크기 변경
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`)
    document.documentElement.style.setProperty('--verse-size', `${fontSize + 5}px`)

    cookies.set('fontSize', fontSize.toString(), {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      path: '/'
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
        className="px-3 py-1 border rounded hover:bg-gray-100 text-sm font-medium"
        disabled={fontSize <= 12}
      >
        A-
      </button>
      <span className="text-sm text-gray-600 min-w-[2rem] text-center">
        {fontSize}
      </span>
      <button
        onClick={() => handleFontSizeChange(fontSize + 2)}
        className="px-3 py-1 border rounded hover:bg-gray-100 text-sm font-medium"
        disabled={fontSize >= 32}
      >
        A+
      </button>
    </div>
  )
}

export default FontSizeController 
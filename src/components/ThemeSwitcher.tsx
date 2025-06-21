'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-2">
      <FaSun className={`text-xl ${!isDark ? 'text-blue-500' : 'text-gray-400'}`} />
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="w-12 h-6 flex items-center rounded-full bg-gray-300 dark:bg-gray-700 p-1"
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
      <FaMoon className={`text-xl ${isDark ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
  )
} 
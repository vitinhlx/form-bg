'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) {
        setError(signInError.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">BÁO GIÁ</h1>
        <p className="text-center text-gray-600 mb-8">
          Đăng nhập để lưu báo giá trên cloud
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 h-12 text-base"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
        </Button>

        <div className="mt-6 pt-6 border-t">
          <p className="text-center text-sm text-gray-600">
            Bạn có thể sử dụng ứng dụng{' '}
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:underline"
            >
              mà không cần đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

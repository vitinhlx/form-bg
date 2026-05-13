'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'An authentication error occurred'

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h1 className="text-lg font-bold text-red-800 mb-2">Lỗi đăng nhập</h1>
          <p className="text-red-700">{error}</p>
        </div>

        <Button
          onClick={() => router.push('/auth/login')}
          className="w-full"
        >
          Thử lại
        </Button>

        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full mt-4"
        >
          Quay lại trang chủ
        </Button>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import QuotationForm from '@/quotation-form'
import { useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return <QuotationForm />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">BÁO GIÁ</h1>
        <p className="text-center text-gray-600 mb-8">
          Ứng dụng tạo và quản lý báo giá thương mại
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
          >
            Đăng nhập để lưu trên Cloud
          </Button>

          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="w-full h-12 text-base"
          >
            Sử dụng không cần đăng nhập
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p className="mb-4">
            Khi đăng nhập, báo giá của bạn sẽ tự động được lưu trên cloud và có thể truy cập từ bất kỳ đâu.
          </p>
          <p>
            Sử dụng không cần đăng nhập sẽ lưu trữ dữ liệu trên thiết bị của bạn.
          </p>
        </div>
      </div>
    </div>
  )
}

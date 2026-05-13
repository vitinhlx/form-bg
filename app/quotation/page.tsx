'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QuotationForm from '@/quotation-form'
import { Button } from '@/components/ui/button'

export default function QuotationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {user && (
        <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center print:hidden">
          <div className="text-sm text-gray-600">
            Đăng nhập dưới tên: <span className="font-semibold">{user.email}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            Đăng xuất
          </Button>
        </div>
      )}
      <QuotationForm user={user} />
    </div>
  )
}

import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface StarPaymentOptions {
  title: string
  description?: string
  payload: string
  amount: number
}

interface UseStarsReturn {
  payWithStars: (options: StarPaymentOptions) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useTelegramStars(): UseStarsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payWithStars = useCallback(async (options: StarPaymentOptions): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const tg = (window as any).Telegram?.WebApp

      if (!tg) {
        setError('Telegram WebApp was not found')
        return false
      }

      const res = await fetch(`${API_BASE}/api/stars/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: options.title,
          description: options.description || options.title,
          payload: options.payload,
          amount: options.amount,
        }),
      })

      const data = await res.json()

      if (!data.ok || !data.invoiceLink) {
        setError(data.error || 'Invoice could not be created')
        return false
      }

      return new Promise((resolve) => {
        tg.openInvoice(data.invoiceLink, (status: string) => {
          setIsLoading(false)
          if (status === 'paid') {
            resolve(true)
          } else {
            setError(status === 'cancelled' ? 'Payment was cancelled' : `Payment failed: ${status}`)
            resolve(false)
          }
        })
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { payWithStars, isLoading, error }
}

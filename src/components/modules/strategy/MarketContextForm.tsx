'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { updateMarketResearch } from '@/server/actions/brand-identity'
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function MarketContextForm({ initialData }: { initialData: BrandIdentity | null }) {
  const market = (initialData?.market_research || initialData?.market_context as any) || {}
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    market_size: market.market_size || '',
    trends: market.trends || [] as string[]
  })
  const [newTrend, setNewTrend] = useState('')

  useEffect(() => {
    if (initialData?.market_research || initialData?.market_context) {
      const market = (initialData.market_research || initialData.market_context) as any
      setFormData({
        market_size: market.market_size || '',
        trends: market.trends || []
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateMarketResearch({
        market_size: formData.market_size,
        trends: formData.trends
      })
      alert('Market Research salvato con successo!')
    } catch (error) {
      console.error('Error saving market research:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const addTrend = () => {
    if (newTrend.trim()) {
      setFormData({ ...formData, trends: [...formData.trends, newTrend.trim()] })
      setNewTrend('')
    }
  }

  const removeTrend = (index: number) => {
    setFormData({ ...formData, trends: formData.trends.filter((_trend: string, i: number) => i !== index) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Context</CardTitle>
        <CardDescription>
          Definisci dimensione del mercato e trend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="market_size">Dimensione Mercato</Label>
            <Textarea
              id="market_size"
              value={formData.market_size}
              onChange={(e) => setFormData({ ...formData, market_size: e.target.value })}
              placeholder="Descrivi la dimensione e il contesto del mercato..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Trend di Mercato</Label>
            <div className="flex gap-2">
              <Input
                value={newTrend}
                onChange={(e) => setNewTrend(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrend())}
                placeholder="Aggiungi un trend..."
              />
              <Button type="button" onClick={addTrend} variant="outline">Aggiungi</Button>
            </div>
            <ul className="space-y-2 mt-2">
              {formData.trends.map((trend: string, i: number) => (
                <li key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="flex-1">{trend}</span>
                  <button type="button" onClick={() => removeTrend(i)} className="text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Market Research'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


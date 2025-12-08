'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { updateMarketingAssets, updateBrandPerception } from '@/server/actions/brand-identity'
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function MarketingAssetsForm({ initialData }: { initialData: BrandIdentity | null }) {
  const assets = (initialData?.marketing_assets as any) || {}
  const perception = (initialData?.brand_perception as any) || {}
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    funnel: assets.funnel || '',
    channels: assets.channels || [] as string[],
    sentiment: perception.sentiment || ''
  })
  const [newChannel, setNewChannel] = useState('')

  useEffect(() => {
    if (initialData?.marketing_assets) {
      const assets = initialData.marketing_assets as any
      setFormData(prev => ({ ...prev, funnel: assets.funnel || '', channels: assets.channels || [] }))
    }
    if (initialData?.brand_perception) {
      const perception = initialData.brand_perception as any
      setFormData(prev => ({ ...prev, sentiment: perception.sentiment || '' }))
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await Promise.all([
        updateMarketingAssets({
          funnel: formData.funnel,
          channels: formData.channels
        }),
        updateBrandPerception({
          sentiment: formData.sentiment
        })
      ])
      alert('Marketing Assets salvati con successo!')
    } catch (error) {
      console.error('Error saving marketing assets:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const addChannel = () => {
    if (newChannel.trim()) {
      setFormData({ ...formData, channels: [...formData.channels, newChannel.trim()] })
      setNewChannel('')
    }
  }

  const removeChannel = (index: number) => {
    setFormData({ ...formData, channels: formData.channels.filter((_, i) => i !== index) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Assets</CardTitle>
        <CardDescription>
          Definisci funnel, canali e percezione del brand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sentiment">Percezione del Brand (Sentiment)</Label>
            <Textarea
              id="sentiment"
              value={formData.sentiment}
              onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
              placeholder="Descrivi la percezione del brand..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnel">Funnel Strategy</Label>
            <Textarea
              id="funnel"
              value={formData.funnel}
              onChange={(e) => setFormData({ ...formData, funnel: e.target.value })}
              placeholder="Descrivi la strategia del funnel..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Canali Attivi</Label>
            <div className="flex gap-2">
              <Input
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChannel())}
                placeholder="Aggiungi un canale..."
              />
              <Button type="button" onClick={addChannel} variant="outline">Aggiungi</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {formData.channels.map((channel, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded border">
                  <span className="flex-1 text-sm">{channel}</span>
                  <button
                    type="button"
                    onClick={() => removeChannel(i)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Marketing Assets'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


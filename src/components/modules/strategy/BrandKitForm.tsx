'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateBrandKit } from '@/server/actions/brand-identity'

interface BrandKitData {
  primary_color: string
  secondary_color: string
  logo_url: string
  typography: string
  brand_voice_description: string
}

export function BrandKitForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BrandKitData>({
    primary_color: '',
    secondary_color: '',
    logo_url: '',
    typography: '',
    brand_voice_description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('primary_color', formData.primary_color || '')
      formDataObj.append('secondary_color', formData.secondary_color || '')
      formDataObj.append('logo_url', formData.logo_url || '')
      formDataObj.append('typography', formData.typography || '')
      formDataObj.append('brand_voice_description', formData.brand_voice_description || '')

      await updateBrandKit(formDataObj)
      alert('Brand Kit salvato con successo!')
    } catch (error) {
      console.error('Error saving brand kit:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Kit</CardTitle>
        <CardDescription>
          Definisci l'identità visiva del tuo brand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Colori */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Colori</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Colore Primario</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color || '#000000'}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#FF5733"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Colore Secondario</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color || '#000000'}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    placeholder="#33C3F0"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>

            {/* Preview Palette */}
            {formData.primary_color && formData.secondary_color && (
              <div className="flex gap-2 p-4 border rounded-lg">
                <div 
                  className="w-16 h-16 rounded" 
                  style={{ backgroundColor: formData.primary_color }}
                />
                <div 
                  className="w-16 h-16 rounded" 
                  style={{ backgroundColor: formData.secondary_color }}
                />
              </div>
            )}
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo_url">URL Logo</Label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-muted-foreground">
              Carica il logo su Supabase Storage e incolla qui l'URL (funzionalità upload in arrivo)
            </p>
          </div>

          {/* Tipografia */}
          <div className="space-y-2">
            <Label htmlFor="typography">Tipografia</Label>
            <Input
              id="typography"
              value={formData.typography}
              onChange={(e) => setFormData({ ...formData, typography: e.target.value })}
              placeholder="Es. Inter, Roboto, Poppins..."
            />
            {formData.typography && (
              <p 
                className="text-sm mt-2"
                style={{ fontFamily: formData.typography }}
              >
                Preview: The quick brown fox jumps over the lazy dog
              </p>
            )}
          </div>

          {/* Descrizione Tono di Voce */}
          <div className="space-y-2">
            <Label htmlFor="brand_voice_description">Descrizione Tono di Voce</Label>
            <Textarea
              id="brand_voice_description"
              value={formData.brand_voice_description}
              onChange={(e) => setFormData({ ...formData, brand_voice_description: e.target.value })}
              placeholder="Descrivi il tono di voce del tuo brand..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Brand Kit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

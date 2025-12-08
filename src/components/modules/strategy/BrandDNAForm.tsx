'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { updateBrandDNA } from '@/server/actions/brand-identity'
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function BrandDNAForm({ initialData }: { initialData: BrandIdentity | null }) {
  const dna = (initialData?.brand_dna as any) || {}
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    purpose: dna.purpose || '',
    mission: dna.mission || '',
    values: dna.values || [] as string[],
    archetypes: dna.archetypes || [] as string[],
    tone_of_voice: dna.tone_of_voice || ''
  })
  const [newValue, setNewValue] = useState('')
  const [newArchetype, setNewArchetype] = useState('')

  useEffect(() => {
    if (initialData?.brand_dna) {
      const dna = initialData.brand_dna as any
      setFormData({
        purpose: dna.purpose || '',
        mission: dna.mission || '',
        values: dna.values || [],
        archetypes: dna.archetypes || [],
        tone_of_voice: dna.tone_of_voice || ''
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateBrandDNA({
        purpose: formData.purpose,
        mission: formData.mission,
        values: formData.values,
        archetypes: formData.archetypes,
        tone_of_voice: formData.tone_of_voice
      })
      alert('Brand DNA salvato con successo!')
    } catch (error) {
      console.error('Error saving brand DNA:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const addValue = () => {
    if (newValue.trim()) {
      setFormData({ ...formData, values: [...formData.values, newValue.trim()] })
      setNewValue('')
    }
  }

  const removeValue = (index: number) => {
    setFormData({ ...formData, values: formData.values.filter((_value: string, i: number) => i !== index) })
  }

  const addArchetype = () => {
    if (newArchetype.trim()) {
      setFormData({ ...formData, archetypes: [...formData.archetypes, newArchetype.trim()] })
      setNewArchetype('')
    }
  }

  const removeArchetype = (index: number) => {
    setFormData({ ...formData, archetypes: formData.archetypes.filter((_arch: string, i: number) => i !== index) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand DNA</CardTitle>
        <CardDescription>
          Definisci purpose, mission, valori e archetipi del tuo brand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Perché esiste il tuo brand?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              placeholder="Qual è la missione del tuo brand?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Valori</Label>
            <div className="flex gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                placeholder="Aggiungi un valore..."
              />
              <Button type="button" onClick={addValue} variant="outline">Aggiungi</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.values.map((val: string, i: number) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {val}
                  <button
                    type="button"
                    onClick={() => removeValue(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Archetipi</Label>
            <div className="flex gap-2">
              <Input
                value={newArchetype}
                onChange={(e) => setNewArchetype(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArchetype())}
                placeholder="Aggiungi un archetipo..."
              />
              <Button type="button" onClick={addArchetype} variant="outline">Aggiungi</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.archetypes.map((arch: string, i: number) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {arch}
                  <button
                    type="button"
                    onClick={() => removeArchetype(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone_of_voice">Tone of Voice</Label>
            <Textarea
              id="tone_of_voice"
              value={formData.tone_of_voice}
              onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
              placeholder="Descrivi il tono di voce del brand..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Brand DNA'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


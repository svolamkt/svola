'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { updateTargetAudience } from '@/server/actions/brand-identity'
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

interface Persona {
  name: string
  description: string
}

export function TargetAudienceForm({ initialData }: { initialData: BrandIdentity | null }) {
  const target = (initialData?.target_audience || initialData?.customer_persona as any) || {}
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    personas: (target.personas || []) as Persona[],
    pain_points: (target.pain_points || []) as string[],
    triggers: (target.triggers || []) as string[]
  })
  const [newPainPoint, setNewPainPoint] = useState('')
  const [newTrigger, setNewTrigger] = useState('')
  const [newPersona, setNewPersona] = useState({ name: '', description: '' })

  useEffect(() => {
    if (initialData?.target_audience || initialData?.customer_persona) {
      const target = (initialData.target_audience || initialData.customer_persona) as any
      const personas = target.personas || []
      // Convert string personas to objects if needed
      const personasArray = personas.map((p: any) => 
        typeof p === 'string' ? { name: p, description: '' } : p
      )
      setFormData({
        personas: personasArray,
        pain_points: target.pain_points || [],
        triggers: target.triggers || []
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateTargetAudience({
        personas: formData.personas,
        pain_points: formData.pain_points,
        triggers: formData.triggers
      })
      alert('Target Audience salvato con successo!')
    } catch (error) {
      console.error('Error saving target audience:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const addPersona = () => {
    if (newPersona.name.trim()) {
      setFormData({ ...formData, personas: [...formData.personas, newPersona] })
      setNewPersona({ name: '', description: '' })
    }
  }

  const removePersona = (index: number) => {
    setFormData({ ...formData, personas: formData.personas.filter((_persona: Persona, i: number) => i !== index) })
  }

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setFormData({ ...formData, pain_points: [...formData.pain_points, newPainPoint.trim()] })
      setNewPainPoint('')
    }
  }

  const removePainPoint = (index: number) => {
    setFormData({ ...formData, pain_points: formData.pain_points.filter((_point: string, i: number) => i !== index) })
  }

  const addTrigger = () => {
    if (newTrigger.trim()) {
      setFormData({ ...formData, triggers: [...formData.triggers, newTrigger.trim()] })
      setNewTrigger('')
    }
  }

  const removeTrigger = (index: number) => {
    setFormData({ ...formData, triggers: formData.triggers.filter((_trigger: string, i: number) => i !== index) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Audience</CardTitle>
        <CardDescription>
          Definisci buyer personas, pain points e triggers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Buyer Personas</Label>
            <div className="space-y-3">
              {formData.personas.map((persona: Persona, i: number) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{persona.name}</h4>
                    <button
                      type="button"
                      onClick={() => removePersona(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{persona.description}</p>
                </div>
              ))}
              <div className="space-y-2 p-3 border-2 border-dashed rounded-lg">
                <Input
                  placeholder="Nome persona..."
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                />
                <Textarea
                  placeholder="Descrizione persona..."
                  value={newPersona.description}
                  onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
                  rows={2}
                />
                <Button type="button" onClick={addPersona} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Aggiungi Persona
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pain Points</Label>
            <div className="flex gap-2">
              <Input
                value={newPainPoint}
                onChange={(e) => setNewPainPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
                placeholder="Aggiungi un pain point..."
              />
              <Button type="button" onClick={addPainPoint} variant="outline">Aggiungi</Button>
            </div>
            <ul className="space-y-2 mt-2">
              {formData.pain_points.map((point: string, i: number) => (
                <li key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="flex-1">{point}</span>
                  <button type="button" onClick={() => removePainPoint(i)} className="text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Triggers</Label>
            <div className="flex gap-2">
              <Input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                placeholder="Aggiungi un trigger..."
              />
              <Button type="button" onClick={addTrigger} variant="outline">Aggiungi</Button>
            </div>
            <ul className="space-y-2 mt-2">
              {formData.triggers.map((trigger: string, i: number) => (
                <li key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="flex-1">{trigger}</span>
                  <button type="button" onClick={() => removeTrigger(i)} className="text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Target Audience'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


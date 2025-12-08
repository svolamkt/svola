'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { updateCompetitors } from '@/server/actions/brand-identity'
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

interface Competitor {
  name: string
  strengths?: string
  weaknesses?: string
}

export function CompetitorsForm({ initialData }: { initialData: BrandIdentity | null }) {
  const competitors = (initialData?.competitors || initialData?.competitors_data as any) || {}
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    direct_competitors: (competitors.direct_competitors || competitors || []) as Competitor[],
    positioning_map: competitors.positioning_map || ''
  })
  const [newCompetitor, setNewCompetitor] = useState<Competitor>({ name: '', strengths: '', weaknesses: '' })

  useEffect(() => {
    if (initialData?.competitors || initialData?.competitors_data) {
      const competitors = (initialData.competitors || initialData.competitors_data) as any
      const directCompetitors = competitors.direct_competitors || competitors || []
      // Convert string competitors to objects if needed
      const competitorsArray = directCompetitors.map((c: any) => 
        typeof c === 'string' ? { name: c, strengths: '', weaknesses: '' } : c
      )
      setFormData({
        direct_competitors: competitorsArray,
        positioning_map: competitors.positioning_map || ''
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateCompetitors({
        direct_competitors: formData.direct_competitors,
        positioning_map: formData.positioning_map
      })
      alert('Competitors salvati con successo!')
    } catch (error) {
      console.error('Error saving competitors:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const addCompetitor = () => {
    if (newCompetitor.name.trim()) {
      setFormData({ ...formData, direct_competitors: [...formData.direct_competitors, newCompetitor] })
      setNewCompetitor({ name: '', strengths: '', weaknesses: '' })
    }
  }

  const removeCompetitor = (index: number) => {
    setFormData({ ...formData, direct_competitors: formData.direct_competitors.filter((_, i) => i !== index) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitors</CardTitle>
        <CardDescription>
          Analizza i competitor diretti e posizionamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Competitor Diretti</Label>
            <div className="space-y-3">
              {formData.direct_competitors.map((competitor, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{competitor.name}</h4>
                    <button
                      type="button"
                      onClick={() => removeCompetitor(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {competitor.strengths && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-green-600">Punti di forza: </span>
                      <span className="text-sm">{competitor.strengths}</span>
                    </div>
                  )}
                  {competitor.weaknesses && (
                    <div>
                      <span className="text-xs font-semibold text-red-600">Punti deboli: </span>
                      <span className="text-sm">{competitor.weaknesses}</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="space-y-2 p-3 border-2 border-dashed rounded-lg">
                <Input
                  placeholder="Nome competitor..."
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                />
                <Input
                  placeholder="Punti di forza..."
                  value={newCompetitor.strengths || ''}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, strengths: e.target.value })}
                />
                <Input
                  placeholder="Punti deboli..."
                  value={newCompetitor.weaknesses || ''}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, weaknesses: e.target.value })}
                />
                <Button type="button" onClick={addCompetitor} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Aggiungi Competitor
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="positioning_map">Mappa di Posizionamento</Label>
            <Textarea
              id="positioning_map"
              value={formData.positioning_map}
              onChange={(e) => setFormData({ ...formData, positioning_map: e.target.value })}
              placeholder="Descrivi il posizionamento rispetto ai competitor..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Competitors'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


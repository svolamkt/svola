'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { updateProductMatrix } from '@/server/actions/brand-identity'
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function ProductMatrixForm({ initialData }: { initialData: BrandIdentity | null }) {
  const matrix = (initialData?.product_matrix as any) || {}
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    value_proposition: matrix.value_proposition || '',
    usp: matrix.usp || '',
    benefits: matrix.benefits || [] as string[]
  })
  const [newBenefit, setNewBenefit] = useState('')

  useEffect(() => {
    if (initialData?.product_matrix) {
      const matrix = initialData.product_matrix as any
      setFormData({
        value_proposition: matrix.value_proposition || '',
        usp: matrix.usp || '',
        benefits: matrix.benefits || []
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProductMatrix({
        value_proposition: formData.value_proposition,
        usp: formData.usp,
        benefits: formData.benefits
      })
      alert('Product Matrix salvato con successo!')
    } catch (error) {
      console.error('Error saving product matrix:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] })
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Matrix</CardTitle>
        <CardDescription>
          Definisci value proposition, USP e benefici del prodotto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="value_proposition">Value Proposition</Label>
            <Textarea
              id="value_proposition"
              value={formData.value_proposition}
              onChange={(e) => setFormData({ ...formData, value_proposition: e.target.value })}
              placeholder="Qual è la proposta di valore principale?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usp">Unique Selling Proposition (USP)</Label>
            <Textarea
              id="usp"
              value={formData.usp}
              onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
              placeholder="Cosa rende unico il tuo prodotto?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Benefici Chiave</Label>
            <div className="flex gap-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                placeholder="Aggiungi un beneficio..."
              />
              <Button type="button" onClick={addBenefit} variant="outline">Aggiungi</Button>
            </div>
            <ul className="space-y-2 mt-2">
              {formData.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="flex-1">{benefit}</span>
                  <button
                    type="button"
                    onClick={() => removeBenefit(i)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Product Matrix'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


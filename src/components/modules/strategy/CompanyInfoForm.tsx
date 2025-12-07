'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateCompanyInfo } from '@/server/actions/brand-identity'

interface CompanyInfoData {
  company_name: string
  company_description: string
  website_url: string
  industry: string
  founded_year: number | null
}

export function CompanyInfoForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CompanyInfoData>({
    company_name: initialData?.company_name || '',
    company_description: initialData?.company_description || '',
    website_url: initialData?.website_url || '',
    industry: initialData?.industry || '',
    founded_year: initialData?.founded_year || null
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        company_description: initialData.company_description || '',
        website_url: initialData.website_url || '',
        industry: initialData.industry || '',
        founded_year: initialData.founded_year || null
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('company_name', formData.company_name)
      formDataObj.append('company_description', formData.company_description || '')
      formDataObj.append('website_url', formData.website_url || '')
      formDataObj.append('industry', formData.industry || '')
      if (formData.founded_year) {
        formDataObj.append('founded_year', formData.founded_year.toString())
      }

      await updateCompanyInfo(formDataObj)
      alert('Informazioni salvate con successo!')
    } catch (error) {
      console.error('Error saving company info:', error)
      alert('Errore nel salvataggio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni Azienda</CardTitle>
        <CardDescription>
          Configura le informazioni base della tua azienda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome Azienda *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
              placeholder="Es. Acme Inc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Descrizione Azienda</Label>
            <Textarea
              id="company_description"
              value={formData.company_description}
              onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
              placeholder="Descrivi brevemente la tua azienda..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Settore</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="Es. Tecnologia, Marketing, Consulenza..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded_year">Anno di Fondazione</Label>
            <Input
              id="founded_year"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.founded_year || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                founded_year: e.target.value ? parseInt(e.target.value) : null 
              })}
              placeholder="Es. 2020"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Informazioni'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


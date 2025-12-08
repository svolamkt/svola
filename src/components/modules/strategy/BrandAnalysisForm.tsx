'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { submitBrandAnalysis } from '@/server/actions/brand-analysis'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  website_url: string
  company_name: string
  company_description: string
  industry: string
  target_audience: string // B2B, B2C, Both
  competitors: string
  additional_info: string
}

export function BrandAnalysisForm() {
  const [formData, setFormData] = useState<FormData>({
    website_url: '',
    company_name: '',
    company_description: '',
    industry: '',
    target_audience: '',
    competitors: '',
    additional_info: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await submitBrandAnalysis(formData)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Reset form dopo successo
        setTimeout(() => {
          setFormData({
            website_url: '',
            company_name: '',
            company_description: '',
            industry: '',
            target_audience: '',
            competitors: '',
            additional_info: ''
          })
          setSuccess(false)
        }, 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="h-full border-primary/20 shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-md flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Nexus Analyst
        </CardTitle>
        <CardDescription>
          Compila il form per avviare l'analisi completa della tua Brand Identity. 
          Il nostro AI analizzerà il tuo sito web e genererà i 7 pilastri strategici.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Analisi avviata con successo! Il workflow n8n sta processando i dati. 
              Controlla le schede DNA, Prodotto, Target, Mercato, Competitor e Assets per vedere i risultati.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Website URL - Obbligatorio */}
          <div className="space-y-2">
            <Label htmlFor="website_url">
              Sito Web Azienda <span className="text-destructive">*</span>
            </Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              value={formData.website_url}
              onChange={(e) => handleChange('website_url', e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              L'AI analizzerà automaticamente il contenuto del tuo sito web
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome Azienda</Label>
            <Input
              id="company_name"
              placeholder="Es: Nexus AI"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Company Description */}
          <div className="space-y-2">
            <Label htmlFor="company_description">Descrizione Azienda</Label>
            <Textarea
              id="company_description"
              placeholder="Breve descrizione della tua azienda, prodotti/servizi offerti..."
              value={formData.company_description}
              onChange={(e) => handleChange('company_description', e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Settore</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleChange('industry', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il settore" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing-digitale">Marketing Digitale</SelectItem>
                <SelectItem value="e-commerce">E-commerce</SelectItem>
                <SelectItem value="saas">SaaS / Software</SelectItem>
                <SelectItem value="consulenza">Consulenza</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                <SelectItem value="fashion">Fashion / Retail</SelectItem>
                <SelectItem value="altro">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Principale</Label>
            <Select
              value={formData.target_audience}
              onValueChange={(value) => handleChange('target_audience', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b2b">B2B (Business to Business)</SelectItem>
                <SelectItem value="b2c">B2C (Business to Consumer)</SelectItem>
                <SelectItem value="both">Entrambi (B2B + B2C)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Competitors */}
          <div className="space-y-2">
            <Label htmlFor="competitors">Competitor Principali</Label>
            <Textarea
              id="competitors"
              placeholder="Elenca i tuoi principali competitor (uno per riga o separati da virgola)"
              value={formData.competitors}
              onChange={(e) => handleChange('competitors', e.target.value)}
              rows={2}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Opzionale: aiuta l'AI a fare un'analisi competitiva più precisa
            </p>
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additional_info">Informazioni Aggiuntive</Label>
            <Textarea
              id="additional_info"
              placeholder="Qualsiasi altra informazione rilevante sulla tua azienda, prodotti, servizi, valori, mission..."
              value={formData.additional_info}
              onChange={(e) => handleChange('additional_info', e.target.value)}
              rows={3}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Opzionale: più informazioni fornisci, più precisa sarà l'analisi
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.website_url}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisi in corso...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Avvia Analisi Completa
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            L'analisi può richiedere alcuni minuti. I risultati appariranno automaticamente nelle schede.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

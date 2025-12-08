'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { submitBrandAnalysis } from '@/server/actions/brand-analysis'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FormData {
  // Step 1: Identità Core
  company_name: string
  website_url: string // Optional
  company_description: string // Core Idea
  business_type: 'product' | 'service' | 'hybrid'
  growth_stage: 'idea' | 'launch' | 'scaling' | 'established'
  industry: string
  country: string
  
  // Step 2: Contesto & Consapevolezza
  awareness_level: 'low' | 'medium' | 'high'
  current_channels: string[]
  target_audience_idea: string // What they think
  
  // Step 3: Obiettivi & Competitor
  key_objectives: string
  competitors_known: string
  
  // Legacy mappings (for backward compatibility if needed internally)
  main_product: string
  target_audience: string
  competitors: string
  objectives: string[]
}

const STEPS = [
  { id: 1, title: 'Visione', description: 'Chi sei?' },
  { id: 2, title: 'Contesto', description: 'Dove sei?' },
  { id: 3, title: 'Obiettivi', description: 'Dove vai?' },
  { id: 4, title: 'Conferma', description: 'Avvia' }
]

const INDUSTRIES = [
  'Marketing Digitale', 'E-commerce', 'SaaS / Software', 'Consulenza', 
  'Fintech', 'Healthcare', 'Education', 'Real Estate', 
  'Food & Beverage', 'Fashion / Retail', 'Benessere / Sport', 'Altro'
]

const CHANNELS = [
  'Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'Offline / Fisico', 'Email Marketing', 'Nessuno'
]

interface AdaptiveBrandAnalysisFormProps {
  initialData?: any 
}

export function AdaptiveBrandAnalysisForm({ initialData }: AdaptiveBrandAnalysisFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    website_url: '',
    company_description: '',
    business_type: 'service',
    growth_stage: 'launch',
    industry: '',
    country: 'Italia',
    
    awareness_level: 'medium',
    current_channels: [],
    target_audience_idea: '',
    
    key_objectives: '',
    competitors_known: '',
    
    // Legacy defaults
    main_product: '',
    target_audience: '',
    competitors: '',
    objectives: []
  })

  // Pre-fill form if initialData is provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        company_name: initialData.company_name || prev.company_name,
        website_url: initialData.website_url || prev.website_url,
        industry: initialData.industry || prev.industry,
        awareness_level: (initialData.awareness_level as 'low'|'medium'|'high') || prev.awareness_level
      }))
    }
  }, [initialData])

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleChannel = (channel: string) => {
    setFormData(prev => {
      const current = prev.current_channels || []
      if (current.includes(channel)) {
        return { ...prev, current_channels: current.filter(c => c !== channel) }
      } else {
        return { ...prev, current_channels: [...current, channel] }
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await submitBrandAnalysis({
        company_name: formData.company_name,
        website_url: formData.website_url, // Now optional
        industry: formData.industry,
        country: formData.country,
        awareness_level: formData.awareness_level,
        
        // Structured strategic data
        company_description: formData.company_description,
        business_type: formData.business_type,
        growth_stage: formData.growth_stage,
        
        // Context
        target_audience_idea: formData.target_audience_idea,
        current_channels: formData.current_channels,
        
        // Goals
        key_objectives: formData.key_objectives,
        competitors_known: formData.competitors_known,
        
        // Backward compatibility payload construction for additional_info if needed
        additional_info: `
          Idea/Business: ${formData.company_description}
          Tipo: ${formData.business_type}
          Stadio: ${formData.growth_stage}
          Target Pensato: ${formData.target_audience_idea}
          Canali Attuali: ${formData.current_channels.join(', ')}
          Obiettivi: ${formData.key_objectives}
          Competitor Noti: ${formData.competitors_known}
        `
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="h-full border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full">
          <div className="rounded-full bg-green-100 p-6 mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Analisi Avviata!</h2>
          <p className="text-green-700 max-w-md mb-6">
            Il sistema sta analizzando il tuo brand. Riceverai un Brand Master File completo in pochi minuti.
          </p>
          <p className="text-sm text-green-600">
            Puoi chiudere questa finestra o navigare nelle altre tab mentre attendi.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-primary/20 shadow-lg flex flex-col">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-md flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Nexus Analyst
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            Step {step} di 4
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {STEPS.map(s => (
            <span key={s.id} className={step >= s.id ? "text-primary font-medium" : ""}>
              {s.title}
            </span>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-1 overflow-y-auto">
        {error && (
          <Alert className="mb-4 border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome Progetto/Azienda <span className="text-destructive">*</span></Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Es: Nexus AI"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Sito Web <span className="text-muted-foreground font-normal">(Opzionale)</span></Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_description">Descrivi la tua Idea o il tuo Business <span className="text-destructive">*</span></Label>
              <Textarea
                id="company_description"
                value={formData.company_description}
                onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                placeholder="Cosa fai? Qual è la tua visione? Qual è il problema che risolvi? (Sii dettagliato)"
                className="h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">Tipo di Business</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(val: 'product'|'service'|'hybrid') => setFormData({ ...formData, business_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Prodotto Fisico/Digitale</SelectItem>
                    <SelectItem value="service">Servizi / Consulenza</SelectItem>
                    <SelectItem value="hybrid">Ibrido (Prodotti + Servizi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth_stage">Stadio di Sviluppo</Label>
                <Select
                  value={formData.growth_stage}
                  onValueChange={(val: 'idea'|'launch'|'scaling'|'established') => setFormData({ ...formData, growth_stage: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Solo Idea (Pre-Revenue)</SelectItem>
                    <SelectItem value="launch">Lancio (Primi Clienti)</SelectItem>
                    <SelectItem value="scaling">Crescita (Scaling)</SelectItem>
                    <SelectItem value="established">Consolidato (Established)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Settore</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(val) => setFormData({ ...formData, industry: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Mercato Principale</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Italia, Milano, Globale..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="space-y-2">
              <Label htmlFor="target_audience_idea">Chi pensi sia il tuo Cliente Ideale?</Label>
              <Textarea
                id="target_audience_idea"
                value={formData.target_audience_idea}
                onChange={(e) => setFormData({ ...formData, target_audience_idea: e.target.value })}
                placeholder="Descrivi a chi vorresti vendere (età, interessi, problemi...)"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Canali Attuali (o dove vorresti essere)</Label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map(channel => (
                  <div 
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`
                      cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                      ${formData.current_channels.includes(channel) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background hover:bg-secondary border-muted-foreground/30'}
                    `}
                  >
                    {channel}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-6 mb-2">
              <h3 className="text-sm font-semibold mb-1">Livello di Certezza Strategica</h3>
              <p className="text-muted-foreground text-xs">
                Quanto sei sicuro che queste scelte siano quelle giuste?
              </p>
            </div>
            
            <RadioGroup 
              value={formData.awareness_level} 
              onValueChange={(val: 'low' | 'medium' | 'high') => setFormData({ ...formData, awareness_level: val })}
              className="grid gap-3"
            >
              <div>
                <RadioGroupItem value="low" id="low" className="peer sr-only" />
                <Label
                  htmlFor="low"
                  className="flex items-center gap-3 rounded-md border border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <span className="text-lg">🤔</span>
                  <div>
                    <div className="font-semibold text-sm">Bassa / Non so</div>
                    <div className="text-xs text-muted-foreground">L'AI deve costruire la strategia da zero.</div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                <Label
                  htmlFor="medium"
                  className="flex items-center gap-3 rounded-md border border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <span className="text-lg">💡</span>
                  <div>
                    <div className="font-semibold text-sm">Media / Ho delle idee</div>
                    <div className="text-xs text-muted-foreground">L'AI deve integrare e ottimizzare le mie idee.</div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="high" id="high" className="peer sr-only" />
                <Label
                  htmlFor="high"
                  className="flex items-center gap-3 rounded-md border border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <span className="text-lg">🚀</span>
                  <div>
                    <div className="font-semibold text-sm">Alta / Strategia definita</div>
                    <div className="text-xs text-muted-foreground">L'AI deve sfidare e validare la mia strategia.</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
             <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                <p className="text-sm text-blue-800 flex gap-2">
                  <span className="font-bold">Info:</span> 
                  Più dettagli fornisci qui, più accurata sarà l'analisi competitiva.
                </p>
             </div>

            <div className="space-y-2">
              <Label htmlFor="key_objectives">Obiettivo Principale (prossimi 6-12 mesi)</Label>
              <Textarea
                id="key_objectives"
                value={formData.key_objectives}
                onChange={(e) => setFormData({ ...formData, key_objectives: e.target.value })}
                placeholder="Es: Raggiungere 100k di fatturato, Lanciare il nuovo prodotto X, Trovare i primi 10 clienti..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors_known">Competitor che conosci (o a cui ti ispiri)</Label>
              <Textarea
                id="competitors_known"
                value={formData.competitors_known}
                onChange={(e) => setFormData({ ...formData, competitors_known: e.target.value })}
                placeholder="Es: Competitor A, Competitor B. Mi ispiro a Apple per il design..."
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center py-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold">Pronto per l'Analisi Critica</h3>
            
            <div className="text-left bg-muted/30 p-4 rounded-lg border text-sm space-y-3">
              <p className="font-medium text-foreground">Il Consulente AI farà questo:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                    <strong>Analisi Idea:</strong> Analizzerà la tua visione "{formData.company_description.substring(0, 30)}...".
                    {formData.website_url ? <span> (e verificherà il sito {formData.website_url})</span> : <span> (anche senza sito web)</span>}
                </li>
                <li><strong>Gap Analysis:</strong> Confronterà ciò che pensi del mercato con i dati reali.</li>
                <li><strong>Strategia Adattiva:</strong> Creerà un piano su misura per la fase <strong>{formData.growth_stage.toUpperCase()}</strong>.</li>
                <li><strong>Obiettivo:</strong> Ti aiuterà a raggiungere: "{formData.key_objectives.substring(0, 30)}..."</li>
              </ul>
            </div>

            <Alert className="border-blue-200 bg-blue-50 text-left">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Nota: L'AI agirà come un partner onesto. Se la tua idea ha punti deboli rispetto ai dati di mercato, te lo dirà chiaramente per farti risparmiare budget.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/10 p-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={step === 1 || loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
        </Button>
        
        {step < 4 ? (
          <Button 
            onClick={handleNext} 
            disabled={
              (step === 1 && (!formData.company_name || !formData.company_description))
            }
          >
            Avanti <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="w-32">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Avvia Analisi'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

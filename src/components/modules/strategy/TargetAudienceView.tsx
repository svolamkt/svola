'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase/types"
import { Users, Frown, Sparkles } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function TargetAudienceView({ data }: { data: BrandIdentity | null }) {
  // Legge da target_audience (campo DB) o customer_persona (campo AI)
  const target = (data?.target_audience || data?.customer_persona) as any

  if (!target) {
    return <div className="text-muted-foreground p-4">Nessun dato Target disponibile. Compila il form per avviare l'analisi.</div>
  }

  // Gestisce sia array di stringhe che array di oggetti {name, description}
  const personas = target.personas || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Buyer Personas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {personas.length > 0 ? personas.map((persona: any, i: number) => {
              // Se è un oggetto con name e description
              if (typeof persona === 'object' && persona.name) {
                return (
                  <div key={i} className="p-4 bg-muted/50 rounded-lg border-l-4 border-indigo-500">
                    <h4 className="font-semibold text-sm mb-1">{persona.name}</h4>
                    <p className="text-sm text-muted-foreground">{persona.description || '-'}</p>
                  </div>
                )
              }
              // Se è una stringa
              return (
                <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm border-l-4 border-indigo-500">
                  {persona}
                </div>
              )
            }) : <p className="text-muted-foreground">-</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Frown className="h-4 w-4 text-red-500" />
              Pain Points (Problemi)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {target.pain_points?.map((pain: string, i: number) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-red-500">•</span>
                  {pain}
                </li>
              )) || <li className="text-muted-foreground">-</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Triggers (Motivazioni)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {target.triggers?.map((trigger: string, i: number) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-yellow-500">•</span>
                  {trigger}
                </li>
              )) || <li className="text-muted-foreground">-</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


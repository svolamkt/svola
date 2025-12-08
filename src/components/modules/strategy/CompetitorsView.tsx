'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase/types"
import { Swords, Map } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function CompetitorsView({ data }: { data: BrandIdentity | null }) {
  // Legge da competitors (campo DB) o competitors_data (campo AI)
  const competitors = (data?.competitors || data?.competitors_data) as any

  if (!competitors) {
    return <div className="text-muted-foreground p-4">Nessun dato Competitor disponibile. Compila il form per avviare l'analisi.</div>
  }

  // Gestisce sia array di stringhe che array di oggetti {name, strengths, weaknesses}
  const directCompetitors = competitors.direct_competitors || competitors || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-red-600" />
            Competitor Diretti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(directCompetitors) && directCompetitors.length > 0 ? (
            <div className="space-y-3">
              {directCompetitors.map((comp: any, i: number) => {
                // Se è un oggetto con name, strengths, weaknesses
                if (typeof comp === 'object' && comp.name) {
                  return (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-semibold text-sm mb-2">{comp.name}</h4>
                      {comp.strengths && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-green-600">Punti di forza: </span>
                          <span className="text-xs">{comp.strengths}</span>
                        </div>
                      )}
                      {comp.weaknesses && (
                        <div>
                          <span className="text-xs font-semibold text-red-600">Punti deboli: </span>
                          <span className="text-xs">{comp.weaknesses}</span>
                        </div>
                      )}
                    </div>
                  )
                }
                // Se è una stringa
                return (
                  <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                    {comp}
                  </Badge>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">-</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-purple-600" />
            Mappa di Posizionamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed p-4 bg-muted/30 rounded-lg border border-dashed">
            {competitors.positioning_map || 'Nessuna analisi di posizionamento disponibile.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase/types"
import { Swords, Map } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function CompetitorsView({ data }: { data: BrandIdentity | null }) {
  const competitors = data?.competitors_data as any

  if (!competitors) {
    return <div className="text-muted-foreground p-4">Nessun dato Competitor disponibile.</div>
  }

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
          <div className="flex flex-wrap gap-2">
            {competitors.direct_competitors?.map((comp: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                {comp}
              </Badge>
            )) || <p className="text-muted-foreground">-</p>}
          </div>
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


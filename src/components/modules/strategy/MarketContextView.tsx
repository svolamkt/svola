'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/lib/supabase/types"
import { TrendingUp, BarChart3, Globe } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function MarketContextView({ data }: { data: BrandIdentity | null }) {
  const market = data?.market_context as any

  if (!market) {
    return <div className="text-muted-foreground p-4">Nessun dato Mercato disponibile.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-500" />
            Dimensione Mercato & Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {market.market_size || 'Nessuna informazione sulla dimensione del mercato.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Key Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {market.trends?.map((trend: string, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-sm">{trend}</span>
              </div>
            )) || <p className="text-muted-foreground">-</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


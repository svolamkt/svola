'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/lib/supabase/types"
import { Megaphone, MessageSquare, ThumbsUp } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function MarketingAssetsView({ data }: { data: BrandIdentity | null }) {
  const assets = data?.marketing_assets as any
  const perception = data?.brand_perception as any

  if (!assets && !perception) {
    return <div className="text-muted-foreground p-4">Nessun dato Marketing disponibile.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-pink-500" />
            Percezione del Brand (Sentiment)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg text-pink-900 dark:text-pink-100">
            "{perception?.sentiment || '-'}"
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-orange-500" />
            Marketing Funnel & Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Funnel Strategy</h4>
            <div className="p-3 bg-muted/50 rounded-lg text-sm border-l-4 border-orange-500">
              {assets?.funnel || '-'}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Canali Attivi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {assets?.channels?.map((channel: string, i: number) => (
                <div key={i} className="px-3 py-2 bg-background border rounded text-sm shadow-sm">
                  {channel}
                </div>
              )) || <p className="text-muted-foreground">-</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


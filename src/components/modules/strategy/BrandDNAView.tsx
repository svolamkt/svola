'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase/types"
import { Brain, Heart, Lightbulb, Mic } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function BrandDNAView({ data }: { data: BrandIdentity | null }) {
  const dna = data?.brand_dna as any

  if (!dna) {
    return <div className="text-muted-foreground p-4">Nessun dato DNA disponibile. Compila il form per avviare l'analisi.</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Purpose & Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Purpose</h4>
              <p className="text-sm">{dna.purpose || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Mission</h4>
              <p className="text-sm">{dna.mission || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Archetipi & Valori
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Archetipi</h4>
              <div className="flex flex-wrap gap-2">
                {dna.archetypes?.map((arch: string, i: number) => (
                  <Badge key={i} variant="secondary">{arch}</Badge>
                )) || '-'}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Valori</h4>
              <div className="flex flex-wrap gap-2">
                {dna.values?.map((val: string, i: number) => (
                  <Badge key={i} variant="outline">{val}</Badge>
                )) || '-'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-500" />
            Tone of Voice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic">"{dna.tone_of_voice || '-'}"</p>
        </CardContent>
      </Card>
    </div>
  )
}


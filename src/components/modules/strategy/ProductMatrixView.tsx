'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/lib/supabase/types"
import { CheckCircle2, Star, Zap } from "lucide-react"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

export function ProductMatrixView({ data }: { data: BrandIdentity | null }) {
  const matrix = data?.product_matrix as any

  if (!matrix) {
    return <div className="text-muted-foreground p-4">Nessun dato Prodotto disponibile. Compila il form per avviare l'analisi.</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Value Proposition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
            {matrix.value_proposition || '-'}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Unique Selling Proposition (USP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{matrix.usp || '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Key Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {matrix.benefits?.map((benefit: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-1">•</span>
                  {benefit}
                </li>
              )) || <li className="text-muted-foreground">-</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


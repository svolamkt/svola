'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, FileText, Activity } from "lucide-react"
import { ConfidenceNotes } from './ConfidenceNotes'
import { NextStepsPanel } from './NextStepsPanel'
import { createClient } from '@/lib/supabase/client'

interface AnalysisResultsViewProps {
  organizationId: string
}

export function AnalysisResultsView({ organizationId }: AnalysisResultsViewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) return
      
      const supabase = createClient()
      const { data: brandIdentity, error } = await supabase
        .from('brand_identity')
        .select('executive_summary, confidence_notes, warnings, next_steps, awareness_level, maturity_score')
        .eq('organization_id', organizationId)
        .single()
      
      if (!error && brandIdentity) {
        setData(brandIdentity)
      }
      setLoading(false)
    }

    fetchData()
    
    // Subscribe to realtime changes
    const supabase = createClient()
    const channel = supabase
      .channel('brand_identity_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'brand_identity', filter: `organization_id=eq.${organizationId}` },
        (payload) => {
          setData(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Caricamento risultati...</div>
  }

  if (!data || (!data.executive_summary && !data.next_steps)) {
    return (
      <div className="text-center py-12 px-4 border rounded-lg bg-muted/10 border-dashed">
        <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nessuna analisi disponibile</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Completa il form "Azienda" per generare la tua prima analisi strategica.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Warnings Section */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="space-y-3">
          {data.warnings.map((warning: any, idx: number) => (
            <Alert key={idx} variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 font-medium">Attenzione: {warning.type}</AlertTitle>
              <AlertDescription className="text-red-700 mt-1">
                {warning.message}
                {warning.recommendation && (
                  <div className="mt-2 text-sm font-semibold">
                    Consiglio: {warning.recommendation}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Executive Summary */}
      {data.executive_summary && (
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line">
              {data.executive_summary}
            </p>
            {data.maturity_score !== null && (
               <div className="mt-6 flex items-center gap-4 p-4 bg-slate-100 rounded-lg w-fit">
                 <div className="text-sm font-medium text-slate-500">Brand Maturity Score</div>
                 <div className="text-2xl font-bold text-primary">{data.maturity_score}/100</div>
               </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Steps */}
        <div className="space-y-6">
          <NextStepsPanel steps={data.next_steps} />
        </div>

        {/* Confidence Notes */}
        <div className="space-y-6">
          <ConfidenceNotes notes={data.confidence_notes} />
        </div>
      </div>
    </div>
  )
}


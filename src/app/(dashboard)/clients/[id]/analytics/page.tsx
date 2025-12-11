'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExecutionLog {
  id: string
  execution_id: string
  status: 'success' | 'error' | 'running'
  started_at: string
  execution_time_ms: number | null
  metadata: any
  error_message: string | null
}

export default function ClientAnalyticsPage() {
  const params = useParams()
  const clientId = params.id as string
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [kpis, setKpis] = useState({
    totalExecutions: 0,
    errorRate: 0,
    avgDuration: 0,
  })

  useEffect(() => {
    if (clientId) {
      loadAnalytics()
      setupRealtime()
    }
  }, [clientId])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Carica log (ultimi 30 giorni)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: logsData, error: logsError } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('client_id', clientId)
        .gte('started_at', thirtyDaysAgo.toISOString())
        .order('started_at', { ascending: false })
        .limit(50)

      if (logsError) throw logsError
      setLogs(logsData || [])

      // Calcola KPI
      const total = logsData?.length || 0
      const errors = logsData?.filter(l => l.status === 'error').length || 0
      const errorRate = total > 0 ? (errors / total) * 100 : 0
      const durations = logsData?.filter(l => l.execution_time_ms).map(l => l.execution_time_ms!) || []
      const avgDuration = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0

      setKpis({
        totalExecutions: total,
        errorRate,
        avgDuration: Math.round(avgDuration),
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('execution_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'execution_logs',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          // Aggiungi nuovo log in cima
          setLogs(prev => [payload.new as ExecutionLog, ...prev].slice(0, 50))
          // Ricalcola KPI
          loadAnalytics()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Cliente</h1>
        <p className="text-muted-foreground">
          Monitora le esecuzioni workflow in tempo reale
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Totale Esecuzioni</CardTitle>
            <CardDescription>Ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.totalExecutions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasso di Errore</CardTitle>
            <CardDescription>Percentuale errori</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.errorRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo Medio</CardTitle>
            <CardDescription>Durata media esecuzione</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.avgDuration}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ultime Esecuzioni</CardTitle>
          <CardDescription>
            Feed in tempo reale delle esecuzioni workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessun log disponibile. I log appariranno qui quando i workflow verranno eseguiti.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg ${
                    log.status === 'error' ? 'border-red-500 bg-red-50' : 
                    log.status === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Execution: {log.execution_id.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.started_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        log.status === 'error' ? 'text-red-600' : 
                        log.status === 'success' ? 'text-green-600' : 
                        'text-gray-600'
                      }`}>
                        {log.status.toUpperCase()}
                      </p>
                      {log.execution_time_ms && (
                        <p className="text-sm text-muted-foreground">
                          {log.execution_time_ms}ms
                        </p>
                      )}
                    </div>
                  </div>
                  {log.error_message && (
                    <p className="text-sm text-red-600 mt-2">
                      Errore: {log.error_message}
                    </p>
                  )}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer text-muted-foreground">
                        Metadata
                      </summary>
                      <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { syncWorkflows, getUnassignedWorkflows, assignWorkflowToClient } from '@/server/actions/workflows'
import { getClients } from '@/server/actions/clients'
import { Loader2, RefreshCw, ArrowRight } from 'lucide-react'

interface Workflow {
  id: string
  name: string
  is_active: boolean
  client_id: string | null
}

interface Client {
  id: string
  name: string
  status: string
}

export default function WorkflowsPage() {
  const [unassignedWorkflows, setUnassignedWorkflows] = useState<Workflow[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [workflows, clientsData] = await Promise.all([
        getUnassignedWorkflows(),
        getClients(),
      ])
      setUnassignedWorkflows(workflows)
      setClients(clientsData)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Errore nel caricamento dati')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const result = await syncWorkflows()
      alert(`Sincronizzati ${result.synced} workflow (${result.created} nuovi, ${result.updated} aggiornati)`)
      await loadData()
    } catch (error) {
      console.error('Sync error:', error)
      alert(`Errore sincronizzazione: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleAssign = async (workflowId: string, clientId: string) => {
    try {
      setAssigning(workflowId)
      await assignWorkflowToClient(workflowId, clientId)
      await loadData()
    } catch (error) {
      console.error('Assign error:', error)
      alert(`Errore assegnazione: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setAssigning(null)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Organizza i tuoi workflow n8n per cliente
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizzazione...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizza da n8n
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Colonna Sinistra: Workflow Non Assegnati */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Non Assegnati</CardTitle>
            <CardDescription>
              Workflow sincronizzati da n8n che non sono ancora assegnati a un cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unassignedWorkflows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nessun workflow non assegnato. Clicca "Sincronizza da n8n" per importare workflow.
              </p>
            ) : (
              <div className="space-y-2">
                {unassignedWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {workflow.is_active ? 'Attivo' : 'Inattivo'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {clients.map((client) => (
                        <Button
                          key={client.id}
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssign(workflow.id, client.id)}
                          disabled={assigning === workflow.id}
                        >
                          {assigning === workflow.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Assegna a {client.name}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colonna Destra: Clienti con Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>Clienti</CardTitle>
            <CardDescription>
              Clienti con workflow assegnati
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nessun cliente. Crea un cliente per iniziare.
              </p>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Clicca su un workflow a sinistra per assegnarlo a questo cliente.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientAndLogger, getClients, generateLoggerSnippet } from '@/server/actions/clients'
import { getAgency } from '@/server/actions/agencies'
import { Loader2, Plus, Copy, Check, AlertCircle } from 'lucide-react'

interface Client {
  id: string
  name: string
  status: string
  logger_token: string
  logger_workflow_id: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [clientName, setClientName] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [agencyConfigured, setAgencyConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    loadClients()
    checkAgency()
  }, [])

  const checkAgency = async () => {
    try {
      const agency = await getAgency()
      setAgencyConfigured(!!agency && !!agency.n8n_base_url && !!agency.n8n_api_key)
    } catch (error) {
      console.error('Error checking agency:', error)
      setAgencyConfigured(false)
    }
  }

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
      alert('Errore nel caricamento clienti')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) {
      alert('Inserisci un nome cliente')
      return
    }

    try {
      setCreating(true)
      const formData = new FormData()
      formData.append('name', clientName.trim())
      
      const result = await createClientAndLogger(formData)
      
      if (result.success) {
        alert(`Cliente "${clientName}" creato con successo! Workflow logger creato automaticamente in n8n.`)
        setClientName('')
        setShowForm(false)
        await loadClients()
      }
    } catch (error) {
      console.error('Create error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Messaggi più user-friendly
      if (errorMessage.includes('Agency not configured') || errorMessage.includes('Settings')) {
        alert(`⚠️ ${errorMessage}\n\nVai su Settings per configurare la tua agenzia e la connessione n8n.`)
      } else if (errorMessage.includes('n8n')) {
        alert(`⚠️ Errore connessione n8n: ${errorMessage}\n\nVerifica le credenziali n8n in Settings.`)
      } else {
        alert(`❌ Errore creazione cliente: ${errorMessage}`)
      }
    } finally {
      setCreating(false)
    }
  }

  const handleCopySnippet = async (clientId: string) => {
    try {
      const snippet = await generateLoggerSnippet(clientId)
      await navigator.clipboard.writeText(snippet)
      setCopiedId(clientId)
      setTimeout(() => setCopiedId(null), 2000)
      alert('Snippet copiato negli appunti! Incolla questo nodo alla fine dei tuoi workflow n8n.')
    } catch (error) {
      console.error('Copy error:', error)
      alert(`Errore generazione snippet: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          <h1 className="text-3xl font-bold">Clienti</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi clienti e genera snippet logger per n8n
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          disabled={agencyConfigured === false}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Cliente
        </Button>
      </div>

      {agencyConfigured === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800">Agenzia non configurata</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Configura la tua agenzia e la connessione n8n in{' '}
              <a href="/settings" className="underline font-medium">Settings</a> prima di creare clienti.
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crea Nuovo Cliente</CardTitle>
            <CardDescription>
              Il sistema creerà automaticamente un workflow logger in n8n per questo cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Cliente</Label>
                <Input
                  id="name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="es. PizzaMania"
                  required
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  'Crea Cliente'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Nessun cliente. Crea il primo cliente per iniziare.
              </p>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{client.name}</CardTitle>
                    <CardDescription>
                      Status: {client.status} | Logger Workflow: {client.logger_workflow_id ? 'Creato' : 'Non creato'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCopySnippet(client.id)}
                    disabled={!client.logger_workflow_id || copiedId === client.id}
                  >
                    {copiedId === client.id ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copiato!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copia Nodo Logger
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Token: <code className="text-xs">{client.logger_token}</code>
                </p>
                {client.logger_workflow_id && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Workflow ID: <code className="text-xs">{client.logger_workflow_id}</code>
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


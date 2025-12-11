'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAgency, upsertAgency } from '@/server/actions/agencies'
import { Loader2, Save, Check } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    n8n_base_url: '',
    n8n_api_key: '',
  })

  useEffect(() => {
    loadAgency()
  }, [])

  const loadAgency = async () => {
    try {
      setLoading(true)
      const agency = await getAgency()
      if (agency) {
        setFormData({
          name: agency.name || '',
          n8n_base_url: agency.n8n_base_url || '',
          n8n_api_key: agency.n8n_api_key || '',
        })
      }
    } catch (error) {
      console.error('Error loading agency:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.n8n_base_url || !formData.n8n_api_key) {
      alert('Compila tutti i campi')
      return
    }

    try {
      setSaving(true)
      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('n8n_base_url', formData.n8n_base_url)
      formDataObj.append('n8n_api_key', formData.n8n_api_key)
      
      const result = await upsertAgency(formDataObj)
      
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        alert('Configurazione salvata con successo!')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert(`Errore salvataggio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
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
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Configurazione Agenzia</CardTitle>
          <CardDescription>
            Configura la connessione alla tua istanza n8n. L&apos;API Key si trova in n8n &gt; Settings &gt; Public API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Agenzia</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es. AutoTech"
                required
              />
            </div>

            <div>
              <Label htmlFor="n8n_base_url">URL n8n</Label>
              <Input
                id="n8n_base_url"
                type="url"
                value={formData.n8n_base_url}
                onChange={(e) => setFormData({ ...formData, n8n_base_url: e.target.value })}
                placeholder="https://n8n.miagenzia.com"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL base della tua istanza n8n (senza /api/v1)
              </p>
            </div>

            <div>
              <Label htmlFor="n8n_api_key">API Key n8n</Label>
              <Input
                id="n8n_api_key"
                type="password"
                value={formData.n8n_api_key}
                onChange={(e) => setFormData({ ...formData, n8n_api_key: e.target.value })}
                placeholder="Incolla la tua API Key"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Trova l&apos;API Key in n8n &gt; Settings &gt; Public API
              </p>
            </div>

            <Button type="submit" disabled={saving || saved}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Salvato!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salva Configurazione
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


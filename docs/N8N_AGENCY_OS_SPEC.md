# 🎯 n8n Agency OS - Specifiche Tecniche Complete
## Control Plane Bidirezionale per Agenzie n8n

**Data**: Dicembre 2024  
**Versione**: 2.0  
**Tipo**: SaaS B2B - Gestionale per Agenzie di Automazione

---

## 📋 CONCETTO CHIAVE

### Cosa È

**n8n Agency OS** non è una dashboard passiva. È un **Control Plane** che:
- ✅ Si connette all'istanza n8n dell'agenzia via API
- ✅ Organizza workflow caotici per Cliente/Progetto
- ✅ Crea automaticamente workflow logger quando si crea un cliente
- ✅ Genera snippet JSON per inserire nodi logger nei workflow esistenti
- ✅ Mostra analytics filtrati per cliente

### Differenza Chiave

**Prima (Dashboard Passiva)**:
```
n8n → Logger → Supabase → Dashboard (solo visualizzazione)
```

**Adesso (Control Plane)**:
```
Dashboard ↔ n8n API (crea workflow, sync, organizza)
     ↓
Logger → Supabase → Dashboard (analytics per cliente)
```

---

## 🏗️ ARCHITETTURA TECNICA

### Flusso Completo

```
┌─────────────────┐
│  n8n Agency OS  │
│  (Next.js)      │
└────────┬────────┘
         │
         │ 1. Sync Workflow (GET /workflows)
         │ 2. Crea Logger (POST /workflows)
         │ 3. Attiva/Disattiva (POST /activate)
         │
         ▼
┌─────────────────┐
│  n8n Instance   │
│  (Agenzia)      │
└────────┬────────┘
         │
         │ 4. Esegue Workflow
         │ 5. Logger chiama Webhook
         │
         ▼
┌─────────────────┐
│  Supabase       │
│  execution_logs │
└────────┬────────┘
         │
         │ 6. Realtime Updates
         │
         ▼
┌─────────────────┐
│  Dashboard      │
│  Analytics      │
└─────────────────┘
```

---

## 📊 SCHEMA DATABASE

### Tabelle Principali

```sql
-- 1. Agenzie (Configurazione n8n)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  n8n_api_key TEXT NOT NULL, -- API Key di n8n (criptare in produzione)
  n8n_base_url TEXT NOT NULL, -- es. https://n8n.miagenzia.com
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clienti dell'Agenzia
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  logger_token TEXT UNIQUE DEFAULT gen_random_uuid(), -- Token per webhook logger
  logger_workflow_id TEXT, -- ID del workflow logger creato in n8n
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workflow Mappati (Ponte tra n8n e Dashboard)
CREATE TABLE n8n_workflows (
  id TEXT PRIMARY KEY, -- ID originale di n8n (es. "1234")
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- NULL = Unassigned
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Log Esecuzioni (Dati per Analytics)
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT REFERENCES n8n_workflows(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  execution_id TEXT NOT NULL, -- ID esecuzione n8n
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  started_at TIMESTAMPTZ NOT NULL,
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indici per Performance
CREATE INDEX idx_workflows_agency ON n8n_workflows(agency_id);
CREATE INDEX idx_workflows_client ON n8n_workflows(client_id);
CREATE INDEX idx_logs_client_date ON execution_logs(client_id, started_at DESC);
CREATE INDEX idx_logs_workflow ON execution_logs(workflow_id);
CREATE INDEX idx_clients_agency ON clients(agency_id);

-- RLS Policies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Agencies (ogni utente vede solo la sua agenzia)
CREATE POLICY "Users can view their agency"
  ON agencies FOR SELECT
  USING (id = (SELECT agency_id FROM profiles WHERE id = auth.uid()));

-- Policy: Clients (solo clienti della propria agenzia)
CREATE POLICY "Users can view their agency clients"
  ON clients FOR SELECT
  USING (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

-- Policy: Workflows (solo workflow della propria agenzia)
CREATE POLICY "Users can view their agency workflows"
  ON n8n_workflows FOR SELECT
  USING (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

-- Policy: Logs (solo log dei clienti della propria agenzia)
CREATE POLICY "Users can view their agency logs"
  ON execution_logs FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Policy: Webhook può inserire log (convalidato via token)
CREATE POLICY "Webhook can insert logs with token"
  ON execution_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id 
      AND logger_token = current_setting('request.headers', true)::json->>'x-logger-token'
    )
  );
```

---

## 🔧 FUNZIONALITÀ CORE

### 1. Sync Bidirezionale Workflow

**Obiettivo**: Sincronizzare workflow da n8n al database locale.

**Flusso**:
1. Utente clicca "Sync Workflows" nel dashboard
2. Server Action chiama `GET https://[n8n-url]/api/v1/workflows`
3. Per ogni workflow:
   - Se esiste già in DB → aggiorna (nome, stato)
   - Se non esiste → crea record con `client_id = NULL` (Unassigned)
4. UI mostra workflow "Unassigned" a sinistra

**Implementazione**:

```typescript
// server/actions/n8n-sync.ts
export async function syncWorkflows(agencyId: string) {
  const agency = await getAgency(agencyId);
  const response = await fetch(`${agency.n8n_base_url}/api/v1/workflows`, {
    headers: {
      'X-N8N-API-KEY': agency.n8n_api_key
    }
  });
  
  const workflows = await response.json();
  
  for (const wf of workflows) {
    await upsertWorkflow({
      id: wf.id,
      agency_id: agencyId,
      name: wf.name,
      is_active: wf.active,
      client_id: null // Unassigned
    });
  }
}
```

---

### 2. One-Click Provisioning Cliente

**Obiettivo**: Quando si crea un cliente, creare automaticamente workflow logger in n8n.

**Flusso**:
1. Utente crea cliente "PizzaMania" nel dashboard
2. Sistema genera `logger_token` univoco
3. Sistema chiama `POST https://[n8n-url]/api/v1/workflows` con template logger
4. Nome workflow: `_SYSTEM_LOG_RECEIVER_PizzaMania`
5. Workflow contiene:
   - Webhook trigger con path univoco
   - Supabase insert node con `logger_token` nell'header
6. Sistema salva `logger_workflow_id` nel record cliente

**Template Workflow Logger**:

```json
{
  "name": "_SYSTEM_LOG_RECEIVER_PizzaMania",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "logger-pizzamania-{{ $client.logger_token }}",
        "responseMode": "responseNode"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{ $env.SUPABASE_URL }}/rest/v1/execution_logs",
        "method": "POST",
        "headers": {
          "x-logger-token": "{{ $client.logger_token }}",
          "apikey": "{{ $env.SUPABASE_ANON_KEY }}",
          "Content-Type": "application/json"
        },
        "body": {
          "client_id": "{{ $client.id }}",
          "execution_id": "{{ $json.execution_id }}",
          "status": "{{ $json.status }}",
          "started_at": "{{ $json.started_at }}",
          "metadata": "{{ $json.metadata }}"
        }
      }
    }
  ]
}
```

**Implementazione**:

```typescript
// server/actions/clients.ts
export async function createClient(agencyId: string, name: string) {
  // 1. Crea cliente in DB
  const client = await supabase
    .from('clients')
    .insert({
      agency_id: agencyId,
      name,
      logger_token: crypto.randomUUID()
    })
    .select()
    .single();

  // 2. Crea workflow logger in n8n
  const agency = await getAgency(agencyId);
  const loggerWorkflow = await createLoggerWorkflow(agency, client);

  // 3. Salva workflow_id nel cliente
  await supabase
    .from('clients')
    .update({ logger_workflow_id: loggerWorkflow.id })
    .eq('id', client.id);

  return client;
}
```

---

### 3. Generatore Snippet Logger (Smart Copy-Paste)

**Obiettivo**: Generare JSON di nodo n8n già configurato per inserire nei workflow esistenti.

**Flusso**:
1. Utente seleziona cliente "PizzaMania"
2. Clicca "Copia Nodo Logger"
3. Sistema genera JSON nodo "Execute Workflow" con:
   - Workflow ID: `logger_workflow_id` del cliente
   - Parametri pre-compilati
4. Utente fa Ctrl+V nell'editor n8n
5. Nodo funziona subito senza configurazione

**Snippet Generato**:

```json
{
  "type": "n8n-nodes-base.executeWorkflow",
  "typeVersion": 1,
  "position": [1000, 300],
  "parameters": {
    "workflowId": "{{ $client.logger_workflow_id }}",
    "source": {
      "mode": "json",
      "json": "={{ JSON.stringify({ execution_id: $execution.id, status: $execution.status, started_at: $execution.startedAt, metadata: $json }) }}"
    }
  }
}
```

**Implementazione**:

```typescript
// server/actions/clients.ts
export async function generateLoggerSnippet(clientId: string) {
  const client = await getClient(clientId);
  
  const snippet = {
    type: "n8n-nodes-base.executeWorkflow",
    typeVersion: 1,
    parameters: {
      workflowId: client.logger_workflow_id,
      source: {
        mode: "json",
        json: `={{ JSON.stringify({ execution_id: $execution.id, status: $execution.status, started_at: $execution.startedAt, metadata: $json }) }}`
      }
    }
  };
  
  return JSON.stringify(snippet, null, 2);
}
```

---

### 4. Drag & Drop Organizzazione

**Obiettivo**: Assegnare workflow ai clienti trascinandoli.

**Flusso**:
1. UI mostra due colonne:
   - Sinistra: Workflow "Unassigned" (da n8n sync)
   - Destra: Clienti (con workflow assegnati)
2. Utente trascina workflow "Lead Gen Facebook" su cliente "PizzaMania"
3. Sistema aggiorna `n8n_workflows.client_id`
4. Analytics del cliente mostrano solo workflow assegnati

**Implementazione**:

```typescript
// server/actions/workflows.ts
export async function assignWorkflowToClient(
  workflowId: string, 
  clientId: string | null
) {
  await supabase
    .from('n8n_workflows')
    .update({ client_id: clientId })
    .eq('id', workflowId);
}
```

---

### 5. Analytics per Cliente

**Obiettivo**: Mostrare analytics filtrati per cliente.

**Query**:

```sql
-- KPI Cliente
SELECT 
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'error') * 100.0 / COUNT(*) as error_rate,
  AVG(execution_time_ms) as avg_duration
FROM execution_logs
WHERE client_id = $1
AND started_at >= NOW() - INTERVAL '30 days';

-- Grafico Timeline
SELECT 
  DATE_TRUNC('day', started_at) as date,
  COUNT(*) FILTER (WHERE status = 'success') as success,
  COUNT(*) FILTER (WHERE status = 'error') as error
FROM execution_logs
WHERE client_id = $1
AND started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', started_at)
ORDER BY date;
```

---

## 🛠️ IMPLEMENTAZIONE STEP-BY-STEP

### FASE 1: Setup Database (Settimana 1)

1. ✅ Creare migration con tutte le tabelle
2. ✅ Implementare RLS policies
3. ✅ Creare indici per performance
4. ✅ Testare multi-tenancy

**Deliverable**: Database completo e sicuro

---

### FASE 2: n8n API Wrapper (Settimana 1-2)

1. ✅ Creare classe `N8nApiClient` in `lib/n8n/client.ts`
2. ✅ Metodi:
   - `getWorkflows()`
   - `createWorkflow(template)`
   - `activateWorkflow(id)`
   - `deactivateWorkflow(id)`
3. ✅ Gestione errori e retry
4. ✅ Test con istanza n8n reale

**Deliverable**: Wrapper API funzionante

---

### FASE 3: Sync Engine (Settimana 2)

1. ✅ Server Action `syncWorkflows()`
2. ✅ UI button "Sync Workflows"
3. ✅ Mostrare workflow "Unassigned"
4. ✅ Aggiornamento automatico (polling o manuale)

**Deliverable**: Sync bidirezionale funzionante

---

### FASE 4: One-Click Provisioning (Settimana 2-3)

1. ✅ Server Action `createClient()` con creazione workflow logger
2. ✅ Template workflow logger (JSON)
3. ✅ Generazione `logger_token`
4. ✅ Test end-to-end

**Deliverable**: Creazione cliente crea workflow automaticamente

---

### FASE 5: Generatore Snippet (Settimana 3)

1. ✅ Server Action `generateLoggerSnippet()`
2. ✅ UI button "Copia Nodo Logger"
3. ✅ Clipboard API per copiare JSON
4. ✅ Documentazione uso snippet

**Deliverable**: Snippet generator funzionante

---

### FASE 6: Drag & Drop UI (Settimana 3-4)

1. ✅ Installare libreria drag-drop (es. `@dnd-kit/core`)
2. ✅ UI due colonne (Unassigned vs Clienti)
3. ✅ Server Action `assignWorkflowToClient()`
4. ✅ Feedback visivo (animazioni)

**Deliverable**: Organizzazione workflow funzionante

---

### FASE 7: Analytics Dashboard (Settimana 4-5)

1. ✅ Pagina `/clients/[id]/analytics`
2. ✅ KPI cards (esecuzioni, error rate, tempo medio)
3. ✅ Grafici timeline (Recharts)
4. ✅ Tabella log con Realtime
5. ✅ Filtri (data, workflow, status)

**Deliverable**: Dashboard analytics completa

---

### FASE 8: Webhook Receiver (Settimana 5)

1. ✅ Route `/api/webhooks/n8n-logger`
2. ✅ Validazione `logger_token`
3. ✅ Inserimento in `execution_logs`
4. ✅ Test con workflow logger reale

**Deliverable**: Webhook funzionante

---

## 📊 ROADMAP CONSOLIDATA

| Settimana | Fase | Deliverable | Status |
|-----------|------|-------------|--------|
| 1 | Database + API Wrapper | Schema + n8n client | ⏳ |
| 2 | Sync + Provisioning | Sync engine + Auto-creazione | ⏳ |
| 3 | Snippet + Drag-Drop | Generator + Organizzazione | ⏳ |
| 4-5 | Analytics + Webhook | Dashboard + Receiver | ⏳ |

**Timeline Totale**: 5 settimane per MVP completo

---

## ⚠️ RISCHI E MITIGAZIONI

### Rischio 1: n8n API Changes

**Problema**: n8n potrebbe cambiare API breaking changes.

**Mitigazione**:
- ✅ Versioning API (usare versione specifica)
- ✅ Error handling robusto
- ✅ Fallback se API non disponibile

### Rischio 2: Sicurezza API Key

**Problema**: API key n8n esposta nel database.

**Mitigazione**:
- ✅ Criptare `n8n_api_key` in DB (Supabase Vault o encryption)
- ✅ Non esporre mai nel frontend
- ✅ Rotazione API key facile

### Rischio 3: Performance Sync

**Problema**: Sync di 500+ workflow potrebbe essere lento.

**Mitigazione**:
- ✅ Paginazione API n8n
- ✅ Background job (queue system)
- ✅ Caching workflow (sync incrementale)

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### Database
- [ ] Migration completa (agencies, clients, n8n_workflows, execution_logs)
- [ ] RLS policies su tutte le tabelle
- [ ] Indici per performance
- [ ] Test multi-tenancy

### n8n Integration
- [ ] API Wrapper completo
- [ ] Sync engine funzionante
- [ ] Template workflow logger
- [ ] One-click provisioning
- [ ] Snippet generator

### Frontend
- [ ] Pagina sync workflows
- [ ] Drag & drop organizzazione
- [ ] Creazione cliente con auto-provisioning
- [ ] Analytics dashboard per cliente
- [ ] Settings (n8n URL, API key)

### Backend
- [ ] Webhook receiver
- [ ] Server Actions (sync, create, assign)
- [ ] Error handling
- [ ] Logging

---

## 🎯 METRICHE DI SUCCESSO

### Tecniche
- ✅ Sync workflow: <5 secondi per 100 workflow
- ✅ Creazione cliente: <3 secondi (include workflow creation)
- ✅ Webhook latency: <500ms
- ✅ Dashboard load: <1 secondo

### Business
- ✅ Onboarding agenzia: <15 minuti
- ✅ Setup primo cliente: <2 minuti
- ✅ Customer satisfaction: >4.5/5
- ✅ Churn rate: <3%/mese

---

## 🚀 PROSSIMI PASSI IMMEDIATI

1. ✅ **Approvare Piano**: Confermare architettura Control Plane
2. ✅ **Setup Database**: Creare migration completa (Fase 1)
3. ✅ **n8n API Wrapper**: Implementare client API (Fase 2)
4. ✅ **Test Sync**: Verificare sync workflow funzionante

**Domanda**: Procediamo con l'implementazione o vuoi modifiche al piano?


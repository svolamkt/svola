# 🚀 Setup Guide: n8n Analytics Dashboard

Guida completa per configurare il sistema di analytics per n8n.

---

## 📋 Prerequisiti

- ✅ Account Supabase (gratuito o paid)
- ✅ Account n8n (self-hosted o cloud)
- ✅ Node.js 18+ (per sviluppo locale)
- ✅ Git (per clonare repository)

---

## 1. Setup Supabase

### 1.1 Creare Progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (dalla pagina Settings > API)

### 1.2 Eseguire Migration

1. Vai su Supabase Dashboard > SQL Editor
2. Copia il contenuto di `supabase/migrations/add_workflow_logs.sql`
3. Esegui la migration
4. Verifica che le tabelle siano create:
   - `workflow_logs`
   - `organizations` (con nuovi campi)

### 1.3 Configurare RLS

Le RLS policies sono già incluse nella migration. Verifica che siano attive:

```sql
-- Verifica RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'workflow_logs';
```

---

## 2. Setup n8n Logger Template

### 2.1 Importare Template

1. Apri n8n
2. Vai su **Workflows** > **Import from File**
3. Seleziona `docs/n8n-logger-template.json`
4. Il workflow "N8N Logger - Supabase Analytics" verrà importato

### 2.2 Configurare Credenziali

1. Nel workflow, apri il nodo **"HTTP Request to Supabase"**
2. Clicca su **Credentials** > **Create New**
3. Tipo: **Header Auth**
4. Configura:
   - **Name**: `x-api-key`
   - **Value**: `{{ $json.api_key }}` (verrà passato dinamicamente)

### 2.3 Configurare Environment Variables

Nel tuo n8n (Settings > Environment Variables), aggiungi:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
ORG_API_KEY=your-org-api-key-here
```

**Nota**: `ORG_API_KEY` è opzionale se passi `org_api_key` nel payload.

### 2.4 Testare Logger

1. Crea un workflow di test
2. Aggiungi un nodo **"Execute Workflow"** che chiama "N8N Logger - Supabase Analytics"
3. Configura il payload:

```json
{
  "org_api_key": "your-org-api-key",
  "workflow_name": "Test Workflow",
  "execution_id": "{{ $execution.id }}",
  "status": "success",
  "meta": {
    "test": true
  }
}
```

4. Esegui il workflow
5. Verifica in Supabase che il log sia stato inserito:

```sql
SELECT * FROM workflow_logs ORDER BY created_at DESC LIMIT 1;
```

---

## 3. Setup Frontend (Next.js)

### 3.1 Clonare Repository

```bash
git clone <repository-url>
cd svola
npm install
```

### 3.2 Configurare Environment Variables

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3.3 Eseguire Migration Locale (Opzionale)

Se usi Supabase CLI:

```bash
supabase db push
```

### 3.4 Avviare Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## 4. Creare Organization e API Key

### 4.1 Via Supabase Dashboard

1. Vai su **Table Editor** > `organizations`
2. Clicca **Insert row**
3. Compila:
   - `name`: Nome agenzia/cliente
   - `slug`: URL-friendly (es. "my-agency")
   - `primary_color`: Colore HEX (es. "#3B82F6")
   - `api_key`: Lascia vuoto (verrà generato automaticamente)

4. Copia l'`api_key` generato (es. `550e8400-e29b-41d4-a716-446655440000`)

### 4.2 Via SQL

```sql
INSERT INTO organizations (name, slug, primary_color)
VALUES ('My Agency', 'my-agency', '#3B82F6')
RETURNING id, api_key;
```

Copia l'`api_key` restituito.

### 4.3 Usare API Key in n8n

Nel tuo workflow n8n, passa `org_api_key` nel payload:

```json
{
  "org_api_key": "550e8400-e29b-41d4-a716-446655440000",
  "workflow_name": "Lead Gen Facebook",
  "execution_id": "{{ $execution.id }}",
  "status": "{{ $execution.status }}",
  "meta": {
    "leads": 5,
    "source": "facebook"
  }
}
```

---

## 5. Integrare Logger in Workflow Esistenti

### 5.1 Metodo 1: Execute Workflow Node

Nel tuo workflow principale, aggiungi un nodo **"Execute Workflow"** alla fine:

1. Nodo: **Execute Workflow**
2. Workflow: **"N8N Logger - Supabase Analytics"**
3. Input Data:

```json
{
  "org_api_key": "{{ $env.ORG_API_KEY }}",
  "workflow_name": "{{ $workflow.name }}",
  "execution_id": "{{ $execution.id }}",
  "status": "{{ $execution.status }}",
  "duration_ms": "{{ $execution.duration }}",
  "meta": {
    "custom_field": "{{ $json.custom_value }}"
  }
}
```

### 5.2 Metodo 2: HTTP Request Diretto

Se preferisci chiamare direttamente Supabase:

1. Nodo: **HTTP Request**
2. Method: **POST**
3. URL: `{{ $env.SUPABASE_URL }}/rest/v1/workflow_logs`
4. Headers:
   - `x-api-key`: `{{ $env.ORG_API_KEY }}`
   - `apikey`: `{{ $env.SUPABASE_ANON_KEY }}`
   - `Content-Type`: `application/json`
   - `Prefer`: `return=minimal`
5. Body (JSON):

```json
{
  "org_id": "your-org-uuid",
  "execution_id": "{{ $execution.id }}",
  "workflow_name": "{{ $workflow.name }}",
  "status": "{{ $execution.status }}",
  "started_at": "{{ $execution.startedAt }}",
  "duration_ms": "{{ $execution.duration }}",
  "metadata": {
    "custom": "data"
  }
}
```

**Nota**: Con questo metodo, devi risolvere `org_id` dall'`api_key` (usa Edge Function).

---

## 6. Configurare White-Label

### 6.1 Upload Logo

1. Vai su Supabase Dashboard > **Storage**
2. Crea bucket `logos` (pubblico)
3. Upload logo
4. Copia URL pubblico
5. Aggiorna `organizations.logo_url`:

```sql
UPDATE organizations 
SET logo_url = 'https://xxxxx.supabase.co/storage/v1/object/public/logos/logo.png'
WHERE id = 'your-org-id';
```

### 6.2 Configurare Colori

```sql
UPDATE organizations 
SET primary_color = '#3B82F6'
WHERE id = 'your-org-id';
```

### 6.3 Testare White-Label

1. Login nella dashboard
2. Verifica che logo e colori siano applicati
3. Se non funziona, controlla che `profiles.org_id` corrisponda a `organizations.id`

---

## 7. Troubleshooting

### Problema: Log non vengono inseriti

**Soluzione**:
1. Verifica che `api_key` sia corretto
2. Verifica RLS policies (dovrebbero permettere INSERT)
3. Controlla console n8n per errori HTTP
4. Verifica che `SUPABASE_URL` e `SUPABASE_ANON_KEY` siano corretti

### Problema: Realtime non funziona

**Soluzione**:
1. Verifica che Realtime sia abilitato in Supabase (Settings > API)
2. Verifica che subscription sia corretta:

```typescript
const channel = supabase
  .channel('workflow_logs')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'workflow_logs',
    filter: `org_id=eq.${orgId}`
  }, callback)
  .subscribe();
```

### Problema: White-Label non si applica

**Soluzione**:
1. Verifica che `profiles.org_id` corrisponda a `organizations.id`
2. Verifica che CSS variables siano impostate:

```typescript
document.documentElement.style.setProperty('--primary', org.primary_color);
```

3. Verifica che logo URL sia accessibile pubblicamente

---

## 8. Best Practices

### 8.1 Performance

- ✅ Usa paginazione per query log (non fare SELECT * senza LIMIT)
- ✅ Indici sono già creati, ma monitora performance
- ✅ Considera archivio log vecchi (>90 giorni) in tabella separata

### 8.2 Sicurezza

- ✅ Non esporre `service_role_key` nel frontend
- ✅ Usa solo `anon_key` con RLS policies
- ✅ Rotazione API key regolare (ogni 90 giorni)
- ✅ Rate limiting su Edge Function (se implementato)

### 8.3 Monitoring

- ✅ Monitora dimensioni tabella `workflow_logs`
- ✅ Monitora performance query dashboard
- ✅ Monitora errori inserimento log

---

## 9. Prossimi Passi

1. ✅ Testare con workflow reali
2. ✅ Configurare white-label per clienti
3. ✅ Monitorare performance
4. ✅ Iterare basandosi su feedback

---

## 📞 Supporto

Per problemi o domande:
- GitHub Issues: [repository-url]/issues
- Email: support@example.com


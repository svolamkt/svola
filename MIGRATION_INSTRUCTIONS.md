# 🗄️ Istruzioni Migration Database - n8n Agency OS

## ⚠️ Importante

Supabase non espone un'API pubblica per eseguire SQL arbitrario per motivi di sicurezza. La migration deve essere eseguita manualmente nel Dashboard Supabase.

## 🚀 Metodo Consigliato: Dashboard Supabase

### Passo 1: Accedi al Dashboard
1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Accedi al tuo account
3. Seleziona il progetto dove vuoi eseguire la migration

### Passo 2: Apri SQL Editor
1. Nel menu laterale, clicca su **"SQL Editor"**
2. Clicca su **"New query"**

### Passo 3: Esegui la Migration
1. Apri il file: `supabase/migrations/add_n8n_agency_os.sql`
2. **Copia tutto il contenuto** del file
3. **Incolla** nel SQL Editor di Supabase
4. Clicca su **"Run"** (o premi `Cmd/Ctrl + Enter`)

### Passo 4: Verifica
Dopo l'esecuzione, verifica che le tabelle siano state create:

```sql
-- Verifica tabelle
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs');
```

Dovresti vedere 4 righe.

## 📋 Cosa crea la migration

La migration crea:

1. **Tabelle**:
   - `agencies` - Configurazione n8n per agenzia
   - `clients` - Clienti dell'agenzia
   - `n8n_workflows` - Workflow sincronizzati da n8n
   - `execution_logs` - Log esecuzioni per analytics

2. **Indici** per performance:
   - `idx_workflows_agency`
   - `idx_workflows_client`
   - `idx_logs_client_date`
   - `idx_logs_workflow`
   - `idx_clients_agency`
   - `idx_logs_execution_id`

3. **RLS Policies** per sicurezza multi-tenant:
   - Policies per `agencies`
   - Policies per `clients`
   - Policies per `n8n_workflows`
   - Policies per `execution_logs`

4. **Colonna `agency_id`** in `profiles` (se non esiste)

## ✅ Checklist Post-Migration

Dopo aver eseguito la migration, verifica:

- [ ] Le 4 tabelle sono state create
- [ ] Gli indici sono stati creati
- [ ] Le RLS policies sono attive
- [ ] La colonna `agency_id` esiste in `profiles`

## 🔧 Troubleshooting

### Errore: "relation already exists"
- ✅ **Normale**: Significa che la tabella esiste già
- La migration usa `CREATE TABLE IF NOT EXISTS`, quindi è sicura da rieseguire

### Errore: "policy already exists"
- ✅ **Normale**: Significa che la policy esiste già
- Le policies vengono create solo se non esistono

### Errore: "column already exists"
- ✅ **Normale**: Significa che `agency_id` esiste già in `profiles`
- Il blocco `DO $$` controlla prima di aggiungere la colonna

## 📝 Note

- La migration è **idempotente**: puoi eseguirla più volte senza problemi
- Usa `IF NOT EXISTS` per tabelle, indici e policies
- Le RLS policies sono abilitate automaticamente

---

**Una volta completata la migration, puoi procedere con il deploy! 🚀**


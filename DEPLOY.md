# n8n Agency OS - Guida al Deploy

## 🚀 Pre-Deploy Checklist

### 1. Database Migration (Supabase)

**IMPORTANTE**: Esegui la migration prima del deploy!

**Opzione A: Dashboard Supabase (Consigliato)**
1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Copia e incolla il contenuto di `supabase/migrations/add_n8n_agency_os.sql`
5. Clicca **"Run"**

**Opzione B: Via Script (se hai accesso a variabili d'ambiente)**
```bash
# Lo script mostrerà le istruzioni
npx tsx scripts/run-migration-direct.ts
```

La migration creerà:
- `agencies` - Configurazione n8n per agenzia
- `clients` - Clienti dell'agenzia
- `n8n_workflows` - Workflow sincronizzati da n8n
- `execution_logs` - Log esecuzioni per analytics
- RLS policies per sicurezza multi-tenant
- Indici per performance

### 2. Environment Variables (Vercel)

Configura queste variabili in Vercel > Settings > Environment Variables:

```env
# Supabase (già configurate probabilmente)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (per webhook)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ IMPORTANTE**: 
- `SUPABASE_SERVICE_ROLE_KEY` è necessaria per il webhook `/api/webhooks/n8n-logger`
- Non esporre mai questa key nel frontend!
- Si trova in Supabase Dashboard > Settings > API > service_role key

### 3. Build & Deploy

```bash
# Verifica che il build funzioni
npm run build

# Se tutto ok, push su GitHub
git add .
git commit -m "feat: n8n Agency OS - ready for deploy"
git push

# Vercel deployerà automaticamente se hai il GitHub integration
```

### 4. Post-Deploy Verification

Dopo il deploy, verifica:

1. **Registrazione Utente**
   - Vai su `/register`
   - Crea un account
   - Verifica che venga creata un'agenzia in Supabase

2. **Configurazione Agenzia**
   - Vai su `/settings`
   - Inserisci:
     - Nome agenzia
     - URL n8n (es. `https://n8n.miagenzia.com`)
     - API Key n8n (da n8n > Settings > Public API)
   - Clicca "Salva"
   - Verifica che la connessione funzioni

3. **Sync Workflows**
   - Vai su `/workflows`
   - Clicca "Sincronizza da n8n"
   - Verifica che i workflow appaiano

4. **Creazione Cliente**
   - Vai su `/clients`
   - Clicca "Nuovo Cliente"
   - Inserisci nome cliente
   - Verifica che:
     - Cliente venga creato in Supabase
     - Workflow logger venga creato in n8n
     - Logger workflow ID venga salvato nel cliente

5. **Webhook Test**
   - Copia snippet logger da `/clients/[id]`
   - Incolla in un workflow n8n
   - Esegui workflow
   - Verifica che log appaia in `/clients/[id]/analytics`

## 📋 Troubleshooting

### Errore: "Agency not found"
- Verifica che l'utente abbia un `agency_id` in `profiles`
- Se no, crea manualmente un'agenzia e collega il profile

### Errore: "Failed to connect to n8n"
- Verifica URL n8n (senza trailing slash)
- Verifica API Key in n8n > Settings > Public API
- Verifica che n8n sia accessibile pubblicamente

### Errore: "SUPABASE_SERVICE_ROLE_KEY is not set"
- Aggiungi la variabile in Vercel > Settings > Environment Variables
- Riavvia il deployment

### Webhook non riceve log
- Verifica che il logger workflow sia attivo in n8n
- Verifica che il webhook path sia corretto
- Verifica che `x-logger-token` header sia presente
- Controlla i log di Vercel per errori

## 🔒 Security Notes

- **RLS Policies**: Tutte le tabelle hanno RLS abilitato
- **Service Role Key**: Usata solo in API routes, mai nel frontend
- **Logger Token**: Token univoco per ogni cliente, validato nel webhook
- **API Key n8n**: Salvata in database (considera encryption in futuro)

## 📚 Documentazione

- [N8N_AGENCY_OS_SPEC.md](./docs/N8N_AGENCY_OS_SPEC.md) - Specifiche tecniche complete
- [N8N_AGENCY_OS_EXPLAINED.md](./docs/N8N_AGENCY_OS_EXPLAINED.md) - Spiegazione semplificata

## ✅ Deploy Checklist

- [x] Migration database eseguita ✅
- [ ] Environment variables configurate
- [x] Build locale funziona (`npm run build`) ✅
- [x] Push su GitHub ✅
- [ ] Deploy su Vercel completato
- [ ] Test registrazione utente
- [ ] Test configurazione agenzia
- [ ] Test sync workflows
- [ ] Test creazione cliente
- [ ] Test webhook logger

---

**Ready to Deploy! 🚀**



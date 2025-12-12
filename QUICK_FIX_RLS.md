# 🔥 QUICK FIX - Errore RLS Agency

## Problema
Errore: `new row violates row-level security policy for table "agencies"`

## Soluzione Immediata

### Opzione 1: Via Supabase Dashboard (CONSIGLIATO)

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona progetto: **SVOLA MARKETING**
3. Vai su **SQL Editor**
4. Copia e incolla questo SQL:

```sql
-- Rimuovi policy precedente
DROP POLICY IF EXISTS "Users can insert their agency" ON agencies;

-- Crea policy semplice per INSERT
CREATE POLICY "Authenticated users can insert agency"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

5. Clicca **"Run"**
6. Dovresti vedere: **Success. No rows returned**
7. Riprova a salvare l'agenzia

---

### Opzione 2: Disabilita temporaneamente RLS (Solo per test)

**⚠️ NON USARE IN PRODUZIONE! Solo per verificare che il problema sia RLS**

```sql
-- Disabilita RLS su agencies (TEMPORANEO)
ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;
```

Dopo aver testato, riabilita RLS:

```sql
-- Riabilita RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- E ricrea la policy corretta
CREATE POLICY "Authenticated users can insert agency"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

---

## Verifica che la policy sia attiva

Dopo aver eseguito la migration, verifica con:

```sql
-- Verifica policies su agencies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'agencies';
```

Dovresti vedere:
- `Authenticated users can insert agency` per INSERT
- `Users can view their agency` per SELECT
- `Users can update their agency` per UPDATE

---

## Se ancora non funziona

1. Verifica che il tuo utente sia autenticato:
```sql
SELECT auth.uid(); -- Dovrebbe restituire un UUID
```

2. Verifica che il profilo esista:
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

3. Prova a inserire manualmente (per debug):
```sql
-- Questo dovrebbe funzionare
INSERT INTO agencies (name, n8n_api_key, n8n_base_url)
VALUES ('Test Agency', 'test-key', 'https://test.com')
RETURNING *;
```

Se questo funziona, il problema è nel codice applicativo, non in RLS.

---

## Commit e Deploy

Dopo aver applicato la fix, il codice sarà aggiornato automaticamente su Vercel nel prossimo deploy.

La migration è già nel repository: `supabase/migrations/fix_agency_insert_policy.sql`


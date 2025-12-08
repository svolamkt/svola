# 🚀 Piano di Implementazione: Sistema Adattivo Brand Master File

## 📋 Overview

Trasformare il sistema da workflow tecnico a prodotto strategico con:
- Modulo cliente progressivo e adattivo
- Agenti che si comportano diversamente in base al livello di consapevolezza
- Output con confidence notes, warnings, next steps
- UX che protegge da percezioni negative

## 🎯 Obiettivo

**Trasformare qualsiasi cliente, anche poco consapevole, in un Brand Master File strutturato e utilizzabile, distinguendo sempre fatti da ipotesi.**

## 📦 File da Creare/Modificare

### 1. Frontend Components

#### ✅ Da Creare

**`src/components/modules/strategy/AdaptiveBrandAnalysisForm.tsx`**
- Form progressivo con 4 step
- Step 1: Identità minima (obbligatoria)
- Step 2: Livello di consapevolezza (decisionale)
- Step 3: Input facoltativi
- Step 4: Controllo aspettative
- Gestione stato multi-step
- Validazione progressiva

**`src/components/modules/strategy/AnalysisResultsView.tsx`**
- Visualizzazione risultati analisi
- Executive summary
- Confidence notes
- Warnings
- Next steps

**`src/components/modules/strategy/ConfidenceNotes.tsx`**
- Componente per mostrare confidence notes
- Badge di confidenza (high/medium/low)
- Tooltip con spiegazioni

**`src/components/modules/strategy/NextStepsPanel.tsx`**
- Panel con prossimi passi operativi
- Priorità visuale
- Categorie (clarity, differentiation, optimization)
- Impact vs Effort matrix

#### ✅ Da Modificare

**`src/components/modules/strategy/BrandIdentityTabs.tsx`**
- Sostituire `BrandAnalysisForm` con `AdaptiveBrandAnalysisForm`
- Aggiungere tab "Risultati Analisi" con `AnalysisResultsView`

### 2. Server Actions

#### ✅ Da Modificare

**`src/server/actions/brand-analysis.ts`**
- Aggiungere campo `awareness_level` al payload
- Aggiungere logica di normalizzazione input
- Includere `source_confidence` nel payload

### 3. Database Schema

#### ✅ Migration da Creare

**`supabase/migrations/add_confidence_fields.sql`**
```sql
ALTER TABLE brand_identity 
ADD COLUMN IF NOT EXISTS confidence_notes JSONB,
ADD COLUMN IF NOT EXISTS warnings JSONB,
ADD COLUMN IF NOT EXISTS next_steps JSONB,
ADD COLUMN IF NOT EXISTS executive_summary TEXT,
ADD COLUMN IF NOT EXISTS awareness_level TEXT CHECK (awareness_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS maturity_score INTEGER CHECK (maturity_score >= 0 AND maturity_score <= 100);
```

### 4. n8n Workflow

#### ✅ Da Modificare

**Nodo "Prepare Data"**
- Aggiungere logica di confidence scoring
- Calcolare `source_confidence`
- Determinare `analysis_mode` basato su `awareness_level`
- Identificare campi mancanti

**Nodo "Agent 1: Website Deep Analyzer"**
- Aggiornare system message per gestire awareness_level
- Aggiungere valutazione maturità brand
- Segnalare incoerenze

**Nodo "Agent 2: Competitor Intelligence"**
- Aggiornare system message per awareness_level
- Comportamento diverso per low/medium/high

**Nodo "Agent 3: Market Researcher"**
- Aggiornare system message per awareness_level
- Validare/invalidare settore dichiarato

**Nodo "Agent 4: Brand Perception Analyzer"**
- Aggiornare system message per awareness_level
- Gestire caso "bassa visibilità" (OK)

**Nodo "Agent 5: Strategic Synthesizer"**
- Aggiornare system message per awareness_level
- Generare `confidence_notes[]`
- Generare `warnings[]`
- Generare `next_steps[]`
- Generare `executive_summary`

**Nodo "Parse AI JSON"**
- Estrarre anche `confidence_notes`, `warnings`, `next_steps`, `executive_summary`

**Nodo "Update DB"**
- Salvare anche `confidence_notes`, `warnings`, `next_steps`, `executive_summary`, `awareness_level`, `maturity_score`

## 📝 Implementazione Step-by-Step

### Fase 1: Database Schema (30 min)

1. Creare migration SQL
2. Eseguire migration in Supabase
3. Aggiornare TypeScript types

**File**: `supabase/migrations/add_confidence_fields.sql`

### Fase 2: Modulo Cliente Progressivo (2-3 ore)

1. Creare `AdaptiveBrandAnalysisForm.tsx`
   - Step 1: Nome + URL (obbligatorio)
   - Step 2: Awareness level (radio buttons)
   - Step 3: Campi facoltativi
   - Step 4: Messaggio aspettative
   - Navigazione step-by-step
   - Validazione progressiva

2. Integrare in `BrandIdentityTabs.tsx`

**File**: 
- `src/components/modules/strategy/AdaptiveBrandAnalysisForm.tsx` (NUOVO)
- `src/components/modules/strategy/BrandIdentityTabs.tsx` (MODIFICARE)

### Fase 3: Server Action Update (30 min)

1. Aggiornare `submitBrandAnalysis` per includere:
   - `awareness_level`
   - Logica di normalizzazione
   - `source_confidence` calculation

**File**: `src/server/actions/brand-analysis.ts` (MODIFICARE)

### Fase 4: n8n Workflow - Prepare Data (1 ora)

1. Aggiornare nodo "Prepare Data" con:
   - Confidence scoring
   - Analysis mode determination
   - Missing fields identification

**File**: Workflow n8n (MODIFICARE nodo esistente)

### Fase 5: n8n Workflow - Agenti Adattivi (2-3 ore)

1. Aggiornare system messages di Agent 1-5
2. Aggiungere logica condizionale basata su `awareness_level`
3. Testare con diversi awareness levels

**File**: Workflow n8n (MODIFICARE 5 nodi Agent)

### Fase 6: n8n Workflow - Output Arricchito (1-2 ore)

1. Aggiornare Agent 5 per generare:
   - `confidence_notes[]`
   - `warnings[]`
   - `next_steps[]`
   - `executive_summary`

2. Aggiornare Parse JSON per estrarre questi campi

3. Aggiornare Update DB per salvarli

**File**: Workflow n8n (MODIFICARE 3 nodi)

### Fase 7: UI Risultati (2-3 ore)

1. Creare `AnalysisResultsView.tsx`
2. Creare `ConfidenceNotes.tsx`
3. Creare `NextStepsPanel.tsx`
4. Integrare in Brand Identity Tabs

**File**:
- `src/components/modules/strategy/AnalysisResultsView.tsx` (NUOVO)
- `src/components/modules/strategy/ConfidenceNotes.tsx` (NUOVO)
- `src/components/modules/strategy/NextStepsPanel.tsx` (NUOVO)
- `src/components/modules/strategy/BrandIdentityTabs.tsx` (MODIFICARE)

## 🧪 Testing Plan

### Test Case 1: Cliente Low Awareness
- Input: Solo nome + URL
- Expected: Strategia implicita costruita, confidence notes per campi dedotti

### Test Case 2: Cliente Medium Awareness
- Input: Nome + URL + alcuni campi
- Expected: Integrazione input + dati, confidence notes per integrazioni

### Test Case 3: Cliente High Awareness
- Input: Tutti i campi compilati
- Expected: Validazione e raffinamento, warnings per incoerenze

### Test Case 4: Incoerenza Sito vs Input
- Input: Settore dichiarato ≠ contenuto sito
- Expected: Warning di incoerenza, uso settore reale

### Test Case 5: Bassa Visibilità Online
- Input: Brand poco citato online
- Expected: Confidence note "bassa visibilità", next step "aumentare presenza"

## 📊 Metriche di Successo

1. **Riduzione attrito**: Tempo medio compilazione < 3 minuti
2. **Qualità output**: Confidence notes presenti per ogni campo incerto
3. **Soddisfazione**: Next steps operativi e actionable
4. **Trasparenza**: Zero percezione di "hallucination"

## 🚨 Rischi e Mitigazione

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Cliente si offende per correzioni | Media | Messaggio Step 4 chiaro, confidence notes trasparenti |
| Output troppo generico | Bassa | Agenti specializzati, awareness level guida comportamento |
| Performance workflow | Media | Testare con timeout, considerare asincrono |
| Costi API elevati | Alta | Monitorare, ottimizzare system messages |

## 📅 Timeline Stimata

- **Fase 1**: 30 min
- **Fase 2**: 2-3 ore
- **Fase 3**: 30 min
- **Fase 4**: 1 ora
- **Fase 5**: 2-3 ore
- **Fase 6**: 1-2 ore
- **Fase 7**: 2-3 ore

**Totale**: 9-13 ore

## ✅ Checklist Implementazione

### Database
- [ ] Creare migration SQL
- [ ] Eseguire migration
- [ ] Aggiornare TypeScript types

### Frontend
- [ ] Creare AdaptiveBrandAnalysisForm
- [ ] Creare AnalysisResultsView
- [ ] Creare ConfidenceNotes
- [ ] Creare NextStepsPanel
- [ ] Integrare in BrandIdentityTabs

### Backend
- [ ] Aggiornare submitBrandAnalysis
- [ ] Aggiungere awareness_level al payload
- [ ] Aggiungere source_confidence calculation

### n8n Workflow
- [ ] Aggiornare Prepare Data
- [ ] Aggiornare Agent 1 system message
- [ ] Aggiornare Agent 2 system message
- [ ] Aggiornare Agent 3 system message
- [ ] Aggiornare Agent 4 system message
- [ ] Aggiornare Agent 5 system message
- [ ] Aggiornare Parse JSON
- [ ] Aggiornare Update DB

### Testing
- [ ] Test con cliente low awareness
- [ ] Test con cliente medium awareness
- [ ] Test con cliente high awareness
- [ ] Test incoerenza sito vs input
- [ ] Test bassa visibilità online

## 🎯 Prossimi Passi

1. Iniziare con Fase 1 (Database Schema)
2. Implementare Fase 2 (Modulo Cliente Progressivo)
3. Aggiornare n8n workflow (Fase 4-6)
4. Completare UI risultati (Fase 7)
5. Testing completo


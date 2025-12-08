# 🎯 Strategia Prodotto: Nexus Brand Master File Generator

## 📋 Visione del Prodotto

**Trasformare qualsiasi cliente, anche poco consapevole della propria azienda, in un Brand Master File strutturato, coerente e strategicamente utilizzabile.**

### Principi Fondamentali

1. **Il cliente NON è la fonte della verità**
   - Il sito web + dati esterni SONO la fonte primaria
   - L'input utente serve a orientare, non a fidarsi ciecamente

2. **Riduzione di attrito**
   - Modulo progressivo, non lungo e statico
   - Step facoltativi che aumentano precisione ma non bloccano

3. **Massima qualità dell'output**
   - Comportamento deterministico degli agenti
   - Distinzione tra fatti e ipotesi
   - Confidence notes per trasparenza

4. **Adattività**
   - Sistema si adatta al livello di consapevolezza del cliente
   - Output diverso per clienti informati vs poco informati

## 🧩 Architettura Funzionale

```
Cliente → Modulo Adaptive (Step 1-4) → Normalize Input →
  Agent 1 (Truth Extraction - Website) →
  Agent 2 (Reality Check - Competitor) →
  Agent 3 (Context - Market) →
  Agent 4 (Voice of Market - Perception) →
  Agent 5 (Strategic Synthesis) →
  Output: JSON + Executive Summary + Next Steps
```

## 📋 Modulo Cliente Progressivo

### Step 1 – Identità Minima (OBBLIGATORIA)

**Obiettivo**: Identificare "chi" analizziamo

**Campi**:
- ✅ Nome azienda (obbligatorio)
- ✅ URL sito web (obbligatorio)
- Settore (dropdown + "Altro")
- Paese / mercato principale (dropdown)

**UX**: 
- Form minimale, 2 campi obbligatori
- Messaggio: "Iniziamo con le informazioni essenziali"

### Step 2 – Livello di Consapevolezza (DECISIONALE)

**Domanda chiave** (radio buttons):

> Quanto sei sicuro della tua strategia di brand?

- ⭕ **Non abbiamo una strategia chiara** → `awareness_level: "low"`
- ⭕ **Abbiamo delle idee ma non strutturate** → `awareness_level: "medium"`
- ⭕ **Abbiamo una strategia definita** → `awareness_level: "high"`

**Questo governa il comportamento degli agenti:**
- `low`: Agenti diventano più esplorativi, sito web = fonte primaria
- `medium`: Agenti bilanciano input utente e ricerca
- `high`: Agenti validano e raffinano, segnalano incoerenze

### Step 3 – Input Facoltativi ma Potenti

**Non forzare l'utente, ma offrire valore**

**Campi**:
- Prodotto principale (testo libero)
- Target cliente (dropdown: B2B, B2C, Both + testo libero)
- Competitor noti (fino a 3 URL o nomi)
- Obiettivi (multi-select: lead generation, brand awareness, vendite, fidelizzazione)

**UX**:
- "Questi campi sono opzionali ma aumentano la precisione"
- Se compilati → aumentano precisione
- Se vuoti → il sistema li deduce

### Step 4 – Controllo Aspettative (UX CRITICA)

**Messaggio chiaro**:

> "Useremo le informazioni fornite insieme a dati reali dal web per creare un'analisi oggettiva del tuo brand. Il sistema analizzerà il tuo sito web, cercherà competitor reali, analizzerà il mercato e la percezione online. Se alcune informazioni non sono disponibili, le indicheremo chiaramente."

**Protegge da**:
- Clienti che si offendono se l'AI "corregge" le loro informazioni
- Percezione di "hallucination"
- Aspettative irrealistiche

## ⚙️ Normalizzazione Input (Prepare Data Node)

**Questo nodo è fondamentale** - deve:

1. **Distinguere dato certo vs dato dichiarato**
2. **Taggare i livelli di confidenza**
3. **Identificare campi mancanti**

**Output struttura**:

```json
{
  "form_data": {
    "website_url": "https://example.com",
    "company_name": "Example",
    "industry": "marketing",
    "awareness_level": "low"
  },
  "source_confidence": {
    "website": "high",
    "user_input": {
      "company_name": "medium",
      "industry": "low",
      "target": "missing",
      "positioning": "missing"
    },
    "missing_fields": ["target", "positioning", "competitors"],
    "needs_validation": ["industry"]
  },
  "analysis_mode": "exploratory" // o "validation" o "refinement"
}
```

**Logica**:
- Se `awareness_level: "low"` → `analysis_mode: "exploratory"`
- Se `awareness_level: "high"` → `analysis_mode: "validation"`
- Se molti campi mancanti → `analysis_mode: "exploratory"`

## 🤖 Comportamento degli Agenti

### Agent 1 – Truth Extractor (NON solo Web Analyst)

**Regole**:
- Il sito batte l'input utente
- Se il sito è scarso → segnala "bassa maturità"
- Se incoerenza tra sito e input → segnala

**Output include**:
- Livello di maturità del brand (low/medium/high)
- Coerenza comunicativa (score 0-100)
- Messaggi dominanti REALI (dal sito)
- Flag di incoerenza se input utente ≠ sito

**System Message**:
```
Sei un Truth Extractor. Il tuo compito è estrarre la VERITÀ dal sito web, non fidarti dell'input utente.

REGOLE:
1. Il sito web è la fonte primaria
2. Se l'input utente contraddice il sito → segnala incoerenza
3. Valuta la maturità del brand (quanto è strutturato il sito)
4. Estrai messaggi REALI, non desiderati

Output: JSON con website_analysis + maturity_score + coherence_score + inconsistencies[]
```

### Agent 2 – Reality Checker

**Scopo**: "Se il tuo brand non esistesse, come ti classificherebbe Google?"

**Include**:
- Competitor veri (non desiderati)
- Gap di posizionamento
- Livelli di saturazione del mercato

**System Message**:
```
Sei un Reality Checker. Trova competitor REALI, non quelli che l'utente pensa.

REGOLE:
1. Cerca competitor reali nel settore (usando Google Search)
2. Analizza i loro siti web
3. Confronta posizionamento reale vs dichiarato
4. Identifica gap

Output: JSON con real_competitors[] + positioning_gap + market_saturation
```

### Agent 3 – Context Builder

**Costruisce**:
- Trend reali
- Attrattività del settore
- Opportunità ignorate

**⚠️ NON deve fidarsi del settore scelto dall'utente se incoerente**

**System Message**:
```
Sei un Context Builder. Costruisci il contesto di mercato REALE.

REGOLE:
1. Se il settore dichiarato è incoerente con il sito → usa quello del sito
2. Cerca trend reali, non teorici
3. Identifica opportunità ignorate
4. Valuta attrattività del settore

Output: JSON con market_context + real_industry + trends[] + opportunities[]
```

### Agent 4 – Voice of Market

**Analizza**:
- Recensioni
- Forum
- Social
- SERP tone

**Può dire**:
- "Il brand è poco citato → bassa brand awareness"
- Ed è OK

**System Message**:
```
Sei un Voice of Market Analyst. Analizza come il brand è percepito REALMENTE online.

REGOLE:
1. Cerca recensioni, menzioni, feedback reali
2. Se non trovi nulla → segnala "bassa visibilità"
3. Analizza sentiment oggettivo
4. Identifica gap tra promise e reality

Output: JSON con perception_analysis + visibility_score + sentiment + gaps[]
```

### Agent 5 – Strategic Synthesizer (PIÙ IMPORTANTE)

**DEVE**:
- Distinguere fatti vs ipotesi
- Segnalare incertezze
- Proporre strade alternative

**Output include**:

```json
{
  "brand_master_file": {
    "brand_dna": {...},
    "product_matrix": {...},
    // ... tutti i campi
  },
  "confidence_notes": [
    "Il target cliente è stato dedotto dal contenuto del sito",
    "Non sono emerse recensioni significative",
    "Il settore dichiarato ('marketing') corrisponde al contenuto del sito",
    "Competitor reali trovati: 5 aziende simili"
  ],
  "warnings": [
    "Incoerenza: l'utente ha dichiarato settore 'tutoring' ma il sito parla di 'marketing'",
    "Bassa visibilità online: poche menzioni trovate"
  ],
  "next_steps": [
    {
      "priority": 1,
      "action": "Chiarire target cliente",
      "reason": "Dedotto dal sito ma non esplicito"
    },
    {
      "priority": 2,
      "action": "Differenziarsi su X",
      "reason": "Competitor tutti simili su questo punto"
    }
  ],
  "executive_summary": "Il brand mostra una strategia implicita ben definita nel sito web..."
}
```

**System Message**:
```
Sei un Chief Strategy Officer. Sintetizza TUTTO in un Brand Master File professionale.

REGOLE CRITICHE:
1. Distingui SEMPRE fatti da ipotesi
2. Aggiungi confidence_notes per ogni campo incerto
3. Segnala warnings per incoerenze
4. Genera next_steps operativi
5. Crea executive_summary umano-leggibile

Output: JSON completo con brand_master_file + confidence_notes[] + warnings[] + next_steps[] + executive_summary
```

## 📤 Output Finale (UX per Cliente)

**Il client NON deve vedere solo JSON**

**Devi avere**:

1. **JSON salvato** (machine-usable) → Supabase
2. **Sintesi umana** (executive summary) → Dashboard
3. **Next steps operativi** → Dashboard
4. **Confidence notes** → Dashboard (trasparenza)

**Esempio UI**:

```
┌─────────────────────────────────────┐
│ Brand Master File Generato          │
├─────────────────────────────────────┤
│ ✅ Analisi completata                │
│                                      │
│ Executive Summary:                  │
│ Il tuo brand mostra una strategia   │
│ implicita ben definita...           │
│                                      │
│ ⚠️ Note di Confidenza:               │
│ • Target cliente dedotto dal sito   │
│ • Poche recensioni trovate online   │
│                                      │
│ 🎯 Prossimi Passi:                  │
│ 1. Chiarire target cliente          │
│ 2. Differenziarsi su X              │
│ 3. Ottimizzare SEO per Y            │
└─────────────────────────────────────┘
```

## 🔄 Flusso End-to-End

### Caso A – Cliente MOLTO INFORMATO

**Input**:
- `awareness_level: "high"`
- Tutti i campi compilati
- Sito web strutturato

**Comportamento**:
- Agent 1 verifica il sito
- Agent 2 confronta con competitor noti
- Agent 3 valida il mercato
- Agent 4 confronta "percepito" vs "dichiarato"
- Agent 5 segnala incoerenze e raffinamenti

**Output**:
- Strategia raffinata, non inventata
- Confidence notes: "Validato con dati esterni"
- Next steps: "Raffinare positioning su X"

### Caso B – Cliente POCO INFORMATO (più comune)

**Input**:
- `awareness_level: "low"`
- Solo nome + sito web
- Sito web scarso

**Comportamento**:
- Agent 1 diventa la fonte primaria
- Agent 2 scopre competitor reali
- Agent 3 definisce contesto
- Agent 4 costruisce percezione anche implicita
- Agent 5 costruisce una strategia plausibile

**Output**:
- "Questa è la tua strategia implicita"
- Confidence notes: "Dedotto dal sito web"
- Next steps: "Definire target esplicito"

**QUESTO È IL VERO VALORE**

## 🎨 Componenti UI da Creare

1. **`AdaptiveBrandAnalysisForm.tsx`** - Form progressivo (Step 1-4)
2. **`AnalysisResultsView.tsx`** - Visualizzazione risultati con executive summary
3. **`ConfidenceNotes.tsx`** - Componente per mostrare confidence notes
4. **`NextStepsPanel.tsx`** - Panel con prossimi passi operativi

## 🔧 Modifiche al Workflow n8n

1. **Prepare Data Node** - Aggiungere normalizzazione con confidence levels
2. **Agent 1-5** - Aggiornare system messages per gestire awareness_level
3. **Agent 5** - Aggiungere generazione di confidence_notes, warnings, next_steps, executive_summary
4. **Parse JSON** - Estrarre anche confidence_notes, warnings, next_steps
5. **Update DB** - Salvare anche confidence_notes e next_steps in colonne separate

## 📊 Schema Database Aggiornato

Aggiungere a `brand_identity`:

```sql
ALTER TABLE brand_identity ADD COLUMN IF NOT EXISTS confidence_notes JSONB;
ALTER TABLE brand_identity ADD COLUMN IF NOT EXISTS warnings JSONB;
ALTER TABLE brand_identity ADD COLUMN IF NOT EXISTS next_steps JSONB;
ALTER TABLE brand_identity ADD COLUMN IF NOT EXISTS executive_summary TEXT;
ALTER TABLE brand_identity ADD COLUMN IF NOT EXISTS awareness_level TEXT; -- low, medium, high
ALTER TABLE brand_identity ADD COLUMN IF NOT EXISTS maturity_score INTEGER; -- 0-100
```

## 🚀 Piano di Implementazione

### Fase 1: Modulo Cliente Progressivo
1. Creare `AdaptiveBrandAnalysisForm.tsx` con 4 step
2. Aggiungere campo `awareness_level` al form
3. Aggiornare `submitBrandAnalysis` per includere awareness_level

### Fase 2: Normalizzazione Input
1. Aggiornare "Prepare Data" node in n8n
2. Aggiungere logica di confidence scoring
3. Aggiungere analysis_mode basato su awareness_level

### Fase 3: Agenti Adattivi
1. Aggiornare system messages di Agent 1-5
2. Aggiungere logica condizionale basata su awareness_level
3. Testare con clienti low/medium/high awareness

### Fase 4: Output Arricchito
1. Aggiornare Agent 5 per generare confidence_notes, warnings, next_steps
2. Aggiornare Parse JSON per estrarre questi campi
3. Aggiornare Update DB per salvarli

### Fase 5: UI Risultati
1. Creare `AnalysisResultsView.tsx`
2. Creare `ConfidenceNotes.tsx`
3. Creare `NextStepsPanel.tsx`
4. Integrare in Brand Identity Tabs

## ✅ Metriche di Successo

1. **Riduzione attrito**: Tempo medio compilazione form < 3 minuti
2. **Qualità output**: Confidence notes presenti per ogni campo incerto
3. **Soddisfazione**: Next steps operativi e actionable
4. **Trasparenza**: Zero percezione di "hallucination"

## 🎯 Conclusione

👉 Il workflow tecnico è la base giusta
👉 Il modulo cliente progressivo è la leva di qualità
👉 Il vero valore è trasformare incertezza in chiarezza
👉 La trasparenza (confidence notes) è la chiave per credibilità


# 🚀 Quick Start: Sistema Adattivo Brand Master File

## 🎯 Cosa Abbiamo Creato

Un sistema che trasforma **qualsiasi cliente, anche poco consapevole, in un Brand Master File strutturato e utilizzabile**, distinguendo sempre fatti da ipotesi.

## 📋 Documenti Chiave

1. **[PRODUCT_STRATEGY.md](./PRODUCT_STRATEGY.md)** - Leggi PRIMA questo
   - Visione completa del prodotto
   - Principi fondamentali
   - Architettura funzionale
   - Comportamento agenti

2. **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Piano di implementazione
   - File da creare/modificare
   - Step-by-step
   - Timeline

3. **[workflows/ADAPTIVE_AGENTS_SPEC.md](./workflows/ADAPTIVE_AGENTS_SPEC.md)** - Specifiche agenti
   - Comportamento per ogni awareness level
   - System messages adattivi
   - Output format

## 🔑 Concetti Chiave

### 1. Il Cliente NON è la Fonte della Verità
- Sito web + dati esterni = fonte primaria
- Input utente = orientamento, non verità assoluta

### 2. Awareness Levels
- **Low**: Cliente poco consapevole → Agenti esplorativi
- **Medium**: Cliente parzialmente consapevole → Agenti integrativi
- **High**: Cliente molto consapevole → Agenti validativi

### 3. Output Trasparente
- **Confidence Notes**: Ogni campo incerto ha una nota
- **Warnings**: Incoerenze segnalate chiaramente
- **Next Steps**: Azioni operative prioritarie
- **Executive Summary**: Sintesi umano-leggibile

## 🎨 Modulo Cliente Progressivo

### Step 1: Identità Minima (OBBLIGATORIA)
- Nome azienda ✅
- URL sito web ✅
- Settore (dropdown)
- Paese/mercato

### Step 2: Livello di Consapevolezza (DECISIONALE)
- Radio: "Quanto sei sicuro della tua strategia?"
  - Non abbiamo strategia chiara → `low`
  - Abbiamo idee non strutturate → `medium`
  - Abbiamo strategia definita → `high`

### Step 3: Input Facoltativi
- Prodotto principale
- Target cliente
- Competitor noti
- Obiettivi

### Step 4: Controllo Aspettative
- Messaggio: "Useremo dati reali dal web per analisi oggettiva"

## 🤖 Comportamento Agenti

### Agent 1: Truth Extractor
- **Low**: Sito web = fonte primaria, ignora input se contraddice
- **Medium**: Bilanciamento sito + input
- **High**: Valida input contro sito, segnala incoerenze

### Agent 2: Reality Checker
- **Low**: Scopre competitor reali, ignora dichiarati se non trovati
- **Medium**: Valida dichiarati + aggiunge trovati
- **High**: Analisi approfondita competitor dichiarati

### Agent 3: Context Builder
- **Low**: Determina settore reale, ignora dichiarato se incoerente
- **Medium**: Valida settore, integra
- **High**: Raffina contesto con dati esterni

### Agent 4: Voice of Market
- **Low**: Costruisce percezione anche se poco visibile
- **Medium**: Analizza e confronta con aspettative
- **High**: Valida percezione dichiarata

### Agent 5: Strategic Synthesizer
- **Low**: Costruisce strategia implicita, confidence notes per tutto
- **Medium**: Integra strategia dichiarata + dati
- **High**: Raffina strategia, segnala incoerenze in warnings

## 📤 Output Finale

```json
{
  "brand_master_file": {
    "brand_dna": {...},
    "product_matrix": {...},
    // ... tutti i campi
  },
  "confidence_notes": [
    {
      "field": "target_audience",
      "confidence": "low",
      "source": "deduced_from_website",
      "note": "Dedotto dal sito, non esplicito"
    }
  ],
  "warnings": [
    {
      "type": "inconsistency",
      "message": "Settore dichiarato ≠ contenuto sito"
    }
  ],
  "next_steps": [
    {
      "priority": 1,
      "action": "Chiarire target cliente",
      "reason": "Dedotto ma non esplicito"
    }
  ],
  "executive_summary": "Il brand mostra una strategia implicita..."
}
```

## 🚀 Prossimi Passi

1. Leggi [PRODUCT_STRATEGY.md](./PRODUCT_STRATEGY.md) per capire la visione
2. Leggi [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) per il piano
3. Inizia implementazione dalla Fase 1 (Database Schema)
4. Procedi step-by-step seguendo il piano

## ⚠️ Note Importanti

- **Non fidarsi ciecamente dell'utente**: Il sito web batte sempre l'input
- **Trasparenza è chiave**: Confidence notes per ogni incertezza
- **Proteggere UX**: Messaggio Step 4 previene percezioni negative
- **Comportamento deterministico**: Agenti si comportano sempre nello stesso modo per stesso input


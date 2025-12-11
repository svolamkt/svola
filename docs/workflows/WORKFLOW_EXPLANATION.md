# 📖 Spiegazione Completa: Nexus Deep Analyst Workflow

## 🎯 Cosa Volevo Fare

L'obiettivo era trasformare il workflow esistente (che aveva un singolo agente che generava tutto in una volta) in un **sistema multi-agente sequenziale** dove ogni agente si specializza in un'analisi specifica e passa i dati al successivo.

### Filosofia del Design

**Prima (Workflow Originale):**
```
Webhook → Prepare Data → Single Agent → Parse → Save → Respond
```
- Un solo agente faceva tutto
- Output: JSON completo ma poco approfondito
- Limitato alle informazioni del sito web

**Dopo (Workflow Multi-Agent):**
```
Webhook → Prepare Data → 
  Agent 1 (Website) → Merge 1 → 
  Agent 2 (Competitor) → Merge 2 → 
  Agent 3 (Market) → Merge 3 → 
  Agent 4 (Perception) → Merge 4 → 
  Agent 5 (Synthesis) → Parse → Save → Respond
```
- 5 agenti specializzati
- Ogni agente approfondisce un aspetto specifico
- L'ultimo agente sintetizza tutto in un Brand Master File completo

## 🔄 Come Funziona il Sistema

### 1. **Agent 1: Website Deep Analyzer**
- **Scopo**: Analisi approfondita del sito web dell'azienda
- **Tool**: Read Website (scraping del sito)
- **Input**: URL del sito, nome azienda, settore
- **Output**: Analisi completa del sito (meta tag, struttura, contenuto, SEO, CTA, funnel)
- **Perché separato**: Permette analisi dettagliata del sito prima di cercare competitor

### 2. **Agent 2: Competitor Intelligence**
- **Scopo**: Trovare e analizzare i competitor diretti
- **Tools**: Read Website (per analizzare siti competitor), Google Search Tool (per trovare competitor)
- **Input**: Dati da Agent 1 + nome azienda + settore
- **Output**: Lista competitor con analisi approfondita (punti di forza/debolezza, pricing, positioning)
- **Perché separato**: Richiede ricerca esterna e analisi di più siti

### 3. **Agent 3: Market Researcher**
- **Scopo**: Analisi del mercato e trend del settore
- **Tool**: Google Search Tool (per cercare trend, news, market data)
- **Input**: Dati da Agent 2 (include settore)
- **Output**: Market size, growth rate, trends, opportunities, threats
- **Perché separato**: Richiede ricerca di dati di mercato esterni

### 4. **Agent 4: Brand Perception Analyzer**
- **Scopo**: Analizzare come il brand è percepito online
- **Tool**: Google Search Tool (per cercare reviews, sentiment, menzioni)
- **Input**: Dati da Agent 3 (include nome azienda)
- **Output**: Sentiment, review score, key themes, pain points, reputation gaps
- **Perché separato**: Richiede ricerca di feedback e menzioni online

### 5. **Agent 5: Strategic Synthesizer**
- **Scopo**: Sintetizzare tutti i dati raccolti in un Brand Master File completo
- **Tool**: Nessuno (solo sintesi, non ricerca)
- **Input**: Tutti i dati merged da Agent 1-4
- **Output**: Brand Master File completo in formato JSON finale
- **Perché separato**: Permette sintesi professionale con tutti i dati disponibili

## 🔗 Sistema di Merge dei Dati

Ogni agente passa i suoi dati al successivo tramite nodi "Merge":

```
Agent 1 Output → Merge 1 → 
  { originalData + agent1_website_analysis } → Agent 2

Agent 2 Output → Merge 2 → 
  { previousData + agent2_competitor_analysis } → Agent 3

Agent 3 Output → Merge 3 → 
  { previousData + agent3_market_research } → Agent 4

Agent 4 Output → Merge 4 → 
  { previousData + agent4_brand_perception } → Agent 5
```

**Agent 5** riceve quindi:
- Dati originali (form_data, organization_id)
- Analisi sito web (Agent 1)
- Analisi competitor (Agent 2)
- Ricerca mercato (Agent 3)
- Analisi percezione (Agent 4)

E sintetizza tutto in un JSON finale strutturato.

## ⚙️ Connessioni Corrette

### Connessioni Main (Flusso Dati)
Sono corrette: ogni nodo passa i dati al successivo tramite `main`.

### Connessioni Tool (ai_tool)
**Problema identificato**: Nel workflow attuale, i tool hanno connessioni `main` invece di `ai_tool`.

**Correzione necessaria:**
- **Read Website Tool** → `ai_tool` → Agent 1, Agent 2
- **Google Search Tool** → `ai_tool` → Agent 2, Agent 3, Agent 4

### Connessioni Language Model (ai_languageModel)
**Problema identificato**: Nel workflow attuale, i Language Models hanno connessioni `main` invece di `ai_languageModel`.

**Correzione necessaria:**
- Ogni **Google Gemini Chat Model** → `ai_languageModel` → rispettivo Agent

## 📊 Struttura Output Finale

L'Agent 5 genera un JSON con questa struttura:

```json
{
  "brand_dna": {
    "purpose": "...",
    "mission": "...",
    "values": [],
    "archetypes": [],
    "tone_of_voice": "..."
  },
  "product_matrix": {
    "value_proposition": "...",
    "usp": "...",
    "benefits": [],
    "pricing_strategy": "...",
    "differentiators": []
  },
  "customer_persona": {
    "personas": [],
    "pain_points": [],
    "triggers": [],
    "buying_journey": {}
  },
  "market_context": {
    "market_size": "...",
    "growth_rate": "...",
    "trends": [],
    "opportunities": [],
    "threats": []
  },
  "competitors_data": {
    "direct_competitors": [],
    "positioning_map": "...",
    "competitive_advantages": [],
    "competitive_threats": []
  },
  "brand_perception": {
    "sentiment": "...",
    "review_score": 0,
    "review_count": 0,
    "key_themes": [],
    "reputation_gaps": []
  },
  "marketing_assets": {
    "funnel": "...",
    "channels": [],
    "content_strategy": "...",
    "seo_keywords": [],
    "cta_strategy": []
  },
  "swot_analysis": {
    "strengths": [],
    "weaknesses": [],
    "opportunities": [],
    "threats": []
  },
  "strategic_recommendations": {
    "immediate_actions": [],
    "short_term_goals": [],
    "long_term_vision": [],
    "risks_to_mitigate": [],
    "opportunities_to_seize": []
  }
}
```

## ⚠️ Problemi da Risolvere

### 1. Connessioni Tool e Language Model
Le connessioni devono essere corrette nell'interfaccia n8n:
- Rimuovere connessioni `main` dai Tool e Language Models
- Aggiungere connessioni `ai_tool` e `ai_languageModel`

### 2. Google Search Tool
Attualmente è un placeholder. Deve essere implementato con:
- Google Custom Search API (gratuito, 100 query/giorno)
- O SerpApi (a pagamento)
- O HTTP Request con scraping

### 3. Prompt degli Agent
Alcuni agenti potrebbero avere prompt troppo generici. Potrebbero essere ottimizzati per output più specifici.

## ✅ Vantaggi di Questa Struttura

1. **Specializzazione**: Ogni agente si concentra su un aspetto specifico
2. **Modularità**: Facile aggiungere/rimuovere agenti
3. **Debugging**: Più facile identificare dove si verifica un problema
4. **Qualità**: Analisi più approfondita grazie alla specializzazione
5. **Scalabilità**: Facile aggiungere nuovi agenti per nuove analisi

## 📝 Note di Implementazione

- **Tempo di esecuzione**: 5-10 minuti (5 agenti sequenziali)
- **Costi API**: 5x chiamate Gemini per esecuzione
- **Error Handling**: Ogni Merge node gestisce errori gracefully
- **Compatibilità**: Mantiene stesso formato output finale del workflow originale

## 🔧 Come Correggere il Workflow

1. Apri il workflow in n8n
2. Per ogni Language Model:
   - Rimuovi connessione `main` all'Agent
   - Aggiungi connessione `ai_languageModel` all'Agent
3. Per ogni Tool:
   - Rimuovi connessioni `main` agli Agent
   - Aggiungi connessioni `ai_tool` agli Agent
4. Verifica che ogni Agent abbia:
   - `promptType: "define"`
   - Campo `text` con espressione valida
5. Testa il workflow

## 📄 File Correlati

- `WORKFLOW_ANALYSIS.md` - Analisi dettagliata dei problemi
- `NEXUS_DEEP_ANALYST_CORRECTED.json` - JSON corretto del workflow
- `IMPLEMENTATION_GUIDE.md` - Guida all'implementazione



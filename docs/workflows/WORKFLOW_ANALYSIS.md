# 🔍 Analisi Completa: Nexus Deep Analyst Workflow

## 📋 Obiettivo dell'Implementazione

L'obiettivo era trasformare il workflow esistente (che aveva un singolo agente) in un **sistema multi-agente sequenziale** che esegue analisi approfondite in 5 fasi specializzate:

1. **Agent 1**: Analisi approfondita del sito web
2. **Agent 2**: Intelligence sui competitor
3. **Agent 3**: Ricerca di mercato e trend
4. **Agent 4**: Analisi percezione brand online
5. **Agent 5**: Sintesi strategica finale

Ogni agente raccoglie dati specifici, e l'ultimo agente (Agent 5) sintetizza tutto in un Brand Master File completo.

## ⚠️ Problemi Identificati nella Struttura Attuale

### 1. **Connessioni Tool Errate**

I nodi Tool (Read Website, Google Search Tool) e Language Model (Google Gemini) hanno connessioni **"main"** invece delle connessioni corrette:

- **Language Models** devono essere connessi come `ai_languageModel` → `ai_languageModel`
- **Tools** devono essere connessi come `ai_tool` → `ai_tool`

**Problema attuale:**
```json
"Google Gemini Chat Model 2": {
  "main": [  // ❌ SBAGLIATO
    [{"node": "Agent 2: Competitor Intelligence"}]
  ]
}
```

**Dovrebbe essere:**
```json
"Google Gemini Chat Model 2": {
  "ai_languageModel": [  // ✅ CORRETTO
    [{"node": "Agent 2: Competitor Intelligence", "type": "ai_languageModel"}]
  ]
}
```

### 2. **Connessione Errata di Read Website**

Il nodo "Read Website" ha una connessione `main` a "Agent 2" che non dovrebbe esistere. Read Website è un **tool**, non un nodo di flusso dati.

**Problema:**
```json
"Read Website": {
  "main": [  // ❌ Questa connessione non dovrebbe esistere
    [{"node": "Agent 2: Competitor Intelligence"}]
  ]
}
```

### 3. **Struttura dei Merge Nodes**

I nodi Merge funzionano correttamente, ma potrebbero essere ottimizzati per passare solo i dati necessari invece di tutto l'oggetto.

## ✅ Struttura Corretta del Workflow

### Flusso Dati (Main Connections)

```
Webhook → Prepare Data → 
  Agent 1 → Merge 1 → 
  Agent 2 → Merge 2 → 
  Agent 3 → Merge 3 → 
  Agent 4 → Merge 4 → 
  Agent 5 → Parse JSON → Extract Org ID → Check Org ID → Update DB → Respond
```

### Connessioni Tool (ai_tool)

- **Read Website Tool** → `ai_tool` → Agent 1, Agent 2
- **Google Search Tool** → `ai_tool` → Agent 2, Agent 3, Agent 4

### Connessioni Language Model (ai_languageModel)

- **Google Gemini Chat Model** → `ai_languageModel` → Agent 1
- **Google Gemini Chat Model 2** → `ai_languageModel` → Agent 2
- **Google Gemini Chat Model 3** → `ai_languageModel` → Agent 3
- **Google Gemini Chat Model 4** → `ai_languageModel` → Agent 4
- **Google Gemini Chat Model 5** → `ai_languageModel` → Agent 5

## 📄 JSON Corretto del Workflow

Il JSON completo e corretto è disponibile nel file `NEXUS_DEEP_ANALYST_CORRECTED.json` (vedi sezione seguente).

## 🔧 Cosa Deve Essere Corretto

### 1. Rimuovere Connessioni Errate

- Rimuovere tutte le connessioni `main` dai nodi Language Model
- Rimuovere la connessione `main` da "Read Website" a "Agent 2"
- Rimuovere le connessioni `main` da "Google Search Tool"

### 2. Aggiungere Connessioni Corrette

- Aggiungere connessioni `ai_languageModel` per tutti i 5 Language Models
- Aggiungere connessioni `ai_tool` per Read Website (Agent 1 e Agent 2)
- Aggiungere connessioni `ai_tool` per Google Search Tool (Agent 2, 3, 4)

### 3. Verificare Prompt Type

Tutti gli Agent devono avere:
- `promptType: "define"`
- Campo `text` con espressione n8n valida

## 📊 Dettaglio di Ogni Agente

### Agent 1: Website Deep Analyzer
- **Input**: Dati dal form (website_url, company_name, etc.)
- **Tool**: Read Website
- **Output**: Analisi completa del sito (meta, struttura, contenuto, SEO)
- **Merge**: Combina output con dati originali

### Agent 2: Competitor Intelligence
- **Input**: Dati merged da Agent 1 + form_data
- **Tools**: Read Website (per analizzare siti competitor), Google Search Tool
- **Output**: Lista competitor con analisi approfondita
- **Merge**: Combina con dati precedenti

### Agent 3: Market Researcher
- **Input**: Dati merged da Agent 2 (include settore, industry)
- **Tool**: Google Search Tool
- **Output**: Market size, trends, opportunities, threats
- **Merge**: Combina con dati precedenti

### Agent 4: Brand Perception Analyzer
- **Input**: Dati merged da Agent 3 (include company_name)
- **Tool**: Google Search Tool
- **Output**: Sentiment, reviews, perception analysis
- **Merge**: Combina con dati precedenti

### Agent 5: Strategic Synthesizer
- **Input**: Tutti i dati merged (Agent 1-4)
- **Tool**: Nessuno (solo sintesi)
- **Output**: Brand Master File completo in formato JSON finale
- **No Merge**: Va direttamente a Parse JSON

## 🎯 Output Finale Atteso

L'Agent 5 genera un JSON con questa struttura:

```json
{
  "brand_dna": {...},
  "product_matrix": {...},
  "customer_persona": {...},
  "market_context": {...},
  "competitors_data": {...},
  "brand_perception": {...},
  "marketing_assets": {...},
  "swot_analysis": {...},
  "strategic_recommendations": {...}
}
```

Questo JSON viene poi:
1. Parsato da "Parse AI JSON"
2. Arricchito con `organization_id` da "Extract Org ID"
3. Validato da "Check Org ID"
4. Salvato in Supabase da "Update DB"
5. Restituito al client via "Respond to Webhook"

## ⚙️ Configurazione Necessaria

### Credenziali
- **Google Gemini**: 5 istanze (una per agente)
- **Supabase**: 1 istanza per Update DB

### Environment Variables
- Nessuna richiesta (tutto configurato nei nodi)

### Webhook
- **Path**: `604358c0-ee69-4e03-bd67-9f4f50dba13c`
- **Method**: POST
- **Response Mode**: responseNode

## 🚨 Note Critiche

1. **Google Search Tool è un placeholder**: Deve essere implementato con Google Custom Search API o alternativa
2. **Tempo di esecuzione**: 5-10 minuti (5 agenti sequenziali)
3. **Costi**: 5x chiamate Gemini API per esecuzione
4. **Error Handling**: Ogni Merge node gestisce errori gracefully

## 📝 Prossimi Passi

1. ✅ Correggere connessioni tool e language model
2. ✅ Testare ogni agente singolarmente
3. ✅ Testare flusso completo
4. ⏳ Implementare Google Search Tool
5. ⏳ Ottimizzare performance se necessario



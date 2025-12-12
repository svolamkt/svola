# 🚀 Guida all'Implementazione: Nexus Deep Analysis Complete

## 📋 Panoramica

Questo workflow implementa il sistema **Nexus Deep Analysis** completo con 5 agenti specializzati che lavorano in sequenza per generare un Brand Master File professionale.

## 🎯 Struttura del Workflow

```
1. Webhook Trigger
   ↓
2. Prepare Data
   ↓
3. Agent 1: Website Deep Analyzer
   ↓
4. Agent 2: Competitor Intelligence
   ↓
5. Agent 3: Market Researcher
   ↓
6. Agent 4: Brand Perception Analyzer
   ↓
7. Agent 5: Strategic Synthesizer
   ↓
8. Parse & Validate Final JSON
   ↓
9. Check Organization ID
   ↓
10. Save to Supabase
   ↓
11. Respond to Webhook
```

## 📥 Importazione

1. Apri n8n
2. Clicca su "Workflows" → "Import from File"
3. Seleziona `NEXUS_DEEP_ANALYSIS_COMPLETE.json`
4. Il workflow verrà importato con tutti i nodi

## ⚙️ Configurazione

### 1. Credenziali Google Gemini

Tutti gli agenti usano Google Gemini. Assicurati di avere le credenziali configurate:
- **Credential ID**: `H1dWggEz3kfTfkhx`
- **Nome**: "Google Gemini(PaLM) Api account"

Se non hai queste credenziali:
1. Crea nuove credenziali Google Gemini in n8n
2. Aggiorna tutti i nodi "Google Gemini Chat Model" (5 nodi)

### 2. Credenziali Supabase

Il nodo "Save to Supabase" richiede credenziali Supabase:
1. Clicca sul nodo "Save to Supabase"
2. Configura le credenziali con:
   - Supabase URL
   - Supabase Service Role Key (per bypassare RLS)

### 3. Webhook URL

Il webhook è configurato con path: `deep-analysis`

**URL completo**: `https://[n8n-instance]/webhook/604358c0-ee69-4e03-bd67-9f4f50dba13c`

**Nota**: Se importi il workflow, n8n genererà un nuovo webhook ID. Copia l'URL dal nodo "Webhook Trigger".

### 4. Google Search Tool (IMPORTANTE)

Il tool "Google Search Tool" è attualmente un **placeholder**. Per funzionare correttamente, devi implementare una delle seguenti opzioni:

#### Opzione A: Google Custom Search API (Gratuito, 100 query/giorno)

1. Ottieni una Google Custom Search Engine ID e API Key
2. Modifica il nodo "Google Search Tool" con questo codice:

```javascript
const query = inputObject.query || inputObject.input || '';
if (!query) return { error: 'No search query provided' };

const CSE_ID = 'YOUR_CSE_ID';
const API_KEY = 'YOUR_API_KEY';
const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}`;

try {
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    query: query,
    results: (data.items || []).map(item => ({
      title: item.title,
      snippet: item.snippet,
      url: item.link
    })),
    total_results: data.searchInformation?.totalResults || 0
  };
} catch (e) {
  return { error: `Search failed: ${e.message}` };
}
```

#### Opzione B: SerpApi (A pagamento, più completo)

1. Ottieni una SerpApi key
2. Usa il nodo n8n "SerpApi" invece del Code Tool

#### Opzione C: HTTP Request (Scraping diretto)

Usa un servizio di scraping come ScraperAPI o Bright Data.

## 📤 Payload di Input

Il webhook si aspetta un payload JSON con questa struttura:

```json
{
  "website_url": "https://example.com",
  "company_name": "Example Company",
  "industry": "marketing",
  "company_description": "Descrizione azienda",
  "organization_id": "uuid-dell-organizzazione",
  "form_data": {
    "target_audience": "...",
    "competitors": "...",
    "additional_info": "..."
  }
}
```

## 🔄 Flusso di Esecuzione

### Agent 1: Website Deep Analyzer
- **Input**: URL del sito web
- **Tool**: Read Website Tool
- **Output**: Analisi completa del sito (meta tag, struttura, SEO, CTA, funnel)

### Agent 2: Competitor Intelligence
- **Input**: Nome azienda, settore
- **Tools**: Read Website Tool, Google Search Tool
- **Output**: Lista competitor + analisi approfondita

### Agent 3: Market Researcher
- **Input**: Settore
- **Tool**: Google Search Tool
- **Output**: Trend, market size, opportunità, minacce

### Agent 4: Brand Perception Analyzer
- **Input**: Nome azienda
- **Tool**: Google Search Tool
- **Output**: Sentiment, reviews, percezione, gap

### Agent 5: Strategic Synthesizer
- **Input**: Tutti i dati raccolti dai 4 agenti precedenti
- **Output**: Brand Master File completo in formato JSON

## 💾 Salvataggio in Supabase

Il workflow salva i dati nella tabella `brand_identity` con questa mappatura:

- `swot_analysis` → `brand_master_file.swot_analysis`
- `market_research` → `brand_master_file.market_context`
- `competitors` → `brand_master_file.competitors_data`
- `target_audience` → `brand_master_file.customer_persona`
- `tone_of_voice` → `JSON.stringify(brand_master_file.brand_dna)`

**Nota**: Alcuni campi JSONB potrebbero richiedere colonne aggiuntive. Verifica `DATABASE_SCHEMA.md`.

## ⚠️ Limitazioni Note

1. **Google Search Tool**: Attualmente placeholder. Implementare una delle opzioni sopra.
2. **Tempo di esecuzione**: 5-10 minuti (5 agenti in sequenza)
3. **Costi API**: Google Gemini ha costi per richieste. Monitora l'uso.
4. **Rate Limiting**: Google Custom Search ha limite di 100 query/giorno (gratuito)

## 🧪 Testing

1. Attiva il workflow
2. Usa un tool come Postman o curl per inviare una richiesta POST al webhook URL
3. Monitora l'esecuzione in n8n
4. Verifica i dati salvati in Supabase

### Esempio cURL

```bash
curl -X POST https://[n8n-instance]/webhook/604358c0-ee69-4e03-bd67-9f4f50dba13c \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://example.com",
    "company_name": "Example Company",
    "industry": "marketing",
    "company_description": "A marketing agency",
    "organization_id": "your-org-uuid"
  }'
```

## 🔧 Troubleshooting

### Errore: "No prompt specified"
- Verifica che tutti i nodi Agent abbiano `promptType: "define"` e un campo `text` valido

### Errore: "Organization ID not found"
- Verifica che il payload includa `organization_id`
- Controlla il nodo "Check Organization ID"

### Errore: "Supabase update failed"
- Verifica credenziali Supabase
- Controlla che la tabella `brand_identity` esista
- Verifica che `organization_id` sia un UUID valido

### Errore: "Google Search Tool returned error"
- Implementa una delle opzioni per Google Search (vedi sopra)
- Verifica che le API keys siano valide

## 📚 Documentazione Correlata

- [DEEP_ANALYSIS_SYSTEM.md](../DEEP_ANALYSIS_SYSTEM.md) - Architettura completa
- [FEASIBILITY_ANALYSIS.md](../FEASIBILITY_ANALYSIS.md) - Analisi fattibilità
- [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Schema database

## 🚀 Prossimi Passi

1. ✅ Importa il workflow in n8n
2. ✅ Configura credenziali (Google Gemini, Supabase)
3. ⏳ Implementa Google Search Tool (una delle opzioni)
4. ⏳ Testa con dati reali
5. ⏳ Monitora performance e costi
6. ⏳ Ottimizza se necessario




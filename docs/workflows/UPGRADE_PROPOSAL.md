# 🔄 Proposta di Upgrade: Nexus Deep Analysis Multi-Agent

## 📊 Analisi Workflow Attuale

### ✅ Cosa Funziona (NON TOCCARE)

1. **Webhook Trigger** - Funziona perfettamente
   - Path: `604358c0-ee69-4e03-bd67-9f4f50dba13c`
   - HTTP Method: POST
   - Response Mode: responseNode

2. **Prepare Data** - Gestisce body correttamente
   - Risolve "Body already read" error
   - Estrae `organization_id` e `form_data`
   - Costruisce messaggio per Agent

3. **Deep Research Agent** - Agent principale funzionante
   - System message ottimizzato
   - Usa tool "Read Website"
   - Genera JSON con 7 pilastri

4. **Read Website Tool** - Tool avanzato funzionante
   - Estrae meta tag, H1, H2
   - Pulisce contenuto
   - Output strutturato

5. **Parse AI JSON** - Parsing funzionante
   - Estrae JSON dall'output AI
   - Gestisce errori

6. **Extract Org ID** - Estrazione funzionante
   - Recupera `organization_id` da Prepare Data
   - Aggiunge ai dati parsati

7. **Check Org ID** - Validazione funzionante
   - If node con `onError: continueErrorOutput`
   - Route corretto a Update DB o Respond

8. **Update DB** - Supabase update funzionante
   - Mappatura corretta dei campi JSONB
   - Credenziali configurate

9. **Respond to Webhook** - Response funzionante

### 🎯 Strategia di Upgrade

**Approccio**: Aggiungere agenti in sequenza DOPO "Deep Research Agent" e PRIMA di "Parse AI JSON"

```
Workflow Attuale:
Webhook → Prepare Data → Deep Research Agent → Parse AI JSON → Extract Org ID → Check Org ID → Update DB → Respond

Workflow Proposto:
Webhook → Prepare Data → 
  Agent 1 (Website) → Merge 1 → 
  Agent 2 (Competitor) → Merge 2 → 
  Agent 3 (Market) → Merge 3 → 
  Agent 4 (Perception) → Merge 4 → 
  Agent 5 (Synthesis) → 
  Parse AI JSON → Extract Org ID → Check Org ID → Update DB → Respond
```

## 🔧 Modifiche Proposte

### 1. Modificare "Deep Research Agent" → "Agent 1: Website Deep Analyzer"
- **Cambio minimo**: Solo il nome e system message più specifico
- **Tool**: Mantiene "Read Website" (già funzionante)
- **Output**: Analisi sito web (mantiene stesso formato)

### 2. Aggiungere "Merge Agent 1 Data"
- **Tipo**: Code node
- **Posizione**: Dopo Agent 1, prima di Agent 2
- **Funzione**: Combina output Agent 1 con dati originali

### 3. Aggiungere "Agent 2: Competitor Intelligence"
- **Tipo**: AI Agent
- **Model**: Google Gemini (stesso del workflow)
- **Tools**: 
  - Read Website (riutilizza tool esistente)
  - Google Search Tool (NUOVO - da creare)
- **Input**: Dati da Merge 1 + contesto competitor
- **Output**: Analisi competitor

### 4. Aggiungere "Google Search Tool"
- **Tipo**: Code Tool
- **Funzione**: Placeholder per ora (da implementare con Google Custom Search API)
- **Usato da**: Agent 2, 3, 4

### 5. Aggiungere "Merge Agent 2 Data"
- **Tipo**: Code node
- **Funzione**: Combina output Agent 2 con dati precedenti

### 6. Aggiungere "Agent 3: Market Researcher"
- **Tipo**: AI Agent
- **Model**: Google Gemini
- **Tools**: Google Search Tool
- **Output**: Analisi mercato e trend

### 7. Aggiungere "Merge Agent 3 Data"
- **Tipo**: Code node

### 8. Aggiungere "Agent 4: Brand Perception Analyzer"
- **Tipo**: AI Agent
- **Model**: Google Gemini
- **Tools**: Google Search Tool
- **Output**: Analisi percezione e sentiment

### 9. Aggiungere "Merge Agent 4 Data"
- **Tipo**: Code node

### 10. Aggiungere "Agent 5: Strategic Synthesizer"
- **Tipo**: AI Agent
- **Model**: Google Gemini
- **Tools**: Nessuno (solo sintesi)
- **Input**: Tutti i dati dai 4 agenti precedenti
- **Output**: Brand Master File completo (stesso formato attuale)
- **Connessione**: Va direttamente a "Parse AI JSON" (esistente)

## ⚠️ Punti Critici

### 1. Mantenere Compatibilità
- **Parse AI JSON** deve ricevere lo stesso formato JSON finale
- **Update DB** deve ricevere la stessa struttura dati
- **Extract Org ID** deve funzionare come prima

### 2. Gestione Errori
- Ogni Merge node deve gestire dati mancanti
- Se un agente fallisce, il workflow deve continuare
- Usare `onError: continueErrorOutput` dove necessario

### 3. Performance
- 5 agenti in sequenza = ~5-10 minuti
- Considerare webhook asincrono in futuro
- Per ora mantenere sincrono (funziona)

### 4. Costi API
- 5 agenti = 5x chiamate Gemini
- Monitorare costi
- Possibile ottimizzazione: alcuni agenti possono essere opzionali

## 📋 Piano di Implementazione

### Fase 1: Preparazione (Sicura)
1. ✅ Analisi workflow esistente
2. ✅ Creazione proposta
3. ⏳ Approvazione

### Fase 2: Implementazione Incrementale
1. ⏳ Aggiungere Agent 2 (Competitor) + Merge 1
2. ⏳ Testare con workflow esistente
3. ⏳ Aggiungere Agent 3 (Market) + Merge 2
4. ⏳ Testare
5. ⏳ Aggiungere Agent 4 (Perception) + Merge 3
6. ⏳ Testare
7. ⏳ Aggiungere Agent 5 (Synthesis) + Merge 4
8. ⏳ Test finale

### Fase 3: Ottimizzazione
1. ⏳ Implementare Google Search Tool (Google Custom Search API)
2. ⏳ Ottimizzare system messages
3. ⏳ Aggiungere error handling avanzato

## ✅ Vantaggi di Questo Approccio

1. **Non rompe codice esistente**: Tutti i nodi funzionanti rimangono intatti
2. **Incrementale**: Possiamo testare dopo ogni aggiunta
3. **Rollback facile**: Possiamo rimuovere agenti se necessario
4. **Compatibilità**: Output finale identico al workflow attuale

## 🚨 Rischi e Mitigazione

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Workflow troppo lento | Media | Testare performance, considerare asincrono |
| Costi API elevati | Alta | Monitorare, ottimizzare system messages |
| Errori in cascata | Bassa | Error handling robusto, test incrementali |
| Incompatibilità dati | Bassa | Mantenere stesso formato JSON finale |

## 📝 Prossimi Passi

1. **Approvazione proposta** ✅
2. **Implementazione con MCP n8n** ⏳
3. **Test incrementale** ⏳
4. **Documentazione aggiornata** ⏳

---

**Vuoi che proceda con l'implementazione usando MCP n8n?**


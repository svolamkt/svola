# 📖 Guida Importazione Workflow Adattivo

## 1. Importazione in n8n

1. Scarica il file `NEXUS_DEEP_ANALYST_ADAPTIVE.json`
2. Apri n8n
3. Crea un nuovo workflow o apri quello esistente ("Nexus Deep Analyst")
4. Clicca sui tre puntini in alto a destra → "Import from File"
5. Seleziona il file scaricato
6. Se importi in un workflow esistente, cancella i vecchi nodi per evitare duplicati (o usa un nuovo workflow per test)

## 2. Configurazione Credenziali

Verifica che i seguenti nodi abbiano le credenziali corrette:
- **Chat Webhook**: ID webhook corretto (già impostato, ma verifica)
- **Google Gemini Chat Model (1-5)**: Credenziali "Google Gemini(PaLM) Api account"
- **Update DB**: Credenziali "SUPABASESVOLA"

## 3. Cosa è Cambiato

Questo workflow implementa la logica **Adattiva**:

### A. Nodo "Prepare Data"
- Calcola `awareness_level` (low/medium/high)
- Prepara il prompt iniziale in base al livello di consapevolezza
- Definisce `analysis_mode`

### B. Agenti 1-5
- I `System Message` ora sono dinamici (Espressioni)
- Cambiano istruzioni in base a `awareness_level`
  - Esempio: Se `low`, l'Agent 1 si fida solo del sito web. Se `high`, valida l'input utente.

### C. Output
- Il sistema ora genera e salva:
  - `confidence_notes` (Note di trasparenza)
  - `warnings` (Incoerenze)
  - `next_steps` (Azioni raccomandate)
  - `executive_summary` (Sintesi umana)
  - `maturity_score` (Punteggio 0-100)

## 4. Test

1. Vai nella Dashboard Nexus AI
2. Usa il nuovo form progressivo "Azienda" (nel tab "Azienda")
3. Scegli un livello di consapevolezza diverso per vedere risultati diversi
4. Controlla il tab "Risultati" dopo l'analisi


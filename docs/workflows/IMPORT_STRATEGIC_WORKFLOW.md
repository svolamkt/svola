# 🚀 Importazione Workflow "Nexus Deep Analyst Strategic"

Hai appena fatto un upgrade significativo al tuo sistema. Ora hai un "Consulente Strategico" invece di un semplice compilatore di moduli.

## 1. Importa il Nuovo Workflow
1. Apri **n8n**.
2. Crea un **nuovo workflow** vuoto.
3. Clicca sui **3 puntini** in alto a destra → **Import from File**.
4. Seleziona il file `svola/docs/workflows/NEXUS_DEEP_ANALYST_STRATEGIC.json`.

## 2. Configura le Credenziali
Assicurati che i seguenti nodi abbiano le credenziali corrette (dovrebbero essere mantenute, ma verifica):
*   **Google Gemini Model**: Usa le tue credenziali Google PaLM/Gemini.
*   **Update DB (Supabase)**: Usa le tue credenziali Supabase.

## 3. Attiva il Workflow
1. Clicca su **Save**.
2. Attiva lo switch **Active** in alto a destra.
3. **IMPORTANTE:** Copia il nuovo **Webhook URL** (Production) dal nodo "Strategic Webhook".
4. Vai su **Vercel** → Settings → Environment Variables.
5. Aggiorna `N8N_BRAND_ANALYST_WEBHOOK_URL` con il nuovo URL.

## 4. Test
Vai nella dashboard "Brain" e prova a inserire un'idea (senza sito web) o un business esistente. Vedrai la differenza!


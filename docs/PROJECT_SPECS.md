# NEXUS AI - Product Requirements Document
## Hybrid Growth OS (Marketing + Sales)

---

## 1. Product Vision

**Nexus AI** è un Growth Operating System che combina **Inbound Marketing** (Social/Content) e **Outbound Sales** (Lead Gen/Cold Outreach).

**Filosofia Centrale: "Intelligenza Proattiva"**

I software tradizionali aspettano l'input dell'utente.  
**Nexus AI** lavora in background (tramite agenti n8n) e genera "Proposte" (bozze di post, email, strategie) che l'utente deve semplicemente revisionare e approvare tramite un Feed centralizzato.

**Proposta di Valore Chiave**:  
L'utente agisce come il **"Manager"**, mentre l'AI (n8n + Supabase Vector Store) agisce come l'**"Impiegato Operativo"**.

---

## 2. Core Modules

### A. The Brain (Strategia e Contesto)
Il centro di conoscenza che rende l'AI intelligente e allineata al brand.

- **Brand Identity:** 
  - Informazioni azienda (nome, descrizione, settore)
  - Brand Kit (colori, logo, tipografia)
  - Tono di Voce (dettagliato con JSONB)
  - Parole proibite e messaggi chiave
  - Analisi strategica completa (SWOT, market research, competitor, target audience)
  - Vedi [DEEP_ANALYSIS_SYSTEM.md](./DEEP_ANALYSIS_SYSTEM.md) per il sistema di analisi avanzato

- **Vector Store (RAG):** 
  - Sistema RAG dove gli utenti caricano PDF (Case Studies, Brochure)
  - Vettorializzazione con Supabase pgvector
  - L'AI usa questo per scrivere contenuti context-aware

- **Strategy Documents:** 
  - Documenti strutturati interattivi per Analisi SWOT e Buyer Personas
  - Generati da AI durante onboarding o aggiornati proattivamente

### B. The Hunter (Lead Generation)
Un modulo per cercare e targettizzare potenziali clienti.

- **Interfaccia di Ricerca:** L'utente inserisce criteri (es. "Direttori Marketing a Milano")
- **Scraping:** n8n attiva scrapers esterni
- **Enrichment:** Sistema trova email, telefoni e profili LinkedIn
- **Vista Tabellare:** Mostra i lead scrapati (Nome, Azienda, Email, LinkedIn)
- **Azione:** Seleziona lead → Clicca "Genera Campagna Outreach" → Crea card nel "Feed"

### C. The Feed (Il Centro di Comando)
La homepage e il cuore del sistema. Agisce come un feed di social media, ma per i task lavorativi.

**Funzionalità**: Mostra un flusso di Proposal Cards (Schede Proposta).

**Tipi di Card:**
1. **Social Proposal:** "Ho trovato questa notizia in trend. Ecco una bozza per un post LinkedIn."
2. **Outreach Proposal:** "Ho trovato un nuovo Lead che corrisponde ai criteri. Ecco una bozza di email a freddo."
3. **Strategy Proposal:** "Il Competitor X ha aggiornato i prezzi. Aggiorniamo la SWOT?"

**Azioni Utente:**
- **Approva:** Lancia l'automazione per eseguire il task (Pubblica/Invia)
- **Modifica:** Apre una modale per ritoccare il testo prima di approvare
- **Rifiuta:** Rimuove la card e insegna all'AI (tramite feedback loop)
- **Posticipa (Snooze):** Nasconde per 24h

### D. Integrations Hub (Il Sistema Nervoso)
Pagina impostazioni per gestire connessioni esterne.

- **Gestione OAuth:** Connessione a LinkedIn, Facebook, Instagram (token salvati criptati)
- **Connessione Email:** Collegamento Gmail/Outlook per invio outreach
- **Generatore Webhook:** Creazione webhook personalizzati per ricevere dati da CRM esterni

---

## 3. User Journey

1. **Onboarding:** User definisce Strategy (SWOT) & Brand Voice tramite form o chat AI
2. **Discovery:** User attiva "The Hunter" per trovare lead o aspetta "News Watcher"
3. **Proposal:** n8n genera bozze (Posts o Emails) basate su Strategy + Leads
4. **Approval:** User revisiona il Feed e approva con un click
5. **Execution:** Sistema esegue l'azione e traccia i risultati

---

## 4. Stack Tecnologico

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend & Database:** Supabase (Auth, Postgres, Vector, Realtime, Storage)
- **Automation Engine:** n8n (Headless architecture)
- **State Management:** TanStack Query (Server State) + Zustand (Client State)
- **Validation:** Zod (Strict Schema Validation) + React Hook Form
- **Hosting:** Vercel

---

## 5. Multi-Tenancy & Sicurezza

**Multi-Tenancy Rigida**: Il sistema supporta molteplici Organizzazioni (Aziende clienti).

**Isolamento dei Dati**: Ogni singola query al database DEVE essere filtrata per `organization_id`. Non ci devono essere eccezioni.

**Ruoli:**
- **Owner:** Può gestire fatturazione e membri del team
- **Member:** Può visualizzare il feed e approvare le proposte

**RLS (Row Level Security):** Ogni tabella deve avere RLS policies attive. Vedi [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 6. Struttura Pagine Next.js

L'applicazione utilizza la struttura App Router.

- `/login` & `/register`: Pagine pubbliche di autenticazione (Supabase Auth)
- `/onboarding`: Wizard per configurare il primo Workspace e la Brand Voice
- `/dashboard` (Protected Layout):
  - `/dashboard/feed` (HOME): Il flusso unificato delle proposte
  - `/dashboard/hunter`: Tabella e ricerca Lead Generation
  - `/dashboard/brain`: Tab: Identità, Knowledge Base (File), Documenti Strategici
  - `/dashboard/settings`: Integrazioni e Fatturazione
  - `/dashboard/team`: Gestione utenti

Vedi [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) per dettagli completi.

---

## 7. Logica Dati & Flusso di Automazione

### Il "Ciclo Proattivo"

1. **Trigger (n8n):** Un workflow n8n parte su schedulazione (es. ogni mattina) o via webhook
2. **Logica (n8n):** Scrapa notizie o lead, consulta la brand_memory (Vettori) per il contesto, e genera una bozza
3. **Archiviazione (Supabase):** n8n inserisce una riga nella tabella `proposals` con `status = 'pending'`
4. **Visualizzazione (Next.js):** L'utente vede la nuova card in `/dashboard/feed`
5. **Azione (Next.js):** L'utente clicca "Approva"
6. **Esecuzione (Next.js → n8n):** Next.js chiama un URL Webhook n8n specifico con il `proposal_id`
7. **Finalizzazione (n8n):** n8n esegue la vera chiamata API (es. posta su LinkedIn) e aggiorna la riga nel DB a `status = 'published'`

Vedi [N8N_CONTRACT.md](./N8N_CONTRACT.md) per dettagli tecnici.

---

## 8. Linee Guida UI/UX

- **Stile:** Pulito, Professionale, orientato al SaaS (stile Linear/Raycast)
- **Componenti:** Usare shadcn/ui per tutto (Card, Bottoni, Dialog, Tabelle)
- **Responsività:** Deve funzionare perfettamente su Mobile (predisposto PWA)
- **Feedback:** Utilizzare aggiornamenti "Optimistic UI" (quando si clicca Approva, la card sparisce/si aggiorna immediatamente mentre il server processa)

---

## 📚 Documentazione Correlata

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schema database completo
- [N8N_CONTRACT.md](./N8N_CONTRACT.md) - Specifiche interfaccia n8n
- [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) - Struttura progetto
- [DEEP_ANALYSIS_SYSTEM.md](./DEEP_ANALYSIS_SYSTEM.md) - Sistema analisi avanzato
- [FEASIBILITY_ANALYSIS.md](./FEASIBILITY_ANALYSIS.md) - Analisi fattibilità


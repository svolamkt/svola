# Piano di Progetto: Marketing Operating System (SaaS)

## 1. Visione e Filosofia

L'obiettivo è creare un **"Marketing Operating System"** in formato SaaS, pensato specificamente per PMI e freelance. Il prodotto si posiziona come un **copilota strategico** che trasforma il marketing da un'attività complessa e reattiva a un processo guidato, proattivo e misurabile.

I pilastri della filosofia del prodotto sono:
- **Semplicità:** Interfacce intuitive che guidano l'utente.
- **Azione:** Fornire piani e strumenti concreti, non solo dati astratti.
- **Insight:** Trasformare i dati in suggerimenti strategici.

L'architettura sarà **modulare**, **scalabile** e **PWA-First** per massimizzare accessibilità e engagement.

---

## 2. Stack Tecnologico

- **Frontend:** Next.js (con App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Backend & Database:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Hosting:** Vercel
- **Motore di Analisi/Automazione:** Inizialmente n8n (self-hosted), attivato via webhook.
- **Motore di Lead Generation:** API di scraping esterna (es. SerpApi, Bright Data).

---

## 3. Architettura Modulare

L'applicazione sarà organizzata per funzionalità ("moduli") per facilitare lo sviluppo e la scalabilità. La struttura principale del codice risiederà in una cartella `/features`.

I moduli principali pianificati sono:
- **Core:** Gestione account, workspace, abbonamenti.
- **Onboarding & Strategy:** Analisi iniziale guidata da AI (SWOT, Personas, etc.).
- **Lead Generation:** Ricerca e raccolta di contatti qualificati.
- **Content Hub:** Pianificazione e generazione di contenuti.
- **Analytics:** Integrazione e visualizzazione di dati da fonti esterne.

---

## 4. Schema del Database (Supabase - Postgres)

*Le policy di Row Level Security (RLS) garantiranno che ogni utente possa accedere solo ai dati del proprio workspace.*

**Tabella: `workspaces`**
- `id` (UUID, PK)
- `user_id` (UUID, FK a `auth.users`)
- `name` (TEXT)
- `created_at` (TIMESTAMPTZ)

**Tabella: `strategy_documents`**
- `id` (UUID, PK)
- `workspace_id` (UUID, FK a `workspaces`)
- `swot_analysis` (JSONB)
- `buyer_personas` (JSONB)
- `customer_journey_map` (JSONB)
- `action_plan` (JSONB)
- `generated_at` (TIMESTAMPTZ)

**Tabella: `lead_searches`** (Per il modulo Lead Generation)
- `id` (UUID, PK)
- `workspace_id` (UUID, FK a `workspaces`)
- `search_query` (TEXT)
- `location` (TEXT)
- `status` (TEXT) - es. "pending", "running", "completed"
- `created_at` (TIMESTAMPTZ)

**Tabella: `leads`** (Per il modulo Lead Generation)
- `id` (UUID, PK)
- `search_id` (UUID, FK a `lead_searches`)
- `company_name` (TEXT)
- `website` (TEXT)
- `phone` (TEXT)
- `email` (TEXT, nullable)
- `email_status` (TEXT) - es. "pending", "found", "not_found"
- `collected_at` (TIMESTAMPTZ)

**Tabella: `kpi_snapshots`** (Per il modulo Analytics)
- `id` (BIGINT, PK)
- `workspace_id` (UUID, FK a `workspaces`)
- `source` (TEXT) - es. "Google Analytics 4"
- `metric_name` (TEXT)
- `value` (NUMERIC)
- `snapshot_date` (DATE)

---

## 5. Roadmap di Implementazione

### Livello 1: MVP (Minimum Viable Product)

1.  **Setup Progetto:** Creazione della struttura del progetto Next.js con lo stack definito.
2.  **Setup Database:** Creazione delle tabelle MVP (`workspaces`, `strategy_documents`) su Supabase con migrazioni SQL e policy RLS.
3.  **Autenticazione:** Implementazione completa del flusso di autenticazione (Login, Signup, Password Reset) con Supabase Auth.
4.  **Onboarding:** Creazione di un'interfaccia chatbot fittizia per raccogliere i dati iniziali dell'azienda.
5.  **Integrazione Webhook (Simulata):** Creazione di un'API Route che simula la chiamata a un servizio esterno (come n8n) al completamento dell'onboarding.
6.  **Dashboard di Base:** Visualizzazione statica dei risultati della strategia generata, per dimostrare il valore del prodotto.
7.  **Setup PWA:** Configurazione del `manifest.json` e di un service worker di base per rendere l'app installabile.
8.  **Deploy Continuo:** Configurazione del progetto su Vercel.

### Livello 2: Feature Expansion (Post-MVP)

- **Modulo Lead Generation:**
    - Integrazione con l'API di scraping esterna.
    - Sviluppo della logica asincrona con Edge Functions per la ricerca delle email.
    - Creazione dell'interfaccia utente per avviare ricerche e visualizzare i lead.
- **Modulo Analytics:**
    - Integrazione con API di terze parti (es. Google Analytics).
    - Sviluppo dei componenti per la visualizzazione dei dati.
- **Modulo Content Hub:**
    - Sviluppo delle funzionalità per la generazione di idee e la pianificazione dei contenuti.
- **Gestione Abbonamenti:**
    - Integrazione con Stripe per gestire piani e pagamenti.

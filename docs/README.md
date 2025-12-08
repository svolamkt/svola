# 📚 Nexus AI - Documentazione Completa

## 📖 Indice Documentazione

Questa cartella contiene tutta la documentazione del progetto **Nexus AI - Hybrid Growth OS**.

### 🎯 Documentazione Core

1. **[PROJECT_SPECS.md](./PROJECT_SPECS.md)** - Specifiche del Prodotto ⭐
   - Visione del prodotto e filosofia
   - Moduli core (The Brain, The Hunter, The Feed, Integrations)
   - User Journey completo
   - Stack tecnologico
   - Multi-tenancy e sicurezza
   - Linee guida UI/UX

2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Schema Database
   - Struttura tabelle Supabase
   - RLS Policies complete
   - Relazioni tra entità
   - Estensioni (vector per RAG)

3. **[N8N_CONTRACT.md](./N8N_CONTRACT.md)** - Contratto n8n
   - Interfaccia Next.js ↔ n8n
   - Webhook specifications
   - Payload formats
   - Flusso di automazione

4. **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)** - Struttura Progetto
   - Organizzazione cartelle Next.js
   - Convenzioni di naming
   - Architettura modulare

### 🚀 Deep Analysis System

5. **[DEEP_ANALYSIS_SYSTEM.md](./DEEP_ANALYSIS_SYSTEM.md)** - Sistema di Analisi Professionale
   - Architettura multi-agent (5 agenti specializzati)
   - Tool e implementazione
   - Workflow n8n sequenziale
   - Output Brand Master File completo
   - Innovazioni chiave

6. **[FEASIBILITY_ANALYSIS.md](./FEASIBILITY_ANALYSIS.md)** - Analisi di Fattibilità
   - Compatibilità con documentazione (100%)
   - Limitazioni e soluzioni
   - Piano di implementazione step-by-step
   - Stime temporali

### 🎯 Strategia Prodotto (NUOVO)

7. **[PRODUCT_STRATEGY.md](./PRODUCT_STRATEGY.md)** - Visione Prodotto Strategica ⭐
   - Principi fondamentali (cliente NON è fonte verità)
   - Modulo cliente progressivo (4 step)
   - Normalizzazione input con confidence levels
   - Comportamento agenti adattivi
   - Output con confidence notes, warnings, next steps
   - UX che protegge da percezioni negative

8. **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Piano Implementazione Completo
   - File da creare/modificare
   - Step-by-step implementation
   - Testing plan
   - Timeline e checklist

### 🔧 Workflows n8n

9. **[workflows/](./workflows/)** - Workflow n8n Esportati
   - Workflow JSON per riferimento
   - Importabili direttamente in n8n
   - **[workflows/ADAPTIVE_AGENTS_SPEC.md](./workflows/ADAPTIVE_AGENTS_SPEC.md)** - Specifiche agenti adattivi
   - **[workflows/WORKFLOW_EXPLANATION.md](./workflows/WORKFLOW_EXPLANATION.md)** - Spiegazione workflow
   - **[workflows/WORKFLOW_ANALYSIS.md](./workflows/WORKFLOW_ANALYSIS.md)** - Analisi problemi
   - Vedi [workflows/README.md](./workflows/README.md) per dettagli

---

## 🗂️ Organizzazione

```
docs/
├── README.md                    # Questo file (indice principale)
├── PROJECT_SPECS.md            # ⭐ Specifiche prodotto (START HERE)
├── DATABASE_SCHEMA.md          # Schema database Supabase
├── N8N_CONTRACT.md             # Contratto n8n (webhook, payload)
├── FOLDER_STRUCTURE.md         # Struttura progetto Next.js
├── DEEP_ANALYSIS_SYSTEM.md     # Sistema analisi multi-agent
├── FEASIBILITY_ANALYSIS.md     # Analisi fattibilità e implementazione
└── workflows/                  # Workflow n8n esportati
    ├── README.md
    ├── NEXUS_BRAIN_WORKFLOW.json
    ├── NEXUS_DEEP_ANALYST.json
    └── ... (altri workflow)
```

**File rimossi/consolidati:**
- ❌ `PROJECT_PLAN.md` → Obsoleto (usava "workspaces" invece di "organizations")
- ❌ `PROJECT_BLUEPRINT.md` → Consolidato in `PROJECT_SPECS.md`
- ❌ `NEXUS_DEEP_ANALYSIS_ARCHITECTURE.md` → Consolidato in `DEEP_ANALYSIS_SYSTEM.md`
- ❌ `NEXUS_DEEP_ANALYSIS_IMPLEMENTATION.md` → Consolidato in `DEEP_ANALYSIS_SYSTEM.md`
- ❌ `NEXUS_DEEP_ANALYSIS_PLAN.md` → Consolidato in `DEEP_ANALYSIS_SYSTEM.md`
- ❌ File `.md` duplicati nella root → Eliminati (ora solo in `docs/`)
- ❌ Cartella `svola/svola/` → Eliminata (struttura errata)
- ❌ `test-webhook.html` → Eliminato (file di test obsoleto)
- ✅ Workflow JSON → Spostati in `docs/workflows/`

---

## 🔄 Versioning

- **v1.0** - Documentazione iniziale consolidata
- Tutti i file obsoleti sono stati rimossi o consolidati

---

## 📝 Note

- La documentazione è in continuo aggiornamento
- Per modifiche, seguire le convenzioni esistenti
- Mantenere coerenza tra tutti i documenti


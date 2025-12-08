# 📋 n8n Workflows

Questa cartella contiene i workflow n8n esportati per riferimento.

## Workflow Disponibili

### ⭐ Workflow Principali

- **NEXUS_DEEP_ANALYSIS_COMPLETE.json** - ⭐ **Workflow Completo Multi-Agent** (Raccomandato)
  - Sistema completo con 5 agenti specializzati
  - Genera Brand Master File professionale
  - Vedi [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) per dettagli

- **NEXUS_DEEP_ANALYST.json** - Workflow base per analisi approfondita (versione precedente)
- **NEXUS_BRAIN_WORKFLOW.json** - Workflow per "The Brain" (Brand Identity analysis base)
- **NEXUS_BRAIN_COMPLETE.json** - Versione completa del workflow Brain
- **NEXUS_BRAIN_MINIMAL.json** - Versione minimale del workflow Brain
- **NEXUS_STEP1.json** - Workflow step 1 (probabilmente obsoleto)

## 📖 Documentazione

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Guida completa all'implementazione del workflow completo
- **[WORKFLOW_ANALYSIS.md](./WORKFLOW_ANALYSIS.md)** - Analisi dettagliata del workflow e problemi identificati
- **[WORKFLOW_EXPLANATION.md](./WORKFLOW_EXPLANATION.md)** - Spiegazione completa di cosa volevo fare e come funziona
- **[NEXUS_DEEP_ANALYST_CORRECTED.json](./NEXUS_DEEP_ANALYST_CORRECTED.json)** - JSON corretto del workflow con connessioni fixate
- Include: configurazione, setup, troubleshooting, esempi

## ⚙️ Setup Base

Questi file sono esportazioni JSON dei workflow n8n. Possono essere importati direttamente in n8n.

**Importante**: Prima di usare questi workflow, verifica che:
1. ✅ Le credenziali Google Gemini siano configurate
2. ✅ Le credenziali Supabase siano configurate
3. ✅ I webhook URL siano aggiornati
4. ✅ Il Google Search Tool sia implementato (vedi IMPLEMENTATION_GUIDE.md)

## 🚀 Quick Start

1. Importa `NEXUS_DEEP_ANALYSIS_COMPLETE.json` in n8n
2. Configura credenziali (Google Gemini, Supabase)
3. Implementa Google Search Tool (vedi IMPLEMENTATION_GUIDE.md)
4. Attiva il workflow
5. Testa con una richiesta POST al webhook URL


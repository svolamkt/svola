# n8n Agency OS

**Control Plane per agenzie n8n** - Organizza workflow, gestisci clienti e monitora esecuzioni.

## 🚀 Quick Start

### 1. Database Setup

Esegui la migration in Supabase Dashboard > SQL Editor:

```sql
-- Copia e incolla il contenuto di:
supabase/migrations/add_n8n_agency_os.sql
```

### 2. Environment Variables

Aggiungi in Vercel (o `.env.local` per sviluppo):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Deploy

```bash
npm run build  # Verifica build
git push       # Deploy automatico su Vercel
```

## 📚 Documentazione

- **[DEPLOY.md](./DEPLOY.md)** - Guida completa al deploy
- **[docs/N8N_AGENCY_OS_SPEC.md](./docs/N8N_AGENCY_OS_SPEC.md)** - Specifiche tecniche
- **[docs/N8N_AGENCY_OS_EXPLAINED.md](./docs/N8N_AGENCY_OS_EXPLAINED.md)** - Spiegazione semplificata

## ✨ Features

- ✅ **Sync Bidirezionale**: Importa workflow da n8n e organizza per cliente
- ✅ **One-Click Provisioning**: Crea cliente → workflow logger creato automaticamente
- ✅ **Smart Snippet Generator**: Copia nodo logger da incollare in n8n
- ✅ **Analytics Dashboard**: Monitora esecuzioni per cliente con realtime
- ✅ **Multi-Tenant**: RLS policies per isolamento dati per agenzia

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (Postgres, Auth, Realtime)
- **Integration**: n8n Public API

## 📝 License

Private - All Rights Reserved


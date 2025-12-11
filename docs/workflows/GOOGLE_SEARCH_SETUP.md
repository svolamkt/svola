# 🔎 Guida Configurazione Google Search (Gratuito)

Per abilitare l'AI a cercare su Google SENZA allucinazioni e GRATIS (fino a 100 ricerche/giorno), segui questi passi.

### 1. Ottieni la API Key
1. Vai su [Google Cloud Console - API Keys](https://console.cloud.google.com/apis/credentials).
2. Crea un nuovo progetto (es. "Nexus Search").
3. Clicca su "+ CREA CREDENZIALI" -> "Chiave API".
4. Copia la chiave generata (inizia con `AIza...`).

### 2. Abilita l'API
1. Nel menu a sinistra vai su "Libreria".
2. Cerca **"Custom Search API"**.
3. Clicca su "ABILITA".

### 3. Crea il Motore di Ricerca (CX)
1. Vai su [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all).
2. Clicca "Aggiungi".
3. Nome: "Nexus Search".
4. **Cosa cercare:** Seleziona "Cerca nell'intero Web".
5. Clicca "Crea".
6. Nella pagina successiva, copia l'**ID Motore di Ricerca (cx)** (es. `0123456789...`).

### 4. Inserisci in n8n
1. Apri il workflow **Nexus Deep Analyst Adaptive** in n8n.
2. Trova il nodo **Google Search Tool1**.
3. Clicca sull'icona della matita per modificarlo.
4. Nel codice JavaScript, sostituisci le righe in alto:

```javascript
const API_KEY = 'INCOLLA_QUI_LA_TUA_CHIAVE_AIza...'; 
const CX = 'INCOLLA_QUI_IL_TUO_ID_CX...'; 
```

5. Salva il nodo e il workflow.

---
**Fatto!** Ora l'AI cercherà dati reali su Google invece di inventarli.


# INTERFACE SPECIFICATION: N8N <-> NEXUS AI

## 1. INBOUND (n8n -> Supabase)
n8n connects directly to the Postgres Database to perform heavy write operations.
- **Scraping Results:** Bulk insert into `leads`.
- **New Proposals:** Insert into `proposals` with `status: pending`.

## 2. OUTBOUND TRIGGER (Next.js -> n8n)
When User clicks "Approve" in the UI, Next.js calls n8n.

**Endpoint:** `POST https://[n8n-instance]/webhook/execute-action`
**Headers:** `x-nexus-secret: [ENV_VAR]`

**Payload (Social Post):**
```json
{
  "action": "publish_social",
  "proposal_id": "UUID",
  "org_id": "UUID",
  "platform": "linkedin",
  "content": { "text": "...", "media": "..." }
}
```

**Payload (Cold Email):**
```json
{
  "action": "send_email",
  "proposal_id": "UUID",
  "lead_id": "UUID",
  "recipient_email": "ceo@target.com",
  "content": { "subject": "...", "html_body": "..." }
}
```


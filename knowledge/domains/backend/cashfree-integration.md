---
domain: backend
topic: cashfree-integration
tags: [cashfree, payments, upi, india-payments]
complexity: advanced
last_updated: 2026-02-04
---

# Cashfree Payment Gateway Integration

> Decision framework for Cashfree PG integration method, payment flow architecture, webhook reliability, and advanced features -- for India-first apps needing fast settlements and low UPI fees.

## TL;DR

- **Create Order (backend) -> payment_session_id (frontend) -> webhook + API verify** -- never trust return URL alone; always confirm payment status server-side via Get Order API
- **Webhook signature is HMAC-SHA256 over sorted payload values** -- verify on every webhook; use `x-webhook-signature` header; reject unsigned payloads; deduplicate by `cf_payment_id`
- **T+1 settlement (standard), instant in 15 min** -- Cashfree leads on settlement speed; instant available 24x7 including holidays at nominal fee
- **0% UPI for select merchants, 1.6% promo on cards** -- domestic cards 1.90-1.95% + GST; international 3.5% + Rs.7; annual maintenance Rs.4,999
- **Token Vault for RBI-compliant card-on-file** -- interoperable tokenization across gateways; CVV-free repeat payments; 10% better success rates on saved cards

## Decision Guide

| Scenario                                    | Approach                                               | Why                                                                                           |
| ------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Quick integration, minimal PCI scope        | Drop Checkout (pre-built UI) with `payment_session_id` | PCI burden on Cashfree; loads <200ms; 120+ payment methods; 2-3 day integration               |
| Full UI control over payment form           | API integration with custom payment collection         | Complete design freedom; requires additional security measures; higher dev effort             |
| Simple collect-and-redirect                 | Redirect Checkout (`cashfree.redirect()`)              | Minimal frontend code; Cashfree-hosted page; customer returns to `return_url`                 |
| Marketplace with vendor splits              | Easy Split with order-level `order_splits`             | Auto commission deduction; vendor KYC; instant/scheduled/on-demand settlements per vendor     |
| Recurring billing (subscriptions, EMIs)     | UPI AutoPay (<Rs.15K) or eNACH (up to Rs.10L)          | UPI: 10-sec setup, 98% EMI success, 9 auto-retries; eNACH: same-day mandate, higher limits    |
| One-off payment collection without checkout | Payment Links API (`/pg/links`)                        | Share via SMS/WhatsApp/email; partial payments; 30-day expiry; auto-reminders                 |
| Saving cards for repeat customers           | Token Vault (auto-enabled on Drop Checkout)            | RBI-compliant; interoperable across gateways; CVV-free repeat; zero extra integration on Drop |
| Need funds immediately after capture        | Instant Settlement (contact <care@cashfree.com>)       | Funds in 15 min; 24x7 including holidays; nominal fee per settlement                          |
| Pre-auth hold (hotels, rentals, deposits)   | Authorization API with deferred capture                | Hold funds without charging; capture full or partial amount later                             |
| Bulk vendor/salary disbursals               | Cashfree Payouts API (separate product)                | 10K txns/min; IMPS/NEFT/UPI/card transfers; 99.98% success rate; 24x7                         |

## Cashfree API Architecture

### Authentication

```
Headers (every request):
  x-client-id: <APP_ID>
  x-client-secret: <SECRET_KEY>
  x-api-version: 2022-09-01    (also: 2023-08-01, 2025-01-01)
  Content-Type: application/json
```

| Environment | Base URL                          |
| ----------- | --------------------------------- |
| Sandbox     | `https://sandbox.cashfree.com/pg` |
| Production  | `https://api.cashfree.com/pg`     |

| Rule            | Detail                                                              |
| --------------- | ------------------------------------------------------------------- |
| Secret storage  | Server-side only; never expose in client code or repos              |
| Key rotation    | Use oldest active key pair's secret for webhook verification        |
| IP whitelisting | Required for production; whitelist all API-calling servers          |
| Rate limit      | ~400 calls/min per IP + account; 429 on exceed; exponential backoff |

### Payment Flow

```
Backend: POST /pg/orders → { payment_session_id, cf_order_id }
     ↓
Frontend: new Cashfree(payment_session_id) → cashfree.redirect()
     ↓
Customer: completes payment on Cashfree checkout
     ↓
Cashfree → POST notify_url (webhook with signature)
     ↓
Cashfree → GET return_url?order_id=X (customer redirect)
     ↓
Backend: GET /pg/orders/{order_id} → verify order_status === "PAID"
     ↓
Backend: fulfill order
```

### Order & Payment States

| Entity  | States                                            | Notes                                                                  |
| ------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Order   | `ACTIVE` → `PAID` / `EXPIRED` / `FAILED`          | Expired order can still become PAID if payment initiated before expiry |
| Payment | `SUCCESS` / `FAILED` / `USER_DROPPED` / `PENDING` | Multiple attempts per order; each gets unique `cf_payment_id`          |

### Create Order

```
POST /pg/orders

Required body:
{
  "order_id": "unique_merchant_order_id",    // alphanumeric, max 50 chars
  "order_amount": 299.00,
  "order_currency": "INR",
  "customer_details": {
    "customer_id": "cust_123",               // alphanumeric
    "customer_phone": "9876543210"            // required
  }
}

Optional:
  order_meta.return_url    — customer redirect (use {order_id} placeholder)
  order_meta.notify_url    — webhook URL (HTTPS)
  order_meta.payment_methods — "cc,dc,upi,nb" filter
  order_expiry_time        — ISO 8601 (min 5min, max 30 days)
  order_tags               — max 10 key-value pairs for tracking

Response includes: payment_session_id, cf_order_id, order_status: "ACTIVE"
```

### Verify Payment

```
GET /pg/orders/{order_id}

3-step verification (use ALL, not just one):
  1. Webhook (server-to-server) — most reliable, async
  2. Return URL redirect — fallback, customer-facing
  3. Get Order API — final verification, poll if webhook delayed

NEVER fulfill based on return URL query params alone.
```

## Webhook Integration

### Signature Verification (HMAC-SHA256)

```
Algorithm:
  1. Sort webhook payload data keys alphabetically
  2. Concatenate all values (JSON.stringify objects)
  3. HMAC-SHA256 with client_secret as key
  4. Base64 encode result
  5. Compare with x-webhook-signature header

Headers received:
  x-webhook-signature: <base64 HMAC>
  x-webhook-timestamp: ISO timestamp
  x-idempotency-key: <hash>  (v2025-01-01+)
```

### Webhook Event Types

| Event                          | Trigger                 |
| ------------------------------ | ----------------------- |
| `PAYMENT_SUCCESS_WEBHOOK`      | Payment completed       |
| `PAYMENT_FAILED_WEBHOOK`       | Payment attempt failed  |
| `PAYMENT_USER_DROPPED_WEBHOOK` | User abandoned checkout |
| `REFUND_STATUS_WEBHOOK`        | Refund status change    |

### Webhook Reliability Rules

| Rule              | Detail                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Response          | Return 200 within timeout; process async                                   |
| Deduplication     | Track `cf_payment_id` with unique DB index; process once                   |
| Signature         | Always verify HMAC-SHA256; reject unsigned                                 |
| Multiple attempts | One order can have multiple payment attempts (each unique `cf_payment_id`) |
| Retries           | Cashfree retries on non-200; monitor in Dashboard > Logs                   |
| Reconciliation    | GET `/pg/orders/{order_id}` to backfill if webhook missed                  |
| Ordering          | May receive FAILED → PENDING → SUCCESS; use state machine                  |

## Refunds

```
POST /pg/orders/{order_id}/refunds

Body:
{
  "refund_id": "unique_refund_id",
  "refund_amount": 100.00,          // partial or full
  "refund_note": "reason",
  "refund_speed": "STANDARD"        // or "INSTANT" (limited methods)
}
```

| Rule            | Detail                                                        |
| --------------- | ------------------------------------------------------------- |
| Partial refunds | Multiple allowed; sum cannot exceed captured amount           |
| Refund speed    | STANDARD: 7-10 business days; INSTANT: limited to eNACH/pNACH |
| UPI refunds     | STANDARD only                                                 |
| Status check    | `GET /pg/orders/{order_id}/refunds/{refund_id}`               |
| Auto-refunds    | Triggered for duplicate/unsuccessful payments automatically   |
| Webhook         | Subscribe to `REFUND_STATUS_WEBHOOK`                          |

## Settlement & Reconciliation

| Settlement Type | Speed      | Availability            | Fee              |
| --------------- | ---------- | ----------------------- | ---------------- |
| Standard        | T+2        | Bank working days       | Free             |
| T+1             | Next day   | Eligible merchants      | Free             |
| Instant         | 15 minutes | 24x7 including holidays | Nominal (~0.15%) |
| On-demand       | Same day   | 24x7                    | Small fee        |

```
POST /pg/settlement/recon

Filters: settlement_ids, settlement_utrs, start_date, end_date
Response: settlement details with per-transaction breakdown (amount, service_charge)

Also: GET /pg/settlements — list all settlements with date range
Dashboard: Payment Gateway > Reports > Settlements (CSV/XLSX export)
```

## Advanced Features

### Easy Split (Marketplace)

| Capability         | Detail                                                         |
| ------------------ | -------------------------------------------------------------- |
| Vendor onboarding  | `POST /pg/easy_split/vendors` with KYC                         |
| Order splits       | `order_splits: [{ vendor_id, amount }]` in create order        |
| Vendor settlements | Scheduled (T+1/T+2/custom), on-demand (24x7), instant (15 min) |
| UPI settlements    | Industry first -- settle to vendor UPI IDs                     |
| Refund adjustment  | Auto-adjusted from vendor balance                              |

### Token Vault (Card Tokenization)

| Capability       | Detail                                                               |
| ---------------- | -------------------------------------------------------------------- |
| RBI compliance   | Effective Oct 2022; merchants cannot store card details              |
| Interoperability | Works across multiple payment gateways                               |
| Enable           | Auto-enabled on Drop Checkout; or `order_meta.save_instrument: true` |
| Fetch saved      | `GET /pg/customers/{customer_id}/instruments`                        |
| Pay with saved   | `payment_method: { instrument_id: "inst_xxx" }`                      |
| Stored data      | Card BIN (first 6), last 4, expiry, network -- never full PAN or CVV |

### Subscriptions

| Method        | Best For                              | Limit Without AFA               |
| ------------- | ------------------------------------- | ------------------------------- |
| UPI AutoPay   | Low-value recurring (<Rs.15K)         | Rs.15K (Rs.1L for MF/insurance) |
| eNACH         | High-value recurring (EMIs, premiums) | Rs.10L (same-day mandate)       |
| Physical NACH | No digital auth available             | Signature-based                 |

### Payment Links

```
POST /pg/links

Key params: link_id, link_amount, link_purpose, link_expiry_time
Optional: link_partial_payments, link_minimum_partial_amount, link_auto_reminders
Response: link_url (shareable via SMS/WhatsApp/email)
Default expiry: 30 days
```

## MCP Server (AI Agent Integration)

Cashfree provides an official MCP (Model Context Protocol) server that lets AI agents (Claude Desktop, Cursor, VS Code Copilot, Claude Code) call Cashfree APIs via natural language instead of writing HTTP requests.

### Local MCP Setup

```
git clone <cashfree-mcp-server-repo>
cd cashfree-mcp-server
npm install                     # Node.js 14.x+
```

Configure in your AI client's MCP config (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "cashfree": {
      "command": "node",
      "args": ["path/to/cashfree-mcp-server/index.js"],
      "env": {
        "PAYMENTS_APP_ID": "<your_app_id>",
        "PAYMENTS_APP_SECRET": "<your_secret>",
        "ENVIRONMENT": "sandbox",
        "ENABLED_TOOLS": "pg,payouts,secureid"
      }
    }
  }
}
```

### Available Tool Modules

| Module                 | Tools    | Capabilities                                                  |
| ---------------------- | -------- | ------------------------------------------------------------- |
| Payment Gateway (`pg`) | 24 tools | Create orders, payment links, manage refunds, handle disputes |
| Payouts (`payouts`)    | 8 tools  | Fund transfers, batch operations, Cashgram                    |
| Secure ID (`secureid`) | 5 tools  | KYC verification, name matching                               |

### Environment Variables

| Variable                  | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `PAYMENTS_APP_ID`         | PG API app ID                                |
| `PAYMENTS_APP_SECRET`     | PG API secret                                |
| `PAYOUTS_CLIENT_ID`       | Payouts credentials                          |
| `PAYOUTS_CLIENT_SECRET`   | Payouts credentials                          |
| `PAYOUTS_PUBLIC_KEY_PATH` | Path to 2FA public key                       |
| `SECUREID_CLIENT_ID`      | KYC verification credentials                 |
| `SECUREID_CLIENT_SECRET`  | KYC verification credentials                 |
| `ENVIRONMENT`             | `sandbox` or `production`                    |
| `ENABLED_TOOLS`           | Comma-separated: `pg`, `payouts`, `secureid` |

### When to Use MCP vs Code Integration

| Scenario                             | Use              | Why                                                            |
| ------------------------------------ | ---------------- | -------------------------------------------------------------- |
| Ad-hoc payment link creation         | MCP              | "Create Rs.2000 link for <john@example.com>" -- no code needed |
| Debugging a failed payment           | MCP              | "Check status of order_abc123" -- instant lookup               |
| Batch refund processing              | MCP              | Natural language batch operations through AI agent             |
| Invoice PDF → payment link           | MCP              | AI reads PDF, extracts amount, creates link automatically      |
| Production checkout flow in your app | Code integration | MCP is for operations, not embedded product flows              |
| High-throughput automated payments   | Code integration | MCP adds latency; direct API is faster at scale                |
| CI/CD pipeline payment tests         | Code integration | Programmatic control needed; MCP is interactive                |

### MCP + Other Tools (Workflow Chaining)

Combine Cashfree MCP with other MCP servers for end-to-end workflows:

```
Gmail MCP → read invoice email → extract amount + customer
  ↓
Cashfree MCP → create payment link
  ↓
WhatsApp MCP → send link to customer
```

### References

- [Cashfree MCP Server Docs](https://www.cashfree.com/docs/tools-ai/mcp-server#local-mcp) -- Setup, configuration, tool listing

## Cashfree vs Razorpay vs Stripe (Decision Matrix)

| Factor              | Cashfree                    | Razorpay                 | Stripe             |
| ------------------- | --------------------------- | ------------------------ | ------------------ |
| UPI fees            | 0% (select merchants)       | 0% (<Rs.2K)              | 0.3%               |
| Domestic cards      | 1.90-1.95% + GST            | ~2% + GST                | 2%                 |
| International cards | 3.5% + Rs.7                 | 3-4.3% + GST             | 3%                 |
| Settlement          | T+1 standard; instant 15min | T+2; instant available   | T+4; no instant    |
| Setup fee           | Rs.0 (Rs.4,999 annual)      | Rs.0                     | Rs.0               |
| India availability  | Full                        | Full                     | Invite-only (2025) |
| Cross-border        | Limited                     | PA-CB license (Dec 2025) | 135+ currencies    |
| Marketplace splits  | Easy Split                  | Razorpay Route           | Connect            |
| Card tokenization   | Token Vault (interoperable) | Proprietary              | Proprietary        |
| Best for            | UPI-heavy, fast settlements | India-first full-stack   | Global SaaS        |

## Testing & Sandbox

| Item                      | Detail                                                               |
| ------------------------- | -------------------------------------------------------------------- |
| Base URL                  | `https://sandbox.cashfree.com/pg`                                    |
| SDK script                | `https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js`           |
| OTP for all test payments | `111000`                                                             |
| Test cards                | Append any 10 digits to card BIN; any future expiry; any 3-digit CVV |
| SMS notifications         | Unavailable in sandbox                                               |
| Fund movement             | None (simulated)                                                     |
| Rate limits               | Same as production (~400/min)                                        |

### Test Scenarios

```
Success: Create order → test card/UPI → OTP 111000 → verify PAID status + webhook
Failure: Use failure-specific test BINs → verify FAILED webhook + order status
User drop: Initiate payment → close page → verify USER_DROPPED webhook
Refund: Complete payment → POST refund → verify refund status + webhook
```

## SDKs

| Platform     | Package                                    |
| ------------ | ------------------------------------------ |
| Node.js      | `npm install cashfree-pg-sdk-nodejs`       |
| Python       | `pip install cashfree-pg-sdk-python`       |
| PHP          | `composer require cashfree/cashfree-pg`    |
| Java         | Maven/Gradle                               |
| Go           | `go get github.com/cashfree/cashfree-pg`   |
| React Native | `npm install react-native-cashfree-pg-sdk` |
| Flutter      | `cashfree_pg` (pub.dev)                    |
| Browser JS   | Script tag from SDK CDN                    |

## Security & Compliance

| Certification              | Status    |
| -------------------------- | --------- |
| PCI DSS v3.2.1             | Certified |
| ISO 27001:2013             | Certified |
| ISO 27017 (cloud security) | Certified |
| ISO 27018 (cloud privacy)  | Certified |
| SOC 2 Type 2               | Compliant |
| GDPR                       | Compliant |
| RBI data localization      | Compliant |

| Security Feature   | Detail                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| 3D Secure / 3DS2   | Full support with MFA                                                    |
| RiskShield (fraud) | ML-based detection; device fingerprinting; custom rules; FRI integration |
| Encryption         | AES-256 at rest; TLS 1.2+ in transit; RSA 2048 key exchange              |
| Token Vault        | Cryptographic tokens; network tokenization; interoperable                |

## Common Mistakes

| Mistake                                        | Fix                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| Exposing `x-client-secret` in frontend code    | Server-side only; use env vars; never commit to repos                      |
| Trusting return URL params to confirm payment  | Always verify via `GET /pg/orders/{order_id}` server-side                  |
| Not verifying webhook HMAC signature           | Compute HMAC-SHA256 over sorted values; reject mismatches                  |
| Processing same webhook twice (no dedup)       | Store `cf_payment_id` with unique DB index; check before processing        |
| Using sequential/predictable order IDs         | Use UUID or `order_{timestamp}_{random_hex}` to prevent enumeration        |
| Trusting client-sent amount for order creation | Fetch actual price from DB; validate server-side before creating order     |
| Skipping sandbox testing                       | Test all flows (success, failure, drop, refund) before go-live             |
| No reconciliation job for missed webhooks      | Periodic `GET /pg/orders/{id}` cron to catch gaps                          |
| Not handling expired-but-paid edge case        | Order can become PAID after EXPIRED if payment was initiated before expiry |
| Going live without IP whitelisting             | Whitelist all production API-calling servers in dashboard                  |

## Checklist

- [ ] API credentials stored in environment variables (never in code or repos)
- [ ] All API calls use production base URL (`api.cashfree.com/pg`) and correct `x-api-version`
- [ ] Production server IPs whitelisted in Cashfree dashboard
- [ ] Webhook endpoint is HTTPS, returns 200 within timeout, processes async
- [ ] Webhook HMAC-SHA256 signature verified on every incoming webhook
- [ ] `cf_payment_id` deduplicated with unique DB index before processing
- [ ] Payment verified server-side via Get Order API (not just return URL)
- [ ] Refunds linked to original `order_id` with partial amount tracking
- [ ] Reconciliation cron job compares local records vs Cashfree API (at least daily)
- [ ] Order amounts validated server-side against actual prices (not client-sent values)
- [ ] Token Vault enabled for repeat customers (auto on Drop Checkout)
- [ ] All test scenarios passed in sandbox (success, failure, drop, refund)
- [ ] Rate limiting implemented on payment creation endpoints (~300 req/min buffer)
- [ ] Settlement reconciliation reports downloaded and verified weekly

## References

- [Cashfree API Reference](https://www.cashfree.com/docs/api-reference/payments/latest/orders/create) -- Order creation, authentication, versioning
- [Cashfree Webhook Signature Verification](https://www.cashfree.com/docs/api-reference/vrs/webhook-signature-verification) -- HMAC-SHA256 algorithm
- [Cashfree Sandbox Environment](https://www.cashfree.com/docs/payments/online/resources/sandbox-environment) -- Test credentials, OTP, limitations
- [Cashfree Payment Lifecycle](https://www.cashfree.com/docs/payments/online/resources/payment-lifecycle) -- Order/payment state machine
- [Cashfree API Best Practices](https://www.cashfree.com/docs/api-reference/payments/api-best-practices) -- Rate limits, webhook usage, key management
- [Cashfree Token Vault](https://www.cashfree.com/card-tokenization) -- RBI-compliant card tokenization
- [Cashfree Easy Split](https://www.cashfree.com/easy-split/split-payment-gateway/) -- Marketplace payment splits
- [Cashfree Instant Settlements](https://www.cashfree.com/instant-settlements/) -- 15-min settlement, 24x7

## Related

- [Payment Gateway Integration & Cost Optimization](./payment-integration.md) -- Gateway selection, idempotency, webhook patterns, refund reconciliation
- [B2B2C Payment Architecture](./b2b2c-payment-architecture.md) -- White-label revenue splits, TCS/TDS compliance
- [Offers & Discounts](./offers-discounts.md) -- Coupon architecture and MRR-safe discounting

---

## Changelog

| Date       | Change                                          |
| ---------- | ----------------------------------------------- |
| 2026-02-04 | Initial version                                 |
| 2026-02-04 | Added MCP Server (AI Agent Integration) section |

# GridPath AI — Product & Engineering Specification

**Working name in repo:** Grid-Risk-MVP · **Product name:** GridPath AI
**Source of truth for strategy:** [strategy/business-plan.md](strategy/business-plan.md), [strategy/literature-review.md](strategy/literature-review.md)
**Status:** Draft v1 — feature catalog + build plan. Estimates are rough and assume a 2–4 person team.

---

## 0. How to read this document

- **§1–2** frame what the product actually is and the one insight that should drive sequencing.
- **§3** is the feature catalog: 8 modules, ~60 features, each with an ID, priority, and phase. This is the "point-wise analysis" — scan the tables, read the detail on the ones marked ★.
- **§4** is the data strategy. This is the moat; it is not an implementation detail.
- **§5** is the technical architecture and stack decisions.
- **§6** is the phased roadmap.
- **§7** is an honest gap analysis of the code that exists today.
- **§8** lists the decisions I could not make for you and the claims you should verify.

**Priority key:** `P0` = required for a credible design-partner demo · `P1` = required to charge money · `P2` = required to win the enterprise/utility buyer · `P3` = later layer.

---

## 1. What we are actually building

The business plan describes three layers. Restated as products with distinct buyers:

| Layer | Product | Buyer | Sold on | Phase |
|---|---|---|---|---|
| 1 | **Interconnection Co-Pilot** — screen a site, score connect-ability, find better points of interconnection, draft the study | Renewable/storage developers; data-center power teams | "Don't spend 3 years and $2M discovering this POI was dead" | 0–2 yr |
| 2 | **Grid Study Platform** — cluster study automation, restudy, cost allocation, system of record | Utilities, ISOs/RTOs | "FERC Order 2023 deadlines are unmeetable by hand" | 2–3 yr |
| 3 | **DER Orchestration** — dispatch and market participation for connected assets | Asset owners | "Recurring value from the assets we connected" | 3 yr+ |

The current repo is a sketch of one screen of Layer 1. Everything below is what Layer 1 has to become, plus the seams that must exist now so Layers 2–3 are possible later.

### The user's actual job-to-be-done

A developer has land (or an option on land) and needs to answer, in order:

1. **Is there anywhere near this site I can connect at all?** (siting)
2. **What will the network upgrades cost me, and could that number kill the project?** (cost risk — the single biggest killer)
3. **How long until I can energize?** (timeline risk)
4. **What's the chance I burn 2 years and withdraw?** (withdrawal risk)
5. **Once I'm in the queue, what changed this week that affects me?** (monitoring)
6. **Can I hand a defensible document to my investment committee / the ISO?** (output)

Every P0 feature below maps to one of those six questions. Anything that doesn't map to one of them is not P0.

---

## 2. The one insight that should drive sequencing

**Build the data loop before the AI.**

The plan's moat is *"study input → engineer correction → ISO-approved outcome."* That loop is a data asset that compounds with time, so its start date is the most valuable variable in the whole plan. Practical consequences:

- **Every AI output ships with a structured correction UI from v1.** Not thumbs up/down — a typed diff: *which field, old value, engineer's value, reason code, confidence.* This is feature **D9** and it is P0 even though it looks like internal tooling.
- **Ingest historical outcomes before building predictive models.** You cannot calibrate a withdrawal model without labels. Labels come from queue snapshots over time (**A3**). Start collecting and back-filling on day one; the model can come three months later.
- **Snapshot everything immutably.** A score computed today must be reproducible in two years when someone asks why you said 72. Retroactively-mutable data destroys both the ML training set and the regulatory-trust story.

The corollary: a heuristic score with honest confidence bounds, real data, and a captured correction loop is worth more than a sophisticated model on hardcoded inputs. The current `risk_engine.py` is the latter.

---

## 3. Feature catalog

### Module A — Data Foundation ("the Grid Graph")

Everything else is a view over this. Underinvesting here caps the ceiling of the whole product.

| ID | Feature | Priority | Phase |
|---|---|---|---|
| A1 ★ | ISO/RTO interconnection queue ingestion + normalization | P0 | 1 |
| A2 | Substation & electrical node registry (geospatial) | P0 | 1 |
| A3 ★ | Historical outcomes dataset (the label set) | P0 | 1 |
| A4 ★ | Study document library + LLM extraction pipeline | P1 | 2 |
| A5 | Distribution hosting-capacity data | P2 | 3 |
| A6 | Nodal congestion & LMP history | P1 | 2 |
| A7 | Public-grade transmission topology | P1 | 2 |
| A8 ★ | Data lineage, snapshotting & provenance | P0 | 1 |

**A1 ★ — Queue ingestion.** Connectors per ISO (PJM, MISO, ERCOT, CAISO, SPP, NYISO, ISO-NE), each publishing queue data in a different format (Excel, CSV, web tables, some only PDF). Normalize to one `queue_project` schema: project ID, ISO, POI/substation, county, capacity MW (and separately: nameplate vs requested service level), fuel/technology, service type (ERIS/NRIS), queue date, current study phase, status, withdrawal date, assigned upgrade cost where published. Run daily; write an immutable snapshot each run. Build ISO-by-ISO — a good PJM connector beats seven bad ones.

**A2 — Node registry.** Substations and electrical buses with lat/long, voltage class, owning utility, and a stable internal ID that queue records join to. Sources: EIA-860/861, HIFLD, OpenStreetMap power layers, ISO postings. **The hard part is entity resolution** — ISO queue spreadsheets name substations inconsistently ("Smithfield", "SMITHFLD 138", "Smithfield 138kV"). Budget real time for a fuzzy-match + human-confirm pipeline; a wrong join silently corrupts every downstream score.

**A3 ★ — Historical outcomes.** For every project that has ever been in a queue: terminal status (operational / withdrawn / suspended / active), days in queue per phase, final assigned upgrade cost, count of restudies. This is the supervised-learning label set for B2/B3/B4 and the evidence base for the "comparable projects" panel (B6). Derive it from the diff between A1 snapshots over time, plus back-fill from historical ISO postings.

**A4 ★ — Study document intelligence.** Ingest ISO cluster study reports, system impact studies, and facilities studies (mostly PDF, hundreds of pages). Extract with an LLM into a validated schema: which projects, which network upgrades, the specific constrained element (which branch/transformer overloaded, at what loading), cost per upgrade, cost allocation per project, study assumptions. Every extraction gets a confidence score and an engineer-confirmation step (feeds D9).

This is where the proprietary dataset actually comes from — the thing no competitor can scrape casually, because it requires the extraction pipeline *plus* the review labor. Treat it as a core asset, not a parsing chore.

**A8 ★ — Lineage & snapshotting.** Every fact carries `source`, `retrieved_at`, `snapshot_id`. Every score persists the snapshot IDs and model version it consumed. Non-negotiable for three reasons: reproducibility of any past report, honest backtesting (no lookahead leakage), and the audit trail the utility/ISO buyer will demand.

---

### Module B — Screening & Risk Intelligence (the wedge)

This is the current `risk_engine.py`, done for real.

| ID | Feature | Priority | Phase |
|---|---|---|---|
| B1 ★ | Connect-ability Score (composite, with confidence bounds) | P0 | 1 |
| B2 ★ | Withdrawal-probability model (survival analysis) | P0 | 1 |
| B3 ★ | Network-upgrade cost estimator (with prediction intervals) | P0 | 1 |
| B4 | Time-to-COD / milestone forecaster | P1 | 2 |
| B5 | Curtailment & basis-risk estimate | P1 | 2 |
| B6 ★ | Explainability: factor attribution + comparable projects | P0 | 1 |
| B7 | Scenario & sensitivity analysis | P1 | 1–2 |
| B8 | Data-quality & extrapolation warnings | P0 | 1 |

**B1 ★ — Connect-ability Score.** A 0–100 composite over five sub-scores: withdrawal risk (B2), expected upgrade cost per MW (B3), expected time-to-energization (B4), curtailment/basis risk (B5), and local queue congestion. Two hard requirements the current implementation violates:

- **Inputs must come from the Grid Graph for the specific POI**, not constants. Today `assess.py` passes `withdrawal_rate=0.80, avg_wait_days=1200, upgrade_cost=$40M` regardless of what the user typed — so the score is a function of capacity alone. That's a demo prop, not a product.
- **Ship a confidence interval, not a point estimate.** "68 ± 11, moderate confidence, based on 34 comparable PJM projects" is credible to an engineer. "68" is not. Weight the sub-scores, but present the interval and the attribution alongside.

Keep the weighted-sum structure as the v1 shell — it's transparent and defensible, which matters more than accuracy at this stage. Replace the *inputs* first, the *functional form* second.

**B2 ★ — Withdrawal model.** This is a time-to-event problem with heavy censoring (many projects are still active), so use survival analysis — Cox proportional hazards for interpretability first, gradient-boosted survival (`scikit-survival`) once you have volume. Features: ISO, POI, voltage class, MW, technology, service type, queue vintage, cluster size, number of projects ahead at the same POI, aggregate queued MW in the electrical neighborhood, assigned upgrade cost if known. Output: `P(withdraw within 12/24/36 months)` plus a hazard curve.

**B3 ★ — Upgrade cost estimator.** The highest-value number in the product; a surprise $40M assignment is the classic project-killer. Predict assigned network-upgrade cost per MW conditioned on POI, voltage, MW, technology, and cluster composition. Train on A3 + A4 extractions. **Always output a prediction interval** — the distribution is fat-tailed and a point estimate is actively misleading. Quantile regression or conformal prediction over a gradient-boosted base.

**B6 ★ — Explainability.** Two panels, and this is what converts a skeptical engineer:
- *Factor attribution:* how each sub-score moved the composite, with the underlying raw values and their sources.
- *Comparable projects:* "12 historically similar projects at this POI class; 8 withdrew, median assigned upgrade $31M, median 41 months in queue" — with the actual project list, linkable. Retrieval, not generation, and far more persuasive than a model coefficient.

**B8 — Honest uncertainty.** Explicit banner when the POI has thin historical data, when a substation match was fuzzy, when a data snapshot is stale, or when the request falls outside the training distribution. Counter-intuitively this is a *sales* feature: energy engineers are trained to distrust black boxes, and visible epistemic humility buys trust that a confident wrong answer permanently destroys.

---

### Module C — Siting & Alternatives Engine

Highest perceived value per unit of engineering effort, and it works on public data alone — no CEII required. **This is the demo that gets design partners.**

| ID | Feature | Priority | Phase |
|---|---|---|---|
| C1 ★ | POI alternatives ranking | P0 | 1 |
| C2 ★ | Geospatial map explorer | P0 | 1 |
| C3 | Constraint-aware filtering | P0 | 1 |
| C4 | Gen-tie route & cost estimator | P1 | 2 |
| C5 | Portfolio siting optimizer | P2 | 3 |
| C6 | Co-location & surplus-interconnection screening | P2 | 3 |

**C1 ★ — Alternatives ranking.** Given a site (or a search area) and a project spec, return ranked candidate POIs with connect-ability score, distance, voltage, owner, queue congestion, and the delta versus the user's current choice: *"Your chosen POI scores 41. Three alternatives within 25 miles score above 70; the best trades 18 miles of gen-tie (~$22M) for an estimated $60M less in network upgrades."* That sentence is the product. Currently `alternatives.py` returns two hardcoded rows.

**C2 ★ — Map explorer.** Substations colored by score, queue-density heatmap, transmission lines, the user's sites, candidate POIs. Energy siting is inherently spatial and a map is how this audience thinks. Use MapLibre GL + vector tiles served from PostGIS.

**C4 — Gen-tie cost.** An alternative POI 20 miles away is not free. Estimate transmission-line cost by distance, voltage, and terrain/land-use crossings so comparisons are apples-to-apples. Without this, C1's rankings are wrong in a way a developer will catch in the first meeting.

**C6 — Surplus interconnection / co-location.** Screen for opportunities to use existing interconnection rights (FERC Order 845 surplus interconnection service) or co-locate storage behind an existing POI — routes that skip much of the queue. A genuine differentiator; most tools don't model it. *Verify the current mechanism rules per ISO before building.*

---

### Module D — Study Automation & Co-Pilot

The long-term wedge, and the part gated on data access. Phase carefully.

| ID | Feature | Priority | Phase |
|---|---|---|---|
| D1 | Project intake & structured data room | P0 | 1 |
| D2 | ISO application package auto-draft | P1 | 2–3 |
| D3 ★ | Power-flow screening (surrogate → real model) | P1 | 2–3 |
| D4 | Short-circuit / fault-duty screening | P2 | 3 |
| D5 | Deliverability / ERIS-vs-NRIS advisor | P2 | 3 |
| D6 ★ | Restudy & withdrawal-cascade simulator | P1 | 2 |
| D7 | Affected-systems detection | P2 | 3 |
| D8 | Study report generator (regulator-formatted, audited) | P0 | 1 |
| D9 ★ | Engineer review workspace + correction capture | P0 | 1 |
| D10 ★ | Model & assumption version pinning | P0 | 1 |

**D3 ★ — Power flow, in two stages.** The honest constraint: real ISO base cases are CEII-protected and you will not have them at seed stage.
- *Stage 1 (no CEII):* coarse public-grade topology (A7) + `pandapower` for indicative N-1 thermal screening, presented explicitly as a screen, not a study. Optionally train an ML surrogate for interactive-speed what-ifs.
- *Stage 2 (with design partners):* run real base cases through PSS/E or PowerWorld inside the customer's trust boundary. Architect for this now — the compute layer should be swappable and capable of running in a customer VPC.

Do not over-promise Stage 1 as a substitute for a study. Position it as "which of your twelve candidate sites deserve a real study," which is genuinely valuable and honestly framed.

**D6 ★ — Restudy cascade simulator.** When a higher-queued project withdraws, its share of network-upgrade cost reallocates to everyone remaining, triggering restudies and cost shocks. This is the #1 source of nasty surprises and almost nobody models it prospectively. Feature: *"Projects A and B ahead of you carry 60% of the shared upgrade. If both withdraw — 55% likely per B2 — your assigned cost moves from $12M to an estimated $34M."* Monte Carlo over B2's withdrawal probabilities across the cluster.

High-value, genuinely novel, and buildable from public queue data + A4 extractions. **I'd rank this the single most differentiating feature in the catalog** — consider pulling it into Phase 1 if the data supports it.

**D8 — Report generator.** Versioned PDF/DOCX "connect-ability report": inputs, assumptions, results, factor attribution, comparables, data-snapshot IDs, model versions, engineer sign-off block. This is the deliverable a developer forwards to their investment committee — which makes it the artifact that sells the next seat.

**D9 ★ — Engineer review workspace.** AI draft beside engineer edit; every change captured as a structured record (`field`, `ai_value`, `human_value`, `reason_code`, `notes`, `reviewer`, `timestamp`). Reason codes should be a curated taxonomy, not free text, so corrections are trainable. Plus reviewer identity, sign-off state, and full audit trail.

This is simultaneously: the liability shield ("decision support with licensed engineer sign-off," per the plan's risk table), the training-data pipeline, and the compliance artifact. **It is the single most strategically important feature in this document and it looks like boring internal tooling.** Build it in Phase 1.

**D10 ★ — Version pinning.** Every generated study/score records data snapshot IDs, model versions, assumption-set version, and code commit. Without this you cannot reproduce a report, defend a number, or backtest without leakage.

---

### Module E — Portfolio & Lifecycle (System of Record)

How you convert a one-off screening tool into embedded, sticky workflow — the plan's stated moat #2.

| ID | Feature | Priority | Phase |
|---|---|---|---|
| E1 | Project pipeline dashboard | P0 | 1 |
| E2 ★ | Queue-change monitoring & alerts | P0 | 1 |
| E3 | Milestone, deadline & deposit tracker | P1 | 2 |
| E4 | Versioned document repository | P1 | 2 |
| E5 | Cost-allocation history tracker | P1 | 2 |
| E6 | Shared workspace / controlled external sharing | P2 | 2–3 |
| E7 | IC & board reporting exports | P1 | 2 |

**E2 ★ — Queue monitoring.** Daily diff of ISO queue snapshots, surfaced as alerts scoped to what affects the user's projects: withdrawals ahead of them, new entrants at their POI, phase changes, restudy triggers, status flips. Email + Slack + in-app.

Strategically this is the best value-per-effort feature in the entire catalog. It's nearly free once A1 exists, it creates a *daily* reason to open the product (screening is a once-a-quarter act), and it makes churn feel like losing situational awareness. **Ship it in Phase 1.**

**E5 — Cost-allocation history.** Track how a project's assigned upgrade cost changed across every restudy, with the reason for each change. Feeds D6's calibration and is exactly the story a developer needs for their IC.

---

### Module F — Utility / ISO Side (Layer 2)

Deliberately deferred. The plan is right that developers are the faster buyer — but two seams must exist early or Layer 2 requires a rewrite.

| ID | Feature | Priority | Phase |
|---|---|---|---|
| F1 | Cluster study manager (Order 2023 workflow) | P2 | 3 |
| F2 | Batch/parallel study execution + result diffing | P2 | 3 |
| F3 | Restudy automation | P2 | 3 |
| F4 ★ | ISO-specific cost-allocation rules engine | P2 | 3 |
| F5 | Study QA / consistency checker | P3 | 3–4 |
| F6 | External developer submission portal | P3 | 4 |

**Seams to build now, in Phase 1:** (a) the data model must represent a *cluster* as a first-class object, not just individual projects — retrofitting this is painful; (b) **F4's cost-allocation rules must be declarative configuration, not code.** Allocation methodology differs materially per ISO and changes with tariff filings. If it's `if iso == "PJM"` branches scattered through the codebase, every new region is a rewrite and every tariff change is a bug hunt.

---

### Module G — DER Orchestration (Layer 3)

Explicitly out of scope for 24 months. Features: asset registry + telemetry ingest (IEEE 2030.5 / SunSpec / inverter APIs), dispatch optimization, curtailment management, VPP aggregation and market bidding, settlement reporting.

**The only thing that matters now:** a project's identity key must survive the transition from *queued project* → *operating asset*. One stable internal asset ID carried across both lifecycles. That's a schema decision made in Phase 1 that either preserves or forecloses the Layer 3 story.

---

### Module H — Platform & Trust (cross-cutting)

Not optional extras. In a regulated, safety-adjacent market these gate whether an enterprise can buy at all.

| ID | Feature | Priority | Phase |
|---|---|---|---|
| H1 | Auth: SSO/SAML, orgs, roles, project-level permissions | P0/P1 | 1–2 |
| H2 ★ | Immutable audit log | P0 | 1 |
| H3 ★ | CEII data classification & handling | P1 | 2 |
| H4 | Multi-tenancy & tenant data isolation | P0 | 1 |
| H5 ★ | Model observability: prediction-vs-actual backtesting | P1 | 2 |
| H6 | Feedback instrumentation on every AI output | P0 | 1 |
| H7 | Public API, webhooks, Excel/GIS export | P1 | 2 |
| H8 ★ | Evaluation harness & held-out backtests | P0 | 1 |

**H1 — Auth.** Basic org/user/role in Phase 1; SSO/SAML before the first enterprise contract (use WorkOS or Auth0 — do not hand-roll SAML). Roles: admin, engineer (can sign off), analyst, viewer, external collaborator.

**H3 ★ — CEII handling.** Grid models and some study data are Critical Energy Infrastructure Information with real legal handling obligations. Classify every stored object, enforce access by classification, encrypt at rest, isolate per tenant, log every access. **Mishandling CEII once likely ends your access to the entire utility/ISO market** — this is an existential-risk control, not a compliance checkbox. Get a lawyer who knows FERC CEII rules before ingesting the first protected model.

**H5 ★ / H8 ★ — Evaluation and backtesting.** A harness that answers: *"Trained only on data available as of Jan 2021, how well did we predict what actually happened by 2024?"* Requires A8's snapshotting to avoid lookahead leakage. This is simultaneously your engineering guardrail against silent model regression and your single best sales asset — a defensible backtest ("we flagged 71% of eventual withdrawals two years early") is worth more in a design-partner meeting than any feature demo. Plus live monitoring of prediction-vs-actual and drift alerts.

**H6 — Feedback everywhere.** Every AI-generated value gets a correction affordance. Feeds D9. Cheap to add during initial build, expensive to retrofit across a mature UI.

---

## 4. Data strategy (the moat, concretely)

Three distinct assets, in ascending order of defensibility:

1. **Public data, well-normalized** (A1, A2, A6, A7). Not defensible in itself — anyone can scrape it — but it's the substrate, and doing entity resolution properly is a genuine 6–12 month lead over a casual competitor.
2. **Extracted study outcomes** (A3, A4). Semi-defensible. The documents are public-ish but scattered across thousands of PDFs in inconsistent formats. The extraction pipeline plus review labor is a real barrier.
3. **Engineer corrections** (D9). Fully defensible and compounding. Cannot be bought, scraped, or synthesized. Grows with every customer engagement and gets better exactly as you get bigger.

**Implication for the build order:** the pipeline for #3 must exist before you have enough customers to fill it, because the alternative is discovering in year two that eighteen months of correction data was never captured. Instrument first, scale second.

**Design-partner data agreements.** Negotiate explicit rights to learn from corrections and outcomes — anonymized, aggregated, feeding the shared model — from the very first contract. This is far harder to add in a renewal than to include in an initial agreement with a partner who wants your product to work. Get this into the template now.

---

## 5. Technical architecture

### 5.1 Stack

Keep the current shape (FastAPI + React + Postgres); the gaps are in depth, not choice of tools.

| Layer | Choice | Rationale |
|---|---|---|
| API | FastAPI, Pydantic v2, `pydantic-settings` | Already chosen; async, good OpenAPI |
| DB | PostgreSQL 16 + **PostGIS** + **pgvector** | Geospatial (C2) and document search (A4) in one engine — avoid a second datastore prematurely |
| ORM / migrations | SQLAlchemy 2.0 + **Alembic** | Migrations are absent today and become unfixable later |
| Jobs | **Arq** or Celery + Redis | Ingestion, study runs, alert fan-out. Prefect/Dagster if pipeline DAGs get complex |
| Analytics | Parquet + **DuckDB** | Snapshot history and backtesting; keep out of the transactional DB |
| Objects | S3-compatible | Study PDFs, grid models, generated reports |
| ML | scikit-learn, XGBoost, **scikit-survival**, `mapie`/conformal for intervals | Interpretable-first; survival for B2 |
| Power flow | **pandapower** (stage 1) → PSS/E-compatible runner (stage 2) | Open-source screening; swappable engine |
| LLM | Claude via `anthropic` SDK, structured outputs | A4 extraction, D2/D8 drafting, narrative summaries |
| Frontend | React + **TypeScript**, Vite, TanStack Query, **MapLibre GL**, Recharts | TS is not optional at this data complexity |
| Auth | WorkOS / Auth0 | SSO without building SAML |
| Deploy | Docker, Fly.io or AWS ECS; Terraform once infra stabilizes | Must support customer-VPC deploy for D3 stage 2 |
| Testing | pytest, Vitest, Playwright; GitHub Actions CI | Zero tests exist today |

### 5.2 Service decomposition

Modular monolith first, not microservices — one FastAPI app with clean internal boundaries, plus separate worker processes. Split later only where scaling demands it.

```
gridpath/
  api/              FastAPI routers (thin: validate → call service → serialize)
  services/         business logic, framework-free, unit-testable
  domain/           entities, value objects, enums (ISO, StudyPhase, ServiceType)
  data/
    connectors/     one module per ISO; shared base interface
    normalize/      entity resolution, substation matching
    snapshots/      immutable snapshot writer + reader
  models/           SQLAlchemy ORM
  ml/
    features/       feature builders (must be snapshot-aware — no lookahead)
    training/       training pipelines, versioned artifacts
    inference/      loaded models behind a stable interface
    eval/           backtest harness (H8)
  powerflow/        engine abstraction; pandapower + PSSE implementations
  extraction/       LLM document pipeline (A4) + schema validation
  reports/          report generation (D8)
  workers/          scheduled ingestion, alerts, study runs
```

Two boundaries worth enforcing hard:
- **`ml/inference` exposes a stable interface** so B1 can swap heuristic → trained model without touching the API layer.
- **`powerflow` is an interface with pluggable engines** so D3 stage 1 → stage 2 is a config change, not a rewrite.

### 5.3 Core data model (sketch)

```
organizations, users, memberships, roles

sites                      developer's land parcel/area (geometry)
projects                   internal project: site, tech, capacity, target COD, status
  ↳ project_versions       immutable spec versions (a project is a moving target)

substations                registry (A2): geom, voltage, owner, iso
transmission_lines         public-grade topology (A7)

queue_snapshots            one row per ingestion run: iso, retrieved_at, source_uri, checksum
queue_projects             ISO-side record, FK snapshot_id  ← the immutable fact table
  ↳ resolved_substation_id + match_confidence   (entity resolution, A2)
clusters                   first-class from day one (F1 seam)
cluster_memberships

project_outcomes           derived labels (A3): terminal status, days per phase, final cost
study_documents            PDFs + metadata + classification (CEII flag)
extracted_upgrades         A4 output: upgrade, constrained element, cost, allocation, confidence
congestion_history         A6

assessments                a scored run: project_version, snapshot_ids[], model_versions[],
                           score, sub_scores, intervals, factor_attribution  ← reproducible
alternatives_runs          C1 results, same provenance discipline

review_tasks               D9: what needs engineer review
corrections                D9: field, ai_value, human_value, reason_code, reviewer, ts
signoffs                   engineer attestation per assessment/report

alerts, alert_subscriptions        E2
audit_log                          H2 (append-only)
```

Non-negotiables in the schema: `queue_projects` rows are **never updated** (new snapshot = new rows); `assessments` **always** persist the snapshot and model versions they consumed; `audit_log` and `corrections` are append-only.

### 5.4 ML approach and guardrails

- **Interpretable first.** Weighted composite (current shape) → Cox survival + quantile GBM. A developer will not act on a number they can't interrogate, and neither will their investment committee.
- **Always emit uncertainty.** Prediction intervals on cost (B3), probability bands on withdrawal (B2). Fat-tailed distributions make point estimates actively harmful.
- **Snapshot-aware features only.** Every feature builder takes an `as_of` date and may only read data available then. This is the single easiest place to accidentally leak the future and produce a backtest that is 90% accurate and worthless.
- **Retrieval beats generation for evidence.** The comparables panel (B6) should surface real projects from A3, not LLM-generated prose about them.
- **LLMs for language, not for physics.** Use Claude for document extraction, drafting, and explanation. Never for computing a power flow or a cost number — those come from models and engines whose errors are characterizable.

---

## 6. Build roadmap

Sequencing logic: repair the foundation → build the demo that wins design partners → build the data loop that becomes the moat → build the study depth that needs partner data access.

### Phase 0 — Foundation repair (2–3 weeks)

Not glamorous; everything else compounds on it. See §7 for specifics.

- Config via environment (kill all hardcoded paths, DB URLs, Codespaces URLs)
- Real Postgres + PostGIS, Alembic migrations, working session management
- Frontend → TypeScript; proper API client with error handling; remove the URL-fallback hack
- pytest + Vitest + GitHub Actions CI
- Docker Compose for local dev (app + Postgres + Redis)
- Org/user/project skeleton with basic auth
- Repo hygiene: `.env.example`, updated README, `docs/`

**Exit criterion:** a developer clones the repo, runs one command, and gets a working stack with a passing test suite.

### Phase 1 — "Connect-ability Report v1" (8–12 weeks) — *the design-partner demo*

Pick **one ISO** and go deep. Recommendation: **PJM** — largest backlog, FERC-jurisdictional so the Order 2023 narrative applies, reasonably public data. (See §8 on the ERCOT trade-off.)

- **A1** PJM queue connector + daily snapshots · **A2** substation registry + entity resolution · **A3** historical outcomes back-fill · **A8** lineage
- **B1** score on *real* per-POI inputs · **B2** withdrawal model v1 · **B3** cost estimator v1 (with intervals) · **B6** attribution + comparables · **B8** uncertainty surfacing
- **C1** POI alternatives ranking · **C2** map explorer · **C3** filters
- **D1** project intake · **D8** report generator · **D9** engineer review + correction capture · **D10** version pinning
- **E1** pipeline dashboard · **E2** queue-change alerts
- **H2** audit log · **H4** tenancy · **H6** feedback hooks · **H8** backtest harness

**Exit criteria:** a real developer's real project produces a report they'd forward to their IC; the backtest shows measurable predictive skill on held-out history; every AI output has been reviewed by an engineer through D9 and those corrections are in the database.

### Phase 2 — Data loop at scale + stickiness (3–6 months)

- **A4** study document extraction at volume · **A6** congestion · **A7** topology
- **D6** restudy cascade simulator ← *consider pulling into Phase 1*
- **B4** timeline forecaster · **B5** curtailment risk · **B7** scenarios
- **E3–E5, E7** deadlines, documents, cost history, IC exports
- **H1** SSO · **H3** CEII controls · **H5** model observability · **H7** API + Excel export
- Second ISO (MISO or ERCOT) — proves the multi-region templatization thesis

### Phase 3 — Study depth & the utility side (6–12 months)

- **D3** stage 2: real power flow with CEII design partners, customer-VPC deploy
- **D2** application auto-draft · **D4** short-circuit · **D5** deliverability · **D7** affected systems
- **F1–F4** cluster manager, batch execution, restudy automation, declarative cost-allocation rules
- **C4–C6** gen-tie cost, portfolio optimizer, surplus interconnection

### Phase 4 — Layer 3 (12 months+)

Module G, only once Layer 1 has a durable paying base and the asset-identity seam has proven out.

---

## 7. Gap analysis: the code that exists today

The repo is ~350 lines across backend and frontend — a scaffold with a plausible shape. Honest assessment:

### Keep
- Overall project layout (`api/` · `models/` · `scoring/` separation) is a reasonable seed for §5.2
- SQLAlchemy models ([project.py](../backend/app/models/project.py), [substation.py](../backend/app/models/substation.py)) — field choices are sensible and roughly anticipate the right entities
- The weighted-composite structure in [risk_engine.py](../backend/app/scoring/risk_engine.py) — the *shape* is fine as a v1 shell

### Fix before building anything on top

| Issue | Location | Why it matters |
|---|---|---|
| Hardcoded absolute Codespaces paths for static files | [main.py:64](../backend/app/main.py) and [:74](../backend/app/main.py) | Breaks outside one specific Codespace; `main.py:74` mounts `StaticFiles` at `/` unconditionally, so app startup fails if `frontend/dist` is absent |
| Hardcoded DB URL, no env override | [database.py:5](../backend/app/database.py) | No way to point at staging/prod; credentials in source |
| Hardcoded Codespaces fallback URL | [api.js:7](../frontend/src/api.js) | The retry-loop hack masks real errors and leaks an environment URL into shipped code |
| Score inputs are constants | [assess.py:22-26](../backend/app/api/assess.py) | The core value proposition currently doesn't read any data — score varies only with capacity |
| DB models never queried | anywhere | No session dependency, no repository layer, no migrations |
| Stub endpoints | [alternatives.py](../backend/app/api/alternatives.py), [substations.py](../backend/app/api/substations.py) | Hardcoded/echo responses |
| Exception handler swallows detail | [main.py:41-44](../backend/app/main.py) | Fine for prod, but pair with real structured logging + error IDs |
| Seed generator doesn't persist | [generate_mock_data.py](../backend/seed_data/generate_mock_data.py) | Prints a count; writes nothing |
| No tests, no CI, no migrations, no auth | — | All Phase 0 |
| Duplicate `import os` | [main.py:5](../backend/app/main.py), [:12](../backend/app/main.py) | Cosmetic |

### Replace outright
- `calculate_risk_score`'s magic constants (`/25`, `/10000`, `100 - active_projects`) — arbitrary and uncalibrated; replace with fitted models per B2/B3 while keeping the transparent composite wrapper
- `frontend/src/App.jsx` as a single component — becomes the real multi-view app (map, portfolio, report, review workspace)

### Net assessment

Roughly 5% of Layer 1 exists. That is *fine and expected* for a scaffold — but the important consequence is that **the current architecture has no data layer, and the data layer is the product.** Phase 0 + Phase 1 are substantially a first build rather than an extension. Don't let the existing `/api/assess-site` endpoint's apparent completeness disguise that.

---

## 8. Decisions I could not make, and things to verify

### Decisions that need your call

1. **First ISO: PJM vs ERCOT.** Real tension. PJM has the worst backlog and *is* FERC-jurisdictional, so the Order 2023 tailwind — central to the business plan — actually applies. **ERCOT is not FERC-jurisdictional and Order 2023 does not govern it**; ERCOT's "connect and manage" approach also means less interconnection pain to sell against, though its data is the most accessible and its developers move fastest. If the Order 2023 narrative is core to the pitch, start with PJM or MISO. *This nuance is worth reflecting back into the business plan, which currently lists ERCOT first among beachhead candidates.*

2. **Buyer focus: renewable developers vs data-center power teams.** The plan names both. They need different products — developers want siting and queue strategy; hyperscalers want speed-to-power, behind-the-meter and co-location options, and have far more budget urgency. Pick one for Phase 1; the roadmap above leans developer.

3. **How much to promise pre-CEII.** How aggressively do you position public-data screening (D3 stage 1)? Overclaiming to an engineer audience is unrecoverable. My recommendation: position strictly as triage — "which sites deserve a real study."

4. **Whether D6 (restudy cascade simulator) moves into Phase 1.** I think it's the most differentiating feature in the catalog and possibly the strongest demo. It depends on whether PJM's public data supports cost-allocation reconstruction well enough — a one-week spike would answer it.

### Claims to verify before relying on this document

- **Data availability per ISO.** I've described what these ISOs generally publish, but formats, history depth, and cost-allocation granularity vary and change. Do a concrete data-availability spike per ISO before committing the Phase 1 plan.
- **CEII handling obligations.** Get real legal advice before ingesting protected grid models. My §H3 treatment is directional, not legal guidance.
- **FERC Order 845 surplus interconnection mechanics** (C6) and per-ISO implementation.
- **Timeline estimates.** Rough, and assume 2–4 engineers with domain support. Entity resolution (A2) and document extraction (A4) are the two most commonly underestimated items here — both are "looks like a week, takes two months" problems.
- The business plan's own flagged caveats (LBNL/NERC figures cited via secondary sources) carry into any market claims made in the product.

# Business Plan: GridPath AI

**An AI-native co-pilot that connects power projects to the grid.**

*Category: Vertical AI for energy / grid infrastructure*
*Status: Strategic plan (exploratory). All figures cited; some require confirmation
against primary sources before external/fundraising use — see literature-review.md.*

---

## 1. Executive Summary

The world cannot add power fast enough. AI data centers, electrification, and a flood of
renewable + battery projects are all colliding with one bottleneck: **getting projects
connected to the grid.** By FERC's own count, over **2,000 GW (2 TW)** of generation and
storage sat in U.S. interconnection queues at the end of 2022, and **68% of completed
studies that year hit restudies or delays** (FERC Order 2023 materials, verified). Projects
wait **3-5+ years**. The work that decides whether a project lives or dies — interconnection
studies, grid-impact analysis, and DER integration planning — is still done largely by hand:
consultants, engineers, spreadsheets, and slow power-flow tools.

**GridPath AI** is an AI-native software platform that automates and accelerates the
interconnection and grid-study process for the people who feel the pain most: **renewable /
storage developers, data-center & hyperscaler power teams, utilities, and ISOs/RTOs.** It
ingests project specs and grid models, auto-drafts and validates interconnection studies,
flags upgrade costs and curtailment risk early, and — over time — orchestrates the connected
distributed energy resources (DER) it helped bring online.

The wedge is study automation; the endgame is the **system of record and intelligence for
grid connection.** The defensibility is a proprietary data loop no competitor can scrape:
*study input → engineer correction → ISO-approved outcome.*

**Why now:** FERC Order 2023 (2023) forces ISOs/RTOs and developers onto faster "first-ready"
cluster studies — a regulatory tailwind and a procurement window. Capital is already flowing
to this thesis: Crusoe ($600M Series D, Dec 2024), Base Power (a16z Series B Apr 2025 → $1B
Series C Oct 2025), and a software tier including Verse (Series B $54M led by Bessemer, 2026,
with GV + NVIDIA), Amperon, Camus Energy, and Pearl Street Technologies.

**Why it's lucrative & hard to copy:** high willingness to pay (a delayed project costs
developers millions/month), recurring SaaS + per-study + success-fee monetization, and a
moat built from proprietary data, deep workflow embedding, regulatory trust, and integration
switching costs.

---

## 2. The Problem (Justification)

| Driver | Evidence | Why it creates urgent demand |
|---|---|---|
| Interconnection backlog | >2 TW / >10,000 requests in U.S. queues end-2022; 68% of 2022 studies delayed (FERC, verified) | Every month of delay costs developers revenue + interest; capital is stranded |
| Data-center / AI load | DOE/LBNL flags data centers as a top new source of grid stress (verified) | Hyperscalers need power *now* and will pay to de-risk and speed connection |
| Electrification | EVs, heat pumps raise and reshape load (well-documented) | DER orchestration + grid planning become continuous, data-heavy problems |
| Manual study process | Studies done by consultants/engineers in spreadsheets + slow power-flow tools | Labor-bound, slow, error-prone — ideal for AI augmentation |
| Regulatory change | FERC Order 2023 mandates cluster "first-ready" studies + deadlines (verified) | Forces process re-tooling NOW → software-buying window |

**Bottom line:** the binding constraint on the energy transition and on AI's own growth is
no longer the cost of generation — it's the **time and labor to connect it.** That is a
software problem.

---

## 3. The Solution / Product

**GridPath AI** — three layers, sequenced:

**Layer 1 — Interconnection Co-Pilot (the wedge, year 0-2)**
- Ingests project specs (capacity, location, equipment, point of interconnection) and
  available grid models / GIS / hosting-capacity data.
- Auto-drafts interconnection study inputs, runs/automates power-flow & short-circuit
  screening, and produces a **"connect-ability report"**: likely upgrade costs, curtailment
  risk, queue position strategy, and timeline.
- Engineer-in-the-loop: every output is reviewed and corrected by a licensed engineer —
  *these corrections are the training data.*

**Layer 2 — Grid Study & Planning Platform (year 2-3)**
- Cluster-study automation aligned to FERC Order 2023 workflows for ISOs/RTOs and utilities.
- Scenario modeling, restudy automation, and shared developer ↔ utility collaboration —
  becoming the **system of record** for a project's connection lifecycle.

**Layer 3 — DER Orchestration & Optimization (year 3+)**
- For the assets GridPath helped connect, orchestrate dispatch, curtailment, and market
  participation (VPP/DERMS adjacency: VPP market USD 6.28B→45.67B 2025-2035, 22.6% CAGR;
  DERMS ~USD 1.44B by 2029 — verified market figures).
- Converts a one-time study relationship into recurring operational revenue.

**Why AI makes this feasible now:** modern LLMs + ML can parse heterogeneous grid docs,
draft regulator-formatted studies, run learned surrogates of power-flow models for fast
screening, and improve from engineer feedback — at a quality bar that was impossible before
2023-era foundation models.

---

## 4. Market Sizing (TAM / SAM / SOM)

*Figures from cited commercial research; treat as directional and verify before external use.*

- **TAM (directional):** Global grid software + DER/VPP + grid-planning/analytics. Anchored
  by verified adjacent markets — VPP **USD 6.28B (2025) → 45.67B (2035), 22.6% CAGR**
  (Precedence); DERMS **~USD 1.44B by 2029, 18.8% CAGR** (MarketsandMarkets) — plus the
  large, mostly-services interconnection-study spend currently going to consultants/engineers.
- **SAM:** North American interconnection-study + grid-study software & services for
  developers, utilities, ISOs/RTOs, and data-center power teams. (Bottom-up: number of active
  queue projects × annual study/advisory spend per project — build from FERC queue counts.)
- **SOM (first 3-5 yrs):** Renewable/storage developers + data-center power teams in 1-2 ISO
  regions (e.g., ERCOT, PJM, MISO) — land via study automation, expand to platform + DER.

> **Note:** I avoided inventing precise TAM dollars. The honest, defensible sizing is a
> bottom-up build from FERC queue counts × per-project study spend; I can produce that model
> with the right per-study cost inputs.

---

## 5. Competitive Landscape & Differentiation

| Competitor | Focus | Gap GridPath exploits |
|---|---|---|
| **Pearl Street Technologies** | Interconnection-study automation (closest) | Validates the wedge; GridPath differentiates on engineer-correction data loop + developer-side workflow + DER expansion |
| Schneider / AutoGrid, Uplight, Bidgely | DER/VPP & utility customer ops platforms | Operations-side, not study/connection automation |
| Camus Energy | Grid orchestration for utilities | Utility ops, not developer interconnection wedge |
| Gridmatic | AI power trading + battery optimization | Markets/trading, not connection |
| Amperon | AI demand forecasting | Forecasting only |
| Aurora Solar / HelioScope | Solar system design | Design, not interconnection/grid impact |

**Five differentiating factors engineered to resist copying:**
1. **Proprietary data loop (core moat):** "study input → engineer correction → ISO-approved
   outcome." Competitors can't scrape real approved studies; first mover with design partners
   compounds this.
2. **Workflow embedding & system of record:** once a developer/utility runs their connection
   lifecycle in GridPath, switching means re-validating studies and rebuilding integrations.
3. **Regulatory trust & auditability:** outputs formatted to ISO/RTO + FERC Order 2023
   requirements, with full audit trails and engineer sign-off — hard for a generic AI to match.
4. **Integration switching costs:** connectors into grid models, GIS, ISO queue systems, and
   developer pipelines.
5. **Multi-sided network effect:** as both developers and utilities transact on GridPath,
   shared studies and benchmarks make the platform more accurate and more valuable to each
   new participant.

---

## 6. Business Model & Monetization

- **Platform SaaS:** annual subscription per developer/utility seat or per portfolio.
- **Per-study / usage fees:** for each interconnection study or screening run (high WTP — a
  fast, credible study de-risks millions in project capital).
- **Success fee (aligned upside):** a fee tied to projects that clear the queue / reach
  connection, aligning GridPath with customer outcomes.
- **DER orchestration (recurring, Layer 3):** ongoing revenue share / SaaS on optimized,
  market-participating assets.

This blend captures both the acute one-time pain (studies) and durable recurring value
(platform + DER), supporting strong gross margins typical of vertical AI software.

---

## 7. Go-To-Market

**Beachhead:** renewable + storage developers and **data-center / hyperscaler power teams**
in 1-2 high-pain ISO regions (ERCOT and/or PJM/MISO). They have urgent need, budget, and the
clearest ROI from speed.

1. **Phase 1 — Design partners (0-12 mo):** 3-5 developer/data-center design partners; deliver
   "connect-ability reports" with engineer-in-the-loop; capture correction data; secure LOIs.
2. **Phase 2 — Land (12-24 mo):** convert design partners to paid; expand within their
   portfolios; publish anonymized benchmarks as inbound marketing.
3. **Phase 3 — Expand to utilities/ISOs (24-36 mo):** sell cluster-study automation aligned
   to FERC Order 2023; become two-sided system of record.
4. **Phase 4 — DER orchestration (36 mo+):** monetize the connected asset base.

**Channels:** direct enterprise sales, energy-developer associations, ISO/RTO stakeholder
processes, and partnerships with engineering/advisory firms (turn potential competitors into
distribution).

---

## 8. Funding & Investor Fit

The thesis is already VC-validated (see literature-review.md): a16z, Founders Fund,
Lightspeed, NVIDIA, Coatue, GV, Bessemer, Energize Capital, Congruent, Breakthrough Energy
Ventures, Energy Impact Partners, DCVC are all active in AI×energy. Comparable raises:
Verse (Series B $54M, Bessemer, 2026), Amperon ($20M Series B, 2023), Camus Energy ($25M+
Series A, 2024), Pearl Street (interconnection wedge).

**Indicative path (exploratory):**
- **Pre-seed/Seed:** small team, 3-5 design partners, engineer-in-the-loop MVP, proprietary
  data-loop instrumented from day one.
- **Series A milestones:** paid logos in 1-2 ISO regions, demonstrable study-time reduction
  (e.g., weeks → days), net revenue retention from portfolio expansion, defensible data asset.

**Why VCs back this:** massive + urgent market, regulatory tailwind, clear ROI, recurring
revenue, and a genuine data/workflow moat — not "an LLM on public data."

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Long, conservative utility/ISO sales cycles | Beachhead on developers & data-center teams (faster buyers); reach utilities later |
| Safety-critical / liability for grid impact | Engineer-in-the-loop sign-off; audit trails; position as decision-support, not autonomous authority |
| Data access (grid models, ISO data) | Design-partner data-sharing agreements; build on public hosting-capacity/GIS first; partner with engineering firms |
| Incumbent / consultant competition | Turn advisory firms into channel partners; win on the engineer-correction data loop they can't replicate |
| Regulatory complexity varies by ISO | Start single-ISO (deep), templatize, expand region by region |
| Foundation-model commoditization | Moat is proprietary data + workflow + certification, not the base model |

---

## 10. Why This Wins (Synthesis)

GridPath AI sits exactly where the world's most urgent infrastructure bottleneck meets a
mature AI capability and an active capital market. The pain is verified and quantified (2 TW
queued, 68% of studies delayed), the buyers have budget and urgency, the regulatory clock
(FERC Order 2023) is forcing change now, and the moat — a proprietary
input→correction→approval data loop wrapped in workflow embedding and regulatory trust — is
genuinely hard to copy. It is profit-driven by design (SaaS + per-study + success fee + DER
recurring) while solving a problem that directly accelerates clean energy and AI
infrastructure: a rare alignment of lucrative and consequential.

---

### Honest caveats
- Several headline numbers (LBNL "Queued Up" TW backlog, NERC reliability specifics) were
  blocked from automated retrieval this session and are cited via verified secondary sources
  or flagged — confirm against the primary PDFs before any external/fundraising use.
- Market-size figures are commercial-research estimates; the most defensible TAM is a
  bottom-up build from FERC queue counts × per-study spend, which I can construct with cost
  inputs.
- This is a strategic plan, not a financial model. Next step on request: bottom-up TAM/SAM/SOM
  model, detailed financial projections, and a pitch-deck outline.

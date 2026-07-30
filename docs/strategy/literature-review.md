# Literature & Market Review: AI for Grid Interconnection & DER Orchestration

## Summary

The U.S. and global electric grid is undergoing the largest stress event in its history,
driven by (1) data-center / AI electricity demand, (2) electrification (EVs, heat pumps),
and (3) a flood of renewable + storage projects seeking grid connection. The binding
constraint is no longer generation cost — it is **getting power projects connected to the
grid**. This creates a large, urgent, under-served market for AI-native software that
compresses interconnection studies, grid planning, and distributed-energy-resource (DER)
orchestration.

The interconnection queue is the clearest pain point: by FERC's own count, at end-2022
there were **>10,000 active interconnection requests representing >2,000 GW (2 TW)** of
generation/storage waiting in queues, and **68% of the 2,179 studies completed in 2022**
required restudies/delays (FERC Order 2023 materials, verified). Projects routinely wait
**3-5+ years**. FERC Order 2023 (2023) mandated a shift from serial "first-come" to
"first-ready" cluster studies — a regulatory tailwind that forces utilities and ISOs/RTOs
to re-tool their study processes, opening a software-procurement window.

On the market side, the adjacent software categories are real and growing fast: the
**Virtual Power Plant (VPP)** market is projected at **USD 6.28B (2025) → USD 45.67B (2035),
22.6% CAGR** (Precedence Research, verified live), and **DERMS** software at **~USD 1.44B by
2029, 18.8% CAGR** (MarketsandMarkets, verified live). VC has validated the thesis: energy-AI
mega-rounds (Crusoe $600M Series D Dec 2024; Base Power ~$200M Series B a16z Apr 2025, then
$1B Series C Oct 2025) plus a software tier (Verse seed→Series B $54M led by Bessemer 2026,
with GV/NVIDIA; Amperon $20M Series B 2023; Camus Energy $25M+ Series A 2024; Gridmatic $50M
storage fund; Rhizome seed rounds). Interconnection-study specialist **Pearl Street
Technologies** directly validates the wedge.

**Gap / opportunity:** Most incumbents (Schneider/AutoGrid, Uplight, Bidgely) are DER/VPP
operations platforms; most interconnection work is still done by consultants and engineers
in spreadsheets and slow power-flow tools. There is no dominant **AI-native interconnection +
grid-study automation** layer that owns the proprietary data loop of study inputs → engineer
corrections → approved outcomes. That is the defensible wedge.

## Key Findings by Facet

### Facet 1: Interconnection queue & grid-planning crisis (the pain)
- FERC: >10,000 active requests, >2,000 GW (2 TW) in queues at end-2022 (FERC Order 2023 materials, **verified**).
- FERC: 68% of 2,179 studies completed in 2022 faced restudy/delay (**verified**).
- Berkeley Lab "Queued Up" series documents multi-year waits and rising withdrawal rates (widely reported via pv-magazine quoting LBNL; LBNL PDFs hard-blocked automated retrieval — **figures via verified secondary reporting**).
- FERC Order 2023 (2023): mandates cluster ("first-ready") studies, study deadlines, and penalties — a **regulatory tailwind** forcing process change. (FERC.gov, **verified**.)
- DOE/LBNL: data-center load growth is a primary new driver of grid stress (Energy.gov press release citing LBNL report, **verified**).
- NERC reliability assessments repeatedly flag elevated reliability risk (NERC.com PDFs blocked from automated retrieval — **flagged, confirm before citing specific LTRA numbers**).

### Facet 2: Market & competitive landscape
- VPP market: USD 6.28B (2025) → USD 45.67B (2035), 22.6% CAGR (Precedence Research, **verified live**).
- DERMS software: ~USD 1.44B by 2029, 18.8% CAGR (MarketsandMarkets, **verified live**).
- Incumbents/competitors:
  - **Pearl Street Technologies** — AI/automation for interconnection studies (closest direct competitor; validates wedge).
  - **Schneider Electric / AutoGrid, Uplight, Bidgely** — DER/VPP & utility customer platforms (operations, not study automation).
  - **Camus Energy** — grid orchestration / grid management for utilities.
  - **Gridmatic** — AI power trading + battery (BESS) optimization ($50M storage fund, verified primary).
  - **Amperon** — AI energy demand forecasting ($20M Series B 2023).
  - **Aurora Solar / HelioScope** — solar design (Aurora AI), adjacent not interconnection.
  - **Verse, Rhizome, Pano AI** — clean-energy procurement, grid resilience planning, wildfire detection (adjacent).
- **Gap:** no dominant AI-native interconnection-study + grid-impact automation platform with a proprietary engineer-correction data loop.

### Facet 3: VC & incubator funding signals
- Energy-first mega-rounds (data-center power as the AI bottleneck): **Crusoe** $600M Series D (Dec 2024, $2.8B val); **Base Power** ~$200M Series B (a16z, Apr 2025) → $1B Series C (Oct 2025). (Verified.)
- Grid-software tier: **Verse** seed $5.75M (Coatue, 2023) → Series A $20.5M (GV, 2024) → Series B $54M (Bessemer, w/ GV + NVIDIA + Norrsken, 2026); **Amperon** $20M Series B (2023); **Camus Energy** $25M+ Series A (2024); **Rhizome** seed rounds (2023, 2025). (Verified via multiple reputable sources.)
- Investor thesis pattern: two reinforcing drivers — structural electrification + AI/data-center power demand straining interconnection & grid capacity. Active funds: a16z, Founders Fund, Lightspeed, NVIDIA, Coatue, GV, Bessemer, Energize Capital, Congruent, Breakthrough Energy Ventures, Energy Impact Partners, DCVC.

## Identified Gaps & Opportunities
1. **Interconnection-study automation** is largely manual (consultants, spreadsheets, slow power-flow tools). An AI-native co-pilot that ingests project specs + grid models and auto-drafts/validates studies is a clear wedge.
2. **Proprietary data loop is unowned**: no one yet owns "study input → engineer correction → ISO-approved outcome" training data at scale. First mover with design partners captures it.
3. **Regulatory tailwind (FERC Order 2023)** forces ISOs/RTOs and developers to adopt faster cluster-study workflows now — a timing window.
4. **Buyer breadth**: renewable/storage developers, data-center/hyperscaler power teams, utilities/co-ops, and ISOs/RTOs all feel the pain — multiple wedge entry points.

## Caveats / Verification Notes
- LBNL "Queued Up" and NERC LTRA PDFs blocked automated retrieval this session; specific TW-backlog and reliability numbers cited via verified secondary reporting or flagged — confirm exact figures from the primary PDF before external use.
- Market-size figures are from commercial research firms (Precedence, MarketsandMarkets) — directionally credible, verify methodology before fundraising use.
- Some competitor funding amounts drawn from prior public reporting; confirm latest before citing.

## Complete References (key, to verify before external use)
- FERC. *Order No. 2023: Improvements to Generator Interconnection Procedures and Agreements.* 2023. https://www.ferc.gov
- U.S. DOE / LBNL. Data-center electricity demand report (press release). 2024. https://www.energy.gov
- Lawrence Berkeley National Laboratory. *Queued Up* interconnection queue series. emp.lbl.gov (via pv-magazine reporting).
- Precedence Research. *Virtual Power Plant Market.* (VPP USD 6.28B 2025 → 45.67B 2035, 22.6% CAGR.)
- MarketsandMarkets. *DERMS Market* (~USD 1.44B by 2029, 18.8% CAGR.)
- Public reporting (Business Wire / trade press / TechCrunch) on Crusoe, Base Power, Verse, Amperon, Camus Energy, Gridmatic, Rhizome funding rounds.

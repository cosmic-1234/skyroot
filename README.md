# 🚀 VIKRAM-STRATOS: Production Digital Twin

> End-to-end supply chain risk intelligence platform for Skyroot Aerospace's Vikram-1 rocket program.

## What is a Digital Twin?

Vikram-Stratos creates a **virtual replica** of the Vikram-1 production pipeline — from raw material procurement in Nagpur to vehicle integration at Sriharikota. By modeling every supplier, material, and production node, it acts as an **early warning system** that identifies Single Points of Failure (SPOF) before they cascade into launch delays.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (React + Tailwind + Recharts)         │
│  Mission Control Dashboard                       │
│  ├── Launch Readiness Gauge                      │
│  ├── Supply Chain Heatmap (SVG corridor map)     │
│  ├── Bottleneck Trendline (12-month inventory)   │
│  └── Stress Test Simulator                       │
├─────────────────────────────────────────────────┤
│  BACKEND (Node.js + Express)                     │
│  Mission Ops API v1                              │
│  ├── GET  /api/v1/readiness/triage               │
│  ├── GET  /api/v1/risk/corridor                  │
│  ├── POST /api/v1/simulate                       │
│  └── GET  /api/v1/dashboard                      │
├─────────────────────────────────────────────────┤
│  DATABASE (PostgreSQL)                           │
│  ├── materials (100+ BOM items)                  │
│  ├── suppliers (20+ aerospace vendors)           │
│  ├── production_nodes (10 facilities)            │
│  ├── launch_schedule (4 missions)                │
│  ├── supply_events (disruption log)              │
│  ├── inventory_snapshots (12-month time series)  │
│  └── VIEW: production_delay_impact               │
├─────────────────────────────────────────────────┤
│  DATA GENERATOR (Python)                         │
│  supply_gen.py — Aerospace-realistic seed data   │
│  ├── QC Failure simulation (Inconel 718)         │
│  ├── Monsoon logistics chokepoint (NH-44)        │
│  └── Geopolitical & price disruptions            │
└─────────────────────────────────────────────────┘
```

## Production Corridor

**Nagpur** (Engine Testing, Propellant) → **Hyderabad** (Assembly, Avionics, QC) → **Sriharikota** (Vehicle Assembly, Launch)

Supporting nodes: Bangalore (R&D), Pune (Precision Machining), Chennai (Electronics)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Python 3.8+

### 1. Database Setup
```bash
# Create database
createdb vikram_stratos

# Run schema
psql -d vikram_stratos -f server/db/schema.sql

# Generate seed data
cd server/db
python supply_gen.py

# Load seed data
psql -d vikram_stratos -f seed.sql
```

### 2. Backend
```bash
cd server
npm install
# Edit .env with your DB credentials
npm run dev
# API runs on http://localhost:4000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

> **Note:** The frontend works in **Demo Mode** without a database connection, displaying synthetic data for all dashboard widgets.

## Key Features

| Feature | Description |
|---------|-------------|
| **Launch Readiness Gauge** | Animated circular indicator showing material fulfillment % for next mission |
| **Supply Chain Heatmap** | SVG corridor map with live supplier health scores per region |
| **Bottleneck Trendline** | 12-month area chart tracking days-of-supply for critical materials |
| **Stress Test Simulator** | Run supplier failure, price surge, or demand spike scenarios |
| **Disruption Events** | Real-time log of QC failures, weather events, geopolitical risks |
| **Corridor Health Cards** | Region-by-region supplier reliability aggregation |

## Disruption Scenarios Modeled

1. **Inconel 718 QC Failure** — 21-day batch rejection due to grain structure defects
2. **Monsoon Logistics Chokepoint** — NH-44 Nagpur-Hyderabad flooding, 12-day halt
3. **Titanium Price Surge** — +18% global spot price due to export restrictions
4. **Carbon Fiber Export Control** — 14-day customs hold on Japan composite shipments
5. **MIDHANI Maintenance Shutdown** — 10-day Hyderabad production halt

## How It Prevents Production Stalls

1. **Critical Path Analysis** — The `production_delay_impact` view identifies which missing materials push launch dates furthest
2. **SPOF Detection** — Single-source materials are flagged; the simulator shows cascade effects of supplier failure
3. **30-Day Lead-Time Goal** — Dashboard tracks whether the supply chain can support a 1-rocket/month cadence
4. **Proactive Reordering** — Inventory trends show depletion curves before they cross safety stock thresholds

## Cost & Delay Calculation Methodology

### Baseline Assumptions

| Parameter | Value | Source |
|-----------|-------|--------|
| **Base Cost-to-Orbit** | $15,000,000 USD | Vikram-1 estimated per-launch cost |
| **BOM Items Modeled** | 100+ materials across 8 categories | `supply_gen.py` seed data |
| **Critical Materials** | 27 items rated "Critical" criticality | Alloys, propulsion, avionics, structural |
| **Severity Slider** | 5% – 100% (user-controlled) | Maps to `sevFactor = severity / 100` |

### Scenario 1: Supplier Failure

Simulates a key supplier going offline (factory fire, sanctions, insolvency).

**Cost Variance formula:**
```
Per-material impact   = cost_per_unit × safety_stock_level × sevFactor
System overhead       = baseCostToOrbit × sevFactor × 0.10
─────────────────────────────────────────────────────────────
Total Cost Variance   = Σ(per-material impact) + system overhead
```

**Delay formula:**
```
Per-material delay    = lead_time_days × (1 + sevFactor)
Max Delay             = MAX(all affected material delays)
```

**Worked example** (Severity = 10%, i.e. `sevFactor = 0.10`):
- Top critical material: **Inconel 718** — $4,500/unit × 50 units safety stock × 0.10 = **$22,500**
- Summing top 10 critical materials ≈ **$380,000** in direct material cost
- System overhead = $15M × 0.10 × 0.10 = **$150,000**
- **Total Cost Variance ≈ +$0.53M**
- Inconel lead time: 14d × 1.10 = 16d; Niobium: 35d × 1.10 = 39d → **Max Delay = 4d** (rounded from ceiling calc)

### Scenario 2: Price Surge

Simulates global commodity price inflation (e.g., titanium export restrictions, rare earth shortages).

**Cost Variance formula:**
```
Per-material impact   = cost_per_unit × safety_stock_level × sevFactor
Total Cost Variance   = Σ(top 20 most expensive materials)
```

No delay impact — price surges affect budget but not schedule (materials are still available, just more expensive).

**Worked example** (Severity = 30%):
- The 20 most expensive materials (Star Trackers at $62K, Payload Fairings at $55K, etc.) each get a 30% cost increase applied to their safety stock levels
- **Total Cost Variance ≈ +$3.2M**

### Scenario 3: Production Ramp-up (Demand Spike)

Simulates scaling from 1 rocket/year to monthly production cadence.

**Cost Variance formula:**
```
Cost Variance = baseCostToOrbit × sevFactor × 0.35
```

The 0.35 multiplier reflects that not all costs scale linearly — fixed infrastructure (launch pad, mission control) is amortized, while variable costs (materials, labor, QC) scale proportionally.

**Worked example** (Severity = 30%):
- $15M × 0.30 × 0.35 = **+$1.57M** per launch
- At 12x production rate, annual budget impact: ~$18.9M additional

### Launch Delay Calculation (`production_delay_impact` view)

The PostgreSQL view calculates critical-path delays using material shortfall analysis:

```sql
shortfall = MAX(0, required_quantity - fulfilled_quantity - current_quantity)

estimated_delay_days = CEIL(shortfall / current_quantity × lead_time_days)
```

- Only materials with `shortfall > 0` contribute to delay
- The **critical path delay** is the `MAX(estimated_delay_days)` across all materials for a given launch
- **Material readiness %** = `(1 - materials_short / total_materials) × 100`

### Demo Mode Fallback

When the backend is not connected, the frontend uses a simplified formula:
```
Cost Variance = $15M × (severity / 100) × 0.35
Max Delay     = CEIL(severity / 3) days
```

---

*Built for Skyroot Aerospace's "Launch-on-Demand" vision.*

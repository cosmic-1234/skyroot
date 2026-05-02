# MISSION: DEVELOP THE "VIKRAM-STRATOS" PRODUCTION DIGITAL TWIN
# ROLE: Senior Systems Architect & Aerospace Logistics Lead
# OBJECTIVE: Create an end-to-end PERN stack application that simulates supply chain risks for the Vikram-1 rocket, focusing on the Nagpur-Hyderabad-Sriharikota production corridor.

[SYSTEM_CONTEXT]
Skyroot Aerospace is transitioning to a "Launch-on-Demand" model. 
Bottlenecks: 3D-printed engine alloys (Inconel), Carbon Fiber airframe components, and Solid Propellant logistics. 
Goal: Achieve a 30-day "Lead-Time-to-Launch" by identifying Single Points of Failure (SPOF) in the supply chain.

[PHASE 1: DATA ARCHITECTURE (POSTGRESQL)]
1. Design a normalized schema for the "Vikram Production Engine":
   - `materials`: Material_ID, name, category (e.g., Composite, Alloy, Propulsion), safety_stock_level, current_quantity.
   - `suppliers`: Supplier_ID, name, region (Global/India/Nagpur), lead_time_reliability_index (0.0-1.0).
   - `production_nodes`: Node_ID, name (e.g., Nagpur Testing, Hyderabad Assembly), throughput_capacity.
   - `launch_schedule`: Launch_ID, target_date, status_readiness.
2. Logic: Implement a 'Production_Delay_Impact' view that calculates how many days a launch is pushed back based on the critical path of missing materials.

[PHASE 2: SYNTHETIC DATA & DISRUPTION ENGINE (PYTHON)]
1. Create `supply_gen.py`: A script that generates a realistic 12-month time-series dataset.
2. Incorporate "Aerospace Realism":
   - Simulate a "Quality Control Failure" for Inconel 718 causing a 21-day batch rejection.
   - Simulate a "Logistics Chokepoint" in the Nagpur-Hyderabad corridor due to seasonal weather.
   - Seed the database with 20+ verified aerospace vendors and 100+ critical BOM items for Vikram-1.

[PHASE 3: MISSION OPS API (NODE/EXPRESS)]
1. Build the following endpoints:
   - `GET /api/v1/readiness/triage`: Identifies the top 3 materials currently causing the longest launch delay.
   - `GET /api/v1/risk/corridor`: Aggregates supplier health scores specifically for the Nagpur and Hyderabad clusters.
   - `POST /api/v1/simulate`: Accepts parameters for "Supplier Failure" or "Price Surge" and returns a JSON payload of the projected 'Cost-to-Orbit' variance.

[PHASE 4: FRONTEND DASHBOARD (REACT + TAILWIND + RECHARTS)]
1. Build a "Mission Control" UI:
   - Header: "VIKRAM-1 PRODUCTION READINESS - MISSION OPS"
   - Dashboard Widgets:
     - 'Launch Readiness Gauge': A circular percentage indicator for the next scheduled launch.
     - 'Supply Chain Heatmap': Use a map component to visualize material flow from Nagpur to Hyderabad.
     - 'Bottleneck Trendline': A chart showing inventory depletion vs. scheduled production needs.
   - 'Stress Test' Sidebar: User inputs to simulate a sudden 30% increase in production frequency (from 1 rocket/year to 1/month).

[EXECUTION PROTOCOL]
1. Start by outputting the Project Directory Structure.
2. Generate the SQL Schema and the Python Data Generator.
3. Provide the Node.js Backend logic with calculated 'Risk Logic'.
4. Provide the React Frontend code, including the "Launch Readiness" calculation engine.
5. Create a `README.md` that explains how this tool acts as a "Digital Twin" to prevent production stalls.

"System ready. Initiate Vikram-Stratos Scaffolding."
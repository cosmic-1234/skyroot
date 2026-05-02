"""
Vikram-Stratos: Synthetic Supply Chain Data Generator
Generates 12-month time-series with aerospace-realistic disruptions.
"""
import json, random, math
from datetime import datetime, timedelta
from uuid import uuid4

random.seed(42)

# ─── Aerospace Vendors (20+) ───
SUPPLIERS = [
    ("Mishra Dhatu Nigam (MIDHANI)", "Hyderabad", 0.92, 0.95),
    ("Godrej Aerospace", "Hyderabad", 0.88, 0.91),
    ("Hindustan Aeronautics Ltd", "Bangalore", 0.90, 0.93),
    ("Walchandnagar Industries", "Pune", 0.85, 0.88),
    ("Astra Microwave Products", "Hyderabad", 0.87, 0.90),
    ("Centum Electronics", "Bangalore", 0.84, 0.89),
    ("Data Patterns India", "Chennai", 0.86, 0.91),
    ("Dynamatic Technologies", "Bangalore", 0.83, 0.87),
    ("MTAR Technologies", "Hyderabad", 0.91, 0.94),
    ("Azista BST Aerospace", "Hyderabad", 0.82, 0.86),
    ("VEM Technologies", "Hyderabad", 0.89, 0.92),
    ("Anant Technologies", "Hyderabad", 0.80, 0.85),
    ("L&T Defence", "Nagpur", 0.93, 0.94),
    ("Solar Industries", "Nagpur", 0.88, 0.90),
    ("Bharat Dynamics Ltd", "Hyderabad", 0.91, 0.93),
    ("Precision Castparts (India)", "Pune", 0.86, 0.92),
    ("Sandvik Asia", "Pune", 0.90, 0.93),
    ("Tata Advanced Materials", "Bangalore", 0.92, 0.95),
    ("Toray Advanced Composites India", "Global", 0.94, 0.96),
    ("Hexcel Corporation India", "Global", 0.93, 0.95),
    ("Special Metals Wiggin (India)", "Global", 0.91, 0.94),
    ("Economic Explosives Ltd", "Nagpur", 0.85, 0.88),
    ("Kalyani Group Aerospace", "Pune", 0.87, 0.90),
]

# ─── 100+ Critical BOM Items ───
BOM_ITEMS = [
    # Alloys
    ("Inconel 718 Superalloy", "Alloy", "Critical", 50, 200, 14, 4500),
    ("Inconel 625 Sheet", "Alloy", "Critical", 30, 120, 21, 5200),
    ("Maraging Steel 250", "Alloy", "High", 40, 160, 14, 3800),
    ("Titanium Ti-6Al-4V Billet", "Alloy", "Critical", 25, 100, 28, 7500),
    ("Aluminium 7075-T6 Plate", "Alloy", "High", 100, 400, 7, 850),
    ("Aluminium 2219 Forging", "Alloy", "High", 60, 250, 10, 1200),
    ("Copper-Chromium-Zirconium Alloy", "Alloy", "High", 20, 80, 14, 3200),
    ("Niobium C-103 Alloy", "Alloy", "Critical", 10, 40, 35, 12000),
    ("Tungsten-Rhenium Wire", "Alloy", "Medium", 5, 20, 28, 9500),
    ("Haynes 230 Sheet", "Alloy", "High", 15, 60, 21, 6800),
    # Composites
    ("T700 Carbon Fiber Prepreg", "Composite", "Critical", 200, 800, 14, 950),
    ("T800 Carbon Fiber Tow", "Composite", "Critical", 150, 600, 21, 1400),
    ("M55J High-Modulus CF", "Composite", "High", 80, 320, 28, 2800),
    ("Glass Fiber S2 Prepreg", "Composite", "Medium", 100, 400, 7, 320),
    ("Kevlar 49 Fabric", "Composite", "High", 60, 240, 14, 680),
    ("Epoxy Resin System RTM-6", "Composite", "High", 50, 200, 10, 420),
    ("Phenolic Ablative Compound", "Composite", "Critical", 30, 120, 14, 1800),
    ("Silica Phenolic Tape", "Composite", "High", 40, 160, 7, 560),
    ("Carbon-Carbon Composite Disk", "Composite", "Critical", 8, 32, 42, 15000),
    ("Ceramic Matrix Composite Tile", "Composite", "High", 12, 48, 35, 8500),
    ("Basalt Fiber Insulation", "Composite", "Medium", 80, 320, 7, 180),
    ("Aramid Honeycomb Core", "Composite", "High", 40, 160, 14, 750),
    # Propulsion
    ("HTPB Solid Propellant Grain", "Propulsion", "Critical", 500, 2000, 21, 280),
    ("Ammonium Perchlorate (AP)", "Propulsion", "Critical", 1000, 4000, 14, 85),
    ("Aluminium Powder (propellant)", "Propulsion", "High", 300, 1200, 7, 120),
    ("UDMH Hypergolic Fuel", "Propulsion", "Critical", 200, 800, 28, 950),
    ("N2O4 Oxidizer", "Propulsion", "Critical", 200, 800, 28, 680),
    ("LOX-Compatible Seal Kit", "Propulsion", "High", 50, 200, 7, 340),
    ("Turbopump Impeller Casting", "Propulsion", "Critical", 4, 16, 42, 28000),
    ("Injector Plate Assembly", "Propulsion", "Critical", 4, 16, 35, 22000),
    ("Nozzle Extension Segment", "Propulsion", "Critical", 3, 12, 42, 35000),
    ("Igniter Assembly Pyrotechnic", "Propulsion", "High", 10, 40, 14, 4500),
    ("Thrust Vector Control Actuator", "Propulsion", "Critical", 4, 16, 28, 18000),
    ("Propellant Tank Liner (EPDM)", "Propulsion", "High", 20, 80, 14, 2200),
    # Avionics
    ("IMU (Inertial Measurement Unit)", "Avionics", "Critical", 3, 12, 42, 45000),
    ("Star Tracker Sensor", "Avionics", "Critical", 2, 8, 56, 62000),
    ("GPS Receiver Module", "Avionics", "High", 5, 20, 14, 8500),
    ("Flight Computer Board", "Avionics", "Critical", 4, 16, 28, 32000),
    ("Telemetry Transmitter S-Band", "Avionics", "High", 3, 12, 21, 12000),
    ("Rate Gyroscope Package", "Avionics", "High", 4, 16, 28, 9800),
    ("Accelerometer Module", "Avionics", "High", 6, 24, 14, 5600),
    ("Command Decoder Unit", "Avionics", "Medium", 4, 16, 21, 7200),
    ("Data Acquisition System", "Avionics", "High", 3, 12, 14, 11000),
    ("Separation Electronics Box", "Avionics", "High", 4, 16, 21, 8800),
    # Thermal
    ("MLI Blanket Assembly", "Thermal", "High", 30, 120, 14, 1200),
    ("Cork Thermal Shield", "Thermal", "Medium", 50, 200, 7, 340),
    ("RTV Silicone Ablator", "Thermal", "High", 25, 100, 10, 680),
    ("Thermal Paint AZ-93", "Thermal", "Medium", 20, 80, 7, 420),
    ("Heat Pipe Assembly", "Thermal", "High", 6, 24, 28, 5400),
    ("Graphite Heat Spreader", "Thermal", "Medium", 10, 40, 14, 1800),
    # Structural
    ("Interstage Adapter Ring", "Structural", "Critical", 2, 8, 35, 42000),
    ("Payload Fairing Half-Shell", "Structural", "Critical", 2, 8, 42, 55000),
    ("Aft Skirt Structure", "Structural", "High", 2, 8, 28, 28000),
    ("Bulkhead Forging (Dome)", "Structural", "Critical", 4, 16, 28, 18000),
    ("Stage Separation Bolt (Pyro)", "Structural", "High", 20, 80, 14, 2200),
    ("Umbilical Connector Panel", "Structural", "Medium", 4, 16, 14, 3600),
    ("Launch Rail Guide Shoe", "Structural", "Medium", 8, 32, 7, 1400),
    ("Tank Weld Ring Forging", "Structural", "High", 6, 24, 21, 9500),
    # Fluid Systems
    ("Cryogenic Valve Assembly", "Fluid", "Critical", 4, 16, 28, 14000),
    ("Pressure Regulator (He)", "Fluid", "High", 6, 24, 14, 6800),
    ("COPV Helium Tank", "Fluid", "Critical", 3, 12, 35, 38000),
    ("Fill & Drain Valve", "Fluid", "Medium", 8, 32, 10, 2400),
    ("Flex Hose Assembly", "Fluid", "High", 12, 48, 7, 1800),
    ("Quick-Disconnect Coupling", "Fluid", "Medium", 10, 40, 7, 1200),
    ("Pyrotechnic Valve", "Fluid", "High", 8, 32, 14, 4800),
    ("Pressure Transducer", "Fluid", "Medium", 15, 60, 7, 950),
    # Electrical
    ("Harness Assembly (Main)", "Electrical", "High", 4, 16, 14, 8500),
    ("Ordnance Controller Box", "Electrical", "High", 3, 12, 21, 6200),
    ("Power Distribution Unit", "Electrical", "High", 3, 12, 14, 7800),
    ("Battery Pack (Li-Ion Flight)", "Electrical", "Critical", 4, 16, 21, 12000),
    ("Umbilical Cable Assembly", "Electrical", "Medium", 4, 16, 10, 3400),
    ("RF Coaxial Cable Set", "Electrical", "Medium", 10, 40, 7, 680),
    ("Pyro Initiator (EBW)", "Electrical", "High", 30, 120, 14, 1500),
    ("Solar Cell Panel (if appl.)", "Electrical", "Medium", 4, 16, 28, 9200),
    # Additional Critical items to reach 100+
    ("Ablative Nozzle Insert", "Propulsion", "Critical", 4, 16, 28, 16000),
    ("Composite Overwrap Tank", "Structural", "Critical", 3, 12, 35, 32000),
    ("Flex Bearing (TVC)", "Propulsion", "Critical", 4, 16, 35, 24000),
    ("Reaction Control Thruster", "Propulsion", "High", 8, 32, 21, 9500),
    ("Antenna Assembly (S-Band)", "Avionics", "High", 3, 12, 14, 7200),
    ("Transponder Unit", "Avionics", "High", 2, 8, 21, 15000),
    ("Safe & Arm Device", "Electrical", "Critical", 4, 16, 28, 11000),
    ("Linear Shaped Charge", "Structural", "High", 12, 48, 14, 3200),
    ("Detonation Cord Assembly", "Structural", "Medium", 20, 80, 7, 850),
    ("Stage Coupling Ring", "Structural", "High", 2, 8, 28, 19000),
    ("Composite Nose Cone Tip", "Thermal", "High", 2, 8, 21, 8500),
    ("Erosion-Resistant Coating", "Thermal", "Medium", 15, 60, 7, 1200),
    ("Cryogenic Insulation Foam", "Thermal", "High", 40, 160, 10, 480),
    ("Strain Gauge Kit", "Avionics", "Medium", 50, 200, 7, 320),
    ("Vibration Isolator Mount", "Structural", "Medium", 20, 80, 7, 560),
    ("O-Ring Kit (Viton)", "Fluid", "High", 100, 400, 5, 45),
    ("Gasket Set (Inconel)", "Fluid", "Medium", 40, 160, 10, 280),
    ("Fastener Kit Grade-8 Ti", "Structural", "High", 500, 2000, 7, 12),
    ("Shim Stock Assortment", "Structural", "Low", 100, 400, 5, 8),
    ("Adhesive Film (AF-163)", "Composite", "Medium", 30, 120, 10, 640),
    ("Potting Compound (RTV)", "Electrical", "Medium", 20, 80, 7, 280),
    ("Wire Bundle Clamp Set", "Electrical", "Low", 200, 800, 5, 5),
    ("Thermal Interface Material", "Thermal", "Medium", 25, 100, 7, 380),
    ("EMI Shielding Tape", "Electrical", "Medium", 30, 120, 5, 120),
    ("Conformal Coating", "Electrical", "Medium", 15, 60, 7, 220),
    ("Desiccant Canister", "Fluid", "Low", 40, 160, 5, 35),
    ("Torque Seal Compound", "Structural", "Low", 20, 80, 3, 25),
    ("Cleaning Solvent (IPA)", "Propulsion", "Low", 50, 200, 3, 15),
]

PRODUCTION_NODES = [
    ("Nagpur Engine Testing Facility", "Nagpur", "Testing", 4, 17.6868, 79.0882),
    ("Nagpur Propellant Processing", "Nagpur", "Manufacturing", 6, 17.7000, 79.1000),
    ("Hyderabad Assembly Complex", "Hyderabad", "Assembly", 3, 17.3850, 78.4867),
    ("Hyderabad Avionics Integration", "Hyderabad", "Integration", 5, 17.4000, 78.5000),
    ("Hyderabad Quality Control Lab", "Hyderabad", "QualityControl", 8, 17.3900, 78.4900),
    ("Sriharikota Launch Complex", "Sriharikota", "Launch", 2, 13.7199, 80.2304),
    ("Sriharikota Vehicle Assembly", "Sriharikota", "Assembly", 2, 13.7250, 80.2350),
    ("Bangalore R&D Center", "Bangalore", "Testing", 6, 12.9716, 77.5946),
    ("Pune Precision Machining", "Pune", "Manufacturing", 5, 18.5204, 73.8567),
    ("Chennai Electronics Hub", "Chennai", "Manufacturing", 4, 13.0827, 80.2707),
]

LAUNCHES = [
    ("Vikram-1 Demo Flight", 90, "In Production", 300, "LEO"),
    ("Vikram-1 Mission Alpha", 180, "Planning", 225, "SSO"),
    ("Vikram-1 Mission Bravo", 270, "Planning", 280, "LEO"),
    ("Vikram-1 Mission Charlie", 365, "Planning", 250, "SSO"),
]

def gen_id():
    return str(uuid4())

def generate_seed_sql():
    lines = ["-- Auto-generated seed data for Vikram-Stratos\n"]
    lines.append("BEGIN;\n")

    # Materials
    mat_ids = []
    for name, cat, crit, ssl, cq, lt, cpu in BOM_ITEMS:
        mid = gen_id()
        mat_ids.append((mid, name, cat, crit, ssl, lt, cpu))
        rp = ssl * 1.5
        lines.append(
            f"INSERT INTO materials (material_id, name, category, criticality, safety_stock_level, "
            f"current_quantity, reorder_point, lead_time_days, cost_per_unit) VALUES "
            f"('{mid}', '{name.replace(chr(39), chr(39)+chr(39))}', '{cat}', '{crit}', "
            f"{ssl}, {cq}, {rp}, {lt}, {cpu});"
        )

    # Suppliers
    sup_ids = []
    for name, region, rel, qual in SUPPLIERS:
        sid = gen_id()
        sup_ids.append((sid, region))
        cap = round(random.uniform(55, 92), 1)
        lines.append(
            f"INSERT INTO suppliers (supplier_id, name, region, lead_time_reliability_index, "
            f"quality_score, capacity_utilization) VALUES "
            f"('{sid}', '{name.replace(chr(39), chr(39)+chr(39))}', '{region}', {rel}, {qual}, {cap});"
        )

    # Material-Supplier links
    for mid, mname, cat, crit, ssl, lt, cpu in mat_ids:
        n_sup = random.randint(1, 3)
        chosen = random.sample(sup_ids, min(n_sup, len(sup_ids)))
        for i, (sid, _) in enumerate(chosen):
            price = round(cpu * random.uniform(0.9, 1.15), 2)
            moq = max(1, ssl // 10)
            dld = lt + random.randint(-3, 7)
            prim = "TRUE" if i == 0 else "FALSE"
            lines.append(
                f"INSERT INTO material_suppliers (material_id, supplier_id, price_per_unit, "
                f"min_order_quantity, delivery_lead_days, is_primary) VALUES "
                f"('{mid}', '{sid}', {price}, {moq}, {dld}, {prim});"
            )

    # Production Nodes
    for name, loc, ntype, cap, lat, lon in PRODUCTION_NODES:
        nid = gen_id()
        load = round(random.uniform(40, 85), 1)
        lines.append(
            f"INSERT INTO production_nodes (node_id, name, location, node_type, "
            f"throughput_capacity, current_load_percent, latitude, longitude) VALUES "
            f"('{nid}', '{name}', '{loc}', '{ntype}', {cap}, {load}, {lat}, {lon});"
        )

    # Launch Schedule
    launch_ids = []
    base = datetime(2026, 6, 1)
    for mname, offset, status, payload, orbit in LAUNCHES:
        lid = gen_id()
        launch_ids.append(lid)
        td = (base + timedelta(days=offset)).strftime('%Y-%m-%d')
        rp = round(random.uniform(15, 70), 1)
        lines.append(
            f"INSERT INTO launch_schedule (launch_id, mission_name, target_date, "
            f"status_readiness, readiness_percent, payload_kg, orbit_type) VALUES "
            f"('{lid}', '{mname}', '{td}', '{status}', {rp}, {payload}, '{orbit}');"
        )

    # Launch Material Requirements
    for lid in launch_ids:
        for mid, mname, cat, crit, ssl, lt, cpu in mat_ids:
            rq = round(ssl * random.uniform(0.5, 2.0), 2)
            fq = round(rq * random.uniform(0.3, 0.95), 2)
            lines.append(
                f"INSERT INTO launch_material_requirements (launch_id, material_id, "
                f"required_quantity, fulfilled_quantity) VALUES ('{lid}', '{mid}', {rq}, {fq});"
            )

    # Supply Events — QC Failure for Inconel 718
    inconel_id = mat_ids[0][0]
    lines.append(
        f"INSERT INTO supply_events (event_type, severity, affected_material_id, "
        f"description, impact_days, cost_impact, event_date) VALUES "
        f"('QC_Failure', 'Critical', '{inconel_id}', "
        f"'Inconel 718 batch rejection — metallurgical defect in grain structure detected during X-ray inspection. 21-day replacement lead time.', "
        f"21, 94500, '2026-07-15');"
    )

    # Weather disruption on Nagpur-Hyderabad corridor
    lines.append(
        f"INSERT INTO supply_events (event_type, severity, description, impact_days, "
        f"cost_impact, event_date) VALUES "
        f"('Weather_Disruption', 'High', "
        f"'Monsoon flooding on NH-44 Nagpur-Hyderabad corridor. Road transport halted for 12 days. Air freight fallback activated at 4x cost.', "
        f"12, 180000, '2026-08-20');"
    )

    # Additional disruptions
    events = [
        ("Supplier_Shutdown", "High", "Scheduled maintenance shutdown at MIDHANI Hyderabad — 10 day production halt.", 10, 120000, "2026-09-01"),
        ("Price_Surge", "Medium", "Titanium global spot price surge +18% due to export restrictions.", 0, 250000, "2026-10-05"),
        ("Demand_Spike", "Medium", "Customer request to accelerate Mission Alpha by 30 days.", 0, 75000, "2026-08-01"),
        ("Geopolitical", "High", "Export control review on carbon fiber composite from Japan. Shipment held at customs 14 days.", 14, 45000, "2026-11-10"),
    ]
    for etype, sev, desc, imp, cost, edate in events:
        lines.append(
            f"INSERT INTO supply_events (event_type, severity, description, impact_days, "
            f"cost_impact, event_date) VALUES ('{etype}', '{sev}', '{desc}', {imp}, {cost}, '{edate}');"
        )

    # 12-month inventory snapshots
    for mid, mname, cat, crit, ssl, lt, cpu in mat_ids[:30]:  # top 30 critical items
        qty = ssl * random.uniform(2.0, 4.0)
        for month in range(12):
            snap_date = (base + timedelta(days=30 * month)).strftime('%Y-%m-%d')
            consumption = ssl * random.uniform(0.08, 0.25)
            qty = max(0, qty - consumption + (ssl * random.uniform(0, 0.15)))
            # Simulate Inconel QC failure impact in month 2
            if mid == inconel_id and month == 1:
                qty = max(0, qty - ssl * 0.6)
            dos = round(qty / max(consumption, 0.01), 1)
            lines.append(
                f"INSERT INTO inventory_snapshots (material_id, snapshot_date, quantity, "
                f"consumption_rate, days_of_supply) VALUES "
                f"('{mid}', '{snap_date}', {round(qty, 2)}, {round(consumption, 2)}, {dos});"
            )

    lines.append("\nCOMMIT;")
    return "\n".join(lines)

if __name__ == "__main__":
    sql = generate_seed_sql()
    with open("seed.sql", "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Generated seed.sql with aerospace-realistic data.")
    print(f"  - {len(BOM_ITEMS)} BOM items")
    print(f"  - {len(SUPPLIERS)} suppliers")
    print(f"  - {len(PRODUCTION_NODES)} production nodes")
    print(f"  - {len(LAUNCHES)} scheduled launches")
    print(f"  - 12-month inventory snapshots for top 30 materials")

-- ============================================================================
-- VIKRAM-STRATOS: Production Digital Twin - Database Schema
-- Skyroot Aerospace | Vikram-1 Supply Chain Intelligence
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Materials: Critical BOM items for Vikram-1
CREATE TABLE materials (
    material_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Composite', 'Alloy', 'Propulsion', 'Avionics', 'Thermal', 'Structural', 'Fluid', 'Electrical')),
    sub_category VARCHAR(100),
    unit VARCHAR(30) NOT NULL DEFAULT 'kg',
    safety_stock_level NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    reorder_point NUMERIC(12,2) NOT NULL DEFAULT 0,
    lead_time_days INTEGER NOT NULL DEFAULT 14,
    cost_per_unit NUMERIC(14,2) NOT NULL DEFAULT 0,
    criticality VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low')),
    is_single_source BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers: Aerospace vendors across production corridor
CREATE TABLE suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    region VARCHAR(50) NOT NULL CHECK (region IN ('Global', 'India', 'Nagpur', 'Hyderabad', 'Sriharikota', 'Bangalore', 'Chennai', 'Pune')),
    country VARCHAR(60) NOT NULL DEFAULT 'India',
    lead_time_reliability_index NUMERIC(3,2) NOT NULL DEFAULT 0.80 CHECK (lead_time_reliability_index >= 0.0 AND lead_time_reliability_index <= 1.0),
    quality_score NUMERIC(3,2) NOT NULL DEFAULT 0.85 CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
    capacity_utilization NUMERIC(5,2) NOT NULL DEFAULT 70.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    certifications TEXT[],
    contact_email VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Nodes: Key facilities in the Nagpur-Hyderabad-Sriharikota corridor
CREATE TABLE production_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL CHECK (node_type IN ('Testing', 'Assembly', 'Manufacturing', 'Integration', 'Launch', 'Storage', 'QualityControl')),
    throughput_capacity NUMERIC(10,2) NOT NULL DEFAULT 0,
    throughput_unit VARCHAR(30) NOT NULL DEFAULT 'units/month',
    current_load_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'Maintenance', 'Offline', 'Overloaded')),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Launch Schedule: Vikram-1 mission timeline
CREATE TABLE launch_schedule (
    launch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_name VARCHAR(100) NOT NULL,
    target_date DATE NOT NULL,
    status_readiness VARCHAR(40) NOT NULL DEFAULT 'Planning' CHECK (status_readiness IN ('Planning', 'In Production', 'Integration', 'Pre-Launch', 'Ready', 'Launched', 'Delayed', 'Scrubbed')),
    readiness_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    delay_days INTEGER NOT NULL DEFAULT 0,
    delay_reason TEXT,
    payload_kg NUMERIC(8,2),
    orbit_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- JUNCTION / RELATIONSHIP TABLES
-- ============================================================================

-- Material-Supplier mapping (many-to-many)
CREATE TABLE material_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(material_id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    price_per_unit NUMERIC(14,2) NOT NULL DEFAULT 0,
    min_order_quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    delivery_lead_days INTEGER NOT NULL DEFAULT 14,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(material_id, supplier_id)
);

-- Material requirements per launch
CREATE TABLE launch_material_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    launch_id UUID NOT NULL REFERENCES launch_schedule(launch_id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(material_id) ON DELETE CASCADE,
    required_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    fulfilled_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    UNIQUE(launch_id, material_id)
);

-- Supply chain events / disruptions log
CREATE TABLE supply_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(60) NOT NULL CHECK (event_type IN ('QC_Failure', 'Logistics_Delay', 'Supplier_Shutdown', 'Price_Surge', 'Demand_Spike', 'Weather_Disruption', 'Geopolitical', 'Regulatory')),
    severity VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    affected_material_id UUID REFERENCES materials(material_id),
    affected_supplier_id UUID REFERENCES suppliers(supplier_id),
    affected_node_id UUID REFERENCES production_nodes(node_id),
    description TEXT NOT NULL,
    impact_days INTEGER NOT NULL DEFAULT 0,
    cost_impact NUMERIC(14,2) NOT NULL DEFAULT 0,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory time-series tracking
CREATE TABLE inventory_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(material_id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    consumption_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
    days_of_supply NUMERIC(8,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Production_Delay_Impact: Calculates how many days a launch is pushed back
-- based on the critical path of missing materials
CREATE OR REPLACE VIEW production_delay_impact AS
WITH material_shortfalls AS (
    SELECT
        lmr.launch_id,
        ls.mission_name,
        ls.target_date,
        m.material_id,
        m.name AS material_name,
        m.category,
        m.criticality,
        m.lead_time_days,
        lmr.required_quantity,
        lmr.fulfilled_quantity,
        m.current_quantity AS available_stock,
        GREATEST(0, lmr.required_quantity - lmr.fulfilled_quantity - m.current_quantity) AS shortfall,
        CASE
            WHEN (lmr.required_quantity - lmr.fulfilled_quantity) <= m.current_quantity THEN 0
            ELSE CEIL(
                GREATEST(0, lmr.required_quantity - lmr.fulfilled_quantity - m.current_quantity)
                / NULLIF(m.current_quantity, 0) * m.lead_time_days
            )
        END AS estimated_delay_days
    FROM launch_material_requirements lmr
    JOIN launch_schedule ls ON ls.launch_id = lmr.launch_id
    JOIN materials m ON m.material_id = lmr.material_id
    WHERE ls.status_readiness NOT IN ('Launched', 'Scrubbed')
)
SELECT
    launch_id,
    mission_name,
    target_date,
    COUNT(*) AS total_materials,
    SUM(CASE WHEN shortfall > 0 THEN 1 ELSE 0 END) AS materials_short,
    MAX(estimated_delay_days) AS critical_path_delay_days,
    target_date + (MAX(estimated_delay_days) || ' days')::INTERVAL AS projected_launch_date,
    ROUND(
        (1 - (SUM(CASE WHEN shortfall > 0 THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0))) * 100,
        1
    ) AS material_readiness_percent
FROM material_shortfalls
GROUP BY launch_id, mission_name, target_date;

-- Supplier health aggregation for corridor clusters
CREATE OR REPLACE VIEW corridor_supplier_health AS
SELECT
    s.region,
    COUNT(*) AS total_suppliers,
    ROUND(AVG(s.lead_time_reliability_index), 3) AS avg_reliability,
    ROUND(AVG(s.quality_score), 3) AS avg_quality,
    ROUND(AVG(s.capacity_utilization), 1) AS avg_capacity_utilization,
    SUM(CASE WHEN s.is_active THEN 1 ELSE 0 END) AS active_suppliers,
    SUM(CASE WHEN s.lead_time_reliability_index < 0.6 THEN 1 ELSE 0 END) AS at_risk_suppliers
FROM suppliers s
GROUP BY s.region;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_criticality ON materials(criticality);
CREATE INDEX idx_suppliers_region ON suppliers(region);
CREATE INDEX idx_supply_events_type ON supply_events(event_type);
CREATE INDEX idx_supply_events_date ON supply_events(event_date);
CREATE INDEX idx_inventory_snapshots_date ON inventory_snapshots(snapshot_date);
CREATE INDEX idx_inventory_snapshots_material ON inventory_snapshots(material_id);
CREATE INDEX idx_launch_schedule_status ON launch_schedule(status_readiness);
CREATE INDEX idx_launch_schedule_date ON launch_schedule(target_date);

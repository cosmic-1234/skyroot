const pool = require('../db/pool');

// GET /api/v1/readiness/triage
// Identifies top 3 materials causing the longest launch delay
async function getReadinessTriage(req, res) {
  try {
    const result = await pool.query(`
      WITH shortfalls AS (
        SELECT
          m.material_id, m.name, m.category, m.criticality,
          m.lead_time_days, m.current_quantity, m.safety_stock_level,
          lmr.required_quantity, lmr.fulfilled_quantity,
          ls.mission_name, ls.target_date,
          GREATEST(0, lmr.required_quantity - lmr.fulfilled_quantity - m.current_quantity) AS shortfall,
          CASE
            WHEN (lmr.required_quantity - lmr.fulfilled_quantity) <= m.current_quantity THEN 0
            ELSE CEIL(
              GREATEST(0, lmr.required_quantity - lmr.fulfilled_quantity - m.current_quantity)
              / NULLIF(m.current_quantity, 0) * m.lead_time_days
            )
          END AS delay_days
        FROM launch_material_requirements lmr
        JOIN launch_schedule ls ON ls.launch_id = lmr.launch_id
        JOIN materials m ON m.material_id = lmr.material_id
        WHERE ls.status_readiness NOT IN ('Launched', 'Scrubbed')
      )
      SELECT * FROM shortfalls
      WHERE shortfall > 0
      ORDER BY delay_days DESC
      LIMIT 3
    `);
    res.json({ status: 'ok', triage: result.rows });
  } catch (err) {
    console.error('Triage error:', err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/risk/corridor
// Aggregates supplier health for Nagpur & Hyderabad clusters
async function getRiskCorridor(req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM corridor_supplier_health
      WHERE region IN ('Nagpur', 'Hyderabad', 'Sriharikota', 'Bangalore', 'Pune', 'Chennai', 'Global', 'India')
      ORDER BY avg_reliability ASC
    `);
    res.json({ status: 'ok', corridor: result.rows });
  } catch (err) {
    console.error('Corridor error:', err);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/v1/simulate
// Simulates Supplier Failure or Price Surge, returns cost-to-orbit variance
async function postSimulate(req, res) {
  try {
    const { scenario, severity_percent = 30 } = req.body || {};
    if (!scenario || !['supplier_failure', 'price_surge', 'demand_spike'].includes(scenario)) {
      return res.status(400).json({ error: 'scenario must be supplier_failure, price_surge, or demand_spike' });
    }

    const sevFactor = (severity_percent || 30) / 100;

    if (scenario === 'supplier_failure') {
      const matResult = await pool.query(`
        SELECT m.name, m.category, m.criticality, m.cost_per_unit, m.lead_time_days,
               m.current_quantity, m.safety_stock_level
        FROM materials m WHERE m.criticality IN ('Critical', 'High')
        ORDER BY m.cost_per_unit DESC LIMIT 10
      `);
      const affected = matResult.rows.map(m => ({
        ...m,
        delay_days: Math.ceil(m.lead_time_days * (1 + sevFactor)),
        cost_impact: Math.round(m.cost_per_unit * m.safety_stock_level * sevFactor),
      }));
      const totalCostImpact = affected.reduce((s, a) => s + a.cost_impact, 0);
      const maxDelay = Math.max(...affected.map(a => a.delay_days));
      const baseCostToOrbit = 15000000; // $15M baseline
      const variance = Math.round(totalCostImpact + baseCostToOrbit * sevFactor * 0.1);

      res.json({
        status: 'ok', scenario, severity_percent,
        projected_cost_to_orbit_variance_usd: variance,
        max_delay_days: maxDelay,
        affected_materials: affected,
        base_cost_to_orbit: baseCostToOrbit,
        projected_cost_to_orbit: baseCostToOrbit + variance,
      });
    } else if (scenario === 'price_surge') {
      const matResult = await pool.query(`
        SELECT m.name, m.category, m.cost_per_unit, m.safety_stock_level
        FROM materials m ORDER BY m.cost_per_unit DESC LIMIT 20
      `);
      const surgeImpact = matResult.rows.map(m => ({
        material: m.name, category: m.category,
        original_unit_cost: m.cost_per_unit,
        surged_unit_cost: Math.round(m.cost_per_unit * (1 + sevFactor)),
        total_impact: Math.round(m.cost_per_unit * m.safety_stock_level * sevFactor),
      }));
      const totalVariance = surgeImpact.reduce((s, i) => s + i.total_impact, 0);
      res.json({
        status: 'ok', scenario, severity_percent,
        projected_cost_to_orbit_variance_usd: totalVariance,
        materials_affected: surgeImpact,
      });
    } else {
      // demand_spike
      const baseCost = 15000000;
      const multiplier = 1 + sevFactor;
      res.json({
        status: 'ok', scenario, severity_percent,
        production_rate_multiplier: multiplier,
        projected_cost_to_orbit_variance_usd: Math.round(baseCost * sevFactor * 0.35),
        note: `Production frequency increase of ${severity_percent}% requires proportional supply chain scaling.`,
      });
    }
  } catch (err) {
    console.error('Simulate error:', err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/dashboard — aggregated dashboard data
async function getDashboard(req, res) {
  try {
    const [readiness, corridor, events, inventory, materials, launches] = await Promise.all([
      pool.query(`SELECT * FROM production_delay_impact ORDER BY target_date ASC LIMIT 4`),
      pool.query(`SELECT * FROM corridor_supplier_health ORDER BY avg_reliability ASC`),
      pool.query(`SELECT * FROM supply_events ORDER BY event_date DESC LIMIT 10`),
      pool.query(`
        SELECT i.snapshot_date, m.name AS material_name, m.category,
               i.quantity, i.consumption_rate, i.days_of_supply
        FROM inventory_snapshots i
        JOIN materials m ON m.material_id = i.material_id
        ORDER BY i.snapshot_date ASC
      `),
      pool.query(`SELECT * FROM materials ORDER BY criticality ASC, name ASC`),
      pool.query(`SELECT * FROM launch_schedule ORDER BY target_date ASC`),
    ]);

    res.json({
      status: 'ok',
      launches: readiness.rows,
      corridor_health: corridor.rows,
      recent_events: events.rows,
      inventory_trends: inventory.rows,
      materials: materials.rows,
      launch_schedule: launches.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getReadinessTriage, getRiskCorridor, postSimulate, getDashboard };

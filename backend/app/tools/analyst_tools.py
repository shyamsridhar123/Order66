"""Analyst Agent Tools - Financial modeling and analysis tools."""

import random
from datetime import datetime
from app.tools.registry import ToolRegistry, ToolDefinition, ToolCategory


def calculate_market_size(therapeutic_area: str, geography: str = "Global") -> dict:
    """Calculate TAM/SAM/SOM for a therapeutic area."""
    
    # Mock market sizing data
    market_data = {
        "oncology": {"tam": 280, "sam": 145, "som": 18},
        "immunology": {"tam": 120, "sam": 65, "som": 8},
        "rare disease": {"tam": 45, "sam": 28, "som": 4},
        "neurology": {"tam": 95, "sam": 52, "som": 6},
        "default": {"tam": 50, "sam": 25, "som": 3},
    }
    
    base = market_data.get(therapeutic_area.lower(), market_data["default"])
    
    return {
        "therapeutic_area": therapeutic_area,
        "geography": geography,
        "tam": {
            "value": f"${base['tam']}B",
            "description": "Total Addressable Market - All patients with condition",
        },
        "sam": {
            "value": f"${base['sam']}B",
            "description": "Serviceable Addressable Market - Patients eligible for treatment",
        },
        "som": {
            "value": f"${base['som']}B",
            "description": "Serviceable Obtainable Market - Realistic market capture",
        },
        "methodology": "Bottom-up patient prevalence model with pricing assumptions",
        "assumptions": [
            "US pricing at WAC, ex-US at 60% discount",
            "Peak penetration of 25% in target population",
            "5-year ramp to peak sales",
        ],
        "cagr": "7.2%",
        "forecast_year": 2029,
    }


def run_dcf_model(company: str, revenue_cagr: float = 0.08, discount_rate: float = 0.10) -> dict:
    """Run discounted cash flow valuation model."""
    
    # Mock DCF model
    base_revenue = random.uniform(5, 20)  # $B
    
    projections = []
    cumulative_revenue = base_revenue
    for year in range(1, 6):
        cumulative_revenue *= (1 + revenue_cagr)
        ebitda = cumulative_revenue * 0.35  # 35% margin
        fcf = ebitda * 0.7  # 70% conversion
        pv_factor = 1 / ((1 + discount_rate) ** year)
        pv_fcf = fcf * pv_factor
        projections.append({
            "year": 2024 + year,
            "revenue": round(cumulative_revenue, 1),
            "ebitda": round(ebitda, 1),
            "fcf": round(fcf, 1),
            "pv_fcf": round(pv_fcf, 1),
        })
    
    terminal_value = projections[-1]["fcf"] * 15  # 15x terminal multiple
    pv_terminal = terminal_value / ((1 + discount_rate) ** 5)
    
    sum_pv_fcf = sum(p["pv_fcf"] for p in projections)
    enterprise_value = sum_pv_fcf + pv_terminal
    
    return {
        "company": company,
        "methodology": "5-year DCF with terminal value",
        "assumptions": {
            "revenue_cagr": f"{revenue_cagr:.1%}",
            "discount_rate": f"{discount_rate:.1%}",
            "ebitda_margin": "35%",
            "fcf_conversion": "70%",
            "terminal_multiple": "15x",
        },
        "projections": projections,
        "valuation": {
            "sum_pv_fcf": f"${sum_pv_fcf:.1f}B",
            "terminal_value": f"${terminal_value:.1f}B",
            "pv_terminal": f"${pv_terminal:.1f}B",
            "enterprise_value": f"${enterprise_value:.1f}B",
        },
        "sensitivity": {
            "bull_case": f"${enterprise_value * 1.3:.1f}B (+30%)",
            "base_case": f"${enterprise_value:.1f}B",
            "bear_case": f"${enterprise_value * 0.7:.1f}B (-30%)",
        },
    }


def benchmark_metrics(companies: list, metrics: list = None) -> dict:
    """Benchmark key metrics across companies."""
    
    if metrics is None:
        metrics = ["revenue_growth", "gross_margin", "r_and_d_intensity", "eps_growth"]
    
    # Mock benchmark data
    benchmark_data = []
    for company in companies:
        benchmark_data.append({
            "company": company,
            "revenue_growth": f"{random.uniform(5, 25):.1f}%",
            "gross_margin": f"{random.uniform(65, 85):.1f}%",
            "r_and_d_intensity": f"{random.uniform(15, 30):.1f}%",
            "eps_growth": f"{random.uniform(-5, 35):.1f}%",
            "pe_ratio": f"{random.uniform(12, 35):.1f}x",
            "ev_revenue": f"{random.uniform(3, 8):.1f}x",
        })
    
    # Calculate averages
    averages = {
        "revenue_growth": "12.5%",
        "gross_margin": "74.2%",
        "r_and_d_intensity": "21.3%",
        "eps_growth": "15.8%",
    }
    
    return {
        "companies": benchmark_data,
        "peer_averages": averages,
        "metrics_included": metrics,
        "data_source": "Company filings, Bloomberg",
        "as_of_date": datetime.now().strftime("%Y-%m-%d"),
    }


def forecast_revenue(product: str, peak_sales: float, launch_year: int = 2025) -> dict:
    """Generate revenue forecast for a product."""
    
    # S-curve adoption model
    forecasts = []
    for year in range(launch_year, launch_year + 10):
        years_since_launch = year - launch_year
        if years_since_launch <= 0:
            revenue = 0
        elif years_since_launch <= 2:
            revenue = peak_sales * (years_since_launch * 0.15)
        elif years_since_launch <= 5:
            revenue = peak_sales * (0.3 + (years_since_launch - 2) * 0.2)
        elif years_since_launch <= 7:
            revenue = peak_sales * (0.9 + (years_since_launch - 5) * 0.05)
        else:
            revenue = peak_sales * max(0.85, 1.0 - (years_since_launch - 7) * 0.05)
        
        forecasts.append({
            "year": year,
            "revenue": round(revenue, 2),
            "yoy_growth": None if year == launch_year else f"{random.uniform(20, 80):.0f}%",
        })
    
    return {
        "product": product,
        "launch_year": launch_year,
        "peak_sales": f"${peak_sales}B",
        "time_to_peak": "5 years",
        "forecasts": forecasts,
        "assumptions": [
            "S-curve adoption model",
            "Peak penetration at 5 years post-launch",
            "Patent cliff impact from Year 8",
        ],
        "risks": [
            "Competitive entries",
            "Pricing pressure",
            "Label expansion/restriction",
        ],
    }


def analyze_pipeline_value(company: str) -> dict:
    """Calculate risk-adjusted NPV of drug pipeline."""
    
    # Mock pipeline assets
    pipeline = [
        {
            "asset": "ABC-123",
            "phase": "Phase 3",
            "indication": "NSCLC",
            "peak_sales": 3.5,
            "prob_success": 0.55,
            "launch_year": 2026,
            "npv_unadjusted": 8.2,
            "rnpv": 4.5,
        },
        {
            "asset": "XYZ-456",
            "phase": "Phase 2",
            "indication": "Breast Cancer",
            "peak_sales": 2.1,
            "prob_success": 0.28,
            "launch_year": 2028,
            "npv_unadjusted": 4.8,
            "rnpv": 1.3,
        },
        {
            "asset": "DEF-789",
            "phase": "Phase 1",
            "indication": "AML",
            "peak_sales": 1.5,
            "prob_success": 0.12,
            "launch_year": 2030,
            "npv_unadjusted": 3.2,
            "rnpv": 0.4,
        },
    ]
    
    total_rnpv = sum(p["rnpv"] for p in pipeline)
    
    return {
        "company": company,
        "pipeline_assets": pipeline,
        "total_rnpv": f"${total_rnpv:.1f}B",
        "methodology": "Risk-adjusted NPV using phase-specific success rates",
        "success_rates": {
            "phase_1": "12%",
            "phase_2": "28%",
            "phase_3": "55%",
            "filed": "85%",
        },
        "discount_rate": "10%",
    }


def generate_chart_data(data_type: str, **kwargs) -> dict:
    """Generate data formatted for chart visualization."""
    
    if data_type == "revenue_trend":
        return {
            "chart_type": "line",
            "title": "Revenue Trend",
            "data": [
                {"year": 2020, "value": 42.5},
                {"year": 2021, "value": 48.2},
                {"year": 2022, "value": 52.1},
                {"year": 2023, "value": 55.8},
                {"year": 2024, "value": 58.5},
            ],
            "x_axis": "Year",
            "y_axis": "Revenue ($B)",
        }
    elif data_type == "market_share":
        return {
            "chart_type": "pie",
            "title": "Market Share Distribution",
            "data": [
                {"company": "Merck", "share": 23},
                {"company": "BMS", "share": 18},
                {"company": "Roche", "share": 15},
                {"company": "AstraZeneca", "share": 12},
                {"company": "Others", "share": 32},
            ],
        }
    elif data_type == "pipeline_by_phase":
        return {
            "chart_type": "bar",
            "title": "Pipeline by Phase",
            "data": [
                {"phase": "Phase 1", "count": 28},
                {"phase": "Phase 2", "count": 35},
                {"phase": "Phase 3", "count": 24},
                {"phase": "Filed", "count": 8},
            ],
            "x_axis": "Phase",
            "y_axis": "Number of Assets",
        }
    
    return {"error": f"Unknown chart type: {data_type}"}


# ============================================================================
# TOOL DEFINITIONS
# ============================================================================

ANALYST_TOOLS = [
    {
        "name": "calculate_market_size",
        "description": "Calculate TAM/SAM/SOM market sizing for a therapeutic area",
        "function": calculate_market_size,
        "parameters": {
            "type": "object",
            "properties": {
                "therapeutic_area": {"type": "string", "description": "Therapeutic area to size"},
                "geography": {"type": "string", "description": "Geographic scope (Global, US, EU, etc.)"},
            },
            "required": ["therapeutic_area"],
        },
        "returns": {"type": "object", "description": "Market size estimates"},
    },
    {
        "name": "run_dcf_model",
        "description": "Run a discounted cash flow valuation model for a company",
        "function": run_dcf_model,
        "parameters": {
            "type": "object",
            "properties": {
                "company": {"type": "string", "description": "Company to value"},
                "revenue_cagr": {"type": "number", "description": "Expected revenue CAGR"},
                "discount_rate": {"type": "number", "description": "Discount rate for DCF"},
            },
            "required": ["company"],
        },
        "returns": {"type": "object", "description": "DCF valuation results"},
    },
    {
        "name": "benchmark_metrics",
        "description": "Benchmark financial and operational metrics across peer companies",
        "function": benchmark_metrics,
        "parameters": {
            "type": "object",
            "properties": {
                "companies": {"type": "array", "items": {"type": "string"}, "description": "List of companies to benchmark"},
                "metrics": {"type": "array", "items": {"type": "string"}, "description": "Metrics to compare"},
            },
            "required": ["companies"],
        },
        "returns": {"type": "object", "description": "Benchmark comparison data"},
    },
    {
        "name": "forecast_revenue",
        "description": "Generate revenue forecast for a product using S-curve adoption model",
        "function": forecast_revenue,
        "parameters": {
            "type": "object",
            "properties": {
                "product": {"type": "string", "description": "Product name"},
                "peak_sales": {"type": "number", "description": "Expected peak sales in $B"},
                "launch_year": {"type": "integer", "description": "Year of product launch"},
            },
            "required": ["product", "peak_sales"],
        },
        "returns": {"type": "object", "description": "Revenue forecast"},
    },
    {
        "name": "analyze_pipeline_value",
        "description": "Calculate risk-adjusted NPV of a company's drug pipeline",
        "function": analyze_pipeline_value,
        "parameters": {
            "type": "object",
            "properties": {
                "company": {"type": "string", "description": "Company name"},
            },
            "required": ["company"],
        },
        "returns": {"type": "object", "description": "Pipeline valuation"},
    },
    {
        "name": "generate_chart_data",
        "description": "Generate data formatted for chart visualization",
        "function": generate_chart_data,
        "parameters": {
            "type": "object",
            "properties": {
                "data_type": {"type": "string", "description": "Type of chart (revenue_trend, market_share, pipeline_by_phase)"},
            },
            "required": ["data_type"],
        },
        "returns": {"type": "object", "description": "Chart-ready data"},
    },
]


def register_analyst_tools(registry: ToolRegistry) -> None:
    """Register all analyst tools."""
    for tool_def in ANALYST_TOOLS:
        registry.register(ToolDefinition(
            name=tool_def["name"],
            description=tool_def["description"],
            category=ToolCategory.ANALYSIS,
            agent="analyst",
            parameters=tool_def["parameters"],
            returns=tool_def["returns"],
            function=tool_def["function"],
            demo_latency_ms=600,
        ))

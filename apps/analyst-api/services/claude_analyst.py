"""
Financial statement analysis via Claude API (Anthropic SDK).

Uses tool_use for structured output — Claude is forced to call
`record_financial_metrics` and return clean JSON every time.
"""

import os
import anthropic

MODEL = "claude-sonnet-4-6"

_TOOL = {
    "name": "record_financial_metrics",
    "description": (
        "Record the financial metrics extracted from the provided statements. "
        "Use null for any metric that cannot be determined from the data."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "revenue":           {"type": "number", "description": "TTM or most recent annual revenue (USD)"},
            "revenue_growth_pct":{"type": "number", "description": "YoY revenue growth %"},
            "gross_profit":      {"type": "number", "description": "Gross profit (USD)"},
            "gross_margin":      {"type": "number", "description": "Gross margin % (0–100)"},
            "operating_profit":  {"type": "number", "description": "Operating profit/loss (USD)"},
            "net_profit":        {"type": "number", "description": "Net profit/loss (USD)"},
            "net_margin":        {"type": "number", "description": "Net margin %"},
            "ebitda":            {"type": "number", "description": "EBITDA (USD)"},
            "ebitda_margin":     {"type": "number", "description": "EBITDA margin %"},
            "cash_on_hand":      {"type": "number", "description": "Cash and equivalents (USD)"},
            "total_debt":        {"type": "number", "description": "Total debt (USD)"},
            "total_equity":      {"type": "number", "description": "Total equity (USD)"},
            "debt_to_equity":    {"type": "number", "description": "Debt-to-equity ratio"},
            "working_capital":   {"type": "number", "description": "Current assets − current liabilities (USD)"},
            "quick_ratio":       {"type": "number", "description": "(Cash + receivables) / current liabilities"},
            "current_ratio":     {"type": "number", "description": "Current assets / current liabilities"},
            "operating_cash_flow":{"type": "number","description": "Operating cash flow (USD)"},
            "burn_rate":         {"type": "number", "description": "Monthly cash burn (USD, positive = burning)"},
            "runway_months":     {"type": "number", "description": "Months of runway at current burn"},
            "confidence": {
                "type": "string",
                "enum": ["high", "medium", "low"],
                "description": "Confidence in data quality",
            },
            "ai_notes": {
                "type": "string",
                "description": "Key assumptions, data gaps, or caveats the analyst should know",
            },
        },
        "required": ["confidence", "ai_notes"],
    },
}

_SYSTEM = (
    "You are a senior financial analyst. Given raw financial statement data "
    "(income statement, balance sheet, cash flow — any format), extract and "
    "compute all available metrics. Always call record_financial_metrics. "
    "Be precise with numbers; omit a metric rather than guess when data is absent."
)


def analyze_financials(raw_input: str) -> dict:
    """
    Calls Claude with the raw financial text and returns a dict of extracted metrics.
    Raises if ANTHROPIC_API_KEY is not set or the API call fails.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY environment variable is not set")

    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=_SYSTEM,
        tools=[_TOOL],
        tool_choice={"type": "any"},
        messages=[{"role": "user", "content": raw_input}],
    )

    # Extract the tool_use block
    for block in response.content:
        if block.type == "tool_use" and block.name == "record_financial_metrics":
            inp = block.input
            return {
                "revenue":            inp.get("revenue"),
                "revenueGrowthPct":   inp.get("revenue_growth_pct"),
                "grossProfit":        inp.get("gross_profit"),
                "grossMargin":        inp.get("gross_margin"),
                "operatingProfit":    inp.get("operating_profit"),
                "netProfit":          inp.get("net_profit"),
                "netMargin":          inp.get("net_margin"),
                "ebitda":             inp.get("ebitda"),
                "ebitdaMargin":       inp.get("ebitda_margin"),
                "cashOnHand":         inp.get("cash_on_hand"),
                "totalDebt":          inp.get("total_debt"),
                "totalEquity":        inp.get("total_equity"),
                "debtToEquity":       inp.get("debt_to_equity"),
                "workingCapital":     inp.get("working_capital"),
                "quickRatio":         inp.get("quick_ratio"),
                "currentRatio":       inp.get("current_ratio"),
                "operatingCashFlow":  inp.get("operating_cash_flow"),
                "burnRate":           inp.get("burn_rate"),
                "runwayMonths":       inp.get("runway_months"),
                "confidence":         inp.get("confidence", "low"),
                "aiNotes":            inp.get("ai_notes", ""),
            }

    raise RuntimeError("Claude did not return a tool_use block — unexpected response format")

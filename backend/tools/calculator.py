from langchain_core.tools import tool

@tool
def calculate_budget(total_budget: float, marketing_pct: float, tech_pct: float, ops_pct: float) -> str:
    """
    Calculate the exact budget allocation given the total budget and percentages for marketing, tech, and operations.
    The sum of percentages must be 1.0.
    """
    if abs((marketing_pct + tech_pct + ops_pct) - 1.0) > 0.01:
        return "Error: percentages must sum up to 1.0"
        
    marketing_budget = total_budget * marketing_pct
    tech_budget = total_budget * tech_pct
    ops_budget = total_budget * ops_pct
    
    return (
        f"Total Budget: ${total_budget:,.2f}\n"
        f"Marketing ({marketing_pct*100}%): ${marketing_budget:,.2f}\n"
        f"Tech ({tech_pct*100}%): ${tech_budget:,.2f}\n"
        f"Operations ({ops_pct*100}%): ${ops_budget:,.2f}"
    )

@tool
def calculate_runway(total_budget: float, monthly_burn_rate: float) -> str:
    """
    Calculate the runway in months given the total budget and estimated monthly burn rate.
    """
    if monthly_burn_rate <= 0:
        return "Error: monthly burn rate must be greater than 0"
        
    months = total_budget / monthly_burn_rate
    return f"Estimated Runway: {months:.1f} months based on ${monthly_burn_rate:,.2f}/month burn rate."

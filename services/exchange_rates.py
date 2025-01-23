def calculate_exchange(amount: float, rate: float) -> float:
    """
    Oblicza wartość wymiany waluty.
    """
    return round(amount / rate, 2)

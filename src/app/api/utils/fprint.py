RESET = "\033[0m"
BOLD = "\033[1m"
UNDERLINE = "\033[4m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
PINK = "\033[35m"
CYAN = "\033[36m"

COLORS = {
    "RED": RED,
    "GREEN": GREEN,
    "YELLOW": YELLOW,
    "BLUE": BLUE,
    "PINK": PINK,
    "CYAN": CYAN,
}


def fprint(message, color="CYAN"):
    """
    Imprime un mensaje en color con formato en negrita.

    Args:
        message (str): Texto a imprimir.
        color (str): Color del texto (opcional, por defecto CYAN).
    """
    color_code = COLORS.get(color.upper(), CYAN)

    print(f"{BOLD}{color_code}{message}{RESET}")

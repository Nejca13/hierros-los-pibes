import bcrypt


# Función para hashear una contraseña
def hash_password(password: str) -> str:
    # Genera una sal aleatoria para el hash
    salt = bcrypt.gensalt()
    # Hashea la contraseña con la sal
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")  # Devolvemos el hash como string


# Función para verificar la contraseña
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Compara la contraseña introducida con el hash almacenado
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )

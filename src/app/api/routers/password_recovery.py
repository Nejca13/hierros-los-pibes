# Router recuperacion de contraseña
import random
import string
from fastapi import APIRouter, HTTPException, status
from app.api.models.user import User
from app.api.utils.hash_password.def_hash_password import hash_password
from app.api.utils.send_email import send_email

router = APIRouter(
    prefix="/password-recovery",
    tags=["Recuperación de contraseña"],
)


@router.post("/recover-password/")
async def recover_password(email: str):
    user_exists = await User.find_one(User.email == email)

    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El correo electrónica no existe",
        )

    # generar una contraseña nueva aleatoria de 8 caracteres
    new_password = "".join(
        random.choice(string.ascii_letters + string.digits) for _ in range(8)
    )
    user_exists.password = hash_password(new_password)

    await user_exists.save()

    message_html = f"""
        <p>Se ha solicitado la recuperación de contraseña para tu cuenta.</p>
        <p><strong>{new_password}</strong></p>
        <p>Si no has solicitado esta recuperación, puedes ignorar este correo electrónica.</p>
        """

    await send_email(
        destinatario=email,
        asunto="Recuperación de contraseña",
        mensaje_html=message_html,
    )

    return {"message": "Se ha enviado un correo con la nueva contraseña"}

from datetime import datetime
import json
from re import U
from beanie import PydanticObjectId
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, RedirectResponse
from app.api.init_db import BASE_URL
from app.api.models.user import User, UserResponse, UserUpdate
from app.api.utils.fprint import fprint
from app.api.utils.hash_password.def_hash_password import hash_password, verify_password
from app.api.utils.save_image import save_image
from app.api.utils.send_email import send_email

from fastapi import HTTPException, UploadFile, File, Form
from beanie import PydanticObjectId


router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("/", response_model=list[UserResponse])
async def get_users(role: str = None):
    # Si se proporciona un rol, filtra los usuarios por ese rol
    if role:
        users = await User.find(User.role == role).to_list()
    else:
        # Si no se proporciona un rol, devuelve todos los usuarios
        users = await User.find().to_list()
    return users


@router.get("/{user_id}/", response_model=UserResponse)
async def get_user(user_id: str):
    user = await User.find_one(User.id == PydanticObjectId(user_id))
    return user


@router.post("/", response_model=UserResponse)
async def create_user(user: str = Form(...), image: UploadFile = File(...)):
    # Convierte UserCreate a un diccionario y filtra campos desconocidos
    user_data = json.loads(user)

    user = User(**user_data)

    fprint(user_data)

    # Verificar que el email no exista
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo electrónica ya existe")

    # Verificar que el teléfono no exista
    existing_user = await User.find_one(User.phone_number == user.phone_number)
    if existing_user:
        raise HTTPException(status_code=400, detail="El teléfono ya existe")

    # Encriptar la contraseña
    user_data["password"] = hash_password(user.password)
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()

    # Guardar la imagen en el servidor
    folder = f"users/{user_data['email']}"
    user_data["img"] = await save_image(image, folder)

    # Crea el usuario en la base de datos
    try:
        new_user = await User(**user_data).create()
        message_html = f"""
            <p> Gracias por registrarte en nuestra plataforma. </p>
            <p> Por favor, haz clic en el siguiente enlace para activar tu cuenta: </p>
            <a href="{BASE_URL}/api/users/{new_user.id}/activate/">{BASE_URL}/api/users/{new_user.id}/activate/</a>
           """
        await send_email(
            destinatario=new_user.email,
            asunto="Bienvenido a la plataforma",
            mensaje_html=message_html.format(BASE_URL=BASE_URL, new_user=new_user),
        )
        return new_user
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al crear el usuario: {str(e)}"
        )


# Marcar usuario como activo
@router.get("/{user_id}/activate/", response_model=UserResponse)
async def activate_user(user_id: str):
    try:
        user_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

    # Busca el usuario en la base de datos
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Marca el usuario como activo
    user.is_active = True
    user.is_verified = True

    # Guarda los cambios en la base de datos
    await user.save()

    return RedirectResponse(url=f"{BASE_URL}/login", status_code=302)


@router.patch("/{user_id}/", response_model=dict)
async def update_user(
    user_id: str, user: str = Form(...), image: UploadFile = File(None)
):
    # Convierte el ID del usuario a PydanticObjectId
    try:
        user_data = json.loads(user)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Datos de usuario inválidos")

    user = UserUpdate(**user_data)

    try:
        user_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

    # Busca el usuario en la base de datos
    existing_user = await User.get(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualiza solo los campos enviados
    update_data = user.dict(exclude_unset=True)  # Excluye campos no enviados
    if image:
        folder = f"users/{existing_user.email}"
        update_data["img"] = await save_image(image, folder)

    for field, value in update_data.items():
        setattr(existing_user, field, value)

    # Actualiza la fecha de modificación
    existing_user.updated_at = datetime.utcnow()

    # Guarda los cambios en la base de datos
    try:
        await existing_user.save()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al actualizar el usuario: {str(e)}"
        )
    # Retorna el usuario actualizado parseado a UserResponse

    existing_user = UserResponse.from_orm(existing_user)
    return {"message": "Usuario actualizado correctamente", "user": existing_user}


# Eliminar un usuario
@router.delete("/delete/{user_id}/")
async def delete_user(user_id: str):
    user = await User.find_one(User.id == PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await user.delete()
    return user


@router.patch("/update-password/{user_id}/")
async def update_password(
    user_id: str, password: str = Form(...), old_password: str = Form(...)
):
    # Validar el ID
    try:
        user_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

    # Buscar el usuario
    user = await User.find_one(User.id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validar la contraseña actual
    if not verify_password(old_password, user.password):
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")

    # Actualizar la contraseña
    user.password = hash_password(password)
    user.updated_at = datetime.utcnow()
    await user.save()

    return JSONResponse(
        content={"message": "Contraseña actualizada correctamente"}, status_code=200
    )

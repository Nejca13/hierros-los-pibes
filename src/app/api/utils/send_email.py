import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


async def send_email(destinatario, asunto, mensaje_html):
    # Configuración del servidor SMTP
    usuario = "soporte@sportiumcafe.com"
    contrasena = "vqt*iR@7aC"
    servidor_smtp = "c2681580.ferozo.com"
    puerto_smtp = 465

    # Crear mensaje
    msg = MIMEMultipart("alternative")
    msg["From"] = "Hierro Los Pibes <soporte@sportiumcafe.com>"
    msg["To"] = destinatario
    msg["Subject"] = asunto

    # Estilo HTML
    mensaje_html_completo = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                font-size: 24px;
                font-weight: bold;
                color: #333333;
                text-align: center;
                margin-bottom: 20px;
            }}
            .email-body {{
                font-size: 16px;
                line-height: 1.5;
                color: #555555;
            }}
            .email-footer {{
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
                color: #aaaaaa;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">{asunto}</div>
            <div class="email-body">{mensaje_html}</div>
            <div class="email-footer">© 2025 Hierro Los Pibes. Todos los derechos reservados.</div>
        </div>
    </body>
    </html>
    """

    # Adjuntar el mensaje HTML
    msg.attach(MIMEText(mensaje_html_completo, "html"))

    try:
        # Conectar al servidor SMTP
        server = smtplib.SMTP_SSL(servidor_smtp, puerto_smtp)
        server.login(usuario, contrasena)

        # Enviar correo
        server.sendmail(usuario, destinatario, msg.as_string())
        server.quit()

        print("Correo enviado exitosamente")
        return True
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        return False

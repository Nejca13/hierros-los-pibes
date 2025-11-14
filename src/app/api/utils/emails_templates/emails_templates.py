def build_order_receipt_email(order):
    productos_html = "".join(
        f"<li>{item.name} - Cantidad: {item.quantity} - Precio unitario: ${item.unit_price:.2f} - Total: ${item.total_price:.2f}</li>"
        for item in order.products_details or []
    )

    nota_html = f"<p><strong>Nota:</strong> {order.note}</p>" if order.note else ""

    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="text-align: center; color: #4CAF50;">Hierro Los Pibes - Comprobante de Compra</h2>
        <p>Hola,</p>
        <p>Gracias por tu compra en <strong>Hierro Los Pibes</strong>. Este es el detalle de tu orden:</p>

        <hr />
        <p><strong>ID de la orden:</strong> {order.id}</p>
        <p><strong>Fecha:</strong> {order.created_at.strftime('%d/%m/%Y %H:%M')}</p>
        <p><strong>Mesa:</strong> {order.table or 'N/A'}</p>
        <p><strong>Método de pago:</strong> {order.payment_method}</p>
        <p><strong>Estado del pago:</strong> {order.status.capitalize()}</p>
        <hr />

        <h3>Productos:</h3>
        <ul>{productos_html}</ul>

        <hr />
        <p><strong>Total pagado:</strong> ${order.total:.2f}</p>
        {nota_html}
        <hr />

        <p>Si tenés alguna duda, escribinos.</p>
        <p style="text-align: center;">¡Gracias por elegirnos! 💚</p>
        <p style="text-align: center; font-size: 12px; color: #999;">Hierro Los Pibes Café</p>
    </div>
    """

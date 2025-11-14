#!/bin/bash

# Ruta al proyecto
PROJECT_DIR="/home/sportiumcafe"

echo "Iniciando actualización del proyecto..."

# Navegar al directorio del proyecto
cd "$PROJECT_DIR" || exit 1

# Ejecutar git pull
echo "Realizando git pull..."
git pull || { echo "Error en git pull"; exit 1; }

# Instalar dependencias con pnpm
echo "Instalando dependencias..."
pnpm install || { echo "Error en pnpm install"; exit 1; }

# Construir el proyecto
echo "Construyendo el proyecto..."
pnpm build || { echo "Error en pnpm build"; exit 1; }

# Reiniciar con pm2
echo "Reiniciando aplicación con pm2..."
pm2 restart sportiumcafe || { echo "Error en pm2 restart"; exit 1; }

echo "Actualización completada exitosamente."

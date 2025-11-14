#!/bin/bash
source src/app/api/venv/bin/activate

echo -e "📦 Instalando dependencias de Python..."
pip install -r src/app/api/requirements.txt > /dev/null 2>&1
echo -e "✅ Dependencias instaladas."

export PYTHONPATH=$(pwd)/src

echo -e "🚀 Levantando servidor con Uvicorn..."
uvicorn src.app.api.main:app \
  --host 0.0.0.0 \
  --port 8000

echo -e "✅ Servidor levantado."

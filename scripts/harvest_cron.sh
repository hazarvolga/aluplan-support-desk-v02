#!/bin/bash

# NotebookLM Daily Harvest Cron Script
# ---------------------------------------------------------
# Bu script her gün çalıştırılarak NotebookLM kuyruğundaki
# sıradaki 40 konuyu çeker ve API'ye yükler.
#
# Cron job örneği (Her gece 02:00'de çalışır):
# 0 2 * * * /Users/hazarekiz/aluplan-support-desk-v02-main/scripts/harvest_cron.sh >> /tmp/notebooklm_cron.log 2>&1

PROJECT_ROOT="/Users/hazarekiz/aluplan-support-desk-v02-main"
API_URL="http://localhost:4000"
NOTEBOOK_URL="https://notebooklm.google.com/notebook/da730fbf-ac81-475b-9996-1c87f261d19f?authuser=1"
PYTHON_CMD="python3"
BATCH_SIZE=40

echo "============================================================"
echo "NotebookLM Günlük Hasat Başlıyor: $(date)"
echo "============================================================"

cd $PROJECT_ROOT

# Adım 1: Kuyruk oluştur/güncelle (yeni eklenenleri yakalamak için)
echo "➜ Kuyruk güncelleniyor..."
$PYTHON_CMD scripts/notebooklm-harvester.py queue

# Adım 2: 40 konu çek
echo "➜ İlk $BATCH_SIZE konu çekiliyor..."
$PYTHON_CMD scripts/notebooklm-harvester.py harvest --notebook-url "$NOTEBOOK_URL" --batch $BATCH_SIZE

# Adım 3: Çekilenleri API'ye ve dataset'e pushla
echo "➜ Veriler API'ye gönderiliyor..."
$PYTHON_CMD scripts/notebooklm-harvester.py push --api-url "$API_URL"

echo "============================================================"
echo "NotebookLM Günlük Hasat Tamamlandı: $(date)"
echo "============================================================"

#!/usr/bin/env python3
"""
NotebookLM Harvester — Extracts new knowledge from NotebookLM and feeds it
into the Aluplan Support Desk dataset pipeline.

Modes:
  discover  — Ask NotebookLM what topics it covers
  deep-discover — Exhaustively list index of 280+ sources
  gap       — Compare discovered topics against current dataset
  queue     — Generate a harvest queue (batch queue) from gap analysis
  harvest   — Extract new QA pairs and articles for missing topics
  push      — Send harvested data to backend API via /knowledge-pool/sync-external
  full      — Run all steps in sequence

Usage:
  python3 notebooklm-harvester.py deep-discover --notebook-url "..."
  python3 notebooklm-harvester.py gap
  python3 notebooklm-harvester.py queue
  python3 notebooklm-harvester.py harvest --batch 40
  python3 notebooklm-harvester.py push --api-url "http://localhost:4000"
"""

import argparse
import json
import hashlib
import csv
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Set

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
DATASET_DIR = PROJECT_ROOT / "dataset"
QA_FILE = DATASET_DIR / "allplan_qa_dataset.json"
INTENT_FILE = DATASET_DIR / "allplan_intent_classification.csv"
ARTICLES_DIR = DATASET_DIR / "support_articles"
HARVEST_OUTPUT = PROJECT_ROOT / "scripts" / ".harvest_cache"

# NotebookLM skill location — check multiple possible paths
_SKILL_CANDIDATES = [
    os.environ.get("NOTEBOOKLM_SKILL_PATH", ""),
    str(Path.home() / "Projects" / "aluplan-support-desk-V02" / ".agent" / "skills" / "notebooklm"),
    str(PROJECT_ROOT / ".agent" / "skills" / "notebooklm"),
    str(PROJECT_ROOT.parent / "aluplan-support-desk-V02" / ".agent" / "skills" / "notebooklm"),
]
NOTEBOOKLM_SKILL = Path(next((p for p in _SKILL_CANDIDATES if p and Path(p).exists()), _SKILL_CANDIDATES[1]))


def ensure_dirs():
    """Ensure output directories exist."""
    HARVEST_OUTPUT.mkdir(parents=True, exist_ok=True)


def ask_notebooklm(question: str, notebook_url: str, show_browser: bool = False) -> Optional[str]:
    """Ask a question to NotebookLM via the skill's ask_question.py script."""
    cmd = [
        sys.executable, str(NOTEBOOKLM_SKILL / "scripts" / "run.py"),
        "ask_question.py",
        "--question", question,
        "--notebook-url", notebook_url,
    ]
    if show_browser:
        cmd.append("--show-browser")

    print(f"  🤖 Asking NotebookLM: {question[:80]}...")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600, cwd=str(NOTEBOOKLM_SKILL))
        if result.returncode != 0:
            print(f"  ❌ Error: {result.stderr[:200]}")
            return None

        # Parse the answer from stdout (between ===== markers)
        output = result.stdout
        lines = output.split("\n")
        in_answer = False
        answer_lines = []
        marker_count = 0

        for line in lines:
            if "=" * 60 in line:
                marker_count += 1
                if marker_count == 2:
                    in_answer = True
                    continue
                elif marker_count == 3:
                    break
            elif in_answer:
                answer_lines.append(line)

        answer = "\n".join(answer_lines).strip()

        # Remove the follow-up reminder
        if "EXTREMELY IMPORTANT" in answer:
            answer = answer[:answer.index("EXTREMELY IMPORTANT")].strip()

        return answer if answer else None

    except subprocess.TimeoutExpired:
        print("  ⏰ Timeout waiting for NotebookLM")
        return None
    except Exception as e:
        print(f"  ❌ Exception: {e}")
        return None


def load_existing_qa() -> Dict:
    """Load current QA dataset."""
    if QA_FILE.exists():
        with open(QA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"project": "Allplan World-Class Support Intelligence", "version": "v4.0", "qa_pairs": []}


def load_existing_intents() -> List[Dict]:
    """Load current intent classification data."""
    intents = []
    if INTENT_FILE.exists():
        with open(INTENT_FILE, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            intents = list(reader)
    return intents


def get_existing_categories() -> Set[str]:
    """Extract all categories from QA dataset."""
    qa = load_existing_qa()
    categories = set()
    for pair in qa.get("qa_pairs", []):
        cat = pair.get("category", "")
        if cat:
            categories.add(cat)
    return categories


def get_existing_article_titles() -> Set[str]:
    """Get basenames of all existing support articles."""
    titles = set()
    if ARTICLES_DIR.exists():
        for f in ARTICLES_DIR.iterdir():
            if f.suffix == ".md" and not f.name.endswith(".metadata.json") and "resolved" not in f.name:
                titles.add(f.stem)
    return titles


# ─── MODE: DISCOVER ────────────────────────────────────────────────────────────

def discover(notebook_url: str, show_browser: bool = False) -> List[str]:
    """Ask NotebookLM what topics and content it has."""
    print("\n🔍 Faz 1: İçerik Keşfi (Discover)")
    print("=" * 60)

    answer = ask_notebooklm(
        question=(
            "Bu notebook'taki tüm belgelerin başlıklarını, konularını ve kategorilerini listele. "
            "Her belge için: başlık, konu, ve kısa açıklama ver. "
            "Mümkünse şu kategorilere göre grupla: Lisans, BIM/IFC, Donatı, Çelik, "
            "PythonParts, Allplan Share, Visual Scripting, Türkiye Mevzuatı, Altyapı, Performans."
        ),
        notebook_url=notebook_url,
        show_browser=show_browser,
    )

    if not answer:
        print("  ❌ Keşif başarısız")
        return []

    # Save raw discovery
    discovery_file = HARVEST_OUTPUT / "discovery_raw.md"
    with open(discovery_file, "w", encoding="utf-8") as f:
        f.write(f"# NotebookLM İçerik Keşfi\n\n")
        f.write(f"**Tarih:** {datetime.now().isoformat()}\n")
        f.write(f"**Notebook:** {notebook_url}\n\n")
        f.write(answer)

    print(f"\n  ✅ Keşif sonucu kaydedildi: {discovery_file}")
    print(f"\n  📝 Cevap:\n{answer[:500]}...")

    # Extract topics (simple line-based extraction)
    topics = []
    for line in answer.split("\n"):
        line = line.strip()
        if line and len(line) > 5 and not line.startswith("#"):
            topics.append(line)

    return topics

# ─── MODE: DEEP DISCOVER ────────────────────────────────────────────────────────

def deep_discover(notebook_url: str, show_browser: bool = False) -> List[str]:
    """Ask NotebookLM to exhaustively list all topics from 280+ sources."""
    print("\n🔍 Faz 5: Derinlemesine İçerik Keşfi (Deep Discover)")
    print("=" * 60)

    answer = ask_notebooklm(
        question=(
            "Bu notebook'ta 280'den fazla belge/kaynak var. Lütfen tüm bu kaynakların "
            "içerdiği BÜTÜN ana ve alt konuları, modülleri, özellikleri ve hata çözümlerini "
            "çok detaylı bir fihrist (index) şeklinde listele. Mümkün olduğunca spesifik ol, "
            "hiçbir büyük konuyu atlama. Listeyi madde madde çıkar."
        ),
        notebook_url=notebook_url,
        show_browser=show_browser,
    )

    if not answer:
        print("  ❌ Derin keşif başarısız")
        return []

    # Save raw discovery
    discovery_file = HARVEST_OUTPUT / "discovery_raw.md"  # Overwrite so gap analysis uses it
    with open(discovery_file, "w", encoding="utf-8") as f:
        f.write(f"# NotebookLM Derin Keşif (280+ Kaynak)\n\n")
        f.write(f"**Tarih:** {datetime.now().isoformat()}\n")
        f.write(f"**Notebook:** {notebook_url}\n\n")
        f.write(answer)

    print(f"\n  ✅ Derin keşif sonucu kaydedildi: {discovery_file}")
    print(f"\n  📝 Cevap:\n{answer[:500]}...")

    # Extract topics
    topics = []
    for line in answer.split("\n"):
        line = line.strip()
        if line and len(line) > 5 and not line.startswith("#") and not line.startswith("**"):
            # Remove leading numbers or bullets
            clean_line = line
            if clean_line.startswith("-") or clean_line.startswith("*"):
                clean_line = clean_line[1:].strip()
            elif len(clean_line) > 2 and clean_line[0].isdigit() and clean_line[1] in (".", ")"):
                clean_line = clean_line[2:].strip()
            topics.append(clean_line)

    return topics


# ─── MODE: GAP ANALYSIS ───────────────────────────────────────────────────────

def gap_analysis() -> Dict:
    """Compare discovered topics with existing dataset."""
    print("\n🔎 Faz 2: Gap Analizi")
    print("=" * 60)

    existing_categories = get_existing_categories()
    existing_articles = get_existing_article_titles()

    print(f"  📊 Mevcut QA Kategorileri: {len(existing_categories)}")
    for cat in sorted(existing_categories):
        print(f"     • {cat}")

    print(f"\n  📊 Mevcut Makale Sayısı: {len(existing_articles)}")

    # Load discovery data
    discovery_file = HARVEST_OUTPUT / "discovery_raw.md"
    discovered_topics = []
    if discovery_file.exists():
        with open(discovery_file, "r", encoding="utf-8") as f:
            content = f.read()
            for line in content.split("\n"):
                line = line.strip()
                if line and len(line) > 5 and not line.startswith("#") and not line.startswith("**"):
                    discovered_topics.append(line)

    print(f"\n  📊 NotebookLM'den Keşfedilen Konular: {len(discovered_topics)}")

    # Save gap report
    gap_report = {
        "timestamp": datetime.now().isoformat(),
        "existing_categories": sorted(list(existing_categories)),
        "existing_article_count": len(existing_articles),
        "discovered_topics": discovered_topics,
        "existing_articles": sorted(list(existing_articles)),
    }

    gap_file = HARVEST_OUTPUT / "gap_report.json"
    with open(gap_file, "w", encoding="utf-8") as f:
        json.dump(gap_report, f, indent=2, ensure_ascii=False)

    print(f"\n  ✅ Gap raporu kaydedildi: {gap_file}")
    return gap_report


# ─── MODE: QUEUE ─────────────────────────────────────────────────────────────

def generate_queue():
    """Generates a batch queue from the gap analysis."""
    print("\n📋 Faz 5: Hasat Kuyruğu (Queue) Oluşturma")
    print("=" * 60)

    gap_file = HARVEST_OUTPUT / "gap_report.json"
    if not gap_file.exists():
        print("  ❌ Gap raporu bulunamadı. Önce 'gap' modunu çalıştırın.")
        return

    with open(gap_file, "r", encoding="utf-8") as f:
        gap_report = json.load(f)

    # All discovered topics technically need to be harvested if they aren't obviously duplicates.
    # For now, we queue all discovered topics. The backend handles exact duplicates via originalId.
    pending_topics = gap_report.get("discovered_topics", [])
    
    queue_file = HARVEST_OUTPUT / "harvest_queue.json"
    
    queue_data = {
        "pending": pending_topics,
        "completed": [],
        "failed": [],
        "updated_at": datetime.now().isoformat()
    }

    # Merge with existing queue if it exists
    if queue_file.exists():
        try:
            with open(queue_file, "r", encoding="utf-8") as f:
                old_queue = json.load(f)
                # Only add newly discovered topics that aren't already completed/failed/pending
                existing_all = set(old_queue.get("pending", []) + old_queue.get("completed", []) + old_queue.get("failed", []))
                new_arrivals = [t for t in pending_topics if t not in existing_all]
                old_queue["pending"].extend(new_arrivals)
                old_queue["updated_at"] = datetime.now().isoformat()
                queue_data = old_queue
                print(f"  📊 {len(new_arrivals)} yeni konu kuyruğa eklendi. Toplam bekleyen: {len(queue_data['pending'])}")
        except:
            pass

    with open(queue_file, "w", encoding="utf-8") as f:
        json.dump(queue_data, f, indent=2, ensure_ascii=False)

    print(f"  ✅ Kuyruk kaydedildi: {queue_file}")
    print(f"  🚦 Bekleyen Görev: {len(queue_data.get('pending', []))}")
    return queue_data


# ─── MODE: HARVEST ─────────────────────────────────────────────────────────────

def harvest(notebook_url: str, topics: List[str] = None, batch_size: int = 0, show_browser: bool = False) -> List[Dict]:
    """Extract detailed QA pairs from NotebookLM using the queue."""
    print(f"\n🌾 Faz 3/5: Bilgi Toplama (Harvest)")
    print("=" * 60)

    queue_file = HARVEST_OUTPUT / "harvest_queue.json"
    
    # If specific topics are provided, ignore queue and just process them
    if topics and len(topics) > 0:
        targets = topics
        print(f"  🎯 Manuel konu listesi işleniyor ({len(targets)} konu)")
        use_queue = False
    else:
        # Use queue
        if not queue_file.exists():
            print("  ❌ Kuyruk dosyası bulunamadı. Önce 'queue' modunu çalıştırın.")
            return []
            
        with open(queue_file, "r", encoding="utf-8") as f:
            queue_data = json.load(f)
            
        pending = queue_data.get("pending", [])
        if not pending:
            print("  ✅ Kuyrukta bekleyen işlem yok!")
            return []
            
        if batch_size > 0:
            targets = pending[:batch_size]
            print(f"  🎯 Kuyruktan {batch_size} konu işleniyor (Kalan: {len(pending) - len(targets)})")
        else:
            targets = pending
            print(f"  🎯 Kuyruktaki tüm {len(targets)} konu işleniyor")
        use_queue = True

    # Load previously harvested data to append to it
    harvest_file = HARVEST_OUTPUT / "harvested_data.json"
    harvested = []
    if harvest_file.exists():
        try:
            with open(harvest_file, "r", encoding="utf-8") as f:
                harvested = json.load(f)
        except:
            pass

    success_count = 0

    for i, topic in enumerate(targets, 1):
        print(f"\n  [{i}/{len(targets)}] Konu: {topic}")

        # Ask a detailed question about this topic
        answer = ask_notebooklm(
            question=(
                f"'{topic}' konusu hakkında detaylı bilgi ver. "
                f"Sorun tanımı, temel çözüm adımları, dikkat edilecek noktalar ve "
                f"best practice'leri dahil et. Eğitim materyali veya destek makalesi formatında olsun."
                f"Cevabı Türkçe ver."
            ),
            notebook_url=notebook_url,
            show_browser=show_browser,
        )

        if not answer:
            print(f"  ⚠️ '{topic}' için cevap alınamadı.")
            if use_queue:
                queue_data["pending"].remove(topic)
                queue_data.setdefault("failed", []).append(topic)
                queue_data["updated_at"] = datetime.now().isoformat()
                with open(queue_file, "w", encoding="utf-8") as f:
                    json.dump(queue_data, f, indent=2, ensure_ascii=False)
            continue

        # Generate unique ID
        topic_hash = hashlib.md5(topic.encode()).hexdigest()[:8]
        original_id = f"nlm-{topic_hash}"

        # Create harvested entry
        entry = {
            "id": original_id,
            "topic": topic,
            "title": topic[:100],  # Title limit
            "content": answer,
            "category": "NotebookLM / Genişletilmiş Veri",
            "harvested_at": datetime.now().isoformat(),
            "source_notebook_url": notebook_url,
        }
        harvested.append(entry)
        success_count += 1
        print(f"  ✅ Toplanan: {topic[:60]} ({len(answer)} karakter)")
        
        # Save harvested data immediately (checkpoint)
        with open(harvest_file, "w", encoding="utf-8") as f:
            json.dump(harvested, f, indent=2, ensure_ascii=False)
            
        # Update queue
        if use_queue:
            queue_data["pending"].remove(topic)
            queue_data.setdefault("completed", []).append(topic)
            queue_data["updated_at"] = datetime.now().isoformat()
            with open(queue_file, "w", encoding="utf-8") as f:
                json.dump(queue_data, f, indent=2, ensure_ascii=False)

    print(f"\n  ✅ {success_count} konu başarıyla toplandı → {harvest_file}")
    return harvested


# ─── MODE: PUSH ────────────────────────────────────────────────────────────────

def push_to_backend(api_url: str, auth_token: Optional[str] = None):
    """Push harvested data to the backend API and write to dataset files."""
    print("\n📤 Faz 4: Veri Aktarımı (Push)")
    print("=" * 60)

    # Load harvested data
    harvest_file = HARVEST_OUTPUT / "harvested_data.json"
    if not harvest_file.exists():
        print("  ❌ Harvest verisi bulunamadı. Önce 'harvest' modunu çalıştırın.")
        return

    with open(harvest_file, "r", encoding="utf-8") as f:
        harvested = json.load(f)

    if not harvested:
        print("  ⚠️ Harvest verisi boş.")
        return

    print(f"  📊 {len(harvested)} adet kayıt aktarılacak")

    # ── Step 1: Write to dataset/support_articles/ ──
    qa_data = load_existing_qa()
    next_qa_id = len(qa_data.get("qa_pairs", [])) + 1
    new_articles = []
    new_qa_pairs = []

    for entry in harvested:
        # Create markdown article
        slug = entry["id"].replace("nlm-", "nlm_")
        article_filename = f"nlm_{slug}_{entry['topic'][:40].lower().replace(' ', '_')}.md"
        # Sanitize filename
        article_filename = "".join(c for c in article_filename if c.isalnum() or c in "._-")
        article_path = ARTICLES_DIR / article_filename

        article_content = f"""# {entry['title']}

> **Kaynak:** NotebookLM Otomatik Çıkarma
> **Tarih:** {entry['harvested_at']}
> **Orijinal ID:** {entry['id']}

---

{entry['content']}

---

*Bu makale NotebookLM bilgi tabanından otomatik olarak çıkarılmıştır.*
"""
        with open(article_path, "w", encoding="utf-8") as f:
            f.write(article_content)
        new_articles.append(article_filename)
        print(f"  📝 Makale yazıldı: {article_filename}")

        # Add QA pair
        qa_pair = {
            "id": f"QA_{next_qa_id:03d}",
            "category": entry.get("category", "NotebookLM / Yeni Veri"),
            "short_answer": entry["content"][:200] + "..." if len(entry["content"]) > 200 else entry["content"],
            "long_answer_markdown_ref": f"support_articles/{article_filename}",
        }
        new_qa_pairs.append(qa_pair)
        next_qa_id += 1

    # Update QA dataset JSON
    qa_data["qa_pairs"].extend(new_qa_pairs)
    qa_data["version"] = f"v4.0_NLM_Enriched_{datetime.now().strftime('%Y%m%d')}"

    with open(QA_FILE, "w", encoding="utf-8") as f:
        json.dump(qa_data, f, indent=4, ensure_ascii=False)
    print(f"\n  ✅ QA dataset güncellendi: {len(new_qa_pairs)} yeni çift eklendi")

    # ── Step 2: Push to backend API ──
    if api_url:
        import urllib.request
        import urllib.error

        docs_payload = []
        for entry in harvested:
            docs_payload.append({
                "title": entry["title"],
                "content": entry["content"],
                "originalId": entry["id"],
                "url": entry.get("source_notebook_url", ""),
            })

        payload = json.dumps({"docs": docs_payload}).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"

        url = f"{api_url.rstrip('/')}/knowledge-pool/sync-external"
        print(f"\n  🌐 API Push: {url}")

        try:
            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode())
                print(f"  ✅ API Yanıtı: eklenen={result.get('added', '?')}, atlanan={result.get('skipped', '?')}")
        except urllib.error.HTTPError as e:
            print(f"  ⚠️ API Hatası ({e.code}): {e.read().decode()[:200]}")
            print("     Dataset dosyaları yazıldı. 'sync-dataset' ile manuel tetikleyebilirsiniz.")
        except Exception as e:
            print(f"  ⚠️ API bağlantı hatası: {e}")
            print("     Dataset dosyaları yazıldı. 'sync-dataset' ile manuel tetikleyebilirsiniz.")

    # Summary
    print(f"\n{'=' * 60}")
    print(f"📊 ÖZET:")
    print(f"   Yeni makale: {len(new_articles)}")
    print(f"   Yeni QA çifti: {len(new_qa_pairs)}")
    print(f"   Dataset dosyası: {QA_FILE}")
    print(f"{'=' * 60}")


# ─── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="NotebookLM Harvester — Aluplan Dataset Zenginleştirme Aracı",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    subparsers = parser.add_subparsers(dest="mode", help="Çalışma modu")

    # discover
    dp = subparsers.add_parser("discover", help="NotebookLM içerik keşfi")
    dp.add_argument("--notebook-url", required=True, help="NotebookLM URL")
    dp.add_argument("--show-browser", action="store_true", help="Browser'ı göster")

    # deep-discover
    ddp = subparsers.add_parser("deep-discover", help="Tüm 280+ kaynağın detaylı keşfi")
    ddp.add_argument("--notebook-url", required=True, help="NotebookLM URL")
    ddp.add_argument("--show-browser", action="store_true", help="Browser'ı göster")

    # gap
    subparsers.add_parser("gap", help="Mevcut dataset ile gap analizi")
    
    # queue
    subparsers.add_parser("queue", help="Hasat kuyruğu oluştur")

    # harvest
    hp = subparsers.add_parser("harvest", help="Eksik konuları topla")
    hp.add_argument("--notebook-url", required=True, help="NotebookLM URL")
    hp.add_argument("--topics", help="Virgülle ayrılmış spesifik konu listesi (yoksa kuyruktan alır)")
    hp.add_argument("--batch", type=int, default=0, help="Kuyruktan işlenecek maksimum konu sayısı (rate-limit için)")
    hp.add_argument("--show-browser", action="store_true", help="Browser'ı göster")

    # push
    pp = subparsers.add_parser("push", help="Toplanan veriyi dataset ve API'ye aktar")
    pp.add_argument("--api-url", default="", help="Backend API URL (opsiyonel)")
    pp.add_argument("--auth-token", default="", help="JWT auth token (opsiyonel)")

    # full
    fp = subparsers.add_parser("full", help="Tüm adımları sırayla çalıştır")
    fp.add_argument("--notebook-url", required=True, help="NotebookLM URL")
    fp.add_argument("--api-url", default="", help="Backend API URL")
    fp.add_argument("--auth-token", default="", help="JWT auth token")
    fp.add_argument("--show-browser", action="store_true", help="Browser'ı göster")

    args = parser.parse_args()

    if not args.mode:
        parser.print_help()
        return

    ensure_dirs()

    if args.mode == "discover":
        discover(args.notebook_url, args.show_browser)

    elif args.mode == "deep-discover":
        deep_discover(args.notebook_url, args.show_browser)

    elif args.mode == "gap":
        gap_analysis()

    elif args.mode == "queue":
        generate_queue()

    elif args.mode == "harvest":
        topics = [t.strip() for t in args.topics.split(",")] if args.topics else None
        harvest(args.notebook_url, topics, args.batch, args.show_browser)

    elif args.mode == "push":
        push_to_backend(args.api_url, args.auth_token)

    elif args.mode == "full":
        # Step 1: Discover
        topics = discover(args.notebook_url, args.show_browser)

        # Step 2: Gap analysis
        gap = gap_analysis()
        
        # Step 3: Queue
        generate_queue()

        # Step 4: Harvest (First 10 for rate limit safety linearly)
        harvested = harvest(args.notebook_url, None, 10, args.show_browser)

        if harvested:
            # Step 5: Push
            push_to_backend(args.api_url, args.auth_token)


if __name__ == "__main__":
    main()

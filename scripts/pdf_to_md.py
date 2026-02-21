#!/usr/bin/env python3
"""
PDF to Markdown Converter with Table Extraction
Processes all PDFs in a source directory, categorizes them, and outputs MD files.
"""

import os
import re
import pdfplumber

# ── Configuration ──────────────────────────────────────────────────────────────
SOURCE_DIR = "/Users/hazarekiz/Projects/aluplan-support-desk-V02/Bilgi Bankası/allplan yeni"
OUTPUT_BASE = "/Users/hazarekiz/Projects/aluplan-support-desk-V02/Bilgi Bankası/BilgiHavuzuMD/KategorizeEdilmisDokumanlar"

# Category rules: (pattern, subfolder, label)
CATEGORIES = [
    (r"Allplan Bridge",                "Training_Guidelines",     "Training Guidelines"),
    (r"Allplan_2022_BasicsTutl",       "Allplan_2022_Basics",     "Allplan 2022 Basics Tutorial"),
    (r"Allplan_2022_EngineeringTutl",  "Allplan_2022_Engineering","Allplan 2022 Engineering Tutorial"),
    (r"Allplan_2022_Manual",           "Allplan_2022_Manual",     "Allplan 2022 Manual"),
    (r"Allplan_2022_SbS",             "Allplan_2022_SbS",        "Allplan 2022 Step-by-Step"),
    (r"Allplan_2025",                  "Allplan_2025",            "Allplan 2025"),
    (r"Allplan_Share",                 "Allplan_Share",           "Allplan Share"),
    (r"Hotlinetools",                  "Tools_and_Macros",        "Hotline Tools"),
    (r"L1_P_SfS_SetupVisualStudio",   "Tools_and_Macros",        "Visual Studio Setup"),
    (r"L1_W_NovedadesALLPLAN",        "Allplan_2025",            "Allplan 2025 Novedades"),
    (r"MAN.*SCIA",                     "SCIA_Engineer_Manuals",   "SCIA Engineer Manual"),
    (r"TUT.*SCIA",                     "SCIA_Engineer_Tutorials", "SCIA Engineer Tutorial"),
    (r"Validation Manual SCIA",        "SCIA_Engineer_Manuals",   "SCIA Validation Manual"),
    (r"Makro_erstellen",               "Tools_and_Macros",        "Macro Creation"),
    (r"Manuál.*šablón",               "BIM_Templates",           "BIM Template Manual"),
    (r"Manuál.*šablonu",              "BIM_Templates",           "BIM Template Manual"),
]

def categorize(filename):
    """Determine category for a file based on filename patterns."""
    for pattern, subfolder, label in CATEGORIES:
        if re.search(pattern, filename, re.IGNORECASE):
            return subfolder, label
    return "Diger", "Diğer"

def extract_table_as_markdown(table):
    """Convert a pdfplumber table to Markdown table format."""
    if not table or len(table) < 1:
        return ""
    
    # Clean None values
    cleaned = []
    for row in table:
        cleaned_row = [str(cell).strip() if cell else "" for cell in row]
        cleaned.append(cleaned_row)
    
    if not cleaned:
        return ""
    
    # Build markdown table
    lines = []
    header = cleaned[0]
    max_cols = max(len(r) for r in cleaned)
    
    # Pad rows to max columns
    for i, row in enumerate(cleaned):
        while len(row) < max_cols:
            row.append("")
    
    # Header
    lines.append("| " + " | ".join(header) + " |")
    lines.append("| " + " | ".join(["---"] * max_cols) + " |")
    
    # Data rows
    for row in cleaned[1:]:
        lines.append("| " + " | ".join(row) + " |")
    
    return "\n".join(lines)

def extract_pdf_to_md(pdf_path, category_label):
    """Extract text and tables from a PDF and return markdown content."""
    md_lines = []
    filename = os.path.splitext(os.path.basename(pdf_path))[0]
    
    # Clean the filename for the title (remove hash suffixes)
    clean_name = re.sub(r'-[a-z0-9]{10,}$', '', filename)
    clean_name = clean_name.replace('_', ' ')
    
    md_lines.append(f"# {clean_name}")
    md_lines.append(f"\n**Kategori:** {category_label}")
    md_lines.append(f"**Kaynak:** `{os.path.basename(pdf_path)}`\n")
    md_lines.append("---\n")
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            md_lines.append(f"**Toplam Sayfa:** {total_pages}\n")
            
            for i, page in enumerate(pdf.pages):
                # Extract tables first
                tables = page.extract_tables()
                table_texts = set()
                
                if tables:
                    for table in tables:
                        table_md = extract_table_as_markdown(table)
                        if table_md:
                            # Collect table cell texts to avoid duplication
                            for row in table:
                                for cell in row:
                                    if cell:
                                        table_texts.add(cell.strip())
                
                # Extract text
                text = page.extract_text()
                if text:
                    # Remove lines that are purely table content (avoid duplication)
                    lines = text.split('\n')
                    filtered_lines = []
                    for line in lines:
                        stripped = line.strip()
                        if stripped and stripped not in table_texts:
                            filtered_lines.append(stripped)
                    
                    if filtered_lines:
                        # Add page marker for longer documents
                        if total_pages > 5 and (i == 0 or i % 10 == 0):
                            md_lines.append(f"\n## Sayfa {i+1}\n")
                        
                        md_lines.append('\n'.join(filtered_lines))
                
                # Add tables after text
                if tables:
                    for table in tables:
                        table_md = extract_table_as_markdown(table)
                        if table_md:
                            md_lines.append(f"\n{table_md}\n")
                
                md_lines.append("")  # Blank line between pages
                
    except Exception as e:
        md_lines.append(f"\n> **⚠️ Hata:** Bu dosya işlenirken bir hata oluştu: {str(e)}\n")
    
    return '\n'.join(md_lines)

def main():
    """Main processing loop."""
    stats = {"processed": 0, "skipped": 0, "errors": 0, "categories": {}}
    
    # Get all PDF files
    pdf_files = sorted([
        f for f in os.listdir(SOURCE_DIR)
        if f.lower().endswith('.pdf')
    ])
    
    print(f"📂 Kaynak: {SOURCE_DIR}")
    print(f"📄 Bulunan PDF sayısı: {len(pdf_files)}")
    print(f"📁 Çıktı: {OUTPUT_BASE}")
    print("-" * 60)
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(SOURCE_DIR, pdf_file)
        subfolder, label = categorize(pdf_file)
        
        # Create output directory
        output_dir = os.path.join(OUTPUT_BASE, subfolder)
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate output filename
        clean_name = re.sub(r'-[a-z0-9]{10,}', '', os.path.splitext(pdf_file)[0])
        clean_name = re.sub(r'[^\w\s\-\[\]]', '_', clean_name).strip('_')
        clean_name = re.sub(r'_+', '_', clean_name)
        output_path = os.path.join(output_dir, f"{clean_name}.md")
        
        print(f"  🔄 [{subfolder}] {pdf_file[:60]}...", end=" ", flush=True)
        
        try:
            md_content = extract_pdf_to_md(pdf_path, label)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(md_content)
            
            stats["processed"] += 1
            stats["categories"][subfolder] = stats["categories"].get(subfolder, 0) + 1
            print("✅")
        except Exception as e:
            stats["errors"] += 1
            print(f"❌ {str(e)[:50]}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SONUÇ RAPORU")
    print("=" * 60)
    print(f"  ✅ İşlenen: {stats['processed']}")
    print(f"  ❌ Hata: {stats['errors']}")
    print(f"  ⏭️  Atlanan: {stats['skipped']}")
    print(f"\n📁 Kategori Dağılımı:")
    for cat, count in sorted(stats["categories"].items()):
        print(f"  📂 {cat}: {count} dosya")
    print("=" * 60)

if __name__ == "__main__":
    main()

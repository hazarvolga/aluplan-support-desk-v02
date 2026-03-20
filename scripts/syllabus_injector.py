import json
import re
from pathlib import Path

# The raw syllabus provided by the user
SYLLABUS = """
1. Allplan Fundamentals (120 Lessons)
Course 1 — Introduction to Allplan
Modules:
	•	Software overview
	•	BIM basics
	•	Interface navigation
	•	Workspace configuration
Course 2 — Interface Mastery
Modules:
	•	Toolbars
	•	Smart palettes
	•	Workspace layouts
	•	UI customization
Course 3 — File & Project Management
Modules:
	•	Project creation
	•	Structure management
	•	Drawing files
	•	Backup systems
Course 4 — Coordinate Systems
Modules:
	•	Global coordinates
	•	Local coordinates
	•	Reference points
Course 5 — Productivity Essentials
Modules:
	•	Snapping systems
	•	Input methods
	•	Keyboard workflows
	•	Precision drawing

2. Allplan Architecture (150 Lessons)
Course 1 — 2D Drafting
Modules:
	•	Line tools
	•	Hatch & fills
	•	Dimensions
	•	Annotation
Course 2 — Architectural Modeling
Modules:
	•	Walls
	•	Doors
	•	Windows
	•	Slabs
	•	Roofs
Course 3 — Building Components
Modules:
	•	Stairs
	•	Railings
	•	Curtain walls
Course 4 — Parametric Objects
Modules:
	•	Smart objects
	•	Parametric editing

3. Structural Engineering (160 Lessons)
Course 1 — Structural Modeling
Modules:
	•	Columns
	•	Beams
	•	Structural walls
Course 2 — Structural Systems
Modules:
	•	Load-bearing structures
	•	Structural grids
Course 3 — Analysis Preparation
Modules:
	•	Structural export
	•	FEM preparation
Course 4 — Detailing
Modules:
	•	Structural drawings
	•	Sections

4. Reinforcement & Rebar (140 Lessons)
Course 1 — Rebar Basics
Course 2 — Reinforcement Modeling
Course 3 — Advanced Reinforcement
Course 4 — Reinforcement Documentation

5. BIM & OpenBIM Workflows (120 Lessons)
Course 1 — BIM Fundamentals
Course 2 — IFC Exchange
Course 3 — Model Coordination
Course 4 — BIM Collaboration

6. Infrastructure & Civil (90 Lessons)
Course 1 — Terrain Modeling
Course 2 — Roads & Infrastructure
Course 3 — Site Planning

7. Visualization & Presentation (80 Lessons)
Course 1 — Rendering
Course 2 — Materials & Lighting
Course 3 — Presentation Layouts

8. Automation & Parametric Design (80 Lessons)
Course 1 — Smart Components
Course 2 — Parametric workflows
Course 3 — Automation tools

9. Collaboration & Office Standards (90 Lessons)
Course 1 — Team workflows
Course 2 — Office templates
Course 3 — Version control

10. Enterprise Project Management (100 Lessons)
Course 1 — Large Project Setup
Course 2 — Model Coordination
Course 3 — Documentation pipelines
Course 4 — BIM delivery standards
"""

def parse_syllabus():
    topics = []
    current_main = ""
    current_course = ""
    
    for line in SYLLABUS.split("\n"):
        line = line.strip()
        if not line:
            continue
            
        # Match main category e.g., "1. Allplan Fundamentals (120 Lessons)"
        if re.match(r"^\d+\.\s", line):
            current_main = re.sub(r"^\d+\.\s*", "", line)
            current_main = re.sub(r"\s*\(.*?\)", "", current_main).strip()
            current_course = ""
            continue
            
        # Match Course e.g., "Course 1 — Introduction to Allplan"
        if line.startswith("Course "):
            parts = line.split("—")
            if len(parts) > 1:
                current_course = parts[1].strip()
            else:
                # If there's no dash, and it's just a course name 
                # (some blocks like Course 1 — Terrain Modeling don't have modules under them in the text)
                if "—" in line:
                    current_course = line.split("—")[1].strip()
                elif "-" in line:
                    current_course = line.split("-")[1].strip()
                else:
                    current_course = line.replace("Course", "").strip()
            
            # If no modules are listed under it, we just add the course itself
            if current_main and current_course:
                topics.append(f"{current_main} / {current_course}")
            continue
            
        # Match module e.g. "• Software overview"
        if line.startswith("•") or line.startswith("-"):
            module = line.replace("•", "").replace("-", "").strip()
            if current_main and current_course and module:
                topic = f"Eğitim: {current_main} / {current_course} / {module} detaylı anlatımı"
                topics.append(topic)
                # We remove the standalone course topic if modules exist, to avoid duplication,
                # but to keep it simple we'll just add the module specific ones.
                
    # Clean up standalone courses if they have sub-modules (optimization)
    final_topics = set(topics)
    return sorted(list(final_topics))

def main():
    topics = parse_syllabus()
    print(f"Syllabus parse edildi. Toplam {len(topics)} adet hedeflenmiş eğitim konusu (prompt) çıkarıldı.")
    
    # Load existing queue
    queue_file = Path("/Users/hazarekiz/aluplan-support-desk-v02-main/scripts/.harvest_cache/harvest_queue.json")
    if queue_file.exists():
        with open(queue_file, "r", encoding="utf-8") as f:
            queue_data = json.load(f)
    else:
        queue_data = {"pending": [], "completed": [], "failed": [], "updated_at": ""}
        
    pending = queue_data.get("pending", [])
    
    # We want to put these HIGH PRIORITY syllabus topics at the front of the queue
    # Check duplicates
    existing_all = set(pending + queue_data.get("completed", []) + queue_data.get("failed", []))
    new_topics = [t for t in topics if t not in existing_all]
    
    # Prepend
    queue_data["pending"] = new_topics + pending
    
    with open(queue_file, "w", encoding="utf-8") as f:
        json.dump(queue_data, f, indent=2, ensure_ascii=False)
        
    print(f"Kuyruğa başarıyla eklendi! Yeni bekleyen konu sayısı: {len(queue_data['pending'])}")

if __name__ == "__main__":
    main()

---
title: "Tip: Centralizing Coordination with BCF and Bimplus"
category: Tips
source: "Selected Tip: 3. Centralizing Coordination with BCF and Bimplus.txt"
tags: [Tip, Coordination, BCF, Bimplus, Issue Management, Interdisciplinary]
---

# Tip: Centralizing Coordination with BCF and Bimplus

## Scenario: Resolving a Critical MEP-Structural Clash in a Multi-Story Office Building Project

**Project:** A 15-story office building to be constructed in Istanbul.

**Involved Disciplines:**
- **Architectural Team:** Designs using Allplan.
- **Structural Engineering Team:** Models the load-bearing system using Allplan.
- **Mechanical, Electrical, and Plumbing (MEP) Team:** Designs HVAC systems using another BIM software (e.g., Revit).

## The Problem Encountered: A Clash That Could Halt Construction
During the coordination phase, when the BIM Coordinator aggregates models from all disciplines, a critical issue is detected: a main ventilation duct designed by the mechanical team, located in the ceiling of the 3rd floor corridor, clashes directly with the center of a main load-bearing beam (Beam K-305), which is 80cm deep and designed by the structural team. If this had been discovered during construction, it would have led to a major, costly problem, causing significant project delays—a classic interdisciplinary coordination error.

## Conventional Approach vs. Modern Workflow

### Attempted Solution with Traditional (Inefficient) Methods:
1. The BIM Coordinator takes a screenshot of the clash.
2. An email titled "Critical Clash" is sent to the Structural and MEP Project Managers. It includes the screenshot and a loose description ("located on the 3rd floor, between axes B and 5").
3. An email chain begins. The MEP engineer cannot precisely understand the exact location. The structural engineer spends time searching their own project to identify the beam from the screenshot.
4. Phone calls are made, new screenshots are shared. Solutions (e.g., beam penetration or duct rerouting) get lost in the email shuffle, making it impossible to track. This process takes days or weeks.

### Modern and Effective Solution Scenario with Allplan Bimplus and BCF:
**Step 1: Aggregating Models on the Bimplus Platform**
All disciplines upload their models (in IFC format) to the cloud-based Allplan Bimplus platform. The BIM Coordinator creates a federated project model and initiates Clash Detection directly within Bimplus.

**Step 2: Creating a BCF Issue**
Bimplus automatically identifies the clash. Instead of an email, the coordinator selects the clashing elements and clicks "Create Issue". This generates a standardized **BCF (BIM Collaboration Format)** entry:
- Title: Critical Clash: HVAC Duct - K-305 Beam / 3rd Floor
- Assigned To: Structural PM and MEP PM.
- Priority: High
- Description: Urgent coordination required.

*Crucially, Bimplus automatically attaches the clash's 3D camera angle, precise coordinates, and the unique identifiers (GUIDs) of the clashing elements.*

**Step 3: Viewing the Issue within Allplan**
The Structural Project Manager opens their Allplan software and sees the new issue in the integrated Issue Manager panel. Clicking the issue automatically zooms directly to the clash location within their own structural model, showing the clashing MEP duct as a reference.

**Step 4: Discussing the Solution and Updating the Model**
The structural engineer analyzes the beam and determines a 40x30 cm penetration can be created. They add their solution as a comment within the Allplan Issue Manager and change the status to "In Progress".

**Step 5: Feedback and Resolution**
The MEP engineer instantly sees this comment via their BIM software's BCF add-on. They respond that the dimensions are suitable and revise their model connections. The structural engineer revises the beam. Both re-upload to Bimplus.

**Step 6: Verification and Closure**
The BIM Coordinator re-runs the clash test, confirms the resolution, and transparently reviews the communication via the BCF record before changing the status to "Closed".

## Outcome
A problem that could have taken weeks and incurred significant costs on the construction site is fully resolved and documented within a few hours using a BCF-based centralized workflow where all communication is directly linked to the model.

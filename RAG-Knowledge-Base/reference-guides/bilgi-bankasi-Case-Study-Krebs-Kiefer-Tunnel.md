---
title: "BIM in Practice: Infrastructure Construction - Tunnel As-Built Modeling (Krebs+Kiefer)"
category: Case_Studies
source: Case_Study_Krebs-Kiefer_Tunnel_EN.pdf
tags: [Case Study, Infrastructure, Tunnel, Krebs+Kiefer, Scalypso, Laser Scanning, BIM, Allplan Civil]
---

# BIM in Practice: As-Built Modeling in Tunnel Construction - Unique Challenges

## Introduction
While rail is the most sustainable means of transport, a large portion of Germany's 30,000 km rail infrastructure is well over 100 years old. Construction work on existing rail infrastructure presents considerable planning challenges, particularly the **as-built modeling** of ancient tunnel structures.

Two current tunnel renovations highlight these challenges: 
1. **Schellenstein Tunnel:** Built in 1870/71, located between Aachen and Kassel, 247m long.
2. **Gudenhagen Tunnel:** Built in 1901, single-track, 280m long.

For both projects, **KREBS+KIEFER** was commissioned by DB InfraGO AG as the general planner and is responsible for overall BIM coordination.

### Project Information at a Glance
- **Focus:** Infrastructure construction (Rail Tunnels)
- **Software Used:** ALLPLAN, Scalypso, CloudCompare
- **Client:** DB InfraGO AG
- **General Planning:** KREBS+KIEFER Ingenieure GmbH
- **Project Start:** December 2023

## The Challenge: 800 Million Points vs. 25 Boreholes
A common issue in historic infrastructure is that hand-drawn, physical plans from over 100 years ago are scarce and provide little context to the actual modern conditions. Therefore, 3D surveying was heavily utilized.

- **Interior Scan:** A 3D laser scanner driven through the tunnels mapped the visible interior surface, generating high-precision point clouds of roughly 800 million points (14 GB).
- **Exterior (Mountain/Rock) Side:** Only 25 exploratory boreholes spanning across five cross-sections were performed.

It is impossible to create a perfectly accurate digital proxy of the tunnel solid wall because the massive discrepancy in point density creates "interpolated blind spots" behind the walls. 

## Modeling Workflow with ALLPLAN and Scalypso
Since rendering millions of points without matched exterior context acts as false accuracy, KREBS+KIEFER simplified the problem correctly:

1. **Sectioning:** Sections around the exploratory cross-sections were extracted from the massive 3D laser scan. 
2. **Scalypso Integration:** The huge survey data point cloud was compressed in Scalypso. Scalypso's direct interface to ALLPLAN allowed rapid live-transmission of required cross-sections to the ALLPLAN modeling space.
3. **Cross-Section Creation:** The physical wall thickness (extracted from 25 boreholes) was combined with the interior tunnel curve (from the point cloud) on parallel ALLPLAN work planes. 
4. **Foundation Modeling:** Since lower-tunnel foundations couldn't be accurately scanned by light, old construction plans were referenced. 
5. **Extrusion:** By linking the 2D cross sections together through 3D spatial extrusion, KREBS+KIEFER produced an effective, highly accurate as-built volumetric solid. 

## Beyond Point Clouds: Visualizations
KREBS+KIEFER continues to utilize Allplan to model replacement tunnel variations. Furthermore, they take advantage of **Twinmotion Direct Link** to synchronously beam their precise ALLPLAN bridge/tunnel models directly into the Twinmotion environment for immediate high-resolution rendering and VR tours.

> "Thanks to the direct Scalypso interface, ALLPLAN processes point clouds efficiently and precisely, supporting reliable as-built modeling."
> 
> *— Clemens Schöppner, BIM modeling expert at KREBS+KIEFER*

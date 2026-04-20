---
title: "Data Exchange Formats - ALLPLAN 2026"
category: Technical_References
source: Data_exchange_formats_ALLPLAN_2026_EN.pdf
tags: [Data Exchange, Interoperability, IFC, BCF, Allplan 2026, Import, Export]
---

# Data Exchange Formats: ALLPLAN 2026

## Import Formats

### General Import Formats
- **DXF, DWG, AutoCAD-data:** `.dxf`, `.dwg`, `.dwt`, `.dxb` (Until version 2025 incl. ACIS support)
- **DGN, MicroStation-data:** `.dgn` (Version 8, version 7)
- **Revit:** `.rvt` (Until version 2023)
- **PDF, PDF/A:** `.pdf` (Vector and pixel data)
- **3D-PDF:** `.pdf` (U3D format, ECMA-363 1st edition)
- **IFC:** `.ifc`, `.ifcXML`, `.ifcZIP` (2x3, 4 incl. IFC4PRECAST, 4.3)
- **BCF:** `.bcf`
- **CINEMA 4D:** `.c4d` (Versions 12.5 to 24)
- **SketchUp:** `.skp` (Versions 6 to 2021)
- **OBJ:** `.obj` (Wavefront OBJ)
- **Rhino:** `.3dm` (Versions 1 to 5)
- **STL:** `.stl` (3D-Printer-Format)
- **VRML:** `.wrl` (Version 2)
- **XML:** `.xml` (NOI XML)
- **XPlanung:** `.gml`
- **Hpgl/2 plot files:** `.plt`, `.hp`, `.hpg`, `.hpl`, `.prn`

### Import Formats for Coordinate Values, Terrain Model
- **Coordinate, axis and curve values:** `.re1`, `.reb`, `.re2`, `.asc`, `.lin` (Including lines with attributes)
- **Terrain model:** longitudinal profiles, cross-sections (`.lpr`, `.qpr`)
- **LandXML:** `.xml` (Version 1.0 to 2.0)

### Import Formats for Civil Engineering
- **FEM Data (Frilo, Scia):** `.asf` (Plus Infograph, Cubus, mb, Tornow, PCAE (4H-ALFA), Graitec, Autodesk, SCAD)
- **CEDRUS elements:** `.sin` (Cubus finite elements)
- **Bridges and civil engineering modeler:** `.nkb`

### Import Formats for Prefabrication
- **KST (ERP):** `.kst` (V 1.0, project attribute import)
- **ADS XML (ERP):** any (V 1.0, project attribute import)

## Export Formats

### General Export Formats
- **DXF, DWG – AutoCAD data:** `.dxf`, `.dwg` (Versions 12 to 2018, incl. ACIS support)
- **DWF – AutoCAD data:** `.dwf` (Versions 6 and 7)
- **DGN – MicroStation data:** `.dgn` (Version 8, Version 7)
- **2PDF, PDF/A:** `.pdf` (Including layers from drawing files and layouts)
- **3D-PDF:** `.pdf` (U3D format, ECMA-363 1st edition)
- **IFC:** `.ifc`, `.ifcXML` (Versions 2x3, 4)
- **CINEMA 4D:** `.c4d` (Version 12, can be read in R23)
- **SketchUp:** `.skp` (Versions 6 to 2020)
- **CPIXML, iTWO:** `.cpixml` (Versions 2.3, 2017)
- **Rhino:** `.3dm` (Version 5)
- **VRML:** `.wrl` (Version 2)
- **Collada:** `.dae` (Versions 1.4.1 and 1.5.0)
- **Google Earth:** `.kmz` (Version 2.1)
- **STL:** `.stl`

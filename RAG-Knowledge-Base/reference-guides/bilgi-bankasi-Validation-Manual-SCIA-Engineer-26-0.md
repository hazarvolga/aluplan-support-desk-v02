# Validation Manual SCIA Engineer 26.0

**Kategori:** SCIA Engineer Manual
**Kaynak:** `Validation Manual SCIA Engineer 26.0-zzsiuohqi3o.pdf`

---

**Toplam Sayfa:** 397


## Sayfa 1

\ SCIA ENGINEER
VALIDATION MANUAL
FE RESULTS

Table of contents
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the
publisher. SCIA is not responsible for any direct or indirect damage because of imperfections in the
documentation and/or the software.
© Copyright 2025 SCIA nv. All rights reserved.
MDB 21/10/25 2

Table of contents
Table of contents
Static Analysis_________________________________________________
BAR/BEAM STRUCTURES
 2D Euler’s beam bending - SSLL01/89
 2D Timoshenko’s beam bending - SSLL02/89
 Beam with elastic support - SSLL03/89
 3D frame with elastic supports - SSLL04/89
 Bending of rigidly connected beams - SSLL05/89
 2D circular arch bending - SSLL06/89
 3D circular arch transverse bending - SSLL07/89
 2D semi-circular arch bending - SSLL08/89
 Plane truss with nodal loads - SSLL09/89
 Plane frame with uniform loads - SSLL10/89
 Plane truss with nodal loads - SSLL11/89
 Plane truss under thermal and displacement loadings - SSLL12/89
 Shortening of a tie-beam - SSLL13/89
 Plane frame bending - SSLL14/89
 Beam on elastic (Winkler’s) soil foundation - SSLL15/89
 Beam on elastic (Winkler’s) soil foundation - SSLL16/89
PLATE/SHELL STRUCTURES
 Rectangular membrane under in-plane shear - SSLP01/89
 Tension of perforated membrane - SSLP02/89
 Rectangular plate: cantilever slab - SSLS01/89
 Simply supported square plate - SSLS02/89
 Circular plate under uniform load - SSLS03/89
 Beam of Z-section (using shell elements) - SSLS04/89
 Box section in torsion (using shell elements) - SSLS05/89
 Thin-walled cylinder under uniform radial pressure - SSLS06/89
 Thin-walled cylinder with uniform axial load - SSLS07/89
 Thin-walled cylinder under hydrostatic pressure - SSLS08/89
 Thin-walled cylinder under self-weight - SSLS09/89
 Torus under uniform internal pressure - SSLS10/89
 Thin-walled cone subjected to uniform internal pressure - SSLS11/89
 Spherical shell subjected to a pressure - SSLS14/89
 Spherical shell subjected to a moment - SSLS16/89
 Spherical shell - SSLS17/89
 Cylindrical shell subjected to concentrated force - SSLS20/89
 Spherical shell with an opening - SSLS21/89
 Spherical dome subjected to uniform external pressure - SSLS22/89
 Cylindrical membrane subjected to bending - SSLS23/89
 Simply supported rectangular plate with uniform load - SSLS24/89
 Simply supported rectangular plate with bending moment - SSLS26/89
 Plate under perpendicular shear - SSLS27/89
MDB 21/10/25 3

Table of contents
Dynamic Analysis_________________________________________________
BAR/BEAM STRUCTURES
• Slender beam supported at both ends subjected to axial load - SDLL05/89
• Slender cantilever fixed at both ends with variable rectangular section - SDLL09/89
• Fixed beam at both ends with variable rectangular section – SDLL10/89
• Ring fixed at two points - SDLL12/89
• Ring with flexible support at external point - SDLL13/89
• Eigenmode of a thin-walled tube section - SDLL14/89
• Slender cantilever with mass eccentricity at the end of it - SDLL15/89
• Symmetrical frame bending - SDLX01/89
• Hovgaard's problem - stress in the 3D pipe - bending - SDLX02/89
PLATES/SHELLS STRUCTURES
• Cantilever plate - SDLS01/89
• Lozenge - shaped thin plate with one edge fixed - SDLS02/89
• Simply supported thin rectangular plate - SDLS03/89
• Circular plate with fixed inner edge - SDLS04/89
• Compressor blade: thin shell - SDLS05/89
• Modal analysis of a cylinder fixed at both ends - SDLA01/89
Thermomechanical Analysis_____________________________________
BAR/BEAM STRUCTURES
• Arch with 2 pinned supports - HSLL01/89
PLATES/SHELLS STRUCTURES
• Thin plate deformed according to spherical curve - HSL
MDB 21/10/25 4

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Uni-directional bending of an elastic (Euler) beam. Length: L = 1,0 m, fixed ends. Section: Iz=1.7e-8, E=2.1e11
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data Name Coord X Coord Y Coord Z Member Data
[m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 B1 Sn1 N4 0.500 0.000 0.000 B1
N2 1.000 0.000 0.000 B1 Sn2 N5 0.700 0.000 0.000 B1 F2
N3 0.300 0.000 0.000 B1 F1 F3
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS4 - Full rectangular (21; 21) S 235 1.000 N1 N2 beam (80)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn2 N2 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 1.000 | 0.000 | 0.000 | B1 | Sn2 |
| N3 | 0.300 | 0.000 | 0.000 | B1 | F1 |
|  |  |  |  |  | M1 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N4 | 0.500 | 0.000 | 0.000 | B1 |  |
| N5 | 0.700 | 0.000 | 0.000 | B1 | F2 |
|  |  |  |  |  | F3 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS4 - Full rectangular (21; 21) | S 235 | 1.000 | N1 | N2 | beam (80) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn2 | N2 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
2.6. Cross-sections
Type Full rectangular
Detailed 21; 21
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 4.5166e-04
Ay [m2], Az [m2] 3.7639e-04 3.7639e-04
AL [m2/m], AD [m2/m] 8.5010e-02 8.5010e-02
cY.UCS [mm], cZ.UCS [mm] 11 11
α [deg] 0.00
Iy [m4], Iz [m4] 1.7000e-08 1.7000e-08
iy [mm], iz [mm] 6 6
Wel.y [m3], Wel.z [m3] 1.5998e-06 1.5998e-06
Wpl.y [m3], Wpl.z [m3] 2.3997e-06 2.3997e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 563.94 563.94
Mpl.z.+ [Nm], Mpl.z.- [Nm] 563.94 563.94
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 2.8709e-08 0.0000e+00
βy [mm], βz [mm] 0 0
2/7

| CS4 |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 21; 21 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 4.5166e-04 |  |
| Ay [m2], Az [m2] | 3.7639e-04 | 3.7639e-04 |
| AL [m2/m], AD [m2/m] | 8.5010e-02 | 8.5010e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 11 | 11 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.7000e-08 | 1.7000e-08 |
| iy [mm], iz [mm] | 6 | 6 |
| Wel.y [m3], Wel.z [m3] | 1.5998e-06 | 1.5998e-06 |
| Wpl.y [m3], Wpl.z [m3] | 2.3997e-06 | 2.3997e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 563.94 | 563.94 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 563.94 | 563.94 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 2.8709e-08 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N3 LC1 GCS X Force 30.00
F2 N5 LC1 GCS X Force 10.00
F3 N5 LC1 GCS Z Force -20.00
3.3. Line force
Name Member Type Dir Value - P1 Pos x1 Coor Orig Ecc ey
[kN/m] [m]
Load case System Distribution Value - P2 Pos x2 Loc Ecc ez
[kN/m] [m]
LF1 B1 Force Z -24.00 0.000 Rela From start 0.000
LC1 LCS Uniform 1.000 Length 0.000
3.4. Moment in node
Name Node Load case System Dir Type Value - M
[kNm]
M1 N3 LC1 GCS My Moment 3.00
3/7

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N3 | LC1 | GCS | X | Force | 30.00 |
| F2 | N5 | LC1 | GCS | X | Force | 10.00 |
| F3 | N5 | LC1 | GCS | Z | Force | -20.00 |


| Name | Member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Coor | Orig | Ecc ey
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Loc |  | Ecc ez
[m] |
| LF1 | B1 | Force | Z | -24.00 | 0.000 | Rela | From start | 0.000 |
|  | LC1 | LCS | Uniform |  | 1.000 | Length |  | 0.000 |


| Name | Node | Load case | System | Dir | Type | Value - M
[kNm] |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | N3 | LC1 | GCS | My | Moment | 3.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces; V_z
Z
Y X
4.2. 1D internal forces; M_y
Z
Y X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
4.3. 1D deformations; u_z
Z
Y X
5/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
4.4. Reactions; R_x
Z
Y X
4.5. Reactions
Linear calculation
Load case: LC1
System: Global
Extreme: Global
Selection: All
Nodal reactions
Name Case Rx Ry Rz Mx My Mz ex ey
[kN] [kN] [kN] [kNm] [kNm] [kNm] [mm] [mm]
Sn2/N2 LC1 -16.00 0.00 31.46 0.00 5.93 0.00 -188.49 0.00
Sn1/N1 LC1 -24.00 0.00 12.54 0.00 -3.47 0.00 276.71 0.00
6/7

| Name | Case | Rx
[kN] | Ry
[kN] | Rz
[kN] | Mx
[kNm] | My
[kNm] | Mz
[kNm] | ex
[mm] | ey
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn2/N2 | LC1 | -16.00 | 0.00 | 31.46 | 0.00 | 5.93 | 0.00 | -188.49 | 0.00 |
| Sn1/N1 | LC1 | -24.00 | 0.00 | 12.54 | 0.00 | -3.47 | 0.00 | 276.71 | 0.00 |



## Sayfa 11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Shear Force in node N4 = 0,54 kN
Bending Moment in node N4 = 2,80 kNm
Vertical displacement in node N4 = -49,02 mm
Horizontal reaction in node N1 = -24,00 kN
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL02/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Influence of shearing stresses (Timoshenko’s beam). Length: L = 1,44 m, simply supported ends.
Elastic, linear, isotropic material. Section: Iz=2810e-8, Ax=31e-4, Ay=(31E-4/2.42), E=2.1e11
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data
[m] [m] [m]
N1 0.000 0.000 0.000 B1 Sn1
N2 1.440 0.000 0.000 B1 Sn2
N3 0.720 0.000 0.000 B1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS2 - Numerical STEEL 1.440 N1 N2 beam (80)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Rigid Free Rigid
Sn2 N2 GCS Standard Rigid Rigid Rigid Rigid Free Rigid
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
STEEL 7850.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 1.440 | 0.000 | 0.000 | B1 | Sn2 |
| N3 | 0.720 | 0.000 | 0.000 | B1 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS2 - Numerical | STEEL | 1.440 | N1 | N2 | beam (80) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Free | Rigid |
| Sn2 | N2 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Free | Rigid |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| STEEL | 7850.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL02/89
Current date 21.10.2025
2.6. Cross-sections
Detailed Numerical
A [m2] 3.1000e-03
Ay [m2], Az [m2] 1.2810e-03 1.2810e-03
AL [m2/m], AD [m2/m] 0.0000e+00 0.0000e+00
cY.UCS [mm], cZ.UCS [mm] 0 0
α [deg] 0.00
Iy [m4], Iz [m4] 2.8100e-05 2.8100e-05
iy [mm], iz [mm] 95 95
Wel.y [m3], Wel.z [m3] 1.7000e-08 1.7000e-08
Wpl.y [m3], Wpl.z [m3] 1.7000e-08 1.7000e-08
Mpl.y.+ [Nm], Mpl.y.- [Nm] 0.00 0.00
Mpl.z.+ [Nm], Mpl.z.- [Nm] 0.00 0.00
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.0000e+01 0.0000e+00
βy [mm], βz [mm] 0 0
2/5

| CS2 |  |  |
| --- | --- | --- |
| Detailed | Numerical |  |
|  |  |  |
|  |  |  |
| A [m2] | 3.1000e-03 |  |
| Ay [m2], Az [m2] | 1.2810e-03 | 1.2810e-03 |
| AL [m2/m], AD [m2/m] | 0.0000e+00 | 0.0000e+00 |
| cY.UCS [mm], cZ.UCS [mm] | 0 | 0 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.8100e-05 | 2.8100e-05 |
| iy [mm], iz [mm] | 95 | 95 |
| Wel.y [m3], Wel.z [m3] | 1.7000e-08 | 1.7000e-08 |
| Wpl.y [m3], Wpl.z [m3] | 1.7000e-08 | 1.7000e-08 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 0.00 | 0.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 0.00 | 0.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.0000e+01 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
|  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL02/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y X
3.2. Line force
Name Member Type Dir Value - P1 Pos x1 Coor Orig Ecc ey
[kN/m] [m]
Load case System Distribution Value - P2 Pos x2 Loc Ecc ez
[kN/m] [m]
LF1 B1 Force Z -100.00 0.000 Rela From start 0.000
LC1 LCS Uniform 1.000 Length 0.000
3/5

| Name | Member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Coor | Orig | Ecc ey
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Loc |  | Ecc ez
[m] |
| LF1 | B1 | Force | Z | -100.00 | 0.000 | Rela | From start | 0.000 |
|  | LC1 | LCS | Uniform |  | 1.000 | Length |  | 0.000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL02/89
Current date 21.10.2025
4. RESULTS
4.1. 1D deformations; u_z
Z
Y X
4/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL02/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Vertical displacement in node N3 = -1,2593 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL03/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simple Euler beam under bending with elastic support in the center of length;
Material: elastic, linear, isotropic.
Length: L = 12 m, simply supported at ends and in the middle
Section: Iz=6.3 e-4, E=2.1e11
Stiffness Kz=2.1 e6 N/m
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data
[m] [m] [m]
N1 0.000 0.000 0.000 B1 Sn1
N2 12.000 0.000 0.000 B1 Sn2
N3 6.000 0.000 0.000 B1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Rectangle (295; 295) S 235 12.000 N1 N2 beam (80)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Free Free Free
Sn2 N2 GCS Standard Rigid Rigid Rigid Free Free Free
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 12.000 | 0.000 | 0.000 | B1 | Sn2 |
| N3 | 6.000 | 0.000 | 0.000 | B1 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Rectangle (295; 295) | S 235 | 12.000 | N1 | N2 | beam (80) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Free | Free | Free |
| Sn2 | N2 | GCS | Standard | Rigid | Rigid | Rigid | Free | Free | Free |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL03/89
Current date 21.10.2025
2.6. Cross-sections
Type Rectangle
Detailed 295; 295
Item material S 235
A [m2] 8.6948e-02
Ay [m2], Az [m2] 7.2488e-02 7.2488e-02
AL [m2/m], AD [m2/m] 1.1795e+00 1.1795e+00
cY.UCS [mm], cZ.UCS [mm] 147 147
α [deg] 0.00
Iy [m4], Iz [m4] 6.3000e-04 6.3000e-04
iy [mm], iz [mm] 85 85
Wel.y [m3], Wel.z [m3] 4.2731e-03 4.2731e-03
Wpl.y [m3], Wpl.z [m3] 6.4096e-03 6.4096e-03
Mpl.y.+ [Nm], Mpl.y.- [Nm] 1506258.95 1506258.95
Mpl.z.+ [Nm], Mpl.z.- [Nm] 1506258.95 1506258.95
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.0632e-03 8.8484e-08
βy [mm], βz [mm] 0 0
2/6

| CS1 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 295; 295 |  |
| Item material | S 235 |  |
| A [m2] | 8.6948e-02 |  |
| Ay [m2], Az [m2] | 7.2488e-02 | 7.2488e-02 |
| AL [m2/m], AD [m2/m] | 1.1795e+00 | 1.1795e+00 |
| cY.UCS [mm], cZ.UCS [mm] | 147 | 147 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 6.3000e-04 | 6.3000e-04 |
| iy [mm], iz [mm] | 85 | 85 |
| Wel.y [m3], Wel.z [m3] | 4.2731e-03 | 4.2731e-03 |
| Wpl.y [m3], Wpl.z [m3] | 6.4096e-03 | 6.4096e-03 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 1506258.95 | 1506258.95 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 1506258.95 | 1506258.95 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.0632e-03 | 8.8484e-08 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL03/89
Current date 21.10.2025
3. LOAD
3.1. LC2
Y X
3.2. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[kN]
Load case Dir Type Orig Regularly
Fb1 B1 GCS -42.00 0.250 Rela 1
LC2 - charge Z Force From start
Fb2 B1 GCS -42.00 0.750 Rela 1
LC2 - charge Z Force From start
3/6

| Name | Member | System | Value - F
[kN] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb1 | B1 | GCS | -42.00 | 0.250 | Rela | 1 |
|  | LC2 - charge | Z | Force |  | From start |  |
| Fb2 | B1 | GCS | -42.00 | 0.750 | Rela | 1 |
|  | LC2 - charge | Z | Force |  | From start |  |


SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL03/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces; M_y
Z
Y X
4.2. 1D deformations; u_z
Z
Y X
4/6


## Sayfa 21

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL03/89
Current date 21.10.2025
4.3. Reactions; R_z
Z
Y X
5/6

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL03/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Bending Moment in node N3 = 63,00 kNm
Displacement Uz in node N3 = -10,00 mm
Vezrtical reaction in node N3 = 21,00 kN
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Spatial bar with elastic supports, under bending and torsion; material: elastic,
linear, isotropic (non-compressible bars assumed)
2. MODEL
2.1. Analysis model
Z
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data Name Coord X Coord Y Coord Z Member Data
[m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 B1 N4 0.000 2.000 2.000 B3
B2 N5 0.000 0.000 1.000 B2
N2 2.000 0.000 0.000 B1 B4
N3 0.000 0.000 2.000 B3 F1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Full rectangular (59; 59) S 235 2.000 N1 N2 general (0)
B2 CS1 - Full rectangular (59; 59) S 235 1.000 N1 N5 general (0)
B3 CS1 - Full rectangular (59; 59) S 235 2.000 N3 N4 general (0)
B4 CS1 - Full rectangular (59; 59) S 235 1.000 N5 N3 general (0)
2.4. Hinges
Name Member Position ux uy uz fix fiy fiz
H1 B4 Begin Rigid Rigid Rigid Rigid Free Free
H2 B2 End Rigid Rigid Rigid Rigid Free Free
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 |  |
|  |  |  |  | B2 |  |
| N2 | 2.000 | 0.000 | 0.000 | B1 |  |
| N3 | 0.000 | 0.000 | 2.000 | B3 | F1 |
|  |  |  |  | B4 |  |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N4 | 0.000 | 2.000 | 2.000 | B3 |  |
| N5 | 0.000 | 0.000 | 1.000 | B2 |  |
|  |  |  |  | B4 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Full rectangular (59; 59) | S 235 | 2.000 | N1 | N2 | general (0) |
| B2 | CS1 - Full rectangular (59; 59) | S 235 | 1.000 | N1 | N5 | general (0) |
| B3 | CS1 - Full rectangular (59; 59) | S 235 | 2.000 | N3 | N4 | general (0) |
| B4 | CS1 - Full rectangular (59; 59) | S 235 | 1.000 | N5 | N3 | general (0) |


| Name | Member | Position | ux | uy | uz | fix | fiy | fiz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1 | B4 | Begin | Rigid | Rigid | Rigid | Rigid | Free | Free |
| H2 | B2 | End | Rigid | Rigid | Rigid | Rigid | Free | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
2.5. Point supports on member
Name Type Coor Pos x dx X Y Z Rx Ry Rz
System Orig Rep (n)
Sb1 Standard Rela 0.000 0.100 Flexible Rigid Rigid Rigid Flexible Flexible
LCS From end 1
Sb2 Standard Rela 0.000 0.100 Flexible Rigid Rigid Rigid Flexible Flexible
GCS From end 1
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
7.8750e+04 0.01e-003 40 80 215.0 360.0
2.7. Cross-sections
Type Full rectangular
Detailed 59; 59
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 1.0000e-03
Ay [m2], Az [m2] 2.8868e-03 2.8868e-03
AL [m2/m], AD [m2/m] 2.3543e-01 2.3543e-01
cY.UCS [mm], cZ.UCS [mm] 29 29
α [deg] 0.00
Iy [m4], Iz [m4] 1.0000e-06 1.0000e-06
iy [mm], iz [mm] 32 32
Wel.y [m3], Wel.z [m3] 3.3981e-05 3.3981e-05
Wpl.y [m3], Wpl.z [m3] 1.4714e-05 1.4714e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 3457.83 3457.83
Mpl.z.+ [Nm], Mpl.z.- [Nm] 3457.83 3457.83
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 2.0000e-06 0.0000e+00
βy [mm], βz [mm] 0 0
2/7

| Name | Type | Coor | Pos x | dx | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | System | Orig | Rep (n) |  |  |  |  |  |  |
| Sb1 | Standard | Rela | 0.000 | 0.100 | Flexible | Rigid | Rigid | Rigid | Flexible | Flexible |
|  |  | LCS | From end | 1 |  |  |  |  |  |  |
| Sb2 | Standard | Rela | 0.000 | 0.100 | Flexible | Rigid | Rigid | Rigid | Flexible | Flexible |
|  |  | GCS | From end | 1 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.8750e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


| CS1 |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 59; 59 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 1.0000e-03 |  |
| Ay [m2], Az [m2] | 2.8868e-03 | 2.8868e-03 |
| AL [m2/m], AD [m2/m] | 2.3543e-01 | 2.3543e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 29 | 29 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.0000e-06 | 1.0000e-06 |
| iy [mm], iz [mm] | 32 | 32 |
| Wel.y [m3], Wel.z [m3] | 3.3981e-05 | 3.3981e-05 |
| Wpl.y [m3], Wpl.z [m3] | 1.4714e-05 | 1.4714e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 3457.83 | 3457.83 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 3457.83 | 3457.83 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 2.0000e-06 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Valeur totale
X Y
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N3 LC2 - Permanent GCS Z Force -10.000
3/7

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N3 | LC2 - Permanent | GCS | Z | Force | -10.000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N3, N4
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N4 LC2 0.00 -29.76 0.00 160.7 0.0 -59.5 29.76
N3 LC2 -138.88 -29.78 -370.07 193.5 19.8 -74.4 396.39
4.2. 1D internal forces
Linear calculation
Load case: LC2
Coordinate system: Principal
Extreme 1D: Global
Selection: B1, B3
Filter: Cross-section = CS1 - Full rectangular (59; 59)
Selected sections: Inputted
Name dx Case Cross-section N Vy Vz Mx My Mz
[m] [kN] [kN] [kN] [kNm] [kNm] [kNm]
B1 2.000 LC2 CS1 - Full -1.562 1.563 -5.000 -1.563 -8.437 3.125
rectangular (59;
59)
B3 2.000 LC2 CS1 - Full 1.563 1.562 -5.000 1.562 -8.438 3.125
rectangular (59;
59)
4/7

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N4 | LC2 | 0.00 | -29.76 | 0.00 | 160.7 | 0.0 | -59.5 | 29.76 |
| N3 | LC2 | -138.88 | -29.78 | -370.07 | 193.5 | 19.8 | -74.4 | 396.39 |


| Name | dx
[m] | Case | Cross-section | N
[kN] | Vy
[kN] | Vz
[kN] | Mx
[kNm] | My
[kNm] | Mz
[kNm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 2.000 | LC2 | CS1 - Full
rectangular (59;
59) | -1.562 | 1.563 | -5.000 | -1.563 | -8.437 | 3.125 |
| B3 | 2.000 | LC2 | CS1 - Full
rectangular (59;
59) | 1.563 | 1.562 | -5.000 | 1.562 | -8.438 | 3.125 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
4.3. 1D internal forces; M_x
Z
Y X
4.4. 1D internal forces; M_y
Z
Y X
5/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
4.5. 1D internal forces; M_z
Z
Y X
6/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL04/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Moment Mx in node N2 = -1,5625 KN
Moment My in node N2 = -8,4375 KN
Moment Mz in node N2 = 3,125 KN
Moment Mx in node N4 = 1,5625 KN
Moment My in node N4 = -8,4375 KN
Moment Mz in node N4 = 3,125 KN
Displacement uy in node N4 =-29,762mm
Rotation Rx in node N4 = 160,71mrad
Displacement uz in node N3 =-370,04mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Beams with rigid link – bending of non-compressible bars
GEOMETRY: Length: L = 2 m, distance 0.2 m, Left ends - fixed, right – rigidly linked
Section: Iz=4/3e-8, Ax=1.0, E=2e11
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data
[m] [m] [m]
N1 0.000 0.000 0.000 B1 Sn1
N2 2.000 0.000 0.000 B1 BR1
N3 0.000 0.000 -0.200 B2 Sn2
N4 2.000 0.000 -0.200 B2 BR1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Rectangle (20; 20) S 235 2.000 N1 N2 general (0)
B2 CS1 - Rectangle (20; 20) S 235 2.000 N3 N4 general (0)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn2 N3 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn3 N2 GCS Standard Rigid Free Free Free Free Free
Sn4 N4 GCS Standard Rigid Free Free Free Free Free
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 2.000 | 0.000 | 0.000 | B1 | BR1 |
|  |  |  |  |  | Sn3 |
| N3 | 0.000 | 0.000 | -0.200 | B2 | Sn2 |
| N4 | 2.000 | 0.000 | -0.200 | B2 | BR1 |
|  |  |  |  |  | F1 |
|  |  |  |  |  | Sn4 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Rectangle (20; 20) | S 235 | 2.000 | N1 | N2 | general (0) |
| B2 | CS1 - Rectangle (20; 20) | S 235 | 2.000 | N3 | N4 | general (0) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn2 | N3 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn3 | N2 | GCS | Standard | Rigid | Free | Free | Free | Free | Free |
| Sn4 | N4 | GCS | Standard | Rigid | Free | Free | Free | Free | Free |



## Sayfa 31

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
2.5. Rigid links
Name Master Slave Hinge on master Hinge on slave
BR1 N2 N4 û û
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
2/7

| Name | Master | Slave | Hinge on master | Hinge on slave |
| --- | --- | --- | --- | --- |
| BR1 | N2 | N4 | û | û |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
2.7. Cross-sections
Type Rectangle
Detailed 20; 20
Item material S 235
A [m2] 4.0000e-04
Ay [m2], Az [m2] 3.3333e-04 3.3333e-04
AL [m2/m], AD [m2/m] 8.0000e-02 8.0000e-02
cY.UCS [mm], cZ.UCS [mm] 10 10
α [deg] 0.00
Iy [m4], Iz [m4] 1.3333e-08 1.3333e-08
iy [mm], iz [mm] 6 6
Wel.y [m3], Wel.z [m3] 1.3333e-06 1.3333e-06
Wpl.y [m3], Wpl.z [m3] 2.0000e-06 2.0000e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 470.00 470.00
Mpl.z.+ [Nm], Mpl.z.- [Nm] 470.00 470.00
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 2.2517e-08 0.0000e+00
βy [mm], βz [mm] 0 0
3/7

| CS1 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 20; 20 |  |
| Item material | S 235 |  |
| A [m2] | 4.0000e-04 |  |
| Ay [m2], Az [m2] | 3.3333e-04 | 3.3333e-04 |
| AL [m2/m], AD [m2/m] | 8.0000e-02 | 8.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 10 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.3333e-08 | 1.3333e-08 |
| iy [mm], iz [mm] | 6 | 6 |
| Wel.y [m3], Wel.z [m3] | 1.3333e-06 | 1.3333e-06 |
| Wpl.y [m3], Wpl.z [m3] | 2.0000e-06 | 2.0000e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 470.00 | 470.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 470.00 | 470.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 2.2517e-08 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
3. LOAD
3.1. LC2
Y X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N4 LC2 - Charge GCS Z Force -1.00
4/7

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N4 | LC2 - Charge | GCS | Z | Force | -1.00 |


SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces; V_z
Z
Y X
4.2. 1D internal forces; M_y
Z
Y X
5/7

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
4.3. 1D deformations; u_z
Z
Y X
6/7

SCIA Engineer 26.0.0016
TESTCASE: AFNOR SSLL05/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Bending Moment in node N1 & N3 = 0.5 kNm
Displacement Uz in node N2 & N4 = -125 mm
Vezrtical reaction Vz in node N1 & N3 = 0.5 kN
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL06/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Bending of a quarter circle, fixed at the end, made from hollow round section; elastic linear material, non-compressible bars assumed
GEOMETRY: Radius of the circle = 3 m, upper end fixed.
Section: R=10mm, thickness=2mm (Ax=1.0), E=2e11
2. MODEL
2.1. Analysis model
Z X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data
[m] [m] [m]
N1 3.000 0.000 0.000 B1 M1
N2 0.000 3.000 0.000 B1 Sn1
N4 2.121 2.121 0.000 B1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS2 - CHS (20; 2) S 235 4.712 N1 N2 general (0)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N2 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 3.000 | 0.000 | 0.000 | B1 | M1 |
| N2 | 0.000 | 3.000 | 0.000 | B1 | Sn1 |
| N4 | 2.121 | 2.121 | 0.000 | B1 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS2 - CHS (20; 2) | S 235 | 4.712 | N1 | N2 | general (0) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N2 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL06/89
Current date 21.10.2025
2.6. Cross-sections
Type CHS
Detailed 20; 2
Formcode 3 - Circular hollow section
Item material S 235
A [m2] 1.1310e-04
Ay [m2], Az [m2] 7.2000e-05 7.2000e-05
AL [m2/m], AD [m2/m] 6.2829e-02 1.1309e-01
cY.UCS [mm], cZ.UCS [mm] 10 10
α [deg] 0.00
Iy [m4], Iz [m4] 4.6370e-09 4.6370e-09
iy [mm], iz [mm] 6 6
Wel.y [m3], Wel.z [m3] 4.6370e-07 4.6370e-07
Wpl.y [m3], Wpl.z [m3] 6.5067e-07 6.5067e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 152.86 152.86
Mpl.z.+ [Nm], Mpl.z.- [Nm] 152.86 152.86
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 9.1609e-09 1.0996e-45
βy [mm], βz [mm] 0 0
2/5

| CS2 |  |  |
| --- | --- | --- |
| Type | CHS |  |
| Detailed | 20; 2 |  |
| Formcode | 3 - Circular hollow section |  |
| Item material | S 235 |  |
| A [m2] | 1.1310e-04 |  |
| Ay [m2], Az [m2] | 7.2000e-05 | 7.2000e-05 |
| AL [m2/m], AD [m2/m] | 6.2829e-02 | 1.1309e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 10 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 4.6370e-09 | 4.6370e-09 |
| iy [mm], iz [mm] | 6 | 6 |
| Wel.y [m3], Wel.z [m3] | 4.6370e-07 | 4.6370e-07 |
| Wpl.y [m3], Wpl.z [m3] | 6.5067e-07 | 6.5067e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 152.86 | 152.86 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 152.86 | 152.86 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 9.1609e-09 | 1.0996e-45 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL06/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Valeur totale
Z X
3.2. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[kN]
Load case Dir Type Orig Regularly
Fb1 B1 GCS 0.01 0.000 Rela 1
LC2 - permanent X Force From start
Fb2 B1 GCS 0.01 0.000 Rela 1
LC2 - permanent Y Force From start
3.3. Moment in node
Name Node Load case System Dir Type Value - M
[kNm]
M1 N1 LC2 - permanent GCS Mz Moment 0.01
3/5

| Name | Member | System | Value - F
[kN] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb1 | B1 | GCS | 0.01 | 0.000 | Rela | 1 |
|  | LC2 - permanent | X | Force |  | From start |  |
| Fb2 | B1 | GCS | 0.01 | 0.000 | Rela | 1 |
|  | LC2 - permanent | Y | Force |  | From start |  |


| Name | Node | Load case | System | Dir | Type | Value - M
[kNm] |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | N1 | LC2 - permanent | GCS | Mz | Moment | 0.01 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL06/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N1
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N1 LC2 379.1 241.7 0.0 0.0 0.0 165.4 449.6
4/5

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N1 | LC2 | 379.1 | 241.7 | 0.0 | 0.0 | 0.0 | 165.4 | 449.6 |



## Sayfa 41

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL06/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement ux in node N1 = 379,1mm
Displacement uy in node N1 = 241,7mm
Rotation RZ in node N1 = 165,4 mrad
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL07/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Bending of a quarter circle, fixed at the end, made from hollow round section; elastic linear material, non-compressible bars assumed
GEOMETRY: Radius of the circle = 3 m, upper end fixed.
Section: R=10mm, thickness=2mm (Ax=1.0), E=2e11
2. MODEL
2.1. Analysis model
X Y
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data
[m] [m] [m]
N1 0.000 1.000 0.000 B1 Sn1
N2 0.000 0.707 0.707 B1
N3 0.000 0.000 1.000 B1 F1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - RO20X2 S 235 1.571 N1 N3 general (0)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 1.000 | 0.000 | B1 | Sn1 |
| N2 | 0.000 | 0.707 | 0.707 | B1 |  |
| N3 | 0.000 | 0.000 | 1.000 | B1 | F1 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - RO20X2 | S 235 | 1.571 | N1 | N3 | general (0) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL07/89
Current date 21.10.2025
2.6. Cross-sections
Type RO20X2
Formcode 3 - Circular hollow section
Item material S 235
A [m2] 1.1300e-04
Ay [m2], Az [m2] 7.2000e-05 7.2000e-05
AL [m2/m], AD [m2/m] 6.2800e-02 1.1309e-01
cY.UCS [mm], cZ.UCS [mm] 10 10
α [deg] 0.00
Iy [m4], Iz [m4] 4.6400e-09 4.6400e-09
iy [mm], iz [mm] 6 6
Wel.y [m3], Wel.z [m3] 4.6400e-07 4.6400e-07
Wpl.y [m3], Wpl.z [m3] 6.4800e-07 6.4800e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 152.86 152.86
Mpl.z.+ [Nm], Mpl.z.- [Nm] 152.86 152.86
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 9.2800e-09 1.0996e-45
βy [mm], βz [mm] 0 0
2/5

| CS1 |  |  |
| --- | --- | --- |
| Type | RO20X2 |  |
| Formcode | 3 - Circular hollow section |  |
| Item material | S 235 |  |
| A [m2] | 1.1300e-04 |  |
| Ay [m2], Az [m2] | 7.2000e-05 | 7.2000e-05 |
| AL [m2/m], AD [m2/m] | 6.2800e-02 | 1.1309e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 10 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 4.6400e-09 | 4.6400e-09 |
| iy [mm], iz [mm] | 6 | 6 |
| Wel.y [m3], Wel.z [m3] | 4.6400e-07 | 4.6400e-07 |
| Wpl.y [m3], Wpl.z [m3] | 6.4800e-07 | 6.4800e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 152.86 | 152.86 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 152.86 | 152.86 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 9.2800e-09 | 1.0996e-45 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL07/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Valeur totale
Z
XY
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[N]
F1 N3 LC2 - Charge GCS X Force 100.00
3/5

| Name | Node | Load case | System | Dir | Type | Value - F
[N] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N3 | LC2 - Charge | GCS | X | Force | 100.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL07/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N3
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N3 LC2 134.56 0.00 0.00 0.0 54.6 123.9 134.56
4.2. 1D internal forces
Linear calculation
Load case: LC2
Coordinate system: Principal
Extreme 1D: Global
Selection: All
Filter: Cross-section = CS1 - RO20X2
Selected sections: Inputted
Name dx Case Cross-section N Vy Vz Mx My Mz
[m] [N] [N] [N] [Nm] [Nm] [Nm]
B1 0.262- LC2 CS1 - RO20X2 0.00 -100.00 0.00 -74.11 0.00 96.60
4/5

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N3 | LC2 | 134.56 | 0.00 | 0.00 | 0.0 | 54.6 | 123.9 | 134.56 |


| Name | dx
[m] | Case | Cross-section | N
[N] | Vy
[N] | Vz
[N] | Mx
[Nm] | My
[Nm] | Mz
[Nm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 0.262- | LC2 | CS1 - RO20X2 | 0.00 | -100.00 | 0.00 | -74.11 | 0.00 | 96.60 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL07/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement ux in node N3 = 134,62mm
Moment Mx for (O=15°) = 74,11 N.m
Moment Mz for (O=15°) = 96,59 N.m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL08/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
A half circle simply supported at the ends, bending of a thin-walled (hollow)
round section; material elastic linear isotropic.
GEOMETRY: Radius of the circle = 3 m, upper end fixed.
Section: R=10mm, thickness=2mm (Ax=1.0), E=2e11
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data
[m] [m]
N1 -1.000 0.000 B1 Sn1
N2 0.000 1.000 B1
N3 1.000 0.000 B1 Sn2
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - CHS (20; 2) S 235 3.142 N1 N3 general (0)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Free
Sn2 N3 GCS Standard Free Rigid Free
1/5

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | -1.000 | 0.000 | B1 | Sn1 |
| N2 | 0.000 | 1.000 | B1 |  |
| N3 | 1.000 | 0.000 | B1 | Sn2 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - CHS (20; 2) | S 235 | 3.142 | N1 | N3 | general (0) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N3 | GCS | Standard | Free | Rigid | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL08/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
2.6. Cross-sections
Type CHS
Detailed 20; 2
Formcode 3 - Circular hollow section
Item material S 235
A [m2] 1.1310e-04
Ay [m2], Az [m2] 7.2000e-05 7.2000e-05
AL [m2/m], AD [m2/m] 6.2829e-02 1.1309e-01
cY.UCS [mm], cZ.UCS [mm] 10 10
α [deg] 0.00
Iy [m4], Iz [m4] 4.6370e-09 4.6370e-09
iy [mm], iz [mm] 6 6
Wel.y [m3], Wel.z [m3] 4.6370e-07 4.6370e-07
Wpl.y [m3], Wpl.z [m3] 6.5067e-07 6.5067e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 152.86 152.86
Mpl.z.+ [Nm], Mpl.z.- [Nm] 152.86 152.86
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 9.1609e-09 1.0996e-45
βy [mm], βz [mm] 0 0
2/5

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


| CS1 |  |  |
| --- | --- | --- |
| Type | CHS |  |
| Detailed | 20; 2 |  |
| Formcode | 3 - Circular hollow section |  |
| Item material | S 235 |  |
| A [m2] | 1.1310e-04 |  |
| Ay [m2], Az [m2] | 7.2000e-05 | 7.2000e-05 |
| AL [m2/m], AD [m2/m] | 6.2829e-02 | 1.1309e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 10 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 4.6370e-09 | 4.6370e-09 |
| iy [mm], iz [mm] | 6 | 6 |
| Wel.y [m3], Wel.z [m3] | 4.6370e-07 | 4.6370e-07 |
| Wpl.y [m3], Wpl.z [m3] | 6.5067e-07 | 6.5067e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 152.86 | 152.86 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 152.86 | 152.86 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 9.1609e-09 | 1.0996e-45 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL08/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Valeur totale
Y X
3.2. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[N]
Load case Dir Type Orig Regularly
Fb1 B1 GCS -100.0000 0.500 Rela 1
LC2 - Permanent Z Force From start
3/5

| Name | Member | System | Value - F
[N] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb1 | B1 | GCS | -100.0000 | 0.500 | Rela | 1 |
|  | LC2 - Permanent | Z | Force |  | From start |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL08/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Name Case Ux Uz Φy Utotal
[mm] [mm] [mrad] [mm]
N1 LC2 0.000 0.000 30.774 0.000
N2 LC2 26.960 -19.213 0.000 33.106
N3 LC2 53.921 0.000 -30.774 53.921
4/5

| Name | Case | Ux
[mm] | Uz
[mm] | Φy
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- |
| N1 | LC2 | 0.000 | 0.000 | 30.774 | 0.000 |
| N2 | LC2 | 26.960 | -19.213 | 0.000 | 33.106 |
| N3 | LC2 | 53.921 | 0.000 | -30.774 | 53.921 |



## Sayfa 51

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL08/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement ux in node N3 = 53,912mm
Displacement uz in node N2 = -19,206mm
Rotation ϕy in node N1= -30,774mrad
Rotation ϕy in node N3= 30,774mrad
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL 09/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Truss made of two bars; material: elastic, linear, isotropic.
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data
[m] [m]
N1 0.000 0.000 B1 Sn1
N2 3.897 -2.250 B1 F1
N3 7.794 0.000 B2 Sn2
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS3 - Circle (20) S 235 4.500 N1 N2 general (0)
B2 CS3 - Circle (20) S 235 4.500 N3 N2 general (0)
2.4. Hinges
Name Member Position ux uy uz fix fiy fiz
H1 B1 End Rigid Rigid Free
H2 B2 End Rigid Rigid Free
2.5. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Free
Sn2 N3 GCS Standard Rigid Rigid Free
1/5

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 3.897 | -2.250 | B1 | F1 |
|  |  |  | B2 |  |
| N3 | 7.794 | 0.000 | B2 | Sn2 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS3 - Circle (20) | S 235 | 4.500 | N1 | N2 | general (0) |
| B2 | CS3 - Circle (20) | S 235 | 4.500 | N3 | N2 | general (0) |


| Name | Member | Position | ux | uy | uz | fix | fiy | fiz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1 | B1 | End | Rigid |  | Rigid |  | Free |  |
| H2 | B2 | End | Rigid |  | Rigid |  | Free |  |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N3 | GCS | Standard | Rigid | Rigid | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL 09/89
Current date 21.10.2025
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2.7. Cross-sections
Type Circle
Detailed 20
Item material S 235
A [m2] 3.0000e-04
Ay [m2], Az [m2] 2.7000e-04 2.7000e-04
AL [m2/m], AD [m2/m] 6.1396e-02 6.1396e-02
cY.UCS [mm], cZ.UCS [mm] 10 10
α [deg] 0.00
Iy [m4], Iz [m4] 7.1620e-09 7.1620e-09
iy [mm], iz [mm] 5 5
Wel.y [m3], Wel.z [m3] 7.3290e-07 7.3290e-07
Wpl.y [m3], Wpl.z [m3] 1.2442e-06 1.2442e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 292.30 292.30
Mpl.z.+ [Nm], Mpl.z.- [Nm] 292.30 292.30
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.4324e-08 0.0000e+00
βy [mm], βz [mm] 0 0
2/5

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


| CS3 |  |  |
| --- | --- | --- |
| Type | Circle |  |
| Detailed | 20 |  |
| Item material | S 235 |  |
| A [m2] | 3.0000e-04 |  |
| Ay [m2], Az [m2] | 2.7000e-04 | 2.7000e-04 |
| AL [m2/m], AD [m2/m] | 6.1396e-02 | 6.1396e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 10 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 7.1620e-09 | 7.1620e-09 |
| iy [mm], iz [mm] | 5 | 5 |
| Wel.y [m3], Wel.z [m3] | 7.3290e-07 | 7.3290e-07 |
| Wpl.y [m3], Wpl.z [m3] | 1.2442e-06 | 1.2442e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 292.30 | 292.30 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 292.30 | 292.30 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.4324e-08 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL 09/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Valeur totale
Y X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N2 LC2 - Permanent GCS Z Force -21.00
3/5

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N2 | LC2 - Permanent | GCS | Z | Force | -21.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL 09/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Name Case Uz
[mm]
N2 LC2 -3.0
N1 LC2 0.0
4.2. 1D stresses
Linear calculation
Load case: LC2
Coordinate system: Principal
Extreme 1D: Member
Selection: B1, B2
Name dx Fibre Case σx
[m] [MPa]
B1 0.000 1 LC2 70.0
B2 0.000 1 LC2 70.0
4.3. 1D stresses; σ_x
Z
Y X
4/5

| Name | Case | Uz
[mm] |
| --- | --- | --- |
| N2 | LC2 | -3.0 |
| N1 | LC2 | 0.0 |


| Name | dx
[m] | Fibre | Case | σx
[MPa] |
| --- | --- | --- | --- | --- |
| B1 | 0.000 | 1 | LC2 | 70.0 |
| B2 | 0.000 | 1 | LC2 | 70.0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL 09/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement uz in node N2 = -3mm
Stress σx in the element B1 = 70 Mpa
Stress σx in the element B2 = 70 Mpa
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Frame made of four bars with different moments of inertia; material: elastic, linear, isotropic
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data Name Coord X Coord Y Coord Z Member Data
[m] [m] [m] [m] [m] [m]
D 0.000 0.000 0.000 B1 Sn2 C 1.000 0.000 1.000 B3 Sn4
A 1.000 0.000 0.000 B1 E 1.000 0.000 -2.000 B5 Sn1
B 5.000 0.000 0.000 B2 Sn3
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 Section AC et AD - Rectangle (10; 10) S 235 1.000 D A general (0)
B2 Section AB - Rectangle (40; 40) S 235 4.000 A B general (0)
B3 Section AC et AD - Rectangle (10; 10) S 235 1.000 A C general (0)
B5 Section AE - Rectangle (20; 20) S 235 2.000 A E general (0)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 E GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn2 D GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn3 B GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn4 C GCS Standard Rigid Rigid Rigid Free Free Free
1/8

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| D | 0.000 | 0.000 | 0.000 | B1 | Sn2 |
| A | 1.000 | 0.000 | 0.000 | B1 |  |
|  |  |  |  | B2 |  |
|  |  |  |  | B3 |  |
|  |  |  |  | B5 |  |
| B | 5.000 | 0.000 | 0.000 | B2 | Sn3 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| C | 1.000 | 0.000 | 1.000 | B3 | Sn4 |
| E | 1.000 | 0.000 | -2.000 | B5 | Sn1 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Section AC et AD - Rectangle (10; 10) | S 235 | 1.000 | D | A | general (0) |
| B2 | Section AB - Rectangle (40; 40) | S 235 | 4.000 | A | B | general (0) |
| B3 | Section AC et AD - Rectangle (10; 10) | S 235 | 1.000 | A | C | general (0) |
| B5 | Section AE - Rectangle (20; 20) | S 235 | 2.000 | A | E | general (0) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | E | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn2 | D | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn3 | B | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn4 | C | GCS | Standard | Rigid | Rigid | Rigid | Free | Free | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
2.5. Materials
Empty table
2/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
2.6. Cross-sections
Section AB Section AE
Type Rectangle Type Rectangle
Detailed 40; 40 Detailed 20; 20
Item material S 235 Item material S 235
A [m2] 1.6000e-03 A [m2] 4.0000e-04
Ay [m2], Az [m2] 1.3333e-03 1.3333e-03 Ay [m2], Az [m2] 3.3333e-04 3.3333e-04
AL [m2/m], AD [m2/m] 1.6000e-01 1.6000e-01 AL [m2/m], AD [m2/m] 8.0000e-02 8.0000e-02
cY.UCS [mm], cZ.UCS [mm] 20 20 cY.UCS [mm], cZ.UCS [mm] 10 10
α [deg] 0.00 α [deg] 0.00
Iy [m4], Iz [m4] 2.1333e-07 2.1333e-07 Iy [m4], Iz [m4] 1.3333e-08 1.3333e-08
iy [mm], iz [mm] 12 12 iy [mm], iz [mm] 6 6
Wel.y [m3], Wel.z [m3] 1.0667e-05 1.0667e-05 Wel.y [m3], Wel.z [m3] 1.3333e-06 1.3333e-06
Wpl.y [m3], Wpl.z [m3] 1.6000e-05 1.6000e-05 Wpl.y [m3], Wpl.z [m3] 2.0000e-06 2.0000e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 3760.00 3760.00 Mpl.y.+ [Nm], Mpl.y.- [Nm] 470.00 470.00
Mpl.z.+ [Nm], Mpl.z.- [Nm] 3760.00 3760.00 Mpl.z.+ [Nm], Mpl.z.- [Nm] 470.00 470.00
dy [mm], dz [mm] 0 0 dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 3.6027e-07 0.0000e+00 It [m4], Iw [m6] 2.2517e-08 0.0000e+00
βy [mm], βz [mm] 0 0 βy [mm], βz [mm] 0 0
Picture Picture
Type Rectangle
Detailed 10; 10
Item material S 235
A [m2] 1.0000e-04
Ay [m2], Az [m2] 8.3333e-05 8.3333e-05
AL [m2/m], AD [m2/m] 4.0000e-02 4.0000e-02
cY.UCS [mm], cZ.UCS [mm] 5 5
α [deg] 0.00
Iy [m4], Iz [m4] 8.3333e-10 8.3333e-10
iy [mm], iz [mm] 3 3
Wel.y [m3], Wel.z [m3] 1.6667e-07 1.6667e-07
Wpl.y [m3], Wpl.z [m3] 2.5000e-07 2.5000e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 58.75 58.75
Mpl.z.+ [Nm], Mpl.z.- [Nm] 58.75 58.75
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.4073e-09 0.0000e+00
βy [mm], βz [mm] 0 0
3/8

| Section AB |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 40; 40 |  |
| Item material | S 235 |  |
| A [m2] | 1.6000e-03 |  |
| Ay [m2], Az [m2] | 1.3333e-03 | 1.3333e-03 |
| AL [m2/m], AD [m2/m] | 1.6000e-01 | 1.6000e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 20 | 20 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.1333e-07 | 2.1333e-07 |
| iy [mm], iz [mm] | 12 | 12 |
| Wel.y [m3], Wel.z [m3] | 1.0667e-05 | 1.0667e-05 |
| Wpl.y [m3], Wpl.z [m3] | 1.6000e-05 | 1.6000e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 3760.00 | 3760.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 3760.00 | 3760.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 3.6027e-07 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| Section AC et AD |  |  |
| Type | Rectangle |  |
| Detailed | 10; 10 |  |
| Item material | S 235 |  |
| A [m2] | 1.0000e-04 |  |
| Ay [m2], Az [m2] | 8.3333e-05 | 8.3333e-05 |
| AL [m2/m], AD [m2/m] | 4.0000e-02 | 4.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 5 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 8.3333e-10 | 8.3333e-10 |
| iy [mm], iz [mm] | 3 | 3 |
| Wel.y [m3], Wel.z [m3] | 1.6667e-07 | 1.6667e-07 |
| Wpl.y [m3], Wpl.z [m3] | 2.5000e-07 | 2.5000e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 58.75 | 58.75 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 58.75 | 58.75 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.4073e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


| Section AE |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 20; 20 |  |
| Item material | S 235 |  |
| A [m2] | 4.0000e-04 |  |
| Ay [m2], Az [m2] | 3.3333e-04 | 3.3333e-04 |
| AL [m2/m], AD [m2/m] | 8.0000e-02 | 8.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 10 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.3333e-08 | 1.3333e-08 |
| iy [mm], iz [mm] | 6 | 6 |
| Wel.y [m3], Wel.z [m3] | 1.3333e-06 | 1.3333e-06 |
| Wpl.y [m3], Wpl.z [m3] | 2.0000e-06 | 2.0000e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 470.00 | 470.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 470.00 | 470.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 2.2517e-08 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y X
3.2. Line force
Name Member Type Dir Value - P1 Pos x1 Coor Orig Ecc ey
[kN/m] [m]
Load case System Distribution Value - P2 Pos x2 Loc Ecc ez
[kN/m] [m]
LF2 B2 Force Z -1.00 0.000 Rela From start 0.000
LC1 GCS Uniform 1.000 Length 0.000
3.3. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[kN]
Load case Dir Type Orig Regularly
Fb2 B1 GCS -100.00 0.500 Rela 1
LC1 Z Force From start
4/8

| Name | Member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Coor | Orig | Ecc ey
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Loc |  | Ecc ez
[m] |
| LF2 | B2 | Force | Z | -1.00 | 0.000 | Rela | From start | 0.000 |
|  | LC1 | GCS | Uniform |  | 1.000 | Length |  | 0.000 |


| Name | Member | System | Value - F
[kN] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb2 | B1 | GCS | -100.00 | 0.500 | Rela | 1 |
|  | LC1 | Z | Force |  | From start |  |



## Sayfa 61

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces; M_y
Z
Y X
4.2. 1D internal forces; M_y
Z
Y X
5/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
4.3. 1D internal forces; M_y
Z
Y X
4.4. 1D internal forces; M_y
Z
Y X
6/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
4.5. Displacement of nodes
Linear calculation
Load case: LC1
Extreme: Global
Selection: A
Name Case Φy
[mrad]
A LC1 -216.6
7/8

| Name | Case | Φy
[mrad] |
| --- | --- | --- |
| A | LC1 | -216.6 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL10/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Bending Moment poutre AB in node A = 11.02 kNm
Bending Moment poutre AC in node A = 0.11 kNm
Bending Moment poutre AD in node A = -12.35 kNm
Bending Moment poutre AE in node A = 1.21 kNm
Rotation phiy in node A = 227.118 mrad
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
8/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL11/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Truss made of four bars of different cross sections;
material: elastic, linear, isotropic (non-compressible bars assumed).
2. MODEL
2.1. Analysis model
Z
Y X
2.2. Nodes
Name Coord X Coord Z Member Data
[m] [m]
N1 0.000 0.000 B1 Sn2
N2 0.500 0.500 B1
N3 1.000 0.000 B2 Sn1
N4 2.000 1.000 B3 F1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 Section AC et CB - Circle (16) S 235 0.707 N1 N2 general (0)
B2 Section AC et CB - Circle (16) S 235 0.707 N2 N3 general (0)
B3 Section CD et BD - Circle (11) S 235 1.414 N3 N4 general (0)
B4 Section CD et BD - Circle (11) S 235 1.581 N2 N4 general (0)
2.4. Hinges
Name Member Position ux uy uz fix fiy fiz
H1 B4 Both Rigid Rigid Free
H2 B3 End Rigid Rigid Free
H3 B1 End Rigid Rigid Free
H4 B2 Begin Rigid Rigid Free
1/6

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn2 |
| N2 | 0.500 | 0.500 | B1 |  |
|  |  |  | B2 |  |
|  |  |  | B4 |  |
| N3 | 1.000 | 0.000 | B2 | Sn1 |
|  |  |  | B3 |  |
| N4 | 2.000 | 1.000 | B3 | F1 |
|  |  |  | B4 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Section AC et CB - Circle (16) | S 235 | 0.707 | N1 | N2 | general (0) |
| B2 | Section AC et CB - Circle (16) | S 235 | 0.707 | N2 | N3 | general (0) |
| B3 | Section CD et BD - Circle (11) | S 235 | 1.414 | N3 | N4 | general (0) |
| B4 | Section CD et BD - Circle (11) | S 235 | 1.581 | N2 | N4 | general (0) |


| Name | Member | Position | ux | uy | uz | fix | fiy | fiz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1 | B4 | Both | Rigid |  | Rigid |  | Free |  |
| H2 | B3 | End | Rigid |  | Rigid |  | Free |  |
| H3 | B1 | End | Rigid |  | Rigid |  | Free |  |
| H4 | B2 | Begin | Rigid |  | Rigid |  | Free |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL11/89
Current date 21.10.2025
2.5. Nodal supports
Name Node System Type X Z Ry
Sn1 N3 GCS Standard Rigid Rigid Free
Sn2 N1 GCS Standard Rigid Rigid Free
2/6

| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N3 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N1 | GCS | Standard | Rigid | Rigid | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL11/89
Current date 21.10.2025
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 1.9620e+05 0.30 0 40 235.0 360.0
7.5462e+04 0.01e-003 40 80 215.0 360.0
2.7. Cross-sections
Type Circle
Detailed 16
Item material S 235
A [m2] 2.0000e-04
Ay [m2], Az [m2] 1.8000e-04 1.8000e-04
AL [m2/m], AD [m2/m] 5.0130e-02 5.0130e-02
cY.UCS [mm], cZ.UCS [mm] 8 8
α [deg] 0.00
Iy [m4], Iz [m4] 3.1831e-09 3.1831e-09
iy [mm], iz [mm] 4 4
Wel.y [m3], Wel.z [m3] 3.9894e-07 3.9894e-07
Wpl.y [m3], Wpl.z [m3] 6.7727e-07 6.7727e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 159.11 159.11
Mpl.z.+ [Nm], Mpl.z.- [Nm] 159.11 159.11
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 6.3662e-09 0.0000e+00
βy [mm], βz [mm] 0 0
Type Circle
Detailed 11
Item material S 235
A [m2] 1.0000e-04
Ay [m2], Az [m2] 9.0000e-05 9.0000e-05
AL [m2/m], AD [m2/m] 3.5447e-02 3.5447e-02
cY.UCS [mm], cZ.UCS [mm] 6 6
α [deg] 0.00
Iy [m4], Iz [m4] 7.9577e-10 7.9577e-10
iy [mm], iz [mm] 3 3
Wel.y [m3], Wel.z [m3] 1.4105e-07 1.4105e-07
Wpl.y [m3], Wpl.z [m3] 2.3945e-07 2.3945e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 56.25 56.25
Mpl.z.+ [Nm], Mpl.z.- [Nm] 56.25 56.25
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.5915e-09 0.0000e+00
βy [mm], βz [mm] 0 0
3/6

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 1.9620e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.5462e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


| Section AC et CB |  |  |
| --- | --- | --- |
| Type | Circle |  |
| Detailed | 16 |  |
| Item material | S 235 |  |
| A [m2] | 2.0000e-04 |  |
| Ay [m2], Az [m2] | 1.8000e-04 | 1.8000e-04 |
| AL [m2/m], AD [m2/m] | 5.0130e-02 | 5.0130e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 8 | 8 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 3.1831e-09 | 3.1831e-09 |
| iy [mm], iz [mm] | 4 | 4 |
| Wel.y [m3], Wel.z [m3] | 3.9894e-07 | 3.9894e-07 |
| Wpl.y [m3], Wpl.z [m3] | 6.7727e-07 | 6.7727e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 159.11 | 159.11 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 159.11 | 159.11 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 6.3662e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| Section CD et BD |  |  |
| Type | Circle |  |
| Detailed | 11 |  |
| Item material | S 235 |  |
| A [m2] | 1.0000e-04 |  |
| Ay [m2], Az [m2] | 9.0000e-05 | 9.0000e-05 |
| AL [m2/m], AD [m2/m] | 3.5447e-02 | 3.5447e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 6 | 6 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 7.9577e-10 | 7.9577e-10 |
| iy [mm], iz [mm] | 3 | 3 |
| Wel.y [m3], Wel.z [m3] | 1.4105e-07 | 1.4105e-07 |
| Wpl.y [m3], Wpl.z [m3] | 2.3945e-07 | 2.3945e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 56.25 | 56.25 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 56.25 | 56.25 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.5915e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL11/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Valeur totale
Y X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N4 LC2 - Permanent GCS Z Force -9.81
4/6

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N4 | LC2 - Permanent | GCS | Z | Force | -9.81 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL11/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of node N2
Linear calculation
Load case: LC2
Extreme: Global
Selection: N2
Name Case Ux Uz
[mm] [mm]
N2 LC2 0.26523 0.08842
4.2. Displacement of node N4
Linear calculation
Load case: LC2
Extreme: Global
Selection: N4
Name Case Ux Uz
[mm] [mm]
N4 LC2 3.47916 -5.60048
5/6

| Name | Case | Ux
[mm] | Uz
[mm] |
| --- | --- | --- | --- |
| N2 | LC2 | 0.26523 | 0.08842 |


| Name | Case | Ux
[mm] | Uz
[mm] |
| --- | --- | --- | --- |
| N4 | LC2 | 3.47916 | -5.60048 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL11/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement ux in node N2 = 0,26517mm
Displacement uz in node N2 = 0,08839mm
Displacement ux in node N4 = 3,47902mm
Displacement uz in node N4 = -5,60084mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6


## Sayfa 71

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Triangular system of hinged bar under concentrated load, imposed displacement and thermal load.
2. MODEL
2.1. Analysis model
Z
Y X
2.2. Nodes
Name Coord X Coord Z Member LCS Data Name Coord X Coord Z Member LCS Data
[m] [m] [m] [m]
N1 0.000 0.000 B1 û Sn2 N6 35.000 0.000 B5 ü Sn1
B6 B16
N2 5.000 0.000 B1 û N7 0.000 4.000 B6 û
B2 B7
B10 B10
B11 N8 10.000 4.000 B7 û F1
N3 15.000 0.000 B2 û B8
B3 B11
B12 B12
B13 N9 20.000 4.000 B8 û
N4 20.000 -4.000 B3 û Sn3 B9
B4 B13
B17 B14
N5 25.000 0.000 B4 û B17
B5 N10 30.000 4.000 B9 û F2
B14 B15
B15 B16
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 A2 - Circle (60) S 235 5.000 N1 N2 general (0)
B2 A2 - Circle (60) S 235 10.000 N2 N3 general (0)
B3 A2 - Circle (60) S 235 6.403 N3 N4 general (0)
B4 A2 - Circle (60) S 235 6.403 N4 N5 general (0)
B5 A2 - Circle (60) S 235 10.000 N5 N6 general (0)
1/11

| Name | Coord X
[m] | Coord Z
[m] | Member | LCS | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | û | Sn2 |
|  |  |  | B6 |  |  |
| N2 | 5.000 | 0.000 | B1 | û |  |
|  |  |  | B2 |  |  |
|  |  |  | B10 |  |  |
|  |  |  | B11 |  |  |
| N3 | 15.000 | 0.000 | B2 | û |  |
|  |  |  | B3 |  |  |
|  |  |  | B12 |  |  |
|  |  |  | B13 |  |  |
| N4 | 20.000 | -4.000 | B3 | û | Sn3 |
|  |  |  | B4 |  |  |
|  |  |  | B17 |  |  |
| N5 | 25.000 | 0.000 | B4 | û |  |
|  |  |  | B5 |  |  |
|  |  |  | B14 |  |  |
|  |  |  | B15 |  |  |


| Name | Coord X
[m] | Coord Z
[m] | Member | LCS | Data |
| --- | --- | --- | --- | --- | --- |
| N6 | 35.000 | 0.000 | B5 | ü | Sn1 |
|  |  |  | B16 |  |  |
| N7 | 0.000 | 4.000 | B6 | û |  |
|  |  |  | B7 |  |  |
|  |  |  | B10 |  |  |
| N8 | 10.000 | 4.000 | B7 | û | F1 |
|  |  |  | B8 |  |  |
|  |  |  | B11 |  |  |
|  |  |  | B12 |  |  |
| N9 | 20.000 | 4.000 | B8 | û |  |
|  |  |  | B9 |  |  |
|  |  |  | B13 |  |  |
|  |  |  | B14 |  |  |
|  |  |  | B17 |  |  |
| N10 | 30.000 | 4.000 | B9 | û | F2 |
|  |  |  | B15 |  |  |
|  |  |  | B16 |  |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | A2 - Circle (60) | S 235 | 5.000 | N1 | N2 | general (0) |
| B2 | A2 - Circle (60) | S 235 | 10.000 | N2 | N3 | general (0) |
| B3 | A2 - Circle (60) | S 235 | 6.403 | N3 | N4 | general (0) |
| B4 | A2 - Circle (60) | S 235 | 6.403 | N4 | N5 | general (0) |
| B5 | A2 - Circle (60) | S 235 | 10.000 | N5 | N6 | general (0) |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
Name Cross-section Material Length Beg. node End node Type
[m]
B6 A1 - Circle (42) S 235 4.000 N1 N7 general (0)
B7 A2 - Circle (60) S 235 10.000 N7 N8 general (0)
B8 A2 - Circle (60) S 235 10.000 N8 N9 general (0)
B9 A2 - Circle (60) S 235 10.000 N9 N10 general (0)
B10 A1 - Circle (42) S 235 6.403 N7 N2 general (0)
B11 A1 - Circle (42) S 235 6.403 N2 N8 general (0)
B12 A1 - Circle (42) S 235 6.403 N8 N3 general (0)
B13 A1 - Circle (42) S 235 6.403 N3 N9 general (0)
B14 A1 - Circle (42) S 235 6.403 N9 N5 general (0)
B15 A1 - Circle (42) S 235 6.403 N5 N10 general (0)
B16 A1 - Circle (42) S 235 6.403 N10 N6 general (0)
B17 A2 - Circle (60) S 235 8.000 N4 N9 general (0)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N6 LCS of node Standard Free Rigid Free
Sn2 N1 GCS Standard Rigid Rigid Free
Sn3 N4 GCS Standard Free Rigid Free
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2/11

| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B6 | A1 - Circle (42) | S 235 | 4.000 | N1 | N7 | general (0) |
| B7 | A2 - Circle (60) | S 235 | 10.000 | N7 | N8 | general (0) |
| B8 | A2 - Circle (60) | S 235 | 10.000 | N8 | N9 | general (0) |
| B9 | A2 - Circle (60) | S 235 | 10.000 | N9 | N10 | general (0) |
| B10 | A1 - Circle (42) | S 235 | 6.403 | N7 | N2 | general (0) |
| B11 | A1 - Circle (42) | S 235 | 6.403 | N2 | N8 | general (0) |
| B12 | A1 - Circle (42) | S 235 | 6.403 | N8 | N3 | general (0) |
| B13 | A1 - Circle (42) | S 235 | 6.403 | N3 | N9 | general (0) |
| B14 | A1 - Circle (42) | S 235 | 6.403 | N9 | N5 | general (0) |
| B15 | A1 - Circle (42) | S 235 | 6.403 | N5 | N10 | general (0) |
| B16 | A1 - Circle (42) | S 235 | 6.403 | N10 | N6 | general (0) |
| B17 | A2 - Circle (60) | S 235 | 8.000 | N4 | N9 | general (0) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N6 | LCS of node | Standard | Free | Rigid | Free |
| Sn2 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn3 | N4 | GCS | Standard | Free | Rigid | Free |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
2.6. Cross-sections
Type Circle
Detailed 42
Item material S 235
A [m2] 1.4100e-03
Ay [m2], Az [m2] 1.2690e-03 1.2690e-03
AL [m2/m], AD [m2/m] 1.3310e-01 1.3310e-01
cY.UCS [mm], cZ.UCS [mm] 21 21
α [deg] 0.00
Iy [m4], Iz [m4] 1.5821e-07 1.5821e-07
iy [mm], iz [mm] 11 11
Wel.y [m3], Wel.z [m3] 7.4678e-06 7.4678e-06
Wpl.y [m3], Wpl.z [m3] 1.2678e-05 1.2678e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 2978.37 2978.37
Mpl.z.+ [Nm], Mpl.z.- [Nm] 2978.37 2978.37
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 3.1642e-07 0.0000e+00
βy [mm], βz [mm] 0 0
Type Circle
Detailed 60
Item material S 235
A [m2] 2.8200e-03
Ay [m2], Az [m2] 2.5380e-03 2.5380e-03
AL [m2/m], AD [m2/m] 1.8824e-01 1.8824e-01
cY.UCS [mm], cZ.UCS [mm] 30 30
α [deg] 0.00
Iy [m4], Iz [m4] 6.3283e-07 6.3283e-07
iy [mm], iz [mm] 15 15
Wel.y [m3], Wel.z [m3] 2.1122e-05 2.1122e-05
Wpl.y [m3], Wpl.z [m3] 3.5858e-05 3.5858e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 8424.09 8424.09
Mpl.z.+ [Nm], Mpl.z.- [Nm] 8424.09 8424.09
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.2657e-06 0.0000e+00
βy [mm], βz [mm] 0 0
3/11

| A1 |  |  |
| --- | --- | --- |
| Type | Circle |  |
| Detailed | 42 |  |
| Item material | S 235 |  |
| A [m2] | 1.4100e-03 |  |
| Ay [m2], Az [m2] | 1.2690e-03 | 1.2690e-03 |
| AL [m2/m], AD [m2/m] | 1.3310e-01 | 1.3310e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 21 | 21 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.5821e-07 | 1.5821e-07 |
| iy [mm], iz [mm] | 11 | 11 |
| Wel.y [m3], Wel.z [m3] | 7.4678e-06 | 7.4678e-06 |
| Wpl.y [m3], Wpl.z [m3] | 1.2678e-05 | 1.2678e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 2978.37 | 2978.37 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 2978.37 | 2978.37 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 3.1642e-07 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| A2 |  |  |
| Type | Circle |  |
| Detailed | 60 |  |
| Item material | S 235 |  |
| A [m2] | 2.8200e-03 |  |
| Ay [m2], Az [m2] | 2.5380e-03 | 2.5380e-03 |
| AL [m2/m], AD [m2/m] | 1.8824e-01 | 1.8824e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 30 | 30 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 6.3283e-07 | 6.3283e-07 |
| iy [mm], iz [mm] | 15 | 15 |
| Wel.y [m3], Wel.z [m3] | 2.1122e-05 | 2.1122e-05 |
| Wpl.y [m3], Wpl.z [m3] | 3.5858e-05 | 3.5858e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 8424.09 | 8424.09 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 8424.09 | 8424.09 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.2657e-06 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
3. LOAD
3.1. Load cases
Name Description Action type Load group
Spec Load type
LC1 Displacement Permanent LG1
LC2 Permanent Permanent LG1
LC3 Temperature Permanent LG1
3.2. Combinations
Name Description Type Load cases Coeff.
[-]
comb lineaire Linear - ultimate LC1 - Displacement 1.000
LC2 - Permanent 1.000
LC3 - Temperature 1.000
4/11

| Name | Description | Action type | Load group |
| --- | --- | --- | --- |
|  | Spec | Load type |  |
| LC1 | Displacement | Permanent | LG1 |
|  |  | Standard |  |
| LC2 | Permanent | Permanent | LG1 |
|  |  | Standard |  |
| LC3 | Temperature | Permanent | LG1 |
|  |  | Standard |  |


| Name | Description | Type | Load cases | Coeff.
[-] |
| --- | --- | --- | --- | --- |
| comb lineaire |  | Linear - ultimate | LC1 - Displacement | 1.000 |
|  |  |  | LC2 - Permanent | 1.000 |
|  |  |  | LC3 - Temperature | 1.000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
3.3. LC1 - Displacement
Y X
3.4. Point translation
Name Support in node Load case System Dir Value - U
[mm]
TRS1 Sn1 LC1 - Displacement LCS Z -15.00
TRS2 Sn2 LC1 - Displacement LCS Z -20.00
TRS3 Sn3 LC1 - Displacement LCS Z -30.00
Load case Displacement
5/11

| Name | Support in node | Load case | System | Dir | Value - U
[mm] |
| --- | --- | --- | --- | --- | --- |
| TRS1 | Sn1 | LC1 - Displacement | LCS | Z | -15.00 |
| TRS2 | Sn2 | LC1 - Displacement | LCS | Z | -20.00 |
| TRS3 | Sn3 | LC1 - Displacement | LCS | Z | -30.00 |


| Explanations of symbols |  |
| --- | --- |
| Load case | Displacement |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
3.5. LC2 - Forces
Y X
3.6. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N8 LC2 - Permanent GCS Z Force -150.00
F2 N10 LC2 - Permanent GCS Z Force -100.00
6/11

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N8 | LC2 - Permanent | GCS | Z | Force | -150.00 |
| F2 | N10 | LC2 - Permanent | GCS | Z | Force | -100.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
3.7. LC3 - Thermal load
Z
Y X
3.8. Thermal load
Name Member Load case Pos x1 Coor Orig Distribution Delta
[°C]
LT1 B1 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT2 B2 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT3 B3 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT4 B4 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT5 B5 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT6 B6 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT7 B7 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT8 B8 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT9 B9 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT10 B10 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT11 B11 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT12 B12 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT13 B13 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT14 B14 LC3 - Temperature 0.000 Rela From start Constant 150.00
7/11

| Name | Member | Load case | Pos x1 | Coor | Orig | Distribution | Delta
[°C] |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | Pos x2 |  |  |  |  |
| LT1 | B1 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT2 | B2 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT3 | B3 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT4 | B4 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT5 | B5 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT6 | B6 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT7 | B7 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT8 | B8 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT9 | B9 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT10 | B10 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT11 | B11 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT12 | B12 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT13 | B13 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT14 | B14 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
Name Member Load case Pos x1 Coor Orig Distribution Delta
[°C]
LT15 B15 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT16 B16 LC3 - Temperature 0.000 Rela From start Constant 150.00
LT17 B17 LC3 - Temperature 0.000 Rela From start Constant 150.00
8/11

| Name | Member | Load case | Pos x1 | Coor | Orig | Distribution | Delta
[°C] |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | Pos x2 |  |  |  |  |
| LT15 | B15 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT16 | B16 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |
| LT17 | B17 | LC3 - Temperature | 0.000 | Rela | From start | Constant | 150.00 |
|  |  |  | 1.000 |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces; N
Z
Y X
4.2. 1D internal forces
Linear calculation
Combination: comb lineaire
Coordinate system: Member
Extreme 1D: Global
Selection: B4
Name dx Case N Vz My
[m] [kN] [kN] [kNm]
B4 0.000 comb lineaire/1 43.63 0.00 0.00
Name Combination key
comb lineaire/1 LC1 + LC2 + LC3
9/11

| Name | dx
[m] | Case | N
[kN] | Vz
[kN] | My
[kNm] |
| --- | --- | --- | --- | --- | --- |
| B4 | 0.000 | comb lineaire/1 | 43.63 | 0.00 | 0.00 |


| Name | Combination key |
| --- | --- |
| comb lineaire/1 | LC1 + LC2 + LC3 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
4.3. Displacement of nodes; U_z
Z
Y X
4.4. Displacement of nodes
Linear calculation
Combination: comb lineaire
Extreme: Global
Selection: N5
Name Case Uz
[mm]
N5 comb lineaire/1 -16.18
Name Combination key
comb lineaire/1 LC1 + LC2 + LC3
10/11

| Name | Case | Uz
[mm] |
| --- | --- | --- |
| N5 | comb lineaire/1 | -16.18 |


| Name | Combination key |
| --- | --- |
| comb lineaire/1 | LC1 + LC2 + LC3 |



## Sayfa 81

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLL 12/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Normal force in element B4 = 43.63 kN
Vertical displacement in node N5 = -16.18 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
11/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simply supported beam with truss elements (hinged joints), shortening of bars; elastic, linear, isotropic material.
2. MODEL
2.1. Analysis model
Z
Y X
2.2. Nodes
Name Coord X Coord Z Member Data Name Coord X Coord Z Member Data
[m] [m] [m] [m]
N1 0.000 0.000 B1 Sn1 N5 2.000 -0.600 B4
B6 B6
N2 2.000 0.000 B1 B7
B2 N6 6.000 -0.600 B5
B4 B7
N3 6.000 0.000 B2 B8
B3 N7 4.000 0.000 B2
N4 8.000 0.000 B3 Sn2
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 Poutre - Full rectangular (123; 123) S 235 2.000 N1 N2 general (0)
B2 Poutre - Full rectangular (123; 123) S 235 4.000 N2 N3 general (0)
B3 Poutre - Full rectangular (123; 123) S 235 2.000 N3 N4 general (0)
B4 Barre A3 - Full rectangular (59; 59) S 235 0.600 N2 N5 general (0)
B5 Barre A3 - Full rectangular (59; 59) S 235 0.600 N3 N6 general (0)
B6 Barre A1 - Full rectangular (67; 67) S 235 2.088 N1 N5 general (0)
B7 Barre A1 - Full rectangular (67; 67) S 235 4.000 N5 N6 general (0)
B8 Barre A1 - Full rectangular (67; 67) S 235 2.088 N6 N4 general (0)
1/8

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn1 |
|  |  |  | B6 |  |
| N2 | 2.000 | 0.000 | B1 |  |
|  |  |  | B2 |  |
|  |  |  | B4 |  |
| N3 | 6.000 | 0.000 | B2 |  |
|  |  |  | B3 |  |
|  |  |  | B5 |  |
| N4 | 8.000 | 0.000 | B3 | Sn2 |
|  |  |  | B8 |  |


| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N5 | 2.000 | -0.600 | B4 |  |
|  |  |  | B6 |  |
|  |  |  | B7 |  |
| N6 | 6.000 | -0.600 | B5 |  |
|  |  |  | B7 |  |
|  |  |  | B8 |  |
| N7 | 4.000 | 0.000 | B2 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Poutre - Full rectangular (123; 123) | S 235 | 2.000 | N1 | N2 | general (0) |
| B2 | Poutre - Full rectangular (123; 123) | S 235 | 4.000 | N2 | N3 | general (0) |
| B3 | Poutre - Full rectangular (123; 123) | S 235 | 2.000 | N3 | N4 | general (0) |
| B4 | Barre A3 - Full rectangular (59; 59) | S 235 | 0.600 | N2 | N5 | general (0) |
| B5 | Barre A3 - Full rectangular (59; 59) | S 235 | 0.600 | N3 | N6 | general (0) |
| B6 | Barre A1 - Full rectangular (67; 67) | S 235 | 2.088 | N1 | N5 | general (0) |
| B7 | Barre A1 - Full rectangular (67; 67) | S 235 | 4.000 | N5 | N6 | general (0) |
| B8 | Barre A1 - Full rectangular (67; 67) | S 235 | 2.088 | N6 | N4 | general (0) |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Free
Sn2 N4 GCS Standard Free Rigid Free
2.5. Hinges
Name Member Position ux uy uz fix fiy fiz
H1 B8 Begin Rigid Rigid Free
H2 B6 End Rigid Rigid Free
H3 B7 Both Rigid Rigid Free
H4 B5 Both Rigid Rigid Free
H5 B4 Both Rigid Rigid Free
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.4000e+04 0.01e-003 40 80 215.0 360.0
2/8

| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N4 | GCS | Standard | Free | Rigid | Free |


| Name | Member | Position | ux | uy | uz | fix | fiy | fiz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1 | B8 | Begin | Rigid |  | Rigid |  | Free |  |
| H2 | B6 | End | Rigid |  | Rigid |  | Free |  |
| H3 | B7 | Both | Rigid |  | Rigid |  | Free |  |
| H4 | B5 | Both | Rigid |  | Rigid |  | Free |  |
| H5 | B4 | Both | Rigid |  | Rigid |  | Free |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.4000e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
2.7. Cross-sections
Type Full rectangular
Detailed 123; 123
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 1.5160e-02
Ay [m2], Az [m2] 1.2633e-02 1.2633e-02
AL [m2/m], AD [m2/m] 4.9250e-01 4.9250e-01
cY.UCS [mm], cZ.UCS [mm] 62 62
α [deg] 0.00
Iy [m4], Iz [m4] 2.1740e-04 2.1740e-04
iy [mm], iz [mm] 120 120
Wel.y [m3], Wel.z [m3] 3.5314e-03 3.5314e-03
Wpl.y [m3], Wpl.z [m3] 4.6665e-04 4.6665e-04
Mpl.y.+ [Nm], Mpl.y.- [Nm] 109662.13 109662.13
Mpl.z.+ [Nm], Mpl.z.- [Nm] 109662.13 109662.13
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 3.2344e-05 0.0000e+00
βy [mm], βz [mm] 0 0
Type Full rectangular
Detailed 67; 67
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 4.5000e-03
Ay [m2], Az [m2] 3.7500e-03 3.7500e-03
AL [m2/m], AD [m2/m] 2.6833e-01 2.6833e-01
cY.UCS [mm], cZ.UCS [mm] 34 34
α [deg] 0.00
Iy [m4], Iz [m4] 1.6875e-06 1.6875e-06
iy [mm], iz [mm] 19 19
Wel.y [m3], Wel.z [m3] 5.0312e-05 5.0312e-05
Wpl.y [m3], Wpl.z [m3] 7.5467e-05 7.5467e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 17734.81 17734.81
Mpl.z.+ [Nm], Mpl.z.- [Nm] 17734.81 17734.81
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 2.8498e-06 0.0000e+00
βy [mm], βz [mm] 0 0
Type Full rectangular
Detailed 59; 59
Formcode 7 - Full rectangular section
3/8

| Poutre |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 123; 123 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 1.5160e-02 |  |
| Ay [m2], Az [m2] | 1.2633e-02 | 1.2633e-02 |
| AL [m2/m], AD [m2/m] | 4.9250e-01 | 4.9250e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 62 | 62 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.1740e-04 | 2.1740e-04 |
| iy [mm], iz [mm] | 120 | 120 |
| Wel.y [m3], Wel.z [m3] | 3.5314e-03 | 3.5314e-03 |
| Wpl.y [m3], Wpl.z [m3] | 4.6665e-04 | 4.6665e-04 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 109662.13 | 109662.13 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 109662.13 | 109662.13 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 3.2344e-05 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| Barre A1 |  |  |
| Type | Full rectangular |  |
| Detailed | 67; 67 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 4.5000e-03 |  |
| Ay [m2], Az [m2] | 3.7500e-03 | 3.7500e-03 |
| AL [m2/m], AD [m2/m] | 2.6833e-01 | 2.6833e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 34 | 34 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.6875e-06 | 1.6875e-06 |
| iy [mm], iz [mm] | 19 | 19 |
| Wel.y [m3], Wel.z [m3] | 5.0312e-05 | 5.0312e-05 |
| Wpl.y [m3], Wpl.z [m3] | 7.5467e-05 | 7.5467e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 17734.81 | 17734.81 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 17734.81 | 17734.81 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 2.8498e-06 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| Barre A3 |  |  |
| Type | Full rectangular |  |
| Detailed | 59; 59 |  |
| Formcode | 7 - Full rectangular section |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
Item material S 235
A [m2] 3.4800e-03
Ay [m2], Az [m2] 2.9000e-03 2.9000e-03
AL [m2/m], AD [m2/m] 2.3597e-01 2.3597e-01
cY.UCS [mm], cZ.UCS [mm] 29 29
α [deg] 0.00
Iy [m4], Iz [m4] 1.0092e-06 1.0092e-06
iy [mm], iz [mm] 17 17
Wel.y [m3], Wel.z [m3] 3.4215e-05 3.4215e-05
Wpl.y [m3], Wpl.z [m3] 5.1323e-05 5.1323e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 12060.82 12060.82
Mpl.z.+ [Nm], Mpl.z.- [Nm] 12060.82 12060.82
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.7043e-06 0.0000e+00
βy [mm], βz [mm] 0 0
4/8

| Item material | S 235 |  |
| --- | --- | --- |
| A [m2] | 3.4800e-03 |  |
| Ay [m2], Az [m2] | 2.9000e-03 | 2.9000e-03 |
| AL [m2/m], AD [m2/m] | 2.3597e-01 | 2.3597e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 29 | 29 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.0092e-06 | 1.0092e-06 |
| iy [mm], iz [mm] | 17 | 17 |
| Wel.y [m3], Wel.z [m3] | 3.4215e-05 | 3.4215e-05 |
| Wpl.y [m3], Wpl.z [m3] | 5.1323e-05 | 5.1323e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 12060.82 | 12060.82 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 12060.82 | 12060.82 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.7043e-06 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
Y X
3.2. Line force
Name Member Type Dir Value - P1 Pos x1 Coor Orig Ecc ey
[kN/m] [m]
Load case System Distribution Value - P2 Pos x2 Loc Ecc ez
[kN/m] [m]
LF1 B2 Force Z -50.00 0.000 Rela From start
LC2 - Permanent LCS Uniform 1.000 Length 0.000
LF2 B1 Force Z -50.00 0.000 Rela From start
LC2 - Permanent LCS Uniform 1.000 Length 0.000
LF3 B3 Force Z -50.00 0.000 Rela From start
LC2 - Permanent LCS Uniform 1.000 Length 0.000
3.3. Line translation
Name System Loc Dir Distribution Value - U1
[mm/m]
LTR1 LCS Length X Uniform -1.6
5/8

| Name | Member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Coor | Orig | Ecc ey
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Loc |  | Ecc ez
[m] |
| LF1 | B2 | Force | Z | -50.00 | 0.000 | Rela | From start |  |
|  | LC2 - Permanent | LCS | Uniform |  | 1.000 | Length |  | 0.000 |
| LF2 | B1 | Force | Z | -50.00 | 0.000 | Rela | From start |  |
|  | LC2 - Permanent | LCS | Uniform |  | 1.000 | Length |  | 0.000 |
| LF3 | B3 | Force | Z | -50.00 | 0.000 | Rela | From start |  |
|  | LC2 - Permanent | LCS | Uniform |  | 1.000 | Length |  | 0.000 |


| Name | System | Loc | Dir | Distribution | Value - U1
[mm/m] |
| --- | --- | --- | --- | --- | --- |
| LTR1 | LCS | Length | X | Uniform | -1.6 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces; N
Z
Y X
4.2. 1D internal forces; M_y
Z
Y X
6/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
4.3. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N2
Name Case Uz
[mm]
N2 LC2 -0.6
4.4. Displacement of nodes; U_z
Z
Y X
7/8

| Name | Case | Uz
[mm] |
| --- | --- | --- |
| N2 | LC2 | -0.6 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL13/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Shear Force in node B7 = 584.584 kN
Bending Moment in node N7 = 49.249 kNm
Vertical displacement in node N2 = -0.543 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
8/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simply supported symmetrical frame with asymmetric load; material: elastic, linear, isotropic
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data Name Coord X Coord Z Member Data
[m] [m] [m] [m]
N1 0.000 0.000 B1 Sn1 N4 20.000 8.000 B3
N2 0.000 8.000 B1 F2 B4
B2 M1 N5 20.000 0.000 B4 Sn2
N3 10.000 12.000 B2 F1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 Poteau - Full rectangular (278; 278) S 235 8.000 N1 N2 column (100)
B2 Poutre - Full rectangular (234; 234) S 235 10.770 N2 N3 beam (80)
B3 Poutre - Full rectangular (234; 234) S 235 10.770 N4 N3 beam (80)
B4 Poteau - Full rectangular (278; 278) S 235 8.000 N5 N4 column (100)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Free
Sn2 N5 GCS Standard Rigid Rigid Free
1/7

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 0.000 | 8.000 | B1 | F2 |
|  |  |  | B2 | M1 |
| N3 | 10.000 | 12.000 | B2 | F1 |
|  |  |  | B3 |  |


| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N4 | 20.000 | 8.000 | B3 |  |
|  |  |  | B4 |  |
| N5 | 20.000 | 0.000 | B4 | Sn2 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Poteau - Full rectangular (278; 278) | S 235 | 8.000 | N1 | N2 | column (100) |
| B2 | Poutre - Full rectangular (234; 234) | S 235 | 10.770 | N2 | N3 | beam (80) |
| B3 | Poutre - Full rectangular (234; 234) | S 235 | 10.770 | N4 | N3 | beam (80) |
| B4 | Poteau - Full rectangular (278; 278) | S 235 | 8.000 | N5 | N4 | column (100) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N5 | GCS | Standard | Rigid | Rigid | Free |



## Sayfa 91

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2/7

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
2.6. Cross-sections
Type Full rectangular
Detailed 278; 278
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 7.7460e-02
Ay [m2], Az [m2] 6.4550e-02 6.4550e-02
AL [m2/m], AD [m2/m] 1.1133e+00 1.1133e+00
cY.UCS [mm], cZ.UCS [mm] 139 139
α [deg] 0.00
Iy [m4], Iz [m4] 5.0000e-04 5.0000e-04
iy [mm], iz [mm] 80 80
Wel.y [m3], Wel.z [m3] 3.5930e-03 3.5930e-03
Wpl.y [m3], Wpl.z [m3] 5.3896e-03 5.3896e-03
Mpl.y.+ [Nm], Mpl.y.- [Nm] 1266547.00 1266547.00
Mpl.z.+ [Nm], Mpl.z.- [Nm] 1266547.00 1266547.00
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 8.4439e-04 0.0000e+00
βy [mm], βz [mm] 0 0
Type Full rectangular
Detailed 234; 234
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 5.4772e-02
Ay [m2], Az [m2] 4.5644e-02 4.5644e-02
AL [m2/m], AD [m2/m] 9.3614e-01 9.3614e-01
cY.UCS [mm], cZ.UCS [mm] 117 117
α [deg] 0.00
Iy [m4], Iz [m4] 2.5000e-04 2.5000e-04
iy [mm], iz [mm] 68 68
Wel.y [m3], Wel.z [m3] 2.1364e-03 2.1364e-03
Wpl.y [m3], Wpl.z [m3] 3.2047e-03 3.2047e-03
Mpl.y.+ [Nm], Mpl.y.- [Nm] 753093.35 753093.35
Mpl.z.+ [Nm], Mpl.z.- [Nm] 753093.35 753093.35
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 4.2219e-04 0.0000e+00
βy [mm], βz [mm] 0 0
3/7

| Poteau |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 278; 278 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 7.7460e-02 |  |
| Ay [m2], Az [m2] | 6.4550e-02 | 6.4550e-02 |
| AL [m2/m], AD [m2/m] | 1.1133e+00 | 1.1133e+00 |
| cY.UCS [mm], cZ.UCS [mm] | 139 | 139 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 5.0000e-04 | 5.0000e-04 |
| iy [mm], iz [mm] | 80 | 80 |
| Wel.y [m3], Wel.z [m3] | 3.5930e-03 | 3.5930e-03 |
| Wpl.y [m3], Wpl.z [m3] | 5.3896e-03 | 5.3896e-03 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 1266547.00 | 1266547.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 1266547.00 | 1266547.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 8.4439e-04 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| Poutre |  |  |
| Type | Full rectangular |  |
| Detailed | 234; 234 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 5.4772e-02 |  |
| Ay [m2], Az [m2] | 4.5644e-02 | 4.5644e-02 |
| AL [m2/m], AD [m2/m] | 9.3614e-01 | 9.3614e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 117 | 117 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.5000e-04 | 2.5000e-04 |
| iy [mm], iz [mm] | 68 | 68 |
| Wel.y [m3], Wel.z [m3] | 2.1364e-03 | 2.1364e-03 |
| Wpl.y [m3], Wpl.z [m3] | 3.2047e-03 | 3.2047e-03 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 753093.35 | 753093.35 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 753093.35 | 753093.35 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 4.2219e-04 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
Y X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N3 LC2 - Permanent GCS Z Force -20.0000
F2 N2 LC2 - Permanent GCS X Force -10.0000
3.3. Moment in node
Name Node Load case System Dir Type Value - M
[kNm]
M1 N2 LC2 - Permanent GCS My Moment 100.0000
3.4. Line force
Name Member Type Dir Value - P1 Pos x1 Coor Orig Ecc ey
[kN/m] [m]
Load case System Distribution Value - P2 Pos x2 Loc Ecc ez
[kN/m] [m]
LF1 B2 Force Z -3.0000 0.000 Rela From start
LC2 - Permanent GCS Uniform 1.000 Projection 0.000
4/7

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N3 | LC2 - Permanent | GCS | Z | Force | -20.0000 |
| F2 | N2 | LC2 - Permanent | GCS | X | Force | -10.0000 |


| Name | Node | Load case | System | Dir | Type | Value - M
[kNm] |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | N2 | LC2 - Permanent | GCS | My | Moment | 100.0000 |


| Name | Member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Coor | Orig | Ecc ey
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Loc |  | Ecc ez
[m] |
| LF1 | B2 | Force | Z | -3.0000 | 0.000 | Rela | From start |  |
|  | LC2 - Permanent | GCS | Uniform |  | 1.000 | Projection |  | 0.000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
4. RESULTS
4.1. Reactions
Linear calculation
Load case: LC2
System: Global
Extreme: Global
Selection: Sn1
Nodal reactions
Name Case Rx Rz My ex
[kN] [kN] [kNm] [mm]
Sn1/N1 LC2 20.2388 31.5000 0.0000 0.00
4.2. Reactions; R_z
Z
Y X
5/7

| Name | Case | Rx
[kN] | Rz
[kN] | My
[kNm] | ex
[mm] |
| --- | --- | --- | --- | --- | --- |
| Sn1/N1 | LC2 | 20.2388 | 31.5000 | 0.0000 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
4.3. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N3
Name Case Uz
[mm]
N3 LC2 -30.74
4.4. Displacement of nodes; U_z
Z
Y X
6/7

| Name | Case | Uz
[mm] |
| --- | --- | --- |
| N3 | LC2 | -30.74 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL14/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Vertical displacement in node N3 = -30,72mm
Vertical reaction in node N1= 31,5KN
Horizontal reaction in N1=20,24 KN
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simple beam on bidirectional, elastic foundation (Winkler’s foundation), elastic, linear, isotropic material
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Member
[m] [m] [m]
N1 0.000 0.000 0.000 B1
N2 4.967 0.000 0.000 B1
N3 2.484 0.000 0.000 B1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS2 - Full rectangular (186; 186) S 235 4.967 N1 N2 general (0)
2.4. Line supports on member
Name Type Member Pos x1 Coor X Y Z Rx Ry Rz
System Pos x2 Orig
Slb1 Line B1 0.000 Rela Rigid Rigid Flexible Rigid Free Free
LCS 1.000 From start
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 |
| N2 | 4.967 | 0.000 | 0.000 | B1 |
| N3 | 2.484 | 0.000 | 0.000 | B1 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS2 - Full rectangular (186; 186) | S 235 | 4.967 | N1 | N2 | general (0) |


| Name | Type | Member | Pos x1 | Coor | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | System | Pos x2 | Orig |  |  |  |  |  |  |
| Slb1 | Line | B1 | 0.000 | Rela | Rigid | Rigid | Flexible | Rigid | Free | Free |
|  |  | LCS | 1.000 | From start |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
2.5. Cross-sections
Type Full rectangular
Detailed 186; 186
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 3.4641e-02
Ay [m2], Az [m2] 2.8868e-02 2.8868e-02
AL [m2/m], AD [m2/m] 7.4448e-01 7.4448e-01
cY.UCS [mm], cZ.UCS [mm] 93 93
α [deg] 0.00
Iy [m4], Iz [m4] 1.0000e-04 1.0000e-04
iy [mm], iz [mm] 54 54
Wel.y [m3], Wel.z [m3] 1.0746e-03 1.0746e-03
Wpl.y [m3], Wpl.z [m3] 1.6119e-03 1.6119e-03
Mpl.y.+ [Nm], Mpl.y.- [Nm] 378785.90 378785.90
Mpl.z.+ [Nm], Mpl.z.- [Nm] 378785.90 378785.90
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.6888e-04 0.0000e+00
βy [mm], βz [mm] 0 0
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2/7

| CS2 |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 186; 186 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 3.4641e-02 |  |
| Ay [m2], Az [m2] | 2.8868e-02 | 2.8868e-02 |
| AL [m2/m], AD [m2/m] | 7.4448e-01 | 7.4448e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 93 | 93 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.0000e-04 | 1.0000e-04 |
| iy [mm], iz [mm] | 54 | 54 |
| Wel.y [m3], Wel.z [m3] | 1.0746e-03 | 1.0746e-03 |
| Wpl.y [m3], Wpl.z [m3] | 1.6119e-03 | 1.6119e-03 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 378785.90 | 378785.90 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 378785.90 | 378785.90 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.6888e-04 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
Y X
3.2. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[kN]
Load case Dir Type Orig Regularly
Fb1 B1 GCS -10.0000 0.000 Rela 1
LC2 - permanent Z Force From start
Fb2 B1 GCS -10.0000 0.500 Rela 1
LC2 - permanent Z Force From start
Fb3 B1 GCS -10.0000 1.000 Rela 1
LC2 - permanent Z Force From start
3/7

| Name | Member | System | Value - F
[kN] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb1 | B1 | GCS | -10.0000 | 0.000 | Rela | 1 |
|  | LC2 - permanent | Z | Force |  | From start |  |
| Fb2 | B1 | GCS | -10.0000 | 0.500 | Rela | 1 |
|  | LC2 - permanent | Z | Force |  | From start |  |
| Fb3 | B1 | GCS | -10.0000 | 1.000 | Rela | 1 |
|  | LC2 - permanent | Z | Force |  | From start |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
4. RESULTS
4.1. 1D internal forces
Linear calculation
Load case: LC2
Coordinate system: Principal
Extreme 1D: Global
Selection: All
Filter: Cross-section = CS2 - Full rectangular (186; 186)
Selected sections: Inputted
Name dx Case Cross-section N Vy Vz Mx My Mz
[m] [kN] [kN] [kN] [kNm] [kNm] [kNm]
B1 2.484+ LC2 CS2 - Full 0.0000 0.0000 -4.7026 0.0000 -5.7567 0.0000
rectangular
(186; 186)
B1 2.484- LC2 CS2 - Full 0.0000 0.0000 4.7026 0.0000 -5.7567 0.0000
rectangular
(186; 186)
4.2. 1D internal forces; M_y
Z
Y X
4/7

| Name | dx
[m] | Case | Cross-section | N
[kN] | Vy
[kN] | Vz
[kN] | Mx
[kNm] | My
[kNm] | Mz
[kNm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 2.484+ | LC2 | CS2 - Full
rectangular
(186; 186) | 0.0000 | 0.0000 | -4.7026 | 0.0000 | -5.7567 | 0.0000 |
| B1 | 2.484- | LC2 | CS2 - Full
rectangular
(186; 186) | 0.0000 | 0.0000 | 4.7026 | 0.0000 | -5.7567 | 0.0000 |



## Sayfa 101

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
4.3. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N1, N3
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N3 LC2 0.0000 0.0000 -6.8436 0.000 0.000 0.000 6.8436
N1 LC2 0.0000 0.0000 -7.8605 0.000 -0.705 0.000 7.8605
4.4. 1D deformations; u_z
Z
Y X
5/7

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N3 | LC2 | 0.0000 | 0.0000 | -6.8436 | 0.000 | 0.000 | 0.000 | 6.8436 |
| N1 | LC2 | 0.0000 | 0.0000 | -7.8605 | 0.000 | -0.705 | 0.000 | 7.8605 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
4.5. 1D deformations; φ_y
Z
Y X
6/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL15/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Moment My in node N3=5,759 KN.m
Vertical displacement in node N3 = -6,844mm
Vertical displacement in node N1= -7,854mm
Rotation Ry in node N1=0,706mrad
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL16/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simple beam on bidirectional, elastic foundation (Winkler’s foundation)
elastic, linear, isotropic material
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data
[m] [m] [m]
N1 0.000 0.000 0.000 B1 Sn1
N2 4.967 0.000 0.000 B1 Sn2
N3 2.484 0.000 0.000 B1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Full rectangular (186; 186) S 235 4.967 N1 N2 general (0)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Free Free Free
Sn2 N2 GCS Standard Rigid Rigid Rigid Free Free Free
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 4.967 | 0.000 | 0.000 | B1 | Sn2 |
| N3 | 2.484 | 0.000 | 0.000 | B1 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Full rectangular (186; 186) | S 235 | 4.967 | N1 | N2 | general (0) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Free | Free | Free |
| Sn2 | N2 | GCS | Standard | Rigid | Rigid | Rigid | Free | Free | Free |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL16/89
Current date 21.10.2025
2.6. Cross-sections
Type Full rectangular
Detailed 186; 186
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 3.4641e-02
Ay [m2], Az [m2] 2.8868e-02 2.8868e-02
AL [m2/m], AD [m2/m] 7.4448e-01 7.4448e-01
cY.UCS [mm], cZ.UCS [mm] 93 93
α [deg] 0.00
Iy [m4], Iz [m4] 1.0000e-04 1.0000e-04
iy [mm], iz [mm] 54 54
Wel.y [m3], Wel.z [m3] 1.0746e-03 1.0746e-03
Wpl.y [m3], Wpl.z [m3] 1.6119e-03 1.6119e-03
Mpl.y.+ [Nm], Mpl.y.- [Nm] 378785.90 378785.90
Mpl.z.+ [Nm], Mpl.z.- [Nm] 378785.90 378785.90
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.6888e-04 0.0000e+00
βy [mm], βz [mm] 0 0
2/6

| CS1 |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 186; 186 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 3.4641e-02 |  |
| Ay [m2], Az [m2] | 2.8868e-02 | 2.8868e-02 |
| AL [m2/m], AD [m2/m] | 7.4448e-01 | 7.4448e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 93 | 93 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.0000e-04 | 1.0000e-04 |
| iy [mm], iz [mm] | 54 | 54 |
| Wel.y [m3], Wel.z [m3] | 1.0746e-03 | 1.0746e-03 |
| Wpl.y [m3], Wpl.z [m3] | 1.6119e-03 | 1.6119e-03 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 378785.90 | 378785.90 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 378785.90 | 378785.90 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.6888e-04 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL16/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
Y
X
3.2. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[kN]
Load case Dir Type Orig Regularly
Fb1 B1 GCS -10.0000 0.500 Rela 1
LC2 - Permanent Z Force From start
3.3. Moment on beam
Name Member System Value - M Pos x Coor Rep (n)
[kNm]
Load case Dir Type Orig dx
M1 B1 LCS 15.0000 0.000 Rela 1
LC2 - Permanent My Moment From start 0.100
M2 B1 LCS -15.0000 1.000 Rela 1
LC2 - Permanent My Moment From start 0.100
3.4. Line force
Name Member Type Dir Value - P1 Pos x1 Coor Orig Ecc ey
[kN/m] [m]
Load case System Distribution Value - P2 Pos x2 Loc Ecc ez
[kN/m] [m]
LF1 B1 Force Z -5.0000 0.000 Rela From start 0.000
LC2 - Permanent LCS Uniform 1.000 Length 0.000
3/6

| Name | Member | System | Value - F
[kN] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb1 | B1 | GCS | -10.0000 | 0.500 | Rela | 1 |
|  | LC2 - Permanent | Z | Force |  | From start |  |


| Name | Member | System | Value - M
[kNm] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | dx |
| M1 | B1 | LCS | 15.0000 | 0.000 | Rela | 1 |
|  | LC2 - Permanent | My | Moment |  | From start | 0.100 |
| M2 | B1 | LCS | -15.0000 | 1.000 | Rela | 1 |
|  | LC2 - Permanent | My | Moment |  | From start | 0.100 |


| Name | Member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Coor | Orig | Ecc ey
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Loc |  | Ecc ez
[m] |
| LF1 | B1 | Force | Z | -5.0000 | 0.000 | Rela | From start | 0.000 |
|  | LC2 - Permanent | LCS | Uniform |  | 1.000 | Length |  | 0.000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL16/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N1, N3
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N3 LC2 0.000 0.000 -4.233 0.0 0.0 0.0 4.233
N1 LC2 0.000 0.000 0.000 0.0 3.0 0.0 0.000
4.2. 1D internal forces
Linear calculation
Load case: LC2
Coordinate system: Principal
Extreme 1D: Global
Selection: B1
Filter: Cross-section = CS1 - Full rectangular (186; 186)
Selected sections: Inputted
Name dx Case Cross-section N Vy Vz Mx My Mz
[m] [kN] [kN] [kN] [kNm] [kNm] [kNm]
B1 2.484+ LC2 CS1 - Full 0.0000 0.0000 -5.0747 0.0000 33.8379 0.0000
rectangular
(186; 186)
B1 2.484- LC2 CS1 - Full 0.0000 0.0000 5.0747 0.0000 33.8379 0.0000
rectangular
(186; 186)
4.3. 1D internal forces; M_y
Z
Y X
4/6

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N3 | LC2 | 0.000 | 0.000 | -4.233 | 0.0 | 0.0 | 0.0 | 4.233 |
| N1 | LC2 | 0.000 | 0.000 | 0.000 | 0.0 | 3.0 | 0.0 | 0.000 |


| Name | dx
[m] | Case | Cross-section | N
[kN] | Vy
[kN] | Vz
[kN] | Mx
[kNm] | My
[kNm] | Mz
[kNm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 2.484+ | LC2 | CS1 - Full
rectangular
(186; 186) | 0.0000 | 0.0000 | -5.0747 | 0.0000 | 33.8379 | 0.0000 |
| B1 | 2.484- | LC2 | CS1 - Full
rectangular
(186; 186) | 0.0000 | 0.0000 | 5.0747 | 0.0000 | 33.8379 | 0.0000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL16/89
Current date 21.10.2025
4.4. Reactions
Linear calculation
Load case: LC2
System: Global
Extreme: Global
Selection: Sn1
Nodal reactions
Name Case Rx Ry Rz Mx My Mz ex ey E/W/N
[kN] [kN] [kN] [kNm] [kNm] [kNm] [mm] [mm]
Sn1/N1 LC2 0.0000 0.0000 11.6773 0.0000 0.0000 0.0000 0.000 0.000 N_RES_OVER01
4.5. Reactions; R_z
Z
Y X
5/6

| Name | Case | Rx
[kN] | Ry
[kN] | Rz
[kN] | Mx
[kNm] | My
[kNm] | Mz
[kNm] | ex
[mm] | ey
[mm] | E/W/N |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1/N1 | LC2 | 0.0000 | 0.0000 | 11.6773 | 0.0000 | 0.0000 | 0.0000 | 0.000 | 0.000 | N_RES_OVER01 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SSLL16/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Rotation Ry in node N1 = -3,045 mrad
Displacement uz in node N3 =-4,23326mm
Moment My in node N3 = -33,84N.m
Vertical reaction in node N1 = 11,674KN
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Rectangular membrane under in-plane shear
Specification: Rectangular shell: in-plane bending and shear.
2. MODEL
2.1. Analysis model
2.2. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 1
2.3. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
2.4. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 3.0000e+04 0.25 0 40 235.0 360.0
1.2000e+04 0.01e-003 40 80 215.0 360.0
1/5

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 1 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 3.0000e+04 | 0.25 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 1.2000e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |



## Sayfa 111

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP01/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y
X
3.2. Line force on 2D member edge
Name 2D member Type Dir Value - P1 Pos x1 Loc Edge
[N/m]
Load case System Distribution Value - P2 Pos x2 Coor Orig
[N/m]
LFS2 D1 Force Z -1379.31 0.100 Length 2
LC2 - Permanent GCS Trapez -2758.62 0.200 Rela From start
LFS3 D1 Force Z -2758.62 0.200 Length 2
LC2 - Permanent GCS Trapez -4137.93 0.300 Rela From start
LFS4 D1 Force Z -4137.93 0.300 Length 2
LC2 - Permanent GCS Trapez -5517.24 0.400 Rela From start
LFS5 D1 Force Z -5517.24 0.400 Length 2
LC2 - Permanent GCS Trapez -5747.13 0.500 Rela From start
LFS7 D1 Force Z -1379.31 0.100 Length 2
LC2 - Permanent GCS Trapez -2758.62 0.200 Rela From end
LFS8 D1 Force Z -2758.62 0.200 Length 2
LC2 - Permanent GCS Trapez -4137.93 0.300 Rela From end
LFS9 D1 Force Z -4137.93 0.300 Length 2
LC2 - Permanent GCS Trapez -5517.24 0.400 Rela From end
LFS10 D1 Force Z -5517.24 0.400 Length 2
LC2 - Permanent GCS Trapez -5747.13 0.500 Rela From end
LFS20 D1 Force Z 0.00 0.000 Length 2
LC2 - Permanent GCS Trapez -1379.31 0.100 Rela From start
LFS21 D1 Force Z 0.00 0.000 Length 2
LC2 - Permanent GCS Trapez -1379.31 0.100 Rela From end
2/5

| Name | 2D member | Type | Dir | Value - P1
[N/m] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[N/m] | Pos x2 | Coor | Orig |
| LFS2 | D1 | Force | Z | -1379.31 | 0.100 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -2758.62 | 0.200 | Rela | From start |
| LFS3 | D1 | Force | Z | -2758.62 | 0.200 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -4137.93 | 0.300 | Rela | From start |
| LFS4 | D1 | Force | Z | -4137.93 | 0.300 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -5517.24 | 0.400 | Rela | From start |
| LFS5 | D1 | Force | Z | -5517.24 | 0.400 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -5747.13 | 0.500 | Rela | From start |
| LFS7 | D1 | Force | Z | -1379.31 | 0.100 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -2758.62 | 0.200 | Rela | From end |
| LFS8 | D1 | Force | Z | -2758.62 | 0.200 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -4137.93 | 0.300 | Rela | From end |
| LFS9 | D1 | Force | Z | -4137.93 | 0.300 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -5517.24 | 0.400 | Rela | From end |
| LFS10 | D1 | Force | Z | -5517.24 | 0.400 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -5747.13 | 0.500 | Rela | From end |
| LFS20 | D1 | Force | Z | 0.00 | 0.000 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -1379.31 | 0.100 | Rela | From start |
| LFS21 | D1 | Force | Z | 0.00 | 0.000 | Length | 2 |
|  | LC2 - Permanent | GCS | Trapez | -1379.31 | 0.100 | Rela | From end |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP01/89
Current date 21.10.2025
4. RESULTS
4.1. 2D stress/strain; σ_x+
Z
Y X
4.2. 2D stress/strain; τ_xy+
Z
Y
X
3/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP01/89
Current date 21.10.2025
4.3. Displacement of nodes; U_z
Z
Y X
4.4. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N2, N3
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N3 LC2 0.064 0.000 -0.356 0.0 10.9 0.0 0.361
N2 LC2 -0.064 0.000 -0.356 0.0 10.9 0.0 0.361
4/5

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N3 | LC2 | 0.064 | 0.000 | -0.356 | 0.0 | 10.9 | 0.0 | 0.361 |
| N2 | LC2 | -0.064 | 0.000 | -0.356 | 0.0 | 10.9 | 0.0 | 0.361 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Max vertical displacement at free end = 0,3573 mm
Max sigmaX stress at fixed end = 80 MPa
Max sigmaXY stress at free end = 5 Mpa
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP02/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Tension of perforated membrane
Specification: Simple tension of perforated membrane.
2. MODEL
2.1. Analysis model
Y X
2.2. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D5 Calque1 plate (90) Standard S 235 constant 1
2.3. Supports on 2D member edge
Name Edge Orig Pos x1 X Y Z Rx Ry Rz
Coor Pos x2
Sle8 1 From start 0.000 Free Rigid Rigid Rigid Rigid Rigid
Rela 1.000
Sle9 1 From start 0.000 Rigid Rigid Free Rigid Rigid Rigid
Rela 1.000
2.4. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [N/mm2] [N/mm2]
Gmod α
[MPa] [m/mK]
S 235 7850.00 3.0000e+04 0.25 0 40 235.0 360.0
1.2000e+04 0.01e-003 40 80 215.0 360.0
1/5

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D5 | Calque1 | plate (90) | Standard | S 235 | constant | 1 |


| Name | Edge | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Coor | Pos x2 |  |  |  |  |  |  |
| Sle8 | 1 | From start | 0.000 | Free | Rigid | Rigid | Rigid | Rigid | Rigid |
|  |  | Rela | 1.000 |  |  |  |  |  |  |
| Sle9 | 1 | From start | 0.000 | Rigid | Rigid | Free | Rigid | Rigid | Rigid |
|  |  | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[N/mm2] | Fu
[N/mm2] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 3.0000e+04 | 0.25 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 1.2000e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP02/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y X
3.2. Line force on 2D member edge
Name 2D member Type Dir Value - P1 Pos x1 Loc Edge
[N/mm]
Load case System Distribution Value - P2 Pos x2 Coor Orig
[N/mm]
LFS3 D5 Force Z 2.50 0.000 Length 2
LC2 - Permanent GCS Uniform 1.000 Rela From end
2/5

| Name | 2D member | Type | Dir | Value - P1
[N/mm] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[N/mm] | Pos x2 | Coor | Orig |
| LFS3 | D5 | Force | Z | 2.50 | 0.000 | Length | 2 |
|  | LC2 - Permanent | GCS | Uniform |  | 1.000 | Rela | From end |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP02/89
Current date 21.10.2025
4. RESULTS
4.1. 3D Stress (a,0)
Z
Y
X
4.2. 3D Stress (a,pi/2)
Z
Y
X
3/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP02/89
Current date 21.10.2025
4.3. 3D stress (a, pi/4)
Z
Y X
4.4. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: SE7, SE8
Location: In centres. System: LCS mesh element
Principal stress - Results on sections and edges:
Name Mesh Position Case σ1+ σ2+ σE+ α+ τmax,b
[mm] [N/mm2] [N/mm2] [N/mm2] [deg] [N/mm2]
σ1- σ2- σE- α-
[N/mm2] [N/mm2] [N/mm2] [deg]
SE8 Element: 54 260.631 LC2 -0.1 -1.7 1.6 88.74 0.0
0.000 -0.1 -1.7 1.6 88.74
61.000
SE8 Element: 30 260.631 LC2 -0.1 -2.6 2.5 -88.31 0.0
0.000 -0.1 -2.6 2.5 -88.31
60.000
SE7 Element: 2257 273.631 LC2 4.7 1.0 4.3 89.86 0.0
0.000 4.7 1.0 4.3 89.86
50.000
SE8 Element: 2426 260.631 LC2 0.4 -0.5 0.8 83.63 0.0
0.000 0.4 -0.5 0.8 83.63
64.000
SE7 Element: 50 270.631 LC2 7.5 0.3 7.3 87.59 0.0
0.000 7.5 0.3 7.3 87.59
50.000
4/5

| Name | Mesh | Position
[mm] | Case | σ1+
[N/mm2]
σ1-
[N/mm2] | σ2+
[N/mm2]
σ2-
[N/mm2] | σE+
[N/mm2]
σE-
[N/mm2] | α+
[deg]
α-
[deg] | τmax,b
[N/mm2] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SE8 | Element: 54 | 260.631
0.000
61.000 | LC2 | -0.1
-0.1 | -1.7
-1.7 | 1.6
1.6 | 88.74
88.74 | 0.0 |
| SE8 | Element: 30 | 260.631
0.000
60.000 | LC2 | -0.1
-0.1 | -2.6
-2.6 | 2.5
2.5 | -88.31
-88.31 | 0.0 |
| SE7 | Element: 2257 | 273.631
0.000
50.000 | LC2 | 4.7
4.7 | 1.0
1.0 | 4.3
4.3 | 89.86
89.86 | 0.0 |
| SE8 | Element: 2426 | 260.631
0.000
64.000 | LC2 | 0.4
0.4 | -0.5
-0.5 | 0.8
0.8 | 83.63
83.63 | 0.0 |
| SE7 | Element: 50 | 270.631
0.000
50.000 | LC2 | 7.5
7.5 | 0.3
0.3 | 7.3
7.3 | 87.59
87.59 | 0.0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLP02/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
For (a,0) (Node N22):
Sigma = 7,5 Mpa
For (a,PI/4) (Node N18):
Sigma = 2,5 Mpa
For (a,PI/2) (Node N28):
Sigma = -2,5 Mpa
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SLS01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Cantilever slab under uniform pressure
2. MODEL
2.1. Analysis model
2.2. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 5
2.3. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 N3 1.000 0.100 0.000 N5 0.000 0.200 0.000
N2 1.000 0.000 0.000 N4 1.000 0.200 0.000
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
5 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
1/4

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 5 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.000 | 0.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N3 | 1.000 | 0.100 | 0.000 |
| N4 | 1.000 | 0.200 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N5 | 0.000 | 0.200 | 0.000 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 5 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |



## Sayfa 121

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SLS01/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
Y
X
3.2. Surface load
Name Dir Type Value 2D member Load case System Loc
[kN/m2]
SF1 Z Force -1.70 D1 LC2 - permanent LCS Length
2/4

| Name | Dir | Type | Value
[kN/m2] | 2D member | Load case | System | Loc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SF1 | Z | Force | -1.70 | D1 | LC2 - permanent | LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SLS01/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N2, N4
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N4 LC2 0.0 0.0 -94.8 0.1 127.1 0.0 94.8
N2 LC2 0.0 0.0 -94.8 -0.1 127.1 0.0 94.8
4.2. 2D displacement; u_z
Z
Y
X
3/4

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N4 | LC2 | 0.0 | 0.0 | -94.8 | 0.1 | 127.1 | 0.0 | 94.8 |
| N2 | LC2 | 0.0 | 0.0 | -94.8 | -0.1 | 127.1 | 0.0 | 94.8 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SLS01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Vertical displacement uz in node N2 &N4 = -97,3 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
4/4

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS02_89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simply supported square plate under self weight
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 N4 1.000 0.000 0.000 N7 0.000 0.500 0.000
N2 0.000 1.000 0.000 N5 0.500 0.000 0.000 N8 1.000 0.500 0.000
N3 1.000 1.000 0.000 N6 0.500 1.000 0.000 N9 0.500 0.500 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 10
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Free Rigid Rigid Free Free Free
1 Rela 1.000
Sle2 D1 From start 0.000 Free Rigid Rigid Free Free Free
2 Rela 1.000
Sle3 D1 From start 0.000 Free Rigid Rigid Free Free Free
3 Rela 1.000
Sle4 D1 From start 0.000 Free Rigid Rigid Free Free Free
4 Rela 1.000
1/4

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 0.000 | 1.000 | 0.000 |
| N3 | 1.000 | 1.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N4 | 1.000 | 0.000 | 0.000 |
| N5 | 0.500 | 0.000 | 0.000 |
| N6 | 0.500 | 1.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N7 | 0.000 | 0.500 | 0.000 |
| N8 | 1.000 | 0.500 | 0.000 |
| N9 | 0.500 | 0.500 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Free | Rigid | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | D1 | From start | 0.000 | Free | Rigid | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | D1 | From start | 0.000 | Free | Rigid | Rigid | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | D1 | From start | 0.000 | Free | Rigid | Rigid | Free | Free | Free |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS02_89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7950.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2/4

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7950.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS02_89
Current date 21.10.2025
3. RESULTS
3.1. Displacement of nodes
Linear calculation
Load case: LC1
Extreme: Global
Selection: N9
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N9 LC1 0.000 0.000 -0.166 0.0 0.0 0.0 0.166
3.2. 2D displacement; u_z
Z
Y
X
3/4

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N9 | LC1 | 0.000 | 0.000 | -0.166 | 0.0 | 0.0 | 0.0 | 0.166 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS02_89
Current date 21.10.2025
4. EXPECTED AFNOR RESULTS
Vertical displacement uz in node N9= -0,158 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
4/4

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS03/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Circular plate with clamped edges under uniform load
2. MODEL
2.1. Analysis model
2.2. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 5
2.3. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 1.000
2.4. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
1/4

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 5 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS03/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
X
Y
3.2. Surface load
Name Dir Type Value 2D member Load case System Loc
[kN/m2]
SF1 Z Force -1.00 D1 LC2 - PERMANENT LCS Length
2/4

| Name | Dir | Type | Value
[kN/m2] | 2D member | Load case | System | Loc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SF1 | Z | Force | -1.00 | D1 | LC2 - PERMANENT | LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS03/89
Current date 21.10.2025
4. RESULTS
4.1. 2D displacement; u_z
Z
Y
X
4.2. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N2
Name Case Ux Uy Uz Φx Φy Φz Utotal
[mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
N2 LC2 0.0 0.0 -6.5 0.0 0.0 0.0 6.5
3/4

| Name | Case | Ux
[mm] | Uy
[mm] | Uz
[mm] | Φx
[mrad] | Φy
[mrad] | Φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N2 | LC2 | 0.0 | 0.0 | -6.5 | 0.0 | 0.0 | 0.0 | 6.5 |



## Sayfa 131

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS03/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Vertical displacement uz in node N2 (the center) = -6,5 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
4/4

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS04/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Beam of Z-section
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N14 -3.000 3.000 0.000 N17 -3.000 4.000 0.000 N28 7.000 3.577 1.000
N15 7.000 3.000 0.000 N18 -3.000 2.577 1.000 N29 -3.000 3.577 1.000
N16 7.000 4.000 0.000 N19 7.000 2.577 1.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D4 Calque1 plate (90) Standard S 235 constant 10
D5 Calque1 plate (90) Standard S 235 constant 10
D6 Calque1 plate (90) Standard S 235 constant 10
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle9 D4 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.200
Sle10 D4 From start 0.200 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.400
Sle11 D4 From start 0.400 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.600
Sle12 D4 From start 0.600 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.800
Sle13 D4 From start 0.800 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle14 D5 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.200
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N14 | -3.000 | 3.000 | 0.000 |
| N15 | 7.000 | 3.000 | 0.000 |
| N16 | 7.000 | 4.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N17 | -3.000 | 4.000 | 0.000 |
| N18 | -3.000 | 2.577 | 1.000 |
| N19 | 7.000 | 2.577 | 1.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N28 | 7.000 | 3.577 | 1.000 |
| N29 | -3.000 | 3.577 | 1.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D4 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |
| D5 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |
| D6 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle9 | D4 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.200 |  |  |  |  |  |  |
| Sle10 | D4 | From start | 0.200 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.400 |  |  |  |  |  |  |
| Sle11 | D4 | From start | 0.400 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.600 |  |  |  |  |  |  |
| Sle12 | D4 | From start | 0.600 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.800 |  |  |  |  |  |  |
| Sle13 | D4 | From start | 0.800 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle14 | D5 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.200 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS04/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle15 D5 From start 0.200 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.400
Sle16 D5 From start 0.400 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.600
Sle17 D5 From start 0.600 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 0.800
Sle18 D5 From start 0.800 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle19 D6 From start 0.800 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 1.000
Sle20 D6 From start 0.600 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 0.800
Sle21 D6 From start 0.400 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 0.600
Sle22 D6 From start 0.200 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 0.400
Sle23 D6 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 0.200
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2/5

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle15 | D5 | From start | 0.200 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.400 |  |  |  |  |  |  |
| Sle16 | D5 | From start | 0.400 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.600 |  |  |  |  |  |  |
| Sle17 | D5 | From start | 0.600 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 0.800 |  |  |  |  |  |  |
| Sle18 | D5 | From start | 0.800 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle19 | D6 | From start | 0.800 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle20 | D6 | From start | 0.600 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 0.800 |  |  |  |  |  |  |
| Sle21 | D6 | From start | 0.400 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 0.600 |  |  |  |  |  |  |
| Sle22 | D6 | From start | 0.200 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 0.400 |  |  |  |  |  |  |
| Sle23 | D6 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 0.200 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS04/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
Z
X
3.2. Line force on 2D member edge
Name 2D member Type Dir Value - P1 Pos x1 Loc Edge
[kN/m]
Load case System Distribution Value - P2 Pos x2 Coor Orig
[kN/m]
LFS3 D4 Force Y -10.00 0.000 Length 2
LC2 - Permanent LCS Uniform 1.000 Rela From start
LFS4 D5 Force Y 10.00 0.000 Length 2
LC2 - Permanent LCS Uniform 1.000 Rela From start
3/5

| Name | 2D member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Coor | Orig |
| LFS3 | D4 | Force | Y | -10.00 | 0.000 | Length | 2 |
|  | LC2 - Permanent | LCS | Uniform |  | 1.000 | Rela | From start |
| LFS4 | D5 | Force | Y | 10.00 | 0.000 | Length | 2 |
|  | LC2 - Permanent | LCS | Uniform |  | 1.000 | Rela | From start |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS04/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes; U_y
Z
Y
X
4.2. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Node
Selection: N19
Name Case Uy
[mm]
N19 LC2 6.9
4/5

| Name | Case | Uy
[mm] |
| --- | --- | --- |
| N19 | LC2 | 6.9 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS04/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement uy in node N19= -7,15 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS05/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Shell - Box section - Shear - Torsion.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 N7 1.000 0.100 0.100 N13 0.500 0.050 0.100
N2 1.000 0.000 0.000 N8 0.000 0.100 0.100 N14 0.800 0.000 0.000
N3 1.000 0.100 0.000 N9 0.500 0.100 0.100 N15 0.800 0.000 0.100
N4 0.000 0.100 0.000 N10 0.500 0.000 0.100 N16 0.800 0.000 0.050
N5 0.000 0.000 0.100 N11 0.000 0.050 0.100
N6 1.000 0.000 0.100 N12 1.000 0.050 0.100
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 5
D2 Calque1 plate (90) Standard S 235 constant 5
D3 Calque1 plate (90) Standard S 235 constant 5
D4 Calque1 plate (90) Standard S 235 constant 5
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D2 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle2 D3 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 1.000
Sle3 D4 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 1.000
Sle4 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.000 | 0.000 | 0.000 |
| N3 | 1.000 | 0.100 | 0.000 |
| N4 | 0.000 | 0.100 | 0.000 |
| N5 | 0.000 | 0.000 | 0.100 |
| N6 | 1.000 | 0.000 | 0.100 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N7 | 1.000 | 0.100 | 0.100 |
| N8 | 0.000 | 0.100 | 0.100 |
| N9 | 0.500 | 0.100 | 0.100 |
| N10 | 0.500 | 0.000 | 0.100 |
| N11 | 0.000 | 0.050 | 0.100 |
| N12 | 1.000 | 0.050 | 0.100 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N13 | 0.500 | 0.050 | 0.100 |
| N14 | 0.800 | 0.000 | 0.000 |
| N15 | 0.800 | 0.000 | 0.100 |
| N16 | 0.800 | 0.000 | 0.050 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 5 |
| D2 | Calque1 | plate (90) | Standard | S 235 | constant | 5 |
| D3 | Calque1 | plate (90) | Standard | S 235 | constant | 5 |
| D4 | Calque1 | plate (90) | Standard | S 235 | constant | 5 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D2 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | D4 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS05/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.0 360.0
8.0769e+04 0.01e-003 40 80 215.0 360.0
2/5

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS05/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
3.2. Line force on 2D member edge
Name 2D member Type Dir Value - P1 Pos x1 Loc Edge
[kN/m]
Load case System Distribution Value - P2 Pos x2 Coor Orig
[kN/m]
LFS1 D2 Force Y -0.50 0.000 Length 2
LC2 - permanent GCS Uniform 1.000 Rela From start
LFS2 D3 Force Z -0.50 0.000 Length 3
LC2 - permanent GCS Uniform 1.000 Rela From start
LFS3 D1 Force Y 0.50 0.000 Length 2
LC2 - permanent GCS Uniform 1.000 Rela From start
LFS4 D4 Force Z 0.50 0.000 Length 3
LC2 - permanent GCS Uniform 1.000 Rela From start
3/5

| Name | 2D member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Coor | Orig |
| LFS1 | D2 | Force | Y | -0.50 | 0.000 | Length | 2 |
|  | LC2 - permanent | GCS | Uniform |  | 1.000 | Rela | From start |
| LFS2 | D3 | Force | Z | -0.50 | 0.000 | Length | 3 |
|  | LC2 - permanent | GCS | Uniform |  | 1.000 | Rela | From start |
| LFS3 | D1 | Force | Y | 0.50 | 0.000 | Length | 2 |
|  | LC2 - permanent | GCS | Uniform |  | 1.000 | Rela | From start |
| LFS4 | D4 | Force | Z | 0.50 | 0.000 | Length | 3 |
|  | LC2 - permanent | GCS | Uniform |  | 1.000 | Rela | From start |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS05/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Node
Selection: N13, N16
Name Case Uy Uz Φx
[mm] [mm] [mrad]
N13 LC2 -0.0006160 0.0000000 0.0123250
N16 LC2 0.0000000 -0.0009860 0.0197290
4/5

| Name | Case | Uy
[mm] | Uz
[mm] | Φx
[mrad] |
| --- | --- | --- | --- | --- |
| N13 | LC2 | -0.0006160 | 0.0000000 | 0.0123250 |
| N16 | LC2 | 0.0000000 | -0.0009860 | 0.0197290 |



## Sayfa 141

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS05/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement uy in node N13= -0,617 e-3 mm
Rotation Φx in node N13=0,0123 e-3 rad
Displacement uZ in node N16= -0,987 e-3 mm
Rotation Φx in node N13 =0,0197 e-3 rad
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Thin-walled cylinder under uniform radial pressure
Specification: Shell - Cylinder - Material: elastic - Pressure
2. MODEL
2.1. Analysis model
2.2. @{EP_StructureESAM.IDS_NODE}
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N13 -0.707 0.707 0.000 N19 0.293 1.707 0.000 N25 1.000 1.414 0.000
N14 1.293 0.707 0.000 N20 0.293 1.707 4.000 N26 1.000 1.414 4.000
N15 0.293 -0.293 0.000 N21 1.000 0.000 0.000 N27 -0.414 1.414 0.000
N16 1.293 0.707 4.000 N22 1.000 0.000 4.000 N28 -0.414 1.414 4.000
N17 -0.707 0.707 4.000 N23 -0.414 0.000 0.000
N18 0.293 -0.293 4.000 N24 -0.414 0.000 4.000
2.3. @{EP_StructureESAM.IDS_SLAB}
Name Layer Type Element type Material Thickness type Th.
[mm]
D6 Calque1 wall (80) Standard S 235 constant 20
D7 Calque1 wall (80) Standard S 235 constant 20
D8 Calque1 wall (80) Standard S 235 constant 20
D9 Calque1 wall (80) Standard S 235 constant 20
2.4. @{EP_StructureESAM.IDS_LINE_SURFACE_SUPPORT}
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle11 D6 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle12 D8 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle13 D9 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle14 D7 From start 0.000 Flexible Flexible Rigid Free Free Free
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N13 | -0.707 | 0.707 | 0.000 |
| N14 | 1.293 | 0.707 | 0.000 |
| N15 | 0.293 | -0.293 | 0.000 |
| N16 | 1.293 | 0.707 | 4.000 |
| N17 | -0.707 | 0.707 | 4.000 |
| N18 | 0.293 | -0.293 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N19 | 0.293 | 1.707 | 0.000 |
| N20 | 0.293 | 1.707 | 4.000 |
| N21 | 1.000 | 0.000 | 0.000 |
| N22 | 1.000 | 0.000 | 4.000 |
| N23 | -0.414 | 0.000 | 0.000 |
| N24 | -0.414 | 0.000 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N25 | 1.000 | 1.414 | 0.000 |
| N26 | 1.000 | 1.414 | 4.000 |
| N27 | -0.414 | 1.414 | 0.000 |
| N28 | -0.414 | 1.414 | 4.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D6 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D7 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D8 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D9 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle11 | D6 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle12 | D8 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle13 | D9 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle14 | D7 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
1 Rela 1.000
2.5. @{ProjectESA.IDS_MATERIAL}
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [kPa] [kPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235000.000 360000.000
8.0769e+04 0.01e-003 40 80 215000.000 360000.000
2/7

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[kPa] | Fu
[kPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235000.000 | 360000.000 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215000.000 | 360000.000 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
Y
3.2. @{LoadESACmdsM.IDS_LOADCMDS_SFF}
Name Load case Dir Type Distribution q Validity Select System Location
[kN/m2]
FF1 LC2 - Permanent Z Force Uniform 10.00 All Auto Member LCS Length
3/7

| Name | Load case | Dir | Type | Distribution | q
[kN/m2] | Validity | Select | System | Location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FF1 | LC2 - Permanent | Z | Force | Uniform | 10.00 | All | Auto | Member LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
4. RESULTS
4.1. 2D stress/strain; σ_x+
Z
Y X
4.2. 2D stress/strain; σ_y+
Z
Y X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
4.3. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In centres. System: LCS mesh element
Basic stress
Name Mesh Position Case σx+ σy+ τxy+ τxz τyz
[m] [kPa] [kPa] [kPa] [kPa] [kPa]
σx- σy- τxy-
[kPa] [kPa] [kPa]
D6 Element: 1684 0.362 LC2 499.976 0.000 0.000 0.000 0.000
-0.290 499.976 0.000 0.000
0.430
D6 Element: 321 0.303 LC2 499.976 0.000 0.000 0.000 0.000
-0.293 499.976 0.000 0.000
0.090
D6 Element: 1 0.303 LC2 499.976 0.000 0.000 0.000 0.000
-0.293 499.976 0.000 0.000
0.010
D6 Element: 641 0.303 LC2 499.976 0.000 0.000 0.000 0.000
-0.293 499.976 0.000 0.000
0.170
4.4. 2D displacement
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Name Mesh Position Case ux uy uz φx φy φz Utotal
[m] [mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
D6 Element: 0.313 LC2 0.00000 -0.00286 0.00238 0.0 0.0 0.0 0.00372
15921 -0.293
Node: 4.000
16201
D6 Element: 1 0.293 LC2 0.00000 0.00000 0.00238 0.0 0.0 0.0 0.00238
Node: 1 -0.293
5/7

| Name | Mesh | Position
[m] | Case | σx+
[kPa]
σx-
[kPa] | σy+
[kPa]
σy-
[kPa] | τxy+
[kPa]
τxy-
[kPa] | τxz
[kPa] | τyz
[kPa] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D6 | Element: 1684 | 0.362
-0.290
0.430 | LC2 | 499.976
499.976 | 0.000
0.000 | 0.000
0.000 | 0.000 | 0.000 |
| D6 | Element: 321 | 0.303
-0.293
0.090 | LC2 | 499.976
499.976 | 0.000
0.000 | 0.000
0.000 | 0.000 | 0.000 |
| D6 | Element: 1 | 0.303
-0.293
0.010 | LC2 | 499.976
499.976 | 0.000
0.000 | 0.000
0.000 | 0.000 | 0.000 |
| D6 | Element: 641 | 0.303
-0.293
0.170 | LC2 | 499.976
499.976 | 0.000
0.000 | 0.000
0.000 | 0.000 | 0.000 |


| Name | Mesh | Position
[m] | Case | ux
[mm] | uy
[mm] | uz
[mm] | φx
[mrad] | φy
[mrad] | φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D6 | Element:
15921
Node:
16201 | 0.313
-0.293
4.000 | LC2 | 0.00000 | -0.00286 | 0.00238 | 0.0 | 0.0 | 0.0 | 0.00372 |
| D6 | Element: 1
Node: 1 | 0.293
-0.293
0.000 | LC2 | 0.00000 | 0.00000 | 0.00238 | 0.0 | 0.0 | 0.0 | 0.00238 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
4.5. 2D displacement; u_y
Z
Y X
4.6. 2D displacement; u_z
Z
Y X
6/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
σx = 500 kPa
σy = 0 kPa
Radial displacement = 2,38*e-3 mm
Vertical displacement = -2,86*e-3 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Thin-walled cylinder under uniform axial load
Specification: Shell - Cylinder - Material: elastic - axial load
2. MODEL
2.1. Analysis model
2.2. @{EP_StructureESAM.IDS_NODE}
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N13 -0.707 0.707 0.000 N19 0.293 1.707 0.000 N25 1.000 1.414 0.000
N14 1.293 0.707 0.000 N20 0.293 1.707 4.000 N26 1.000 1.414 4.000
N15 0.293 -0.293 0.000 N21 1.000 0.000 0.000 N27 -0.414 1.414 0.000
N16 1.293 0.707 4.000 N22 1.000 0.000 4.000 N28 -0.414 1.414 4.000
N17 -0.707 0.707 4.000 N23 -0.414 0.000 0.000
N18 0.293 -0.293 4.000 N24 -0.414 0.000 4.000
2.3. @{EP_StructureESAM.IDS_SLAB}
Name Layer Type Element type Material Thickness type Th.
[mm]
D6 Calque1 wall (80) Standard S 235 constant 20
D7 Calque1 wall (80) Standard S 235 constant 20
D8 Calque1 wall (80) Standard S 235 constant 20
D9 Calque1 wall (80) Standard S 235 constant 20
2.4. @{EP_StructureESAM.IDS_LINE_SURFACE_SUPPORT}
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle11 D6 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle12 D8 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle13 D9 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle14 D7 From start 0.000 Flexible Flexible Rigid Free Free Free
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N13 | -0.707 | 0.707 | 0.000 |
| N14 | 1.293 | 0.707 | 0.000 |
| N15 | 0.293 | -0.293 | 0.000 |
| N16 | 1.293 | 0.707 | 4.000 |
| N17 | -0.707 | 0.707 | 4.000 |
| N18 | 0.293 | -0.293 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N19 | 0.293 | 1.707 | 0.000 |
| N20 | 0.293 | 1.707 | 4.000 |
| N21 | 1.000 | 0.000 | 0.000 |
| N22 | 1.000 | 0.000 | 4.000 |
| N23 | -0.414 | 0.000 | 0.000 |
| N24 | -0.414 | 0.000 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N25 | 1.000 | 1.414 | 0.000 |
| N26 | 1.000 | 1.414 | 4.000 |
| N27 | -0.414 | 1.414 | 0.000 |
| N28 | -0.414 | 1.414 | 4.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D6 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D7 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D8 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D9 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle11 | D6 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle12 | D8 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle13 | D9 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle14 | D7 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
1 Rela 1.000
2.5. @{ProjectESA.IDS_MATERIAL}
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [kPa] [kPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235000.000 360000.000
8.0769e+04 0.01e-003 40 80 215000.000 360000.000
2/7

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[kPa] | Fu
[kPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235000.000 | 360000.000 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215000.000 | 360000.000 |  |  |  |



## Sayfa 151

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
Y
3.2. @{LoadESACmdsM.IDS_LOADCMDS_LFS}
Name 2D member Type Dir Value - P1 Pos x1 Loc Edge
[kN/m]
Load case System Distribution Value - P2 Pos x2 Coor Orig
[kN/m]
LFS1 D7 Force Z 10.00 0.000 Length 3
LC2 - Permanent GCS Uniform 1.000 Rela From start
LFS2 D8 Force Z 10.00 0.000 Length 3
LC2 - Permanent GCS Uniform 1.000 Rela From start
LFS3 D9 Force Z 10.00 0.000 Length 3
LC2 - Permanent GCS Uniform 1.000 Rela From start
LFS4 D6 Force Z 10.00 0.000 Length 3
LC2 - Permanent GCS Uniform 1.000 Rela From start
3/7

| Name | 2D member | Type | Dir | Value - P1
[kN/m] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[kN/m] | Pos x2 | Coor | Orig |
| LFS1 | D7 | Force | Z | 10.00 | 0.000 | Length | 3 |
|  | LC2 - Permanent | GCS | Uniform |  | 1.000 | Rela | From start |
| LFS2 | D8 | Force | Z | 10.00 | 0.000 | Length | 3 |
|  | LC2 - Permanent | GCS | Uniform |  | 1.000 | Rela | From start |
| LFS3 | D9 | Force | Z | 10.00 | 0.000 | Length | 3 |
|  | LC2 - Permanent | GCS | Uniform |  | 1.000 | Rela | From start |
| LFS4 | D6 | Force | Z | 10.00 | 0.000 | Length | 3 |
|  | LC2 - Permanent | GCS | Uniform |  | 1.000 | Rela | From start |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
4. RESULTS
4.1. 2D stress/strain; σ_x+
Z
Y X
4.2. 2D stress/strain; σ_y+
Z
Y X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
4.3. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In centres. System: LCS mesh element
Basic stress
Name Mesh Position Case σx+ σy+ τxy+ τxz τyz
[m] [kPa] [kPa] [kPa] [kPa] [kPa]
σx- σy- τxy-
[kPa] [kPa] [kPa]
D6 Element: 408 0.440 LC2 1.026 502.454 0.000 0.000 -0.135
-0.282 -0.446 497.546 0.000
0.110
D6 Element: 888 0.440 LC2 0.514 500.231 0.000 0.000 -0.047
-0.282 0.376 499.769 0.000
0.230
D6 Element: 1361 0.303 LC2 0.045 499.797 0.000 0.000 0.000
-0.293 0.167 500.203 0.000
0.350
D6 Element: 2 0.322 LC2 -0.767 504.770 0.000 0.000 -0.035
-0.292 -3.629 495.230 0.000
0.010
D6 Element: 4 0.362 LC2 -0.767 504.770 0.000 0.000 -0.035
-0.290 -3.629 495.230 0.000
0.010
D6 Element: 80 1.293 LC2 -0.767 504.771 0.000 0.000 -0.035
0.697 -3.629 495.230 0.000
0.010
D6 Element: 1 0.303 LC2 -0.767 504.771 0.000 0.000 -0.035
-0.293 -3.629 495.230 0.000
0.010
D6 Element: 327 0.420 LC2 0.953 503.007 0.000 0.000 -0.140
-0.285 -0.851 496.993 0.000
0.090
D6 Element: 1681 0.303 LC2 -0.038 499.865 0.000 0.000 0.006
-0.293 0.043 500.135 0.000
0.430
4.4. 2D displacement
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Name Mesh Position Case ux uy uz φx φy φz Utotal
[m] [mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
D6 Element: 1 0.313 LC2 0.00000 0.00005 -0.00072 0.0 0.0 0.0 0.00072
Node: 161 -0.293
0.020
D6 Element: 0.313 LC2 0.00000 0.00952 -0.00071 0.0 0.0 0.0 0.00955
15921 -0.293
Node: 4.000
16201
5/7

| Name | Mesh | Position
[m] | Case | σx+
[kPa]
σx-
[kPa] | σy+
[kPa]
σy-
[kPa] | τxy+
[kPa]
τxy-
[kPa] | τxz
[kPa] | τyz
[kPa] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D6 | Element: 408 | 0.440
-0.282
0.110 | LC2 | 1.026
-0.446 | 502.454
497.546 | 0.000
0.000 | 0.000 | -0.135 |
| D6 | Element: 888 | 0.440
-0.282
0.230 | LC2 | 0.514
0.376 | 500.231
499.769 | 0.000
0.000 | 0.000 | -0.047 |
| D6 | Element: 1361 | 0.303
-0.293
0.350 | LC2 | 0.045
0.167 | 499.797
500.203 | 0.000
0.000 | 0.000 | 0.000 |
| D6 | Element: 2 | 0.322
-0.292
0.010 | LC2 | -0.767
-3.629 | 504.770
495.230 | 0.000
0.000 | 0.000 | -0.035 |
| D6 | Element: 4 | 0.362
-0.290
0.010 | LC2 | -0.767
-3.629 | 504.770
495.230 | 0.000
0.000 | 0.000 | -0.035 |
| D6 | Element: 80 | 1.293
0.697
0.010 | LC2 | -0.767
-3.629 | 504.771
495.230 | 0.000
0.000 | 0.000 | -0.035 |
| D6 | Element: 1 | 0.303
-0.293
0.010 | LC2 | -0.767
-3.629 | 504.771
495.230 | 0.000
0.000 | 0.000 | -0.035 |
| D6 | Element: 327 | 0.420
-0.285
0.090 | LC2 | 0.953
-0.851 | 503.007
496.993 | 0.000
0.000 | 0.000 | -0.140 |
| D6 | Element: 1681 | 0.303
-0.293
0.430 | LC2 | -0.038
0.043 | 499.865
500.135 | 0.000
0.000 | 0.000 | 0.006 |


| Name | Mesh | Position
[m] | Case | ux
[mm] | uy
[mm] | uz
[mm] | φx
[mrad] | φy
[mrad] | φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D6 | Element: 1
Node: 161 | 0.313
-0.293
0.020 | LC2 | 0.00000 | 0.00005 | -0.00072 | 0.0 | 0.0 | 0.0 | 0.00072 |
| D6 | Element:
15921
Node:
16201 | 0.313
-0.293
4.000 | LC2 | 0.00000 | 0.00952 | -0.00071 | 0.0 | 0.0 | 0.0 | 0.00955 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
4.5. 2D displacement; u_y
Z
Y X
4.6. 2D displacement; u_z
Z
Y X
6/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS07/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
σx = 0 kPa
σy = 500 kPa
Radial displacement = -7.14*e-3 mm
Vertical displacement = 9.52*e-3 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Thin-walled cylinder under hydrostatic pressure
Specification: Shell - Cylinder - Material: elastic - Pressure
2. MODEL
2.1. Analysis model
2.2. @{EP_StructureESAM.IDS_NODE}
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N13 -0.707 0.707 0.000 N19 0.293 1.707 0.000 N25 1.000 1.414 0.000
N14 1.293 0.707 0.000 N20 0.293 1.707 4.000 N26 1.000 1.414 4.000
N15 0.293 -0.293 0.000 N21 1.000 0.000 0.000 N27 -0.414 1.414 0.000
N16 1.293 0.707 4.000 N22 1.000 0.000 4.000 N28 -0.414 1.414 4.000
N17 -0.707 0.707 4.000 N23 -0.414 0.000 0.000
N18 0.293 -0.293 4.000 N24 -0.414 0.000 4.000
2.3. @{EP_StructureESAM.IDS_SLAB}
Name Layer Type Element type Material Thickness type Th.
[mm]
D6 Calque1 wall (80) Standard S 235 constant 20
D7 Calque1 wall (80) Standard S 235 constant 20
D8 Calque1 wall (80) Standard S 235 constant 20
D9 Calque1 wall (80) Standard S 235 constant 20
2.4. @{EP_StructureESAM.IDS_LINE_SURFACE_SUPPORT}
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle11 D6 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle12 D8 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle13 D9 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle14 D7 From start 0.000 Flexible Flexible Rigid Free Free Free
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N13 | -0.707 | 0.707 | 0.000 |
| N14 | 1.293 | 0.707 | 0.000 |
| N15 | 0.293 | -0.293 | 0.000 |
| N16 | 1.293 | 0.707 | 4.000 |
| N17 | -0.707 | 0.707 | 4.000 |
| N18 | 0.293 | -0.293 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N19 | 0.293 | 1.707 | 0.000 |
| N20 | 0.293 | 1.707 | 4.000 |
| N21 | 1.000 | 0.000 | 0.000 |
| N22 | 1.000 | 0.000 | 4.000 |
| N23 | -0.414 | 0.000 | 0.000 |
| N24 | -0.414 | 0.000 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N25 | 1.000 | 1.414 | 0.000 |
| N26 | 1.000 | 1.414 | 4.000 |
| N27 | -0.414 | 1.414 | 0.000 |
| N28 | -0.414 | 1.414 | 4.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D6 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D7 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D8 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D9 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle11 | D6 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle12 | D8 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle13 | D9 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle14 | D7 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
1 Rela 1.000
2.5. @{ProjectESA.IDS_MATERIAL}
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [kPa] [kPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235000.000 360000.000
8.0769e+04 0.01e-003 40 80 215000.000 360000.000
2/7

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[kPa] | Fu
[kPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235000.000 | 360000.000 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215000.000 | 360000.000 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
Y
3.2. @{LoadESACmdsM.IDS_LOADCMDS_SFF}
Name Load case Dir Type Distribution q1 q2 Validity Select System Location
[kN/m2] [kN/m2]
FF1 LC2 - Permanent Z Force Dir Y 0.00 20.00 All Auto Member LCS Length
3/7

| Name | Load case | Dir | Type | Distribution | q1
[kN/m2] | q2
[kN/m2] | Validity | Select | System | Location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FF1 | LC2 - Permanent | Z | Force | Dir Y | 0.00 | 20.00 | All | Auto | Member LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
4. RESULTS
4.1. 2D stress/strain; σ_x+
Z
X
Y
4.2. 2D stress/strain; σ_y+
Z
Y X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
4.3. 2D displacement
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Results on sections:
Name Mesh Position Case uz
[m] [mm]
SE1 Element: 39921 0.293 LC2 0.00238
1.707
2.000
4.4. 2D displacement; u_z
Z
X
Y
5/7

| Name | Mesh | Position
[m] | Case | uz
[mm] |
| --- | --- | --- | --- | --- |
| SE1 | Element: 39921 | 0.293
1.707
2.000 | LC2 | 0.00238 |



## Sayfa 161

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
4.5. 2D displacement
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Name Mesh Position Case uy
[m] [mm]
D6 Element: 15761 0.313 LC2 -0.00286
Node: 16039 -0.293
3.960
D6 Element: 1 0.293 LC2 0.00000
Node: 1 -0.293
0.000
4.6. 2D displacement; u_z
Z
Y X
6/7

| Name | Mesh | Position
[m] | Case | uy
[mm] |
| --- | --- | --- | --- | --- |
| D6 | Element: 15761
Node: 16039 | 0.313
-0.293
3.960 | LC2 | -0.00286 |
| D6 | Element: 1
Node: 1 | 0.293
-0.293
0.000 | LC2 | 0.00000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS08/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
σx (at mid-height) = 500 kPa
σy (on whole height) = 0 kPa
Radial displacement (at mid-height) = 2,38*e-3 mm
Vertical displacement (at top) = -2,86*e-3 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Thin-walled cylinder under selfweight
Specification: Shell - Cylinder - Material: elastic
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N13 -0.707 0.707 0.000 N19 0.293 1.707 0.000 N25 1.000 1.414 0.000
N14 1.293 0.707 0.000 N20 0.293 1.707 4.000 N26 1.000 1.414 4.000
N15 0.293 -0.293 0.000 N21 1.000 0.000 0.000 N27 -0.414 1.414 0.000
N16 1.293 0.707 4.000 N22 1.000 0.000 4.000 N28 -0.414 1.414 4.000
N17 -0.707 0.707 4.000 N23 -0.414 0.000 0.000
N18 0.293 -0.293 4.000 N24 -0.414 0.000 4.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D6 Calque1 wall (80) Standard S 235 constant 20
D7 Calque1 wall (80) Standard S 235 constant 20
D8 Calque1 wall (80) Standard S 235 constant 20
D9 Calque1 wall (80) Standard S 235 constant 20
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle11 D6 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle12 D8 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle13 D9 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle14 D7 From start 0.000 Flexible Flexible Rigid Free Free Free
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N13 | -0.707 | 0.707 | 0.000 |
| N14 | 1.293 | 0.707 | 0.000 |
| N15 | 0.293 | -0.293 | 0.000 |
| N16 | 1.293 | 0.707 | 4.000 |
| N17 | -0.707 | 0.707 | 4.000 |
| N18 | 0.293 | -0.293 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N19 | 0.293 | 1.707 | 0.000 |
| N20 | 0.293 | 1.707 | 4.000 |
| N21 | 1.000 | 0.000 | 0.000 |
| N22 | 1.000 | 0.000 | 4.000 |
| N23 | -0.414 | 0.000 | 0.000 |
| N24 | -0.414 | 0.000 | 4.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N25 | 1.000 | 1.414 | 0.000 |
| N26 | 1.000 | 1.414 | 4.000 |
| N27 | -0.414 | 1.414 | 0.000 |
| N28 | -0.414 | 1.414 | 4.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D6 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D7 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D8 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |
| D9 | Calque1 | wall (80) | Standard | S 235 | constant | 20 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle11 | D6 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle12 | D8 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle13 | D9 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle14 | D7 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
1 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [kPa] [kPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235000.000 360000.000
8.0769e+04 0.01e-003 40 80 215000.000 360000.000
2/7

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[kPa] | Fu
[kPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235000.000 | 360000.000 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215000.000 | 360000.000 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
3. LOAD
3.1. Load cases
Name Description Action type Load group Direction
Spec Load type
LC1 Poids propre Permanent LG1 -Z
3/7

| Name | Description | Action type | Load group | Direction |
| --- | --- | --- | --- | --- |
|  | Spec | Load type |  |  |
| LC1 | Poids propre | Permanent | LG1 | -Z |
|  |  | Self weight |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
4. RESULTS
4.1. 2D stress/strain; σ_x+
Z
Y X
4.2. 2D stress/strain; σ_y+
Z
Y X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
4.3. 2D stress/strain
Linear calculation
Load case: LC1
Extreme: Global
Selection: All
Location: In centres. System: LCS mesh element
Basic stress
Name Mesh Position Case σx+ σy+ τxy+ τxz τyz
[m] [kPa] [kPa] [kPa] [kPa] [kPa]
σx- σy- τxy-
[kPa] [kPa] [kPa]
D6 Element: 415 0.574 LC1 -0.633 -301.066 0.000 0.000 0.083
-0.253 0.269 -298.060 0.000
0.110
D6 Element: 889 0.459 LC1 -0.315 -290.461 0.000 0.000 0.029
-0.279 -0.231 -290.183 0.000
0.230
D6 Element: 2 0.322 LC1 0.459 -310.201 0.000 0.000 0.023
-0.292 2.221 -304.327 0.000
0.010
D6 Element: 15921 0.303 LC1 0.013 -0.772 0.000 0.000 0.001
-0.293 0.015 -0.768 0.000
3.990
D6 Element: 317 1.290 LC1 -0.479 -304.831 0.000 0.000 0.085
0.638 0.834 -300.456 0.000
0.070
D6 Element: 796 1.289 LC1 -0.462 -293.843 0.000 0.000 0.047
0.619 -0.198 -292.962 0.000
0.190
D6 Element: 1 0.303 LC1 0.459 -310.201 0.000 0.000 0.023
-0.293 2.221 -304.327 0.000
0.010
D6 Element: 80 1.293 LC1 0.459 -310.201 0.000 0.000 0.023
0.697 2.221 -304.327 0.000
0.010
D6 Element: 1681 0.303 LC1 0.024 -274.837 0.000 0.000 -0.004
-0.293 -0.026 -275.003 0.000
0.430
D6 Element: 329 0.459 LC1 -0.589 -302.947 0.000 0.000 0.086
-0.279 0.517 -299.260 0.000
0.090
4.4. 2D displacement
Linear calculation
Load case: LC1
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Name Mesh Position Case ux uy uz φx φy φz Utotal
[m] [mm] [mm] [mm] [mrad] [mrad] [mrad] [mm]
D6 Element: 0.313 LC1 0.00000 -0.00293 0.00000 0.0 0.0 0.0 0.00293
15921 -0.293
Node: 4.000
16201
D6 Element: 0.313 LC1 0.00000 -0.00006 0.00044 0.0 0.0 0.0 0.00044
81 -0.293
Node: 163 0.040
5/7

| Name | Mesh | Position
[m] | Case | σx+
[kPa]
σx-
[kPa] | σy+
[kPa]
σy-
[kPa] | τxy+
[kPa]
τxy-
[kPa] | τxz
[kPa] | τyz
[kPa] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D6 | Element: 415 | 0.574
-0.253
0.110 | LC1 | -0.633
0.269 | -301.066
-298.060 | 0.000
0.000 | 0.000 | 0.083 |
| D6 | Element: 889 | 0.459
-0.279
0.230 | LC1 | -0.315
-0.231 | -290.461
-290.183 | 0.000
0.000 | 0.000 | 0.029 |
| D6 | Element: 2 | 0.322
-0.292
0.010 | LC1 | 0.459
2.221 | -310.201
-304.327 | 0.000
0.000 | 0.000 | 0.023 |
| D6 | Element: 15921 | 0.303
-0.293
3.990 | LC1 | 0.013
0.015 | -0.772
-0.768 | 0.000
0.000 | 0.000 | 0.001 |
| D6 | Element: 317 | 1.290
0.638
0.070 | LC1 | -0.479
0.834 | -304.831
-300.456 | 0.000
0.000 | 0.000 | 0.085 |
| D6 | Element: 796 | 1.289
0.619
0.190 | LC1 | -0.462
-0.198 | -293.843
-292.962 | 0.000
0.000 | 0.000 | 0.047 |
| D6 | Element: 1 | 0.303
-0.293
0.010 | LC1 | 0.459
2.221 | -310.201
-304.327 | 0.000
0.000 | 0.000 | 0.023 |
| D6 | Element: 80 | 1.293
0.697
0.010 | LC1 | 0.459
2.221 | -310.201
-304.327 | 0.000
0.000 | 0.000 | 0.023 |
| D6 | Element: 1681 | 0.303
-0.293
0.430 | LC1 | 0.024
-0.026 | -274.837
-275.003 | 0.000
0.000 | 0.000 | -0.004 |
| D6 | Element: 329 | 0.459
-0.279
0.090 | LC1 | -0.589
0.517 | -302.947
-299.260 | 0.000
0.000 | 0.000 | 0.086 |


| Name | Mesh | Position
[m] | Case | ux
[mm] | uy
[mm] | uz
[mm] | φx
[mrad] | φy
[mrad] | φz
[mrad] | Utotal
[mm] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D6 | Element:
15921
Node:
16201 | 0.313
-0.293
4.000 | LC1 | 0.00000 | -0.00293 | 0.00000 | 0.0 | 0.0 | 0.0 | 0.00293 |
| D6 | Element:
81
Node: 163 | 0.313
-0.293
0.040 | LC1 | 0.00000 | -0.00006 | 0.00044 | 0.0 | 0.0 | 0.0 | 0.00044 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
4.5. 2D displacement; u_y
Z
Y X
4.6. 2D displacement; u_z
Z
Y X
6/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS06/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
σx (Whole height)= 0 kPa
σy (at bottom)= -314 kPa
Radial displacement = 4.49*e-4 mm
Vertical displacement = -2.99 e-3 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS10/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Torus under uniform internal pressure
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 1.000 0.000 0.000 N3 2.000 0.000 1.000 N5 2.000 0.000 -1.000
N2 3.000 0.000 0.000 N4 0.000 0.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 shell (98) Standard S 235 constant 20
D2 Calque1 shell (98) Standard S 235 constant 20
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Flexible Flexible Rigid Free Free Free
2 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.00 360.00
8.0769e+04 0.01e-003 40 80 215.00 360.00
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 1.000 | 0.000 | 0.000 |
| N2 | 3.000 | 0.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N3 | 2.000 | 0.000 | 1.000 |
| N4 | 0.000 | 0.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N5 | 2.000 | 0.000 | -1.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |
| D2 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.00 | 360.00 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.00 | 360.00 |  |  |  |



## Sayfa 171

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS10/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
ZY
X
3.2. Load cases
Name Description Action type Load group
Spec Load type
LC2 PERMANENT Permanent LG1
3.3. Generated free loads
Name Load case 2D member Dir Type load Original Load q System
[kN/m2]
Distribution Type Value - P Location
[kN/m]
GFF1 LC2 - PERMANENT D1 Z Surface FF1 -10.00 Member LCS
Uniform Force Length
GFF2 LC2 - PERMANENT D2 Z Surface FF1 -10.00 Member LCS
Uniform Force Length
3.4. Free surface load
Name Load case Dir Type Distribution q Validity Select System Location
[kN/m2]
FF1 LC2 - PERMANENT Z Force Uniform -10.00 All Auto Member LCS Length
2/6

| Name | Description | Action type | Load group |
| --- | --- | --- | --- |
|  | Spec | Load type |  |
| LC2 | PERMANENT | Permanent | LG1 |
|  |  | Standard |  |


| Name | Load case | 2D member | Dir | Type load | Original Load | q
[kN/m2] | System |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | Distribution | Type |  | Value - P
[kN/m] | Location |
| GFF1 | LC2 - PERMANENT | D1 | Z | Surface | FF1 | -10.00 | Member LCS |
|  |  |  | Uniform | Force |  |  | Length |
| GFF2 | LC2 - PERMANENT | D2 | Z | Surface | FF1 | -10.00 | Member LCS |
|  |  |  | Uniform | Force |  |  | Length |


| Name | Load case | Dir | Type | Distribution | q
[kN/m2] | Validity | Select | System | Location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FF1 | LC2 - PERMANENT | Z | Force | Uniform | -10.00 | All | Auto | Member LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS10/89
Current date 21.10.2025
4. RESULTS
4.1. 3D stress; σ_x (1D/2D)
Z
Y
X
4.2. 3D stress; σ_y (2D)
Z
Y
X
3/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS10/89
Current date 21.10.2025
4.3. 2D displacement; u_z
ZY
X
4.4. Displacement of nodes; U_x
ZY
X
4/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS10/89
Current date 21.10.2025
4.5. 3D stress
Linear calculation
Load case: LC2
Selection: All
Location: In centres (for 2D only). System: LCS mesh element
Basic magnitudes
Results on 2D member
Extreme 2D: Global
Name Mesh Position Case σx+ σy+ τxy+ τxz τyz
[m] [MPa] [MPa] [MPa] [MPa] [MPa]
σx- σy- τxy-
[MPa] [MPa] [MPa]
D1 Element: 5617 1.733 LC2 0.22 0.50 0.00 0.00 0.00
0.025 0.24 0.57 0.00
0.963
D1 Element: 7993 2.266 LC2 0.27 0.48 0.00 0.00 0.00
0.033 0.28 0.46 0.00
0.963
D1 Element: 4753 1.550 LC2 0.24 0.57 0.00 0.00 0.00
0.023 0.22 0.57 0.00
0.893
D1 Element: 7129 2.073 LC2 0.26 0.45 0.00 0.00 0.00
0.030 0.29 0.52 0.00
0.997
D1 Element: 13609 2.999 LC2 0.25 0.42 0.00 0.00 0.00
0.044 0.25 0.42 0.00
0.025
D1 Element: 1 1.000 LC2 0.25 0.75 0.00 0.00 0.00
0.015 0.25 0.74 0.00
0.025
D1 Element: 651 1.012 LC2 0.25 0.75 0.00 0.00 0.00
0.074 0.25 0.74 0.00
0.171
D1 Element: 649 1.015 LC2 0.25 0.75 0.00 0.00 0.00
0.015 0.25 0.74 0.00
0.171
D1 Element: 4834 -1.112 LC2 0.24 0.57 0.00 0.00 0.00
1.080 0.22 0.57 0.00
0.893
D1 Element: 6697 1.975 LC2 0.24 0.45 0.00 0.00 0.00
0.029 0.28 0.55 0.00
0.999
D1 Element: 7345 2.122 LC2 0.26 0.46 0.00 0.00 0.00
0.031 0.29 0.51 0.00
0.992
4.6. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Global
Selection: N1, N2
Name Case Ux
[mm]
N1 LC2 1.15000e-04
N2 LC2 1.77600e-03
5/6

| Name | Mesh | Position
[m] | Case | σx+
[MPa]
σx-
[MPa] | σy+
[MPa]
σy-
[MPa] | τxy+
[MPa]
τxy-
[MPa] | τxz
[MPa] | τyz
[MPa] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Element: 5617 | 1.733
0.025
0.963 | LC2 | 0.22
0.24 | 0.50
0.57 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 7993 | 2.266
0.033
0.963 | LC2 | 0.27
0.28 | 0.48
0.46 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 4753 | 1.550
0.023
0.893 | LC2 | 0.24
0.22 | 0.57
0.57 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 7129 | 2.073
0.030
0.997 | LC2 | 0.26
0.29 | 0.45
0.52 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 13609 | 2.999
0.044
0.025 | LC2 | 0.25
0.25 | 0.42
0.42 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 1 | 1.000
0.015
0.025 | LC2 | 0.25
0.25 | 0.75
0.74 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 651 | 1.012
0.074
0.171 | LC2 | 0.25
0.25 | 0.75
0.74 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 649 | 1.015
0.015
0.171 | LC2 | 0.25
0.25 | 0.75
0.74 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 4834 | -1.112
1.080
0.893 | LC2 | 0.24
0.22 | 0.57
0.57 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 6697 | 1.975
0.029
0.999 | LC2 | 0.24
0.28 | 0.45
0.55 | 0.00
0.00 | 0.00 | 0.00 |
| D1 | Element: 7345 | 2.122
0.031
0.992 | LC2 | 0.26
0.29 | 0.46
0.51 | 0.00
0.00 | 0.00 | 0.00 |


| Name | Case | Ux
[mm] |
| --- | --- | --- |
| N1 | LC2 | 1.15000e-04 |
| N2 | LC2 | 1.77600e-03 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS10/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
σx (Whole torus)= 0.25 MPa
σy (Max)= 0.75 MPa
σy (Min)= 0.42 MPa
Radial (external) displacement (N1 ux)= 1.19*e-4 mm
Radial (internal) displacement (N2 ux)= 1.79*e-3 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS11/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Thin-walled cone subjected to uniform internal pressure
Specification: Shell - Cone - Material: elastic - Pressure.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z
[m] [m] [m]
N1 0.000 0.000 0.000
N2 1.000 0.000 1.732
N3 0.000 0.000 1.732
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 shell (98) Standard S 235 constant 20
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Free Free Free
2 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.000 360.000
8.0769e+04 0.01e-003 40 80 215.000 360.000
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.000 | 0.000 | 1.732 |
| N3 | 0.000 | 0.000 | 1.732 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.000 | 360.000 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.000 | 360.000 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS11/89
Current date 21.10.2025
3. LOAD
3.1. LC2 / Tot. value
X
Y
3.2. Free surface load
Name Load case Dir Type Distribution q Validity Select System Location
[kN/m2]
FF1 LC2 - Permanent Z Force Uniform -10.00 All Auto Member LCS Length
2/6

| Name | Load case | Dir | Type | Distribution | q
[kN/m2] | Validity | Select | System | Location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FF1 | LC2 - Permanent | Z | Force | Uniform | -10.00 | All | Auto | Member LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS11/89
Current date 21.10.2025
4. RESULTS
4.1. 2D stress/strain; σ_y+
Z
X Y
4.2. 2D stress/strain; σ_x+
Z
X Y
3/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS11/89
Current date 21.10.2025
4.3. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In centres. System: LCS mesh element
Basic stress - Results on sections:
Name Mesh Position Case σx+ σy+ τxy+ τxz τyz
[m] [MPa] [MPa] [MPa] [MPa] [MPa]
σx- σy- τxy-
[MPa] [MPa] [MPa]
SE1 Element: 3377 -0.478 LC2 0.288 0.145 0.000 0.000 0.000
-0.147 0.282 0.140 0.000
0.866
SE1 Element: 3654 0.250 LC2 0.296 0.150 0.000 0.000 0.000
0.433 0.289 0.142 0.000
0.866
SE1 Element: 3351 0.012 LC2 0.288 0.145 0.000 0.000 0.000
-0.500 0.282 0.140 0.000
0.866
SE1 Element: 3345 0.159 LC2 0.288 0.145 0.000 0.000 0.000
-0.474 0.282 0.140 0.000
0.866
SE1 Element: 3632 -0.012 LC2 0.296 0.150 0.000 0.000 0.000
0.500 0.289 0.142 0.000
0.866
SE1 Element: 3668 0.383 LC2 0.296 0.150 0.000 0.000 0.000
0.321 0.289 0.142 0.000
0.866
SE1 Element: 3333 0.399 LC2 0.288 0.145 0.000 0.000 0.000
-0.302 0.282 0.140 0.000
0.866
SE1 Element: 3600 -0.367 LC2 0.296 0.150 0.000 0.000 0.000
0.340 0.289 0.142 0.000
0.866
SE1 Element: 3368 -0.367 LC2 0.288 0.145 0.000 0.000 0.000
-0.340 0.282 0.140 0.000
0.866
SE1 Element: 3320 0.500 LC2 0.288 0.145 0.000 0.000 0.000
0.000 0.282 0.140 0.000
0.866
SE1 Element: 3696 0.500 LC2 0.296 0.150 0.000 0.000 0.000
0.004 0.289 0.142 0.000
0.866
4/6

| Name | Mesh | Position
[m] | Case | σx+
[MPa]
σx-
[MPa] | σy+
[MPa]
σy-
[MPa] | τxy+
[MPa]
τxy-
[MPa] | τxz
[MPa] | τyz
[MPa] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SE1 | Element: 3377 | -0.478
-0.147
0.866 | LC2 | 0.288
0.282 | 0.145
0.140 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3654 | 0.250
0.433
0.866 | LC2 | 0.296
0.289 | 0.150
0.142 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3351 | 0.012
-0.500
0.866 | LC2 | 0.288
0.282 | 0.145
0.140 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3345 | 0.159
-0.474
0.866 | LC2 | 0.288
0.282 | 0.145
0.140 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3632 | -0.012
0.500
0.866 | LC2 | 0.296
0.289 | 0.150
0.142 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3668 | 0.383
0.321
0.866 | LC2 | 0.296
0.289 | 0.150
0.142 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3333 | 0.399
-0.302
0.866 | LC2 | 0.288
0.282 | 0.145
0.140 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3600 | -0.367
0.340
0.866 | LC2 | 0.296
0.289 | 0.150
0.142 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3368 | -0.367
-0.340
0.866 | LC2 | 0.288
0.282 | 0.145
0.140 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3320 | 0.500
0.000
0.866 | LC2 | 0.288
0.282 | 0.145
0.140 | 0.000
0.000 | 0.000 | 0.000 |
| SE1 | Element: 3696 | 0.500
0.004
0.866 | LC2 | 0.296
0.289 | 0.150
0.142 | 0.000
0.000 | 0.000 | 0.000 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS11/89
Current date 21.10.2025
4.4. 2D displacement; u_x
Z
X Y
4.5. 2D displacement
Linear calculation
Load case: LC2
Extreme: Member
Selection: SE1
Location: In nodes avg.. System: Global
Results on sections:
Name Mesh Position Case ux uy
[m] [mm] [mm]
SE1 Element: 3350 0.012 LC2 0.0000150 -0.0005840
-0.500
0.866
5/6

| Name | Mesh | Position
[m] | Case | ux
[mm] | uy
[mm] |
| --- | --- | --- | --- | --- | --- |
| SE1 | Element: 3350 | 0.012
-0.500
0.866 | LC2 | 0.0000150 | -0.0005840 |



## Sayfa 181

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS11/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Results of the mid-height element:
σy = 0.144 MPa
σx = 0.289 MPa
Displacement radial = 0,5842 e-6 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Spherical shell subjected to a pressure
Codification: Shell - spherical cup - Material: elastic - Uniform pressure
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 0.000 0.000 -1.000 N4 1.000 0.000 0.000 N7 0.000 -1.000 0.000
N2 -1.000 0.000 0.000 N5 0.000 1.000 0.000
N3 -0.694 0.000 -0.720 N6 0.694 0.000 -0.720
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 shell (98) Standard S 235 constant 20
D3 Calque1 shell (98) Standard S 235 constant 20
2.4. Line supports on member
Name Type Member Pos x1 Coor X Y Z Rx Ry Rz
System Pos x2 Orig
Slb1 Line B3 0.000 Rela Rigid Free Rigid Free Free Free
LCS 1.000 From start
Slb2 Line B1 0.000 Rela Rigid Free Rigid Free Free Free
LCS 1.000 From start
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | -1.000 |
| N2 | -1.000 | 0.000 | 0.000 |
| N3 | -0.694 | 0.000 | -0.720 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N4 | 1.000 | 0.000 | 0.000 |
| N5 | 0.000 | 1.000 | 0.000 |
| N6 | 0.694 | 0.000 | -0.720 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N7 | 0.000 | -1.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |
| D3 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |


| Name | Type | Member | Pos x1 | Coor | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | System | Pos x2 | Orig |  |  |  |  |  |  |
| Slb1 | Line | B3 | 0.000 | Rela | Rigid | Free | Rigid | Free | Free | Free |
|  |  | LCS | 1.000 | From start |  |  |  |  |  |  |
| Slb2 | Line | B1 | 0.000 | Rela | Rigid | Free | Rigid | Free | Free | Free |
|  |  | LCS | 1.000 | From start |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0 40 235.00 360.00
8.0769e+04 0.01e-003 40 80 215.00 360.00
2/7

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 235.00 | 360.00 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 215.00 | 360.00 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
Y
3.2. Free surface load
Name Load case Dir Type Distribution q Validity Select System Location
[kN/m2]
FF1 LC2 - Permanent Z Force Uniform 10.00 All Auto Member LCS Length
3/7

| Name | Load case | Dir | Type | Distribution | q
[kN/m2] | Validity | Select | System | Location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FF1 | LC2 - Permanent | Z | Force | Uniform | 10.00 | All | Auto | Member LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
4. RESULTS
4.1. 3D stress; σ_y (2D)
Z
Y
X
4.2. 3D stress; σ_x (1D/2D)
Z
Y
X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
4.3. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Basic stress - Results on sections:
Name Mesh Position Case σx+ σy+
[m] [MPa] [MPa]
σx- σy-
[MPa] [MPa]
SE1 Element: 6215 0.707 LC2 0.25 0.25
0.000 0.25 0.25
-0.707
5/7

| Name | Mesh | Position
[m] | Case | σx+
[MPa]
σx-
[MPa] | σy+
[MPa]
σy-
[MPa] |
| --- | --- | --- | --- | --- | --- |
| SE1 | Element: 6215 | 0.707
0.000
-0.707 | LC2 | 0.25
0.25 | 0.25
0.25 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
4.4. 3D displacement; u_z
Z
Y
X
4.5. 3D displacement
Linear calculation
Load case: LC2
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Results on 2D member:
Extreme 2D: Global
Name Mesh Position Case ux+ uy+ uz+ φx φy φz U total+
[m] [m] [m] [m] [mrad] [mrad] [mrad] [m]
ux- uy- uz- U total-
[m] [m] [m] [m]
D1 Element: 0.000 LC2 0.00e+00 9.83e-12 8.27e-07 0.0 0.0 0.0 8.27e-07
17344 1.000 0.00e+00 -9.83e-12 8.25e-07 8.25e-07
Node: 4 0.000
6/7

| Name | Mesh | Position
[m] | Case | ux+
[m]
ux-
[m] | uy+
[m]
uy-
[m] | uz+
[m]
uz-
[m] | φx
[mrad] | φy
[mrad] | φz
[mrad] | U total+
[m]
U total-
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Element:
17344
Node: 4 | 0.000
1.000
0.000 | LC2 | 0.00e+00
0.00e+00 | 9.83e-12
-9.83e-12 | 8.27e-07
8.25e-07 | 0.0 | 0.0 | 0.0 | 8.27e-07
8.25e-07 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS 14/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
" θ ; σx= σy = 0.25 MPa
θ = 90° ; δR (uz) = 8,33 e-7 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS16/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Spherical shell subjected to a moment
Specification: Shell - spherical cup - Material: elastic - Uniform moment.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 1.048 0.000 0.000 N9 0.048 0.000 0.000 N12 1.048 0.001 0.000
N7 0.048 0.000 1.000 N10 1.048 0.000 0.000
N8 0.755 0.000 0.707 N11 -0.952 0.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D2 Calque1 shell (98) Standard S 235 constant 20
2.4. Line supports
Name Type Pos x1 Coor X Y Z Rx Ry Rz
Pos x2 Orig
Slb1 Line 0.000 Rela Rigid Free Rigid Free Free Free
1.000 From start
2.5. Materials
Empty table
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 1.048 | 0.000 | 0.000 |
| N7 | 0.048 | 0.000 | 1.000 |
| N8 | 0.755 | 0.000 | 0.707 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N9 | 0.048 | 0.000 | 0.000 |
| N10 | 1.048 | 0.000 | 0.000 |
| N11 | -0.952 | 0.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N12 | 1.048 | 0.001 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D2 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |


| Name | Type | Pos x1 | Coor | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Pos x2 | Orig |  |  |  |  |  |  |
| Slb1 | Line | 0.000 | Rela | Rigid | Free | Rigid | Free | Free | Free |
|  |  | 1.000 | From start |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS16/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Z
Y
X
3.2. Line moment
Name Type Dir Value - M1 Pos x1 Coor Orig
[Nm/m]
System Distribution Value - M2 Pos x2 Loc
[Nm/m]
LM1 Moment Mx 100.00 0.000 Rela From start
LCS Uniform 1.000 Length
2/6

| Name | Type | Dir | Value - M1
[Nm/m] | Pos x1 | Coor | Orig |
| --- | --- | --- | --- | --- | --- | --- |
|  | System | Distribution | Value - M2
[Nm/m] | Pos x2 | Loc |  |
| LM1 | Moment | Mx | 100.00 | 0.000 | Rela | From start |
|  | LCS | Uniform |  | 1.000 | Length |  |



## Sayfa 191

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS16/89
Current date 21.10.2025
4. RESULTS
4.1. Horizontal stress on edge
Z
X
Y
3/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS16/89
Current date 21.10.2025
4.2. Displacement δR (m)
Z
Y
X
4.3. Displacement δR (m) on edge
Z
Y
X
4/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS16/89
Current date 21.10.2025
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Results on edges:
Name Mesh Position Case ux uy uz φx φy φz Utotal
[m] [m] [m] [m] [mrad] [mrad] [mrad] [m]
D2/Edge 1 Element: 1.010 LC2 0.00e+00 4.70e-08 -4.70e-07 0.0 0.0 0.0 4.72e-07
3660 0.000
0.271
D2/Edge 2 Element: 0.048 LC2 0.00e+00 4.50e-08 3.93e-06 0.1 0.0 0.0 3.93e-06
4820 1.000
0.000
5/6

| Name | Mesh | Position
[m] | Case | ux
[m] | uy
[m] | uz
[m] | φx
[mrad] | φy
[mrad] | φz
[mrad] | Utotal
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D2/Edge 1 | Element:
3660 | 1.010
0.000
0.271 | LC2 | 0.00e+00 | 4.70e-08 | -4.70e-07 | 0.0 | 0.0 | 0.0 | 4.72e-07 |
| D2/Edge 2 | Element:
4820 | 0.048
1.000
0.000 | LC2 | 0.00e+00 | 4.50e-08 | 3.93e-06 | 0.1 | 0.0 | 0.0 | 3.93e-06 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS16/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Horizontal stress (at the extremity) = 8.26 e5 Pa
Horizontal stress (exterior plane) = 8.11 e5 Pa
RAdial displacement (at the extremity) = 3.93 e-6 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS17/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Spherical shell
Specification: Shell - spherical cup - Material: elastic – Self weight
2. MODEL
2.1. Analysis model
2.2. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D2 Calque1 shell (98) Standard S 235 constant 20
2.3. Line supports
Name Type Pos x1 Coor X Y Z Rx Ry Rz
Pos x2 Orig
Slb1 Line 0.000 Rela Rigid Free Rigid Free Free Free
1.000 From start
2.4. Materials
Empty table
1/6

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D2 | Calque1 | shell (98) | Standard | S 235 | constant | 20 |


| Name | Type | Pos x1 | Coor | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Pos x2 | Orig |  |  |  |  |  |  |
| Slb1 | Line | 0.000 | Rela | Rigid | Free | Rigid | Free | Free | Free |
|  |  | 1.000 | From start |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS17/89
Current date 21.10.2025
3. LOAD
3.1. Load cases
Name Description Action type Load group Direction
Spec Load type
LC1 Poids propre Permanent LG1 -Z
Shell is subjected to its selg-weight
2/6

| Name | Description | Action type | Load group | Direction |
| --- | --- | --- | --- | --- |
|  | Spec | Load type |  |  |
| LC1 | Poids propre | Permanent | LG1 | -Z |
|  |  | Self weight |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS17/89
Current date 21.10.2025
4. RESULTS
4.1. Horizontal stress
Z
XY
4.2. Vertical stress on edge
Z
X Y
3/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS17/89
Current date 21.10.2025
4.3. Displacement δR (m)
Z
Y
X
4.4. Displacement δR (m) on edge
Z
Y
X
4/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS17/89
Current date 21.10.2025
4.5. 2D displacement
Linear calculation
Load case: LC1
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Results on sections:
Name Mesh Position Case ux uy uz φx φy φz Utotal
[m] [m] [m] [m] [mrad] [mrad] [mrad] [m]
SE1 Element: 1.047 LC1 0.00e+00 1.00e-09 4.91e-07 0.0 0.0 0.0 4.91e-07
4780 0.039
0.000
5/6

| Name | Mesh | Position
[m] | Case | ux
[m] | uy
[m] | uz
[m] | φx
[mrad] | φy
[mrad] | φz
[mrad] | Utotal
[m] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SE1 | Element:
4780 | 1.047
0.039
0.000 | LC1 | 0.00e+00 | 1.00e-09 | 4.91e-07 | 0.0 | 0.0 | 0.0 | 4.91e-07 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS17/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
At the extremity :
Horizontal stress : 7.85 e4 Pa
Vertical stress: -7.85 e4 Pa
Radial displacement: 4.86 e-7 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6


## Sayfa 201

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS20/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Cylindrical shell subjected to concentrated force -
Codification: Cylindrical shell - Material: elastic - Concentrated forces.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 4.953 0.000 0.000 N7 -4.953 5.175 0.000 N11 4.953 10.350 0.000
N3 4.953 5.175 0.000 N8 0.000 5.175 4.953 N12 -4.953 10.350 0.000
N5 -4.953 0.000 0.000 N9 0.000 0.000 -4.953 N13 0.000 10.350 4.953
N6 0.000 0.000 4.953 N10 0.000 5.175 -4.953 N14 0.000 10.350 -4.953
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
S3 Calque1 shell (98) Standard Material constant 94
S4 Calque1 shell (98) Standard Material constant 94
S5 Calque1 shell (98) Standard Material constant 94
S6 Calque1 shell (98) Standard Material constant 94
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 S3 From start 0.000 Flexible Flexible Flexible Free Free Free
1 Rela 1.000
Sle2 S5 From start 0.000 Flexible Flexible Flexible Free Free Free
3 Rela 1.000
Sle3 S6 From start 0.000 Flexible Flexible Flexible Free Free Free
3 Rela 1.000
Sle4 S4 From start 0.000 Flexible Flexible Flexible Free Free Free
1 Rela 1.000
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 4.953 | 0.000 | 0.000 |
| N3 | 4.953 | 5.175 | 0.000 |
| N5 | -4.953 | 0.000 | 0.000 |
| N6 | 0.000 | 0.000 | 4.953 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N7 | -4.953 | 5.175 | 0.000 |
| N8 | 0.000 | 5.175 | 4.953 |
| N9 | 0.000 | 0.000 | -4.953 |
| N10 | 0.000 | 5.175 | -4.953 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N11 | 4.953 | 10.350 | 0.000 |
| N12 | -4.953 | 10.350 | 0.000 |
| N13 | 0.000 | 10.350 | 4.953 |
| N14 | 0.000 | 10.350 | -4.953 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| S3 | Calque1 | shell (98) | Standard | Material | constant | 94 |
| S4 | Calque1 | shell (98) | Standard | Material | constant | 94 |
| S5 | Calque1 | shell (98) | Standard | Material | constant | 94 |
| S6 | Calque1 | shell (98) | Standard | Material | constant | 94 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | S3 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | S5 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | S6 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | S4 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS20/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 7850.00 1.0500e+01 0.31 0 40 235.0 360.0
4.0000e+00 0.01e-003 40 80 215.0 360.0
2/5

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7850.00 | 1.0500e+01 | 0.31 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 4.0000e+00 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS20/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y
X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[N]
F1 N8 LC1 GCS Z Force -100.00
F2 N10 LC1 GCS Z Force 100.00
3/5

| Name | Node | Load case | System | Dir | Type | Value - F
[N] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N8 | LC1 | GCS | Z | Force | -100.00 |
| F2 | N10 | LC1 | GCS | Z | Force | 100.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS20/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes
Linear calculation
Load case: LC1
Extreme: Global
Selection: N8
Name Case Uz
[mm]
N8 LC1 -113.917
4/5

| Name | Case | Uz
[mm] |
| --- | --- | --- |
| N8 | LC1 | -113.917 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS20/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement uz in N8 = -113,9 e-3 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS21/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Spherical shell with an opening
Codification: Spherical shell - Material: elastic - Concentrated forces
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N3 10.000 0.000 0.000 N15 2.186 2.186 9.510 N22 0.000 -8.090 5.878
N6 3.091 0.000 9.510 N16 -10.000 0.000 0.000 N23 2.186 -2.186 9.510
N7 8.090 0.000 5.878 N17 -3.091 0.000 9.510 N24 0.000 -10.000 0.000
N11 0.000 10.000 0.000 N18 -8.090 0.000 5.878 N25 7.071 -7.071 0.000
N12 7.071 7.071 0.000 N19 -7.071 7.071 0.000 N26 -7.071 -7.071 0.000
N13 0.000 3.091 9.510 N20 -2.186 2.186 9.510 N27 -2.186 -2.186 9.510
N14 0.000 8.090 5.878 N21 0.000 -3.091 9.510
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
S3 Calque1 shell (98) Standard Material constant 40
S4 Calque1 shell (98) Standard Material constant 40
S5 Calque1 shell (98) Standard Material constant 40
S6 Calque1 shell (98) Standard Material constant 40
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle5 S4 From start 0.000 Flexible Flexible Flexible Free Free Free
3 Rela 1.000
Sle6 S6 From start 0.000 Flexible Flexible Flexible Free Free Free
3 Rela 1.000
Sle7 S3 From start 0.000 Flexible Flexible Flexible Free Free Free
3 Rela 1.000
1/5

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N3 | 10.000 | 0.000 | 0.000 |
| N6 | 3.091 | 0.000 | 9.510 |
| N7 | 8.090 | 0.000 | 5.878 |
| N11 | 0.000 | 10.000 | 0.000 |
| N12 | 7.071 | 7.071 | 0.000 |
| N13 | 0.000 | 3.091 | 9.510 |
| N14 | 0.000 | 8.090 | 5.878 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N15 | 2.186 | 2.186 | 9.510 |
| N16 | -10.000 | 0.000 | 0.000 |
| N17 | -3.091 | 0.000 | 9.510 |
| N18 | -8.090 | 0.000 | 5.878 |
| N19 | -7.071 | 7.071 | 0.000 |
| N20 | -2.186 | 2.186 | 9.510 |
| N21 | 0.000 | -3.091 | 9.510 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N22 | 0.000 | -8.090 | 5.878 |
| N23 | 2.186 | -2.186 | 9.510 |
| N24 | 0.000 | -10.000 | 0.000 |
| N25 | 7.071 | -7.071 | 0.000 |
| N26 | -7.071 | -7.071 | 0.000 |
| N27 | -2.186 | -2.186 | 9.510 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| S3 | Calque1 | shell (98) | Standard | Material | constant | 40 |
| S4 | Calque1 | shell (98) | Standard | Material | constant | 40 |
| S5 | Calque1 | shell (98) | Standard | Material | constant | 40 |
| S6 | Calque1 | shell (98) | Standard | Material | constant | 40 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle5 | S4 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle6 | S6 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle7 | S3 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS21/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle8 S5 From start 0.000 Flexible Flexible Flexible Free Free Free
3 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [Pa] [Pa]
Gmod α
[MPa] [m/mK]
Material 7850.00 6.2850e+01 0.30 0 40 235000000.0 360000000.0
2.4173e+01 0.01e-003 40 80 215000000.0 360000000.0
2/5

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle8 | S5 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[Pa] | Fu
[Pa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7850.00 | 6.2850e+01 | 0.30 | 0 | 40 | 235000000.0 | 360000000.0 |  |  |  |
|  |  | 2.4173e+01 | 0.01e-003 | 40 | 80 | 215000000.0 | 360000000.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS21/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Z
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[N]
F3 N11 LC1 GCS Y Force -2.00
F4 N3 LC1 GCS X Force 2.00
F5 N16 LC1 GCS X Force -2.00
F6 N24 LC1 GCS Y Force 2.00
3/5

| Name | Node | Load case | System | Dir | Type | Value - F
[N] |
| --- | --- | --- | --- | --- | --- | --- |
| F3 | N11 | LC1 | GCS | Y | Force | -2.00 |
| F4 | N3 | LC1 | GCS | X | Force | 2.00 |
| F5 | N16 | LC1 | GCS | X | Force | -2.00 |
| F6 | N24 | LC1 | GCS | Y | Force | 2.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS21/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes; U_x
Z
Y
X
4.2. Displacement of nodes
Linear calculation
Load case: LC1
Extreme: Global
Selection: N3
Name Case Ux
[mm]
N3 LC1 97.868
4/5

| Name | Case | Ux
[mm] |
| --- | --- | --- |
| N3 | LC1 | 97.868 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS21/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement ux in N3 = 94 e-3 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5


## Sayfa 211

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS22/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Spherical dome subjected to uniform external pressure
Specification: Spherical shell - Material: elastic - pressure
2. MODEL
2.1. Analysis model
Z
Y
X
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N3 0.000 0.000 2.540 N46 1.270 0.000 2.200 N63 -1.546 0.000 2.015
N8 2.453 0.000 0.657 N47 0.000 -1.270 2.200 N64 -1.735 -1.735 0.657
N11 1.546 0.000 2.015 N48 0.898 -0.898 2.200 N65 -2.200 0.000 1.270
N19 0.000 -2.453 0.657 N49 0.657 0.000 2.453 N66 -1.796 0.000 1.796
N20 0.000 -1.546 2.015 N50 0.000 2.453 0.657 N67 -1.555 -1.555 1.270
N21 1.735 -1.735 0.657 N51 0.000 1.546 2.015 N68 -1.270 -1.270 1.796
N25 2.200 0.000 1.270 N52 1.735 1.735 0.657 N69 -2.253 0.000 1.173
N26 1.796 0.000 1.796 N53 0.000 2.200 1.270 N70 -1.946 0.000 1.633
N28 0.000 -2.200 1.270 N54 0.000 1.796 1.796 N71 -1.270 0.000 2.200
N29 0.000 -1.796 1.796 N55 1.555 1.555 1.270 N72 -0.898 -0.898 2.200
N37 1.555 -1.555 1.270 N56 1.270 1.270 1.796 N73 -0.657 0.000 2.453
N38 1.270 -1.270 1.796 N57 0.000 2.253 1.173 N74 -1.735 1.735 0.657
N39 2.253 0.000 1.173 N58 0.000 1.946 1.633 N75 -1.555 1.555 1.270
N40 0.000 -2.253 1.173 N59 0.000 0.657 2.453 N76 -1.270 1.270 1.796
N41 0.000 -1.946 1.633 N60 0.000 1.270 2.200 N77 -0.898 0.898 2.200
N42 1.946 0.000 1.633 N61 0.898 0.898 2.200
N43 0.000 -0.657 2.453 N62 -2.453 0.000 0.657
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
S1 Calque1 shell (98) Standard Material constant 13
S3 Calque1 shell (98) Standard Material constant 13
S5 Calque1 shell (98) Standard Material constant 13
S6 Calque1 shell (98) Standard Material constant 13
S7 Calque1 shell (98) Standard Material constant 13
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N3 | 0.000 | 0.000 | 2.540 |
| N8 | 2.453 | 0.000 | 0.657 |
| N11 | 1.546 | 0.000 | 2.015 |
| N19 | 0.000 | -2.453 | 0.657 |
| N20 | 0.000 | -1.546 | 2.015 |
| N21 | 1.735 | -1.735 | 0.657 |
| N25 | 2.200 | 0.000 | 1.270 |
| N26 | 1.796 | 0.000 | 1.796 |
| N28 | 0.000 | -2.200 | 1.270 |
| N29 | 0.000 | -1.796 | 1.796 |
| N37 | 1.555 | -1.555 | 1.270 |
| N38 | 1.270 | -1.270 | 1.796 |
| N39 | 2.253 | 0.000 | 1.173 |
| N40 | 0.000 | -2.253 | 1.173 |
| N41 | 0.000 | -1.946 | 1.633 |
| N42 | 1.946 | 0.000 | 1.633 |
| N43 | 0.000 | -0.657 | 2.453 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N46 | 1.270 | 0.000 | 2.200 |
| N47 | 0.000 | -1.270 | 2.200 |
| N48 | 0.898 | -0.898 | 2.200 |
| N49 | 0.657 | 0.000 | 2.453 |
| N50 | 0.000 | 2.453 | 0.657 |
| N51 | 0.000 | 1.546 | 2.015 |
| N52 | 1.735 | 1.735 | 0.657 |
| N53 | 0.000 | 2.200 | 1.270 |
| N54 | 0.000 | 1.796 | 1.796 |
| N55 | 1.555 | 1.555 | 1.270 |
| N56 | 1.270 | 1.270 | 1.796 |
| N57 | 0.000 | 2.253 | 1.173 |
| N58 | 0.000 | 1.946 | 1.633 |
| N59 | 0.000 | 0.657 | 2.453 |
| N60 | 0.000 | 1.270 | 2.200 |
| N61 | 0.898 | 0.898 | 2.200 |
| N62 | -2.453 | 0.000 | 0.657 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N63 | -1.546 | 0.000 | 2.015 |
| N64 | -1.735 | -1.735 | 0.657 |
| N65 | -2.200 | 0.000 | 1.270 |
| N66 | -1.796 | 0.000 | 1.796 |
| N67 | -1.555 | -1.555 | 1.270 |
| N68 | -1.270 | -1.270 | 1.796 |
| N69 | -2.253 | 0.000 | 1.173 |
| N70 | -1.946 | 0.000 | 1.633 |
| N71 | -1.270 | 0.000 | 2.200 |
| N72 | -0.898 | -0.898 | 2.200 |
| N73 | -0.657 | 0.000 | 2.453 |
| N74 | -1.735 | 1.735 | 0.657 |
| N75 | -1.555 | 1.555 | 1.270 |
| N76 | -1.270 | 1.270 | 1.796 |
| N77 | -0.898 | 0.898 | 2.200 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S3 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S5 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S6 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S7 | Calque1 | shell (98) | Standard | Material | constant | 13 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS22/89
Current date 21.10.2025
Name Layer Type Element type Material Thickness type Th.
[mm]
S8 Calque1 shell (98) Standard Material constant 13
S9 Calque1 shell (98) Standard Material constant 13
S10 Calque1 shell (98) Standard Material constant 13
S11 Calque1 shell (98) Standard Material constant 13
S12 Calque1 shell (98) Standard Material constant 13
S13 Calque1 shell (98) Standard Material constant 13
S14 Calque1 shell (98) Standard Material constant 13
S15 Calque1 shell (98) Standard Material constant 13
S16 Calque1 shell (98) Standard Material constant 13
S17 Calque1 shell (98) Standard Material constant 13
S18 Calque1 shell (98) Standard Material constant 13
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 S15 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
3 Rela 1.000
Sle2 S11 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
3 Rela 1.000
Sle3 S1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
3 Rela 1.000
Sle4 S7 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
3 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 7850.00 6.8970e+04 0.20 0 40 235.0 360.0
2.8738e+04 0.01e-003 40 80 215.0 360.0
2/6

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| S8 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S9 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S10 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S11 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S12 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S13 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S14 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S15 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S16 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S17 | Calque1 | shell (98) | Standard | Material | constant | 13 |
| S18 | Calque1 | shell (98) | Standard | Material | constant | 13 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | S15 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | S11 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | S1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | S7 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7850.00 | 6.8970e+04 | 0.20 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 2.8738e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS22/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y
X
3.2. Surface load
Name Dir Type Value 2D member Load case System Loc
[N/m2]
SF1 Z Force -689700.00 S1 LC1 LCS Length
SF2 Z Force -689700.00 S3 LC1 LCS Length
SF3 Z Force -689700.00 S5 LC1 LCS Length
SF4 Z Force -689700.00 S6 LC1 LCS Length
SF5 Z Force -689700.00 S7 LC1 LCS Length
SF6 Z Force -689700.00 S8 LC1 LCS Length
SF7 Z Force -689700.00 S9 LC1 LCS Length
SF8 Z Force -689700.00 S10 LC1 LCS Length
SF9 Z Force -689700.00 S11 LC1 LCS Length
SF10 Z Force -689700.00 S12 LC1 LCS Length
SF11 Z Force -689700.00 S13 LC1 LCS Length
SF12 Z Force -689700.00 S14 LC1 LCS Length
SF13 Z Force -689700.00 S15 LC1 LCS Length
SF14 Z Force -689700.00 S16 LC1 LCS Length
SF15 Z Force -689700.00 S17 LC1 LCS Length
SF16 Z Force -689700.00 S18 LC1 LCS Length
3/6

| Name | Dir | Type | Value
[N/m2] | 2D member | Load case | System | Loc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SF1 | Z | Force | -689700.00 | S1 | LC1 | LCS | Length |
| SF2 | Z | Force | -689700.00 | S3 | LC1 | LCS | Length |
| SF3 | Z | Force | -689700.00 | S5 | LC1 | LCS | Length |
| SF4 | Z | Force | -689700.00 | S6 | LC1 | LCS | Length |
| SF5 | Z | Force | -689700.00 | S7 | LC1 | LCS | Length |
| SF6 | Z | Force | -689700.00 | S8 | LC1 | LCS | Length |
| SF7 | Z | Force | -689700.00 | S9 | LC1 | LCS | Length |
| SF8 | Z | Force | -689700.00 | S10 | LC1 | LCS | Length |
| SF9 | Z | Force | -689700.00 | S11 | LC1 | LCS | Length |
| SF10 | Z | Force | -689700.00 | S12 | LC1 | LCS | Length |
| SF11 | Z | Force | -689700.00 | S13 | LC1 | LCS | Length |
| SF12 | Z | Force | -689700.00 | S14 | LC1 | LCS | Length |
| SF13 | Z | Force | -689700.00 | S15 | LC1 | LCS | Length |
| SF14 | Z | Force | -689700.00 | S16 | LC1 | LCS | Length |
| SF15 | Z | Force | -689700.00 | S17 | LC1 | LCS | Length |
| SF16 | Z | Force | -689700.00 | S18 | LC1 | LCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS22/89
Current date 21.10.2025
4. RESULTS
4.1. Déplacement des noeuds; U_y
Z
X Y
4.2. Displacement of nodes
Linear calculation
Load case: LC1
Extreme: Global
Selection: N53, N60
Name Case Uy
[mm]
N53 LC1 -1.773
N60 LC1 -1.016
For Ψ =15° ; u = -1,776 mm
For Ψ =45° ; u = -1,017 mm
4/6

| Name | Case | Uy
[mm] |
| --- | --- | --- |
| N53 | LC1 | -1.773 |
| N60 | LC1 | -1.016 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS22/89
Current date 21.10.2025
4.3. Contraintes/déformations 2D; σ_1+
Z
X Y
For Ψ =15° ; σ = -68,1 MPa
For Ψ =45° ; u = -69,0 MPa
5/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS22/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
For Ψ =15° ; σ = -74 MPa ; u= -1,73 e-3 m
For Ψ =45° ; σ = -68 MPa ; u= -1,02 e-3 m
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Cylindrical membrane in bending and membrane behavior.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N5 0.000 0.000 1.000 N12 0.174 0.000 0.985 N16 0.342 0.300 0.940
N6 0.500 0.000 0.866 N13 0.342 0.500 0.940 N17 0.407 0.000 0.914
N8 0.500 0.500 0.866 N14 0.174 0.500 0.985 N18 0.407 0.500 0.914
N9 0.000 0.500 1.000 N1 0.000 0.300 1.000
N11 0.342 0.000 0.940 N15 0.174 0.300 0.985
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
S5 Calque1 shell (98) Standard S 275 constant 10
S6 Calque1 shell (98) Standard S 275 constant 10
S7 Calque1 shell (98) Standard S 275 constant 10
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 S5 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle2 S6 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle3 S5 From start 0.000 Free Rigid Free Rigid Free Rigid
1 Rela 1.000
Sle4 S7 From start 0.000 Free Rigid Free Rigid Free Rigid
1 Rela 1.000
Sle5 S6 From start 0.000 Free Rigid Free Rigid Free Rigid
3 Rela 1.000
1/7

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N5 | 0.000 | 0.000 | 1.000 |
| N6 | 0.500 | 0.000 | 0.866 |
| N8 | 0.500 | 0.500 | 0.866 |
| N9 | 0.000 | 0.500 | 1.000 |
| N11 | 0.342 | 0.000 | 0.940 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N12 | 0.174 | 0.000 | 0.985 |
| N13 | 0.342 | 0.500 | 0.940 |
| N14 | 0.174 | 0.500 | 0.985 |
| N1 | 0.000 | 0.300 | 1.000 |
| N15 | 0.174 | 0.300 | 0.985 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N16 | 0.342 | 0.300 | 0.940 |
| N17 | 0.407 | 0.000 | 0.914 |
| N18 | 0.407 | 0.500 | 0.914 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| S5 | Calque1 | shell (98) | Standard | S 275 | constant | 10 |
| S6 | Calque1 | shell (98) | Standard | S 275 | constant | 10 |
| S7 | Calque1 | shell (98) | Standard | S 275 | constant | 10 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | S5 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | S6 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | S5 | From start | 0.000 | Free | Rigid | Free | Rigid | Free | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | S7 | From start | 0.000 | Free | Rigid | Free | Rigid | Free | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle5 | S6 | From start | 0.000 | Free | Rigid | Free | Rigid | Free | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle6 S7 From start 0.000 Free Rigid Free Rigid Free Rigid
3 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 275 7850.00 2.1000e+05 0.30 0 40 275.0 430.0
8.0769e+04 0.01e-003 40 80 255.0 410.0
2/7

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle6 | S7 | From start | 0.000 | Free | Rigid | Free | Rigid | Free | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 275 | 7850.00 | 2.1000e+05 | 0.30 | 0 | 40 | 275.0 | 430.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 255.0 | 410.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
3. LOAD
3.1. LC1 - Bending
Z
Y
X
3.2. Line moment on 2D member edge
Name 2D member Type Dir Value - M1 Pos x1 Loc Edge
[Nm/m]
Load case System Distribution Value - M2 Pos x2 Coor Orig
[Nm/m]
LMS1 S7 Moment Mx 1000.00 0.000 Length 2
LC1 LCS Uniform 1.000 Rela From start
3/7

| Name | 2D member | Type | Dir | Value - M1
[Nm/m] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - M2
[Nm/m] | Pos x2 | Coor | Orig |
| LMS1 | S7 | Moment | Mx | 1000.00 | 0.000 | Length | 2 |
|  | LC1 | LCS | Uniform |  | 1.000 | Rela | From start |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
3.3. LC1 - Membrane
Y
3.4. Line force on 2D member edge
Name 2D member Type Dir Value - P1 Pos x1 Loc Edge
[N/m]
Load case System Distribution Value - P2 Pos x2 Coor Orig
[N/m]
LFS3 S7 Force X 600000.00 0.000 Length 2
LC2 UCS Uniform 1.000 Rela From end
3.5. Surface load
Name Dir Type Value 2D member Load case System Loc
[N/m2]
SF3 Z Force 600000.00 S5 LC2 LCS Length
SF4 Z Force 600000.00 S6 LC2 LCS Length
SF5 Z Force 600000.00 S7 LC2 LCS Length
4/7

| Name | 2D member | Type | Dir | Value - P1
[N/m] | Pos x1 | Loc | Edge |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Load case | System | Distribution | Value - P2
[N/m] | Pos x2 | Coor | Orig |
| LFS3 | S7 | Force | X | 600000.00 | 0.000 | Length | 2 |
|  | LC2 | UCS | Uniform |  | 1.000 | Rela | From end |


| Name | Dir | Type | Value
[N/m2] | 2D member | Load case | System | Loc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SF3 | Z | Force | 600000.00 | S5 | LC2 | LCS | Length |
| SF4 | Z | Force | 600000.00 | S6 | LC2 | LCS | Length |
| SF5 | Z | Force | 600000.00 | S7 | LC2 | LCS | Length |



## Sayfa 221

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
4. RESULTS
4.1. LC1 - BENDING
Z
Y
X
4.2. 2D stress/strain
Linear calculation
Load case: LC1
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Basic stress
Name Mesh Position Case σx+
[m] [MPa]
S5 Element: 30 0.000 LC1 60.0
Node: 1 0.000
1.000
S5 Element: 1 0.000 LC1 60.0
Node: 6 0.300
1.000
5/7

| Name | Mesh | Position
[m] | Case | σx+
[MPa] |
| --- | --- | --- | --- | --- |
| S5 | Element: 30
Node: 1 | 0.000
0.000
1.000 | LC1 | 60.0 |
| S5 | Element: 1
Node: 6 | 0.000
0.300
1.000 | LC1 | 60.0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
4.3. LC2 - MEMBRANE
Z
Y
X
4.4. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Basic stress
Name Mesh Position Case σx+
[m] [MPa]
S7 Element: 1818 0.500 LC2 60.3
Node: 11 0.000
0.866
S7 Element: 1801 0.342 LC2 60.3
Node: 3 0.000
0.940
6/7

| Name | Mesh | Position
[m] | Case | σx+
[MPa] |
| --- | --- | --- | --- | --- |
| S7 | Element: 1818
Node: 11 | 0.500
0.000
0.866 | LC2 | 60.3 |
| S7 | Element: 1801
Node: 3 | 0.342
0.000
0.940 | LC2 | 60.3 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS23/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
LC1 - BENDING
σx+ = 60 MPa
LC2 - MEMBRANE
σx+ = 60 MPa
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simply supported rectangular plate with uniform load
Specification: Plate - Pressure - Simple support.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 N5 2.000 0.000 0.000 N9 4.000 0.000 0.000
N2 1.000 0.000 0.000 N6 3.000 0.000 0.000 N10 5.000 0.000 0.000
N3 1.000 1.000 0.000 N7 3.000 2.000 0.000 N11 5.000 5.000 0.000
N4 0.000 1.000 0.000 N8 2.000 2.000 0.000 N12 4.000 5.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 10
D2 Calque1 plate (90) Standard S 235 constant 10
D3 Calque1 plate (90) Standard S 235 constant 10
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Free Free Free
1 Rela 1.000
Sle2 D1 From start 0.000 Rigid Rigid Rigid Free Free Free
2 Rela 1.000
Sle3 D1 From start 0.000 Rigid Rigid Rigid Free Free Free
3 Rela 1.000
Sle4 D1 From start 0.000 Rigid Rigid Rigid Free Free Free
4 Rela 1.000
Sle5 D2 From start 0.000 Rigid Rigid Rigid Free Free Free
1 Rela 1.000
1/10

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.000 | 0.000 | 0.000 |
| N3 | 1.000 | 1.000 | 0.000 |
| N4 | 0.000 | 1.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N5 | 2.000 | 0.000 | 0.000 |
| N6 | 3.000 | 0.000 | 0.000 |
| N7 | 3.000 | 2.000 | 0.000 |
| N8 | 2.000 | 2.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N9 | 4.000 | 0.000 | 0.000 |
| N10 | 5.000 | 0.000 | 0.000 |
| N11 | 5.000 | 5.000 | 0.000 |
| N12 | 4.000 | 5.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |
| D2 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |
| D3 | Calque1 | plate (90) | Standard | S 235 | constant | 10 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle5 | D2 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle6 D2 From start 0.000 Rigid Rigid Rigid Free Free Free
2 Rela 1.000
Sle7 D2 From start 0.000 Rigid Rigid Rigid Free Free Free
3 Rela 1.000
Sle8 D2 From start 0.000 Rigid Rigid Rigid Free Free Free
4 Rela 1.000
Sle9 D3 From start 0.000 Rigid Rigid Rigid Free Free Free
1 Rela 1.000
Sle10 D3 From start 0.000 Rigid Rigid Rigid Free Free Free
2 Rela 1.000
Sle11 D3 From start 0.000 Rigid Rigid Rigid Free Free Free
3 Rela 1.000
Sle12 D3 From start 0.000 Rigid Rigid Rigid Free Free Free
4 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 1.0000e+01 0.30 0 40 235.0 360.0
3.8462e+00 0.01e-003 40 80 215.0 360.0
2/10

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle6 | D2 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |
| Sle7 | D2 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle8 | D2 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle9 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle10 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |
| Sle11 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle12 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Free | Free | Free |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 1.0000e+01 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 3.8462e+00 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
Y
3.2. Surface load
Name Dir Type Value 2D member Load case System Loc
[N/m2]
SF1 Z Force 1.0000 D3 LC2 GCS Length
SF2 Z Force 1.0000 D2 LC2 GCS Length
SF3 Z Force 1.0000 D1 LC2 GCS Length
3/10

| Name | Dir | Type | Value
[N/m2] | 2D member | Load case | System | Loc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SF1 | Z | Force | 1.0000 | D3 | LC2 | GCS | Length |
| SF2 | Z | Force | 1.0000 | D2 | LC2 | GCS | Length |
| SF3 | Z | Force | 1.0000 | D1 | LC2 | GCS | Length |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
4. RESULTS
4.1. 2D internal forces; m_x
Z
Y
X
4.2. 2D internal forces; m_y
Z
Y
X
4/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
4.3. 2D internal forces; m_x
Z
Y
X
4.4. 2D internal forces; m_y
Z
Y
X
5/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
4.5. 2D internal forces; m_x
Z
Y
X
4.6. 2D internal forces; m_y
Z
Y
X
6/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
4.7. 2D displacement; u_z
Z
Y
X
4.8. 2D displacement; u_z
Z
Y
X
7/10


## Sayfa 231

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
4.9. 2D displacement; u_z
Z
Y
X
8/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
4.10. 2D internal forces
Linear calculation
Load case: LC2
Extreme: Member
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Basic magnitudes
Name Mesh x y z Case mx my
[m] [m] [m] [Nm/m] [Nm/m]
D1 Element: 1151; 0.000 0.480 0.000 LC2 0.0003 -0.0001
Node: 1226
D1 Element: 1225; 0.500 0.500 0.000 LC2 -0.0481 -0.0481
Node: 1301
D1 Element: 24; 0.480 0.000 0.000 LC2 -0.0001 0.0003
Node: 49
D2 Element: 4975; 2.500 1.000 0.000 LC2 -0.1019 -0.0464
Node: 5177
D2 Element: 4251; 2.000 0.720 0.000 LC2 0.0004 -0.0003
Node: 4439
D2 Element: 2501; 2.000 0.000 0.000 LC2 -0.0494 -0.0494
Node: 5
D2 Element: 2522; 2.440 0.000 0.000 LC2 0.0000 0.0003
Node: 2646
D3 Element: 13675; 4.500 2.480 0.000 LC2 -0.1246 -0.0377
Node: 14102
D3 Element: 9501; 4.000 0.820 0.000 LC2 0.0004 -0.0003
Node: 9845
D3 Element: 7501; 4.000 0.000 0.000 LC2 -0.0507 -0.0507
Node: 9
D3 Element: 7525; 4.500 0.000 0.000 LC2 0.0000 0.0003
Node: 7803
9/10

| Name | Mesh | x
[m] | y
[m] | z
[m] | Case | mx
[Nm/m] | my
[Nm/m] |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Element: 1151;
Node: 1226 | 0.000 | 0.480 | 0.000 | LC2 | 0.0003 | -0.0001 |
| D1 | Element: 1225;
Node: 1301 | 0.500 | 0.500 | 0.000 | LC2 | -0.0481 | -0.0481 |
| D1 | Element: 24;
Node: 49 | 0.480 | 0.000 | 0.000 | LC2 | -0.0001 | 0.0003 |
| D2 | Element: 4975;
Node: 5177 | 2.500 | 1.000 | 0.000 | LC2 | -0.1019 | -0.0464 |
| D2 | Element: 4251;
Node: 4439 | 2.000 | 0.720 | 0.000 | LC2 | 0.0004 | -0.0003 |
| D2 | Element: 2501;
Node: 5 | 2.000 | 0.000 | 0.000 | LC2 | -0.0494 | -0.0494 |
| D2 | Element: 2522;
Node: 2646 | 2.440 | 0.000 | 0.000 | LC2 | 0.0000 | 0.0003 |
| D3 | Element: 13675;
Node: 14102 | 4.500 | 2.480 | 0.000 | LC2 | -0.1246 | -0.0377 |
| D3 | Element: 9501;
Node: 9845 | 4.000 | 0.820 | 0.000 | LC2 | 0.0004 | -0.0003 |
| D3 | Element: 7501;
Node: 9 | 4.000 | 0.000 | 0.000 | LC2 | -0.0507 | -0.0507 |
| D3 | Element: 7525;
Node: 7803 | 4.500 | 0.000 | 0.000 | LC2 | 0.0000 | 0.0003 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS24/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Plate D1 :
Max deflection : 0.0443
Mx max = 0.0479
My max = 0.0479
Plate D2 :
Max deflection : 0.1106
Mx max = 0.1017
My max = 0.0464
Plate D3 :
Max deflection : 0.1416
Mx max = 0.1246
My max = 0.0375
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
10/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS26/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Simply supported rectangular plate with bending moment
Specification: Plate - Pressure - Simple support – Nodal moment
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z
[m] [m] [m]
N1 0.000 0.000 0.000
N2 40.000 0.000 0.000
N3 40.000 20.000 0.000
N4 0.000 20.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 1000
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Free Free Rigid Free Free Free
Sn2 N4 GCS Standard Free Free Rigid Free Free Free
Sn3 N2 GCS Standard Free Free Rigid Free Free Free
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 1.0000e-03 0.30 0 40 235.0 360.0
3.8462e-04 0.01e-003 40 80 215.0 360.0
1/4

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 40.000 | 0.000 | 0.000 |
| N3 | 40.000 | 20.000 | 0.000 |
| N4 | 0.000 | 20.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 1000 |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Free | Free | Rigid | Free | Free | Free |
| Sn2 | N4 | GCS | Standard | Free | Free | Rigid | Free | Free | Free |
| Sn3 | N2 | GCS | Standard | Free | Free | Rigid | Free | Free | Free |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 1.0000e-03 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 3.8462e-04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS26/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
X
Y
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[N]
F1 N3 LC2 - Permanent GCS Z Force -2.0
3.3. Moment in node
Name Node Load case System Dir Type Value - M
[Nm]
M1 N2 LC2 - Permanent GCS My Moment 10.0
M2 N3 LC2 - Permanent GCS My Moment 10.0
M3 N1 LC2 - Permanent GCS My Moment -10.0
M4 N4 LC2 - Permanent GCS My Moment -10.0
M5 N2 LC2 - Permanent GCS Mx Moment 20.0
M6 N1 LC2 - Permanent GCS Mx Moment 20.0
M7 N4 LC2 - Permanent GCS Mx Moment -20.0
M8 N3 LC2 - Permanent GCS Mx Moment -20.0
2/4

| Name | Node | Load case | System | Dir | Type | Value - F
[N] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N3 | LC2 - Permanent | GCS | Z | Force | -2.0 |


| Name | Node | Load case | System | Dir | Type | Value - M
[Nm] |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | N2 | LC2 - Permanent | GCS | My | Moment | 10.0 |
| M2 | N3 | LC2 - Permanent | GCS | My | Moment | 10.0 |
| M3 | N1 | LC2 - Permanent | GCS | My | Moment | -10.0 |
| M4 | N4 | LC2 - Permanent | GCS | My | Moment | -10.0 |
| M5 | N2 | LC2 - Permanent | GCS | Mx | Moment | 20.0 |
| M6 | N1 | LC2 - Permanent | GCS | Mx | Moment | 20.0 |
| M7 | N4 | LC2 - Permanent | GCS | Mx | Moment | -20.0 |
| M8 | N3 | LC2 - Permanent | GCS | Mx | Moment | -20.0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS26/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes; U_z
Z
Y
X
4.2. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Node
Selection: N3
Name Case Uz
[m]
N3 LC2 -12.48
3/4

| Name | Case | Uz
[m] |
| --- | --- | --- |
| N3 | LC2 | -12.48 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS26/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement uz in node N3= -12,48 mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
4/4

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS27/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Plate under perpendicular shear with one edge fixed
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z
[m] [m] [m]
N1 0.000 0.000 0.000
N2 12.000 0.000 0.000
N3 12.000 1.000 0.000
N4 0.000 1.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 50
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle2 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 1.0000e+01 0.25 0 40 235.0 360.0
4.0000e+00 0.01e-003 40 80 215.0 360.0
1/4

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 12.000 | 0.000 | 0.000 |
| N3 | 12.000 | 1.000 | 0.000 |
| N4 | 0.000 | 1.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 50 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle2 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 1.0000e+01 | 0.25 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 4.0000e+00 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS27/89
Current date 21.10.2025
3. LOAD
3.1. LC1 / Tot. value
Y
X
3.2. Point force in node
Name Node Load case System Dir Type Value - F
[kN]
F1 N2 LC2 - Permanent GCS Z Force 0.00
F2 N3 LC2 - Permanent GCS Z Force 0.00
2/4

| Name | Node | Load case | System | Dir | Type | Value - F
[kN] |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | N2 | LC2 - Permanent | GCS | Z | Force | 0.00 |
| F2 | N3 | LC2 - Permanent | GCS | Z | Force | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS27/89
Current date 21.10.2025
4. RESULTS
4.1. Displacement of nodes; U_z
Z
Y
X
4.2. Displacement of nodes
Linear calculation
Load case: LC2
Extreme: Node
Selection: N3
Name Case Uz
[mm]
N3 LC2 35.37
3/4

| Name | Case | Uz
[mm] |
| --- | --- | --- |
| N3 | LC2 | 35.37 |



## Sayfa 241

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SSLS27/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Displacement uz in node N3= 35,37mm
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
4/4

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a simply supported beam with and without prestress
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data
[m] [m]
N1 0.000 0.000 B1 Sn1
N2 2.000 0.000 B1 Sn2
N3 4.000 0.000 B2 Sn3
N4 6.000 0.000 B2 Sn4
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS3 - Rectangle (50; 50) S 235 modified 2.000 N1 N2 beam (80)
B2 CS3 - Rectangle (50; 50) S 235 modified 2.000 N3 N4 beam (80)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Free
Sn2 N2 GCS Standard Free Rigid Free
Sn3 N3 GCS Standard Rigid Rigid Free
Sn4 N4 GCS Standard Free Rigid Free
2.5. Materials
1/8

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 2.000 | 0.000 | B1 | Sn2 |
| N3 | 4.000 | 0.000 | B2 | Sn3 |
| N4 | 6.000 | 0.000 | B2 | Sn4 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS3 - Rectangle (50; 50) | S 235 modified | 2.000 | N1 | N2 | beam (80) |
| B2 | CS3 - Rectangle (50; 50) | S 235 modified | 2.000 | N3 | N4 | beam (80) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N2 | GCS | Standard | Free | Rigid | Free |
| Sn3 | N3 | GCS | Standard | Rigid | Rigid | Free |
| Sn4 | N4 | GCS | Standard | Free | Rigid | Free |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 modified 7800.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
2/8

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 modified | 7800.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
2.6. Cross-sections
Type Rectangle
Detailed 50; 50
Item material S 235 modified
A [m2] 2.5000e-03
Ay [m2], Az [m2] 2.0833e-05 2.0833e-05
AL [m2/m], AD [m2/m] 2.0000e-01 2.0000e-01
cY.UCS [mm], cZ.UCS [mm] 25 25
α [deg] 0.00
Iy [m4], Iz [m4] 5.2083e-07 5.2083e-09
iy [mm], iz [mm] 14 1
Wel.y [m3], Wel.z [m3] 2.0833e-05 2.0833e-07
Wpl.y [m3], Wpl.z [m3] 3.1250e-05 3.1250e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 7343.75 7343.75
Mpl.z.+ [Nm], Mpl.z.- [Nm] 7343.75 7343.75
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 8.7957e-09 0.0000e+00
βy [mm], βz [mm] 0 0
3/8

| CS3 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 50; 50 |  |
| Item material | S 235 modified |  |
| A [m2] | 2.5000e-03 |  |
| Ay [m2], Az [m2] | 2.0833e-05 | 2.0833e-05 |
| AL [m2/m], AD [m2/m] | 2.0000e-01 | 2.0000e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 25 | 25 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 5.2083e-07 | 5.2083e-09 |
| iy [mm], iz [mm] | 14 | 1 |
| Wel.y [m3], Wel.z [m3] | 2.0833e-05 | 2.0833e-07 |
| Wpl.y [m3], Wpl.z [m3] | 3.1250e-05 | 3.1250e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 7343.75 | 7343.75 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 7343.75 | 7343.75 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 8.7957e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
3. LOAD and MASS
3.1. LC1 / Tot. value
Z
Y X
3.2. Point force on beam
Name Member System Value - F Pos x Coor Rep (n)
[kN]
Load case Dir Type Orig Regularly
Fb2 B1 GCS -100.00 0.000 Rela 1
LC2 - Permanent X Force From end
3.3. Mass groups
Name Load case
MG1 LC1 - Poids propre
4/8

| Name | Member | System | Value - F
[kN] | Pos x | Coor | Rep (n) |
| --- | --- | --- | --- | --- | --- | --- |
|  | Load case | Dir | Type |  | Orig | Regularly |
| Fb2 | B1 | GCS | -100.00 | 0.000 | Rela | 1 |
|  | LC2 - Permanent | X | Force |  | From end |  |


| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 22.43 140.95 19866.96 0.04
2 28.70 180.33 32519.53 0.03
3 109.08 685.34 469694.71 0.01
4 114.81 721.32 520303.68 0.01
5/8

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 22.43 | 140.95 | 19866.96 | 0.04 |
| 2 | 28.70 | 180.33 | 32519.53 | 0.03 |
| 3 | 109.08 | 685.34 | 469694.71 | 0.01 |
| 4 | 114.81 | 721.32 | 520303.68 | 0.01 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y X
4.3. 3D displacement; U_total
Z
Y X
6/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y X
4.5. 3D displacement; U_total
Z
Y X
7/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 05/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Beam B1 (with initial stress):
f1 = 22.434 Hz
f2 = 109.080 Hz
Beam B2 (without initial stress):
f1 = 28.702 Hz
f2= 114.807 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
8/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of cantilever beams with variable cross-sections
2. MODEL
2.1. Analysis model
Z
Y
X
2.2. Nodes
Name Coord X Coord Y Member Data
[m] [m]
N1 0.000 0.000 B1 Sn1
N2 1.000 0.000 B1
N3 -0.001 1.020 B2 Sn2
N4 0.999 1.020 B2
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - IPE240 S 235 1.000 N1 N2 beam (80)
B2 CS1 - IPE240 S 235 1.000 N3 N4 beam (80)
2.4. Arbitrary members
Member B1
Coor Rela
length 1, Css1(1), Css2(1) 1.000 CS4 - Rectangle (40; 50) CS3 - Rectangle (10; 10)
length 2, Css1(2), Css2(2) 0.000 CS3 - Rectangle (10; 10)
Member B2
Coor Rela
length 1, Css1(1), Css2(1) 1.000 CS2 - Rectangle (40; 40) CS3 - Rectangle (10; 10)
length 2, Css1(2), Css2(2) 0.000 CS3 - Rectangle (10; 10)
1/11

| Name | Coord X
[m] | Coord Y
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 1.000 | 0.000 | B1 |  |
| N3 | -0.001 | 1.020 | B2 | Sn2 |
| N4 | 0.999 | 1.020 | B2 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - IPE240 | S 235 | 1.000 | N1 | N2 | beam (80) |
| B2 | CS1 - IPE240 | S 235 | 1.000 | N3 | N4 | beam (80) |


| AP |  |  |  |
| --- | --- | --- | --- |
| Member | B1 |  |  |
| Coor | Rela |  |  |
| length 1, Css1(1), Css2(1) | 1.000 | CS4 - Rectangle (40; 50) | CS3 - Rectangle (10; 10) |
| length 2, Css1(2), Css2(2) | 0.000 | CS3 - Rectangle (10; 10) |  |
| AP1 |  |  |  |
| Member | B2 |  |  |
| Coor | Rela |  |  |
| length 1, Css1(1), Css2(1) | 1.000 | CS2 - Rectangle (40; 40) | CS3 - Rectangle (10; 10) |
| length 2, Css1(2), Css2(2) | 0.000 | CS3 - Rectangle (10; 10) |  |



## Sayfa 251

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
2.5. Nodal supports
Name Node System Type Z Rx Ry
Sn1 N1 GCS Standard Rigid Rigid Rigid
Sn2 N3 GCS Standard Rigid Rigid Rigid
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7800.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
2/11

| Name | Node | System | Type | Z | Rx | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid |
| Sn2 | N3 | GCS | Standard | Rigid | Rigid | Rigid |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7800.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
2.7. Cross-sections
CS2 CS4
Type Rectangle Type Rectangle
Detailed 40; 40 Detailed 40; 50
Item material S 235 Item material S 235
A [m2] 1.6000e-03 A [m2] 2.0000e-03
Ay [m2], Az [m2] 1.3333e-03 1.3333e-03 Ay [m2], Az [m2] 1.6667e-03 1.6667e-03
AL [m2/m], AD [m2/m] 1.6000e-01 1.6000e-01 AL [m2/m], AD [m2/m] 1.8000e-01 1.8000e-01
cY.UCS [mm], cZ.UCS [mm] 20 20 cY.UCS [mm], cZ.UCS [mm] 25 20
α [deg] 0.00 α [deg] 0.00
Iy [m4], Iz [m4] 2.1333e-07 2.1333e-07 Iy [m4], Iz [m4] 2.6667e-07 4.1667e-07
iy [mm], iz [mm] 12 12 iy [mm], iz [mm] 12 14
Wel.y [m3], Wel.z [m3] 1.0667e-05 1.0667e-05 Wel.y [m3], Wel.z [m3] 1.3333e-05 1.6667e-05
Wpl.y [m3], Wpl.z [m3] 1.6000e-05 1.6000e-05 Wpl.y [m3], Wpl.z [m3] 2.0000e-05 2.5000e-05
Mpl.y.+ [Nm], Mpl.y.- [Nm] 3760.00 3760.00 Mpl.y.+ [Nm], Mpl.y.- [Nm] 4700.00 4700.00
Mpl.z.+ [Nm], Mpl.z.- [Nm] 3760.00 3760.00 Mpl.z.+ [Nm], Mpl.z.- [Nm] 5875.00 5875.00
dy [mm], dz [mm] 0 0 dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 3.6027e-07 0.0000e+00 It [m4], Iw [m6] 5.4984e-07 0.0000e+00
βy [mm], βz [mm] 0 0 βy [mm], βz [mm] 0 0
Picture Picture
Type Rectangle
Detailed 10; 10
Item material S 235
A [m2] 1.0000e-04
Ay [m2], Az [m2] 8.3333e-05 8.3333e-05
AL [m2/m], AD [m2/m] 4.0000e-02 4.0000e-02
cY.UCS [mm], cZ.UCS [mm] 5 5
α [deg] 0.00
Iy [m4], Iz [m4] 8.3333e-10 8.3333e-10
iy [mm], iz [mm] 3 3
Wel.y [m3], Wel.z [m3] 1.6667e-07 1.6667e-07
Wpl.y [m3], Wpl.z [m3] 2.5000e-07 2.5000e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 58.75 58.75
Mpl.z.+ [Nm], Mpl.z.- [Nm] 58.75 58.75
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.4073e-09 0.0000e+00
βy [mm], βz [mm] 0 0
3/11

| CS2 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 40; 40 |  |
| Item material | S 235 |  |
| A [m2] | 1.6000e-03 |  |
| Ay [m2], Az [m2] | 1.3333e-03 | 1.3333e-03 |
| AL [m2/m], AD [m2/m] | 1.6000e-01 | 1.6000e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 20 | 20 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.1333e-07 | 2.1333e-07 |
| iy [mm], iz [mm] | 12 | 12 |
| Wel.y [m3], Wel.z [m3] | 1.0667e-05 | 1.0667e-05 |
| Wpl.y [m3], Wpl.z [m3] | 1.6000e-05 | 1.6000e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 3760.00 | 3760.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 3760.00 | 3760.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 3.6027e-07 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS3 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 10 |  |
| Item material | S 235 |  |
| A [m2] | 1.0000e-04 |  |
| Ay [m2], Az [m2] | 8.3333e-05 | 8.3333e-05 |
| AL [m2/m], AD [m2/m] | 4.0000e-02 | 4.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 5 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 8.3333e-10 | 8.3333e-10 |
| iy [mm], iz [mm] | 3 | 3 |
| Wel.y [m3], Wel.z [m3] | 1.6667e-07 | 1.6667e-07 |
| Wpl.y [m3], Wpl.z [m3] | 2.5000e-07 | 2.5000e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 58.75 | 58.75 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 58.75 | 58.75 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.4073e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


| CS4 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 40; 50 |  |
| Item material | S 235 |  |
| A [m2] | 2.0000e-03 |  |
| Ay [m2], Az [m2] | 1.6667e-03 | 1.6667e-03 |
| AL [m2/m], AD [m2/m] | 1.8000e-01 | 1.8000e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 25 | 20 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.6667e-07 | 4.1667e-07 |
| iy [mm], iz [mm] | 12 | 14 |
| Wel.y [m3], Wel.z [m3] | 1.3333e-05 | 1.6667e-05 |
| Wpl.y [m3], Wpl.z [m3] | 2.0000e-05 | 2.5000e-05 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 4700.00 | 4700.00 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 5875.00 | 5875.00 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 5.4984e-07 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
4/11

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 54.17 340.38 115857.84 0.02
2 56.54 355.26 126211.87 0.02
3 171.88 1079.91 1166197.97 0.01
4 175.73 1104.11 1219056.10 0.01
5 384.23 2414.09 5827850.07 0.00
6 388.78 2442.72 5966859.14 0.00
7 696.70 4377.38 19161477.29 0.00
8 701.68 4408.64 19436098.30 0.00
9 1111.04 6980.67 48729819.45 0.00
10 1116.28 7013.62 49190809.39 0.00
5/11

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 54.17 | 340.38 | 115857.84 | 0.02 |
| 2 | 56.54 | 355.26 | 126211.87 | 0.02 |
| 3 | 171.88 | 1079.91 | 1166197.97 | 0.01 |
| 4 | 175.73 | 1104.11 | 1219056.10 | 0.01 |
| 5 | 384.23 | 2414.09 | 5827850.07 | 0.00 |
| 6 | 388.78 | 2442.72 | 5966859.14 | 0.00 |
| 7 | 696.70 | 4377.38 | 19161477.29 | 0.00 |
| 8 | 701.68 | 4408.64 | 19436098.30 | 0.00 |
| 9 | 1111.04 | 6980.67 | 48729819.45 | 0.00 |
| 10 | 1116.28 | 7013.62 | 49190809.39 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y
X
4.3. 3D displacement; U_total
Z
Y
X
6/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y
X
4.5. 3D displacement; U_total
Z
Y
X
7/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y
X
4.7. 3D displacement; U_total
Z
Y
X
8/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
4.8. 3D displacement; U_total
Z
Y
X
4.9. 3D displacement; U_total
Z
Y
X
9/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
4.10. 3D displacement; U_total
Z
Y
X
4.11. 3D displacement; U_total
Z
Y
X
10/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL09/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Beam B1:
f1 = 56.55 Hz
f2 = 175.79 Hz
f3 = 389.01 Hz
f4 = 702.36 Hz
f5 = 1117.63 Hz
Beam B2:
f1 = 54.18 Hz
f2 = 171.94 Hz
f3 = 384.40 Hz
f4 = 697.24 Hz
f5 = 1112.28 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
11/11


## Sayfa 261

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a fixed beam with variable cross-section.
2. MODEL
2.1. Analysis model
Z Y
2.2. Nodes
Name Coord X Coord Z Member Data
[m] [m]
N1 0.000 0.000 B1 Sn1
N2 0.600 0.000 B1 Sn2
2.3. Members
2.3.1. Members - B1
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS2 - Rectangle (10; 25) Material 0.600 N1 N2 beam (80)
2.3.1.1.Arbitrarymembers
Member B1
Coor Rela
length 1, Css1(1), Css2(1) 0.167 CS1 - Rectangle (10; 30) CS2 - Rectangle (10; 25)
length 2, Css1(2), Css2(2) 0.167 CS2 - Rectangle (10; 25) CS3 - Rectangle (10; 20)
length 3, Css1(3), Css2(3) 0.167 CS3 - Rectangle (10; 20) CS4 - Rectangle (10; 16)
length 4, Css1(4), Css2(4) 0.167 CS4 - Rectangle (10; 16) CS5 - Rectangle (10; 13)
length 5, Css1(5), Css2(5) 0.166 CS5 - Rectangle (10; 13) CS6 - Rectangle (10; 11)
length 6, Css1(6), Css2(6) 0.166 CS6 - Rectangle (10; 11) CS7 - Rectangle (10; 9)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Rigid
Sn2 N2 GCS Standard Rigid Rigid Rigid
1/11

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 0.600 | 0.000 | B1 | Sn2 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS2 - Rectangle (10; 25) | Material | 0.600 | N1 | N2 | beam (80) |


| AP |  |  |  |
| --- | --- | --- | --- |
| Member | B1 |  |  |
| Coor | Rela |  |  |
| length 1, Css1(1), Css2(1) | 0.167 | CS1 - Rectangle (10; 30) | CS2 - Rectangle (10; 25) |
| length 2, Css1(2), Css2(2) | 0.167 | CS2 - Rectangle (10; 25) | CS3 - Rectangle (10; 20) |
| length 3, Css1(3), Css2(3) | 0.167 | CS3 - Rectangle (10; 20) | CS4 - Rectangle (10; 16) |
| length 4, Css1(4), Css2(4) | 0.167 | CS4 - Rectangle (10; 16) | CS5 - Rectangle (10; 13) |
| length 5, Css1(5), Css2(5) | 0.166 | CS5 - Rectangle (10; 13) | CS6 - Rectangle (10; 11) |
| length 6, Css1(6), Css2(6) | 0.166 | CS6 - Rectangle (10; 11) | CS7 - Rectangle (10; 9) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid |
| Sn2 | N2 | GCS | Standard | Rigid | Rigid | Rigid |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 7800.00 2.0000e+05 0.30 0 40 235.0 360.0
7.6923e+04 0.01e-003 40 80 215.0 360.0
2/11

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7800.00 | 2.0000e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
2.6. Cross-sections
Type Rectangle
Detailed 10; 30
Item material Material
A [m2] 3.0000e-04
Ay [m2], Az [m2] 2.5000e-04 2.5000e-04
AL [m2/m], AD [m2/m] 8.0000e-02 8.0000e-02
cY.UCS [mm], cZ.UCS [mm] 15 5
α [deg] 0.00
Iy [m4], Iz [m4] 2.5000e-09 2.2500e-08
iy [mm], iz [mm] 3 9
Wel.y [m3], Wel.z [m3] 5.0000e-07 1.5000e-06
Wpl.y [m3], Wpl.z [m3] 7.5000e-07 2.2500e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 176.25 176.25
Mpl.z.+ [Nm], Mpl.z.- [Nm] 528.75 528.75
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 7.9003e-09 0.0000e+00
βy [mm], βz [mm] 0 0
Type Rectangle
Detailed 10; 25
Item material Material
A [m2] 2.4562e-04
Ay [m2], Az [m2] 2.0468e-04 2.0468e-04
AL [m2/m], AD [m2/m] 6.9124e-02 6.9124e-02
cY.UCS [mm], cZ.UCS [mm] 12 5
α [deg] 0.00
Iy [m4], Iz [m4] 2.0468e-09 1.2348e-08
iy [mm], iz [mm] 3 7
Wel.y [m3], Wel.z [m3] 4.0937e-07 1.0055e-06
Wpl.y [m3], Wpl.z [m3] 6.1405e-07 1.5082e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 144.30 144.30
Mpl.z.+ [Nm], Mpl.z.- [Nm] 354.43 354.43
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 6.0892e-09 0.0000e+00
βy [mm], βz [mm] 0 0
Type Rectangle
Detailed 10; 20
Item material Material
A [m2] 2.0110e-04
Ay [m2], Az [m2] 1.6758e-04 1.6758e-04
AL [m2/m], AD [m2/m] 6.0219e-02 6.0219e-02
cY.UCS [mm], cZ.UCS [mm] 10 5
α [deg] 0.00
Iy [m4], Iz [m4] 1.6758e-09 6.7769e-09
iy [mm], iz [mm] 3 6
3/11

| CS1 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 10; 30 |  |
| Item material | Material |  |
| A [m2] | 3.0000e-04 |  |
| Ay [m2], Az [m2] | 2.5000e-04 | 2.5000e-04 |
| AL [m2/m], AD [m2/m] | 8.0000e-02 | 8.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 15 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.5000e-09 | 2.2500e-08 |
| iy [mm], iz [mm] | 3 | 9 |
| Wel.y [m3], Wel.z [m3] | 5.0000e-07 | 1.5000e-06 |
| Wpl.y [m3], Wpl.z [m3] | 7.5000e-07 | 2.2500e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 176.25 | 176.25 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 528.75 | 528.75 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 7.9003e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS2 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 25 |  |
| Item material | Material |  |
| A [m2] | 2.4562e-04 |  |
| Ay [m2], Az [m2] | 2.0468e-04 | 2.0468e-04 |
| AL [m2/m], AD [m2/m] | 6.9124e-02 | 6.9124e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 12 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.0468e-09 | 1.2348e-08 |
| iy [mm], iz [mm] | 3 | 7 |
| Wel.y [m3], Wel.z [m3] | 4.0937e-07 | 1.0055e-06 |
| Wpl.y [m3], Wpl.z [m3] | 6.1405e-07 | 1.5082e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 144.30 | 144.30 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 354.43 | 354.43 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 6.0892e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS3 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 20 |  |
| Item material | Material |  |
| A [m2] | 2.0110e-04 |  |
| Ay [m2], Az [m2] | 1.6758e-04 | 1.6758e-04 |
| AL [m2/m], AD [m2/m] | 6.0219e-02 | 6.0219e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 10 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.6758e-09 | 6.7769e-09 |
| iy [mm], iz [mm] | 3 | 6 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
Wel.y [m3], Wel.z [m3] 3.3516e-07 6.7399e-07
Wpl.y [m3], Wpl.z [m3] 5.0274e-07 1.0110e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 118.14 118.14
Mpl.z.+ [Nm], Mpl.z.- [Nm] 237.58 237.58
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 4.6108e-09 0.0000e+00
βy [mm], βz [mm] 0 0
Type Rectangle
Detailed 10; 16
Item material Material
A [m2] 1.6464e-04
Ay [m2], Az [m2] 1.3720e-04 1.3720e-04
AL [m2/m], AD [m2/m] 5.2929e-02 5.2929e-02
cY.UCS [mm], cZ.UCS [mm] 8 5
α [deg] 0.00
Iy [m4], Iz [m4] 1.3720e-09 3.7192e-09
iy [mm], iz [mm] 3 5
Wel.y [m3], Wel.z [m3] 2.7441e-07 4.5179e-07
Wpl.y [m3], Wpl.z [m3] 4.1161e-07 6.7768e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 96.73 96.73
Mpl.z.+ [Nm], Mpl.z.- [Nm] 159.26 159.26
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 3.4118e-09 0.0000e+00
βy [mm], βz [mm] 0 0
Type Rectangle
Detailed 10; 13
Item material Material
A [m2] 1.3480e-04
Ay [m2], Az [m2] 1.1233e-04 1.1233e-04
AL [m2/m], AD [m2/m] 4.6960e-02 4.6960e-02
cY.UCS [mm], cZ.UCS [mm] 7 5
α [deg] 0.00
Iy [m4], Iz [m4] 1.1233e-09 2.0412e-09
iy [mm], iz [mm] 3 4
Wel.y [m3], Wel.z [m3] 2.2467e-07 3.0285e-07
Wpl.y [m3], Wpl.z [m3] 3.3700e-07 4.5427e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 79.19 79.19
Mpl.z.+ [Nm], Mpl.z.- [Nm] 106.75 106.75
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 2.4533e-09 0.0000e+00
βy [mm], βz [mm] 0 0
4/11

| Wel.y [m3], Wel.z [m3] | 3.3516e-07 | 6.7399e-07 |
| --- | --- | --- |
| Wpl.y [m3], Wpl.z [m3] | 5.0274e-07 | 1.0110e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 118.14 | 118.14 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 237.58 | 237.58 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 4.6108e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS4 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 16 |  |
| Item material | Material |  |
| A [m2] | 1.6464e-04 |  |
| Ay [m2], Az [m2] | 1.3720e-04 | 1.3720e-04 |
| AL [m2/m], AD [m2/m] | 5.2929e-02 | 5.2929e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 8 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.3720e-09 | 3.7192e-09 |
| iy [mm], iz [mm] | 3 | 5 |
| Wel.y [m3], Wel.z [m3] | 2.7441e-07 | 4.5179e-07 |
| Wpl.y [m3], Wpl.z [m3] | 4.1161e-07 | 6.7768e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 96.73 | 96.73 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 159.26 | 159.26 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 3.4118e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS5 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 13 |  |
| Item material | Material |  |
| A [m2] | 1.3480e-04 |  |
| Ay [m2], Az [m2] | 1.1233e-04 | 1.1233e-04 |
| AL [m2/m], AD [m2/m] | 4.6960e-02 | 4.6960e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 7 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.1233e-09 | 2.0412e-09 |
| iy [mm], iz [mm] | 3 | 4 |
| Wel.y [m3], Wel.z [m3] | 2.2467e-07 | 3.0285e-07 |
| Wpl.y [m3], Wpl.z [m3] | 3.3700e-07 | 4.5427e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 79.19 | 79.19 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 106.75 | 106.75 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 2.4533e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
Type Rectangle
Detailed 10; 11
Item material Material
A [m2] 1.1036e-04
Ay [m2], Az [m2] 9.1970e-05 9.1970e-05
AL [m2/m], AD [m2/m] 4.2073e-02 4.2073e-02
cY.UCS [mm], cZ.UCS [mm] 6 5
α [deg] 0.00
Iy [m4], Iz [m4] 9.1970e-10 1.1202e-09
iy [mm], iz [mm] 3 3
Wel.y [m3], Wel.z [m3] 1.8394e-07 2.0300e-07
Wpl.y [m3], Wpl.z [m3] 2.7591e-07 3.0451e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 64.84 64.84
Mpl.z.+ [Nm], Mpl.z.- [Nm] 71.56 71.56
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.7059e-09 0.0000e+00
βy [mm], βz [mm] 0 0
Type Rectangle
Detailed 10; 9
Item material Material
A [m2] 9.0358e-05
Ay [m2], Az [m2] 7.5298e-05 7.5298e-05
AL [m2/m], AD [m2/m] 3.8072e-02 3.8072e-02
cY.UCS [mm], cZ.UCS [mm] 5 5
α [deg] 0.00
Iy [m4], Iz [m4] 7.5298e-10 6.1478e-10
iy [mm], iz [mm] 3 3
Wel.y [m3], Wel.z [m3] 1.5060e-07 1.3608e-07
Wpl.y [m3], Wpl.z [m3] 2.2589e-07 2.0411e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 53.09 53.09
Mpl.z.+ [Nm], Mpl.z.- [Nm] 47.97 47.97
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 1.1432e-09 0.0000e+00
βy [mm], βz [mm] 0 0
5/11

| Picture |  |  |
| --- | --- | --- |
| CS6 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 11 |  |
| Item material | Material |  |
| A [m2] | 1.1036e-04 |  |
| Ay [m2], Az [m2] | 9.1970e-05 | 9.1970e-05 |
| AL [m2/m], AD [m2/m] | 4.2073e-02 | 4.2073e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 6 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 9.1970e-10 | 1.1202e-09 |
| iy [mm], iz [mm] | 3 | 3 |
| Wel.y [m3], Wel.z [m3] | 1.8394e-07 | 2.0300e-07 |
| Wpl.y [m3], Wpl.z [m3] | 2.7591e-07 | 3.0451e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 64.84 | 64.84 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 71.56 | 71.56 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.7059e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS7 |  |  |
| Type | Rectangle |  |
| Detailed | 10; 9 |  |
| Item material | Material |  |
| A [m2] | 9.0358e-05 |  |
| Ay [m2], Az [m2] | 7.5298e-05 | 7.5298e-05 |
| AL [m2/m], AD [m2/m] | 3.8072e-02 | 3.8072e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 5 | 5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 7.5298e-10 | 6.1478e-10 |
| iy [mm], iz [mm] | 3 | 3 |
| Wel.y [m3], Wel.z [m3] | 1.5060e-07 | 1.3608e-07 |
| Wpl.y [m3], Wpl.z [m3] | 2.2589e-07 | 2.0411e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 53.09 | 53.09 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 47.97 | 47.97 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 1.1432e-09 | 0.0000e+00 |
| βy [mm], βz [mm] | 0 | 0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
6/11

| Picture |  |  |
| --- | --- | --- |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Self weight
7/11

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Self weight |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 145.57 914.61 836511.58 0.01
2 398.64 2504.64 6273211.74 0.00
3 777.84 4887.18 23884511.42 0.00
4 1280.20 8043.48 64697575.00 0.00
8/11

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 145.57 | 914.61 | 836511.58 | 0.01 |
| 2 | 398.64 | 2504.64 | 6273211.74 | 0.00 |
| 3 | 777.84 | 4887.18 | 23884511.42 | 0.00 |
| 4 | 1280.20 | 8043.48 | 64697575.00 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y
X
4.3. 3D displacement; U_total
Z
Y
X
9/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y
X
4.5. 3D displacement; U_total
Z
Y
X
10/11


## Sayfa 271

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLL 10/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 143.3 Hz
f2 = 396.8 Hz
f3= 779.4 Hz
f4 = 1289.6 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
11/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a circular ring fixed in two points
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data Name Coord X Coord Z Member Data
[m] [m] [m] [m]
N1 0.000 0.000 B1 N5 0.187 -0.050 B1 Sn1
N2 0.100 0.100 B1 B4
N3 0.200 0.000 B1 N6 0.197 -0.026 B1
N4 0.100 -0.100 B4 N7 0.003 -0.026 B1
N8 0.013 -0.050 B1 Sn2
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS2 - Rectangle (5.0; 10.0) Material 0.419 N8 N5 general (0)
B4 CS2 - Rectangle (5.0; 10.0) Material 0.209 N8 N5 general (0)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N5 GCS Standard Rigid Rigid Rigid
Sn2 N8 GCS Standard Rigid Rigid Rigid
1/9

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 |  |
| N2 | 0.100 | 0.100 | B1 |  |
| N3 | 0.200 | 0.000 | B1 |  |
| N4 | 0.100 | -0.100 | B4 |  |


| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N5 | 0.187 | -0.050 | B1 | Sn1 |
|  |  |  | B4 |  |
| N6 | 0.197 | -0.026 | B1 |  |
| N7 | 0.003 | -0.026 | B1 |  |
| N8 | 0.013 | -0.050 | B1 | Sn2 |
|  |  |  | B4 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS2 - Rectangle (5.0; 10.0) | Material | 0.419 | N8 | N5 | general (0) |
| B4 | CS2 - Rectangle (5.0; 10.0) | Material | 0.209 | N8 | N5 | general (0) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N5 | GCS | Standard | Rigid | Rigid | Rigid |
| Sn2 | N8 | GCS | Standard | Rigid | Rigid | Rigid |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 2700.00 7.2000e+04 0.30 0.0 40.0 235.0 360.0
2.7692e+04 0.01e-003 40.0 80.0 215.0 360.0
2.6. Cross-sections
Type Rectangle
Detailed 5.0; 10.0
Item material Material
A [m2] 5.0000e-05
Ay [m2], Az [m2] 4.1667e-05 4.1667e-05
AL [m2/m], AD [m2/m] 3.0000e-02 3.0000e-02
cY.UCS [mm], cZ.UCS [mm] 5.0 2.5
α [deg] 0.00
Iy [m4], Iz [m4] 1.0417e-10 4.1667e-10
iy [mm], iz [mm] 1.4 2.9
Wel.y [m3], Wel.z [m3] 4.1667e-08 8.3333e-08
Wpl.y [m3], Wpl.z [m3] 6.2500e-08 1.2500e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 14.69 14.69
Mpl.z.+ [Nm], Mpl.z.- [Nm] 29.37 29.37
dy [mm], dz [mm] 0.0 0.0
It [m4], Iw [m6] 2.8591e-10 0.0000e+00
βy [mm], βz [mm] 0.0 0.0
2/9

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 2700.00 | 7.2000e+04 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 2.7692e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


| CS2 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 5.0; 10.0 |  |
| Item material | Material |  |
| A [m2] | 5.0000e-05 |  |
| Ay [m2], Az [m2] | 4.1667e-05 | 4.1667e-05 |
| AL [m2/m], AD [m2/m] | 3.0000e-02 | 3.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 5.0 | 2.5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.0417e-10 | 4.1667e-10 |
| iy [mm], iz [mm] | 1.4 | 2.9 |
| Wel.y [m3], Wel.z [m3] | 4.1667e-08 | 8.3333e-08 |
| Wpl.y [m3], Wpl.z [m3] | 6.2500e-08 | 1.2500e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 14.69 | 14.69 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 29.37 | 29.37 |
| dy [mm], dz [mm] | 0.0 | 0.0 |
| It [m4], Iw [m6] | 2.8591e-10 | 0.0000e+00 |
| βy [mm], βz [mm] | 0.0 | 0.0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
3/9

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 235.08 1476.98 2181477.37 0.00
2 574.44 3609.23 13026522.86 0.00
3 1103.78 6935.07 48095253.54 0.00
4 1403.35 8817.25 77743973.46 0.00
5 1745.56 10967.36 120283075.20 0.00
6 2548.65 16013.16 256421365.74 0.00
7 2750.68 17282.51 298685303.01 0.00
4/9

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 235.08 | 1476.98 | 2181477.37 | 0.00 |
| 2 | 574.44 | 3609.23 | 13026522.86 | 0.00 |
| 3 | 1103.78 | 6935.07 | 48095253.54 | 0.00 |
| 4 | 1403.35 | 8817.25 | 77743973.46 | 0.00 |
| 5 | 1745.56 | 10967.36 | 120283075.20 | 0.00 |
| 6 | 2548.65 | 16013.16 | 256421365.74 | 0.00 |
| 7 | 2750.68 | 17282.51 | 298685303.01 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y X
4.3. 3D displacement; U_total
Z
Y X
5/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y X
4.5. 3D displacement; U_total
Z
Y X
6/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y X
4.7. 3D displacement; U_total
Z
Y X
7/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
4.8. 3D displacement; U_total
Z
Y X
8/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: -
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 235.3 Hz
f2 = 575.3 Hz
f3 = 1105.7 Hz
f4 = 1405.6 Hz
f5 = 1751.1 Hz
f6 = 2557.0 Hz
f7 = 2801.5 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
9/9


## Sayfa 281

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a suspended circular ring
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data Name Coord X Coord Z Member Data
[m] [m] [m] [m]
N1 0.000 0.000 B1 N6 0.197 -0.026 B1
N2 0.100 0.100 B1 N7 0.003 -0.026 B1
N3 0.200 0.000 B1 N8 0.013 -0.050 B1
N4 0.100 -0.100 B4 B4
B5 N9 0.100 -0.072 B5 Sn1
N5 0.187 -0.050 B1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS2 - Rectangle (5.0; 10.0) Material 0.419 N8 N5 general (0)
B4 CS2 - Rectangle (5.0; 10.0) Material 0.209 N8 N5 general (0)
B5 CS3 - Rectangle (3.0; 10.0) Material 0.028 N4 N9 column (100)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N9 GCS Standard Rigid Rigid Rigid
1/9

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | B1 |  |
| N2 | 0.100 | 0.100 | B1 |  |
| N3 | 0.200 | 0.000 | B1 |  |
| N4 | 0.100 | -0.100 | B4 |  |
|  |  |  | B5 |  |
| N5 | 0.187 | -0.050 | B1 |  |
|  |  |  | B4 |  |


| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N6 | 0.197 | -0.026 | B1 |  |
| N7 | 0.003 | -0.026 | B1 |  |
| N8 | 0.013 | -0.050 | B1 |  |
|  |  |  | B4 |  |
| N9 | 0.100 | -0.072 | B5 | Sn1 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS2 - Rectangle (5.0; 10.0) | Material | 0.419 | N8 | N5 | general (0) |
| B4 | CS2 - Rectangle (5.0; 10.0) | Material | 0.209 | N8 | N5 | general (0) |
| B5 | CS3 - Rectangle (3.0; 10.0) | Material | 0.028 | N4 | N9 | column (100) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N9 | GCS | Standard | Rigid | Rigid | Rigid |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 2700.00 7.2000e+04 0.30 0.0 40.0 235.0 360.0
2.7692e+04 0.01e-003 40.0 80.0 215.0 360.0
2/9

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 2700.00 | 7.2000e+04 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 2.7692e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
2.6. Cross-sections
Type Rectangle
Detailed 5.0; 10.0
Item material Material
A [m2] 5.0000e-05
Ay [m2], Az [m2] 4.1667e-05 4.1667e-05
AL [m2/m], AD [m2/m] 3.0000e-02 3.0000e-02
cY.UCS [mm], cZ.UCS [mm] 5.0 2.5
α [deg] 0.00
Iy [m4], Iz [m4] 1.0417e-10 4.1667e-10
iy [mm], iz [mm] 1.4 2.9
Wel.y [m3], Wel.z [m3] 4.1667e-08 8.3333e-08
Wpl.y [m3], Wpl.z [m3] 6.2500e-08 1.2500e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 14.69 14.69
Mpl.z.+ [Nm], Mpl.z.- [Nm] 29.37 29.37
dy [mm], dz [mm] 0.0 0.0
It [m4], Iw [m6] 2.8591e-10 0.0000e+00
βy [mm], βz [mm] 0.0 0.0
Type Rectangle
Detailed 3.0; 10.0
Item material Material
A [m2] 3.0000e-05
Ay [m2], Az [m2] 2.5000e-05 2.5000e-05
AL [m2/m], AD [m2/m] 2.6000e-02 2.6000e-02
cY.UCS [mm], cZ.UCS [mm] 5.0 1.5
α [deg] 0.00
Iy [m4], Iz [m4] 2.2500e-11 2.5000e-10
iy [mm], iz [mm] 0.9 2.9
Wel.y [m3], Wel.z [m3] 1.5000e-08 5.0000e-08
Wpl.y [m3], Wpl.z [m3] 2.2500e-08 7.5000e-08
Mpl.y.+ [Nm], Mpl.y.- [Nm] 5.29 5.29
Mpl.z.+ [Nm], Mpl.z.- [Nm] 17.63 17.63
dy [mm], dz [mm] 0.0 0.0
It [m4], Iw [m6] 7.2991e-11 0.0000e+00
βy [mm], βz [mm] 0.0 0.0
3/9

| CS2 |  |  |
| --- | --- | --- |
| Type | Rectangle |  |
| Detailed | 5.0; 10.0 |  |
| Item material | Material |  |
| A [m2] | 5.0000e-05 |  |
| Ay [m2], Az [m2] | 4.1667e-05 | 4.1667e-05 |
| AL [m2/m], AD [m2/m] | 3.0000e-02 | 3.0000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 5.0 | 2.5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.0417e-10 | 4.1667e-10 |
| iy [mm], iz [mm] | 1.4 | 2.9 |
| Wel.y [m3], Wel.z [m3] | 4.1667e-08 | 8.3333e-08 |
| Wpl.y [m3], Wpl.z [m3] | 6.2500e-08 | 1.2500e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 14.69 | 14.69 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 29.37 | 29.37 |
| dy [mm], dz [mm] | 0.0 | 0.0 |
| It [m4], Iw [m6] | 2.8591e-10 | 0.0000e+00 |
| βy [mm], βz [mm] | 0.0 | 0.0 |
| Picture |  |  |
| CS3 |  |  |
| Type | Rectangle |  |
| Detailed | 3.0; 10.0 |  |
| Item material | Material |  |
| A [m2] | 3.0000e-05 |  |
| Ay [m2], Az [m2] | 2.5000e-05 | 2.5000e-05 |
| AL [m2/m], AD [m2/m] | 2.6000e-02 | 2.6000e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 5.0 | 1.5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.2500e-11 | 2.5000e-10 |
| iy [mm], iz [mm] | 0.9 | 2.9 |
| Wel.y [m3], Wel.z [m3] | 1.5000e-08 | 5.0000e-08 |
| Wpl.y [m3], Wpl.z [m3] | 2.2500e-08 | 7.5000e-08 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 5.29 | 5.29 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 17.63 | 17.63 |
| dy [mm], dz [mm] | 0.0 | 0.0 |
| It [m4], Iw [m6] | 7.2991e-11 | 0.0000e+00 |
| βy [mm], βz [mm] | 0.0 | 0.0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
4/9

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 28.79 180.89 32720.84 0.03
2 189.06 1187.89 1411071.76 0.01
3 267.95 1683.53 2834278.93 0.00
4 637.78 4007.14 16057207.00 0.00
5 681.01 4278.81 18308240.58 0.00
6 1061.28 6668.04 44462754.18 0.00
5/9

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 28.79 | 180.89 | 32720.84 | 0.03 |
| 2 | 189.06 | 1187.89 | 1411071.76 | 0.01 |
| 3 | 267.95 | 1683.53 | 2834278.93 | 0.00 |
| 4 | 637.78 | 4007.14 | 16057207.00 | 0.00 |
| 5 | 681.01 | 4278.81 | 18308240.58 | 0.00 |
| 6 | 1061.28 | 6668.04 | 44462754.18 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y X
4.3. 3D displacement; U_total
Z
Y X
6/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y X
4.5. 3D displacement; U_total
Z
Y X
7/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y X
4.7. 3D displacement; U_total
Z
Y X
8/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 13/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 28.8 Hz
f2 = 189.3 Hz
f3 = 268.8 Hz
f4 = 641.0 Hz
f5 = 682.0 Hz
f6 = 1063.0 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
9/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of pipes
2. MODEL
2.1. Analysis model
Z
X Y
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data Name Coord X Coord Y Coord Z Member Data
[m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 B1 Sn1 N14 9.000 0.000 -1.000 B7 Sn7
N2 2.000 0.000 0.000 B1 Sn3 B8
B5 N15 9.000 0.000 -1.600 B8 Sn8
N8 3.000 0.000 -1.000 B5 Sn4 N16 8.707 0.000 -0.293 B7
B4 N18 13.000 0.000 0.000 B10 Sn10
N10 3.000 0.000 -3.000 B4 Sn2 N19 14.000 0.000 -1.000 B10 Sn11
N11 2.707 0.000 -0.293 B5 N21 13.707 0.000 -0.293 B10
N12 7.400 0.000 0.000 B6 Sn5
N13 8.000 0.000 0.000 B6 Sn6
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - CHS (20.0; 2.0) S 235 2.000 N1 N2 general (0)
B5 CS1 - CHS (20.0; 2.0) S 235 1.571 N2 N8 general (0)
B4 CS1 - CHS (20.0; 2.0) S 235 2.000 N8 N10 general (0)
B6 CS1 - CHS (20.0; 2.0) S 235 0.600 N12 N13 general (0)
B7 CS1 - CHS (20.0; 2.0) S 235 1.571 N13 N14 general (0)
B8 CS1 - CHS (20.0; 2.0) S 235 0.600 N14 N15 general (0)
B10 CS1 - CHS (20.0; 2.0) S 235 1.571 N18 N19 general (0)
1/12

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 2.000 | 0.000 | 0.000 | B1 | Sn3 |
|  |  |  |  | B5 |  |
| N8 | 3.000 | 0.000 | -1.000 | B5 | Sn4 |
|  |  |  |  | B4 |  |
| N10 | 3.000 | 0.000 | -3.000 | B4 | Sn2 |
| N11 | 2.707 | 0.000 | -0.293 | B5 |  |
| N12 | 7.400 | 0.000 | 0.000 | B6 | Sn5 |
| N13 | 8.000 | 0.000 | 0.000 | B6 | Sn6 |
|  |  |  |  | B7 |  |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N14 | 9.000 | 0.000 | -1.000 | B7 | Sn7 |
|  |  |  |  | B8 |  |
| N15 | 9.000 | 0.000 | -1.600 | B8 | Sn8 |
| N16 | 8.707 | 0.000 | -0.293 | B7 |  |
| N18 | 13.000 | 0.000 | 0.000 | B10 | Sn10 |
| N19 | 14.000 | 0.000 | -1.000 | B10 | Sn11 |
| N21 | 13.707 | 0.000 | -0.293 | B10 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - CHS (20.0; 2.0) | S 235 | 2.000 | N1 | N2 | general (0) |
| B5 | CS1 - CHS (20.0; 2.0) | S 235 | 1.571 | N2 | N8 | general (0) |
| B4 | CS1 - CHS (20.0; 2.0) | S 235 | 2.000 | N8 | N10 | general (0) |
| B6 | CS1 - CHS (20.0; 2.0) | S 235 | 0.600 | N12 | N13 | general (0) |
| B7 | CS1 - CHS (20.0; 2.0) | S 235 | 1.571 | N13 | N14 | general (0) |
| B8 | CS1 - CHS (20.0; 2.0) | S 235 | 0.600 | N14 | N15 | general (0) |
| B10 | CS1 - CHS (20.0; 2.0) | S 235 | 1.571 | N18 | N19 | general (0) |



## Sayfa 291

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn2 N10 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn3 N2 GCS Standard Free Rigid Rigid Free Free Free
Sn4 N8 GCS Standard Rigid Rigid Free Free Free Free
Sn5 N12 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn6 N13 GCS Standard Free Rigid Rigid Free Free Free
Sn7 N14 GCS Standard Rigid Rigid Free Free Free Free
Sn8 N15 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn10 N18 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn11 N19 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0.0 40.0 235.0 360.0
8.0769e+04 0.01e-003 40.0 80.0 215.0 360.0
2/12

| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn2 | N10 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn3 | N2 | GCS | Standard | Free | Rigid | Rigid | Free | Free | Free |
| Sn4 | N8 | GCS | Standard | Rigid | Rigid | Free | Free | Free | Free |
| Sn5 | N12 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn6 | N13 | GCS | Standard | Free | Rigid | Rigid | Free | Free | Free |
| Sn7 | N14 | GCS | Standard | Rigid | Rigid | Free | Free | Free | Free |
| Sn8 | N15 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn10 | N18 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn11 | N19 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
2.6. Cross-sections
Type CHS
Detailed 20.0; 2.0
Formcode 3 - Circular hollow section
Item material S 235
A [m2] 1.1310e-04
Ay [m2], Az [m2] 7.2000e-05 7.2000e-05
AL [m2/m], AD [m2/m] 6.2829e-02 1.1309e-01
cY.UCS [mm], cZ.UCS [mm] 10.0 10.0
α [deg] 0.00
Iy [m4], Iz [m4] 4.6370e-09 4.6370e-09
iy [mm], iz [mm] 6.4 6.4
Wel.y [m3], Wel.z [m3] 4.6370e-07 4.6370e-07
Wpl.y [m3], Wpl.z [m3] 6.5067e-07 6.5067e-07
Mpl.y.+ [Nm], Mpl.y.- [Nm] 152.86 152.86
Mpl.z.+ [Nm], Mpl.z.- [Nm] 152.86 152.86
dy [mm], dz [mm] 0.0 0.0
It [m4], Iw [m6] 9.1609e-09 1.0996e-45
βy [mm], βz [mm] 0.0 0.0
3/12

| CS1 |  |  |
| --- | --- | --- |
| Type | CHS |  |
| Detailed | 20.0; 2.0 |  |
| Formcode | 3 - Circular hollow section |  |
| Item material | S 235 |  |
| A [m2] | 1.1310e-04 |  |
| Ay [m2], Az [m2] | 7.2000e-05 | 7.2000e-05 |
| AL [m2/m], AD [m2/m] | 6.2829e-02 | 1.1309e-01 |
| cY.UCS [mm], cZ.UCS [mm] | 10.0 | 10.0 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 4.6370e-09 | 4.6370e-09 |
| iy [mm], iz [mm] | 6.4 | 6.4 |
| Wel.y [m3], Wel.z [m3] | 4.6370e-07 | 4.6370e-07 |
| Wpl.y [m3], Wpl.z [m3] | 6.5067e-07 | 6.5067e-07 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 152.86 | 152.86 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 152.86 | 152.86 |
| dy [mm], dz [mm] | 0.0 | 0.0 |
| It [m4], Iw [m6] | 9.1609e-09 | 1.0996e-45 |
| βy [mm], βz [mm] | 0.0 | 0.0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
4/12

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 17.58 110.47 12203.52 0.06
2 24.33 152.87 23368.02 0.04
3 24.85 156.14 24380.00 0.04
4 26.61 167.18 27949.84 0.04
5 33.04 207.56 43081.59 0.03
6 34.71 218.09 47561.80 0.03
7 43.92 275.96 76152.06 0.02
8 67.00 420.97 177219.63 0.01
9 67.40 423.46 179318.51 0.01
10 74.10 465.54 216729.43 0.01
11 74.33 467.00 218086.90 0.01
12 93.77 589.14 347084.95 0.01
13 98.04 615.98 379435.01 0.01
14 98.24 617.27 381019.53 0.01
15 101.43 637.27 406112.17 0.01
16 118.96 747.42 558640.66 0.01
17 125.07 785.80 617475.59 0.01
18 142.48 895.18 801347.29 0.01
19 143.54 901.88 813393.30 0.01
20 151.92 954.49 911044.18 0.01
21 152.20 956.30 914514.87 0.01
22 182.37 1145.81 1312877.15 0.01
23 191.13 1200.87 1442097.36 0.01
24 192.92 1212.12 1469243.38 0.01
25 206.01 1294.34 1675324.48 0.00
26 224.55 1410.85 1990490.99 0.00
5/12

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 17.58 | 110.47 | 12203.52 | 0.06 |
| 2 | 24.33 | 152.87 | 23368.02 | 0.04 |
| 3 | 24.85 | 156.14 | 24380.00 | 0.04 |
| 4 | 26.61 | 167.18 | 27949.84 | 0.04 |
| 5 | 33.04 | 207.56 | 43081.59 | 0.03 |
| 6 | 34.71 | 218.09 | 47561.80 | 0.03 |
| 7 | 43.92 | 275.96 | 76152.06 | 0.02 |
| 8 | 67.00 | 420.97 | 177219.63 | 0.01 |
| 9 | 67.40 | 423.46 | 179318.51 | 0.01 |
| 10 | 74.10 | 465.54 | 216729.43 | 0.01 |
| 11 | 74.33 | 467.00 | 218086.90 | 0.01 |
| 12 | 93.77 | 589.14 | 347084.95 | 0.01 |
| 13 | 98.04 | 615.98 | 379435.01 | 0.01 |
| 14 | 98.24 | 617.27 | 381019.53 | 0.01 |
| 15 | 101.43 | 637.27 | 406112.17 | 0.01 |
| 16 | 118.96 | 747.42 | 558640.66 | 0.01 |
| 17 | 125.07 | 785.80 | 617475.59 | 0.01 |
| 18 | 142.48 | 895.18 | 801347.29 | 0.01 |
| 19 | 143.54 | 901.88 | 813393.30 | 0.01 |
| 20 | 151.92 | 954.49 | 911044.18 | 0.01 |
| 21 | 152.20 | 956.30 | 914514.87 | 0.01 |
| 22 | 182.37 | 1145.81 | 1312877.15 | 0.01 |
| 23 | 191.13 | 1200.87 | 1442097.36 | 0.01 |
| 24 | 192.92 | 1212.12 | 1469243.38 | 0.01 |
| 25 | 206.01 | 1294.34 | 1675324.48 | 0.00 |
| 26 | 224.55 | 1410.85 | 1990490.99 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
X
Y
4.3. 3D displacement; U_total
Z
X
Y
6/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
X
Y
4.5. 3D displacement; U_total
Z
X
Y
7/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
X
Y
4.7. 3D displacement; U_total
Z
X
Y
8/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4.8. 3D displacement; U_total
Z
X
Y
4.9. 3D displacement; U_total
Z
X
Y
9/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4.10. 3D displacement; U_total
Z
X
Y
4.11. 3D displacement; U_total
Z
X
Y
10/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
4.12. 3D displacement; U_total
Z
X
Y
4.13. 3D displacement; U_total
Z
X
Y
11/12


## Sayfa 301

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 14/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Model 1:
Transversal mode 1 = 44.23 Hz
In-plane mode 1 = 119.0 Hz
Transversal mode 2 = 125.0 Hz
In-plane mode 2 = 227.0 Hz
Model 2:
Transversal mode 1 = 33.4 Hz
In-plane mode 1 = 94.0 Hz
Transversal mode 2 = 100.0Hz
In-plane mode 2 = 180.0 Hz
Model 3:
Transversal mode 1 = 17.9 Hz
Transversal mode 2 = 24.8 Hz
In-plane mode 1 = 25.3 Hz
In-plane mode 2 = 27.0 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
12/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a cantilever beam with mass at the extremity (with and withoud eccentricity) - Bending-torsion coupling
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data Name Coord X Coord Y Coord Z Member Data
[m] [m] [m] [m] [m] [m]
N1 0.048 0.000 0.000 B1 Sn1 N4 10.048 0.000 4.000 B2
N2 10.048 0.000 0.000 B1 MN1 B3
N3 0.048 0.000 4.000 B2 Sn2 N5 10.048 1.000 4.000 B3 MN3
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - CHS (350; 15) S 355 10.000 N1 N2 general (0)
B2 CS1 - CHS (350; 15) S 355 10.000 N3 N4 general (0)
B3 CS2 - Rond plein (Numerical) RIGID 1.000 N4 N5 general (0)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N1 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn2 N3 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
1/14

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | 0.048 | 0.000 | 0.000 | B1 | Sn1 |
| N2 | 10.048 | 0.000 | 0.000 | B1 | MN1 |
| N3 | 0.048 | 0.000 | 4.000 | B2 | Sn2 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N4 | 10.048 | 0.000 | 4.000 | B2 |  |
|  |  |  |  | B3 |  |
| N5 | 10.048 | 1.000 | 4.000 | B3 | MN3 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - CHS (350; 15) | S 355 | 10.000 | N1 | N2 | general (0) |
| B2 | CS1 - CHS (350; 15) | S 355 | 10.000 | N3 | N4 | general (0) |
| B3 | CS2 - Rond plein (Numerical) | RIGID | 1.000 | N4 | N5 | general (0) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn2 | N3 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 355 7800.00 2.1000e+05 0.30 0 40 355.0 490.0
8.0769e+04 0.01e-003 40 80 335.0 470.0
RIGID 0.00 3.0000e+10 0.25 0 40 235.0 360.0
1.2000e+10 0.01e-003 40 80 215.0 360.0
2.6. Cross-sections
Type CHS
Detailed 350; 15
Formcode 3 - Circular hollow section
Item material S 355
A [m2] 1.5787e-02
Ay [m2], Az [m2] 1.0050e-02 1.0050e-02
AL [m2/m], AD [m2/m] 1.0995e+00 2.1048e+00
cY.UCS [mm], cZ.UCS [mm] 175 175
α [deg] 0.00
Iy [m4], Iz [m4] 2.2190e-04 2.2190e-04
iy [mm], iz [mm] 119 119
Wel.y [m3], Wel.z [m3] 1.2680e-03 1.2680e-03
Wpl.y [m3], Wpl.z [m3] 1.6845e-03 1.6845e-03
Mpl.y.+ [Nm], Mpl.y.- [Nm] 597815.36 597815.36
Mpl.z.+ [Nm], Mpl.z.- [Nm] 597815.36 597815.36
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 4.4291e-04 6.6891e-39
βy [mm], βz [mm] 0 0
Type Rond plein
Detailed Numerical
A [m2] 7.8540e-01
Ay [m2], Az [m2] 6.7325e-01 6.7325e-01
AL [m2/m], AD [m2/m] 3.1414e+00 3.1414e+00
cY.UCS [mm], cZ.UCS [mm] 500 500
α [deg] 0.00
Iy [m4], Iz [m4] 4.9087e-02 4.9087e-02
iy [mm], iz [mm] 250 250
Wel.y [m3], Wel.z [m3] 9.8175e-02 9.8175e-02
Wpl.y [m3], Wpl.z [m3] 1.6667e-01 1.6667e-01
Mpl.y.+ [Nm], Mpl.y.- [Nm] 39154737.03 39154737.03
Mpl.z.+ [Nm], Mpl.z.- [Nm] 39154737.03 39154737.03
dy [mm], dz [mm] 0 0
It [m4], Iw [m6] 9.8109e-02 2.2156e-13
βy [mm], βz [mm] 0 0
2/14

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 355 | 7800.00 | 2.1000e+05 | 0.30 | 0 | 40 | 355.0 | 490.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40 | 80 | 335.0 | 470.0 |  |  |  |
| RIGID | 0.00 | 3.0000e+10 | 0.25 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 1.2000e+10 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


| CS1 |  |  |
| --- | --- | --- |
| Type | CHS |  |
| Detailed | 350; 15 |  |
| Formcode | 3 - Circular hollow section |  |
| Item material | S 355 |  |
| A [m2] | 1.5787e-02 |  |
| Ay [m2], Az [m2] | 1.0050e-02 | 1.0050e-02 |
| AL [m2/m], AD [m2/m] | 1.0995e+00 | 2.1048e+00 |
| cY.UCS [mm], cZ.UCS [mm] | 175 | 175 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.2190e-04 | 2.2190e-04 |
| iy [mm], iz [mm] | 119 | 119 |
| Wel.y [m3], Wel.z [m3] | 1.2680e-03 | 1.2680e-03 |
| Wpl.y [m3], Wpl.z [m3] | 1.6845e-03 | 1.6845e-03 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 597815.36 | 597815.36 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 597815.36 | 597815.36 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 4.4291e-04 | 6.6891e-39 |
| βy [mm], βz [mm] | 0 | 0 |
| Picture |  |  |
| CS2 |  |  |
| Type | Rond plein |  |
| Detailed | Numerical |  |
| A [m2] | 7.8540e-01 |  |
| Ay [m2], Az [m2] | 6.7325e-01 | 6.7325e-01 |
| AL [m2/m], AD [m2/m] | 3.1414e+00 | 3.1414e+00 |
| cY.UCS [mm], cZ.UCS [mm] | 500 | 500 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 4.9087e-02 | 4.9087e-02 |
| iy [mm], iz [mm] | 250 | 250 |
| Wel.y [m3], Wel.z [m3] | 9.8175e-02 | 9.8175e-02 |
| Wpl.y [m3], Wpl.z [m3] | 1.6667e-01 | 1.6667e-01 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 39154737.03 | 39154737.03 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 39154737.03 | 39154737.03 |
| dy [mm], dz [mm] | 0 | 0 |
| It [m4], Iw [m6] | 9.8109e-02 | 2.2156e-13 |
| βy [mm], βz [mm] | 0 | 0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
3. LOAD and MASS
3.1. LC1 / Tot. value
Z
Y
X
3.2. Nodal mass
Name Mass group M Imx Koeff mx Imy Koeff my Imz Koeff mz Node
[kg] [kgm2] [kgm2] [kgm2]
MN1 MG1 1000.00 0.00 1 0.00 1 0.00 1 N2
MN3 MG1 1000.00 0.00 1 0.00 1 0.00 1 N5
Node (10.048;0.000;0.000)
3.3. Mass groups
3/14

| Name | Mass group | M
[kg] | Imx
[kgm2] | Koeff mx | Imy
[kgm2] | Koeff my | Imz
[kgm2] | Koeff mz | Node |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MN1 | MG1 | 1000.00 | 0.00 | 1 | 0.00 | 1 | 0.00 | 1 | N2 |
| MN3 | MG1 | 1000.00 | 0.00 | 1 | 0.00 | 1 | 0.00 | 1 | N5 |


| Explanations of symbols |  |
| --- | --- |
| Node | (10.048;0.000;0.000) |


| Name |
| --- |
| MG1 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
Eigen frequencies
4/14

| Calculation protocol |
| --- |
|  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.2. 3D displacement; Beam B1
Z
Y
X
4.3. 3D displacement; Beam B1
Z
Y
X
5/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.4. 3D displacement; Beam B1
Z
Y
X
4.5. 3D displacement; Beam B1
Z
Y
X
6/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.6. 3D displacement; Beam B1
Z
Y
X
4.7. 3D displacement; Beam B1
Z
Y
X
7/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.8. 3D displacement; Beam B1
Z
Y
X
4.9. 3D displacement; Beam B1
Z
Y
X
8/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.10. 3D displacement; Beam B1
Z
Y
X
4.11. 3D displacement; Beam B1
Z
Y
X
9/14


## Sayfa 311

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.12. 3D displacement; Beam B2
Z
Y
X
4.13. 3D displacement; Beam B2
Z
Y
X
10/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.14. 3D displacement; Beam B2
Z
Y
X
4.15. 3D displacement; Beam B2
Z
Y
X
11/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.16. 3D displacement; Beam B2
Z
Y
X
4.17. 3D displacement; Beam B2
Z
Y
X
12/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
4.18. 3D displacement; Beam B2
Z
Y
X
4.19. 3D displacement; Beam B2
Z
Y
X
13/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLL 15/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Beam B1 (no eccentric mass):
Bendings 1 & 2 = 1.65 Hz
Bendings 3 & 4 = 16.07 Hz
Bendings 5 & 6 = 50.02 Hz
Tension 1 = 76.47 Hz
Torsion 1 = 80.47 Hz
Bendings 7 & 8 = 103.20
Beam B2 (with eccentric mass):
Bending + Torsion = 1.636 Hz
Bending + Tension = 1.642 Hz
Bending + Tension = 13.46 Hz
Bending + Torsion = 13.59 Hz
Bending + Torsion = 28.90 Hz
Bending + Tension = 31.96 Hz
Bending + Torsion = 61.61 Hz
Bending + Tension = 63.93 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
14/14

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a symmetric portal frame
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z Member Data Name Coord X Coord Z Member Data
[m] [m] [m] [m]
N1 -0.300 0.000 B1 Sn1 N4 0.300 0.810 B2
N2 -0.300 0.810 B1 B3
B3 N5 -0.300 0.360 B1
N3 0.300 0.000 B2 Sn2 B4
N6 0.300 0.360 B2
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Full rectangular (4.8; 29.0) S 235 0.810 N1 N2 column (100)
B2 CS1 - Full rectangular (4.8; 29.0) S 235 0.810 N3 N4 column (100)
B3 CS1 - Full rectangular (4.8; 29.0) S 235 0.600 N2 N4 beam (80)
B4 CS1 - Full rectangular (4.8; 29.0) S 235 0.600 N5 N6 beam (80)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Rigid
Sn2 N3 GCS Standard Rigid Rigid Rigid
1/12

| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N1 | -0.300 | 0.000 | B1 | Sn1 |
| N2 | -0.300 | 0.810 | B1 |  |
|  |  |  | B3 |  |
| N3 | 0.300 | 0.000 | B2 | Sn2 |


| Name | Coord X
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- |
| N4 | 0.300 | 0.810 | B2 |  |
|  |  |  | B3 |  |
| N5 | -0.300 | 0.360 | B1 |  |
|  |  |  | B4 |  |
| N6 | 0.300 | 0.360 | B2 |  |
|  |  |  | B4 |  |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Full rectangular (4.8; 29.0) | S 235 | 0.810 | N1 | N2 | column (100) |
| B2 | CS1 - Full rectangular (4.8; 29.0) | S 235 | 0.810 | N3 | N4 | column (100) |
| B3 | CS1 - Full rectangular (4.8; 29.0) | S 235 | 0.600 | N2 | N4 | beam (80) |
| B4 | CS1 - Full rectangular (4.8; 29.0) | S 235 | 0.600 | N5 | N6 | beam (80) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Rigid |
| Sn2 | N3 | GCS | Standard | Rigid | Rigid | Rigid |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0.0 40.0 235.0 360.0
8.0769e+04 0.01e-003 40.0 80.0 215.0 360.0
2.6. Cross-sections
Type Full rectangular
Detailed 4.8; 29.0
Formcode 7 - Full rectangular section
Item material S 235
A [m2] 1.3920e-04
Ay [m2], Az [m2] 1.1600e-04 1.1600e-04
AL [m2/m], AD [m2/m] 6.7600e-02 6.7600e-02
cY.UCS [mm], cZ.UCS [mm] 14.5 2.4
α [deg] 0.00
Iy [m4], Iz [m4] 2.6726e-10 9.7556e-09
iy [mm], iz [mm] 1.4 8.4
Wel.y [m3], Wel.z [m3] 1.1136e-07 6.7280e-07
Wpl.y [m3], Wpl.z [m3] 1.6704e-07 1.0092e-06
Mpl.y.+ [Nm], Mpl.y.- [Nm] 39.25 39.25
Mpl.z.+ [Nm], Mpl.z.- [Nm] 237.16 237.16
dy [mm], dz [mm] 0.0 0.0
It [m4], Iw [m6] 9.5758e-10 0.0000e+00
βy [mm], βz [mm] 0.0 0.0
2/12

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


| CS1 |  |  |
| --- | --- | --- |
| Type | Full rectangular |  |
| Detailed | 4.8; 29.0 |  |
| Formcode | 7 - Full rectangular section |  |
| Item material | S 235 |  |
| A [m2] | 1.3920e-04 |  |
| Ay [m2], Az [m2] | 1.1600e-04 | 1.1600e-04 |
| AL [m2/m], AD [m2/m] | 6.7600e-02 | 6.7600e-02 |
| cY.UCS [mm], cZ.UCS [mm] | 14.5 | 2.4 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 2.6726e-10 | 9.7556e-09 |
| iy [mm], iz [mm] | 1.4 | 8.4 |
| Wel.y [m3], Wel.z [m3] | 1.1136e-07 | 6.7280e-07 |
| Wpl.y [m3], Wpl.z [m3] | 1.6704e-07 | 1.0092e-06 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 39.25 | 39.25 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 237.16 | 237.16 |
| dy [mm], dz [mm] | 0.0 | 0.0 |
| It [m4], Iw [m6] | 9.5758e-10 | 0.0000e+00 |
| βy [mm], βz [mm] | 0.0 | 0.0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Self weight
3/12

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Self weight |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 8.75 55.00 3024.66 0.11
2 29.34 184.37 33993.26 0.03
3 43.71 274.61 75412.58 0.02
4 56.12 352.61 124331.60 0.02
5 95.86 602.30 362770.46 0.01
6 102.37 643.18 413685.92 0.01
7 146.64 921.34 848863.44 0.01
8 174.39 1095.67 1200500.42 0.01
9 178.36 1120.61 1255760.55 0.01
10 205.58 1291.65 1668361.32 0.00
11 265.81 1670.09 2789205.97 0.00
12 319.35 2006.47 4025929.16 0.00
13 334.36 2100.79 4413307.87 0.00
4/12

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 8.75 | 55.00 | 3024.66 | 0.11 |
| 2 | 29.34 | 184.37 | 33993.26 | 0.03 |
| 3 | 43.71 | 274.61 | 75412.58 | 0.02 |
| 4 | 56.12 | 352.61 | 124331.60 | 0.02 |
| 5 | 95.86 | 602.30 | 362770.46 | 0.01 |
| 6 | 102.37 | 643.18 | 413685.92 | 0.01 |
| 7 | 146.64 | 921.34 | 848863.44 | 0.01 |
| 8 | 174.39 | 1095.67 | 1200500.42 | 0.01 |
| 9 | 178.36 | 1120.61 | 1255760.55 | 0.01 |
| 10 | 205.58 | 1291.65 | 1668361.32 | 0.00 |
| 11 | 265.81 | 1670.09 | 2789205.97 | 0.00 |
| 12 | 319.35 | 2006.47 | 4025929.16 | 0.00 |
| 13 | 334.36 | 2100.79 | 4413307.87 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y X
4.3. 3D displacement; U_total
Z
Y X
5/12


## Sayfa 321

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y X
4.5. 3D displacement; U_total
Z
Y X
6/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y X
4.7. 3D displacement; U_total
Z
Y X
7/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.8. 3D displacement; U_total
Z
Y X
4.9. 3D displacement; U_total
Z
Y X
8/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.10. 3D displacement; U_total
Z
Y X
4.11. 3D displacement; U_total
Z
Y X
9/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.12. 3D displacement; U_total
Z
Y X
4.13. 3D displacement; U_total
Z
Y X
10/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
4.14. 3D displacement; U_total
Z
Y X
11/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 8.8 Hz
f2 = 29.4 Hz
f3 = 43.8 Hz
f4 = 56.3 Hz
f5 = 96.2 Hz
f6 = 102.6 Hz
f7 = 147.1 Hz
f8 = 174.8 Hz
f9 = 178.8 Hz
f10 = 206.0 Hz
f11 = 266.4 Hz
f12 = 320.0 Hz
f13 = 335.0 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
12/12

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Hovgaard problem - Modal analysis of a pipe
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Member Data Name Coord X Coord Y Coord Z Member Data
[m] [m] [m] [m] [m] [m]
N1 -2.750 0.000 -3.690 B1 Sn2 N12 0.000 -0.922 0.000 B7
N3 -2.750 0.000 -0.922 B1 B9
B5 N13 -0.914 0.000 0.000 B3
N6 -1.828 0.000 0.000 B3 B9
B5 N14 -0.267 -0.273 0.000 B9
N7 -2.480 0.000 -0.270 B5 N15 0.000 -1.960 0.000 B7 Sn1
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Tube (185.0; 6.1) Material 2.768 N1 N3 column (100)
B3 CS1 - Tube (185.0; 6.1) Material 0.914 N6 N13 beam (80)
B5 CS1 - Tube (185.0; 6.1) Material 1.448 N6 N3 beam (80)
B7 CS1 - Tube (185.0; 6.1) Material 1.038 N12 N15 beam (80)
B9 CS1 - Tube (185.0; 6.1) Material 1.440 N12 N13 beam (80)
2.4. Nodal supports
Name Node System Type X Y Z Rx Ry Rz
Sn1 N15 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
Sn2 N1 GCS Standard Rigid Rigid Rigid Rigid Rigid Rigid
1/10

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N1 | -2.750 | 0.000 | -3.690 | B1 | Sn2 |
| N3 | -2.750 | 0.000 | -0.922 | B1 |  |
|  |  |  |  | B5 |  |
| N6 | -1.828 | 0.000 | 0.000 | B3 |  |
|  |  |  |  | B5 |  |
| N7 | -2.480 | 0.000 | -0.270 | B5 |  |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] | Member | Data |
| --- | --- | --- | --- | --- | --- |
| N12 | 0.000 | -0.922 | 0.000 | B7 |  |
|  |  |  |  | B9 |  |
| N13 | -0.914 | 0.000 | 0.000 | B3 |  |
|  |  |  |  | B9 |  |
| N14 | -0.267 | -0.273 | 0.000 | B9 |  |
| N15 | 0.000 | -1.960 | 0.000 | B7 | Sn1 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Tube (185.0; 6.1) | Material | 2.768 | N1 | N3 | column (100) |
| B3 | CS1 - Tube (185.0; 6.1) | Material | 0.914 | N6 | N13 | beam (80) |
| B5 | CS1 - Tube (185.0; 6.1) | Material | 1.448 | N6 | N3 | beam (80) |
| B7 | CS1 - Tube (185.0; 6.1) | Material | 1.038 | N12 | N15 | beam (80) |
| B9 | CS1 - Tube (185.0; 6.1) | Material | 1.440 | N12 | N13 | beam (80) |


| Name | Node | System | Type | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N15 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
| Sn2 | N1 | GCS | Standard | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 13404.11 1.6580e+05 0.30 0.0 40.0 235.0 360.0
6.3769e+04 0.01e-003 40.0 80.0 215.0 360.0
2.6. Cross-sections
Type Tube
Detailed 185.0; 6.1
Item material Material
A [m2] 3.4392e-03
Ay [m2], Az [m2] 2.1895e-03 2.1895e-03
AL [m2/m], AD [m2/m] 5.8117e-01 1.1239e+00
cY.UCS [mm], cZ.UCS [mm] 92.5 92.5
α [deg] 0.00
Iy [m4], Iz [m4] 1.3772e-05 1.3772e-05
iy [mm], iz [mm] 63.3 63.3
Wel.y [m3], Wel.z [m3] 1.4889e-04 1.4889e-04
Wpl.y [m3], Wpl.z [m3] 1.9590e-04 1.9590e-04
Mpl.y.+ [Nm], Mpl.y.- [Nm] 46023.54 46023.54
Mpl.z.+ [Nm], Mpl.z.- [Nm] 46023.54 46023.54
dy [mm], dz [mm] 0.0 0.0
It [m4], Iw [m6] 2.7512e-05 0.0000e+00
βy [mm], βz [mm] 0.0 0.0
2/10

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 13404.11 | 1.6580e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 6.3769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


| CS1 |  |  |
| --- | --- | --- |
| Type | Tube |  |
| Detailed | 185.0; 6.1 |  |
| Item material | Material |  |
| A [m2] | 3.4392e-03 |  |
| Ay [m2], Az [m2] | 2.1895e-03 | 2.1895e-03 |
| AL [m2/m], AD [m2/m] | 5.8117e-01 | 1.1239e+00 |
| cY.UCS [mm], cZ.UCS [mm] | 92.5 | 92.5 |
| α [deg] | 0.00 |  |
| Iy [m4], Iz [m4] | 1.3772e-05 | 1.3772e-05 |
| iy [mm], iz [mm] | 63.3 | 63.3 |
| Wel.y [m3], Wel.z [m3] | 1.4889e-04 | 1.4889e-04 |
| Wpl.y [m3], Wpl.z [m3] | 1.9590e-04 | 1.9590e-04 |
| Mpl.y.+ [Nm], Mpl.y.- [Nm] | 46023.54 | 46023.54 |
| Mpl.z.+ [Nm], Mpl.z.- [Nm] | 46023.54 | 46023.54 |
| dy [mm], dz [mm] | 0.0 | 0.0 |
| It [m4], Iw [m6] | 2.7512e-05 | 0.0000e+00 |
| βy [mm], βz [mm] | 0.0 | 0.0 |
| Picture |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
3/10

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |



## Sayfa 331

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 11.20 70.40 4955.54 0.09
2 23.04 144.77 20957.05 0.04
3 28.03 176.10 31009.62 0.04
4 52.89 332.32 110436.28 0.02
5 57.99 364.33 132739.20 0.02
6 93.95 590.30 348457.15 0.01
7 97.55 612.91 375656.55 0.01
8 151.37 951.04 904472.88 0.01
9 153.67 965.53 932251.99 0.01
4/10

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 11.20 | 70.40 | 4955.54 | 0.09 |
| 2 | 23.04 | 144.77 | 20957.05 | 0.04 |
| 3 | 28.03 | 176.10 | 31009.62 | 0.04 |
| 4 | 52.89 | 332.32 | 110436.28 | 0.02 |
| 5 | 57.99 | 364.33 | 132739.20 | 0.02 |
| 6 | 93.95 | 590.30 | 348457.15 | 0.01 |
| 7 | 97.55 | 612.91 | 375656.55 | 0.01 |
| 8 | 151.37 | 951.04 | 904472.88 | 0.01 |
| 9 | 153.67 | 965.53 | 932251.99 | 0.01 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y
X
4.3. 3D displacement; U_total
Z
Y
X
5/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y
X
4.5. 3D displacement; U_total
Z
Y
X
6/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y
X
4.7. 3D displacement; U_total
Z
Y
X
7/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
4.8. 3D displacement; U_total
Z
Y
X
4.9. 3D displacement; U_total
Z
Y
X
8/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
4.10. 3D displacement; U_total
Z
Y
X
9/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLX 02/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 10.18 Hz
f2 = 19.54 Hz
f3 = 25.47 Hz
f4 = 48.09 Hz
f5 = 52.96 Hz
f6 = 75.94 Hz
f7 = 80.11 Hz
f8 = 122.34 Hz
f9 = 123.15Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
10/10

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a cantilever and a free plate
2. MODEL
2.1. Analysis model
Z
X Y
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
[m] [m] [m] [m] [m] [m] [m] [m] [m]
N1 0.000 0.000 0.000 N4 0.000 1.000 0.000 N7 1.000 4.000 0.000
N2 1.000 0.000 0.000 N5 0.000 3.000 0.000 N8 0.000 4.000 0.000
N3 1.000 1.000 0.000 N6 1.000 3.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 10.0
D2 Calque1 plate (90) Standard S 235 constant 10.0
1/11

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.000 | 0.000 | 0.000 |
| N3 | 1.000 | 1.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N4 | 0.000 | 1.000 | 0.000 |
| N5 | 0.000 | 3.000 | 0.000 |
| N6 | 1.000 | 3.000 | 0.000 |


| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N7 | 1.000 | 4.000 | 0.000 |
| N8 | 0.000 | 4.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |
| D2 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz Stiffness X
[MN/m2]
Edge Coor Pos x2 Stiffness Y
[MN/m2]
Stiffness Z
[MN/m2]
Sle1 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle2 D2 From start 0.000 Flexible Flexible Flexible Free Free Free 1.0000e-06
4 Rela 1.000 1.0000e-06
Sle3 D2 From start 0.000 Flexible Flexible Flexible Free Free Free 1.0000e-06
1 Rela 1.000 1.0000e-06
Sle4 D2 From start 0.000 Flexible Flexible Flexible Free Free Free 1.0000e-06
2 Rela 1.000 1.0000e-06
Sle5 D2 From start 0.000 Flexible Flexible Flexible Free Free Free 1.0000e-06
3 Rela 1.000 1.0000e-06
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0.0 40.0 235.0 360.0
8.0769e+04 0.01e-003 40.0 80.0 215.0 360.0
2/11

| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz | Stiffness X
[MN/m2] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  | Stiffness Y
[MN/m2] |
|  |  |  |  |  |  |  |  |  |  | Stiffness Z
[MN/m2] |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |  |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |
| Sle2 | D2 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free | 1.0000e-06 |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  | 1.0000e-06 |
|  |  |  |  |  |  |  |  |  |  | 1.0000e-06 |
| Sle3 | D2 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free | 1.0000e-06 |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  | 1.0000e-06 |
|  |  |  |  |  |  |  |  |  |  | 1.0000e-06 |
| Sle4 | D2 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free | 1.0000e-06 |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  | 1.0000e-06 |
|  |  |  |  |  |  |  |  |  |  | 1.0000e-06 |
| Sle5 | D2 | From start | 0.000 | Flexible | Flexible | Flexible | Free | Free | Free | 1.0000e-06 |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  | 1.0000e-06 |
|  |  |  |  |  |  |  |  |  |  | 1.0000e-06 |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
3/11

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |



## Sayfa 341

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
Eigen frequencies
4/11

| Calculation protocol |
| --- |
|  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4.2. 3D displacement; Cantilever plate
Z
X Y
4.3. 3D displacement; Cantilever plate
Z
X Y
5/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4.4. 3D displacement; Cantilever plate
Z
X Y
4.5. 3D displacement; Cantilever plate
Z
X Y
6/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4.6. 3D displacement; Cantilever plate
Z
X Y
4.7. 3D displacement; Cantilever plate
Z
X Y
7/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4.8. 3D displacement; Free plate
Z
X Y
4.9. 3D displacement; Free plate
Z
X Y
8/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4.10. 3D displacement; Free plate
Z
X Y
4.11. 3D displacement; Free plate
Z
X Y
9/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
4.12. 3D displacement; Free plate
Z
X Y
10/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Cantilever plate (D1) eigenfrequencies:
f1 = 8.7266 Hz
f2 = 21.3042 Hz
f3 = 53.5542 Hz
f4 = 68.2984 Hz
f5 = 77.7448 Hz
f5 = 136.0471 Hz
Free plate (D2) eigenfrequencies:
f1 = 33.7119 Hz
f2 = 49.4558 Hz
f3 = 61.0513 Hz
f4 = 87.5160 Hz
f5 = 87.5160 Hz
NOTE : First six eigenfrequencies are nul and correspond to rigid body motion.
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
11/11

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a diamond plate with different angles
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
N1 0.000 0.000 0.000 N7 2.966 1.259 0.000 N13 6.000 0.000 0.000
N2 1.000 0.000 0.000 N8 2.000 1.000 0.000 N14 6.707 0.707 0.000
N3 1.000 1.000 0.000 N9 4.000 0.000 0.000 N15 6.707 1.707 0.000
N4 0.000 1.000 0.000 N10 4.866 0.500 0.000 N16 6.000 1.000 0.000
N5 2.000 0.000 0.000 N11 4.866 1.500 0.000
N6 2.966 0.259 0.000 N12 4.000 1.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 10.0
D2 Calque1 plate (90) Standard S 235 constant 10.0
D3 Calque1 plate (90) Standard S 235 constant 10.0
D4 Calque1 plate (90) Standard S 235 constant 10.0
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle2 D2 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle3 D3 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
Sle4 D4 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
4 Rela 1.000
1/9

| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.000 | 0.000 | 0.000 |
| N3 | 1.000 | 1.000 | 0.000 |
| N4 | 0.000 | 1.000 | 0.000 |
| N5 | 2.000 | 0.000 | 0.000 |
| N6 | 2.966 | 0.259 | 0.000 |


| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N7 | 2.966 | 1.259 | 0.000 |
| N8 | 2.000 | 1.000 | 0.000 |
| N9 | 4.000 | 0.000 | 0.000 |
| N10 | 4.866 | 0.500 | 0.000 |
| N11 | 4.866 | 1.500 | 0.000 |
| N12 | 4.000 | 1.000 | 0.000 |


| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N13 | 6.000 | 0.000 | 0.000 |
| N14 | 6.707 | 0.707 | 0.000 |
| N15 | 6.707 | 1.707 | 0.000 |
| N16 | 6.000 | 1.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |
| D2 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |
| D3 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |
| D4 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | D2 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | D4 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0.0 40.0 235.0 360.0
8.0769e+04 0.01e-003 40.0 80.0 215.0 360.0
2/9

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |



## Sayfa 351

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
3/9

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 8.64 54.29 2947.60 0.12
2 8.92 56.04 3140.87 0.11
3 9.78 61.44 3775.33 0.10
4 11.27 70.81 5013.91 0.09
5 21.13 132.74 17620.75 0.05
6 21.60 135.73 18423.69 0.05
7 23.39 146.98 21602.45 0.04
8 27.89 175.21 30698.34 0.04
4/9

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 8.64 | 54.29 | 2947.60 | 0.12 |
| 2 | 8.92 | 56.04 | 3140.87 | 0.11 |
| 3 | 9.78 | 61.44 | 3775.33 | 0.10 |
| 4 | 11.27 | 70.81 | 5013.91 | 0.09 |
| 5 | 21.13 | 132.74 | 17620.75 | 0.05 |
| 6 | 21.60 | 135.73 | 18423.69 | 0.05 |
| 7 | 23.39 | 146.98 | 21602.45 | 0.04 |
| 8 | 27.89 | 175.21 | 30698.34 | 0.04 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
4.2. 3D displacement; Plate D1
Z
Y
X
4.3. 3D displacement; Plate D1
Z
Y
X
5/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
4.4. 3D displacement; Plate D2
Z
Y
X
4.5. 3D displacement; Plate D2
Z
Y
X
6/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
4.6. 3D displacement; Plate D3
Z
Y
X
4.7. 3D displacement; Plate D3
Z
Y
X
7/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
4.8. 3D displacement; Plate D4
Z
Y
X
4.9. 3D displacement; Plate D4
Z
Y
X
8/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 02/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
PLATE D1 (0 degrees):
f1 = 8.7266 Hz
f2 = 21.3042 Hz
PLATE D2 (15 degrees):
f1 = 8.9990 Hz
f2 = 22.1714 Hz
PLATE D3 (30 degrees):
f1 = 9.8987 Hz
f2 = 25.4651 Hz
PLATE D4 (45 degrees):
f1 = 11.15 Hz
f2 = 27.0 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
9/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a thin plate simply supported on the edges.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z
N1 0.000 0.000 0.000
N2 1.500 0.000 0.000
N3 1.500 1.000 0.000
N4 0.000 1.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 10.0
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Flexible Flexible Rigid Free Free Free
1 Rela 1.000
Sle2 D1 From start 0.000 Flexible Flexible Rigid Free Free Free
2 Rela 1.000
Sle3 D1 From start 0.000 Flexible Flexible Rigid Free Free Free
3 Rela 1.000
Sle4 D1 From start 0.000 Flexible Flexible Rigid Free Free Free
4 Rela 1.000
1/8

| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N1 | 0.000 | 0.000 | 0.000 |
| N2 | 1.500 | 0.000 | 0.000 |
| N3 | 1.500 | 1.000 | 0.000 |
| N4 | 0.000 | 1.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 10.0 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | D1 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | D1 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | D1 | From start | 0.000 | Flexible | Flexible | Rigid | Free | Free | Free |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0.0 40.0 235.0 360.0
8.0769e+04 0.01e-003 40.0 80.0 215.0 360.0
2/8

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
3/8

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |



## Sayfa 361

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 0.34 2.15 4.62 2.92
2 0.34 2.15 4.62 2.92
3 0.49 3.10 9.64 2.02
4 35.46 222.79 49635.98 0.03
5 68.11 427.95 183145.09 0.01
6 109.38 687.21 472254.43 0.01
7 122.74 771.19 594736.99 0.01
8 141.49 888.98 790293.37 0.01
9 195.24 1226.70 1504790.01 0.01
4/8

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 0.34 | 2.15 | 4.62 | 2.92 |
| 2 | 0.34 | 2.15 | 4.62 | 2.92 |
| 3 | 0.49 | 3.10 | 9.64 | 2.02 |
| 4 | 35.46 | 222.79 | 49635.98 | 0.03 |
| 5 | 68.11 | 427.95 | 183145.09 | 0.01 |
| 6 | 109.38 | 687.21 | 472254.43 | 0.01 |
| 7 | 122.74 | 771.19 | 594736.99 | 0.01 |
| 8 | 141.49 | 888.98 | 790293.37 | 0.01 |
| 9 | 195.24 | 1226.70 | 1504790.01 | 0.01 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y
X
4.3. 3D displacement; U_total
Z
Y
X
5/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y
X
4.5. 3D displacement; U_total
Z
Y
X
6/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y
X
4.7. 3D displacement; U_total
Z
Y
X
7/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 03/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 35.63 Hz
f2 = 68.51 Hz
f3 = 109.62 Hz
f4 = 123.32 Hz
f5 = 142.51 Hz
f6 = 197.32 Hz
NOTE: The first three Eigenfrequencies are nul and correspond to rigid body motion.
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
8/8

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a circular ring plate fixed on the internal circumference.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z
N1 0.200 0.000 0.000
N2 0.000 0.000 0.000
N3 0.100 0.000 0.000
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard S 235 constant 1.0
2.4. 2D member openings
Name 2D member
O1 D1
2.5. Supports on 2D member edge
Name Edge Orig Pos x1 X Y Z Rx Ry Rz
Coor Pos x2
Sle1 1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
Rela 1.000
1/9

| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N1 | 0.200 | 0.000 | 0.000 |
| N2 | 0.000 | 0.000 | 0.000 |
| N3 | 0.100 | 0.000 | 0.000 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | S 235 | constant | 1.0 |


| Name | 2D member |
| --- | --- |
| O1 | D1 |


| Name | Edge | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | 1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  |  | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
2.6. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 235 7850.00 2.1000e+05 0.30 0.0 40.0 235.0 360.0
8.0769e+04 0.01e-003 40.0 80.0 215.0 360.0
2/9

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 235 | 7850.00 | 2.1000e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 8.0769e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
3/9

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 81.09 509.50 259593.39 0.01
2 82.73 519.82 270212.61 0.01
3 82.73 519.82 270212.61 0.01
4 91.49 574.85 330455.21 0.01
5 91.49 574.85 330457.35 0.01
6 115.43 725.24 525970.02 0.01
7 115.43 725.24 525970.02 0.01
8 159.11 999.72 999430.68 0.01
9 159.11 999.72 999434.13 0.01
10 222.10 1395.48 1947354.45 0.00
11 222.10 1395.48 1947354.45 0.00
12 302.58 1901.13 3614291.34 0.00
13 302.59 1901.15 3614372.30 0.00
14 399.08 2507.41 6287129.70 0.00
15 399.08 2507.41 6287129.70 0.00
16 510.57 3207.91 10290667.03 0.00
17 510.57 3207.93 10290802.62 0.00
18 529.08 3324.18 11050178.80 0.00
19 539.34 3388.67 11483054.83 0.00
20 539.34 3388.67 11483054.83 0.00
21 570.21 3582.61 12835083.28 0.00
22 570.23 3582.73 12835924.02 0.00
23 621.96 3907.75 15270480.10 0.00
24 621.96 3907.75 15270480.10 0.00
4/9

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 81.09 | 509.50 | 259593.39 | 0.01 |
| 2 | 82.73 | 519.82 | 270212.61 | 0.01 |
| 3 | 82.73 | 519.82 | 270212.61 | 0.01 |
| 4 | 91.49 | 574.85 | 330455.21 | 0.01 |
| 5 | 91.49 | 574.85 | 330457.35 | 0.01 |
| 6 | 115.43 | 725.24 | 525970.02 | 0.01 |
| 7 | 115.43 | 725.24 | 525970.02 | 0.01 |
| 8 | 159.11 | 999.72 | 999430.68 | 0.01 |
| 9 | 159.11 | 999.72 | 999434.13 | 0.01 |
| 10 | 222.10 | 1395.48 | 1947354.45 | 0.00 |
| 11 | 222.10 | 1395.48 | 1947354.45 | 0.00 |
| 12 | 302.58 | 1901.13 | 3614291.34 | 0.00 |
| 13 | 302.59 | 1901.15 | 3614372.30 | 0.00 |
| 14 | 399.08 | 2507.41 | 6287129.70 | 0.00 |
| 15 | 399.08 | 2507.41 | 6287129.70 | 0.00 |
| 16 | 510.57 | 3207.91 | 10290667.03 | 0.00 |
| 17 | 510.57 | 3207.93 | 10290802.62 | 0.00 |
| 18 | 529.08 | 3324.18 | 11050178.80 | 0.00 |
| 19 | 539.34 | 3388.67 | 11483054.83 | 0.00 |
| 20 | 539.34 | 3388.67 | 11483054.83 | 0.00 |
| 21 | 570.21 | 3582.61 | 12835083.28 | 0.00 |
| 22 | 570.23 | 3582.73 | 12835924.02 | 0.00 |
| 23 | 621.96 | 3907.75 | 15270480.10 | 0.00 |
| 24 | 621.96 | 3907.75 | 15270480.10 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
4.2. 3D displacement; U_total
Z
Y X
4.3. 3D displacement; U_total
Z
Y X
5/9


## Sayfa 371

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
4.4. 3D displacement; U_total
Z
Y X
4.5. 3D displacement; U_total
Z
Y X
6/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
4.6. 3D displacement; U_total
Z
Y X
4.7. 3D displacement; U_total
Z
Y X
7/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
4.8. 3D displacement; U_total
Z
Y X
4.9. 3D displacement; U_total
Z
Y X
8/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS04_89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 79.26 Hz
f2 = 81.09 Hz
f4 = 89.63 Hz
f6 =112.79 Hz
f18 = 518.85 Hz
f19 = 528.61 Hz
f21 = 559.09 Hz
f23 = 609.70 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
9/9

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a cantilever curve shell.
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z Name Coord X Coord Y Coord Z
N5 0.000 0.000 0.610 N7 -0.151 0.000 0.591 N9 0.151 0.305 0.591
N6 0.151 0.000 0.591 N8 0.000 0.305 0.610 N10 -0.151 0.305 0.591
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D3 Calque1 shell (98) Standard Material constant 3.0
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D3 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
2 Rela 1.000
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 7857.20 2.0685e+05 0.30 0.0 40.0 235.0 360.0
7.9558e+04 0.01e-003 40.0 80.0 215.0 360.0
1/7

| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N5 | 0.000 | 0.000 | 0.610 |
| N6 | 0.151 | 0.000 | 0.591 |


| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N7 | -0.151 | 0.000 | 0.591 |
| N8 | 0.000 | 0.305 | 0.610 |


| Name | Coord X | Coord Y | Coord Z |
| --- | --- | --- | --- |
| N9 | 0.151 | 0.305 | 0.591 |
| N10 | -0.151 | 0.305 | 0.591 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D3 | Calque1 | shell (98) | Standard | Material | constant | 3.0 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D3 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7857.20 | 2.0685e+05 | 0.30 | 0.0 | 40.0 | 235.0 | 360.0 |  |  |  |
|  |  | 7.9558e+04 | 0.01e-003 | 40.0 | 80.0 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Poids propre
2/7

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Poids propre |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
4. RESULTS
4.1. Eigen frequencies
N f 2 T
[Hz] [1/s] [1/s2] [s]
1 85.78 538.96 290473.04 0.01
2 138.32 869.07 755290.45 0.01
3 246.33 1547.71 2395393.73 0.00
4 341.59 2146.22 4606279.85 0.00
5 384.96 2418.71 5850163.98 0.00
6 526.42 3307.52 10939663.65 0.00
4.2. 3D displacement; U_total
Z
Y X
3/7

| N | f
[Hz] | [1/s] | 2
[1/s2] | T
[s] |
| --- | --- | --- | --- | --- |
| Mass combination : CM1 |  |  |  |  |
| 1 | 85.78 | 538.96 | 290473.04 | 0.01 |
| 2 | 138.32 | 869.07 | 755290.45 | 0.01 |
| 3 | 246.33 | 1547.71 | 2395393.73 | 0.00 |
| 4 | 341.59 | 2146.22 | 4606279.85 | 0.00 |
| 5 | 384.96 | 2418.71 | 5850163.98 | 0.00 |
| 6 | 526.42 | 3307.52 | 10939663.65 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
4.3. 3D displacement; U_total
Z
Y X
4.4. 3D displacement; U_total
Z
Y X
4/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
4.5. 3D displacement; U_total
Z
Y X
4.6. 3D displacement; U_total
Z
Y X
5/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
4.7. 3D displacement; U_total
Z
Y X
6/7


## Sayfa 381

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: SDLS 05/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies:
f1 = 85.6 Hz
f2 = 134.5 Hz
f3 = 259.0 Hz
f4 = 351.0 Hz
f5 = 395.0 Hz
f6 = 531.0 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
7/7

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLA 01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Modal analysis of a thin cylinder fixed at both ends.
2. MODEL
2.1. Analysis model
2.2. Nodes
Name Coord X Coord Y Coord Z
[m] [m] [m]
N1 0.076 0.000 0.000
N2 0.000 0.000 0.000
N3 0.076 0.000 0.305
N4 0.000 0.000 0.305
2.3. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
S1 Layer1 wall (80) Standard Material constant 0
2.4. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 S1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
3 Rela 1.000
Sle2 S1 From start 0.000 Rigid Rigid Rigid Rigid Rigid Rigid
1 Rela 1.000
1/6

| Name | Coord X
[m] | Coord Y
[m] | Coord Z
[m] |
| --- | --- | --- | --- |
| N1 | 0.076 | 0.000 | 0.000 |
| N2 | 0.000 | 0.000 | 0.000 |
| N3 | 0.076 | 0.000 | 0.305 |
| N4 | 0.000 | 0.000 | 0.305 |


| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Layer1 | wall (80) | Standard | Material | constant | 0 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | S1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | S1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Rigid | Rigid |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLA 01/89
Current date 21.10.2025
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 7850.00 2.0600e+05 0.30 0 40 235.0 360.0
7.9231e+04 0.01e-003 40 80 215.0 360.0
2/6

| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7850.00 | 2.0600e+05 | 0.30 | 0 | 40 | 235.0 | 360.0 |  |  |  |
|  |  | 7.9231e+04 | 0.01e-003 | 40 | 80 | 215.0 | 360.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLA 01/89
Current date 21.10.2025
3. LOAD and MASS
3.1. Mass groups
Name Load case
MG1 LC1 - Self weight
3/6

| Name | Load case |
| --- | --- |
| MG1 | LC1 - Self weight |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLA 01/89
Current date 21.10.2025
4. RESULTS
4.1. 3D displacement; m=1, n=6
Z
Y X
4.2. 3D displacement; m=2, n=6
Z
Y X
4/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLA 01/89
Current date 21.10.2025
4.3. 3D displacement; m=3, n=6
Z
Y X
5/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: AFNOR SDLA 01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Eigenfrequencies (m=1, n=6)
f = 538.5 Hz
Eigenfrequencies (m=2, n=6)
f = 1041.5 Hz
Eigenfrequencies (m=3, n=6)
f = 1764.9 Hz
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
6/6

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLL01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Arch with 2 pinned supports
Specification: Thin-walled arch - Thermal gradient - Pinned supports
2. MODEL
2.1. Analysis model
Y X
2.2. Nodes
Name Coord X Coord Z
[m] [m]
N1 0.000 0.000
N2 10.000 10.000
N3 20.000 0.000
2.3. Members
Name Cross-section Material Length Beg. node End node Type
[m]
B1 CS1 - Full rectangular (120.0; 120.0) S 355 31.416 N1 N3 general (0)
2.4. Nodal supports
Name Node System Type X Z Ry
Sn1 N1 GCS Standard Rigid Rigid Free
Sn2 N3 GCS Standard Rigid Rigid Free
2.5. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
S 355 7850.00 2.0000e+05 0.30 0.0 40.0 355.0 490.0
7.6923e+04 0.01e-003 40.0 80.0 335.0 470.0
1/5

| Name | Coord X
[m] | Coord Z
[m] |
| --- | --- | --- |
| N1 | 0.000 | 0.000 |
| N2 | 10.000 | 10.000 |
| N3 | 20.000 | 0.000 |


| Name | Cross-section | Material | Length
[m] | Beg. node | End node | Type |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | CS1 - Full rectangular (120.0; 120.0) | S 355 | 31.416 | N1 | N3 | general (0) |


| Name | Node | System | Type | X | Z | Ry |
| --- | --- | --- | --- | --- | --- | --- |
| Sn1 | N1 | GCS | Standard | Rigid | Rigid | Free |
| Sn2 | N3 | GCS | Standard | Rigid | Rigid | Free |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| S 355 | 7850.00 | 2.0000e+05 | 0.30 | 0.0 | 40.0 | 355.0 | 490.0 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40.0 | 80.0 | 335.0 | 470.0 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLL01/89
Current date 21.10.2025
3. LOAD
4. Thermal load
Name Member Load case Pos x1 Coor Orig Distribution +z - Top delta
[K]
Pos x2 -z - Bottom delta
[K]
LT1 B1 LC2 0.000 Rela From start Linear 160.00
1.000 40.00
5. LC2
Z
X Y
2/5

| Name | Member | Load case | Pos x1 | Coor | Orig | Distribution | +z - Top delta
[K] |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  | Pos x2 |  |  |  | -z - Bottom delta
[K] |
| LT1 | B1 | LC2 | 0.000 | Rela | From start | Linear | 160.00 |
|  |  |  | 1.000 |  |  |  | 40.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLL01/89
Current date 21.10.2025
6. RESULTS
7. 1D internal forces; M_y
Z
Y X
8. 1D internal forces; N
Z
Y X
3/5


## Sayfa 391

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLL01/89
Current date 21.10.2025
9. 1D internal forces; V_z
Z
Y X
10. 1D internal forces
Linear calculation
Load case: LC2
Coordinate system: Member
Extreme 1D: No
Selection: All
Selected sections: Ends, Close to middle, Inputted
Name dx Case N Vz My
[m] [N] [N] [Nm]
B1 0.000 LC2 0.00 4791.94 0.00
B1 15.708- LC2 4791.88 0.00 47918.96
B1 15.708+ LC2 4791.88 0.00 47918.96
B1 23.562- LC2 3388.37 -3388.37 33883.82
B1 23.562+ LC2 3388.37 -3388.37 33883.82
B1 31.416 LC2 0.00 -4791.94 0.00
4/5

| Name | dx
[m] | Case | N
[N] | Vz
[N] | My
[Nm] |
| --- | --- | --- | --- | --- | --- |
| B1 | 0.000 | LC2 | 0.00 | 4791.94 | 0.00 |
| B1 | 15.708- | LC2 | 4791.88 | 0.00 | 47918.96 |
| B1 | 15.708+ | LC2 | 4791.88 | 0.00 | 47918.96 |
| B1 | 23.562- | LC2 | 3388.37 | -3388.37 | 33883.82 |
| B1 | 23.562+ | LC2 | 3388.37 | -3388.37 | 33883.82 |
| B1 | 31.416 | LC2 | 0.00 | -4791.94 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLL01/89
Current date 21.10.2025
11. EXPECTED AFNOR RESULTS
For THETA= PI/2 (dx=31,416) :
M = 0 Nm
N = 0 N
V = -4792 N
For THETA= PI/4 (dx=23,562) :
M = 33883 Nm
N = -3388 N
V = -3388 N
For THETA= 0 (dx=15,708):
M = 47918 Nm
N = -4792 N
V = 0N
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLS 01/89
Current date 21.10.2025
1. TESTCASE DESCRIPTION
Thin plate deformed according to spherical curve under thermal gradient
2. MODEL
2.1. Analysis model
2.2. 2D members
Name Layer Type Element type Material Thickness type Th.
[mm]
D1 Calque1 plate (90) Standard Material constant 10.0
2.3. Supports on 2D member edge
Name 2D member Orig Pos x1 X Y Z Rx Ry Rz
Edge Coor Pos x2
Sle1 D1 From start 0.000 Rigid Rigid Rigid Rigid Free Free
1 Rela 1.000
Sle2 D1 From start 0.000 Rigid Rigid Rigid Rigid Free Free
2 Rela 1.000
Sle3 D1 From start 0.000 Rigid Rigid Rigid Rigid Free Free
3 Rela 1.000
Sle4 D1 From start 0.000 Rigid Rigid Rigid Rigid Free Free
4 Rela 1.000
2.4. Materials
Steel EC3
Name Emod μ Lower limit Upper limit Fy Fu Colour
[kg/m3] [MPa] [-] [mm] [mm] [MPa] [MPa]
Gmod α
[MPa] [m/mK]
Material 7850.00 2.0000e+05 0.30 0.0 40.0 235.00 360.00
7.6923e+04 0.01e-003 40.0 80.0 215.00 360.00
1/5

| Name | Layer | Type | Element type | Material | Thickness type | Th.
[mm] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Calque1 | plate (90) | Standard | Material | constant | 10.0 |


| Name | 2D member | Orig | Pos x1 | X | Y | Z | Rx | Ry | Rz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Edge | Coor | Pos x2 |  |  |  |  |  |  |
| Sle1 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Free | Free |
|  | 1 | Rela | 1.000 |  |  |  |  |  |  |
| Sle2 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Free | Free |
|  | 2 | Rela | 1.000 |  |  |  |  |  |  |
| Sle3 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Free | Free |
|  | 3 | Rela | 1.000 |  |  |  |  |  |  |
| Sle4 | D1 | From start | 0.000 | Rigid | Rigid | Rigid | Rigid | Free | Free |
|  | 4 | Rela | 1.000 |  |  |  |  |  |  |


| Name | [kg/m3] | Emod
[MPa] | μ
[-] | Lower limit
[mm] | Upper limit
[mm] | Fy
[MPa] | Fu
[MPa] | Colour |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Gmod
[MPa] | α
[m/mK] |  |  |  |  |  |  |  |
| Material | 7850.00 | 2.0000e+05 | 0.30 | 0.0 | 40.0 | 235.00 | 360.00 |  |  |  |
|  |  | 7.6923e+04 | 0.01e-003 | 40.0 | 80.0 | 215.00 | 360.00 |  |  |  |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLS 01/89
Current date 21.10.2025
3. LOAD
3.1. Thermal load on 2D member
Name 2D member Load case Distribution +z - Top delta -z - Bottom delta
[K] [K]
ST1 D1 LC2 Linear 100.00 0.00
3.2. LC2
Z
Y
X
2/5

| Name | 2D member | Load case | Distribution | +z - Top delta
[K] | -z - Bottom delta
[K] |
| --- | --- | --- | --- | --- | --- |
| ST1 | D1 | LC2 | Linear | 100.00 | 0.00 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLS 01/89
Current date 21.10.2025
4. RESULTS
4.1. 2D internal forces
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Basic magnitudes
Name Mesh Position Case mx
[m] [Nm/m]
D1 Element: 1 0.000 LC2 2380.95
Node: 1 0.000
0.000
4.2. 2D internal forces; m_y
Z
Y X
3/5

| Name | Mesh | Position
[m] | Case | mx
[Nm/m] |
| --- | --- | --- | --- | --- |
| D1 | Element: 1
Node: 1 | 0.000
0.000
0.000 | LC2 | 2380.95 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLS 01/89
Current date 21.10.2025
4.3. 2D stress/strain
Linear calculation
Load case: LC2
Extreme: Global
Selection: All
Location: In nodes avg. on macro. System: LCS mesh element
Membrane stress
Name Mesh Position Case σmE σm1 σm2
[m] [MPa] [MPa] [MPa]
D1 Element: 1 0.000 LC2 142.86 -142.86 -142.86
Node: 1 0.000
0.000
4.4. 2D stress/strain; σ_m1
Z
Y X
4/5

| Name | Mesh | Position
[m] | Case | σmE
[MPa] | σm1
[MPa] | σm2
[MPa] |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Element: 1
Node: 1 | 0.000
0.000
0.000 | LC2 | 142.86 | -142.86 | -142.86 |


SCIA Engineer 26.0.0016
Organization SCIA
TESTCASE: HSLS 01/89
Current date 21.10.2025
5. EXPECTED AFNOR RESULTS
Bending moment =2380,95Nm/m
Maximum stress= 142,857 MPa
REFERENCE : "Guide de validation des progiciels de calcul de structures” AFNOR, 1990
5/5

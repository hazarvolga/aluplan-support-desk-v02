# TUT [Eng] SCIA26.0 - Tutorial Steel Plate Design

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA26.0 - Tutorial Steel Plate Design-hd68m9okwgc.pdf`

---

**Toplam Sayfa:** 13


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
STEEL PLATE DESIGN

Tutorial – Steel Plate
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2026 SCIA nv. All rights reserved.
2 BV – 2026/01/08

Table of contents
Table of Contents
Table of Contents .................................................................................................................................................. 3
Introduction .......................................................................................................................................................... 4
Steel plate design according to EN1993-1-5 ............................................................................................................. 5
1. Model the steel structure within SCIA Engineer using finite elements .................................................. 5
2. Insert loads .................................................................................................................................... 6
3. Create linear stability combinations.................................................................................................. 7
4. Perform the linear stability analysis and check the buckling shape ...................................................... 8
5. Insert this buckling shape as an imperfection for the second order analysis ......................................... 9
6. Run the nonlinear analysis ............................................................................................................. 11
7. Check the plastic stresses and strains ............................................................................................. 12
BV – 2026/01/08 3

Tutorial – Steel Plate
Introduction
SCIA Engineer enables you to use the functionalities ‘Stability’ and ‘General Plasticity’ to evaluate steel plates.
This tutorial describes:
• How to activate the functionality ‘General plasticity’;
• How to perform a stability analysis;
• How to apply the buckling shape from the stability analysis in the nonlinear analysis;
• How to evaluate the results of the analysis.
4 BV – 2026/01/08

Tutorial – Steel Plate Design
Steel plate design according to EN1993-1-5
1. Model the steel structure within SCIA Engineer using finite elements
Use plastic material properties for the steel plates. Doing so, the nonlinear analysis will automatically consider the plastic
material behaviour and afterwards the plastic results can be verified in the ‘Results’ workstation of the process toolbar
(plastic stresses and strains).
More info about the module ‘General Plasticity’ can be found in our online help:
https://help.scia.net/webhelplatest/en/#analysis/nonlinear_analysis/general_plasticity/general_plasticity.htm
First activate the functionality ‘General Plasticity’ in the ‘Project settings’ (Main menu > File > Project settings). Afterwards
you can activate the plasticity behavior in the material properties. Go to ‘Libraries’ in the main menu and chose ‘Materials
from the dropdown menu:
You can model a plate of 1 m by 1 m in material quality S 235 with a thickness of 10 mm.
On top of it you can model two stiffeners of 0.05 m height in the same material quality and with the same thickness of
10 mm.
Add line supports to the edges of the 2D member with Z direction set as Rigid and all other degrees of freedom set as
Free. Put X and Y direction for 1 edge as Fixed to avoid that the model becomes unstable.
BV – 2026/01/08 5

Tutorial – Steel Plate
2. Insert loads
You can create a variable load case with a surface load of 50 kN/m² and another variable load case with a line load of
500 kN/m on the edge of the plate element. You can define a linear combination.
Put all load cases also in a nonlinear combination (to take into account plasticity of the material). For a real structure
you will define specific coefficients for each load case to perform a ULS design.
6 BV – 2026/01/08

Tutorial – Steel Plate Design
3. Create linear stability combinations
A stability analysis within SCIA Engineer is an elastic buckling shape analysis. These elastic buckling shapes need to be
inserted as being imperfections for the second order analysis according to EN1993-1-5.
Note: in this example, a unit value is used for the stability combination. In reality, you need to make stability
combinations using ULS coefficients for the loads since this is a buckling analysis.
BV – 2026/01/08 7

Tutorial – Steel Plate
4. Perform the linear stability analysis and check the buckling shape
Go to the process toolbar and press the Calculate button in the middle of the wheel. Set the average number of mesh
elements on 1D members to a value of 5 or higher and define the number of buckling modes that you want to calculate.
Go to the Results workstation in the process toolbar and choose 3D deformations. Now you can visualize the buckling
shape per calculated mode of the stability combination.
Note: the deformations from a stability combination are normalized values. So these aren’t actual displacements but can
be used to show the relative deformation between the different elements in your model.
8 BV – 2026/01/08

Tutorial – Steel Plate Design
5. Insert this buckling shape as an imperfection for the second order analysis
Now you can create a Global imperfection (Main menu > Libraries > Load cases, combinations > Global Imperfections)
based on the desired buckling shape.
Then we can apply this imperfection to the nonlinear combination. You can create a second nonlinear combination NC2
without imperfection to compare with the one with imperfection.
Again, in reality here should be used ULS coefficients for the loads.
As stated in step 4, the buckling shape is shown for a normalized value. We have to define an amplitude if we want to
use this shape as an imperfection. You can chose an imperfection based on the tables from EN1993-1-5 shown on the
next page. We will use an imperfection value of 1000 mm / 200 = 5 mm.
BV – 2026/01/08 9

Tutorial – Steel Plate
In case of combining imperfections (a leading imperfection and accompanying imperfections), you’ll need to modify the
geometry of the model or substitute the imperfections by fictitious forces on the member. SCIA Engineer allows the use
of one unique stability mode as imperfection. For each non-linear combination a different stability shape can be set as
imperfection. In case more granularity is requested, for example to combine imperfections (a leading imperfection and
accompanying imperfections), then as an alternative approach to using imperfections a set of fictitious forces can be
used.
10 BV – 2026/01/08


## Sayfa 11

Tutorial – Steel Plate Design
6. Run the nonlinear analysis
Make sure that you activate the second order analysis with the functionality ‘Geometrical nonlinearity’ in the ‘Project
settings’ enabled.
BV – 2026/01/08 11

Tutorial – Steel Plate
7. Check the plastic stresses and strains
Notice the difference between the linear results (combination CO1) and the nonlinear results taking into account the
imperfection(nonlinear combination NC1) as well as the plastic material behavior (nonlinear combinations NC1 and
NC2). Below the principal stresses:
12 BV – 2026/01/08

Tutorial – Steel Plate Design
And below the plastic strains for NC1:
The plastic strains in this last image can be used to see if the strains are below the given limits in the code of your
country. Note that the default unit value is [1e^(-4)] meaning a value of 4,5 is a plastic strain of 0,045%. The results can
of course also be shown in table results via the Report preview or Results table.
Note that you’ll need to apply a calibration factor α according to EN 1993-1-5 Annex C.
u
BV – 2026/01/08 13

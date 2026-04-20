# MAN [Eng] SCIA25.0 - Advanced Package Training Scaffolding

**Kategori:** SCIA Engineer Manual
**Kaynak:** `MAN [Eng] SCIA25.0 - Advanced Package Training Scaffolding-wg91gwh4wra.pdf`

---

**Toplam Sayfa:** 83


## Sayfa 1

ADVANCED PACKAGE TRAINING
SCAFFOLDING

Advanced Package Training – Scaffolding
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the
publisher. SCIA is not responsible for any direct or indirect damage because of imperfections in the
documentation and/or the software.
© Copyright 2025 SCIA nv. All rights reserved.
2 DD – 2025/03/03

Table of contents
Table of Contents
Table of Contents .......................................................................................................................................... 3
Introduction .................................................................................................................................................. 5
Chapter 1: Modelling the structure .......................................................................................................... 6
General .................................................................................................................................................... 6
Project data.............................................................................................................................................. 7
Materials .................................................................................................................................................. 8
Cross-sections .......................................................................................................................................... 9
Structure ................................................................................................................................................ 11
Model data............................................................................................................................................. 17
Supports ............................................................................................................................................. 17
Hinges on beams ............................................................................................................................... 19
Diagonals ........................................................................................................................................... 23
Connect and check ................................................................................................................................. 25
Chapter 2: Loads .................................................................................................................................... 26
Load cases .............................................................................................................................................. 26
LC1 – self-weight ............................................................................................................................... 27
LC2 – other permanent load............................................................................................................. 27
LC3 – service load, service condition ............................................................................................... 27
LC4 – service load, out of service condition .................................................................................... 28
LC5 – maximum wind load, parallel to façade ................................................................................. 28
LC6 – maximum wind load, perpendicular to façade ...................................................................... 31
LC7 – working wind load, parallel to façade .................................................................................... 31
LC8 – working wind load perpendicular to façade .......................................................................... 31
Linear combinations............................................................................................................................... 31
Nonlinear combinations ......................................................................................................................... 33
Nonlinear stability combinations ........................................................................................................... 33
Chapter 3: Analysis & results .................................................................................................................. 34
Linear analysis ........................................................................................................................................ 37
Bill of material ................................................................................................................................... 37
Nonlinear stability analysis..................................................................................................................... 38
Nonlinear analysis .................................................................................................................................. 40
Global frame imperfection φ ............................................................................................................ 40
Initial bow imperfection e ............................................................................................................... 44
0
Second order calculation .................................................................................................................. 45
Chapter 4: Checks .................................................................................................................................. 48
Member check ....................................................................................................................................... 48
SLS check............................................................................................................................................ 48
ULS check ........................................................................................................................................... 50
Coupler check ........................................................................................................................................ 54
General couplers ............................................................................................................................... 55
Manufacturer couplers ..................................................................................................................... 56
Interaction 3 check ............................................................................................................................ 61
Coupler check .................................................................................................................................... 63
Chapter 5: Reporting .............................................................................................................................. 66
Engineering report ................................................................................................................................. 66
Pictures .................................................................................................................................................. 66
Annex A: Characteristic values of the resistances for couplers ................................................................... 67
Annex B: Service loads according to EN 12811-1 ........................................................................................ 69
3

Advanced Package Training – Scaffolding
Annex C: Wind loads ................................................................................................................................... 71
Annex D: Stability analysis ........................................................................................................................... 73
Linear Stability ................................................................................................................................................... 73
Nonlinear Stability ............................................................................................................................................. 76
Buckling shape .................................................................................................................................................. 78
References and literature ........................................................................................................................... 82
4 DD – 2025/03/03

Chapter 1 – Modelling
Introduction
This course has been made for the scaffolding package of SCIA Engineer. In this package the following modules are
included:
Module Description
(sen)
sen.01 Curved 2D members
sens.00 Nonlinear springs, gaps
sensd.01.en Steel code check – EN 1993-1-1
sensd.06.en Scaffolding checks - EN 12811-1
sendt.01 General arrangement drawings
Below you can find an image of the workspace of SCIA Engineer and where to find the different components.
5

| Module
(sen) | Description |
| --- | --- |
| sen.00 | 1D member modeller |
|  | Productivity toolbox |
|  | Linear statics 2D |
|  | Linear statics 3D |
|  | Bridge Combinations & Design EN |
|  | Surface load generators |
| sen.01 | Planar 2D members |
|  | Curved 2D members |
|  | Cut-outs of 2D members |
| sens.00 | Tension only members |
|  | Pressure only support of soil |
|  | Nonlinear springs, gaps |
|  | Geometrical nonlinear of frames |
|  | Geometrical NL analysis of surfaces |
| sens.01 | Stability analysis of frames |
|  | Stability analysis of surfaces |
| sens.02 | Plastic analysis of steel structures |
|  | Pressure only on surfaces |
|  | Plastic analysis for surface members |
|  | Friction springs |
| sens.03 | Advanced cable analysis |
|  | Nonlinear stability analysis |
|  | Membrane elements |
|  | Nonlinear soil interaction |
| sensd.01.en | Steel code check – EN 1993-1-1 |
| sensd.06.en | Scaffolding checks - EN 12811-1 |
| sendt.01 | General arrangement drawings |


Advanced Package Training – Scaffolding
Chapter 1: Modelling the structure
General
The objective of this manual is to show a way of modelling a scaffolding (class 3) by using SCIA Engineer. In this manual
a simple example is elaborated.
The following steel scaffolding will be treated in this course:
We will use a system of Layher in this example. On the website of Layher, documentation about their system can be
found and downloaded: https://www.layher.nl/en/Documentation
Of course, other scaffolding systems are possible with SCIA Engineer as well.
Now you have the choice to start from scratch or to start from a template file.
To save time for later projects, it can help to work with a template file, where you have already defined several things,
such as:
• project data;
• national annex parameters;
• materials;
• cross-sections;
• hinge types;
• load cases and combinations (linear, nonlinear, stability).
6 DD – 2025/03/03

Chapter 1 – Modelling
Project data
When starting a new project, the following project data are chosen:
• Structure: General XYZ (or Frame XYZ)
• Material: steel S 235 and timber C24
• National Code: EC - EN
• National Annex: Belgian NBN-EN NA
Following functionalities should also be ticked on:
• Property modifiers
• Nonlinearity (+ all options for nonlinearity on the right-hand side: Beam local nonlinearity, Support
nonlinearity/basic soil spring, Initial imperfections, Geometrical nonlinearity & Friction support/soil spring)
• Stability
• Steel > Scaffolding (or Aluminium > Scaffolding if you would model with material aluminium)
On the Actions tab you can deactivate the automatic code combinations option since specific combinations for
scaffolding structures will be created:
Note: you can change project settings or functionalities afterwards via Menu bar > File > Project settings.
7

Advanced Package Training – Scaffolding
Materials
You can open the materials library via Menu bar > Libraries > Materials.
For the material, S 235 is generally used. For the standards you could create a copy of the S 235 material with a higher
self-weight to consider the additional weight of the rosettes.
According to the Zulassung of Layher (Z-8.22-64) you can calculate with a yield strength of 320 MPa for the S 235
material (for the cross-section RO48.3X3.2, so not for the diagonals/bracings with thickness 2.3 mm), so you can change
this in the material properties of the material:
Floorboards can also be inserted as members. The average weight of these elements differs from the weight of material
S 235 (due to holes in these elements, another thickness of the elements, …). That is why it is chosen to insert an
additional material in SCIA Engineer, in which the weight will be adapted. This weight can be determined as shown
below.
8 DD – 2025/03/03

Chapter 1 – Modelling
A distinction is made between floorboards of 19 cm and 32 cm. For each of them an average weight is calculated.
Name Weight Length [kg/m] Average
[kg] [m]
Floorboard 32/307 23.2 3.07 7.56
Floorboard 32/257 19.0 2.57 7.39
Floorboard 32/207 15.7 2.07 7.58
Floorboard 32/157 12.2 1.57 7.77 8.20 kg/m
Floorboard 32/140 10.8 1.40 7.71
Floorboard 32/109 10.4 1.09 9.54
Floorboard 32/73 7.2 0.73 9.86
Floorboard 19/307 18.2 3.07 5.93
Floorboard 19/257 15.5 2.57 6.03
Floorboard 19/207 12.7 2.07 6.14 6.18 kg/m
Floorboard 19/157 10.0 1.57 6.37
Floorboard 19/109 7.0 1.09 6.42
It is assumed that the floorboards have a thickness of 4 cm. The weights of the floorboards are:
• Floorboards 32 cm: ρ= = 640.6 kg/m³
0.32 m∙0.04 m
Note: in this example we consider a thickness of 4 cm for the floorboards to consider them as stiff elements. Therefore,
we shouldn’t perform a deflection check on these floorboards (the supplier should have design tables for this).
Cross-sections
We can open the cross-section dialog via Menu bar > Libraries > Cross sections. In our example we will use following
cross-sections from the Profile Library:
Name Cross section Material
Standard RO48.3X3.2 S 235-fy320
Ledger RO48.3X3.2 S 235-fy320
Guardrail RO48.3X3.2 S 235-fy320
Bracing RO48.3X2.3 S 235
Floorboard – 0.32 RECT (40; 320) FB 0.32
m
Toeboard – 0.15 m RECT (150; 20) C24
Diagonal lattice RRO30X20X2K S 235
girder
Beam lattice girder RO48.3X3.2 S 235-fy320
Note: the cross-sections Diagonal lattice girder and Beam lattice girder doesn’t have to be created if we will add these
elements with a user block.
9

| Name |  | Weight |  |  | Length |  | [kg/m] | Average |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | [kg] |  |  | [m] |  |  |  |
| Floorboard 32/307 | 23.2 |  |  | 3.07 |  |  | 7.56 | 8.20 kg/m |
| Floorboard 32/257 | 19.0 |  |  | 2.57 |  |  | 7.39 |  |
| Floorboard 32/207 | 15.7 |  |  | 2.07 |  |  | 7.58 |  |
| Floorboard 32/157 | 12.2 |  |  | 1.57 |  |  | 7.77 |  |
| Floorboard 32/140 | 10.8 |  |  | 1.40 |  |  | 7.71 |  |
| Floorboard 32/109 | 10.4 |  |  | 1.09 |  |  | 9.54 |  |
| Floorboard 32/73 | 7.2 |  |  | 0.73 |  |  | 9.86 |  |
| Floorboard 19/307 | 18.2 |  |  | 3.07 |  |  | 5.93 | 6.18 kg/m |
| Floorboard 19/257 | 15.5 |  |  | 2.57 |  |  | 6.03 |  |
| Floorboard 19/207 | 12.7 |  |  | 2.07 |  |  | 6.14 |  |
| Floorboard 19/157 | 10.0 |  |  | 1.57 |  |  | 6.37 |  |
| Floorboard 19/109 | 7.0 |  |  | 1.09 |  |  | 6.42 |  |


|  | Name |  |  | Cross section |  |  | Material |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Standard |  |  | RO48.3X3.2 |  |  | S 235-fy320 |  |  |
| Ledger |  |  | RO48.3X3.2 |  |  | S 235-fy320 |  |  |
| Guardrail |  |  | RO48.3X3.2 |  |  | S 235-fy320 |  |  |
| Bracing |  |  | RO48.3X2.3 |  |  | S 235 |  |  |
| Floorboard – 0.32
m |  |  | RECT (40; 320) |  |  | FB 0.32 |  |  |
| Toeboard – 0.15 m |  |  | RECT (150; 20) |  |  | C24 |  |  |
| Diagonal lattice
girder |  |  | RRO30X20X2K |  |  | S 235 |  |  |
| Beam lattice girder |  |  | RO48.3X3.2 |  |  | S 235-fy320 |  |  |


Advanced Package Training – Scaffolding
In you want to use a cross-section which is not present in the Profile library (e.g. the floorboard), you can use the group
Thin-walled geometric.
If also this group does not contain your profile shape, you can use the General group to create a section by yourself (for
this you need the module sen.05).
10 DD – 2025/03/03


## Sayfa 11

Chapter 1 – Modelling
Structure
First a line grid (2D or 3D) can be added to the model. When adding elements, the line grid can be used to snap to.
It could be practical to use layers (Menu bar > Libraries > Layers), which can help you later to quickly select a certain
group of elements:
Note: the toeboards will be modelled only for presentation purposes, so you can put them on a layer with property
‘Structural model only’ = Yes.
Then the elements can be added to the model. You can find the 1D members in the input panel as functions 1D
Member, Beam and Column (Input panel > Workstation Structure > Category 1D Members).
Via ALT and right-mouse click you can use the Marking menu (available in the new interface since SCIA21.1) to quickly
launch the 1D Member or Column command in the Model branch.
You can make use of the Modify commands such as Copy and Multicopy to quickly create additional levels of the
structure. You can use the Marking menu again to quickly launch the Copy or Multicopy command in the Modify
branch:
If you quickly want to edit some parameters (node coordinates, members names, load values, …), it could be practical
to use the Input table (available in the new interface since SCIA21.1) via Menu bar > Tools > Input table.
A second way of modelling the structure is by making use of user blocks. In that way you create only once a block that
you want to reuse and each time you need it, you can load it into your model.
The folder, where the user blocks should be stored, can be found through Menu bar > View > Global UI settings > tab
Templates & directories > Show directories for ‘User block libraries’:
11

Advanced Package Training – Scaffolding
Then you can import the user block with Input panel > Workstation Structure > Category Import & Blocks > User blocks:
It is also possible to import directly from CAD software. To import it you must go to Menu bar > File > Open from and
choose the desired format (XML file, Revit file, Tekla file, IFC file, …):
You can also import with the direct links with Revit or Tekla Structures. Even IFC import can be used, but then the
model should be cleaned up (align, …) with the BIM toolbox because with the IFC format we are importing a structural
model, which should be converted to an analytical model.
It is also possible to import a DWG or DXF file with Input panel > Workstation Structure > Category Import & Blocks >
Import DWG, DXF, VRML97. You can import the lines and assign the elements later or you can directly convert the lines
into beams.
12 DD – 2025/03/03

Chapter 1 – Modelling
For our structure we will start with adding a 2D line grid. You can go to Input panel > Workstation Structure > Category
Grids & Storeys > Rectangular grid. We create a grid of 2.07 + 10*2.57 + 2.07 in X direction and 1.09 m in Y direction:
Then we can use the snapping setting Line grid (you can find the snapping settings in the status bar) to add the
standards as column (define the columns as type ‘column (100)’, ‘gable column (70)’ or ‘secondary column (60)’, so the
coupler check can be performed later), the ledgers as beam and the diagonals as member. The standards have a length
of 2 m and the ledgers have lengths of 1.09 m, 2.07 m and 2.57 m.
13

Advanced Package Training – Scaffolding
Define the diagonals as type ‘wall bracing (0)’ or ‘truss diagonal (90)’ (so the coupler check can be performed later). The
diagonals are entered with an eccentricity e (in the y direction) of 48.3 mm (width of the profile). This value should be
y
given in positive or negative, depending on the direction of the diagonal. This way the wind bracings are truly on top of
the other members and not in between.
without eccentricity with eccentricity
For a ledger of 1.09 m, we will put the floorboards (with a width of 0.32 m) on 0.225 m from the edges of the ledger
and with 0.32 m between each other:
Therefore, the snapping settings Midpoints / Centers and Points on line could be used:
Now we have added the floorboards on the first level and we copy the ledgers at the 2 m level three times: 2 times over
a distance of 0.5 m in Z direction (for the guardrails) and 1 time over a distance of 0.075 m in Z direction (for the
toeboards). Then we change the properties of these copied elements to the correct cross-section and layer.
14 DD – 2025/03/03

Chapter 1 – Modelling
For the lattice girder we could make use of a user block (if we have created the block before):
The folder, where the user blocks should be stored, can be found through Menu bar > View > Global UI settings > tab
Templates & directories > Show directories for ‘User block libraries’.
Then you can import the user block with Input panel > Workstation Structure > Category Import & Blocks > User blocks
and select the block from the User library.
Note: in our example the lattice girder will be attached to the rosettes of the standards. There are also systems of
lattice girders which connect with right angle couplers to the standards. In that case you will give the lattice
girder an eccentricity and you can connect them to the standards by using a Cross-link at each connection point
(Input panel > Workstation Structure > Category Boundary conditions > Crosslink).
15

Advanced Package Training – Scaffolding
Now you can use modify (Copy, Multicopy, …) and select (Menu bar > View > Visibility or right-clicking on a property in
the property panel and choosing Expand selection, …) commands to quickly model the remaining part of the structure.
To transfer surface loads to line loads on the beams, we will make use of load panels (Input panel > Workstation
Structure > Category Load Panels > Load with load to 1D & edges).
Load panels are entities that are not considered in the FEM analysis. The stiffness is thus not considered in the
calculation, but they can redistribute the applied surface load to their edges and intermediate beams.
In our example we will add a load panel for the three sides of the scaffolding (LP1, LP2 and LP3; so not on the side of
the wall) and on the top (LP4) and the second top floor (LP5). For the side panels the load will be transferred to all
directions (especially when there is a net around the structure). For the floor panels we will transfer in 1 direction (so
the load is transferred to the floorboards).
16 DD – 2025/03/03

Chapter 1 – Modelling
Model data
Now we will add several types of model data to our model: supports (base jacks and anchors), hinges on beams
(couplers and hinges on the floorboards and diagonals) and beam nonlinearities (gaps).
You can find these input data via Input panel > Workstation Structure > Category Boundary conditions.
Supports
You can use the Marking menu again to quickly launch the Support In Node command in the Model branch:
We will add the supports for the base jacks (at the bottom nodes of the lowest standards) as nonlinear supports. In the
vertical direction these supports can only take pressure and no tension. This is entered in the Z direction with rigid press
only. The rotations are taken free in all directions.
For the degrees of freedom according to the X and Y displacements, the code EN 12812:2004, Annex B is applied. In this
code, friction coefficients between various materials are given. If we suppose that the scaffolding is placed on wood, we
can see in this code that the maximal and minimal friction coefficient between wood and steel is 1.2 and 0.5. In our
model we used a value of 0.50 to be on the conservative side.
For C flex a large value is taken. This corresponds to a large rigidity of the support in X and Y direction before the friction
is exceeded.
Note: independent friction is turned off since this corresponds to a single support that could slide in two directions. For
instance, the foot of a scaffolding support. There would be friction behaviour defined in X and Y directions, linked to the
vertical reaction. The vertical reaction contributes to both horizontal directions together.
17

Advanced Package Training – Scaffolding
We will also add anchors to connect the scaffolding to the wall behind. We will add a row of supports (only translations
in X and Y direction are set as rigid) at 4 m, 8 m, 12 m, 16 m and 20 m. For constructions over 20 m high, this needs to
be performed every 2 m upward.
Note: adding nodal supports like this is a simplification of the reality. In reality a tube will be connected to the column
(with a crosslink) and at the end of the tube (side of the wall behind) a nodal support as described above could be
added.
18 DD – 2025/03/03

Chapter 1 – Modelling
Hinges on beams
Couplers - general principle
Various coupler types are available in SCIA Engineer. For the different couplers, go to Menu bar > Libraries > Structure
and analysis > Hinge type.
In this Hinge type library you can choose following non-manufacturer types (from EN 12811) for the parameter ‘Hinge
type’:
Right angle Friction sleeve Swivel Base jack Parallel General
Note: if the functionality Scaffolding is not ticked on in Menu bar > File > Project settings > tab Functionality you will not
be able to see the hinge type library.
19

|  | Right angle |  |  | Friction sleeve |  |  | Swivel |  |  | Base jack |  |  | Parallel |  |  | General |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |


Advanced Package Training – Scaffolding
For these couplers, not only the rigidities are entered in a flexible or nonlinear way, but also the maximal allowable
forces are defined, as displayed below for the Right angle coupler:
The rigidities and maximal forces are taken from the code EN 12811-1 Annex C. These tables and figures are added in
Annex A of this manual.
20 DD – 2025/03/03


## Sayfa 21

Chapter 1 – Modelling
Couplers of manufacturers in SCIA Engineer
Not only the types that are mentioned in the code are available in SCIA Engineer. You can also find couplers from
manufacturers in the library: Cuplock, Layher and Catari (the Catari coupler is available since SCIA Engineer 20):
Cuplok Catari US
Layher Layher Layher
Variante K2000+ Variante II Variante LW
Note: ‘Layher Variante LW’ was called ‘Layher Variante HS’ before SCIA Engineer 20.
21

|  | Cuplok |  |  | Catari US |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |


|  | Layher |  |  | Layher |  |  | Layher |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Variante K2000+ |  |  | Variante II |  |  | Variante LW |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |


Advanced Package Training – Scaffolding
As you can see each of these couplers has its specific nonlinear functions and maximal forces, which are stored in the
SCIA database and which are automatically assigned when you choose the desired coupler type.
You have to select the appropriate material (steel or aluminium), because this will have an influence on the safety
factor of the coupler: when choosing for the material steel, the safety factor will be taken out of the National Annex of
EN 1993-1-1, while for aluminium the National Annex of EN 1999-1-1 is used.
In our example, a coupler of Layher is being adopted (type Variante K2000+). The values for N , V , V , M , M and
xk yk zk xk yk
M are automatically filled in (taken from Zulassung Z-8.22-64). The equation for the rotation is given by [rad] =
zk d
M/(9140 – 73.6M) and is presented by following curve:
According to this curve, a nonlinear function is linked automatically to the coupler:
Note: if you want to add other types of (manufacturer) couplers to the library, you can create the nonlinear functions
by yourself. In order to do this easily, you can use the Excel file ‘gvSEN NonLinear Function Input - rev01’ from the SCIA
garage (https://resources.scia.net/en/garage/sciagarage.htm). You also have to fill in the maximal allowable forces in
the hinge type window.
22 DD – 2025/03/03

Chapter 1 – Modelling
We will add as hinges the library item Layher Variante K2000+ to both extremities of the ledgers and guardrails in our
model.
For the connection between two standards, we will consider that the standards are rigidly connected. The overlap
length between two columns is 200 mm > 150 mm, so the columns are rigid in the x direction.
Moreover, the margin between two columns is 3.9 mm (= 48.3 mm – 2 x 3.2 mm – 38 mm), so this is less than 4 mm.
Because of this, also the degrees of freedom in the y and z directions are rigid. This is also mentioned in the code EN
12811-1 art. 10.2.3 (1.1.1.1) (the connection column - column can be considered rigid in the modelling, a hinge will not
be entered at the extremities on the standard).
For the connection between the floorboards and the ledgers, you can consider the rotation around y axis as free (and
all other degrees of freedom as rigid).
The boundary conditions on the diagonals will be discussed in the next chapter.
Diagonals
The Zulassung of Layher (Z-8.22-64 Layher AR or Z-8.22.939 Layher LW) describes how to consider the spring
stiffness for the diagonals:
Together with the information of Table 8 nonlinear functions can be created in SCIA Engineer for each type of
diagonal.
23

Advanced Package Training – Scaffolding
For the Layher Allround system with coupler K2000+ the nonlinear function for a diagonal with height 2000 mm
and field length 1088 mm would be:
• Stiffness wedge = 2 * (C * C ) / (C – C )
v,d,tube total v,d,tube total
with C = EA / (L*γM) = 21000 kN/cm² * [π * (4.83 cm / 2)²- π * (4.37 cm / 2)²] / (220.7 cm * 1.10)
v,d,tube
= 287.51 kN/cm
• Pressure part:
o 2 * (287.51 * 16.5) / (287.51 – 16.5) = 35.01 kN/cm
o 17.7 kN /35.01 kN/cm = 0.0051 m
• Tension part:
o 2 * (287.51 * 14.9) / (287.51 – 14.9) = 31.43 kN/cm
o 21.2 kN / 31.43 kN/cm = 0.0067 m
o
24 DD – 2025/03/03

Chapter 1 – Modelling
So for the connection between the standards and the diagonals we can also use Hinge on 1D. In this case you can
define the rotation around y axis as free or as flexible with a certain stiffness. There can be a discussion about the
rigidity around the z axis. In this example, it is set on rigid, although it cannot be completely considered as rigid. If you
want to enter an exact value, you must ask it to the supplier. On both ends of the element, the rotation around the x
axis and the translations in the y and z direction are ‘rigid’. We define ux as nonlinear function for the specific diagonal.
Alternatively diagonals could be modelled via Nonlinearity 1D (Input panel > Workstation Structure > Category
Boundary conditions > Nonlinearity 1D). Possibilities are:
• Type Gap: e.g. a margin of 1 mm. Note that this could cause issues during the analysis since between 0 and 1
mm displacement there is no stiffness present and the ends of the element.
• Type Limit force and as direction Limit compression. If the subtype buckling (results zero) is chosen, the
diagonal will lose its stability and bears no load at all when the limit force is reached. When the subtype plastic
yielding is used, the diagonal follows the plastic stress-strain diagram when the limit force is reached.
Another alternative is to use a coupler on the connection of the diagonal with the standard (for example Cuplok-
N as nonlinear function for ux)
Connect and check
After modelling the construction, it is recommended to check the input by using the command Check Structure
(Menu bar > Tools > Check structure). Through this function the geometry is checked on errors.
After the check, the command Connect members/nodes (Menu bar > Edit > Modify > Connect members/nodes)
is applied to the entire construction. With this function the different parts are connected to each other. Since
version 19.0 it is possible to execute the connect command automatically at the start of the calculation.
25

Advanced Package Training – Scaffolding
Chapter 2: Loads
According to EN 12811-1, two combinations should be considered for the structural design of a scaffolding: a service
condition and an out of service condition. The service condition corresponds with the self-weight of the scaffolding, a
working load on the scaffolding and a working wind load, while the out of service condition corresponds with the self-
weight, a percentage of the working load and the maximum wind load.
Load cases
There are three main types of loads which need to be considered (according to EN 12811-1, 6.2.1.):
• Permanent loads: these shall include the self-weight of the scaffolding structure, including all components,
such as platforms, fences, fans and other protective structures and any ancillary structures such as hoist
towers.
• Variable loads: these shall include service loads (loading on the working area, loads on the side protection) and
wind loads and, if appropriate, snow and ice loads.
• Accidental loads: the only load specified in the standard (EN 12811-1, 6.2.5.1) is the downward loading on the
side protection or guardrails (1.25 kN)
More details about the service loads can be found in Annex B and for the wind loads in Annex C.
We will define seven load cases in SCIA Engineer (Load cases, Combinations > Load Cases):
• LC1 – Self-weight (permanent load)
• LC2 – Other permanent load (e.g. weight of toeboards)
• LC3 – Service load, service condition (variable load)
• LC4 – Service load, out of service condition (variable load)
• LC5 – Maximum wind load X, parallel to façade (variable load)
• LC6 – Maximum wind load Y, perpendicular to façade (variable load)
• LC7 – Working wind load X, parallel to façade (variable load)
• LC8 – Working wind load Y, perpendicular to façade (variable load)
The accidental load is in many cases not considered in the analysis model.
26 DD – 2025/03/03

Chapter 2: Loads
LC1 – self-weight
This load case is automatically calculated by SCIA Engineer. It contains the self-weight of all elements that are present in
the model (standards, ledgers, guardrails, diagonals, floorboards, toeboards).
LC2 – other permanent load
Since we have put the toeboards on a ‘Structural model only’-layer, their weight will not be considered in the analysis.
So we can add the weight as a line load on the structure (ledgers).
Name Weight Length [kg/m]
[kg] [m]
Toe board 15/307 6.3 3.07 2.05
Toe board 15/257 5.7 2.57 2.22
Toe board 15/207 4.3 2.07 2.08
Toe board 15/157 3.5 1.57 2.23 2.32 kg/m
Toe board 15/109 2.5 1.09 2.29
Toe board 15/73 1.5 0.73 2.05
Toe board 15/30 1.0 0.30 3.33
LC3 – service load, service condition
This load case represents the service load that operates over the entire main floor. ‘Main floor’ means the most
important/crucial floor of the scaffolding. If the load is put on this floor, it leads to the most critical values.
In this example, a class 3 scaffolding has been inserted, so a surface load of 200 kg/m², or 2.0 kN/m² will be added
(according to EN 12811-1 Table 3, q , see also Annex B of this manual):
1
This load is applied to the load panels and will be transferred to the floorboards.
Analogous above, also a service load is entered on the complete secondary floor if a scaffolding has more than one
decked level. ‘Secondary floor’ refers to the working area at the first level above or below the main floor.
According to the code EN 12811-1, 50% of the service load must be put on the secondary floor, so we will add a load of
1.0 kN/m² to the second top load panel.
You can add loads via Input panel > Workstation Loads > Category Surface Loads > Surface load on 2D.
27

| Name |  | Weight |  |  | Length |  | [kg/m] | Average |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | [kg] |  |  | [m] |  |  |  |
| Toe board 15/307 | 6.3 |  |  | 3.07 |  |  | 2.05 | 2.32 kg/m |
| Toe board 15/257 | 5.7 |  |  | 2.57 |  |  | 2.22 |  |
| Toe board 15/207 | 4.3 |  |  | 2.07 |  |  | 2.08 |  |
| Toe board 15/157 | 3.5 |  |  | 1.57 |  |  | 2.23 |  |
| Toe board 15/109 | 2.5 |  |  | 1.09 |  |  | 2.29 |  |
| Toe board 15/73 | 1.5 |  |  | 0.73 |  |  | 2.05 |  |
| Toe board 15/30 | 1.0 |  |  | 0.30 |  |  | 3.33 |  |


Advanced Package Training – Scaffolding
LC4 – service load, out of service condition
This load case represents an accumulation of materials and equipment for the complete main working area (when the
scaffolding is subject to the maximal wind load).
A percentage of the uniformly distributed service load (EN 12811-1, Table 3, q ) acting on the working area of the most
1
unfavourable decked level. The value of the percentage depends on the class of the scaffolding:
• Class 1: 0% (no service load on the working area)
• Classes 2 and 3: 25% (representing some stored materials on the working area)
• Classes 4, 5 and 6: 50% (representing some stored materials on the working area)
For our class 3 structure, we consider 25% of 2 kN/m², so we put a load of 0.5 kN/m² on the top floor.
Note: in some cases, it can be necessary to input a non-symmetric load on the construction. So, it can be important to
input a load case, completely analogous to load case 3 or 4, but here the service load is only put on half of the main
floor. By executing this load case, the structure is eccentrically loaded, so effects that counterbalance each other in a
symmetrical load, are revealed here.
Fully loaded Half loaded
LC5 – maximum wind load, parallel to façade
The wind peak velocity pressure for our example is 0.496 kN/m² (see Annex C for the calculation of this value).
The wind force can be calculated according to formula (VSB 5.8) of publication “Nederlandse Annex voor windbelasting
op steigers” (Dutch Annex for wind load on scaffolds):
F =c c ∙C ∙C ∙q (z)∙A
w s d s f p ϕ
• c c structural factor (1 for height lower then 15 m, a reduction could be used for heights between
s d
15 m and 50-60 m)
• C site coefficient, see figure VSB-6.2
s
• C force coefficient
f
• q (𝑧) extreme wind pressure
p
• A wind-catching area
φ
So for an uncladded scaffold, C can be taken as 0.25 for φ = 1:
s B
F =1.0∙0.25∙1.3∙0.496∙A =0.161 kN/m²∙A
w ϕ ϕ
28 DD – 2025/03/03

Chapter 2: Loads
Furthermore, we can assume that the members in the plane perpendicular on the wind load take up about 35% of the
total surface of the construction, as shown on the drawing below:
Code EN 12811-1 §6.2.7.4.1: To make allowance for equipment or materials which are on the working area, a nominal
reference area shall be assumed at its level over its full length. This area shall be 200 mm high measured from the level
of the working area and includes the height of the toeboard. The loads resulting from the wind pressure on this area
shall be assumed to act at the level of the working area.
The windcatching surface can be calculated from formula VSB 7.1 of publication “Nederlandse Annex voor
windbelasting op steigers” (Dutch Annex for wind load on scaffolds):
A =A ∙(A −A )∙(1−e(−0.85∙(n−1)∙A2⁄Atotaal))
ϕ 1 totaal 1
For this case it leads to a percentage of 87%*, so a surface load of 0.161 kN/m² * 0.87 = 0.140 kN/m² can be applied on
the left load panel.
Note: when inputting netting on the structure you can adapt the 0.25 value depending on the type of netting.
*calculation below:
- Total area of 1 part :
𝐴=1.088∗2=2.176𝑚²
- Total area of profiles in 1 part :
𝐴=(3∗0.0483∗1.088)+(1∗0.15∗1.088)+(3∗0.0483∗2)+( 1∗2.277∗0.0483)
=0.720𝑚²
29

Advanced Package Training – Scaffolding
- Ratio :
Total area of profiles in 1 part
𝑅𝑎𝑡𝑖𝑜 =
Total area of 1 part
0.720
𝑅𝑎𝑡𝑖𝑜 = =0.33 (so +/- 35%)
2.176
- Atot=
𝐴 =20∗1.088=21.76𝑚²
𝑇𝑜𝑡
- 𝐴 :
1
𝑇𝑜𝑡𝑎𝑙 𝑎𝑟𝑒𝑎 𝑜𝑓 𝑝𝑟𝑜𝑓𝑖𝑙𝑒𝑠 𝑖𝑛 1 𝑝𝑎𝑟𝑡
𝐴 =𝑅𝑎𝑡𝑖𝑜 ( )∗𝐴
1 Total area of 1 part 𝑇𝑜𝑡
0.720
𝐴 =𝑅𝑎𝑡𝑖𝑜 ( )∗21.76=7.21𝑚²
1 2.176
An other alternative is “n” level * Total area of profiles in 1 part
10∗0.720=7.2𝑚²
- 𝐴 :
2
𝑇𝑜𝑡𝑎𝑙 𝑎𝑟𝑒𝑎 𝑜𝑓 𝑝𝑟𝑜𝑓𝑖𝑙𝑒𝑠 𝑖𝑛 1 𝑝𝑎𝑟𝑡 𝑜𝑡ℎ𝑒𝑟 𝑟𝑜𝑤
𝐴 =𝑅𝑎𝑡𝑖𝑜 ( )∗𝐴
2 Total area of 1 part 𝑇𝑜𝑡
With :
𝑇𝑜𝑡𝑎𝑙 𝑎𝑟𝑒𝑎 𝑜𝑓 𝑝𝑟𝑜𝑓𝑖𝑙𝑒𝑠 𝑖𝑛 1 𝑝𝑎𝑟𝑡 𝑜𝑡ℎ𝑒𝑟 𝑟𝑜𝑤 =
*(the diagonals and toeboards are not present in the secondary planes)
𝐴 =(3∗0.0483∗1.088)+(2∗0.0483∗2)=0.350𝑚²
𝑜𝑡ℎ𝑒𝑟
0.350
𝑅𝑎𝑡𝑖𝑜 =( )=0.1608
2.176
𝑇𝑜𝑡𝑎𝑙 𝑎𝑟𝑒𝑎 𝑜𝑓 𝑝𝑟𝑜𝑓𝑖𝑙𝑒𝑠 𝑖𝑛 1 𝑝𝑎𝑟𝑡 𝑜𝑡ℎ𝑒𝑟 𝑟𝑜𝑤
𝐴 =𝑅𝑎𝑡𝑖𝑜 ( )∗𝐴
2 Total area of 1 part 𝑇𝑜𝑡
0.350
𝐴 =𝑅𝑎𝑡𝑖𝑜 ( )∗21.76=3.48𝑚²
2 2.176
- 𝐴 :
𝛷
𝐴
𝛷
=𝐴
1
+(𝐴
𝑇𝑜𝑡
−𝐴
1
)∗(1−𝑒(−0.85∗(𝑛−1)∗𝐴2/𝐴𝑇𝑜𝑡))
𝐴 =7.21+(21.76−7.21)∗(1−𝑒(−0.85∗(13−1)∗3.48/21.76))= 18.91𝑚²
𝛷
- Ratio :
𝐴
𝛷
𝑅𝑎𝑡𝑖𝑜 ( )
𝐴
𝑇𝑜𝑡
18.91
𝑅𝑎𝑡𝑖𝑜 ( )=0.87
21.76
𝑅𝑎𝑡𝑖𝑜 = 87%
30 DD – 2025/03/03


## Sayfa 31

Chapter 2: Loads
LC6 – maximum wind load, perpendicular to façade
In an analogous way, the maximal wind load is entered perpendicular to the façade on the structure.
Furthermore, we can assume that the members in the plane perpendicular on the wind load take up about 25% of the
total surface of the construction, as shown on the drawing below:
Formula VSB 7.1 leads to a percentage of 27%, so a surface load of 0.161 kN/m² * 0.27 = 0.044 kN/m² can be applied on
the front load panel.
LC7 – working wind load, parallel to façade
The code EN 12811-1 §6.2.7.4.2 prescribes that if the scaffolding is into service, it only needs to be loaded with the so-
called working wind load: A uniformly distributed velocity pressure of 0.20 kN/m2 shall be taken into account. To make
allowance for equipment or materials being on the working area, a nominal reference area as defined in 6.2.7.4.1, but
400 mm high, shall be used in calculating working wind loads.
The wind force can be calculated now with the wind load of 0.20 kN/m²:
F =1.0∙0.25∙1.3∙0.294∙A =0.096 kN/m²∙A
w ϕ ϕ
Formula VSB 7.1 leads to a percentage of 89%, so a surface load of 0.096 kN/m² * 0.89 = 0.085 kN/m² can be applied on
the left load panel.
LC8 – working wind load perpendicular to façade
In an analogous way, the working wind load is entered perpendicular to the façade on the structure.
Formula VSB 7.1 leads to a percentage of 39%, so a surface load of 0.096 kN/m² * 0.39 = 0.037 kN/m² can be applied on
the front load panel.
Linear combinations
Following EN 12811-1, 6.2.9.2 the load cases have to be combined in two different ways: the service condition (service
load in work and working wind loads) and the out of service condition (service load for maximal wind and maximum
wind load).
Note: the service load shall be taken as zero if its consideration leads to more favourable results.
For the combinations in Ultimate Limit State (ULS), a safety factor of 1.50 on the load cases is taken, conformable to
F
the code EN 12811 §10.3.2. The safety factor on the material is 1.10.
M0
Note: for Belgium and Netherlands a factor of 1.2 is used for the permanent load, according to VSB and VSBB (Dutch
and Belgian association for scaffolding companies).
The ULS combinations are:
• CO1: 1.2*LC1 + 1.2*LC2 + 1.5*LC4 + 1.5*LC5 (max wind parallel + service load max wind)
• CO2: 1.2*LC1 + 1.2*LC2 + 1.5*LC4 + 1.5*LC6 (max wind perpendicular + service load max wind)
• CO3: 1.2*LC1 + 1.2*LC2 + 1.5*LC3 + 1.5*LC7 (working wind parallel + service load in service)
• CO4: 1.2*LC1 + 1.2*LC2 + 1.5*LC3 + 1.5*LC8 (working wind perpendicular + service load in service)
31

Advanced Package Training – Scaffolding
For the Serviceability Limit State (SLS) and shall be taken as 1.00. The SLS combinations are:
F M
• CO5: 1.0*LC1 + 1.0*LC2 + 1.0*LC4 + 1.0*LC5 (max wind parallel + service load max wind)
• CO6: 1.0*LC1 + 1.0*LC2 + 1.0*LC4 + 1.0*LC6 (max wind perpendicular + service load max wind)
• CO7: 1.0*LC1 + 1.0*LC2 + 1.0*LC3 + 1.0*LC7 (working wind parallel + service load in service)
• CO8: 1.0*LC1 + 1.0*LC2 + 1.0*LC3 + 1.0*LC8 (working wind perpendicular + service load in service)
The linear combinations are created in SCIA Engineer (Menu bar > Libraries > Load cases, Combinations > Combinations
> Combinations):
Note: depending on the used code other factors can be used. E.g. “NEN-EN 13814 Fair ground and amusement park
machinery and structures” mentions a factor of 1.35 for the variable loads.
We can change the safety factor for steel in SCIA Engineer in the National Annex (which can be accessed via the status
bar):
32 DD – 2025/03/03

Chapter 2: Loads
Nonlinear combinations
To include the nonlinearities in our model (gaps, nonlinear functions, …) we will perform a nonlinear analysis.
Therefore, we will create eight nonlinear combinations from our (linear) combinations (Menu bar > Libraries > Load
cases; Combinations > Nonlinear combinations):
• NC1: 1.2*LC1 + 1.2*LC2 + 1.5*LC4 + 1.5*LC5
• NC2: 1.2*LC1 + 1.2*LC2 + 1.5*LC4 + 1.5*LC6
• NC3: 1.2*LC1 + 1.2*LC2 + 1.5*LC3 + 1.5*LC7
• NC4: 1.2*LC1 + 1.2*LC2 + 1.5*LC3 + 1.5*LC8
• NC5: 1.0*LC1 + 1.0*LC2 + 1.0*LC4 + 1.0*LC5
• NC6: 1.0*LC1 + 1.0*LC2 + 1.0*LC4 + 1.0*LC6
• NC7: 1.0*LC1 + 1.0*LC2 + 1.0*LC3 + 1.0*LC7
• NC8: 1.0*LC1 + 1.0*LC2 + 1.0*LC3 + 1.0*LC8
It is possible to import the linear combinations as nonlinear combinations with the button ‘New from combination’ in
the nonlinear combinations window.
We will set imperfections for these nonlinear combinations in the following chapter 3.
Nonlinear stability combinations
To investigate the stability behaviour of our structure, we will perform a stability analysis. Therefore, we create four
stability combinations from our linear combinations (Menu bar > Libraries > Load cases, Combinations > Nonlinear
stability combinations):
• SN1: 1.2*LC1 + 1.2*LC2 + 1.5*LC4 + 1.5*LC5
• SN2: 1.2*LC1 + 1.2*LC2 + 1.5*LC4 + 1.5*LC6
• SN3: 1.2*LC1 + 1.2*LC2 + 1.5*LC3 + 1.5*LC7
• SN4: 1.2*LC1 + 1.2*LC2 + 1.5*LC3 + 1.5*LC8
• SN5: 1.0*LC1 + 1.0*LC2 + 1.0*LC4 + 1.0*LC5
• SN6: 1.0*LC1 + 1.0*LC2 + 1.0*LC4 + 1.0*LC6
• SN7: 1.0*LC1 + 1.0*LC2 + 1.0*LC3 + 1.0*LC7
• SN8: 1.0*LC1 + 1.0*LC2 + 1.0*LC3 + 1.0*LC8
It is possible to import the nonlinear combinations as nonlinear stability combinations with the button New from
nonlinear combinations in the nonlinear stability combinations dialog.
33

Advanced Package Training – Scaffolding
Chapter 3: Analysis & results
In SCIA Engineer different analysis possibilities are available, but which kind of analysis should we perform for a
scaffolding structure?
In code EN 12810-2, following table is mentioned:
So, if we are working with modular systems (such as the Layher system), we should always perform a second order
calculation.
This principle is also shown in the following flow chart of code EN 12810-2:
34 DD – 2025/03/03

Chapter 3: Analysis
The general procedure for first order and second order analysis is shown in the following diagram (following EN 1993-1-
1, chapter 5):
With:
•  : elastic critical buckling mode
cr
• L: member system length
• l buckling length
b
35

Advanced Package Training – Scaffolding
Global analysis aims at determining the distribution of the internal forces and moments and the corresponding
displacements in a structure subjected to a specified loading.
A distinction is between the methods, which make allowance for, and those, which neglect the effects of the actual,
displaced configuration of the structure. They are referred to respectively as second order theory based and first order
theory based methods.
The second order effects are made up of a local/member second order effects (referred to as the P- effect) and a
global second order effect (referred to as the P- effect).
M(x) = Hx M(x) = Hx + Pδ + PΔx/L
M(L) = HL M(L)= HL + PΔ
First order theory Second order theory
In the diagram of EN 1993 three paths are defined:
• Path 1: a first order calculation will be executed;
• Path 2: a second order calculation will be executed with global (and bow) imperfections;
• Path 3: a second order calculation will be executed with the buckling shape of the construction as
imperfection.
The calculation will become more precise when choosing for a higher path. The lower paths will result in a faster
calculation, because a first order calculation can be executed without iterations, but this first order theory may be used
only when the displacement effects on the structural behaviour are negligible.
For our scaffolding structure, we should follow path 2 or 3 (since we should calculate with the second order effect
according to EN 12810-2).
So, when we are designing scaffolding structures; following workflow can be used.
• First a linear analysis can be executed to have a look at the global behaviour of the structure.
• Then we can perform a stability analysis to investigate which stability modes should be considered if we want
to follow path 3.
• Finally, we can create the nonlinear combinations with imperfections (global and local imperfections if we
want to follow path 2 or the stability mode as a global imperfection if we want to follow path 3). We will
execute the analysis with these nonlinear combinations and perform the checks with the results of them.
36 DD – 2025/03/03

Chapter 3: Analysis
Linear analysis
First, we can start with a linear analysis for a global stability check of the whole structure:
• Is the model calculating properly (are there no instabilities)?
• Are the reactions logic?
• …
Pay attention that it is mandatory to perform a second order analysis with imperfections! When you would perform the
ULS checks with the linear combinations, a warning will be given in the output of the check.
Bill of material
The bill of material can also be found in the results workstation of the process toolbar. In this table the total length for
each cross section is shown or the number of elements can be shown per member type and per length.
Note: the toeboards are not visible in this table since they are not considered in the analysis (they are on a layer
with property ‘structural model only’).
37

Advanced Package Training – Scaffolding
Nonlinear stability analysis
Now we will perform a nonlinear stability calculation, which calculates the global buckling mode/shape (eigenmode) of
a structure under the given loading. We will have a look at the stability modes, to decide which modes we want to
impose as imperfection (according to path 3 of the EN 1993 diagram).
The nonlinear stability calculation is available with module sens.03.
The nonlinear stability combinations are already created in the previous chapter.
To obtain precise results, the number of 1D elements is refined through Menu bar > Tools > Calculation & Mesh > Mesh
settings (a minimum number of 5 elements is required):
Under Menu bar > Tools > Calculation & Mesh > Solver settings the Type of eigen value solver and Number of
buckling modes can be specified:
You can start with 1 or 2 buckling modes and evaluate if a global mode is found. If not, you can increase the
number of buckling modes or you can change the element that is too weak.
Since we have nonlinearities in our model, we must execute the nonlinear stability analysis to take these
nonlinearities into account. We need to activate the functionality Geometrical nonlinearity and choose as
geometrical nonlinearity for 3rd order (large deformation) in the solver settings (see also Annex D – Nonlinear
analysis).
38 DD – 2025/03/03

Chapter 3: Analysis
After the calculation we can have a look at the alpha critical (α ) values under Menu bar > Results > Critical load
cr
coefficients:
For a visualisation of the buckling modes, we can go to Menu bar > Results > 3D deformations and select the
appropriate stability combination. We can clearly see a buckling shape at the location of the opening in our structure
(nonlinear stability combination SN3 is shown below):
This means we must consider this buckling shape in our nonlinear combinations and analysis.
39

Advanced Package Training – Scaffolding
Nonlinear analysis
Global frame imperfection φ
Inclination functions
The global frame imperfection can be inputted for the whole structure by an imperfection value φ. This value can be
calculated with the following formula (EN 1993-1-1 art. 5.3.2(3)a):
1
• φ= ∙α ∙α
200 h m
2 2
• α = , but ≤α ≤1.0
h √h 3 h
1
• α =√0.5∙(1+ )
m m
• h: height of the structure in meters
• m: number of columns in a row including only those columns which carry a vertical load N not
Ed
less than 50% of the average value of the vertical load per column in the plane considered
These inclination functions are entered through Menu bar > Libraries > Structure and analysis > Initial deformations:
We will create two functions: one for the X direction and one for the Y direction:
• the type is chosen as EN 1993-1-1 art. 5.3.2(3), with a basic imperfection of 1/200;
• the height of the construction is 4 m in X direction (due to anchors each 4m) and 20 m in Y direction;
• there are 12 columns in the X direction, therefore the number of columns in this direction has been inputted
as 12;
• There are 2 columns in the Y direction, therefore the number of columns in this direction has been inputted as
2;
The inclination function for the X direction (DefX) is displayed below:
40 DD – 2025/03/03


## Sayfa 41

Chapter 3: Analysis
If you have a structure with an irregular shape, you’ll need to enter all nonlinear combinations four times: once with the
inclination according to the positive X direction, once according to the positive Y direction, once according to the
negative X direction and once for the negative Y direction.
In our model we have a scaffolding with anchoring every 4 m. Therefore, we will apply a factor on the inclination
functions DefX and DefY. We consider that the deformation will be zero at 4 m, 8 m, 12 m, 16 m and 20 m. This results
in following function for X direction:
We have already created nonlinear combinations NC_CO1-NC_CO8, which we will give as Global Imperfection GI_X.
We can copy those eight combinations (so NC_CO9-NC_CO16 are created) and we change the Global Imperfection to
GI_Y (so with initial deformation Function Y).
Now we have 16 nonlinear combinations:
41

Advanced Package Training – Scaffolding
With as Global Imperfections (Menu bar > Libraries > Load cases, combinations > Global Imperfections):
Stability shape as imperfection
As an alternative to global and local imperfections, we can use a buckling shape as a unique imperfection (according to
path 3 of the EN 1993 diagram). Since we have an important buckling shape around the opening in our structure, we
need to check this situation as well. Therefore, we will copy our first eight nonlinear combinations NC_CO1-NC_CO8
and apply buckling shape S4 as global imperfection on them.
Since the buckling shape is dimensionless, Eurocode gives a formula to calculate the amplitude  of the imperfection:
init
N
cr
η =e ⋅ ∙η
init 0 E⋅I ⋅η′′ cr
y cr,max
With:
2
χ ⋅ (λ)
1−
• e =α⋅(λ−0.2)⋅ MRk⋅ γM1 for λ>0.2
0 NRk 1−χ⋅(λ) 2
N
• λ=√ Rk⁄
N
cr
• : imperfection factor for the relevant buckling curve
• : reduction factor for the relevant buckling curve, depending on the relevant cross-section
• N : characteristic resistance to normal force of the critical cross-section, i.e. N
Rk pl,Rk
• N : elastic critical buckling load
cr
• M : characteristic moment resistance of the critical cross-section, i.e. M or M as relevant
Rk el,Rk el,Rk
•  : shape of the elastic critical buckling mode
cr
• ” : maximal second derivative of the elastic critical buckling mode
cr,max
42 DD – 2025/03/03

Chapter 3: Analysis
Often  is taken as L/200. So, for our project we will set a maximum deformation of 20 mm, which corresponds with
init
L/200 for a height of 4 m (since our buckling shape occurred over a height of 4 m):
Annex D described an example where the value for  is calculated exactly.
init
43

Advanced Package Training – Scaffolding
Initial bow imperfection e
0
The initial bow imperfection e is given by:
0
The buckling curve used for calculation of the imperfection is the curve inputted in the cross-section library. For
standard sections, the curve according to the code is automatically used, for non-standard cross sections (as general
cross sections) you need to input the buckling curve manually.
SCIA Engineer can calculate the bow imperfection according to the code automatically for all needed members. But in a
scaffolding structure all profiles have the same buckling curve and thus the same bow imperfection. This bow
imperfection is inputted as simple curvature: the same curvature for all members:
Note: for nonlinear combinations NC_CO17-NC_CO24 it is not necessary to activate the bow imperfection, since the
local imperfection is included already in the buckling shape.
Note: in the Netherlands, a guideline for scaffolding structures mentions as value for the global imperfection tan φ =
0.00157 and as value for the local imperfection L/200.
44 DD – 2025/03/03

Chapter 3: Analysis
Second order calculation
First, do not forget to turn on the functionality Geometrical nonlinearity in the project settings dialogue to consider the
second order analysis!
The method that we will use for our second order calculation is the so-called Newton-Raphson method (Th.III.O) for the
solution of nonlinear equations.
This method is a more general applicable method which is very solid for most types of problems. It can be used for very
large deformations and rotations, however the limitation of small strains is still applicable.
Mathematically, the method is based on a step-by-step augmentation of the load. This incremental method is
illustrated on the following diagram:
In this figure, the tangential stiffness K is used. The symbol u depicts the displacements and F is the force matrix.
T
The original Newton-Raphson method changes the tangential stiffness in each iteration. There are also adapted
procedures which keep the stiffness constant in certain zones during for example one increment. SCIA Engineer uses
the original method.
As a limitation, the rotation achieved in one increment should not exceed 5°.
45

Advanced Package Training – Scaffolding
The accuracy of the method can be increased through refinement of the finite element mesh and by increasing the
number of increments. By default, when the Newton-Raphson method is used, the Number of increments is set to 5 (in
the solver setup) and you should set the number of 1D elements to at least 5 in the mesh setup (we choose already for
5 as average number of tiles of 1D element when we performed the stability calculation).
In the mesh settings we also advise to deactivate the option Generation of nodes in connections of beam elements (by
default this option is ticked off):
When this option is activated, beams will be connected by the nodes they are going through. But when 4 nodes are
inputted on the beams, it could happen that a node has been inputted in the middle of a diagonal and another diagonal
is crossing this one in the program and now they are connected. To avoid unwanted connections, we advise to uncheck
this option.
46 DD – 2025/03/03

Chapter 3: Analysis
The criterion for convergence is defined as follows:
∑(u2 +u2 +u2 )−∑(u2 +u2 +u2 )
x,i y,i z,i x,i−1 y,i−1 z,i−1
≤0,005/(precision ratio)
∑(u2 +u2 +u2 )
x,i y,i z,i
With:
• u : displacement in direction x for iteration i
x,i
• u : displacement in direction y for iteration i
y,i
• u : displacement in direction z for iteration i
z,i
This convergence precision (solver precision ratio) can be adapted in the solver settings (Menu bar > Tools > Calculation
& Mesh > Solver Settings), together with the choice for the Newton-Raphson method, the number of increments and
the maximal number of iterations. The default value for the maximal number of iterations is 20, but it can be necessary
to increase this value (for example to 50, 100, …) if there is no convergence after 20 iterations.
In some cases, a high number of increments may even solve problems that tend to a singular solution which is typical
for the analysis of post-critical states. However, in most cases, such a state is characterized by extreme deformations,
which is not interesting for design purposes.
As specified, the Newton-Raphson method can be applied in nearly all cases. It may, however fail in the vicinity of
inflexion points of the loading diagram. To avoid this, a specific method has been implemented in SCIA Engineer: the
Modified Newton-Raphson method.
Also, when the Newton-Raphson method is failing, there is the possibility of the method of Picard. This method follows
the same principles as the default method but will automatically refine the number of increments when a critical point
is reached. This method is used for the nonlinear stability calculation.
47

Advanced Package Training – Scaffolding
Chapter 4: Checks
Member check
SLS check
The deformation check in SLS (Serviceability Limit State) is a part of Eurocode 3. According to the code EN 12811-1 the
allowable deformation for the total deflection is L/100. You can set the limit value via Menu bar > Design > Steel
members > Settings > SLS deflection check (or Menu bar > Design > Aluminium > Settings > SLS deflection check):
Choose for Menu bar > Design > Steel members > SLS check (or Aluminium > SLS check in case you have modelled
aluminium elements, this functionality is available in the 64bit version since SCIA Engineer 22.0) and ask the results for
the nonlinear class NC_SLS:
48 DD – 2025/03/03

Chapter 4: Checks
The maximum unity check of 0.28 is found for beam B859:
Or as relative output (available since SCIA Engineer 24.0):
49

Advanced Package Training – Scaffolding
ULS check
The scaffolding check is executed according to equation 9 of EN 12811-1-1 article 10.3.3.2. However, the EN 12811-1
only gives an interaction equation in case of a low shear force. Since the EN 12811-1 is based entirely on DIN 4420-1
Teil 1, the interaction formulas according to Table 7 of DIN 4420-1 Teil 1 are applied in case of a large shear force. The
interaction equations are summarised as follows:
Conditions Interaction for tubular member
M
N 1 V 1
( ≤ ) and ( ≤ )
Npld 10 Vpld 3 M
pld
M
1 N V 1
( < ≤1) and ( ≤ ) π⋅N
10 Npld Vpld 3 M
pld
⋅cos(
2∙N
)
pld
M
N 1 1 V
( ≤ ) and < ≤0.9 V 2
Npld 10 3 Vpld M
pld
⋅√1−(
V
)
pld
M
( 1 < N ≤1) and 1 < V ≤0.9 V 2 π⋅N
10 Npld 3 Vpld M
pld
√1−(
V
pld
) cos
V 2
2∙N ∙√1−( )
pld V
[ ( pld )]
V V
>0.9
V 0.9∙V
pld pld
N N
>1
N N
pld pld
With:
• M: √M2+M ²
y z
• V: √V2+V ²
y z
• α:
Wpl
≤1.25
Wel
• N :
A∙fy
pld
γM
• V :
2
∙A∙
fy
pld
π √3∙γM
• M :
α∙Wel∙fy
pld
γM
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
Only section checks are executed since the stability effects are considered in the second order calculation with
imperfections and a lateral torsional buckling check is not relevant for tubular profiles. In case these conditions are not
set the default EN 1993-1-1 check will be executed instead.
50 DD – 2025/03/03

|  | Conditions |  |  | Interaction for tubular member |  |
| --- | --- | --- | --- | --- | --- |
| N 1 V 1
( ≤ ) and ( ≤ )
Npld 10 Vpld 3 |  |  | M
M
pld |  |  |
| 1 N V 1
( < ≤1) and ( ≤ )
10 Npld Vpld 3 |  |  | M
π⋅N
M ⋅cos( )
pld 2∙N
pld |  |  |
| N 1 1 V
( ≤ ) and < ≤0.9
Npld 10 3 Vpld |  |  | M
V 2
M ⋅√1−( )
pld V
pld |  |  |
| 1 N 1 V
( < ≤1) and < ≤0.9
10 Npld 3 Vpld |  |  | M
V 2 π⋅N
M √1−( ) cos
pld V
pld V 2
2∙N ∙√1−( )
pld V
[ ( pld ) |  |  |
| V
>0.9
V
pld |  |  | V
0.9∙V
pld |  |  |
| N
>1
N
pld |  |  | N
N
pld |  |  |



## Sayfa 51

Chapter 4: Checks
Choose for Menu bar > Design > Steel members > ULS check (or Menu bar > Design > Aluminium > ULS check in case
you have modelled aluminium elements) and ask the results for the nonlinear class NC_ULS:
In the properties window you can choose for Brief, Summary or Detailed as output type:
• Brief output: the results are shown in one line;
• Summary output: the results of all the individual unity checks are shown;
• Detailed output: the results of all the individual unity checks are shown. Since SCIA Engineer 19.0 also each
individual formula can be shown. You can choose to print only the tables, only the formulas or both.
The maximum unity check of 0.60 is found for beam B859:
51

Advanced Package Training – Scaffolding
SCIA Engineer will show you directly the scaffolding check, when choosing for the Eurocode check for circular hollow
sections, because we have activated the Scaffolding functionality in the beginning of the project. If you do not want to
see the scaffolding check, but the general Eurocode check (EN 1993-1-1), you can uncheck this option in the steel
settings:
52 DD – 2025/03/03

Chapter 4: Checks
You can find the same option in the Aluminium Settings if you are working with aluminium elements and you want to
follow EN 1999-1-1 instead of the specific scaffolding check.
53

Advanced Package Training – Scaffolding
Coupler check
When checking the allowable stresses, it is recommended to view the results per profile type (standards, bracings, …).
The maximal stresses can now be compared to the allowable values of the supplier. Also the base jacks are checked
with this value.
For the anchorage forces, the reaction force can be tested to the allowable force of a perpendicular coupler. On the
other hand, the anchorage can also be checked manually on the combined effect of tension and shear.
For the couplers, this check can be performed by SCIA Engineer itself, with the option Menu bar > Design > Steel
members > Scaffolding coupler check (or Menu bar > Design > Aluminium > Scaffolding coupler check for aluminium
couplers).
This check performs a unity check for the couplers for which a maximal allowable force is given in the coupler library:
54 DD – 2025/03/03

Chapter 4: Checks
General couplers
Following table provides an overview of the performed component checks for each type:
F F F M M M Interaction
x y z x y z
Friction sleeve - - - -
Swivel - - - - - -
Base jack - - - - -
Parallel - - - - - -
General -
For a right angle coupler the interaction formula is:
N+V V M |N |+|V | |V | |M |
z y y Ed z,Ed y,Ed y,Ed
+ + = + + ≤1
F F M N +V V M
2∙ s,k p,k 2.4∙( B,k) x,k z,k y,k 2.4∙( y,k)
γ γ γ γ γ γ
M M M M M M
For a friction sleeve coupler the formula is:
N M |N | |M |
y Ed y,Ed
+ = + ≤1
F M N M
2∙ s,k B,k 2∙ x,k y,k
γ γ γ γ
M M M M
With:
• F : characteristic slipping force, taken as N and V of the coupler properties: 2F =N +V
s,k x,k z,k s,k x,k z,k
• F : characteristic pull-apart force, taken as V of the coupler properties
p,k y,k
• M : characteristic bending moment, taken as M of the coupler properties
B y,k
• N normal force
• V: shear force in y direction
y
• V: shear force in z direction
z
• M: bending moment about the y axis
y
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
• N , V , V , M : coupler resistances given by EN 12811-1 Table C1
x,k y,k z,k y,k
Loads on a coupler are defined by following figures (left below is a right angle coupler and right below is a friction
type sleeve coupler), see also Annex A:
55

|  |  |  |  | F
x |  |  | F
y |  |  | F
z |  |  | M
x |  |  | M
y |  |  | M
z |  |  | Interaction |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Right angle |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  | Friction sleeve |  |  |  |  | - |  |  | - |  |  | - |  |  |  |  |  | - |  |  |  |  |  |
|  | Swivel |  |  |  |  | - |  |  | - |  |  | - |  |  | - |  |  | - |  |  | - |  |  |
|  | Base jack |  | - |  |  | - |  |  | - |  |  | - |  |  |  |  |  |  |  |  | - |  |  |
|  | Parallel |  | - |  |  | - |  |  |  |  |  | - |  |  | - |  |  | - |  |  | - |  |  |
|  | General |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | - |  |  |


Advanced Package Training – Scaffolding
Manufacturer couplers
In addition to the list of general couplers, following table provides an overview of the performed component checks for
each type of manufacturer coupler:
F F F M M M Interaction 1 Interaction 2 Interaction 3
x y z x y z
Cuplok - -
Layher Variante II -
Catari US - - - - -
Notes:
• The Catari US coupler type and the interaction 3 check are available since SCIA 20.
• Since SCIA21.1 it is possible to turn off the interaction 3 check via the steel settings.
Cuplock
The Cuplock coupler which connects a ledger and a standard is described in Zulassung Nr. Z-8.22-208:2022. The
interaction equations are:
Interaction 1:
N M M |N | |M | |M |
y x Ed y,Ed x,Ed
+ + = + + ≤1
N M M N M M
x,k y,k x,k x,k y,k x,k
γ γ γ γ γ γ
M M M M M M
With:
• N: slipping force, taken as normal force in the ledger
• M: bending moment about the y axis
y
• M: torsional moment around the x axis
x
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
• N , M , M : coupler resistances given by Z-8.22-208:2017 Table 4
x,k y,k x,k
Interaction 2:
M (N+N ∙sin(α)) M |M | |N +N ∙sin(α)| |M |
y v x y,Ed Ed v,Ed x,Ed
+ + = + + ≤1
M N M M N M
y,k x,k x,k y,k x,k x,k
γ γ γ γ γ γ
M M M M M M
With:
• N: slipping force, taken as normal force in the ledger
• M: bending moment about the y axis
y
• M: torsional moment around the x axis
x
• N: normal force in a connecting vertical diagonal
v
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
• α: angle between connecting vertical diagonal and standard
• N , M , M : coupler resistances given by Z-8.22-208:2017 Table 4
x,k y,k x,k
56 DD – 2025/03/03

|  |  |  |  | F
x |  |  | F
y |  |  | F
z |  |  | M
x |  |  | M
y |  |  | M
z |  |  | Interaction 1 |  |  | Interaction 2 |  |  | Interaction 3 |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Cuplok |  |  |  |  | - |  |  |  |  |  |  |  |  |  |  |  | - |  |  |  |  |  |  |  |  |  |  |  |
|  | Layher K2000+ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  | Layher Variante II |  |  |  |  |  |  |  |  |  |  | - |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  | Layher LW |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  | Catari US |  |  |  |  |  |  |  |  |  |  | - |  |  |  |  |  | - |  |  | - |  |  | - |  |  | - |  |  |


Chapter 4: Checks
Interaction 3:
a √m2 +n2
I +0.7∙I = +0.7∙I = act act+0.7∙I ≤1
S A b A √m²+n² A
With:
• I : M utilization of connected coupler
A y
• I: in-plane utilization of column (the definition of lengths a and b are given by article 3.3.2.2
S
build 1)
• a: initial length
• b: projected length
• m : actual utilization of in-plane bending moment in column section =
|Mst,Ed|
act
Mst,Rd
• M : design bending moment in column section adjacent to the coupler
st,Ed
• M : bending moment resistance of the column cross-section =
αpl∙wel∙fyk
and α =
wpl
≤1.25
st,Rd γM pl wel
• n : actual utilization of normal force in column section =
|Nst,Ed|
act
Nst,Rd
• N : design normal force in column section adjacent to the coupler
st,Ed
• N : normal force resistance of column cross-section =
Ast∙fyk
st,Rd
γM
• m: value of bending moment utilization when combined UC is equal to 1 (the smallest positive
root of the cubic function)
• n: corresponding value of normal force utilization calculated from current curve function
=(
nact)∙m
mact
• A : cross-section area of column cross-section
st
• w : elastic / plastic section modulus of column cross-section
el/pl
• v : actual utilization of vertical in-plane shear in column section =
|Vst,Ed|
act
Vst,Rd
• V : design shear force in column section adjacent to the coupler
st,Ed
• V : shear force resistance of column cross-section =
Av,st∙fyk
st,Rd
√3∙γM
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
Column internal forces are selected considering the possible rotation of the column. If the angle between the
connected beam LCS and column LCS is smaller than 45 deg, then:
• M = M , else M
st,Ed y,st,Ed z,st,Ed
• V = V , else V
st,Ed y,st,Ed z,st,Ed
Also, in certain geometries there can be two sections to choose from. In this case the selection is based on Von Mises
stress calculation. The section which will result in larger stress will be used for the further calculation of I . The stress
S
will be calculated as indicated below:
2 2
|N | |M | |V |
σ=√σ2 +3∙τ2 =√(σ +σ )2+3∙τ2 =√( st,Ed + st,Ed ) +3∙( st,Ed )
tot,Ed Ed N M Ed A W A
st el,st v,st
The bending moment utilization of column m, may be calculated by solving a derived cubic function, using
coefficients C and C depending on the shear force utilization of column section v :
1 2 act
C ∙m3+4∙C ∙C ∙m2+4∙m−4∙C =0
2 1 2 1
With:
1
• C : for v ≤ : C =1
1 act 3 1
for 1 ≤v ≤0.9: C =√1−v2
3 act 1 act
• C : for v ≤
1
: C =
nact
2 act 3 2 mact
for 1 ≤v ≤0.9: C = nact ∙√1−v2
3 act 2 mact act
57

Advanced Package Training – Scaffolding
Special cases are:
• m ≤ 0.0001 → I = n
act S act
• n = 0 → I = m
act S act
• m ≤ 0.0001 and if n =0 → I = 0
act act S
For the case when 0.9 < v an error will be displayed and UC_Interaction 3 will be set to 999.
act
To recognize a member as a column, the type of the member has to be either ‘column’, ‘gable column’ or ‘secondary
column’ and the cross-section has to be Formcode 3 (CHS). In case two columns are found, both need to be within one
buckling system. If the above is not fulfilled or if there are more column members found, the column geometry is not
recognized and the unity check is set to 999. See also following chapter.
Layher
The Layher coupler which connects a ledger and a standard is described in Zulassung Nr. Z-8.22-64:2022 for Variante II
and Variante K2000+ and in Zulassung Nr. Z-8.22-939:2022 for Variante LW.
Interaction 1, Variante II:
N(+) M max(V −1.4 ; 0) V
y z y
+ + +
N M M 25.0
Rd y,R,d y
N+ |M | max(|V |−V ; 0) |M | |V |
= Ed + y,Ed + z,Ed z,Ed,min + z,Ed + y,Ed ≤1
N M V M V
x,k y,k z,k z,k y,Rd
γ γ γ γ
M M M M
Interaction 1, Variante K2000+:
N(+) M max(V −2.1 ; 0) V M
y z y T
+ + + + ≤1
N M M 27.1 M
Rd y,R,d y T,R,d
N+ |M | max(|V |−V ; 0) |M | |V | |M |
Ed + y,Ed + z,Ed z,Ed,min + z,Ed + y,Ed + x,Ed ≤1
N M V M V M
x,k y,k z,k z,k y,Rd x,k
γ γ γ γ γ
M M M M M
Interaction 1, Variante LW:
N(+) |M | max(|V |−2.5 ; 0) |M | |V | M
y z z y T
+ + + + + ≤1
N M V |M | |V | M
Rd y,R,d z,R,d z,R,d y,R,d T,R,d
N+ |M | max(|V |−V ; 0) |M | |V | |M |
Ed + y,Ed + z,Ed z,Ed,min + z,Ed + y,Ed + x,Ed ≤1
N M V M V M
x,k y,k z,k z,k y,Rd x,k
γ γ γ γ γ
M M M M M
Note: an additional check for welds is not supported.
With:
• N: slipping force, taken as normal force in the ledger
• (+): this index indicates a tensile force (≥0)
• V: shear force in y direction
y
• V: shear force in z direction
z
• M: bending moment about the y axis
y
• M: torsional moment around the x axis
x
• M: torsional moment around the z axis
z
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
• α: angle between connecting vertical diagonal and standard
• N , M , M , M , V , V : coupler resistances given by Z-8.22-64:2018 Table 5 for Variante II and Variante
x,k y,k z,k x,k y,k z,k
K2000+ en Z-8.22-939:2022 Table 5 for Variante LW
• V : 1.4 kN for Variante II, 2.1 kN for Variante K2000+ and 2.5 kN for Variante LW
z,Ed,min
58 DD – 2025/03/03

Chapter 4: Checks
Interaction 2:
(nA+nB)2+(vA+vB)2 ≤1
Ledger:
|M |
N+ + y,Ed
Ed e
nA=
N
ξ∙ x,k
γ
M
e
0.707∙sin (α)∙N+ + D∙cos (α)∙|N |
v,Ed e v,Ed
nB=
N
ξ∙ x,k
γ
M
Vertical diagonal:
V
z,Ed
vA=
V
z,k
γ
M
cos (α)∙N
v,Ed
vB=
V
z,k
γ
M
With:
• N: slipping force, taken as normal force in the ledger
• (+): this index indicates a tensile force (≥0)
• N: normal force in a connecting vertical diagonal
v
• M: bending moment about the y axis
y
• V: shear force in z direction
z
• γ : safety factor, taken as γ of EN 1993-1-1 for steel couplers or γ of EN 1999-1-1 for
M M0 M1
aluminium couplers
• α: angle between connecting vertical diagonal and standard
• N , V : coupler resistances given by Z-8.22-64:2018 Table 5 for Variante II and Variante K2000+ en Z-8.22-
x,k z,k
939:2022 Table 5 for Variante LW
• e: 2.75 cm for Variante II, 3.30 cm for Variante K2000+ and 3.30 kN for Variante LW
• e : 5.7 cm
D
• ξ: 1.26 cm for Variante II, 1.85 cm for Variante K2000+ and 1.85 kN for Variante LW
59

Advanced Package Training – Scaffolding
Interaction 3, Variante II:
|N | |M |
st,Ed + st,Ed
σ A W
N st el,st
I +0.148∙I = +0.148∙I = +0.148∙I ≤1
S A f A f A
yd yd
With:
• I : My utilization of connected coupler
A
• I: in-plane utilization of column
S
• N : design normal force in column section adjacent to the coupler
st,Ed
• M : design bending moment in column section adjacent to the coupler
st,Ed
• A : cross-section area of column cross-section
st
• W : elastic section modulus of column cross-section
el,st
Interaction 3, Variante K2000+ (given by Z-8.22-64 Table 6):
I +0.316∙I ≤1
S A
The calculation routine is similar as the one described for Cuplok coupler.
Interaction 3, Variante LW (given by Z-8.22-939):
I +0.170∙I ≤1
S A
The calculation routine is similar as the one described for Cuplok coupler.
Catari US
The resistances and stiffness function of Catari Universal System (US) coupler are given by AENOR Product Certificate
A34/000035. The reference only provides normal force resistance for tension.
60 DD – 2025/03/03


## Sayfa 61

Chapter 4: Checks
Interaction 3 check
In case two columns are found, both need to be within one buckling system:
• the Local Coordinate System (LCS) should be the same for both columns
• the columns should be modelled correctly, i.e. in 1 vertical line. Avoid inaccuracies, even if it's less than 1 mm
(pay attention when importing the structure from other software).
• The orientation of the elements should be equal
61

| Interaction 3 is a special failure mode where the coupler punches into the standard. This failure type thus occurs only |
| --- |
| for modular systems (Layher & Cuplock) where the ledgers are connected to the standard. |


| In order to recognize the member as column, the type of the member has to be either "column (100)", "gable column |
| --- |
| (70)" or "secondary column(60)" and the cross-section has to be Formcode 3 (Circular Hollow Section). For the ledgers |
| the type "beam (80)" is available and for diagonals types "wall bracing (0)" and "roof bracing (0)" are available. |


| If the above conditions are not fulfilled or if there are more column members found, the column geometry is not |
| --- |
| recognized and the unity check is set to 999. |


Advanced Package Training – Scaffolding
This is because on the right side, the element B9 has been connected to the ledger, and not to the standard.
62 DD – 2025/03/03

| Also pay attention when you have a transversal bar, or diagonal, attached to a continuous standard where also a |
| --- |
| continuous ledger passes. |


| As for the image below, there is an error for the interaction 3 unity check, which states that the geometry is incorrect |
| --- |
| ("No valid column (standard) geometry was found. Please revise the geometry"). |


| This failure mode does not occur for crossing members (cross-links) since there the ledger is continuous and thus does |
| --- |
| not cause punching in the standard. |


Chapter 4: Checks
Coupler check
Choose for Menu bar > Design > Steel members > Scaffolding coupler check (or Menu bar > Design > Aluminium
Scaffolding coupler check in case you have modelled aluminium elements) and ask the results for the nonlinear class
NC_ULS:
The maximum unity check of 0.62 is found in coupler H1300 (on beam B5919):
63

Advanced Package Training – Scaffolding
A detailed output including formulas is available since SCIA Engineer 20:
64 DD – 2025/03/03

Chapter 4: Checks
65

Advanced Package Training – Scaffolding
Chapter 5: Reporting
Engineering report
As for other structural projects you can create an engineering report with the structural elements (nodes, elements,
supports, …), loads (load cases, combinations, …) and results (displacements, internal forces, …).
The scaffolding checks (member check and coupler check) can be added as well:
Pictures
It is possible to generate pictures/views based on the line grid. In that case there should be a 3D line grid in your model.
You can right-click in the graphical scene, select Image wizard and choose Sections by planes of linegrid (overview
drawings).
These pictures can be added to the Engineering report as well.
66 DD – 2025/03/03

Annex A
Annex A: Characteristic values of the resistances for couplers
The tables and figures below are taken from EN 12811-1.
67

Advanced Package Training – Scaffolding
68 DD – 2025/03/03

Annex B
Annex B: Service loads according to EN 12811-1
The service loads are considered in table 3 of EN 12811-1:
Uniformly distributed service load q (EN 12811-1, 6.2.2.2)
1
Each working area is capable of supporting the uniformly distributed loads, q as specified in the table above.
1
Concentrated load F and F (EN 12811-1, 6.2.2.3)
1 2
Each platform unit is capable of supporting the load F uniformly distributed over an area of 500 mm x 500 mm and, but
1
not simultaneously, F uniformly distributed over an area of 200 mm x 200 mm.
2
The position of each load is chosen to give the most unfavourable effect.
When a platform unit is less than 500 mm wide, the load may be reduced for this unit in proportion to its width, except
that in no case shall the loading be reduced to less than 1.5 kN.
Partial area load q (EN 12811-1, 6.2.2.4)
2
This load has to be applied only for classes 4, 5 and 6. In those cases each platform is capable of supporting a partial
area loading q on an area A :
2 q2
A =l∙w∙a
q2 p
With:
• l length
• w width
• a coefficient of table 3
p
69

Advanced Package Training – Scaffolding
The dimensions and position of the partial area are chosen to give the most unfavourable effect. One example is shown
below:
70 DD – 2025/03/03


## Sayfa 71

Annex C
Annex C: Wind loads
Since the arithmetic method for the calculation of a wind load from code EN 12811-1 is not valid for all scaffoldings,
provided by nets that completely surround the construction, the code EN 1991-1-4 is adopted.
There are three cases for calculating a reference height (EN 1991-1-4, figure 7.4):
In the example discussed in this course, the height is 20 m and the building face is 29.84 m. So in this case clearly 20 m
< 29.84 m and thus h < b. So the wind only has to be calculated for z = 20 m.
e
In this example, the wind is calculated for a construction without 50% nets, situated in Belgium for terrain category IV,
wind zone 25 m/s and reference period 15 years.
The terrain category is determined as follows (EN 1991-1-4, Table 4.1):
z z
0 min
m m
0 Sea or coastal area exposed to the open sea 0,003 1
I Lakes or flat and horizontal area with negligible vegetation and without
0,01 1
obstacles
II Area with low vegetation such as grass and isolated obstacles (trees,
0,05 2
buildings) with separations of at least 20 obstacle heights
III Area with regular cover of vegetation or buildings or with isolated
obstacles with separations of maximum 20 obstacle heights (such as 0,3 5
villages, suburban terrain, permanent forest)
IV Area in which at least 15 % of the surface is covered with buildings and
1,0 10
their average height exceeds 15 m
71

| Terrain category | z
0
m | z
min
m |
| --- | --- | --- |
| 0 Sea or coastal area exposed to the open sea | 0,003 | 1 |
| I Lakes or flat and horizontal area with negligible vegetation and without
obstacles | 0,01 | 1 |
| II Area with low vegetation such as grass and isolated obstacles (trees,
buildings) with separations of at least 20 obstacle heights | 0,05 | 2 |
| III Area with regular cover of vegetation or buildings or with isolated
obstacles with separations of maximum 20 obstacle heights (such as
villages, suburban terrain, permanent forest) | 0,3 | 5 |
| IV Area in which at least 15 % of the surface is covered with buildings and
their average height exceeds 15 m | 1,0 | 10 |


Advanced Package Training – Scaffolding
For Belgium, v equals 25 m/s following the EC-EN. In addition c and c are all equal to 1.0. From this the basic
b,0 dir season
wind velocity v can be calculated with formula (4.1) of EN 1991-1-4:
b
v =c ∙c ∙v ∙c =1.0∙1.0∙25∙0.928=23.21 m/s
b dir season b,0 prob
• c directional factor: value may be given in the National Annex, recommended value 1.0
dir
• c season factor: value may be given in the National Annex, recommended value 1.0
season
1−K∙ln(−ln(1−p)) n 1−0.2∙ln(−ln(1−0.067)) 0.5
• c =( ) =( ) =0.928
prob 1−K∙ln(−ln(0.98)) 1−0.2∙ln(−ln(0.98))
• R reference period → p = 1/R
For terrain category IV, the mean wind velocity v is calculated using the following formula (4.3) of EN 1991-1-4:
m
v (z)=c (z)∙c (z)∙v
m r 0 b
z
• c (z)=k ∙ln( ) for z ≤z≤z
r r z0 min max
• c (z)=c (z ) for z≤z
r r min min
• c orography factor: taken as 1.0, unless specified otherwise in EN 1991-1-4 §4.3.3
0
0.07
• k =0.19∙(
z0
)
r z0,II
For our example:
z 0.07 z 1.0 0.07 20
v (z)=0.19∙( 0 ) ∙ln( )∙c (z)∙v =0.19∙( ) ∙ln( )∙1.0∙23.21=16.29 m/s
m z z 0 b 0.05 1.0
0,II 0
The peak velocity pressure is calculated with formula (4.8) of EN 1991-1-4:
1
q (z)=c (z)∙q =c (z)∙ ∙ρ∙v2
p e b e 2 b
• ρ 1.25 kg/m³
• c (z)=[1+7∙I (z)]∙(c (z))2∙(c (z))2
e v r 0
• I (z)=
kl
for z ≤z≤z
v z min max
c0(z)∙ln(
z0
)
• I (z)=I (z ) for z≤z
v v min min
• k turbulence factor: value may be given in the National Annex (0.85 for terrain category IV
l
according to NBN EN 1991-1-4)
For our example the maximal wind pressure will become:
k 1 k 1
q (z)=[1+7∙ l ]∙(c (z)) 2 ∙(c (z)) 2 ∙ ∙ρ∙v2 =[1+7∙ l ]∙ ∙ρ∙v2
p c (z)∙ln( z ) r 0 2 b c (z)∙ln( z ) 2 m
0 z 0 z
0 0
0.85 1
q (z)=[1+7∙ ]∙ ∙1.25∙16.29²=496 N/m²=0.496 kN/m²
p 20 2
1.0∙ln( )
1.0
EN 12811-1 §6.2.7.4.2 prescribes that if the scaffolding is into service, it only needs to be loaded with the so-called
working wind load: a uniformly distributed velocity pressure of 0.20 kN/m² shall be taken into account.
This working wind load is calculated analogously to the maximal wind load on the scaffolding, but a reference wind
pressure of 0.20 kN/m² is assumed. With c = 1.64 this leads to q = 0.294 kN/m².
e p
72 DD – 2025/03/03

Annex D
Annex D: Stability analysis
Linear Stability
During a linear stability calculation, the following assumptions are used:
• Physical Linearity.
• The elements are taken as ideally straight and have no imperfections.
• The loads are guided to the mesh nodes, it is thus mandatory to refine the finite element mesh in order to
obtain precise results.
• The loading is static.
• The critical load coefficient is, per mode, the same for the entire structure.
• Between the mesh nodes, the axial forces and moments are taken as constant.
The equilibrium equation can be written as follows:
[K −K ]⋅u=F
E G
The symbol u depicts the displacements and F is the force matrix.
As specified in the theory of the Timoshenko method, the stiffness K is divided in the elastic stiffness K and the
E
geometrical stiffness K . The geometrical stiffness reflects the effect of axial forces in beams and slabs.
G
The basic assumption is that the elements of the matrix K are linear functions of the axial forces in the members. This
G
means that the matrix K corresponding to a th multiple of axial forces in the structure is the th multiple of the original
G
matrix K .
G
The aim of the buckling calculation is to find such a multiple  for which the structure loses stability. Such a state
happens when the following equation has a non-zero solution:
[K −λ⋅K ]⋅u=0
E G
In other words, such a value for  should be found for which the determinant of the total stiffness matrix is equal to
zero:
K −λ⋅K =0
E G
Similar to the natural vibration analysis, the subspace iteration method is used to solve this eigenmode problem. As for
a dynamic analysis, the result is a series of critical load coefficients  with corresponding eigenmodes.
To perform a stability calculation, the functionality Stability must be activated.
73

Advanced Package Training – Scaffolding
The  values can be found under Results > Critical load coefficients.
The number of critical coefficients to be calculated per stability combination can be specified under Setup > Solver.
Notes:
• The first eigenmode is usually the most important and corresponds to the lowest critical load coefficient. A
possible collapse of the structure usually happens for this first mode.
• The structure becomes unstable for the chosen combination when the loading reaches a value equal to the
current loading multiplied with the critical load factor.
• A critical load factor smaller than 1 signifies that the structure is unstable for the given loading.
• The eigenmodes (buckling shapes) are dimensionless. Only the relative values of the deformations are of
importance, the absolute values have no meaning.
• ‘Initial Stress’ is the only local nonlinearity taken into account in a linear stability calculation.
The principle of a stability calculation and the meaning of the matrix K will be explained with a simple example.
G
Suppose the next situation:
This beam with length L has a pinned support at the left and a flexible spring support at the right with rigidity: K . Two
E
point loads are inputted on the beam: a vertical force R and a compression force N.
Standard analysis says that R and N are independent (in the undeformed configuration) and the stiffness relationship is:
K ∙r=R
E
With r the vertical translation of the right point of the beam.
74 DD – 2025/03/03

Annex D
But, if the structure is allowed to deform, we can calculate equilibrium in the deformed configuration as shown below:
Summing moments about the pinned end we get:
R∙L+N∙r=S∙L
The equation for the response of the spring is:
K ∙r=S
E
Substituting S we get:
R∙L+N∙r=(K ∙r)∙L
E
Dividing by L:
N
R+ ∙r=K ∙r
L E
And grouping terms we have:
N
R=(K − )∙r
E L
This can further be rewritten if we define the geometric stiffness as:
N
K =
G L
giving the final form as:
R=(K −K )∙r
E G
Or:
[K −K ]∙u=F
E G
When the normal force N is multiplied with a factor so that the total rigidity becomes zero:
cr
α ∙N
cr
K − =0
E L
The structure will buckle and become ‘unstable’.
75

Advanced Package Training – Scaffolding
Nonlinear Stability
As specified in the assumptions of the previous paragraph: a stability calculation is by default a linear process.
Nonlinearities like friction supports, pressure only supports, … are not taken into account.
Specifically for this purpose, SCIA Engineer provides the use of a nonlinear stability calculation. This type of calculation
has the following additions to the linear stability calculation:
• local nonlinearities are taken into account;
• 3rd order effects are taken into account using the Modified Newton-Raphson algorithm.
Modified Newton-Raphson follows the same principles as the default method but will automatically refine the number
of increments when a critical point is reached and will only update its stiffness matrix every N iterations. This method
can therefore give precise results for post-critical states.
SCIA Engineer will perform a 3rd Order calculation considering local nonlinearities. After this calculation, the resulting
deformed structure is used for a stability calculation. As a result, the critical load factor of the structure is obtained for
the structure including nonlinearities.
To activate the nonlinear stability calculation, the functionalities Stability and Nonlinearity > Geometrical nonlinearity
must be activated.
In addition, support and/or beam local nonlinearities can also be activated.
76 DD – 2025/03/03

Annex D
The choice of the 3rd order theory, the number of increments and the maximal number of iterations can be specified
through Menu bar > Tools > Calculation & Mesh > Solver settings:
Since the nonlinear stability calculation automatically implies the Modified Newton-Raphson method for the solver, this
method cannot be chosen here.
Since the Modified Newton-Raphson method also applies the loading using increments, it is important to set a right
amount of increments. This implies that it is advised to choose the Newton-Raphson method so you have access to the
number of increments.
77

Advanced Package Training – Scaffolding
Buckling shape
Example Stability_Imperfection.esa
In this example, the use of the buckling shape as imperfection according to EC3 is illustrated for a column.
The column has a cross-section of type RO48,3X3,2, is fabricated from S 235 and has the following relevant properties:
• E = 210.000 N/mm²
• f = 235 N/mm²
y
•  = 1,00
M1
• L = 2000 mm
• A = 453 mm²
• I = 116000mm4
y
• W = 6508.8 mm3
pl,y
Calculation of the buckling shape
First a stability calculation is done using a load of 1 kN. This way, the elastic critical buckling load N is obtained. In order
cr
to obtain precise results, the Number of 1D elements is set to 10. In addition, the Shear Force Deformation is neglected
so the result can be checked by a manual calculation.
The stability calculation gives the following result:
This can be verified with Euler’s formula using the member length as the buckling length:
π2EI π2⋅210.000 N ⁄
mm2
⋅116000 mm4
N = = =60105,89 N
cr l2 (2000 mm)2
78 DD – 2025/03/03

Annex D
The following picture shows the mesh nodes of the column and the corresponding buckling shape:
Using for example an Excel worksheet, the buckling shape can be approximated by a 4th grade polynomial.
A polynomial has the advantage that the second derivative can easily be calculated:
⇒η =1,42E−10 x4 −5,70E−7 x3 +7,55E−5 x2 +9,88E−1 x
cr
⇒η" =1,70E−9 x2 −3,43E−6 x +1,51E−4
cr,max
79

Advanced Package Training – Scaffolding
Calculation of e
0
N =f ∙A=235 N ⁄ ∙453 mm2 =106455N
Rk y mm2
M =f ∙W =235 N ⁄ ∙6508.8 mm3 =1529568 Nmm
Rk y pl mm2
λ=√ N Rk⁄ =√106455N ⁄ =1,33
N 60110N
cr
α=0,21 for buckling curve a
1
χ= =0,45
2 2 2 2
0,5[1+α(λ−0,2)+(λ) ]+√(0,5[1+α(λ−0,2)+(λ) ]) −(λ)
These intermediate results can be verified through SCIA Engineer when performing a steel ULS check on the column:
2
χ⋅(λ)
1−
M γ 1529568 Nmm
⇒e =α⋅(λ−0,2)⋅ Rk ⋅ M1 =0,21⋅(1,33−0,2)⋅ =𝟑,𝟒𝟏 𝐦𝐦
0 N 2 106455 N
Rk 1−χ⋅(λ)
The required parameters have now been calculated so in the final step the amplitude of the imperfection can be
determined.
Calculation of 
init
The mid section of the column is decisive  x = 1000
η at mid section = 636,6
cr
η′′ at mid section = 1,57E-03 1 ⁄
cr,max mm²
N 60110N
cr
⇒η =e ⋅ =3,41mm⋅ ⋅636,6
init 0 E⋅I y ⋅η c ′′ r,maxcr 210000 N ⁄ mm2 ⋅116000mm4⋅1,57E-31 ⁄ mm2
=𝟑,𝟒𝟐 𝐦𝐦
This value can now be inputted as amplitude of the buckling shape for imperfection.
To illustrate this, the column is loaded by a compression load equal to its buckling resistance.
However, due to the imperfection, an additional moment will occur which will influence the section check. The buckling
resistance can be calculated as follows:
χ⋅A⋅f
N =N = y =0,45⋅453 mm2⋅235 N ⁄ =47,90 kN
Ed b,Rd γ mm2
M1
A nonlinear combination is created in which the buckling shape as imperfection is specified:
80 DD – 2025/03/03


## Sayfa 81

Annex D
Using this combination, a nonlinear second order calculation is executed using Timoshenko’s method.
The additional moment can be easily calculated as follows:
1 1
M =N ⋅η ⋅ =47,90 kN⋅0,00342 m⋅ =𝟎,𝟖𝟎 𝐤𝐍𝐦
η,init Ed init N 47,90 kN
1− Ed 1−
N 60,11 kN
cr
When performing a steel ULS check on the column for the nonlinear combination, this can be verified. The critical check
is performed at 1 m and has the following effects:
The additional moment thus corresponds to the moment calculated by SCIA Engineer.
As seen in the diagram of EC-EN, Path 3 is followed: the buckling shape serves as a unique global and local imperfection.
This implies that only a section check and Lateral Torsional Buckling need to be checked. Since LTB is negligible with this
small bending moment, only a section check is required:
This example has illustrated the use of a buckling shape as imperfection. Depending on the geometry of the structure,
this imperfection can have a large influence on the results due to the additional moments which occur.
When using this method, it is very important to double check all applied steps: small changes to the loading or
geometry require a re-calculation of the buckling shape and amplitude before a nonlinear analysis may be carried out.
As a final note: the buckling shape only gives information about a specific zone of the structure. The imperfection is
applied at that zone and results/checks are only significant for that zone. Other combinations of loads will lead to
another buckling shape thus to each load combination a specific buckling shape must be assigned and a steel code
check should only be used on those members on which the imperfection applies. Since the applied buckling shape
corresponds to a global mode, failure of these members will lead to a collapse of the structure.
81

Advanced Package Training – Scaffolding
References and literature
[1] DIN 4420 Teil 1
Arbeits- und Schutzgerüste
Allgemeine Regelungen, Sicherheitstechnische Anforderungen, Prüfungen
December 1990
[2] HD 1000
Gevelsteigers bestaande uit prefab onderdelen
1992
[3] EN 12810-1
Façade scaffolds made of prefabricated components:
Part 1: Products specifications
2004
[4] EN 12810-2
Façade scaffolds made of prefabricated components:
Part 2: Particular methods of structural design
2004
[5] EN 12811-1
Temporary works equipment
Part 1: Scaffolds – performance requirements and general design
2004
[6] EN 12811-3: Scaffolds: Load Testing, 2003
[7] EN 12812
Falsework – Performance requirements and general design
2004
[8] NBN ENV 1991-2-4
Belasting op draagsystemen: Windbelasting
1995
[9] Eurocode 3:
Design of Steel Structures
Part 1 – 1 : General rules and rules for buildings
EN 1993-1-1:2003, 2003
[10] Handbuch des Gerûstbaus
Friedrich Nather, Hoachim Lindner, Robert Hertle
2005
[11] Eurocode 9
Design of aluminium structures
Part 1 – 1 : General structural rules
EN 1999-1-1:2007
82 DD – 2025/03/03

Diversen
[12] Zulassung Nr. Z-8.22-208
Modulsystem "CUPLOK"
Deutsches Institut für Bautechnik, 2006
[13] Zulassung Nr. Z-8.22-64
Modulsystem "Layher-Allround"
Deutsches Institut für Bautechnik, 2008
[14] Zulassung Nr. Z-8.22-939
Modulsystem "Layher-Allround LW"
Deutsches Institut für Bautechnik, 2013
[15] Modeling – Geometric Stiffness – P - Δ
[16] Höglund T., Beams-Columns, Alternative Imperfection according to Eurocode 9, 2005
[17] Nederlandse Annex voor windbelasting op steigers – aanvulling op NEN-EN 1991-1-4
VSB.01.A.2020
September 2020
83

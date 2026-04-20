# MAN [Eng] SCIA25.0 - Topic training Foundations

**Kategori:** SCIA Engineer Manual
**Kaynak:** `MAN [Eng] SCIA25.0 - Topic training Foundations-1wlbi4dlp35.pdf`

---

**Toplam Sayfa:** 59


## Sayfa 1

\ SCIA ENGINEER
TOPIC TRAINING

| \ SCIA ENGINEER
TOPIC TRAINING |
| --- |
| Foundations |


Topic Training - Foundations
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2024 SCIA nv. All rights reserved.
2 BV – 2024/12/31

Table of contents
Table of Contents
Table of Contents .................................................................................................................................................... 3
Introduction ............................................................................................................................................................ 4
Chapter 1: Subsoil .......................................................................................................................................... 5
Subsoil Parameters .................................................................................................................................. 5
Parameters for check .......................................................................................................................... 5
Elastic foundation .................................................................................................................................... 6
Chapter 2: Pad foundations ........................................................................................................................... 8
Requirements ........................................................................................................................................... 8
Design approaches ................................................................................................................................... 9
Ground properties ................................................................................................................................. 12
Properties of the Pad Foundation .......................................................................................................... 13
Determination of effective geometry ..............................................................................................13
Pad foundation checks ........................................................................................................................... 18
Bearing check.....................................................................................................................................19
Sliding check ......................................................................................................................................23
Eccentricity check ..............................................................................................................................24
Uplift check ........................................................................................................................................25
Pad foundation Autodesign .................................................................................................................... 26
Chapter 3: Foundation strips ....................................................................................................................... 27
Definition ............................................................................................................................................... 27
Chapter 4: Geologic profiles, Geologic areas and Boreholes ....................................................................... 28
Geologic profile ...................................................................................................................................... 28
General geologic profile parameters................................................................................................29
Layer-related parameters .................................................................................................................29
Geologic area ......................................................................................................................................... 30
Boreholes ............................................................................................................................................... 31
Borehole parameters ........................................................................................................................32
Soil pressure and water pressure ........................................................................................................... 33
Soil/Water load parameters ................................................................................................................... 34
Chapter 5: Soilin .......................................................................................................................................... 35
Soilin calculation .................................................................................................................................... 35
Subsoil in the 3D model ....................................................................................................................36
Settings ..............................................................................................................................................37
Soilin iterative cycle ...........................................................................................................................38
Results of soilin ...................................................................................................................................... 39
Subsoil stiffness parameters .............................................................................................................39
Subsoil model results ........................................................................................................................40
Additional plates ................................................................................................................................44
Advanced tips ......................................................................................................................................... 50
The effect of the subsoil outside the structure ...............................................................................50
Automatic calculation of the edge supports ....................................................................................50
Pad foundation and soilin .................................................................................................................51
What if the model is correct but the iteration is not finished ........................................................52
What if the load is wrongly inserted? ..............................................................................................53
What if the symmetrical structure gives non-symmetrical results? ...............................................53
Annex 1: Pad Foundation Stiffness ........................................................................................................................ 54
Annex 2: Recommended geotechnical data .......................................................................................................... 55
BV – 2024/12/31 3

Topic Training – Foundations
Introduction
This course will explain the principles of the use of Foundations and Subsoil in SCIA Engineer. Most of the modules
necessary for these calculations are included in the Concept Edition.
For some options a Concept Edition is not sufficient. These specific required modules are included in an Expert Edition
or even some extra modules are necessary.
The methods discussed in this manual are based on Eurocode 7. EN 1997-1 is intended to be applied to the
geotechnical aspects of the design of buildings and civil engineering works. It is concerned with the requirements for
strength, stability, serviceability and durability of structures.
List of necessary modules:
• senfd.01.en (esafd.02.01) Pad Foundations EC (Part of Concept Edition)
• sens.04 (esas.06) Soil interaction (Part of Expert Edition)
• esas.08 Soil (Part of basic module sens.00)
4 BV – 2024/12/31

Subsoil
Chapter 1: Subsoil
In SCIA Engineer the "under-foundation" soil is called subsoil and can be defined via Main menu > Libraries > Subsoil
and foundation.
It is not necessary to activate any functionalities in SCIA Engineer 25.0. In older versions of the software it could be
necessary to activate the functionality ‘Subsoil’ in the project settings.
Subsoil Parameters
The definition of subsoil parameters can be done in the editing dialogue for subsoil.
The constants C1 and C2 for directions X, Y, Z are parameters representing the subsoil properties.
Note: usually C2x is considered equal to C2y and C1x equal to C1y.
Parameters for check
These data are used only for the stability check of a foundation block:
• Type soil type: Undrained or Drained
• Specific weight soil density
• Fi’ (φ’) value of the angle of the shearing resistance in terms of effective stress
• Sigma oc (σ ) admissible ground stress (optional)
oc
• Cu value of the undrained shear strength
BV – 2024/12/31 5

Topic Training – Foundations
Elastic foundation
In SCIA Engineer the soil can be modelled as an elastic foundation where the soil under a plate (2D member) is
represented by springs.
The subsoil parameters C1 and C2 represent the stiffnesses of these springs.
Winkler Model
The Winkler method is the most common and simple method. This model is based on a uniform settlement of the plate.
A load F will give a certain deformation Δz so the subsoil parameter C can be determined.
1z 1 1z
The parameters C , C and C will represent a linear stiffness.
1X 1y 1z
F(cid:2)(cid:3) (cid:4)C(cid:2)(cid:3)∙Δz(cid:2)
The horizontal subsoil parameters C and C indicate the friction between the plate and the ground. In literature more
1x 1y
information can be retrieved for the calculation of these parameters. For normal soils (no rock, peat ...) a guide value of
10% of the vertical stiffness C may be taken.
1z
Pasternak Model
The Winkler model can be extended with the Pasternak model (C constants). The springs between the points of the soil
2
are now connected with this value. So a point load in a certain point, will also give a deformation a bit further in the X
and Y direction.
The calculation of those parameters is not easy, but it could be done by the module Soilin of SCIA Engineer. If Soilin is
not being used in SCIA Engineer, it is recommended to have zero values for these C parameters.
2
After modelling a 2D member, you can add an elastic foundation with the function ‘surface support’ which you can find
in the input panel.
6 BV – 2024/12/31

Subsoil
To see the results of the elastic foundation, go to Main Menu > Results > 2D members > Contact stresses.
Note: Convention for the soil stresses is: - positive value = compressive stress
- negative value = tensile stress
To eliminate the tension in the subsoil, you have to perform a nonlinear analysis. The functionality ‘support
nonlinearity/basic soil spring will also need to be activated. It is not necessary to create a nonlinear function.
BV – 2024/12/31 7

Topic Training – Foundations
Chapter 2: Pad foundations
In this chapter the different steps of the Pad Foundation Checks are specified.
First of all, the required safety and resistance factors need to be determined depending on the chosen Design
Approach.
Using these safety factors, the vertical design loading V , horizontal design loading H and effective geometry of the pad
d d
are determined.
Based on this effective geometry, the different checks are executed.
The above steps are explained in detail in the following paragraphs.
Requirements
In order to design a foundation pad, the following functionalities should be enabled in the Project Data dialogue:
• Material Concrete
• Functionality ‘Pad foundation check’
8 BV – 2024/12/31

Pad foundations
Design approaches
The Pad Foundation check is executed for a Result Class.
The manner in which the design effects of actions and resistances are applied shall be determined using one of three
Design Approaches. The design approach can be set in the annex setup:
Depending on the Design Approach set in the National Annex Setup, the sets of safety factors are read from the setup
as follows:
Combination 1: A1 “+” M1 “+” R1
Combination 2: A2 “+” M2 “+” R1
Design Approach 2 Combination: A1 “+” M1 “+” R2
Combination: (A1* or A2**) “+” M2 “+” R3
Design Approach 3 * On structural actions
** On geotechnical actions
• For Design Approach 1 the safety sets depend on the combination type.
For combinations of type EN-ULS (STR/GEO) Set B sets M1 & R1 are used.
For combinations of type EN-ULS (STR/GEO) Set C sets M2 & R1 are used.
For any other combination sets M1 & R1 are used.
• For Design Approach 2, in all cases sets M1 & R2 are used.
• For Design Approach 3, in all cases sets M2 & R3 are used.
BV – 2024/12/31 9

| Design Approach 1 | Combination 1: A1 “+” M1 “+” R1
Combination 2: A2 “+” M2 “+” R1 |
| --- | --- |
| Design Approach 2 | Combination: A1 “+” M1 “+” R2 |
| Design Approach 3 | Combination: (A1* or A2**) “+” M2 “+” R3
* On structural actions
** On geotechnical actions |


Topic Training – Foundations
The safety factors corresponding with a certain design approach can be found in the Annex A of EN 1997-1:
1) Partial factors on actions or the effects of actions (Set A1-A2)
γ : on permanent unfavourable or favourable actions
G
γ : on variable unfavourable or favourable actions
Q
2) Partial factors for soil parameters (Set M1-M2)
γ : on the tangent of the angle of shearing resistance
ϕ’
γ : on effective cohesion
c’
γ : on undrained shear strength
cu
γ : on unconfined strength
qu
γ: on weight density
γ
3) Partial resistance factors for pad foundations (Set R1-R3)
γ : on bearing resistance
R;v’
γ : on sliding resistance
R;h
10 BV – 2024/12/31


## Sayfa 11

Pad foundations
The partial safety factors for the combinations are defined in the Manager for National Annexes. It can be opened from
the Project settings dialogue.
Available are factors for Set B of the EN-ULS (STR/GEO) combination defined in EN 1990. In addition, for Geotechnical
analysis, also Set C needs to be supported. Also these factors are available in the Combination Setup:
Also the partial factors for soil parameters and the partial resistance factors for pad foundations which are defined in
EN 1997 are implemented in the manager for National Annexes.
In order to perform a Pad Foundation check, you have to define 2 types of combinations:
• EN-ULS (STR/GEO) Set B
• EN-ULS (STR/GEO) Set C
After the calculation, a new class GEO will be generated automatically which contains all combinations of these 2 types.
Note: The Result Class may off course also contain load cases or non-linear combinations. These are seen as ‘Any
combination’ for the check.
BV – 2024/12/31 11

Topic Training – Foundations
Ground properties
With the correct Design Approach, the design values for the soil properties are determined:
(cid:1)
(cid:1) (cid:10)
(cid:10) tan(cid:2)(cid:16) (cid:17)
(cid:9)(cid:4)atan (cid:15) (cid:1) (cid:18)
(cid:10)
(cid:10)
(cid:10) (cid:2)c
c(cid:9)(cid:4)
(cid:20)(cid:10)
(cid:2)c(cid:21)
c(cid:21)(cid:9)(cid:4)
(cid:2)(cid:20)(cid:21)
(cid:2) (cid:10)
(cid:10) (cid:2)
(cid:9)(cid:4) (cid:2)
(cid:2)
(cid:2)
(cid:22)(cid:23)(cid:2)(cid:20)(cid:24)(cid:25)(cid:26)(cid:27)(cid:27)
(cid:22)(cid:23)(cid:20)(cid:24)(cid:25)(cid:26)(cid:27)(cid:27),(cid:9)(cid:4) (cid:2)
With:
• j ’ read from Subsoil Library
• c’ read from Subsoil Library
d
• c read from Subsoil Library
u
• g ’ specific weight read from Library
• g j ’ read from National Annex Setup
• g read from National Annex Setup
c’
• g read from National Annex Setup
cu
• g g read from National Annex Setup
• g weight read from Pad foundation input Data
Backfill
(cid:2) : a final safety factor which needs to be determined concerns the safety factor for the weight of the pad foundation
a(cid:29)nd the backfill material. This safety factor is taken as the safety factor for the first permanent load case for the
combination under consideration i.e. γ . In case a combination does not have a permanent load case, γ is taken as
G G
1,00.
12 BV – 2024/12/31

Pad foundations
Properties of the Pad Foundation
Determination of effective geometry
The next step in the check concerns the determination of the effective geometry of the pad foundation.
The following picture illustrates the different actions working on the foundation.
In this picture the following notations are used:
• G weight of the foundation and of any backfill material inside the area of ‘abcd’
• g load application point for load G referenced to the center point of the foundation base
• P vertical Rz reaction of the support
• p load application point for load P referenced to the center point of the foundation base
this is read as the load eccentricities ex and ey from the Pad Foundation library
• H horizontal Rx or Ry reaction of the support
• h =(h1 + h2)
Load application point of the horizontal load H referenced to the foundation base
With h1 and h2 read from the Pad Foundation Library
• M moment Mx or My reaction of the support
• V = G + P
d
ultimate load vertical to the foundation base including the weight of the foundation and any backfill
material
• e load application point for load V referenced to the center point of the foundation base
d
Eccentricity e
The eccentricity e is calculated as follows:
M G∗g H∗h&P∗p
e(cid:4)
V(cid:9)
For a general 3D case this formula is written as:
M+ G∗g* H*∗h&P∗p*
e* (cid:4)
V(cid:9)
M* G∗g+ H+∗h&P∗p+
e+(cid:4)
V(cid:9)
BV – 2024/12/31 13

Topic Training – Foundations
Weight G
The weight G consists of three parts:
1) The weight of the foundation block, G
Block
• This depends on the shape of the block (prismatic or pyramidal), dimensions and also the density g
Block
of the block material.
• The density of the block depends on the Water table level
no influence g
Block
at foundation base g
Block
at ground level (g – g )
Block W
• The Water Density g is taken as 9,81 kN/m³
W
2) The weight of the backfill around h2, G
Backfill,Around
• This depends on the shape of the block (prismatic or pyramidal), dimensions and also the density of
the backfill material.
• The backfill density g is specified in Ground properties
Backfill,d
• The density of the backfill depends on the Water table level
no influence g
Backfill,d
at foundation base g
Backfill,d
at ground level (g – g )
Backfill,d W
• The Water Density g is taken as 9,81 kN/m³
W
3) The weight of the backfill above the foundation block, G
Backfill,Above
• This depends on the height and density of the backfill as specified in the input of the Pad Foundation.
Note: In SCIA Engineer it is also possible to input a negative height for the backfill material. A negative value is used to
indicate that the soil is lower than the top of the foundation block.
14 BV – 2024/12/31

Pad foundations
The three parts are illustrated on the following picture:
The design value of the total weight G can then be calculated as follows:
G = g * [G + G + G ]
d G Block Backfill,Around Backfill,Above
With g the safety factor of the permanent loading for the combination under consideration, as defined in “Ground
G
properties”.
Distances
,- & ,/
Using the weight and the volume, the center of gravity of the block and backfill are determined. The distances g and g
x y
are then calculated from this centroid to the center point of the foundation base.
Effective geometry
As a final step, using the eccentricities e and e, the effective geometry of the foundation base is calculated as follows:
x y
L = A – 2 * |e|
1 x
L = B – 2 * |e|
2 y
With A and B read from the Pad Foundation library:
• B’ = min (L ; L )
1 2
• L’ = max (L ; L )
1 2
• A’ = B’ * L’
Note: In case SCIA Engineer will find a value B’< 0 or L’< 0, the geometry is incorrect so the check is not executed and a
warning is given on the output.
BV – 2024/12/31 15

Topic Training – Foundations
The option “Pad foundation” can be chosen in the Properties window of the supports:
Here it is possible to input the influence of the water table and the properties of the backfill material. Also the type of
the subsoil can be chosen under “Subsoil”.
The given stiffnesses of the Pad Foundation are automatically calculated by the program by the formulas that you can
find in Annex 1.
The dimensions of the pad foundations can be inputted at the option “Pad foundation” (or you can open the Pad
foundation library via Main Menu > Libraries > Subsoil and foundation > Pad foundations):
16 BV – 2024/12/31

Pad foundations
You can choose from two variant shapes of pad foundations:
Prismatic Pyramidal
When clicking ‘Edit’ the pad foundation can be displayed in 2D or 3D mode:
• The 2D mode shows side view, plan view and dimension lines for all input values.
• The 3D mode allows you to have a good visualisation of the defined foundation block
BV – 2024/12/31 17

| Prismatic | Pyramidal |
| --- | --- |
|  |  |


Topic Training – Foundations
Pad foundation checks
In general three separate checks are executed:
• Bearing check
• Sliding check
• Eccentricity check
In a special case, instead of the three above checks, a so called Uplift Check is executed.
18 BV – 2024/12/31

| For Design Approach 1 the class for which the check is executed needs to contain at least one combination of each of |  |
| --- | --- |
| the following types: |  |
|  | • EN-ULS (STR/GEO) Set B |
|  | • EN-ULS (STR/GEO) Set C |
|  |  |
| In case the class for which you wish to execute the check does not comply with this requirement, the check is not |  |
| executed and a warning is shown instead. |  |
|  |  |
| For Design Approach 2 & 3 there is no requirement for the content of the class. |  |


Pad foundations
Bearing check
The Bearing check is executed according to EN 1997-1 art. 6.5.2 and Annex D.
V(cid:9)0R(cid:9)
The Bearing resistance R depends on the fact if the soil condition is drained or undrained.
d
In case you ‘know’ the soil capacity, for example from a geotechnical report, R can be read directly from the input data
d
instead of calculated.
Undrained Bearing Resistance
The formulas in this paragraph are used in case the Type field in the Subsoil Library is set to Undrained.
The design value of the undrained bearing resistance is calculated as follows:
(cid:15)(cid:16)π 2(cid:17)∗c(cid:21)(cid:9) ∗b(cid:20)∗s(cid:20)∗i(cid:20) q(cid:18)∗A′
R(cid:9)(cid:4)
γ;,<
c As specified in the National Annex Setup
ud
b Inclination of the foundation base
c
In SCIA Engineer, the foundation base is always horizontal, thus: b = 1,00
c
s Shape of the foundation
c
In SCIA Engineer the foundation block has a rectangular shape, s =
c (cid:22)(cid:10)
1 0,2∗
i Inclination of the load, caused by horizontal load H ?(cid:10)
c d
1 H(cid:9)
(cid:4) @1 A1& (cid:10) B
2 A ∗c(cid:21)(cid:9)
and H £ A’ * c
d ud
in case H d > A’ * c ud the value of i c is set to 0,5
H Resulting horizontal load
d
D D
(cid:4)CH* H+
H Horizontal support reaction Rx as defined in “General”
x
H Horizontal support reaction Ry as defined in “General”
y
B’ Effective width as defined in “General”
L’ Effective length as defined in “General”
A’ Effective area as defined in “General”
q Overburden at the foundation base
= (h1 + h2 + h )* g
backfill Backfill,d
With:
h1 & h2 read from the Pad Foundation Library
h read from the Pad Foundation input
backfill
g as defined in ground properties
Backfill,d
g Resistance factor read from the National Annex Setup
R,v
BV – 2024/12/31 19

Topic Training – Foundations
Drained Bearing Resistance
The formulas in this paragraph are used in case the Type field in the Subsoil Library is set to Drained.
The design value of the drained bearing resistance is calculated as follows:
(cid:10) (cid:10)
Ec′(cid:9)∗N(cid:20)∗b(cid:20)∗s(cid:20)∗i(cid:20) q(cid:9)∗NG∗bG∗sG∗iG 0,5∗γ(cid:9)∗B′∗NJ∗bJ∗sJ∗iJK∗A′
R(cid:9) (cid:4)
γ;,<
c ’ As specified in the National Annex Setup
d
N Bearing resistance factor
c
(cid:10)
N B (cid:4) ea LN rinGg & re 1 s M is ∗ ta c n o c t e (cid:16) f φ ac(cid:9)to (cid:17) r
q
(cid:10)
P∗Q(cid:23)R (cid:16)S T U(cid:17) D φ(cid:9)
(cid:4)e ∗tan (cid:16)45 (cid:17)
Ng Bearing resistance factor 2
(cid:10)
b I (cid:4) nc 2 lin ∗ a L ti N o G n & of 1 th M e ∗ f t o a u n n (cid:16) d φ ati(cid:9)o (cid:17) n base
c
In SCIA Engineer, the foundation base is always horizontal, thus: b = 1,00
c
b Inclination of the foundation base
q
In SCIA Engineer, the foundation base is always horizontal, thus: b = 1,00
q
bg Inclination of the foundation base
In SCIA Engineer, the foundation base is always horizontal, thus: bg = 1,00
s Shape of the foundation
c
In SCIA Engineer the foundation block has a rectangular shape,
s =
c WX∗YXZ(cid:2)
YXZ(cid:2)
s Shape of the foundation
q
In SCIA Engineer the foundation block has a rectangular shape,
s
q (cid:22)(cid:10) (cid:10)
(cid:4)1 [
?(cid:10)
\∗sin (cid:16)φ(cid:9)(cid:17)
sg Shape of the foundation
In SCIA Engineer the foundation block has a rectangular shape, sg
(cid:22)(cid:10)
(cid:4)1&0,3∗
?(cid:10)
i Inclination of the load, caused by horizontal load H
c d
L1&iGM
(cid:4)iG& (cid:10)
i Inclinati N o(cid:20)n ∗ of t a t n he (cid:16) φ loa(cid:9)d (cid:17) , caused by horizontal load H
q d
‘
H(cid:9)
(cid:4)^1& (cid:10) (cid:10) _
ig Inclinati V o (cid:9) n of A the ∗ l c o ′ a (cid:9) d ∗ , c c a o u t(cid:16) s φ ed(cid:9) b (cid:17) y horizontal load H d
‘a(cid:2)
H(cid:9)
(cid:4)^1& (cid:10) (cid:10) _
m
V(cid:9) A ∗c′(cid:9)∗cot(cid:16)φ(cid:9)(cid:17)
D D
(cid:4) m?∗cos (cid:16)θ(cid:17) m(cid:22)∗sin (cid:16)θ(cid:17)
m
L
L′
d2 e gh
B′
(cid:4)
L′
d1 e gh
B′
20 BV – 2024/12/31


## Sayfa 21

Pad foundations
m
B
B′
d2 e gh
L′
(cid:4)
B′
d1 e gh
q Angle of tLh′e horizontal load H
d
with the direction L’
' As specified in the Ground properties
d
Effective width as defined in general
BL’′ Effective length as defined in general
A’ Effective area as defined in General
H Resulting horizontal load
d
D D
(cid:4)CH* H+
H Horizontal support reaction Rx
x
H Horizontal support reaction Ry
y
V Vertical reaction as specified in “General”
d
q’ Effective overburden at the foundation base
d
=(h1 + h2 + h )* g ’
backfill t
With:
h1 & h2 read from the Pad Foundation Library
h read from the Pad Foundation input
backfill
g ’ is depending on the water level as follows:
t
No influence g
Backfill,d
at foundation base g
Backfill,d
at ground level (g – g )
Backfill,d W
g as defined in Ground properties
Backfill,d
g is taken as 9,81 kN/m³
W
(cid:2) Effective weight density of the soil below the foundation level
(cid:10)
i depending on the water level as follows:
No influence g ’
d
at foundation base (g ’ – g )
d W
at ground level (g ’ – g )
d W
g ’ as defined in Ground properties
d
g is taken as 9,81 kN/m³
W
g Resistance factor read from the National Annex Setup
R,v
BV – 2024/12/31 21

Topic Training – Foundations
Known Soil Capacity Bearing Resistance
In case the Soil capacity is known, this value can be used directly instead of using the EN 1997-1 bearing resistance
calculation outlined above.
This procedure is applied in case the checkbox Known soil capacity, use Sigma oc is activated in the Geotechnical Design
Setup. You can find the setup via Main Menu > Design > Geotechnics > Settings.
The design value of the bearing resistance is calculated as follows:
(cid:3)
(cid:10)
R(cid:9) (cid:4)A ∗ j(cid:9)
A’ Effective area as defined in “general
s Design value of the admissible soil capacity, taken as s
od oc
s Read from the Subsoil Library
oc
22 BV – 2024/12/31

Pad foundations
Sliding check
The Sliding check is executed according to EN 1997-1 art. 6.5.3 [Ref.1]
H(cid:9) 0R(cid:9) Rk,(cid:9)
The Sliding resistance R depends on the fact if the soil condition is drained or undrained.
d
The value R specifies the positive effect of the earth pressure at the side of the foundation.
p,d
Since this effect cannot be relied upon, this value is taken as zero in SCIA Engineer.
The sliding resistance is dependent on the condition of the subsoil.
a) - In case the Type field in the Subsoil Library is set to Undrained.
(cid:10)
A ∗c(cid:21)(cid:9)
R(cid:9) (cid:4)
c As defined in Ground properties γ;,l
ud
A’ Effective area as defined in “General”
g Resistance factor read from the National Annex Setup
R,h
- In case the checkbox Water/air in clay subgrade in the Subsoil Library is activated, it means that it is
possible for water or air to reach the interface between a foundation and an undrained clay subgrade.
Following EN 1997-1 § 6.5.3(12), the value of R is limited as follows:
d
V Vertical reaction as defined inR “(cid:9)G0en0e,r4al∗” V(cid:9)
d
b) In case the Type field in the Subsoil Library is set to Drained.
V(cid:9)∗tan (cid:16)δ(cid:9)(cid:17)
R(cid:9)(cid:4)
V Vertical reaction as defined in “Generγal;”, l
d
d Design friction angle at the foundation base
d
Dependent on the Cast condition specified in the Pad
Foundation Library:
Prefabricated
D
In situ
n
∗o ′i
A s specified in Ground por′oiperties
(cid:10)
go i Resistance factor read from the National Annex Setup
R,h
BV – 2024/12/31 23

Topic Training – Foundations
Eccentricity check
EN 1997-1 art. 6.5.4 specifies that special precautions are required for loads with large eccentricities:
Special precautions shall be taken where the eccentricity of loading exceeds 1/3 of the width of a rectangular
footing or 0,6 of the radius of a circular footing.
Such precautions include:
- careful review of the design values of actions in accordance with 2.4.2
- designing the location of the foundation edge by taking into account the magnitude of construction
tolerances.
It is common practice (although not required by EN 1997-1) to put some limit on the eccentricity under
characteristic values of actions.
This can done by checking if the design load is within a critical ellipse or critical diamond.
More specifically the eccentricity of the load should not exceed 1/3 or 1/6 of the width.
The maximal value of the eccentricity is defined in the Geotechnical Design Setup:
Based on the maximal value an eccentricity check is executed as follows:
a) In case the maximal eccentricity is set to 1/3
D D
e* e+ 1
[ \ [ \ 0
A B 9
The eccentricity check of 1/3 takes into account that the pad foundation will not lose contact with the ground
over more than half its width under the service loads.
b) In case the maximal eccentricity is set to 1/6
e* e+ 1
0
A B 6
e As specified in “General”
x
e As specified in “General”
y
A Read from Pad Foundation Library
B Read from Pad Foundation Library
24 BV – 2024/12/31

Pad foundations
The eccentricity check of 1/6 takes into account that the whole pad foundation is under pressure. The
foundation will not lose contact with the ground over the whole area.
c) In case the maximal eccentricity is set to No limit
In this case there is no limit i.e. any eccentricity is allowed. The unity check is then set to 0,00.
Following EN 1997-1 it is not required to put limits on the eccentricity calculation
Uplift check
In case the vertical design loading V is negative, it implies that the pad foundation is in tension and may thus be
d
‘uplifted’ from the ground.
The uplift check is written out as follows and is executed instead of the Bearing, Sliding and Eccentricity checks:
|P|0G(cid:9)
• P vertical Rz reaction as specified in “General”
• G weight of the foundation and any backfill as specified in “General”
d
BV – 2024/12/31 25

Topic Training – Foundations
Pad foundation Autodesign
Autodesign of a concrete pad foundation is located in the actions window of geotechnics: Main Menu > Design >
Geotechnics > Pad foundation check.
The autodesign can run after the calculation. The filter will be automatically switched to Pad foundation when choosing
Autodesign.
When starting the Autodesign, the following dialogue is opened:
You can choose which parameter has to be considered in the Autodesign. When you select the ‘Advanced autodesign’
multiple dimensions can be selected to be Autodesigned.
Next step is to click ‘Search for optimal’ to find the optimal dimensions of the selected pad foundation. This means that
the maximum unity check has to be smaller than 1.
After clicking ‘OK’, the pad foundation is automatically replaced with the new designed one.
26 BV – 2024/12/31

Foundation strips
Chapter 3: Foundation strips
A linear support may be defined in the form of a foundation strip. The supporting is then specified by the properties
and dimensions of the strip together with the properties of the soil below the footing surface.
Definition
Insert a line support on beam and choose as Type the Foundation strip.
The stiffness of the foundation strip is defined by its width, height and the subsoil.
BV – 2024/12/31 27

Topic Training – Foundations
Chapter 4: Geologic profiles, Geologic areas and Boreholes
The 3D model with defined subsoil and geologic profiles displays the subsoil surface. This surface defines the area
where soil properties between boreholes is inter- and extrapolated.
Boreholes together with geologic profiles provide the program information relating to the composition of the
foundation soil. Both data are necessary to calculate the interaction between the structure and the soil below it.
To insert geologic profiles, geologic areas and boreholes in SCIA Engineer, you have to check the functionality ‘Soil
interaction’.
Geologic profile
You can define a new geologic profile in the Geologic profile manager via Main menu > Libraries > Subsoil and
foundation > Geologic profiles
28 BV – 2024/12/31

Geologic profiles, geologic areas and boreholes
General geologic profile parameters
• Water level Defines the level of underground water
The water level influences the parameters of the soil
• Name Specifies the name of the geologic profile
• Not compressible subsoil If ON, the program applies coefficient of depth reduction k2 in compliance with
CSN 001, art. 80.
Numerically it means that the damping of stress component sz in the half-space is
slowed down. All components of elastic-half-space-stress-tensor are calculated in
this reduced depth. It is just an approximate calculation, not an exact solution of the
elastic layer. The difference is however negligible in comparison with other
inaccuracies.
Layer-related parameters
• Name Name of the layer
• Thickness Thickness of the layer
• Edef Module of deformation (see Annex 2)
For geotechnical categories 1 and 2 the indicative value from e.g. CSN 73 1001 can be used,
for category 3 a survey should be carried out to provide the value
• Poisson Coefficient of transverse deformation (range: 0 – 0.5)
An indicative value or experimentally found value can be used
• Dry weight Specific soil weight for dry soil, normally within the range from 18 to 23 kN/m³
• Wet weight Specific soil weight for wet soil
• m Structural strength coefficient
Dimensionless value in the formula for settlement according to CSN 73 1001
Table 10 in the standard states indicative values for various soils in the range from 0.1 to 0.5.
For category 3 it is advisable to consult the engineer who carried out the survey of the
locality in question
For other codes (other than CSN) this coefficient is equal to 0.2
To edit the content of the table, it is possible to copy and paste the content from the clipboard.
Note: The geologic profile must be defined up to such a depth where the effective stress is still active, otherwise the
program does not have enough information.
BV – 2024/12/31 29

Topic Training – Foundations
Geologic area
The basic surface polygon has been divided to the separate areas which are inter- and extrapolated, but the first area
does not affect the next one. Different number of layers in the geologic profile may be used in different areas. For
example: 5 layers in all boreholes in area 1 and 8 layers in all boreholes in area 2.
The line between 2 geologic areas is a geologic fault.
Green: basic outline of the subsoil surface
Red (right side): geologic area 1
Blue (left side): geologic area 2
Red-Blue line: geologic fault
A new geologic area can be defined in the Geologic area library which contains the geometry (4 points) and can be
opened via Main menu > Libraries > Subsoil and foundation > Geologic areas
30 BV – 2024/12/31


## Sayfa 31

Geologic profiles, geologic areas and boreholes
Boreholes
A borehole is fully defined by the (i) corresponding geologic profile, (ii) location and (iii) altitude. Usually a set of
boreholes will be defined and thus they can be used to calculate and display the surface of the land in their
surroundings. This surface can be used for impressive presentations of projects. The surface itself is not taken into
account during the calculation.
The following picture shows an example of defined boreholes. The rectangle represents the patch of land over which
the soil properties can be inter- and extrapolated.
Next picture shows the calculated surface.
There is a possibility to use the borehole as a sand-gravel pile (holes in soil filled by sand and gravel). The sand-gravel
pile consists from the geologic profile and a geometry which defines its outline. The sand-gravel pile outline has the
same behavior as a geologic fault. You can define a borehole with soil layers of this pile and activate the checkbox
"sand-gravel pile. After that you can multicopy this borehole to real positions of piles and in the analysis these "pile
boreholes" are taken into account as local piles under the foundation slab. Moreover you must define one standard
borehole with layers of soil between piles. It must be combined with soilin calculation.
Red (left side): sand-gravel pile with diameter 1m
Blue (right side): standard borehole
Both are displayed inside the subsoil surface outline
BV – 2024/12/31 31

Topic Training – Foundations
A new borehole can be defined via Input panel > Boundary conditions > Borehole profile.
Borehole parameters
• Name Identifies the borehole profile
• Coord X, Y, Z Coordinates of the inserting point of the borehole
• Results only When the calculation is performed, you can obtain a table of settlement. The values of
settlement are calculated in places where boreholes are located. The borehole itself (the
corresponding geologic profile) is also used as an input value for the calculation of
interaction between the structure and the soil
However, it is possible to exclude some boreholes from the input data and use them only as
the location for the calculation of results – settlement
If this parameter is ON, the geologic profile defined in the borehole is ignored, the conditions
in this place are interpolated from surrounding boreholes, but final settlement is calculated
in this location
• Geologic profile Specifies the geologic profile corresponding to the location of the borehole
• Sand-gravel pile Defines if the borehole is used as a sand-gravel pile
• Radius Specifies the radius of sand-gravel pile
Note: After some modification (especially modification of the position) of the borehole, it may be necessary to refresh
the surface.
32 BV – 2024/12/31

Geologic profiles, geologic areas and boreholes
Soil pressure and water pressure
Several types of load (point force, line load and surface load) can be defined as what is called "soil pressure" or "water
pressure ". Both loads are quite related and will be explained together.
Both load types appear only if a structure is located underground. Depending on the surrounding soil, level of
underground water and depth below the surface, the program automatically calculates the soil pressure and water
pressure.
In depth h (point a), the intensities of the generated loads are:
If a is located above water level: (h <= H’d), then (h * Gdry)
SigV,a If a is located below water level: (h > H’d), then (H’d * Gdry + H’w * Gwet)
It works ONLY in the negative direction of global Z-axis!
SigH,a SigH,a = SigV,a * k0
If a is located above water level: (h <= H’d), then ( 0)
If a is located below water level: (h > H’d), then (H’w * Gwater)
This would lead to a distributed load as in the image below:
Water and soil loads can be inputted for the following load cases:
• action type = "permanent" and load type = "standard",
• action type = "variable" and load type = "static".
The procedure to input soil / water pressure:
1. Open the Input panel
2. Start the required load type (point, line, surface).
3. Adjust the parameters - see below.
4. Confirm with [OK].
5. Apply the load on required entities.
BV – 2024/12/31 33

| SigV,a | If a is located above water level: (h <= H’d), then (h * Gdry)
If a is located below water level: (h > H’d), then (H’d * Gdry + H’w * Gwet)
It works ONLY in the negative direction of global Z-axis! |
| --- | --- |
| SigH,a | SigH,a = SigV,a * k0 |
| SigW,a | If a is located above water level: (h <= H’d), then ( 0)
If a is located below water level: (h > H’d), then (H’w * Gwater) |


Topic Training – Foundations
Soil/Water load parameters
In addition to common parameters for point, line and surface loads, this load type requires the input of following data:
• Type Must be set to Soil pressure or Water pressure
• Distribution Only for line load
The line load may be uniform or trapezoidal
• Acting area Only for point load
Defines the acting area for the load
• Acting width Only for line load
Defines the acting width for the load
• Coefficient Only for soil pressure
This coefficient must be defined for horizontal soil pressure. It specifies the ration between
vertical and horizontal soil pressure (i.e. for vertical pressure it should be equal to 1)
• Borehole profile Borehole profile
The soil / water pressure is displayed as shown in the picture below.
Both are generated (orange) loads. The generated soil pressure (left part) reaches just to the top of the borehole (that
was used as the reference borehole). The generated water pressure (right part) is defined only below the level of
underground water. So if the whole model is above the water level, no pressure is generated at all.
The calculation considers these generated loads.
34 BV – 2024/12/31

Soilin
Chapter 5: Soilin
The analysis of foundation structures is challenged by the problem of modeling of the part of the foundation that is in
contact with subsoil. The best solution is to use a 2D model of the subsoil that properly represents the deformation
properties of the whole under-foundation massif by means of a surface model. The properties of such model are
expressed by what is called interaction parameters marked C. These parameters are assigned directly to structure
elements that are in contact with the subsoil and they influence the stiffness matrix.
The parameters of the interaction between the foundation and the subsoil depends on the distribution and loading
level, or the contact stress between the structure surface and the surrounding subsoil, on the geometry of the footing
surface and on mechanical properties of the soil.
Calculation module Soilin takes account of all the mentioned dependencies.
As the C parameters influence the contact stress and vice versa – the distribution of the contact stress has impact on
the settlement of the footing surface and thus the C parameters, it is necessary to use an iterative solution.
The results from the soilin iteration are the C-parameters C1z, C2x and C2y. The parameters C1x and C1y are always
defined by the user.
• C1z - resistance of environment against wP (mm) [C1z in MN/m3]
• C2x - resistance of environment against wP/xP (mm/m) [C2x in MN/m]
• C2y - resistance of environment against wP/yP (mm/m) [C2y in MN/m]
• C1x - resistance of environment against uP (mm) [C1x in MN/m3]
• C1y - resistance of environment against vP (mm) [C1y in MN/m3]
Note: Usually, C2x is considered equal to C2y and C1x equal to C1y, because the calculation is done by so called
isotropic variant of the calculation of C2 parameter.
Soilin calculation
The soilin calculation is available when the functionality Soil interaction is active.
The Soil interaction is available only for Plate XY and General XYZ structure types.
BV – 2024/12/31 35

Topic Training – Foundations
Subsoil in the 3D model
The subsoil in the 3D window is defined as a soil surface and a soil borehole. The geologic profile is defined for each soil
borehole. The position and the composition of the geologic profiles provide information about the subsoil.
The level of the foundation base is considered on the bottom surface of the plate. The eccentricities are also taken into
account.
Surface support
The interaction between the structure and subsoil is calculated if the structure is put on a support of "Soilin" type.
• Name Specifies the name of the support
• Type Defines the type of support
o Individual
A particular subsoil type is assigned to the slab.
The subsoil is defined by means of C parameters. These user-defined C parameters are used for the
calculation (e.g. contact stress of the foundation surface)
o Soilin
For such a support, the interaction of the structure with the foundation subsoil is carried out by means
of the Soilin module.
All initial values of C parameters are defined in the Solver setup.
Parameters C1z, C2x, C2y are calculated by Soilin module, C1x and C1y are taken from the solver setup.
o Both
Both of the above mentioned types are combined on the same slab.
The user defines which C parameters will be user-defined and which ones will be calculated by the Soilin
module. The parameters C1z, C2x and/or C2y that are set in the subsoil-property dialogue as zero will be
calculated by the Soilin module. Non-zero parameters will be taken as they are inputted in the Subsoil.
Parameters C1x and C1y are always defined by the user.
36 BV – 2024/12/31

Soilin
Layers approximation
When more borehole profiles are used in the project then it must fulfil one important condition – the same number of
layers. This is required because of the soilin approximation.
If there is some layer missing in one borehole, then it can be substituted by a layer with minimum thickness – e.g. 1 mm
so the soilin has appropriate number of layers for approximation
Settings
There are some parameters that are required in a project in order to do a Soilin calculation:
• Project with at least one borehole with predefined geologic profile
• Structure with surface support type Soilin or Both
• Load
• Combination type Linear (ULS or SLS)
There are also several settings for Soilin in the Solver setup:
Soil combination: linear combination which is used for the soilin calculation. Even though it is not an exact solution, for
practical reasons the C parameters are not calculated separately for each load case or each load case combination. The
user must specify one particular reference combination that is used to calculate the C parameters. The calculated C
parameters are then applied in all remaining defined load cases and combinations.
Max soil interaction step: number of iteration cycles (when the program stops iterations if there are still no proper C
parameters calculated, in case those results diverge), the max. limit is 99 steps.
C1x, C1y: parameters defined by the user.
C1z, C2x, C2y: initial values for soilin (if the support type is Soilin).
BV – 2024/12/31 37

Topic Training – Foundations
Soilin iterative cycle
The values from the top structure and the foundation are calculated by FEM. The values are used as the source data for
the soilin.
The iterative process is finished when the contact stress σ and displacement u does not change significantly in the two
z z
subsequent iterations. The special quadratic norms are evaluated in the each iteration cycle to find out if this condition
is fulfilled.
Diagram of the iterative cycle:
1) The values are taken from the solver setup, predefined by the user.
2) Data from the structure and its foundation.
3) FEM calculation – important results for soilin contact stress σ and displacement u.
z z
4) The results of i iteration.
5) Comparison of the contact stress σ and u – it is based on the quadratic norms, when it does not change
z z
significantly, then the calculation is done and SCIA Engineer displays results.
6) 1st step of soilin – the contact stress is recalculated to the new loading.
7) 2nd step of soilin – the C parameters are recalculated, new loading is taken from the previous step.
8) 3rd step of soilin – final C parameters from soilin - the new input data.
9) New C parameters are used for the next FEM calculation.
There is a message when the last iteration is done.
38 BV – 2024/12/31

Soilin
Results of soilin
Via Main menu > Results > 2D members results for the subsoil can be checked
Subsoil stiffness parameters
The C parameters are calculated for the mesh on the 2D member. It is displayed by the colour planes.
The results can be displayed for each C parameter.
BV – 2024/12/31 39

Topic Training – Foundations
Subsoil model results
Soil stress diagram
The settlement is calculated for each mesh element (in its centre of gravity) and for each borehole inserting point. The
checkbox Results only exclude a borehole inserting point from the input data. It means that the point is used for the
calculation of settlement but the geologic profile is not taken into account for the layers approximation.
The points for the settlement calculation are shown when selecting Soil Stress Diagram
Green vertexes displayed on the plate are centres of elements from the 2D mesh, outside the plate are inserting points
from boreholes.
The vertical axial components of stress and the structure strength (consequently the depth of the deformed subsoil
zone) can be displayed for all points from the 2D mesh and for the inserting points of the boreholes. You just select the
point and the diagram is displayed.
• Previous displays the Soil Structure Strength for the previous node
• Next displays the Soil Structure Strength for the next node
• Borehole displays the Soil Structure Strength for the selected borehole inserting point
• Soil point node number
• m*Sigma,or original soil stress
• Sigma,z overstress
40 BV – 2024/12/31


## Sayfa 41

Soilin
The Soilin module calculates two stresses: the overstress Sigma,z and the original soil stress Sigma,or. According to
theory, settlement will occur if Sigma,z > m * Sigma,or.
The m-value is code dependent: (i) for the CSN code it can vary, for EC & DIN it is fixed at 0,2. It practically means that
settlement occurs in case the overstress is bigger than 20% of the original soil stress.
The picture shows these two lines: Sigma,z in blue and m * Sigma,or in red. The program is looking for the intersection
of the two lines: all layers above have Sigma,z > m * Sigma,or and settlement occurs in them and all the layers below
have Sigma,z < m * Sigma,or, which means that no settlement is there. The depth at which the lines intersect is called
the "limit depth"
In case you have not input a sufficient geological profile i.e. not deep enough, the intersection point cannot be
determined. It means that the calculated settlement will be too small since there are still deeper layers which will also
be compressed and will thus settle. Therefore, the program gives a warning that the geology is "Insufficient".
Settlement table
The table is displayed via Report Preview. This preview table contains values w for each node.
The settlement w is different from displacement u of the foundation plate because w is calculated without stiffness of
z
the structure and from the penultimate iteration. Therefore it is useful to watch values w only outside the foundation
(see chapter additional plates to check the settlement around the surface support).
BV – 2024/12/31 41

Topic Training – Foundations
Results for each iteration cycle
When the soilin does not finish its iteration process in a standard way, the calculation ends after the predefined number
of cycles (the solver setup). You can display the contact stresses on the plate for each cycle separately so you are able
to find the problem.
The calculated contact stresses for each iteration cycle can be found in the 2D contact stresses result.
First iteration cycle:
Second iteration cycle:
42 BV – 2024/12/31

Soilin
Third iteration cycle:
BV – 2024/12/31 43

Topic Training – Foundations
Additional plates
Soilin is a tool which calculates C parameters of the subsoil under the surface support. Using additional plates around
the support provides more realistic results.
About C parameters:
1. C parameters are parameters of interaction, so their value depends on the structure, load, stiffness and
subsoil. Change in any of those parts causes different C parameters.
2. The whole plate is supported vertically by the soil stiffness – parameter C (Winkler) and also in the shear
1
direction – parameter C (Pasternak).
2
3. The plate edges are more supported by the C parameters because it is affected by neglecting.
2
4. The area around the support is affected by the shear stiffness of the soil and the degrease basin is created.
5. The degrease basin can be substituted by spring supports around the plate – this is done automatically in SCIA
Engineer when user does not add plates around.
6. When user uses the plates around the support, the springs are not added and the C parameters are calculated
for the whole area.
Settings for soilin calculation
1. The functionality Soil iteration must be checked.
44 BV – 2024/12/31

Soilin
2. One combination must be linear - this combination is used for soilin calculation.
3. This linear combination must be selected in Solver setup to run soilin with it.
4. The project must contain a borehole with geologic profile.
5. The project must contain a surface support type soilin.
BV – 2024/12/31 45

Topic Training – Foundations
How to calculate the plate without soilin
1. Open the project “soilin_start.esa”.
2. There is one plate with the surface support type Individual. This type of the support has constant parameters
C1 and C2.
3. Run the linear calculation with the default settings.
4. Display the results for internal forces. There are no results for C parameters.
5. Internal forces - for example v_y:
46 BV – 2024/12/31

Soilin
How to calculate the plate with soilin
1. Change the support type to Soil-in.
2. Run the linear calculation again.
3. Go to the service Results. Display the results for internal forces and soilin for combination C01.
4. Internal forces - vy:
5. Subsoil stiffness parameters - parameter C1z:
6. Subsoil model results (see the Report preview with the table for the settlement):
7. Subsoil model results - use the action button "Soil Stress Diagram" and select one green vertex (e.g. SP198)
BV – 2024/12/31 47

Topic Training – Foundations
8. A new dialogue appears - there is a stress diagram for the selected mesh element:
The edges of the plate are supported by springs automatically.
How to create the additional plates
1. Use the same project.
2. Create a new plate.
3. Set the thickness of the plate to 1mm.
4. Create 4 plates around the surface support according to the picture. The width from the original plate is 3 m.
5. Add the surface support type Soil-in on those plates.
6. Run the linear calculation with the same settings again.
7. Go to the service Results. Display the results for soilin.
8. Subsoil stiffness parameters - parameter C1z:
48 BV – 2024/12/31

Soilin
9. Subsoil model results (see the Report preview with the table for settlement):
10. Subsoil model results - use the action button "Soil Stress Diagram" and select one green vertex (e.g. SP198).
11. Stress diagram for selected mesh element:
12. The interesting results are deformations.
13. See the result "Nodal displacement" or “3D deformations”, value u_z on Deformed structure:
The deformed structure shows the degrease basin.
BV – 2024/12/31 49

Topic Training – Foundations
Advanced tips
The effect of the subsoil outside the structure
The nearest subsoil around the loaded structure is also affected by its settlement. The better realistic picture how it
works in the reality is displayed below.
Calculation of the nearest surrounding of the structure is a specific use case. It is recommended to add one more plate
to the structure for this purpose – additional subsoil element. The new plate should be inserted with the minimum
thickness (e.g. 0,01 mm) and placed next to the foundation. In some cases of larger structures with more complex
geometry, the required thickness of this plate might be 10 mm, or even 50 mm in order to achieve convergence of the
solver.
The C parameters for this affected subsoil around the structure are calculated this way also.
The deformed subsoil calculated by the SCIA Engineer:
Calculated stiffness parameters:
The structure is marked by the black rectangle and around this is one more plate - surrounding plate – with thickness
0,001 mm.
Automatic calculation of the edge supports
When you don’t use any subsoil elements then the program will eliminate the neglect of the subsoil on edges by an
automatic inserting of vertical supports on the foundation edges.
The calculation of those supports is based on already known C parameters. The program tries to support the plate in
the same way as it should be supported by the subsoil itself. This leads to approximate model where the sum of
reaction is contact stress with reactions in those nodes.
This solution can be sometimes undesirable – e.g. if there is a second foundation near by the calculated one or there is
some other support under or near the foundation edge.
This automatic input can be avoided manually. User can insert a spring with a small stiffness on the plate edges and
then the system won’t use automatic input of vertical supports. This could be the additional subsoil elements.
50 BV – 2024/12/31


## Sayfa 51

Soilin
Pad foundation and soilin
Pad foundation is not connected with the soilin calculation.
How to use soilin for the pad foundation check:
1. Create an additional structure to calculate the C parameters in the nearest surrounding:
Calculated C parameters on the surrounding plate  C parameters for the pad foundation
2. Calculated C parameters can be used in the Subsoil library. Put the values from the table to the Subsoil
library.
3. Run the linear calculation again.
4. Check the pad foundation in a standard way.
BV – 2024/12/31 51

Topic Training – Foundations
What if the model is correct but the iteration is not finished
Sometimes the model is correct but some circumstances may cause unfinished iterative process. The results in cycles
don’t lead to one set of C parameters but on the contrary, the results are more and more different.
This can be caused by some tensions in the foundation plate, specific foundation members and similar problems.
How to solve those problems:
1. It is necessary to check the model. It must be correct – the mesh elements are not triangular, the element´s
Z axis is upward, the foundation plate must be under the soil surface and so on.
2. Check the iteration cycles in the result of 2D contact stresses, Type of loads – Combinations.
First few iteration cycles will be probably quite OK and after some time the results become messy.
Find one cycle (between those correct ones) where the results seem to be close to the reality – e.g. 3rd
cycle. Use this value in the solver setup for number of iteration cycles.
3. Start the linear calculation again, it will be finished after the 3rd iteration cycle with results most closest to
the reality. The correct cycle is between 2nd and 5th cycle in most cases.
52 BV – 2024/12/31

Soilin
What if the load is wrongly inserted?
When the plate is not in compression, then soilin cannot be calculated properly.
There could be an error message about wrong total resultant: “Total resultant of all overloads is too small”
This may happen when loads are from the bottom to the top as shown in the example above, or when there is some
change in local LCS of the plate.
What if the symmetrical structure gives non-symmetrical results?
This may happen when additional subsoil elements are not added around the structure.
Also when the soilin didn’t find the correct result and calculation is stopped too soon (for example when solver setup
defines only few soilin cycles). When the amount of iterations set in the solver setup is insufficient, the following
message will be shown: “do you want to ignore an insufficient number of iterations in SOILIN and thus permit the
display of the results?”. When clicking ‘yes’ you accept this, the results are saved.
BV – 2024/12/31 53

Topic Training – Foundations
Annex 1: Pad Foundation Stiffness
This annex specifies the calculation of the stiffness coefficients of a pad foundation.
In the stiffness calculation has been assumed that C2x = C2y.
Stiffness Formula
Stiffness X
A∙B∙C1x
Stiffness Y
A∙B∙C1y
Stiffness Z
A∙B∙C1z 2∙(cid:16)A B(cid:17)∙√C1z∙C2x 2C2x
Stiffness Rx
D D
n A∙C1z 2∙√C1z∙C2x A∙B ∙√C1z∙C2x B ∙C2x
B ∙ A∙B∙C2x
12 2 2
Stiffness Ry
D D
n B∙C1z 2∙√C1z∙C2x B∙A ∙√C1z∙C2x A ∙C2x
A ∙ B∙A∙C2x
12 2 2
Stiffness Rz
n n D
h1∙A ∙C1z h1∙B ∙C1z 2∙√C1z∙C2x∙A ∙h1
C1y∙Ix C1x∙Iy
6 6 4
D D D
2∙√C1z∙C2x∙B ∙h1 C2x∙A C2x∙B
4 2 2
Ix
n
A∙B
Iy 12
n
B∙A
12
54 BV – 2024/12/31

|  | Stiffness |  |  | Formula |  |
| --- | --- | --- | --- | --- | --- |
| Stiffness X
A∙B∙C1x |  |  |  |  |  |
| Stiffness Y
A∙B∙C1y |  |  |  |  |  |
| Stiffness Z
A∙B∙C1z 2∙(cid:16)A B(cid:17)∙√C1z∙C2x 2C2x |  |  |  |  |  |
| Stiffness Rx
D D
n A∙C1z 2∙√C1z∙C2x A∙B ∙√C1z∙C2x B ∙C2x
B ∙ A∙B∙C2x
12 2 2 |  |  |  |  |  |
| Stiffness Ry
D D
n B∙C1z 2∙√C1z∙C2x B∙A ∙√C1z∙C2x A ∙C2x
A ∙ B∙A∙C2x
12 2 2 |  |  |  |  |  |
| Stiffness Rz
n n D
h1∙A ∙C1z h1∙B ∙C1z 2∙√C1z∙C2x∙A ∙h1
C1y∙Ix C1x∙Iy
6 6 4
D D D
2∙√C1z∙C2x∙B ∙h1 C2x∙A C2x∙B
4 2 2 |  |  |  |  |  |


|  | Parameters |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| A Dimension read from Pad Foundation library |  |  |  |  |  |
| B Dimension read from Pad Foundation library |  |  |  |  |  |
| C1x Soil stiffness read from Subsoil library |  |  |  |  |  |
| C1y Soil stiffness read from Subsoil library |  |  |  |  |  |
| C1z Soil stiffness read from Subsoil library |  |  |  |  |  |
| C2x Soil stiffness read from Subsoil library |  |  |  |  |  |
| Ix
n
A∙B |  |  |  |  |  |
| Iy 12
n
B∙A |  |  |  |  |  |


Annex 2: Recommended geotechnical data
Annex 2: Recommended geotechnical data
All geological layers of a subsoil are represented by their 3D geotechnical properties defined according National
Standards. The exactness of these input data depends firstly on the geotechnical category of foundation problem,
defined in EC7. Shortly: the 1st and 2nd category pertains to common buildings founded on common subsoil, previous as
well as definitive design, without extraordinary complications. The 3rd category includes very important buildings in
complicate foundation conditions whose geotechnical properties must be investigated in situ in any case separately
with sufficient number of deep test pits or other secure methods. Nonlinear and time dependent behaviour must be
taken into account which means an iterative Soilin procedure respecting the increase and decrease of overload.
Such an exacting analysis presents only a few percent of the common design practice. Therefore, a recommendation of
certain mean European values for the first calculations using Soilin can be useful.
Robertson
Where a building will be established, we need to know the soil profile. A deep knowledge of the ground under the base
of the foundation is important as the layers below the base determine the bearing capacity. In order to gain an insight
into the ground profile, many properties such as the thickness and composition must be known. We can derive these
data from a geotechnical atlas or experiences, but we will mainly derive it from in situ soil research or laboratory tests.
In order to be able to identify a ground, the existence of a ground classification is necessary. For the interpretation of
the CPT data, there exist several methods of identification. For example the method according to Robertson is a well
known method for electric CPT’s and it appears to give the most reliable results in Belgium.
In the following diagram, the cone resistance and friction ratio are used to determine a soil type, wherein the friction
ratio is the ratio between the frictional resistance and the cone resistance.
f
R = s
f q
c
An identification of the ground means that we now know the soil characteristics at any depth. In tables, you can read
these characteristics (angle of friction, cohesion, E-modulus ...) by soil type. Finding of this E-modulus is necessary for
the determination of the constant C. We attempt rather to distract the E-modulus from CPT results via soil
identification since an additional ground investigation involves an additional cost.
BV – 2024/12/31 55

Topic Training – Foundations
In SCIA Engineer it is necessary to insert the parameter Edef. As said before, it is best to enter a value which is defined
directly by a geologist from a real geologic profile. If this is not available, you must use standard values (each country
has its own standards for classification of soils). For every soil, there is a range for value Edef (the smaller values are on
the safe side).
56 BV – 2024/12/31

Annex 2: Recommended geotechnical data
BV – 2024/12/31 57

Topic Training – Foundations
58 BV – 2024/12/31

Annex 2: Recommended geotechnical data
BV – 2024/12/31 59

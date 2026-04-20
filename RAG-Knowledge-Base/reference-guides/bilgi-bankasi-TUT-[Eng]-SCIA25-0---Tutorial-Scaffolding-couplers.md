# TUT [Eng] SCIA25.0 - Tutorial Scaffolding couplers

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA25.0 - Tutorial Scaffolding couplers-auuhzm6lade.pdf`

---

**Toplam Sayfa:** 23


## Sayfa 1

TUTORIAL
SCAFFOLDING COUPLERS

Tutorial – Scaffolding couplers
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the
publisher. SCIA is not responsible for any direct or indirect damage because of imperfections in the
documentation and/or the software.
© Copyright 2025 SCIA nv. All rights reserved.
2 DD – 2025/03/03

Table of contents
Table of Contents
Table of Contents .................................................................................................................................... 3
Introduction .................................................................................................................................................. 4
Couplers in SCIA Engineer ............................................................................................................................. 5
Couplers – general principle................................................................................................................................ 5
Couplers of manufacturers in SCIA Engineer ....................................................................................................... 9
Add couplers to SCIA Engineer .......................................................................................................................... 11
Couplers checks .......................................................................................................................................... 13
General couplers ............................................................................................................................................... 14
Manufacturer couplers ..................................................................................................................................... 15
Example ............................................................................................................................................................. 20
3

Tutorial – Scaffolding couplers
Introduction
SCIA Engineer enables you to design and check scaffold structures. The software provides are library with couplers
according to the scaffold code and couplers of manufacturers. In that way you can quickly select the desired coupler type
and use them into your projects. In case you need to work with couplers which are not present in the SCIA library, you
can quickly create them by yourself, store them in a user library and add them to your projects.
After calculating the project you can perform checks on the couplers and have a look at brief or detailed output.
This tutorial will explain:
• Couplers – general principle;
• Couplers of manufacturers in SCIA Engineer;
• Add couplers to the library;
• Coupler checks.
4 DD – 2025/03/03

Tutorial – Scaffolding couplers
Couplers in SCIA Engineer
SCIA Engineer contains couplers with rigidities and maximal forces from the code and manufacturer couplers with
rigidities and maximal forces based on validation documents (e.g. Zulassung). You can quickly select and use the desired
coupler type with automatically the correct maximal forces and nonlinear functions attached to it.
This chapter also illustrates the background of the maximal forces and the nonlinear functions.
When you need a coupler type which is not present in the SCIA library, you can quickly create it by yourself and add it to
the library.
Couplers – general principle
Various couplers types are available in SCIA Engineer. For the different couplers, go to Menu bar > Libraries > Structure
and analysis > Hinge type.
In this ‘Hinge type’ library you can choose following non-manufacturer types (from EN 12811) for the parameter ‘Hinge
type’:
Right angle Friction sleeve Swivel Base jack Parallel General
Note: if the functionality ‘Scaffolding’ is not ticked on in Project settings > tab Functionality you will not be able to see
the hinge type library.
5

|  | Right angle |  |  | Friction sleeve |  |  | Swivel |  |  | Base jack |  |  | Parallel |  |  | General |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |


Tutorial – Scaffolding couplers
For these couplers, not only the rigidities are entered in a flexible or nonlinear way, but also the maximal allowable
forces are defined, as displayed below for the ‘Right angle’ coupler:
The rigidities and maximal forces are taken from the code EN 12811-1 Annex C Characteristic values of the resistances
for couplers.
6 DD – 2025/03/03

Tutorial – Scaffolding couplers
7

Tutorial – Scaffolding couplers
8 DD – 2025/03/03

Tutorial – Scaffolding couplers
Couplers of manufacturers in SCIA Engineer
Not only the types that are mentioned in the code are available in SCIA Engineer. You can also find couplers from
manufacturers in the library: Cuplock, Layher and Catari (the Catari coupler is available since SCIA Engineer 20):
Cuplok Catari US
Layher Layher Layher
Variante K2000+ Variante II Variante LW
Note: ‘Layher Variante LW’ was called ‘Layher Variante HS’ before SCIA Engineer 20.
9

|  | Cuplok |  |  | Catari US |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |


|  | Layher |  |  | Layher |  |  | Layher |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Variante K2000+ |  |  | Variante II |  |  | Variante LW |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |


Tutorial – Scaffolding couplers
As you can see each of these couplers has its specific nonlinear functions and maximal forces, which are stored in the
SCIA database and which are automatically assigned when you choose the desired coupler type.
You have to select the appropriate material (steel or aluminium), because this will have an influence on the safety
factor of the coupler: when choosing for the material steel, the safety factor will be taken out of the National Annex of
EN 1993-1-1, while for aluminium the National Annex of EN 1999-1-1 is used.
As example we can have a look at a certain coupler, for example the type Variante K2000+ of Layher. The values for N ,
xk
V , V , M , M and M are automatically filled in (taken from Zulassung Z-8.22-64). The equation for the rotation is
yk zk xk yk zk
given by [rad] = M/(9140 – 73.6M) and is presented by following curve:
d
According to this curve, a nonlinear function My is linked automatically to the coupler:
You can find a similar function for Mx:
These nonlinear functions can be found under Menu bar > Libraries > Structure and analysis > Nonlinear
functions.
10 DD – 2025/03/03


## Sayfa 11

Tutorial – Scaffolding couplers
Add couplers to SCIA Engineer
If you want to add other types of (manufacturer) couplers to the library, you can create the nonlinear functions by
yourself.
In order to do this easily, you can use the Excel file ‘gvSEN NonLinear Function Input - rev01’ from the SCIA garage
(https://resources.scia.net/en/garage/sciagarage.htm).
With the Excel sheet you can easily create the nonlinear function, export it to a XML file and import this XML file into
SCIA Engineer.
You also must fill in the maximal allowable forces in the hinge type window.
Let us demonstrate this by adding the Layher Variante K2000+ type manually to the software.
First, we open the Excel file and add the values for the nonlinear functions on the ‘Input’ tab. Information about the
parameters and units is found on the ‘Instructions’ tab. We can immediately create the function for Mx and the
function for My:
Then we create the XML file by clicking on the button ‘Export Non-Linear Functions’. Make sure to enable the macros
(click on the button ‘Enable Content’ if this bar would pop up). Choose a name for the XML file and save it on a certain
location (e.g. on your desktop). Now a .xml and a .xml.def file are created.
In SCIA Engineer you can import the functions via Menu bar > File > Update from > XML file.
The functions are now imported and visible in under Menu bar > Libraries > Structure and analysis > Nonlinear
functions.
Finally, the hinge type can be created via Menu bar > Libraries > Structure and analysis > Hinge type (do not forget to
activate the functionality ‘Scaffolding’ in Menu bar > Project settings > tab Functionalities).
Click on ‘New’, choose the settings for ux, uy, uz, fix, fiy and fiz, choose the nonlinear functions in case you choose for
Nonlinear and fill in the values for Nxk, Vyk, Vzk, Mxk, Myk and Mzk:
11

Tutorial – Scaffolding couplers
As ‘Hinge type’ you should choose a type that corresponds the most with the coupler that you want to create. To
decide this type, you can use information about the checks in the overview tables of the chapter ‘Couplers checks’. If
you choose for example the type ‘General’, no interaction check will be executed.
After creating the hinge type you could use the disk icon in the ‘Hinge type library’ window to save the hinge type into a
database file. Afterwards you could load this database file into other projects, so you have to create the hinge type only
once.
You add the hinges to the desired beams via Input panel > workstation Structure > category Boundary conditions >
Hinge on 1D and as ‘Hinge type’ you select ‘Library’ so you can select the desired hinge type from the hinge type library.
12 DD – 2025/03/03

Diversen
Couplers checks
The coupler check can be performed by SCIA Engineer with the command Menu bar > Design > Steel members >
Scaffolding coupler check (or Menu bar > Design > Aluminium > Scaffolding coupler check for aluminium couplers) or
via the same command in the Proces toolbar.
This check performs a unity check for the couplers for which a maximal allowable force is given in the coupler library:
13

Tutorial – Scaffolding couplers
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
• aluminium couplers
• N , V , V , M : coupler resistances given by EN 12811-1 Table C1
x,k y,k z,k y,k
Loads on a coupler are defined by following figures (left below is a right angle coupler and right below is a friction type
sleeve coupler), see also chapter ‘Couplers - general principle’:
14 DD – 2025/03/03

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


Diversen
Manufacturer couplers
In addition to the list of general couplers, following table provides an overview of the performed component checks for
each type of manufacturer coupler:
F F F M M M Interaction 1 Interaction 2 Interaction 3
x y z x y z
Cuplok - -
Layher Variante II -
Catari US - - - - -
Note: The Catari US coupler type and the interaction 3 check are available since SCIA 20.
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
• aluminium couplers
• N , M , M : coupler resistances given by Z-8.22-208:2022 Table 4
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
• aluminium couplers
• α: angle between connecting vertical diagonal and standard
• N , M , M : coupler resistances given by Z-8.22-208:2022 Table 4
x,k y,k x,k
15

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


Tutorial – Scaffolding couplers
Interaction 3:
a √m2 +n2
I +0.7∙I = +0.7∙I = act act+0.7∙I ≤1
S A b A √m²+n² A
With:
• I : M utilization of connected coupler
A y
• I: in-plane utilization of column (the definition of lengths a and b are given by article 3.3.2.2
S
• build 1)
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
• aluminium couplers
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
The bending moment utilization of column m, may be calculated by solving a derived cubic function, using coefficients
C and C depending on the shear force utilization of column section v :
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
2 act 2
3 mact
for 1 ≤v ≤0.9: C = nact ∙√1−v2
3 act 2 mact act
16 DD – 2025/03/03

Diversen
Special cases are:
• m ≤ 0.0001 → I = n
act S act
• n = 0 → I = m
act S act
• m ≤ 0.0001 and if n =0 → I = 0
act act S
For the case when 0.9 < v an error will be displayed and UC_Interaction 3 will be set to 999.
act
To recognize a member as a column, the type of the member has to be either ‘column’, ‘gable column’ or
‘secondary column’ and the cross-section has to be Formcode 3 (CHS). In case two columns are found, both need
to be within one buckling system. If the above is not fulfilled or if there are more column members found, the
column geometry is not recognized and the unity check is set to 999.
Layher
The Layher coupler which connects a ledger and a standard is described in Zulassung Nr. Z-8.22-64:2022 for
Variante II and Variante K2000+ and in Zulassung Nr. Z-8.22-939:2022 for Variante LW.
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
• aluminium couplers
• α: angle between connecting vertical diagonal and standard
• N , M , M , M , V , V : coupler resistances given by Z-8.22-64:2022 Table 5 for Variante II and Variante
x,k y,k z,k x,k y,k z,k
K2000+ en Z-8.22-939:2022 Table 5 for Variante LW
• V : 1.4 kN for Variante II, 2.1 kN for Variante K2000+ and 2.5 kN for Variante LW
z,Ed,min
17

Tutorial – Scaffolding couplers
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
• aluminium couplers
• α: angle between connecting vertical diagonal and standard
• N , V : coupler resistances given by Z-8.22-64:2022 Table 5 for Variante II and Variante K2000+ en Z-8.22-
x,k z,k
939:2022 Table 5 for Variante LW
• e: 2.75 cm for Variante II, 3.30 cm for Variante K2000+ and 3.30 kN for Variante LW
• e : 5.7 cm
D
• ξ: 1.26 cm for Variante II, 1.85 cm for Variante K2000+ and 1.85 kN for Variante LW
18 DD – 2025/03/03

Diversen
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
19

Tutorial – Scaffolding couplers
Example
As example we consider a steel scaffolding, based on the Layher system:
After modelling the structure (elements, couplers, supports, nonlinearities, …), adding the loads and calculating
nonlinearly we can perform the checks on the beams and the checks on the couplers.
For the checks on the couplers choose for Menu bar > Design > Steel members > Scaffolding coupler check and
ask the results for the nonlinear class or combinations:
20 DD – 2025/03/03


## Sayfa 21

Diversen
The maximum unity check of 0.62 is found in coupler H1300 (on beam S5919):
The preview window shows you the output. The figure below gives you the brief output:
21

Tutorial – Scaffolding couplers
A detailed output including formulas is available since SCIA Engineer 20:
22 DD – 2025/03/03

Diversen
You can also check the table results (these can be copy-pasted to Excel) and of course there is the opportunity to
add the results to the Engineering report.
23

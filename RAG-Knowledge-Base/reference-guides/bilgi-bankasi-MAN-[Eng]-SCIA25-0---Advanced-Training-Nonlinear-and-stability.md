# MAN [Eng] SCIA25.0 - Advanced Training Nonlinear and stability

**Kategori:** SCIA Engineer Manual
**Kaynak:** `MAN [Eng] SCIA25.0 - Advanced Training Nonlinear and stability-schvhyyxwq0.pdf`

---

**Toplam Sayfa:** 113


## Sayfa 1

ADVANCED PACKAGE TRAINING
Nonlinear & Stability

Advanced concept training – Nonlinear & Stability
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the
publisher. SCIA is not responsible for any direct or indirect damage because of imperfections in the
documentation and/or the software.
© Copyright 2025 SCIA nv. All rights reserved.
2 DD – 2025/03/11

Table of contents
Table of Contents
Table of Contents..................................................................................................................................... 3
Introduction ............................................................................................................................................... 5
Professional training ........................................................................................................................................... 5
Introduction to nonlinear and stability................................................................................................................ 5
1. Stability Calculations ................................................................................................................... 6
1.1. Stability Combinations ............................................................................................................................. 6
1.2. Linear Stability ......................................................................................................................................... 7
2.3 Manual calculation of K ............................................................................................................................... 7
G
1.3. Performing the calculation & examples ................................................................................................... 9
2. Nonlinear behavior of Structures ........................................................................................... 18
2.1. Type of Nonlinearity .............................................................................................................................. 18
2.2. Nonlinear Combinations ........................................................................................................................ 18
2.3. Calculation methods & settings ............................................................................................................. 21
2.3.1. Solver settings ................................................................................................................................... 21
2.3.2. Picard ................................................................................................................................................. 22
2.3.3. Newton-Raphson............................................................................................................................... 23
2.3.4. Modified Newton-Raphson .............................................................................................................. 23
3. Geometrical Nonlinearity – also possible with Concept edition .................................... 24
3.1. Overview ................................................................................................................................................ 25
3.2. Alpha critical .......................................................................................................................................... 27
3.3. Imperfections ......................................................................................................................................... 28
3.3.1. Global frame imperfection  ............................................................................................................ 29
3.3.2. Initial bow imperfection e ............................................................................................................... 34
0
3.3.3. Example Global + Bow imperfection ................................................................................................ 41
3.4. Calculation methods for geometrical nonlinearity ................................................................................. 44
3.4.1. 2nd order: Timoshenko ...................................................................................................................... 44
3.4.2. 3rd order ............................................................................................................................................ 48
4. Local Nonlinearity ...................................................................................................................... 53
5.1. Beam Local Nonlinearity – also available in the concept edition................................................................ 53
4.1.1. Members defined as Pressure only / Tension only ......................................................................... 54
4.1.2. Members with Limit Force ................................................................................................................ 57
4.1.3. Members with gaps .......................................................................................................................... 59
4.2. Beam Local Nonlinearity including Initial Stress ..................................................................................... 60
4.2.1. Members with Initial Stress .............................................................................................................. 61
4.2.2. Cable Elements – Not available in the Professional edition ........................................................... 63
4.3. Nonlinear Member Connections ............................................................................................................ 70
4.4. Support Nonlinearity .............................................................................................................................. 74
4.4.1. Tension only / Pressure only Supports ............................................................................................. 74
4.4.2. Nonlinear Springs for Supports ........................................................................................................ 76
4.4.3. Friction Supports ............................................................................................................................... 80
4.5. 2D Elements ........................................................................................................................................... 84
4.5.1. 2D Membrane Elements – Not in Professional Edition ................................................................... 84
4.5.1. Pressure only ..................................................................................................................................... 87
5. Physical Nonlinearity ................................................................................................................. 90
5.1. Plastic Hinges for Steel Structures ......................................................................................................... 90
5.2. Physical Nonlinear analysis for Concrete Structures .............................................................................. 93
5.3. General Plastic analysis .......................................................................................................................... 93
5.3.1. Yield criteria ....................................................................................................................................... 94
3

Advanced concept training – Nonlinear & Stability
5.3.2. Finite element model ........................................................................................................................ 96
5.3.3. Material properties ........................................................................................................................... 96
5.3.4. General plasticity in SCIA Engineer .................................................................................................. 97
5.3.5. Checking strains ................................................................................................................................ 99
6. Nonlinear Stability .................................................................................................................... 103
7. Troubleshooting........................................................................................................................ 109
7.1. Singularity ........................................................................................................................................ 109
7.2. Convergence .................................................................................................................................... 110
7.3. Solver robustness ratio................................................................................................................. 111
8. References ................................................................................................................................. 112
4 DD – 2025/03/11

Advanced concept training – Nonlinear & Stability
Introduction
Professional training
This course will explain the nonlinear and stability calculations in SCIA Engineer. Most of the modules necessary for this
calculation are included in the Professional edition.
For some options a concept edition is sufficient or for other options an expert edition or an extra module is required.
This will always be indicated in the corresponding paragraph.
Introduction to nonlinear and stability
In the first part of this course, stability calculations will be introduced. Such a calculation determines the elastic critical
buckling load of a structure. This analysis can be used to calculate the buckling length of a part of the structure or to
determine whether a 2nd order analysis should be carried out.
In the second part, the course will explain how to introduce different nonlinear behaviours in a structure. First the 2nd
and 3rd order calculation methods are explained and integrated with Eurocode 3. Next the local nonlinearities are
examined including tension-only members, pressure-only supports, cable analysis, friction supports, etc. and finally
concluded with physical nonlinearities.
Then, a small chapter will explain the integration of these nonlinear behaviours into the stability calculation.
The final chapter provides some common failure messages which occur during a nonlinear analysis. This chapter points
out the most likely causes of singularities and convergence failures.
5

Advanced concept training – Nonlinear & Stability
1. Stability Calculations
A stability calculation calculates the global buckling mode (eigenmode) of a structure under the given loading. In
addition, the ratio between the buckling load and the applied load is given.
Stability calculations are used to obtain an insight into the buckling mechanisms of a structure, to calculate the buckling
length of a member for use in the Steel Code Check, to verify if 2nd Order calculations are required, …
1.1. Stability Combinations
For a stability calculation, the principle of superposition does not hold. Every combination of loads will require a
separate calculation. The combinations have to be assembled before starting the calculation. In SCIA Engineer, this is
done by defining stability combinations.
A stability combination is defined as a list of load cases where each load case has a specified coefficient.
It is also possible to import the linear combinations as stability combinations. Choose the option New from linear
combinations, select the desired combinations and click on close. The selected combinations will be added as stability
combinations.
6 DD – 2025/03/11

1.2. Linear Stability
During a linear stability calculation, the following assumptions are used:
• Physical linearity.
• The elements are taken as ideally straight and have no imperfections.
• The loads are guided to the mesh nodes, it is mandatory to refine the finite element mesh in order to obtain
precise results.
• The loading is static.
• The critical load coefficient is, per mode, the same for the entire structure.
• Between the mesh nodes, the axial forces and moments are taken as constant.
The equilibrium equation can be written as follows:
[K −K ]∙u=F
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
[K −λ∙K ]∙u=0
E G
In other words, such a value for  should be found for which the determinant of the total stiffness matrix is equal to
zero:
K −λ∙K =0
E G
Similar to the natural vibration analysis, the subspace iteration method is used to solve this eigenmode problem. As for
a dynamic analysis, the result is a series of critical load coefficients  with corresponding eigenmodes.
2.3 Manual calculation of K
G
The principle of a stability calculation and the meaning of the matrix K will be explained with a simple example.
G
Suppose the next situation:
This beam with length L has a pinned support at the left and a flexible spring support at the right with rigidity: K.
E
Two point loads are inputted on the beam: a vertical R and a compression force N.
7

Advanced concept training – Nonlinear & Stability
Standard analysis says that R and N are independent (in the non-deformed configuration) and the stiffness relationship
is:
KE∙r = R
With r the vertical translation of the right point of the beam.
But, if the structure is allowed to deform, we can calculate equilibrium in the deformed configuration as shown below:
Summing moments about the pinned end we get:
R∙L+N∙r = S∙L
The equation for the response of the spring is:
KE∙r = S
Substituting S we get:
R∙L+N∙r = (KE∙r)∙L
Dividing by L:
N
R+ ∙r = KE∙r
L
And grouping terms we have:
N
R = (KE− )∙r
L
This can further be re-written if we define the geometric stiffness as:
N
KG =
L
giving the final form as:
R = (KE−KG)∙r
Or:
[KE−KG]∙u = F
When the normal force N is multiplied with a factor  so that the total rigidity becomes zero:
cr
αcr∙N
KE− = 0
L
The structure will buckle and become “unstable”.
8 DD – 2025/03/11

1.3. Performing the calculation & examples
To perform a Stability calculation, the stability functionality must be activated.
The  values can be found under the caption
The number of critical coefficients to be calculated per stability combination can be specified in the solver settings, as
well as the solver method to be used in the calculation. Lanczos is chosen by default, because it gives fast and good
results, but in some cases it will fail to find the solution. In these cases you can try the other, slightly slower, methods to
obtain a result.
9

Advanced concept training – Nonlinear & Stability
Notes:
• The first eigenmode is usually the most important and corresponds to the lowest critical load coefficient. A
possible collapse of the structure usually happens for this first mode.
• The structure becomes unstable for the chosen combination when the loading reaches a value equal to the
current loading multiplied with the critical load factor.
• A critical load factor smaller than 1 signifies that the structure is unstable for the given loading.
• Since the calculation searches for eigen values which are close to zero, the calculated  values can be both
positive or negative.
A negative critical load factor signifies a tensile load. The loading must thus be inversed for buckling to occur
(which can for example be the case with wind loads).
• The eigenmodes (buckling shapes) are dimensionless. Only the relative values of the deformations are of
importance, the absolute values have no meaning.
• For shell elements the axial force is not considered in one direction only. The shell element can be in
compression in one direction and simultaneously in tension in the perpendicular direction. Consequently, the
element tends to buckle in one direction but is being ‘stiffened’ in the other direction. This is the reason for
significant post-critical bearing capacity of such structures.
• It is important to keep in mind that a Stability Calculation only examines the theoretical buckling behaviour of
the structure. It is thus still required to perform a Steel Code Check to take into account Lateral Torsional
Buckling, Section Checks, Combined Axial Force and Bending,…
10 DD – 2025/03/11


## Sayfa 11

Example: Buckling_Frame.esa
A stability analysis is performed on a steel frame. The first three buckling modes are calculated and the buckling loads
are compared to the analytical results from ref.[25] to obtain a benchmark for the stability calculation of SCIA Engineer.
To obtain precise results, the number of 1D elements is refined in the mesh settings.
In the solver setup the number of critical values can be specified. In addition, the shear force deformation is neglected
to have a good comparison with the analytical results.
After executing a stability calculation, the following critical load coefficients are obtained:
The corresponding buckling modes can be shown under 3D deformations for the stability combination.
11

Advanced concept training – Nonlinear & Stability
Buckling mode 1 – Critical load factor  = 2,22
Buckling mode 2 – Critical load factor  = 2,89
Buckling mode 3 – Critical load factor  = 3,54
The loading F on each column is 100 kN so the critical buckling load N can be calculated as:
cr
N =λ∙F
cr
This gives the following results which can be compared to the analytical calculation:
N for SCIA Engineer Ref.[25]
cr
Buckling Mode 1 222 kN 221.5 kN
Buckling Mode 2 289 kN 289.6 kN
Buckling Mode 3 354 kN 353.8 kN
12 DD – 2025/03/11

|  | N for
cr |  |  | SCIA Engineer |  |  | Ref.[25] |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Buckling Mode 1 |  |  | 222 kN |  |  | 221.5 kN |  |  |
| Buckling Mode 2 |  |  | 289 kN |  |  | 289.6 kN |  |  |
| Buckling Mode 3 |  |  | 354 kN |  |  | 353.8 kN |  |  |


Example: Buckling_Arch.esa
When calculating for example an arched steel bridge, one of the required parameters for a steel code check is the
buckling length of the arch. Using a stability calculation, the buckling factor of any member can be obtained.
As an example, a steel parabolic arch is modelled with two fixed end points. The arch has a horizontal length of 10m,
height 2m and is loaded by a vertical line load of 30 kN/m.
The shear force deformation is neglected to have a good comparison with analytical results. Using an average mesh size
on curved 1D members of 0,1m, a stability calculation yields a critical load factor of 0,46.
The first buckling mode has the following shape:
This result can be checked using an analytical formula from Ref.[27]. The critical line load for a fixed-fixed arch with
height 20% of the support distance is given as:
13

Advanced concept training – Nonlinear & Stability
EI
P =103,2
cr L³
With: E = Modulus of Young = 210000 N/mm²
I = Moment of inertia = 666666,67 mm4
L = Distance between supports = 10000 mm
 P = 14,448 kN/m
cr
The loading P on the structure was 30 kN/m so the critical load coefficient can be calculated as:
p 14,448 kN/m
cr
λ= = =𝟎,𝟒𝟖
P 30 kN/m
This result corresponds to the result of SCIA Engineer.
Using the critical load coefficient, the buckling load of the arch can be calculated. The minimal normal force N under the
given loading is 195,08 kN. The minimal is used since this will give a conservative result for the buckling length.
The buckling load N can then be calculated as:
cr
𝑁 =𝜆∙𝑁 =0,46∙196,08=𝟗𝟎,𝟏𝟗𝟔𝟖 𝒌𝑵
𝑐𝑟
Applying Euler’s formula, the buckling factor k can be calculated:
π²∙E∙I
N =
cr (k∙s)2
1 π²∙E∙I
 k = ∙√
s Ncr
In which s specifies the arch length of 10,982m
The parameters can now be inputted:
1 π²∙E∙I 1 π²∙210000N/mm²∙666666,67mm4
k = ∙√ = ∙√ = 𝟎,𝟑𝟔
s N 10982mm 90196,8N
cr
This buckling factor can now be inputted in the buckling data of the arch so it can be used for a steel code check.
This example illustrates the use of a stability calculation for a simple arch. The same procedure can now be applied to
more complex structures like arched bridges, truss beams, concrete buildings,…
14 DD – 2025/03/11

Example: Buckling_Arch_FEM.esa
To illustrate the use of stability in finite element calculations, the arched bridge of the previous example is modelled as
a shell element.
Using an average mesh size of 2D elements of 0,1m, a stability calculation yields the following critical load factor:
The corresponding buckling mode can be shown by viewing the 3D deformations
The result corresponds to the analytical solution shown in the previous example.
15

Advanced concept training – Nonlinear & Stability
Example: Buckling_Arbitrary_Profile.esa
In this example, the buckling load for a composed column is calculated. The column has a variable section consisting of
two different cross-sections.
The critical buckling load is compared with the analytical result from Ref.[6].
The loading is taken as 1 kN so the critical load coefficient equals the critical buckling load. To obtain a correct
comparison with the analytical calculation, the shear force deformation is neglected:
16 DD – 2025/03/11

The formula for the buckling load of a member with arbitrary cross-section is given in Ref.[6], pp.114 by formula (2-48):
m∙E∙I
2
P =
cr l²
With m a parameter depending on the length of the different sections and the ratio I /I . This parameter is specified in
1 2
table 2-10 of Ref.[6].
I 8.356 107 mm4
1
I 4.190 108 mm4
2
a 4 m
l 10 m
a/l 0.4
I /I 0.2
1 2
m 4.22
P 3713 kN
cr
A stability calculation gives the following result:
This result corresponds to the analytical solution.
The corresponding buckling mode has the following shape:
Note: the buckling shapes can be animated through New Animation Window
17

| I
1 | 8.356 107 mm4 |
| --- | --- |
| I
2 | 4.190 108 mm4 |
| a | 4 m |
| l | 10 m |
| a/l | 0.4 |
| I /I
1 2 | 0.2 |
| m | 4.22 |
| P
cr | 3713 kN |


Advanced concept training – Nonlinear & Stability
2. Nonlinear behavior of Structures
2.1. Type of Nonlinearity
The nonlinear behaviour of structures can be categorised in three different groups:
• Geometrical nonlinearity: the displacements are dependent on the strains in a nonlinear way.
• Physical nonlinearity: the stresses are dependent on the strains in a nonlinear way.
• Local nonlinearity: the geometry or the boundary conditions of the structure change during the solving of the
equations.
These three types of nonlinearities will be examined in detail in the following chapters.
For a complete overview and theoretical background, reference is made to [1], [2], [3], [4], [5] and [6].
To be able to use nonlinearities in SCIA Engineer this functionality should be enabled in the Project data dialogue:
And in the right column the necessary nonlinearity should be activated.
2.2. Nonlinear Combinations
During a linear analysis, the principle of superposition is valid: the load cases are calculated and the combinations are
composed after the calculation.
For a nonlinear analysis, this principle is not valid anymore. The combinations have to be assembled before starting the
calculation. In SCIA Engineer, this is done by defining nonlinear combinations.
18 DD – 2025/03/11

A nonlinear combination is defined as a list of load cases where each load case has a specified coefficient.
The type of the combination, Ultimate or Serviceability, will determine what type of code check (ULS or SLS) can be
performed for the specified combination.
It is important to keep in mind that as each combination requires its own calculation, no sub-combinations can be
generated for a nonlinear calculation. This means that the options ‘envelope’ or code combinations are not available. It
is however possible to generate all the required nonlinear combinations based on the existing combinations for the
linear calculation. This can be done using the New from combination button.
19

Advanced concept training – Nonlinear & Stability
In this window we first need to specify the type of combination to import, linear, or an envelope or Eurocode
combination. The difference between both is that a linear combination will only create one nonlinear combination, but
the other types could generate multiple combinations. The number of nonlinear combinations that will be generated
for the selection is displayed on the bottom left.
When choosing for the envelope type, the filter option becomes available. This option can be very interesting when a
big amount of combinations are being generated. A lot of combinations that each require a separate calculation can
lead to very long calculation times. To limit this, the filter offers the following options:
• All = the number of nonlinear combinations equal the number of linear combinations in the envelope
combination
• All dangerous = a dangerous combination is one that creates an extreme effect in some member in the
structure. That extreme effect can be an internal force or stresses in the extreme fibers of the section. Linear
results will be used in order to estimate which members are getting these extreme effects. These are however
based on linear results, so be careful as these aren’t necessarily all the dangerous ones in terms of the
nonlinear calculation.
• Most dangerous = it is possible to specify how many dangerous combinations are considered. This can be
useful when you want to run a quick analysis with a lower amount of dangerous combinations. However, the
safer option is to use the filter for all dangerous combinations and the safest is to use all.
20 DD – 2025/03/11


## Sayfa 21

Notes:
• The combinations defined as linear combinations can be imported as nonlinear combinations. It is however
important to keep in mind that during a nonlinear calculation no combinations are generated. This implies for
example that code specific combinations must first be exploded to linear combinations. These linear
combinations can then be imported as nonlinear combinations.
• This method makes sure that the code coefficients and relations between the load cases are correctly taken
into account for the nonlinear calculation.
• To view the extreme results for the nonlinear calculation, the nonlinear combinations can be grouped within a
result class.
• The amount of nonlinear combinations is limited to 1000.
2.3. Calculation methods & settings
In the solver settings, different methods can be found for the execution of the calculation method as well as different
settings for the calculation.
2.3.1. Solver settings
In a nonlinear calculation, it is no longer possible to compute a solution for the structure in one single step. Instead the
calculation will be an iterative procedure. In each iteration the software will make a guess at the solution and then
evaluate if this guess is accurate enough to considerate as a solution. If not, another iteration will be calculated until the
required accuracy is reached and the guess is accepted as the final solution. How the guesses are made depends on the
chosen calculation method, which will be explained over this chapter. First, let us discuss the other solver options:
• Number of increments: For the sake of robustness or accuracy it can sometimes be advisable to apply the
loading in smaller steps (or load increments) instead of all at once. If a higher number than 1 is entered here
the load will be divided into steps, and an equilibrium will be searched for the first load step before adding on
the next piece of loading, until the entire load is added and the final solution is reached.
• Maximum iterations: As mentioned before, the solver will iterate until the required accuracy is reached and
only then stop its calculation. However it may be that the loading diagram has no solution, or that the chosen
calculation method is not adequate and will need a huge amount of iterations before ever reaching a solution.
To prevent being stuck in extremely long calculations you can limit the maximum number of iterations here.
• Solver precision ratio: This parameter controls how the solver decides if the result of an iteration is accurate
enough to stop the calculation. The convergence criterium is the following, with i the results of the current
iteration and i-1 the result of the previous iteration:
21

Advanced concept training – Nonlinear & Stability
• A coefficient value higher than 1 means that the tolerances will be smaller, hence the calculation will be more
accurate. A coefficient value lower than 1 means that the tolerances will be larger, hence the convergence will
be achieved more easily. In some case of heavy nonlinearity (e.g. cable or membrane structures), it might be
necessary to use less strict convergence criteria (e.g. ratio = 0.1) to allow for proper convergence of the
analysis. Note that even with a ratio = 0.1, the convergence criteria remain very tight.
• Solver robustness ratio: This parameter affects the damping (speed of change) of the stiffness and internal
forces of nonlinear hinges, supports, members. It is not possible to exactly describe it, because it is always a
little different in different cases and types. It influences the convergence of nonlinear calculation with local
nonlinearities on 1D members, hinges and with nonlinear surface support independently on selected method
of calculation. A high value of this parameter ensures a more stable but slower convergence of the calculation.
It can help in case of sensitive nonlinear analysis where convergence is problematic. A more detailed
explanation can be found in the final chapter of this manual.
2.3.2. Picard
The default calculation method is the Picard method. It uses a secant line to predict possible solutions for an
equilibrium. It is quite fast for basic nonlinearities (f.e. tension only elements, pressure only supports) and uses only one
force increment. The method is very robust, but a bit slower than the other options. It is a good alternative for when
the Newton-Raphson method fails.
For big calculations it can be interesting to combine the methods and use the Picard method for its robustness in the
first few iterations, but increase the speed by using Newton-Raphson in the following iterations. This can be done by
choosing ‘Picard and Newton-Raphson’ and then inputting how many iterations should first be performed using Picard:
22 DD – 2025/03/11

2.3.3. Newton-Raphson
The Newton-Raphson method makes its guesses for the equilibrium solution by computing the stiffness matrix of the
structure in each step. This means that the iterations themselves will be slower, but the guesses will be much better.
Therefore, it will require just a few iterations to find equilibrium. This method is robust for most of problems, but may
fail in the vicinity of inflection points in the loading diagram. It can provide a solution even for extremely large
deformations. The accuracy of the method can be increased through refinement of the finite element mesh or by
increasing the number of increments. For good results this method requires at least 4 subdivisions per 1D member.
If a structure has large rotations, care should be taken to not exceed 5° of rotation per load increment.
In some specific cases a high number of increments may solve even problems that tend to a singular solution which is
typical for the analysis of post-critical states.
2.3.4. Modified Newton-Raphson
This method is very similar to the Newton-Raphson method, with the only difference that the stiffness of the structure
is only computed in the first iteration. The same stiffness is then used for all the other iterations, making them faster
but less efficient than their non-modified version. This method can be especially interesting for very large structures,
where computing the stiffness matrix in every step would lead to very high calculation times. It can also prove to be
more robust in passing inflection points in the loading diagram. It also requires at least 4 subdivisions per 1D member.
23

Advanced concept training – Nonlinear & Stability
3. Geometrical Nonlinearity – also possible with Concept edition
The options described here for the geometrical nonlinearities are also possible with a Concept edition. So the
Professional edition is not required for this chapter, except for the stability calculation (and the calculation of as
cr
explained in the first chapter).
For geometrical nonlinearities, the nonlinear behaviour is caused by the magnitude of the deformations. Take for
example a simple beam: during a linear analysis, the relative deformation of the end nodes, in the direction of the beam
axis is dependent on the strain of the beam. Due to a curvature of the beam, the distance between the end nodes is
changed. This implicates that the total strain is now not solely dependent on the displacement.
This relation can now be looked upon for different cases:
a) Small displacements, small rotations and small strains;
b) Large displacements, large rotations and small strains;
c) Large displacements, large rotations and large strains;
In SCIA Engineer, methods a) and b) have been implemented for the analysis of geometrical nonlinear structures.
Method c) with large strains is less common in structural applications (for example rubber) and not present in SCIA
Engineer.
Method a) will be calculated with a 2nd order calculation method, like Timoshenko; method b) with a 3rd order method.
An explanation about the methods and their workings is given at the end of this chapter. A 1st order method is used
when geometrical nonlinearities are not taken into account.
To activate the Geometrical Nonlinearity, the functionality Nonlinearity > Geometrical nonlinearity must be activated.
24 DD – 2025/03/11

3.1. Overview
Global analysis aims at determining the distribution of the internal forces and moments and the corresponding
displacements in a structure subjected to a specified loading.
The first important distinction that can be made between the methods of analysis is the one that separates elastic and
plastic methods. Plastic analysis is subjected to some restrictions.
Another important distinction is between the methods, which make allowance for, and those, which neglect the effects
of the actual, displaced configuration of the structure. They are referred to respectively as second-order theory and
first-order theory based methods.
The second-order theory can be adopted in all cases, while first-order theory may be used only when the displacement
effects on the structural behavior are negligible.
The second-order effects are made up of a local or member second-order effects, referred to as the P- effect, and a
global second-order effect, referred to as the P- effect.
On the next page an overview of the global analysis following the EN 1993-1-1, chapter 5, will be given:
• All the rules in this overview are given in the EN 1993-1-1 art. 5. For each step the rule will be indicated. The
first rule (αcr > 10) will be explained in EN 1993-1-1 art. 5.2.1(3).
• In this overview 3 paths are defined:
o Path 1: In this path a first order calculation will be executed
o Path 2: In this path a second order calculation will be executed with global (and bow)
imperfections.
o Path 3: In this path a second order calculation will be executed with the buckling shape of the
construction as imperfection.
• The calculation will become more precise when choosing for a higher path.
• The lower paths will result in a faster calculation, because a first order calculation can be executed without
iterations, but this first-order theory may be used only when the displacement effects on the structural
behavior are negligible.
• In the next paragraphs the rules in this overview will be explained.
To take into account all nonlinearities in the model, nonlinear load combinations are made.
25

Advanced concept training – Nonlinear & Stability
5.2.1(3)
  10
cr
Yes No
5.2.2(3)b 5.2.2(3)a 5.3.2(11)
5.3.2(6)
No Yes
5.2.2(5)   3 N > 25% N cr Ed cr
(member)
e if e in all
0 0
required members
Increase sway
effects with:
No Members Yes
with e
0
5.2.2(3)c 5.2.2(7)b
26 DD – 2025/03/11
c r

1 −
1
1
Structural Frame Stability
Global Imperfection 
 cr
1a 1b 2a 2b 2c 3
1st Order Analysis 2nd Order Analysis
l b based on a global l b taken equal to L
buckling mode
Stability Check in plane
Stability Check out of plane + LTB Check
Section Check
With:
•  elastic critical buckling mode.
cr
• L member system length
• l buckling length
b
Path 1a specifies the so called Equivalent Column Method. In step 1b and 2a “l may be taken equal to L”. This is
b
according to EC-EN so you don’t have to calculate the buckling factor =1.
In further analysis a buckling factor smaller than 1 may be justified.

|  |  |  | b 2 |  |
| --- | --- | --- | --- | --- |
|  |  | 2nd Order Analysi | s |  |
|  |  | No Members Yes
with e
0 |  |  |
|  | l taken equal to L
b |  |  |  |
|  |  |  |  |  |
| Stability Check i | n plane |  |  |  |
|  |  |  |  | 5.2.2(7)a |
|  | Stability Che | ck out of plane + LTB Check |  |  |
|  |  |  |  |  |


3.2. Alpha critical
The calculation of alpha critical is done by a stability calculation in SCIA Engineer.
According to the EN 1993-1-1, 1st Order analysis may be used for a structure, if the increase of the relevant internal
forces or moments or any other change of structural behaviour caused by deformations can be neglected. This
condition may be assumed to be fulfilled, if the following criterion is satisfied:
α =
Fcr
≥ 10 for elastic analysis
cr
F
Ed
With:
• α : factor by which the design loading has to be increased to cause elastic instability in a global
cr
mode
• F : design loading on the structure
Ed
• F : elastic critical buckling load for global instability, based on initial elastic stiffnesses
cr
If α has a value lower then 10, a 2nd Order calculation needs to be executed. Depending on the type of analysis, both
cr
Global and Local imperfections need to be considered.
EN1993-1-1 prescribes that 2nd order effects and imperfections may be accounted for both by the global analysis or
partially by the global analysis and partially through individual stability checks of members.
The calculation of Alpha critical and also Path 3 from the diagram of the previous paragraph will be explained in the
chapter “Stability”.
Example: Imperfections2D.esa
The diagram is now illustrated on a steel frame including a global imperfection. This benchmark project is examined in
detail in references [19] and [22].
A stability calculation for the frame gives a critical load factor α of 13,17 > 10
cr
This indicates that 2nd order effects are negligible and a 1st order analysis may be used for the structure.
Path 1a can thus be followed and a 1st order calculation is executed.
A steel code check gives the following results:
When Path 2a is followed, using a global imperfection and a 2nd order calculation according to Timoshenko, the steel
code check shows the following:
27

Advanced concept training – Nonlinear & Stability
It can be seen that the results are practically the same which is as expected since the α is larger than 10.
cr
The input of imperfections and execution of a stability calculation will be regarded in detail further in this course.
3.3. Imperfections
When performing a nonlinear calculation, it is possible to input initial geometrical imperfections: initial deformations
and curvatures. These imperfections take into account the fact that the structure is for example a bit inclined instead of
perfectly vertical or that the members are not completely straight.
To input geometrical imperfections, the functionality Nonlinearity > Initial imperfections must be activated.
28 DD – 2025/03/11

For each nonlinear combination, the imperfections can then be set.
Difference is made between Global imperfections (Initial deformations) and Bow Imperfections (Curvatures).
3.3.1. Global frame imperfection 
The nodal coordinates define the geometry of the structure. Using initial deformations as global imperfections,
additional displacements (in X and Y direction) can be inputted. These displacements will thus alter the geometry.
The structure itself can therefore be modelled as straight; the inclination is given by the global imperfection.
The global imperfection can be set in the following ways:
• Simple Inclination
• Deformation from Load case
• Inclination Functions
• Buckling Shape
Simple Inclination
The imperfection is defined as a simple inclination. The inclination is defined in mm per m height of the structure. More
specifically a horizontal displacement is given in the global X and/or Y direction which has a linear relation to the height
(global Z direction).
Deformation from Load case
The imperfection is defined by the displacements of a specified load case. This option can be used to take into account
for example the imperfections due to the self-weight. Especially for slender beams this can be important.
29

Advanced concept training – Nonlinear & Stability
Inclination Functions
The imperfection is defined by a deformation-to-height curve, similar to the Simple Inclination. The curve can then be
assigned to an appropriate nonlinear combination.
These inclination functions are entered through Initial deformations:
When the type is set to Manual input, the function can be inputted by specifying the height and the horizontal
displacement.
The type Factor allows a factor to be inputted at each height. In the definition of a nonlinear combination, a manually
inputted function can then be multiplied by this factor function.
30 DD – 2025/03/11


## Sayfa 31

When choosing EN 1993-1-1 art. 5.3.2(3), the inclination function is calculated according to the code. As shown during
the 2nd Order calculations, Eurocode 3 ref.[26] defines the global imperfection the following way:
1
φ= ∙α ∙α
200 h m
With:
2 2
• α = but ≤α ≤1,0
h √h 3 h
1
• α =√0,5(1+ )
m m
• h The height of the structure in meters
• m The number of columns in a row including only those columns which carry a vertical load N
Ed
• not less than 50% of the average value of the vertical load per column in the plane
• considered.
31

Advanced concept training – Nonlinear & Stability
These parameters can be inputted after which the imperfection is automatically calculated:
An inclination function is defined independent of an axis. This means that the same function can be used to define the
displacement in X in function of Z, or Y in function of Z, or X in function of Y, … All of this, as well as the sign, can be
defined in the nonlinear combinations.
The axis in big letters (X, Y, Z) are the axis that will be inclined. The small letter axis (dx, dy, dz) is the direction of this
inclination. Generally you will only use dx-Z to incline the vertical axis in the x-direction and dy- Z to incline the vertical
axis in the y-direction.
The Sense option allows the imperfection to be applied in the positive or negative direction (according to the chosen
global direction). This way, a nonlinear combination can for example be copied, where the original has a positive sense
and the copy a negative sense to take into account both possibilities.
Instead of the Sense, the Factor function can be applied as specified above. The values of the factor function will be
multiplied with the values of the defined inclination function.
32 DD – 2025/03/11

Buckling Shape
As an alternative to global and local imperfections, paragraph 5.3.2(11) of Eurocode 3 Ref.[26] allows the use of a
buckling shape as a unique imperfection. For this option the Professional or Expert edition is necessary.
To input geometrical imperfections, the functionality Nonlinearity > Initial imperfections and Stability must be
activated.
Since the buckling shape is dimensionless, Eurocode gives the formula to calculate the amplitude  of the
init
imperfection. In Ref.[28] examples are given to illustrate this method. In this reference, the amplitude is given as
follows:
N
cr
η =e ∙ ∙η
init 0 E∙I ∙η" cr
y cr,max
χ∙(λ̅) 2
1−
e =α∙(λ̅−0,2)∙ MRk∙ γM1 for 𝜆̅>0.2
0 NRk 1−χ∙(λ̅) 2
With:
• λ̅ =√ NRk
Ncr
•  imperfection factor for the relevant buckling curve.
•  reduction factor for the relevant buckling curve, depending on the relevant cross-section.
• N characteristic resistance to normal force of the critical cross-section, i.e. N .
Rk pl,Rk
• N elastic critical buckling load.
cr
• M characteristic moment resistance of the critical cross-section, i.e. M or M as relevant.
Rk el,Rk el,Rk
•  shape of the elastic critical buckling mode.
cr
• η′′ maximal second derivative of the elastic critical buckling mode.
cr,max
33

Advanced concept training – Nonlinear & Stability
The value of  can then be entered in the field Max deformation.
init
3.3.2. Initial bow imperfection e
0
During a linear calculation, the members are taken to be ideally straight. Using bow imperfections, a local curvature can
be defined for each element. A normal force in a member will thus lead to additional moments. These additional
moments shall only be taken into account for members with compressive forces.
To obtain correct results using bow imperfections, it is required to refine the number of 1D mesh elements.
The local imperfection can be set in the following ways:
• simple curvature;
• according to buckling data.
SCIA Engineer will automatically apply the curvature in the following way, which is in most cases the de-favourable
sense:
After the first iteration step, the deflection in the middle determines the sign of the initial bow imperfection. If there is
no deflection the alternating pattern is used and the beam will deform with a sinusoidal form through its nodes.
Simple Curvature
Using this option, a curvature can manually be inputted. This curvature will be used for all members in the project. This
method is quite convenient when the same type of cross-section (buckling curve) is used throughout the project like for
example scaffolds, framework,…
34 DD – 2025/03/11

According to Buckling Data
A bow imperfection according to buckling data allows you to specify different curvatures for each used buckling data. In
the System lengths and buckling settings properties of a member, the bow imperfection can be set, first for the span y-y
and then for z-z.
By default the bow imperfection is set to ‘From setup’. In this case the member will follow the default setting from the
steel setup:
35

Advanced concept training – Nonlinear & Stability
As seen during the 2nd Order calculations, Eurocode 3 Ref.[26] defines the initial bow imperfection using the following
table:
Where L is the member length.
When the options EN 1993-1-1 Table 5.1 elastic/plastic are chosen, SCIA Engineer will check the buckling curve of the
member and will apply the specified imperfection automatically on the member. This imperfection is always applied
which corresponds to Path 2c of the diagram seen during the 2nd Order calculations.
The options EN 1993-1-1 Table 5.1 elastic/plastic – if required will apply the imperfection only if the normal force N in
Ed
a member is higher than 25% of the member’s critical buckling load N as specified in Eurocode. This corresponds to
cr
Path 2b of the diagram.
When selecting Manual input of Bow Imperfection, the imperfection can manually be inputted using the tab System
lengths and buckling settings.
This way, the imperfection can be manually inputted for each member. This is in contrast to the Simple Curvature
where the same bow imperfection is applied to all members.
36 DD – 2025/03/11

When using bow imperfections it is important to set correct reference lengths for buckling since these lengths will be
used to calculate the imperfection.
Example: Imperfection_Manual.esa
In this project, the principle of a bow imperfection is illustrated for a simple beam.
The beam is modelled once as ideally straight (B1). Next the beam is modelled as curved with a deflection at midpoint
of 200mm (B2). In the third case, the beam is taken as straight and a bow imperfection of 200mm is manually set
through the Buckling Data (B3).
The tab System lengths and buckling settings of B3 shows the following:
The three beams are loaded by a normal force of 5 kN. Those with a deflection of 200 mm, are expected to have a
moment of 1 kNm in the middle of the beam.
37

Advanced concept training – Nonlinear & Stability
The moment diagram after a nonlinear calculation shows the following:
As expected, the beam B1 does not produce a bending moment. Both the curved beam and the beam with
imperfection yield the 1 kNm.
This example shows that the bow imperfection corresponds to a curved calculation model.
38 DD – 2025/03/11

Example: Imperfection_Self_Weight.esa
A tube on two supports is loaded by its self-weight and a compression load of 20 kN.
The tube is manufactured in S235, has a cross-section RO 48,3 x 3,2 and length 5m.
A linear calculation results in a bending moment of 0,109 kNm:
This moment is caused entirely by the self-weight of the tube:
• Area: 453 mm² = 0,000453 m²
• Volumetric mass: 7850 kg/m³
• Length: 5m
• Loading caused by the self-weight: 7850 kg/m³ x 0,000453 m² x 9,81 m/s² = 34,88 N/m
• = 0,03488 kN/m
• Moment caused by the self-weight: (0,03488 kN/m x 5m x 5m) / 8 = 0,109 kNm
39

Advanced concept training – Nonlinear & Stability
The self-weight causes a deformation of 11,659 mm
Due to the fact that the self-weight causes this deformation, the compression force of 20 kN will lead to an additional
moment.
To see this effect in detail, a nonlinear analysis is carried out which takes into account the deflection caused by the self-
weight. The deformation of the self-weight can thus be set as a global imperfection.
The nonlinear calculation results in a moment of 0,342 kNm
This value can be calculated as follows:
• Imperfection due to the self-weight: 11,659mm = 0,011659m
• Compression force: 20 kN
• Additional Moment: 20 kN x 0,011659m = 0,23318 kNm
• Moment caused by the self-weight: 0,109 kNm
• → Total moment: 0,109 kNm + 0,23318 kNm = 0,342 kNm
It is clear that taking into account the deflection of the self-weight has a large influence on the results. In this example,
the bending moment increases with more than 200%. Especially for slender beams the imperfection due to self-weight
can be important.
40 DD – 2025/03/11


## Sayfa 41

3.3.3. Example Global + Bow imperfection
In this chapter a general example of the global and bow imperfections in SCIA Engineer.
Example: Steel_Depot.esa
To illustrate the use of imperfections, both sway imperfections and bow imperfections are inputted on the columns of a
steel depot.
The structure has the following layout:
The diagonals have been inputted as tension only members.
Inclination functions are defined according to the code so the initial sway is calculated automatically:
41

Advanced concept training – Nonlinear & Stability
The system lengths and buckling groups of the columns is edited to specify bow imperfections EN 1993-1-1 Table 5.1:
Since global and local imperfections are used for the columns, a buckling check needs not to be executed conform Path
2c of the diagram seen during the 2nd order calculations. To take this into account in SCIA Engineer, the buckling factors
can be manually set to a low value so buckling will not be normative.
The Fundamental ULS combination according to Eurocode can then be imported as nonlinear combinations. The bow
imperfection is set according to buckling data and the global imperfections are set through the inclination functions.
Since sway imperfections need to be considered in one direction at a time, the nonlinear combinations are taken once
with the sway in X-direction and once with the sway in Y-direction.
42 DD – 2025/03/11

If required, this number of combinations can de doubled to change the sense of the sway imperfections.
To obtain correct results for the bow imperfections, the finite element mesh is refined.
A 2nd Order calculation can then be carried out using Timoshenko’s method.
43

Advanced concept training – Nonlinear & Stability
The Steel Code check for the mid columns yields the following result.
Since both global and local imperfections have been inputted, only the section check and the lateral torsional buckling
check are relevant. In this example, member B22 produces the largest check on the compression and bending check.
3.4. Calculation methods for geometrical nonlinearity
3.4.1. 2nd order: Timoshenko
For 2nd order calculations SCIA Engineer uses the so called Timoshenko method (Th.II.O) which is based on the exact
Timoshenko solution for members with known normal force. It is a 2nd order theory with equilibrium on the deformed
structure which assumes small displacements, small rotations and small strains.
When the normal force in a member is smaller than the critical buckling load, this method is very solid. The axial force is
assumed constant during the deformation. Therefore, the method is applicable when the normal forces (or membrane
forces) do not alter substantially after the first iteration. This is true mainly for frames, buildings, etc. for which the
method is the most effective option.
The influence of the normal force on the bending stiffness and the additional moments caused by the lateral
displacements of the structure (the P-Δ effect) are taken into account in this method.
The difference between 1st, 2nd and 3rd order calculation is nicely illustrated in the picture below.
44 DD – 2025/03/11

If the members of the structure are not in contact with subsoil and do not form ribs of shells, the finite element mesh of
the members must not be refined.
The method needs only two steps, which leads to a great efficiency. In the first step, the axial forces are solved. In the
second step, the determined axial forces are used for Timoshenko’s exact solution. Further iterations are only needed if
other nonlinearities are present in the structure. The original solution was generalised in SCIA Engineer to allow taking
into account shear deformations.
The applied technique is the so called ‘total force method’ or ‘substitution method’. In each iteration step, the total
stiffness of the structure is adapted and the structure is re-calculated until convergence. This technique is illustrated in
the following diagram.
Start
Calculate K
E
K = 0
G
K = K - K
E G
Calculate K
G
Solve K.u = F
No
Convergence
in u?
Yes
Stop
In this figure, the stiffness K is divided in the elastic stiffness K and the geometrical stiffness K . The geometrical
E G
stiffness reflects the effect of axial forces in beams and slabs. The symbol u depicts the displacements and F is the force
matrix.
The criterion for convergence is defined as follows:
∑(u2 +u2 +u2 )−∑(u2 +u2 +u2 )
x,i y,i z,i x,i−1 y,i−1 z,i−1
≤ 0,005/(precision ratio)
∑(u2 +u2 +u2 )
x,i y,i z,i
With:
• u displacement in direction x for iteration i.
x,i
• u displacement in direction y for iteration i.
y,i
• u displacement in direction z for iteration i.
z,i
45

Advanced concept training – Nonlinear & Stability
The diagram is illustrated on the following figure.
The choice of the Timoshenko Method and the maximal amount of iterations can be specified through Calculation,
Mesh > Solver Setup.
46 DD – 2025/03/11

Example: Timoshenko.esa
In this benchmark example, a frame is calculated both in 1st and 2nd Order using the Timoshenko method. The influence
of the 2nd Order effects is seen to be significant.
The results are compared with the results from reference [7] ‘Stahl im Hochbau’ p256.
Stahl im Hochbau SCIA Engineer
M21 602.2 ( 227.1 ) kNm 605.97 ( 227.08 ) kNm
M32 506.0 ( 224.9 ) kNm 503.38 ( 224.86 ) kNm
M34 779.9 ( 343.0 ) kNm 771.54 ( 342.92 ) kNm
The results between brackets are those for the first order analysis.
The Moment-diagram for the 1st Order analysis shows the following:
A significant increase of the moments is seen for the 2nd Order analysis:
47

|  | Stahl im Hochbau | SCIA Engineer |
| --- | --- | --- |
| M21 | 602.2 ( 227.1 ) kNm | 605.97 ( 227.08 ) kNm |
| M32 | 506.0 ( 224.9 ) kNm | 503.38 ( 224.86 ) kNm |
| M34 | 779.9 ( 343.0 ) kNm | 771.54 ( 342.92 ) kNm |


Advanced concept training – Nonlinear & Stability
3.4.2. 3rd order
For 3rd order calculations several methods are available. Each of those iterative processes have been explained in
chapter 3.3. They can be selected in the solver settings, after selecting a 3rd order calculation.
The exact process will now be explained for the Newton-Raphson method (Th.III.O), which is based on the Newton-
Raphson method for the solution of nonlinear equations.
This method is a more general applicable method which is very solid for most types of problems. It can be used for very
large deformations and rotations; however, as specified the limitation of small strains is still applicable.
Mathematically, the method is based on a step-by-step augmentation of the load. This incremental method is
illustrated on the following diagram:
Start
Choose F
u = 0
0
F = 0
0
F = F + F
0
Determine K at F
T 0
Solve K T . u = F u 0 = u
Determine F
0
u = u + u
0
No
Convergence
in u?
Yes
Any F left?
No
Stop
The following figure shows this process graphically.
48 DD – 2025/03/11

In this figure, the tangential stiffness K is used. The symbol u depicts the displacements and F is the force matrix.
T
The original Newton-Raphson method changes the tangential stiffness in each iteration. There are also adapted
procedures which keep the stiffness constant in certain zones during for example one increment. SCIA Engineer uses
the original method.
As a limitation, the rotation achieved in one increment should not exceed 5°.
The accuracy of the method can be increased through refinement of the finite element mesh and by increasing the
number of increments. By default, when the Newton-Raphson method is used, the number of 1D elements is set to 4
and the Number of increments is set to 5.
In some cases, a high number of increments may even solve problems that tend to a singular solution which is typical
for the analysis of post-critical states. However, in most cases, such a state is characterized by extreme deformations,
which is not interesting for design purposes.
The choice of the Newton-Raphson Method, the amount of increments and the maximal amount of iterations can be
specified through Calculation, Mesh > Solver Setup.
As specified, the Newton-Raphson method can be applied in nearly all cases. It may, however fail in the vicinity of
inflexion points of the loading diagram. To avoid this, a specific method has been implemented in SCIA Engineer: the
Modified Newton-Raphson method.
49

Advanced concept training – Nonlinear & Stability
This method follows the same principles as the default method but will automatically refine the number of increments
when a critical point is reached. This method is used for the nonlinear Stability calculation and will be looked upon in
Chapter 6.
In general, for a primary calculation the Timoshenko method is used since it provides a quicker solution than Newton-
Raphson due to the fact Timoshenko does not use increments. When Timoshenko does not provide a solution, Newton-
Raphson can be applied.
Example: N_R_Beam.esa
This project is used to illustrate the capability of the Newton-Raphson method regarding large deformations and large
rotations.
The structure consists of a cantilever beam which is loaded by a moment at the free end. The rotation at the free end is
given by:
M∙L
φ=
E∙I
When  = 2, the beam will form a complete circle. The moment required for this rotation is:
2π∙E∙I
M =
2π L
The member considered has a length of 10m and a cross-section type IPE200. The parameters in this case are:
• E = 210000 N/mm²
• L = 10000 mm
• I = 1.943 107 mm4
This leads to a moment M 2=2563,73 kNm.
Since the rotation in one increment is limited to 5°, about 80 increments are needed. To obtain precise results, a dense
mesh is required.
A calculation using Newton-Raphson with 80 increments and 40 mesh elements for the beam gives the following
results:
The displacement of nodes shows the following for fiy:
50 DD – 2025/03/11


## Sayfa 51

Example: N_R_Membrane.esa
This project illustrates the (positive) influence of the membrane forces on the results.
A steel plate is loaded by a surface load, perpendicular to the member system-plane. A 1st Order calculation gives the
following deformations:
A 3rd Order calculation using Newton-Raphson will take into account the development of membrane forces in the plate.
These tensile membrane forces will have a positive effect on the stiffness on the plate and will thus reduce the
deformations.
The results are showed below.
51

Advanced concept training – Nonlinear & Stability
Remark: as explained before, Timoshenko is not valid for high deformations. So for this example, Timoshenko would
lead to incorrect results and this method does not take into account (positive) influence of the membrane forces on the
results. The deformations calculated with Timoshenko are the following:
52 DD – 2025/03/11

4. Local Nonlinearity
The local nonlinearities can be defined for 1D members, connections between 1D members, 2D members and supports.
The following types have been implemented in SCIA Engineer:
• Beam local nonlinearity;
• Beam local nonlinearity including initial stress;
• Nonlinear member connections;
• Support nonlinearity;
• Pressure only elements;
• 2D membrane elements.
5.1. Beam Local Nonlinearity – also available in the concept edition
The options described in this chapter are also possible with a Concept edition. So the Professional edition is not
required for this chapter.
To input local nonlinearities for 1D members, the functionality Nonlinearity > Beam local nonlinearity must be
activated.
53

Advanced concept training – Nonlinear & Stability
After activating the functionality you can introduce 1D nonlinearities.
The following types are available:
• Pressure only;
• Tension only;
• Limit force;
• Gap element;
• Initial stress.
All those options are explained with examples in the chapters below.
4.1.1. Members defined as Pressure only / Tension only
• Pressure only: the member is only active under pressure (i.e. strut, …)
• Tension only: the member is only active under tension (i.e. anchor, diagonal, …)
When using this type of beam nonlinearity, it can happen that numerically a very small pressure/tensile force remains in
the member, mostly due to the self-weight. This value will always be negligible compared to the other force
components in the member.
54 DD – 2025/03/11

Example: Tension_Only.esa
A 3rd order calculation is executed using Newton Raphson, including global imperfections.
The diagonals are designated as ‘Tension-only’ members.
The normal forces for a linear analysis show that extreme compression results are obtained in the diagonals. This will
inevitably lead to failure due to buckling.
The normal forces for the nonlinear analysis shows that diagonals are now only subjected to tension thus buckling will
not occur anymore. Only very small compression forces will appear in the diagonals.
55

Advanced concept training – Nonlinear & Stability
Notes:
• It’s important to keep in mind that ‘Tension only’ does not change anything for shear forces and moments. The
only component which cannot occur is compression, but the member can still be subjected to bending,
torsion, ...
• To specify that a member can only be subjected to normal forces, the FEM type of the member can be set to
axial force only.
• When using this, you must be absolutely sure that bending effects cannot occur in reality!
• Also beware that no hinges should be added on members with axial force only, as these degrees of freedom
are already free and this will lead to an instability in the calculation.
• The Calculation protocol for the Nonlinear calculation shows extra information concerning the applied
nonlinearities, number of iterations per combination, …
56 DD – 2025/03/11

Example: Mechanism.esa
When using beam nonlinearities, it is important to make sure that not too many elements are eliminated.
A common error is the creation of a mechanism due to the fact too many elements have been designated tension
only/pressure only and thus no solution can be found. This principle is illustrated in the following project.
A steel frame has been modelled with hinged connections between the elements. The diagonals have been specified as
Tension only.
Due to for example a roof load, both diagonals are subjected to compression. This is not possible for Tension only
members so both members are eliminated causing a global instability of the frame. This can be overcome by using the
modified Newton-Raphson or by inputting a very small horizontal force.
4.1.2. Members with Limit Force
A member with limit force acts in the structure until a specified limit is reached after which the member will be
eliminated from the calculation or yields plastically.
The Direction is used to specify in which zone the limit acts: the tension zone or the compression zone.
When the limit is reached, it can be specified in the Type field how the member should act. The member can be
eliminated from the structure (Buckling) or the member can stay in the structure but with the limit force as maximal
axial force (Plastic yielding).
The limit itself is defined in the field Marginal Force. A negative value must be specified for a compression limit and a
positive value for a tension limit.
57

Advanced concept training – Nonlinear & Stability
Example: Limit_Force.esa
In this project, a frame is modelled in which one diagonal has a compression limit of -30 kN.
For the left frame, the type is set to Buckling, for the right frame the type is set to Plastic yielding.
A linear analysis shows the following normal forces in the diagonals of both frames:
A nonlinear analysis, taking into account the limit force gives the following results for the normal forces:
In the left frame, the diagonal has buckled so the tensile force in the remaining diagonal is augmented. In the right
frame, the diagonal stays in the structure but yields plastically and thus acts at the limit force of -30 kN.
The deformed structure for the nonlinear analysis shows the following:
Due to the fact one diagonal has buckled in the left frame, larger horizontal deformations occur.
58 DD – 2025/03/11

4.1.3. Members with gaps
There are various connection and support conditions used in a real structure. It may happen that a beam is not
attached rigidly to the structure but "starts its action" only after some initial change of its length. The beam thus has to
have a certain translation in its local x-direction before it becomes active. This behaviour can be inputted using gap
elements.
The Type field is used to specify if the member is active only in compression, only in tension or in both directions.
The value of the translation can be inputted in the displacement field. The gap can be defined at the beginning or at the
end of the beam using the position field.
Gap members in tension only can for example be used to model a rope: the rope can only work in tension but becomes
active only after a certain translation. Gap members in both directions are frequently used in scaffolding structures.
Note: for some release the Hinge combined with gap nonlinearity give this warning message:
To avoid this warning message, we can create a non-linear function that can be assigned to the element. One example
is done in the Scaffolding tutorial cf. 1.6.3 Diagonals
59

Advanced concept training – Nonlinear & Stability
4.2. Beam Local Nonlinearity including Initial Stress
To input local nonlinearities for 1D members, including initial stresses, following functionalities must be activated:
• Nonlinearity;
• Nonlinearity > Beam local nonlinearity;
• Nonlinearity > Geometrical nonlinearity;
• Cables.
The Initial stress functionality is a standard functionality of SCIA Engineer, it is hidden and always enabled by default.
Then introduce a beam nonlinearity on your member.
Two extra types are now available:
• Members with Initial Stress;
• Cable Elements.
60 DD – 2025/03/11


## Sayfa 61

4.2.1. Members with Initial Stress
Tensile forces in elements augment the stiffness of the structure. Compression forces reduce the stiffness. Adding initial
stresses into the structure can therefore influence the stiffnesses and resulting deformations greatly. They are
especially useful for cables, which will be looked at in the next part.
Initial stress in SCIA is regarded as follows:
• The element in question is taken from the structure.
• The initial stress is put on the element through the defined axial force.
• The element is put back into the structure.
It is clear that when the element is inserted into the structure, the initial stress will partly be given to other members
thus the inputted force will not stay entirely in the member in question. This is why the internal forces in the results will
be different from the inputted starting values.
Notes:
• A positive axial force signifies a tensile force; a negative axial force signifies a compression force.
• Initial Stress is mostly used in conjunction with a 2nd Order analysis.
There are two ways to enter initial stresses into a model. The first why is by adding the nonlinear data ‘initial stress’ or a
cable with initial stress values into the model, and then choosing for the option Stress from member nonlinear data in
the solver setup, together with Initial stress.
The second option is the Stress from load case option. Here you can select a load case and the internal forces caused by
this load case will be used as the initial state for the calculation.
Initial stresses (both from load case or member data) are also used for the modal analysis, making it possible to
introduce some part of nonlinear behavior in dynamic analysis. This is very useful to account for 2nd order and pre-
tensioning effects on cables.
In theory, when using correctly defined values of the cross-section properties (surface A, moment of inertia I, modulus
of Young E), a beam nonlinearity with Initial Stress can also be used to model straight cables with large pre-stress
forces. Both Timoshenko and Newton-Raphson methods can be applied in this case.
In general however, for cables the use of the specific cable element is advised in conjunction with the Newton-Raphson
method.
61

Advanced concept training – Nonlinear & Stability
Example: Initial_Stress.esa
In this project, a simple frame is modelled. The diagonal has a RD30 section and is given an Initial Stress by means of a
tensile force of 500 kN.
In the left frame, the initial stress will immediately be distributed to the column. In the right frame, the extra support
will prohibit this.
A nonlinear analysis, taking into account the initial stress gives the following results for the normal forces:
As specified, in the left frame, the initial stress is immediately distributed to the rest of the structure so the tensile force
of 500 kN is not found entirely in the diagonal. In the right frame, the force cannot be distributed due to the support so
the 500 kN stays in the diagonal.
This principle is even more clear when looking at the deformed mesh for the nonlinear analysis:
62 DD – 2025/03/11

4.2.2. Cable Elements – Not available in the Professional edition
Since SCIA Engineer version 21.1, cables are fully supported in the 64bit version in the default post-processing
environment. For cable analysis the module sens.03 is necessary. This module is included in the Expert and Ultimate
edition.
A cable element is an element without bending stiffness (Iy and Iz  0). During the solving of the equations this behavior
is taken into account, so only axial forces (in tension only) will occur and you will obtain zero values for the internal
forces M, M , M, V and V. The displacements (in the intermediate nodes) have thus been calculated without bending
x y z y z
stiffness.
The cable type is a special type of a beam nonlinearity, which can be applied on 1D members in a model.
You will need to create nonlinear combinations to take into account this nonlinear property during the analysis. A
geometrical nonlinear analysis should be executed by calculating with a 3rd order analysis with the Newton-Raphson
calculation method.
Theoretical background
A curve formed by a hanging cable is called a "Catenary". With relatively small bending (height - sag roughly 10% of its
length) the curve can be approximated by a parabola (this approach was implemented previously in the 32bit version of
SCIA Engineer in the post-processing environment ‘v16 and older’), but such approximation however becomes imprecise
with greater sag / length ratio (and for different heights of the begin and end nodes of the cable).
The catenary curve is linearly approximated into a polyline. The approximation points (nodes) are calculated from the
catenary equation defined by two edge points of the beam and its parameter a, which is defined as a quotient (normal
force / cable weight per unit length). The normal force is defined via the nonlinearity parameters and the cable weight
per unit length is calculated from the cross-section and material parameters. Formula of the general catenary equation:
x−k
y=a∙cosh( )+c
a
Parameters k and c represent the horizontal and vertical shifts of the curve, respectively.
The relation between catenary length s, vertical span of two definition points v and their horizontal span H is:
H
√s2−v2 =2∙a∙sinh( )
2a
You have full control of the catenary curve approximation precision. A general curvature approach has been utilized.
Using the curvature (parameter defining how much the curve bends at the given point) the radius of the circles (of the
same curvature as the curve in the touching point) is calculated. Concept of the approximation error is graphically
described in the figure below:
The detailed background (including formula to calculate the value of sag) can be found on our help-pages:
https://help.scia.net/webhelplatest/en/#analysis/nonlinear_analysis/cables/cable.htm
63

Advanced concept training – Nonlinear & Stability
Modelling
In order to apply the cable nonlinearity to 1D elements, the functionalities Nonlinearity and Cables should be turned on
in the Functionality tab of the Project settings dialog. When the Cables functionality is turned on, automatically the
functionality Geometrical nonlinearity is turned on as well.
You can assign the nonlinearity 1D for a 1D member via Input Panel > workstation Structure > category Boundary
conditions > Nonlinearity 1D:
Following parameters are available for the type cable:
• Normal force [kN]: value of the pre-stressing axial force (positive)
• Self-weight: determines, whether the cable is subjected to self-weight
• Pn [kN/m]: specifies the value of the additional load (so other than self-weight)
• Direction of load: specifies the load direction (Pn and self-weight)
• Approximation error [m]: determines the maximal allowed distance between point on the analytically defined
catenary curve and the projection of this point (in the direction of load) on the linearly approximated polyline
of the cable.
• Maximum sag [m]: automatically calculated value, it is the maximal distance (in the direction of load) between
a node of the catenary curve and its projection on the straight line connecting both ends of the cable
64 DD – 2025/03/11

Alternation of these parameters automatically causes the geometry change of the catenary curve. The geometry is also
automatically altered after the coordinate change of the begin or the end node of the cable.
If there are more cables attached to each other, e.g. through the internal nodes, these mutual connections are preserved
after the geometry alternation of the cable member and the relative positions of the internal nodes within the cable
length remain the same.
Analysis
The average number of 1D mesh elements on straight 1D members (linear approximation between the nodes of the
catenary curve) needs to be at least 4 (in the mesh setup).
A nonlinear combination needs to be defined, and the geometrically nonlinear analysis calculated. Large deformations
needs to be considered (3rd order), along with the Newton-Raphson method of calculation (to be defined in the solver
setup). If there are problems with convergence, increase the values of Number of increments, or Maximum iterations.
Additionally, the Solver precision ratio or Solver robustness ratio might be altered to have an influence on the
convergence criteria as well.
65

Advanced concept training – Nonlinear & Stability
Results
In order to see the real scale of the results (the default scale is exaggerated artificially since the biggest value is scaled to
1 m), it is necessary to set the real ratio and the multiplier equal to 1 within the Scale settings:
Notes:
• The input of the cable element only defines the initial shape / sag. Afterwards the cable can be loaded by real
loads. The normal force after calculation will therefore be different to the inputted initial normal force N.
• Adding a cable into the model will adapt the mesh also for the linear calculations. This means that the linear
calculation may become unstable when a cable is added, and a nonlinear calculation becomes necessary to
obtain results.
66 DD – 2025/03/11

Example: Chandelier.esa
To illustrate the application of cables, a chandelier is modelled. A circular ring hangs with cables to one support at the
top. These cables have a normal force of 1 kN and self-weight activated. The cables are also connected with each other
by other cables with the same properties.
We consider a nonlinear combination NC1 which contains the self-weight of the structure and three points loads of 1
kN. In the 3D displacements we notice that the load straightens the curved elements:
67

Advanced concept training – Nonlinear & Stability
In the cables, the only non-zero values of internal forces are for the normal forces N (tension). On the right picture we
can see that there are no bending forces present in the cables:
68 DD – 2025/03/11

Example: Spire.esa
Another application of cables is a spire. The mast is supported by several cables which have a prestress force of 5 kN
and self-weight activated.
The 3D displacement for nonlinear combination NC1 (which includes a horizontal wind load) for example shows the
following:
69

Advanced concept training – Nonlinear & Stability
4.3. Nonlinear Member Connections
When inputting hinges on beam elements, it is possible to input a nonlinear function for each degree of freedom (ux,
uy, uz, fix, fiy, fiz). The function can signify the relation between moment and rotation or force and displacement.
When using nonlinear functions, it is very important to input a relevant linear stiffness. This value is used for the linear
calculation, and during the first iteration of the nonlinear calculation.
The nonlinear functions can be entered in this menu:
For member connections, the nonlinear functions can be defined for translation or rotation. When defining a function,
it is very important to check the signs of the function values. The defining magnitudes for nonlinear rotation functions
are the internal forces, for nonlinear translation functions the displacements.
This implies that these functions are inputted in the first and third quadrant.
70 DD – 2025/03/11


## Sayfa 71

One must also make sure that the function does not contain any vertical parts, as this would lead to problems in the
calculation with multiple possible solutions for one value. When entering a vertical part, the following message will be
displayed:
In older versions of SCIA engineer it was possible to introduce vertical parts. Therefore, when opening an old project, it
is possible that it contains such a function. In this case an error message will appear when running the calculation:
For the end of the function, it is possible to select one of three options:
• Free: When the maximal force is reached, it stays at that value and the deformation will rise uncontrolled.
• Fixed: When the maximal deformation is reached, it stays at that value and the force component will rise.
• Flexible: The relation between force component and deformation is linear.
SCIA Engineer also allows creating a new function from the already defined functions to provide an easy input of
complex functions.
71

Advanced concept training – Nonlinear & Stability
Example: Connection.esa
In this example, an industrial hall is calculated using algorithms to calculate the moment-rotation diagram for bolted
and welded beam-to-column connections. SCIA Engineer allows the calculation of these diagrams and the automatic
application of the diagram as a nonlinear spring function for member connections. For the theoretical background,
reference is made to the “Advanced Training Steel” and ref. [13].
The geometry of the structure is shown in the following figure:
The structure is calculated in 2nd Order using Timoshenko’s Method. The diagonals have been set as Tension-only.
In node N2 a bolted beam-to-column connection is modelled:
The Moment-Rotation diagram is calculated by SCIA Engineer using the algorithm of the EN 1993-1-8.
72 DD – 2025/03/11

Together with the calculated diagram, automatically a nonlinear function is created:
The function characterizes both tension-on-top and tension-at-bottom.
This function can then be assigned to the hinge defined in node N2:
73

Advanced concept training – Nonlinear & Stability
4.4. Support Nonlinearity
SCIA Engineer allows the following types of nonlinear supports:
• Tension only / Pressure only supports;
• Nonlinear springs for supports;
• Friction supports.
4.4.1. Tension only / Pressure only Supports
To input nonlinearities for supports, the functionality Nonlinearity > Support nonlinearity/basic soil spring must be
activated.
Supports with tension can be automatically eliminated. This is mostly used for slabs on subsoil, column bases of for
example scaffoldings, struts, …
The following types of supports can be eliminated if tension occurs:
• Nodal Support;
• Line Support;
• Subsoil.
For nodal supports or line supports it is possible to specify a translation degree of freedom as Rigid pressure only or
Flexible pressure only.
Subsoils are always regarded as pressure only for a nonlinear calculation, if the functionality Support nonlinearity/Soil
spring is ticked on.
74 DD – 2025/03/11

Example: Subsoil.esa
In this example, a slab on subsoil is calculated. The slab is loaded by a point force in the middle.
The deformation for the linear analysis shows the following:
Especially in the corners, tensile contact stresses are expected:
A nonlinear analysis, taking into account the pressure-only characteristic of the subsoil shows the following
deformation:
75

Advanced concept training – Nonlinear & Stability
As can be seen, the slab will rise at the corners so no more tensile contact stresses are obtained:
The pressure stresses in the middle have increased which is expected when the slab can rise at the corners.
Notes:
• When using subsoil, it is important to adequately refine the mesh in order to produce precise results.
• When calculating following the Winkler theory, the Pasternak values (C2) must be set to zero.
4.4.2. Nonlinear Springs for Supports
As seen for nonlinear member connections, it is also possible to use nonlinear functions for supports. For each degree
of freedom (X, Y, Z, Rx, Ry, Rz) a nonlinear function can be inputted. The function can signify the relation between
moment and rotation or force and displacement.
When using nonlinear functions, it is very important to input a relevant linear stiffness. This value is used during the first
iteration of the nonlinear calculation (and during a linear calculation).
The definition of the nonlinear functions is exactly the same as seen with nonlinear member connections.
In addition to nodal supports, a nonlinear function can also be used for a subsoil under a plate.
76 DD – 2025/03/11

Example: Support_Function.esa
In this example, the use of a nonlinear function for a support is illustrated. A simple beam on two supports is modelled.
The translation Z of both supports has been defined as a nonlinear function:
The beam is loaded by a point force at one end. The value of the point force is taken as 1kN and 1.4kN.
A nonlinear analysis shows the following deformation for the load of 1kN:
This value can manually be approximated as follows:
−100 mm
U = ∙(−1000 N+628 N)=−53,14 mm
z −1328 N+628 N
For the load of 1.4 kN, the fixed end of the function is reached thus the maximal deformation of 100 mm is obtained:
77

Advanced concept training – Nonlinear & Stability
Example: Pallet_Racking.esa
In this example, the calculation of a pallet racking system is shown according to ref. [9] Eurocode ENV 1993-1-1 and ref.
[10] FEM 10.0.02. This last reference gives field test methods which allow the definition of moment-rotation diagrams
for beam-to-column connections and column supports.
The beam-to-column connections and column supports can be defined by means of nonlinear functions.
The following nonlinear spring is defined for the column supports:
The beam-to-column connections are defined by the following nonlinear characteristic:
78 DD – 2025/03/11

Example: Culvert.esa
This project illustrates the use of nonlinear functions to model for example the soil under a culvert.
The culvert has the following shape:
Nonlinear supports have been defined with appropriate functions to model the behaviour of the soil:
A nonlinear analysis gives the following deformation pattern for combination NC2:
79

Advanced concept training – Nonlinear & Stability
4.4.3. Friction Supports
Friction supports can be used to model the fact that a reaction component is dependent on another component. The
horizontal component is for example dependent on the vertical component. When the friction force is surpassed, the
support slips through resulting in large deformations.
To input friction supports, both the functionalities Nonlinearity > Support nonlinearity/Basic soil spring and Friction
support/Soil spring must be activated.
When entering a nodal support, the option Friction can be chosen for the translational degrees of freedom (X, Y, Z).
The option From Reaction is used to specify which force component causes the friction force.
X, Y, Z: The final limit force can be calculated from the reaction in a specified direction. If a support
in the X-direction is being defined, it can be said that the friction force should be determined
from the reaction calculated in either the Y or Z direction. The friction force is calculated
from the following formula:
80 DD – 2025/03/11
m j u
x
 R
z


## Sayfa 81

XY, XZ, YZ: The final limit force can be calculated as a compound friction. Only one of the stated options
is offered for each direction. E.g. if a support in the X-direction is being defined, it can be said
that the friction force should be determined from the reactions calculated in the Y and Z
direction. The friction force is calculated from the following formula:
81
m j u
x
 R 2y + R 2z
X+Y, X+Z, Y+Z: The same as above applies here. A different procedure is however used to calculate the limit
force. E.g. for a friction support in the X-direction the following formula is employed:
m j u
x
 R
y
+ m j u
x
 R
z
In these formulas, mju specifies the coefficient of friction.
In the field C flex, the stiffness of the support can be inputted.
Notes:
• Friction can be inputted in one or two directions. It is not possible to define friction in all three directions since
otherwise the "thrust" cannot be determined.
• When simple friction (X, Y, Z) is defined in two directions, the option Independent is available. This specifies
that the friction in one direction is independent on the friction in the other direction.
• Composed friction (e.g. YZ or Y+Z) can be specified only in one direction.
Friction supports can be used for several types of structures. Nearly every support which isn’t rigidly connected to the
surface on which it stands is subjected to friction. Examples include base jacks of scaffolding structures, supports on an
inclined surface, pipes in boreholes,…

Advanced concept training – Nonlinear & Stability
Example: Scaffolding.esa
This project illustrates the use of friction supports for a scaffolding structure. The scaffold has the following geometry:
The base jacks are inputted as friction supports. Since a base jack, by default, is not connected to the surface, the Z-
direction is defined as rigid Pressure-only. Both horizontal degrees of freedom X and Y are defined as Friction,
dependent on the reaction Z.
When large wind loads are taken into account, for example due to netting, large horizontal reaction forces are expected
in the base jacks. When these reactions surpass the friction force, the support slips through.
82 DD – 2025/03/11

After a nonlinear analysis of the scaffold, the deformed mesh for combination NC4 shows the following:
In the middle base jacks, the friction force is clearly surpassed and thus the supports slip through. To avoid this, the
reaction in Z-direction must be augmented thus extra dead weight like ballast will be required or the base jacks must be
fixed to avoid slipping.
Note: the functionality Nonlinear Line Support defines a specific type of soil spring developed for the Pipfas project
(Buried Pipe Design).
83

Advanced concept training – Nonlinear & Stability
4.5. 2D Elements
4.5.1. 2D Membrane Elements – Not in Professional Edition
This option is implemented in module sens.03 and included in the Expert edition. So with the Professional edition the
option of Membrane elements as described in this chapter, will not be possible.
Membrane elements are defined as shell elements which have no flexural stiffness and no axial compression stiffness.
Membrane elements can thus be used to model canvas, nets, etc. that are subjected to axial tension.
To obtain realistic results, a 2nd order calculation needs to be executed using the Newton-Raphson method.
To input 2D membrane elements, the functionalities Nonlinearity > Geometrical nonlinearity and Membrane Elements
and cables must be activated.
When defining the 2D element, the option Membrane must be chosen as FEM nonlinear model.
84 DD – 2025/03/11

Notes:
• Membrane elements can only be modelled in a General XYZ environment.
• Due to the fact the flexural rigidity is zero, no ribs, orthotropic parameters or physical nonlinear data can be
inputted on a membrane element.
• Since a membrane element has no axial compression stiffness, no concrete calculation can be performed on
this type of element.
Example: Membrane.esa
In this project, a textile canvas is modelled. At the four corners of the canvas, steel cables are attached. Two cables are
subjected to a tensile force of 50kN in horizontal direction.
Since the canvas has an initial position 0,5m lower than the endpoint of the cables, the canvas will first be pulled
straight.
Since both cable and membrane elements are used, a 3rd order nonlinear analysis is executed using the Newton-
Raphson method.
The deformed mesh for the nonlinear analysis shows that the canvas has been pulled straight:
85

Advanced concept training – Nonlinear & Stability
When the scale of the results is augmented, the typical deformation of the membrane element can clearly be seen:
The tensile forces for the cable elements are shown on the following figure:
The principal membrane force n1 shows the tensile forces in the canvas:
86 DD – 2025/03/11

In the same way, n2 can be shown:
The results show the 2nd order effect: due to the tensile forces in one direction, the canvas obtains a stiffness which
results in compression membrane forces.
4.5.1. Pressure only
To input pressure only for 2D elements, the functionality Nonlinearity and Compression - only 2D members must be
activated.
With this option, tension in 2D elements can be automatically eliminated. This is mostly used for masonry elements.
87

Advanced concept training – Nonlinear & Stability
Example: PressureOnly.esa
This project illustrates the use of pressure only elements.
In this project two 2D-elements are modelled. The first one is modelled as an isotropic element with no nonlinearity,
the second one is a pressure only element:
When calculating those elements, for every mesh element a certain orthotropy will be inserted. At the first iteration
step all the pressure only elements, will be calculated as an isotropic element. After the first calculation, SCIA Engineer
will input another stiffness on all elements in tension. So a certain orthotropy will be created. With this stiffness the
tension capacity of this element will decrease. After adapting the orthotropic parameters a new calculation will be
performed. After this second iteration step again the elements in tension will get another stiffness. This process will be
repeated until equilibrium is reached.
88 DD – 2025/03/11

The difference between the isotropic and orthotropic elements can be clearly view looking at the principal normal force
n1 for these members:
In these results the real pressure of this element is visible for the right element. Looking at the trajectories of this
normal force, the trajectory of the pressure force will be even more visible:
89

Advanced concept training – Nonlinear & Stability
5. Physical Nonlinearity
When the stresses are dependent on the strains in a nonlinear way, the nonlinearity is called a physical nonlinearity.
In SCIA Engineer, the following types of physical nonlinearities have been implemented:
• Plastic hinges for Steel Structures
• Physical nonlinear analysis for Concrete Structures
• General plastic analysis for 2D elements
5.1. Plastic Hinges for Steel Structures
This functionality handles the plastic behaviour of 1D elements. When a normal linear calculation is performed and limit
stress is achieved in any part of the structure, the dimension of critical elements must be increased. If however, plastic
hinges are taken into account, the achievement of limit stress causes the formation of plastic hinges at appropriate
joints and the calculation can continue with another iteration step. The stress is redistributed to other parts of the
structure and better utilization of overall load bearing capacity of the structure is obtained.
The material behaves linear elastic until the plastic limit is reached after which it behaves fully plastic. The σ-ε diagram
thus has the same shape as the Moment-Curvature diagram:
90 DD – 2025/03/11
M
M p
k
The full plastic moment is given as M , the curvature as k.
p
In SCIA Engineer, a plastic moment can only occur in a mesh node. This implies that the mesh needs to be refined if a
plastic hinge is expected to occur at another location than the member ends.
The reduction of the plastic moment has been implemented according to the following codes: EC3, DIN 18800 and NEN
6770.
There is off course a risk when taking plastic hinges into account. If a hinge is added to the structure, the statically
indeterminateness is reduced. If other hinges are added, it may happen that the structure becomes a mechanism. This
would lead to a collapse of the structure and the (nonlinear) calculation is stopped.
On the other hand, plastic hinges can be used to calculate the plastic reliability margin of the structure. The applied
load can be increased little by little (e.g. by increasing the load case coefficients in a combination) until the structure
collapses. This approach can be used to determine the maximum load multiple that the structure can sustain.
To take into account plastic hinges for steel structures, the functionality Steel > Plastic Hinge analysis must be activated.


## Sayfa 91

The choice of code which needs to be applied can be specified through Menu bar > Tools > Calculation & Mesh > Solver
settings. The no code option simply follows the EC-EN logic.
It is not possible to choose on what members or in which nodes plastic hinges can be formed. If the functionality is
activated, a plastic hinge will form wherever the moment resistance is exceeded regardless of the element’s plastic
capacity.
91

Advanced concept training – Nonlinear & Stability
Example: Plastic_Hinges.esa
In this project, a continuous beam is considered. The beam has a cross-section type IPE 300 and is fabricated in S235.
According to Eurocode 3, the plastic moment resistance around the y-axis is given by:
For the beam (no normal or high shear force present) considered this gives the following:
• f = 235 N/mm²
y
• W = 6.28 105 mm³
pl,y
•  = 1.0
M0
 M =
Wpl,y∙fy
= 147,59 kNm
pl,y,d
γM0
A linear analysis shows the following moment-diagram:
A nonlinear analysis taking into account plastic hinges gives the following result:
92 DD – 2025/03/11

When the load is increased further, another plastic hinge will form in the middle of a span thus creating a mechanism.
The nonlinear calculation will stop and a singularity message will be given and the animation window shows the
expected scene, where an additional plastic hinge in the middle of the span leads to a mechanism:
5.2. Physical Nonlinear analysis for Concrete Structures
This topic is regarded in detail in the course “Advanced Training Concrete”.
5.3. General Plastic analysis
This functionality handles the plastic behaviour of any 2D members (plates, walls and shells). Four different criteria have
been implemented to determine when the plastic behaviour is initiated: Von Mises, Tresca, Mohr-Coulomb and
Drucker-Prager.
The plastic behaviour of materials may be combined with other types of nonlinearities in SCIA Engineer. It can be
activated in the material setup, after selecting the right functionalities.
Note: general plasticity behaviour is not applied to 1D members. The 1D members that are present in the model will be
considered as elastic.
93

Advanced concept training – Nonlinear & Stability
5.3.1. Yield criteria
To determine whether the material should start behaving plastically, we first need to know if the yield strength has
been reached. In SCIA Engineer, 4 different yield criteria have been implemented. Two for symmetrical, ductile
materials (steel, aluminium,...): Tresca and Von Mises, and two for materials with different behaviour in compression
and tension (concrete, masonry,...): Mohr-Coulomb and Drucker-Prager.
Tresca
The Tresca criterion is also known as the maximum shear stress theory (MSST) and the Tresca–Guest (TG) criterion. In
terms of the principal stresses the Tresca criterion is expressed as:
Where S is the yield strength in shear, and S is the tensile yield strength.
sy y
On the picture below there is the Tresca–Guest yield surface in the three-dimensional space of principal stresses. It is a
prism of six sides and having infinite length. This means that the material remains elastic when all three principal
stresses are roughly equivalent (a hydrostatic pressure), no matter how much it is compressed or stretched. However,
when one of the principal stresses becomes smaller (or larger) than the others the material is subject to shearing. In
such situations, if the shear stress reaches the yield limit then the material enters the plastic domain.
Von Mises
This criterion suggests that the yielding of materials begins when the second deviatoric stress invariant J2 reaches a
critical value. For this reason, it is sometimes called the J2-plasticity or J2 flow theory. It is part of plasticity theory that
applies best to ductile materials, such as metals. Prior to yield, material response is assumed to be elastic.
In materials science and engineering the von Mises yield criterion can be also formulated in terms of the von Mises
stress or equivalent tensile stress, σ , a scalar stress value that can be computed from the Cauchy stress tensor. In this
E
case, a material is said to start yielding when its von Mises stress reaches a critical value known as the yield strength, σ .
y
The von Mises stress is used to predict yielding of materials under any loading condition from results of simple uniaxial
tensile tests. The von Mises stress satisfies the property that two stress states with equal distortion energy have equal
von Mises stress.
The Von Mises stress is expressed as:
1
σ =√ ∙[(σ −σ )2+(σ −σ )2+(σ −σ )2+6∙(σ2 +σ2 +σ2 )]
E 2 11 22 22 33 33 11 12 23 31
Because the von Mises yield criterion is independent of the first stress invariant, I1, it is applicable for the analysis of
plastic deformation for ductile materials such as metals, as the onset of yield for these materials does not depend on
the hydrostatic component of the stress tensor, just like the Tresca criterion.
94 DD – 2025/03/11

Drucker-Prager
The Drucker-Prager yield criterion is similar to the von Mises yield criterion, with provisions for handling materials with
differing tensile and compressive yield strengths. This criterion is most often used for concrete where both normal and
shear stresses can determine failure. The Drucker–Prager yield criterion may be expressed as:
Where 𝑚=
𝑆𝑦𝑐
with S and S the uniaxial yield stresses in compression and tension respectively.
yc yt
𝑆𝑦𝑡
If both are equal the formula reduces to von Mises.
The image shows the Drucker–Prager yield surface in the three-dimensional space of principal stresses. It is a regular
cone.
Mohr-Coulomb
The Mohr-Coulomb yield is similar to the Tresca criterion, with additional provisions for materials with different tensile
and compressive yield strengths. This model is often used to model concrete, soil or granular materials. The Mohr–
Coulomb yield criterion may be expressed as:
Where 𝑚=
𝑆𝑦𝑐
and 𝐾 =
𝑚−1
𝑆𝑦𝑡 𝑚+1
The parameters S and S are the yield (failure) stresses of the material in uniaxial compression and tension,
yc yt
respectively. The formula reduces to the Tresca criterion if S = S .
yc yt
On the picture there is Mohr–Coulomb yield surface in the three-dimensional space of principal stresses. It is a conical
prism and determines the inclination angle of conical surface.
95

Advanced concept training – Nonlinear & Stability
5.3.2. Finite element model
Drilling rotations at each node is used for in-plane loading. This means that element has six degrees of freedom at each
node and is therefore compatible with other types of elements (beam/solid elements).
Within the element area the Gauss 2x2 quadrature points are used. Each of these Gauss quadrature points is realized
by nine Gauss-Lobatto quadrature points throughout the thickness, so the four-node element has 2x2x9=36 quadrature
points in total.
Due to these Gauss-Lobatto points the element can handle bending loading with high accuracy. In all of these points the
nonlinear model is computed independently using the plane stress formulation. Linear transversal shear stiffness is
assumed.
5.3.3. Material properties
Figure C.2 from EN 1993-1-5 is used for the material behaviour:
The different models are:
a) elastic-plastic without strain hardening
b) elastic-plastic with a nominal plateau slope
c) elastic-plastic with linear strain hardening
d) true stress-strain curve modified from the test results as follows:
In SCIA Engineer, a), b) and c) are implemented.
96 DD – 2025/03/11

5.3.4. General plasticity in SCIA Engineer
General plasticity is a specific type of nonlinearity in SCIA Engineer. This means that General plasticity is a sub-
functionality of the nonlinear analysis.
The nonlinearity of materials is defined directly in the material library. See the property group Material behaviour for
nonlinear analysis.
By default, all materials in the library are set as elastic. This means, that the selected material will behave elastically
during a nonlinear analysis. The plastic properties of materials are generic, code independent in SCIA Engineer and are
therefore available for any material, regardless of the selected design code.
Plasticity can be enabled by selecting a type of plastic behaviour. For steel, we can use Isotropic elasto-plastic von Mises.
It corresponds to a bilinear stress-strain relationship, identical in tension and compression. The plastic branch may have
a slope (hardening modulus) or not.
97

Advanced concept training – Nonlinear & Stability
The stress-strain relationship is automatically generated from 3 parameters: Young's modulus (elastic part), yield stress
for uniaxial tension and, optionally, hardening modulus (slope of the plastic branch).
Only the tension part of the diagram is defined, as it is related to a plastification condition in general 3D stress state in
principal stress directions. Some plastification models allow for a different yield stress in compression, which is defined
separately. There is no limit (ultimate) strain value for the analysis.
When the actual strain value in the structure exceeds the defined diagram, the diagram is extrapolated, tangent to the
last defined segment of the stress-strain relationship. The reason for that is, that the analysis would then fail and it
would be impossible to find where the problem is located in the structure. It is therefore preferable, that the analysis
continues and that you check the obtain strain values after the analysis.
The following parameters define the nonlinear behaviour of the material in the material library:
98 DD – 2025/03/11

• E modulus: Young’s modulus of the material which defines the slope of the elastic part of the stress-strain
diagram
• Material behaviour: the type of material behaviour for the nonlinear analysis has to be selected
o Elastic
o Isotropic elasto-plastic, Tresca (ductile materials such as metal, steel, aluminium)
o Isotropic elasto-plastic, von Mises (ductile materials such as metal, steel, aluminium)
o Isotropic elasto-plastic, Drucker-Prager (materials with difference in compressive en tensile
strength such as concrete and soil)
o Isotropic elasto-plastic, Mohr-Coulomb (materials with difference in compressive en tensile
strength such as concrete and soil)
• Input type: defines the definition of the plastic branch of the stress-strain diagram
o Elasto-plastic: In the plastic domain, the stress remains constant when the strain increases
o Elasto-plastic with hardening: In the plastic domain, the stress increases with the strain
• Yield strength: elastic limit for plastification due to shear
• Hardening modulus: slope of the plastic branch of the stress-strain diagram
Note: Various types of nonlinearity may be combined in the same project. However it is not possible to cumulate
several types of nonlinearity on the same 2D member. The property FEM nonlinear model will behave as follows, when
combined with a plastic material:
• Plastic material and 2D press-only behaviour: the press-only behaviour will be ignored and the 2D member
will behave as plastic.
• Plastic material and membrane behaviour: the plastic behaviour will be ignored and the 2D member will
behave as an elastic membrane element.
When starting the analysis, a warning message will be displayed giving the same information about functionality
conflicts.
5.3.5. Checking strains
When using general plasticity, the stresses in the material will be topped off at the yield strength (or a bit higher if strain
hardening is used). To check if the structure is stable, we will therefore need to check something different than the
stresses.
A first indicator is of course if the nonlinear calculation can find a solution. If the stiffness matrix becomes singular when
considering general plasticity, the plastic deformations could be so big that the structure becomes a mechanism and no
solution is found. The structure cannot hold the loads.
If the calculation succeeds, the check needs to be done on the amount of plastic strain. It can be displayed in the
results for 2D stresses, when changing the type of values to basic (in local axis) or principal (in principal axis) plastic
strain.
99

Advanced concept training – Nonlinear & Stability
Example: Plastic_Plate_Stresses.esa
In this project, 3 vertical walls of different steel materials are loaded each time by the same vertical surface load of
242.90 kN/m². The value of the load is high enough to make sure that the Von Mises stresses in every wall are higher
than the allowed yield strength fy of the steel materials.
A linear analysis shows the following results for the Von Mises stresses:
As expected, the Von Mises stresses for every wall are exactly the same and are higher than the yield strength fy.
For every used material, the following properties for the nonlinear analysis are inserted:
100 DD – 2025/03/11


## Sayfa 101

The nonlinear analysis shows the following results for the Von Mises stresses:
101

Advanced concept training – Nonlinear & Stability
Example: Beam_Column_Connection.esa
The functionality General Plasticity can also be used to model steel connections using finite elements to perform a
plastic stress check.
In this example, a bolted column-beam connection is modelled using 2D finite elements in SCIA Engineer. That way the
plastic stresses can be calculated by performing a nonlinear analysis.
Elastic results for (linear) combination CO2: Plastic results for nonlinear combination NC2:
102 DD – 2025/03/11

| Elastic results for (linear) combination CO2: | Plastic results for nonlinear combination NC2: |
| --- | --- |


6. Nonlinear Stability
In this final chapter we will combine both the stability and nonlinear effects into a nonlinear stability calculation.
As specified in the assumptions of the first paragraph: a stability calculation is by default a linear process. nonlinearities
like friction supports, pressure only supports… are not taken into account. Specifically for this purpose, SCIA Engineer
provides the use of a nonlinear stability calculation. This type of calculation has the following additions to the linear
stability calculation:
• Local nonlinearities are taken into account
• 3rd order effects are taken into account using the Modified Newton-Raphson algorithm.
Modified Newton-Raphson follows the same principles as the default method but will automatically refine the number
of increments when a critical point is reached and will only update its stiffness matrix every N iterations. This method
can therefore give precise results for post-critical states.
SCIA Engineer will perform a 3rd order calculation taking into account local nonlinearities. After this calculation, the
resulting deformed structure is used for a Stability calculation. As a result, the critical load factor of the structure is
obtained for the structure including nonlinearities.
To activate the nonlinear stability calculation, the functionalities Stability and Nonlinearity > geometrical nonlinearity
must be activated.
In addition, support and/or beam local nonlinearities can also be activated.
103

Advanced concept training – Nonlinear & Stability
The choice of the 3rd order theory, the amount of increments and the maximal amount of iterations can be specified in
the solver settings.
Since the nonlinear stability calculation automatically implies the modified Newton-Raphson method for the solver, this
method cannot be adapted in the settings. The option is available for the sake of choosing a method for the normal
nonlinear calculation.
Since the modified Newton-Raphson method also uses load increments, it is important to set a right amount of
increments. Therefore it is advised to choose for the Newton-Raphson method, so you can input the number of
increments.
The nonlinear stability calculation can then be selected in the calculation window:
104 DD – 2025/03/11

• #A = For nonlinear stability, the 3rd order (large deformations) along with Newton-Raphson method are always
used, hence this setting is not possible to be altered.
• #B = Solver precision and Solver robustness ratio = the same as in case of nonlinear analysis, but applied only
for nonlinear stability calculations
• #C1 = Initial load factor (default value is 1) = this is portion of the NL.ST.C. content, which is applied in the first
increment of the nonlinear stability analysis process.
• #C2 = Load factor increment (default value is 0.1) = this is portion of the NL.ST.C. content, which is being added
in each subsequent increment during the nonlinear stability analysis process.
• #C3 = Content of the NL.ST.C - the whole content is being added - e.g. if there is load case of self-weight and
some different load case with force loads, during the increments, both loads (self-weight and force load) are
being added by the same ratio (hence also self-weight is being added over 100%).
• #D = Maximum iterations = maximal number of iterations within each increment, the same as in case of
nonlinear analysis,
As mentioned before, the nonlinear analysis in the background of the nonlinear stability analysis process is being
calculated until one of the ending conditions is achieved. There are in basic three ending conditions #E1 - #E3 explained
in detail below:
• #E1 = The last increment is the one, where user defined limit deformation is reached. It is possible to define
the type (direction) of this nodal deformation, where 3 translational directions and 3 rotational directions are
available to be selected. Also, total translation and total rotation, which is vector sum of the corresponding
entity might be selected. The corresponding limit value for the selected deformation is the defined, in units of
length if the deformation is of translation type, or in radians is the deformation is of rotational type. This user
defined limit is then checked in each increment of the analysis, and the maximum of all the nodes is evaluated
for the ending condition.
• #E2 = The user might explicitly define the number of increments of this process (the default is 100). The
nonlinear analysis running will be ended upon reaching this increment number. This might be used in order to
define what exact load should be used for the subsequent eigenvalue analysis - e.g. in the presented case, with
initial load factor of 1 and load factor increment 0.1 and maximum 100 increments, the maximal load would be
1+0.1*99, hence, 10.9 times the content of the NL.ST.C. (if the other ending conditions are not achieved
before this amount of load is applied). It is also possible to check the number of last increment in the LOG file
105

Advanced concept training – Nonlinear & Stability
of the corresponding analysis in the TEMP folder (see in the next chapter below). Alternatively, this might be
used to limit the analysis, so the calculation takes less time in total.
• #E3 = The analysis might end due to reaching singularity, hence if the determinant of either the stiffness matrix
is reaching 0, due to either large geometrical displacements, or material yielding.
• #F = After one of above mentioned ending conditions #E1 or #E3is achieved, the last increment is refined,
hence, the analysis process returns one step back and the application of the load in the last increment is
refined, in order to achieve more precise result. The refinement factor is 10 (not possible to alter by user),
hence, 10-times more finer then the load factor increment. In this example case, it means 0.01 (0.1 / 10),
hence 1% of load will be added in each refined increment.
• #G = Considering the geometry and stress state from the last increment of previous process, the eigenvalue
analysis is conducted. Type of eigenvalue solver might be selected, and the number of buckling modes,
analogical to the settings of the linear stability analysis.
The whole process is explained graphically in the figure and graph below, where on the x-axis there is number of
increment, and y-axis the applied load (in times of NL.ST.C. content):
Note: You can know more about setting nonlinear stability in HELP SCIA :
https://help.scia.net/25.0/en/#analysis/calculation/nonlinear_stability_calculation.htm?Highlight=no%20linear%20stabi
lity
106 DD – 2025/03/11

Example: Stability_FalseworkV25.esa
In this example, a stability analysis is carried out on a large falsework structure measuring 15m x 15m x 12m.
All diagonals of the structure have been given a gap of 1mm.
The structure is loaded by its self-weight, formwork and concrete for a total loading of +/- 18.000 tonnes.
First a linear stability calculation is carried out to evaluate the critical load factor. The number of 1D elements is set to 5
to obtain good results without severely augmenting the calculation time.
The following result is obtained:
The critical load factor is smaller than 10 which indicates that the structure is susceptible to 2nd order effects. Therefore
a 2nd order calculation is carried out using Timoshenko. The number of increments is set to 5 and the maximal number
of iterations is set to 50.
107

Advanced concept training – Nonlinear & Stability
The 2nd order calculation leads to the following message:
This implies that the 2nd order calculation does not converge to a result but leads to instability. The question now rises
as to what causes this instability.
This is the point where the nonlinear stability calculation comes in. During the linear stability calculation, the gap
elements on the diagonals of the structure were not taken into account. A nonlinear stability calculation takes into
account both 2nd order effects and the gap elements.
The nonlinear stability calculation gives the following result:
This result gives a very important conclusion: the structure including all gap elements is not capable of supporting the
loading. Only 42% of the loading can be supported before instability occurs. This is the reason why the 2nd order
calculation does not pass.
When local nonlinearities are used, it is mandatory to execute a nonlinear stability calculation to draw correct
conclusions concerning the global buckling of the structure.
108 DD – 2025/03/11

7. Troubleshooting
In this final Chapter, some common failure messages are given which can occur during a nonlinear analysis.
7.1. Singularity
Singularity problems occur frequently during a nonlinear calculation. Messages of the following type are generated by
SCIA Engineer:
The singularity can be checked by running the check of singularities:
The cause of these messages can be the following:
• The structure is a mechanism: check supports, hinges, unconnected members, …
• The structure becomes a mechanism by eliminating elements (members, supports, …) Examples include
tension only diagonals which are all eliminated, a subsoil (only compression) which comes entirely under
tension, …
• The structure becomes unstable due to the creation of plastic hinges.
• The entire structure or part of it buckles. In the stiffness matrix this implies that KG > KE
• The instability is caused due to small section properties of manually inputted cross-sections. In many
cases, the torsional resistance It is too small.
• As explained in the theory, the Timoshenko method is not suitable when the normal force in a member is
larger than its critical buckling load. In this case, Newton-Raphson should be applied. To find out which
cross-section causes this problem, the sections can be modified alternately until the 2nd Order calculation
passes.
109

Advanced concept training – Nonlinear & Stability
7.2. Convergence
If, during a nonlinear analysis the criterion of convergence is not met, messages of the following type are generated by
SCIA Engineer:
The cause of these messages can be the following:
• Too few iterations have been specified in the Solver Setup.
• The structure is close to instability.
• Cyclic elimination of members or supports: the elements are eliminated during an iteration and are re-
instated during the following iteration.
• To examine this in detail, the calculation can be executed for e.g. three iterations: take iteration
i-1, i and i+1 and compare the results.
• In these results, there will be a difference in one member (for example in one iteration the member is in
tension, in the following iteration it is in compression).
• If the nonlinear stability calculation does not converge, make sure 2nd order (Geometrical Nonlinearity) is
activated as functionality.
110 DD – 2025/03/11


## Sayfa 111

7.3. Solver robustness ratio
A typical use case for using the robustness ratio is a nonlinear calculation is stuck in some oscillation around the
solution value, for instance:
In such a case we would need to “stabilize” the convergence. This can be achieved by slowing down, or dampening the
convergence. Let’s assume the following:
• iteration 1 gives solution value S1
• in iteration 2, the nonlinear process (e.g. NR) gives solution value S2
• normally, we would just take S2 and continue to the next iteration, but if the values start oscillating wildly,
it will not converge
• Instead, we don't take S2 as result of the iteration, but some value in between, using the robustness ratio
to determine how much of S1 is used in the new solution. An example of this (but NOT the formula used in
SCIA Engineer) would be:
Where R is the robustness ratio. If R=1 it will return standard, non-damped convergence. The higher the value, the
more of S1 will be in the solution, the slower the convergence, but the more stable the calculation will be. The actual
formula in SCIA is far more complex, but the principle remains the same.
111

Advanced concept training – Nonlinear & Stability
8. References
[1] V. Kolar, I.Nemec, V. Kanicky, FEM : Principy a praxe metody konecnych prvku, Computer
Press, 1997
[2] W. Nijenhuis, De Verplaatsingsmethode, 1973
[3] J. Blauwendraad, A.W.M. Kok, Elementenmethode 2, Agon Elsevier, Amsterdam/Brussel,
1973
[4] K.J. Bathe, Finite Element Procedures in Engineering Analyis, Prentice-Hall, Inc. Englewood
Cliffs, New Jersey, 1982
[5] J.S. Przemieniecki, Theory of Matrix Structural Analyis, McGraw-Hill Book Company, 1968
[6] S. P. Timoshenko, J. M. Gere, Theory of elastic stability, McGraw-Hill Book Company, 1963
[7] Stahl im Hochbau, 14. Auflage, BandI / Teil 2, Verein Deutscher Eisenhüttenleute,
Düsseldorf, 1985
[8] ESA 3 2de Orde Beton, Raamwerken 2de Orde Theorie Beton, Scientific Application Group
S.V., 1981
[9] Eurocode 3, Design of steel structures, Part 1 - 1 : General rules and rules for buildings, ENV
1993-1-1:1992, 1992
[10] FEM 10.2.02, The Design of Steel Pallet Racking, Fédération Européenne de la Manutention,
Section X, July 2000
[11] Eurocode 3 : Part 1.1., Revised annex J : Joints in building frames, ENV 1993-1-1/pr A2
[12] SCIAESA PT Connect Frame & Grid, Theoretical Background, Release 4.40, SCIA, 04/2004
[13] Esa Prima Win Connect Frame, Truss Connection, Bolted diagonal connection, Manual,
Release 3.30, SCIA, June 2001
[14] DIN 18800 Teil 1, Stahlbauten : Bemessung und Konstruktion, Beuth Verlag GmbH, Berlin,
1990
[15] DIN 18800 Teil 2, Stahlbauten : Stabilitätsfälle, Knicken von Stäben und Stabwerken, Beuth
Verlag GmbH, Berlin, 1990
[16] Beuth-Kommentare, Stahlbauten : Erläuterungen zu DIN 18800 Teil 1 bis Teil 4, Beuth, Ernst
& Sohn, Berlin, 1993
[17] U. Kuhlmann, Stahlbau Kalender 1999, Ernst & Sohn, 1999
112 DD – 2025/03/11

[18] M. Braham, E. Lascrompes, L'analyse élastique des ossatures au moyen de l'Eurocode 3,
Revue Construction Métallique, n° 4-1992
[19] Frame design including joint behaviour, Volume 1, ECSC Contracts n° 7210-SA/212 and
7210-SA/320, January 1997
[20] Ontwerp-handboek voor geschoorde of zijdelings stijve stalen gebouwen volgens EC3, ECCS
n° 85, 1996,
[21] Construction métallique et mixte acier-béton, Calcul et dimensionnement selon les
Eurocodes 3 et 4, APK, Eyrolles, 1996
[22] Esa Prima Win Benchmark PST.06.01 – 07 , Example Code Check and Connections according
to EC3 : Design of an industrial type building, SCIA
[23] NEN 6770, Staalconstructies TGB1990, Basiseisen en basisrekenregels voor overwegend
statisch belaste constructies
[24] NEN 6771, Staalconstructies TGB 1990, Stabiliteit
[25] EULER : Computerprogramma voor de bepaling van de lineair elastische krachtsverdeling,
Eulerse kniklasten en knikvormen van raamwerken, TNO rapport BI-85-1/63.1.0310, Mei,
1985
[26] Eurocode 3, Design of steel structures, Part 1 - 1: General rules and rules for buildings, EN
1993-1-1:2005.
[27] Vandepitte D., Berekening van Constructies (Calculation of Structures), Story-Scientia, Gent,
1979. www.berekeningvanconstructies.be
[28] Höglund T., Beams-Columns, Alternative Imperfection according to Eurocode 9, 2005.
113

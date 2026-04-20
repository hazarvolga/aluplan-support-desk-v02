# TUT [Eng] SCIA25.0 - Tutorial Footbridge  Vibration analysis

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA25.0 - Tutorial Footbridge  Vibration analysis-f9nl8ma78yu.pdf`

---

**Toplam Sayfa:** 36


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
FOOTBRIDGE (ACCORDING SÉTRA GUIDE)

| \ SCIA ENGINEER
TUTORIAL
FOOTBRIDGE (ACCORDING SÉTRA GUIDE) |
| --- |
|  |


Footbridge calculated according Sétra guide
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2025 SCIA nv. All rights reserved.
2 BV -2025/03/03

Table of contents
Table of Contents
TABLE OF CONTENTS .................................................................................................................................................. 3
INTRODUCTION .......................................................................................................................................................... 4
CHAPTER 1: METHODOLOGY ............................................................................................................................... 5
1.1. METHODOLOGY ORGANISATION CHART ........................................................................................................................ 5
1.2. FOOTBRIDGE CLASS .................................................................................................................................................. 5
1.3. COMFORT LEVEL ...................................................................................................................................................... 5
1.4. DETERMINATION OF FREQUENCIES .............................................................................................................................. 6
1.5. DYNAMIC ANALYSIS .................................................................................................................................................. 8
1.5.1. Case 1: sparse and dense crowd ................................................................................................................. 8
1.5.2. Case 2: very dense crowd ............................................................................................................................ 9
1.5.3. Case 3: crowd complement ......................................................................................................................... 9
1.5.4. Remarks .................................................................................................................................................... 10
CHAPTER 2: EXAMPLE 1 - WARREN FOOTBRIDGE ...............................................................................................11
2.1. ASSUMPTIONS ....................................................................................................................................................... 11
2.2. FOOTBRIDGE OF CLASS III ........................................................................................................................................ 13
2.2.1. Calculation of the natural modes .............................................................................................................. 13
2.2.2. Calculation of the dynamic load of the pedestrians .................................................................................. 15
2.2.3. Calculation of dynamic responses ............................................................................................................. 16
2.3. FOOTBRIDGE OF CLASS II ......................................................................................................................................... 19
2.3.1. Calculation of the natural modes .............................................................................................................. 19
2.3.2. Calculation of the dynamic load of the pedestrians .................................................................................. 20
2.3.3. Calculation of dynamic responses ............................................................................................................. 21
2.4. FOOTBRIDGE OF CLASS I .......................................................................................................................................... 22
2.4.1. Calculation of the natural modes .............................................................................................................. 22
2.4.2. Calculation of the dynamic load of the pedestrians .................................................................................. 23
2.4.3. Calculation of dynamic responses ............................................................................................................. 24
2.5. CONCLUSION ........................................................................................................................................................ 25
CHAPTER 3: EXAMPLE 2 – BOX-GIRDER FOOTBRIDGE .........................................................................................26
3.1. ASSUMPTIONS ....................................................................................................................................................... 26
3.2. FOOTBRIDGE OF CLASS III ........................................................................................................................................ 27
3.2.1. Calculation of the natural modes .............................................................................................................. 27
3.2.2. Calculation of the dynamic load of the pedestrians .................................................................................. 29
3.2.3. Calculation of dynamic responses ............................................................................................................. 30
3.3. FOOTBRIDGE OF CLASS II ......................................................................................................................................... 31
3.3.1. Calculation of the natural modes .............................................................................................................. 31
3.3.2. Calculation of the dynamic load of the pedestrians .................................................................................. 32
3.3.3. Calculation of dynamic responses ............................................................................................................. 33
3.4. FOOTBRIDGE OF CLASS I .......................................................................................................................................... 34
3.4.1. Calculation of the natural modes .............................................................................................................. 34
3.4.2. Calculation of the dynamic load of the pedestrians .................................................................................. 35
3.4.3. Calculation of dynamic responses ............................................................................................................. 36
3.5. CONCLUSION ........................................................................................................................................................ 36
BV – 2025/03/03 3

Footbridge calculated according Sétra guide
Introduction
This document deals with pedestrian bridges. The vibrations generated by the passage of pedestrians on a footbridge are
not generally harmful to the structure. However, these vibrations can create a feeling of discomfort for the pedestrians.
The Sétra guide “Assessment of vibrational behaviour of footbridges under pedestrian loading”, published in October
2006, sets out the methodology to be followed for the dynamic analysis of footbridges, and also provides examples of
calculations at the end.
Based on this guide, we will show how to deal with pedestrian bridges in SCIA Engineer.
In a first part, we will carry out some theoretical reminders, we will review in particular the various recommendations for
taking into account the dynamic effects due to pedestrian traffic on footbridges.
Then we will study a footbridge using one of the examples in the Sétra guide.
4 BV -2025/03/03

Chapter 1: Methodology
Chapter 1: Methodology
1.1. Methodology organisation chart
Sétra guide Figure 2.1: Methodology organization chart
1.2. Footbridge class
The Sétra guide defines bridge classes as follows:
Class Level of traffic Risk control
Urban footbridge linking up high pedestrian density areas (for instance, nearby
I presence of a rail or underground station) or that is frequently used by dense crowds YES
(demonstrations, tourists, etc.), subjected to very heavy traffic.
Urban footbridge linking up populated areas, subjected to heavy traffic and that may
II YES
occasionally be loaded throughout its bearing area.
Footbridge for standard use, that may occasionally be crossed by large groups of
III YES
people but that will never be loaded throughout its bearing area.
Seldom used footbridge, built to link sparsely populated areas or to ensure continuity
IV NO
of the pedestrian footpath in motorway or express lane areas.
The class of the footbridge is an indication provided by the project owner.
1.3. Comfort level
Although this notion is highly subjective, the project owner must also set the level of comfort to be provided by the
footbridge.
Comfort level Description
Maximum Accelerations undergone by the structure are practically imperceptible to the users.
Average Accelerations undergone by the structure are merely perceptible to the users.
Under loading configurations that seldom occur, accelerations undergone by the structure
are perceived by the users, but do not become intolerable.
Note: the achieved comfort level is assessed by the acceleration undergone by the structure, determined by calculation,
under different dynamic load cases. It is therefore not directly a question of the acceleration felt by users of the structure.
BV – 2025/03/03 5

| Class | Level of traffic | Risk control |
| --- | --- | --- |
| I | Urban footbridge linking up high pedestrian density areas (for instance, nearby
presence of a rail or underground station) or that is frequently used by dense crowds
(demonstrations, tourists, etc.), subjected to very heavy traffic. | YES |
| II | Urban footbridge linking up populated areas, subjected to heavy traffic and that may
occasionally be loaded throughout its bearing area. | YES |
| III | Footbridge for standard use, that may occasionally be crossed by large groups of
people but that will never be loaded throughout its bearing area. | YES |
| IV | Seldom used footbridge, built to link sparsely populated areas or to ensure continuity
of the pedestrian footpath in motorway or express lane areas. | NO |


| Comfort level | Description |
| --- | --- |
| Maximum | Accelerations undergone by the structure are practically imperceptible to the users. |
| Average | Accelerations undergone by the structure are merely perceptible to the users. |
| Minimum | Under loading configurations that seldom occur, accelerations undergone by the structure
are perceived by the users, but do not become intolerable. |


Footbridge calculated according Sétra guide
1.4. Determination of frequencies
For class I to III footbridges, it is necessary to determine the structure's natural vibration frequencies in all three
directions. These are determined for two mass hypotheses: an empty footbridge and a footbridge loaded over its entire
surface, with a pedestrian weighing 700 N per square meter (70 kg/m²).
The Sétra guide distinguishes 4 ranges of resonance:
• Range 1: maximum risk of resonance
• Range 2: medium risk of resonance
• Range 3: low risk of resonance for standard loading situations
• Range 4: negligible risk of resonance
Sétra guide Tables 2.1, 2.2, 2.3 and 2.4
6 BV -2025/03/03

Chapter 1: Methodology
Depending on the class of the bridge and the ranges of natural frequencies, a dynamic calculation of the structure must
be carried out for specific load cases:
• Case No. 1: Sparse and dense crowd
• Case No. 2: Very dense crowd
• Case No. 3: Crowd complement (2nd harmonic)
Sétra guide Table 2.5: Verifications – load cases under consideration
BV – 2025/03/03 7

Footbridge calculated according Sétra guide
1.5. Dynamic analysis
When the previous step leads to the need for dynamic calculations, these should be carried out as described below. An
example of how to integrate them into SCIA Engineer will be described in the next chapter.
1.5.1. Case 1: sparse and dense crowd
The density «d» of the crowd of pedestrians to be considered depends on the class of the footbridge:
• Class III: d = 0.5 pedestrians/m²
• Class II: d = 0.8 pedestrians/m²
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians involved is therefore:
N = S * d
pedestrian
The number of equivalent pedestrians, i.e. the number of pedestrians who, being all at the same frequency and in
phase, would produce the same effects as random pedestrians, in frequency and in phase is:
(cid:20)/(cid:22)
10.8∗ (cid:7)ξ∗N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)(cid:19)
The load that is to be taken into account is modified by a minus factor ψ which makes allowance for the fact that the
risk of resonance in a footbridge becomes less likely the further away from the range 1.7 Hz – 2.1 Hz for vertical
accelerations, and 0.5 Hz – 1.1 Hz for horizontal accelerations. This factor falls to 0 when the footbridge frequency is
less than 1 Hz for the vertical action and 0.3 Hz for the horizontal action. In the same way, beyond 2.6 Hz for the vertical
action and 1.3 Hz for the horizontal action, the factor cancels itself out. In this case, however, the second harmonic of
pedestrian walking must be examined.
The table below summarises the load per unit area to be applied for each direction of vibration, for any random crowd:
Direction Load per m²
ξ
(cid:20)
(cid:22)
d∗(cid:24)280N(cid:26)∗cos(cid:24)2πf t(cid:26)∗10.8∗" # ∗ψ
N
ξ
(cid:20)
(cid:22)
d∗(cid:24)140N(cid:26)∗cos(cid:24)2πf&t(cid:26)∗10.8∗" # ∗ψ
N
ξ
(cid:20)
(cid:22)
d∗(cid:24)35N(cid:26)∗cos(cid:24)2πf(cid:14)t(cid:26)∗10.8∗" # ∗ψ
With: N
• critical damping ratio (no unit)
• ξn number of pedestrians on the footbridge (d x S)
In SCIA Engineer, we sometimes speak of relative damping, sometimes of logarithmic decrement. The relationship
between the two is given here:
For example:
• Decrement 0.056  damping 0.89%
• Decrement 0.252  damping 0.04%
• Decrement 1.980  damping 0.30%
The loads must be applied to the entire gangway, and the sign of the amplitude of the force must be chosen at every
point to produce the maximum effect: the direction of the loading must therefore be the same as the direction of the
modal deformation, and must be reversed each time the modal deformation changes direction.
8 BV -2025/03/03

| Direction | Load per m² |
| --- | --- |
| Vertical (v) | (cid:20)
ξ (cid:22)
d∗(cid:24)280N(cid:26)∗cos(cid:24)2πf t(cid:26)∗10.8∗" # ∗ψ |
| Longitudinal (l) | N
(cid:20)
ξ (cid:22)
d∗(cid:24)140N(cid:26)∗cos(cid:24)2πf&t(cid:26)∗10.8∗" # ∗ψ |
| Transversal (t) | N
(cid:20)
ξ (cid:22)
d∗(cid:24)35N(cid:26)∗cos(cid:24)2πf(cid:14)t(cid:26)∗10.8∗" # ∗ψ |


Chapter 1: Methodology
1.5.2. Case 2: very dense crowd
The pedestrian crowd density «d» to be considered is set at 1 pedestrian per m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
It is considered that the pedestrians are all at the same frequency and have random phases. In this case, the number of
pedestrians all in phase equivalent to the number of pedestrians in random phases (N ) is:
pedestrian
1.85∗ )N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
The second minus factor, ψ, because of the uncertainty of the coincidence between the frequency of stresses created
by the crowd and the natural frequency of the construction, is defined by the figure below according to the natural
frequency of the mode under consideration, for vertical and longitudinal vibrations on the one hand (image left), and
transversal on the other (image right).
Sétra guide Figure 2.3 : Factor ψ in the case of walking
The following table summarises the load to be applied per unit of area for each vibration direction.
Direction Load per m²
1
(cid:20)
(cid:22)
1.0∗(cid:24)280N(cid:26)∗cos(cid:24)2πf t(cid:26)∗1.85∗" # ∗ψ
N
1
(cid:20)
(cid:22)
1.0∗(cid:24)140N(cid:26)∗cos(cid:24)2πf&t(cid:26)∗1.85∗" # ∗ψ
N
1
(cid:20)
(cid:22)
1.0∗(cid:24)35N(cid:26)∗cos(cid:24)2πf(cid:14)t(cid:26)∗1.85∗" # ∗ψ
N
1.5.3. Case 3: crowd complement
This case is similar to cases 1 and 2, but considers the second harmonic of the stresses caused by pedestrians walking,
located, on average, at double the frequency of the first harmonic.
The density «d» of the crowd of pedestrians to be considered depends on the class of the footbridge:
• Class II: d = 0.8 pedestrians/m²
• Class I: d = 1.0 pedestrians/m²
This crowd is considered to be uniformly distributed.
The individual force exerted by a pedestrian is reduced to 70 N vertically, 7 N transversally and 35 N longitudinally
For category II footbridges, allowance is made for the random character of the frequencies and of the pedestrian
phases, as for load case No. 1.
For category I footbridges, allowance is made for the random character of the pedestrian phases only, as for load case
No. 2.
BV – 2025/03/03 9

| Direction | Load per m² |
| --- | --- |
| Vertical (v) | (cid:20)
1 (cid:22)
1.0∗(cid:24)280N(cid:26)∗cos(cid:24)2πf t(cid:26)∗1.85∗" # ∗ψ |
| Longitudinal (l) | N
(cid:20)
1 (cid:22)
1.0∗(cid:24)140N(cid:26)∗cos(cid:24)2πf&t(cid:26)∗1.85∗" # ∗ψ |
| Transversal (t) | N
(cid:20)
1 (cid:22)
1.0∗(cid:24)35N(cid:26)∗cos(cid:24)2πf(cid:14)t(cid:26)∗1.85∗" # ∗ψ |


Footbridge calculated according Sétra guide
The second minus factor, ψ, because of the uncertainty of the coincidence between the frequency of stresses created
by the crowd and the natural frequency of the construction, is given by figure 2.4 according to the natural frequency of
the mode under consideration, for vertical and longitudinal vibrations on the one hand (image left), and transversal on
the other (image right).
Sétra guide Figure 2.4 : Factor ψ
1.5.4. Remarks
If the above calculations do not provide sufficient proof, the project is to be re-started if it concerns a new footbridge, or
steps to be taken if it concerns an existing footbridge (installation or not of dampers).
The modification of the natural frequencies is the most sensible way of resolving vibration problems in a construction.
However, in order to modify the natural frequencies of a construction significantly, it is very often necessary to carry out
extensive structural modifications so as to increase the stiffness of the construction.
Most of the time, a way of increasing the natural frequencies is sought, so that the first mode, and thus all the following
modes, are outside the range of risk. In certain cases, when the frequency of the first mode is low, but within the range
of risk, and that of the second mode is sufficiently high, it may be advantageous to reduce the frequencies so as to bring
the first mode below the range at risk, provided that the second mode remains above that range.
However, this is not very satisfactory. In addition, by reducing the rigidity of the construction, it becomes more flexible
and static deflection is increased.
10 BV -2025/03/03


## Sayfa 11

Chapter 2: Example 1 – Warren footbridge
Chapter 2: Example 1 - WARREN footbridge
The example given in this chapter is taken from article A.5.1.1 of the Sétra guide, with the missing data chosen
independently. The results are therefore close to those given in the guide, but are not exactly the same.
2.1. Assumptions
The structure studied is a Warren-type lateral beam footbridge. It’s a mixed steel-concrete framework forming one
independent bay with a span of 38.85 m. The longitudinal profile is curved to a radius of 450 metres.
Sétra guide Figure 5.1 : Warren-type lateral beam footbridge
The framework is formed from two triangulated lateral beams. These beams, of a constant depth of 1.215 m, are linked
by floor beams located at the level of the bottom member. A precast reinforced concrete slab, 10 cm thick, bears on
these floor beams.
The distance between the centre lines of the beams is 2.90 m, giving a width of passage for pedestrians of 2.50 m
Sétra guide Figure 5.2 : Cross-section of the lateral beam footbridge
This structure was modelled in the software SCIA Engineer:
BV – 2025/03/03 11

Footbridge calculated according Sétra guide
The supports are:
• Sn1: hinged
• Sn2: hinged + free for X translation
• Sn3: hinged + free for Y translation
• Sn4: hinged + free for X and Y translations
The used cross-sections are specified below:
• For the chords: RHS(200;400;12;7;2)
• For the diagonals: CHS139.7x10
• For the deck members (at each connection of the diagonal and the bottom chord): IPE100
The following properties are defined for the curved concrete slabs:
12 BV -2025/03/03

Chapter 2: Example 1 – Warren footbridge
2.2. Footbridge of class III
First of all, we will consider class III, in other words a normally-used footbridge that can sometimes be crossed by large
groups, but never loaded over its whole area.
2.2.1. Calculation of the natural modes
For class III, we are interested in a sparse crowd, where the density d of the crowd is equal to 0.5 pedestrians/m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians on the footbridge is:
N = S * d = (38.85 m * 2.5 m) * 0.5 = 48.6
pedestrian
The total mass of the pedestrians is:
70 kg/m² * 48.6 = 3402 kg
The linear density of the pedestrians is:
3402 kg / 38.85 m = 87.6 kg/ml
In SCIA Engineer, two load cases are created:
• A first self weight load case
• A second variable load case, with a load equal to 3402 kg / (38.85 m * 2.5 m) = 35 kg/m² (or 0.34 kN/m²),
uniformly distributed over the deck:
Two mass groups are created, each one linked to the self weight and variable load cases respectively:
BV – 2025/03/03 13

Footbridge calculated according Sétra guide
Then two combinations of mass groups are created:
• One corresponding with an empty footbridge: CM1
• The other one corresponding with a loaded footbridge: CM2
Let's calculate the natural frequencies (Main menu > Tools > Calculation & Mesh > Calculate) and check the Calculation
protocol (Main menu > Results > Calculation protocol) for the Eigen frequency.
Note that the mesh setting have an impact on the modal analysis. In our analysis we calculated with
• Average number of 1D mesh elements on straight 1D members: 5
• Average size of 1D mesh element on curved 1D members: 0.2 m
• Average size of 2D mesh element: 0.5 m
For vertical vibrations, we obtain :
• for the combination of mass groups CM1 (empty footbridge):
• for the combination of mass groups CM2 (loaded footbridge):
For the first vertical excitation mode, the frequencies are 2.16 Hz and 2.08 Hz.
For the second vertical excitation mode, the frequencies are 10.86 Hz and 10.49 Hz.
So only the first mode (range 1 or 2) is likely to generate uncomfortable vibrations, the second mode being in range 4:
Sétra guide Tables 2.1 and 2.3
14 BV -2025/03/03

Chapter 2: Example 1 – Warren footbridge
2.2.2. Calculation of the dynamic load of the pedestrians
We will calculate the load for the first mode only, with a critical damping ratio of 0.6% (mixed deck). A damping of 0.006
is equivalent to a logarithmic decrement of 0.037.
The surface load to be taken into account for the vertical modes is:
ξ
d∗(cid:24)280*N+(cid:26)∗cos(cid:24)2πf t(cid:26)∗10.8∗ , ∗ψ
N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
0.006
0.5∗(cid:24)280*N+(cid:26)∗cos(cid:24)2π∗2.08∗t(cid:26)∗10.8∗ , ∗1
48.6
is equal to 1, as the frequency of the first1 m6o.8d∗e,c wohs(cid:24)ic2hπ is∗ 22.0.088 H∗z,t (cid:26)is* Nw⁄itmhin²+ range 1 (1.7 to 2.1 Hz) with a maximum risk
ψof causing resonance.
In SCIA Engineer:
• the harmonic part (cosine) of the above load will be entered using a harmonic load case.
• the value of 16.8 N/m² will be entered as a free surface load of 1.71 kg/m² (or 0.0168 kN/m²) on the slabs
the load will be entered downwards because the deformation of mode 1 is downwards along its entire length.
BV – 2025/03/03 15

Footbridge calculated according Sétra guide
On our webhelp you can find more detailed information about the possibilities and settings for the harmonic load cases
(e.g. harmonic range, methods full harmonic versus modal superposition, constant and Rayleigh damping,…):
https://help.scia.net/25.0/en/#analysis/modal_analysis_and_dynamics_and_seismicity/dynamics_basics/harmonic_loa
d_cases.htm
2.2.3. Calculation of dynamic responses
After linear analysis (and modal analysis for the natural frequencies), the acceleration at the nodes can be displayed, for
example at node N12:
The maximum acceleration is 3.03 m/s². The Sétra guide gives a value of 2.91 m/s².
This maximum acceleration calculated is located within range 4 of the accelerations, in other words at an unacceptable
comfort level (acceleration > 2.5 m/s²).
The structure therefore needs to be redesigned.
We can also look at the displacement of this same node under the harmonic load case:
The result is 17.8 mm
16 BV -2025/03/03

Chapter 2: Example 1 – Warren footbridge
The displacement of 17.8 mm can be compared with the static load case created for the combination of modal masses:
It should be noted that the dynamic case greatly amplifies this displacement, particularly when the frequency is in a range
where there is a significant risk of resonance.
By way of illustration, we could duplicate the case of harmonic loads and define other frequencies around the one
under study, for example:
Then we can group all these harmonic cases into a result class:
BV – 2025/03/03 17

Footbridge calculated according Sétra guide
Then we can look at the displacement of node N12 for this result class:
We see a peak in displacement (and acceleration) with the frequency in the range where there is a significant risk of the
bridge resonating.
18 BV -2025/03/03

Chapter 2: Example 1 – Warren footbridge
2.3. Footbridge of class II
We will next consider class II, in other words an urban footbridge linking populated zones, subjected to a high level of
traffic and likely, on occasions, to be loaded over its whole area.
2.3.1. Calculation of the natural modes
For class II, we are interested in a dense crowd, where the density d of the crowd is equal to 0.8 pedestrians/m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians on the footbridge is:
N = S * d = (38.85 m * 2.5 m) * 0.8 = 77.7
pedestrian
The total mass of the pedestrians is:
70 kg/m² * 77.7 = 5439 kg
The linear density of the pedestrians is:
5439 kg / 38.85 m = 140 kg/ml
In SCIA Engineer, two load cases are considered:
• A first self weight load case
• A third variable load case, with a load equal to 5439 kg / (38.85 m * 2.5 m) = 56 kg/m² (or 0.55 kN/m²), uniformly
distributed over the deck:
A new mass group MG3 is created, which corresponds with a variable load under class II:
We create a new combination of mass groups CM3 which contains MG3:
Let's calculate the natural frequencies and check the Calculation protocol for the Eigen frequency.
For vertical vibrations, we obtain :
• for the combination of mass groups CM1 (empty footbridge):
BV – 2025/03/03 19

Footbridge calculated according Sétra guide
• for the combination of mass groups CM3 (loaded footbridge):
For the first vertical excitation mode, the frequencies are 2.16 Hz and 2.03 Hz.
For the second vertical excitation mode, the frequencies are 10.86 Hz and 10.56 Hz.
So only the first mode (range 1 or 2) is likely to generate uncomfortable vibrations, the second mode being in range 4:
Sétra guide Tables 2.1 and 2.3
2.3.2. Calculation of the dynamic load of the pedestrians
We will calculate the load for the first mode only, with a critical damping ratio of 0.6% (mixed deck). A damping of 0.006
is equivalent to a logarithmic decrement of 0.037.
The surface load to be taken into account for the vertical modes is:
ξ
d∗(cid:24)280*N+(cid:26)∗cos(cid:24)2πf t(cid:26)∗10.8∗ , ∗ψ
N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
0.006
0.8∗(cid:24)280*N+(cid:26)∗cos(cid:24)2π∗2.03∗t(cid:26)∗10.8∗ , ∗1
77.7
is equal to 1, as the frequency of the first2 m1o.3de∗,c wohs(cid:24)ic2hπ is∗ 22.0.033 H∗z,t (cid:26)is* Nw⁄itmhin²+ range 1 (1.7 to 2.1 Hz) with a maximum risk
ψof causing resonance.
In SCIA Engineer:
• the harmonic part (cosine) of the above load will be entered using a harmonic load case.
• the value of 21.3 N/m² will be entered as a free surface load of 2.17 kg/m² (or 0.0213 kN/m²) on the slabs
20 BV -2025/03/03


## Sayfa 21

Chapter 2: Example 1 – Warren footbridge
2.3.3. Calculation of dynamic responses
After linear analysis (and modal analysis for the natural frequencies), the acceleration at the nodes can be displayed, for
example at node N12:
The maximum acceleration is 3.91 m/s². The Sétra guide gives a value of 3.53 m/s².
This maximum acceleration calculated is located within range 4 of the accelerations, in other words at an unacceptable
comfort level (acceleration > 2.5 m/s²).
The structure therefore needs to be redesigned.
BV – 2025/03/03 21

Footbridge calculated according Sétra guide
2.4. Footbridge of class I
We will finally consider class I, in other words an urban footbridge linking zones with high concentrations of pedestrians
(presence of a station, for example), or frequently used by dense crowds (demonstrations, tourists, etc.), subjected to a
very high level of traffic.
2.4.1. Calculation of the natural modes
For class I, we are interested in a very dense crowd, where the density d of the crowd is equal to 1.0 pedestrian/m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians on the footbridge is:
N = S * d = (38.85 m * 2.5 m) * 1.0 = 97
pedestrian
The total mass of the pedestrians is:
70 kg/m² * 97 = 6790 kg
The linear density of the pedestrians is:
6790 kg / 38.85 m = 174.8 kg/ml
In SCIA Engineer, two load cases are considered:
• A first self weight load case
• A fourth variable load case, with a load equal to 6790 kg / (38.85 m * 2.5 m) = 70 kg/m² (or 0.69 kN/m²), uniformly
distributed over the deck:
A new mass group MG4 is created, which corresponds with a variable load under class I:
We create a new combination of mass groups CM4 which contains MG4:
22 BV -2025/03/03

Chapter 2: Example 1 – Warren footbridge
Let's calculate the natural frequencies and check the Calculation protocol for the Eigen frequency.
For vertical vibrations, we obtain :
• for the combination of mass groups CM1 (empty footbridge):
• for the combination of mass groups CM4 (loaded footbridge):
For the first vertical excitation mode, the frequencies are 2.16 Hz and 2.00 Hz.
For the second vertical excitation mode, the frequencies are 10.86 Hz and 10.46 Hz.
So only the first mode (range 1 or 2) is likely to generate uncomfortable vibrations, the second mode being in range 4:
Sétra guide Tables 2.1 and 2.3
2.4.2. Calculation of the dynamic load of the pedestrians
We will calculate the load for the first mode only, with a critical damping ratio of 0.6% (mixed deck). A damping of 0.006
is equivalent to a logarithmic decrement of 0.037.
The surface load to be taken into account for the vertical modes is:
1
d∗(cid:24)280*N+(cid:26)∗cos(cid:24)2πf t(cid:26)∗1.85∗ , ∗ψ
N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
1
1.0∗(cid:24)280*N+(cid:26)∗cos(cid:24)2π∗2.00∗t(cid:26)∗1.85∗ , ∗1
97
is equal to 1, as the frequency of the first5 m2o.6de∗,c wohs(cid:24)ic2hπ is∗ 22.0.000 H∗z,t (cid:26)is* Nw⁄itmhin²+ range 1 (1.7 to 2.1 Hz) with a maximum risk
ψof causing resonance.
In SCIA Engineer:
• the harmonic part (cosine) of the above load will be entered using a harmonic load case.
• the value of 52.6 N/m² will be entered as a free surface load of 5.36 kg/m² (or 0.0526 kN/m²) on the slabs
BV – 2025/03/03 23

Footbridge calculated according Sétra guide
2.4.3. Calculation of dynamic responses
After linear analysis (and modal analysis for the natural frequencies), the acceleration at the nodes can be displayed, for
example at node N12:
The maximum acceleration is 9.40 m/s². The Sétra guide gives a value of 8.55 m/s².
This maximum acceleration calculated is located within range 4 of the accelerations, in other words at an unacceptable
comfort level (acceleration > 2.5 m/s²).
24 BV -2025/03/03

Chapter 2: Example 1 – Warren footbridge
2.5. Conclusion
It can be seen that the accelerations are always higher than 2.5 m/s², whatever class is selected.
In order to reduce the accelerations obtained, the stiffness of the construction must be increased. To do this, the depth
of the triangulated lateral beams can be increased (for example by 20 cm) and the thickness of the sheet metal of the
members also increased (for example 14 mm).
Réf: Sétra guide figure A.5.3 of
The natural mass of the deck is slightly increased, but that is not significant.
The frequencies of the first modes are modified in the following way (empty and charged):
• Class III: 2.55 Hz and 2.46 Hz
• Class II: 2.55 Hz and 2.41 Hz
• Class I: 2.55 Hz and 2.37 Hz
The extreme frequencies for class III does not lead to any calculation, as this frequency is outside range 2 (1.7 Hz – 2.1
Hz).
For class I and II, calculations are necessary, but with a coefficient ψ =0.21 for class I and ψ =0.16 for class II.
This leads to the following accelerations:
• 0.56 m/s² for class II (the Sétra guide obtains a value of 0.55 m/s²), which is compatible with a medium comfort
level, and almost maximum (0.50 m/s²).
• 1.81 m/s² for class I (the Sétra guide obtains a value of 1.78 m/s²), which is compatible with a minimum comfort
level (1 – 2.5m/s²).
To make this footbridge even more comfortable, it would be possible, for example, to increase the thickness of the sheet
metal to 16 mm so that the natural frequencies are greater than 2.6 Hz. The coefficient ψ is then zero. In this case, the
second harmonic of the pedestrians must be taken into account, but if it stays around 2.6 Hz, it should not cause any
problems.
BV – 2025/03/03 25

Footbridge calculated according Sétra guide
Chapter 3: Example 2 – Box-girder footbridge
The example given in this chapter is taken from article A.5.1.2 of the Sétra guide, with the missing data chosen
independently. The results are therefore close to those given in the guide, but are not exactly the same.
3.1. Assumptions
The footbridge studied is a steel box girder with two bays, each of 40 m, with concrete deck topping.
Sétra guide Figure 5.4 : Steel box girder footbridge
The framework is formed from a steel box girder of a constant depth of 1 metre. A 10 cm thick pre-cast reinforced
concrete slab bears on this girder. The width of the slab is 4.00 m, the width for pedestrian passage is 3.50 m.
This structure was modelled in SCIA Engineer:
A general cross-section is used for modelling the section of the bridge:
The supports are:
• Sn1: hinged
• Sn2: hinged
• Sn3: hinged + free for X translation
26 BV -2025/03/03

Chapter 3: Example 2 – Box-girder footbridge
3.2. Footbridge of class III
First of all, we will consider class III, in other words a normally-used footbridge that can sometimes be crossed by large
groups, but never loaded over its whole area.
3.2.1. Calculation of the natural modes
For class III, we are interested in a sparse crowd, where the density d of the crowd is equal to 0.5 pedestrians/m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians on the footbridge is:
N = S * d = (2 * 40 m * 3.5 m) * 0.5 = 140
pedestrian
The total mass of the pedestrians is:
70 kg/m² * 140 = 9800 kg
The linear density of the pedestrians is:
9800 kg / 80 m = 122.5 kg/ml
In SCIA Engineer, two load cases are created:
• A first self weight load case
• A second variable load case, with a line load equal to 122.5 kg/m (or 1.20 kN/m), uniformly distributed over the
deck:
Two mass groups are created, each one linked to the self weight and variable load cases respectively:
Then two combinations of mass groups are created:
• One corresponding with an empty footbridge: CM1
• The other one corresponding with a loaded footbridge: CM2
BV – 2025/03/03 27

Footbridge calculated according Sétra guide
Let's calculate the natural frequencies (Main menu > Tools > Calculation & Mesh > Calculate) and check the Calculation
protocol (Main menu > Results > Calculation protocol) for the Eigen frequency.
Note that the mesh setting ‘Average number of 1D mesh elements’ has an impact on the modal analysis. In our analysis
we calculated with 10 mesh elements.
For vertical vibrations, we obtain :
• for the combination of mass groups CM1 (empty footbridge):
• for the combination of mass groups CM2 (loaded footbridge):
For the first vertical excitation mode, the frequencies are 1.96 Hz and 1.91 Hz.
For the second vertical excitation mode, the frequencies are 3.02 Hz and 2.94 Hz.
These two modes are vertical excitation modes, although it’s small for the first mode since the signs are opposite:
So the first mode is around 1.94 Hz, so we are in range 1 with a high risk of resonance.
The second mode is around 2.98 Hz, which is in range 3, so a calculation isn’t required.
Sétra guide Tables 2.1 and 2.3
28 BV -2025/03/03

Chapter 3: Example 2 – Box-girder footbridge
Sétra guide Table 2.5
3.2.2. Calculation of the dynamic load of the pedestrians
We will calculate the load for the first mode only, with a critical damping ratio of 0.6% (mixed deck). A damping of 0.006
is equivalent to a logarithmic decrement of 0.037.
The surface load to be taken into account for the vertical modes is:
ξ
d∗(cid:24)280*N+(cid:26)∗cos(cid:24)2πf t(cid:26)∗10.8∗ , ∗ψ
N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
0.006
0.5∗(cid:24)280*N+(cid:26)∗cos(cid:24)2π∗1.94∗t(cid:26)∗10.8∗ , ∗1
140
is equal to 1, as the frequency of the first9 m.9o4de∗,c wohs(cid:24)ic2hπ is∗ 11.9.944 H∗z,t (cid:26)is* Nw⁄itmhin²+ range 1 (1.7 to 2.1 Hz) with a maximum risk
ψof causing resonance.
The linear load is
9.94∗3.5 m∗cos(cid:24)2π∗1.94∗t(cid:26)*N⁄ m+
34.79∗cos(cid:24)2π∗1.94∗t(cid:26)*N⁄m+
BV – 2025/03/03 29

Footbridge calculated according Sétra guide
In SCIA Engineer:
• the harmonic part (cosine) of the above load will be entered using a harmonic load case
• the value of 34.79 N/m will be entered as line load
for the sign of the harmonic loads we can activate Load Signature to use the sign of the first mode.
3.2.3. Calculation of dynamic responses
After linear analysis (and modal analysis for the natural frequencies), the acceleration at the nodes can be displayed, for
example at node N30:
The maximum acceleration is 0.55 m/s².
This maximum acceleration calculated is located within range 2 of the accelerations, in other words at an average comfort
level (acceleration between 0.5 and 1 m/s²).
30 BV -2025/03/03


## Sayfa 31

Chapter 3: Example 2 – Box-girder footbridge
3.3. Footbridge of class II
We will next consider class II, in other words an urban footbridge linking populated zones, subjected to a high level of
traffic and likely, on occasions, to be loaded over its whole area.
3.3.1. Calculation of the natural modes
For class II, we are interested in a dense crowd, where the density d of the crowd is equal to 0.8 pedestrians/m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians on the footbridge is:
N = S * d = (2 * 40 m * 3.5 m) * 0.8 = 224
pedestrian
The total mass of the pedestrians is:
70 kg/m² * 224 = 15680 kg
The linear density of the pedestrians is:
15680 kg / 80 m = 196 kg/ml
In SCIA Engineer, two load cases are considered:
• A first self weight load case
• A third variable load case, with a load equal to 196 kg/m (or 1.92 kN/m), uniformly distributed over the deck:
A new mass group MG3 is created, which corresponds with a variable load under class II:
We create a new combination of mass groups CM3 which contains MG3:
Let's calculate the natural frequencies and check the Calculation protocol for the Eigen frequency.
For vertical vibrations, we obtain :
• for the combination of mass groups CM1 (empty footbridge):
BV – 2025/03/03 31

Footbridge calculated according Sétra guide
• for the combination of mass groups CM3 (loaded footbridge):
For the first vertical excitation mode, the frequencies are 1.96 Hz and 1.88 Hz.
For the second vertical excitation mode, the frequencies are 3.02 Hz and 2.90 Hz.
So the first mode is around 1.92 Hz, so we are in range 1 with a high risk of resonance.
The second mode is around 2.96 Hz, which is in range 3, where the calculation is required with the application of case 3
(for a class II).
Sétra guide Tables 2.1 and 2.3
Sétra guide Table 2.5
3.3.2. Calculation of the dynamic load of the pedestrians
We will calculate the load for the first mode only, with a critical damping ratio of 0.6% (mixed deck). A damping of 0.006
is equivalent to a logarithmic decrement of 0.037.
The surface load to be taken into account for the vertical modes is:
ξ
d∗(cid:24)280*N+(cid:26)∗cos(cid:24)2πf t(cid:26)∗10.8∗ , ∗ψ
N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
0.006
0.8∗(cid:24)280*N+(cid:26)∗cos(cid:24)2π∗1.92∗t(cid:26)∗10.8∗ , ∗1
224
is equal to 1, as the frequency of the first1 m2.5od4e∗, wcohsi(cid:24)c2h πis ∗11.9.29 2H∗z, ti(cid:26)s *wNit⁄hmin² r+ange 1 (1.7 to 2.1 Hz) with a maximum risk
ψof causing resonance.
The linear load is
12.54∗3.5 m∗cos(cid:24)2π∗1.92∗t(cid:26)*N⁄ m+
43.89∗cos(cid:24)2π∗1.92∗t(cid:26)*N⁄m+
In SCIA Engineer:
• the harmonic part (cosine) of the above load will be entered using a harmonic load case
• the value of 43.89 N/m will be entered as a line load with Load Signature activated in the harmonic load case
32 BV -2025/03/03

Chapter 3: Example 2 – Box-girder footbridge
3.3.3. Calculation of dynamic responses
After linear analysis (and modal analysis for the natural frequencies), the acceleration at the nodes can be displayed, for
example at node N30:
The maximum acceleration is 0.55 m/s².
This maximum acceleration calculated is located within range 2 of the accelerations, in other words at an average comfort
level (acceleration between 0.5 and 1 m/s²).
For the second mode, the frequency of 2.96 Hz requires us to take the second harmonic into account. But, with a force
of one-quarter of that of the first harmonic, and taking into account the above acceleration result, the comfort level
obtained is maximum.
BV – 2025/03/03 33

Footbridge calculated according Sétra guide
3.4. Footbridge of class I
Finally we will consider class I, in other words an urban footbridge linking zones with high concentrations of pedestrians
(presence of a station, for example), or frequently used by dense crowds (demonstrations, tourists, etc.), subjected to a
very high level of traffic.
3.4.1. Calculation of the natural modes
For class II, we are interested in a dense crowd, where the density d of the crowd is equal to 1.0 pedestrians/m².
This crowd is considered to be uniformly distributed over the total area of the footbridge ‘S’.
The number of pedestrians on the footbridge is:
N = S * d = (2 * 40 m * 3.5 m) * 1.0 = 280
pedestrian
The total mass of the pedestrians is:
70 kg/m² * 280 = 19600 kg
The linear density of the pedestrians is:
19600 kg / 80 m = 245 kg/ml
In SCIA Engineer, two load cases are considered:
• A first self weight load case
• A fourth variable load case, with a load equal to 245 kg/m (or 2.40 kN/m), uniformly distributed over the deck:
A new mass group MG4 is created, which corresponds with a variable load under class I:
We create a new combination of mass groups CM4 which contains MG4:
Let's calculate the natural frequencies and check the Calculation protocol for the Eigen frequency.
For vertical vibrations, we obtain :
• for the combination of mass groups CM1 (empty footbridge):
34 BV -2025/03/03

Chapter 3: Example 2 – Box-girder footbridge
• for the combination of mass groups CM4 (loaded footbridge):
For the first vertical excitation mode, the frequencies are 1.96 Hz and 1.87 Hz.
For the second vertical excitation mode, the frequencies are 3.02 Hz and 2.87 Hz.
So the first mode is around 1.92 Hz, so we are in range 1 with a high risk of resonance.
The second mode is around 2.96 Hz, which is in range 3, where the calculation is required with the application of case 3
(for a class I).
Sétra guide Tables 2.1 and 2.3
Sétra guide Table 2.5
3.4.2. Calculation of the dynamic load of the pedestrians
We will calculate the load for the first mode only, with a critical damping ratio of 0.6% (mixed deck). A damping of 0.006
is equivalent to a logarithmic decrement of 0.037.
The surface load to be taken into account for the vertical modes is:
1
d∗(cid:24)280*N+(cid:26)∗cos(cid:24)2πf t(cid:26)∗1.85∗ , ∗ψ
N(cid:10)(cid:11)(cid:12)(cid:11)(cid:13)(cid:14)(cid:15)(cid:16)(cid:17)(cid:18)
1
1.0∗(cid:24)280*N+(cid:26)∗cos(cid:24)2π∗1.92∗t(cid:26)∗1.85∗ , ∗1
280
is equal to 1, as the frequency of the first3 m0.9od6e∗, wcohsi(cid:24)c2h πis ∗11.9.29 2H∗z, ti(cid:26)s *wNit⁄hmin² r+ange 1 (1.7 to 2.1 Hz) with a maximum risk
ψof causing resonance.
The linear load is
30.96∗3.5 m∗cos(cid:24)2π∗1.92∗t(cid:26)*N⁄ m+
108.35∗cos(cid:24)2π∗1.92∗t(cid:26)*N⁄m+
In SCIA Engineer:
• the harmonic part (cosine) of the above load will be entered using a harmonic load case
• the value of 108.35 N/m will be entered as a line load with Load Signature activated in the harmonic load case
BV – 2025/03/03 35

Footbridge calculated according Sétra guide
3.4.3. Calculation of dynamic responses
After linear analysis (and modal analysis for the natural frequencies), the acceleration at the nodes can be displayed, for
example at node N30:
The maximum acceleration is 0.93 m/s².
This maximum acceleration calculated is located within range 2 of the accelerations, in other words at an average comfort
level (acceleration between 0.5 and 1 m/s²).
For the second mode, the frequency of 2.96 Hz requires us to take the second harmonic into account. But, with a force
of one-quarter of that of the first harmonic, and taking into account the above acceleration result, the comfort level
obtained is average.
3.5. Conclusion
We can see that the accelerations are always between 0.5 and 1 m/s², whatever the class chosen.
If average comfort is selected, then everything is in order.
If maximum comfort is selected, the project will have to be modified.
In order to reduce the accelerations obtained, the stiffness of the construction must be increased. To do this, the depth
of the box girder can be increased (for example by 40 cm).
36 BV -2025/03/03

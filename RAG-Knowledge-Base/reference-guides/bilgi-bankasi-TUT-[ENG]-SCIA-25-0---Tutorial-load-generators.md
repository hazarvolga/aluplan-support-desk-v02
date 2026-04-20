# TUT [ENG] SCIA 25.0 - Tutorial load generators

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [ENG] SCIA 25.0 - Tutorial load generators-ky8ee780xoi.pdf`

---

**Toplam Sayfa:** 95


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
Load generators

Tutorial – Load generators
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2024 SCIA nv. All rights reserved.
2

Table of contents
Table of Contents
Table of Contents............................................................................................................................................... 3
Introduction ......................................................................................................................................................... 5
Load panels ......................................................................................................................................................... 6
General properties ............................................................................................................................... 7
Panel type ............................................................................................................................................... 7
Load transfer direction ......................................................................................................................... 7
LCS type ................................................................................................................................................. 7
Swap orientation ................................................................................................................................... 7
LCS angle ............................................................................................................................................... 7
Selection of entities .............................................................................................................................. 7
Load transfer method ........................................................................................................................... 8
Generating loads ................................................................................................................................... 9
Panel types ............................................................................................................................................. 10
Load to panel nodes ............................................................................................................................. 10
Load to panel edges ............................................................................................................................. 12
Load to panel edges and beams ....................................................................................................... 14
Panel with parallel beams ................................................................................................................... 15
Free loads .......................................................................................................................................................... 17
Properties of a free load ..................................................................................................................... 17
Direction .................................................................................................................................................. 18
Type ......................................................................................................................................................... 18
Distribution .............................................................................................................................................. 18
Validity ..................................................................................................................................................... 18
Select ....................................................................................................................................................... 21
System ..................................................................................................................................................... 21
Example: Rectangular swimming pool ........................................................................................... 22
Example: Cylindrical tank .................................................................................................................. 25
Result: surface loads ........................................................................................................................... 26
Soil and Water pressure based on borehole ................................................................................. 28
3D wind generator ........................................................................................................................................... 31
Traffic loads ...................................................................................................................................................... 35
Example model ...................................................................................................................................... 35
Project data ............................................................................................................................................ 35
Construction ........................................................................................................................................... 35
Input traffic loads ................................................................................................................................. 36
Traffic lane .............................................................................................................................................. 36
Traffic loads generator ......................................................................................................................... 36
Mobile loads ...................................................................................................................................................... 38
Principle .................................................................................................................................................. 38
Influence lines ....................................................................................................................................... 40
Input track and unit load ...................................................................................................................... 40
Influence lines ........................................................................................................................................ 42
Load system........................................................................................................................................... 43
The construction .................................................................................................................................... 43
Input track and unit load ...................................................................................................................... 44
Input load systems ................................................................................................................................ 45
Exploitation of load systems ............................................................................................................... 46
MC – 2025/14/01 3

Tutorial – Load generators
Generation Load cases – Enveloping Load cases ........................................................................ 52
Train loads .............................................................................................................................................. 57
The construction .................................................................................................................................... 57
Input track and unit load ...................................................................................................................... 59
Influence lines ........................................................................................................................................ 62
Input load systems ................................................................................................................................ 63
Exploitation of the load systems ........................................................................................................ 65
Generate load cases – Envelope load cases ................................................................................. 67
Crane track ............................................................................................................................................. 71
The construction .................................................................................................................................... 72
Input track and unit load ...................................................................................................................... 75
Input load system .................................................................................................................................. 79
Exploitation of the load system .......................................................................................................... 80
Generation Enveloping Load Cases ................................................................................................. 83
2D wind- and snow generators (32-bit) ...................................................................................................... 85
Wind generator ...................................................................................................................................... 86
Snow generator ..................................................................................................................................... 92
Wind & Snow generator ...................................................................................................................... 94
4

Chapter 1 – Load panels
Introduction
This tutorial will explain the principles and the use of all different load generators. Most of the options in the course can
be calculated in SCIA engineer with the concept edition. For some functionalities an extra module (or edition) is
required, this will always be indicated in those paragraphs.
This tutorial assumes that basic the modelling of a structure is already understood.
MC – 2025/14/01 5

Tutorial – Load generators
Load panels
Load panels are entities which are not taken into account in the FEM calculation (Finite Element Method Calculation).
Load panels have no self-weight, have a certain stiffness to distribute loads to underlying members but this stiffness is
not taken into account in the stiffness of the structure.
All types of loads can be applied to the load panels and will be distributed to the underlying members of the load panel.
This chapter will use an example to show the different properties of the load panels. This is the file loadpanels.esa.
In all the examples a surface load of -10 kN/m² is used.
6

Chapter 1 - Load panels
General properties
You can input load panels via the input panel, the general properties are listed below.
Panel type
There are 3 types of load panels:
• Load to panel nodes
• Load to panel edges
• Load to panel edges and beams
Each of these types will be demonstrated in paragraph 1.2.
Load transfer direction
You can choose in which direction the loads should be distributed. This direction will always follow the local coordinate
system of the load panel.
• In the X-direction of the load panel
• In the Y-direction of the load panel
• In both directions of the load panel
LCS type
This property adapts the local coordinate system of the load panel, this section is completely optional, because you will
be able to turn the LCS with the property ‘LCS angle’.
Note: The load panel does not have mesh elements, therefore most of the types will behave similar to each other. More
information for 2D members and the LCS type can be found here.
Swap orientation
This function controls the direction of the local Z-axis of the panel. This direction is important when generating loads
because they will follow the direction of the local axis’ instead of the global coordinate system.
LCS angle
This function is used to rotate the x-axis of the local coordinate system and thus also the load transfer direction because
this direction uses the local coordinate system.
Selection of entities
When this property is set on ‘All’, all the nodes/edges/beams in the transfer direction will be used to distribute the
loads. If this option is set to ‘user selection’ you can use the function ‘update edge/beam selection’ to select the
nodes/edges/beams where the load can be distributed.
• Set the value on ‘user selection’
• Click ‘update edge/beam selection’
• Deselect the nodes/edges/beams where the load should not be distributed to
• End the function by pressing ‘esc’
MC – 2025/14/01 7

Tutorial – Load generators
Load transfer method
Standard:
The sum of the load is transferred to beams according to the length of individual beams and supported edges. The user
can set the weight factor for individual beams or exclude some of them (using the Beam Selection Action Button) from
load transfer.
Tributary area:
The beams are loaded based on the tributary area of the particular beam.
Tributary areas are found using Voronoi diagrams based on a member’s position to other neighbouring members. The
influence area of a member is determined, then, by scaling up the distances from the member to the boundary of the
tributary area by a factor of 2. Once scaled, any area outside the boundary of the floor to which the member is
connected will automatically be trimmed and excluded from the influence area.
Accurate (fixed link with beams/hinged link with beams):
The finite element method is used to recalculate the applied load to individual beams.
• Fixed link with beams will be similar to the tributary area method.
• Hinged link with beams
8

Chapter 1 - Load panels
Generating loads
A load applied to a load panel will be transferred to the selected elements. These transferred loads can be generated
with the action button ‘generate load’ in the properties of the load panel. The loads will be generated automatically
when calculating the project.
After generating, the original loads will be hidden and that the generated loads are shown. This is easily changed by
changing the view parameters. If you want the original loads to stay visible, you should set the generator on ‘original +
generated’.
MC – 2025/14/01 9

Tutorial – Load generators
Panel types
Load to panel nodes
A load panel with type load to panel nodes will distribute the load to the nodes of the load panel and generate point
loads. You can only transfer loads to nodes which are a part of the geometry of the load panel.
Adding nodes to the geometry of a loadpanel can be done via edit > polyline edit > add node. In this example the load
will only be transferred to the 4 corner nodes.
10


## Sayfa 11

Chapter 1 - Load panels
Load transfer method ‘standard’
The load transfer method ‘standard’ allows the user to define the weight distribution factor in the property panel. The
load will be transferred accordingly to that chosen weight.
In the image below, the weight distribution factor is set on 1 for each node, which means that each node will have the
exact same point load: -10 kN/m² x (10m * 5m) = -500kN and -500kN / 4 nodes = -125 kN / node.
In the image below, the weight distribution factor is set to 0.5 for N2 while the remaining factors are kept at 1. The
point load in node N1, N3 and N4 will be twice as large as the point load in N2.
Excluding a node can be done by changing the weight factor to zero or by changing the selection of entities as explained
in paragraph 1.1.
MC – 2025/14/01 11

Tutorial – Load generators
Load to panel edges
A load panel with type load to panel edges will distribute the load to the edges of the load panel and generate line
loads. You can only transfer a load to an edge which is (partly) supported by a beam or a 2D member edge.
Load transfer method ‘standard’
The load transfer method ‘standard’ allows the user to define the weight distribution factor in the property panel. The
load will be transferred accordingly to that chosen weight. Also the load transfer direction can be modified to exclude
certain edges. The weight factor for each example below is set to 1 for all edges.
Load transfer direction X:
Load transfer direction Y:
Load transfer direction All:
12

Chapter 1 - Load panels
Load transfer method ‘Tributary area’
The load transfer method is changed to ‘tributary area’ there is no possibility to change the weight factor anymore. The
weight will be defined with the tributary area which is generated when updating the loadpanel. will transfer the load
based on the geometry of the structure. The tributary area is visible in the graphical scene as well after updating all the
loadpanels.
Load transfer direction All:
The load transfer direction X or Y will result in the same line loads as for the standard method with the weight factor set
to 1 since the tributary areas for this geometry are equal.
Note: For this type of load panel the load transfer method ‘FEM’ is not available.
MC – 2025/14/01 13

Tutorial – Load generators
Load to panel edges and beams
A load panel with type load to panel edges and beams will distribute the load to the edges of the load panel and to the
beams or 2D member edges in the plane of the load panel. This will again generate line loads.
Max. angle for transfer
For this type of load panel only the load transfer direction X will be demonstrated since this direction will take the
beams in the plane of the load panel into account. The load transfer method ‘tributary area’ is used in this example.
Note: For this type of load panel the load transfer method ‘standard’ and ‘FEM’ are available as well.
In the property panel a new property ‘Max. angle for transfer’ will be visible. This angle will be used to include or
exclude specific beams. The default value 5 deg. will make sure that only the beams perpendicular to the load transfer
direction are taken into account. To take into account the bracings as well, you check the angle between the bearing
beams and the bracings and make sure that the max. angle is set to a higher value.
Max. angle for transfer = 5 deg (default value).
Max. angle for transfer = 45 deg.
14

Chapter 1 - Load panels
Panel with parallel beams
With this option you can directly insert a panel with supporting beams. The beams are placed in the x direction of the
panel LCS, and the load transfer direction will be the y direction of the panel LCS. To rotate the beams, you modify the
LCS angle in the properties of the panel. As an example a panel with parallel beams of the size 10m by 10m is used. A
surface load of -10 kN/m² is added.
Different from other load panel types, the panel has a thickness. This has an influence on:
• The eccentricity of the beams
• The self-weight of the panel (this was not the case for the other discussed load panels).
The position in plate (inside or outside) and the alignment (bottom, centre or top)define the placement of the beam.
MC – 2025/14/01 15

Tutorial – Load generators
The load will be transferred to the beams which are a part of the panel itself. Other beams modelled in the same plane
will not be taken into account automatically. To add other beams to the plane you use ‘update selection’. In this
example, the first and last beam are modelled separately, the loads are only transferred to these beams once ‘update
beam selection’ has been used.
You can generate the loads by clicking on ‘load generation’ or by calculating the project.
16

Chapter 2 - Free loads
Free loads
Free loads are related to 2D members, flat or curved (plates, walls, shells, load panels …).
The definition of free loads is composed of their geometry, which is independent on geometry of structural members,
direction of load effect and a list of 2D members which are influenced by the free loads. Free loads are in fact easy load
generators. A free load differs from a ‘regular load’ by the fact that it is not attributed as an additional data to a specific
2D member. Since the free load is not linked to one particular member, more loads can be generated with one free
load.
Properties of a free load
Start this chapter with modelling a plate and add a load case. Click in the input panel to start modelling
a free load on the 2D member. This free load will always be modelled as a projection in the active workplane
(XY, XZ, YZ), draw an arbitrary geometry and press escape. It can be necessary to move the UCS and
change the active workplane.
MC – 2025/14/01 17

Tutorial – Load generators
Direction
This is the direction in which the load should act. This is always according to X, Y or Z.
Type
In this case, the load will be introduced as a force. Depending on the loadcase also selfweight and wind are available.
Distribution
Both a uniform load or a variable load can be used.
Uniform: one constant value for the complete surface load.
Dir X: a variable course of the free surface load in the direction X of the member LCS.
Dir Y: a variable course of the free surface load in the direction Y of the member LCS.
3 points: a variable course of the free surface, according to 3 points chosen by the user.
Note: When a variable load is modelled you will need to give two different values for the applied load. The first load will
be applied in the first node that is drawn, the second load will be applied in the second node that is drawn.
Validity
Now copy the 2D member two times above and below the original 2D member.
18

Chapter 2 - Free loads
A free load can generate loads on different 2D members at once. To define where the load should be generated you
need to set the right validity.
When a free load is generated, it will use a projection to apply the loads to all existing 2D members. The validity defines
where the load should be generated.
Original load All
-Z +Z
MC – 2025/14/01 19

| Original load | All |
| --- | --- |
|  |  |
| -Z | +Z |
|  |  |


Tutorial – Load generators
-Z (incl. 0) +Z (incl.0)
Z=0 From -3m to 0m
Note: When the validity is set on ‘from .. to ..’ , this height is relative to the original load. Also be aware that a member
at exactly the given height will not be taken into account, the slab at exactly 0m is not taken into account.
20

| -Z (incl. 0) | +Z (incl.0) |
| --- | --- |
|  |  |
| Z=0 | From -3m to 0m |
|  |  |



## Sayfa 21

Chapter 2 - Free loads
Select
It is also possible to manually select the members on which the load should be generated. There are two options:
• Auto: all the elements, which correspond with the validity, will be loaded.
• Select: The user can select the elements, which correspond with the validity, to be loaded.
The selection can be modified by using the action ‘update 2D members selection’.
System
Depending on the set coordinate system the load reacts differently when generated.
• GCS: the direction of the load according to the GCS (Global Coordinate System)
• Member LCS: the direction of the load according to the member LCS (Local Coordinate System)
• Load LCS: the direction of the load according to the load LCS. The load LCS is defined based on the active UCS
when modelling the free surface load.
To demonstrate this you can change the view parameters and show the local coordinate system of the 2D member. Set
the system of the original free load to member LCS. The original load is shown downwards with a negative value.
Now you can generate the load and you will see that the generated load has the same direction as the original free
load. This is because the LCS of the member has the same direction as the GCS.
The LCS has the same direction as the GCS
MC – 2025/14/01 21

Tutorial – Load generators
Now when you select the 2D member and toggle on ‘swap orientation’, this will change the direction of the local Z axis.
The generated load will be deleted, the original load will be shown and you can generate the load again. Now you will
notice that the generated load will be in the opposite direction as the original free load.
The LCS has a different direction as the GCS
This property becomes very useful when modelling water pressure inside a tank as seen in the next example.
Note: Here you can find a video tutorial about this as well.
Example: Rectangular swimming pool
Open the project rectangular_swimmingpool.esa, in this project you find a the following model consisting of a
rectangular floor of 5m by 10m and 4 walls with a height of 3.6m. To model the water pressure, we will create a
triangular load on each wall while making use of the free surface load.
If the LCS is not visible yet, change the view parameters so the local axis of the walls and the floor are visible.
22

Chapter 2 - Free loads
First of all, the active workplane needs to be modified. Since the load needs to be modelled and projected on the walls
it is best to modify the UCS based on the LCS of the 2D member.
Start modelling a free load. Change the distribution, the values and the system accordingly. Instead of modelling a free
load for each wall, one original load will be used and generated on all walls at the same time. The following properties
are modified to accomplisch this
• The system needs to be set on Member LCS, so the direction of the load will always be the local Z-axis of each
wall.
• Direction is set to Z.
• Validity is set to ‘all’.
• Select is set to ‘Auto’.
To create a triangular load, the distribution is modified from ‘uniform’ to Dir Y and the values are set. The value is 0
kN/m² on the top and for example -25kN/m² on the bottom of the wall.
The free load will be projected in the active workplane. The application of q1 and q2 is based on which node you model
first. Therefor, start modelling on top of the wall.
MC – 2025/14/01 23

Tutorial – Load generators
Generate the free load. The loads will be generated on each wall AND the floor based on the LCS. The load on the floor
is a uniform surface load.
Notice that some loads are pointed inwards, this is caused by the direction of the LCS of the 2D element. You can simply
modify the LCS of these 2D elements by selecting them and toggle on ‘swap orientation’ in the 2D properties.
Note: When modifying the orientation, keep in mind that surface supports are always modelled on the negative side of
a 2D element.
After generating the loads again, this is the final result.
24

Chapter 2 - Free loads
Example: Cylindrical tank
Similar to the previous example, a free load can also be generated on a cylindrical element. Open cylindrical_tank.esa to
find this example.
The model consists of a cylindrical element with a diameter and a height of 10m.
The needed steps are similar to the steps in the previous example:
• Move the UCS based on the LCS of the cylindrical element
• Model the free load with the same properties, use the edges of the cylindrical element
• Generate the free load, when necessary modify the LCS of the cylindrical element with ‘swap orientation’ or
modify the value of the free load.
Note: Here you can find a video tutorial for the rectangular pool and the cylindrical tank as well.
MC – 2025/14/01 25

Tutorial – Load generators
Result: surface loads
The command ‘surface loads’ which you can find in the results menu will allow you to visualize the applied surface
loads. A similar example is used as in paragraph 2.2. This model contains a rectangular swimming pool with 2D surface
supports. The water pressure inside the swimming pool is modelled with free loads.
Set the result properties. In this example we will check the surface loads applied from the free load in LC2. By default,
the LCS of each mesh element is used.
Keep in mind that the mesh size has an influence on how the surface load is applied. In the example above, the 2D
mesh size was set to 0.5m. In this selection, there are less 2D mesh elements and less than 20 different values to be
displayed, so the legenda is shown with separate values.
26

Chapter 2 - Free loads
When the mesh size is reduced, this will be reflected in the surface load results. The example is recalculated with a 2D
mesh size of 0,1m.
Since there are more 2D mesh elements and more than 20 different values that need to be displayed, the legenda is
shown as a continuous legend.
Note: This tool is only available for 2D elements, surface loads on load panels are not available in this result.
MC – 2025/14/01 27

Tutorial – Load generators
Soil and Water pressure based on borehole
Several types of load (point force, line load and surface load) can be defined as what is called "soil pressure" or "water
pressure " based on the input of boreholes.
Note: The soil-in module and the creation of boreholes is explained in the foundations manual.
In the example borehole_soil_pressure.esa a small example is created. It contains a wall modelled below Z=0 and a
borehole with the following geologic profile.
Water and soil loads can be input for the following load cases:
• action type = "permanent" and load type = "standard",
• action type = "variable" and load type = "static".
28

Chapter 2 - Free loads
A general surface load or a free surface load can be created with the following properties:
• Type is set to soil pressure
• The distribution is set to ‘uniform’ automatically
• The LCS of the member is used
• Borehole BH1 is used to define the soil pressure
the 2D surface load applied on a 2D surface of a certain shape (rectangle in case below) is visible only as offset of this
shape (inner rectangular frame in case below), because the unit of this surface load is the coefficient value. The
generated load is not visible directly. In order to view the generated load, use the result command ‘surface loads’.
Note: The same can be done for water pressure.
MC – 2025/14/01 29

Tutorial – Load generators
Soil or water pressure on a 1D element can be modelled with 1D Line loads. As an example a column with a height of
10m is modelled right next to the wall.
A line load is added to this column with the following properties. BH1 is used to define the soil pressure.
In yellow the original line load is displayed, in orange the generated values are shown directly.
30


## Sayfa 31

Chapter 3 - 3D wind generator
3D wind generator
In this chapter, the 3D wind generator will be explained. This generator is used to generate the wind loads in all
directions according to the code on closed structures. Since version 22, the possibilities of the 3D Wind-Load Generator
have been expanded in order to quickly and automatically generate wind load on the structure of Awning type and
Canopy type. The load generation is done in accordance with EN 1991-1-4:2005 (E), chapter 7.3. This automatic
generation of load is available for EC-EN (Eurocode).
Note: Here you can find the general documentation about the 3D wind generator.
Note: The 2D wind- and snow generator is not available in post processing environment ‘default’. To use these
functionalities you should use the 32-bit version of SCIA engineer. You can find more information about this in chapter
6 of this manual.
Open the example ‘3D Wind generator.esa’. The structure consists of a steel hall and is closed using load panels. To be
able to use the generator, the functionality ‘Climatic loads’ is used with the wind load according to the code (EN1991-
1-4). This functionality is only available if you have the module sens.15.en.
In the tab ‘actions’ you can choose the wind load to be according to the code or user defined. The used parameters can
be viewed and changed if necessary by clicking the three dots.
MC – 2025/14/01 31

Tutorial – Load generators
The load panels are of the type To panel edges and beams. Since these load panels will be used for the distribution of
the wind load into line loads on the columns/beams, the option 3D Wind will be marked in the properties of the panels.
This will add 3D wind data to each loadpanel.
The arrow that represents the wind data needs to be pointed outwards. For the panels where the wind data is pointing
inwards, the orientation can be modified in the Wind data itself by enabling ‘swap outer surface’. The Wind data for the
load panels on the roof should be modified as well. By default the Roof type is set to Monopitch. This needs to be
changed to Duopitch.
Afterwards, the 3D Wind Generator can be used in the load menu. Use the button ‘Add Load Cases’ to choose which
load cases have to be generated.
32

Chapter 3 - 3D wind generator
By default, 16 load cases are generated. Four cases for each wind direction. For the Load Coefficients, the Cpe values
are taken from the code (EN 1991-1-4):
For the vertical walls, table 7.1 of EN 1991-1-4 is used:
For the roof, table 7.4a of EN 1991-1-4 is used:
After clicking on OK, all the load cases that are marked will be created. These load cases will be gathered in a new
automatic created variable load group. Generate the loads by clicking on ‘run generator’.
MC – 2025/14/01 33

Tutorial – Load generators
The loads can be viewed by turning the visibility on and changing the active load case accordingly. The loads are
generated as surface loads for each zone. By selecting such a surface load, the calculated coefficient can be viewed in
the property window:
The Cpe and Cpi coefficients can showed graphically by marking this option in the View parameters. The Net and Peak
Pressure can also be visualized like this.
All Cpe and Cpi values for each zone and wind direction, can be viewed in the Engineering report
.
34

Chapter 4 - Traffic loads
Traffic loads
With traffic loads, you can model mobile load patterns on 2D elements. In this example, a bridge deck will be modelled
as a concrete plate on three line supports.
Note: Traffic loads are not compatible with 1D elements. Mobile loads on 1D members is currently only available in the
32-bit version of SCIA Engineer. Influence lines are also not available in the 64-bit version. In order to use this
functionality you will also need to use the 32-bit version and change the post-processing environment to ‘v16 and
older’. This is further explained in chapter 5.
Example model
Project data
A new project is created with the following parameters:
• Code: Eurocode
• Material: Concrete C25/30
• Structure: Plate XZ
To be able to use Mobile/traffic loads in a project, this functionality needs to be activated in the Project Data:
Construction
The bridge deck can be entered as a Plate with thickness 500mm. The length of the bridge deck is 25m, the width is 5m.
In the middle of the bridge deck, an internal edge is created with the option Internal Edge. Afterwards a line support is
added to the short edges and the internal edge. Only the translations in the z-direction is prevented. You can also open
this project Trafficloads.esa.
MC – 2025/14/01 35

Tutorial – Load generators
Input traffic loads
Traffic lane
Via the input panel or the SCIA Spotlight, the Traffic lane can be inserted.
This track will consist of two rails with a distance of 1,4m between them. To make sure that the train drives on two rails
at the same time, 1 traffic lane is entered. The track has to be entered on 1.8m from the edge to be able to place the
train track in the middle of the bridge. The coordinates can be entered in the Command line (0;1,8 and 25;1,8).
Traffic loads generator
The Traffic loads generator is used to generate any inputted traffic loads onto the traffic lane. The loadcases will be
created and the distance between each step is given.
Traffic loads
In the traffic loads generator you define the traffic loads.
Add an entity in this dialog. You can add point loads, line loads, surface loads and a turning joint. For this example we
are going to add moving point loads.
36

Chapter 4 - Traffic loads
Add an entity, define the Force and the Repetition of the point load. In this case, there will be two train tracks with a
distance in between of 1.4m so we repeat the point load twice according to the y-direction and set the Delty y to 1.4m.
Note: There is a system database for Traffic load patterns as well.
Generate loads
The selected train load pattern will move along the specified track with the here-defined step of 0.25m. A separate load
case is generated for each position of the moving load, the description of the load case is modified based on the load
case name and the position. You also need to define the load group in which the load cases are added. Create a variable
load group LG2 and set the relationship accordingly.
MC – 2025/14/01 37

Tutorial – Load generators
Mobile loads
In this chapter the ‘Mobile loads’ functionality will be examined in detail. With this functionality, mobile load systems,
connected to a track, can be placed and calculated on a structure.
These load systems represent e.g. the following physical systems:
• A crane on a crane track
• A train on a bridge
• A vehicle on a viaduct
• People on a bridge
There can also be multiple load systems:
• Trains with various types of wagons
• Trains on parallel tracks or one after the other
• Different vehicles on a bridge in combination with pedestrians
Through SCIA Engineer it is possible to look for extreme design components such as extreme moments, reaction forces,
and deformations … for these load systems.
In the first part of the course, the principles are explained, in the second part they are illustrated by means of projects.
Principle
The principle of the module Mobile Loads is based on the theory of the influence lines. An influence line represents a
diagram that shows the effect of a unit load on a variable position in a given point of the structure.
This is illustrated on the picture below:
Figure (a) represents a simple beam on 2 supports, across which a concentrated load P can move.
In every section “n” the moment and the shear force are maximal if the load P is exactly above “n”. This is shown on
figure (b).
When the position of the load is changed, similar diagrams can be made. Finally the envelopes can be drawn as shown
on figure (c). As expected, the maximal moment appears in the middle of the beam and the extreme shear forces in the
supports.
38

Chapter 5 - Mobile loads (32-bit)
Using these influence lines, the effect of more loads on the structures, the so-called load system, can be determined.
The goal is to find the position of the load system, for which the effect on the structure in a certain point is maximal.
This is illustrated on the following figure.
Figure (a) represents a simple beam on two supports again. Across the beam, a system of three point loads can move
which represent e.g. the axis loads of a lorry. We look for the position of the load system for which the moment and the
shear force are maximal in the section “n”.
The influence line for M , the moment in n, is shown on figure (b). The moment resulting from the load system can
n
now be determined as follows:
At which h represents the location of the influence line exactly below P.
i i
The maximum of M is found by trial and error so the sum of the products of an axis load and the influence location
n
below is as large as possible.
This maximum is shown on figure (b) at which the moment M can be determined as follows:
n
For every other position of the load system, a lower maximum in n is obtained.
In an analogous way this is illustrated for V , the shear force at the place of the section “n”. Figure (c) shows the
n
influence line for the shear force V .
n
Figures (d) and (e) show the positions of the load system for the maximal positive shear force and the maximal negative
shear force.
MC – 2025/14/01 39

Tutorial – Load generators
In SCIA Engineer these various steps appear as follows:
• Input Track across which a Unit load can move
• Input Unit load
• Representation Influence lines
• Input Load system
• Exploitation in a point at which the Load system is linked to the Unit load
• Generation load case for exploitation in a point
• Generation enveloping load cases to gain insight in the global behaviour of the structure.
Influence lines
In this first project Influence lines.esa a simple beam is modelled on 2 supports. By means of the module Mobile Loads,
a track and a unit load are defined on this beam so the influence lines of the various design components can be
reviewed.
Open the menu .
As shown at the Principles, an influence line represents a diagram that shows the effect of a unit load on a variable
position in a given point of the structure. To be able to meet this definition, a track has to be defined first, across which
a unit load can move.
Input track and unit load
You can import this track through .
The program defines the track as a polyline. As a starting point of the track, the node N1 is indicated, as an end point
the node N2.
If the track moves across several members, it is important to indicate sufficient nodes. The property window shows
which nodes are used in the track. As a Name for the track TR1 is entered.
40


## Sayfa 41

Chapter 5 - Mobile loads (32-bit)
The option ‘Use for calculation’ shows that this track is taken into account in the calculation. If more tracks are defined,
this can be used to show which tracks really have to be calculated.
The action ‘Update track definition’ allows generating the imported track again if e.g. the coordinates of a node were
adapted. That way the track doesn’t have to be imported again after an adjustment of the geometry.
After defining the track, the unit load can be imported through the menu .
Through the option Track assignment you can indicate on which track the unit load needs to appear.
The option Sections determines the density of the used sections.
Use sections from results
The unit load is positioned in every section of the beam that lies in the area of the track. The number of sections on a
member is indicated at .
Use step according 2D element
The unit load is positioned with the step entered of “step for 2D element [m]”. If a 2D element has a length that is
shorter than the adjusted step, it is not loaded by the unit load.
Generate at least one section on member
Analogously to the previous option; here the unit load is also positioned on 2D elements with a shorter length than the
adjusted step.
Through the option Generate section under Load system, a section is made under every concentrated load of a load
system when showing the results. This way the result can be exactly reviewed under the concentrated load.
By default 1 impulse is made. In other examples also more impulses are used. The distance between two impulses is
always perpendicular to the track.
In this example the default settings are kept so the concentrated mobile unit load with value -1 is defined.
The Name of the unit load is by default EHL, which is kept for this example.
MC – 2025/14/01 41

Tutorial – Load generators
Influence lines
After defining the track and the unit load, the linear calculation can be started. To do this it is not necessary to exit the
menu Mobile Loads, but you can use the button in the project toolbar.
After the calculation a new group appears in the menu Mobile Loads:
Note: Influence lines are only available in post-processing environment v16 and older.
When choosing a result group, you have to indicate on which member and in which section the results have to be
shown through the Selection Tool. The Preview shows the results numerically.
Through the action button Single Check the influence line can be shown graphically.
In the field Multiplication factor, a proportionality factor can be set. With the button To document, the numerical
results are sent directly to the document.
42

Chapter 5 - Mobile loads (32-bit)
Load system
In this project a bridge deck is modelled on several supports. After defining a track and a mobile unit load, the various
load systems are linked to the unit load.
Through a selective exploitation, the load cases are automatically generated for various positions of the load systems. In
a last step, the envelope load cases are generated for various design components to gain insight in the global behaviour
of the structure.
The construction
The construction is built from a “Double T” bridge girder with standard dimensions, given by SCIA Engineer.
The construction can be inserted as 3 horizontal beams through , at which the begin node is imposed hinged
and the other nodes are rolled.
To be able to calculate the construction, one load case is created; the Self Weight.
MC – 2025/14/01 43

Tutorial – Load generators
Input track and unit load
After entering the construction, the menu can be opened.
Through a track can be defined from node N1 to node N4.
The property window shows the nodes that are recognized by the track:
As Name of the track TR1 is entered.
After defining the track, a unit load can be inserted through the menu .
44

Chapter 5 - Mobile loads (32-bit)
Input load systems
By means of the unit load, the influence lines for the construction can already be generated. SCIA Engineer also allows
linking this unit load to a load system.
The input of the load systems occurs through the option .
Both Single and Multiple Load systems can be defined.
Possibilities with Single Load systems:
• A coherent combination of point loads (e.g. vehicle)
• Line loads of an indefinite length (e.g. pedestrians)
• A combination of both
Possibilities with Multiple Load systems:
• A line load with a definite length in combination with a line load of an indefinite length.
• Two similar independent systems of point loads with variable interval in combination with a divided load of an
indefinite length.
• Three or more independent systems of point loads with a fixed interval in combination with a divided load of
an indefinite length.
In this project the following three load systems are considered:
1) Single Load system P Loads left
This load system consists of a point load of 150 kN and 2 point loads of 100 kN with a mutual distance of 2m. The point
load of 150 kN is at the front.
2) Single Load system P Loads right
This load system consists of a point load of 150 kN and 2 point loads of 100 kN with a mutual distance of 2m. The point
load of 150 kN is at the back.
MC – 2025/14/01 45

Tutorial – Load generators
3) Single Load system Q Load
This load system consists of a line load of 18 kN/m with an indefinite length.
When entering a Single Load system, you have the possibility to mark the option Neglect point load with opposite
influence. If this option is activated, the complete concentrated load, which lies in the negative area of the influence
line, will be taken in account in the calculation. By activating this option, the found maximum will be reduced.
In this project, the option is not activated.
Exploitation of load systems
After defining the mobile unit load and the load systems, the linear calculation can be started through the button
in the project toolbar.
After the calculation a new group appears in the menu Mobile Loads:
With the Detailed Analysis, the load systems can be linked to the unit load. For every desired position on the structure,
between all the selected tracks, SCIA Engineer determines the system that is most adverse for the chosen design
parameter.
This is illustrated for 2 different cases.
46

Chapter 5 - Mobile loads (32-bit)
Case 1
An exploitation is performed for the moment My on a position 24m on the first beam B1. The exploitation is performed
for the load systems P Loads Left and P Loads Right.
In the Property window these options can be adjusted:
The advanced options Limited run, Additional and Load case are discussed further in this course.
Through the action Preview the result of the required exploitation can be called up:
1. Description of the influence line + The selected load systems for which the exploitation is
done:
Influence line: Member B1
Position : 24.00[m]
Type : My
Considered load systems:
• P Loads left
• P Loads right
Unit Load : EHL
2. Co-ordinates of the nodes of the load track and their ordinates:
Node X [m] Y [m] Z [m]
1 0.000 0.000 0.000
2 32.000 0.000 0.000
3 64.000 0.000 0.000
4 82.000 0.000 0.000
MC – 2025/14/01 47

| Node | X [m] | Y [m] | Z [m] |
| --- | --- | --- | --- |
| 1 | 0.000 | 0.000 | 0.000 |
| 2 | 32.000 | 0.000 | 0.000 |
| 3 | 64.000 | 0.000 | 0.000 |
| 4 | 82.000 | 0.000 | 0.000 |


Tutorial – Load generators
3. Areas of the fields of the influence line:
Area Nr Area
1 43.527
2 -34.564
3 2.722
4. Co-ordinates at the points where the sign of the influence line changes:
Sign Nr X [m] Y [m] Z [m]
0 0.000 0.000 0.000
1 32.000 0.000 0.000
2 64.000 0.000 0.000
5. Additional factors:
Mult. factor results except deformations : 1.000
Mobile factor: 1.000
6. The data of load system which gives the maximum / minimum values:
Negative maximum position : P Loads left
Sum P [kNm] Sum Q [kNm] X1 [m] X2 [m]
-621.408 0.000 44.667 44.667
Positive maximum position : P Loads right
Sum P [kNm] Sum Q [kNm] X1 [m] X2 [m]
1149.982 0.000 22.000 22.000
7. Results:
Negative maximum position : P Loads left
Description Due to P Due to Q P + Q Units
My negative -621.408 0.000 -621.408 [kNm]
Positive maximum position : P Loads right
Description Due to P Due to Q P + Q Units
My positive 1149.982 0.000 1149.982 [kNm]
48

| Area Nr | Area |
| --- | --- |
| 1 | 43.527 |
| 2 | -34.564 |
| 3 | 2.722 |


| Sign Nr | X [m] | Y [m] | Z [m] |
| --- | --- | --- | --- |
| 0 | 0.000 | 0.000 | 0.000 |
| 1 | 32.000 | 0.000 | 0.000 |
| 2 | 64.000 | 0.000 | 0.000 |


| Sum P [kNm] | Sum Q [kNm] | X1 [m] | X2 [m] |
| --- | --- | --- | --- |
| -621.408 | 0.000 | 44.667 | 44.667 |


| Sum P [kNm] | Sum Q [kNm] | X1 [m] | X2 [m] |
| --- | --- | --- | --- |
| 1149.982 | 0.000 | 22.000 | 22.000 |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| My negative | -621.408 | 0.000 | -621.408 | [kNm] |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| My positive | 1149.982 | 0.000 | 1149.982 | [kNm] |


Chapter 5 - Mobile loads (32-bit)
The parts that should be displayed in the report can be indicated through the options Setup report.
Under Title 1. you can see that the position for which the design parameter My is extreme on a position 24m on
member B1.
Under Title 6. and 7., is indicated that two extremes have been found.
My is minimal (-621,408 kNm) on 24m if the reference point of the load system P Loads left is located at 44,667m from
the begin point of the track.
My is maximal (1149,983 kNm) on 24m if the reference point of the load system P Loads right is located at 22m from
the begin point of the track.
The values X1 and X2 are the same since a single load system is used.
This result is also displayed graphically:
Through the action Single Check the results are shown in a window, at which the position for the exploitation can be
simply changed.
Case 2
An exploitation is performed for the moment My on a position 24m on the first beam B1. The exploitation is performed
for the load systems P Loads left, P Loads right and Q Load.
In the Property window these options can be set:
MC – 2025/14/01 49

Tutorial – Load generators
Through the action Preview the result of the required exploitation can be called up:
1. Description of the influence line + The selected load systems for which the exploitation is
done:
Influence line: Member B1
Position : 24.00[m]
Type : My
Considered load systems:
• P Loads left
• P Loads right
• Q Load
Unit Load : EHL
2. Co-ordinates of the nodes of the load track and their ordinates:
Node X [m] Y [m] Z [m]
1 0.000 0.000 0.000
2 32.000 0.000 0.000
3 64.000 0.000 0.000
4 82.000 0.000 0.000
3. Areas of the fields of the influence line:
Area Nr Area
1 43.527
2 -34.564
3 2.722
4. Co-ordinates at the points where the sign of the influence line changes:
Sign Nr X [m] Y [m] Z [m]
0 0.000 0.000 0.000
1 32.000 0.000 0.000
2 64.000 0.000 0.000
5. Additional factors:
Mult. factor results except deformations : 1.000
Mobile factor: 1.000
50

| Node | X [m] | Y [m] | Z [m] |
| --- | --- | --- | --- |
| 1 | 0.000 | 0.000 | 0.000 |
| 2 | 32.000 | 0.000 | 0.000 |
| 3 | 64.000 | 0.000 | 0.000 |
| 4 | 82.000 | 0.000 | 0.000 |


| Area Nr | Area |
| --- | --- |
| 1 | 43.527 |
| 2 | -34.564 |
| 3 | 2.722 |


| Sign Nr | X [m] | Y [m] | Z [m] |
| --- | --- | --- | --- |
| 0 | 0.000 | 0.000 | 0.000 |
| 1 | 32.000 | 0.000 | 0.000 |
| 2 | 64.000 | 0.000 | 0.000 |



## Sayfa 51

Chapter 5 - Mobile loads (32-bit)
6. The data of load system which gives the maximum / minimum values:
Negative maximum position : Q Load
Sum P [kNm] Sum Q [kNm] X1 [m] X2 [m]
0.000 -622.150 0.000 0.000
Positive maximum position : P Loads right
Sum P [kNm] Sum Q [kNm] X1 [m] X2 [m]
1149.982 0.000 22.000 22.000
7. Results:
Negative maximum position : Q Load
Description Due to P Due to Q P + Q Units
My negative 0.000 -622.150 -622.150 [kNm]
Positive maximum position : P Loads right
Description Due to P Due to Q P + Q Units
My positive 1149.982 0.000 1149.982 [kNm]
This result is also displayed graphically:
An influence line for a point of the construction is the representation of the amplitude of the design parameter in the
point, if the unit load is moving across the structure. By placing the divided load on the places where the influence line
has the same sign, an extreme result is obtained. In this example the moment My on 24m reaches a minimal value -
622.15 kNm if the divided load is placed in the second field.
Remarks:
With an exploitation calculation various load systems can be selected. In the calculation, SCIA Engineer considers these
load systems as individual.
To obtain an exploitation at which various systems are loading the structure at the same time, multiple systems have to
be used.
In this project only one track is defined. Of course it is also possible to define several tracks. With a calculation, at which
various tracks and several load systems have been selected, the program considers every system on every track
separately. The resulting extreme component comes from one of the systems on one of the tracks.
MC – 2025/14/01 51

| Sum P [kNm] | Sum Q [kNm] | X1 [m] | X2 [m] |
| --- | --- | --- | --- |
| 0.000 | -622.150 | 0.000 | 0.000 |


| Sum P [kNm] | Sum Q [kNm] | X1 [m] | X2 [m] |
| --- | --- | --- | --- |
| 1149.982 | 0.000 | 22.000 | 22.000 |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| My negative | 0.000 | -622.150 | -622.150 | [kNm] |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| My positive | 1149.982 | 0.000 | 1149.982 | [kNm] |


Tutorial – Load generators
In the system database various load systems have already been pre-programmed.
Generation Load cases – Enveloping Load cases
SCIA Engineer allows making both single and enveloping load cases.
Generate Load cases
With the exploitation of a design parameter in a section you have the possibility to generate several exclusive variable
load cases.
First of all the option Load case - generate has to be marked at the Detailed Analysis.
If no variable load group is found, the program asks whether a new group has to be made.
In this example it is applied on case 2, mentioned above:
52

Chapter 5 - Mobile loads (32-bit)
A load case Mobile is made. After activating this option, a Single check is performed on the member B1 through the
action Single check.
Through the button Generate Load Cases two load cases are generated, one for the minimal My on 24m and one for
the maximal My on 24m. The parameter B indicates the member, parameter P the position on the member.
Since this option is used to make real load cases, the content of these load cases can be seen.
Max My:
Min My:
After a linear calculation these load cases can be combined with other load cases and e.g. used for a steel check.
MC – 2025/14/01 53

Tutorial – Load generators
Generate Envelope Load cases
During the exploitation of the influence line, the individual sections of the track are evaluated for the design
components (e.g. My). During this exploitation the critical position of the load system is determined. This position
causes a maximal value of the design component in the appropriate section. This value is saved together with the
corresponding values of this design component in other sections and the procedure is repeated for the following
section.
As soon as the calculation is performed for every section, the envelope can be created. Subsequently the system can
create envelopes for other design components (e.g. Vy, Vz, etc.). It is important to see that the envelope doesn’t
represent a realistic load case, so it is not possible to show the content.
The envelope represents a fictive load case that shows the found extremes (envelopes). For this reason it is not useful
to use this envelope e.g. for a steel check. This envelope can be combined with other load cases to obtain insight in the
global behaviour of the structure.
To be able to generate such enveloping load cases, the option is used in the menu
Mobile Loads.
First of all you have to indicate which unit loads and which load systems have to be taken into account. In this example
three imported load systems are selected.
In the window Load case you can enter a name for the load cases you have to make. In this example the names of the
load cases are automatically generated by the program by leaving the window blank and the name Mobile is selected
for the load group.
With Selection of member the option All members is marked, so all the members are taken into account in the
calculation.
54

Chapter 5 - Mobile loads (32-bit)
Through Select Components you can indicate for which components a envelope has to be generated. In this example all
components are considered.
After importing these data a linear calculation can be performed, so the envelope load cases are made.
After the calculation the Load cases manager shows the following:
The load cases have ‘Mobile envelope’ as a description and are in an exclusive load group. If required, the load group
can be adjusted to set a Load type according to EC1991.
Subsequently the results of this envelope can be reviewed, e.g. the moment My:
Max My:
Min My:
MC – 2025/14/01 55

Tutorial – Load generators
Remarks:
When performing a Detailed analysis or generating the enveloping load cases, a number of advanced options is
available:
Limited run:
During the exploitation the critical position of the load system is determined. However, it may happen that the extreme
is reached if the mobile load is partially outside the structure. With this option you can indicate whether the mobile
load can only appear on a restricted interval of the track so you can avoid that a part of the load system falls partially
outside the structure.
The restriction of the track will be executed in such a way that the values of the influence lines will be zero outside the
given interval.
Additional multiplication factor results except deformations:
The VOSB code (NEN code) shows that every internal force and reaction for the position of a mobile load has to be
multiplied by this coefficient. The results of influence lines for deformations are not multiplied with this factor.
It is possible that a deformation of a load case, associated with internal forces such as Max My, has a larger deformation
than e.g. the load case Min uz.
Additional Mobile factor:
The mobile factor is used e.g. to consider a single or double traffic lane. All results are multiplied with this factor, also
the deformations.
56

Chapter 5 - Mobile loads (32-bit)
Train loads
In this project a bridge deck is modelled as a concrete plate on three supports. Analogously to the previous projects, a
track with a unit load is defined on the bridge deck so the influence lines can be determined. However, in this project a
unit load with two impulses is defined to simulate both rails of a train track. In a next step, a VOSB 150 load system is
linked to this unit load and the enveloping load cases are generated.
The construction
MC – 2025/14/01 57

Tutorial – Load generators
The bridge deck can be entered as with thickness 500mm.
The length of the bridge deck is 25m, the width 5m.
In the middle of the bridge deck an internal edge is created. Using the Cursor Snap Settings you can snap on
midpoints of the long edges so the edge can be imported through the option .
58

Chapter 5 - Mobile loads (32-bit)
Using , the translation in the Z-direction can be prevented for the three short
edges. They can be simply selected by drawing a rectangle from right to left:
Then we have the following structure:
To be able to calculate the construction, one load case is made; the Self Weight.
Input track and unit load
After entering the construction, the menu can be opened.
The train track consists in this project of two rails with a distance of 1.4m between them. To make sure that the train
drives on two rails at the same time, 1 mobile load track is entered with a unit and two impulses on it.
The track has to be entered on 1.8m from the edge to be able to place the train track in the middle of the bridge.
Through the track can be defined. The coordinates can be entered in the Command line:
MC – 2025/14/01 59

Tutorial – Load generators
As Name of the track, TR1 is entered.
After defining the track, the unit load can be entered through the menu .
As a Name of the unit load, Train is entered for a simple reference.
With Sections the option Use step according 2D element can be chosen and as step, 0.25m is entered.
60


## Sayfa 61

Chapter 5 - Mobile loads (32-bit)
Now the unit load consists of 1 concentrated load. To show both rails of the train track, a second impulse is added
through the option Add new impulse .
Subsequently the Position [m] of Impulse 2 can be adjusted to 1.4m.
Both impulses are displayed on the bridge deck:
MC – 2025/14/01 61

Tutorial – Load generators
Influence lines
After defining the train track and the unit load that represent both rails, the linear calculation can be started. To do this
it is not necessary to exit the menu Mobile Loads, but you can use the button in the project toolbar.
Through the Average size of 2D element/curved element can be set to 0.5m.
After the calculation a new group appears in the menu Mobile Loads:
When choosing a result group, you have to indicate on which 2D element in which point the results have to be
displayed through the Selection tool.
The results are e.g. asked for the Deformation on slab in the point ( 5 ; 2,5 ; 0 ). The Preview shows the following
results:
62

Chapter 5 - Mobile loads (32-bit)
The result table clearly shows the step of 0.25m. Through Single Check the result can be viewed graphically.
Input load systems
Through the option a load system can be entered in the project.
In this project a predefined load system is used; namely VOSB 150.
That is why the window Load system is cancelled so the Load system Manager is displayed.
Through the button System database a predefined load system can be added to the project:
MC – 2025/14/01 63

Tutorial – Load generators
With the button a load system VOSB 150 can be copied to the Project. By pressing the
button Close this system is displayed in the Load system Manager.
Through the button Properties the properties of this load system can be viewed.
64

Chapter 5 - Mobile loads (32-bit)
The load system consists of 2 groups of three point loads and a divided load. The point loads have a value of 150 kN and
a mutual distance 1.5m. The divided load has a value of 80 kN/m.
The Minimum distance between the load groups is 17m, the Maximum distance is 1000m. SCIA Engineer will let the
distances of the load groups between these two boundaries vary to obtain the maximal effect on the bridge deck.
The Mobile distributed load between the load groups is 10 kN/m. This value will reduce the found maximum.
Exploitation of the load systems
After defining the mobile Unit load and the load systems, the linear calculation can be started by pressing the button
in the project toolbar.
After the calculation a new group appears in the menu Mobile Loads:
With the Detailed Analysis the load system can be linked to the Unit load. For every desired position on the structure,
between all the selected tracks, SCIA Engineer determines the system that is most adverse for the chosen design
parameter.
E.g. an exploitation is performed for the moment mx. The parameters can be set in the Property window and through
Selected 2D members is indicated that results are called up for 2D element S1.
The option Load case - generate has to marked at the Detailed Analysis. If no variable load group was found, the
program asks if a new group had to be made. The Load group - Train is selected/made.
Subsequently through Single Check the bridge deck can be indicated. The exploitation is performed
e.g. in the point ( 5 ; 0 ; 0 ).
MC – 2025/14/01 65

Tutorial – Load generators
Under Title 6. and 7. is indicated that two extremes have been found.
6. The data of load system which gives the maximum / minimum values:
Negative maximum position : VOSB 150
Sum P Sum Q X1 X2
[kNm/m] [kNm/m] [m] [m]
-83.093 -125.154 1.000 18.000
Positive maximum position : VOSB 150
Sum P Sum Q X1 X2
[kNm/m] [kNm/m] [m] [m]
365.018 475.258 5.000 22.000
7. Results:
Negative maximum position : VOSB 150
Description Due to P Due to Q P + Q Units
mx negative -83.093 -125.154 -208.247 [kNm/m]
Positive maximum position : VOSB 150
Description Due to P Due to Q P + Q Units
mx positive 365.018 475.258 840.277 [kNm/m]
mx is minimal (-208,247 kNm/m) in point ( 5 ; 0 ; 0 ) if the reference point of the first group of point loads is on 1m
from the begin point of the track and the reference point of the second group of point loads that is on 18m.
mx is maximal (840,277 kNm/m) in point ( 5 ; 0 ; 0 ) if the reference point of the first group of point loads is on 5m from
the begin point of the track and the reference point of the second group of point load is on 22m.
In this example it is clear that the distance between both load groups is always 17m, as set at the VOSB 150 load
system.
66

| Sum P
[kNm/m] | Sum Q
[kNm/m] | X1
[m] | X2
[m] |
| --- | --- | --- | --- |
| -83.093 | -125.154 | 1.000 | 18.000 |


| Sum P
[kNm/m] | Sum Q
[kNm/m] | X1
[m] | X2
[m] |
| --- | --- | --- | --- |
| 365.018 | 475.258 | 5.000 | 22.000 |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| mx negative | -83.093 | -125.154 | -208.247 | [kNm/m] |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| mx positive | 365.018 | 475.258 | 840.277 | [kNm/m] |


Chapter 5 - Mobile loads (32-bit)
Generate load cases – Envelope load cases
In this project the enveloping load cases are generated for the moment mx and the shear force vx. After drawing up the
envelopes, a selective exploitation is performed in a point from the bridge deck.
Generate Envelope Load Cases
To be able to generate the enveloping load cases, the option is used.
First of all you have to indicate which Unit load and which Load system have to be taken into account.
Subsequently the option Name Load case can be used to enter the names. This is not necessary. Nothing is filled in so
the program generates the names automatically based on Train and VOSB 150.
Through Select components you can indicate for which components an envelope has to be generated. In this example
the design parameters vx and mx are considered.
MC – 2025/14/01 67

Tutorial – Load generators
After entering these data, a linear calculation can be performed so the enveloping load cases are made.
After the calculation the Load cases manager shows the following:
The load cases have Mobile envelope as a description and are in an exclusive load group. The load group can be
adjusted if required to set a Load type according to EC1991.
Subsequently the results of these envelopes can be viewed for e.g. the moment mx:
Maximum mx:
Minimum mx:
68

Chapter 5 - Mobile loads (32-bit)
Generation of load cases
After setting the envelopes, a selective exploitation is performed for the moment, indicated on position ( 10; 2,5 ; 0 ).
First of all the option Load case - Generate has to be marked at the Detailed Analysis.
The load cases will be placed in the variable load group Train that has already been made.
After activating this option, a Single check is performed on the bridge deck through the option Single check and the
desired position is set.
MC – 2025/14/01 69

Tutorial – Load generators
Through Generate Load Cases the load cases are generated.
In the Load cases manager a description can be added to these load cases:
After re-running the linear calculation, the results for these generated load cases can be viewed.
Load case Max, mx:
Results:
70


## Sayfa 71

Chapter 5 - Mobile loads (32-bit)
Crane track
This last project shows how the position of a load system on the structure can be adapted through various unit loads.
That way e.g. a crane track, which moves from left to right in a hall, can be modelled.
After entering a simple hall, the track of the crane track is defined. Using the Unit load with two impulses, both rails of
the crane track are simulated. More Unit loads with various factors are entered to show that the crane track can also
move in the transversal direction, perpendicular on the rails.
In a next step the load system is defined which represents the wheels of the crane track and this load system is linked to
various unit loads so the enveloping load cases can be generated.
MC – 2025/14/01 71

Tutorial – Load generators
The construction
The first portal of the hall can be entered through .
Subsequently the haunch beams on which the rail support, can be entered through . The beams have a
length 1m, type IPE 180 and move across ¾ of the length of the column.
To find this Snap Point you can use the Cursor Snap settings .
72

Chapter 5 - Mobile loads (32-bit)
To be able to get the full hall, the option Multiple copy is used. All members, the three nodes of the roof and the
two nodes of the IPE180 beams are selected:
The window More copies can be set:
MC – 2025/14/01 73

Tutorial – Load generators
As a profile type for the connection beam between the various trusses, IPE 180 is chosen.
Than we have the following structure:
74

Chapter 5 - Mobile loads (32-bit)
The geometry input is ended by entering the rigid supports to the column bases and by executing the
and to connect the various members.
To be able to calculate the structure, one load case is created; the Self Weight.
Input track and unit load
After entering the construction, the menu can be opened.
Through a track can be defined from node K8 to K14 to K23 to K32.
MC – 2025/14/01 75

Tutorial – Load generators
The Property window shows the nodes that are recognized by the track:
As a Name for the track TR1 is entered.
After defining the track, the Unit loads can be entered through the menu .
In this project three unit loads are entered:
Centre: a Unit load consisting of two impulses of 0,5 simulating that the crane track is in the middle of both rails.
Left: a Unit load consisting of an impulse of 0,8 and an impulse of 0,2 simulating that the crane track is on the left hand
side of the hall.
Right: a Unit load consisting of an impulse of 0,2 and an impulse of 0,8 simulating that the crane track is on the right
hand side of the hall.
The distance between both impulses is the distance between both rails: 8m.
76

Chapter 5 - Mobile loads (32-bit)
MC – 2025/14/01 77

Tutorial – Load generators
78

Chapter 5 - Mobile loads (32-bit)
Input load system
The input of the load system for the crane track happens through the option .
For the crane track a total weight of 40 kN is taken. If the crane track is in the middle, it means 20 kN per rail. On every
rail there are two wheels so a weight of 10 kN is calculated. The interval between the wheels is 0,8m.
However, the defined Unit loads are entered with a factor lower than 1. For the unit load Centre a factor of 0,5 is
entered per rail. Because of this the loads of the load system have to be doubled to come to the total weight of 40kN.
MC – 2025/14/01 79

Tutorial – Load generators
The single load system can be entered as two point loads of 20kN with a mutual distance of 0,8m.
As a Name for the load system, Crane Track is entered.
Exploitation of the load system
After defining the mobile unit loads and the load system, the linear calculation can be started through the button
in the project toolbar.
After the calculation a new group appears in the menu Mobile Loads:
With the Detailed Analysis the load system can be linked to various unit loads.
An exploitation is performed for the moment My on a position 2.5m on the first beam B33. The exploitation is
performed for the three Unit loads together.
In the Property window these loads can be set:
Through Generate a Load group Mobile is made.
80


## Sayfa 81

Chapter 5 - Mobile loads (32-bit)
Through the action Preview the result of the asked exploitation can be asked for.
1. Description of the influence line +
The selected load systems for which the exploitation is done:
Influence line: Member B33
Position : 2.50[m]
Type : My
Considered load systems:
• Crane Track
Unit Load : Left
2. Co-ordinates of the nodes of the load track and their ordinates:
Node X [m] Y [m] Z [m]
9 9.000 0.000 3.750
18 9.000 5.000 3.750
27 9.000 10.000 3.750
36 9.000 15.000 3.750
3. Areas of the fields of the influence line:
Area Nr Area
1 -0.000
2 1.940
3 -0.471
4 0.088
4. Co-ordinates at the points where the sign of the influence line changes:
Sign Nr X Y Z
[m] [m] [m]
0 9.000 0.000 3.750
1 9.000 0.049 3.750
2 9.000 5.197 3.750
3 9.000 10.418 3.750
0 9.000 0.000 3.750
1 9.000 0.049 3.750
2 9.000 5.197 3.750
3 9.000 10.418 3.750
MC – 2025/14/01 81

| Node | X [m] | Y [m] | Z [m] |
| --- | --- | --- | --- |
| 9 | 9.000 | 0.000 | 3.750 |
| 18 | 9.000 | 5.000 | 3.750 |
| 27 | 9.000 | 10.000 | 3.750 |
| 36 | 9.000 | 15.000 | 3.750 |


| Area Nr | Area |
| --- | --- |
| 1 | -0.000 |
| 2 | 1.940 |
| 3 | -0.471 |
| 4 | 0.088 |


| Sign Nr | X
[m] | Y
[m] | Z
[m] |
| --- | --- | --- | --- |
| 0 | 9.000 | 0.000 | 3.750 |
| 1 | 9.000 | 0.049 | 3.750 |
| 2 | 9.000 | 5.197 | 3.750 |
| 3 | 9.000 | 10.418 | 3.750 |
| 0 | 9.000 | 0.000 | 3.750 |
| 1 | 9.000 | 0.049 | 3.750 |
| 2 | 9.000 | 5.197 | 3.750 |
| 3 | 9.000 | 10.418 | 3.750 |


Tutorial – Load generators
5. Additional factors:
Mult. factor results except deformations : 1.000
Mobile factor: 1.000
6. The data of load system which gives the maximum / minimum values:
Negative maximum position : Crane Track
Sum P [kNm] Sum Q [kNm] X1 [m] X2 [m]
-5.590 0.000 7.275 7.275
Positive maximum position : Crane Track
Sum P [kNm] Sum Q [kNm] X1 [m] X2 [m]
27.074 0.000 2.100 2.100
7. Results:
Negative maximum position : Crane Track
Description Due to P Due to Q P + Q Units
My negative -5.590 0.000 -5.590 [kNm]
Positive maximum position : Crane Track
Description Due to P Due to Q P + Q Units
My positive 27.074 0.000 27.074 [kNm]
As expected the maximal moment My on the position 2.5m arises when the crane track is on the left hand side of the
hall:
Under Title 6. and 7. is indicated that two extremes have been found.
My is minimal (-5.590 kNm) on 2.5m if the reference point of the crane track is on 7.275m from the begin point of the
track.
My is maximal (27.074 kNm) on 2.5m if the reference point of the crane track is on 2.1m from the begin point of the
track.
The values X1 and X2 are the same since a single load system was used.
This result is also shown graphically:
82

| Sum P [kNm] | Sum Q [kNm] | X1 [m] | X2 [m] |
| --- | --- | --- | --- |
| -5.590 | 0.000 | 7.275 | 7.275 |


| Sum P [kNm] | Sum Q [kNm] | X1 [m] | X2 [m] |
| --- | --- | --- | --- |
| 27.074 | 0.000 | 2.100 | 2.100 |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| My negative | -5.590 | 0.000 | -5.590 | [kNm] |


| Description | Due to P | Due to Q | P + Q | Units |
| --- | --- | --- | --- | --- |
| My positive | 27.074 | 0.000 | 27.074 | [kNm] |


Chapter 5 - Mobile loads (32-bit)
Generation Enveloping Load Cases
For the component My the enveloping load cases are generated through the option .
First of all you have to indicate which unit loads and which load systems have to be taken into account. In this example
all unit loads are selected.
Subsequently you can enter the name through the option Name Load case. This is not necessary. For a load group the
name Mobile is chosen, this load group has been created before in the Detailed analysis.
With Selection of members the option All members is deselected and the member B33 is indicated. Through Select
components you can indicate for which components an envelope has to be generated. In this example, only the
component My is considered.
MC – 2025/14/01 83

Tutorial – Load generators
After entering these data, a linear calculation can be performed so the enveloping load cases are made.
After the calculation the Load cases manager displays the following:
The load cases have Mobile envelope as a description and are in an exclusive load group. If required, the load group can
be adjusted, e.g. to set a moment factor according to NEN or a Load Type according to EC1991.
Subsequently, the results of these envelopes can be viewed. The moment course My on member B33 for load case Left
– Crane track – Max My shows the following:
84

Chapter 6 - 2D wind- and snow generators (32-bit)
2D wind- and snow generators (32-bit)
In this chapter, the wind and snow generator are explained. To be able to use this generators, the functionality ‘Climatic
loads’ should be used.
In the next tab, the wind and snow load should be chosen (according to the code or user defined).
MC – 2025/14/01 85

Tutorial – Load generators
There are three types of climatic load generators for 2D frames in SCIA Engineer:
• Wind generator
• Snow generator
• Wind & snow generator
For all these load generators, the example ‘2D climatic generators’ is used.
Example: 2D climatic generators.esa
Wind generator
Since there are no load cases automatically created by the wind generator, these have to be created manually.
Load cases:
• Self Weight (Permanent)
• Wind Left (Variable, load group exclusive)
• Wind Right (Variable, load group exclusive)
After creating these load cases, the wind loads can be added in the Load menu with the option Wind generator.
By using this wind generator, a frame distance has to be inserted. This has to be done to simulate the wind on a 2D
frame as if the wind would be on a complete 3D structure.
In the next window, the settings for the wind load calculation have to be inserted:
86

Chapter 6 - 2D wind- and snow generators (32-bit)
For the load case Wind Left, the direction is set to ‘From left’.
After clicking on OK in this window, the wind load from the left is generated and placed on the frame.
The same can be done for the wind load from the right.
The Load Coefficients are calculated according to the code, EN 1991-1-4.
For the vertical walls, table 7.1 of EN 1991-1-4 is used [1]:
MC – 2025/14/01 87

Tutorial – Load generators
In this example, h = 6m and d = 10m, so h/d = 0,6.
This value is between 0,25 and 1, so an interpolation has to be done between these two rows.
In the following picture [1], it can be seen that the zones D and E should be calculated:
88

Chapter 6 - 2D wind- and snow generators (32-bit)
For the roof, table 7.4a of EN 1991-1-4 is used [1]:
The angle α of the roof is 11,31°. The angle can be checked with the option Coordinates info in the Tools menu:
This means that an interpolation has to be done between the values for angle α 5° and 15°.
MC – 2025/14/01 89

Tutorial – Load generators
In the following picture [1], it can be seen that the zones G,H,I and J should be calculated:
In this example, the Cpe,10 values are used. The choice to use the Cpe,10 or the Cpe,1 values, can be made in the
National annex parameters. Also the option to take into account the internal pressure coefficients has to be set in these
parameters.
90


## Sayfa 91

Chapter 6 - 2D wind- and snow generators (32-bit)
The national annex parameters can be opened in the project data:
MC – 2025/14/01 91

Tutorial – Load generators
Snow generator
After generating the wind load in both directions, also the snow loads will be generated in this example.
For the snow loads, three load cases have to be created.
Extra load cases:
• Snow load 1 (Variable, exclusive)
• Snow load 2 (Variable, exclusive)
• Snow load 3 (Variable, exclusive)
After creating these load cases, the snow loads can be added in the Load menu with the option Snow generator.
By using this snow generator, a frame distance has to be inserted. This has to be done to simulate the wind on a 2D
frame as if the wind would be on a complete 3D structure.
After clicking on OK in this window, the snow load 1 will be generated on the roof elements.
The same can be done for Snow load 2 and 3.
92

Chapter 6 - 2D wind- and snow generators (32-bit)
The Load Coefficients are calculated according to the code, EN 1991-1-3.
Table 5.2 [2] is used for the load coefficients.
Since the angle α is 11,31° for this example, a load coefficient of 0,80 is used.
This is the case for Load mode 1.
The different modes (cases) are explained in article 5.3.3 of EN1991-1-3, figure 5.3 [2].
So for Snow load 2 and 3, there is a reduction of 50% of the snow weight.
Additionally, an accidental design situation can be taken into account. The need to take this into account is National
Annex dependent.
MC – 2025/14/01 93

Tutorial – Load generators
The different cases are shown in table A.1 of EN1991-1-3 [2].
In Belgium and the Netherlands, the cases B1, B2 and B3 do not need to be considered.
Wind & Snow generator
This generator is a combination of the wind and snow generator, which are described in the previous chapters.
This generator automatically creates:
• 2 new load groups
o Wind (variable, exclusive)
o Snow (variable, exclusive)
• Without over- and underpressure taken into account
o 3 new load cases
▪ WND – L – Wind from the left
▪ WND – R – Wind from the right
▪ SN – Snow loads
• With over- and underpressure taken into account
o 5 new loadcases
▪ WND – LO – Wind from the left - overpressure
▪ WND – LU – Wind from the left - underpressure
▪ WND – RO – Wind from the right - overpressure
▪ WND – RU – Wind from the right - underpressure
▪ SN – Snow loads
94

Chapter 6 - 2D wind- and snow generators (32-bit)
By default, the option to use over- and underpressure is grayed out. To be able to use this additional pressure, the
option Internal pressure for 2D wind needs to be activated in the National Annex parameters.
MC – 2025/14/01 95

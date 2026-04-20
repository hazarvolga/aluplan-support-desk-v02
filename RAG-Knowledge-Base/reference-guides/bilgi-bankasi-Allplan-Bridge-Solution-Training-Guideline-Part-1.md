# Allplan Bridge Solution Training Guideline Part 1

**Kategori:** Training Guidelines
**Kaynak:** `Allplan Bridge Solution_Training Guideline_Part 1.pdf`

---

**Toplam Sayfa:** 205


## Sayfa 1

Allplan 2023
Training
Part 1
Prestressed concrete bridge
November 2022


Allplan B ridge solution Training Part 1 Content
i
Content
Overview ........................................................................................... 5
Description of the example............................................................................................5
Parametric Bridge Model ............................................................ 7
Bridge Axis ........................................................................................................................... 7
Plan ............................................................................................................................................... 7
Profile ..........................................................................................................................................8
Cross section creation............................................................................................... 10
Layers........................................................................................................................................ 11
Superstructure Cross Section .................................................................................. 12
Pier Cross Section .............................................................................................................1 8
Pile cap Cross Section ....................................................................................................20
Piles Cross Section ........................................................................................................... 21
Sidewalk Cross Section ................................................................................................ 22
External boundaries for sidewalk ........................................................................... 23
Structural Members ................................................................................................... 26
Girder creation ....................................................................................................................2 6
Pier creation ........................................................................................................................ 30
Variables and Variations Definition .................................................................. 34
Internal prestressed Tendons............................................... 38
Tendon layout .....................................................................................................................39
Tendon Geometry ........................................................................................................ 41
Introduction ...........................................................................................................................4 1
Tendon groups .................................................................................................................. 43
Tendon definition ............................................................................................................. 44
Tendon geometry definition – Phase 1 .............................................................. 44
Tendon geometry definition – Phase 2 .............................................................. 47
Tendon geometry definition – Phase 3 ............................................................. 49
Placements on tendon ends ..................................................................................... 49
Free parametric modeling of Abutment ............................................................ 50
Tendon Prestressing ................................................................................................. 78
Introduction .......................................................................................................................... 78

ii Content Allplan Bridge 2023
Pre-stressing groups .................................................................................................... 78
Tendon properties .......................................................................................................... 80
Pre-stressing actions ....................................................................................................8 3
Diagrams of the prestressing force ......................................................................8 5
Construction schedule.............................................................. 87
New Construction and New Phase ....................................................................... 88
Tasks and Assemblies .............................................................................................. 90
First construction phase ............................................................................................... 91
Second construction phase ....................................................................................... 92
Third construction phase .............................................................................................9 4
Fourth construction phase ......................................................................................... 95
Fifth construction phase .............................................................................................. 96
Analytical Bridge Model ............................................................ 97
Beam elements ............................................................................................................. 99
Material ............................................................................................................................... 99
Material definition – import from Bimplus .......................................................100
Material definition - manually ..................................................................................100
Material assignment .....................................................................................................104
Groups ............................................................................................................................... 105
Structural Connections ......................................................................................... 106
Abutments..........................................................................................................................1 06
Soil Supports ....................................................................................................................... 111
Rigid connections ............................................................................................................ 112
Property Sets Definition ........................................................................................ 113
Property Sets for the Main Girder ......................................................................... 114
Construction stages for Analysis ................................................................... 123
Loads and Assemblies ................................................................................................. 124
First construction phase ............................................................................................ 126
Third construction phase ........................................................................................... 127
Fifth construction phase ............................................................................................ 128
SDL loads ............................................................................................................................. 128
Additional loads ........................................................................................................... 130
Settlement load ...............................................................................................................1 30
Temperature load ........................................................................................................... 132
Braking load .......................................................................................................................1 38
Wind load .............................................................................................................................140

Allplan B ridge solution Training Part 1 Content
iii
Traffic Loads ................................................................................................................. 145
Lane Sets .............................................................................................................................145
Load Trains ........................................................................................................................ 148
Centrifugal Loads (CFG) .............................................................................................149
Earthquake load ..............................................................................................................150
Superposition of loads ............................................................................................ 157
Superposition of temperature loads ...................................................................1 59
Superposition of settlement loads....................................................................... 162
Superposition of wind loads .....................................................................................1 63
Superposition of braking loads ...............................................................................1 63
Superposition of traffic loads ..................................................................................164
Superposition of earthquake loads .....................................................................168
Combination table ...................................................................................................... 170
Loading Groups ................................................................................................................. 171
Create a combination table ....................................................................................... 173
Combination type ........................................................................................................... 174
Combination Groups ..................................................................................................... 175
Calculation of combinations ..................................................................................... 176
Design Checks..............................................................................................................1 80
Results ................................................................................................................................ 191
Loads ....................................................................................................................................... 191
3D - Diagrams...................................................................................................................1 93
Tables .....................................................................................................................................194
Influence Lines ..................................................................................................................1 96
Transfer Analysis Model to ALLPLAN Bimplus ............................................. 197
Index .............................................................................................. 200


Allplan Bridge solution Training Part 1
5
Overview
In this Allplan training guide you will learn how to create a parametrical 3D
bridge model using Allplan Bridge and using Allplan Engineering for further de-
tailing.
This training guide is divided into several chapters:
• Geometrical bridge model
• Internal prestressing tendons
• Analytical bridge model
• Detailing and reinforcement modeling
The training guide is designed to guide you through an organized training and
to give you some bullet points to remember what you have learned during the
training. A detailed description of all available functions is not part of this guide.
You may use online help or step by step tutorials provided in the software, or
on the online platform Allplan Connect, for answering more detailed questions.
Description of the example
The used example is a hollow box concrete girder bridge with three spans. The
length of the bridge is 80 meters, and the span lengths are 25 + 30 + 25 me-
ters. The bridge has two piers with variable dimensions along the height of 10
meters. The bridge axis is curved in plan and in elevation.
The final 3D model is shown below:

6 Allplan Bridge 2023
In Allplan Bridge, the final geometrical model is a result of a calculation pro-
cess transforming the parametrical input values into actual geometry
data. Therefore, it is very important to recalculate the model each time af-
ter new changes have been made. The recalculation of the complete
model can be done by using one of the two available tools: Directly in the
title bar, there is an icon for model calculation. Alternatively. you may
use the tool for calculation , located in the separate task for Calculation
under the task area Recalculate.

Allplan Bridge solution Training Part 1
7
Parametric Bridge Model
In this chapter you will learn how to create a parametric bridge model with
Allplan Bridge.
Bridge Axis
In the first step you must create the bridge axis. To do so, you go to the pro-
ject navigation tree and open the submenu New Axis with the right mouse
button on the menu Axis. You create a new axis with the name RoadAxis.
The detailed definition of the axis parameters in plan and in profile is done by
using the two available task areas for Axis – Plan and Profile.
In the task area for plan, you define the necessary axis elements necessary
for describing the geometry in plan: point, line, circle or a spiral defined by the
radius at begin and end and the length or the spiral.
The task area for profile allows defining the elevation parameters by creating
polygon points along the axis. These points describe the axis elevation at the
required stations, and the respective rounding characteristics.
Hint: The user must open the respective view of the Axis (Plan or Profile) to
use the tools related to that view.
Plan
The bridge axis in this example consists in plan of three different elements:
Start point with coordinates and direction angle (zero); a circle defined by the
length and the radius; a spiral, defined by the begin and end curvatures and the
length;
The necessary steps for the axis creation in plan are listed below:

8 Allplan Bridge 2023
1. Point definition by using the icon Add point
2. Circle definition by using the icon Add circle
3. Spiral definition by using the icon Add spiral by length (L)
Profile


## Sayfa 11

Allplan Bridge solution Training Part 1
9
The profile of the bridge axis in this example consists of 3 polygon points de-
fined by the station and the height. The middle point is additionally defined by
the rounding type (intersection of tangents-R, parabola).
The necessary steps for the axis creation in profile are listed below:
Point 1: definition by using the icon :
Point 2: definition by using the icon :

10 Allplan Bridge 2023
Point 3: definition by using the icon :
All necessary parameters of the axis are now defined, after the above-de-
scribed steps have been executed.
In the case that errors have been made, there are two correction possibilities:
(a) Use the property window located on the right side of the main working
area. After clicking the wished element, the respective table will open. All the
fields are editable and after a modification the changes are immediately visible.
(b) It is possible to delete the last defined item using the tool for deletion lo-
cated in the Action bar and to define it anew.
Cross section creation
With Allplan Bridge you can quickly and easily create cross sections for any
structural part of the bridge structure.
To create a cross section, go to the project navigation tree. Right click the
menu Cross sections and choose the submenu New section. After that, a
new cross section with the default name will be created in the tree. The name
will stay active until the function is confirmed with Enter. The name can be im-
mediately redefined by the user, but also edited later, during the work in the
program.
Only the two main axes are visible in the Cross Section window when you
begin with the section creation (Y as a main vertical and Z as a main horizontal
axis).
There are four available icons in the upper right corner of the Cross Section
window:
(a) Full view - used for fitting the whole section in the window.

Allplan Bridge solution Training Part 1
11
(b) Show parametric lines/points - showing all parametric lines defined
for the section.
(c) Show structural beam unit mesh .
(d) The user can Export the active view to a PNG file format
Several task areas in the Cross Section task can be used for the Cross Section
creation.
The first task area to be used is Parametric Lines/Points. In this area you
create the necessary parametric lines using the tool for parallel line definition
, line created by two intersection points or line created by an angle .
Layers
Layers of different types of Cross Section elements are defined on the right
side of the Cross Section area in the Layers window:
Parametric Lines; Boundaries; Property Sets; Reference Sets; Grids
A new layer is created by clicking with the right mouse button at the empty
space inside of the layers window, and by choosing the function New Layer.
When the layer is created, it is possible to change its properties – the colour of
the line/fill - in the properties window above. These properties can be taken
over from the Default layer or the user can uncheck this option and choose
some other colour for the elements of the layer.
The default layer is the only layer defined in each project by default. This layer
has default properties for each element of the cross section. This means that
each element has some default colours assigned, like for example the blue
colour for the Boundaries.
In this example you will define separate layers for each Cross Section element,
and you will keep the default properties for all the layers.
Defined layers are: Tendons (includes all parametric lines and point grids used
for tendons), Property sets (includes all defined property sets).
The complete list of defined layers is given below:

12 Allplan Bridge 2023
There are 3 different visibility statuses which can be set for one layer:
- Red square – means that this layer is now active
- Yellow square – means that the elements of this layer are set to visi-
ble
- Both squares empty – means that the elements of this layer are set
to invisible
Information about the created layers is saved in the XML file which is exported
automatically with the TCL file. This additional information about the graphical
user interface settings is saved only in the XML file, which carries with TCL file
the complete information about the project. Therefore, it is always necessary
to have those 2 files saved together in the same folder, to have all project def-
initions saved.
Superstructure Cross Section
In our example, the first created Cross Section is the Cross Section of the su-
perstructure.
We create the new cross section with a right click in the navigation tree and
name it “Superstructure”.
Several parametric lines and points will be created to define this Cross Sec-
tion.

Allplan Bridge solution Training Part 1
13
To define the variability of the Cross Section it is necessary to create varia-
bles, and to assign those variables to the corresponding parametric lines. This
technique allows to define parameters, like height, thickness or angle, which
vary along the bridge axis.
The submenu Variables is automatically created in the tree after the creation
of the new cross section.
With a right mouse click on the menu Variables you choose the type of the
variable.
In Allplan Bridge you have the possibility to choose between different types of
the variables:
Type Length (used for parametric line type parallel or for parametric points)
Type Angle (used for parametric line type angle)
Type Temperature (used for property set type temperature)
Type Variable (no dimension)
The arrangement of the parametric lines, points and their dependencies are
shown below:
The direction of the arrows shows the dependency of the respective element.
This structure of dependencies between the parametric elements is very im-
portant for correctly describing the variation of the parameters along the
bridge axis.
After the lines have been created, you must define boundaries, which define
the edges of the cross section. Boundaries are created and edited in the task
area Boundaries, using several different tools for creation, editing and combi-
nation of boundaries.

14 Allplan Bridge 2023
You will use the icon “Boundary” to connect intersection points or para-
metrical points to create the outer boundary of the cross section.
Hint: You must close the whole boundary by clicking at the first point once
again before finishing the definition. This point will not be doubled; it is just the
necessary procedure to properly close the boundary. The direction of the
boundary creation is not important, and it will not influence any further step.
In order to create the 3D geometry and define structural elements, you need
to define a beam unit.
Hint: Cross Sections may be structured into several units, each of them de-
scribed by a boundary. In our example we have just one so-called “structural
unit” comprising the whole Cross Section.
The task area Structural Units is positioned next to the boundaries task area,
and it represents the logical step following the boundary definition. It consists
of three different tools for defining the structural units type Beam, Composite
and Node.

| You choose the tool for creating the beam unit . The Beam unit for the su- |
| --- |
| perstructure Cross Section is defined at the intersection point of the main |
| parametric lines Yloc and Zloc. |


Allplan Bridge solution Training Part 1
15
The window for Properties is located on the right part of the screen and it dis-
plays all the properties and parameters to be defined for a certain object. If
you select a specific object in one of the viewports or in the project navigation
window, the corresponding content is displayed simultaneously.
This allows for easy viewing of the object properties. Certain fields can be ed-
ited or changed via drop-down menus or by typing directly in the field.
Every input in the properties window requires recalculation because the
changes are not automatically taken over.
To connect piers to the superstructure you need to define reference points.
Those points are used to connect piers to girders but can also be used to de-
fine placements of smart placements. You will also define points to be refer-
enced in the tendon definition process. Those points can be reference points
or point grids.
Choose the tool for reference point creation in the task area Reference
points. Select the respective parametric line intersection or parametric point
to define the position the reference point. You will create one reference point
(Pier) at the bottom of the main girder section to be used for the connection

| The next step is to assign a boundary to the beam unit - this means the selec- |
| --- |
| tion of the boundary “Boundary 1” which is to be assigned to beam unit. |


| The structural units defined in the cross sections are used both for geomet- |
| --- |
| rical model creation and for analysis. The position of the structural unit within |
| the cross section defines the structural node of the element series and it is |
| only relevant for the analytical model and not for the geometrical model (i.e., |
| Import to ALLPLAN). |


16 Allplan Bridge 2023
to the pier cross section. And you create two additional points (Bearing_L
and Bearing_R) for placing smart placements.
The Points, which are used for the set up of smart placements, have to be
modified in the properties window.
To control the placing of smart placements you need to assign a variable
without dimension (Bearings in our case).
For tendon definition you will define two point grids with the function Point
Grids . You need to choose the intersection point representing the origin
point for the grid definition, and the direction of the local coordinate system of
the grid. Additional properties can be set in the properties window. Please re-
fer to the getting started example or online help for detailed questions.

| Grid2 |
| --- |
| Grid1 |


Allplan Bridge solution Training Part 1
17
There are also some additional features available in the Cross Section tab,
such as measure, delete and recalculate.
Using the icon for showing the fill of the beam unit , the main girder cross
section with created reference point, looks like shown below:

18 Allplan Bridge 2023
Pier Cross Section
The section of the pier is the second Cross Section you are creating.
Create the new cross section with a right click in the navigation tree and name
it “Pier”.
Several parametric lines will be created to define this Cross Section.
You create two variables of type length to define the variations of the pier
Cross Section.
W H
Width of the pier Height of the pier
cross section cross section
1.5 0.75
The arrangement of the parametric lines and their dependencies are shown
below:
To create the outer boundary of the cross section, you will use the icon
“Boundary” to connect the intersections of parametric lines.

| W | H |
| --- | --- |
| Width of the pier
cross section | Height of the pier
cross section |
| 1.5 | 0.75 |



## Sayfa 21

Allplan Bridge solution Training Part 1
19
You use the tool for rounding the boundary line to create rounded edges of
the cross section. You click on the respective boundary line and enter the
value of the distance. You will assign the variable H to this distance. The Cross
Section of the pier has now the following look:
In the next step you need to define the structural unit and the reference point
for the soil supports.
tion of the boundary Boundary 1. You will additionally define a reference point
for the pier cross section.
In the task area Reference points you choose the tool for reference point
creation . You select the parametric line intersection or parametric point to
position the reference point. You will create one reference point (RP) at the
intersection point of the two main parametric lines Yloc and Zloc.
Using the icon for showing the fill of the beam unit , the pier cross section
with the created reference point looks like shown below:

| Choose the tool for creating the beam unit . The beam unit for the pier Cross |
| --- |
| Section is defined in the center of the Cross Section (at the intersection point |
| of the two main parametric lines Yloc and Zloc). |


| The next step is to assign a boundary to the beam unit - this means the selec- |
| --- |
| tion of the boundary Boundary 1. |


20 Allplan Bridge 2023
Pile cap Cross Section
The next Cross Section you are creating is the section of the pile cap.
You create a new cross section with the right click in the navigation tree and
name it Pile cap.
Several parametric lines will be created to define this Cross Section.
The arrangement of the parametric lines and their dependencies are shown
below:
You will define the boundary and the beam unit for the pile cap cross section
with already described steps. The final cross section is shown below:

Allplan Bridge solution Training Part 1
21
Piles Cross Section
The section of the piles is the next Cross Section you are creating.
You create new cross section with a right click in navigation tree and name it
Piles.
Two parametric lines will be created to define this Cross Section.
The arrangement of the parametric lines and their dependencies are shown
below:
You will define three boundaries using the circular boundary tool with radius
0.6 m. After that, we will join these 3 boundaries into one, by using the func-
tion Plus-combination of boundaries.
It is also necessary to define one Structural Unit-Beam and assign it to the
(combined) boundary.
The final cross section is shown below:

22 Allplan Bridge 2023
Sidewalk Cross Section
The fifth Cross Section we are creating is the section of the sidewalk.
The Cross Section name is “Sidewalk”, and it will be created in the tree as a
new section under the menu Cross Sections. We start with the creation of
the first line, using the tool Line by angle . We choose the rotation point of
this line in the intersection point of the two main parametric lines (Zloc/Yloc)
and define the necessary angle of 0 degrees. By doing this, the new line will be
created exactly over the Zloc line. After that we create two new horizontal
lines by using the tool for Parallel line creation with the dependencies as
shown on the picture below.
Further on, we use the tool to create Line by relative angle and create the
new line with the angle of 90 degrees, which depends on the first created an-
gular line. Additionally, we need to create one new variable - Angle with the
name “inclVertical”, which we assign to the previously defined angular para-
metric line.
To create a variable, it is necessary to right click on the submenu Variables
under the Cross Section name “Sidewalk” in the Project navigation tree and
then to select the desired type of the variable and to define the variable name.
Using the tool for Parallel line creation we will create a new line with an off-
set of the 0.3 m from that line to the left. We create another parallel line from
the last created line to the right, with an offset of 1.2 m. The line for the top
edge of the sidewalk is the last line we need to create. This line will be created
by using the tool Line by angle which has the rotation point marked with
the red circle on the picture below and the inclination of -4%.
After all necessary parametric lines have been created, we draw the boundary
of this cross section by using the tool Boundary . We will then use the tool
Symmetric chamfer at boundary point and shape the necessary points
with the value of 0.03 m.
We don’t need to create a structural unit for this cross section, since it will be
used as an external boundary and inserted to the main girder cross section in
the next chapter. The final cross section of the sidewalk is shown below:

Allplan Bridge solution Training Part 1
23
External boundaries for sidewalk
The tool External Boundary is positioned in the Cross Section task, under
the group of tools related to the Boundary definition.
We use this tool to insert the already existing Cross Section of the sidewalk to
the main girder Cross Section.
We open the main girder Cross Section and select the tool External Boundary
. After that, we follow the instructions given by program.
At first, it is necessary to choose the point (intersection of some parametric
line and already existing cross section boundary), where the new boundary
will be placed.
After that the user must go to the Project Navigation Tree and select (click
once) the wished cross section. As the last step it is important to select the
wished Boundary inside of this section, which will be placed to the new sec-
tion.
After this step, the program will automatically switch to the main girder Cross
Section and the user will be able to choose the side and direction for position-
ing the new boundary, as well as to add an additional offset or spacing (this is
very important for the definition of stiffeners).
In this example we will position sidewalk boundaries at the points of the main
girder which are highlighted in the pictures below.

24 Allplan Bridge 2023
We need to position the sidewalk on both sides of the cantilever part and
therefore we will choose two different points in each iteration of inserting the
external boundary.
Additionally, we will define the necessary offsets from these points. This is
done in the Properties window on the right side of the Cross Section area.
To demonstrate this, we define the offset from the origin point of -1.2 m for
the sidewalk on the left side of the cantilever.
The next picture shows the left part of the main girder Cross Section with in-
serted external boundaries with the origin points as well as the positions of
the unit load:
The following picture shows the right part of the main girder Cross Section
with inserted external boundary, where the origin point is the same as the po-
sition of the unit load:
It is additonally necessary to adjust the values for the variables of external
boundary cross section.

Allplan Bridge solution Training Part 1
25
Since we defined a variable for the sidewalk, this variable will be available in
the properties window of the main girder cross section, when we select the
wished boundary.
We select the boundary of the right and left sidewalk and enter the value of
91.43 deg for the variable “inclVertical”.
By defining the variables in the cross section which will be used as an external
boundary, it is always possible to adjust the geometry of the new inserted
boundary to the geometry of the main Cross Section.
For each inserted external boundary, we need to create a new Unit Load .
These units of the main girder cross section represent a part of the geomet-
rical model, but they will also be used later in the Analytical part for the load
definition.
Using the icon for showing the fill of the structural unit , the final main
girder cross section with all the equipment, looks like shown below:

26 Allplan Bridge 2023
Structural Members
Structural members are the individual members of the model, which form a
geometrical unit such as a girder or pier. These units are defined separately
and referenced to each other. There are the following groups of the structural
members available: Girders, Piers and Structural Connections. Using the con-
text menu (right mouse button on the menu item) it is possible to create the
corresponding new member. A Structural member of any group can be de-
leted from the tree menu by using the context menu at the right mouse but-
ton or using the delete button from keyboard.
Girder creation
Girder definition includes several steps related to the modeling part:
• New girder
• Stationing
• Cross sections
• Variation
In this step you will combine the defined axis with the Cross Section into the
structural member.
For the structural member type girder, the defined axis is necessary. No pre-
defined axis is necessary for the structural member type pier.
The reference point used for the assignment of the cross section to the axis is
the intersection point of the two coordinate axes Yloc and Zloc of the Cross
Section.
How to interactively create a new girder:
- Right-clicking the Girder menu, or alternatively the Structural Mem-
bers menu, opens an additional list with the submenus where you se-
lect the New Girder submenu.
The new girder with the name Superstructure is created below the menu
Girder with the three automatically created submenus for Stationing, Cross
Sections and Variation.
It is possible to optionally edit the name and confirm with an Enter - the name
can be edited by clicking the F2 button while positioned on the girder name or
clicking the girder name three times.
- In the 3D Model viewport, click the axis along which the girder beam
should be created.

Allplan Bridge solution Training Part 1
27
- In the navigation tree, in the menu Cross Section, you click the cross
section you want to assign to the axis.
- Move the mouse in the viewport to set the desired starting position of
the girder on the axis and confirm the selection with a mouse click.
For the accuracy of the model (and possibly calculation), the consideration of
variations, the connection of piers at certain positions, etc., it is necessary to
subdivide the girder into sub-elements.
Stationing defines the start and end position of the girder on the axis and its
subdivision into elements.
The submenu Stationing is automatically created for defined girder.
If necessary, adjust the selected starting station in the opening input window
as shown below:
- Reposition the mouse in the viewport to set the desired end position
of the beam on the axis and confirm with a mouse click. If necessary,
adjust the selected end station in the opening input window. In the
same input window, define the subdivision of the girder or, in this case,
girder section, over the number or the length of the sub elements.
The defined length of the main girder elements is 2.5 meters.
From station zero to the station 80 we define elements with the length of 2.5
meters as shown in the table below:

28 Allplan Bridge 2023
Confirm the entry with OK and terminate the function with ESC.
The table of the stations is opening using the double left mouse click.
The table consists of: Input Station; Definition Type (Global - it refers to the
stationing of the axis, or Local – the starting position of the beam is assumed
to be zero and the station value refers to this local stationing); Global station
and Local station (automatic output from the entry in the previous column);
As Beam (only required for use as an analysis model); Smooth (Special func-
tion for rounding the edges when extruding the cross sections during model
generation).
Using the field Input Station, you can edit subdivision element lengths.
We define additional stations using member stations table at input stations:
0.5, 1.0, 2.0, 78.0, 79.0, 79.5 and set smooth to stations as shown below:


## Sayfa 31

Allplan Bridge solution Training Part 1
29
At any moment it is possible to insert or delete a girder station interactively in
the 3D model viewport by using the context menu on the right mouse button.
Available functions on the right mouse click are Insert stations and Delete
stations.
For inserting the station, it is important to choose the wished Cross Section in
the project navigation tree, which will be assigned to the new station.
The cross sections table allows the assignment of the Cross Section to the
individual station points of the subdivided girder. This step is automatically
done during the interactive girder creation or can be subsequently performed
and edited manually in this table.
Cross Sections are assigned before and after each station point to allow sud-
den changes of the Cross Section or jumps in the variation. The Cross Section

30 Allplan Bridge 2023
Variant is automatically calculated in this table after the variation assignment
in the next step.
The variation table will be used later and therefore also explained in the re-
spective chapter 5.
Select the Superstructure girder in the navigation tree and set the CS Plane to
vertical in the properties window.
The detailed description of all tables for Stationing, Cross sections and Varia-
tions and the way of editing and assignment of different objects can be found
in the Online Help. Help is directly available in the program by clicking the F1
button or you can use the icon in the upper right corner of the title bar to
open the function Help.
Pier creation
Pier members require the girder as a reference component for their definition.
The geometric position of the pier- girder connection is defined by the super-
structure reference point, which was earlier defined in the Cross Section of
the girder at the corresponding position (Pier).
Piers do not require an axis for their definition, because they are automatically
generated in vertical direction. The axis of the pier is connected to the main
girder reference point in the station 0. The definition of the pier is following the

Allplan Bridge solution Training Part 1
31
direction of the Y-axis (positive upwards). The interactive graphic definition of
the pier defines first the top of the pier (end position / station) and then the
bottom of the pier (initial position / station).
The interactive creation of the pier is done in a similar way as for the girder
and it is described in the Online help with all necessary details and tips.
The main difference is that for the pier creation in 3D viewport you must addi-
tionally choose the reference point of the girder to which the pier is connected
(Pier), as well as the station of the main girder (geometric position) where the
pier is located.
In this example you will define two piers with the height of 10 meters, pile caps
and piles: Pier 1 – at the Superstructure station of 25 m and Pier 2 at the Su-
perstructure station of 55 m.
The start point of the pier is station zero (bottom of the main girder) and the
end point is station -20 m. The cross section used for both piers is the previ-
ously defined pier Cross Section (Pier).
To define different element lengths and cross sections you must perform
several steps during the interactive pier definition.
From station 0.0 to station -10.0 you define elements with the length of 2.5
meters and the Cross Section “Pier” like shown in the table below:

32 Allplan Bridge 2023
From station -10.0 to -12.0 you define 1 element (length 2m) and the Cross
Section “Pile cap” like shown in the table below:
From station -12.0 to -22.0 you define 2 elements with a length of 5 me-
ters, and the Cross Section “Piles” like shown in the table below:
The tables for Stationing, Cross Sections and Variation of the pier are orga-
nized in the same manner than the ones for the structural member Girder.

Allplan Bridge solution Training Part 1
33
Editing and filling the tables is done in the same way and following the same
logic. For any questions, please follow the additional instructions given in the
Online Help.
We use the member stations table to define an additional station at 0.1 and
set the options “As Beam” and “Smooth” as shown below:
You repeat the steps to define the same pier at superstructure station
55.0 m.
Then, the state of the 3D bridge model looks like shown below:

34 Allplan Bridge 2023
Variables and Variations Definition
In order to capture the variation of the variable parameters of the cross
sections you need to create Variations (tables or formulas) and link them to
variable parameters of each structural member.
It is necessary to define the Variation for each variable dimension value, so
that the program can apply the variation of the Cross Section. The actual val-
ues are defined for several existing stations along the axis. These values, and
appropriately interpolated values between these stations, will replace the
dummy values defined during the definition of the variables. Two different in-
puts are possible: New Table or New Formula.
With the right mouse click you will create two new Tables, two for the pier
(PierW, PierH).
Values (Y) along the axis for several stations (X) will be given for each table.
The desired interpolation type of the curve (transition) between two subse-
quent points can be chosen from the drop-down menu:
- Constant - The defined value is kept constant until the next value.
- Linear - The defined value is linearly interpolated to the next value.
- Parabolic (horizontal at the beginning) - The defined value is parabolically
interpolated, with a horizontal tangent at the beginning (at the first value).
- Parabolic (horizontal at the end) - The defined value is parabolically inter-
polated, with a horizontal tangent at the end of the interval (the next
point in the table).
- Parabolic (horizontal at both ends) - The defined value is parabolically in-
terpolated, with a horizontal tangent at the beginning and at the end of
the interval (at the first and subsequent point).
All entries and the graphical presentations for each table are shown below:
Table: PierW
X Y Transition
-15 0.75 Linear
0 1.5 Linear

| X | Y | Transition |
| --- | --- | --- |
| -15 | 0.75 | Linear |
| 0 | 1.5 | Linear |


Allplan Bridge solution Training Part 1
35
Table: PierH
X Y Transition
-15 0.5 Linear
0 0.75 Linear
Hint: Navigation and editing of the table is done in a common and simple way.
For any additional instructions please check Online Help which contains a de-
tailed description of the individual menus and functions of the Allplan Bridge
user interface. Help is available directly in the program by clicking the F1 but-
ton or you can use the icon in the upper right corner of the title bar to open
the function Help.
When the required Variations have been defined, there is still one additional
step missing. This is the proper assignment of the Variations to the structural
members.
The Variation table of structural members allows the assignment of the tables
or formulas to a variable at the individual station points of the subdivided

| X | Y | Transition |
| --- | --- | --- |
| -15 | 0.5 | Linear |
| 0 | 0.75 | Linear |


36 Allplan Bridge 2023
girder. To allow jumps in the Variation, Tables or Formulas are assigned, analo-
gously to the cross sections, before and after each station point,.
The fastest way to assign the table to a variable at some station is to use drag
and drop of the wished variation table from the Variations menu to a specific
field of the variable´s column, called “Expression”. The table should be dragged
to the heading (name of the variable) of the variable column. An alternative
way is to manually assign a table or formula to the station – the fastest way is
to type the value for the first station and then, using the right mouse click, to
apply the expression to subsequent stations.
Apply variables and values for both piers as shown below:
The detailed description of the Variation table and the way of editing and as-
signing different objects can be found in Online Help. Help is available directly in
the program by clicking the F1 button or you can use the icon in the upper
right corner of the title bar to open the function Help.
The state of the 3D bridge model, after the variables have been assigned, is
shown below:

Allplan Bridge solution Training Part 1
37

38 Allplan Bridge 2023
Internal prestressed Tendons
Post-tensioned tendons running in ducts are here referred to as internal ten-
dons. These tendons as well as other tendon types and complex geometries
can be easily modelled in Allplan Bridge (internal and external tendons, trans-
versal and vertical tendons, pre-tensioning and post-tensioning).
In Allplan Bridge, the geometry of a tendon is automatically generated based
on user defined points in 3D along the bridge structure. The user defines ref-
erence points in the Cross Section and the stations of the bridge for specify-
ing constraint points for the tendon geometry. Plan and elevation angles and
curvature radius can be specified as additional constraints. Certain parame-
ters can be set to free. That means that the value will be optimized in accord-
ance with the condition that the tendon losses are minimized.
The bridge in this example is built with span-by-span construction method
and it considers three construction stages. Therefore, the geometry and the
prestressing of the tendons will follow the same construction schedule.
In this example, the tendon geometry will be defined for tendons arranged in
four tendon groups.
The final tendon geometry is shown below in the 3D view:
The detailed layout of the tendons with the position of the tendons in the
cross section is explained in the following steps.


## Sayfa 41

Allplan Bridge solution Training Part 1
39
Tendon layout
First construction stage
This stage consists of tendon group Phase 1. The tendon group consists of
five tendons, and they have the following layout:
Tendon group: Phase 1
Second construction stage
This stage consists of tendon group Phase2 which consists of five tendons,
and they have the following layout:
Tendon group: Phase 2

40 Allplan Bridge 2023
Third construction stage
This stage consists of tendon group Phase 3. This tendon group consists of
five tendons, and they have the following layout:
Tendon group: Phase 3
Tendon points in the Cross Section plane can be defined by using Reference
Points or defining Points Grids.
In this example you will use point grids. It was already described in the previ-
ous chapter how to create them.

Allplan Bridge solution Training Part 1
41
Tendon Geometry
Introduction
In the project navigation tree, you can find several vertical and horizontal
Tabs. These tabs make the user interface simpler to use, by separating the
project navigation tree into different logically organized parts: Geometry and
Analysis, which are further structured.
For the definition of the tendon geometry, you will use the tab Tendon tab un-
der the Main Geometry tab, which is offering the tree of tendons organized
under the created tendon groups.
The main working area on the right side is divided into three separated win-
dows - 3D/Plan/profile View; 2D Cross section View and the Table. Those
windows together govern the workflow for defining the tendon geometry.
Below, the screenshot from the finished example is shown, where all the win-
dows are visible:
The upper window represents the view of the structure, which can be
switched, according to the user wish, between 3D Model, Plan and Profile.
This window allows the interactive definition of the tendon geometry directly
on the bridge model by choosing the stations in the appropriate view.

42 Allplan Bridge 2023
The left bottom window always shows the selected Cross Section in 2D (if
the section is selected in the interactive window during geometry definition,
and also if you choose some row in the tendon geometry table). In this pre-
view the user can see the cross section and select the points necessary for
the tendon geometry definition – point grids or reference points. Also, the
preview is showing the local coordinate system used for tendon geometry
definition.
The right bottom window contains the Table with the detailed information of
the tendon geometry.

Allplan Bridge solution Training Part 1
43
Tendon groups
An empty window on the right side will open, when the tab Tendon is selected
for the first time in the project. Click with the right mouse button anywhere on
this empty area and choose the function “New tendon group”.
As mentioned before, you will define 3 tendon groups in total: Phase 1, Phase
2, and Phase 3.
The complete list of the tendon groups with tendons is shown below:

44 Allplan Bridge 2023
Tendon definition
Each tendon group consists of separate tendons. Their geometry is deter-
mined by the defined point grids in the cross section and by the stations in the
longitudinal direction.
From the context menu of the group Phase 1 you choose the option New
Tendon. You create the first tendon in this group with the name Tendon 1-1.
The Phase 1 consists of 5 tendons. You will first define the Tendon 1-1 and then
copy it multiple times.
Tendon geometry definition – Phase 1
For the definition of the tendon geometry, you will use the function “Insert
points between the stations” from the Tendon task and the task area Point
Geometry.
In the first step, for the geometry of the Tendon 1-1, you need to choose the
start (station 0.5m) and the end (station 30.0m) point of the tendon.
Selecting the first station of the tendon in the 3D model:
Selecting the second station in the 3D model:

Allplan Bridge solution Training Part 1
45
In the next step you need to select the point of Grid1 to be used for the Ten-
don 1-1. You are choosing the point P1:1 and the selection is shown below:
With this selection, the function “Insert points between two stations” is
finished, and the table with the tendon geometry details is automatically filled.
The table of the tendon points of Tendon 1-1 has the following look:
In this table you can see the stations, where the tendon is defined, and you can
also see, which points from the cross section are taken for the geometry defi-
nition of the tendon.
Other important values from the table are:
e-u and e-v – eccentricities in local coordinate system u-v
-u and -v - angles in the s-u and s-v plane for the definition of the tan-
α α
gent direction
R – rounding radius of the tendon geometry
Curve Type – Straight, Spline, Arc s-u* (Begin/End), Arc s-v* (Begin/End)
*In addition to the definition of the section between two points as a straight
line or a general spline, it is also possible to define an arc in the s-u plane

46 Allplan Bridge 2023
(ground plan, type
Arc s-u) or in the s-v plane (elevation plane, type Arc s-u).
It is possible to edit the table values at any time later, directly in the table or in
the properties window on the right side of the working area.
You delete the tendon point at station 1.0 m, change the parameters for e-v
offsets and change the reference type to Grid2 at station 25.0 as shown
below:
Additionally, you will define straight parts at the beginning and end of the ten-
don. Select the Tendon 1-1 in the navigation tree and set straight at begin and
straight at end to 1 m.
When you have finished with all the definitions related to the Tendon 1-1, you
will use multiple copy and move function to create all the remaining tendons in
the group Phase 1.
On the right mouse click in the context menu of the Tendon 1-1 you can find
additional functions. Choose the function “Multiple copy and Move” and enter
the name of the new tendon Tendon 1-2 in the window.

Allplan Bridge solution Training Part 1
47
After that, you choose the begin station (you can skip this step with pressing
enter) for the new Tendon 1-2 (the same station as for Tendon 1-1 – 0.5 m) as
well as the wished tendon point in the 2D Cross Section view (Grid1; P1:3). Re-
peat the process to copy the tendon to all marked points shown below and
create tendons: Tendon 1-3, Tendon 1-4 and Tendon 1-5.
The copied tendons are automatically created and all other geometry defini-
tions are taken over from the Tendon 1-1 table.
Tendon geometry definition – Phase 2
You create the tendons Tendon 2-1 via point P2:1 as shown below:
You use the function “Insert points between the stations” again to define
additional tendon points between station 20 m and 60.0 m through Grid 1
point P2:1.

48 Allplan Bridge 2023
Now you change some values in the tendon point table to match the table be-
low:
The creation of the other Tendons is done in the same manner as at Tendon 2-
1.
The Creation of Tendon 2-2 is via point P4:1, Tendon 2-3 via point P6:1, Tendon
2-4 via point P8:1 and Tendon 2-5 via point P10:1.


## Sayfa 51

Allplan Bridge solution Training Part 1
49
Tendon geometry definition – Phase 3
Now you create the tendon groups Phase 3 with using similar steps.
Tendon group Phase 3:
You create the tendons Tendon 3-1, Tendon 3-2, Tendon 3-3, Tendon 3-4
and Tendon 3-5 through points P1:1, P3:1, P5:1, P7:1, P9:1 as shown below:
By opening the function Create PDF document it is possible to get the report
of the tendon geometry for each separate tendon. This function is found in
the context menu behind the wished tendon name in the tendon list.
The preview of this document is automatically opened when the document is
saved by the user. A name is also automatically given to the document and it
can be changed. The document consists of the table for wished tendon geom-
etry as well as of the plan and elevation view of the tendon together with the
bridge structure.
Multiple selection of the tendon points in the table of the tendon geometry
and of the tendons in the list enables the deletion of several tendon points and
tendons and makes the definition and changes faster.
Placements on tendon ends
It is possible to define geometrical anchor object for each tendon begin and
end. In tendon properties under “Placement”, the name of a library object from
Allplan Engineering, which is to be placed on tendon begin or end can be speci-
fied. Only Smart Symbols can be used for smart placements, and they must be

50 Allplan Bridge 2023
stored under Library/Project/Current Project/Contents. This smart symbol
will then, after import to Allplan, be automatically placed at the begin and/or
the end of the corresponding tendon.
Define placements for tendons as shown in table below:
Tendon Anchor at Anchor at End
Begin
Tendon 1-1 Anchor Anchor
Tendon 1-2 Anchor Anchor
Tendon 1-3 Anchor Anchor
Tendon 1-4 Anchor Anchor
Tendon 1-5 Anchor Anchor
Tendon 2-1 Anchor Anchor
Tendon 2-2 Anchor Anchor
Tendon 2-3 Anchor Anchor
Tendon 2-4 Anchor Anchor
Tendon 2-5 Anchor Anchor
Tendon 3-1 Coupler Anchor
Tendon 3-2 Coupler Anchor
Tendon 3-3 Coupler Anchor
Tendon 3-4 Coupler Anchor
Tendon 3-5 Coupler Anchor
Tip: For faster editing the tendon properties use multi selection.
All other tendon properties will be described in the chapter Analytical Bridge
Model.
Free parametric modeling of Abutment
In the new Allplan Bridge Version 2023-0, the feature of Free Parametric
Modelling was introduced. This enables parametric modeling of the bridge or
its elements freely in 3D space. With this new functionality it is possible to

| Tendon | Anchor at
Begin | Anchor at End |
| --- | --- | --- |
| Tendon 1-1 | Anchor | Anchor |
| Tendon 1-2 | Anchor | Anchor |
| Tendon 1-3 | Anchor | Anchor |
| Tendon 1-4 | Anchor | Anchor |
| Tendon 1-5 | Anchor | Anchor |
| Tendon 2-1 | Anchor | Anchor |
| Tendon 2-2 | Anchor | Anchor |
| Tendon 2-3 | Anchor | Anchor |
| Tendon 2-4 | Anchor | Anchor |
| Tendon 2-5 | Anchor | Anchor |
| Tendon 3-1 | Coupler | Anchor |
| Tendon 3-2 | Coupler | Anchor |
| Tendon 3-3 | Coupler | Anchor |
| Tendon 3-4 | Coupler | Anchor |
| Tendon 3-5 | Coupler | Anchor |


Allplan Bridge solution Training Part 1
51
model bridge elements by using 3D prism elements. Here, in this project, we
will use this feature to create the abutment structures. On the following
pages, you will find a step-by-step description of how this is done for the left
abutment.
The abutment consists of several parts, each of which can individually be
viewed as generalized prismatic body. This means, they can be described by
an axis and 2 congruent Cross Sections at begin and end, like a beam element.
In our abutment, these parts are the foundation plate, the abutment bench,
the abutment wall, 2 wing walls and a drag plate.
For separating the different prismatic parts of the complete abutment, we
generally assume vertical Cross Sections and horizontal axis directions, for
most parts in longitudinal direction of the bridge. Additionally, we must define
a reference point on the superstructure for correctly positioning the abut-
ment within the overall structure.
This is done in the first step:
First, we add 1 reference point at the Cross Section “Superstructure” – it is
placed at the intersection of the main axes “Zloc / Yloc”:

52 Allplan Bridge 2023
We rename this newly created reference point to “FF1”.
The abutment wall is separated in 2 parts: the front part (abutment bench)
where the bridge bearings are resting on the surface, and the rear part reach-
ing up to the roadway surface.
As next we start with the modelling of the abutment wall. For this, we draw a
new Cross Section named “AbutmentWall1” with parametric lines and bound-
ary as shown. This front part has also side walls reaching up to approximately
half of the box section of the superstructure as can be seen in the Cross Sec-
tion below.
With this section it is possible to create the first 3d prism – the function is
found in the 3d Modeling menu in the action bar “Prism” or via right
click on “Bodies”:

Allplan Bridge solution Training Part 1
53
We choose “New” and name it “Abutm1_Wall1”. As next choose the reference
point “FF1” as base reference. Next step is to choose the cross section “Abut-
mentWall1”:
We set the function properties (at the right side) as it is shown here:
For the length and position of GP2 we choose 1,25 m (depth of abutment):

54 Allplan Bridge 2023
After confirming the GP2, the first 3d prism is created (from GP1 to GP2).
In the next step the prism is moved onto its planned position – for this, we left
click on the 3d prism and choose “Move”:

Allplan Bridge solution Training Part 1
55
We choose the reference point “FF1” with left click and then define the direc-
tion via input of x = -0,25 m; y = 0; z = 0 (you can switch between these values
by pressing “Tab”). After the input, confirm with “Enter”:

56 Allplan Bridge 2023
The result looks like as shown:
For checking and, in case if it is necessary, adjusting these last parameters of
this prism, you need to right click on the prism name at the left side in the table
and choose “Transformations”:
In the Transformations table all the transformations of the created bodies are
listed, and the parameters can be changed at any point of time if needed:

Allplan Bridge solution Training Part 1
57
As next, we create the Abutment footing (foundation plate) with the width of
10 m and the depth of 1,5 m. We start with the respective Cross Section, cre-
ate it with the name “Abutment_Footing” and with following elements:
In the next step, we create the 3d prism – we choose “New” body:
We choose “New” and name it “Abut1_Footing”. As next we choose the refer-
ence point “FF1” as base reference. The next step is to choose the wished
cross section “Abut_foot”:

58 Allplan Bridge 2023
We set the function properties (at the right side) as it is shown here:
For the length and position of GP2 we choose 3,5 m (dimension of the plate in
longitudinal direction):


## Sayfa 61

Allplan Bridge solution Training Part 1
59
After this, the 3d prism is created.
In the next step it is moved onto its planned position – to do so, we left click on
the 3d prism and choose “Move”. We choose the reference point “FF1” with
left click and then define the direction via input of x = -1,5m; y=0; z=0 (you can
switch between these values by pressing “Tab”). You can deactivate the di-
rections y and z in the settings window. After the input, you confirm with “En-
ter”:
The result looks then like this:

60 Allplan Bridge 2023
Now we create the rear part of the abutment wall – we start with the respec-
tive Cross Section. We will copy the existing Cross Section AbutmentWall_1
and rename this copy to “AbutmentWall_2”.
Then we delete the existing boundary and create a new one with following el-
ements:

Allplan Bridge solution Training Part 1
61
In the next step, we create the 3d prism – same as before, and choose again
to create a “New” body:
We choose “New” and name it “Abut1_Wall_2”. As next, we choose the refer-
ence point “FF1” as base reference. in the next step we choose the wished
cross section “AbutmentWall_2”. We set the function properties (at the right
side) as it is shown here:

62 Allplan Bridge 2023
For the length and position of GP2 we choose 0,25 m (thickness of the wall).
After this, the 3d prism is created. In the next step, this prism is moved onto its
planned position – for this, we left click on the 3d prism and choose “Move”.
We choose the reference point “FF1” with left click and then define the direc-
tion via input of x = -0,5 m; y = 0; z = 0 (you can switch between these values
by pressing “Tab”). After the input, confirm with “Enter”.

Allplan Bridge solution Training Part 1
63
The result looks then like this:

64 Allplan Bridge 2023
As next, we create the drag plate – We start with the respective Cross Sec-
tion. We create it with the name “AbutmentDragPlate” and with following ele-
ments:
In the next step we create the 3d prism – like before, we choose again to cre-
ate a “New” body:
We choose “New” and name it “Abut1_DragPlate”. As next we choose the
reference point “FF1” as base reference. The next step is to choose the
wished cross section “AbutmentDragPlate”. We set the function properties
(at the right side) as it is shown here:

Allplan Bridge solution Training Part 1
65
For the length and position of GP2 we choose 5 m. After this, the 3d prism is
created. In the next step, this prism is moved onto its planned position – for
this, we left click on the 3d prism and choose “Move”. We choose the refer-
ence point “FF1” with left click and then define the direction via input of x = -
5,5 m ; y = -0,5 m ; z = 0 (you can switch between these values by pressing
“Tab”). After the input, we confirm with “Enter”.

66 Allplan Bridge 2023
In the next step, we apply a rotation onto the prism – we click on the 3d prism
and choose the function “Rotate”.
As first point we choose the reference point “FF1” with a left click and then we
define the rotation axis by definition of a second point via input of x = 0 ; y = 0 ;

Allplan Bridge solution Training Part 1
67
z = 1 (you can switch between these values by pressing “Tab”). After the in-
put, we confirm with “Enter”.
As next, the rotation angle needs to be defined. With a left click on the shown
point we define the angle start point:
Then you input next to the mouse cursor the angle value of 2.865degree.

68 Allplan Bridge 2023
The result looks then like this:
As next, we create the first Wingwall – We create and name the new Cross
Section “AbutmentWing_L”. We draw the parametric lines, the boundary, the
unit, the 6 reference points and the 1 Variable (Wing_h) as shown below:


## Sayfa 71

Allplan Bridge solution Training Part 1
69
In the next step we create the 3d prism via “New” body:
We choose “New” and name it “Abut1_Wing_L”. As next we choose the refer-
ence point “FF1” as base reference. The next step is to choose the wished
cross section “AbutmentWing_L”. We set the function properties (at the right
side) as it is shown here:

70 Allplan Bridge 2023
For the length and position of GP2 we choose 5 m. After this, the 3d prism is
created. In the next step, this prism is moved onto its planned position – for
this, we do a left click on the 3d prism and choose “Move”. We choose the ref-
erence point “FF1” with left click and then we define the direction via input of x
= -5,5 m; y = 0; z = 0 (you can switch between these values by pressing
“Tab”). After the input, we confirm with “Enter”.
In the next step, we cut a part of this prism off – This is done with a left click on
the object and then with the function “Slice”.

Allplan Bridge solution Training Part 1
71
To define the cutting plane, we select the marked reference points 1-3. Then
we select the side, which should be subtracted (4) from the object:
After confirming with a left click, the prism looks like this:

72 Allplan Bridge 2023
Now we create the second Wingwall – We create and name the new Cross
Section “AbutmentWing_R”. We draw the parametric lines, the boundary, the
°
7 reference points and the 1 Variable as shown below:
In the next step we create the 3d prism via “New” body:

Allplan Bridge solution Training Part 1
73
We choose “New” and name it “Abut1_Wing_R”. As next we choose the refer-
ence point “FF1” as base reference. The next step is to choose the wished
cross section “Abut_wingR”. We set the function properties (at the right side)
as it is shown here:
For the length and position of GP2 choose 5 m. After this, the 3d prism is cre-
ated. In the next step, this prism is moved onto its planned position – for this,
we left click on the 3d prism and choose “Move”. We choose the reference
point “FF1” with left click and then define the direction via input of x = -5,5 m ; y
= 0 ; z = 0 (you can switch between these values by pressing “Tab”). After the
input, we confirm with “Enter”.

74 Allplan Bridge 2023
In the next step, we cut off a part of this prism – This is done with left a click on
the object and then with the function “Slice”.
To define the cutting plane, we select the marked reference points 1-3. Then
we select the side, which should be subtracted (4) from the object:
After confirming with a left click, the prism looks like this:

Allplan Bridge solution Training Part 1
75
As next we define the material properties and the IFC attributes for the Abut-
ment prisms. For this, we mark all the Abutment prism elements with
SHIFT+left Click and then go to the right side properties and set the material to
“EN: C35/45” and the IFC attributes to “ABUTMENT” :

76 Allplan Bridge 2023
The result looks like this:
We can save elements of the first Abutment as a Template in order to make it
easier to create an abutment on the other side of the bridge.
In this case you will have such set of templates:

Allplan Bridge solution Training Part 1
77
By choosing the template you can easily create second abutment at station
80m.
The result looks like this:

78 Allplan Bridge 2023
Tendon Prestressing
Introduction
The tendon stressing procedure is defined under the tabs Analysis/Tendon
Stressing.
After the first stress group has been defined, the user gets two new win-
dows, which open after a double click on the defined group. Those two win-
dows, together with the new task area Tendon Stressing under the task
Analysis, are used for the definition of the tendon stressing procedure.
The picture below shows the final view of the windows, when the definitions
are completed:
On the left side we can see the complete list of groups and tendons for which
stressing actions are defined. On the right side there is a table showing the
defined stressing actions and below is the diagram of the prestressing force
distribution including losses, which is automatically created, when all defini-
tions for tendon stressing are completed.
Pre-stressing groups
We need to create two groups of tendons for prestressing of the bridge
structure in accordance with the span-by-span construction method.


## Sayfa 81

Allplan Bridge solution Training Part 1
79
A new stress group is created in the Tendon Stressing tab (vertical tab in the
Project Navigation Tree) by clicking with the right mouse button on the
empty space and using the function New Stress Group. We will create two
stress groups: “Group 1” and “Group 2”.
The number and the content of the stressing groups is set in accordance with
the way of prestressing. Therefore, we will organize our existing tendons in
the stressing groups as following:
- In “Group 1” we will prestress all the tendons from the tendon geome-
try groups “Phase 1”.
- In “Group 2” we will prestress all the tendons from the groups “Phase
2” and “Phase 3”.
To speed up the whole process, it is possible to use the drag and drop function
and drag and drop wished tendons or tendon groups from the Geome-
try/Tendons to corresponding stressing groups under Analysis/Tendon
Stressing.
As additional workflow, it is also possible to adjust the tabs in the Project nav-
igation tree differently by setting the Analysis tab to Floating. With the right
mouse button, you click the Analysis tab and set it from “dockable” to “float-
ing”.
You organize Geometry and Analysis tabs like shown on the screenshot be-
low and select group “Phase 1”. After that you drag and drop it to the stress
group “Group 1” on the right side.

80 Allplan Bridge 2023
The stress group “Group 1” now contains all necessary tendons from both
groups.
It is necessary to do the same for the stress group “Group 2” by drag and
dropping the rest of the groups from the left side to this stressing group.
The complete list of stress groups with all the tendons is shown above.
Now, when we have created the wished groups with tendons, we can con-
tinue with the definitions related to the tendon stressing.
Tendon properties
The Properties window on the right side of the working area is open and we
will define additional parameters important for the tendons.
Before creating the tendon stressing procedure, it is necessary to define
some additional parameters for the tendons. Since all the tendons, belonging
to the same group, have the same properties, we select all the tendons from
one group by using the multiple selection. In that way we define the same
properties for all the tendons at once.
In the “Getting started example” and in the Online Help the Properties of the
tendons are described more in detail. To define the material for the tendons
we need to add the missing material to the project library.
The material can be defined manually as shown below:

Allplan Bridge solution Training Part 1
81
We go to the tab Analysis and define the necessary New Material for pre-
stressing steel under the tab Materials, with using the context menu of the
existing Standard - EN, as defined below:
The material can also be imported from the Bimplus Library.
Additionally, we must define the Tendon numbering.
Only tendons, which are numbered, will be included in the analytical model
and exported to the analysis software with the rest of the bridge struc-
ture.

82 Allplan Bridge 2023
It is also important to number the tendons for which we want to calculate
the prestressing losses and to get the prestressing force distribution dia-
gram.
The option Auto-Numeration (positioned in the group of tasks for Calcula-
tion, under the task area Analysis) allows the user to get the complete num-
bering of the model automatically. Activating this option includes automatic
numbering of the structural members, structural connections and the ten-
dons.
In this part we will define the numbering of the tendons manually.
The individual tendons can be numbered in the Properties window in the field
Tendon number.
It is also possible to number all the tendons from the same group in one step.
This can be done in the tab Geometry under the tab Tendons in the list of de-
fined groups and tendons for geometry.
With the right mouse click on the wished tendon group you choose the option
Enumerate Tendons. It is necessary to enter the number only for the first
tendon from the group and all other tendons will be numbered subsequently.
Numbering of the tendons is done in the following way:
Group “Phase 1”: 101-105
Group “Phase 2”: 201-205
Group “Phase 3”: 301-305
In the table below, we can see all other definitions which should be entered for
the tendons of the “Phase1”:

Allplan Bridge solution Training Part 1
83
The same properties should be entered for the tendons of “Phase 2 and
Phase 3”.
Pre-stressing actions
The next step is the definition of the prestressing actions. There are two lev-
els of definitions. The first (higher) level is definition related to the complete
group. All definitions made here are also related to each tendon of that group.
The second (lower) level is definition related to a specific tendon.
Here we can define some special details for prestressing related only to a cer-
tain tendon, if it differs in some way from the other tendons in the group.
Therefore, if we select the group, we will see one table in the right upper win-
dow, and if we select a tendon, the table will be different.
The group of functions related to prestressing definitions is arranged in the
task Analysis, in the task area Tendon Stressing. There are 3 functions:
Stress, Wedge Slip and Release.
We will use them to stress the tendons as specified in the project. Please note
that these functions are only available when the corresponding group is se-
lected in the pre-stressing view list on the left under the horizontal tab Analy-
sis.

84 Allplan Bridge 2023
First, we will define the prestressing for the whole group of tendons in the
Phase 1. We select the Phase1 from the list and follow the steps explained be-
low.
We choose the function Stress. The line for stressing is automatically cre-
ated in the table. The tendons of the “Phase 1” are stressed in the first con-
struction stage and they will be stressed from both sides, from the begin and
the end of the tendons. These options, Begin, End or Both, can be chosen
from the drop-down menu in the corresponding field Side in the table.
The stressing level of the tendons can be specified by force or by a factor. The
factor is related to the maximum allowable force/stress in the tendon defined
for the respective pre-stressing steel. We will choose here the factor 1 and
stress the tendons at the begin and end to the maximum force.
After that we will choose the action Wedge Slip and enter the value of 6
mm for the wedge slip of the tendons at begin and end.
The necessary definitions for the “Group 1” are shown in the table below:
We will select now the first tendon from this group – “Phase1:Tendon1-1” and
the table will appear with the same values taken over automatically from the
group definitions:
Here we have the possibility to change some values in the table (factor, force
value and length) and all the changes will be accepted for this tendon only.
As visible in the table, there is a value for the Force (KN), and this value is cal-
culated automatically when the factor is entered. Also, it is possible to directly
enter the value of the prestressing force if this information is available. After
that, the factor will be automatically calculated.

Allplan Bridge solution Training Part 1
85
In the same way all other tables with the prestressing actions are automati-
cally created for all the tendons in the “Group 1” and the values are taken over
from the definitions made at the level of the group.
All remaining tendons from this group (Phase 1: Tendon1-2 – Tendon 1-5 and
Phase 2:Tendon 2-1 - Tendon 2-5) have the same stressing conditions.
By using the same principle, we will define the prestressing actions for the re-
maining group – “Group 2”.
The only difference is that due to the construction conditions it is possible to
stress this group only from the end side of the tendons. Therefore, the table
of prestressing actions for will look as shown below:
The table for the tendon prestressing in the group Phase 2 and 3 has the fol-
lowing look:
Hint: In order to enable the calculation of the prestressing losses and to get
the force distribution diagram, it is important that you turn on the additional
option Create analysis model, which is found inside of the Calculation task
under the task area Analysis.
Diagrams of the prestressing force
This diagram is automatically created for each tendon when the wished pre-
stressing action is entered to the table above.
The diagram consists of the two axes. Abscissa - showing the stations of the
structural member where the tendon of the corresponding group is defined
and Ordinate – showing the values of the prestressing force in KN.
By clicking anywhere on the force diagram the properties table opens on the
right side. There, the user can influence the diagram preview in regard to the
limits of the force. Minimum and maximum values to be shown on the force di-
agram can be easily entered in order to change the look of the diagram.

86 Allplan Bridge 2023
The force diagram can be adjusted and exported as picture by using additional
icons available above the diagram in the top right corner marked below:
It is possible to get the report of the tendon force diagram for each individual
tendon by opening the function Create PDF document in the context menu
behind the tendon name in the tendon pre-stressing list.
The preview of this document is automatically opened when the document is
saved by the user. A name is automatically given to the document and it can
be changed if required.

Allplan Bridge solution Training Part 1
87
Construction schedule
In Allplan Bridge it is possible to specify the construction process.
The construction plan is divided into several phases and further into individual
tasks, such as concrete hardening, tendon stressing, activation of self-weight
etc.
Furthermore, it is possible to define different schedules (constructions) for
the same bridge structure. This allows us to analyse different schedule vari-
ants and, on this way, to optimize the construction sequence.
A modification of the defined construction process can be easily performed at
any time during construction, to account for unforeseen incidents requiring
deviations from the original plan. All relevant impacts due to these deviations
can be immediately checked.
The definition of the construction process can be done under the horizontal
tab Analysis in the project navigation tree where you can find several vertical
tabs. For this purpose, we will use the tab Constructions which is offering the
tree with construction phases organized under the created schedules.
The main working area is divided into four separate windows:
- Table with the list of all tasks and load cases (loads) in one phase
- Gantt chart which corresponds to the tasks from the table
- Table with the list of all assemblies (construction parts) activated in
one task
- 3D View for visualizing the active structure and for interactive activa-
tion of the construction part (creation of the assemblies)
Those windows together describe the workflow for defining the construction.
The screenshot from the finished example is shown below, where all the avail-
able windows are presented:

88 Allplan Bridge 2023
In the action bar you can find the new tool Construction, which includes tasks
grouped under different logically organized task areas: Tasks with Assem-
blies, Loads with Assemblies and Animation.
The task area Tasks consists of all available tasks for the definition of the
tasks in a certain construction phase. Some of the tasks are presented with
the separate icon and all available tasks can be found under the list of tasks .
The task area Assemblies consists of one task which is used for the crea-
tion of the assemblies – activation of necessary elements in one task.
The task area Loads consists of all available loads for the definition of the load
cases in a certain construction phase. Some of the loads are presented with
the separate icon and all available loads can be found in the list of loads .
The task area Assemblies consists of one task which is used for the crea-
tion of the assemblies – the selection of necessary elements on which the de-
fined load is acting.
The task area Animation is used for the Gantt chart timeline recalculation and
for the simulation of the complete construction schedule or just one con-
struction phase (depends on the selection in the tree on the left side).
New Construction and New Phase
In this example we will define one construction schedule with ten different
construction phases. In the following description we will show the workflow
for defining the construction phases.
Under Analysis/Construction the new empty tree is available for all defini-
tions.


## Sayfa 91

Allplan Bridge solution Training Part 1
89
With the right mouse click we define the New Construction with the name
“Construction” and under it we will create several New Phases:
1. “Phase 1” – where pile caps and piles are constructed.
2. “Phase 2” – where both piers are constructed in two steps.
3. “Phase 3” – where the first span of the main girder is constructed, and
the tendons are stressed.
4. “Phase 4” – where the second span of the main girder is fabricated,
and the tendons are stressed.
5. “Phase 5” – where the third span of the main girder is fabricated, and
the tendons are stressed.
The additional stages from the example will be explained in the chapter “Ana-
lytical Bridge model” and they are related to the definition and calculation of
the additional loads.
Some additional functions are available on the right mouse click for a faster
definition:
Copy the complete Construction with all the phases included, Copy Phase, De-
lete Phase and Move the Phase Up or Down.

90 Allplan Bridge 2023
Tasks and Assemblies
The Tasks define the individual steps of the construction process or a con-
struction phase. A task can have different user defined parameters.
*The picture above is just illustrative.
The begin of a task can be defined as Start Date or Start Day. The start day
can be defined as Global (day from begin of the first phase) or Local - relative
to the phase begin.
The next time attribute to be defined is the Duration of the task. With this
definition the chronological shift of phases and/or tasks is easier, and the user
has full control on how this affects previous and subsequent definitions.
In addition, this definition automatically allows the consideration of time de-
pendent structural behaviour, such as creep and shrinkage, in the time inter-
vals between the individual tasks or accounting for residual stresses due to
phase-wise construction.
All the parameters of the tasks can be edited by the user directly in the table
or in the properties window.
The related structural components are interactively assigned to these tasks
and this assignment connects the time attributes to the structure.
With the definition of Assemblies, we are grouping together structural com-
ponents, e.g., structural members or sections of the structural members or
prestressing tendons are grouped together.
In the following explanation you will learn how to define different tasks and
assemblies for several construction phases.

Allplan Bridge solution Training Part 1
91
First construction phase
In the first construction stage both, pile caps and all the piles, will be con-
structed.
To model this process, we need to activate both pier structural members
“Pier1” and “Pier2” and select the specific stations which define
The complete list of tasks for the first construction phase is shown below:
*The task INSTSUPP for activation of the supports will be added later in the
Analytical model.
For activating the piles and piles cap, we will define the task CONCRETE
which includes the pouring of the concrete as well as the hardening period.
There are also two tasks available for POUR and HARDEN , but in this ex-
ample we will not use them separately.
For the first stage “Phase 1” we will define the task CONCRETE four times
from the action bar. This task will appear in the top table, in the list of all tasks
of one phase.
We will additionally define the Duration and Start Day for the task CONCRETE
and for all other defined tasks in each phase. The Duration and the Start Day
of each task is shown in the offered screenshots with the list of the tasks per
Phase.
The next step is the creation of assemblies for this task. This means that we
need to select structural elements, which will be activated in this task.
From the action bar we need to choose the function Assemblies and then
we need to select the wished structural member interactively in the 3D win-
dow.

92 Allplan Bridge 2023
The assemblies for all 4 concrete tasks are shown below:
CONCRETE 1 (Pier 1 – Piles):
CONCRETE 2 (Pier 2 – Piles):
CONCRETE 3 (Pier 1 – Pile cap):
CONCRETE 4 (Pier 2 – Pile cap):
After the proper selection and of all tasks and creation of all assemblies of the
first phase, the active elements are highlighted in the 3D window as shown
below:
Second construction phase
In the second construction phase both piers will be constructed together in
two time steps.

Allplan Bridge solution Training Part 1
93
The complete list of tasks for the second construction phase is shown below:
For activating the Pier 1 and Pier 2 in two steps, we will use the task CON-
CRETE four times.
The next step is the creation of the assemblies for this task. This means that
we need to select the structural elements which will be activated in this task.
In order to select the specific part of the pier, we need to click with the left
mouse button on the pier, and then to choose the first and the second wished
station.
Assemblies for the four CONCRETE tasks from the list above are shown
below respectively:
After the proper selection and creation of all tasks and assemblies of the sec-
ond phase, the part of the main girder and the prestressing tendons are high-
lighted in the 3D window as shown below:

94 Allplan Bridge 2023
Third construction phase
In the third construction phase we activate the first part of the main girder,
related to constructing the first span and installing, stressing and grouting the
tendons of “Phase 1”.
List of tasks for the third construction phase:
*The task INSTSUPP for activation of the supports will be added later in the
Analytical model.
Assemblies for the CONCRETE task:
The next task in this phase is TENSION which summarizes the following
separate tasks, which could also be defined individually:
INSTDUCT (Install ducts), INSTTEND (install tendons), TSTRESS
(Stress tendons) and TGROUT (Grout ducts).
These tasks are applied for the part of the main girder in the first span.
Choose the function Assemblies from the action bar and use the drag and
drop option to assign the tendons of the first phase in the left and right web to
this task.

Allplan Bridge solution Training Part 1
95
Another possible option for selecting the necessary tendons is to go to Ge-
ometry/Tendons and drag and drop “Phase 1” to the bottom table of Analy-
sis/Construction.
The list of the assemblies for the task TENSION looks like shown below:
Fourth construction phase
In the fourth construction phase we activate the second part of the main
girder, related to the second span. We install, stress and grout the tendons of
“Phase 2” using the task TENSION .
List of tasks for the fourth construction phase:
Assemblies for the CONCRETE task:
Here we choose the other option for selection of the tendons for the task
TENSION . This is a graphical one, using the selection box. To filter ele-
ments for the selection in 3D we will use the function filter located at the
top right corner of the 3D view. In the list of elements which can be filtered, we
unselect all elements and keep only Tendons:

96 Allplan Bridge 2023
In the case of this selection procedure the list of assemblies for the task TEN-
SION looks differently:
Fifth construction phase
In the fifth construction phase we activate the last part of the main girder, re-
lated to the third span. We install, stress and grout the tendons of “Phase 3”
using the task TENSION .
List of tasks for the fifth construction phase:
Assemblies for the CONCRETE task:
In the case of this selection procedure the list of assemblies for the task TEN-
SION looks differently:

Allplan Bridge solution Training Part 1
97
Analytical Bridge Model
The model definition shown in the previous chapter was purely geometrical.
This means that the given specifications are not enough for performing any
kind of static analysis of the bridge. Further definitions are required to create a
complete analytical model:
• Beam elements definition.
• Material definition.
• Groups definition.
• Additional definitions in the cross sections necessary for the further steps.
• Structural connections definition: Abutments, Soils supports and Rigid con-
nections.
During the work, the active Allplan Bridge project is automatically regularly
saved in the database. To additionally save a wished state of the project in the
TCL format, it is possible to use the function Save the current project by us-
ing the icon in the title bar. In this manner the project is saved as Allplan
Bridge TCL.
The program also allows the opposite functionality where we can Initialize the
project database and import a specified TCL file by using the icon from the
title bar. With this function we import an Allplan Bridge TCL, which overwrites
the complete existing database of the active project.
After the import of the file, it is necessary to generate the detailed internal
model data of the project by using the tool for recalculation in the title bar or
the tool located in the task for Calculation. In this phase of the project,
when we start with definitions for the analytical model of the bridge, it is very
important to activate the option – Create analysis model - available in the
Calculation task. This option enables saving all necessary definitions relevant
for the definition of the analytical model.
With the right mouse click on the wished structural member in the project
navigation tree it is possible to open the additional submenus for Beam Ele-
ments, Material and Groups.

98 Allplan Bridge 2023


## Sayfa 101

Allplan Bridge solution Training Part 1
99
Beam elements
In this menu we assign element and node numbers to the subdivided elements
of the girder or the pier members. The table of beam elements is designed in
the same way as the other, already described, tables for Stationing, Cross
sections and Variation:
- Global Station Begin / End shows the list of global start and end sta-
tions of the girder elements resulting from the subdivision made in the
Stationing table.
- Structural unit 1, Structural unit 2, ... represent the list of all structural
units defined in the Cross Section.
- Beam / Start Node/ End Node enables the definition of the number
of the beam element and the numbers of its structural nodes at begin
and end of the element.
The option Auto-Numbering allows the user to get the complete numbering
of the model automatically. Activating this option includes automatic number-
ing of the structural members, structural connections and tendons.
This option is available in the group of tasks for Calculation, under the task
area Analysis:
Of course, it is possible to define and edit the numbering manually with using
the function Manual numbering.
The unit loads defined previously as bridge equipment are not considered as a
Beam elements and do not represent a part of the Analysis model. Therefore,
the units for those elements are not shown in the table of the main girder
since they don’t need to be numbered.
Material
All defined materials are used in geometrical model only for rendering and the
3D preview of the bridge model.

100 Allplan Bridge 2023
In the 3D-Model window under the function Show material texture , it is
possible to show the bridge model in the render mode with visible material
texture.
The materials are not exported to Allplan and they are used only for export to
RM Bridge TCL and for further analysis.
Material definition – import from Bimplus
It is possible to import the complete library of materials directly from Bimplus.
For this method it is important to be Logged in to the Bimplus platform in All-
plan Bridge by using the Bimplus account and the Login icon positioned in the
top right corner of the Title bar.
After that it is necessary to create a New Standard which can be created us-
ing the right mouse click on the blank surface under the menu Analysis/Ma-
terials in the Project Navigation Tree:
When the Standard is defined it is necessary to use a right mouse click on
Standard and to select the function “Import Bimplus Material”. The material
import will start and the protocol of the import will be visible at the bottom of
the screen. The import lasts several minutes since the complete Library is im-
ported. For the time being, only the Library of the Eurocode materials is avail-
able for import. After the import, it is possible to delete unnecessary material
groups or specific materials of some group.
Material definition - manually
For this example, materials can also be created manually, and the basic mate-
rial values can be rounded.
In this example one Standard (EN - Eurocode) is created and under it three
groups: Concrete, Prestressing Steel and Reinforcing Steel. Under each group
the corresponding materials are defined:

Allplan Bridge solution Training Part 1
101
In this stage of the project, we will need materials for the main girder and the
pier structural members and therefore we will define only two concrete ma-
terials: C35/45 for the piers and C40/50 for the main girder.
There are two possible ways of manual material definition:
1. Definition of the materials directly in the GUI
A New Standard can be created using the right mouse click on the blank sur-
face under the menu Analysis/Materials. When the Standard is defined the
user can define New Material which belongs to material Group, also created
by the user. An additional Text (description) can also be entered:
After the definition, all material values are displayed in the Properties window
on the right side, where they can be entered and later edited by the user.
In order to be faster, the user can define one Material under some Standard
and then use the option Copy Material, which is in the context menu of the
wished material.
In this example we will do the same. First, we define the concrete type
C35/45 with all necessary General and Basic material values entered manu-
ally in the Properties window like shown below:

102 Allplan Bridge 2023
After this, we use the Copy Material option and create the concrete type
C40/50.
We edit the necessary values for this concrete type in the Properties window
like shown below:
Now, the definition of the two materials, concrete C35/45 and C40/50, which
we need in this stage of the project, is finished.
The material of the “Prestressing steel” can be defined by “create new Mate-
rial” in the same manner as for “Concrete”. The respective new values are set
according to the next pictures:

Allplan Bridge solution Training Part 1
103
2. Definition of the materials in the TCL file
The proper syntax for the material definition in Allplan Bridge and for the cor-
rect export to the analysis TCL file is shown in the TCL file of this example.
The same syntax should be used for all new user projects.
When defining the Standard, Group and Material directly in TCL file, the syn-
tax looks as shown below. Exemplary we define the material “C35/45” under
the Group “Concrete” under the Standard EN (Eurocode):
STANDARD "EN"
MATERIALS "Concrete"
MATERIAL "C35/45"
TEXT "Concrete Strength Grade C35/45"
FOREIGN ""
VALUES BEGIN

104 Allplan Bridge 2023
VALUE EMODUL "E" 34100 "\%0.0lf" ""
VALUE GMODUL "G" 14208.3 "\%0.0lf" ""
VALUE POISSON "Ny" 0.2 "\%0.1lf" ""
VALUE ALPHAT "Alpha-T" 1E-05 "\%0.6lf" ""
VALUE GAMMA "Gamma" 24.5166 "\%0.1lf" ""
VALUE FCK "fck" 35 "\%0.0lf" ""
VALUE FCM "fcm" 43 "\%0.0lf" ""
VALUE CEMENTCLASS "Cement class" 1 "\%0.3lf" ""
VALUE CAGGREGATE "Concrete Aggregate" QUARTZITE "" ""
VALUE GCEMENT "Cement Content" 0 "\%0.1lf" ""
VALUE GSILICATE "Silicate Content" 0 "\%0.1lf" ""
VALUES END
MATERIAL END
STANDARD END
The user can copy this sequence to any new project and place it at the same
position – at the very beginning of the TCL file after the sequence with Pro-
ject settings, more specific after the line PROJECT END (the same position
which is used in the TCL file of this example).
After the wished editing of the new project TCL file the user should import the
file in Allplan Bridge. After that, all defined materials will be available in the pro-
ject material library under the Analysis/Materials.
It is also possible to do a “partial export” of the Materials into a .tcl file – This tcl
can then be imported into another Project. The Export settings are shown in
the following picture:
Material assignment
It is important to assign the wished material type to the unit type load (previ-
ously defined as a part of the geometrical model), but only these equipment
parts (barrier, sidewalk, and roadway) will be used for the load definition.

Allplan Bridge solution Training Part 1
105
Those unit loads (Unit 2 to Unit 6) represent the additional dead load on the
bridge.
In the table Material we assign the defined materials to all units of the type
“Load”. This table is located behind the context menu (right mouse click) of
each structural member.
Concrete class C_40/50 will be assigned to the main girder.
Concrete class C_35/45 will be assigned to the sidewalks.
Concrete class C_35/45 will be assigned to the substructure.
In the table with the List of Property Sets under the task Analysis and task
area Property Sets we can assign the respective materials to all defined
Property Sets for reinforcement.
This definition is done by clicking with the right mouse button on the respec-
tive cell and assigning the wished material to the selection.
Groups
Through group names it is possible to define the series of beam elements and
address this series as a separate group of a structural member (e.g., for load
definition, result presentation, etc.).
Here we assign a group name to the beam elements in the same manner than
done in all the previous tables.
Column Group allows the definition of the group name assigned to the beam
element.
We will assign the group name “MG” to all beam elements of the main girder.
We assign the group name “Pier1” to all beam elements of the first pier.
We assign the group name “Pier2” to all beam elements of the second pier.
It is enough to assign the group name to the first field and then to choose with
the right mouse click the option Apply Group to subsequent stations. The
program will automatically assign the same group name to all other stations.

106 Allplan Bridge 2023
Structural Connections
Structural connections are arranged between the individual structural mem-
bers or between the structural members and the soil. They are only neces-
sary for modeling the calculation model.
Four types of connections are available for defining the static connections of
the structural members:
• Abutment
• Soil Support
• Bearing
• Rigid connection
The context menu (right mouse button on the menu Structural connections)
can be used to create the corresponding new entries.
In this example we define the following structural connections:
• Two abutments (“Abut1” and “Abut4) – at the begin and the end of the bridge
superstructure.
• Two soil supports (“Support 2” and “Support 3”) – connecting the piers to
the ground.
• Two rigid connections – connecting the piers to the main girder.
The process of defining the connections above will be described in detail in the
chapter which follows.
The complete workflow of the interactive definition of different structural
connections is described step-by-step in the Online Help. Please refer to this
document to follow the exact procedure.
Abutments
In the Project navigation tree, we choose the option New Abutment under
the context menu of Structural Connections.
For this project we define two abutments, one at the bridge begin “Abutment
1” and one at the bridge end “Abutment 4”.
Abutments consist of three elements - two elements representing the bea-
rings on each side of the main girder and one element in the middle represen-
ting the abutment itself.
To define the abutment properly, we must first define all necessary reference
points in the cross sections. As already done, we have defined three reference

Allplan Bridge solution Training Part 1
107
points for the main girder: “Bearing_L”, “Bearing_R” and the center point
“Pier”.
After the abutment name has been created in the tree, the program automa-
tically switches to the 3D Model view, and it is leading the user through inter-
active definition.
For this specific example, we choose the “Bearing_L” point as the first, the
“Bearing_R” as the second and the middle point “Pier” as the center point of
the abutment. For the first two points it is also necessary to choose the cor-
responding cross section of the structural unit.
After the creation of the abutment the complete Properties table with the
additional definitions is available in the 3D viewport on the right side of the
screen. Choosing a certain element in the project navigation tree, the corres-
ponding table with the properties will open, and it is possible to edit/delete
some entry at any moment.
The abutment definitions are shown in the screenshot below:

108 Allplan Bridge 2023
The abutment is formed by three springs. In the middle is the soil spring
connecting the structural node to the soil. Left and right are classical springs,
and they are in this example automatically connected to the main girder.
Geometrical locations as well as the points of Rigid connections are defined by
user input.
Direction angles deviating from default are not defined in this example and
will stay zero. If required, it is possible to adjust the angle according to the ac-
tual needs. An explanation for the different direction angles is shown below:
Alpha-plan αp -Angle in plan

| Alpha-plan | αp -Angle in plan |
| --- | --- |



## Sayfa 111

Allplan Bridge solution Training Part 1
109
Alpha-elevation αe -Angle in elevation
Phi-rot ϕr -Element rotation
The stiffness values of the elements can be adjusted via spring constants for
each direction / rotation in the properties table. Spring elements have 6
degrees of freedom: three displacements (CNx, CVy and CVz) and three ro-
tations (CMx, CMy and CMz). These values of the spring stiffness are defined
in the local coordinate system of the spring.
The Allplan product has a right-hand system. Hence, the product Allplan Bridge
is based on a global and local right-hand system. Although Allplan defines Z as
global height axis, we use Y as global height because of engineer’s habit.
The coordinate system used in Allplan Bridge is shown in the sketches below:
Global coordinate system and the beam element with local coordinate system
For graphical presentation of the beam cross section we look in the axis direc-
tion.
Global coordinate system and the spring element with local coordinate system

| Alpha-elevation | αe -Angle in elevation |
| --- | --- |
| Phi-rot | ϕr -Element rotation |


110 Allplan Bridge 2023
The stiffness values for both abutment springs are defined as shown below:
Geometrical and structural positions are adjusted and taken over automati-
cally after the creation of the abutment. The same units, stations and connec-
tion points will be taken over in the table as chosen interactively. Of course, in
any moment, the user has the freedom to change these values directly in the
table.
The complete workflow of the interactive definition of different structural
connections is also described step-by-step in the Online Help. Please refer to
this document if you have any troubles to follow the exact procedure.

Allplan Bridge solution Training Part 1
111
Soil Supports
Before creating the soil supports it is important to specify the geometrical po-
sition of the support by creating a respective reference point in the Cross
Section of the pier (in this example this point was already defined in the center
of the pier cross section with the name “RP”).
We define two soil supports, one for each pier – “Support 2” and “Support
3”.
Soil supports are elements, that connect structural parts to the soil, e.g., a pier
to the ground. The stiffness values of these elements can be adjusted by defi-
ning appropriate spring constants for each translation/rotation direction in
the properties table.
The definition of both soil supports as well as their stiffness values are shown
in the screenshot below:

112 Allplan Bridge 2023
Rigid connections

| By defining rigid connections, various structural components may be rigidly |
| --- |
| connected to each other. |
| In the context menu of the menu Structural Connections in the project navi- |
| gation tree it is possible to choose the function for a New Rigid Connection |
| definition. |
| The definition of a rigid connection means that the DOF’s of the last node of |
| the pier member are eliminated in the equation system, and the last pier ele- |
| ment is considered as eccentrically connected to the corresponding node of |
| the main girder element. |
| Rigid connections, with the names “Pier1” and “Pier2”, are defined for both |
| piers. |
|  |
|  |
| After all connections have been created, it is possible to view the existing rigid |
| connections in the List of rigid connections, which is also available in the |
| context menu of the menu Structural connections in the project navigation |
| tree: |
|  |


Allplan Bridge solution Training Part 1
113
Property Sets Definition
For different possible analysis purposes like, for example, the reinforcement
calculation, stress check or the temperature calculation, it is necessary to ad-
ditionally define certain objects, called property sets, directly in the cross sec-
tions of the main girder and the pier.
In order to create all necessary definitions, we must use the Analysis task
while working in the Cross Section window. As a first step, all property sets
are defined, and then they are drawn in the cross section in the form of prop-
erty set points or boundaries, depending on the type of the property set.

| Property set types are defined according to their use. The following types are |  |  |
| --- | --- | --- |
| available in Allplan Bridge: |  |  |
|  |  |  |
|  | • Stress-points – definition of points in the cross section, where normal |  |
|  |  | stresses should be calculated. |
|  | • Shear lag – Definitions for the effective width of the plate. |  |
|  | • Temperature – points for non-linear temperature gradient definition. |  |
|  | • Different types of reinforcement: |  |
|  |  | Reinforcement longitudinal – includes different types of longitudinal rein- |
|  |  | forcement (for bending, shear, torsion, crack width and robustness check). |
|  |  | Reinforcement torsion – definitions for the transverse reinforcement due |
|  |  | to torsion |
|  |  | Reinforcement shear – definitions for the transverse reinforcement due to |
|  |  | shear. |
|  | • Exposure zones – definitions for the exposure classes on cross section |  |
|  | boundaries. |  |
|  |  |  |
| A new property set of a certain type can be created with using the pull-down menu |  |  |
| and the function Create new Property Set on the left side of the task Analysis. |  |  |
|  |  |  |
| The List of Property Sets displays all created property sets and can be edited. The |  |  |
| same list can be opened in the context menu of the wished cross section. |  |  |
|  |  |  |
| In this example we create twelve property sets for the main girder cross section. The |  |  |
| complete list of the main girder property sets is shown below: |  |  |
|  |  |  |
|  |  |  |
|  |  |  |


114 Allplan Bridge 2023
The table for property sets consist of several fields:
Name of the property sets – defined by the user; Structural unit – Cross
Section unit to which the property set is assigned; Type of the property set –
defined by the user; Material – for the time being it is possible to manually en-
ter the values; Points – shows the number of the points included in the prop-
erty set (property set points or boundary points).
After creation of the different property sets, we can start to draw Boundaries
for these sets in the Cross Section window. All these objects are drawn in ac-
cordance with specific rules.
Property Sets for the Main Girder
First, we define two property sets of the type Reinforcement longitudinal
using the pull-down menu of the function Create new Property Set :
Name Unit Type Material Points
“Long-Bott” 1 Reinf.long. EN:B 500B 2
“Long-Top” 1 Reinf.long. EN:B 500B 4

| As already mentioned, tables are editable. This means that you can edit some defini- |
| --- |
| tion or delete some property set at any stage of the project. |


| Name | Unit | Type | Material | Points |
| --- | --- | --- | --- | --- |
| “Long-Bott” | 1 | Reinf.long. | EN:B 500B | 2 |
| “Long-Top” | 1 | Reinf.long. | EN:B 500B | 4 |
|  |  |  |  |  |
|  |  |  |  |  |
| Via the second pull-down menu with the selection line, the created property |  |  |  |  |
| sets can be selected and activated, like shown below: |  |  |  |  |


Allplan Bridge solution Training Part 1
115
Now we draw the necessary Boundaries for longitudinal reinforcement in
the top and in the bottom slab of the main girder cross section. Both prop-
erty set are highlighted with orange colour and shown in the screenshot be-
low:
For the longitudinal reinforcement “Long-Top” we will create one open
boundary like line, using the function Property Set Line/ Boundary . This
boundary will be positioned approximately in the middle of the top slab with 5
cm from the left and right corners.
The upper boundary is defined by using the parametric points previously cre-
ated in the Cross Section task by using the tool Point :

|  |
| --- |
|  |
| When the wished property set is active, the next step is choosing the Unit, |
| which will be assigned to this property set. In both cross sections we have |
| only one unit, so we choose Unit 1. |
|  |


| When the wished property set is active, the drawing functions in the pull- |
| --- |
| down menu can be used to draw the Boundaries for this property set. |
|  |


116 Allplan Bridge 2023
P3 - from the top left corner of the cross section with offsets of 0.1 (Y) and -
0.05 (Z).
P4 - from the point of changing the inclination direction with offsets of -0.15
(Y) and 0 (Z).
P5 - from the top right corner of the cross section with offsets of -0.1 (Y) and
- 0.05 (Z).
For the longitudinal reinforcement “Long-Bott” we create one open bound-
ary, using the function Property Set Line/ Boundary . This boundary will be
positioned in the middle of the bottom slab and it is going to the middle lines of
both webs.
Hint: For the shear and torsion design and checks it is required to tick the
checkboxes Effective in shear and Effective in torsion, so the reinforcement
area is considered in the respective analysis.
Hint: For crack limitation analysis it is required to define the diameter of the
reinforcement bars and, if needed, the offset for first and last bar position for
the property sets of the type Reinforcement longitudinal. These parameters
can be specified in the Properties window on the right side of the working
area.
Tip: User-defined reinforcement area can be defined as Reinforcement As in
the Properties window on the right side of the working area.
Tip: With the function Property set Line/Boundary it is also possible to
add boundary points to an already defined property set boundary.
One property set can have only one boundary assigned. Two property
sets can share one boundary.
After input, the respective Properties of the defined property sets have the
following look:

Allplan Bridge solution Training Part 1
117
In the next step we will define several property-set points for the Stress-
points and Temperature with using the function Create new Property Set ,
as shown in the table below:
Name Unit Type Mate- Points
rial
“GradCool-Lin- 1 Tempe- n.a. 2
Temp” rature
“GradHeat-Lin- 1 Tempe- n.a. 2
Temp rature
For each temperature property set: “GradHeat-Lin-Temp” and “GradCool-
Lin-Temp” we will define 2 property set points at the bottom and at the top of
the main girder cross section using the function Property set point .

| Name | Unit | Type | Mate-
rial | Points |
| --- | --- | --- | --- | --- |
| “GradCool-Lin-
Temp” | 1 | Tempe-
rature | n.a. | 2 |
| “GradHeat-Lin-
Temp | 1 | Tempe-
rature | n.a. | 2 |
|  |  |  |  |  |
| When a wished property set is active in the pull-down menu, the drawing |  |  |  |  |
| functions can be used to draw objects for the activated property set. |  |  |  |  |


118 Allplan Bridge 2023
These points are highlighted with red colour and named with TP1 and TP2:
The temperature values are defined directly in the property set points and
they are defined as shown in the table below:
Property Set Temp. Tempera-
point ture [°C]
GradHeat-Lin-Temp T1 -6.2
GradHeat-Lin-Temp T2 0
GradCool-Lin-Temp T1 0
GradCool-Lin-Temp T2 5
These temperature property sets are representing the variable component of
the temperature load and they are used in the definition of the temperature
load.
The values given in the table above were calculated according to the Euro-
code (EN 1991-1-5, Paragraph 6):
For road bridges of the type 3 with concrete superstructure hollow boxes,
with the thickness of the covering over 50 mm (Table 6.1) and with the cor-
rection factors for the thickness of the covering of 120 mm (Table 6.2), the
following values are obtained for the temperature components:
TM, cool = TM, cool, 50mm · ksur, 120mm = -5 ° C · 1.0 = -5 ° C
Δ Δ
TM, heat = TM, heat, 50mm · ksur, 120mm = 10 ° C · 0.62 = 6.2 ° C
Δ Δ

| Property Set | Temp.
point | Tempera-
ture [°C] |
| --- | --- | --- |
| GradHeat-Lin-Temp | T1 | -6.2 |
| GradHeat-Lin-Temp | T2 | 0 |
| GradCool-Lin-Temp | T1 | 0 |
| GradCool-Lin-Temp | T2 | 5 |



## Sayfa 121

Allplan Bridge solution Training Part 1
119
These values represent the temperature difference between the top and bot-
tom of the bridge superstructure.
Therefore, we assign them to the top and bottom temperature points of the
corresponding property sets.
Deletion and change of definitions are possible by using additional tools in the
Analysis task such as:
Clear boundary assignment to active Property Set - to clear the depend-
ency between the boundary and some property set.
Assign boundary to active Property Set - to assign an already drawn
boundary in the Cross Section action bar to an already defined property set.
Delete some property set point (or any other element of the section).
For the correct calculation of the reinforcement in thew cross section it is
necessary to define two different property set types: Reinforcement shear
(stores the results of transverse reinforcement due to shear) and Reinforce-
ment longitudinal.
The following property sets will be created for the webs with using the func-
tion Create new Property Set , like shown in the table below:
Name Unit Type Material Points
Shear Reinf 1 Reinf.shear web EN:B 500B 2
Long-Left 1 Reinf.long. EN:B 500B 2
Long-Right 1 Reinf.long. EN:B 500B 2
The Property-sets for the right and left side are defined with two open
boundaries as shown on the screen shot below:
After the input, the respective Properties of the defined property sets have
the following look:

| Name | Unit | Type | Material | Points |
| --- | --- | --- | --- | --- |
| Shear Reinf | 1 | Reinf.shear web | EN:B 500B | 2 |
| Long-Left | 1 | Reinf.long. | EN:B 500B | 2 |
| Long-Right | 1 | Reinf.long. | EN:B 500B | 2 |


120 Allplan Bridge 2023
The next property set is created for the calculation of the torsional reinforce-
ment. It is a property set of the type Reinforcement torsion.
The following property set will be defined with using the function Create new
Property Set :
Name Unit Type Material Points

| Name | Unit | Type | Material | Points |
| --- | --- | --- | --- | --- |


Allplan Bridge solution Training Part 1
121
Torsion 1 Reinf. torsion EN: B 500B 4
After the input, the respective Properties window of the defined property set
has the following look:
Hint: When we have a more complex cross section (more complex hollow box,
a slab with openings etc.) it is recommended to define an open boundary for
this property set in the manner of a geometrical definition of the perimeter
line of the effective hollow box cross section. The perimeter line should be
placed along the center lines of the webs and the slabs forming the effective
hollow box.

| Torsion | 1 | Reinf. torsion | EN: B 500B | 4 |
| --- | --- | --- | --- | --- |


122 Allplan Bridge 2023
The complete cross section of the main girder, with all the definitions neces-
sary for the analysis, is shown below:
The last type of the property set is used for the calculation of SLS checks and
it is called Exposure zone.
The following property set will be defined with using the function Create new
Property Set :
Name Unit Type Material Points
Zone1 1 Exposure zone n.a. 10
The whole Boundary 1 is used for definition of Zone1. This property set is used
as a default zone for all parts of outer boundary of the Cross Section Zone1
has XC3, XD1 and XF3 exposure classes defined.

| Name | Unit | Type | Material | Points |
| --- | --- | --- | --- | --- |
| Zone1 | 1 | Exposure zone | n.a. | 10 |


Allplan Bridge solution Training Part 1
123

124 Allplan Bridge 2023
Construction stages for Analysis
In the next chapters we will define additional tasks from the first five con-
struction phases which are important for the analytical model.
The user will also learn how to define different loads and assemblies organized
in several additional construction phases, according to the different load
types:
6. SDL - definition and calculation of superimposed dead load
7. Settlement – definition and calculation of settlement load cases
8. Temperature - definition and calculation of temperature load
9. Wind - definition and calculation of wind load
10. Braking - definition and calculation of braking load
11. Superposition - calculation of defined envelopes for different load cases
For each defined construction schedule the user can define additional calcula-
tion options which are positioned in the task Calculation. Here he can influence
the calculation and decide which part of the calculation should be performed. It
is possible to calculate only the geometrical model with timeline, but also ad-
ditionally to create a structural model and to perform the structural analysis.
In the Calculation options window, it is possible to switch between Calcula-
tion ON or OFF for each defined schedule. This allows the user to exclude
some specific schedules (construction variants) from the calculation, if sev-
eral schedules have been defined in the project. The Calculation options can
be opened by using the small arrow (highlighted in the screenshot below) in
the bottom right corner of the Analysis task area.
*The picture above is just illustrative.

Allplan Bridge solution Training Part 1
125
Loads and Assemblies
The Loads task area represents the area where the user can define a load
case under which different types of loads can be defined and calculated.
With the definition of Assemblies, we are defining the structural components,
e.g., structural members or sections of the structural members, where the
defined load case is acting.
Allplan Bridge analyses previously defined construction schedule and assem-
bles all necessary calculation definitions, like load cases, element activation
and calculation actions, in an automated process. This includes input data for
calculating nonlinear time effects, creep, shrinkage, and relaxation.
All the generated items are listed in a “logging” window at the bottom of the
screen, and thereby complete transparency is granted. In the list you can see
what exactly was generated.
The user always keeps full control by adjusting specific tasks in the construc-
tion schedule or by deactivating the auto-generation and defining load cases
and calculation actions manually.
For each defined construction schedule the user can define additional calcula-
tion options which are positioned in the task Calculation.
The Calculation options can be opened by using the small arrow in the bottom
right corner of the Analysis task area as shown below:

126 Allplan Bridge 2023
*The picture above is just illustrative.
The option Autogenerate calculation tasks offers the possibility to select,
whether the calculation tasks of the respective type linked with the defined
tasks should be generated automatically. Based on the generated calculation
tasks, the obtained results are saved in load cases. The loads of different load
cases will be added automatically to the respective summation load cases,
which can be defined by using the Calculation options window.
Separate check boxes for different permanent loads (self-weight, superim-
posed dead loads, pre-stressing/post-tensioning, creep and shrinkage) allow
us to select the load cases which should be considered during the structural
analysis.
It is also possible to define the names for the load cases which should be gen-
erated. The full name of the generated load case will consist of this user de-
fined name and the time of its definition/calculation in the Construction se-
quence.
In the same way, the user can define the names for the summation load
cases, where all loads of the respective type(s) will be summed up after the
calculation.

Allplan Bridge solution Training Part 1
127
After all the supports in the structural model have been defined, the user is
able to activate them in the corresponding phases. Below are described addi-
tional definitions for the already created first construction phases.
For all additional information and more explanations about the calculation op-
tions please use our Online Help. Help is available directly in the program by
clicking the F1 button or you can use the icon in the upper right corner of the
title bar to open the Help.
First construction phase
In the first construction stage we will activate additionally each soil support of
the piers “Support 2” and “Support 3”, which have been previously defined.
For activating the soil supports of both piers, we use the task INSTSUPP
and set it for Start day 1.
In this task we create assemblies which consist of both soil supports.
After the proper selection of all assemblies, the list of assemblies in the IN-
STSUPP task for the first construction phase looks like this:
The task CONCRETE is represented in the background by the calculation
task INSTCONC – Install concrete which performs the activation of struc-
tural elements.
If the option Autogenerate calculation tasks is activated in the Calcula-
tion/Analysis, two additional tasks will be automatically calculated in the
background:
LCSELF – Load case self-weight – calculation of the self-weight
LCCREEP – Load case creep – calculation of the creep and shrinkage
In this case the action for calculation of the nonlinear time effects (Creep and
Shrinkage) is automatically generated when concrete elements become ac-
tive. The time for which the effects need to be calculated is retrieved from the
subsequent tasks (when the next structural change happens). Certain addi-
tional data is automatically retrieved from the assigned material and other are
defined by the user.
The user can define the Relative Humidity and the relevant average Temper-
ature by using the Properties of the wished construction phase. Additionally,

128 Allplan Bridge 2023
in the task CONCRETE (and HARDEN) the user can define an Argument
Dshrink, which represents the concrete age at the beginning of shrinkage.
Additionally, it is possible to exclude some of the mentioned tasks inside of the
task CONCRETE , for example LCSELF or LCCREEP, by excluding those
from the Calculation options using the check boxes: Self weight and/or
Creep & shrinkage.
Several alternatives are therefore possible: To activate structural elements
only, or to additionally calculate the self-weight with or without the calculation
of creep and shrinkage.
Additionally, the design code for the creep and shrinkage calculation should be
set.
In this example the Eurocode – “EN” standard is chosen from the dropdown
menu under the Options -> Settings -> Standard, like shown in the screen-
shot below:
Third construction phase
In the third construction phase we will additionally activate the supports of the
first abutment “Abutment 1”.
For activating the first abutment “Abut1”, we will use the task INSTSUPP
with Start day 46 and create the assembly for it.
After the proper selection of all assemblies, the list of assemblies in the IN-
STSUPP task for the third construction phase looks like this:
If the option Autogenerate calculation tasks is activated in the Calcula-
tion/Analysis and the check box Pre-stress is switched on. Then the follow-
ing calculation tasks will be automatically calculated in the background as
parts of the task TENSION:
TSTRESS – Tendon stress – calculation of the stressing procedure


## Sayfa 131

Allplan Bridge solution Training Part 1
129
LCSTRESS – Load case stress – calculation of the prestressing load case
TGROUT – Tendon grout – establishment bond between the tendons and
Cross Sections.
Fifth construction phase
In the fifth construction phase the last part of the main girder is constructed.
Additionally, we will activate the supports of the second abutment “Abutment
4”.
Assemblies for the INSTSUPP task with Start day 86:
SDL loads
In this construction phase we define the additional dead loads – superimposed
dead loads which are acting on the bridge structure and are coming from the
bridge equipment.
To define those loads a New Phase will be established in the tree of the Con-
struction with the name “SDL”.
The complete list of load cases for this construction phase is shown below:
In the following explanation you will learn how to define a load case and the
load of the wished type.
We define a load case by using the icon LOADCASE:Loadcase positioned
in the task Construction under the task area Construction Loads.

130 Allplan Bridge 2023
In the Properties window on the right side it is possible to enter the following
Arguments:
lc – Load case name – in this example we will name it “SDL” (without defining
the load case name, errors will appear in the calculation process, and this load
case will not be calculated).
SDL switch button - to decide if this load case shall be added up to the sum-
mation load case for SDL loads, SDL-SUM.
It is also possible to provide an additional explanation for a load case/load type
by entering a description in the field Text.
When the load case is defined, we define several loads inside of it.
It is possible to define the load by using the context menu of the load case:
It is also possible to define the load by using the wished task from the Action
bar, in this case LOADQY:Vertical line load .
We create five new vertical line loads in the existing load case, one for each
part of the bridge equipment previously defined in the cross section of the
main girder.

Allplan Bridge solution Training Part 1
131
The vertical line load can be defined with the exact value q in KN/m or by en-
tering the unit number of the unit loads under the Argument uload.
If we use the option uload, the software will automatically take the Cross Sec-
tion area and multiply it with the Specific weight (Gamma) taken from the ma-
terial previously assigned to this Unit. Here we need to additionally specify the
number of the wished structural unit in the field uload.
The resulting force will be acting in the center of gravity of the respective unit
load, and it represent the vertical line load in KN/m which will be considered in
the calculation.
The next step is the creation of assemblies for this task. This means that we
need to select structural elements on which the defined loads are acting.
From the action bar we need to choose one of the two offered functions for
the definition of Assemblies or and then to select the wished structural
member interactively in the 3D window for each selected load from the list.
All the SDL loads are acting on the main girder so we will choose this structural
member in the 3D window. After the proper definition, the table for assemblies
will look the same for each of the five defined SDL loads:
Additional loads
Settlement load
In this construction phase we will define the settlement load.
To define this load a New Phase will be established in the tree of the Con-
struction with the name “Settlement”.
The complete list of load cases for this construction phase is shown below:

132 Allplan Bridge 2023
In the following explanation you will learn how to define the load of this type.
The settlement is applied as a fictional force in the spring, which causes the
defined displacement in the spring. Considering that the stiffness of the spring
is much higher than the stiffness of the connected structure, the defined set-
tlement will be applied on the structure with reasonable accuracy.
In this example, we will define four different load cases – one for each spring
of the bridge structure, and in each load case one load definition of the type
settlement.
We define the first load case for the soil spring of the first abutment by using
the icon LOADCASE:Loadcase positioned in the task Construction under
the task area Loads.
The name of this load case can also be defined in the Properties window under
the Arguments: lc “Settle-A1”. Settlement loads do not belong to the SDL
loads and therefore we will not check this box.
In this load case we will define the new load of the type LOADSETTLE:Settle-
ment by using the context menu of the load case or by using the correspond-
ing task positioned in the Action bar - LOADSETTLE:Settlement .
We can also define the load Arguments and the description (text) In the prop-
erties window of the load, as shown below:

Allplan Bridge solution Training Part 1
133
In this example we define the settlement load as a displacement in local X di-
rection, considering that the x-axis of the spring shows in vertical direction. It
is possible to define displacements in all three global directions (d , d and d )
x y z
or to define those values in the local coordinate system if the check box local
is switched on.
For this load we need to define the assembly, and in this case the assembly is
represented by a spring which is loaded with the fictional force.
The assembly for the first load is the structural connection Abutment 1, so the
list of assemblies has the following look:
According to the above explained procedure we will define all the remaining
three load cases (Argument/lc: Settle-2; Settle-3 and Settle-A4) with the
settlement loads defined as displacement in the local X direction (d = -0.01 m)
x
and with the assemblies defined in the structural connections respectively
(Support 2; Support 3 and Abutment 4).
Temperature load
In this construction phase we will define the temperature load.
To define this load, a New Phase will be established in the tree of the Con-
struction with the name “Temperature”.
The complete list of load cases for this construction phase is shown below:

134 Allplan Bridge 2023
In the following explanation you will learn how to define the load of this type.
The temperature load can be applied on the structure as a constant compo-
nent – a temperature difference to the initial state, uniformly distributed over
the Cross Section of the loaded element (dT) and as a variable component -
temperature difference between top and bottom of the loaded element (T) -
defined in temperature points of the corresponding property set in the Cross
Section.
In this example, we will define four different load cases – two for the constant
temperature load type and another two for the variable temperature load
type.
Constant temperature difference
First we define two load cases for the constant temperature difference by
using the icon LOADCASE:Loadcase positioned in the task Construction
under the task area Loads.
The name of those load cases can also be defined in the Properties window
under the Arguments: lc “Unif-temp-pos” and “Unif-temp-neg”. Tempera-
ture loads do not belong to the SDL loads and therefore we will not check this
box.
In these two load cases we will define the new load type LOADTEMP:Tem-
perature load by using the context menu of the load case or by using the

Allplan Bridge solution Training Part 1
135
corresponding task positioned in the Action bar – LOADTEMP:Temperature
load .
In the properties window of these loads, we can also define the load Argu-
ments and the corresponding description (text):
Text: “Unif-temp-pos”; Arguments: dT=27 °C
Text: “Unif-temp-neg”; Arguments: dT=- 27 °C
The above defined values for the constant temperature difference were cal-
culated according to the Eurocode (EN 1991-1-5, Paragraph 6).
For this load we need to define the assembly and in this case the assembly is
represented by the complete structural member of the main girder.
Variable temperature component
Two additional load cases will be defined for including the possible tempera-
ture differences between the top and the bottom edge of the main girder
Cross Section. We are using the icon LOADCASE:Loadcase positioned in
the task Construction under the task area Loads.
The names of those load cases can be also defined in the Properties window
under the Arguments: lc “GradHeat-linear-temp” and “GradCool-linear-
temp”. The temperature loads do not belong to the SDL loads and therefore
we will not check this box.
In these two load cases we will define the new load type LOADTEMP:Tem-
perature load by using the context menu of the load case or by using the cor-
responding task positioned in the Action bar – LOADTEMP:Temperature load
.
In the properties window of both loads we define the load Arguments and the
corresponding description (text):
Text: “GradHeat-linear-temp”; Arguments: T=GradHeat-linear-temp
Text: “GradCool-linear-temp”; Arguments: T= GradCool-linear-temp

136 Allplan Bridge 2023
As an argument for this load type the user must manually type in the name of
the corresponding property set for the temperature definition.
In the next step we will define these Property Sets in the main girder Cross
Section, as they have not yet been defined in the Cross Section definition
phase.
Property Sets for “GradHeat-linear-temp”
As we do need reference points for our variable Temperature Load cases.
Therefore we will now add them to our Cross Section via Commands of the
Task area “Property Sets”.
The Status of our Superstructure-Cross Section and the Task area “Property
Sets” is shown in the next picture:
First, we choose “Create a new Property Set” for “Temperature”. Then we
need to define the wanted “beam element” – we choose Beam element 1. Out
of this a new Property Set “TempSet1” is created.
-> ->
The connection between the existing “Loadcase” in the Construction sched-
ule and the now defined Property Set in the Cross Section is done by renam-
ing the property set. The Temperature load case has the Argument T = “Gra-
dHeat-linear-temp”.
Therefore, this property set must also get the name “GradHeat-linear-temp”.

Allplan Bridge solution Training Part 1
137
In the new Property set we create new reference points – we click “Property
Set point” and set “TP1” and “TP2” and confirm with “ENTER” as shown below:
Now we apply a temperature to each point – first to TP1:
and then to TP2:

138 Allplan Bridge 2023
Property Sets for “GradCool-linear-temp”
Now we must repeat these steps for our 2nd variable temperature load case
with the Argument T = “GradCool-linear-temp”.
As we already created the Load Case “GradCool-linear-temp” in the Con-
struction Schedule, we must Create the Property Set elements in the Cross
Section and link them by giving them the same name “GradCool-linear-temp”.
The steps in the Cross Section are the same as before for the 1st Property set
– we create a new Property set (again for beam unit 1) points -> rename the
Property set to “GradCool-linear-temp” -> create “Property Set points”
“TP1” and “TP2” -> define the temperature at these 2 points.
The individual settings for this Load Case are shown below:


## Sayfa 141

Allplan Bridge solution Training Part 1
139
TP1 - Details:
and TP2 - Details:
For cross check: Finally the “List of Property Sets” – Table should look like
this:
Braking load
In this construction phase we will define the braking load of the vehicles acting
in two directions.
To define this load, a New Phase will be established in the tree of the Con-
struction with the name “Braking”.
The complete list of load cases for this construction phase is shown below:

140 Allplan Bridge 2023
In the following explanation you will learn how to define the load of this type.
The Braking load is defined as the line load in longitudinal (local X) direction and
it is acting in the previously defined reference point in the main girder cross
section.
Therefore, we will first define the new reference point in the main girder Cross
Section with the name “Braking”. This point will be positioned in the previously
defined parametric point with an offset of 0.12 m in Y-direction from the inter-
section of the Zloc/Yloc axes.
For this example, we define two different load cases – one for the positive
and one for the negative braking load.
We define the first load case by using the icon LOADCASE:Loadcase posi-
tioned in the task Construction under the task area Loads with the name
“Braking-Xdir-plus”. Braking load does not belong to the SDL loads and
therefore we will not check this box. The name of this load case can also be
defined in the Properties window under the Arguments: lc “Braking-Xdir-
plus”.
Under this load case we will define the new load type LOADQX:Line load in
longitudinal direction by using the context menu of the load case or by using
the corresponding task positioned in the Action bar - LOADQX:Line load in
longitudinal direction .
In the properties window of the load we define the load Arguments (value of
the load q and the position of the load pos – defined by entering the name of
the corresponding, previously defined reference point) and the description
(text) as shown below:

Allplan Bridge solution Training Part 1
141
The above defined value for the braking load is calculated according to the Eu-
rocode (EN 1991-2, 4.4.1).
For this load we need to define the assembly and, in this case, the structural
member “Superstructure”.
According to the above explained procedure we will define another load case
for the braking load in the negative direction of the local X axis. The name of
the new load case will be “Braking-Xdir-minus”, and the following properties
will be defined for the type LOADX: Line load in longitudinal in this load case:
Wind load
In this construction phase we define the wind load in a New Phase which will
be established in the tree of the Construction with the name “Wind”.
Wind load is defined by using the global horizontal area load which acts on the
defined structural members (or the parts of the structural members) defined

142 Allplan Bridge 2023
through the assemblies. This load is acting along the whole bridge structure
and its direction is approximately normal to the element/beam axis.
The load intensity per m2 is defined by the value q.
The vertical load length can be defined by determining the user-defined ef-
fective load length leff or it can be determined automatically through the
Cross Section definition.
In this case the user needs to enter the uload (Unit Load) number which
means that the load will be applied only to this part of the Cross Section in-
stead to the total effective Cross Section.
In this example we will define four different load cases:
We consider 2 cases of the wind acting without the traffic, in positive or nega-
tive global Z-direction (we assume here, that the average deviation of the
longitudinal axis from the global x-axis is negligible). Besides on the concrete
structure, the wind is also acting on the equipment (sidewalk).
The other 2 cases are those, where the wind acts and the structure with
equipment, and additionally on the traffic.
The complete table with all wind load cases and the corresponding loads is
given below:
Load case Load Type Value
Wind on equipment 1.90 KN/m2
Wind on traffic 1.90 KN/m2
Wind on equipment -1.90 KN/m2
Wind on traffic -1.90 KN/m2
PDAOL
ZA
Wind on equipment 1.90 KN/m2
PDAOL
ZA
Wind on equipment -1.90 KN/m2
The defined values for the wind load with and without traffic were calculated
according to the Eurocode (EN 1991-1-4, Paragraph 8).
We will define the first load case “Wind-with-traffic-plus” by using the icon
LOADCASE:Loadcase positioned in the task Construction under the task
area Loads.

| Load case | Load | Type | Value |
| --- | --- | --- | --- |
| Wind-with-traffic-plus | Wind on structure | ZAPDAOL | 1.90 KN/m2 |
|  | Wind on equipment |  | 1.90 KN/m2 |
|  | Wind on traffic |  | 1.90 KN/m2 |
| Wind-with-traffic-minus | Wind on structure | ZAPDAOL | -1.90 KN/m2 |
|  | Wind on equipment |  | -1.90 KN/m2 |
|  | Wind on traffic |  | -1.90 KN/m2 |
| Wind-without-traffic-plus | Wind on structure | PDAOL
ZA | 1.90 KN/m2 |
|  | Wind on equipment |  | 1.90 KN/m2 |
| Wind-without-traffic-minus | Wind on structure | PDAOL
ZA | -1.90 KN/m2 |
|  | Wind on equipment |  | -1.90 KN/m2 |


Allplan Bridge solution Training Part 1
143
The wind load does not belong to the SDL loads and therefore we will not
check this box.
The name of the load can also be defined in the Properties window under the
Arguments: lc “Wind-with-traffic-plus”.
We will now define four new load types LOADPAZ: Pressure load in Z-direc-
tion by using the corresponding task positioned in the Action bar - LOADPAZ:
Pressure load in Z-direction .
The First wind load is the one acting on the complete structure.
In the properties window of this load, we define the necessary Arguments: the
size of the load q=1.90 KN/m2 and the description (text) as shown below:
The second wind load is the one acting on the bridge equipment, more pre-
cisely on the sidewalk.
In the properties window of this load we define the necessary Arguments: the
intensity of the load q=1.90 KN/m2, the number of the unit of the sidewalk unit
load - uload and the description (text) as shown below:

144 Allplan Bridge 2023
Since this load is acting on the complete main girder, we will define the assem-
blies, in the same way as usual, by choosing the complete main girder struc-
tural member.
The third wind load is the one acting on the traffic.
In the properties window of this load we define the necessary Arguments: the
intensity of the load q=1.90 KN/m2 , the position of the load – pos , the effec-
tive length - leff and the description (text) as shown below:

Allplan Bridge solution Training Part 1
145
For this load we must additionally define a new reference point – the point
where the load is applied. This point is positioned in the middle of the Traffic
height (leff).
Since the vehicle has the height of 2 m, we will define one reference point in
the main girder cross section, with the name “Traffic” in the middle of the ve-
hicle height – 1 m from the intersection point of the Zloc/Yloc axes.
We will now define the second load case with the name “Wind-with-traffic-
minus” by using the icon LOADCASE:Loadcase positioned in the task
Construction in the task area Loads.
The name of the second load case can also be defined in the Properties win-
dow under the Arguments: lc “Wind-with-traffic-minus”. This load case also
consists of four loads of the type LOADPAZ: Pressure load in Z-direction .
The only difference is that this wind load is acting in the negative global Z-di-
rection and therefore will all the loads be defined with the value -1.90 KN/m2.
The next two load cases are defined in the same way with the names “Wind-
without-traffic-plus” and “Wind-without-traffic-minus”. The only difference
is that we do not have the wind load acting on the traffic.
The complete list of four load cases with all the loads for this construction
phase is shown below:

146 Allplan Bridge 2023

Allplan Bridge solution Training Part 1
147
Traffic Loads
Traffic loads are a special type of loads acting on bridges and they require a
particular definition. Therefore, the definition of the traffic loads is indepen-
dent from other loads. This definition is placed in the separate vertical task
named Traffic Loads.
Under the Traffic Load task, it is possible (and necessary for the proper traffic
load calculation) to define Lane Sets and Load Trains.
Lane Sets
Usually, different Load positions and Load Sets must be created in a Project to
get the most unfavorable results. In this example, we will focus on 1 unfavor-
able Lane Set with different Load Trains. We will position the tandem system
loads at the outmost right on the carriageway.
Therefore, we create the lane set “Lane Set_Right”.
After that, we must define the assembly for it by using the function Assembly
. Then we choose the Structural member where the lane set is positioned.
Out of this, a 3d view of the Lane Set-Area is shown.
In the properties window you can change the view from 3d to 2d.
Then you can create 2 parallel parametric lines in the Cross Section “Su-
perstructure” (+ 4,3 m / - 4,3m).

148 Allplan Bridge 2023
After this you can create lanes. In our case we will use the function Create
lane by standard .
First we select the outmost right line (where the sidewalk begins), like shown
below:
Then we select the outmost left line, as shown below:
With these steps, the definition of the carriageway width is done, and the
software calculates the amount of notional lanes as well as the remaining
width automatically according to the Eurocode rules.
The program is automatically positioning the loads at the level of the global
axis system.
Since we want to have all the train positions (loads) aligned with the upper
surface of the roadway, we will need to perform one additional step.
Select the outmost right vertical (blue) line and choose the function Refe-
rence (align lanes) to boundary related to the selected Lane set.


## Sayfa 151

Allplan Bridge solution Training Part 1
149
With this, the creation of the lane set on the right side is done.
On the right side of the screen in the Properties window of the “Lane
Set_Right”, it is possible to set additional definitions for each Lane Set – like
Centrifugal, Longitudinal or Combined – Load directions can be added.
In this case, due to the Curved Bridge design, we will add the Centrifugal Load
direction. Details are shown in the screenshot below:

150 Allplan Bridge 2023
Load Trains
The user can manually define different load trains or use Eurocode defined
Lane set templates.
Influence lines are calculated for all defined lane sets (load positions).
For this the option Auto-calculate influence lines must be selected in the Ac-
tionbar (Calculation\Analysis), as highlighted on the screenshot below:
In this example we will use the already prepared templates for load trains ac-
cording to the Eurocode. Load Model 1, which consists of a Tandem system
(TS) and Uniform load (UDL), and also a Centrifugal Load (CFG), since the
bridge axis is curved.

Allplan Bridge solution Training Part 1
151
Following Load Trains are created:
Tandem system TS-300, Tandem system TS-100 and Tandem system TS-
100
Following Load Trains are created:
UDL-9.0 and UDL-2.5
Centrifugal Loads (CFG)
According to the Eurocode EN 1991-2; 4.4.2 the centrifugal force Q is taken
tk
as a transverse force acting at the finished carriageway level and radially to
the axis of the carriageway.
The characteristic value of the force Q , with dynamic effects included, is ta-
tk
ken from the table below:
Q = 0,2 * Q (kN) If r < 200 m
tk v
Q = 40 * Q /r (kN) If 200≤ r ≤ 1500 m
tk v
Q = 0 If r > 1500 m
tk
The value of the centrifugal force Q is automatically calculated by Allplan
tk
Bridge.
The value r represents the horizontal radius of the carriageway centerline in
meters.
The value of the force Q is a user input, it represents the total maximum
v
weight of vertical concentrated loads of tandem systems of the Load Model 1
and it will be calculated according to the following formula from Eurocode:
∑ * (2*Q )
αQi ik

| Q = 0,2 * Q (kN)
tk v | If r < 200 m |
| --- | --- |
| Q = 40 * Q /r (kN)
tk v | If 200≤ r ≤ 1500 m |
| Q = 0
tk | If r > 1500 m |


152 Allplan Bridge 2023
In this example the total sum of all tandem system vertical forces is equal to:
Q = 2*300 +2*200 = 1000 kN
v
The value of the adjustment factor will be taken equal to one, as for the 1st
αQi
class road for international heavy vehicle traffic.
For entering the centrifugal load value Q we will use already prepared temp-
v,
lates for load trains according to the Eurocode and select the Centrifugal Load
(CFG), as shown below:
After that, the new window will open and we need to input the value of the Q
v
force of 1000 kN, which value we calculated previously and the name of the
load “CFG”:
Earthquake load
In this construction phase we will define the earthquake impacts in a New
Phase with the name “Earthquake” which will be established in the tree of the
Schedule 1.
The effects of earthquake loading are calculated according to the multi-modal
response spectrum method.
For this, we need first to define the corresponding response spectrum ac-
cording to the Standard of the project. This is done under the Analysis/Dy-
namics/Modal menu.
Using the context menu, the user can define the wished earthquake event:

Allplan Bridge solution Training Part 1
153
There are several options available:
Generic – definition of the event with a user defined response spectrum.
Eurocode, horizontal – definition of the event with the horizontal design
spectrum according to the Eurocode.
Eurocode, vertical - definition of the event with the vertical design spectrum
according to the Eurocode.
For this project, we define two earthquake events, one for the horizontal and
one for the vertical direction.
After creating the new event with the name “EQ-EC horizontal” by using the
context menu of the menu Modal, the new window for the detailed response
spectrum definition will be opened:

154 Allplan Bridge 2023
The user is defining the Type of the structure as well as the Ground type,
where all other parameters, used for the creation of the graphic below, are
calculated automatically according to the Eurocode. It is still possible to use
the option User-defined and define the parameters manually.
On the right side, there is other important information for the definition of the
earthquake event available:
The Superposition rule which will be used for the superposition of the modal
contributions
Duration and Damping of the earthquake event, necessary for the DSC and
CQC rules and
a , thedesigned ground acceleration, which will be used to evaluate the re-
g
sponse spectrum.
In the same way as described above, we will define another event with the
name “EQ-EC vertical” and all the details are shown below:
When the response spectra are defined, we can return to the stage “Earth-
quake” and start with the definition of the tasks necessary for the earth-
quake calculation.
The necessary tasks can be found in the action bar under the tab Construc-
tion, together with all other calculation tasks under the sub folder Dynamics:

Allplan Bridge solution Training Part 1
155
Also, they are located in the action bar under the tab Loads & Checks, in the
task area Dynamics.
The evaluation of a certain earthquake event is based on the results coming
from the eigenvalue calculation.
For the calculation of the Eigen modes of the bridge we need first to define the
task EIGEN: Eigen calculation .
On the right side in the Properties window, we will additionally define the fol-
lowing Arguments:
nmode (number of modes) – number of the eigen vectors to be calculated
naddv (number of additional vectors) – number of the vectors that should
be additionally considered for the calculation, in order to attain convergence in
the case that the number of the defined number of modes is not enough.
resname (result name) – a user defined name of the result area for storing all
the results (displacements, forces, stresses) coming from the eigen modes
calculation. Those results are visible as 3D-Diagrams and Tables under the
function Results/Eigenmodes.
xlsout (Excel output) – a user defined name of the Excel file into which all the
results coming from Eigen calculation are saved. The excel file is stored in the
subfolder Reports/Schedule1/ Dynamic in the project folder.
The necessary definition of the properties according to the above explana-
tions are shown below:

156 Allplan Bridge 2023
In the next tasks we calculate the earthquake events for which we previously
defined the necessary response spectra under Analysis/Dynamics/Modal,
with the names EQ-EC horizontal and EQ-EC vertical.
The calculation of the earthquake events is done by using the task EQRE-
SPONSE: Earthquake response spectrum .
We define three different tasks in order to calculate earthquakes acting in
three directions - two in horizontal direction (X and Z), using the defined hori-
zontal response spectrum and one in vertical direction (Y), using defined verti-
cal response spectrum.
On the right side, in the Properties window, we will additionally define the fol-
lowing Arguments:
eq (earthquake) – name of the defined earthquake event which should be
calculated
vx, vy and vz – components of the earthquake excitation direction vector in
global X, Y and Z directions. Internally, the vector is always normalized to the
value 0.
resname (result name) – name of the result from the eigen mode calculation,
which has been calculated previously.
env (envelope) – user defined name of the envelope where all results of the
earthquake event (displacements, forces, stresses) will be saved.

Allplan Bridge solution Training Part 1
157
xlsout (Excel output) – user defined name of the Excel file into which all the
results coming from earthquake calculation are saved. The excel file is stored
in the subfolder Reports/Schedule1/ Dynamic in the project folder.
The necessary definitions for the first earthquake in X direction according to
the above explanations are shown below:
The definitions for the two additional tasks created to calculate the earth-
quake in Z and Y directions are shown below:

158 Allplan Bridge 2023
The complete list of the four tasks for this construction phase is shown below:


## Sayfa 161

Allplan Bridge solution Training Part 1
159
Superposition of loads
Under the tab Superposition in the Project navigation tree, it is possible to
define different load cases and envelopes where we want to combine the cal-
culated load cases or envelopes. In case of non-permanent loading, the com-
ponents of the result vector (internal forces and deformations) are individu-
ally considered and superimposed to get the minimum and maximum values
of all components together with the accompanying values of all other compo-
nents.
After selecting the tab Superposition, an empty window with the title Enve-
lopes will appear. By double clicking on this window or by using the context
menu on the empty area, the new window for interactive creation of the en-
velopes and load cases will appear in the central part of the screen. Addition-
ally, the window with all created/calculated load cases from the existing con-
struction schedules will appear in the middle.
The photo of this state, with already created envelopes, is shown below:
The user can logically organize envelopes in the Superposition View accord-
ing to his needs.
Information about the created envelopes position (for example the exact co-
ordinates of the envelope “boxes”) is saved in the XML file which is automati-
cally created together with the TCL file. This additional information about the
settings of the graphical user interface is saved only in the XML file, which
carries together with the TCL file the complete information about the project.

160 Allplan Bridge 2023
Therefore, it is always necessary to have those 2 files together, saved in the
same folder, to have all project definitions saved.
In this example we create several envelopes in which load cases and enve-
lopes are combined. Different rules as explained in the table below are hereby
used:
Rule Description Meaning
AddLc/AddEnv Add load case/envelope Add uncoditionally
AndLc/AndEnv And load case/envelope Add conditionally (only if unfavorable)
OrLc/OrEnv Or load case/or envelope Replace conditionally (only if unfavorable)
Each rule is graphically presented with a line which is differently coloured: Add
rule is green, And rule is black and the Or rule is yellow.
In this example, separate envelopes will be defined for the following loads:
Temperature, Settlement, Wind and Braking.
In the separate phase “Load superposition” we need to activate the superpo-
sitions which are created previously (this complete procedure will be ex-
plained in the next chapter) and to save the results in the wished envelope.
We will first define a New Phase in the tree of Schedule 1 with the name “Su-
perposition”.
For evaluating the defined superpositions, we need to create the calculation
task SUPTREE:Evaluate superposition for each envelope we would like to be
evaluated.
The complete list of defined tasks in this phase is given below:
In the Properties window of each calculation task, it is very important to de-
fine an Argument env which represents the name of the envelope where the
results of the calculation should be stored. In the photo below, you can see the
properties window for the first calculation task “Temperature”:

| Rule | Description | Meaning |
| --- | --- | --- |
| AddLc/AddEnv | Add load case/envelope | Add uncoditionally |
| AndLc/AndEnv | And load case/envelope | Add conditionally (only if unfavorable) |
| OrLc/OrEnv | Or load case/or envelope | Replace conditionally (only if unfavorable) |


Allplan Bridge solution Training Part 1
161
Superposition of temperature loads
For the temperature load we create several envelopes: for uniform tempera-
ture load, for temperature gradient, for the combination of uniform tempera-
ture load and gradient and the final envelope for maximum/minimum values
due to temperature. In those envelopes the minimum and maximum values
from each temperature load case will be saved.
By using different factors, according to the Eurocode, the envelopes will be
superposed into the final one. The complete scheme of the temperature en-
velopes is shown below:
According to the scheme above, the first envelope is the one for the uniform
temperature load. To create it, it is necessary to use the context menu on the
empty area of the right window or to click the icon in the top left corner of
this window for creation of a new envelope:

162 Allplan Bridge 2023
It is possible to use the view options in the top right corner to use the Full
view, or to Expand/collapse all envelopes at once. Also, the user can Ex-
port the active view to a PNG file format, which will be saved into the sub-
project folder “Results”.
We create the new envelope with the name “Unif-Temperature” which rep-
resents the combination of two previously defined load cases for constant
temperature difference, “Unif-temp-pos” and “Unif-temp-neg”, from the
construction phase “Temperature”. The new envelope is represented with
the blue rectangle.
To superpose a load case to an envelope it is necessary to drag and drop the
wished load case from the window with the complete list of the calculated
load cases.
The load cases must be dropped directly onto the created envelope. After
that, the created load case will be presented with the green rectangle and at
the same time the line with an arrow will appear for defining the superposition
rule.
The superposition rule (together with the factors) can be defined in the Prop-
erties window by clicking on the line directly. Additionally, it is possible to click
on the envelope rectangle. Additional functions will then appear - deleting and
editing of the envelope, creating the new superposition rule (by dragging the
arrow) and expanding or collapsing the envelope rectangle. After expanding
the rectangle, the user can click on the line with the wished load case and
change the rule or factor in the Properties window.
Below you can see the first created envelope and two combined load cases.
These two load cases will be combined by using the rules OrLc and OrLc,
which have already been explained before. The favourable and unfavourable
factors are both 1. The factor one is set by default, and it does not need to be
entered additionally.

Allplan Bridge solution Training Part 1
163
We will now create the second temperature envelope with the name “Grad-
linear-Temperature” which represents the combination of the two previ-
ously defined load cases for variable temperature, “GradHeat-linear-temp”
and “GradCool-linear-temp”, from the construction phase “Temperature”.
The load cases are combined by using the rules OrLc and OrLc, which have al-
ready been explained before. The favourable and unfavourable factors are
both 1.
Before creating the final temperature envelope, we need to create two inter-
mediate envelopes to combine the variable and constant temperature com-
ponents.
In the first envelope “Temperature-unif-leading” the leading envelope will be
the constant temperature component and therefore it will be superposed
with the rule And, and the factor 1. The second envelope is the variable tem-
perature component which will be superposed with the rule And, and the fac-
tor 0.75:

164 Allplan Bridge 2023
In the second envelope “Temperature-grad-leading” the leading envelope
will be the variable temperature component and therefore it will be super-
posed with the rule AndEnv and the factor 1. The second envelope is the con-
stant temperature component which will be superposed with the rule AndEnv
and with the factor 0.35:
Finally, we create the last envelope for the temperature load with the name
“Temperature” which represents the superposition of two intermediately
created envelopes “Temperature-unif-leading” and “Temperature-grad-
leading”.
The order of adding them to the final envelope is not important. Important is
that the first envelope that is superposed will have the rule OrEnv, and the
second one also rule OrEnv, which will give as the final envelope for tempera-
ture with most unfavorable results:
Superposition of settlement loads
All the settlement load cases defined previously under Construction are su-
perposed into one envelope “Settlement”.
The first load case “Settle-A1” is added with the conditional rule AndLc and all
the other load cases are superposed by using the same rule AndLc, which
means that all individual result components are added only if the respective
minimum and maximum values become unfavourable.
The complete superposition scheme for this load type is shown below:

Allplan Bridge solution Training Part 1
165
Superposition of wind loads
Wind load cases in both directions, which consider the acting of the wind with
or without traffic will be separately superposed into the two envelopes by us-
ing the superposition rules OrLc and OrLc.
This means that all existing result components are substituted with the new
ones, but only if the respective minimum and maximum values become unfa-
vourable.
The complete superposition scheme for both new envelopes “Wind-with-
Traffic” and “Wind-without-Traffic” is shown below:
Superposition of braking loads
The same principle of superposition, as for the wind load, will be used for brak-
ing.
Braking load cases in both directions, defined previously under the Construc-
tion, will be superposed into the final “Braking” envelope by using the super-
position rule OrLc.

166 Allplan Bridge 2023
The complete superposition scheme for braking load is shown below:
Superposition of traffic loads
The evaluation of the traffic loads can be done under the tab Analysis/Superposi-
tion/Envelopes/Traffic Loads in the Project navigation tree.
In Allplan Bridge one load train is combined with a wished lane (load train posi-
tion) by superposing them into an envelope.
This combination of the lane and train is being evaluated with the influence line
which has been calculated for this lane or load position, and the result is saved
into the created envelope.
The creation of the envelope is done in the same way like for all other loads
and this workflow was already explained in the previous chapters.
The wished load trains and lanes can be dragged and dropped from the re-
spective menu into the workspace or directly to the created envelope.
In this example, we create several envelopes to combine all load trains with
the corresponding lanes.

Allplan Bridge solution Training Part 1
167
We will first create new envelopes for the tandem system load trains, which
we will combine with the corresponding lanes from the lane set group on the
Right side of the carriageway.
Those envelopes are defined with the following names, and they include the
following train – lane combination:
L1L_TS300 includes tandem system TS300 positioned on the 1st notional lane
left.
L2L_TS200 includes tandem system TS200 positioned on the 2nd notional
lane left.
Those created lanes are combined into one final envelope for the tandem sys-
tem positioned on the left lane set group by using the wished superposition
rules with the name “LM1_TS_R”.
The first group of created envelopes is shown schematically on the screens-
hot below:
It is very important to choose the desired load direction of the lane for which
you want to carry out the evaluation (vertical, longitudinal, centrifugal, combi-
ned).
This can be done in the edit mode of the lane, when the new window Edit In-
fluence line will appear. Also, it is possible to choose this via the Properties
window on the right side.

168 Allplan Bridge 2023
For all the lanes which will be combined with the tandem system and uniformly
distributed (UDL) load we will set the load direction to Vertical.
Hint: The corresponding load direction was also selected previously, when the
lane set group was defined to calculate the corresponding influence line. (see
chapter Traffic Loads/Lane Set)
We create the next envelopes for the uniform (area) load cases (UDL).
These will be combined with the corresponding lanes from the lane set group
on the right side of the carriageway.
Those envelopes are defined with the following names and they include the
following train – lane combination:
L1R_UDL9 includes the UDL-9.0 load positioned on the 1st notional lane on the
right
L2R_UDL2.5 includes the UDL-2.5 load positioned on the 2nd notional lane on
the right
L3R_UDL2.5 includes the UDL-2.5 load positioned on the 3rd notional lane on
the right
Those lanes are combined into one final envelope for the uniform load system
and are positioned on the right lane set group by using the wished superposi-
tion rules with the name “LM1_UDL_R”.
This group of created envelopes is shown schematically on the screenshot
below:


## Sayfa 171

Allplan Bridge solution Training Part 1
169
The last Envelope for the superposition of the traffic loads, which we create, is
for the centrifugal load. It gets the name “CFG” and we combine there the
created centrifugal load (CFG) and the first notional lane from the lane set on
the right side.
We chose this lane because it is, considering the cross fall, located on the hig-
hest part of the main girder cross section. Therefore, we will get the most un-
favorable results when we position the centrifugal force on this existing lane.
Here at this lane, it is important to set the load direction to “Centrifugal”.
The complete scheme of this envelope creation is shown on the screenshot
below:
So far, we have created the definition of superposition. Now we have to acti-
vate the Result calculation in the Construction Schedule.
We will first define a New Phase called “Superposition”. Start day is set to
“Final”.
For evaluating the defined superpositions, we need to create the calculation
task SUPTREE: Evaluate superposition for each envelope, which we would
like to evaluate. Note: No assembly needs to be created for “SUBTREE”.
The hereby necessary subtree definitions are shown below:

170 Allplan Bridge 2023
The complete list of defined tasks in this phase is given below:
Superposition of earthquake loads
In this chapter we will make the superposition of the earthquake envelopes
produced in the construction phase “Earthquake” for each direction of earth-
quake excitation: horizontal (Resp_Horizontal_X and Resp_Horizontal_Z) and
vertical (Resp_Vertical_Y).

Allplan Bridge solution Training Part 1
171
In accordance with the requirements of the Eurocode we will create four new
envelopes by using the same approach with drag and drop of the existing
earthquake envelopes located under the tab Superpositions/Dynamics:
The envelope with the name “EQ_X-max” for superposing the envelopes
from all three directions, with the earthquake in X direction as leading compo-
nent with 100% participation. The two remaining earthquake envelopes of ex-
citation in Z and Y directions are included with 30%.
The envelope with the name “EQ_Y-max” for superposing the envelopes
from all three directions with the earthquake in Y direction as leading compo-
nent with 100% participation. The two remaining earthquake envelopes of ex-
citation in X and Z directions are included with 30%.
The envelope with the name “EQ_Z-max” for superposing the envelopes
from all three directions with the earthquake in Z direction as leading compo-
nent with 100% participation. The two remaining earthquake envelopes of ex-
citations in X and Y directions are included with 30%.
The final envelope “Earthquake_fin” for getting the maximum results of the
three previously created envelopes. This is done by using the necessary con-
ditional superposition rule Or (substitution of the results with the new, but
only if they are more unfavourable than the existing ones).
The complete superposition scheme for earthquake load is shown below:

172 Allplan Bridge 2023
Combination table
The results of the calculated loads are saved in load cases or envelopes. These
results will now be used to create the necessary Combinations for the design
checks. To account for safety and considering the probability of a concurrent
presence of different load impacts, these combinations are factored sums of
load cases and envelopes.
For the proper definition of design checks, which will be explained in the next
chapter, it is therefore necessary to create several load combinations and su-
perimpose them into the final envelopes relevant for performing design code
checks. In Allplan Bridge the rules for creating the required combinations are
defined in the so-called combination table.
For this example, we will create a combination table which consists of differ-
ent loading groups, combination types and combination groups.
The combinations are made in accordance with the rules and factors defined in
Eurocode EN 1990.
The combination table defined for this example is shown below and it includes
six different combinations (C1 – C6):
For creating a new combination table we go to the analysis tab and select the
vertical tab Combinations on the bottom. We click with the right mouse but-
ton in the empty space and select the option New combination table.

Allplan Bridge solution Training Part 1
173
The newly defined combination table has four columns with loading groups
created per default, and it has the following look:
It is very important that all envelopes used in the combination table have al-
ready been evaluated with the task SUPTREE before using them for creating
a combination. Otherwise, the program cannot access the results from the
envelope and will therefore produce an error.
Therefore, we return to the phase “Superposition” and create the calculation
task SUPTREE:Evaluate superposition for all missing envelopes, which we
would like to evaluate and which we want to use in the combination table:
Loading Groups
For a better overview, combination tables are divided into several loading
groups: Permanent Loads, Pre-stressing Loads, Time Effects and Variable
Loads.
The names of the created groups can be changed by the user, and necessary
new groups can be added as well.
Loading groups serve only for organization and have no influence on the cal-
culation
The exception are all load cases/envelopes belonging to the load group Pre-
stressing loads, where the upper and lower characteristic values according to
EC are automatically considered within the program, depending on the re-
spective check being performed.

174 Allplan Bridge 2023
New loading groups can be added by clicking with the right mouse button on
Loading Groups and selecting the option New Loading Group. The new load-
ing group will be visible in the list on the left side but also placed on the right
side in the combination table as shown below:
In the following steps, the individual load cases and envelopes will be assigned
to the desired loading groups.
Adding load cases/envelopes
Adding of load cases and envelopes is done with the drag and drop function.
On the left side of the combination table there are all load cases and envelopes
listed, which are available in the project and can be added to the combination
table.
When moving an envelope (as shown below) or a load case into the table the
user can choose the loading group where he wants to place it. The „+“ - sign
marks every potential spot where the load cases can be inserted.
It is also important to know that the order of the load cases/envelopes is im-
portant. Please note that the superposition of the individual load

Allplan Bridge solution Training Part 1
175
cases/envelopes defined in a combination row is done consecutively from left
to right from the first to the last column.
Create a combination table
The user is free to add as many combinations to the combination table as he
needs.
Adding of a new combination is done by right clicking to the field which is
marked with Click here to add a new row. After that a new window will open:
The user is free to add the combinations one by one or to add several (5, 10,
20) combinations at once.
The Number (No.) of the combination as well as the Name is created auto-
matically. The user can freely change the name of each combination according
to the project needs, by double clicking on the combination name in the col-
umn Name or by pressing the F2 button.
Moving/Deleting rows and columns
Columns can be moved to the left or right by using the little arrows in the Load
case/Envelope row:
When clicking with the right mouse on a row it can be moved up or down anal-
ogously to the columns:

176 Allplan Bridge 2023
Rows and columns can be deleted in the same menu (the menu pops up with a
right mouse click) which is used for moving rows/columns.
Superposition rule
The superposition rule ADD, AND, OR can be changed by clicking and selecting
it from the dropdown menu. It can also be selected by clicking with the right
mouse button on it and then choosing the option Superposition Rule.
Combination type
There are seven combination types available in Allplan Bridge. They are auto-
matically created and they refer to the type of combination according to the
Standard: Characteristic, Frequent, Permanent, Quasi-permanent, ULS, Fa-
tigue and Accidental.
The combination type is important to be defined for further proper usage of
the respective combinations when the design code checks are performed for
the combination group. The combination type can be changed by using the
drop-down menu in the corresponding Type row:

Allplan Bridge solution Training Part 1
177
Filter combination types and combination groups
It is possible to filter the combinations by type and by group. This is done by
clicking on the filled yellow squares on the left side. When the square is not
highlighted, the combinations of the specific type/group are not visible in the
table anymore:
Filtering is very helpful when the project contains a lot of combination
types/groups, and it allows a much better preview:
Full table on the left and filtered combination types on the right side
Hint: These screenshots are only offered as an example and are not related to
this project.
Combination Groups
Several combination groups are automatically created when the combination
table is defined. The names of the created groups can be changed by the user,
and the necessary new groups can be added as well.

|  |  |
| --- | --- |


178 Allplan Bridge 2023
Groups can be added by clicking with the right mouse button on Combination
Groups and selecting the option New combination group.
To assign a certain combination to a group, the user needs to select the group
number in the group column by clicking on the corresponding field in the table
on the right side. One combination can be assigned to many groups. The
results from the combinations within a group are automatically superimposed
with the rule Or.
For this example, we create only one Combination group with the name
“ULS”.
We add the combinations C4 and C5 to this group, by thicking the boxes in the
table on the right side. The final combination table look as follows:
When the complete combination table is defined, the user is able to adjust the
width of the columns and to control the preview by using the slide at the bot-
tom of the window.
The columns can be widened by clicking on a vertical line in the row
Name/Type and pulling the line to the right side.
When widening the column Name on the left side the Name column on the
right side is widened too. Those columns are linked to one another.
Calculation of combinations
We define a New Phase in the tree of the Schedule 1 with the name “Combi-
nations” and we use this phase to calculate the combination groups and/or
single combinations to be used further for design code checks.
In this example we will evaluate one existing combination group “ULS” (which
means an automatic evaluation of the included combinations C4 and C5) and
other combinations created in the combination table: C1, C2, C3 and C6.
The final look of the phase “Combinations” is given below:


## Sayfa 181

Allplan Bridge solution Training Part 1
179
Calculation of a combination group
In the action bar, in the task area Construction, and under the function Create
new calculation task we select the option Envelopes & Combinations,
where we can find the necessary task COMBGROUP: Evaluate combination
group.
The task COMBGROUP: Evaluate combination group can be also found in
the task area Loads&Checks and the task area Envelopes.
All combination results within one group are evaluated, superimposed with the
rule “or” and saved in the user defined envelope.
We will type in the name of the wished combination group “ULS” under the
argument env:

180 Allplan Bridge 2023
When the calculation is done on a certain day in the timeline, the user must be
aware that only load cases, which already exist at that time, can be used.
When the calculation is done at the final day, there is no input needed for the
day.
Hint: It is very important that all used envelopes in the combination table have
already been evaluated with the task SUPTREE before using the task
COMBGROUP in the construction schedule. Otherwise, the program cannot
access the results from the envelope and will therefore report an error.
Calculation of a single combination row
In the action bar in the task area Construction and under the function Create
new calculation task , the user needs to select option Envelopes & Combi-
nations where the task called COMBROW: Evaluate combination is located.
The task COMBROW: Evaluate combination can be also found in the task
area Loads&Checks and the task area Envelopes.
When the task COMBROW is selected, the user must put in the name of the
wished combination (C1, C2, C3 and C6), under the argument env:

Allplan Bridge solution Training Part 1
181
When the calculation is done on a certain day in the timeline, the user must be
aware that only load cases, which already exist at that time, can be used.
When the calculation is done at the final day, there is no input needed for the
day.
The results from the combination table which have been created with the
tasks COMBROW and/or COMBGROUP can be accessed in the Results tab.
They are located in the bottom table Result Data under the tab Enve-
lopes/Combinations.

182 Allplan Bridge 2023
Design Checks
In this chapter we need to define several tasks to complete the whole work-
flow of design and checks of the structure. First of all, we will start with linear
elastic stress check to tune the tendons and preliminary design them. We will
continue with design of reinforcement area in reinforcement sets and code-
based checks of designed or given reinforcement. At the end, we will print out
snippets of reports for all previously defined tasks.
We will first define the New Phase in the tree of the Construction 1 with the
name “Design-checks”.
The complete phase with all defined tasks has the following look:
For evaluating linear elastic stresses, we need to define the calculation task
LINSTRESS: Linear stress for each envelope we want to evaluate. In this
case, we need one for SLS characteristic envelope and one for SLS quasi-
permanent envelope.
The stresses are being calculated for all vertices of the cross section and the
extreme values are available in the Linear stress report. Additionally, the user
has the possibility to create Property Set type Stress points and, in that
manner, define the specific points where the stresses should be evaluated.
For this example, we defined two stress points, SP1 (top fibre) and SP2 (bot-
tom fibre).
We define now the first of specified tasks in this phase in task Loads &
Checks under the task area Design Checks. After the function LINSTRESS:
Linear stress is selected the new window will appear:

Allplan Bridge solution Training Part 1
183
The argument Envelope – “C1” defines the envelope for which the calculation
task is performed. This envelope and its name and content are already defined
in the chapter Combination - table. Here we perform the evaluation of the lin-
ear stress for the characteristic SLS combination.
Argument Day represents the day on which the check should be performed.
If this argument is empty the program is taking the actual day when the task
is defined from the construction sequence.
Current version supports the calculation of normal stresses, so we see just
one checkbox Normal that we need to tick in this window.
Result Name is the name of a result in the database where results will be
stored and used by REPORT tasks, in this case “LinStress-Char”.
The stress calculation is performed for the whole girder so the assembly for
the first task is the structural member “Superstructure”. The list of as-
semblies has the following look:
We will now define the second task by using the icon LINSTRESS: Linear
stress positioned in the task Loads & Checks under the task area Design
Checks.
The name of the second linear stress task will be defined with the name “Lin-
ear stress – Qp” and here we perform the linear stress check for quasi per-
manent SLS envelope.
We will fill define the Arguments as following: Envelope should be “C3”, the
Result Name is “LinStress-Qp” and Normal stress calculation switched on.
The necessary envelope and its name and content are already defined in the

184 Allplan Bridge 2023
chapter Combination table. Here we perform the evaluation of the linear
stress for the quasi-permanent SLS combination.
The window for definition of this task is shown below:
The assembly for the second task is also the structural member “Superstruc-
ture”, so the list of assemblies has the following look:
We will now define the third task by using the icon CODEDESIGN: Code
Design positioned in the task Loads & Checks under the task area Design
Checks.
Using this task, the complete required design of the structure according to the
standard is performed.
This includes the design of the required reinforcement in ULS (ultimate limit
state) for bending moments + normal force as well as shear force + torsion,
the design of the required crack reinforcement in SLS (serviceability limit
state) and the design for several detailing rules.
The required longitudinal or transversal reinforcement is determined accord-
ing to the specified envelope and for the wished elements defined using as-
semblies.
The results of the code-based design are saved under the name defined by
the user.

Allplan Bridge solution Training Part 1
185
In the screenshot below, you can see the window for definition of this task:
The argument Envelope ULS should use combination group named “ULS”.
Other arguments for envelopes use corresponding names of SLS combina-
tions (Characteristic, Frequent, Quasi-permanent) as it can be seen on the
screenshot above and they define the envelopes for which the calculation
task is performed. This envelope and its name and content are already defined
in the Combination table chapter.
Argument Day will be defined as 107 days, which represents the duration of
the construction sequence before the beginning of the infinite state.
Result Name is the name of a result in the database where results will be
stored and used by REPORT tasks, in this case “ReinfDesign”.
Tip: It is worth mentioning, that more design tasks can be stored under the
same result name. If design tasks are stored in different result names, we can
print out the results in reports separately. If we want to print out the optimal
minimal reinforcement area resulting from multiple design tasks (for more en-
velopes) we can store all of them under the same result name and print this
overall reinforcement areas in one report snippet. This principle can be benefi-
cial for design and check tasks.
The calculation of design of reinforcement can consider the requirements for
Flexure, Brittle failure, Shear, Torsion, Crack by ticking the corresponding
checkboxes.
In Eurocode calculations of shear, torsion or interaction needs additional pa-
rameter of variable angle of strut - theta. In this example Theta is set to 45
degrees.
The code design will only be performed for one element above the pier and
one element in the center of the middle span, so the list of assemblies has the
following look:

186 Allplan Bridge 2023
We will now define the fourth task by using the icon CODEDESIGN: Code De-
sign positioned in the task Loads & Checks under the task area Design
Checks.
In the screenshot below, you can see the window for definition of this task:
The argument Envelope ULS should use combination group named “ULS”.
Other arguments for envelopes use corresponding names of SLS combina-
tions (Characteristic, Frequent, Quasi-permanent) as it can be seen on the
screenshot above and they define the envelopes for which the calculation
task is performed. This envelope and its name and content are already defined
in the Combination table chapter.
Argument Day is left empty, which means that the time infinite state is taken
for the check performing.
Result Name is the name of a result in the database where results will be
stored and used by REPORT tasks, in this case “ReinfDesign”. The calculation
of design of reinforcement can consider the requirements for Flexure, Brittle
failure, Shear, Torsion, Crack width by ticking the corresponding check-
boxes.
In Eurocode calculations of shear, torsion or interaction needs additional pa-
rameter of variable angle of strut - theta. In this example Theta is set to 45
degrees.
The code design will only be performed for one element above the pier and
one element in the center of the middle span. The list of assemblies has the
following look:

Allplan Bridge solution Training Part 1
187
The next two calculation tasks that we will define represent the code-based
checks for ultimate and serviceability limit states. This check includes the
checks for flexure, brittle failure, shear force and torsion as well as the inter-
action of the shear force and torsion for ULS. To cover SLS it contains Stress
limitation and Crack control checks and is completed by providing checks of
several detailing rules.
The capacity of the structure is determined in the form of maximum
forces/moments that can be absorbed according to the specified envelope.
Any existing reinforcement is considered. The user is during Cross Section
definition able to define the wished reinforcement area (As) in the corre-
sponding property sets.
The check is being performed for the wished elements, defined with assem-
blies, and the result of the check is saved under the user defined name.
This check is defined using the task CODECHECK: Code check positioned
in the task Loads & Checks under the task area Design Checks.
In the screenshot below, you can see the window for definition of CODE
check at the specified time t0:
In the next screenshot, you can see the window for definition of ULS check at
the time infinite:

188 Allplan Bridge 2023
The assembly for both CODECHECK: Code check tasks contains again
two elements of the structural member “Superstructure”, so the list of as-
semblies has the following look:
All Results can be viewed in the Project Navigation tree under the Re-
sults/Tables/Design Checks in the format of tables and also exported to Ex-
cel files by using the corresponding Export function from the Actionbar.
All exported tables with the Results are automatically saved in the subdirec-
tory “Results” of the project directory (please check the next Chapter Re-
sults/Tables or online Help for more details).
We can begin now with the tasks related to the definition of the reports.
All calculation tasks have corresponding report task, so we can e.g. calculate
the whole structure, but the user can select to report just important parts of
the structure in detail.
We start again with two tasks for linear stress calculation.
We define it by using the icon LINSTRESSREPORT: Report – Linear stress
positioned in the task Loads & Checks under the task area Design Checks.
For linear stress report we need to input two arguments: Result Name as
“LinStress-Char” given for calculation of characteristic SLS envelope and to


## Sayfa 191

Allplan Bridge solution Training Part 1
189
tick the Normal checkbox to print out normal stresses. The complete defini-
tion is shown below:
Here we just want to report the results in the center of the bridge and the list
of assemblies should have the following look:
The second report task is the same LINSTRESSREPORT: Report – Linear
stress but made for the different Result Name “LinStress-Qp” and again
for Normal stresses.
The assembly for this task is the center element of the member “Superstruc-
ture”, so the list of assemblies has the following look:
The reason, why the calculation task has an assembly for whole girder and re-
port just for one element is, that we already have minimal and maximal
stresses along the length calculated. Those results are important for engineer
to follow to tune the structure and can be e.g. exported to an excel file to
make this kind of report.

190 Allplan Bridge 2023
LINSTRESSREPORT produce a detailed overview of stresses calculation in
given stationing and time, so we can fully understand in which fiber extreme
values occur.
The next report task is for reinforcement design results. We define it by using
the icon DESIGNREPORT: Report – Design positioned in the task Loads &
Checks under the task area Design Checks.
The Result Name is “ReinfDesign”:
The report is done for both calculated elements, so the assembly for this task
is the structural member “Superstructure”. The list of assemblies has the fol-
lowing look:
The next two report tasks are defined for the reinforcement design results.
We define them by using the icon CHECKREPORT: Report – Check posi-
tioned in the task Loads & Checks under the task area Design Checks.
The definition of the report for the time t=0, with the Result Name “Rein-
fCheck_t0” is shown below:

Allplan Bridge solution Training Part 1
191
The definition of the report for the time infinite, with the Result Name “Rein-
fCheck_too” is shown below:

192 Allplan Bridge 2023
The user can choose, by ticking the corresponding boxes, which components
of the report he would like to produce. Available are reports for flexure, shear,
torsion, interaction between Shear, Torsion and Flexure, stress limitation,
crack control report and the report for several detailing checks..
For this example, we will select all the reports which are available.
The assembly for both tasks are again the same elements of the structural
member “Superstructure”, so the list of assemblies has the following look:
All created Reports are after the project calculation automatically saved as
Word documents in the subdirectory “Reports” of the project directory.
For all additional information and more explanations about the design code
checks please use our Online Help available directly in the program by clicking
the F1 button or you can use the icon in the upper right corner of the title bar
in order to open the Help.

Allplan Bridge solution Training Part 1
193

194 Allplan Bridge 2023
Results
The Results tab in the Project navigation tree is used to select the views or
the tables of the load cases and envelopes to be displayed.
The Results window is further divided into two separate windows horizon-
tally:
- Upper window Results where the user is able to select the type of view.
-Bottom window Result Data where the user can select the wished result
type.
Upper window Results is divided into several vertical tabs: Loads, 3D-Dia-
grams, Tables and Influence Lines for a graphical preview of the loads and in-
fluence lines as well as for a graphical or tabular view of the results.
Bottom window Result Data is divided into several vertical tabs: Load Cases,
Envelopes, Lane Sets and Design Checks for choosing the wished result
data.
With the selection and combination of the wished tabs in the top and bottom
window the user can get the view of the wished result in the main window
Analysis Model on the right side.
Loads
The user can create as many load views as he needs in order to present loads
from different load cases. He can create a New View or Copy the one previ-
ously created. Under one load view the user can choose to activate the dis-
play type Coloured Surface.
It is possible to create numerous Loads and copy already existing one, using
the context menu. The user can create New Load using the context menu of
the menu Loads. After the load is created it is necessary to select the wished
Load Case in the bottom window.
It is important to go to the Properties window on the right side and select the
wished Load type, as shown on the screenshot below.
In the same window the user can adjust view options as well.

Allplan Bridge solution Training Part 1
195
After all necessary definitions are made one Load is presented in the view
window in the following way:
In 3D view we can see the wind load presented with the arrows showing the
load direction acting on the structure and, on the traffic, but also, we can see
the loaded surfaces which are shown as well.
The corresponding checkboxes can be used to activate or deactivate wished
load views or load.

196 Allplan Bridge 2023
3D - Diagrams
The user can create as many views as he needs in order to present loads or
various results from different load cases or envelopes. He can create a New
View or Copy the one previously created. Under one result view the user can
decide between 3 different display types: Deformed Structure, Coloured
Surface and Diagrams. The corresponding checkboxes can be used to acti-
vate or deactivate certain result views or diagrams.
It is possible to create numerous diagrams, by copying already existing one,
using the context menu.
The selection of the result components is done via the action bar Results.
The user can decide between Displacements, Forces or Stresses to be dis-
played for the wished load case or envelope and save this view into the new
diagram.
It is also possible to define the Leading component for the results of the
wished envelope in the action bar as well as to define the Scaling factor.
To define a diagram the user must first click on the diagram which he wants to
define in the upper Results window, and only then to click on the load case to
be displayed or on the envelope in the lower window Result Data/ Load
Cases or Envelopes and also select the desired result components in the Re-
sults action bar.
One properly created 3D diagram is shown on the screenshot below:

Allplan Bridge solution Training Part 1
197
The Properties window can be used to make various settings for displaying
coloured areas and diagrams. In this example you can find different views and
diagrams defined for various loads and envelopes.
Tables
Tables window is divided into the two windows horizontally. With the selec-
tion of the wished component: Internal forces, Displacements, Stresses,
Tendon Forces or Design Checks in the upper window and the selection of
the wished load case or envelope to be displayed, in the lower window, the
user can get the table with the wished results in the main window on the right
side:
In order to see the results of the design code checks in the tables the user
must select the vertical tab Design Check in the lower window together with
the Design Check component selected in the upper window as shown on the
screenshot below:

198 Allplan Bridge 2023
It is possible to get the table from any design check performed and defined in
the project. The user can see the necessary amount of the reinforcement per
element and per property set defined in the cross section, Normal Stresses
and other calculated values.
Using the function Export to Excel the user can export each table in the
excel file format and use the results for completing the project documenta-
tion.
By selecting the icon Report – Check it is possible to create a three-di-
mensional interaction diagram for the flexure check made in the project.
For this, it is necessary to select the corresponding file (*Flexure.stl) saved in
the subdirectory “Checks” where all the results of the ULS & SLS design
check are saved and the 3D diagram will be created as shown below:


## Sayfa 201

Allplan Bridge solution Training Part 1
199
For all additional information and more explanations about the results from
design code checks please use our Online Help/Actionbar/Results/Design
Checks.
Help is available directly in the program by clicking the F1 button or you can
use the icon in the upper right corner of the title bar in order to open the
Help.
Influence Lines
This window is divided into the two windows horizontally.
The user must select the wished influence line component in the upper win-
dow:
Internal forces – N , V , V , M , M , M
x y z x y z
Displacements – u , u , u , r , r , r
x y z x y z
Stresses – Sigma
x
Also, it is necessary to select the wished Lane Set for which influence lines
should be displayed, in the lower window.
After that the user will get the graphical preview of the wished influence lines
for selected element:

200 Allplan Bridge 2023
The user can select the wished element in the 3D model in order to get the in-
fluence lines for this specific element. The element will be highlighted in the
model.
Additionally, it is possible to use the task area Influence lines positioned under
the tab Results and choose the wished load train defined in the project to-
gether with the load train direction as shown below:
Transfer Analysis Model to ALLPLAN Bimplus
In order to transfer the Analysis Model to other Programs (e.g. Larsa 4d), it is
possible to upload the Analysis Model from Allplan Bridge to Bimplus and
transfer it from there to other Programs.
It is of course necessary to create an analysis model in Allplan Bridge before.
When model is available and correct, the further steps are very simple and
done as follows:
Login into Bimplus (in Allplan Bridge – at the right/top )

Allplan Bridge solution Training Part 1
201
Choose the Project and then Export the Analysis Model
->
After exporting is done, the Analysis model can be reviewed and downloaded
from Bimplus to other programs.
The last step is selection of the function Export Analysis Model available un-
der the menu in the top right corner, next to the Bimplus log in.
An Analysis model available in Bimplus can be further used by third parties in
order to be transferred to other solutions for bridge analysis and design.
This model contains all the information about the analysis model: beams,
nodes, structural connections with stiffnesses of springs etc.

202 Allplan Bridge 2023

Allplan Bridge solution Training Part 1
203
Soil Supports 108
Index
Structural members 26
Structural unit-Beam 14
Structural Units 14
Submenu 27
A V
Abutments 104 Variables 34
Add circle 8 Variation 30, 35
Add point 8
Add spiral by length 8
Analytical model 95
B
Beam elements 97
Boundaries 13
D
Delete stations 29
F
Full view 10
G
Groups 103
I
Initialize the project database 95
Input stations 29
L
List of rigid connections 110
M
Main girder cross section 18, 20, 21
P
Parametric Lines/Points 11
Pier cross section 12
Plan 7
Point 9
Profile 8
Property Sets 111
R
Recalculate 6
Reference points 15, 19
Rigid connections 109
Round boundary point 19
S
Save current project 95
Show parametric lines/points 10
Show structural beam unit mesh 11

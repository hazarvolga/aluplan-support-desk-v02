# Allplan Bridge Solution Training Guideline Part 2

**Kategori:** Training Guidelines
**Kaynak:** `Allplan Bridge Solution_Training Guideline_Part 2.pdf`

---

**Toplam Sayfa:** 90


## Sayfa 1

Allplan 2023
Part 2
Prestressed concrete bridge
November 2022

Content i
Content
Detailing and reinforcement modeling ............................. 2
Data exchange between Allplan Bridge and Allplan .......................... 2
Import Allplan Bridge model ................................................................... 4
3D modelling in Allplan Engineering .................................................. 6
Bearing modeling .................................................................................... 7
Anchor smart symbol ............................................................................ 11
Updating the Allplan Bridge model ....................................................... 16
Sections and 2D elements ..................................................................... 17
Reinforcement modeling in Allplan Engineering ............................. 28
Pile cap reinforcement .......................................................................... 28
Pier reinforcement ................................................................................ 42
Pile reinforcement ................................................................................ 52
Abutment reinforcement ...................................................................... 58
Creating schemas and bar legends ....................................................... 68
Creating layouts and reports ........................................................... 72
Creating file sets ................................................................................... 72
Creating print sets ................................................................................. 73
Creating reports .................................................................................... 74
Creating layouts .................................................................................... 77
Tendon layout ....................................................................................... 81

2
Detailing and reinforcement
modeling
In this chapter you will learn how to export the model from Allplan Bridge to
Allplan Engineering and how to use Allplan Engineering’s functions for
modeling and detailing.
Data exchange between Allplan Bridge and Allplan
The Allplan Bridge's bridge model data can be transmitted to Allplan 2023 for
further detailing and modelling (i.e., reinforcement definition).
In the GUI of Allplan 2023, this function can be found in the Parametric
Modelling tab of the Allplan Bridge Construction role as shown in the
screenshot below:
There are five functions available:
Create new Allplan Bridge project
Opens an Allplan Bridge product and creates a new Allplan Bridge project in
the current Allplan project directory.
Tip: The start-up dialog of Allplan Bridge consists of several different
examples which can be loaded directly into the program. In the same window
you can open the description of the Allplan Bridge 2023 Getting Started
example by clicking the icon .
Import Allplan Bridge data
Imports an Allplan Bridge project from a project directory which can be
selected.
The window with the default definitions opens offering several options to be
chosen:

3
As workspace, the user can choose the local workspace of an active Allplan
project or create a user-defined workspace with a new project name.
The import of the existing bridge objects from Allplan Bridge to Allplan -
3D bodies, axes, extrusion paths, and the sections – is defined by the user.
Depending on the import definitions, the building structure of the Allplan
project can have several different looks.
All the objects of the bridge can be imported into the active drawing of the
project; in the new drawings – where all the objects of the structural
members from Allplan Bridge are saved under one structural level in different
drawing files; or in separate drawings – where a separate structural level (MG,
Pier1, Pier2) with corresponding drawings for each object type (3D Bodies,
Axis, Extrusion paths and Sections), is made for each structural member.
Start Allplan Bridge
Opens an Allplan Bridge project (if the connection to Allplan project exists).
Update Allplan Bridge data
Imports a newly created project or updates a project already imported from
Allplan Bridge into Allplan.
Delete Allplan Bridge data
Deletion of objects from Allplan Bridge or the entire Allplan Bridge data.

4
Import Allplan Bridge model
In this chapter we assume, that you already know some basics of Allplan
Engineering. If you have any additional questions or want to learn basics of
Allplan Engineering, please refer to the online help or step by step tutorials on
https://connect.allplan.com/learn/documents.html.
Create a new Allplan project named Allplan Bridge Training and do not use any
project template.
Open on a Project-Specific Basis and choose Create custom building
structure. Select the building structure tab and click close. After that, activate
the Bridge Construction role and select Import Allplan Bridge data. Set the
User defined workspace to import the Allplan Bridge Training project from
Allplan Bridge.
The bridge geometry is created in the drawing files which follow the last
existing drawing file in the building structure.
When the import is completed, you can see the 3D model generated in Allplan
Engineering.

5
With the import of the Allplan Bridge project to Allplan, the building structure is
also created according to the selected import options.

6
3D modelling in Allplan Engineering
Using the Allplan Engineering you can quickly and easily model any 3D shape,
create cross sections for any structural part of the bridge structure, model
reinforcement, create layouts and reports etc.
In this part of the tutorial, you will learn how to use the 3D modeling features
of Allplan Engineering. It will be shown how to model bearings, how to save it
as smart symbol to use it for smart placement, and how to get anchor objects
from a tendon smart part.
In this part you will mainly use tools from task “Modeling”.

7
Bearing modeling
First, you will learn how to model bearings, which will be used for smart
placements. It is shown in the picture below:
You will model bearings in a new drawing file, which will be used only to model
smart placements. Select Open on a project-specific basis. Insert any
structural level from the Insert any structural level menu in the building
structure and assign drawing files 30-35 with drag and drop. Rename drawing
file 30 to Smart placements and set it to Current status, set all other drawing
files to “not selected”.
To model the bearings, you will use the functions Box , Chamfer Edge ,
Extrude and Copy and Mirror . Select box function and click anywhere in
workspace. Enter the coordinates for diagonal point as shown below:
Activate the front left isometric view, select the Chamfer edge function,
and set the Chamfer width to 0.05 m.

8
Then select the box and all top edges of the box.
Press esc twice to finish and close the command. Now select the extrude
function and activate the Extrude Offset Surface and New Element
options.
Select Top surface, enter the offset of 0.05 m and extrude the surface
upwards for 0.03 m as shown below:
Repeat the same steps with the offset of 0.075 m and extrusion of 0.1 m.
Activate the front view and mirror two bottom elements through the center
of the top object.

9
With this step you have finished the modeling and you can store the object as
smart symbol in Allplan’s library. To store an object as smart symbol, open the
Library palette and select project Current project (in your case Allplan
→
Bridge Training) Content (if any other folder exists in the current project’s
→
library) and select New smart symbol.
In the Smart Symbol Definition window set the name of the smart symbol to
Bearing_L (remember that the name has to be the same as the smart
placement reference point) and then press Define new foil.


## Sayfa 11

10
You have to select objects which will be part of the smart symbol and the
reference point. Select all created elements with the selection rectangle and
select the center point of the bearing as reference point. Confirm smart
symbol definition with OK.
In order to use the smart symbol also for a second placement (reference point
Bearing_R), right click the created smart symbol, copy and paste it, and then
rename the copy to Bearing_R.

11
Anchor smart symbol
The tendon anchor will be created from the tendon smart part. Rename
drawing file 31 to Tendon Anchor and set it to current status, set all other
drawing files to not selected.
To create tendons with using tendon smart parts, you need to create the
tendon axis in the .re2 format. For creation of a tendon axis, you will use tools
under the Landscaping task in the Surroundings role. For our purposes you will

12
use a straight horizontal axis. To create the tendon axis, create a horizontal
line of the length 1 m. Use the Divide Element function to divide the line in
5 parts. Then select the Import, Export Point Pile function to export points
to the .re2 file. Set the settings for the export like shown in the picture below:
Confirm the settings with Apply, activate on element, and select the line. In
save as window set the name of the file to Axis.re2 and select file path to
store the file. Now you have exported 2D coordinates for the plan view of the
tendon axis, Now you have to repeat the process to create the profile. By
export select the file Axis.re2 and select to append the points.
Now you can activate the tendon smart part function . The Tendon function
can be accessed in the Engineering role in task Engineering Structures. You
can also add tendon function to the Bridge Construction role via the Actionbar
Configurator. Set parameters for Tendon as shown below and place the
tendon somewhere in the workspace.

13

14

15
Activate Front Left Isometric view, then select the Unlink Smart Symbol
function from the task User-defined Objects. Set the unlinking options as
shown below, confirm the settings with apply and select the tendon.
Delete all tendon elements to keep just the anchor pointing in positive x
direction.
Now you can repeat the steps from the previous chapter to store the anchor
as smart symbol to the library. Go to Library Project Allplan Bridge Training
→ →
Content (if any other folder exists). Create a new symbol, name it Anchor
→
and define a new foil selecting the anchor. Set the reference point in the
center of the anchor plate.

16
Updating the Allplan Bridge model
To automatically placing newly generated smart symbols as smart
placements, you have to update the Allplan Bridge data, which will update the
geometry of the bridge model and also automatically place smart symbols, if
their names match the names of reference points defining smart placements.
Go to “Open on a project specific basis” and activate the drawing files as
shown below:
Click close and update the Allplan Bridge Data in the Parametric Modeling task
to update the model.
The updated model with placed smart symbols will now look like on the
picture below:

17
Sections and 2D elements
In this chapter it is shown how to create cross sections and how to label them.
In the following chapters, you will use these functions to create additional
sections in order to model reinforcement.
Go to “Open on a project specific basis” and insert a new structural level
section with using a right click on Sections and assign the drawing files 1001-
1005.

18
Activate the drawing files as shown below and click close.
In the bridge construction role, Sections can be found in the Elements task.
Select the Create section function . Options for creating clipping path open in
create clipping path palette.
You will create three sections. One at the abutment, a second in the middle of
first span and a third above the pier.

19
In the Create clipping path window, check the Height of the elements, then
select two points to create a perpendicular clipping path to the superstructure
at the abutment.
Confirm the clipping path with the esc key and set the depth of 0.5 m and the
viewing direction in positive x axis. After that, the window Generate Section
palette opens automatically. Here you can set, what to include/exclude, and
the presentation of the cross sections.
Click Set for Formats and uncheck the display boundary lines in the clipping
lines tab, then click Close and place the section in the viewport. Repeat the
process to create all three sections as shown below.


## Sayfa 21

20
To create curved sections, you can use the Section along curve function . If
you don’t have the Section along curve function in any task of the bridge
construction role, you can add it using the Actionbar configurator or access it
in the engineering role under the engineering structures task.
To create a section along a curve you can select any 2D curve as axis. In order
to create a section along the full length of the bridge, you may click the control
points of the 2D axis, which was imported from Allplan Bridge, and prolong the
axis.
Now select the Section along curve function and set the parameters as
shown below:

21
Now click on 2D spline and define the viewing direction for the section, then
place the section in the viewport.
Using the Change Archit. Properties function you can assign multiple
surface elements to objects: Hatching, pattern, fill, bitmap area, and style area
(which is the only one which can dynamically change). Using this approach,
hatches or fills for cut elements are automatically created.

22
Select Reinforced concrete under Style Area. Click Apply and select all
concrete objects to assign the style area. Areas of sliced objects will now
automatically adapt according to selected drawing type.
To create dimension lines or for inserting texts, you can use the tools in the
label Task of the Actionbar. Select the dimension line function . Dimension
line options open, here you can set all formats with the properties and
direction of the dimension line.
The first input (click) is the position of the dimension line (the point the
dimension line is going through). Then select the points you want to annotate.
Finish with pressing the esc key. Repeat the process to create next
dimension line. In properties it is also possible to set the distance between
dimension lines and to set the position of the new dimension line with that
offset.
To use this approach, hover over the existing dimension line until the red
arrow showing the offset direction shows up, and then confirm with a mouse
click.

23
Using this approach, create dimension lines in different directions to annotate
all the created sections.
In the next step we will create the perpendicular cross-section of the
abutment. Select two points to create the longitudinal clipping path to the
superstructure at the abutment.

24
Confirm the clipping path with esc key and set the depth of 0.5 m and the
viewing direction in positive y axis. After that, you can set the presentation
options in Generate section palette and additional settings for displaying
sections.

25
To create dimension lines for this view we will use the standard Allplan
Wizards, You can find them in the pallets on the left side of the workplace.
Acquire the settings (properties) from the Desired sample by double-clicking the
right mouse button on the sample.

26
Note: In Assistants, you can also save the design standards and settings for
your company.
To create an Associated View of the abutment, choose the function Generate
View on the elements task pallet. After that, the function Generate view
pallet opens automatically. There you can set what to include or exclude.
Choose Front Left, Southwest Isometric viewing direction and the
presentation of the cross sections.

27
As a result, you will get such a set of views and sections on the main structure
of the bridge.

28
Reinforcement modeling in Allplan Engineering
In this chapter you will learn multiple approaches to model reinforcement. You
will model different bar shapes using the Bar Shape function , Circular
Reinforcement and use different placement options like Place Bar Shape ,
Special Placements , Sweep Bars Along Path and Enter Area
Reinforcement . You will also learn how to create labels, schemas, and bar
legends.
Pile cap reinforcement
To reinforce the pile cap, you need to create additional cross sections. Open a
project specific basis, rename the drawing file 1002 to reinforcement sections
and select the drawing files as shown below.
Create two sections with using the already known steps for creating sections,

29
as shown below:
For reinforcement modeling, you will use drawing file 200. Rename the
drawing file 200 to pile cap reinforcement and set the following activity of
drawing files:


## Sayfa 31

30
You will also need to use layers to easily hide the reinforcement in sections.
You can access layer settings with the Select set layers command, or with
using double right click in the workspace.
Open Select, Set Layers, then right click in the layer list under the Select
layer/visibility tab, and select the new layer. Set the parameters as shown
below and click OK to confirm the settings.
The layer you have just created will be used for the pile cap reinforcement.
Open Layers palette and set the BR_PCR (Pile cap reinforcement) as current.
First you will place stirrups. To define the bar shape, select the Bar Shape
function . The Properties of the function will open in the bar shape palette.

31
Select Stirrup, closed from the dropdown menu and set the parameters like
shown below.
In Input options you can activate “Expand to adapt to edges”, which detects
the geometry and automatically sets the bar shape. Hover near the pile cap
edge in section 2-2 to let the program detect the geometry, and confirm the
bar shape with click.

32
Press Esc to quit, then the Label Toll is automatically activated and options
are opened in the Bar Label palette, where you can set contents and style of
the label and leader.
Set the options like shown on the picture and place the label in the workspace.
When you place the label or skip it with the esc key, the Place Bar Shape
function is automatically activated and options are opened in the Place Bar
Shape palette. You can also set different input options.

33
Select Automatic placement . which automatically detects the geometry
and set the parameters in Place Bar Shape as shown below.
Press the Esc key twice to confirm the placement and finish the command.
Dimension line in the Label function is automatically activated and options
are opened in the bar label palette.

34
From the dropdown menu select Dimension line and place it in the workspace.
Palette is changed to Bar Label where you can again set the parameters for
the bar label and place it.
To modify the presentation of the placement select Modify placement in the
display mode function , select “show middle bar only” from the input options
and select any bar with bar mark 1.

35
Now you will create longitudinal bars of the pile cap. Select the Bar Shape
function and Straight Bar from dropdown. Set the other parameters as shown
below.
Uncheck “Expand to adapt to edges” in the input options and then select the
top left and bottom left corner of the pile cap to define the bar shape.

36
This time you will use the Segment option from input options to place bars
along the segment of stirrups. Set the parameters as shown below and then
click on the bottom segment of stirrup in section 2-2 in order to place bars
along that segment.

37
Select Show all bars in Input Options, and press the esc key twice to finish and
exit the command.
Dimension line, label function is activated automatically. Select Comb from the
dropdown menu and place the label in the workspace as shown below.
It is possible to move, mirror, copy etc. any bar with the functions from the
Edit task area.
Select the Copy and Mirror function and copy and mirror longitudinal bars to
the top of the pile cap.

38
Select the Place Bar Shape function to place longitudinal bars along the left
and right segment of stirrup.
Now you need to select which bar mark you want to place. You can do this
graphically, selecting any one of the longitudinal bars, or you can enter the
mark number in the dialog line and confirm with enter.
Select Segment in input options and place bars along the left segment of
stirrup using following settings:
Now copy and mirror the bars to another side of the pile cap.

39
In the last step of reinforcing the pile cap you will create open stirrups and
place them. Select the Bar Shape function and Open stirrup from the
dropdown menu. Set the parameters for the stirrups as shown below:
Check "Expand to adapt to edges” in the input options and place the bar shape
in section 1-1.
Select Automatic placement in the input options for placing the bar shape, and
set the following parameters for placing bars:


## Sayfa 41

40
Now finish the command, place labels, and exit all the functions.

41
Now you know all needed steps to create open stirrups in horizontal direction.
Repeat the steps to create additional horizontally oriented open stirrups. The
final result should look like shown below:

42
Pier reinforcement
In this chapter you will learn how to use the Sweep Bars Along Path
function, how to create a freeform bar shape and to create straight bars as
points.
Rename the drawing file 201 to “Pier reinforcement” and select the drawing
files as shown below.
In Layers palette set the layer BR_PCR to hidden. To define the pier
reinforcement, you need two new sections. One at the top and another at the
bottom of the pier.
This time, you will create a section based on the direction of the existing
section. Select the Create Section function , then select the bounding
rectangle of section 1-1, after that define the clipping path and the depth of the
cross section and place it.
The final result is shown below:

43
Create a new layer with parameters as shown below and set it as current
layer.
Select drawing files as shown to start modeling the pier reinforcement:

44
The pier will be reinforced with using stirrups with circular bend and with
straight bars. To define the circular part of the stirrups, you need to create 2D
construction lines. Those construction lines will be used as references for
definition of bar shapes.
Activate the construction line mode in the properties palette and create 2D
lines and circles using the line and circle function from the quick access task
area. Offset the construction 2D lines by 0.05 m, which represents your
concrete cover.
The result for section 3-3 should look like shown below:
Repeat the process to create construction lines in the cross section 4-4.
Select the Bar Shape function and select Freeform from dropdown. Enter
the parameters as shown below:

45
Uncheck Expand to adapt to edges (if it is checked) in the input options and
select Match edges. Then start picking points to define bar shape for the first
stirrup.
While defining the bar shape you can switch the concrete cover direction
using . Switch the concrete cover button in the input options. Confirm the
bar shape with the Esc key and set the initial and final segment to 1.0 m in the
Bar Shape palette.
Finish the command with the Esc key, place the label and skip Placing of bar
shape with the Esc key (make sure that Automatic placement is unchecked
when pressing esc).

46
Use the Copy and Mirror function to copy and mirror the stirrup to the
other side of the pier.
Use the Bar Shape function to create a straight bar with following
parameters:
Create a bar shape as shown below and then copy and mirror it to another
side of the pier. Skip Placing of bar shape with using the Esc key.

47
Now you need to define the longitudinal bars of the pier. You will define
straight bars as dots in section 1-1. Select the Bar Shape function and Straight
bar from the dropdown menu, then activate the options Straight bar as point
and place bar at start of fillet in input options.
Set the parameters for the bar shape as shown below:
Place the bar at the start of the straight bar (bar mark 5) as shown below.
Select the Copy function and click on Bar placed as point. Select the center
point of the bar as From point, then hover over the straight bar, so that you
activate the parallel line tracing.

48
Enter the following values to the command line and confirm with the enter
key:
To copy bars along a circular stirrup segment, select the Copy and Rotate
function . Select the top left bar placed as dot and the center point of the 2D
circular arc as base point of rotation.

49
In the command line, enter 7 for the quantity, 0.0 m in move along axis of
rotation and -15.0 degrees as rotation angle. The result should look like shown
below:
Use the Copy and Mirror function to mirror all the bars to the opposite edges
of the pier. The result for section 3-3 is shown below.
It is possible to mark the ends of bars with the Bar-End Marks function ,
which is especially useful for overlapping bars. Select the Bar-End Marks
function (you can also change the type of bar-end mark in input options) and
select all bars in section 3-3.


## Sayfa 51

50
Repeat all the steps to create transversal bars in section 4-4. To create bars
placed as dots in section 4-4, select the command Convert, Match elements
. Select any longitudinal bar in section 3-3, the point from which you want to
copy it, and place it in section 4-4.
Use the Copy , Copy and Rotate and Copy and Mirror functions to copy
bars (be careful to create the same number of longitudinal bars as in section
3-3).
The last step is to sweep bars along the pier geometry. Select the Sweep Bars
Along Path function .
Options open in the Sweep Bars Along Path palette, where you can set all
sweep parameters like spacing of transversal bars, overlaps, general sweep
parameters etc. With the selection rectangle select all bars in section 3-3,
then repeat the step to select all bars in section 4-4. Confirm the selection of
bars with the Esc - key, then set the parameters for sweep as shown below:

51
After you have set the parameters for sweep, activate Front Left Isometric
view and select all edges of pier as extrusion paths.
Confirm the selection with the Esc key. The reinforcement is placed along the
pier geometry and the result should look like shown below.

52
Now you can turn the Plan View back again, and label the bars in the cross
sections and modify their placement display.
Pile reinforcement
In the following chapter you will learn how to use special placements such as
Place in rotation, and how to create a spiral.
To model the reinforcement of piles, create a new section in the drawing file
1002 as shown below.

53
Now set the name of the drawing file 202 to “Pile reinforcement” and select
the drawing files as shown below.
Next, create a new layer as shown below and set it as current.
Layers BR_PR and BR_PCR should be set to hidden.
Select the Bar Shape function and pick Straight bar from the dropdown menu.
Set the following parameters in the Bar Shape palette:

54
Define the following shape with the option Expand to adapt to edges
unchecked, and with an offset of the bar end of 1.5 m above the bottom face
of the pile cap.

55
Place the bar label and skip Placing of bars. Now select the Special Placements
function and click the straight bar you have just created as element to be
placed, enter its mark number in the command line.
Select Place in Rotation in the Special Placements window and confirm with
OK.
In Input options, there are several options how to define placing an arc. You will
use the Circle option. Select the midpoint of the pile, where you have defined
the bar shape, then set the radius to 0.6 m or click the edge of the pile to
define the radius.
Set the starting angle to 0.0, confirm it with pressing Enter, and set Delta
angle to 360.0. The Special Placements window opens. There you can select
several alignment options and set the concrete cover. Select Align and set
other parameters as shown below, then confirm the settings with OK.

56
In the next window you can set several parameters for the selected special
placement, such as number of bars, delta angle or spacing of bars, placing
method etc. Set the parameters as shown below, then confirm with OK to
finish the placement of bars.
In the next step just place a bar label in the 2d presentation of section 5-5
above.
Now you will create a spiral reinforcement. To create a spiral, select the
Circular Reinforcement function , then select Spiral reinforcement from
dropdown in the Circular reinforcement palette. Set its parameters as shown
below:
The function Circular reinforcement works very similar to the Revolve
function, which you have used to create the coupler geometry. Three input
values are needed to create a spiral. The first is the axis of rotation, then the
outline (2D polygon line in the section), and finally the position.

57
Define the axis of rotation through the center of the pile in section 1-1 as
shown below.
To define the outline, select the bottom and top right points of the pile in the
section 1-1, then confirm with Esc. To define the position of the rotation axis,
select the midpoint of the pile to be reinforced. Then finish the command.
Because all piles a in your model are equal, you can use the Copy function to
copy the reinforcement to other piles. The final 3D model is shown below.

58
You can label all new bars with using the already known functions.
Abutment reinforcement
In this chapter you will learn some more reinforcement modeling options, such
as creating an area reinforcement and using the Place in Polygon function
from Special Placements.
Open a project-specific basis and rename the drawing files 101 to Footing
reinforcement and 1003 to Sections of abutment. Select the drawing files as
shown below.

59
Create two new cross sections of the abutment as shown below:
Note: Think about an appropriate list of layers and create them, or just use
predefined layers, to enhance and ease the organization and overview of the
project.
Then set the drawing file 101 as current and rename it as Footing
reinforcement. Select the function Enter Area Reinforcement to create bars
in the foundation of the abutment. In the Enter Area Reinforcement window
select Span Reinforcement . Now you can enter the polygon for the area
reinforcement.


## Sayfa 61

60
In the command line, enter -0.05 for the offset. Click the top left corner of the
abutment fundament, then click the bottom right corner and confirm with the
Esc key to create a rectangle. In the automatically opening Enter Area
Reinforcement window you can set concrete covers, layer depth and
component thickness. You can enter those values manually, but you can also
define them with picking points in sections. Set the parameters as shown
below:
Confirm the settings with OK. In next window, set the bar diameter to 16 mm
and the other parameters as shown below. Confirm the settings with OK.

61
The first step of Enter Area Reinforcement is automatically activated (If you
have quit the command, select Enter Area Reinforcement and Span
reinforcement again).
To create the next layer of reinforcement click Match in Input Options as the
next layer will have the same polygon as the previous. Click on the previous
placing polygon and confirm the settings twice with OK, as concrete cover for
next layer is set automatically according to previous layer and placing angle is
automatically set to 90°.
Repeat the steps to create reinforcement on top side of fundament.
Creating stirrups and bars along the fundament circumference is done with
using functions, wqhich you have learned in previous chapters.
The final result is shown below:

62
Now we start with defining the reinforcement of the wing walls.
Create two new sections in the drawing file 1003 as shown below and name
the drawing file 102 “Wingwall reinforcement”.
Set the drawing file 102 as currently active as this is the fileto be used for
modeling of reinforcement.
Select the Bar Shape function and the option Freeform bar from the
dropdown menu. Set the following parameters and define the bar shape in
section 4-4.

63
Use Input Options to correct the placement of the bar inside the section. In the
window settings you can easily correct the length of the initial and final
segment.
Choose the placement line for the bars in section 3-3 on the top edge of the
Wingwall. Set the following parameters for Linear placing bars:

64
In the next step you may add a Dimension line and Mark symbols of this
reinforcement placement.
With using the functions Freeform of Bar Shape and Linear placement we
will add one more position on the bottom edge of the wingwall with spacing
0.15m.

65
To create open stirrups along the bottom edge of the element we will add a
top view on the abutment in drawing file 1003, as shown below.
Then we set the drawing file 102 Wingwall reinforcement active again and use
Open stirrup form of the Bar Shape function to create a stirrup without
hook.

66
Note: use the Modify placement display mode function to change the
display of placements in views and sections, or the Reinforcement Tool to
hide reinforcement in separate views.
In the next step we use the Linear placement function and choose the
placement in section 3-3 along the wingwall bottom edge.
We select the Enter Area Reinforcement function as the fastest way to
reinforce spans of any shape. In the Enter Area reinforcement window we
select Span reinforcement . Now we can enter a polygon for area
reinforcement in section 3-3.
In the command line we enter -0.05 for defining an offset. Click now each
corner of the wing of the abutment and confirm with the Esc key. Set the
parameters as shown below and confirm the settings with OK.

67
Set in the next window the bar diameter to 14 mm and the other parameters
as shown below (direction angle 90°). Confirm the settings with OK.
Click Match in Input Options to create a further layer of reinforcement with
the same polygon. Click Previous placing polygon and confirm the settings
twice with OK, as the concrete cover for this layer is automatically set
according to the previous layer and the placing angle is automatically set to
0°.
Repeat the steps to create the reinforcement of the other side of the
Wingwall.
The final result is shown below:

68
The same workflow can also be used for all other bar shapes.
Till now you have learned many functions for reinforcement modeling. You
can continue using all the functions that you have learned, and fully reinforce
the abutment for practice.
Creating schemas and bar legends
In this last subchapter of reinforcement modeling you will learn how to create
schemas and bar legends.

69
Activate the drawing files as shown below:
Make sure that all layers you have used for pile cap reinforcement are set to
modifiable and turn off all other layers of reinforcement which are shown in
sections.
Schemas
You can use schemas to display bending shape management of bar mark. Full
schema includes all placements of selected bar mark and changing of schema
will automatically reflect any changes to placed reinforcement or bending
shapes. On the other side partial schema includes only placements of selected
mark placing. Partial schemas are automatically updated if any changes occur
to the placed reinforcement or bending shapes. Both schemas are created in
similar way.
To create a full schema, select the Full Schema function . Select Rebars from
Input Options, then you can enter a mark number in the command line or
select any placement of the whished bar mark. Select bar mark 3 and place
the full schema somewhere in viewport.
To create a partial schema, select the Partial Schema function and click on
one placement of bar mark 3, then place the schema somewhere in the
viewport.
You can notice the difference which was described previously. You can also
try to change the shape of the full schema using the Stretch Entities function
to see the effect of modifying the full schema.


## Sayfa 71

70
Bar legends
You can use this tool to create non-associative schedules as legends. These
legends are always derived from the selected drawing files or the NDW file
and placed in the current document. The program considers all drawing files
open in edit mode and all elements on modifiable layers. Legends can update
automatically (depending on the settings you make).
To create a bar legend, select the Reinforcing Bar Legend function . The
Legend Selection window opens, where you can select different Bar
schedules.
Select Bar schedule – bending shapes and make sure that the associative
legend of the active document is checked. Confirm with OK and place the
created legend somewhere in the viewport.

71
The created bar schedule includes all bars from the active drawing files. You
can activate other drawing files with reinforcement to see how the bar
schedule updates. To prevent updating of the bar schedule you can uncheck
the associative legend of the active document while creating the bar legend,
or click with the right mouse button on the existing bar legend and select
Ungroup.
With using the Reinforcement Reports function, bar legends can also be
created as reports . The creation of reports will be described in the following
chapter.

72
Creating layouts and reports
In this chapter you will learn how to create layouts and reports as final output
derived from the 3D model.
Creating file sets
For grouping drawing files to be found easier when creating layouts or
reports, it is convenient to create file sets. Open a project-specific basis and
select the Fileset structure tab.
Select the function Create Fileset . Then select fileset no. 1 in the new
window for creating filesets, and enter Abutment 1 in for the fileset name,
then confirm with OK.
Now you can assign drawing files to the newly created fileset with using a
right click, or with drag and drop from the table on the right side. Assign the
drawing files 100,101,102,1003.
Create another fileset named Pier 2 and assign the drawing files 15, 200, 201,
1002 to it.

73
Creating print sets
A print set is a set of layers wich you can select when compiling and arranging
layouts. However, print sets can also be used to control whether layers are
visible or hidden.
It is convenient to create print sets when you often require the same
combination of visible and hidden layers in the modeling process.
To create such print sets, open Select, Set Layers and select the Print Set tab.
Now click the Define, modify print set button, which opens the Print Set
Manager window. Here you can define new print sets. Click the New print set
button and enter the name and group to define the new print sets as shown
below:
Newly created print sets can be selected in the list box and the opened under
Print set in the dropdown menu. For each print set the status of layers can be

74
set to visible or hidden. Set appropriate visibility of layers for each print set
and confirm with ok.
Creating reports
It is possible to create reports in two ways. The frst option is to select the
Reports function from the Actionbar .This function opens the file explorer,
where you can select a report template, which you would like to use. After
having selected the template, you can select in the viewport the elements you
want to include in the report.
The other option is to create reports in the building structure. In this case you
open a project specific basis and insert new report structural level under
Reports.
Using a right click you can access the settings for the inserted report.

75
It is possible to define source drawing files for the report, i.e., drawing files to
be considered when creating reports. Other options are selecting layers which
can be also selected for print sets, selecting a report template, the type of
output and the output path, etc. With the right click you can also generate a
report which is created as a file on the path you have set in Select report and
settings. When creating multiple reports, it is also possible to create batch
reports with right clicking on Reports.
In this example select Rename and rename the report to Bar bending schedule
– pile cap. Now, select Source drawing files for report with using a right click. In
the popped up drawing files window you can choose to pick drawing files from
Fileset structure, Building structure or Derived from building structure. Select
Fileset structure and check all drawing files under the Pier 2 file set.
To set the report template and the output file type, click with the right mouse
button on Report and Select report and settings. Set the parameters as
shown below or choose another output file type.

76
Now you can generate a report with a right click on Report and selecting
“Generate report”.
To practice, you may create more reports on your own and test other options
for report creation.

77
Creating layouts
To create layouts, select the Layout editor task in the Actionbar. It is also
possible to access the layout editor from the menu bar. When you have
selected the layout editor, the list of layouts opens in the viewport.
With Open on a project-specific basis you can access the layouts and
structure them by using structural levels. Name the first layout asFormwork
of bridge elements.
You can set the page size, margins and other properties such as title block and
background with the Set-Up Page function , which opens the Set Up Page
palette. Choose parameters of the page as you see on screenshots below.

78
We will add the layout border with using the separate function and
choosing the required parameters.

79
To insert the content, select the Layout Element function . The Layout
Element window opens, where you can select the drawing files that you want
to insert, the scale, the font factor, the print set, the drawing type etc.
It is possible to use Building Structure to select drawing files from building
structure, Fileset to select drawing files from the fileset or Drawing File
to select drawing files from the list of all used drawing files. When you have
selected all drawing files and set the parameters, you can place the content to
the layout.
To show only a limited area of inserted drawing files you can use the Layout
Window tool .
Select two points to create a perpendicular clipping path with the needed
elements in the already placed layout.


## Sayfa 81

80
Repeat the operation as many times as necessary to completely fill the layout
page. Move the layout windows to the page.
When you have finished the layouts you can plot them directly from Allplan or
export them to several possible formats.
For more information, please refer to the online help or the step by step
tutorials available on Allplan Connect.

81
Tendon layout
In this chapter we show how to complete the tendon layout. At first open a
project specific basis. Activate drawing files, assign drawing file 1004 and
rename it as shown below.
In our project there are 4 different tendon phases. We will assign a different
color to each phase. Оn the Objects tab, we select the Sort type by drawing
file and set the DF11-Phase 1 active.
In the next step we switch to the Properties tab and change the color of
Tendon General 3D Objects.

82
Assign colors to the remaining phases of tendons in a similar way. As a result,
you will get an analogical display in the Animation view.
Now we are ready to create the needed views and sections. Choose the
function Generate View on the elements task palette. Then choose Front
Left, Southwest Isometric viewing direction and the presentation with

83
Surface elements with fills from colours and consider transparency as shown
below.
In the next step we will the add side view for each tendon phase. We generate
the view choosing drawing file 11 with Phase 1 and we select one tendon with
anchors.

84
Create similar views for the remaining 3 tendon phases.
Let's create an additional view of the junction of two tendons in different
phases. Use the Create section function and select Isometric view as the
source for the new section. Choose 1st and 2nd points of the clipping path, press
Esc, and choose the Top viewing direction for the section.

85
Select Additional settings, choose the necessary drawing files, change the
Resizing factors to 10 and place the resulting cross-section as shown below.

86
With a right click on the element you may add a label for the anchor.
Select attributes and properties for the Associative label as shown below.

87
Attach a Test Leader to the created label and add one more label for the
coupler.
To create cross-sections along the road axis, we will use the Python Part
StreetSectionsInDifferentDrawingFile. It was created for automatic cross-
section generation along a polyline. So, after choosing this Python Part from
the library, the first step will be the creation of a polyline close to the Road
Axis. Select Settings for cross-section definition in the Properties window.
Press the Run button and the sections will be created automatically.

88
As result you will have a set of cross-section drawings. You can supplement
the drawings with the necessary dimension lines and form a Layout, as
described earlier in this document.

89

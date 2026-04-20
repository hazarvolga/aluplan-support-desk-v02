# TUT [Eng] SCIA25.0 - Tutorial Steel Frame AISC

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA25.0 - Tutorial Steel Frame AISC-gq29gfb6ixc.pdf`

---

**Toplam Sayfa:** 63


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
STEEL FRAME AISC

| \ SCIA ENGINEER
TUTORIAL
STEEL FRAME AISC |
| --- |
|  |


Tutorial – Steel Frame
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2025 SCIA nv. All rights reserved.
2 BV – 2025/01/06

Table of contents
Table of Contents
Table of Contents .................................................................................................................................................... 3
General information ................................................................................................................................................ 5
Welcome ............................................................................................................................................................. 5
SCIA Engineer support ......................................................................................................................................... 5
Website ............................................................................................................................................................... 5
Introduction ............................................................................................................................................................ 6
Chapter 1: Getting started ............................................................................................................................. 7
Starting SCIA Engineer .............................................................................................................................. 7
Starting a new project .............................................................................................................................. 7
Chapter 2: Project management .................................................................................................................... 9
Save, Save as, Close and Open ................................................................................................................. 9
Saving a project ................................................................................................................................... 9
Closing a project .................................................................................................................................. 9
Opening a project ................................................................................................................................ 9
Start project manager ......................................................................................................................... 9
Components of the User Interface ......................................................................................................... 10
Main menu .........................................................................................................................................10
SCIA Spotlight ....................................................................................................................................10
Status Bar ...........................................................................................................................................10
Process Toolbar .................................................................................................................................11
View Bar .............................................................................................................................................11
Properties Panel ................................................................................................................................12
Input Panel .........................................................................................................................................12
Marking menu ...................................................................................................................................13
Chapter 3: Geometry input .......................................................................................................................... 14
Input of the geometry ............................................................................................................................ 14
Cross-sections ....................................................................................................................................14
Geometry ...........................................................................................................................................16
Additional data ..................................................................................................................................24
Check structure .................................................................................................................................31
Graphic representation of the structure ..........................................................................................32
Chapter 4: Loads and combinations ............................................................................................................ 34
Load cases and load groups ................................................................................................................... 34
Load panels ............................................................................................................................................ 36
Loads ...................................................................................................................................................... 37
BV – 2025/01/06 3

Tutorial – Steel Frame
Combinations ......................................................................................................................................... 41
Chapter 5: Analysis ...................................................................................................................................... 42
Linear analysis ........................................................................................................................................ 42
Chapter 6: Results ........................................................................................................................................ 44
Reactions ................................................................................................................................................ 44
Internal forces ........................................................................................................................................ 45
3D deformations .................................................................................................................................... 47
Results-related status bar options ......................................................................................................... 48
Chapter 7: Code checks ............................................................................................................................... 49
Buckling parameters .............................................................................................................................. 49
Steel checks............................................................................................................................................ 51
Strength check ...................................................................................................................................51
Serviceability check ...........................................................................................................................54
Chapter 8: Steel connections ....................................................................................................................... 55
Structural model .................................................................................................................................... 55
Steel connection .................................................................................................................................... 56
Chapter 9: Report ........................................................................................................................................ 59
Engineering report ................................................................................................................................. 59
Adding images to the report .............................................................................................................60
Displaying results ...............................................................................................................................62
Printing or exporting the report .......................................................................................................63
4 BV – 2025/01/06

General information
General information
Welcome
Welcome to the SCIA Engineer Tutorial – Steel Frame. SCIA Engineer is an integrated, multi-material structural analysis
and design software for all kinds of structures. Its wide range of functionality makes it deployable for any construction
type: design office buildings, industrial plants, bridges, or any other project, all within the same easy-to-use environment.
The program treats the calculation of 2D/3D frameworks, design and check of reinforcement included.
Besides frames, it is also possible to dimension plate structures, inclusive of advanced concrete calculations.
The complete process of calculation and design has been integrated in one program: input of the geometry, input of the
calculation model (loads, supports ...), linear and non-linear calculation, output of results, reinforcement design and
checks according to various codes, generating the calculation report, etc.
System requirements to run SCIA Engineer 24:
https://www.scia.net/en/support/faq/scia-engineer/installation/system-requirements
SCIA Engineer is available in two different versions:
• Licence version
The licence version of SCIA Engineer is secured with a Cloud account. For more information: https://eu-1.cdn77-
storage.com/scia-supportstore/support/sciaengineer/installation/24/MAN%20%5BEng%5D%20SCIA24.0%20-
%20Installation%20manual%20cloud.pdf
SCIA Engineer is modular and consists of various modules. The user chooses from the available modules and
composes a custom design program, perfectly tuned to his needs.
In the general product overview of SCIA Engineer you will find an overview of the different modules or module
editions that are available.
A Cloud licence is also available for “Try-out”, which only limitation is in the output.
• Student version
The student version has the same possibilities as the licence version for all of modules. This version is also
secured by a Cloud protection.
The output contains a watermark “Student version”. Projects that are stored in the student version cannot be
opened in the licence version.
SCIA Engineer support
You can contact the SCIA Engineer support service
• By e-mail
Send an e-mail to support@scia.net with a description of the problem and the concerning *.esa file and
mention the number of the version you are currently working with.
• By telephone
For various phone numbers to different offices visit our page https://www.scia.net/en/contact/offices The
contact by telephone is available only for users with Licence version or Try-out version
Website
Link to Link to Manuals and Tutorials: https://www.scia.net/en/support/tutorials-manuals
Link to Web help: https://help.scia.net/
BV – 2025/01/06 5

Tutorial – Steel Frame
Introduction
This tutorial describes the basic functions of SCIA Engineer for the input, analysis and design of a 3D steel frame.
Before you start, you must be familiar with your operating system: for instance working with dialogues, menu bars,
toolbars, status bars, handling the mouse, etc.
First, we will explain how to create a new project and how to setup your structure. After the geometry and load input,
the structure will be calculated and the results can be viewed.
Next, we will discuss the input of the buckling parameters and we will perform the steel check, the profile optimization
and create a steel connection.
The tutorial ends with a brief introduction to the engineering report.
The figure below shows the calculation model of the structure that we will design.
6 BV – 2025/01/06

Chapter 1 – Getting started
Chapter 1: Getting started
Starting SCIA Engineer
Before you can start a project, you need to start the program first.
• double-click on the SCIA Engineer shortcut in the Windows Desktop, or
• if the shortcut is not installed, click the Windows start button and choose SCIA Engineer 25.0 > SCIA Engineer
25.0.
If the program doesn’t find any protection, you will see a dialogue indicating that no protection was found. You can run
the Protection setup to login with your cloud licence credentials.
Starting a new project
When the Project manager dialogue appears, click New project.
You can also start new project via Main menu > File > New or with the default hotkey combination Ctrl+N.
BV – 2025/01/06 7

Tutorial – Steel Frame
Now, the Project settings dialogue is opened. On the Basic data tab, you can enter general data about the project.
In the Data frame, enter your preferred data. These data can be mentioned on the output (for example in the report
and on drawings).
Set Structure: Frame XYZ (to limit input possibilities to 1D members in 3D plane only) or General XYZ.
In the Material frame, tick the Steel checkbox (defining a material is the only required setting to proceed). Choose S 235
from the combo-box.
In the Code frame select National Code IBC.
Confirm your input with [OK] button.
Note: on the Functionality tab, you choose the options you need. The non-selected functionalities will be filtered from the
menus, thus simplifying the program.
8 BV – 2025/01/06

Chapter 2 – Project management
Chapter 2: Project management
Save, Save as, Close and Open
Before entering the construction, we first discuss how to save a project, how to open an existing project and how to
close a project. When running a project of this tutorial, the project can be saved at any time. That way you can leave
the program at any time and resume the project from there afterwards.
Saving a project
Go to Main menu > File > Save or press Ctrl+S.
If a project has not yet been saved, the dialog box Save as appears. Choose the drive you want to save your project in.
Select the (sub)folder in which you want to put the project. Enter the file name in File name and click on [Save] to save
the project.
If you choose File > Save as in the main menu, you can select the drive and (sub)folder and set a name for the project
file.
Note: the Autosave function creates a backup file every 15 minutes by default. These projects can be found in folder
C:\Users\*username*\Documents\ESA24.0\Autosave\
Closing a project
To close a project, choose Main menu > File > Close Project, press Ctrl+F4 or click the X button above the SCIA Spotlight
in the top-middle of the application.
A dialogue box appears asking if you really want to save the project. Depending on your choice, the project is saved and
the active dialogue is closed.
Opening a project
Click Main menu > File > Open or press Ctrl+O to open an existing project.
A list with projects appears. Select the desired project and click [OK] (or double-click on the project to open it).
Start project manager
Click on Main menu > File > Project browser to open the project manager. Here the recently closed project can be
found, as well as sample projects.
BV – 2025/01/06 9

Tutorial – Steel Frame
Components of the User Interface
Main menu
The Main menu is the component that will guide you
through all the parameters of the project. The main features
are:
• It contains functions, results & checks
• Commands shown with hotkeys
• Single letter hotkeys are allowed
• You can populate the Process toolbar by
commands from the main menu – simply drag it
SCIA Spotlight
The SCIA Spolight is the command line of the
interface, and it has the following features:
• Autofill function
• Hotkey “Space” to set focus
• Insert coordinates or lengths (while using
guiding lines)
• Fulltext search, results listed in order of
priority
• Shows icons and hotkeys, same as in the
menu
• “Show me” function to show position of
commands in menu
• Go to webhelp option
• Drag searched command to populate the
Process toolbar
Status Bar
The Status bar allows the settings and toggles of most often used options
• Select the active load case
• Snapping and UCS settings
• Result lock, Grid lock and Autorefresh
• Codes and annexes management
10 BV – 2025/01/06


## Sayfa 11

Chapter 2 – Project management
Process Toolbar
The Process toolbar bar has following features:
• Fully customizable panels
• Available up to 8 opened workstations selectable by you based on your project
• Have up to 2 separate toolbars open
• Additional subpanels (“stacks”) may be used to save space
• Interact with the toolbars simply by drag and drop. Drag in commands from menu, SCIA Spotlight or status bar.
View Bar
The View bar has following features:
• View Management
o Navicube
o View toolbar
• Management of View parameters
o Rendering and volumes toggle
o Draw additional data as Supports
and Loads, Labels of nodes and
elements, …
o Additional settings available on
hover (pick visible Load cases)
o Access all the settings for all entity
type
BV – 2025/01/06 11

Tutorial – Steel Frame
Properties Panel
The Properties panel has following features:
• Show associated data of the objects (show hinges
when beam is selected)
• Contain all properties, illustrations, action buttons
• Possibility to use simplified view on the most
important properties
• Manipulate with the selection (right click):
o Add elements that share some properties
into the selection
o Isolate elements base on a property they
share or based on entity type
o Remove some elements from selection
Input Panel
The Input panels contains:
• Tools to create anything
o Everything what may be inputted is here
o Sorted in Workstations: Structure, Load,
Dynamics,..
• Filters by Categories or tags
o Possibility to have one workstation or
multiple at the same time
o Tags are new concept to filter based on
context of the project
o Work with all tools or only with the most
common ones
• Dual mode of display
o Mode with names and hotkeys (consistent
look and feel with the Menu)
o Icon only mode
12 BV – 2025/01/06

Chapter 2 – Project management
Marking menu
The Marking Menu is an invisible menu which you can call for at any location by
holding ALT and clicking on the right mouse button.
By hoovering over the 4 submenus you can access SCIA’s most basic functions:
• Model:
o 1D member
o Column
o Plate
o Panel with load to 1D & edges
o Hinge on 1D
o Support in node
• Modify:
o Move
o Copy
o Multicopy
o Break in defined points
o Connect members/nodes
o Disconnect members/nodes
• Load:
o Point load in node
o Point load on 1D
o Line load on 1D
o Line load on 2D edge
o Surface load on 2D
o Free surface load
• Visibility:
o Hide selected
o Hide unselected
o Make layers visible
BV – 2025/01/06 13

Tutorial – Steel Frame
Chapter 3: Geometry input
Input of the geometry
If you start a new project, the geometry of the structure must be entered. The structure can be entered directly, but
you can also use for instance templates with parametric blocks, DXF files, DWG files and other formats.
Cross-sections
When entering one or more 1D members, a cross-section is immediately assigned to each member. By default, the
active cross-section is represented. You can open the profile library to activate another cross-section. If you want to add
a member before a cross-section has been defined, cross-section IPE240 will be used automatically.
Adding a cross-section
Go to Main menu > Libraries > Cross sections (or with the icon in the workstation Structure).
The cross-sections manager is opened. If no cross-sections have been entered in the project yet, the New cross-section
window will be automatically opened.
Click Profile library in the group Available groups.
In the Available items of this group, you can choose for an I profile. Choose W8X13 from the list.
Click [Add] or the arrow-button to add the cross-section to the project.
14 BV – 2025/01/06

Chapter 3 – Geometry input
The Cross-section window appears.
Click [OK] to confirm, the cross-section is now added to the cross-section list in your project. Add W6X12 and HP8X36 in
a similar way.
In the Available items for this group, you can choose an angle section (just below the I profile group). Choose L3X3X1/4
from the list.
Click [Add] or to add the profile to the project. Click [OK] to confirm.
Click [Close] in the New cross-section window, the Cross-Sections manager appears.
Click [Close] to close the Cross-Sections manager and to return to the graphical scene.
BV – 2025/01/06 15

Tutorial – Steel Frame
Geometry
In the Input panel we can select the workstation Structure to choose from different structural element types to enter
the structure.
To model the structure, you must enter the first frame. Then, this frame will be copied and the wind bracings and the
horizontal beams will be added.
Catalogue blocks
You can use single columns and beams to enter the frame., but SCIA Engineer offers as well multiple Catalogue blocks,
allowing for a smooth and simple input of the structure.
To enter a new frame, use the option Catalogue Blocks in the category Import & Blocks of the workstation Structure.
The Block selection manager is opened. Under Available groups choose the first option Frame 2D. In the Available items
of this group you can choose the first shape, Frame.
Confirm your choice with [OK].
16 BV – 2025/01/06

Chapter 3 – Geometry input
The Geometry block window appears. Now, enter the frame dimensions: L = 39,37 ft, H1 = 16,404 ft and
H2 = 3,281 m. In the combo-box with cross-section selector choose W8X13 for the Column and for the Beam.
Confirm your input with [OK].
The Catalogue block manager appears.
Click [OK] to return to the graphical scene. The frame is now graphically represented by thin blue lines attached to
mouse cursor. You are now asked to select an insertion point.
The frame is positioned with the left column in the origin of the coordinate system. Type the coordinates 0;0 (with
semicolon) or 0 0 (with space) in the SCIA Spotlight and press <Enter> to confirm your input.
Finish the input with the <Esc> key.
BV – 2025/01/06 17

Tutorial – Steel Frame
Notes:
• The properties of selected elements are shown and can be modified in the Property panel on the right-hand side
of the user interface.
• With zoom all (Main menu > View > Zoom > Zoom all), or double-click with the mouse wheel, you can visualize
the entire structure.
• The use of , (comma) or . (point) to work with decimals depends on the regional settings of Windows.
• You can use the @-symbol to work with relative coordinates.
Multicopy
After input of the first frame, it can be copied to obtain the other frames easily. As you need two copies, you can use
the Multicopy function.
First select all (already modelled) entities to be copied. As you must copy all members, you can use the select all (Main
menu > Tools > Selections > Select all) function.
This way all members and nodes are selected; this is represented by dashed violet lines:
Now, you can select the Multicopy command via Main menu > Edit > Modify > Multicopy or with the icon in the
workstation Structure. In the Number of copies field enter 2. To manually set the distance between the frames,
deactivate the Define distance by cursor option. Now, you can enter the distance 6 m in direction Y.
Click [OK] to confirm your input. New frames are modelled.
18 BV – 2025/01/06

Chapter 3 – Geometry input
Press <Esc> to cancel the selection.
Note: it’s possible to connect the frames automatically with beams with the multicopy command. Therefore use the
option Connect selected nodes with new beams. After confirming with [OK] the software will ask you for the cross-
section for the new beams. When you use this option for your structure, you don’t need to select the lower nodes of the
columns in this case.
Snapping
Connecting beams of the frames can be added after the frames are modelled. The start and end nodes of the beams
are already known, i.e. begin and end nodes of the entered members. Therefore you do not have to enter the beams by
means of coordinates; instead of that you can use snapping.
You can find Snapping in the Status bar. You can activate the options Endpoints / Nodes and Midpoints / Centers.
BV – 2025/01/06 19

Tutorial – Steel Frame
Entering a beam
To enter a new beam, use the Beam command in the category 1D Members of the workstation Structure.
In the cross-section field, choose the third cross-section, CS3 - IPE160.
For the structure type Frame XYZ or General XYZ there are two horizontal axes (i.e. X and Y), so you must indicate the
right direction for the horizontal beam in the Direct field. Choose axis Y.
The beam length is 6 m.
The insertion point is (as default) set to begin so that the left point determines the position of the beam.
Confirm your input with [OK].
20 BV – 2025/01/06


## Sayfa 21

Chapter 3 – Geometry input
Now, you can enter the beams by clicking with your mouse on the top node of the left-hand side column of the first
frame and similar node on the middle frame:
Enter the other beams of the roof in a similar way, always by clicking the top nodes of columns or inclined beams. Add a
beam as well at half of the height of the first right span.
Press <Esc> to finish the input.
Press <Esc> once more to cancel the selection.
BV – 2025/01/06 21

Tutorial – Steel Frame
Entering diagonals
To enter a new diagonal or bracing, use the 1D member command in the category 1D Members of the workstation
Structure (or via the marking menu).
In the Type field, choose Wall Bracing (0). This specification is considered for the structural model only and does not
influence the analytical model or the results.
In the Cross-section field, choose the fourth section, CS4 – L3X3X1/4. Note that no length or direction is requested this
time, as you will define the geometry afterwards.
Confirm your input with [OK].
Now, the bracings can be entered between the second and third frame. Click on the start and end nodes of the columns
to draw a diagonal.
Repeat selecting start nodes and end nodes to model both bracings at the right side.
Press <Esc> to finish the input.
Press <Esc> once more to finish the selection.
22 BV – 2025/01/06

Chapter 3 – Geometry input
Copy
We will copy the diagonals from the right side of the structure to the left side of the structure.
First select the entities to be copied. You can select both diagonals with the left mouse button of by dragging a square
from right to left with the left mouse button. A violet colour indicates that the diagonals have been selected. Properties
of the selected members are shown in the property panel.
Click with the right mouse button anywhere in the graphical scene. The appearing context menu lists the available
possibilities for the selected entities.
In this menu, choose the option Copy.
Note: instead you can also use Ctrl+C as hotkey or you can access the copy command via Main menu > Edit > Modify or
as icon the in the workstation Structure of the process toolbar.
Now the program asks the start point of the copy. Click with the left mouse button on the bottom node of the column
of the middle frame at the right side. Then you must enter the end point, i.e. the position where the starting point
should be copied. Now you can select the bottom node of the column of the middle frame at the left side.
When the members are copied, the command remains active until you press <Esc>, so that you can copy as well to
other positions if needed.
Press <Esc> to finish the input.
Press <Esc> once more to cancel the selection.
BV – 2025/01/06 23

Tutorial – Steel Frame
Additional data
The structure is completely set up. Now, you can finish the geometry input by adding end conditions, i.e. enter
haunches, hinges and supports.
Haunches
In SCIA Engineer every member is regarded as prismatic, with a constant cross-section, until a haunch is entered.
Haunches are entered on the roof beams in this project, at the column sides. A haunch is defined by the following
parameters:
• a cross-section with variable height;
• a length, over which the variable height must vary up to 0.
To enter a new haunch, use Haunch on 1D command in the category 1D Members of the workstation Structure.
As indicated, a haunch requires a cross-section with a possibility to create variable dimension(s). Since this project does
not contain any variable profiles yet, the New cross-section window automatically appears.
Select in Available groups the Haunch group.
In Available items of this group, choose a I + I var cross-section.
Click [Add] or on the arrow-button to add the cross-section to the project.
24 BV – 2025/01/06

Chapter 3 – Geometry input
Now the cross-section window appears. Here, the properties of the variable cross-section can be changed.
In the I section field, change the section in a W8X13 by clicking the button behind the section type.
Confirm your input with [OK] and use button [Close] to close the New cross-section dialogue.
The cross-section manager appears; click [OK] to close this window as well.
Now, the Haunch on beam window is opened.
In the Position field, choose Begin to position the haunch at the start node of the member.
In the Coord. definition field, choose the option Abso to indicate that the length, over which the variable height must
vary, can be entered in absolute units, i.e. in meter.
When the coordinate definition is adapted, the length of the haunch can be entered in the Length x [m] field. For this
project, enter length 3.5 ft.
Confirm your input with [OK].
Now, the program asks to indicate the members on which a haunch must be entered. Select the 6 roof beams with the
left mouse button:
BV – 2025/01/06 25

Tutorial – Steel Frame
Press <Esc> to finish the input.
Press <Esc> once more to cancel the selection.
To visualize the haunches, you need to click the following buttons in the view bar:
• Volumes to show the surfaces of the sections;
• Shading to obtain a rendered view of the members.
Note: a haunch overwrites specification of the original cross-section. For this project, this specifically means that the
cross-section of the roof beam is replaced by the I + I var cross-section. If the haunch is removed, the I + I var cross-
section will be maintained instead of the I-section of the roof beam.
26 BV – 2025/01/06

Chapter 3 – Geometry input
Hinges
In SCIA Engineer, every node where two or more members connect is regarded as fixed, until a hinge is entered and
some translations and/or rotations are released.
In this project, the diagonals should be connected with the other members in a hinged way. Therefore, you must enter
hinges manually.
To enter hinges, use the Hinge on 1D command in the category 1D Members of the workstation Structure (or via the
marking menu).
The hinges are put to both ends of the diagonals; therefore choose Both for the Position when dialogue Hinge on beam
pops-up.
To obtain a hinge, the rotations fiy and fiz are set to Free, the translations and the rotation fix remain Rigid.
Confirm your input with [OK].
The hinges are added when you click the diagonals with the left mouse button.
Press <Esc> to finish the input.
Press <Esc> once more to finish the selection.
BV – 2025/01/06 27

Tutorial – Steel Frame
Notes:
• Instead of adding hinges to the diagonals, you can set the property FEM type to axial force only in the property
panel. Pay attention to not combine hinges with this property, since this could lead to issues for the solver when
calculating the model.
• Hinges are always defined with regard to the local coordinate system of a member.
• Increase Scale add data in the Status bar if you feel that the hinge symbol is too small.
Supports
The geometry input can be completed with supports. The column bases are modelled with hinges.
Before adding the supports, you first can select the nodes to position the supports. You can select these nodes
manually, one by one, but SCIA Engineer offers a simple method to select multiple entities based on a common
property.
To select all column bases, select one of the bottom nodes, by drawing a frame from the left to the right with the
mouse cursor.
28 BV – 2025/01/06

Chapter 3 – Geometry input
The property panel shows the properties of this node. Now, choose the property to be used for the selection of the
entities. For this project, you want to select all bottom nodes. The common property of these nodes is their coordinate
in global Z direction.
Click with the right mouse button on the Z [m] property to select the appropriate row and choose the Expand selection
option.
The program will search all entities with the same property. In this example, the program will select all nodes, for which
the Z [m] property corresponds to 0 ft.
The column bases are selected. Now, supports can be added to these nodes.
To enter supports, use the Support in node command in the category 1D Members of the workstation Structure (or via
the marking menu).
BV – 2025/01/06 29

Tutorial – Steel Frame
You can easily define all 6 end conditions at once by choosing the Constraint as Hinged, so that all translations are Rigid
and all rotations are Free.
Confirm your input with [OK]. The supports are automatically attributed to the selected nodes.
Press <Esc> to finish the selection.
Notes:
• If you draw the selection box from the left-hand side to the right-hand side with the mouse cursor, only entities
which are completely inside will be selected. If you draw the rectangle from the right-hand side to the left-hand
side, the entities which are completely in the rectangle as well as the entities that intersect with the rectangle
will be selected.
• The input panel includes a number of predefined supports via the tag Quick input. For this project, you could
have used the Hinged support in node icon.
• Similar to the selection of supports, you could have used the Expand selection option to select all diagonals,
when the hinges had to be entered. The determinant property here would have been the cross-section.
30 BV – 2025/01/06


## Sayfa 31

Chapter 3 – Geometry input
Check structure
After input of the geometry, the input can be checked for errors by means of the option Check structure. With this tool,
the geometry is checked for duplicate nodes, zero beams, duplicate members, wrong references of hinges or supports
etc. However, this tool does not check if the structure is correctly supported or if it is a mechanism.
You can find the command Check structure as icon in the workstation Structure of the process toolbar or via Main
menu > Tools > Check structure.
In the Check of structure data dialogue the different available checks are listed. Click [Check] to perform the checks.
The Data check report window appears, indicating that no problems were found.
Close the check by clicking [OK].
In case of any problem SCIA Engineer tries to automatically correct the structure data (delete duplicated entities,
correct wrong reference, etc.).
BV – 2025/01/06 31

Tutorial – Steel Frame
Graphic representation of the structure
Within SCIA Engineer there are several possibilities to edit the graphic representation of the construction. Below you
will find the most important options:
• edit the view point of the model;
• use Zoom commands;
• edit view parameters.
You can set the view point with the Navicube.
You can rotate/tumble, pan, zoom, set the view in the direction of one of the global axes,… All possibilities are shown
on following help-page: https://help.scia.net/20.0/en/#rb/basictools/adjusting_the_view.htm
Notes:
• If the structure is being turned while a node is selected, the structure will turn around the selected node.
• You can also easily zoom in and zoom out with the mouse wheel. The mouse wheel can be used to move the
model in case you press it and hold. Double-click of the wheel zooms the structure so that it can be seen
completely (the whole graphical scene is filled by the structure).
Several zoom commands are available via Main menu > View > Zoom
Note: Zoom to selection is only available in case that you have made a selection in the model.
32 BV – 2025/01/06

Chapter 3 – Geometry input
You can use the view bar to show/hide volumes, shading, supports, loads, model data, labels of nodes, labels of
members,...
Via More options you can choose for More view settings in order to access all view parameters. You can access this
dialogue as well via right-clicking in the graphical scene and choosing for View settings for all entities or View settings
for selected entities (if an entity or multiple entities are selected you can change view settings for only that selection).
Through the tab Structure the representation of the different entities can be adapted
• Style and colour: you can display the colour per layer, material, cross-section, structural type or design group.
• Draw cross-section: with this option checked the symbol of the cross-section is displayed on every 1D member.
• Local axes: with this option the local axes of the elements are activated.
Through the tab Labels, the labels of different entities can be displayed. In the group Beam labels the following items
can be displayed in the label:
• Name: show the name of the member in the label (e.g. B1)
• Cross-section name: show the name of the cross-section in the label (e.g. CS1)
• Cross-section type: show the cross-section type in the label (e.g. HEA200).
• Length: show the length of the member in the label (e.g. 5.000 m).
BV – 2025/01/06 33

Tutorial – Steel Frame
Chapter 4: Loads and combinations
Load cases and load groups
Each load is attributed to a load case. One load case can contain different load types like line loads, surface loads, … To
each load case, properties are attributed which are determinant for the generation of combinations. The action type of
a load case can be permanent or variable.
Each load case is associated with a load group. The load group contains information about the category of the load
(service load, wind, snow…) and its appearance (default, together, exclusive). In an exclusive load group, the different
load cases attributed to this load group cannot act together in a single combination when using envelope combinations
or code combinations.
We recommend that you thoroughly read the chapter about loads and combinations in the reference manual or on our
help pages.
Three load cases are entered in this project:
• LC1: Permanent load case Self weight;
• LC2: permanent load case Roof dead load;
• LC2: variable load case: Wind load (side wind on the frames).
You can find the command Load cases as icon in the workstation Loads of the process toolbar, via the hotkey Ctrl+L or
via Main menu > Libraries > Load cases, combinations > Load cases.
Before you can define loads, you must enter load cases first. Since this project does not contain any load cases yet, the
Load Cases manager will automatically appear and by default, the load case LC1 is automatically created. This load is a
permanent load of the Self weight load type. The self weight of the structure is automatically calculated, although not
graphically displayed.
We will create a second permanent load case for the roof weight. Click on [New] and change the Description to Other
permanent loads. The Load type is now set to Standard.
34 BV – 2025/01/06

Chapter 4 – Loads and combinations
Now we will create a variable load case. Click on [New], change the Description to Wind and change the Action type to
Variable.
The load group LG2 is automatically created. Click on the three dots […] to display properties of the load group.
The Load type determines the composition factors (psi-factors) that are attributed to the load cases in this load group.
In this project choose Wind.
Click [OK] to close the load group manager and to return to the load cases manager.
Click [Close] to close the load cases manager.
Note: each load is classified in a load group. These groups influence the combinations that are generated as well as the
code-dependant coefficients to be applied. The following logic is adopted. Variable load cases that are independent from
each other are associated to different variable groups.
For each group, you set the load category (see EN 1991). The combination factors from the Eurocode are generated
from the available load groups. When a generated combination contains two load cases belonging to different groups,
reduction factors will be applied for the transient loads.
If the load is divisible, its different components are entered as individual load cases. As long as the load combination
does not contain any variable load belonging to another group, no reduction factors may be applied. The different load
cases of a divisible load are therefore associated to one variable group. Load cases of the same type that may not act
together, are put into one group, which is made exclusive, e.g. “Wind X” and “Wind -X” are associated to one exclusive
load group “Wind” to avoid simultaneous action.
BV – 2025/01/06 35

Tutorial – Steel Frame
Load panels
We will make use of load panels to distribute surface loads to line loads on the members.
To enter load panels, use the Panel with load to 1D & edges command in the category Load panels of the workstation
Structure (or via the marking menu).
Set Load transfer direction to X (LCS panel) and Load transfer method to Tributary area in the properties dialogue.
Use the snapping points in the roof to create a load panel for each pitch of the roof.
Press <Esc> to finish the input.
Press <Esc> once more to deselect the load panels.
Note: the first two nodes that you use to create the geometry of the load panel will determine the load transfer
direction. You can change the direction if needed via the property panel.
36 BV – 2025/01/06

Chapter 4 – Loads and combinations
Loads
In the status bar you can change the active load case. Activate load case LC2.
Select the Surface load on 2D command in the category Surface loads of the workstation Loads (or via the marking
menu).
Set Value [kN/m^2] to -0.20 in the properties dialogue. The Direction is the global Z direction and the value is negative,
so the load is acting vertically downwards.
Confirm your action with [OK].
Select all load panels by clicking on them or use the select all command (Main menu > Tools > Selections > Select all).
Press <Esc> to finish the input.
Press <Esc> once more to finish the selection.
BV – 2025/01/06 37

Tutorial – Steel Frame
The loads are coloured in green.
When you calculate the model, the loads will automatically be converted from surface loads to line loads.
If you like you can already generated them before the analysis to evaluate them. Therefore select a load panel and in
the property panel choose Generate loads as Action. The generated loads are coloured in orange.
Go to the view settings and switch on the tab Loads/masses the Generators to Generated or Original + Generated if the
loads remain green. Or use the toggle in the View bar.
38 BV – 2025/01/06

Chapter 4 – Loads and combinations
In the status bar change the active load case to load case LC3.
Select the Line load on 1D command in the category Line loads of the workstation Loads (or via the marking menu).
Set Value - P [kN/m] to -2.80 in the properties dialogue. The load Direction is Z and the System is the local coordinate
system LCS. The linear loads are acting in accordance with the local Z-axes of the elements.
Confirm your input with [OK].
Select the members where this load must be positioned: the roof girders and the columns.
Press <Esc> to finish the input.
Press <Esc> once more to finish the selection.
BV – 2025/01/06 39

Tutorial – Steel Frame
Select the linear loads on the roof girders and the columns of the first and last frame by clicking with the left mouse
button on these loads. The mentioned members must have only half of the load value because only half of the loading
width, affected by wind, belongs to them.
The common properties of the 8 series are displayed in the property panel. Change the value from -0,034 kN to
-0,017 kN.
Note that you can also use simple formulas in these numerical input fields:
40 BV – 2025/01/06


## Sayfa 41

Chapter 4 – Loads and combinations
Combinations
By default automatic code combinations are activated in the Actions tab of the Project data dialogue (via Main menu >
File > Project Settings).
Click on the command Combinations in the workstation Loads in the process toolbar (or via Main menu > Libraries >
Load Cases, combinations > Combinations) to have a look at the automatic generated combinations.
Two code combinations are created, one for the Ultimate Limit State and one for the Ultimate Serviceability State.
You can click on [>>>] next to the Action Explode to linear to have a look at the individual linear combinations to evaluate
if the load groups are defined correctly.
BV – 2025/01/06 41

Tutorial – Steel Frame
Chapter 5: Analysis
Linear analysis
As the calculation model is completely ready, you now can start the calculation.
Use the Calculate button in the middle of the process wheel in the process toolbar to start the analysis (or via Main
menu > Tools > Calculation & Mesh > Calculate).
Make sure that the option Connect members/nodes is turned on in the Mesh setup, so all entities are properly
connected before the analysis. Select Linear analysis and press Calculate.
42 BV – 2025/01/06

Chapter 5 – Analysis
The calculation process dialogue indicates the progress of the analysis. After finishing the analysis, you can consult the
Results tab and view the maximum deformation and rotation for the normative load case. Click [Close] to close this
window.
BV – 2025/01/06 43

Tutorial – Steel Frame
Chapter 6: Results
When the calculation is completed, results can be viewed. The relevant commands in the workstation Results become
active now.
Reactions
Select the workstation Results in the process toolbar and click on the command Reactions.
Go to the property panel and set:
• Type of selection to All
• Type of load to Combinations
• Combination to LRFD-Ult (auto)
• Extreme to Mesh
• Values to R_z
The action button Refresh has an orange highlight, i.e. the graphical scene must be refreshed. Press the action button
Refresh to display the results in the graphical scene in accordance with the options above.
44 BV – 2025/01/06

Chapter 6 – Results
To display these results in a table, the Preview action is used. Click on Report preview.
Internal forces
Select the workstation Results in the process toolbar and click on the command 1D internal forces.
Go to the property panel and set:
• Type of selection to Current
• Type of load to Combinations
• Combination to LRFD-Ult (auto)
• Extreme 1D to Member
• Values to M_y
BV – 2025/01/06 45

Tutorial – Steel Frame
Select columns and the roof girders of the middle frame using the left mouse button.
Click on the Refresh button to display the results on the graphical screen in accordance with the defined options.
To change the display of the results, the settings of the graphical scene can be adapted via the options in the group
Drawing setup 1D in the property panel. You can display units, change the colour scheme or graph type, …
Note: to change the font size of the displayed results, you can use Main menu > View > Colours & lines. In this menu, the
different sizes of the displayed labels can be changed. Units can be changed via the status bar > Unit system > Manage
units.
46 BV – 2025/01/06

Chapter 6 – Results
3D deformations
Select the workstation Results in the process toolbar and click on the command 3D deformations.
In the property panel you can set similar settings as we saw before, like Type of selection, Type of load, Extreme 1D,
Extreme 2D, …
For the Values you can choose between the displacements and rotations for the local axis or for the total deformation
U_total.
There is an option Wireframe. When it’s turned on, only centre lines and centre planes are used for calculation and
displaying the results. This option is much less demanding on performance resulting to faster visualization of the results
and the deformed shape of the structure.
With the option Deformed structure the result values can be displayed on deformed surface of the structure.
BV – 2025/01/06 47

Tutorial – Steel Frame
Results-related status bar options
In the status bar you can find two results-related icons.
• You can switch from Manual refresh (the icon is coloured in orange) to Autorefresh (the icon is coloured in
blue) and then the results will automatically be refreshed when a result setting in the property panel is
changed. Pay attention with the Autorefresh setting for bigger models when the property Type of selection is
set to All, because it will take longer to refresh the results (especially when you would ask for 3D results
without the wireframe option turned on).
• When you activate the icon Results lock, results can still be requested when making changes to the model. This
is clearly indicated with an exclamation mark and a red square around the graphical scene. Of course later on
recalculating the model is still needed to obtain new internal forces, deformations, …
48 BV – 2025/01/06

Chapter 7 – Code checks
Chapter 7: Code checks
The steel modules include a number of tools to perform steel calculations in accordance with the chosen design code.
The possibilities are as following:
• input of steel data per member;
• input and manipulation of buckling data;
• input of stiffeners, lateral-torsional buckling restraints, steel sheeting, …;
• performing a strength unity check;
• optimization of the cross-section;
• performing a serviceability unity check;
• input, calculation and creation of drawings for connections;
We will only explain the basics of the steel design in this tutorial. For more information regarding advanced steel
calculations (like 2nd order analysis, …) we refer to the Advanced Steel Training.
Buckling parameters
Before the steel code checks can be executed, the buckling parameters of the members need to be checked. By means
of the view settings, the buckling lengths of the members can be visualized. Select member B1 and activate the option
System lengths under Member parameters in the tab Structure of the View settings.
The figure above shows that the (default) system/reference length Ly (blue line) for buckling around the strong axis (y-
y) is the total height of the column and Lz (green line) for buckling around the weak axis (z-z) is half of the height. The
girder in the middle of the column therefore supports the column for buckling around the weak axis.
BV – 2025/01/06 49

Tutorial – Steel Frame
To modify the buckling data of a member, select the element and click on the button Manage next to the option System
lengths and buckling settings in the property panel.
On the Settings tab, several data can be changed:
• The Name field contains the name of the buckling parameter, in this case BG1.
• For buckling around y-y and z-z you can set the ky and kz factor: you can indicate that the program should
calculate the buckling factor automatically or you can choose a manual input of this factor. A third option
allows for a manual input of the buckling length (instead of factor).
• You can set as well Sway y-y and Sway z-z: you can indicate if the member is “braced” or not in the direction
regarded. When you choose option From setup, the default settings are used.
Note: the default settings for the buckling parameters are listed in Steel settings in the workstation Steel. The
structure is by default sway for buckling around the strong axis (in the plane) and non-sway for buckling around
the weak axis out of plane), taking the presence of wind bracings outside of the plane into account.
• You can define as well settings for torsional buckling (y-z), lateral torsional buckling (LTB) and both deflection
directions (used for the SLS check). By default settings are taken from y-y or z-z, but this can be changed with
the drop-down lists.
50 BV – 2025/01/06


## Sayfa 51

Chapter 7 – Code checks
Select the command Steel slenderness in workstation Steel of the process toolbar.
Go to the property panel and set Selection to Current and Values to Ly.
Then press Refresh to see the result for the reference length around the strong axis.
You can ask as well for the slenderness (Lam y or Lam z), buckling factor (ky or kz), buckling length (ly or lz),... The
buckling length is determined as the reference length multiplied by the buckling factor.
Steel checks
Strength check
The steel strength unity check includes both a section and a stability check.
Select the command Steel strength check in workstation Steel of the process toolbar.
Go to the property panel and set:
• Type of selection to All
• Filter to Cross-section
• Cross-section to CS3 – HP8X36
• Type of load to Combinations
• Combination to LRFD-Ult (auto)
• Extreme 1D to Global
• Type of values to UC_Overall
BV – 2025/01/06 51

Tutorial – Steel Frame
Then press Refresh to see the results.
The graphical scene shows that the maximum unity check occurs for one of the middle columns. To understand the
reason behind it, you can open the Report preview with a detailed representation of the performed steel check. You
can find all input data, calculated resistances, code formulas and notices and warnings in the detailed output that
usually contains a few A4 pages.
As output you can choose for Brief or Detailed. For the detailed output you have the option to show both tables and
formulas. Press Report preview to display the output.
This detailed report reveals that the column does not comply with the Bending and axial compression check according
to EN 1993-1-1 article 6.3.3 and formula (6.61),(6.62). In this particular project; a different cross-section with larger
inertia is required.
52 BV – 2025/01/06

Chapter 7 – Code checks
SCIA Engineer allows for a simple and smooth optimization of the steel section, whether it does not satisfy or whether it
is too “heavy” and overdesigned. The program will automatically propose a cross-section which complies with the unity
check.
In the property panel under Actions you can choose for Autodesign in order to optimize the cross-sections.
Note: steel optimization works with cross-sections, not particular members. Therefore once the cross-section is changed,
all members with that profile are changes as well. Therefore in the property panel the Filter should be set to Cross-
section when you use the Autodesign action.
In the dialogue press [Search for optimal] and the software will search within the profile library for a new cross-section
and stops with the first one that satisfies the defined maximal check (1.00 in our example).
Note: it is also possible to search in a list. Define lists via Main menu > Libraries > Structure and analysis > Cross section
list.
The software finds a cross-section HP10X42 with a check of 0.68.
After confirming with [OK], all members with the same cross-section will be changed.
Note: the project must be recalculated after the optimization. The changed cross-section modifies the self weight of the
structure as well as the stiffness of the whole model, which will lead to a different distribution of the internal forces. This
specifically means that, after optimization and recalculation of the structure, the concerned cross-section could possibly
reveal inappropriate. In that case, you must re-execute the optimization in order to find a solution in an iterative
manner.
Whole structure can be optimized using the steps above again for another cross-section (CS2,...). However, the
procedure was described and repeating it for all the members is not an intention of this tutorial.
BV – 2025/01/06 53

Tutorial – Steel Frame
Serviceability check
You can perform a steel SLS (Serviceability Limit State) check via Main menu > Design > Steel members > Serviceability
check or via the process toolbar.
The properties are set similarly as for the strength check.
With this check the relative deformations are compared with the deflection limits, as defined in the steel settings or via
the system lengths and buckling settings. When the check is exceeded, you can check if the deflection limits are set
properly or you need to change the cross-section of the elements. An serviceability autodesign command is not
available in SCIA Engineer.
54 BV – 2025/01/06

Chapter 8 – Steel connections
Chapter 8: Steel connections
As steel connections both frame strong-axis and frame weak-axis connections can be modelled, as well as pinned grid
connections and hollow section joints.
In this tutorial, as an example a frame strong-axis connection will be inserted between a column and a roof girder.
Structural model
Go to Main menu > File > Project settings and activate Structural model (and Steel Connections for adding the
connection later on) in the Functionality tab.
In the analysis model, the members arrive in the same node. But in practice the girder is cut for instance at the column
flange or vice versa. You can indicate this through the structural model.
Now go to Main menu > View > Visualization > Generate structural model.
The structural model will show you the real appearance of the structure, which is important when we want to create
connections.
BV – 2025/01/06 55

Tutorial – Steel Frame
Note: the structural model uses priorities of 1D members. The element with the highest priority value has priority over an
element with a lower priority. By default, an element of the Column type has a higher priority (100) than an element of
the Beam (80) type. Therefore, the beam is cut at the column flange and the column is a bit extended to be aligned with
the top flange level of the beam.
If needed you can change the Priority value property of the members (via the property panel), what will influence which
member(s) will be trimmed and which member(s) will be extended.
Steel connections are always based on the structural model. If the column continues, a connection with end-plate on
the roof beam is obtained. If the roof beam continues, a connection with end-plate on the column is obtained.
Steel connection
In the input panel go to workstation Steel and choose Frame strong-axis. You can find the command as well in the
workstation Steel of the process toolbar.
Select the node where you want to create the connection. Now indicate the members between which the connection
should be established. The program automatically selects (and highlights) all members arriving in the node. As the
connection should be inserted between the column and the roof beam, deselect the girder while pressing the <Ctrl> or
<Shift> button.
Confirm with <Esc>.
The connection is inserted (by the mean of a flag which contains Conn and the [node name]) and the properties,
including components, are displayed in the property panel.
56 BV – 2025/01/06

Chapter 8 – Steel connections
In the property panel you can set already the Type of loads to Combinations and Combinations to ULS-Set B (auto).
Now, the components of the connection can be activated. Activate End-plate and click on the Manage icon. The end-
plate is added and immediately displayed in the graphical scene. In the dialogue you can change parameters of the end-
plate and confirm with [OK].
Activate Bolts and click on the Manage icon. The bolts are automatically displayed in the graphical scene. In the
dialogue you can select bolt assembly M20 - 8.8. A window informs you that the bolt assembly was changed. When
confirming with [Yes] the bolts positions, intermediate distances, edge distances, … are automatically adapted to the
new bolt assembly. Furthermore in the dialogue you can activate or deactivate bolt-rows and set the position with the
property Location.
To complete the connection, activate the components Top stiffener and Bottom stiffener. Also for these components,
you could change the properties via the Manage icons.
BV – 2025/01/06 57

Tutorial – Steel Frame
The connection is now displayed in the same colour as the model. To change this view, use the View settings dialogue
and activate the options Welds and Coloured in the Connections tab.
The connection is now completely modelled and you can open the results.
Select the connection and click on the Action Open Preview to display the results in Report Preview.
You can set the Output as Brief, Summary or Detailed. The summary output shows the internal forces, design
resistances, results of unity checks and moment-rotation diagrams.
Notes:
• Detailed output with all intermediate calculations can be also displayed if necessary. It covers many A4 pages
for just one connection to enable hand verification of the provided results.
• Connections are additional data, i.e. a connection can be copied to other nodes.
58 BV – 2025/01/06

Chapter 9 – Report
Chapter 9: Report
In this final part of the tutorial, we will explain how to make a report of the assumptions, calculation and design.
Engineering report
You can select the Report command via Main menu > Tools > Report or with the icon in the workstation Reports.
Because no report was created before, Report_1 directly appears as a new application. This application is in a certain
way independent of the SCIA Engineer application. That is visible as well in the Windows main bar by a separate icon.
Click the Insert button in the ribbon to start inputting items in the report navigator. A window with New items appears
just below the insert icon:
BV – 2025/01/06 59

Tutorial – Steel Frame
Using this window, various data can be added to the report.
• Open the Special items group to add Page Format, Header / Footer and Table of contents. Double-click on the
item or hit the + button to add the item to the Navigator.
• Create a chapters Geometry, Loads and Results with the item Chapter from the Special items group.
• Open the Libraries group and select Materials and Cross-sections.
• Open the Structure group to add Nodes, Members, Load panels, Haunches, Hinges and Nodal supports.
Drag the items with the mouse to change their order or use the icons in the Document item part of the ribbon.
You can directly see these items in the Navigator and on the paper preview as well:
Adding images to the report
Any picture from SCIA Engineer application can be set to Engineering Report. Either as printscreen (that is unchanged
forever) or as live picture (that can be regenerated and is always up-to date).
Prepare any scene in the 3D modelling window, for example the analytical model with loads. You can use the icons of
the view bar to hide surfaces, render and show loads:
You can immediately add a live image via the Live image to report command via Main menu > Tools > Send > Live image
to report or with the icon in the workstation Reports.
60 BV – 2025/01/06


## Sayfa 61

Chapter 9 – Report
A properties dialogue for the image is opened. Here you can arrange the picture caption, scale, size, … Use the button [Two at
page] at the top ribbon, tick the option Automatic scale to fit size on and click on button [Insert & Close] from the tab into
selected report.
In the report you can indent this item under the item Load cases. When regenerating this item, an image will
automatically be generated for each load case (in case that Selection type is set to All in the properties of the load cases
item), based on the image that you have added before.
BV – 2025/01/06 61

Tutorial – Steel Frame
Displaying results
Go to Available items, open the Results group and click on 1D Internal forces.
In the navigator click on 1D Internal forces. The red exclamation mark both in the navigator and the preview indicates
that the presented values are not up-to-date.
In the properties window the setting of this table is displayed. Parameters for displaying the results in the Engineering
Report are configured in the same way as the parameters for viewing the results in the SCIA Engineer application:
• Selection type is set to All
• Type of load is set to Combinations and the Combination to LRFD-Ult (auto)
• Extreme 1D field is set to Global
Choose Regenerate selected (or Regenerate outdated in case that you want to regenerate all outdated item in the
whole report) in the top ribbon to display the table in accordance with the predefined options.
The red exclamation mark disappears.
Same as for generating multiple pictures per load case, you can automatically generate multiple pictures for a specific
result. For this you need the Result picture generator (under Special items) and indent a result item (e.g. 1D internal
forces) and a picture below it. In the properties of the result picture generator you can indicate for which values
pictures should be generated.
62 BV – 2025/01/06

Chapter 9 – Report
A list of items for this project could look like this:
Printing or exporting the report
Once the report is completed you can print it or export into various formats (e.g. PDF, RTF, Html, report and Excel) by clicking
the top left button in the interface:
There is also the option Save as template, so you can reuse the items from this report for other projects.
BV – 2025/01/06 63

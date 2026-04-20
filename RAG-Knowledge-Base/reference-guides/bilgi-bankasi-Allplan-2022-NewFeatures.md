---
title: "Allplan 2022 NewFeatures"
category: Features_and_Updates
source: Allplan_2022_NewFeatures.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2022

New Features in Allplan 2022

This documentation has been produced with the utmost care.
ALLPLAN GmbH and the program authors have no liability to the purchaser
or any other entity, with respect to any liability, loss, or damage caused,
directly or indirectly by this software and its documentation, including but
not limited to, any interruptions of service, loss of business, anticipatory
profits, or consequential damages resulting from the use or operation of this
software and its documentation. In the event of discrepancies between the
descriptions and the program, the menu and program lines displayed by the
program take precedence.
Information in this documentation is subject to change without notice.
Companies, names, and data used in examples are fictitious unless otherwise
noted. No part of this documentation may be reproduced or transmitted in
any form or by means, electronic or mechanical, for any purpose, without the
express written permission of ALLPLAN GmbH.
Allfa® is a registered trademark of ALLPLAN GmbH, Munich.
Allplan® is a registered trademark of the Nemetschek Group, Munich.
Adobe® , Acrobat®, and Acrobat Reader® are trademarks or registered
trademarks of Adobe Systems Incorporated.
AutoCAD®, DXF™, and 3D Studio MAX® are trademarks or registered
trademarks of Autodesk Inc., San Rafael, CA.
BAMTEC® is a registered trademark of Häussler, Kempten, Germany.
Datalogic and the Datalogic logo are registered trademarks of Datalogic
S.p.A. in many countries, including the United States and Europe. All rights
reserved.
Microsoft® and Windows® are either trademarks or registered trademarks
of Microsoft Corporation.
MicroStation® is a registered trademark of Bentley Systems, Inc.
Parts of this product were developed using LEADTOOLS, (c) LEAD
Technologies, Inc. All rights reserved.
Parts of this product were developed using the Xerces library of "The
Apache Software Foundation".
fyiReporting Software LLC developed parts of this product using the
fyiReporting library, which is released for use with the Apache Software
license, version 2.
Allplan update packages are created using 7-Zip, (c) Igor Pavlov.
Cineware, render engine, and parts of the user documentation; copyright
2020 MAXON Computer GmbH. All rights reserved.
All other (registered) trademarks are the property of their respective
owners.
© ALLPLAN GmbH, Munich. All rights reserved.
1. Auflage, Oktober 2021
Document no. 220eng01m01-1-TD1021

New Features in Allplan 2022

Contents

i

Contents
Allplan 2022 - Buildability at its best ...................................... 1
Optimizations for Installation and Project Import ...........2
Allplan Installation Significantly Simplified ................................................... 3
Import projects, also from previous versions ................................................... 4

Allplan 2022: easy operation right from the start .......... 5
The demo project “Hello Allplan!”....................................................................... 6
Properties palette....................................................................................................... 6
Modify openings ................................................................................................................... 7
Overlapping Openings ..................................................................................................... 8
Enhanced Properties Palette .......................................................................................9

Layers Palette ............................................................................................................ 10
Activate a single wall layer .................................................................................. 10
Roof Surface ................................................................................................................ 10
Options ..............................................................................................................................11
Extended ToolTips.................................................................................................... 13
Copy drawing file or layout to several drawing files or layouts.... 14
Reorganization of Layer Structure ................................................................ 15
Smart Catalog ............................................................................................................. 15
Layout frame and title block for multiple layouts................................. 16
Improved 3D navigation ....................................................................................... 16
Rotation around an element ....................................................................................... 17
Option - reverse direction in navigation mode ................................................18

ii

Contents

Allplan 2022

Other New Features ................................................................................................ 18
Start Screen .........................................................................................................................18
Default configuration for window arrangement now 2 + 1 animation18
Title Bar....................................................................................................................................18
Status Bar ..............................................................................................................................19
Feedback to User Experience Team .....................................................................20
Label Polylines ....................................................................................................................20
Niches ......................................................................................................................................20
Save Legends ......................................................................................................................21
Replace layout depends on version ....................................................................... 21
Function for labeling the layout renamed ........................................................... 21
Empty Layout Windows will be Kept..................................................................... 21

Faster and more secure collaboration with Allplan
Share................................................................................................... 22
Autosave Drawing Files and Layouts .......................................................... 23

More efficient and detailed modeling with Allplan ....... 24
Intersection of Different Components via Priority .............................. 25
Deactivate 2D interaction of Components............................................... 26

Writing your own scripts is becoming easier and easier
............................................................................................................... 27
Visual Scripting .......................................................................................................... 28
Visual Info ..............................................................................................................................28
Undo/ Redo..........................................................................................................................29
Modify Series Line............................................................................................................30
Duplicate Node ...................................................................................................................30
Unlink Smart Symbol ......................................................................................................30

New Features in Allplan 2022

Contents

iii

New Hotline Tool cleanvisgui ......................................................................................31

Automated Reinforcement: Fast and Precise ................ 32
Select Automatic Reinforcement Directly ............................................... 33
Shape Code Manager ............................................................................................ 34
Legends with drawing file filter ....................................................................... 35
Move Linked ................................................................................................................ 35
Other New Features .............................................................................................. 36
Project Templates............................................................................................................36
Labeling Options................................................................................................................36
Unit for Legend Break ....................................................................................................36
Breaks in Unicode Style ................................................................................................36

More variety in steel construction with Allplan ............. 37
Creating Steel Joints .............................................................................................. 38
New Object Structural Framing Brace ........................................................ 38
Mark Numbers for Structural Framing Object ....................................... 39
Other New Features ............................................................................................... 41
Round cross section for structural framing beams ......................................41
Axis Grid Extended and Improved ...........................................................................41

Intuitive to use and powerful: Terrain model and Road
design..................................................................................................42
Introduction to Road Design.............................................................................. 43

Valuable innovations for attribute management ........ 44
New Formula Editor ................................................................................................ 45
Remove attributes by means of the properties palette ...................47

iv

Contents

Allplan 2022

Other New Features ...............................................................................................48
Project settings: Path settings for attributes ................................................ 48
Project settings: Change project for taking over the resources ....... 48
Project Attributes Extended .................................................................................... 48
Export Empty Attributes .............................................................................................49
Formulas ................................................................................................................................49
Modify Attributes in Building Structure ..............................................................49

Present Compelling Projects .................................................. 50
Perspective directly adjustable in window toolbar .............................. 51
Section display with selected viewing direction .................................... 51
Optimized RT rendering for NVIDIA graphics cards............................. 52
Other New Features ............................................................................................... 53
Tone mapping in view type “animation” .............................................................53
Blooming and Lens Effect in Animation View Mode ....................................53
Volumetric fog in “animation” view mode .........................................................54
Light and shadow in the “hidden” and “sketch” view modes ................54
Physical sky as default background for “animation” and “RTRender”
view types ............................................................................................................................54
Record Movies in Sketch, Wire or Covert Mode............................................54
“Visualize” task now also in “surroundings” role ...........................................55

Adjust views and sections quickly and easily ................ 56
Match Properties...................................................................................................... 57
Select Elements for Display ............................................................................... 57
Extended Options for Axis Grid ....................................................................... 58
Other New Features ............................................................................................... 59
Direction Symbol for US Standard Style ............................................................59
Section Objects with Handles ...................................................................................59

New Features in Allplan 2022

Contents

v

Section of Views/ Section ..........................................................................................59
Better Hatching Style ....................................................................................................59

Various enhancements in dimensioning ........................... 60
Curve Dimensioning Updated ............................................................................ 61
Angle Dimensioning Updated............................................................................. 61
Other New Features .............................................................................................. 62
Move Dimension Text ....................................................................................................62
Additional text for associative dimension lines ..............................................62
Foot as dimension text unit ........................................................................................62

Detect errors more quickly thanks to color coding ..... 63
Objects Palette .......................................................................................................... 63
Additional Column for Color Coding .......................................................................63
Hide Everything Selected ........................................................................................... 64
Filter by Attribute “Style Name” ............................................................................ 64

Reliable basis for cost planning .............................................. 65
Reliable Collaboration for OpenBIM Projects .................. 66
New OBJ Format for Importing Models .......................................................67
SketchUp Import, OBJ Import ............................................................................67
SketchUp V2021 Importable ...................................................................................... 67

IFC Interface ................................................................................................................ 68
Improved Interface for IFC Import and IFC Export ...................................... 68
Exchange Profiles for IFC Import and IFC Export ..........................................69
Enhanced Log .....................................................................................................................70
IFC Attributes......................................................................................................................70

Data Exchange with CAFM Programs (e.g. waveware) via DWG73

vi

Contents

Allplan 2022

New role in actionbar: Execution of construction work
............................................................................................................... 74
New: Design of bridges from precast girders ................ 75
New at ALLPLAN: Solution for design and production
of precast elements .................................................................... 76
Multiple optimizations in Bimplus .......................................... 77
Single Login for Allplan Webservices ............................................................ 77

Index ................................................................................................... 79

New Features in Allplan 2022

Allplan 2022 - Buildability at its best

1

Allplan 2022 - Buildability
at its best
Optimal Buildability through seamlessly integrated processes

Allplan 2022 stands for the seamless working method of
architects, engineers and contractors on a single
platform from the initial design to successful
implementation on the construction site. All information
such as floor plans, elevations, sections, reports,
quantities or costs are available to all project partners.
Quality losses due to imports and exports during system
changes are a thing of the past. This shortens
coordination processes, increases efficiency and
enhances added value. Allplan 2022 provides you with a
seamlessly integrated process in line with the BIM way of
working - for buildability at its best.
Right at the start of the project, Allplan supports
thorough capture of the construction environment with
functionality for the terrain model and road design. In the
course of the project, you can increase your efficiency
and precision with the help of optimized modeling tools.
Visualizations become even more realistic and of higher
quality. The areas of concrete and steel structures have
been further developed. Allplan 2022 offers new
functions for implementation on the construction site. At
the same time, the new version impresses with optimized
user-friendliness in many areas.

2

Allplan Installation Significantly Simplified

Allplan 2022

Optimizations for
Installation and Project
Import
You can now get started even faster with the new
Windows Installer. New design and a simpler user
interface: Faster download and installation process.
If you have a large number of workstations, you can save
all settings and then run the installation completely
automatically. In addition, you can now import projects
from any source directly in the project selection dialog.
You can activate or deactivate the Allplan Workgroup
Manager at any time.

New Features in Allplan 2022

Optimizations for Installation and Project Import

3

Allplan Installation Significantly Simplified
Allplan installation simplified considerably. As a user, the settings you
make during the installation are now limited to a few specifications,
such as defining the program path and the data path, and selecting
the options to be installed. For an upgrade installation, you only have
to choose between upgrading an existing Allplan installation and a
new or parallel installation of Allplan 2022.
You can make all other settings and transfer settings, projects and
other data from previous versions downstream using Allplan
Diagnostics (select in Allplan:
Help menu; select in Services
application: Service menu) or direct project import via
new
project, open project.
Important information about the Workgroup Manager!
When you reinstall Allplan 2022, you no longer need to explicitly
specify whether to install with or without the Workgroup Manager.
The Workgroup Manager is installed automatically as of version
2022.
If you want to run Allplan in a network with Workgroup Manager and
you have a corresponding license, activate the Workgroup Manager
via Allplan Diagnostics (settings tab, workgroup settings area). For
more information, see “Allplan Diagnostics” in the Allplan Help.

4

Allplan Installation Significantly Simplified

Allplan 2022

Import projects, also from previous versions
In the newly designed dialog box new project, open you can now
also import projects or zipped project backups. This way you can
easily access projects from all supported Allplan versions.

importing projects
Here you can import one or more projects or zipped project backups
from any path. The project can also originate from an earlier, still
supported Allplan version. You can select the projects in the import
project dialog box and import them into the current version. The
source version is displayed in the version column; the project is
converted to the current version when you first open it. You can use
this function to upconvert projects from previous versions after
upgrading to the current Allplan version.
Tip: You can find the path where the local projects are stored via
Service application - service - Windows Explorer - my own CAD
projects (PRJ).

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

Allplan 2022: easy
operation right from the
start
To make it easier to get started with Allplan, the tooltips
have been enhanced: when you hover over an icon with
the mouse button, a brief explanation of the function is
now automatically displayed. Developments to
standardize the user interface have also been continued:
For example, property palettes have been added for
more object types such as openings and steel
connections components. For the simplified use of cloud
services, there is now a common login for Allplan
Connect and Bimplus. Another new feature is the ability
to rotate around a selected object in the animation.

5

6

The demo project “Hello Allplan!”

Allplan 2022

The demo project “Hello Allplan!”
HELLO ALLPLAN! - Your quick introduction to how to get
started with Allplan.
The demo project “Hello Allplan!” is automatically installed with
Allplan. It is intended to make it easier for you to get started with
Allplan using an example project by allowing you to conveniently try
out using the tools on existing objects. Nothing can go wrong,
because you can delete and reinstall the demo project at any time.
The demo project is supplemented by the Hello Allplan! videos,
which are adapted to the project and take you through the diverse
possibilities of the model-based planning method. You can access
the videos via the HELLO ALLPLAN!
(https://www.allplan.com/hello-allplan/) website.
You can find the demo project “Hello Allplan!” after starting Allplan in
the ALLPLAN welcome dialog. Just select and start!

Properties palette
To customize your model even more effectively and quickly, you can
now modify complex window and door openings using the
properties palette. You use uniform workflows and, in addition to
geometric properties, you can also change reveal, parapet, stop or sill
types as well as integrated objects such as Shading SmartParts here.
In addition, you can modify all relevant window or door openings in
one step via the properties palette by activating the desired
openings and entering the changes in the properties palette. As a
result, all activated openings receive the changes made in one step.

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

Modify openings
When you activate one or more door or window openings, the
properties palette now offers all the parameters that are also
contained in the door or window dialog boxes. This allows you to
quickly and easily change one or more openings in one step.

Figure: Palette properties for modification, one window activated

7

8

Properties palette

Allplan 2022

Overlapping Openings
The above/below cutting plane option, initially offered only in the
properties palette, lets you specify how overlapping openings
(windows, doors, niches) are displayed.
If the option is activated, the opening in the wall will not be cut out,
but only displayed as an outline; the wall hatching will be preserved.
You can assign the format properties of the opening and opening
object individually. This creates a correct representation of
overlapping openings in the floor plan and in the layout.

Figure: Display openings above the cutting plane

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

Enhanced Properties Palette
The palettes for some functions have been integrated into the
properties palette. For the relevant functions, the additional palette
that was previously displayed for defining the settings is now
displayed instead of the properties palette.
In detail, these are the palettes for the following functions:
• view type box (viewport toolbar)
•

3D view box (viewport toolbar)

•

surroundings (surfaces, light task area)

•

assign custom surfaces to 3D, achit. elements (surfaces,
light task area)

•

set surface (surfaces, light task area)

•

render (surfaces, light task area)

•

set project light (surfaces, light task area)

•

luminaire (surfaces, light task area)

•

set luminaire (surfaces, light task area)

•

set camera path (camera task area)

•

record film (camera task area)

9

10

Layers Palette

Allplan 2022

Layers Palette
You can now sort layers alphabetically in the layers palette. To do
this, click the short name or long name column labels in the list
header. There are three positions for sorting. After the first click the
sorting is done from A to Z, after the second click from Z to A and at
the third click the default sorting is restored.

Activate a single wall layer
Two clicks used to be required to activate a single layer of a
multilayer component: With the first click you could select the whole
component, with a second click you could select the desired layer. If
there was not enough time between the two clicks, the system
interpreted this as a double click and opened the properties dialog
box.

New: You can select individual wall layers with a single click by holding
down the SPACEBAR and clicking directly in the desired wall layer.
The wall layer activated this way is immediately selected in the
properties palette and can be edited.

Roof Surface
When creating a
roof area, all relevant parameters are now
immediately displayed in the properties palette.
In the properties palette, in the edge settings area, the edge
selection has been added. When creating the roof area, you will be
informed here which roof edge is being created.
After completing the contour, you can select the desired edge or
several edges (e.g. 1-3 or 1,4) in the input field by entering the edge
number. Use the arrow keys to select the previous edge of the
currently displayed edge or the edge following it.

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

11

Options
New option ‘fixed pen and color for junction, division lines’.
Under
options - components and architecture - components
you will now find the new fixed pen and color option for junction
and division lines. This allows you to define how junction and division
lines between components are displayed.
• If the option is deactivated (default), then the format properties
of junction and division lines are taken from the respective part.
• If the option is enabled, you can set a fixed pen and color with
which the junction and division lines will be displayed.
You can use this option to adapt the display to country-specific
standards, for example.
Note: This option is a general Allplan setting and applies globally to all
projects.

A: Option deactivated; pen/color of junction and division lines like component
B: Option activated; junction and division lines with fixed pen/color

12

Options

Allplan 2022

New option 'Automatically Update Views and Sections after
Layout Editor'.
To avoid having to decide whether to update views and sections
referenced to the model data every time you switch to the layout
editor when the model data is changed, you will find the new layout
editor section, which replaces the dialog box display, under
options - views.
Basically, all views and sections are always updated when switching
to the layout editor. If model data has been changed without
activating the linked views and sections, the representation in the
views and sections may not be correct. If the automatically update
views and sections by layout editor option is enabled, the
representation will also be updated in such views and sections. When
switching to the layout editor, you will be informed that you can
adjust the automatic update.
If, on the other hand, the automatically update views and sections
by layout editor option is deactivated, layout elements containing
views and sections in which the model data are not correctly
displayed will be displayed with the background color set under
background color of obsolete views. You can manually update such
layout elements using the
update layout function.

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

13

Extended ToolTips
Extended ToolTips consist of a short description of the function; they
can also contain further information, illustrations and/or links to
short explanatory videos. You can use them for support when
getting started with Allplan. To show them, keep pointing the cursor
at an icon if the corresponding ToolTip is already shown.

Extended ToolTips are enabled by default; They are activated or
deactivated in the same way as the ToolTips with customize user
interface - customize tab (quick access toolbar).
Note: Extended ToolTips are only displayed if actionbar
configuration is enabled.

14

Copy drawing file or layout to several drawing files or layouts

Allplan 2022

Copy drawing file or layout to several
drawing files or layouts
Now you can copy a drawing file to several drawing files in one step
in the building structure; this can help when you create variants. In
the building structure, right-click a drawing file and then click copy on
the shortcut menu. Then activate several empty drawing files (e.g.
by holding down the CTRL key), right-click in the selection and then
click paste in the context menu: The drawing file is copied from the
clipboard to all activated target drawing files; the drawing file name is
retained. Copying the drawing file to existing drawing files is not
possible.
For layouts elements: In the layout structure, right-click a layout and
then click copy on the shortcut menu. The layout must not be active.
Then activate several layouts e.g. in the structure level all layouts
(e.g. with pressed CTRL key), right-click in the selection and then
click paste in the context menu: The layout is copied from the
clipboard to all activated layouts. In contrast to the drawing file, the
activated layouts can also already be occupied.
If there are already occupied layouts in the activated layouts, you can
decide whether these should also be replaced. You can copy the
layout name as an option in this case. If you have activated only
empty layouts, the layout content including the layout name will be
inserted in all layouts without any further query. Existing layout
names will be replaced by this.
Note: This option is only available in the building structure or the
layout structure, but not in ProjectPilot.

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

15

Reorganization of Layer Structure
The layer structures supplied with Allplan have been extended with
the following new layer structures: ALLPLAN GENERAL and
INFRASTRUCTURE.
ALLPLAN GENERAL contains the layer groups surface elements,
text, dimension line, views and sections, layout, visualization and
the general layers of the construction layer group. So far, you could
find these layergroups under the layer structure ARCHITECTURE.
The layer structure INFRASTRUCTURE with the layer groups
general, temporary, measures, lining, components, covering and
equipment has been added.

Smart Catalog
The Smart Catalog offers you the possibility to create your own
material catalog. You can select this XML catalog when you create
your project, but you can also assign it afterwards in the project
properties (path settings - CAD-TAI project assignment). The
material data accumulated in the catalog is then available to you in
the material selection for your objects.
The Smart Catalog contains some sample data. You are not bound to
the structure of this sample data in the setup of your catalog. You are
free to choose the hierarchy as well as the type and number of your
material data. If you have added data to your Smart Catalog, it will be
stored in the office default folder ...\STD\XML Catalog Data after
saving.
The call to edit the catalog is currently made via Service application service - smart catalog.

16

Layout frame and title block for multiple layouts

Allplan 2022

Layout frame and title block for multiple
layouts
Using the assign title block entry in the context menu of the plan
structure, you can now assign a plan frame and/or a plan legend to all
selected layouts in one step. If a layout frame is selected, you can
also use a label style as title block. You can specify offset to the right
and offset to the bottom for the layout legend and the title block. If
you do not activate the distance option and no layout legend or title
block for the selected layouts, the default values of 5.0 mm apply. If
not, the existing distances will be maintained.
If you have already defined a layout frame and/or a layout legend or
a title block for the selected layouts, these will be replaced by the
assignments defined here.

Improved 3D navigation
You can now move more easily and intuitively in navigation mode,
e.g. in the animation windows. This is thanks to the following new
features:

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

17

Rotation around an element
When rotating in sphere mode (with the left mouse button pressed),
the camera was previously rotated around the axis of the scene or
model. Now you can set the position of the rotation axis as follows:
• If you click outside the model, the camera is rotated around the
axis of the scene as before, i.e. around the entire model.
• When you click in the model, a coordinate cross is displayed at the
clicked point and the camera is rotated around this point. The Z
axis of the superimposed coordinate cross corresponds to the
rotation axis of the scene. This makes it easier to move around
indoors in particular: For example, you can click on a table in the
middle of the room and then rotate the camera around it.

Figure: Rotation around a point of the model, with coordinate cross at the clicked point

18

Other New Features

Allplan 2022

Option - reverse direction in navigation mode
The option reverse direction in navigation mode is activated by
default mode. The movement is now analogous to other programs.
You can find the reverse direction in navigation mode option in
options - general - mouse and crosshairs in the mouse section.

Other New Features
Start Screen
When you launch Allplan for the first time, the workspace opens in
the
2 + 1 animation window arrangement. The graphic windows
for view and animation, which are arranged one above the other, are
positioned on the right. The coordinate system is displayed in the
graphic windows.

Default configuration for window arrangement now 2 + 1 animation
The default configuration for the window arrangement has been
changed to 2 + 1 animation windows.

Title Bar
The
Allplan status page function has been added to the title bar
of the Allplan application window. Furthermore, the
help pulldown menu has been extended with the support remote function
and the existing entries have been rearranged.

“Allplan Status Page” Function
You can use the
Allplan status page function to obtain
information about the status of the running systems, e.g. if you are
connected to the ALLPLAN Cloud. When you select the Allplan
status page function, the website https://status.allplan.com opens.
In the
actionbar configurator (right side of the actionbar) you
can find the new function under the more functions section.

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

19

“Support Remote” Function
The support remote function has been added to the pull-down menu
of the
help icon (title bar of the Allplan application window).
By activating this function, you can start a remote access software
(e.g. TeamViewer) directly from Allplan.

“Support Remote Download” Function
Under Allplan on the web (drop-down menu of the
help icon), the
Allplan remote maintenance function has been renamed to support
remote download. The mode of operation remains the same: You
can download a remote maintenance program.

Status Bar
The status bar of the Allplan application window has been extended
by one element: the notification center.
Under
notifications, you can see warnings, hints or errors
concerning the model or the modeling. The aim of this is to help you
improve and control the creation of your model. When there is a new
and the
important information, you will see the following icon
Notification Center message/notice will be displayed briefly at the
bottom right corner of the screen. You can permanently show the
message/note by clicking the changed icon in the status bar. If you
do not want the messages/instructions to be displayed
automatically for future actions, activate the suppress message
until project change option. If errors listed in the Notification Center
are corrected, the icon changes back to .
Note: Currently, the Notification Center only manages notices
related to the positioning of structural framing objects. Other areas
will be added in the future. Existing messages will also be displayed in
the Notification Center in the future.

20

Other New Features

Allplan 2022

Feedback to User Experience Team
Do you have any comments about the user interface, operation or
suggestions for improving Allplan? You can now contact our User
Experience team directly via hotinfo, the Allplan support tool.
Start hotinfo, select feedback user experience, and follow the
dialog with the program.

Label Polylines
The context menu of polylines created with
offset polyline
(select) now offers the
label function, analogous to the polylines
created with
offset 3D polyline (select).

Niches
Complex openings in old buildings are often modeled by two adjacent
niches. The common area of such niches is no longer filled with
finishing surfaces of contiguous rooms.

New Features in Allplan 2022

Allplan 2022: easy operation right from the start

21

Save Legends
When creating a legend, you will now receive a corresponding
message if the ZLE file in which the legend is to be saved is too large.
Alternatively, you can save the legend in another folder.

Replace layout depends on version
To replace a layout with another one from a folder or a ZIP file, you
can now select layouts from the current version as well as from the
last three previous versions.

Function for labeling the layout renamed
The function for labeling a layout with a label style has been renamed
because misunderstandings repeatedly arose due to the name being
the same as the
label function in the annotations task area. The
function is now called
label layout border.

Empty Layout Windows will be Kept
If you set the layout window outside the associated layout elements
when you create it or if you modify the layout window so that the
associated layout elements are outside the layout window, you will
now be left with an empty layout window that retains the
information about the included layout elements; you can edit it at any
time.

22

Other New Features

Allplan 2022

Faster and more secure
collaboration with Allplan
Share
Numerous optimizations have been made for work
across locations with Allplan Share. For example, data is
uploaded in the background without waiting times. In
addition, there is a new backup function that can be used
to automatically save revisions of drawing files and plans.
If the Internet is not available or is disrupted, you can
access the data in your computer's cache and simply
continue working.

New Features in Allplan 2022

Faster and more secure collaboration with Allplan Share

23

Autosave Drawing Files and Layouts
You can now specify how drawing files and layouts are to be saved
automatically in the
settings of the dialog box open on a projectspecific basis: drawing files from fileset/building structure or open
on a project-specific basis layouts. You can disable saving by
default and set the number of alterations.
The settings for drawing files and layouts are made separately and
are independent of each other. They are saved in the respective
project folder in the AutoBackupSettings.xml file. You can find
the individual alterations of the drawing files and layouts in the ndw
and layout subfolders in the backup folder of the respective project
folder.
Note: To prevent duplication of data in projects, no alteration is
generated during data conversion for drawing files and layouts.

24

Autosave Drawing Files and Layouts

Allplan 2022

More efficient and
detailed modeling with
Allplan
Detailed and precise models are a key prerequisite for
efficient processing of BIM projects. With Allplan 2022,
the interaction of components has been fundamentally
revised. Intersection within a drawing file is now
controlled consistently via priorities. Manual rework is no
longer necessary. The resulting increased model quality
reduces the effort required to create working drawings
and detailed drawings. Collisions are avoided and
quantities can be determined even more reliably.
In addition, the workflows for modifying openings and
with roof surfaces have been simplified and optimized.
The railing function has been revised so that railings can
now be placed along splines. This opens up new areas of
application, e.g. for organic architecture, but also for
bridge railings or guard rails.

New Features in Allplan 2022

More efficient and detailed modeling with Allplan

25

Intersection of Different Components via
Priority
The values for Priority that you specify when creating a part not only
affect objects of the same type within a drawing file (as before), but
also control the intersection of different components with each
other.

Figure: Intersection of different components in a drawing file via priority

• Intersection is performed regardless of the type of component
and height (horizontal, vertical, different heights.)
• The intersection is based on the Priority property.
• The priority attribute can also be set in the properties palette or
in the modify attributes dialog.
• You can also see the intersection in the floor plan (e.g. for
different heights).
You can also change the priority afterwards in the properties
palette: This has the advantage that the intersection of the
component with all intersected elements is immediately recalculated
without having to explicitly perform
restore 3D view.
Note: Until now, you could prevent the intersection of two
components by using different relative heights at the bottom. This is
now no longer possible; please use the priority instead.

26

Deactivate 2D interaction of Components

Allplan 2022

Deactivate 2D interaction of Components
In the properties palette you will now find the new 2D interaction
option for components or individual layers of components. This
allows you to control the interaction of architectural components
with other components in the floor plan, the 3D representation is not
changed.
The 2D interaction option is active by default. If you deactivate the
option, the components are no longer intersected in the 2D floor plan.
Certain 2D lines can be hidden, for example.

Figure: Option 2D interaction of the beam is disabled

New Features in Allplan 2022

Writing your own scripts is becoming easier and easier

27

Writing your own scripts
is becoming easier and
easier
A number of optimizations in the Visual Scripting area
make creating custom scripts even easier and faster. For
example, the new palette designer allows parameters to
be placed selectively on multiple tabs. Tooltips have been
improved and sliders are now supported. It is also
possible to access additional components such as
columns and beams and to control IFC export. In addition,
actions can be undone or repeated with just one click.

28

Visual Scripting

Allplan 2022

Visual Scripting
Visual Info
When you sort a parameter from the lower area to the upper area of
the palette palette designer, you now get visual feedback about the
drag and drop behavior.
If you drag the parameter onto the new group icon or an existing
tab or
for a new tab, these areas will be displayed with a
colored background. Now place your parameter, it will be placed
exactly at the selected location.
If you drag the parameter into the empty area after the last list entry
of a tab, you will create a placeholder (create new group), in which
you can then place your parameter.
When groups are
collapsed, the appearance of the expanders
indicates whether the group contains elements (expander = black
filled triangle) or whether the group is empty (expander =
gray
outlined triangle). You can also recognize a still empty group by the
fact that the group name is displayed in italics and in the color gray.
If you have made any changes to the logic of your script, such as
deleting or adding nodes, you will see a note about this in the
run the
properties palette of Allplan. You will be prompted to
script again in the visual scripting application window. As a result, you
will see the adjusted parameters in the properties palette of Allplan.

Undo/ redo
The undo and redo functionalities are now also available in the visual
scripting application window (toolbar and edit menu).
Undo (CTRL+Z): Allows you to undo one or more actions.
Redo (CTRL+Y): This allows you to restore actions that have been
undone.

New Features in Allplan 2022

Writing your own scripts is becoming easier and easier

29

Modify series line
If you have accidentally disconnected a series line at the input port,
restore the connection by clicking the ESC key.
The appearance of the series line now makes it easier to recognize its
selection state:
• gray and narrow = normal and not selected
• light gray and narrow = mouseover
• dark gray and wide = selected and context menu is open

Duplicate node
When you duplicate (edit menu or CTRL+D) a single node, only its
input connections are duplicated, the output connections are not.

Unlink Smart Symbol
The shortcut menu of a visual scripting object in Allplan now also
offers the
unlink smart symbol function. You can use this tool to
resolve the structure of the PythonPart relocation. You can then
modify individually the design entities that make up the PythonPart
installation.

Undo/ Redo
The undo and redo functionalities are now also available in the visual
scripting application window (toolbar and edit menu).
Undo (CTRL+Z): Allows you to undo one or more actions.
Redo (CTRL+Y): This allows you to restore actions that have been
undone.

30

Visual Scripting

Allplan 2022

Modify Series Line
If you have accidentally disconnected a series line at the input port,
restore the connection by clicking the ESC key.
The appearance of the series line now makes it easier to recognize its
selection state:
• gray and narrow = normal and not selected
• light gray and narrow = mouseover
• dark gray and wide = selected and context menu is open

Duplicate Node
When you duplicate (edit menu or CTRL+D) a single node, only its
input connections are duplicated, the output connections are not.

Unlink Smart Symbol
The shortcut menu of a visual scripting object in Allplan now also
offers the
unlink smart symbol function. You can use this tool to
resolve the structure of the PythonPart relocation. You can then
modify individually the design entities that make up the PythonPart
installation.

New Features in Allplan 2022

Writing your own scripts is becoming easier and easier

31

New Hotline Tool cleanvisgui
Hotfix Allplan 2021-0-6 has extended the hotline tool cleanup (in
Services application - service - hotline tools); it has also initialized
the display of visual scripting. Allplan 2022 provides the cleanvisgui
hotline tool for this purpose: Running it recreates the
PypConWpfDlg.vsprofile.xml and
VisualEditor_WindowLayout.config files. This functionality is omitted
in cleanup.

32

Visual Scripting

Allplan 2022

Automated
Reinforcement: Fast and
Precise
The automated reinforcement for beams, columns, walls
and punching shear reinforcement introduced with
Allplan 2021-1 has been improved in many respects. As a
result, the underlying PythonParts remain intact even
after placement and can be parametrically adjusted at
any time.
As a new feature, you can define user-specific bar
shapes. The content of associative legends is precisely
controlled via drawing file filters. A further upgraded
feature is that you can copy reinforcement including
sections and text labels. This saves a lot of time when
displaying a large number of similar reinforcement
situations.

New Features in Allplan 2022

Automated Reinforcement: Fast and Precise

Select Automatic Reinforcement Directly
You can now select the PythonParts for generating the automatic
reinforcement for beams, columns and walls and the automatic
punching shear reinforcement directly in the actionbar. In the
engineering structures task, you will find the new automatic
reinforcement task plane. Alternatively, PythonParts can still be
opened in the library palette under standard PythonParts
automatic reinforcement.

33

34

Shape Code Manager

Allplan 2022

Shape Code Manager
Until now, the shape codes used in the legend bar schedule - ACI
were hard-coded. You can now find these shape codes in the Etc
directory in the ShapeCodes folder in the text file
ShapeCodes_ACI.txt. This gives you the possibility to change
the existing shape codes as well as add new shape codes.
If you want to use the changed shape codes only in the project or in
the office standard, copy the text file into the ShapeCodes folder of
the respective project folder or the Std directory. Please note that in
the Etc directory the files are overwritten during an update.
When generating the legend, the search for the text file
ShapeCodes_ACI.txt is performed in the ShapeCodes folder in
the order project folder, Std directory and Etc directory. This means
that the file can exist several times with possibly different contents,
but it is only evaluated according to the defined priority.
Note: In the ShapeCodes folder of the Etc directory you will also find
the text file EndPreparations.txt. In this file you will find all the
entries that you can use to assign the new end processing
abbreviation attribute. You can find this attribute in the engineering
group. It is used in connection with the use of sleeves. The attribute
was also added as a parameter in the article catalog when creating
the sleeves and can be assigned accordingly. For this purpose, the file
Abbreviation_Endpreparation.lst must be assigned in the
Lst folder of the respective sleeve manufacturer.

New Features in Allplan 2022

Automated Reinforcement: Fast and Precise

35

Legends with drawing file filter
In the legends for the mesh, the reinforcing bar and the site plan, the
elements of the selected drawing files are now taken into account
even if these drawing files are not selected.
In the case of the general legend and the legend for thermal
insulation, landscape planning and drawing symbols, on the other
hand, the elements of the selected drawing files continue to be
filtered only if the drawing files are loaded actively or passively.

Move Linked
Since moving views and sections together with the associated
model data now also works with the normal
move edit function in
such a way that the position of the elements in relation to each other
move linked function no longer applies.
remains unchanged, the
Also copying, mirroring, rotating, ... of views and sections together
with the associated model data now works with the normal edit
functions.

36

Other New Features

Allplan 2022

Other New Features
Project Templates
You can now also use two project templates for civil engineering
when creating projects. You have one variant in which the formwork
and reinforcement are created together in one structural level and
one in which the formwork and reinforcement are created on
separate structural levels.

Labeling Options
Only administrators and project owners can permanently change
settings in the reinforcement labeling options. Users without
administrator rights, can only change the settings temporarily. This
also applies to choosing the font.

Unit for Legend Break
If you enter a value in the dialog line for defining the break within the
legend, it must now be entered in the set unit of length.

Breaks in Unicode Style
In order to get the most compact reinforcement labeling possible for
imperial units, fractions are now used in Unicode style.

New Features in Allplan 2022

More variety in steel construction with Allplan

37

More variety in steel
construction with Allplan
Based on the structural framing objects, bolted and
welded steel joints have been newly developed for
Allplan 2022. To accommodate the enormous variety,
the structural steel joints are based on basic elements,
e.g. for sheet metal, stems, bolts or welds. These are
available in the new connection tools, but can also be
combined into connections by Python scripts. The scripts
are accessible to all users and can be adapted, extended
or even completely redefined for other steel joints.
In addition, the axis grid on which many steel structures
are based has been further improved in terms of
representation and labeling. Standard or country-specific
material catalogs can be downloaded via Bimplus and
linked to components. In the case of structural framing
objects, the brace type has been added. You can also
position the objects automatically, even across different
drawing files and when using the Allplan Workgroup
Manager or Allplan Share.

38

Creating Steel Joints

Allplan 2022

Creating Steel Joints
With the new
connection toolbox function in the structural
framing objects task area, you can open the PythonPart to create
connections for structural framing objects directly in the actionbar. If
you click on the function, the input palette of the PythonParts
connection toolbox, which you can find in the library under standard
PythonParts supporting structure, is opened.
Set the parameters of each element in the two tabs of the
connection toolbox palette, click the confirm button in the
positioning area at create element and place the element at the
desired position.

New Object Structural Framing Brace
With the new
structural brace function in the structural framing
objects task area, you can now create braces in addition to columns
and beams. The scope of the brace parameters corresponds to that
of the beam and it is also generated in the same way as the beam.

New Features in Allplan 2022

More variety in steel construction with Allplan

39

Mark Numbers for Structural Framing
Object
In the palettes of structural framing objects, the positioning section
has been added to the attributes tab. Here you define the expression
for the schema as well as the numerical value for the start number.
These specifications are then used to generate the position number
with the new
positioning function in the structural framing
objects task area. To do this, after selecting the function, select all
the structural framing objects for which you want to generate a
mark number and right-click on the workspace to confirm your
selection.
To generate the mark numbers, all drawing files that are actively in
the background are also taken into account in addition to the actively
loaded drawing file. Structural framing objects with identical schema,
identical start number and identical parameters and attributes
receive the same mark number.
Note: If no expression has been specified for the schema, no item
number will be generated.
If you modify the structural framing objects, the mark number is
displayed for information. You can use the mark number as an
attribute of the structural framing object, e.g. for labeling.

40

Mark Numbers for Structural Framing Object

Allplan 2022

Notes on the parameters of positioning
• The random number of characters "$" in the expression for the
schema determines with how many digits the number in the
mark number is output at least. If, for example, C4$$x is defined
as the schema and 8 as the start number, you get the following
mark numbers: C408x; C409x; C410x; ... C499x; C4100x; C4101x;
...
• The expression for the schema and the numerical value for the
start number are stored in the favorites file.
• If you change the default value for the schema and/or the start
number manually, by taking over existing parameters or by
loading a favorites file when creating the structural objects, you
can use them for all further objects or only for the current object.
• If the mark number has already been generated and you change
the schema and/or the start number manually, by taking over
existing parameters or by loading a favorites file, the mark
numbers already generated are deleted again and must be
generated again. A note tells you this.

Control of positioning after modifications
If you have already created mark numbers for the modified
structural objects and the modifications have an effect on the
correct positioning, a message appears briefly at the bottom right of
the screen after you close the palette to indicate that objects with
incorrect mark numbers exist. You can show this notification
notifications in the status bar. If you
permanently by clicking on
do not want the messages to be displayed automatically for future
modifications, activate the suppress message until project change
option.
If the incorrect positioning is corrected, the icon changes to
makes it clear that there are no objects with incorrect mark
numbers.

. This

New Features in Allplan 2022

More variety in steel construction with Allplan

41

Other New Features
Round cross section for structural framing beams
As with structural framing columns, you can now select the
as the cross-section shape for structural framing beams.

circle

Axis Grid Extended and Improved
For the axis grid, you can now enter any designation for the axis grid
in the attributes area of the label tab, which will also be saved in
favorites as a property of the grid.
When creating and modifying the axis grid, you can now also create
an axis before the first axis. You can do this either intuitively by
clicking on the position on the workspace or by entering a negative
initial value for the offsets in the palette. Furthermore, you can now
also delete the first axis.

42

Other New Features

Allplan 2022

Intuitive to use and
powerful: Terrain model
and Road design
The functionality for terrain modeling and road design has
been completely redeveloped and includes an intuitive
user interface to get started quicker. In addition, the
import of point lists, LandXML and REB files as well as the
transfer of road alignments from Bimplus is supported.
To further optimize performance, relevant areas can be
cut out of a terrain model. In addition, the number of
points in the terrain model can be reduced. Discontinuities
in the terrain can be modeled by break lines.
Road design supports parametric modeling of straight
lines, transition curves and arcs in site plan and elevation.
Slopes are generated independently. Longitudinal and
cross sections can be generated and placed
automatically according to predefined rules.
The design of utilities placed under or next to roads, such
as water, sewage, electricity, Internet, natural gas or
district heating, is also supported. Pipes and manholes are
generated and displayed in dimensioned and labeled
sections.

New Features in Allplan 2022

Intuitive to use and powerful: Terrain model and Road design

Introduction to Road Design
You can open a short introduction to the new road planning part of
the program as follows:
• On the right side of the title bar, click
onboarding street planning.

help, and then click

43

44

Introduction to Road Design

Allplan 2022

Valuable innovations for
attribute management
Due to its central importance for BIM projects, attribute
management with Allplan and Bimplus is constantly
being further developed. For example, the performance
of the interaction between Allplan and Bimplus has been
improved.
The formula editor for attributes now supports the
Python programming language as well as a syntax check
for detecting incorrect formulas. There is no longer any
restriction on the length of attributes.
The property palette has also been optimized: Attributes
are now grouped into IFC-compliant PSet Commons as
well as standard-specific and user-specific attributes. In
this case, the associated IFC PSet is automatically
activated by assigning the IFC object type. In addition, it is
now possible to assign IFC PSets in the building structure.

New Features in Allplan 2022

Valuable innovations for attribute management

45

New Formula Editor
The new
formula editor helps you define formulas and formula
attributes with a streamlined user interface, better overview, faster
attribute selection, and it provides better feedback on syntax
inconsistencies.
When defining new attributes, in the define new attribute dialog box,
select a data type for which formulas are possible (all except date).
As control, select formula; then the icon
is displayed with which
you open the formula editor.

The formula editor consists of the following parts:
Attribute
Lists all attributes in alphabetical order. If you click on an attribute, a
tooltip with extended attribute name and internal number is
displayed; double-click to transfer the attribute with its plain name
into the input field.
Function
Lists the available arithmetic functions. If you click on a function, a
tool tip with an extended name is displayed; double-click to transfer
the function to the box.

46

New Formula Editor

Allplan 2022

Operator
Lists the possible operations. If you click on an operator, a tool tip
with an extended name is displayed; double-click to transfer the
operator to the box.
Use the keyboard to enter numbers, calculations, and nested
parentheses in the box.
Box, formula
The box displays the selected attributes cleartext, functions, and
operators. You can also make keyboard entries here; the attributes
matching the entered character string are listed and transferred to
the input field with a click.
The formula line below displays the attributes selected above with
their internal numbers, functions, and operators. Formulas can
consist of up to 2048 characters.
will pop up to the left
If the formula cannot be calculated, the icon
of the input field. Clicking on the icon puts the cursor in front of the
will
error and you can correct it. If the formula is correct, the icon
be displayed.

New Features in Allplan 2022

Valuable innovations for attribute management

47

Remove attributes by means of the
properties palette
In the shortcut menu in the properties palette, you can now remove
attributes from one or more components: To do this, select the
component(s) and right-click the attribute you want to remove. The
remove entry, which removes the attribute from the components, is
new in the shortcut menu.

48

Other New Features

Allplan 2022

Other New Features
Project settings: Path settings for attributes
In previous versions, attribute groups were always stored in the
office default, regardless of the path settings for attributes. Now the
project path setting applies not only to attributes, but also to
attribute groups.

Project settings: Change project for taking over the resources
If you want to change the project from which the project resources
are to be taken over in
new project, open... in an existing project
with the path set to project, you subsequently want to change the
project from which the project resources are to be transferred, you
first need to change from project to office and then confirm the note
and the dialog box.
This resets the project resources to the office default; any changes
made will be overwritten.
Then switch back to project and use

to select the desired project.

Project Attributes Extended
Attributes for Georeferencing
In the project properties - attributes you can now select the
following attributes in the georeferencing group and assign values
to them:
• Coordinate reference system name
• Survey points easting
• Survey points northing
• Survey points height
• Survey points angle of rotation

New Features in Allplan 2022

Valuable innovations for attribute management

49

Export Empty Attributes
Attributes that are assigned to an object but have no entry ("empty"
attributes) are not exported with
export quantity data. Empty
attributes are taken into account with
export attributes.

Formulas
Formulas can now consist of up to 2048 characters.

Modify Attributes in Building Structure
With modify attributes in the shortcut menu of the building
structure you can now assign attributes to the structure levels site,
building, building and floor or change existing ones or even assign
new ones.

50

Other New Features

Allplan 2022

Present Compelling
Projects
Allplan's integrated visualization capabilities have long
been stunning. For version Allplan 2022, the graphics
engine has been revised so that you can use the features
of modern graphics cards even better for better
performance and convincing visualizations.
In particular, Vulkan™ technology for NVIDIA® graphics
cards offers significant benefits here: NVIDIA® OptiX™
Denoiser uses artificial intelligence to reduce image noise
from real-time renderings even faster. This significantly
shortens the time to achieve high-quality images.
Furthermore, new effects are available using Vulkan™
technology, including volumetric fog, blooming, and lens
flare.
Important! These options are only available if your graphics card
supports Vulkan™ technology for hardware acceleration
(recognizable by the red dot in the title bar of the relevant graphics
window). This is usually only the case with newer NVIDIA® graphics
cards.

New Features in Allplan 2022

Present Compelling Projects

51

Perspective directly adjustable in window
toolbar
You can now switch between parallel and central projection directly
from the window toolbar. For this purpose, the new
perspective
function has been integrated into the window toolbar.
Until now, you had to go via the
the window toolbar) to do this.

free projection function (also in

Note: As long as the
perspective is active, you can select the
standard projections, but the model is always displayed in central
projection. This is indicated by the absence of the red mark in the
projection icon
( perspective function is dominant).

Section display with selected viewing
direction
When displaying your construction in an architectural section, you
now have the option of retaining the viewing direction set in the
window when you select the desired section designation in the
section display list box in the window toolbar. To do this, click on the
desired section designation outside the icon
representation with
the viewing direction of the section.
If you click the
display with viewing direction of the section icon
in the list box, select the entry and then click the section line or
create the section display via the view menu, the model data will
continue to be displayed with the viewing direction of the selected
section.

52

Optimized RT rendering for NVIDIA graphics cards

Allplan 2022

Optimized RT rendering for NVIDIA
graphics cards
For workstations equipped with an NVIDIA® graphics card, the
NVIDIA® OptiX™ noise filter offers new visualization possibilities. The
noise reduction process makes the most of the NVIDIA® GPU's
capabilities, enabling sophisticated, high-resolution renderings to be
achieved in the shortest possible time.
The noise filter is available as a downstream post process for the
RT_Render render process as used in the RTRender view type. To
do this, select the NVIDIA OptiX entry in the view type palette for
the RT_Render render method in the post process settings area
under noise reduction filter.
Important! This option is only available if your workstation is
equipped with a graphics card from NVIDIA® that supports Vulkan™
technology (recognizable by the red dot in the title bar of the
relevant graphics window).

New Features in Allplan 2022

Present Compelling Projects

53

Other New Features
Tone mapping in view type “animation”
The “tone mapping” for readjusting overexposed areas by reducing
the dynamic range (dynamic compression) is now also available in
the animation view type or all user-defined view types that use the
RT_Render render method.

Blooming and Lens Effect in Animation View Mode
Provided you are using the Phong shading type, the animation view
type (or the self-defined view types that are based on the shaded
rendering method) gives you two more new ways to optimize the
screen display of your model: Bloom and lens effect. Both settings
are selected from the view type palette of the shaded render
method.
When Blooming is switched on, an additional ring of light is placed
around light sources, such as the sun or point-shaped sources of
light. The prerequisite is therefore that the physical sky has been
selected as the background via
surroundings (select) or one or
more artificial light sources have been set via
set project light
(select).
When the lens effect is switched on, additional circular light
reflections (comparable to the reflection of a light source in a camera
lens) are interspersed in the image.
Important! Both effects can only be displayed on your screen if your
workstation is equipped with a graphics card that supports Vulkan™
technology (recognizable by the red dot in the title bar of the
relevant graphics window). In renderings, both effects are generally
not taken into account.

54

Other New Features

Allplan 2022

Volumetric fog in “animation” view mode
Previously, fog was set via
options (desktop environment animation tab). This option can now be found in the settings for the
surroundings (visualize task, surfaces, light task area). Much
more detailed variation options are now available here.
In addition, if the Phong shading type is used in the animation view
type (shaded render method), the fog is displayed as volumetric fog.
This does not apply to the other shading types or renderings of the
current scenery! For this purpose, a homogeneous fog
representation is still used.
Important! Fog can only be displayed volumetrically on your screen if
your workstation is equipped with a graphics card that supports
Vulkan™ technology (recognizable by the red dot in the title bar of
the relevant graphics window).

Light and shadow in the “hidden” and “sketch” view modes
The position of the sun defined via
surroundings can be used for
the lighting situation in the view types hidden and sketch. The
resulting shadow cast can also be displayed.
Both settings are selected from the view type palette of the
respective render method hidden line calculation or sketch.

Physical sky as default background for “animation” and “RTRender”
view types
For the predefined view types animation and RTRender, the default
background in the graphics window is now set to physical sky
(previously color).
This setting can be changed via
surfaces, light task area).

surroundings (visualize task,

Record Movies in Sketch, Wire or Covert Mode
If you want to record movies with
set camera path or
record
movie (both in the visualize task, camera task area), you can now

New Features in Allplan 2022

Present Compelling Projects

55

also use the rendering methods sketch, wire and hidden, which are
familiar from the view types of the same name.
The settings selected for the respective rendering method in the
associated predefined view type (not in a user-defined view type)
are automatically used as parameters (see “view type palette” in
Allplan Help).

“Visualize” task now also in “surroundings” role
The visualize task is now also included in the surroundings role.

56

Other New Features

Allplan 2022

Adjust views and
sections quickly and
easily
With Allplan 2022, views and sections have been further
optimized. For example, properties can now be easily
transferred via the property palette, context menu or
wizards. The visibility and representation of objects can
be precisely controlled using drawing file and layer filters
as well as explicit selection and deselection. The visible
area can be quickly and easily adjusted via handles.

New Features in Allplan 2022

Adjust views and sections quickly and easily

57

Match Properties
When creating views and sections, you can now match the
properties of existing views and sections on the workspace or in the
match in the shortcut menu The reference
wizard by clicking
drawing files of the selected view/section are not adopted.
You can also apply the parameters of an existing view or section
when creating or modifying it by clicking
match properties in the
palette border.

Select Elements for Display
When creating and modifying views and sections, you can now
directly select which elements are to be considered for display. To do
this, go to the filter area, then entry and then choose the setting
select; then you can select the elements you want to be displayed.
To confirm, right-click in the workspace.
Please note that depending on the setting you chose for the entry
option, selecting elements via the button or the
remove/add
elements function will result in different displays. While the all setting
for entry does not display the elements shown in highlight color, the
select setting displays only these elements. When you switch from
the all setting to the select setting or vice versa, the selection made
using the
remove/add elements button or function is reset.

58

Extended Options for Axis Grid

Allplan 2022

Extended Options for Axis Grid
When defining the position of the axis label for an axis grid that you
have created using the
axis grid function, you can now
additionally define an offset for the starting point of the grid lines in
the input options and optionally create a double-sided label.
For views in z-direction, the axes are now completely displayed in xand y-direction.

New Features in Allplan 2022

Adjust views and sections quickly and easily

59

Other New Features
Direction Symbol for US Standard Style
If you select the US standard style, the selection for the side of the
direction symbol has been extended. You can now create the
direction symbol in the direction of the viewing direction also on
both sides of the section object.

Section Objects with Handles
You can now intuitively edit the clipping path shown in the section
using direct object modification. After you have selected it by
clicking on it, the usual handles and dialogs are offered on the section
object.

Section of Views/ Section
When creating a section from an existing view/section, the entry
boxes for top level and bottom level are now always hidden. This
means that you now also have to adjust the height subsequently for
sections in the z-direction if necessary.

Better Hatching Style
Georeferenced model data are usually available in rotated form. If
sections of this are created in the z-direction and rotated to the
horizontal, the hatching is now displayed correctly.

60

Other New Features

Allplan 2022

Various enhancements in
dimensioning
With Allplan 2022, associative dimensioning of angles,
radii and arcs is now also possible. In addition, the
adaptation of existing dimensions has been optimized.
Furthermore, additional texts are possible, and the
elevation dimensioning can be rotated.

New Features in Allplan 2022

Various enhancements in dimensioning

61

Curve Dimensioning Updated
The curve dimensioning has been updated and adapted to the
linear dimensioning:
• The associative option is now also available for curve
dimensioning.
• Associative dimensioning of circular and spline walls is now
possible with the wall axis switched on.
• The parameter selection has been unified; for this purpose, you
will see the dialog box known from straight dimension lines. All
parameters can now also be used with curve dimensioning.
• When you create a curve dimension, it is displayed as a preview.
• Curve dimensioning is now processed like linear dimensioning.
• Window height, parapet height and rooms are identified and
matched to the dimension line.
• The dimension line parameters are listed in the properties palette
and can be changed there.
• All curve dimension lines are given the name curve dimensioning
(for example, in the properties palette, the objects palette, or in
the element info.

Angle Dimensioning Updated
Angle dimensioning has been updated
• The associative option is now also available for angle
dimensioning.
• The parameter selection has been unified: All parameters known
from straight dimension lines can now also be used for angle
dimensioning.

62

Other New Features

Allplan 2022

Other New Features
Move Dimension Text
In
move dimension text, there is now a new free button: If this
button is pressed, you can place the dimension text at any location.
Previously, you had to deactivate the parallel and perpendicular
buttons at the same time to do this.

Additional text for associative dimension lines
You can now enter additional text for existing associative dimension
lines.
Select the dimension line. You can see the parameters of the
dimension line in the properties palette. Select the section for which
you want to add an additional text, select the display additional text
option, and enter the desired text in additional text.

Foot as dimension text unit
As a further imperial unit of measure, you can now set the
dimensioning to feet. The output of the dimension text is done as a
decimal number with 4 digits or 2 zeros after the decimal point.

New Features in Allplan 2022

Detect errors more quickly thanks to color coding

63

Detect errors more
quickly thanks to color
coding
As of Allplan 2022, objects can not only be quickly
filtered via the object palette, but also displayed in colorcoded form. This allows component properties to be
displayed clearly and checked at a glance. Attributes that
have not been assigned or have been assigned
incorrectly can thus be recognized quickly.

Objects Palette
Additional Column for Color Coding
To further improve control of the model, you can select a color for all
objects in the header of the objects palette. You can select from 256
Allplan standard colors using a drop-down field. You can deactivate
and reactivate the color with the on/off icon.
Note: This setting affects the animation view type only. Make sure
that the use hardware acceleration for all viewports option is
selected in the hardware acceleration - graphics area on the
desktop environment - display page in the
options.
You can set the color for the respective group. Individual objects
have the same color as the upper or lower group of objects (e.g.
openings and/or parapet, window, doorway, etc.).
If the subgroups within an object group (e.g. openings) have different
colors (e.g. sill, window, door opening, etc.), an icon for a mixed color

64

Objects Palette

Allplan 2022

selection appears in the top group.
You can combine color coding and transparency. The operations are
analogous to transparency and visibility.

Hide Everything Selected
In the upper part of the objects palette, a new button
hide
everything that is selected has been added.
This allows you to set all elements currently selected on your
artboard to invisible.

Filter by Attribute “Style Name”
You can now filter objects (walls) with the style name attribute in the
objects sorted by attribute palette. The prerequisite is that the
attribute to be sorted by is specified as the first level. This opens
the attribute selection dialog box, where you can select the style
name attribute (architecture general attribute group).

New Features in Allplan 2022

Reliable basis for cost planning

65

Reliable basis for cost
planning
The determination of traceable quantities is an essential
task in the design process. With Allplan 2022, not only
the quantities contained in the model (e.g. cubic meters of
concrete) can be evaluated. It is also possible to output
quantities that have not been modeled (e.g. square
meters of formwork area). This provides a reliable basis
for cost planning.

66

Objects Palette

Allplan 2022

Reliable Collaboration for
OpenBIM Projects
Smooth data exchange is a top priority for ALLPLAN.
Allplan 2022 and Allplan Bridge also support the new IFC
4.3 standard. This has been extended specifically for
infrastructure structures such as bridges, roads, railroads
and waterways. Improved or newly added are the import
of data from SketchUp (*.skp) and Wavefront (*.obj),
which can transfer data that has both geometric and
visual properties. This allows you to import a variety of
content objects as well as laser scans (e.g. Zephyr or
RealityCapture). In addition, you can now export
reinforcement data with sleeves.

New Features in Allplan 2022

Reliable Collaboration for OpenBIM Projects

67

New OBJ Format for Importing Models
With
import OBJ data you can now import high-quality models to
Allplan that are available as OBJ files. From this, Allplan objects are
created. If materials are available, they are also imported and placed
directly on the model with the UV coordinates.
You can exchange data with point cloud based surveying systems
(e.g. Zephyr, Reality Capture) via OBJ data.

SketchUp Import, OBJ Import
In Allplan you can assign only one material to an object. If a SKP or
OBJ file contains an object to which several materials or surfaces are
assigned, then this object is split into several objects during import
depending on the material; sub-objects with the same material are
combined again. This will display the object correctly in Allplan.
Among others, the following material properties are adopted: Color,
texture with color channels, and transparency.
The 3D model is placed on the document with the coordinates
defined during creation.
Surfaces and textures are saved in the project under
\design\SKP-Import\model name or \design\OBJImport\model name. If identical surfaces are found, you will receive
a message. You can replace or keep the existing surfaces.

SketchUp V2021 Importable
You can now also use SketchUp version 2021 data for imports.

68

IFC Interface

Allplan 2022

IFC Interface
Improved Interface for IFC Import and IFC Export
The interface of
import IFC data and
export IFC data has been
improved. The dialogs for file picking and setting options during
transfer have been combined and simplified.
If you have already specified the settings or if you use an exchange
favorite, you just need to specify the path and filename for the
destination - done. If you want to specify export or import in more
detail, click settings; then the dialog box will expand and you can
specify the options in the tabs as before.

New Features in Allplan 2022

Reliable Collaboration for OpenBIM Projects

Exchange Profiles for IFC Import and IFC Export
Additional exchange profiles have been developed for IFC export.
Now you can use the following exchange profiles for export:
• IFC2x3 Coordination View 2.0
• IFC2x3 Standard Export
• IFC4 Reference View
• IFC4 Standard Export
• IFC4.3 Standard Export
• Autodesk Revit
• G&W California IFC2x3
• G&W California IFC4
• Orca IFC2x3
• Orca IFC4
As before, you can use the following exchange profiles for the
import:
• Autodesk Revit
• G&W California
Click on the information... button to display further information on
the exchange profile.

69

70

IFC Interface

Allplan 2022

Enhanced Log
After the data transfer is completed, you will receive a log; at the end
of it, ignored elements (e.g. objects without geometry) are listed
sorted by type. For a better overview, the individual categories are
now displayed collapsed.

IFC Attributes
For the new exchange profile IFC4 reference view and the planned
certification, various adjustments and additions were made in Allplan.

IFC attributes for nodes in the building structure
You can now assign attributes to all nodes in the building structure
(such as buildings), e.g. for evaluating addresses:
• Department
• Address (street, house number, address suffix)
• Mailbox
• City
• Region
• Zip code
• Country
These attributes will be included when you export IFC data.

New Features in Allplan 2022

Reliable Collaboration for OpenBIM Projects

71

3D objects with IFC object type by default
Certain 3D objects are now created with the IFC object type
attribute by default and are assigned an undefined attribute value.
• 3D Line
• Cuboid (pyramid), sphere, cylinder
• User-defined architectural element, converted user-defined
architectural element

Further IFC object types
For the new exchange profile IFC4 reference view and the planned
certification, various adjustments and additions were made in Allplan.

Length of entire wall
According to IFC documentation, the length of an IfcWall type wall
(polygonal or varying thickness) should be the entire nominal length
of the wall along the center line of the wall, even if it is differs from
the wall path. The following changes result for the IFC export of a
complete wall:
• The length @220@ of a total wall in Allplan is now calculated in
accordance with IFC.
• The thickness @221@ of a total wall is now calculated as the sum
of the thickness of the individual layers.
• For length_absolute @198@ and thickness_absolute @199@ of
a total wall, the maximum extension in x-y direction in axis
direction is now calculated.

IfcMaterialLayerSet
The ‘IfcMaterialLayerSet’ can now be assigned to parts and directly
given a name; now the 'reference' attribute is used for it. The way of
assigning the 'codetext' attribute to a part or the first layer of a part
is no longer necessary.

IfcType for window and door SmartParts
You can now assign the IfcType in the settings tab when creating
window SmartParts as well as door or gate SmartParts. If you
select the default option, the detected IfcType will be automatically

72

IFC Interface

Allplan 2022

selected and displayed. The user-defined option allows you to select
and assign the desired IfcType.

Geometry attributes of columns
To comply with the IFC standard, the geometry attributes of
columns are renamed during IFC export:
• Height (@222@) becomes length
• Length (@220@) becomes width
• Thickness (@221@) becomes depth

New Features in Allplan 2022

Reliable Collaboration for OpenBIM Projects

73

Data Exchange with CAFM Programs (e.g.
waveware) via DWG
Since Allplan 2021, a room stamp can be used to place the base point
within a room. Rooms (incl. stamps) are recognized in CAFM
programs like waveware.
For data exchange with waveware, you can now use the new
labeling screen room stamp FM, which evaluates the designation,
function and floor space (without unit of measurement m2) of the
room. You can find room stamp FM under select label style standard directory - file 1 room stamp.
Note: In order for the base point to be placed via the room stamp
within the room, please first adjust the following registry key:
Select the path
Computer\HKEY_CURRENT_USER\Software\Nemetschek\Allpl
an\2022.0\Settings\ODX Data, create the
UseRoomReferencePoint entry if necessary, and enter a nonzero
value for it. Details can be found in the Allplan help under "Transfer
rooms to CAFM program waveware, as DWG".

74

Data Exchange with CAFM Programs (e.g. waveware) via DWG Allplan 2022

New role in actionbar:
Execution of construction
work
BIM and digitization are not limited to the planning process, but also
play an increasingly important role in construction. Accordingly, the
construction process is already given greater consideration during
planning and prefabrication. Allplan 2022 supports this trend. For
planning construction sites in particular, new objects such as cranes
and concrete pumps are included.

New Features in Allplan 2022

New: Design of bridges from precast girders

75

New: Design of bridges
from precast girders
With Allplan Bridge 2022, the options for parametric
modeling have once again been significantly expanded. A
special focus is the design of precast girder bridges. Bloss
curves are also supported for the design of railroad
bridges.
PythonParts, which have been placeable in Allplan Bridge
since version 2021-1, are now displayed in detail in Allplan
Bridge, including parametric reinforcement and fixtures.
Code-based design and checks can now be carried out
according to the American AASHTO LRFD standard in
addition to the Eurocode.
For improved usability, undo and redo functions are now
possible throughout.

76

Data Exchange with CAFM Programs (e.g. waveware) via DWG Allplan 2022

New at ALLPLAN:
Solution for design and
production of precast
elements
The integration of the previously independent
Nemetschek brand PRECAST SOFTWARE ENGINEERING
has added a solution for the design and manufacturing of
precast elements to the ALLPLAN portfolio. As Planbar is
already based on the Allplan platform, this opens up new
possibilities for customers: Architects, engineers and
construction companies can transfer BIM models
completely digitally to industrial production, including
connection to MES and ERP systems. In addition, precast
plants can build on existing BIM models from designers
and integrate them directly into the production process.
In a first step, the Allplan licensing system is now also
available for Planbar. In further steps, work will be done
on merging the two products. Customers are already
benefiting from precast-specific developments, such as
the new openBIM interface IFC4precast or automatically
created element plans with sections, dimension lines and
labeling.

New Features in Allplan 2022

Multiple optimizations in Bimplus

77

Multiple optimizations in
Bimplus
The open BIM platform Bimplus for interdisciplinary
collaboration offers a variety of improvements that, for
example, speed up the loading of large models, simplify
measurement and optimize document management.
In addition, documents and links can now be attached in
the Issue & Slideshow Manager and properties in the
Issue Manager can be customized. Finally, export of
selected objects in IFC format is now possible.

Single Login for Allplan Webservices
The login has been combined for the Allplan web services: Once you
are logged in to one web service, you are automatically logged in to
all other web services you are registered with (currently still with the
exception of Allplan exchange):
- Allplan Connect
- Allplan Bimplus
- Allplan Share
- Allplan Shop
- Allplan Campus


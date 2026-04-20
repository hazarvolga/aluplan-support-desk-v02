---
title: "Allplan 2021 StepsToViewsAndSections"
category: User_Guides
source: Allplan_2021_StepsToViewsAndSections.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2021
Views and Sections

Steps to Success

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
1st edition, June 2021
Document no. 210eng01s69-1-BM0621

Steps to Success

Contents

i

Contents
Welcome! ............................................................................................ 1
Basics .................................................................................................. 3
For whom is this guide intended? ........................................................................ 4
Overview of steps .......................................................................................................... 4
Importing the compressed project with the training data .................. 6

Step 1: building model ................................................................... 9
Objective............................................................................................................................. 10
Organization in the building structure .............................................................. 11
Layers and print sets .................................................................................................. 15
Area styles and drawing types ............................................................................ 19
Textures for surfaces ................................................................................................ 21

Step 2: general arrangement views ................................... 23
Objective............................................................................................................................ 23
Structuring and selecting drawing files ........................................................ 24
References and view options .............................................................................. 27
Creating associative sections ............................................................................. 29

Step 3: reinforcement ............................................................... 41
Objective............................................................................................................................. 41
Creating reinforcement with a 3D model .................................................... 42

ii

Contents

Allplan 2021

Selecting drawing files for modifying data ................................................. 48
Using reinforcement again .................................................................................... 50
Managing reference drawing files .................................................................... 55
Reinforcement based on an auxiliary 3D object ..................................... 58

Step 4: layouts ............................................................................. 63
Objective ........................................................................................................................... 64
Assembling layouts .................................................................................................... 65
Layout without model data .................................................................................. 70

Step 5: exchanging data .......................................................... 73
Appendix: working without links .......................................... 77
Organization in the building structure ........................................................... 78
Defining view options ................................................................................................79
Copying and converting a part of the floor plan ..................................... 80
Using changed model data .................................................................................... 83
Using reinforcement again .................................................................................... 85
Data exchange .............................................................................................................. 88

Index ................................................................................................. 89

Steps to Success

Welcome!

1

Welcome!
This step-by-step guide shows you how to create
general arrangement drawings and reinforcement
drawings based on views and sections that automatically
update themselves so that you can tap the full potential
of integrated design - from building model to
reinforcement.
Five easy-to-follow steps guide you from building model
generation to creation of general arrangement drawings
and reinforcement drawings to layout output and data
exchange.
Based on a simple and clear training project, this guide
describes each step in detail so that you can follow
quickly. As the training project contains the finished data
for each step, you can get started wherever you want.
The appendix shows you how to work without links while
creating general arrangement drawings and
reinforcement drawings based on views and sections
that automatically update themselves.
Have fun with this guide! We wish you every success!

2

Allplan 2021

Steps to Success

Basics

3

Basics
In Allplan 2021, you can create general arrangement
drawings and reinforcement drawings in two different
ways.
You can work with or without a model. When working
with a model, you use associative views and sections.
Note: You can use both the tools in the Reinforcement
Views task area and the tools in the Sections task area
to create model-based general arrangement drawings
and reinforcement drawings. However, you cannot mix
the tools from these two task areas. This guide describes
how to use the tools in the Sections task area.

4

For whom is this guide intended?

Allplan 2021

For whom is this guide intended?
This guide helps you getting started if you have created the general
Reinforcement Views
arrangement and reinforcement in the
task area until now and it is your first time working with the tools of
the Sections task area in Allplan 2021. In addition, you will learn how
to use existing reinforcement again (see "Using reinforcement again"
on page 50).
You cannot create reinforcement with a 3D model based on a 2D
general arrangement drawing in Allplan 2021. If you have a complex
component that you do not want to model in detail, you can still
create a three-dimensional model of the reinforcement by creating
an auxiliary 3D solid. For example, use the
Box tool to create a box
that is parallel to the coordinate planes and that has the dimensions
of the component that you want to reinforce. To find out how to do
this, see "Reinforcement based on an auxiliary 3D solid (see
"Reinforcement based on an auxiliary 3D object" on page 58)".
If you work in 2D all the time, this guide gives you a quick and
practical introduction to working in 3D, which has numerous
advantages.

Overview of steps
Step 1 - building model
• Organization in the building structure
• Layers and print sets
• Area styles and drawing types
• Textures for surfaces
Step 2 - general arrangement views
• Structuring and selecting drawing files
• References and view options
• Creating associative sections

Steps to Success

Basics

Step 3 - reinforcement
• Creating reinforcement with a 3D model
• Selecting drawing files for modifying data
• Using reinforcement again
• Managing reference drawing files
• 2D general arrangement and 3D reinforcement
Step 4 - layout output
• Assembling layouts
• Layout without model data
Step 5 - data exchange
• Exporting drawing files
• Exporting layouts
Appendix - working without links
• Organization in the building structure
• View options
• Copying and converting a part of the floor plan
• Using changed data of the floor plan
• Using reinforcement again
• Exchanging data

5

6

Importing the compressed project with the training data

Allplan 2021

Importing the compressed project with
the training data
We prepared a training project for you so that you can get started
immediately and create general arrangement drawings and
reinforcement drawings. Start by importing this training project into
Allplan 2021.
You can download the compressed project from Allplan Connect
(https://connect.allplan.com) on the internet. You can find the data in
the Training area. Go to Documentation - Step by Step.

To start Allplan and to import the training project
 Allplan 2021 must be installed, registered, and configured. After
having installed Allplan, start Allplan at least once to check
whether it works properly.
 You downloaded the compressed project from Allplan Connect
(https://connect.allplan.com) and saved it into a folder of your
choice.
1

Start

Allplan 2021. Click Open on the welcome screen.

Steps to Success

Basics

If you have turned off the welcome screen, click
Open Project... on the Quick Access Toolbar.

7

New Project,

2 Right-click in the empty area of the project list and select Import
compressed project on the shortcut menu.

8

Importing the compressed project with the training data

Allplan 2021

3 Select the downloaded ZIP file in the Open dialog box.
Note: You can also drag the downloaded ZIP file from File Explorer
into the area where the projects are listed in the New Project,
Open Project dialog box.
A project that you backed up to a ZIP file by using the Services
application can also be imported directly to Allplan by drag-anddrop editing.
4 You can see the New Project dialog box, where you can adjust
the Location and Project name. Click OK to confirm the dialog
box.
The imported project is selected.
5 Click OK to confirm the New Project, Open Project dialog box
and to open the project.
6 Click
Show/Hide ( View drop-down list on the Quick
Access Toolbar) and select the Color stands for pen option.

Steps to Success

Step 1: building model

9

Step 1: building model
Everything you need to consider when you create the
building model yourself is included in the training project.
If you want, you can immediately move on to step 2 (see
"Step 2: general arrangement views" on page 23).
The format properties are assigned to the components in
such a way that the floor plans are displayed in section
view. This way, you can use the model data for the
general arrangement drawing without having to create
an additional section of the floor plan.

10

Objective

Objective

Allplan 2021

Steps to Success

Step 1: building model

11

Organization in the building structure
So that all those involved in a construction project find their way
around, you always work with the building structure. Double-click in
the workspace to see the structure of the building model.

Structuring the model data
Create the structure of the model data on the left side of the Building
structure tab. Use the following levels:
• Building
• Story
• Construction stage
• Drawing files

Adding up model data
Tip: Use the Alt key to
temporarily show the
hidden menu bar. The menu
bar disappears again after
you have selected a tool.

So that you can animate and analyze the entire building model quickly
and easily, place references of the required model data in a single
XRef tool ( Edit drop-down list on the
drawing file. Use the
Quick Access Toolbar) to place the drawing files as advanced XRefs
with the following settings.

In this training project, all model data is in drawing file 105. Select this
drawing file by double-clicking it. Use F4 to display the entire model in
an additional viewport of the Animation view type.
Double-click its title to maximize this viewport. To restore the
previous size, double-click the title again.

12

Organization in the building structure

Allplan 2021

View drop-down list on the Quick Access Toolbar, point
Open the
Select Layer Print Set, and select the
to Layer Status, click
Entire model print set. As you can see, the finish specifications are no
longer visible.

Steps to Success

Step 1: building model

13

Open the
Repeat drop-down list on the Quick Access Toolbar,
Select Layer Print Set, and select the General arrangement
click
drawing print set. Only the unfinished structure with the insulation is
visible.

Finally, select the Reinforcement drawing print set. The insulation
has disappeared too.

14

Organization in the building structure

Allplan 2021

Note: As in this training project, you can use the drawing file with the
referenced model data as a source drawing file for a view or section
through the entire building.
To verify this, go to the "Derived from building structure" area on the
right side, open the shortcut menu of the view, and select Set
reference drawing files to edit mode.

Drawing files
Use the same range of drawing files for the same story in all projects.
Label the drawing files in such a way that you see at a glance what
they contain. This is particularly important for large projects, making
it easier for you to select the appropriate drawing file.
For example, "1000 B1_GF_S1_walls" could stand for walls from
construction Stage 1 on the Ground Floor in Building 1.

Steps to Success

Step 1: building model

15

Layers and print sets
The data for the general arrangement and reinforcement is in a single
drawing file. In Allplan you have various options to control what is
visible without having to switch drawing files.

Layers
You can assign a layer to each element. To change the layer status,
you can use the Layer dialog box (double-click the right mouse
button in the workspace) or the Layers palette. You can also use the
Modify Layer Status tool on the shortcut menu of an element.

16

Layers and print sets

Allplan 2021

Do not change the Auto-select layer with tool option, which is
selected by default. Otherwise, you need to reselect the layer
whenever you select a tool.

Steps to Success

Step 1: building model

17

Print sets
As described earlier, you can use print sets to define the visibility of
all layers in a single operation.
After you have defined a new print set on the Print Set tab, you
specify which layers are visible and which hidden. You can then use
these print sets to control what is visible - switch to the Select
Layer/Visibility tab, open the shortcut menu, and choose Match
visibility from print set....

If you have already defined print sets, you can create additional print
sets based on the existing ones. For example, turning the
Reinforcement, bottom layer print set into the Reinforcement, top
layer print set only takes a few mouse clicks.

To match the visibility of an existing print set
1

Click the Define, modify print set... button on the Print Set tab,
create the Training print set, and select it in the list box.

2 Click Match visibility from print set... on the shortcut menu and
select the Reinforcement, bottom layer print set in the dialog
box.

18

Layers and print sets

Allplan 2021

3 Hide the layers of the bottom layer and show the layers of the top
layer for Reinforcement drawing, Bar reinforcement, Mesh
reinforcement, and BAMTEC. You can do this quickly by selecting
the Spacebar.

4 Click OK to confirm.

Steps to Success

Step 1: building model

19

Area styles and drawing types
Use area styles for the components of the building model. By means
of area styles, you can create different layout types without any
additional drawing files or modifications.

The way area styles look changes with the drawing type.
Double-click in the workspace, open the Reinforcement of
residential building - First upper floor - walls structural levels on
the left side of the building structure, and double-click drawing file
1121.
Close the viewport with the animation, zoom in on the reinforcement
views, and select Reinforcement drawing for the drawing type on
the status bar.

20

Area styles and drawing types

Allplan 2021

The on-screen display changes in accordance with the
Reinforcement drawing print set.
Change the print set to General arrangement drawing and select
different drawing types. This changes not only the scope of elements
but also the way the elements look.

Finally, select the Scale definition drawing type so that the area
styles change with the scale.
Experiment with different scale settings. When you have finished,
change the reference scale back to 1:50.
Note: You can create additional area styles and drawing types in the
dialog box for layers. Open the Format Definition tab and click the
Manage line styles, area styles, drawing types... button.

Steps to Success

Step 1: building model

21

Textures for surfaces
Assign textures to the surfaces of the components of the building
model. Textures produce realistic images for presentation purposes.

You can also use textures for the views and sections to make them
Create bitmaps from
look more realistic. To do this, select the
textures, fills from colors option in the Surface elements area of
the Generate View or Generate Section palette. Note, however,
that this requires more computing power, especially with large
layouts.

22

Allplan 2021

Steps to Success

Step 2: general arrangement views

23

Step 2: general
arrangement views
As you created the building model with the building
structure, the components of the stories are in separate
drawing files each having different default planes. To
create the general arrangement drawings of the
components, select the drawing files with the associated
model data and create the required views and sections in
a new, empty drawing file by using the tools in the
Sections task area. You can find these tools on the
Actionbar.
This approach produces links. These links generate the
general arrangement views directly from the model data
of the building. As you do not need to copy the data of the
floor plan, the general arrangement data is always up to
date.

Objective

24

Structuring and selecting drawing files

Allplan 2021

Structuring and selecting drawing files
IFC export considers the left side of the building structure only. So
that you can also transfer the reinforcement model by means of the
IFC interface, create another building structural level with
subordinate story structural levels to which you assign the required
drawing files on the left side of the building structure.
To reduce the references, you create the general arrangement and
the reinforcement in a single drawing file. So that you can work
smoothly in a workgroup environment, use an additional drawing file
where you place an XRef of the model data of the building for the
current story.
This structure is already predefined in the training project.
Note: If you do not want to export IFC data, you can also create the
required folders for the components on the right side of the building
structure.
Make sure you select the appropriate drawing files when you create
the views and sections across drawing files. So that you do not
interrupt the workflow in a workgroup environment, load the model
drawing files only when you create or modify the views and sections.
When you work across drawing files, only the views and sections are
linked with the building model and reinforcement model. The model
data of the building or reinforcement is not linked with the views and
sections.
To make sure you select the correct drawing files when you create
the views and sections, double-click the required drawing file to open
only this drawing file and to make it current. Afterward, open the
other drawing files in edit mode.

To provide the model data for the beam
1

Click
Open on a Project-Specific Basis, go to the left side of
the Building structure, open the Reinforcement of residential
building – Basement - downstand beams structural levels, and
double-click drawing file 930.

2 Double-click in the workspace to open the Open on a projectspecific basis dialog box again.

Steps to Success

Step 2: general arrangement views

25

3 Open the First basement and Ground floor structural levels and
change the status of the drawing files 900, 903, and 1000 to
edit mode. This automatically selects the structural levels.

Note: This approach ensures that only the drawing files 900, 903,
and 1000 are selected for the model data of the beam.
4 Close the dialog box. Display everything by double-clicking the
middle mouse button in the workspace. Change the scale on the
status bar to 1:50.
5 Open the dialog box for layers, select the List layers used in open
documents option, and change all layers to
Hidden, frozen
except AR_C_LB, AR_WINSU, AR_COL_C, AR_SLAB, AR_BEAM,
and AR_PLANE.

26

Structuring and selecting drawing files

Allplan 2021

Note: The layer status is correct if the General arrangement print
set is still selected.

Steps to Success

Step 2: general arrangement views

27

References and view options
Allplan creates views and sections across drawing files, placing the
views and sections always in the current drawing file. If the 3D
models of the elements are not in the current drawing file, Allplan
creates links between the drawing files.
The following actions produce linked drawing files:
• Creating views and sections of model drawing files open in edit
mode
• Creating reinforcement in loaded views and sections
The
symbol indicates drawing files containing views and sections
that you created by using the tools in the Sections task area. You
can find these symbols in the third column of the dialog box for
selecting drawing files. These views and sections might be linked
with other drawing files. Allplan considers the model data in these
linked drawing files.
The
symbol indicates drawing files containing views and sections
that you created by using the shortcut menu in the “Derived from
building structure” area or that you created by using the tools in the
Sections task area and saved in these drawing files. You can find
these symbols in the third column of the dialog box for selecting
drawing files. These views and sections are usually linked with other
drawing files. Allplan considers the model data in these linked drawing
files.

To define view options
1

Click
Options ( Default Settings drop-down list on the
Quick Access Toolbar) and select Views.

2 Check the settings and click OK to confirm the dialog box.

28

References and view options

Allplan 2021

Note: Regardless of the setting of the Automatically transfer 3D
components to sections option, Allplan always transfers new 3D
components to views and sections that you create by using the
tools in the Sections task area.

Steps to Success

Step 2: general arrangement views

29

Creating associative sections
To reinforce the downstand beam, you need an elevation of the
downstand beam and a section at midspan.

To create the front elevation
Tip: Click
to collapse the
tree structure.
You can also open the Layer
dialog box by clicking
Expand at the bottom of
the Layers palette.

1

Open the
View drop-down list (Quick Access Toolbar), click
Select, Set Layers, and select the List entire layer hierarchy
option. Go to ARCHITECTURE – Design and switch the
DE_GEN03, DE_GEN04, DE_GEN05, and DE_GEN06 layers to
Modifiable. Go to ENGINEERING – Shell and change the
SH_GEN layer to
Current and the SH_SHL layer to
Modifiable.
Note: If the General arrangement print set is still selected, all you
Current.
need to do is make the SH_GEN layer

30

Creating associative sections

Allplan 2021

2 Go to the Actionbar, select the
Engineering role, open the tab
of the Reinforcement task, expand the Sections task area, and
Generate Section.
click

The Create Clipping Path palette opens so that you can define
the clipping path.
3 Select the Advanced method for Input. Do not change the other
settings.

4 Select view or section or enter first point: Click to the left of and
below the horizontal part of the lowered slab (see illustration).
5 To point: Click to the right of and above the horizontal part of the
lowered slab (see illustration). Select the Esc key to finish
entering the polyline.

Steps to Success

Step 2: general arrangement views

31

6 Select viewing direction: Define the viewing direction by clicking
below the circle. As a result, Allplan views the object from the
front when calculating the section.

The Generate Section palette opens; the section is attached to
the crosshairs. The label uses the layer in the Properties palette Format area. The view border is always on the DEFAULT layer,
regardless of this setting. The section object uses the layer that
you select for the Clipping lines in the Create Clipping Path
palette. The layers for the elements of the section come from the
3D components, or you can specify the layers when you define
the formats for edges, clipping lines, and finish elements on the
tabs.
7 Go to the Filter area of the palette and turn the Layer

Off.

The text on the button changes from Active to Set, which means
that the section uses the current layer setting.

32

Creating associative sections

Allplan 2021

8 Click the Set button to open the Layer filter dialog box. Select the
List layers used in open documents option and click OK to
confirm the dialog box.
Note: If you want to permanently use the elements of the current
layer setting for the section, select the User-defined layer
setting option. In this case, switch the layer of the reinforcing
Visible in the layer filter of the views and sections
bars to
before you create the reinforcement.

9 Do not change the other settings. Go to the Representation area
and click the Set button to the right of Formats.
The Formats palette opens; you can see the Edges tab.

Steps to Success

Step 2: general arrangement views

10 Check the Display edges area to make sure that the Visible
edges and Hidden edges options are selected. Define the
following format properties.
• Visible edges:
Select pen 0.35 mm; do not change the line or color; select
layer DE_GEN03
• Hidden edges:
Do not change the pen, line, or color; select layer DE_GEN04

33

34

Creating associative sections

Allplan 2021

11 Switch to the Clipping lines tab and define the following settings:
• Select the DE_GEN05 layer for the boundary lines.
• Select the Display section edges with a thick line option in
the Display section edges area. Select the Outer edges
option and the DE_GEN06 layer.
• Do not change the other settings.

12 Switch to the Finish elements tab and clear the Show floor
surfaces check box.
13 Close the palette to save the settings and to return to the
Generate Section palette.

Steps to Success

Step 2: general arrangement views

35

14 Check the Representation area to make sure that the Show
clipping path option is selected. Click the Set button to the right
of Label.
15 The Label palette opens. Enter the label for the section in the
Additional text box:
Beam elevation
Clear the Place section identifier check box.
16 Click the Set button to the right of Text parameters, define the
parameters for the label (text height and width of 3.5 mm), and
click OK to confirm the dialog box.

17 To point or angle of rotation: Place the section to the right of the
floor plan.

36

Creating associative sections

Allplan 2021

The next step is to create the cross-section based on the section
you just created.

To create the required section
 The Create Clipping Path palette is still open. If it isn’t, open this
Generate Section tool again.
palette by selecting the
Tip: The Observer
reference mode creates the
section so that horizontal
component edges are
parallel to the global x-axis.
In other words, horizontal
edges are always horizontal,
regardless of the viewing
direction.
In contrast, the folded
reference mode simply
folds the section.

1

In the Type area, you can switch between the Observer and
Folded reference modes. Observer is selected; do not change
this setting.

2 Go to the Clipping path area and change the Section identifier to
A. Click the Set button to the right of Representation.
3 The Clipping Path palette opens. Go to the Section identifier area
and click the Set button to the right of Text parameters. Enter
5.0 mm for the text height and 4.0 mm for the text width. Then,
click OK to confirm the dialog box.

4 Select the AR_SECT layer for the Clipping line. Click Close at the
bottom of the palette to save the settings and to return to the
Create Clipping Path palette.
5 Select view or section or enter first point: Click the view border of
the section you just created to define the clipping path within the
beam elevation.

Steps to Success

Step 2: general arrangement views

37

The Height from elements option is no longer visible. The height
that is perpendicular to the workspace comes from the beam
elevation clicked. As the viewing direction of the beam elevation
is not in the z-direction, the top level and bottom level of the new
section are defined by the clipping path that you enter.

6 First point of clipping path - second point: Click two diagonal
points at midspan in the beam elevation. Select ESC to finish
entering the polyline.
7 Select viewing direction: Define the viewing direction by clicking
to the right of the circle. As a result, Allplan views the 3D elements
from the right when calculating the section.
8 Go to the Representation area and turn off the Show clipping
path option. Click the Set button to the right of Label.
9 Select Section in the Additional text list box and select the Place
section identifier option.

38

Creating associative sections

Allplan 2021

Tip: Track tracing helps you
place points in exact
alignment with existing
points. You can select the
F11 key or click
in the
dialog line to turn track
tracing on and off.

10 To point or angle of rotation: Place the section so that it is to the
right of and aligned with the beam elevation.
The Create Clipping Path palette opens again. Allplan creates any
other clipping paths within the selected beam elevation until you
finish creating sections within a view or section by selecting ESC.
11 Select ESC twice to close the tool.

The next step is to reinforce the beam. For this purpose, you display
only the connections to the adjacent components.
The right support area at the inclined exterior wall is visible over the
full depth of the section. This is not useful for reinforcing the beam.
Therefore, adjust the clipping area of the beam elevation in the
model.

To adjust the front elevation and to add dimensions
1

Right-click in the workspace and select
shortcut menu.

Modify Offset on the

2 Click reference line: Click a horizontal line (for example, the
bottom of the lowered slab) in the beam elevation.
3 Click line: Click the bottom line delimiting the section object.
The dialog line shows the distance between the lines clicked.
4 Through point or offset: Click to define the point through which
the bottom line delimiting the section object is to pass or enter
the required value in the dialog line.

Steps to Success

Step 2: general arrangement views

39

5 Click line: Click the top line delimiting the section object and
modify the distance in the same way.

Tip: You can enter the
values for the Top level and
Bottom level of the section
when you define the clipping
path. To do this, clear the
Height from elements
check box.

6 Select ESC to close the tool.
7 Click

Repeat on the Quick Access Toolbar.

This opens the last tool you selected. In this example, it is
Modify Offset.
8 Modify the section object in the floor plan so that the section ends
just beside the beam.
For example, enter 0.01 in the dialog line so that the section does
not end with the beam edges. As a result, the adjacent slabs are
not visible.

Tip: You can use
Link
Dimension Lines to Views
to link nonassociative
dimension lines to views and
sections later.

Dimension Line (Quick Access task area) to add the
9 Use
dimensions of the beam to the beam elevation and the section.
Make sure that you create associative dimension lines. Open the
Properties and select the SH_SHL layer for the dimensionline elements.

40

Creating associative sections

Allplan 2021

Tip: To hide the section
objects in the floor plan, you
Modify
can use the
Clipping Path tool.

10 Right-click the view border of the beam elevation and select
Show Clipping Path on the shortcut menu.
11 Select section object: Click the modified section object in the
beam elevation or the floor plan.
Note: If you open the tool by using the shortcut menu of the
section object, you must click the section.
If you have inadvertently hidden the clipping path of section A-A
in the beam elevation or if you want to show the section object of
the beam elevation again, click the required clipping path in the
floor plan and then click the beam elevation.
12 Select ESC to close the tool. Make the DEFAULT layer current
again.
13

Move (shortcut menu or Edit task area) the labels of the
sections to make space for the reinforcement labels that you will
create later.

Steps to Success

Step 3: reinforcement

41

Step 3: reinforcement
After turning off the model data, you create part of the
reinforcement in the general arrangement views of the
downstand beam. So that you can use the drawing file
with the associated sections for both the general
arrangement drawing and the reinforcement drawing, it
is important that you place the reinforcement on layers.
If you create the general arrangement and reinforcement
in different drawing files, the reinforcement model is in
the current drawing file whereas the reinforcement is
always in the drawing file with the views and sections.

Objective

Note: The Concrete_reinforced.surf surface (transparency: 50%)
has been assigned to the concrete components so that the
reinforcement is displayed in the animation of the reinforcement
drawing. Alternatively, change the transparency setting of the
Concrete.surf surface and save it as a new surface. However, this
change applies to all the concrete components in the entire project.

42

Creating reinforcement with a 3D model

Allplan 2021

Creating reinforcement with a 3D model
Create the stirrup reinforcement and the longitudinal bars at the
bottom and top as part of the beam reinforcement.
This section does not show how to create the reinforcement for the
wall restraints, the starter bars for the slab, the web reinforcement,
or the reinforcement schemas because this would go beyond the
scope of this guide.

To create expanding stirrup reinforcement
 The Reinforce with 3D model option is selected in the
on the Reinforcement page.
 Actionbar:
1

Options

Engineering role - Reinforcement task.

Open the Layers palette, click
Select Layer Print Set in the
lower-right area of the palette, and select the Reinforcement
drawing print set. Select Reinforcement drawing for the drawing
type on the status bar.

2 Double-click in the workspace. Go to the Basement - downstand
beams structural level and double-click drawing file 930.
3 Zoom in on the beam elevation and the section. Check that the
scale on the status bar is 1:50.
4 Go to the Actionbar - Bar Reinforcement task area and click
Bar Shape. Open the Layers palette and select the BR_B
layer.
5 Switch to the Bar Shape palette and select the Stirrup, closed
bending shape in the list box at the top.

Steps to Success

Step 3: reinforcement

43

6 Go to the area with the parameters in the palette, switch the
diameter to 8 mm, clear the Same concrete covers check box,
and change Concrete cover 4 to 0.05.

7 The Expand to adapt to edges and Label options are selected in
the input options. Go to section A-A, point to the left component
line, wait until the bending shape expands, and click.

Label tool. Place the bar label with the
8 Use ESC to select the
mark number and diameter to the right of the bar.
The

Place Bar Shape tool starts automatically.

44

Creating reinforcement with a 3D model

Allplan 2021

9 Define the clear opening of the beam as the placing region by
clicking the points at the lower side of the beam in the elevation.
Select Align in the input options. The Label option is selected; do
not change this.
10 Enter 0.20 for the spacing and use ESC twice to close the tool and
Dimension Line, Label tool.
to select the

11 Select the Dimension line type in the list box at the top. Place the
dimension line and the label below the placement.
Define the label parameters; include the number of pieces and the
diameter.
12 Select ESC to finish creating the stirrup reinforcement.

Steps to Success

Step 3: reinforcement

45

Place 4 bars of diameter 16 with end hooks for the longitudinal
reinforcement at the bottom. The longitudinal reinforcement at the
top consists of 4 bars of diameter 12 that extend into the slab in the
area of the interior column.

To create longitudinal reinforcement at the bottom and
top
1

Open the
Repeat drop-down list, click
Bar Shape, and
select the Straight bar with hooks bending shape in the list box
at the top of the Bar Shape palette.

2 Go to the area with the parameters in the palette, switch the
diameter to 16 mm, and change the Concrete cover to 0.04.
3 Clear the Expand to adapt to edges check box in the input
options, click the end points at the bottom of the beam in the
elevation, and select ESC.

46

Creating reinforcement with a 3D model

Allplan 2021

4 Place the label with the mark number, number of pieces, and
diameter.
5 Click
Segment in the input options and click the stirrup
segment at the bottom in section A-A.
6 Enter 4 for the number of pieces and select ESC twice.

7 Select the Fan dimension-line type and place the label with the
mark number, number of pieces, and diameter.
The

Bar Shape tool is still open.

8 Select the Straight bar with anchorage bending shape in the Bar
Shape palette.
9 Go to the area with the parameters in the palette, switch the
diameter to 12 mm, change the Concrete cover to 0.06, and clear
the Hook at start and Hook at end check boxes.
10 Select Expand to adapt to edges in the input options, go to the
elevation, point to the component line at the top, wait until the
bending shape expands, and click.

Steps to Success

Step 3: reinforcement

11 Enter 0.18 for the Anchorage length at start and 1.25 for the
Anchorage length at end.

12 Label and place the longitudinal reinforcement at the top as
described for the longitudinal reinforcement at the bottom.
13 Select ESC to finish creating the longitudinal reinforcement.

47

48

Selecting drawing files for modifying data

Allplan 2021

Selecting drawing files for modifying data
To complement and modify the general arrangement and
reinforcement, you use the option to set the reference drawing files
to edit mode.

To select the drawing files for modifying data
1

To change the general arrangement in the existing views and
sections or to add more views and sections, open the dialog box
for selecting drawing files and right-click the drawing file with the
associative views and sections, that is, drawing file 930 in this
example.

2 Select List reference drawing files to check the existing links.
3 If everything is okay, open the shortcut menu of drawing file 930
again, click Set reference drawing files to edit mode, and Close
the dialog box for selecting drawing files.

4 To change the reinforcement in the existing views and sections
or to enter more reinforcement, you need to open only the
drawing file with the reinforcement model in edit mode. In this
example, only drawing file 930 must be open in edit mode. But if
you create the general arrangement and reinforcement in
different drawing files, double-click the drawing file with the
reinforcement model and then open the drawing file with the
views and sections in
edit mode.

Steps to Success

Step 3: reinforcement

49

Note: If you want to modify reinforcement in views and sections
and the model data of the reinforcement is not open in edit mode,
a message tells you which drawing files need to be open in edit
mode. By confirming this message, you can directly open the
required drawing files in edit mode without having to open the
dialog box for selecting drawing files.

50

Using reinforcement again

Allplan 2021

Using reinforcement again
A construction project often contains the same components with
identical or at least similar reinforcement for which you must create a
separate drawing. In this training project, each floor has the same
wall next to the interior stair.
The drawing file 920 of the Basement - walls and columns
structural level contains the associative sections and the
reinforcement model for the wall next to the interior stair in the first
basement. So that you do not need to re-create the general
arrangement and reinforcement for the ground floor, copy the
drawing file in the building structure, move the contents of the
drawing file, and adjust the linked model data afterward.

To copy the general arrangement and reinforcement
1

Double-click in the workspace and open the Basement - walls
and columns structural level on the left side of the building
structure. Open the shortcut menu of drawing file 920 and select
Copy.
Note: If you created the general arrangement and reinforcement
in different drawing files, you need to select both drawing files to
copy them. When you paste the drawing files afterward, Allplan
re-creates the contents of the drawing files in different drawing
files; the views and sections copied get links to themselves and to
the reinforcement model copied.

2 Open the shortcut menu of the Ground floor - walls structural
level and select Paste under.

Steps to Success

Step 3: reinforcement

51

3 A dialog box opens. Enter 1020 for Start at drawing file no. and
click OK to confirm.

This copies the contents of drawing file 920 including the drawing
file name to drawing file 1020. Allplan adjusts the link.
4 Rename drawing file 1020 Ground floor - wall - general
arrangement and reinforcement and double-click drawing file
1020.

To adjust the copied data
 Actionbar:
1

Engineering role - Reinforcement task.

Go to the Actionbar - Sections task area and click
Linked. Use CTRL+A to select everything.

Move

Note: If you created the general arrangement and reinforcement
in different drawing files, you need to select both drawing files to
move them. Otherwise, the representation and label of the
placement will be lost.
2 As the wall is congruent on the next floor, move everything by
2.95 m (= story height) in the z-direction.

52

Using reinforcement again

Allplan 2021

The representation of the general arrangement changes in the
wall elevation and section because the views and sections are still
linked with the original model data, but the reinforcement is now
on the next floor. The representation of the reinforcement and
the labels remain unchanged.

Modify
3 Go to the Actionbar - Sections task area and click
View, Section. Use CTRL+A again to select all sections. You can
also enclose the sections in a selection rectangle.
4 Click the button to the right of Drawing files in the Filter area of
the Modify Section palette.
5 You can see the Select drawing file dialog box. Click
Building
structure and then
Select drawing files currently loaded on
the toolbar at the top.
Only drawing file 1020 is selected in the building structure.
Therefore, the drawing files 900, 903, and 1000 will be closed
automatically.

Steps to Success

Step 3: reinforcement

53

6 Go to the Ground floor and First upper floor structural levels and
select the check boxes of drawing files 1000, 1003, and 1100.

7 Click OK to confirm the dialog box. This deletes the links to the
architectural data from the first basement and creates links to
the architectural data on the ground floor.
8 Click Apply and Close at the bottom of the palette to save the
changes and to close the tool.

54

Using reinforcement again

Allplan 2021

Alternatively, you can also use
ProjectPilot to copy the
associative sections and the reinforcement model. In this case, select
the required drawing files one after the other. Click No when
ProjectPilot asks whether you want to copy all linked drawing files
together.

If you created the general arrangement and reinforcement in
different drawing files, you need to copy both drawing files in a single
operation to create the appropriate links.
When you copy drawing files with views and sections by using the
Copy, Move Elements between Documents... tool or the
clipboard, the link to the original drawing file remains unchanged.
Consequently, you need to delete this link afterward as described in
this section and in "Managing reference drawing files (on page 55)".
But if you want to have the general arrangement and reinforcement
model in different drawing files afterward, use this approach.

Steps to Success

Step 3: reinforcement

55

Managing reference drawing files
If other drawing files are open in edit or reference mode while you
are creating views or sections and you do not close these drawing
files by using the drawing file filter, the views and sections get links
to these drawing files.
When creating views and sections, you can only link drawing files
that are selected when you open the tool. When modifying views and
sections, however, you can define any drawing file as a reference
drawing file. If you want to link or unlink a drawing file while creating
or modifying views and sections, click the button to the right of
Drawing files in the Filter area of the palette and turn the required
drawing file on or off in the Select drawing file dialog box.
As mentioned in the preceding section, the link to the original drawing
file remains unchanged when you copy drawing files with views and
sections by using the
Copy, Move Elements between
Documents... tool or the clipboard. Therefore, you need to delete this
link afterward.

To create and delete additional links
1

Open the dialog box for selecting drawing files. Open the shortcut
menu of drawing file 1020 and select List reference drawing files
to check the links.
As you can see, this drawing file has links to the drawing files
1000, 1003, 1100, and to itself.

56

Managing reference drawing files

Allplan 2021

2 Open the shortcut menu of drawing file 1020 again, select Set
reference drawing files to reference mode, and delete the
contents of the drawing file, but do not delete the name of the
drawing file.
3 Open the Basement - walls and columns structural level. Open
edit mode and click Close to close the
drawing file 920 in
dialog box.

4 Use the clipboard to copy the entire contents of drawing file 920
to drawing file 1020. To do this, select CTRL+A, then CTRL+C, and
finally CTRL+ALT+V.
5 Open the dialog box for selecting drawing files and close drawing
file 920.
6 Use
Move Linked to move everything by 2.95 m in the zdirection.

Steps to Success

Step 3: reinforcement

57

The views and sections still have the link to drawing file 920
because you copied them by using the clipboard. Therefore, the
wall elevation displays the mesh reinforcement of the basement.
In addition, Allplan has incremented the mark numbers of the
reinforcement.
7 Use
Modify View, Section to link all sections with the
Select
architectural data of the ground floor. To do this, click
drawing files currently loaded in the upper-right area of the
Select drawing file dialog box.

The drawing files with the appropriate architectural data are
already selected in reference mode in the building structure.
Therefore, you do not need to select any additional drawing files.
8 Right-click any reinforcement element, select
Rearrange
Marks on the shortcut menu, clear the Lock option, and click OK
to confirm the dialog box.

58

Reinforcement based on an auxiliary 3D object

Allplan 2021

Reinforcement based on an auxiliary 3D
object
This training project uses a balcony, which is a simple, cube-like solid.
If, however, you have a complicated component, which you do not
want to model in detail, only a 2D general arrangement drawing is
available to you for entering reinforcement.
If you enter the first reinforcement element in a 2D drawing, Allplan
cannot define the spatial orientation of the reinforcement. Therefore,
you must select an existing view. But there is no view because you
are about to create the first reinforcement element. So, you will use
an auxiliary 3D solid instead.
Place an auxiliary box with the maximum dimensions on top of the 2D
floor plan, create sections of this box, and place these sections on top
of the 2D sections.

To create an auxiliary solid for the 2D general
arrangement
1

Go to the building structure on the left side, open the
Reinforcement of residential building - Ground floor - precast
elements structural levels, and select drawing file 1050.

2 Open the dialog box or palette for layers, select the List layers
used in open documents option, and make all layers
Modifiable.
3 Use the
Box tool (Actionbar - Modeling task - 3D Objects
task area) to create a box of 2.60 x 2.35 x 0.33 m that is parallel to
the coordinate planes. These values (length x width x height) are
the maximum dimensions of the precast element without
Isokörbe.
• Check that the AR_GEN layer is current.
• To define the starting point, click the upper-left corner of the
precast element in plan view.
• To define the diagonal point, enter
0.33.

2.60,

-2.35, and

Steps to Success

Step 3: reinforcement

59

• Move the box by 2.60 m in the z-direction.

Repeat drop-down list and click
Generate
4 Open the
Section. You can see the Create Clipping Path palette. Go to the
Clipping path area and click the Set button to the right of
Representation.
5 You can see the Clipping Path palette. Select the Section
identifier in construction-line format option and click Close to
return to the Create Clipping Path palette.
6 In the Create Clipping Path palette, change the reference mode
to Folded and clear the Section object and Place clipping line
check boxes.

60

Reinforcement based on an auxiliary 3D object

Allplan 2021

7 Select the Height from elements option. Define the clipping area
so that it passes through the middle of the precast element and
extends to the left. Define the viewing direction by clicking to the
right of the circle.

8 Check the settings. Clear the Heading check box and place the
section so that it is congruent to the 2D section.
Tip: Instead of sections, you
can also create views of the
box.
Generate
To do this, use
View and define the viewing
direction from the front or
right.

9 Create another section through the lateral Isokörbe; define the
viewing direction from below.

Steps to Success

Step 3: reinforcement

61

10 Hide the SH_SHL layer for the dimensions and the SU_HATCH
layer for the hatching. Create two-way area reinforcement at the
bottom. Place 8-mm bars spaced at 15 cm.

11 Before you output the layout, hide the AR_GEN layer of the
auxiliary box to get the required reinforcement drawing.

62

Allplan 2021

Steps to Success

Step 4: layouts

63

Step 4: layouts
Create a layout for the interior wall in the first basement.
You created the general arrangement and reinforcement
in one drawing file. Consequently, the reinforcement
model is also in the layout even though you do not need it
for the layout. After you have placed the drawing file, you
need to cut it so that the layout no longer contains the
model data.
Note: Allplan always creates full schemas in the drawing
file with the reinforcement model. Therefore, you need to
place the drawing file with the reinforcement model in the
layout even if the general arrangement and
reinforcement are in different drawing files. If you
created all data in a single drawing file, you need to use
the following approach to create the general
arrangement drawings and reinforcement drawings
because the building model is also available.

64

Objective

Objective

Allplan 2021

Steps to Success

Step 4: layouts

65

Assembling layouts
To assemble the layout for the wall, you first define the page format
and border and then select the layout elements.

To define the page format and border
1

Select the Layout Editor task on the Actionbar.

2 Click
Open on a Project-Specific Basis (Quick Access
Toolbar).
3 Click layout 5, select the F2 key, enter Reinforcement of interior
wall, first basement for the name of the layout, and click Close to
confirm the dialog box.

4 Go to the Actionbar - Layout Editor task area and click
Up Page.

Set

66

Assembling layouts

Allplan 2021

Tip: With this setting for the
margins, Allplan always
places the page so that its
lower-left corner coincides
with the lower-left corner
of the printable area of the
printer selected in the
Print Layouts tool. This
ensures that the printout
includes all elements that
extend as far as the margins
of the page.

5 Define the format and its orientation in the Page area. In addition,
specify the type and size of the Margins.

6 Go to the Properties area, click the button next to Layout
border, and define the following parameters. Click Close to return
to the Set Up Page palette.

Steps to Success

Step 4: layouts

67

The layout border matches the size of the page. When you
change the page, the size of the layout border adapts
automatically.
Note: If you want to place a layout border of any size, use the
Layout Border tool (Layout Editor task area). You can use
this tool to define custom border sizes by means of the input
options.
7 Click the button next to Title block to define a layout legend or a
label style as a fixed property of the page.
Click Close to close the Set Up Page tool.

To place layout elements
1

Click

Layout Element (Layout Editor task area).

2 Click
Building structure on the Layout Element context
Building structure in the Select drawing file
toolbar and click
dialog box.

3 Select drawing file 920 and click OK to confirm the dialog box.

68

Assembling layouts

Allplan 2021

4 Click in the Layer/print set box and select Reinforcement
drawing for the drawing type. In addition, select the Print set,
current setting of selected print set (dynamic) and List layers
in layout element settings.
5 Select the Reinforcement drawing print set and click OK to
confirm the dialog box.

6 Place the selected drawing file in the layout so that the model
data is outside the layout border.
Move (Edit task area) the
layout element if this is necessary.
7 Select ESC to finish selecting layout elements.
8

Copy (Edit task area) the drawing files downward in
alignment.

9 Select ESC to close the tool and double-click the original drawing
file.

Steps to Success

Step 4: layouts

69

10 Select General arrangement drawing for both the drawing type
and the print set. Click OK to confirm the dialog box.

70

Layout without model data

Allplan 2021

Layout without model data
Elements that are outside the layout border are not included in
printouts. However, these elements appear in print preview. You can
use a layout section or layout window to hide the model data.

To create a layout section
1

Go to the Actionbar, expand the Crop Layout task area, and click
Convert Layout Section.

2 Select layout 6 and enter 50 for both the Scale and Ref LS
(reference layout scale).

3 Click an element of the layout border.
A message tells you that the section has been created.
Note: To create sections of smaller areas of the layout, use
Layout Border to place a layout border of the required size
and click this border. Thus, you can also cut large layouts into
smaller "sublayouts".
4 Click
area).

Load Layout Section or Layout (Crop Layout task

5 Click LayNam in the input options and select layout 6.
6 Move the entire layout so that the lower-left corner of the layout
border coincides with the lower-left corner of the page.
7 Click

Load Original Layout (Crop Layout task area).

Steps to Success

Step 4: layouts

71

To create a layout window
1

Go to the Actionbar - Layout Editor task area and click
Layout Window.

2 Click ... of layout elements already placed.

3 Select the layout element at the top (general arrangement
drawing).
Note: You must create two separate layout windows from the
general arrangement drawing and the reinforcement drawing
because Allplan automatically places all elements in the layout
window so that they are congruent.
4 To define the size of the layout window, click two diagonal points
(lower-left and upper-right points) so that the reinforcement
model is outside the layout window.

72

Layout without model data

Allplan 2021

5 Repeat this procedure for the layout element at the bottom
(reinforcement drawing).

6 Select ESC twice to finish entering the layout window and to
close the tool.

Steps to Success

Step 5: exchanging data

73

Step 5: exchanging data
You can exchange data both in document edit mode and
in layout edit mode. The export options vary depending
on the mode. When importing data, make sure you select
the correct layout scale.

74

Layout without model data

Allplan 2021

DWG export of drawing files
You do not need to export the model data unless it is part of the
general arrangement drawings and reinforcement drawings. Change
the settings in the options for the interfaces so that you can select
only the associative views and sections.
To do this, click
Options ( Default Settings drop-down list on
the Quick Access Toolbar) and select Import and export. Select the
Export part check box.

Basically, the elements that are visible on the screen should be the
elements that you want to transfer. Go to the Transfer mode area of
the configuration settings and specify that you want to transfer the
Currently visible data as 2D elements.

Note: If you do not want to transfer the view borders of the
associative views and sections, open the Advanced Settings tab and
make sure the not printable elements entry is not selected in the
Transfer elements area.

Steps to Success

Step 5: exchanging data

75

To transfer the data of the associative views and sections, you do
not need to load the drawing files with the model data. As with
layouts, you need to load the drawing file with the reinforcement
model because this drawing file contains the full schemas.
1

Double-click in the workspace. Go to the Basement - walls and
columns structural level and double-click drawing file 920.
Note: If you created the general arrangement and reinforcement
in different drawing files, open the drawing file with the
reinforcement model in
edit or
reference mode.
Alternatively, open the shortcut menu of the drawing file with the
associative views and sections and select Set reference drawing
files to reference mode so that you do not interrupt the
workflow in a workgroup environment.

Allplan icon, point to Export,
2 Open the drop-down list of the
and click Export AutoCAD Data...
Click Yes if the drawing file with the reinforcement model is open
in reinforcement mode.
Note: If the drawing files
contain layers that are
visible, frozen, you can
choose to export them too.

3 Select the associative views and sections, define the settings for
the export, and export the data.

76

Layout without model data

Allplan 2021

DWG export of layouts
When exporting layouts, make sure all the layers that are visible in
Modifiable. Otherwise, you get layers
the layout elements are
without access rights when you import the data.
Go to the Transfer mode area (General Settings tab) of the
configuration settings and specify that you want to transfer the
Currently visible data as 2D elements. Open the Advanced Settings
tab and select the Layouts / XRef files option in the Explode
compounds area.

Steps to Success

Appendix: working without links

77

Appendix: working
without links
If you do not need a building model that is always up to
date, you can work without links. To create the general
arrangement drawings and reinforcement drawings of
the components, copy and convert the required part of
the floor plan to a new, empty drawing file and create the
required sections by means of the tools in the Sections
task area.
This approach not only produces versions of the general
arrangement data and reinforcement data but also
ensures that no user changes the building model
inadvertently.
This approach is also useful if a lot of linked drawing files
in a complex project slow down your computer. You can
even work with and without links in one and the same
project.

78

Organization in the building structure

Allplan 2021

Organization in the building structure
If you want to use this approach, you need to make only some
changes to the contents of the building structural levels for the
general arrangement and reinforcement. Create a drawing file under
each building structural level required and create the data of the
components in this drawing file.
This training project comes with the required structure for the first
and second upper floors.

Note: FC export considers the left side of the building structure only.
If you do not want to use the IFC interface to transfer the general
arrangement and reinforcement data, you can also create the
required folders for the components on the right side of the building
structure.

Steps to Success

Appendix: working without links

79

Defining view options
The settings in the options are the same, regardless of whether you
work with or without linked drawing files. You do not produce linked
drawing files as long as you create everything in the same drawing
file.
Make sure that you do not link drawing files inadvertently by copying
or moving data.

To check the options
1

Click

Options and then Views.

2 Check the settings. The Transfer 3D components automatically
to sections option applies only to views and sections of the
Reinforcement Views task area.

80

Copying and converting a part of the floor plan

Allplan 2021

Copying and converting a part of the floor
plan
By copying the model data, you make sure that all users in a
workgroup environment can work smoothly without interruption.
Check and update the building data before you create the final layout.

To copy and convert the model data for the exterior
wall
1

Double-click in the workspace. Go to the left side of the Building
structure, open the Residential building - First upper floor
structural levels, and double-click drawing file 1100.

2 Double-click in the workspace again. Open the Second upper
floor structural level and change the status of the drawing files
1103 and 1200 to
edit mode. This automatically selects the
Second upper floor structural level.
3 Close the dialog box and select the General arrangement
drawing layer print set.
4 Go to the Change task area, open the flyout menu of the
Convert Elements tool, click
Copy, Convert Elements
Across Drawing Files, and select the Architecture, U-D Element
to 3D solids conversion mode.

5 You can see the Select destination drawing file dialog box. Click
Building structure, go to the Reinforcement of residential
building – First upper floor - walls structural levels, select the
check box of drawing file 1120, and click OK to confirm the dialog
box.

Steps to Success

Appendix: working without links

81

6 Select elements to copy and convert: Enclose the lower-right
exterior wall in a selection rectangle that you open from right to
left. Make sure that the slab above the balcony is not selected
( Select Elements based on Direction is selected in the Work
Environment task area; the selection rectangle is shown as
dashed lines, and the area it covers is highlighted in light green).

7 Double-click drawing file 1120 and change the scale on the status
bar to 1:50.
8 Select SH_GEN for the current layer. Use the
Generate
Section tool to create a section of the lower exterior wall. Select
the Observer reference mode and define the viewing direction
from below.
• Change the Section identifier to A and select the Height from
elements option. Define the clipping area in the floor plan so
that the lower end of the section is within the thermal
insulation.
• Open the Label palette, enter Wall elevation for the heading,
clear the Place section identifier check box, and place the
section next to the floor plan.
9 Create another section through the wall and a section of the floor
plan.

82

Copying and converting a part of the floor plan

Allplan 2021

10 Adjust the extent of the section object of section 1 - 1 so that the
thermal insulation is completely visible. Move the headings and
use
Dimension Line to create the associative dimensions on
the SH_SHL layer.

Steps to Success

Appendix: working without links

83

Using changed model data
If you create empty views and sections by deleting the model data,
the view borders and clipping paths remain unchanged.
Consequently, you can simply delete the model data, regardless of
whether the views and sections contain only general arrangement
data or also reinforcement data.
Tip: If you want to keep the model data for the time being so that you
can check everything, assign a new layer to the entire floor plan.
Make sure this layer has not yet been used in the drawing file. Then
copy the changed model data and delete the original floor plan
afterward.

To use changed model data
 Drawing file 1120 is open. The General arrangement drawing
print set is selected.
1

Switch the AR_SECT layer to
Visible, frozen so that you do
not delete the clipping paths together with the floor plan.

2 Select the entire floor plan and click
Edit task area).

Delete (shortcut menu or

Note: You can also use
Filter Step by Step (in the Filter task
area) to filter specific elements. For example, you can use
Filter by Layer to filter the model data of the building again by
Apply to all elements, new filter if the clipping paths
clicking
are on the DEFAULT layer.

84

Using changed model data

Allplan 2021

3 Open the dialog box for selecting drawing files and turn off the
First upper floor - walls structural level in the Reinforcement of
residential building structural level. Select the Residential
building structural level and the First upper floor and Second
upper floor structural levels.
4 Use
Copy and Convert Elements across Drawing Files to
copy and convert the model data for the exterior wall in drawing
files 1100, 1103, and 1200 to drawing file 1120. Follow the steps
described in "Copying and converting a part of the floor plan".
A message tells you that the selected drawing file is in use. Click
Yes to confirm.
5 Switch back to drawing file 1120.
The associative sections automatically contain the copied model
data.
6 Make the AR_SECT layer
associative dimensions.

Modifiable and create the

Steps to Success

Appendix: working without links

85

Using reinforcement again
You can find the reinforced wall next to the interior stair on the first
upper floor in drawing file 1121 in the training project.
The process of using reinforcement again is similar to using changed
model data.

To use the wall reinforcement of the first upper floor
for the second upper floor
1

Open drawing file 1121 and close all the other drawing files. Check
the reinforcement by selecting the Reinforcement drawing print
set.

2 Double-click in the workspace to open the dialog box for
selecting drawing files. As described in step 3 (see "Using
reinforcement again" on page 50), open the shortcut menu of
drawing file 1121 and Copy the entire contents of the drawing file
to drawing file 1221. To insert the contents, open the shortcut
menu of the Second upper floor - walls structural level and
select Paste under.
3 Rename drawing file 1221 Second upper floor - interior walls and
double-click drawing file 1221.
4 Go to the Actionbar - Sections task area and click
Move
Linked. Use CTRL+A to move the entire floor plan with the model
data of the building and the reinforcement model so that the
reinforcement model is in the correct position for the new
component that you want to reinforce. In this example, the wall is
congruent on the next floor. Therefore, move the floor plan by
2.95 m (= story height) in the z-direction.

86

Using reinforcement again

Allplan 2021

5 Select the General arrangement drawing print set, switch the
AR_SECT layer to
Visible, frozen, and delete the model data
of the building from the floor plan as described.

In this case, you do not create empty sections by deleting the
model data. Therefore, the associative dimensions remain
unchanged.
6 Go to the left side of the building structure and select drawing file
1200 in the Second upper floor structural level.

Steps to Success

Appendix: working without links

87

7 Use
Copy, Convert Elements Across Drawing Files to copy
and convert the model data for the wall next to the interior stair
to drawing file 1221.
A message tells you that the selected drawing file is in use. Click
Yes to confirm.
8 Switch back to drawing file 1221 and select the All layers visible
print set.
The associative sections automatically contain the copied model
data.
9 Adjust the associative dimensions of the sections and select the
Reinforcement drawing print set.
10 Delete the L-shaped bar. Select
Stretch Entities and shorten
the meshes by 30 cm and the longitudinal bars by 40 cm. Use
direct object modification or the Properties palette to enlarge
Bar Shape and
the placing regions of the stirrups. Select
create a new open stirrup at the top and additional cross bars.
Then rearrange the reinforcement.
The result might look like this:

88

Data exchange

Allplan 2021

Data exchange
When working without drawing file references, you can export
drawing files as described (see step 5 (see "Step 5: exchanging data"
on page 73)). As the model data and the views and sections are in a
single drawing file, you do not need to select additional drawing files.
So that you can only select the associative views and sections, make
Options.
sure the corresponding setting is selected in the
If you have created a section of the floor plan and you want to place
the data imported in the correct position in the building model, move
the section of the floor plan and all the associated sections by fixed
x/y values, which are based on the building model. Then enter these
values (make sure that you use the opposite sign) for the additional
offset in the export file.

Steps to Success

Index

89

Index
A
approaches 3
working in a drawing file 78,
79, 80, 83, 85
working with references 24,
27, 29, 42, 48, 55
assembling layouts 65
associative sections
creating 29
delete model data 83
dimensioning later 83
from section 36
hidden edges 29
inserting data 83
label 29, 36
layer filter 29
of floor plan 80
of model data 29
reference mode 29
removing data 55
settings 29
visible edges 29
auxiliary 3D object for
reinforcement 58
available task areas 3

B
bar shape entry 42

C
copying and converting elements
80
copying elements between
documents
floor plan 80
reinforcement without
associations 85
when working with
associations 50

D

data exchange
of drawing files with
references 73
of drawing files without
references 88
of layouts 73

F
floor plan without references 80
using changed model data 83

G
general arrangement views
without references 80
copying and converting floor
plan 80
using changed model data 83
view options 79

I
import compressed project 6

L
layer filter 29
layers 15
layout output 63
layout without model data 70

M
move label 38

O
option settings 27, 73, 79
organization of model data 9
area styles 19
building structure 11
drawing types 19
layers 15
print sets 15
textures for surfaces 21

P

90

Index
print sets 15
matching visibility 15
selecting 42, 65

R
reference mode 29
reinforcement
in 2D 58
in associative section 42
retrieving 50, 85
using changed model data 83
reusability
when working in a drawing file
85
when working with
associations 50

S
Schnittführung
creating 29
display 38
modify 38
section from section or view 36
section settings 29
selecting drawing files 24, 42, 48

T
training project
import 6

U
using changed model data
for general arrangement
drawing 83
for reinforcement drawing 83

V
view options 27, 79

W
working with associations
data exchange 73
managing reference drawing
files 55
organization in the building
structure 24
references 27

Allplan 2021
reusability 50
selecting drawing files 24, 42,
48


---
title: "Allplan 2022 ArchitectureTutl"
category: User_Guides
source: Allplan_2022_ArchitectureTutl.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2022
Architecture Tutorial

Architecture Tutorial

This documentation has been produced with the utmost care.
ALLPLAN GmbH and the program authors have no liability to the purchaser
or any other entity, with respect to any liability, loss, or damage caused,
directly or indirectly by this software and its documentation, including but not
limited to, any interruptions of service, loss of business, anticipatory profits,
or consequential damages resulting from the use or operation of this
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
1st edition, October 2021
Document no. 220eng01m02-1-BM1021

Architecture Tutorial

Contents

i

Contents
Welcome ............................................................................................. 1
Introduction .................................................................................................................... 2
Sources of information............................................................................................ 3
Further help .............................................................................................................................3

Training, coaching, and project support ........................................................ 5
Feedback on the documentation ...................................................................... 6

Unit 1: basics ..................................................................................... 7
Exercise 1: starting Allplan and importing the project .......................... 9
launching Allplan and importing the compressed project ............................9

Basic settings ...............................................................................................................12
To make settings on the Actionbar.........................................................................12
Track tracing ........................................................................................................................13

How to.............................................................................................................................. 15
What if … ..................................................................................................................................15
And what if ... .........................................................................................................................15

Unit 2: building design ................................................................ 17
Exercise 2: ground floor ........................................................................................ 18
Settings........................................................................................................................... 19
Walls ................................................................................................................................. 23
General information ........................................................................................................23
Component axis ................................................................................................................25
Offset direction of components, single-layer walls.....................................26

ii

Contents

Allplan 2022

Designing walls ..................................................................................................................28
Straight exterior walls ...................................................................................................28
Curved walls ........................................................................................................................36
Turning layers on and off ............................................................................................ 44
Interior walls ....................................................................................................................... 48
Reference point for entering architectural elements ................................. 52

A note on multilayer walls ................................................................................... 53
Offset direction of components, multilayer walls .........................................54
Priority rating with multilayer exterior walls ................................................... 57
Priority rating at T-connections ..............................................................................58
Multilayer walls with different height settings ...............................................59
Window openings and door openings in multilayer walls .........................60
For example: a multilayer wall; each layer of a different height............. 61

A note on views and viewports....................................................................... 64
Tools for displaying the model ..................................................................................64
How to use viewports: detailed view and full view.......................................68

Axis grid...........................................................................................................................72
Columns ......................................................................................................................... 83
Openings........................................................................................................................ 89
Doors........................................................................................................................................89
Windows ................................................................................................................................96

Chimney ....................................................................................................................... 124
Checking the design ............................................................................................. 130
Completing the design ........................................................................................ 138
Carports ...............................................................................................................................139
Furniture ..............................................................................................................................143

Dimensions and labels ......................................................................................... 146
Dimensioning walls ........................................................................................................146
Sill height ..............................................................................................................................149

Stair outline ................................................................................................................ 154

Architecture Tutorial

Contents

iii

Slab ................................................................................................................................. 155
Saving component properties as favorite files ............................................159
Entering the outline of the slab with the polyline entry tools ...............160
Carport roofs.....................................................................................................................164
Slab openings .................................................................................................................... 167

Exercise 3: top floor...............................................................................................170
Objective..............................................................................................................................170
Modifying the top floor ................................................................................................ 174

Exercise 4: basement .......................................................................................... 199

Unit 3: planes ............................................................................. 205
Using planes ..............................................................................................................207
Default planes .................................................................................................................. 207
Custom planes .................................................................................................................209
Reference surfaces ........................................................................................................211
Offset planes .....................................................................................................................213

Exercise 5: roof ....................................................................................................... 214
Roof frame ..........................................................................................................................215
Modifying the roof frame ........................................................................................... 221
Roof covering ..................................................................................................................222
Joining walls with the roof.........................................................................................226
Modifying the height of the chimney .................................................................234
Using a masking plane for the top floor ............................................................238

Exercise 6: reference surfaces .................................................................... 245
To define reference surfaces ................................................................................ 248
Adapting the columns .................................................................................................254

iv

Contents

Allplan 2022

Unit 4: stair .................................................................................. 257
Exercise 7: u-type stair ..................................................................................... 260
Modifying the stair geometry ................................................................................ 262
Defining stair components .......................................................................................263
Creating a section in plan ..........................................................................................269

Unit 5: SmartParts .................................................................. 273
Exercise 8: modeling a window SmartPart ........................................... 275
Saving the SmartPart ..................................................................................................281
Replacing SmartParts..................................................................................................281
Modifying SmartParts ................................................................................................283
library palette ...................................................................................................................286

Unit 6: sections and views .................................................... 291
Exercise 9: Sections ............................................................................................ 292
Calculating sections ..................................................................................................... 297
Editing sections................................................................................................................315

Exercise 10: views .................................................................................................. 319

Unit 7: area calculations and quantity takeoff ........... 325
Exercise 11: rooms, finish, and floor area ................................................. 326
Important notes on defining rooms ....................................................................326
Defining rooms one by one ...................................................................................... 327
Creating rooms automatically ...............................................................................336
Finish specifications ..................................................................................................... 337
Area calculations according to residential space ordinance ................350

Architecture Tutorial

Contents

v

Exercise 12: quantity takeoff ......................................................................... 362
Reports ................................................................................................................................362
Entering search criteria.............................................................................................. 372
Building lists .......................................................................................................................375

Unit 8: layouts ........................................................................... 385
Requirement for printing .................................................................................. 385
Printing the screen contents ................................................................................. 385

Exercise 13: custom title block ...................................................................... 387
Title block as a label style ..........................................................................................392
Printing layouts .............................................................................................................. 398
Layout editor....................................................................................................................399
Printing the layout........................................................................................................ 408
Layout windows...............................................................................................................411

Unit 9: visualization .................................................................. 415
The visualization task .......................................................................................... 416
The task areas ..................................................................................................................416

Exercise 14: displaying the entire model in animation ..................... 418
How to create animations ........................................................................................ 418
Animation window .........................................................................................................419
Mouse movement in sphere mode and camera mode ........................... 424

Exercise 15: lights and surfaces ................................................................... 426
Light .......................................................................................................................................426
Surfaces ............................................................................................................................. 428

Exercise 16: rendering ........................................................................................ 432
Exercise 17: camera path, AVI movie ........................................................ 437
Recording an AVI movie............................................................................................ 444

vi

Contents

Allplan 2022

Appendix ....................................................................................... 451
Project organization ............................................................................................ 452
Managing data with ProjectPilot ..........................................................................452

Understanding drawing files .......................................................................... 457
Drawing file status ....................................................................................................... 458
Information about the active drawing file ...................................................... 460

Using layers ............................................................................................................... 461
Understanding layers ...................................................................................................461
Defining the current layer..........................................................................................461
Defining the format properties of layers.........................................................463
Layer access rights ..................................................................................................... 464
Setting layer visibility in drawing files ...............................................................465
Managing layers and layer structures ..............................................................466
Advantages of data organization with layers ..............................................466
Relationship between layers and drawing files ........................................... 467
Using privilege sets ..................................................................................................... 468
Using print sets .............................................................................................................. 468

Creating the training project .......................................................................... 469
Selecting the scale and unit of length ................................................................ 472
Building structure ..........................................................................................................474
Tips on project organization................................................................................... 485
Selecting layers ............................................................................................................. 485

Actionbar Configuration .................................................................................... 491
Contents and structure of the Actionbar........................................................492

Palette window ......................................................................................................495
Properties palette .........................................................................................................496
Wizards palette............................................................................................................... 497
library palette .................................................................................................................. 498
objects palette ................................................................................................................499
Planes palette ................................................................................................................. 500

Architecture Tutorial

Contents

vii

Issue Manager palette ................................................................................................502
Connect palette ............................................................................................................. 503
Layers palette ................................................................................................................ 504

Compressed projects on the internet...................................................... 505
Downloading compressed projects................................................................... 506

A note on organizing projects only with the default layer........... 507
Drawing file organization without layers......................................................... 507

Overview of tools .................................................................................................. 512
Viewports ............................................................................................................................512
Height dialog box ............................................................................................................513

Index ............................................................................................... 515

viii

Contents

Allplan 2022

Architecture Tutorial

Welcome

1

Welcome
Welcome to Allplan 2022, the high-performance CAD
program for architects.
In this tutorial workbook, you will learn about the most
important tools in Allplan 2022.
You will find that within a short time you will be in a
position to use Allplan 2022 effectively in your daily work.
This chapter covers the following:
 Contents of this tutorial
 Documentation for Allplan 2022
 Additional help on Allplan 2022
 Where to turn for training, coaching, and project
support

2

Introduction

Allplan 2022

Introduction
The Architecture Tutorial expands on the Basics Tutorial. Based on
six examples, the Basics Tutorial explains the principles of drafting
and designing in 2D. In addition, you learn how to get started in 3D
modeling.
The aim of the Architecture Tutorial is to guide you with easy-tofollow steps from planning a residential building through designing it
in 3D to analyzing the building data. The Architecture Tutorial
consists of 17 exercises in 9 units.
This tutorial will provide you with a sound introduction to Allplan
2022. As this tutorial only touches on the possibilities of some of the
tools, please consult – especially later when you use Allplan 2022 –
the F1 Help as an important source of information.
You can download two compressed projects from Allplan Connect:
• A project with the structures and settings (but not the design!)
used in this tutorial.
• A project with the data used in this tutorial so that you can
compare your result with the data provided.
To find out how to install the project, see "Exercise 1: starting Allplan
and importing the project (on page 9)". To find out how to download
the projects from the internet, see "Compressed projects on the
internet (on page 505)" in the appendix.
This tutorial assumes that you have a working knowledge of
Microsoft® Windows® programs. Basic CAD knowledge is helpful;
however, this tutorial will provide both the experienced CAD user
and the newcomer to CAD with a solid foundation in the methods
used by Allplan 2022.
We would like to express our gratitude to the AIC architectural
practice in Schöneich for providing us with one of their projects for
this tutorial.

Architecture Tutorial

Welcome

3

Sources of information
The documentation on Allplan consists of the following parts:
• The Help is the main source of information for learning about and
using Allplan.
While Allplan is running, you can get Help on the current tool by
What’s This in the
Help
selecting F1. You can also select
drop-down list (right side of the title bar) or use the Shift+F1
keyboard shortcut and click the icon on which you need Help.
• The Manual consists of two parts. The first part shows how to
install Allplan. The second part provides an overview of basic
concepts and basic terms in Allplan as well as showing you how to
make entries in Allplan.
• The Basics Tutorial guides you step by step through the most
important tools for designing and modifying elements in Allplan.
• The Architecture Tutorial guides you step by step through the
process of designing a building, analyzing the building data in
reports, and printing the results.
• The Engineering Tutorial guides you step by step through the
process of creating and printing key plans, general arrangement
drawings, and reinforcement drawings.
• The New Features in Allplan 2022 guide provides information
about what's new in the latest version.
• Each volume in the Step-by-Step series deals with a specific
concept or series of tools or tasks in Allplan, deepening the
knowledge and understanding of this special subject. The areas
covered include data exchange, system administration, geodesy,
presentation, 3D modeling, and so on. Serviceplus members can
download these guides as PDF files from the Training Documentation area of Allplan Connect
(https://connect.allplan.com/).
• You can also find numerous publications on social networks.

4

Sources of information

Allplan 2022

Further help
Tips for Efficient Usage
The
Help drop-down list (right side of the title bar) provides Tips
for Efficient Usage. You can find practical tips and tricks showing
you how to use Allplan efficiently and how to carry out everything
with ease.

Hello Allplan!
Hello Allplan! shows how to get started with Allplan. Go to the Hello
Allplan! website (https://www.allplan.com/hello-allplan/), where
you can find more information, a project that you can import into
Allplan, and videos that complement the Hello Allplan! tutorial.

User forum (for Serviceplus customers)
Allplan forum in Allplan Connect: Users exchange information,
valuable tips relating to everyday work, and advice on specific tasks.
Register now at
connect.allplan.com

On the internet: Solutions to frequently asked questions
You can find solutions to numerous questions answered by
Technical Support in the comprehensive knowledge database at
https://connect.allplan.com/support/solutions.html

Feedback on the Help
If you have suggestions or questions on the Help, or if you come
across an error, send an email to:
dokumentation@allplan.com

Architecture Tutorial

Welcome

5

Training, coaching, and project support
The type of training you are given is a decisive factor in the amount
of time you actually spend working on your own projects: A
professional introduction to the programs and advanced seminars
for advanced users can save you up to 35% of your editing time!
A tailor-made training strategy is essential. Our authorized seminar
centers offer an extensive range of programs and are happy to
work out a custom solution with you that will address your own
needs and requirements:
• Our sophisticated, comprehensive seminar program is the
quickest way for professional users to learn how to use the new
system.
• Special seminars are designed for users who want to extend
and optimize their knowledge.
• One-on-one seminars are best when it comes to addressing
your own particular methods of working.
• One-day crash courses, designed for office heads, convey the
essentials in a compact format.
• We are also happy to hold seminars on your premises: These
include not only Allplan issues but also analyses, process
optimization, and project organization.
To get more detailed information about the current training program,
visit our website (https://www.allplan.com/training) and consult
our online seminar guide, where you can find both face-to-face
training and online training.

6

Feedback on the documentation

Allplan 2022

Feedback on the documentation
We are always trying to improve the overall quality of our program
documentation. Your comments and suggestions are important to
us, and we welcome feedback.
Please do not hesitate to contact us to express criticism or praise
concerning the documentation. Feel free to contact us as follows:
Documentation
ALLPLAN GmbH
Konrad-Zuse-Platz 1
81829 Munich, Germany
Email: dokumentation@allplan.com

Architecture Tutorial

Unit 1: basics

7

Unit 1: basics
In this unit, you will start Allplan, import the compressed
project with the data for the exercises, and make a few
basic settings.
The compressed Allplan 2022 Architecture Tutorial
project, which you can download from Allplan Connect,
comes with a building structure consisting of structural
levels and assigned drawing files. In addition, there are
predefined objects derived from the building structure,
such as views, sections, and reports. The project contains
four print sets. With these print sets, you control which
layers are visible. You will use these print sets in various
places while working on the project.
After having imported the compressed project, you can
open it and start designing the building at once without
any preparation.
If you want to create the project along with the building
structure and print sets yourself, you can find a detailed
description of the necessary steps in the appendix (on
page 451) to this tutorial. The appendix also provides
information about various interesting topics, such as
layers, ProjectPilot, Actionbar configuration, building
structure, and many more.
If you do not want to work through the entire tutorial
step by step, you can download the compressed Allplan
2022 Architecture Tutorial (with model) project from
Allplan Connect, import it to Allplan, and use it for
comparison. This project contains all drawing files with
the complete design as well as objects derived from the

8

Feedback on the documentation

Allplan 2022

building structure, such as views, sections, and various
reports.
Look in the appendix for information about how to
download projects; see "Compressed projects on the
internet (on page 505)".
At the end of this unit, you will find a short
troubleshooting section that you might find helpful.

Architecture Tutorial

Unit 1: basics

9

Exercise 1: starting Allplan and importing
the project
launching Allplan and importing the compressed project
After you have installed Allplan 2022 on your computer and
configured it to run, you can now import the compressed projects
Tutorial Architecture (with or without model) into Allplan.

To start Allplan and import compressed projects
 Allplan 2022 must be installed, registered, and configured to run.
To do this, you must start Allplan at least once after installation
and check that it functions.
 You have downloaded the projects Allplan 2022 Tutorial
Architecture from Allplan Connect to a folder of your choice.
1

Go to the Windows Start menu, open the Allplan folder, and click
Allplan 2022.
Or
Double-click the desktop icon

Allplan 2022.

2 After you have started Allplan 2022, click Open on the welcome
screen.

10

Exercise 1: starting Allplan and importing the project

If you have turned off the welcome screen, click
Open Project... on the Quick Access Toolbar.
3 In the following dialog box, click

Import Project.

Allplan 2022

New Project,

Architecture Tutorial

Unit 1: basics

11

4 Then select the downloaded ZIP file in the Import Project dialog
box and confirm the dialog box with OK.

Note: The downloaded ZIP file can also be dragged and dropped
from Windows Explorer into the project selection in the New
project, open project dialog box or imported via the shortcut
menu in the project selection area. In this case, you can adjust the
location and name of the project if necessary.
The imported project is selected.
5 Click OK to confirm the New Project, Open Project dialog box
and to open the project.
The data of the imported project will be converted if necessary.

12

Basic settings

Allplan 2022

Basic settings
To make settings on the Actionbar
The Actionbar configuration is the default setting in Allplan 2022.
When you work with this configuration, you can find the Actionbar
above the workspace. In addition, you can see the Properties,
Wizards, Library, Objects, Planes, Issue Manager, Connect, and
Layers palettes on the left side.
Note: You can find detailed information about the Actionbar
configuration in the appendix (see "Actionbar Configuration" on page
491) to this tutorial and in the Help for Allplan 2022.
You will use the tools in the Components task area for the first
exercises. Start by making settings on the Actionbar.

To make settings on the Actionbar for the following
exercises
1

Select the Architecture role.

2 Open the tab of the Elements task.
3 The Components task area has not been expanded yet. Expand
this task area so that you can access its tools quickly.
To expand the task area, double-click within the name line of the
task area.

Note: You can expand or collapse all task areas of the task
currently selected by selecting and holding the Ctrl key while
double-clicking within the name line of a task area. You can
expand or collapse all areas across tasks and roles by selecting
and holding Ctrl+Shift while double-clicking within the name line
of a task area.

Architecture Tutorial

Unit 1: basics

13

How many task panes are displayed expanded depends on the
width of your Allplan window. If the window is not wide enough,
Allplan expands as many task areas as possible, starting on the
left side.
Note: The Actionbar is docked to the top of the working area.
Using Drag & Drop you can detach them from this position and
dock them again at the bottom of the workspace. You can also
make the Actionbar float anywhere on your screen. By doubleclicking, you can dock it to the place where it was docked last.

Track tracing
Track tracing helps you design intuitively. You work with fixed
measurements in most of the following exercises. Therefore, you
can turn off track tracing, which is on by default.

To turn track tracing on and off
Tip: You can quickly turn
track tracing on and off at
any time while entering
points. Just select the F11
key or click
Track line in
the dialog line.

1

Click
Line (Draft role - Design task - 2D Objects task area or
Architecture role - Elements task - Quick Access task area).

2 Right-click in the workspace and select
options on the shortcut menu.

Track tracing

14

Basic settings

Allplan 2022

3 Turn off the Track tracing option

4 Click OK to confirm the settings; select ESC to close the
tool.

Line

5 Repeat these steps if you want to turn track tracing on again.

Architecture Tutorial

Unit 1: basics

15

How to
Sometimes, things will not immediately work out as required. This list
helps you succeed.

What if …
• ... I have selected the wrong tool?
Select the ESC key and click the correct icon.
• ... I make a mistake as I go along?
Select the ESC key to cancel (you might have to do this several
times).
Click
Undo.
• ... I have inadvertently deleted the wrong elements?
If
Delete is still active, right-click twice.
If no tool is active, Click
Undo.
• ... I have unintentionally opened a dialog box or entered wrong
values?
Click Cancel.

And what if ...
• ... the workspace is empty although there is data?
-

Click

Zoom All (viewport toolbar).

-

Click

Plan.

• ... the workspace is suddenly divided into a series of different
viewports?
Click
1 Viewport ( Window drop-down list on the Quick
Access Toolbar).
Tip: Check whether the
relevant layer is visible.

• ... specific kinds of elements such as text or hatching do not
appear in the workspace?
Click
Show/Hide ( View drop-down list on the Quick
Access Toolbar) and check that the relevant element type is
selected.

16

How to

Allplan 2022

Architecture Tutorial

Unit 2: building design

17

Unit 2: building design


The exercises in this unit require the Architecture role on the
Actionbar.

In this unit you will draw a residential building in 3D. Allplan
will generate the three-dimensional building model as you
work.
You will create the ground floor, the upper floor, and the
basement one after the other.
This unit teaches you how to handle the most important
tools (wall, column, door, window, and slab) in
architecture. You will also find out how to apply
SmartParts and how to dimension the floor plan.
Work your way through the exercises step by step.

18

Exercise 2: ground floor

Exercise 2: ground floor

Allplan 2022

Architecture Tutorial

Unit 2: building design

19

Settings
When creating components, you must define a number of settings,
for example, Fixed pen for component hatching (Fixed pen for
surface elements of archit. elements option).
You can find these settings in the Options on the Components and
architecture page in the Architectural settings across modules
area.

To define basic settings
 The Architectural Tutorial project is open.


Options ( Default Settings drop-down list on the Quick
Access Toolbar) - Work environment page - General area: The
Enter lengths in option shows the unit m.

 Actionbar: Architecture role - Elements task.
1

Click
Open on a Project-Specific Basis (Quick Access
Toolbar).
The Building structure tab is open.

2 Make drawing file 100 Ground floor model current and close all
the others. Click Close.
3 Check the height of the drawing file. Click
(Annotations task area).

List Default Planes

20

Settings

Allplan 2022

The List Default Planes dialog box opens. Check the height
settings of drawing file 100:
• Height at bottom: -0.1100
Plane name: Bottom level of ground floor
• Elevation at top: 2.4400
Plane name: Top level of ground floor

4 Close the List Default Planes dialog box.
Note: If the height settings of the drawing file are not correct,
click
Open on a Project-Specific Basis and select the
Building structure tab. Open the shortcut menu of drawing file
100 and click Assign planes.

Architecture Tutorial

Unit 2: building design

21

Make height settings for the ground floor in the Assign Planes
dialog box.

Click OK to close the Assign Planes dialog box.
Click OK to confirm the Behavior of drawing files dialog box
without selecting an option because the drawing file is still empty.
Close the dialog box Open on a project-specific basis: Drawing
files from drawing/building structure.
5 Open the
Default Settings drop-down list on the Quick
Access Toolbar and click
Options. Select the Components
and architecture page.
6 In the Architectural settings across modules area, select the
Fixed pen for surface elements of archit. elements option and
select the hatching pen: 1 0,25.

22

Settings

Allplan 2022

7 In addition, select the Display components with line type 1 in 3D
option in the Components area.

8 Click OK to close the options.
9 Check the

Reference Scale (status bar). It is 1:100.

10 In the
viewport drop-down list (Quick Access Toolbar), click
on
1 Viewport to initially get the display of the following
construction in the
floor plan view only. Furthermore, in the
view drop-down list, deselect the
Show Coordinate
System setting.

Architecture Tutorial

Unit 2: building design

23

Walls
Note: The following sections cover the essentials for drawing walls.
If you want to skip these sections and just start drawing, continue as
described in "Straight exterior walls (on page 28)"

General information
You can use the
•

Wall tool to draw different types of walls:

Straight walls
The approach is the same as with the

Line tool in 2D design.

•

Rectangular walls
You can create four straight walls in a single operation - this
Rectangle tool in 2D design.
works just like the

•

Curved walls
A polyline is used to approximate the circle: This results in short,
straight wall sections that can be addressed as a single entity.

•

Circular walls
Use this to draw walls as you would a
Circle in 2D design. You
can enter full circles and arcs. A polyline is used to approximate
the circle.

•

/
Polygonal walls
As with curved walls, you can use this to draw walls with any
number of corners, delimited by an arc. A distinction is made
between walls that are ”inscribed in" and ”circumscribed about"
an imaginary circle.
Inscribed means that the first segment and last segment
have half the length of a segment. The division is at a tangent to
the circle you enter when defining the geometric outline.
Circumscribed means that the first segment and last
segment have the length of a normal section. The division is on a
secant with the circle you enter when you define the geometric
outline.

24

Walls

Allplan 2022

•

Entity-based walls
This draws walls based on 2D entities (for example, lines,
polylines, splines) or composite elements. The wall is drawn along
the donor element, which has no effect on the donor element
itself.

•

Spline-based walls
Use this to draw walls as you would a

Spline in 2D design.

Clicking
Properties displays a dialog box in which you can define
the walls more precisely. Enter values for the height of the wall, its
thickness and elevation. You can also define additional properties
such as the building trade, material, priority rating, element
interaction, format properties (pen, line, color) and surface
properties (hatching style, pattern or fill).
Previews keep you informed about the wall structure, showing how
the wall looks in the standard views and in the Wireframe, Hidden
and Animation view types.
Note: To save time, define the materials and other attributes when
you enter the walls. Allplan uses the information you define here for
subsequent analyses and reports based on the building model. Of
course, you can also assign materials and attributes at a later time.
Materials can be transferred directly from applications used for
tendering, awarding, and invoicing.
Walls are generally drawn like the base 2D entities. For example, you
draw a straight wall just as you would a straight line – all the
construction aids available when you draw a line are also available
when drawing a wall.
The only other thing you need to do is define the wall’s offset
Properties for the wall in the dialog box. The
direction and enter
standard approach is to define the height of the wall based on
reference planes: Define the height of the default planes once. All the
walls associated with these planes are automatically correct.

Architecture Tutorial

Unit 2: building design

25

Other wall types
The wall types listed are complemented by walls of a freeform
outline or cross-section (profile walls). Moreover, various
automation tools are available. You can use these tools to generate
walls with one or more construction layers on the basis of lines
(sketches, for example), parallel lines (for example, 2D outlines) or
based on rooms that you have already defined by using 2D floor
plans or scans of drawings. Thus, you can quickly convert a 2D
design to a complex 3D building model.

Component axis
Components are entered along their component axis. The wall’s
offset direction depends on the position of the component axis, the
direction in which the wall is entered and the position of the first
construction layer in the wall.
Click
Reverse offset direction (Wall Context toolbar) to
change the wall's offset direction.
You can position the component axis as follows:
• Centered in or on the sides of the entire component (wall as a
whole)
• Centered in or on the sides of each construction layer
• At a freely definable distance to a component edge (wall edge)
Small boxes in the preview indicate the positions you can select.

A Component axis
B Possible positions on the sides of or centered in the layer or entire wall
C Number of layers

26

Walls

Allplan 2022

You can place the component axis in several ways:
• Intuitively
Use the mouse to move the axis: The cursor becomes a double
arrow, and the component axis will snap to the positions marked
by small black boxes. The values to the left side of the preview
show the distances to the edges.
The following positions are predefined:
Left edge of component or layer
Right edge of component or layer
Center of component or layer
• Freely by entering values
Click one of the boxes to the left of the preview. Enter any value
defining the distance between the axis and edge of the wall. The
program automatically calculates the value for the other side.

Offset direction of components, single-layer walls
Components are entered along the component axis. Depending on
the axis' position within the component, you can use the offset
direction to specify on which side of the component axis (relative to
the direction in which the component is entered) the component is
Reverse offset direction, you have the option
drawn. With
to ”tilt” the wall or to reverse the setup of the construction layers.
Tip: By means of the offset
direction, you can quickly
switch between inner and
outer dimensions when
entering walls.

The direction is indicated by an arrow and the position of the first
construction layer. You can turn these symbols on and off by using
Point snap
the Symbols when entering walls option in the
options - Point snap representation area.
Depending on the position of the component axis, the following
options are available:

Architecture Tutorial

Unit 2: building design

27

• Single-layer wall, lateral component axis:

1 Starting point of component
2 End point of component
A Component axis
B Offset direction
C Direction in which you enter the component
After clicking

Reverse offset direction:

1 Starting point of component
2 End point of component
A Component axis
B Offset direction
C Direction in which you enter the component

• Single-layer wall, centered component axis:
Clicking
Reverse offset direction does not make any
difference.

28

Walls

Allplan 2022

Designing walls
Basically, four factors define the three-dimensional, architectural
component called wall:
• Starting point
• End point
• Offset direction defined by the position of the component axis (=
line between the starting point and the end point) in the wall
• Height or connection with the default planes
To ensure that the wall is true to scale, you can define its thickness
and apply a hatching or fill.
You can also specify additional parameters such as a material and
building trade.

Straight exterior walls
The exterior walls on the ground floor will be made of brick and will
be 36.5 cm thick. Start by defining the component parameters.
You must also define which attributes can be entered for walls and
which catalog can be used for the materials. In this tutorial, you will
use populated drop-down menus for materials to which you can
progressively add entries.

To define properties
 Actionbar: Architecture role - Elements task. The Components
task area is expanded.
1
Tip: You can modify the
component properties of
walls (and other
architectural elements of
the same type) at any time.
Apply Archit.
Use the
Component Properties
tool. You can modify
elements in the same way
as you create them.

Click

2 Click

Wall.
Properties.

3 Open the Parameters, attributes tab and click the button beside
Catalog assignment.
Material is automatically selected in the Attributes for quality
selection dialog box; further attributes are not required.
Next, click the Material line in the right column and select katlg1 in
the Drop-down menus area of the Catalog assignment dialog
box.

Architecture Tutorial

Unit 2: building design

29

Click OK to close the dialog boxes.

4 Enter the following information:
-

In the Number of layers area, select one layer.

-

In the Positioning axis area, drag the component axis to an
edge of the wall in the graphic.

The position of the component axis controls the wall's offset
direction. The component axis can be on a side of the wall or
anywhere within the wall.
5 Enter the following information on the Parameters, attributes
tab:
-

In the first row, click within the Material/qualities column.
If multiple Qualities are active in the Catalog assignment dialog
box (see step 3), the following window appears. If only one
Quality is selected, you can enter the material directly.

30

Tip: When defining the wall’s
priority rating:
thickness of wall in mm.

Walls

Allplan 2022

in the Material row in the Qualities dialog box.

-

Click

-

Click
in the Material list box, enter Brick and click OK to
confirm.
This selects the entry 'brick' and adds it to the list.

-

Click OK to confirm the Qualities dialog box.

-

Enter the Thickness: 0.365.

-

Click below Trade and select Masonry work.

-

Click within the Priority column, add 365 to the list and select
this new entry.

The Priority rating controls the way components intersect.
Components with a lower priority rating have a 'hole' cut in them
where they are intersected by other components. This ensures
that these areas are not counted twice in subsequent quantity
takeoffs.

Architecture Tutorial

Unit 2: building design

-

For Calculation mode, select m³.

-

For Interaction, select dynamic.

-

Select the Auto-join check box.

The Wall dialog box now looks like this:

6 Enter the following information on the Format properties tab:
-

Select pen (2) 0.35 and line type 1.

-

Select color 1 (black) and the AR_WALL layer.

An animation surface is not necessary at the moment.

31

32

Walls

Allplan 2022

The Format properties tab now looks like this:

Note: The settings in the Properties palette - Format area have
no effect on the format properties of walls.
7 Enter the following information on the Surface elements tab:
-

Select the Hatching check box.
Click to the right of the check box in the area with the
hatching and select hatching style 5.

The Surface elements tab now looks like this:

Tip: The parameters you
define in this dialog box are
valid until you change them.

8 Now click the Height... button and enter the height. Define the
top and bottom levels of the wall so that they are attached to the
upper and lower default reference planes respectively.

Architecture Tutorial

Unit 2: building design

33

-

Top level: Click
Relative to upper plane and enter 0 for
the Offset.
As a result, the wall is flush with the upper default reference
plane. You can ignore the slab for the time being. By using a
separate drawing file, you will create it later between the top
level of the ground floor and the bottom level of the first
upper floor.

-

Bottom level: Click
the Offset.

Relative to lower plane and enter 0 for

Tip: With multilayer walls,
attach each layer to the
default planes separately.
So, you can also define a
different offset between
each layer and the planes!

9 Click OK to confirm the Height and Wall dialog boxes.
Tip: Select F1 for more
information on the Wall tool.
This will display the relevant
topic in the Allplan Help.

34

Walls

Allplan 2022

Entering data in dialog boxes
• To enter a value, click in the box. Enter the value at the keyboard
and select the ENTER key.
• Existing entries are found during input and proposed in the box.
Select ENTER to accept the data proposed.
• To enter and add values in custom list boxes, click

first.

• To apply entries, click OK.
• To discard entries, click Cancel or select ESC.

Drawing straight walls
When you have defined all the parameters, you can draw the walls.
The values are external dimensions. Therefore, the wall’s offset
direction is toward the interior.
Tip: In the following section,
you will enter walls
alternately in the xdirection and y-direction by
means of the keyboard. So
that you do not have to
select the Tab key to switch
between the boxes, you can
select the Switch between
x and y boxes
automatically option on the
Desktop environment Track tracing page of the
Options. To select this
option, you must turn off
track tracing.

To draw straight walls
1

Select the wall type by clicking

Straight Component.

2 From point
Click where you want the wall to start.
The wall is attached to the crosshairs.
3 Check and define the wall’s offset direction:
• You defined a lateral wall axis in the Wall dialog box. The axis
of a straight wall is simply the line that you enter.
• The values are external dimensions (see illustration).
Start drawing a horizontal wall on the left side. As the starting
point is on the outside, the wall’s offset direction is upward (=
toward the inside; see arrow in the following illustration).
• Check the wall’s offset direction in the preview at the
crosshairs. It must point upward (= toward the inside).
• If the offset direction is not correct, you can change it by
clicking
Reverse offset direction on the Wall context
toolbar.

Architecture Tutorial

Tip: While entering
elements, you can quickly
change the component axis
by means of keyboard
in the dialog
shortcuts or
line. Look in the Allplan Help
for detailed information
about changing the
component axis by means
of keyboard shortcuts.

Tip: If you cannot see the
whole drawing, click
Zoom All on the
viewport toolbar.

Unit 2: building design

4 Enter the

35

dx value in the dialog line: 1.25.

Note: If the dialog line prompts you to enter , either click the
box or select the TAB key, which takes you to the next box.
Draw the next walls as you would draw a polyline by entering dx
and dy values in the dialog line.
5 Enter the following values:
dy:

-4.5

dx:

1.375

dy:

-2.5

dx:

6.615

dy:

2.5

dx:

1.375

dy:

8.74

dx:

-4.635

dy:

1.75

6 Select ESC to finish entering the wall and to close the tool.

36

Walls

Allplan 2022

Curved walls
You will close the floor plan with a curved wall. To do this, you will use
the Curved Wall tool, which creates circular components that
consist of lines. This tool uses a polyline to approximate the circle:
This results in short, straight sections of linear components that can
be addressed as a single entity.
In addition to the wall’s end points and offset direction (like a straight
wall), you need to specify the arc’s direction of extension and the
radius.

To draw the curved wall
 Use
to get a close-up view of the area where you want to
draw the curved wall.
1

Use the right mouse button to double-click a wall that you have
already drawn. This selects the
Wall tool and matches the
parameters of the wall clicked.

2 Click
Properties.
Change the Priority to 300 on the Parameters, attributes tab
and click OK to confirm.
When walls have the same priority, a new wall has priority over
existing walls. So that the ends of the curved wall do not "cut off"
the ends of the existing straight walls at the points where they
meet, define the curved wall’s priority rating so that it is lower
than that of the straight walls.
3 Select the
Curved Component wall type. Use the Division
parameter on the context toolbar to enter the number of
segments to be used to approximate a full circle: 120.
4 To place the starting point (A) of the wall, click the wall line (but do
not click a wall corner!).
You can see reference point.
5 If it is not already there, move the reference point onto the left
corner of the wall, and enter an offset of 0.2.
A preview of the curved wall is attached to the crosshairs.

Architecture Tutorial

Unit 2: building design

37

6 Click the wall’s end point (B).

7 The wall’s offset direction must be toward the inside (as shown in
the illustration). If it is not correct, change it by clicking
Reverse offset direction.
8 Third point or element or radius
Enter the radius: 5.745

38

Walls

Allplan 2022

9 You can see two construction lines: the secant (A) and a
perpendicular bisector (B) of the secant; the perpendicular
bisector points to the center of the curved wall.
To define the arc's direction of extension, click in the workspace
above the secant (A).

A = secant = component line
B = perpendicular bisector
Note: Direction in which the arc (B) and wall (W) extend are on
the same side of the secant: The line on the inside of the wall is
the radius.

Architecture Tutorial

Unit 2: building design

39

Direction in which the arc (B) and wall (W) extend are on opposite
sides of the secant: The line on the outside of the wall is the
radius.

10 Select ESC to finish drawing the wall and to close the tool.

Assigning layers
Now it makes sense to mark the center of the curved wall with a
symbol and to dimension the center, as you will need this point again.
You will assign a special layer to the center so that you can show and
hide it later.
In the case of point symbols and other design entities like lines,
rectangles, and circles, layers are not assigned in the
dialog box (as opposed to walls).

Properties

In general, the appropriate layer for the selected tool is activated
automatically!
If it isn't, do the following.
• Open a tool
• Select a layer in the Properties palette - Format area
• Draw
Point Symbol tool, the first step is to
After you have opened the
select the symbol. Then you select the layer. Finally, you place the
point symbol with the layer selected.

40

Walls

Allplan 2022

To select the current layer
1

Click

Point Symbol in the Quick Access task area.

2 Select the first symbol (1 Cross, point), switch the Symbol size
to 5 mm and select the Constant size in layout option. Click OK
to confirm.

Tip: To get an overview of
the layers you have already
used, switch to the Layers
palette, open the shortcut
menu and click List layers
used in open documents.
(You can also open the
Select, Set Layers tool,
switch to the Select
Layer/Visibility tab and
select the
List layers used in open
documents option. To
access this tool, open the
shortcut menu in the
workspace.)

3 Open the Properties palette.
4 Go to the Format area, open the
select the layer DE_GEN01.

Layer drop-down list and

Architecture Tutorial

Unit 2: building design

41

5 If you cannot find this layer in the list, click Select… and doubleclick the layer DE_GEN01 in the Single layer selection dialog box.

6 Place the symbol on the center of the curved wall and select ESC
to close the tool.

Dimensioning the center of the curved wall
The dimension lines will also get a special layer so that they can be
hidden later.
In the case of dimension lines, layers and other format properties like
pen, line and color are assigned in the
with walls or upstands).

Properties dialog box (as

To create horizontal and vertical dimension lines
1

Click

Dimension Line in the Quick Access task area.

2 Select the Associativity on/off option on the Dimension Line
context toolbar.
This ensures that Allplan updates the dimensions automatically
when you change something.

42

Walls

3 Click

Allplan 2022

Properties and make the following settings:

• Select the DL_100 layer.
• Select the Allplan font
8 ISONORM DIN 6776 (Text tab).
• In the Position area, select the Allplan rule and place the
dimension text centered above the dimension line.

• Switch the dimension text unit to m, cm (Dimension Text
tab).

Architecture Tutorial

Unit 2: building design

43

• Select the No extension lines option (Input Options tab).

• Enter the other settings as shown.
4 Click OK to confirm the settings and dimension the center of the
curved wall with
Horizontal and
Vertical dimension lines.
See illustration at the end of the next section.

To dimension the radius
1

To dimension the curved wall, click
(Quick Access task area).

Curve Dimensioning

2 Select the DL_100 layer (Properties palette).
3 In the
Properties, set the unit of measurement
to m, cm.
The Dim. text width is 2 mm.
Define the other parameters as for the horizontal and vertical
dimension lines.
4 Click the line representing the outside of the curved wall and
select Radius in the input options.

44

Walls

Allplan 2022

5 Click a point through which the dimension line is to pass and
select ESC twice to close the tool.

Turning layers on and off
Now you can hide the dimension line layer as the dimensions are not
required at the moment.

To hide layers
1

Open the Layers palette.

2 Open the shortcut menu of the Layers palette and click List
layers used in open documents.
3 Right-click the
DL_100 Dimension line 1:100 layer and select Hidden, frozen.

Architecture Tutorial

Unit 2: building design

45

Layers can be made visible in the same way.
The current layer (in the Properties palette) cannot be hidden.
In this case, select a different layer first, for example the DEFAULT
layer.
You can also show and hide layers by selecting the
Select, Set
Layers tool on the shortcut menu of a viewport. The shortcut menu
of the Select Layer/Visibility tab provides the required options.
Tip: When no tool is active,
you can also open the Layer
dialog box by doubleclicking the right mouse
button in the workspace.

You can also use the Objects palette to show and hide layers. Open
the Objects palette and select
Sort by layer in the list box at the
top. This criterion lists all the layers assigned to the objects and
elements in the currently open drawing files (current or open in edit
mode or open in reference mode).
In this example, the list includes the AR_WALL, DE_GEN01 and
DL_100 layers. When you point to the icon indicating the layer status
in the list, Allplan opens a flyout menu where you can change the
status of the layer.

46

Walls

Allplan 2022

What to do when elements are no longer visible?
• Make all layers visible. To do this, use the Layers palette or the
dialog box of the
Select, Set Layers tool (open the shortcut
menu in the workspace) or the Objects palette (Sort by layer
criterion).
• If the elements are still not visible, the selected privilege set
might not have the necessary privileges. Select the
Select
Layer Privilege Set tool at the bottom of the Layers palette and
select an appropriate privilege set or ask your administrator for
help.
You can also select a privilege set in the Layer dialog box - Select
Layer/Visibility tab - Privilege set list box.

Which layer is the element on?
• When you point to an element (without clicking it), a box with
information on the element opens. You can customize element
info to your needs. Open the
Options on the Selection page:
Element name and Layer are turned on by default.
• You can find out which layers individual elements are on by
turning each individual layer on in the Layers palette.
You can also use the Objects palette. Select the Sort by layer
criterion, which lists all the layers assigned to the objects and
elements in the currently open drawing files (current or open in
edit mode or open in reference mode). If you want to know the
layer of a particular element, click this element in the workspace.

Architecture Tutorial

Unit 2: building design

47

As a result, this element gets the
Active icon in the Objects
palette and you can see the layer to which it belongs.
• You can find out which layer a single element is on by rightclicking the element and selecting Format Properties.
You can see and change all the properties including the layer.
You can also change the layer of the current element. The layers
of linked components (for example, window openings in walls),
Modify
however, do not change. We recommend that you use
Format Properties.
• You can change the layer assignments of one or several
elements by using the
Modify Format Properties tool
(Change task area). This tool also modifies the layers of linked
elements.

• To change the layer assignments of one or several elements, you
can also use the Objects palette. Select the Sort by layer
criterion. Open the tree structure of a layer down to its lowest
level. There, select one or more elements. You can now drag the
elements to another layer (the uppermost level in the hierarchy)
in the list.

48

Walls

Allplan 2022

->
However, you can reassign the elements only to a layer that is in
this list.

Interior walls
For the interior walls you will start by matching all the properties of
an exterior wall. You will then modify the thickness, calculation mode
and priority rating.

To create interior walls
1

Double-click an exterior wall with the right mouse button.
This selects the
Wall tool and gets the element's properties at
the same time. So you no longer need to associate the
component with the planes (to define its height).

2 Choose the wall type by clicking

Straight Component.

Architecture Tutorial

Unit 2: building design

3 Change the following
attributes tab:
-

Thickness (m): 0.175

-

Priority: 175

-

Calculation mode: m²

49

Properties on the Parameters,

Then click OK to confirm.
4 Set properties, place start point
Draw the first interior wall by clicking the inside corners. Check
the wall’s offset direction in the preview. If it is not correct,
change it by clicking
Reverse offset direction.

(A) Wall's offset direction
Note: If new walls are fitted in between two existing walls or if
the new walls end at wall points you have already defined, you do
not have to select ESC to finish entering the walls.
5 To place the starting point of the next wall, click the top line of the
new wall. You can see the reference point.
6 Move the reference point onto the corner and enter the distance
between the reference point and the start of the wall: 4.135.

50

Walls

Allplan 2022

7 Set properties, to point
Enter the length of the wall as follows:
dx: 0
Tab key
dy: 2.76.
Offset direction to the right (see arrow in previous figure).
8 Modify the

Properties (Parameters, Attributes tab):

-

Thickness (m): 0.115

-

Priority: 115

Then click OK to confirm.
9 Click
Enter at right angles in the dialog line.
If the program expects you to make an entry for the y-direction,
just enter 0 for dy in the dialog line.
10 Click the corner of the wall (see illustration) to define the wall’s
end point.

Architecture Tutorial

Unit 2: building design

51

11 Draw the other interior walls (see figure).
Careful with the two 10-cm thick walls!
For this wall, change the material (plasterboard), the building
trade (dry construction work) and the calculation mode (length).
Turn off hatching.

12 Select ESC to close the tool.

52

Walls

Allplan 2022

Reference point for entering architectural elements
When you insert an opening in a wall, for example, or join an interior
wall with an exterior wall, you need to click a wall. The point you click
should be near to where the new element is to begin.
Note: If you want to proceed in this way, make sure that
offset directly on/off is turned off in the dialog line.

Enter

The dialog line shows the distance to the nearest reference point
(for example, start of wall, wall corner, side of an opening).

The program displays the reference point as an arrow in the
construction-line color. The point you clicked (where the new
element is to begin) is marked by a square in the construction-line
color. The tip of the arrow points to the point you clicked.
Tip: For precision drafting
you do not need to click
exactly where the new
element is to begin. Just
enter the precise value in
the dialog line.

Figure: entering architectural elements by using reference points
A

Reference point; arrow points toward the point where the new element
starts

B

Starting point of the new element; click the wall to define this point

d

Distance to reference point in the dialog line

Architecture Tutorial

Unit 2: building design

53

You can use the distance to the reference point as follows:
• Accept the value in the dialog line by selecting the Enter key.
• Enter a new value in the dialog line and select ENTER to confirm.
• To change the position of the reference point – because the
distance to another corner on the wall is a known value – just
click the other point. You can see the new distance in the dialog
line.
Note: Allplan always defaults to the nearest reference point.

A note on multilayer walls
Note: The following sections cover the essentials for drawing
multilayer walls.
If you want to skip these sections and continue drawing, go to "A
note on views and viewports (on page 64)" or "Axis grid (on page
72)".
Walls with multiple construction layers are defined in the same
manner as simple walls with a single construction layer. However,
the following differences apply:
• You can define up to 20 construction layers.
• You need to enter the material, thickness, building trade, format
properties and surface elements (hatching, pattern, and fill)
separately for each of the construction layers in the wall. To do
this, you can find one line per construction layer on the
Parameters, attributes, Format properties and Surface
elements tabs.
• Also enter the height and priority layer by layer (depending on
which check boxes are selected in the All layers same settings
area on each tab).
• You can select different layers for each construction layer
(Format properties tab).

54

A note on multilayer walls

Allplan 2022

• The component axis can be positioned freely; for example,
centered in each construction layer (Preview area).
• Pay attention to the way walls or construction layers intersect,
which is controlled by the priority rating.
• You can assign a different priority rating to each construction
layer.
• Attributes (for example, position, type) can also be entered for
the entire wall.

Offset direction of components, multilayer walls
You have already encountered the offset direction of components;
this topic was already covered in the "Offset direction of
components, walls with a single construction layer" section. In the
case of multilayer walls, the position of the component axis is
particularly important when the component axis is not on the side of
the component edge but centered in the component or off-center.
Pay special attention to the position of the first construction layer
you can see in the preview.

Architecture Tutorial

Unit 2: building design

55

Depending on the position of the component axis and the
number of the construction layers, the following options are
possible:
• Multilayer wall; lateral component axis within the component
(between layer 2 and layer 3):

1 Starting point of component
2 End point of component
A Component axis
B Extension to both sides of the component axis;
not centered, first layer on the right
C Direction in which you enter the component
After clicking

Reverse offset direction:

1 Starting point of component
2 End point of component
A Component axis
B Extension to both sides of the component axis;
not centered, first layer on the left
C Direction in which you enter the component

56

A note on multilayer walls

Allplan 2022

• Multilayer wall, component axis centered in the component:

1 Starting point of component
2 End point of component
A Component axis
B Extension to both sides of the component axis;
first layer on the right
C Direction in which you enter the component
After clicking

Reverse offset direction:

1 Starting point of component
2 End point of component
A Component axis
B Extension to both sides of the component axis;
first layer on the left
C Direction in which you enter the component

Architecture Tutorial

Unit 2: building design

57

Priority rating with multilayer exterior walls
If the first construction layer in a multilayer wall represents the
exterior side, give this layer the highest priority rating so that Allplan
correctly intersects the various layers at corners.

Legend:
1-4

Direction in which you enter the straight wall

A

Exterior wall’s priority ratings:
Layer 1 = 600
Layer 2 = 500
Layer 3 = 400

B

Exterior side

C

Lateral offset direction (in this example, to the right)

Figure: priority rating with multilayer exterior walls

58

A note on multilayer walls

Allplan 2022

Priority rating at T-connections
To obtain correct results with T-connections, assign the same
priority rating to the construction layers that are to intersect.
This applies both to connections obtained as you draw and to
connections that arise as a result of the
Join Linear Components and
Join Linear Component with Line tools.

Legend:
A

Exterior wall’s priority ratings:
Layer 1 = 500
Layer 2 = 400
Layer 3 = 300
Layer 4 = 200

B

Exterior side

C

Priority ratings of interior wall:
Layer 1 = 200
Layer 2 = 300
Layer 3 = 200

Figure: priority rating at T-connections

Architecture Tutorial

Unit 2: building design

59

Multilayer walls with different height settings
The height of multilayer walls is defined in the same way as the
height of single-layer walls. If individual construction layers are to be
lower (because of a floor slab, for example), check that the Height
option in the All layers same settings area (Parameters,
Attributes tab) is not selected. You can then assign a different
height to each of the construction layers in the wall.

Associate the height of the individual construction layers with the
upper or lower default reference plane and, for the layers that are
lower, enter the thickness of the slab as a negative value in the
Offset box.

60

A note on multilayer walls

Allplan 2022

Window openings and door openings in multilayer walls
To insert window openings and door openings in multilayer walls,
proceed as you would with single-layer walls. In the Properties
dialog box, however, you also need to switch to the Reveal tab.

Here – depending on the number of construction layers defined (at
least two layers) – you can choose from different types and enter
values for the offset.
Tip: You can use the
Opening Designer to
design door and window
openings by entering
parameters for facing
blocks, rabbet shapes, roller
blind housings, lintel and
header elements, and so on.
These openings can be
saved and retrieved when
needed.

Architecture Tutorial

Unit 2: building design

For example: a multilayer wall; each layer of a different height
Settings for the wall parameters:

Height definition for layer 1:

61

62

A note on multilayer walls

• Top level:

Relative to upper plane, offset: -0.2

• Bottom level:

Relative to lower plane; offset: 0

Height definition for layers 2 and 3:
• Top level:

Relative to upper plane, offset: 0

• Bottom level:

Relative to lower plane; offset: 0

Allplan 2022

Architecture Tutorial

Unit 2: building design

Plan

Section: 1 = upper default plane; 2 = lower default plane

Undo the changes for the exercises that follow.

63

64

A note on views and viewports

Allplan 2022

A note on views and viewports
Note: The following sections cover the essentials for working with
views and viewports.
If you want to skip these sections and continue drawing, proceed as
described in "Axis grid (on page 72)".
When working with walls and other components, you can get an
impression of how the building looks in 3D space at the click of a
mouse button. Each viewport has its own set of viewing tools in its
viewport toolbar.

Tools for displaying the model
By using the tools on the viewport toolbar, you can not only move
freely on the screen but also display any view. You can zoom in on
any section or detail of your drawing as closely as you want. You can
even use different view types to display the entire model or selected
components.
Most of these tools are ‘transparent’ tools; in other words, you can
use them while another tool (for example, Line) is active.
You cannot see the viewport toolbar until you point to the lower
border of the viewport, guaranteeing as large a workspace as
possible. When you use multiple viewports, each viewport has its
own viewport toolbar.

Architecture Tutorial

Unit 2: building design

Tool

Use

65

Left area:
View flyout menu

You can use this tool to choose between plan view and any of the
predefined standard views.

Zoom All

You can use this tool to select the display scale so that you can see all the
elements in the visible files.
Note: If you have loaded a view by using
this view only.

Save, Load View, you can see

Zoom Section

You can use this tool to zoom in on a section. To do this, enclose the
elements you want to zoom in a selection rectangle.

Navigation Mode

You can use this tool to turn navigation mode on or off in the active
viewport. In this mode, you can use the mouse to view a 3D model.
Note: You can move in sphere mode or in camera mode (while selecting and
holding CTRL KEY).

Previous View

You can use this tool to restore the previous view or display scale (if you
had selected a different view or scale before you selected the current
setting).

Next View

You can use this tool to restore the next view or display scale (if you have
already selected a subsequent view or scale).

Save, Load View

You can use this tool to save the current view under a name of your choice
or retrieve a view you saved beforehand.

3D View

You can use this tool to display 3D models in three-dimensional space in a
perspective view by entering an eye point (observer) and a target point.
You can choose between parallel projection and central projection for the
perspective view. You can also use this tool to create a view based on the
building structure.

Element Selection

You can use this tool to select the design entities you want to display in the
active viewport. The program temporarily hides all the other design
entities.

Drawing File Selection

You can use this tool to temporarily hide drawing files that are currently
visible in the active viewport.

66

A note on views and viewports

Tool

Use
Always on Top

or

Allplan 2022

You can use this tool to place the viewport so that it is always on top (that
is, in front of) the other ones.
You can only use this tool if you have not selected the Connected option
and the viewport is not maximized.

Right area:
Exposure
(only for the
Animation and
RTRender view
types)

You can use this box to control the brightness in viewports of the
Animation or RTRender view type. You can enter a value between -25 and
25.

Section Display

You can use this tool to display your design in an architectural section for

Important!
This setting only changes the way elements look in the active viewport. It
has no effect on rendering.
which you have already defined the

Display Scale

Clipping Path.

You can use this tool to select the scale for displaying the model on the
screen.
The display scale governs the ratio between the model on the screen and
its real-life dimensions. The scale therefore changes automatically if you
change the size of sections on the screen. You can see the current display
scale on the viewport toolbar in the lower border of a viewport.

View Type

You can use this list box to select one of the predefined view types
(Wireframe, Hidden, Animation, Sketch or RTRender) for the active
viewport. Of course, you can also select a view type you defined yourself.
to modify various settings of the view types. The settings apply to
Click
all the viewports that use this view type. Click New view type to define
and save your own view types.
When Layout Editor is open, you can switch between Design view and
Print view (= preview of resulting printout).

Note: You can find more tools for controlling what's on your screen
in the
View and
Window drop-down lists on the Quick
Access Toolbar and on the shortcut menu (in navigation mode only).

Architecture Tutorial

Note: This tutorial uses the
Connected option, which is
selected by default
( Window drop-down list
on the Quick Access
Toolbar). When you change
the size of a viewport, all the
other viewports adapt
automatically. New
viewports will be fitted into
the arrangement.
If the Connected option is
not selected, you can place
and resize the viewports
independently of each other
within the Allplan window.

Unit 2: building design

67

You edit your model in viewports. Here, you create or modify the
required design entities. While doing so, you identify distinctive
points and select the view type and view appropriate to the current
status of your work.
To provide you with as much effective working space as possible for
this purpose, you can completely undock the graphics viewports
from the Allplan application window. If you have a second monitor,
you can leave the Allplan application window on one monitor, using it
as a “toolbox”, while you concentrate on editing the model in the
independent viewports placed on the second monitor. You can find
more information about floating toolbars in the Allplan Help section
under “Viewports”.
By opening several viewports in parallel and arranging them as you
need, you can simultaneously display your model in different
perspectives, at different scales, and with different view types. Each
viewport can show the model differently. For example, the first
viewport contains only a part of the model; the second one shows
the whole model; the third one shows an isometric view of the
model. Changes you make to the design in one viewport are
immediately visible in all the others.
You can find the tools for using and arranging viewports in the
Window drop-down list on the Quick Access Toolbar. You can
also select one of the standard viewport arrangements and then
modify this arrangement to suit your needs. You can specify
whether the additional viewports are placed on the left or on the
right.

68

A note on views and viewports

Allplan 2022

How to use viewports: detailed view and full view
The following exercise will help you understand how the viewports
work.

How to use viewports: detailed view and full view
1

Open the
Window drop-down list on the Quick Access
Toolbar and click
3 Viewports.
The additional viewports with the isometrics and the front view
are placed to the right of the floor plan view.

2 In the
viewport drop-down list for the viewport layout,
select the setting on the left and click
Representation in plan
in the upper left viewport.
3 Click
Front Left, Southwest Isometric View in the lower-left
viewport.
4 Here you can display the default planes of the ground floor. To do
this, go to the Quick Access Toolbar, click
Default Settings
and select
Options. Open the Planes page - Default planes
area.
Select the 3D representation in elevation and isometric views
option and close the dialog box.

Architecture Tutorial

Unit 2: building design

69

5 When this option is selected, default planes are represented by a
square of 2 x 2 meters, which you can see at the origin of all
views on the screen.
To adapt the size of the default planes to your design, click
Restore 3D View (Update task area).

6 In the Input Options, click Def Pl (default planes).

70

A note on views and viewports

Allplan 2022

The default planes adapt to the size of your design. The default
planes extend one meter beyond the external boundaries of the
design so that you can see better.

Zoom Section in the upper-right viewport and define a
7 Click
section by clicking two diagonally opposite points.

Architecture Tutorial

Unit 2: building design

By using three viewports, you can work on details while still
displaying the entire drawing in another viewport.
If you want, you can also save this viewport arrangement and
retrieve it later without having to make additional settings.

To save a viewport arrangement
1

Open the
Window drop-down list on the Quick Access
Toolbar, point to Save, Load View and click Save, Load....

2 Click New and enter a name for the arrangement.

This saves the arrangement of viewports. You can use Load to
retrieve it when needed.

71

72

Axis grid

Allplan 2022

Axis grid
You will now create an axis grid. This will help you position the
columns in the exercise that follows.

To create an axis grid
 Make drawing file 1 Grid current and open 100 Ground floor
model in reference mode.
Note: Only drawing files of active structural levels can be
selected together. Make sure that the Detached house and
Ground floor structural levels are selected.
Tip: You can configure the
program to display all
elements in reference
drawing files in a single
color, which you can select
Options on the
in the
Desktop environment Display page in the
Drawing file and NDW
window area.

1

Select the Design task on the Actionbar.

2 Click

Axis Grid (Axis Grid task area).

3 The Axis Grid palette opens. Define the following parameters on
the Axes tab in the Format area
• Layer: DE_GRID Grid
• Select the Display - same for all axes option. As a result, all
regions in the grid use the same pen, line and color.
• Pen: 0.13 7
• Line: 11
• Color: 1 black

Architecture Tutorial

Unit 2: building design

73

4 The x-direction gets six axes with different values for the
spacing between the axes.
Region

1

2

3

4

5

Spacing

1.25

1.375

6.615

1.375

1.25

To define the regions in the x-direction, enter the following
values for Number, distances:
1.25; 1.375; 6.615; 1.375; 1.25
Separate the distances by semicolons. Use commas or dots to
separate the leading digits from the decimal places.

74

Axis grid

Allplan 2022

5 Enter 0.3 for Projection top, bottom. As a result, each axis
projects by 0.3 m beyond the grid (see illustration at the end of
this task).
You can see the five regions in the x-direction in the preview in
the workspace.

6 The y-direction gets three regions.
Region

1

2

3

Spacing

2.755

2.5

9.4

To define the regions in the y-direction, enter the following
values for Number, distances:
2.755; 2.5; 9.4

Architecture Tutorial

Unit 2: building design

7 Enter 0.3 for Projection left, right.

75

76

Axis grid

Allplan 2022

8 Open the Label tab in the Axis Grid palette and check the
settings (see illustration):

9 Drop-in point
Position the grid somewhere on the left side, near the bottom of
the floor plan.
10 Close the Axis Grid palette.
11 Right-click one of axis lines and select
menu.

Move on the shortcut

To place the grid directly over the floor plan, you can use the
following point snap mode settings:
12 Right-click in the workspace and select
on the shortcut menu.

Point snap options

Architecture Tutorial

Unit 2: building design

77

• In the Point snap area, select the Point of intersection check
box and clear all the other check boxes.
• In the Point snap representation area, select the Display
point snap symbols option and make sure that In active
documents and In drawing files open in reference mode are
selected in the Snap options area.

78

Tip: Zoom in on a corner of
the building by using
Zoom Section.

Axis grid

Allplan 2022

13 From point, dx - To point
Click a suitable point of intersection on the grid and position the
grid on an appropriate corner of the building.

Tip: You can also create the
grid by using just lines and
parallel lines.

14 Dimension the grid as shown.
Make sure that you use the DL_100 layer.
15 The dimension lines are not required for the next steps. Hide
them:
Go to the Layers palette, right-click the DL_100 Dimension line
1:100 layer and select Hidden, frozen.

Architecture Tutorial

Unit 2: building design

79

Note: If the grid doesn’t turn out as shown here, you can always alter
it. All you need to do is double-click the grid and change the settings
in the Axis Grid palette. The procedure is the same as for entering
the grid. The only difference is that you do not have to place it.
Now only the gridlines for the round column inside are missing. You
can define these gridlines graphically.

To draw additional gridlines
1

Turn on

Construction line mode (Properties palette).

2 Select the DE_GRID layer.
3 Click

Line (2D Objects task area) and draw two diagonal lines.

4 Turn off Construction line mode again.
To do this, clear the
Construction line check box (Properties
palette).
5 Select the grid by double-clicking it.

80

Axis grid

Allplan 2022

6 Point to one of the Point handles in the y-direction of the grid
and select Add axis on the shortcut menu.

A horizontal gridline is attached to the crosshairs.

Architecture Tutorial

Unit 2: building design

81

7 Place this gridline on the point where the two diagonal lines
intersect.

8 To create a vertical gridline through the point where the
construction lines intersect, point to one of the Point handles
in the x-direction of the grid and select Add axis on the shortcut
menu.
A vertical gridline is attached to the crosshairs.
9 Place this gridline on the point where the two diagonal lines
intersect.
As a result, the grid has two more gridlines. The labels of the axes
have adapted accordingly.

82

Axis grid

10 Select ESC to finish.
You can delete the diagonal construction lines.

11 Switch back to the Elements task on the Actionbar.

Allplan 2022

Architecture Tutorial

Unit 2: building design

83

Columns
You can now draw the columns: the rectangular columns and the
interior column in drawing file 100 and the carport columns in
drawing file 101. The approach is the same as for entering walls: Start
by defining the component parameters, then place the element in
the drawing file.
Tip: You can also use the
Column tool to make
any other column-shaped
element such as table legs,
lamp posts, railing posts.

To place columns
 Open drawing files 1 Grid and 100 Ground floor model in
reference mode and make drawing file 101 Ground floor carport
current.
 Open
List Default Planes (Annotations task area) and check
the height and plane settings of drawing file 101 Ground floor
carport:
Elevation at bottom: -0.11; elevation at top: 2.44 (like drawing file
100 Ground floor model).

1

Match in the Change task area. The Match selection
Click
dialog box opens. Turn off layer and click OK to confirm the dialog
box.
Then click a wall line. Allplan copies the line's settings (pen (2)
0.35 and line type 1).

2 Click
Column (Components task area).
Check that the layer AR_COL is selected. If it isn't, select it in the
Layers palette or in the Properties palette - Format area.

84

Columns

3 Click

Allplan 2022

Properties and define the following parameters:

• Outline area:

round

• Parameters area: Radius = 0.100
• Attributes area:
Trade: Carpentry work
Priority: 100
Calculation mode: m³
• Material selection area:
Material, qualities: Wood
4 Check the Height of the column (it must be the same as for the
walls):
-

Top level:

Relative to upper plane at an offset of 0

-

Bottom level:

Relative to lower plane at an offset of 0

and click OK to confirm the dialog boxes.

Architecture Tutorial

Unit 2: building design

85

5 Go to the Column Context toolbar and change the column's
anchor point to
Centered. The point snap options you defined
for previous exercises are still valid.
6 Place six columns for the carports on the points where the
gridlines intersect. Then select ESC to close the tool.
7 Click
Open on a Project-Specific Basis, make drawing file
100 Ground floor model current and open drawing files 1 Grid
and 101 Ground floor carport in reference mode.
8 Click

Column (Components task area).

9 Click

Properties and change the radius to 0.125.

86

Columns

Allplan 2022

10 Place another column on the point of intersection near the middle
of the building.

11 Click

Properties and define the height:

• Outline area:

rectangular

• Parameters area:
Width = 0.500
Thickness = 0.150
• Attributes area:
Trade: Concreting work
Priority: 150
• Material selection area:
Material, qualities: Concrete

Architecture Tutorial

Unit 2: building design

12 Switch the column's anchor point to

87

upper right.

13 Place the column on the upper-right point where the gridlines
intersect (see illustration for step 10).
You can also rotate the column profile.
14 Open the

Properties and change the angle to 90.

15 Place the column on the upper-left point of intersection.

88

Columns

Allplan 2022

16 Change the point snap options for the steps that follow: Rightclick in the workspace and select
Point snap options on the
shortcut menu.
• In addition to the Point of intersection option, select the
Element and Midpoint check boxes in the Point snap area.
• Leave the other settings as they are.
17 Select ESC to close the

Column tool.

18 Click
Open on a Project-Specific Basis and close drawing
files 1 Grid and 101 Ground floor carport again.
Only drawing file 100 Ground floor model is open.
The round, exterior carport columns are now no longer visible, as the
relevant drawing file is now closed.

Architecture Tutorial

Unit 2: building design

89

Openings
The procedure for creating openings – be it a door, window, niche, or
recess – is always the same. The differences lie in the property
settings you can make.
Like in the real world, walls and openings are linked. For example,
when you move only a wall, its openings will move too.
Openings also provide the space for SmartParts or smart symbols.
A SmartPart is a parametric Allplan CAD object that acts according
to its own logic, which is independent of the CAD system. Parametric
information is controlled by a script, which is attached directly to the
object. SmartParts can be inserted in openings for windows and
doors in linear walls. SmartParts adapt to any outline.
As the name implies, a smart symbol is an intelligent symbol that
automatically adapts to its opening.
In addition, you can use Allplan to create window reveals and door
reveals and include them in quantity takeoff.

Doors
In this project, all the doors on the ground floor are single doors. The
entrance door is 2.135 m high; the interior doors are 2.01 m high.
You will begin by drawing the door swing. The procedure for creating
door openings also applies to all other kinds of openings.

Entering openings
• Click the first point of the opening.
• Enter properties and the height.
• Enter the width of the opening.
You must define the settings for the opening only once if you want
to create a series of identical openings. The properties and the height
information are stored by the system until you redefine them.

90

Openings

Allplan 2022

To draw doors
1

Click

Door (Components task area).

2 Open the Layers palette and select the AR_WALL layer.
3 Click a point of the exterior wall at the bottom to place the first
side of the door.
Note: Make sure that you enter 0.000 for
Offset to
reference point in the dialog line; otherwise, you cannot use this
entry option. Alternatively, you can also enter the required offset
and click the corner of the wall.
Tip: To enter the offset of
openings based on the
reference point, turn off the
Enter offset directly
option by clicking the icon.

The reference point is represented by an arrow; you can see the
distance in the dialog line.
4 If the reference point is not on the corner as shown, click the
corner to move the reference point there.

5 Enter the offset: 3.18 (left reference point)
or 3.435 (right reference point).
6 Click

Properties.

7 Select the rectangular shape for the door type.

Architecture Tutorial

Unit 2: building design

91

8 Click the Door swing icon and select the symbol representing the
single-leaf door swing.

Tip: Modifying door swings
is that easy: Select the Door
tool and click inside the door
opening. Select a different
Door swing in the dialog
box. Allplan deletes the old
door swing automatically.
Make sure you have
selected the correct layer.

9 Click Height....
This is where you define the height of the top and bottom levels
of the door opening.

92

Openings

Allplan 2022

Note: Attach the top level of the door opening to the lower
default reference plane too. This ensures that the height of the
door will not change, even if the height of the story is modified.

10 In the Top level area, click
Relative to lower plane and enter
the following unfinished dimension:
Door height + floor structure: 2.135 m + 0.11 m = 2.245 m.
11 In the Bottom level area, click
Relative to lower plane
(offset: 0.00) and click OK to confirm.
12 Clear the Create reveal element check box and click
in the
Library element 1 to n area. In the Sill representation area,
select the None option.

Architecture Tutorial

Unit 2: building design

The Door dialog box should now look like this:

Tip: You can change the
width of the opening in the
dialog box. You can quickly
create several doors of the
same type and height but of
varying width.
Tip: To create several doors
of the same width, turn off
the 'Prompt for opening
width'.

13 Click OK to confirm the settings.

93

94

Openings

Allplan 2022

14 Enter the offset to end point (the width of the opening) in the
dialog line: 1.135.

15 Specify the direction of the door swing.
The preview is attached to the crosshairs.
Tip: To check how your
design looks in 3D, switch to
standard isometric
a
view and create a hiddenline image by using the
Hidden view type.

Next, place the interior doors. These are to get different height
settings!
16 If the

Door tool is no longer open, click it again, place the door

opening in an interior wall, open the
Height.

Properties and click

17 Click
Relative to lower plane for the Top level, enter 2.12 and
click OK to confirm the two dialog boxes.

Architecture Tutorial

Unit 2: building design

18 Insert all interior doors.
Make sure that the offsets and opening widths are correct.

19 Select ESC to close the tool.

95

96

Openings

Allplan 2022

Windows
The next step is to insert openings for windows. Some of the
openings will be wider and higher than the others and the height of
the sill in each opening is also different.
Tip: You can modify the
reveal later by using
Define, Modify Reveal
(shortcut menu of the
opening).

After having created the window openings, you will assign
SmartParts to these openings. The position of a window SmartPart
within the window opening is based on the position of the window
reveal.
The use of precise measurements is not only important for ensuring
that the elements appear correctly on the screen - it is also critical if
the reports and analyses you generate later are to be accurate.
The system's built-in checker makes sure that the sum of the reveal
measurements is equivalent to the total thickness of the wall.
Reveal
or: Outer reveal:
ir: Inner reveal
B: Opening width (unfinished structure)

SmartParts
SmartParts are parametric Allplan CAD objects that act according to
their own inherent logic, which is independent of the CAD system.
Parametric information is controlled by a script, which is attached
directly to the object.
You can insert SmartParts for windows, window sills, doors, shading
elements (roller shutters, sliding shutters, folding shutters) and
skylights in window openings and door openings in linear walls or in
roof openings. SmartParts adapt to these outlines.
To edit SmartParts, you can use handles (graphical modification) or a
dialog box (alphanumeric modification). To modify SmartParts
Modify SmartPart using Handles
graphically, you can use the
tool, which you can find on the shortcut menu of the SmartPart.
You can also use handles and dialog box in combination. Double-click
the SmartPart to open the properties palette of the SmartPart and

Architecture Tutorial

Unit 2: building design

97

to display the handles. The program displays changes you make to
the SmartPart in real time. You can save the modified SmartPart as
Save as a favorite tool. You can also
an smv file by using the
save the modified SmartPart in a folder of the Library palette.
In the following exercise, you will model your own window
SmartPart. To make things easier, you can find the required settings
in a favorite file in the project folder.
Window SmartPart tool to define and save
You can use the
window SmartParts yourself. For more information see Unit 5:
SmartParts (on page 272).

Direction for entering openings (windows and doors)
If you define different values for the inner depth and outer depth of
the reveal or if you want to insert window openings or door openings
in multilayer walls, it is important that you pay attention to the
direction in which you enter the opening:
• The point on the wall you click always defines the exterior side of
the opening.
• The preview of the opening, which is attached to the crosshairs,
is closed on the outside and open on the inside.
Anchor Point to change how the
• If you need, you can use
opening is attached to the cursor in the preview before you insert
the opening in the wall: This makes it easier to use existing
corners or wall junctions when you enter openings based on
reference points.

A Wall line clicked = exterior side of opening

98

Openings

Allplan 2022

Creating windows
To create windows
Tip: You can change the
anchor point on the context
toolbar and the position of
the reference point.

1

Click to the right of Scale on the status bar and change the
reference scale to 1:50.

2 Click
Window (Components task area) and make sure layer
AR_WALL is current.
3 Set properties or click a line of an exterior wall
Place a point for the first side of the opening on the exterior wall
and correct the offset to the corner: 0.615.
It is important that you click the outer line of the exterior wall (A),
as the window SmartPart will need it later to find its correct
position.

4 Click

Properties.

5 Choose the rectangular window and select the Create reveal
element check box.
6 In the Representation of sill area, select the On both sides
option; in the Sill: format properties area, select pen 2 (0.35) and
line 1.
Define the top and bottom levels of the window opening.
7 Click Height....

Architecture Tutorial

Unit 2: building design

99

8 Enter the following values:
-

In the Top level area, click
Fixed component height and
enter 0.51 (same as height of opening).

-

In the Bottom level area, click
enter 1.75 for the offset.

9 Click OK to confirm.

Relative to lower plane and

100

Openings

The Window dialog box should now look like this:

Tip: The Window dialog box
shows the height of sill.
This is the relative height of
the sill based on the
distance between the sill
and the reference plane or a
reference element.

10 Switch to the Reveal tab.

Allplan 2022

Architecture Tutorial

Unit 2: building design

11 Define the reveal as follows:
-

Window depth: 0.07

-

Outer reveal: 0.09

12 Click OK to confirm.
13 Enter the width of the opening in the dialog line: 1.26.
14 Select ENTER to confirm.
15 Use the same settings to draw a window in the opposite wall.

101

102

Openings

Allplan 2022

16 Place the next point for a window opening in the right exterior
wall and, in
Properties, click Height and change the height
parameters for the top level and bottom level (height of sill) as
follows:
• Top level area:
Fixed component height = 0.6350
• Bottom level area:
Relative to lower plane = 1.1250

Keep the same settings for the other windows in the right
exterior wall.

Architecture Tutorial

Unit 2: building design

17 Draw more window openings in the left exterior wall. Change
the height parameters for the Top level and the Bottom level
again:
• Top level area:
Fixed component height = 1.8850
• Bottom level area:
Relative to lower plane = 0.3750

18 Draw two window openings above each other in the front
entrance.

103

104

Openings

Allplan 2022

To do this, create two openings in the same place but with
different settings for
BL relative to lower plane:
First opening: 1.125; second opening: 1.875.
The component height in each case is 0.635.
(See illustration)

Architecture Tutorial

Unit 2: building design

105

Inserting window openings in the curved wall
Now insert windows in the curved wall and in the adjacent straight
wall.

Due to the curve, you can define only the depth of window and the
outer reveal; the inner reveal is calculated by the program.
Openings in curved walls can have reveal edges that are radial or
parallel ( Options - Components and architecture page Openings area). For this building, you will use the Radial setting,
which is the default.

106

Openings

Tip: If the arrow indicating
the nearest reference point
does not appear, you have
most likely snapped the
starting point of one of the
segments in the curved
wall. In this case, select the
ESC key, zoom in even
closer and try again.

To insert window openings in the curved wall

To make things easier, open
the
Point snap options
and select the Display point
snap symbols option in the
Point snap representation
area.
Make sure that the symbol
Element
indicating the
appears next to the
crosshairs; you must not
see the symbol for
(End)Point!

 The
1

Allplan 2022

Window tool is still open. If it isn’t, activate it now.

Use
Zoom Section to get a close-up view of the lower-left
curved wall.

2 Click the line representing the outside of the curved wall.
• Make sure that you do not snap a point (see Tip)!
• Pay attention to the direction in which you enter the opening:
The closed side of the preview must point toward the outside.
If required, use
to select another anchor point for
preview.

Architecture Tutorial

Unit 2: building design

107

3 Click the inside corner of the curved wall.
You can see that the reference point has moved. A perpendicular
has been dropped from the corner to the line representing the
outside of the wall.
4 Enter the offset: 0
5 Click
Properties.
Go to the Library element 1 to n area and click
Representation of sill area and select outside.

6 Click Height and enter the following values:
-

Top level:

Fixed component height: 2.26

-

Bottom level:

Relative to lower plane: 0

; go to the

108

Openings

Allplan 2022

7 Click OK to confirm the dialog boxes.
8 Set properties, end point or offset to end of opening
Enter the opening width: 1.105
Tip: Make sure that the
Offset to reference
point icon is selected in the
dialog line; otherwise, you
cannot confirm the value
0.000 by selecting Enter.

9 Set properties or click a line of an exterior wall
Point exactly to the end point of the first opening and confirm
Offset to reference point = 0.000 in the dialog line by
selecting ENTER.
10 New reference point or offset to reference point
Open the shortcut menu (right mouse button) and click Last
point. Then select ENTER to confirm the offset of 0.000 in the
dialog line.
11 Set properties, end point or offset to end of opening
Confirm the opening width (1.105) in the dialog line.

Tip: This opening requires a
high degree of precision
when you click points. Zoom
in as close as you can and
click the points exactly to
avoid the risk of snapping to
a point in a segment of the
circle.

12 Repeat these steps (steps 10 to 12) to create five more openings
so that a large opening (made up of 7 openings) is generated.
13 Insert another opening in the short wall that meets the top of the
curved wall. The representation of sill is still outside.

Architecture Tutorial

Unit 2: building design

109

14 Set properties, end point or offset to end of opening
Enter the opening width: 0.885

15 Select ESC to close the tool.

Defining the reference point
To change the position of the small arrow representing the nearest
significant reference point, you can
• set another point on the wall
or
• click a point beyond the wall. The reference point will move to the
point on the wall that is perpendicular to the point you clicked.
The reference point arrow indicates the direction in which the
distance between it and the small square is measured. This value is
always a positive value, regardless of the axis direction. By entering
a negative value, you can mirror the direction of measurement.

110

Openings

Allplan 2022

Inserting SmartParts
The next step is to insert window SmartParts in all window openings.
You will use single-casement windows for the detached house in
this example. You can model your own SmartParts for openings by
Window SmartPart,
Door SmartPart,
Shading
using the
SmartPart,
Domed Roof-Light SmartPart and
Skylight
SmartPart tools. You can then save the finished SmartParts to the
Library. So that you can start inserting SmartParts at once, the
Project folder contains a favorite file with the required settings for a
window SmartPart.

To insert SmartParts
 Drawing file 100 Ground floor model is open.
 The reference scale is still 1:50.
Choose a larger scale to display the window SmartParts in
greater detail. It is also a good idea to turn on the Color stands
for pen option.
1
Tip: You can find detailed
information on modeling
window SmartParts in the
step-by-step guide
"Windows, Doors and
SmartParts". As a
Serviceplus member, you
can download this guide in
PDF format from Allplan
Connect
(https://connect.allplan.co
m). Go to the Training Documentation area.

Open the
and click

View drop-down list on the Quick Access Toolbar
Show/Hide. Select the Color stands for pen option.

2 Expand the Opening Elements task area and click
SmartPart.

Window

The Properties palette opens, displaying an empty window
frame. You can now design your own window SmartPart step by
step. You can find a favorite file with a complete window
SmartPart in the project folder.
3 Click
Load favorite, open the Project folder and select the
Window_single_casement.smv favorite file.
Allplan reads the saved values and settings into the Properties
palette.
4 If you want, you can switch between the tabs and check the
settings. So you can see how the SmartPart was modeled.

Architecture Tutorial

Unit 2: building design

111

The SmartPart is attached at its drop-in point to the crosshairs.
The drop-in point is the lower-left corner of the SmartPart. As
soon as you point to a wall opening, the preview adapts to the
outline of this opening.
5 Zoom in on the lower-left corner of the building.
6 Move the SmartPart attached to the crosshairs into the lowerleft window opening.
The SmartPart automatically adapts to the size of the opening.
When you point to the other side of the opening, you can see how
the position of the SmartPart changes.
7 As soon as you have found the appropriate position (as shown in
the illustration), click in the workspace. You have just placed the
first SmartPart.

Notes: If you created the opening with a reveal (as is the case in
this example), Allplan always places the SmartPart in the middle
of the reveal. It is irrelevant where you click the opening. If there
is no reveal, Allplan places the SmartPart in such a way that it is
centered in the wall layer clicked.

112

Openings

Allplan 2022

To place the element, use the tools in the input options.
You can specify an angle of rotation in the dialog line. Allplan then
places the SmartPart at this angle.
When you place the SmartPart, an arrow appears in the middle of
the SmartPart, indicating the outside of the SmartPart.
Depending on the position of the SmartPart within the opening,
you can see another symbol, indicating that the SmartPart will be
mirrored.

Note: You can select the size and color of these symbols. To do
this, open the
Options ( Default Settings drop-down list
on the Quick Access Toolbar) on the Point snap page and use the
Size of CursorTips for snap points and Color of CursorTips
options in the Point snap representation area.
The tabs of the SmartPart provide numerous parameters for
modifying the SmartPart itself and the way it looks. By assigning
layers, you can control which window elements are visible. You
can do this separately for 2D and 3D. Take the Window, single
casement SmartPart as an example: The window elements are
on the AR_WIND layer, the window sills are on the AR_WSILL
layer and the opening symbols are on the AR_SWING layer. Do
not change this setting.
8 Select ESC to finish.
A copy of the SmartPart you just placed is attached to the
crosshairs.
9 Place more SmartParts as shown in the illustration. For the time
being, ignore the openings in the curved wall and the floor-toceiling opening to the right of the curved wall.

Architecture Tutorial

Unit 2: building design

113

The opening symbols of the windows appear in plan when you
place the SmartParts. To change the opening direction, select the
corresponding option on the Elements tab.

10 When inserting the window SmartParts in the two window
openings that are above each other to the left of the entrance
door, you need to make sure that the SmartParts really snap into
place:
• Insert the first SmartPart in the upper opening. Then close the
Window SmartPart tool.
• Open the
Window drop-down list on the Quick Access
Toolbar and select
2 Viewports. Go to the second
viewport and select Front, South Elevation.
• Use the
Copy tool (Edit task area) to place the same
SmartPart in the lower window opening. Select this tool and
click the SmartPart you have already placed.

114

Openings

Allplan 2022

• From point
Click the lower-left corner of the upper window opening in
elevation view.

• To point
Enter
dz = -0.75 m in the dialog line and select ENTER to
confirm.

Architecture Tutorial

Unit 2: building design

• Select ESC to close the tool.

11 After you have inserted all SmartParts, select ESC to close the
tool.

115

116

Openings

Allplan 2022

Open the Layers palette and make the AR_SWING layer visible.
Your screen should now look like this:

You can save the new SmartPart to the Project or Office folder in
the library.

To save the SmartPart to the library
1

Switch to the Library palette.

2 Open the Project or Office folder.
If you have selected the Project folder, open the project where
you want to save the SmartPart. For example, choose the
Architecture Tutorial project.

Architecture Tutorial

Unit 2: building design

3 Click

117

New group at the bottom of the palette.

4 Enter a name for the group: Windows.
Select ENTER to confirm.
Allplan creates the Windows folder.
5 Open the Windows folder. At the bottom of the palette, click
Insert element Insert SmartPart.
6 Select SmartPart you want to save
Click one of the SmartParts you have placed.
7 Save as
Enter a name for the SmartPart: Window, single casement.
Click OK to confirm.
Allplan saves the SmartPart with a preview to the library.

SmartParts in curved wall
The remaining floor-to-ceiling windows will also be given
SmartParts. You will use the SmartPart you just saved to the library.
However, you will modify the SmartPart first.

To insert SmartParts
 Drawing file 100 Ground floor model is open.
The reference scale is still 1:50.
1

The Library palette is still open.
If this is not so, switch to the Library palette. Then open the
Project - Architecture Tutorial - Widows folders one after the
other until you see the Window, single casement SmartPart you
just saved.

118

Openings

Allplan 2022

2 Select the Window, single casement SmartPart by doubleclicking it.

Tip: To view the SmartPart
from all sides, you can
switch between different
views in the Preview of the
palette.

Architecture Tutorial

Unit 2: building design

119

3 First click the opening in the straight wall.

4 The Properties palette of the SmartPart opens. To adjust the
height of the window handle, open the Elements tab and click the
casement in the preview or select the casement in the list. The
preview shows the casement in the selection color. Below the
preview, you can find the parameters of the casement.
5 Open the Fittings area and enter Offset at bottom = 1.10 m.

120

Openings

Allplan 2022

6 Open the 2D opening symbol area and change the value for
Opened by to 95.

Architecture Tutorial

Unit 2: building design

121

7 Switch to the Settings tab in the Properties palette of the
SmartPart. Go to the Offset to opening (1) area and enter
bottom = 0.1100 m. This is to take the floor structure into
account.

8 Switch to the Window sill tab in the Properties palette and turn
off the Create window sill options for both the Inside and the
Outside.

122

Openings

Allplan 2022

9 To confirm your changes, click Close at the bottom of the
Properties palette.

Taking the modified parameters into account, Allplan has inserted
the SmartPart in the opening.
A copy of the SmartPart is attached to the crosshairs.
10 Click the first opening in the curved wall and insert the SmartPart.
11 Insert the SmartPart in the other window openings.
You will notice gaps between the SmartParts in the curved wall.
This is caused by the radial edges of the reveal in the curved wall.
12 Select ESC to close the tool.
13 Next, go to the three windows in the exterior wall on the left side
and correct the height of each window handle to Offset at
bottom = 1.10 m.
14 Change the reference scale back to 1:100.
15 To make sure your drawing does not get too cluttered, open the
Layers palette and hide the AR_SWING layer.

Architecture Tutorial

Unit 2: building design

Hidden-line image of rear left isometric view:

123

124

Chimney

Allplan 2022

Chimney
Insert a chimney for the heating system in the basement.
The chimney is a component which, in this example, applies to all four
floors. Its bottom level is on the unfinished basement floor; its upper
level is above the roof. By means of the building structure, you can
design components applying to all floors in a single drawing file. For
this purpose, you will use a drawing file under the Detached house
structural level.

To place a chimney
1

Click
Open on a Project-Specific Basis (Quick Access
Toolbar).

2 Open drawing file 3. Name the file Chimney.

3 Drawing file 3 Chimney has automatically been given the planes
of the Detached house structural level (Default lower plane = 3.50 m and Default upper plane = 7.30 m). Because the bottom
level of the chimney is on the unfinished basement floor, you can
now assign this height setting to the drawing file.

Architecture Tutorial

Unit 2: building design

125

To do this, open the shortcut menu of drawing file 3 Chimney and
click Assign planes.

126

Chimney

Allplan 2022

4 The Assign Planes dialog box opens. Select Top level of building
(7.30 m) for Default upper plane and Bottom level of basement
(-2.86 m) for Default lower plane.

5 Click OK to close the Assign Planes dialog box.
6 Click OK to confirm the Behavior of drawing files dialog box
without selecting an option.
Drawing file 3 Chimney gets the selected height settings.

Architecture Tutorial

Unit 2: building design

127

7 Make drawing file 3 Chimney current and open 100 Ground floor
model in reference mode. Close the dialog box.
Have a look at the viewport in front, south elevation. You can
see the default planes of drawing file 3 Chimney, which is open in
edit mode, and drawing file 100 Ground floor model:

8 Click

Chimney (Components task area).

9 Check the Properties palette to see whether the layer
AR_CHIMN is selected. If it isn’t, select it now.
10 Click

Properties and select chimney type 10.

128

Chimney

Allplan 2022

11 Enter the following dimensions:
• Parameters area:
Width = 0.3500
Thickness = 0.3500
Width of flue = 0.1200
Thickness of flue = 0.1200

12 Assign any trade, material, and calculation mode and turn off the
hatching.
13 Define the height.
At 2.86 m, the top level of the chimney is at the height of the
unfinished basement floor. For the time being, its top level is
attached to the overall building height of 7.30 m, which is defined
in the building structure.

Architecture Tutorial

Unit 2: building design

129

14 Click OK to confirm the dialog boxes and change the anchor point
to
lower right.
15 Place the chimney in the lower-right wall corner and select the
ESC key to close the tool.

130

Checking the design

Allplan 2022

Checking the design
If you want to check the design, switch to the Animation view type.
You can find this setting on the viewport toolbar of each viewport.

To check the design in animation
 Make drawing file 100 Ground floor model current and open
drawing files 3 Chimney and 101 Ground floor carport in edit
mode.
1

Open the Layers palette and click
the bottom of the palette.

Select Layer Print Set at

2 Select the Model print set in the dialog box and click OK to
confirm.
3 Open the
Window drop-down list on the Quick Access
Toolbar and click
1 Viewport.
4 Select
toolbar.

Rear Left, Northwest Isometric View on the viewport

5 Select the Animation view type on the viewport toolbar.

6 Turn on

Navigation Mode on the viewport toolbar.

Architecture Tutorial

Unit 2: building design

131

You can now use the mouse to move through the building.
Tip: When you select the F4
key, the program
automatically opens an
animation viewport and
switches to
Navigation
Mode (viewport toolbar).
You can see the building in
the middle of the viewport,
viewing it from the front
and top.

In sphere mode, the observer moves around the object on the
surface of an imaginary sphere.
Left mouse button:
Turns the camera about an object on the surface of an imaginary
sphere.
Middle mouse button:
Moves the camera to the left or right and up or down on a linear
path.
Right mouse button:
Zooms in or out; moves the camera forward or backward.
7 In animation, you can see a virtual ground plane. To define this
Surroundings (on the
ground plane more precisely, use
shortcut menu or in the Architecture role - Visualization task Surfaces, Light task area).
If you want to see the default planes too, open the
Default
Settings drop-down list on the Quick Access Toolbar and click
Options.

132

Checking the design

Allplan 2022

8 Open the Animation page, go to the General area and select the
Display default planes and Display roof planes, roof surfaces
and custom planes options.

9 Click OK to close.
10 To make the planes transparent, select the
This time open the Planes page.

Options again.

Architecture Tutorial

Unit 2: building design

133

11 In the Default planes area, select the Surface check box and click
the button.

12 Select the Glass.surf file.

134

Checking the design

Allplan 2022

If you cannot find the Glass.surf file in the Surfaces used in
project area, open the Office - Default - Structure - Unfinished
structure - Glass folders one after the other. Select the
Glass.surf file. The program automatically copies this file to the
Design folder of the project standard. As a result, you can select
this file in the Surfaces used in project area.

13 Click OK to close the Surfaces dialog box.

Architecture Tutorial

Unit 2: building design

14 Make the same settings in the Roof planes, roof surfaces,
custom planes area.
Here, you can select the Glass.surf file in the Surfaces used in
project area.

15 Close the Options.

135

136

Checking the design

16 Click

Allplan 2022

Restore 3D View (Update task area).

You can see the default planes in animation. It is easy to identify
which component is attached to which plane.
Note: For better demonstration, a colored glass was selected as
the plane surface for the illustrations.

Architecture Tutorial

Unit 2: building design

137

17 To close animation, select the Wireframe view type on the
viewport toolbar.
Switch to
plan view.
Note: When checking the design, you can also show or hide
elements or element groups, make them gradually transparent,
color code them, or zoom in on a particular element. To do this,
use the Objects palette, which lists all components of your virtual
building model in a compact and clear manner. You can use
predefined sorting criteria to show and hide the required objects
and elements.
The extensive possibilities of the Objects palette are explained in
detail in the Allplan Help section under “Objects palette”.

138

Completing the design

Allplan 2022

Completing the design
You will now complete the floor plan with the outline of the slab over
the columns, the carports and furniture. To do this, you will use the
2D drafting tools.
It is a good idea to keep 2D information and architectural
components in separate places. Consequently, you will use the
DE_GEN01 layer for 2D designs.
First, draw the outline of the slab over the columns so that the slab
extends beyond the walls. Use a different pen and line type to do
this. Place the outline of the slab on the DE_GEN01 layer.

To draw the outline of the slab
Tip: You can also use Ctrl+4
to select layers.

 Expand the Quick Access task area (Architecture role Elements task) by double-clicking within the name line of the
task area.

If no tool is active, just
double-click the right
mouse button in the empty
workspace.

1

Open the Layers palette and click
the bottom of the palette.

Select Layer Print Set at

2 Select the PR Design print set in the dialog box and click OK to
confirm.
3 Click

Line in the Quick Access task area.

4 Go to the Properties palette and select the layer DE_GEN01.
Select pen (7) 0.13 and line type 11.
5 Click
Enter at right angles (dialog line) and draw the floor slab;
use the columns as a guide.
The easiest way to join the lines with the edge of the sill is by
means of
Intersect 2 Entities (shortcut menu).

Architecture Tutorial

Unit 2: building design

139

Carports
You will draw the outlines of the slabs for the carports as a 2D design
in drawing file 101. Here, too, place the outlines on the DE_GEN01
layer.

To draw parallel lines
 The Architecture role and the Elements task are open.
Make drawing file 101 Ground floor carport current and open 100
Ground floor model in reference mode.
Close all the other drawing files.
1

Tip: Offset Polyline:
Use left or right in the input
options to change the side
on which Allplan creates the
polyline.

Go to the Quick Access task area and click
Offset Polyline
(flyout menu of the
Line tool). Check that the DE_GEN01 layer
is selected.

2 Number of parallel lines: 1
Offset: 0.575 (ENTER!)
3 Select pen 0.18 and line type 8 (Properties palette) for the
outline of the carport.
4 Click the corner of the house and then the center of the column.
You can see a preview of the parallel line at the offset you
specified.

140

Completing the design

Allplan 2022

5 Change the offset to 0.6 and click the lower-left center of the
column.

6 Change the offset to 0.575 and click the center of the next
column.
7 Change the offset to 0.6, click the corner of the house and select
ESC to finish drawing the polyline.
8 Draw a further parallel polyline for the area with the offset -0.15.
Select pen (2) 0.35 and line type 1 and enter the points in the
same sequence.

You will create the second carport by mirroring and copying the first
one. Now it is a good idea to use track tracing.
In this exercise, you will also learn to use the filter tools. You can use
these to select elements in an area.

Architecture Tutorial

Unit 2: building design

141

To mirror and copy the carport
1

Expand the Filter task area and click
Filter by Element Type.
Select Line. Enclose the carport in a selection rectangle.
The polylines appear in the selection color.

2 Open the shortcut menu of a line and click

Tip: Here is an alternative to
define the midpoint:
Right-click in the
workspace to open the
shortcut menu. Choose
Midpoint and left-click the
left and right corners of the
house.

Copy and Mirror.

3 Click point 1 of mirror axis:
Turn on track tracing by selecting the F11 key or click
line in the dialog line.

Track

The center of the facade at the front of the building will serve as
the first point for the mirror axis.
Point to the left corner of the house. You can see the first track
point.
Point to the right corner of the house. You can see the second
track point.
Position the crosshairs roughly midway between the two track
points so that you can see the midpoint of the track line. Click
this point.

142

Completing the design

Allplan 2022

The mirror axis needs to be parallel to the y-axis.
4 2nd point of mirror axis:
By means of track tracing, you can display the track line that is
perpendicular to the first point of the mirror axis (= midpoint of
the facade at the front of the building). Move the crosshairs
roughly at a 90-degree angle above or below the first point of
the mirror axis. The 90.0-degree track line appears. Click this line
wherever you want.
Allplan creates a vertical mirror axis, mirroring and copying the
selected elements.
As you can see, the lines of the second carport are placed
correctly.
5 Select F11 to turn track tracing off again and select ESC to finish.

Architecture Tutorial

Unit 2: building design

143

Furniture
You can draw the furniture for the ground floor yourself.
Use the tools in the Quick Access task area to design the furniture.
Place the furniture on the DE_FURN layer Sanitary objects get the
DE_SANY layer. By doing so, you can conveniently transfer single
layers to specialist planners.
You can find furniture in the Library palette. Open the Default - 2D
objects - Interior folders.
When furnished, the ground floor might look like this:

144

Completing the design

Allplan 2022

Symbols and layers
When you place symbols, they usually get the layer on which they
were drawn. The elements in a symbol can also reside on different
layers. When you use symbols provided by partner offices, the
layers of the symbols are usually unknown.
To avoid changing layers frequently, you will now select the Place
symbols on current layer option in the
Options. When selected,
all symbols get the layer that is currently active, regardless of the
layers on which they were drawn.

To define the layer for symbols
1

Open the
Default Settings drop-down list on the Quick
Access Toolbar and click
Options. Select the Smart symbols
and symbols page.

2 In the Symbols area, select the Place symbols on current layer
option.

3 Click OK to confirm.

Architecture Tutorial

Unit 2: building design

145

Modifying layers
If you find that elements are on the wrong layer, you can move them
to a different layer at any time. The following section shows how to
assign a different layer to these elements.
Note: Symbols are saved as entity groups in Allplan. An entity group
is a group of elements which can be addressed and modified as a
whole. To select a symbol or group in one step, click the symbol with
the middle mouse button and then left mouse button. This mouse
button combination selects entity groups.
You can also select entity groups by clicking while selecting and
holding the SHIFT key.
Tip: You can also modify the
layer of an element by
selecting Format
Properties on the shortcut
menu.
However, this approach
does not modify linked
elements (for example,
window openings in walls).

Modifying layers
1

Click

Modify Format Properties (Change task area).

2 Click the Layer button, select the KO_MOEB layer by doubleclicking it (under ARCHITECTURE --> Construction) and confirm
the Modify Format Properties dialog box by clicking OK.

3 Select the symbols you want to place on the DE_FURN layer.
To do this, open the
Brackets (Work Environment task area)
and click each symbol with the middle and left mouse buttons.
Close the
Brackets afterward.

146

Dimensions and labels

Allplan 2022

Dimensions and labels
To dimension architectural elements, you can use a tool that creates
associative dimension line blocks:
the Dimension Walls tool (Architecture role - Elements task Components task area). "Associative" means that the program
updates all dimensions automatically when walls and openings
change.
Dimension lines and sill heights get separate layers. Having all
elements in the same drawing file ensures that associativity is not
lost.
The dimension lines for the building are in drawing file 100; the
carport dimensions are in drawing file 101.
You can find an illustration of the dimensioned floor plan at the end of
this chapter.

Dimensioning walls
In the following exercise, you will create associative dimension-line
blocks for the walls.
Tip: To avoid confusion, hide
the furniture layer and
sanitary layer. There are
various ways to do this:
- Use the Layers palette.
- Use the
Select, Set
Layers dialog box.
- Use the Objects palette
and the
Sort by layer
criterion.

To dimension walls
 Make drawing file 101 Ground floor model current and open 100
Ground floor carport in edit mode.
1

Click
Dimension Walls (Architecture role - Elements task Components task area).

2 Click

Properties.

3 Do not change the settings for Arrowhead or the Format
properties. The same applies to the Text, Dimension Text, and
Input Options tabs.

Architecture Tutorial

Unit 2: building design

147

4 Open the Dimension Block tab and select the following check
boxes for the vertical dimensions:
-

Outside dimensions

-

Room dimensions

-

Show height of openings

5 Each dimension string type can be assigned its own layer. Assign
the layer DL_100 to all dimension strings.

Tip: You can save four
dimension string
combinations as default
combinations.

6 Click OK to confirm.
7 Click the vertical exterior walls on the right side, which you want
to dimension.
The walls will appear in the selection color as you select them.
Make sure you select them all.
8 Right-click in the workspace to confirm. (Adjacent interior walls
will also be dimensioned automatically.)

148

Dimensions and labels

Allplan 2022

9 Active wall line as direction element
Click a vertical line on the edge of one of the walls selected to
define the direction of dimensioning.
10 Place the dimension block in the workspace.
11 You can change the settings for the dimension strings in
Properties and dimension the other walls.
12 Make drawing file 101 current, open drawing file 100 in edit mode
and dimension the carports.
Note: Before placing the dimension-line block, you can use
Flip dimensions in the input options to reverse the
arrangement of the dimension lines. When
Offset to drop-in
point is on, the offset at which the dimension-line block is attached
to the crosshairs is the same as the spacing between the dimension
lines in the block. So, you can "seamlessly" append the next
dimension-line block.
You can customize the dimension blocks to your needs. To do this,
open the shortcut menu of a dimension line you want to modify and
select
•

Add Dimension Line Point

•

Del Dimension Line Point

Modify Component Height, Additional Text (Label task Dimension task area or shortcut menu of a dimension line) to alter
height specifications. You will use this tool to change the height
specifications for the window openings in the entrance.
Curve Dimensioning (Elements task - Quick Access task area
or Label task - Dimension task area) to dimension the openings in
the curved wall. When you do this, you must work carefully, as the
points to be dimensioned - the end point of an opening, which also
serve as the starting point of the next opening - are not visible on
the outside edge of the sill.
However, the points do exist and can be dimensioned.

Architecture Tutorial

Unit 2: building design

149

Sill height
You can use the Sill Height and Elevation Point tools to label your
design or just as a means of checking that the elements you entered
were created correctly.
These tools create "intelligent" labels. In other words, the program
updates the labels automatically when you change the components.
You must click the openings in plan view.
Note: The exponent format is based on the setting in Dimension
Line Parameters (Dimension Text tab).

To calculate the sill height automatically
 Open drawing file 100 Ground floor model again.
1

Right-click a corner of the window opening. The shortcut menu
appears; select
Sill Height.

2 Select the layer AR_SILLE.
3 Select Vertic(al Text) in the input options. This defines the text
orientation.
Tip: If you want to use the
finished floor as the basis
for the sill height, enter the
height of the floor in the
Delta BL box.

4 Click Prefix on the context toolbar and enter SILL. (This will
appear in front of the value).

5 Switch to the text parameters and enter the following values:
• Text's anchor point: upper left
Text height = 1.500
Text width = 1.000
Aspect = 1.500
Font: 8 ISONORM DIN 6776
• Leave the other settings as they are.

150

Dimensions and labels

Allplan 2022

6 Place the label beside the window.
Allplan measures the height from the lower default plane to the
sill.

7 Create labels for the other window sills. Check the text
orientation each time.
For the curved wall, change the text direction to Angle and click a
line of a SmartPart to match its angle.
Tip: When you click
congruent openings in plan
view, Allplan identifies one
opening only (usually the
lower one).
There are two ways to
enter the other sill height:
Click the opening in
isometric view or switch to
the tools in the Quick
Access task area and enter
the sill height manually. Use
to match the text
parameters.

Architecture Tutorial

Unit 2: building design

8 Select the Esc key to close the tool.

151

152

Dimensions and labels

Allplan 2022

You can use
Align Text (Architecture role - Label task - Text
task area or shortcut menu of a text) to align vertical sill labels.
Select F1 for detailed information on this tool.
You can use
Elevation Point (shortcut menu) to place elevation
specifications in the same way. With this tool, you can also define the
symbols used for the upper and lower elevation marks.
Tip: Check that the correct
layers are visible.

The following illustration shows the elevation specifications for a
wall.

The floor plan of the ground floor might look like this.
The room identifiers are on layer TX_100.

Architecture Tutorial

Unit 2: building design

153

154

Stair outline

Allplan 2022

Stair outline
To draw the stair outline
 Drawing file 100 Ground floor model is open.
1

Select the DE_GEN02 layer and use
Line,
Rectangle and
Parallel to Element (Quick Access task area) to draw the
stringers and the steps.

2 Use
Perpendic. Bisector (Quick Access task area) and
Line to draw the line of travel.
3 Use
Line,
Circle (Quick Access task area) and
AutoDelete Segment (shortcut menu) to draw the symbols
representing the top and bottom of the stair.
4 Use
Line to draw two lines representing the clipping path and
delete redundant line segments with
Delete Segment of
Line.
5 Change the line type by using
Modify Format Properties
(Change task area) and the
Brackets (Work Environment
task area).
Check the offset to the
walls. Use the options for
snapping to points and
entering offset values.

Architecture Tutorial

Unit 2: building design

155

Slab
The ground floor is still missing the slab.
You will draw this slab in a separate drawing file.
As with walls, start by entering the properties and then draw the
outline of the slab.
Tip: You can also use the
Slab tool to create floor
slabs.
You can use separate tools
to design foundations.

To define the slab’s properties
1

Click

Open on a Project-Specific Basis.

2 Open drawing file 109. Name the file Ground floor slab.
3 Open the shortcut menu of drawing file 109 Ground floor slab
and click Assign planes.

4 The ground floor slab is between the Top level of ground floor
and Bottom level of top floor. Select these two planes in the
Assign Planes dialog box and click OK to close.

156

Slab

Allplan 2022

5 Click OK to confirm the Behavior of drawing files dialog box
without selecting an option.
6 Make drawing file 109 Ground floor slab current and open 1 Grid
and 100 Ground floor model in edit mode.

Architecture Tutorial

Unit 2: building design

7 Open the Layers palette and click
the bottom of the palette.

157

Select Layer Print Set at

8 Select the SC Entry print set in the dialog box and click OK to
confirm. (Therefore, the grid layer is visible.)
9 Click
layer.

Slab (Components task area) and select the AR_SLAB

10 Select pen (2) 0.35 and line type 1 (Properties palette).
11 Click

Properties.

12 Define the height as follows:

The bottom level of the ground floor slab is positioned on the Top
level of ground floor (2.44 m) and its top level on the Bottom
level of top floor (2.64 m). The slab is 20 cm thick; thus, the slab
is flush with the upper and lower default planes.

158

Slab

Allplan 2022

13 Click OK to confirm and enter the other properties as follows:
• Attributes area:
Trade: Concreting work
Priority: 100
Calculation mode: m³
• Material selection area:
Material, qualities: Concrete

Architecture Tutorial

Unit 2: building design

159

Saving component properties as favorite files
As is the case with all component settings, you do not need to
specify the slab properties from scratch each time, but you can save
combinations of settings as favorite files.

Saving component properties as favorite files
 The

Slab tool and the dialog box are still open. If it isn't, select

this tool and click
1

Click
box.

Properties.

Save as a favorite in the lower-left corner of the dialog

2 Select the Favorites - project folder, enter a name and click
Save to confirm.
The next time you need a slab with these settings, click
favorite and select the file.
The values in the dialog box will change automatically.

Load

160

Slab

Allplan 2022

Entering the outline of the slab with the polyline entry tools
You will now define the position of the slab. The layers will be useful
to define the corners and delimiting points along the outline of the
slab.
To trace the outline of the slab along the shape of the curved wall,
you will use the polyline entry tools.

Polyline entry tools
You can use these tools to enter any outline.
Polygonize entire element: This uses the starting point for the
direction. You can specify the number of segments for circles and
curves.
Define area of element to polygonize: This generates a polyline
based on a portion of an element. Define the portion by clicking a
‘from’ and a ‘to’ point.
Enter reference point: This identifies a point on the element as
the starting point for the new element. To define this point, click a
point on the element and enter the offset between this point and the
nearest significant point (indicated by an arrow).
Area detection using additional point: This uses a point you click
on a polyline to detect the entire boundary.
Area detection: This uses closed areas delimited by design
entities of any kind as an outline polygon. All you need to do is click
anywhere within the area. Allplan will automatically detect and
polygonize the entire outline. The boundary elements can have
points in common; they can intersect or touch. You can turn this
automation feature on and off at any time.
Island detection,
Inverse island detection:
Island
detection detects closed outlines within an area and automatically
cuts them out.
Inverse island detection does not cut out closed outlines but fills
these outlines with the selected surface element. It is the area
around the "island" that remains empty.
You can use these tools only together with
Area detection using
additional point and
Area detection.

Architecture Tutorial

Unit 2: building design

161

To force the polyline along the outline of the wall, you first need to
get a close-up view of that area. Now you will enter the polyline of
the slab.

To enter the outline of the slab with the polyline entry
tools
 The
Slab tool is still active.
Right-click in an empty area of the workspace and select
Point snap options on the shortcut menu. In the Point snap
area, select the Point of intersection option.
1

Click
Multi in the input options to enter the polyline defining
the outline of the slab in several steps.

2 Check that
options.

Polygonize entire element is active in the input

The settings should look like this:

Zoom Section to get a close-up view of the area with the
3 Use
curved wall and click the first wall corner.
Tip: You can undo incorrect
entries. The number of undo
steps is unlimited.
Just click
Back in the
input options.

4 Point to the arc.
Make sure that Allplan detects the curved wall as a single
element (selection color, CursorTips:
or
).

Click the arc.

162

Slab

5

Allplan 2022

Polygonize entire element is selected in the input options.
With this option, you can integrate an entire element - in this
example it is the arc - into an outline polygon in a single step.

6 Starting point
Click the upper end point of the curved wall.
Check that the end point of the curved wall is marked correctly.

This integrates the entire arc into the polygon in one go.
The next step is to enter the part of the slab that extends toward
the column.

7 Change the viewpoint and use the corners and grid points to
define the remaining points for the outline of the slab. The slab
rests exactly on the walls.

Architecture Tutorial

Unit 2: building design

163

8 Click the corner of the column and the point of intersection
between gridline and wall. Select ESC to finish entering the first
polyline.

9 The slab is still missing the part that extends toward the column
in front of the curved wall.
Plus in the input options to integrate this section into the
Click
polyline.

Zoom Section to zoom in on the area around the column
10 Use
and the curved wall.

164

Slab

Allplan 2022

11 Click the upper-left corner of the column, then click a diagonally
opposite point within the curved wall and select ESC:
Allplan creates the rectangular section of the slab.

12 Select the ESC key to close both the outline and the tool.
To adapt the size of the planes to your design, click
Restore 3D
View (Update task area).
Select F4 to open the animation viewport and check the design.

Carport roofs
You will draw the carport roofs in drawing file 101.
These slabs are located immediately below the slab between the
ground and first upper floor but are thinner and will be assigned a
different material.

To draw the roofs over the carports
 Make drawing file 101 Ground floor carport current and open 100
Ground floor model and 109 Ground floor slab in edit mode.
1

Click

Slab again (Components task area).

2 Change the
Properties including the Height.
The bottom level of the carport slab is positioned above the
upper default level of 2.44 m (2.44 m + 0.11 m = 2.55 m) assigned
to this drawing file.
The component thickness of the carport slab is 15 cm.

Architecture Tutorial

Unit 2: building design

3 Zoom in on this area.

165

166

Slab

Allplan 2022

4 Click the corners of the roof outline one after the other and select
ESC to close the polyline.

5 Draw the second carport slab in the same way.
6 Select ESC to close the tool. Change the view type to hidden; the
floor plan should now look like this:

Architecture Tutorial

Unit 2: building design

167

Slab openings
Next, you will insert openings in the slab for the chimney and to
provide access to the top floor.
Height settings are not required for openings in slabs as they always
pierce the slab in its entirety.

To draw a rectangular slab opening
 Make drawing file 101 Ground floor slab current and open
drawing files 3 Chimney, 100 Ground floor model and 109
Ground floor carport in edit mode.
 If you cannot see the chimney, make the layer AR_CHIMN visible.
1

Click

Recess, Opening in Slab (Components task area).

2 Click the ground floor slab.
3 Click

Properties.

4 Select the icon for a rectangular opening and enter 0.35 for the
length and width of the opening.

lower right and click the lower5 Switch the anchor point to
right corner of the chimney.

168

Slab

Allplan 2022

You will use a freeform opening for the stairs. By opening the
drawing file with the stair outline in reference mode, you will find it
easy to enter the outline of the opening.

To draw a freeform slab opening
 The tool is still open. Make the layer DE_GEN02 with the stair
outline visible.
1

Click

Properties.

2 Select the icon for a freeform opening.

3 Zoom in on the area around the stair.

Architecture Tutorial

Unit 2: building design

169

4 Click the points on the boundary of the stair outline one after the
other. To do this, click
Enter at right angles in the dialog line.
To close the polyline, make sure the last point you click coincides
with the first one.

5 Select ESC to close the tool.
Tip: Slab openings and slab
recesses are created in the
same way.
The only difference is that
slab recesses have their
own height settings
because they do not pierce
the slab completely.

Close drawing file 3 Chimney. Now the
Front Right,
Southeast Isometric View looks like when you select the
Hidden view type:

170

Exercise 3: top floor

Allplan 2022

Exercise 3: top floor
In this exercise, you will make the top floor by copying the ground
floor to relevant drawing files for the top floor and then raising these
by the height of one story. You will also find out about some of the
tools that you can use to make alterations to the floor plan.

Objective
When you design the top floor in a building, you can
• Draw the elements from scratch or
• Copy and modify the elements. Copy the elements from an
existing floor to new drawing files and then make alterations.
In this tutorial, you will use the second method.

Floor plan of top floor

Architecture Tutorial

Unit 2: building design

Isometric view of the top floor (without the roof)

U-type stair from the ground floor to the top floor

171

172

Exercise 3: top floor

Allplan 2022

Copying components between documents
You will begin by copying drawing file 100 Ground floor model to
drawing file 110 Top floor model.
Note: You can also copy drawing files in the building structure. The
program always copies all elements of the drawing file, including
hidden and frozen layers.

To copy components between documents
 The Architecture role and the Elements task are open.
1

Click
Open on a Project-Specific Basis and select drawing
file 100 Ground floor model. Close all the other drawing files.

2 Open the Layers palette and click List layers used in open
documents on the shortcut menu.
3 Make the following layers modifiable:
DE_GEN02, AR_WALL and AR_COL.
Hide all other layers.
4 Click
Copy, Move Elements between Documents... in the
drop-down list of the Allplan icon on the title bar.
5 Select Copy and click OK.

6 In the Select drawing file dialog box, click
Building structure at the top and select drawing file 110.

Architecture Tutorial

Unit 2: building design

173

7 Click All in the input options.
8 Click
Open on a Project-Specific Basis and select drawing
file 110. Close all the other drawing files.
9 Rename drawing file 110 Top floor model. To do this, click
Rename on the shortcut menu.
10 Close the Open on a project-specific basis: drawing files from
fileset/building structure dialog box.
Note: Drawing file 110 Top floor model belongs to the building
structure you defined at the beginning of this tutorial. Therefore,
this drawing file takes its height settings from the top floor in the
plane model.
Copy, Move
As you copied the drawing file by using
Elements between Documents, the architectural elements
coming from drawing file 100 Ground floor model got the height
settings of the top floor.
You can find detailed information on "Behavior of default planes
when copying or moving elements between documents" in the
Allplan Help.
To check the height settings of drawing file 110 Top floor model,
open the
List Default Planes tool (Annotations task area).

174

Exercise 3: top floor

Allplan 2022

Modifying the top floor
Allplan offers a wide range of tools you can use to modify data at any
time.
When modifying, you must differentiate between the following
situations:
• Changes you make to element properties and their height
settings by using
Apply Archit. Component Properties. You
can apply this tool to components of the same type (for example,
walls only).
• Changes you make to components of different types by using
Change Archit. Properties. You can use this tool to modify
element properties and their height settings (for example, height
and material of walls and columns) in a single step.
• You can also modify individual elements by selecting Properties
on the shortcut menu.
• Changes you make to the geometry in the xy plane by using the
tools in the Edit task area and on the shortcut menu of an
element.
To modify components in the z-direction, use the following tools
only:
Change Archit. Properties
Apply Archit. Component Properties or Properties on the
shortcut menu of the component

Architecture Tutorial

Unit 2: building design

175

Deleting design entities
You will start by deleting redundant design entities. You can use the
architectural filters.

To delete design entities
 Actionbar: Architecture role - Elements task.
Use the Layers palette to hide layer DE_GEN02 (stair outline).
1

Click

Delete (Edit task area).

2 Go to the Filter task area and click
Type.

Filter by Archit. Element

3 Only elements that are in the drawing file are available in the
architecture filter.
Select the component Wall and the thickness 0.100.
If the required thickness is not available in the list, enter the value
in the input line.

4 Enclose the entire design in a selection rectangle.
The elements selected for filtering are immediately deleted.

176

Exercise 3: top floor

Allplan 2022

5 Use the Window opening filter to delete all the windows. This
also deletes the window SmartParts.
6 Now delete the round columns, the curved wall, the vertical
section of wall at the top, the short vertical wall sections at the
bottom and some of the doors.
After this, your screen should look like this:

7 Select ESC to close the

Delete tool.

Architecture Tutorial

Unit 2: building design

177

Joining walls
Walls that are not parallel can be joined with the Join Linear
Components tool. You will use this tool to close the open corners.
Tip: You cannot join curved
walls with other walls.

To join walls
1

Right-click the horizontal wall at the top. On the shortcut menu,
select the
Join Linear Components tool.

2 Click the left exterior wall.

Tip: You can enter any joint
width at the keyboard.

3 Click the lower exterior wall and join it with the left exterior wall.
Then click it again and join it with the right exterior wall.

178

Exercise 3: top floor

Allplan 2022

4 Now join the interior walls at the bottom with the exterior walls.
Do not forget to join the former, lower-left exterior wall with the
interior wall you have just lengthened.
Now your floor plan should look like this:

5 Select ESC to close the tool.
• Since you have made major changes to the architectural
elements, minor inaccuracies might occur. It is thus a good
idea to recalculate the architectural elements:
• Click

Restore 3D View (Update task area).

• Click All in the input options.
Allplan recalculates the architectural elements. This can take
some time.

Architecture Tutorial

Unit 2: building design

179

Modifying the thickness of walls
Some of the walls are now no longer exterior walls - they have
become interior walls. To change the thickness of these walls, you
Apply Archit. Component Properties tool.
will use the
Tip: You can find more
information on the
component axis in the
Allplan Help.

When creating these walls, you defined the offset direction inward:
The wall axis is thus on the outside. As the side where the axis is
located does not change, the new thickness would also be applied
toward the inside. You therefore need to move the axes of these
walls to the opposite side (inside).
To see better what you are doing, you can also display the
Options, Components and
component axes in plan: Open the
architecture page, Component axis area and select the Display
component axes option.

180

Exercise 3: top floor

Now the walls look like this:

Allplan 2022

Architecture Tutorial

Unit 2: building design

181

To modify the thickness of walls
1

Right-click the former left exterior wall and select Properties on
the shortcut menu.

2 Select the Reposition axis within the wall option and use the
mouse to drag the component axis to the opposite side of the
wall in the preview. Click OK to confirm.
The result looks like this:

3 Repeat steps 1 and 2 for the former exterior wall on the right.
4 Click
Apply Archit. Component Properties (Components
task area).
Tip: You can also use
Modify Offset to
change the thickness of
walls.

5 The former exterior walls will become 17.5-cm interior walls.

Click the element whose settings you want to match
Click a suitable interior wall to match its parameters
The Wall dialog box opens, displaying the parameters of the wall
you clicked. Check that the thickness is 0.175 and the priority 175.
Here, too, drag the component axis to the opposite side of the
wall.

Note: Check the Modification mode, making sure Wall (recreate
wall based on axis) is selected.
6 Click OK to confirm the dialog box.

182

Exercise 3: top floor

Allplan 2022

7 Select Replace attributes on the context toolbar so that the
attributes of the selected interior wall replace those of the
exterior wall.

8 Click the two former vertical exterior walls at the bottom and
right-click to confirm.

The wall thickness changes. If it is necessary, join the walls with
the other interior walls again.
The result should look like this:

Architecture Tutorial

Unit 2: building design

183

Moving walls
To move the walls, you can use the Stretch Entities tool. This tool
moves walls together with their doors and windows without
changing the wall junctions.

To move walls
Tip: Do not work with the
crosshairs to move walls in
conjunction with the
Stretch Entities tool.
Always enter precise values
in the dialog line.

1

Click

Stretch Entities (Change task area).

2 Select the lower-right interior wall.
3 Define the new position of the wall as follows:
a) From point: Click the wall corner.
b) To point: Point to the interior wall corner at the bottom.
The boxes are highlighted in yellow.
c) Enter
y-coordinate = 1.76 in the dialog line.
d) Select ENTER to confirm.

4 Move the upper-right interior wall.
5 Select ESC to finish.

184

Exercise 3: top floor

Allplan 2022

You can also move walls by using direct object modification.
However, you must restore the wall junctions afterward.

To move walls by means of direct object modification
1

Enclose the upper-left interior wall in a selection rectangle.
The wall has handles.

2 Point to the wall without snapping a handle.
3 On the context toolbar, click

Move.

Architecture Tutorial

Unit 2: building design

185

4 <Move> From point or enter offset:
Click the point where the upper edge of the wall and the left
exterior wall intersect.

5 <Move> To point or enter offset:
Enter
dy = 1.0 in the coordinate dialog box and select ENTER to
confirm.

6 Select ESC to close direct object modification.
7 Hide the component axis again. To do this, open the
Options
(Components and architecture page - Component axis area).
8 Join the two interior walls by using

Join Linear Components.

186

Exercise 3: top floor

Allplan 2022

The floor plan should now look like this:

Deleting wall sections
You can use the Delete Section of Linear Component tool to delete
entire wall sections. Two smaller, discrete walls are created based on
the wall.

To delete wall sections
1

Right-click the wall from which you want to delete a section. On
the shortcut menu, click
Delete Section of Linear
Component.

Architecture Tutorial

Tip: If the point you click on
the component is not a
significant (defined) point, a
small square will appear to
indicate the nearest
significant point together
with the distance between
the square and the point
you clicked (represented by
an arrow).

Unit 2: building design

187

2 Click the first point on the component - the corner of the wall.
3 Click the second point on the component (= the other corner).

Joining walls with lines
Walls can also be joined with lines in the same manner as the Join
Linear Components tool. The main difference occurs when joining
multilayer walls: If you want to join only one layer in the wall, use Join
Linear Components to select the layer separately from the others.
Join Linear Component with Line, however, always lengthens the
entire wall.
The exterior walls on the left and right sides need to be modified so
that they stretch as far the columns over which the balcony will later
be constructed.
You will find it helpful now if you display the grid you drew earlier.

To join walls with lines
1
2
Tip: You can also find the
Join Linear Component
with Line tool on the
shortcut menu.

Open drawing file 1 Grid in reference mode and make the layer
DE_GRID visible.
Delete (Edit task area) the rectangular columns.

3 Click
area).

Join Linear Component with Line (Components task

4 Click the left exterior wall.

188

Exercise 3: top floor

Allplan 2022

5 Click the gridline through to which the wall is to extend.

6 Use the same approach to lengthen the exterior wall on the right
side.

7 Close drawing file 1 Grid.

Changing the height settings of a wall
The modifications you have made so far have involved alterations in
the xy plane. In the following exercise, you will change the height of
part of the left wall, at the end of the balcony. It needs to be 1.27 m
high.

To change the height settings of a wall
1

Tip: You can also doubleclick a component to view
its Properties.

Click
3 Viewports ( Window drop-down list on the Quick
Access Toolbar) so that you can better observe the changes as
they happen.

2 Right-click the section of wall on the outer left. On the shortcut
menu, click Properties.
The Wall dialog box opens, displaying the parameters of the wall
clicked.
Click Height.... Leave the bottom level as it is. Change the
settings for the wall’s top level as follows:

Architecture Tutorial

Unit 2: building design

• Top level area:

189

Relative to lower plane = 1.2700

3 Click OK to confirm the settings in the dialog boxes.
You can see how the height changes in isometric and elevation
view.

Modification options
You should now be aware of the main modification tools. It is up to
you to decide whether it is quicker to use one of these tools or
whether it’s more efficient drawing new elements from scratch. Do
not forget the other, more general tools which you can use to copy,
mirror and so on.
Tip:
Modify Offset,
Stretch Entities, and
Fold Line function in 2D
in the same way.

190

Exercise 3: top floor

Task
Modifying parameters
Modifying parameters (such as
height, thickness, dimensions)
of architectural components of
the same type;
Repositioning the component
axis in the element
Apply Archit. Component
Properties
Modifying the parameters of a
single architectural element
(analogous to creation)
Shortcut menu - Properties
Modifying architectural
elements of different types
(including height settings)
Change Archit. Properties
Modifying the geometry
Changing the wall thickness
Modify Offset
Lengthening, shortening,
moving walls;
changing opening sizes
Stretch Entities
Folding wall lines; fitting in wall
ends
Fold Line
Joining walls
Join Linear Components

Allplan 2022

Tool

Result

Architecture Tutorial

Unit 2: building design

Joining walls with lines
The difference between this
and joining a wall with a wall is
evident in the case of multilayer
walls.
Join Linear Component with
Line
Deleting wall sections (the wall
is divided into two sections)
Delete Section of Linear
Component
Showing and hiding wall
junctions
Each wall is delimited by a
boundary line even when it
appears to seamlessly ‘flow’
into the next wall. This tool only
affects how a wall looks; it does
not affect the component itself.
Show/Hide
Junctions

If you have chosen to display the component axis,
Modify Offset,
Stretch Entities, and
Fold Line
might produce different results.
You can find more information in the Allplan Help; see the chapter
about the component axis.

191

192

Exercise 3: top floor

Allplan 2022

Modification
Now it's your turn. Finish modifying the top floor and add the missing
doors and windows. When you have finished, the top floor should
look like this:
Tip: For the balcony door,
you can use the 2c wood
rabbet SmartPart you can
find in the 2 casements
folder (Library palette Default - Architecture Windows).

Drawing the balcony parapet
In this exercise, you will be using tools with which you are already
familiar - Wall (straight and curved) and Delete Section of Linear

Architecture Tutorial

Unit 2: building design

193

Component. The parapet is 1.17 m high; the upstand is 25 cm high and
8 cm from the edge of the slab.

To draw the balcony parapet
1

Open the
Default Settings drop-down list on the Quick
Access Toolbar and click
Options. Select the Components
and architecture page.

2 Go to the Components area and select the Different material
names option for Display junction lines, division lines between.
3 Click OK to confirm the dialog box.

194

Exercise 3: top floor

Allplan 2022

4 Double-click a wall with the right mouse button.
This selects the
5 Change the

Wall tool.
Properties

on the Surface elements tab:
Hatching: off
Parameters, attributes tab:
Material: Brick
Thickness: 0.15
Priority: 150
Now click the Height... button and specify the following:
-

In the Top level area, click
enter 1.17.

Fixed component height and

-

In the Bottom level area, click
enter an offset of 0.00.

Relative to lower plane and

Architecture Tutorial

Unit 2: building design

195

6 Draw the parapet. Check the wall's offset direction. If it is not
correct, change it by clicking
Reverse offset direction.

The Wall tool remains active!
7 Change the

Properties

Parameters, attributes tab:
Material: B15
Priority: 100
Height:
Top level:
Fixed component height: 0.25
Bottom level:
Relative to lower plane: 0.00
8 Draw a straight wall. You can draw the wall in one go. Due to its
lower priority rating, a ‘hole’ is automatically cut out of it where it
intersects the parapet wall.

9 Select the ESC key to finish the straight wall. Now draw a curved
wall that follows the path of the wall on the ground floor.

196

Exercise 3: top floor

Allplan 2022

A = From point
B = To point
C = Arc's extension point
D = Wall's offset direction
10 Delete the wall sections that are not required by selecting
Delete Section of Linear Component (shortcut menu).

A1 = From point
B1 = To point
A2 = From point
B2 = To point
11 Select ESC to close the tool.

Architecture Tutorial

Unit 2: building design

197

You can now complete the top floor yourself by adding dimensions,
labels, and furniture. Make sure that you assign the correct layers to
the elements.
When you have finished, the plan of the upper floor might look
something like this:

198

Exercise 3: top floor

Allplan 2022

Architecture Tutorial

Unit 2: building design

199

Exercise 4: basement
Now is a good time for you to start trying things out on your own.
The best way to design the basement is to combine the Draw the
elements from scratch and Copy and modify methods you are
already familiar with.
As the following steps have been covered before, the descriptions
are less detailed.

Copy the components from drawing file 100 to drawing file 120
• Make drawing file 100 Ground floor model current and close all
the others.
• Use
Copy, Move Elements between Documents (dropdown list of the Allplan icon on the title bar) to copy the
necessary components (curved wall, columns, stair outline and
some of the interior walls) from drawing file 100 Ground floor
model to drawing file 120 Basement model.

200

Exercise 4: basement

Allplan 2022

Modify the elevation specifications of the basement
•

•

Open on a Project-Specific Basis; make drawing file 120
Basement model current and open drawing files 100 Ground
floor model and 110 Top floor model in reference mode.
- 1 Viewport; select

Front, South Elevation.

• Open the Planes palette and turn

Modification mode on.

• Change the bottom level of the basement to -2.61 m
(corresponds to the unfinished basement floor).

• Retain the height of the planes above.

Architecture Tutorial

Unit 2: building design

• Click Apply in the Planes palette.

• Define behavior of drawing files:

• Turn

Modification mode off in the Planes palette.

201

202

Exercise 4: basement

Allplan 2022

Design the basement
• Make drawing file 120 Basement model current and open
drawing file 100 Ground floor model in reference mode.
•

Switch to Plan view.

• Here, it's quicker to create the exterior walls from scratch.
Instead of making modifications, draw the exterior concrete walls
along the inside edge of the ground floor walls.
• Close drawing file 100 Ground floor model.
• You can now modify the components you copied to drawing file
120 Basement model.
• Draw the slab in drawing file 129 Basement slab. Assign the
Bottom level of ground floor and Top level of basement planes
to this drawing file. Do not forget the slab openings for the stair
and the chimney!

Architecture Tutorial

Unit 2: building design

203

204

Exercise 4: basement

Allplan 2022

Architecture Tutorial

Unit 3: planes

205

Unit 3: planes


The exercises in this unit require the Architecture role on the
Actionbar.

Planes help you work in 3D space, because you do not
need to calculate the height settings for all components.
Planes are very flexible; they come in two types:
 Default planes are horizontal and parallel to each
other. They apply to the entire drawing file.
 Custom planes are not necessarily horizontal. They
apply only to the area you define by entering the
outline of the planes.
Default planes and custom planes always come in pairs
- an upper plane and a lower plane.
The general approach is as follows:
 Define the position of the pair of planes in space.
 Define the height settings of the components (walls,
columns, windows, niches, and so on) relative to the
planes. In other words, attach the top level and bottom
level of a component to the upper or lower plane at an
offset of your choice.
This might appear complex at first. However, experience
has shown that this is a simple, elegant, and accurate
approach, which is particularly useful for designing
multistory buildings.

206

Exercise 4: basement

Allplan 2022

Planes are the backbone of building design in Allplan.
Default planes are ideally suited for early planning
phases involving planar components. Subsequent
planning phases (LOD 300/400) usually require inclined
components. Here, you can use several custom pairs of
planes. Depending on the component shape, you might
need several discrete triangular surfaces for the custom
planes. However, these planes cannot be edited quickly
or easily.
In addition, Allplan provides two other plane types:
reference surfaces and offset planes. These planes do
not come in pairs; instead, you use them as single planes.
Reference surfaces are easy to use; so, they are real
alternatives to custom pairs of planes. You can use a
reference surface locally in one drawing file or you can
integrate a reference surface in a plane model, thus using
this reference surface across drawing files. When a
reference surface is part of the plane model, you can
define the height settings of components based on this
reference surface in all drawing files.
An offset plane is linked with another plane. When you
change the linked plane, the offset plane adapts
automatically, including all components that are defined
based on this offset plane. This also works across stories.

Architecture Tutorial

Unit 3: planes

207

Using planes
Default planes
You have already worked with the default planes in this tutorial. The
section that follows explains the concept of the default planes in
more detail.
Imagine two horizontal planes in three-dimensional space, parallel to
each other and at different elevations. When you position a
component (for example, a wall) between the two planes, the
program "stretches" the wall so that its top and bottom levels are
flush with the upper and lower planes respectively. Every drawing
file has an imaginary pair of planes (these are called the default
planes). Default planes are invisible and stretch to infinity.

The default planes can be defined at different heights in different
drawing files. By attaching a component’s top and bottom levels with
these planes, you ensure that any changes you make to the height
of the planes also apply to the component. So, you can change the
story height for all components by changing a single value.
You can enter a distance between the top level (TL) and bottom level
(BL) of the component and the upper and lower planes respectively.
You can also define whether this distance is constant.
For example: Elevation at top is 3.50; elevation at bottom is 1.00.

208

Using planes

Allplan 2022

A = upper default plane; B = lower default plane
Top level:
Relative to upper
plane -1.275 m

Top level:
Relative to lower
plane 3.00 m

Top level:
Relative to upper
plane 0.5 m

Bottom level:
Relative to lower
plane 0.00 m

Bottom level:
Relative to lower
plane 0.5 m

Bottom level:
Relative to lower
plane -0.75 m

Changing the default planes in a drawing file affects all components
whose height settings are based on these planes.
There is no rule as to how place the reference planes. However, as a
rule of thumb, you might consider the following:
• Default planes at top level of unfinished floor

Architecture Tutorial

Unit 3: planes

209

• Lower default plane at the top level of the unfinished floor
Upper default plane at the bottom level of the unfinished floor
(used in this tutorial)

• Lower default plane at the top level of the finished floor
Upper default plane at the bottom level of the suspended ceiling
(for example, for interior designers)

Custom planes
Default planes do not afford the possibility of accounting for height
differences within a component - sloping walls, for example. In this
case, you can use custom planes.
Custom planes also come in pairs. However, they do not stretch to
infinity; they have a boundary. You can define the outline of the
planes in plan - any shape you want. These planes (there are always
two) can be inclined at any angle and any height that you assign to
them.
Tip: Components can also
be linked with planes that do
not necessarily envelop the
components.

210

Using planes

Allplan 2022

You can define as many custom pairs of planes as you like in a
drawing file; these planes take precedence over the default pair. All
the components whose height settings are based on planes adapt to
the envelope defined by these planes. If no custom plane has been
defined, then the components default to the default planes.

(A) Upper default plane

C = Top level of
component attached to
the upper plane at an
offset

 Upper custom plane

(B) Lower default plane

D = Bottom level of
component attached to
the lower plane at an
offset

 Lower custom plane

When you design a roof frame, you are in effect creating a whole
series of custom pairs of planes in a simple and elegant manner - you
will see how this is done in the next exercise.
Custom Planes and
Modify Planes tools can be
The
combined, providing enormous design flexibility. Presenting these
tools is beyond the scope of this workbook – however, by
experimenting a little, you will quickly master what these tools are
capable of.

Architecture Tutorial

Unit 3: planes

211

Reference surfaces
You can create reference surfaces from any polygonal or freeform
3D surfaces. To do this, you can use the 3D surface to reference
surface tool, which you can find on the shortcut menu of any 3D
surface.
At first, reference surfaces are local reference surfaces. This means
that they are in the drawing file in which they were created from a
3D surface. Like components, reference surfaces can be copied,
mirrored, moved, or deleted. You can even copy them across
drawing files. To tell them apart, you can use the shortcut menu to
rename reference surfaces that you copied or mirrored.
Local reference surfaces apply only to the drawing file in which they
are located. When components are within the area of reference
surfaces, you can define the height settings of these components
based on the reference surfaces.
If your project has a plane model, you can insert a local reference
Insert or replace
surface in the plane model by using the
reference surface tool in the Planes palette. The height of the
reference surface is defined by the z-value of the lowest point in the
reference surface. After you have integrated the reference surface
in the plane model, you can define the height settings of components
based on this reference surface in all drawing files. Unlike a
roofscape, the reference surface need not be assigned to other
drawing files.

212

Using planes

Allplan 2022

In this example, a part of the wall is attached to the sloping
reference surface (C) and another part of the wall to the Top level
of ground floor (A) default plane.
You cannot change the geometry of a reference surface in a plane
model. Instead, adjust a local reference surface and replace the
Insert or replace
reference surface in the plane model by using
reference surface. This does not change the height definition of
components.
Note: The reference surface in the plane model is no longer linked
with the local reference surface in the drawing file.
Note: Reference surfaces cannot replace
Roof Frames or
roofscapes in all cases: Timber elements like
Rafters do not have
their own height definition. Instead, they take their height settings
from the roof frame.
In Allplan most architectural elements can be associated with
reference surfaces. This includes not only walls and slabs but also
Path or
Planning and Planting
components created with the
tool.
You can find further information about reference surfaces in the
Allplan Help.

Architecture Tutorial

Unit 3: planes

213

Offset planes
You can create an offset plane in the plane model in the Planes
palette. To do this, you can use the
Offset plane tool on the
toolbar of the Planes palette. You can also find this tool on the
shortcut menu of a story.
The offset plane is linked with a default plane at an offset you define.
When you change the linked plane, the offset plane adapts
automatically, including all components that are defined based on
this offset plane. When defining the offset plane, you can select the
Applies to all floors option to apply this offset plane to all stories of
the plane model. When an offset plane applies to all stories, you can
symbol in floor manager.
see the

214

Exercise 5: roof

Allplan 2022

Exercise 5: roof
Tip: Read the chapter "Roof
– Basics" in the Allplan Help:

The Roof task area in the Elements task contains tools you can use
to create custom planes quickly and easily.
A roof frame is comprised of several pairs of reference planes: Each
slope in the roof represents one pair of reference planes. The upper
plane lends a shape to the roof while the lower plane in the pair
remains horizontal. Thus, you can easily construct flank walls
between the planes. If the walls are already plane-associated (as in
this example), then they will adjust automatically to the reference
planes in the roof frame.
A roof can consist of several roof frames. All you need to do is draw
the outlines of the additional roof frames in plan. They can cover an
existing roof in its entirety or parts thereof. Allplan will automatically
calculate and intersect the roof planes.

How to design a roof
1

Enter the roof outline and the top level and bottom level of the
roof.
Allplan will initially create a cube-like frame.

2 Apply slopes to the frame and make settings for the height.
Height setup:
• Enter the absolute height of the eaves or
• Define a point through which the slope is to pass.
This will form the roof shape.
3 Use the
Roof Covering or
covering.

Slab tool to apply a roof

Architecture Tutorial

Unit 3: planes

215

Roof frame
In this sample building, you will add a roof with a dormer. The pitches
of the main roof pitch and the dormer are 35°. The flank of the roof
joins with the flank walls at the sides of the building. The roof pitches
extend to the inside edge of the exterior walls to create a hidden
eaves gutter. The position of the roof slopes will be defined by the
height for the line of the eaves.

Isometric view of the top floor with the roof

To create the main roof
 Make drawing file 112 Roof current and open 110 Top floor model
and 3 Chimney in edit mode.
 Make sure only the layers AR_WALL, AR_ROOF and AR_CHIMN
are visible.
 The Architecture role and the Elements task are open. Expand
the Roof task area.
1

Click
Roof Frame (Roof task area) and check the Properties
palette to see whether the AR_ROOF layer is selected. If it isn’t,
select it now.

216

Exercise 5: roof

Allplan 2022

Note: If you cannot select the layer in the Properties palette,
open the
Options ( Default Settings drop-down list on the
Quick Access Toolbar) on the Planes page and check the setting
of the Default setting - fixed format properties option. This
option must not be selected.

2 Click

Gable/hip roof.

3 Click Angle and enter 35.
The bottom of the roof frame is to be flush with the lower default
plane of the top floor.
4 Click Bottom level and enter 2.64.
5 Click Top level and enter 10, as the top level of the roof frame
must be above the future ridge.

Architecture Tutorial

Unit 3: planes

217

6 Click Eaves and enter the height of the eaves: 3.44.

Tip: When you enter the
outline of a roof, you can
define an offset as you
would when enclosing
entities in a parallel offset
polyline.
The polyline entry tools are
also available here.

Now enter the rectangular outline of the roof (lines representing
the eaves):
7 Right-click in the empty workspace (do not click an element!),
select
Point of Intersection on the shortcut menu and click
the first corner.
8 Click a diagonally opposite point and then select the ESC key.
This defines a rectangle.

A = 1st point = point of intersection
B = diagonally opposite point

218

Exercise 5: roof

Allplan 2022

9 Click
3 Viewports.
The roof frame is still a simple cube.
10 In plan view, click the edges of the roof to indicate where the
slopes are to be applied.
Observe the changes as they happen in the isometric view.

A = Click edges of roof frame to apply slopes
11 Select ESC to finish defining the roof.
You can now create the dormer by using two more pairs of custom
planes. To define the position of the slopes, you will use the height of
the eaves. The dormer’s eaves are 4.48 m high and consequently
higher than the eaves of the main roof.

Architecture Tutorial

Unit 3: planes

219

To create a dormer
1

Click

Dormer (Roof task area).

2 Click an edge of the main roof.
3 Check the roof parameters and
modify the Eaves to 4.48

4 Define the outline of the dormer in plan by clicking diagonally
opposite points. Use
Point of Intersection (Point Assistant
on the shortcut menu) to help you. The outline must define the
starting point and the width of the dormer exactly. The length
toward the middle of the building is sufficient for the intersection
of the roof planes.

220

Exercise 5: roof

Allplan 2022

A = 1st diagonal point (point of intersection)
B = 2nd diagonal point
5 Select ESC to finish. Now you have defined the outline of the
dormer.
6 Click the dormer on both sides.
This will form the slopes.
7 Select ESC to close the tool.

Architecture Tutorial

Unit 3: planes

221

Modifying the roof frame
Roof planes can easily be modified. You can find the relevant
parameters on the context toolbar.
In this exercise, you will draw a 1-m elevation line. This will be a useful
aid later on.

To draw an elevation line
1

Click

Modify Roof Frame (Roof task area).

2 Click the ridge of the roof.
3 To specify the absolute height of Elevation line 1, enter 3.75
(1 m above finished floor on the top floor). Enter 0.00 for
Elevation line 2.
The elevation line is drawn as a construction line.
4 Select ESC to close the tool.

222

Exercise 5: roof

Allplan 2022

Roof covering
To apply the roof covering, use the Roof Covering tool. The bottom
level of the roof covering is flush with the upper roof plane. The
distance between the planes and the top of the roof covering will
determine the thickness of the roof covering.

To create a roof covering
 Make drawing file 3 Chimney current and open 110 Top floor
model in reference mode.
1

Select the
Roof Covering tool (Roof task area) and check the
Properties palette to see whether the AR_ROOFC layer is
selected.

2 Click

Properties.

3 You want to create a roof covering that consists of a single layer
and that covers all roof planes and dormer planes. Select the
following settings:
•

Roof covering consisting of a single layer

•

Roof covering above all roof and dormer planes

4 Click the Relative height button.
You will place the roof covering in the area of the roof frame that
you have just created. The roof frame stretches between the
two roof planes (= custom planes).

Architecture Tutorial

Unit 3: planes

223

Note: Custom planes (and consequently roof planes, too) have
precedence over default planes. This means that all plane-based
components in the drawing file will adapt to the custom roof
planes.
In this example, the upper plane is the top of the roof frame.
5 Click

Relative to upper plane.

info button, you can
By clicking the button to the right of the
select the reference plane in the plane model. As the custom
planes have precedence over default planes, this setting is
irrelevant in this example.
6 Enter Offset = 0.0.
So, the bottom level of the roof covering is flush with the roof
plane.
7 Click OK to close the Relative height dialog box.
8 The polygon you enter for the roof covering in plan is to apply to
the top level of the roof covering. Select the corresponding
option.

224

Exercise 5: roof

Allplan 2022

9 Open the Parameters, attributes tab and enter the following:
• Thickness: 0.2
• Material, qualities: Concrete
• Trade: Concreting work
• Priority: 200
• Calculation mode: m³
• Eaves:
• Ridge:

10 Click OK to confirm the dialog box.
11 Click Multi in the input options.

Architecture Tutorial

Unit 3: planes

225

12 Click the corners of the roof outline. Make sure the last corner
you click coincides with the first one.

13 Click Minus in the input options.

14 Draw a "minus" roof covering; in other words, cut out a section
for the chimney.
15 Select ESC to close the tool.
16 Close drawing files 3 Chimney and 110 Top floor model again.
You can use Multi in the input options to specify whether the area
you enter is to be added (Plus) or subtracted (Minus).

By placing a check mark in the box, you can specify how the polyline
entry tools handle architectural lines and how these tools behave
when you generate polylines based on existing elements.

226

Exercise 5: roof

Allplan 2022

Slab or roof covering?
In theory, you can use either tool to create a roof covering. The
difference is:
Roof Covering protrudes beyond the area of the roof
• When a
planes, it retains its slope setting.
• The areas of a
Slab that protrude beyond the roof planes
automatically adapt to the default planes.
• You can use the
Roof Covering tool to enter different shapes
for eaves and ridge.
• With the
Roof covering tool, you ensure that the
representation will be accurate when the masking plane tool is
used.
• With the
Slab tool, the masking plane has the same effect as
when it is applied to walls and columns.
• Openings in the
Roof Covering are created with the
Skylight tool. You can also insert skylight SmartParts in these
openings.
Slab tool, you create openings
• When you use the
by using the Recess, Opening in Slab tool. Smart 3D symbols
inserted in these openings do not adjust to custom planes or roof
frames.

Joining walls with the roof
Use floor manager to join the flank walls and interior walls with the
roof. Drawing file 112 Roof contains the roof planes and the roof
covering. This forms the roofscape that you will integrate in floor
manager. After this, you can assign the custom roof planes to all
plane-based components in drawing file 110 Top floor model.
Custom planes (and consequently roof planes, too) have precedence
over default planes. This means that all plane-based components in
the drawing file will adapt to the custom roof planes.

Architecture Tutorial

Unit 3: planes

227

To insert a roofscape
 Drawing file 112 Roof is current. All the other drawing files are
closed.
1

Open the Planes palette and turn

Modification mode on.

2 Select the Top floor structural level. This is the level into which
you want to integrate the roofscape.
3 Click

Insert or replace roofscape.

Tip: You can also find the
Insert or replace
roofscape tool on the
shortcut menu of the
selected structural level.

4 Do not change the roofscape planes compared with the planes
from the source drawing file 112 Roof.
Therefore, select the Retain position of roofscape option in the
input options.

228

Exercise 5: roof

Allplan 2022

Note: Click the info button in the input options to get more
information on the three options.

5 Select roof plane or custom plane
Click the roof plane.
Allplan takes the roofscape from drawing file 112, adding the
roofscape to the Top floor structural level in the Planes palette.

6 Click Apply in the Planes palette.

Architecture Tutorial

Unit 3: planes

229

7 Click
Open on a Project-Specific Basis (Quick Access
Toolbar).
8 Open the shortcut menu of drawing file 110 Top floor model and
select Assign planes.

9 Select the Roof check box in the Assign Planes dialog box and
click OK to close the dialog box.

230

Exercise 5: roof

Allplan 2022

10 Click OK to confirm the Behavior of drawing files dialog box
without selecting an option.
You are back in the Open on a project-specific basis: drawing
files from fileset/building structure dialog box. As you can see,
drawing file 110 Top floor model has been given the planes of the
roofscape.

11 Make drawing file 110 Top floor model current and close all the
others.
You selected
3 Viewports at the beginning of this exercise. If
you look at the isometric view, you can see that the flank walls
and interior walls of the top floor have adapted to the roof planes.
To display the design in animation, select F4 or click View Type
on the viewport toolbar and select Animation.

The exterior walls on the side are not beneath the roof planes and
are thus unaffected.

Architecture Tutorial

Unit 3: planes

231

Joining walls with the roof
As you can see, the interior and exterior walls on the top floor are
joined with the roof planes.
The side wall on the right is not enveloped by the roof frame;
therefore, this wall adapts to the upper default plane.
The side wall on the left is enveloped by both the planes in the
dormer and the default plane. You must divide this wall segment into
three wall sections so that you can handle each section separately.

A = Do not join wall segment
B = Divide wall here

232

Exercise 5: roof

Allplan 2022

To join walls with the roof
 Only drawing file 110 Top floor model is open.
1

Click
Delete Section of Linear Component (Components
task area) and delete a section of the wall, starting at the division
point.

A = Delete wall sections
B = Join wall with line
Tip: Selection preview point to the wall without
clicking: The relevant wall
section appears in the
selection color.

2 Click
Join Linear Component with Line (Components task
area) and join the wall sections again. There are still three wall
sections, even if the edges are no longer visible.
3 Click
Change Archit. Properties (Change task area) and
change the height for the top level of the side walls that are not
below the roof frame.

Architecture Tutorial

Unit 3: planes

4 Select the check box beside Height.
The Height dialog box opens.

233

234

Exercise 5: roof

Allplan 2022

Tip: If the walls do not
assume the full new height,
you must update the wall
junction between adjacent
exterior walls by using
Join Linear
Components.
Check the wall junction
Options,
lines: Open the
Components and
architecture page,
Components area and
select the Display lines
where components
intersect option.

5 In the Height dialog box, select Modify top level and
Relative
to lower plane, enter an offset of 1.17 and click OK to confirm.
Leave the bottom level as it is.
6 Click the exterior walls to be modified. They appear in the
selection color.
7 When you have selected all components, click Apply in the
Change Archit. Properties dialog box.
+

Modifying the height of the chimney
The bottom level of the chimney is attached to the bottom level of
the basement and the top level of the chimney is attached to the top
level of the building. When creating the plane model, you assumed a
building height of 7.30 m.

Architecture Tutorial

Unit 3: planes

235

Now you will modify the top level of the chimney so that it adapts to
the height of the top level of the top floor.

To modify the height of the chimney
1

Click

Open on a Project-Specific Basis.

2 Make drawing file 3 Chimney current; open drawing files 100,
109, 110, 112, 120 and 129 in reference mode.
3 Display the building in
toolbar).

Front, South Elevation (viewport

4 Double-click the chimney.
5 Click Height... in the Chimney dialog box.
As you can see, the chimney has the height settings of drawing
file 3: Top level of building (7.30 m) and Bottom level of
basement (-2.61 m).

6 To attach the top level of the chimney to the top level of the top
floor, click the Top level of building button.
The Assign Planes dialog box opens.

236

Exercise 5: roof

7 Select Top level of top floor (5.19 m).

8 Click OK to close the Assign Planes dialog box.
9 Click OK to close the Chimney dialog box.

Allplan 2022

Architecture Tutorial

Unit 3: planes

The chimney has been given the correct height settings.

237

238

Exercise 5: roof

Allplan 2022

Using a masking plane for the top floor
You can use the masking plane to change how architectural
elements look in specific areas or to hide architectural elements
entirely.

To enter masking planes
 Make drawing file 115 current.
Open drawing file 110 Top floor model in edit mode.
Open drawing file 112 Roof in reference mode.
Close all the other drawing files.
 Choose
1

Plan view (viewport toolbar).

Click
Masking Plane (Roof task area) and specify how the
components below the masking plane are to look: Select pen 1
0.25 and line type 2. Hide component hatching and smart
symbols.

Architecture Tutorial

Unit 3: planes

239

2 Click OK to confirm.
3 Check the Properties palette to see whether the layer
AR_MASKP is selected.
Change how the component looks below the 1-m line.
Note: Check the Input Options:
To create several regions at once, click Multi and then Plus.
4 Draw the plane areas as rectangles based on two diagonally
opposite points.
The 1-m line serves as the boundary inside the building. On the
outside, the region will stretch somewhat beyond the walls.

5 Close the tool and open drawing file 112 Roof in edit mode.
6 Click
Restore 3D View (Update task area) and click the right
mouse button twice in the workspace (do not double-click!).
Allplan recalculates the components, taking the masking plane
into account. This does not change the way the roof covering
looks.

240

Exercise 5: roof

Allplan 2022

7 Close drawing files 112 Roof and 115 and make drawing file 110
Top floor model current. Click
Restore 3D View again
(Update task area). The elements appear again without the
masking plane.

Note that when you use the
Restore 3D View tool to recalculate
the display, the masking plane applies to the current drawing file and
all those open in edit mode.
The masking plane applies even if the layer on which it resides is
hidden.

Drawing the upstand
The roof will now be given an upstand that is 11.5 cm wide and 10 cm
high. You will draw this upstand in a separate drawing file. First,
however, you need to assign the roofscape to this file.
You should always make a point of giving your drawing files
meaningful names!

To draw the upstand
Tip: To draw upstands, you
can also use the
Upstand tool (Components
task area).
Here, the top level of the
wall below serves as the
height of the upstand. But
as this is not suitable for
creating upstands on flank
walls, you will use the
Wall tool instead.

1

Click

Open on a Project-Specific Basis.

2 Open the shortcut menu of drawing file 116, click Assign planes
and select the height settings of the story and the roofscape.
Click OK to confirm the Behavior of drawing files dialog box
without activating an option, as the drawing file is still empty.
3 Make drawing file 116 current and open drawing file 110 Top floor
model in edit mode.
4 Use
List Default Planes (Annotations task area) to check the
height settings of the new drawing file 116: Default lower plane =
2.64 m and Default upper plane = 5.19 m and roofscape
5 Click
Wall (Components task area) or double-click an existing
wall with the right mouse button.

Architecture Tutorial

Unit 3: planes

241

6 Define
Properties:
Thickness: 0.115
Material: Concrete
Height: Associate the top level and bottom level with the lower
plane and enter the following values for the offset.
Then click OK to confirm.

242

Exercise 5: roof

Allplan 2022

7 Draw the upstand on the flank walls but not over the dormer.

8 Now change the Height for the end walls in the main roof and the
dormer. The upstand must be flush with the roof covering.

Architecture Tutorial

Unit 3: planes

243

Note: To ensure that the distance between the upstand and the
roof plane stays at 10cm, switch both toggles to
Offset
perpendicular to plane.

9 Draw the upstand on the end walls and above the dormer.

Designing alternatives
With just a few clicks of the mouse, you can design alternative
facades for the balcony.

To design an alternative
 Open drawing files 110 Top floor model and 116. Copy them to an
empty drawing file - 117, for example.
 Assign the roofscape to drawing file 117.
 Make drawing file 117 current and close all the others.

244

Exercise 5: roof

Tip: Instead of having the
parapet pass through the
exterior wall, first use
Join Linear Component
with Line to reset the
exterior wall and lengthen
the parapet.

1

Use

Allplan 2022

Join Linear Component with Line to alter the wall

junctions as shown in the illustration.

Change Archit. Properties to change the height of the
2 Use
parapet to 1.27 m.
Select the Hidden view type. The resulting image of the new
drawing file together with drawing file 112 Roof should look like this:

Architecture Tutorial

Unit 3: planes

245

Exercise 6: reference surfaces
Next, you will apply a pitch of 8 degrees to the roofs of the carports.
To do this, you will use reference surfaces (on page 211) that you
place over the outlines of the carport roofs.
So that you can compare the alternatives, start by copying drawing
file 101 Ground floor carport to an empty drawing file. You will learn
how to use ProjectPilot to copy drawing files

Copying and moving drawing files
Copy, Move Elements
between Documents...

ProjectPilot - drawing files

• Within the project only

• Within the project and in
other projects

• You can copy or move
individual elements and
elements in reference
drawing files.
• The destination drawing file
can contain elements; new
elements will be added.
•

You can position elements as
you need.

• You copy or move the entire
contents of drawing files.
• You copy or move any
number of drawing files in
one go.
• The contents of drawing
files will be overwritten
(after you confirm a
prompt).

246

Exercise 6: reference surfaces

Allplan 2022

To copy drawing files by means of ProjectPilot
1

Click ProjectPilot (drop-down list of the Allplan icon).

2 Open the folder with the tutorial project, select drawing file 101
Ground floor carport, and click Copy to… on the shortcut menu.

Architecture Tutorial

Unit 3: planes

247

3 Select the destination drawing file 105 and click OK to confirm.

4 Rename drawing file 105: Ground floor carport – alternative
5 Close ProjectPilot.

248

Exercise 6: reference surfaces

Allplan 2022

To define reference surfaces
You will create two 3D surfaces in the drawing file with the carport
that you have just copied. Each carport roof gets its own surface. To
correctly position the surfaces, you will move and rotate them.
Afterward, you will use the Planes palette to add these surfaces as
reference surfaces to the current plane model. Finally, you will link
these two reference surfaces with the carport roofs.
Note: For better demonstration of the animation view, colored glass
was selected as the plane surface for the following illustrations.

To create 3D surfaces
Select the copied drawing file 105 Ground floor carport alternative and open drawing files 101 Ground floor carport and
109 Ground floor slab in reference mode.
 Select
2+1 Animation Window (
on the Quick Access Toolbar).
1

Window drop-down list

Make the AR_SLAB layer visible and hide all the others.

2 Go to the Actionbar, switch to the Modeling task, and select
3D Surface (3D Objects task area).
3 Go to the Properties palette and select pen (7) 0.13 and
line type 1.
4 Go to the 3D Surface context toolbar and click
Rectangular
3D Surface; select
Based on diagonal line in the input
options.

Architecture Tutorial

Unit 3: planes

249

5 To define the starting point, click the lower-left corner of the
carport roof. Open a rectangle to the upper right and click
somewhere beyond the outline of the carport roof.

6 Select ESC to finish.
7 To rotate and move the 3D surface, you will use direct object
modification. Click the 3D surface. Point to an edge of the surface
and select
Rotate 3D Elements on context toolbar.

250

Exercise 6: reference surfaces

Allplan 2022

8 1. Point of the revolution axis
Axis of rotation is the left edge of the 3D surface. Click the lowerleft corner.
9 2. Point of the revolution axis
Click the upper corner of the left edge.
10 Starting point, reference line/angle of rotation
Enter the angle of rotation = -8° in the coordinate dialog box and
select ENTER to confirm.
11 Move the 3D surface in the z-direction.
The 3D surface is still selected. Point to an edge and select
Move.
12 From point or enter offset:
Click the left point in the Front, South Elevation.
13 To point or enter offset:
Enter
dz = 2.44 m.

Architecture Tutorial

Unit 3: planes

251

This places the first 3D surface in the correct position. You will
create the second 3D surface by copying and mirroring the first
one.
14 The 3D surface is still selected. Select the
Copy and Mirror
tool on the context toolbar and switch to plan view.
15 To define the first point of the mirror axis, click the midpoint of
the lower edge of the slab (ground floor slab). To define the
second point of the mirror axis, enter a value other than zero for
.

252

Exercise 6: reference surfaces

Allplan 2022

So that you can use the 3D surfaces as reference surfaces, you will
use the 3D surface to reference surface tool, which you can find on
the shortcut menu of 3D surfaces. This tool creates local reference
surfaces, which you can use in the current drawing file. So that you
can use the 3D surfaces as reference surfaces in all drawing files of
your project, you can add the 3D surfaces as reference surfaces to
your plane model.

To define reference surfaces
1

Open the Planes palette and turn on

Modification mode.

2 Open the shortcut menu of the ground floor and click Insert or
replace reference surface.
3 Click the left 3D surface and enter its name (for example,
Carport, left).
4 Click Apply in the Planes palette.
5 Repeat steps 2 to 4 for the right 3D surface. Enter a name for this
reference surface (for example, Carport, right).

6 Turn off

Modification mode in the Planes palette.

Architecture Tutorial

Unit 3: planes

253

The next step is to link the carport slabs in this drawing file with the
reference surfaces.

To link the carport roofs with the reference surfaces
1

Select the left carport slab by double-clicking it.
The Slab dialog box opens.

2 Click the Height... button.
Do not change the settings in the Top level area. The carport slab
has a component thickness of 15 cm.
3 The bottom level of the carport slab is flush with the Carport, left
reference surface. Go to the Bottom level area and check that
Relative to lower plane is selected.
4 Enter the Offset = 0.00.
5 Click the button to the right of the
info button to open the
Assign Plane dialog box. Select the Carport, left reference
surface.

254

Exercise 6: reference surfaces

Allplan 2022

6 Click OK to confirm all three dialog boxes.
The left carport roof is in the correct position.
7 Double-click the right carport slab.
8 Click Height.... Click the button to the right of the
info button
to open the Assign Plane dialog box. Select the Carport, right
reference surface. Here, too, enter the Offset = 0.00. Do not
change the other settings.
9 Click OK to confirm the Height and Slab dialog boxes.
The right carport roof, which is sloping, is in the correct position.
10 Open the Layers palette and make layer AR_COL visible.

Adapting the columns
Create a wireframe model of the
Front, South Elevation. You
can see that the top levels of the columns are linked with the top
level of the ground floor. This is a result of the height settings you
defined when you created the columns (see "Columns" on page 83).

To adapt the columns
1

Select

Change Archit. Properties.

2 Click Height....

Architecture Tutorial

Unit 3: planes

255

3 Select the Modify top level check box. Do not change the
Relative to upper plane setting for the top level. Click the
button to open the Assign Plane dialog box. Select the Carport,
left reference surface.

4 Click OK to confirm the Assign Plane and Height dialog boxes.
5 Apply the new height settings to the columns: Select the
architecture filter, choose Column and enclose the three
columns of the left carport in a selection rectangle.

256

Exercise 6: reference surfaces

Allplan 2022

The columns end below the carport roof:

6 Repeat steps 1 to 4 for the three columns on the right. Do not
forget to select the Carport, right reference plane in the Assign
Plane dialog box.
7 Here, too, use the
architecture filter and choose Column.
Enclose the three carports on the right in a selection rectangle.

Architecture Tutorial

Unit 4: stair

257

Unit 4: stair


The exercises in this unit also require the Architecture role of
the Actionbar.

You still need to design the stairs between the ground
floor and the upper floor. With the tools in the Stair task
area of the Actionbar, you can design both standard
stairs and freeform stairs in three-dimensional space.
The stair outline, steps, stringers, handrails and so on are
freely definable.
In this tutorial, we can cover only one of the wide range of
possibilities. If you want to use the Stair task area
effectively, spend some time experimenting with other
stair shapes and try out different parameters. Each
exercise begins with remarks that are also valid for the
other stair shapes.

258

Exercise 6: reference surfaces

Allplan 2022

Before you start designing the stair, draw the outline in
construction-line format. This will be a useful aid to orientation when
you enter the staircase.

To draw the stair outline in construction-line mode
 Make drawing file 100 Ground floor model current and close all
the others.
Make the layer DE_GEN02 (stair outline) visible and hide all the
other layers.
1

Click
Line (Quick Access task area). Go to the Properties
palette and select the
Construction line option and the layer
DE_CLINE.

2 Trace the outline of the stair.

3 Turn off the

Construction line option (Properties palette).

4 Keep the layer DE_CLINE visible and hide all the other layers.
The procedure for creating a stair is always the same. Once you have
created a stair, it can always be altered with
Modify Stair.

Architecture Tutorial

Unit 4: stair

259

How to create stairs
• Select the stair type.
• Enter the outline of the stair. This also defines the flight length
from the bottom of the stair.
• Define the height and position the line of travel. The system will
initially create a basic stair design that can be modified to your
specific needs.
• You can change the settings, such as number of steps, position of
last step, and step angle.
This completes the initial design. Only the treads are visible.
• Define stair components (optional) such as handrails and
carriages.
• Lock the stair and label it.

260

Exercise 7: u-type stair

Allplan 2022

Exercise 7: u-type stair
Tip: Read the chapter
"Stairs – Basics" in the
Allplan Help:

Start by creating the basis for the stair.
The stair outline you enter depends on the stair type you select. For
example, if you select the straight stair type, the system will close
the outline after you have placed four points. The outline of a u-type
stair is defined by 8 points. A spiral stair is defined by two arc radii
and a free-form stair can be based on as many points and shapes as
you want - even splines.

To create the basic stair
1

Click
U-Type Stair (Stair task area) and check the Properties
palette to see whether the AR_STAIR layer is selected.

2 The first point you click will define the point where the bottom of
the stair and the inner stringer meet. In all stairs, this is one of the
points at the bottom (inner or outer stringer).
Click the other corners along the outline of the stair you created
earlier. In total, you must place 8 points.

A = First point, inner stringer (from bottom)
3 Click the Height box.
4 Select the Number of steps based on tread-to-riser ratio
check box and enter the following height settings:

Architecture Tutorial

Unit 4: stair

261

-

Height at top: 2.75 (top floor’s elevation at bottom + 11 cm;
finished floor on top floor)

-

Height at bottom: 0.00 (ground floor’s elevation at bottom +
11 cm; finished floor on ground floor)

Then click OK to confirm.

You can see the height of the stair – 2.75 m – in the Stair
Outline / Line of Travel / Height dialog box.
5 Click OK to confirm the settings.
Allplan creates a stair, displaying the dialog box with the
parameters for the stair geometry.
6 Select ESC to finish entering stair parameters.
Click Yes when you see the confirmation prompt and place the
label.
If you do not want to label the stair, simply select the ESC key.
7 Open drawing file 109 Ground floor slab in reference mode.
8 Make layers AR_WALL and AR_SLAB visible too.
9 Click
3 Viewports.
Check the height and orientation of the stair in the isometric and
elevation views.

262

Exercise 7: u-type stair

Allplan 2022

Modifying the stair geometry
You can modify the parameters proposed in the Stair - Outline
dialog box. In this exercise, you will
• Position the last step.
• Change the step angle (u-type stairs only).
The tread and rise are calculated automatically by the system. In the
case of u-type stairs, the landing cannot be modified; its position is
locked by the stair outline. The number of steps, however, can be
altered - this is true for all the stair types.

Stair symbols
Large arrows on the steps indicate that the components are at
different heights.
Small arrows on a short line indicate that two components (steps or
landings) are at the same height.

To modify the stair geometry
1

Click

Modify Stair (shortcut menu of the stair).

2 Click Landing Type, select Type I and click OK to confirm.

Architecture Tutorial

Unit 4: stair

263

3 Click Top Step. The display will change to TH-.
In elevation, you can see how the last step is one rise below the
top of the stair. The top flight thus has 7 steps and 8 rises. The
value of the rise changes automatically and the tread is calculated
based on the length of the first flight.
In plan, you can see how the top flight doesn’t quite reach the
border of the stair outline. The flight needs to be moved along the
line of travel.
4 First, check the distance between the last rise and the boundary
of the outline. To do this, use
Measure Length (Measure task
area).
5 Click Offset at top (defining the overlap above) and enter the
value for the distance (calculated): 0.085.
The program lengthens the landing by the same value, moving
the steps accordingly.
The Stair Geometry dialog box should now look like this:

Defining stair components
On the screen, the stair is represented by treads only. If you want,
you can add other stair components. The program presents these
components and offers options for displaying them in a single, easyto-use dialog box. In addition, each component has its own dialog
box where you can enter the dimensions. In the following exercise,
you will learn how to define the treads, the inner handrail, and the
balusters.

264

Exercise 7: u-type stair

Allplan 2022

To define stair components
 The Stair Geometry dialog box is open.
1

Click

to access the Stair Components dialog box.

2 In the Stair Components dialog box, select the Format, 2D tab.
Tip: User-definable
components can be used
for balusters, panel walls,
flanges and other stair
elements.

3 Select Stair Tread, Inner Handrail and
Inner User-def (here baluster).
Click the button in the Layer area and assign the AR_STAIR layer
to the components you have just selected.

On the Format, 2D tab, you can also modify the format
properties used to display the selected components in plan view.
4 Now switch to the Geometry, 3D tab.

Architecture Tutorial

Unit 4: stair

265

You can use the Geometry, 3D tab not only to enter the
geometry of the stair components but also to define a wide
range of parameters:
• In the 3D Line area, you define the line types that are used to
display the components in 3D views.
• In the Surface elements area, you define the hatching style,
pattern, fill or style area that is used to display the
components in architectural sections.
• In the Surface area, you can assign custom surfaces to the
components.
• In the Material area, you can assign materials to the
components. These materials can be analyzed and evaluated
in specific stair reports.

266

Exercise 7: u-type stair

Allplan 2022

5 On the Geometry, 3D tab, click Stair Tread and enter the
Thickness of the tread at the front and rear and the Distance
between the tread and the outline of the stair. Click OK to
confirm the dialog box.

6 On the Geometry, 3D tab, click Inner Handrail.

Architecture Tutorial

Unit 4: stair

267

7 Enter the distance between the edges of the handrail and the
outline polygon and the position of the handrail element relative
to the front edge of the steps. This defines where the handrail is
to begin. In this example, the baluster will be on the first step.
Click OK to confirm the dialog box.

8 On the Geometry, 3D tab, click Inner User-Def. (inner userdefinable component).

268

Exercise 7: u-type stair

Allplan 2022

9 the distance between the edges of the component and the
outline polygon and the position relative to the front edge of the
steps. In this example, the baluster will be on the first step.
Tip: If you change the
dimensions of the tread,
handrail, or user-definable
component, you must
select the Fit option again
to recalculate the result.

10 Click Fit between tread and inner handrail. The program will
automatically calculate the height of the component. Click OK to
confirm the dialog box.
11 Click OK to confirm the Stair Components dialog box.
Allplan creates the components, displaying the Stair Geometry
dialog box again.

Architecture Tutorial

Unit 4: stair

269

12 Click Close and confirm the prompt by selecting Yes.
This locks the stair. The label is attached to the crosshairs.
Tip: You can skip labeling by
selecting ESC.

13 Click in the boxes you want to include in the label.
14 Select the number of decimal places.
15 Place the label beside the stair.

Creating a section in plan
You will now display a section of the stair in plan as is usual in
construction drawings.

To create a section in plan
1
Tip: To use the line type
from the drawing for the
initial region, click the Line
Below button: ”-” is visible.

Click
Section in Plan (shortcut menu of the stair) and select
the layer AR_STAIR.

2 In the Section in Plan dialog box, click

Properties.

3 Open the Representation at bottom tab and specify how the
stair looks below the section line:
Select the check boxes for Change representation of
components at bottom and Change representation of line of
travel at bottom.
Select the Change format properties option in both areas and
enter the following:

270

Exercise 7: u-type stair

Allplan 2022

• Pen thickness: 0.25
• Line type: 1
• Line color: 1 black

Tip: To hide a stair
component, just click the
corresponding option.

4 Open the Representation at top tab and specify how the stair
looks above the section line:
Select the check boxes for Change representation of
components at top and Change representation of line of
travel at top.
Select the Change format properties option in both areas and
enter the following:
• Pen thickness: 0.25
• Line type: 2
• Line color: 1 black

Architecture Tutorial

Unit 4: stair

271

5 Click OK to confirm the dialog box.
6 Enter the offset between the section lines. This offset depends
on the scale; enter it in the current unit (m).
Tip: If you change the stair
later, you must re-create
the section in plan manually
by using this tool.

7 Define the starting point and end point of the section lines by
clicking slightly outside the stair outline. The plan view changes
accordingly; the elevation view and isometric view remain
unchanged.

272

Exercise 7: u-type stair

Allplan 2022

Architecture Tutorial

Unit 5: SmartParts

273

Unit 5: SmartParts


The exercises in this unit also require the Architecture role of
the Actionbar.

If you want to model your own SmartParts, you can use
the Window SmartPart, Door SmartPart,
Shading SmartPart and Domed Roof-Light
SmartPart tools. You can find all these tools in the
Opening Elements task area. In addition, there is the
Skylight SmartPart tool, which you can find in the
Roof task area.
You can save these SmartParts and insert them at any
time.

Modeling a SmartPart
Requirements: you have created an opening.
• Select a SmartPart tool in the Opening Elements or Roof task
area and click an opening. The SmartPart adapts to the size of the
opening clicked.
• Select elements for the SmartPart (for example, frame, mullion
transom, muntins for a window) and define their parameters in
the Properties palette.
• Define parameters for the SmartPart in 2D and 3D.
• Select additional elements (for example, window sill or roller
shutters for a window) and define their parameters.
• You can specify how far the SmartPart is from the opening.
• Save the SmartPart as a favorite file ( Save as a favorite) or
save it to a folder in the Library palette.

274

Exercise 7: u-type stair

Allplan 2022

Next, you will create three openings and insert SmartParts you
modeled yourself in the only windowless wall on the ground floor.
Start by creating the openings for the windows.

To create window openings
 Drawing file 100 Ground floor model is open. Make the
AR_WALL layer visible and hide all the other layers.
1

Use the right mouse button to double-click within the window
opening at door height in the straight wall beside the curved wall.

2 Create three window openings as shown.
The

Properties are taken from the element clicked.

Height: Top level:
Fixed component height; comp. height:
2.26
Bottom level:
Relative to lower plane; offset: 0.00
Reveal: Window depth: 0.07
Outer reveal: 0.09
Representation of sill: Outside
Library element 1 to n: off
Position:

3 Select ESC to close the tool.

Architecture Tutorial

Unit 5: SmartParts

275

Exercise 8: modeling a window SmartPart
You will design a three-part window SmartPart with fixed glazing for
the openings. You can then insert this SmartPart into any opening.
To make sure that the window SmartParts you have used so far and
the new SmartPart match, you will use the same settings for the
frame thickness, color, surface, and so on.

To model a window SmartPart
 The reference scale is 1:100.
 Drawing file 100 Ground floor model is open.
1

Click
2+1 Animation Window in the
list on the Quick Access Toolbar.

Window drop-down

2 Change the reference scale to 1:50.
3 In all three viewports, zoom in on the window opening you just
created.
4 Click

Window SmartPart (Opening Elements task area).

You can use this tool to model SmartParts for windows and
window sills.
5 Select

Window in the list box at the top of the palette.

You can see the Elements tab of the window SmartPart. The
preview displays the frame, which serves as the basis for
modeling the window SmartPart.
Note: When you point to the lower edge of the preview in the
palette, the cursor turns into a double-headed arrow. Now you
can change the size of the preview.
6 When you move the crosshairs across the workspace in plan
view, you can see that the SmartPart, which is currently not
more than the frame, is attached at its drop-in point to the
crosshairs. The drop-in point is the lower-left corner of the
SmartPart.

276

Exercise 8: modeling a window SmartPart

Allplan 2022

When you place the SmartPart, an arrow appears in the middle of
the SmartPart, indicating its outside. Make sure that this arrow
points toward the outside of the building.

7 Start modeling the window SmartPart by clicking inside the left
window opening.
This places the SmartPart, which means that it assumes the size
of the opening. The preview in the palette also adapts to the new
size.
As you have created the window opening with a reveal, Allplan
places the SmartPart in the middle of this reveal element.
8 Define the dimensions of the frame in the Properties palette.
Make the following settings:

Architecture Tutorial

Unit 5: SmartParts

277

• Frame area:
Shape:
Block frame
Width left / right: 7 cm
Left angle / right angle: 90°
Width top / bottom: 7 cm
Depth: 7 cm
• 3D representation area:
Color: 14
Surface: oak 3 portrait.surf

9 The window with fixed glazing gets one mullion and one transom.
Start by modeling the transom.
Click in the middle of the preview and select Transom.
10 Make the following settings for the transom:

278

Exercise 8: modeling a window SmartPart

Allplan 2022

• Transom area:
Type: Select the
Fixed width at top option. For the Top,
enter 0.625 m.
Width / Depth: 7 cm
Orientation:
Offset: 0

Centered

• 3D representation area:
Color: 13
Surface: oak 3 portrait.surf

11 You will use a mullion to divide the lower part of the window into
two parts of the same size.
In the preview, click in the middle of the lower part of the window
and select Mullion.

Architecture Tutorial

Unit 5: SmartParts

279

12 Make the following settings for the mullion:
• Mullion area:
Type:
1:1
Fields: 2
Width / Depth: 7 cm
Orientation:
Offset: 0

Centered

• 3D representation area:
Color: 13
Surface: oak 3 portrait.surf

13 Switch to the Settings tab in the Properties palette of the
SmartPart. Go to the Offset to opening (1) area and enter

280

Exercise 8: modeling a window SmartPart

Allplan 2022

bottom = 0.1100 m. This is to take the floor structure into
account.

This completes the SmartPart.
14 To save your entries, click Close at the bottom of the Properties
palette.
15 A copy of the SmartPart you just modeled is attached to the
crosshairs. Place it in the second opening and select ESC.
16 Place the next copy in the third opening.
Check the direction of the blue arrow indicating the outside of the
SmartPart.

17 Select ESC twice to close the

Window SmartPart tool.

Architecture Tutorial

Unit 5: SmartParts

281

Saving the SmartPart
You can add the window SmartPart to the project folder in the
library.

To save the window SmartPart to the library
1

Open the Library palette by clicking its tab.

2 Go to the Project folder and open the Architecture Tutorial
project.
3 Open the Windows folder. At the bottom of the palette, click
Insert element Insert SmartPart.
4 Select SmartPart you want to save
Click one of the SmartParts you just inserted.
5 Save as
Enter a name for the SmartPart: Window, fixed glazing.
Click OK to confirm.
Allplan saves the SmartPart with a preview to the library.

Replacing SmartParts
You can replace SmartParts at any time. The only requirement is the
presence of the two SmartParts (one to be replaced and the other to
be used as a substitute) in the drawing file.
There are two methods for replacing SmartParts:
• To replace all instances of a SmartPart with another SmartPart,
select the Add identical objects option.
• To replace single instances of a SmartPart, do not select the Add
identical objects option.
A SmartPart that has been placed in a drawing file is an 'instance' of a
SmartPart.

282

Exercise 8: modeling a window SmartPart

Allplan 2022

In the following exercise, you will replace instances (in other words,
the SmartParts you inserted in openings) with the new SmartPart
you just created and saved. You will replace the instances of the
SmartPart you inserted in the curved wall and in the wall to the right
of the curved wall.

To replace SmartParts
1

Click

Replace Smart Symbol, SmartPart (Change task area).

2 Select the Add identical objects option.

3 Select smart symbol you want to replace
Click a SmartPart in the curved wall.
All identical SmartParts appear in the selection color.
4 Select smart symbol definition with which to replace
Click the new SmartPart you modeled yourself.
5 Replace the window SmartPart to the right of the curved wall
with your own SmartPart too.
6 Select ESC to close the tool.

Architecture Tutorial

Unit 5: SmartParts

283

Modifying SmartParts
To edit SmartParts you have placed, you can use handles (graphical
modification) or a dialog box (alphanumeric modification) in the form
of the Properties palette. To modify SmartParts graphically, you can
use the
Modify SmartPart using Handles tool, which you can
find on the shortcut menu of the SmartPart.
It is also possible to use the handles and the Properties palette in
combination. If you want to do this, double-click the SmartPart.
Allplan opens the Properties palette of the SmartPart and displays
the handles.
Next, you will modify the window handles of the window SmartParts
you inserted in the right exterior wall. You will adjust the handle
position so that it is exactly in the middle.

To modify the window SmartPart
 The reference scale is 1:50.
 Drawing file 100 Ground floor model is open.

1

2+1 Animation Window is selected.
Double-click the upper window SmartPart in the exterior wall on
the right.

2 The Properties palette opens; you can see the Elements tab.
To modify the casement of the SmartPart, you must select the
casement. You can do this in two ways:
• Click the casement in the preview.
Or
• Open the drop-down list below the window elements and
select the casement by clicking it.

284

Exercise 8: modeling a window SmartPart

Allplan 2022

3 Go to the Fittings area and change the Offset at bottom to 0.27
m.

4 To save your entry, click Close at the bottom of the Properties
palette.
5 Would you like to update identical SmartParts?
To see which SmartParts are identical, click Show identical ones.

Architecture Tutorial

Unit 5: SmartParts

Allplan displays the copies of the modified SmartPart in the
selection color.

6 Click Yes to confirm the prompt.
7 Repeat these steps to modify the window handles of the
remaining window SmartParts in the right exterior wall.
8 Check and adjust the position of the window handles for the
other window SmartParts.

285

286

Exercise 8: modeling a window SmartPart

Allplan 2022

library palette
You can find an overview of all symbols, smart symbols, SmartParts,
and PythonParts in the libraries.
Open the Library palette.

Connect (online library) takes you to the Connect palette to log
in to Connect. If you are already signed in, the online library will open
immediately.
By using
Filter, you can show or hide specific types of library
elements (symbols, smart symbols, SmartParts, PythonParts).
After having opened a folder, you can see all subfolders with library
elements (symbols, smart symbols, SmartParts, and PythonParts) if
you have not filtered out library elements.

Architecture Tutorial

Unit 5: SmartParts

287

The area at the top helps you move through the Library palette:
Back takes you up one level in the hierarchy; use
Find to find a
name in the current folder and its subfolders.
By using
Sort criterion, you can sort the library elements
alphabetically or by date in ascending or descending order.
By using
Hide empty folders, you can hide folders without library
elements. If folders are hidden, the icon changes to .
For example, if you have selected a SmartPart, the palette provides
a number of tools you can use to modify and display the SmartPart in
the library:

288

Exercise 8: modeling a window SmartPart

Allplan 2022

View, you can select a view for the preview. This view is
By using
independent of the view in the viewport. When you point to the
name of a library element, you can see a ToolTip with information
about the type of the library element (SmartPart, smart symbol,
symbol, PythonPart). In addition, you can see the date the library
element was saved to the library.

Architecture Tutorial

Unit 5: SmartParts

289

When you point to a folder or a library element, you can use the
Modify tool. Clicking this icon opens a shortcut menu with tools
you can use to copy, rename, cut, replace and delete the folder or
library element.
The shortcut menu that is available in folders where you can select
library elements provides not only the
New group tool, which you
can find at the bottom of the palette, but also a number of additional
tools, which you can use to define the size of the previews or hide
them altogether. In addition, you can customize the palettes to suit
your needs. To do this, select the Customize User Interface... tool
and open the Palettes tab in the Customize dialog box.
Note: Library elements in the Default folder can be copied but not
modified.
Insert element (at the bottom of the palette) provides four tools
for inserting library elements plus the
New smart symbol tool.
You can find advanced information about the 'Library' palette in the
Allplan Help.

290

Exercise 8: modeling a window SmartPart

Allplan 2022

Architecture Tutorial

Unit 6: sections and views

291

Unit 6: sections and views


The exercises in this unit require the Architecture role of the
Actionbar.

Although the building model is now finished, there are still
a number of important tasks you must accomplish to
produce a polished construction drawing.
This unit shows how to create sections and views. An
additional step involves calculating floor areas, which can
be output to the drawing file or as reports.

Section A-A with elevation dimensioning

292

Exercise 9: Sections

Allplan 2022

Exercise 9: Sections
Section views of a building show it as if viewed from a specific
viewing direction. A section clipping path defines the view and this
can be saved as a hidden-line image in a separate drawing file. The
look of intersected elements - for example, their hatching - will be
transferred to the section view.
If you want, you can also choose to display intersected elements
with a thick line.

Section B-B

Architecture Tutorial

Unit 6: sections and views

293

Do the following for all components that you want to include in the
section: Open the drawing files in edit mode and make the layers
visible. The clipping line itself is in a separate drawing file, which is
current. Define parameters for the clipping path.

To define the clipping path
 Expand the Sections task area.
 Make drawing file 2 Clipping path current; open drawing files 100,
101, 109, 110, 112, 116, 120 and 129 in edit mode.
1

Open the Layers palette, click
Select Layer Print Set and
select the Model print set (all layers with 3D components).

2 Open the
Window drop-down list on the Quick Access
Toolbar and click
1 Viewport.
3 Click

Clipping Path (Sections task area).

4 Define the following settings in the Create Clipping Path palette:
• Select the Basic input method by clicking this button.
• Area Type
Click on Vertical section in the graphic.
• Area Clipping path
Section name: A
Height from elements: select
Place clipping line: select

294

Exercise 9: Sections

Allplan 2022

5 In the Clipping path area, click the Set button to the right of
Representation.
6 Define the following settings in the Clipping Path palette:
• Select Area Style
Allplan Style
• Area Clipping line area
Fileset: select Broken section line
Length of line segments: 1,000
pen: 0.50
line: 5
color: 1 black
layer: DE_GEN01
• Area Direction symbol
Place direction symbol select
Direction symbol: 2
size in mm/feet: 2,0 mm

Architecture Tutorial

Unit 6: sections and views

295

7 In the Section identifier area, click the Set button to the right of
Text parameters.
Choose appropriate parameters and click OK to confirm the Text
Parameters dialog box.
Tip: Apart from orthogonal
sections, you can define
sections at angles or
sections with offset section
lines.

8 Click the starting point and end point of the section line beyond
the building and select ESC to finish. Make sure the section line
intersects the walls at right angles and not in an oblique manner.
9 Depth, viewing direction
Click a point above the building.
The section depth defines an area behind the section line; the
program displays all visible building elements in this area. The
greater the depth of the section, the larger the volume of data
generated.
10 Create a second vertical section. Enter B for the section identifier
in the Create Clipping Path palette. Do not change the other
settings.

296

Exercise 9: Sections

Allplan 2022

11 Click the starting point and end point of the section line beyond
the building and select ESC to finish. Define the viewing direction
by clicking a point to the left of the building.
12 Select the ESC key to close the tool.
13 Switch to the Layers palette and make the DE_GEN01 layer
visible.

Architecture Tutorial

Unit 6: sections and views

297

Calculating sections
The section is a three-dimensional wireframe model. Allplan creates
a hidden-line image from this wireframe model in a separate drawing
file. The result is a 2D image you can edit with the tools in the 2D
Objects, Text, and Dimension task areas.
There are two ways to create views and sections in Allplan. First, you
can use the building structure. The building structure comes with
drawing files for views and sections. These are displayed on the right
side of the Open on a Project-Specific Basis dialog box: Drawing
files from the drawing/building structure ( tool Open on a
project-specific basis) are listed under Derived from building
structure in the Single-family house sections and Single-family
house views folders. You can create views and sections by using
the shortcut menus of these drawing files.
Second, you can use the tools in the Sections task area on the
Actionbar.
The following pages show how to define section A by means of the
tools on the Actionbar. Then, you will use the building structure to
create section B.

To create and save section A-A
1

Click
Create Section (Actionbar - Architecture role Elements task - Components task area).

2 As you have already created clipping paths, close the Create
Clipping Path palette.
The Create Section palette opens.
3 Define the following settings in the Create Section palette:

298

Exercise 9: Sections

Allplan 2022

• Area Filter
Drawing files: Click the button. You can see all the drawing
files you selected for creating the clipping path. Click OK to
close.

• Area Filter
Clipping path: Select A (2). The number in parentheses
indicates the number of the drawing file that contains the
selected clipping path.
Layer: Click the button to open the Layer filter dialog box.
Select the Use print set option. Select the Model print set and
click OK to confirm.

Architecture Tutorial

Unit 6: sections and views

299

• Area Filter
Updated automatically: Select this option to create an
associative section. Consequently, the section automatically
adapts to changes you make to the 3D model. You do not
need to generate the section again.
• Area Surface elements
Select the button No surface elements!.
• Area Display
Formats: Click the Set button.
The Formats palette opens.
4 Select the Edges tab on the Formats palette and define the
following settings:
• Area Remove
adjacent edges: select
maximum angle of joint: 5 degrees
By entering a larger joint angle, you achieve that the joints of
the individual wall segments are not displayed for the round
wall.

300

Exercise 9: Sections

Allplan 2022

• Area Adjacent edges for architectural components
Display when material changes: select
• Area Display edges
Visible edges: select

5 Open the Clipping lines tab in the Formats palette and define the
following settings:
• Area Display section edges
Display boundary lines: deselect

Architecture Tutorial

Unit 6: sections and views

Display section edges with a thick line: select
Outer edges: select
• Area Section surface elements
Surface elements from components: select

301

302

Tip: Sections can display
finishing surfaces that you
Room tool.
define in the
To display these surfaces,
define settings on the
Finish elements tab in the
Formats palette. So, you do
not need to edit sections
later.

Exercise 9: Sections

Allplan 2022

6 Click Close to confirm the Formats palette.
You are back in the Create Section palette.
7 Go to the Result area, click the Drawing files button, and select
drawing file 1010.

8 Click OK to confirm the Select destination drawing file dialog
box.
Section A-A is attached to the crosshairs. You have just saved
this section to drawing file 1010. If you want, you can also place
this section in the current drawing file (2), or skip placing by
clicking Close in the Create Section palette.

Architecture Tutorial

Unit 6: sections and views

9 Click Close in the Create Section palette.
10 Select the

Open on a Project-Specific Basis tool.

303

304

Exercise 9: Sections

Allplan 2022

11 Clear the Building structure check box, thus hiding all drawing
files under Building structure.

Architecture Tutorial

Unit 6: sections and views

305

12 Under Derived from building structure, select drawing file 1010
Section: A (Result of hidden line image) and close the dialog
box.

You can see the result of the hidden-line image in drawing file
1010 Section: A (Result of hidden line image).
Tip: If the drawing file looks
empty, check that
Plan
view is selected. If it is, the
reason for this might be 2D
data. In this case, click
Show/Hide and select
the 2D elements in 3D
views option.

Section A-A has two borders in different colors.
The outer border is the view border. The view border indicates
that section A-A was created with the Update automatically
option being selected. Sections that are not associative (=
Update automatically option off) get a double view border.
Double-click this single or double view border to open the Modify
Section palette, which provides the same parameters as the
Create Section palette.
Note: You can define the line type, color, and offset of the view
border in the View border area on the Views page in the
Options. The line color always stays the same, regardless of
the setting of the Color stands for pen option ( View drop-

306

Exercise 9: Sections

Allplan 2022

down list on the Quick Access Toolbar Show/Hide).
View borders are not included in printouts.
In addition to the view border, you can see the section object with
its name. Allplan displays the section object in construction-line
color.
13 Open the shortcut menu of the view border. You can use the
Show Clipping Path tool to hide the section object.
14 Select the

Show Clipping Path tool.

15 Select section object
Click the section body (= inside the frame shown in constructionline color).

Architecture Tutorial

Unit 6: sections and views

307

The result should look like this:

Section A-A

To calculate and save section B-B
1

Click

Open on a Project-Specific Basis.

2 Select the Building structure check box again (see illustration).
3 Go to the Derived from building structure area on the right side
and select Detached house - sections - Section 2.

308

Exercise 9: Sections

Allplan 2022

4 Open the shortcut menu of drawing file 1015 and select Create
section.

5 The Create Section palette shows the settings of section A-A.
Check the following:

Architecture Tutorial

Unit 6: sections and views

309

• Area Filter
Drawing files: Click the button. Drawing files 2, 100, 101, 109,
110, 112, 116, 120, and 129 are selected. Click OK to close.

• Area Filter
Clipping path: Select B (2)
layer: The Model print set is selected.
Update automatically: This option is selected.
• Area Surface elements
The button No surface elements! is selected.
• Area Display
Formats: Click the Set button.
The Formats palette opens.

310

Exercise 9: Sections

Allplan 2022

6 Select the Edges tab on the Formats palette and check the
following settings:
• Area Remove
adjacent edges: is selected
Maximum angle of joint: 5 degrees
• Area Adjacent edges for architectural components
Display when material changes: is selected
• Area Display edges
Visible edges: is selected
7 Open the Clipping lines tab in the Formats palette and define the
following settings:
• Area Display section edges
Display boundary lines: is deselected
Display section edges with a thick line: is selected
Outer edges: is selected
• Area Section surface elements
Surface elements from components: is selected
8 Click OK to confirm the Formats palette.
You are back in the Create Section palette. The Show clipping
path option is selected.

Architecture Tutorial

Unit 6: sections and views

311

9 Click OK to close the palette.
Drawing file 1015 automatically gets the name Section: B (Result
of hidden line image).
10 Clear the Building structure check box, thus hiding all drawing
files under Building structure.
11 Select drawing file 1015 Section: B (Result of hidden line image)
and close the dialog box.
You can see the result of the hidden-line image in drawing file
1015 Section: B (Result of hidden line image).
Here, too, the section object is visible. When you generated
section A-A, you learned how to hide the section object by
means of the shortcut menu of the view border. With section BB, we will show you another modification option.

312

Exercise 9: Sections

Allplan 2022

12 Double-click the view border of section B-B.
The Modify Section palette opens.
13 Clear the Show Clipping Path option in the Representation area
and click Apply to confirm.
Note: When you create a section, the Show clipping path option
is selected by default.

14 Close the Modify Section palette.

Architecture Tutorial

Unit 6: sections and views

The result should look like this:

Section B-B

313

314

Exercise 9: Sections

Allplan 2022

If you created the section with the Update automatically option, the
section automatically adapts to changes you make to the floor plan.
If the section is not associative (Update automatically not
selected), you can add changes to the section as follows:
If you have changed a drawing file that is used as a source drawing
file for the section, you can update the section by selecting the
Update calculation result tool ( Open on a Project-Specific
Basis tool - shortcut menu of Section n). You can use the Lock
update tool (also on the shortcut menu of Section n) to lock the
section. In other words, you can no longer update the section.
For example, if you want to use another drawing file as a source
drawing file for the section, you must calculate the section again as
described.
Note: You can also create sections by means of the Section Display
tool (viewport toolbar).

HiddenTo place the result in a separate drawing file, select the
Line Image, Wireframe tool (in the
View drop-down list on the
Quick Access Toolbar) and click Hidden-Line Image.
Here, the section does not automatically adapt to changes you make
to the floor plan. You must calculate the section again and update the
Hidden-Line Image, Wireframe and
drawing file by using
Update Hidden-Line Image.

Architecture Tutorial

Unit 6: sections and views

315

Editing sections
You can now edit the section. Use a separate drawing file, because
the drawing file with the hidden-line image will be overwritten when
you update it.
First draw the finished floor in the section.

To create elevation dimensioning
1

Click

Open on a Project-Specific Basis.

2 Go to the Derived from building structure area on the right side
and select Detached house - sections - Section 1.
3 Make drawing file 1011 current and open drawing file 1010 in edit
mode.

4 Rename drawing file 1011 and close the dialog box.
5 Draw the finished floor; use a height of 11 cm.
6 Go to the Quick Access task area of the Actionbar and select the
Elevation Point tool on the flyout menu of the
Dimension
Line tool.

316

Exercise 9: Sections

Allplan 2022

7 Select the
Vertically upward type on the Elevation Point
Context toolbar.

8 Then click

Properties.

9 Select the Arrowhead (mark for finished floor) in the top part of
the dialog box, define the format properties and select the
DL_100 layer (see illustration).
Open the Text tab and define the following settings:
• Select the Dimension text option.
Font: 8 ISONORM DIN 6776
Text height: 2.5 mm
Aspect: 1

Architecture Tutorial

Unit 6: sections and views

317

10 Define the following settings on the Dimension text and Input
options tabs.
• Dimension text tab
Dimension text unit: m
Round-off value in mm: 5
Number of decimal places: 3
Number of trailing zeros: 2
Select all three options.

• Input options tab
Extension lines area: Select the No extension lines option.
Dimension lines area: Offset between dimension lines: 9
mm

Click OK to confirm.
11 Place a point through which the dimension line is to pass. The
Elevation Point Context toolbar changes.

318

Exercise 9: Sections

Allplan 2022

12 Reference point
This is a point that is assigned a value that you know.
First enter the base value on the context toolbar: 0.00
Then click a point of the finished floor on the ground floor.
13 Click the points to be dimensioned and
select ESC to finish.

14 Open the
Properties or use the context toolbar to change
the Arrowhead to
.
Then dimension the unfinished floor (steps 12 to 14).
15 Select the ESC key to finish and to close the tool.

Architecture Tutorial

Unit 6: sections and views

319

Exercise 10: views
Like sections, views can be created by means of the building
structure or with a tool in the Sections task area on the Actionbar.
The procedure for creating views is similar to that for creating
sections.

How to create views
Option 1
• Select the
Create View tool (Actionbar - Architecture role Elements task - Sections task area).
• Generate View palette:
-

Select the drawing files that contain the elements you want
to display in the view.

-

Open the Layer filter dialog box, select the Use print set
option and choose the Model print set.

-

Select the Update automatically option.

-

Switch the view to Left, West Elevation.

Tip: When you select the view by clicking the button, the 3D
View palette opens. When you look at the bottom of this palette,
you can find the
Match parameters tool. You can use this tool
to match the view of a viewport simply by clicking it.
-

Select the No surface elements button.

-

Use the same Formats as for the sections.

320

Exercise 10: views

Allplan 2022

-

Go to the Result area and click the Drawing files button.

-

Select destination drawing file 1000 and click OK to confirm.

Architecture Tutorial

Unit 6: sections and views

-

Close the Generate View palette.

321

322

Exercise 10: views

Allplan 2022

Option 2
•

Open on a Project-Specific Basis, Derived from building
structure, Detached house - Views folder, View 1.

• Open the shortcut menu of drawing file 1000 and select
Generate view.
• Generate View palette:
-

Make the same settings as in variant 1.

• Drawing file 1000 automatically gets the name of the selected
view.

Architecture Tutorial

Unit 6: sections and views

West elevation

North elevation

323

324

Exercise 10: views

Allplan 2022

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

325

Unit 7: area calculations
and quantity takeoff


The exercises in this unit also require the Architecture role of
the Actionbar.

You will create the rooms on a separate layer in the
drawing file with the walls. This will ensure that all the
design components are included in the calculation.
There are two ways to create rooms:
 Manually - enter polygons to define the boundary of
each room separately. The rooms can be labeled
immediately and assigned finish specifications.
 Automatically - the program scans the drawing file for
closed wall polygons, creating rooms based on the wall
polygons it detects. The rooms must be labeled and
assigned finishing surfaces later.

326

Exercise 11: rooms, finish, and floor area

Allplan 2022

Exercise 11: rooms, finish, and floor area
Important notes on defining rooms
• In either case, you must enter the height of the room first. You
enter the height as you would for any other architectural element
– you can even associate the height of a room with reference
planes or with other elements.
• We recommend that you work with reference planes
consistently and to use a transparent plane concept for both
components and rooms.
• So that you can differentiate visually between the rooms and the
other elements on the screen, you should draw rooms in a
different color.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

327

You can calculate areas according to floor area regulations and
output the results to reports only when you have defined rooms and
entered finish specifications (for determining the finished
dimensions).

Defining rooms one by one
In the exercises that follow, you will assign a finish to different
surfaces on the top floor and calculate the floor area. Here, you could
use the automatic room-generation approach. However, you will
also consider the manual approach so that you can decide for
yourself which is the more effective.
You will start by defining single rooms and labeling their wall
surfaces, floors, and ceilings. Then, you will create the other rooms
automatically.

To create rooms
1

Select
Open on a Project-Specific Basis and make drawing
file 110 Top floor model current.
Select the check box beside Building structure and clear the
check box beside Derived objects.

328

Exercise 11: rooms, finish, and floor area

2 Open the Layers palette, click
select the SC Rooms print set.

Allplan 2022

Select Layer Print Set and

3 Switch to the Finish task (Architecture role) on the Actionbar
and maximize the Rooms, Surfaces, Stories task area.
4 Click
Room (Rooms, Surfaces, Stories task area) and check
the Properties palette to see whether the RO_ROOM layer is
selected.
5 Select pen (3) 0.50 (Properties palette).
6 Click

Properties.

Define properties for the room.
7 In the Story code box, enter Top floor. Click the Name /
qualities box and enter the number of the room: R 201.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

8 Click Function and use
BEDROOM.
Tip: Entering a factor is
useful for areas like
balconies, for example, that
count only partially.

to add a new entry to the list:

329

330

Exercise 11: rooms, finish, and floor area

Allplan 2022

9 Click Height and define the top and bottom levels of the room in
such a way that they match the settings defined for the walls on
the top floor.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

10 Switch to the Finish tab. Click the left button in the Attribute
catalog assignment area at the bottom of the dialog box.

331

332

Exercise 11: rooms, finish, and floor area

Allplan 2022

11 In the Attributes for Quality Selection dialog box, click the entry
in the right column next to Material

12 Assign a catalog for vertical surfaces, ceilings, and floors.

Baseboard (button on the right side).
13 Assign a catalog for
Repeat steps 10 to 12.
Select catalog katlg3 in the Catalog assignment dialog box.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

14 Make settings for the coverings of ceilings, floors, and vertical
surfaces.

333

334

Tip: Use
to save
combinations of settings as
favorites. The settings for
entire rooms and those for
individual surfaces can be
saved as favorites.
With large-scale projects in
particular, this saves you
time and increases quality,
as all those involved can
access the same settings.

Exercise 11: rooms, finish, and floor area

Allplan 2022

15 Select the DIN277, Floor Area tab.
In the Floor area attributes area, define the Type of floor area
as LI (for living space).

16 Click OK to confirm the dialog box.
17 In plan, click the diagonally opposite corners of the room under
the dormer and select the ESC key.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

335

18 Make settings for the label. The label in this exercise will include
information on the name, function, volume, and area of the
room.
Click in the relevant boxes to exclude them from the label.

Tip: Click
to switch to the
text parameters.
19 Check the Properties palette to see whether the layer
AR_LABEL is selected.
20 Click in the room to place the label (a preview of the label is
attached to the crosshairs).

21 Select ESC to close the tool.

336

Exercise 11: rooms, finish, and floor area

Allplan 2022

Creating rooms automatically
In the next exercise, you will create the other rooms automatically.
This involves two steps:
• Define all the rooms by using

Auto-Room.

• Label the rooms by using
Redefine Rooms, Surfaces,
Stories.
You can define the finish immediately when creating labels or
later with special tools.

To create rooms automatically
1

Click
Auto-Room (Actionbar - Finish task - Rooms,
Surfaces, Stories task area - flyout menu of the
Room tool).

2 Check the Properties palette to see whether the layer
RO_ROOM is selected.
3 Click Height in the input options and check the height setting.
4 Enclose the design in a selection rectangle. Make sure that you do
not select any parts of the balconies. Allplan creates the rooms
and closes the tool.
Note:
Auto-Room will not change any rooms you have
already defined.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

337

Finish specifications
You have already defined the finish of the single room; in other
words, you have assigned vertical surfaces, ceilings, and floors (and
baseboard).
These surfaces have properties (for example, material, building trade
and thickness). Qualities and quantities are included in calculations of
floor area and quantity takeoff.
The rooms you have defined automatically have not yet been
assigned any finish specifications.
You have two options to define finishing surfaces in rooms:
Tip: You can use this
approach to modify
surfaces that you have
created by using
Room.

• By defining finishing surfaces as single entities for an entire room.
-

The easiest method is to define finish specifications when you
enter a room. To do this, use the
Room tool, Finish tab.
However, you can also do this later by using the
Finish
Specifications tool.
When modifying rooms, you can also define or change the
Redefine Rooms,
finish for an entire room by using
Surfaces, Stories, Finish tab.

• By defining finishing surfaces (that is, special surfaces) one by
one. You can use this option to define separate surfaces within
the same area, such as a tiling pattern up to a certain height.
-

Vertical Surface,
You can enter special surfaces with the
Ceiling,
Floor and
Baseboard tools.

In the exercises that follow, you will learn how to use the different
methods.

Finishing surfaces for an entire room (as a modification)
The next step is to label the rooms created automatically. You will
copy the finish settings from the existing room named ”BEDROOM”
and assign them to the rooms while creating the labels.

338

Exercise 11: rooms, finish, and floor area

Allplan 2022

To assign finishing surfaces to rooms
1

Click
Redefine Rooms, Surfaces, Stories (Rooms, Surfaces,
Stories task area).

2 Make sure that the
toolbar.

Room filter is selected on the context

Match Properties and then click within the room called
3 Click
BEDROOM.
Allplan takes all the attributes from the ”BEDROOM” (name,
finish, type of area).
Properties.
4 Click
On the Room tab, enter R 202 for the name and CHILD 1 for the
function of the room. Use
to permanently add entries to the
list.
Select the check boxes beside Name / qualities and Function to
transfer these attributes to the new room.

5 Switch to the Finish tab.
You can see the finish you defined for ”BEDROOM”; changes are
not necessary at the moment.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

339

Make sure that you select the check box for each finishing
surface you want to transfer to the new room.

6 Check the settings on the DIN277, Floor Area tab:
The program also took the LI area type from the ”BEDROOM”.
Here, too, make sure that the corresponding check boxes are
selected.

340

Exercise 11: rooms, finish, and floor area

7 Click in the upper-left room and right-click to confirm.
8 Select the layer AR_LABEL and place the label.

Allplan 2022

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

341

9 Repeat steps 4, 7 and 8 with the other rooms.
Enter the room numbers and room functions as shown in the
illustration.
Make sure that you switch between the RO_ROOM (for rooms)
and AR_LABEL (for room labels) layers.
The settings you defined for finish and type of area are retained
until you change them. Allplan assigns them automatically to the
modified room together with the label.
A value to account for plaster is not to be subtracted from the
overall area of room 205 Bathroom in subsequent floor area
calculations: Select the Do not subtract check box in the Floor
area attributes area on the DIN277, Floor Area tab.
10 Select ESC to close the tool.
You will define the balcony as a separate room. Specify a function
and name on the Finish tab and delete all the finishing surfaces by
clicking Delete total finish. Open the DIN 277, Floor Area tab. Go to
the Floor area attributes area and switch the Factor for floor area
calculation to 0.5. Then go to the Din277 attributes area and
change the Room enclosure to S.

Finishing surfaces for an entire room
The ceiling and vertical surfaces of the bathroom will get the same
coat of plaster as the other rooms. The floor covering, however, will
be different from the parquet floor of the other rooms you have
defined so far.

342

Tip: You can also display
ceilings and floors (finishing
surfaces) in sections. When
you create the section via
the building structure (see
"Calculating sections" on
page 296), you must define
the settings in the
Generate Section palette
(Representation area - Set
Formats - Finish elements
tab). The same applies to
Create Section (see
the
"Calculating sections" on
page 296) tool (Actionbar Architecture role Elements task - Sections
task area).
When you create the
section by means of the
Section Display (see
"Calculating sections" on
page 296) (viewport
Hiddenborder) and
Line Image, Wireframe ...
tools ( View drop-down
list on the Quick Access
Toolbar), you can define the
settings in Special settings.

Exercise 11: rooms, finish, and floor area

Allplan 2022

In addition, you will apply a tiling pattern that is max. 2 m high to the
walls of the bathroom. To create this tiling pattern, you must enter
the height relative to the room.
By using the bathroom as an example, the following section shows
how to create finishing surfaces and special surfaces.

To define finishing surfaces
 Open the
Options - Rooms page - Room finish area and
select the Calculate vertical surfaces only at adjacent
components option. This ensures that Allplan calculates vertical
finishing surfaces only in places where there are walls.
1

Click
area).

Finishing Surfaces (Rooms, Surfaces, Stories task

2 Define the required surfaces in the dialog box (see following
tables and illustration; step 3). The entries you make apply to the
entire surface or to all the sides in the room.
Assign, remove vertical surface covering area:
No.

Material,
qualities

Thickne Factor
ss

Trade

1

Plaster

0.0150

1

Plaster and
stucco work

2

Mortar bed

0.0010

1

Tiling work

3

Wall tiles

0.0300

1

Tiling work

Assign, remove ceiling covering area:
No.

Material,
qualities

Thickne Factor
ss

Trade

1

Plaster

0.0150

Plaster and
stucco work

1

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

343

Assign, remove floor covering area:
No.

Material,
qualities

Thickne Factor
ss

Trade

1

Insulation

0.0300

1

Screeding work

2

PE foil

0.0020

1

Screeding work

3

Screed

0.0560

1

Screeding work

4

Mortar bed

0.0100

1

Tiling work

5

Tiles

0.0100

1

Tiling work

The tiling pattern is not as high as the entire wall, but it is applied
to all the sides in the room. You can therefore use this tool to
define it as a finishing surface.
Note: Tiling patterns or other surfaces that differ in height or that
are not applied to all the sides in a room are defined separately as
special surfaces (see the following section).
Note: Do not forget to select the relevant check boxes!
Note: When you move the horizontal sliders to the right,
additional columns appear.
You can assign animation surfaces to ceilings, floors, and vertical
surfaces. In addition, ceilings and floors can be assigned hatching
styles, patterns, or fills for display in section views. You can also
define the height of vertical surfaces relative to the room.
Note: Surfaces you have already defined are overwritten as
soon as you select the check box for the surface in the dialog box
– regardless of whether there are assignments in the dialog box.

344

Exercise 11: rooms, finish, and floor area

Allplan 2022

3 Enter the vertical surfaces with the tiling pattern as follows:
• The coat of plaster is applied to the full height of the room.
There are no particular issues to bear in mind (default setting).
• The situation is different with the mortar and the tiles. To
enter the height relative to the room, move the slider to the
right and click the Height column.

• Define the height as follows:
Select the Match bottom level of room with offset at
bottom option
Height 2: 2.11
Height 1: 0.11

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

The dialog box should now look like this:

4 Click OK to confirm.
Tip: You can apply finish
specifications to a whole
series of rooms in one go.
To do this, simply enclose
the rooms in a selection
rectangle or use the
Brackets tool.

5 Click in the Bathroom.
6 Right-click to confirm.
The finishing surfaces are assigned to the surfaces in the
bathroom, even though they are invisible.
7 Select ESC to close the tool.

345

346

Exercise 11: rooms, finish, and floor area

Allplan 2022

Alternative: special surfaces
You will apply the tiling pattern (that is max. 2 m high) only to the
walls with sanitary objects. You will enter these surfaces as special
vertical surfaces.
As parts of the bathroom are located under sloping walls, you will
define the height by selecting the maximum component height
option.
Special surfaces have a higher priority than finishing surfaces.
Placing a special surface on top of a finishing surface makes a “hole”
in the finishing surface.

To create vertical surfaces
Tip: Select a different pen
(for example, pen 8, green)
for the plan view.

1

Click
Vertical Surface (Rooms, Surfaces, Stories task area)
and check the Properties palette to see whether the RO_VERSU
layer is selected.

2 Click

Properties.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

347

3 Specify the Material, Thickness and Trade for each layer or coat
of the surface.
The system will apply the surface to the area of the unfinished
structure without taking the coat of plaster (defined earlier for
calculating the area) into account. Therefore, enter the plaster as
the first layer or coat in the surface properties. You can use this
approach to redefine just specific parts of a surface from scratch.

348

Exercise 11: rooms, finish, and floor area

Allplan 2022

4 Click Height and make the following settings:
-

Top level:
Relative to upper plane but only up to 2 m from
finished floor (= 2.11 m from unfinished floor). Therefore, click
Maximum component height and enter 2.11.

5 Click OK to confirm all the dialog boxes.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

349

6 Click the points defining the outline of the surface in plan. To
specify the first point, roughly click 2 m from the upper-right
corner (where the bathtub ends). Select ESC to close the polyline.

7 Place the label and then select the ESC key to finish.
If you do not want to apply a label, simply select ESC.

350

Exercise 11: rooms, finish, and floor area

Allplan 2022

Area calculations according to residential space ordinance
The regulations for calculating the floor area (residential space
ordinance) came into effect on January 1st, 2004. As opposed to the
old regulations, you must use clear dimensions in calculations. A flatrate amount to account for plaster is no longer permitted.
By means of the finishing surfaces you defined for every room, you
can quickly and easily calculate the floor area in accordance with
these regulations.
Allplan 2022 offers various reports for area and floor area
calculations. Each report provides the following options:
• For calculations according to the residential space ordinance, use
the precise finished dimensions, which are calculated based on
the finish specifications, vertical surfaces, floors, and ceilings
(based on finished dimensions).
• However, you can still use all the options for calculating the floor
area based on the second calculation directive:
A value subtracted to account for plaster and covering (based on
unfinished dimensions less a percentage for plaster to be
subtracted from the overall area)
• Area of structure (based on unfinished dimensions)

To calculate floor area
1

Click

Open on a Project-Specific Basis.

Turn on the Derived objects area by selecting the Derived
objects check box.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

351

2 Check the Derived from building structure area on the right side
of the dialog box to see whether this area already contains the
Reports structural level.
If this is not so, open the shortcut menu of the Architecture
Tutorial project and point to Insert structural level Reports.

3 Open the shortcut menu of Reports, point to
level and click
Report.

Insert structural

352

Exercise 11: rooms, finish, and floor area

Allplan 2022

4 Open the shortcut menu of Report and select Source drawing
files for report.

5 Select drawing file 110 Top floor model in the Select file dialog
box.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

353

6 Open the shortcut menu of Report again and click Select report
and settings.

7 The Building structure - reports dialog box opens. Click the
Report template button in the Report selection area.

354

Exercise 11: rooms, finish, and floor area

Allplan 2022

8 In the Reports dialog box, select the Default folder and then the
Rooms, surfaces, stories folder.

9 Select the Floor areas folder.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

10 Select the Living space.rdlc file.

11 Click the following button to define how to calculate areas:

355

356

Exercise 11: rooms, finish, and floor area

12 You can modify each factor.

13 Click OK to close.

Allplan 2022

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

357

14 Click the following button in the Reports dialog box:

15 Go to the Calculate Floor Area dialog box, select the Finished
dimensions, finish specs included option and click OK to close
the dialog box.

358

Exercise 11: rooms, finish, and floor area

Allplan 2022

16 Close the Reports dialog box by clicking Open.

17 You are back in the Building structure - reports dialog box.
Select the Report Viewer option in the Output area.

18 Click OK to close the Building structure - reports dialog box.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

359

19 Open the shortcut menu of Report and select Generate report.

360

Exercise 11: rooms, finish, and floor area

Allplan 2022

A separate viewport opens, displaying the report. Use the arrows
at the top to move through the pages.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

361

The report can be printed, placed in the document, transferred to
Excel or Word, or saved as a PDF file.
You can use
Layout Designer to change and save report
templates. You can modify the layout and, to a certain degree,
the contents of existing cells.
In the Properties palette, you can change the Allplan system
parameters such as project name and edited by. By default, these
parameters are taken from Allplan attributes. In the User
Interaction area, you can show and hide the logo and control
page numbering.
This palette only opens if the report has parameters you can
change.
20 Close the Report.
21 The Open on a project-specific basis: drawing files from
fileset/building structure dialog box is still open.
Enter a name for the report you just created, for example, Floor
area.

Note: You can also use the
Area Calculation, Application tool
(Rooms, Surfaces, Stories task area) to create reports for floor
area calculations.

362

Exercise 12: quantity takeoff

Allplan 2022

Exercise 12: quantity takeoff
Reports
Allplan 2022 comes with a wide range of predefined standard
reports, which are sorted by topic and arranged in folders. You can
also create your own, custom reports and save them to the Office
folder.
Tip: You can find advanced
information on architectural
reports in the Allplan Help.
See the "Available reports,
overview" section.

How to generate reports
• Open the drawing files with the elements you want to analyze.
This will only work when the criteria you are looking for are
actually met in the drawing files.
•

Reports: Select a report. The entry you choose lays down the
criteria according to which the system will scan the drawing files
for elements.

• Optional: Use

Find Elements to enter additional filter criteria.

• Define the area of the drawing files to be analyzed (entire
drawing file or just parts of it).
• Print the report, display it in the drawing file or save it as an ASCII
or Excel file.
The exercises that follow show how to use reports. In addition, you
will learn how to enter search criteria.

To generate a standard report
 Make drawing file 110 Top floor model current and close all the
others. Clear the Derived objects check box.
 Make the AR_WALL layer visible. Hide the other layers.
1

Click

Reports (Annotations task area).

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

363

2 In the Reports dialog box, select the Default folder and then the
Unfinished structure folder.

3 Select the Walls.rdlc file in the Reports dialog box and click Open.

364

Exercise 12: quantity takeoff

Allplan 2022

4 Click All in the input options or right-click in the workspace twice
(do not double-click!!).

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

365

The report appears in the Report dialog box on the screen. The
report options were covered in the section "Area calculation
according to regulations". You can find detailed information on
the Report dialog box in the Allplan Help. See the "Report Viewer"
section.
Note: You created this report by using the
Reports tool in the
Annotations task area of the Actionbar. As you can see, the
Show graphics option is selected in the User Interaction area.
When you point to the graphic of a wall, the cursor changes to a
.

366

Exercise 12: quantity takeoff

Allplan 2022

Click the graphic.
Allplan highlights the wall in plan view and isometric view,
centering the wall and zooming in on it in plan view.

5 Click

to close the Report.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

367

Examples of reports
Here are some examples of reports to illustrate possible applications.
These reports were created for the top floor of the tutorial building.
Additional search criteria were not specified.
Tip: For quantity takeoff,
you can transfer the
quantities to a program for
tendering, awarding, and
invoicing.
When assigning materials,
you can use material
catalogs with item numbers.

The unfinished structure reports also analyze area and volume to be
subtracted in compliance with building regulations. In the User
Interaction area, you can define how the report looks. For example,
you can show and hide the logo or the graphics of the components.

368

Exercise 12: quantity takeoff

Allplan 2022

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

Here is the same report without the logo and the graphics:

369

370

Exercise 12: quantity takeoff

Allplan 2022

You can use the finish reports to analyze finish specifications in
different ways. Try it out for yourself and generate a report for the
finish in the bathroom. In this case, you do not need to open and
select everything – just select the bathroom (enclose it in a
selection rectangle or click the room). The following illustration
shows the Finishing surfaces, overview.rdlc report (Default folder
- Finish folder - Finishing surfaces subfolder). The layer you
assigned to the rooms must be visible and modifiable.

Tip: Area calculations
consider reveals.
The only requirement is that
you defined the reveal
when you entered the
window openings.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

371

By using the same approach, you can generate reports based on the
building trade assigned to the various elements in your model. Here,
too, this will only work if the elements have a trade.

372

Exercise 12: quantity takeoff

Allplan 2022

Entering search criteria
With search criteria, you can analyze the building in many different
ways. To analyze the entire building, you must select all the relevant
drawing files.
You will use the Unfinished structure - Walls report to define a
search criterion that lists only walls that are 11.5 cm thick.

To enter search criteria
1

Click
Reports (Rooms, Surfaces, Stories task area), select
the Walls.rdlc report (Default folder - Unfinished structure
folder) and click Open to confirm.

2 Click

Find Elements in the input options.

3 Click Object. A dialog box opens. Select the object you want to
find: Wall. Click OK to confirm.

You can use Boolean operators to link your search criteria.
4 Click & “and“ (logical AND).
The second criterion is an attribute of the wall object - its
thickness.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

373

5 Click Attribute…, go to the Architecture - Quantities area and
select the Thickness attribute. Click OK to confirm.

6 Select the comparison criterion =.
Tip: You can use
to undo
the entries in the Criterion
line one by one.

7 Go to the Numbers area and enter the thickness: 0.115. Just click
the numbers you need.
The search criterion now looks like this:

8 Click OK to confirm.

374

Exercise 12: quantity takeoff

Allplan 2022

9 Click All in the input options or right-click in the workspace twice
(do not double-click!!). The report now lists only those walls that
match the criterion.

10 Click

to close the Report.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

375

Building lists
You can use building lists to analyze data in reports. To create
building lists, you can use the Building Lists… tool (drop-down list of
the Allplan icon) or the Derived from building structure area in the
Building structure.
Regardless of the option you choose, the steps for creating the
report are very similar. You select the drawing files in a tree
structure and assemble the data for the building list. Next, define the
components of the building list you want to analyze and start the
operation.
Building lists always select the entire contents of drawing files.
However, only the visible layers are analyzed by building lists. It is
therefore necessary to select the layers to be analyzed beforehand.
You cannot define search criteria here.
The sections that follow describe the two options.

376

Exercise 12: quantity takeoff

Allplan 2022

How to use the Building Lists tool
You can create building lists by means of the Building
Lists tool.
1

Click
icon.

Building Lists... in the drop-down list box of the Allplan

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

377

2 Go to the Assemble data for analyses area and click the Building
structure and drawing file button.

3 Select the following drawing files: 3 Chimney; 100 Ground floor
model; 101 Ground floor carport; 109 Ground floor slab; 110 Top
floor model; 112 Roof; 116 Upstand
4 Click OK to confirm.
5 To select the Report template, click the button in the Report
selection area.
6 Select the Default folder, the Unfinished structure folder, and
the Walls.rdlc file. Then click OK to confirm.
7 Go to the Output area, select the Report Viewer file type, and
click Start.

378

Exercise 12: quantity takeoff

8 Click

to close the Report.

Allplan 2022

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

379

Building lists derived from the building structure
To create a building list which is derived from the
building structure
1

Click

Open on a Project-Specific Basis.

2 Turn on the Derived objects area by selecting the Derived
objects check box.
3 Go to the Derived from building structure area on the right side
and open the shortcut menu of Reports.
4 Point to

Insert structural level and select

Report.

380

Exercise 12: quantity takeoff

Allplan 2022

5 Open the shortcut menu of Report and select Source drawing
files for report.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

381

6 Select the following drawing files: 3 Chimney; 100 Ground floor
model; 101 Ground floor carport; 109 Ground floor slab; 110 Top
floor model; 112 Roof; 116 Upstand

7 Click OK to confirm.
8 Open the shortcut menu of Report again, click Layer setting,
print set, and select the Include all layers option.

382

Exercise 12: quantity takeoff

Allplan 2022

9 Open the shortcut menu of Report again and click Select report
and settings.

10 Go to the Report selection area and click the button to the right
of Report template.
11 Select the Default folder, the Unfinished structure folder, and
the Walls.rdlc file. Then click OK to confirm.
12 Go to the Output area and switch the file type to Report Viewer.
13 Click OK to confirm the dialog box.
14 Open the shortcut menu of Report again and select Generate
report.

Architecture Tutorial

Unit 7: area calculations and quantity takeoff

15 Click

383

to close the Report.

16 The Open on a project-specific basis: drawing files from
fileset/building structure dialog box is still open.
Enter a name for the report you just created, for example, Walls.

384

Exercise 12: quantity takeoff

Allplan 2022

Architecture Tutorial

Unit 8: layouts

385

Unit 8: layouts
Before you start, you must configure the printer.
With Allplan 2022, you can print the contents of the
screen directly to a printer.
To bring the final drawing to paper, you will arrange all the
drawing files in a layout.

Requirement for printing
Before you print, you need to configure the output device correctly.
If you work on a network, you can use any device connected to a
remote machine (assuming it is configured correctly).
To do this, you must connect the output device.
For further information, consult the user guides of your printer and
operating system.

Printing the screen contents
Often, you want to have the current edit status on paper without
having to assemble a layout first.
You can do this by printing the screen contents.

To print the screen contents
 Drawing file 110 Top floor model is current.
Make the layers AR_WALL and DL_100 visible and hide all the
other layers.
1

Click

Print Preview (Quick Access Toolbar).

386

Tip: To create more
printouts, click
Quick
Print in the drop-down list
of the Allplan icon.
Without prompting you
again, Allplan prints the
screen contents with the
most recent settings.

Requirement for printing

Allplan 2022

2 Make the following settings in the Print Preview palette:
• Select the printer in the Settings area.
• Go to the Display of elements area and select the Thick line
option.
This not only makes the different line thicknesses visible on
the screen but also ensures that they are printed as such.

3 Click

Zoom All on the viewport toolbar.

4 Click Print.
5 Select ESC to close print preview.

Architecture Tutorial

Unit 8: layouts

387

Exercise 13: custom title block
Allplan 2022 provides a wide range of "intelligent" title blocks based
on label styles. Label styles contain design entities, texts, and
attributes.
The advantage of a title block with attributes is that the program
updates the text whenever you open the layout.
You can define your own, custom label styles.
Note: You draw a title block in exercise 5 of the Basics Tutorial and
save this title block as a symbol with the name Original in the Title
blocks folder. You can find this folder in the library (Office Symbols). You will use this title block for the exercise that follows.
If you have not created this title block, you can find it in drawing file 7
in the training project. Look in the appendix for information about
how to download the compressed projects; see “Compressed
projects on the internet (on page 505)”.

To assign attributes
1

Click
New Project, Open Project... on the Quick Access
Toolbar.

2 Open the shortcut menu of the Architecture Tutorial project and
click Properties....

388

Exercise 13: custom title block

Allplan 2022

3 The Project Settings dialog box opens. Click the Assign
attributes... button.

Architecture Tutorial

Unit 8: layouts

389

4 The Project Attributes dialog box opens. Expand the Architect
node.

5 Click the Architect attribute.
6 Enter the following:
Sam Sample
7 Select the ENTER key to confirm.

390

Exercise 13: custom title block

Allplan 2022

8 Define the Client, Client address, Construction project name,
Location/plot, and Structural analysis attributes as shown:

Architecture Tutorial

Unit 8: layouts

9 Click OK to confirm the Project Attributes, Project Settings,
and New Project, Open Project dialog boxes.

391

392

Exercise 13: custom title block

Allplan 2022

Title block as a label style
After having assigned the attributes, you can use them in the label
style for the title block.
The following exercise assumes that you have the title block from
Exercise 5 of the Basics Tutorial for Allplan 2022. You drew this title
block and saved it as a symbol with the name Original in the Title
blocks folder of the library.
Note: If you have downloaded the training project from the internet,
you can find the title block in drawing file 7. Copy the contents of this
drawing file to an empty drawing file (for example, 10) of your
project. Select the drawing file with the title block (for example, 10)
and go to step 7.
Look in the appendix for information about how to download the
compressed projects; see “Compressed projects on the internet (on
page 505)”.

Title block as a label style
 You can access the Original title block that you created in the
Basics Tutorial.
 Open an empty drawing file and close all the others.
Tip: To quickly and
accurately position the label
styles later, you can place
Point Symbols as
Construction Lines to
mark the starting points of
the original texts
(Role Architecture, task
Unfinished structure, task
area quick access).

 Switch the scale to 1:1.
1

Click the Office folder in the Library palette.

2 Open the Symbols folder.
3 Open the Title blocks folder.

Architecture Tutorial

Unit 8: layouts

393

4 Double-click the Original symbol.

The symbol's base point is attached to the crosshairs.
5 Click in the workspace to place the symbol.
Tip: You can use the Input
Options to change the
position of the symbol’s
base point and define a
cursor snap angle.
Use the tools on the
shortcut menu to exactly
define the symbol’s drop-in
point.

6 If the title block appears too small, click
viewport toolbar.

Zoom All on the

394

Exercise 13: custom title block

Allplan 2022

7 Delete the texts that you want to replace with attributes
(project-specific information).

Label Style (Architecture role - User-Defined Objects
8 Click
task - Label Styles task area).
9 Click Attribute on the context toolbar.

Architecture Tutorial

Unit 8: layouts

395

10 Select the Project area, choose the Construction project name
attribute, and click OK to confirm.

11 Define the text parameters as shown in the illustration and
change the format to A35.
This defines the attribute as a text with 35 characters maximum.

12 Place the attribute so that it is left-aligned in the box for the
construction project details.
13 Repeat steps 9 to 12 and place the following attributes:

396

Exercise 13: custom title block

Allplan 2022

Area

Attribute

Format

project

Construction project, name

A35

Location/ plot

A35

Client

A35

Client, address

A35

Architect

A35

Architect, address

A35

Structural analysis

A35

Layout name

A50

Layout

14 Click DefFol (Define Foil).
15 Enclose the entire title block in a selection rectangle.
16 Click the lower-right point to define it as the reference point.
Title blocks must always be saved to folders 7 and 8 because
these folders are linked with the Plan layout task with the
label layout border tool.

Architecture Tutorial

Unit 8: layouts

397

17 Click subfolder number 8 and enter Title blocks.

18 Click entry 1 and enter Unfinished structure.
19 Select the ESC key to close the tool.
You have now saved the title block as a label style.
You can also find the
Label Style tool on the Actionbar Engineering role - User-Defined Objects task - Label Styles task
area.

398

Exercise 13: custom title block

Allplan 2022

Printing layouts
Printing finished layouts is a critical step. In Allplan 2022 a layout is
the unit you send to the printer. As opposed to designing on a
conventional drafting board, you do not need to define the scope of
the layout in advance.
Generally, you leave the layout (which involves arranging drawing
files) until you’re finished with the design. This is also the stage
where you define the paper size, scale, border, angle, and so on.
Each project can contain up to 9999 layouts.

Architecture Tutorial

Unit 8: layouts

399

Layout editor
In the following exercises you will set up a layout with the floor plans
of the ground and upper floors of the sample building.
This involves two steps:
• Define the layout, that is, the sheet size, border, and label (title
block).
• The second step is to select the layout elements, that is, the
drawing files.

To define a layout
1

Switch to the Layout Editor task (Architecture role) on the
Actionbar.

2 Click
Open on a Project-Specific Basis to select the layout in
the Open on a project-specific basis: layouts dialog box.
Tip: The name you enter
here will appear as the Plan
name attribute in the title
block!

3 Click in row 1, enter Floor plans and close the dialog box.
4 Click

Set Up Page (Layout Editor task area).

400

With this setting for the
margins, Allplan always
places the page so that its
lower-left corner coincides
with the lower-left corner
of the printable area of the
printer selected in the
Print Layouts tool. With
this setting, you can exclude
elements that extend into
the margins from printouts.

Exercise 13: custom title block

Allplan 2022

5 Go to the Page area, change the Format to DIN A2 and select
Landscape. Go to the Margins area and select the Without
(role, PDF) option.
6 Go to the Properties area and click the button beside Layout
border.

Architecture Tutorial

Unit 8: layouts

401

7 Go to the Border type area and select Filing margin (DIN 824 A)
for the border type.

402

Exercise 13: custom title block

8 Click Close at the bottom of the palette.

Allplan 2022

Architecture Tutorial

Unit 8: layouts

403

9 Go to the Properties area, click the button beside Title block and
choose Label.
Tip: To change the layout
label, you can use the
standard text tools in the
Quick Access task area.

404

Exercise 13: custom title block

Allplan 2022

10 Open the Office folder, select the label style called Structure and
click OK to confirm.

Architecture Tutorial

Unit 8: layouts

405

11 If you want to place the title block in the lower-right corner of the
layout border, enter 0 for Offset to the right and Offset to the
bottom.

Set Up Page tool by clicking Close at the bottom of
12 Close the
the palette.
Now you have placed the layout border and the title block.

406

Exercise 13: custom title block

Allplan 2022

As you can see, the title block now displays the values assigned
instead of the attributes.

Selecting layout elements
Layout elements are mainly drawing files that you place in the
layout. You can define the layers you want to include in the printout
by selecting a print set.

To select layout elements
1

Click

Layout Element (Layout Editor task area).

Architecture Tutorial

Unit 8: layouts

2 Click

407

Building structure on the context toolbar.

3 Select drawing files 100 Ground floor model and 101 Ground
floor carport and click OK to close the dialog box.

4 In the Layout Element dialog box, click Layer/print set, select
the Print set, current setting of selected print set (dynamic)
option and select the PR Design print set.

408

Exercise 13: custom title block

Allplan 2022

5 Place the drawing files in the layout.
Drawing file 105 is now attached to the crosshairs. As you do not
need this drawing file, click
Building structure and select
drawing file 110 Top floor model. The PR Design print set is still
selected.
6 Place the drawing file in the layout.
7 Select ESC to finish selecting layout elements.

Allplan saves the finished layouts. You can print them now or later.

Printing the layout
You can now print the finished layout.
Make sure the printer is installed and configured correctly.

To print the layout
1

Click

Print Layouts (Layout Editor task area).

2 Select the Printer tab.
In the Selection area, layout 1 is selected.
Click the Set button to select the elements you want to print.
You can limit the output to certain types of design elements only.
Furthermore, you can place the surface elements of each
document in the background.
Leave the settings as they are.
3 In the Settings area, you can choose the output device (printer,
large-format printer) and the paper size (for example, Super
C/A2). So that the layout is printed in its entirety, the printable
area (printable area minus device margins) must be larger than
the page.
Note: If you have configured output channels in the Services
application, you can select them via the Allplan vector drivers
option.

Architecture Tutorial

Unit 8: layouts

409

4 Depending on the selected output device, you can use Allplan
raster drivers. These printer drivers are especially suitable for
printing large-format layouts. Raster drivers speed up printing,
enhance the quality of printouts and are very reliable.
If you want to use raster drivers, select the Allplan raster driver
option and open the list box to select a raster driver that can be
used with the selected printer.
Note: You can define the properties of the Allplan raster driver by
clicking
beside the selected printer.
Note: The following prompt appears the first time you select an
output device that can be used with Allplan raster drivers:

Click Yes if you want to use Allplan raster drivers. The Allplan
raster driver option and an appropriate raster driver are
selected.
Note: If the When setting up page - adjust paper format
(printer) option is selected ( Options, Layouts page) and you
set up the page, Allplan automatically adjusts the paper format
of the device to the format and orientation of the page. In doing
so, Allplan tries to select as identical a paper format as possible. If
you have not defined margins for the page, the program tries to
select a format without margins. If formats without margins are
not available, Allplan selects the next largest paper format. If
Allplan cannot find a suitable format, it selects the largest format
available for the output device.
Select paper format
If this option is not selected, click
(printer) based on page format to manually match the format
and orientation of the page.

410

Exercise 13: custom title block

Allplan 2022

5 Select the Landscape format and do not change the number of
copies: 1.
You can also set up the page here.

6 Define settings in the Output mode area.
If you want to bring the layout to paper, select the Print option.

Architecture Tutorial

Unit 8: layouts

411

7 To start printing, click Start.
The program sends the data to the printer.
Note: You can find more information on the tabs of the Print
Layouts tool in the Allplan Help.

Layout windows
You can use layout windows to position just portions of drawings in
your layout. Thus, you can display elements that are far from one
another in the building model beside each other in the layout. In the
following exercise, you will create layout windows and display
sections of individual drawing files.

To create layout windows
1

Use
Open on a Project-Specific Basis to open an empty
layout. Then select
Set Up Page and define the format,
orientation and margins of the page.

2 Click

Layout Window (Layout Editor task area).

You will create the window so that you can immediately select
the drawing file you want to display.
3 Click .. place drawing files as layout elements.

Building structure, select
4 On the context toolbar, click
drawing file 100 Ground floor model (drawing file number) and
place it in the layout.
5 Select ESC, as you do not want to select more drawing files for
this layout window.

412

Tip: By using the polyline
entry tools, you can also
define freeform layout
windows or create layout
windows composed of
several polygons.
Area
Check that
detection is turned off in
the input options.

Tip: By using
Show/Hide ( View
drop-down list on the Quick
Access Toolbar), you can
hide the Layout
element/window border.

Exercise 13: custom title block

Allplan 2022

6 Define the size of the layout window by clicking two diagonally
opposite points (lower-left and upper-right points). Then select
ESC twice (see illustration).
7 Repeat steps 2 through 6 to create a layout window for drawing
file 110 Top floor model.
If available, you can also use the drawing files with the West
elevation and North elevation.
8 Click
Modify Layout Window (Layout Editor task area) and
select Enter new polygon for layout window to change the size
of the window.

9 To rearrange the layout windows, you can use
task area).

Move (Edit

Architecture Tutorial

Unit 8: layouts

The result might look like this:

413

414

Exercise 13: custom title block

Allplan 2022

Architecture Tutorial

Unit 9: visualization

415

Unit 9: visualization


The exercises in this unit require the Architecture role on the
Actionbar.

The ability to make presentation drawings - be it for
clients or for competitions - is important.
Allplan thus comes with powerful presentation tools.
These include tools for simple hidden-line images to realtime walk-throughs.
You can create a realistic, three-dimensional image of
your design at any time during design – with colored
surfaces, lighting, and shadows. This unit shows you how.

416

The visualization task

Allplan 2022

The visualization task
Allplan 2022 provides comfortable and powerful tools for presenting
and visualizing building models and interiors. You can find these tools
in the Visualization task. In this tutorial, you will work with tools you
can find in the task areas of the Visualization task.

The task areas
The Visualization task contains three variable task areas:
• Surfaces, Light
• Camera
• Shadow
These task areas provide two types of tools:
• Tools for creating vector data
• Tools for creating pixel data
With tools of the first type, you automatically generate full-surface,
color representations of 3D models including shadows cast by two
light sources ( Photo Settings and
Photo in the Shadow task
area). You can also take natural daylight into account by specifying a
latitude, date and time. Thus, you can study the effects of light and
shadow on a building over the course of a day.
Furthermore, you can create photorealistic images of building
models. The program calculates these photos based on the selected
perspective view ( Photo for Sun Study in the Shadow task
area). You can also study the effect of sunlight on a building over a
period of time.
All elements you create in this way are saved in vector format, which
means that you can move, mirror, resize, ... the elements without loss
of quality.
The following tools create pixel data.
Choosing from up to 16 million colors, you can shade walls, windows,
solids, 3D lines, ... you created with the tools in the Elements and
Modeling tasks. Use
Set Project Light (in the Surfaces, Light
task area) to select any number of colored light sources of varying
Set Surface
intensity. Thus, you can create realistic scenes. Use

Architecture Tutorial

Unit 9: visualization

417

(in the Surfaces, Light task area) to assign surface properties to
architectural elements and 3D elements. You can use textures, such
as wood, marble, stone, sand, supplied with the program or bitmap
images such as scans of tile structures for material simulations.
To view the object in its real surroundings or to achieve other visual
effects, you can place a bitmap image (for example, a scanned
photograph) as a texture in the background. You can then display
this background bitmap as a 2D plane or a 3D sphere.
Render (in the Surfaces, Light task area) to render images
Use
based on global illumination (with or without QMC). Thus, you can
produce photorealistic images for presentations.
Set Camera Path (in the Camera task area) to match
Use
camera positions intuitively from the viewport. You can also define a
camera path in plan view or enter the coordinates of the cameras.
Record Movie (in the Camera task area) to record the
Use
camera path as an AVI movie, which you can then play back on any
Windows computer. You can save the resulting bitmap images and
use them for presentations. Predefined camera paths, such as
Rotate camera by 360 degrees,
Orbit camera by 360
degrees and
Sun study produce meaningful results in no time at
all.
When recording movies, you can choose between Animation (fast;
using the flat-shading, Gouraud or Phong method) and Render
(realistic; using the global illumination method).
So you can quickly and easily check each design stage or
construction stage and create convincing presentations. If you do
not want to display the entire 3D model in animation, you can select
Element Selection. You can even
individual components by using
display only a single design entity in animation.
Until now you have used design tools to create your building model.
These tools and the tools briefly described in the last section create
and process two completely different types of data, vectors and
pixels.

418

Exercise 14: displaying the entire model in animation

Allplan 2022

Exercise 14: displaying the entire model in
animation
Real-time animation is only real time if you have a computer that is
powerful enough to calculate the complex data.
To demonstrate the effects more clearly and to shorten processing
time, you will use just the walls on the ground floor in the following
exercises. If you want, you can follow this procedure with the entire
building model.

How to create animations
The following shows how to create a movie model in just five steps.
You will learn about the basic concepts of animation.
Bear in mind that making complex animations with sophisticated
effects requires practice and experimentation. Consider the
following as an introduction and try to spend some time exploring
the different possibilities.
Procedure:
• Define the animation parameters and define the first scene
• Define the lighting (sun)
• Define materials and surface properties
• Choose a rendering method and render the image
• Assemble the movie model: position cameras

Architecture Tutorial

Unit 9: visualization

419

Animation window
You can see lights, surfaces, and shadows in a viewport of the
Animation view type.

To open an animation window and to define
parameters
 Open the Visualization task (Architecture role) on the
Actionbar.
 Make drawing file 100 Ground floor model current and open 101
Ground floor carport in edit mode.
 Make the layers AR_WALL, AR_COL, AR_WIND, and AR_WSILL
visible and hide all the other layers.
1

You have various options to display the design in animation:
• The quickest way is to select the F4 key.
Allplan opens an additional viewport of the Animation view
type. You can see the building in the middle of the animation
viewport. The view is from the front and top. In addition,
3D View
Allplan selects the Perspective view option in
and switches to
Navigation Mode (viewport toolbar).
• You can use the Quick Access Toolbar: Click
Window to
open the drop-down list and select
Animation Window.
Here, too, Allplan opens an additional viewport of the
Animation view type. You can see the building in the middle of
the animation viewport. The view is from the front and top. In
addition, Allplan selects the Perspective view option in
3D View and switches to
Navigation Mode (viewport
toolbar).

420

Exercise 14: displaying the entire model in animation

Allplan 2022

• You can use the viewport toolbar: Click View Type on the
viewport toolbar and select Animation.
Allplan changes the view type of the active viewport to
Animation. Here, Allplan neither selects the Perspective view
option in
3D View nor switches to
Navigation Mode
(viewport toolbar).

Note: If the cursor looks like this
active.

,

Navigation Mode is

2 You have opened an animation viewport by selecting F4, for
example.
The default planes and a virtual ground plane are visible in
animation. You will hide the default planes, as you do not need
them for the following exercises.
Open the
Default Settings drop-down list on the Quick
Access Toolbar and click
Options.

Architecture Tutorial

Unit 9: visualization

3 Open the Animation page and go to the General area. Turn off
the Display planes - Default planes option and click OK to
confirm.

4 To define how the virtual ground plane looks, you can use the
Surroundings tool. You can find this tool in the Surfaces,
Light task area or on the shortcut menu of a viewport (if
Navigation Mode is selected).
Select this tool.

421

422

Exercise 14: displaying the entire model in animation

Allplan 2022

5 As you can see, the Virtual ground plane option is selected in the
corresponding area in the Surroundings palette.

The Connect with ground option is also selected by default. In
this case, the virtual ground plane will automatically adjust to the
bottom of the elements. For example, if you open drawing file 3
Chimney in addition to the other drawing files, Allplan will move
the virtual ground plane below the bottom level of the chimney.

Architecture Tutorial

Unit 9: visualization

423

6 If you want, you can customize the surface of the virtual ground
plane to your needs. Click the relevant button and define settings
in the Virtual ground plane palette.

7 Click OK to close the palette.
8 Close the

Surroundings tool.

424

Exercise 14: displaying the entire model in animation

Allplan 2022

If
Navigation Mode is active (cursor looks like this
), you can
use the mouse to walk around and through the building in animation.

Animation with the mouse
Tip: Selecting and holding
the Shift key accelerates
the movement of the
mouse.

1

Move by selecting one of the following mouse buttons and gently
moving the mouse:
• Left: Turns the camera about an object on the surface of an
imaginary sphere.
• Middle: Moves the camera to the left or right and up or down
on a linear path.
• Right: Zooms in or out; moves the camera forward or
backward.

2 Close animation by closing the viewport or selecting the
Wireframe view type on the viewport toolbar.

Mouse movement in sphere mode and camera mode
The default setting is sphere mode. In this mode, the eye point pivots
about the target point and its movement is constrained to an
imaginary sphere. You have already encountered the movement of
the mouse in sphere mode. This topic was dealt with in “Unit 2:
Building Design”:

Architecture Tutorial

Unit 9: visualization

425

Mouse navigation in sphere mode
Select and hold the left mouse button:
Turns the camera about the object on the surface of an imaginary
sphere.
Select and hold the middle mouse button:
Moves the camera laterally, up, down.
Select and hold the right mouse button:
Moves the camera toward or away from the object (zooming)
If you select the Ctrl key while you are in animation mode, you switch
to Camera Mode. This mode can be visualized as the view through a
camera with the observer at the center, 'looking' around.

Mouse navigation in camera mode
Ctrl+left mouse button:
Rotates the camera about the viewer (”camera pan”).
Select and hold middle mouse button:
Moves the camera laterally, up, down.
Ctrl+right mouse button:
Moves the camera toward or away from the object (zooming)

426

Exercise 15: lights and surfaces

Allplan 2022

Exercise 15: lights and surfaces
Light
Appropriate lighting is an important factor if a presentation is to be a
success. The program provides a wide range of lighting options:
• Sunlight: Use the
Surroundings tool to make settings for
sunlight by defining the position, time and angle of the north
arrow in plan view. You can also add a fill-in light for interiors.
• Individual lights (particularly important for lighting interiors): Use
Set Project Light to create these lights. For each light, you
can define a color, the type of light source and the exact location
of the light source and its target point.
-

Point light is diffused evenly in all directions from a single
light.
Spotlight is conical light; the intensity of this light drops the
further away from the point it is.
Conical light is similar to spotlight except that the intensity of
the light pool cast is uniform.
Area is a light source that diffuses light evenly in one
direction.

You can use the
Sun Study tool to generate sun path studies
quickly and easily,
In the following exercise, you will define the sunlight.

To set up lights: sunlight
Tip: Click
(bottom border
of the palette) to
return to the default values.

1

Click
Surroundings (Surfaces, Light task area). You can also
right-click in the animation viewport and select
Surroundings
on the shortcut menu.

2 In the Surroundings palette, make the following settings in the
Position of sun / north area:
• Month: July
• Day: 1
• Time: 15:00
• North: 0 (the side where the kitchen is located).

Architecture Tutorial

Unit 9: visualization

427

3 In the Location area, select a city in the list.
You can add cities to the list: first enter the latitude and longitude.
Then enter a name for the location.
4 Select the Summertime check box.

5 Select ESC to close the Surroundings palette.

428

Exercise 15: lights and surfaces

Allplan 2022

6 You can immediately see the effects of these settings in the
animation viewport (if it is not open, select Animation on the
viewport toolbar).
The shadows cast by the lights are not visible due to the
rendering method used here. The direction of lighting, however, is
evident from the illumination of the surfaces.
Note: Due to various factors (for example, local time, time zone), the
calculated position of the sun might not exactly match the actual
position in reality, even if you have defined the location and time
parameters correctly. For further information and possible solutions,
see the "Sun and longitude, notes” section in the Allplan 2022 Help.

Surfaces
Each line color can be assigned a surface color, texture, and a value
for transparency, luster, and refraction.

Defining colors
In Allplan, you have three options to define and mix colors. You can
also combine these options.
• Click the color in the color circle and define its brightness with the
slider.
• Mix the color in the following color spaces by entering values in
the boxes:
-

RGB: red-green-blue color space

-

LAB: LAB color space

-

HSL: HSL color space (hue, saturation, lightness)

-

CMY: subtractive cyan-magenta-yellow color model

-

Hexadecimal: hexadecimal color definition; hexadecimal
numbers represent the RGB color value in the sequence
RRGGBB.

• Select a color system, a color file and then a color name in the file.
You can also define your own custom palettes.

Architecture Tutorial

Unit 9: visualization

429

Note: The Color stands for pen option, which can be turned on and
off in
Show/Hide, has no effect on the colors in animation;
surface properties are always assigned based on 256 element
colors.
You will now assign the walls a different color.

To define a surface for a wall
Tip: You can also define
surfaces by using
Set
Surface (Surfaces, Light
task area).

 The animation viewport is still open.
If it isn’t, select the F4 key.
The walls are in color 1.
Color stands for pen is not selected in
Show/Hide (
drop-down list on the Quick Access Toolbar).
1

View

Go to the animation viewport, right-click one of walls and select
Set Surface on the shortcut menu.
Note: You can find the
Set Surface tool on the shortcut menu
of the animation viewport only if
Navigation Mode (viewport
toolbar) is selected.
The Modify Surfaces palette opens.

430

Exercise 15: lights and surfaces

2 Click the Color button in the Color area.

Tip: You can save your own
colors under a name of your
choice. You can also save
entire color palettes in color
files.

3 Define a color in the RGB color space:
Red: 240
Green: 240
Blue: 180

Allplan 2022

Architecture Tutorial

Unit 9: visualization

431

4 Click OK twice to confirm all settings.
You can immediately see the effects of these settings in the
animation viewport.
Changing the surface affects all visible elements with the same color!
Set Surface, you can also use
Assign
As an alternative to
Custom Surfaces to 3D, Archit. Elements on the shortcut menu of
the animation viewport to assign animation surfaces to 3D elements,
regardless of the element color.

432

Exercise 16: rendering

Allplan 2022

Exercise 16: rendering
Allplan will render your model including all the settings you have
made for the view, lights, and surfaces. The effects that you can
achieve vary depending on the rendering method selected.
When rendering, Allplan always uses the most recent view in the
animation viewport. Therefore, never render straight from the
viewport in which you design. Rather, select a suitable view in the
animation viewport before you start rendering.
The following applies, whichever method you use: The more
sophisticated the rendering method and the larger the rendering
window, the longer the whole process will take.
The following exercise uses the global illumination method.

To render an image
 Select the view you want to render in the animation viewport.
1

Select the F2 key.
Or:
Click

Render (Surfaces, Light task area).

Or:
Right-click in the animation viewport and select
the shortcut menu.

Render on

2 Define the size of the rendered image. In the Render palette, go
to the Image resolution area and click the Resolution button.
3 Open the list box and choose 600x400 (pixels). This will be
sufficient for a first impression.

Architecture Tutorial

Unit 9: visualization

4 Click OK to confirm.

5 Go to the General settings area and select the Global
Illumination (GI (IR+QMC)) render mode.

433

434

Exercise 16: rendering

Allplan 2022

6 Go to the Quality area and switch the Default to Low.
Remember: The better the quality, the longer the whole process
will take.

Tip: Once the program has
finished rendering, you can
save the image as a bitmap.
You can also edit the image
by using the menus at the
top. The options are the
Edit
same as those in the
Bitmap tool. (For more
information, select F1 to
open the Help.)

7 Start rendering by clicking the Render button.

Architecture Tutorial

Unit 9: visualization

Allplan displays the result:

8 You can optimize the result by means of the settings in the
Render dialog box.

435

436

Exercise 16: rendering

Allplan 2022

If you want, you can save the image as a bitmap to any folder.
9 Close the window with the result.

Architecture Tutorial

Unit 9: visualization

437

Exercise 17: camera path, AVI movie
You will simulate a fly-by around the ground floor.
To do this, you will start by defining a camera path by placing camera
positions and defining the viewing angle of the building model. By
using interpolation, Allplan will automatically calculate the actual
camera path between the camera positions you defined.
You will then create and record a movie by moving a camera along
the camera path you defined.

To define the camera path and to create the movie
 Divide the workspace into a number of viewports. For instance,
you might have three viewports, each showing a different view
2+1 Animation Window ( Window
of the design. Select
drop-down list on the Quick Access Toolbar).
1

Click

Set Camera Path (Camera task area).

Note: You can also select this tool by opening the shortcut menu
in a viewport where navigation mode is active.
2 Click
New camera path at the bottom of the Camera path
palette.

3 Change the icon size to Large so that the positions of the
cameras are clearly visible in plan view and in animation.

438

Exercise 17: camera path, AVI movie

Allplan 2022

4 Click the Run button beside Set camera.

The first camera is attached to the crosshairs.
5 Place the camera in plan view.
You can rotate the camera freely.
6 Click to turn the camera in the required direction (defines the
target point).
Now the camera points in the direction selected.

7 Position the next camera in the same way.

Architecture Tutorial

Unit 9: visualization

439

8 Place other cameras (see illustration) and select ESC to finish
defining the camera path.

The Camera path palette displays the camera path again.
The Cameras area shows the cameras 1 to 6 you have just placed
in plan.

440

Exercise 17: camera path, AVI movie

Allplan 2022

9 To check and correct the camera positions, you can display them
in the active viewport.
Select the camera you want to check and click the corresponding
tool.

10 If you want to change the position of the camera, click the small
arrow at the end of the line.

Architecture Tutorial

Unit 9: visualization

441

The palette now shows the parameters of the camera. You can
change the focal length and the coordinates of the eye point and
the target point.
You can find more modification options at the bottom of the
palette:
Move camera,
Rotate camera, and
Delete camera.

Tip: As you entered the
camera positions in plan, the
z-coordinates of the eye
points and target points of
all cameras are zero, that is,
the cameras "lie" on the
virtual ground plane. So that
the observer can view the
model realistically, enter a
sensible height for the zcoordinates of the eye
points and target points. For
example, enter 1.65 m.

11 Click OK to confirm your changes.
The palette displays the camera path again.
You can use the tools at the bottom of the palette to add
cameras or delete the camera path.

442

Exercise 17: camera path, AVI movie

12 Click the Record movie button.

Allplan 2022

Architecture Tutorial

Unit 9: visualization

443

13 To get a first impression, you do not need to work with large
volumes of data.
Make the following settings in the palette:

Note: If you do not enter a Name for the AVI movie, Allplan will
run the movie without saving the AVI file. So you can still change
the movie before you save the final version.
14 Click OK to confirm the dialog box.
The movie runs in the current viewpoint. The
Set Camera
Path tool closes automatically when the movie is over.

444

Exercise 17: camera path, AVI movie

Allplan 2022

Recording an AVI movie
You will now record an AVI movie along the camera path you have
just defined. This AVI movie will also include the settings for lights
and surfaces. Note that recording an AVI movie can take some time.

To record an AVI movie
1

Click

Record Movie (Camera task area).

2 In the Record movie palette, click From camera path.

3 Click Camera path 1.
4 Enter a Name for the movie and specify the folder. The project
folder is the default setting.

Architecture Tutorial

Unit 9: visualization

445

5 Select a Compression type or turn it off if you want to obtain top
quality (requires much hard-drive space!).
Click OK to confirm.

Note: You can choose from all Compression methods installed
on your computer. With Windows Media Player, you can
automatically update codecs (compression, decompression). You
can find further information in the Windows Media Player Help.
6 Go to the Settings area and switch Calculation to Render.
7 Define the Render options by clicking the Edit button.
8 Go to the General settings area and select the GI (IR+QMC)
render mode.
9 You can define further settings for rendering by clicking the Edit
button beside Options.
Click OK to confirm.

446

Exercise 17: camera path, AVI movie

Allplan 2022

10 You can define the quality of the rendered images in the Quality
area.
Switch the default to Low.
Remember: The better the quality, the longer the whole process
will take.
11 You can customize the quality settings by clicking the Edit button
beside Advanced settings.
Click OK to confirm the settings.

Architecture Tutorial

Unit 9: visualization

12 Click OK to confirm the Rendering options.

447

448

Exercise 17: camera path, AVI movie

Allplan 2022

13 Specify the Size (= size of window with the rendered image) by
clicking the button.
Select a default setting or enter the width and height in pixels.
You can also match the size of the active viewport.
Click OK to confirm the render size.

14 By using the Timeline button in the Settings area, you can make
time settings for the movie. For example, you can modify the
time between the camera positions.
Click OK to close the dialog box.

Architecture Tutorial

Unit 9: visualization

449

15 Finally, check the settings and click OK.

Note: Select the Keep images option only if you actually need
the images. In addition to the AVI movie, the program saves all
images calculated (see Number of images) to the folder you
selected when you entered the Name. This can quickly lead to
large volumes of data.
16 Start recording.

450

Exercise 17: camera path, AVI movie

Allplan 2022

During calculation, you can always see how many images Allplan
has already calculated.

You can find the final movie in the folder you specified (the project
folder is the default setting). To view the movie, double-click it.
With the settings in the illustration, it can take the program quite a
few minutes to record the movie.
For a high-resolution, flicker-free movie, select the following
settings:
• Rendering method: global illumination (GI (IR+QMC)); switch the
default quality to high or very high.
• Destination size: match the size of the active viewport
• Images per second: 16
... and start recording just before you leave work.

Architecture Tutorial

Appendix

451

Appendix
If you want to create the project and the building
structure yourself, this appendix provides useful
information and step-by-step instructions on the
following topics:
 Project organization - managing data with ProjectPilot
 Using layers
 Organizing projects only with the default layer
 Creating a project
 Creating a building structure
 Defining print sets
In addition, you can find general information about the
Actionbar configuration and the topic of drawing files.
The "Overview of tools" section presents the most
important tools that you need to work through this
tutorial.
Note: If you want to skip the general sections and start
creating the project at once, go to “Creating the project
(see "Creating the training project" on page 469)”.
Note: You can also download a compressed project with
the data for the exercises. For more information, see
“Compressed projects on the internet (on page 505)”.

452

Project organization

Allplan 2022

Project organization
Project structure, that is, the way in which you organize your data, is
an essential part of any building design project. With an efficient and
logical structure, you can locate the data you need without having to
spend a long time looking for the data.
It is worth spending time carefully planning a project’s structure
before even drawing the first line. Consider the time and effort spent
doing this as a good investment - after all, in the long term, it will
save you time and money.
With Allplan 2022’s flexible approach, you can create your own
office-specific structures which, in turn, can be altered to suit the
needs of special projects.

Managing data with ProjectPilot
What is ProjectPilot?
You use ProjectPilot to create and structure projects in a simple and
clear manner.
ProjectPilot is a powerful data management tool developed specially
for the data structure of Allplan. ProjectPilot provides tools for
copying, moving, renaming, and deleting data (for example, projects,
drawing files).
If you are already familiar with File Explorer, then you’ll find that
working with ProjectPilot is just as easy. You can use the shortcut
menu for almost everything. If you find that you need to move or
copy files, you can simply drag them to the new folder.

Architecture Tutorial

Appendix

453

User interface

Left window (A)
The left window shows the projects and folders in a tree structure.
The current project is selected and open. Click the plus sign (+) to
display the levels in a folder. Click the name of a folder to display its
contents in the right window.
By double-clicking, you can display the contents of the folder and
open it at the same time.

Right window (B)
The right window shows the folders and documents in the selected
node (in the left window). You can sort the documents by clicking the
title of a column. Right-click in the background to display the
documents as a list or as icons.

454

Project organization

Allplan 2022

Preview (C)
You can see the currently selected document (drawing file, layout) in
the preview. To move the preview, click it with the middle mouse
button and drag. Use a selection rectangle to zoom in on an area in
the preview. Double-clicking with the middle mouse button restores
the preview to its original size. Alternatively, select the * key on the
numeric keypad.
To display an isometric view: use the number keys on the numeric
keypad. Check that the Num Lock key is active as you do so.

Common approaches in ProjectPilot
If you are already familiar with File Explorer, you will quickly find your
way around ProjectPilot. You can accomplish most steps by using
the shortcut menu or the drag-and-drop feature.

Sorting documents
You can sort the documents by clicking the title of a column. Click the
column title to sort the documents in ascending order. Click the same
column title again to sort the documents in descending order. An
arrow indicates which column is being sorted and whether sorting is
in ascending or descending order.

Sorted in ascending order (arrow points
upward) by drawing file name

Sorted in descending order (arrow points
downward) by drawing file number

Architecture Tutorial

Appendix

455

Copying and moving by means of drag-and-drop editing
Instead of the shortcut menu, you can also use the drag-and-drop
feature to move or copy selected documents. Select the documents,
click within the selection and drag. You can tell whether this is
possible by the shape of the cursor when the mouse pointer is
positioned over the destination.
Cursor

Meaning
Copies the document to the folder to which point.
Moves the document to the folder to which you point.
Note: To move documents, select and hold the Shift key
while dragging the documents.
Links the document with the folder to which you point (for
example, when you assign drawing files to a fileset).
The document cannot be placed here.

Working with the shortcut menu
You can use the shortcut menu to do almost everything in
ProjectPilot. Depending on which element you click, a shortcut menu
appropriate to the element opens.

Shortcut menu of a project

Shortcut menu of the fileset folder

456

Project organization

Allplan 2022

Using the preview
You can see the selected document in the preview. You can zoom in
on the preview, pan the preview and display the preview in isometric
view. Click Preview on the View menu to specify whether and
where to place the preview.
• To turn off the preview, point to Preview on the View menu and
click None.
• To zoom in on the preview, open a selection rectangle around
the area you want to view in detail. The cursor changes to
crosshairs.
• To pan the preview, move the view with the middle mouse
button. The cursor changes to a hand. Alternatively, use the
cursor keys.
• To restore the preview to full view, double-click the middle
mouse button in the preview area or select the * key on the
numeric keypad.
• To display an isometric view, use the number keys on the
numeric keypad. Check that the Num Lock key and the preview
are selected as you do so.
Note: The preview is only available with certain documents (drawing
files, layouts).

Architecture Tutorial

Appendix

457

Understanding drawing files
In Allplan, the actual design and data creation happens in drawing
files. These are the equivalent of the transparencies used in
conventional building design. Drawing files can be used to give
projects a structure. In IT terms, a drawing file is a conventional file
stored on your hard drive. You can display and edit up to 1024
drawing files at once - in other words, you can have several files
open simultaneously. A project can contain up to 9999 drawing files.
Without layers, the individual building elements (such as walls, stairs,
labeling) are drawn in different drawing files and superimposed like
transparencies.

To edit the drawing files, you must open them. You can do this in the
Open on a project-specific basis: drawing files from
fileset/building structure dialog box.

458

Understanding drawing files

Allplan 2022

Drawing file status
By selecting the drawing file status, you define the drawing file in
which you draw and which drawing files are visible or can be
changed. The following illustration shows the different drawing file
statuses. You can find an explanation in the table.

Number

Drawing file
status

Comment

1

Current or active

The current or active drawing file is the one in which you draw. There must
always be one current or active drawing file.

2

Open in edit mode

Elements in drawing files open in edit mode are visible and can be modified.
Up to 1024 drawing files can be open simultaneously (regardless of
whether they are current, in edit mode, or in reference mode).

3

Open in reference
mode

Elements in drawing files open in reference mode are visible, but they
cannot be modified. You can configure the program to use the same color
Options,
for all elements in reference drawing files. To do this, select the
click Desktop environment and open the Display page. You cannot open
empty drawing files in reference mode.

4

Not selected

Elements in these drawing files are not visible.

5

Empty

Empty drawing files have no data type icon.

6

Assigned
temporarily

The drawing file is assigned temporarily to the fileset. This assignment will
be lost as soon as you switch to a different fileset.

Architecture Tutorial

Appendix

459

7

Open in reference
mode

The drawing file has been opened by another user in the workgroup
environment.

8

Open in reference
mode

The drawing file has been opened by another user in the workgroup
environment; the color red indicates that the drawing file has changed. You
can apply the changes by selecting Update drawing file on the shortcut
Options - Desktop environment page, you can configure
menu. In the
the program to inform you of changes in reference drawing files.

9

Linked drawing file

The drawing file contains model data or views and sections linked with
other drawing files. Allplan links drawing files when you create views and
sections with the tools in the Reinforcement Views task area.
You can use the shortcut menu to list all reference drawing files of the
current drawing file or open its reference drawing files in edit or reference
mode.

10

Views and sections The drawing file contains views and sections that you created by using the
created
shortcut menu in the “Derived from building structure” area or views and
automatically
sections that you created with the tools in the Sections task area of which
the results were saved in this drawing file.
These views and sections are usually linked with other drawing files. Allplan
considers the model data in these linked drawing files.

11

Update locked

12

Views and sections The drawing file contains views and sections created with the tools in the
Sections task area.
placed manually
These views and sections might be linked with other drawing files. Allplan
considers the model data in these linked drawing files.

By using the shortcut menu in the "Derived from building structure" area,
you can lock the update of drawing files with views and sections created
with the Update automatically option not being selected. Allplan cannot
update the result until the drawing file is unlocked or the Update
automatically option is selected. After having confirmed a prompt, you can
create a new view or section in the drawing file.

460

Understanding drawing files

Allplan 2022

Information about the active drawing file
To get information about the active document, right-click in the
workspace and choose Properties on the shortcut menu. You can
see an information box with important information.

Information

Meaning

Memory allocation

This shows how much of the memory reserved for a
document has already been allocated (as a
percentage). Background information: A certain
amount of memory is reserved for documents.

Document

This shows the number and name of the current
document (a total of 40 characters). You can also
find the number and name on the title bar of the
Allplan window.

Document type

This shows the document type, which matches the
data type icon on the status bar.

Maximum size

This shows the maximum amount of memory
available for the document in kilobytes.

Minimum values,
maximum values

This shows the minimum and maximum coordinates
in the document.

Architecture Tutorial

Appendix

461

Using layers
Understanding layers
Layers provide an additional means of structuring design entities
within drawing files. You can display exactly the information you
need just by turning the relevant layers on and off. This way, you can
proceed quickly, as you can see better what you are doing.
You can use layers to define the format properties of elements.
Layers are important organizational elements. Their importance
increases the more people are involved in a project and the more a
CAD system is used for specialist design processes. Layers do not
replace drawing files. Rather, they complement them.

Defining the current layer
When created, each element is given the current layer. The layer
which is used as the current layer is governed by the following
settings:
• When you activate a tool (for example, line) for the first time, a
specific layer is automatically selected as the current layer (if the
Auto-select layer with tool option is selected in the Layer
dialog box). The layer in question depends on which tool you
activate. If the Auto-select layer with tool option is not
selected, the program automatically uses the layer you selected
last.
• The Layers palette shows the current layer. You can change the
layer status with just one click.
You can display the entire layer hierarchy, the layers assigned to
the currently selected tool or the layers used in open documents.
To do this, you can use the extensive shortcut menu of the
Layers palette.
• The Objects palette - Sort by layer criterion also shows the
current layer. You can change the layer status by clicking the icon
indicating the layer status.
You can see all the layers in the documents loaded. The tree
structure lists all layers with their elements sorted by element
group.

462

Using layers

Allplan 2022

• If a tool (for example, Line) is active, you can use the Properties
palette to define a different layer as the current one. This layer
will then automatically be used as the current layer the next time
you activate the tool.
• When you save components as styles or favorite files, the
program also saves the current layer. When you retrieve these
components later, the layer saved automatically becomes the
current layer.
• Normally, openings like recesses in walls and slabs or window and
door openings get the same layer as the element into which they
Options are inserted. Click the Special button in the
Components and architecture - Miscellaneous area to specify
whether these openings can be assigned separate, independent
layers.
• As walls can consist of multiple construction layers and each
layer can have different format properties, you can define the
layer for each of the construction layers in a wall or upstand
directly in the Properties dialog box (you usually make these
settings in the Properties palette).

Architecture Tutorial

Appendix

463

Defining the format properties of layers
Every layer has pen, line, and color properties. In the Layer dialog
box, you can specify that an element is to automatically assume the
properties of the layer on which it is drawn.
The format properties of a layer can also be defined as a line style
and saved under a name of your choice. Elements can then assume
the format properties of this layer.

When defining line styles, you can specify how they change with the
scale or drawing type. You can define different line styles for various
scale ranges or drawing types so that the way the elements look
changes with the reference scale or drawing type. By using line
styles, you can work across scales.
Drawing types define how elements look on the screen and in
printouts. How elements look varies depending on the selected
drawing type. Requirements: You take the format properties from
the layer in a fixed manner and use line styles.

464

Using layers

Allplan 2022

Layer access rights
There are different layer access rights. On the one hand, there is the
visibility setting which controls whether a layer is visible or hidden.
On the other hand, there is the edit setting which controls whether a
layer can be edited or not (that is, it is frozen). You can save visibility
settings in print sets (see "Using print sets" on page 468) and edit
settings in privilege sets. The status of a layer is indicated by icons in
the Layer dialog box (Select Layer/Visibility tab) and in the Layers
palette:
Icon

Access right

Explanation

Current

The layer on which you draw.

Modifiable

Elements in this layer are visible and can
be modified.

Visible, frozen

Elements in this layer are visible but
cannot be modified.

Hidden, frozen

Elements on this layer are not visible and
cannot be modified.

You can restrict access to layers on the Select Layer/Visibility tab
or in the Layers palette. For example, you can change the status of
layers from Modifiable to Visible, frozen.
The Objects palette - Sort by layer criterion shows the layers in the
loaded documents. The tree structure lists all layers with their
elements sorted by element group.
When you point to the icon indicating the layer status in the list,
Allplan opens a flyout menu where you can change the status of the
layer. Here, too, you can change access to layers. You can switch
Current,
Modifiable,
Visible, frozen and
between
Hidden, frozen.
Layer access rights also depend on the privilege set to which a user
belongs. Therefore, you cannot assign a higher status to layers (for
example, switch hidden layers to modifiable) when you belong to a
privilege set that is not granted full access rights to the relevant
layers.

Architecture Tutorial

Appendix

465

Setting layer visibility in drawing files
You can make layers visible or invisible, thus showing or hiding the
corresponding elements.
Thus, you can quickly hide the elements you don't need during the
current design phase, selectively modify elements on the visible
layers, check your plan and see whether all the elements are
assigned to the correct layer. For example, you might choose to hide
the slab layer and then view the spatial arrangement of the building
as a hidden-line image in perspective view.

Note: Right-click an element and, on the shortcut menu, select
Modify Layer Status and then
Isolate layer - set all other
layers to hidden to hide all the layers except the layer of the
element clicked.
If you often need the same combination of visible and hidden layers
(for dimensioning or labeling at certain scales, for example), we
recommend that you define what is known as a print set. You can
also use this print set when you assemble the layout later, thus
making sure that only the visible layers are included in the printout.
Note: You can choose to Display elements on frozen layers in a
fixed color by selecting this option in the Layer dialog box.

466

Using layers

Allplan 2022

Managing layers and layer structures
The office administrator is usually in charge of managing layers and
layer structures. This person defines which layers are used, defines
privilege sets and grants access rights. By assigning the other users
(architects, engineers and so on) to the privilege sets, the office
administrator grants the users access to the layers.
When you create a project, you can decide whether you want to use
the layer structure of the office standard or a project-specific layer
structure.
You can name and save layer structures and retrieve these
structures later. If you have assigned line styles to layers, these line
styles are saved together with the layer structure (with the same
file name plus the extension .sty). When importing a layer
structure you saved, you can decide whether to import the
associated line style file too.

Advantages of data organization with layers
With large projects in particular, organizing data with layers has
significant advantages:
• Associative elements - such as wall dimensions or sill elevation
labels - are in the same drawing file and yet can still be hidden
from view.
• So that components interact, the components in question must
be in the same drawing file. This is also the case for certain
analyses. With layers, you can meet these requirements easily.
• Easier to assemble layouts thanks to print sets. Print sets are
user-defined compilations of layers, which are very useful for
editing and assembling layouts. When assembling a layout, you
can choose to display only the elements in a specific print set switching between 1:50 and 1:100 is thus no problem.
• Exporting drawing files to DXF/DWG layers is easier, because
you can assign each layer in a drawing file to a different
DXF/DWG layer When importing DXF/DWG files, the DXF/DWG
layer structure can be automatically integrated in the layer
hierarchy.

Architecture Tutorial

Appendix

467

• It is often faster to modify the layer of an element than to modify
the drawing file of an element.
• If a layer is missing from the layer structure, you can create it
quickly and use it in all the drawing files of the project.
• A project can contain more layers (approximately 65,000) than
drawing files (9,999). With layers, you can distinguish more
precisely between the individual design entities.
• You can display and edit 65000 layers at once whereas the
number of drawing files that you can have open simultaneously is
1024.
• You can show and hide layers very quickly (for example, by
means of print sets, layer favorites, the Layers palette or the
Objects palette - Sort by layer criterion).
• You can change the format properties of a layer later. All the
elements of this layer that were drawn with the From layer, line
style setting will adapt automatically. So, you do not need to
modify the elements separately.
• You can copy format properties including layers by doubleclicking with the right mouse button. This method also works
Copy Format to quickly
with wizards. Similarly, you can use
copy the format properties of an element and apply them to
other elements.

Relationship between layers and drawing files
The use of layers doesn't mean that drawing files don't play a role
when it comes to organizing your data. With large project in
particular, a combination of both is essential. With the same
structural depth, the number of drawing files required is far less
when working with layers.
The number of drawing files you need not only depends on the size
of the project, but also on your hardware. Modern, fast computers
with a lot of memory can handle a lot more data per drawing file
without this leading to a noticeable downturn in performance.

468

Using layers

Allplan 2022

The interplay between layers and drawing files depends on the
following factors:
• The size of the project and the number of designers involved at
any one time.
If several designers are working on one floor, create one drawing
file per area of responsibility (East Wing, Central Unit, West Wing,
for example.)
• Simultaneous involvement of specialist designers on the project.
Always use separate drawing files for specialist designs to
facilitate concurrent activity.

Using privilege sets
With privilege sets, you can control users' access to layers. You
should assign privilege sets if several people work on the same
project. With workgroup manager, you can assign individual users to
one or more privilege sets. As a result, these users can see or edit
only the layers that are associated with the relevant privilege set.
Privilege sets can do more than just control who accesses which
layers. They simplify your whole work, as you can define privilege
sets with a selection of layers that are to be available while drawing.
After installation, the ALLPLAN privilege set is preset. This privilege
set has read/write permissions for all layers. Consequently, all users
can see and modify all data.

Using print sets
A print set is a set of layers that you can select when compiling and
arranging layouts. You can also use print sets to control which layers
are visible or hidden. Only the elements whose layers are included in
the selected print set are visible in the layout.
For example, you can select a print set for working drawings so that
only the data that is relevant to a working drawing appears in the
final printout.

Architecture Tutorial

Appendix

469

Creating the training project
Start by creating a project.

To create a project
1

Click
New Project, Open Project... on the Quick Access
Toolbar (title bar).

2 The New Project, Open Project dialog box opens. Click
Project.

New

470

Creating the training project

Allplan 2022

3 New Project - Specify Project Name
For the project name, enter Architecture Tutorial. In the Project
templates area, click No project template and then Next >.

Architecture Tutorial

Appendix

471

4 New Project – Additional Settings
Check that Project is selected for all path settings (except
Attributes). Then click Finish to confirm.

You are back in Allplan; the Architecture Tutorial project is open.
Note: To create a new project, you can also use
ProjectPilot
(in the drop-down list of the Allplan icon on the title bar).
Path settings
This defines which pen, line, hatching settings, fonts and material
catalogs are used. In practice, the office standard is generally used.
Office: Choose this option if you want different projects within the
same office to use the same settings (for hatching, line types and so
on). If you work on a network, the office standard is the same on all
computers and can be changed only by users with special privileges.
Project: Choose this option if you want the settings, for instance for
patterns and hatching styles, to apply to this project only (in this
case they can be different from those used as the office standard).

472

Creating the training project

Allplan 2022

Selecting the scale and unit of length
Define scale and length settings for the project.
Start by selecting a reference scale of 1:100.

To select the reference scale
1

Click in the field beside scale on the status bar and select 1:1.

Select the unit you want to use to enter values. The values are to be
interpreted in meters.

To select units
1

Click
Options in the
Default Settings drop-down list on
the Quick Access Toolbar (title bar).

2 The Options dialog box opens. Click Desktop environment in the
left area.

Architecture Tutorial

Appendix

3 Go to the Enter lengths in box and click m.

Tip: Alternatively, select the
unit on the status bar: Click
to the right of Length and
select m.

4 Click OK to confirm the settings.

473

474

Creating the training project

Allplan 2022

Building structure
In Allplan, the actual design and data creation happens in drawing
files. These are the equivalent of the transparencies used in
conventional building design. Drawing files can be used to give
projects a structure. Allplan provides two options for structuring
drawing files in a project:
• the

building structure

• the

fileset structure

You can select either option in the Open on a project-specific basis:
drawing files from fileset/building structure dialog box. Click
Open on a Project-Specific Basis... (Quick Access Toolbar).

Use the building structure to clearly structure the training project of
this tutorial. By using the building structure, you can generate views,
sections and building lists quickly and easily.
An important difference between the building structure and the
fileset structure is that each drawing file can be assigned only once
to the building structure.

Architecture Tutorial

Appendix

475

To create the building structure for the training project, do the
following:
1

Define structural levels

2 Assign heights to structural levels (floor manager)
3 Assign drawing files to structural levels (creating the building
structure)
4 Naming drawing files
Note:
You can find advanced information on the building structure in the
Allplan Help.

Creating structural levels and the plane model
Now you will create your own project structure. We recommend
that you work with stories and print sets in a real project.
Our example involves a detached house of which you will design the
basement, ground floor and top floor.
When creating the building structure, you start by defining the
necessary structural levels. This example requires the Building and
Story structural levels. To define the structural levels, you will use
Floor Manager.
By using floor manager, you first define the number of stories and
assign height settings to the entire building and the individual stories.
In the
Floor Manager dialog box, you can also configure Allplan to
create the building structure automatically. If you have selected this
option, you can assign drawing files to the selected structural levels.
In addition, you can specify whether to create views and sections.

476

Creating the training project

Allplan 2022

To define structural levels
1

Click
Open on a Project-Specific Basis.... (Quick Access
Toolbar).

2 Click OK to confirm the Create custom building structure
option, which is the default setting.

The program automatically assigned some drawing files to the
building structure. You do not need these drawing files.
3 Select the drawing files, open the shortcut menu and click Clear
drawing file assignment.

Architecture Tutorial

Appendix

477

4 Would you really like to remove the selected entries from the

structure?

Click Yes to confirm the prompt.
5 Click

Floor Manager.

6 The Floor Manager dialog box opens. Click

New model.

478

Creating the training project

Allplan 2022

7 Make the following settings in the New model dialog box:
Model name: Detached house
Number of stories above 0.00: 2
Number of stories below 0.00: 1
Name of first story above 0.00: Ground floor
Elevation of unfinished floor on GF: -0.11
Clear height between unfinished slabs: 2.55
Slab thickness: 0.20
Thickness of floor slab: 0.20
Height of foundation: 0.00
Absolute max elevation point of structure: 7.30
Absolute min elevation point of structure: -3.50

Architecture Tutorial

Appendix

479

Do not forget to select the Create, extend building structure
option.
8 Click OK to confirm the New model dialog box.
The Create, extend building structure dialog box opens.
9 Make the following settings in the Create, extend building
structure dialog box:
• Enter 10 for Increment in the area at the top.
The number of drawing files assigned to the structural levels
changes.
• Enter names in the Name column (see illustration).
• In the Ground floor line, From file column, click number 11 and
change it to 100. Select the Enter key to confirm. The drawing
file numbers of the subsequent stories adapt automatically.
• Select Add views and enter 2.
• The First drawing file for the views is the drawing file with
the number 1000.
• Enter 5 for the Increment.

480

Creating the training project

Allplan 2022

• Select Add sections and enter 2.
• The First drawing file for the sections is the drawing file with
the number 1010.
• Enter 5 for the Increment.
The Create, extend building structure dialog box should now
look like this:

Note: You can use the
buttons to change the
sequence of the levels making up the Story structural level.
10 Click OK to confirm the Create, extend building structure dialog
box.
11 Select Detached house in the Floor Manager dialog box (left
pane) and click
to display all entries.

Architecture Tutorial

Appendix

The Floor Manager dialog box should now look like this:

12 Click OK to confirm the Floor Manager dialog box.

481

482

Creating the training project

Allplan 2022

13 You are back in the Open on a project-specific basis: drawing
files from fileset/building structure dialog box, which now looks
like this:

Architecture Tutorial

Appendix

483

Naming drawing files
When you create a building structure, the last step is to name the
drawing files.

To name drawing files
1

Select the relevant drawing file number. Right-click the drawing
file number. The number is highlighted blue and the shortcut
menu opens.
Click Rename.

2 Enter the drawing file names as shown in the table:

484

Creating the training project

Allplan 2022

Drawing file
number

Name

1

Grid

2

Clipping path

100

Ground floor model

101

Ground floor carport

112

Roof

120

Basement model

3 Select drawing file 100 by selecting the Ground floor check box
and drawing file 100 Ground floor model.
Make sure drawing file 1 Grid is closed.

4 Click Close to close the dialog box.

Architecture Tutorial

Appendix

485

Tips on project organization
Allplan is a very flexible system you can use to develop your own
custom solutions for projects and entire offices. This structure is
intended as a guide and can be used for large-scale projects too. You
can use the entire structure or just parts of it.
You will probably find this structure useful when you start. As you
progress, you will be in a better position to judge what needs
changing to suit your own needs and requirements. We would like to
emphasize once again that a carefully thought-out project structure
will save time for everybody in the long run. The system has the
following structure:
• Store general project information in drawing files 1-99. For
example, the site plan, axis system or layout.
• Story design starts at drawing file 100.
The first digit indicates the number of the story. The last two
digits provide information on the contents. The sequence in
which the drawing files are named should be identical on each
floor.
• Use the drawing files starting at number 1000 for elevations and
the relevant sections.
• Use the drawing files starting at number 2000 for detailing.

Selecting layers
When you created the project, you selected Project for the layer
structure. All the settings you make, therefore, will apply to this
tutorial project only.
The office standard is thus unaffected by any changes. You will
probably use the office standard in your daily work. The office
standard's settings are defined by the system administrator and
apply for the entire office.
Allplan 2022 provides a very extensive layer structure designed to
meet a broad range of requirements.
You can also define your own layers and layer hierarchies. But for
this guide, you will use the layers in the main ALLPLAN GENERAL
and ARCHITECTURE hierarchies.

486

Creating the training project

Allplan 2022

You can specify whether the format properties (pen, line, and color)
are based on your custom settings, whether these properties are
proposed by the program in the Properties palette - Format area
(you can change these settings at any time), or whether these
attributes are always taken from the relevant layers (from the line
style or the setting assigned to the layer).
In this tutorial, you will work independently of the predefined layer
format properties and make these settings while drawing.

To turn off predefined format properties
1

Open the Layers palette.

2 Click >> Expand at the bottom of the palette.
3 The Layer dialog box opens. Switch to the Format Definition tab
and select Do not use; ignore format properties of layers.

Architecture Tutorial

Appendix

487

Defining print sets
A print set (see "Using print sets" on page 468) is a saved
combination of visible and hidden layers.
Both when setting up your layouts and when turning layers on and
off, activating a print set is a rapid way of showing or hiding those
layers that are required for a specific print set. First create and name
the print sets. Then assign layers to these print sets.

To define print sets
 The Layer dialog box is still open.
1

Select the Print Set tab and click Define, modify print set....

2 The Print Set Manager dialog box opens. Click New print set....
3 Name the first print set SC Entry and click OK to confirm.

4 If you work with Workgroup Manager, assign the user local to
the print set.

488

Creating the training project

Allplan 2022

5 Repeat steps 2 to 3 (4) and create more print sets:
-

PR Design

-

Model

-

SC Rooms

You can enter any name you choose. The names here mean the
following:
-

PR: layout elements that are printed

-

SC (SCreen)

-

Model: contains the components for the visual 3D check.

6 Click OK to confirm print set manager.

To define visible and hidden layers for print sets
The next step is to define which layers are to be visible and which
hidden in each print set.

To define visible and hidden layers for the print sets
 The Layer dialog box is still open.
 The first print set - SC Entry - is visible.
1

Since only a few layers are visible, first hide all layers of the
hierarchy levels ALLPLAN GENERAL and ARCHITECTURE. To do
this, right-click ALLPLAN GENERAL and choose Hidden on the
shortcut menu.

2 Repeat these steps for hierarchic level ARCHITECTURE.
3 Select and hold the Ctrl key and select the layers which are to be
visible in the SC Entry print set (see table).

Architecture Tutorial

Appendix

489

4 Right-click the selection and select Visible on the shortcut menu.

5 Click Apply to save the current setting.
Tip: For other print sets, you
can match the setting of a
print set you have already
defined and then adapt it as
appropriate.

6 Select the next print set in the Print set in list box area and
define which layers are to be visible and which hidden in this print
set (see table).

490

Hierarchic
level

Creating the training project

Allplan 2022

Layer

Short
name

SC
Entry

PR
Design

Model

SC Rooms

General 1

DE_GEN01





General 2

DE_GEN02





Grid

DE_GRID



- Text

Text 1:100

TX_100



- Dimension line

Dimension line DL_100
1:100



Furnishings

DE_FURN



Sanitary
facilities

DE_SANI



Wall

AR_WALL









Column

AR_COL









Slab

AR_SLAB



Window

AR_WIND







Window sill

AR_WSILL







Planes

AR_PLANE



Roof

AR_ROOF







Roof covering

AR_ROOFC





Chimney

AR_CHIMN





Stair

AR_STAIR





Label

AR_LABEL



Elevation
points

AR_ELEVA



Sill Height

AR_SILLE



Room

RO_ROOM



ALLPLAN GENERAL
- Construction





ARCHITECTURE
- Construction

- Components

- Room








7 When you have assigned layers to all print sets, click Apply and
then OK.

Architecture Tutorial

Appendix

491

Actionbar Configuration
The Actionbar configuration is the default setting in Allplan 2022.
When you work with this configuration, you can find the Actionbar
above the workspace. In addition, you can see the Properties,
Wizards, Library, Objects, Planes, Issue Manager, Connect and
Layers palettes on the left side.

Click the Allplan icon on the left side of the title bar to open
important tools such as save, copy, import, and export. The title bar
also includes the Quick Access Toolbar. By using a drop-down list,
you can select the tools that you want to display on this toolbar. In
addition, you can show and hide the menu bar, define the sequence
of the tools on the Quick Access Toolbar, and click Customize User
Interface... to open the Customize dialog box - Actionbar tab.

492

Actionbar Configuration

Allplan 2022

Contents and structure of the Actionbar
The Actionbar contains all Allplan tools grouped by tool groups. The
groups of tools are combined into task areas, which are combined
into tasks. You can find the tasks required for each discipline in a role.
If you position the cursor over an icon for a short time, a tooltip will
appear. Use Customize User Interface - Customize tab to specify
whether this is a Plain tooltip or an Advanced tooltip. Plain tooltips
contain a short description of the tool, Extended tooltips consist of
a short description of the tool; they can also contain further
information, illustrations and/or links to short explanatory videos.
Customize user interface can be found in the title bar of the Allplan
viewport under Customize quick access toolbar.
The Actionbar is docked to the top of the working area. If you want,
you can drag the Actionbar to the bottom of the workspace and
dock it there. You can also make the Actionbar float anywhere on
your screen. By double-clicking, you can dock it to the place where it
was docked last.

Structure of the Actionbar

1 - Role
2 - Tasks arranged on tabs
3 - Task area
4 - Varying task areas
5 - Quick Access task area
6 - Fixed task areas
7-

Actionbar Configurator

8-

Find

Architecture Tutorial

Appendix

493

Selecting the role

You start by selecting a role (1). The drop-down list contains all the
roles that are available to you, both those you purchased (licensedependent) and self-configured. The tasks (2) that are available to
you change with the selected role. To open a task, click the
corresponding tab. Each task is subdivided into appropriate areas.
You can find areas in different colors, indicating varying and fixed
task areas (3). The varying task areas (4) change with the selected
task, such as the Components task area of the Elements task. You
can find the fixed task areas (6) in all roles and tasks, such as the
Change and Filter task areas. The Quick Access task area (5)
contains tasks with tools used frequently.
The first time you open Allplan the task areas of the Actionbar are
collapsed. The flyout menus of the visible tools contain all the tools in
the collapsed area.
When you point to the name line of a task area, the cursor changes
to:
You can maximize or minimize a task area by double-clicking within
the name line of a task area. A maximized task area shows more
tools, which can also have flyout menus.
Note: You can maximize or minimize all task areas of the task
currently selected by selecting and holding the Ctrl key while
double-clicking within the name line of a task area. You can expand
or collapse all areas across tasks and roles by selecting and holding
Ctrl+Shift while double-clicking within the name line of a task area.
How many task panes are displayed expanded depends on the width
of your Allplan window. If the window is not wide enough, Allplan
starts on the left side, expanding as many task areas as possible.

494

Actionbar Configuration

Allplan 2022

Structure of a task area in detail

1 - Task area
2 - Create group of tools
3 - Create in context group of tools
4 - Modify in context group of tools
5 - Tool

6 - Tool menu = flyout menu of a tool
An expanded task area (1) contains one or more groups of tools
(2/3/4). Different groups of tools are separated by vertical lines.
The tools are grouped by topic. Some tools have flyout menus (6)
where you can find similar tools.

Architecture Tutorial

Appendix

495

Palette window
The palette window displays the palettes as tabs. Palettes are
important controls of Allplan, making the user interface simple and
easy to use. You can float or dock each palette individually. In
addition, you can arrange the palette window or individual, freefloating palettes around the edge of the workspace or make them
float anywhere on your screen. You can even configure Allplan to
automatically show or hide the palette window or palettes arranged
around the edge.

496

Palette window

Allplan 2022

Properties palette
When the Properties tab is open, you have the following options:
Drop-down list at the top

Tools at the top and bottom

Properties

Select active elements

Zoom in on selected
objects
Filter step by step
Change the properties of
the selected object
Match parameters
Load favorite
Save as a favorite

Modify properties

Architecture Tutorial

Appendix

497

Wizards palette
When the Wizards tab is open, you have the following options:
Drop-down list at the top

Tabs on the right side of the
palette

Available tools

Select a wizard group

Select a wizard

Select a tool

498

Palette window

Allplan 2022

library palette
The Library palette provides a
Filter that you can use to show or
hide specific types of library elements (symbols, smart symbols,
SmartParts, and PythonParts).
After having opened a folder, you can see all subfolders with library
elements (symbols, smart symbols, SmartParts, and PythonParts) if
you have not filtered out library elements. You can select the
required objects. You can also add your own objects to the
corresponding library folders.
Connect (online library) takes you to the Connect palette to log
in to Connect. If you are already signed in, the online library will open
immediately.

Architecture Tutorial

Appendix

499

objects palette
The Objects palette lists all objects and elements in the currently
open drawing files (current or open in edit mode or open in
reference mode). You can sort these objects by
Topology,
Drawing file,
Layer,
Material,
Trade, or
Attribute.
Here you can selectively show or hide selected objects, or select or
deselect them. Furthermore, it is possible to set the transparency of
3D objects as well as to apply color coding (both have an effect only
in the Animation view type).

500

Palette window

Allplan 2022

Planes palette
The Planes palette displays all plane models in the active project.
Each plane model has its own tab. While creating components, you
can keep track of the default planes and all other objects on which
the heights of the components can be based.

Modification mode on/off. If
To edit a plane model, click
modification mode is on ( ), you can make entries in the Planes
palette. Allplan displays the planes of the plane models in all
viewports. When you point to or select an entry of the plane model in
the tree structure, this entry is also highlighted in the detection color
in the viewport. So, you can immediately check the position of the
plane and see the effects of changes.

Architecture Tutorial

Appendix

501

The tools in the Planes palette are similar to those provided by the
Floor Manager (see "Creating structural levels and the plane
model" on page 475) dialog box of the building structure. For
example, you can use the
Insert pair of planes,
Insert or
replace roofscape,
Insert or replace reference surface, and
Insert offset plane tools. Use
New model to create a new
plane model.

502

Palette window

Allplan 2022

Issue Manager palette
You can use the Issue Manager palette to communicate with all
those involved in a Bimplus project. In Allplan, you can access the
issues of the currently loaded Allplan project directly from Bimplus. In
addition, you can use Allplan to create new issues in Bimplus or edit
existing issues. You can also import or export issues in BCF format or
export issues to an Excel file from Allplan.
This is only possible if you have used the Allplan workstation to sign
in to Bimplus and if the Allplan project is linked with a Bimplus project,
that is to say, the Allplan project data has been uploaded to Bimplus
at least once.
Note: See Handling projects with Allplan Bimplus for more
information about handling projects in a BIM-compliant manner with
Bimplus, the web service offered by ALLPLAN GmbH.

Architecture Tutorial

Appendix

503

Connect palette
The Connect palette takes you directly from Allplan to content on
Allplan Connect. Click ALLPLAN Webservices, enter your access
data in the ALLPLAN dialog box and click Login.

If you have already signed in using Login in the title bar or Issue
Manager palette, you can access Allplan Connect content directly
without logging in again.
Note: As login data, use either your Allplan Connect Login Data or - if
available - the e-mail address provided in connection with your
registration with Bimplus and the password you chose when
registering. Signing out is only possible via Login in the title bar.

504

Palette window

Allplan 2022

Layers palette
By using the Layers palette, you can access the layer structure
quickly and easily. The palette displays the entire layer hierarchy.
You can define the visibility of layers, change the layer status, select
the current layer, and choose privilege sets and print sets. When you
Match current layer button at the bottom of the
select the
palette, you can click an element to use its layer as the current layer.
to save the current layer setting as a favorite file (*.lfa); click
Click
to load a favorite file. You can sort the layers alphabetically by
clicking on the column labels Short name or Full name in the list
header.

Note:
You can find the Customize User Interface... tool in the drop-down
list of the Quick Access Toolbar. On the Palettes tab, you can
arrange and customize the palettes to suit your needs. You can
show and hide the palettes as you need.
As an alternative, open the shortcut menu of a palette and select
Customize....

Architecture Tutorial

Appendix

505

Compressed projects on the internet
Allplan Connect provides two compressed projects:
• Allplan 2022 Architecture Tutorial. This project comes with a
building structure consisting of structural levels and assigned
drawing files. In addition, there are predefined objects derived
from the building structure, such as views, sections, and reports.
The project contains four print sets. With these print sets, you
control which layers are visible.
You can use this project if you want to work through the entire
Architecture Tutorial and start with Unit 1: basics.
• Allplan 2022 Architecture Tutorial (with model). This project
contains all drawing files with the complete design as well as
objects derived from the building structure, such as views,
sections, and various reports. You can fall back on this project if
you do not want to work through the entire tutorial. In addition,
you can use it for comparison if you want to check your own
project.

506

Compressed projects on the internet

Allplan 2022

Downloading compressed projects
You can download the compressed projects with the data for the
exercises in this tutorial from Allplan Connect, the service portal for
all Allplan users.
Go to
connect.allplan.com
• Register with your customer number and email address.
Registration is free and not subject to any conditions.
After a few minutes, you will be able to access the data and
information there.
• You can find the projects with the data for the exercises in this
tutorial in the Training - Documentation - Manual and tutorials
area of Allplan Connect.
This area contains the two projects mentioned.
• In addition to the compressed projects with the data for the
exercises, you can also find the latest version of this document as
a PDF file (Allplan 2022 Architecture Tutorial).
• Save the zipped projects with the data for the exercises to any
folder on your computer.
Note: Serviceplus customers can find more step-by-step guides in
the Training area of Allplan Connect. It usually takes us one to two
working days to activate this restricted area so that Serviceplus
customers can access and download documents. Please note that
this service is available to Serviceplus customers only.
For general information about Serviceplus, go to
https://www.allplan.com/serviceplus

Architecture Tutorial

Appendix

507

A note on organizing projects only with the
default layer
Allplan is a very flexible and open system that allows you to develop
your own custom solutions for offices and special projects. The
layers used in this tutorial help you a lot.
However, it is also possible to structure projects without layers. In
this case, you place the individual elements in drawing files.
This structure for large-scale projects is intended only as a guide.

Drawing file organization without layers
• Place general project-related information in drawing files 1-99.
This data is universally required (layouts, axis system and so on).
• Start story design at drawing file 100. The first digit indicates the
number of the story. The last two digits provide information on
the contents. Use the same drawing file sequence on each floor.
• Place other data in drawing files starting at 2000. Numbers
2000-2099 contain sections; numbers 2100-2199 contain
views; numbers 2200-2299 contain presentation data; numbers
2300 and greater contain detail drawings.

508

A note on organizing projects only with the default layer

Fileset

File

Contents

Grid

1

Axis system (coarse)

2

Axis system (fine)

3

Axis dimensions

4

Axis labels

5

Title block

6

Legend

11

Survey points

12

Dimensions

13

Labels

Layout

Surveying

:
Site plan

21

Plot boundaries

22

Neighboring buildings

23

As-built data

24

New buildings

25

Hatching

26

Dimensions

27

Text

:

Fileset

File

Contents

Outdoor
facilities

51

Draft

52

Symbols

53

Dimensions

54

Design

55

Texts

:

Allplan 2022

Architecture Tutorial

Appendix
Foundation

509
71

Foundations

72

Hatching

73

Sections

74

Hatching

75

Dimensions

76

Text

:
1st floor

Fileset

100

Background pattern, fill

101

Load-bearing walls

102

Nonbearing walls

103

Beams

104

Stairs, elevator

105

Slab

106

Doors (2D)

107

Windows (2D)

108

Wall recess (2D)

109

Slab recess (2D)

110

Reflected ceiling

111

Reflected plan

112

Furniture

113

HVAC

114

Grids, axes

115

Dimensions

File

Contents

116

Additional dimensions

117

Text

118

Additional text

119

Rooms

120

Living space

510

A note on organizing projects only with the default layer
121

DIN 277 areas

122

DIN 276 costs

123

Prelim. roof design

124

Special components

125

Adjacent components

126

Foreground patterns, fills

:
2nd floor

200

Background pattern, fill

201

Load-bearing walls

:
3rd floor

300

Background pattern, fill

301

Load-bearing walls

:
Section A-A

Section B-B

2000

Section (hidden-line image)

2001

Level of detail

2002

Hatching, pattern, fill

2003

Fixtures

2004

Dimensions

2005

Text

2006

Outdoor facilities

2010

Section (hidden-line image)

:
2019

Allplan 2022

Architecture Tutorial

Appendix

Fileset

511

File

East elevation 2100

South
elevation

Contents
Hidden-line image, result

2101

Level of detail

2102

Hatching, pattern, fill

2103

Dimensions

2104

Text

2105

Outdoor facilities

2110

Hidden-line image, result

:
2119
Perspective
views

2201

Hidden-line image, result

2202

Hatching, fill, textures

2203

Outdoor facilities

2204

Text

:
2299
Detail A

2300

Draft

2301

Details

2302

Hatching, patterns

2303

Dimensions

2304

Text

:
2309
Detail B

2310
:
2319

Draft

512

Overview of tools

Allplan 2022

Overview of tools
We recommend photocopying this page and placing it somewhere
near your monitor so that you can refer back to it as you work
through the workbook.

Viewports
Plan View

Zoom All

Rear/left isometric
view

Zoom Section

Rear View

Camera Mode

Rear/right isometric
view

Previous View

Left View

Next View

Right View

Save, Load View

Front/left isometric
view

3D View

View from front

Perspective

Front/right isometric
view

Element Selection
Drawing File
Selection
Exposure (Animation
and RTRender view
types only)
Section display
Display Scale
View type

You can find more tools for working with viewports in the
Window drop-down list (Quick Access Toolbar).

Architecture Tutorial

Appendix

513

Height dialog box
You can use these icons to define how the component you are
drawing – for example, a wall or placement of rafters – is attached
to the reference planes.
Top level relative to lower
plane
Top level relative to upper
plane
Bottom level relative to
lower plane
Bottom level relative to
upper plane
Absolute value for top level
Absolute value for bottom
level
Match bottom level of
component
Match top level of
component

Use this to define the offset between
the top level of the component and the
lower or upper reference plane.

Use this to define the offset between
the bottom level of the component and
the lower or upper reference plane.

Use this to define the top or bottom
level of the component as an absolute
height.
Use this to match the top or bottom
level of a component from the top or
bottom level of a different component
or plane. When you select this option,
you must click the reference level
immediately.

Fixed component height

Use this to enter the component height
directly.

Vertical offset

This toggle controls whether the offset
entered is to be interpreted as a
vertical offset or perpendicular to the
plane.

Perpendicular offset
Normal

This makes the component adapt to the
upper plane in its entirety.

Jamb wall

With this, the top, outside edge of the
component will adapt to the upper
reference plane.

Chimney

With this, the component will pierce the
upper reference plane by the value you
specify.

514

Overview of tools

Allplan 2022

Maximum component
height

If the top level of the component is
attached to the upper reference plane,
you can use this to have the
component not exceed a certain height
and to run horizontally at that height.

Button for selecting the
reference plane

If the project contains a building
structure with a plane model, you can
to
click the button to the right of
open a dialog box where you can select
any part of the plane model. If the
project contains neither a building
structure nor a plane model, you can
select the default planes and reference
surfaces in the drawing file.

Restore basic settings

Use this button to define the upper or
lower default plane of the drawing file
as the reference plane.

Architecture Tutorial

Index

515

2

building lists (drop-down list of
the Allplan icon) 376
building structure 474
assign planes 234
create section 297
create view 319
insert roofscape 227
name drawing files 483
offset planes 213
reference surfaces 211, 248
section settings 297
structural levels 475
view settings 319
views 319

Index
2D plan 154

3
3D surface 248
3D surface to reference surface
248

A
access rights 464
Actionbar configuration 491
contents and structure 492
anchor point
column 83
animation
animation options 419
animation window 419
design check 130
objects palette 130
overview 418
requirement 418
animation settings 418
arc's direction of extension 36
area and floor space calculations
325
attributes
assign attribute values 387
for projects 387
match attributes 485
auto-room 336
AVI movie 444
axis grid 72

B
basic settings
length 19
scale 19
building lists 375
building lists (derived from
building structure) 379

C
camera path 437
change archit. properties 254
check list 15
clipping path 292
column 83
common approaches in
ProjectPilot 454
component axis 25
component parameters
column 83
door 89
compressed projects on the
internet 505
curved wall
general 36
insert SmartPart 110, 117
midpoint 36
openings 105
radius 36
custom planes 209, 245

D
default planes 207
list default planes 240
define colors 428

516

Index
delete wall sections 186
dimension
associative 41
curves 41
radius 41
direct object modification 139,
183
direction of extension
curved wall 36
door 89
input direction 97
parameters 89
dormer 215
Draft
orthogonal 48
drawing file
general 457
status 458
drawing file status 458

E
edit
filter 139
edit section 315
elevation dimensioning 315
elevation points 315
elements
filter 139
elevation dimensioning 315
elevation points 315
enter eaves 215
entity groups 145
extension
multi-tier 54
single-tier 26

F
favorites
back up 159
filters 139
finish specifications 337
for entire rooms 337, 341
individual finish specifications
346
floor area calculations 350
floor manager
insert roofscape 227

Allplan 2022

G
gable roof 215

H
handrail 263
height
component height 98
dialog box 513
enter parameters 28
modify 188
plane association 89, 98
reference plane 513
relation to default planes 28
help 3
hidden-line image 297

I
import project 7, 9
individual room 327
input options 41
insert roofscape 227

L
label 406
label style
create 392
layer
assignments 46
make visible 44
modify 145
select current layer 41
troubleshooting 46
layers 461
access rights 464
advantages 466
attributes 463
format properties 463
general 461
in drawing files 467
line attributes 485
manage 466
pen, line, color 485
print sets 487
settings 485
visibility 465
layout

Architecture Tutorial

Index
assembling 399
definition 399
elements 406
layout window 411
print 408
print set 406, 487
select 399
layout window 411
library palette 286
light
light types 426
sunlight 426
line attributes for layers 485
line for layer 485

M
masking plane 226, 238
mirror and copy 139
mirror axis 139
modifications
archit. component properties
179
architectural elements 188
overview 189
points 183
modify architectural elements
188
modify roof frame 221
movie
AVI format 444
camera path 437

N
name drawing files 483

O
objects palette 130
offset planes 213
offset polyline 139
openings 89
dimension sill height 149
entry 89
in curved wall 105
option 207
orthogonal line
design 48
output report 362

517

P
palette window 495
connect palette 503
Issue Manager palette 502
layers palette 504
library palette 498
objects palette 499
planes palette 500
properties palette 496
wizards palette 497
parameters 215
pen
for component hatching 19
for layer 485
planes 226
free 209
points
modify 183
polyline entry tools 160
print
layout 408
print set 406
requirements 385
screen contents 385
print preview 385
priority 28
project
create 469
download compressed
projects 505
path for settings 469
project attributes 387
project organization
tip 485
with default layer 507
ProjectPilot
common approaches 454
properties
save as a favorite 159
slab 155
wall 28

Q
quantity takeoff 362

R

518

Index
railing bars 263
reference plane 513
reference planes 205
custom planes 209, 245
default planes 207
offset planes 213
reference surfaces 211, 248
reference point 48
definition, overview 105
reference scale 19
reference surfaces 211, 248
rendering 432
report 362
search criteria 372
reveal 96
roof 215
roof covering 214, 222
room
auto-room 336
define rooms 326
individual room 327

S
save
properties as a favorite 159
scale 19
scene 418
screen
print content 385
search criteria 372
section 292
section display 297
select
elements 139
select unit of length 19
settings on the Actionbar 12
sill height 149
slab 155
slab opening 167
slab or roof covering 226
smart symbols
general 89
smart symbols library 286
SmartPart 96
general 89
insert SmartPart 110, 117
opening side 110

Allplan 2022
SmartParts
library palette 286
model SmartPart 273, 275
modify SmartPart 283
replace smart symbol,
SmartPart 281
save SmartPart 281
SmartParts library 286
sources of information 3
training, coaching, and project
support 5
specifying layer for symbols 144
stair tread 263
stairs
2D plan 154
clipping lines 269
modify stairs 262, 263
section of stair in plan 269
stair design, general
information 257
stair outline 257, 260
standard reports 362
structural levels 475
surfaces 428
surroundings 419
symbols library 286

T
title block
as a label style 392
use label styles 406
track tracing 13
troubleshooting 15

U
unit
length 19
user-definable stair component
263
u-type stair 260

V
vertical surface 346
viewport arrangement 67
viewport toolbar 64
viewports 64, 512
views 64, 319

Architecture Tutorial

Index
visualization task 416
camera task area 416
shadow task area 416
surfaces, light task area 416

W
wall
curved wall 36
extension 34
join with line 187
join with wall 177
multi-tier 53
straight wall 34
wall’s direction of extension
curved wall 36
walls
attach to roof plane 231
join 177
move 183
window 96
create 98
input direction 97

519


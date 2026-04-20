# Allplan 2022 EngineeringTutl

**Kategori:** Allplan 2022 Engineering Tutorial
**Kaynak:** `Allplan_2022_EngineeringTutl-0iwtfvnqg2h.pdf`

---

**Toplam Sayfa:** 352


## Sayfa 1

ALLPLAN 2022
E ngineering Tutorial
Engineering Tutorial

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
1st edition, October 2021
Document no. 220eng01m03-1-BM1021

Engineering Tutorial Contents i
Contents
Welcome .............................................................................................. 1
Introduction .................................................................................................................... 2
Sources of information ............................................................................................ 3
Further help ............................................................................................................................ 4
Training, coaching, and project support ........................................................ 5
Feedback on the documentation ...................................................................... 6
Unit 1: basics ........................................................................................ 7
starting Allplan and importing the project .................................................... 9
Default settings ...........................................................................................................1 2
To make settings on the Actionbar ........................................................................ 12
Track tracing ........................................................................................................................1 3
Layer settings .....................................................................................................................14
How to .............................................................................................................................. 16
What if … ..................................................................................................................................1 6
And what if ... .........................................................................................................................1 6
Unit 2: floor plan and general arrangement drawing .... 17
Overview of exercises ........................................................................................... 18
Exercise 1: floor plan of basement ................................................................. 20
Creating the 3D model with the tools in the Components task
area ............................................................................................................................................ 21
Settings .................................................................................................................................. 22
Walls .........................................................................................................................................24
A note on views and viewports ............................................................................... 37

i i Contents Allplan 2022
Columns ................................................................................................................................ 44
Downstand beam ............................................................................................................. 47
Openings ................................................................................................................................49
Checking the design........................................................................................................ 57
Dimensions ...........................................................................................................................60
Turning layers on and off .............................................................................................. 61
Stair outline ..........................................................................................................................6 6
Slab ............................................................................................................................................68
Creating the walls in the basement in 2D with the tools in the 2D
Objects task area ............................................................................................................. 76
Exercise 2: elevator shaft ................................................................................... 86
Creating the 3D model with the tools in the 3D Objects task
area ........................................................................................................................................... 87
A note on concrete components ............................................................................ 97
Creating the 3D model with the tools in the Components task
area .........................................................................................................................................1 02
Unit 3: key plan ............................................................................. 107
Exercise 3: key plan for basement ............................................................... 107
Unit 4: reinforcement drawing .............................................. 119
Overview of exercises ........................................................................................ 120
Default settings ....................................................................................................... 124
Exercise 4: 3D elevator shaft with a 3D model (method 1) ........... 125
Task 1: creating associative sections ................................................................. 126
Task 2: edge reinforcement of floor slab ......................................................... 142
Task 3: area reinforcement of the floor slab .................................................. 157
Task 4: starter bars ....................................................................................................... 163
Task 5: bar reinforcement for the walls ............................................................ 172
Task 6: standard section ............................................................................................1 89

Engineering Tutorial Contents iii
Task 7: bar schema ........................................................................................................1 96
Task 8: reinforcement schedule and bending schedule ......................... 198
Exercise 5: 2D door lintel with a 3D model (method 2) ................... 203
Task 1: designing a reinforced door lintel ........................................................ 204
Task 2: modifying the reinforced door lintel ................................................... 221
Exercise 6: 2D slab without a 3D model (method 3) ......................... 227
Task 1: mesh reinforcement, bottom layer .................................................... 228
Task 2: recess ..................................................................................................................2 33
Task 3: support reinforcement and spacers ................................................ 238
Task 4: cutting diagram and excess mesh .................................................... 243
Exercise 7: BAMTEC® reinforcement ....................................................... 247
Cross-section catalogs ..................................................................................... 264
Unit 5: layouts ............................................................................... 271
Requirement for printing ................................................................................... 272
Printing the screen contents .................................................................................. 272
Exercise 8: custom title block ......................................................................... 273
Exercise 9: assembling and printing layouts .......................................... 281
Task 1: Assembling layouts ......................................................................................2 82
Task 2: printing layouts ............................................................................................. 289
Task 3: layout windows ............................................................................................. 292
Appendix ........................................................................................ 295
Project organization ............................................................................................ 296
Managing data with ProjectPilot ..........................................................................2 96
Understanding drawing files ................................................................................... 301
Using layers ...................................................................................................................... 305

i v Contents Allplan 2022
Creating the training project ........................................................................... 313
Selecting the scale and unit of length ................................................................. 315
Drawing file structure .................................................................................................. 317
Tips on project organization .................................................................................... 321
Defining print sets .......................................................................................................... 321
Actionbar Configuration .................................................................................... 327
Contents and structure of the Actionbar .......................................................3 28
Palette window ........................................................................................................ 331
Properties palette ......................................................................................................... 332
Wizards palette ...............................................................................................................3 33
library palette .................................................................................................................. 334
objects palette ................................................................................................................3 35
Planes palette ..................................................................................................................3 36
Issue Manager palette ............................................................................................... 338
Connect palette ..............................................................................................................3 39
Layers palette ................................................................................................................ 340
Compressed projects on the internet ....................................................... 341
Downloading compressed projects ...................................................................3 42
Index ................................................................................................ 343

Engineering Tutorial Welcome 1
Welcome
Welcome to Allplan 2022, the high-performance CAD
program for civil engineers.
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

2 Introduction Allplan 2022
Introduction
The Engineering Tutorial expands on the Basics Tutorial. Based on six
examples, the Basics Tutorial explains the principles of drafting and
designing in 2D. In addition, you learn how to get started in 3D
modeling.
The aim of the Engineering Tutorial is to guide you with easy-to-
follow steps from floor-plan design to key-plan generation to fully
automatic creation and management of reinforcement drawings in
3D. The Engineering Tutorial consists of 9 exercises in 5 units.
This tutorial will provide you with a sound introduction to Allplan
2022. As this tutorial only touches on the possibilities of some of the
tools, please consult – especially later when you use Allplan 2022 –
the F1 Help as an important source of information.
You can download two compressed projects from Allplan Connect:
• A project with the structures and settings (but not the design!)
used in this tutorial.
• A project with the data used in this tutorial so that you can
compare your result with the data provided.
To find out how to install the project, see Importing the project (see
"Starting Allplan and importing the project" on page 9) in unit 1. To
find out how to download the projects from the internet, see
Compressed projects on the internet (on page 341) in the appendix.
This tutorial assumes that you have a working knowledge of
Microsoft® Windows® programs. Basic CAD knowledge is helpful;
however, this tutorial will provide both the experienced CAD user and
the newcomer to CAD with a solid foundation in the methods used by
Allplan 2022.

Engineering Tutorial Welcome 3
Sources of information
The documentation on Allplan consists of the following parts:
• The Help is the main source of information for learning about and
using Allplan.
While Allplan is running, you can get Help on the current tool by
selecting F1. You can also select What’s This in the Help
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
download these guides as PDF files from the Training -
Documentation area of Allplan Connect
(https://connect.allplan.com).
• You can also find numerous publications on social networks.

4 Sources of information Allplan 2022
Further help
Tips for Efficient Usage
The Help drop-down list (right side of the title bar) provides Tips
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
You can find solutions to numerous questions answered by Technical
Support in the comprehensive knowledge database at
https://connect.allplan.com/support/solutions.html
Feedback on the Help
If you have suggestions or questions on the Help, or if you come
across an error, send an email to:
dokumentation@allplan.com


## Sayfa 11

Engineering Tutorial Welcome 5
Training, coaching, and project support
The type of training you are given is a decisive factor in the amount
of time you actually spend working on your own projects: A
professional introduction to the programs and advanced seminars
for advanced users can save you up to 35% of your editing time!
A tailor-made training strategy is essential. Our authorized seminar
centers offer an extensive range of programs and are happy to work
out a custom solution with you that will address your own needs and
requirements:
• Our sophisticated, comprehensive seminar program is the
quickest way for professional users to learn how to use the new
system.
• Special seminars are designed for users who want to extend and
optimize their knowledge.
• One-on-one seminars are best when it comes to addressing
your own particular methods of working.
• One-day crash courses, designed for office heads, convey the
essentials in a compact format.
• We are also happy to hold seminars on your premises: These
include not only Allplan issues but also analyses, process
optimization, and project organization.
To get more detailed information about the current training program,
visit our website (https://www.allplan.com/training) and consult our
online seminar guide, where you can find both face-to-face training
and online training.

6 Feedback on the documentation Allplan 2022
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

Engineering Tutorial Unit 1: basics 7
Unit 1: basics
In this unit, you will start Allplan, import the compressed
project with the data for the exercises, and make a few
basic settings.
The compressed Allplan 2022 Engineering Tutorial
project, which you can download from Allplan Connect,
comes with a fileset structure and assigned drawing
files. The project contains four print sets. With these print
sets, you control which layers are visible. You will use
these print sets in various places while working on the
project.
After having imported the compressed project, you can
open it and start designing the building at once without
any preparation.
If you want to create the project along with the fileset
structure and print sets yourself, you can find a detailed
description of the necessary steps in the appendix (on
page 295) to this tutorial. The appendix also provides
information about various interesting topics, such as
layers, ProjectPilot, Actionbar configuration, and many
more.
If you do not want to work through the entire tutorial
step by step, you can download the compressed Allplan
2022 Engineering Tutorial (with model) project from
Allplan Connect, import it to Allplan, and use it for
comparison. This project contains the drawing files at
different levels of completion so that you can get started
wherever you want. For example, you can immediately
start placing the reinforcement.

8 Feedback on the documentation Allplan 2022
Look in the appendix for information about how to
download projects; see "Compressed projects on the
internet (on page 341)".
At the end of this unit, you will find a short
troubleshooting section that you might find helpful.

Engineering Tutorial Unit 1: basics 9
Starting Allplan and importing the project
After having installed and configured Allplan 2022, you can import
the compressed Engineering Tutorial project (with or without the
model).
To start Allplan and import the compressed project
 Allplan 2022 must be installed, registered, and configured to run.
To do this, you must start Allplan at least once after installation
and check that it functions.
 You downloaded the Allplan 2022 Engineering Tutorial projects
from Allplan Connect (https://connect.allplan.com) and saved
them to a folder of your choice.
1 Go to the Windows Start menu, open the Allplan folder, and click
Allplan 2022.
Or
Double-click the desktop icon Allplan 2022.
2 After you have started Allplan 2022, click Open on the welcome
screen.

1 0 Starting Allplan and importing the project Allplan 2022
If you have turned off the welcome screen, click New Project,
Open Project... on the Quick Access Toolbar.
3 In the following dialog box, click Import Project.

Engineering Tutorial Unit 1: basics 11
4 Then select the downloaded ZIP file in the Import Project dialog
box and confirm the dialog box with OK.
Note: The downloaded ZIP file can also be dragged and dropped
from Windows Explorer into the project selection in the New
Project, Open Project dialog box or imported via the shortcut
menu in the project selection area. In this case, you can adjust the
location and name of the project if necessary.
The imported project is selected.
5 Click OK to confirm the New Project, Open Project dialog box
and to open the project.
The data of the imported project will be converted if necessary.

1 2 Default settings Allplan 2022
Default settings
Start by making the following settings:
To make settings on the Actionbar
The Actionbar configuration is the default setting in Allplan 2022.
Tip: You can expand or
When you work with this configuration, you can find the Actionbar
collapse all task areas of the
task currently selected by above the workspace. In addition, you can see the Properties,
Wizards, Library, Objects, Planes, Issue Manager, Connect, and
selecting and holding the
Layers palettes on the left side.
Ctrl key while double-
clicking within the name line Note: You can find detailed information about the Actionbar
of a task area. You can configuration in the appendix (see "Actionbar Configuration" on page
expand or collapse all areas 327) to this tutorial and in the Help for Allplan 2022.
across tasks and roles by
You will use the tools in the Components task area for the first
selecting and holding
exercise. Start by making settings on the Actionbar.
Ctrl+Shift while double-
clicking within the name line
To make settings on the Actionbar for the exercise
of a task area.
that follows
How many task panes are
displayed expanded 1 Select the Engineering role.
depends on the width of
2 Open the tab of the Elements task.
your Allplan window. If the
window is not wide enough, 3 The Components task area has not been expanded yet. Expand
Allplan expands as many
this task area so that you can access its tools quickly.
task areas as possible,
To expand a task area, double-click within the name line of the
starting on the left side.
task area.
Note: The Actionbar is docked to the top of the working area.
Using Drag & Drop you can detach them from this position and
dock them again at the bottom of the workspace. You can also
make the Actionbar float anywhere on your screen. By double-
clicking the left mouse button, you can dock it to the place where
it was docked last.

Engineering Tutorial Unit 1: basics 13
Track tracing
Track tracing helps you design intuitively. As you will not use this
option in the following exercises, start by turning track tracing off
(which is on by default).
To turn off track tracing
1 Go to the Actionbar and click Line (Quick Access task area).
2 Right-click in the workspace and select Track tracing options
on the shortcut menu.
3 Turn Track tracing off.
Note: You can turn track tracing on and off at any time while
entering points by selecting the F11 key or clicking the Track
line icon in the dialog line.
4 Click OK to confirm the settings and select ESC to close the
Line tool.

1 4 Default settings Allplan 2022
Layer settings
For this project, the Project layer structure is selected. All the
settings you make, therefore, will apply to this tutorial project only.
The office standard is thus unaffected by any changes. In everyday
life, you will probably use the office standard, whose settings are
defined by the Allplan system administrator and applied uniformly for
the entire office.
Allplan 2022 provides a very extensive layer structure designed to
meet a broad range of requirements.
You can also create your own layers and layer hierarchies, but for the
tutorial you will use the layers of the default main hierarchy
ALLPLAN GENERAL, ARCHITECTURE and ENGINEERING.
You can specify whether the format properties (pen, line, and color)
are based on your custom settings, whether these properties are
proposed by the program in the Properties palette - Format area
(you can change these settings at any time), or whether these
attributes are always taken from the relevant layers (from the line
style or the setting assigned to the layer).
For the exercises in this tutorial, you will configure Allplan to
automatically select the layer with the tool. Furthermore, you will
work independently of the predefined layer format properties and
define these settings while drawing.
To check the basic settings for layers
Tip: As Match is selected on 1 Click Select, Set Layers in the View drop-down list on the
the Format Definition tab Quick Access Toolbar.
(this is the default setting),
The Select Layer/Visibility tab is open.
you can select the From
layer, line style check 2 Clear the check boxes in the Format properties from layer area.
boxes in the Format
3 Make sure that Auto-select layer with tool is selected in the
properties from layer area.
Settings area.


## Sayfa 21

Engineering Tutorial Unit 1: basics 15
4 In addition, make sure that Display elements on frozen layers
using a fixed color and color 25 are selected.
Note: You can use the , , and buttons in the upper-left area
to expand and collapse the tree structure of the layers and to find
specific entries.

1 6 How to Allplan 2022
How to
Sometimes, things will not immediately work out as required. This list
helps you succeed.
What if …
• ... I have selected the wrong tool?
Select the ESC key and click the correct icon.
• ... I make a mistake as I go along?
Select the ESC key to cancel (you might have to do this several
times).
Click Undo.
• ... I have inadvertently deleted the wrong elements?
If Delete is still active, right-click twice.
If no tool is active, Click Undo.
• ... I have unintentionally opened a dialog box or entered wrong
values?
Click Cancel.
And what if ...
• ... the workspace is empty although there is data?
- Click Zoom All (viewport toolbar).
- Click Plan.
• ... the workspace is suddenly divided into a series of different
viewports?
Click 1 Viewport ( Window drop-down list on the Quick
Access Toolbar).
Tip: Check whether the • ... specific kinds of elements such as text or hatching do not
relevant layer is visible. appear in the workspace?
Click Show/Hide ( View drop-down list on the Quick
Access Toolbar) and check that the relevant element type is
selected.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 17
Unit 2: floor plan and
general arrangement
drawing
In this unit, you will learn how to create general
arrangement drawings quickly and efficiently.
 You will use the tools in the Components task area to
create a three-dimensional building model of a
basement. You will also learn about viewports.
As an alternative, you will create a two-dimensional
floor plan of a basement with the tools in the 2D
Objects task area.
 With the tools in the 3D Objects task area, you will
create a three-dimensional general arrangement
drawing of an elevator shaft.
As an alternative, you will use the tools in the
Components task area to create the same three-
dimensional general arrangement drawing.
You should work your way through these exercises step
by step These form the basis for subsequent exercises in
units 3 and 4.

1 8 Overview of exercises Allplan 2022
Overview of exercises
Exercise 1: floor plan of basement and viewports
You will draw a basement in 3D with the tools in the Components
task area and in 2D with the tools in the 2D Objects task area.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 19
Exercise 2: 3D elevator shaft
You will draw an elevator shaft for the basement created in exercise
1. To do this, you will use the tools in the 3D Objects task area. As an
alternative, you can also use the tools in the Components task area.

|  |  |
| --- | --- |


|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |


2 0 Exercise 1: floor plan of basement Allplan 2022
Exercise 1: floor plan of basement
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the Elements task of the Engineering role
contains the Components task area.
In this exercise, you will create a floor plan for a basement.
You will mainly use the tools in the Components task area. You can
find these tools on the Actionbar.
You will also learn about viewports.
Finally, as an alternative, you will create the walls of the basement in
2D.
Start by selecting fileset 1 with the following drawing files:
Fileset Drawing Drawing file name
file number
1 101 3D floor plan
102 2D floor plan
103 2D stair
104 Dimensions and labels
105 Hidden-line image
110 Key plan
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 1 | 101
102
103
104
105
110 | 3D floor plan
2D floor plan
2D stair
Dimensions and labels
Hidden-line image
Key plan |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


Engineering Tutorial Unit 2: floor plan and general arrangement drawing 21
Creating the 3D model with the tools in the Components task area
If you do not have the Components task area, create the floor plan in
2D (on page 76), dimension (see "Dimensions" on page 60) the floor
plan and create the stair (on page 66).
Tools Objective:
Wall
Join Linear Components
Column
Downstand Beam,
Upstand Beam
Door
Window
Hidden-Line Image,
Wireframe
Slab
Recess, Opening in Slab
Viewports:
3 Viewports
Hidden view type
Save, Load View

|  |  |
| --- | --- |
|  |  |


2 2 Exercise 1: floor plan of basement Allplan 2022
Settings
Start by defining the default settings.
To select a drawing file and to define options
 Actionbar: Engineering role - Elements task. The
Components task area is expanded.
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar).
2 As you want to work with the fileset structure, click Cancel and
select the Fileset structure tab.
3 Open the drawing file tree for fileset 1 by clicking the triangle
symbol next to the name of the fileset, and double-click drawing
file 101.
4 Check the current Scale (1:100) and Length (m) on the status bar.
If necessary, enter these values.
5 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Components and
architecture page.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 23
6 Check that the Fixed pen for surface elements of archit.
elements check box is selected in the architectural settings
across modules and click OK to confirm the dialog box.
7 Click Show/Hide ( View drop-down list on the Quick
Access Toolbar) and select the Color stands for pen option.
8 In the Window drop-down list (Quick Access Toolbar), click
on 1 Viewport to initially get the display of the following
construction in the floor plan view only. Furthermore, in the
View drop-down list, deselect the Show Coordinate
System setting.

2 4 Exercise 1: floor plan of basement Allplan 2022
Walls
Note: When you use the architectural tools, you effectively work in
three-dimensional space. To define the position of a component
(wall, door, window, and so on) in space, you need the height of the
component’s top and bottom levels. Here, you will use absolute
values to define the height.
You will use the following settings for the basement in the building:
The finished floor covering of the floor slab is at a height of -2.70 m.
You work with unfinished dimensions; consequently, the unfinished
floor is at a height of -2.79 m. The bottom of the floor slab is at
-0.31 m.
Note: You define the position of a wall by entering its starting point
and end point. In addition, you need to specify its offset direction
relative to an imaginary line between the starting point and end point.
Enter a wall thickness to display the wall to scale. A hatching style, fill,
or style area can be applied to intersected walls.
You must enter the height so that Allplan 2022 can generate a three-
dimensional model based on the floor plan. You can also define
additional parameters such as a material and building trade.
This exercise involves creating the walls in the basement. Quantity
takeoff is ignored. It is therefore enough if you just define the
thickness and height of the wall and select a style area.


## Sayfa 31

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 25
Start by defining wall parameters.
To define wall parameters
1 Click Wall (Actionbar - Components task area).
2 Go to the Wall Context toolbar and click Properties. The Wall
dialog box opens.
3 Enter the following information:
• In the Number of layers area, select one layer.
• In the Positioning axis area, drag the component axis to an
edge of the wall in the graphic.
Note: The position of the component axis controls the wall's
offset direction. The component axis can be on a side of the wall
or anywhere within the wall.
4 Enter the following information for layer number 1 on the
Parameters, attributes tab:
• Click the Thickness value, enter 0.300 and click OK to confirm.
(This selects 0.30 and adds it to the list.)
Tip: When defining the wall’s • Change the Priority to 300.
priority rating:
Note: The Priority rating controls the way components intersect.
Use the thickness of the
Components with a lower priority rating have a 'hole' cut in them
wall in mm.
where they are intersected by other components. This ensures
that these areas are not counted twice in subsequent quantity
takeoffs.
• For Calculation mode, select m³.
• For Interaction, select dynamic.
• Select the Auto-join check box.

2 6 Exercise 1: floor plan of basement Allplan 2022
The Wall dialog box now looks like this:
5 Select pen (3) 0.50 on the Format properties tab:
Note: The settings in the Properties palette - Format area have
no effect on the format properties of walls.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 27
6 Enter the following information on the Surface elements tab:
• Select the Style Area option.
301 Reinforced concrete is selected. If it isn't, click the name
of the style area and select number 301.
The Surface elements tab now looks like this:
Tip: The parameters you 7 Now click the Height... button and enter the height. Enter the top
define in this dialog box are and bottom levels of the wall as absolute values. Click the
valid until you change them. relevant elevation icon.
• Top level of wall (= bottom of slab): -0.31.
• Bottom level of wall (= top of floor slab): -2.79.
8 Click OK to confirm the Height and Wall dialog boxes.

2 8 Exercise 1: floor plan of basement Allplan 2022
Entering data in dialog boxes
Tip: For more information on To enter a value, click in the box. Enter the value at the keyboard and
the Wall tool, select select the Enter key.
F1 To enter additional values in and to add them to custom list boxes,
This will display the relevant click first.
topic in the Allplan Help.
To apply entries, click OK.
To discard entries, click Cancel or select ESC.
Component axis
Components are entered along their component axis. The wall’s
offset direction depends on the position of the component axis, the
direction in which the wall is entered and the position of the first
construction layer in the wall.
Click Reverse offset direction (Wall Context toolbar) to
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

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 29
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
drawn. With Reverse offset direction, you have the option to
”tilt” the wall or to reverse the setup of the construction layers.
Tip: By means of the offset The direction is indicated by an arrow and the position of the first
direction, you can quickly construction layer. You can turn these symbols on and off by using
switch between inner and the Symbols when entering walls option in the Point snap
outer dimensions when options - Point snap representation area.
entering walls.

3 0 Exercise 1: floor plan of basement Allplan 2022
Depending on the position of the component axis, the following
options are available:
• Single-layer wall, lateral component axis:
1 Starting point of component
2 End point of component
A Component axis
B Offset direction
C Direction in which you enter the component
After clicking Reverse offset direction:
1 Starting point of component
2 End point of component
A Component axis
B Offset direction
C Direction in which you enter the component
• Single-layer wall, centered component axis:
Clicking Reverse offset direction does not make any
difference.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 31
When you have defined all the parameters, you can draw the walls.
The values are external dimensions. Therefore, the wall’s offset
direction is toward the interior.
Tip: In the following section,
To draw exterior walls
you will enter walls
alternately in the x- 1 Select the wall type by clicking Straight Component.
direction and y-direction by
2 From point
means of the keyboard. So
Click where you want the wall to start.
that you do not have to
select the Tab key to switch The wall is attached to the crosshairs. Check that track tracing is
between the boxes, you can off. If it isn’t, the starting point is marked with a cross. Turn track
select the Switch between tracing off by selecting the F11 key.
x and y boxes
3 Check and define the wall’s offset direction:
automatically option on the
Desktop environment - • You defined a lateral wall axis in the Wall dialog box. The axis of
Track tracing page of the
a straight wall is simply the line that you enter.
Options. To select this
• The values are external dimensions (see illustration).
option, you must turn off
Start by drawing a horizontal wall on the lower-left side. As
track tracing.
the starting point is on the outside, the wall’s offset direction is
upward (= toward the inside).
• Check the wall’s offset direction in the preview at the
crosshairs. It must point upward (= toward the inside).
Tip: While entering • If the offset direction is not correct, you can change it by
elements, you can quickly clicking Reverse offset direction on the Wall context
change the component axis toolbar.
by means of keyboard
4 Enter 3.51 for the x-coordinate in the dialog line.
shortcuts or by clicking
in the dialog line. The other walls will join automatically when you create them in
the same way as polylines by entering dx and dy values in the
dialog line.
5 Enter the following values:

3 2 Exercise 1: floor plan of basement Allplan 2022
dy : 1.0 dx : 5.19
dy : -1.0 dx : 4.505
dy : 16.45 dx : -3.205
dy : 1.0 dx : -3.275
dy : -1.0 dx : -3.275
dy : 1.0 dx : -3.45
dy : -8.375 dx : -1.2
dy : -3.0 dx : 1.2
dy : -6.075
Tip: If you cannot see the
whole drawing, click
Zoom All on the
viewport toolbar.
You can use this toolbar to
control what’s visible on the
screen. If you want, you can
also move the viewport
toolbar to the top of the
workspace. To do this, make
sure that no tool is active.
Use the ALT key to show
the menu bar. Open the
View menu, point to
Toolbars, and click
Viewport toolbar at the
top. Here, you can also
configure Allplan to show
the viewport toolbar all the
time.
A
2
A wall's offset direction
6 The wall polyline closes automatically.
Select ESC to close the Wall tool.

|  |  |
| --- | --- |


|  |  |  |
| --- | --- | --- |


Engineering Tutorial Unit 2: floor plan and general arrangement drawing 33
Draw the interior walls with a different thickness and priority rating.
The wall height is the same as that of the exterior walls.
To draw interior walls
1 Use the right mouse button to double-click an exterior wall.
This selects the Wall tool and gets the wall's properties at the
same time. So, you no longer need to define the height settings of
the component.
2 Choose the wall type by clicking Straight Component.
3 Change the Properties as shown.
• Parameters, attributes tab:
Thickness (m) = 0.24
Priority = 240
• Format properties tab:
Pen thickness (2) = 0.35 mm
Then click OK to confirm.
4 Set properties, place start point
Draw the first horizontal interior wall by placing the starting point
on the lower-left wall corner (see illustration) of the stairwell
area. Check the wall’s offset direction in the preview. If it is not
correct, change it by clicking Reverse offset direction.
5 Enter 5.815 for the x-coordinate. Then enter 2.40 for the
y-coordinate.
6
dY = 2.40
dX = 5.815
4
6 Close the wall outline by clicking the corner of the exterior wall at
the top.

|  |  |  |
| --- | --- | --- |
| 6
dX = 5.815
4 |  |  |
|  |  |  |


3 4 Exercise 1: floor plan of basement Allplan 2022
7 Click the upper-right point to place the first point for the elevator
walls (see illustration).
8 Enter 1.78 for the x-coordinate.
9 Enter -2.48 for the y-coordinate and then -1.00 for the
x-coordinate.
7
10 Select ESC twice to close the wall polyline and the Wall tool.
You will use the Join Linear Components tool to design the next
wall. This tool can be used to extend a wall to the point where it
intersects another wall.
To join walls
1 Right-click the elevator wall you want to lengthen.
2 Select Join Linear Components on the shortcut menu. Check
that the joint width is 0.00. If it isn’t, enter this value in the dialog
line.
3 Click the exterior wall through to which the elevator wall is to
extend.
4 3
1 4
4 Lengthen the elevator wall by joining it with the wall of the
stairwell; then, close the tool.


## Sayfa 41

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 35
You will design more interior walls by using the reference point of
existing walls and the 'enter at right angles' option, which creates
elements at right angles to existing elements. After you have drawn
the upper-left interior wall, which is described in this section, you can
create the other walls yourself as shown in this illustration.
To draw more interior walls
1 Click Wall (Actionbar - Components task area).
2 Choose the wall type by clicking Straight Component.
3 Click the upper-right corner of the interior wall (see illustration)
and define the offset direction toward the lower right.
4 Enter the length of the wall as follows: x-coordinate = 0 and
y-coordinate = -7.78
5 Click Enter at right angles in the dialog line.
6 Confirm the value dy = 0 so that you can enter a value in the x-
direction and define the end point of the wall by clicking the point
where the interior wall you just created and the exterior wall
intersect.
7 To place the starting point of the horizontal wall at the top, click
the line to the right of the vertical wall you just created. You can
see the reference point.
8 If this is necessary, move the reference point onto the lower-left
corner and enter the distance between the reference point and
the wall: 1.40.
9 Enter at right angles is still selected in the dialog line.
Check that the offset direction is toward the top and click the
lower-right wall corner.
10 Now draw the other interior walls yourself.

3 6 Exercise 1: floor plan of basement Allplan 2022
3
7
9
6
11 The wall polylines close automatically. Select ESC to close the
Wall tool.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 37
A note on views and viewports
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

3 8 Exercise 1: floor plan of basement Allplan 2022
Function Use
Left area:
View flyout menu You can use this tool to choose between plan view and any of the
predefined standard views.
Zoom All You can use this tool to select the display scale so that you can see all the
elements in the visible files.
Note: If you have loaded a view by using Save, Load View, you can see
this view only.
Zoom Section You can use this tool to zoom in on a section. To do this, enclose the
elements you want to zoom in a selection rectangle.
Navigation Mode You can use this tool to turn navigation mode on or off in the active
viewport. In this mode, you can use the mouse to view a 3D model.
Note: You can move in sphere mode or in camera mode (while selecting
and holding CTRL KEY).
Previous View You can use this tool to restore the previous view or display scale (if you
had selected a different view or scale before you selected the current
setting).
Next View You can use this tool to restore the next view or display scale (if you have
already selected a subsequent view or scale).
Save, Load View You can use this tool to save the current view under a name of your choice
or retrieve a view you saved beforehand.
3D View You can use this tool to display 3D models in three-dimensional space in a
perspective view by entering an eye point (observer) and a target point.
You can choose between parallel projection and central projection for the
perspective view. You can also use this tool to create a view based on the
building structure.
perspective You can use this tool to switch between parallel projection and central
projection. Select this tool to display the model in central projection.
Element Selection You can use this tool to select the design entities you want to display in the
active viewport. The program temporarily hides all the other design
entities.
Drawing File Selection You can use this tool to temporarily hide drawing files that are currently
visible in the active viewport.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 39
Function Use
Always on Top You can use this tool to place the viewport so that it is always on top (that
is, in front of) the other ones.
or
You can only use this tool if you have not selected the Connected option
and the viewport is not maximized.
Right area:
Exposure You can use this box to control the brightness in viewports of the
(only for the Animation or RTRender view type. You can enter a value between -25 and
Animation and 25.
RTRender view
types) Important!
This setting only changes the way elements look in the active viewport. It
has no effect on rendering.
Section Display You can use this tool to display your design in an architectural section for
which you have already defined the Clipping Path.
Display Scale You can use this tool to select the scale for displaying the model on the
screen.
The display scale governs the ratio between the model on the screen and
its real-life dimensions. The scale therefore changes automatically if you
change the size of sections on the screen. You can see the current display
scale on the viewport toolbar in the lower border of a viewport.
View Type You can use this list box to select one of the predefined view types
(Wireframe, Hidden, Animation, Sketch or RTRender) for the active
viewport. Of course, you can also select a view type you defined yourself.
Click to modify various settings of the view types. The settings apply to
all the viewports that use this view type. Click New view type to define
and save your own view types.
When Layout Editor is open, you can switch between Design view and
Print view (= preview of resulting printout).
Note: You can find more tools for controlling what's on your screen in
the View and Window drop-down lists on the Quick Access
Toolbar and on the shortcut menu (in navigation mode only).

4 0 Exercise 1: floor plan of basement Allplan 2022
You edit your model in viewports. Here, you create or modify the
required design entities. While doing so, you identify distinctive
Note: This tutorial uses the points and select the view type and view appropriate to the current
Connected option, which is status of your work.
selected by default
To provide you with as much effective working space as possible for
( Window drop-down list this purpose, you can completely undock the graphics viewports
on the Quick Access from the Allplan application window. If you have a second monitor,
Toolbar). When you change you can leave the Allplan application window on one monitor, using it
the size of a viewport, all the as a “toolbox”, while you concentrate on editing the model in the
other viewports adapt independent viewports placed on the second monitor. You can find
automatically. New more information about floating toolbars in the Allplan Help section
viewports will be fitted into under “Viewports”.
the arrangement.
By opening several viewports in parallel and arranging them as you
If the Connected option is
need, you can simultaneously display your model in different
not selected, you can place
perspectives, at different scales, and with different view types. Each
and resize the viewports
viewport can show the model differently. For example, the first
independently of each other
viewport contains only a part of the model; the second one shows
within the Allplan window.
the whole model; the third one shows an isometric view of the model.
Changes you make to the design in one viewport are immediately
visible in all the others.
You can find the tools for using and arranging viewports in the
Window drop-down list on the Quick Access Toolbar. You can
also select one of the standard viewport arrangements and then
modify this arrangement to suit your needs. You can specify
whether the additional viewports are placed on the left or on the
right.
The following exercise will help you understand how the viewports
work in connection with the tools on the viewport toolbar.
How to use viewports: detailed view and full view
1 In the Window drop-down list (Quick Access Toolbar), click on
3 Viewport.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 41
The additional viewports with the isometrics and the front view
are placed to the right of the floor plan view.
2 In the Window drop-down list for the window arrangement,
select the setting on the left and click Plan view in the upper
left viewport.
3 Click Zoom Section on the viewport toolbar in the right
viewport.
4 Zoom in on a section in the upper-left viewport.
You can see this section in the viewport where you clicked
Zoom Section (here: in the right viewport).
Thus, you can work on details and still see your entire design in
plan, perspective, and elevation.

4 2 Exercise 1: floor plan of basement Allplan 2022
To create a hidden-line image
1 Click 3 Viewports.
2 Go to the upper-left viewport, click on the
viewport toolbar and select the Hidden view type. This creates a
hidden-line image.
Note: You can define the settings for the hidden-line image in a
palette. Just click beside the view type.
3 To hide the division lines between the exterior walls and interior
walls of varying pen thickness, open Show/Hide ( View
drop-down list on the Quick Access Toolbar) and select the Use
color 1 for all elements option.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 43
To save a view
1 Use Zoom Section to choose a section displaying the design in
plan (right viewport).
2 Click Save, Load View.
3 In the Save, Load View dialog box, click New, enter a name for
the view and click Load.
Tip: You can use Save, Load The view is now selected ( icon appears pressed in). This
Arrangement in the means that you can see this view when you click Zoom All.
Window drop-down list
4 Turn off Save, Load View (icon no longer appears pressed)
(Quick Access Toolbar) to
and click
save the arrangement of all
Zoom All.
viewports and load it again
with a single click. Instead of the saved view, the entire design is visible again.
5 Open the Window drop-down list on the Quick Access Toolbar
and click 1 Viewport. This also turns off the hidden-line image.

4 4 Exercise 1: floor plan of basement Allplan 2022
Columns
Now you will place a column in the basement.
Tip: You can also use the
To draw a column
Column tool to make any
column-shaped element -  Drawing file 101 is current and plan view is selected. Line type 1 is
for example, round and
selected.
rectangular columns and
small-sized flush piers. 1 Select pen thickness (3) 0.50 mm in the Properties palette -
Format area and click Column (Actionbar - Components task
area).
Check that the AR_COL layer is selected. If it isn't, select it in the
Properties palette - Format area.
2 Go to the Column Context toolbar and click Properties.


## Sayfa 51

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 45
3 Define the parameters in the Column dialog box as shown:
Type: Rectangular column
Width: 0.25 m
Thickness: 0.40 m
Priority: 250
Style area: 301 Reinforced concrete
4 Click the button marked Height... and enter the height of the
column as absolute values:
• Top level: -0.51.
• Bottom level: -2.79.
5 Confirm the two dialog boxes.
6 Go to the Column Context toolbar and change the column's
anchor point to lower right.
7
7 Point to the inner corner of the wall (see illustration).
This point is the reference point for entering coordinates.
Consequently, the boxes in the dialog line are highlighted in
yellow.
8 Enter 0.00 for the x-coordinate and 2.85 for the
y-coordinate in the dialog line and select the Enter key to
confirm.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |


|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |


4 6 Exercise 1: floor plan of basement Allplan 2022
Allplan positions the column.
9 Select ESC to close the tool.
Assigning layers
You assign layers and other format properties (pen, line and color) to
walls and upstands in the Properties dialog box.
Note: If you selected the layers as described in unit 1, the tool
automatically selects the appropriate layer.
If it isn't or you want to use a different layer, do the following.
Tip: How to select layers
To select the current layer
Always proceed as follows:
 The Column tool is selected.
- First select a tool. The dialog box with the properties is closed.
- Check the layer’s short 1 Open the Layer drop-down list in the Properties palette -
name in the Properties Format area.
palette - Format area.
- Select a different layer.
Tip: To see which layers
have already been assigned,
open the View drop-
down list, click Select,
Set Layers and select the
List layers used in open
documents option in the
Contents of list box area. 2 If the layer AR_COL is available in the quick selection list, click this
Alternatively, open the layer.
Layers palette and the
3 If it isn't available, click Select… and double-click the AR_COL
shortcut menu and click List
layer in the Single layer selection dialog box.
layers used in open
documents.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 47
Downstand beam
Next, you will create a beam over the column.
To draw a beam
1 Click Downstand Beam, Upstand Beam (Actionbar -
Components task area). On the Downstand Beam, Upstand
Beam Context toolbar, click Properties.
2 Define the parameters for the beam as shown in the illustration:
Thickness: 0.25 m
Priority: 250
Pen thickness: (2) 0.35 mm
Style area: 301 Reinforced concrete
3 Check that the layer AR_BEAM is selected. If it isn't, select it.

4 8 Exercise 1: floor plan of basement Allplan 2022
4 Click to define the absolute height of the beam:
• Top level: -0.31.
• Bottom level: -0.51.
5 Confirm the two dialog boxes.
6 Click the starting point (see illustration).
7 Click Enter at right angles and enter 0 for dx.
8 Check the beam’s offset direction in the preview. If it is not
correct, change it by clicking Reverse offset direction.
9 To define the end point of the beam, click the horizontal wall.
As you have selected 'Enter at right angles', you can also click a
corner of the wall.
Allplan draws the beam.
10 Select ESC to finish entering the beam.
11 To check the beam’s position, select a standard isometric view on
the viewport toolbar or open multiple viewports.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 49
Openings
Note: The procedure for creating an opening – be it a door, window,
niche, or recess – is always the same. The differences lie in the
property settings you can make.
Like in the real world, walls and openings are linked in Allplan. When
you move a wall, for example, its openings will move too.
All the doors in the basement are single doors of 0.885/2.10 m
(except for the doors to the stairwell and elevator). You will not use
SmartParts or smart symbols. You will draw the door opening
without a door swing. To display the door lintel, you will use the
reveal option.
The procedure for creating door openings also applies to all other
kinds of openings.
Entering openings
Tip: You can enter names • Click the first point of the opening.
for combinations of • Enter properties and the height.
parameters and save them
• Enter the width of the opening.
as favorites.
You can use to match You must define the settings for the opening only once if you want to
the settings from an create a series of identical openings. The properties and height
existing component. settings are stored by the system until you redefine them.
To create door openings
1 Click Door (Actionbar - Components task area).
The door opening is attached to the crosshairs.
The program suggests the AR_SMSY layer so that you can place
a SmartPart or smart symbol in the opening while creating it.
Openings always have the same layer as the component into
which they are inserted, regardless of which layer is the current
one.
Here, the layer setting is irrelevant.

5 0 Exercise 1: floor plan of basement Allplan 2022
2 Switch the Anchor point for preview to the lower right on the
Door Context toolbar and check that Enter offset directly is
turned off in the dialog line. If it isn't, enter 0.00 for Offset to
reference point. Now you can enter a reference point.
3 Click a point on the outside of the stairwell wall roughly where
you want to insert the door (see the following illustration).
Allplan displays an arrow on the reference point. When you look at
the dialog line, you can see the distance between the reference
point and the point clicked.
4 If the reference point is not on the upper-left inside corner, click
this corner to move the reference point there and enter 3.825 m
for the offset in the dialog line.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 51
5 Click Properties.
6 Select the rectangular shape for the door.

5 2 Exercise 1: floor plan of basement Allplan 2022
7 As you do not want to display the door swing, click the icon below
Opening direction and then click Off.
8 Click Height… and enter the height of the top and bottom levels of
the door as absolute values. For the bottom level, enter
-2.79. The top level is the door height plus the thickness of the
floor (0.09 cm). Enter -0.69.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 53
9 Click OK to confirm the dialog box.
10 For the sill representation, select On both sides. Select pen
0.35 mm for the sill; do not change the line or color. Select the
AR_WALL layer.
Turn off the Create reveal element option.
11 Click OK to confirm the dialog box.
12 Enter 1.01 m for the width of the opening in the dialog line. Allplan
draws the door opening.
Tip: You can change the 13 Now draw all the other door openings yourself. You only need to
anchor point (left, right or enter the width of the opening in the dialog line (except for the
centered) on the Door elevator door which is 2.25 m high). Make sure that the offsets
Context toolbar. are correct. Change the height of the elevator door in the dialog
box:
You can also turn off the
bottom level = -2.79; top level = -0.54.
'Prompt for opening width'
to create several doors of
the same width.
Tip: To check how your
design looks in 3D, switch to
a standard isometric view
(viewport toolbar) and
create a hidden-line image
by using the Hidden view
type.

5 4 Exercise 1: floor plan of basement Allplan 2022
14 Select ESC to close the tool.
The next step is to insert window openings in the walls. Some of the
window openings will be wider and higher than others and the height
of the sill in each opening is also different. Here, too, the windows get
sills.
You are already familiar with the approach. Define the height, select
the shape of the window, and place the opening in plan.
To create window openings
Tip: You can change the 1 Click Window (Actionbar - Components task area - Door
anchor point (Window flyout menu).
Context toolbar) and the
2 Switch the Anchor point for preview to the lower-right point
position of the reference
on the Window Context toolbar and check that Enter offset
point.
directly is turned off in the dialog line. If it isn't, enter 0.00 for
Offset to reference point.
3 Click the line representing the upper-left exterior wall and enter
the offset to the reference point in the dialog line.


## Sayfa 61

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 55
4 Click Properties.
5 The dimensions of the window openings are 80 by 60 cm. When
the lintel is 20 cm, the top level of the opening is at
-0.51 and the bottom level is at -1.11. Click Height... and enter the
height as absolute values.
6 In the Sill area, select the Both sides option. Do not change the
pen, line, or color of the sill. Select the AR_WALL layer.
Turn off the Create reveal element option.

5 6 Exercise 1: floor plan of basement Allplan 2022
7 Click OK to confirm the dialog box.
8 Now draw the windows as shown. Do not forget to change the
settings for the windows in the left exterior wall.
You can do this in two ways:
• Enter -1.31 for the height of the sill and 0.80 for the height of
the opening
• or click Height... and change the bottom level to -1.31.
9 Select ESC to close the tool.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 57
Defining the reference point
To change the position of the small arrow representing the nearest
significant reference point, you can
• click a new point on the wall line or
• click a point beyond the wall line. The reference point will move to
the point on the wall line that is perpendicular to the point that you
clicked.
Checking the design
You can generate a hidden-line image to check the design. Thus, you
can see whether the height settings of the window and door
openings are correct. You can save the hidden-line image to a
drawing file.
To copy the 3D view to a different drawing file
1 Click Front Right, Southeast Isometric View on the viewport
toolbar.
2 Click Hidden Line Image, Wireframe ... ( Window drop-
down list on the Quick Access Toolbar).
3 Click Hidden Line Image in the Hidden Line Image, Wireframe
dialog box.

5 8 Exercise 1: floor plan of basement Allplan 2022
4 The Hidden Line Image in Destination Document palette opens.
Click the Set button in the Representation area. Another palette
opens. Switch to the Edges tab and clear the Hidden edges
option in the Display edges area.
Tip: To save the resulting
5 Click OK to confirm the palettes and the note.
hidden-line image as an
NDW file, open the drop- The hidden-line image appears in a separate window.
down list of the Allplan icon
6 Close this window by clicking the X in the upper-right corner.
and click Save Copy as....
Confirm the prompt by clicking Yes.
->

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 59
7 Select drawing file 105 in the Select destination drawing file
dialog box.
8 Click Open on a Project-Specific Basis and double-click
drawing file 105 to make it current.
As the isometric view is still active, you can see nothing in the
workspace.
9 Click Plan on the viewport toolbar.
10 Your workspace now looks like this. You can also print the image
by clicking Print in the drop-down list of the Allplan icon on the
title bar.
Note: When checking the design, you can also show or hide elements
or element groups, make them gradually transparent, color code
them, or zoom in on a particular element. To do this, use the Objects
palette, which lists all components of your virtual building model in a
compact and clear manner. You can use predefined sorting criteria to
show and hide the required objects and elements.
The extensive possibilities of the Objects palette are explained in
detail in the Allplan Help section under “Objects palette”.

6 0 Exercise 1: floor plan of basement Allplan 2022
Dimensions
Now you will dimension the floor plan by using the approach
described in exercise 6 in the Basics Tutorial. To do this, go to the
Actionbar, select the Draft role and the Label task and use the
tools in the Dimension task area.
• Make drawing file 104 current; open drawing file 101 in edit mode
and close all the other drawing files.
• Check the current Scale on the status bar and change it to 1:100.
• Place the dimensions for the doors, windows, and beam on the
layer DL_GEN and the wall dimensions on the layer DL_100.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 61
Turning layers on and off
To check the layers assigned to the dimensions, select the "visible,
frozen" status for the DL_GEN layer with the dimensions of the
openings.
To turn layers on and off
1 Open the Layers palette.
2 Open the shortcut menu of the Layers palette and click List
layers used in open documents.
3 Right-click the
DL_GEN Dimension line, general layer and choose Visible,
frozen.
Tip: If you change the status
of the current layer, the
DEFAULT layer becomes
the current one.
The dimensions on the DL_GEN layer are in color 25, which you
selected for frozen layers.

6 2 Exercise 1: floor plan of basement Allplan 2022
Tip: When no tool is active, You can also show and hide layers by selecting the Select, Set
you can also open the Layer Layers tool on the shortcut menu of a viewport. The shortcut menu
dialog box by double- of the Select Layer/Visibility tab provides the required options.
clicking the right mouse
To make the frozen layer modifiable again, right-click any frozen
button in the workspace.
dimension line, select Modify Layer Status on the shortcut menu
and click Modifiable.
You can also use the Objects palette to change the layer status.
Open the Objects palette and select Sort by layer in the list box
at the top. This criterion lists all the layers assigned to the objects and
elements in the currently open drawing files (current or open in edit
mode or open in reference mode).
When you point to the icon indicating the layer status in the list,
Allplan opens a flyout menu where you can change the status of the
layer.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 63
What to do when elements are no longer visible?
• Make all layers visible. To do this, use the Layers palette or the
dialog box of the Select, Set Layers tool (open the shortcut
menu in the workspace) or the Objects palette (Sort by layer
criterion).
• If the elements are still not visible, the selected privilege set might
not have the necessary privileges. Select the Select Layer
Privilege Set tool at the bottom of the Layers palette and select
an appropriate privilege set or ask your administrator for help.
You can also select a privilege set in the Layer dialog box - Select
Layer/Visibility tab - Privilege set list box.
Which layer is the element on?
• When you point to an element (without clicking it), a box with
information on the element opens. You can customize element
info to your needs. Open the Options on the Selection page:
Element name and Layer are turned on by default.
• You can find out which layers individual elements are on by
turning each individual layer on in the Layers palette.
You can also use the Objects palette. Select the Sort by layer
criterion, which lists all the layers assigned to the objects and
elements in the currently open drawing files (current or open in
edit mode or open in reference mode). If you want to know the
layer of a particular element, click this element in the workspace.
As a result, this element gets the Active icon in the Objects
palette and you can see the layer to which it belongs.

6 4 Exercise 1: floor plan of basement Allplan 2022
• You can find out which layer a single element is on by right-
clicking the element and selecting Format Properties.
You can see and change all the properties including the layer.
You can also change the layer of the current element. The layers
of linked components (for example, window openings in walls),
however, do not change. We recommend that you use Modify
Format Properties.
• You can change the layer assignments of one or several
elements by using the Modify Format Properties tool
(Change task area). This tool also modifies the layers of linked
elements.
• To change the layer assignments of one or several elements, you
can also use the Objects palette. Select the Sort by layer
criterion. Open the tree structure of a layer down to its lowest
level. There, select one or more elements. You can now drag the
elements to another layer (the uppermost level in the hierarchy)
in the list.


## Sayfa 71

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 65
->
However, you can reassign the elements only to a layer that is in
this list.

6 6 Exercise 1: floor plan of basement Allplan 2022
Stair outline
You can create stairs in two ways:
• You can model stairs in 3D with the tools in the Stair task area.
• You can draw stairs in 2D with the tools in the 2D Objects task
area.
As half-space landings and flights of stairs are usually produced as
precast elements, you do not need to design or reinforce these
components. Therefore, you will create the outline of the stair with
the tools in the 2D Objects task area. The following exercise is a
"rough design guideline". Tools that you have already encountered
are no longer explained in detail.
To draw the stair outline
1 Make drawing file 103 current; open drawing file 101 in edit mode
and close all the other drawing files. Open the Properties palette
and select pen thickness 0.13 mm.
Tip: To select a tool you
2 Select the Design task on the Actionbar.
have already used
beforehand, you can also 3 Use Line, Rectangle and Parallel to Element (Actionbar
open this tool by clicking it in - 2D Objects task area) to draw the stringers and the steps.
Check that the DE_GEN01 layer is selected. If it isn't, select it in
the Repeat drop-down
the Properties palette - Format area.
list (Quick Access Toolbar).
You can choose from the 30
4 Use Line and Perpendic. Bisector (2D Objects task area)
tools you have selected
to draw the line of travel.
most recently.
5 Use Line to draw two section lines.
6 Use Auto-Delete Segment (shortcut menu of an element) to
delete redundant line segments.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 67
7 Click Modify Format Properties (Actionbar - Change task
area).
8 The Modify Format Properties dialog box opens. Select the Line
type check box and choose line type 2. Then click OK to confirm.
9 Select elements to modify: Click the elements to which you want
to apply the new line type. Then select ESC to close the tool.
10 Make drawing file 104 current; open drawing files 101 and 103 in
edit mode and close all the other drawing files.
11 Dimension the outline of the stair and modify the dimensioning of
the door. Use the right mouse button to double-click a frozen
opening dimension line.
This selects the Dimension Line tool and the DL_GEN layer.

6 8 Exercise 1: floor plan of basement Allplan 2022
Slab
The basement now needs a slab. You can create slabs with the
Slab tool. As with walls, start by entering the properties and then
draw the outline of the slab by means of the polyline entry tools.
To define the slab’s properties
Tip: You can also use the
1 Make drawing file 101 current and open drawing file 103 in edit
Slab tool to create floor
mode.
slabs.
Allplan provides separate 2 Go to the Actionbar and switch back to the Engineering role -
tools for creating Elements task. Then click Slab (Components task area) and
foundations. select pen thickness 0.50 mm.
Check that the AR_SLAB layer is selected. If it isn't, select it in the
Properties palette - Format area.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |


Engineering Tutorial Unit 2: floor plan and general arrangement drawing 69
3 Go to the Slab Context toolbar and click Properties.

7 0 Exercise 1: floor plan of basement Allplan 2022
4 Click Height... and enter the height of the slab as absolute values.
The unfinished floor of the ground floor = top level of the slab
above the basement = -0.11. As the slab is 20 cm thick, the
bottom level = -0.31.
5 Click OK to confirm the height settings, define the priority rating,
and select a style area. Do not close the Slab dialog box.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 71
To avoid entering the same properties again and again, you can save
them as favorite files. You can do this for any component.
To save component properties as favorite files
 The Slab tool is still selected; the dialog box is open. If this is not
so, select this tool and click Properties.
1 Click Save as a favorite in the lower-left corner of the dialog
box.
2 Select the Favorites - project folder, enter a name and click Save
to confirm.
3 Click OK to confirm the Slab dialog box.
The next time you need a slab with these settings, click Load
favorite and select the file.
The values in the dialog box will change automatically.

7 2 Exercise 1: floor plan of basement Allplan 2022
You will now define the position of the slab. To do this, you will use
the polyline entry tools. By means of these tools, you can polygonize
the outline in a single step. The only requirement is that you click an
element in the polyline and do not snap a point.
Polyline entry tools
You can use these tools to enter any outline. To use the following options, select the Polygonize
elements check box.
Polygonize entire element: This uses the starting point for the direction. You can specify the
number of segments for circles and curves.
Define area of element to polygonize: This generates a polyline based on a portion of an
element. Define the portion by clicking a ‘from’ and a ‘to’ point.
Enter reference point: This identifies a point on the element as the starting point for the new
element. To define this point, click a point on the element and enter the offset between this
point and the nearest significant point (indicated by an arrow).
Area detection using additional point: This uses a point you click on a polyline to detect the
entire boundary.
To create the slab by means of the polyline entry tools
1 Set properties, place polygon point 1, element or offset: Click a line
representing the outside of a wall. Make sure that you do not click
the line near a point.
2 Go to the input options, click Area detection using additional
point and turn off Island detection.
3 Click a point (near to the first point) beyond the floor plan. The
system automatically detects the outline of the entire floor plan.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 73
3
1
4 Select ESC to close the tool.
You will now insert an opening in the slab in the area of the stair to
provide access to the ground floor. You can use the Recess,
Opening in Slab tool to pierce slabs in their entirety. Height settings
are not required - all you need to do is define the shape of the
opening. You can choose between rectangular, circular, polygon and
freeform openings.
You will also insert a slab opening for the elevator shaft. To define the
outline, you will use the Area detection tool. With this tool, you
can detect a closed polyline simply by clicking within its boundaries.
To create a freeform slab opening
1 Click Recess, Opening in Slab (Actionbar - Components task
area).
2 Click the basement slab.
3 Go to the Recess, Opening in Slab Context toolbar and click
Properties.

|  |  |
| --- | --- |


7 4 Exercise 1: floor plan of basement Allplan 2022
Tip: Slab openings are
created in the same way as
slab recesses. The
parameters are also
identical. The only difference
is that height settings are
required for recesses, as
they do not pierce the slab
in its entirety.
As with door and window
openings, slab openings
have the same layer as the
component into which they
are inserted, regardless of
which layer is current.
4 Select the Opening type and the Freeform outline.
5 Click the corners of the stair outline one after the other.
5 5
5 5
5 5
5 5
6 To close the outline, click the first point again or select ESC after
the last point.
This defines the slab opening for the stair. The next step is to
define the slab opening for the elevator shaft.

|  |  |
| --- | --- |


|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  | 5 |  |  |
|  |  |  |  |  |  |
|  |  |  | 5 |  |  |



## Sayfa 81

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 75
7 Turn on Area detection in the input options (icon must be
pressed in).
8 Click in the elevator shaft. The system automatically detects the
area.
8
9 Select ESC to close the tool.
10 Click Front Right, Southeast Isometric View on the viewport
toolbar.
11 Select the Hidden view type on the viewport toolbar, open
Show/Hide and temporarily select the Use color 1 for all
elements option again.
The result should look like this:
Printing layouts is covered in exercise 9.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |


7 6 Exercise 1: floor plan of basement Allplan 2022
Creating the walls in the basement in 2D with the tools in the 2D Objects
task area
As an alternative to the tools in the Components task area, you will
now create the walls in the basement in 2D.
You will use the tools in the 2D Objects task area. You can find these
tools on the Actionbar.
Tools: Objective:
Offset Polyline
Rectangle
Delete Double Lines
Line
Parallel to Element
Auto-Delete Segment
Move
Start by defining the default settings.
To select a drawing file and to define options
1 Go to the Actionbar, select the Draft role and open the Design
task. Expand the 2D Objects task area.
2 Click Open on a Project-Specific Basis (Quick Access
Toolbar) and double-click drawing file 102.
3 Check the current scale (1:100) and unit of length (m) on the
status bar.
4 Select pen thickness 0.50 mm and line type 1 in the Properties
palette - Format area.

|  |  |
| --- | --- |
|  |  |


Engineering Tutorial Unit 2: floor plan and general arrangement drawing 77
Now draw the exterior walls.
Approaches
You can enter a floor plan in 2D in various ways:
• Create the walls with the Line and Parallel to Element
tools. You are already familiar with this approach; you used it to
draw the title block in the Basics Tutorial.
• Create the walls with the Rectangle tool. By snapping to
points and entering offset values, you can take openings into
account. You will draw the interior walls in this way.
• Create the walls with the Offset Polyline tool.
In addition to these 2D tools, you can also use the tools in the
Components task area to create the floor plan without defining the
height (top level = bottom level = 0.00). This approach is equivalent to
the one described earlier.
To draw exterior walls as offset polylines
 Plan view is selected and the Hidden view type is turned off.
If this is not so, click 1 Viewport in the Window drop-down
list on the Quick Access Toolbar.
1 Click Offset Polyline (Actionbar - 2D Objects task area).
Tip: When you enter a 2 Select the layer DE_GEN02. Consequently, you can use the 2D
negative offset, Allplan floor plan for the key plan and the slab reinforcement.
creates the offset polyline
3 Number of parallel lines: Enter 2.
on the side opposite the one
you clicked. The direction in 4 Enter the offset for the parallel lines in the dialog line: Offset 1 = 0;
which the offset polyline is offset 2 = 0.30
entered, however, does not
5 Click in the workspace to place the first point. Click anywhere in
change.
the lower-left area.
6 Click left in the input options to define the offset direction. Use
x-coordinate and y-coordinate in the dialog line to enter
the values in the x-direction and y-direction as shown in the
illustration. Then select ESC to close the tool.

7 8 Exercise 1: floor plan of basement Allplan 2022
Select the Tab key to switch between the boxes.
dx = 3.51 dy = 1.00
dx = 5.19 dy = -1.00
Tip: If you have entered an
incorrect value or made an dx = 4.505 dy = 16.45
error, select ESC and dx = -3.205 dy = 1.00
Delete (Actionbar - Edit dx = -3.275 dy = -1.00
task area) the error. You dx = -3.275 dy = 1.00
can then resume your work. dx = -3.45 dy = -8.375
dx = -1.20 dy = -3.00
dx = 1.20 dy = -6.075
Tip: If you want to create a
floor plan of varying wall
thickness, you can enter the
offset values each time you
place a point or you can use
the Modify Offset tool
to correct the wall thickness
after you have entered the
floor plan.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 79
Draw the interior walls with the Rectangle tool. In doing so, you
can take the door openings into account. Start with the horizontal
walls near the stairwell.
To draw the interior walls as rectangles
1 Click Rectangle (Actionbar - 2D Objects task area).
2 Starting point: Click the reentrant corner of the left exterior wall
(see illustration).
2 4
3 Diagonal point: Enter 6.055 (= length of wall) for the
x-coordinate and -0.24 (= thickness of wall) for the
y-coordinate. Then select the Enter key to confirm.
4 To create the vertical wall, click the upper-right corner of the wall
you just created and enter x-coordinate = -0.24 for the
length and y-coordinate = 2.40 for the width.
5 To delete the two superimposed lines in the corner, which result
from the two rectangles, right-click the duplicate lines and select
Delete Double Lines on the shortcut menu.

8 0 Exercise 1: floor plan of basement Allplan 2022
6 Click Rectangle and draw the exterior wall at the top of the
stairwell. The starting point is the interior edge of the corner (see
illustration); length = 3.825, width = 0.24.
6
5
7 The Rectangle tool is still open. To define the starting point of
the next rectangle, you will snap to a point and enter the offset
value.
8 Point to the lower-right corner of the wall you have just drawn
(see illustration). The boxes are highlighted in yellow in the dialog
line
Tip: Bear in mind that you 9 Enter 1.01 for the x-coordinate in the dialog line and select the
can select a wide range of Enter key to confirm.
tools simply by right-
10 Enter 3.00 for the length and 0.24 for the width.
clicking the element in
question (when no tool is
active).
8 11
Moreover, you can open
tools you have already used
by clicking the tool in
question in the Repeat 11 You can delete the superimposed line at the point where the
drop-down list on the Quick horizontal and vertical walls intersect by using the Delete
Access Toolbar. Double Lines tool (shortcut menu of the element).

|  |
| --- |
|  |


|  |  |
| --- | --- |


Engineering Tutorial Unit 2: floor plan and general arrangement drawing 81
Draw the other interior walls by snapping to points and entering
offset values. Experiment with the Parallel to Element tool.
When you have drawn all the walls, delete the redundant lines in the
areas where the walls intersect. You can also delete the lines in the
region where the interior walls and the exterior walls meet, as the
same material is used for all walls.
Use the Line tool to complete the door lintels and the beam near
the column. To do this, select pen thickness 0.25 mm.

8 2 Exercise 1: floor plan of basement Allplan 2022
The window openings in the exterior walls are still missing.
To draw window openings
1 Select pen thickness 0.50 mm and click Line (Actionbar - 2D
Objects task area).
2 Point to the upper-left corner of the exterior wall. The boxes are
highlighted in yellow in the dialog line.
3 Enter 0.55 for the x-coordinate in the dialog line and select
the Enter key to confirm.
4 Enter -0.30 for the y-coordinate.
5 Click Parallel to Element (Actionbar - 2D Objects task area)
and draw a line to the right of the existing line. Enter an offset of
0.80.
6 Use Auto-Delete Segment (shortcut menu of the element) to
delete the lines representing the lintels. Finally, complete the
lintels for the windows with a pen thickness of 0.25 mm.
2 6
6

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 83
Use the same approach to draw all the other window openings
yourself (see illustration).
Experiment with the numerous tools. For example, you can use
Copy and Copy and Resize (Actionbar - Edit task area).
Tip: Use Area detection Use the Style Area tool (Actionbar - 2D Areas task area) to
when you create the style apply hatching to the walls of the floor plan as described in exercise 6
area. in the Basics Tutorial. Select pen thickness 0.18 mm and style area
301 Reinforced concrete. Check that the SU_STYL layer is selected
while you are creating the style area.

|  |  |
| --- | --- |
|  |  |


|  |
| --- |
|  |


|  |  |
| --- | --- |
|  |  |


8 4 Exercise 1: floor plan of basement Allplan 2022
To finish, you will check the layers used, move the 2D floor plan in
such a way that the 2D and 3D floor plans are congruent, add the
opening for the stair and check the entire design by means of the
Key plan and General arrangement drawing print sets.
To check the layer settings
1 Open the Layers palette.
As the List layers used in open documents option is selected,
you can see the layers DE_GEN02 and SU_STYL only.
Tip: You can also use the 2 Right-click the SU_STYL layer and choose Visible, frozen.
Objects palette.
The style area appears in color 25, which you selected for frozen
layers.
3 Correct the layer assignment and change the status of the
SU_STYL layer to Modifiable again.
To move the drawing in the workspace
1 Drawing file 101 is current. In addition, open drawing file 102 in
reference mode.
2 Click Move (Actionbar - Edit task area).
3 Select the entire 2D floor plan and place it so that the 2D floor plan
and the 3D floor plan are congruent.
4 Finally, use Line to draw the edge of the slab in the stairwell.


## Sayfa 91

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 85
To check the design by means of print sets
1 Open drawing file 101 in edit mode. In addition, open drawing
files 103 and 104 in edit mode.
2 Click Expand at the bottom of the Layers palette and select
the List layers used in open documents option.
3 Right-click in the layer structure and select Match visibility from
print set....
Tip: The design exists twice 4 Select the Key plan print set and click OK twice to confirm.
when you select the
All you can now see is the 2D floor plan with the main dimension
General arrangement
lines but without style areas.
drawing print set.
If you want to display only 5 Repeat steps 2 through 4 for the General arrangement drawing
one floor plan, you can print set. Select the Set all layers visible in print set to
define visibility settings for modifiable option when you select the print set.
layers or open and close the
relevant drawing files.

8 6 Exercise 2: elevator shaft Allplan 2022
Exercise 2: elevator shaft
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the Modeling task of the Engineering role
contains the 3D Objects task area.
This exercise involves designing an elevator shaft for the basement
you created in exercise 1.
You will use the tools in the 3D Objects task area. You can find these
tools on the Actionbar.
Start by selecting fileset 2 with the following drawing files:
Fileset Drawing Drawing file name
file number
2 101 3D floor plan
201 General arrangement - 3D objects
202 Concrete component
203 General arrangement - components
204 Sections and reinforcement with the
model
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 2 | 101
201
202
203
204 | 3D floor plan
General arrangement - 3D objects
Concrete component
General arrangement - components
Sections and reinforcement with the
model |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


Engineering Tutorial Unit 2: floor plan and general arrangement drawing 87
Creating the 3D model with the tools in the 3D Objects task area
If you do not have the 3D Objects task area, you can also use the
tools in the Components task area to design (on page 102) the
elevator shaft.
Tools Objective:
Box
3D surface
3D Line
Extrude along path
Convert Elements
Modify general archit.
properties
Move

|  |  |
| --- | --- |


|  |  |  |
| --- | --- | --- |


8 8 Exercise 2: elevator shaft Allplan 2022
Start by defining the default settings.
To select a drawing file and to define options
1 Go to the Actionbar, switch to the Engineering role, and open
the Modeling task.
2 Click Open on a Project-Specific Basis (Quick Access
Toolbar), open the drawing file tree for fileset 2 by clicking the
triangle symbol next to the name of the fileset, and double-click
drawing file 201.
3 Check the current scale (1:100) and unit of length (m) on the
status bar.
4 Select pen thickness 0.50 mm and line type 1 in the Properties
palette - Format area.
5 In the Window drop-down list (Quick Access Toolbar), click on
3 Viewport and, if necessary, select the setting on the left for
the window arrangement.
So, you can always see the design in plan, isometric view, and
elevation.
Start by designing the floor slab with the Box tool.
To draw a cube
1 Click Box (Actionbar - 3D Objects task area).
Note: The tools in the 3D 2 In plan view (right viewport), click a point in the workspace. The
Objects task area use the starting point is to be the lower-left point of the box.
AR_GEN layer by default.
3 Enter the following values in the dialog line:
Here, the layer setting is
Diagonal point: Enter 2.54 for the x-coordinate and 3.00 for
irrelevant, because you will
the y-coordinate. Then select the Enter key to confirm.
create sections with their
Click point on parallel surface or enter height = 0.30
own layers later by using
the tools in the Sections 4 Open the Window drop-down list and click 3 Viewports to
task area. restore the view in all three viewports.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 89
Next, you will create a volume solid consisting of vertical walls which
will be joined with the floor slab in the basement. To achieve this, you
will extrude a closed profile along a path. This involves three basic
steps:
• Create the outline as a planar polygonal surface.
• Create the path as 3D lines.
• Create the volume solid.
To create the outline as a planar polygonal surface
1 Click 3D Surface (Actionbar - 3D Objects task area).
2 Check that Polygonal 3D Surface is selected on the 3D
Surface Context toolbar.
3 In isometric view (upper-left viewport), point to the upper front
corner of the box, so that the boxes are highlighted in yellow in
the dialog line.
3
4 Enter x-coordinate = -0.20 and
y-coordinate = 0.50 and select the Enter key to confirm.
The starting point is attached to the crosshairs.

9 0 Exercise 2: elevator shaft Allplan 2022
5 Enter values in the z-coordinate and x-coordinate boxes
as shown in the table.
Select the Tab key to switch between the boxes.
dz = 1.10
dx = 0.70
dz = 0.30
dx = -1.00
dz = -1.40
dx = 0.30
The design should now look like this in isometric view:

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 91
The next step involves drawing the path for the volume solid as a 3D
line.
To draw the path for a volume solid as a 3D line
1 Click 3D Line (Actionbar - 3D Objects task area).
Polyline is selected in the input options.
2 In isometric view, click the upper-left point of the outline (see
illustration).
3 Use the y-coordinate and x-coordinate boxes in the
dialog line to enter the dimensions of the shaft:
dy = 2.00
dx = -1.54
dy = -2.00
dx = 1.54
2
4 Select ESC twice to close the tool.

9 2 Exercise 2: elevator shaft Allplan 2022
Next, you will create the volume solid. The 3D line will serve as the
path; in other words, the polygonal surface will be moved along this
line.
To create the volume solid and convert it to a 3D solid
1 Click Extrude Along Path (Actionbar - 3D Objects task area -
Extrude flyout menu).
2 Select profile to extrude: Click to the left of the polygonal surface
and enclose it in a selection rectangle.
3 Select path: Click the 3D polyline.
Allplan displays a preview of the solid and opens the input options.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 93
4 Select ESC to confirm without changing the settings in the input
options
Allplan creates the volume solid without deleting either the profile
or the path.
5 Delete the planar polygonal surface you used for the profile and
the 3D polyline you used for the path.
Tip: To get to this tool 6 Click Convert Elements (Actionbar - Change task area).
quickly, click Find in the
7 Choose General 3D element to 3D solid, 3D surface for the
upper-right corner of the
conversion mode. Then select the volume solid you just created
Actionbar.
and select ESC twice to confirm the settings in the input options
and to close the tool.
Your screen now looks like this:

9 4 Exercise 2: elevator shaft Allplan 2022
To finish, you will assign a surface element to the volume model. You
will use this surface element later when you create associative
sections. After this, you will move the volume model so that this
model and the 3D floor plan created in exercise 1 are congruent. In
addition, you will check that the top of the elevator shaft and the
bottom of the basement walls are flush.
To assign a surface element
1 Click Change Archit. Properties (Actionbar - Change task
area - Modify Format Properties flyout menu).
2 Go to the Surface elements area and select style area 301
Reinforced concrete.
3 Select the entire volume model and click Apply in the Change
Archit, Properties dialog box.
4 Select ESC to close the tool.


## Sayfa 101

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 95
To move the volume model
1 Make drawing file 201 current and open drawing file 101 in
reference mode.
2 3 Viewports are still open. Click Move (Actionbar - Edit
task area).
3 In plan view (right viewport), select the entire volume model.
4 Open the Window drop-down list and click 3 Viewports to
restore the view in all three viewports.
5 Place the volume model in the 3D floor plan in such a way that
they are congruent. Make sure that the shaft dimensions match.
6 The Move tool is still open.
Select the volume model again by right-clicking twice and move
the volume model by
dz = -4.49.
This value results from the absolute height of the basement walls
(= -2.79) and the overall height of the elevator shaft including the
floor slab (= 1.70).

9 6 Exercise 2: elevator shaft Allplan 2022
This elevator shaft and the floor plan of the basement will serve as
the basis for exercise 4. In this exercise, you will learn how to create
sections with the tools in the Sections task area and apply
reinforcement with the tools in the Bar Reinforcement task area.
Printing layouts is covered in exercise 9.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 97
A note on concrete components
To create three-dimensional components of structural engineering,
you can use PythonParts, which you can find in the Library palette.
The PythonParts library contains predefined components. You can
adjust the dimensions on component-specific tabs. All entries you
make are immediately visible in the preview and on the screen.
While setting down the automatically modeled body, Allplan 2022
supports you with various auxiliary tools.
In this section, you create the floor slab and the walls of the elevator
shaft by means of a PythonPart.
To create the floor slab and the elevator shaft as
concrete components
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar), close drawing file 201 and open drawing file 202.
2 Open the Library palette and the Default - PythonParts - PP-
Editor folders.
3 Double-click the Foundation geometry PythonPart.

9 8 Exercise 2: elevator shaft Allplan 2022
4 Do not change the settings on the Modeling tab. Select the
Design tab.
5 Set the desired layer, deselect the options ... From Layer, select
the Fill section option and choose the 301 Reinforced concrete
style sheet for the Section display.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 99
6 Select the Foundation geo. tab and define the height settings and
dimensions of the foundation:
Elevation TLF -3.09
Length 2.14
Width 2.60
Thickness 1.10
7 Select the Create foundation sleeve option and enter the
dimensions:
Length 1.54
Width 2.00
Depth 1.10
Sleeve inclination X-Y 0.00

1 00 Exercise 2: elevator shaft Allplan 2022
8 Select the Create bottom plate option and enter the dimensions:
Length 2.54
Width 3.00
Depth 0.30
A preview of the modeled component is attached to the
crosshairs. Use the lower-left corner of the elevator shaft as the
drop-in point. The upper center of the foundation plate serves as
the component’s reference point.
9 Enter half the opening lengths in the dialog line:
• x-coordinate = 0.77
• y-coordinate = 1.00

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 101
10 Point to the lower-left corner of the elevator shaft and click to
place the component.
11 Check the height settings and adjust the parameters in the
palette.
12 Close the palette.

1 02 Exercise 2: elevator shaft Allplan 2022
Creating the 3D model with the tools in the Components task area
As an alternative to the tools in the 3D Objects task area, you can
also create the elevator shaft with the tools in the Components task
area.
You can find these tools in the Components task area on the
Actionbar. As these tools were covered in exercise 1, they are no
longer explained in detail.
Tools: Objective:
Wall
Slab
Recess, Opening in Slab
Move
Start by defining the default settings.
To select a drawing file and to define options
1 Go to the Actionbar and switch to the Elements task.
2 Click Open on a Project-Specific Basis (Quick Access
Toolbar) and double-click drawing file 203.
3 Check the current scale (1:100) and unit of length (m) on the
status bar.
4 Select pen thickness 0.50 mm and line type 1 in the Properties
palette - Format area.

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 103
Create the walls of the elevator shaft.
To create walls
1 Click Wall ( Repeat drop-down list on the Quick Access
Toolbar).
2 Click Properties.
3 The Wall dialog box opens. Select wall thickness 0.300, priority
rating 300, pen thickness 0.50 mm and area style 301. Then click
Height....
4 Enter the height as absolute values:
• Top level of wall: -3.09.
• Bottom level of wall: -4.19.
5 Click OK to confirm the settings.
6 Click Rectangular Component.
7 Starting point: In plan view (right viewport), click a point in the
workspace.

1 04 Exercise 2: elevator shaft Allplan 2022
8 Turn off Enter at right angles and check that the wall’s offset
direction is toward the outside! If it is not correct, change it by
clicking Reverse offset direction.
9 Diagonal point: Enter 1.54 for the x-coordinate and 2.00 for
the y-coordinate. Select the Enter key to confirm.
Now you will create the slab and the floor slab for the elevator shaft.
To create the slab and the floor slab
1 Click Slab ( Repeat drop-down list).
2 Click Properties.
3 The Slab dialog box opens. Switch the priority rating to 300,
select style area 301 and click Height....
4 Enter the height as absolute values:
• Top level of slab: -2.79
• Bottom level of slab: -3.09
5 Click OK twice.
6 From point, element or offset: Enter 0.70 for the offset in the
dialog line.
7 In plan view, click the lower-left corner of the wall you have just
created.
8 To point, element or offset: In plan view, click the upper-right
corner of the wall you have just created and select ESC.
Tip: You can also use the 9 Repeat steps 2 through 8 to enter the floor slab. The floor slab
Slab Foundation tool to projects from the wall by 0.20 m. Use the following absolute
create the floor slab. values to define its height:
In doing so, you can define
• Top level of slab: -4.19
the top level of the
foundation by matching the • Bottom level of slab: -4.49
bottom level of an existing
10 Select ESC to close the tool.
component.


## Sayfa 111

Engineering Tutorial Unit 2: floor plan and general arrangement drawing 105
The slab now needs an opening.
To create a slab opening
1 Click Recess, Opening in Slab ( Repeat drop-down list).
Tip: You can also select the 2 Click the upper slab.
slab in elevation or isometric
3 Go to the Recess, Opening in Slab Context toolbar and click
view.
Properties.
4 Select the Opening type and the Freeform outline. Then click
OK to confirm.
5 Turn on Area detection in the input options (icon must be
pressed in).
6 Change the offset to 0.00 in the dialog line and click within the
walls of the shaft. The system automatically detects the area.
7 Select ESC to close the tool.
8 Open the Window drop-down list and click 3 Viewports to
restore the view in all three viewports.
9 In isometric view (upper-left viewport), select the Hidden view
type on the viewport toolbar.

1 06 Exercise 2: elevator shaft Allplan 2022
To finish, move the elevator shaft underneath the elevator shaft of
the basement you created in exercise 1.
To move the elevator shaft
1 Make drawing file 203 current and open drawing file 101 in
reference mode.
2 3 Viewports are still open. Click Move (Actionbar - Edit
task area).
3 In plan view (right viewport), select the entire elevator shaft.
4 Open the Window drop-down list and click 3 Viewports to
restore the view in all three viewports.
5 Place the elevator shaft in the 3D floor plan in such a way that
they are congruent. Make sure that the shaft dimensions match.

Engineering Tutorial Unit 3: key plan 107
Unit 3: key plan
In this unit you will learn how to create key plans quickly
and easily.
Exercise 3: key plan for basement
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the Structural Analysis task of the Engineering
role contains the Key Plan task area.
In this exercise, you will create a key plan for the basement. This
exercise requires exercise 1.
You will mainly use the tools in the Key Plan task area. You can find
these tools on the Actionbar.
Start by selecting fileset 1 with the following drawing files:
Fileset Drawing Drawing file name
file number
1 101 3D floor plan
102 2D floor plan
103 2D stair
104 Dimensions and labels
105 Hidden-line image
110 Key plan
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 1 | 101
102
103
104
105
110 | 3D floor plan
2D floor plan
2D stair
Dimensions and labels
Hidden-line image
Key plan |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


1 08 Exercise 3: key plan for basement Allplan 2022
Tools: Objective:
Horizontal Mark
Slab Mark
Move
Modify Lines
Tip: Look in the Allplan Help
for basic information
Start by defining the default settings.
on the Key Plan task area:
To select drawing files and to define options
1 Go to the Actionbar, select the Structural Analysis task and
expand the Key Plan task area.
2 Click Open on a Project-Specific Basis (Quick Access
Toolbar), open the drawing file tree for fileset 1, select drawing file
110, open drawing files 102 and 103 in edit mode and close all the
others.
3 Open the Window drop-down list on the Quick Access Toolbar
and click 1 Viewport.
4 Check the current scale (1:100) and unit of length (m) on the
status bar.
5 Select pen thickness 0.25 mm and line type 1 in the Properties
palette - Format area.

|  |
| --- |
|  |


Engineering Tutorial Unit 3: key plan 109
6 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Key plan page.
7 Make settings as shown in the illustration and click OK to confirm.
As the half-space landing and the flights of the stair will be created as
precast elements, you will draw the boundaries of these components
only. Afterward, you will use print sets to define which design entities
are visible.
To control which design entities are visible
1 Click Line in the Repeat drop-down list on the Quick
Access Toolbar.
2 Go to the Properties palette - Format area, open the Layer
drop-down list and click Select...

1 10 Exercise 3: key plan for basement Allplan 2022
3 The Single layer selection dialog box opens. To close the tree
structure, click in the upper-left area.
4 Open the Key plan layers in the ENGINEERING layer structure by
clicking the corresponding triangle symbol. Click the KP_GEN
layer and click OK to confirm the dialog box.
5 Complete the design by drawing the stairwell and the other
missing stair components. Then select ESC to close the tool.
6 Open the Layer drop-down list again and click Set…
7 Right-click in the layer structure and select Match visibility from
print set....
8 Select the Key plan print set and click OK twice to confirm.
All you can now see is the floor plan with the lines you have just
drawn; the style areas are not visible.

Engineering Tutorial Unit 3: key plan 111
First, you will apply marks to the exterior walls. After this, you will
assign a mark to the slab.
To create horizontal marks
1 Click Horizontal Mark (Actionbar - Key Plan task area).
Check that the KP_KEY layer is selected. If it isn't, select it in the
Properties palette - Format area.
2 Go to the Horizontal Mark Context toolbar, click Without
span direction and select Bubble.
3 Select Plus Text, Leader and Number +. This defines how the
mark looks.
4 Click to make settings for the mark text.
5 Define the following parameters:
• Text height = text width: 2.50
• Aspect: 1.00
• Font: Arial
• Font angle in degrees: 90
6 Enter W01 in the dialog line and select the Enter key to confirm.
7 Place the mark, which is attached to the crosshairs, outside the
left exterior wall (see illustration).

1 12 Exercise 3: key plan for basement Allplan 2022
Tip: You can define the 8 Reference to point: Select the Straight setting and click the
leader type on the context exterior wall. This creates the leader, which connects the mark
toolbar. with the component. Select ESC to finish.
9 Starting point for text, match text or enter additional text: Define
the text parameters and click where the additional text is to
appear.
10 Enter d=30 for the additional text and select the Enter key to
confirm.
8
7
9
11 Select ESC. The next mark number is already attached to the
crosshairs. You can modify it in the dialog line.
12 Enter W02 for the exterior wall at the bottom.
13 Use the same approach to assign mark numbers W03 and W04
to the other exterior walls.
14 Select ESC twice to close the tool.

Engineering Tutorial Unit 3: key plan 113
You have two options to display slab marks: A mark can be horizontal
or at an angle that reflects the angle of the slab diagonal. In this
exercise, you will create horizontal marks.
To create slab marks
1 Click Slab Mark (Actionbar - Key Plan task area).
2 Click Span direction on all sides and enter 0.10 for the arrow
length, which is relative to the slab size. In addition, turn off the
Leader option.
3 Enter 01 in the dialog line and select the Enter key to confirm.
4 Start point, match text or enter mark text: Click the lower-left
corner of the slab.
5 Diagonal point, match text or enter mark text: Click the upper-
right corner. You can see the mark.
6 Click where the additional text is to appear.
7 Enter the additional text in the dialog line and select the Enter key
to confirm.

1 14 Exercise 3: key plan for basement Allplan 2022
8 Select ESC twice to finish.
5
4
Allplan provides several methods for modifying key plans:
You can use this tool to modify marks (span direction, mark
symbol shape and additional text).
You can use this tool to modify the mark text and a single line
of additional text.
You can use this tool to modify lines and their reference.
You can use this tool to edit additional text. Mark text cannot
be changed with this tool.
You can use this tool to change the parameters of all text
items in a mark.
You can use this tool to replace text in marks.

|  |  |  |
| --- | --- | --- |
|  |  |  |



## Sayfa 121

Engineering Tutorial Unit 3: key plan 115
The next step is to move the slab mark.
To modify marks
1 Click Move (Actionbar - Edit task area).
2 Select elements you want to move: Click the mark.
Allplan selects the mark including additional text, leaders, and slab
diagonals.
3 From point: Click the center of the circle.
4 To point: Drag the circle on the diagonal upward to the right.
4
3
2
The slab diagonals have also moved.
5 Click Modify Lines (Actionbar - Key Plan task area).
6 Select the line to modify: Click the end of the lower diagonal.

|  |  |
| --- | --- |


|  |  |
| --- | --- |


1 16 Exercise 3: key plan for basement Allplan 2022
7 To point or line: Click the lower-left corner.
6
7
8 Use the same approach to modify the line at the top.
9 Select ESC to close the tool.
Note: You can also modify the marks by means of direct object
modification, which is covered in the Basics Tutorial.
Reports
You can assign detailed additional text to marks. To avoid confusion,
you can select the Additional text as construction lines setting in
the options. You can then include the marks and the additional text in
a report. To do this, use the Report tool (Actionbar - Key Plan
task area).

|  |  |  |
| --- | --- | --- |
|  |  |  |


Engineering Tutorial Unit 3: key plan 117
Complete the key plan as shown in the illustration. Do not assign
marks to the half-space landing and the flights of the stair, as these
components are precast elements.
Finally, open drawing file 104 in edit mode. As you have selected the
Key plan print set, only the main dimension lines are visible.
Printing layouts is covered in exercise 9.

|  |  |
| --- | --- |


1 18 Allplan 2022

Engineering Tutorial Unit 4: reinforcement drawing 119
Unit 4: reinforcement
drawing
This unit consists of four exercises showing you how to
create reinforcement drawings quickly and efficiently.
 You will use the tools in the Sections and Bar
Reinforcement task areas to reinforce a 3D elevator
shaft and create a 3D model from the reinforcement at
the same time (method 1). Finally, you will create a
reinforcement schedule and a bending schedule.
 You will use the tools in the Bar Reinforcement task
area to reinforce a basic 2D door lintel and create a 3D
model from the reinforcement by entering an auxiliary
3D solid (method 2). Finally, you will save the
reinforcement as a symbol.
 You will use the tools in the Bar Reinforcement and
Meshes task areas to reinforce a basic 2D slab without
creating a 3D model from the reinforcement (method
3).
 You will use the tools in the BAMTEC task area to
reinforce a section of a slab.
To finish, you will learn how to manage cross-section
catalogs.

1 20 Overview of exercises Allplan 2022
Overview of exercises
Exercise 4: 3D elevator shaft with a 3D model (method 1)
You will reinforce the elevator shaft (from exercise 2) and create a
3D model from the reinforcement at the same time. To do this, you
will use the tools in the Sections and Bar Reinforcement task areas.

Engineering Tutorial Unit 4: reinforcement drawing 121
Exercise 5: 2D door lintel with a 3D model (method 2)
You will draw a door lintel with the tools in the Design task area.
Then, you will create an auxiliary 3D solid. With the tools in the Bar
Reinforcement task area, you will reinforce the door lintel and create
a 3D model from the reinforcement at the same time.
You will delete the auxiliary 3D solid and save the door lintel as a
symbol to the library. You will then retrieve and modify the door lintel.

1 22 Overview of exercises Allplan 2022
Exercise 6: 2D slab without a 3D model (method 3)
You will use the tools in the Meshes and Bar Reinforcement task
areas to reinforce sections of the slab you created in exercise 1. This
time, you will not create a 3D model from the reinforcement.

|  |  |  |
| --- | --- | --- |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |


Engineering Tutorial Unit 4: reinforcement drawing 123
Exercise 7: BAMTEC® reinforcement
You will use the tools in the BAMTEC task area to reinforce a section
of a slab without a 3D model.
Te p pic h d a t e i:
BAM0503.TEC
a
quer
a
sgnäl

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |


1 24 Default settings Allplan 2022
Default settings
So far you have used the tasks for creating a building model. You can
find these tasks in the Engineering and Draft roles on the
Actionbar.
To reinforce the components in the following exercises, just select
the tab of the required task:
• Open the tab of the Reinforcement task and expand the Bar
Reinforcement, Meshes and Sections task areas.


## Sayfa 131

Engineering Tutorial Unit 4: reinforcement drawing 125
Exercise 4: 3D elevator shaft with a 3D
model (method 1)
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the Reinforcement task of the Engineering role
contains the Bar Reinforcement and Sections task areas.
Check the Actionbar to see whether the program contains the
following tools:
Bar Shape
In this exercise, you will reinforce the 3D elevator shaft you designed
Tip: Look in the Allplan Help
in exercise 2. First, you will generate auto-updating sections. After
for basic information
this, you will create the reinforcement with a 3D model (method 1).
on the reinforcement
This exercise requires exercises 1 and 2.
methods:
Start by selecting fileset 2 with the following drawing files:
Fileset Drawing Drawing file name
file number
2 101 3D floor plan
201 General arrangement - 3D objects
202 Concrete component
203 General arrangement - components
204 Sections and reinforcement with the
model
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 2 | 101
201
202
203
204 | 3D floor plan
General arrangement - 3D objects
Concrete component
General arrangement - components
Sections and reinforcement with the
model |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


1 26 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Task 1: creating associative sections
In the first part of this exercise, you will use the architectural floor
Tip: Look in the Allplan Help plan and the 3D elevator shaft to create auto-updating sections.
for basic information on the These sections will form the basis for placing reinforcement later
Sections task area: (see Tip).
You will use the tools in the Sections task area. You can find these
tools on the Actionbar.

Engineering Tutorial Unit 4: reinforcement drawing 127
Tools: Objective:
Create Section
Copy
Modify Clipping Path
Modify Section
Show Clipping Path
You can use the tools in the Sections task area to create clipping
paths and views. These form the basis for the reinforcement drawing
you will create later.
At first glance, auto-updating views and section would appear to be
no different from 2D data. However, they are derived from a three-
dimensional model and are therefore inherently linked with this
model.
The program updates the component automatically to reflect any
changes you make to the 3D component or to a view or section. If,
for example, you move an opening in the front elevation or add an
opening to the floor plan, the 3D component and all automatically
updating views and sections of the general arrangement drawing will
adapt automatically. You can also make modifications in isometric
views.
Placing reinforcement has an immediate and direct effect on the
three-dimensional model and consequently on all the other views
and sections.

1 28 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
To create reinforcement, you need at least two orthogonal views or
sections. You can create any number of additional sections by
deriving them from the three-dimensional model. The program
displays the reinforcement automatically and you can label it
immediately.
Sections are different to views in that they can have a spatially
delimited height and depth. This delimitation is defined by the clipping
path.
Start by defining the default settings.
To select drawing files and to define options
 Check the Actionbar to see whether the Engineering role and
the Reinforcement task are selected. In addition, make sure that
the Bar Reinforcement, Meshes and Sections task areas are
expanded.
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar), open the drawing file tree for fileset 2, select drawing file
204, open drawing files 101 and 201 (or 203) in edit mode, and
close all the others.
2 In the Window drop-down list (Quick Access Toolbar), click on
1 Viewport, provided that the 3-window representation is still
enabled.
3 Click the current scale on the status bar and select 1:50. Make
sure the unit of length is m.
4 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Views page.
5 Check the settings.
Note: Regardless of the setting of the Transfer automatically 3D
components in sections option, Allplan always transfers new 3D
components to views and sections that you create by using the
tools in the Sections task area.

Engineering Tutorial Unit 4: reinforcement drawing 129
6 Open the View drop-down list on the Quick Access Toolbar,
click Select, Set Layers, select the List layers used in open
documents option, click the ARCHITECTURE layer structure and
then the button in the upper-left area to expand the tree
structure.
7 Select the AR_GEN and AR_WALL layers, right-click the
selection and, on the shortcut menu, choose Modifiable.
Note: If you use drawing file 203 instead of drawing file 201, the
AR_GEN layer is not available. In this case, make the AR_SLAB
layer modifiable.

1 30 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
8 Select the List entire layer hierarchy option and switch the
SH_GEN Current layer and the SH_SHL Modifiable layer
under ALLPLAN GENERAL, Views and Sections.
You will begin by creating a plan view based on the 3D general
arrangement drawing. The height will not be delimited.
To create a plan view
1 Click Generate Section (Actionbar - Sections task area).
The Create Clipping Path palette opens so that you can define
the clipping path.

Engineering Tutorial Unit 4: reinforcement drawing 131
2 Select the Advanced method for Input and clear the Place
clipping line option in the Clipping path area.
3 Select view or section or enter first point: Click to the left of and
below the lower-left corner of the upper floor slab (see
illustration).
4 To point: Click a point above the upper-right corner of the upper
floor slab (see illustration). Then select the Esc key to finish.
5 Select viewing direction: Click in the circle. This has the effect that
Allplan views the object from the top when calculating the
section.

1 32 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
The Generate Section palette opens; the section is attached to
the crosshairs. The label uses the layer in the Properties palette -
Format area. The view border is always on the DEFAULT layer,
regardless of this setting. The section object uses the layer that
you select for the Clipping lines in the Create Clipping Path
palette. The layers for the elements of the section come from the
3D components, or you can specify the layers when you define
the formats for edges, clipping lines, and finish elements on the
tabs.
6 In the Generate Section palette, turn Off the Layer in the
Filter area.
The text on the button changes from Active to Set, which means
that the section uses the current layer setting.
7 Do not change the other settings. Go to the Representation area
and click the Set button to the right of Formats.
The Formats palette opens; you can see the Edges tab.
8 Check the Display edges area to make sure that the Visible
edges and Hidden edges options are selected. Define the
following format properties.
Visible edges:
Pen 0.35 mm; do not change the line or color; select the SH_SHL
layer.

Engineering Tutorial Unit 4: reinforcement drawing 133
Hidden edges:
Do not change the pen, line, or color; select the SH_SHL layer.
9 Switch to the Clipping lines tab.
10 Go to the Display section edges area, select the Display section
edges with a thick line and Outer edges options. In addition,
select the SH_SHL layer for the boundary lines and section
edges.

1 34 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Do not change the other settings.
11 Close the Formats palette to save the settings and to return to
the Generate Section palette.
12 Check the Representation area to make sure that the Show
clipping path option is selected. Click the Set button to the right
of Label.
13 In the Label palette, enter the label for the plan view in the
Additional text box:
Floor plan floor slab d=30cm
and deselect the option Place section identifier.


## Sayfa 141

Engineering Tutorial Unit 4: reinforcement drawing 135
14 Click the Set button to the right of Text parameters, define the
parameters for the label (text height of 5 mm / text height of
4 mm) and click OK to confirm the dialog box.
Tip: Track tracing helps you 15 To point or angle of rotation: Place the section so that it is to the
place points in exact right of and aligned with the architectural floor plan.
alignment with existing
points. You can select the
F11 key or click Track
line in the dialog line to turn
track tracing on and off.

1 36 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
The next steps are to create a longitudinal section and a transverse
section based on the plan view you generated beforehand.
To create sections
 The Create Clipping Path palette is still open. If it isn’t, open this
palette by selecting the Generate Section tool again.
Tip: In Observer mode, the 1 In the Type area, you can switch between the Observer and
bottom edge is placed so Folded reference modes. Observer is selected; do not change
that it is always horizontal; this setting.
in other words, horizontal
2 Select view or section or enter first point: Click the view border of
edges are always horizontal,
the plan view that you just created to define the clipping path
regardless of the viewing
within the plan view.
direction.
In contrast, the folded The Height from elements option is no longer visible. The top and
reference mode simply bottom edges of the clipping path are taken from the plan view.
folds the section.
3 Change the Section identifier to A.
4 Define the clipping area by clicking the lower-left corner and the
upper-right corner in the area of the door opening (see following
illustration) and then click ESC to end the polygon input.

Engineering Tutorial Unit 4: reinforcement drawing 137
5 Select viewing direction: Click below the circle. As a result, Allplan
views the object from the front when calculating the section.
6 You are back in the Generate Section palette. In the
Representation, click the Set button to the right of Label.
7 Select Section in the Additional text list box and select the Place
section identifier option.
8 To point or angle of rotation: Place the section so that it is below
and aligned with the floor plan.
The Create Clipping Path palette opens again. Allplan creates any
other clipping paths within the selected plan view until you finish
creating sections within a view or section by selecting ESC.
9 Use the same approach to create the longitudinal section B-B.
Define the viewing direction from the right. Place this section to
the right of section A-A.
10 Select ESC twice to close the tool.

1 38 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Finally, you will copy the plan view and its clipping path. You will then
modify the height settings to display the floor slab and shaft walls
separately. Furthermore, you also change the top level of the cross
and longitudinal section.
To copy the plan view and to adjust the height
1 Click Copy (Actionbar - Edit task area).
2 Select the entire plan view by enclosing it in a selection rectangle
or by clicking the view border. Place the copy so that it is to the
right of and aligned with the plan view.
3 In addition, copy the clipping path of the plan view in the model
data to itself by clicking the same point for each of the From point
or enter dx and To point or enter number of copies queries.
Tip: If no tool is active, you 4 Right-click the clipping path in the original plan view and select
can also open the Modify Clipping Path on the shortcut menu.
modification tool by double-
5 In the Modify clipping path palette, deselect the option Height
clicking the clipping path.
from Elements and enter –4.00 for the top level. Do not change
the bottom level, which is -4.49.
6 Close the palette to apply the changes.
7 Click Repeat on the Quick Access Toolbar.
The Modify Clipping Path tool opens.

Engineering Tutorial Unit 4: reinforcement drawing 139
8 Select any standard view on the viewport toolbar, click the
unchanged clipping path you copied and switch back to Plan
view.
9 Go to the Modify Clipping Path palette, clear the Height from
elements option and change the top level and bottom level to the
following values:
• Top level -2.75
• Bottom level -3.15
Note: By copying the data, Allplan automatically changed the
section identifier to 2.
10 Close the palette to apply the changes.
11 Right-click the view border in the plan view you copied and select
Modify Section on the shortcut menu.

1 40 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
12 The Modify Section palette opens. Go to the Filter area, open the
Clipping path list box and select the entry 2 (204).
13 In the View area, deselect the Show clipping path option, change
the additional text of the label to
Floor plan shaft walls d=30cm
and apply the changes by clicking Apply in the palette and then
Close twice.
14 Then, go to the plan view on the left side. Here, too, hide the
clipping path by using the Modify Section tool.
The clipping paths of sections A-A and B-B are still visible in the
two plan views.
15 Right-click one of these clipping paths and select Show
Clipping Path on the shortcut menu.
16 Select view Click the plan view on the left side.
17 Click the second clipping path and, again, the plan view on the left
side.
18 Repeat this for the plan view on the right side and select ESC to
close the tool.
Tip: You can also change the 19 Change the Top level of the cross and longitudinal section to the
extension of the clipping value -2.29 using the tool Modify clipping path as described
path intuitively using Direct before.
Object Modification, which
you learned about in the
Basic tutorial.

Engineering Tutorial Unit 4: reinforcement drawing 141
20 Move the labels of the sections to make space for the
reinforcement labels that you will create later.

1 42 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Task 2: edge reinforcement of floor slab
Next, you will place bar reinforcement and create a three-
dimensional model from the reinforcement at the same time
Tip: Look in the Allplan Help
(method 1; see Tip).
for information on the
reinforcement methods and You will mainly use the tools in the Bar Reinforcement task area. You
the 3D reinforcement can find these tools on the Actionbar and on the shortcut menu.
model:
First, you will create the edge reinforcement of the floor slab. To do
this, you will use the Bar Shape tool.
• For the longitudinal direction, you will create the bending shape as
a freeform bar by defining individual points.
• For the transverse direction, you will use a predefined bending
shape that expands to adapt to the existing outline.
Tools: Objective:
Options
Bar Shape:
Freeform
Place Bar Shape
Along placing line
Copy and Mirror
Label
Dimension Line, Label
Bar Shape:
Open stirrup
Modify Placement
Display Mode

Engineering Tutorial Unit 4: reinforcement drawing 143
Start by defining the default settings.
To select drawing files and to define options
1 Click Open on a Project-Specific Basis on the Quick Access
Toolbar or double-click in the workspace.
2 Double-click drawing file 204.
3 Check the current reference scale (1:50) and unit of length (m) on
the status bar.
4 Switch to the Properties palette - Format area and define the
DEFAULT layer as the current one.
5 Use the Modify Section tool to hide the clipping paths from
the two sections.
6 Select Reinforcement drawing for the drawing type on the
status bar.
The hatching in the sections changes to fills.
Before you start, you must decide whether you want to create a 3D
reinforcement model (see Tip on page 142).
Tip: You can define how bar
In this exercise, you will work with the reinforcement model (method
reinforcement looks in the
1). This means that the reinforcement placed will be managed
Options. You can find
internally by the system and displayed in all the views and sections
more information in the
you create with the tools in the Sections task area.
Allplan Help.
For the reinforcement of the floor slab, which is 30 cm thick, you will
create two-way bar reinforcement of Ø12/10 cm in the top layer and
Ø10/10 cm in the bottom layer. The concrete cover is 4 cm.
The BR_GEN layer is proposed for bar reinforcement. You can use
this layer, as it is not necessary to differentiate between the upper
and lower reinforcement layers.
You will place the reinforcement on several layers when you create
the slab reinforcement in exercise 6.

1 44 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Start by creating the freeform bending shape of the open stirrup in
the longitudinal direction.
To enter the open stirrup as a freeform bending shape
1 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Reinforcement
page and check that the Reinforce with 3D model option is
selected in the General area. Open the Format page and select
line type 1 for the Leaders.
2 Click Bar Shape (Actionbar - Bar Reinforcement task area).
Check the Layers palette to see whether the BR_GEN layer is
selected. If it isn't, select it now.
Tip: Allplan also provides a The Bar Shape palette opens; the Freeform bending shape is
predefined bending shape selected by default. You can use it to create any bending shape.
for creating open stirrups. To use a different bending shape, click the button above the
You will use it later when graphic and select one of the predefined shapes.
you enter open stirrups in Click to open a dialog box that displays all the bending shapes
the transverse direction. graphically in groups.


## Sayfa 151

Engineering Tutorial Unit 4: reinforcement drawing 145
3 Go to the palette area with the parameters, select a diameter of
12 mm, enter 0.04 for the concrete cover and clear the Hook at
start and Hook at end check boxes.
4 To enter the open stirrup, click the points in section A-A as shown
in the illustration. The next step is to define the segment length.
A 1st point
B 2nd point
D C
C 3rd point
A B D 4th point
5 Select ESC to finish entering the open stirrup.
6 Go to the palette area with the parameters and enter 0.80 for the
length of the Initial segment and the Final segment.

1 46 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Note: You can still change almost all the parameters. The changes
are immediately visible in the preview.
7 Select ESC to finish entering the bending shape. As the Label
option was selected in the input options when you created the
bar shape, the Label tool starts automatically.
To finish entering the bending shape and to label the bar, right-
click in the workspace and select the Label tool on the
shortcut menu.
8 Make settings for the mark text in the palette.
Select the Options for text parameter and click , enter 1.00 for
the aspect and click OK to confirm.
9 Place the mark.
10 This defines the bending shape. If you want, you can continue and
immediately place the open stirrup you just created. However,
you can also select ESC and place the mark later by using the
Place Bar Shape or Special Placements tool.
In this exercise, you will place the mark now.

Engineering Tutorial Unit 4: reinforcement drawing 147
To place the open stirrup in edge-based mode
1 The palette of the Place Bar Shape tool is open and Linear
placement is selected.
If this is not so, right-click the open stirrup you want to place and
select Place Bar Shape on the shortcut menu.
2 Click the edges of the outline to define the placing area.
Placing line from point: Click the lower-right corner in plan view.
Placing line to point: Click the upper-right corner (see illustration).
Tip: The entries you make
are immediately visible in
the preview. So, you can
check the effects of your
settings at any time.
Symbols indicate the placing region.

1 48 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
In the input options, you can define the position of the placed bar,
specify how the placement looks and select automatic labeling.
Tip: Look in the Allplan Help
for information on the
reinforcement methods and
the align, move, and rotate
options for the placing 3 Select the Align option and select the Show middle bar only
mode: placement display mode.
Align uses the spatial orientation and position of the identified
mark to place the reinforcement in alignment (see Tip).
4 Go to the parameter area of the Place Bar Shape palette and
enter 0.04 for the concrete cover and 0.10 for the spacing. You
can leave the other settings as they are.
5 Click Dimension Line, Label on the shortcut menu.
As an alternative, select ESC twice to close the tool and to start
the Dimension Line, Label tool.
6 Make settings for the dimension lines in the palette.

Engineering Tutorial Unit 4: reinforcement drawing 149
7 Select the Dimension line options line and click . The
Dimension Line dialog box opens. Check that the layer BR_GEN is
selected. Change the aspect to 1.00.
8 Click OK to confirm the Dimension Line dialog box and click a
point through which the dimension line is to pass.
The palette switches to the Text/leader tab, where you can
define the label for the placement.
9 Specify the parameters as shown, select the Options for text line
and click , enter 1.00 for the aspect and click OK to confirm.

1 50 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Note: If Automatic mark number is selected in the input options,
the program creates the mark number at the beginning or end of
the label, depending on the drop-in point specified. Check this by
selecting this option and moving the crosshairs over the
workspace.
10 Place the label and select ESC to close the tool.
Note: When you click Zoom All, you can see that Allplan has
created the reinforcement in the sections plus a reinforcement
model of the 3D elevator shaft.
To hide the model data, use to define a section and click to
save this section.
This was described in unit 2 when you created the architectural floor
plan.

Engineering Tutorial Unit 4: reinforcement drawing 151
Displaying and labeling placements
When placing reinforcement, you can specify the placement display
mode in the input options or in the dialog box:
Shows all the bars.
Shows only the bar in the middle.
You can select the bars you want to display.
Shows a single bar as folded. This helps you define the exact
position of the bar, which is required for placing the bar on the
building site. You can select the folding direction you want to
use.
You can use the Modify Placement Display Mode tool to change
the display mode later.
Labels can be placed at any time. The Bar Reinforcement task area
provides the following tools for creating labels at a later stage:
Label
Dimension Line, Label
Reinforcement placed is visible in all the views and sections. During
creation, however, reinforcement can be labeled in the placing view
only. You must place labels in all the other views and sections later.
Instead of placing the bar again on the opposite side, it is easier to
mirror mark 1. You can then label the reinforcement.
To copy and mirror the placed reinforcement
Tip: To select general edit
1 Click Copy and Mirror (Actionbar - Edit task area - flyout
tools, you can also right-
menu of the Mirror without Copy tool).
click in the workspace and
select a tool on the shortcut 2 Click the bar in the section.
menu.
3 Define the mirror axis:
Click point 1 of mirror axis: Right-click a horizontal line of the floor
slab in the transverse section and click Midpoint on the
shortcut menu. Make sure that you do not click the midpoint of
the line or any other existing point.

1 52 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
2nd point of mirror axis: Go to the dialog line, enter a value that is
Tip: Track tracing helps you
not zero for the
define the 2nd point of the
mirror axis. You can select y-coordinate and select the Enter key to confirm.
the F11 key or click the
4 Select ESC to close the tool.
Track line icon in the dialog
line to turn track tracing on 5 Right-click the bar in the section and select Label on the
and off. shortcut menu.
6 Define the text parameters so that only the Mark number is
visible. Place the mark number in the workspace and select ESC
to close the tool.
5 3 2
6
7 As the sections are linked, the mirrored placement is also visible in
the floor plan. To label the placement, right-click the bar in the
floor plan and select Dimension Line, Label on the shortcut
menu.
8 Place the dimension line and the label to the left of the floor plan
and select ESC to close the tool.
7
8

|  |  |  |
| --- | --- | --- |


Engineering Tutorial Unit 4: reinforcement drawing 153
As an alternative, you will now use a predefined, expanding bending
shape to create the edge reinforcement in the transverse direction.
Finally, you will place the bending shape automatically.
To create an expanding open stirrup and place it
automatically
1 Click Bar Shape again (Actionbar - Bar Reinforcement task
area).
2 Select the Open stirrup bending shape in the list box at the top of
the Bar Shape palette.
3 Go to the palette area with the parameters, select a diameter of
12 mm and clear the Same concrete covers check box, because
these bars are in the second layer. Change the values for
Concrete cover 1 and Concrete cover 3 to 0.055 each and the
value for Concrete cover 2 to 0.04.

1 54 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
4 Enter 0.80 for Segment length 1 and Segment length 3 and clear
the Hook check box.
5 In section B-B, point to the lower-right edge of the floor slab until
the open stirrup expands correctly, then click.
5
6 Select ESC and place the label for the bar in the section.
7 Select the Place automatically option in the input options.
By using automatic depth placement, Allplan immediately places
the bar in the floor plan of the floor slab.

|  |  |
| --- | --- |



## Sayfa 161

Engineering Tutorial Unit 4: reinforcement drawing 155
Note: Automatic depth placement is only possible when you
create the bending shape in a 3D outline and place it immediately
afterward.
In this case, you cannot define the placement display mode: all
the bars are always visible.
8 Click Dimension Line, Label in the Repeat drop-down list
on the Quick Access Toolbar, click a bar in the placement you just
created and place the dimension line and the label.
9 To copy these bars to the lower part of the floor plan, click
Copy and Mirror ( Repeat drop--down list) and select the
placement as an entity group in plan.
10 Click point 1 of mirror axis: Right-click a vertical line of the floor
slab in plan and select Midpoint on the shortcut menu.
11 2nd point of mirror axis: Go to the dialog line, enter a value that is
not zero for the
x-coordinate and select the Enter key to confirm. Select ESC.
12 Right-click one of the placements in plan, select Modify
Placement Display Mode on the shortcut menu and select
Show middle bar only for both placements.
13 Use the shortcut menu and the Label and Dimension Line,
Label tools to create labels for the bottom placement in the
section and in plan.

1 56 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022

Engineering Tutorial Unit 4: reinforcement drawing 157
Task 3: area reinforcement of the floor slab
The edge reinforcement of the floor slab has been placed. The
following part of the exercise involves creating area reinforcement.
Tools: Objective:
Enter
Area Reinforcement
Span Reinforcement
New Mark Number
Modify Mark
Modify Placement
Display Mode
You will start by creating two-way bar reinforcement.
To create span reinforcement for the bottom layer
1 Click Enter Area Reinforcement (Actionbar - Bar
Reinforcement task area) and check the Properties palette -
Format area to see whether the BR_GEN layer is selected. If it
isn’t, select it now.
2 Click Span Reinforcement on the Enter Area Reinforcement
Context toolbar.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |


1 58 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
3 From point, element or offset: Click the lower-left corner in the
floor plan.
4 To point, element or offset: Enter -0.04 for the support depth in
the dialog line.
Entering a negative value moves the placing polygon toward the
inside.
5 Click the upper-right corner of the floor plan.
5
3
6 Select ESC to finish. This selects the area.
7 Define the layer depth: Change the Component thickness to
0.30 and click in the box to the right of Layer depth.

Engineering Tutorial Unit 4: reinforcement drawing 159
8 Layer in reference view or layer depth: Click the lower-left point
in section B-B.
8
The dashed line indicates the current layer depth of the
reinforcement, considering the concrete cover. The elevation
symbol shows the layer depth of the definition point entered. The
direction of the positive bar segments and the placing direction of
the bar are indicated by the arrow.
9 Click Concrete Cover (Bottom) and enter 0.04. When you look
at section B-B, you can see how the dashed line moves.
10 Click OK to confirm the entries.
11 Define placing parameters:
Diameter 10 mm
Spacing 0.10
Angle 0.00
Equal offsets to edge
Select PP (= place in polygon) in the lower-right area.
The bars and the edge reinforcement are congruent in the floor
plan. Therefore, select Show selected bars for the placement
display mode to ensure that the bars do not hide the edge
reinforcement.

1 60 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
12 Click OK to confirm.
13 Select the bar you want to display: The preview displays all bars in
the selection color. Click a bar in the upper part and select ESC.
14 Select the Bar markers option, specify the symbol type and place
the dimension line.
15 Select the Custom text parameter, type in bottom in the line for
defining text and place the label.
16 Next, you will place the transverse reinforcement. You do not
need to enter the placing polygon again. You can copy the one
you used for the longitudinal reinforcement. Click Match in the
input options.
17 Select the polygon you want to match: Click the existing polygon.
18 The system will automatically propose 0.050 for the concrete
cover at bottom. Increase this value to 0.055 (this is to take the
bar ribs into account) and click OK to confirm.
19 The system will automatically propose 90 degrees for the placing
angle. Check the settings and click OK to confirm.
20 Select a bar and place the dimension line and the label to which
you have added custom text.

Engineering Tutorial Unit 4: reinforcement drawing 161
The bottom layer now looks like this:
Now that you have completed the bottom layer, you can create the
bars for the top layer yourself. The following section briefly describes
how to do this.
To create span reinforcement for the top layer
1 The Span Reinforcement tool is still open. If it isn’t, select it
again.
2 Match the existing placing polygon.
3 To define the Layer depth, click the upper-left point of the
floor slab in section B-B and enter 0.00 for the Component
thickness.
4 Click Concrete Cover (Top) and enter 0.04.
5 Confirm the settings and enter a placing angle of 0.00 degrees.
6 Change the diameter to 12 mm in the dialog line. Then confirm.
7 Select a bar and place the dimension line and the label to which
you have added custom text (here: "top").

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |


1 62 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
8 Use the same approach to create the second reinforcement layer
at the top. Bear in mind that you must associate the layer depth
with the top level and click Concrete Cover (Top) after you have
copied the placing polygon. Here, too, change the diameter to
12 mm.
The floor slab now looks like this:
Instead of creating the top layer from scratch, you can copy and
mirror the bottom reinforcement.
As the diameter of the top bars is 12 mm, you must assign new mark
numbers to the bars of the mirrored reinforcement. To do this, use
the New Mark Number tool (Actionbar - Bar Reinforcement
task area).
You can then change the diameter by using the Modify Mark tool,
select the bars you want to display by using the Modify
Placement Display Mode tool and label the placements.

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |


Engineering Tutorial Unit 4: reinforcement drawing 163
Task 4: starter bars
The reinforcement for the floor slab is complete. However, the wall
reinforcement is still missing. This part of the exercise involves
placing the starter bars.
Tools: Objective:
Bar Shape:
Open stirrup
Stirrup, closed
Modify Placement
Display Mode
Place Bar Shape
Along placing line
Dimension Line, Label

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |


1 64 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
To enter and place starter bars
1 Use the right mouse button to double-click the open stirrups of
the floor slab.
This selects the Bar Shape tool with the Open stirrup bending
shape. The diameter is 12 mm.
2 Check the Layers palette to see whether the BR_GEN layer is
selected. If it isn't, select it now.
3 Go to the palette area with the parameters, select the Same
concrete covers check box, enter 0.04 for Concrete cover and
1.00 for Segment length 1 and Segment length 3.


## Sayfa 171

Engineering Tutorial Unit 4: reinforcement drawing 165
4 In section A-A, point to the left outer edge of the wall until the
open stirrup expands correctly; then click.
4
5 Select ESC to label the bar.
6 Place the bar label in the section.
Place automatically is still selected in the input options. As
you can see, the open stirrups are placed across the entire shaft
wall on the left side in the floor plan.
If they aren't, click New placing line in the palette area with the
parameters and define the placing line accordingly.

|  |  |  |
| --- | --- | --- |
|  |  |  |


1 66 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
7 Select Dimension Line, Label in the Repeat drop-down list,
click a bar in the placement that you just created in plan, turn off
the Bar markers option, and place the dimension line.
8 Turn off the Custom text option and place the label.
9 Select ESC to close the tool, right-click the placement in plan, and
select Modify Placement Display Mode on the shortcut
menu.
10 Choose Show selected bars, click the three bars just below
the middle (see following illustration), and select ESC twice.
The floor plan of the floor slab should now look like this:

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |


Engineering Tutorial Unit 4: reinforcement drawing 167
Next, you will place mark 7 in more walls.
Remember: You inserted a door opening in the right wall when you
created the floor plan of the basement. In this region, you will not
place mark 7 but use closed stirrups instead. You will define the
placing region for mark 7 in the floor plan of the shaft walls. The
placed bars, however, will be visible only in the floor plan of the floor
slab, as the starter bars are not within in the clipping area of the shaft
walls.
To place and rotate starter bars
1 Click Place Bar Shape (Actionbar - Bar Reinforcement task
area) and confirm the mark in the dialog line: mark 7.
2 Turn off the Align option in the input options.
3 Place mark 7 in the lower transverse wall (from left to right). To
define the end points of the placing line, click the points where the
inside edges of the longitudinal walls and the outer edge of the
bottom wall intersect (use Point of Intersection on the
shortcut menu).
3 3

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  | 3 |  |  |


1 68 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Tip: The sequence in which 4 Go to the palette area with the parameters and select
you enter the points of the Perpendicular for the Rotation angle. The preview of the bending
placing line is irrelevant for shape changes accordingly.
an aligned placement. But
when you create a moved
or rotated placement, the
sequence in which you
enter the points defines the
direction of the placing
region.
5 In the input options, click Show selected bars, select the bars
Look in the Allplan Help for you want to display and select ESC.
information on the
reinforcement methods and
6 Right-click in the workspace and choose Dimension Line,
the align, move, and rotate Label. Place the dimension line and the label in the floor plan and
options for the placing select ESC to close the tool.
mode:
7 Use the Copy and Mirror tool to copy the reinforcement and
its label to the transverse wall at the top. (Alternative: Use the
same Rotation angle and place the bars in the transverse wall at
the top.)
8 Click Place Bar Shape again and confirm the mark in the dialog
line: mark 7.
The Align option is not selected; Perpendicular is selected for the
rotation angle.
9 Placing line from point: Click the lower-right outer corner of the
30-cm shaft wall in the floor plan of the shaft walls.
10 Placing line to point: Click the point where the lower reveal and
the 30-cm shaft wall intersect.

Engineering Tutorial Unit 4: reinforcement drawing 169
Allplan highlights the placing region in the floor plan of the shaft
walls and displays the placement in the floor plan of the floor slab.
As the starter bars for the wall are not within the clipping area of
the shaft walls, all the bars are visible, regardless of the selected
display mode.
11 Select ESC to finish.
12 Use the same approach to place the starter bars above the door
opening. To define the first point of the placing line, click the point
where the upper reveal and the 30-cm shaft wall intersect. To
define the second point of the placing line, click the upper-right
outer corner of the 30-cm shaft wall.
13 Select Dimension Line, Label in the Repeat drop-down list,
click a bar in the placement you just created in the floor plan of the
floor slab and place the dimension line and the label.
14 Create the dimension line and the label for the second placement
and select ESC to close the tool.
15 Right-click one of the placements in the floor plan of the floor
slab, click Modify Placement Display Mode on the shortcut
menu and select Show middle bar only.
16 Allplan changes the look of the placement clicked. Click the
second placement too. Then select ESC to close the tool.

1 70 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
You will now create and place a closed stirrup in the wall near the
door opening.
To create and place a closed stirrup in the door area
1 Open the Repeat drop-down list and click Bar Shape.
Check the Layers palette to see whether the BR_GEN layer is
selected. If it isn't, select it now.
2 Select the Stirrup, closed bending shape in the list box at the top
of the Bar Shape palette.
3 Go to the palette area with the parameters, select a diameter of
12 mm and enter 0.04 for the concrete cover.
4 Go to section A-A and hover over the left outer edge of the right
wall until the open stirrup expands correctly; then click.
5 Select ESC and place the label for the bar in the section.
6 Here, automatic depth placement is not useful, as you will place
the stirrups only around the door opening. Therefore, turn off the
Place automatically option in the input options. The Align
option is selected.
7 Define the placing line by clicking a corner of the upper reveal in
the floor plan of the shaft walls and then the corresponding
corner of the lower reveal.
8 Click Dimension Line, Label in the Repeat drop-down list
and create dimension lines and labels for the placements in the
floor plans.

Engineering Tutorial Unit 4: reinforcement drawing 171
9 Click Modify Placement Display Mode in the Repeat drop-
down list, select Show middle bar only and click the
placement in the floor plan of the floor slab.
10 Select ESC to close the tool.
This completes the starter bars for the walls.

1 72 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Task 5: bar reinforcement for the walls
In the following part of the exercise, you will reinforce the walls as far
as the top level of the floor slab (TL = -2.79). You will enter the
reinforcement in the floor plan of the shaft walls.
Tools: Objective:
Bar Shape:
Freeform
Straight bar
L-shaped bar
Place Bar Shape
Along placing line
Modify Clipping Path
Extrude Bars Along Path
Reinforcement Tools
Tip: If you want to generate Due to the wall offset, you must create a cranked bar for the exterior
complex bending shapes wall reinforcement. You will create this bar manually with the
(for example, bent-up bars
Freeform bending shape of the Bar Shape tool.
for silos, towers or barrel
roofs), you can convert a
To manually enter and place cranked bars
bending shape that was
created with the tools in the 1 Select the Bar Shape tool again and select Freeform.
2D Objects task area to a Check the Layers palette to see whether the BR_GEN layer is
bar. To do this, use the selected. If it isn't, select it now.
Convert, Match Elements
2 Clear the Same concrete covers check box and enter 0.00 for
tool.
Concrete cover at start and Concrete cover at end.
When converting, Allplan
interprets the design 3 Click the arrow to the left of the Segment parameter and enter
entities as the center line of 0.04 for Concrete cover of segment.
the bar. Bear this in mind
4 Click the two outside corners of the upper-left wall in section
when you create the design
B-B. Start at the top.
entities.

Engineering Tutorial Unit 4: reinforcement drawing 173
Tip: You can also define the 5 Go to the palette area with the parameters, change the Segment
segment type in the graphic. type to Crank and click the point where the shaft wall and the
upper floor slab intersect.
6 The segment type automatically switches back to Default. To
define the last point, click the point where the shaft wall and the
lower floor slab intersect.
Make sure that the preview of the segment is within the wall. To
achieve this, you must approach the point from the outside.
7 Select ESC to finish entering the bending shape. Enter 0.95 for
the length of the Initial segment and 1.10 for the length of the
Final segment.
Note: To check or change the crank, select the Segment
parameter, click to select the segment 2/3 and then click
beside Crank value.
8 Select ESC and place the label for the bar in the section.

1 74 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
A
B
A 1st point
C
B 2nd point
C 3rd point
D D 4th point
9 In this example, automatic depth placement would not be
created where you need it. Therefore, do not change the setting
of the Place automatically option in the input options (it is not
selected!) and define the placing line in the floor plan of the shaft
walls:
• Placing line from point: Click the lower-left outside corner of
the 30-cm shaft wall.
• Placing line to point: Click the lower-right outside corner of the
30-cm shaft wall.
10 Clear the Same concrete covers check box in the palette area
with the parameters. Taking the wall offset of 6 cm into account,
enter 0.10 for Concrete cover at start and Concrete cover at
end.
11 Select Show all bars in the input options. Open the shortcut
menu and select the Dimension Line, Label tool.
12 Create the dimension line and label for the placement in the floor
plan of the shaft walls. The result should now look like this:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |



## Sayfa 181

Engineering Tutorial Unit 4: reinforcement drawing 175
Tip: After you have defined 13 Place this mark in the floor plan of the shaft walls (not in the area
the placing region, switch to near the door!) and apply labels. To select the bar you want to
isometric view to check place, always click the bar shape in section B-B. Note that the
whether you have placed concrete cover of the placement beside the reveal of the door is
the cranked bar correctly. If 0.04 instead of 0.10.
the position of the bar is not Turn off the Align option and select Perpendicular for the
correct, rotate the bar by rotation angle.
selecting
Perpendicular+180° for the
rotation angle.
14 To ensure that the wall reinforcement, which protrudes above
the clipping area defined, is visible in its entirety, you will now
modify the upper section border in the two sections. Go to the
reinforcement model to the left of the sections. Double-click the
clipping path of section B-B in the reinforcement model to open
the Modify Clipping Path tool. Change the Top level to –
1.7900 and Close the palette to confirm the change. Use the
same approach to change the top level of section A-A.

|  |  |  |
| --- | --- | --- |
|  |  |  |
|  |  |  |
|  |  |  |


|  |  |
| --- | --- |


1 76 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
To complete the vertical wall reinforcement, you will create and place
a straight bar. In addition, you will insert an L-shaped bar in the upper
floor slab.
To enter a straight bar and an L-shaped bar and to
place them together
1 Open drawing file 201 (or 203) in reference mode. Open the
Repeat drop-down list, click Bar Shape and select the
Straight bar bending shape.
Check the Layers palette to see whether the BR_GEN layer is
selected. If it isn't, select it now.
2 Turn off the Expand to adapt to edges option in the input
options.
3 Select diameter 12 mm, turn off the Same concrete covers
option, change Concrete cover 1 to 0.04 and change Concrete
cover at start and Concrete cover at end to 0.00.
4 To define the starting point, click the corner of the left inside edge
of the shaft wall (see figure) in section B-B.
5 Enter 0.00 for the x-coordinate in the dialog line and 2.40 for
the y-coordinate. Select the Enter key to confirm.
6 This creates the bar with the mark number 10. Select ESC and
place the label for the bar in the section.
7 Select ESC, as you do not want to place the bar now.
8 The Bar Shape tool is still open. Select the L-shaped bar
bending shape.
9 Here, too, click the corner of the left inside edge of the shaft wall
in section B-B to define the starting point.
10 To define the other points, click the point where the inside edge of
the shaft wall and the top level of the upper floor slab intersect
and then click the upper-left end point of the floor slab.
11 Select diameter 12 mm, change Concrete cover to 0.04 and
enter 1.00 for segment lengths 1 and 2.

Engineering Tutorial Unit 4: reinforcement drawing 177
12 Select ESC and place the label for the bar in the section. Then
select ESC twice to stop placing the bar and to close the tool.
13 Click Front Right, Southeast Isometric View on the viewport
toolbar, open the Layers palette and switch the BR_GEN layer to
Hidden, frozen.
14 Select the Modeling task on the Actionbar and click 3D Line
(3D Objects task area). Create a 3D polyline along the inside
edges of the shaft wall at the height of the upper floor slab.
Finally, select ESC to close the tool.
15 Change the layer BR_GEN back to Modifiable and click Plan
on the viewport toolbar.

1 78 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
16 Right-click any bar and select Extrude Bars Along Path on
the shortcut menu.
17 Select reinforcing bars to extrude: Go to section B-B and select
marks 10 and 11 by means of the Brackets (Actionbar - Work
Environment task area).
18 Element for path: Click the 3D polyline you just created.
Allplan displays the placement in the reinforcement model and in
all sections.
19 Go to the Extrude Bars Along Path palette and select 0.00 for
the concrete cover and 0.015 for the bar spacing.
You can leave the other settings as they are. As you do not place
longitudinal reinforcement, you can ignore the parameters in this
region.
20 Select ESC to create the placement.

Engineering Tutorial Unit 4: reinforcement drawing 179
21 L-shaped bars are required near the door. Therefore, Delete
(Actionbar - Edit task area) the straight bars (mark 10) placed on
the inside.
To do this, enclose the bars in a selection rectangle you open from
left to right (if the Select elements based on direction setting
is selected) or select the Fully bounded selection option on
the Actionbar - Work Environment task area.
22 Right-click an L-shaped bar placed, select Modify Placement
Display Mode on the shortcut menu and click Show middle
bar only in the input options.
23 Click all the L-shaped bars placed and select ESC.
24 Use the Dimension Line, Label tool on the shortcut menu to
label marks 10 and 11 as shown in the illustration.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |


1 80 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
The floor plan of the floor slab also includes marks 9 and 10. You will
now hide the wall reinforcement in this area.
To hide reinforcement placed
1 Select the Reinforcement task on the Actionbar and click
Reinforcement Tools (Bar Reinforcement task area -
Modify Placement Display Mode flyout menu).
Tip: Click to show 2 Click Hide V (hides selected reinforcement in one view).
hidden reinforcement again.
3 In the floor plan of the floor slab, click all the bars of the wall
reinforcement you want to hide.
Next, you will create horizontal bars as straight bars. They will be
entered in the floor plan of the shaft walls and placed in the sections.
To create and place horizontal bars for the transverse
reinforcement
1 Double-click a mark (10, for example) in the floor plan of the shaft
walls with the right mouse button to open the Bar Shape tool.
Select the Straight bar bending shape.
2 Change the value for Concrete cover 1 to 0.055, as the bar is to
be within the transverse reinforcement.

Engineering Tutorial Unit 4: reinforcement drawing 181
3 Start at the top and click the inside corners of the right shaft wall
in the floor plan of the shaft walls. The bar is visible in the preview.
Select ESC and place the label for the bar.
4 Place the bar in section A-A. Place automatically is not
selected in the input options.
Select the Align option and the Show all bars option.
5 Click the upper and lower wall corners on the right side. Go to the
palette area with the parameters and enter 0.055 for Concrete
cover at start and 0.02 for Concrete cover at end.
6 Select ESC twice to close the tool and to start the Dimension
Line, Label tool.
7 Select a different dimension line for the label of mark 12: Select
the Fan dimension line type in the Bar Label palette.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  | 3 |  |  |  |
|  |  |  |  | 3 |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  | 3 |  |  |  |  |  |
|  |  |  |  |  |  |  |


1 82 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
8 Define the parameters so that the number of pieces, diameter
and spacing are included and change the setting for the text
leader to Manual.
9 Select the Options for text parameter and click , enter 1.00 for
the aspect and click OK to confirm.
10 Place the label and click all the bars to which leaders are to be
drawn.

Engineering Tutorial Unit 4: reinforcement drawing 183
11 Select ESC twice to close the tool.
5
5
12 You can now place mark 12 along the other vertical bars or you
can copy and mirror the placement:
Tip: If you consider the
spacing between the mark
border and label to be too
large, open the Options -
Reinforcement - Labels
page and change the space
after the mark to "0" (in the
preview for Bar
reinforcement at the top of
the page).
13 Now use the same procedure to create horizontal reinforcement
for the transverse side. To enter the bending shape, select
Expand to adapt to edges in the input options. Define a new
placing line in the area of the shaft wall in section B-B. The starting
point of this new placing line is at the top and the end point at the
bottom. Finally, hide the transverse reinforcement in the floor
plan of the floor slab.

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |


|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |


1 84 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Next, you will complete the labels in the sections and floor plans.
Start with section A-A.
To label reinforcing bar placements later
Tip: If you want to modify an 1 Right-click mark 3 (lower longitudinal reinforcement in the floor
existing label, click it and slab) in section A-A and select Label on the shortcut menu.
open the Properties palette.
2 Select the Diameter and Spacing parameters and place the label.
Change the settings in the
Automatic is selected to the text leaders. As Automatic mark
palette area with the
number is selected in the input options, the program places the
parameters and click in the
mark number at the beginning or end depending on the position of
workspace to finish.
the label. If you want, you can turn off this option.
3 Click mark 5, check the settings, place the label and select ESC.
4 Right-click mark 4 and select Dimension Line, Label on the
shortcut menu.
The Fan dimension line type is selected from the label of the
horizontal reinforcement. In addition, Manual is selected for the
text leaders.
5 Turn off the Number of pieces parameter and place the label.
6 Click all the bars that are to get leaders.
7 Select ESC to finish placing leaders.


## Sayfa 191

Engineering Tutorial Unit 4: reinforcement drawing 185
8 Click mark 6, check the settings and place the label.
9 Click all the bars that are to get leaders and select ESC to finish.
10 Click Label in the Repeat drop-down list and label marks 9,
10 and 11. Turn off the Diameter and Spacing parameters.
Automatic is selected to the text leaders.

1 86 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
11 Now create the labels for section B-B as shown in the illustration:

Engineering Tutorial Unit 4: reinforcement drawing 187
12 Complete the labels in the floor plan of the shaft walls as shown in
the illustration:

1 88 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Now you have reinforced the elevator shaft except the horizontal
corner reinforcement, which you will display with a PythonPart.
Finally, you will define the clipping area of the shaft walls.
To modify the clipping area
1 Right-click the view border in the floor plan of the shaft walls and
select Modify Section on the shortcut menu.
2 The Modify Section palette opens. In the Representation area,
select the Show clipping path option and apply the change by
clicking Apply and Close.
3 Double-click the visible clipping path and change the Top level of
the section object to
-3.1000 and the Bottom level to -3.4000.
4 To confirm the changes, Close the palette. Then, open the
Show Clipping Path tool and hide the clipping path.

Engineering Tutorial Unit 4: reinforcement drawing 189
Task 6: standard section
In this part of the exercise, you will learn how to place PythonParts
with reinforcement.
Tools: Objective:
Library
Move
Modify Format
Properties
Modify Number Off
Factors
By using PythonParts, you assign placement quantities to the
reinforcement without having to place the bars in a specific region.
Consequently, you can display the reinforcement in a view only.
This placing mode is useful for displaying standard details. The three-
dimensional reinforcement component ensures that the bar lengths
and quantities will be managed automatically.
To create a standard section with a three-dimensional
PythonPart
 Drawing file 204 is current; drawing file 201 (or 203) is open in
reference mode.
1 Use the tools in the Design and Label tasks (for example, Quick
Access task area of the Reinforcement task) to draw a wall
corner to the right of the floor plan of the shaft walls. Label this
standard section and select style area 301 Reinforced concrete
(see following illustration).

1 90 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
2 Open the Layers palette and switch the BR_GEN layer to
Hidden, frozen. This helps you place the PythonPart within the
model data.
3 In the Library palette, open the Default, PythonParts, and
FormFinder Components folders.
4 Double-click the Wall corner expanding PythonPart.
5 Check the Modeling tab to make sure that the Save as a
PythonPart option is selected.
Do not change the other settings on this tab or on the Design tab.

Engineering Tutorial Unit 4: reinforcement drawing 191
6 Open the Select shape tab and select Shape 2.

1 92 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
7 Switch to the Wall corner reinforcement tab, enter 0.055 for the
global concrete cover, and change the concrete cover at the
bottom to 0.020.
Do not change the other values or the global bar diameter.
8 Check the concrete covers and the bar diameter for Wall I and
Wall II. Enter 0.80 for the lateral lengths at start and end. In
addition, select the Spacing option for the Distribution and enter
0.10.

Engineering Tutorial Unit 4: reinforcement drawing 193
9 To define the longitudinal bars, which are used for assembly only,
change the bar diameter to 8 and the concrete covers at top and
bottom to 0.040. Do not change the projection at top or bottom.

1 94 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
10 Go to the 3D model of the elevator shaft and point to the outer
edge of the shaft wall at the bottom. Wait until the reinforcement
of the wall corner automatically fits into the lower-left corner.
Then, click.
11 Go to the 3D model of the elevator shaft and click the middle
Point handle in the wall corner.
Before you click this point handle, have a look at the sections A-A
and B-B and check whether the upper-left Point handle has an
arrow that points up. As an alternative, you can also select the
required Point handle in any isometric view.
12 Click Front, South Elevation on the viewport toolbar. Point to
the top level of the floor slab and click.
13 Select ESC to finish creating the PythonPart and select Plan
view on the viewport toolbar.
14 Move the PythonPart into the 2D design you created to the
right of the floor plan of the shaft walls. Open the Layers palette
and change the BR_GEN layer back to Modifiable.
Tip: When rearranging 15 Select Rearrange Marks (Bar Reinforcement task area) and
reinforcing bar marks, enter mark number 14 for From #. Click OK to assign the same
Allplan uses the Tolerance mark numbers to the open stirrups and the longitudinal bars.
to compare segment
16 Click Modify Format Properties (Actionbar - Change task
lengths.
area), click the Layer button, and select the BR_GEN layer.


## Sayfa 201

Engineering Tutorial Unit 4: reinforcement drawing 195
17 Click OK to confirm the dialog box and select the entire standard
section including its label. Then, select ESC to close the tool.
18 As the wall corner exists four times, click Modify Number Off
Factors (Actionbar - Bar Reinforcement task area).
19 Select placed reinforcement to modify piece factor Select the
entire reinforcement of the standard section, enter 4 for the
Component factor, and click OK to confirm.
20 Open the Repeat drop-down list, click Dimension Line,
Label, and label the horizontal bars (mark 15) by enclosing them in
a selection rectangle. Select Number of pieces and Diameter for
the label parameters and Automatic for the text leaders.
21 In addition, label the open stirrups by selecting the Number of
pieces, Diameter, and Spacing parameters.

1 96 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Task 7: bar schema
The following part of the exercise involves creating bar schemas.
You will create full schemas to scale and place them beside the
design.
Tools: Objective:
Full Schema
The partial and full schema tools provide a way of displaying the
internal number-off and bending shape management in the
reinforcement drawing. You can place a schema bar and label for
every mark in the drawing file. The program updates the schema
automatically to reflect any changes you make to the placed
reinforcement or bending shapes.
There are two types of schema:
• Full Schema
Number off information on all the placements of a mark
• Partial Schema
Number off information on one placement of a mark
The bending shape can be drawn to scale or not. You can align the
bending shape with the placement.

Engineering Tutorial Unit 4: reinforcement drawing 197
To create a full schema
1 Click Full Schema (Actionbar - Bar Reinforcement task area).
2 Select Meshes or Rebars in the input options and enter the
number of the mark of which you want to create a full schema. As
an alternative, click the mark or placement.
Tip: If you have deleted a
bar, the bar’s mark number
will remain ‘unassigned’.
You can use Rearrange
Marks to close this "gap".
3 Enter the settings as shown in the illustration.
4 The schema and its label are attached to the crosshairs.
You can use the Rotate and Mirror options to specify how
the bars are positioned. Place the schema to the right of the
sections.
5 Create the other bar schemas yourself. For straight bars, you can
turn off Segment dimensioning. Define the text angle so that
it matches the position of the bar shape.
Tip: If you consider the
spacing between the
diameter and length to be
too small, open the
Options – Reinforce-
ment - Labels page and
insert a space in front of the
length ("L=" in the preview
for Bar reinforcement at
the top of the page).

1 98 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
Task 8: reinforcement schedule and bending schedule
The last part of this exercise involves creating a reinforcement
schedule and a bending schedule.
Tools: Objective:
Reinforcement Reports
Reinforcing Bar Legend
While you are working, the program creates reinforcement
schedules in the background. They are always up to date. You can
also print them whenever you need.
Start by printing the bar reinforcement schedule, which Allplan 2022
has created automatically in the background.
To output a bar reinforcement schedule
1 Click Reinforcement Reports (Actionbar - Bar
Reinforcement task area).
2 Allplan opens the Reports dialog box, where you can select
predefined reports.
Click the Default folder on the left side and select the
Reinforcement schedule - bending shapes report.

Engineering Tutorial Unit 4: reinforcement drawing 199
Tip: Parameters relevant to
marks (like number off
value, steel grade, diameter,
and individual length) are
saved for reports.
You can create reports both
in document edit mode and
in layout edit mode.
3 Click All in the input options.
Tip: Click the dimensioned
The report appears in Report Viewer. Some attributes, such as
bending shapes in Report
the project, will be used automatically.
Viewer - Print Preview
to modify them in the 4 Enter Elevator shaft - reinforcement drawing for the Layout
workspace. parameter. When you work in layout edit mode, the program
automatically takes this attribute from the layout name.

2 00 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
5 Clear the Show steel grade check box because there is only one
steel grade in the layout.
6 Click Print, select the printer and start printing.
Note: Allplan 2022 offers the possibility to place a bending schedule
on the plan. To print a bending schedule, you can use the
Reinforcement schedule - bending shapes report in the
Reinforcement Reports tool.
The following steps show you how to place the bending schedule in
the drawing file.
To place the bending schedule in the drawing file
1 Click Reinforcing Bar Legend (Actionbar - Bar
Reinforcement task area - Reinforcement Reports flyout
menu).
2 Select the required legend.

Engineering Tutorial Unit 4: reinforcement drawing 201
3 Select the Associative legend of active document option and
click OK to confirm the Legend selection dialog box.
4 The legend is to consider the reinforcement of the current
drawing file only, regardless of the drawing files selected.
Therefore, go to the Filter area in the Properties palette and click
the Set... button next to Drawing files.
5 In the Select drawing file dialog box, click Select drawing files
currently loaded in the upper left corner, deselect the passively
loaded drawing file 201 (or 203) and confirm the dialog box with
OK.
6 The Update automatically option is selected. Do not change this.
Consequently, Allplan automatically updates the bending
schedule when you add or delete marks later.
Note: The Format area
displays the current format
properties. They do not
affect the legend.

2 02 Exercise 4: 3D elevator shaft with a 3D model (method 1) Allplan 2022
7 Place the bending schedule in the workspace.
A section of the cutting diagram looks like this:
Note: The elements of the 8 Go to the Properties palette - Format area and make the
drawing files selected via DEFAULT layer current.
the filter are included in the
legend even if these
drawing files are not
selected.
The output of a plan on the printer is described in 9: "Exercise plan
compilation and plan output".

Engineering Tutorial Unit 4: reinforcement drawing 203
Exercise 5: 2D door lintel with a 3D model
(method 2)
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the Reinforcement task of the Engineering role
contains the Bar Reinforcement and Sections task areas.
Check the Actionbar to see whether the program contains the
following tools:
Bar Shape
In exercise 4, you reinforced a 3D general arrangement drawing and
created a 3D model (method 1, see Tip).
In the following exercise, you will create a precast element of a
Tip: Look in the Allplan Help
reinforced door lintel as a symbol. You will reinforce a 2D general
for information on the
arrangement drawing and create a 3D model at the same time
reinforcement methods and
(method 2, see Tip). To do this, you will use an auxiliary 3D solid.
the 3D reinforcement
model: This approach is particularly useful with complex components you do
not want to model in detail.
Start by selecting fileset 3 with the following drawing files:
Fileset Drawing Drawing file name
file number
3 301 2D general arrangement
302 Bar reinforcement with 3D model
303 Modified door lintel
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 3 | 301
302
303 | 2D general arrangement
Bar reinforcement with 3D model
Modified door lintel |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


2 04 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
Task 1: designing a reinforced door lintel
First, you will use the tools in the Design task to create an elevation
and a section as the general arrangement drawing for a precast door
lintel. So that you can create the reinforcement with a 3D model, you
need an additional 3D solid that is parallel to the coordinate planes
and that has the dimensions of the precast element. To do this, you
will use the Box tool. Based on this auxiliary 3D solid, you will then
create an auto-updating view and place this view so that the 2D
section and this view are congruent.
After this, you will apply reinforcement with the tools in the Bar
Reinforcement task area. You can find these tools on the Actionbar
and on the shortcut menu.
Finally, you will delete the auxiliary 3D solid and save the precast door
lintel as a symbol in the library.
Tools: Objective:
Box
Create view
Options
Bar Shape:
Stirrup, closed
Straight bar
Place Bar Shape
Along placing line
Along placing segment
Single placement
Dimension Line, Label
Modify View
Library


## Sayfa 211

Engineering Tutorial Unit 4: reinforcement drawing 205
Draw the outline without switching to a different task on the
Actionbar.
To draw the outline in 2D
1 Go to the Actionbar and select the Engineering role -
Reinforcement task.
2 Click Open on a Project-Specific Basis (Quick Access
Toolbar), open the drawing file tree for fileset 3 and double-click
drawing file 301.
3 Click the current scale on the status bar and select 1:50. Make
sure the unit of length is m.
4 Use the tools in the Design task to create the design as shown in
the illustration. Select pen thickness 0.35 mm for the elevation
and 0.50 mm for the section. Use the Rectangle and Line
tools ( Repeat drop-down list on the Quick Access Toolbar or
Quick Access task area).
Assign the layer DE_GEN02 to the elements. To do this, go to the
Properties palette - Format area, open the Layer drop-down
list and click the DE_GEN02 layer.
You do not need to draw the coordinate system and the 3D view
(shown as dashed lines), which serve as an aid to orientation.
5 Double-click the middle mouse button in the workspace to
restore the full view.

2 06 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
Next, you will create a box as an auxiliary 3D solid. Based on this solid,
you will generate an auto-updating view.
To create an auxiliary solid for the 2D drawing
1 Make drawing file 302 current and open drawing file 301 in edit
mode.
2 Use Box ( Repeat drop-down list on the Quick Access
Toolbar or Modeling task - 3D Objects task area) to create a box
of 1.99 x 0.24 x 0.30 m that is parallel to the coordinate planes.
Place this box so that it is below the elevation and aligned with it.
3 If you want to create the reinforcement model at a specific
height, move the box by the corresponding value in the z-
direction.
4 Use Create View (Actionbar - Reinforcement task -
Sections task area - Create Section flyout menu) to create a
view of the box. Select a lateral viewing direction and make sure
you create an auto-updating view.
5 Select the Left, West Elevation view and check the settings.
6 Turn off the heading and place the view so that this view and the
section of the 2D drawing are congruent. Finally, select ESC to
close the tool.
Next, you will create and place stirrup reinforcement for the beam. If
you enter the bar shape in a 2D general arrangement drawing, Allplan
cannot define the spatial orientation of the reinforcement. Therefore,
you must select an existing view. However, there is no view because
you are about to create the first reinforcement element. So you will
use an auxiliary 3D solid instead.

Engineering Tutorial Unit 4: reinforcement drawing 207
The BR_GEN layer is proposed for bar reinforcement. You can use
this layer, as it is not necessary to differentiate between the upper
and lower reinforcement layers.
To manually create and place stirrup reinforcement
1 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Reinforcement
page and check that the Reinforce with 3D model option is
selected in the General area.
2 Click Bar Shape (Actionbar - Bar Reinforcement task area).
Check the Layers palette to see whether the BR_GEN layer is
selected. If it isn't, select it now.
3 Select the Stirrup, closed bending shape in the list box at the top
of the Bar Shape palette.
4 Go to the palette area with the parameters, select a diameter of
8 mm and enter 0.03 for the concrete cover.
You can leave the other settings as they are.

2 08 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
5 The Expand to adapt to edges and Label options are selected in
the input options. In the section, point to the left component line
within the outline until the bending shape expands, then click in
the workspace.
6 Select ESC to start the Label tool and place the bar label in the
section. Define the parameters so that you can see the mark
number only.
The Place Bar Shape tool opens automatically.
7 Placing line from point: Click the lower-left corner of the box.

Engineering Tutorial Unit 4: reinforcement drawing 209
8 Placing line to point: Click the lower-right corner of the box.
Tip: You can change the 9 Go to the parameter area of the Place Bar Shape palette, select
placement display mode the Same concrete covers option, and enter 0.03 for Concrete
immediately in the input cover. Change the spacing to 0.10. You can leave the other
options or later by using settings as they are.
Modify Placement
Display Mode.
10 Select ESC twice to close the tool and to start the Dimension
Line, Label tool.
11 Select ESC twice to skip labeling the model and to close the tool.

2 10 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
Next, you will create and place the longitudinal reinforcement of the
beam based on the stirrup reinforcement you just entered.
To create and place longitudinal reinforcement at the
bottom
1 Click Bar Shape again (Actionbar - Bar Reinforcement task
area).
2 Select the Straight bar bending shape in the list box at the top of
the Bar Shape palette.
3 Select diameter 14 mm, clear the Same concrete covers option,
change the Concrete cover 1 to 0.04 and change the Concrete
cover at start and Concrete cover at end to 0.03.
4 Turn off the Expand to adapt to edges option in the input options
and click the two bottom corners of the beam in elevation view.
5 Select view: Click the stirrups you placed in the box.
This creates the bar.

Engineering Tutorial Unit 4: reinforcement drawing 211
If you want, you can still change all the parameters except the
bending shape.
6 Right-click in the workspace and select Place Bar Shape on
the shortcut menu.
7 Click Segment in the input options and click the bottom stirrup
leg in the section (see following illustration).
Allplan moves the longitudinal bar into the box.

2 12 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
8 Go to the parameter area of the Place Bar Shape palette, enter 4
for the Number, right-click in the workspace and select
Dimension Line, Label on the shortcut menu.
9 Select the Fan dimension line type. Define the parameters so that
the number of pieces and diameter are included and change the
setting for the text leader to Automatic.
Note: If you have not yet worked through exercise 4, you must
change the aspect to 1.00 by clicking to the right of Dimension
line options.

Engineering Tutorial Unit 4: reinforcement drawing 213
As Automatic mark number is selected in the input options, the
program creates the mark number at the beginning or end of the
label depending on the drop-in point.
10 Place the label below the bars. The system automatically draws
leaders to all the bars.
The next step is to enter top longitudinal reinforcement. You will
learn about an approach that is particularly useful for reinforcing
components in section or plan without creating an additional view.
To create the top longitudinal reinforcement in the
section and to place the reinforcement freely in the
view
1 The Bar Shape tool is still open. If this is not so, select this tool
in the Repeat drop-down list on the Quick Access Toolbar.
The Straight bar bending shape is selected.
2 Select Straight bar as point in the input options and select a
diameter of 12 mm in the palette area with the parameters.

2 14 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
3 Select CTRL+ALT+M to open the Measure tool; click Length in
the Measure dialog box.
4 Click the upper-left and upper-right end points of the beam.
5 Click in the Measured values dialog box and then click
L = 1.99000 m.
6 Select the value for the Bar length in the palette area with the
parameters, right-click this box and, on the shortcut menu,
choose Paste.
7 The value 1.99000 is entered. Change this value to 1.93, taking
the concrete cover of 3.0 cm at the start and end into account.
Place bar in fillet is selected in the input options. Do not
change this setting.


## Sayfa 221

Engineering Tutorial Unit 4: reinforcement drawing 215
8 The cut bar is attached to the crosshairs. Point to the upper-left
rounded corner of the stirrup in the section and click.
9 Right-click in the workspace and select Place Bar Shape on
the shortcut menu.
10 Select Single placement in the list box at the top in the Place Bar
Shape palette.
11 Select view: Click the reinforcement in the box.
12 Switch the Anchor point to the upper-right point in the input
options and enter 0.03 for the Offset in x-direction and 0.04
for the Offset in y-direction.
13 Click the upper-right corner of the box.
14 Select ESC, as you do not want to create an additional placement.

2 16 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
15 Select ESC twice to skip labeling and to close the tool.
16 Click Copy and Mirror (open the shortcut menu in the
workspace) and mirror the top longitudinal bar in the section.
17 Select ESC to close the tool.
You can now create the missing labels. The top longitudinal bars are
two separate placements. To create a common label, you must
select both placements.
To label the top bars later
1 Click Dimension Line, Label (Actionbar - Bar Reinforcement
task area).
2 Enclose the two bars at the top in a selection rectangle that you
open from left to right.
Select elements based on direction is selected in the Work
Environment task area.
3 Fan is selected for the dimension line type. Place the label above
the bars. You can enter a direction angle for the label in the dialog
line. Allplan automatically draws leaders to all the bars.
4 Select ESC to close the tool.

Engineering Tutorial Unit 4: reinforcement drawing 217
Although you used the elevation view for defining the bar shape
when creating reinforcement, Allplan did not generate any
reinforcement because the general arrangement drawing is in 2D.
However, the reinforcement is available as a 3D model. So you can
create a new view of all reinforcing elements and place this view in
the 2D general arrangement drawing.
To create reinforcement in the 2D general
arrangement drawing
1 Right-click the border of the section and select Create View
on the shortcut menu.
2 Select Front, South Elevation and switch the Anchor point for
preview to Centered.
3 To point or angle of rotation: Right-click the lower-left corner in
elevation view and select Midpoint on the shortcut menu.
4 End point of line: Click the upper-right corner of the view.
5 Select ESC to close the tool. Select the box and click Delete in
the Edit task area.
6 Double-click the view border of the view to open the Modify
View tool.
7 Go to the Filter area of the Modify View palette and click the
Drawing files button. The Select drawing file dialog box opens.
Turn off drawing file 301 to unlink this drawing file.

2 18 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
8 Click OK to confirm the Select drawing file dialog box. Click Apply
to confirm the Modify View palette.
Tip: When you select the 9 Close the palette. Use the same approach to modify the section.
Modify View, Section Here, too, unlink drawing file 301.
tool on the Actionbar, you
10 Finally, you can use Reinforcement Tools (Actionbar - Bar
can select the two views
Reinforcement task area - Modify Placement Display Mode
together and modify them
flyout menu) to automatically dimension and label the view. To do
in a single operation.
this, select the Auto option.
Select the view you want to dimension: Click any placement and
define the parameters for the dimension lines and labels. Select
ESC to skip a placement.
11 Use Dimension Line, Label to label the longitudinal
reinforcement at the top. Use the same settings as for the labels
in the section.
The result should look like this:

Engineering Tutorial Unit 4: reinforcement drawing 219
Now that you have completed the reinforcement of the door lintel,
you will save it as a symbol. You will then retrieve and modify it.
Symbols and their use are covered in the Basics Tutorial.
To create and save a symbol
1 Open the Library palette.
2 The reinforcement symbol is to be available to all users in your
office. Therefore, open the Office folder.
3 Click New group at the bottom of the Library palette, enter
Standard details for the name of the new group, and select
ENTER to confirm.
4 Open the new Standard details group. At the bottom of the
Library palette, point to Insert element and click Insert
symbol.
5 Select elements you want to save as a symbol file Enclose the
reinforcement symbol including the reinforcement model in a
selection rectangle.

2 20 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
Tip: You can also change the 6 Set the symbol's base point
position of a symbol’s base Click the lower-left corner of the beam in elevation view to define
point when you retrieve the the symbol’s base point. This is the point at which the symbol will
symbol. be attached to the crosshairs when you retrieve it.
7 Select the Dumb symbol without Snoop functionality option in
the dialog box and click OK to confirm.
8 Enter Door lintel for the name of the new symbol and select
ENTER to confirm.
This saves the new Door lintel symbol to the Standard details
folder.

Engineering Tutorial Unit 4: reinforcement drawing 221
Task 2: modifying the reinforced door lintel
Now you will retrieve the door lintel and modify it.
Tools: Objective:
Library
Stretch Entities
Direct object
modification
Dimension Line, Label
Properties palette
This task also requires fileset 3:
Fileset Drawing Drawing file name
file number
3 301 2D general arrangement
302 Bar reinforcement with 3D model
303 Modified door lintel
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).
First, retrieve the symbol and place it in a separate drawing file.
To retrieve the symbol
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar) and double-click drawing file 303.
2 Click the current scale on the status bar and select 1:50. Make
sure the unit of length is m.

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 3 | 301
302
303 | 2D general arrangement
Bar reinforcement with 3D model
Modified door lintel |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


2 22 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
3 The Library palette is still open from the last task; you can see the
Standard details group in the Office folder. If this is not so, open
the Library palette and the Office and Standard details folders.
4 Clear the Auto-scale option and double-click the Door lintel
symbol.
The symbol's base point is attached to the crosshairs.
5 To place the symbol, click in the workspace.
6 Double-click the middle mouse button in the workspace to
restore the full view.

Engineering Tutorial Unit 4: reinforcement drawing 223
Next, you will modify the clear dimensions of the door opening and
the width of the door lintel. In addition, you will modify the spacing
between the stirrups in the middle and the diameter of the bottom
longitudinal reinforcement.
As you saved the door lintel with the 2D general arrangement
drawing when you defined the symbol, you do not need to create the
general arrangement again. If you save only the reinforcement as a
symbol, you can also place the reinforcement in a new general
arrangement drawing.
To modify the door lintel's dimensions
1 Click Stretch Entities (open the shortcut menu in the
workspace).
2 Open a selection rectangle around the right stirrup leg and the top
and bottom corner bars in the right part of the section (see
illustration).
3 Enter dx = 0.06 and dy = 0.00 to change the width to 30 cm. The
outline and reinforcement adapt automatically.
4 Use the same approach to modify the left support area in the
elevation (dx = -1.00 and dy = 0.00).
The door lintel now looks like this:

2 24 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
First, change the spacing in the middle of the beam by using direct
object modification. Then, change the diameter of the bottom
longitudinal reinforcement by using the Properties palette.
To modify reinforcement
 No tool is active.
1 Click to the left of the 14 stirrups in the middle of the beam and
enclose them in a selection rectangle ( Select elements based
on direction is selected in the Work Environment task area).
You can see the central move handle, the geometry
handles, and the point handles. In addition, you can see a
selection box for the diameter and boxes for the placing length
and the spacing or number of pieces.
2 Change the spacing to 0.20 in the box for the spacing or number
of pieces.
To switch between the Spacing and Number of pieces
parameters, click the symbol to the left of the box.
Allplan separates the modified part from the placement, giving
this part its own label. If you change the diameter of the modified
part, it will get a new mark number.
3 Delete the label for the stirrups in the elevation view, click
Dimension Line, Label, and use the brackets to select all the
stirrups in the elevation view.
4 Select the Dimension line type and the Dimension line text
option, select No. of pieces + spacing for the text, and place the
dimension line.


## Sayfa 231

Engineering Tutorial Unit 4: reinforcement drawing 225
5 Turn off the spacing for the label and place the label. Then, select
ESC to close the tool.
6 Click a bar in the bottom longitudinal reinforcement and select
Reinforcing bar mark (1) in the list box at the top in the
Properties palette.
7 Go to the palette area with the parameters, change the Diameter
to 16 mm, and click in the workspace to finish.
Note: If you want to change the diameter of the bottom
longitudinal reinforcement by means of direct object modification,
select the entire placement in the section as an entity group by
selecting and holding the Shift key while clicking.

2 26 Exercise 5: 2D door lintel with a 3D model (method 2) Allplan 2022
Your drawing should now look like this:
Tip: The essentials are Finally, you can create the bar schema. The approach is the same as
described in the Allplan Help. with the elevator shaft in exercise 4. Consequently, it is not
Read the chapters about described any further here.
the Sections task area and
As you created the reinforcement with a 3D model, you can delete
the “Reinforcement
the elevation view or section at any time and create the elevation
methods - 3D
view or section again with the tools in the Sections task area. As
reinforcement model”.
opposed to the elevator shaft, only the three-dimensional
reinforcement cage is visible (see Tip).
Printing layouts is covered in exercise 9.

Engineering Tutorial Unit 4: reinforcement drawing 227
Exercise 6: 2D slab without a 3D model
(method 3)
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the Reinforcement task of the Engineering role
contains the Meshes and Bar Reinforcement task areas.
This exercise involves reinforcing a floor slab based on the 2D floor
Tip: Look in the Allplan Help
plan of the basement created in exercise 1. This time, you will not
for information on the
create a 3D model (method 3, see Tip). This exercise requires
reinforcement methods and
exercise 1.
the 3D reinforcement
model:
Start by selecting fileset 4 with the following drawing files:
Fileset Drawing Drawing file name
file number
4 102 2D floor plan
401 Reinforcement, bottom layer - without
3D model
402 Reinforcement, top layer - without 3D
model
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).
Instead of drawing file 102, you can also open drawing file 101 of
exercise 1 in edit mode. In this case, change the status of the existing
layers to Modifiable and hide the style areas so that you can see
better what you are doing: Click Show/Hide ( View drop-
down list on the Quick Access Toolbar) and turn off the style area.

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 4 | 102
401
402 | 2D floor plan
Reinforcement, bottom layer - without
3D model
Reinforcement, top layer - without 3D
model |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


2 28 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
Task 1: mesh reinforcement, bottom layer
In this part of the exercise, you will create the mesh reinforcement
for the bottom layer.
You will use the tools in the Meshes task area. You can find these
tools on the Actionbar.
Tools: Objective:
Options
Span Reinforcement
Start by defining the default settings.
To select drawing files and to define options
Tip: You can define how
1 Go to the Actionbar and select the Engineering role -
mesh reinforcement looks
Reinforcement task.
in the Options.
2 Click Open on a Project-Specific Basis (Quick Access
You can find more
Toolbar), open the drawing file tree for fileset 4, make drawing file
information in the Allplan
401 current and open drawing file 102 in edit mode.
Help.
3 Click the current scale on the status bar and select 1:50. Make
sure the unit of length is m.

Engineering Tutorial Unit 4: reinforcement drawing 229
You will start by placing meshes in the lower-left span in the floor
plan.
To place by span in a rectangular area
1 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Reinforcement
page, turn off the Reinforce with 3D model option in the General
area and click OK to confirm.
2 Click Span Reinforcement (Actionbar - Meshes task area -
flyout menu of the Place Individually tool).
The system proposes the layer MR_GEN.
3 Go to the Properties palette - Format area, open the Layer
drop-down list and click Select....
4 Open the shortcut menu in the Single layer selection dialog box,
select the List layers assigned to currently selected tool option
and double-click the layer MR_M_B.
5 From point or element or enter offset: Enter 0.15 for the support
depth in the dialog line.
6 Define the placing polygon by clicking the lower-left inside corner
of the wall and then the upper-right wall corner. Select ESC to
finish.
6
6

|  | 6
6 |  |  |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |


2 30 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
7 Change the support depth on the right side and at the top. To do
this, click Support depth in the dialog box.
8 Click side of polygon: Click the right side of the polygon and enter
0.12.
Tip: When you select 9 Repeat these steps with the top side of the polygon and click OK
Transverse Overlap, the to confirm the settings.
program places meshes of
full width only. The box
shows the value proposed
by the system. You cannot
change this value.
10 Click Mesh type and select Q257A. This changes the
values for Longitudinal Overlap and Transverse Overlap
to 0.340.
Define the other settings as shown in the illustration.
Tip: Allplan 2022 11 Click OK to confirm the entries.
automatically calculates the The placement should now look like this:
overlap depending on the
type of reinforcing steel
mesh you select. The
placement algorithms are
designed with economic
considerations in mind.
However, you can change
this at any time by
specifying the lap joint
yourself. You can also label
the lap joint ( Options -
Reinforcement - Labels
page).
12 Select ESC to close the tool.

Engineering Tutorial Unit 4: reinforcement drawing 231
The next step is to apply reinforcement to the adjacent span on the
right side.
To place by span in a polygonal area
1 Click Span Reinforcement (Actionbar - Meshes task area -
flyout menu of the Place Individually tool).
2 Enter 0.12 for the support depth in the dialog line.
Tip: The placing polygon of 3 Working counterclockwise, click the inside corners of the span
the area reinforcement is and select ESC to finish.
placed in construction-line
4 The support depth for the exterior wall is 0.15. Click Support
format. Clicking this polygon
Depth in the dialog box, click the exterior wall, enter 0.15 and click
selects the entire
OK to confirm.
placement.
5 Select mesh type Q513A and enter a placing angle of 0.00
degrees.
6 Confirm.
Allplan draws and labels the reinforcing steel mesh placement.
7 Select ESC to close the tool.

2 32 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
Now you should be able to place the reinforcing steel meshes
yourself as shown in the illustration. The support depth for interior
walls is 0.12 and that for exterior walls 0.15:
Finally, you can place various labels.
• If you inadvertently deleted labels, you can use Label to label
meshes with the mark number or mesh type at a later stage. In
addition, you can label the mesh dimensions of individual meshes.
In general, dimensions of the same mark number must be labeled
only once.
• You can use Dimension Overlap to manually dimension splices
in the longitudinal and transverse directions. Automatic labeling
dimensions all splices.

Engineering Tutorial Unit 4: reinforcement drawing 233
Task 2: recess
Now you will apply reinforcement to the slab opening created for the
elevator shaft.
You will use the tools in the Bar Reinforcement task area. You can
find these tools on the Actionbar.
Tools: Objective:
Edge Reinforcement
Secondary
Reinforcement
Rearrange Marks
Start by placing open stirrups around the elevator shaft.
To place edge reinforcement
 Actionbar: Engineering role - Reinforcement task.
1 Click Enter Area Reinforcement (Actionbar - Bar
Reinforcement task area).
The system proposes the layer BR_GEN.
2 Go to the Properties palette - Format area, open the Layer
drop-down list and click Set....
3 Select the List layers assigned to currently selected tool option
and use the shortcut menu to make layer BR_B_B Current.
4 Select the List layers used in open documents option and switch
the layer MR_M_B to Hidden, frozen so that you can see better
what you are doing.

2 34 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
5 Click Edge Reinforcement on the context toolbar.
6 1st edge point or click a line: Click the bottom inside corner of the
right shaft wall.
7 2nd edge point: Click the top inside corner.
8 To specify the direction point, click the slab to the right of the
shaft wall.
9 Click Support Depth in the Enter Area Reinforcement dialog
box, click a side of the polygon and enter the offset. Enter -0.03
for the side toward the recess and 0.00 for all the other sides.
10 Enter 0.70 for Edge Reinforcement Length and click OK to
confirm.
11 Switch the Diameter to 8 mm and the Spacing to 0.15 and
click Shape.
Tip: You can use the
Shape for each side of
polygon parameter to
define the bending shape at
the edges of the placing
polygon, regardless of the
general bending shape
selected for the reinforcing
bars. For example, you can
define hooks at the
supports and create
straight lap joints at the
same time.
12 In the Bending Shape Defaults dialog box, select the bending
shapes for the start and end of the bar as shown in the illustration.
13 Enter values as shown for the a (0.14) and b (0.70) parameters of
the bending shape at the start of the bar and click OK to confirm.


## Sayfa 241

Engineering Tutorial Unit 4: reinforcement drawing 235
14 Select the Show selected bars display mode, switch the
starting point so that the placement starts on the left side and
click OK to confirm.
15 Select the bars you want to display and place the dimension line
and the label.
• Select the Dimension line type and layer BR_B_B for the
dimension line. Enter an aspect of 1.00 by selecting the
Dimension line options line and clicking .
• Clear the Dimension line text check box for the dimension
line. For the label, select Number of pieces, Diameter and
Spacing and select the automatic text leaders.
16 The next edge point for the next placement is now attached to
the crosshairs. Click the upper-left corner, define parameters,
and complete the edge reinforcement as shown in the illustration.
Finally, select ESC.

|  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |


2 36 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
The longitudinal reinforcement is still missing.
To place secondary reinforcing bars as area
reinforcement
 The context toolbar of the Enter Area Reinforcement tool is
still open. If it isn’t, select this tool again.
1 Click Secondary Reinforcement on the context toolbar.
Check that the BR_B_B layer is selected. If it isn't, select it in the
Properties palette - Format area.
2 Click From, to in the input options.
3 Enter starting point: Click the top inside corner of the right shaft
wall.
4 Enter end point: Click the bottom inside corner.
5 Define the following settings on the Enter Area Reinforcement
Context toolbar:
Diameter: 12 mm
Offset to edge: 0.04
Spacing: 0.07
Bar length: 4.00
Shape: straight bar
Number of bars: 3
Placement display mode: Show All Bars.
6 Click OK to confirm.
7 Place the dimension line and the label. Define the text parameters
so that only the Number of pieces and the Diameter are included.
8 Now place the secondary reinforcement above the three other
shaft walls yourself.
The bar length for the reinforcement at the top and bottom is
4.0 m and 5.0 m for the reinforcement on the left side.

Engineering Tutorial Unit 4: reinforcement drawing 237
9 Select ESC twice to finish placing reinforcement and to close the
tool.
10 Although the same bar shape has been placed along each edge,
the individual placements have been assigned consecutive marks.
Click Rearrange Marks (Actionbar - Bar Reinforcement task
area) and confirm the settings.
11 Finally, go to the Properties palette - Format area, open the
Layer drop-down list and click Set....
12 Right-click in the layer structure and select Match visibility from
print set....
13 Select the Reinforcement, bottom layer print set and the Set all
layers visible in print set to modifiable option and click OK twice.
All you can now see is the entire reinforcement (bottom layer)
and the floor plan without style areas.
14 Move the labels of the bar and mesh reinforcement so that they
do not collide.
The drawing now looks like this:

2 38 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
Task 3: support reinforcement and spacers
Now you will create support reinforcement. Finally, you will enter
spacers.
You will use the tools in the Meshes task area. You can find these
tools on the Actionbar.
Tools: Objective:
Support Reinforcement
Place Individually
Modify Format
Properties
Start by defining the default settings.
To select drawing files and to define options
 Actionbar: Engineering role - Reinforcement task.
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar) and make drawing file 402 current. Drawing files 102 and
401 are still open in edit mode.
2 Check the current reference scale (1:50) and unit of length (m) on
the status bar.

Engineering Tutorial Unit 4: reinforcement drawing 239
You will now create support reinforcement.
To place support reinforcement
1 Click Support Reinforcement (Actionbar - Meshes task area
- flyout menu of the Place Individually tool).
2 Click Select, Set Layers in the View drop-down list (Quick
Access Toolbar), match the layer visibility from the
Reinforcement, top layer print set to hide the reinforcement at
the bottom, select the List layers assigned to currently
selected tool option and double-click the layer MR_M_T.
3 1st support point, direction or angle: Enter 90.0.
4 Click the diagonally opposite points in the wall.
5 Click Support Reinforcement Length and enter 1.50.
6 Click Support Depth and make the following settings: 0.15 for
the exterior wall and 0.12 for the interior wall.

|  |  |  |  |
| --- | --- | --- | --- |
| 4 | 4 |  | 4 |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |


2 40 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
7 The area delimited by a dashed line represents the placing
geometry.
8 Click OK to confirm the dialog box.
9 Switch the Mesh Type to R335A and click OK to confirm.
Allplan draws the reinforcing steel mesh placement.
10 Select ESC to close the tool.
Edge reinforcement
Edge reinforcement for meshes works just like edge reinforcement
for reinforcing bars. The procedure was described with the edge
reinforcement around the slab recess. The procedure for selecting
the mesh type and defining parameters is the same as for the tool in
the Meshes task area. Consequently, this tool is not described any
further here.
For edge reinforcement, you can use a special placing mode: surplus
mesh placement. To use this placing mode, create a reinforcing steel
mesh cutting diagram in a separate window. There, you can click a
left-over mesh and place it in its entirety or just parts of it (see
further down).

Engineering Tutorial Unit 4: reinforcement drawing 241
Spacers
Spacers are usually important for ordering steel only. Therefore,
they are included in reinforcement schedules. The steel quantities
must be calculated from the drawing file with the meshes.
You have two options to display spacers:
• You can define the placing region for the spacers by using the
Span Reinforcement tool. Enter areas without upper
reinforcement as recesses. Then select the spacer for the Mesh
Type.
When you create the placement as construction lines, the
placement is visible on the screen but not in printouts. Advantage:
The required number will be calculated automatically.
Disadvantage: The cutting diagram and the mesh list include cut
spacers. This does not reflect standard on-site practice and
bending shop practice (only whole spacers are ordered and
supplied).
• You can define a spacer by using the Place Individually tool
and calculate the required number manually. This method is
relatively fast and fully appropriate for display purposes.
Finally, you will enter spacers by placing them individually.
To enter spacers
1 Click Place Individually (Actionbar - Meshes task area).
Check that the MR_M_T layer is selected. If it isn't, select it in the
Properties palette - Format area.
2 Click Mesh Type and select spacer BK16. Enter the
required number (for example, 120). Enter 2 for the number of
meshes and 60 for the layer factor. Switch the placing angle to
0.00 degrees.

2 42 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
3 Set placing parameters or specify position: Click anywhere in
your drawing and select ESC to close the tool.
4 Click Modify Format Properties (Actionbar - Change task
area), select the Convert 2D entities to construction lines
option, click OK to confirm and select the meshes you just
created (assuming that you want to exclude the spacers from
subsequent printouts).

Engineering Tutorial Unit 4: reinforcement drawing 243
Task 4: cutting diagram and excess mesh
To finish, you will create a cutting diagram for the bottom mesh
reinforcement layer and place excess mesh.
You can find these tools in the Meshes task area on the Actionbar.
Tools: Objective:
Mesh Reports
Place Individually
Start by creating the cutting diagram for the bottom reinforcement
layer.
Note: To create a cutting diagram, a drawing file with reinforcing
steel meshes must be current. If the reinforcing steel meshes you
want to include in the cutting diagram are in different drawing files,
you must open the other drawing files in edit mode. The cutting
diagram does not include meshes on visible but frozen layers.

2 44 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
To place a cutting diagram in a drawing file
1 Make drawing file 401 current. Drawing files 102 and 402 are
open in edit mode.
2 Select pen thickness 0.25 mm and line type 1 in the Properties
palette - Format area.
3 Open the Layers palette and change the layer MR_M_B to
Modifiable and MR_M_T to Visible, frozen.
Tip: If you want to place the 4 Click Mesh Reports (Actionbar - Meshes task area -
mesh cutting diagram in the Mesh Legend flyout menu).
drawing file only, you can
5 Go to the Reports dialog box, click the Default folder on the left
also use the Mesh cutting
side, select the Mesh cutting diagram report and click All in the
diagram of the Mesh
input options to include all marks.
Legend tool. However, this
diagram cannot be sent to
the printer.


## Sayfa 251

Engineering Tutorial Unit 4: reinforcement drawing 245
The report appears in Report Viewer.
6 Click Export and select Allplan.

2 46 Exercise 6: 2D slab without a 3D model (method 3) Allplan 2022
You can see the current drawing file; the report is attached to the
crosshairs.
7 Place the report in the drawing file.
This saves the mesh cutting diagram in the drawing file and prints
it along with the drawing file with reinforcing steel meshes placed
in the layout.
After you have created a cutting diagram in which the whole meshes
are filtered out, you can see which excess pieces are left. You can
click and then place these.
To place excess mesh
1 Click Place Individually (Actionbar - Meshes task area).
2 Select a layer. Make sure that you do not mix the bottom and top
reinforcement layers.
3 Click Excess Mesh Placement on the Place Individually
Context toolbar.
In addition to the active viewport, the Excess Mesh Placement
viewport opens, showing all meshes with pieces of excess mesh
in a cutting diagram.
4 Click the piece of excess reinforcing steel mesh you want to
place.
The Excess Mesh Placement viewport closes again.
5 Place the piece of excess mesh. You can retain or change the
dimensions of the reinforcing steel mesh copied automatically.
6 To place more pieces of excess mesh, click Excess Mesh
Placement again.
Printing layouts is covered in exercise 9.

Engineering Tutorial Unit 4: reinforcement drawing 247
Exercise 7: BAMTEC® reinforcement
Requirements:
Allplan 2022 Engineering comes in different packages.
Open the Create menu and check whether the Engineering
family contains the BAMTEC module.
In this exercise, you will manually create BAMTEC carpet
Tip: Look in the Allplan Help
reinforcement based on FEA calculation results (that is, the FEA
for information on the
results will not be used automatically). You will not work with the 3D
reinforcement methods and
model (method 3, see Tip), as you will create only a floor plan without
the 3D reinforcement
model: sections.
You will use the tools in the BAMTEC task area. As this task area is
not on the Actionbar by default, you will use the Create menu to
open these tools.
Start by selecting fileset 5 with the following drawing files:
Fileset Drawing Drawing file name
file number
5 501 Structure
502 Carpet outline
503
504
You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”).

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 5 | 501
502
503
504 | Structure
Carpet outline |
| You can find the fileset in the Engineering Tutorial project (see
“Appendix: creating the training project”). |  |  |


2 48 Exercise 7: BAMTEC® reinforcement Allplan 2022
Tools: Objective:
Tip: Look in the Allplan Help
Carpet Outline
for basic information on the
BAMTEC task area: Separate into Files
Carpet Mounting Strips
Basic Carpet
Reinforcement
Secondary Carpet
TBeA pM p 0ic 5 h 0 d 3 a . tT e E i : C
Reinforcement
BAMTEC File
re au q
längs a
Library
The following exercise is based on the slab outline shown in the
illustration. Consult the ”Finite Elements” manual to find out how to
create and reinforce this slab outline. The FEA results used here are
also taken from this manual.
In this exercise, you will reinforce the area with hatching (see
illustration). If you have downloaded the training project from the
internet, you will find the slab outline in drawing file 501. All you need
to do is make the layers visible. Otherwise, create the slab outline
yourself.
To copy or draw the slab outline
1 If you have already done FEA calculations for this example, copy
the floor plan (consisting of grid, walls, and recesses) to drawing
file 501.
Place the grid, walls, beams, columns and recesses on different
layers.
2 If these drawing files are not available to you, you can create the
slab outline yourself with the tools in the Components or 2D
Objects task areas. Use the dimensions in the illustration. Place
the grid, walls, beams, columns, and recesses on different layers.
You can use the layers proposed by Allplan.

Engineering Tutorial Unit 4: reinforcement drawing 249
When you use the Actionbar configuration, the menu bar is hidden by
default. The BAMTEC task area is not on the Actionbar by default. To
access the tools in this task area, you will show the menu bar for the
following exercise.

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |


2 50 Exercise 7: BAMTEC® reinforcement Allplan 2022
Note: You can also add the BAMTEC task area to the Actionbar by
means of Actionbar Configurator.
To show the menu bar
Tip: Use the Alt key to show 1 Click Customize Quick Access Toolbar on the Quick Access
the menu bar for a short Toolbar (title bar).
time. The menu bar
2 Click Show menu bar.
disappears again after you
have selected a tool.
The menu bar appears below the title bar.
To select drawing files and to define options
Tip: You can define how 1 Click Open on a Project-Specific Basis (Quick Access
BAMTEC reinforcement Toolbar), make drawing file 502 current and open drawing file 501
looks in the Options. in edit mode.
You can find more
2 Check the current scale (1:100) and unit of length (m) on the
information in the Allplan
status bar.
Help.
3 Select pen thickness 0.25 mm and line type 1 in the Properties
palette - Format area.
4 Open the Options and check that the Reinforce with 3D
model option is not selected.

Engineering Tutorial Unit 4: reinforcement drawing 251
The first step involves defining the carpet outline, that is, the size of
the carpets, the unroll direction, the label and the position of the
carpets in the slab.
Note: Make sure you comply with the technical criteria pertaining to
the application guidelines for the BAMTEC reinforcement technology
(see Tip on page 247)!
To define the carpet outline
1 Click Carpet Outline (Create menu - Engineering family -
BAMTEC module).
The system proposes the layer BA_B.
2 Go to the Properties palette - Format area, open the Layer
drop-down list and click Select....
3 The List layers assigned to currently selected tool option is
selected. Double-click the BA_B_B_1 layer.
4 From point, element or offset: Enter the support depth = 0.00 in
the dialog line. Select the Enter key to confirm.
5 To define the starting point of the first carpet, click the inside wall
corner in axis B/1.
6 Go to the dialog line and enter x-coordinate = 14.10 and
y-coordinate = -14.25. Select the Enter key to confirm.
7 Select ESC to close the polyline and click OK to confirm.
8 Enter an angle of 180° on the Carpet Outline Context toolbar. This
defines the position of the first bar and thus the unroll direction.
9 Enter 0.10 m for the offset between the first bar and the edge.

2 52 Exercise 7: BAMTEC® reinforcement Allplan 2022
10 Define the carpet label as shown. "B 1.1“ stands for: bottom layer,
carpet 1, 1st carpet.
11 Click OK to confirm the values.
Allplan creates the carpet outline with the unroll direction, first bar
and label.
12 Now you can enter the next carpet. Repeat steps 4 through 11
and create the other carpets. Name them B1.2, B1.3, B1.4., B1.5 and
B1.6. Note the following points.
Enter the outlines of the carpets B1.2 and B1.3 for the longitudinal
direction yourself. Be sure to note the following:
• In axes D and F, the carpets are joined without overlap.
• When you define the carpet outline for carpet B1.3, do not include
the lower-left rectangular area between grid point G/1 and the
upper-right corner of the recess because this would cause the
program to generate illegal reinforcing bars. Select 0.05 m for the
offset around the recess.
• The values on the context toolbar are valid for the carpets B1.4,
B1.5, and B1.6. The angle for the unroll direction (90° instead of 180
degrees) and the offset to the first bar (0.05 m instead of 0.10 m)
are different. Use the layer BA_B_B_2.
• The carpets B1.4 and B1.5 are 12.00 m long in the transverse
direction. With an overlap length of 0.50 m, the length of carpet
B1.6 is 12.70 m. Carpet B1.6 has a recess in the lower-left area (like
carpet B1.3).

Engineering Tutorial Unit 4: reinforcement drawing 253
• To define the lap joint, specify the starting point by pointing to the
lower-left corner of the carpet you just created. Enter 0.50 in the
y-coordinate box, which is highlighted in yellow. In this case,
the offset values are 0.00.
Alternatively, you can enter an offset of -0.50 for the top sides of
the outlines of carpets B1.5 and B1.6.
Compare what you have drawn with the finished carpet placing
drawing.

|  |  |  |  |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |


2 54 Exercise 7: BAMTEC® reinforcement Allplan 2022
Before you create the reinforcement for the carpets, you will copy
the individual carpets in the placing drawing to different drawing files.
You will use carpet B1.1 as an example.
Tip: You can also separate To separate carpets into different drawing files
all the carpets in one go by
selecting the following 1 Click Separate into Files (Create menu - Engineering family -
option: BAMTEC module).
Copy ALL carpet outline
2 Select the Copy ONE carpet outline polygon to a different
polygons to different
drawing file option in the File Settings and Reinforcement Mode
drawing files
dialog box.
3 Select the check box in the File Splitting area and click OK to
confirm the dialog box.
4 Click the first bar of carpet B1.1.
5 Select the first drawing file - 503 - in the Select destination
drawing file dialog box.
The program automatically creates drawing files 503 (data for
assembly drawing) and 504 (layout). See for yourself:
Tip: As opposed to manual Using carpet B1.1 as an example, you will now learn about the tools
for reinforcing carpets manually. You will use the following tools:
reinforcement, the
Reinforce tool Carpet Mounting Strips
reinforces carpets
Basic Carpet Reinforcement
automatically.
This tool is designed with Secondary Carpet
economic considerations in Reinforcement
mind. Thus, you can create a
structurally adequate
reinforcement system in a Note: For production reasons, make sure you comply with the
fully automatic manner. following values defining the spacing between mounting strips:
The first mounting strip begins after 52.5 cm. After this, the
mounting strips are spaced at 1.55 m intervals.


## Sayfa 261

Engineering Tutorial Unit 4: reinforcement drawing 255
To place mounting strips
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar) and double-click drawing file 503.
2 Click Carpet Mounting Strips (Create menu - Engineering
family - BAMTEC module).
Carpet mounting strips are always created on layer BA_B_MST,
regardless of the selected layer.
3 As you separated the carpet polygon beforehand, a placing
polygon already exists. Click Match in the input options.
4 Select the polygon you want to match: Click the polygon and click
OK to confirm.
5 Define the following settings on the Carpet Mounting Strips
Context toolbar:
Spacing 1.55
Angle 90° (an angle of 90° places the starting point at the
lower-right point. Production also starts
at this point.)
Offset to starting edge: 0.515
Line type for bar display: 4
6 Click OK to confirm the entries.
7 The mounting strips appear in the selection color. The dimension
line is attached to the crosshairs. You do not need to dimension
the mounting strips manually, as they will be arranged
automatically by the production machine. Skip labeling by
selecting ESC.
8 Select ESC to close the Carpet Mounting Strips tool.

2 56 Exercise 7: BAMTEC® reinforcement Allplan 2022
The basic carpet reinforcement has a diameter of 12 mm and is
spaced at 20-cm intervals. It has the mark number 3. See the
illustration of the reinforced carpet at the beginning of this exercise
(objective).
To define basic carpet reinforcement
1 Click Basic Carpet Reinforcement (Create menu -
Engineering family - BAMTEC module).
2 Select carpet to which you want to apply basic reinforcement:
Click the carpet polygon.
3 Enter the following parameters on the Basic Carpet
Reinforcement Context toolbar:
Diameter: 12 mm
Spacing: 0.20
Offset to starting edge: 0.100
Line type for bar display: 1
4 Click OK to confirm the entries.
5 The basic reinforcement appears in the selection color. The
palette for the dimension line opens.
• Select the Dimension line type and layer BA_B_B_1 for the
dimension line. Enter an aspect of 1.00 by selecting the
Dimension line options line and clicking .
• Select the Bar markers option and place the dimension line in
the workspace.
6 Open the Text/leader tab. Define the label parameters so that
the Number of pieces, Diameter and Spacing are included, select
the automatic text leaders, and place the label.
7 Select ESC to close the Basic Carpet Reinforcement tool.

Engineering Tutorial Unit 4: reinforcement drawing 257
You will place five different types of secondary reinforcement in
carpet B1.1. Marks 4, 5, 6, 7, and 8 are used for the secondary
reinforcement. See the illustration of the reinforced carpet at the
beginning of this exercise (objective).
To place secondary carpet reinforcement
Tip: The entries you make 1 Click Secondary Carpet Reinforcement (Create menu -
are immediately visible in Engineering family - BAMTEC module) and select the layer
the preview. So, you can BA_B_B_1.
check the effects of your
2 Define the following parameters on the Secondary Carpet
settings at any time.
Reinforcement Context toolbar:
Diameter: 8 mm
Anchor point (start of placement): upper left,
dx offset = 0.35
dy offset = 4.002
Placing length: 5.25
Spacing: 0.20
Angle = 180°
Number of pieces: 10
3 Place the secondary reinforcement at the upper-left corner of
the carpet polygon.
4 The secondary reinforcement appears in the selection color.
Place the dimension line and the label with the settings proposed
by the system.

2 58 Exercise 7: BAMTEC® reinforcement Allplan 2022
You will now create more secondary reinforcement. Repeat steps 2
to 4 and use the settings in the following section.
To create more secondary reinforcement
1 The Secondary Carpet Reinforcement tool is still open.
2 Define the following settings on the context toolbar:
Diameter: 8 mm
Anchor point (start of placement): upper left,
dx offset = 0.15
dy offset = 6.002
Placing length: 6.45
Spacing: 0.20
Number of pieces: 10
3 Place the secondary reinforcement at the upper-left corner of
the carpet polygon.
4 Place the dimension line and the label.
5 The Secondary Carpet Reinforcement tool is still open.

Engineering Tutorial Unit 4: reinforcement drawing 259
6 Define the following settings on the context toolbar:
Diameter: 8 mm
Anchor point (start of placement): upper left,
dx offset = 0.055
dy offset = 8.002
Placing length: 5.65
Spacing: 0.20
Number of pieces: 24
7 Place the secondary reinforcement, the dimension line and the
label.
8 The Secondary Carpet Reinforcement tool is still open.
9 Define the following settings on the context toolbar:
Diameter: 8 mm
Anchor point (start of placement): upper left,
dx offset = 0.055
dy offset = 12.802
Placing length: 6.25
Spacing: 0.20
Number of pieces: 8
10 Place the secondary reinforcement, the dimension line and the
label.
11 The Secondary Carpet Reinforcement tool is still open.

2 60 Exercise 7: BAMTEC® reinforcement Allplan 2022
12 Define the following settings on the context toolbar. Do not
forget to change the anchor point:
Diameter: 8 mm
Anchor point (start of placement): upper right,
dx offset = 0.25
dy offset = 13.202
Placing length: 5.35
Spacing: 0.20
Number of pieces: 6
13 Place the secondary reinforcement at the upper-right corner of
the carpet polygon.
14 Place the dimension line and the label.
15 Select ESC to close the Secondary Carpet Reinforcement tool.

Engineering Tutorial Unit 4: reinforcement drawing 261
You can use the Reinforcement Reports and Reinforcing Bar
Legend tools to generate various reinforcement schedules.
Now you will create a BAMTEC file for carpet B1.1.
To create a BAMTEC file
1 Click BAMTEC File (Create menu - Engineering family -
BAMTEC module).
2 Select placements from which you want to derive the BAMTEC
file: Use the Brackets (Actionbar - Work Environment task
area) or the left mouse button to select all placements.
Tip: If drawing file 504 is 3 Place the definition point: Specify the carpet's local reference
open in edit mode, you can point. The system proposes two points. Click the lower-right
use the definition point you point.
specified when you The point clicked is marked by a symbol.
separated the carpets.
4 Place the name of the carpet file.
As opposed to automatic reinforcement, you need to manually
create the symbols required for carpet production. You can
download the symbol from Allplan Connect. If you have installed the
training project you can find on the internet, you can retrieve the
symbol from the Library.
To place symbols
1 Open the Library palette. If you still see the Standard details in
the Office folder, click Library on the navigation bar at the top.
2 Open the Project, Engineering Tutorial and BAMTEC symbols
folders one after the other.
3 Double-click the BEZ-Aufroll 1:50 symbol.
4 Place the symbol with the text to the right of the carpet.
5 Delete (Actionbar - Edit task area) all the redundant
elements.

2 62 Exercise 7: BAMTEC® reinforcement Allplan 2022
6 Move (Actionbar - Edit task area) the text into the correct
position.
Te p pic h d a t e i:
BAM0503.TEC
a
quer
a
sgnäl

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |


Engineering Tutorial Unit 4: reinforcement drawing 263
Reinforce carpet B1.4 yourself. The approach is the same as with
carpet B1.1. The starting point of carpet B1.4 is the lower-left corner
of the carpet polygon. The secondary reinforcement is spaced as
follows (upper-right or lower-right reference point):
Secondary reinforcement 1 (mark 3): dx = 4.151, dy = 1.00, L = 5.85
Secondary reinforcement 2 (mark 4): dx = 7.151, dy = 0.20, L = 6.50
Secondary reinforcement 3 (mark 5): dx = 11.551, dy = 0.00, L = 4.45
Secondary reinforcement 4 (mark 6): dx = 4.151, dy = 0.00, L = 2.85
Secondary reinforcement 5 (mark 7): dx = 5.151, dy = 0.00, L = 4.85
After you have rearranged the marks, carpet B1.4 should look like
this:
Te p pi c h d a t e i:
BAM0506.TEC
a
längs
a reuq
Printing layouts is covered in exercise 9.

|  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |


2 64 Cross-section catalogs Allplan 2022
Cross-section catalogs
This chapter shows two examples of cross-sections catalogs. You
will learn how to modify mesh cross-section catalogs and add a new
custom mesh.
Note: With the self-explanatory forms of the cross-section
catalogs, you can define new catalogs (for example, custom mesh)
or change existing ones. Cross-section catalogs can be viewed on
the screen and listed in reports. You can create reports for individual
cross-section catalogs straight from the overview of all cross-
section catalogs.
These reports can be customized, printed, placed in the current
document or saved as a file in Excel, Word or PDF format. Numeric
input for custom meshes is supported, as is output of a mesh with a
single bar representation.
Now you will change the length of a standard stock mesh from 6.00
m to 12.00 m.


## Sayfa 271

Engineering Tutorial Unit 4: reinforcement drawing 265
To modify a mesh cross-section catalog
1 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Defaults. Select Cross-Section
Catalogs. The following dialog box opens:

2 66 Cross-section catalogs Allplan 2022
2 Click Stock mesh (A) BSt 500 M(A) and then Edit. You can see a
full overview of the mesh cross-section catalog:
3 Click a mesh and then Edit.
The following dialog box opens:

Engineering Tutorial Unit 4: reinforcement drawing 267
4 Enter 12.00 m for the length of the mesh.
5 The program automatically calculates the weight of the mesh
based on the modified length. Thus, you can modify and save
settings without any problems.
Next, you will enter a new custom mesh.
To enter a new custom mesh
1 The Stock meshes (A) BSt 500 M(A) dialog box is still open from
the last task. Click Cancel to return to the overview of the Cross-
Section Catalogs.

2 68 Cross-section catalogs Allplan 2022
2 Go to the Cross-Section Catalogs dialog box and click New. The
following dialog box opens:
3 Click Mesh X-Section Catalog.
Another dialog box opens:

Engineering Tutorial Unit 4: reinforcement drawing 269
4 Click in the Label box and enter Custom Meshes.
5 Click in the Steel grade box and enter M500.
6 Click New.
A dialog box shows which meshes can be defined and how:
Stock meshes without a single bar
representation; only the length, width and
overlap are variable.
Stock meshes with a single bar representation;
enter the parameters in a dialog box.
Stock meshes that you can define in the
workspace.
Custom meshes without edge bars; define them
in a dialog box.
Custom meshes with edge bars; define them in a
dialog box.
Custom meshes that you can define in the
workspace.
Custom meshes with any bar combination;
special functions are available for defining these
meshes in the workspace.
Spacers that can be defined without single bars;
enter spacers in the same way as stock meshes
without a bar representation.
Spacers with a single bar representation; define
them in the workspace.

2 70 Cross-section catalogs Allplan 2022
7 Click Custom mesh, without edge bars.
8 A dialog box opens. Enter a name for the new mesh: LIMA1.
9 You can now define the parameters. Start by entering values for
the length, width and the spacing between the bars. The
projection values depend on these parameters.
10 Save the settings and finish.

Engineering Tutorial Unit 5: layouts 271
Unit 5: layouts
This unit, which consists of two exercises, shows you
how to assemble and print layouts.
 First, you will create a title block as a label style.
 Then, you will use the tools in the Layout Editor task
to print the layout of the elevator shaft that you
reinforced in exercise 4 (unit 4).

2 72 Requirement for printing Allplan 2022
Requirement for printing
Before you print, you need to configure the output device correctly.
If you work on a network, you can use any device connected to a
remote machine (assuming it is configured correctly).
To do this, connect the output device and install it in Windows Print
Manager. On a network, install the device on the computer to which
the device is connected and then share the device.
For further information, consult the user guides of your printer and
operating system.
Printing the screen contents
Printing the screen contents is covered in the Basics Tutorial. Here is
a short description of this approach.
To print the screen contents
1 Select the drawing files and layers you want to include in the
printout.
2 Click Print Preview (Quick Access Toolbar).
3 Make the following settings in the Print Preview palette:
• Select the printer in the Settings area.
• Go to the Display of elements area and select the Thick line
option.
This not only makes the different line thicknesses visible on
the screen but also ensures that they are printed as such.
By using the Print construction lines option, you can choose
to include construction lines in the printout. Define the other
options as you like.
4 Select the Scale and click Print.
5 Select ESC to close print preview.

Engineering Tutorial Unit 5: layouts 273
Exercise 8: custom title block
Requirements:
Allplan 2022 Engineering comes in different packages.
Check whether the User-Defined Objects task contains the Label
Styles task area.
Allplan 2022 provides a wide range of "intelligent" title blocks based
on label styles. Label styles contain design entities, texts and
attributes.
The advantage of a title block with attributes is that the program
updates the text whenever you open the layout.
You can create your own label styles or modify existing title blocks.
Attributes can only be used when you assigned them during project
creation or later.
This exercise requires an empty drawing file.
Tools:
Library
Label Style
To assign attributes
1 Click New Project, Open Project... on the Quick Access
Toolbar.
2 Select the Engineering Tutorial project, open the shortcut menu
and click Properties…
3 The Project Settings dialog box opens. Click the Assign
attributes... button.

2 74 Exercise 8: custom title block Allplan 2022
4 In the Project Attributes dialog box, click Hide unassigned
values and open the Architect group.
5 In the Attribute value column of the Architect row, click in the
box and type in the following:
Sam Sample
6 Use the same approach to enter the Sample Street, Anytown
value for the Architect address attribute.
7 Specify the attributes for the Client, Construction project,
Building information, and Structural analysis groups as shown in
the illustration. After this, click Hide unassigned values to see
all the attributes you have defined.


## Sayfa 281

Engineering Tutorial Unit 5: layouts 275
8 Click OK to confirm the Project Attributes, Project Settings and
New Project, Open Project dialog boxes.
After having assigned the attributes, you can use them in the label
Tip: The training project style for the title block.
contains the title block as a The following exercise assumes that you have the title block from
drawing file and as a symbol. Exercise 5 of the Basics Tutorial for Allplan 2022. You drew this title
Look in the appendix for block and saved it as a symbol with the name Original in the Title
information about how to blocks folder of the library.
download the compressed
projects; see Compressed To create the title block as a label style
projects on the internet (on
page 341).
 You can access the Original title block that you created in the
Basics Tutorial.
 Open an empty drawing file and close all the others.
 Switch the scale to 1:1.

2 76 Exercise 8: custom title block Allplan 2022
Tip: In order to position the 1 Go to the Library palette and open the Office folder (or the
labeling images quickly and Project folder if you work with the training project).
precisely later, you can
2 Open the Symbols folder (or the Engineering Tutorial folder if
set Point Symbols as you work with the training project).
Construction lines at the
3 Open the Title blocks folder.
beginning of the original
texts to be deleted 4 Double-click the Original symbol.
( Engineering role,
Reinforcement task, Quick
Access task area).
5 Click in the workspace to place the symbol.
6 If the title block appears too small, click Zoom All on the
viewport toolbar.

Engineering Tutorial Unit 5: layouts 277
7 Delete the texts that you want to replace with attributes
(project-specific information).
8 Click Label Style ( Engineering role - User-Defined
Objects task - Label Styles task area).
9 Click Attribute on the context toolbar.

|  |  |
| --- | --- |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |


|  |  |  |
| --- | --- | --- |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |


2 78 Exercise 8: custom title block Allplan 2022
10 Select the Project area, choose the Construction project name
attribute, and click OK to confirm.
11 Define the text parameters as shown in the illustration and
change the format to A30.
This defines the attribute as a text with 30 characters maximum.
12 Turn off Adjust height/width to scale and place the attribute so
that it is left-aligned in the box for the construction project
details.
13 Repeat steps 9 to 11 and place the following attributes:
Use the value 4,000 mm as font height and width for the
attributes Client, address, Architect, address and Structural
engineer, address. All other texts are created with the value
5,000. mm

Engineering Tutorial Unit 5: layouts 279
Area Attribute Format Text size
project Construction project, name A30 5,000 mm
Location/ plot A30 5,000 mm
Client A22 5,000 mm
Client, address A30 4,000 mm
Architect A22 5,000 mm
Architect, address A30 4,000 mm
Structural analysis A22 5,000 mm
Structural engineer, A30 4,000 mm
address
Layout Layout name A40 5,000 mm
Tip: You can align the texts
when you place them. To do
this, use the track lines. If
you want to do this later,
you can use the Align
Text tool ( Draft role -
Label task - Text task
area).
14 Click DefFol (Define Foil) on the context toolbar.
15 Enclose the entire title block in a selection rectangle.

2 80 Exercise 8: custom title block Allplan 2022
16 Click the lower-right point to define it as the reference point.
Note: Plan headers must be saved in file no. 7 or 8, because these
files are linked to the tool Label layout border for the Plan
Layout task.
17 Click subfolder number 8 and enter Title blocks.
18 Click line 1 and enter Reinforcement drawing.
19 Click OK to confirm the Save Data dialog box.
20 Select the ESC key to close the tool.
You have now saved the title block as a label style.
Note: You can also find the Label Style tool in the Label Styles
task area of the User-Defined Objects task in other roles.

Engineering Tutorial Unit 5: layouts 281
Exercise 9: assembling and printing
layouts
Printing finished layouts is a critical step. In Allplan 2022 a layout is
the unit you send to the printer.
As opposed to designing on a conventional drafting board, you do not
need to define the scope of the layout in advance.
Generally, you leave the layout (which involves arranging drawing
files) until you’re finished with the design. This is also the stage where
you define the paper size, scale, border, angle, and so on.
Each project can contain up to 9999 layouts.
Tools:
Set Up Page
Layout Element
Update Layout
Print Layouts
Layout Window

2 82 Exercise 9: assembling and printing layouts Allplan 2022
Task 1: assembling layouts
In this section, you assemble a layout with the general arrangement
and reinforcement of the elevator shaft. This involves two steps:
• Define the layout, that is, the sheet size, border and title block.
• Select the layouts elements, that is, the filesets and drawing files.
To define a layout
1 In the Actionbar, switch to the task Plan Layout within the
selected role and confirm the note with OK.
2 Click Open on a Project-Specific Basis (Quick Access
Toolbar) to open in the Open on a Project-Specific Basis dialog
box: Layouts to select the plan.
3 Select layout 1, select the F2 key and enter Elevator shaft -
reinforcement drawing for its name.
Close the dialog box.
Tip: The name you enter
here will appear as the Plan
name attribute in the title
block!
4 Click Set Up Page (Actionbar - Layout Editor task area).
5 In the Page area, select the DIN A2 Format and Landscape. In
the Margins area, select the Without (roll, PDF) option.

Engineering Tutorial Unit 5: layouts 283
With this setting for the margins, Allplan always places the page
so that its lower-left corner coincides with the lower-left corner
of the printable area of the printer selected in the Print
Layouts tool. This ensures that the printout includes all elements
that extend as far as the margins of the page.
6 Click the Layout border button in the Properties area.

2 84 Exercise 9: assembling and printing layouts Allplan 2022
7 In the sub-palette, select the border type Filing margin
(DIN 824 A), change the format properties of the layout border,
and click Close to return to the Set Up Page palette.
Note: If you want to place a layout border of any size on the page,
use the Layout Border tool (Actionbar - Layout Editor task
area). You can use this tool to define custom border sizes by
means of the input options.
8 In the Properties area, click the Title block box and select the
Label option.


## Sayfa 291

Engineering Tutorial Unit 5: layouts 285
9 In the Office folder, select the Reinforcement drawing label style
and click OK to confirm.
Considering the margins, Allplan automatically places the title
block in the lower-right corner.
Instead of attributes, you can now see the values you have
assigned.
Tip: To change the layout
label, you can use the
standard text tools on the
shortcut menu or in the
Quick Access task area.

2 86 Exercise 9: assembling and printing layouts Allplan 2022
10 Enter 0.00 for both the Offset to the right and the Offset to the
bottom. Then click Close to close the Set Up Page tool.

Engineering Tutorial Unit 5: layouts 287
Layout elements are mainly drawing files that you place in the layout.
Drawing files can be positioned individually or as a fileset.
You can define the layers you want to include in the printout by
selecting a print set.
Selecting layout elements
1 Click Layout Element (Actionbar - Layout Editor task area).
2 Click Fileset and select fileset 2, Elevator shaft on the context
toolbar.
The drawing file selection is the same as in document edit mode:
Drawing files 101, 202 and 203 are turned off.
3 It is enough if you place the sections and the reinforcement model
in the layout. Therefore, select drawing file 204 only and click OK
to confirm the dialog box.
4 Click the Layer/print set box. You can use layers to define
visibility settings for the layout elements:
• The Print set, current setting of the selected print set
option displays only elements on layers of the current print
set.
• The Current, always use current layer setting option uses
the visibility settings you defined with Select, Set Layers.

2 88 Exercise 9: assembling and printing layouts Allplan 2022
• Use the Fixed, save layer setting in layout element option to
define the visibility setting for each layer individually.
5 Select the Reinforcement drawing drawing type and place the
selected drawing file in the layout.
The next drawing file is now automatically attached to the
crosshairs.
6 Select ESC to finish selecting layout elements.
Allplan saves the finished layouts. You can print them right now or
later. If documents have been changed, the extents of the
documents on the plan must be updated by clicking
Update Layout (Actionbar - Layout Editor Task area).

Engineering Tutorial Unit 5: layouts 289
Task 2: printing layouts
You can now print the finished layout. Make sure that the printer is
correctly installed and configured.
To print the layout
1 Click Print Layouts (Actionbar - Layout Editor task area).
You can see the Print Layouts palette with the Printer tab. The
printout will be an exact match of what you see on the screen.
Layout 1 is selected in the Selection area.
Click the Set button to select the elements that you want to print.
You can choose the types of design entities that you want to
include in the printout. Furthermore, you can place the surface
elements of each document in the background.
Do not change the settings.
2 Choose the output device (printer, large-format printer) and the
paper size (for example, ISO B2) in the Settings area. To print the
entire layout, you must define the printable area (printable area
minus device margins) so that it is larger than the page.
Note: If you have configured output channels in the Services
application, you can select them by selecting the Allplan vector
drivers option.
Note: If the When setting up page - adjust paper format
(printer) option is selected ( Options - Layouts page) and you
set up the page, Allplan automatically adjusts the paper format of
the device to the format and orientation of the page. In doing so,
Allplan tries to select as identical a paper format as possible. If you
have not defined margins for the page, the program tries to
select a format without margins. If formats without margins are
not available, Allplan selects the next largest paper format. If
Allplan cannot find a suitable format, it selects the largest format
that is available for the output device.
If this option is not selected, click Select paper format
(printer) based on page format to manually match the format
and orientation of the page.

2 90 Exercise 9: assembling and printing layouts Allplan 2022
3 Depending on the selected output device, you can use Allplan
raster drivers. These printer drivers are especially suitable for
printing large-format layouts. In addition to being very reliable,
raster drivers speed up printing and enhance the quality of
printouts.
If you want to use raster drivers, select the Allplan raster driver
option and open the list box to select a raster driver that can be
used with the selected printer.
Note: You can define the properties of the Allplan raster driver by
clicking Properties next to the selected printer.
Note: The following prompt appears the first time you select an
output device that can be used with Allplan raster drivers:

Engineering Tutorial Unit 5: layouts 291
Click Yes if you want to use Allplan raster drivers. This selects the
Allplan raster driver option and an appropriate raster driver.
Tip: You can define specific 4 Do not change the number of copies: 1. Select Landscape for
settings for printing in the the orientation.
More settings, Customize,
Here, too, you can set up the page by clicking the Set button. Click
and Output mode areas and
to match the device margins of the selected printer.
on the Print profile tab. You
can find more information in
the Allplan Help.
5 Click Start to start printing.
If you want to save the settings and print the layout later, click
Close.

2 92 Exercise 9: assembling and printing layouts Allplan 2022
Task 3: layout windows
You can use layout windows to position just portions of drawings in
your layout. This is useful if you want to display just specific areas or
elements that are far from each other in the fileset. In the following
exercise, you will create layout windows and display sections of
individual drawing files.
To create layout windows
1 Use Open on a Project-Specific Basis to open an empty
layout. Then select Set Up Page and define the format,
orientation and margins of the page.
2 Click Layout Window (Actionbar - Layout Editor task area).
You will create the window so that you can immediately select
the drawing file you want to display.
3 Click .. place drawing files as layout elements.
4 Select drawing file 102 and place it in the layout. The drawing
type is Reinforcement drawing.
5 Select drawing file 401 and click within the boundary of the
drawing file already placed.
6 Select ESC, as you do not want to select more drawing files for
this layout window.
Tip: By using the polyline
7 Define the size of the layout window by clicking two diagonally
entry tools, you can also
opposite points (lower-left and upper-right points; see
define freeform layout
illustration). Then select ESC twice.
windows or create layout
windows composed of
several polygons.

Engineering Tutorial Unit 5: layouts 293
Note: Check that Area detection is turned off in the input
options. Otherwise, the border or boundary of the layout element
placed defines the size of the layout window.
8 Repeat steps 2 through 7 to create a layout window for drawing
file 204 or 303.
9 Click Modify Layout Window (Actionbar - Layout Editor task
area) and select Enter new polygon for layout window to
change the size of the window.
10 To rearrange the layout windows, you can use Move
(Actionbar - Edit task area).

2 94 Exercise 9: assembling and printing layouts Allplan 2022
The result might look like this:


## Sayfa 301

Engineering Tutorial Appendix 295
Appendix
If you want to create the project yourself, this appendix
provides useful information and step-by-step
instructions on the following topics:
 Project organization - managing data with ProjectPilot
 Using layers
 Creating a project
 Creating filesets
 Defining print sets
In addition, you can find general information about the
Actionbar configuration and the topic of drawing files.
Note: If you want to skip the general sections and start
creating the project at once, go to Creating the training
project (on page 313).
Note: You can also download a compressed project with
the data for the exercises. For more information, see
Compressed projects on the internet (on page 341).

2 96 Project organization Allplan 2022
Project organization
Project structure, that is, the way in which you organize your data, is
an essential part of any building design project. With an efficient and
logical structure, you can locate the data you need without having to
spend a long time looking for the data.
It is worth spending time carefully planning a project’s structure
before even drawing the first line. Consider the time and effort spent
doing this as a good investment - after all, in the long term, it will save
you time and money.
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

Engineering Tutorial Appendix 297
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

2 98 Project organization Allplan 2022
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
Sorted in ascending order (arrow points Sorted in descending order (arrow points
upward) by drawing file name downward) by drawing file number

Engineering Tutorial Appendix 299
Copying and moving by means of drag-and-drop editing
Instead of the shortcut menu, you can also use the drag-and-drop
feature to move or copy selected documents. Select the documents,
click within the selection and drag. You can tell whether this is
possible by the shape of the cursor when the mouse pointer is
positioned over the destination.
Cursor Meaning
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
Shortcut menu of a project Shortcut menu of the fileset folder

3 00 Project organization Allplan 2022
Using the preview
You can see the selected document in the preview. You can zoom in
on the preview, pan the preview and display the preview in isometric
view. Click Preview on the View menu to specify whether and where
to place the preview.
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

Engineering Tutorial Appendix 301
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

3 02 Project organization Allplan 2022
Drawing file status
By selecting the drawing file status, you define the drawing file in
which you draw and which drawing files are visible or can be changed.
The following illustration shows the different drawing file status. You
can find explanations in the table.
Number Drawing file Comment
status/
labeling
1 Current or active The current or active drawing file is the one in which you draw. There must
always be one current or active drawing file.
2 In edit mode Elements in drawing files open in edit mode are visible and can be modified.
Up to 1024 drawing files can be active, active in the background and/or
passive at the same time.
3 Open in reference Elements in drawing files open in reference mode are visible, but they
mode cannot be modified. You can configure Allplan to use the same color for all
elements in reference drawing files. To do this, select the Options -
Desktop environment - Display. You cannot open empty drawing files in
reference mode.
4 Not selected Elements in these drawing files are not visible.
5 Empty Empty drawing files have no data type icon.
6 Assigned The drawing file is temporarily assigned to the fileset. This assignment will
temporarily be lost as soon as you switch to a different fileset.

Engineering Tutorial Appendix 303
7 Open in reference The drawing file is opened in the workgroup by another user.
mode
8 Open in reference The drawing file is opened in the workgroup by another user, red indicates
mode that it has been changed. You can apply the changes by selecting Update
drawing file on the shortcut menu. In the Options - Desktop
environment page, you can configure the program to inform you of
changes in reference drawing files.
9 Linked drawing file The drawing file contains model data or views and sections linked with
other drawing files. Allplan links drawing files when you create views and
sections with the tools in the Reinforcement Views task area.
You can use the shortcut menu to list all reference drawing files of the
current drawing file or open its reference drawing files in edit or reference
mode.
10 Views and sections The drawing file contains views and sections that you created by using the
created shortcut menu in the “Derived from building structure” area or views and
automatically sections that you created with the tools in the Sections task area and
saved in this drawing file.
These views and sections are usually linked with other drawing files. Allplan
considers the model data in these linked drawing files.
11 Update locked By using the shortcut menu in the "Derived from building structure" area,
you can lock the update of drawing files with views and sections created
with the Update automatically option not being selected. Allplan cannot
update the result until the drawing file is unlocked or the Update
automatically option is selected. After having confirmed a prompt, you can
create a new view or section in the drawing file.
12 Views and sections The drawing file contains views and sections created with the tools in the
placed manually Sections task area.
These views and sections might be linked with other drawing files. Allplan
considers the model data in these linked drawing files.
You can use the shortcut menu to list all reference drawing files of the
current drawing file or open its reference drawing files in edit or reference
mode.

3 04 Project organization Allplan 2022
Information about the active drawing file
To get information about the active document, right-click in the
workspace and choose Properties on the shortcut menu. You can
see an information box with important information.
Information Meaning
Memory allocation This shows how much of the memory reserved for a
document has already been allocated (as a
percentage). Background information: A certain
amount of memory is reserved for documents.
Document This shows the number and name of the current
document (a total of 40 characters). You can also
find the number and name on the title bar of the
Allplan window.
Document type This shows the document type, which matches the
data type icon on the status bar.
Maximum size This shows the maximum amount of memory
available for the document in kilobytes.
Minimum values, This shows the minimum and maximum coordinates
maximum values in the document.


## Sayfa 311

Engineering Tutorial Appendix 305
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
Auto-select layer with tool option is selected in the Layer dialog
box). The layer in question depends on which tool you activate. If
the Auto-select layer with tool option is not selected, the
program automatically uses the layer you selected last.
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

3 06 Project organization Allplan 2022
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
are inserted. Click the Special button in the Options -
Components and architecture - Miscellaneous area to specify
whether these openings can be assigned separate, independent
layers.
• As walls can consist of multiple construction layers and each layer
can have different format properties, you can define the layer for
each of the construction layers in a wall or upstand directly in the
Properties dialog box (you usually make these settings in the
Properties palette).

Engineering Tutorial Appendix 307
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

3 08 Project organization Allplan 2022
Layer access rights
There are different layer access rights. On the one hand, there is the
visibility setting which controls whether a layer is visible or hidden.
On the other hand, there is the edit setting which controls whether a
layer can be edited or not (that is, it is frozen). You can save visibility
settings in print sets (see "Using print sets" on page 312) and edit
settings in privilege sets. The status of a layer is indicated by icons in
the Layer dialog box (Select Layer/Visibility tab) and in the Layers
palette:
Icon Access right Explanation
Current The layer on which you draw.
Modifiable Elements in this layer are visible and can
be modified.
Visible, frozen Elements in this layer are visible but
cannot be modified.
Hidden, frozen Elements on this layer are not visible and
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
between Current, Modifiable, Visible, frozen and
Hidden, frozen.
Layer access rights also depend on the privilege set to which a user
belongs. Therefore, you cannot assign a higher status to layers (for
example, switch hidden layers to modifiable) when you belong to a
privilege set that is not granted full access rights to the relevant
layers.

Engineering Tutorial Appendix 309
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
Modify Layer Status and then Isolate layer - set all other
layers to hidden to hide all the layers except the layer of the element
clicked.
If you often need the same combination of visible and hidden layers
(for dimensioning or labeling at certain scales, for example), we
recommend that you define what is known as a print set. You can
also use this print set when you assemble the layout later, thus
making sure that only the visible layers are included in the printout.
Note: You can choose to Display elements on frozen layers in a
fixed color by selecting this option in the Layer dialog box.

3 10 Project organization Allplan 2022
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
styles are saved together with the layer structure (with the same file
name plus the extension ). When importing a layer structure
.sty
you saved, you can decide whether to import the associated line
style file too.
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
can choose to display only the elements in a specific print set -
switching between 1:50 and 1:100 is thus no problem.
• Exporting drawing files to DXF/DWG layers is easier, because
you can assign each layer in a drawing file to a different
DXF/DWG layer When importing DXF/DWG files, the DXF/DWG
layer structure can be automatically integrated in the layer
hierarchy.

Engineering Tutorial Appendix 311
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
• You can copy format properties including layers by double-
clicking with the right mouse button. This method also works with
wizards. Similarly, you can use Copy Format to quickly copy
the format properties of an element and apply them to other
elements.
Relatonship between layers and drawing files
The use of layers doesn't mean that drawing files don't play a role
when it comes to organizing your data. With large project in
particular, a combination of both is essential. With the same
structural depth, the number of drawing files required is far less
when working with layers.
The number of drawing files you need not only depends on the size of
the project, but also on your hardware. Modern, fast computers with
a lot of memory can handle a lot more data per drawing file without
this leading to a noticeable downturn in performance.

3 12 Project organization Allplan 2022
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

Engineering Tutorial Appendix 313
Creating the training project
Start by creating a project.
To create a project
1 Click ProjectPilot in the drop-down list of the Allplan icon.
ProjectPilot opens.
2 In ProjectPilot, click New Project… on the File menu.
3 Enter Engineering Tutorial for the project name. In the Project
templates area, click No project template and then Next >.
4 Check that Project is selected for all path settings. Then, click
Finish to confirm the dialog box.

3 14 Creating the training project Allplan 2022
5 Close ProjectPilot by clicking Exit on the File menu.
You are back in Allplan; the Engineering Tutorial project is open.
Note: To create new projects, you can also use the New
Project, Open Project... tool (Quick Access Toolbar).
Path settings
The path settings define which pen definitions, line definitions,
hatching definitions, fonts, and material catalogs you use. You usually
work with the office standard.
Office: Choose this option if you want to use the same settings to
work on different projects. In a network environment, the office
standard is the same on all computers and can be changed only by
users with special privileges.
Project: Choose this option if you want to use the settings for this
project only. The settings can be different from those in the office
standard.


## Sayfa 321

Engineering Tutorial Appendix 315
Selecting the scale and unit of length
Define scale and length settings for the project.
Start by selecting a reference scale of 1:100.
To select the reference scale
1 Click in the field beside scale on the status bar and select 1:1.
Select the unit you want to use to enter values. The values are to be
interpreted in meters.
To select units
1 Click Options in the Default Settings drop-down list on the
Quick Access Toolbar (title bar).
2 The Options dialog box opens. Click Desktop environment in the
left area.

3 16 Creating the training project Allplan 2022
3 Go to the Enter lengths in box and click m.
Tip: Alternatively, select the 4 Click OK to confirm the settings.
unit on the status bar: Click
to the right of Length and
select m.

Engineering Tutorial Appendix 317
Drawing file structure
Allplan provides two options you can use to structure drawing files in
a project:
• the building structure
• the fileset structure
You can use these two structures in parallel. To define them, use the
Open on a project-specific basis: drawing files from
fileset/building structure dialog box.
The building structure is particularly useful for applying a logical
structure to a building. In architecture, the advantage of working with
the building structure is that views, sections and building lists can be
generated quickly and easily.
An important difference between the building structure and the
fileset structure is that each drawing file can be assigned only once in
the building structure. However, when it comes to designing
reinforcement, drawing files are multiply used for different
reinforcement drawings. Therefore, we recommend that you work
with filesets.
In this mode, all you need to do is select the relevant fileset and all
associated drawing files are available immediately. To do this in the
building structure, select the relevant drawing files assigned to the
individual structural levels and use the shortcut menu of the project
to save the different status settings as a favorite, which you can
retrieve later.
When working with the building structure, you cannot place detailing
windows in filesets or assemble layouts via filesets.
As the focus of the exercises in this tutorial is to teach you how to
create reinforcement, you will use the fileset structure.
You can find detailed information on how to create a building
structure in the Architecture Tutorial. Look in the Allplan Help for
detailed information on the building structure.
Creating filesets
For the exercises in this tutorial, you will create your own project
structure. We recommend that you work with stories and print sets

3 18 Creating the training project Allplan 2022
in a real project. For more information see Tips on project
organization (on page 321).
To create filesets
Tip: To display a section of 1 Click Open on a Project-Specific Basis.... (Quick Access
the drawing at a larger Toolbar).
scale, open a detailing
2 You do not need a building structure. Therefore, click Cancel and
window in a drawing file or
select the Fileset structure tab.
fileset.
3 Click Create fileset, enter the fileset name Basement and
click OK to confirm.
4 Create the filesets Elevator shaft, Standard door lintel, Slab
reinforcement and BAMTEC in the same way.

Engineering Tutorial Appendix 319
5 Click drawing file 101, select and hold the SHIFT key and click
drawing file 110.
This selects drawing files 101 to 110.
Tip: You select the drawing 6 Click within the selection and drag the drawing files to the fileset
files as you would select Basement. Then release the mouse button again.
them in Windows®
The drawing file tree for the fileset opens. The drawing files are
Explorer:
thus assigned to the fileset.
Select and hold the Ctrl key If you have selected a drawing file too many, you can drag it out
to select a series of of the list in the same way.
nonadjacent drawing files
Note: Instead of using the drag-and-drop feature, you can also
(for example, 10, 16 and 28).
select the fileset and the drawing files and then click Assign to
Select and hold the Shift
current fileset on the shortcut menu.
key to select a range of
adjacent drawing files (for
example, 10 – 20).
As an alternative, open a
selection rectangle around
the drawing files with the
mouse.

3 20 Creating the training project Allplan 2022
Notes: 7 Assign drawing files to the other filesets as shown in the table.
Use the floor plans of the
Fileset Drawing Drawing file name
basement you created in
file number
exercise 1 for filesets 2 and
4. You do not need to copy
1 101 3D floor plan
the basement or create it
102 2D floor plan
again. Just assign drawing
files 101 and 102 to filesets 2 103 2D stair
and 4, respectively.
104 Dimensions and labels
Assign the empty drawing
105 Hidden-line image
files 503 and 504 to fileset
110 Key plan
5. You will place the
separated carpet outline in 2 101 3D floor plan
these drawing files later.
201 General arrangement - 3D objects
202 Concrete component
203 General arrangement - components
204 Sections and reinforcement with the
model
3 301 2D general arrangement
302 Bar reinforcement with 3D model
303 Modified door lintel
4 102 2D floor plan
401 Reinforcement, bottom layer - without
3D model
402 Reinforcement, top layer - without 3D
model
5 501 Structure
502 Carpet outline
503
504
8 Name the drawing files as shown.
Labeling drawing files is covered in the Basics Tutorial.
9 Select a drawing file and click Close.

| Fileset | Drawing
file number | Drawing file name |
| --- | --- | --- |
| 1 | 101
102
103
104
105
110 | 3D floor plan
2D floor plan
2D stair
Dimensions and labels
Hidden-line image
Key plan |
| 2 | 101
201
202
203
204 | 3D floor plan
General arrangement - 3D objects
Concrete component
General arrangement - components
Sections and reinforcement with the
model |
| 3 | 301
302
303 | 2D general arrangement
Bar reinforcement with 3D model
Modified door lintel |
| 4 | 102
401
402 | 2D floor plan
Reinforcement, bottom layer - without
3D model
Reinforcement, top layer - without 3D
model |
| 5 | 501
502
503
504 | Structure
Carpet outline |


Engineering Tutorial Appendix 321
Tips on project organization
Allplan is a very flexible system you can use to develop your own
custom solutions for projects and entire offices. The structure for
large-scale projects is intended only as a guide. You can use the
entire structure or just parts of it.
You will probably find this structure useful when you start. As you
progress, you will be in a better position to judge what needs
changing to suit your own needs and requirements. We would like to
emphasize once again that a carefully thought-out project structure
will save time for everybody in the long run. The system has the
following structure:
• General project-related information is stored in drawing files
1-99. This data is universally required (layouts, axis system and
so on).
• Floor design starts at drawing file 100, starting with the
excavation. Create the design for the key plan in drawing files
300 and the following files.
• Use the drawing files starting at number 1000 for general
arrangement drawings and the associated sections. The first digit
indicates the number of the story. The last two digits provide
information on the contents. Use the same drawing file sequence
on each floor.
• Use drawing files 2000 and the following files for reinforcement
drawings. You can use drawing files 2000-2009 for editing and
modifying components. Create precast elements and special
components in the subsequent drawing files.
Defining print sets
A print set (see "Using print sets" on page 312) is a saved
combination of visible and hidden layers.
Both when setting up your layouts and when turning layers on and
off, activating a print set is a rapid way of showing or hiding those
layers that are required for a specific print set. First create and name
the print sets. Then assign layers to these print sets.

3 22 Creating the training project Allplan 2022
To define print sets
1 Click Select, Set Layers in the View drop-down list on the
Quick Access Toolbar.
2 Select the Print Set tab and click Define, modify print set....
3 The Print Set Manager dialog box opens. Click New print set....
4 Enter Key plan for the name of the first print set and click OK to
confirm.
You do not need to define a group.
5 If you work with Workgroup Manager, assign the user local to the
print set.
6 Repeat steps 3 to 4 (5) and create more print sets:
- General arrangement drawing
- Reinforcement, bottom layer
- Reinforcement, top layer
7 Click OK to confirm print set manager.

Engineering Tutorial Appendix 323
The next step is to define which layers are to be visible and which
hidden in each print set.
To define visible and hidden layers for print sets
 The Layer dialog box is still open. The first print set - Key plan - is
visible.
1 Click to collapse the tree structure.
2 As only a few layers are to be visible, start by setting all layers to
Hidden. Select all layer structures, right-click the selection and,
on the shortcut menu, choose Hidden.
3 Expand the Draft, Dimension line and Key plan areas by clicking
the respective triangle symbols. Select and hold the Ctrl key and
select the layers which are to be visible in the Key plan print set
(see table).

3 24 Creating the training project Allplan 2022
4 Right-click the selection and select Visible on the shortcut menu.
Make sure that you select individual layers (and not layer
structures or even the entire layer hierarchy!).
5 Click Apply to save the current setting.


## Sayfa 331

Engineering Tutorial Appendix 325
6 Select the next print set in the Print set in list box area and define
which layers are to be visible and which hidden in this print set
(see table).
Tip: For other print sets, you
can match the setting of a
print set you have already
defined and then adapt it as
appropriate.

3 26 Creating the training project Allplan 2022
Hierarchy Layer Short Key General Reinforcement, Reinforcement,
name plan arrangement bottom layer top layer
drawing
Design General01 DE_GEN01 
General02 DE_GEN02    
Surface Style area SU_STYL 
elements
Text General text TX_GEN 
Dimension line Dimension line, DL_GEN 
general
Dimension line DL_100  
1:100
Views and Shell, general SH_GEN  
Sections
Shell SH_SHL  
Arch Wall AR_WALL 
Components
Column AR_COL 
Slab AR_SLAB 
Downstand AR_BEAM 
beam
Bar reinforce- Bar reinforce- BR_B_B 
ment ment at bottom
Bar reinforce- BR_B_T 
ment at top
Mesh reinfor- Mesh reinforce- MR_M_B 
cement ment at bottom
Mesh reinforce- MR_M_T 
ment at top
Key plan Key plan, KP_GEN 
general
Key plan KP_KEY 
7 When you have assigned layers to all print sets, click Apply and
then OK.

| Hierarchy | Layer | Short
name | Key
plan | General
arrangement
drawing | Reinforcement,
bottom layer | Reinforcement,
top layer |
| --- | --- | --- | --- | --- | --- | --- |
| Design | General01
General02 | DE_GEN01
DE_GEN02 |  | 
 |  |  |
| Surface
elements | Style area | SU_STYL |  |  |  |  |
| Text | General text | TX_GEN |  |  |  |  |
| Dimension line | Dimension line,
general
Dimension line
1:100 | DL_GEN
DL_100 |  | 
 |  |  |
| Views and
Sections | Shell, general
Shell | SH_GEN
SH_SHL |  |  | 
 | 
 |
| Arch
Components | Wall
Column
Slab
Downstand
beam | AR_WALL
AR_COL
AR_SLAB
AR_BEAM |  | 


 |  |  |
| Bar reinforce-
ment | Bar reinforce-
ment at bottom
Bar reinforce-
ment at top | BR_B_B
BR_B_T |  |  |  |  |
| Mesh reinfor-
cement | Mesh reinforce-
ment at bottom
Mesh reinforce-
ment at top | MR_M_B
MR_M_T |  |  |  |  |
| Key plan | Key plan,
general
Key plan | KP_GEN
KP_KEY | 
 |  |  |  |


Engineering Tutorial Appendix 327
Actionbar Configuration
The Actionbar Configuration is the default setting in Allplan 2022.
When you work with this configuration, you can find the Actionbar
above the workspace. In addition, you can see the Properties,
Wizards, Library, Objects, Planes, Issue Manager, Connect, and
Layers palettes on the left side.
If the Actionbar configuration is not active, you can select it as
follows:
To select the Actionbar configuration
• Open the View menu, point to Default Configurations, and click
Actionbar Configuration.
Click the Allplan icon on the left side of the title bar to open important
tools such as save, copy, import, and export. The title bar also
includes the Quick Access Toolbar. By using a drop-down list, you
can select the tools that you want to display on this toolbar. In
addition, you can show and hide the menu bar, define the sequence of
the tools on the Quick Access Toolbar, and click Customize User
Interface... to open the Customize dialog box - Actionbar tab.

3 28 Actionbar Configuration Allplan 2022
Contents and structure of the Actionbar
The Actionbar contains all Allplan tools grouped by tool groups. The
groups of tools are combined into task areas, which are combined
into tasks. You can find the tasks required for each discipline in a role.
If you position the cursor over an icon for a short time, a tooltip will
appear. Use Customize User Interface - Customize tab to specify
whether this is a Plain tooltip or an Advanced tooltip. Plain tooltips
contain a short description of the tool, Extended tooltips consist of a
short description of the tool; they can also contain further
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
7 - Actionbar Configurator
8 - Find

Engineering Tutorial Appendix 329
Selecting the role
You start by selecting a role (1). The drop-down list contains all the
roles that are available to you, both those you purchased (license-
dependent) and self-configured. The tasks (2) that are available to
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
currently selected by selecting and holding the Ctrl key while double-
clicking within the name line of a task area. You can expand or
collapse all areas across tasks and roles by selecting and holding
Ctrl+Shift while double-clicking within the name line of a task area.
How many task panes are displayed expanded depends on the width
of your Allplan window. If the window is not wide enough, Allplan
starts on the left side, expanding as many task areas as possible.

3 30 Actionbar Configuration Allplan 2022
Structure of a task area in detail
1 - Task area
2 - Create group of tools
3 - Create in context group of tools
4 - Modify in context group of tools
5 - Tool
6 - Tool menu = flyout menu of a tool
An expanded task area (1) contains one or more groups of tools
(2/3/4). Different groups of tools are separated by vertical lines. The
tools are grouped by topic. Some tools have flyout menus (6) where
you can find similar tools.

Engineering Tutorial Appendix 331
Palette window
The palette window displays the palettes as tabs. Palettes are
important controls of Allplan, making the user interface simple and
easy to use. You can float or dock each palette individually. In
addition, you can arrange the palette window or individual, free-
floating palettes around the edge of the workspace or make them
float anywhere on your screen. You can even configure Allplan to
automatically show or hide the palette window or palettes arranged
around the edge.

3 32 Palette window Allplan 2022
Properties palette
When the Properties tab is open, you have the following options:
Drop-down list at the top Tools at the top and bottom Properties
Select active elements Zoom in on selected Modify properties (also possible
objects for some reinforcement
elements)
Filter step by step
Change the properties of
the selected object
Match parameters
Load favorite
Save as a favorite

Engineering Tutorial Appendix 333
Wizards palette
When the Wizards tab is open at the top, the following options are available:
Drop-down list at the top Tabs on the right Available tools
Select a wizard group Select a wizard Select a tool

3 34 Palette window Allplan 2022
Library palette
The Library palette provides a Filter that you can use to show or
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


## Sayfa 341

Engineering Tutorial Appendix 335
Objects palette
The Objects palette lists all objects and elements in the currently
open drawing files (current or open in edit mode or open in
reference mode). You can sort these objects by Topology,
Drawing file, Layer, Material, Trade, or Attribute.
Here you can selectively show or hide selected objects, or select or
deselect them. Furthermore, it is possible to set the transparency of
3D objects as well as to apply color coding (both have an effect only
in the Animation view type).

3 36 Palette window Allplan 2022
Planes palette
The Planes palette displays all plane models in the active project.
Each plane model has its own tab. While creating components, you
can keep track of the default planes and all other objects on which
the heights of the components can be based.
To edit a plane model, click Modification mode on/off. If
modification mode is on ( ), you can make entries in the Planes
palette. Allplan displays the planes of the plane models in all
viewports. When you point to or select an entry of the plane model in
the tree structure, this entry is also highlighted in the detection color
in the viewport. So, you can immediately check the position of the
plane and see the effects of changes.

Engineering Tutorial Appendix 337
The tools in the Planes palette are similar to those provided by the
Floor Manager dialog box of the building structure. For example,
you can use the Insert pair of planes, Insert or replace
roofscape, Insert or replace reference surface, and Insert
offset plane tools. Use New model to create a new plane model.

3 38 Palette window Allplan 2022
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

Engineering Tutorial Appendix 339
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

3 40 Palette window Allplan 2022
Layers palette
By using the Layers palette, you can access the layer structure
quickly and easily. The palette displays the entire layer hierarchy. You
can define the visibility of layers, change the layer status, select the
current layer, and choose privilege sets and print sets. When you
select the Match current layer button at the bottom of the
palette, you can click an element to use its layer as the current layer.
Click to save the current layer setting as a favorite file (*.lfa); click
to load a favorite file. You can sort the layers alphabetically by
clicking on the column labels Short name or Full name in the list
header.
Note:
You can find the Customize User Interface... tool in the drop-down
list of the Quick Access Toolbar. On the Palettes tab, you can arrange
and customize the palettes to suit your needs. You can show and
hide the palettes as you need.
As an alternative, open the shortcut menu of a palette and select
Customize....

Engineering Tutorial Appendix 341
Compressed projects on the internet
Allplan Connect provides two compressed projects:
• Allplan 2022 Engineering Tutorial. This project comes with a
fileset structure and assigned drawing files. The project contains
four print sets. With these print sets, you control which layers are
visible. You will use these print sets in various places while
working on the project.
You can use this project if you want to work through the entire
Engineering Tutorial and start with Unit 1: basics.
• Allplan 2022 Engineering Tutorial (with model). This project
contains all drawing files with the complete design and drawing
files at different levels of completion so that you can get started
wherever you want. For example, you can immediately start
placing the reinforcement. You can fall back on this project if you
do not want to work through the entire tutorial. In addition, you
can use it for comparison if you want to check your own project.

3 42 Compressed projects on the internet Allplan 2022
Downloading compressed projects
You can download the compressed projects with the data for the
exercises in this tutorial from Allplan Connect, the service portal for
all Allplan users.
Go to
https://connect.allplan.com
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
a PDF file (Allplan 2022Engineering Tutorial).
• Save the zipped projects with the data for the exercises to any
folder on your computer.
Note: Serviceplus customers can find more step-by-step guides in
the Training area of Allplan Connect. It usually takes us one to two
working days to activate this restricted area so that Serviceplus
customers can access and download documents. Please note that
this service is available to Serviceplus customers only.
General information on Serviceplus is available at this Internet
address
https://www.allplan.com/serviceplus

Engineering Tutorial Index 343
Index
clipping path
A
create 130
access rights 308 modify 138
Actionbar configuration 327 show 138
contents and structure 328 column 44
show menu bar 249 common approaches in
align ProjectPilot 298
bar reinforcement placed 147 component axis 28
associative section without component parameters
height being delimited 130 column 44
attributes downstand beam, upstand
assign attribute values 273 beam 47
for projects 273 opening 49
match attributes 14 save as a favorite 71
B slab 68
wall 25
BAMTEC 247 compressed projects on the
basic carpet reinforcement internet 341
256 concrete component 97
carpet outline 251 copy
enter mounting strips 254 of bar reinforcement placed
place secondary 151
reinforcement 257 create BAMTEC file 261
placing symbols 261 cross-section catalogs 264
separate into files 254 cutting diagram 243
bar reinforcement 142
D
freehand 213
modification in palette 224 define reference point, overview
place in 3D 153, 164, 170 57
placing along leg 210 door 49
bar shape entry 206, 210, 213 downstand beam 47
open stirrup 153, 164 drawing file
stirrup 170 general 301
basic carpet reinforcement 256 status 302
bending schedule 200 drawing file status 302
box 88 drawing file structure 317
C E
carpet mounting strips 254 edge reinforcement
check list 16 meshes 240
reinforcing bars 233

3 44 Index Allplan 2022
engineering role, task in drawing files 311
modeling 87 line attributes 14
reinforcement 124 make visible, frozen 61
unfinished structure 12 manage 310
extension pen, line, color 14
single-tier 29 print sets 321
extrude along path 92 select current layer 46
extrude bars along path 176 settings 14
troubleshooting 63
F
visibility 309
favorites layout
save 71 definition 282
fileset elements 287
create, new 317 layout window 292
folded 136 print 289
freehand 213 print set 287, 321
full schema 197 line attributes for layers 14
G line for layer 14
linear placement
general arrangement drawing 17
along leg 210
H along placing line 206
height M
absolute heights 25 match element 172
enter parameters 25 meshes 228
help 3 model
hidden edges 42 reinforce with 3D model
hidden reinforcement 180 (method 1) 125
hidden-line image 42, 57 reinforce with 3D model
K (method 2) 203
reinforce without 3D model
key plan 107
(method 3) 227
modify 114
modification in palette
L mark 224
placement 224
label 287
modify mesh cross-section
label bar reinforcement placed
catalog 264
184
label style O
create 275
observer 136
layers 305
offset polyline 77
access rights 308
open stirrup
advantages 310
enter manually 143
assignments 63
expanding mode 153
attributes 307
opening
format properties 307
enter 49
general 305


## Sayfa 351

Engineering Tutorial Index 345
output download compressed
layout 281 projects 341
symbols 221 path for settings 313
project attributes 273
P
project organization
palette window 331 tip 321
connect palette 339 ProjectPilot
Issue Manager palette 338 common approaches 298
layers palette 340 PythonPart with reinforcement
library palette 334 189
objects palette 335
R
planes palette 336
properties palette 332 reinforce
wizards palette 333 with 3D model (method 1) 125
paste with 3D model (method 2) 203
symbols in catalog 219 without 3D model (method 3)
pen 227
for layer 14 reinforce recess 233
pen thickness reinforcement drawing 119
pen for architectural surface reinforcement schedule
elements 22 output as a legend 200
place automatically 153, 164, 170 send to printer 198
place bar reinforcement reinforcement schema 196
along leg 210
S
along placing line 206
automatic 153, 164, 170 save
extrude along path 176 component parameters as
freehand 213 favorites 71
hidden 180 save view 43
manual 147 secondary bar reinforcement
place excess mesh 240, 246 236
place in span secondary carpet reinforcement
meshes in polygonal area 231 257
meshes in rectangular area section
229 create 136
reinforcing bars 157 modify 138
planar polygonal surface 89 modify region 188
print standard section 189
layout 289 settings on the Actionbar 12
print set 287 show menu bar 249
requirements 272 slab 68
print preview 272 slab opening
priority 25 polygonal 73
project sources of information 3
create 313 training, coaching, and project
support 5

3 46 Index Allplan 2022
spacer 241 window
stair 66 three-dimensional 54
standard section 189 two-dimensional 82
starter bars 164
stirrup
enter manually 206
expanding mode 170
support reinforcement
meshes 239
symbols
get from catalog 221
write to catalog 219
T
task areas
3D objects 87
BAMTEC 247
bar reinforcement 142
components 21
design 76
key plan 107
meshes 228
sections 126
title block
as a label style 275
use label style 287
track tracing 13
troubleshooting 16
U
upstand beam 47
V
view 37
create 205
modify 216
viewports 37
volume solid 92
W
wall
direction of extension 31
walls
three-dimensional 25
two-dimensional 77

---
title: "Allplan 2022 BasicsTutl"
category: User_Guides
source: Allplan_2022_BasicsTutl.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2022
Basics Tutorial

Basics Tutorial

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
Document no. 220eng01m07-1-BM1021

Basics Tutorial

Contents

i

Contents
Before you start ... ......................................................................... 1
Requirements................................................................................................................ 2
Your feedback .............................................................................................................. 3
Sources of information............................................................................................ 4
Further help .............................................................................................................................5

Training, coaching, and project support ........................................................ 6

Unit 1: introduction ........................................................................ 7
Objectives ........................................................................................................................7
Exercise 1: file cabinet with drawers........................................................................ 8
Exercise 2: retaining wall with a drainage .............................................................9
Exercise 3: purlin roof ......................................................................................................10
Exercise 4: rotary ...............................................................................................................11
Exercise 5: title block .......................................................................................................12
Exercise 6: precast balcony.........................................................................................13
Exercise 7: Rietveld chair ..............................................................................................14

Creating the project ................................................................................................ 15
Understanding drawing files .......................................................................................19
Drawing file status ...........................................................................................................20

Basic settings ..............................................................................................................22
Actionbar Configuration ...............................................................................................22
Palette window ..................................................................................................................26
Settings on the Actionbar............................................................................................35
Track tracing .......................................................................................................................36

ii

Contents

Allplan 2022

Options.................................................................................................................................... 37
Pen settings .........................................................................................................................38

Controlling what’s on your screen................................................................. 39
Tools for displaying the model ..................................................................................39

How to ............................................................................................................................. 42
What if … .................................................................................................................................42
And what if ... ........................................................................................................................42

Unit 2: designing and modifying 2D elements ............... 43
Exercise 1: file cabinet with drawers............................................................. 44
Task 1: designing the file cabinet..............................................................................45
Task 2: modifying the file cabinet............................................................................63

Exercise 2: retaining wall with a drainage....................................................71
Task 1: designing a retaining wall with a drainage.......................................... 72
Task 2: hatching................................................................................................................ 80

Exercise 3: purlin roof .......................................................................................... 100
Task 1: designing a purlin roof ..................................................................................100
Task 2: labeling the purlin roof................................................................................. 123

Exercise 4: rotary with three roads .............................................................127
Task 1: designing a rotary with one road ..........................................................128
Task 2: pattern .................................................................................................................138
Task 3: completing the design ................................................................................ 157

Exercise 5: title block ........................................................................................... 166
Task 1: designing the title block .............................................................................. 167
Task 2: labeling the title block .................................................................................. 175
Task 3: saving the title block as a symbol in the library and
retrieving the title block..............................................................................................186

Basics Tutorial

Contents

iii

Exercise 6: precast balcony............................................................................. 195
Task 1: designing the precast balcony ................................................................196
Task 2: dimensioning the precast balcony....................................................... 212
Task 3: applying hatching to the precast balcony and printing
the result.............................................................................................................................224

Unit 3: 3D modeling ................................................................. 233
Exercise 7: Rietveld chair.................................................................................. 234
Task 1: designing the initial elements .................................................................235
Task 2: designing the 3D solids ............................................................................. 244
Excursus: design check, color, and texture....................................................255

Index .............................................................................................. 265

iv

Contents

Allplan 2022

Basics Tutorial

Before you start ...

Before you start ...
This tutorial gives you a quick and practical introduction
to all important tools for designing and modifying in
Allplan 2022.
This tutorial contains several examples in the form of
exercises, showing how to design in 2D and how to get
started in 3D modeling.

1

2

Requirements

Allplan 2022

Requirements
This guide assumes that you are familiar with and have a working
knowledge of Windows and Allplan 2022.
The basics are covered in the manual. In particular, you should know
• How to start and close Allplan 2022
• How to create a project
• How to make drawing files current, open them in edit or
reference mode, or close them
• How to use the tools for zooming; in particular, how to display the
entire drawing on the screen and how to zoom in on details
Work through the exercises in the sequence specified because tools
that are presented in detail in the earlier exercises are only referred
to by name in later exercises.

Basics Tutorial

Before you start ...

Your feedback
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

3

4

Sources of information

Allplan 2022

Sources of information
The documentation on Allplan consists of the following parts:
• The Help is the main source of information for learning about and
using Allplan.
While Allplan is running, you can get Help on the current tool by
selecting F1. You can also select
What’s This in the
Help
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
(https://connect.allplan.com).
• You can also find numerous publications on social networks.

Basics Tutorial

Before you start ...

5

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

6

Training, coaching, and project support

Allplan 2022

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

Basics Tutorial

Unit 1: introduction

7

Unit 1: introduction
This unit briefly introduces the seven exercises in this
tutorial.
You create a separate project for these exercises and
define basic settings which apply to all the exercises.
At the end, a short troubleshooting section makes sure
you succeed.

Objectives
The Actionbar configuration (on page 22) is the default setting in
Allplan 2022.
You can use the Draft role for all exercises in this tutorial. Exercises 1
to 6 require the Design task with the 2D Objects, 2D Areas, Quick
Access, Filter, and Change task areas.
The last exercise requires the Modeling task with the 3D Objects,
Boolean Operators, and Work Environment task areas.

8

Objectives

Allplan 2022

Exercise 1: file cabinet with drawers
• Precision drafting with the

Point snap options

• Applying the tools of direct object modification
• Basic edit tools
• Modifying the distance between parallel lines
• Stretching entities
• Copying and mirroring elements

Basics Tutorial

Unit 1: introduction

Exercise 2: retaining wall with a drainage
• Delta point
• Hatching and hatching definition
• Polyline entry tools

9

10

Objectives

Exercise 3: purlin roof
• More tools for editing elements
• Creating labels with text leaders

Allplan 2022

Basics Tutorial

Unit 1: introduction

Exercise 4: rotary
• Creating a circle
• Area detection and island detection
• Patterns and pattern definition
• Direct object modification - copy and rotate

11

12

Objectives

Exercise 5: title block
• More tools for editing elements
• Creating and saving symbols
• Retrieving a symbol from the library

Allplan 2022

Basics Tutorial

Unit 1: introduction

Exercise 6: precast balcony
• Creating and modifying dimension lines
• Hatching and hatching definition
• Print preview

13

14

Objectives

Exercise 7: Rietveld chair
• Introduction to modeling
• Using a work plane
• Excursus: surfaces

Allplan 2022

Basics Tutorial

Unit 1: introduction

15

Creating the project
You use drawing files and NDW files in Allplan 2022. Drawing files are
organized by project.
You will start by creating a project for the exercises in this tutorial.

To create a project
1

After having started Allplan 2022, you can create a new project
directly from the welcome screen. Click the corresponding tool
and go to step 4.

2 If you have turned off the welcome screen, click
Open Project... on the Quick Access Toolbar.

New Project,

16

Creating the project

Allplan 2022

3 The New Project, Open Project dialog box opens. Click
Project.

New

4 New Project - Specify Project name
Enter the project name: Basics Tutorial.
5 Use Location to select the place where you want to save the
new project. If you have the Workgroup Manager option, you
can see all computers that were added as servers to the
workgroup. If you have the Allplan Share option, you can also
select BIMPLUS.
6 If you want to save the project on BIMPLUS: Select the team and
enter the Bimplus model name.
7 You can select the country for the project templates in countryspecific templates.
The new project does not require a project template. Therefore,
you can ignore this setting.

Basics Tutorial

Unit 1: introduction

17

8 Click Next >.

9 You will define new patterns and hatching styles as you go along.
You will use project-specific settings so that you do not
inadvertently change the office standard.
Note:
Organizing projects is
described in detail in the
Allplan Help and in the
Architecture Tutorial.

18

Creating the project

Allplan 2022

Change all path settings to project and click Finish to confirm
the dialog box.

Allplan creates the Basics Tutorial project and opens it
automatically.
Path settings:
The path settings define which pen definitions, line definitions,
hatching definitions, fonts, and material catalogs you use. You
usually work with the office standard.
Office:
Choose this option if you want to use the same settings to work on
different projects. In a network environment, the office standard is
the same on all computers and can be changed only by users with
special privileges.
Project:
Choose this option if you want to use the settings for this project
only. The settings can be different from those in the office standard.

Basics Tutorial

Unit 1: introduction

19

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

20

Creating the project

Allplan 2022

Drawing file status
By selecting the drawing file status, you define the drawing file in
which you draw and which drawing files are visible or can be
changed. The following illustration shows the different drawing file
statuses. You can find explanations in the table.

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
Options
for all elements in reference drawing files. To do this, select the
- Desktop environment and open the Display page. You cannot open
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

The drawing file is temporarily assigned to the fileset. This assignment will
be lost as soon as you switch to a different fileset.

Basics Tutorial

Unit 1: introduction

21

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
placed manually
Sections task area.
These views and sections might be linked with other drawing files. Allplan
considers the model data in these linked drawing files.

The drawing file contains model data or views and sections linked with
other drawing files. Allplan links drawing files when you create views and
sections with the tools in the Reinforcement Views task area.
You can use the shortcut menu to list all reference drawing files of the
current drawing file or open its reference drawing files in edit or reference
mode.

By using the shortcut menu in the "Derived from building structure" area,
you can lock the update of drawing files with views and sections created
with the Update automatically option not being selected. Allplan cannot
update the result until the drawing file is unlocked or the Update
automatically option is selected. After having confirmed a prompt, you can
create a new view or section in the drawing file.

22

Basic settings

Allplan 2022

Basic settings
Define the settings that you will use in the exercises.

Actionbar Configuration
The Actionbar configuration is the default setting in Allplan 2022.
When you work with this configuration, you can find the Actionbar
above the workspace. In addition, you can see the Properties,
Wizards, Library, Objects, Planes, Issue Manager, Connect, and
Layers palettes on the left side.

Click the Allplan icon on the left side of the title bar to open
important tools such as save, copy, import, and export. The title bar
also includes the Quick Access Toolbar. By using a drop-down list,
you can select the tools that you want to display on this toolbar. In
addition, you can show and hide the menu bar, define the sequence
of the tools on the Quick Access Toolbar, and click Customize User
Interface... to open the Customize dialog box - Actionbar tab.

Basics Tutorial

Unit 1: introduction

23

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

24

Basic settings

Allplan 2022

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

Basics Tutorial

Unit 1: introduction

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

25

26

Basic settings

Allplan 2022

Palette window
The palette window displays the palettes as tabs. Palettes are
important controls of Allplan, making the user interface simple and
easy to use. You can float or dock each palette individually. In
addition, you can arrange the palette window or individual, freefloating palettes around the edge of the workspace or make them
float anywhere on your screen. You can even configure Allplan to
automatically show or hide the palette window or palettes arranged
around the edge.

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

Basics Tutorial

Unit 1: introduction

27

Wizards palette
When the Wizards tab is open, you have the following options:
Drop-down list at the top

Tabs on the right side of the
palette

Available tools

Select a wizard group

Select a wizard

Select a tool

28

Basic settings

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

Basics Tutorial

Unit 1: introduction

29

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

30

Basic settings

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

Basics Tutorial

Unit 1: introduction

31

The tools in the Planes palette are similar to those provided by the
Floor Manager dialog box of the building structure. For example,
you can use the
Insert pair of planes,
Insert or replace
roofscape,
Insert or replace reference surface, and
Insert
offset plane tools. Use
New model to create a new plane model.

32

Basic settings

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

Basics Tutorial

Unit 1: introduction

33

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

34

Basic settings

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

Basics Tutorial

Unit 1: introduction

35

Settings on the Actionbar
You can use the Draft role for all exercises in this tutorial.

To make settings on the Actionbar for the following
exercises
Tip: You can expand or
collapse all task areas of the
task currently selected by
selecting and holding the
Ctrl key while doubleclicking within the name line
of a task area. The width of
the Allplan window defines
how many task areas can
be expanded. If the window
is not wide enough, Allplan
starts on the left side,
expanding as many task
areas as possible.

1

Select the

Draft role.

2 Open the tab of the Design task.
3 Expand the 2D Objects task area by double-clicking within the
name line of this task area.
Note: The Actionbar is docked to the top of the working area. If
you want, you can drag the Actionbar to the bottom and dock it
there. You can also make the Actionbar float anywhere on your
screen. By double-clicking, you can dock it to the place where it
was docked last.

36

Basic settings

Allplan 2022

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

3 Turn off the Track tracing option

4 Click OK to confirm the settings; select ESC to close the
tool.

Line

5 Repeat these steps if you want to turn track tracing on again.

Basics Tutorial

Unit 1: introduction

37

Options
You will use the unit m for the following exercises.

To define settings in the options
1

Open the
Default Settings drop-down list on the Quick
Access Toolbar on the title bar and click
Options.

2 The Options dialog box opens. Click Desktop environment in the
left area.
3 Check the Enter lengths in option in the General area on the
right side. If it is not m, click the button and select m.

4 Click OK to confirm the settings.

38

Basic settings

Allplan 2022

Pen settings
Before you start drawing, define the line thickness (pen) and the line
type in the Properties palette. You can change these settings at any
time.
Each element can be given one of Allplan's 256 line colors or element
colors. However, the way elements look depends on the setting of
the Color stands for pen option in
Show/Hide ( View dropdown list on the Quick Access Toolbar):
• When the Color stands for pen option is selected, the element
automatically appears in the color that is linked with the current
pen thickness (default setting).
• When the Color stands for pen option is not selected, the
element appears on the screen in the line color selected.

To define the pen and line type
1

Switch to the Properties palette, go to the Format area, click the
Pen thickness drop-down menu, and choose 0.25 mm. You can
see the selected pen.

2 Click the Line type drop-down list and choose 1 (a continuous
line).
3 Click the Line color drop-down list and choose 1 (black).

Basics Tutorial

Unit 1: introduction

39

Draw all exercises in this guide with these basic settings, even if this
is not explicitly specified.
Allplan provides two different options for structuring drawing files:
• The building structure
• The fileset structure
You can use these two structures in parallel. The building structure is
particularly useful for logically structuring a building.
The exercises in this tutorial do not build on one another. Therefore,
use a separate drawing file for each exercise.

Controlling what’s on your screen
Tip: The
Actionbar
Configurator contains the
Window task area, where
you can find all the tools
mentioned here. You can
drag this task area onto
your Actionbar.

Allplan provides various tools that you can use to control how your
model and its design elements appear on the screen. Thus, you can
always choose the tool best suited to the task at hand.
You can access these tools from various places in Allplan. For
View and
Window drop-down lists
example, you can use the
on the Quick Access Toolbar. You can also use the shortcut menu
or the viewport toolbar. You can even use the keyboard and mouse
to control what's on your screen.

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

40

Controlling what’s on your screen

Tool

Use

Allplan 2022

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

or

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

Always on Top

You can use this tool to place the viewport so that it is always on top (that
is, in front of) the other ones.
You can only use this tool if you have not selected the Connected option
and the viewport is not maximized.

Basics Tutorial

Unit 1: introduction

Tool

Use

41

Right area:
Exposure
(only for the
Animation and
RTRender view
types)

Section Display

You can use this box to control the brightness in viewports of the
Animation or RTRender view type. You can enter a value between -25 and
25.
Important!
This setting only changes the way elements look in the active viewport. It
has no effect on rendering.
You can use this tool to display your design in an architectural section for
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

42

How to

Allplan 2022

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

Basics Tutorial

Unit 2: designing and modifying 2D elements

43

Unit 2: designing and
modifying 2D elements
This unit presents the basic 2D tools in Allplan 2022. In
particular, you will learn
 How to precisely place points by means of point snap,
offset entry, and other tools
 How to work with track tracing and direct object
modification
 How to modify existing elements
 How to apply hatching and patterns - you will
familiarize yourself with the polyline entry tools, which
are used by countless Allplan tools.
 How to modify and redefine hatching styles and
patterns
 How to connect text and design with a leader
 How to create a title block and save it as a symbol
 How to dimension components

44

Exercise 1: file cabinet with drawers

Allplan 2022

Exercise 1: file cabinet with drawers
In this exercise, you will design a file cabinet with drawers. You will
then modify the height of the file cabinet.

You will use the tools in the 2D Objects task area.

Basics Tutorial

Unit 2: designing and modifying 2D elements

45

Task 1: designing the file cabinet
The first exercise shows how to draw rectangles and how to copy
and mirror elements. In addition, you will learn how to use the
Reference point, Point of intersection, and Midpoint tools for
precision drafting.

Tools:

Objective:

Point snap options
Point snap and offset
entry
Offset Polyline
Circle
Midpoint
Copy
Options - desktop
environment - direct
object modification
Copy and Mirror
Delta point

Drawing the file cabinet as a rectangle
To draw the file cabinet as a rectangle
1

Click
Open on a Project-Specific Basis (Quick Access
Toolbar).

2 You do not need to create a building structure for this tutorial. As
the exercises in this tutorial do not build on one another, you will
use a separate drawing file for each exercise. Therefore, click
Cancel.

46

Exercise 1: file cabinet with drawers

Allplan 2022

The Open on a Project-Specific Basis dialog box: Drawing files
from drawing/building structure are opened on the Building
structure tab.
3 The Basics Tutorial has 10 drawing files.
Click drawing file number 1 and click a second time inside the
selection or select F2.
You can now enter a name for the drawing file.
4 Type File cabinet and select the Enter key to confirm.

5 Click Close.

Basics Tutorial

Unit 2: designing and modifying 2D elements

47

6 In the
Window drop-down list (Quick Access Toolbar), click on
1 Viewport to initially get the display of the following
construction in the
floor plan view only. Furthermore, in the
View drop-down list, deselect the
Show Coordinate
System setting.
7 Click

8 Select

Rectangle (2D Objects task area).

Based on diagonal line in the input options.

Note:
Make sure that Create rectangle as a polyline is not
selected in the input options because you will edit some lines of
the rectangle later.
9 Click in the workspace to place the first point of the rectangle.
Tip: To switch between
, , and
in the dialog
line, use the Tab key or
Shift+Tab.

10 The rectangle is 1.8 m long in the x-direction. Therefore, enter
dx = 1.8 in the dialog line. Select the Tab key to go to
dy.
11 The rectangle is 1.8 m high in the y-direction. Therefore, enter
dy = 1.8 in the dialog line and select the Enter key to confirm.
The file cabinet appears as a rectangle in the workspace.

12 Select Esc to close the

Rectangle tool.

48

Exercise 1: file cabinet with drawers

Allplan 2022

A note on Create rectangle as a polyline

Create rectangle as a polyline option in the
You can use the
input options to do the following:
• If
Create rectangle as a polyline is selected, you create the
rectangle as one connected element, which you can select with a
single mouse click.
• If
is not selected, the rectangle consists of individual lines that
you can select separately by clicking or as an entity group by
selecting and holding the Shift key while clicking.

Drawing the file cabinet by using offset polyline
The next step is to draw the frame of the file cabinet by means of the
Offset Polyline tool. Point snap helps you place points with great
precision.

To draw the file cabinet by using "Offset Polyline"
1

Click

Offset Polyline (2D Objects task area).

2 Enter the following values in the dialog line; select the Enter key
to confirm each value.
Number of parallel lines: 1
Offset: 0.05
3 Click the upper-right corner of the rectangle.
Right is selected in the input options.

Basics Tutorial

Unit 2: designing and modifying 2D elements

49

4 Open the shortcut menu by right-clicking in the workspace.
Select
Point snap options; select all options on this page
except Grid point and Reference point of dimension line.

As soon as you point to a point, the system will snap to this point.
The point snapped is marked with a red X.

50

Exercise 1: file cabinet with drawers

Allplan 2022

5 To draw the new rectangle outside the existing one, click the
corners of the file cabinet in a counterclockwise direction. To
close the polyline, make sure that the last corner you click
coincides with the first one.

6 Select the Esc key to close the

Offset Polyline tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

A note on the direction in which you enter the offset polyline
When you use
Offset Polyline, pay attention to the connection
between the setting in the input options and the direction in which
you enter the polyline:
• When you select right, you must enter the points in a
counterclockwise direction to draw the outer rectangle. By
entering the points in a clockwise direction, you draw the inner
rectangle.
• When you select left, it is the other way round.
Right setting:

(1) Direction
(A) Negative offset
(B) Positive offset

Left setting:

(1) Direction
(A) Negative offset
(B) Positive offset

51

52

Exercise 1: file cabinet with drawers

Allplan 2022

Designing drawers
Create a drawer by using the Rectangle tool. Allplan provides a
number of tools to help you place points with great precision. In the
following section, you will design the drawer by snapping to points
and entering offsets.

To design a drawer
1

Click

Rectangle.

Note: Check that
Create rectangle as a polyline is not
selected in the input options. Otherwise, the rectangle can be
addressed as a single entity only. You will copy individual lines of
the rectangle later. Therefore, make sure the lines can be
selected individually.
2 Check that

Delta point is selected in the dialog line.

3 To specify the rectangle’s starting point, point to the lower-left
corner of the inner cabinet line.
The system snaps to this point, which is indicated by a blue
CursorTip at the crosshairs. A red x appears on this corner, and
the
x-coordinate and
y-coordinate boxes are highlighted
in yellow in the dialog line.
4 Select the TAB key to go to the
0.02.

x-coordinate box and enter

A red point symbol (+) moves to the right.

Basics Tutorial

Unit 2: designing and modifying 2D elements

5 Click the corner or select ENTER to confirm.
You have defined the first point of the drawer.
6 Enter the coordinates of the diagonally opposite point of the
rectangle in the dialog line:
dx = 0.56
dy = 0.30
Select ENTER to confirm.

7 This completes the first drawer. You will design the other
drawers based on this first one.
8 Select ESC to close the

Rectangle tool.

A note on placing points by means of point snap and offset
entry
• Point to a point (do not click!):
Allplan snaps to this point; the boxes are highlighted in yellow in
the dialog line.
• Enter the relative coordinates dx and dy in the dialog line.
• Select Enter to confirm: This places the point.

53

54

Exercise 1: file cabinet with drawers

Allplan 2022

Creating the knob
Create the knob of the drawer by using the Circle tool. To position
the knob exactly, you will use the Midpoint option.

To draw a knob
1

Click

Circle.

2 The Circle context toolbar opens. Click
center and
Enter full circle.

Circle based on

3 To define the first point, open the shortcut menu and click
Midpoint.
4 First click the lower-left corner of the drawer.
5 Then click the upper-right corner of the drawer.
This defines the center of the circle.
6 Enter a radius of 0.02 in the dialog line and select ENTER to
confirm.

7 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

55

Copying the drawer
You will create the other drawers by copying the first one.

To copy the drawer
1
Tip: You can select
elements by enclosing them
in a selection rectangle. The
default setting is
Select
Elements Based on
Direction (Work
Environment task area): By
opening the selection
rectangle in the positive xdirection, you select only
the elements that are fully
bounded by the selection
rectangle. By opening the
selection rectangle in the
negative x-direction, you
select all elements that are
fully bounded or partially
bounded by the selection
rectangle.

Enclose the entire drawer in a selection rectangle that you open
from the lower left to the upper right (positive x-direction).

The knob is included because it is within the selection rectangle.
2 Point to a line of the drawer and click
toolbar.

Copy on the context

56

Exercise 1: file cabinet with drawers

Allplan 2022

3 From point or enter offset:
Click the lower-left corner of the drawer.

The drawer with the knob is attached to the crosshairs (at the
corner you just clicked).
4 Go to the coordinate dialog box and enter 5 for the
copies (do not select ENTER to confirm!).

Number of

5 To point or enter offset
To define the drop-in point, point to the upper-left corner of the
drawer so that Allplan snaps to this point.

Basics Tutorial

Unit 2: designing and modifying 2D elements

57

6 Click the drop-in point snapped.
Allplan creates the drawers on the left.
7 Select ESC to close direct object modification.

Note:
Use the Work Environment task area (Actionbar - all roles and all
tasks) to define how and which elements are selected by the
selection rectangle:
Selects the elements that are fully bounded by the selection
rectangle.
Selects the elements that are fully bounded or partially bounded
by the selection rectangle.
Selects the elements that are partially bounded by the selection
rectangle.

58

Exercise 1: file cabinet with drawers

Allplan 2022

Mirroring drawers
The next step is to copy and mirror the drawers to the right side by
means of the Copy and Mirror tool. The center axis of the file
cabinet will serve as the mirror axis.

To mirror the drawers to the right
1

Select the drawers by enclosing them in a selection rectangle
that you open from the lower left to the upper right (positive xdirection).

2 Point to a selected element, for example, a line.
3 The context toolbar for direct object modification opens,
providing four tools:

Basics Tutorial

Unit 2: designing and modifying 2D elements

59

You can add two more tools to this context toolbar.
To do this, click
Options ( Default Settings drop-down list
on the Quick Access Toolbar).
4 Open the Desktop environment - Direct object modification
page and drag the
Copy and Rotate and
Mirror without
Copy tools one after the other onto the context toolbar.

60

Exercise 1: file cabinet with drawers

Allplan 2022

5 Click OK to close the Options dialog box.
6 Select the drawers again by enclosing them in a selection
rectangle.
7 Point to a selected element, for example, a line.
The context toolbar opens. As you can see, it contains six tools.
8 Click

Copy and Mirror on the context toolbar.

9 Define the center axis of the file cabinet as the mirror axis.
Point to the top line of the file cabinet, open the shortcut menu,
Midpoint.
and click
Allplan snaps to the midpoint; this point defines the first point of
the mirror axis (see illustration).
10 To define the second point of the mirror axis, point to the bottom
line of the file cabinet and, on the shortcut menu, click
Midpoint again.

Basics Tutorial

Unit 2: designing and modifying 2D elements

A = Mirror axis
Allplan copies the drawers to the right.

11 Select ESC to close direct object modification.

61

62

Exercise 1: file cabinet with drawers

Allplan 2022

Creating a knob for the door in the middle
Finally, you will draw a knob for the door in the middle. To do this, you
will use the Midpoint and Based on center options.

To create a knob for the door in the middle
1

Click

Rectangle.

2 Click Based on center in the input options.

Midpoint. Then click two
3 Open the shortcut menu and choose
diagonally opposite corners of the door in the middle.
This defines the center of the rectangle.
4 Enter 0.1 for the length; select ENTER to confirm.
5 Enter 0.01 for the width; select ENTER to confirm.

6 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

63

Task 2: modifying the file cabinet
Based on the file cabinet designed, you will create a new cabinet that
is 2.1 m high. This cabinet has seven drawers. Start by copying the
design to a new drawing file. Then you will modify the design. In this
section, you will find out about the two most important modification
tools: Parallel to Element and Stretch Entities.

Tools:

Objective:

Copy, Move Elements
between Documents
Stretch Entities
Parallel to Element
Brackets

Copying a drawing file
Begin by copying the file cabinet you created in the last exercise to a
new drawing file.

To copy the drawing file with the file cabinet
 Only drawing file 1 File cabinet is open.
1

Click
Copy, Move Elements between Documents... in the
drop-down list of the Allplan icon on the title bar.

2 Select Copy and click OK to confirm.

64

Exercise 1: file cabinet with drawers

Allplan 2022

3 Select an empty drawing file (for example, drawing file 2) and
click OK to confirm.
4 The dialog line prompts you to select the elements that you want
to copy to the new drawing file.
You want to copy all elements in the drawing file. Therefore,
right-click in the workspace twice or click All in the input options.
This copies the file cabinet to the new drawing file.
5 Click
Open on a Project-Specific Basis (Quick Access
Toolbar) and select the drawing file to which you have just copied
the file cabinet.
6 Enter a name for drawing file 2, for example, File cabinet,
modified.

7 Make drawing file 2 current, close drawing file 1, and close the
dialog box.
8 Click
Zoom All (viewport toolbar) to display the entire file
cabinet on the screen.

Basics Tutorial

Unit 2: designing and modifying 2D elements

65

Stretching entities
In this section, you will modify the upper two corners of the file
cabinet, giving the file cabinet a new height of 2.1 m. In addition, you
will add two drawers by using the Copy tool. To do this, you will use
direct object modification.

To stretch entities
1

Right-click in the workspace and select the
tool on the shortcut menu.

Stretch Entities

2 Select all points that you want to modify. Make sure that you
select the two top drawers together.

3 From point:
Click the upper-left corner of the file cabinet.

66

Exercise 1: file cabinet with drawers

Allplan 2022

4 To point:
The file cabinet is 2.1 m high; in other words, you must lengthen
Delta point in
the file cabinet by 0.3 m in the y-direction. Click
the dialog line and enter
dy = 0.30.
Tip: You can also enter the
values in the dialog line
without clicking a starting
point:
dx = 0
dy = 0.30

Select ENTER to confirm.
5 Select the Esc key to close

Stretch Entities.

6 Select the elements that make up the two incomplete drawers
(two lines and circles each) by enclosing them in a selection
rectangle that you open from the lower left to the upper right
(positive x-direction).

Basics Tutorial

Unit 2: designing and modifying 2D elements

7 Point to one of the two selected lines and click
context toolbar.

67

Copy on the

8 From point:
Click the lower-left corner of the incomplete drawer on the left
side.

9 To point or enter number of copies:
Select the Tab key to switch to
in the coordinate dialog box
and enter dy = 0.30.

68

Exercise 1: file cabinet with drawers

10 Select ENTER to confirm.

11 Select ESC to finish.

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

A note on selecting and modifying several elements and
regions together by using the brackets
As an alternative to the selection rectangle, you can use the
brackets to select elements one after the other. Do the following:
• Select an edit tool.
• Open the

Brackets by right-clicking in the workspace.

• Click the elements one after the other or open selection
rectangles around the elements that you want to select.
• To exclude an element from the selection, simply click it again.
• Close the brackets.

Adding a frame
To finish, you can enhance the file cabinet by adding a frame to the
door in the middle. To do this, you will use the Parallel to Element
tool.

To add a frame
1

Click
Parallel to Element (2D Objects task area).
The dialog line prompts you to select an element.
Click the inner cabinet edge on the left side.

2 Through point or offset:
Enter 0.6 in the dialog line and select ENTER to confirm.
3 Which side?
Click to the right of the line.
4 Number:
Enter 1 and select ENTER to confirm.
5 The
Parallel to Element tool is still active. The program
computes the distance to the next line based on the new
element.
6 Check that the value in the dialog line is 0.6; select ENTER to
confirm.

69

70

Exercise 1: file cabinet with drawers

Allplan 2022

7 Number:
Check that the number in the dialog line is 1; select ENTER to
confirm.

8 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

Exercise 2: retaining wall with a drainage
In the following exercise, you will design a cross-section of a
retaining wall with a drainage.

You will use the tools in the 2D Objects, 2D Areas, Filter, and
Change task areas.

71

72

Exercise 2: retaining wall with a drainage

Allplan 2022

Task 1: designing a retaining wall with a drainage
In this section, you will learn how to use delta points to create lines
that are parallel to neither the x-axis nor the y-axis. By means of
delta points, you can place a point at a specific distance from an
existing point.
To enter delta points, use
Tools:
Line
Delta point
Circle
Track line

Delta point in the dialog line.

Objective:

Basics Tutorial

Unit 2: designing and modifying 2D elements

73

Retaining wall of angular shape
To draw the retaining wall
1

Click
Open on a Project-Specific Basis and open an empty
drawing file. Name it Retaining wall and close all the other
drawing files.

2 Click
Tip: Make sure that the
Element option is selected
in the
Point snap
options. To check this,
right-click to open the
shortcut menu.
Click
Point snap
options.

Line in the 2D Objects task area.

3 The Line context toolbar box opens. Select the
option and click the starting point of the line.

Polyline

4 <Line> To point
Enter
dx = 3.00 in the dialog line; select ENTER to confirm.
5 <Line> To point
Enter
dy = 0.30 in the dialog line; select ENTER to confirm.

The next point is not perpendicular to the previous point.
However, you know the offsets in the x-direction and yDelta point to place this point.
direction. Use

74

Exercise 2: retaining wall with a drainage

Tip: Select the TAB key to
go to the next box in the
dialog line.
Select ENTER to confirm
the values.

6

Delta point is already selected in the dialog line.
Enter the following values:
dx = -2.00
dy = 0.20

7 Select ENTER to confirm.

To place the next point, use

Delta point again.

8 Enter the following values in the dialog line:
dx = -0.2
dy = 4.0

9 Select ENTER to confirm.

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

75

10 You can enter the next two lines in two ways:
As these two lines are perpendicular to the previous point, you
can create them by entering values directly in the dialog line or by
means of track lines.
First option:
Draw the horizontal line by entering the length in the x-direction
= -0.30 - ENTER.
in the dialog line:
Draw the vertical line by entering the length in the y-direction in
= -4.00 - ENTER.
the dialog line:
Second option:
Turn on track tracing by clicking
Track line in the dialog line.
Point to the end of the last line you created. Slowly move the
crosshairs to the left. The 0.0-degree track line appears.

As soon as Allplan displays l = 0.300 for the offset, click this point
or enter 0.3 m for
Offset to reference point in the dialog line.
Then select ENTER to confirm.

76

Exercise 2: retaining wall with a drainage

Allplan 2022

Note: Track lines display a preview of the current length. This
length is a multiple of the grid length that you can enter next to
Rasterize length in the dialog line. If you cannot define the
required length by means of track lines, it is a good idea to change
the grid length.
To draw the second line, slowly move the crosshairs vertically
downward. The 90.0-degree track line appears.

As soon as Allplan displays l = 4.000 for the offset, click this point
or enter 4 m for
Offset to reference point in the dialog line.
Then select ENTER to confirm.

11 You can also use track tracing to place the next point.
Point to point A and wait at least 500 milliseconds. The program
creates a track point from the point snapped.

Basics Tutorial

Unit 2: designing and modifying 2D elements

77

12 Then point to point B (= first point of the design). Wait
until Allplan has identified points A and B as track points and
marked them with blue squares.
13 Start at point B and move the crosshairs vertically upward as far
as the point where the 90.0-degree track line intersects the 0.0degree track line.
Click this point.

See also:
Track tracing is described in detail in the Allplan Help.
14 Turn track tracing off by clicking

Track line in the dialog line.

15 Finish creating the retaining wall by clicking the starting point of
the first line (point B).
16 Select ESC twice to close the Line tool.

78

Exercise 2: retaining wall with a drainage

Allplan 2022

Drainage
To design the drainage
1

Click

Circle in the 2D Objects task area.

2 The Circle context toolbar opens. Click
center and
Enter full circle.

Circle based on

3 Point to the lower-left corner of the retaining wall. This point is
marked with a red X.
4

Delta point is selected in the dialog line. Enter the following
values:
dx = -0.5
dy = 0.5

Select ENTER to confirm.

This defines the center of the circle.
5 Enter a radius of 0.1 in the dialog line; select ENTER to confirm.

Basics Tutorial

Unit 2: designing and modifying 2D elements

6 Select ESC to close the tool.

79

80

Exercise 2: retaining wall with a drainage

Allplan 2022

Task 2: hatching
In this section, you will apply hatching to the retaining wall. You will
also learn about the principles of entering polylines. The polyline
entry tools are used by just about all functions that expect you to
define polylines or polygonal-bounded areas (for example, hatching,
pattern, fill).
Tools:

Objective:

Hatching
Filter by Element
Type
Area detection
Modify Format
Properties
Hatching
defaults

Applying hatching to the retaining wall
To apply hatching to the retaining wall
1

Click

Hatching (2D Areas task area).

2 Click Properties on the Hatching context toolbar.

Basics Tutorial

Unit 2: designing and modifying 2D elements

3 Select hatching style 5 and define the following parameters:
• Line spacing area:
Constant in layout, as defined in defaults
• Reference point area:
Origin

4 Click OK to confirm the settings.
Tip: When you click Multi in
the input options, you can
enter as many areas as you
want.
After you have selected
ESC to finish entering the
polyline, Allplan applies
hatching to these areas in
one go.

5 Click Single in the input options.

81

82

Exercise 2: retaining wall with a drainage

Allplan 2022

6 To define the area for hatching, click the corners of the retaining
wall one after the other.

7 To close the polyline, select ESC after you have clicked the last
point or click the first point again.
Allplan applies the selected hatching to the retaining wall.

8 Select ESC to close the

Hatching tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

83

Copying the outline of the retaining wall
In addition to clicking each corner of the polyline (as described), you
can enter polygonal-bounded areas in other ways. By using the
retaining wall as an example, the following exercise shows you how.
Start by copying the wall so that you have a copy for experimenting.
In doing so, you will use a filter to copy the retaining wall without the
hatching.

To copy the outline of the retaining wall
1

Right-click in the workspace and select
menu.

Copy on the shortcut

2 <Copy> Select the elements you want to copy
The Filter task area has not been expanded yet. Point to the icon
in this area and click within the blue part at the bottom of this
area. The drop-down list opens, displaying all tools in the Filter
task area.
Click
Filter by Element Type.

84

Exercise 2: retaining wall with a drainage

3 Select Line and Circle; click OK to confirm.
Tip: You can also use the
properties of the outline as
Match
a filter. Click
parameters and click the
required element.

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

85

4 <Copy> Select the elements you want to copy < =Line =Circle>
Enclose the retaining wall in a selection rectangle.

As you have selected the Line and Circle filters, only the outlines
of the retaining wall and the drainage appear in the selection
color.
5 <Copy> From point
Specify the starting point for the copy; place the retaining wall in
the workspace. The position is irrelevant. However, make sure
that the two retaining walls do not overlap.
6 Select ESC to close the
7 Click

Copy tool.

Zoom All to display both walls on the screen.

86

Exercise 2: retaining wall with a drainage

Allplan 2022

Minimized task areas do not show all tools. To open the flyout menu
of one of these tools, click the downward arrow. You can then see all
the tools in the collapsed area.
You can maximize or minimize a task area by double-clicking within
the name line of a task area.

A maximized task area shows more tools, which can also have flyout
menus.

Applying hatching by means of area detection
The next step is to apply hatching to the copy of the retaining wall.
To do this, you will use a tool that automatically detects closed,
delimited areas.

To apply hatching by means of area detection
1

Click
Hatching (2D Areas task area or
list on the Quick Access Toolbar).

Repeat drop-down

2 Hatching style 5 is still selected on the Hatching context toolbar.
If it isn't, click Properties and select hatching style 5. Click OK to
confirm.
3 Click
4 Select

Single in the input options.
Area detection in the input options.

Basics Tutorial

Unit 2: designing and modifying 2D elements

87

Note: You can select
Area detection only when Polygonize
elements is turned on.

5 Click a point within the retaining wall.
Allplan automatically detects the outline, polygonizing the entire
retaining wall.
Single is selected in the input options. Therefore, you can
immediately see the hatching.

6 Select ESC to close the

Hatching tool.

88

Exercise 2: retaining wall with a drainage

Allplan 2022

Modifying hatching
Modify the hatching pen.

To modify the hatching pen
1

Click

Modify Format Properties in the Change task area.

2 To change the pen, open the Pen thickness list box and select
pen number 7 with a thickness of 0.13 mm.
This automatically selects the Pen thickness check box.

3 Click OK to confirm.
The dialog line prompts you to select the elements that you want
to draw with the new pen. Here, too, use a filter because you
want to modify the hatching only.

Basics Tutorial

Unit 2: designing and modifying 2D elements

89

4 Point to the icon in the Filter task area and click within the blue
part at the bottom of this area.
Tip: You can combine as
many filters as you want.

5 Click

Filter by Element Type in the drop-down list.

6 Select Hatching and click OK to confirm.
7 Enclose the two retaining walls in a selection rectangle.
As you have used a filter, Allplan modifies the hatching only.
8 Select ESC to close

Modify Format Properties.

Hatching defaults
Allplan 2022 comes with a wide range of ready-made hatching
styles. You can also define your own hatching styles or modify
existing hatching styles.
If you have worked your way through the exercises step by step,
you selected the Project paths for patterns and hatching styles
when you created the project for this tutorial. In other words, any
changes you make to defaults (for example, hatching, pattern)
affect the current project only.
If the Office path is selected, you run the risk of modifying the office
standard. This means that any changes you make affect all projects
based on the office standard.

To define or modify hatching styles
1

Open the
Default Settings drop-down list on the Quick
Access Toolbar and select Defaults.

90

Exercise 2: retaining wall with a drainage

Allplan 2022

2 The Defaults dialog box opens. Select Hatching and click OK.

Note: If the You are modifying the hatching in the office path
message appears, the settings you are about to make will modify
the patterns and hatching styles in the Office path.

In this case, click Cancel and change the path to Project, which is
described in the following section.

Basics Tutorial

Unit 2: designing and modifying 2D elements

3 Click the button next to Hatching number in the top part of the
Hatching Definition dialog box.

91

92

Exercise 2: retaining wall with a drainage

Allplan 2022

4 To modify an existing hatching style, select the required number.
To define a new hatching style, select an unassigned number.

5 Make the required settings in the Hatching Definition dialog box.
Note: You can use the Pen and color defined in defaults are
used for display option to specify whether you want to use the
pen in the Properties palette or the pen defined in this dialog box.
6 Click OK to confirm the dialog box. If you have changed the
defaults, confirm the following prompt by clicking Yes.

Basics Tutorial

Unit 2: designing and modifying 2D elements

93

The following section shows how to switch the path settings for
patterns and hatching styles to project. You only need to do this
when you see the You are modifying the hatching in the office
path message after you have selected the hatching defaults.

To switch the path settings for patterns and hatching
styles to project
Tip: You can also access the
path settings by clicking
New Project, Open
Project... on the Quick
Access Toolbar. Open the
shortcut menu of the
Basics Tutorial project and
click Properties....

1

Click
ProjectPilot in the drop-down list of the Allplan icon on
the title bar.

2 Open the Projects folder.
3 Right-click the Basics Tutorial project and select Properties.
4 Open the Settings tab, go to the Path settings area, and select
Project for Patterns, hatching styles, area styles.

5 Click OK to confirm.
Allplan copies the office standard to this project.
6 Close ProjectPilot by clicking Exit on the File menu.

94

Exercise 2: retaining wall with a drainage

Allplan 2022

Polyline entry tools
When working with Allplan 2022, you will find that the polyline entry
tools help you a lot. This feature is used by countless Allplan tools
that expect you to define polylines or polygonal-bounded areas (for
example, fills, patterns, slabs, and roof outlines).
The polyline entry tools, which are included in the Input Options,
open automatically when you select a tool for which they are
available.

Select the check box in the input options to turn on the polyline entry
tools.

Input options for entering polylines, overview
The Input Options open whenever you select a tool that uses
polyline entry tools (for example, pattern, hatching, room). You can
use these options to specify how the polyline entry tools handle
architectural lines and how these tools behave when you create
polylines based on existing elements.

Entering areas
Single
Use this to create single, discrete areas.
Multi
Use this to create areas composed of several polygons. Hatching,
patterns, or fills get the same group number; rooms are handled as a
single entity. Consequently, you can define separate rooms, which
Allplan then analyzes as a single room.

Basics Tutorial

Unit 2: designing and modifying 2D elements

Plus,

95

Minus

When you select
Multi, you can use
Plus and
Minus in the
input options to specify whether each new polygon you enter will be
added to or subtracted from the overall area.
Polygonizing existing elements
Polygonize elements on/off
When the check box is not selected, Allplan ignores elements when
you click them. In this mode, Allplan detects points only.
When the check box is selected, Allplan polygonizes the elements
you click. You can use the options next to this check box to specify
the type of polygonization.
Polygonize entire element
This uses the entire element that you clicked. The starting point
defines the direction of polygonization. If the last point in the polyline
coincides with the starting point or end point of the element, you do
not need to specify the direction.
Use this option when the outline consists of entire elements.
Define area of element to polygonize
With this option, the program prompts you for the area with every
element you click (from point, to point).
Use this option when the outline consists of segments.
Enter reference point
With this option, the program prompts you for the reference point
with every element you click. This option uses a point on the element
clicked with a defined offset to the reference point. Click to define a
new reference point and then enter the offset to the reference
point. Use this option when you want to specify the outline based on
existing elements (when you enter a dormer, for example).

96

Exercise 2: retaining wall with a drainage

Allplan 2022

Area detection using additional point
Area detection using additional point combines areas bounded
by lines and polylines to form a polygon. Allplan uses the inner
boundaries or outer boundaries depending on whether you click the
additional point inside or outside the outline.
Element filter, you can configure the program to
By selecting
ignore architectural lines when detecting areas.
Area detection
You can use
Area detection to automatically detect the outlines
of closed polygons. You can use closed areas delimited by design
entities of any kind as an outline polygon simply by clicking
anywhere within the area. Allplan automatically detects and
polygonizes the entire outline. The boundary elements can have
points in common; they can intersect or touch. You can turn this
automation feature on and off at any time.
Note: The Minimum distance between points setting in the
Options on the Desktop environment page also applies to the
Area detection tool. To make sure that Allplan detects outlines
with small gaps, you can increase the minimum distance between
points temporarily.
Island detection,

Inverse island detection:

Island detection detects closed outlines within an area and
automatically cuts them out.
Inverse island detection does not cut out closed outlines but fills
these outlines with the selected surface element. It is the area
around the "island" that remains empty.
You can use these tools only together with
additional point and
Area detection.

Area detection using

Basics Tutorial

Unit 2: designing and modifying 2D elements

97

Number of segments, Rise
Number of segments
The polygonization value is interpreted as the number of segments.
The value for
Number of segments defines the number of
segments used to approximate a curve. In the case of a circle, for
example, 120 means that a full circle is approximated by a 120-sided
polygon. The higher the required degree of accuracy or the larger
the radius, the greater the number of segments should be used to
approximate a circle. You can enter a value between 36 and 360.

(A) Segments in circle = 36; this produces an angle of 10°

Rise
The polygonization value is interpreted as the rise. The value you
enter for
Rise defines the maximum rise of the secant relative to
the arc (in mm). As a result, the curve is polygonized so that the
maximum offset of the polyline's segment to the curve is less than
or equal to the value you specified. This setting produces more
accurate results than the number of segments.

(B) Rise (38 mm or less)

98

Exercise 2: retaining wall with a drainage

Allplan 2022

Element filter
Element filter
Ignore plan lines of architectural elements
Ignore 2D surface elements (hatching, patterns, fills, bitmap
areas, smart fit placements) when using area detection
When you select the
Element filter, Allplan ignores lines of
architectural elements and 2D surface elements when you use
Area detection or
Area detection using additional point. Use
this option if you want to automatically apply surface elements like
hatching, patterns to adjacent outlines that are separated by arcs,
splines, or curves.
Here is some background information: Allplan polygonizes curves
based on the number of segments specified.
When you enter a second (third...) area, Area detection can take a
long time or produce incorrect results because Allplan detects both
the outline of the surface (2D line) and the boundary line of the
polyline of the first area.
Back, Help
Back
Undoes the last point you entered.
Help for entering polylines
Displays help for the polyline entry tools.

Basics Tutorial

Unit 2: designing and modifying 2D elements

99

Additional tools in the dialog line
When entering points, you can find the following drawing aids in the
dialog line:

Icon

Tool

Use

Enter at right
angles

The line can be drawn only at
right angles to the current
system angle.

Enter using
cursor snap

The line can be drawn only at
specific angles.

Angle

Define the cursor snap angle. You
can see the current angle.

Note: While you are entering a polyline, it can happen that you
inadvertently click a point. By clicking
Back in the input options,
you can undo the last point entered.

100

Exercise 3: purlin roof

Allplan 2022

Exercise 3: purlin roof
In this exercise, you will design a purlin roof. In addition, you will label
the roof design and add text leaders.

You will use the tools in the Draft role - Design task - 2D Objects,
Filter, and Quick Access task areas.

Task 1: designing a purlin roof
You will learn how to use the Intersect 2 Entities, Polar
Coordinates, and Division Point tools.
Tools that were covered earlier in previous exercises (for example,
rectangle, parallel to element, brackets) are not described in detail in
this exercise.
Tools:

Objective:
Intersect 2 Entities
Division point
Track line

Basics Tutorial

Unit 2: designing and modifying 2D elements

101

Slab and rafters
The first part of this exercise involves designing the slab, the roof
beams, and the rafters. You will draw the slab as a rectangle and
create the rafters as lines and parallel lines. First, you will design the
rafter on the left side and then copy it to the right side.

To draw the slab and the rafters
1

Click
Open on a Project-Specific Basis and open an empty
drawing file. Name it Purlin roof and close all the other drawing
files.

2 Click
Rectangle (2D Objects task area) and select
on diagonal line in the input options

Based

3 Draw the concrete slab as a rectangle.
x-coordinate = 5.74 (length);
y-coordinate = 0.22 (width)

Rectangle tool is still open. Click the upper-left corner of
4 The
the concrete slab and create a roof beam:
= 0.12 and
= 0.12

5 Click

Line in the 2D Objects task area.

6 Click
Individual lines on the Line context toolbar. To define
the starting point of the line, click the upper-left corner of the
beam (see illustration).
You will create the roof overhang later.
7 The roof pitch is 30°.
To draw a line at this angle, click

Enter using cursor snap.

8 Enter 30 to define the angle.
Now you can draw the line only at an angle of 30° (and in steps
incremented by 30°).

102

Exercise 3: purlin roof

Allplan 2022

9 Draw the line as shown in the illustration; place its end point by
clicking. Make sure that the line is long enough. You can delete
redundant segments later.

Parallel to Element
10 The rafter rests on the roof beam. Click
(2D Objects task area) and create the bottom edge of the rafter.
Enter 0.03 to define the offset.

Parallel to Element tool is still open. To create the top
11 The
edge of the rafter, enter -0.14 for the offset (opposite direction!).
Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

103

12 Right-click the line in the middle and select Delete on the
shortcut menu to remove the reference line.

13 The next step is to create the vertical end of the rafter.
Click
Parallel to Element again. To define the reference
element, click the left edge of the slab and enter 0.30 for the
offset (= roof overhang).

14 Lengthen the top and bottom edges of the rafter as far as the
point where they intersect the vertical edge. To do this, use the
Intersect 2 Entities tool.
Right-click the top edge of the rafter and select
Entities on the shortcut menu.

Intersect 2

15 To define the second element, click the vertical edge of the rafter.

104

Exercise 3: purlin roof

Allplan 2022

16 Click the bottom edge of the rafter and then the vertical edge.

Allplan intersects the lines. The next step is to delete the
redundant line segments.
17 Right-click one of the lines that you want to delete and select
Auto-Delete Segment. Click the protruding line segments.

The left rafter is complete. To create the right rafter, you will
mirror the left rafter about a vertical line which passes through
the middle of the roof beam.

Basics Tutorial

Unit 2: designing and modifying 2D elements

105

18 Open a selection rectangle from the lower left to the upper right
(positive x-direction) to select the left rafter and the left roof
beam.

19 Point to a line of the rafter and click
context toolbar.

Copy and Mirror on the

20 To enter the mirror axis, you can use track tracing.
Select the F11 key to turn on track tracing.

106

Exercise 3: purlin roof

Allplan 2022

21 Place point 1 for mirror axis: The first point of the mirror axis is the
center of the beam. Select
Midpoint on the shortcut menu
and click the top edge of the beam.
Click the center of the beam which is marked with a red cross.

2nd point of mirror axis: By means of track tracing, you can
display the track line that is perpendicular to the first point of the
mirror axis (= midpoint of the top edge of the beam). Move the
crosshairs roughly at a 90-degree angle above or below the first
point of the mirror axis. The 90.0-degree track line appears. Click
this line wherever you want.
Allplan creates a vertical mirror axis, mirroring and copying the
selected elements.

22 Select ESC to finish.
23 To delete the protruding line segments, open the shortcut menu
of one of these line segments and click
Auto-Delete
Segment.
24 Click all protruding line segments. The result should look like this:

Basics Tutorial

Unit 2: designing and modifying 2D elements

25 To draw the line between the two rafters, click
Individual lines.

107

Line and select

26 Draw a vertical line as shown in the illustration.

27 Select ESC to close the

Line tool.

Ridge purlin and collar beam
In this section, you will draw the ridge purlin, the center purlin, and the
collar beam. Begin by drawing the ridge purlin as a rectangle. Then
create the collar beam and the center purlin by intersecting two
elements and drawing a parallel line.

To draw the ridge purlin and the collar beam
1

Click
Rectangle and select Based on center line in the input
options.

2 Starting point: Click the bottom point where the two rafters
intersect.
End point: Click Delta point in the dialog line and enter the ydirection: -0.16.
Point or half the width: Enter half the width of the ridge purlin:
0.05.

108

Exercise 3: purlin roof

Allplan 2022

3 Use the elements of the ridge purlin to create the center purlin
and the collar beam.
4 Draw the bottom edge of the collar beam based on the bottom
edge of the ridge purlin. Click
Parallel to Element and enter
0.12 for the offset.

5 The bottom edge of the ridge purlin is to intersect the two outer
edges of the rafters.
6 To achieve this, point to the bottom edge of the ridge purlin. Open
the shortcut menu and click
Intersect 2 Entities. This selects
the first element. To define the second element, click the right
outer edge of the rafter.
7

Intersect 2 Entities is still open. The bottom edge of the ridge
purlin is to intersect the outer edge of the left rafter.

Basics Tutorial

Unit 2: designing and modifying 2D elements

109

8 Use the same approach to ensure that the bottom edge of the
collar beam intersects the outer edges of the two rafters.
9 Use track tracing to join the two vertical edges of the ridge purlin
with the top edge of the slab.
Select the
Line tool and click
Individual lines.
10 Point to the vertical, right edge of the ridge purlin and move the
crosshairs in a vertical direction.
The 90.0-degree track line appears. Move the crosshairs along
this track line until Allplan displays the point where the track line
intersects the collar beam. Click this point.

11 Follow the track line as far as the point where the track line
intersects the top edge of the slab and click this point.

110

Exercise 3: purlin roof

Allplan 2022

12 Repeat steps 10 and 11 for the left edge of the ridge purlin.
13 Use
Auto-Delete Segment (shortcut menu of a line segment
that you want to delete) to delete redundant line segments.
The design should look like this:

14 Select ESC to close the

Auto-Delete Segment tool.

Construction lines
You will use six nails to fasten each rafter to the collar beam. First,
create a grid consisting of lines in construction-line format. To do
this, use the Division point tool, which you can find on the shortcut
menu when a tool is active (for example, Line). This grid will help you
place the nails later. You can use the Division point tool to identify
division points of lines or other design entities. The nails will be placed
on the points where the gridlines intersect.
Tip: The color and line type
of construction lines are
based on the setting in the
Options - Desktop
environment - Display
page.

To draw horizontal construction lines
1

Draw the gridlines as construction lines.
To turn on construction-line mode, select the
line check box in the Properties palette.

2 Click
Click

Construction

Line in the 2D Objects task area.
Individual lines on the Line context toolbar.

3 To define the starting point of the line, click
the shortcut menu.

Division point on

Basics Tutorial

Unit 2: designing and modifying 2D elements

111

4 Click the endpoints of the line that you want to divide.

A = Starting point
B = End point
5 Click division point: Enter the number of divisions in the dialog line:
n = 6.

Allplan temporarily displays the division points on the screen.
6 To define the division point where the line is to start, enter its
number (1) in the dialog line and select ENTER to confirm.
Allplan starts to count at point A (= the starting point of the line
you divided).
You can also define the division point by clicking it.
Tip: By entering -1, -2, and
so on, you can also identify
division points that are on
the extension of the division
line.

112

Exercise 3: purlin roof

Allplan 2022

7 To point or enter length: As the line is horizontal, you can use the
0.0-degree track line to define the end of the line.
The exact length of the line is not important. However, make sure
that it projects beyond the right edge of the rafter.

A = Division point 1
B = 0.0-degree track line
8 Select ESC to close the

Line tool.

9 Create four equidistant copies of the construction line and place
them above the first one.
Copy tool on the
Click the construction line and select the
context toolbar.

Basics Tutorial

Unit 2: designing and modifying 2D elements

113

10 From point or enter offset:
Click the point where the outer edge of the rafter intersects the
bottom edge of the collar beam (see illustration).

11 To point or offset:
Enter the
Number of copies in the coordinate dialog box: 4.
12 Click the point where the outer edge of the rafter intersects the
construction line (see illustration).

13 Select ESC to close the

Copy tool.

114

Exercise 3: purlin roof

Allplan 2022

Use Division point again to draw the sloping construction lines. Use
Polar coordinates to define the direction of the construction line.

To draw sloping construction lines

1

Construction line mode is still turned on.
Click

2 Click

Line in the 2D Objects task area.
Individual lines on the Line context toolbar.

3 Define the starting point of the sloping construction line:
• a) Click

Division point (shortcut menu).

• b) Click the end points of the line (see illustration).
• c) Enter 5 for the number of divisions.
• d) Click division point 1.

This defines the starting point of the sloping construction line.

A = Starting point
B = End point

Basics Tutorial

Unit 2: designing and modifying 2D elements

4 The construction line is parallel to the rafter. Open the shortcut
menu by right-clicking and select
Track tracing options.

115

116

Exercise 3: purlin roof

Allplan 2022

5 The Options dialog box opens. Change the Cursor snap angle to
30°.

6 Click OK to close the Options dialog box.

Basics Tutorial

Unit 2: designing and modifying 2D elements

117

7 Move the crosshairs along the 30.0-degree track line. Use the
mouse to define the length of the construction line.
The exact length is not important. However, make sure that the
line projects beyond the horizontal line at the top.

8 Select ESC to close the

Line tool.

9 Create three copies of the construction line and place them to the
right:
• a) Click the construction line and select the
the context toolbar.

Copy tool on

• b) From point or enter offset: Click the point where the outer
edge of the rafter intersects the bottom edge of the collar
beam (see illustration).
• c) To point or enter offset: Enter the
the coordinate dialog box: 3.

Number of copies in

• d) Click the point where the outer edge of the rafter
intersects the sloping construction line (see illustration).

118

Exercise 3: purlin roof

Allplan 2022

Now you have created the temporary grid which helps you place
the nails.
10 Select ESC to close the

Copy tool.

11 To turn construction-line mode off again, clear the
Construction line check box in the Properties palette.

Nails
You will place the nails based on the temporary grid consisting of
construction lines. First draw a nail as a circle. Then copy this circle to
the points where the construction lines intersect. Finally, mirror and
copy the complete design onto the opposite side.
Tip: Before placing the
copies of the circle, check
that you have selected the
Point of intersection
option in the Point snap
area of the
Point snap
options (shortcut menu).
Allplan must not emit an
acoustic signal when you
place the copies of the
circle.

To place nails
1

To draw a nail as a circle, click
Circle (2D Objects task area).
The Circle dialog box opens. Select
Circle based on center
and
Enter full circle.

2 To define the center of the circle, click the point where the
horizontal construction line at the bottom intersects the vertical
construction line on the left.

Basics Tutorial

Unit 2: designing and modifying 2D elements

119

3 Enter the radius in the dialog line: 0.01

Copy on the shortcut menu of
4 To create the other nails, click
the circle.
From point: Select the center of the circle as the reference point.
To point: Copy the circle to the points where the construction
lines intersect (as shown in the illustration).

5 Delete the temporary grid consisting of construction lines by
using an element filter. Right-click in the workspace and select
Delete on the shortcut menu.
6 Point to the icon in the Filter task area and click within the blue
part at the bottom of this area. Click
Filter by ConstructionLine Format in the drop-down list.

120

Exercise 3: purlin roof

Allplan 2022

7 Select the condition (=) in the dialog box and click OK to confirm.

8 Enclose the temporary grid in a selection rectangle.
Due to the filter, Allplan deletes only the construction lines (not
the nails).
9 Select ESC to close the

Delete tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

121

To finish, you will mirror the nails onto the right rafter.

To mirror the nails
1

Enclose all nails in a selection rectangle.

2 Point to a circle.
Make sure that you do not point to a handle!

3 Click
Tip: Instead of defining the
vertical mirror axis by using
the 90.0-degree track line,
you can click the vertical line
between the rafters.

Copy and Mirror on the context toolbar.

4 To obtain a mirror axis that is exactly vertical:
• a) Click the gable peak.
• b) Move the crosshairs vertically downward along the 90.0degree track line.
• c) Click in the workspace below the design.

122

Exercise 3: purlin roof

5 Select ESC to finish.
The design should now look like this:

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

123

Task 2: labeling the purlin roof
In this section, you will label the purlin roof.
Tools:

Objective:

Horizontal
Text

Labeling
To label the purlin roof
1

Maximize the Quick Access task area on the Actionbar.

2 Click
Horizontal Text (Quick Access task area) and define
the position of the text by clicking in the workspace (see
illustration). Enter the text and define its parameters in the dialog
box.

See also: You can find detailed information about entering and
editing text in the Allplan Help.
3 You do not need the track tracing feature to create labels.
Therefore, turn off track tracing by selecting the F11 key.
4 To change the text height to 2.0 mm, click in the Text height box
and enter 2.0. The text width automatically changes with the
aspect ratio.
5 Click Font and select front number 8 ISONORM DIN 6776 in the
drop-down list.

124

Exercise 3: purlin roof

6 Click the lower-left corner to define the

Tip: To place text, you can
also use CTRL+ENTER
instead of clicking OK.

Allplan 2022

Text's anchor point.

7 Type Ridge purlin 10/16 for the text and click OK to confirm.
This places the text in the workspace.
The
Horizontal Text tool is still open.

Tip: As long as you have not
placed the text, you can
change the drop-in point by
clicking anywhere in the
workspace.

8 Click to define the starting point for the next line of text and label
the drawing as shown in the illustration at the beginning of this
exercise.
9 When you have entered all texts, select ESC to close the
Horizontal Text tool.

Creating leaders
A leader connects the text with the design. A leader is always at a
defined distance from the text. Allplan creates a leader as a simple
line with the current pen. You can apply symbols to the start and end
of this line.

Basics Tutorial

Unit 2: designing and modifying 2D elements

125

The starting point of the leader is always a defined point of the text.
Every text has eight points where the leader can start:

When you move the text, the leader ”sticks" to the starting point
defined.

To create leaders
1

Click

2 Click

Text Leader in the Quick Access task area.
Individual lines on the Text Leader context toolbar.

3 Select the End symbol option in the Properties palette and
choose Black steel construction arrow without boundaries in
the drop-down list.
4 The Symbol height is 3.00 mm. Do not change this setting.

126

Exercise 3: purlin roof

Allplan 2022

5 Leader to text: Click the text that is to get the leader. Make sure
that the point you click is the starting point of the leader (lowerleft corner).
The text appears in the selection color.
Tip: If the leader is not in the
correct position, click
Back on the Text
Leader context toolbar and
place the leader again.

6 To point: Click the endpoint of the leader.

Text Leader tool is still open. To add a leader to the next
The
line of text, repeat steps 4 and 5. Create more leaders as shown
in the illustration.

7 Select ESC to close the

Text Leader tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

127

Exercise 4: rotary with three roads
In this exercise, you will design a rotary with three roads.

You will use the tools in the 2D Objects, 2D Areas, and Change task
areas.

128

Exercise 4: rotary with three roads

Allplan 2022

Task 1: designing a rotary with one road
In the first part of this exercise, you will design a rotary with one road
leading up to it. In addition, you will create a traffic island in the middle
of the road. You will start by drawing a rough outline consisting of a
circle, lines, and parallel lines. You will learn about the Circle and Fillet
tools. The Fillet tool will produce the final outline.
Tools:

Objective:

Circle
Parallel to
Element
Polar
coordinates
Auto-Delete
Segment
Fillet

Rotary with one road
In the first part of this exercise, you will design the rotary and one of
the three roads leading up to it.

To draw the rotary
1

Click
Open on a Project-Specific Basis and open an empty
drawing file. Name it Rotary and close all the other drawing files.

2 Click

Circle in the 2D Objects task area.

3 The Circle context toolbar opens. Click
center and
Enter full circle.

Circle based on

4 Click in the workspace to define the center of the circle.
5 Define the radius by entering 12.25 m in the dialog line.
6 Select ENTER to confirm.
7 Switch to the

Parallel to Element tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

129

8 Click the circle.
9 Define the offset by entering 5.25 m; select ENTER to confirm.
10 Click within the circle to specify the side where you want to
create the parallel line.
11 Enter 1 for the Number and select ENTER to confirm.
This produces a lane width of 5.25 m in the rotary.
Draw the first road as a line. The road is at a specific angle. Therefore,
you will use polar coordinates.

To design the first road
1

To draw the top edge of the road, click
area).

2 Click

Line (2D Objects task

Individual lines on the Line context toolbar.

3 Click within the rotary to define the starting point of the line (as
shown in the illustration).
4 To draw the road at a defined angle, click
the dialog line.

Polar coordinates in

<Line> To point:
The angle between the road and the rotary is 5°. Positive angles
work in a counterclockwise direction. Enter 355.
Select the TAB key; enter 25 for the length.
Select ENTER to confirm.

130

Exercise 4: rotary with three roads

5 To draw the bottom edge of the road, click
Element in the 2D Objects task area. The
automatically.

Allplan 2022

Parallel to
Line tool closes

6 Click the line you just created. Enter the following values in the
dialog line:
Offset: 6.00
Which side? Click below the line.
Number: 1

7 You can now delete the redundant line segments protruding into
the rotary.
Right-click a line that you want to delete.

Basics Tutorial

Unit 2: designing and modifying 2D elements

131

8 Choose
Auto-Delete Segment on the shortcut menu and
click the line segments that you want to delete.
Allplan deletes the lines as far as the point where they intersect
the rotary.

9 Select ESC to close the

Auto-Delete Segment tool.

Traffic island for road
The next step is to design the traffic island, which consists of lines
that are parallel to the road you just created. You will then use lines
to connect the parallel lines.

To design the traffic island
1

Click

Parallel to Element (2D Objects task area).

2 Click the bottom line of the road to use it as the reference
element for the traffic island (see illustration).
3 To create the bottom edge of the traffic island, enter 2.50 for the
offset.
4 Click above the reference element to define the side and enter
the Number in the dialog line: 1.
This creates the first parallel line; the
Parallel to Element tool
is still open.

132

Exercise 4: rotary with three roads

Allplan 2022

5 The dialog line prompts you again to enter the offset. The offset
you enter now applies to the parallel line you just created. Enter
the offset between the bottom and top of the traffic island: 1.00

Line in the 2D Objects task area. The
Parallel to
6 Click
Element tool closes automatically.
Make sure that
Individual lines is selected on the Line context
toolbar.
7 Choose

Delta Point in the dialog line.

Basics Tutorial

Unit 2: designing and modifying 2D elements

133

8 Join the end points of the two parallel lines (see illustration) and
select ESC to close the tool.

You will use this line as the reference line for the next step.
9 To design the missing sides of the traffic island, click
to Element in the 2D Objects task area.

Parallel

10 Click the line you just created to use it as the reference element.
The dialog line prompts you to make various entries. Enter the
following values:
• Offset: 5.00; Which side? To the right; Number: 2
• Select ESC to close the tool.
11 Right-click a line of which you want to delete redundant
segments.

134

Exercise 4: rotary with three roads

Allplan 2022

12 Choose
Auto-Delete Segment on the shortcut menu and
click the line segments that you want to delete (see illustration).

Auto-Delete Segment tool.
13 Select ESC to close the
The result should look like this:

Basics Tutorial

Unit 2: designing and modifying 2D elements

135

Filleting the road and traffic island
In the next exercise, you will create the final outlines of the road and
the traffic island by means of the Fillet tool. You can use this tool to
fillet corners and to join nontouching lines with arcs. After having
clicked the two elements, you can choose one of the auxiliary circles
presented.

To fillet the road and the traffic island
1

Use the
Fillet tool to fillet the traffic island.
To open this tool, point to the top line of the traffic island.

2 Open the shortcut menu and click
element.

Fillet. This selects the first

3 Click the bottom line of the traffic island.
The fillet radius is 0.5. Select ENTER to confirm.
Two auxiliary circles appear on the screen.
4 Click the circle that you want to use for the fillet.

5 To fillet the opposite side of the traffic island, click the top and
bottom lines again.
6 Here, too, the fillet radius is 0.5. Select ENTER to confirm.
7 Click the second circle to use it for the fillet.
8 If you can’t see the result, click F8 to update the screen contents.

136

Exercise 4: rotary with three roads

Allplan 2022

9 The
Fillet tool is still open. You can see Trimming in the input
options. When this button is selected (default setting), Allplan
automatically shortens or lengthens the initial lines as far as the
fillet. If this button isn't selected, click it to select trimming.

This creates the traffic island. The next step is to fillet the road
leading up to the rotary.
10 Click the top edge of the road and the adjoining outer arc to
create the fillet at the top (see illustration).
11 Enter the radius: 12.00
12 Click the circle that you want to use for the fillet.

Basics Tutorial

Unit 2: designing and modifying 2D elements

137

13 Click the bottom edge of the road and the adjoining outer arc to
create the fillet at the bottom (see illustration). Repeat steps
7 and 8.
14 Delete redundant segments by selecting
Auto-Delete
Segment (shortcut menu). Your screen should now look like this:

15 Select ESC to close the

Auto-Delete Segment tool.

138

Exercise 4: rotary with three roads

Allplan 2022

Task 2: pattern
In this task, you will apply a pattern to the road leading up to the
rotary. You will learn about the Pattern and Pattern definition tools.
Tools:

Objective:
Pattern
Pattern
defaults
Area
detection
Island
detection
Select Pattern
Pattern Width
Pattern
Height
Modify
Format
Properties
Convert
Surface
Element

Basics Tutorial

Unit 2: designing and modifying 2D elements

139

Creating closed outlines
The first step involves creating closed outlines. This is necessary if
you want to use area detection to apply patterns to the rotary and
the road.

To create a closed outline for the road
1

To do this, you will use construction lines.
Select the
Construction line check box in the Properties
palette.

Note: Construction lines are like erasable pencil lines on
conventional drawings. When you turn on construction-line
mode, Allplan draws all elements with the construction-line color
Options - Desktop environment
and line type selected in the
- Display page - Drawing file and NDW window area. Elements
drawn as construction lines are excluded from printouts.
2 Click

Circle in the 2D Objects task area.

3 The Circle context toolbar opens. Click
center and
Enter full circle.

Circle based on

140

Exercise 4: rotary with three roads

Allplan 2022

4 Click the existing center of the inner circle.
5 Define the radius by entering 12.25 m in the dialog line.
6 Select ENTER to confirm.
Line tool (2D Objects task area) to join the right
7 Switch to the
ends of the two lines representing the boundaries of the road.
Circle tool closes automatically.
The
Make sure that
Individual lines is selected on the Line context
toolbar.
8 Choose

Delta Point in the dialog line.

9 Join the end points of the two parallel lines (see illustration) and
select ESC to close the tool.
10 Turn off construction-line mode again.
Your drawing should look like this:

Basics Tutorial

Unit 2: designing and modifying 2D elements

141

Applying a pattern to the road
In this section, you will apply a pattern to the road leading up to the
rotary. You will use area detection to define the area which gets a
pattern. The traffic island will not get a pattern.

To apply a pattern to the road
1

Click

2 Click

Pattern (2D Areas task area).
Single in the input options.

3 Click Properties on the Pattern context toolbar.
4 Select pattern 8 and define the following parameters:
• Reference point area:
Origin
• Resize height, width area:
Adjust to scale in layout
• Dimensions area:
Height factor and width factor: 1.00
• Placement type area:
Trim along boundary

142

Exercise 4: rotary with three roads

Allplan 2022

5 Check that the Polygonize element check box is selected in the
input options.
6 Select
Area detection and
Island detection in the input
options.
Island detection detects closed outlines within an area,
cutting them out automatically.

Basics Tutorial

Unit 2: designing and modifying 2D elements

143

7 Click within the closed outline of the road.
Make sure that you do not click within the part that you want to
cut out.

Allplan detects the outline of the road as a closed area,
automatically cutting out the traffic island. This is indicated by an
acoustic signal.

8 Select ESC to close the

Pattern tool.

144

Exercise 4: rotary with three roads

Allplan 2022

Applying a pattern to the rotary
The next step is to apply two different patterns to the rotary. The
procedure is basically the same as the one described in the previous
step.

To apply a pattern to the rotary
1

Before you apply patterns to the areas, delete the arc that is
directly under the circle in construction-line format.
To do this, click the arc.

2 Right-click to open the shortcut menu and select

Delete.

Basics Tutorial

Unit 2: designing and modifying 2D elements

145

3 Point to the outer circle of the rotary. Make sure that you do not
select the part of the circle that belongs to the road. The arc
appears in the selection preview color.

4 Click the arc.
5 Convert the circle in construction-line format to a design entity.
Select the
Modify Format Properties tool in the Change task
area.

146

Exercise 4: rotary with three roads

Allplan 2022

6 Select Convert construction lines to 2D entities and click OK.

7 Select ESC to finish.
8 Click

Pattern (2D Areas task area).

9 Click

Single in the input options.

10 Click Properties on the Pattern context toolbar.
11 Select pattern 114, enter 10 for the Height factor and the Width
factor, and define the following parameters:
• Reference point area:
Origin
• Resize height, width area:
Adjust to scale in layout
• Placement type area:
Trim along boundary

Basics Tutorial

Unit 2: designing and modifying 2D elements

147

12 The pattern gets a background color.
Select the Background color option and click in the box to select
a color.

13 Click the Color name button and select Default Allplan Color 25.

148

Exercise 4: rotary with three roads

Allplan 2022

14 Close the Select RGB Color and Pattern dialog boxes by clicking
OK.
15 Check the input options to see if the Polygonize elements
on/off check box,
Area detection, and
Island detection
are turned on.

16 Click the outer circle.
17 Select ESC again to close the

Pattern tool.

Apply pattern 105 to the inner circle yourself. Enter 10 for the Height
factor and the Width factor. Select Allplan Default Color 78 for the
background color.
The result should look like this:

Basics Tutorial

Unit 2: designing and modifying 2D elements

149

Applying a pattern to the traffic island
Finally, you will apply a pattern to the traffic island of the road. You
will use the same pattern as for the inner circle of the rotary.

To apply a pattern to the traffic island
1

Click

Pattern (2D Areas task area).

2 To match a pattern you have already applied, click
parameters on the Pattern context toolbar.

Match

3 Click the pattern in the inner circle of the rotary.
4 Click

Single in the input options.

5 Check that

Area detection is selected in the input options.

6 Zoom in on the area around the traffic island.
7 Click within the traffic island.
The traffic island gets the pattern.
The result should look like this:

150

Exercise 4: rotary with three roads

Allplan 2022

Defining a new pattern
Allplan 2022 comes with various ready-made patterns (depending
on the configuration). You can also modify existing patterns and
define new ones. In the following exercise, you will learn how to
define a new pattern and apply it to the road.

Please read the notes on defining hatching styles. They also apply to
patterns.

To define a new pattern
1

Open the
Default Settings drop-down list on the Quick
Access Toolbar and select Defaults.

Basics Tutorial

Unit 2: designing and modifying 2D elements

151

2 Click Pattern on the context toolbar.

Tip: The patterns that are
already defined depend on
the configuration you
purchased. Patterns 10 and
the following numbers are
usually free.
When you select a free
pattern, only the editing
frame and the temporary
crosses are visible on the
screen.

Begin by selecting an unassigned pattern.
3 The Tools palette opens. It helps you create your own patterns.
Go to the Change area and click
Select Pattern.

4 Select a free number (for example, 11) in the Select Pattern
dialog box.
Allplan displays an editing frame on the screen, making it easier
for you to define patterns. The frame contains a grid of dots to
help you draw the pattern.

152

Exercise 4: rotary with three roads

Allplan 2022

Pattern Width in the Tools palette (Change area) and
5 Click
enter the width of the pattern in mm in the dialog line: 200. Select
ENTER to confirm.
6 Click
Pattern Height in the Tools palette (Change area) and
enter the height of the pattern in mm in the dialog line: 200.
Select ENTER to confirm.

Basics Tutorial

Unit 2: designing and modifying 2D elements

153

7 Click
Line in the Tools palette (Create area).
Click
Polyline on the Line context toolbar.
Draw the pattern as shown in the illustration.

8 Select ESC three times to close the
defining the pattern.

Line tool and to finish

9 Click Yes when you see the Would you like to save the pattern
definition? prompt.
The Tools palette closes automatically.

154

Exercise 4: rotary with three roads

Allplan 2022

Applying the new pattern
The pattern is defined. Now you can apply the new pattern to the
road. You need to make some settings in the Pattern dialog box to
adjust the pattern to the road.

To apply the new pattern
1

Click

Convert Surface Element (2D Areas task area).

2 On the context toolbar, select Modify, Convert Pattern to
Pattern and click Properties.

The Pattern dialog box opens.
3 Select pattern 11 and enter 5 for the Width factor and Height
factor in the Size area. In addition, define the following
parameters:
• Reference point area:
Origin
• Resize height, width area:
Adjust to scale in layout
• Placement type area:
Trim along boundary

Basics Tutorial

Unit 2: designing and modifying 2D elements

155

Place the pattern at an angle of 5°. You can match the angle
directly from the drawing.
4 Go to the Direction, color area and click
next to Angle.
The dialog box closes; you are back in drafting mode.
5 Click the top line of the road.
The dialog box opens again, displaying an angle of -5°.
Tip: Allplan generates the
pattern from the reference
point.
To define a new reference
point, switch the reference
point to Origin and then to
Custom point.

6 You want to generate the pattern from the lower-right point; this
is the reference point. Therefore, to define the reference point
yourself, click Custom point in the Reference point area.
The dialog box closes temporarily.
7 Click the lower-right point to define it as the reference point.
8 Click OK to confirm the settings.
9 Click the pattern. The pattern changes accordingly.

156

Exercise 4: rotary with three roads

10 Select the ESC key to close the tool.

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

157

Task 3: completing the design
In this task, you will add the two missing roads to the rotary. You will
learn about the Copy and Rotate tool.
Tools:
Copy and
Rotate
Pattern
Line

Objective:

158

Exercise 4: rotary with three roads

Allplan 2022

Creating the missing roads
You will complete the rotary so that three roads lead up to it.

To add two more roads
1
Tip: You can select
elements by enclosing them
in a selection rectangle. The
default setting is
Select
Elements Based on
Direction (Actionbar Work Environment task
area): By opening the
selection rectangle in the
positive x-direction, you
select only the elements
that are fully bounded by
the selection rectangle. By
opening the selection
rectangle in the negative xdirection, you select all
elements that are fully
bounded or partially
bounded by the selection
rectangle.

Enclose the entire road in a selection rectangle that you open
from the lower left to the upper right (positive x-direction)..

The road, pattern, and traffic island appear in the selection color.
In addition, you can see handles.
2 Point to the upper boundary line of the road. Make sure that you
do not point to a handle!

Basics Tutorial

Unit 2: designing and modifying 2D elements

3 Click

159

Copy and Rotate on the context toolbar.

4 Click base point of rotation
Click the center of the rotary.
5 Select Rotate in the input options to rotate the elements at the
same time.
6 How many times?
Enter
3 in the coordinate dialog box; select ENTER to confirm.

160

Exercise 4: rotary with three roads

Allplan 2022

7 Starting point, reference line, or rotation angle
Enter 120° for the angle of rotation in the coordinate dialog box;
select ENTER to confirm.

Basics Tutorial

Unit 2: designing and modifying 2D elements

161

8 Select ESC to close the tool.

You can now adjust the pattern in the two new roads to the road
angle (see "Applying the new pattern (on page 153)").

162

Exercise 4: rotary with three roads

Allplan 2022

Pattern line
Finally, you will add a row of large paving stones to the edge of the
inner circle of the rotary. To do this, you will use the Pattern Line
tool.

To add a pattern line
1

Zoom in on the inner circle of the rotary.

2 Point to the inner circle.
Pay attention to element info, which must display circle.

Basics Tutorial

Unit 2: designing and modifying 2D elements

163

3 Double-click the inner circle.
The circle appears in the selection color. The Properties palette
opens. You can see the properties of the selected circle.
4 Select the Pattern line option in the Properties palette.

164

Exercise 4: rotary with three roads

Allplan 2022

5 The pattern line properties are highlighted in yellow.
Open the list of patterns and select pattern 4.

6 Adjust the Height and Width of the pattern. Select 0.20 m for
both values.

Basics Tutorial

Unit 2: designing and modifying 2D elements

7 Position relative to reference line: Left

8 Select ESC.

165

166

Exercise 5: title block

Allplan 2022

Exercise 5: title block
In this exercise, you will create and label a title block.

You will use the tools in the 2D Objects and Quick Access task
areas.
Note: In addition to the method described in this exercise, Allplan
provides other options for creating and labeling title blocks:
Label layout border in the
The task Layout contains the tool
task area Layout Editor in which you can select from several plan
headers. These title blocks, which are saved as label styles, transfer
specific details and project attributes (date, project name, edited by,
and so on) directly from the system to the title block. For an example
of creating a title block as a label style, see the Architecture tutorial,
Lesson 8: Layouts.
In addition, you can use the
Legend, Title Block tool (Layout
Editor task - Layout Editor task area). These legends analyze the
current layout attributes and project attributes. The program
creates the legends as associative legends, thus automatically
updating the attributes to reflect changes. After having placed a
legend, you can explode it into its design entities.

Basics Tutorial

Unit 2: designing and modifying 2D elements

167

Task 1: designing the title block
In the first part of this exercise, you will draw the layout of the title
block with the tools in the 2D Objects task area (Design task).
Tools

Objective

Reference Scale
Rectangle
Parallel to Element
Auto-Delete Segment
Delete
Modify Format
Properties
Each task on the Actionbar has its own set of basic settings known
as
Options ( Default Settings drop-down list on the Quick
Access Toolbar). The options contain defaults that affect the way
the tools function.
So, you can configure the program to suit your own preferences.

Selecting the unit and reference scale
Start by specifying the unit of length for the values that you enter in
this exercise. You will use mm.
Before you do this, select an empty drawing file so that the new unit
of length and reference scale apply only to the drawing file in which
you create the title block.

To select a new drawing file
• Click
Open on a Project-Specific Basis and open an empty
drawing file. Name it Title block and close all the other drawing
files.

168

Exercise 5: title block

Allplan 2022

To select units
1

Open the
Default Settings drop-down list on the Quick
Access Toolbar and click
Options. You can see the Options
dialog box. Select the Desktop environment page.

2 Go to the Enter lengths in box and click mm.

Tip: Alternatively, select the
unit on the status bar: Click
in the box next to length
and select mm.

3 Click OK to confirm the settings.

Basics Tutorial

Unit 2: designing and modifying 2D elements

169

Change the reference scale too. Until now you have worked at a
scale of 1:100.
You will draw the title block at a scale of 1:1.

To select the reference scale
1

Go to the status bar, click in the box next to Scale and select 1:1.

Border of title block
Start by drawing the outer border of the title block.

To draw the outer border as a rectangle
 Drawing file Title block is current; all the other drawing files are
closed.
1

Click

Rectangle (2D Objects task area).

2 The Rectangle context toolbar opens. Select
diagonal line.

Based on

3 Place the first point in the workspace.
Tip: Did you make an
incorrect entry? Click
Undo (Quick Access
Toolbar). You can undo all
steps back to the last save.

4 Diagonal point
Enter a length of
170. Select the TAB key and enter
define the width. Select ENTER to confirm.
Allplan draws the rectangle.
5 Click

Zoom All on the viewport toolbar.

155 to

170

Exercise 5: title block

Create the inner lines as lines parallel to the border.

To draw the inner lines
1

Click

Parallel to Element (2D Objects task area).

2 Click element
Click the bottom line of the border.
3 Through point or offset
Enter 20 for the offset.
Select ENTER to confirm.
4 Which side?
Click inside the rectangle.
5 Number: 1.
6 Through point or offset: 10.
Number: 4.
7 Through point or offset: 25.
Number: 1.
8 Through point or offset: 30.
Number: 1.

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

171

9 Through point or offset: 10.
Number: 3.
10 Select ESC to close the tool.
11 To draw the parallel lines that are vertical, click
Element again.

Parallel to

12 Click the outer line on the left and create two parallel lines - one
at an offset of 15 and the other at an offset of 120.

172

Exercise 5: title block

Allplan 2022

Deleting lines
Finally, delete the lines that you do not need.

To delete lines and segments of lines
1

Open the shortcut menu of a line that you want to delete and
select the
Auto-Delete Segment tool. Click all line segments
that you want to delete. Select ESC to close the tool.

2 Open the shortcut menu of the vertical line on the lower-left side
and click
Delete. Select ESC to close the tool.
3 Click the
Repeat drop-down list on the Quick Access Toolbar
and select the
Auto-Delete Segment tool. Delete the
horizontal lines that you no longer need. Then select ESC to close
the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

173

Modifying the pen thickness
The border of the title block needs to stand out.

To modify the pen thickness
1

To select the border of the title block, select and hold the SHIFT
key and click a line of the border. This selects all lines with the
same group number.

2 The Properties palette shows the format properties of the
selected lines.
Click the Pen thickness drop-down list and select pen 3 0.50.

3 To confirm, click in the workspace.
Tip: The
Modify Format
Properties tool (shortcut
menu or Change task area)
produces the same result.

174

Exercise 5: title block

Your drawing should now look like this:

Allplan 2022

Basics Tutorial

Unit 2: designing and modifying 2D elements

175

Task 2: labeling the title block
In the following part of the exercise, you will label the title block with
the tools in the Quick Access task area (Design task).
Tools

Objective

x-coordinate
(delta point)
y-coordinate
(delta point)
Copy
Edit Text
Explode
Paragraph
Change Text
Parameters

Entering centered text
Start by entering the name of the layout contents in the title block.

To enter centered text
1

Click

Horizontal Text in the Quick Access task area.

The anchor point of the text is exactly in the middle of the
rectangle - in other words, the midpoint of an imaginary diagonal
line.

176

Exercise 5: title block

Allplan 2022

2 Right-click in the workspace to open the shortcut menu (Point
Assistant). Select
Midpoint and click the two diagonally
opposite points of the rectangle.

3 Click
to expand the dialog box so that all the parameters are
visible. Enter the text parameters:
•

Text's anchor point: Centered

• Text height: 5.00 mm
The Text width automatically adapts to the Aspect ratio (in
this example: 1.00).
• Line spacing: 2.00
• Font: 8 ISONORM DIN 6776

4 Type the text: Precast Balcony, Type 12
5 Click OK or select CTRL+ENTER.
The
Horizontal Text tool is still open.

Basics Tutorial

Unit 2: designing and modifying 2D elements

177

Paragraph text
Enter the name of the construction project in the next box. The lines
are left-aligned. Allplan creates multiline text that you write in a
single operation as paragraph text.
to delete individual lines from a paragraph.
Use
resolves a paragraph into lines.
Line spacing:
The spacing between lines results from line spacing multiplied by
text height. Select Enter to go to the next line.
Point snap and offset entry:
To exactly position text, use the point snap feature and enter an
offset. This is very useful when you want to place a point relative to
an existing point.

To enter paragraph text
Tip: You can use
to save
combinations of text
parameters as favorites:
to enter a name in
Use
the list and specify the
parameters.

 The
Horizontal Text tool is still open.
Define the text's anchor point anchor by snapping a point and
entering the offset.
1

Point to the point in the title block as shown in the illustration.
Do not click the point!
By pointing to this point, you snap the reference point to which
the values that you enter will apply. The point is marked with a
cross.
The values that you enter for
and
are based on this
reference point (the point snapped). To indicate this, the
xcoordinate and
y-coordinate boxes in the dialog line turn
yellow.

178

Exercise 5: title block

Allplan 2022

2 Enter 30 for
dx, select the Tab key, enter -5 for
select ENTER to confirm.

dy, and

3 Change the position of the text's anchor point to

upper left.

4 Enter the following text:
New condominium [ENTER]
with underground parking
5 Select CTRL+ENTER or click OK to finish entering text.
6 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

179

Horizontal text
Enter a line of text on the right side of the title block and copy it to
the boxes below.

To enter and copy text
1

Click

Horizontal Text in the Quick Access task area.

2 Use point snap and offset entry to define the text’s anchor point:
A) Point to the upper-left corner of the box
(see illustration)
b)
dx = 2; TAB key
c)
dy = -2
d) Select ENTER to place the point

upper left. Change the Text
3 Switch the text's anchor point to
height to 2.5 mm and the Line spacing to 1.5.
Enter the following text: Date.

4 Click OK to confirm.
5 Select ESC to close the tool.

180

Exercise 5: title block

Allplan 2022

6 Click the Date text.
7 Point to a part of the text that is not marked with a handle.
8 Click

Copy on the context toolbar.

9 From point or enter offset
Click the upper-left corner of the box.

10 To point or enter offset
Enter 4 for the
Number of copies in the coordinate dialog box
and click the upper-left corner of the box below.

11 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

181

Editing text
Modify the text by means of the

Edit Text tool.

Text modification:
You can edit text at any time. This makes it much easier for you to
enter text, such as boilerplate, which must be updated.

To edit text
1

Right-click the Date text at the top and select
the shortcut menu.

Edit Text on

The dialog box opens; you can make changes.
2 Select ENTER at the end of the Date text to go to the next line.
Enter a placeholder for the date in the next line: XX.XX.20XX
3 Click OK to confirm.
4 Change the entries below as described in steps 2 and 3; use the
placeholders in the following illustration.

182

Exercise 5: title block

Allplan 2022

Changing text parameters
Change the appearance of the placeholder for the layout number.
Assign different text parameters: Use a character height of 5 mm
and a character width of 6 mm. Start by exploding the paragraph.
Defining text parameters:
You can choose from 20 Allplan fonts and from all TrueType fonts
installed.
The text height and text width parameters are absolute values.
This means that Allplan uses the selected values to print the text,
regardless of the selected reference scale.

To change text parameters
1

Right-click the Layout number... paragraph. The shortcut menu
opens. Select
Explode Paragraph.
This explodes the paragraph; you can now modify each line
separately.

2 Select the Esc key to close the
3 Click the placeholder XXX.

Explode Paragraph tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

4 The Properties palette shows the parameters of the selected
text.
Click in the box next to Height and select 5.00 mm.

183

184

Exercise 5: title block

Allplan 2022

5 Click in the box next to Width, enter 6.00, and select the Enter
key to confirm.

6 Click in the workspace.
Note: You can also use the
Change Text Parameters tool
(shortcut menu of the text that you want to modify).

Basics Tutorial

Unit 2: designing and modifying 2D elements

7 Add the missing labels as shown in the illustration.

185

186

Exercise 5: title block

Allplan 2022

Task 3: saving the title block as a symbol in the library and retrieving the
title block
In the last part of this exercise, you will save the title block as a
symbol in a folder of the library. Finally, you will retrieve the title
block and place it in an empty drawing file.
Tools
Library palette
New group
Insert element
Insert symbol
Find
Symbols
Symbols are design entities that you can use whenever you need.
Symbols automatically adapt to the scale of the drawing file. You can
select (click the middle mouse button and then left mouse button)
and modify a symbol as a single entity. After having modified a
symbol, you can save it under another name.
Symbols are often used for drawings and other common
components. In time, you will develop and use your own extensive
libraries for title blocks, fixtures, connecting elements, and so on.
Symbols in the Library palette
Symbols and other library elements (smart symbols, SmartParts,
PythonParts) can be stored and managed in any folder in the library.
You can create your own folders in the following data paths:
Office: The folders in this path belong to the office standard; they are
available to the entire office:
• Standalone computer: for all local projects
• Computer on the network: for all users and projects on the
network; only the administrator can store and manage symbols.
Project: The folders in this path belong to a particular project; they
are available in that project only.

Basics Tutorial

Unit 2: designing and modifying 2D elements

187

Private: The folders in this path belong to the user that is currently
signed in; they cannot be accessed by other users on the network.
Each folder can contain numerous library elements. You can copy,
delete, and rename symbols in the Library palette or in File Explorer.

Saving a symbol in the library
Add the title block as a symbol to a folder of the library.

To add a symbol to the library
1

Open the Library palette.

2 The title block is to be made available to the entire office.
Therefore, open the Office folder.

188

Exercise 5: title block

3 Click

Allplan 2022

New group at the bottom of the Library palette.

4 Enter Symbols for the name of the new group and select ENTER
to confirm.

5 Open the new Symbols folder.
6 Click

New group at the bottom of the Library palette again.

7 Enter Title blocks for the name of the new group and select
ENTER to confirm.
8 Open the new Title blocks group.

Basics Tutorial

Unit 2: designing and modifying 2D elements

9 Click
Insert element and then
bottom of the Library palette.

189

Insert symbol at the

10 Select elements you want to save as a symbol file
Open a selection rectangle around the title block. It appears in the
selection color.
Tip: You can change the
symbol’s base point when
you retrieve the symbol.

11 Set the symbol's base point
Click the lower-right corner. This is the point at which the symbol
will be attached to the crosshairs when you retrieve it.
12 A dialog box opens. Choose Dumb symbol without Snoop
functionality and click OK to confirm.

190

Exercise 5: title block

Allplan 2022

13 Enter Original for the name of the new symbol and click OK to
confirm.

14 This saves the new Original symbol to the Title blocks folder.
Tip: You cannot see the
symbol in the preview?
Check that the Wireframe
view type and Plan view are
selected.

Basics Tutorial

Unit 2: designing and modifying 2D elements

191

Retrieving a symbol from the library
Now retrieve the symbol and place it in an empty drawing file.
In practice, the new drawing file might be a drawing file for another
construction project. All you would need to do then is change the
project-specific information and save the title block again as a
symbol - this time in the Project folder.
In addition to the symbols that you create and save yourself, you can
use this approach to retrieve symbols from the Allplan library.

To retrieve a symbol from the library
1

Click
Open on a Project-Specific Basis (Quick Access
Toolbar), open an empty drawing file, and close the drawing file
with the Title block.
Click the scale on the status bar and select 1:1.

2 As you have just saved the Original symbol, this folder is still
open in the Library palette.
If it isn't, click
to move through the Library palette or click
to find the required file.
3 If you want to
Find the file, enter its name in the line at the top
of the Library palette. In this example, enter Original; select
ENTER to confirm.
The Library palette displays the required file.
Point to the image of the file in the lower area to display a ToolTip
with information about the file type (symbol in this example),
date saved, and folder (\Office\Symbols\Title blocks in
this example).

192

Exercise 5: title block

Allplan 2022

4 Double-click the Original symbol or drag it into the workspace.
The symbol's base point is attached to the crosshairs.
5 Click in the workspace to place the symbol.
Tip: You can use the input
options to change the
symbol’s base point and
define a cursor snap angle.
Use the tools on the
shortcut menu to exactly
define the symbol’s drop-in
point.

6 If the title block appears too small, click
viewport toolbar.

Zoom All on the

When placing the title block, you can use the input options to change
the size of the title block by resizing it in the x-direction and ydirection. Define the fixed point and enter the resizing factors.

Basics Tutorial

Unit 2: designing and modifying 2D elements

193

Additional tools for placing elements
The Input Options provide a number of tools that help you place
elements:
Use this to position the drop-in point.
Df Pnt
You can use the default drop-in point. This is the point you chose
when you defined the smart symbol or symbol.
Ang=
Use this to switch between a fixed (‘0’) and freely definable (‘?’)
drop-in angle. When you have selected ?, you can enter the angle
after placing the element, or you can click a line and match its angle.
Note: Using the + and - keys, you can rotate the element displayed
attached to the crosshairs by a cursor snap angle in a clockwise or
counter-clockwise direction. You can specify this angle using Cursor
snap angle (see below).
Num=
Use this to define the number of the elements to be placed. Num=1
places one element; Num=? places any number of elements.
Resize
You can use this to resize the element in the x-direction, y-direction
and z-direction by first defining a fixed point and then specifying the
resizing factors.
Tip: When you activate Ang=? before you click Scale, you can define
an angle and then resize the (smart) symbol you are about to place.

194

Exercise 5: title block

Allplan 2022

Snoop
You can use this to rotate the element so that it is parallel to existing
architectural lines (e.g. walls). This is done automatically when you
position the cursor over the architectural line. In the case of (smart)
symbols defined as Intelligent symbol/smart symbol with snoop
functionality, the distance to the architectural line is based on the
setting made when you defined the relevant (smart) symbol. For
more information, see Intelligent (smart) symbols. ‘Normal’ (smart)
symbols or elements from the Clipboard are placed using an offset
value of 0.
Drop
You can use this to define a custom drop-in point by clicking it in the
dialog box.
Attribute
You can use this to assign attributes to (smart) symbols.
Cursor snap angle
You can use this to set the angle by which the element is rotated
when you click the + or - keys.

Basics Tutorial

Unit 2: designing and modifying 2D elements

195

Exercise 6: precast balcony
In this exercise, you will create a general arrangement drawing for a
precast balcony with dimensions and hatching. Finally, you will print
out the precast element.

You will design the precast element with the tools in the 2D Objects
and Quick Access task areas. To print the result, you will use the
Print Preview tool (Quick Access Toolbar).

196

Exercise 6: precast balcony

Allplan 2022

Task 1: designing the precast balcony
In the first part of this exercise, you will draw the floor plan and two
sections for a precast balcony.
You will use the tools in the 2D Objects task area (Design task) and
Change task area.
Tools:

Objective:

Rectangle
Fillet
Parallel to Element
Auto-Delete
Segment
Line
x-coordinate (delta
point)
y-coordinate (delta
point)
Copy and Mirror
Midpoint
Stretch Entities
Fold Line

Default settings
Start by defining the default settings.

To select a new drawing file and define the options
1

Click
Open on a Project-Specific Basis and open an empty
drawing file. Enter Precast balcony for its name and close all the
other drawing files.

2 Click the Length on the status bar and select m.
3 Click the Scale on the status bar and select 1:25.

Basics Tutorial

Unit 2: designing and modifying 2D elements

197

You will start by drawing the outline.
Tip: If you want to change
the scale by means of the
Reference Scale tool on
the View menu, you must
use the Alt key to
temporarily show the
hidden menu bar. When you
define a scale by using the
Reference Scale tool
and the
icon, the status
bar also presents this scale
for selection.

Pay attention to the coordinate system and the angles’ direction of
rotation!

Note: You can also show
the menu bar all the time. To
do this, open the dropdown list on the Quick
Access Toolbar (title bar)
and click Show menu bar.

To display the required section, use the tools on the viewport
toolbar:
Zoom All

Zoom Section

You can also use the mouse to define the section that is visible
on the screen:
• Open the
Options - Desktop environment - Mouse and
crosshairs: Keeping the right mouse button held down - Zoom
function is selected by default. As a result, you can zoom with the
right mouse button.
• You can use the wheel to dynamically enlarge or reduce the
section on the screen.
• Double-click the middle mouse button to display the screen
contents in their entirety.
• You can pan by selecting and holding the middle mouse button; a
hand appears at the crosshairs.
If you work with a two-button mouse (for example, Mac
computers), you can select the Ctrl+Shift+left mouse button
held down - Pan function (for two-button mouse) option
( Options - Desktop environment - Mouse and crosshairs).

198

Exercise 6: precast balcony

Allplan 2022

Drawing the outline
To draw the outline in plan
1

Click

Rectangle (2D Objects task area).

2 The Rectangle context toolbar opens. Select
diagonal line.

Based on

Note:
Make sure that Create rectangle as a polyline is not
selected in the input options because you will edit some lines of
the rectangle later.
3 Click in the workspace to define the starting point of the
rectangle.
When you move the mouse, a preview of the diagonally opposite
point is attached to the crosshairs ("rubber-band").
4 Diagonal point
Enter a length of
2.60. Select the TAB key and enter 1.05 for
the
width.
Select ENTER to confirm.
Tip: Did you make an
incorrect entry?
Undo (Quick
Click
Access Toolbar).

5 Click

Zoom All on the viewport toolbar.

6 Use ESC to close the

Rectangle tool.

7 The next step is to fillet the vertical lines. To do this, open the
shortcut menu of the left or right side of the rectangle and select
Fillet tool.
the
8 You can see Trimming in the input options. When this button is
selected (default setting), Allplan automatically shortens or
lengthens the initial lines as far as the fillet. If this button isn't
selected, click it to select trimming.

9 Click the other vertical side of the rectangle and confirm the fillet
radius proposed.

Basics Tutorial

Unit 2: designing and modifying 2D elements

199

You can choose from four options:
Select the semicircle at the bottom.

10 Click

Zoom All again.

11 Select ESC to close the

Fillet tool.

12 Delete the bottom line of the rectangle.
Right-click this line and select
Delete on the shortcut menu.
(Alternatively, you can select
in the Edit task area and then
click the line).
13 Select ESC to close the tool.

200

Exercise 6: precast balcony

Allplan 2022

Creating inner parallel lines
Draw the inner lines of the precast balcony.

To create inner parallel lines
1

Click

Parallel to Element (2D Objects task area).

2 Click the semicircle you have just created.
3 Enter 0.1 to define the offset.

Which side?
Click within the outline to copy the circle inward.
Select ENTER to confirm the number (1).
4 For the next offset, enter 0.02.
Which side? Click the inside again.
Confirm the number (1).
5 Click
lines.

again to create the lines that are parallel to the lateral

6 Click the left line and then the endpoints of the semicircle one
after the other (see illustration).

7 Click
top.

again to create the lines that are parallel to the line at the

Basics Tutorial

Unit 2: designing and modifying 2D elements

201

8 Click the line at the top and enter 0.1 for the offset.

9 Click below the line to specify the side where you want to create
the parallel lines. Confirm the number (1).
10 Create three more parallel lines. Enter 0.02 for the first offset,
0.04 for the second offset, and 0.02 for the third offset. Confirm
the number (1) each time.
11 Select ESC to close the tool.

202

Exercise 6: precast balcony

Allplan 2022

Deleting redundant line segments and drawing fillets
Delete the redundant line segments in the corners and complete
your design by adding fillets.

To delete redundant line segments and to add fillets
Tip: If you inadvertently
deleted elements, you can
restore them by
immediately right-clicking in
the workspace twice
(undoing the last action) or
Undo. Here, you
by using
can go back (undo) as many
steps as you want (as far
back as the last save).

1

Right-click one of the lines that you want to delete and select
Auto-Delete Segment on the shortcut menu.

2 Click all line segments that you want to delete.
Use
Zoom Section (on the viewport toolbar) to select a
suitable view. This toolbar appears when you point to the lower
border of the viewport.
3 Click

Line in the 2D Objects task area.

4 Draw the two fillets as shown in the illustration.
Your drawing should now look like this:

5 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

203

Drawing Isokörbe
Add Isokörbe (special type of reinforcement cage) to the top and the
sides.

To draw Isokörbe in plan
1

Click

2 Click

Line in the 2D Objects task area.
Polyline on the Line context toolbar.

3 Point to the upper-left corner.
By pointing to this point, you snap the reference point to which
the values that you enter will apply. The point is marked with a
cross.
The values that you enter for
and
are based on this
reference point (the point snapped). To indicate this, the
xcoordinate and
y-coordinate boxes in the dialog line turn
yellow.
4 Select the Tab key to go to the
enter
-0.50. Select ENTER to confirm.

y-coordinate box. For dy,

This defines the starting point of the line.
5 Enter the following values in the dialog line:
dx = -0.08
dy = -0.40
dx = 0.08

204

Exercise 6: precast balcony

Allplan 2022

6 Select ESC to close the tool.

7 Draw the Isokorb at the top yourself; use the procedure
described. Careful with the direction and the sign!

8 Create the Isokorb on the right side by mirroring the one on the
left side. Select the Isokorb on the left side by enclosing it in a
selection rectangle that you open from left to right.
9 Click

Copy and Mirror.

Basics Tutorial

Unit 2: designing and modifying 2D elements

205

10 To define the first point of the mirror axis, right-click the line at
the top and select
Midpoint on the shortcut menu.
Make sure that you click neither the midpoint of the line nor any
other existing point.
This defines the first point of the mirror axis.

11 To obtain a mirror axis that is exactly vertical, select the TAB key
to switch to the
y-coordinate box in the dialog line.
Enter any dy value (not equal to 0).
This creates the Isokorb on the right side, completing the design.
12 Select ESC to close the tool.

206

Exercise 6: precast balcony

Allplan 2022

Outline of longitudinal section
Draw the outline of the longitudinal section and place it below the
floor plan.

To draw the outline of the longitudinal section
1

Select

2 Click

Line in the 2D Objects task area.
Polyline on the Line context toolbar.

3 Switch to the Properties palette, open the
drop-down list, and select 0.50 mm.

Pen thickness

Note: While you are drawing, you can change the pen thickness in
the Properties palette at any time.
4 Place the first point below the plan.
Create the lines by entering the following values one after the
other in the dialog line:
Tip: If the value entered is
not correct, simply click
on the Line context toolbar.
This deletes the last entry;
you can resume your work
at the endpoint of the
previous line.

Keep the coordinate system in mind!
dx = 2.60,

dy = 0.33,

dx = -0.10,

dy = -0.12,

dx = -2.40,

dy = 0.12,

dx = -0.10,

dy = -0.33,

Basics Tutorial

Unit 2: designing and modifying 2D elements

207

5 Select ESC to close the tool.

Modifying the outline
The next step involves modifying the outline.

To modify the outline of the longitudinal section
1

Select the

Stretch Entities tool in the Change task area.

2 Select the points to modify
Click the lower-right point of the left upstand (see illustration).
3 Place a point (from point) or enter dx:
Enter 0.02 for dx in the dialog line; confirm dy and dz (0). Select
ESC to finish.
4 Click

Fold Line in the Change task area.

5 Click the right line of the upstand.
6 End point:
Point to the lower-right point; this is the point you have just
modified. Allplan snaps this point, marking it with a cross.
7 Select the Tab key to go to
y-coordinate, enter 0.10 for dy,
and select ENTER to confirm.

208

Exercise 6: precast balcony

Allplan 2022

8 Select ESC to close the tool.
9 You can now modify the right upstand yourself. When finished,
select ESC to close the
tool.
10 Switch to the Properties palette and select pen thickness 0.25.
Then draw the Isokorb on the left side. Use
Line (2D Objects
task area). The starting point is the lower-left corner.
dx = -0.08
dy = 0.18
dx = 0.08

11 Select ESC to close the

Line tool.

12 Create the Isokorb on the right side of the longitudinal section by
using
Copy and Mirror:
• Enclose the Isokorb in a selection rectangle that you open
from left to right.

Basics Tutorial

Unit 2: designing and modifying 2D elements

• Point to a line and click
toolbar.

209

Copy and Mirror on the context

• Right-click the line at the top and select
shortcut menu.

Midpoint on the

• Select the Tab key to switch to the
y-coordinate in the
dialog line and enter any value for dy.
Your design should now look like this:

13 Select ESC to close direct object modification.

Drawing the cross-section
Finally, you will draw the entire cross-section in a single operation.

To draw the cross-section
1

Select pen thickness 0.50 mm in the Properties palette and click
Line (2D Objects task area).

2 Click

Polyline on the Line context toolbar.

210

Exercise 6: precast balcony

Allplan 2022

3 Place the starting point in the upper-left area so that the crosssection is to the left of the floor plan.
Tip: Skip a coordinate:
Select the TAB key to go to
the next box.

4 Enter the following values one after the other in the dialog line.
The illustration on the left side helps you do so.
dx = 0.33 ENTER
dy = -2.35 ENTER

Enter relative coordinates:
Enter values for , , and
in the dialog line (use the
Tab key to switch between
the boxes) until you have
reached the drop-in point.
Select the Enter key to
place the point.

dx = -0.33 ENTER
dy = 0.10 ENTER
dx = 0.02 TAB
dy = 0.02 ENTER
dx = 0.07 ENTER
(select the TAB key to switch to
)
dx = 0.04 TAB
dy = 2.05 ENTER
dx = 0.02 TAB
dy = 0.02 ENTER
(select the TAB key to switch to
)
dy = 0.04 ENTER
dx = -0.13 ENTER
(select the TAB key to switch to
)
dx = -0.02 TAB
dy = 0.02 ENTER
(select the TAB key to switch to
)
dy = 0.10
5 Select ESC to close the tool.
6 Select pen thickness 0.25 mm (Properties palette) and draw the
Isokorb (8/18 cm) at the top.

Basics Tutorial

Unit 2: designing and modifying 2D elements

Your drawing should now look like this:

211

212

Exercise 6: precast balcony

Allplan 2022

Task 2: dimensioning the precast balcony
In this section, you will dimension the precast balcony with tools in
the Quick Access task area.
Tools:

Objective:

Horizontal Dimension
Line
Vertical Dimension
Line
Auto Dimensioning
Add Dimension Line
Point
Modify Dimension Line

When you dimension a design, the first step is to define whether
dimensioning is to be associative or not. After this, you define the
dimension-line parameters. Dimensioning then involves three steps:
• Define the type of dimension line (vertical, horizontal, angle, or
direct)
• Specify the location for the dimension line
• Click the points that you want to dimension
Tip: Open the
Options on
the Dimension line page to
define a tolerance for tilted
(dimension) text, specify
the decimal separator, and
enter values for blanking.

You can modify dimension lines at any time. You can add and delete
dimension-line points, move dimension lines, and modify the
dimension-line parameters.

Basics Tutorial

Unit 2: designing and modifying 2D elements

213

Defining dimension-line parameters
Start by making settings for the dimension-line parameters.
The most important parameters are the unit, the position of the
dimension text, and the dimension-text height and width.
Dimension lines are always linked with the design (dimension lines
are associative; the points you click are the reference points).
Dimension lines automatically adapt to changes you make to the
design.

To define dimension-line parameters
1

Click

Dimension Line (Quick Access task area).

Note: The Dimension Line context toolbar includes the
Associative option. Associative dimensioning means that the
dimension lines and text automatically adapt to changes in the
size or position of the component.
2 Clear the Associative check box in this this example.
3 Click

Properties.

4 Check the settings in the top (general) part of the dialog box,
select an Arrowhead (slash), enter its Size (3.00), and define the
Format properties for the components of the dimension line.

Allplan creates the dimension lines with the pen, line, color, and
layer that you select here, regardless of the settings in the
Properties palette.

214

Exercise 6: precast balcony

Allplan 2022

5 Check the settings on the Text tab in the bottom part of the
dialog box and define the text parameters as shown in the
illustration.
6 Select a font and define the dimension-text height and width by
entering the following values:
-

Dimension-text height: 2.50 mm

-

Aspect: 1.25 (this results in a text width of 2.0)

7 To define the Position of the dimension text, click the upper box
in the middle.

8 Open the Dimension Text tab and check the following
parameters:
• Dimension-text unit: m, cm
• Round-off value in mm: 5
• Number of decimal places: 3
• Number of trailing zeros: 2
• Exponent format option: selected

Basics Tutorial

Unit 2: designing and modifying 2D elements

215

9 Open the Input Options tab and select the No extension lines
option.
Enter 9 for the Offset between dimension lines in mm, inches
(paper).

on the lower left and save the parameters as a favorite
10 Click
file. For example, enter "Tutorial" for the name of the file.

11 Click Save to confirm.
12 Click OK to confirm the Dimension Line dialog box.

216

Exercise 6: precast balcony

Allplan 2022

Creating horizontal dimension lines
The longitudinal section gets horizontal dimension lines.

To create horizontal dimension lines
 The
1

Dimension Line tool is still open.

Select the section on the screen so that there is enough space at
the top for the dimension line.

2 Click

Horizontal on the context toolbar.

3 Through point or click dimension line
Define the position of the dimension line by clicking above the
longitudinal section. This is the point through which the dimension
line will pass.
4 Click the six points that you want to dimension.
A preview of the dimension line appears immediately. This
preview automatically changes with each new point that you add
to the dimension line. You can click the points to be dimensioned
in any sequence.
5 To finish entering points, select ESC.
Horizontal is still selected so that you can create the next
dimension line.
6 Through point or click dimension line
Click below the longitudinal section to define the point through
which the dimension line is to pass.
7 Click the points to be dimensioned. Then select ESC to finish
creating horizontal dimension lines.

Basics Tutorial

Unit 2: designing and modifying 2D elements

217

Creating vertical dimension lines
You will continue with vertical dimension lines.

To create vertical dimension lines
 The

Dimension Line tool is still open.

1

Vertical on the context toolbar.

Click

2 Click to the left of the longitudinal section to define the point
through which the dimension line is to pass.
Tip: You can specify the
distance between
dimension lines in the
Properties. You can
also move dimension lines
later by means of the
Move Dimension Line
tool.

3 Click the corners of the Isokorb and the upstand; select ESC to
close the tool.
Vertical is still selected so that you can create the next
dimension line.
4 Through point or click dimension line
Point to the left of the dimension line because you want to create
the next dimension line to the left of the first one.
Allplan snaps this dimension line, displaying it in the selection
preview color. A symbol indicates the position of the next
dimension line.

5 If the symbol is on the correct side, click in the workspace to
confirm.
6 Click the points to be dimensioned.

218

Exercise 6: precast balcony

Allplan 2022

7 Create the missing vertical dimension lines for the section
yourself.

Basics Tutorial

Unit 2: designing and modifying 2D elements

219

Creating dimension lines automatically
To dimension a part of the floor plan, you will use automatic
dimensioning. All you need to do is draw a line through the
components. Allplan will automatically dimension the points where
the line intersects the components.

To apply automatic dimensioning
1

Click

Auto Dimensioning (Quick Access task area).

2 Click
Match parameters from dimension line and click an
existing dimension line.
3 Click above the floor plan to define the point through which the
dimension line is to pass.
4 Place direction point 1 or enter a direction angle or line: Confirm
the value 0.00.
5 Point 1 for clipping path: Define the first point by clicking above
the Isokorb to the left of the outer edge of the precast element.
6 Next point for clipping path: Click the equivalent point on the right
side.
7 Next point for clipping path: Select ESC twice to close the tool.
Allplan automatically dimensions all points where the line
intersects the design.

220

Exercise 6: precast balcony

Allplan 2022

Adding dimension line points
The dimensions of the Isokörbe are still missing. So, the next step is
to add these dimension-line points to the dimension line that you
have just created.
Dimension lines that were created with the Associative option not
being selected automatically adapt in the following cases:
• When you work with drawing files: The dimension lines and the
dimensioned component must be in the same drawing file, or the
drawing file with the dimensions must be open in edit mode while
you are making modifications.
When you work with layers: The layer containing the
dimensioning must be visible.
• When modifying a dimensioned element, you must select the
reference points too.
Due to changes in the design, dimension-line points are often
missing or no longer required. In these cases, you do not need to
create a new dimension line. You can simply add or delete
dimension-line points.

To add dimension-line points
1

Tip: To remove a
dimension-line point, open
the shortcut menu of a
dimension line and click
Del Dimension Line
Point. Then click the point
that you want to delete.

Right-click the dimension line to which you want to add
dimension-line points and select
Add Dimension Line Point
on the shortcut menu.

2 Click the points to be dimensioned (left and right outer edges of
the Isokörbe).

3 Select ESC twice to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

221

You can also change the parameters of dimension lines (except the
spacing between dimension lines).
Modify Dimension Line (shortcut menu of a dimension
• Click
line or Label task - Dimension area).

-

Define the new dimension-line parameters in the
Properties; then click the dimension lines to apply the
changes.
You can also match the parameters from existing dimension
lines. Click
Match parameters from dimension line and
click the dimension line whose settings you want to use.

-

You can also use the context toolbar to select the dimensionline type to which you want to apply the changes and then
enclose all dimension lines in a selection rectangle.

222

Exercise 6: precast balcony

Allplan 2022

• You can also click the dimension line that you want to modify and
then select and change the dimension-line parameters in the
Properties palette.
For example, you can change the arrowheads or other
parameters of the dimension-line section clicked.
and
to switch between the dimension-line sections or
Use
elevation points.

Basics Tutorial

Unit 2: designing and modifying 2D elements

Complete the dimension lines as shown in the illustration:

223

224

Exercise 6: precast balcony

Allplan 2022

Task 3: applying hatching to the precast balcony and printing the result
In the following part of the exercise, you will apply hatching to the
sections of the precast balcony. You will use the tools in the 2D
Objects and 2D Areas task areas.
Tools:
Hatching
Area detection
Convert Surface
Element
Reshape Surface
Element,
Architectural Area
Show/Hide
Print Preview
Print

Objective:

Basics Tutorial

Unit 2: designing and modifying 2D elements

225

Defining and creating hatching
First, you will select a hatching style that represents reinforced
concrete and apply it to the longitudinal section of the precast
balcony.

To define and create hatching
1
Tip: When you click the
hatching number on the
Hatching context toolbar,
you can quickly select a
hatching style in the
following dialog box:

Select the

Hatching tool in the 2D Areas task area.

2 Click the button with the hatching style on the Hatching context
toolbar.

3 Select hatching style 7 In the Hatching dialog box.
4 Define additional hatching settings:
• Line spacing area:
Constant in layout, as defined in defaults
• Reference point area:
Origin

226

Exercise 6: precast balcony

Allplan 2022

5 Click OK to confirm the dialog box.
Tip: To apply hatching to
rectangular areas, click two
diagonally opposite points.
Then select ESC.

6 Click

Area detection (input options, icon must be pressed in).

7 Click within the area to which you want to apply hatching. Allplan
automatically detects the boundary of the area.
8 Select ESC to finish defining the area.

9 Select ESC to close the tool.

Basics Tutorial

Unit 2: designing and modifying 2D elements

227

Changing the hatching style
The next step involves replacing the hatching style for reinforced
concrete with a hatching style for precast elements. All you need to
do is change the hatching style.

To change the hatching style
1
Tip: To change the hatching
style, you can also click the
hatching. The Properties
palette opens; modify the
required hatching
parameters.

Click

Convert Surface Element (2D Areas task area).

2 You can see the Convert Surface Element dialog box. Make
settings as shown in the illustration and click the button with the
hatching style.

3 Select hatching style 6 in the Hatching dialog box (see "Defining
and creating hatching" on page 224); click OK to confirm.
4 Select surface elements to convert to hatching: Click the
hatching of the longitudinal section.

5 Select ESC to close the tool.

228

Exercise 6: precast balcony

Allplan 2022

Cutting out hatching around the dimension text
Remove the hatching around the dimension text so that you can see
it better.
Tip: You can also apply
white fills to dimension text.
To do this, select the Apply
fill to dimension text check
Properties
box in the
of the dimension line on the
Text tab.

To cut out hatching around the dimension text
1

Open the shortcut menu of the hatching by right-clicking the
hatching of the longitudinal section.

2 Select the
tool.

Reshape Surface Element, Architectural Area

3 Clear the Polygonize elements check box in the input options
and select
Minus.

By turning off Polygonize elements in the input options, you
automatically turn off
Area detection.
4 Enclose the area around the dimension line in a selection
rectangle and select ESC twice.
The hatching disappears from the selected area.
5 Select the hatching of the longitudinal section again and repeat
step 4 for the second dimension line.

Basics Tutorial

Unit 2: designing and modifying 2D elements

Applying hatching to the cross-section
Apply hatching to the cross-section as shown in the illustration:

229

230

Exercise 6: precast balcony

Allplan 2022

Printing the screen contents
Finally, you will print out the precast element. You can directly print
intermediate results without having to assemble a layout first. For
example, you can quickly print details or sections of floor plans if you
need the current edit status on paper.
Print and
Quick
To create quick printouts, you can use the
Print tools in the drop-down list of the Allplan icon on the title bar. In
addition, you can use the
Print Preview tool on the Quick Access
Toolbar:
• The settings (for example, margins, header, footer, construction
lines) in the Print Preview palette will be used for printing. You
can also define the scale and the section that you want to print.
• Use
Print to print the contents of the active viewport to a
printer that you select in advance.
• Use
Quick Print to print the current contents of the screen
without defining print settings beforehand. The default printer
will be used for printing.

To print the screen contents
1

Click

Print Preview (Quick Access Toolbar).

The palettes and the Actionbar disappear from the screen. Only
the Print Preview palette is visible.
2 Define the settings for print preview in the Settings, Margins,
and Display of elements areas.
Go to the Display of elements area and select the Thick line
option. As a result, different line thicknesses are visible on the
screen and in printouts.

Basics Tutorial

Unit 2: designing and modifying 2D elements

231

By using the Print construction lines option, you can choose to
include construction lines in the printout. Define the other options
as you want.

3 Define the scale in the Display of elements area.
4 Go to the Settings area and select the Printer if you do not want
to use the default printer.

232

Exercise 6: precast balcony

Allplan 2022

Note: Click the
Settings icon next to printer to define the
properties (for example, paper options and color options) of the
selected output device or raster driver.

5 Click Print at the bottom of the palette.
The program sends the document to the selected printer.
6 To close print preview, click Close at the bottom of the palette.
Note: To create more printouts, click
Quick Print in the dropdown list of the Allplan icon. This tool uses the most recent
settings to print the screen contents without prompting you
again.

Basics Tutorial

Unit 3: 3D modeling

233

Unit 3: 3D modeling
Unit 3 introduces the Modeling task. You will create a
chair based on the zigzag chair designed by Gerrit T.
Rietveld. You will learn
 How to create the initial elements in 3D
 How to automatically create a 3D solid based on a
profile and a path
 How to define a work plane so that you can draw in a
sloping plane as if you were working in plan
 How to design a box and use it to create the opening in
the back of the chair

234

Exercise 7: Rietveld chair

Allplan 2022

Exercise 7: Rietveld chair
This exercise involves creating a chair based on the zigzag chair
designed by Gerrit T. Rietveld.

You will use tools in the Modeling task (3D Objects, Boolean
operators, and Work Environment task areas).

Basics Tutorial

Unit 3: 3D modeling

235

Task 1: designing the initial elements
You will start by drawing the profile and elevation view of the chair
as 3D elements in plan. After this, you will rotate these 3D elements
in space.

Tools:
3D Rectangle
3D Line
Rotate 3D Elements

Objective:

236

Exercise 7: Rietveld chair

Allplan 2022

Designing the 3D elements
Start by creating the profile and elevation of the chair by using the
3D Rectangle and 3D Line tools.

To draw the cross-section and profile of the chair in
plan

1

Open on a Project-Specific Basis and open an empty
Click
drawing file. Name it Rietveld chair and close all the other
drawing files.

2 Go to the Actionbar and switch to the Modeling task, which you
can also find in the Draft role.
3 Expand the 3D Objects task area by double-clicking within the
name line of this task area.

4

Click

3D Line in the 3D Objects task area.

Basics Tutorial

Unit 3: 3D modeling

237

5 To draw the profile of the chair, select
3D Line context toolbar.

6 Select

3D Rectangle on the

Based on diagonal line in the input options.

7 Click in the workspace to define the starting point of the
rectangle.
8 The rectangle is 0.03 m long in the x-direction. Therefore, enter
dx = 0.03 in the dialog line. Select the Tab key to go to
dy.
9 The rectangle is 0.37 m high in the y-direction. Therefore, enter
dy = 0.37 in the dialog line.
10

dz is 0.00. Do not change this value. Select Enter to confirm.

11 Click

Zoom All on the viewport toolbar.

12 To create the elevation of the chair, select the
on the 3D Line context toolbar.

13 Make sure that

3D Line option

Polyline is selected in the input options.

14 Click the lower-right corner of the rectangle to define the
starting point of the line.
15 To draw the first line, select
Delta point in the dialog line, enter
dx = 0.265, and select ENTER to confirm.
Tip: Select the Tab key to
go to the next box in the
dialog line.

16 Enter the following values in the dialog line:
dx = -0.265 TAB
dy = 0.40 ENTER

17 To draw the third line, enter
select ENTER to confirm.

dx = 0.325 in the dialog line and

238

Exercise 7: Rietveld chair

Allplan 2022

18 To draw the fourth line, enter the following values in the dialog
line:
dx = 0.05 TAB
dy = 0.27 ENTER

19 Select ESC twice to close the

3D Line tool.

20 To get an impression of how the elements look in 3D, click
3 Viewports ( Window drop-down list on the Quick Access
Toolbar).
The elements are now displayed in plan view, and to the right of
them in isometric and side view.
21 In the
Window drop-down list for the viewport layout, select
the setting on the left and click the ALT KEY to temporarily show
the menu bar.
Open the View menu and click Zoom All in All Viewports.

Basics Tutorial

Unit 3: 3D modeling

Your screen should now look like this:

You will continue to work in these 3 viewports.

239

240

Exercise 7: Rietveld chair

Allplan 2022

Rotating the 3D elements
The 3D elements are still flat on the floor (xy plane). The next step is
to rotate the 3D elements in space. The difference between this and
rotating elements in 2D is that you can define an axis of rotation
which lies freely in space (in 2D, you can enter a point of rotation
only).

To rotate the 3D elements
 Actionbar: Draft role - Modeling task.
1

Select
Rotate 3D Elements (3D Objects task area) and click
the elevation view of the chair.
The element appears in the selection color.

2 Define the bottom line of the chair’s elevation view as the axis of
rotation. First click the left point of the line. The sequence in which
you enter the points is important for defining the angle later.
3 Click the right point of the line. This defines the axis of rotation.

4 Rotate the elevation view upward by 90 degrees. Enter 90 and
select ENTER to confirm.
The rotated elevation view of the chair is visible as a straight line
in plan view (see illustration).
5 Select ESC to close the

Rotate 3D Elements tool.

Basics Tutorial

Tip: You can use the “right
hand rule” to identify the
positive direction of the
rotation angle. Point the
thumb of your right hand in
the direction of the rotation
axis; your fingers indicate
the positive direction of
rotation.

Unit 3: 3D modeling

241

6 Rotate the profile of the chair downward.
You can also find the
Rotate 3D Elements tool on the direct
object modification toolbar. Click the profile and select this tool.

7 Define the axis of rotation as shown in the illustration. Here, too,
click the point at the top first.
8 Enter the angle of rotation: 90.

9 Select ESC to close direct object modification.
10 Select the ALT KEY to show the menu bar for a short time.
Open the View menu and click Zoom All in All Viewports.

242

Exercise 7: Rietveld chair

Now your screen should look like this:

Allplan 2022

Basics Tutorial

Unit 3: 3D modeling

243

Note: When you use the Actionbar configuration, the menu bar is
hidden by default. If you want, you can show the menu bar all the
time.

To show the menu bar
Tip: As you did in the
previous exercise, you can
temporarily show the menu
bar by selecting the Alt key.
The menu bar disappears
again after you have
selected a tool.

1

Click the drop-down list on the Quick Access Toolbar (title bar).

2 Click Show menu bar.

The menu bar appears below the title bar.

244

Exercise 7: Rietveld chair

Allplan 2022

Task 2: designing the 3D solids
You will create the chair from the 3D elements. Start by designing
the opening in the back of the chair as a 3D solid (box). You will then
subtract this opening from the back of the chair.

Tools:

Objective:

Extrude Along Path
Work Plane
Box
Subtract and Remove Solid

Extruding along a path
The next step is to create the chair by means of the Extrude Along
Path tool. The profile to be extruded is the profile of the chair. The
path is the elevation view of the chair.

To extrude the elevation view of the chair along a path
 3 Viewports are still open.
 Actionbar: Draft role - Modeling task.
1

Click

Extrude Along Path (3D Objects task area).

2 Select profile to extrude
Click the profile of the chair in isometric view.

Basics Tutorial

Unit 3: 3D modeling

245

3 Select path
Click the elevation view of the chair in isometric view.

4 Set parameters, press ESC to confirm
Check the settings in the Extrude Along Path dialog box and
select ESC to confirm.

5 The menu bar is still visible (see previous exercise). If this is not
so, select the ALT KEY to show the menu bar.
Open the View menu and click Zoom All in All Viewports.
Or
Select SHIFT+F5.

246

Exercise 7: Rietveld chair

Allplan 2022

Now your screen should look like this:

6 Select ESC to close the

Extrude Along Path tool.

Basics Tutorial

Unit 3: 3D modeling

247

Defining a work plane and creating a 3D box
The chair is still missing the opening in its back. You will start by
creating it as a box. To make it easier to position the box in the
sloping back of the chair, you will define a work plane (= user-defined
coordinate system) whose x-axis and y-axis are parallel to the
edges of the back of the chair. Consequently, you can draw in the
work plane as if you were working in plan.

To define the work plane and create a 3D box
 3 Viewports are open.
 Actionbar: Draft role - Modeling task.
1

Click in the viewport that displays the chair in plan.

2 To enter the work plane, display the chair in isometric view. Click
Rear, Left Isometric View.

248

Exercise 7: Rietveld chair

Allplan 2022

The result should look like this:

Work Plane tool for the following steps.
3 You need the
To quickly select this tool, you will use the search function of the
Actionbar.
To do this, click
in the upper-right corner of the Actionbar.
4 Enter work plane in the Find... dialog box and click Continue.

The Work Environment task area displays the
tool.
5 There are two ways to select the

Work Plane

Work Plane tool:

• Click the tool in the Work Environment task area.
Or
• Click the
Work Plane (Defines a work plane) icon in the
lower part of the Find... dialog box.

Basics Tutorial

Unit 3: 3D modeling

249

6 To define the origin of the work plane, click the lower-left corner
of the back of the chair (see illustration).

7 Click No because you do not want to use the current view as the
work plane.

Define the work plane by entering four points.
8 To define the x-axis, click the two end points of the bottom edge
of the chair (see illustration). As the positive x-axis is to the right,
click the point on the left first.

250

Exercise 7: Rietveld chair

Allplan 2022

9 To define the y-axis, click the two end points of the rear left edge
of the chair (see illustration). As the positive y-axis is upward,
click the bottom point first.

The z-axis is perpendicular to the xy plane in the origin.

Basics Tutorial

Unit 3: 3D modeling

251

The result should look like this:

Now all entries you make apply to the axes of the defined work
plane: You can enter the values defining the box as if you were
working in a 2D floor plan.
10 To draw the box, click

Box (3D Objects task area).

11 Check that the Based on diagonal line setting is selected in the
input options. If it isn't, select it now.

Always work in the right viewport!
12 Make sure that

Delta point is selected in the dialog line.

252

Exercise 7: Rietveld chair

Allplan 2022

13 Point to the upper-left point to define the reference point for the
corner of the box. You can see this point in the other two
viewports too.

14

Delta point is selected.
Enter the offset of the corner in the dialog line:
dx = 0.1
dy = -0.1

Select ENTER to confirm.
This defines the corner of the box.
15 Enter dx = 0.17 for the length of the opening and dy = 0.05 for its
width. Then select ENTER to confirm.
16 To define the height of the box in the z-direction, enter a value
that is greater than the thickness of the back of the chair. Enter 0.10 for the height. You have drawn the box.
17 Click

Plan to return to the usual work plane.

Basics Tutorial

Unit 3: 3D modeling

253

Now your screen should look like this:

18 Select ESC to close the

Box tool.

Creating the opening
To finish, you will remove the volume of the box from the 3D
element, thus deleting the box.

To create the opening
 Actionbar: Draft role - Modeling task.
1

Go to the Boolean Operators task area and click
Subtract
and Remove Solid to create the opening in the back of the chair
and to delete the box at the same time.

254

Tip: Expand the Boolean
Operators task area.
Do you still know how to do
this?
Double-click within the
name line of the task area.

Exercise 7: Rietveld chair

Allplan 2022

2 Click 1st solid
Click the chair; this is the solid in which you want to create the
opening.
3 Select solids, right-click to confirm
Click the box; this is the (only) solid you want to subtract from the
first solid. Right-click to confirm.

This creates the opening; the resulting chair might look like this
(Hidden view type on the viewport toolbar):

Basics Tutorial

Unit 3: 3D modeling

255

Excursus: design check, color, and texture
To check the design
1

Select the F4 key.
A viewport of the Animation view type opens, showing the chair.
Navigation Mode is selected.

See also: You can find more information about using the mouse in
animation in the Allplan Help. See "Sphere mode, camera mode".
2 Select and hold one of the mouse buttons, then drag: You move
around the virtual model in sphere mode, which is the default
setting.
Select the Ctrl key at the same time to switch to camera mode.
3 Experiment with the navigation modes; start trying things out on
your own.
4 The chair's color is boring? What about red?
Navigation Mode is still selected in the animation viewport.
Right-click the chair; the shortcut menu opens.
Set Surface.
Click
The Modify Surfaces palette opens.
You can check and change the surface properties of the chair.

256

Exercise 7: Rietveld chair

5 Click the button in the Color area.

The palette shows the current color of the chair.

Allplan 2022

Basics Tutorial

Unit 3: 3D modeling

257

6 Go to the Color system area and click the button next to Color
name.

258

Exercise 7: Rietveld chair

7 Select a color by clicking it.

The palette shows the old color and the new color.
Tip: You can also select a
color in the color circle, use
the slider, or enter values in
the Define color area.

Allplan 2022

Basics Tutorial

Unit 3: 3D modeling

259

8 Click OK to confirm the palette.
You can now customize the surface by defining more properties.
9 Finally, click OK to confirm the palette.

260

Exercise 7: Rietveld chair

Allplan 2022

The chair appears in the selected color.

10 Or what about the wood grain? Would you like to see it?
Right-click the chair in the animation viewport and select
Surface on the shortcut menu.

Set

Basics Tutorial

Unit 3: 3D modeling

261

In the Modify Surfaces palette, go to the Color area and click the
button next to Texture.

11 Open the contents of the design folder in the office standard.
To do this, click the Office folder and then the Contents folder.

262

Exercise 7: Rietveld chair

Allplan 2022

12 Select a texture and click OK to confirm.

13 Continue to modify the surface. You can use the settings that are
shown in the illustration. When you have finished, click OK to
confirm.
Tip: You can find the
Save as a favorite tool
at the bottom of the Modify
surfaces palette. By means
of this tool, you can save
the surface under a new
name (for example,
wood_chair.surf).

Basics Tutorial

Unit 3: 3D modeling

263

264

Exercise 7: Rietveld chair

The result might look like this:

Allplan 2022

Basics Tutorial

Index

265

Index
2
2D entities to 3D 244, 253

3
3D
3D line 236
3D rectangle 236
extrude along path 244
rotate 3D elements 235, 240

A
Actionbar configuration 22
contents and structure 23
show menu bar 243
additional tools
division point 100, 110
polar coordinates 110
reference point 45
animation 255
area detection 86
auto-delete segments 101, 107,
167, 172, 196, 202
axis of rotation 240

B
basic settings 22
Actionbar configuration 22
options 37
settings on the Actionbar 35
track tracing 36
box 247
brackets 65

C
circle 44, 72, 100
color 255
construction lines 110, 118, 230
contact 3
copy 45, 55, 63, 65, 83, 110, 118,
175, 179

copy and mirror 45, 58, 101, 118,
196, 203, 207
copy drawing file 63

D
data path 186
design check 255
dimension line
horizontal 216
vertical 217
dimension line parameters 213
save 213
set 213
dimensions 212
add dim. line point 220
automatic 219
horizontal 216
set parameters 213
vertical 217
drawing file status 20

E
element filter
element 80, 83
enter 37
enter points 45
extrude along path 244

F
favorite 213
file cabinet 44
design 45
modify 63
full circle 118

H
hatching 80
definition 89, 225
exclude region 228
modify 88, 227
horizontal text 123

266

Index

I
intersect 2 entities 100, 101, 107

L
label style 166
labeling 123
library 186
linear snap 73, 110

M
midpoint 43, 45, 54, 58, 62, 175,
196, 203, 207
modification
dimension lines 220
hatching 88
modify offset 63
stretch entities 63
modification tools 63
modify offset 63

O
objectives 7, 8, 9, 10
office
data path 186
options 37
origin of work plane 247
outline detection 225

P
palette window 26
connect palette 33
Issue Manager palette 32
layers palette 34
library palette 28
objects palette 29
planes palette 30
properties palette 26
wizards palette 27
plan view 247
point of intersection 45, 71, 118
point snap and offset entry 45
polar coordinates 110
polyline entry tools 94
precast balcony unit 195
apply hatching 224
design 196

Allplan 2022
dimension 212
print 230
print preview 230
print screen contents 230
private
data path 186
project
create project 15
data path 186
path for settings 15
purlin roof 100
design 100
label 123

R
rectangle 45, 52, 62, 100, 101, 107,
167, 169, 196, 198
rectangle based on centerline
107
reference point 45
requirements 2
retaining wall with drainage 71
design 72
hatching 80
Rietveld chair
3D design 244
extrude along path 244
rotate 3D elements 235, 240

S
saving
dimension line parameters 213
favorite 213
select pen and line type 38
show/hide 39
sources of information 4
additional help 5
stretch entities 63
symbols
data path 186
general 186
output 191
symbol's base point 186

T
task areas
2D areas task area 71, 127

Basics Tutorial

Index
2D objects task area 44, 71,
100, 127, 166, 195
3D objects task area 234
Boolean operators task area
234
change task area 71, 127
filter task area 71, 100
quick access task area 100,
166, 195
text
text anchor point 123, 175, 177,
179
text height 123, 175, 177, 179,
182
text width 123, 175, 182
texture 255
title block
design 167
label 175
symbol 186
tools
2D entities to 3D 244, 253
3D line 236
3D rectangle 236
box 244, 247
circle 44, 72, 100
construction lines 110, 118, 230
copy and mirror 45, 58, 101,
118, 196, 203, 207
extrude along path 244
fold line 207
horizontal text 123
intersect 2 entities 100
line 73, 83, 101, 110, 202, 203,
206, 207, 209
modify elements 88
modify offset 63
parallel to element 63, 69, 101,
107, 167, 169, 196, 200, 212
print 230
print preview 230
rectangle 44, 100
rotate 240
rotate 3D elements 235, 240
stretch entities 63

267
subtract and remove solid
244, 253
work plane 244, 247
training, coaching, and project
support 6
troubleshooting 42
check list 42
troubleshooting 42

U
understanding drawing files 19
user-defined coordinate system,
see work plane 247

V
viewport toolbar 39

W
work plane 234, 247, 253

X
x-axis of work plane 247

Y
y-axis of work plane 247

Z
zigzag chair 233


# Allplan 2022 SbS DoorsWindowsSmartParts

**Kategori:** Allplan 2022 Step-by-Step
**Kaynak:** `Allplan_2022_SbS_DoorsWindowsSmartParts-u80tloebdr0.pdf`

---

**Toplam Sayfa:** 228


## Sayfa 1

ALLPLAN 2022
S tep by Step
Doors, Windows, and SmartParts

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
1st edition, June 2022
Document no. 220eng01s57-1-BS0622

Doors, Windows, and SmartParts Contents i
Contents
Welcome ............................................................................................. 1
Requirements .................................................................................................................... 2
Feedback on the documentation ......................................................................... 3
Sources of information ............................................................................................... 4
Available documentation ......................................................................................... 4
Further help.................................................................................................................... 5
Training, coaching, and project support ........................................................... 6
Basics .................................................................................................. 7
Objectives ............................................................................................................................ 7
Exercise 1: creating door openings ....................................................................... 7
Exercise 2: modifying door openings ................................................................. 8
Exercise 3: inserting SmartParts into the interior doors .......................... 9
Exercise 4: modeling door SmartParts ........................................................... 10
Exercise 5: creating window openings ..............................................................11
Exercise 6: modeling window SmartParts .....................................................12
Exercise 7: modifying window openings..........................................................13
Exercise 8: dimensioning openings ................................................................... 14
Exercise 9: creating a corner window with SmartParts ..........................15
Exercise 10: creating shading SmartParts......................................................16
Exercise 11: garage ..................................................................................................... 17
Exercise 12: reports and attributes ................................................................... 18
Training data on the internet ................................................................................. 19
Downloading the training data .............................................................................19
Contents of the training project .........................................................................20

i i Contents Allplan 2022
Importing the training project and making settings ...............................21
Basic settings ................................................................................................................. 23
Configuration .............................................................................................................. 24
Options........................................................................................................................... 24
Reference scale ......................................................................................................... 26
Pen settings ................................................................................................................ 26
Unit 1: doors ................................................................................... 29
Exercise 1: creating door openings .................................................................. 30
Openings for interior doors ................................................................................... 31
Opening for interior door extending up to the ceiling............................... 37
Openings for exterior doors ................................................................................ 42
Exercise 2: modifying door openings ............................................................. 45
Modifying the door swing ..................................................................................... 46
Modifying the opening width and moving the opening ........................... 49
Creating the door strip and the reveal element ........................................... 51
Exercise 3: inserting SmartParts into the openings of the interior
doors .................................................................................................................................... 54
SmartPart - what's that? ...................................................................................... 55
Door SmartParts from the library ..................................................................... 56
Exercise 4: modeling door SmartParts ......................................................... 60
Modeling the SmartPart for the front door ................................................... 61
Saving the SmartPart for the front door ........................................................ 71
Inserting and modifying the door SmartPart ............................................... 74
Unit 2: windows ............................................................................. 81
Exercise 5: creating window openings.......................................................... 82
Openings for windows............................................................................................ 83
Openings for French windows ............................................................................. 91

Doors, Windows, and SmartParts Contents iii
Exercise 6: modeling window SmartParts .................................................. 96
Modeling a window SmartPart............................................................................ 97
Saving the window SmartPart to the library..............................................106
Saving the window SmartPart as a favorite file ...................................... 108
Inserting the window SmartPart into more openings.............................110
SmartPart for French window ........................................................................... 112
Exercise 7: modifying window openings ..................................................... 119
Sill height and opening width ..............................................................................120
Modifying a window SmartPart........................................................................ 122
Separate window sill SmartParts .................................................................... 125
Applying architectural component properties .......................................... 129
Exercise 8: dimensioning openings ................................................................. 131
Dimensioning exterior doors and windows................................................. 132
Dimensioning openings of interior doors......................................................139
Calculating sill heights .......................................................................................... 144
Exercise 9: creating a corner window with SmartParts .................. 145
Creating the opening for the corner window .............................................146
SmartParts for the corner window ................................................................149
Exercise 10: creating shading SmartParts ................................................. 161
Modeling a SmartPart for sliding shutters...................................................163
Saving and inserting the shading SmartPart..............................................168
Modeling and using a SmartPart for roller shutters ................................ 172
Integrated roller shutters .................................................................................... 174
Result after 10 exercises ..................................................................................... 179
A note on openings in multilayer walls .........................................................180
Creating a window opening in a single-leaf wall ...................................... 180
Creating a window opening in a double-leaf wall .................................... 184
Exercise 11: garage .................................................................................................... 187
Creating door openings and slab openings.................................................. 187
Inserting SmartParts .............................................................................................194

i v Contents Allplan 2022
Unit 3: analyses ......................................................................... 205
Exercise 12: reports and attributes............................................................... 206
Reports for windows............................................................................................ 207
Modifying attributes .............................................................................................. 210
Reports for doors ................................................................................................... 212
Working with Excel lists ....................................................................................... 214
Index ............................................................................................... 221

Doors, Windows, and SmartParts Welcome 1
Welcome
Welcome to Allplan 2022! This step-by-step guide shows
you how to design and modify doors, windows, and
SmartParts.
You will find three units and an additional chapter in this
guide. In unit 1, you will learn how to design and modify
doors. Unit 2 will show you how to handle windows. You
will work with SmartParts in both units. In unit 3, you will
learn how to analyze windows and doors. The units
contain several exercises on these topics.
An additional chapter shows you how to insert windows
into multilayer walls.
All the exercises are described in detail by a step-by-step
approach, making sure you can work through the
individual exercises quickly and easily.
Have fun with this guide! We wish you every success!

2 Requirements Allplan 2022
Requirements
This guide assumes that you are familiar with and have a working
knowledge of Windows and Allplan 2022.
The essentials are described in the manual and in the Allplan Help. In
particular, you should know
• How to start and close Allplan 2022
• How to make drawing files current, open them in edit or reference
mode, or close them
• How to use the tools for zooming; in particular, how to display the
entire drawing on the screen and how to zoom in on details
You should work through the exercises in the sequence specified,
because tools that are presented in more detail in the earlier
exercises are only referred to by name in later exercises.

Doors, Windows, and SmartParts Welcome 3
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

4 Sources of information Allplan 2022
Sources of information
Available documentation
The documentation on Allplan consists of the following parts:
• The Help is the main source of information for learning about and
using Allplan.
While Allplan is running, you can get Help on the current tool by
selecting F1. You can also select What’s This in the Help
drop-down list (right side of the title bar) or use the Shift+F1
keyboard shortcut and click the icon on which you need Help.
• The Manual provides an overview of basic concepts and basic
terms in Allplan as well as showing you how to make entries in
Allplan.
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


## Sayfa 11

Doors, Windows, and SmartParts Welcome 5
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

6 Training, coaching, and project support Allplan 2022
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

Doors, Windows, and SmartParts Basics 7
Basics
Objectives
Exercise 1: creating door openings
• Creating door openings for interior doors and exterior doors

8 Objectives Allplan 2022
Exercise 2: modifying door openings
• Modifying the door swing
• Modifying the opening width and moving the opening
• Creating the door strip
• Creating the reveal element

Doors, Windows, and SmartParts Basics 9
Exercise 3: inserting SmartParts into the interior doors
• SmartPart - what's that?
• Inserting a door SmartPart from the library

1 0 Objectives Allplan 2022
Exercise 4: modeling door SmartParts
• Modeling and saving the SmartPart for the front door
• Inserting and modifying the SmartPart

Doors, Windows, and SmartParts Basics 11
Exercise 5: creating window openings
• Creating openings for windows

1 2 Objectives Allplan 2022
Exercise 6: modeling window SmartParts
• Modeling a window SmartPart and inserting it into the window
opening
• Saving the window SmartPart to the library
• Saving the window SmartPart as a favorite file
• Modeling and inserting a SmartPart for a French window, and
saving it to the library

Doors, Windows, and SmartParts Basics 13
Exercise 7: modifying window openings
• Modifying the sill height and opening width of a window opening
• Modifying the window SmartPart
• Creating separate window sill SmartParts
• Applying architectural component properties

1 4 Objectives Allplan 2022
Exercise 8: dimensioning openings
• Dimensioning exterior doors and windows
• Dimensioning openings of interior doors
• Calculating sill heights


## Sayfa 21

Doors, Windows, and SmartParts Basics 15
Exercise 9: creating a corner window with SmartParts
• Creating a corner window
• Creating, inserting, and saving SmartParts for corner windows

1 6 Objectives Allplan 2022
Exercise 10: creating shading SmartParts
• Modeling shading SmartParts
• Saving and inserting shading SmartParts
• Creating integrated roller shutters

Doors, Windows, and SmartParts Basics 17
Exercise 11: garage
• Creating door openings and slab openings
• Modeling and inserting door SmartParts and domed roof-light
SmartParts

1 8 Objectives Allplan 2022
Exercise 12: reports and attributes
• Reports - finish
• Working with Excel lists
Figure: reports - finish - windows, doors - windows (details).rdlc

Doors, Windows, and SmartParts Basics 19
Training data on the internet
You can download the data for the exercises in this guide from our
service portal Allplan Connect.
Downloading the training data
You can download the training data from Allplan Connect, the service
portal for Allplan.
Go to
connect.allplan.com
• Register with your customer number and email address.
Registration is free and not subject to any conditions.
After a few minutes, you will be able to access the data and
information there.
• In Allplan Connect, you can find the training data for this step-by-
step guide in the Training - Documentation - Step by Step area.
• In addition to the training data, this area provides the latest
version of this document as a PDF file.
• Download the training data (
Allplan training project
for step by step - doors, windows, and
) from Allplan Connect to any folder, for example,
SmartParts
C:\data\training.
Note: Serviceplus customers have access to more step-by-step
guides in the Training area of Allplan Connect. It usually takes one to
two working days until Serviceplus customers can access this
restricted area and download documents. This service is available to
Serviceplus customers only.
For general information on Serviceplus, go to
www.allplan.com/serviceplus

2 0 Training data on the internet Allplan 2022
Contents of the training project
The following section “Importing the project (on page 21)” shows you
how to import the training project.
The doors, windows, and SmartParts training project contains
drawing files at different stages, so that you can start wherever you
want. You can also skip some exercises and continue at an advanced
stage. As you work your way through the exercises in this guide, you
will create various opening elements in the form of SmartParts. The
training project also contains these SmartParts as samples so that
you have everything you need for your work. You can find these
SmartParts in four different sample folders in the project folder of
the library.

Doors, Windows, and SmartParts Basics 21
Importing the training project and making
settings
To import the training project and to make settings
 You have downloaded the training project from Allplan Connect.
1 Go to the Windows Start menu, open the Allplan folder, and click
Allplan 2022.
Or
Double-click the Allplan 2022 icon on the desktop.
2 After you have started Allplan 2022, click Open on the welcome
screen.
If you have turned off the welcome screen, click New Project,
Open Project... on the Quick Access Toolbar.

2 2 Importing the training project and making settings Allplan 2022
The New Project, Open Project dialog box opens.
3 Drag the downloaded ZIP file from File Explorer into the area
where the projects are listed in the New Project, Open Project
dialog box.
Or:
Right-click in the empty area of the project list and select Import
project on the shortcut menu. Select the downloaded ZIP file in
the Open dialog box.
4 Click OK to confirm the New Project dialog box.
You can now select the Doors, Windows, and SmartParts
project.
5 Open the project.
6 Click Open on a Project-Specific Basis... on the Quick Access
Toolbar.
7 Check the Building structure tab, making sure the Ground floor
structural level is selected and drawing file 30 Floor plan without
openings is current.
8 Click Close.

Doors, Windows, and SmartParts Basics 23
9 Right-click an element and select Modify Layer Status on the
shortcut menu.
10 The Modify Layer Status dialog box opens. Click Set all layers
to modifiable - retain current layer.
You can see the whole model.
Basic settings
The next step is to define the settings that you will use in the
exercises. These settings match the default settings that apply after
you have installed Allplan 2022. Nevertheless, check these settings
and correct them if this is necessary.

2 4 Basic settings Allplan 2022
Configuration
After you have installed Allplan 2022, the Actionbar configuration is
set by default. Do not change this setting.
Options
You can define various defaults in Allplan.
To define the options
1 Open the Default Settings drop-down list on the Quick
Access Toolbar and click Options. Select the Desktop
environment page.


## Sayfa 31

Doors, Windows, and SmartParts Basics 25
2 Check the unit of length. If it is not m, open the list box and
select m.
3 Click OK to confirm the settings.
Note: You can also change the unit of length on the status bar.
Click the current unit of length and select required the unit.

2 6 Basic settings Allplan 2022
Reference scale
Before you get started, switch the reference scale to 1:100.
To specify the reference scale
1 Click the current scale on the status bar.
2 Click 1:100.
Pen settings
Before you start drawing, define the line thickness (pen) and the line
type in the Properties palette. You can change these settings at any
time.
Each element can be given one of Allplan's 256 line colors or element
colors. However, the way elements look depends on the setting of
the color stands for pen option in Show/Hide ( View drop-
down list on the Quick Access Toolbar):

Doors, Windows, and SmartParts Basics 27
• If color stands for pen is not selected, the program uses the line
color you selected (default setting).
• If color stands for pen is selected, the program uses the color
that is associated with the current pen thickness.
Tip: You can display the
To define the pen and line type
element colors in the
animation viewport 1 Go to the Properties palette - Format area, open the Pen
independently of the color thickness drop-down list and select 0.25 mm.
stands for pen option in
Show/Hide: Select the
Options ( Default
Settings drop-down list on
the Quick Access Toolbar),
open the Animation page
and turn off the "color
stands for pen" as in
Show/Hide option in the 2 Open the Line type drop-down list and select 1 (a continuous
General area. line).
3 To define the Line color, open the drop-down list and select 1
(black; the background color is white).
You will use these settings in the following exercises.
Note: Draw all the exercises in this guide with these basic settings
even if this is not explicitly specified.

2 8 Basic settings Allplan 2022

Doors, Windows, and SmartParts Unit 1: doors 29
Unit 1: doors
In the first unit, you will insert openings for interior doors
and exterior doors into the floor plan. You will then modify
these openings. For example, you will change the opening
width and the direction of the door swing. You will use the
Door tool both to create and to modify these openings.
The next step involves inserting doors into these
openings. You will use the door SmartParts that you can
find in the library. In addition, you will model your own
door SmartPart by means of the Door SmartPart tool.
You will then save this SmartPart to a separate folder in
the Library palette.
You will insert the SmartPart you modeled yourself into
three openings. For the first two openings, you will use
the SmartPart as it is. For the third opening, you will
modify it. You will also save this modified SmartPart to
the library.
Work your way through the exercises step by step.

3 0 Exercise 1: creating door openings Allplan 2022
Exercise 1: creating door openings
This project uses single-leaf doors. The front door is 2.75 m high; the
interior doors are 2.16 m high. Both values include a floor structure of
15 cm.
For the time being, you will draw the door swing only. You will insert
SmartParts later. The procedure for creating door openings also
applies to all other kinds of openings.
Entering openings
• Click the first point of the opening.
• Enter properties and the height.
• Enter the width of the opening.
You must define the settings for the opening only once if you want to
create a series of identical openings. The program saves the
properties and height settings until you redefine them.
Tools: Objective:
Door
Enter offset
Relative to upper plane
Relative to lower plane

Doors, Windows, and SmartParts Unit 1: doors 31
Openings for interior doors
To create openings for interior doors
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar). Go to the Ground floor structural level and check that
drawing file 30 Floor plan without openings is current. Make sure
all the other drawing files are closed.
2 Click Door (Architecture or Engineering role - Elements task
- Components task area).
3 First, you will create the openings for the interior doors.
Start with the door on the left side (see floor plan at the beginning
of this exercise). Point into the corresponding interior wall.
Define the opening's anchor point. Select the lower-left
corner.
A preview of the opening is attached to the crosshairs. You can
see the direction of opening. (This is particularly important for
openings in multilayer walls where the offset varies from layer to
layer.)
A Wall line clicked = exterior side of opening
4 Click the interior wall line roughly where you want to insert the
room door (see floor plan at the beginning of this exercise).

3 2 Exercise 1: creating door openings Allplan 2022
Note: Make sure Enter offset directly on/off is not selected
in the dialog line; otherwise, you cannot enter the offset based on
the reference point.
The reference point is represented by an arrow; you can see the
offset in the dialog line.
5 Check the position of the reference point. If it isn't correct, move
the reference point.
6 Enter the offset in the dialog line: 0.5
Select ENTER to confirm.
Note: If prompt for opening width is not selected on the Door
context toolbar, Allplan creates the opening with the width
defined in the Properties without prompting you again.
7 Click Properties.
8 Select the rectangular shape for the door type.

Doors, Windows, and SmartParts Unit 1: doors 33
9 Click the icon representing the Opening direction and select the
single-leaf door.
10 Go to the Parameters area, click the button to the right of Width
of opening, and select a width of 0.885 m.
Tip: Modifying door swings 11 Click the Height... button.
is that easy: Select the Door
Define the heights of the top and bottom levels of the door
tool and click inside the door
opening.
opening. Select a different
Opening direction in the
dialog box. Allplan
automatically deletes the
old door swing.

3 4 Exercise 1: creating door openings Allplan 2022
Note: Attach the top level of the door opening to the lower
default plane, too. As a result, the height of the door does not
change even when the height of the story changes.
12 In the Top level area, click Relative to lower plane and enter
the following value: 2.16 m.
(2.01-m unfinished dimensions of door plus 15-cm floor structure)
13 In the Bottom level area, click Relative to lower plane (offset:
0.00) and click OK to confirm.
Tip: You can change the 14 Check that the Library element 1 to n area is empty. If it isn't,
width of the opening in the click .
dialog box. So, you can The same applies to the sill representation and the reveal
quickly create several doors element: Clear the Create reveal element check box and click
of the same type and height None in the Sill representation area.
but of varying width.


## Sayfa 41

Doors, Windows, and SmartParts Unit 1: doors 35
The Door dialog box should now look like this:
15 Click OK to confirm the settings.
16 Confirm the Offset to end of opening (the width of the opening) in
the dialog line: 0.8850.
Note: You can define the Width of opening in the Door dialog box
(Parameters area) or in the dialog line.

3 6 Exercise 1: creating door openings Allplan 2022
Tip: When placing the door 17 Specify the direction of the door swing.
swing, you can select a layer The preview is attached to the crosshairs.
(Properties palette -
Note: If Place label is selected on the Door context toolbar, you
Format area). For example,
can label the opening as you would do this by using the Label
you can place all door
tool.
swings on this layer. In
addition, you can define the Place the other interior doors.
Pen, Line, and Color for the
18 If the tool is no longer open, click Door again.
door swing in the Format
area of the Properties 19 Insert all interior doors.
palette. Check the offset, opening width, and direction of the door swing
for each door.
Tip: To check the model in
three-dimensional space,
you can choose a
Standard isometric
view and select the Hidden
view type (viewport
toolbar).

Doors, Windows, and SmartParts Unit 1: doors 37
User-defined dialog boxes
Allplan 2022 provides user-defined dialog boxes, where you can
enter any value in addition to the predefined values.
This is the default setting. Enter a value at the keyboard and
select ENTER. Allplan uses the value entered, adding it to the
selection.
Click this icon and enter a value at the keyboard (select ENTER to
confirm). Allplan uses this value without adding it to the list. In
addition, you can find values.
Select a value and delete it by clicking this icon. You can delete
only values that you defined yourself.
Opening for interior door extending up to the ceiling
The door connecting the coatroom with the hall is a special door: It
extends up to the ceiling and is as wide as the hall.
To create the opening for the door connecting the
coatroom with the hall
 Drawing file 30 Floor plan without openings is current. All the
other drawing files are closed.
1 If the tool is no longer open, click Door again.
2 Click (viewport toolbar) to zoom in on the area between the
floor and the coatroom (see illustration).
3 Click the interior wall line as shown.

3 8 Exercise 1: creating door openings Allplan 2022
4 Check the position of the reference point and enter 0.00 for the
offset to the reference point. Then select ENTER to confirm.
5 Click Properties.
6 Here, too, select the rectangular shape for the door type.
7 The connecting door does not require an opening symbol.
Click the icon representing the opening direction and click .
8 Enter the width of opening = 1.76 m.
9 Click Height....

Doors, Windows, and SmartParts Unit 1: doors 39
10 The connecting door is to extend up to the ceiling.
In the Top level area, click Relative to upper plane and enter
0.00 m for the offset.
11 Do not change the Relative to lower plane setting for the
Bottom level. Here, too, the offset is 0.00 m.
12 Click OK to confirm.
As a result, the connecting door is 2.75 m high.

4 0 Exercise 1: creating door openings Allplan 2022
13 Check all the other settings in the Door dialog box:
14 Click OK to confirm the Door dialog box.
15 Confirm the offset to end of opening (the width of the opening) in
the dialog line: 1.760

Doors, Windows, and SmartParts Unit 1: doors 41
You have created the opening for the connecting door.

4 2 Exercise 1: creating door openings Allplan 2022
Openings for exterior doors
So far you have added a number of interior doors to the floor plan.
The front door and the door leading to the garden are still missing.
To create openings for doors
 Drawing file 30 Floor plan without openings is current. All the
other drawing files are closed.
1 If the Door tool is no longer open, open the Repeat drop-
down list on the Quick Access Toolbar and click this tool.
2 Start by creating the opening for the front door.
Zoom in on this area (see illustration at the beginning of this
exercise).
3 Click the line outer line of the exterior wall roughly where you
want to insert the front door.
4 Check the reference point and enter the offset in the dialog line:
0.125
5 Click Properties.
6 Enter the width of opening = 1.51 m.
7 Do not change anything else in the Door dialog box and click OK
to confirm.

Doors, Windows, and SmartParts Unit 1: doors 43
8 Confirm the offset to end of opening (the width of the opening) in
the dialog line: 1.5100
You have created the opening for the front door. You need the
same opening for the door leading to the garden on the left side.
9 Zoom in on this part of the floor plan.
10 The opening is to be flush with the horizontal wall at the top.
Check the reference point and enter 0.00 for the offset.
11 Confirm the opening width of 1.5100 in the dialog line.

4 4 Exercise 1: creating door openings Allplan 2022
12 Select the ESC key to close the tool.


## Sayfa 51

Doors, Windows, and SmartParts Unit 1: doors 45
Exercise 2: modifying door openings
In this exercise, you will modify the openings of an interior door, the
front door, and the door leading to the garden in various ways.
Tools: Objective:
Handles
Direct object
modification
Door
If you want to work through this exercise later, you can skip it and
continue to insert SmartParts. Go to Exercise 3: inserting
SmartParts into the openings of the interior doors (on page 54) and
open drawing file 31 Floor plan with door openings.

4 6 Exercise 2: modifying door openings Allplan 2022
Modifying the door swing
You can modify the door swing of the interior door between the hall
and the living and dining area without having to draw the door
opening from scratch.
->
To modify the door swing
 Drawing file 30 Floor plan without openings is current. All the
other drawing files are closed.
1 Double-click the door swing symbol.
2 As you do not want to place a new symbol, click Close in the Door
swing symbols dialog box.
3 Click in the door opening to place the door swing.
If there was already a door swing in place, then it is automatically
deleted.
Note: To modify the type of a door swing or delete a door swing,
use the procedure described instead of deleting and drawing the
door opening from scratch each time.
When you enter a value other than zero for the offset in the Door
swing symbols dialog box, the door leaf created consists of two
lines at the offset specified. Offset = 0 produces a door leaf
consisting of a single line.

Doors, Windows, and SmartParts Unit 1: doors 47
You do not need to select a tool for the following modifications. You
can use direct object modification to move, copy, rotate, or resize
elements. You can also stretch entities in this way.
Before you can use direct object modification, you must select the
Display handles option on the Desktop environment - Direct object
modification page in the Options ( Default Settings drop-
down list on the Quick Access Toolbar).
To modify the door swing by means of handles
 Open the Options ( Default Settings drop-down list on the
Quick Access Toolbar) and check that the display handles option
is selected on the Desktop environment - Direct object
modification page.
1 Click the door swing symbol.
Allplan selects the door swing symbol, displaying handles.
2 Click the double-headed arrow and drag the door swing to the
opposite side. Then click in the workspace to confirm. That's all!
Note: Pointing to the double-headed arrow displays the context
toolbar for direct object modification. However, you do not need
these tools to change the direction of the door swing.
->

4 8 Exercise 2: modifying door openings Allplan 2022
3 If you want, you can change the angle of the door swing by
clicking the geometry handle and dragging it to the required
position. Alternatively, you can enter the angle in the coordinate
dialog box.
->

Doors, Windows, and SmartParts Unit 1: doors 49
Modifying the opening width and moving the opening
The next step is to modify the width of the same interior door so that
it matches the door openings leading to the bedroom and the study.
Then, you will move this door so that it is directly opposite the
bedroom door.
->
To change the opening width and to move the opening
1 Click in the opening of the interior door.
You can see the options for direct object modification.
2 Modify the width of the door opening so that the length of the
wall section to the right of the door changes. Click the toggle to
define the direction as shown in the illustration:
The toggle below the box indicates that the change applies to
the right side.
3 Enter 0.885 m for the new width of the door.

5 0 Exercise 2: modifying door openings Allplan 2022
4 Select ENTER to confirm.
Note: You can also modify the width of the door by opening the
Door dialog box (double-click the door opening) and changing the
width of opening parameter.
5 Use direct object modification to move the interior door so that
it is directly opposite the bedroom door.
Enter the new offset = 4.435 m in the box to the left of the door
opening.
6 Select ESC to close direct object modification.

Doors, Windows, and SmartParts Unit 1: doors 51
Creating the door strip and the reveal element
The front door requires a door strip.
In addition, you wall add a reveal element to the front door. Exercise
4 shows you how to create a SmartPart for the front door. This
SmartPart will use the reveal element to find its correct position in
the opening.
->
To create the door strip and the reveal element
1 Double-click in the opening of the front door.
This opens the Door dialog box, where you can make
modifications.
2 In the Sill representation area, click outside.
3 Select the pen, line, and color for the door strip in the Sill: format
properties area.
4 To define a reveal element, select the Create reveal element
option in the Reveal area of the Door dialog box.
5 Open the Reveal tab of the Door dialog box.

5 2 Exercise 2: modifying door openings Allplan 2022
6 As the floor plan has single-leaf walls, the reveal type is
predefined.
Note: Allplan will not create the reveal element until you enter a
door depth.
In the Parameters area, enter the door depth = 0.07 m and the
inner reveal = 0.285 m.
Allplan calculates the outer reveal automatically. In this example,
it is 0.08 m.
Tip: Look in the Allplan Help 7 Click OK to confirm the Door dialog box.
for further information on
You can see the door strip and the reveal element in your
door depth, outer reveal,
drawing.
and inner reveal. See “Door
opening parameters”. 8 Add the door strip and the reveal element to the exterior door
leading to the garden. Try to do this yourself!
Compare the result with the illustration at the beginning of
exercise 2.

Doors, Windows, and SmartParts Unit 1: doors 53
The outer reveal, inner reveal, and window depth or door depth
parameters define the exact position of the actual opening element
(for example, SmartPart). The use of precise measurements is not
only important for ensuring that the program displays the elements
correctly on the screen - it is also critical if the reports and analyses
you generate later are to be accurate.
The system's built-in checker makes sure that the sum of the outer
reveal and inner reveal is equivalent to the total thickness of the
wall.
A Wall line clicked = exterior side of opening
1 Wall thickness
2 Opening width
3 Outer reveal depth
4 Inner reveal depth
5 Depth of opening element (for example, window or door)
The window depth or door depth defines the depth of the opening
element, which represents the position of the actual opening. The
inner reveal includes the window depth or door depth.
Tip: You can change the
reveal by selecting
Define, Modify Reveal
(shortcut menu of a door
opening).

5 4 Exercise 3: inserting SmartParts into the openings of the interior doorsAllplan
Exercise 3: inserting SmartParts into the
openings of the interior doors
In this exercise, you will insert SmartParts into the interior doors. You
will use door SmartParts that come with the program. You can find
these SmartParts in the Allplan library.
Tools: Objective:
Library palette (Default,
..., Interior doors, 1 leaf
folder)
This chapter starts with a brief introduction to SmartParts.


## Sayfa 61

Doors, Windows, and SmartParts Unit 1: doors 55
SmartPart - what's that?
SmartParts are parametric Allplan CAD objects that act according to
their own inherent logic, which is independent of the CAD system.
Parametric information is controlled by a script, which is attached
directly to the object.
The Allplan library contains a wide range of predefined SmartParts.
You can take these SmartParts from the library and use them as
they are in your project. But you can also customize these
SmartParts to your needs in the Properties palette.
You can model your own SmartParts by means of the Window
SmartPart, Door SmartPart, Shading SmartPart, Domed
Roof-Light SmartPart (Architecture role - Elements task -
Opening Elements task area) and Skylight SmartPart tools
(Architecture or Engineering role - Elements task - Roof task area).
While you are modeling a SmartPart, Allplan displays each step in real
time. You can save the finished SmartPart as an smv file by using the
Save as a favorite tool. You can also save the SmartPart to your
own folder in the Library palette.
You can insert SmartParts into openings in linear walls. SmartParts
adapts to any outline.
You can edit SmartParts graphically by using handles or
alphanumerically by using the Properties palette. To modify
SmartParts graphically, you can use the Modify SmartPart using
Handles tool, which you can find on the shortcut menu of the
SmartPart.
It is also possible to use the handles and the Properties palette in
combination. If you want to do this, double-click the SmartPart.
Allplan opens the Properties palette of the SmartPart and displays
the handles.
You can analyze SmartParts by means of the Reports tool.

5 6 Exercise 3: inserting SmartParts into the openings of the interior doorsAllplan
Door SmartParts from the library
The library comes with a wide range of predefined SmartParts. You
will insert the same door SmartPart into all openings for interior
doors.
You can find the floor plan with all door openings in drawing file 31
Floor plan with door openings. Continue with this drawing file.
To insert the door SmartPart
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar). Go to the Ground floor structural level and make
drawing file 31 Floor plan with door openings current. All the
other drawing files are closed.
2 Start with the left interior door - the door leading to the study.
Zoom in on this area.
3 Open the Library palette and the following folders one after the
other: Default - Architecture - Doors - Interior doors, 1 leaf.

Doors, Windows, and SmartParts Unit 1: doors 57
4 Go to the Interior doors, 1 leaf area. Scroll down until you can see
the 1l white CF outside door; then, double-click this door.
The SmartPart is attached to the crosshairs.
5 Point into the opening.

5 8 Exercise 3: inserting SmartParts into the openings of the interior doorsAllplan
The selected door SmartPart adapts to the shape and size of the
opening.
An arrow appears in the middle of the SmartPart, indicating the
outside of the SmartPart. The position of this arrow and thus the
position of the SmartPart changes when you move the
crosshairs. In addition, you can see another symbol, indicating
that the SmartPart will be mirrored.
6 To place the SmartPart, click near the lower-left corner of the
opening.
Allplan fits the door SmartPart into the opening.
Handles appear; the Elements tab of the Properties palette
opens.
7 Adjust the SmartPart to take the floor structure into account.
Open the Settings tab in the Properties palette. Go to the Offset
to opening (1) area and enter bottom = 0.15 m.

Doors, Windows, and SmartParts Unit 1: doors 59
8 Select ESC to finish.
Another copy of the SmartPart you just placed is attached to the
crosshairs so that you can continue to work without interruption.
9 Insert the selected SmartPart into all interior doors in the hall and
coatroom. Before placing each SmartPart, check the door swing
symbol; it helps you position the SmartPart correctly within the
opening.
Select ESC twice to finish placing SmartParts.
10 Insert SmartParts into the openings leading to the bathroom and
the storage.
Use the right mouse button to double-click one of the interior
door SmartParts.
11 The SmartPart is attached to the crosshairs. Insert it into the
empty openings one after the other. Finally, select ESC twice to
finish.
The resulting drawing should look like the illustration (scale 1:50)
at the beginning of this exercise.

6 0 Exercise 4: modeling door SmartParts Allplan 2022
Exercise 4: modeling door SmartParts
There are still three openings without SmartParts: the front door, the
door connecting the hall with the coatroom, and the door leading to
the garden. You will not insert predefined SmartParts from the
library into these openings. Instead, you will model your own door
SmartParts.
By means of the Door SmartPart tool, you will create your own
SmartPart and save it to your own folder in the library. You will insert
this SmartPart into all three openings. For the openings of the front
door and the door leading to the garden, you will use the SmartPart
as it is. For the door connecting the hall with the coatroom, you will
modify the SmartPart after you have placed it. You will then save the
modified SmartPart to the library too.
Tools: Objective:
Door SmartPart
New group (Library
palette)
Insert element (Library
palette)
Insert SmartPart
(Library palette)

Doors, Windows, and SmartParts Unit 1: doors 61
Modeling the SmartPart for the front door
To model a door SmartPart and insert it into the
opening of the front door
 Drawing file 31 Floor plan with door openings is current. All the
other drawing files are closed.
1 Open the Window drop-down list on the Quick Access Toolbar
and click 2+1 Animation Window.
2 Zoom in on the opening for the front door in all three viewports.
3 Switch the scale to 1:50.
4 Select the Door SmartPart tool (Architecture role -
Elements task - Opening Elements task area).
You can use this tool to model SmartParts for any type of door.
5 Select Door in the list box at the top of the Properties palette.
The Elements tab of the door SmartPart opens. The preview
displays the frame, which serves as the basis for modeling the
door SmartPart.
6 When you move the crosshairs across the workspace in plan
view, you can see that the SmartPart, which is currently not more
than the frame, is attached at its drop-in point to the crosshairs.
The drop-in point is always the lower-left corner of the
SmartPart.
Start modeling the door SmartPart by clicking inside the opening
of the front door.
This places the SmartPart, which means that it assumes the size
of the opening. The preview in the palette also adapts to the new
size.
As you have created the opening of the front door with a reveal
element, Allplan places the SmartPart in the middle of this reveal
element.
Note: If the opening does not have a reveal, Allplan places the
SmartPart so that it is centered in the wall layer clicked.

6 2 Exercise 4: modeling door SmartParts Allplan 2022
7 While you are placing the SmartPart, you can see an arrow in the
middle of the SmartPart. This arrow points toward the outside of
the SmartPart.
When placing the SmartPart, make sure this arrow points toward
the outside of the building.
8 Define the dimensions of the frame in the Properties palette.
Make the following settings:

Doors, Windows, and SmartParts Unit 1: doors 63
• Frame area:
Shape: Block frame
Width left / right: 7 cm
Angle left / right: 90°
Width top: 7 cm
Width bottom: 0 cm
Depth: 7 cm
• 3D representation area:
Define how the frame looks in 3D. Select color number 20.
Click to turn off the surface.
9 To create the frame at the height of the floor covering, open the
Settings tab in the palette. Go to the Offset to opening (1) area
and enter the offset to the bottom = 15 cm.
10 By adding a transom, you divide the front door horizontally into
two parts.
To do this, switch back to the Elements tab and click in the middle
of the door in the preview at the top of the palette.
The part clicked appears in the selection color.

6 4 Exercise 4: modeling door SmartParts Allplan 2022
11 Click Transom and define the following parameters:
• Transom area:
Type: Select the Fixed height at bottom option. For the
Bottom, enter 2.11 m. This value is the height of the door leaf.
Width / Depth: 7 cm
• 3D representation area:
Define how the transom looks in 3D. Select color number 20.
Click to turn off the surface.


## Sayfa 71

Doors, Windows, and SmartParts Unit 1: doors 65
12 Click in the upper part of the door in the preview at the top of the
palette. The next step is to turn this part into a glass transom
window.
13 Select Glass and enter a depth of 2 cm. Do not change the other
settings.
14 By adding a mullion, you divide the lower part of the front door
vertically into two parts.
Click in the lower part of the door in the preview at the top of the
palette.
The part clicked appears in the selection color.

6 6 Exercise 4: modeling door SmartParts Allplan 2022
15 Click Mullion and define the following parameters:
• Mullion area:
Type: Select Fixed width on the left. To define the width
on the Left, enter 1.01 m.
Width / Depth: 7 cm
• 3D representation area:
Define how the mullion looks in 3D. Select color number 20.
Click to turn off the surface.

Doors, Windows, and SmartParts Unit 1: doors 67
16 Click in the lower-right field in the preview. The bottom of the
door gets a transom that is symmetrical to the one at the top.
Click Transom and define the following parameters:
• Transom area:
Type: Select the Fixed height at bottom option. For the
Bottom, enter 0.00 m.
Width: 0.07 m (= width of transom at top)
Depth: 0.07 m
• 3D representation area:
Define how the transom looks in 3D. Select color number 20.
Click to turn off the surface.

6 8 Exercise 4: modeling door SmartParts Allplan 2022
17 Go to the preview of the palette and click in the right field above
the transom you just created. This field gets fixed glazing.
Select Glass and enter a depth of 2 cm. Do not change the other
settings.
18 Go to the preview of the palette. Click in the opposite field on the
left side and select Leaf.
Define the following settings for the Leaf:
• Leaf area:
Opening type: Turn
Stop: Right
Depth: 4 cm
• Fittings area:
Hinge side: Door handle
Offset at bottom: 1.05 m
Frame side: Grab bar
Offset at bottom: 0.50 m
Length: 0.90 m
Diameter: 0.04 m
• 3D representation area:
Define how the leaf looks in 3D. Select color number 22.
Click to turn off the surface.

Doors, Windows, and SmartParts Unit 1: doors 69
19 You have modeled all the elements of your first SmartPart.
Click Close at the bottom of the palette. This saves your entries.

7 0 Exercise 4: modeling door SmartParts Allplan 2022
20 Select ESC to finish modeling.

Doors, Windows, and SmartParts Unit 1: doors 71
Saving the SmartPart for the front door
You have just created a SmartPart by using the Door SmartPart
tool. So that you can use this SmartPart later, you can save it to any
folder in the library.
To save the door SmartPart to the library
 Drawing file 31 Floor plan with door openings is current. All the
other drawing files are closed.
 2+1 Animation Window is selected.
 The scale is 1:50.
1 Open the Library palette and the Project folder.
Note: To move through the Library palette, you can use the
options at the top. To open a folder, click it. To find a folder,
click .
Clicking takes you up level by level in the folder hierarchy of
the Library.
2 Select the Doors, Windows, and SmartParts project.
Note: You cannot save your own SmartParts to the Default
folder.
The project comes with four sample folders that contain the
SmartParts as samples. So you have everything you need for
your work.

7 2 Exercise 4: modeling door SmartParts Allplan 2022
3 To save your own SmartPart to the library, click New group at
the bottom of the Library palette. This creates a new folder.
4 Enter Doors for the name of the new folder.
5 Click the new Doors folder to open it.
6 Go to the bottom of the Library palette. Point to Insert
element and click Insert SmartPart.
7 Select SmartPart you want to save
Click the SmartPart you want to save.

Doors, Windows, and SmartParts Unit 1: doors 73
8 Enter Front door for the name of the SmartPart and click OK to
confirm.
You can see the new SmartPart in the preview. You can see the
folder with the SmartPart in the area below the preview.
Note: Folders and SmartParts you create yourself have the
icon. Click this icon to open a shortcut menu where you can
delete, rename, copy, cut, and replace the SmartPart.

7 4 Exercise 4: modeling door SmartParts Allplan 2022
Inserting and modifying the door SmartPart
You just saved your SmartPart to the library. The next steps involve
placing the SmartPart in two door openings in the floor plan. First,
you will insert the SmartPart into the exterior door opening leading
to the garden. You will use the SmartPart as it is. Second, you will
place the SmartPart in the door opening connecting the hall with the
coatroom. Here, you will modify the SmartPart and save the modified
SmartPart to the library.
To place the door SmartPart you modeled yourself
 Drawing file 31 Floor plan with door openings is current. All the
other drawing files are closed.
 2+1 Animation Window is selected.
 The scale is 1:50.
1 The Doors folder is still open in the Library palette.
If it isn't, open the Library palette and the following folders one
after the other: SmartParts - Project - Doors, Windows, and
SmartParts - Doors.
2 To use the front door SmartPart, double-click it.
The palette with the properties of the SmartPart opens; the
SmartPart is attached to the crosshairs.
3 Zoom in on the door leading to the garden in all three viewports.
4 Point into the opening.


## Sayfa 81

Doors, Windows, and SmartParts Unit 1: doors 75
5 When placing the SmartPart, make sure the arrow points toward
the outside of the building. If you place the SmartPart as shown in
the illustration, you can see another symbol indicating that the
SmartPart will be mirrored.
6 Select ESC to confirm.
Another door SmartPart is attached to the crosshairs.
7 Zoom in on the door connecting the hall with the coatroom in all
three viewports.

7 6 Exercise 4: modeling door SmartParts Allplan 2022
8 Place the SmartPart in the opening (see illustration).
Tip: You can also select an 9 This connecting door consists of a transom window and a door
element of a SmartPart by leaf. Modify the SmartPart accordingly.
clicking this element in the Open the element selection list box in the Properties palette and
preview. select mullion. Then click the Delete current element button.

Doors, Windows, and SmartParts Unit 1: doors 77
10 The area with the transom window remains unchanged. Add a
new door leaf to the lower part of the door SmartPart.
This part appears in the selection color in the preview. Click Leaf
and define the following settings:
• Leaf area:
Opening type: turn
Stop: right
Depth: 4 cm
• Fittings area:
Hinge side: Grab bar
Offset at bottom: 0.50 m
Length: 0.90 m
Diameter: 0.04 m

7 8 Exercise 4: modeling door SmartParts Allplan 2022
• Frame side: Grab bar
Offset at bottom: 0.50 m
Length: 0.90 m
Diameter: 0.04 m
• 3D representation area:
For the surface, select the glass.surf file.

Doors, Windows, and SmartParts Unit 1: doors 79
11 To finish, click Close and then select ESC.
12 Save the modified door SmartPart to the Library palette. Here,
too, select the Doors folder. Enter Connecting door for the name
of the SmartPart.
You have inserted door SmartParts into all door openings of the
floor plan.

8 0 Exercise 4: modeling door SmartParts Allplan 2022
After you have worked through the exercises in the first unit, your
floor plan should look like this:

Doors, Windows, and SmartParts Unit 2: windows 81
Unit 2: windows
In the second unit, you will create openings of different
sizes for windows in the floor plan. To do this, you will use
the Window tool.
You will then insert windows into these openings. By
means of the Window SmartPart tool, you will create
your own window SmartParts and window sill
SmartParts and save these SmartParts to a folder in the
library. In addition, you will save one of the SmartParts as
a favorite in your project.
You will modify windows in various ways and dimension
the door openings and the window openings. In addition,
you will learn how to work with the Corner Window tool.
By means of the Shading SmartPart tool, you will create
SmartParts for sliding shutters and roller shutters and
save these SmartParts to the library. You will learn how
to modify window SmartParts and how to add integrated
roller shutters to SmartParts.
An additional chapter will show you how to create
openings in multilayer walls.
In the last exercise of this unit, you will learn how to use
the Domed Roof-Light SmartPart tool - one more tool
Allplan provides for designing architectural SmartParts.
You will create door openings and slab openings in a floor
plan of a garage and insert SmartParts into these
openings.
Here, too, work your way through the exercises step by
step.

8 2 Exercise 5: creating window openings Allplan 2022
Exercise 5: creating window openings
In exercise 5, you will create openings for windows of different sizes.
Tools: Objective:
Window
Relative to upper plane
Relative to lower plane
Rasterize length
In exercises 1 to 4 in unit 1, you created openings for doors and placed
door SmartParts in these openings. It is no problem if you have not
worked through these exercises step by step. The project template
contains all required drawing files. Just switch to drawing file 32 Floor
plan with doors.

Doors, Windows, and SmartParts Unit 2: windows 83
Openings for windows
To create openings for windows
1 Make drawing file 32 Floor plan with doors current. Close all the
other drawing files.
2 Change the reference scale to 1:100.
3 Open the Window drop-down list on the Quick Access Toolbar
and click 1 Viewport.
4 Start creating openings in the exterior wall on the right side.
Zoom in on the upper part of this wall.
5 Click Window (Architecture or Engineering role - Elements
task - Components task area).
6 Check that the prompt for opening width option is selected on
the Window Context toolbar.
Tip: You can change the
7 Set properties or click a line of an exterior wall
anchor point on the context
To define the first point of the opening, click the exterior wall on
toolbar and the position of
the right side. Correct the offset to 0.74.
the reference point.

8 4 Exercise 5: creating window openings Allplan 2022
It is important that you click the outer line of the exterior wall. The
window SmartPart requires this information to find its correct
position.
8 Click Properties.
9 Select the rectangular window.
10 In the Representation of sill area, select the on both sides option;
in the Sill: format properties area, select pen 2 (0.35) and line 1.
11 Define the top and bottom levels of the window opening.
Click Height....


## Sayfa 91

Doors, Windows, and SmartParts Unit 2: windows 85
12 Click
• Relative to upper plane for the top level and
enter an offset of -0.30.
• Relative to lower plane for the bottom level and enter an
offset of 1.35.
13 Click OK to confirm.
14 Make sure the Library element 1 to n area is empty.
If it isn't, click and choose yes at the following prompt.
15 In the Reveal area, select the Create reveal element check box.

8 6 Exercise 5: creating window openings Allplan 2022
16 Switch to the Reveal tab and enter the following values in the
Parameters area:
Window depth: 0.07 m
Outer reveal: 0.09 m
As a result, the inner reveal is 0.275 m.
17 Click OK to close the Window dialog box.
18 Correct the opening width in the dialog line.
Enter 1.51.
19 Select ENTER to confirm.
You can create the next opening.
20 Click the exterior wall on the right side again. This time, click below
the opening you just created.

Doors, Windows, and SmartParts Unit 2: windows 87
21 New reference point or offset to reference point
Enter 1.30 for the distance between the openings. Then select
ENTER to confirm.
22 Set properties, end point or offset to end of opening
This opening gets the same parameters as the first opening. So all
you need to do is enter an opening width of 1.01 m in the dialog
line.
23 Select ENTER to confirm.
24 To create the last opening in the exterior wall on the right side,
change the anchor point for the preview to lower left.
25 Point to the end of the exterior wall on the right side and click the
outer line of the exterior wall.

8 8 Exercise 5: creating window openings Allplan 2022
26 New reference point or offset to reference point
Enter 0.365 for the distance to the wall corner. Then select
ENTER to confirm.
27 Set properties, end point or offset to end of opening
Here, too, you use the same parameters as for the other
openings. Enter an opening width of 1.76 m in the dialog line and
select ENTER to confirm.
28 Create the next opening in the horizontal wall at the bottom.
Change the height and the opening width for this opening.
Click Properties.
29 The Window dialog box opens. Switch to the Opening tab.
30 Click the Height... button. In the Bottom level area, change the
offset for Relative to lower plane to 1.20.
Click OK to confirm the Height and Window dialog boxes.

Doors, Windows, and SmartParts Unit 2: windows 89
31 Click the outer line of the exterior wall.
Change the anchor point for the preview as shown. Define the
distance to the wall corner by entering 0.365 m.
32 Set properties, end point or offset to end of opening
Enter an opening width of 1.50 m in the dialog line and select
ENTER to confirm.

9 0 Exercise 5: creating window openings Allplan 2022
33 Select ESC to close the Window tool. Your floor plan should
now look like this:

Doors, Windows, and SmartParts Unit 2: windows 91
Openings for French windows
Create openings for French windows. The horizontal wall at the top
will get two window openings of equal width. In addition, you will
create an opening for a French window in the upper part of the
exterior wall on the left side. Finally, the horizontal wall at the bottom
will be given openings for double-leaf terrace doors.
To create openings for French windows
 Drawing file 32 Floor plan with doors is current.
 The scale is 1:100; 1 Viewport is open.
1 Zoom in on the horizontal wall at the top.
2 Click Window (Architecture or Engineering role - Elements
task - Components task area).
3 Set properties or click a line of an exterior wall
To define the first point of the opening, click the outer line of the
horizontal wall at the top.
Check the position of the reference point: It is the upper-left
corner of the building.
Enter 1.115 m for the distance to the reference point.
4 Click Properties.
5 Check the following settings:
• Shape: rectangular
• Representation of sill area: on both sides
• Sill: format properties area: pen number 2 (0.35); line 1

9 2 Exercise 5: creating window openings Allplan 2022
6 Define the top and bottom levels of the window opening.
Click the Height... button and define the following settings:
• Top level area: Relative to upper plane = -0.30
• Bottom level area: Relative to lower plane = 0.00
7 Click OK to confirm.
As you can see, Allplan has automatically calculated the sill height
of 0.00 m and the opening height of 2.45 m from the settings you
defined in the Height dialog box.
8 Check that the Library element 1 to n area is empty.
9 In the Reveal area, select the Create reveal element check box.
Then open the Reveal tab.
10 Check the values in the Parameters area:
Window depth: 0.07 m
Outer reveal: 0.09 m
As a result, the inner reveal is 0.275 m.
11 Click OK to close the Window dialog box.
12 Correct the opening width in the dialog line.
Enter 1.26.
13 Select ENTER to confirm.
You can create the next two openings. They are the same size as
the opening you just created.
Try to do it yourself! Use the values in the illustration.

Doors, Windows, and SmartParts Unit 2: windows 93
14 The Window tool is still open.
Zoom in on the horizontal wall at the bottom.
15 Set properties or click a line of an exterior wall
The dialog line provides the Rasterize length option. To select
this option, click its icon. Open the drop-down menu and select
0.100 for the grid length.
Select the Basic dimensions setting.
Tip: To find out more about 16 Switch the anchor point to lower right.
the rasterize length option,
17 Point into the exterior wall at the bottom. A ToolTip attached to
open the Allplan Help and
the crosshairs shows the distance to the end point of the opening
use the Index or search for
(marked with a red cross):
‘rasterize length’.
18 As soon as you can see l= 2.500, click the outer line of the
exterior wall at the bottom.
19 New reference point or offset to reference point
The dialog line displays 2.500 m. Select ENTER to confirm this
value.
20 Set properties, end point or offset to end of opening
Enter an opening width of 2.76 in the dialog line and select ENTER
to confirm.

9 4 Exercise 5: creating window openings Allplan 2022
21 Create another window. The crosshairs are still in the exterior
wall at the bottom. Move the crosshairs further to the left. Place
the new opening l= 0.800 from the window opening you just
created.
Note: Check the position of the reference point, which is marked
with a red cross.
22 New reference point or offset to reference point
The dialog line displays 0.800 m. Select ENTER to confirm this
value.
23 Set properties, end point or offset to end of opening
The dialog line displays an opening width of 2.76 m. Select ENTER
to confirm it.
24 Turn off the Rasterize length option in the dialog line.


## Sayfa 101

Doors, Windows, and SmartParts Unit 2: windows 95
25 Select ESC to close the Window tool.

9 6 Exercise 6: modeling window SmartParts Allplan 2022
Exercise 6: modeling window SmartParts
In unit 1, you created and saved a SmartPart by means of the
Door SmartPart tool.
In this exercise, you will learn how to use the Window SmartPart
tool. The procedure for creating window SmartParts is the same as
that for creating door SmartParts.
Tools: Objective:
Window SmartPart
New group (Library
palette - SmartParts)
Insert element
(Library palette)
Insert SmartPart
(Library palette)
Save as a favorite
Load favorite
Here, too, you can use a predefined drawing file as the basis for your
work. Switch to drawing file 33 Floor plan with doors and window
openings.

Doors, Windows, and SmartParts Unit 2: windows 97
Modeling a window SmartPart
You will model a double-casement window SmartPart with window
sills both on the inside and on the outside. Afterward, you will save
the finished SmartPart to a folder in the library. In addition, you will
save the window SmartPart as a favorite in your project.
To model a window SmartPart
 The reference scale is 1:100.
1 Make drawing file 33 Floor plan with doors and window
openings current. Close all the other drawing files.
2 Open the Window drop-down list on the Quick Access Toolbar
and click 2+1 Animation Window.
3 Change the reference scale to 1:50.
4 Zoom in on the window opening in the bathroom in all three
viewports. The bathroom is the upper-right room.
5 Click Window SmartPart (Architecture role - Elements task
- Opening Elements task area).
You can use this tool to model SmartParts for windows and
window sills.
6 Select Window in the list box at the top of the palette.
You can see the Elements tab of the window SmartPart. The
preview displays the frame, which serves as the basis for
modeling the window SmartPart.
Note: When you point to the lower edge of the preview, the
cursor turns into a double-headed arrow. Now you can change
the size of the preview.
7 When you move the crosshairs across the workspace in plan
view, you can see that the SmartPart, which is currently not more
than the frame, is attached at its drop-in point to the crosshairs.
The drop-in point of a window SmartPart - like the drop-in point
of a door SmartPart - is the lower-left corner of the SmartPart.
Start modeling the window SmartPart by clicking inside the
window opening.

9 8 Exercise 6: modeling window SmartParts Allplan 2022
This places the SmartPart, which means that it assumes the size
of the opening. The preview in the palette also adapts to the new
size.
As you have created the window opening with a reveal, Allplan
places the SmartPart in the middle of this reveal element.
8 While you are placing the SmartPart, you can see an arrow in the
middle of the SmartPart. This arrow points toward the outside of
the SmartPart.
When placing the SmartPart, make sure this arrow points toward
the outside of the building.

Doors, Windows, and SmartParts Unit 2: windows 99
9 Define the dimensions of the frame in the palette.
Make the following settings:
• Frame area:
Shape: Block frame
Width left / right: 7 cm
Angle left / right: 90°
Width top / bottom: 7 cm
Depth: 7 cm
• 3D representation area:
Define how the frame looks in 3D. Select color number 20.
Click to turn off the surface.
10 The window gets two casements of different width. Click in the
middle of the window in the preview.
11 Select Vertically split and define the following settings:

1 00 Exercise 6: modeling window SmartParts Allplan 2022
• Subdivision area: Select the Fixed width on the left type.
To define the width on the Left, enter 0.45 m.
12 To model the left casement, click in the left part of the window in
the preview.
13 Select Casement and define the following settings:
• Casement area:
Opening type: Tilt and turn
Stop: Right
Widths and Depth: 5 cm
• Fittings area:
Hinge side: Window handle
Frame side: (without) turn handles off.
• 3D representation area:
Define how the frame looks in 3D. Select color number 22.
Click to turn off the surface.

Doors, Windows, and SmartParts Unit 2: windows 101
14 Do not change the other settings on the Elements tab.

1 02 Exercise 6: modeling window SmartParts Allplan 2022
15 To model the right casement, click in the right part of the window
in the preview.
Select Casement and define the following settings:
• Casement area:
Opening type: Turn
Stop: Left
Widths and Depth: 5 cm
Rabbet ledge: Select Outside and enter 5 cm for the width
and 2.5 cm for the depth.
• Fittings area:
Hinge side: Window handle
Frame side: (without) turn handles off.
• Rabbet area:
Select the Secondary mullion on the left check box.
• 3D representation area:
Define how the frame looks in 3D. Select color number 22.
Click to turn off the surface.

Doors, Windows, and SmartParts Unit 2: windows 103
16 Do not change the other settings on the Elements tab.

1 04 Exercise 6: modeling window SmartParts Allplan 2022
17 The next step is to create the interior window sill and the exterior
window sill. To do this, open the Window sill tab in the palette.
18 Select the Create window sill option for both the Outside and the
Inside.
19 Define the following settings for the exterior window sill:
• Height 1: 0.01
Height 2: 0.02
Splay: 0.03
Offset: 0
Projection: 0.03
Overlap length: 0
Offset to the left / right: 0
• Outside 3D representation
Color: 22
Surface: alu.surf
Enter the values in meters.
20 Enter the following values for the interior window sill:
• Height 1: 0
Height 2: 0.03
Splay: 0
Offset: 0
Projection: 0.03
Overlap length: 0.03
Offset to the left / right: 0
• Inside 3D representation
Color: 22
Surface: off
21 Click Close at the bottom of the palette, thus saving your entries.


## Sayfa 111

Doors, Windows, and SmartParts Unit 2: windows 105
22 Select ESC to finish modeling the SmartPart.

1 06 Exercise 6: modeling window SmartParts Allplan 2022
Saving the window SmartPart to the library
You can add the window SmartPart to the library folder you created
for this project.
To save the window SmartPart in the library
1 Open the Library palette by clicking its tab.
2 Open the Project folder and then the Doors, Windows, and
SmartParts folder.
3 To create a new folder, click New group at the bottom of the
Library palette.
4 Enter Windows for the name of the new folder.
5 Click the new Windows folder to open it.
6 Go to the bottom of the Library palette. Point to Insert
element and click Insert SmartPart.
7 Select SmartPart you want to save
Click the window SmartPart.

Doors, Windows, and SmartParts Unit 2: windows 107
8 Enter Double casement + window sills for the name of the
SmartPart. Then click OK to confirm.

1 08 Exercise 6: modeling window SmartParts Allplan 2022
Saving the window SmartPart as a favorite file
The next step is to save the window SmartPart you just modeled as
a favorite in your project.
To save the window SmartPart as a favorite file
1 Double-click the SmartPart.
2 Click Save as a favorite at the bottom of the palette.

Doors, Windows, and SmartParts Unit 2: windows 109
3 Check the open folder. You will save the SmartPart to the
Favorites - project folder. Enter Double casement + window
sills for the name of the SmartPart and click Save.

1 10 Exercise 6: modeling window SmartParts Allplan 2022
Inserting the window SmartPart into more openings
Use the favorite file to insert the window SmartPart into more
window openings.
To insert the window SmartPart into more window
openings
 The reference scale is 1:50.
 Drawing file 33 Floor plan with doors and window openings is
current. All the other drawing files are closed.
 2+1 Animation Window is selected.
1 Zoom in on the right exterior wall in all three viewports.
2 Click Window SmartPart.
The Elements tab of the window SmartPart opens.
3 Click Load favorite at the bottom of the palette.
4 Allplan opens the Open favorite file dialog box and the Favorites
- project folder. Select the Double casement + window sills.smv
file and click Open.
The window SmartPart is attached to the crosshairs. You can see
the tabs with the properties of the SmartPart in the palette.
5 Place the SmartPart in the middle window opening in the exterior
wall on the right side. Make sure the arrow indicating the outside
of the SmartPart points toward the outside of the building.
6 Select ESC to finish placing the SmartPart.
7 A copy of the SmartPart is attached to the crosshairs. Insert it
into the lower-right window opening in the exterior wall on the
right side.
8 Insert the next copy of the SmartPart into the lower-right
window opening in the horizontal wall at the bottom.

Doors, Windows, and SmartParts Unit 2: windows 111
9 Select ESC twice to finish placing SmartParts.

1 12 Exercise 6: modeling window SmartParts Allplan 2022
SmartPart for French window
You will model a double-casement window SmartPart for the French
windows and save it to the library. You will then insert this SmartPart
into several openings.
To model a SmartPart for a French window
 The reference scale is 1:50.
 Drawing file 33 Floor plan with doors and window openings is
current. All the other drawing files are closed.
 2+1 Animation Window is selected.
1 Zoom in on the upper-left corner of the building in all three
viewports.
2 Click Window SmartPart (Architecture role - Elements task
- Opening Elements task area).
3 Select Window in the list box at the top of the palette.
You can see the Elements tab of the window SmartPart. The
preview displays the frame, which serves as the basis for
modeling the window SmartPart.
4 Start modeling the window SmartPart by clicking inside the
window opening, thus placing the SmartPart.

Doors, Windows, and SmartParts Unit 2: windows 113
5 Make sure the arrow points toward the outside of the building.

1 14 Exercise 6: modeling window SmartParts Allplan 2022
6 Define the dimensions of the frame in the palette.
Make the following settings:
• Frame area:
Shape: Block frame
Width left / right: 7 cm
Angle left / right: 90°
Width top: 7 cm
Width bottom: 17 cm (including the 15-cm floor structure)
Depth: 7 cm
• 3D representation area:
Define how the frame looks in 3D. Select color number 20.
Click to turn off the surface.
7 The window gets two casements of different width. Click in the
middle of the window in the preview.
8 Select Vertically split and define the following settings:
• Subdivision area: Select the Fixed width on the right
type. To define the width on the right, enter 0.745 m.
9 To model the right casement, click in the right part of the window
in the preview.
10 Select Casement and define the following settings:
• Casement area:
Opening type: Tilt and turn
Stop: Left
Widths and Depth: 5 cm
• Fittings area:
Hinge side: Window handle
Frame side: (without) turn handles off.
• 3D representation area:
Define how the frame looks in 3D. Select color number 22.
Click to turn off the surface.
11 Do not change the other settings on the Elements tab.


## Sayfa 121

Doors, Windows, and SmartParts Unit 2: windows 115
12 To model the left casement, click in the left part of the window in
the preview.
Select Casement and define the following settings:
• Casement area:
Opening type: Turn
Stop: right
Widths and Depth: 5 cm
Rabbet ledge: Select Outside and enter 5 cm for the width
and 2.5 cm for the depth.
• Fittings area:
Hinge side: Window handle
Frame side: (without) turn handles off.
• Rabbet area:
Select the Secondary mullion on the right check box.
• 3D representation area:
Define how the frame looks in 3D. Select color number 22.
Click to turn off the surface.
13 Do not change the other settings on the Elements tab.

1 16 Exercise 6: modeling window SmartParts Allplan 2022
14 Click Close to finish modeling the SmartPart.
15 Select ESC to close the tool.

Doors, Windows, and SmartParts Unit 2: windows 117
To save the SmartPart to the library
1 Open the Library palette by clicking its tab.
2 Open the following folders one after the other: Project - Doors,
Windows, and SmartParts - Windows.
3 Go to the bottom of the Library palette. Point to Insert
element and click Insert SmartPart.
4 Select SmartPart you want to save
Click the new SmartPart.
5 Enter Double casement, French window for the name of the
SmartPart and click OK to confirm.
You will insert the new SmartPart into three more openings.
To insert the new window SmartPart into the French
windows
1 Use the right mouse button to double-click the window
SmartPart you just created.
A copy of the SmartPart is attached to the crosshairs.
2 Place the SmartPart in the second opening for the French window
in the study, in the window opening in the adjoining bedroom, and
in the middle window opening in the living-cum-dining room.

1 18 Exercise 6: modeling window SmartParts Allplan 2022
Pay attention to the opening directions.

Doors, Windows, and SmartParts Unit 2: windows 119
Exercise 7: modifying window openings
In this section, you modify will the window openings you created in
exercise 6.
Tools: Objective:
Relative to upper plane
Relative to lower plane
Direct object
modification
Window SmartPart -
Window sill
Apply Archit.
Component Properties
Flip Smart Opening
Symbol
Here, too, you can use a predefined drawing file as the basis for your
work. Open drawing file 34 Floor plan with doors and windows.

1 20 Exercise 7: modifying window openings Allplan 2022
Sill height and opening width
You will modify the sill height and opening width of the right window
opening in the horizontal wall at the bottom.
To modify the sill height of a window opening
 The scale is 1:50.
 2+1 Animation Window is selected ( Window drop-down
list on the Quick Access Toolbar).
1 Make drawing file 34 Floor plan with doors and windows
current. Close all the other drawing files.
2 Use to zoom in on the lower-right corner of the building in all
three viewports so that you get a close-up view of the lower-
right window in the horizontal wall. This is the window you want
to modify.
3 Point into the window opening you want to modify. Check the
ToolTips displaying information on the element: As soon as you
can read Window opening, double-click the window opening.
Make sure you click the window opening.
Allplan opens the Window dialog box, where you can modify the
settings.
4 Click the Height... button.
Do not change the settings in the Top level area: Relative to
upper plane = -0.30
In the Bottom level area, change the offset for Relative to
lower plane to 1.35 m.
Click OK to close the Height dialog box.
As you can see, the height of sill (Parameters area) has changed
to 1.35 m.
5 Click OK to confirm the dialog box.
Allplan updates the window. The window SmartPart has adapted
automatically.

Doors, Windows, and SmartParts Unit 2: windows 121
To modify the opening width of the same window opening, you will
use the options of direct object modification.
To modify the opening width of a window opening
1 Point into the window opening you just modified. Check the
ToolTips displaying information on the element: As soon as you
can read Window opening, click the window opening.
You can see the controls for direct object modification: handles,
toggles and boxes.
Note: You can see the handles only if the Display handles option
is selected ( Options - Desktop environment - Direct object
modification page - Handles area).
2 The toggles indicate the direction in which the change applies.
In this example, you want to widen the window to the left.
Switch the toggle to left .
3 The boxes show the width of the selected element (window) and
the distance between the selected element and the next opening.
Enter the new width of the window in the box of the selected
element (window): 1.76.
->
4 Select ENTER to confirm.
5 Select ESC to close direct object modification.

1 22 Exercise 7: modifying window openings Allplan 2022
Modifying a window SmartPart
You placed a double-casement window SmartPart in the middle
window in the exterior wall on the right side. In this exercise, you will
turn this SmartPart into a single-casement window SmartPart. In
addition, you will change the depth of the interior window sill so that
the window sill covers the adjacent plumbing wall in its entirety. You
will also adjust the surface of the interior window sill to the surface of
the adjacent walls.
To modify a window SmartPart
 The scale is 1:50.
 2+1 Animation Window is selected ( Window drop-down
list on the Quick Access Toolbar).
 Drawing file 34 Floor plan with doors and windows is current. All
the other drawing files are closed.
1 Use to zoom in on the middle window in the right exterior wall
in all three viewports.
2 Point into the window opening you want to modify. Check the
ToolTips displaying information on the element: As soon as you
can read Window SmartPart, double-click the window opening.
The Properties palette of the SmartPart opens.
3 Open the Elements tab and select the vertical division by clicking
it in the preview or selecting it in the element list. Click Delete
current element to delete the vertical division.

Doors, Windows, and SmartParts Unit 2: windows 123
4 Model a new casement.
Select casement and define the following settings:
• Casement area:
Opening type: tilt and turn
Stop: left
Widths and depth: 5 cm
• Fittings area:
Hinge side: Window handle
Frame side: (without) turn handles off.
• 3D representation area:
Define how the frame looks in 3D. Select color number 22.
Click to turn off the surface.
5 The next step is to modify the window sill. To do this, open the
Window sill tab.

1 24 Exercise 7: modifying window openings Allplan 2022
6 In the Inside area, change the projection to 0.15 m.
The interior window sill now covers the adjacent plumbing wall in
its entirety.
7 In the Inside 3D representation area, select the
Glass_Mosaic_05.surf file for the surface.
8 To finish, Close the Properties palette of the SmartPart.
9 Save the SmartPart to the library. Follow the steps described in
"Saving the window SmartPart to the library (on page 106)".
Enter Single casement + window sills for the name of the new
SmartPart (the name can be up to 32 characters long).


## Sayfa 131

Doors, Windows, and SmartParts Unit 2: windows 125
Separate window sill SmartParts
All the window SmartParts you have placed so far have integrated
window sills, which means that Allplan treats the window and its
window sills as a single object. This affects analyses in reports. You
can analyze SmartParts with integrated window sills in reports for
windows, such as . If you want to analyze window
windows.rdlc
sills separately ( ), you must create them as
window sills.rdlc
separate window sill SmartParts.
In the following exercise, you will start by deleting the window sills
from a window SmartPart in the floor plan.
Then, you will model two separate window sills, that is to say, one for
the outside and another one for the inside. Finally, will insert the
window sills into the window opening and save them to the library.
To modify the SmartPart
 The scale is 1:50.
 2+1 Animation Window is selected.
 Drawing file 34 Floor plan with doors and windows is current. All
the other drawing files are closed.
1 Zoom in on the lower-right corner of the building in all three
viewports.
2 Go to the viewport showing the building in plan. Double-click the
window SmartPart in the window opening at the bottom of the
vertical wall.
The Properties palette of the SmartPart opens.
3 Open the Window sill tab and clear the Create window sill check
boxes for both the outside and the inside.
As you can see, Allplan deletes the window sills immediately.
4 Select ESC to finish.

1 26 Exercise 7: modifying window openings Allplan 2022
To model a separate window sill SmartPart and save it
to the library
 2+1 Animation Window is still selected. You can see a close-
up view of the lower-right corner of the building with the two
windows.
1 Click Window SmartPart (Architecture role - Elements task
- Opening Elements task area).
You can use this tool to model SmartParts for windows and
window sills.
2 Select Window sill in the list box at the top of the palette.
The Elements tab of the window sill SmartPart opens.
3 Model the exterior window sill.
In the Settings area, select the outside type.
4 Define the following parameters in the Dimensions area:
Type: Profiled
Frame depth (depth of window frame): 0.07
Height 1: 0.01
Height 2: 0.02
Splay: 0.03
Projection: 0.03
5 Switch to the 3D representation tab.
6 Select color number 22 and the alu.surf file for the surface.
All parameters match the settings of the exterior window sills
you have already created for the other windows.

Doors, Windows, and SmartParts Unit 2: windows 127
7 Insert the window sill into the window opening. The arrow
indicates the outside of the SmartPart.
8 Select ESC twice to finish modeling.
9 You can now save the window sill SmartPart to the library. Open
the folder of the Doors, Windows, and SmartParts project,
create a new folder (for example, Window sills) and save the new
SmartPart (for example, Exterior window sill) to this new folder.
10 Repeat these steps to create a separate window sill for the inside:
Click Window SmartPart again.
Window sill is still selected in the list box at the top of the
palette.
11 Model the interior window sill.
In the Settings area, select the inside type.
12 Define the following parameters in the Dimensions area:
Type: Inclined
Frame depth (depth of window frame): 0.07
Height 1: 0
Height 2: 0.02
Projection: 0
13 Switch to the 3D representation tab.
14 Select color number 26 and turn off the surface.

1 28 Exercise 7: modifying window openings Allplan 2022
15 Insert the window sill into the window opening.
16 You can also save this SmartPart to the library. Select the
Window sills folder and enter Interior window sill for the name of
the SmartPart.

Doors, Windows, and SmartParts Unit 2: windows 129
Applying architectural component properties
The other window in the horizontal wall also requires a separate
window sill. Of course, you can modify this window by repeating the
steps described.
However, Allplan provides another tool that is very useful for
matching several parameters - such as the opening width, sill height,
or color - from an existing window. In this example, you transfer the
parameters of the window opening you just modified to the window
opening in the horizontal wall by using the Apply Archit. Component
Properties tool.
This tool transfers properties of architectural components to other
components of the same type. You can also use this tool to modify
element-specific properties of architectural elements (analogous to
creation method).
To apply architectural component properties
1 Select the Apply Archit. Component Properties tool
(Architecture or Engineering role - Elements task -
Components task area).
2 Click the window opening you just modified.
Allplan opens the Window dialog box, displaying the parameters
of the window clicked.
The Library element 1 to n area contains three SmartParts.
Library element 1 is the window SmartPart; library element 2 is
the exterior window sill SmartPart; library element 3 is the
interior window sill SmartPart.
3 As you do not want to change the parameters, click OK to close
the Window dialog box.
4 Click the window opening in the horizontal wall at the bottom.
The window opening appears in the selection color.
5 Click Apply on the Apply Archit. Component Properties context
toolbar or right-click.
Allplan updates the window, displaying the three SmartParts.
6 To correctly position the casements, open the shortcut menu of
the window SmartPart and click Flip Smart Opening Symbol.

1 30 Exercise 7: modifying window openings Allplan 2022
7 Place new reference point for smart symbol
Click in the lower-right corner of the window opening.
8 Right-click to confirm the position of the casements.
9 Select ESC to close the tool.
Compare the result with the illustration at the beginning of
exercise 7.

Doors, Windows, and SmartParts Unit 2: windows 131
Exercise 8: dimensioning openings
You will dimension all the door openings and window openings you
created in the previous exercises.
Tools: Objective:
Dimension
Walls
Dimension
Line
Sill
Height
Drawing file 35 Floor plan complete provides you with everything
you need to dimension the floor plan.

1 32 Exercise 8: dimensioning openings Allplan 2022
Dimensioning exterior doors and windows
You can use the Dimension Walls tool to automatically create
dimension strings for one or more walls. It is possible to create
several dimension lines in a single step. The dimension lines are
associative.
You can modify dimension lines created in this manner by using the
Add Dimension Line Point and Del Dimension Line Point tools
(Label - Dimension task area). When updating the dimension lines
automatically, the program keeps any "manual" changes you make
by using these tools.
Note: The associativity will be lost if the walls are in different drawing
files.
The most important parameters are the unit, position of dimension
text, dimension text height, and dimension text width.
To dimension the exterior walls including all openings
 The scale is 1:50.
 2+1 Animation Window is selected ( Window drop-down
list on the Quick Access Toolbar).
1 Make drawing file 35 Floor plan, complete current. Close all the
other drawing files.
2 Select the Dimension Walls tool (Architecture or Engineering
role - Elements task - Components task area).
3 Change the reference scale to 1:100 (status bar).
4 Open the Window drop-down list on the Quick Access Toolbar
and click 1 Viewport.

Doors, Windows, and SmartParts Unit 2: windows 133
5 Click Properties and enter the following parameters:

1 34 Exercise 8: dimensioning openings Allplan 2022
6 In the Dimension Line dialog box, open the Dimension Block tab.
In the Default combinations area, click the Def... button to the
right of Working drawing.
Tip: Click the Help button Do not change the combination of dimension strings predefined
(Dimension Line dialog box for working drawings. Click OK to confirm. Then select Working
- Dimension Block tab) to drawing by clicking this button.
see examples and
explanations of the
dimension line types for wall
dimensioning.


## Sayfa 141

Doors, Windows, and SmartParts Unit 2: windows 135
7 Change the layers for the three dimension strings. To do this, click
the button and select the DL_GEN layer for each dimension
string.
8 Click OK to close the Dimension Line dialog box.

1 36 Exercise 8: dimensioning openings Allplan 2022
9 Select walls to dimension, set properties, right-click to confirm
To dimension the openings in the horizontal wall at the bottom,
click the necessary walls one after the other as shown in the
illustration.
10 Right-click to confirm the selection.
11 Use active wall line as direction element, set properties
Click a line of the horizontal wall at the bottom. This line serves as
the reference element for the dimension lines. Allplan will
dimension the floor plan along this direction element.
12 Specify drop-in point, set properties
A preview of the dimension line block is attached to the
crosshairs. You can change the parameters of the dimension line
block by clicking Properties again and redefining the
parameters.

Doors, Windows, and SmartParts Unit 2: windows 137
13 You can also change the following settings for the dimension line
block:
• Click in the Input Options to flip over the dimension
lines attached to the crosshairs.
• Click in the Input Options to enter a distance between the
dimension line block and the crosshairs. This distance matches
the spacing between the dimension lines in the block. So, you
can join different dimension line blocks “seamlessly”.
14 To position the dimension line block, click below the floor plan.

1 38 Exercise 8: dimensioning openings Allplan 2022
15 Repeat these steps to dimension the other walls and openings.

Doors, Windows, and SmartParts Unit 2: windows 139
Dimensioning openings of interior doors
You will use the Dimension Line tool to dimension the openings of
the interior doors. Here, too, you will create associative dimension
lines.
To dimension the openings of the interior doors
 The scale is 1:100.
 1 Viewport is selected ( Window drop-down list on the
Quick Access Toolbar).
 Drawing file 35 Floor plan, complete is current. All the other
drawing files are closed.
1 Select the Dimension Line tool in the Quick Access task area.
Tip: You can also use to 2 Select the Associative option on the Dimension Line context
match the parameters from toolbar.
a wall dimension line.

1 40 Exercise 8: dimensioning openings Allplan 2022
3 Click Properties and enter the following parameters:
Make sure you select the DL_GEN layer.
4 Click Vertical on the context toolbar.
Define the position of the dimension line. Click a point through
which the dimension line is to pass.
For example, start with the interior door at the top.

Doors, Windows, and SmartParts Unit 2: windows 141
5 Click the first point you want to dimension.
6 Click the second point you want to dimension as shown in the
illustration.
7 You want to include the height of the door in the dimension line.
To do this, select the check box to the right of Component height
on the Dimension Line context toolbar. As you selected
associative dimensioning (see step 2), Allplan retrieves the
component height from the model and transfers it to the
Dimension Line context toolbar.
Note: The component height retrieved depends on a setting in
the Options - Dimension line - Associativity.
If a room adjoins the door opening that you want to dimension
and the Consider floor surfaces of rooms when calculating the
sill height option is selected, Allplan considers the height of the
floor surface when calculating the sill height or opening height.
This option is not selected in this example.

1 42 Exercise 8: dimensioning openings Allplan 2022
Tip: The Dimension Line 8 Click the third point you want to dimension.
context toolbar provides
the following options for
changing the next section of
the dimension line:
- You can change the
global parameters of
the dimension line at any
time.
To do this, you
can find various
options on the 9 Click the fourth and last point you want to dimension.
context toolbar.
- You can change
the arrowhead
for the next point
to be dimensioned.
- You can switch
between Horizontal and
Vertical
- You can dimension
the height of an opening
This completes the first dimension line. Select ESC.
or component or enter
additional text. 10 The Dimension Line tool is still open. Dimension the other
interior doors. Before you start, check the settings on the
- You can use
Dimension Line context toolbar, making sure you have selected
Undo last entry to
the appropriate tool for creating a Horizontal or Vertical
undo the last
dimension line.
point you clicked.
11 Select ESC twice to close the Dimension Line tool.

Doors, Windows, and SmartParts Unit 2: windows 143
Your floor plan should now look like this:

1 44 Exercise 8: dimensioning openings Allplan 2022
Calculating sill heights
Dimensions of a floor plan would not be complete without sill heights.
To calculate sill heights
 The scale is 1:100.
 1 Viewport is selected ( Window drop-down list on the
Quick Access Toolbar).
 Drawing file 35 Floor plan, complete is current. All the other
drawing files are closed.
1 Open the shortcut menu of a window opening and select the
Sill Height tool.
2 Click Toggle to change the text parameters.
3 Click to place the sill height.
You can find a number of useful tools in the input options. For
example, you can choose to place the sill height horizontally or
vertically.
4 Label all window openings with the respective sill heights.
Compare the result with the illustration at the beginning of
exercise 8.


## Sayfa 151

Doors, Windows, and SmartParts Unit 2: windows 145
Exercise 9: creating a corner window with
SmartParts
You will replace the left window in the horizontal wall at the bottom
with a corner window. This will also change the dimension lines.
Tools: Objective:
Delete
Corner window
Objects palette -
Sort by layer
Window
SmartPart
Insert element
(Library palette)
Insert
SmartPart
(Library palette)
You have not created all dimension lines or worked through all
exercises? No problem! You can use drawing file 36 Floor plan with
dimensions as the basis for the corner window. Continue to work
with this drawing file.

1 46 Exercise 9: creating a corner window with SmartParts Allplan 2022
Creating the opening for the corner window
You will create a corner window at the lower-left corner of the
building.
To create an opening for a corner window
 The scale is 1:100; 1 Viewport is open.
1 Make drawing file 36 Floor plan with dimensions current. Close
all the other drawing files.
2 Zoom in on the lower-left corner of the building.
3 Select the Delete tool (Edit task area).
4 Enclose the window in a selection rectangle.
5 Release the left mouse button.

Doors, Windows, and SmartParts Unit 2: windows 147
The window has been deleted. But that's not all. The dimension
line no longer includes the dimensions of the window. As you can
see, the dimension line is associative, which means that it has
been updated automatically.
6 Select the Corner Window tool (Architecture or Engineering
role - Elements task - Components task area).
7 Corner (exterior side of wall)
Click the outside corner of the wall into which you want to insert a
corner window.
8 End point of first opening
Click the horizontal wall roughly where the first window is to end.
Allplan automatically displays the distance between the point you
clicked and the wall corner.
9 New reference point or enter width of 1st opening
Enter the width of the first window in the dialog line: 2.26. Select
ENTER to confirm this value.

1 48 Exercise 9: creating a corner window with SmartParts Allplan 2022
10 As you will insert a SmartPart into the corner window later, click
Properties to open the Corner Window dialog box. Switch
to the Reveal tab and enter the outer reveal and inner reveal.
For the window depth, enter the frame depth (00.7 m, for
example).
11 Switch to the Opening tab and click Height....
Enter the following values:
12 Click OK to close the Height dialog box.
13 Check that the Library element 1 to n area is empty. If it isn't,
click .

Doors, Windows, and SmartParts Unit 2: windows 149
14 Click OK to close the Corner Window dialog box.
15 Set properties, specify end point of 2nd opening
As you do not want to change the parameters of the opening, you
can enter the width of the second opening immediately.
Click the vertical wall roughly where the second window is to end.
Allplan automatically displays the distance between the point you
clicked and the wall corner.
16 New reference point or enter width of 2nd opening
Enter the width of the second window in the dialog line: 3.5. Select
ENTER to confirm this value.
Allplan inserts the corner window into the opening.
17 Select ESC to close the Corner Window tool.
As you can see, Allplan has automatically updated the dimension
string. It now includes the dimensions of the corner window.
SmartParts for the corner window
The corner window consists of two SmartParts: one for the
horizontal window and another one for the vertical window. These
two SmartParts meet in the corner. Each SmartPart consists of two
parts with fixed glazing.
To model SmartParts for the corner window - part 1
 The scale is 1:100.
 1 Viewport is open.
 Drawing file 36 Floor plan with dimensions is current. All the
other drawing files are closed.
1 Open the Window drop-down list on the Quick Access Toolbar
and click 2+1 Animation Window.
2 Zoom in on the opening of the corner window in all three
viewports.
3 Change the reference scale to 1:50.

1 50 Exercise 9: creating a corner window with SmartParts Allplan 2022
4 To avoid confusion, hide the layers of the dimension lines and sill
heights.
To do this, open the Objects palette.
The Objects palette combines all elements and objects in open
drawing files into groups, listing the groups alphabetically. You
can find the objects and elements at the lowest level in each
group.
5 Go to the top part of the Objects palette and click Sort by
layer.
Consequently, the top sort criterion is the layers assigned to the
objects and elements.
6 To hide the AR_SILLE and DL_GEN layers, click the respective
icons to the right of the two layers. Once a layer is hidden, its
icon changes to .

Doors, Windows, and SmartParts Unit 2: windows 151
Note: For example, if you want to check which objects or
elements are on the AR_SILLE layer, select this layer by clicking it
and then click .
You can now show and hide the elements on this layer.
7 Make sure the AR_SILLE and DL_GEN layers are invisible.
8 Click Window SmartPart (Architecture role - Elements task
- Opening Elements task area).
9 Select Window in the list box at the top of the palette.

1 52 Exercise 9: creating a corner window with SmartParts Allplan 2022
10 Start modeling the corner window SmartPart by clicking in the
horizontal part of the corner window opening.
This places the SmartPart, which means that it assumes the size
of the horizontal window opening. The preview in the palette also
adapts to the new size.

Doors, Windows, and SmartParts Unit 2: windows 153
11 Click the Frame element in the Properties palette.
Enter the following parameters:
• Frame area:
Shape: Block frame
Width - left / right / top: 7 cm
Angle left: 135°
Angle right: 90°
Width bottom: 22 cm (= 15-cm floor covering + 7-cm frame)
Depth: 7 cm
• 3D representation area:
Color: 20
Surface: off
12 Click in the middle of the window in the preview. Divide this area
into two parts. Both parts get fixed glazing.

1 54 Exercise 9: creating a corner window with SmartParts Allplan 2022
13 Select Mullion and define the following parameters:
• Mullion area:
Type: Fixed width on the right
Right: 0.745
Width / Depth: 7 cm
• 3D representation area:
Color: 20
Surface: off


## Sayfa 161

Doors, Windows, and SmartParts Unit 2: windows 155
14 The next step is to add glass panes to both window parts.
Click in the right part of the window in the preview and select
Glass.
15 Enter the following parameters:
• Glass area:
Depth: 2 cm
• 3D representation area:
Color: 3
Surface: glass.surf

1 56 Exercise 9: creating a corner window with SmartParts Allplan 2022
16 Click in the left part of the window in the preview. Here, too, insert
a glass pane with the same parameters.
You have defined the first SmartPart for the corner window.
17 To finish modeling, click Close and then select ESC.
18 Save the SmartPart to the Library. To do this, open the following
folders one after the other: Project - Doors, Windows, and
SmartParts - Windows. Enter Corner window 01 for the name
of the new SmartPart.
To model SmartParts for the corner window - part 2
 2+1 Animation Window is selected.
 You can see a close-up view of the corner window opening in all
three viewports.
 The reference scale is 1:50.
1 Select the Window SmartPart tool.
2 Check that Window is selected in the list box at the top of the
palette.

Doors, Windows, and SmartParts Unit 2: windows 157
3 Place the SmartPart by clicking in the vertical part of the corner
window opening.
4 You can see the Frame in the preview. Enter the following
parameters:
• Frame area:
Shape: Block frame
Width - left / right / top: 7 cm
Angle left: 90°
Angle right: 45°
Width bottom: 22 cm (= 15-cm floor covering + 7-cm frame)
Depth: 7 cm

1 58 Exercise 9: creating a corner window with SmartParts Allplan 2022
• 3D representation area:
Color: 20
Surface: off
5 The second SmartPart looks like the first one.
Click in the middle of the window in the preview. Divide this area
into two parts.
Here, too, both parts get fixed glazing.

Doors, Windows, and SmartParts Unit 2: windows 159
6 Select Mullion and define the following parameters:
• Mullion area:
Type: 1:n
Left / right: 1 / 2
Width / Depth: 7 cm
• 3D representation area:
Color: 20
Surface: off
7 The next step is to add glass panes to both window parts.
Click in the right part of the window in the preview and select
Glass.
8 Enter the following parameters:
• Glass area:
Depth: 2 cm
• 3D representation area:
Color: 3
Surface: glass.surf
9 Click in the left part of the window in the preview. Here, too, insert
a glass pane with the same parameters.
10 To finish modeling, click Close and then select ESC.

1 60 Exercise 9: creating a corner window with SmartParts Allplan 2022
11 Save the SmartPart to the Library. Open the following folders
one after the other: SmartParts - Project - Doors, Windows,
and SmartParts - Windows. Enter Corner window 02 for the
name of the SmartPart.
Open the Objects palette and make the DL_GEN and AR_SILLE
layers visible again. In addition, switch the reference scale to 1:100
and place sill heights for the corner window. Now your floor plan
should look like the illustration at the beginning of exercise 9.

Doors, Windows, and SmartParts Unit 2: windows 161
Exercise 10: creating shading SmartParts
You have finished creating the doors and windows and inserting
SmartParts into these openings.
In the following exercise, you will complete the window openings by
adding shading elements. Here, too, you will use SmartParts.
You can create shading SmartParts in two different ways. The first
option is to use the Shading SmartPart tool. With this tool, you
can create SmartParts for four different shading elements: roller
shutters, sliding shutters, folding shutters, and blinds. All SmartParts
modeled with the Shading SmartPart tool can be analyzed in
Reports ( file).
roller shutters.rdlc
The second option is to integrate a shading element into a
Window SmartPart. On the Roller shutters tab, you can model
the shading element along with the Window SmartPart. This
shading element is an integral part of the Window SmartPart,
which means that Allplan no longer regards the two elements
(window + roller shutters) as individual elements. Rather, they merge
to form a single object. This affects analyses in reports. The
Reports tool analyzes Window SmartParts with integrated roller
shutters as a single entity. You cannot analyze integrated roller
shutters as separate elements.
If you want to do this, you must create them as separate SmartParts
for roller shutters by using the Shading SmartPart tool.
In this training project, you will try out different shading elements for
practice, although you would certainly not use them in this way in
real projects.

1 62 Exercise 10: creating shading SmartParts Allplan 2022
Tools: Objective:
Objects palette -
Sort by layer
Shading SmartPart
New group (Library
palette)
Insert element (Library
palette)
Insert SmartPart
(Library palette)
So that you can proceed quickly, drawing file 37 Floor plan with
corner window provides you with everything you need to create
shading SmartParts.

Doors, Windows, and SmartParts Unit 2: windows 163
Modeling a SmartPart for sliding shutters
First, you will use the Shading SmartPart tool to model sliding
shutters for the corner window.
To model a shading SmartPart and insert it into the
corner window
 2+1 Animation Window is selected.
 The reference scale is 1:50.
1 Make drawing file 37 Floor plan with corner window current.
Close all the other drawing files.
2 As you can see, the dimension lines and sill heights are visible
again. By using the Objects palette, you can hide layers only
temporarily. In other words, the layers are hidden until you switch
drawing files. As soon as you open a different drawing file, all the
layers you have hidden in the Objects palette are visible again.
As you no longer need the DL_GEN and AR_SILLE layers to edit
your project, open the Layers palette and switch these two
layers to hidden, frozen.

1 64 Exercise 10: creating shading SmartParts Allplan 2022
3 Zoom in on the opening of the corner window in all three
viewports.
4 Select the Shading SmartPart tool (Architecture role -
Elements task - Opening Elements task area).
5 Select Sliding shutters in the list box at the top of the palette.
The Elements tab of the SmartPart opens.
6 Place the sliding shutters in the horizontal part of the corner
window.


## Sayfa 171

Doors, Windows, and SmartParts Unit 2: windows 165
7 Enter the following in the Settings area of the palette:
• Total number: 3
• Number on the left: 0
Number on the right: 3
• Sequence: closing on the outside
• Type: slats variable
• Overlap / Offset to wall: 0.02
• Spacing: 0.01
• Opened by %: 0 %
8 Do not change the other values.
9 Check that cover is selected in the Profiled cover area and
create in the Rails area.

1 66 Exercise 10: creating shading SmartParts Allplan 2022

Doors, Windows, and SmartParts Unit 2: windows 167
10 Switch to the 3D representation tab.
11 In the Colors area, select color number 22 for the frame and the
rails and color number 27 for the panel.
12 In the Surfaces area, click to turn off all the surfaces.
13 Click Close to finish modeling the shading SmartPart.
A copy of the SmartPart you just modeled is attached to the
crosshairs.
14 Place it into the vertical opening of the corner window.
15 Select ESC twice to finish placing SmartParts.

1 68 Exercise 10: creating shading SmartParts Allplan 2022
Saving and inserting the shading SmartPart
The next step is to save the shading SmartPart to the library. Then,
you will insert it into the middle window in the horizontal wall at the
bottom.
To save and use the shading SmartPart
1 Open the Library palette and the Project - Doors, Windows and
SmartParts folders.
2 To create a new folder, click New group at the bottom of the
Library palette.
3 Type in Shading for the name of the new folder.
4 Open the new Shading folder.
5 Go to the bottom of the Library palette. Point to Insert
element and click Insert SmartPart.
6 Select SmartPart you want to save
Click the sliding shutters in the horizontal part of the corner
window.

Doors, Windows, and SmartParts Unit 2: windows 169
7 Enter Sliding shutters for the name of the SmartPart and click
OK to confirm.
8 To insert the sliding shutters into the next opening, you can
simply select the SmartPart in the library and place it again.
But there is another option you can use to place SmartParts in
openings.
In the viewport showing the building in plan, zoom in on the middle
window in the horizontal wall at the bottom.
9 Double-click the left mouse button within the window opening.
The Window dialog box opens.
10 As you can see, there is a SmartPart in the Library element 1 to n
area.

1 70 Exercise 10: creating shading SmartParts Allplan 2022
To assign another SmartPart to this window opening, change the
number from 1 to 2 and click .
11 The Library palette appears. Open the following folders one after
the other: Project - Doors, Windows and SmartParts - Shading.
Select the Sliding shutters SmartPart and click OK to confirm.
This adds the sliding shutters to the Library element 1 to n area,
which now contains two SmartParts.

Doors, Windows, and SmartParts Unit 2: windows 171
12 Click OK to confirm the Window dialog box.

1 72 Exercise 10: creating shading SmartParts Allplan 2022
Modeling and using a SmartPart for roller shutters
By means of the Shading SmartPart tool, you can also create
SmartParts for roller shutters.
To model a SmartPart for roller shutters
 Drawing file 37 Floor plan with corner window is current; all the
other drawing files are closed.
 2+1 Animation Window is selected.
 The reference scale is 1:50.
1 Zoom in on the lower-right corner of the building in all three
viewports.
2 Select the Shading SmartPart tool.
3 Select Roller shutters in the list box at the top of the palette.
The Elements tab of the SmartPart opens.

Doors, Windows, and SmartParts Unit 2: windows 173
4 Place the roller shutters in the horizontal window opening.
5 Enter the following in the palette:
• Settings area
Window depth: 0.07
• Box area
Cross-section: rectangle
6 Do not change the other values.
7 Switch to the 3D representation tab.

1 74 Exercise 10: creating shading SmartParts Allplan 2022
8 In the Colors area, select color number 22 for the box and color
number 27 for the slats and rails.
9 In the Surfaces area, turn off all the surfaces.
10 Click Close to finish modeling the shading SmartPart.
A copy of the SmartPart you just modeled is attached to the
crosshairs.
Place copies of this SmartPart in all window openings in the right
exterior wall.
If you want, you can save the SmartPart for roller shutters to the
Library. Select the Shading folder.
Integrated roller shutters
The next step is to create roller shutters for the three French
windows in the study and the bedroom.
In this exercise, you will learn how to use the second option for
modeling roller shutters as SmartParts. In other words, you integrate
the roller shutters into the window SmartPart, thus creating a single
object. This affects not only layers but also analyses in reports.
The layer of the window SmartPart is also the layer of the roller
shutters.
The reports analyze window SmartParts with integrated roller
shutters as a single entity. You cannot analyze integrated roller
shutters as separate elements.


## Sayfa 181

Doors, Windows, and SmartParts Unit 2: windows 175
To add roller shutters to the window SmartPart
 Drawing file 37 Floor plan with corner window is current; all the
other drawing files are closed.
 2+1 Animation Window is selected.
 The reference scale is 1:50.
1 Zoom in on the upper-left corner of the building in all three
viewports.
2 Double-click the window SmartPart in the vertical wall on the left
side.
The palette with the properties of the SmartPart opens.
3 Open the Roller shutters tab in the palette.
4 Click the Front mounted fitting type. Open the roller
shutters by 100%.
5 Define the following settings in the Box area:
• Height: 15 cm
• Cross-section: rectangular
• Color: 22
• Surface: off
6 In the Slats, Rails area, change the color to 27 and turn off the
surface.

1 76 Exercise 10: creating shading SmartParts Allplan 2022
7 Do not change the other settings.
8 Click Close to finish.

Doors, Windows, and SmartParts Unit 2: windows 177
9 The current drawing file contains two more copies of the
SmartPart you just changed. They are in the horizontal wall at the
top. Allplan displays these copies in the selection color and asks
whether you want to update them too.
You have the following options:
• Click show identical ones to get a close-up view of all
SmartParts that are identical.
• Click yes to apply the changes to all copies.
• Click no to leave the copies as they are, thus creating a variant
of the SmartPart.
10 As you want to adjust all SmartParts, click yes.

1 78 Exercise 10: creating shading SmartParts Allplan 2022
11 Check the building in animation or in an elevation view: You can
see that the roller shutter box covers a part of the window.
You can correct this by increasing the width of the upper part of
the window frame.
Double-click the window SmartPart you just modified.
12 Open the Elements tab in the palette.
13 Click the frame in the preview. In the Frame area, change the
width at the top to 15 cm.
14 Close the palette. Here, too, Allplan asks whether you want to
adjust the two other SmartParts. Click yes.

Doors, Windows, and SmartParts Unit 2: windows 179
Result after 10 exercises
After you have completed exercise 10, your floor plan should look like
the following illustration (scale 1:50). Drawing file 38 Floor plan with
shading contains everything you have done so far.
As you can see, the floor plan of the building is now complete. You
have created the doors and windows and placed SmartParts and
shading elements.

1 80 A note on openings in multilayer walls Allplan 2022
A note on openings in multilayer walls
Before you move on to the next exercise, this section gives you
some practical tips on creating openings in multilayer walls.
To insert window and door openings into multilayer walls, proceed as
you would with single-leaf walls. In the Properties dialog box,
however, you must switch to the Reveal tab. Here – depending on
the number of construction layers defined (at least two layers) – you
can choose from different types and enter values for the offset.
To make things easier to understand, we would like to briefly
describe the steps required to create a window opening in a single-
leaf wall and in a double-leaf wall. In this guide, you have entered
openings in single-leaf walls multiple times. The following section
repeats the most important steps so that you can compare the
procedure with that for multilayer walls.
Creating a window opening in a single-leaf wall
The following steps will sound familiar to you. You have come across
these steps a number of times in the exercises you have done so far.
To create a window opening in a single-leaf wall
1 Select the Window tool.
2 Define the anchor point for the window opening.
3 Click the wall.
4 Specify the reference point for the opening.

Doors, Windows, and SmartParts Unit 2: windows 181
5 Click Properties on the Window Context toolbar.
6 Define parameters on the Opening tab.

1 82 A note on openings in multilayer walls Allplan 2022
7 To create a reveal element, open the Reveal tab and check that
the Create reveal element option is selected.

Doors, Windows, and SmartParts Unit 2: windows 183
8 Enter values for the Window depth, Outer reveal or Inner reveal.
A Wall line clicked = exterior side of opening
1 Wall thickness
2 Opening width
3 Outer reveal depth
4 Inner reveal depth
5 Depth of opening element (for example, window or door)
The Outer reveal, Inner reveal and Window depth parameters
define the exact position of the actual opening element (e.g.
smart opening symbol or SmartPart).
The sum of outer reveal and inner reveal is the wall thickness.
The window depth defines the depth of the opening element,
which represents the position of the actual opening. The inner
reveal includes the value of the window depth.
When you use smart opening symbols, the depth of the smart
symbol should be the same as the depth of the opening element.
9 Close the Window dialog box.
10 Define the offset to the end point of the opening.

1 84 A note on openings in multilayer walls Allplan 2022
Note: If you place a SmartPart in the opening you have created,
Allplan always places this SmartPart in the middle of the window
reveal (provided you have created a reveal element). It is
irrelevant where you click the opening.
If there is no reveal, Allplan places the SmartPart in such a way
that it is centered in the wall layer clicked.
Creating a window opening in a double-leaf wall
The procedure for entering window openings in double-leaf walls is
largely similar to that for single-leaf walls.
To create a window opening in a double-leaf wall
1 See steps 1 to 5 for single-leaf walls.
2 See step 6 for single-leaf walls.


## Sayfa 191

Doors, Windows, and SmartParts Unit 2: windows 185
3 Here, too, the approach is the same as with single-leaf walls: to
create a reveal element, open the Reveal tab and check that the
Create reveal element option is selected.
Compared with single-leaf walls, you can choose from six options
in the Type area.
Note: If you select type , you can define the offset separately
for each layer. For all the other types, the offset applies either to
the first wall layer or to the last wall layer.

1 86 A note on openings in multilayer walls Allplan 2022
The parameters you can use to define the geometry vary
depending on the type you have selected. The abbreviations are
explained in the Legend and Representation areas on the Reveal
tab of the Window dialog box.
Note: Allplan does not create the reveal element until you enter a
value for the Window depth.
4 Enter values for the Window depth, Outer reveal or Inner reveal
(see step 8 for single-leaf walls).
5 Enter values for Facing and Offset.
6 Close the Window dialog box.
7 Define the offset to the end point of the opening.

Doors, Windows, and SmartParts Unit 2: windows 187
Exercise 11: garage
In this exercise, you will create door openings and slab openings in a
floor plan of a garage. In addition, you will insert SmartParts into
these openings.
Tools: Objective:
Door
Recess, Opening in
Slab
Door SmartPart
Domed Roof-Light
SmartPart
Creating door openings and slab openings
To create door openings
 2+1 Animation Window is selected.
 The reference scale is 1:50.
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar), select the Garage structural level and make drawing file
85 Floor plan without openings current. All the other drawing
files are closed.
2 In all three viewports, click Zoom All (viewport toolbar) so that
you can see the whole garage.

1 88 Exercise 11: garage Allplan 2022
3 Click Door (Architecture or Engineering role - Elements task
- Components task area).
4 Point into the horizontal wall at the bottom near the lower-left
corner of the garage.
5 Click the outer line of the exterior wall.
6 Check the position of the reference point: It is the lower-left
corner of the garage. Then enter the distance in the dialog line:
1.00 m
7 Click Properties.
8 Select the rectangular shape for the door type.
9 Click the icon representing the opening direction and select the
single-leaf door.
10 Enter width of opening = 0.885 m.
11 Click Height....
12 In the Top level area, click Relative to lower plane and enter
the following value: 2.20 m.
13 In the Bottom level area, click Relative to lower plane (offset:
0.00) and click OK to confirm.
14 Check that the Library element 1 to n area is empty. If it isn't,
click .
15 In the Sill representation area, click outside.
16 Select the Create reveal element option.

Doors, Windows, and SmartParts Unit 2: windows 189
The Door dialog box should now look like this:
17 Switch to the Reveal tab.
18 Enter the following values in the Parameters area:
• Door depth: 0.07
• Outer reveal: 0
As a result, the inner reveal is 0.2 m.
19 Click OK to confirm the dialog box.
20 Confirm the offset to end of opening (the width of the opening) in
the dialog line: 0.885

1 90 Exercise 11: garage Allplan 2022
21 Specify the direction of the door swing.
The preview is attached to the crosshairs.
22 The Door tool is still open.
Point into the vertical wall on the right side and place the door
opening near the lower-right corner of the garage (see
illustration).
23 Enter the distance to the lower-right corner of the garage in the
dialog line: 0.615 m
24 Click Properties.
25 On the Opening tab, select the rectangle for the door type.
26 Click the icon representing the opening direction and turn it
off .
27 Enter width of opening = 3.26 m.
28 Do not change the other settings.
29 Click OK to confirm the dialog box.
30 Confirm the offset to end of opening (the width of the opening) in
the dialog line: 3.26

Doors, Windows, and SmartParts Unit 2: windows 191
31 Select ESC to close the tool.
To create slab openings
 2+1 Animation Window is selected.
 The reference scale is 1:50.
 Drawing file 85 Floor plan without openings is current. All the
other drawing files are closed.
1 Click Recess, Opening in Slab (Architecture or Engineering
role - Elements task - Components task area).
2 Select slab
Click the upper slab of the garage.
3 Click Properties.
4 Select the opening type and the rectangular outline.

1 92 Exercise 11: garage Allplan 2022
5 Enter width = 80 cm and length = 2.00 m.
6 Click OK to confirm the dialog box.
7 Switch the anchor point to lower left.
8 Point to the left edge of the door opening in the horizontal wall.
Allplan snaps to this point.
9 Move the crosshairs slowly vertically upward.
The 90.0-degree track line appears.

Doors, Windows, and SmartParts Unit 2: windows 193
10 Enter 1.045 for the Offset to reference point in the dialog line
and select ENTER to confirm.
11 To create the second opening, click Properties again.
12 Select the round outline.
13 Enter the radius = 1.00 m and click OK to confirm the dialog box.
14 Switch the anchor point to centered.
15 Point to the midpoint of the right edge of the rectangular slab
opening you just created.
Allplan snaps to this point.
16 Move the crosshairs slowly horizontally to the right.
The 0.0-degree track line appears.

1 94 Exercise 11: garage Allplan 2022
17 Enter 2.70 for the Offset to reference point in the dialog line
and select ENTER to confirm.
18 Select ESC to close the tool.
Here, too, you can use a predefined drawing file as the basis for your
work. Open drawing file 86 Floor plan with openings.
Inserting SmartParts
The next step is to insert SmartParts into the door openings and slab
openings you just created. To do this, you will use the Door
SmartPart tool you know from unit 1. In addition, you will find out
about another tool for modeling SmartParts: Domed Roof-Light
SmartPart.
To insert SmartParts into the door openings
 2+1 Animation Window is selected.
 The reference scale is 1:50.
1 Click Open on a Project-Specific Basis (Quick Access
Toolbar), select the Garage structural level and make drawing file
86 Floor plan with openings current. All the other drawing files
are closed.


## Sayfa 201

Doors, Windows, and SmartParts Unit 2: windows 195
2 In all three viewports, click Zoom All (viewport toolbar) so that
you can see the whole garage.
3 Click Door SmartPart (Architecture role - Elements task -
Opening Elements task area).
4 Select Door in the list box at the top of the palette.
5 Place the SmartPart in the door opening in the horizontal wall at
the bottom.
Make sure the arrow points toward the outside of the garage.
6 You can now define the dimensions of the frame in the palette.
Make the following settings:
• Frame area:
Shape: Closed frame
Width left / right: 2 cm
Width top: 2 cm
Width bottom: 0 cm
Casing width: 3 cm
Casing depth: 1 cm
Position of frame: entire opening
• 3D representation area:
Do not change the settings.
7 To define the door leaf, click in the middle of the door in the
preview.

1 96 Exercise 11: garage Allplan 2022
8 Select leaf and define the following settings:
• Leaf area:
Opening type: turn
Click Turn around to apply the door leaf to the outside
of the wall.
Stop: left
Depth: 4 cm
Glass cutout: rectangular
Width / Height: 0.70 / 0.30 m
Lateral offset / Bottom: 0.00 / 1.40 m
• Fittings area:
Hinge side: Door handle
Offset at bottom: 1.05 m
Frame side: Door handle
Offset at bottom: 1.05 m
• 3D representation area:
Do not change the settings.
9 Switch to the 3D representation tab. In the Level of detail area,
change the position to open.
10 You can now use the handle to define the opening angle of the
door in 3D. Do this in isometric view or in animation view.
->

Doors, Windows, and SmartParts Unit 2: windows 197
11 Select ESC twice to finish modeling the door.
12 Select the Door SmartPart tool again. But this time, select
Sectional door in the list box at the top of the palette.
13 Place the SmartPart in the door opening in the vertical wall on the
right side.
Check the direction of the blue arrow.

1 98 Exercise 11: garage Allplan 2022
14 Make the following settings on the Elements tab of the palette:
• Panels area:
Number: 4
Section 1: Select smooth for the surface. Go to Section 2 by
clicking the corresponding icon. Here, too, select smooth for
the surface. Do the same for Section 4.
Section 3 gets glass elements.
Horizontally split: 4
Vertically split: 1
Width of frame: As Section 3 contains glass elements, enter
0.10 m for the width of the frame around the glass elements.
Opened by %: 0
• Hardware area:
Select the ceiling bracket option and enter BL of ceiling =
2.90 m.
• Do not change the other settings.
15 Close the palette to confirm your settings and select ESC to finish
modeling the garage door.

Doors, Windows, and SmartParts Unit 2: windows 199
After you have worked through this exercise, your screen should
look like this:

2 00 Exercise 11: garage Allplan 2022
The two slab openings get SmartParts, too.
To insert SmartParts into the slab openings
 2+1 Animation Window is selected.
 The reference scale is 1:50.
 Drawing file 86 Floor plan with openings is current. All the other
drawing files are closed.
1 In all three viewports, click Zoom All (viewport toolbar) so that
you can see the whole garage.
2 Click Domed Roof-Light SmartPart (Architecture role -
Elements task - Opening Elements task area).
3 Open the list box at the top of the palette. As you can see, you can
choose to create a rectangular domed roof-light or a
round domed roof-light.
Start by creating a rectangular domed roof-light. Select this
SmartPart and insert it into the rectangular slab opening.
4 Define the following settings in the palette:
• Curb area:
Curb height (a): 150 mm
Note: Select the dimensions freely definable option to define
the dimensions from 1 to 7. Thus, you can define the
parameters of the curb freely.
• Dome area:
Shape: Half-round
Rise: 0.09
Frame height: 0.04
Frame thickness: 0.06
Note: Height (b) is the sum of parameters 8 (rise) and 9
(frame height).

Doors, Windows, and SmartParts Unit 2: windows 201
• Note: The curb height (a) and height (b) parameters are
attributes of the domed roof-light SmartPart. To check the
attributes of the SmartPart, you can use the Modify
Attributes tool (shortcut menu of SmartPart). The names of
these attributes are domed_roof-light_curb_height and
domed_roof-light_dome_height.
5 Switch to the 3D representation tab. Click to turn off the
surfaces for curb and top mounted.
6 Select ESC twice to finish modeling the rectangular domed roof-
light.
7 To create the round domed roof-light, select the Domed
Roof-Light SmartPart tool again. But this time, choose round
domed roof-light in the list box at the top of the palette.
8 Insert the SmartPart into the round slab opening.
9 The parameters in the palette are similar to those for rectangular
domed roof-lights.
Select the following settings:
• Curb area:
Curb height (a): 150 mm
• Dome area:
Shape: Half-round
Rise: 0.09
Frame height: 0.04
Frame thickness: 0.06
10 Here, too, switch to the 3D representation tab. Click to turn
off the surfaces for curb and top mounted.

2 02 Exercise 11: garage Allplan 2022
11 Select ESC twice to finish modeling.
If you have not worked through these exercises step by step, you
can find the result in drawing file 87 Floor plan, complete. Drawing
file 88 Floor plan with dimensions contains the floor plan of the
garage complete with dimensions and labels. If you cannot see the
dimensions, the layer DL_GEN is still hidden, frozen. Open the Layers
palette and make this layer Modifiable.
You have now reached the end of unit 2.

Doors, Windows, and SmartParts Unit 2: windows 203
Note: Future Allplan versions will come with more sophisticated tools
for creating SmartParts. For example, SmartParts get more
parameters. So that you can use these parameters for SmartParts
created in earlier Allplan versions, the Transfer SmartPart
Version tool (Architecture or Engineering role - User-Defined
Objects task - SmartParts task area) updates old SmartParts. You
can find detailed information about this tool in the Allplan Help. See
"Transfer SmartPart Version".

2 04 Exercise 11: garage Allplan 2022


## Sayfa 211

Doors, Windows, and SmartParts Unit 3: analyses 205
Unit 3: analyses
You can analyze the door openings, window openings, and
SmartParts you created in these exercises in various different ways.
Allplan provides the following tools:
• Reports
• Modify Smart Symbol Instance's Attributes
• Export Quantity Data
• Import Quantity Data

2 06 Exercise 12: reports and attributes Allplan 2022
Exercise 12: reports and attributes
Finally, the last exercise will introduce you to the various options for
analyzing openings in reports.
Tools: Objective:
Reports
Modify SmartPart
Instance's Attributes
Options
Export Quantity Data
(drop-down list of the
Allplan icon - Export)
Import Quantity Data
(drop-down list of the
Allplan icon - Import)
Figure: object attributes of the front door

Doors, Windows, and SmartParts Unit 3: analyses 207
Reports for windows
By using the Reports tool, you can generate reports of architectural
elements, objects, 3D solids with architectural attributes, and
engineering components. You can view reports on the screen, place
them in the document, or send them to the printer. In addition, you
can save reports as PDF files, Excel files, or Word files.
To analyze the finish in a report
 2+1 Animation Window is selected.
 The reference scale is 1:50.
 Drawing file 86 Floor plan with openings is current. All the other
drawing files are closed.
1 To analyze both the floor plan of the building and the floor plan of
the garage, click Open on a Project-Specific Basis (Quick
Access Toolbar), select the Ground floor structural level and
make drawing file 38 Floor plan with shading elements current.
Go to the Garage structural level and open drawing file 87 Floor
plan, complete in edit mode.
2 Click Zoom All (viewport toolbar) in all three viewports.
3 Click Reports (Annotations task area).

2 08 Exercise 12: reports and attributes Allplan 2022
4 In the Reports dialog box, open the Reports - Eng - Finish -
Windows, doors folders.
Select the Windows (details).rdlc file.
Note: The Windows, doors folder (Reports - Eng - Finish) also
contains reports you can use to analyze the SmartParts in the
project, such as separate window sills (window sills.rdlc), and
round and rectangular domed roof-lights (domed roof-
lights.rdlc).
5 Click Open.
6 Click All in the input options.
You can see the report in the Report dialog box on the screen.

Doors, Windows, and SmartParts Unit 3: analyses 209
You can edit the report as follows:
• You can print the report.
• You can place the report in the current document.
• You can save the report in PDF, Excel or BCM format.
• You can edit the report in Layout Designer.
You can save changes as a new template in RDLC format.
7 Close the report.

2 10 Exercise 12: reports and attributes Allplan 2022
Modifying attributes
You want to analyze the attributes of the front door. You will start by
assigning attributes to this door.
To change the attributes of an instance of a SmartPart
1 Right-click the SmartPart of the front door (in the exterior wall on
the right side). The shortcut menu opens. Choose Modify
SmartPart Instance's Attributes.
2 The Modify Smart Symbol Instance’s Attributes dialog box
opens. Click ... to the right of More attributes.
3 Select Door objects and click OK.

Doors, Windows, and SmartParts Unit 3: analyses 211
4 Enter the following:
Note: To get a list of proposed frame types, open the Options
( Default Settings drop-down list on the Quick Access
Toolbar) on the Desktop environment page. In the Save/load
area, click the path settings button next to folders for saving
and make the following setting:
In the Save to dialog box, scroll down to the last entry. Switch the
path for architecture text drop-down menu (function, ...) to
office.

2 12 Exercise 12: reports and attributes Allplan 2022
5 Click OK to apply the settings.
6 Click OK to close the Modify Smart Symbol Instance’s
Attributes dialog box.
Reports for doors
Now you can analyze the attributes you assigned to the front door
SmartPart in a report.
To analyze attributes in a report
1 Click Reports (Annotations task area).
2 In the Reports dialog box, select the Doors (details with
prices).rdlc file and click Open.
3 Enclose the front door in a selection rectangle.
Allplan creates the report.

Doors, Windows, and SmartParts Unit 3: analyses 213
Note: You can define the following three options in the User
Interaction area on the left side:
Position from room: If this option is selected, the name and
function attributes are taken from the adjoining room and used
for the position. If this option is not selected, the room group and
function attributes of the SmartPart are used for the position.
Show graphic: You can hide the graphics
Show logo: You can hide the company logo.
You can edit the report as follows:
• You can print the report.
• You can place the report in the current document.
• You can save the report in PDF, Excel or BCM format.
• You can edit the report in Layout Designer.
You can save changes as a new template in RDLC format.
4 Close the report.

2 14 Exercise 12: reports and attributes Allplan 2022
Working with Excel lists
You can export the attributes you assigned to the front door to
Excel. You can then modify the Excel list and reimport it to Allplan.
The attributes you modified in Excel will be transferred to Allplan.
Export to Excel – modification in Excel – import to
Allplan
1 Open the drop-down list of the Allplan icon and click Export -
Export Quantity Data.
2 Click Settings for exporting Allplan quantity data in the Input
Options.


## Sayfa 221

Doors, Windows, and SmartParts Unit 3: analyses 215
3 The Settings: Export Quantity Data dialog box opens. Go to the
Report selection area and click the button to select the report
that you want to use to export the data.
Select the General object attributes.rdlc file and click Open.
4 You are back in the Settings: Export Quantity Data dialog box.
Go to the Output area and select the Allplan BCM (.xca) file type.
5 You can select the Follow-up program in the Settings: Export
Quantity Data dialog box. This is the program that opens the file
exported. If the Start external program directly option is
selected, this program automatically starts after export.
The xca2xac.exe sample application, which is integrated in
Allplan, automatically saves all calculation results in an xac file,
exporting them to Microsoft Excel.
You can see the path and file name to the right of Output file.
Note: When you use the xca format and xcax format, you must
save the file in the private data exchange folder
(...\Users\Windows_username\Documents\Allplan\2020\Usr\
Local\i_o). The file name must be derived from the project name;
do not change the file name.

2 16 Exercise 12: reports and attributes Allplan 2022
Do not change these settings.
6 Click OK to close the Settings: Export Quantity Data dialog box.
7 Enclose the front door in a selection rectangle.
8 Microsoft Excel starts, opening the exported file.
Modify the Excel list as follows:
Go to the Q column, change the price from 3249 EUR to 2498
EUR, and create a new column under AO. Enter the Attribute
name in the first row: Manufacturer Enter the manufacturer's
name in the third row: Hörmann

Doors, Windows, and SmartParts Unit 3: analyses 217
9 Close Microsoft Excel and save the changes. This saves the list as
an xac file to the private data exchange folder
( Windows_username
...\Users\ \Documents\Nemetschek
).
\Allplan\2022\Usr\Local\i_o
10 To import these changes to Allplan, open the drop-down list of
the Allplan icon and click Import - Import Quantity Data.
11 Select the file in the Import Quantity Data dialog box.

2 18 Exercise 12: reports and attributes Allplan 2022
12 Select the With dialog box for comparing data option at the
bottom of the dialog box.
13 Click Open in the Import Quantity Data dialog box.
You can see the new attributes in the Import Attribute Values
dialog box.
14 Click OK.
Allplan imports the data, automatically updating all elements that
have changed.

Doors, Windows, and SmartParts Unit 3: analyses 219
15 To check whether the front door SmartPart contains the
changes, open the shortcut menu and select Modify
SmartPart Instance's Attributes.
16 The Modify Smart Symbol Instance’s Attributes dialog box
opens. Click ... to the right of More attributes .
17 Select Door objects.
The price has changed from 3249 EUR to 2498 EUR.
Click OK to close the Door objects dialog box.
18 The Modify Smart Symbol Instance’s Attributes dialog box
opens. Click ... to the right of More attributes .

2 20 Exercise 12: reports and attributes Allplan 2022
19 This time, select Object attributes.
The object attributes include the new Manufacturer attribute
you added to the list in Excel.
Now you have reached the end of this step-by-step guide, giving
insights into how to work with doors, windows, and SmartParts. We
hope you had no problems following the steps and you are satisfied
with the result.

Doors, Windows, and SmartParts Index 221
Index
opening symbol 31, 37, 46, 187
1
opening width 31, 37, 42, 49,
1 viewport (tool) 83 187
2 reference point 31, 37, 42
relative height 31, 37, 187
2+1 animation window (tool) 61, door SmartPart 9, 10, 54, 60
97
door SmartPart 10, 60, 61, 194
A door SmartPart (tool) 10, 55,
60
apply archit. component
door SmartPart from library
properties (tool) 129
56, 74
architecture
modeling door SmartPart 194
configuration 24
modifying door SmartPart 74
C placing door SmartPart 74
saving door SmartPart 71, 74
corner window (tool) 15, 81, 145
creating corner window 146 E
SmartPart in corner window
Excel lists 214
149
creating the project 21 F
D flip smart opening symbol (tool)
129
define, modify reveal (tool) 51
dimensioning openings 14, 131 H
dimension line (tool) 139
handles 46
dimension walls (tool) 132
L
direct object modification 46, 49,
120, 168 layers palette 149
domed roof-light SmartPart 17,
M
187
domed roof-light SmartPart modifying SmartPart instance's
(tool) 17, 55, 81, 187 attributes 210, 214
rectangular domed roof-light multi-layer walls 180, 184
194
O
round domed roof-light 194
door 7, 8, 9, 10, 29, 30, 45, 54, 60 objects palette 149, 163
creating reveal element 51, options 24
187 options (tool) 46, 210
creating strip 51, 187 Q
door (tool) 31, 37, 42, 187
entering offset directly 31 quantities data 214
moving opening 49

2 22 Index Allplan 2022
creating reveal element 83, 91
R
modifying opening width 120
recess, opening in slab (tool) 187 opening width 83
reference scale 26 rasterize length (tool) 91
reports 16, 18, 55, 161, 206 reference point 83, 91
reports for doors 212 relative height 83, 91
reports for windows 207 sill 83, 91
roller shutter SmartPart 16, 161 window (tool) 83, 91
integrated roller shutter window sill SmartPart
SmartPart 174 integrated window sill
separate roller shutter SmartPart 97, 122
SmartPart 172 separate window sill
S SmartPart 125
window SmartPart 12, 15, 96, 145
scale 26 modeling window SmartPart
selecting pen and line type 26 97, 112, 149
shading SmartPart 16, 161 modifying window SmartPart
shading SmartPart - roller
13, 119, 120
shutters 172 placing window SmartPart 110,
shading SmartPart - sliding 112
shutters 163, 168 saving window SmartPart 106
shading SmartPart (tool) 16,
window SmartPart (tool) 12,
55, 81, 161 15, 16, 55, 96, 145, 161
SmartParts 55
library palette 55
library palette - delete, rename
or copy SmartPart 71
library palette - insert
SmartPart (tool) 71, 106, 112,
122, 125, 168
library palette - new group
(tool) 71, 106, 125, 168
load favorite (tool) 110
modify SmartPart using
handles (tool) 55
reports (tool) 16, 55, 161
save as a favorite (tool) 55,
108
Sources of information
training, coaching, and project
support 6
W
window 11, 12, 13, 15, 81, 82, 96,
119, 145
anchor point 83
basic dimensions 91

# Allplan 2022 SbS Advanced3D

**Kategori:** Allplan 2022 Step-by-Step
**Kaynak:** `Allplan_2022_SbS_Advanced3D-kaw1aj8984r.pdf`

---

**Toplam Sayfa:** 210


## Sayfa 1

ALLPLAN 2022
S tep by Step
Advanced 3D

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
Document no. 220eng01s10-1-BS0622

Advanced 3D Contents i
Contents
Before you start ... .......................................................................... 1
Requirements .................................................................................................................... 2
Feedback on the documentation ......................................................................... 2
Sources of information ............................................................................................... 3
Available documentation ......................................................................................... 3
Further help.................................................................................................................... 4
Training, coaching, and project support ........................................................... 5
Basic settings for the exercises............................................................................ 6
Adjusting the default planes................................................................................... 6
Unit 1: volume from 2D lines ...................................................... 7
Exercise 1: arc as a volume solid ............................................................................ 8
Drawing a two-dimensional parabola ................................................................ 9
Converting 2D elements to 3D ............................................................................13
Modeling an arc based on 3D elements........................................................... 14
Exercise 2: building outline, gravel stop ......................................................... 18
Drawing a cuboid ........................................................................................................19
Extruding along a path ............................................................................................20
Unit 2: text in 3D .......................................................................... 25
Exercise 3: text as a three-dimensional element .................................. 26
Task 1: creating three-dimensional text ......................................................... 27
Task 2: text on a straight wall .............................................................................. 37
Task 3: text on a curved wall............................................................................... 40

i i Contents Allplan 2022
Unit 3: slanting walls – walls with slants .......................... 49
Exercise 4: modeling walls ..................................................................................... 50
Task 1: straight, slanting wall................................................................................. 51
Task 2: slanted wall .................................................................................................. 65
Unit 4: unusual window shapes............................................. 75
Exercise 5: freeform outline of opening ........................................................76
Drawing the outline of the window in 2D and saving the design as a
symbol.............................................................................................................................77
Creating a straight wall .......................................................................................... 79
Creating the opening ............................................................................................... 80
SmartPart for spline window .............................................................................. 82
Unit 5: roof planes – from spline to dormer .................... 89
Exercise 6: dormers including area calculations ..................................... 90
Creating the roof frame in 3D.............................................................................. 92
Drawing the dormer in 2D ..................................................................................... 93
Creating the dormer in 3D..................................................................................... 95
Converting the model to architectural planes ........................................... 100
Area calculations ...................................................................................................... 101
Creating a roof covering ...................................................................................... 107
Unit 6: stairs – walls – ramps .............................................. 109
Exercise 7: stepped wall ......................................................................................... 110
Following the course of the steps - the stepped wall ............................. 110
Designing a stair ........................................................................................................ 111
Converting the stair to architectural planes ............................................... 116
Designing a stepped wall ...................................................................................... 118

Advanced 3D Contents iii
Exercise 8: the ramp and the trick with the stair ................................ 122
Designing the ramp ................................................................................................ 123
Converting the ramp to architectural planes ............................................. 127
Creating walls for the ramp ................................................................................ 129
Alternatives for creating ramps .......................................................................133
Unit 7: Experimenting with CAD ......................................... 135
Exercise 9: from freehand lines to animation.......................................... 136
Digital sketches or scanned sketches ...........................................................136
Quick edit.....................................................................................................................139
Freehand curves with the “Spline” tool .........................................................141
From lines to components ...................................................................................141
Creating walls from lines ......................................................................................142
Animation ................................................................................................................... 144
Exercise 10: modeling intuitively – three-dimensional sketches
................................................................................................................................................. 145
Task: redesigning a schoolyard ........................................................................ 147
Appendix 1: modeling in detail ............................................... 161
Exercise 11: modeling a wall lamp ..................................................................... 162
Objective .....................................................................................................................163
Appendix 2: stairs and ramps in detail ............................. 173
Exercise 12: stairs ....................................................................................................... 175
Task 1: straight stair ............................................................................................... 176
Task 2: spiral stair along a curved wall ...........................................................183
Task 3: freeform stairs .........................................................................................195
Exercise 13: ramps ..................................................................................................... 199
Task: ramp based on u-type stair....................................................................199
Index .............................................................................................. 203

i v Contents Allplan 2022

Advanced 3D Before you start ... 1
Before you start ...
The Actionbar is the toolbox of Allplan. Here, you can find
the tools sorted by role and task. The tools are combined
in task areas such as modeling, design, or visualization.
Simple lines, 3D elements, architectural planes – each of
these entities has its own specific capabilities. The aim is
to harness the capabilities of each entity to achieve the
best possible results. The Modeling task plays the central
role in this respect.
By means of simple and short exercises, this guide shows
how the tasks and task areas interact.
The appendix expands on two important topics: modeling
and stairs and ramps.

2 Requirements Allplan 2022
Requirements
This step-by-step guide assumes that you are familiar with and have
a working knowledge of Windows and Allplan 2022. It also assumes
that you are at ease with drafting and architectural tasks. The
essentials are described in the manual and in the Allplan Help.
For this reason, not every step of the exercises that follow is
described in detail.
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

Advanced 3D Before you start ... 3
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

Advanced 3D Before you start ... 5
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

6 Basic settings for the exercises Allplan 2022
Basic settings for the exercises
All the exercises use the following basic settings.
To define basic settings
1 Select m for the unit of length on the status bar.
2 Switch the reference scale on the status bar to 1:100.
Adjusting the default planes
The height settings used in the exercises are usually based on
drawing files whose default planes are at 0.0 m and 2.5 m.
When you work on an existing project with a defined building
structure, other values might be predefined for the default planes.
Therefore, create a new project without a building structure for the
exercises in this guide.

Advanced 3D Unit 1: volume from 2D lines 7
Unit 1: volume from 2D
lines
You can display initial design ideas recorded on sketching
paper as simple outlines in the form of 2D lines on the
computer. The aim is to develop a three-dimensional
model based on this “digital sketch” in as fast and
uncomplicated a manner as possible.
The initial design concept can best be examined based on
3D elements and by means of animation.
From 2D to 3D: This unit contains two exercises on this
topic.

8 Exercise 1: arc as a volume solid Allplan 2022
Exercise 1: arc as a volume solid
The first exercise shows how to turn basic shapes of bent girders,
curved facades, and other “nonlinear” design elements into 3D
models.
Greenhouses in the
Botanical Gardens, Graz,
Austria
Architect
Volker Gienke

Advanced 3D Unit 1: volume from 2D lines 9
Drawing a two-dimensional parabola
In this exercise, you will design a parabola with the cross-section of
an ellipse. This might be a construction element for a bridge or a
glass-fronted hall.
A 2D sketch will serve as the basis. You can scan in a sketch and then
trace the outline on the computer. As an alternative, you can draw
the curves from scratch.
The 2D Objects task area provides interesting alternatives for
designing and modifying special shapes like polygons and splines.
One of these is the representation of mathematical functions.
To draw the parabola in 2D
3 Go to the Actionbar, select the Draft role, and open the
Design task.
4 Click Function() (2D Objects task area).
5 Define a parabola in the dialog box. The parabola is open at the
bottom and slightly wider than the standard parabola.
Tip: You can find a list of
For example, the following function meets the criteria mentioned
supported mathematical
earlier:
functions in the Allplan Help.
Just select the F1 key while f(x) = -1/3 x²
Function() is active.

1 0 Exercise 1: arc as a volume solid Allplan 2022
Remember: The function of the standard parabola is f(x) = x².
Define the curve that you want to display by entering its function
on the context toolbar.
S ZonX and E ZonX define the values up to which the curve is
visible along the x-axis. In this example, it is -6 to 6, which
signifies a vertex of 12 meters.
Another option is to define the increment. To do this, use the Inc
dx box. This controls the segmentation of the curve.
6 After you have entered the data, click a point to define where the
curve starts. The system computes the parabola.

Advanced 3D Unit 1: volume from 2D lines 11
The next step is to define the cross-section of the arc. You will
create an ellipse here.
To draw the arc cross-section in 2D
1 Lines and points in construction-line format make it easier for
you to edit 3D elements later. For example, by converting a circle
to a 3D element, you lose the marking of the center. By adding
elements in construction-line format at this stage, you can use
reference points when working in three dimensions later. These
reference points help you identify the center of a curve or any
other element.
Therefore, start by drawing the ellipse’s center. To do this, use
the Point Symbol tool ( Draft role - Design task - 2D
Objects task area), select the first symbol (1 Cross, point, and
place it as a Construction line (Properties palette).
2 Click Ellipse (2D Objects task area).
Do not forget to turn off the Construction line option in the
Properties palette.
3 As you want to draw a closed ellipse, click Enter full ellipse on
the context toolbar.
4 The ellipse gets a different line color. Select Line color 5 in the
Properties palette.
5 Enter the following values in the dialog line:

1 2 Exercise 1: arc as a volume solid Allplan 2022
Midpoint: Click the point symbol you placed in construction-line
format.
Vertex or first radius: 0.4
Vertex or second radius: 0.2
Angle or point to define inclination: 0.000
Tip: You can Undo and 6 Move (Edit task area) the ellipse and its point in construction-
Redo (Quick Access line format to one end of the parabola.
Toolbar) each step.
Consequently, you won’t
have to start from scratch if
something goes wrong.
Another advantage of these
tools is that you can
reconstruct the design
process for similar
elements.
7 As you need the ellipse at the other end of the parabola too, copy
and mirror the ellipse.
Click Copy and Mirror (Edit task area) and select the ellipse.
8 Click point 1 of mirror axis
Click the vertex of the parabola.

Advanced 3D Unit 1: volume from 2D lines 13
9 2nd point of mirror axis
Move the crosshairs vertically downward along the track line and
click anywhere on the track line.
Converting 2D elements to 3D
You have entered the basic 2D data. You can now convert the 2D
lines to 3D elements.
To convert 2D elements to 3D
 Actionbar: Draft role - Design task.
1 Click Convert Elements (Create area) and select 2D to 3D
lines, 3D curves.
2 Click “Yes” to confirm the following prompt: Convert elements to
polygons, combining all elements to form a single 3D polyline?
3 Select the entire parabolic arc (without the ellipses).

1 4 Exercise 1: arc as a volume solid Allplan 2022
4 Specify the number of segments for the ellipses as 3D elements
on the context toolbar.
Even “round” 3D elements consist of straight lines; the greater
the number of lines, the smoother the curve.
5 Select the first ellipse in its entirety.
Allplan converts the ellipse.
6 Select the second ellipse in its entirety.
Allplan also converts this ellipse.
Modeling an arc based on 3D elements
Now you have three 3D elements: two ellipses and one parabolic arc.
The next step is to create a 3D arc based on these elements.
To model an arc based on 3D elements
1 Open the Window drop-down list on the Quick Access Toolbar
and click 3 Viewports.
2 Click Rotate 3D Elements (Edit task area).
3 Select the parabola and define the axis of rotation by entering
two points as shown in the illustration. The angle of rotation is 90°.
By rotating the parabola about the x-axis, you get an upright
parabola.


## Sayfa 21

Advanced 3D Unit 1: volume from 2D lines 15
A = axis of rotation
In Plan, the rotated curve is visible as a straight line. In
isometric view, you can see how the elements are arranged.
4 Go to the Actionbar and switch to the Modeling task.
5 Use Extrude Along Path (3D Objects task area) to create a
solid based on the ellipse on the left side and the parabola (both
elements are 3D polylines).
6 Select profile to extrude
Click the ellipse on the left side.
7 Select path
Click the parabola.
8 Do not change the parameters; select ESC twice to close the tool.
9 The right side of the 3D arc ends at an angle to the x-axis.
At the beginning of the path (= left point of parabola), the ellipse is
at a certain angle to the path (= parabola). At the end of the path
(= right point of parabola), the profile ends exactly at this angle.
To adjust the end of the arc on the right side to that on the left
side, you can use the Extrude Along Path tool a second time.
Select Extrude Along Path again.
10 To select the profile, click the ellipse on the right side.

1 6 Exercise 1: arc as a volume solid Allplan 2022
11 To select the path, click the parabola again.
Make sure that you click the 3D polyline.
12 Select ESC twice to close the tool.
Allplan has created a second 3D arc.
13 Finally, you want to obtain a single 3D arc that rests with both
ends on the x-axis.
Select the Union tool (Boolean Operators task area).
14 Click the first arc and then the second arc.
Right-click to confirm.
That’s all! The result is a single 3D arc.

Advanced 3D Unit 1: volume from 2D lines 17
The solid appears even more realistic when you select the Hidden or
Animation view type (in the lower-right area of the viewport
toolbar).
Select the F4 key for a quick animated view. This opens another
viewport that displays the solid in animation.
You can experiment with the tools in the 2D Objects task area. For
example, you can design a water slide from a sine curve and a
semicircle. Convert these elements to 3D and extrude the resulting
3D elements.

1 8 Exercise 2: building outline, gravel stop Allplan 2022
Exercise 2: building outline, gravel stop
The detailed finish of an attic must fulfill technical, physical, and
aesthetic requirements. You can easily check whether the gravel
stop has a positive effect on the building as a whole. The following
exercise shows how to design an attic detail for a building.
To draw the attic outline in 3D
 Actionbar: Modeling task.
 Draw the outline of the attic as a 3D Line (3D Objects task
area).
ca. 1,0 m

Advanced 3D Unit 1: volume from 2D lines 19
Drawing a cuboid
Draw a cuboid before you model the edge of the roof. This cuboid
serves as a simplified version of the building, helping you understand
how the following steps work.
To draw a cuboid
1 Open the Window drop-down list on the Quick Access Toolbar
and click 3 Viewports.
2 Draw a Box (3D Objects task area). Select a different pen
color and use the dimensions in the illustration.

2 0 Exercise 2: building outline, gravel stop Allplan 2022
Extruding along a path
In the first exercise, you learned how profile and path interact. In this
exercise, you will create 3D shapes from open profiles.
Start by moving the outline of the attic (= profile) so that it is
positioned correctly in relation to the path. Do this in Plan.
To extrude a profile along a path
1 As shown in the illustration, Move (Edit task area) the outline
of the attic to any point on the path but not into a corner. Then,
move the element by 3 m in the z-direction to place it at the
upper edge of the building.
The illustration on the left side shows the position of the elements
in plan; the illustration on the right side shows the move in the z-
direction in isometric view.
Tip: The easiest way to
2 The outline is still flat on the xy plane. Use Rotate 3D
switch between different
Elements (Edit task area) to rotate the element by 90° about the
views is to use multiple
x-axis. When you define the axis of rotation, make sure that you
viewports.
click the points in the correct sequence.

Advanced 3D Unit 1: volume from 2D lines 21
3 As soon as the outline is positioned correctly in 3D, you can select
the Extrude Along Path tool (3D Objects task area):
Select the profile (= attic outline).
Note: The profile must be planar and continuous; it must not
intersect itself. The profile can be open or closed. If the profile
consists of several elements that you cannot select with a single
click, use the Brackets (Work Environment task area).
The path consists of the four upper edges of the cuboid.
To identify these edges, use the Brackets. Click the four upper
edges of the cuboid one after the other in isometric view.
2 3
A
1 4
A = path

2 2 Exercise 2: building outline, gravel stop Allplan 2022
Select Esc to finish.
The outline circumscribes the entire building, thus describing the
edge of the roof as a 3D element.
4 To view the result, select the Hidden view type (viewport
toolbar).

Advanced 3D Unit 1: volume from 2D lines 23
The path does not necessarily have to be a closed polyline. You can
also use this tool to create a roof with a single edge, such as a mono-
pitch roof.
You can even design more complex shapes based on nonplanar
paths. For example, think of roofs that end at different heights.
You can make your design look even more realistic by editing it with
the tools in the Visualization task.

2 4 Exercise 2: building outline, gravel stop Allplan 2022


## Sayfa 31

Advanced 3D Unit 2: text in 3D 25
Unit 2: text in 3D
Text is typically used in 2D work. Text provides additional
information and enhances the graphical quality of a plan –
what’s more, text is easy to use.
So why not use text for 3D work too? This unit shows
how to create three-dimensional labels in no time at all.

2 6 Exercise 3: text as a three-dimensional element Allplan 2022
Exercise 3: text as a three-dimensional
element
Logos on buildings can be essential for advertising purposes; they
can serve as a point of reference in the cityscape, showing the way
to visitors. In terms of design, logos are especially dominant at night,
illuminating facades. Logos can also be used as freestanding
elements in open-space design.
To check the effect of logos at an early stage, you can apply 3D text
to the building model and display the result in animation. The
following example shows how to turn flat text into sculptured text.
Cinemaxx in Hanover
Architect: Helmut Sprenger

Advanced 3D Unit 2: text in 3D 27
Task 1: creating three-dimensional text
To create text as a wireframe model
 Actionbar: Architecture role - Elements task.
1 Select the Horizontal Text tool in the Quick Access task area.
2 Click in the workspace to specify where the text is to start.
3 Choose the Times New Roman font and define the text
parameters as you want. Enter Hotel for the text; click OK to
close the dialog box.
4 Use the Hidden-Line Image, Wireframe tool ( View drop-
down list on the Quick Access Toolbar) to convert the text to
lines.
A new viewport opens, displaying the wireframe model.

2 8 Exercise 3: text as a three-dimensional element Allplan 2022
5 Enclose the wireframe model in a selection rectangle. Go to the
Quick Access Toolbar, open the Edit drop-down list, and select
Copy or Ctrl+C.
6 Close the viewport. A dialog box asks whether you want to save;
click No.
You are back in the drawing file with the text "Hotel".
7 Go to the Quick Access Toolbar, open the Edit drop-down list,
and select Paste or Ctrl+V. Move the crosshairs vertically
downward so that the text is flush with the "H".

Advanced 3D Unit 2: text in 3D 29
8 Click to place the text.
9 Select 3 Viewports ( Window drop-down list on the Quick
Access Toolbar).

3 0 Exercise 3: text as a three-dimensional element Allplan 2022
Saving text as a symbol
To create the text in three dimensions, you can use various tools for
designing architectural components such as beam, column, or profile
wall. In this example, you will design a profile wall based on the text
that you just converted to individual lines. First, you will save the text
as a symbol.
To save the text consisting of individual lines as a
symbol
1 Open the Library palette.
2 Open the Project folder and the required project.
3 Click New group.
4 Enter a name for the group - for example, Text - and select
ENTER to confirm.
5 Open the new Text folder.

Advanced 3D Unit 2: text in 3D 31
6 Click Insert element and then Insert symbol.
7 Select elements you want to save as a symbol
Enclose the wireframe model in a selection rectangle.
8 Set the symbol's base point
Click the lower-left corner of the text.

3 2 Exercise 3: text as a three-dimensional element Allplan 2022
9 Select the Dumb symbol (not snoop-enabled) option in the
dialog box.
10 Enter a name, for example, Hotel.
Click OK to confirm.
This adds the Hotel symbol to the library.

Advanced 3D Unit 2: text in 3D 33
Displaying letters as walls in 3D
To display letters as walls in 3D
 Actionbar: Architecture role - Elements task.
1 Click Profile Wall (Components task area).
2 Click Properties.
3 Click Section.
In the Library dialog box, open the My project - Text folder.
4 Select the Hotel symbol.

3 4 Exercise 3: text as a three-dimensional element Allplan 2022
5 Define the following settings in the Profile Wall dialog box:
Move the component axis to the lower edge.
Select the Fill check box and choose a color, for example, number
150.
6 Click OK to close the Profile Wall dialog box.


## Sayfa 41

Advanced 3D Unit 2: text in 3D 35
7 To place the profile wall, move the crosshairs vertically
downward so that the profile wall is flush with the "H”; then click.
Use the track line to define the depth of the profile wall.
In this example, the depth is 0.1 m.
8 As soon as the 90.0-degree track line shows l=0.100, click again.
Then, select ESC to close the tool.

3 6 Exercise 3: text as a three-dimensional element Allplan 2022
9 The result now looks like this in 3 Viewports:

Advanced 3D Unit 2: text in 3D 37
Task 2: text on a straight wall
To apply the text at a specific height to a building, you must modify
the height settings of the profile wall.
To change the height settings of the profile wall
1 Open the Profile Wall dialog box by double-clicking the profile
wall.
2 To modify the height settings of the profile wall, click in the
Relative height column.
3 The Height dialog box shows the height settings of the profile
wall, which you can change. In this example, the bottom level of
the profile wall is flush with the lower default plane. The top level
of the profile wall is attached to the upper default plane. The
offset results from the component height of the profile wall (=
0.267 m; see Profile Wall dialog box - Shape of cross-section
area) and the height of the upper default plane (= 2.50 m).

3 8 Exercise 3: text as a three-dimensional element Allplan 2022
4 To make sure that the dimensions of the profile wall do not
change, click in the Top level area and enter 0.267 m for the
Component height of the profile wall.
For the Bottom level, enter an offset of 2.00 m.
5 Click OK to confirm the dialog boxes.

Advanced 3D Unit 2: text in 3D 39
Checking the result in animation
If you want to check the result in animation, start by drawing a cuboid
that represents the building. Attach the text to this cuboid so that
there is a small gap between the text and the cuboid. Then select the
F4 key. As an alternative, select the Animation view type on the
viewport toolbar of an isometric viewport.

4 0 Exercise 3: text as a three-dimensional element Allplan 2022
Task 3: text on a curved wall
This task requires the text Hotel, which you saved as a symbol. To
create the text in three dimensions, you will use the Column tool.
First, however, you will draw a cylinder to which you will attach the
text later.
To create a cylinder
1 Switch to the Modeling task (Architecture role).
2 Click Cylinder (3D Objects task area).
3 Select Circle based on center in the input options.
4 Draw the following cylinder in Plan:
Midpoint: Click any point.
Radius: 1
Height: 1
5 As you need this cylinder later, copy it and place it in the
workspace.
6 Continue with the copy.
Rotate the copied cylinder by 90° about the x-axis in the front
elevation.
1st point of rotation axis:
Click any point on the cylinder in the front elevation.
2nd point of rotation axis:
Use Delta point (dialog line) to define the axis of rotation by
entering any value for the x-coordinate.

Advanced 3D Unit 2: text in 3D 41
Converting the cylinder to architectural planes
Use the rotated cylinder as the basis for creating for new planes.
To convert the cylinder to architectural planes
1 Start by changing the format properties of the planes so that you
can distinguish the cylinder, which you will convert to planes, from
the 3D objects.
To do this, click Options ( Default Settings drop-down list
on the Quick Access Toolbar).
2 Open the Planes page. Go to the Roof planes, roof surfaces,
custom planes area and select the Default - fixed format
properties option.
3 Click OK to close the options.

4 2 Exercise 3: text as a three-dimensional element Allplan 2022
4 Click Convert Elements (Change task area) and select
General 3D element to 3D solid, 3D surface.
5 Click the rotated cylinder. Select ESC twice to close the tool.
6 Click 3D to Planes (Change task area).
7 Click the rotated cylinder to identify it as the 3D object that you
want to convert.
The system uses the surface area of the cylinder, which consists
of planar polygons, to generate an equivalent number of planes.
Creating "round" text
You will use the Column tool to create three-dimensional text, which
you will then move to the cylinder consisting of planes.
To create "round" text
1 Switch to the Elements task (Architecture role).
2 Click Column (Components task area).
3 Click Properties.
4 Click Column based on a symbol with a freeform outline.
5 For the outline of the column, use the text Hotel, which you saved
as a symbol.
Click Select geometry in the Parameters area.
6 In the Library dialog box, open the My project - Text folder.
7 Select the Hotel symbol.

Advanced 3D Unit 2: text in 3D 43
8 In the Column dialog box, click the Height... button and make the
following settings:
Note: Check the Column dialog box to make sure that the Angle
in the Parameters area is 0.

4 4 Exercise 3: text as a three-dimensional element Allplan 2022
9 Close the Column dialog box. The text is attached to the
crosshairs. Place the text so that it is centered on the cylinder
consisting of planes.
10 Select ESC to close the Column tool.
11 Select F4 to open the animation viewport. As you can see, the
text has adapted to the planes of the cylinder.
The following illustration shows the process in plan (upper row), in
front elevation (middle row), and in parallel projection (lower row).
You can see how the wall polygons adapt to the new planes (from
left to right).


## Sayfa 51

Advanced 3D Unit 2: text in 3D 45
Make sure that the cylinder and the text are in the same drawing
file!

4 6 Exercise 3: text as a three-dimensional element Allplan 2022
12 You do not need to change the height of the text. However, you
must change the way the text is linked with the planes: Attach
the text to the upper plane. To do this, use the Change Archit.
Properties tool (Change task area).
13 To change the relevant parameters, select the Height check box,
define the required height settings, and select the text in its
entirety.

Advanced 3D Unit 2: text in 3D 47
The result should look like this:
14 Use Convert Elements (Change task area) to convert these
architectural elements to 3D so that you can make more
modifications.
The result is a free element that does not depend on planes.

4 8 Exercise 3: text as a three-dimensional element Allplan 2022
15 Use Rotate 3D Elements (Edit task area) to rotate the text by
90° about the x-axis.
Cylinder for text
To achieve as realistic an image as possible in animation, place the
text in front of the cylinder so that there is a small gap between the
text and the cylinder; move the text by 0.5 m in the z-direction:

Advanced 3D Unit 3: slanting walls – walls with slants 49
Unit 3: slanting walls –
walls with slants
Slanting walls with or without openings or walls with
nonparallel sides – these types of walls are usually used
for design purposes.
In task 1 of the following exercise, you will create a
straight, slanting wall by resizing a rectangle and saving
the result as a symbol. This symbol is the basis for the
wall cross-section based on which you will design a
profile wall. Here, too, you will use the Profile Wall tool
(see exercise 3, task 1).
In task 2 of the following exercise, you will convert a wall
to a 3D object, give this object the required slanted shape,
and convert it to planes. Finally, you will create a freeform
wall within these planes.

5 0 Exercise 4: modeling walls Allplan 2022
Exercise 4: modeling walls
To begin with, you have the architectural element “wall” – an
“intelligent” wall with a material, quantities, and other properties.
Slanting walls, too, can be given wall openings, which are fully
quantifiable. The wall is nevertheless “merely” a cuboid.
By converting the cuboid to a 3D element, you can create just about
any shape from the cuboid.
Technical college in
Öhringen
Architect: Günter Behnisch

Advanced 3D Unit 3: slanting walls – walls with slants 51
Task 1: straight, slanting wall
The aim of this exercise is to create a straight, slanting wall that is
3.80 m high and 30 cm thick. The angle of inclination is 15 degrees.
First, you will define the default planes for the drawing file in which
you will create the slanting wall.
To define the default planes for the drawing file
1 Open an empty drawing file.
2 Select the List Default Planes tool (Annotations task area).
3 Enter Elevation at bottom = -0.15. This includes a 15-cm floor
structure.
4 Consequently, the Elevation at top is 3.65 m (= difference
between the 3.80-m total wall height and the 0.15-m floor
structure).
5 Click OK to close the List Default Planes dialog box.

5 2 Exercise 4: modeling walls Allplan 2022
Designing the wall cross-section
The next step is to draw the wall cross-section as a rectangle.
To design the wall cross-section
 Actionbar: Architecture role - Elements task.
1 Click Rectangle (Quick Access task area).
2 Draw a rectangle; use the following dimensions: dx = 0.3 and
dy = 3.8.
3 Click Stretch Entities (Change task area).

Advanced 3D Unit 3: slanting walls – walls with slants 53
4 You will stretch the top level in the y-direction. Open a selection
rectangle as shown in the illustration.
5 Right-click in the workspace and select Track tracing options
on the shortcut menu.

5 4 Exercise 4: modeling walls Allplan 2022
6 In the Options dialog box, change the Cursor snap to 15 degrees.
Make sure that Orthogonal track lines are selected.
7 From point
After you have clicked OK to close the Options dialog box, click
the upper-left corner of the rectangle. Do not move the
crosshairs for a moment (about 500 milliseconds) so that the
program snaps to this point, marking it as a track point.
8 To point
Point to the lower-left corner of the rectangle so that the
program also snaps to this point, marking it as a track point.


## Sayfa 61

Advanced 3D Unit 3: slanting walls – walls with slants 55
9 Start at the upper-left corner of the rectangle and slowly move
the crosshairs along the 0.0-degree track line. When the angle is
exactly 15 degrees, the system displays the point where the 0.0-
degree track line intersects the 75.0-degree track line, which
passes through the lower-left corner of the rectangle.
Click this point.
The rectangle’s angle of inclination is now 15 degrees.
10 This modification has changed the thickness of the wall. To
restore the original 30-cm wall thickness, click Modify Offset
(Change task area).
11 Click reference line
Click the left edge of the rectangle.
12 Click line
Click the right edge of the rectangle.
13 Click Retain direction in the input options.
14 Through point or offset
Enter 0.30 in the dialog line and select ENTER to confirm.

5 6 Exercise 4: modeling walls Allplan 2022
Saving the wall cross-section as a symbol
The next step is to save the wall cross-section as a symbol.
To save the wall cross-section as a symbol
1 Open the Library palette.
The Project - My project - Text folder is open in the Library
palette.
2 Click to go back to the My project folder.
3 Click New group.
4 Enter a name for the group - for example, Wall sections - and
select ENTER to confirm.
5 Open the new Wall sections folder.
6 Click Insert element and then Insert symbol.
7 Select elements you want to save as a symbol:
Enclose the wall cross-section in a selection rectangle.
8 Set the symbol's base point
Click the lower-left corner of the cross-section.
9 Select the Dumb symbol (not snoop-enabled) option in the
dialog box.

Advanced 3D Unit 3: slanting walls – walls with slants 57
10 Enter a name, for example, Slanting wall.
Click OK to confirm.
This adds the Slanting wall symbol to the library.

5 8 Exercise 4: modeling walls Allplan 2022
Creating a profile wall based on the wall cross-section
You will use the Profile Wall tool to create slanting walls based on the
wall cross-section saved as a symbol.
To create a slanting wall by means of the “Profile Wall”
tool
1 Go to the Quick Access Toolbar and select 2+1 Animation
Window in the Window drop-down list.
2 Click Profile Wall (Components task area).
3 Click Properties.
4 Click Section.
The Library dialog box opens.
5 Open the Wall sections folder (Project - My project folder).
6 Select the Slanting wall symbol.
7 To define the height settings of the profile wall, click in the
Height column of the Profile Wall dialog box.
8 Make the following settings in the Height dialog box:

Advanced 3D Unit 3: slanting walls – walls with slants 59
Use absolute heights for the profile wall.
9 Close the Height dialog box.
10 Make the following settings in the Profile Wall dialog box:
Move the component axis to the lower edge.
Select the Fill check box and choose a color, for example, number
150.
11 Click OK to close the Profile Wall dialog box.
12 Place the profile wall in the workspace.
Draw two wall sections that are 8.00 m and 5.00 m long and at
right angles to one another. Make sure that the arrow indicating
the offset direction points to the top and to the left respectively.
13 Select ESC to close the Profile Wall tool.

6 0 Exercise 4: modeling walls Allplan 2022
Your screen should now look like this:

Advanced 3D Unit 3: slanting walls – walls with slants 61
Creating wall openings
Walls created in this manner can also be given openings.
To create wall openings
1 Click Window (Components task area).
2 Click to place the reference point anywhere; open the dialog box
for defining the properties of the window. Start with a simple,
rectangular window. Define the height settings for this window:
Attach the opening to the top level and the bottom level at an
offset of 1.30 m each.
Enter the window as usual.

6 2 Exercise 4: modeling walls Allplan 2022
Note: In the Profile Wall dialog box, you can click Options for
component axis and profile to show or hide the enclosing 3D
boxes.
3 Experiment with other window shapes. This example also
contains a round window.

Advanced 3D Unit 3: slanting walls – walls with slants 63
Have a look at the wireframe model. As you can see, the openings
pass through the entire wall.
4 This unit started with “intelligent” components. See for yourself!
Select the Reports tool and compute the quantities of walls
with slants. As you can see, quantity takeoff works perfectly well
with these walls.

6 4 Exercise 4: modeling walls Allplan 2022
The report provides detailed information about the quantities: All
window openings have been computed and subtracted.


## Sayfa 71

Advanced 3D Unit 3: slanting walls – walls with slants 65
Task 2: slanted wall
Creating slants without tilting the wall as a whole – this is yet
another manner of standing out from the ordinary. Only one side of
the wall gets a slanted shape.
The first step is to draw a wall, which you will then convert to 3D.
Then you will modify the 3D object to give it the required slanted
shape. In this example, you will design an interior wall so that one side
of this wall adapts to the inclination of the exterior wall.
To draw a wall and convert it to a modifiable 3D object
1 Click Wall (Components task area).
2 Enter a thickness of 24 cm in the Wall dialog box.
3 Click Height and define the top and bottom levels of the wall so
that they are flush with the upper and lower default planes
respectively.

6 6 Exercise 4: modeling walls Allplan 2022
4 Switch to 3 Viewports ( Window drop-down list on the
Quick Access Toolbar) and draw the wall as shown in the
illustration.
5 Convert Elements turns a simple Wall into a 3D element.
To do this, select the Convert Elements tool (Change task
area).
6 Select Architecture, U-D element to 3D solids, click OK to
confirm, and click the wall that you just created.
7 Click Stretch Entities (Change task area).

Advanced 3D Unit 3: slanting walls – walls with slants 67
8 Zoom in on the profile wall with the round opening and the 3D
object in the viewport showing the Front, South Elevation.
9 Enclose the point in a selection rectangle as shown in the
illustration.
Note: To make sure that Allplan selects only the 3D object, click
Filter by Element Type (Filter task area) and select 3D
object.

6 8 Exercise 4: modeling walls Allplan 2022
10 Click point A and then point B in the viewport showing the
Front, South Elevation.

Advanced 3D Unit 3: slanting walls – walls with slants 69
By modifying the side along the x-axis, you have given the left
side of the 3D object the same inclination as the adjacent wall.

7 0 Exercise 4: modeling walls Allplan 2022
Converting the 3D object to planes and creating a
freeform wall
The second step is to convert the 3D object to planes. Finally, you will
create a freeform wall of the required slanted shape within these
planes.
To convert the 3D object to planes and create a
freeform wall
1 The 3D to Planes tool converts 3D objects to architectural
planes.
Click 3D to Planes (Change task area).
2 Click the 3D object that you just modified.
The 3D object turns into planes.
3 Click 1 Viewport ( Window drop-down list on the Quick
Access Toolbar) and zoom in on the floor plan.
4 You cannot see the planes in the area of the profile wall. Select
the planes by opening a selection rectangle that is large enough
to enclose the planes. Then open the shortcut menu and click
Sequence - Bring to front.
5 Place a Freeform Wall in these planes; attach the wall’s top
and bottom levels to the upper and lower planes respectively.
Select the Freeform Wall tool (Components task area).

Advanced 3D Unit 3: slanting walls – walls with slants 71
6 Click the four corners of the outline defined by the planes one
after the other in the floor plan.
7 Select 2+1 Animation Window ( Window drop-down list on
the Quick Access Toolbar) again.

7 2 Exercise 4: modeling walls Allplan 2022
Tip: To slant several interior walls, you do not need to create a pair of
planes for each wall. Instead, you can use the Roof Frame tool
(Roof task area) to create the required planes for several walls in one
go. This works just like creating attics. You can also use these roof
planes to define the height settings of other components such as
rooms.
Step 1: Create the required walls:

Advanced 3D Unit 3: slanting walls – walls with slants 73
Step 2: Create the roof planes:

7 4 Exercise 4: modeling walls Allplan 2022


## Sayfa 81

Advanced 3D Unit 4: unusual window shapes 75
Unit 4: unusual window
shapes
Placing window openings in common geometric shapes is
a standard procedure of any CAD system. But what
about special designs for window openings?
This unit shows the steps involved – from drawing the
2D outline to creating the 3D window, including a
customized SmartPart.

7 6 Exercise 5: freeform outline of opening Allplan 2022
Exercise 5: freeform outline of opening
Designing a freeform opening is a snap: Draw the outline of the
opening as 2D lines and save the design as a symbol. When creating
the window, you retrieve this symbol and insert it into the wall
opening. Then you apply a SmartPart to this opening.
Vacation home in Sardinia
Architect: Corrado Levi

Advanced 3D Unit 4: unusual window shapes 77
Drawing the outline of the window in 2D and saving the design as a
symbol
To draw the outline of the window in 2D and save the
design as a symbol
 Actionbar: Architecture role - Elements task.
1 Use the Line and Spline tools (Quick Access task area) to
draw a window outline like this:
Use the dimensions of the final window.
2 Open the Library palette.
3 Open the Project - My project folder.
4 Click New group.
5 Enter a name for the group - for example, Freeform window
shapes - and select ENTER to confirm.
6 Open the new Freeform window shapes folder.
7 Click Insert element and then Insert symbol.
8 Enclose the window outline in a selection rectangle. To define the
Symbol’s base point, click the lower-left corner.
9 Select the Dumb symbol (not snoop-enabled) option in the
dialog box.

7 8 Exercise 5: freeform outline of opening Allplan 2022
10 Enter a name, for example, Spline window.
Click OK to confirm.
This saves the new symbol.

Advanced 3D Unit 4: unusual window shapes 79
Creating a straight wall
Draw a straight wall into which you will insert the freeform window
later.
To create a straight wall for the freeform window
• Click Wall (Components task area).
Define the height settings of the top and bottom levels as usual.

8 0 Exercise 5: freeform outline of opening Allplan 2022
Creating the opening
You can now insert the window opening into the wall.
To create the opening for the freeform window
1 Click Window (Components task area).
2 Define the window’s drop-in point. The dimensions of the window
cannot be changed here. Place the window.
3 Click Properties. In the Shape area, click Freeform
opening from symbol catalog.
4 Click the icon next to Select geometry and select the window
outline that you just saved.

Advanced 3D Unit 4: unusual window shapes 81
You can see the dimensioned window outline in the
Representation area.
5 Click OK to close the Window dialog box.
Do not insert a library element yet. You will model an appropriate
window SmartPart for the freeform window shape in the next
section. To do this, you will use the Window SmartPart tool
(Opening Elements task area).
You have inserted the window opening. Check the quantities of the
wall. If you copied the wall before you inserted the opening, you can
see that the quantities have changed accordingly.
As shown in the previous unit, select the Reports tool
(Annotations task area) and choose the required report.
Allplan comes with various SmartParts for default windows, which
you can place together with the window opening in a single
operation. In addition, you can also model your own SmartParts.
Using the spline window as an example, the following section shows
you how to do this.

8 2 Exercise 5: freeform outline of opening Allplan 2022
SmartPart for spline window
SmartParts are parametric Allplan CAD objects that act according to
their own inherent logic, which is independent of the CAD system.
Parametric information is controlled by a script, which is directly
attached to the object.
You can insert modeled window SmartParts into window openings in
linear walls. SmartParts adapts to any outline.
Allplan displays the modeling process in real time. You can save the
finished SmartParts as smv files by means of the Save as a
favorite tool. You can also save SmartParts in a folder of the Library
palette.
You can edit SmartParts by means of handles (graphical
modification) or a dialog box (alphanumeric modification). To modify
SmartParts graphically, you can use the Modify SmartPart using
Handles tool, which you can find on the shortcut menu of the
SmartPart.
You can also use the handles and the dialog box in combination. By
double-clicking the SmartPart you open the Properties palette of the
SmartPart and select the handles.
The Window SmartPart tool is a powerful tool for creating
window SmartParts. Unfortunately, the format of this guide puts a
limit on the number of options it can present. Of course, you can
model the SmartPart in more detail and design a spline window that
best suits your own preferences and requirements. Get started and
give it a try!
To create a SmartPart for the spline window
1 Go to the Quick Access Toolbar and select 2+1 Animation
Window in the Window drop-down list.
2 Click Window SmartPart (Opening Elements task area).
You can use this tool to model SmartParts for windows and
window sills.

Advanced 3D Unit 4: unusual window shapes 83
3 Select Window in the list box at the top of the palette.
You can see the Elements tab of the window SmartPart. The
preview displays the frame, which serves as the basis for
modeling a window SmartPart.
Note: When you point to the lower edge of the preview, the
cursor turns into a double-headed arrow. You can now change
the size of the preview.
4 When you move the crosshairs across the workspace in plan
view, you can see that the SmartPart, which is currently not more
than the frame, is attached at its drop-in point to the crosshairs.
The drop-in point is the lower-left corner of the SmartPart.
Start modeling the window SmartPart by clicking inside the
opening of the spline window.
This places the SmartPart, which means that it assumes the size
of the window opening. The preview in the palette also adapts to
the new size.
If you have created the window opening with a reveal, Allplan
places the SmartPart in relation to the position of the reveal
element; that is, in the middle of the reveal element. It is irrelevant
where you click the opening. If there is no reveal, Allplan places
the SmartPart so that it is centered in the wall layer clicked.
Note: While you are placing the SmartPart, you can see an arrow
in the middle of the SmartPart. This arrow points toward the
outside of the SmartPart.

8 4 Exercise 5: freeform outline of opening Allplan 2022
5 Define the dimensions of the frame in the palette.
Make the following settings:
• Frame area:
Shape: Block frame
Width left / right: 7 cm
Width top / bottom: 7 cm
Depth: 7 cm
• 3D representation area:
Define how the frame looks in 3D. Select a Color (for example,
number 12) and a Surface (for example, the Maple,
landscape.surf file).


## Sayfa 91

Advanced 3D Unit 4: unusual window shapes 85
6 To create a mullion, go to the preview at the top of and click in the
middle of the spline window.
Select Mullion and enter the following:
• Mullion area:
Type: Fixed width on the left
Left: 0.7 m
Width / Depth: 0.07 m
• 3D representation area:
Select the same settings as for the frame: Color, for example,
number 12; Surface, for example, Maple, landscape.surf.

8 6 Exercise 5: freeform outline of opening Allplan 2022
7 To design the right part of the window, go to the preview and click
to the right of the mullion.
Select Mullion again and enter the following:
• Mullion area:
Type: 1:1
Fields: 3
Width: 0.05 m
Depth: 0.07 m
Orientation: centered
• 3D representation area:
Select the same settings as before.

Advanced 3D Unit 4: unusual window shapes 87
8 Create a casement in the left part of the window. To do this, go to
the preview and click to the left of the mullion.
Select Casement and make the following settings:
• Casement area:
Opening type: turn
Stop: right
Widths and depth: 0.05 m.
Rabbet ledge: Outside
Width / Depth: 0.05 m / 0.025 m
• Fittings area:
Hinge side: Window handle
Offset at bottom: 0.58 cm
Frame side: Turn the handles off (without).
• 3D representation area:
Color, for example, number 12; Surface, for example, Maple,
landscape.surf.

8 8 Exercise 5: freeform outline of opening Allplan 2022
In addition to numerous other settings, you can give the window
SmartPart window sills on the inside and outside. To do this, you
can use the Window sill tab.
This is not described any further here.
9 Select ESC twice to finish modeling the SmartPart.
10 You can save the SmartPart in the library.
Open the Library palette, select the path, and enter a name for
the SmartPart.
If you want to insert this SmartPart into another window opening
of the same shape, select the Insert Smart Symbol,
SmartPart in Opening tool on the shortcut menu of the window
opening and select the SmartPart in the library.

Advanced 3D Unit 5: roof planes – from spline to dormer 89
Unit 5: roof planes – from
spline to dormer
In the CAD system, the same applies for dormers as for
window shapes: Tools for creating basic shapes are a
standard feature.
What about dormers with unusual shapes, though? Even
geometric shapes in a 2D design, based on a spline, for
example, can be integrated in the roof by means of the
tools in the Modeling task.

9 0 Exercise 6: dormers including area calculations Allplan 2022
Exercise 6: dormers including area
calculations
In the following exercise, you will use 2D lines to create a dormer
shape from the front elevation of a building. You will then integrate
the design as a 3D element into the roof’s plane structure. Allplan will
update and calculate the cubic volume and area automatically. To
check this, you will output the area calculations in a report.

Advanced 3D Unit 5: roof planes – from spline to dormer 91
We recommend that you copy intermediate results to empty
drawing files so that you can fall back on them.
Before you can design a dormer, you must design a roof. To do this,
you will create a roof frame, which consists of multiple planes.
To create a gable roof
 Actionbar: Architecture role - Elements task.
1 Use Roof Frame (Roof task area) to create a simple gable
roof. Use the default settings shown.
2 Lock the eaves (1-4). Click the edges where you want to apply
the roof slopes (5+6).
You can see the outlines of the pairs of planes in isometric view.
With the eaves height at 3.50 m, this might be the basic design of
a detached house with a finished attic.

9 2 Exercise 6: dormers including area calculations Allplan 2022
Creating the roof frame in 3D
To design a solid based on these planes, you will use a freeform wall
whose top and bottom levels are flush with the upper and lower
planes respectively. As a result, the wall fills out the entire volume
delimited by the planes.
To create the roof frame in 3D
1 Click Freeform Wall (Components task area). Define the top
and bottom levels of the wall so that they are flush with the upper
and lower planes respectively.
2 Turn on Area detection (input options). Do not forget to select
the Polygonize elements on/off check box; otherwise, you
cannot use Area detection.

Advanced 3D Unit 5: roof planes – from spline to dormer 93
3 Design one freeform wall for each pair of planes. To do this, first
click in the outline on the left side (1) and then in the one on the
right side (2).
4 Click Convert Elements (Change task area) and select
Architecture, U-D element to 3D solids.
5 Select the freeform walls that form the roof.
Drawing the dormer in 2D
To enter the shape of the dormer in 2D, you will create the front
elevation of the solid.
To draw the dormer in 2D
1 Display the 3D element in Front, South Elevation, click
Hidden-Line Image, Wireframe ( View drop-down list on
the Quick Access Toolbar), and select Hidden-Line Image.
2 Click OK to close the Hidden-Line Image in Destination
Document palette. Click OK to confirm the note.
3 Close the viewport with the result and save the hidden-line image
in an empty drawing file.

9 4 Exercise 6: dormers including area calculations Allplan 2022
4 Open the drawing file with the hidden-line image and close all the
others.
5 Switch to Plan view.
Tip: Draw auxiliary lines in 6 Use the Line and Spline tools (Quick Access task area) to
construction-line format by draw the side elevation and front elevation and place them side
selecting by side (as shown in the illustration).
Construction line
(Properties palette).


## Sayfa 101

Advanced 3D Unit 5: roof planes – from spline to dormer 95
Creating the dormer in 3D
In this section, you will design the dormer as a solid based on the two
new components: the ridge line and the dormer arc, which consists of
a spline and a straight line.
To create the dormer in 3D
 Actionbar: Architecture role - Elements task.
1 Convert the lines to 3D elements. Use Convert Elements
(Change task area) and select the 2D to 3D lines, 3D curves
option.
You need discrete elements. Therefore, click “No” when you see
the following prompt: Convert elements to polygons, combining
all elements to form a single 3D polyline?
2 Move (Edit task area) the elements to their correct positions:
Move the dormer arc in the x-direction toward the ridge line.

9 6 Exercise 6: dormers including area calculations Allplan 2022
Use Rotate 3D Elements (Edit task area) to rotate the arc by
90° about the y-axis. Now you have correctly positioned the
elements in relation to each other.
3 Rotate both elements – ridge line and arc with the horizontal line
– about the x-axis. This axis is on the base line, which is the zero
line in the elevation drawing. By rotating the elements, you
ensure that they are at the correct height after you have placed
them upright in 3D.
4 To avoid confusion, Delete (Edit task area) all 2D lines from
the drawing file.
Now you can see only the ridge line and the arc with the
horizontal line (shown in isometric view):

Advanced 3D Unit 5: roof planes – from spline to dormer 97
5 Make the 3D roof frame, which you designed at the beginning,
visible again by changing the status of the drawing file with the
3D roof frame to current. The drawing file with the dormer arc,
horizontal line, and ridge line is still open in edit mode.
6 Copy the 3D roof frame ( Copy in the Edit task area).
7 As you can see, the elements are not yet arranged correctly in
the floor plan. Move the elements so that the dormer arc and
ridge line correctly rest on one of the roof areas.
8 Check the elements in the front elevation. Here, too, you might
have to move the elements in the x-direction or z-direction.
9 Go to the Actionbar and switch to the Modeling task.
10 The dormer currently consists of the 3D ridge line and the 3D arc.
Use Extrude Along Path (3D Objects task area) to create a
3D object from these elements.
11 To select the profile, open a selection rectangle around the arc
and the horizontal line.

9 8 Exercise 6: dormers including area calculations Allplan 2022
To select the path, click the ridge line.
Do not change the parameters; select Esc to close the tool.
Although the resulting 3D object is correctly positioned on the
roof, it does not yet adapt to the roof area.
12 Before you merge the two solids, convert the dormer from a
general 3D object to a 3D solid. To do this, click Convert
Elements (Change task area) and select General 3D element to
3D solid, 3D surface.
13 Click the dormer and select ESC to confirm.
14 Do not change the parameters; select ESC to close the tool.
15 Click Union (Boolean Operators task area) to combine the
elements to form a common 3D element. Click the dormer and
then the two roof frames; right-click to confirm.

Advanced 3D Unit 5: roof planes – from spline to dormer 99
When you look at the lines, you can see where the dormer
intersects the roof area.

1 00 Exercise 6: dormers including area calculations Allplan 2022
Converting the model to architectural planes
After you have modeled the 3D element, you can convert it back to
architectural planes.
To convert the model to architectural planes
1 Change the format properties (Properties palette) for the planes.
Note: If the Default - fixed format properties option is still
selected in the Roof planes, roof surfaces, custom planes area
( Options - Planes page), these format properties will
automatically be used.
2 Click 3D to Planes (Change task area).
3 Click the 3D element, thus converting it back to planes, which
have the format properties that you specified in the palette.
Modified planes are now available for designing walls, roofs, and
windows – in short, all the components required for creating a
building model.

Advanced 3D Unit 5: roof planes – from spline to dormer 101
Area calculations
You do not need to design a building to check the area details in this
example. It is enough to create rooms that cover the full extents of
the attic.
To perform area calculations
1 Go to the Actionbar and switch to the Finish task.
By comparing the roof models (roof with a dormer and roof
without a dormer), you will see how the system reacts to roofs
with different designs.
2 Click Room (Rooms, Surfaces, Stories task area).
3 Enter the outline of a room as a polyline. To define the room
height, you can use planes or absolute values as usual.

1 02 Exercise 6: dormers including area calculations Allplan 2022
Open the Properties and click Height on the Room tab.
Define the parameters so that the top of the room is flush with
the upper plane. Define the bottom level so that it is 2.75 m from
the lower plane, simulating a realistic story height.
Tip: Choose a different pen Note: To use the Area Calculation, Application tool for
color before you draw the analyses, make sure that LI (living space) is selected for Type of
rooms. floor area in the Floor area attributes on the DIN277, Floor Area
tab of the Room dialog box.
4 Draw the polyline for the room point by point as shown in the
illustration. Do this for each roof model. Have a look at the rooms
in isometric view.

Advanced 3D Unit 5: roof planes – from spline to dormer 103
5 Click Area Calculation, Application (Rooms, Surfaces,
Stories task area) to see the different options for area
calculations.
6 In the Reports dialog box, select the Living space.rdlc file.
7 Click the lower-left button. The Calculate Floor Area dialog box
opens. Select the Flat-rate amount to subtract, add 3% option.

1 04 Exercise 6: dormers including area calculations Allplan 2022
8 Click OK to close the Calculate Floor Area dialog box; click Open
in the Reports dialog box.
9 Click All in the input options.
A separate viewport opens, displaying the report.
10 To place the report in the drawing file, click Export - Allplan.
Here is the report for the roof without the dormer:
The report graphically displays the area calculations.


## Sayfa 111

Advanced 3D Unit 5: roof planes – from spline to dormer 105
Note: To display the area calculations in the current document
(see illustration), click in the Reports dialog box of the Area
Calculation, Application tool. The Options dialog box opens on
the Reports and quantity calculations page. Select the Create
area calculations in current document option.
When placing the report in the drawing file, you must decide
whether you want to permanently create the elements
representing the divided areas in the drawing file.
Note: You cannot undo this. However, you can select and thus
delete the graphics of divided areas as an entity group by
selecting and holding the Shift key while clicking.

1 06 Exercise 6: dormers including area calculations Allplan 2022
11 Calculate the areas of the roof with the dormer. The resulting
report is different:
As you can see, by modifying the roof frame, you change not only
the roof shape but the area details.

Advanced 3D Unit 5: roof planes – from spline to dormer 107
Creating a roof covering
Whether or not the roof includes a dormer, you can apply a Roof
Covering to both roofs in the same way.
To create a roof covering
1 Go to the Actionbar and switch to the Elements task.
2 Click Roof Covering (Roof task area).
3 Click Properties and define the parameters as shown in the
illustration:

1 08 Exercise 6: dormers including area calculations Allplan 2022
4 For each roof, enter the outline of the roof covering by means of
the polyline entry tools.
Just click the diagonal points of the roof and select Esc to finish
entering the outline. That’s all! The Above all roof planes and
dormer planes setting takes dormer planes into account.
Open an animation viewport (F4 key). The result might look like
this:

Advanced 3D Unit 6: stairs – walls – ramps 109
Unit 6: stairs – walls –
ramps
Stair designs can serve as the basis for the design of
other architectural elements – for example, walls
matching the course of the steps, or ramps where the
same design is used in a new context.

1 10 Exercise 7: stepped wall Allplan 2022
Exercise 7: stepped wall
Following the course of the steps - the stepped wall
When a wall is on or under a stair, you can achieve the stepped
course of the top or bottom of the wall by modifying the
architectural planes. At some time or another, not least when you
draw perspectives or calculate quantities, the course of the wall
must reflect the height intervals in the stair. This exercise shows
how to draw a ”wall on a stair”.
Telecommunications
Center
in Barcelona
Architects: Bach + Mora

Advanced 3D Unit 6: stairs – walls – ramps 111
Designing a stair
Start by designing a stair as the basis for the wall that you will create
later. Keep the straight stair in this example as simple as possible; add
treads and risers only.
To design the basic stair
1 Go to the Actionbar and switch to the Elements task.
2 Click Straight Stair (Stair task area). Use the dimensions in
the sketch.
3 After you have defined the parameters, click to open the
dialog box for the stair components:
Select the tread and riser on the Format, 2D tab.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |


1 12 Exercise 7: stepped wall Allplan 2022
You can select a different pen and line type for each of these
components in 2D and 3D.
This tab contains the 2D settings; the Geometry, 3D tab contains
the 3D settings.

Advanced 3D Unit 6: stairs – walls – ramps 113
4 Switch to the Geometry, 3D tab. You can select a pen and line
type for each of these components in 3D. In addition, you can
select a material and assign a custom surface for animation to
each component.
Use the Surface elements area to select the surface element
with which the component appears in sections.
Click the button to open the Section surface elements dialog
box. You can assign a Hatching style, Pattern, Fill, or Style Area
to each stair component. You can also choose to show or hide the
surface elements.

1 14 Exercise 7: stepped wall Allplan 2022
The resulting Geometry, 3D tab might look like this:
5 Open the Geometry, 3D tab and click the Stair Tread (this is
where you can also define the Nosing) and Riser buttons one
after the other. Define the parameters for the components in the
dialog boxes.
Use the values shown in the following illustrations.


## Sayfa 121

Advanced 3D Unit 6: stairs – walls – ramps 115
6 Confirm the dialog boxes by clicking OK. Then click Close. Click
Yes to confirm the following prompt.
This locks the parameters of the stair. You do not need to label
the stair.
7 As you need a copy of the stair in its current state, select
Copy, Move Elements between Documents (drop-down list
of the Allplan icon) and copy the stair to another drawing file. Do
not open this drawing file for the time being.

1 16 Exercise 7: stepped wall Allplan 2022
Converting the stair to architectural planes
The next step is to convert the component to a plane model. You will
create a 3D element based on the architectural components of the
stair. You will then convert this 3D element to architectural planes.
To convert the stair to architectural planes
1 Go to the Actionbar and switch to the Modeling task.
2 Click Convert Elements (Change task area) and select
Architecture, U-D element to 3D solids.
3 The quickest way to select the elements is to enclose them in a
selection rectangle.
Tip: If you fail to merge the
4 Click Delete (Edit task area) and delete the line of travel.
steps in a single operation,
merge the steps one by one
until the stair is a single solid
The stair now consists of 3D elements; the graphic has changed
accordingly.
5 To make further edits easier, merge the solids by using Union
(Boolean Operators task area). This results in a common 3D
element.

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |


Advanced 3D Unit 6: stairs – walls – ramps 117
6 Click 3D to Planes (Change task area) and convert the 3D
element to architectural planes.
7 Click Modify Format Properties (Change task area) and
change the format properties of the planes to, for example,
line type 9 and
line color 1 (black).

1 18 Exercise 7: stepped wall Allplan 2022
Designing a stepped wall
After you have converted the 3D elements to planes, you can use
these planes to define the height of a wall that rests on the stair that
you created at the beginning of this unit.
To design a stepped wall
1 Go to the Actionbar, switch to the Elements task, and select the
Wall tool (Components task area).
The bottom of the wall follows the course of the upper plane.
Therefore, define the bottom level of the wall so that it is 1 cm
from the upper plane. The top of the wall is at a constant height.
Therefore, lock the top of the wall to an absolute height instead of
attaching it to a plane.
Absolute
Höhe
Obere
Ebene
Choose a small thickness for the wall so that you can erect a glass
panel as a “wall” on the stair (see illustration at the beginning of
this exercise).

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |


Advanced 3D Unit 6: stairs – walls – ramps 119
2 Place the wall so that it is flush with the edge of the dashed
planes. The new component must be completely within these
planes.
Check the wall’s offset direction!
3 The original stair is in a different drawing file. Open this drawing
file to check the stair and the wall together.

1 20 Exercise 7: stepped wall Allplan 2022
What about the joint between the bottom of the wall and the stair?
Would you like to create a continuous joint? On the vertical edges
too?
Before you draw the wall, select Stretch Entities (Change task
area) and move the points of the planes away from the actual stair
by the joint width (as shown in the illustration):
dX = -1 cm
You can also do this later:
So that Stretch Entities (Change task area) changes only the
planes, use the Filter by Archit. Element Type tool (Filter task
area) and select Plane for the component.
You have modified only the planes. Therefore, the walls automatically
adapt to the new planes.

Advanced 3D Unit 6: stairs – walls – ramps 121
The following illustration shows the result:
If the new wall is a glass wall, animation works best:
• Open an animation viewport (select the F4 key) and use the
following tools, which you can find in the Visualization task or on
the shortcut menu of the animation viewport:
• Set Surface
• Set Project Light

1 22 Exercise 8: the ramp and the trick with the stair Allplan 2022
Exercise 8:
the ramp and the trick with the stair
Ramps are necessary parts of buildings for access to underground
parking. Ramps are also often used instead of elevators for people
with disabilities, serving as design elements as can be seen in famous
museums.
The following example shows how to design a garage ramp based on
a spiral stair. Here, too, you will see how a wall can adapt to the
component above or below it.
Art Museum in Wolfsburg,
Germany
Architects: Schweger +
Partner

Advanced 3D Unit 6: stairs – walls – ramps 123
Designing the ramp
Design the ramp by using the tools in the Stair task area. The ramp is
based on a Spiral Stair whose components get special definitions.
To design the ramp
 Actionbar: Elements task.
1 Design a Spiral Stair (Stair task area) with the following
parameters:
• Midpoint: Click any point.
• Radius: 5.00
This defines the inside radius.
• Starting angle: 0
Delta angle: 90
The ramp describes a quarter circle.
• Radius: 8.50
This defines the outside radius. Therefore, the lane width is 3.5
m.
The outline of the stair is visible on the screen. Define additional
parameters on the context toolbar.
The component is 1.2 m high. Therefore, the ramp has a slope of
about 15%.
2 Click the Spc Ch box to define the number of segments in the
arcs.

1 24 Exercise 8: the ramp and the trick with the stair Allplan 2022
3 By default, the program calculates the radius of the flight of stairs
50 cm from the inner edge. Here, the line of travel - LofT R - is in
the center of the lane. Confirm these values.
4 Enter the number of steps on another context toolbar. This value
defines the segmentation of the ramp, that is the ”smoothness”
of the lane surface. The last step is at the same height as the top
of the component.


## Sayfa 131

Advanced 3D Unit 6: stairs – walls – ramps 125
5 After you have defined the parameters, click to open the
Stair Components dialog box and select the Geometry, 3D tab.
6 The ramp consists of one component type – the center stringer.
Turn off the stair tread (it is on by default) and select the Center
stringer check box.

1 26 Exercise 8: the ramp and the trick with the stair Allplan 2022
7 Click the Center Stringer button to open the dialog box for
defining the properties of the center stringer.
8 Design the stringer so that it is 30 cm high and stretches across
the entire width of the stair. By defining the component in this
manner, you turn a stair into a ramp: The center stringer gets the
flight width and a meaningful height, which is the slab thickness of
the future ramp. Do not select any other stair components.

Advanced 3D Unit 6: stairs – walls – ramps 127
You have defined all necessary details for the ramp. Lock the
“stair” and view the result in isometric view.
Converting the ramp to architectural planes
This section briefly repeats the process of designing a stepped wall –
this time with a round outline.
Convert the spiral stair (ramp) to architectural planes. Based on
these planes, you will define the height of the wall later.

1 28 Exercise 8: the ramp and the trick with the stair Allplan 2022
To convert the ramp to architectural planes
1 Before you convert the ramp, copy it to another drawing file.
2 Go to the Actionbar and switch to the Modeling task.
3 Click Convert Elements (Change task area) and select
Architecture, U-D element to 3D solids. Enclose the ramp in a
selection rectangle.
Note: You can use the Copy, Convert Elements Across
Drawing Files tool (Change task area) to convert architectural
elements to 3D solids. Before converting the selected elements,
this tool copies them to another drawing file.
4 Click Delete (Edit task area) and delete the line of travel.
5 Use Union (Boolean Operators task area) to merge
everything.
6 Click 3D to Planes (Change task area).
7 Click Modify Format Properties (Change task area) and
change the format properties of the planes to, for example,
line type 9 and
line color 1 (black).

Advanced 3D Unit 6: stairs – walls – ramps 129
Creating walls for the ramp
Design two walls that meet different requirements:
• Wall A is under the ramp and rests on the inner edge; the top of
the wall follows the course of the ramp whereas the bottom of
the wall is at a constant height.
• Wall B rests on the outer edge of the ramp; its top and bottom
levels rise in parallel.
Wand B
Wand A

|  |  |  |
| --- | --- | --- |


1 30 Exercise 8: the ramp and the trick with the stair Allplan 2022
To create walls for the ramp
1 Go to the Actionbar, switch to the Elements task, select the
Wall tool (Components task area), and click Curved
Component on the context toolbar.
The bottom level must be at a fixed height of -30 cm.
2 Enter the curved wall as shown in the illustration:
Starting point: Click point 1.
To point: Click point 2.
Arc extension point: Click point 3.
Center of circle: Click point 4 while selecting and holding the Ctrl
key;
this aligns the point.
Check the wall’s offset direction. If it is not correct, change it by
clicking Reverse on the Wall Context toolbar.
Radius: 5.00; select the ENTER KEY.

Advanced 3D Unit 6: stairs – walls – ramps 131
3 You can draw wall B as follows:
• Use the same approach and draw wall B as a curved wall.
As the number of segments for the ramp planes can be
different from the number of segments for the curved wall,
make sure that the curved wall is completely within the
planes. Move the starting point and end point of the wall by 1
cm inward on the ramp and reduce the radius of the curved
wall accordingly (8.49 m). Here is an alternative:
• Draw a Polyline (Quick Access task area) along the outer
edge of the ramp. Based on this polyline, draw an entity-based
wall by means of the Entity-Based Component tool (see
exercise 9).
Use the following parameters for either approach:
The wall is 15 cm thick. The bottom level is flush with the upper
plane; the component height is 1 m.

1 32 Exercise 8: the ramp and the trick with the stair Allplan 2022
4 Finally, select the drawing file with the original ramp.

|  |  |  |
| --- | --- | --- |


Advanced 3D Unit 6: stairs – walls – ramps 133
Alternatives for creating ramps
The Stair task area provides two tools for creating ramps:
Straight Ramp
Spiral Ramp
These two ramps are SmartParts, which you can customize to suit
your needs by defining various parameters in palettes.

1 34 Exercise 8: the ramp and the trick with the stair Allplan 2022
The Modeling task - 3D Objects task area provides the following
tool:
Three-Point Canopy, Four-Point Canopy
By means of this tool, you can join components with a ramp by
matching existing points. The result is a 3D object, which you can
convert to planes or to an architectural element.
The Library palette contains two PythonParts for straight ramps
and spiral ramps each. You can find these PythonParts in the
Default\PythonParts\Architecture folder. Here, too, you can define
various parameters to customize the ramps to suit your needs and
requirements.


## Sayfa 141

Advanced 3D Unit 7: Experimenting with CAD 135
Unit 7: Experimenting
with CAD
CAD and designing is a much-discussed topic.
This unit shows how Allplan 2022 can effectively support
the design process.
You can use the 2D sketching tool to create sketches
based on lines of any shape, which you can then convert
to 3D elements using the tools provided by the
Components task area and Modeling task.
The 3D sketching tools make things a lot easier: You can
design and edit 3D objects freely and intuitively; Allplan’s
sophisticated concept of viewports helps you in every
way.

1 36 Exercise 9: from freehand lines to animation Allplan 2022
Exercise 9: from freehand lines to
animation
It is often argued that experimental work at the computer is very
difficult, because the system needs precise numeric information. The
fact that a computer actually does little more than crunch numbers
cannot be denied. However, ways of formulating design ideas in the
system without having to enter all too precise information about
length, height or material do exist.
The aim of the following exercise isn’t to achieve a design prize.
Rather, the exercise shows the methods that are available for
creative design work.
Work your way through the steps without worrying too much about
the result!
Digital sketches or scanned sketches
You can create simple sketches right on the screen. These can
consist of basic geometric entities like rectangles, circles and ellipses.
The computer translates the freehand input from the user into a
geometric entity with the closest resemblance: For example, an
approximate circle will become a circle – there’s no need to specify a
center or radius.

Advanced 3D Unit 7: Experimenting with CAD 137
To use the sketching tool
1 Select and hold the Alt key and click in the workspace.
Tip: To prevent the system The dialog box for selecting the QuickSketch mode opens.
from converting the
2 Click 2D QuickSketch.
freehand line, select the Alt
key while you are drawing.
As a result, your drawing
remains a sketching line.
3 Select and hold Alt+Ctrl and draw a circle with the left mouse
button (do not release the mouse button!).
The freehand line becomes a circle as soon as you release
Alt+Ctrl.

1 38 Exercise 9: from freehand lines to animation Allplan 2022
4 Draw a line that intersects the circle as shown in the illustration.
The system creates a straight line based on the freehand symbol.
You can resketch scanned sketches in the same manner. As an
alternative, you can design the required geometric shapes, for
example the circle, right on the template. Keeping the proportions is
particularly important at the beginning – this approach is best for
doing this.

Advanced 3D Unit 7: Experimenting with CAD 139
Quick edit
You will revolve the straight line about a point within the circle and
make 24 copies at the same time.
To revolve the line
1 Click Copy and Rotate (Edit task area).
2 Select the line, click the center of rotation and enter the number
of copies (24 in this example). Rotate is selected in the input
options. Accept the delta angle proposed by the system (the
system calculates the angle based on the division of a full circle by
the number of elements). This distributes the lines evenly over
360°.

1 40 Exercise 9: from freehand lines to animation Allplan 2022
Cutting elements
Next, you will modify the lines in such a way that they end on the
circle. In other words, you will delete protruding segments.
To cut elements along an outline
1 Click Cut with Element (Change task area).
This tool cuts all the lines at the point where they intersect the
circle.
2 Select the circle as the intersecting element.
3 Click Delete (Edit task area) and select the following option for
the selection rectangle: Select Elements Intersected (Work
Environment task area).
Tip: Don’t forget to set the
4 Open the selection rectangle so that it only intersects the line
selection option back to
segments beyond the circle.
Select Elements Based
on Direction (Work
Environment task area).

|  |  |
| --- | --- |
|  |  |


Advanced 3D Unit 7: Experimenting with CAD 141
Freehand curves with the “Spline” tool
You can also work “freehand” by using the Spline tool (Draft role
- Design task - 2D Objects task area). You can create any kind of
curve simply by placing a few points. Add a spline to the current
design.
From lines to components
A feature often requested by architects is the ability to seamlessly
transform line drawings into 3D elements or components. You can
also work out the details of an initial design idea step by step on the
screen:
Tip: The current settings
To create a wall from a spline
aren’t necessarily the final
ones. You can change  Actionbar: Architecture role - Elements task.
component parameters at
any time by selecting 1 Click Wall (Components task area) and select Entity-
Based Component.
Change Archit.
Properties (Change task 2 Set the following parameters:
area).
Wall thickness 0.30 m
Component height 3.00 m
Height of bottom level 0.00 m

1 42 Exercise 9: from freehand lines to animation Allplan 2022
3 Click the starting point and end point of the spline (1+2). Check the
wall’s offset direction!
Creating walls from lines
Now use this method to create components from the radial lines.
These will serve as the roof structure over the curved wall.
To create walls from lines
1 Click Create Walls from Lines (Components task area).
This tool generates components from straight lines.
2 Set the following parameters:
Wall thickness 0.12 m
Component height 0.20 m
Height of bottom level 3.20 m
3 Set the following option for the selection rectangle: Select
Elements Fully Bounded (Work Environment task area).

Advanced 3D Unit 7: Experimenting with CAD 143
4 Select the lines by enclosing them in a selection rectangle.
Although the circle is within the selection rectangle, it is not
selected, because it cannot be processed by this tool.
5 Click beside a line in the workspace to specify the offset direction.
As you have seen, you have turned a freehand line into a component
in few, relatively uncomplicated steps and without the need for
“precise” points and parameters.

1 44 Exercise 9: from freehand lines to animation Allplan 2022
Animation
Studies like these can be used to replace the working model in a lot of
cases – in particular, because the effects of the design in three
dimensions can very easily be verified in animation. Changes and
"what-if scenarios" are thus very easy to visualize.
Select the F4 key to open the Animation Window.


## Sayfa 151

Advanced 3D Unit 7: Experimenting with CAD 145
Exercise 10: modeling intuitively – three-
dimensional sketches
The first chapters showed you how to model regular 3D objects
using the tools provided by the Modeling task. The first part of this
unit shows how to create outlines of any shape with just a few lines
and mouse clicks.
Allplan 2022’s 3D QuickSketch mode, which combines these two
drafting and design methods, provides an intuitive way of drawing
and modifying 3D solids and 3D surfaces.
The 3D QuickSketch mode is particularly useful for landscape
design, open-space planning and volumetric models in urban
planning. In urban planning, regular boxes or cylinders usually
represent existing structures, whereas freeform volume solids are
used in initial design concepts drawn up by urban planners.
Other applications include designs of organic architecture or the
intuitive shaping of solids, which can be created with the tools
provided by the Modeling task.

1 46 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
Custom designs
Various rendered images
including reflection,
transparency, lighting and
shadows

Advanced 3D Unit 7: Experimenting with CAD 147
Task: redesigning a schoolyard
Initial situation
An underground garage is added to a school. As the parking space is
no longer required, the schoolyard can be enlarged – a small open-air
theater is planned. Now it's your turn! In this exercise, you will create
a model and presentation of a small amphitheater.
Approach
First draw a foundation slab. If you want, you can use a site plan as
the basis by opening the drawing file with the site plan in reference
mode.
Based on this slab you model some steps in the terrain, which serve
as rows of seats, and create a stage, which is sunk in the foundation
slab. Then you add freeform walls, steps and other design elements
to the model.

1 48 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
Adjusting the user interface
To adjust the user interface
1 Go to the Quick Access Toolbar, open the Window drop-down
list and click 3 Viewports.
This divides the workspace into three viewports: Plan,
Front, South Elevation and Front Right, Southeast
Isometric View.
2 Deactivate the Connected option ( Window drop-down list on
the Quick Access Toolbar).
3 Open an animation viewport (just select the F4 key) so that you
can check the model at any stage in the design process.
4 Reduce the animation viewport so that it is approximately half of
the isometric viewport and move the animation viewport to a
position where it does not interfere with your work.

Advanced 3D Unit 7: Experimenting with CAD 149
Designing the foundation slab
To design the foundation slab
1 Switch to the Modeling task.
2 Select a suitable color (Properties palette) and draw a Box
(3D Objects task area) of the following dimensions:
x = 30
y = 30
z = -2

1 50 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
• Select and hold the Alt key and click in the workspace with the left
mouse button to open the dialog box for selecting the
QuickSketch mode.
• Use Alt+left mouse button to draw outlines of any shape.
• When you select Alt+Ctrl, the program tries to convert the sketch
to a regular outline (line, rectangle, circle). While you are drawing,
the outline appears blue.
• You can work in plan, elevation or isometric view.
• When you create a new solid or make modifications using Stretch
3D Surface or Pierce 3D Surface, the height always comes from
the surface (of the solid) where you start sketching. The height is
always interpreted as a value perpendicular to this surface.
Modeling intuitively
To model intuitively
1 Select and hold the Alt key and click in the workspace.
The dialog box for selecting the QuickSketch Mode opens.
2 Click Create 3D Object.

Advanced 3D Unit 7: Experimenting with CAD 151
Tip: When you select and 3 Select a suitable color (Properties palette), select and hold the Alt
hold Alt+Ctrl, the program key and draw the outline of the first step on the foundation slab.
converts the freehand This step also serves as a row of seats.
outline to a regular shape
(line, rectangle, circle). While
you are drawing, the outline
appears blue.
4 Release the Alt key and the left mouse button and enter the
Height of the step (= height of the seats) in the dialog line:
0.5 m
The 3D object gets the color selected in the Properties palette.

1 52 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
5 Repeat steps 3 and 4 to draw two additional steps at the same
height. Always begin within the outline of the step you created
last.
Tip: You can use The program calculates the height of the existing 3D object,
Measure Length adding the height entered for the new object to the height of the
(Measure task area) to existing object and finally places the new object at the new
check the proportions. height.
->
->
6 The next step is the stage, which you create within the
foundation slab so that the stage is 0.5 m deep. Select and hold
the Alt key and click in the workspace.
The dialog box for selecting the QuickSketch mode opens again.

Advanced 3D Unit 7: Experimenting with CAD 153
Tip: You can use the Slope 7 Click Pierce 3D Surface.
and Pierce 3D Surface
option to assign a slope of
45° to the edges.
8 Select and hold the Alt key and draw the outline of the stage on
the foundation slab.
9 Release the Alt key and the left mouse button and enter the
Height of the stage in the dialog line:
-0.5 m

1 54 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
This cuts the stage out of the foundation slab.
10 Model a wall behind the stage. This wall is 2.5 m high and serves as
a backstage area for the actors.
Select and hold the Alt key, click in the workspace and select
Create 3D Object.


## Sayfa 161

Advanced 3D Unit 7: Experimenting with CAD 155
11 Select a suitable color (Properties palette) and draw the outline
of the wall while selecting and holding the Alt key.
Release the Alt key and the mouse button and enter a height of
2.5 m in the dialog line.
->
12 Draw a curved wall on the top step in the terrain.
->
Tip: When you select and 13 Select Cut 3D, switch to the viewport with the front elevation
hold Alt+Ctrl, Cut 3D and draw some peepholes and a larger opening, which is to serve
produces round or as a door, in the wall just created.
rectangular outlines of
Note: Cut 3D cuts the 3D object along the outline; the
openings.
intersecting solids, however, remain unchanged.
Right-click in the workspace. Select Delete on the shortcut
menu and delete the intersecting solids from the wall.

1 56 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
-> ->
14 Select Pierce 3D Surface, switch to plan view, select and hold
Alt+Ctrl and draw some rectangular treads at a height of -0.25 m
in the terrain and in the foundation slab.
Note: Make sure that you start within the solid that is to be cut
out (see arrows in the illustration). The system always makes the
”hole” within the solid where you start sketching.
-> ->

Advanced 3D Unit 7: Experimenting with CAD 157
15 The top of the curved wall is not planar. Rather, it gets a freeform
outline. To do this, select Stretch 3D Surface.
16 Switch to isometric view, select and hold the Alt key and click one
of the upper surfaces of the wall. Hold the left mouse button and
draw a line upward.
This drags the entire upper surface upward, heightening the wall
accordingly.
-> ->
17 The next step is to cut the wall along an outline.
Select Cut 3D, switch to the viewport with the front elevation,
select and hold the Alt key and draw the outline.
Tip: When you select and
hold Alt+Ctrl, Cut 3D
produces straight cutting
lines.

1 58 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022
This cuts the wall along the outline.
->
18 Delete the wall section that is not required.
->

Advanced 3D Unit 7: Experimenting with CAD 159
19 If you want, you can now experiment with the sketching tools.
Try out different design studies. For example, you can modify the
terrain or add columns. There is no limit to creativity!
Finally, you can integrate the small theater in a volume module.
The result might look like this:

1 60 Exercise 10: modeling intuitively – three-dimensional sketches Allplan 2022

Advanced 3D Appendix 1: modeling in detail 161
Appendix 1: modeling in
detail
Taking a lamp as an example, the following chapter
deepens your knowledge of three-dimensional modeling
- a creative and fascinating aspect of Allplan 2022.
Some basic shapes and a few design principles - that's all
you need to model almost all three-dimensional shapes.
This appendix is for practice so that you can reproduce
what you have learned and return to points of interest.
You should already be familiar with the basic concepts.
For this reason, not every step is described in detail.

1 62 Exercise 11: modeling a wall lamp Allplan 2022
Exercise 11: modeling a wall lamp
Based on a small example, this chapter expands on the basic
principles and options of the tools in the Modeling task – ranging
from creating and modifying basic shapes to converting 2D designs
to 3D elements.
Due to their various applications, the tools in the Modeling task
support you throughout the entire design process – from the first
line to complex details.
A collection of lamps

Advanced 3D Appendix 1: modeling in detail 163
Objective
The lamp on the left side is the objective of this exercise.
To model this lamp, you will use the tools in the 3D Objects task area
of the Modeling task.
Basic 3D elements
The following basic 3D elements are available: 3D line, various
surfaces of different shape, and basic solids like box, sphere, and
cylinder.
Thanks to Allplan’s simple and clear structure, the process of creating
these basic elements is easy to understand. For this reason, the
following section briefly introduces just a few of these tools.
Cylinder
Cylinder
Input options: Select Circle based on center.
Midpoint: Click anywhere in the workspace.
Radius: Enter the radius as a numeric value, for example, 0.04.

1 64 Exercise 11: modeling a wall lamp Allplan 2022
Tip: To enter the cylinder, You have defined the base of the cylinder.
switch to 3 Viewports Height: 0.175
( Window drop-down list
In this example, the base of the cylinder is in the xy plane; that is, it is
on the Quick Access
not tilted.
Toolbar). This is the easiest
If the base is not parallel to the xy plane, you can check this by
way to tilt the base of the
defining an edge point. If the edge point is not at the same height (z-
cylinder.
coordinate) as the midpoint, the base is inclined. It is best to define
edge points in isometric view.
You have designed the basic solid (see the illustration on the left
side).
You can define the base of a cylinder in three ways:
• Radius
• Edge point
Click in the workspace to define the radius.
• Point on existing edge
The base is defined by the midpoint and the tangent to the circle.
Tip: Copy intermediate
results so that you can fall
back on them.
Base defined by edge point (left) and existing edge (right)
Note: Always add lines and points in construction-line format to 3D
elements so that you can use reference points when you edit the 3D
elements later. This particularly applies to cylinders.
To place a 3D point, select the 3D Line tool and click the same point
twice.


## Sayfa 171

Advanced 3D Appendix 1: modeling in detail 165
Rectangular surface
The ends of the cylinder are inclined. Start by creating an auxiliary
rectangle that is parallel to the xy plane:
Rectangular 3D Surface (on the toolbar of the 3D Surface
tool)
Define the rectangle by clicking two diagonal points. In this example,
the rectangle circumscribes the base of the cylinder. Use the track
line to make sure that the left edge of the rectangle touches the
cylinder. Switch the view while working in 3D:
Front Right, Southeast Isometric View
Editing 3D elements
Moving the 3D element
The rectangle and the base of the cylinder are still at the same height.
Move the rectangle by 17.5 cm in the z-direction:
Move
Rotating the 3D element
Rotate
Rotate the rectangle by 45°. The axis of rotation is the edge of the
rectangle that touches the cylinder.
Click Freely in 3D in the Input Options.
Select the rectangle and define the first point and the second point of
the axis of rotation (1+2). The rotation angle is 45°.

1 66 Exercise 11: modeling a wall lamp Allplan 2022
Slicing the 3D element
Slice
First select the cylinder to identify it as the element that you want to
slice. Depending on the setting in the Input Options, define the slicing
plane by selecting a surface or by clicking three points or two
points and an edge. If you want, you can place these points in
construction-line format in advance.
In this example, you can use the rotated 3D rectangle as the slicing
plane. Just click the three corners (1+2+3).
Delete the rectangle and the section of the cylinder that you just cut
off.
Mirroring the 3D element
To mirror the modified cylinder, switch to elevation view. Select
Copy and Mirror
Select the cylinder. The cylinder’s base line is the mirror axis (1+2).

Advanced 3D Appendix 1: modeling in detail 167
Solid models solid
The Boolean Operators task area contains tools that you can use to
model 3D elements by means of other solids. For example, you can
merge two solids, subtract and remove solids from one another, or
create a third solid from the common volume of two solids.
To merge the two parts of the lamp, use
Union
Click the elements and confirm by right-clicking
To turn the cylinder into a tube, cut out a smaller cylinder.
To do this, design the second cylinder. Its radius is the same as the
radius of the first (= existing) cylinder minus the thickness of the
lamp, for example, 0.036 m.
Switch to plan view and move the two cylinders on top of one
another so that their midpoints are superimposed.
You create a tube by subtracting the inner cylinder from the outer
cylinder and deleting the inner cylinder afterward. To do this, use the
Subtract and Remove Solid
tool. First click the solid that you want to retain and then click the
solid that you want to subtract and delete.
You have designed the basic shape of the glass tube.

1 68 Exercise 11: modeling a wall lamp Allplan 2022
Solid based on 3D lines and 3D surfaces
From 2D to 3D
2D drafts make it much easier for you to design 3D elements. Use
simple elements like lines or circles to draw the basic shape of the
future solid.
Create the lamp holder - an aluminum strip - as a 2D draft.
Use the drafting tools (for example, in the Quick Access task area of
the Elements task) to draw the floor plan of the holder as a simple
Outline consisting of outline. Draw the section through the holder as shown in the
individual lines illustration. Pay attention to the material thickness. Define the
diameter so that it is somewhat larger than the outside diameter of
the existing tube.
When you are satisfied with the result, you can convert the 2D
elements to 3D.
The Change task area contains the
Convert Elements tool (2D to 3D lines, 3D curves option).
If the elements to be converted are in the same (current) drawing
file, confirm the prompt. Define the lines representing the floor plan
of the holder as a common 3D element; convert the section
Section through holder
separately. Confirm the predefined number of segments: The
greater the number of segments, the smoother the result.
When you switch to isometric view, you can see that the lines have
become 3D elements.
Extruding along a path
A profile moves along a path, thus describing the shape of a new 3D
element.
In this example, the line representing the floor plan is the path and the
section is the profile. First, position the profile so that it can move

Advanced 3D Appendix 1: modeling in detail 169
along the path; that is, move the section to the floor plan of the
holder.
Move the profile to a starting point of the path (1+2). If the path is
closed, you can place the profile anywhere along the path. Then set
the profile upright. Define the axis of rotation as shown in the
illustration and enter a rotation angle of 90°.
3 Rotation axis 4 Path 5 Profile
Everything is ready now. Select
Extrude Along Path
Select the profile and then the path. Allplan computes the solid.
Important step-by-step instructions for 3D designs:
1. Create a 2D draft (floor plan and section or elevation)
2. Convert the 2D elements to 3D
3. Rotate the section or elevation so that it is correctly
positioned in relation to the floor plan

1 70 Exercise 11: modeling a wall lamp Allplan 2022
We recommend that you check the solid in animation:
Finally, merge the two parts. Switch to plan view and move the glass
cylinder onto the holder. Correct the height of the element in the
elevation.
The resulting lamp is 35 cm high. If you want, you can modify the
lamp with just a few mouse clicks. This results in a 70-cm lamp with
two holders:

Advanced 3D Appendix 1: modeling in detail 171
Modifications
Stretching entities
By using the Stretch Entities tool, you can lengthen the solid quickly
and easily. Switch to elevation view and select
Stretch Entities
Stretch the two ends of the glass cylinder upward and downward by
17.5 cm (1+2). Do not change the size of the holder.
Move the holder by 6 cm in the z-direction (3):
Move Delta point
Then copy the holder downward by 12 cm (4):
Copy

1 72 Exercise 11: modeling a wall lamp Allplan 2022
A tool that modifies all points of a 3D element is
Resize
You can use this tool to quickly change the proportions of basic
elements such as the lamp. After you have defined the fixed point,
you can resize the element in the x-direction, y-direction, and z-
direction. You can enter a different resizing factor for each direction.
Resize 3D Entities
This tool resizes 3D entities based on the ratio between two lines,
adjusting the initial line to the destination line. As an alternative, you
can enter the resizing factor and the resizing direction.
Select the elements that you want to resize. Define the fixed point by
clicking a corner or end point of a solid.
To resize based on the ratio between two lines, specify the starting
point and end point of the initial line and then the starting point and
end point of the destination line. To resize based on a resizing factor,
define the resizing factor and the resizing direction by clicking two
points.
Design aids
As orientation in 3D space can sometimes be difficult, Allplan 2022
provides various options for marking relevant points. This section
briefly introduces three tools.
Imagine the following situation: A 3D line pierces a surface. To mark
the exact point of intersection, you can use the following tool:
Intersect Line, Plane
Centers of any kind are particularly important to details like node
points of railings:
Surface’s Center and Center of Gravity

Advanced 3D Appendix 2: stairs and ramps in detail 173
Appendix 2: stairs and
ramps in detail
This chapter expands on the topic of stairs and ramps.
You get an overview of various stair types such as u-
type stairs and ramps.
To deepen your knowledge, this chapter once again
explains the necessary steps for creating stairs and
defining stair components.
This appendix is for practice so that you can reproduce
what you have learned in unit 6 and return to points of
interest. You should already be familiar with the basic
concepts. For this reason, not every step is described in
detail.

1 74 Exercise 11: modeling a wall lamp Allplan 2022
Top: "Ghorfa“, storehouse, Medenine, Tunisia
Bottom: Art Museum, Helsinki, Finland, Architect: Steven Holl


## Sayfa 181

Advanced 3D Appendix 2: stairs and ramps in detail 175
Exercise 12: stairs
Designing stairs in Allplan 2022 is really easy because the procedure
for creating a stair is always the same:
First, select the stair type and define the stair outline. Then, enter the
height.
Based on these entries, Allplan proposes a basic stair design whose
parameters you can adjust to suit your needs.
To design a stair, go to the Actionbar, select the Architecture role,
open the Elements task, and select the Stair task area.

1 76 Exercise 12: stairs Allplan 2022
Task 1: straight stair
The easiest way to understand the design principles for stairs is to
look at a straight, single-flight stair:
Straight Stair
Tip: Switch to 3 Viewports
First, define the outline of the stair. In this example, enter a rectangle
so that you can check the of 1.2 x 4 m.
stair right from the start.
Enter the corners one after the other; start with the first point of the
stringer at the bottom step (1+2+3+4).
After you have entered these four points, you can define the position
of the stair's line of travel by entering the offset to a reference
stringer on a context toolbar. In addition, define the story height and
confirm.

Advanced 3D Appendix 2: stairs and ramps in detail 177
Stair - geometry
The basic version of the stair appears on the screen.
You can now customize the basic settings to suit your needs: height,
rise, tread, number of steps - to name but a few.
You can change each of these values, which are mutually dependent.
Consequently, when you change one value, the other ones adapt
accordingly.
If, for example, you change the number of steps, the rise and tread
will adapt immediately. If possible, Allplan creates the stair based on
the tread-to-riser ratio. But you can also change the tread-to-riser
ratio to create special stair designs if there is little space.
The definition of the last step is important: Is the top step at the same
height as the story or one rise below? Use the Top Step box to
define this.
Click to define the properties of the stair components.
The Stair Components dialog box appears.

1 78 Exercise 12: stairs Allplan 2022
Format, 2D tab
Use the "Format, 2D" tab to define the components that make up the
stair. To do this, select the check boxes of the required components.
The other parameters on this tab define how the stair looks in 2D.
You can select a different pen, line type, and layer for each of these
components in 2D.
The single-flight stair gets stair treads with an undercut that are
attached to a center stringer. In addition, the stair requires handrails
on both sides.

Advanced 3D Appendix 2: stairs and ramps in detail 179
Geometry, 3D tab
Switch to the "Geometry, 3D" tab to geometrically define these
components. Click the buttons of the individual elements.
Note: In addition, you can use the Geometry, 3D tab to select a
different material for each of these components and define how
these components look in sections, 3D, and animation.
You can enter the component parameters in dialog boxes with
graphics. Just click in the required box and enter the new value.
This illustration shows the modified Center Stringer dialog box:

1 80 Exercise 12: stairs Allplan 2022

Advanced 3D Appendix 2: stairs and ramps in detail 181
Tip: If you do not want to To complete the stair design, confirm the prompt by clicking Yes.
Check the result in elevation or isometric view.
place a label, close the tool
by selecting the ESC key. If you want to edit the stair after you have completed it, you can use
the following tool to change all parameters of the stair:
Modify Stair
Section in plan
To display the stair so that it is graphically correct in plan view, use
Section in Plan
Click the stair’s line of travel and define the settings for the
Representation at top and Representation at bottom:

1 82 Exercise 12: stairs Allplan 2022
Define the section line. The representation of the stair changes in
plan view, but the model does not change.

Advanced 3D Appendix 2: stairs and ramps in detail 183
Task 2: spiral stair along a curved wall
Financial Institution in Paris
Architects
Pierre Merz
Dominique Leverd
Bruno Lestiboudois,
Paris
Based on a more complex example, this task expands on the topic of
stair design. Think of the following situation: In an old tower, you want
to create a spiral stair along a curved wall and fit this spiral stair into
an existing slab opening.
This task requires some preparations, which are briefly described in
the following section. Start by creating the curved wall, slab, and slab
opening.

1 84 Exercise 12: stairs Allplan 2022
Preparations - step 1: draw the floor plan
Open a new drawing file. Actionbar: Architecture role - Elements
task. Click Wall.
Click Properties and define the parameters as shown:
Draw the following floor plan:


## Sayfa 191

Advanced 3D Appendix 2: stairs and ramps in detail 185
Preparations - step 2: draw the curved wall
Select the
Wall tool and draw a Curved Component.
Define the height as follows:

1 86 Exercise 12: stairs Allplan 2022
The bottom level of the wall is flush with the lower plane. The slab
thickness is 12 cm. Consequently, define the top level so that it is 12
cm below the upper plane.
Open the Wall dialog box and select a wall thickness of 11.5 cm and a
hatching style for brickwork.
After you have defined all settings, you can create the curved wall.
Place it in the middle of the tower’s room.
Click on the Wall Context toolbar to change the wall’s offset
direction.
• From point (1)
To point (2)
Define the starting point and end point of the wall.
• Arc extension point (3)
Two directions are possible. In this example, click above the points
you just defined.
• Third point or element or radius (4)
When you click a point on the auxiliary line, the preview of the wall
changes. Try out different points until you are satisfied with the
wall’s shape. Confirm the radius (approximately 1.5 m) by
selecting the ENTER key.
You have designed the curved wall.

Advanced 3D Appendix 2: stairs and ramps in detail 187
Preparations - step 3: draw beams
Drawing beams
The slab does not completely cover the ground floor of the tower.
Consequently, you need beams. You will place a floor slab over these
beams later. This slab acts as a gallery.
Start with the beams:
Downstand Beam, Upstand Beam
First, define the height. Have a look at the following sketch: The
bottom level of the beam is exactly 30 cm below the lower default
plane. The height of the beam is 18 cm; its width is 12 cm.
After you have defined the other parameters as usual, start placing
the beams. Designing beams works just like designing walls: Define
the starting point, end point, and offset direction. Use the reference
point to place the beams.

1 88 Exercise 12: stairs Allplan 2022
Preparations - step 4: draw the gallery as a slab
Tip: Elements in reference
Turn on Construction line (Properties palette) and create a small
drawing files appear in a
draft consisting of lines and a spline or an arc. Then, turn
different color when you
Construction line off again and select
have selected the
corresponding option on the
Slab
Display page of the
Options. Define the height settings for the slab:

Advanced 3D Appendix 2: stairs and ramps in detail 189
The top level of the slab is flush with the upper plane. Define the
thickness of the slab as a fixed component height of 12 cm.
The next step is to enter the outline of the slab by means of the
polyline entry tools:
Start with the corners of the slab polygon (1+2). Then click the front
edge of the curved wall (3), which Allplan usually detects
automatically (otherwise, select Polygonize entire element in
the input options). After you have clicked the last corner (4), select
ESC to finish entering the slab outline.
You have designed the floor slab. To avoid confusion, the illustrations
show the beams as dashed lines.

1 90 Exercise 12: stairs Allplan 2022
Preparations - step 5: draw the slab opening
Create the ”hole” for the spiral stair.
Here, too, use construction lines. Draw an arc that exactly matches
the line on the inside of the curved wall on the ground floor (a).
Use the
Parallel to Element
tool to create a second construction line (b) at an offset of 0.9 m.
Then join the two arcs with lines (c+d).
Turn off Construction line and select
Recess, Opening in Slab
First, you are prompted to select the slab in which you want to create
the opening. Click the slab.
Choose the Opening type in the Recess, Opening in Slab dialog box.
You can find various basic shapes in the Outline area. These shapes
are particularly useful for placing plumbing pipes.
To create special designs, you can select the freeform shape:

Advanced 3D Appendix 2: stairs and ramps in detail 191
Select Area detection (input options) and click inside the polygon
consisting of construction lines.
Allplan immediately creates the slab opening.
Tip: Just select the F4 key or
choose the Animation view
type on the viewport
toolbar - this is the quickest
way to check your design!

1 92 Exercise 12: stairs Allplan 2022
Designing the spiral stair along the curved wall
The shape of the stair is already defined by the two arcs
representing the stringers and the two lines representing the
bottom and top of the stair. Make an empty drawing file current and
select
Spiral Stair
Tip: First, enter the midpoint of the two arcs (1). This point is still visible
As an alternative, you can due to the design in construction-line format for the slab opening.
also define the midpoint of
Then define one of the stringers. To do this, enter the radius
the arcs based on the point graphically by clicking (2) and select the starting point and end point
of intersection between the of the arc (3+4).
two lines representing the Make sure that you apply the delta angle describing the arc in a
bottom and top of the stair:
counterclockwise direction. The second stringer is defined by the
radius (5).
Point of intersection
Change the parameters on the context toolbar.

Advanced 3D Appendix 2: stairs and ramps in detail 193
Correct the radii of the two arcs and the line of travel.
Define the stair components by selecting the stair tread, riser, and
outer handrail.

1 94 Exercise 12: stairs Allplan 2022
Tip: Click Confirm the settings in the Riser dialog box and complete the stair
design.
Hidden Line Image,
Wireframe and increase the
maximum angle.
This makes the handrail
"smoother".


## Sayfa 201

Advanced 3D Appendix 2: stairs and ramps in detail 195
Task 3: freeform stairs
Asymmetrical stairs, stairs with nonparallel stringers, or stairs with
freely designed landings – there are numerous examples of stairs
that are based on outlines of any shape.
The following example shows how to create a stair along a custom-
designed wall. This task requires a wall that looks like the one in the
illustration. Create this wall as a spline-based wall.
The line delimiting the stair outline on the left and the lines
representing
the bottom and top of the stair are simple 2D elements.
To design a stair based on this outline, select
Free-Form Stair
You can create stairs of this type in two ways: You can enter the
outline of the stair point by point as a polyline, or, as shown here, you
can use area detection, which automatically detects and selects the
closed polyline of the draft.

1 96 Exercise 12: stairs Allplan 2022
Area detection
Go to the input options and select
Area detection
Just click inside the polygon representing the stair (1). Allplan
automatically detects the outline of the closed polyline.
When creating freeform stairs, you must also define the line of travel.
Position the line of travel 50 cm from the left stringer (2+3) as shown
in the illustration.
You can see the following parameters on the context toolbar:
• Starting angle: defines the angle of the bottom step.
• Rotation angle: defines the delta angle between the front edge of
the bottom step and the rear edge of the top step.
• Arc: defines the fillet radius for the flight of stairs; enter 0 if you do
not want to fillet the flight.
• Define the Height of the component as usual.

Advanced 3D Appendix 2: stairs and ramps in detail 197
You can now define the parameters of the stair components, such as
stair treads, risers, stringers, and handrails.
In addition, the Stair Geometry Context toolbar provides some
additional options that you can use to adapt the stair to your needs
and requirements:
Change and lock step angle
You can change the angle of individual steps:
Move points on outline
You can change the outline of the stair by moving points:

1 98 Exercise 12: stairs Allplan 2022
Line of travel
Move auxiliary point of line of travel You can reposition
the line of travel.
Lock the stair when you have defined all settings.
Elevation view Plan view Isometric view

Advanced 3D Appendix 2: stairs and ramps in detail 199
Exercise 13: ramps
Task: ramp based on u-type stair
To design a ramp, you can use the same tools as for stairs.
The ramp is a special type of stair that consists of one component
type – the center stringer. By increasing the width of this
component, you turn a stair into a ramp. That’s all! You do not need to
define steps.
The following example shows how to create a ramp with a landing for
people with disabilities. Therefore, you must define the rise and width
accordingly. This ramp is based on a
U-Type Stair
Enter the outline of the stair. Keep in mind that the first and last
points you enter define the bottom step of the stair. Use the
dimensions in the following sketch (1-8):
After you have entered the outline, you can see a context toolbar
where you can change the position of the line of travel. Lock the
height to 1.40 m.

2 00 Exercise 13: ramps Allplan 2022
Define the geometric parameters as follows: Enter 30 for the
number of steps below and above the landing. This defines the
segmentation of the ramp: The greater the number of steps, the
smoother the ramp. Define the settings as shown in the illustration:
These entries lock the rise of the stair; you can now turn the stair into
a ramp.
For the stair components, select only the center stringer ...

Advanced 3D Appendix 2: stairs and ramps in detail 201
... and define its width and thickness:
It is important that the center stringer stretches across the entire
width of the stair (see illustration). In this case, the height of the
center stringer represents the slab thickness of the ramp.

2 02 Exercise 13: ramps Allplan 2022
Confirm the design and check the result in elevation or isometric
view.

Advanced 3D Index 203
Index
creating 3D object (3D sketching
2
tool) 150
2D sketching 136 cuboid 18
3 curved wall 123, 184
custom outline of opening 76
3D cutting (sketching tool) 150 saving as a symbol 77
3D elements 14
custom outline of window 76
3D line 18 saving as a symbol 77
3D modeling cut with element 140
intuitive 150 cylinder 40, 163
3D modeling, in detail 161
D
3D sketching 150
3D cutting 150 delta point 171
basic rules 150 dormer 90
creating 3D object 150
E
piercing 3D surface 150
stretching 3D surface 150 ellipse 11
entity-based wall 141
A
extruding 20
area calculations 101
F
attic 18
freeform wall 27
C
freehand line 136
center of gravity 172 function() 9
changing archit. properties 40
G
changing outline 196
convert line to wall 142 galleries 184
converting 2D to 3D 11 gravel stop 18
converting 3D to planes 40
I
converting architectural
elements to 3D 37 intersect line/plane 172
converting design entities to 3D intuitive modeling 150
11 L
converting elements
3D to planes 40 lists/schedules 51
architectural elements to 3D M
37
modifying 171
copy and mirror 166
points 171
copying
moving 171
mirrored 166
3D element 165

2 04 Index Allplan 2022
spiral stair 123, 183, 192
O
splaying of wall 65
outline auto-detect 27 spline-based wall 141
P stair 110, 175
component overview 178
parabola 9
freeform 195
parallel line 184 modifying 179
piercing 3D surface (sketching parameter definition 177
tool) 150 stair section 181
plane cylinder 40
step angle 196
polyline 18 stepped wall 110
polyline sweep solid 168 straight ramp 133
Q straight stair 176
component overview 178
quantity takeoff 51
modifying 179
R parameter definition 177
stretching 3D surface (sketching
ramp 123, 199
tool) 150
alternatives 133
stretching entities 171
converting to architectural
subtract and remove solid 167
planes 127
surface’s center 172
recess, opening in slab 184
rectangular surface 165 T
resizing 171
three-point canopy, four-point
roof covering 107
canopy 133
roof frame 90
room 101 U
rotating
union 92, 167
3D element 165 useful aids 172
rotating 3D elements 14 u-type stair 199
S
W
sketching tools wall 184
2D 136 creating based on a spline 141
3D 150 creating based on lines 142
3D cutting 150
entity-based wall 141
creating 3D object 150 sloping 51
piercing 3D surface 150 splaying 65
stretching 3D surface 150 wall opening 51
slab opening 184
window 51
slabs 184 wireframe model 27
slicing
3D element 166
slicing 3D element 166
sloping wall 51
smart symbol designer 76
spiral ramp 133

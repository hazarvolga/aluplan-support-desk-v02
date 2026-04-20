---
title: "Allplan 2021 StepsToFacade"
category: User_Guides
source: Allplan_2021_StepsToFacade.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2021
Facade

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
1st edition, January 2021
Document no. 210eng01s62-1-BM0121

Steps to Success

Contents

i

Contents
Welcome! ............................................................................................. 1
Basics .................................................................................................... 3
Advantages .................................................................................................................... 3
BIM ................................................................................................................................................3
Intelligent facades .............................................................................................................. 4

Quick reference guide .............................................................................................. 5
Exercise .....................................................................................................................................5
How to create a facade - basic steps ......................................................................6
Overview of steps ............................................................................................................14

Getting ready ................................................................................... 15
Training data on the internet .............................................................................. 15
Downloading the training data...................................................................................15
Contents of the training project ...............................................................................16

Importing the training project ........................................................................... 16
Selecting the drawing file ......................................................................................17

Step 1: creating a facade across corners ........................... 19
Objective ........................................................................................................................ 19
Defining subdivisions for the facade ............................................................ 20
Predefined facade favorites.............................................................................. 24
Drawing the facade................................................................................................. 25
What if my facade is not transparent? ................................................................32

ii

Contents

Allplan 2021

Step 2: displaying additional favorites ............................... 37
Objective ....................................................................................................................... 37
Modifying the facade ............................................................................................. 38

Step 3: creating a spline-shaped facade .......................... 39
Objective ....................................................................................................................... 39
Alternative 1 .................................................................................................................40
Defining subdivisions..................................................................................................... 40
Drawing the facade .........................................................................................................42
Defining vertical subdivisions later ........................................................................52

Alternative 2 ................................................................................................................ 54
Creating a facade with subdivisions......................................................................54
Adjusting the facade to the basic grid.................................................................. 67

Step 4: inserting opening elements .................................... 73
Objective ....................................................................................................................... 73
Combining fields ........................................................................................................ 74
Assigning objects ............................................................................................................. 76

Step 5: applying objects to the exterior ........................... 79
Objective ....................................................................................................................... 79
Placing surface objects regularly ................................................................... 80
Excursus: face coordinates ................................................................................ 83
Placing linear objects regularly ........................................................................ 85

Step 6: converting the 3D geometry into a facade ...... 91
Objective ........................................................................................................................ 91

Steps to Success

Contents

iii

Creating a sloping glass surface as a skylight ........................................ 92

Excursus: converting a facade into 3D geometry........ 97
How to do this .............................................................................................................97

Step 7: placements ...................................................................... 101
Objective ...................................................................................................................... 101
Creating facade surfaces for panels .......................................................... 102
Creating facade surfaces for windows .................................................... 109

Appendix: designing your own facade .............................. 115
Objective .......................................................................................................................116
Getting ready..............................................................................................................117
Important explanations ........................................................................................119
Start z-values relative to path (reference line) ............................................119

Creating face objects .......................................................................................... 120
What if the facade is not visible in plan view? ................................................128

Creating linear objects ........................................................................................ 130
Creating point objects ......................................................................................... 134
Creating point elements - bolt element ........................................................... 143
Creating point elements - connecting element ...........................................152

Saving the facade as a favorite ..................................................................... 156
Retrieving facades saved as favorites...............................................................161

Analyses with reports ......................................................................................... 162

Index .................................................................................................. 165

iv

Contents

Allplan 2021

Steps to Success

Welcome!

Welcome!
This guide introduces you to the versatile options of the
Facade tool.
Seven steps show you how to create any facade - be it a
straight facade, a subdivided structure, or a sloped glass
dome. In addition, you will learn how to create and work
with 3D objects.
A clear example in the form of an exercise will lead you
through this training document. Each step is described in
detail so that you can follow quickly and easily.

1

2

Advantages

Allplan 2021

In the appendix, you will learn how to create your own
facade and save it as a favorite.

Have fun with this guide! We wish you every success!

Steps to Success

Basics

3

Basics
Be it an energy-efficient detached house or a modern
office building - a facade is essential! This facade needs to
be planned and designed. With Allplan 2021's Facade tool,
you can create complex facades quickly and easily.
You can model individual elements or the entire structure
of a facade in a comfortable and easy manner and then
display your design in plan view, sections, or 3D. Facades
are intelligent components; the individual elements of the
facade automatically adapt to changes.

Advantages
BIM
We have been committed to BIM for a long time. So, Allplan 2021 also
comes with enhanced BIM features.
Allplan is ideally suited to your needs and requirements,
encompassing the full range of CAD applications - from 2D drafting
to 3D designing to component-oriented building modeling. Be it 2D or
3D – that’s completely up to you! With Allplan, you can decide for
yourself!
The Facade tool creates parametric 3D components in real time.
Allplan comes with all required parameters, which are predefined. By
creating favorites, you can even define components yourself.
A correct floor plan, true to scale, is available at any stage. You can
define the height of the clipping plane in the Settings.
With Allplan’s Facade, you can design almost any facade shape.
There is no limit to creativity!

4

Advantages

Allplan 2021

IFC export
Facades created with the
Facade tool do not need to be adjusted
for IFC export. Allplan transfers facades as IfcCurtainWall or as
IfcBuildingElementProxy of the CurtainWall type if the Grouped or
Smart symbol option is selected in the
Settings.

Intelligent facades
A facade is an intelligent design object; its elements are internally
linked. In other words, any points you enter and elements you create
interact. You can change height settings directly in the 3D model.
In addition, you can convert facade surfaces into 3D objects and vice
versa. It is irrelevant whether the surfaces are linear, polygonal,
circular, or spline-shaped.
You can create and modify facades in the same way as you enter
linear, circular, polygonal, or spline-shaped surfaces. Facades can be
at any angle. You can insert facade objects wherever you like,
regardless of how you define the individual subdivisions. These
objects automatically adapt to the geometry. The floor plan also
adapts automatically. There is no limit to creativity!
Some examples:
• Mullion/transom facades
• Glass facades
• Glass roofs
• Accessories for sun protection, winter gardens
• Facade elements like fiber-cement panels, curtain walls,
aluminum panels, ceramic panels
• Paneling
• Acoustical and suspended ceilings

Steps to Success

Basics

5

Quick reference guide
Exercise
This exercise presents a two-story office building. You will apply an
exterior glass facade to parts of the ground floor. In addition, you will
insert a skylight into the roof over the entrance area and add panels
to the facade.

Initial situation
Note: The facade elements of the ground floor and the first upper
floor are not subdivided consistently. Consequently, they are not
always congruent. You would not do this in practice. This is only for
the purpose of this exercise so that you can try out various settings
for subdivisions.

6

Quick reference guide

Objective

How to create a facade - basic steps
Designing facades involves five important parts:

First step - select favorites
Second step - create the facade
Third step - use special tools
Fourth step - modify the facade
Fifth step - detail the facade

Allplan 2021

Steps to Success

Basics

7

Selecting favorites
So that you can get started immediately, Allplan comes with a wide
range of favorites for facade walls and facade surfaces. The available
facade types are commonly used in practice.

8

Quick reference guide

Allplan 2021

The
Retrieve facade favorites tool provides a total of 32
favorites:
• Mullion/transom facade 50mm
• Horizontal covering shell highlighted
• Vertical covering shell highlighted
• No vertical covering shell
• Visibly connected
• Structural glazing
• Mullion/transom facade 60 mm
• Mullion/transom facade 80 mm
• Element facade
• Point-fixed facade
• Sun blinds, aluminum
• Aluminum, small
• Glass, small
• Wood, small
• Shutters of 0.75-m width
• Shutters of 1.00-m width
• Shutters of 1.25-m width
• Sliding shutters
• Glass partition
• Point-fixed glass partition
• Glass block, wall
• Paneling (riveted)
• Aluminum cassette
• Board and batten cladding
• Clapboard cladding
• Panels placed (checked pattern)

Steps to Success

Basics

9

• Panels placed (bond)
• Panel wall
• Frame system
• Grid ceiling
• Coffering
• Trellis
You can display all favorites - be it horizontal, vertical, or at an angle as circles, polylines, or splines. In addition, these favorites react to
any angle. You can apply a 3D element (for example, a four-point
canopy) to any facade type.
All favorites can be modified and customized at any time. You can
then save the modified favorite as a new favorite, thus adding it to
the list of predefined facade favorites.
The advantages of favorites are obvious:
• Various predefined objects help you get started quickly and work
efficiently.
• You can use predefined objects to create your own favorites in a
comfortable and easy manner.

10

Quick reference guide

Allplan 2021

Creating facades
You can choose from eight different basic types.
Whenever you design an element of a facade, you must differentiate
between a
Facade wall and a
Facade face. Either way,
you can choose between
•

straight components

•

curved components

•

polyline-shaped components

•

spline-shaped components

When creating facades, you enter points and elements as usual in
Allplan. For example, you draw a rectangle (area) by clicking two
points. A special feature is available for creating curves. To draw an
arc, all you need to do is enter three points.

Steps to Success

Basics

11

In addition to all these options, you can create sloping facades of any
type and angle.
So that you can design facades quickly and easily, Allplan provides
objects for which you can define properties and styles.
Altogether these options form a modular toolbox, which is
structured hierarchically.
The components are predefined, parametric, and thus configurable.
You can save, replace, and re-create all components. Here are some
examples:
• Point objects are point fixers of point-fixed facades.
• Linear objects are canopies or sun shading.
• Face objects are doors and windows.
• Elements are exterior facade panels.
• Favorites
• Object properties
• Object styles, subdivision styles saved, fields combined, and so
on.
By using these predefined objects, you can get started immediately
and work efficiently.
Furthermore, you can use a pattern consisting of basic 2D lines to
create a 3D facade with this pattern. All you need to do is define the
pattern as a subdivision and create the facade with this subdivision.
By the way, you can use the subdivision settings to create directional
and nondirectional grids of as many angle-independent subdivisions
as you want and superimpose these subdivisions as often as you
need. There are no limits!

12

Quick reference guide

Allplan 2021

Special tools for working with 3D objects
You can configure Allplan to automatically adjust a facade to a 3D
object - all you need to do is click the 3D object. So, you can apply
different facade types to any 3D objects consisting of planar
surfaces. Thus, you can create various facade alternatives in no time
at all.
You can use the following tools:
•
•
•

Convert 3D object to facade (imports the facade)
Convert 3D object to facade and subdivide facade (imports
and subdivides the facade)
Convert facade to 3D object (exports the facade)

These tools help you visualize existing 3D objects in a quick and
comfortable manner.
Note: General 3D elements with curves cannot be imported. Convert
these elements to polygonal 3D solids before you import them. To do
Convert Elements - General 3D element to 3D solid,
this, use
3D surface.

Modifying facades
You can modify facades quickly and easily. The entire structure of a
facade automatically adapts to changes you make to the
parameters, points, or subdivisions defined for the facade. This
makes it much easier for you to work with facades. After
modifications, elements and objects adjust automatically; changes
are immediately visible in the preview.
Basically, you can make changes in the floor plan, section, or 3D
object. To do this, use the specific modification tools:
•

Modify points of curve, path

•

Add points to curve

•

Modify lower or upper height

Steps to Success

Basics

13

Detailing facades
You can create facades in many different ways. In Allplan, the tool for
designing facades reflects the conventional way: You start by
defining the grid, length, height, and the corresponding subdivisions.
Then, you add elements, which can be open or closed. All you need to
do is assign the objects to the relevant fields in 3D. You can always
see what you are doing; just look at the preview.
To finish, you can detail the facade, that is, assign new subdivisions,
subdivide existing fields again, and so on. You can also combine fields
and assign objects. In doing so, you can assign objects to individual
fields or to the entire facade so that these objects stretch across the
entire width of the facade.
Advantages:
• When modifications are necessary, you do not need to create the
data from scratch. Rather, you can simply edit the relevant data.
This considerably speeds up the design process.
• Various predefined objects help you get started quickly and work
efficiently. This increases the productivity in your office.

14

Quick reference guide

Allplan 2021

Overview of steps
Step 1 - creating a facade across corners
• Defining subdivisions
• Predefined facade favorites
• Drawing the facade
Step 2 - displaying additional favorites
• Modifying the facade
Step 3 - creating a spline-shaped facade
• Two options for subdividing and creating a spline-shaped facade
Step 4 - inserting opening elements
• Combining fields
• Assigning objects
Step 5 - applying objects to the exterior
• Placing face objects and linear objects
Step 6 - converting the 3D geometry into a facade (import 3D
geometry)
• Creating a sloping glass surface as a skylight
Step 7 - placements
• Placing panels
• Placing windows
Appendix - designing your own facade
• Creating face objects
• Creating linear objects
• Creating point objects
• Saving the facade as a favorite

Steps to Success

Getting ready

15

Getting ready
Training data on the internet
If the training data is not available to you, you can download the data
from Allplan Connect, the service portal for Allplan.

Downloading the training data
You can download the training data from Allplan Connect, the service
portal for Allplan.
Go to
connect.allplan.com
• Register with your customer number and email address.
Registration is free and not subject to any conditions.
After a few minutes, you will be able to access the data and
information there.
• To download the data for this step-by-step guide from Allplan
Connect, open the Training area and select Documentation.
• In addition to the training data, this area provides the latest
version of this document as a PDF file.
• Download the training data (Allplan training project
for steps to success - facade) from Allplan Connect
to any folder, for example, C:\data\training.
Note: Serviceplus customers can find more step-by-step guides in
the Training area of Allplan Connect. It usually takes us one to two
working days to activate this restricted area so that Serviceplus
customers can access and download documents. Please note that
this service is available to Serviceplus customers only.

16

Importing the training project

Allplan 2021

Contents of the training project
The following section - “Importing the training project (on page 16)” shows you how to import the training project.
The Steps to Success - Facade project consists of eight drawing
files, where you can find the initial situation of the office building
shown in “Exercise (on page 5)”. You will create parts of the facade
for this building in several drawing files.

Importing the training project
To import the training project to Allplan
 You have downloaded the training project from Allplan Connect.
 Allplan is running.
1

Click
New Project, Open Project... on the Quick Access
Toolbar.
The New Project, Open Project dialog box opens.

2 Drag the downloaded ZIP file from File Explorer into the area
where the projects are listed in the New Project, Open Project
dialog box.
Or:
Right-click in the empty area of the project list and select Import
compressed project on the shortcut menu. Select the
downloaded ZIP file in the Open dialog box.
3 Click OK to confirm the New Project dialog box.
Allplan opens the Steps to Success - Facade project.

Steps to Success

Getting ready

17

Selecting the drawing file
To select the current drawing file
1

Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.

2 Make drawing file 100 GF current.

3 Close the dialog box.

18

Allplan 2021

Steps to Success

Step 1: creating a facade across corners

Step 1: creating a facade
across corners
Objective

19

20

Defining subdivisions for the facade

Allplan 2021

Defining subdivisions for the facade
To define subdivisions for the facade
1

Open the
and click

Window drop-down list on the Quick Access Toolbar
1 Viewport.

2 Click standard views in the border of the viewport and select
Front Left, Southwest Isometric View.

3 Zoom in on the corner at the bottom of the ground floor.
Note: Check the settings for the scale = 100 and length = m.
Facade (Architecture role - Elements task - Opening
4 Click
Elements task area).

When creating a facade, you work from left to right on the
Facade context toolbar.

Steps to Success

Step 1: creating a facade across corners

5 Click

21

Subdivision settings on the Facade context toolbar.

There are two options to define subdivisions: You can choose
between subdivision and offset.
When you select subdivision, Allplan divides the length to be
subdivided into the number of sections specified. When you enter
several values (separated by “;”), Allplan creates the sections at
the ratio specified.
When you select offset, Allplan divides the length to be
subdivided into sections of the specified size. Allplan applies the
rest in accordance with the values entered for offset at start,
end. When you enter several values (separated by “;”), Allplan
creates the sections in the sequence of the offset values.
You will use the subdivision setting to create the first facade.
Click this setting if it is not selected.
6 Enter 7 for the number of subdivisions.
7 To define the Reference for the subdivisions, select Field in the
list box.

22

Defining subdivisions for the facade

Allplan 2021

The preview shows 7 subdivisions per field.
8 Open the 2. Global tab to define the vertical subdivision.
Note: Click

to add more tabs.

9 Here, too, select Subdivision. Enter 2 for the number of
subdivisions. As Allplan is to apply these settings to the entire
facade, switch the Reference to All.

10 Click OK to confirm the settings in the Subdivision dialog box.

Steps to Success

Step 1: creating a facade across corners

Notes:
If you want, you can also enter subdivisions at an angle:

You can superimpose as many subdivisions as you want. However,
the amount of data generated also increases significantly, thus
slowing down processing time.

23

24

Predefined facade favorites

Allplan 2021

Predefined facade favorites
Before you start drawing the facade, select a predefined facade
favorite.

To retrieve a predefined facade favorite
1

Click
Retrieve facade favorites on the Facade context
toolbar.

2 Select 001 Mullion/transom facade 50mm.

Tip: Facade favorites you
defined yourself are listed
above ---TEMPLATES---.

Facade favorites below ----TEMPLATES---- are predefined
and cannot be modified. The preview displays an example of the
facade favorite. You can find a description of the facade in the
Information area.
3 Click OK to close the Facade Favorites dialog box.

Steps to Success

Step 1: creating a facade across corners

25

Drawing the facade
To draw a facade
1

The Facade context toolbar is still open. Click
and
Straight component.

Facade wall

Note: To join the facade correctly with the wall, consider the
following point:
Allplan uses axis dimensions (and not unfinished dimensions) to
display the facade. Therefore, you must enter half the transom
width or half the mullion thickness when designing the facade.
2 The room height is 3.60 m. The width of a transom is 5 cm.
To define the height of the facade, you need to subtract the
transom width from the room height. As a result, the facade is
3.55 m high.
Enter 3.55 m for the height.

26

Drawing the facade

3 Zoom in on the area as shown in the illustration:

Allplan 2021

Steps to Success

Step 1: creating a facade across corners

4 <Facade> Enter start point
Point to the point marked in the illustration and enter
dy = -0.025 m and
dz = 0.025.

5 Select Enter to confirm.

27

28

Drawing the facade

6 <Facade> Enter second point
Point to the corner and enter

Allplan 2021

dz = 0.025 in the dialog line.

7 Select Enter to confirm.
Note: The blue arrow shows the construction direction of the
facade structure. The arrow points to the outside, which means
that Allplan starts on the outside, placing the first layer there.

Steps to Success

Step 1: creating a facade across corners

8 <Facade> Enter next point
Point to the end point of the facade.

29

30

Drawing the facade

Allplan 2021

9 To correctly join the facade with the wall and floor, enter
0.025 m and
dz = 0.025 m in the dialog line.

10 Select Enter to confirm.
11 Go to the Facade context toolbar and click Apply.
You have created the first facade.

dx = -

Steps to Success

Step 1: creating a facade across corners

31

12 Select F4 to see the facade in animation.
To make sure that the facade looks correct in animation, turn off
Color stands for pen in
Show/Hide ( View drop-down list
on the Quick Access Toolbar).

32

Drawing the facade

Allplan 2021

What if my facade is not transparent?
To make the color of the glass pane transparent
1

Navigation Mode is selected in the viewport of the Animation
view type.
Right-click a glass pane of the facade. The shortcut menu opens.

2 Select the

Set Surface tool.

You can see and change the properties of the surface (glass
pane) clicked.

Steps to Success

Step 1: creating a facade across corners

3 The subpalette of color *3 opens. Start by defining the
transparency:
• Transparency: 90 %

33

34

Drawing the facade

Allplan 2021

4 To achieve good rendering results with global illumination, you
should adjust the object color, too:
Click the Color button in the Color area.

5 The Color subpalette opens. In the Color system area, click the
button to the right of Color name.

Steps to Success

Step 1: creating a facade across corners

6 A color table opens. Select the Allplan default color 63 by
clicking it.
The color table closes. You can see the new color in the Color
subpalette.

35

36

Drawing the facade

7 Adjust the following values:
• Diffuse reflection: 80 %
• Glossy reflection: 100 %

8 Click OK to confirm the palette.
As a result, the facade elements are transparent.

Allplan 2021

Steps to Success

Step 2: displaying additional favorites

Step 2: displaying
additional favorites
Objective

37

38

Modifying the facade

Allplan 2021

Modifying the facade
You can use the
Modify tool to change the facade favorite quickly
and easily, thus displaying an existing facade with another favorite.

To modify a facade
1

If the

2 Click

Facade tool is closed, open it again.
Modify on the Facade context toolbar.

3 <Facade> Select facade
Click the facade you just created. The point you click is irrelevant.
4 Click
Retrieve facade favorites on the Facade context
toolbar.
5 Select the new facade favorite, 006 Point-fixed facade, for
example. Then click OK to confirm.
6 Go to the Facade context toolbar and click Apply.
The new facade looks like this:

Steps to Success

Step 3: creating a spline-shaped facade

Step 3: creating a splineshaped facade
The facade you will create consists of two components
of different shape. You will use spline-shaped elements
and linear elements.
This guide presents two alternative ways for creating
this facade.

Objective

39

40

Alternative 1

Allplan 2021

Alternative 1
Alternative 1 shows you how to create linear components and
spline-shaped components. You will create these components in
isometric view.

Defining subdivisions
To define new subdivisions
1

Close the animation viewport.

2 Click standard views in the border of the viewport and select
Front Right, Southeast Isometric View.
3 Zoom in on the following section:

Retrieve facade favorites on the Facade context
4 Click
toolbar.
5 Select 001 Mullion/transom facade 50mm.
6 Click

Subdivision settings on the Facade context toolbar.

7 Open the 1. Global tab.

Steps to Success

Step 3: creating a spline-shaped facade

8 As you do not want to use any previous settings, click
Remove subdivision in the Subdivision dialog box.
Repeat this until you have deleted all tabs.
9 Click

Add subdivision to open a new tab.

10 You used subdivision when you created the first facade. To
create the new facade, you will use offset. Select this option.
11 The facade columns are spaced at 1.06 m.
Enter 1.06 to define the offset.
12 To define the reference for the subdivisions, select the Field
option in the list box.
13 The end is fixed; the spline ends with a facade column.
Click EndFix.

14 Click OK to close the Subdivision dialog box.

41

42

Alternative 1

Allplan 2021

Note: To end a facade with a column or linear element, you can
also use the Linear elements at edges option, which you can find
in the
Settings (Facade context toolbar).

Drawing the facade
To draw the facade
1

Go to the Facade context toolbar and change the Height to
3.625 m.

2 Click

Facade wall and

Spline-based component.

Steps to Success

Step 3: creating a spline-shaped facade

3 <Facade> Enter start point
Point to the point marked in the illustration and enter
dx = 0.025 m and
dz = 0.025 m in the dialog line. Select Enter to confirm.

43

44

Alternative 1

Allplan 2021

4 <Facade> Enter second point
Point to the first subdivision point of the spline and enter
dz = 0.025.
As this offset of
dz = 0.025 applies to the entire facade, you
can define this value as a fixed value. To do this, click
in the
dialog line.

5 Select the Enter key to confirm.
6 Point to the other subdivisions of the spline one after the other.
The offset for
dz = 0.025 remains fixed.
Select the Enter key to confirm each point.

Steps to Success

Step 3: creating a spline-shaped facade

45

7 Finish entering the spline-shaped component when you reach the
black marker. To do this, click
Finish curve on the Facade
context toolbar:

46

Alternative 1

8 On the Facade context toolbar, click

Allplan 2021

Straight component.

The straight component must be shorter than the spline-shaped
component. The reason for this is a skyway that connects the
stairway and the main building on the first upper floor.

9 Go to the Facade context toolbar and change the Height to 3.25
m.

Steps to Success

Step 3: creating a spline-shaped facade

47

10 Point to the second black marker. The offset for
remains fixed. Select Enter to confirm.

dz = 0.025

11 Finish entering the straight component at the second black
marker by clicking
Finish curve on the Facade context toolbar
(see following illustration).
12 On the Facade context toolbar, click
component again.

Spline-based

48

Alternative 1

Allplan 2021

13 To continue with the spline-shaped component, you need to
change the height back to the previous setting:
Enter 3.625 m for the Height on the Facade context toolbar.

14 The offset for
confirm.

dz = 0.025 remains fixed. Select Enter to

15 Use
dz = 0.025 for the offset of all the other points and select
the Enter key to confirm each point.

Steps to Success

Step 3: creating a spline-shaped facade

49

16 Finish entering the spline-shaped component when you reach the
corner of the building. To do this, click
Finish curve on the
Facade context toolbar (see following illustration).

17 Switch back to
toolbar.

Straight component on the Facade context

50

Alternative 1

Allplan 2021

18 Select a suitable isometric view and zoom in on the end point:

Steps to Success

Step 3: creating a spline-shaped facade

19 Point to the last point of the new facade.
To correctly join the facade with the wall and floor, enter
0.025 m in the dialog line;
dz = 0.025.

20 Select Enter to confirm.

51

dy =

52

Alternative 1

Allplan 2021

21 Finally, click Apply on the Facade context toolbar.

Defining vertical subdivisions later
Apply vertical subdivisions to all the fields of the new facade. Create
this transom at a height of 2.50 m.

To create vertical subdivisions later
1

Click

Modify on the Facade context toolbar.

2 <Facade> Select facade
Click the facade you just created. The point you click is irrelevant.
3 Click

Subdivision settings on the Facade context toolbar.

4 Click

Add subdivision to open a new tab.

Steps to Success

Step 3: creating a spline-shaped facade

5 Define the following settings in the Subdivision dialog box:

6 Click OK to close the Subdivision dialog box.
7 Go to the Facade context toolbar and click Apply.
The facade has a new transom.

53

54

Alternative 2

Allplan 2021

Alternative 2
Alternative 2 shows you how to enter the facade by means of the
basic grid of the building (1.25 m x 1.25 m). You will learn how to
create straight components and circular components. You will enter
the points for the facade components in plan view.
Note: The next chapters build on alternative 1. If you want to try out
alternative 2, use an empty drawing file.

Creating a facade with subdivisions
To create a facade with horizontal and vertical
subdivisions
1

Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.

2 Drawing file 100 GF is still current. Open drawing file 99 Grid in edit
mode.
3 Switch to Plan view (viewport toolbar).
Facade (Architecture role - Elements task - Opening
4 Click
Elements task area).
5 Click

Subdivision settings on the Facade context toolbar.

6 As you do not want to use any previous settings, click
Remove subdivision in the Subdivision dialog box.
Repeat this until you have deleted all tabs.
7 Click

Add subdivision to open a new tab.

Steps to Success

Step 3: creating a spline-shaped facade

8 Make the following settings on the 1. Global tab:

to open a new tab. Make the following settings for the
9 Click
vertical subdivision of the facade:

The settings on tabs 1. Global and 2. Global apply to the entire
facade.
Click OK to close the dialog box.

55

56

Alternative 2

Allplan 2021

10 Draw the facade.
Zoom in on the following region:

11 The Facade context toolbar is still open. Click
and
Straight component.
12 Enter 3.625 m for the height.

Facade wall

Steps to Success

Step 3: creating a spline-shaped facade

13 <Facade> Enter start point
Point to the point marked in the illustration and enter
dx =
0.025 m and
dz = 0.025 m in the dialog line. Select ENTER to confirm.

57

58

Alternative 2

Allplan 2021

14 Point to the end of the straight line and enter
dz = 0.025 in the
dialog line.
As this offset of
dz = 0.025 applies to the entire facade, you
can define this value as a fixed value. To do this, click
in the
dialog line.
Select ENTER to confirm.

15 Finish entering the first straight component by clicking
curve on the Facade context toolbar.
16 The Facade context toolbar is still open. Click
and
Curved component.

Finish

Facade wall

Steps to Success

Step 3: creating a spline-shaped facade

17 Point to any point of the arc. The offset for
fixed. Select ENTER to confirm.

59

dz = 0.025 remains

60

Alternative 2

Allplan 2021

18 Point to the end of the arc. Here, too, the offset for
remains fixed. Select ENTER to confirm.

dz = 0.025

19 Finish entering the first curved component by clicking
Finish curve on the Facade context toolbar.
20 The Facade context toolbar is still open. Click
and
Straight component.

Facade wall

Steps to Success

Step 3: creating a spline-shaped facade

21 Point to the end of the straight line.
ENTER to confirm.

61

dz remains fixed. Select

22 Finish entering the second straight component by clicking
Finish curve on the Facade context toolbar.
23 The Facade context toolbar is still open. Click
and
Curved component.

Facade wall

62

Alternative 2

Allplan 2021

24 Point to any defined point of the arc. Select ENTER to confirm.

Steps to Success

Step 3: creating a spline-shaped facade

25 Point to the end of the arc.
confirm.

63

dz remains fixed. Select ENTER to

26 Finish entering the second curved component by clicking
Finish curve on the Facade context toolbar.
27 The Facade context toolbar is still open. Click
and
Straight component.

Facade wall

64

Alternative 2

28 Point to the end of the straight line. Here, too,
Select ENTER to confirm.

Allplan 2021

dz remains fixed.

Steps to Success

Step 3: creating a spline-shaped facade

29 Point to the last point of the new facade.
To correctly join the facade with the wall and floor, enter
dy = 0.025 m in the dialog line;
dz = 0.025.
Select ENTER to confirm.

65

66

Alternative 2

30 Select ESC to finish entering the facade.

Allplan 2021

Steps to Success

Step 3: creating a spline-shaped facade

67

Adjusting the facade to the basic grid
Use
Modify to adjust sections of the facade (curves) to the basic
grid of the building.
The basic grid is 1.25 m x 1.25 m.

To adjust the subdivision of the facade to the basic grid
of the building
1

Click

Modify on the Facade context toolbar.

2 <Facade> Select facade
Click the facade you just created. The point you click is irrelevant.
3 Click

Subdivision settings on the Facade context toolbar.

You will add six more tabs to the two existing tabs.

68

Alternative 2

Allplan 2021

On these new tabs, you will define the settings for the individual
sections (curves) of the facade.

Steps to Success

Step 3: creating a spline-shaped facade

69

4 Click
to open a new tab. Define the following settings for the
first section of the facade (curve 1 = location 1), which consists of
a straight line:

to open the fourth tab. The second curve (= location 2) of
5 Click
the facade is the first arc. Make the following settings:

70

Alternative 2

Allplan 2021

6 Click
to open the fifth tab. These entries apply to the second
straight line (curve 3 = location 3):

to open the sixth tab. These entries apply to the fourth
7 Click
curve (= location 4), which is the second arc:

Steps to Success

Step 3: creating a spline-shaped facade

71

8 Click
to open the seventh tab for the fifth curve (= location 5).
This is a straight line.

to open the eighth tab for the sixth (last) curve (=
9 Click
location 6), which is a straight line.

10 Click OK to close the Subdivision dialog box.

72

Alternative 2

Allplan 2021

11 Go to the Facade context toolbar and click Apply.
The facade has a new transom.

Finally, use the
Modify tool to change the height of the facade
section (curve 3) to 3.25 m. This is the section with the skyway on
the upper floor.

Steps to Success

Step 4: inserting opening elements

Step 4: inserting opening
elements
Objective

73

74

Combining fields

Allplan 2021

Combining fields
Go back to alternative 1 (on page 40) of the spline-shaped facade in
drawing file 100 GF.

To combine fields
1

Zoom in on the area as shown in the illustration.

2 On the Facade context toolbar, click
fields.

Assign combining of

3 <Facade> Select facade
Click the facade. The point you click is irrelevant.
4 <Facade> Click line of field
The subdivisions of the facade get blue points.
These points indicate the fields that you can combine. You cannot
combine subdivisions in spline-shaped components. This
prevents the spline from losing its curved shape.
Click one of the points shown in the illustration.

Steps to Success

Step 4: inserting opening elements

5 Go to the Facade context toolbar and click Apply.
The facade has a large window.

75

76

Combining fields

Allplan 2021

Assigning objects
The next step is to insert a front door into the spline-shaped facade.

To assign an object
1

Zoom in on the area as shown in the illustration.

2 On the Facade context toolbar, click

Assign object.

3 <Facade> Select facade
Click the facade. The point you click is irrelevant.
4 Select Face objects.

You can see blue points in the centers of the facade's
subdivisions.

Steps to Success

Step 4: inserting opening elements

5 Click the point shown in the illustration.

6 The Object Layout dialog box opens. Select the 009 Left glass
door object and click OK to confirm.

7 Go to the Facade context toolbar and click Apply.
The facade has a glass door that opens to the left.

77

78

Combining fields

Allplan 2021

8 Insert another glass door into the facade element to the right of
the glass door that you just created. You can do this yourself:
Choose object 010 (right glass door). This door opens to the right.
The result should look like this:

Steps to Success

Step 5: applying objects to the exterior

Step 5: applying objects
to the exterior
Objective

79

80

Placing surface objects regularly

Allplan 2021

Placing surface objects regularly
The next step is to replace every third glass field in the top row of the
spline-shaped facade with a panel.

To assign face objects
1

On the Facade context toolbar, click

Assign object.

2 <Facade> Select facade
Click the facade. The point you click is irrelevant.
3 Select Face objects.

You can see blue points in the centers of the facade's
subdivisions.
4 Click the blue point of an upper glass field.
5 Click Replace in the Object Layout dialog box.
Replace means that the selected object replaces the old object.
Add means that you add an additional object to the existing
object (for example, you add Venetian blinds to a window). Here,
you can select multiple entries.
6 Select 001 Panel.
7 Click Expand >>.

Steps to Success

Step 5: applying objects to the exterior

8 Enter the following in the Location box:
?space3%0space2

Each geometric element of the facade (point, line, face) has a
location that is defined by the subdivision.
The location consists of several numbers separated by spaces;
this is similar to coordinates.
In this example, you can interpret the location as follows:
? means all sections of the facade (curves)
3%0 means every third field (rest = 0)
2 means in the upper subdivision of the facade
You will learn how to graphically display locations in "Excursus:
face coordinates (on page 83)".
Note: This definition repeats for each curve of the facade.
9 Click OK to confirm the Object Layout dialog box.
10 Go to the Facade context toolbar and click Apply.

81

82

Placing surface objects regularly

Allplan 2021

The facade has panels.

Note: The settings you define with
Assign object apply even
when you select a different
Facade favorite. Therefore, reset
these settings when you have finished assigning panels to the
facade. Otherwise, these settings will affect other facades, such as
the one described in Step 7: placements (on page 101).

Steps to Success

Step 5: applying objects to the exterior

83

Excursus: face coordinates
When you created the spline-shaped facade, you switched between
straight components and spline-based components. Allplan
consecutively numbered these facade sections. You can display the
numbers of the facade elements.

To display face coordinates
1

Click

Modify on the Facade context toolbar.

2 <Facade> Select facade
Click the facade. The point you click is irrelevant.
3 Click

Settings on the Facade context toolbar.

4 Open the Preview and Entry Settings tab and select the Face
coordinates option.

5 Click OK to confirm.

84

Excursus: face coordinates

Allplan 2021

Tip: If the numbers are too
large or too small, you can
change the size in the
Settings dialog box. Go to
the Preview area and
change the size of
numbers, arrows.

You can find detailed information in the Allplan 2021 Help; see
"Facade" - "Dialog boxes" - "Object layout dialog box".
6 Finally, click Cancel on the Facade context toolbar.

Steps to Success

Step 5: applying objects to the exterior

85

Placing linear objects regularly
Complete the spline-shaped facade by adding sun blinds to its upper
part.

To assign linear objects
1

On the Facade context toolbar, click

Assign object.

2 <Facade> Select facade
Click the facade. The point you click is irrelevant.
3 Select Linear objects.

The edges of the facade elements get blue points.

86

Placing linear objects regularly

Allplan 2021

4 Click the upper point of the glass field in the top row of the facade
(see illustration).

5 The Object Layout dialog box opens. Select Add and then
001 Slats.
To assign the selected object to all the upper glass elements of
the facade, select
Assign layout to line.

6 Click Expand >>.

Steps to Success

Step 5: applying objects to the exterior

7 You want to assign sun blinds to the whole upper part of the
facade.
To achieve this, enter the following in the Location box:
3space3space?space?space2

8 Click OK to confirm.
9 Go to the Facade context toolbar and click Apply.

87

88

Placing linear objects regularly

Allplan 2021

You have assigned sun blinds to all the upper glass elements of
the facade.

If you want, you can also add the linear object (slats) separately to
each curve. Do the following:
1

On the Facade context toolbar, click

Assign object.

2 <Facade> Select facade
Click the facade. The point you click is irrelevant.
3 Select Linear objects.

The edges of the facade elements get blue points.

Steps to Success

Step 5: applying objects to the exterior

4 Click the upper point of a glass field in the top row of the facade,
for example in curve 1 (spline-shaped part).

5 The Object Layout dialog box opens. Select Add and then 001
Slats.
To assign the selected object to all the upper glass elements of
the facade, select
Assign layout to line.

6 Click OK to confirm.

89

90

Placing linear objects regularly

Allplan 2021

Allplan has applied blinds to the upper glass elements in the area
of the first curve. They appear in the selection color.
7 Click an upper point of a glass field in the next section of the
facade. Skip the region under the skyway (shorter glass
elements).
8 Repeat steps 5 and 6.
As a result, the upper glass elements of the next facade section
have blinds, which appear in the selection color.
9 Add blinds to all the other sections of the facade except the
region under the skyway.
10 Finally, click Apply on the Facade context toolbar.
You have assigned sun blinds to all the upper glass elements of
the facade.
You can see the result at the beginning of "Step 5: applying
objects to the exterior (on page 79)".

Steps to Success

Step 6: converting the 3D geometry into a facade

91

Step 6: converting the 3D
geometry into a facade
Objective

92

Creating a sloping glass surface as a skylight

Allplan 2021

Creating a sloping glass surface as a
skylight
You have the following options to work with 3D objects:
• You can convert the 3D geometry into a facade.
• You can configure and subdivide the 3D geometry.
• You can convert a facade into 3D geometry.
Note: General 3D elements with curves cannot be imported. Convert
these elements into polygonal 3D solids before you import them. To
Convert Elements - General 3D element to 3D solid,
do this, use
3D surface.

To convert a 3D geometry into a facade
1

Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.

2 Make drawing file 98 Draft for skylight current.
Close all the other drawing files.

Steps to Success

Step 6: converting the 3D geometry into a facade

This draft is a 3D surface.

3 Click

Facade.

Retrieve facade favorites on the Facade context
4 Click
toolbar.
5 Select 001 Mullion/transom facade 50mmm and click OK to
confirm.
6 Click

Subdivision settings on the Facade context toolbar.

7 As you do not want to use any of the previous settings, click
Remove subdivision in the Subdivision dialog box.
Repeat this until you have deleted all tabs.
8 Click

Add subdivision to open a new tab.

9 Tab 1. Global opens. Do not make any settings for Horizontal
subdivision.
10 Click

Add subdivision again to open another tab.

11 Tab 2. Global opens. Make the following settings for Vertical
subdivision:

93

94

Creating a sloping glass surface as a skylight

Allplan 2021

12 Click OK to close the Subdivision dialog box.
Convert 3D object to facade on the Facade context
13 Click
toolbar.
14 <Facade> Select 3D object
Click the 3D surface.
15 Go to the Facade context toolbar and click Apply.

Allplan applies the selected facade favorite to the 3D object.
16 Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.
17 Open the drawing files of the ground floor, first upper floor, and
top floor structural levels in edit mode.
18 Select F4 to see the project in animation.

Steps to Success

Step 6: converting the 3D geometry into a facade

95

The great advantage of the
Convert 3D object to facade tool is
that you can edit 3D objects quickly and easily. Converting a 3D
object into a facade only takes a few seconds. Thus, you can quickly
visualize a winter garden, for example.

If you want, you can display any facade as a sloping facade at any
angle and with any favorite type.
By means of the
Convert 3D object to facade tool, you can
convert 3D objects of any imaginable shape into facades.

96

Allplan 2021

Steps to Success

Excursus: converting a facade into 3D geometry

97

Excursus: converting a
facade into 3D geometry
Imagine the following situation: You have converted a 3D
object into a facade as described.
Now, you want to change the geometry of the object by
using the Stretch Entities tool (Change task area).
You cannot modify the facade directly. Instead, you must
convert the facade back into a 3D object, edit the 3D
object with Allplan's modification tools, and then convert
the edited 3D object into a facade again.

How to do this
To save the properties of the facade
1

Click

Modify on the Facade context toolbar.

2 <Facade> Select facade
Click the facade. The point you click is irrelevant.
3 Click

Object definitions on the Facade context toolbar.

98

How to do this

Allplan 2021

4 The Objects dialog box opens. Click
Save object style and
save all the properties of the facade in a file. Enter Export.fds
for the file name, for example.

5 Click Cancel in the Objects dialog box.
6 On the Facade context toolbar, click Cancel.

Steps to Success

Excursus: converting a facade into 3D geometry

To convert the facade into a 3D object
1

On the Facade context toolbar, click
object.

Convert facade to 3D

2 <Facade> Select facade
Click the facade. The point you click is irrelevant.
3 Go to the Facade context toolbar and click Apply.
This converts the facade into a 3D object.

To edit the 3D object with modification tools
• Change the 3D object to suit your needs. You can use all
modification tools in Allplan ( Stretch Entities, for example).

To convert the 3D object back into a facade
1

Click

Facade.

Convert 3D object to facade on the Facade context
2 Click
toolbar.
3 <Facade> Select 3D object
Click the modified 3D object. The point you click is irrelevant.
4 Click

Object definitions on the Facade context toolbar.

99

100

How to do this

Allplan 2021

5 The Objects dialog box opens. Click
Retrieve object style and
load all the properties of the facade you saved to the
Export.fds file.

6 Go to the Facade context toolbar and click Apply.

Steps to Success

Step 7: placements

Step 7: placements
Objective

101

102

Creating facade surfaces for panels

Allplan 2021

Creating facade surfaces for panels
To place panels
1

Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.

2 Make drawing file 130 Surroundings current and open drawing
file 100 GF in reference mode. Close all the other drawing files.

Steps to Success

Step 7: placements

3 Zoom in on the area in front of the front door.

103

104

Creating facade surfaces for panels

Allplan 2021

4 Point into this area because you want to place the panels in front
of the front door.

5 Click

Facade.

Retrieve facade favorites on the Facade context
6 Click
toolbar.
7 Select favorite 011 Panels placed (bond):

Steps to Success

Step 7: placements

105

8 Click OK to close the Facade Favorites dialog box.
9 The Facade context toolbar is still open. Click
and
Straight component.

Facade face

10 Zoom in on the area as shown:

11 Start placing the panels.
Check the direction of extension. If it is not correct, click
change it. The blue arrow must point downward.

to

106

Creating facade surfaces for panels

Allplan 2021

12 Click the first drop-in point.
To identify the other drop-in points, use the corners of the slab
element.

13 Zoom in on the required areas to place the panels along the
corners of the slab.

Steps to Success

Step 7: placements

14 On the Facade context toolbar, switch to
component.

107

Spline-based

15 Click the spline points of the slab.
16 To finish placing panels, click the first point again and select ESC.

108

Creating facade surfaces for panels

Allplan 2021

17 Delete the slab below the panels placed. Check the result in
animation.
Note: To modify the panels placed, click

Modify on the Facade

context toolbar, select the panels, and click
Object
definitions.
The Objects dialog box opens. You can modify the shape, size,
color, .... of the panels on the Face objects tab.

Steps to Success

Step 7: placements

109

Creating facade surfaces for windows
You can insert windows simply by clicking defined points, regardless
of the shape of the opening. Thus, you can create window surfaces
of circular, polygonal, and planar shape. There is no limit to creativity!
Inserting a window only takes a few mouse clicks. You do not need
any complex drafts. Just enter the parameters; Allplan automatically
creates the window. You can use all the favorites to design the
windows.

To create a facade surface as a window
1

Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.

2 Make drawing file 101 GF facade current and open drawing file
100 GF in edit mode. Close all the other drawing files.
3 Zoom in on the area as shown:

4 Delete the existing window element group.
The window opening remains unchanged.
5 Click

Facade.

110

Creating facade surfaces for windows

Allplan 2021

6 Click
Retrieve facade favorites on the Facade context
toolbar.
7 Select the 001 Mullion-transom facade, 50mm favorite in the
dialog box:

8 Click

Subdivision settings on the Facade context toolbar.

9 Open the 1. Global tab.
10 As you do not want to use any of the previous settings, click
Remove subdivision in the Subdivision dialog box until you
have deleted all tabs.
11 Click

Add subdivision to open a new tab.

12 Define the following settings and click OK to confirm:

Steps to Success

Step 7: placements

111

13 The Facade context toolbar is still open. Click
and
Straight component.

Facade face

14 Click the four corners of the window opening.
15 Go to the Facade context toolbar and click Apply.

To create a facade surface based on a pattern
1

Draw a rectangular

Fill (Quick Access task area) in Allplan.

Split Surface Elements, Archit. Elements (on the
2 Use
shortcut menu of the fill) to cut the fill so that you get the required
pattern.
3 Delete the existing window element group.
The window opening remains unchanged.
4 Click

Facade.

5 Click

Subdivision settings on the Facade context toolbar.

112

Creating facade surfaces for windows

Allplan 2021

6 Click
Match pattern to transfer the pattern into the
Subdivision dialog box. Open the Reference drop-down list and
select All.

Notes:
As soon as you have loaded a pattern, you can select off, on to
turn pattern-based subdivision on or off.
By clicking , you can delete the pattern again.
7 Click OK to close the Subdivision dialog box.
8 The Facade context toolbar is still open. Click
and
Straight component.
9 Click the four corners of the window opening.

Facade face

Steps to Success

Step 7: placements

113

10 Go to the Facade context toolbar and click Apply.

11 Select the relevant drawing files and look at the result in
animation (see the second illustration at the beginning of "Step 7:
placements (on page 101)").
You have reached the end of this "Steps to Success" guide, giving
insights into how to work with facades in Allplan 2021. In particular,
you have learned how to create and modify 3D facades with the
tools in Allplan 2021.
If you feel like trying out these things yourself, you can now design
your own facade based on the example in the following appendix.
You will use point objects, linear objects, and face objects to create a
straight facade. Finally, you will save the result as a favorite.

114

Allplan 2021

Steps to Success

Appendix: designing your own facade

115

Appendix: designing your
own facade
The Facade tool in Allplan 2021 has a modular structure. Thus, you
can model a 3D facade quickly and easily within a few minutes.
To do this, you can use predefined favorites. You can modify these
favorites at any time because Allplan creates the components
parametrically in real time. Consequently, you can customize
everything quickly and individually.
However, you can also create your own facade types by means of
predefined objects. You can then visualize and save the results as
Facade tool, you can design almost
favorites. With Allplan 2021's
any facade shape. There is no limit to creativity!
ObBased on an example, this appendix shows you how to use
ject definitions to create a straight facade from point objects, linear
objects, and face objects. In addition, you will learn how to save the
resulting facade as a favorite and analyze it in a report.

116

Objective

Allplan 2021

Objective
The aim of this exercise is a facade that you design yourself by
means of the
Facade tool. The result will look like this:

Steps to Success

Appendix: designing your own facade

117

Getting ready
The Steps to Success - Facade project is still open in Allplan 2021.
If it isn't, start Allplan and open this project.

To assign the drawing file for the facade
1

Click
Open on a Project-Specific Basis... on the Quick Access
Toolbar.

2 Select the Steps to Success - Facade project node and open the
shortcut menu.
3 Click

Assign drawing files.

118

Getting ready

Allplan 2021

4 The Assign drawing files dialog box opens. Select drawing file 90
and click OK to confirm.

5 Enter Straight facade for the name of drawing file 90.

6 Make drawing file 90 current. Close all the other drawing files.

Steps to Success

Appendix: designing your own facade

119

Important explanations
Start z-values relative to path (reference line)
Before you start creating a facade, you need to decide where to
place its reference line (path). Based on this reference line, you define
all the z-values of all the facade elements. In other words, this line
defines the positions of all the elements that you will design.
The following illustration shows all the elements of the facade in plan
and their positions relative to the reference line.

A = reference line
B = center line of frame
C = center line of frame of glass pane
Components of the facade in the sequence in which you will create
them:
1 - glass pane
2 - frame of glass pane
3 - frame
4 - holder part 1 rear
5 - holder part 1 front
6 - holder part 1 middle
7 - bolt part 1
8 - bolt part 2
9 - bolt part 3
10 - connecting element

120

Creating face objects

Allplan 2021

Creating face objects
Start by creating face objects. In other words, you define the glass
object with two elements, glass pane and frame.

To create a face object
1

Click
Facade (Architecture role - Elements task - Opening
Elements task area).

2 On the Facade context toolbar, enter Height = 3 m.
Subdivision settings and
3 On the Facade context toolbar, click
enter Offset = 1 m for both the horizontal subdivision and the
vertical subdivision of the facade.

Steps to Success

Appendix: designing your own facade

121

4 Click OK to confirm.
5 Click

Object definitions on the Facade context toolbar.

6 Open the Face objects tab.
Delete
7 You want to create new objects. Therefore, click
object style at the bottom of the dialog box, deleting any entries
from the three tabs.

122

Creating face objects

8 Click

Allplan 2021

Add object in the area at the top of the Face objects tab.

9 Enter Glass for the name of the object.

Steps to Success

Appendix: designing your own facade

123

10 Switch Object creation to Active and select the Standard option.
By selecting this option, you place the object at all the locations of
the facade.

11 In the Elements area, click

Add element.

12 Enter Glass_pane for the name of the element.
13 Switch Element creation to Active. Select Face for the type.

14 Make the following settings in the Cross-section in (mm) area:

124

Creating face objects

Allplan 2021

15 In the Position / length in (mm) area, enter 12 mm for Start Z
and 25 mm for Length Z (= thickness of glass pane).

The following illustration helps explain the Start Z value:
A = reference line (path)
1 = glass pane

16 In the Representation, analysis area, select color 3 and select
Representation in plan.

Steps to Success

Appendix: designing your own facade

125

17 The Face objects tab of the Objects dialog box should now look
like this:

18 The next step is to create the second element of the glass object,
the frame.
To do this, click
Add element in the Elements area.
19 Enter Frame for the name of the element.
20 Switch Element creation to Active. Select Line for the type.
21 In the Cross-section in (mm) area, enter 50 mm for the Width
and 50 mm for the Depth.

126

Creating face objects

Allplan 2021

22 Make the following settings in the Position / length in (mm) area:
Start X = 5 mm
Start Y = 5 mm
Start Z = 25 mm
Select Do not use x-offset automatically.
When you create linear elements, the Start Z value defines the
position of the element's center line:

A = reference line (path)
C = center line of frame of glass pane
2 = frame of glass pane
23 In the Representation, analysis area, select color 20 and select
Representation in plan.

Steps to Success

Appendix: designing your own facade

127

24 After you have made all the settings for the Frame element, the
Face objects tab of the Objects dialog box should look like this:

This completes the definition of the face objects.
25 Click OK to close the Objects dialog box.
Facade wall and
Straight component (Facade
26 Select
context toolbar) and draw a straight wall that is 3 m long.

128

Creating face objects

Allplan 2021

27 Select F4 to see the intermediate result in animation.

What if the facade is not visible in plan view?
What if the facade is visible only in elevation and isometric view but
not in plan view?
The reason for this is usually the horizontal clipping plane in the
Settings. The default setting is 1 m above the path of the facade.
Consequently, plan view shows all elements that are intersected by
the plane or that are below the plane.
In our example, however, there are no elements at a height of 1 m.
To solve this problem, change the height of the horizontal clipping
plane to 0.8 m.

Steps to Success

Appendix: designing your own facade

129

To change the height of the horizontal clipping plane
1

Click
Facade (Architecture role - Elements task - Opening
Elements task area).

2 As you want to apply this change to the existing facade, click
Modify on the Facade context toolbar.
3 <Facade> Select facade
Click the facade you just created. The point you click is irrelevant.
4 Click

Settings and enter 0.8 for the horizontal clipping plane.

5 Click OK to close the Settings dialog box.
6 Go to the Facade context toolbar and click Apply.
Allplan intersects the facade at a height of 0.8 m above the path.
As a result, the facade is now visible in plan view, too.

130

Creating linear objects

Allplan 2021

Creating linear objects
The second step is to create the frame of the facade.

To create a linear object
1

Click

Facade.

2 As you want to continue to work with the existing facade, click
Modify on the Facade context toolbar.
3 <Facade> Select facade
Click the facade you just created. The point you click is irrelevant.
4 On the Facade context toolbar, click
select the Linear objects tab.
5 Click

Object definitions and

Add object at the top.

6 Enter Frame for the name of the object.
7 Switch Object creation to Active and select the Standard option.
8 In the Elements area, click

Add element.

9 Enter Frame for the name of the element.
10 Switch Element creation to Active. Select Line for the type.
11 Make the following entries in the Cross-section in (mm) area:
Name: Circle
Type: Polygon with 16 corners
Width = 20 mm
Depth = 20 mm
12 Make the following settings in the Position / length in (mm) area:
Start X = 0 mm
Start Y = 0 mm
Start Z = -125 mm
Select Do not use x-offset automatically.

Steps to Success

Appendix: designing your own facade

131

When you create linear elements, the Start Z value defines the
position of the element's center line:

A = reference line (path)
B = center line of frame
3 = frame
13 In the Representation, analysis area, select color 23 and select
Representation in plan.

132

Creating linear objects

14 The dialog box should now look like this:

15 Click OK to close the Objects dialog box.
16 Go to the Facade context toolbar and click Apply.

Allplan 2021

Steps to Success

Appendix: designing your own facade

17 Select F4 to see the intermediate result in animation.

133

134

Creating point objects

Allplan 2021

Creating point objects
In this section, you design holders to connect the glass elements with
the frame. These holders consist of several components (holder, bolt,
connecting element), which you create as point elements.

To create a point object
1

If the
Facade tool is no longer open, click it (
down list on the Quick Access Toolbar).

2 Click

Repeat drop-

Modify on the Facade context toolbar.

3 <Facade> Select facade
Select the facade.
Tip: You can directly switch to Modify when you select the
Facade tool. How to do this? Open the shortcut menu of the
facade and click
Modify.

4 Click

Object definitions and select the Point objects tab.

Steps to Success

Appendix: designing your own facade

5 Click

135

Add object at the top and enter Holder for its name.

6 Switch Object creation to Active and select the Standard option.
7 In the Elements area, click

Add element.

8 Enter Part1_rear for the name of the element.
Note: Element names must not include spaces.
9 Switch Element creation to Active. Select Point for the type.
10 Make the following entries in the Cross-section in (mm) area:
Name: Circle
Type: Polygon with 16 corners
Width = 165 mm
Depth = 165 mm
11 Make the following settings in the Position / length in (mm) area:
Start X = 0 mm
Start Y = 0 mm
Start Z = -140 mm
Length Z (= depth of element) = 30 mm
The Start Z value is 140 mm from the reference line in the
negative direction:

A = reference line (path)
4 = holder, Part1_rear
12 In the Representation, analysis area, select color 24 and select
Representation in plan.

136

Creating point objects

13 The dialog box should now look like this:

14 Click OK to close the Objects dialog box.
15 Go to the Facade context toolbar and click Apply.

Allplan 2021

Steps to Success

Appendix: designing your own facade

137

16 Select F4 to see the intermediate result in animation.

17 On the Facade context toolbar, click
facade by clicking it. Select
Point objects tab.

Modify and select the

Object definitions and open the

18 To avoid entering all the settings from scratch, click
element in the Elements area.
19 Enter Part1_front for the name of the element.

Copy

138

Creating point objects

Allplan 2021

20 In the Position / length in (mm) area, change the Start Z
coordinate to
Start Z = -60 mm.
The Start Z value is 60 mm from the reference line in the
negative direction:

A = reference line (path)
5 = holder, Part1_front

Steps to Success

Appendix: designing your own facade

Do not change the other settings.

21 Click OK to close the Objects dialog box.
22 Go to the Facade context toolbar and click Apply.

139

140

Creating point objects

Allplan 2021

23 Select F4 to see the intermediate result in animation.

24 On the Facade context toolbar, click
the facade by clicking it. Select
the Point objects tab.
25 In the Elements area, click

Modify again and select

Object definitions and open

Copy element again.

26 Enter Part1_middle for the name of the element.
27 Change the following values in the Cross-section in (mm) area:
Width = 50 mm
Depth = 50 mm

Steps to Success

Appendix: designing your own facade

28 In the Position / length in (mm) area, change the following
coordinates:
Start Z = -110 mm
Length = 50 mm.
The Start Z value is 110 mm from the reference line in the
negative direction:

A = reference line (path)
6 = holder, Part1_middle

141

142

Creating point objects

29 In the Representation, analysis area, select color 28.
Do not change the other settings.

30 Click OK to close the Objects dialog box.
31 Go to the Facade context toolbar and click Apply.

Allplan 2021

Steps to Success

Appendix: designing your own facade

143

32 Select F4 to see the intermediate result in animation.

Creating point elements - bolt element
The next step is to create another point element - a bolt. This bolt
consists of three individual elements.

To create the bolt
1

On the Facade context toolbar, click
facade by clicking it. Select
Point objects tab.

Modify and select the

Object definitions and open the

2 Do not change the settings at the top of the Point objects tab
because you are still designing components of the Holder object.
Copy element and enter Bolt_part1
3 In the Elements area, click
for the name of the new element.
4 Change the following values in the Cross-section in (mm) area:
Width = 10 mm
Depth = 10 mm

144

Creating point objects

Allplan 2021

5 In the Position / length in (mm) area, change the following
coordinates:
Start X = 200 mm
Start Y = 200 mm
Start Z = 12 mm
Length Z (= depth of element) = 25 mm
The Start Z value is 12 mm from the reference line:

A = reference line (path)
7 = bolt_part1
6 In the Representation, analysis area, select color 31.

Steps to Success

Appendix: designing your own facade

Do not change the other settings.

7 Click OK to close the Objects dialog box.
8 Go to the Facade context toolbar and click Apply.

145

146

Creating point objects

Allplan 2021

9 Select F4 to see the intermediate result in animation.

Modify on the
10 To design the second part of the bolt, select
Facade context toolbar again. Select the facade by clicking it.
Select

Object definitions and open the Point objects tab.

11 In the Elements area, select the Bolt_part1 element, click
Copy element and enter Bolt_part2 for the name of the
new element.
12 Change the following values in the Cross-section in (mm) area:
Width = 30 mm
Depth = 30 mm

Steps to Success

Appendix: designing your own facade

13 In the Position / length in (mm) area, change the following
coordinates:
Start Z = -30 mm
Length Z (= depth of element) = 42 mm
The Start Z value is 30 mm from the reference line in the
negative direction:

A = reference line (path)
8 = bolt_part2
14 In the Representation, analysis area, select color 25.

147

148

Creating point objects

Do not change the other settings.

15 Click OK to close the Objects dialog box.
16 Go to the Facade context toolbar and click Apply.

Allplan 2021

Steps to Success

Appendix: designing your own facade

149

17 Select F4 to see the intermediate result in animation.

18 Design the third part of the bolt.
Open the Point objects tab again (select
facade and select

Modify, click the

Object definitions).

19 In the Elements area, select the Bolt_part2 element, click
Copy element and enter Bolt_part3 for the name of the
new element.
20 Change the following values in the Cross-section in (mm) area:
Width = 50 mm
Depth = 50 mm

150

Creating point objects

Allplan 2021

21 In the Position / length in (mm) area, change the following
coordinates:
Start Z = 37 mm
Length Z (= depth of element) = 10 mm
The Start Z value is 37 mm from the reference line:

A = reference line (path)
9 = bolt_part3

Steps to Success

Appendix: designing your own facade

22 In the Representation, analysis area, select color 31.
Do not change the other settings.

23 Click OK to close the Objects dialog box.
24 Go to the Facade context toolbar and click Apply.

151

152

Creating point objects

Allplan 2021

25 Select F4 to see the intermediate result in animation.

Creating point elements - connecting element
Finally, create the elements that connect the circular holders with the
bolts.

To create the connecting elements
1

On the Facade context toolbar, click
facade by clicking it. Select
Point objects tab.

Modify and select the

Object definitions and open the

2 Do not change the settings at the top of the Point objects tab, as
you are still designing components of the Holder object.
Add element and enter Connector
3 In the Elements area, click
for the name of the new element.

Steps to Success

Appendix: designing your own facade

4 This element is a rectangle with four corners.
Enter the following values in the Cross-section in (mm) area:
Width = 300 mm
Depth = 50 mm
5 In the Position / length in (mm) area, change the following
coordinates:
Start X = 110 mm
Start Y = 110 mm
Start Z = -60 mm
Length Z (= depth of element) = 30 mm
The Start Z value is 60 mm from the reference line in the
negative direction:

A = reference line (path)
10 = connecting element

153

154

Creating point objects

Allplan 2021

6 In the Representation, analysis area, select color 24 and select
Representation in plan.

Note: To zoom in on a detail in the preview, use the right mouse
button to open a selection rectangle around the area you want to
view in detail.

Steps to Success

Appendix: designing your own facade

155


To display the full preview again, double-click the middle mouse
button.
7 Click OK to close the Objects dialog box.
8 Go to the Facade context toolbar and click Apply.
9 Select F4 to see the final result in animation.

156

Saving the facade as a favorite

Allplan 2021

Saving the facade as a favorite
The facade is complete. Save the facade as a favorite for use in
future projects.

To save the facade as a favorite
1

On the Facade context toolbar, click
facade by clicking it. Select
Point objects tab.

Modify and select the

Object definitions and open the

2 Click the Info button in the lower border of the dialog box.

3 You can click
dialog box.

Delete info text to delete the text from the Info

4 Enter the following:

Steps to Success

Appendix: designing your own facade

157

5 Click OK to confirm.
6 Click

Save object style in the lower border of the dialog box.

7 Check that all options are selected and click OK to confirm.
The Favorites - office folder opens.
8 Create a subfolder and name it Favorites, examples.

158

Saving the facade as a favorite

Allplan 2021

9 Open the new folder, enter Straight facade for the name of the
favorite file, and click Save.

Allplan saves the entire facade to a file with the extension *.fds.
You can see the Point objects tab again. The new Straight
facade favorite is entered in the drop-down list to the left of the
Info button.

Retrieve object style, open the
To load this favorite, click
Favorites, examples folder, and select the Straight facade file.

Steps to Success

Appendix: designing your own facade

10 In addition to the entire facade, you can also save individual
objects and elements of the facade as favorites in the Objects
dialog box.
You can find these tools next to the name of the object or
element.

11 For example, you can save the Glass object.
To do this, open the Face objects tab.
12 Click

Save object.

159

160

Saving the facade as a favorite

Allplan 2021

13 The Save favorite file dialog box opens. Select the Favorites,
examples folder.
14 Enter Face object, glass for the name and click Save.

Allplan saves the object as a file with the extension *.ffo (files
for face objects of facades).
When you save elements as favorites, Allplan creates a file with
the extension *.ffe (files for face elements of facades).
Retrieve
15 To load the object favorite or element favorite, click
object or
Retrieve element, open the Favorites, examples
folder, and select the object file or element file you want to open.

Steps to Success

Appendix: designing your own facade

161

Retrieving facades saved as favorites
To select the facade saved as a favorite, you can use the
Retrieve facade favorites tool on the Facade context toolbar.
The Information area displays the text entered.

To get a preview of the favorite, you must create a bitmap. Click
to learn how to do this.

Now you know how to create a straight facade. Of course, you can
also design you own facades as circular components, spline-based
components, or polyline-based components.

162

Analyses with reports

Allplan 2021

Analyses with reports
Finally, you will analyze your own facade by means of the Reports
tool.
By using the Reports tool, you can generate reports of architectural
elements, objects, 3D solids with architectural attributes, and
engineering components. You can view reports on the screen, place
them in the document, or send them to the printer. In addition, you
can save reports as PDF files, Excel files, or Word files.

To analyze your own facade in a report
 Drawing file 90 Straight facade is current. All the other drawing
files are closed.
1

Click

Reports (Annotations task area).

2 In the Reports dialog box, open the Reports - Eng - Facade
folders.
Select the Facade - overview with graphics.rdlc file.

Note: The Facade folder (Reports - Eng) contains more reports
for analyzing facade elements (surface elements, linear elements,
point elements).

Steps to Success

Appendix: designing your own facade

163

3 Click Open.
4 Click All in the input options.
You can see the report in the Report dialog box on the screen.

As mentioned before, you can output, print, or save the report in
various ways. By means of
Layout Designer, you can change
the way the report looks and save the resulting report as a new
template in RDLC format.
5 Close the report.
You have reached the end of this step-by-step guide, giving insights
into how to work with the
Facade tool. We hope you had no
problems following the steps and you are satisfied with the result.

164

Allplan 2021

Steps to Success

Index

165

3

face coordinates 83
face objects 80, 120
face placement 101
favorites 7, 24, 37, 38, 102, 109
height of facade 120
horizontal subdivision 20
how to proceed 6
importing 3D geometry 91
linear objects 130
loading object definitions 38
modifying 12, 38, 52, 67, 130,
134, 143, 152
opening elements 73
options 83
plan display (missing) 128
point objects 134, 143, 152
predefined facade styles 24
retrieving favorites 40, 161
spline-based 39
spline-based component 39,
42, 102
straight component 25, 42,
54, 102
subdivision 109
subdivision based on pattern
109
subdivision settings 20, 120
subdivisions 20, 40, 52, 54, 67
transparency 32
vertical subdivision 20, 52
facade lining 4
face coordinates 83
face objects 80, 120
face placement 101
panels 102
window 109

Index
3D geometry 92

A
adding object 120
aluminum panels 4
assigning objects 76
face objects 80, 120
linear objects 85

C
combining of fields 74
converting 3D object to facade
91
converting facade to 3D 97
converting facade to 3D object
97
creating drawing file 117
curtain walls 4
curved component 54

D
displaying favorites 37

E
external objects 79

F
facade
3D objects 12
across corners 19
analyses 162
assigning objects 76, 80, 85
combining of fields 74
converting 3D to facade 92
converting facade to 3D 97
creating 10, 19
curved component 54
detailing 13
drawing 25, 42
external objects 79

G
glass facade 4
glass roofs 4

166

Index

H
height of facade 120
how to proceed 6

I
importing 3D geometry 91
importing the training project 16
integration into BIM 3
intelligent facades 4

L
linear objects 130
loading object 156

M
modifying 12, 38, 52, 67, 130, 134,
143, 152

O
object definitions 120, 130, 134
opening elements 73
opening the training project 17
options 83
face coordinates 83

P
path (reference line) 119
plan display (missing) 128
point objects 134, 143, 152

R
reference line (path) 119
reports 162
retrieving favorites 40, 161

S
saving as a favorite 156
saving favorite 156
saving object 156
selecting drawing files 17
showing start z values
graphically 119
spline-based components 39
splitting surface elements, archit.
elements 109
start z values 119, 120, 130, 134

Allplan 2021
straight component 25

T
transparency 32


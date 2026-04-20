---
title: "Allplan 2025 Il Visualscripting"
category: Troubleshooting
source: Allplan_2025_IL_VisualScripting.txt
tags: [allplanYeni_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2025
E-learning

Allplan Visual Scripting

This documentation has been produced with the utmost care.
ALLPLAN GmbH and the program authors have no liability to the purchaser
or any other entity, with respect to any liability, loss, or damage caused,
directly or indirectly by this software and its documentation, including but
not limited to, any interruptions of service, loss of business, anticipatory
profits, or consequential damages resulting from the use or operation of this
software and its documentation. In the event of discrepancies between the
descriptions and the program, the menu and program lines displayed by the
program take precedence.
Information in this documentation is subject to change without notice. Companies, names, and data used in examples are fictitious unless otherwise
noted. No part of this documentation may be reproduced or transmitted in
any form or by means, electronic or mechanical, for any purpose, without the
express written permission of ALLPLAN GmbH.
Allfa® is a registered trademark of ALLPLAN GmbH, Munich.
Allplan® is a registered trademark of the Nemetschek Group, Munich.
Adobe® , Acrobat®, and Acrobat Reader® are trademarks or registered
trademarks of Adobe Systems Incorporated.
AutoCAD®, DXF™, and 3D Studio MAX® are trademarks or registered trademarks of Autodesk Inc., San Rafael, CA.
BAMTEC® is a registered trademark of Häussler, Kempten, Germany.
Datalogic and the Datalogic logo are registered trademarks of Datalogic
S.p.A. in many countries, including the United States and Europe. All rights
reserved.
Microsoft® and Windows® are either trademarks or registered trademarks
of Microsoft Corporation.
MicroStation® is a registered trademark of Bentley Systems, Inc.
Parts of this product were developed using LEADTOOLS, (c) LEAD Technologies, Inc. All rights reserved.
Parts of this product were developed using the Xerces library of "The
Apache Software Foundation".
fyiReporting Software LLC developed parts of this product using the fyiReporting library, which is released for use with the Apache Software license,
version 2.
Allplan update packages are created using 7-Zip, (c) Igor Pavlov.
Cineware, render engine, and parts of the user documentation; copyright
2020 MAXON Computer GmbH. All rights reserved.
All other (registered) trademarks are the property of their respective owners.

© ALLPLAN GmbH, Munich. All rights reserved.
1st edition, October 2023
Document no. 240deu01s59-1-BS1023

Allplan Visual Scripting

Contents

i

Contents
Welcome to Allplan Visual Scripting ....................................... 1
Your feedback .................................................................................................................... 1

Introduction ...................................................................................... 2
What is visual programming? ................................................................................. 2
Why visual scripting? ................................................................................................... 2
Where to find visual scripting in Allplan? ......................................................... 3

The user interface of Allplan Visual Scripting ................... 4
Menu bar ............................................................................................................................... 5
File menu ...................................................................................................................................5
Edit menu ..................................................................................................................................6
Script menu ............................................................................................................................. 7
View menu ............................................................................................................................... 7
Help menu.................................................................................................................................8

Toolbar ................................................................................................................................... 9
Library palette.................................................................................................................. 11
Workspace ........................................................................................................................ 13
Script view ......................................................................................................................... 14
Shortcut menu of the workspace ..................................................................... 15
Palette Designer palette .......................................................................................... 16
Position in the application window ..........................................................................16
Visible parameters of nodes ....................................................................................... 17
Creating a new group (= area) ...................................................................................19

ii

Contents

Allplan 2025

Creating a tab......................................................................................................................20
Shortcut menus of the parameters ....................................................................... 21

Watch list palette ......................................................................................................... 23
Position in the application window ......................................................................... 23
Shortcut menu of the parameters in the watch list palette ...................24

Output window.............................................................................................................. 25
Showing the script location .................................................................................. 25

Components of a script ............................................................ 26
Nodes ................................................................................................................................... 26
Structure of a node .........................................................................................................26
Handling nodes...................................................................................................................32
Types of nodes ..................................................................................................................33

Connecting lines ........................................................................................................... 36
Creating connecting lines ............................................................................................36
Editing connecting lines ................................................................................................38

Running a script ........................................................................... 39
Your first attempt at scripting - part 1 ............................... 41
How Allplan Visual Scripting and Allplan interact .................................... 44

Your first attempt at scripting - part 2 ............................. 47
Working with the Palette Designer palette ............................................... 53
Saving the script .......................................................................................................... 60
Modifying parameters ............................................................................................... 61

Your first attempt at scripting - part 3 ............................. 64

Allplan Visual Scripting

Contents

iii

Visual Scripting object in ......................................................................................... 66

Examples provided .................................................................... 67
Index .................................................................................................. 71

Allplan Visual Scripting

Welcome to Allplan Visual Scripting

1

Welcome to Allplan Visual
Scripting
This description focuses on the topic of visual scripting.
You find general information about visual programming
and learn how Allplan has taken up this topic.
Ranging from a detailed explanation of the user interface
of Allplan Visual Scripting to in-depth information about
the components of a script to your first own small script this guide shows you all you need to know about visual
scripting in Allplan.
Have fun with this small guide! We wish you every success!

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

2

What is visual programming?

Allplan 2025

Introduction
What is visual programming?
Visual programming is receiving more and more attention in the
construction industry. By means of visual programming, you can
program powerful, customized scripts that open up countless new
options when it comes to creativity and design. Visual scripting facilitates any kind of work: You can automate recurring design activities,
create user-defined forms, analyze data, and generate projectspecific reports.
Parametric modeling is an excellent tool to increase efficiency in
BIM-based planning. This means that the modeled components are
smart due to the parameters assigned. To assign parameters, you
use scripting languages, such as Python. These scripting languages
facilitate the creation of parametric models and support the automation of design workflows. Think of SmartParts or PythonParts. When
you use them in a model, you are, in fact, modeling parametrically.

Why visual scripting?
A disadvantage of parametric modeling is that users need extensive
knowledge of the scripting language. As a rule, users must create
parameters and dependencies by writing codes, which requires advanced programming skills. Although there are various predefined
components, many architects and engineers often need customized
components or a particular behavior, which predefined solutions
cannot provide. This makes modeling difficult and time-consuming.
By means of visual scripting, you can create these components by
visually arranging and linking nodes on a graphical user interface.
These nodes are easy to understand - even without programming
skills. Basically, it’s like creating a flowchart. But visual scripting is
much more than modeling components. You can create scripts to
automate workflows, add information to existing objects, or analyze
the model.

Allplan Visual Scripting

Introduction

3

Where to find visual scripting in Allplan?
You can use Allplan Visual Scripting without additional software in
Allplan. After you have opened Allplan Visual Scripting, it runs in its
own, discrete window. Allplan stays open in the background.
When you look at the Actionbar, you can find visual scripting in the
User-Defined Objects task.

Allplan Visual Scripting. You can see the Allplan
Click to select
Visual Scripting window, where you can visually link predefined code
blocks (also referred to as nodes). This results in a script. After running this script, the program computes the algorithm. This algorithm
creates configurable and reusable objects in Allplan or runs the defined workflow in Allplan.
But first things first.

4

Where to find visual scripting in Allplan?

Allplan 2025

The user interface of
Allplan Visual Scripting
Let’s first have a look at the user interface of Allplan Visual Scripting:

1 - Menu bar
Tip: You can resize the Allplan Visual Scripting window
to suit your needs. You can
also move this window to
another monitor.

2 - Toolbar
3 - Library palette
4 - Workspace
5 - Script view
6 - Shortcut menu of workspace
7 - Palette Designer palette

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

5

Menu bar
The menu bar is above the workspace of the Allplan Visual Scripting
window. You can find the following menus on the menu bar: File, Edit,
Script, View, and Help.

File menu
The File menu provides the following tools:
•
•

New (CTRL+N) to create a new script.
Open (CTRL+O) to open an existing script.
Allplan comes with a collection of sample scripts. To load these
scripts, select the Examples folder in the left column of the Open
dialog box. You can derive your own scripts from these sample
scripts. All you need to do is use Save as to save the scripts under
new names.

• Recent projects Lists up to 10 scripts (*.pyp) you opened most
recently. The full file path is displayed in the tooltip of the script
name. To quickly reopen one of these scripts, click on the corresponding file name. Allplan loads the state of the script you saved
last.
•

Save (CTRL+S) to save a new or changed script. The script is
stored in a project file (*.avsprj).

• Save as (CTRL+SHIFT+S) to save a script under a new name. The
script is stored in a project file (*.avsprj).
•

Create PyP script only... to create a script only and not an
object in Allplan. The script is saved as a *.pyp file.

•

Create objects... to create the object in Allplan for the current
script.

• Exit (ALT+F4) to close Allplan Visual Scripting.
When you have changed a script, you can save these changes
before you close the application.
Note: You can also find the tools
New,
Create objects in the toolbar (on page 9).

Open,

Save and

6

Menu bar

Allplan 2025

Edit menu
The Edit menu provides the following tools:
•

Undo (CTRL+Z): Allows you to undo one or more actions.

•

Redo (CTRL+Y): Allows you to restore actions that have been
undone.

• Copy (CTRL+C) to copy all selected nodes and their connecting
lines to the clipboard. If you have selected a single node, this tool
copies only this node to the clipboard. Any connecting lines will
not be copied, regardless of whether they lead to or come from
this node.
• Paste (CTRL+V) to paste all nodes and their connecting lines into
the workspace after you have copied them to the clipboard by
means of Copy.
• Duplicate (CTRL+D) to create identical copies of all selected nodes and their connecting lines and to paste these copies into the
workspace. When you duplicate a single node, only its input
connections are duplicated, the output connections are not.
• Delete (DEL) to delete all selected nodes and their connecting
lines, regardless of whether they lead to (input ports) or come
from (output ports) a node.
• Select all (CTRL+A) to select all nodes in the script.
• Cancel selection to cancel the selection of nodes.
Notes: The Undo and Redo tools are also included in the toolbar (on
page 9).
You can find the Copy, Paste, Delete, and Select all tools on the
shortcut menu of the workspace (on page 15) too.
You can copy (CTRL+C) and paste (CTRL+V) selected nodes and the
connecting lines between them across scripts. You can reuse existing node combinations by copying between scripts.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

7

Script menu
Select the
Start tool (F5) to run the script.
Consequently, Allplan opens the Properties palette, displaying the
result of the script as a preview in the viewport.
The script does not contain any actual objects or geometries. Only
when you select this tool does the program run the algorithm defined
in Allplan Visual Scripting and display the result of the algorithm as
configurable and reusable objects in Allplan or run the defined workflow in Allplan.
You can stop the script by pressing SHIFT + F5, which stops it
started it. If you have already
from running once you have
started the script and the properties palette and the preview of the
object are displayed in Allplan, pressing stop will delete these representations in Allplan.
Note: You can find the
page 9) too.

Start and

Stop tools on the toolbar (on

View menu
The View menu provides the following tools:
•

Zoom selection to zoom in on the selected nodes. If you have
not selected a node, this tool is grayed out.

•

Zoom all (CTRL+0) to show the entire script in the workspace.

• By adding or removing
check marks, you can show or hide the
Library palette (on page 11), Output window (on page 25), and
Palette Designer palette (on page 16) as well as the watch list
palette (on page 23).
Note: You can find the
Zoom selection,
Zoom all, tools in the
upper-right area of the workspace too. In addition, you can zoom in
or out of the script view percentage-wise.

8

Menu bar

Allplan 2025

Help menu
The Help menu consists of the following two options:
Getting started to open a short guide to Allplan Visual Scripting.
Visual Scripting Help (F1) to open the Allplan Help, providing more
information about visual scripting.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

9

Toolbar
The toolbar is below the menu bar:

The toolbar contains frequently used tools:
New to create a new script.
Open to open an existing script.
Allplan comes with a collection of sample scripts. To load these
scripts, select the Examples folder in the left column of the Open
dialog box. You can derive your own scripts from these sample
scripts. All you need to do is save the scripts under new names.
Save to save a new or changed script.
Undo to undo one or more actions.
Redo to restore undone actions.
Start to run the script.
Stop to pause the running script or to clear the display of the properties palette and the preview of the object in Allplan after running
the script.
Create objects in Allplan, triggers the creation of the object defined in the script in Allplan.

10

Toolbar

Allplan 2025

Allplan opens the Properties palette, displaying the result of the
script as a preview in the viewport.
The script does not contain any actual objects or geometries. Only
tool does the program run the algorithm
when you select this
defined in Allplan Visual Scripting and display the result of the algorithm as preview (objects) in Allplan or run the defined workflow in
Allplan. To not only display the objects in Allplan but also create them
as configurable and reusable objects, use the Create objects in
Allplan tool.
Note: You can also find the tools
New,
Open,
Save and
Create objects in the File menu. The tools
Start and Stop are
Undo and
Redo are compoalso included in the script menu.
nents of the Edit menu.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

11

Library palette
The Library palette of Allplan Visual Scripting contains all available
nodes sorted alphabetically by category.
The Library palette is organized as a tree structure and thematically
divided into different folders with subfolders.

Position in the application window
The Library palette is to the left of the workspace.
Hide automatiTo minimize the Library palette, you can turn on
cally. To show the palette all the time, turn off
Hide automatically.
With Close you can close the Library palette.
To change the width of the palette, use the double-headed arrow
that appears when you point to the right edge of the palette.

12

Library palette

Allplan 2025

Structure
The box for the search tool is below the title bar of the Library palette. By entering the name of the node or parts thereof, you can reduce the number of nodes listed in the library. This makes it easier for
you to find a specific node.
When you open a folder and point to a node (see "Nodes" on page
26), you can see a list of input parameters and output parameters of
the node. In addition, you get further information (property and data
type) about these parameters. This example shows the Box node in
the Geometry\Objects folder:

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

13

Workspace
You create and edit scripts in the workspace of Allplan Visual Scripting. These scripts consist of different nodes (on page 26) that are
linked by connecting lines (on page 36). You drag the nodes from the
Library palette into the workspace. After having placed the nodes in
the workspace, you connect them by means of connecting lines.
Double-click in the workspace to open quick input (see "Your first
attempt at scripting - part 2" on page 47).

Right-click in the workspace to open a shortcut menu (see "Shortcut
menu of the workspace" on page 15) with tools for handling the
script.

14

Script view

Allplan 2025

Script view
The tools for changing the script view are in the upper-right area of
the workspace.

Zoom selection to zoom in on the selected nodes. If you have not
selected a node, this tool is grayed out.
Tip: You can also zoom by
moving the wheel button.

Zoom all to show the entire script in the workspace.
: Changes the size of the script view in percent. You can choose
from seven preset values.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

15

Shortcut menu of the workspace
The shortcut menu of the workspace provides tools for handling the
script:

Select all to select all nodes in the script.
Copy to copy all selected nodes and their connecting lines to the
clipboard. If you have selected a single node, this tool copies only this
node to the clipboard. Any connecting lines will not be copied, regardless of whether they lead to or come from this node.
Tip: To copy, you can also use CTRL+C.
Paste to paste all nodes and their connecting lines into the workspace after you have copied them to the clipboard by means of Copy.
Tip: To paste, you can also use CTRL+V.
Delete to delete all selected nodes and their connecting lines, regardless of whether they lead to (input ports) or come from (output
ports) a node.
Tip: To delete, you can also use the DEL key.
Zoom all to center the whole script in the workspace.
Tip: To center the whole script, you can also click
Zoom all (see
"Script view" on page 14) in the upper-right area of the workspace.

Note: You can find the Copy, Paste, Delete, and Select all tools on
the Edit menu, too.

16

Palette Designer palette

Allplan 2025

Palette Designer palette
The Palette Designer palette is docked at the right side of the Allplan
Visual Scripting window. You can use this palette to control how the
Properties palette of the scripted object looks in Allplan. You can
group visible parameters of different nodes under user-definable
terms and arrange these parameters on different tabs.

Position in the application window
The Palette Designer palette is to the right of the workspace.
Hover over the palette to temporarily show it. To show the palette all
Hide automatically. To minimize the palette,
the time, turn off
Hide automatically. With Close you can close the Paturn on
lette Designer.
To change the width of the palette, use the double-headed arrow
that appears when you point to the left edge of the palette.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

17

Visible parameters of nodes
The Palette Designer palette has two areas.
The lower Unassigned area displays all visible but unassigned parameters of all nodes in the workspace. To sort these parameters to
suit your needs, you can drag them from the Unassigned area into
the upper area of the palette. You can create Groups and Tabs in the
upper area. A group forms an area in the Properties palette in Allplan;
a tab creates a tab in Properties palette.
Sort the parameters within the Palette Designer palette by using
drag-and-drop editing. In doing so, you can drag parameters from
one Group into another Group, from one tab onto another tab, and
from the Unassigned area into the upper area of the palette and
back. This sorting of parameters is the basis for the look of the Properties palette in Allplan.
When you delete a Group or Tab in the upper part of the Palette
Designer palette, all information about this group will be deleted and
the visible parameters of the nodes will be moved back into the Unassigned area.
When you switch a node or a parameter of a node to invisible, the
relevant parameters will be removed from the Unassigned area.
When you run a script by selecting
Start (toolbar, Script menu, or
F5) while there are still parameters in the Unassigned area, the Properties palette in Allplan gets the "Unassigned" tab that lists all the
parameters that are not assigned (see illustration (2)).

18

Palette Designer palette

Allplan 2025

Start, the Properties
After you have run the script by selecting
palette has two tabs in Allplan (see illustration). The Tab name tab
lists the visible parameters in the New group area (see illustration
(1)). The Unassigned tab contains the visible parameters that are in
the “Unassigned” area of the Palette Designer palette (see illustration (2)).
If the Unassigned tab lists several parameters of different nodes,
their sequence matches the sort sequence in the “Unassigned” area
of the Palette Designer palette.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

19

Creating a new group (= area)
Click the New group button to create a new area for the Properties
palette in Allplan. You can use the shortcut menu to rename or delete
the area. To rename the area, you can also double-click its name.

Use

and

to expand and collapse the groups.

20

Palette Designer palette

Allplan 2025

Creating a tab
Use the left side of the Palette Designer palette to create the tabs
for the Properties palette in Allplan. Click
to create another tab.
You can use the shortcut menu to rename or delete the tab. To rename the tab, you can also double-click its name.

Note: The tabs and areas defined do not appear in the Properties
Start.
palette in Allplan until you run the script by clicking

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

21

Shortcut menus of the parameters
Both assigned parameters and unassigned parameters provide two
shortcut menus each.
By clicking the icons of the parameters, you open the shortcut menus shown in the following illustration:

Use Show in workspace to zoom in on the node that contains the
selected parameter so that this node is centered in the workspace.
Use Move to "Unassigned” (or the DEL key) to move the selected
parameters from the group into the Unassigned area.
Use Remove (or the SHIFT+DEL keys) to remove the selected parameters from the Palette Designer palette. In the workspace, the
to . You can find detailed inforicon in the node changes from
mation in "Structure of a node (on page 26)".
The second shortcut menu opens when you click the parameter
name. This shortcut menu provides the Rename tool to rename the
parameter. As an alternative, double-click the name of the parameter.

22

Palette Designer palette

Allplan 2025

To check whether the visible parameters of a node in the workspace
have already been added to and grouped in the Palette Designer
palette, open the shortcut menu of the node in the workspace and
click Select in palette designer. This centers and highlights the parameters in the Palette Designer palette.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

23

Watch list palette
You can display the watch list palette both from the view menu (on
page 7) and directly in the tooltip of the output port of a node parameter by clicking the

watch button.

If you select the
watch tool in the tooltip of the output port of a
parameter, you can add this parameter to the watch list palette.
The watch list palette is used to check the parameters it contains.
When you exit Allplan Visual Scripting, the watch list palette is automatically emptied.

Position in the application window
The watch list palette is docked on the right side of the application
window. Hover over the palette to temporarily show it. To show the
Hide automatically. To minimize the
palette all the time, turn off
Hide automatically. With close you can close
palette, turn on
the watch list.
To change the width of the palette, use the double-headed arrow
that appears when you point to the left edge of the palette.

24

Watch list palette

Allplan 2025

Shortcut menu of the parameters in the watch list palette
You can open the shortcut menu of a parameter contained in the
watch list palette by clicking on the parameter name. You will find
two tools in the Shortcut menu:
• Show on workspace: This centers the node containing the selected parameter on the workspace and zooms in on it.
• Remove: The selected parameter will be removed from the
watch list palette.

Note: If you have selected a parameter in the watch list palette by
clicking on it, you will see the preview of the corresponding element
in Allplan highlighted in color. The same happens if you select an entry
in the tooltip of the output port of a node parameter.
This allows you to check the geometry of your element in Allplan.

Allplan Visual Scripting

The user interface of Allplan Visual Scripting

25

Output window
If a script fails to load or run, the Output window opens, displaying
information about what type of error was detected and where it can
be found in the script. You can also show the Output window by adding a check mark to Output window on the View menu.
The Output window opens below the workspace.
Hide automatically. To
To minimize the output window, turn on
Hide automatically.
show the output window all the time, turn off
With Close you can close the output window.
To change the width of the Output window, use the double-headed
arrow that appears when you point to the upper edge of the window.

Showing the script location
When you have already saved the current script, the title bar of the
Allplan Visual Scripting window shows the path of the folder where
you saved the script.

26

Nodes

Allplan 2025

Components of a script
With Allplan Visual Scripting, you create visual programs in a workspace by connecting nodes by means of connecting lines. In doing so,
you define the logic for running the resulting visual program. This
chapter introduces the elements of Allplan Visual Scripting.

Nodes
By means of visual scripting, unexperienced users can create complex scripts without having to understand the underlying “Python”
programming language. To create a script, you place nodes in the
required sequence in the workspace. By entering input values for the
nodes, you make them process the underlying program code, which
initiates certain actions or output. The nodes are arranged in action
networks, which run in turn.

Structure of a node
Each node consists of a title bar (1), a middle area with properties (2),
and the lower area with the settings (3).

Each node contains plenty of information. By pointing to or clicking a
component of the node, you can see additional information and options.

Allplan Visual Scripting

Components of a script

27

Title bar
The title bar contains the icon and name of the node.
Point into the area of the title bar to open a tooltip with further information about this node.
Right-click the title bar or anywhere within the node to open a shortcut menu where you can rename the node. In addition, you can click
Select in palette designer to highlight the visible parameters of this
node in the Palette Designer palette.

28

Nodes

Allplan 2025

Properties area
The places where you can input or output data for nodes are referred
to as ports. These ports act as contacts for the connecting lines (on
page 36). By means of the input ports (4) on the left side, you enter
data into a node. Then, the node processes and outputs the data
through the output ports (5) on the right side. Data flow is always
from left to right.

Point to a port to open a tooltip with the name, property, and data
type of the port. Input ports require you to enter data of the type
displayed. After processing the input, the node outputs data of the
types displayed through the output ports.

In the tooltip of the output ports, you can click on the
watch
function to add the respective parameter to the watch list palette
(on page 23).

Allplan Visual Scripting

Components of a script

Click

29

to expand or collapse the values of a parameter.

This example shows the BoxBy2Points node. As you can see, the
StartPoint parameter consists of three values (StartPoint.X, StartPoint.Y, and StartPoint.Z). After clicking , you can separately control these values. This means that you can individually define whether and under which name a value is visible in the Properties palette
in Allplan.

Note: A red value indicates that this node requires values from
another node. To run this node, you must connect it with another
Start tool is grayed out as long as your script contains
node. The
nodes with red values. This means that you cannot run the script.

30

Nodes

Allplan 2025

You can make entries for the individual values on the right side of the
Properties area. In addition, you can define whether and under which
names the values are visible in the Properties palette in Allplan. Use
the ENTER key to confirm the names you entered. To close the box
with the properties, open another box with properties or click in the
workspace.
Note: If the parameter is visible in the Properties palette of Allplan,
you can also modify the parameter there. The changed value is then
visible in this place in the node (see also "Modifying parameters (on
page 61)").

Allplan Visual Scripting

Components of a script

31

Settings area
In addition to properties, each node has settings that you can use to
control the result of the object in the viewport of Allplan. With these
settings, you can also control whether the properties are visible in
the Properties palette of Allplan (see "Your first attempt at scripting
- part 2" on page 47).

• Create model objects: Creates objects as model data, as opposed to preview data.
• Create preview objects: Shows previews of the created objects
in the Allplan viewport.
• Create handles: Creates the generated object with or without
handles.
• Show in palette: Shows or hides all visible parameters of a node
(cf. above) in the Palette Designer palette and in the Properties
palette in Allplan.
• Turn on point numbering: Numbers points consecutively.

32

Nodes

Allplan 2025

• Note dialog line text: Click this button to open a box. The text
that you enter appears in the dialog line of Allplan.

Handling nodes
Tip: You can also select
several nodes by enclosing
them in a selection rectangle.
Tip: To handle nodes, you
can use the tools on the Edit
menu (on page 6) and on the
shortcut menu (see
"Shortcut menu of the
workspace" on page 15) of
the workspace.

When you click to select a node, it gets a thick blue border. You can
select several nodes in one go. To do this, select and hold the CTRL
key and click the nodes one after the other. You can then move the
selected nodes by means of drag-and-drop editing.
Use CTRL+C and CTRL+V to copy and paste selected nodes.
Use the DEL key to delete selected nodes. By deleting a node, you
also remove all its connecting lines (on page 36).
Note: CTRL+V and CTRL+C also allow you to copy and paste selected
nodes and the connecting lines between them across scripts.

Allplan Visual Scripting

Components of a script

33

Types of nodes
Nodes are the basic building blocks of Allplan Visual Scripting. Each
node contributes to the script as a whole.
A node is a predefined code block that processes incoming data
through input ports and outputs (partial) results through output
ports. For example, results can be objects, vectors, and values. Data
flow is always from left to right.
A node requires data so that the node can run its actions and then
output data. The incoming data and outgoing data can be completely
different, such as an integer or a list.
There are also nodes that have only output ports but no input ports.

The Library palette (on page 11) of Allplan Visual Scripting contains
the following folders with nodes:
• AddOns\WarpedSlabs to create, place, and modify warped slabs
(double-tee beams).
• Architecture\AxisInput: to select the assignment of a line axis
for an architectural element
• Architecture\Modification: to change the thickness of a wall
layer
• Architecture\Objects to create architectural objects (for example, a wall based on a path).
• Architecture\Preview: to create a preview for a vertical architectural element
• AreaRepresentation to assign 2D surface attributes to an object.
• Attributes to determine attribute values of objects, change attribute values, and create new attributes.

34

Nodes

Allplan 2025

• Basics\Objects: to create a 3D geometry element with properties
• Basics\Tools: to create the plane references for several stories
• General to assign the current format properties in Allplan to the
model objects, for example.
• Geometry to perform geometric operations (for example,
Boolean operations, transformations) and create geometric objects (for example, curves, grids, geometric solids, planes, vectors).
• ImportExport to import and export data from and to files.
• InputControls to add boxes, check boxes, combo boxes, selection lists, and sliders for parameters.
• Layout: to insert tables and text elements; create style elements,
surface elements, and hatching elements
• List to read elements from lists (List\Access), create a list and fill
it with elements (List\Fill), and modify lists. For example, ListReverse reverses the sequence of the list elements (List\Modify). A
list is a collection of elements or entries.
• Math to perform mathematical operations (for example, elementary arithmetic, trigonometric functions, algebraic functions).
• ModelObject to edit objects by filtering or matching geometries
or parameters.
• Palettes to create palettes with properties.
• PythonPartsElements\ImportExport to import and export elements from and to drawing files.
• Reinforcement to create and place reinforcement.
• SectionsAndViews to create views and sections of objects.
• String: define or format text.
• StructuralFraming to create or modify beams and columns.
• UserObjects\Fixture to create fixtures, placements of fixtures,
and fixture foils.
• UserObjects\PythonPart: create PythonPart foils.

Allplan Visual Scripting

Components of a script

35

• UserObjects\VisualScript: run VisualScripts, modify VisualScript
parameters, read VisualScript parameters from a file, allow VisualScript parameters to be entered.
• Workflow: perform workflows such as branching a script, pausing or restarting the script.

36

Connecting lines

Allplan 2025

Connecting lines
Connecting lines connect nodes to create relationships and to define
how a visual program runs. Think of connecting lines as electrical
wires that transport data pulses from one node to the next node.
Connecting lines show the data flow for running the algorithm.
Connecting lines connect the output port of a node with the input
port of another node. This directionality defines the data flow in the
visual program. Although you can arrange the nodes freely in the
workspace, the program generally runs from left to right because
the output ports are on the right side of the nodes and the input
ports are on the left side.

Creating connecting lines
You create a connecting line by clicking a port and then clicking the
(compatible) port of another node (port-to-port connection). While
you are doing this, the dashed connecting line is attached to the cursor. As soon as the cursor hovers over a possible destination port,
you can see a ToolTip with the property and data type of this port.

Allplan Visual Scripting

Components of a script

37

Ports expect data of a specific type. You can connect ports of the
same data type only. If you try to connect two ports that do not
match, the program displays a symbol and cancels the operation.

After you have successfully connected two ports, the connecting
line turns into a continuous line. Data always flows from the output
port to the input port through this connecting line. When connecting
two ports, you can start and end the connecting line at either port.
This doesn’t make any difference.
You can also connect the output ports of each node with several
input ports of other nodes. This also works the other way round: You
can connect several output ports with a single input port.

38

Connecting lines

Allplan 2025

Editing connecting lines
Often, you often need to change the way the visual program runs. To
do this, you can edit the connections represented by connecting
lines. To edit a connecting line, point to this connecting line and rightclick to open the shortcut menu.

Tip: You do not even need to
open the shortcut menu: To
remove a connecting line
from a port, select and hold
the SHIFT key and click the
port. The connecting line is
attached to the cursor and
can be connected with
another port or deleted. To
delete the connecting line,
click in the workspace or
select ESC.
To remove a connecting line
from a port, you can also
select and hold the CTRL
key and click the port.

• Reconnect start: Removes the connecting line from the output
port so that you can place the connecting line at another output
port.
• Reconnect end: Removes the connecting line from the input port
so that you can place the connecting line at another input port.
• Disconnect: Deletes the connecting line.

Allplan Visual Scripting

Running a script

39

Running a script
If you have correctly connected all nodes in the current script, you
Start (toolbar, Script menu, or F5).
can run the script by clicking
As a result, the Properties palette opens in Allplan. In addition, Allplan
shows the result of the script (object) or runs the defined workflow
in the workspace.
You can change the parameters both in the Properties palette and in
the script itself.
Note: You cannot select the
Start tool until the script is complete.
For example, look for red input ports (see "Structure of a node" on
page 26).

1 - Properties palette: You can change the properties of the script by means
of the palette. The script defines which properties are visible in the palette.
2 - Objects: Objects generated by the script are visible in the workspace of
Allplan. After closing the script, you can create these objects in Allplan.
2 - Workflows: Workflows generated by the script process Allplan data.

40

Connecting lines

Allplan 2025

Allplan Visual Scripting

Your first attempt at scripting - part 1

41

Your first attempt at
scripting - part 1
You learned a lot about theoretics in the preceding chapters. So, it’s
high time to get some practice.

To create a script
1

Start Allplan.

2 Create a new project, for example, Visual Scripting.
Drawing file 1 of the new project is open.
3 For the following steps, the representation in the plan view is
Window
sufficient. Go to the Quick Access Toolbar, open the
drop-down list and change to 3 Viewports.
4 Go to the Actionbar and open a role that contains the UserDefined Objects task, for example, the architecture role.
5 Open the User-Defined Objects task.
This task contains the Visual Scripting task area.
6 Select the

Allplan Visual Scripting tool.

You can see the Allplan Visual Scripting window. Allplan stays open in the background.
Note: Make sure that the Allplan Visual Scripting window does not
hide the Allplan workspace or palettes.
Resize the Allplan Visual Scripting window accordingly.
7 Point to Palette Designer at the right edge of the Allplan Visual
Scripting window.
8 To show the Palette Designer palette all the time, click
automatically.
9 To create a new script, click
Scripting window.

Hide

New on the toolbar of the Visual

42

Connecting lines

Allplan 2025

Tip: You can find the
New
tool on the File menu too.

10 Go to the search box of the Library palette and enter the following: circle
The Library palette lists only the nodes whose names or descriptions contain the word “circle”.
11 Point to the Circle3D node and drag it into the workspace.
A preview of the Circle3D node is attached to the cursor.

After you have placed the node in the workspace, the Palette
Designer palette - Unassigned area lists the visible parameters
of the Circle3D node.
Tip: You can find the
Start tool on the Script
menu too. As an alternative,
select F5.

12 Click
Zoom selection in the script view (upper-right area of
the workspace). This zooms in on the selected node so that it is
centered in the workspace.
13 To run the script, click

Start on the toolbar.

Allplan Visual Scripting

Your first attempt at scripting - part 1

43

Allplan displays the circle in the workspace and opens the Properties palette. The Properties palette contains the visible parameters of the Circle3D node.
Note: When you slowly move the cursor horizontally across the
parameters of the Properties palette, the cursor changes to a
double-headed arrow as soon as you reach the area between the
parameter names and the boxes. You can now change the width
of this area.

44

How Allplan Visual Scripting and Allplan interact

Allplan 2025

How Allplan Visual Scripting and Allplan
interact
Before you continue with your small script, let’s see how the entries
in Visual Scripting affect the results in Allplan. If you think that the
preceding chapters explained everything in detail and you do not
need any further information, you can also skip this section and continue with the script (see "Your first attempt at scripting - part 2" on
page 47).
After you have placed the node in the workspace, the Palette Designer palette - Unassigned area lists all visible parameters of this node.
In this example, the Visibility in palette setting is selected for all parameters of the node.

Start tool, the ProAfter you have run the script by selecting the
perties palette in Allplan lists these visible parameters in the area
under the node name, that is, Circle3D in this example.

Allplan Visual Scripting

Your first attempt at scripting - part 1

45

You can drag the visible parameters from the Unassigned area into
the upper area of the Palette Designer palette. It’s the upper area
where you define how the Properties palette looks in Allplan. You
can find detailed information in "Palette Designer palette (on page
16)" and "Working with the Palette Designer palette (on page 53)".
You will learn how to change the names of visible parameters in the
node, thus controlling how the Properties palette looks in Allplan.
When a node creates its own area in the Properties palette in Allplan,
you can define the name of this area in the Palette Designer palette
(see "New group = creating an area (see "Creating a new group (=
area)" on page 19)").

46

How Allplan Visual Scripting and Allplan interact

Allplan 2025

As described in "Structure of a node (on page 26)", you can rename
the parameters in the node. In addition, you can decide for each parameter whether and under which name it is visible in the Properties
palette. Use the ENTER key to confirm the new name.

Note: If you have made any changes to the logic of your script, such
as deleting or adding nodes, you will see a note about this in the prorun the script
perties palette of Allplan. You will be prompted to
again in the visual scripting application window. As a result, you will
see the adjusted parameters in the properties palette of Allplan.

Allplan Visual Scripting

Your first attempt at scripting - part 2

47

Your first attempt at
scripting - part 2
You dragged the Circle3D node into the workspace of Allplan Visual
Start. The next step is to
Scripting and ran the script by selecting
add a second node to the script.

To add a node to the script
1

You want to create three copies of the initial circle. The centers of
the circles are 2 m from one another.
This operation is a geometric transformation.
Open the corresponding folder in the Library palette. Drag the
PlaceByVector node into the workspace and place it to the right
of the Circle3D node.
Tip: If you know a part of the node name, you can also use
quick input. To open quick input, double-click in the workspace. Enter the node name or parts thereof in the box.

Quick input lists the nodes that match your entry. Doubleclick the required node to place it in the workspace and to
close quick input.

48

How Allplan Visual Scripting and Allplan interact

Allplan 2025

2 Click
Zoom all in the script view (upper-right area of the
workspace). This zooms in on the two nodes so that they are
centered in the workspace.
Tip: You get the same result
by clicking Zoom all on the
shortcut menu (see
"Shortcut menu of the
workspace" on page 15) of
the workspace or on the File
menu (see "view menu" on
page 7).

3 Link the two nodes. This means that you connect the output
ports of the node that supplies the values with the input ports of
the node that processes the values.
The reference point is the center of the circle. To do this, you
must connect the CenterPoint output port of the Circle3D node
with the ReferencePoint input port of the PlaceByVector node
by means of a connecting line.
Click the CenterPoint output port followed by the ReferencePoint input port. Before you click the input port, the tooltip
of the port opens with the port name as well as property and data
type.

Allplan Visual Scripting

Your first attempt at scripting - part 2

49

4 To copy the circle, you must connect the Circle output port with
the ObjectsToPlace input port.
Note: If you want to correct a connection because you clicked a
wrong input port, select and hold the CTRL key (or SHIFT key) and
click the input port. The connecting line is attached to the cursor
and can be connected with the correct input port.
To delete the connection, remove the connecting line from the input port and click in the workspace.
Tip: Each connecting line has a shortcut menu (see "Editing
connecting lines" on page 38). By using the tools on this shortcut
menu, you can change the start (output port) and end (input port)
of the connecting line or delete the connecting line.
5 To define the number of copies, open the Properties of Count
(number of placements). Enter 4.

50

How Allplan Visual Scripting and Allplan interact

Allplan 2025

6 Specify how far from one another you want to place the circles.
Open the Properties of Distance and enter X = 2 m.
As you entered the Distance immediately after the Count (number of placements), you automatically closed the Count box by
opening the Distance box.
Note: If you have made a mistake, you can undo it with
Undo
(CTRL+Z or Toolbar or Edit menu). You can restore undone actions by clicking
Restore (CTRL+Y or the toolbar or the Edit
menu).
7 To close the Distance box, click in the workspace.

Allplan Visual Scripting

Your first attempt at scripting - part 2

8 Click

Start and look at the result in Allplan.

51

52

How Allplan Visual Scripting and Allplan interact

Allplan 2025

9 Allplan displays the circles in red. This means that the circles are
preview objects. If you closed the script now, there would be no
model data. To create model objects in Allplan, you must add this
information to the nodes. To do this, select the Create model objects button in the settings area of each node. By selecting this
button in the Circle3D node, you create the initial circle as a model
object in Allplan. By selecting this button in the PlaceByVector
node, you also create the three copies of the circle as model data
in Allplan.

As a result, Allplan displays the circles with the format properties
that are selected in Allplan.
Note: You can find information about the other buttons in the
Settings areas of the nodes in "Structure of a node (on page 26)".

Allplan Visual Scripting

Your first attempt at scripting - part 2

53

Working with the Palette Designer palette
At the moment, you can find all visible parameters of both nodes in
the Unassigned area of the Palette Designer palette. The next step
is to sort these parameters into two areas and to create a separate
tab for each area.

To use the Palette Designer palette
1

Start with the parameters of the Circle3D node.
In this small script, it is easy to find out which parameters in the
Unassigned area of the Palette Designer palette belong to which
node. If your script is much more complex, you can quickly identify the required parameters as follows: Open the shortcut menu
(see "Shortcut menus of the parameters" on page 21) of a node
and click Select in palette designer. This centers and highlights
the parameters of the node in the Unassigned area.
Click the parameters of the Circle3D node and drag them into the
upper area of the Palette Designer palette.
Note: To check which parameters belong to which node, you can
open the shortcut menu of the parameters (see "Shortcut menus
of the parameters" on page 21) in the Palette Designer palette
and click Show in workspace. This zooms in on the node so that it
is centered in the workspace.

54

Working with the Palette Designer palette

Allplan 2025

This creates a new group in the upper field of the Palette Designer palette, in which the parameters of the Circle3D node are
stored.
2 Click
Start on the toolbar and look at the changed Properties
palette in Allplan.

Allplan Visual Scripting

Your first attempt at scripting - part 2

55

The Properties palette in Allplan has two tabs. The Tab name tab
- New group area contains the visible parameters of the Circle3D
node. The Unassigned tab contains the visible parameters of the
PlacebyVector node. These parameters are still in the Unassigned area of the Palette Designer palette. The next step is to sort
these parameters.
3 Click the
New group button in the Palette Designer palette.
This creates a second area in the Properties palette. Enter the
following name for the new area:
Place elements based on number and distance
4 Drag the parameters of the PlacebyVector node into the new
area.

5 Rename the upper New Group by using the shortcut menu. Enter
3D circle for the new name.

56

Working with the Palette Designer palette

Allplan 2025

6 To see the result in the Properties palette of Allplan, click
Start.

7 Adjust the names of the parameters displayed in the Properties
palette. You can do this directly in the nodes (see "How Allplan Visual Scripting and Allplan interact" on page 44). Use the ENTER
key to confirm the new name.

Allplan Visual Scripting

Your first attempt at scripting - part 2

57

The result might look like this:

8 The Palette Designer palette provides another option to control
the look of the Properties palette in Allplan. You can create tabs
(see "Palette Designer palette" on page 16). Use your small script
to try this right now.
Click
on the left side of the Palette Designer palette. This
creates a page (= tab in the Properties palette). Enter Elements
for the name of the new page.

58

Working with the Palette Designer palette

Allplan 2025

9 Open the shortcut menu of the first page and rename it. Enter
Circle for the new name.

10 Click the Place elements based on number and distance group
and drag it onto the Elements page.

Allplan Visual Scripting

Your first attempt at scripting - part 2

11 To see the result in the Properties palette of Allplan, click
Start.

59

60

Saving the script

Allplan 2025

Saving the script
It’s time to save the script.
This creates a project file (*.avsprj).
Note: If you have created and finally saved VisualScripting scripts in
previous versions of Allplan 2025, they were saved as *.pyp files. You
can still import and edit these files. When saving, this data is now
stored as *.avsprj project file.

To save the script
1

To do this, click
ting window.

Save on the toolbar of the Allplan Visual Scrip-

Note: You can find the

Save tool on the File menu too.

2 You can see the Save As dialog box. Select the required folder
(Project, Office, or Private), enter a name (for example,
Circle.avsprj), and click Save.
Note: If you do not enter a name, the program automatically saves the script as an “Untitled script.avsprj”.
You have now saved your script in a project file.
The title bar of the Allplan Visual Scripting window shows the path
of the saved object.

Allplan Visual Scripting

Your first attempt at scripting - part 2

61

Modifying parameters
Before you complete your small script, let’s see how you can change
parameters both in the script and in Allplan.
At the moment, the Allplan Visual Scripting window is open and the
result of the script is visible in Allplan. In this situation, you can change
parameters in various ways:
• Use the script.
• Use the Properties palette of Allplan.
• Use the object in the workspace of Allplan.
Here’s a small example:

To modify parameters
You want to change the radius of the circle.
To do this, you have the following options:
• Enter the required value in the 3D circle area on the Circle tab
the Properties palette of Allplan (1); or
• enter the required value in the yellow box of the circle in the
workspace of Allplan (2).
Or
• change the radius by dragging the handle of the circle (3).
Or

62

Modifying parameters

Allplan 2025

• open the properties of the Radius parameter in the Circle3D
node in the workspace of the Allplan Visual Scripting window
and enter the required radius (4).

The new radius automatically applies to all four objects.
Notes: If you select the node in which the parameter to be modified is
located by clicking on it, the corresponding object in Allplan will be
highlighted in the selection color (here in green). This gives you visual
control that you are working on the desired node.

Allplan Visual Scripting

Your first attempt at scripting - part 2

63

Another way to check modified parameters is to use the watch list
(see "Watch list palette" on page 23) palette. To do this, include the
appropriate parameters in this palette. This is done by opening the
tooltip of the parameter's output port and clicking

watch.

64

Modifying parameters

Allplan 2025

Your first attempt at
scripting - part 3
Remember: You saved the small script before you modified the Radius parameter. So that you can also use the scripted objects in Allplan,
you must save these objects too.

Save objects and finish script
1

If you would like to keep the scripted objects in the Allplan drawing file, please create the objects in Allplan before closing the
script.
Until now, only the objects in the Allplan drawing file are displayed,
which means that if you close the script, the objects in Allplan will
disappear.
Click on the File menu or on the toolbar and select Create Objects in Allplan.
What this does is trigger the creation of the object defined in the
script in Allplan.

2 You can see the Save As dialog box. Select the required folder
(Project, Office, or Private), enter a name (for example,
circle.pyp), and click Save.
The objects have been saved in Allplan. The objects are displayed
in the Allplan window, the properties palette has been closed.
Connection between Allplan and the Visual Scripting application
window has been lost.
3 To close Allplan Visual Scripting, click the close button in the
upper-right corner of the Allplan Visual Scripting window. As an
alternative, select Exit (Alt + F4) on the File menu.

Allplan Visual Scripting

Your first attempt at scripting - part 3

65

4 As the last step involved modifying a node (changing the radius),
a dialog box asks whether you want to save the script, thus
overwriting the previous version.
Click Save.

The Allplan Visual Scripting window closes. You are in Allplan. The
drawing file with the scripted object is open.

Note: If you have not created an object with your script, you will see
the following note when you try to use the Create Objects in
Allplan tool:

66

Visual Scripting object in

Allplan 2025

Visual Scripting object in
In our little exercise, you used Allplan Visual Scripting to create an
object and also save it in Allplan.
The object is displayed in Allplan with the format properties that weAllplan Visual Scripting function was
re set in Allplan before the
opened. If you open the shortcut menu of the object (PythonPart),
you will find some modification functions:

Special functions for the PythonPart are:
PythonPart: You can use this tool to open the Properties palette.
If you make changes to the parameters and then save them, a copy
of the original object is created with the changed parameters.
Unlink Smart Symbol: You can use this tool to resolve the structure of the PythonPart relocation. You can then modify individually
the design entities that make up the PythonPart installation.

Allplan Visual Scripting

Examples provided

67

Examples provided
Allplan comes with various scripted examples. You can find them in
the following Allplan path: ETC\Examples\VisualScripting
Here’s a small example:

To use the examples
 Allplan is running;
Allplan Visual Scripting is running; the Allplan
Visual Scripting window is open.
1

Click
Open on the toolbar of Allplan Visual Scripting. As an
alternative, you can select this tool on the File menu.

2 Select the Examples folder in the Open dialog box.

68

Visual Scripting object in

Allplan 2025

3 Open the Geometry - Interactors folders and select
LoftCircleColumn.pyp. This example lofts, copies, and
places 3D circles along a path.
Click Open.

The script appears in the workspace. The title bar of the Allplan
Visual Scripting window shows the path of the selected object.
Note: Of course, you can sort the visible parameters of the nodes
in the Palette Designer palette to suit your needs and create
groups and tabs or rename groups and parameters. If you want,
you can try it for yourself.
4 Click

Start.

5 The dialog line of Allplan prompts you to enter a 3D line. Draw the
line in the workspace. As an alternative, define the line by entering
dx, dy, and
dz in the dialog line.

Allplan Visual Scripting

Examples provided

69

Allplan creates the objects in the viewport and opens the Properties palette.

6 As you learned in "Modifying parameters (on page 61)", you can
change the parameters of the objects in Allplan. To do this, you
can use the Properties palette or the handles or boxes. But you
can also make modifications directly in the nodes in Allplan Visual
Scripting.
To use the modified script later, click Save as on the File menu of
the Allplan Visual Scripting window. (File menu). You can see the
Save As dialog box. Select the required folder (Project, Office, or
Private), and click Save.
Note: The Save As dialog box also opens when you select the
Save tool (toolbar or File menu). This ensures that you do not inadvertently overwrite the examples.

70

Visual Scripting object in

Allplan 2025

7 Before you exit Allplan Visual Scripting, you can decide whether
you want to save the object in Allplan.
8 If you would like to keep the scripted objects in Allplan, please
create objects in Allplan fist before closing.
Until now, the objects in Allplan are only shown as a preview,
which means that when you close the script, the objects in Allplan
would disappear.
Click on the File menu or on the toolbar and select Create Objects in Allplan.
What this does is trigger the creation of the object defined in the
script in Allplan.
9 You can see the Save As dialog box. Select the required folder
(Project, Office, or Private), and click Save.
10 The objects have been saved in Allplan. The objects are displayed
in the Allplan window, the properties palette has been closed.
Connection between Allplan and the Visual Scripting application
window has been lost.
11 To close Allplan Visual Scripting, click the button in the upperright corner of the Allplan Visual Scripting window. As an alternative, select Exit (Alt + F4) on the File menu.

Allplan Visual Scripting

Index

71

Index
A
Allplan - Properties palette
create areas 16, 53
create tabs 16, 53
enter names for areas 44, 47
modifying parameters 61
renaming parameters 44, 47
visibility of parameters 26
Allplan Visual Scripting 3
edit menu 6
file menu 5
help menu 8
library palette 11
menu bar 5
Palette Designer palette 16, 53
script menu 7
selecting script view 14, 15
shortcut menu of workspace
15
show the script location 25
toolbar 9
user interface 4
view menu 7
Watch list palette 23
workspace 13

C
components of a script 26, 36
connecting lines
creating 36, 47
definition 36
deleting 15, 38
editing 38
reconnecting 38

D
displaying the script 14, 15

M
modifying parameters 61

N
nodes
copy+paste 15
creating model objects 47
creating preview objects 26,
47
definition 26
deleting 15, 38
entering properties 47
handling 32
modifying parameters 61
structure 26
types 33

O
output window 9

Q
quick input 13, 47

R
resizing 4, 41

S
script
creating 9, 41
displaying 14, 15
Redo 6, 9
running 9, 39
save as 67
save with object 64
saving 9, 47, 64
starting 9, 39, 41, 47, 67
Undo 6, 9
search 11, 13, 41

V
visual programming 2

Z
zoom selection 14, 41

72

Index
zooming 14, 15, 47

Allplan 2025


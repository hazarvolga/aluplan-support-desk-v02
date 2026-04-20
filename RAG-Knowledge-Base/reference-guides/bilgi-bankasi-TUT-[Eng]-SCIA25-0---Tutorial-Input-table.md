# TUT [Eng] SCIA25.0 - Tutorial Input table

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA25.0 - Tutorial Input table-yqsnhhgoex0.pdf`

---

**Toplam Sayfa:** 16


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
Input table

Tutorial – Input table
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2024 SCIA nv. All rights reserved.
2 MC – 20/01/2025

Table of contents
Table of Contents
Table of Contents............................................................................................................................................... 3
Introduction ......................................................................................................................................................... 4
Chapter 1: Opening the input table ......................................................................................................... 5
Minimize/maximize ............................................................................................................................. 6
Move ....................................................................................................................................................... 6
Pin/floating ........................................................................................................................................... 7
Chapter 2: Data ............................................................................................................................................ 9
Available data ...................................................................................................................................... 9
Viewing and hiding properties ...................................................................................................... 10
Selecting elements ........................................................................................................................... 10
Editing data ........................................................................................................................................ 11
Editing one value ............................................................................................................................11
Editing multiple values ..................................................................................................................12
Excel ..................................................................................................................................................13
Copying an element .......................................................................................................................14
Viewing and hiding elements ......................................................................................................... 14
Deleting elements ............................................................................................................................. 16
Printing data ....................................................................................................................................... 16
.
MC – 20/01/2025 3

Tutorial – Input table
Introduction
The input table enables the user to numerically introduce or edit project data. Numerical data can also be handled
simply by a Copy/Paste from SCIA engineer into Excel and vice versa.
Through this document, you will be guided into de different possibilities offered by this functionality such as:
• Numerical input of data or copy/paste Excel
• Renaming or renumbering elements
• An easy way to adapt the model (copy, delete, edit properties…)
• …
4 MC – 20/01/2025

Chapter 1 – Opening the Input table
Chapter 1: Opening the input table
This tutorial uses a simple example to show the different functionalities. Start by opening SCIA engineer and draw a 1D
member with an arbitrary length in the XY workplane.
Open the input table via Tools>Input table, the table will appear somewhere inside the graphical window.
The table can be moved, minimized and pinned just like the input panel.
MC – 20/01/2025 5

Tutorial – Input table
Minimize/maximize
Click once to minimize the input table.
Click again to maximize the input table.
Move
Click and hold to start moving the input table.
The input table can be moved outside of the graphical window of SCIA engineer which allows you to use multiple
monitors in a way that suits you.
When the table is moved outside of the graphical window, minimizing is not possible anymore to prevent you from not
finding the table.
6 MC – 20/01/2025

Chapter 1 – Opening the Input table
Pin/floating
The table can float on the graphical window but can also be pinned to the sides.
Start moving the input table, a coloured area should appear around the graphical window.
Drag the input table to the coloured area, there will be two options.
• A part of the coloured area shows a brighter line, release the input table now and it will be pinned to the side
and keep the same size.
MC – 20/01/2025 7

Tutorial – Input table
• Move the input table further into the coloured area and a bigger area will be shown, the table will be pinned
to the side and the size will change to the same size as the graphical window.
This possible on all sides of the graphical window and in the corners.
8 MC – 20/01/2025

Chapter 2 – Data
Chapter 2: Data
Available data
The available data is divided in three categories.
Click the drop down menu next to to change the category.
Switching between data in one category is done by clicking on the icons on the bottom of the input table. The icons are
the same as in the input panel. By default the following data is available.
The category ‘structure’ contains
• Nodes
• 1D members
• 2D members
• Supports in node
• Supports on 1D
• Line supports on 1D
• Line supports on 2D edge
The category ‘loads’ contains
• Point loads in node
• Point loads on 1D
• Free point loads
• Line loads on 1D
• Line loads on 2D edge
• Surface loads on 2D
The category ‘libraries’ contains
• Layers
• Materials
• Cross-sections
This does not include all available data, some tables are hidden by default. To open more information click with the
right mouse key on the bottom part of the input table. This will open a selection menu where you can choose which
tables to show and which to hide.
MC – 20/01/2025 9

Tutorial – Input table
Viewing and hiding properties
The properties visible in the input table depend on the selection made in the column selector.
Click to open the column selector and select X,Y and Z to be visible.
Selecting elements
When an element is selected in the 3D model, this element is highlighted in the input table. You can also select
elements directly from the input table.
Click the row number of the element you want to select once, that row will be highlighted and the element will also be
selected in the 3D model. Hold the CTRL button and click on the row numbers to select multiple elements.
You can also select elements that have the same property.
• Click on the cell Z of node 1, the value is 0.
• Click on ‘select by property in cell’.
• All nodes with Z=0 will be selected
This function works for all possible properties. If some elements are already selected while using this function, they will
not be deselected if they do not have the right property.
10 MC – 20/01/2025


## Sayfa 11

Chapter 2 – Data
Editing data
Editing one value
In order to change a certain value, you simply need to select the cell that has to be adapted and enter the new value.
• Click the value X of node 1
• Type the new value: 0
• Press enter
The modification is instantaneously taken into account in the representation of the model in the graphical window
after pressing ‘enter’.
MC – 20/01/2025 11

Tutorial – Input table
Editing multiple values
Multiple values can be changed at the same time.
• Select the Y value of node 1 and 2
• Type the new value, 1, in the editbox and press ‘apply edit’.
• The value of all selected cells are changed immediately in the input table and in the 3D model.
The values you change do not need to be from the same property, it is also possible to change both X, Y and Z
coordinates at the same time for example.
Note: When you select certain cells, this will not be shown in the 3D model. An element is only selected in the 3D model
when it is highlighted in the input table.
Note: If you want to rename all the elements, you can select the whole column and type ‘n1’. Because all the elements
will have the same name, they will be automatically changed to the next possible number
• For example, 4 nodes are given different names
• Select the column ‘name’
• Type N1 in the edit box
• All nodes are renamed from n1 to n4
12 MC – 20/01/2025

Chapter 2 – Data
Excel
In Excel, you can edit data easily and then reuse it in SCIA Engineer. You may also directly create all the data in Excel and
export it to SCIA Engineer using a Copy/Paste procedure. To edit a table using Excel, you need to follow these steps:
1. Select the data that has to be edited then select Copy in the list after a right click on the table. Remark: It is
also possible to use the different keyboard shortcuts CTRL+C to copy, CTRL+V to paste and CTRL+A to
select all the rows.
2. Open Excel and paste the table in it. In the following example, we will change the values for Coord Y to 2 and
copy the table from excel.
3. Paste the value into the input table
4. The data in the table and in the graphical window is changed immediately
MC – 20/01/2025 13

Tutorial – Input table
Copying an element
It is possible to copy elements directly from the input table. When doing this you will need to define offset coordinates
in the editbox.
• Open the tab ‘1D members’ in the input panel
• Select row 1
• The member will be selected, you will copy this 1m further on the Y axis
• Type the offset coordinates (0;1;0) in the editbox, to divide the coordinates you use the spacebar.
• Click ‘copy row’
If you do not give an offset to where a new element should be copied, SCIA engineer will give a warning:
Viewing and hiding elements
It is possible to hide elements in the 3D model and hiding them in the input table as well.
• Hide the second element in the 3D model by selecting it and using the function ‘hide selected’
• Toggle ‘visibility in table’ off, if this was toggled on
14 MC – 20/01/2025

Chapter 2 – Data
• The element is hidden in the 3D model, but shown in the input table
• Toggle the ‘visibility in table’ on and the hidden elements are also hidden in the table
It is also possible to show only the elements that are selected in the 3D model in the input table.
• Toggle ‘selected rows only’ on
• The input table will become empty
• Select one of the elements
• Only that element will be shown in the input table
MC – 20/01/2025 15

Tutorial – Input table
Deleting elements
You can delete an element with the input table by selecting the element and click ‘delete row’.
SCIA will always ask you if you want to delete certain elements or if it is not possible to delete a certain element.
Printing data
A table can be imported in the engineering report by using the function ‘table to report’
Here you can make some changes in what elements are visible and insert it into the report.
If you want to edit this further in the engineering report you can use our manual about the engineering report.
16 MC – 20/01/2025

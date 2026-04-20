# TUT [Eng] SCIA25.0 - Tutorial User blocks-22xzex0b10f (1)

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA25.0 - Tutorial User blocks-22xzex0b10f (1).pdf`

---

**Toplam Sayfa:** 9


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
USER BLOCKS

| \ SCIA ENGINEER
TUTORIAL
USER BLOCKS |
| --- |
|  |


Tutorial – User blocks
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2025 SCIA nv. All rights reserved.
2 BV – 2025/01/06

Table of contents
Table of Contents
Table of Contents .................................................................................................................................................... 3
Introduction ............................................................................................................................................................ 4
Using the user blocks .............................................................................................................................................. 5
Creating the user block ....................................................................................................................................... 5
Storing the user block to the library .................................................................................................................... 5
Inserting the user block into another project ...................................................................................................... 5
Import user block parameters ............................................................................................................................. 6
Limitations of the import ..................................................................................................................................... 6
Different national code in the imported user block and current project .......................................................... 6
Parameters ............................................................................................................................................................ 6
Example ............................................................................................................................................................... 7
BV – 2025/01/06 3

Tutorial – User blocks
Introduction
SCIA Engineer enables you to make a library of your projects that are used over and over again. These projects may be at
any time included into a newly created project or appended to an earlier created and currently edited project.
The projects in this user-created library are called ‘User blocks’ and the library is called ‘User block library’.
This tutorial will explain:
• How to create a user block;
• How to store a user block;
• How to insert a user block;
• The limitations of the import of a user block.
Finally, a practical example is given to illustrate these steps on a specific project.
4 BV – 2025/01/06

Tutorial – User blocks
Using the user blocks
The application of user blocks can be divided into three independent steps. The steps must be carried out in the given
order and all of them must be made.
Creating the user block
A user block can be created as a standard project. There are no explicit restrictions to it. Usually, you will be working on
your project and either at the end or some time during the design phase you decide to make a user block of the current
state of the project.
Then the only thing that must be done is save the project to the disk. It may be useful, however not compulsory, to use
function ‘Save As’ and give the project such a name that gives a hint about the structure in the project.
Storing the user block to the library
In order to be usable as a user block, the project must be stored in the ‘User block library’ folder (see Menu bar > View >
Global UI settings > tab Templates & directories > Show directories for ‘User block libraries’):
This may be achieved in two ways.
• You specify the proper path in the ‘Save As’ dialogue (see paragraph above) and save the project directly to the
‘User block library’ folder.
• You save the project to your common project folder and then copy the file to the ‘User block library’ folder.
The file may be copied in any file-management tool (e.g. Windows Explorer, Total Commander, My Computer
dialogue, etc.)
Tip: The user blocks may be stored not only in the given ‘User block library’ folder, but they may be arranged in a tree of
subfolders. The subfolders may then group user blocks that have something in common. This arrangement may lead to
easier and clearer application of user blocks, especially if a long time passes from the time they were created and
stored.
Inserting the user block into another project
The procedure for insertion of a user block into a project:
• Go to the Input panel and select the command ‘User blocks’ (you can find it in the workstation Structure, in the
category Import & Blocks) or you can search for it in the SCIA Spotlight.
• A ‘User block wizard’ opens on the screen. Its left-hand side window shows the organisation of the ‘User block
library’ folder, i.e. it shows any possible subfolders. The right-hand side window then displays all available user
blocks saved in the appropriate folder or subfolder.
• Select the required folder.
• Select the required user block.
• Click ‘OK’ in order to insert the block to the current project.
• Select the required options for the import (see chapter ‘Import user block parameters’).
• Position the user block to the desired place and click the left mouse button to put the block there.
• If required, repeat the previous step as many times as required or necessary.
Note: If the user block is a parameterised project, the program asks you to provide all necessary parameters in order to
complete the definition of the user block.
BV – 2025/01/06 5

Tutorial – User blocks
Import user block parameters
Import type:
• ‘Only structure’: only structural members (1D Members, 2D Members (slabs, shells, etc.)) will be imported.
• ‘Structure with all other data’: both the structure and all other defined data (such as supports, loads, load
cases, connections, etc.) will be imported.
• ‘Structure with selected other data’: the structure will be imported together with user-selected model and
other data:
o Checkbox ‘Model’: if ON, the model data (e.g. supports) will be imported.
o Checkbox ‘Loads’: if ON, the loads will be imported.
o Checkbox ‘Connections’: if ON, the connections will be imported.
• ‘Only other data’: only the model and other additional data will be imported. No structural member will be
added to the current project.
Import structure into:
• ‘New layers’: the structure will be imported into new layers. The number of newly created layers corresponds
to the number of layers in the user block.
• ‘Identical layers by name (when exist)’: the import procedure tries to place the structural members from the
user block into identical layers in the current project – if such layers exist. In necessary, new layers are created.
• ‘Current layer’: the whole user block is imported into the current (active) layer of the current project.
Load cases:
• ‘Add block library item’: new load cases are added in the Load case manager. The number of added load cases
is equal to the number of load cases stored in the imported user block.
• ‘Collect block library item by name’: the import procedure compares the names of load cases in the imported
user block and in the current project and when possible, it puts the imported loads into the existing load cases.
Cross-Sections: analogous to the load cases above.
Nonlinear functions: analogous to the load cases above.
Load groups: analogous to the load cases above.
Other libraries: analogous to the load cases above.
Note: The number and type of the parameters in the import user block dialogue may vary depending on the contents of
the current project and imported block.
Limitations of the import
Different national code in the imported user block and current project
The national code of the imported user block is changed to the national code of the current project.
Each used material of the user block is shown to you. You have to assign one material from the current project. The
assignment rule can be remembered and used for next user blocks (then it is applied automatically without asking). No
materials from the user block are added to the new project.
Parameters
After the modification of the user block, all parameters are disconnected from the block items and they are not copied
into current project.
6 BV – 2025/01/06

Tutorial – User blocks
Example
In this example we create a lattice girder which we could use in several scaffolding structures. Therefore, we want to
make use of a user block so we have to model this lattice girder only once and we can reuse it each time we need it in a
specific project.
The lattice girder consists of several 1D-elements with certain cross-sections. We have already connected all elements
and have added some hinges to the horizontal beams.
Use Menu bar > File > Save As to store the project in the ‘User block library’ folder (see Menu bar > View > Global UI
settings > tab Directories > Show directories for User block libraries):
We can save the lattice girder as ‘Lattice girder 5.14x0.5 m.esa’.
BV – 2025/01/06 7

Tutorial – User blocks
Now we have a certain (scaffolding) project where we want to add the lattice girder at the opening in the scaffold:
We open the user block wizard via Input panel > workstation Structure > category Import & Blocks > User blocks,
navigate to the folder where the lattice girder is saved, select the file and confirm with ‘OK’:
8 BV – 2025/01/06

Tutorial – User blocks
Now we must choose the import options of the user block:
• ‘Import type’ = ‘Structure with all other data’, because we want to import the elements including the hinges
• ‘Import structure into’ = ‘New layers’, because we have created specific layers for the lattice girder
• ‘Load cases’, ‘Cross-Sections’, ‘Nonlinear functions’, ‘Load groups’ and ‘Other libraries’ = ‘Collect library item by
name’, so items with the same name will not appear twice in the model (e.g. load case Self-weight or hinge
types which are already defined in the scaffold project) and new items will be added to the project (e.g. Cross-
Sections from the lattice girder)
Then we use coordinates or select a node to define the position where the user block must be inserted:
BV – 2025/01/06 9

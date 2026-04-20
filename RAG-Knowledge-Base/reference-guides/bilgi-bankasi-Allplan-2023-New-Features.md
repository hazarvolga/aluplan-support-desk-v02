---
title: "Allplan 2023 New Features"
category: Features_and_Updates
source: Allplan_2023_New_Features.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

ALLPLAN 2023

New Features Allplan 2023

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
1. Edition, October 2022
Document no. 230deu01m01-1-TD1022

New Features Allplan 2023

Contents

i

Contents
Allplan 2023 - Your AEC platform to Design and Build
together .............................................................................................. 1
General New Features ................................................................. 3
More speed for download and installation ..................................................... 3
Acceleration of installation ............................................................................................3
Country-specific new features ..................................................................................3

Restoring drawing files directly from a backup .......................................... 4
Relocation of the Allplan Exchange Online service .................................. 4

Performance - Confident handling of large volumes of
data ...................................................................................................... 5
Greater precision thanks to scalable user interface...... 6
Improvements in the Actionbar ............................................................................ 7
Revised search in the Actionbar ................................................................................. 7
Simpler access to SmartPart functions ................................................................. 7
Plug-ins task in each role ................................................................................................8
Label and design in engineering ..................................................................................8
TT Reinforcement In the Engineering Structures task.................................8

Modeling - Model openings faster and more flexibly .... 9
Lintel, Header function - Surface elements .................................................. 9

ii

Contents

Allplan 2023

Attributes easier to adjust and localize ............................. 10
Definable attribute·set·templates on office and project-specific
basis .........................................................................................................................................11

Dimensioning views and sections in no time at all ........ 12
Extended function scope ........................................................................................ 12
Views perpendicular to reference surfaces ............................................... 13
New presentation parameters ............................................................................ 14
Extended text parameters .................................................................................... 15
Favorites for formats ................................................................................................ 15
Position of heading and scale ............................................................................... 15
Automatic dimensioning .......................................................................................... 16
Resetting the Section Identifier .......................................................................... 16
Multiple modifications ................................................................................................ 16
Reinforcement views only available to a restricted extent .............17

Increased productivity through automated
reinforcement ............................................................................... 18
Extensions in automatic reinforcement ....................................................... 19
Additional criterion when rearranging ............................................................ 19
Coupler parameters modifiable .......................................................................... 19
Labeling PythonParts ............................................................................................... 20
Other New Features .................................................................................................. 20

Efficiently Convey Constructability with Design Intent
.............................................................................................................. 21
Connection of structural framing beams and braces.......................... 22

New Features Allplan 2023

Contents

iii

Inclined cross-sections for structural framing objects ..................... 22

Road Design - Productivity boost for terrain and road
construction plans ...................................................................... 23
Extensions for the road construction ............................................................ 24

Civil·engineering - Precise planning of excavation
shoring ............................................................................................. 25
Advanced task areas for construction ......................................................... 25

Interfaces - Best possible OPEN BIM workflows for
reliable collaboration ................................................................. 26
Improved export with resources ...................................................................... 27
NID export of multiple layouts............................................................................. 27
Extension for reinforcement export .............................................................. 27

BIM in real time between Allplan and Solibri.................... 28
Documentation - Efficient work with text leaders ..... 29
Text leaders immediately after text creation .......................................... 29
Multitext leader .............................................................................................................30
Correct text leaders for each modification ................................................ 30
Text·wrapping for text modification ..............................................................30

Visualization - Impress with perfect renderings ........... 31
Model calculation in Fly mode .............................................................................. 32
Reflection of rough and structured surfaces............................................ 32

iv

Contents

Allplan 2023

New features in Visual Scripting .......................................... 33
New functions in Visual Scripting ...................................................................... 34
New functionalities in Visual Scripting ........................................................... 35

Precast planning - automated precast planning and
new precast element tools ..................................................... 36
New features across modules ............................................................................ 38
Functions of the Reinforcement Views task area ........................................38
Separate task area and tab for fixtures with precast elements..........39
Cutting the reinforcement and Interaction·with·precast·element for
Model Precast Elements ..............................................................................................39
Presentation of bending shape in plan view or on element plan ......... 40
PythonPart crane from the library .........................................................................41
New attribute thickness ID ..........................................................................................41

Catalogs and Configurations ............................................................................... 42
Production file name for production or ERP data..........................................42
Catalog reference for fixture group, group leading .....................................43
Insulation Material Catalog, deduction value for cutting tool.................46
Layout catalog, new functions for formula editor ........................................46
Layout catalog, dimensioning of bricks.............................................................. 48
Layout catalog, dimensioning of hollow blocks in walls ........................... 48
Layout catalog, change for panel edge dimensioning settings ............49
Layout catalog, change for opening and recess dimensioning settings
......................................................................................................................................................51
Layout catalog, mark number and dimensioning of fixtures .................. 51
Layout catalog, labeling of symbol fixtures on the dimension line ...... 51

Precast slab ..................................................................................................................... 52
Calculations of shear force and bond ................................................................... 52

Precast Wall .................................................................................................................... 53

New Features Allplan 2023

Contents

v

Replaced functions for wall panels .........................................................................53
Consideration of wall-height architectural recesses in iWall................ 54
Ignore Precast element element state for all wall types in iWall ........ 54
Sleeve shift on collision with lattice girders for iWall ..................................55
Improvements in input dialogs for iWall ............................................................. 58
Boolean functions for user-defined architectural elements in
views/sections................................................................................................................. 58

Precast Elements......................................................................................................... 59
Removed functions in Precast Element task ..................................................59
Span direction as 3D vector .......................................................................................59
Boolean functions for user-defined architectural elements in
views/sections................................................................................................................. 60

Formwork .........................................................................................................................60
Shuttering boards in the Objects' palette ......................................................... 60

Production Planning .................................................................................................... 61
Reinforcement groups in Production Planning ................................................61
Write Order Attribute in PXML Delegate file to NC data...........................63
Transfer of open polygons in PXML file ..............................................................63
Name of fixtures in List Generator........................................................................ 64
Export of NC data to the TIM .................................................................................... 64

Index ................................................................................................. 65

New Features Allplan 2023

Allplan 2023 - Your AEC platform to Design and Build together

1

Allplan 2023 - Your AEC
platform to Design and
Build together
The Multi-Material Solution for ultimate Buildability

Allplan 2023 is the connecting platform for interdisciplinary collaboration between architects, engineers, precast plants and construction companies that delivers
numerous innovations and improvements. As a multimaterial solution, Allplan covers everything from masonry, cast-in-place concrete to steel and timber
construction and - for the first time - precast concrete.
The ability to coordinate different materials and
construction methods in one common model enables architects to better consider the economical and
sustainable use of building materials, earlier, and in accordance with environmental requirements. Engineers
and construction companies can build directly on the architects' design and use it as the basis for structural analysis and detailing, MEP engineering, prefabrication and
construction. Allplan supports workflows across the entire process from the initial idea to the completed project,
enabling time, cost, and material savings.
Innovation and improvement highlights for architects
include accelerated processing of terrain survey and
point cloud data for refurbishment projects, faster modeling of complex openings and real-time BIM collaboration

2

More speed for download and installation

Allplan 2023

between Allplan and Solibri. Engineers will particularly
benefit from time saving new developments for automated detailing of reinforcement and new structural steel
connection functionality. By integrating the previously
separate precast solution Planbar, efficient design of
structural elements including stairs, columns, slabs, and
walls is now possible, together with automated plan
creation. Construction companies will find time saving
new features for excavation shoring and easier and faster site setup through powerful new functions, facilitating
precise planning and therefore a smoother build phase.
Allplan 2023 provides a comprehensive platform for the
entire construction industry, enabling efficient coordination and collaborative workflows between AEC professionals. The multi-material approach marks a key milestone in ALLPLAN's design-to-build strategy.

New Features Allplan 2023

General New Features

3

General New Features
A large number of new features at the various points of user management further increases the efficiency in daily work with Allplan.

More speed for download and installation
Allplan 2023 determines in advance which program
components (functions, languages, country-specific settings) are required by the user. Only these are downloaded and installed. This noticeably speeds up the first
program start. In addition, country-specific settings are
now available for Canada and Mexico.

Acceleration of installation
The installation of Allplan has been considerably accelerated, by determining the program parts required for the installation before
starting the download, and then by only downloading the installation
package required for this.

Country-specific new features
Canada
The English and French languages as well as the Fixtures, Textures
and Vendors_FeatureHeadline for the respective country are
available for installation with the new Canada country code (requires
a license).

Mexico
The Spanish language as well as the Fixtures, Textures and
Vendors_FeatureHeadline for the respective country are available
for installation with the new Mexico country code (requires a license).

4

Restoring drawing files directly from a backup

Allplan 2023

Restoring drawing files directly from a
backup
If you have a backup of project data either as a project backup (ZIP
file) or as a copy of the project folder, you can restore individual drawing files for the project in question in a targeted manner without
having to go via ProjectPilot.
To do this, select the Building structure tab in the Open on a Project-Specific Basis dialog box and open the shortcut menu for the
relevant drawing file. Here you will find the new Restore drawing file
from backup tool function.
Important! The function can only be selected if the drawing file is
disabled fully.
You can find more information in the Allplan Help under "Restoring
drawing files from a backup".

Relocation of the Allplan Exchange Online
service
We are revising and modernizing the current Allplan Exchange Online
service. The new Allplan Exchange Online service is due to go online
after the Allplan Version 2023 has been released.
As a registered Allplan Exchange Online user, please ensure you read
the information we have sent.

New Features Allplan 2023

Performance - Confident handling of large volumes of data

5

Performance - Confident
handling of large volumes
of data
Due to increasingly complex construction projects and
the trend towards ever more detailed planning, data volumes are rising continuously and require correspondingly powerful software. Terrain surveys or point clouds
with many millions of points represent a particular challenge. Allplan 2023 processes such data directly on the
graphics card. The data is not only displayed visually, but
it is also possible to snap and measure points. In this way,
large volumes of data can be reliably processed without
time delays or memory limits.

6

Relocation of the Allplan Exchange Online service

Allplan 2023

Greater precision thanks
to scalable user interface
Working with different monitor sizes and resolutions is a
natural part of everyday planning. The right scaling is essential to achieve the highest possible accuracy and
readability. As this is not always guaranteed via the operating system, Allplan 2023 now automatically ensures
that all elements such as menus, icons, palettes and graphics windows are scaled to the full screen resolution.
This allows users to work precisely down to the smallest
detail when modeling or visualizing. In addition, the icons
have been made clearer. All in all, Allplan 2023 presents
itself with improved ergonomics and an attractive
appearance.

New Features Allplan 2023

Greater precision thanks to scalable user interface

7

Improvements in the Actionbar
Revised search in the Actionbar
The
Find function on the right side of the Actionbar has been
revised and extended. The dialog box has been designed for ease of
use and the search process is now faster.
There are now also a number of functions which are not included in
Actionbar Configurathe Actionbar roles, but can be found in the
tor. These functions are displayed in the Find data-entry box with
the function icon and function name and can be started directly from
here by clicking on the function icon.

Simpler access to SmartPart functions
The following functions used to generate door and window sill
SmartPart can now be controlled as individual functions in the Opening Elements and Interior Finish task areas:
•

Sectional door SmartPart

•

Lifting door SmartPart

•

Up and over door SmartPart

•

Window Sill SmartPart

8

Improvements in the Actionbar

Allplan 2023

Plug-ins task in each role
The new Plug-ins task can be found in all of the roles. You can now
use the Actionbar Configurator to save your required Add-On modules, such as Lumion LiveSync.

Label and design in engineering
In the role,
Engineering both of the Label and Design tasks are
now available by default. You no longer need to switch to another
role.

TT Reinforcement In the Engineering Structures task
The TT Reinforcement task area is now included in the Engineering
Structures task by default.

New Features Allplan 2023

Modeling - Model openings faster and more flexibly

9

Modeling - Model
openings faster and more
flexibly
Building models contain a large number of openings for
windows, doors, facades or technical equipment. Special
openings such as corner windows and wall or slab recesses, as well as their sub-objects such as lintels, rabbets or
facings, can now be adapted even more quickly, conveniently and flexibly in terms of dimensions and representation using the properties palette.

Lintel, Header function - Surface
elements
In the dialog box of the
Lintel, Header function (Components
task area), you can now choose from all kinds of architectural elements (Hatching, Pattern, Fill, Bitmap Area, Style Area) and surfaces
in the Surface elements area, just like you can for other architectural
Column.
elements, such as

10

Lintel, Header function - Surface elements

Allplan 2023

Attributes easier to adjust
and localize
Attribution is of central importance for BIM-compliant
design. With each Allplan version, workflows are therefore further optimized and made more user-friendly. Current innovations include user-defined property sets that
can now be defined directly in Allplan. To improve clarity,
imported attributes are displayed in groups. For simplified
localization, formulas are now language independent.

New Features Allplan 2023

Attributes easier to adjust and localize

11

Definable attribute·set·templates on
office and project-specific basis
Attribute·set·templates can now be adjusted on an office and project-specific basis.
To do this, select the relevant project and open Project Settings
(New Project, Open Project dialog box -> Shortcut menu -> Properties). Under Attribute·set·template, you will find all of the required
functions to copy an existing attribute·set·template and then adjust
it on an individual basis.
Alternatively, you can set the Attribute·set·template to Project. The
attributes assigned to the project until then are retained for the project. You can also individually adjust the automatically generated
project-specific attribute·set·template using the same method as
copying an existing attribute·set·template: With Manage attribute
set templates, you open the shortcut menu by clicking on Edit. This
opens the Edit·attribute·set·template dialog box in which you can
make the corresponding adjustments.
You can find more information in the Allplan Help under the
"Edit·attribute·set·template" dialog box.

12

Extended function scope

Allplan 2023

Dimensioning views and
sections in no time at all
During the course of a project, countless views and sections are generated from the building model. To make this
process as time-saving and precise as possible, extensive optimizations have been made: For example, views
and sections can now be created perpendicular to any
surfaces or automatically with dimension lines. There are
numerous new options for visibility and labels. In addition,
many properties can be changed for multiple views and
sections using the properties palette to save time.

Extended function scope
The functional scope of the existing Sections task area was expanded and renamed Views and Sections. You can now also use the
Section Along Curve function with the associated Dimension and
Modification function.
The names of the parameters in these functions were adjusted to
Generate Section and
Generate View functions.
those of the

New Features Allplan 2023

Dimensioning views and sections in no time at all

13

Views perpendicular to reference
surfaces
You can now define the viewing direction of views perpendicular to
Generate
any reference surfaces. Once you have selected the
View function in the input options, select the Area option and click a
reference surface in order to do this. If the defined viewing direction
corresponds to a standard view, this is configured in the Views area.
It is now easier and more intuitive to define a free view too. All you
have to do when in the entry options is to select the Free option and
click on a window to match the view displayed here.

14

New presentation parameters

Allplan 2023

New presentation parameters
The settings in the Presentation area were amended and expanded
in the Generate / Modify View and Generate / Modify Section
palettes.
• The name Reference scale for calculation was renamed to Reference scale for 2D and 3D foils in the
Generate View and
Generate Sectionfunctions to highlight what this setting does.
The value configured here is also used on the one hand for the
presentation of smart symbols and fixtures which have foils with
different scale ranges for a single view type, as well as for the reference scale for the drawing file if you generate the view using
the building structure, or if you save your result on a different
drawing file than the one that is currently active.
• With the new Basic·reinforcement·precast·elements option,
you can define whether the longitudinal and cross bars of the basic reinforcement are created as passive elements to reduce data
volume and increase performance of precast elements. If this option is disabled, the reinforcement will indeed be drawn but it cannot be modified in this state.
Note: Manual presentation changes for an “active” reinforcement
(such as placement display amended to Show middle bar only
or Dimension Line added) are lost when it becomes passive.
• With the new Fixtures·as·wireframe·model option, you can define whether to show the fixtures as a wireframe model, so that
you can see the fixtures better.
Note: Setting the Presentation as a wireframe model option unOptions now no longer has an impact on the presentation
der
of the fixtures.

New Features Allplan 2023

Dimensioning views and sections in no time at all

15

Extended text parameters
The text parameters have been expanded for Label for clipping path
and Views and Sections.
You can now define a Font·label, specify the Angle for italic text,
define the Text color and the Layer, define a border around the
text, add a fill to the text and specify whether the size of the text on
the layout will remain the same at all times, even if you change the
scale of the layout element.
The extended text parameters are also available in the
Section
Along Curve function for the section labeling and representation of
the clipping path.

Favorites for formats
In the Formats palette, where you confirm the settings for the Hidden Line Image, you can now use the icons in the palette to confirm
the formats for an existing view or section, save and load the settings as a favorite und reset the settings to the basic settings.

Position of heading and scale
In the Labeling palette, you will now see the new Position area when
you generate the heading and/or the scale as the view/section
labeling.
Here you specify the position and offset of the labelling in relation to
the extent of the view/section. If you generate the heading as well
as the scale, you can also define the line spacing for both of these
headings.
The new Position area is also available in the
ve function for the section labeling.

Section Along Cur-

16

Automatic dimensioning

Allplan 2023

Automatic dimensioning
The new Dimensioning area is now available in the Labeling palette,
both when creating as well as modifying views and sections.
Here you can specify whether the view/section is executed without
dimension lines or with
elevation
dimensions (off), with
points. If you have selected a dimensioning type, you can specify the
parameters for the dimension lines or elevation points by clicking
the Set button. You will already have seen the dialog box that opens
from the dimensioning of reinforcement views.

Resetting the Section Identifier
In the
Modify Clipping Path function, you can now move a previously offset section identifier back to its default position by clicking
the
Reset·section·identifier·to·default·position button within
the palette.

Multiple modifications
With regard to the
Remove/Add·Elements and
Show Clipping Path functions, you can now select several views and sections
and modify them in a single step.

New Features Allplan 2023

Dimensioning views and sections in no time at all

17

Reinforcement views only available to a
restricted extent
Previously, there were two options for creating the general arrangement and reinforcement drawing. Of particular benefit for existing
customers was the fact that they were able to work using the usual
functions. However this was particularly confusing for new customers as there was no clear method. As stated previously, it is for this
reason that the Reinforcement Views task area is no longer available for the general arrangement and reinforcement drawing. The
functions in this task area can only still be used for the Element Plan
and the Formwork elements of the role.
Although the way you work with the existing Views and Sections
task area requires a little adjustment, virtually the same functionality
remains in place. If you have only worked with the Reinforcement
Views task area to date, you can start off by downloading step-bystep instructions contained in Steps to Successful Views and Sections from Allplan Connect, the service portal from Allplan.

Data conversion
If you load data or projects in Allplan 2023, elements created using
the Reinforcement Views task area will be converted. As a result,
the elements of the general arrangement views and reinforcement
views are 2D design entities, texts and dimension lines. The format
properties remain unchanged. Consequently, everything still looks
the same in documents and layouts.
As the model data remain the same, although the existing linked layouts are no longer available, you can use the Views and Sections
task area to create additional views and sections where required.
The fully automated management of the number of pieces remains in
place in any case.

18

Reinforcement views only available to a restricted extent

Allplan 2023

Increased productivity
through automated
reinforcement
Reinforcement detailing is characterized by high workload and deadline pressure. Automated reinforcement
helps to reliably complete recurring tasks in less time.
With Allplan 2023, it is now even possible to reinforce
several columns and walls of one type at the same time.
In addition, there are numerous improvements in detail.
For example, columns can now have multiple stirrup types and continuous beams can also be reinforced in one
work step.
With regard to the increasing requirements in BIM projects, the attribution of reinforcement has been extensively revised. The new release manager supports the
cycle-accurate ordering of reinforcement in lean
construction projects. In addition, there are numerous
improvements in detail, for example, several polygonal
placements with different mark numbers can be combined into one polygonal placement with one mark number.

New Features Allplan 2023

Increased productivity through automated reinforcement

19

Extensions in automatic reinforcement
The functionality to create automatic reinforcement for beams, walls
und columns as well as the automatic punching shear reinforcement
was expanded and improved further.
• Beam reinforcement for multi-span beams possible.
• Mesh reinforcement and spacers for walls.
• Multi-section stirrup reinforcement for columns.
• Create multiple walls or columns in one step.
• General improvement of assigning layers and creating sections.

Additional criterion when rearranging
The Rearrange Marks function was expanded to include the Prefix
criterion. When you select this option, the Rebar Prefix attribute will
be taken into account when rearranging the marks. Identical reinforcing bar marks with different attribute use are not therefore combined into a mark.

Coupler parameters modifiable
The Modify·Coupler,·Thread,·Connecting·Bar function now provides you with two new functions that you can use to amend the
parameters for couplers or threads via the pull-out bars or placement. Once you have clicked on the coupler or thread, the parameters set as visible in the Article editor are then displayed in a dialog
box.
You can modify parameters for which a list box opens by clicking
twice in the Value column, such as for the new end processing abbreviation. The remaining parameters are purely for information
purposes.

20

Labeling PythonParts

Allplan 2023

Labeling PythonParts
As is the case for other objects in Allplan, such as SmartParts, you
Label function in the shortcut menu for Pycan now open the
thonPart objects.

Other New Features
• The
Extrude Bars Along Path and
Sweep Bars Along Path
functions are now also available for PythonPart development.
• You can now use

Join bars to edit polygonal instances too.

• The reinforcing steel processing guideline is now taken into account for Switzerland.
• The standard settings have been expanded for the USA. Abbreviations can be assigned for the end processing of couplers and
threads, and the Release Manager is also available to order reinforcement.

New Features Allplan 2023

Efficiently Convey Constructability with Design Intent

21

Efficiently Convey
Constructability with
Design Intent
Users now have the ability to customize the Start and
End Angles of Structural Framing Elements, which is necessary to accurately model steel structural framing situations. The Connection Toolbox now includes the ability
to specify Holes and End Conditions. These features help
Engineers model most Steel Connections at LOD 300 and
above, improving accuracy and efficiency of communication while collaborating with detailers, fabricators, building
engineers, and other BIM stakeholders.
Furthermore, the Connection Toolbox is written in Python and can be extended by users and developers. Column Splice Plate and Base Plate examples have been
shipped with Allplan 2023 to help get started with extension development.

22

Connection of structural framing beams and braces

Allplan 2023

Connection of structural framing beams
and braces
With the
Join Linear Component with Line function, you can now
also connect structural framing beams and structural framing bracings to the lines or edges of other Structural Framing Objects. You
will also find this function in the shortcut menu for both of these
Structural Framing Objects.
After you have chosen the required Structural Framing Object, you
then go to the input options to define whether it is just the anchor
point to be connected to the axis of the Structural Framing Object, or
the entire Structural Framing Object together with the anchor point
and axis. If you select the Adjust final outline option in the second
instance, the inclination of the cross-sectional area will also be adjusted to the line or edge.

Inclined cross-sections for structural
framing objects
When you are in the palette for defining the Structural Framing Object parameters, you now have the option on the Geometry tab to
define an angle in the local x- and y-direction between the crosssectional area and the perpendicular to the object axis at the start
and end of the Structural Framing Object. The cross-sectional area is
always rotated here by the anchor point.
If inclined cross-sectional areas arise when a beam or brace is
connected, or if inclined cross-sectional areas arise for inclined
beams or braces owing to the selected beam end, the corresponding
angles will be entered automatically.

New Features Allplan 2023

Road Design - Productivity boost for terrain and road construction plans 23

Road Design Productivity boost for
terrain and road
construction plans
To boost productivity on infrastructure projects, the new
version improves and automates plan rendering and introduces additional components and layers. The reduction
of manual workflows leads to significant time savings.
Smooth data exchange is supported by an IFC roadcompatible building structure and attributes. Road
construction works can be evaluated on the basis of national regulations with the advanced testing routines for
Germany, Austria and Switzerland.

24

Extensions for the road construction

Allplan 2023

Extensions for the road construction
The description of the functions in the Terrain and Street tasks of
Road construction is now integrated into the Allplan Help.
the role
The following extensions and improvements have also been made.
• Localization - country-specific standard testing
• Import and visualization of cadastral data
• Improved terrain display (point clouds)
• IFC 4.3 Standard for road objects
• EN: Axis import in OKSTRA format
• Horizontal geometry - transition arcs according to Bloss
• 3D dimensioning of the road body
• Reports - Output of peg points (x, y, z)
• Quick access to general settings

New Features Allplan 2023

Civil engineering - Precise planning of excavation shoring

25

Civil·engineering Precise planning of
excavation shoring
Precise planning of excavation shoring is particularly important for inner-city construction projects and infrastructure projects. Allplan 2023 supports these tasks
with new functions for planning bored pile and soldier pile
walls, as well as ground anchors.

Advanced task areas for construction
In the role,
Construction the Building site task has been expanded to include the Crane·planning task area. You will now find the
Tower crane and Capacity checker functions here.
The Site facilities task area has also been expanded to include the
new Placement in grid and Placement along path functions. You can
use these to create containers or site fences, for example.
In the Terrain task, you will now find the new Civil·engineering task
area, which includes a number of functions to create excavation shoring.

26

Advanced task areas for construction

Allplan 2023

Interfaces - Best possible
OPEN BIM workflows for
reliable collaboration
To provide the best possible support for data exchange
with OPEN BIM and proprietary formats, the Allplan interfaces have been comprehensively updated. For IFC, DWG
and DGN formats, Allplan now uses the current libraries of
the Open Design Alliance, an association of 1250 companies in the construction industry. The reliable cooperation
in openBIM projects has certified buildingSMART for the
export of the IFC4 Reference View.
For interaction with structural analysis software, the SAF
format has been defined, which is now supported by 16
software companies. Structural models from Allplan
Bridge can be transferred to Midas. For road projects,
export in IFC 4.3 format is now available. In addition,
cadastral data with property boundaries can be imported
in SHP format. The new IFC4precast interface enables
model-based data exchange that is independent of the
production facilities used.
In addition, special developments were realized for various countries, such as support for XPlanung for Germany
(availability planned for 4th quarter 2022), attribute
templates in accordance with the Czech standard, and
improvements in reinforcement export in aSa and Soule
formats for the USA.

New Features Allplan 2023

Interfaces - Best possible OPEN BIM workflows for reliable collaboration 27

Improved export with resources
When exporting drawing files and layouts with resources, it has previously been the case that only all loaded drawing files (current - edit
- reference) or the current layout with its drawing files were saved
as an NDW file. If the loaded drawing files contain associatively referenced files that are not loaded, you now have the option to choose
whether these files are also copied. If you have loaded Views and
Sections without the associated model data, these data shall also be
copied.

NID export of multiple layouts
With the
Export NID File function, you can now export multiple
layouts in one step.
If you want to export other layouts in addition to the current layout
or take other layouts into account for the export as well, click the
Layout number button and select the required layouts via Layout
structure. The suggested file name is formed using the layout name
and the smallest layout number.

Extension for reinforcement export
With regard to the
Export aSa and
Export Soule functions, all
bar reinforcement elements of the loaded drawing files are now taken into account, including drawing files in reference and edit state.
For the reinforcement export using the
Export aSa function, you
can now define whether TEK or RDX files are to be created from the
existing documents.

28

Extension for reinforcement export

Allplan 2023

BIM in real time between
Allplan and Solibri
Instead of importing and exporting BCF files, the connection of the Allplan/Bimplus* Issue Manager with the Solibri BCF Live Connector now allows issues identified
during model checking in Solibri to be transferred directly
to the issue workflow in Allplan. Thus, issues can be evaluated and processed, edited, and corrected directly in
Allplan.
*Bimplus Pro project required. Bimplus Pro license included with Serviceplus or Subscription.

New Features Allplan 2023

Documentation - Efficient work with text leaders

29

Documentation Efficient work with text
leaders
Text leaders are particularly helpful when a lot of information needs to be displayed in the same place. With Allplan 2023, the text leaders have been extensively revised so that, for example, moving or changing scales is
now much smoother. It is even possible to use text leaders to label several objects simultaneously.

Text leaders immediately after text
creation
By selecting the
Text Leader option in the advanced toolbar of
the Text dialog box, you can now append a text leader to a fileset
Text
element once the text has been definitively created. The
Leader function is automatically started for this purpose.
If you wish to edit text, you cannot select the

Text Leader option.

30

Multitext leader

Allplan 2023

Multitext leader
You can now use the
leaders for text.

Text Leader option to create multiple text

After you have generated the first text leader in the usual way, you
must then select the
Sub-text·leader setting. Where required,
indichange the setting so that the text leader is generated as an
vidual line or as a
polyline, then change or define the start and/or
end symbol. Finally, click the text leader in the position where the
additional leader is supposed to start and enter the text leader.

Correct text leaders for each modification
If you move text, copy it across multiple drawing files, modify parameters such as text height and width or change the reference scale,
the presentation of the text leaders will always be updated correctly.

Text·wrapping for text modification
If you click on text without one of the functions being active, the text
will now be provided with a border frame.
You can select the corners of the border frame and move them into
specific halftoning. This then generates text wrapping for the text,
i.e. the words in a line of text are wrapped in such a way so that the
text fits solely within the border frame. If you wish to remove this
text wrapping generated this way in full, click on the text and turn off
the Text·wrapping option in the Properties palette.

New Features Allplan 2023

Visualization - Impress with perfect renderings

31

Visualization - Impress
with perfect renderings
Convincing clients of creative ideas is often best achieved with atmospheric visualizations of the project that
are as close to reality as possible, instead of 2D plans that
require explanation. With Allplan 2023, the extremely
powerful visualization options have been extensively
enhanced. For example, visualization effects such as
bloom and lens flare, depth of field and volumetric fog are
now also available throughout the animation as well as
with Realtime Render and CineRender. Newly added are
further professional material settings. Interaction with
CineRender during changes has been significantly accelerated. Additionally, the integration of the Lumion LiveSync connection improves the visualization workflow by
tracking Allplan scenes and their changes in Lumion in real
time.

32

Model calculation in Fly mode

Allplan 2023

Model calculation in Fly mode
In addition to the known

Design mode and

Navigation Mode

navigation modes, you can now also calculate your model in
Fly·mode. You can control the presentation in Fly·mode by pressing
and holding down the keys on the keypad known from other applications (W - A - S - D):
• W - Fly to model
• A - Fly to the left
• S - Fly away from model
• A - Fly to the right
You can also use the middle and right mouse button as well as the
ARROW KEYS on the keypad to control this.
Select
Fly·mode via
/
/
Navigation·mode in the
window toolbar of a graphics window for each individual graphics
window.

Reflection of rough and structured
surfaces
When defining surface properties using the
Set Surface
(Surfaces, Light task area) function, for example, you can now save
a separate texture for roughness - in a manner analogous to glossy
reflection.
The settings for roughness and glossy reflection will mutually impact
each other. If you have selected intensity > 0 for the glossy reflection
and coat of lacquer > 0, the coat will generate a glossy reflection without taking the settings for roughness into account. If glossy reflection = 0, a coat of lacquer >0 will take the roughness intensity and
roughness texture into account.

New Features Allplan 2023

New features in Visual Scripting

33

New features in Visual
Scripting
The following new features have been incorporated into Allplan Visual Scripting:
• The toolbar has been expanded to include the
Stop function
Crea(including in the Script menu) and the
te·objects·in·Allplan function (including in the File menu)
• The Create·PyP·script·only... function has been added to the
File menu
• You can now activate the Watch list palette in the View menu
• You can use CTRL+C and CTRL+Vto copy and paste selected
nodes across scripts.
• A project file ending *.avsprj is now created when saving a VisualScripting script

34

New functions in Visual Scripting

Allplan 2023

New functions in Visual Scripting
The
Stop (SHIFT +F5) function can be found both in the toolbar as
well as in the Script menu. It ensures the execution of the script trigStart and, thus, synchronization between Allplan and
gered by
Visual Scripting is interrupted. If the script has already been executed
and the Properties palette and the object are displayed in Allplan,
Stop function on will ensure that this preview in
switching the
Allplan is deleted again. You are therefore returned to the initial state
without having to close Visual Scripting.
The Create objects... function can be found in the toolbar and in
the File menu. If you have created a script in Allplan Visual Scripting
Start, the
and triggered the execution of the script by selecting
object und Properties palette will be displayed as a preview in Allplan.
To ensure both are not only displayed but also created in Allplan, you
must use the Create objects... function. The object is then saved
in a *.pyp file. By doing this, the object and Properties palette will continue to be available for editing in Allplan after the Visual Scripting
application window is closed.
The
Create·PyP·script·only..... function found in the File menu
only allows you to create a script and not an object in Allplan. Your
script is saved in a *.pyp file.

New Features Allplan 2023

New features in Visual Scripting

35

New functionalities in Visual Scripting
You can activate the Watch list palette in the View menu. However,
it is also opened if you show the tooltip of a node parameter at the
output ports in a node, click the
Watch button and add this parameter in the Watch list palette. The Watch list palette is docked at
the right side of the application window. You can now check the parameters you have added for the duration of your Visual Scripting
session. If you close Allplan Visual Scripting, the Watch list palette is
automatically cleared.
If you select a parameter in the Watch list palette, the associated
preview element will be highlighted in color in Allplan. This allows you
to review the geometry of your element.
You can use CTRL+C and CTRL+V to copy and paste selected nodes
and their connecting lines across scripts. You can reuse existing node
combinations by copying scripts.
A project file ending *.avsprj is now created when saving a VisualScripting script.
If you have created VisualScripting scripts in previous versions of
Allplan 2023 and then saved them, they will have been saved as a
*.pyp file. In the same way as before, these files can only be read or
edited. When saving these data, they are now saved as a *.avsprj
project file.
When in the workspace of the Visual Scripting application window,
you can now arrange for your script view to be enlarged or reduced
by a certain percentage. To do this, you can choose from 7 preset
values or use your mouse scroll wheel to set the presentation size.

36

New functionalities in Visual Scripting

Allplan 2023

Precast planning automated precast
planning and new precast
element tools
The Allplan 2023 version is characterized by the integration of numerous functions for precast planning. Specifically, the complete range of functions of Planbar, one of
the most innovative planning solutions in the Precast
area, has been included in Allplan. As a result, engineering
offices and precast plants can now design precast concrete elements of any complexity directly in Allplan. Allplan automatically creates element plans for production
and the identifier can be used to check whether precast
elements with their specific fixtures and reinforcements
are identical to other objects.
Merging Planbar and Allplan not only simplifies project
coordination, but also enables new, even more efficient
workflows. For example, precast elements can be created in a time-saving manner using functions in Allplan as
well as PythonParts.
The joint version offers numerous advantages to existing
Planbar users: They gain access to additional Allplan tools
such as Bimplus or Allplan Share, as well as to additional
functions for cost planning, civil structures and much mo-

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
37

re. The administration effort is also significantly lower, as
installation and licensing are only required once.
Precast plants get sophisticated planning workflows for
highly automated wall and slab production as well as numerous interfaces to production machines with the Allplan Precast product in addition to the range of functions
in Allplan.
In addition to the integration of precast functions in Allplan 2023, there are other innovations in the Precast
area. One highlight, for example, is the Smart Converter,
which interprets and analyzes stair drawings (2D or 3D).
It then corrects angles if necessary and transforms the
drawings into producible, fully parametric stair models.
Designing precast staircases has never been easier or
more efficient.
In addition, the layout catalog has been extended by numerous setting options. As a result, the layouts for element plans can be designed even more individually.
Fitting parts can now be generated with Python scripts.
This opens up completely new perspectives with regard
to fixture functionality. Definable rules increase the
degree of automation. For example, Allplan can automatically calculate the correct positions and diameters for
necessary holes based on the dimensions of a steel plate.
Parametric resizing is also easy to carry out.

38

New features across modules

Allplan 2023

New features across modules
Functions of the Reinforcement Views task area
As announced for version PLANBAR 2022-0-1, the functions of the
Reinforcement Views task area for the placing drawing do not apply.
The functions are now only available in the shortcut menu of both
Element Plan and the
Panel Processing and
functions for the
in the plan view for elements of the Formwork task. In all other
cases, the selection of functions is cancelled with a message. Use the
functions of the Views and Sections task area instead for the placing drawing except for the Formwork task.
For the elements of the Formwork task, no reinforcement views or
sections across drawing files can be created. For this reason, the
Display Drawing File References and
Manage Reference Drawing Files functions have been removed. If you try to create a reinforcement view or section on a drawing file other than the selected
elements, the process is cancelled with the message Reinforcement·views·across·drawing·files·are·no·longer·available.
Note: The Prestressing task area has been removed entirely from
Precast·elements role. As a rethe Reinforcement task of the
Engisult, the Reinforcement task now fully corresponds to the
neering role. Now select the
Tendon function in the Engineering
Structures task area of the Engineering Structures task.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
39

Separate task area and tab for fixtures with precast elements
In the Actionbar, the higher
Fixtures function and the corresponding functions in the Context Toolbar have been replaced by the
Engineering
separate Fixtures task area, which is also used in the
role in the User-Defined Objects task for the precast slab, precast
wall and precast elements. In the Fixtures task area, you can then call
up the functions directly.
Please note that the
Fixtures function has now moved to the first
Define Fixture
position of the Create function group and the
function is at the end.
Note: In the palette configuration, a separate
Fixtures tab has
Fixtures function after the
been added as a replacement for the
tabs for the precast slab, precast wall and precast elements.

Cutting the reinforcement and Interaction·with·precast·element for
Model Precast Elements
If a linear fixture is selected for
Model Precast Elements as Fixture for Invoicing, for which options for cutting the reinforcement
Catalogs, General information, Fixture catalog
are active under
on the Reinforcement tab, these options now fundamentally remain
overlooked. The fixture in question is only used as an invoicing component.
Furthermore, there is fundamentally no further reinforcement cutModel Precast Elements on fixtures for which the Posititing in
ve (merge) / lengthening option is set to Interaction with precast
element.

40

New features across modules

Allplan 2023

Presentation of bending shape in plan view or on element plan
In the floor plan and on the element plan, the bending shape symbols
were previously drawn exactly on the support edge when entering
bar overlap = 0 . However, when creating the bars, the bars were
shortened by the configuration setting Fixed value (bar overlap =
0). With the change in Allplan, the bending shape symbols are now
also offset by this value.
Note: This applies only to new placements and to existing placements where the span direction or the supports involved are changed. For existing placements with no change, you will still have the
old representation.
For wall element designs created using the
Design (iWall) function, the bending shape symbols of the Basic reinforcement (for
each reinforcement unit) at element edges are now shifted by the
Lateral concrete cover when you enter a Bar overlap = 0. For recess edges, the Lateral concrete cover (per reinforcement unit)
applies, which is set on the Reinforcement of openings tab.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
41

PythonPart crane from the library
The load radii - in the Library palette of Allplan in the Standard·resolution with the PythonParts under Construction - with
the crane delivered are now also just as recognised as the load radii
Crane Location in the Precast Slab
of the cranes created with
task and Precast Wall of the Precast·elements roll.
Note: Define one or more crane locations for the crane as PythonPart before the design, so that when running the design function the
crane parameters are taken into account when calculating the individual elements.

New attribute thickness ID
For use in alternatives text images, title blocks, legends, etc., you will
now find the new Gauge Mark attribute (@36098@, String) in the
default attributes under the Precast Elements, element-specific
attribute group.
As a result, the value defined on entry or modification for entry of the
Gauge mark parameter in the Labeling group under
Design (iWall) is output with the settings for the Design Mode on the Attributes tab.

42

Catalogs and Configurations

Allplan 2023

Catalogs and Configurations
Production file name for production or ERP data
The Production file - Name convention defined up to version
Configuration, Site facilities,
PLANBAR 2021 in the now omitted
General, Production Data Transfer, General on the Program Flow
tab can now be defined again. A complete elimination of this parameter was not possible, since it is used by many customers simultaneously with the export file name, as an alternative way to create names (e.g. to control different systems that require different name
patterns).
Therefore, a second export name has now been provided under
Configuration, General, Program Flow, Export name on the Export
file name tab. This second name is called Production file name for
production or ERP data for pragmatic reasons, so that the former
setting from the configuration is easier to assign. The entries for this
are made in the same way as the other settings on this tab.
When the configurations are opened for the first time, the existing
configuration under Production file - Naming convention from
Configuration, Site facilities, General, Production Data Transfer,
General on the Program Flow tab is converted to the new setting.
There are no changes for the
Production Data, NC Generator
List Generator functions. You can continue to freely decide
and
here whether the Export file name or the Production file name
should be used.
Note: Please check the correctness of the attribute numbers used
after the update. There are two possible attributes for the floor in
Allplan that were used earlier. Slab above (@829@, string) and floor
(@1092@, string). If floor was not used, slab over was used. This now
no longer works, because at the time of the conversion of the setting
it is not clear which attribute is in use. Therefore, the attribute floor
(@1092@) is entered during the conversion. If the attribute slab over
is used, please replace the attribute number with @829@!

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
43

Catalog reference for fixture group, group leading
Since PLANBAR 2020 there has been a Group leading option for
defining non-dynamic fixture groups. In a non-dynamic fixture group
with the Group leading option, all fixtures in Allplan are active together. They are no longer deleted or moved individually. All related
fixtures are deleted, moved, etc. All fixtures belonging to the group
are linked to the same element and, if applicable, to the same precast
element layer, even if individual parts lie geometrically in another
precast element or another layer.
The new version Allplan 2023 how also offers the option to individually assign a catalog reference to group definitions. As a result, it is
possible to evaluate and treat the group itself as a fixture. The individual parts can then, depending on the setting, also be evaluated or
omitted. Since the fixtures of a leading group are always linked to a
single layer, even if they lie geometrically in another layer, it is not
possible to calculate the respective page (S1, S2, U1, …) and this is no
longer written for those fixtures.
• If a non-dynamic fixture group with the Group leading option is
installed without reference to an entry in the Fixture catalog, all
fixtures of the group are linked to the leaf in which the reference
point lies. Geometrically, however, they lie in different leaves. The
surface labels in the table on the element plant are created in the
leaf to which the fixtures are linked. Since the group definition has
no fixture reference here, the individual fixtures continue to be
handled as before.
• If the non-dynamic fixture group with the Group leading option
assigns a reference to an entry in the Fixture catalog, this affects
the labeling in the table on the element plan. Now the name of the
group is written first before the fixtures contained in the group.
If individual parts of the group are not listed in the table, this must
be adjusted in the Fixture catalog. The Surface labels in the table option on the Element Plan 1 tab must be disabled on the corresponding parts.
If a dynamic fixture group appears several times with the Group
leading option, the number of groups is summed accordingly and
written to the table on the element plan. The number of fixtures

44

Catalogs and Configurations

Allplan 2023

contained in the group is, however, only written by one group.
Groups are combined when all components of the group, which
are displayed in the table, are identical. If only the group is displayed (without the individual components), only the groups are compared. If only one component of the group is displayed, the group
and the components are compared.
A dynamic fixture group with the Group leading option is listed in the
List Generator in addition to the parts of the group (according to
the settings in the Fixture catalog). In other words, the group and
the individual components are recorded in the lists. If multiple elements exist, both the groups and the individual parts are summed,
unlike in the element plan. If individual parts have no catalog reference, these are not listed. This is the simplest way of suppressing
individual parts in the lists. However, the results may be unwanted in
other modules.
Note: If individual components or the entire group are not listed - in
the Fixture catalog on the Logging tab in the Logging group for
Invoicing Customer and/or Invoicing Factory - a Logging formula
can be used that returns 0 as the result when calculating the value
for the individual fixture. As a result, the parts without effects on
other modules can be filtered accordingly.
Attention: Since structuring of the outputs is not planned in any of
the returned standard lists, the output occurs on one plane and possibly in another sequence. This is justified by the fact that the fixtures
are sorted by list and therefore no longer have any correlation. Moreover, fixtures are also recorded separately by type on the lists
(symbol, line or surface fixture or formula fixture).
If a catalog reference is saved with the Group leading option for a
non-dynamic fixture group, only the group is still transferred as the
Producindividual fixture when creating the production data with
tion Data, NC Generator in the file for the NC generator and the
PXML file. However, this fixture can display multiple geometries depending on the settings in the Fixture catalog on the Production tab.
• Only the geometric attributes are evaluated on selected parts of
the group, such as how the individual part is to be presented
(Presentation such as CAD Foil, replacement symbol, etc.).
• All other settings such as Consider projection or Additional information depend on the catalog reference of the group

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
45

• If an individual part has no catalog reference or if Create fixture
data = no has been set, the geometry is “passed” to the group.
• When choosing a substitute symbol and selecting Calculate max.
expansion, only the geometry of the part is considered for each
part of the group. If a substitute symbol is set for the entire group,
however, and Calculate max. expansion is set, the min-max box
of all parts is taken into account.
• The No - Presentation such as CAD Foil option is only possible
on individual parts. If this option is set for the group, data is
presented by 3D solids of the transferred geometries of the parts
(if applicable).
• A reference point of all parts with the lowest XY coordinates, as a
reference point for the group.
Non-dynamic fixture groups with the Group leading option, which
are exported in link with precast elements in the IFC, are exported
automatically as IfcElementAssembly. The ifcElementAssembly is
automatically given the list text set in the catalog as the name. The
attributes written on the group fixture are exported to this assembly. The fixtures installed in the group are output in the IFC also
as parts of the assembly.
Note: For the special scenario of an Iso basket as a non-dynamic
fixture group with the Group leading option, nothing has been changed for reasons of compatibility. This means that here no catalog
reference to the group definition should be saved, as special treatment occurs in the annotations for the Iso basket, which would no
longer pass.
Should you have any further questions on this, please contact your
personal sales engineer or our technical support team in Puch.

46

Catalogs and Configurations

Allplan 2023

Insulation Material Catalog, deduction value for cutting tool
Two values have always been defined for the Half·panel·length and
the Half panel width in the Insulation Material Catalog under
Catalogs, General information on the Placement tab, however,
these are only ever taken into account within the program.
This has now been changed. An individual Subtraction value for cutting tool for half slabs is now always defined to take account of the
width of the cutting tool

Layout catalog, new functions for formula editor
When using the formula editor to define an iTrigger or labeling for the
layout catalog, the OPENINGMACROCOUNT and GROUP functions
have been extended specifically.
• Using the new OPENINGMACROCOUNT function you can, for
example, count all openings with an opening macro for slabs or
wall elements (iWall), which geometrically influence the selected
precast element. Openings that lie outside or that only touch the
precast element are not counted. Other criteria can also be used
in the same way as the FIXTURECOUNT function.
For example, the formula OPENINGMACROCOUNT(@507@;"Holzab") counts all openings containing
a macro with the Name (Attribute @507@) = HolzAb.
• Use the GROUP function to group elements with attributes, such
as reinforcement, precast elements, etc., (in other words, combined into groups). ‘As a result, almost identical dimensioning can be
achieved for the reinforcement bars, for example, as for precast
elements in combination with the Dim. string index.
To do this, use the desired elements automatically or also manually (e.g. reinforcement bars) with an attribute. Next assign a vaAssign attributes.
lue for this attribute with
Depending on how the elements (e.g. reinforcement bars) are to
be grouped, a formula must then be adapted with the GROUP
function so that all components with identical index are grouped
together on the same dimension line. You can also group together

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
47

multiple indices on a single dimension line.
The GROUP function considers 3 different scenarios:
- Attribute on considered element (e.g. bar) available & in group;
bar dimensioned & grouped
- Attribute on considered element (e.g. bar) available & not in
group; bar not dimensioned
- Attribute on considered element (e.g. bar) not available; original dimensioning for bar
For example, one grouping using the attribute Dim. string index
(@1013@, Integer) could appear as follows; GROUP("1-4:A; 58:B";@1013@). All rods with dimension string index = 1-4 are listed
on a dimension line, which receives text A as dimension line name.
The rods with dimension string index = 5-8 are listed on a second
dimension line, which receives text B as dimension line name.
Note: Only one individual attribute can ever be evaluated with the
GROUP function.
Should you have any further questions on this, please contact your
personal sales engineer or our technical support team in Puch.

48

Catalogs and Configurations

Allplan 2023

Layout catalog, dimensioning of bricks
For a brick arrangement with a placing angle of 0°, 90°, 180°, 270° or
360°, as many dimension lines are always generated as there are
different rows for the dimensions of rows of bricks in the Element
Design (iWall) function
Plan for the walls generated using the
where Element type = Brick wall. In the case of non-staggered
laying, one single dimension line is drawn; in the case of staggered
laying, two dimension lines are drawn.
Note: In order to dimension the bricks in a view/section, go to
Catalogs, General, Layout catalog on the Dimensioning tab, then
Special components and choose the option Brick and tile
areas/bricks/tiles. Or go to the Shell/Presentation tab and choose
the option Bricks/tiles under Presentation.
If additional brick areas are added in
Modify Wall in View with
areas for surfaces, concrete, insulation, brick and tiles, they will be
dimensioned on their own dimension lines.

Layout catalog, dimensioning of hollow blocks in walls
The hollow blocks in the walls generated using the
Design (iWall))
tool where Element type = Concrete wall and Sandwich wall are
now dimensioned on their own dimension lines.
To do this, select the new Special dimensions for hollow blocks
Catalogs, General, Layout catalog for views with
option under
viewing direction = 1/6 or 2/4 on the Dimensioning tab in the Geometry group. You can decide whether the min-max points or the
center of gravity is to be dimensioned on one dimension line per
hollow block (= Dimension separately) or on combined dimension
lines (= Dimension together).
Note: Under
Catalogs, General, Layout catalog in General, Dimension lines, Dimension groups , you can customize the default HO
designation for the dimension line(s) of the hollow blocks.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
49

Layout catalog, change for panel edge dimensioning settings
The options for panel edges and connections in a view or section
Catalogs, General, Layout catalog on the Dimensioning
under
tab in the Geometry group have been revised.
The previous selection dialog with the options No, Only panel edge
and Panel edge and connections for the parameter Panel edge has
been changed into two settings for Panel edge and Dimension
connections with check boxes (Yes/No).
If you disable panel edge, the other parameters will not be displayed.
Only when you activate Panel edge can you specify whether the
options Dimension together, Dimension separately or Dimension
hidden edges separately are to be used for Dimensioning panel
edge.
The Dimension separately option has been completely revised, as
this setting previously gave the same result as the Dimension together setting.
Following this revision, more flexible settings for the precast element
layers are possible with regard to the precast element dimensioning.
Connecting points can only be ignored or dimensioned for individual
layers. It is possible to have separate dimension lines for the individual precast element layers, which can therefore be easier to identify
as a result. This helps reduce the complexity of the points to be dimensioned on the panel dimension line.
For compatibility reasons, a set option Dimension separately is now
automatically set to Dimension together. The entire precast element is now dimensioned on the panel edge dimension line. The
effects of the Dimension hidden edges separately option remain
unchanged.
If you activate the revised option dimension separately, you can
make special settings for dimensioning the layers. A selection for the
and
take you from entry to
component Layers appears first.
entry. With , open the sub-dialog where you can make the settings for all layers in a detailed dialog.
Here you can make the following configuration:

50

Catalogs and Configurations

Allplan 2023

• Dimensioning; specifies whether the layer should be dimensioned
or not.
• Dimension separately; specifies whether or not to create your
own, separate dimension line for the layer. If you select this option, the number of the layer is written to the dimension line so that
you can identify the dimension line.
• Dimension connections (only for walls); specify whether points
of the connection that are in the layer should be dimensioned or
not
The setting Dimension connections is now only visible for the layout
for one wall. This is not required for slabs, structural precast elements and precast elements, as no connections are possible here.

The following options are visible in the example below:
• All layers of the triple-layer precast element are shown, although
only some of the individual layers are dimensioned.
See, for example, the lateral dimension lines for layers 1 (PL 1) and
2 (PL 2) to the left next to the panel and the dimension lines for
layers 1 (PL 1), 2 (PL 2) and 3 (PL 3) below the panel.
• The connecting points in just their individual leaves are ignored or
only dimensioned in individual layers.
For example, see the connection in layer 3, which contains a nut.
This is not dimensioned in the lateral dimension line. The dimension line for layer 3 is omitted.
Note: The option dimension separately option is no longer available
for precast elements of the structural precast element type, because there are no layers here.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
51

Layout catalog, change for opening and recess dimensioning settings
The options for Openings and Recesses in a view or section under
Catalogs, General, Layout catalog on the Dimensioning tab in
the Geometry group have been revised.
When selecting the Dimension separately option for opening and
recess dimensioning, the Dimension mode additional parameter is
now displayed.
Here you can define whether the openings or recesses should be
dimensioned either by the Min-Max Points or via All points. This will
generate different results for trapezoidal openings or recesses in
particular. The default setting for this new option is Min-Max Points.

Layout catalog, mark number and dimensioning of fixtures
The setting Label fixtures or Dimension fixtures
was added
under Catalogs, General, Layout catalog in the Properties for the
views and sections. They can be found in the Text tab under Fixtures
mark number or in the Dimensioning tab under Fixtures.
You can use All, Only these and Not these to define which fixtures
are to be labeled with a mark number or dimensioned.
If All is selected, the dimension line index is not used as the basis for
labeling nor dimensioning. If Only these is selected, only the fixtures
with the configured dimension line indices will be labeled with the
mark number or dimensioned. If Not these is selected, all fixtures,
except those with the configured dimension line indices selected, will
be labeled with the mark number or dimensioned.

Layout catalog, labeling of symbol fixtures on the dimension line
The labeling of symbol fixtures on the dimension line is now active for
the absolute dimensioning.
To do this, select the absolute option under
Catalogs, General,
Layout catalog on the Dimension lines tab under Horizontal and/or
Vertical dimension lines for the Dimension parameter.
Then select the As per labeling option on the Dimensioning tab in the
Fixtures group under Special dimensions for fixtures. For Dimensi-

52

Precast slab

Allplan 2023

on lines additional text, select one of the horizontal, vertical or horiz+verti. options and define the template for labeling. You can use
the Allplan Formula editor here to define additional text as the labeling for fixtures on the dimension line.
Note: Please note the Dimensioning Point(s) setting must be selecCatalogs, General in the
ted for the corresponding fixtures under
Fixture catalog on the Element Plan 1 tab for the Dimensioning
Points parameter. When setting the Min-Max Points, there is no
labeling for the corresponding symbol fixtures.

Precast slab
Calculations of shear force and bond
The results of the calculations of shear force and bond as per DIN EN
1992-1-1:2011-01 conducted using the Shear Reinforcement tool
had always been displayed in Internet Explorer, regardless of the
default browser configuration.
This has now been changed. The configuration for the operating system’s default browser will now generally be taken into account.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
53

Precast Wall
Replaced functions for wall panels
Precast Wall = Wall·panel can no longer be selected in
Design in
Design (iWall) function for Element
Allplan 2023. Please use the
types = Concrete wall and Sandwich wall instead.
As a result, the special functions
Angle for Assembly in the Fixtures task area,
Cast-in nuts for guardrail system under
Assembly Parts and
Secondary Reinforcement for Wall panel
type walls have been removed. Furthermore, the outlet of the funcModify Wall in View has been changed slightly. The option to
tion
Manually add front mounenter front mounted elements using
ted element is also omitted along with the wall panel design mode
design type. The outlet after selecting
Modify Wall in View has
therefore also been changed. Now, once you have selected this tool,
the first wall is folded into the view window and you can also select
one of the modification options ( Modify wall element geometry,
etc.).
The wall·panel with the entries Panel type catalog and Reinforcement type catalog has been removed under
Catalogs, Wall .
Likewise, the Wall·panel tab featuring special settings for the proCatalogs, Site facilities, NC-Gen
duction of wall·panels under
Driver catalog is also omitted. With regard to the
configurations
for the wall programs, the entries for the wall·panel (Design and
Reinforcement) are omitted.
Should you have any further questions on this, please contact your
personal sales engineer or our technical support team in Puch.

54

Precast Wall

Allplan 2023

Consideration of wall-height architectural recesses in iWall
In the case of wall-height architectural recesses (generated, for
Door or
Joint) which separate a wall compleexample, using
tely, this process had to date been designed beyond the corresponSpacing characteristic.
ding recess by using
This has now been improved. A new wall element is started after
each wall-height recess separating the wall.

Ignore Precast element element state for all wall types in iWall
The Element state = Ignore precast element, which had to date only
Design (iWall) funcbeen available for walls generated using the
tion for Composite sheeting type walls, is now available for all wall
types. Once this element state has been set, the corresponding precast elements (such as very short wall elements) are now ignored
for all annotations.
To set, activate the desired element and manually set the element
state on the Attribute tab in the Element States and Actions group.
• The corresponding element is consequently excluded from Rearrange Marks. It no longer occupies a position in the regular number range of the mark numbers.
• For the automatic labeling, a ”---” as construction lines is displayed in place of the mark number. The text underneath the mark
number or variable text image is also displayed as construction
lines.
• The element is no longer displayed in the Element Plan. However,
when the panel is being edited, the element may continue to be
displayed in order to edit it using
Model Precast Elements.
• The corresponding precast element is excluded from all annotations, such as the generation of Production Data or lists, the TIM
Export or the Element·plan·in·batch·run.
• This state can also be manually removed again too.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
55

Sleeve shift on collision with lattice girders for iWall
When generating or modifying a wall generated using the
Design
(iWall)) tool, an automatic offset of the Cast-in nuts can be selected
if they collide with the Lattice Girders. As a result, Allplan 2023 no
longer features complex checks and reworking that had previously
been necessary, for example, to prevent the cast-in nuts in the second leaf from being flattened by the Lattice Girders when the leaf
produced first of all is turned in.
To define whether or not a check and therefore a subsequent offset
of the cast-in nuts should occur, the Cast-in Nut Offset was expanBasic Reinforcement,… on the Cast-in Nuts tab in the
ded under
Other Cast-in Nut Parameters subdialog.
The Consider Collisions with Lattice Girders = Yes/No parameter
(check box) had been added in the Cast-in Nuts Offset group. This
Basic
check box is only visible for a span direction (setting on the
reinforcement,… tab in the Basic reinforcement general group) of 0
° (= Lattice Girders Perpendicular in Element). No setting can be made
for any deviating values for the span direction. The offset of the
Cast-in Nuts may need to take place manually, where required.
If the check box remains disabled, the algorithm will remain complete
unchanged. If the checkbox is active, an Offset to lattice girders
parameter appears. Here enter the required offset of the mounting
part for the sleeves to set the lattice girder axis. The offset is always
based on the enveloping min-max box of the fixture.
Note: In the following investigation, only those Lattice Girders that
can be generated using the automatic features in iWall are investigated. These are the normal Lattice Girders and the intermediary carriers for the Concrete wall, Double·wall and Thermal·wall Design
Modes. In the case of the Thermal wall, the auxiliary lattice girders
are also considered. Please note the aforementioned Lattice Girders,
intermediate carriers or auxiliary lattice girders in the event of a
manual offset, copy, etc., or the manually generated secondary lattice girders, which have been integrated into the Element Plan or
panel editing using the
Secondary Girders or
Shear
the
Girders tools in
Secondary Reinforcement, cannot be controlled.

56

Precast Wall

Allplan 2023

If the Consider Collision with Lattice Girders option is active and
Lattice Girders have been added in the corresponding element in the
first place, a Collision Check and, where required, an offset of the
Cast-in Nuts will be undertaken. The Cast-in Nuts will initially be positioned according to the existing rules. Checks are then made to see if
the C-i nut is located within the sphere of influence of a Lattice Girder.
The sphere of influence of the Lattice Girder is defined by the value
stipulated under Offset to Lattice Girder Axis. This is applied to the
left and right next to the Lattice Girder axis.
If the C-i nut is not located within this sphere of influence, a valid position is therefore found for the C-i nut. If, however, a C-i nut is located within the sphere of influence specifically on or to the left or
right next to the Lattice Girder axis, this must be offset further.
Note: It is only the Lattice Girder axis and the position of the fixture
that will generally be investigated for the Cast-in Nuts. There is no
real Collision Check undertaken between the Lattice Girders and the
fixtures. In the case of flat Cast-in Nuts that do not collide with the
Lattice Girder at all, the Consider Collision with Lattice Girders option must therefore be switched off where required.
The direction of the offset is in accordance with the configured variant for the Offset of Cast-in Nuts parameter.
• If the configured variant Only horizontal is selected, the C-i nut is
therefore offset further in the direction (left or right) next to the
Lattice Girder into a position where it is next to the Lattice Girder.
If the C-i nut is located precisely on the Lattice Girder axis, it will
be offset outwards (to the left or right, i.e. away from the center
of gravity).
Note: When selecting the Center of gravity option for C-i nut
arrangement, the C-i nut will always be displaced to the right.
The C-i nut is therefore offset until the min-max box of the C-i
nut is completely outside of the defined range.
• If any is the chosen variant, the C-i nut will initially be displaced
horizontal, vertical or in any direction (depending on the shortest
distance). If it is positioned within the sphere of influence of a Lattice Girder, it will be offset further until it is outside of the sphere

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
57

of influence.
However it will only be offset horizontally, analogous to the Only
horizontal variant. As a result, the same rules regarding the direction of the offset and the min-max box of the C-i nut as those
applicable to the Only horizontal variant will apply.
Finally, checks are made once again to see if the Minimum spacing
from openings and Minimum spacing from element edges offsets
in the Edge offsets group of the Other Cast-In Nut Parameters
Basic
subdialog, which is found on the Cast-In Nuts tab under
reinforcement,... have been observed.
If this condition is met, a valid position is therefore found for the C-i
nut. If, on the other hand, the C-i nut slips too close to an opening, an
element edge or one of the following, automatically generated Lattice Girders owing to the additional offset, it will be left in the original
position before the additional offset, and the message Minimum
spacing of C-i nut from the Lattice Girder cannot be observed
owing to a clash in spacing’ will appear. Please change the parameters output.

58

Precast Wall

Allplan 2023

Improvements in input dialogs for iWall
On the Division Parameters under
Spacing characteristics, you
can only select the entry for Round Lengths if either the Consider
Cranes option under Length Spacing Variants or the Limit Weight
option under Length Spacing Parameters have been selected beforehand. The entry for Round Lengths and the Rounding value were
therefore positioned directly underneath the entries for Limit
Weight in order to provide a better overview.
Under
Basic reinforcement,... on the Lifting bolts tab, the Check
lateral lifting bolts option in the Definition of lifting bolts can now
only be configured if the Generate option has been activated in the
Lateral lifting bolts group.

Boolean functions for user-defined architectural elements in
views/sections
Boolean functions can now also be applied in views and sections to
precast·elements, which have been generated from a User-Defined
Precast Elements or
Design (iWall))
Archit. Element using the
tools. This could, to date, only be applied in the Plan View or isometry.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
59

Precast Elements
Removed functions in Precast Element task
The
Axis Grid for Precast Elements,
Explode Axis Grid for
Precast Elements and
Multi-Pitch Roof Plane tools in the Precast Element task are no longer available in Allplan 2023. You must
Axis Grid,
Explode Axis Grid basic tools
use the corresponding
as well as the tool to model roof frames ( Roof Frame and
Custom Planes) instead.

Span direction as 3D vector
In the case of structural precast elements and precast elements, the
span direction was previously defined by the 2D angle on the globe
model. A span direction of 0° therefore always points east in relation
to this globe. Special rules were laid down for the North and South
Entry via two
Poles. This meant that a 2D entry angle (such as
points) could have a completely different span direction than intended. Direct entry of the span direction as a 3D vector had not been
possible to date. An auxiliary view had therefore always been required for this purpose.
This has now been changed. In the new version of Allplan, 3D vectors
are defined that can be defined by two 3D points when entering the
viewing and span direction in the Orientation group via two points.
The 3D vector is then displayed for the viewing and span direction in
place of the existing 2D vector. Furthermore, the two parameters
Viewing direction and Span direction now have the same four,
Entry via two points,
Entry via three
standard input options
points,
Entry via midpoint and Switch direction.
In the case of structural precast·elements, the Production dimensions and Loading dimensions groups are also available alongside the
Orientation group. Both of these groups have been adjusted accordingly.
Furthermore, when setting absolute for the production site or loading site, you can also choose from the four, standard input options

60

Formwork

Allplan 2023

Entry via two points,
Entry via three points,
Entry via
midpoint and Switch direction, as entry here is now also via 3D
points. The existing entry has been retained for the Relative to span
direction setting. The existing entry via 2D points with the
Entry
angle in Plan View,
Entry via two points and
Switch direction
variants can all still be selected. In order to make reference to the
entry via 2D points, the two Production direction und Loading direction parameters have been renamed here, becoming Production
direction 2D and Loading direction 2D.
The entry sequence in the Orientation group has now been amended
to Reference point, Viewing direction and Span direction.
Note: In the case of Precast Wall (iWall), the entry sequence has also
been changed to Reference point, Viewing direction. As before, it is
not necessary to enter the Span direction in the Orientation group
for PythonParts and 3D objects.

Boolean functions for user-defined architectural elements in
views/sections
Boolean functions can now also be applied in views and sections to
precast·elements, which have been generated from a User-Defined
Precast Elements or
Design (iWall))
Archit. Element using the
tools. This could, to date, only be applied in the Plan View or isometry.

Formwork
Shuttering boards in the Objects' palette
In the Objects palette, all shuttering boards had previously been
listed in the Shuttering board group.
To improve the distinction between targeted visible and invisible
switches and to determine the transparency or color of automatically generated and manually added shuttering boards, the shuttering
boards are now listed separately in the Automatic Shuttering Board
and Manual Shuttering Board groups.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
61

Production Planning
Reinforcement groups in Production Planning
Previously, only Reinforcement groups for which the MWS entry
Production Data, NC Geoption had been set for the selection in
nerator could be selected and sent to Production. Previously, you
could select the options Standard and Expanded for the Bend definition for transfer to production under
Catalogs, Site facilities,
NC generator driver catalog on the Filter tab when selecting Bar
type = Reinforcement groups.
If unfolded was selected, the reinforcement group was then unfolded in the longitudinal direction and any crossbars attached to the
segments were unfolded as well. However, bent crossbars were
never unfolded.
This behavior has now been completely revised and enhanced.
• The tool can now be applied both to Reinforcement groups for
which either the Precast·elements entry option or the MWS entProduction Data, NC Genery option is set for the selection in
rator.
• Furthermore, 4 variants for the Bend definition are now available
for selection, bend, rolled out, rolled out Longit and rolled out
Cross.
• Furthermore, Reinforcement groups in a precast element can
now optionally be redirected to a separate file. To do this, select
Catalogs, Site facilities,
the new Separate file option under
NC Generator Driver Catalog on the Filter tab under Redirect. In
this case, a File name/Templ. dialog (File name/Template) dialog
will be displayed. By activating the sub-dialog, you can define a
template for the file name of the reinforcement cage file, analogous to the production file name on the Data creation tab.
button behind the input field opens a sub-dialog
Clicking the
where you can define the Template and the Variable for the
creation of the file name. For this purpose, the new variable GrpNr
= Number of the reinforcement group has been added to the

62

Production Planning

Allplan 2023

other variables. You can select the component name (name of
the reinforcement group) via the variable BTName.

Note: For Unitechnik, you can rotate the meshes to their base position if necessary. Base layer refers to the plane in which the defined
base section is located. However, this only applies to groups that are
in a precast element, since freely transferred groups are rotated to
Catheir base position anyway. To activate the option, under
talogs, Site facilities, NC-Generator Driver Catalog on the Reinforcement tab, select the Rotate mesh in base layer option, for the
two variants Stapl.reinf. + leveling + cutting or Stapled reinforcement. The option is always active and grayed out for Leveling + cutting system.

New Features Allplan 2023
tools

Precast planning - automated precast planning and new precast element
63

Write Order Attribute in PXML Delegate file to NC data
If up to now the option NC files contain info from delegate file was
selected for the parameter Merge PXML delegate files on the tab
PXML extensions for an entry for generating a PXML file in
Catalogs, Process planning, NC Generator Driver Catalog, then up to
now only the element info entries from the delegate file were transferred from each element to the element of the NC file (Unitechnik).
The Order attributes generated by the NC generator itself remained
untouched.
The Order attributes are now also transferred from the delegate file
to the file for the NC generator. The following rules apply to this:
• If an attribute of the delegate file does not yet exist in the NC file
(Unitechnik), it is appended.
• If an attribute of the delegate file already exists in the NC file (Unitechnik), the content is overwritten with the content of the delegate file.
• Attributes that were created in the NC file (Unitechnik) but not in
the delegate file remain untouched in the NC file.

Transfer of open polygons in PXML file
According to the PXML interface description, a Shape object with
several points (Vertices) always forms a closed polygon (without
the last point being positioned on the first point, as is the case in Unitechnik). An open polyline is therefore mapped in such a way so that
the complete path is retraced.
Trails had previously transferred via separate shape objects for each
section. This does not go against the interface description, but this
method makes it difficult (if not impossible) to clearly distinguish
between connected trails (for linear fixtures) and other fixtures
(such as polygons or symbol fixtures).
From Version 2023 upwards, open route sections are therefore passed via the interface. This may have an impact on third-party systems, insofar as these do not take account of the interface definition
(e.g. for a length calculation).

64

Production Planning

Allplan 2023

Name of fixtures in List Generator
In List Generator, the text for naming fixtures (such as Isokorb® XT
type K-U-F-M4-V1-REI120-CV50-LR200-X120-H250-7.1) is divided into several lines, unless it fits into the available column width.
Note: In the previous lists, any text longer than the column width
stipulated in the list was no longer printed.
The program therefore searches for a "favourable" place where the
name can be wrapped around. Blanks are preferred for the text wrap.
If no blank exists, the search looks for specific special characters, e.g.
a slash, a hyphen, a comma, etc.
The text is dynamically wrapped in the list. The result in the lists may
look different depending on the column width (see, for example, the
fixture list, the single panel configuration and the measurement
sheet).

Export of NC data to the TIM
AllplanAs the most recent version, 2023 includes the export of NC
data to TIM. In future, the NC Data will be generated directly in TIM.
When creating data for TIM using the
Export TIM Data tool, a
note will appear stating that the tool will no longer be available in
future versions of Allplan. This warning can be suppressed until the
end of the program.
Please ensure therefore you configure the Production Data export
to TIM using the Regenerate Data - from Database option. The data
are then generated on TIM itself.

New Features Allplan 2023

Index

65

Index
A
Access to SmartPart functions 7
Additional criterion when
rearranging 19
Availability of reinforcement
views 17

B
Boolean functions for userdefined architectural elements
in views/sections 58

C
Calculations of shear force and
bond 52
Catalog reference for fixture
group, group leading 43
Change for opening dimensioning
settings 51
Change for panel edge
dimensioning settings 49
Connect structural framing
objects 22
Connection of structural framing
beams and braces 22
Consideration of wall-height
architectural recesses in iWall
54

D
Data conversion of
reinforcement views 17
Dimensioning bricks 48
Dimensioning hollow blocks in
walls 48

E
Export of NC data to the TIM 64
Extension for reinforcement
export 27

Extension of automatic
reinforcement 19
Extensions for construction 25
Extensions for the road
construction 24

F
Fixtures for precast·elements
task area 39
Fixtures tab for precast elements
39
Fly mode 32

I
Ignore Precast element element
state for all wall types in iWall
54
Improved export with resources
27
Improvements in input dialogs for
iWall 58
Inclined cross-sections for
structural framing objects 22
Insulation Material Catalog,
deduction value for cutting
tool 46
Interaction with precast element
for Model Precast Elements
39

L
Label PythonParts 20
Labeling of symbol fixtures on
the dimension line 51

M
Mark number and dimensioning
of fixtures 51
Modification of sleeve
parameters 19
Multitext leader 30

66

Index

N
Name of fixtures in List
Generator 64
New attribute thickness ID 41
New functions for formula editor
46
NID export of multiple layouts 27

P
Precast Elements 36
Catalogs and Configurations
42
Formwork 60
New features across modules
38
Precast Elements 59
Precast slab 52
Precast Wall 53
Production Planning 61
Presentation of bending shape in
plan view or on element plan
40
Production file name for
production or ERP data 42
PythonPart crane from the
library 41

R
Reinforcement cut for Model
Precast Elements 39
Reinforcement groups in
Production Planning 61
Reinforcement Views
Availability 17
Data conversion 17
Removed functions for wall
panels 53
Removed functions in Precast
Element task 59
Roughness surface property 32

S
Search in Actionbar 7
Shuttering boards in the Objects'
palette 60

Allplan 2023
Sleeve shift on collision with
lattice girders for iWall 55
Span direction as 3D vector 59

T
Task area Reinforcement Views
Functions 38
Text leader after text creation
29
Text leader on modifications 30
Text wrapping 30
Transfer of open polygons in
PXML file 63

V
Views and Sections 12
Automatic dimensioning 16
Extended function scope 12
Extended text parameters 15
Extensions in the presentation
14
Favorites for formats 15
Multiple modifications 16
Position of heading and scale
15
Resetting the Section
Identifier 16
Views perpendicular to
reference surfaces 13
Visual Scripting 33
Create object function 34
Create Pyp script only function
34
Cross-script copying 35
Save to project file 35
Size of script display 35
Stop function 34
Watch list palette 35

W
Write Order Attribute in PXML
Delegate file to NC data 63


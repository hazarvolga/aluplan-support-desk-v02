# MAN [Eng] SCIA25.0 - Advanced Training integration with BIM Workflows

**Kategori:** SCIA Engineer Manual
**Kaynak:** `MAN [Eng] SCIA25.0 - Advanced Training integration with BIM Workflows-uftnbnno5om.pdf`

---

**Toplam Sayfa:** 65


## Sayfa 1

\ SCIA ENGINEER
ADVANCED TRAINING
Integration with BIM workflows

Advanced Training – Integration with BIM workflows
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
Introduction ......................................................................................................................................................... 5
Modules ............................................................................................................................................................ 5
Other applications ......................................................................................................................................... 5
Chapter 1: Analytical model versus structural model ....................................................................... 6
Different representations explained .............................................................................................. 6
Generating the structural model in SCIA Engineer.................................................................... 6
Mode ................................................................................................................................................... 7
Priority ................................................................................................................................................. 8
Alignment and eccentricities .......................................................................................................... 8
Gaps/Cuts .......................................................................................................................................... 8
Example with advanced settings .................................................................................................. 9
Chapter 2: Open BIM & IFC ..................................................................................................................... 10
Open BIM & IFC ................................................................................................................................. 10
OpenBIM ..........................................................................................................................................10
IFC format ........................................................................................................................................10
IFC exchange in SCIA Engineer .................................................................................................... 11
Shape representations ..................................................................................................................11
Profile definitions ............................................................................................................................12
Export IFC ........................................................................................................................................... 13
IFC/BIM Properties ........................................................................................................................13
Available file formats .....................................................................................................................14
Exporting an IFC from SCIA Engineer ......................................................................................14
Export of specific elements or geometry ...................................................................................16
Import (or Update) IFC ..................................................................................................................... 17
IFC/BIM Properties ........................................................................................................................17
Available file formats .....................................................................................................................17
Importing (or Updating) an IFC in SCIA Engineer ..................................................................17
Import of specific elements or geometry ...................................................................................21
BIM Toolbox ....................................................................................................................................... 22
Convert .............................................................................................................................................22
Align...................................................................................................................................................23
Exchange with BIMPLUS or BIMCloud ........................................................................................ 28
Chapter 3: Exchange via the Revit-link ................................................................................................ 33
Installation of the Revit-link ........................................................................................................... 33
Overview ............................................................................................................................................. 35
Exchange from Revit to SCIA ........................................................................................................ 37
Generating the analytical model in Revit ..................................................................................37
Exporting the model to SCIA Engineer .....................................................................................40
Managing the mapping tables .....................................................................................................44
Opening the model in SCIA Engineer .......................................................................................47
Exchange from SCIA to Revit ........................................................................................................ 48
Exporting the model to Revit .......................................................................................................48
Opening the model in Revit..........................................................................................................49
Chapter 4: Exchange via the Tekla-link ............................................................................................... 52
Installation of the Tekla-link ........................................................................................................... 52
Overview ............................................................................................................................................. 55
Exchange from Tekla to SCIA ........................................................................................................ 56
MC – 20/01/2025 3

Advanced Training – Integration with BIM workflows
Generating the analytical model in Tekla .................................................................................56
Exporting the model to SCIA Engineer .....................................................................................58
Opening the model in SCIA Engineer .......................................................................................62
Exchange from SCIA to Tekla ........................................................................................................ 63
Exporting the model to Tekla Structures ...................................................................................63
Opening the model in Tekla Structures .....................................................................................64
4 MC – 20/01/2025

Diversen
Introduction
The construction industry is split up in many separate providers, from designers up to building part suppliers; each party
is using software for different tasks (design, costs, detailing, fabrication…). Today we are aware that a major part of the
inefficiency in construction is due to inadequate cooperation between the construction partners, resulting in errors,
repetitive work, extra costs etc.
There are solutions to fundamentally improve the cooperation between construction partners, even with each party
keeping its own existing software. If we agree on how to exchange information, if we use digital 3D models of
structures, if we use standard exchange formats and if we can control the workflow between project partners, then we
all win.
This manual will explain the different methods for exchanging BIM models with SCIA Engineer and discuss the possible
workflows and correct procedures to have a good model exchange.
Modules
The SCIA license modules that are needed for exchanging certain data to and from SCIA Engineer are:
MODULE CODE INCLUDED IN LINK TO RESOURCE CENTRE
Expert edition https://www.scia.net/en/resource/fact-sheet/interoperability-
Revit link Sen.11
Ultimate edition bim/sen11-revit-link
Tekla link Sen.12 Expert edition
bim/sen12-tekla-link
Expert edition https://www.scia.net/en/resource/fact-sheet/interoperability-
BIM toolbox* Sen.10
Ultimate edition bim/sen10-bim-toolbox
No additional modules are needed for import/export of these file formats: XML, DNF, FGBM, SAF, Bimplus, BIM Cloud,
IFC, IFC compressed, Allplan (IFC), SDS/2, CEA plant-4D, Stepsteel, or graphic formats like jpg, dwg, dxf, pdf and others.
(*) The BIM toolbox is still available but it’s more efficient to turn to the SCIA Autoconverter.
Other applications
Another SCIA application that can assist in the exchange of BIM models to SCIA
Engineer, is the SCIA Autoconverter. IFC-models can easily be converted to an
analytical model (SAF-format) to use in SCIA Engineer.
APPLICATION PACKAGE LINK TO WEB PAGE
Scia Autoconverter • Issue management https://www.scia.net/en/software/scia-autoconverter
MC – 20/01/2025 5

| Revit link | Sen.11 | - | Concept edition |  | https://www.scia.net/en/resource/fact-sheet/interoperability-
bim/sen11-revit-link |
| --- | --- | --- | --- | --- | --- |
|  |  |  | Professional edition |  |  |
|  |  |  | Expert edition |  |  |
|  |  |  | Ultimate edition |  |  |
|  |  |  | Can be purchased as |  |  |
|  |  |  | separate module |  |  |


| https://www.scia.net/en/resource/fact-sheet/interoperability- |
| --- |
| bim/sen11-revit-link |


| BIM toolbox* | Sen.10 |  | Steel edition |  | https://www.scia.net/en/resource/fact-sheet/interoperability-
bim/sen10-bim-toolbox |
| --- | --- | --- | --- | --- | --- |
|  |  |  | Concept edition |  |  |
|  |  |  | Professional edition |  |  |
|  |  |  | Expert edition |  |  |
|  |  |  | Ultimate edition |  |  |
|  |  |  | Precast edition |  |  |
|  |  |  | - Can be purchased as |  |  |
|  |  |  | separate module |  |  |


| https://www.scia.net/en/resource/fact-sheet/interoperability- |
| --- |
| bim/sen10-bim-toolbox |


| Scia Autoconverter |  | Annual subscription |  | https://www.scia.net/en/software/scia-autoconverter |
| --- | --- | --- | --- | --- |
|  |  | Includes Allplan Bimplus Professional with 3 |  |  |
|  |  | users |  |  |
|  |  |  |  |  |
|  |  | • Issue management |  |  |
|  |  | • Validation process |  |  |
|  |  | • CAD AddOn |  |  |
|  |  | • API |  |  |
|  |  | • BIM attribute management |  |  |


Advanced Training – Integration with BIM workflows
Chapter 1: Analytical model versus structural model
There are several different representations of a model to be considered in each project. The two representations we
are dealing with in SCIA Engineer are the analytic model and the structural model. It’s important to know and
understand this, since every export or exchange option uses only one of these representations.
Different representations explained
The analytical model is used for calculations. It is a model in which a beam or
column is represented by a single line. The cross-section that belongs to that
beam or column is assigned to that line, and thus the properties of that beam
or column are assigned to that line as well. A plate or wall in the analytical
model is represented by a plane with no thickness, but the information about
the material and the thickness of the plate or wall are also assigned to that
plane.
The structural model shows the volumes and shows how the structure will be
built, so the elements are connected to each other in a realistic way. It can be
used for construction drawings amongst other things. In SCIA Engineer, it’s
possible to generate this representation. Of course, the correct settings need
to be used to ensure generating it correctly. In order to see it, you must
activate the functionality for the structural model. In modelling software like
Revit and Tekla, the emphasis lies on this volumetric representation.
SCIA, being calculation software, mainly uses the analytical model. When exchanging models between SCIA and Revit or
Tekla using the plugins, the analytical model is being exchanged and it is very important to make sure it is properly
constructed. The IFC format, however, uses the structural model.
Some modelling programs offer the possibility to generate the
analytical model, but this does not necessarily ensure a good
underlying analytical model at all. As you can see in this figure, a
good-looking structural model can contain a very bad underlying
analytical model. The beam is clearly not connected to the columns
in the analytical model.
Generating the structural model in SCIA Engineer
In order to generate the structural model in SCIA Engineer, you must activate the functionality for the structural model
in the project settings dialog.
6 MC – 20/01/2025

Chapter 1 – Analytical model versus structural model
The structural model can then be activated, either via the visualisation options or the view settings from the context
menu (right click).
When the structural model functionality is activated, the properties window will show a
section for the structural model (in advanced mode, so be sure to have all properties
unfolded by showing the red arrow on the top right). Priorities, alignments, eccentricities
and gaps or cuts can be defined here.
The principles are explained below. All settings are explained in detail on help.scia.net >
Modelling > Geometry > Structural model.
Mode
Three mode options are available, with varying degrees of settings that will be automatically
handled by the software or must be defined manually.
• General: Only one checkbox can be changed to lock the geometry.
This mode is most suitable for members with special geometry (like solids with
openings in them for instance).
Imported members often have this mode by default, but this can cause unwanted
behaviour when the members are exported again to IFC.
• Automatic: Settings are taken ‘automatically’ from the member definition. Default
values are shown but can be changed manually.
• Manual: This mode follows the same logic as ‘Automatic’, but more options are
now available for end-cuts.
MC – 20/01/2025 7

Advanced Training – Integration with BIM workflows
Priority
Note that the type of a member plays a role in the default priority settings. These are defined by the number between
brackets, 80 in the example on the previous page. The priority can be changed by choosing another type or overwriting
the priority in the structural model section.
To explain this behaviour, let’s look at the following examples:
The first picture shows the visualisation of the analytical model, where the
column and beam are simply drawn to the node.
The second picture shows the structural model, with priority 80 for the beam and
100 for the column. Note that the shape and orientation of the cross-section are
taken into account to connect the members.
In the third picture, the priority is 100 for the beam and 80 for the column. The
beam is now drawn on top of the column.
Alignment and eccentricities
With the alignment, you can change the way the member is drawn with respect to the member system line of the
analytical model. They are drawn the same way by default. The line is usually in the centre of the cross-section. You can
change this so for example the member is drawn under this line, with the value ‘Top’ for the alignment as shown in the
picture below. Or you can define the eccentricity values manually, for instance to -80mm as shown below. Note that
these changes only affect the structural model, so the eccentricities will not generate additional internal forces in the
structure when calculating. This can be used when some members are for instance lower than other members, without
changing the analysis model.
Gaps/Cuts
With end-cuts, you can define the end detail of the profile manually. A regeneration of the structural model is
necessary before the changes are visible. In the example below, the structure is shown without gap first, and secondly,
a gap of 50 mm is defined between the end of the beam and the column.
8 MC – 20/01/2025

Chapter 1 – Analytical model versus structural model
Example with advanced settings
As an example, the following structural model can be achieved with the setting for end-cuts and eccentricities shown
below. (The columns are 3,6m high, the beam is 3m long.) The orange lines show the analytical model, the volumes are
shown for the structural model. Please pay attention to the way the members are connected in blue.
Beam Bracing
Detailed information for each setting of the structural model can be found on: help.scia.net > Modelling > Geometry >
Structural model.
MC – 20/01/2025 9

Advanced Training – Integration with BIM workflows
Chapter 2: Open BIM & IFC
Open BIM & IFC
OpenBIM
OpenBIM®1 extends the benefits of BIM (Building Information Modeling) by improving the accessibility, usability,
management, and sustainability of digital data in the built asset industry. At its core, openBIM is a collaborative process
that is vendor neutral. openBIM processes can be defined as sharable project information that supports seamless
collaboration for all project participants. openBIM facilitates interoperability to benefit projects and assets throughout
their lifecycle.
OpenBIM ensures that:
1. Interoperability is key to the digital transformation in the built asset industry
2. Open and neutral standards should be developed to facilitate interoperability
3. Reliable data exchanges depend on independent quality benchmarks
4. Collaboration workflows are enhanced by open and agile data formats
5. Flexibility of choice of technology creates more value to all stakeholders
6. Sustainability is safeguarded by long-term interoperable data standards
Open BIM is a universal approach to the collaborative design, realization and operation of buildings based on open
standards and workflows. Open BIM is an initiative of BuildingSMART and several leading software vendors using the
open BuildingSMART Data Model.
IFC format
At its core, buildingSMART enables the entire built asset industry to improve the sharing of information throughout the
lifecycle of project or asset. By breaking down the silos of information, end users can better collaborate and cooperate
regardless of which software application they are using. buildingSMART’s technical core is based around Industry
Foundation Classes (IFC) which was ISO certified in 2013.
IFC is a standardized, digital description of the built asset industry. It is an open, international standard (ISO 16739-
1:2018) and promotes vendor-neutral, or agnostic, and usable capabilities across a wide range of hardware devices,
software platforms, and interfaces for many different use cases.
Industry Foundation Classes, IFC, are the main BuildingSMART data model standard to facilitate interoperability in the
architecture, engineering, and construction (AEC) industry. The IFC format is registered by ISO as ISO/PAS 16739. IFC is
used to exchange and share BIM data between applications developed by different software vendors without the
software having to support numerous native formats.
BuildingSMART International awarded SCIA nv as the first company to pass the certification of the
interoperability standard IFC 2x3 “Version 2.0” for structural model exchange with SCIA Engineer,
as was announced during the international BuildingSMART meeting in Waltham (Boston, USA),
11-15 March 2013.
The newer IFC4 format is supported only for import in SCIA for now. Reference View and Data Transfer View are
supported. In general, all entities and representations which are supported in IFC2x3 are supported. Additionally, the
new shape representation that was introduced, Tessellation, is also supported in SCIA Engineer.
The status of IFC4 support in SCIA Engineer can be found on: help.scia.net > Data exchange > IFC > Support of IFC4.
1 Source of all information on this page: https://www.buildingsmart.org/about/openbim/
10 MC – 20/01/2025


## Sayfa 11

Chapter 2 – Open BIM & IFC
IFC exchange in SCIA Engineer
Shape representations
Elements can be represented in different ways in the IFC-format. Each representation has its own purpose and
advantages. Some of these representations are shown here to understand the import possibilities and effects of the
export settings that are available.
SweptSolid/AdvancedSweptSolid
A profile (1D element) or flat element (2D element) represented by a SweptSolid is defined and extruded along a curve
or axis. Elements with this representation can be converted to native SCIA Engineer members after import.
Objects with this representation can contain information/properties about the geometry such as cross-section,
thickness etc.
Clipping
An element created by a difference between swept area solids is represented by
‘Clipping’.
Elements with this representation can be converted to native SCIA Engineer
members after import, with a defined structural model representation.
Boundary representation / Brep
An element represented by a Brep is described with vertices, interconnected with
lines, in order to define a volume. This is most useful for complex geometry that
isn’t easy to represent using other definitions.
These entities are imported into SCIA Engineer as general volumes (general
solids). In this case, there is a possibility to use the member recognizer
functionality to convert them to native SCIA Engineer members. This
representation lacks information about thickness, cross-section etc.
CSG
Like ‘Clipping’ for SweptSolids, a CSG representation is the result of a difference between solid elements. These entities
are also imported into SCIA Engineer as general volumes (general solids).
MC – 20/01/2025 11

Advanced Training – Integration with BIM workflows
Sectioned spine
Elements with haunches or arbitrary profiles can be represented by a sectioned
spine. A sectioned spine is a representation of the shape of a three-dimensional
object composed by a number of planar cross sections, and a spine curve. The
shape is defined between the first element of cross sections and the last element
of the cross sections.
Rules that are followed for exporting specific elements according to their possible shape representations can be found
on help.scia.net > Data exchange > IFC > Ifc file format extension.
Profile definitions
SCIA Engineer supports the following IFC classes for profile definition:
• IfcArbitraryClosedProfileDef
• IfcArbitraryClosedProfileDefWithVoids
These can be imported as native SCIA
• IfcCompositeProfileDef
cross-sections.
• IfcDerivedProfileDef
• IfcCenterLineProfileDef
• IfcAsymetricIShapeProfileDef
• IfcCShapeProfileDef
• IfcCircleHollowProfileDef
• IfcCircleProfileDef
• IfcCraneRailAShapeProfileDef
• IfcCraneRailFShapeProfileDef
These can be imported as parametric
• IfcIShapeProfileDef
cross-sections.
• IfcLShapeProfileDef
• IfcRectangleHollowProfileDef
• IfcRectangleProfileDef
• IfcTShapeProfielDef
• IfcUShapeProfileDef
• IfcZShapeProfileDef
Other profiles will be imported as general cross-sections in SCIA Engineer.
Rules that are followed for exporting specific elements according to their possible profile definitions can be found on
help.scia.net > Data exchange > IFC > Ifc file format extension.
12 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
Export IFC
A model in SCIA Engineer can be exported to IFC. Remember that it is the structural model, which is exported, as
mentioned in chapter 1. To see the model in the way it will be exported, it is therefore useful to generate the structural
model view in SCIA Engineer. Please pay special attention to the ‘Mode’ in which the element is generated in the
structural model, as mentioned in section 1.2.1.
IFC/BIM Properties
The functionality ‘IFC properties’ can be switched on in the Project Data. A group of BIM related properties then
appears in the properties window. It has two main parts. The first section has advanced options for export. The general
export settings can be overwritten here for specific elements. The other one is a subgroup ‘Attributes’.
Export options
The advanced export options are different for different elements, e.g., ‘Profile’ is only there for straight 1D members
with SweptSolid geometry. The element is exported using the setting in the BIM properties instead of by the rules
defined in the export dialog. If the value is set to default, that means the element is exported by the rules defined in the
export dialog.
ShapeRepresentation and Profile represent the specific export settings for elements as explained in the previous
section of this manual.
The IFC Entity can change the object type of the element in the IFC. For instance, a shell is exported as Ifcslab by
default, but you can choose here to export it as IfcWall.
Attributes
Additional information can be attached to an IFC Entity by means of a ‘PropertySet’. SCIA Engineer support the
‘*Common’ property sets and their standard properties for all 1D members exported as IfcBeam, IfcMember or
IfcColumn, all 2D members exported as IfcWallStandardCase of IfcSlab and all general volumes exported as IfcWall. This
means some additional properties can be assigned and will be visible in the IFC in the PropertySet Pset_BeamCommon
for beams, Pset_WallCommon for walls etc.
MC – 20/01/2025 13

Advanced Training – Integration with BIM workflows
Available file formats
IFC and IFCzip
SCIA Engineer supports both plain IFC and IFCzip for export. The IFCzip file format is a zipped plain IFC. The packing and
unpacking during export and import is done automatically by SCIA Engineer.
Allplan
Since version 15.2, a special export option allows the users to export an IFC file with predefined settings for Allplan. The
exported file is a plain IFC which is exported according to Allplan user needs.
Exporting an IFC from SCIA Engineer
Before exporting, be aware if you have an active selection. If a selection of certain members is active, only these
elements will be exported.
The model can be exported from the menu:
A dialog will open to choose a file location and name:
14 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
You can choose the view definition ‘Coordination View’ or ‘Simplified View’. The first one allows you to choose the
representation per member type. The second one exports everything in brep representation.
The units in which the model is exported can be chosen, and certain member types can be included or excluded from
the export.
After confirmation, a report will be shown for the export process. This shows the number of exported entities and
errors or notifications.
MC – 20/01/2025 15

Advanced Training – Integration with BIM workflows
Export of specific elements or geometry
Openings and subregions
All openings in 1D members are exported as IfcOpeningElement with a parametric or general profile. If the repetition is
set, all openings are exported as separated objects.
Openings and subregions in 2D elements are exported as an IfcOpeningElement of type ‘opening’ or ‘recess’. The
subregion thickness must be lower than the thickness of the main slab/wall. In case the subregion is thicker than the
slab/wall, the subregion is not taken in account and the model is exported without the subregion.
When the opening in 2D member is modelled as a cut-out, no opening element is exported. This means that for
elements with a SweptSolid representation, an entire member is exported (without cut-outs). For Brep, the correct
shape (with cut-outs) is exported.
Steel connection parts
SCIA Engineer supports export of flat steel connection parts, cleats, and stiffeners to IFC as independent plates
(IfcPlate). Information about a weld (IfcFastener entity) and bolts (IfcMechanicalFastener entity) are also exported. Each
plate has a material as assigned in SCIA Engineer. Plates are exported as SweptSolid or Brep whereas bolts are only
exported as Brep. All bolts in a bolt assembly are defined as mapped items.
Concrete reinforcement
The default export of concrete reinforcement and free bars is done by means of the AdvancedSweptSolid
representation. In case you export it as Brep, all reinforcement is exported with boundary representation.
Note: 1D concrete reinforcement is exported with overlapping anchorage. This can cause problems during import in
some applications. A workaround is to explode the reinforcements in free bars in SCIA before exporting.
Concrete 1D member reinforcement and free bars are always exported as IfcReinforcingBar. Free bars which have
defined a repetition and stirrups are exported as one reinforcing bar with mapped items. 2D Reinforcement is always
exported as IfcReinforcingMesh.
Building storeys
The current SCIA Engineer version fully supports export and import of building storeys. If storeys are defined in a
project, then all members are assigned to the storey in which they are located. If a member is allocated in more storeys,
then it is exported only to the first one. If a member is allocated to no storey, then it is assigned to the building itself. In
case no storey exists in the project, no building storey is exported to the IFC file and all members are assigned to the
building.
Line grids
Only circular and rectangular 2D line grids, and rectangular 3D line grids are exported. The rectangular 3D line grid is
exported as a set of 2D line grids because the IFC file format does not support a 3D grid.
16 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
Import (or Update) IFC
IFC/BIM Properties
The functionality ‘IFC properties’ can be switched on in the Project data, but is also switched on by default after IFC file
import. Any additional information related to specific elements, that was exported in the IFC, can be viewed in these
properties.
Available file formats
SCIA Engineer supports both plain IFC and IFCzip for import. During import, it is automatically recognized if it is the plain
IFC or the zipped one. Therefore, the same function is used.
Importing (or Updating) an IFC in SCIA Engineer
IFC files can be opened in SCIA Engineer. This can be done in two ways, by importing or updating. Importing will open a
new, empty project and open the IFC. Updating will use the current project in SCIA Engineer, apply changes from the
IFC file while keeping as much as possible from the existing project, like load cases and combinations for example.
Importing or updating an IFC in SCIA Engineer can be done from the menu:
MC – 20/01/2025 17

Advanced Training – Integration with BIM workflows
A dialog will open to browse for the IFC file:
You can now choose how to import/update the model:
You can choose which entities to include or exclude from the import. Tendons can be imported as internal or free and
storeys can be imported.
The geometry can be imported as members, to continue working with the model in SCIA Engineer. All supported
members with SweptSolid representation are imported as SCIA Engineer native elements. Or as reference model, for
visual purposes and to draw members over the model for instance. All members are imported as general volumes.
Without ‘Analysis shape only’, the full structural shape of the model is imported. Creation of the structural shape can
take a lot of time. With this option activated, all elements are imported without clipping.
You can choose to ‘Run member recognizer’ in the background, so all supported members (beams, columns, walls, and
slabs) which are imported as general volumes will be attempted to be converted into native elements. After conversion
a report with a result is shown.
The National Code needs to be chosen to start an esa-project for this
model. If the material names are in accordance with this code, they will
be recognized automatically. If the material names in an IFC file are not
in accordance with code names it is necessary to define a material
conversion table in the Import dialog. For the first opening of a file with
defined material table there is the button ‘Choose file…’. For following
modifications, the button ‘Edit’ is available. The file has *.con file
extension and it is a plain text file, for example:
18 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
The first name is the name of the material in the IFC file and the second name is the code name of the material which is
used in SCIA Engineer. It is necessary to respect all characters.
Such a file can be created by opening a new txt-file, and saving it with the .com extension (be sure to choose ‘All Files
(*.*).
It can then be opened from the Import dialog:
The report will be shown for import:
MC – 20/01/2025 19

Advanced Training – Integration with BIM workflows
When using the update function, a dialog will be shown for the changes in the model.
The changes need to be interpreted correctly. Especially if you used the BIM Toolbox to convert or align a previous
version of the model. IFC describes the volumes of objects. This means that connecting and alligning the structure after
an update is seen as a modification of the structure. If you don’t want to undo these actions, you should untick these
boxes.
All beam/column nodes are generated during the import. This implies that after the update action these nodes are
placed in the groups “New entities” and “Deleted entities”.
Click on accept to import the new entities. A message will be shown:
20 MC – 20/01/2025


## Sayfa 21

Chapter 2 – Open BIM & IFC
By clicking yes, you will get a full report on the updated entities.
Import of specific elements or geometry
Openings and subregions
SCIA Engineer supports import of an IfcOpeningElement with SweptSolid representation in 1D members, with a
SweptSolid representation, as a native opening.
All IfcOpeningElements defined with a SweptSolid representation in flat walls and slabs are imported correctly as
native SCIA Engineer openings or subregions. If opening elements are defined as Brep, no opening is imported in the
analysis shape, but in most cases the opening should be included in the structural model.
Concrete reinforcement
Both IfcReinforcingBar and IfcReinforcingMesh defined with AdvancedSweptSolid representation are imported
into SCIA Engineer as free bars. If the reinforcing bar or mesh have defined mapped items, all mapped items with the
same geometry and distances are imported as a free bars with correct repetition. If a reinforcing bar or mesh is defined
as Brep then they are imported only as general volumes.
Building storeys
The current SCIA Engineer version fully supports export and import of building storeys. During import to SCIA
Engineer, native storeys are generated using the elevations defined in the IFC file. If no elevation is defined, then
storeys are generated using the placement defined in the IFC file. In case building storeys are mixed with defined and
non-defined elevations the result may be unexpected.
Line grids
Import of line grids is not supported.
MC – 20/01/2025 21

Advanced Training – Integration with BIM workflows
BIM Toolbox
The BIM Toolbox offers some functionalities to handle imported models, especially IFC’s.
Sometimes, after importing a model from another application a structure consists of unconnected general solids. These
can often be converted to SCIA native members using the BIM Toolbox.
On the other hand, a structure can be aligned using the BIM Toolbox. As explained in chapter 1, an IFC uses the
structural model representation. When such a model is imported, the generated analytical model is often not
connecting the members in the right nodes. Aligning the structure fixes this issue.
The BIM Toolbox and its commands can be found in the ‘Tools’ menu.
Note that there are a lot of settings to consider in the ‘Align’ functionality and this can take up a lot of time or become
very complicated for large models. The SCIA Autoconverter was developed to overcome these difficulties and automate
this process.
Convert
Via the BIM Toolbox you can convert volumetric elements (i.e., solids) into native SCIA Engineer elements (beam,
column, plate, wall). This is a necessary step in order to be able to calculate the imported project because you cannot
generate a mesh (thus calculating) on solids in SCIA Engineer.
This can be easily done by selecting the elements and using the proper command for the correct conversion type
(1D/2D). An automatic recognition algorithm detects the associated cross-section during the conversion of solids to 1D-
members. The same applies for 2D-members in which the associated thickness is detected and assigned to it.
Below an example of imported solid elements (left side). After conversion (right side) you will obtain native SCIA
Engineer 1D-members with their associated cross-section.
Imported solid elements Converted to native SCIA Engineer elements
22 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
Align
A model consisting of solids are interconnected based on their volumes. But in analysis software like SCIA Engineer it is
necessary to have a connection in the member system line for 1D-members or the member system plane for 2D-
members.
Below an example of not aligned & not connected 1D-members (left side). Via the align functionality in the BIM toolbox
a connection in 1 node (right side) can be obtained.
Not aligned & not connected 1D members Aligned & connected 1D members
Structural elements can be aligned by moving the nodes of the 1D-/2D-members or the entire 1D-/2D-member to the
master planes. This is done with the ‘Align’ command in the BIM Toolbox.
MC – 20/01/2025 23

Advanced Training – Integration with BIM workflows
Settings
The marked options are the properties that are usually modified during an
alignment action.
Alignment information can be shown
in a separate window.
Also, before executing the alignment,
you can see a preview appear in the
model when activating “Live Preview”.
Master planes can be chosen to which
you can align the structural elements.
The alignment of nodes from one structural type (beam, column, wall, plate) to
another structural type can be specified
Maximum displacement settings can be specified. This is an important setting
because if the node to master plane distance is higher than this value no
alignment can occur for that node.
Display options can be modified
Advanced settings.
24 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
Workflow
The workflow to follow to align a structure is explained in the example below. Each structure will require specific
settings. You can start the align function for either all entities or a selection of entities.
For this model, the following properties are checked: Live preview, all master planes.
When clicking on the current action tick box, you can see the preview of the alignment appear in the form of blue lines.
This gives you feedback of the chosen alignment settings before running the alignment.
The master planes that are going to be used can be visualized by going to the tab ‘Master planes’.
If you click on planes you can see the master planes appear in the model.
To execute an alignment in an orthogonal matter (horizontal and/or vertical), the diagonal master planes shouldn’t be
used, so they can be ticked off.
MC – 20/01/2025 25

Advanced Training – Integration with BIM workflows
To make sure the bracings are connected to the same nodes as the column and beam intersections, you can increase
the maximum displacement settings. The correct alignment is now shown for the ‘actions’.
*Run the alignment
Make sure the ‘All actions’ box is ticked before executing ‘Run Align’ at the bottom of
the properties panel.
Now the entire structure is aligned as can be seen in the following pictures.
The structure has been aligned by moving nodes, which means there can still be duplicate nodes present. Therefore, it’s
still necessary to check the structure data. The members also need to be connected using the connect members/nodes
command. They can be found in the following menu’s:
26 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
The standard settings are usually okay to proceed with. In this case, the process went as shown in the pictures:
MC – 20/01/2025 27

Advanced Training – Integration with BIM workflows
Exchange with BIMPLUS or BIMCloud
The BIMPLUS platform facilitates the workflow of a BIM project,
providing you with a wide range of features for collaboration.
This platform operates in the cloud (i.e., a BIM server). BIMPLUS
is a service provided by Allplan. It is mainly developed for Allplan
but users of different software (e.g., Revit) should be able to use
it also because the IFC-format is a vendor neutral format.
Regardless of the tool you use, you should always check the IFC files you created yourself or you received from partners
in two respects:
- Check that the geometry of the building is correct and that the components are positioned correctly. In
addition, make sure that the model is complete.
- Check that the attribute sets (Psets) of the objects include all necessary parameters, attributes, and pieces
of information.
Compared with any IFC viewer, the open BIMPLUS platform provides you with many more features and options. You
can use the platform not only to check data but also to collaborate and communicate with your partners throughout
the project.
You can upload multiple IFC models to BIMPLUS and assign tasks and communicate on this platform.
The communication between all the partners happens via BCF (Building Collaboration Format).
Whereas IFC as a neutral format is used to exchange models and building information in a BIM
project, BCF is the format partners and project participants use to communicate.
Models can be exchanged between SCIA Engineer and BIMPLUS through the import/export functions:
28 MC – 20/01/2025

Chapter 2 – Open BIM & IFC
You will be asked to log in with your BIMPLUS Account:
Choose a team, choose or create a project, model and revision, and send it to BIMPLUS using the ‘Update’ button.
MC – 20/01/2025 29

Advanced Training – Integration with BIM workflows
The model will now be exported and the progress is shown.
A report shows if the transfer was successful.
30 MC – 20/01/2025


## Sayfa 31

Chapter 2 – Open BIM & IFC
The process of importing/updating from BIMPLUS is very similar and can be done from the menu:
You will be asked to select a team, project, model and revision:
MC – 20/01/2025 31

Advanced Training – Integration with BIM workflows
The download process is shown:
A window can be shown for SAF exchange, just click on ‘OK’ and the model will be opened in SCIA Engineer.
Similarly to BIMPLUS, exchange with the collaboration
32 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
Chapter 3: Exchange via the Revit-link
The CADS Revit SCIA Engineer link facilitates the bi-directional exchange of members, loads
and supports between Revit and SCIA Engineer and in doing so plays a vital role in the overall
Building Information Modelling (BIM) process. A structure modelled in Revit can be
transferred to SCIA Engineer for structural analysis and design using CADS Revit SCIA Engineer
link. When the structural analysis and design has been completed in SCIA Engineer, the
updated model can be sent back to Revit. The modelling - analysis - design process requires
numerous iterations to arrive at the final design. CADS Revit SCIA Engineer link will save time
by avoiding duplication and reducing errors.
!
Note: Make sure you read the introduction and understand the concept of structural and analytical models.
Installation of the Revit-link
There are two ways to install the Revit plugin. It can be done from the setup of SCIA Engineer, or the plugin can be
installed from a separate setup.
It’s possible but not necessary to have SCIA installed on the same computer as Revit and the Revit plugin. This means
that employees that use Revit but don’t work with SCIA, can still install the plugin and provide exported files to the
Engineers that use SCIA Engineer, or import files coming from SCIA.
The use of these files in SCIA, and exporting from SCIA to Revit, is then possible as long as the needed modules for Revit
Exchange are available in the SCIA license.
The plugin can be installed from the SCIA Engineer Setup in the following way. First, download the SCIA Engineer setup
from the website:
https://www.scia.net/en/support/downloads
This is recommended over modifying the existing installation directly, because all the necessary files and relations are
directly available in the setup. Otherwise, a message could appear stating that some files cannot be found.
Choose to ‘Modify’ the installation, click ‘Next >’ and select the Revit plug-in under Add-ons. Select ‘This feature will be
installed on local hard drive’.
MC – 20/01/2025 33

Advanced Training – Integration with BIM workflows
The latest version of the plugin and its separate setup should be available on the SCIA Website:
https://www.scia.net/en/support/downloads/plugin-revit-structure-scia-engineer
And on the CADS website:
https://cads.co.uk/support-and-learning/product-downloads-updates/
The installation is straightforward and is shown in the images below. Recent versions of the plugin support two versions
of Revit at the same time. Older ones were installed only for one version of Revit, so if there were multiple versions of
Revit installed on your computer, it would automatically take the ‘default’ version.
Note: The latest plugin supports almost all previous versions of Revit, so it’s not necessary to download a specific older
version of the plugin.
34 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
Once the installation is complete, the following message should appear upon opening Revit:
The recommendation is to ‘Always load’ so the message will not appear again.
The following toolbar will now be available under the tab ‘CADS’:
Overview
Here’s an overview of all available options:
MC – 20/01/2025 35

Advanced Training – Integration with BIM workflows
National Code: Export to SCIA Engineer: Import from SCIA Engineer:
Choose the code according to ‘Direct exchange’ as Mode of export: ‘Direct exchange’ as Mode of export:
which the model is built The model open in Revit will be The model open in SCIA will be transferred to Revit.
(profiles, materials…). transferred to SCIA.
Mode of export: ‘File exchange’ as Mode of export: ‘File exchange’ as Mode of export:
‘Direct exchange’ The Revit model will be exported as a r2s- You will get the option to choose a s2r-file to open in Revit.
The model is sent directly from file. You will get the option to choose a
or to SCIA. This is only possible save location.
when SCIA is installed and open
on this computer. The correct
SCIA Engineer version needs to
be specified in the next option
and a valid Revit Exchange
module must be part of the SCIA
license.
‘File exchange’
An exchange file is exported and
saved or imported. This is
possible with or without
installation of SCIA on this
computer.
SCIA Engineer version:
Browse to the installation path
of SCIA Engineer and choose the
version you wish to make the
exchange to/from. This is only
necessary for the direct
exchange method.
Export selected items only:
Check this box if you wish to Family type mapping: Mapping tables: Options:
only export the current selection View the automated Layer mapping: Tables for mapping the Specify which
instead of the entire model. family mapping according Table for mapping the Revit Revit materials, cross objects or results
to the chosen National layers to the SCIA layers. sections, and other should be
Revit family path: Code. parameters to the exported/imported.
Choose or add families that are corresponding SCIA
used to map the Revit-model to properties.
SCIA cross-sections.
All possibilities in the toolbar are:
Select imported:
Consistency check:
A selection can be made based on
It is recommended to execute a consistency check before exchanging a
the following criteria:
model from Revit Structure to SCIA Engineer in order to be sure that the Documentation:
• All changes
analytical model is correctly generated and connected. If you are searching for extra
• New elements
It is recommended to apply the following setting in Revit Structure: documentation or help, then
• Geometry
Go to manage > Structural Settings > Go to the tab: Analytical Model Settings these options can be of
• Section size
> Tick on ‘Member Supports’ and ‘Analytical/Physical Model Consistency’. great help to you.
• Material type
Show Unexported: Mapping tables:
The elements that couldn’t be exported The user mapping table that can be found in the
can be localized and highlighted in the ‘Options’, can be accessed here, and can be stored or
Node format:
model via Show Unexported. loaded to/from an XML file.
You can define the
Review & Export/Import:
node format via
With the review functionality a model comparison can be made between
Options > Node
the current model in Revit Structure and the to be imported/exported
Format. This will be
model. The user has then the possibility to select which
used for the naming of
new/modified/deleted elements should be exchanged or not.
the nodes in SCIA
Engineer.
36 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
Note that the direct exchange method is (due to technical limitations) only linked to one SCIA Engineer interface for
SCIA 21 and SCIA 22. This is the old interface, so SCIA Engineer XX.X Legacy. Starting from SCIA 24, the plugin is linked to
the new interface.
Exchange from Revit to SCIA
Generating the analytical model in Revit
As referred to in chapter 1, modelling a structure in Revit concerns the structural model. For exchange with SCIA
Engineer, we are interested in the analytical model. This representation is automatically generated in Revit and can be
visualised.
An important note is that only analytical elements can be exported from Revit to SCIA. If the model contains any
architectural entities, then they won’t be exported. This also applies for elements for which ‘Enable analytical model’
has not been ticked on. Some versions of Revit or some Revit families don’t allow/have this option, so be careful about
that.
It’s very important that the analytical model is correctly constructed in Revit. This depends on the modelling of the
structural model. As you can see in the above figure, a good-looking structural model can contain a very bad underlying
analytical model. The beam is clearly not connected to the columns in the analytical model.
These issues can be prevented in Revit Structure by maintaining the analytical model or you can correct these issues to
a certain extent later on in SCIA Engineer via the BIM Toolbox.
Shown below are two examples of structural/analytical elements that can be exported to SCIA Engineer when the
correct settings are used:
MC – 20/01/2025 37

Advanced Training – Integration with BIM workflows
The analytical model can be shown using the visibility settings (hotkey ‘vv’), by not showing the general model
categories but showing the analytical model categories instead.
38 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
The picture below shows the structural model and the underlying analytical model in Revit for an example model.
This analytical model can be checked for problems by doing a consistency check from the CADS Toolbar:
A message will be shown that the check has been completed, or some warnings might be shown that can be used to
correct some inconsistencies.
Another remark is that the model you wish to exchange need to be opened in the original Revit model. Elements from
linked models are not exchanged.
MC – 20/01/2025 39

Advanced Training – Integration with BIM workflows
Exporting the model to SCIA Engineer
Either from the ‘Review & Export’ button or the ‘Options’ button on the toolbar, the analysis model can be transferred
to SCIA Engineer, either via direct exchange or file exchange. Open a 3D view to do so.
It is advised to first check the settings in the ‘Options’ dialog, even when exporting via the ‘Review & Export’ button.
Make sure to check the options on the right.
You can now click the ‘Export to SCIA Engineer button to start the exchange, or close the dialog and use the ‘Review &
Export’ button.
It is possible you will be asked to save the Revit project before continuing to the options dialog:
40 MC – 20/01/2025


## Sayfa 41

Chapter 3 – Exchange via the Revit-link
If the ‘Direct exchange’ mode of transfer is selected, the model will be opened in SCIA Engineer directly.
If the ‘File exchange’ mode of transfer is selected, a dialog will open to save the file.
The benefit of using the ‘Review & Export’ button, is that an extra dialog is shown that identifies changes regarding a
possible previous version of the exported/imported model.
You’ll have to fill in the mapping tables to define which materials and families from Revit correspond to which materials
and cross-sections from SCIA Engineer.
These settings will be remembered for future exchanges, even for different models.
MC – 20/01/2025 41

Advanced Training – Integration with BIM workflows
Based on the available materials and cross-sections in SCIA and Revit, the application will already make a suggestion for
most mappings. This is primarily based on the material type and National Code. If all the parameters are satisfied, the
application will automatically map the equivalent SCIA Engineer material. If one or more parameters do not match, the
application will prompt you with an exclamation mark to map the equivalent materials.
If you are not happy with the suggested list of materials, selecting ‘Load all’ will show all available options in the drop-
down lists so you can change/choose the best option from the selected National Code.
You can select ‘Export as unknown’ to later define the material in SCIA. No material name is then filled in.
Selecting ‘Export as numerical’ will generate a numerical cross-section in SCIA Engineer. You can no longer choose a
profile shape and section name.
Selecting ‘Export as general’ will generate a general cross-section in SCIA Engineer. You can no longer choose a profile
shape and section name.
Note: you can check the ‘Help’ button in the main dialog of the Revit link application to see which sections are
supported in the version of the plugin you are using.
For mapping certain parametrized sections, another dialog will appear to map the parameters or choose a custom
value.
After saving the mapping, a dialog will be opened, showing the export process. You can see the number of exported,
failed, and ignored entities on the left. The log is shown on the right, with a message for every step that was taken in
the export. Messages for the failed entities will be shown in red. Interpreting these can help to solve the problem with
the export of these entities.
42 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
You can save a log file after export, with the button on the bottom. You will be asked to save it and open it:
It looks like this:
MC – 20/01/2025 43

Advanced Training – Integration with BIM workflows
Managing the mapping tables
You have the possibility to manage some mapping tables in the Revit link. The tables can be viewed from the options
dialog or from the toolbar.
There are some differences depending on which function you use, namely which tables can be viewed, and also
whether the table can be exported.
From the toolbar
Using the function from the toolbar as shown above, opens the following dialog with the options explained below.
Export database:
Save an xml-file of the
mapping table to
archive or use in
another instance of
Revit.
Import database:
Open an xml-file of
the mapping table
that was saved using
the ‘Export database’
option.
Document mapping:
Mapping database: Map the entities in this model using the current user table.
Open a different table if multiple tables
are saved. Delete database: National Code: Save
Delete this table. Choose for which code this
mapping table is used.
There is a
mapping table
for all of
these tabs
A row can be
removed
from the
table by
selecting it on
the left and
using delete
The table can be extended using drop down lists
44 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
From the options dialog
In the options dialog, the mapping details can be viewed and edited to a certain extent.
The same editing options are available for the user tables, but also the general tables from the chosen code can be
viewed (not edited) here.
There is also a possibility to view and edit (only change the values) of the layers on which the elements will be placed.
MC – 20/01/2025 45

Advanced Training – Integration with BIM workflows
The path to the families that are used to map the cross-sections etc. in Revit, can be chosen or added here:
It’s possible to add your own custom families. You can use these to extend the user mapping tables.
You can see the automated mappings here:
46 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
Opening the model in SCIA Engineer
Using the ‘Direct exchange’ mode of transfer will open the model directly in SCIA Engineer upon export. SCIA Engineer
does not need to be open before starting the export.
There are two options for opening a r2s-file in SCIA, ‘Open from’ and ‘Update from’. The first one will start a new SCIA
Engineer project to open the file, the second one will use the project that is already open, and apply the changes made
in Revit while keeping any additional information that might be in the SCIA project, like load cases and combinations,
supports etc.
In both cases, a dialog will open, asking you to select the r2s-file.
The code that was selected for the export will be shown next. It can be changed with the ‘Add’ button, or you can just
continue using the ‘Close’ button.
The model will now be shown in SCIA.
MC – 20/01/2025 47

Advanced Training – Integration with BIM workflows
Exchange from SCIA to Revit
Exporting the model to Revit
For the ‘Direct exchange’ mode of transfer, a model should be opened in SCIA Engineer. No other action is required
from SCIA side.
For the ‘File exchange’ mode of transfer, you can export a r2s-file from the menu:
A dialog will be opened to choose a file location to save the file.
48 MC – 20/01/2025

Chapter 3 – Exchange via the Revit-link
Opening the model in Revit
You can now open the model in Revit using the CADS Toolbar. Either use the ‘Options’ dialog or the ‘Review & Import’
function.
Using the ‘Direct exchange’ mode of transfer will open the model that is open and active in SCIA Engineer.
Using the ‘File exchange’ mode of transfer will prompt a dialog asking to select the r2s-file to be opened.
The next steps are very similar to the workflow for exporting a model from Revit. Make sure to check the options in the
main dialog on the right and select the mappings in the upcoming dialogs.
MC – 20/01/2025 49

Advanced Training – Integration with BIM workflows
In case you are not satisfied with the available sections for mapping, you can download additional cross-sections from
the Autodesk website, like the following families:
https://knowledge.autodesk.com/support/revit/troubleshooting/caas/downloads/content/autodesk-revit-2022-
content.html
The benefit of using the Import & Review button, is that an extra dialog is shown that identifies changes regarding a
possible previous version of the model. You can choose which changes to apply in the model.
50 MC – 20/01/2025


## Sayfa 51

Chapter 3 – Exchange via the Revit-link
The log shows the steps taken in the import process. Any failed items will be shown in red.
After closing this dialog, the model is shown in Revit.
MC – 20/01/2025 51

Advanced Training – Integration with BIM workflows
Chapter 4: Exchange via the Tekla-link
The CADS Tekla SCIA Engineer link facilitates the bi-directional exchange of members, loads,
and supports between Tekla Structures and SCIA Engineer and in doing so plays a vital role in
the overall Building Information Modelling (BIM) process. A structure modelled in Tekla
Structures can be transferred to SCIA Engineer for structural analysis and design using CADS
Tekla SCIA Engineer link. When the structural analysis and design has been completed in SCIA
Engineer, the updated model can be sent back to Tekla Structures. The modelling - analysis -
design process requires numerous iterations to arrive at the final design. CADS Tekla SCIA
Engineer link will save time by avoiding duplication and reducing errors.
!
Note: Make sure you read the introduction and understand the concept of structural and analytical models.
Installation of the Tekla-link
There are two ways to install the Tekla plugin. It can be done from the setup of SCIA Engineer, or the plugin can be
installed from a separate setup.
It’s possible but not necessary to have SCIA Engineer installed on the same computer as Tekla and the Tekla plugin. This
means that employees that use Tekla but don’t work with SCIA Engineer, can still install the plugin and provide exported
files to the Engineers that use SCIA Engineer, or import files coming from SCIA Engineer.
The use of these files in SCIA Engineer, and exporting from SCIA Engineer to Revit, is then possible as long as the
needed modules for Tekla Exchange are available in the SCIA Engineer license.
The plugin can be installed from the SCIA Engineer Setup in the following way. First, download the SCIA Engineer setup
from the website:
https://www.scia.net/en/support/downloads
This is recommended over modifying the existing installation directly, because all the necessary files and relations are
directly available in the setup. Otherwise, a message could appear stating that some files cannot be found.
Choose to ‘Modify’ the installation, click ‘Next >’ and select the Revit plug-in under Add-ons. Select ‘This feature will be
installed on local hard drive’.
52 MC – 20/01/2025

Chapter 4 – Exchange via the Tekla-link
The latest version of the plugin and its separate setup should be available on the SCIA Website:
https://www.scia.net/en/support/downloads/plugin-tekla-structures-scia-engineer
And on the CADS website:
https://cads.co.uk/support-and-learning/product-downloads-updates/
The installation is straightforward and is shown in the images below. Recent versions of the plugin support two versions
of Tekla at the same time. Older ones were installed only for one version of Tekla, so if there were multiple versions of
Tekla installed on your computer, it would automatically take the ‘default’ version.
MC – 20/01/2025 53

Advanced Training – Integration with BIM workflows
The following Application is now available under ‘Applications & Components’ in the menu on the right in Tekla
Structures.
54 MC – 20/01/2025

Chapter 4 – Exchange via the Tekla-link
Overview
Here’s an overview of all available options:
National Code: Export to SCIA Engineer: Import from SCIA Engineer:
Choose the code according to ‘Direct exchange’ as Mode of export: ‘Direct exchange’ as Mode of export:
which the model is built in Tekla The model open in Tekla will be The model open in SCIA Engineer will be transferred to Tekla.
(profiles, materials…). This is transferred to SCIA Engineer.
only used for export to SCIA ‘File exchange’ as Mode of export: The ‘File exchange’ as Mode of export:
Engineer. Tekla model will be exported as a t2s- You will get the option to choose a s2t-file to open in Tekla.
SCIA Engineer version: file. You will get the option to choose
Browse to the installation path a save location.
of SCIA Engineer and choose the
version you wish to make the
exchange to/from. This is only
necessary for the direct
exchange method.
Mode of transfer:
‘Direct exchange’
The model is sent directly to or
from SCIA. This is only possible
when SCIA is installed and open
on this computer. The correct
SCIA Engineer version needs to
be specified in the next option
and a valid Tekla Exchange
module must be part of the SCIA
Engineer license.
‘File exchange’
An exchange file is exported and
saved, or imported. This is
possible with or without
installation of SCIA Engineer on
this computer.
Export items:
Choose whether you wish to
only export the current selection
instead of the entire model.
Export as:
Choose whether you want to Mapping details: Close: Language:
import the model as a new SCIA Tables for mapping the Tekla materials, Close the application. The language of the plugin
Engineer project or update the cross sections, and other parameters to the can be changed here.
one that is open. This is only corresponding SCIA properties. Help:
necessary for the direct Mappings that were made for previous A manual from CADS will be
exchange method. model exchanges can be viewed here. They opened for using the plugin. This Options:
cannot be edited or extended here but will includes release notes and Specify which objects or
be shown upon exchanging a new model. information for supported results should be
versions. exported/imported.
Note that the direct exchange method is (due to technical limitations) only linked to one SCIA Engineer interface. For
SCIA21 and SCIA22, this is the old interface, so SCIA Engineer XX.X Legacy. Starting from SCIA 24 the plugin is linked to
the new interface.
Although the Tekla link is a bidirectional link it uses two different file formats for the file exchange. If you export from
SCIA Engineer to Tekla Structures the *.s2t-file format (SCIA2Tekla) is used. If you export from Tekla Structures to SCIA
Engineer, the *.t2s-file format (Tekla2SCIA) is used.
MC – 20/01/2025 55

Advanced Training – Integration with BIM workflows
Exchange from Tekla to SCIA
Generating the analytical model in Tekla
As referred to in chapter 1, modelling a structure in Tekla concerns the structural model. For exchange with SCIA
Engineer, we are interested in the analytical model. This representation must be generated in Tekla before exporting a
model to SCIA Engineer.
In Tekla, this functionality is called ‘A & D models’ and can be found in the ‘Analysis & Design’ toolbar.
Select ‘New’ to create an analytical model.
The following dialog opens. You can define the properties as needed.
56 MC – 20/01/2025

Chapter 4 – Exchange via the Tekla-link
Some important settings are:
• Analysis application: The analysis model will be generated based on different rules which may cause one
application to be more suited for your model than another. This mainly affects the position of the member
system lines and nodes.
• Analysis model content: Carefully choose to generate a model based on selected parts or the full model.
• Analysis model filter: if you have some connections in the model, (end plates, bolts…) these should not be
exported to the analytical model and can be filtered out here.
You can create multiple analytical models. Upon exchange with SCIA, you can then select which model to use.
Analytical properties per member can be shown and changed with the function ‘Get analysis properties’ under the
Analysis & Design tab.
The following dialog then opens with settings that affect the analysis model. The ‘Axis’ and ‘Keep axis position’ options
can for instance be changed here.
More information about the analytical model and properties can be found on the Tekla support website:
https://support.tekla.com/doc/tekla-structures/2021/ana_working_with_analysis_design_models
https://support.tekla.com/doc/57ekla-structures/2021/ana_parts_analysis_properties
And also, in the CADS manual that can be opened from the ‘Help’ button in the main dialog of the Tekla link application.
MC – 20/01/2025 57

Advanced Training – Integration with BIM workflows
Exporting the model to SCIA Engineer
By opening the SCIA Engineer application and selecting the desired settings in the dialog, the analysis model can now be
transferred to SCIA Engineer, either via direct exchange or file exchange.
Make sure to check the options on the right. Some extra information about the mapping options in this dialog: If ‘Export
as Unknown’ is checked, the program will not prompt you for mapping a material whenever a material is not found in
the mapping database.
If ‘Show mapping dialog’ is checked, the program will show the mapping dialog during export/import even if all the
material/sections are found in the mapping database for us to verify.
Click the ‘Export to SCIA Engineer’ button to start the exchange.
If the ‘Direct exchange’ mode of transfer is selected, the model will be opened in SCIA Engineer directly.
If the ‘File exchange’ mode of transfer is selected, a dialog will open to save the file.
58 MC – 20/01/2025

Chapter 4 – Exchange via the Tekla-link
If multiple analysis models were created, a dialog will ask you to select the one you would like to use:
You’ll have to fill in the mapping tables to define which materials and cross-sections from Tekla correspond to which
materials and cross-sections from SCIA Engineer.
These settings will be remembered for future exchanges, even for different models.
Based on the available materials and cross-sections in SCIA and Tekla, the application will already make a suggestion for
most mappings. This is primarily based on the material type and National Code. If all the parameters are satisfied, the
application will automatically map the equivalent SCIA Engineer material. If one or more parameters do not match, the
application will prompt you with an exclamation mark to map the equivalent materials.
If you are not happy with the suggested list of materials, selecting ‘Load all’ will show all available options in the drop-
down lists so you can change/choose the best option from the selected National Code.
You can select ‘Export as unknown’ to later define the material in SCIA. No material name is then filled in.
MC – 20/01/2025 59

Advanced Training – Integration with BIM workflows
Selecting ‘Export as numerical’ will generate a numerical cross-section in SCIA Engineer. You can no longer choose a
profile shape and section name.
Selecting ‘Export as general’ will generate a general cross-section in SCIA Engineer. You can no longer choose a profile
shape and section name.
Note: you can check the ‘Help’ button in the main dialog of the Tekla link application to see which sections are
supported in the version of the plugin you are using.
60 MC – 20/01/2025


## Sayfa 61

Chapter 4 – Exchange via the Tekla-link
For mapping certain parametrized sections, another dialog will appear to map the parameters or choose a custom
value.
After saving the mapping, a dialog will be opened, showing the export process. You can see the number of exported,
failed, and ignored entities on the left. The log is shown on the right, with a message for every step that was taken in
the export. Messages for the failed entities will be shown in red. Interpreting these can help to solve the problem with
the export of these entities.
You can open the report after export, with the button on the bottom. It looks like this:
The log file will also be saved automatically in the job location in the folder ..\SCIA Engineer\Reports. It can be opened
in a browser any time to review the transfer.
MC – 20/01/2025 61

Advanced Training – Integration with BIM workflows
Opening the model in SCIA Engineer
Using the ‘Direct exchange’ mode of transfer will open the model directly in SCIA Engineer upon export. SCIA Engineer
does not need to be open before starting the export.
There are two options for opening a t2s-file in SCIA, ‘Open from’ and ‘Update from’. The first one will start a new SCIA
Engineer project to open the file, the second one will use the project that is already open, and apply the changes made
in Tekla while keeping any additional information that might be in the SCIA project, like load cases and combinations,
supports etc.
In both cases, a dialog will open, asking you to select the t2s-file.
The code that was selected for the export will be shown next. It can be changed with the ‘Add’ button, or you can just
continue using the ‘Close’ button.
The model will now be shown in SCIA.
62 MC – 20/01/2025

Chapter 4 – Exchange via the Tekla-link
Exchange from SCIA to Tekla
Exporting the model to Tekla Structures
For the ‘Direct exchange’ mode of transfer, a model should be opened in SCIA Engineer. No other action is required
from SCIA side.
For the ‘File exchange’ mode of transfer, you can export a s2t-file from the menu:
A dialog will be opened to choose a file location to save the file.
MC – 20/01/2025 63

Advanced Training – Integration with BIM workflows
Opening the model in Tekla Structures
You can now open the model in Tekla Structures using the SCIA Engineer application.
Using the ‘Direct exchange’ mode of transfer will open the model that is open and active in SCIA Engineer.
Using the ‘File exchange’ mode of transfer will prompt a dialog asking to select the s2t-file to be opened.
The next steps are very similar to the workflow for exporting a model from Tekla. Make sure to check the options in the
main dialog on the right and select the mappings in the upcoming dialogs.
64 MC – 20/01/2025

Chapter 4 – Exchange via the Tekla-link
In case you are not satisfied with the available sections for mapping, you can download additional cross-sections from
the Tekla warehouse, like the following set:
https://warehouse.tekla.com/#/catalog/details/131d7061-666b-4592-8812-c427dbdf4bb1
The log shows the steps taken in the import process. Any failed items will be shown in red.
After closing this dialog, the model is shown in Tekla.
MC – 20/01/2025 65

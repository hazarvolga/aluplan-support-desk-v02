---
title: "Allplancivilreleasenotes En-2025"
category: Troubleshooting
source: AllplanCivilReleaseNotes_EN-2025.txt
tags: [allplanYeni_Extraction, Allplan, Auto_Categorized]
---

Release Notes
In general, ALLPLAN Civil is updated with the regular ALLPLAN main releases and the monthly
Hotfixes. With older main releases ALLPLAN Civil will not always be updated with all Hotfix releases,
but only if critical bugs are fixed.
In the following you can find an overview of the most important features of the ALLPLAN Civil, before
named Allplan Bridge, versions released so far (details, small enhancements and fixes are not
included). The versions are listed in reverse chronological order of their release dates.

Allplan 2025-1-8, February 2026
Minor changes and fixes

Allplan 2025-1-7, November 2025
Minor changes and fixes

Allplan 2025-1-6, October 2025
Minor changes and fixes

Allplan 2025-1-5, September 2025
Minor changes and fixes

Allplan 2025-1-4, August 2025
Minor changes and fixes

Allplan 2025-1-3, July 2025
Minor changes and fixes

Allplan 2025-1-2, June 2025
Minor changes and fixes

Allplan 2025-1-1, May 2025
Minor changes and fixes

Allplan 2025-1-0, April 2025
General
A functionality for using scripting was implemented, where respectively prepared TCL files can be
executed via associated XML files on the basis of the TCL script language, whereby the defined
command lines are executed and the corresponding data is generated in the project. In doing so, the
entire scope of the TCL script language can be used (see the last main chapter of the help: TCL Script
Guide).
Minor changes and fixes

Allplan 2025-0-5, March 2025
Minor changes and fixes

Allplan 2025-0-4, February 2025
Minor changes and fixes

Allplan 2025-0-3, January 2025
Minor changes and fixes

Allplan 2025-0-2, December 2024
Minor changes and fixes

Allplan 2025-0-1, November 2024
Minor changes and fixes

ALLPLAN 2025-0-0, October 2024
General
Allplan Bridge was renamed to ALLPLAN Civil.
The licencing was changed from Wibu to 10Duke licensing system.
Navigation Tree
The navigation tree is now based on an accordion design which includes a search function for objects.
Construction – Calculation Output
The Construction tab has been divided into an input (as supplied before) and additionally an output
area where all performed calculation steps can be viewed in detail.
Construction Template for Precast Girders
A new type of construction has been added for defining templates for precast girders. The template
can consist of multiple phases simulating the whole “history” of a precast girder before it is mounted
on site including all details of the fabrication in a casting bed and all manipulations like storing and lifting.
One template can be re-used for an arbitrary number of girders and individually be adapted by
construction variables when used in the main construction.
New Placement: Casting Bed
A new type of placement has been added in order to simulate the boundary conditions of a precast
girder erected in a casting bed including heating/cooling cycles for curing.
New task PRECASTG
A new task PRECASTG to be used within a construction template has been added to simulate all
actions occurring during the fabrication of a precast girder such as stressing, casting and transfer of
the stressing force on a time scale.

New tasks SUPPORTAT, REMOVALAT
Two new tasks have been added for applying/removing temporary supports at certain positions of a
precast girder at certain times to simulate storing and lifting processes. Using these tasks, the user
does not need to create all the required spring elements which is done automatically by the program,
but can just refer to a certain reference point in the cross-section and station within the girder when
defining the tasks.
Submodel View
A special view has been implemented for the production history and calculation results of an individual
precast girder prior to its installation in the main structure.
New Tendon Type: Pretensioned
Now it is also possible to define pretensioned tendons with all their specific characteristics such and
debonded length, transmission length and hooks which will be considered within the static analysis and
the design code checks.
New Materials
Pretension strand materials with relevant properties have been introduced.

Slider groups
Sliders of different prisms can now be linked in user-defined groups to be used simultaneously for
adjusting the dimensions of various prisms in one go.
Custom Tree
The functionalities of the custom tree have been enhanced and now additionally supports crosssection and variations. The objects linked via the custom tree items can now be exported to a Tcl-file
and thus used as templates in other projects. Also, the structure of the custom tree itself can be
exported.
Automatic Tcl-Backup
New functionalities have been added to automatically save the project data to a Tcl-file on closing the
program or switching between projects.
Balanced Cantilever Data Export
The evaluated data (like forces and eccentricities) deriving from the task CANTLIVER can now be
displayed and also exported to MS Excel.
Export to MS Project
The construction schedule can now be exported to MS Project
ALLPLAN Share
The workflow when collaborating via ALLPLAN Share has been made improved. The ALLPLAN Civil
project will now be locked when accessed by a user and must be unlocked afterwards manually, thus
avoiding any data conflict caused by simultaneous access.

Design Code Checks
The existing methods and algorithms have been extensively enhanced and improved to include
numerous features required for the design and sectional assessments of pretensioned girders, also
including considerations with respect to the various national annexes of Eurocode (Standard, Austrian,
French, German, Polish, Spanish, and UK) and to AASHTO LRFD. Such features include accelerated
concrete hardening and steel relaxation due to heating, transmission/transfer and
anchorage/development lengths with respect to strands pull out and many more.
Automatic reinforcement (PythonParts)
The functionalities have been enhanced by a template associated with a pretensioned precast girder
allowing for parametric reinforcement bars automatically adjusting to changes in the concrete
structure.
Getting started example
The Getting Started example has been revised to provide a better, more realistic modeling.
The manual will be updated accordingly with the Hotfix 2025-0-2.

Allplan 2024-1-6, September 2024
Minor changes and fixes

Allplan 2024-1-5, August 2024
Minor changes and fixes

Allplan 2024-1-4, July 2024
Minor changes and fixes

Allplan 2024-1-3, June 2024
Minor changes and fixes

Allplan 2024-1-2, May 2024
Minor changes and fixes

Allplan 2024-1-0, April 2024
Minor changes and fixes

Allplan 2024-0-5, March 2024
Minor changes and fixes

Allplan 2024-0-4, February 2024
Minor changes and fixes

Allplan 2024-0-3, January 2024
Minor changes and fixes

Allplan 2024-0-2, December 2023
Minor changes and fixes

Allplan 2024-0-1, November 2023
Minor changes and fixes

Allplan 2024-0-0, October 2023
General
Due to the additional implementations, the user interface was enhanced and improved in various
areas.
Project Examples
The project library was enhanced by a couple of examples.
Import of Tcl script files
Now, it is also possible to execute Tcl files which are using scripts when importing
Import digital terrain model (DTM)
The import of digital terrain models directly in Allplan Bridge or from Bimplus was implemented. Not
only for visualization purposes, the terrain can also be used for modelling and checking clearances. For
example, it is possible to reference the substructure, like a pier or pile, relative to the terrain using a
terrain axis, which is automatically generated. This definition is as well parametric, that means that e.g.
when changing the girder height, the pier height is automatically adjusted. Currently, the following
formats are supported: Collada (*.dae), glTF (*.gltf, *.glb) and Wavefront Object (*.obj).
Import of super-elevation data via Allplan.Cloud
In Allplan Bridge it is now possible not only to import the geometry of the axis, but also the
corresponding definition(s) of cross-slope.
Accompanying polygonal axis
A new type of axis was introduced which allows modelling of longitudinal linear infrastructure objects,
like noise-barriers or Jersey-like concrete barriers.
Stakeout report
It is now possible to create a stakeout report using the reference points defined in a cross-section
which is assigned to a structural member.
Cross section
The functionality for defining a so-called external boundary (inserting another cross section in the
current one) was enhanced, so that it is now possible to insert the cross section at the intersection of
two parametric lines.
3D Modelling
A new type of body was introduced called the extracting body. This allows to extract a 3D body from
an arbitrary structural member such as girder, pier, link girder and plate and to use it in the same way
as a prism, i.e. to freely position it in space, to apply Boolean operations with other bodies (extraction
bodies or prisms), etc. Hereby, the connection between the original structural member and the
extracted body is kept and thus, the model remains completely parametrically.
The functionality of using templates was significantly enhanced. Thus, it is now possible to use and
combine an arbitrary number of 3D bodies (prisms and/or extraction bodies) in a single template
including the application of all types of Boolean operations (union, subtract, cut). In this way, complex,
detailed templates such as abutments can be created. These can be used multiple times in one project
and respectively positioned and parametrically adapted as well as be exported for later usage in other
projects.

Using another neu object type, the container, such templates of grouped bodies can be defined in a
relative coordinate system which allows to easily position and align them in the model.
Interoperability with Allplan - parametric reinforcement connection
The reinforcement sets defined in Allplan Bridge, primarily for reinforcement design and code
checking, are now parametrically connected with the PythonPart technology in Allplan. Not only is the
geometry of the longitudinal, shear and torsion reinforcement transferred to Allplan but also all other
information, like position of bars, number of bars and bar diameters.
Visualisation of the load definition
All load types (such as point loads, line loads, area loads, temperature loads and settlement, etc.) are
now graphically displayed in a detailed manner already during the input and thus can immediately be
checked at the time of definition.
Specialized loads for cantilever construction method
A new task CANTILEVER was developed which allows to emulate all loads occurring in one cycle of the
balanced cantilever construction. This includes applying/moving the traveler, pouring/assembling the
segment, applying the self-weight, pre-stressing the tendons and properly considering creep and
shrinkage during all the changing load applications. From the user’s side there is only required an
object-oriented input of the geometric data of the form traveler as well as the time schedule of the
particular construction steps. Based on that, all calculation actions are carried out automatically.
National Annexes
In addition to the national annexes for Germany (DIN EN), France (NF EN) and Spain (UNE EN), the
design and checks according to Eurocode are now also available for the UK (BS EN), Austria (ÖNORM
EN), and Poland (PN EN).
Allplan Bridge reporting tool
It is now possible to create user-defined reports for the results from the structural analysis. The basis
for this is an add-in developed for MS Word which allows the user to access the results from Allplan
Bridge (in the form of tables, images, 2D and 3D diagrams, and much more) while working in a freely
editable Word document. This inserted result data remains linked with the project data of Allplan
Bridge and can be actualized at any time in case of changes.
Summary report of design code checks
A new task DCESUMMARY was implemented for automatically creating a report with an overview of
the governing results from the design and code checking for all limit states.
Structural analysis of composite bridges (Technical preview)
The global structural analysis capabilities in Allplan Bridge were enhanced to correctly consider the
behaviour of composite structures.
In parallel, also the design module was enhanced with code assessment of composite concrete-toconcrete cross-sections.
Further new features and improvements
A number of further new features and improvements are available. For example, the interactive
insertion of docking points for 3D bodies, the enhanced functionalities of the measuring tool in the
cross section as well as in the 3D model (with reference to the terrain model), the enhanced output of

axis data, the implementation of a new function for evaluating the vertical distance between two
different profiles of an axis, and many more.

Allplan 2023-1-4, August 2023
Minor changes and fixes

Allplan 2023-1-3, July 2023
Minor changes and fixes

Allplan 2023-1-2, June 2023
Minor changes and fixes

Allplan 2023-1-1, May 2023
Minor changes and fixes

Allplan 2023-1-0, April 2023
Connection to LUSAS via Allplan Cloud.
More flexibility in static analysis of bridge models.
Users of Allplan Bridge 2023 will now be able to synchronize analytical models over the Allplan Cloud
(via Bimplus) with LUSAS finite element analysis software. In the first release of this connection, this
will support concrete box girder bridges, with or without pre-stressed tendons, with more bridge
types to be supported in the future. Via the Allplan Cloud, analytically relevant entities from Allplan
Bridge can be transferred to various structural analysis solutions for further processing. This provides
users with more flexibility to utilize external analysis software of their choosing.
New Verification Example.
Fully demonstrate Eurocode compliance.
The new verification example demonstrates and verifies the calculation methods used in Allplan
Bridge for reinforcement design and code-checking. For this a simply supported single-span
pedestrian bridge designed as a prestressed concrete girder with a single solid T-shaped section with
haunches is used. This example will help users to fully understand the inputs and the results provided.

Allplan 2023-0-7, March 2023
General
- The US length unit US Survey Feet is now available.
- Improved the starting of Allplan Bridge via Allplan for multiuser environments.

Allplan 2023-0-5, February 2023
Minor changes and fixes

Allplan 2023-0-4, January 2023
Minor changes and fixes

Allplan 2023-0-2, December 2022
Minor changes and fixes

Allplan 2023-0-1, November 2022
Minor changes and fixes

Allplan 2023-0-0, October 2022
General
Due to the additional implementations, the user interface was enhanced and improved in various
areas.
Calculation
A calculation method based on the dependencies of objects was implemented where only those parts
of the model are recalculated which are affected by the changes performed, which drastically reduces
the calculation time.
Partial import of TCL-files
Now, it is also possible to import TCL-files, which only contain certain parts of the project, into an
existing project and thus, add them to it. In this way, respectively prepared parts of an existing project
can be reused as “templates”.
Axes
All data of the plan and elevation of the axis can now be output in a clear report by means of an Excelfile.
Cross Section
A new tool for creating and assigning a variable at the same time is available via the context menu of
the parametric line.
Rectangular and circular cross sections can now be created directly.
3D-Modelling
The interactive modelling of the bridge model was enhanced by a new structural member of the type
body. Using this, prismatic bodies with an arbitrary cross section can be created between two spatial
points or at one spatial point via a certain length. After creating the bodies, they can additionally be
oriented in space using various tools like moving or rotating. Moreover, these bodies can be combined
using Boolean 3D-operations (see next point).
Boolean Operations
For structural members of the type body (prisms), various Boolean operations were implemented
such as unifying two bodies, subtracting one body from another or slicing a body by a plane.
Link Girder
The practicality of link girders was enhanced in a way that it is now possible to also connect a link
girder to another link girder.
Measure
The measuring tool for the 3D-model was enhanced, so that it is now possible to use all types of points
(such as reference points, docking points, grid points, station points, points of the cross section mesh
etc.) for measuring.

External tendons
External tendons, which already could be modelled, are now also considered in the static calculation.
Nonlinear temperature load
It is now possible to also define and calculate a nonlinear temperature gradient on the cross section.
Modal analysis
A new calculation task is available for changing the stiffness for certain structural elements within the
calculation of eigenmodes.
National Annexes
The design and checks according to Eurocode are now available according to the national annexes for
Germany (DIN EN), France (NF EN) and Spain (UNE EN).
Fatigue Check
A new task for the fatigue check according to Eurocode based on the damage accumulation method
was added to the list of check functions.
Reports
A new report giving an overview of all calculation assumptions is automatically created when
performing checks.
2D-Diagrams
All results of the static calculation can now be visualized by means of freely definable 2D-diagrams.
Data transfer to Allplan
When using custom trees, the assignment of particular structural members to respective drawing
files can now be managed.
Convert to MIDAS
The analysis model in Allplan Bridge can now be converted to a MIDAS-file (*.mct) via Bimplus.
Project Examples
The project library was enhanced by a couple of examples.

Allplan 2022-1-6, September 2022
Minor changes and fixes
Axes
The partial import of axis was added.

Allplan 2022-1-5, August 2022
Minor changes and fixes

Allplan 2022-1-4, July 2022
Minor changes and fixes

Allplan 2022-1-3, June 2022
Minor changes and fixes

Allplan 2022-1-2, May 2022
Minor changes and fixes

Allplan 2022-1-1, April 2022
Minor changes and fixes

Allplan 2022-1-0, April 2022
Minor changes and fixes

Allplan 2022-0-7, March 2022
Minor changes and fixes

Allplan 2022-0-6, February 2022
Minor changes and fixes

Allplan 2022-0-4, January 2022
License
Fixed license issue with perpetual desktop licenses, which caused that Allplan Bridge didn’t start
anymore. Time limited and network licenses are working properly.

Allplan 2022-0-3, December 2021
Bimplus
Transfer of bridge analysis model to Bimplus:
- Material assignment available by GUID of catalogue material if applicable.
- Pre-stress geometry (tendons) will be exported to Bimplus for viewing and further processing.
Axes
Stabilization of axis profile calculation (numerically critical situations caused by importing foreign axis
profile data are solved).

Allplan 2022-0-2, November 2021
Minor changes and fixes

Allplan 2022-0-1, October 2021
PythonParts
In Allplan, there is now available a library for bridge specific PyhtonParts which can directly be
accessed from within Allplan Bridge after copying them to the project library.

Allplan 2022-0-0, October 2021
General
Due to the additional implementations the user interface was enhanced and improved in various areas,
e.g.: edit function “Drag & Fill”, highlighting of the structural member selected in the navigation tree in
the 3D model, visualisation of PythonParts referenced from Allplan in the 3D model and many more.
Undo/Redo Function
A comprehensive undo/redo function comprising all menus was implemented, where also
intermediary recalculations are considered.
Axes
The Bloss spiral was added as a new axis element in the plan view.
A new type “accompanying axis” was implemented which is used to define a concurrent axis along a
main axis in a certain constant or variable distance in the plan view and in the profile.
3D Modelling
The interactive modelling of the bridge model was extensively enhanced with various functions:
Piers
The modelling of piers was comprehensively enhanced by numerous possibilities of definition. Thus,
now you can position piers directly relative to one or two axes or between an axis and a reference
point (e.g., pier between the terrain (axis 1) and superstructure (axis 2)).
Link girder

A new structural member of the type “link girder” was implemented which can be placed between two
3D points (reference points or station points on axes). This feature was especially developed for
modelling precast girders positioned on an existing substructure.
Plate
A new structural member of the type “plate” was implemented which can be used for Boolean
operations (see below). This feature was especially developed for modelling cast in situ slabs on
precast girders.
Templates
Structural members of the type “pier” or “link girder” can now be defined as templates and be placed
as often as wished as structural members in the 3D model by optionally adapting their geometry in
various ways.
Skew / Rotated cross sections
Structural members of the type “girder” and “plate” can be cut at a certain angle by means of a master
template at both ends. Further rotated cross sections can be defined within the structural member,
whereat the transitions between the rotated and unrotated cross sections are geometrically properly
modelled in space.
Booleans / Haunch
A Boolean operation “haunch” was implemented which can be used for cutting haunches defined as
boundaries in structural members of the type “girder” or “link girder” (e.g. precast girders) with
structural members of the type “plate” (e.g. cast in situ slab) when their positions/geometry change in
space (“union”).
Copy / Multiple Copy
All newly implemented structural members can interactively be copied. For link girders and piers there
also exists a tool for multiply copying the same member to different positions.
Measure
A tool for measuring certain distances between two 3D points (reference points) of the model was
implemented.
Stationing – global / local / relative / local-end
The possibility of defining local and global stations was consistently implemented for all structural
members. Thus, now for example it is also possible to define piers by a global stationing (absolute
heights). Moreover, there are new definition types available, such as a relative stationing related to the
length of the member which allows for automatically adapting the pier length when its reference
points at top and bottom change.
Variations / Tables
Now it is also possible to define the transition between two defined values via cubic splines.
Custom Trees
All items of the menu “Structural Members” can now freely be organized and arranged using
customizable project navigation trees.
IFC 4.3

The standard IFC 4.3 which was enhanced regarding infrastructure and bridges is now available with
its new specifications for bridge types (IfcBridge) and bride parts (IfcBridgePart) for various
attributions of the bridge model.
TCL-Syntax Highlighting
The syntax-highlighting for TCL project files for Notepad++ was implemented and can be applied in the
editor via the program interface.
Code-Based Design according to Eurocode
The check for brittle failure according to chapter 6.1 (109) was implemented as well as the
consideration of the detailing rules for reinforcement according to 8.2, 8.10.1.3 and 9. The tasks for the
checks ULSCHECK and SLSCHECK were unified into a single task CODECHECK.
Code-Based Design according to AASHTO LRFD 9
The complete code-based design according to the American standard AASHTO LRFD 9 in the
strength, service and fatigue limit state was implemented. This includes flexure, brittle failure, shear,
torsion, interaction, fatigue, stress limitation, crack control and reinforcement detailing rules. Further,
all results are output in respective reports. As a basis for the code-based design the respective types
of combinations are now also available in the combination table.
User Interface
The user interface is now also available in Spanish and Romanian.

Allplan 2021-1-9, August 2021
Minor changes and fixes

Allplan 2021-1-7, July 2021
Minor changes and fixes

Allplan 2021-1-5, June 2021
Minor changes and fixes

Allplan 2021-1-4, June 2021
Minor changes and fixes

Allplan 2021-1-2, May 2021
PythonParts
The import or update of the bridge model in Allplan failed, if a PythonPart was used in several structural
members.
Tendons
In some cases, the constraints α-u and α-v for tendon points were swapped when both were given.
Beam elements
Occasionally, in the analytical model beam elements of piers with a non-vertical beam axis were
additionally rotated.
Other minor changes and fixes

Allplan 2021-1-1, May 2021
Minor changes and fixes

Allplan 2021-1, April 2021
General
Due to the additional implementations the user interface was enhanced in the task cross section.
Cross section -> Placements
The functionalities of Placements (formerly Smart Placements) were extensively enhanced.
In addition to objects of type Smart Symbol (*.nmk) now also PyhtonParts (*.pyp) can be used as
placements. Moreover, now there is the possibility to define the alignment of the objects in advance in
Allplan Bridge. Further, the parameters of the PythonPart objects can directly be edited in Allplan
Bridge and optionally be defined by variables.
Several small corrections and improvements in various areas

Allplan 2021-0-6, February 2021
Minor changes and fixes

Allplan 2021-0-5, February 2021
Minor changes and fixes

Allplan 2021-0-4, January 2021
Minor changes and fixes

Allplan 2021-0-3, December 2020
Minor changes and fixes

Allplan 2021-0-1, November 2020
Minor changes and fixes

Allplan 2021-0-0, October 2020
General
Due to the additional implementations the user interface was enhanced and improved in various areas.
3D Modelling
A new tab in the action bar with various tools for the interactive modelling of the geometric and static
model was added. For a quick access, this bar comprises the tools for creating the 3D model, which are
originally called up by the various menus in the project navigation tree. The functionalities of some of
these tools were enhanced. Further, additional tools were added, such as inserting/moving a series of
stations and the interactive view of the cross sections along a structural member.
Tendons
It is now possible to input an eccentricity in longitudinal direction when defining tendon points.
The output of a report for tendons was implemented. This comprises the tendon geometry by means
of eccentricities to arbitrary user-defined reference points, as well as the forces and elongations of
the tendons due to the defined tendon stressing.
Dynamic Earthquake Calculation
The dynamic earthquake calculation based on the multi-mode response spectrum method was
implemented. To evaluate the effects of a seismic loading, response spectra can be defined,
eigenmodes can be calculated and finally, the response spectra can be evaluated.
Calculation of Eigenvalues
The calculation of eigenvalues for evaluating the natural frequencies and eigenmodes for the dynamic
earthquake calculation was implemented.
Evaluation of Response Spectrum
The evaluation of the response spectrum based on the calculated eigenmodes was implemented.
Combination Table
A clear tabular input for defining the load combinations was implemented. In this table load cases and
envelopes can be superposed with their favourable and unfavourable factors and the respective
superposition rules in various load combinations, which finally can be used for performing the design
code checks.
Code-based design
The design code checks for ULS and SLS were enhanced and completed. This includes the design and
checks due to shear, torsion, and interaction, as well as the design and checks for crack width
limitation and the stress checks.
Camber calculation
The required pre-camber of the structure for all calculated construction phases can now be calculated
and output in an Excel sheet.
Material and time-dependent effects
The material and time-dependent effects (creep, shrinkage, relaxation) are now also available for the
American, Chinese, and Korean standard.

Allplan 2020-1-6, September 2020
Minor changes and fixes

Allplan 2020-1-5, August 2020
Minor changes and fixes

Allplan 2020-1-4, July 2020
Structural Members
It is now possible to correctly copy station tables of structural members (e.g. main girder) from an
Excel-table also when using imperial units.

Allplan 2020-1-3, June 2020
Improvements and Fixes
The stability of the menu Superposition was improved: In certain cases, the product was not able to
open the superposition view.
The compatibility for the cross-section calculation was extended: Cross-section properties for certain
cross-sections created in the version 2019 and imported in the version 2020 were not able to be
calculated.
The data transfer between Allplan Bridge and Allplan Engineering for tendons created by 3D tangents
intersection points was improved.
Further smaller improvements

Allplan 2020-1-1, May 2020
Languages
Completion of Russian and Chinese language support for GUI, F1-Help and Documentation.

Allplan 2020-1-0, April 2020
General
Due to the additional implementations the user interface was enhanced.
Traffic Loads
A new task area for interactively and graphically defining traffic lanes based on the user-defined
structure / cross-section (in 2D or 3D) was provided. Further, you can automatically create the lanes
according to standard.
A new task area for defining load trains and for loading predefined load trains according to standard
was provided.
A new tab was added in the menu Superpositions for performing an interactive, schematic evaluation
and superposition of traffic loads (of the defined load trains and lanes).
A new calculation option for automatically calculating the influence lines of defined traffic load
superpositions was added.
Design Code Checks
A new task area for performing various design code checks was provided including the following
tasks:
ULSDESIGN: Perform the reinforcement design for the ULS for bending + normal force
ULSCHECK: Perform the check in the ULS for bending + normal force
LINSTRESS: Perform a linear normal stress check in the SLS
Respective new tasks for creating design reports (incl. graphical illustrations) in MS-Word format for
each of the mentioned checks above are provided (i.e., DESIGNREPORT, CHECKREPORT,
LINSTRESSREPORT).
Construction
A new task REMOVAL was implemented for deactivating temporary structural elements (such as
auxiliary supports), which automatically calculates the redistribution of forces on the remaining static
system.
A new task LOADREF was implemented for considering moving loads during the construction (e.g.
form traveller) by referencing existing load cases without having to define them again.
Results
New tabs and task areas were added for displaying the results of influence lines and design code
checks.
A new tab was added to graphically display the load definitions of defined load cases (load
visualisation).
Material
A dialogue for selectively importing material from the Bimplus database was provided.
Cross sections
A new tool for drawing a parametric line parallel between two other lines with its position defined by a
relative factor was implemented.

Tendons
A new method for defining tendons by tangent intersection points plus radius was developed.

Analysis
The calculation of creep, shrinkage, and relaxation according to AASHTO LRFD was implemented.
View Options
Within the view of the 3D-model additional options are available for displaying only certain parts of the
structure which can interactively be defined by the user by using the “isolation box” or the “hide
objects” functionalities.
Bimplus
The analysis model can now be uploaded to Bimplus to exchange it with other connected applications.
Examples
The example Getting Started and the corresponding document was revised and enhanced regarding
the new functionalities.
Languages
General Availability of Russian and Chinese GUI language. Partially support of F1-Help and
Documentation.

Allplan 2020-0-0, October 2019
General
Due to the additional implementations the user interface was enhanced.
Material
The connection to a material catalogue via Bimplus was established. There are several different types
of material according to Eurocode at hand, such as concrete, reinforcement steel, pre-stressing steel
etc. including all parameters required for static analysis.
Tendons
In Allplan Engineering you can now create drawings of tendons (developed view) from the tendons
defined in the model in Allplan Bridge.
Remark: The assignment of the tendons (geometrically freely defined in space) to the beam elements
for the static calculation is automatically done in consideration of the respective eccentricities.
New calculation option „Create analysis model”
The automatic generation of the analysis model from the geometrical model was implemented. This
includes calculating the cross sections, creating the beam elements, assigning materials etc. By a
further calculation option “Auto-Numbering” an automatic numbering of all generated beam elements
and tendons is performed.
New calculation option “Autogenerate calculation tasks”
All calculation actions required for the static calculation are generated fully automatically from the
defined tasks of the construction phases (i.e., activation of elements, load cases such as self-weight,
prestress and creep and shrinkage).
New calculation option „Structural analysis”
A global static analysis based on the Bernoulli beam theory is performed for all automatically and
manually generated calculation tasks defined previously in the construction phases. The analysis is
enhanced to accurately consider the cross-section variation. Furthermore, the nonlinear calculation of
time dependent effects is performed, considering design code formulas (Eurocode).
Construction
The calculation task LOADCASE with assigned load types was implemented to define all kinds of
additional loads (such as temperature, wind etc.).
Additional calculation tasks for the manual input of the calculation actions were added.
Cross sections (Superimposed dead load)
A new structural unit of type load was implemented to automatically retrieve the weight and the
position of superimposed dead loads (such as roadway, curbs etc.) from the geometrical definitions of
the cross section.
Superpositions
In the navigation window a new submenu in the menu Analysis was added for performing an
interactive, schematic superposition of load cases in envelopes.
Results
A new main menu was added to the navigation tree as well as a new tab in the action bar for the
graphical and tabular display of load case results.

Examples
The example Getting Started and the corresponding document was revised and enhanced regarding
the new functionalities.

Allplan 2019-1, April 2019: latest Update Allplan 2019-1-0
General
Due to the additional implementations the user interface was enhanced and reorganised.
Cross section
The tool 'external boundaries' was added. When you define cross sections, this tool allows you to
include arbitrary boundaries of other already defined cross sections and to copy and arrange them in
an easy manner. One practical example would be the modelling of longitudinal stiffeners in steel cross
sections along the inner perimeter.
In the Property window a new option for assigning a thickness to a boundary for an easier definition of
thin-walled cross sections was added.
A new option 'Auto extrusion' for boundaries for an automatic intersection with other boundaries was
added.
Two additional drawing tools for parametric lines were added: 'Parallel line by direction' (the distance
can be measured in an arbitrary direction (e.g., vertically), 'Line by relative angle' (angle relative to an
arbitrary line).
When drawing parametric lines by angle you can now input the angle also in percent (e.g., for defining
the crossfall of the cross section).
A new variable of the type 'Angle in percent' was added, so that you can now define the table to be
assigned also in percent.
Constructions
A new task for defining the construction phases was added. This allows you to define and graphically
simulate the construction phases of the bridge including all detailed work steps / tasks and present
them in a Gantt chart (bar chart of the construction). When exporting the geometrical model to
ALLPLAN the information of the defined construction phases is considered by means of separate 3D
solids.
Materials
A new menu 'Materials' was added to the Project Navigation where you can define standards,
materials, and material values. A connection to a database is scheduled for the version 2020-0,
autumn 2019.
Structural members
An option for copying piers was added.
Bimplus
You can now import axis in LandXML format in Bimplus. These axes you can import in Allplan Bridge.
View options
In the View window of the 3D model you can now set numerous options for drawing the particular
objects via the Property window.
Layer
The functionalities of Layers were enhanced by further object types of the cross section.

Examples
Three new examples were added to the program library: Reinforced plate with two circular voids,
Wildlife crossing, Steel-concrete composite bridge with stiffeners
Analysis: Cross sections (Technical preview)
Calculation of the cross-section properties of the cross sections defined in the project and graphical
presentation of the shear stress distribution of the cross section and in arbitrary cuts of the cross
section.

Allplan 2019-0, October 2018: latest Update/Hotfix Allplan 2019-0-5
Tendons
The modelling of parametric tendons was implemented.
The definition of tendon stressing and the calculation of the prestressing losses were implemented.
Cross section
The parametric modelling was extended from Allplan Bridge to Allplan by the 'Smart placements',
which you can use to reference objects of the project library in Allplan.
You can now copy cross sections.
You can now import and export cross sections.
A new tool for measuring distances between parametric lines and points was added.
A new tool for defining point grids was added, which you can use to easily define the positions of the
tendons within the cross section.
Layer
The functionalities of Layers were implemented for parametric lines in the cross-section definition
Variations
You can now copy tables and formulas.
Axis / Variations / Variables
A calculation function for automatically evaluating the distance between two axes was implemented.
With this you can e.g., automatically consider a variable cross section width by defining a secondary
axis.

Allplan 2018-1, April 2018: latest Update/Hotfix Allplan 2018-1-5
General
First version featuring the complete modelling of the parametric bridge model
Axes
Creating parametric axes in 3D (by defining plan and elevation)
Cross sections
Constructing parametric cross sections with user-defined variables and arbitrary geometry
Structural members
Setting up a parametric 3D model created by combining axes and cross sections
Variations
Definition of the variation of cross section dimensions by tables and formulas
ALLPLAN
Full-featured data import in Allplan


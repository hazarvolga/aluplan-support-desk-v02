# Allplan Share 2022 Manual

**Kategori:** Allplan Share
**Kaynak:** `Allplan_Share_2022_Manual-f9zq6tj01ji.pdf`

---

**Toplam Sayfa:** 52


## Sayfa 1

ALLPLAN SHARE
MANUAL

ALLPLAN 2022
Manual
Allplan Share

This documentation has been produced with the utmost care.
ALLPLAN GmbH and the program authors have no liability to the purchaser
or any other entity, with respect to any liability, loss, or damage caused,
directly or indirectly by this software and its documentation, including but
not limited to, any interruptions of service, loss of business, anticipatory
profits, or consequential damages resulting from the use or operation of this
software and its documentation. In the event of discrepancies between the
descriptions and the program, the menu and program lines displayed by the
program take precedence.
Information in this documentation is subject to change without notice. Com-
panies, names, and data used in examples are fictitious unless otherwise
noted. No part of this documentation may be reproduced or transmitted in
any form or by means, electronic or mechanical, for any purpose, without the
express written permission of ALLPLAN GmbH.
Allfa® is a registered trademark of ALLPLAN GmbH, Munich.
Allplan® is a registered trademark of the Nemetschek Group, Munich.
Adobe® , Acrobat®, and Acrobat Reader® are trademarks or registered
trademarks of Adobe Systems Incorporated.
AutoCAD®, DXF™, and 3D Studio MAX® are trademarks or registered tra-
demarks of Autodesk Inc., San Rafael, CA.
BAMTEC® is a registered trademark of Häussler, Kempten, Germany.
Datalogic and the Datalogic logo are registered trademarks of Datalogic
S.p.A. in many countries, including the United States and Europe. All rights
reserved.
Microsoft® and Windows® are either trademarks or registered trademarks
of Microsoft Corporation.
MicroStation® is a registered trademark of Bentley Systems, Inc.
Parts of this product were developed using LEADTOOLS, (c) LEAD Techno-
logies, Inc. All rights reserved.
Parts of this product were developed using the Xerces library of "The
Apache Software Foundation".
fyiReporting Software LLC developed parts of this product using the fyiRe-
porting library, which is released for use with the Apache Software license,
version 2.
Allplan update packages are created using 7-Zip, (c) Igor Pavlov.
Cineware, render engine, and parts of the user documentation; copyright
2020 MAXON Computer GmbH. All rights reserved.
All other (registered) trademarks are the property of their respective ow-
ners.
© ALLPLAN GmbH, Munich. All rights reserved.
1. Auflage, März 2022
Document no. 220deu01m07-1-PSDM0322

Allplan Share Contents i
Contents
Welcome .............................................................................................. 1
General information ....................................................................... 3
What is Allplan Share? .............................................................................................. 3
How Allplan Share and Allplan Bimplus interact ........................................ 4
Working together on an Allplan Share project .......................................... 6
Data storage in an Allplan Share project ................................................................ 6
Syncing the local file storage to Bimplus cloud storage ............................... 7
User rights in Allplan Share .................................................................................... 8
Roles and rights at team level ..................................................................................... 8
Roles and rights at project level.................................................................................. 9
Requirements for Allplan Share ....................................................................... 10
Hardware requirements and software requirements ................................10
Further requirements ...................................................................................................... 11
Setting up Allplan Share ............................................................. 13
Bimplus account and Bimplus team ............................................................... 13
Create Bimplus account ................................................................................................ 13
Creating a Bimplus team ............................................................................................... 13
Licensing Allplan Share .......................................................................................... 15
Purchasing licenses .......................................................................................................... 15
Assigning licenses to users ......................................................................................... 15
Licensing for students and teachers .....................................................................18

i i Contents Allplan 2022
Working with Allplan Share projects ................................... 21
Creating Allplan Share projects ........................................................................ 21
Creating new Allplan Share projects in new Bimplus projects .............. 22
Integrating new Allplan Share projects into existing
Bimplus projects................................................................................................................ 24
Convert existing Allplan projects to Allplan Share projects ................... 27
Inviting members to an Allplan Share project ......................................... 30
Working on Allplan Share projects in Allplan ............................................ 32
Open Allplan Share projects ....................................................................................... 32
Close Allplan Share projects ...................................................................................... 33
Manage lock information for Allplan Share projects ........................... 34
Uploading the BIM model From the Allplan Share project
to Bimplus ..................................................................................................................... 35
Copying or moving Allplan Share projects off Bimplus cloud
storage ........................................................................................................................... 37
Backing up and restoring Allplan Share project data .......................... 38
Backing up Allplan Share projects ..........................................................................38
Restoring project data from a backup ................................................................. 39
Delete Allplan Share projects ............................................................................ 42
FAQs ................................................................................................... 43

Allplan Share Welcome 1
Welcome
This guide gives you a detailed overview of the various
options offered by using Allplan Share.
In the following chapters, you will learn how to set up All-
plan Share, purchase and assign licenses, and use Allplan
to work on an Allplan Share project.
In the last chapter, you will find a short and concise sum-
mary of Q&As about Allplan Share.
Have fun with Allplan Share! We wish you every success!

2 What is Allplan Share? Allplan 2022

Allplan Share General information 3
General information
What is Allplan Share?
By means of the Allplan Share option, you can use cloud computing
to edit native Allplan project data. You save and manage the Allplan
project data on the openBIM platform Allplan Bimplus, which is hos-
ted by ALLPLAN GmbH.
By combining Allplan and Allplan Share, you can directly collaborate
with planning partners all over the world on one and the same Allplan
project. Allplan Share not only reduces your administrative costs and
staff costs but also helps you avoid extra costs. You do not need to
buy, install, or maintain a local server because Allplan Bimplus uses
cloud storage to save the data.

4 How Allplan Share and Allplan Bimplus interact Allplan 2022
In addition, the BIMPLUS web portal, which is based on the open-
BIM platform Allplan Bimplus, provides additional functionality, such
as the issue management tool named Issue Manager, document
management, and much more. When you use Allplan Bimplus to
maintain your Allplan specialist model, BIM Explorer as a model vie-
wer gives you a clear impression of your Allplan specialist model or
the complete coordination model of the construction project anytime
and anywhere.
How Allplan Share and Allplan Bimplus
interact
With Allplan Share, you can use the openBIM platform Allplan
Bimplus only for cloud storage of native Allplan project data and for
collaboration on projects across locations.
However, if you want to take it one step further, you can integrate
your Allplan Share projects directly in the BIM-compliant planning
process by including the specialist models created in Allplan Share in
the BIM coordination model of the construction project. Thus, all
planning partners involved in the construction project gain insight
into your planning status, regardless of their planning tools. The spe-
cialist model integrated in the coordination model and the Allplan
Share project can be automatically synced afterward.
Note: You can find more information about BIM-compliant planning in
the Bimplus User Manual.

Allplan Share General information 5
Allplan Share is closely linked with Allplan Bimplus:
• Bimplus uses cloud storage to save the native Allplan data.
• Bimplus manages the users for Allplan Share projects.
• Each Allplan Share project is linked with exactly one Allplan
Bimplus project. When you create an Allplan Share project, you
can either create this Bimplus project as a new project or select it
from existing Bimplus projects that do not contain Allplan Share
data yet.
• Considering network performance, the native Allplan data in an
Allplan Share project does not automatically create a specialist
model in Bimplus. However, you can upload the model data of the
Allplan Share project directly to Bimplus at any time.
• When you include a specialist model for the Allplan Share project
in the BIM coordination model of the Allplan Bimplus project, you
can transfer the Allplan model data manually or automatically and
sync the Allplan Bimplus project.
- Manual: Click Upload Model to Bimplus.
- Automatic: Select the Auto-sync to Bimplus model option in
the Upload Model to Bimplus dialog box.
Note: This does not sync the native Allplan data (for example,
drawing files, layouts) but the Allplan specialist model in the
Bimplus project.


## Sayfa 11

6 Working together on an Allplan Share project Allplan 2022
Working together on an Allplan Share
project
Several users can work on the same Allplan Share project at the
same time. This is just like working on an “ordinary” Allplan project.
Drawing files, layouts, and filesets that have been opened by a user
are locked and cannot be edited by any other user at the same time.
However, locked drawing files can be opened in reference mode by
other users.
To manage lock information manually, a function is available in the
Services application that allows the Allplan administrator to view the
lock information for each project and delete it manually if necessary
(see "Manage lock information for Allplan Share projects" on page
34). This ensures that documents do not remain unnecessarily lo-
cked just because an internet connection does not work properly.
You can also manage locking information by selecting this tool on the
shortcut menu of a project in the New Project, Open Project dialog
box.
Data storage in an Allplan Share project
When working with Allplan Share projects, the original data of the
project in the Bimplus cloud is not accessed directly; instead, a local
copy of the data to be edited is used. This local copy is located in the
Windows folder Documents of the respective user in the subfolder
...\Nemetschek\Share (under Windows 10 usually
C:\Users\username\Documents\Nemetschek\Share).

Allplan Share General information 7
The first time you open an Allplan Share project, all rudimentary pro-
ject data (except drawing files, filesets, and layouts) will be copied
from Bimplus cloud storage to the local folder. As soon as you open a
drawing file, layout, or fileset in an Allplan Share project, this
document will be copied from Bimplus cloud to the local file storage
folder and opened from there.
The following subsection “Syncing the local file storage to Bimplus
cloud storage" (on page 7) explains when the locally processed data
is written back to the original project data in the Bimplus Cloud.
Syncing the local file storage to Bimplus cloud storage
Changed drawing files and layouts will automatically be copied to
Bimplus cloud storage when you ...
• close a drawing file or open it in reference mode.
• close a project.
• switch to layout editor.
• open ProjectPilot.
• select Save to upload changed drawing files or layouts.
• change Allplan resources. These resources will be copied from the
local file storage folder to Bimplus cloud storage as soon as you
close a project. Other users will not see these changes until they
close and reopen the project.

8 User rights in Allplan Share Allplan 2022
User rights in Allplan Share
User rights for Allplan Share are assigned on 2 levels:
• The first level relates to rights at team level. Here, the Allplan
Share licenses and members of the entire team are managed, as
well as their access rights to the general project management.
These rights are assigned by the team owner and team administ-
rators via the Allplan Shop.
• The second level relates to rights at project level. The project
members and their access rights within the individual Allplan
Share projects are managed here. These rights are assigned by
the project administrators authorized for the respective project
via the BIMPLUS web portal.
Roles and rights at team level
The following roles are available at team level:
• Team owner: Rights such as "Team Administrator", additionally
purchase Allplan Share licenses / role cannot be changed.
• Team administrator: Invite and remove team members / deter-
mine and delete other team administrators / manage licenses u-
sage permissions / create and delete projects / determine and
delete project administrators / project administrator in each
Bimplus project.
• Team member: no rights at team level; can be assigned any role
at project level.
Team administrators and team members are managed in the Allplan
Shop (see "Assigning licenses to users" on page 15).

Allplan Share General information 9
Roles and rights at project level
The following roles are available at project level:
• Project administrator: same rights as a project editor; plus: dele-
ting models; deleting documents; inviting and removing members;
assigning member roles at project level; assigning a property set
template
• Project editor: same rights as a project viewer, plus: creating,
uploading, and downloading models; creating revisions; uploading
documents; creating, editing, and deleting issues; editing project
properties; checking for clashes
• Project viewer: viewing models, documents, and issues; down-
loading documents
The roles and therefore the rights of the project members are mana-
ged in the BIMPLUS web portal via the project members item.
Memberships and access rights are limited to the currently selected
project.
Notes:
• If you have copied an existing Allplan project to Bimplus cloud
storage as an Allplan Share project, you will have to redefine the
designated project members and their access rights.
• You must assign user rights for print sets and privilege sets again
in Allplan.

1 0 Requirements for Allplan Share Allplan 2022
Requirements for Allplan Share
Hardware requirements and software requirements
Network
• An internet connection that is stable and uninterrupted.
- Minimum requirements: 10 Mbps for upload; 20 Mbps for
download; the latency must be less than 50 milliseconds (you
can check this by means of Allplan Diagnostics, for example).
- Recommended: 50 Mbps for upload; 100 Mbps for download;
the latency must be less than 10 milliseconds (you can check
this by means of Allplan Diagnostics, for example).
• Current network drivers
• Network connections based on LAN (better than WLAN)
Local file storage folder
• If possible, use a local (SSD) hard drive for the local file storage
folder; network drives slow down access. The local file storage
folder must not be shared between several users; this might cau-
se massive problems. The Services window shows the path of
the local file storage folder.
• You can find information about how to change the path of the
local file storage folder in an FAQ on Allplan Connect; for example,
enter the following search term: “local file storage folder Allplan
Share”.
Hardware
• The hardware requirements are the same as those for Allplan.

Allplan Share General information 11
Further requirements
• You are registered with Allplan web services either via Allplan
Connect or via Allplan Campus (see "Create Bimplus account" on
page 13).
• A Bimplus team is set up (see "Creating a Bimplus team" on page
13).
• If you want to create Allplan Share projects, you are a Bimplus
team owner or team administrator (see "User rights in Allplan
Share" on page 8).
• You have one or more Allplan Share licenses (see "Purchasing
licenses" on page 15).

1 2 Requirements for Allplan Share Allplan 2022

Allplan Share Setting up Allplan Share 13
Setting up Allplan Share
Bimplus account and Bimplus team
Create Bimplus account
If you are already registered for Allplan web services via Allplan
Connect or Allplan Campus, you do not need to do anything else. In
this case, you are automatically a registered Bimplus user. To sign in
to Bimplus, you can use the same details as for signing in to Allplan
Connect or Allplan Campus.
If you do not yet have an Allplan account, please register first via
Allplan Connect or Allplan Campus.
Creating a Bimplus team
Create a Bimplus team in Allplan Connect or Allplan Campus.

1 4 Bimplus account and Bimplus team Allplan 2022
Please note the following when creating a Bimplus team:
• Each registered email address with Allplan Connect or Allplan
Campus can open exactly one Bimplus team. We recommend
that you use a generic email address (for example, info@com-
pany.com) instead of a personal email address of an employee
because the email address cannot be changed anymore.
• The person behind the email address automatically becomes the
team owner. This role cannot be transferred or changed later.
• The team name is automatically the company name behind the
email address in Allplan Connect. The team owner can change the
Bimplus team name at any time.
• When you - as a project editor - are invited to join an Allplan
Share project, you do not need your own Bimplus team.

Allplan Share Setting up Allplan Share 15
Licensing Allplan Share
Note: If you are a student or a teacher, go to “Licensing for students
and teachers" (on page 18).
Allplan Share licenses can be subscribed exclusively by team owners
for their Bimplus team. The term can be selected after consultation
with a sales representative.
For each Allplan Share license, theBimplus team gets 100 GB of me-
mory on the openBIM platform Allplan Bimplus. If you need more
memory, subscribe to additional licenses.
The team owner or a team administrator assigns the licenses to the
team members or external project participants. Authorized users can
then work on all projects within the Bimplus team for which they are
given the appropriate status (at least project editor).
Purchasing licenses
The Allplan Share option is already included in some Allplan packa-
ges. Should this not apply to you, you can purchase Allplan Share
licenses exclusively as a team owner.
Please contact your Allplan sales partner for this: They will create a
Bimplus team for you. The team created gets the licenses purchased.
Assigning licenses to users
Each project member who is to work on an Allplan Share project
must have an Allplan Share license. This can be the project member’s
own license or a team license assigned to this project member.
As team owner or team administrator, you manage the Allplan Share
licenses available for the Bimplus team in the Allplan Shop, which you
can access either via the BIMPLUS web portal or directly.


## Sayfa 21

1 6 Licensing Allplan Share Allplan 2022
To assign an Allplan Share license to a team member
 You are the owner or an administrator of the Bimplus team.
1 Sign in to the BIMPLUS web portal and click Team mem-
bers on the navigation menu.
Tip: If the navigation menu is This opens the Allplan Shop; you can see the Subscriptions &
not visible, click Show users section.
navigation menu on the
Or:
title bar of the BIMPLUS
Open the Allplan Shop directly and click Subscriptions & users
web portal.
on the User menu.
The Subscriptions & users section opens.

Allplan Share Setting up Allplan Share 17
2 Only if you are the owner or administrator of several Bimplus
teams:
Use the list box under List of available teams to select the team
whose rights of use you want to manage for Allplan Share.
3 The Bimplus Team Management tab lists all members of the
current Bimplus team and all employees of your company who
are registered with Allplan Connect.
If the list does not include the required person, click Invite user to
Bimplus team.
Important: Do not assign the role of team administrator to a new
team member unless this is absolutely necessary because this
role has more rights than the role of project administrator. You
can create project administrators in the user management of the
Bimplus project.
You can find the new member in the member list of the team as
soon as this person has accepted the invitation.
4 Under Subscriptions, select the Allplan Share tab.

1 8 Licensing Allplan Share Allplan 2022
5 Assign Allplan Share licenses to the required team members.
To do this, select the check box in the Ass. column for the
respective team member. . Clear the check box to remove a li-
cense assigned.
Licensing for students and teachers
Each student or teacher whose Allplan student license is registered
and verified can get a free license for Allplan Share. The Allplan Share
license will be assigned automatically.
Note: The available memory is 2 GB for student licenses.
To get a license for Allplan Share Student
1 Sign in to Allplan Campus.
2 Click Get options.

Allplan Share Setting up Allplan Share 19
3 Read the information on the Options page and make sure that
you meet the requirements mentioned.
Tip: For more information on 4 Click Go to Allplan Shop.
the Allplan Shop, click All-
plan Share: Guided Tour
below the button.
5 Click the Allplan logo in the upper-left area of the Allplan Shop to
go to the home page.
6 Click Education. Go to Allplan Share Student and click More in-
formation.
7 Follow the instructions.

2 0 Licensing Allplan Share Allplan 2022

Allplan Share Working with Allplan Share projects 21
Working with Allplan
Share projects
Creating Allplan Share projects
You have three options for creating an Allplan Share project:
• You create a new Allplan project from the outset as a pure Allplan
Share project. The automatically generated Bimplus project does
not contain any other data besides the Allplan Share project, but
is used exclusively for administration purposes (including project
members and their access rights).
• You create a new Allplan project as an Allplan Share project in an
existing Bimplus project. In addition to the Allplan Share project,
the planning data of other planning partners involved in the
construction project are usually also available in the Bimplus pro-
ject.
• You copy an existing Allplan project from your local workstation
or from a workgroup to the Bimplus cloud. You can choose whe-
ther you want to create a new Bimplus project for the Allplan
Share project or integrate it into an existing Bimplus project.
Important! Since each Bimplus project can generally contain only one
Allplan Share project, it must not contain any other Allplan Share
project when using an existing Bimplus project.
You can recognize this by the icon in the New Project, Open Project
dialog box:
= Bimplus project without Allplan Share project
= Bimplus project with Allplan Share project

2 2 Creating Allplan Share projects Allplan 2022
Creating new Allplan Share projects in new Bimplus projects
You can create new Allplan projects as an Allplan Share project
directly in the Bimplus cloud storage. To do this, select BIMPLUS
when you create the project and you are prompted to specify
where to save the project.
The Bimplus project required for managing the Allplan Share project
in the Bimplus cloud is automatically created with the same project
name. The Allplan Share project is then already assigned to this
Bimplus project.
To Create a new Allplan Share project
 You are the owner or administrator of the Bimplus team.
1 Start Allplan and make sure that you are logged in to Allplan web
services.
2 Click New Project, Open Project.
3 Select New Project, Open Project in the left column of the dialog
box, open the Local or Workgroup Server project data
path, and then click New Project.

Allplan Share Working with Allplan Share projects 23
4 In the New Project - Specify Project Name dialog box, enter the
name of the new Allplan Share project in Project name.
The same project name is also used for the newly created
Bimplus project.
5 For location, select Bimplus.
6 Only if you are the owner or administrator of several Bimplus
teams:
Use the Team list box to select the Bimplus team that is going to
edit the Allplan Share project.
7 Under Bimplus model name, enter the same name for the Allplan
model under which it is to be entered in the Bimplus project
management.
8 Click Next.
The Bimplus project is created and the connection between
Allplan and this Bimplus project is established.

2 4 Creating Allplan Share projects Allplan 2022
9 Click Finish in the New Project – Additional Project Settings
dialog box.
The Allplan Share project is created in the newly created Bimplus
project.
10 You can now go directly to the Bimplus project management, e.g.
to invite other members to the project (see "Inviting members to
an Allplan Share project" on page 30).
Integrating new Allplan Share projects into existing Bimplus projects
New Allplan Share projects can also be integrated directly into exis-
ting Bimplus projects. In this case, the Allplan Share project automati-
cally takes on the project name of the Bimplus project.
The prerequisite is that the intended Bimplus project does not yet
contain another Allplan Share project.
To create an new Allplan Share project in an existing
Bimplus project
 You are the owner or administrator of the Bimplus team.
1 Start Allplan and make sure that you are logged in to Allplan web
services.
2 Click New Project, Open Project.

Allplan Share Working with Allplan Share projects 25
3 In the left column of the New Project, Open Project dialog box,
select the Share project data path.
4 Only if you are the owner or administrator of several Bimplus
teams:
In the Team column, select the Bimplus team that will work on the
Allplan Share project.
5 In the Project name column, click the Bimplus project in which
you want to create the Allplan Share project, and then click OK.
Or:
In the Project name column, click the Bimplus project in which
you want to create the Allplan Share project, and then click
New Project.
Or:
Click New Project in the shortcut menu of the Bimplus project.
Important! In any case, please make sure that you select a
Bimplus project that does not contain another Allplan Share pro-
ject yet (icon: = Bimplus project without Allplan Share project).


## Sayfa 31

2 6 Creating Allplan Share projects Allplan 2022
6 In the New Project - Specify Project Name dialog box, the pro-
ject name, location and Bimplus team are predefined.
Under Bimplus model name, enter the same name for the Allplan
model under which it is to be entered in the Bimplus project ma-
nagement.
7 Click Next.
Allplan is connected to the Bimplus project.
8 Click Finish in the New Project – Additional Project Settings
dialog box.
The Allplan Share project is created in the selected Bimplus pro-
ject.
9 You can now go directly to the Bimplus project management, e.g.
to invite other members to the project (see "Inviting members to
an Allplan Share project" on page 30).

Allplan Share Working with Allplan Share projects 27
Convert existing Allplan projects to Allplan Share projects
You can share existing Allplan projects (i.e. local Allplan projects or
projects edited in a workgroup) with Allplan Share projects. To do
this, simply copy the Allplan project to the Bimplus cloud.
Important! The original Allplan project and the Allplan Share project
will no longer be connected after copying. Please make sure that you
only use the appropriate project version for further editing.
To convert an existing Allplan project into an Allplan
Share project
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
1 Start Allplan and make sure that you are logged in to Allplan web
services.
2 Click New Project, Open Project.
3 In the left column of the New Project, Open Project dialog box,
select the project data path Local or Workgroup Server.
4 In Project name column, click the project you want to copy, and
then click Copy project.
Or:
Open the shortcut menu of the project that you want to copy and
click Copy to.

2 8 Creating Allplan Share projects Allplan 2022
5 Select BIMPLUS as storage location.
6 If you want to create a new Bimplus for the Allplan Share project:
Select the Create new Bimplus project check box.
Note: You can only create new Bimplus projects if you are the
owner or an administrator of the Bimplus team.
Or:
If you want to create the Allplan Share project in an existing
Bimplus project:
Clear the Create new Bimplus project check box.
7 Use the Team list box where applicable to select the Bimplus
team that is going to edit the Allplan Share project.

Allplan Share Working with Allplan Share projects 29
8 Only if you selected the Create new Bimplus project option in
step 6:
Enter the name for the new Bimplus project in Project name.
This project name is used in identical notation for both the newly
created Bimplus project and the Allplan Share project.
Or:
Only if you did not select the Create new Bimplus project option
in step 6:
For the Project, select the Bimplus project in which you want to
store the Allplan Share project.
The Allplan Share project automatically receives the name of the
Bimplus project.
Important! Please make sure that you select a Bimplus project
that does not contain another Allplan Share project yet (icon:
= Bimplus project without Allplan Share project).
9 For model name, enter a name for the Allplan model that matches
the name you want to use for the Bimplus project management.
10 Click OK.
This copies the native Allplan project data as an Allplan Share pro-
ject to the selected Bimplus project. The Allplan Share project
contains only native Allplan data. Considering network perfor-
mance, the BIM specialist model will not automatically be created.
Important! If you want to include the Allplan Share project as a
BIM specialist model in Bimplus and make it visible in BIM Explorer,
you need to upload the model data of the Allplan Share project to
Bimplus (see "Uploading the BIM model From the Allplan Share
project to Bimplus" on page 35).
Note: After having copied the project to Bimplus cloud storage, you
must assign user rights for print sets and privilege sets again.

3 0 Inviting members to an Allplan Share project Allplan 2022
Inviting members to an Allplan Share
project
All members of a Bimplus project are automatically also members of
an Allplan Share project stored in it. If you want to invite new mem-
bers to an Allplan Share project, add them to the Bimplus project,
giving them the rights intended for editing the Allplan Share project.
To invite a new project member an Allplan Share pro-
ject
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
1 Click New Project, Open Project.
2 In the left column of the New Project, Open Project dialog box,
please select the Share project data path.
3 Only if you are a member of several Bimplus teams:
In the Team column, select the Bimplus team that will work on the
Allplan Share project.
4 Click Bimplus project management on the shortcut menu of the
project.
The BIMPLUS web portal opens. Manage project members is
already selected.
5 Click Invite member.
6 In the Invite member dialog box, enter the email address of the
new project member.
You can select all members of the Bimplus team in which the pro-
ject is being worked on directly in the email list box.
However, you can also enter a non-team email address. In this
case, the invitee is not only included in the project, but also auto-
matically in the team.

Allplan Share Working with Allplan Share projects 31
7 Select the member role and optionally enter an additional messa-
ge to the invitee.
Important! Do not assign the role of project administrator to the
new team member unless this is absolutely necessary because
this role has more rights than the the project editor or observer.
You can change the member role at any time in Manage project
members.
8 Click INVITE.
If the specified email address is already registered for Allplan web
services, then its owner is immediately visible as active in the
project.
Or:
If the specified email address is not registered for Allplan web
services yet, an invitation will be sent. When the invitee accepts
and confirms the invitation, this email address is automatically re-
gistered for Allplan web services and its owner is not only in-
cluded in the project but also automatically in the team
9 Only if the new project members do not have their own Allplan
Share license
Assign the new project member an Allplan Share license (see
"Assigning licenses to users" on page 15).

3 2 Working on Allplan Share projects in Allplan Allplan 2022
Working on Allplan Share projects in
Allplan
The procedure for working on an Allplan Share project is almost
exactly the same as that for working on an „ordinary“ Allplan project.
You need to be logged in to Allplan web services, have an Allplan
Share license and be registered as a project member in the relevant
Allplan Share project.
Open Allplan Share projects
You can open an Allplan Share project in the same way as an Allplan
project saved locally or in the workgroup.
To open an Allplan Share project
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are a project member of the Allplan Share project
1 Click New Project, Open Project.
2 In the left column of the New Project, Open Project dialog box,
please select the Share project data path.
3 Only if you are a member of several Bimplus teams:
In the Team column, select the Bimplus team that will work on the
Allplan Share project.
4 In the Project name column, click the Allplan Share project that
you wish to open.
Note: All existing Bimplus projects in the selected Bimplus team
are displayed in this column. You can recognize Bimplus projects
that contain an Allplan Share project by the icon: = Bimplus
project with Allplan Share project or = Bimplus project without
Allplan Share project.
5 Click OK.

Allplan Share Working with Allplan Share projects 33
Close Allplan Share projects
An Allplan Share project you are working on is always closed com-
pletely when you open another Allplan (Share) project or exit Allplan.
Your local work status is automatically synchronized with the Allplan
Share project. No further action is required by you.
The lock information generated for you on drawing files and other
resources of the project is also completely removed, so that other
colleagues can edit the project again without any restrictions.
Important! Therefore, always close an Allplan Share project you are
working on when you take a break or have finished editing it.

3 4 Manage lock information for Allplan Share projects Allplan 2022
Manage lock information for Allplan Share
projects
As the owner or administrator of the Bimplus team or administrator
of the Bimplus project, you can view and manage the lock informati-
on of an Allplan Share project.
To manage locking info of an Allplan Share project
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
1 Click New Project, Open Project.
2 In the left column of the New Project, Open Project dialog box,
please select the Share project data path.
3 Only if you are a member of several Bimplus teams:
In the Team column, select the Bimplus team that will work on the
Allplan Share project.
4 Click Manage locking information management on the shortcut
menu of the project.
The Locking Information Administration dialog box opens.
5 In the left column, select the project for which you want to recei-
ve the locking info.
If necessary, click Refresh below the column to display the cur-
rent state.
6 Click Remove locking information in the right column of a dra-
wing file's context menu to delete the lock information for the
drawing file.
If necessary, click Refresh again below the column to display the
current state.
7 Close the Locking Information Administration dialog box.

Allplan Share Working with Allplan Share projects 35
Uploading the BIM model From the Allplan
Share project to Bimplus
If you want to include the Allplan Share project as a BIM specialist
model in Bimplus (for example, in the coordination model of an exis-
ting Bimplus project) and make it visible in BIM Explorer, you need to
upload the model data of the Allplan Share project to Bimplus.
Note: See "Handling projects with Allplan Bimplus" in the Allplan Help
for more information about handling projects in a BIM-compliant
manner with Bimplus, the web service offered by ALLPLAN GmbH.
To upload model data Allplan Share project data to
Bimplus
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are a project member of the Allplan Share project
1 Click Upload Model to Bimplus.
The Upload Model to Bimplus dialog box opens.
2 Go to the Setting area and decide whether you want to update
the existing model, overwrite it, or create a new revision:
• Synchronize the model data (existing model data will be
merged into Bimplus).
New model data are added to the current model data, changed
ones are updated.
• Replace model data of the last revision completely
Replaces the current model completely with the new model
data.
• and create new revision
In addition, select this option if a new revision level of the mo-
del is to be created; the original version remains unchanged
and can still be viewed and edited via the BIMPLUS web
portal.


## Sayfa 41

3 6 Uploading the BIM model From the Allplan Share project to BimplusAllplan 202
3 Go to the Synchronize drawing files area and decide whether
you want to automatically sync the BIM specialist model when
there are changes in the drawing files selected in the Select dra-
wing files area in the Allplan Share project.
Select the Auto-sync to Bimplus model check box and click Sel-
ect to select the required drawing files.
Note: You can also update the BIM specialist model at any time by
uploading the model data from the Allplan Share project again.
4 Click OK.
This uploads the model data to Bimplus.
5 Click OK to confirm the message that appears when the upload is
completed.

Allplan Share Working with Allplan Share projects 37
Copying or moving Allplan Share projects
off Bimplus cloud storage
You can copy or move Allplan Share projects from Bimplus cloud
storage to the local workstation drive or the workgroup server.
Important! The original Allplan Share project and the local Allplan
project or the Allplan project in the workgroup are no longer connec-
ted after copying. Please make sure that you only use the appropria-
te project version for further editing.
To copy or move an Allplan Share project from Bimplus
cloud storage
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
 You also need to be an Allplan administrator if you wish to copy or
move an Allplan Share project to an Allplan Workgroup server.
1 Click New Project, Open Project.
2 In the left column of the New Project, Open Project dialog box,
please select the Share project data path.
3 Only if you are a member of several Bimplus teams:
In the Team column, select the Bimplus team that will work on the
Allplan Share project.
4 Open the shortcut menu of the project that you wish to copy or
move and click Copy to or Move to.
5 Select the local computer or workgroup server for the location.

3 8 Backing up and restoring Allplan Share project data Allplan 2022
Backing up and restoring Allplan Share
project data
Backing up Allplan Share projects
PLEASE NOTE The Allplan Share projects stored in the Bimplus cloud
are not backed up individually or specifically by ALLPLAN GmbH!
Please make sure to save your Allplan Share projects at regular in-
tervals at your own discretion.
To create a backup copy of an Allplan Share project, open the New
Project, Open Project dialog box, right-click the project that you
want to back up, and choose one of the two options:
• Copy to: You can use this tool to create a copy of the selected
project from the Copy, move project dialog box. As soon as All-
plan has copied the selected project, this dialog box closes and
Allplan switches to the new project.
• Create project backup: Use this tool this to compress a project
and save it as a ZIP file. For example: A planning partner can add a
compressed project to the project list by using drag-and-drop
editing.
In addition, a backup copy of each drawing file or layout that has been
changed and uploaded will automatically be saved in the local file
storage folder in backup\Ndw (drawing files) or backup\Layout
(layouts). Allplan saves the last three versions of each drawing file
and layout, naming the files according to the following pattern: [fi-
le name]_[yyymmdd]_[hhmm].

Allplan Share Working with Allplan Share projects 39
Restoring project data from a backup
You can restore not only an entire project but also one or more dra-
wing files or layouts from a data backup. By means of Allplan Share
Project Explorer, you can also restore any other Allplan data and
resources.
Restoring an entire project
Use this procedure when you want to replace an entire Allplan Share
project with a project backup. Create a new Allplan project (on the
local computer or on a workgroup server) from the project backup,
delete the existing Allplan Share project, and copy the new project to
the Bimplus project, which is now empty.
To restore an entire Allplan Share project from a pro-
ject backup
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
1 Click New Project, Open Project.
2 Add the project from the project backup to the project list by
using drag-and-drop editing.
This creates a new Allplan project.
3 Delete the Allplan Share project that you want to replace (see
"Delete Allplan Share projects" on page 42).
4 Copy the new project to Allplan Share into the Bimplus project,
which is now empty (see "Convert existing Allplan projects to All-
plan Share projects" on page 27).

4 0 Backing up and restoring Allplan Share project data Allplan 2022
Restoring individual layouts
You can restore individual layouts from a file (*.npl) or a project
backup.
To restore individual layouts
1 Open the Allplan Share project in which you want to restore lay-
outs from a backup.
2 Switch to layout editor and click Open on a Project-Specific
Basis.
3 Right-click the layout that you want to replace and select Re-
place layout on the shortcut menu. Make sure that the layout is
not open or was open shortly before.
4 Proceed in either of the following ways:
• Select the layout (*.npl) in any folder (for example, a pro-
ject) and click Open.
• Select ZIP files in the lower-right area of the dialog box and
double-click a project backup saved as a ZIP file. Select the
layout that you want to restore and click OK.
Restoring other resources (for example: building
structure, textures, and so on)
Apart from drawing files and layouts, you can also restore other re-
sources, such as building structures or textures.
Important: Do this only if you know exactly how the individual re-
sources work and how changes affect the resources!

Allplan Share Working with Allplan Share projects 41
To restore any resources in an Allplan Share project
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
1 Click New Project, Open Project.
2 In the left column of the New Project, Open Project dialog box,
please select the Share project data path.
3 Right-click the project in which you want to restore resources,
then select Manage project files.
This opens Allplan Share Project Explorer, which you can use to
download files from Allplan Share or upload files to Allplan Share.
4 You can do the following by using the shortcut menu (multiple
selection is possible):
• Download file: Downloads the selected files in the Allplan TMP
folder.
• Upload file: Uploads files from any folder to Allplan Share.
• Open, edit file: Opens the file in the linked application.
• Delete file: Deletes the selected objects.
• Open download folder: Opens the Allplan TMP folder that
contains the files that you downloaded from Allplan Share.

4 2 Delete Allplan Share projects Allplan 2022
Delete Allplan Share projects
When you delete an Allplan Share project, only the native Allplan
project data is deleted. The remaining data of the Bimplus project
(e.g. models, documents, etc.) as well as the Bimplus project as such
remain intact.
To delete an Allplan Share project
 Allplan is running.
 You have signed in to the Allplan the web service platform.
 You are the owner or administrator of the Bimplus team. or admi-
nistrator of an existing Bimplus project
1 Click New Project, Open Project.
2 In the left column of the New Project, Open Project dialog box,
please select the Share project data path.
3 Only if you are a member of several Bimplus teams:
In the Team column, select the Bimplus team that will work on the
Allplan Share project.
4 Open the shortcut menu of the project that you want to delete
and click Delete project.
5 Click Yes to confirm the prompt.
The symbol for the project changes from (project with Allplan
data) to (project without Allplan data).
ATTENTION! This also deletes the data from the local file storage
folder!

Allplan Share FAQs 43
FAQs
What is Allplan Share?
Allplan Share is a cloud solution; you use cloud computing to edit and
store native Allplan project data.
By combining Allplan Share, Allplan Architecture or Allplan Enginee-
ring, and an Allplan Bimplus account, you can directly collaborate with
planning partners all over the world on one and the same Allplan pro-
ject. Being based on the openBIM platform Allplan Bimplus, Allplan
Share provides additional functionality, such as Model Viewer, Issue
Manager (the tool for issue management), revision control, and much
more. Allplan Share not only reduces your administrative costs and
staff costs but also helps you avoid extra costs. You do not need to
buy, install, or maintain a local server because Allplan Bimplus uses
cloud storage to save the data.
What do I need to use Allplan Share?
• An internet connection that is stable and uninterrupted; at least 10
megabits for upload and 20 megabits for download; the latency
must be less than 50 milliseconds; recommended: 50 megabits
for upload; 100 megabits for download, the latency must be less
than 10 milliseconds.
• The hardware requirements are the same as those for Allplan.
• Current network drivers
Further requirements
• Bimplus account or Allplan Connect account
• Bimplus team
• At least one license for Allplan Share
• If possible, use a local (SSD) hard drive for the local file storage
folder; network drives slow down access. The local file storage
folder must not be shared between several users; this might cau-
se massive problems.

4 4 Delete Allplan Share projects Allplan 2022
How do I create an Allplan Bimplus account?
Register with Allplan Connect or Allplan Campus.
How do I create a Bimplus team?
Create a Bimplus team in Allplan Connect or Allplan Campus.
We recommend that you use a generic email address (for example,
info@company.com) because you cannot change the email address
later. The team name is automatically the company name behind the
email address in the Allplan Connect account. The team owner can
change the Bimplus team name at any time.
How does licensing of Allplan Share work?
Allplan Share licenses can be subscribed exclusively by team owners
for their Bimplus team. The term can be selected after consultation
with a sales representative.
For each Allplan Share license, theBimplus team gets 100 GB of me-
mory on the openBIM platform Allplan Bimplus. If you need more
memory, subscribe to additional licenses.
The team owner or a team administrator assigns the licenses to the
team members or external project participants. Authorized users can
then work on all projects within the Bimplus team for which they are
given the appropriate status (at least project editor).
How and where can I purchase licenses for Allplan Share?
Your sales partner will be happy to provide you with a license for
Allplan Share.
Note: The available memory is 2 GB for trial licenses.
How can I assign licenses for Allplan Share?
Allplan Share licenses can be assigned or removed by the team ow-
ner in the Allplan Shop in the My account - Subscriptions and users
area or by the team owner or team administrator in the BIMPLUS
web portal in the Team members area.
How does licensing work for students and teachers?
If you are a student or teacher, you can use the free student version
of Allplan Share. The only requirement is that your Allplan student

Allplan Share FAQs 45
license is registered and verified. Do the following to get the Allplan
Share license:
Register with Allplan Campus; click Get options; click Go to Allplan
Shop; click the upper-left Allplan logo; click Education; add the free
Allplan Share Student option to the shopping cart; follow the in-
structions.
The Allplan Share license will be assigned automatically.
Note: The available memory is 2 GB for student licenses.
How can I create a new Allplan Share project or copy an
existing Allplan project to Allplan Share?
Create a new project in Allplan and select BIMPLUS for the location
(team administrator or team owner only).
You can use the shortcut menu to copy existing Allplan projects to
Allplan Share. In doing so, you can either create a new Bimplus project
(requires at least the role of team administrator) or use an existing
project that does not yet contain any Allplan data (requires at least
the role of project administrator).
Which actions make Allplan upload edited data to Allplan
Share?
• Close a drawing file or open it in reference mode.
• Close the project.
• Switch to layout editor.
• Open ProjectPilot.
In addition, you can use Save to manually save and upload all
changed drawing files or layouts to Allplan Share.
How can I create a backup of an Allplan Share project?
Open the dialog box for managing projects in Allplan, right-click the
project you want to save and select Copy project or Create project
backup.
How can I restore an Allplan Share project from a data ba-
ckup?
• Restoring an entire project from a project backup: Drag the
project backup into the dialog box for selecting projects in Allplan


## Sayfa 51

4 6 Delete Allplan Share projects Allplan 2022
(this creates a new project); delete the Allplan Share project; copy
the new Allplan project to the existing Bimplus project.
• Restoring individual layout: Open the dialog box and click on
Replace layout in the shortcut menu.
• Restoring other resources: Open the dialog box for selecting
projects; right-click an Allplan Share project; select Manage pro-
ject files on the shortcut menu; replace the resources in Allplan
Share Project Explorer.
What are the rights in an Allplan Share project and where
are they managed?
The Bimplus portal manages both Bimplus users and Allplan Share
users. Rights consist of two levels: the first level is the access rights
at team level; the second level is the access rights at project level.
Roles at team level
• Team owner
• Team administrator
• Team member
Roles at project level
• Project administrator
• Project editor
• Project viewer

ABOUT THE COMPANY
ALLPLAN is a global provider of Building Information Modeling (BIM) solutions for the AEC
industry. For more than 50 years ALLPLAN has pioneered the digitalization
of the construction industry. Always focused on our clients we provide innovative
tools to design and construct projects - inspiring users to realize their visions.
Headquartered in Munich, Germany, ALLPLAN is part of the Nemetschek Group. Around the world
over 400 dedicated employees continue to write the ALLPLAN success story.
ALLPLAN IS A MEMBER OF:
More information:
allplan.com
ALLPLAN GmbH
Konrad-Zuse-Platz 1
81829 Munich
info@allplan.com
allplan.com © ALLPLAN GmbH, Munich, Germany

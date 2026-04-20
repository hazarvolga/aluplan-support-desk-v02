# TUT [Eng] SCIA25.0 - Tutorial Design Forms

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA25.0 - Tutorial Design Forms-iuzzwxgdts9.pdf`

---

**Toplam Sayfa:** 16


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
DESIGN FORMS

| \ SCIA ENGINEER
TUTORIAL
DESIGN FORMS |
| --- |
|  |


Tutorial – Design Forms
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2025 SCIA nv. All rights reserved.
2 BV – 2025/02/24

Table of contents
Table of Contents
Table of Contents............................................................................................................................................... 3
Introduction ......................................................................................................................................................... 4
Example ‘Check of support stress’ ............................................................................................................... 5
BV – 2025/02/24 3

Tutorial – Design Forms
Introduction
Within this tutorial, an example is given on the use of Open Checks: Link with SCIA Design Forms.
In SCIA Engineer, a large amount of advanced checks are available for a 1D member: Concrete Reinforcement Design,
Steel Code Checks, Aluminium Design, Timber Design …
It is off course possible that you would like a special kind of check, something which is not currently implemented in
SCIA Engineer.
This is where the link with SCIA Design Forms comes up: using this module, you can define your own type of check
within SCIA Design Forms and link this to SCIA Engineer. During the check, the input data from SCIA Engineer (like
internal forces, materials, cross-section data,…) are sent to the Design Form and the results are read back. The fully
detailed output of the Form can even be displayed directly within SCIA Engineer.
4 BV – 2025/02/24

Tutorial – User blocks
Example ‘Check of support stress’
Open SCIA Engineer and model a beam (cross-section 0,3 m x 0,2 m, material C25/30, length 6 m) on 2 fixed supports.
You can create load cases LC1 (self weight – permanent action type) and LC2 (point load of - 1 kN in Z direction – variable
action type).
Now calculate the model, so results are available.
BV – 2025/02/24 5

Tutorial – Design Forms
Open SCIA Design Forms Builder (you can open it in SCIA Engineer via Main menu > Design > Check manager > New >
New script).
You probably need to confirm two dialogs about some program settings. Then the SCIA Design Forms Builder should
open.
6 BV – 2025/02/24

Tutorial – User blocks
Write following script in the script editor:
A = B*H;
σ = Rz/A;
Press ‘Refresh’ to generate the Table of variables. Set the desired units.
Note: if necessary, use CTRL+H to use superscript for creating units such as m², N/mm², …
Fill in the ID-field for the parameters you want to calculate: for example Result.1 for σ and Result.2 for A
BV – 2025/02/24 7

Tutorial – Design Forms
Go to the ‘Header’-tab and fill in the fields in the subtab ‘General’.
Note: select the Element type, depending on the results you want to use (for example Member_0D if you want to use
reaction forces).
Save the file in the OpenChecks-folder.
By default this is the folder ‘C:\Users\*username*\Documents\ESA25.0\OpenChecks)’.
You can check this folder in SCIA Engineer via Main menu > View > Global UI settings > tab Templates & directories >
Show directories for ‘Open checks’.
8 BV – 2025/02/24

Tutorial – User blocks
In SCIA Design Forms Builder go to the ‘Result variables’-subtab and define the ESA units for the defined ESAID’s:
• Result.1: Geometry – Length [m^2]
• Result.2: Loads/Results – [N/m^2]
Choose ‘Export CLC’ to create the CLC file in the folder where you saved the .cls file.
Go in SCIA Engineer to Main menu > Design > Check manager > New and choose the created open check. After
confirming it should appear as item at the bottom of the Check manager.
BV – 2025/02/24 9

Tutorial – Design Forms
Add 0D Member data to the model.
10 BV – 2025/02/24


## Sayfa 11

Tutorial – User blocks
Choose for the created check ‘Stress at support’.
Go to the Property panel, set Values to A, turn on the option ‘Run using Model Data files’ and press Refresh.
BV – 2025/02/24 11

Tutorial – Design Forms
Now we want to link the value of Rz (calculated from SCIA Engineer) to this design form.
In SCIA Design Forms Builder, go to the tab ‘Dialog’ and double-click on ‘EMD loader’. Then set the correct directory for
‘Custom EMD data directory’. This should be the folder with Member0D data (in the Temp folder) if you want to use
reaction forces. For example: C:\Users\*username*\ESA25.0\Temp\Esa_model_data\Member0D.1
12 BV – 2025/02/24

Tutorial – User blocks
Go back to the ‘Calculation’-tab and open the IO viewer (View > Open IO Viewer) and press ‘Refresh’ in the IO viewer
window.
Search for the results that you are interested in and create variables B, H and Rz with these properties:
• LinkedMembers > Beam_1 > Geometry > B
LinkedMembers > Beam_1 > Geometry > H
BV – 2025/02/24 13

Tutorial – Design Forms
• LinkedMembers > Support_1 > Point > [0] > InternalForces > 0 > Vz
Notes:
• make sure to put 0 between square brackets [ ]
• use IO.LOAD.ID so the result can also be asked for a combination
14 BV – 2025/02/24

Tutorial – User blocks
Press ‘Refresh’. B, H and Rz should now be calculated.
Press again to ‘Export CLC’
Go to SCIA Engineer, go to the Check manager and choose ‘Update definition’.
BV – 2025/02/24 15

Tutorial – Design Forms
Execute the check ‘Stress at support’ for Values = σ.
The check can be added to the Engineering report as well.
16 BV – 2025/02/24

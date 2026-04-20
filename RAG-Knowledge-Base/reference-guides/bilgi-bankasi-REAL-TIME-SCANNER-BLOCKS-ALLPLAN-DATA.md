---
title: "Real Time Scanner Blocks Allplan Data"
category: Troubleshooting
source: REAL TIME SCANNER BLOCKS ALLPLAN DATA.txt
tags: [allplanYeni_Extraction, Allplan, Auto_Categorized]
---

REAL TIME SCANNER BLOCKS ALLPLAN DATA



Question:  Allplan does not react promptly or seems to hang after I have selected the "Open on a Project-Specific Basis" or "New Project, Open Project" tool.  One of the following virus scanners is running: Trendmicro, McAfee, Kaspersky, Avira, F-Prot and others. What can I do to solve this problem?    Answer:  Check whether updating the software of the virus scanner solves the problem.  If it doesn't, configure the real time scanner of the virus scanner so that it no longer scans the program folder and data folder of Allplan.  Start the Services application. Make a note of the following paths displayed in the Services application window:  Program folder General program data Central file storage folder  Define these folders as exemptions in your virus scanner.  In addition, add the paths listed below to the list of exceptions:  C:\Program Files\Allplan\AllplanUpdateLauncher 20XX\*. C:\Users\Windows Username\AppData\Local\Nemetschek\Allplan\20XX\Tmp\*. C:\Users\Windows Username\AppData\Local\ALLPLAN_GmbH\*.  Please note that the subfolders of the paths given in the list must also be included in the configuration.  Bear in mind that virus scanners may be installed on the server and the clients (provided you work with a server). For more information on the virus scanner, contact the manufacturer.  Addition: In addition, also configure the setting for licensing. Define the exception in your virus scanner for the "Codemeter" folder. You will find this under:  C:\Program files (X86)\Codemeter. C:\Program files\Codemeter C:\ProgramData\CodeMeter

# MAN [Eng] SCIA25.0 - XML tutorial

**Kategori:** SCIA Engineer Manual
**Kaynak:** `MAN [Eng] SCIA25.0 - XML tutorial-wy59tdozvzm.pdf`

---

**Toplam Sayfa:** 30


## Sayfa 1

ADVANCED PACKAGE TRAINING
XML data exchange

Advanced Package Training – XML data exchange
All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2025 SCIA nv. All rights reserved.
2 DD – 2025/03/03

Table of contents
Table of Contents
Table of Contents..................................................................................................................................... 3
Introduction ............................................................................................................................................... 4
1 Modelling the structure ............................................................................................................... 5
1.1 Creating the model ............................................................................................................................. 5
1.1.1 Input of geometry ............................................................................................................................. 5
1.1.1 Sections .............................................................................................................................................. 5
1.1.2 Loads .................................................................................................................................................. 6
1.1.3 Load Combinations .......................................................................................................................... 6
1.2 Export structure data to XML .......................................................................................................... 6
2 Reading the XML file .................................................................................................................. 10
2.1 The DEF file ........................................................................................................................................ 10
2.1.1 Containers ....................................................................................................................................... 10
2.2 The XML document .......................................................................................................................... 10
2.2.1 Modify the XML document ........................................................................................................... 12
2.2.2 Update the structure with XML.................................................................................................... 12
3 Link Excel-XML-SCIA ................................................................................................................. 13
3.1 Modify an XML file using Macros in Excel ................................................................................. 13
3.1.1 Create the VBA ............................................................................................................................... 15
3.1.2 Update the structure with XML.................................................................................................... 17
4 Running a calculation ................................................................................................................ 18
4.1 esa_XML.exe application ................................................................................................................ 18
4.1.1 Command line parameters of esa_XML ................................................................................... 18
4.2 VBA script to run esa_XML ............................................................................................................ 19
5 Advanced features ..................................................................................................................... 26
5.1 Complete the Excel sheet with the profile’s library ................................................................. 26
Annex A: Alternative script for XML writing + Optimization ....................................................... 27
3

Advanced Package Training – XML data exchange
Introduction
In SCIA Engineer there is the possibility to use the XML format to get the data of the Project the users are working on. In
the first chapters of this tutorial the different features of the format will be presented in detailed and the XML
import/export option explained.
The XML output can be adopted for several uses. The example here presented is to create VBA in Excel which modifies
certain parameters of the XML file and allows to update these properties in the model.
Connected to this format the application ESA_XML.exe has been developed.
It is a powerful technology that allows run SCIA Engineer in the background, and by consequence to run calculations and
export results.
4 DD – 2025/03/03

1 Modelling the structure
1.1 Creating the model
1.1.1 Input of geometry
Create the following structure in SCIA Engineer.
1.1.1 Sections
Columns : Rafters :
Note: The use of parametric sections will allow us to influence one of the section parameter to obtain different values.
5

Advanced Package Training – XML data exchange
1.1.2 Loads
Create 2 loads cases in SCIA as below:
- G: Self weight
- Q: Variable > line force on roof beams 4 kN/m in Z direction (GCS)
1.1.3 Load Combinations
2 loads combinations are already created by default in SCIA as below (If you have active “automatic combination” in the project
setting):
- EN-ULS Set B
- EN-SLS Characteristic
1.2 Export structure data to XML
After creating the load cases and load combinations and applying these on the structure we can create the XML-file.
This can be done via File>Export to>XML File :
It will ask you to load a template. SCIA Engineer has some standard templates in which you can choose from.
In this case we click on cancel in order to not use a template but to create a new XML-file from scratch.
6 DD – 2025/03/03

We click on new to start adding items in your XML-file
The order of the added items is very important in an XML-file because the XML-file will be read from top to bottom. For
example, you cannot define a load case before defining the load groups because the load group is a property of the load
case. This can result in errors when using the XML-file. Another example is that you cannot input a beam without prior
inputting the cross-section and the nodes because these are properties of that beam. Always keep the logical order in
mind so that you obtain a working XML-file which can be used in SCIA Engineer.
We add to the Document all the data of the structure we have created. Every element added will be shown on the right
side of the Screen in the preview. The document should then contain the structural elements (supports, columns, beams)
as well as the load cases, load combinations, applied loads.
The below picture should be the end result:
In the properties shown in the bottom part we can change only the text shown in the Preview.
To amend the tables, we can select them and click on Table Composer as for the following image.
All the data shown in the Table Composer can be added to our Document and exported in the XML document and then
used externally.
7

Advanced Package Training – XML data exchange
We export then the XML document. Before exporting this data to XML make sure that the content is fully regenerated.
We click on export and navigate to the folder in which you want to export this data to XML.
For the XML document the Unicode Standard needs to be used. It is selected by default.
Note : Is very important don’t Forgot to deselected the Selectbox “Unicode” for to have the “encoding =”UTF-8” because
when you will use the macro VBA-e the code will be in UTF-8.
8 DD – 2025/03/03

We could use the Unicode only if we use an unicode file in VBA-e. More information here : CreateTextFile method
(Visual Basic for Applications) | Microsoft Learn
9

Advanced Package Training – XML data exchange
2 Reading the XML file
2.1 The DEF file
Once we have exported the document in XML, we notice two files have been created, a XML document and a file DEF.
The file DEF contains the list of all the parameters of the tables we have exported. The XML document contains all the
information of the particular Project we are modelling, so the XML document refers to the DEF file to read all the different
possibilities and indicate the ones chosen in the project created.
We open the generated DEF file using Notepad++ (txt reader).
We can see at the top the information related to the xml version, the standard used (Not Unicode) and the type of
Protection (Standalone)
2.1.1 Containers
In order to read both XML document and DEF file, we can orientate with the different “Containers”. Each container is one
of the tables added in the Document created in SCIA.
The first one is in fact Project and contains all the parameters we chose when starting a new project. We can see them
defined as def_properties. If we read all the DEF file, we can see then Materials, Sections, etc., in which all the general
information are reported.
2.2 The XML document
We open the generated XML document using Notepad++ (txt reader) or the Browser Explorer (Html format).
Let’s focus on the third Container: Cross Sections. As shown in the image below the DEF File (on the right) contains the
general information to define a cross section and the XML file (on the left) contains the information related to the project
we have defined.
In our case the properties Name, Catalog ID, Catalog Item and Parameters are recalled from the DEF File and defined as:
- Name: CS1, in the DEF file is defined as string, so a word.
- Catalog ID: ThinWalled Section (in the DEF file is defined as string, the library path has been recalled),
- Catalog Item: I section (in the DEF file is defined as integer. As it is the first one of the catalog, the number 0 has
been assigned)
- Parameters: in the DEF file a table is defined with 9 parameters.
10 DD – 2025/03/03


## Sayfa 11

For the forth property, number 3, a subtable has been defined and 9 possible parameters can be recalled.
In this case, in the project only 3 of these are defined: Name, Material and Length.
In the first row, number 0, the name is Material, and the material is defined; in the other rows, number 1-2-3-4-5, the
name is one of the parameters of the section, and a value (Length) is defined for each one of the properties.
We know now how to read the XML document, so we are able to modify it in order to obtain the desired results.
In this paragraph we show how to amend the XML document manually. In the next chapter we will use instead a Macro
created in Excel in order to modify more parameters automatically.
11

Advanced Package Training – XML data exchange
2.2.1 Modify the XML document
In this case for example we want to modify the height of the rafter and update our model with this update.
We copy the XML document and DEF file. We open the copy of the XML document and we modify the height of the beam
in the appropriate container:
We save and close the XML document.
2.2.2 Update the structure with XML
We update the current project with this XML-file via File > Update > XML-file
As the software reads the XML document, the changes are applied.
12 DD – 2025/03/03

3 Link Excel-XML-SCIA
3.1 Modify an XML file using Macros in Excel
We will see in this chapter how to create a Macro which gives as output an XML document modified with the parameters
we have inserted in Excel.
Notes: from this Chapter on, a strong basis of Excel VBA is required.
The Excel sheet will allow us to modify externally the dimensions of the section of the rafters of the project we have
modelled in the previous chapter.
Let us now start MS EXCEL, create a new document and define two sheets. Let us name them "Table" and "XML". The
first one (Table) will be our "User interface", i.e. it will be the sheet that will be used by the user. The other one (XML) will
be used as an auxiliary sheet to hold the contents of the XML file we have to generate.
We open Excel and we create a table with the parameters we want to influence, as for the image below.
We go now to the second Excel sheet, called “XML”, in which we copy in the second column the XML document created
before. In this sheet we are going then to add the references for the script we are going to write.
13

Advanced Package Training – XML data exchange
We scroll the script and we position the references H, B, t, s and R as for image below:
A B
<p1
v="EP_CssLib.EP_ProfLib_GeomThinWalled.1"/>
H <p4 v="0.25"/>
B <p4 v="0.14999999999999999"/>
t <p4 v="0.0080000000000000002"/>
s <p4 v="0.0060000000000000001"/>
R <p4 v="0.014999999999999999"/>
14 DD – 2025/03/03

|  | A |  |  | B |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | […] |  |  |
|  |  |  | <p0 v="CS2"/> |  |  |
|  |  |  | <p1
v="EP_CssLib.EP_ProfLib_GeomThinWalled.1"/> |  |  |
|  |  |  | <p2 v="0"/> |  |  |
|  |  |  | <p3 t=""> |  |  |
|  |  |  | <h> |  |  |
|  |  |  | <h0 t="Name"/> |  |  |
|  |  |  | <h1 t="Material"/> |  |  |
|  |  |  | <h4 t="Length"/> |  |  |
|  |  |  | </h> |  |  |
|  |  |  | <row id="0"> |  |  |
|  |  |  | <p0 v="Material"/> |  |  |
|  |  |  | <p1 i="152" n="S 235"/> |  |  |
|  |  |  | </row> |  |  |
|  |  |  | <row id="1"> |  |  |
|  |  |  | <p0 v="H"/> |  |  |
| H |  |  | <p4 v="0.25"/> |  |  |
|  |  |  | </row> |  |  |
|  |  |  | <row id="2"> |  |  |
|  |  |  | <p0 v="B"/> |  |  |
| B |  |  | <p4 v="0.14999999999999999"/> |  |  |
|  |  |  | </row> |  |  |
|  |  |  | <row id="3"> |  |  |
|  |  |  | <p0 v="t"/> |  |  |
| t |  |  | <p4 v="0.0080000000000000002"/> |  |  |
|  |  |  | </row> |  |  |
|  |  |  | <row id="4"> |  |  |
|  |  |  | <p0 v="s"/> |  |  |
| s |  |  | <p4 v="0.0060000000000000001"/> |  |  |
|  |  |  | </row> |  |  |
|  |  |  | <row id="5"> |  |  |
|  |  |  | <p0 v="R"/> |  |  |
| R |  |  | <p4 v="0.014999999999999999"/> |  |  |
|  |  |  | </row> |  |  |
|  |  |  | </p3></obj> |  |  |
|  |  |  | </table> |  |  |
|  |  |  | </container> |  |  |


3.1.1 Create the VBA
We create now the VBA script, which allows us to create a new XML document by clicking on “Recalculate” in the first
Excel sheet, and which will contain the new values of the dimensions of the cross section “CS2”.
To add the Recalculate command, we go to developer and we add a Command Button (active X control).
We go to the properties and we can change the name and reference to “Recalculate”
We can create our script. The example below can be used (please control and modify the path of the folders following
their location in the machine):
Sub Recalculate_Click()
' Open XML file for writing'
Dim fs, f
Set fs = CreateObject("Scripting.FileSystemObject")
Set f = fs.CreateTextFile("C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\XML.xml", True, False)
'object.CreateTextFile (filename, [ overwrite, [ unicode ]])
' we assume that the data are stored in folder
C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\XMLex.xml
' Generate XML file using the two input values
Dim SomethingToWrite As Boolean
SomethingToWrite = True
Dim mystring As String
Dim i As Integer
'Don't forgot look the number of cell for "i" here = 621
For i = 1 To 621
mystring = Worksheets("XML").Cells(i, 2).Value
If mystring <> "" Then
If Worksheets("XML").Cells(i, 1).Value = "H" Then
' this line stores the value of the H'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(5, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "B" Then
' this line storesthe value of the B'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(6, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "t" Then
' this line storesthe value of the t'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(7, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "s" Then
' this line storesthe value of the s'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(8, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "R" Then
' this line storesthe value of the R'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(9, 2).Value / 1000) & """/>"
End If
f.WriteLine (mystring)
End If
Next i
f.Close
End Sub
15

Advanced Package Training – XML data exchange
Note: One alternative to optimized the localization of folder is writting the script with “Localisation =
ThisWorkbook.Path” :
The script biggening with :
Sub Recalculate_Click()
Localisation = ThisWorkbook.Path
On Error GoTo Error
' Open XML file for writing'
Dim fs, f
Set fs = CreateObject("Scripting.FileSystemObject")
Set f = fs.CreateTextFile(Localisation & "\XML.xml", True,false)
[…]
The VBA script will create a file XML, in the folder in which we have saved the DEF file, with the new dimensions of the
section of the rafters, which overwrite the one of the script before.
We can open and check the new XML file created.
16 DD – 2025/03/03

3.1.2 Update the structure with XML
We update the current project with this XML-file via File > Update > XML-file
As the software reads the XML document, the changes are applied.
17

Advanced Package Training – XML data exchange
4 Running a calculation
4.1 esa_XML.exe application
In order to run SCIA in the background, the application esa_XML has been created. It is executable from another program,
that is capable of using XML file to modify ESA project data and obtain outputs in various formats.
It is a command line program and is able to perform the following tasks.
- Open the existing ESA project
- Read the given XML format and use its data to override the project
- Perform the given type of calculation
- Regenerate the existing document in the ESA project and export it into the selected format (HTML,TXT,ESA). In
case of several documents, one can specify the name of the document, otherwise the current document is used.
- Regenerate the existing output XML format and use it to generate XML file. If there are more than one output
formats in the project, it is possible to select the format by name.
4.1.1 Command line parameters of esa_XML
Calculation type* :
1. NONE = without any recalculations
2. NOC = No calculation
3. LIN = Linear calculation (Delete all calculated results when exists)
4. NEL = Nonlinear calculation
5. CON = Nonlinear concrete calculation
6. EIG = Eigen frequencies calculation
7. STB = Stability calculation
8. INF = Influence lines calculation
9. MOB = Mobile loads calculation
10. TDA = TDA calculation
11. SLN = Soilin calculation
12. PHA = Phases calculation
13. NPH = Nonlinear phases
14. CSS = Recalculation of cross sections
15. NST = Nonlinear stability
16. TID = Test of input data - solver link only
*Subject to availability in SCIA Engineer V25 (64bits)
If text CMD is input, it is possible to perform arbitrary number of actions within one run of the program.
The second parameter is the name of text file, where each line has the same syntax as the whole program and leads to
opening of one file (sub-levels are not allowed in CMD).
- input ESA project (file name including path)
- input XML file (file name including path) – optional parameter
18 DD – 2025/03/03

Third parameter: Switches – starting with ‘/’ or ‘-‘ character
1. -t – output file type – TXT, HTML,ESA (if not stated, the output file type is set to ESA)
2. -l – log file name
3. -o – output file name, the extension must be specified by used according to the selected output file type , if not
stated, no output is performed
4. -x – name of output XML file - if not stated, no output is performed
5. -d – name of document from which the output is performed, if not stated, the current document is used
6. -m – name of output XML format, if not stated, the current one is used
7. -sd= Engineering report output (Optional)
Note : More information here : Program ESA_XML (scia.net)
4.2 VBA script to run esa_XML
We will prepare a VBA script (run from an XLS sheet) that will perform a calculation of the displacement and the moment
My in the rafters. SCIA Engineer as a calculation engine will be running in the background. The user won’t even spot it on
the screen and will be able to think that the EXCEL sheet itself does everything.
All the results of the project need to be in the engineering report of the project. We can create a new engineering report
with name “Results” (XLS format)
We go to Engineering report and add the requested results.
19

Advanced Package Training – XML data exchange
Then we set for each one of the results the list of elements and the combination we want to export.
For the moment My:
For the displacement Uz:
20 DD – 2025/03/03


## Sayfa 21

Final document:
We can also creating one Report (PDF format) for the output of report. We go to Engineering report and add the
requested elements.
Then we can start to create our script. The example below can be used (please control and modify the path of the folders
following their location in the machine or use the “Localisation = ThisWorkbook.Path”)
21

Advanced Package Training – XML data exchange
Below we can see all function and Sub for the project (XMLtutorial.xlsm):
Declaration of variable :
Dim i As Integer
Private Declare PtrSafe Function OpenProcess Lib "kernel32" (ByVal dwDesiredAccess As Long, ByVal bInheritHandle As Long, ByVal dwProcessId
As Long) As Long
Private Declare PtrSafe Function GetExitCodeProcess Lib "kernel32" (ByVal hProcess As Long, lpExitCode As Long) As Long
Private Declare PtrSafe Function WaitForSingleObject Lib "kernel32" (ByVal _
hHandle As LongPtr, ByVal dwMilliseconds As Long) As Long
Sub Recalculate click :
Sub Recalculate_Click()
' Open XML file for writing'
Dim fs, f
Set fs = CreateObject("Scripting.FileSystemObject")
Set f = fs.CreateTextFile("C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\XML.xml", True, False)
'object.CreateTextFile (filename, [ overwrite, [ unicode ]])
' we assume that the data are stored in folder C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\XMLex.xml
' Generate XML file using the two input values
Dim SomethingToWrite As Boolean
SomethingToWrite = True
Dim mystring As String
Dim i As Integer
'Don't forgot look the number of cell for "i" here = 621
For i = 1 To 621
mystring = Worksheets("XML").Cells(i, 2).Value
If mystring <> "" Then
If Worksheets("XML").Cells(i, 1).Value = "H" Then
' this line stores the value of the H'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(5, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "B" Then
' this line storesthe value of the B'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(6, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "t" Then
' this line storesthe value of the t'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(7, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "s" Then
' this line storesthe value of the s'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(8, 2).Value / 1000) & """/>"
End If
If Worksheets("XML").Cells(i, 1).Value = "R" Then
' this line storesthe value of the R'
mystring = " <p4 v=""" & Str(Worksheets("Table").Cells(9, 2).Value / 1000) & """/>"
End If
f.WriteLine (mystring)
End If
Next i
f.Close
CalculSCIA
Copy
End Sub
22 DD – 2025/03/03

Sub EngeineeringReport :
Sub EngineeringReport()
EngineerReport
ActiveWorkbook.FollowHyperlink "C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\Report1.pdf"
End Sub
Function CalculSCIA :
Function CalculSCIA()
Chemin = "C:\Program Files\SCIA\Engineer25.0\ESA_XML.exe LIN
C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\esa2.esa
C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\XML.xml -tESA -
oC:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\calcul.esa "
If LanceEtAttendLaFin(Chemin) = 0 Then
End If
Chemin = "C:\Program Files\SCIA\Engineer25.0\ESA_XML.exe NOC
C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\calcul.esa -sd -tXLSX
/oC:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\Report1.xlsx -dResults"
If LanceEtAttendLaFin(Chemin) = 0 Then
End If
End Function
Function EngeineeringReport :
Function EngineerReport()
Chemin = "C:\Program Files\SCIA\Engineer2.0\ESA_XML.exe NOC
C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\calcul.esa -sd -tPDF -
oC:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\Report1.pdf -dReport "
If LanceEtAttendLaFin(Chemin) = 0 Then
End If
End Function
23

Advanced Package Training – XML data exchange
Function Copy:
Function Copy()
Dim Fichier As String, Chemin As String
Dim Wb As Workbook
Chemin = "C:\Users\dimitry\Desktop\Fomation_et_Tuto\Formation\ESA_XML\XML_tutorial\"
Fichier = "Report1.xlsx"
Set Wb = Workbooks.Open(Chemin & Fichier)
Workbooks("report1.xlsx").Activate
Sheets("1. 1D internal forces").Select
Set adresse = [A:Z].Find(What:="M_{y}", LookAt:=xlPart)
NoCol = adresse.Column
Colonne = Split(Cells(1, NoCol).Address, "$")(1)
Set adresse = [B:B].Find(What:=0, LookAt:=xlPart)
Ligne = adresse.Row
A1 = Format(Colonne & Ligne)
Myside = Range(A1)
Set adresse = [A:Z].Find(What:="M_{y}", LookAt:=xlPart)
NoCol = adresse.Column
Colonne = Split(Cells(1, NoCol).Address, "$")(1)
Set adresse = [B:B].Find(What:=6.083, LookAt:=xlPart)
Ligne = adresse.Row
A2 = Format(Colonne & Ligne)
Mycenter = Range(A2)
Sheets("2. 1D deformations").Select
Set adresse = [A:Z].Find(What:="u_{z}", LookAt:=xlPart)
NoCol = adresse.Column
Colonne = Split(Cells(1, NoCol).Address, "$")(1)
Set adresse = [B:B].Find(What:=6.083, LookAt:=xlPart)
Ligne = adresse.Row
B1 = Format(Colonne & Ligne)
Uzcenter = Range(B1)
Workbooks("XMLtutorial.xlsm").Activate
Sheets("Table").Select
Range("B16") = Mycenter
Range("B17") = Myside
Range("B19") = Uzcenter
Workbooks("Report1.xlsx").Activate
Workbooks("Report1.xlsx").Close SaveChanges:=True
End Function
Function LanceEtAttendLaFin : (For wait the ending of process ESA_XML)
Function LanceEtAttendLaFin(ByVal CheminComplet As String) As Long
Dim ProcessHandle As Long
Dim ProcessId As Long, ret&
ProcessId = Shell(CheminComplet, vbMinimizedFocus)
ProcessHandle = OpenProcess(&H1F0000, 0, ProcessId)
LanceEtAttendLaFin = WaitForSingleObject(ProcessHandle, 100000)
End Function
24 DD – 2025/03/03

The result will be the following:
With a click we can check easily the change in the moments “My” and the displacement “Uz”.
Note: You can find also the project optimized under file: XMLtutorial(Optimisation).xlsm
25

Advanced Package Training – XML data exchange
5 Advanced features
5.1 Complete the Excel sheet with the profile’s library
We complete now our spreadsheet by coping a Profile’s Library of IPE in the Excel sheet. We can then create a drop-
down list with the profile and connect directly all the dimensions to the profile selected.
Now once we chose a profile, all the dimensions will be automatically updated in the Spreadsheet.
We chose for example an IPE400: we run “Recalculate” and “ResultsXML” and we get the final result.
Note: Project ➔ XMLtutorial+IPE.xlsm
26 DD – 2025/03/03

Diversen
Annex A: Alternative script for XML writing + Optimization
Below we can see the sript with the function to replace directly the values in XML file via the function “ReadFileBuffer”.
Note : we note below the functions to complete the script taking in “Chapter 4: Running a calculation” :
Note : See file “XMLtutorial(Optimisationcomplete).xlsm”
Function MAJ :
Function MAJ()
localisation = ThisWorkbook.Path
Dim H As Double
Dim B As Double
Dim t As Double
Dim s As Double
Dim R As Double
Workbooks("XMLtutorial(Optimisationcomplete).xlsm").Activate
Sheets("Table").Select
H = Range("B5").Value
B = Range("B6").Value
t = Range("B7").Value
s = Range("B8").Value
R = Range("B9").Value
RemplacerChargeXML localisation & "\XML.xml", H * 0.001
RemplacerChargeXML localisation & "\XML.xml", B * 0.001
RemplacerChargeXML localisation & "\XML.xml", t * 0.001
RemplacerChargeXML localisation & "\XML.xml", s * 0.001
RemplacerChargeXML localisation & "\XML.xml", R * 0.001
End Function
27

Advanced Package Training – XML data exchange
Function RemplacerChargeXML :
Sub RemplacerChargeXML(ByVal FileName As String, _
ByVal NewValue As Double)
Dim f As Integer, errCode As Integer, errString As String
Dim buffer As String
Dim Pos As Long
Dim Fin As Long
Dim H As Double
Dim B As Double
Dim t As Double
Dim s As Double
Dim R As Double
Workbooks("XMLtutorial(Optimisationcomplete).xlsm ").Activate
Sheets("Table").Select
H = Range("B5").Value
B = Range("B6").Value
t = Range("B7").Value
s = Range("B8").Value
R = Range("B9").Value
buffer = ReadFileToBuffer(FileName, errCode, errString)
Pos = InStr(1, buffer, "<obj id=""2"" nm=""CS2"">")
If NewValue = H / 1000 Then
Pos = InStr(Pos, buffer, "<p0 v=""H""/>")
ElseIf NewValue = B / 1000 Then
Pos = InStr(Pos, buffer, "<p0 v=""B""/>")
ElseIf NewValue = t / 1000 Then
Pos = InStr(Pos, buffer, "<p0 v=""t""/>")
ElseIf NewValue = s / 1000 Then
Pos = InStr(Pos, buffer, "<p0 v=""s""/>")
Else
Pos = InStr(Pos, buffer, "<p0 v=""R""/>")
End If
Pos = InStr(Pos, buffer, "<p4 v=""")
Pos = Pos + 7
Fin = InStr(Pos, buffer, """")
f = FreeFile
Open FileName For Output As #f
Print #f, Left(buffer, Pos - 1) & NewValue & Right(buffer, Len(buffer) - Fin + 1)
Close #f
End Sub
28 DD – 2025/03/03

Diversen
Function ReadFileBuffer :
Private Function ReadFileToBuffer(ByVal szFileName As String, _
ByRef errCode As Integer, _
ByRef errString As String) As String
Dim f As Integer
Dim buffer As String
' error trapping
On Error GoTo ReadFileToBuffer_ERR
' Opening the file in 'Binary
f = FreeFile
Open szFileName For Binary As #f
' Preallocation of a buffer to the file size
buffer = Space$(LOF(f))
' Complet read file
Get #f, , buffer
Close #f
ReadFileToBuffer = buffer
ReadFileToBuffer_END:
Exit Function
ReadFileToBuffer_ERR:
' Error handling
ReadFileToBuffer = ""
errCode = Err.Number
errString = Err.Description
Resume ReadFileToBuffer_END
End Function
29

Advanced Package Training – XML data exchange
You can use the propriety the “ThisWorkbook.Path” for select the right folder. Exemple for “Function CalculSCIA() “:
Function CalculSCIA()
On Error GoTo Error
LocalisationEsa = ThisWorkbook.Path & "\esa2.esa"
LocalisationXML = ThisWorkbook.Path & "\XML.xml"
LocalisationEsaSave = ThisWorkbook.Path & "\test2.esa"
LocalisationReport = ThisWorkbook.Path & "\Report2.xlsx"
Chemin = "C:\Program Files\SCIA\Engineer24.0\ESA_XML.exe LIN " & LocalisationEsa & " " & LocalisationXML & " - tESA -o" &
LocalisationEsaSave & ""
If LanceEtAttendLaFin(Chemin) = 0 Then
End If
Chemin = "C:\Program Files\SCIA\Engineer24.0\ESA_XML.exe NOC " & LocalisationEsaSave & " -sd -tXLSX /o" & LocalisationReport & " -dResults"
If LanceEtAttendLaFin(Chemin) = 0 Then
End If
Exit Function
Error:
MsgBox "Erreur n° " & Err.Number & vbLf & Err.Description
End Function
Note: Of course you can use it for all Function.
30 DD – 2025/03/03

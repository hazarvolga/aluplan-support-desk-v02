# TUT [Eng] SCIA 25.0 - Tutorial combinations

**Kategori:** SCIA Engineer Tutorial
**Kaynak:** `TUT [Eng] SCIA 25.0 - Tutorial combinations-h8ewhhfy03b.pdf`

---

**Toplam Sayfa:** 17


## Sayfa 1

\ SCIA ENGINEER
TUTORIAL
Loads and combinations

All information in this document is subject to modification without prior notice. No part of this manual may be
reproduced, stored in a database or retrieval system or published, in any form or in any way, electronically,
mechanically, by print, photo print, microfilm or any other means without prior written permission from the publisher.
SCIA is not responsible for any direct or indirect damage because of imperfections in the documentation and/or the
software.
© Copyright 2024 SCIA nv. All rights reserved.
2
MC – 2025/14/01

Chapter 1 – The model
Table of Contents
Table of Contents............................................................................................................................................... 3
The model ............................................................................................................................................................ 4
Load cases and load groups ....................................................................................................................... 4
Load combination factors and psi-factors .................................................................................................... 4
Load cases and load groups .......................................................................................................................... 7
Load groups .................................................................................................................................................... 7
Property ‘structure’............................................................................................................................................. 9
Load cases ....................................................................................................................................................... 9
Load combinations .......................................................................................................................................... 12
Linear combination ...................................................................................................................................... 12
EN combination ............................................................................................................................................ 13
Property ‘structure’...........................................................................................................................................14
Envelope combination ................................................................................................................................ 15
Result classes .................................................................................................................................................. 16
Results ................................................................................................................................................................ 17
EN and envelope combinations ............................................................................................................... 17
The most critical combinations ................................................................................................................ 17
3 MC - 2025/14/01

The model
This tutorial assumes that the modelling of a structure is understood and focusses on implementing load cases, groups
and combinations.
The example that will be used in this tutorial is a small bridge deck with a sidewalk and a road over which only one car
can drive at a time.
Load cases and load groups
The table below shows the different load cases, types and load groups.
Load case Type Load group type
self-weight P / /
LC 1: Permanent loads P LG 1
LC 2: Car left V LG 2 Exclusive
LC 3: Car right V LG 2 Exclusive
LC 4: Pedestrian V LG 3 Standard
P = Permanent load
V = Variable load
LC = Load case
LG = Load group
Every load case needs to be added to a load group. These load groups also have a property type which you use to
define if loads can occur together in a combination or not. Assume there are two load case A and B in one load group.
There are three different types you can choose from:
• Standard – A and/or B
• Exclusive – A or B
• Together – A and B
In this example there are 5 different load cases. It is known that only one car can use the bridge at a time, so LC 2 and
LC 3 can never occur together. To model this, both load cases should be put in the same load group, LG 2 and the type
should be set on exclusive. When creating automatic combinations, LC 2 and LC 3
will never occur in the same combination.
Load combination factors and psi-factors
Load combination factors and psi factors can be found in the National Annex manager.
4
MC – 2025/14/01

| Load case |  |  | Type |  |  | Load group |  |  | type |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | self-weight |  |  | P |  |  | / |  |  | / |  |
| LC 1: Permanent loads |  |  | P |  |  | LG 1 |  |  |  |  |  |
|  | LC 2: Car left |  |  | V |  |  | LG 2 |  |  | Exclusive |  |
| LC 3: Car right |  |  | V |  |  | LG 2 |  |  | Exclusive |  |  |
|  | LC 4: Pedestrian |  |  | V |  |  | LG 3 |  |  | Standard |  |


Chapter 1 – The model
5 MC - 2025/14/01

It is possible to change these values if necessary, you can always go back to the factors from the national annex by
clicking ‘load default NA parameters’
6
MC – 2025/14/01

Chapter 2 – Load cases and load groups
Load cases and load groups
In the process toolbar you can find the functions to add load cases, groups and combinations.
• Load groups:
• Load cases:
• Combinations:
• Result classes:
Load groups
When opening the load groups, you will notice LG 1 is automatically created. This group contains the self-weight. The
self-weight will be neglected in this tutorial, so this load group will be used for the other permanent loads.
7 MC - 2025/14/01

Click on or to add a load groups. LG 2 will appear. LG 2 is a group of variable loads who can’t occur
together so some changes should be done.
• Change load to: ‘variable’
• Change relation to: ‘exclusive’
• Change load type to ‘Cat F: Vehicle < 30kN’
Click on or to add a load group. LG 3 will appear.
• Change the load to ‘variable’
• Change the relation to ‘standard’
• Change the load type to ‘Cat A: domestic’
8
MC – 2025/14/01

Chapter 2 – Load cases and load groups
Property ‘structure’
In this example the structure will not be changed and you can notice the value is greyed out. To be able to change this
value an extra functionality should be toggled on.
Load cases
When opening the load cases, you will notice there is one automatically generated. This is the self-weight of the
structure. The self-weight will be neglected so a few changes can be made:
• Change the description to ‘Permanent loads’
• Change the load type to ‘standard’
• The load case is already in the right load group LG 1.
9 MC - 2025/14/01

By clicking on or you can add more load cases. LC 2 will appear.
• Change the description to ‘car left’
• Change the action type to ‘Variable’
• This load case should be put in LG 2
• Other settings can be neglected in this tutorial.
10
MC – 2025/14/01


## Sayfa 11

Chapter 2 – Load cases and load groups
By clicking on or you can add more load cases. LC 3 will appear.
• Change the description to ‘car right’
• Change the action type to ‘Variable’
• This load case should be put in LG 2
• Other settings can be neglected in this tutorial.
By clicking on or you can add more load cases. LC 4 will appear.
• Change the description to ‘Pedestrian
• Change the action type to ‘Variable’
• This load case should be put in LG 3
• Other settings can be neglected in this tutorial.
11 MC - 2025/14/01

Tutorial – Loads and combinations
Load combinations
In this example the following content of combinations and partial factors will be used:
Content of combination Partial factors
LC 1 1,2
LC 2 1,5
LC 3 1,0
LC 4 0,5
There are three different types of load combinations
• Linear combination
• EN combination
• Envelope combination
Linear combination
This type of combination will only generate one combination which you can define yourself. With this option you will
not take into account the ‘relations’ defined in the load groups. If you add LC 2 and LC 3 together in this type of
combination, you will be looking at a combination where both loads occur together.
The partial factors are chosen by the user, therefore the ‘load type’ defined in the load cases will not be taken into
account.
Open the ‘combinations’. You will notice that two EN combinations are made automatically.
• Click or to add a new combination.
• Click on ‘add all’, this will add all the load cases to the combination.
• Set the type as ‘linear ultimate’
• Set the name as ‘combi1’
• Click ‘OK’
12
MC – 2025/14/01

| Content of combination |  |  | Partial factors |  |  |
| --- | --- | --- | --- | --- | --- |
|  | LC 1 |  |  | 1,2 |  |
| LC 2 |  |  | 1,5 |  |  |
|  | LC 3 |  |  | 1,0 |  |
| LC 4 |  |  | 0,5 |  |  |


Chapter 3 – Load combination
• Change the partial factors manually for this combination
The linear combination Combi1 is: 1*LC1 + 1.5*LC2 + 1*LC3 + 0.5*LC4
EN combination
This option will create all possible linear combinations according to the relations defined in the load groups. The safety
factors and Psi-factors are applied according to the Eurocode based on the type defined in the load cases.
Open ‘combinations’ and click or to add a new combination.
• Click on ‘add all’ to add all load cases to this combination
• Set the type as EN-ULS to create a new EN combination
• Change the name to Combi2
• Click ‘OK’
13 MC - 2025/14/01

Tutorial – Loads and combinations
Combi2 has become a combination which holds all possible linear combinations while taking into account the set
relations and the safety factors. This way you do not need to create all possible linear combinations manually.
• It is possible to generate all the linear combinations in Combi2 with the function ‘explode to linear’.
This function will create Combi3-24. If you look into these combinations you will notice that the type is automatically
set to Linear Ultimate (chapter 3.1). LC2 and LC3 never occur together in one combination because their relation was
set on ‘exclusive’.
In a project it is not necessary to explode an EN-ULS combination into linear combinations. When looking into the
results for combination Combi2 the maximal results from all the included linear combinations will be shown.
Property ‘structure’
The property structure in the combinations can be changed the same way as the structure of load groups. When
creating a combination with a different structure type you will only be able to add load cases which are put in a load
group with the same structure.
For example: if a Load case is added to a load group with structure ‘Footbridge’ you will not be able to add this load
case in a combination with structure ‘building’.
14
MC – 2025/14/01

Chapter 3 – Load combination
Envelope combination
This type of combination will create all possible linear combinations with the chosen load cases. The difference with EN
combinations is that the partial safety factors are user defined and not generated according to the Eurocode
Open ‘combinations’ and click or to add a new combination.
• Click ‘add all’ to add all load cases to the combination
• Set the type to ‘Envelope – ultimate’
• Change the name to ‘Combi25’
• Click ‘OK’
Combi25 becomes a combination that holds all the possible linear combinations while taking into account the defined
relationships and the user defined partial factors.
• Change the partial factors as shown in the image below
It is also possible to explode this combination to view all the linear combinations it holds. If you do this, Combi26 – 31
will be created. This time the user defined partial factors are used. This combination also makes sure LC2 and LC3 never
occur together because their relation was set as ‘exclusive’.
15 MC - 2025/14/01

Tutorial – Loads and combinations
Result classes
Result classes give you the opportunity to create an enveloping combination with an arbitrary amount of load cases
and/or combinations. When looking into the results for a result class, the maximal result will be shown from all the load
cases or combination which the class holds.
Open ‘result classes’
• Several classes are made automatically
• The class ‘All ULS’ will contain all the created linear, EN and envelope combinations created in chapter
3 and the automatic combination.
Click or to add a new result class
• Add Combi2 (EN combination) and Combi25 (Envelope combination) to the result class by selecting
them and clicking ‘add’.
• Rename the result class RC1
• Click ‘OK’
The new result class will be added to the list. You can always edit them later.
16
MC – 2025/14/01

Chapter 5 – Results
Results
Results are only available after calculation.
EN and envelope combinations
The results from EN or envelope combinations show the most positive and negative result on each section. It is only
possible to look at the results of specific combinations when the function ‘explode to linear’ was used.
The most critical combinations
Getting the most critical combinations is only possible with the combination keys shown in the ‘preview’. As an example
a piece of the bridge is modelled as a plate and loads are added to the defined load cases. When looking into the results
for Combi2 the output is set on ‘print combination key’.
Only the most critical combinations from combi2 are shown here which seems to be the combinations with load case 2
and 3 (car left and car right). The same can be done for result classes or other combinations.
17 MC - 2025/14/01

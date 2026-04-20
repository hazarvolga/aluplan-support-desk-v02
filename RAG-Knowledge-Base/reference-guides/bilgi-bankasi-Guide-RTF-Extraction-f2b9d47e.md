---
title: "Guide Rtf Extraction F2B9D47E"
category: User_Guides
source: TXT.txt
tags: [allplanYeni_Extraction, Allplan, Auto_Categorized]
---

CLOUDBASED LICENSING - ASSIGN LICENCES E.G. DIFFERENT PACKAGES OF FLOATING LICENCE FOR A SPECIFIC GROUP



Question:
You have different licence packages e.g. in the licence server, e.g. Ultimate and Concept Edition. You would like one or more users (i.e. a group) to be able to use only a specific licence package, e.g. your engineers should only use the Ultimate Edition and your architects should only use the Concept Edition and no other licence. How can this be regulated?
 
Answer:
If the user starts Allplan and your company has several different licences, a licence selection window appears in which the user determines the package scope with which he starts Allplan.

 If you want certain users to be able to select only a certain package, then as the company admin in ALLPLAN Connect, create a new entitlement and a new group under Manage and assign the desired licence package only to this one group.

Under Manage -> Licences you will see your various licence packages and add-ons sorted under your licence entitlement. As a general rule, there is only one standard entitlement at the top, a so-called ‘Default entitlement of C300123456’ and your purchased packages underneath. Your default group ‘Employees of C300123456’ is automatically assigned to this default entitlement. ALLPLAN licences and add-ons (such as the Workgroup Manager) are always assigned to a group.
 
Step 1: Create authorisation Log in to ALLPLAN Connect as a company administrator. Go to Manage -> Licences Create a new authorisation by clicking on the three dots at the top right -> Create entitlement. Enter a name for the entitlement (e.g. ‘Package Ultimate’) and click on Save.  
This new entitlement will now appear in your list. If you expand it, you will see that no licences have been assigned yet. Now click on the three dots at the top right again and this time select Move licence. First select your newly created authorisation (i.e. ‘Ultimate package’). Then, in the next step, select the licence or licences you want to move. Click on Save. This licence will now be displayed in your list under the new authorisation.

 
Step 2: Create a group and assign the entitlement Next, create a new group and assign new entitlement to this group. To do this, click on Manage -> Groups and then on Add group in the top right-hand corner.
Give the new group a name, e.g. ‘Group IngBau’ and then select the new entitlement below (in our example ‘Package Ultimate’) and click on Save.  The new group is now shown in the list. Now add the users to this group (e.g. your engineers). 

To do this, click on the three dots in the line of the group name on the far right and select Members of the group. Click on Add members.

You can also enter the names in the search field or select the users from the list. The users are added to the group by clicking on the green plus sign  on the right and selecting Add.
 
Step 3: Create and assign additional entitlement(s) and group(s)
The employees who are included in the group created above will now see both ‘their’ Ultimate licences of the ‘Engineering group’ and of course all remaining licences of the default entitlement (Default entitlement of C300123456), as they are still members of this group. This is probably not what you want. In order to control the visibilities properly, one or more entitlements and groups must now be created and assigned for the other employees, e.g. the architects (e.g. entitlement ‘Package Concept’ and group ‘Group Arch’). To do this, repeat steps 1 and 2 according to the desired number of groups or entitlements.   In the end, to stay with our example, the engineers will only see the Ultimate licences and the architects will only see the Concept licences.
Note: Please leave the default entitlement (Default entitlement of C300123456) and the default group (Employees of C300123456) in place - even if they are now empty - so that no licences can be deleted.

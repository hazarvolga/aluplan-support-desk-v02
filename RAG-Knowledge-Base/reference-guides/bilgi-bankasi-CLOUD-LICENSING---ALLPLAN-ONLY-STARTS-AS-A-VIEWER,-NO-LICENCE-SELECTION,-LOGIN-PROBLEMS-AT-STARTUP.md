---
title: "Cloud Licensing - Allplan Only Starts As A Viewer, No Licence Selection, Login Problems At Startup"
category: Troubleshooting
source: CLOUD LICENSING - ALLPLAN ONLY STARTS AS A VIEWER, NO LICENCE SELECTION, LOGIN PROBLEMS AT STARTUP.txt
tags: [allplanYeni_Extraction, Allplan, Auto_Categorized]
---

CLOUD LICENSING - ALLPLAN ONLY STARTS AS A VIEWER, NO LICENCE SELECTION, LOGIN PROBLEMS AT STARTUP



Question:
You start ALLPLAN but cannot log in, or Allplan only starts as a viewer, or the licence selection does not appear. What can you do in these cases?
 Procedure:
When you start ALLPLAN, a small window should first appear briefly with the message Wait for browser login... Then your Internet browser opens with the ALLPLAN login page, where you can enter your e-mail address and password with which you are registered in Allplan Connect. The licence selection window then appears, in which you can select your licence package so that ALLPLAN starts with the desired functions.
 
 
Answer:
 Here is what to do if this procedure does not work properly.
1. no Internet browser opens at startup and you therefore cannot log in:
In this case, the relevant websites are most likely blocked by your proxy server or virus protection.
Please pass the following on to your IT department:
 
You are probably blocking additional pop-up windows that you first have to allow. In most cases, you can allow this yourself; a note should appear at the top under the address bar Pop-up blocked. If you click on it, you can usually select “Allow”.  It is also possible that your IT has restricted Internet access. Your IT should grant you access to the following pages.
The most important APIs for Allpanstart are
login.allplan.com
license․allplan․com
bimplus․net
connect.allplan.com
 
Furthermore, we call up https pages, so port 443 must be enabled.
 
 
2. no licence selection opens, or the licences in it are not displayed, e.g. only view mode is available:
If you are logged in, your name appears at the top right. Check that your name is displayed at the top.  If not, carry out the following steps:
Close ALLPLAN and delete the following files.
You can copy the paths directly and enter them in Windows Explorer:
 
There are two paths under which settings are saved.
%ProgramData%\Nemetschek\Allplan\2025\License
Delete all the files in it.
And the second storage location is under
%AppData%\allplan
 
Also delete all the files in it.
 
 
You may need to change the settings in the Windows Explorer folder options and display all hidden folders and files there.
 
Then go to https://connect.allplan.com/ and log in to Connect. Then try Allplan Start again. The licence selection should now open again and if a licence is still free, it should be listed.
Note: If you are still using perpetual licences and have also purchased the Workgroupmanager option, you must also select this option after selecting the package.
 
3. you are not sure whether a licence is still available:
The following must be controlled with admin access via the Protal Allplan Connect.  If you have a single user licence, i.e. Namend licence, a reservation is created for the respective email address when it is used. If another user wants to use this licence, the reservation for the previous user must first be removed, see also
Transfer single user license (Named License) as of Allplan 2025 to another user
 
In the case of licence server licences, i.e. floating licences, it is possible that all available licences are already in use. In this case, a user must first terminate ALLPLAN so that the licence is free for you again.

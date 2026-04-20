---
title: "CaseStudy Porto-Metro EN web"
category: Case_Studies
source: CaseStudy_Porto-Metro_EN_web.pdf
tags: [PDF_Extraction, Allplan, Auto_Categorized]
---

Ruby Line Porto Metro
Project – 3D models in
Allplan Bridge and Allplan

Allplan in Practice

AN INNOVATIVE MINDSET –
THE RUBY LINE PORTO METRO PROJECT
The two cities of Porto and Vila Nova de Gaia are separated by the Douro River yet are inextricably linked.
As part of the Porto Metropolitan Area that makes up the second-largest urban area in Portugal, residents
often travel between the two cities.

1

Yet with such a large population, the existing five

QUADRANTE, a renowned international consulting

operational bridges – one railway, three roadway

engineering firm, is part of the Designer Consorti-

and another one with a roadway deck plus a metro

um and responsible for the design of six main works

line deck – no longer offer sufficient capacity for

packages, including the new track, new roads, four

the travel demand. To address this, Metro do Porto

viaducts, three underpasses, multiple retaining

commissioned a new, 6.5km metro line to connect

walls, and the structures of seven new stations and

the two areas, which includes a new bridge over the

platforms. One of the viaducts includes a substan-

Douro River supporting a metro line, cycle lanes,

tial partial demolition of an existing viaduct, with

and large pedestrian path. The new line will not

two new viaducts to be built beside the remaining

only provide extra capacity, but also encourage

section. Meanwhile, another viaduct will be built

more sustainable travel while supporting the area’s

over an existing major roundabout. In addition to

recovery from COVID-19.

three conventional subway stations, there are two

Viaduct A –
3D model in Allplan

­surface stations and one station that is both above

a common approach and data format for sharing

and below ground are to be designed. The track is

information is also of the utmost importance for

approximately half underground, half overground,

delivering the project successfully. Additionally,

with the tunnel design and construction being

ensuring that all the sub-models for the various

undertaken by the other member of the Designer

sections aligned between the different disciplines

Consortium. Additional works on the project – such

and partners is another crucial consideration.

as the bridge over the river – are also the responsibility of other parties. QUADRANTE commenced

In terms of QUADRANTE’s work, one of the biggest

detailed design in September 2021, with completion

challenges is the number of variations that would

expected in 2022. Construction is expected to take

need to be modeled. Because the section of track

two and a half years, opening to the public by the

traversed through tunnels, viaducts, retaining wall

end of 2025.

sections, and both above and below ground stations, there are a good number of different cross-­

Building Information Modeling (BIM) has been a

sections needing to be taken into consideration.

part of QUADRANTE’s workflow for over 7 years

Similarly, the underground tunnels also has variable

on all their architectural building projects, yet their

cross-sections. Designing the models for these

approach is unique. Rather than adding BIM to pro-

elements and creating the documentation for them

jects as an extra requirement to meet, they instead

would be a time-consuming activity. In addition,

have a mindset they call ‘Projects in BIM, not BIM

building the project in BIM meant that all models

of projects’ – or, in other words, they work in BIM

would need to be kept updated so that everyone

from the very first sketch. Having recently now

could access the current status of information as

introduced BIM on their transportation projects

and when they required.

in 2021, the Porto Metro project is one of the first
major projects where they have used Allplan Bridge

The urban location is another issue, as many of

as both their design and BIM platform – with great

the proposed designs are located in built-up areas

success.

with space constraints. For example, one of the

COMMON BIM APPROACH AND
DATA FORMAT

viaducts that QUADRANTE is responsible for is
located next to a stormwater attenuation area,
adjoining a 120-meter-long tunnel that needs
to be ­constructed using box jacking. The space

2

With such a complex project and several partners

constraints meant a solution needed to be de-

working on different sections, ensuring that each

veloped to support the hydraulic jacks during the

package of works is smoothly coordinated between

­construction phase without affecting the storm-

the different parties is critical. Therefore, agreeing

water attenuation scheme.

Viaduct C –
Plan and
longitudinal profile

The viaduct to be partially rebuilt also posed some

For example, the team used the tool to create dy-

difficult challenges, not only in aligning the new

namic cross-sections of the area that would need

viaduct sections to the remaining section, but also

to be reserved for the trains on the track. The size

as this section of carriageway must remain open

of this area depends on the gradient of the track –

during the works. Similarly, the viaduct by the

the elevation difference between the left and right

major roundabout would also need careful modeling

rails. A static table that would define the width of

and consideration of how it would be built while

the reserved area was created and imported into

minimizing disruption to traffic.

Allplan Bridge. However, when a table was required

PARAMETRIC DESIGN WITH
­ALLPLAN

that was the inverse ratio of the radius of the
curves on the static table, that was created using
the tool QUADRANTE developed and then quickly
imported into Allplan Bridge.

The team encountered some initial challenges with
structuring IFC files and organizing BIM levels.

For the track model, the team imported the near

However, this was overcome when a collective

7-kilometer-long railway alignment axis into Allplan

agreement was made between all the partners

Bridge. As it was provided in LandXML format from

involved on the project. After that, sharing files and

the rail engineers, QUADRANTE used Bimplus to

models is accomplished more easily.

import the file. To create the model, they developed
a series of cross-sections, including the track rails,

Allplan and Allplan Bridge were chosen as the

drainage, cable channels, emergency evacua-

QUADRANTE design solution not only for Open

tion areas, and the reserved area for the trains

BIM functionality, but principally for the powerful

themselves, as already mentioned above. The team

­parametric design options offered. QUADRANTE

created a combined cross-section for the different

implemented a new, parametric workflow in order

track sections by adding the cross-sections for

to develop their viaduct designs. In fact, they

the individual elements, including overground,

­further improved Allplan Bridge’s capabilities by

underground, viaduct, retaining wall, and station

creating a tool that manipulates the TCL file so the

sections. Allplan Bridge is extremely useful here, as

user can create tables of the viaduct girders in

preparing the model as well as all the documenta-

­Excel, which significantly accelerated their work-

tion and tables for the different variations along the

flow. They were then also able to use the Excel file

route would have been extremely time-consuming

for further analysis.

otherwise. In addition, keeping the model updated
and available in real-time without a BIM approach
would have been a difficult task.

3

Underpass A –
3D model in Allplan

Where the depth is not suitable for NATM tunneling

Being able to rule out clashes between existing

method, these shallower sections of tunnels were

tracks and stations, different disciplines, and ex-

designed for top-down construction. Here the

ternal sub-models is another benefit. The station

team imported the LandXML axis using Bimplus

structures were developed and exported using

again, and designed cross-­sections. They used

the tools in Allplan, and then coordinated with

PythonParts to model the piles along the walls of

other team members such as the architect, MEP

these tunnel sections as that would speed up the

designer, and other structural engineers. Then, in

modeling process rather than having to individu-

Bimplus, the team at QUADRANTE could check the

ally model each pile. Once the tunnel model was

federated model and resolve conflicts, visualize

complete, the adjacent section of the NATM-con-

the works, and implement any required changes

structed tunnel model was imported using Bimplus

directly from within Allplan. This made the process

to check that the two tunnels would line up exactly.

much more seamless as well as making it easier
to manage changes. With a complex project such

Precision was also necessary for designing the

as this with many different interactions between

substantially re-built viaduct. For this section of the

different components – both new and existing –

works, three viaducts would need to be designed

being able to effectively manage changes helped

and located in such a way as to be adjacent yet

mitigate their impact and keep the project design

without each individual structure touching. Being

process on track.

able to visualize the interaction between the three
structures without a 3D model would have been
incredibly challenging. With Allplan Bridge, however,

STRAIGHTFORWARD DESIGN
­PROCESS

the structures were designed and precisely aligned
with the existing viaduct portion without any

When choosing a BIM solution for use in their

clashes. Similarly, when planning the box jacking

special structures division, QUADRANTE evaluated

section of a tunnel, the visualization that Allplan

many different options. Through its use on the

enabled in 3D allowed the team to develop a solu-

­Porto Metro project, Allplan – and Allplan Bridge in

tion within the limited space available by importing

particular – have become essential to their daily

a terrain model of the area. The final proposal used

work. The powerful tools made the design of this

a platform to support the hydraulic jacks during

complex project much more straightforward, espe-

construction without affecting the stormwater

cially with regards to variant analysis. The structure

attenuation area.

of the program enabled options from the concept
stage to be considered more easily and with

4

left:
VIADUCT C –
3D model in Allplan
bottom:
Track model in Allplan

­significant levels of detail, even at such an ­early

The move to doing Projects in BIM has required a

stage of the process. In addition, it is especially

mindset shift for QUADRANTE’s infrastructure

useful to have a detailed model to discuss options

team, not just in terms of the process, but also

with the client during the initial design.

being open to change and flexibly adapting to a
new way of working. However, with Allplan Bridge,

The drawing production is another area that was

QUADRANTE has made a significant leap forward

accelerated thanks to Allplan. Around 100 drawings

in this area, particularly with regards to imple­

per station design are required, which would have

menting parametric design. Their innovative spirit

had to have been drawn individually using 2D

and pioneering problem-solving led to not just

methods. With Allplan, sections, elevations, and

the successful execution of this project, but new

details could be quickly and easily produced from

tools that they can implement on future works.

the model, with the added benefit of automat-

Even the traditional way of working may not be

ic updates should the model change. This made

kept for those clients who do not value BIM.

producing the construction documentation a more

This is because projects in BIM have become

straightforward process that saved a considerable

embedded in ­QUADRANTE’s approach after

amount of time.

­experiencing the benefits of it on their various
international projects, including this complex,

Effective change management is key to keeping the
project on track. When designing bridges, tunnels,
railways, and roads, there are often many changes
to the geometry – and the Porto Metro project is
no exception. The functionality that Allplan offers
significantly reduced the impact of changes on the
schedule, particularly during the concept phase
when many different variants are being explored.
However, producing more detailed models (LOD
300) earlier in the design phase also helped reduce
changes further along in the process. Having the
model geometry already prepared at the concept
stage provided time savings from the very start
of the project, as it was easier to adapt should any
changes be needed. Subsequent design activities
were more efficient, and it was easier for the team
to finalize their detailed designs.

5

­multi-faceted new metro line.

“The move to doing projects in BIM
has required a mindset shift for
­QUADRANTE’s infrastructure team, not
just in terms of the process, but also
being open to change and flexibly adapting to a new way of working. However,
with Allplan Bridge, we have made a
significant leap forward in this area.”
José Rolo Duarte,
Operations Director – Transports,
­QUADRANTE, Portugal

ABOUT QUADRANTE
Founded in 1998, QUADRANTE is a global Engineer-

As a multidisciplinary consulting and design

ing and Architecture consulting and design group

group in Engineering, Architecture, Environment

covering services in the following fields of exper-

and Sustainability, we take a holistic view of the

tise: buildings, transports, industry and energy, wa-

construction sector, and develop an integrated and

ter utilities, environment, airports and construction

evolutionary sustainability research in the design of

management and supervision.

our buildings and infrastructures.

At QUADRANTE we aim to improve the sus-

Driven by more than 250 experts working across

tain-ability performance of our projects and ser-

three continents (Europe, Africa, and Latin Amer-

vices, with the purpose to partner with our Clients

ica), our mission is focused on the continuous

to Create and Build Sustainable, Responsible and

pursue for sustainable, economically optimized

Long- Lasting Infrastructures for a better world.

and technically advanced solutions – DESIGNING .
DELIVERING . ADDING VALUE.

ABOUT ALLPLAN
ALLPLAN is a global provider of BIM design soft-

support interdisciplinary collaboration on ­building

ware for the AEC industry. True to our “Design

and civil engineering projects. Around the world

to Build” claim, we cover the process from the

over 500 dedicated employees continue to ­write

first concept to final detailed design for the con-

the ­ALLPLAN success story. Headquartered

struction site and for prefabrication. Allplan users

in Munich, Germany, ALLPLAN is part of the

create deliverables of the highest quality and

­Nemetschek Group which is a pioneer for digital

level of detail thanks to lean workflows. ­ALLPLAN

transformation in the construction sector.

offers powerful integrated cloud technology to
ALLPLAN GmbH
Konrad-Zuse-Platz 1
81829 Munich
Germany
info@allplan.com
allplan.com

6

©2022 ALLPLAN GmbH, Munich, Germany | © Pictures: QUADRANTE


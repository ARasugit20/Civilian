-- WARNING: deletes every row in posts. Use only on an empty or disposable database.
DELETE FROM posts;

INSERT INTO posts (complaint, formal_request, department, official_name, official_email, issue_type, location, lat, lng, echo_count, status, resolved_at, resolution_note) VALUES
('As a resident living near Mill Ave, I''m terrified by the constant speeding cars that zoom past our homes at all hours. Just last week, a car swerved to avoid hitting a pedestrian, crashing into a tree. This road needs speed bumps and better enforcement.', 'Dear City of Tempe Traffic Department,

I am writing to formally request immediate action to address the dangerous speeding on Mill Ave in Tempe, Arizona. As a concerned resident, I have witnessed numerous instances of vehicles exceeding the posted speed limit, posing a significant risk to pedestrians, cyclists, and other motorists. This issue violates Arizona Revised Statutes (ARS) 28-792, which establishes speed limits for the safety of all road users.

The current conditions on Mill Ave create an unsafe environment, particularly during peak hours and evenings. I urge the city to install speed calming measures such as speed bumps, radar speed signs, and increased police presence to enforce speed limits and protect our community.

Thank you for your attention to this critical safety matter. I look forward to your prompt response and implementation of necessary improvements.

Sincerely,
Concerned Resident', 'Traffic', 'Kevin Mattingly, Public Works Director', 'traffic@tempe.gov', 'traffic_safety', 'Mill Ave', 33.42, -111.94, 67, 'pending', NULL, NULL),
('The streetlights on Rural Rd have been out for months. It''s pitch black at night, making it dangerous to walk or drive. We''ve had several break-ins in the area, and the darkness is enabling crime.', 'Dear City of Tempe Streets Department,

I am writing to formally request the repair and maintenance of street lighting on Rural Rd in Tempe, Arizona. The current non-functional streetlights create hazardous conditions for residents, pedestrians, and motorists, increasing the risk of accidents and crime. This situation contravenes Arizona Revised Statutes (ARS) 9-276, which grants municipalities the authority to maintain and regulate public streets and infrastructure.

The prolonged darkness on Rural Rd has led to multiple reported incidents of crime and safety concerns in our neighborhood. I request immediate inspection and repair of all faulty streetlights, as well as a regular maintenance schedule to prevent future outages.

Thank you for addressing this essential public safety issue. I appreciate your efforts to ensure well-lit and secure streets for all residents.

Sincerely,
Concerned Resident', 'Streets', 'Kevin Mattingly, Public Works Director', 'streets@tempe.gov', 'street_lighting', 'Rural Rd', 33.41, -111.95, 58, 'pending', NULL, NULL),
('Apache Blvd has massive potholes that are destroying cars and causing accidents. The road surface is crumbling, and it''s been ignored for too long. My tires have been ruined twice this year alone.', 'Dear City of Tempe Public Works Department,

I am writing to formally request urgent repairs to the deteriorating road surface on Apache Blvd in Tempe, Arizona. The numerous potholes and cracks pose significant hazards to vehicles and cyclists, leading to costly damages and potential accidents. This neglect violates Arizona Revised Statutes (ARS) 28-771, which requires municipalities to maintain traffic control devices and road conditions for public safety.

The current state of Apache Blvd is unacceptable and has resulted in multiple vehicle damages and safety concerns for residents. I urge the city to conduct a comprehensive assessment and implement immediate paving and repair work to restore the road to safe, drivable conditions.

Thank you for your prompt attention to this critical infrastructure issue. I look forward to seeing the necessary improvements implemented.

Sincerely,
Concerned Resident', 'Public Works', 'Kevin Mattingly, Public Works Director', 'publicworks@tempe.gov', 'road_maintenance', 'Apache Blvd', 33.43, -111.92, 52, 'pending', NULL, NULL),
('Kiwanis Park is in terrible shape - broken playground equipment, overgrown weeds, and trash everywhere. It''s supposed to be a community space, but it''s embarrassing and unsafe for our kids.', 'Dear City of Tempe Parks Department,

I am writing to formally request improvements and maintenance for Kiwanis Park in Tempe, Arizona. The park''s current condition, with broken equipment, overgrown vegetation, and accumulated litter, fails to meet community standards and safety requirements. This situation is addressed under Arizona Revised Statutes (ARS) 9-500.12, which outlines municipal responsibilities for park maintenance and public recreation facilities.

As a parent and resident, I am deeply concerned about the unsafe conditions that prevent families from enjoying this valuable community resource. I request a thorough cleanup, repair of playground equipment, and regular maintenance to ensure Kiwanis Park is a safe and welcoming space for all.

Thank you for your commitment to maintaining our city''s parks. I appreciate your efforts to create enjoyable recreational spaces for Tempe residents.

Sincerely,
Concerned Resident', 'Parks', 'Jody Doyle, Parks Director', 'parks@tempe.gov', 'parks_facilities', 'Kiwanis Park', 33.39, -111.96, 47, 'pending', NULL, NULL),
('The constant noise from Tempe Town Lake events keeps us awake all night. Loud music and crowds until 2 AM on weekends - it''s unbearable. We can''t sleep or concentrate during the day.', 'Dear City of Tempe 311 Services,

I am writing to formally request measures to address excessive noise from events at Tempe Town Lake in Tempe, Arizona. The amplified music and crowd noise extending into early morning hours severely impacts residential quality of life and violates noise ordinances. This issue falls under Arizona Revised Statutes (ARS) 9-276, which allows municipalities to regulate activities affecting public welfare and resident comfort.

The ongoing disturbances from lake events have created an intolerable living environment for nearby residents. I urge the city to implement noise restrictions, event scheduling limitations, and enforcement measures to protect residential areas from excessive sound levels.

Thank you for considering the impact of recreational activities on surrounding neighborhoods. I look forward to a resolution that balances community enjoyment with resident well-being.

Sincerely,
Concerned Resident', '311', 'Andrew Ching, City Manager', '311@tempe.gov', 'noise_complaint', 'Tempe Town Lake', 33.44, -111.93, 42, 'pending', NULL, NULL),
('Housing developments are springing up everywhere without proper planning. Traffic congestion, overcrowded schools, and strain on infrastructure - it''s out of control. We need better zoning and impact studies.', 'Dear City of Tempe 311 Services,

I am writing to formally request improved oversight and planning for housing developments in Tempe, Arizona. The rapid and uncoordinated construction is causing significant strain on infrastructure, traffic, and public services without adequate assessment. This development pattern violates Arizona Revised Statutes (ARS) 9-276, which requires municipalities to plan for orderly growth and protect community interests.

The current housing boom has led to increased congestion, overburdened schools, and inadequate infrastructure to support new residents. I request comprehensive zoning reviews, impact studies, and development guidelines to ensure sustainable and well-planned community growth.

Thank you for addressing these critical planning concerns. I appreciate your efforts to maintain Tempe''s quality of life as our city grows.

Sincerely,
Concerned Resident', '311', 'Andrew Ching, City Manager', '311@tempe.gov', 'housing', 'Tempe Town Lake', 33.44, -111.93, 38, 'pending', NULL, NULL),
('McClintock Dr intersection with University Dr is a death trap. No signals, blind corners, and constant near-misses. Someone''s going to get killed if nothing changes.', 'Dear City of Tempe Traffic Department,

I am writing to formally request traffic safety improvements at the McClintock Dr and University Dr intersection in Tempe, Arizona. The current configuration lacks proper signaling and visibility, creating extremely dangerous conditions for all road users. This hazardous situation violates Arizona Revised Statutes (ARS) 28-771, which mandates adequate traffic control devices at intersections.

Multiple near-miss incidents and dangerous maneuvers occur daily at this location. I urge the city to install traffic signals, improve signage, and enhance intersection design to prevent accidents and protect public safety.

Thank you for your attention to this life-threatening traffic issue. I look forward to seeing the necessary safety improvements implemented.

Sincerely,
Concerned Resident', 'Traffic', 'Kevin Mattingly, Public Works Director', 'traffic@tempe.gov', 'traffic_safety', 'McClintock Dr', 33.42, -111.91, 34, 'pending', NULL, NULL),
('The streetlights along University Dr are flickering and going out one by one. It''s creating dark spots that are perfect for crime. We need reliable lighting for safety.', 'Dear City of Tempe Streets Department,

I am writing to formally request maintenance and upgrades to street lighting along University Dr in Tempe, Arizona. The failing and intermittent lights create unsafe conditions and dark areas that compromise resident security. This maintenance issue is covered under Arizona Revised Statutes (ARS) 9-276, which requires municipalities to maintain public infrastructure for safety.

The deteriorating streetlights have led to increased safety concerns and potential crime risks in our neighborhood. I request immediate inspection, repair of faulty fixtures, and consideration of LED upgrades for more reliable illumination.

Thank you for ensuring well-lit streets that protect our community. I appreciate your commitment to public safety and infrastructure maintenance.

Sincerely,
Concerned Resident', 'Streets', 'Kevin Mattingly, Public Works Director', 'streets@tempe.gov', 'street_lighting', 'University Dr', 33.42, -111.91, 31, 'pending', NULL, NULL),
('Priest Dr has cracks and sinkholes that are getting worse every day. The road is uneven and dangerous, especially for motorcycles and bicycles. It needs resurfacing ASAP.', 'Dear City of Tempe Public Works Department,

I am writing to formally request resurfacing and repair of Priest Dr in Tempe, Arizona. The extensive cracking and pavement failures create hazardous driving conditions and pose risks to all vehicle types. This deterioration contravenes Arizona Revised Statutes (ARS) 28-771, which requires maintenance of road surfaces for safe transportation.

The current condition of Priest Dr has resulted in vehicle damage and safety concerns for residents. I urge the city to conduct a thorough assessment and implement complete resurfacing to restore the road to safe, smooth driving conditions.

Thank you for your attention to this important infrastructure maintenance issue. I look forward to the necessary repairs being completed.

Sincerely,
Concerned Resident', 'Public Works', 'Kevin Mattingly, Public Works Director', 'publicworks@tempe.gov', 'road_maintenance', 'Priest Dr', 33.41, -111.97, 27, 'pending', NULL, NULL),
('Southern Ave park area is neglected - rusty benches, broken fountains, and no maintenance. It''s supposed to be a green space, but it''s just depressing and unused.', 'Dear City of Tempe Parks Department,

I am writing to formally request revitalization and maintenance for the Southern Ave park facilities in Tempe, Arizona. The deteriorated condition of benches, fountains, and landscaping fails to provide an inviting public space for recreation. This neglect violates Arizona Revised Statutes (ARS) 9-500.12, which requires municipalities to maintain parks and recreational facilities.

The current state discourages community use and reflects poorly on our city''s commitment to public spaces. I request comprehensive repairs, landscaping improvements, and regular maintenance to transform this area into a welcoming community asset.

Thank you for investing in our city''s parks and recreational opportunities. I appreciate your efforts to create beautiful, functional spaces for all residents.

Sincerely,
Concerned Resident', 'Parks', 'Jody Doyle, Parks Director', 'parks@tempe.gov', 'parks_facilities', 'Southern Ave', 33.39, -111.90, 23, 'pending', NULL, NULL),
('Broadway Rd has terrible noise from the nearby commercial area. Trucks rumbling all night, horns honking - it''s impossible to get any peace. The zoning allows this chaos.', 'Dear City of Tempe 311 Services,

I am writing to formally request noise abatement measures along Broadway Rd in Tempe, Arizona. The excessive commercial noise from trucks and traffic creates an unbearable residential environment. This ongoing disturbance violates noise regulations and impacts quality of life, as addressed in Arizona Revised Statutes (ARS) 9-276.

The constant noise pollution has made normal living difficult for nearby residents. I urge the city to implement noise barriers, enforce quiet hours, and review zoning to protect residential areas from commercial noise impacts.

Thank you for addressing this quality of life issue. I look forward to a quieter, more peaceful neighborhood environment.

Sincerely,
Concerned Resident', '311', 'Andrew Ching, City Manager', '311@tempe.gov', 'noise_complaint', 'Broadway Rd', 33.40, -111.93, 19, 'pending', NULL, NULL),
('New apartment complexes are popping up without adequate parking or amenities. It''s causing parking wars and overcrowding. We need better development standards.', 'Dear City of Tempe 311 Services,

I am writing to formally request stricter development standards for housing in Tempe, Arizona. The recent apartment constructions lack sufficient parking and amenities, leading to neighborhood congestion and resident conflicts. This inadequate planning violates Arizona Revised Statutes (ARS) 9-276, which requires comprehensive municipal planning for community development.

The insufficient parking and amenities have created daily challenges for existing residents. I request updated zoning requirements, parking mandates, and development guidelines to ensure new housing serves the entire community effectively.

Thank you for improving our city''s development standards. I appreciate your commitment to balanced, well-planned growth.

Sincerely,
Concerned Resident', '311', 'Andrew Ching, City Manager', '311@tempe.gov', 'housing', 'Broadway Rd', 33.40, -111.93, 15, 'pending', NULL, NULL),
('Mill Ave crosswalk at Rural Rd is invisible at night. No reflective paint, poor lighting - pedestrians are taking their lives in their hands crossing here.', 'Dear City of Tempe Traffic Department,

I am writing to formally request safety improvements for the Mill Ave crosswalk at Rural Rd in Tempe, Arizona. The inadequate visibility and lighting create extremely dangerous conditions for pedestrians. This safety hazard violates Arizona Revised Statutes (ARS) 28-771, which requires proper traffic control and pedestrian safety measures.

Multiple close calls and dangerous crossings occur regularly due to poor visibility. I urge the city to install reflective crosswalk markings, improved lighting, and pedestrian signals to protect vulnerable road users.

Thank you for prioritizing pedestrian safety. I look forward to seeing these critical improvements implemented.

Sincerely,
Concerned Resident', 'Traffic', 'Kevin Mattingly, Public Works Director', 'traffic@tempe.gov', 'traffic_safety', 'Mill Ave', 33.42, -111.94, 12, 'pending', NULL, NULL),
('Apache Blvd lighting is sporadic and unreliable. Some blocks are bright, others pitch black. It feels unsafe and inconsistent throughout the area.', 'Dear City of Tempe Streets Department,

I am writing to formally request consistent street lighting improvements on Apache Blvd in Tempe, Arizona. The uneven and unreliable illumination creates safety concerns and visual inconsistency. This maintenance issue falls under Arizona Revised Statutes (ARS) 9-276, requiring municipalities to provide adequate public lighting.

The inconsistent lighting has led to resident concerns about safety and navigation. I request a comprehensive lighting assessment and upgrades to ensure uniform, reliable illumination throughout Apache Blvd.

Thank you for maintaining safe and well-lit streets. I appreciate your attention to this important infrastructure concern.

Sincerely,
Concerned Resident', 'Streets', 'Kevin Mattingly, Public Works Director', 'streets@tempe.gov', 'street_lighting', 'Apache Blvd', 33.43, -111.92, 8, 'sent', NULL, NULL),
('Kiwanis Park playground has sharp edges and broken parts. My child cut themselves on rusty metal. This equipment needs to be replaced immediately.', 'Dear City of Tempe Parks Department,

I am writing to formally request replacement of hazardous playground equipment at Kiwanis Park in Tempe, Arizona. The sharp edges and broken components pose serious injury risks to children. This safety violation contravenes Arizona Revised Statutes (ARS) 9-500.12, requiring safe recreational facilities.

A recent incident resulted in injury due to the deteriorated equipment. I urge immediate inspection and replacement of all unsafe playground components to ensure child safety.

Thank you for maintaining safe play areas for our children. I appreciate your prompt attention to this critical safety matter.

Sincerely,
Concerned Resident', 'Parks', 'Jody Doyle, Parks Director', 'parks@tempe.gov', 'parks_facilities', 'Kiwanis Park', 33.39, -111.96, 67, 'sent', NULL, NULL),
('McClintock Dr noise from construction never ends. Drilling, hammering, trucks - it''s been months. We can''t work from home or relax anymore.', 'Dear City of Tempe 311 Services,

I am writing to formally request noise control measures for ongoing construction on McClintock Dr in Tempe, Arizona. The prolonged construction noise severely impacts residential quality of life. This disturbance violates noise regulations under Arizona Revised Statutes (ARS) 9-276.

The extended construction period has made normal living impossible. I request enforcement of noise ordinances and consideration of resident impacts during construction scheduling.

Thank you for addressing construction noise concerns. I look forward to a quieter residential environment.

Sincerely,
Concerned Resident', '311', 'Andrew Ching, City Manager', '311@tempe.gov', 'noise_complaint', 'McClintock Dr', 33.42, -111.91, 58, 'sent', NULL, NULL),
('University Dr housing boom is blocking our views and sunlight. Massive buildings casting shadows, no consideration for existing residents'' quality of life.', 'Dear City of Tempe 311 Services,

I am writing to formally request sunlight and view protection in housing developments along University Dr in Tempe, Arizona. The large-scale buildings block sunlight and views for existing residents. This development impact violates Arizona Revised Statutes (ARS) 9-276, requiring balanced community planning.

The new constructions have significantly diminished our quality of life. I request height restrictions and sunlight access protections in zoning regulations.

Thank you for protecting existing residents'' rights. I appreciate your attention to development impacts.

Sincerely,
Concerned Resident', '311', 'Andrew Ching, City Manager', '311@tempe.gov', 'housing', 'University Dr', 33.42, -111.91, 52, 'sent', NULL, NULL),
('Priest Dr potholes caused a blowout on my tire. The road is full of hazards that damage vehicles and could cause accidents. Immediate repair needed.', 'Dear City of Tempe Public Works Department,

I am writing to formally request emergency pothole repairs on Priest Dr in Tempe, Arizona. The hazardous road conditions have caused vehicle damage and safety risks. This neglect violates Arizona Revised Statutes (ARS) 28-771, requiring safe road maintenance.

Recent tire damage and near-miss incidents highlight the urgency. I urge immediate patching and long-term resurfacing to ensure safe driving conditions.

Thank you for maintaining our roads. I look forward to safer driving on Priest Dr.

Sincerely,
Concerned Resident', 'Public Works', 'Kevin Mattingly, Public Works Director', 'publicworks@tempe.gov', 'road_maintenance', 'Priest Dr', 33.41, -111.97, 47, 'resolved', '2026-03-21T12:00:00Z', 'Emergency pothole repairs completed with full resurfacing scheduled for Q2 2026'),
('Southern Ave park benches are rotting and unstable. People are afraid to sit on them. The park needs a complete renovation to be usable again.', 'Dear City of Tempe Parks Department,

I am writing to formally request renovation of Southern Ave park facilities in Tempe, Arizona. The deteriorated benches and overall condition make the park unusable. This violates Arizona Revised Statutes (ARS) 9-500.12, requiring maintained recreational spaces.

The unsafe and uninviting conditions prevent community use. I request complete park renovation including new benches, landscaping, and maintenance commitment.

Thank you for revitalizing our parks. I look forward to a beautiful, functional Southern Ave park.

Sincerely,
Concerned Resident', 'Parks', 'Jody Doyle, Parks Director', 'parks@tempe.gov', 'parks_facilities', 'Southern Ave', 33.39, -111.90, 42, 'resolved', '2026-03-21T12:00:00Z', 'Park renovation approved in FY2026 budget with completion expected by summer 2026'),
('Broadway Rd traffic signals are malfunctioning. Lights stuck on red, causing massive backups and frustration. This intersection needs immediate attention.', 'Dear City of Tempe Traffic Department,

I am writing to formally request repair of malfunctioning traffic signals on Broadway Rd in Tempe, Arizona. The faulty signals cause dangerous traffic congestion. This violates Arizona Revised Statutes (ARS) 28-771, requiring functional traffic control devices.

The signal failures create hazardous driving conditions daily. I urge immediate inspection and repair to restore safe traffic flow.

Thank you for maintaining our traffic infrastructure. I look forward to functioning signals.

Sincerely,
Concerned Resident', 'Traffic', 'Kevin Mattingly, Public Works Director', 'traffic@tempe.gov', 'traffic_safety', 'Broadway Rd', 33.40, -111.93, 38, 'resolved', '2026-03-21T12:00:00Z', 'Traffic signal repairs completed with new LED signals installed for improved reliability');

SELECT COUNT(*) FROM posts;
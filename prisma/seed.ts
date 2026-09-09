import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding STRIDE database with demo fictional data...');

  // Clean existing data in reverse order of dependencies
  await prisma.rescueAssignment.deleteMany();
  await prisma.emergencyCondition.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.emergencyStatus.deleteMany();
  await prisma.expectedLocation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.affectedZone.deleteMany();
  await prisma.householdMember.deleteMany();
  await prisma.household.deleteMany();
  await prisma.road.deleteMany();
  await prisma.emergencyFacility.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.priorityConfiguration.deleteMany();
  await prisma.disasterEvent.deleteMany();
  await prisma.user.deleteMany();

  // 1. Priority Configurations
  const defaultWeights = [
    { conditionType: 'FIRE', weight: 30 },
    { conditionType: 'HEAVILY_INJURED', weight: 25 },
    { conditionType: 'SERIOUSLY_UNWELL', weight: 20 },
    { conditionType: 'TRAPPED', weight: 20 },
    { conditionType: 'WATER_RISING', weight: 15 },
    { conditionType: 'NEED_RESCUE', weight: 15 },
    { conditionType: 'CHILDREN_INFANTS_PRESENT', weight: 10 },
    { conditionType: 'PHYSICALLY_DISABLED', weight: 10 },
    { conditionType: 'OTHER', weight: 5 },
  ];

  for (const w of defaultWeights) {
    await prisma.priorityConfiguration.create({ data: w });
  }

  // 2. Users (1 Rescuer + 10+ Citizens)
  const defaultPassword = await bcrypt.hash('stride123', 10);

  const rescuer = await prisma.user.create({
    data: {
      name: 'Capt. Vikram Rathore',
      testIdentityNumber: 'RES-88210',
      mobileNumber: '9880011223',
      password: defaultPassword,
      role: 'RESCUER',
    },
  });

  const citizensData = [
    { name: 'Arun Kumar', idNum: 'CIT-10001', phone: '9840112345' },
    { name: 'Meera Nambiar', idNum: 'CIT-10002', phone: '9840112346' },
    { name: 'Rajesh Patel', idNum: 'CIT-10003', phone: '9840112347' },
    { name: 'Sunita Rao', idNum: 'CIT-10004', phone: '9840112348' },
    { name: 'David Fernandez', idNum: 'CIT-10005', phone: '9840112349' },
    { name: 'Ananya Sen', idNum: 'CIT-10006', phone: '9840112350' },
    { name: 'Karthik Iyer', idNum: 'CIT-10007', phone: '9840112351' },
    { name: 'Fatima Sheikh', idNum: 'CIT-10008', phone: '9840112352' },
    { name: 'Gurpreet Singh', idNum: 'CIT-10009', phone: '9840112353' },
    { name: 'Deepa Verma', idNum: 'CIT-10010', phone: '9840112354' },
    { name: 'Rohan Deshmukh', idNum: 'CIT-10011', phone: '9840112355' },
  ];

  const citizenUsers = [];
  for (const c of citizensData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        testIdentityNumber: c.idNum,
        mobileNumber: c.phone,
        password: defaultPassword,
        role: 'CITIZEN',
      },
    });
    citizenUsers.push(user);
  }

  // 3. Shelters (3+ shelters demonstrating: AVAILABLE, NEAR_CAPACITY, OVER_CAPACITY)
  const shelterNorth = await prisma.shelter.create({
    data: {
      name: 'North Heights Community Center',
      address: '102 Hilltop Boulevard, Sector 1',
      latitude: 13.098,
      longitude: 80.265,
      capacity: 40,
      contactNumber: '+91 44 2498 1001',
      status: 'ACTIVE',
    },
  });

  const shelterCenter = await prisma.shelter.create({
    data: {
      name: 'City Central Indoor Sports Arena',
      address: '14 Stadium Road, Civil Lines',
      latitude: 13.085,
      longitude: 80.282,
      capacity: 10,
      contactNumber: '+91 44 2498 1002',
      status: 'ACTIVE',
    },
  });

  const shelterEast = await prisma.shelter.create({
    data: {
      name: 'East Pier Municipal High School',
      address: '88 Lighthouse Street, Ward 9',
      latitude: 13.076,
      longitude: 80.289,
      capacity: 6,
      contactNumber: '+91 44 2498 1003',
      status: 'ACTIVE',
    },
  });

  const shelterWest = await prisma.shelter.create({
    data: {
      name: 'Westside College Auditorium',
      address: '45 Knowledge Park, Campus Gate 2',
      latitude: 13.07,
      longitude: 80.252,
      capacity: 50,
      contactNumber: '+91 44 2498 1004',
      status: 'ACTIVE',
    },
  });

  // 4. Emergency Facilities (2 Hospitals, 2 Fire Stations, 2 Police Stations, 2 Checkpoints)
  const facilitiesData = [
    {
      name: 'Apollo Lifeline Emergency Hospital',
      type: 'HOSPITAL',
      address: '21 Health City Avenue, Ward 4',
      latitude: 13.084,
      longitude: 80.274,
      contactNumber: '+91 44 2829 0200',
    },
    {
      name: 'Metro General Trauma & Acute Care',
      type: 'HOSPITAL',
      address: '500 Central Hospital Road',
      latitude: 13.079,
      longitude: 80.267,
      contactNumber: '+91 44 2829 0300',
    },
    {
      name: 'Central Fire & Disaster Rescue Station #4',
      type: 'FIRE_STATION',
      address: '9 Engine House Road, Sector 3',
      latitude: 13.089,
      longitude: 80.266,
      contactNumber: '+91 44 2844 0101',
    },
    {
      name: 'Harbor Waterfront Quick Response Fire Unit',
      type: 'FIRE_STATION',
      address: '3 Marine Drive, Port Gate 1',
      latitude: 13.073,
      longitude: 80.276,
      contactNumber: '+91 44 2844 0102',
    },
    {
      name: 'Coastal Police Precinct 12',
      type: 'POLICE_STATION',
      address: '12 Beach Road, Zone A',
      latitude: 13.085,
      longitude: 80.261,
      contactNumber: '+91 44 2345 2001',
    },
    {
      name: 'Metro Central Police Headquarters',
      type: 'POLICE_STATION',
      address: '1 Civic Square, Old Town',
      latitude: 13.077,
      longitude: 80.28,
      contactNumber: '+91 44 2345 2002',
    },
    {
      name: 'North River Bridge Disaster Checkpoint',
      type: 'CHECKPOINT',
      address: 'River Causeway North Ingress',
      latitude: 13.092,
      longitude: 80.271,
      contactNumber: '+91 44 2345 3001',
    },
    {
      name: 'South Ring Bypass Perimeter Checkpoint',
      type: 'CHECKPOINT',
      address: 'NH-45 Interchange Outpost',
      latitude: 13.067,
      longitude: 80.264,
      contactNumber: '+91 44 2345 3002',
    },
  ];

  for (const f of facilitiesData) {
    await prisma.emergencyFacility.create({ data: f });
  }

  // 5. Demo Roads
  const roadsData = [
    {
      name: 'Eastern Coastal Arterial Highway',
      status: 'OPEN',
      coordinatesJson: JSON.stringify([
        [13.065, 80.285],
        [13.075, 80.284],
        [13.085, 80.281],
        [13.095, 80.279],
      ]),
    },
    {
      name: 'River Basin Causeway Route',
      status: 'FLOODED',
      coordinatesJson: JSON.stringify([
        [13.074, 80.262],
        [13.08, 80.268],
        [13.084, 80.273],
      ]),
    },
    {
      name: 'Old Canal Bypass Road',
      status: 'BLOCKED',
      coordinatesJson: JSON.stringify([
        [13.071, 80.27],
        [13.077, 80.273],
        [13.082, 80.276],
      ]),
    },
    {
      name: 'North-West Relief Transit Corridor',
      status: 'RESTRICTED',
      coordinatesJson: JSON.stringify([
        [13.09, 80.258],
        [13.093, 80.265],
        [13.098, 80.27],
      ]),
    },
  ];

  for (const r of roadsData) {
    await prisma.road.create({ data: r });
  }

  // 6. Disaster Event (1 Flood Disaster)
  const now = new Date();
  const startTime = new Date(now.getTime() + 18 * 60 * 60 * 1000); // 18 hours ahead (within 30h reconfirmation window!)
  const endTime = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const floodDisaster = await prisma.disasterEvent.create({
    data: {
      type: 'FLOOD',
      title: 'Monsoon Flash Flood Warning - River Basin Zone',
      description:
        'Continuous torrential rainfall exceeding 220mm forecast along River Basin. Rapid water level rise imminent in low-lying wards.',
      alertLevel: 'RED',
      predictedStartTime: startTime,
      predictedEndTime: endTime,
      status: 'ACTIVE', // Active to enable both BEFORE & DURING features in demo
      createdById: rescuer.id,
    },
  });

  // 7. Affected Zone with polygon covering the low-lying basin
  const polygonCoords = [
    [13.072, 80.262],
    [13.092, 80.264],
    [13.095, 80.282],
    [13.078, 80.286],
    [13.07, 80.274],
  ];

  const affectedZone = await prisma.affectedZone.create({
    data: {
      disasterId: floodDisaster.id,
      name: 'Basin Delta Inundation Sector A',
      riskLevel: 'HIGH',
      polygonGeoJson: JSON.stringify(polygonCoords),
      radiusKm: 4.5,
    },
  });

  // 8. Households & Members (Diverse compositions: Adults, Children, Elderly)
  // Some inside affected zone, some outside
  const householdsData = [
    {
      user: citizenUsers[0],
      name: 'Building A-182, Flat 401',
      address: '182 Riverside Drive, Low Basin Ward',
      city: 'Coastal Metro',
      lat: 13.0827,
      lng: 80.2707, // Inside affected polygon
      members: [
        { name: 'Arun Kumar', age: 38, rel: 'Self', cat: 'ADULT' },
        { name: 'Priya Kumar', age: 36, rel: 'Spouse', cat: 'ADULT' },
        { name: 'Aarav Kumar', age: 8, rel: 'Child', cat: 'CHILD' },
        { name: 'Kavita Kumar', age: 71, rel: 'Parent', cat: 'ELDERLY' },
      ],
    },
    {
      user: citizenUsers[1],
      name: 'Building A-182, Flat 202',
      address: '182 Riverside Drive, Low Basin Ward',
      city: 'Coastal Metro',
      lat: 13.0827,
      lng: 80.2707, // Inside affected polygon (same building to test building aggregations!)
      members: [
        { name: 'Meera Nambiar', age: 29, rel: 'Self', cat: 'ADULT' },
        { name: 'Sanjay Nambiar', age: 31, rel: 'Spouse', cat: 'ADULT' },
        { name: 'Tara Nambiar', age: 3, rel: 'Child', cat: 'CHILD' },
      ],
    },
    {
      user: citizenUsers[2],
      name: 'Riverside Enclave, Block C-12',
      address: '88 Canal Promenade, Ward 4',
      city: 'Coastal Metro',
      lat: 13.0845,
      lng: 80.2735, // Inside affected polygon
      members: [
        { name: 'Rajesh Patel', age: 45, rel: 'Self', cat: 'ADULT' },
        { name: 'Geeta Patel', age: 43, rel: 'Spouse', cat: 'ADULT' },
        { name: 'Ramesh Patel', age: 74, rel: 'Parent', cat: 'ELDERLY' },
        { name: 'Lata Patel', age: 70, rel: 'Parent', cat: 'ELDERLY' },
      ],
    },
    {
      user: citizenUsers[3],
      name: 'Greenwood Apartments, Flat 104',
      address: '24 South Ridge Road, Ward 7',
      city: 'Coastal Metro',
      lat: 13.076,
      lng: 80.269, // Inside affected polygon
      members: [
        { name: 'Sunita Rao', age: 34, rel: 'Self', cat: 'ADULT' },
        { name: 'Aditi Rao', age: 6, rel: 'Child', cat: 'CHILD' },
      ],
    },
    {
      user: citizenUsers[4],
      name: 'Highland Towers, Apt 8B',
      address: '99 North Hilltop Highway, Sector 1',
      city: 'Coastal Metro',
      lat: 13.11,
      lng: 80.292, // Outside polygon (SAFE / UNAFFECTED)
      members: [
        { name: 'David Fernandez', age: 41, rel: 'Self', cat: 'ADULT' },
        { name: 'Maria Fernandez', age: 39, rel: 'Spouse', cat: 'ADULT' },
        { name: 'Lucas Fernandez', age: 12, rel: 'Child', cat: 'CHILD' },
      ],
    },
    {
      user: citizenUsers[5],
      name: 'Palm Grove Residency, Villa 7',
      address: '15 West Orchard Lane, Greenfield',
      city: 'Coastal Metro',
      lat: 13.055,
      lng: 80.245, // Outside polygon (SAFE / UNAFFECTED)
      members: [
        { name: 'Ananya Sen', age: 28, rel: 'Self', cat: 'ADULT' },
        { name: 'Debashis Sen', age: 67, rel: 'Parent', cat: 'ELDERLY' },
      ],
    },
  ];

  const createdMembers = [];

  for (const hData of householdsData) {
    const household = await prisma.household.create({
      data: {
        userId: hData.user.id,
        name: hData.name,
        address: hData.address,
        city: hData.city,
        state: 'Tamil Nadu',
        latitude: hData.lat,
        longitude: hData.lng,
        members: {
          create: hData.members.map((m) => ({
            name: m.name,
            age: m.age,
            relationship: m.rel,
            category: m.cat,
          })),
        },
      },
      include: { members: true },
    });

    createdMembers.push(...household.members);
  }

  // 9. Expected Locations demonstrating all types:
  // HOME, SHELTER (targeting different shelters to show capacity statuses), OTHER_CITY, UNKNOWN
  // Also demonstrates shelter capacity states:
  // East Pier Municipal High School (capacity 6): 7 people choosing it -> OVER_CAPACITY (expected 7, remaining -1)
  // City Central Indoor Sports Arena (capacity 10): 8 people choosing it -> NEAR_CAPACITY (expected 8, remaining 2)
  // North Heights Community Center (capacity 40): 3 people choosing it -> AVAILABLE (expected 3, remaining 37)

  // Arun's family (4 members in Building A-182):
  // Arun -> HOME
  // Priya -> HOME
  // Aarav -> HOME
  // Kavita -> SHELTER (City Central)
  await prisma.expectedLocation.createMany({
    data: [
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[0].id,
        expectedType: 'HOME',
        reconfirmedStatus: 'SAME_PLAN',
        reconfirmedAt: new Date(),
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[1].id,
        expectedType: 'HOME',
        reconfirmedStatus: 'SAME_PLAN',
        reconfirmedAt: new Date(),
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[2].id,
        expectedType: 'HOME',
        reconfirmedStatus: 'SAME_PLAN',
        reconfirmedAt: new Date(),
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[3].id,
        expectedType: 'SHELTER',
        shelterId: shelterCenter.id,
        reconfirmedStatus: 'SAME_PLAN',
        reconfirmedAt: new Date(),
      },
    ],
  });

  // Meera's family (Building A-182, Flat 202 - 3 members):
  // Meera -> SHELTER (East Pier)
  // Sanjay -> SHELTER (East Pier)
  // Tara -> SHELTER (East Pier)
  await prisma.expectedLocation.createMany({
    data: [
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[4].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
        reconfirmedStatus: 'CHANGE_LOCATION',
        reconfirmedAt: new Date(),
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[5].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
        reconfirmedStatus: 'SAME_PLAN',
        reconfirmedAt: new Date(),
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[6].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
        reconfirmedStatus: 'SAME_PLAN',
        reconfirmedAt: new Date(),
      },
    ],
  });

  // Rajesh's family (4 members):
  // Rajesh -> SHELTER (East Pier)
  // Geeta -> SHELTER (East Pier)
  // Ramesh -> SHELTER (East Pier)
  // Lata -> SHELTER (East Pier)
  // Total at East Pier = 3 + 4 = 7 (Capacity 6 -> OVER_CAPACITY!)
  await prisma.expectedLocation.createMany({
    data: [
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[7].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[8].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[9].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[10].id,
        expectedType: 'SHELTER',
        shelterId: shelterEast.id,
      },
    ],
  });

  // Sunita's family (2 members):
  // Sunita -> OTHER_CITY (Bangalore)
  // Aditi -> OTHER_CITY (Bangalore)
  await prisma.expectedLocation.createMany({
    data: [
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[11].id,
        expectedType: 'OTHER_CITY',
        otherCity: 'Bangalore',
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[12].id,
        expectedType: 'OTHER_CITY',
        otherCity: 'Bangalore',
      },
    ],
  });

  // David's family (3 members):
  // David -> UNKNOWN
  // Maria -> SHELTER (North Heights)
  // Lucas -> SHELTER (North Heights)
  await prisma.expectedLocation.createMany({
    data: [
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[13].id,
        expectedType: 'UNKNOWN',
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[14].id,
        expectedType: 'SHELTER',
        shelterId: shelterNorth.id,
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[15].id,
        expectedType: 'SHELTER',
        shelterId: shelterNorth.id,
      },
    ],
  });

  // Ananya's family:
  // Ananya -> HOME
  // Debashis -> HOME
  await prisma.expectedLocation.createMany({
    data: [
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[16].id,
        expectedType: 'HOME',
      },
      {
        disasterId: floodDisaster.id,
        householdMemberId: createdMembers[17].id,
        expectedType: 'HOME',
      },
    ],
  });

  // 10. DURING Disaster Live Statuses (SAFE, IN_DISTRESS, UNACCOUNTED)
  // Arun (Safe), Priya (Safe), Aarav (In Distress), Kavita (Safe)
  await prisma.emergencyStatus.createMany({
    data: [
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[0].id, status: 'SAFE' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[1].id, status: 'SAFE' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[2].id, status: 'IN_DISTRESS' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[3].id, status: 'SAFE' },
      // Meera's family: Safe
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[4].id, status: 'SAFE' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[5].id, status: 'SAFE' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[6].id, status: 'SAFE' },
      // Rajesh's family: Rajesh & Ramesh in distress
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[7].id, status: 'IN_DISTRESS' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[8].id, status: 'SAFE' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[9].id, status: 'IN_DISTRESS' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[10].id, status: 'UNACCOUNTED' },
      // Sunita: Unaccounted
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[11].id, status: 'UNACCOUNTED' },
      { disasterId: floodDisaster.id, householdMemberId: createdMembers[12].id, status: 'UNACCOUNTED' },
    ],
  });

  // 11. Emergency Requests with multiple conditions, priority scores & rescue lifecycle
  // Request 1: High priority (Water rising + Children present + Trapped) -> Score: 15 + 10 + 20 = 45 -> TEAM_ASSIGNED
  const req1 = await prisma.emergencyRequest.create({
    data: {
      disasterId: floodDisaster.id,
      householdMemberId: createdMembers[2].id, // Aarav Kumar
      latitude: 13.0827,
      longitude: 80.2707,
      address: 'Building A-182, 1st Floor Lobby, Riverside Drive',
      description: 'Basement wall breach! Water level at 4 feet and rising quickly. Child stranded on stairs.',
      priorityScore: 45,
      rescueStatus: 'TEAM_ASSIGNED',
      conditions: {
        create: [
          { conditionType: 'WATER_RISING' },
          { conditionType: 'CHILDREN_INFANTS_PRESENT' },
          { conditionType: 'TRAPPED' },
        ],
      },
      rescueAssignments: {
        create: [
          {
            teamName: 'Bravo-4 Rapid Water Rescue Squad',
            assignedByUserId: rescuer.id,
            status: 'TEAM_ASSIGNED',
            notes: 'Inflatable raft boat deployed from Sector 3 checkpoint.',
          },
        ],
      },
    },
  });

  // Request 2: Critical priority (Heavily injured + Fire + Elderly/Physically disabled) -> Score: 25 + 30 + 10 = 65 -> PENDING
  const req2 = await prisma.emergencyRequest.create({
    data: {
      disasterId: floodDisaster.id,
      householdMemberId: createdMembers[7].id, // Rajesh Patel
      latitude: 13.0845,
      longitude: 80.2735,
      address: 'Riverside Enclave, Block C-12, Ground Floor',
      description: 'Electrical transformer spark after flooding. Severe leg injury from debris. Needs urgent stretcher extraction.',
      priorityScore: 65,
      rescueStatus: 'PENDING',
      conditions: {
        create: [
          { conditionType: 'HEAVILY_INJURED' },
          { conditionType: 'FIRE' },
          { conditionType: 'PHYSICALLY_DISABLED' },
        ],
      },
    },
  });

  // Request 3: Seriously unwell + Need rescue -> Score: 20 + 15 = 35 -> SAFELY_RESCUED
  const req3 = await prisma.emergencyRequest.create({
    data: {
      disasterId: floodDisaster.id,
      householdMemberId: createdMembers[9].id, // Ramesh Patel (Elderly)
      latitude: 13.0845,
      longitude: 80.2735,
      address: 'Riverside Enclave, Block C-12, 2nd Floor',
      description: 'Oxygen concentrator depleted due to power failure. Medical transport required.',
      priorityScore: 35,
      rescueStatus: 'SAFELY_RESCUED',
      conditions: {
        create: [
          { conditionType: 'SERIOUSLY_UNWELL' },
          { conditionType: 'NEED_RESCUE' },
        ],
      },
      rescueAssignments: {
        create: [
          {
            teamName: 'Medic-1 Airborne Evacuation Unit',
            assignedByUserId: rescuer.id,
            status: 'SAFELY_RESCUED',
            notes: 'Successfully transported to Apollo Lifeline Emergency Hospital. Vitals stable.',
          },
        ],
      },
    },
  });

  // Request 4: Not Found demonstration -> NOT_FOUND
  const req4 = await prisma.emergencyRequest.create({
    data: {
      disasterId: floodDisaster.id,
      householdMemberId: createdMembers[10].id, // Lata Patel
      latitude: 13.0845,
      longitude: 80.2735,
      address: 'Riverside Enclave Outskirts',
      description: 'Last seen near community shed prior to flash surge.',
      priorityScore: 20,
      rescueStatus: 'NOT_FOUND',
      conditions: {
        create: [
          { conditionType: 'TRAPPED' },
        ],
      },
      rescueAssignments: {
        create: [
          {
            teamName: 'Delta Search & Recon Unit',
            assignedByUserId: rescuer.id,
            status: 'NOT_FOUND',
            notes: 'Area thoroughly searched with sonar; premises empty. Continuing search downstream.',
          },
        ],
      },
    },
  });

  // 12. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: citizenUsers[0].id,
        disasterId: floodDisaster.id,
        type: 'DISASTER_ALERT',
        message: 'URGENT: Red Alert Flash Flood predicted for River Basin Zone starting in 18 hours.',
        status: 'UNREAD',
      },
      {
        userId: citizenUsers[0].id,
        disasterId: floodDisaster.id,
        type: 'RECONFIRMATION',
        message: 'Reconfirmation needed: Please review your household location plan within the next 12 hours.',
        status: 'UNREAD',
      },
      {
        userId: citizenUsers[1].id,
        disasterId: floodDisaster.id,
        type: 'SHELTER_UPDATE',
        message: 'Shelter notice: East Pier High School is operating at full capacity. Alternate shelters available.',
        status: 'READ',
        readAt: new Date(),
      },
    ],
  });

  console.log('STRIDE demo seed complete!');
  console.log(`- Created ${citizensData.length} citizens and 1 rescuer`);
  console.log(`- Created ${householdsData.length} households with ${createdMembers.length} members`);
  console.log(`- Created 4 shelters demonstrating AVAILABLE, NEAR_CAPACITY, and OVER_CAPACITY`);
  console.log(`- Created 8 emergency facilities and 4 demo road corridors`);
  console.log(`- Created 1 active flood disaster with high-risk affected zone`);
  console.log(`- Populated BEFORE expected locations and DURING emergency requests & rescue lifecycle`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

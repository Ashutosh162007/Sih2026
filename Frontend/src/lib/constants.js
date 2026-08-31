export const ROLES = {
  CITIZEN: "citizen",
  REPORTER: "citizen",
  UNIVERSITY: "university",
  INDUSTRY: "industry",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  citizen: "Citizen",
  community_reporter: "Citizen",
  [ROLES.UNIVERSITY]: "University / HEI",
  [ROLES.INDUSTRY]: "Industry Partner",
  [ROLES.ADMIN]: "Admin / Govt Oversight",
};

export const ISSUE_CATEGORIES = [
  "Infrastructure",
  "Water & Sanitation",
  "Waste Management",
  "Public Safety",
  "Environment",
  "Agriculture",
  "Healthcare",
  "Education",
  "Rural Livelihoods",
  "Mobility",
];

export const JHARKHAND_DISTRICTS = [
  "Ranchi",
  "East Singhbhum (Jamshedpur)",
  "Dhanbad",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Ramgarh",
  "Giridih",
  "West Singhbhum (Chaibasa)",
  "Palamu",
  "Gumla",
  "Dumka",
  "Latehar",
  "Garhwa",
  "Koderma",
  "Chatra",
  "Simdega",
  "Khunti",
  "Lohardaga",
  "Pakur",
  "Godda",
  "Sahebganj",
  "Jamtara",
  "Seraikela Kharsawan",
];

export const DEFAULT_JHARKHAND_COORDS = {
  lat: 23.3441,
  lng: 85.3096,
};

export const JHARKHAND_DISTRICT_COORDS = {
  "Ranchi": { lat: 23.3441, lng: 85.3096 },
  "East Singhbhum (Jamshedpur)": { lat: 22.8046, lng: 86.2029 },
  "Dhanbad": { lat: 23.7957, lng: 86.4304 },
  "Bokaro": { lat: 23.6693, lng: 86.1511 },
  "Hazaribagh": { lat: 23.9925, lng: 85.3637 },
  "Deoghar": { lat: 24.4826, lng: 86.7001 },
  "Ramgarh": { lat: 23.6300, lng: 85.5100 },
  "Giridih": { lat: 24.1855, lng: 86.3090 },
  "West Singhbhum (Chaibasa)": { lat: 22.5604, lng: 85.8118 },
  "Palamu": { lat: 24.0375, lng: 84.0725 },
  "Gumla": { lat: 23.0425, lng: 84.5422 },
  "Dumka": { lat: 24.2676, lng: 87.2483 },
  "Latehar": { lat: 23.7434, lng: 84.5028 },
  "Garhwa": { lat: 24.1611, lng: 83.8078 },
  "Koderma": { lat: 24.4682, lng: 85.5939 },
  "Chatra": { lat: 24.2091, lng: 84.8722 },
  "Simdega": { lat: 22.6146, lng: 84.5025 },
  "Khunti": { lat: 23.0747, lng: 85.2783 },
  "Lohardaga": { lat: 23.4357, lng: 84.6803 },
  "Pakur": { lat: 24.6346, lng: 87.8488 },
  "Godda": { lat: 24.8277, lng: 87.2141 },
  "Sahebganj": { lat: 25.2425, lng: 87.6433 },
  "Jamtara": { lat: 23.9629, lng: 86.8016 },
  "Seraikela Kharsawan": { lat: 22.7000, lng: 85.9300 },
};

export const ISSUE_STATUSES = [
  "New",
  "Under review",
  "Assigned",
  "In progress",
  "Resolved",
];

export const PRIORITIES = ["High", "Medium", "Low"];

export const DISCIPLINES = [
  "Civil Engineering",
  "Computer Science & IoT",
  "Environmental Science",
  "Urban & Regional Planning",
  "Agriculture & Rural Development",
  "Public Health & Sanitation",
  "Electrical & Electronics",
  "Mining & Geological Sciences",
  "Public Policy & Economics",
  "Industrial Design",
];

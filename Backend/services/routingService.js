/**
 * Routing Service for Sahayog
 * Performs:
 * 1. Haversine distance calculation between issue coordinates and HEIs (Universities)
 * 2. Academic discipline & domain matching
 * 3. Proximity-based ranking and queue distribution
 */

// Registry of prominent Higher Education Institutions (HEIs) across Jharkhand & regions
const REGIONAL_UNIVERSITIES = [
  {
    id: 'uni-bit-mesra',
    name: 'Birla Institute of Technology (BIT) Mesra',
    district: 'Ranchi',
    lat: 23.4123,
    lng: 85.4399,
    disciplines: ['Civil Engineering', 'Computer Science', 'Environmental Science', 'Urban Planning', 'Mechanical Engineering'],
  },
  {
    id: 'uni-nit-jsr',
    name: 'National Institute of Technology (NIT) Jamshedpur',
    district: 'East Singhbhum',
    lat: 22.7770,
    lng: 86.1441,
    disciplines: ['Civil Engineering', 'Computer Science', 'Metallurgy', 'Public Safety', 'Electronics'],
  },
  {
    id: 'uni-iit-ism',
    name: 'IIT (ISM) Dhanbad',
    district: 'Dhanbad',
    lat: 23.8143,
    lng: 86.4412,
    disciplines: ['Mining Engineering', 'Environmental Science', 'Computer Science', 'Earth Sciences', 'Civil Engineering'],
  },
  {
    id: 'uni-bau-ranchi',
    name: 'Birsa Agricultural University (BAU)',
    district: 'Ranchi',
    lat: 23.4432,
    lng: 85.3188,
    disciplines: ['Agriculture', 'Rural Livelihoods', 'Water & Sanitation', 'Veterinary Science', 'Forestry'],
  },
  {
    id: 'uni-ranchi-univ',
    name: 'Ranchi University',
    district: 'Ranchi',
    lat: 23.3700,
    lng: 85.3250,
    disciplines: ['Public Policy', 'Social Sciences', 'Waste Management', 'Environmental Science', 'Computer Science'],
  },
  {
    id: 'uni-vbu-hazaribagh',
    name: 'Vinoba Bhave University (VBU)',
    district: 'Hazaribagh',
    lat: 23.9925,
    lng: 85.3647,
    disciplines: ['Education', 'Social Work', 'Environmental Science', 'Public Policy'],
  },
  {
    id: 'uni-kolhan',
    name: 'Kolhan University',
    district: 'West Singhbhum',
    lat: 22.5604,
    lng: 85.8118,
    disciplines: ['Tribal Studies', 'Rural Livelihoods', 'Social Sciences', 'Civil Engineering'],
  },
  {
    id: 'uni-aiims-deoghar',
    name: 'AIIMS Deoghar',
    district: 'Deoghar',
    lat: 24.4826,
    lng: 86.7001,
    disciplines: ['Healthcare', 'Public Safety', 'Sanitation', 'Community Medicine'],
  }
];

/**
 * Haversine formula to calculate geodesic distance in Kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Find and rank nearest universities for an issue
 */
function rankUniversitiesForIssue({ lat, lng, category, district }) {
  const issueLat = Number(lat) || 23.3441;
  const issueLng = Number(lng) || 85.3096;

  const ranked = REGIONAL_UNIVERSITIES.map((uni) => {
    const distanceKm = calculateHaversineDistance(issueLat, issueLng, uni.lat, uni.lng);
    
    // Proximity score (0 - 50 pts)
    const proximityScore = Math.max(0, 50 - distanceKm * 0.25);
    
    // District bonus (25 pts)
    const districtBonus = (district && uni.district.toLowerCase() === district.toLowerCase()) ? 25 : 0;

    // Discipline match (25 pts)
    const categoryMatches = {
      'Infrastructure': ['Civil Engineering', 'Urban Planning', 'Mechanical Engineering'],
      'Water & Sanitation': ['Environmental Science', 'Civil Engineering', 'Water & Sanitation'],
      'Waste Management': ['Environmental Science', 'Waste Management', 'Social Sciences'],
      'Public Safety': ['Public Safety', 'Computer Science', 'Electronics'],
      'Agriculture': ['Agriculture', 'Rural Livelihoods', 'Forestry'],
      'Healthcare': ['Healthcare', 'Sanitation', 'Community Medicine'],
      'Environment': ['Environmental Science', 'Mining Engineering', 'Earth Sciences'],
      'Rural Livelihoods': ['Rural Livelihoods', 'Tribal Studies', 'Social Work'],
      'Education': ['Education', 'Computer Science', 'Social Sciences'],
      'Mobility': ['Civil Engineering', 'Urban Planning', 'Computer Science'],
    };

    const targetDisciplines = categoryMatches[category] || ['Civil Engineering', 'Computer Science'];
    const disciplineScore = uni.disciplines.some((d) => targetDisciplines.includes(d)) ? 25 : 10;

    const matchScore = Math.round(proximityScore + districtBonus + disciplineScore);

    return {
      universityId: uni.id,
      name: uni.name,
      district: uni.district,
      distanceKm,
      matchScore,
      disciplines: uni.disciplines,
    };
  });

  // Sort by distance (primary) and match score (secondary)
  ranked.sort((a, b) => a.distanceKm - b.distanceKm);

  return ranked;
}

module.exports = {
  REGIONAL_UNIVERSITIES,
  calculateHaversineDistance,
  rankUniversitiesForIssue,
};

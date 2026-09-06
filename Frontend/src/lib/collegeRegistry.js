import { DISCIPLINES } from "./constants";

export const UNIVERSITY_CAMPUSES = [
  {
    email: "university@sahayog.in",
    label: "BIT Mesra",
    org: "Birla Institute of Technology (BIT) Mesra",
    adminName: "Dr. Kavita Rao",
  },
  {
    email: "nitjamshedpur@sahayog.in",
    label: "NIT Jamshedpur",
    org: "National Institute of Technology, Jamshedpur",
    adminName: "Prof. Rajesh Verma",
  },
  {
    email: "bau@sahayog.in",
    label: "Birsa Agricultural University",
    org: "Birsa Agricultural University, Ranchi",
    adminName: "Dr. Sunita Devi",
  },
  {
    email: "vinoba@sahayog.in",
    label: "Vinoba Bhave University, Hazaribagh",
    org: "Vinoba Bhave University, Hazaribagh",
    adminName: "Dr. Alok Pathak",
  },
];

const DEFAULT_ROSTER = {
  "Civil Engineering": ["Harsh Vardhan", "Pooja Kumari", "Aman Tiwari"],
  "Computer Science & IoT": ["Aman Singh", "Nisha Verma", "Vikram Jeet"],
  "Environmental Science": ["Dr. Ananya Roy", "Dev Prakash", "Tanuja Oraon"],
  "Urban & Regional Planning": ["Sana Khan", "Ritesh Kumar", "Meghna Rao"],
  "Agriculture & Rural Development": ["Manoj Tudu", "Priti Lakra", "Kavita Murmu"],
  "Public Health & Sanitation": ["Dr. Nidhi Gupta", "Sneha Pandey", "Aparna Bose"],
  "Electrical & Electronics": ["Rajat Bansal", "Kunal Sahu", "Tanvi Joshi"],
  "Mining & Geological Sciences": ["Dr. Prakash Mishra", "Ravi Ranjan", "Jaya Minz"],
  "Public Policy & Economics": ["Kabir Anand", "Rina Singh", "Nitin Das"],
  "Industrial Design": ["Tara Krishnan", "Neil D'Souza", "Zoya Khan"],
};

const COLLEGE_MEMBERS = {
  "Birla Institute of Technology (BIT) Mesra": {
    "Civil Engineering": ["Harsh Vardhan", "Pooja Kumari", "Aman Tiwari"],
    "Computer Science & IoT": ["Aman Singh", "Nisha Verma", "Vikram Jeet"],
    "Environmental Science": ["Dr. Ananya Roy", "Dev Prakash", "Tanuja Oraon"],
    "Urban & Regional Planning": ["Sana Khan", "Ritesh Kumar"],
    "Agriculture & Rural Development": ["Manoj Tudu", "Priti Lakra"],
    "Public Health & Sanitation": ["Dr. Nidhi Gupta", "Sneha Pandey"],
    "Electrical & Electronics": ["Rajat Bansal", "Kunal Sahu"],
    "Mining & Geological Sciences": ["Dr. Prakash Mishra", "Ravi Ranjan"],
    "Public Policy & Economics": ["Kabir Anand", "Rina Singh"],
    "Industrial Design": ["Tara Krishnan", "Neil D'Souza"],
  },
  "National Institute of Technology, Jamshedpur": {
    "Civil Engineering": ["Rahul Verma", "Aditi Sharma", "Arjun Patel"],
    "Computer Science & IoT": ["Isha Malhotra", "Rohit Singh", "Karan Gupta"],
    "Environmental Science": ["Dr. Meera Joshi", "Faizan Khan"],
    "Urban & Regional Planning": ["Leela Nair", "Omar Farooq"],
    "Agriculture & Rural Development": ["Anil Kumar", "Ramesh Yadav"],
    "Public Health & Sanitation": ["Dr. Sushmita Kaur", "Nikhil Mehta"],
    "Electrical & Electronics": ["Arnav Bose", "Priya Desai", "Varun Rao"],
    "Mining & Geological Sciences": ["Dr. Sunil Das", "Bhaskar Jha"],
    "Public Policy & Economics": ["Ritu Agarwal", "Sanjay Prasad"],
    "Industrial Design": ["Zoya Sheikh", "Manav Kapoor"],
  },
  "Birsa Agricultural University, Ranchi": {
    "Civil Engineering": ["Deepak Oraon", "Mukesh Sahu"],
    "Computer Science & IoT": ["Sweta Kumari", "Ravi Prakash"],
    "Environmental Science": ["Dr. Anil Oraon", "Sarita Devi", "Reena Tigga"],
    "Urban & Regional Planning": ["Neha Sinha", "Kunal Sharma"],
    "Agriculture & Rural Development": ["Dr. Rakesh Kumar", "Sunita Devi", "Manoj Lakra"],
    "Public Health & Sanitation": ["Dr. Pallavi Roy", "Deepak Ekka"],
    "Electrical & Electronics": ["Jitendra Kumar", "Pooja Toppo"],
    "Mining & Geological Sciences": ["Dr. Binod Mahato", "Ashok Minj"],
    "Public Policy & Economics": ["Shalini Gupta", "Vinod Sahu"],
    "Industrial Design": ["Anjali Sharma", "Rohit Ranjan"],
  },
  "Vinoba Bhave University, Hazaribagh": {
    "Civil Engineering": ["Suraj Singh", "Anita Kumari"],
    "Computer Science & IoT": ["Deepak Verma", "Ritika Mishra"],
    "Environmental Science": ["Dr. Nandini Sharma", "Abhishek Pathak"],
    "Urban & Regional Planning": ["Poonam Das", "Alok Jha"],
    "Agriculture & Rural Development": ["Govind Mahto", "Rekha Devi", "Sanjay Yadav"],
    "Public Health & Sanitation": ["Dr. Kavita Sinha", "Rohit Oraon"],
    "Electrical & Electronics": ["Priyanka Gupta", "Md. Irfan"],
    "Mining & Geological Sciences": ["Dr. Naresh Kumar", "Satish Prasad"],
    "Public Policy & Economics": ["Vandana Tiwari", "Rajan Kisku"],
    "Industrial Design": ["Sneha Kumari", "Aditya Raj"],
  },
};

function rosterFor(org) {
  if (org && COLLEGE_MEMBERS[org]) return COLLEGE_MEMBERS[org];
  return DEFAULT_ROSTER;
}

function ensureAllDisciplines(roster) {
  const result = { ...roster };
  DISCIPLINES.forEach((d) => {
    if (!result[d]) result[d] = DEFAULT_ROSTER[d];
  });
  return result;
}

export { DEFAULT_ROSTER, COLLEGE_MEMBERS, rosterFor, ensureAllDisciplines };
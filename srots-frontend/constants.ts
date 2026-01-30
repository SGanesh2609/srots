
/**
 * File Name: constants.ts
 * Directory: /constants.ts
 * 
 * Functionality:
 * - Stores static data lists used across the application.
 * - **Geographical Data**: Lists of Indian States and Major Cities for address forms.
 * - **Profile Fields**: Comprehensive list of fields available for Job Application requirements and Custom Gathering reports.
 * - **Batches**: Helper array for generating batch years.
 * 
 * Used In: AddressForm, JobWizard, CustomGathering
 */

// Geographical Constants
export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
    "Lakshadweep", "Puducherry"
];

export const MAJOR_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", 
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", 
    "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", 
    "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", 
    "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubballi-Dharwad", "Mysore", "Tiruchirappalli", "Bareilly", 
    "Aligarh", "Tiruppur", "Gurgaon", "Moradabad", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Mira-Bhayandar", 
    "Jalgaon", "Guntur", "Thiruvananthapuram", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", 
    "Noida", "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", 
    "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", 
    "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", 
    "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Udaipur", "Kakinada", "Davanagere", 
    "Kozhikode", "Maheshtala", "Rajpur Sonarpur", "Rajahmundry", "Bokaro", "South Dumdum", "Bellary", "Patiala", 
    "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar", "Bhatpara", "Panihati", "Latur", "Dhule", 
    "Tirupati", "Rohtak", "Korba", "Bhilwara", "Berhampur", "Muzaffarpur", "Ahmednagar", "Mathura", 
    "Kollam", "Avadi", "Kadapa", "Kamarhati", "Sambalpur", "Bilaspur", "Shahjahanpur", "Satara", 
    "Bijapur", "Rampur", "Shivamogga", "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman", 
    "Kulti", "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Ozhukarai", "Bihar Sharif", "Panipat", 
    "Darbhanga", "Bally", "Aizawl", "Dewas", "Ichalkaranji", "Karnal", "Bathinda", "Jalna", 
    "Eluru", "Barasat", "Kirari Suleman Nagar", "Purnia", "Satna", "Mau", "Sonipat", "Farrukhabad", 
    "Sagar", "Rourkela", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", "Anantapur", "Karimnagar", 
    "Etawah", "Ambernath", "North Dumdum", "Bharatpur", "Begusarai", "New Delhi", "Gandhidham", 
    "Baranagar", "Tiruvottiyur", "Pondicherry", "Sikar", "Thoothukudi", "Rewa", "Mirzapur", 
    "Raichur", "Pali", "Ramagundam", "Silchar", "Haridwar", "Vijayanagaram", "Tenali", "Nagercoil", 
    "Sri Ganganagar", "Karawal Nagar", "Mango", "Thanjavur", "Bulandshahr", "Uluberia", "Murwara", 
    "Sambhal", "Singrauli", "Nadiad", "Secunderabad", "Naihati", "Yamunanagar", "Bidhan Nagar", 
    "Pallavaram", "Bidar", "Munger", "Panchkula", "Burhanpur", "Raurkela Industrial Township", 
    "Kharagpur", "Dindigul", "Gandhinagar", "Hospet", "Nangloi Jat", "Malda", "Ongole", 
    "Deoghar", "Chapra", "Haldia", "Khandwa", "Nandyal", "Morena", "Amroha", "Anand", 
    "Bhind", "Bhalswa Jahangir Pur", "Madhyamgram", "Bhiwani", "Berhampore", "Ambala", 
    "Morbi", "Fatehpur", "Raebareli", "Khora", "Chittoor", "Bhusawal", "Orai", "Bahraich", 
    "Phusro", "Vellore", "Mehsana", "Raiganj", "Sirsa", "Danapur", "Serampore", "Sultan Pur Majra", 
    "Guna", "Jaunpur", "Panvel", "Shivpuri", "Surendranagar Dudhrej", "Unnao", "Chinsurah", 
    "Alappuzha", "Kottayam", "Machilipatnam", "Shimla", "Adoni", "Udupi", "Katihar", "Proddatur", 
    "Mahbubnagar", "Saharsa", "Dibrugarh", "Jorhat", "Hazaribagh", "Hindupur", "Nagaon", 
    "Sasaram", "Hajipur", "Giridih", "Bhimavaram", "Kumbakonam", "Bongaigaon", "Dehri", 
    "Madanapalle", "Siwan", "Bettiah", "Ramgarh", "Tinsukia", "Guntakal", "Srikakulam", 
    "Motihari", "Dharmavaram", "Gudivada", "Phagwara", "Pudukkottai", "Hosur", "Narasaraopet", 
    "Suryapet", "Miryalaguda", "Tadipatri", "Karaikudi", "Kishanganj", "Jamalpur", "Ballia", 
    "Kavali", "Tadepalligudem", "Amaravati", "Buxar", "Tezpur", "Jehanabad", "Aurangabad", 
    "Gangtok", "Vasco Da Gama"
];

// Standard fields usually required for applications or reports
export const COMMON_PROFILE_FIELD_KEYS = [
    'fullName', 'rollNumber', 'personalEmail', 'phone', 'btech.cgpa', 'resumes', 
    'class10.percentage', 'class12.percentage', 'diploma.percentage', 'gapInStudies', 
    'gender', 'dob', 'branch', 'permanentAddress'
];

// Profile Fields for Job & Gathering
export const ALL_PROFILE_FIELDS = [
    // Identity
    { value: 'fullName', label: 'Full Name', category: 'Identity' },
    { value: 'rollNumber', label: 'Roll Number', category: 'Identity' },
    { value: 'gender', label: 'Gender', category: 'Identity' },
    { value: 'dob', label: 'Date of Birth', category: 'Identity' },
    { value: 'aadhaarNumber', label: 'Aadhaar Number', category: 'Identity' },
    { value: 'nationality', label: 'Nationality', category: 'Identity' },
    { value: 'religion', label: 'Religion', category: 'Identity' },
    { value: 'passportNumber', label: 'Passport Number', category: 'Identity' },
    { value: 'drivingLicense', label: 'Driving License', category: 'Identity' },

    // Contact
    { value: 'personalEmail', label: 'Personal Email', category: 'Contact' },
    { value: 'instituteEmail', label: 'Institute Email', category: 'Contact' },
    { value: 'phone', label: 'Phone Number', category: 'Contact' },
    { value: 'whatsappNumber', label: 'WhatsApp Number', category: 'Contact' },
    { value: 'currentAddress', label: 'Current Address', category: 'Contact' },
    { value: 'permanentAddress', label: 'Permanent Address', category: 'Contact' },

    // Academic - General
    { value: 'branch', label: 'Branch', category: 'Academic' },
    { value: 'course', label: 'Course', category: 'Academic' },
    { value: 'batch', label: 'Batch Year', category: 'Academic' },
    { value: 'gapInStudies', label: 'Educational Gaps', category: 'Academic' },

    // Academic - 10th
    { value: 'class10.percentage', label: 'Class 10th %', category: 'Academic' },
    { value: 'class10.cgpa', label: 'Class 10th CGPA', category: 'Academic' },
    { value: 'class10.marks', label: 'Class 10th Marks', category: 'Academic' },

    // Academic - 12th
    { value: 'class12.percentage', label: 'Class 12th %', category: 'Academic' },
    { value: 'class12.cgpa', label: 'Class 12th CGPA', category: 'Academic' },
    { value: 'class12.marks', label: 'Class 12th Marks', category: 'Academic' },

    // Academic - Diploma
    { value: 'diploma.percentage', label: 'Diploma %', category: 'Academic' },
    { value: 'diploma.cgpa', label: 'Diploma CGPA', category: 'Academic' },
    { value: 'diploma.marks', label: 'Diploma Marks', category: 'Academic' },

    // Academic - Undergraduate (B.Tech)
    { value: 'btech.cgpa', label: 'B.Tech/UG CGPA', category: 'Academic' },
    { value: 'btech.percentage', label: 'B.Tech/UG %', category: 'Academic' },
    { value: 'btech.marks', label: 'B.Tech/UG Marks', category: 'Academic' },

    // Family
    { value: 'fatherName', label: 'Father Name', category: 'Family' },
    { value: 'motherName', label: 'Mother Name', category: 'Family' },
    { value: 'parentPhone', label: 'Parent Phone', category: 'Family' },
    { value: 'parentEmail', label: 'Parent Email', category: 'Family' },

    // Portfolio
    { value: 'resumes', label: 'Resume Link', category: 'Portfolio' },
    { value: 'linkedInProfile', label: 'LinkedIn Profile', category: 'Portfolio' },
    { value: 'skills', label: 'Skills', category: 'Portfolio' },
    { value: 'projects', label: 'Projects', category: 'Portfolio' },
    { value: 'certifications', label: 'Certifications', category: 'Portfolio' },
    { value: 'experience', label: 'Experience', category: 'Portfolio' },
    { value: 'socialLinks', label: 'Social Media Links', category: 'Portfolio' },
];

export const AVAILABLE_BATCHES = Array.from({ length: 9 }, (_, i) => new Date().getFullYear() - 4 + i);

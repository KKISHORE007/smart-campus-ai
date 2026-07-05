// ============================================================
// Student Helpdesk Agent — Service: In-Memory Mock Store
// ============================================================
// Provides a complete in-memory fallback database for institutions,
// users, students, knowledge documents, and conversation sessions.
// Scoped to "XYZ Engineering College" (Code: XYZ-EC).
// ============================================================

import logger from '../utils/logger.js';

export const mockInstitutions = [
  {
    institutionId: 'inst-xyz-001',
    name: 'XYZ Engineering College',
    code: 'XYZ-EC',
    logo: '🎓',
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    contactEmail: 'helpdesk@xyzec.edu',
    contactPhone: '+91 98765 43210',
    address: 'Knowledge Campus, Tech Valley, Bangalore 560001',
    locationUrl: 'https://maps.google.com/?q=XYZ+Engineering+College',
    website: 'https://www.xyzec.edu',
    motto: 'Excellence in Engineering & Innovation Since 1998',
    bannerImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    videoTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    heroCarouselImages: [
      { id: 'slide-1', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80', title: 'XYZ Engineering College Campus', subtitle: 'Excellence in Engineering & Innovation Since 1998' },
      { id: 'slide-2', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80', title: 'AI & Robotics Innovation Center', subtitle: 'State-of-the-art NVIDIA GPU clusters for student projects' },
      { id: 'slide-3', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80', title: 'Collaborative Learning Spaces', subtitle: '24/7 Digital Library and student research hubs' },
      { id: 'slide-4', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80', title: 'Annual InnoVision Tech Fest', subtitle: 'Over 400 teams competing for innovation grants' }
    ],
    isActive: true,
  },
];

export const mockUsers = [
  {
    userId: 'SUPER-STARK-001',
    loginId: 'stark@123',
    email: 'stark@xyzec.edu',
    password: '12345678',
    name: 'Tony Stark (Super Admin)',
    role: 'super_admin',
    institutionId: 'inst-xyz-001',
    department: 'Executive Trust & Administration',
    isActive: true,
  },
  {
    userId: 'HOD-CSE-001',
    loginId: 'hod.cse',
    email: 'hod@xyzec.edu',
    password: 'hod12345',
    name: 'Dr. Alok Verma (Head of Dept)',
    role: 'hod',
    institutionId: 'inst-xyz-001',
    department: 'Computer Science & Engineering',
    isActive: true,
  },
  {
    userId: 'STAFF-LIB-001',
    loginId: 'staff.lib',
    email: 'staff@xyzec.edu',
    password: 'staff12345',
    name: 'Meenakshi Sundaram (Senior Library Staff)',
    role: 'staff',
    institutionId: 'inst-xyz-001',
    department: 'Central Library & Resources',
    isActive: true,
  },
  {
    userId: 'ADM-XYZ-001',
    loginId: 'admin',
    email: 'admin@xyzec.edu',
    password: 'admin123',
    name: 'Dr. Rajesh Rao (Chief Admin)',
    role: 'admin',
    institutionId: 'inst-xyz-001',
    department: 'Central Administration',
    isActive: true,
  },
  {
    userId: 'STU-XYZ-001',
    loginId: 'arjun.s',
    email: 'student@xyzec.edu',
    password: 'student123',
    name: 'Arjun Sharma',
    role: 'student',
    institutionId: 'inst-xyz-001',
    department: 'Computer Science & Engineering',
    year: 3,
    isActive: true,
    status: 'approved',
  },
  {
    userId: 'STU-PEND-001',
    loginId: 'rohit.k',
    email: 'rohit.k@xyzec.edu',
    password: 'password123',
    name: 'Rohit Kumar (New Applicant)',
    role: 'student',
    institutionId: 'inst-xyz-001',
    department: 'Mechanical Engineering',
    year: 1,
    isActive: true,
    status: 'pending',
  },
  {
    userId: 'STAFF-PEND-001',
    loginId: 'staff.math',
    email: 'prof.gupta@xyzec.edu',
    password: 'gupta12345',
    name: 'Prof. Animesh Gupta (Faculty Applicant)',
    role: 'staff',
    institutionId: 'inst-xyz-001',
    department: 'Applied Mathematics',
    isActive: true,
    status: 'pending',
  },
  {
    userId: 'HOD-PEND-001',
    loginId: 'hod.ece',
    email: 'hod.ece@xyzec.edu',
    password: 'ecehod2026',
    name: 'Dr. Sunita Williams (HOD Applicant)',
    role: 'hod',
    institutionId: 'inst-xyz-001',
    department: 'Electronics & Communication',
    isActive: true,
    status: 'pending',
  },
];

// Initial Mock Documents scoped to inst-xyz-001
export const MOCK_DOCS = [
  {
    _id: 'doc-xyz-001',
    institutionId: 'inst-xyz-001',
    title: "B.Tech Computer Science & Engineering — Curriculum & Syllabus (2025-2029)",
    category: "academic",
    tags: ["syllabus", "curriculum", "cse", "btech", "credits", "courses"],
    fileName: 'XYZ_EC_CSE_Syllabus_2025.pdf',
    fileType: 'pdf',
    fileSize: '45 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 5),
    content: `The B.Tech in Computer Science & Engineering at XYZ Engineering College is a 4-year undergraduate program divided into 8 semesters with a total requirement of 160 credits for graduation.

### Core Courses by Semester:
- **Semester 1 (20 Credits)**: Engineering Mathematics-I (4), Engineering Physics (4), Basic Electrical Engineering (4), Engineering Graphics & CAD (3), Programming for Problem Solving in C (3), Physics & C Programming Lab (2).
- **Semester 2 (20 Credits)**: Engineering Mathematics-II (4), Engineering Chemistry (4), Data Structures & Algorithms using C++ (4), Basic Electronics Engineering (3), English Communication Skills (3), Data Structures & Chemistry Lab (2).
- **Semester 3 (22 Credits)**: Discrete Mathematics (4), Object-Oriented Programming with Java (4), Digital Logic Design (4), Computer Organization & Architecture (3), Operating Systems (4), OOP & OS Lab (3).
- **Semester 4 (22 Credits)**: Design and Analysis of Algorithms (4), Database Management Systems (4), Formal Language & Automata Theory (4), Microprocessors & Microcontrollers (3), Software Engineering (3), DBMS & Algorithms Lab (4).
- **Semester 5 (22 Credits)**: Computer Networks (4), Artificial Intelligence & Machine Learning (4), Theory of Computation (4), Web Technologies & Full Stack Development (3), Professional Elective-I (3), AI/ML & Web Dev Lab (4).
- **Semester 6 (20 Credits)**: Compiler Design (4), Information Security & Cryptography (3), Cloud Computing (3), Professional Elective-II (3), Open Elective-I (3), Mini Project / Internship Evaluation (4).
- **Semester 7 (18 Credits)**: Big Data Analytics (3), Deep Learning & Neural Networks (3), Professional Elective-III (3), Professional Elective-IV (3), Open Elective-II (3), Major Project Phase-I (3).
- **Semester 8 (16 Credits)**: Professional Ethics & Cyber Law (2), Open Elective-III (3), Major Project Phase-II & Dissertation (10), Comprehensive Viva Voce (1).

### Minimum Passing Criteria:
A student at XYZ Engineering College must secure at least 40% marks in end-semester examinations and an aggregate of 45% combining internal assessments and end-semester evaluations to earn course credits.`
  },
  {
    _id: 'doc-xyz-002',
    institutionId: 'inst-xyz-001',
    title: "Official Academic Calendar — Academic Year 2025-2026",
    category: "academic",
    tags: ["calendar", "dates", "schedule", "holidays", "exams", "semester"],
    fileName: 'Academic_Calendar_2025_26.pdf',
    fileType: 'pdf',
    fileSize: '32 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 5),
    content: `This document outlines the official academic schedule, instructional days, examination windows, and vacation periods for XYZ Engineering College for the academic year 2025-26.

### Odd Semester (July 2025 — December 2025):
- **July 21, 2025**: Commencement of instruction for 2nd, 3rd, and 4th Year B.Tech students.
- **August 1, 2025**: Last date for course registration and add/drop without late fee.
- **August 15, 2025**: Independence Day (Holiday).
- **September 15 - September 20, 2025**: Mid-Semester Examinations (Mid-Term I).
- **October 2 - October 4, 2025**: Mahatma Gandhi Jayanti & Puja Holidays.
- **October 10 - October 12, 2025**: Annual Technical Fest "InnoVision 2025".
- **October 20 - October 26, 2025**: Diwali & Autumn Break.
- **November 14, 2025**: Last day of classroom instructions for Odd Semester.
- **November 17 - November 22, 2025**: Practical / Laboratory End-Semester Examinations.
- **November 24 - December 10, 2025**: End-Semester Theory Examinations.
- **December 15, 2025 - January 4, 2026**: Winter Vacation for Students.

### Even Semester (January 2026 — June 2026):
- **January 5, 2026**: Commencement of classroom instruction for Even Semester.
- **January 26, 2026**: Republic Day (Holiday).
- **February 14 - February 17, 2026**: Annual Cultural Festival "Utsav 2026".
- **February 21 - February 23, 2026**: Inter-College Sports Fest "Athlos 2026".
- **March 10 - March 15, 2026**: Mid-Semester Examinations (Mid-Term II).
- **March 25, 2026**: Holi Holiday.
- **April 24, 2026**: Last instructional day for Even Semester.
- **April 27 - May 2, 2026**: Practical & Lab End-Semester Exams.
- **May 5 - May 20, 2026**: End-Semester Theory Examinations.
- **May 25 - July 19, 2026**: Summer Vacation / Industrial Internship Period.`
  },
  {
    _id: 'doc-xyz-003',
    institutionId: 'inst-xyz-001',
    title: "Comprehensive Fee Structure & Payment Deadlines (B.Tech Program)",
    category: "administrative",
    tags: ["fees", "tuition", "hostel", "payment", "due date", "fine", "refund"],
    fileName: 'Fee_Structure_BTech_2025.xlsx',
    fileType: 'xlsx',
    fileSize: '18 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 4),
    content: `The following fee structure applies to all undergraduate B.Tech students at XYZ Engineering College for the academic year 2025-26. Fees are payable on a per-semester basis.

### Semester Fee Breakdown (Per Semester):
1. **Tuition Fee**: ₹1,50,000 per semester.
2. **Development & Infrastructure Fee**: ₹15,000 per semester.
3. **Examination & Assessment Fee**: ₹5,000 per semester.
4. **Library & Digital Resources Fee**: ₹3,000 per semester.
5. **Student Activities & Medical Insurance**: ₹2,000 per semester.
- **Total Academic Fee (Day Scholars)**: **₹1,75,000 per semester**.

### Hostel & Mess Charges (Optional, Per Semester):
- **Hostel Room Rent (Double/Triple Occupancy)**: ₹35,000 per semester.
- **Hostel Room Rent (Single Occupancy AC)**: ₹55,000 per semester.
- **Mess Advance (4 Meals/Day — Breakfast, Lunch, Snacks, Dinner)**: ₹25,000 per semester.
- **Total Residential Fee (Standard Occupancy)**: **₹60,000 per semester**.
- **Grand Total for Hostellers (Standard)**: **₹2,35,000 per semester**.

### Payment Deadlines & Late Fine Policy:
- **Odd Semester Payment Deadline**: July 10, 2025.
- **Even Semester Payment Deadline**: January 15, 2026.
- **Late Fee Fine**: Payments made after the deadline attract a late fee fine of ₹500 per week of delay up to a maximum of 4 weeks. After 4 weeks, student registration will be temporarily suspended until fees and penalties are cleared.
- **Payment Modes**: Fees can be paid online via Net Banking, UPI, Credit/Debit Card through the XYZ-EC Student Portal, or via NEFT/RTGS to College Account No: 89230100012344, IFSC: SBIN0001234.

### Fee Refund Policy:
If a student withdraws admission before the start of the semester, 90% of the tuition fee is refunded. Within 15 days of semester commencement, a 50% refund applies. No refund is granted after 30 days of semester commencement.`
  },
  {
    _id: 'doc-xyz-004',
    institutionId: 'inst-xyz-001',
    title: "Examination Rules, Grading System & CGPA Calculation Policy",
    category: "academic",
    tags: ["grading", "cgpa", "sgpa", "exams", "rules", "re-evaluation", "backlog"],
    fileName: 'Examination_and_Grading_Rules.pdf',
    fileType: 'pdf',
    fileSize: '28 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 4),
    content: `XYZ Engineering College follows a 10-point absolute and relative grading system in accordance with UGC and AICTE guidelines for evaluating student performance.

### Letter Grades and Grade Points:
- **O (Outstanding)**: 10 Grade Points (Marks: 90% and above)
- **A+ (Excellent)**: 9 Grade Points (Marks: 80% to 89%)
- **A (Very Good)**: 8 Grade Points (Marks: 70% to 79%)
- **B+ (Good)**: 7 Grade Points (Marks: 60% to 69%)
- **B (Above Average)**: 6 Grade Points (Marks: 50% to 59%)
- **C (Average / Pass)**: 5 Grade Points (Marks: 45% to 49%)
- **P (Minimum Pass)**: 4 Grade Points (Marks: 40% to 44%)
- **F (Fail / Backlog)**: 0 Grade Points (Marks below 40% or failed in internal assessment)
- **Ab (Absent)**: 0 Grade Points (Did not appear for examination)

### SGPA and CGPA Calculation Formulas:
- **SGPA (Semester Grade Point Average)**: Calculated as the credit-weighted average of grade points earned in a single semester.
  \`SGPA = Sum(Course Credits * Course Grade Points) / Sum(Total Semester Credits)\`
- **CGPA (Cumulative Grade Point Average)**: Calculated as the credit-weighted average of grade points earned across all semesters completed so far.
  \`CGPA = Sum(Course Credits across Semesters * Grade Points) / Sum(Total Credits Completed)\`

### Conversion of CGPA to Percentage:
To convert CGPA into equivalent percentage of marks for external placement or postgraduate application purposes, the official college conversion formula is:
\`Equivalent Percentage (%) = (CGPA - 0.75) * 10\` (For example, a CGPA of 8.75 corresponds to exactly 80.00%).

### Backlog Rules and Supplementary Examinations:
1. A student who scores an 'F' or 'Ab' grade in any theory or practical course is declared to have a backlog.
2. Supplementary (make-up) examinations are conducted within 30 days after the declaration of end-semester results for students to clear backlogs without losing an academic year.
3. **Re-evaluation / Scrutiny**: Students can apply for answer sheet re-evaluation within 7 days of result declaration by paying a processing fee of ₹500 per subject at the Examination Controller's office.`
  },
  {
    _id: 'doc-xyz-005',
    institutionId: 'inst-xyz-001',
    title: "Mandatory Attendance Policy & Shortage Condonation Rules",
    category: "academic",
    tags: ["attendance", "75%", "condonation", "medical", "shortage", "rules"],
    fileName: 'Attendance_Policy_75_Percent.pdf',
    fileType: 'pdf',
    fileSize: '22 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 3),
    content: `Regular classroom and laboratory attendance is a mandatory requirement for academic success and eligibility to sit for end-semester examinations at XYZ Engineering College.

### Minimum Attendance Requirement:
1. Every student is expected to maintain **100% attendance** in all scheduled lectures, tutorials, and laboratory sessions.
2. Under no circumstances will a student be permitted to appear for the End-Semester Examination if their physical attendance in a specific course falls below **75% of total instructional hours**.

### Attendance Condonation (For 65% to 74% Attendance):
In cases of severe illness, hospitalization, or official representation of XYZ Engineering College in national-level technical/sports/cultural events, attendance shortage between **65% and 74%** may be condoned by the Academic Council subject to the following conditions:
- **Medical Grounds**: The student must submit a valid medical certificate from a registered medical practitioner along with the college health center endorsement within 5 working days of resuming classes.
- **Official Representation**: Students representing the college must obtain prior written approval from the Dean of Student Affairs before departing for the event.
- **Condonation Fee**: An administrative condonation fee of **₹1,000 per subject** must be paid at the accounts section once the condonation application is approved by the Head of Department.

### Consequences of Attendance Below 65%:
Students whose final attendance falls below **65%** in any theory or laboratory course (even after including medical or sports leaves) will **NOT be condoned under any circumstances**. Such students will be awarded a **"DT" (Detained)** grade for that subject. They will be barred from taking the end-semester exam and must re-register and repeat the course during the next academic year when it is offered.`
  },
  {
    _id: 'doc-xyz-006',
    institutionId: 'inst-xyz-001',
    title: "Central Library Rules, Timings, Book Issuance & Fine Policy",
    category: "administrative",
    tags: ["library", "books", "timings", "fine", "digital", "issuance", "reading room"],
    fileName: 'Central_Library_Rules.pdf',
    fileType: 'pdf',
    fileSize: '25 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 3),
    content: `The Dr. S. Radhakrishnan Central Library at XYZ Engineering College is the primary knowledge hub of the campus, housing over 1,200,000 print volumes, 45,000 e-books, and subscriptions to IEEE, ACM, ScienceDirect, and Springer digital libraries.

### Working Hours & Timings:
- **Monday to Friday (Regular Days)**: 8:00 AM to 11:00 PM.
- **Saturdays & Sundays**: 9:00 AM to 8:00 PM.
- **During Mid-Semester and End-Semester Examination Weeks**: The ground floor Reading Hall remains open **24 hours a day, 7 days a week (24/7)** for quiet study.
- **National Holidays**: Library remains closed.

### Book Borrowing Privileges & Limits:
- **B.Tech Undergraduate Students**: Maximum of **5 books** can be issued simultaneously for a loan period of **14 days**.
- **M.Tech / Ph.D. Scholars**: Maximum of **8 books** for a loan period of **30 days**.
- **Faculty Members**: Maximum of **15 books** for an entire semester.
- **Reference Books, Journals, and Encyclopedias**: Marked with a red label; for in-library reading only (cannot be issued out).

### Renewal, Return & Fine for Late Return:
1. Books can be renewed online once for an additional 7 days via the Library OPAC portal, provided no other student has placed a hold or reservation on that title.
2. **Overdue Fine**: A fine of **₹5 per book per day** is charged for the first 7 days of delay beyond the due date. From the 8th day onwards, the fine increases to **₹10 per book per day**.
3. **Lost Book Policy**: If an issued book is lost or damaged, the borrower must replace it with a new copy of the same or later edition OR pay **three times the printed cost of the book** plus ₹200 processing fee.`
  },
  {
    _id: 'doc-xyz-007',
    institutionId: 'inst-xyz-001',
    title: "Hostel Rules, Curfew Timings & Room Allocation Guidelines",
    category: "administrative",
    tags: ["hostel", "mess", "curfew", "warden", "allocation", "rules", "guests"],
    fileName: 'Hostel_and_Mess_Regulations.pdf',
    fileType: 'pdf',
    fileSize: '30 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 2),
    content: `XYZ Engineering College provides separate residential hostel accommodations for boys (Blocks A, B, C, D) and girls (Blocks E, F, G). Living in the campus hostel requires strict adherence to community living standards and safety protocols.

### Room Allocation Policy:
- **First-Year Students**: Allocated double or triple occupancy rooms on a mandatory shared basis to encourage peer bonding.
- **Second & Third Year Students**: Can choose double occupancy rooms or apply for single rooms based on academic merit (previous year CGPA) and disciplinary record.
- **Final Year & Ph.D. Students**: Given priority for single occupancy air-conditioned rooms to facilitate undisturbed project and thesis research.

### Curfew Timings & Gate Pass Rules:
- **Daily Hostel Curfew**: All residents must return to their respective hostel blocks by **10:00 PM sharp**. Gate attendance is recorded biometrically.
- **Late Entry**: Entering the hostel between 10:00 PM and 11:30 PM requires prior permission from the Resident Warden and entry in the late register. Three late entries in a semester result in an official warning letter sent to parents.
- **Night Out / Weekend Leave**: Students wishing to stay overnight outside campus or visit home on weekends must submit an online **Night Out Gate Pass** request via the student portal at least 24 hours in advance, supported by parental SMS confirmation.

### Prohibited Activities in Hostels:
1. Possession or consumption of alcoholic beverages, smoking, vaping, or illegal narcotics is strictly prohibited and leads to immediate hostel expulsion and disciplinary action.
2. Use of high-power electrical appliances (heating coils, induction cooktops, room heaters, irons above 1000W) inside hostel rooms is forbidden due to electrical fire hazards.
3. **Guest Policy**: Parents and same-gender immediate family members are permitted to visit hostel guest rooms between 10:00 AM and 7:00 PM. No outside guests or day scholars are allowed inside residential student rooms overnight.`
  },
  {
    _id: 'doc-xyz-008',
    institutionId: 'inst-xyz-001',
    title: "Zero-Tolerance Anti-Ragging Policy & Reporting Mechanism",
    category: "administrative",
    tags: ["ragging", "anti-ragging", "harassment", "helpline", "discipline", "police"],
    fileName: 'Anti_Ragging_Supreme_Court_Policy.pdf',
    fileType: 'pdf',
    fileSize: '24 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 2),
    content: `In strict compliance with the directives of the Honorable Supreme Court of India, UGC Regulations, and AICTE guidelines, XYZ Engineering College maintains a **ZERO-TOLERANCE POLICY towards ragging** in any form within or outside the campus premises.

### What Constitutes Ragging?
Ragging includes any disorderly conduct, whether by words spoken or written, or by an act which has the effect of teasing, treating, or handling with rudeness a fresher or any other student; indulging in rowdy or undisciplined activities which cause or are likely to cause annoyance, hardship, physical or psychological harm, or apprehension or fear in any student; or forcing a student to perform any act which causes shame, embarrassment, or humiliation.

### Administrative & Legal Punishments for Ragging:
Any student found guilty of participating in, abetting, or instigating ragging will face immediate severe penalties, which may include:
1. Immediate suspension from attending classes and academic privileges.
2. Permanent cancellation of admission and scholarship/fellowship benefits.
3. Expulsion from the campus hostel.
4. Debarring from appearing in any test, examination, or campus placement drive.
5. **Rustication from the institution for periods ranging from 1 to 4 semesters**.
6. **Permanent expulsion from the institution with an embargo on admission to any other college**.
7. **Mandatory filing of a First Information Report (FIR) with the local police under Section 306/323/341/506 of the Indian Penal Code, carrying mandatory imprisonment**.

### How to Report Ragging (24/7 Confidential Helpline):
- **National Anti-Ragging Helpline (Toll Free)**: \`1800-180-5522\` (Available 24x7)
- **National Anti-Ragging Email**: \`helpline@antiragging.in\`
- **Campus Anti-Ragging Committee Chairman (Dean Student Affairs)**: \`+91-98765-43210\` / \`dean.sa@xyzec.edu\`
- **Campus Security Emergency Control Room**: \`+91-98765-00001\` (24/7 Quick Response Team)
- **Anonymous Drop Boxes**: Located in the main foyer of all academic blocks, hostels, and central library.`
  },
  {
    _id: 'doc-xyz-009',
    institutionId: 'inst-xyz-001',
    title: "Transfer Certificate (TC), Migration Certificate & Bonafide Process",
    category: "administrative",
    tags: ["tc", "transfer certificate", "migration", "bonafide", "transcript", "no dues", "documents"],
    fileName: 'Certificate_and_No_Dues_Process.docx',
    fileType: 'docx',
    fileSize: '21 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 1),
    content: `Students requiring official university certificates from XYZ Engineering College for higher education applications, job verification, passport issuance, or transferring to another university must follow the standardized digital administrative procedures outlined below.

### 1. Bonafide Certificate & Fee Structure Certificate:
- **Purpose**: Required for opening bank accounts, education loan applications, passport verification, or scholarship claims.
- **Process**: Apply online via the XYZ-EC Student Portal under \`Certificates -> Request Bonafide\`. Select the specific purpose and format.
- **Processing Time**: Automated digital issuance with QR code verification within **24 working hours**. Download directly from portal or collect physical stamped copy from Window 3 of the Admin Block. Fee: **Free of cost**.

### 2. Official Academic Transcripts:
- **Purpose**: Required for applying to universities abroad (MS/MBA) or background verification by employers.
- **Process**: Submit application on portal with copies of all semester marksheets. Specify whether sealed physical envelopes or direct electronic transmission (WES/ECE) is required.
- **Fee & Time**: ₹300 per set of transcripts. Ready for dispatch or collection within **5 working days**.

### 3. Transfer Certificate (TC) & Migration Certificate:
- **Prerequisite**: TC and Migration certificates are issued ONLY after the completion of the degree program or upon formal approved withdrawal from the college.
- **Mandatory "No Dues" Clearance**: Before applying for TC, students must clear all outstanding liabilities and obtain online digital "No Dues" clearance from 8 departments:
  1. Central Library (no overdue books or fines)
  2. Hostel Warden & Mess Account (no room damage or unpaid mess dues)
  3. Accounts Section (all tuition and exam fees paid)
  4. Department Lab In-Charge (no broken equipment liabilities)
  5. Sports Department
  6. Campus Security Section
  7. Alumni Association (registration complete)
  8. Placement Cell
- **Issuance**: Once online No Dues is 100% complete, apply for TC/Migration. Certificates are issued within **7 working days** from the Registrar's Office (Window 1).`
  },
  {
    _id: 'doc-xyz-010',
    institutionId: 'inst-xyz-001',
    title: "Merit Scholarships, Need-Based Aid & Government Scholarship Schemes",
    category: "administrative",
    tags: ["scholarship", "financial aid", "merit", "nsp", "fee waiver", "stipend"],
    fileName: 'Scholarships_and_Financial_Aid.pdf',
    fileType: 'pdf',
    fileSize: '26 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 86400000 * 1),
    content: `XYZ Engineering College is committed to ensuring that no meritorious student is deprived of quality education due to financial constraints. Numerous financial aid schemes and scholarships are available for eligible undergraduate students.

### 1. Institute Merit-cum-Means (McM) Scholarship:
- **Eligibility**: Students with parental annual income from all sources below **₹6,00,000 per annum** who maintain a minimum academic **CGPA of 8.0 or above** with no active backlogs or disciplinary warnings.
- **Benefit**: **50% tuition fee waiver** for the subsequent academic year.
- **Application Window**: Applications open annually between August 1 and August 30 on the student portal. Required documents: Income Certificate issued by Tehsildar/SDM, ITR return copy, and previous year marksheets.

### 2. Dean's Academic Excellence Award:
- **Eligibility**: Awarded automatically to the top **5% rank holders** in each engineering department based on the annual CGPA at the end of every academic year.
- **Benefit**: One-time cash prize of **₹25,000**, a Certificate of Excellence, and priority allocation for research internships.

### 3. Government Scholarship Schemes (NSP Portal):
Students are encouraged to apply for state and central government scholarships through the National Scholarship Portal (NSP at \`https://scholarships.gov.in\`):
- **Central Sector Scheme of Scholarship for College Students**: For students scoring above 80th percentile in Class 12 board exams.
- **Post-Matric Scholarship for SC/ST/OBC Students**: 100% tuition fee reimbursement and monthly maintenance stipend for students belonging to SC/ST categories with family income below ₹2,50,000 per annum.
- **Pragati Scholarship for Girls (AICTE)**: ₹50,000 per annum awarded to girl students pursuing technical education (maximum two girls per family).
- **Verification Process**: Submit printouts of online NSP application along with Aadhaar, bank passbook, and fee receipts to Scholarship Cell (Room 104, Admin Block) before October 15 for college institutional verification.`
  },
  {
    _id: 'doc-xyz-011',
    institutionId: 'inst-xyz-001',
    title: "Training & Placement Cell — Guidelines, Eligibility & Internship Policy",
    category: "academic",
    tags: ["placement", "internship", "jobs", "tpo", "companies", "eligibility", "resume"],
    fileName: 'Training_and_Placement_Guidelines.pdf',
    fileType: 'pdf',
    fileSize: '35 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 36000000),
    content: `The Training & Placement Office (TPO) at XYZ Engineering College facilitates campus recruitment drives, industry training, summer internships, and career counseling for all engineering students.

### General Eligibility for Campus Recruitment Drives:
1. **Academic Cutoff**: To sit for major IT services, core engineering, and product company recruitment drives, students generally must maintain a **minimum CGPA of 6.50** (or 65% aggregate) with **NO active backlogs** at the time of the recruitment process. Some premium Tier-1 product companies set cutoffs at CGPA 7.50 or 8.00.
2. **Attendance in Pre-Placement Talks (PPT)**: Attendance in scheduled PPTs is mandatory for students who have registered for a particular company. Missing a PPT without prior medical leave results in disqualification from that recruitment drive.

### The "One Student, One Job" Policy:
To ensure equitable employment opportunities across the student body, the campus enforces a strict placement policy:
- **Standard Tier (CTC below ₹8 LPA)**: Once a student secures a job offer from a company in this tier, they are deregistered from further recruitment drives in this tier.
- **Dream Tier (CTC ₹8 LPA to ₹15 LPA)**: Students holding a Standard Tier offer can upgrade by appearing for Dream Tier companies. Once a Dream Tier offer is secured, prior Standard Tier offers must be released within 24 hours.
- **Super Dream Tier (CTC ₹15 LPA and above)**: Open to all students holding Standard or Dream offers. A student securing a Super Dream offer is permanently deregistered from all subsequent placement activities.

### Six-Month Industrial Internship Policy (8th Semester):
- Students in their final semester (8th sem) are permitted to undertake full-time industrial internships at recognized companies or research labs from January to June.
- **Requirements**: The internship stipend must be at least ₹20,000/month. The student must submit a monthly progress report signed by their industry supervisor and present a final defense presentation before the college evaluation committee in May for earning their 10 semester credits.`
  },
  {
    _id: 'doc-xyz-012',
    institutionId: 'inst-xyz-001',
    title: "Student Clubs, Extracurricular Organizations & Technical Societies",
    category: "general",
    tags: ["clubs", "societies", "sports", "cultural", "fest", "extracurricular", "gymkhana"],
    fileName: 'Student_Gymkhana_Clubs.pdf',
    fileType: 'pdf',
    fileSize: '19 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 36000000),
    content: `The Student Gymkhana at XYZ Engineering College is the governing body for all co-curricular, technical, cultural, and sports activities on campus, offering over 35 active student-run clubs to foster leadership, creativity, and holistic development.

### Major Technical Societies & Chapters:
1. **ACM Student Chapter**: Conducts weekly competitive coding contests, hackathons, and algorithms workshops.
2. **IEEE Student Branch**: Focuses on robotics, IoT, VLSI design, and publishes an annual student research journal.
3. **GDSC (Google Developer Student Club)**: Organizes Android development, Flutter, cloud computing, and AI/ML bootcamps.
4. **Enactus & E-Cell (Entrepreneurship Cell)**: Mentors student startups, conducts business plan competitions, and hosts the annual E-Summit with venture capitalist mentorship.

### Cultural & Performing Arts Clubs:
- **Crescendo (Music Club)**: Western and classical bands, instrumental training, and acoustic acoustics nights.
- **Terpsichore (Dance Society)**: Hip-hop, contemporary, classical, and street dance crews representing college in national fests.
- **Yavanika (Dramatics Society)**: Stage plays, street plays (Nukkad Natak), and mime performances.
- **Literaria (Debating & Literary Society)**: Parliamentary debates, MUN (Model United Nations), poetry slams, and campus magazine editing.

### How to Join Clubs:
- **Annual Club Recruitment Drive**: Held during the second and third weeks of August every year. Freshers can visit club stalls during the "Club Fiesta" in the campus amphitheater, register for auditions or technical tasks, and join up to a maximum of **3 clubs simultaneously** to balance academics with extracurricular engagement.`
  },
  {
    _id: 'doc-xyz-013',
    institutionId: 'inst-xyz-001',
    title: "Computer Lab & Engineering Workshop Timings, Safety Rules & Access",
    category: "academic",
    tags: ["labs", "computers", "workshop", "timings", "safety", "wifi", "equipment"],
    fileName: 'Computer_Lab_Safety_Rules.docx',
    fileType: 'docx',
    fileSize: '16 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 18000000),
    content: `The academic blocks at XYZ Engineering College house 12 state-of-the-art computer laboratories, electronics workstations, and mechanical fabrication workshops designed to provide hands-on practical engineering training.

### Lab Working Hours & Open Access Timings:
- **Scheduled Academic Lab Classes**: Monday to Friday, 8:30 AM to 4:30 PM (as per timetable).
- **Open Access / Practice Timings**: Students can utilize Lab-4 (Open Source & AI Lab) and Lab-7 (General Computing Lab) for project work and self-study from **4:30 PM to 9:00 PM on weekdays** and **9:00 AM to 5:00 PM on Saturdays**.
- **Requirement**: Must carry student ID card and enter details in the biometric digital access register at the lab entrance.

### Mandatory Lab Safety & Code of Conduct:
1. **Dress Code & Safety Gear**: In mechanical workshops and electrical machines labs, wearing closed-toe leather shoes and cotton lab coats is strictly mandatory. Loose clothing, sandals, or hanging jewelry are forbidden around rotating machinery.
2. **Food & Beverages**: Strictly prohibited inside all computer and electronics laboratories to prevent liquid spills and damage to sensitive hardware and keyboards.
3. **System Security & Network Rules**:
   - Installing unauthorized software, games, cryptocurrency miners, or hacking tools on lab computers leads to instant termination of campus network account and disciplinary action.
   - Users must save their personal project data on cloud storage (Google Drive/GitHub) or external USB drives. Local hard drives (C: and D: partitions) are automatically wiped clean and restored by DeepFreeze software every night at 10:00 PM.`
  },
  {
    _id: 'doc-xyz-014',
    institutionId: 'inst-xyz-001',
    title: "Campus Health Center, Emergency Medical Services & Health Insurance",
    category: "general",
    tags: ["medical", "doctor", "health", "hospital", "ambulance", "insurance", "emergency"],
    fileName: 'Health_Center_and_Insurance.pdf',
    fileType: 'pdf',
    fileSize: '24 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 18000000),
    content: `XYZ Engineering College provides comprehensive primary healthcare, emergency medical response, and mental health counseling services to ensure the physical and emotional well-being of all students and staff.

### Institute Health Center Facilities & Timings:
- **Location**: Ground Floor, Student Services Building (Opposite Sports Complex).
- **Outpatient Department (OPD) Timings**: Monday to Saturday, **8:00 AM to 8:00 PM**.
- **Medical Staff**: Two resident medical officers (general physicians), one visiting dental surgeon (Tuesdays/Thursdays), one visiting orthopedic consultant (Wednesdays), and three qualified nursing staff.
- **Free Basic Pharmacy**: Common prescription medications, antibiotics, painkillers, and first-aid dressings are dispensed free of cost to students upon presentation of college ID.
- **Pathology & Diagnostic Lab**: Basic blood tests (CBC, blood sugar, lipid profile, malaria/dengue screening) and ECG facilities available at subsidized rates between 8:00 AM and 12:00 Noon.

### 24/7 Emergency Response & Ambulance Service:
- **Emergency Medical Control Room**: \`+91-98765-00002\` or internal extension \`102\` (Manned 24/7/365).
- **Dedicated Campus Ambulance**: Two Advanced Life Support (ALS) ambulances are stationed permanently at the Health Center gate for rapid emergency transfer of severe cases to Apollo City Hospital (located 4 km from campus).

### Student Mediclaim & Group Health Insurance Policy:
1. Every registered B.Tech student is automatically covered under a mandatory **₹2,00,000 Group Cashless Health Insurance Policy** provided by Star Health Insurance.
2. **Coverage**: Covers hospitalization expenses for surgeries, accidents, dengue/malaria treatment, and severe illnesses at over 5,000 network hospitals nationwide.
3. **How to Claim**: In case of planned or emergency hospitalization, contact the Insurance Desk at the Health Center within 24 hours to obtain the cashless authorization E-card and pre-authorization form.`
  },
  {
    _id: 'doc-xyz-015',
    institutionId: 'inst-xyz-001',
    title: "Sports Complex, Gymnasium Timings & Athletic Facilities",
    category: "general",
    tags: ["sports", "gym", "swimming", "badminton", "cricket", "football", "timings"],
    fileName: 'Sports_Complex_Guidelines.pdf',
    fileType: 'pdf',
    fileSize: '27 KB',
    uploadedBy: 'admin@xyzec.edu',
    createdAt: new Date(Date.now() - 3600000),
    content: `XYZ Engineering College boasts an Olympic-standard sports complex designed to encourage physical fitness, sportsmanship, and athletic excellence among students.

### Outdoor Athletic Facilities:
- **Cricket Ground**: International standard lush green outfield with turf wickets and floodlights for evening practice matches.
- **Football & Athletics Stadium**: Full-size FIFA-compliant synthetic turf football pitch surrounded by an 8-lane 400-meter all-weather synthetic running track.
- **Tennis & Basketball Courts**: Four synthetic lawn tennis courts and three outdoor basketball courts equipped with high-intensity LED floodlighting (open until 9:30 PM daily).

### Indoor Sports Complex & Aquatics Center:
- **Badminton Hall**: Six wooden-floor indoor badminton courts with anti-glare lighting.
- **Table Tennis & Squash**: Dedicated air-conditioned hall with 10 TT tables and two glass squash courts.
- **Swimming Pool**: 50-meter 8-lane Olympic-size swimming pool with continuous water filtration and temperature regulation.
  - *Pool Timings (Men)*: 6:00 AM to 8:00 AM and 5:00 PM to 7:00 PM.
  - *Pool Timings (Women)*: 8:00 AM to 9:30 AM and 7:00 PM to 8:30 PM.
  - *Mandatory Swimming Rules*: Proper nylon swimsuits and swimming caps are strictly mandatory. Showering before entering the pool is compulsory.

### Central Gymnasium & Fitness Center:
- **Equipment**: Air-conditioned 5,000 sq. ft. fitness center equipped with modern LifeFitness cardio treadmills, elliptical cross-trainers, free weights, squat racks, and multi-station strength machines.
- **Gym Timings**: Morning session: **5:30 AM to 9:30 AM** | Evening session: **4:30 PM to 9:00 PM**.
- **Professional Trainers**: Two certified strength and conditioning coaches are available during morning and evening hours to provide free workout guidance, posture correction, and diet counseling to students.`
  }
];

// In-Memory Storage Arrays
export const mockStudents = [
  {
    studentId: "STU-XYZ-001",
    name: "Arjun Sharma",
    email: "student@xyzec.edu",
    department: "Computer Science & Engineering",
    year: 3,
    interests: ["Artificial Intelligence", "Full Stack Development", "Cloud Computing", "Badminton"],
    institutionId: "inst-xyz-001",
    isActive: true,
  }
];

export const mockConversations = [
  {
    sessionId: "demo-sess-001",
    studentId: "STU-XYZ-001",
    institutionId: "inst-xyz-001",
    title: "Welcome Inquiry: Fee Structure & Attendance at XYZ-EC",
    messageCount: 2,
    updatedAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 3600000),
    messages: [
      {
        role: "user",
        content: "Hello! Can you tell me about the attendance policy and fee structure at XYZ Engineering College?",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        role: "assistant",
        content: `Welcome to the **XYZ Engineering College Digital Helpdesk**! Here is a summary of our official regulations:

### 📊 Mandatory Attendance Policy:
- **Minimum Requirement**: You must maintain at least **75% physical attendance** in every theory and laboratory course.
- **Medical Condonation**: Shortages between **65% and 74%** can be condoned on valid medical grounds upon submitting a medical certificate within 5 days and paying ₹1,000 per subject.
- **Below 65%**: Attendance below 65% is **never condoned** and results in a "DT" (Detained) grade.

### 💰 B.Tech Fee Structure (Per Semester):
- **Tuition Fee**: ₹1,50,000
- **Development & Other Academic Fees**: ₹25,000
- **Total Day Scholar Fee**: **₹1,75,000 per semester**
- **Hostel & Mess (Optional)**: ₹60,000 per semester

*Let me know if you need specific details on examination rules, library timings, or scholarships at XYZ-EC!*`,
        sources: [
          "Mandatory Attendance Policy & Shortage Condonation Rules",
          "Comprehensive Fee Structure & Payment Deadlines (B.Tech Program)"
        ],
        timestamp: new Date(Date.now() - 3590000),
      }
    ]
  }
];

/**
 * Search mock knowledge documents using keyword matching, scoped by institutionId.
 */
export function searchMockDocs(query, topK = 4, institutionId = 'inst-xyz-001') {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter(w => w.length > 2);
  const scored = [];

  for (const doc of MOCK_DOCS) {
    if (doc.institutionId && doc.institutionId !== institutionId) continue;

    let score = 0;
    const contentLower = doc.content.toLowerCase();
    const titleLower = doc.title.toLowerCase();

    for (const kw of keywords) {
      if (contentLower.includes(kw)) score += 1;
      if (titleLower.includes(kw)) score += 3;
      if (doc.tags.includes(kw)) score += 2;
    }

    if (score > 0) {
      scored.push({
        text: doc.content,
        score: score,
        docTitle: doc.title,
        category: doc.category,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// --- Super Admin Mock Stores for Gallery, Fee Structure & Announcements ---

export const mockGallery = [
  {
    id: 'gal-001',
    title: 'New AI & Robotics Research Center Inauguration',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    category: 'progress',
    date: '2026-06-15',
    caption: 'State-of-the-art NVIDIA GPU clusters installed for undergraduate AI projects.'
  },
  {
    id: 'gal-002',
    title: 'Annual Technical Fest InnoVision 2026 Hackathon Finals',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    category: 'events',
    date: '2026-05-10',
    caption: 'Over 400 student teams competing for the 10 Lakh Innovation Prize.'
  },
  {
    id: 'gal-003',
    title: 'Campus Aerial Walkthrough & Green Energy Solar Roofs',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'campus',
    date: '2026-04-01',
    caption: 'XYZ Engineering College becomes 100% solar net-zero power powered.'
  }
];

export const mockFees = [
  { id: 'fee-001', program: 'B.Tech Computer Science & Engg', tuitionFee: '₹1,50,000', developmentFee: '₹15,000', examFee: '₹5,000', totalSemester: '₹1,70,000', dueDate: '10 July 2026' },
  { id: 'fee-002', program: 'B.Tech Electronics & Comm.', tuitionFee: '₹1,35,000', developmentFee: '₹15,000', examFee: '₹5,000', totalSemester: '₹1,55,000', dueDate: '10 July 2026' },
  { id: 'fee-003', program: 'B.Tech Mechanical & Automation', tuitionFee: '₹1,20,000', developmentFee: '₹12,000', examFee: '₹5,000', totalSemester: '₹1,37,000', dueDate: '10 July 2026' },
  { id: 'fee-004', program: 'Hostel & Residential Dining', tuitionFee: '₹35,000 (Rent)', developmentFee: '₹25,000 (Mess)', examFee: '₹0', totalSemester: '₹60,000', dueDate: '15 July 2026' }
];

export const mockAnnouncements = [
  { id: 'ann-001', title: 'Mid-Semester Examination Schedule Published', date: '2026-07-01', targetRole: 'all', priority: 'high', content: 'Odd semester midterm exams start from September 15. Check student portal for hall tickets.' },
  { id: 'ann-002', title: 'TPO Alert: Microsoft & Google Campus Drives', date: '2026-06-28', targetRole: 'student', priority: 'high', content: 'Final year B.Tech students with CGPA >= 7.0 should submit their resumes by Friday.' },
  { id: 'ann-003', title: 'Faculty & Staff Annual Curriculum Review', date: '2026-06-20', targetRole: 'staff', priority: 'medium', content: 'All departmental HODs and teaching staff are requested to attend the syllabus revision meeting.' }
];


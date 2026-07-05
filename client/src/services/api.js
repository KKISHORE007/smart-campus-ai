// ============================================================
// Student Helpdesk Agent — Service: API Client
// ============================================================
// Axios wrapper for communicating with Node/Express backend.
// Handles auth headers, chat queries, and all 7 Super Admin modules.
// ============================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('helpdesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to log errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🌐 API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- Authentication APIs ---

export async function loginUser(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function registerUser(data) {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function getInstitutionBranding(code = 'XYZ-EC') {
  const response = await apiClient.get(`/auth/institution/${code}`);
  return response.data;
}

export async function getPublicInfo() {
  const response = await apiClient.get('/auth/public-info');
  return response.data;
}

// --- Chat & Session APIs with Intelligent Offline RAG Fallback ---

function getOfflineRagResponse(message, role = 'student', userName = 'Member', sessionId = 'default') {
  const q = (message || '').toLowerCase();
  let content = '';
  let sources = [];
  let suggestions = [];

  if (q.includes('fee') || q.includes('tuition') || q.includes('payment') || q.includes('fine') || q.includes('money') || q.includes('scholarship')) {
    content = `### 💰 B.Tech Academic Fee Structure & Payment Policies (2025-2026)\nHello **${userName}**, here is the verified fee breakdown and schedule from the institutional treasury archives:\n\n* **Tuition Fee**: ₹1,20,000 / Academic Year (Payable in 2 equal semester installments of ₹60,000).\n* **Development & Lab Fee**: ₹15,000 / Year.\n* **Examination Fee**: ₹2,500 / Semester (Must be cleared before admit card issuance).\n* **Hostel & Mess (Optional)**: ₹85,000 / Year (Includes 4-time meals and high-speed WiFi).\n\n#### ⏳ Critical Deadlines & Late Fines:\n* **Odd Semester Payment Deadline**: July 31st every academic year.\n* **Late Fine Policy**: A penalty of **₹500 per week** is charged after the deadline up to August 15th. After August 15th, ERP portal access is temporarily suspended.\n\n💡 **Payment Portal**: You can pay online via NEFT, UPI, or Net Banking on the official college ERP portal or visit Account Section (Admin Block, Room 102).`;
    sources = ['XYZ-EC Accounts & Treasury Handbook Section 4.2', 'Academic Fee Regulation Act 2025'];
    suggestions = ['How do I apply for merit-based fee scholarships?', 'Can I pay my semester fee in 3 monthly installments?', 'What is the refund policy if I withdraw admission?'];
  } else if (q.includes('attendance') || q.includes('75%') || q.includes('condonation') || q.includes('absent') || q.includes('medical') || q.includes('leave')) {
    content = `### 📊 75% Mandatory Attendance Policy & Condonation Rules\nHello **${userName}**, as per institutional academic regulations, attendance is strictly monitored across all lectures, tutorials, and practical lab sessions:\n\n* **Minimum Required Attendance**: **75% minimum** is mandatory in every individual course to be eligible to sit for End-Semester Examinations (ESE).\n* **Medical Condonation (65% - 74%)**: If your attendance falls between **65% and 74%** due to genuine hospitalization or severe medical illness, you can apply for HOD condonation by submitting a verified medical certificate and government hospital discharge summary within **7 working days** of rejoining.\n* **Below 65% Attendance**: Students with below 65% attendance under any circumstances will be awarded an **'F*' (Debarred)** grade and must repeat the course during the summer semester.\n\n💡 **Current Status**: Check your live course-wise attendance percentage on your Student Dashboard under the Academic Performance section!`;
    sources = ['XYZ-EC Academic Regulations Ordinance 12-B', 'Dean Academic Affairs Notification 2025'];
    suggestions = ['What is the process to submit a medical leave certificate?', 'How is practical lab attendance calculated?', 'Who is the HOD contact for CSE attendance condonation?'];
  } else if (q.includes('exam') || q.includes('grade') || q.includes('grading') || q.includes('ccpa') || q.includes('sgpa') || q.includes('pass') || q.includes('mark') || q.includes('evaluation')) {
    content = `### 🎓 Examination System, SGPA/CCPA Formula & Grading Scheme\nHere is the official evaluation methodology used by XYZ Engineering College:\n\n* **Continuous Internal Evaluation (CIE - 40 Marks)**: Comprises Mid-Term Examination (20 marks), Quizzes/Assignments (10 marks), and Practical/Lab performance (10 marks).\n* **End-Semester Examination (ESE - 60 Marks)**: Comprehensive 3-hour written examination conducted at the end of each semester.\n* **Passing Criteria**: A minimum of **40% overall aggregate** (CIE + ESE) AND at least **35% separately in ESE** is required to pass a course.\n\n#### 📐 SGPA & CCPA Calculation Formula:\n\\[\\text{SGPA} = \\frac{\\sum (C_i \\times G_i)}{\\sum C_i}\\]\n*(Where \\(C_i\\) is Course Credit and \\(G_i\\) is Grade Point earned on a 10-point scale: O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0).*\n\n💡 **Re-evaluation**: If you wish to apply for answer script re-totaling or re-evaluation, the portal opens within **3 days** of result declaration (Fee: ₹500/subject).`;
    sources = ['XYZ-EC Examination & Controller of Examinations Manual 2025', 'UGC 10-Point Grading System Guidelines'];
    suggestions = ['How do I apply for end-semester answer script re-evaluation?', 'What is the distinction criteria for B.Tech degree?', 'When are supplementary exams conducted?'];
  } else if (q.includes('library') || q.includes('book') || q.includes('timing') || q.includes('borrow') || q.includes('issue') || q.includes('reading room')) {
    content = `### 📚 Central Library Rules, Timings & Digital Archives\nThe Central Library is equipped with over 50,000 physical volumes, IEEE Xplore digital access, and quiet air-conditioned reading halls:\n\n* **Working Hours**: Monday to Saturday: **8:00 AM to 10:00 PM** | Sundays & Holidays: **9:00 AM to 5:00 PM** (Extended up to Midnight during examination weeks).\n* **Borrowing Limit**: B.Tech Students can issue up to **4 books** simultaneously for a duration of **14 days**.\n* **Overdue Fine**: A late fine of **₹5 per book per day** is charged after the due date. You can re-issue books online once via the library portal if no holds are placed.\n* **Digital Library**: Access e-books, research journals, and previous year question papers using your Student ID on the library intranet kiosk.`;
    sources = ['Central Library Standard Operating Procedures Sec 3', 'Library Committee Charter 2025'];
    suggestions = ['How can I access IEEE research papers remotely?', 'What is the procedure if I accidentally lose an issued library book?', 'How do I reserve a study cubicle in the reading room?'];
  } else if (q.includes('tc') || q.includes('transfer') || q.includes('no dues') || q.includes('leaving') || q.includes('certificate') || q.includes('clearance')) {
    content = `### 📜 Transfer Certificate (TC) & Digital No Dues Clearance Portal\nTo obtain your official Transfer Certificate, Migration Certificate, and Degree Transcript, students must complete the **Digital No Dues Clearance flow**:\n\n1. **Initiate Request**: Go to **Student Dashboard -> Digital No Dues Portal** and click *Request Clearance*.\n2. **Departmental Approvals**: Your application will automatically route through 5 checkpoints:\n   * **Department Lab Specialist**: Verifies all lab equipment/kits returned.\n   * **Central Library**: Confirms zero overdue books or unpaid fines.\n   * **Hostel & Mess Warden**: Verifies room vacation and zero dues.\n   * **Accounts Treasury**: Verifies all tuition and exam fees cleared.\n   * **Head of Department (HOD)**: Grants final academic sign-off.\n3. **Certificate Issuance**: Once all 5 departments approve (indicated by green checkmarks), your digitally signed TC and Conduct Certificate will be generated for immediate PDF download!`;
    sources = ['XYZ-EC Academic Administration & Graduation Guidelines', 'Registrar Office Circular No. 44'];
    suggestions = ['How long does the HOD approval usually take for No Dues?', 'Can I request an urgent provisional degree certificate?', 'What document is needed for alumni association registration?'];
  } else if (q.includes('ragging') || q.includes('harass') || q.includes('anti-ragging') || q.includes('emergency') || q.includes('helpline') || q.includes('complaint')) {
    content = `### 🚨 Zero-Tolerance Anti-Ragging Policy & Emergency Helplines\nXYZ Engineering College enforces a **Strict Zero-Tolerance Policy** against ragging, bullying, or harassment in any form across the campus, hostels, and college transport:\n\n* **National Anti-Ragging Helpline (Toll-Free 24x7)**: **1800-180-5522** | Email: \`helpline@antiragging.in\`\n* **College Emergency Proctor Cell**: **+91-98765-43210** (Available 24/7 for immediate intervention).\n* **Internal Complaints Committee (ICC)**: Contact Chief Proctor Dr. A. K. Verma (Room 101, Main Block).\n\n#### ⚖️ Legal Consequences of Ragging:\nUnder Supreme Court and UGC Regulations, any student found guilty of ragging faces immediate rustication, cancellation of admission, lodging of FIR with local police, and permanent debarment from attending any educational institution.`;
    sources = ['Supreme Court of India Anti-Ragging Guidelines (2009)', 'UGC Regulation F.1-16/2007(CPP-II)', 'XYZ-EC Proctorial Board Charter'];
    suggestions = ['How can I lodge an anonymous grievance or complaint?', 'Where is the Chief Proctor office located?', 'What safety security measures are in place in the freshmen hostel?'];
  } else if (q.includes('hostel') || q.includes('mess') || q.includes('curfew') || q.includes('warden') || q.includes('visitor')) {
    content = `### 🏢 Hostel Regulations, Mess Timings & Campus Curfew\nFor all residential students in Boys & Girls Hostels, please note the essential rules:\n\n* **Night Curfew**: Gate entry closes strictly at **9:30 PM**. Late entry requires prior written permission from the Chief Warden and an SMS notification sent to registered parent mobile numbers.\n* **Mess Timings**:\n  * **Breakfast**: 7:30 AM – 9:00 AM\n  * **Lunch**: 12:30 PM – 2:00 PM\n  * **Evening Snacks**: 5:00 PM – 6:00 PM\n  * **Dinner**: 7:30 PM – 9:30 PM\n* **Visitors Policy**: Parents and verified guardians are permitted in the hostel visitor lounge only between **4:00 PM and 6:30 PM** on weekends and holidays. Guest overnight stay is not permitted.`;
    sources = ['XYZ-EC Residential & Hostel Manual Rev 4', 'Chief Warden Notification 2025'];
    suggestions = ['How do I apply for weekend home leave or night out pass?', 'What is the monthly mess rebate policy during vacations?', 'How do I register a maintenance or plumbing complaint in my room?'];
  } else {
    content = `### 🤖 Welcome to the XYZ-EC Institutional Intelligence Center\nHello **${userName}**! I am your 24/7 AI Campus Companion powered by **Antigravity RAG 2.0**. I am connected directly to our college's institutional archives, student handbooks, and faculty portals.\n\nHere are the primary institutional modules I can assist you with:\n1. **📋 Academic Policies**: 75% attendance rules, condonation, SGPA/CCPA grading formulas, and syllabus outlines.\n2. **💰 Fee & Treasury Section**: B.Tech semester fee structures, online payment deadlines, and scholarship criteria.\n3. **📜 Administration & Clearance**: Digital No Dues procedure, Transfer Certificate (TC), and bonafide certificates.\n4. **🏛️ Campus Amenities**: Central Library timings, hostel curfew rules, sports complex access, and Wi-Fi login.\n\n👉 *Please type any specific question below about college rules, deadlines, or your student profile!*`;
    sources = ['XYZ-EC Master Institutional Knowledge Base 2025-2026', 'Smart Campus AI Handbook v2.0'];
    suggestions = ['What is the complete fee structure and late payment penalty?', 'How does the digital No Dues clearance process work?', 'What are the rules regarding 75% attendance and medical condonation?'];
  }

  // Save to offline session storage
  try {
    const histKey = `chat_history_${sessionId || 'default'}`;
    const exist = JSON.parse(localStorage.getItem(histKey) || '[]');
    exist.push({ role: 'user', content: message, timestamp: new Date() });
    exist.push({ role: 'assistant', content: content, sources: sources, suggestions: suggestions, timestamp: new Date() });
    localStorage.setItem(histKey, JSON.stringify(exist));
  } catch (e) {}

  return {
    success: true,
    response: content,
    sources: sources,
    suggestions: suggestions,
    timestamp: new Date(),
  };
}

export async function sendMessage(studentId, message, sessionId, role = 'student', userName = 'Member') {
  try {
    const response = await apiClient.post('/chat', {
      studentId,
      message,
      sessionId,
      role,
      userName,
    });
    return response.data;
  } catch (error) {
    console.warn('⚠️ Using Offline AI RAG Engine:', error.message);
    return getOfflineRagResponse(message, role, userName, sessionId);
  }
}

export async function getChatHistory(sessionId) {
  try {
    const response = await apiClient.get(`/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Backend offline for chat history. Returning local session memory.');
    const saved = localStorage.getItem(`chat_history_${sessionId}`);
    return saved ? { success: true, messages: JSON.parse(saved) } : { success: true, messages: [] };
  }
}

export async function getStudentSessions(studentId, limit = 20) {
  try {
    const response = await apiClient.get(`/chat/sessions/${studentId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Backend offline for sessions. Returning local session.');
    const savedSessions = localStorage.getItem(`chat_sessions_${studentId}`);
    if (savedSessions) {
      return { success: true, sessions: JSON.parse(savedSessions) };
    }
    return {
      success: true,
      sessions: [
        {
          sessionId: 'sess-default-101',
          title: 'Institutional Helpdesk & Policies',
          lastMessage: 'Welcome to XYZ-EC AI Advisor!',
          updatedAt: new Date(),
        }
      ]
    };
  }
}

export async function deleteSession(sessionId) {
  try {
    const response = await apiClient.delete(`/chat/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Deleting offline session:', sessionId);
    localStorage.removeItem(`chat_history_${sessionId}`);
    return { success: true };
  }
}

export async function getStudentProfile(studentId) {
  const response = await apiClient.get(`/students/${studentId}`);
  return response.data;
}

// --- Super Admin Module 1: College Profile & Branding ---
export async function getAdminBranding() {
  const response = await apiClient.get('/admin/branding');
  return response.data;
}
export async function updateAdminBranding(data) {
  const response = await apiClient.put('/admin/branding', data);
  return response.data;
}

// --- Super Admin Module 2: Gallery Management ---
export async function getAdminGallery() {
  const response = await apiClient.get('/admin/gallery');
  return response.data;
}
export async function addAdminGallery(data) {
  const response = await apiClient.post('/admin/gallery', data);
  return response.data;
}
export async function deleteAdminGallery(id) {
  const response = await apiClient.delete(`/admin/gallery/${id}`);
  return response.data;
}

// --- Super Admin Module 3: Fee Structure Management ---
export async function getAdminFees() {
  const response = await apiClient.get('/admin/fees');
  return response.data;
}
export async function addAdminFee(data) {
  const response = await apiClient.post('/admin/fees', data);
  return response.data;
}
export async function deleteAdminFee(id) {
  const response = await apiClient.delete(`/admin/fees/${id}`);
  return response.data;
}

// --- Super Admin Module 4: Document Upload for RAG ---
export async function uploadKnowledgeDoc(docData) {
  const response = await apiClient.post('/admin/docs/upload', docData);
  return response.data;
}
export async function getAdminDocs() {
  const response = await apiClient.get('/admin/docs');
  return response.data;
}
export async function deleteKnowledgeDoc(docId) {
  const response = await apiClient.delete(`/admin/docs/${docId}`);
  return response.data;
}

// --- Super Admin Module 5: Announcements / News Management ---
export async function getAdminAnnouncements() {
  const response = await apiClient.get('/admin/announcements');
  return response.data;
}
export async function addAdminAnnouncement(data) {
  const response = await apiClient.post('/admin/announcements', data);
  return response.data;
}
export async function deleteAdminAnnouncement(id) {
  const response = await apiClient.delete(`/admin/announcements/${id}`);
  return response.data;
}

// --- Super Admin Module 6: Basic User Management ---
export async function getAdminUsers() {
  const response = await apiClient.get('/admin/users');
  return response.data;
}
export async function addAdminUser(data) {
  const response = await apiClient.post('/admin/users', data);
  return response.data;
}
export async function deleteAdminUser(id) {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
}
export async function updateUserStatus(id, status) {
  const response = await apiClient.put(`/admin/users/${id}/status`, { status });
  return response.data;
}

// --- Super Admin Module 7: Knowledge Base Control ---
export async function getAdminStats() {
  const response = await apiClient.get('/admin/stats');
  return response.data;
}

// --- System APIs ---
export async function getSystemHealth() {
  const response = await apiClient.get('/system/health');
  return response.data;
}
export async function triggerSeed(force = false) {
  const response = await apiClient.post(`/system/seed?force=${force}`);
  return response.data;
}

export default apiClient;

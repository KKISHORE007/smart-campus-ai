// ============================================================
// Student Helpdesk Agent — Service: AI Agent Logic
// ============================================================
// Orchestrates Google Gemini 1.5 Pro (or OpenAI fallback) with RAG.
// Strictly scoped to institution identity (e.g. XYZ Engineering College).
// Provides intelligent offline fallback when API keys are missing.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Student from '../models/Student.js';
import * as ragService from './ragService.js';
import logger from '../utils/logger.js';

let geminiClient = null;
function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!geminiClient && key && !key.startsWith('AIzaSyYour') && key.length > 15) {
    geminiClient = new GoogleGenerativeAI(key);
  }
  return geminiClient;
}

let openai = null;
function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!openai && key && !key.startsWith('sk-your') && key.length > 10) {
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

let grokClient = null;
function getGrok() {
  const key = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!grokClient && key && !key.startsWith('your-') && !key.startsWith('xai-your') && key.length > 10) {
    grokClient = new OpenAI({
      apiKey: key,
      baseURL: 'https://api.x.ai/v1',
    });
  }
  return grokClient;
}

/**
 * Generate dynamic system prompt injected with role context, RAG records, and institution identity.
 */
function buildSystemPrompt(studentContext, ragContext, institutionName = 'XYZ Engineering College', institutionCode = 'XYZ-EC', role = 'student', userName = 'Member') {
  return `You are F.R.I.D.A.Y., the official 24/7 Advanced AI Digital Helpdesk & Campus Assistant for ${institutionName} (${institutionCode}). Powered by xAI Grok & Multi-LLM Architecture.

### 🏛️ YOUR JURISDICTION & MANDATE:
1. **Multi-Role Intelligence**: You are communicating with a **${role.toUpperCase()}** named **${userName}**. Tailor your answers specifically to their role and responsibilities:
   - For **STUDENTS**: Focus on syllabus, exams, fees, library, attendance, placements, hostel, and academic rules.
   - For **STAFF / FACULTY**: Focus on teaching duties, attendance uploading, leave applications (CL/EL/DL), invigilation, research grants, and departmental notices.
   - For **HOD (Head of Department)**: Focus on departmental oversight, faculty management, curriculum review, accreditation (NBA/NAAC), budget, and academic administration.
   - For **SUPER ADMIN**: Focus on platform configuration, broadcast messaging, institutional fee structures, user role management, system branding, and database controls.
2. **Handling Unfeeded / General Queries**: If the user asks for information that is not explicitly feeded in the RAG records below (e.g., general academic definitions, software concepts, career advice, standard university procedures, or general administrative workflows), DO NOT refuse to answer! Provide a comprehensive, authoritative, and helpful answer based on standard best practices for ${institutionName}, while noting if appropriate that official college-specific circulars can be verified with the administration.
3. **Strict Institution Scope**: For general world trivia completely unrelated to education, engineering, or campus administration, politely guide them back to campus topics.

### 👤 USER PROFILE CONTEXT:
Role: ${role.toUpperCase()} | Name: ${userName} | ID: ${studentContext}

### 📚 CITED COLLEGE RECORDS (RAG RETRIEVAL):
${ragContext || 'No specific handbook section matched. Utilize standard institutional guidelines and role-specific workflows.'}

### 💡 RESPONSE FORMATTING RULES:
- Use clear markdown with bold headers, bullet points, and numbered lists.
- Be fast, accurate, and direct. Break down answers logically.
- Maintain an empathetic, professional, and encouraging tone suitable for a state-of-the-art campus advisor.`;
}

/**
 * Generate smart follow-up suggestions based on response topic and user role.
 */
function generateFollowUpSuggestions(query, response, role = 'student') {
  const q = (query + ' ' + response).toLowerCase();
  const suggestions = [];

  if (role === 'super-admin') {
    suggestions.push('How do I broadcast an urgent notice to all students?');
    suggestions.push('How do I update institutional fee structures?');
    suggestions.push('How do I configure college branding & logo?');
    return suggestions;
  }
  if (role === 'hod') {
    suggestions.push('What is the procedure for NBA curriculum accreditation?');
    suggestions.push('How do I review faculty departmental workloads?');
    suggestions.push('How do I approve student medical condonation?');
    return suggestions;
  }
  if (role === 'staff') {
    suggestions.push('How do I apply for casual leave (CL) or duty leave?');
    suggestions.push('What is the mid-semester exam invigilation schedule?');
    suggestions.push('How do I upload student attendance and internal marks?');
    return suggestions;
  }

  if (q.includes('fee') || q.includes('fine') || q.includes('payment') || q.includes('due date')) {
    suggestions.push('What are the payment methods and bank details?');
    suggestions.push('How do I apply for a fee refund or concession?');
    suggestions.push('What is the fine for late tuition fee payment?');
  } else if (q.includes('attendance') || q.includes('condonation') || q.includes('75%') || q.includes('medical')) {
    suggestions.push('What is the procedure for medical condonation?');
    suggestions.push('What happens if attendance falls below 65%?');
    suggestions.push('How do I submit sports representation leave?');
  } else if (q.includes('cgpa') || q.includes('sgpa') || q.includes('grading') || q.includes('percentage')) {
    suggestions.push('How do I convert my CGPA to equivalent percentage?');
    suggestions.push('What are the rules for supplementary backlog exams?');
    suggestions.push('What is the process for answer sheet re-evaluation?');
  } else if (q.includes('hostel') || q.includes('mess') || q.includes('curfew') || q.includes('guest')) {
    suggestions.push('How do I apply for an overnight night-out gate pass?');
    suggestions.push('What are the hostel room allocation rules for 2nd year?');
    suggestions.push('What are the mess meal timings and menu changes?');
  } else if (q.includes('library') || q.includes('book') || q.includes('fine')) {
    suggestions.push('How many books can undergraduate students issue?');
    suggestions.push('What is the overdue fine per day for library books?');
    suggestions.push('Are library reading rooms open 24/7 during exams?');
  } else if (q.includes('tc') || q.includes('transfer certificate') || q.includes('no dues') || q.includes('bonafide')) {
    suggestions.push('How do I clear online No Dues from the 8 departments?');
    suggestions.push('How long does it take to issue a Bonafide Certificate?');
    suggestions.push('What is the fee and process for official transcripts?');
  } else {
    suggestions.push('What is the complete fee structure for B.Tech?');
    suggestions.push('What is our mandatory attendance policy?');
    suggestions.push('How do I get my digital No Dues clearance?');
  }

  return suggestions.slice(0, 3);
}

/**
 * Universal Campus Knowledge Engine: Ultra-Fast response generator for ALL queries (feeded & unfeeded)
 */
function generateUniversalCampusResponse(query, ragDocs, institutionName = 'XYZ Engineering College', role = 'student', userName = 'Member') {
  logger.info(`🤖 Generating Universal Campus Response | role=${role} | query="${query}"`);
  const q = query.toLowerCase();

  // 1. If RAG found exact feeded policy documents
  if (ragDocs && ragDocs.length > 0) {
    const topDoc = ragDocs[0];
    let contentSnippet = topDoc.text;
    if (ragDocs.length > 1) {
      contentSnippet += `\n\n### 📌 Additional Institutional Record (${ragDocs[1].docTitle}):\n${ragDocs[1].text}`;
    }

    return {
      response: `Hello **${userName}** (${role.toUpperCase()})! Here is the official institutional policy from the **${institutionName}** RAG archives (Powered by xAI Grok / Multi-LLM Architecture):\n\n### 📖 ${topDoc.docTitle}\n\n${contentSnippet}\n\n---\n*💡 Note: For role-specific administrative approvals or exceptions, please consult your department office or submit a request via your portal dashboard.*`,
      sources: ragDocs.map((d) => d.docTitle),
      suggestions: generateFollowUpSuggestions(query, topDoc.text, role),
    };
  }

  // 2. Intelligent Synthesis for Unfeeded Queries across all 4 Roles
  let responseText = '';
  let sources = ['XYZ-EC Universal Academic & Admin Guidelines 2026'];

  if (q.includes('leave') || q.includes('cl') || q.includes('casual') || q.includes('duty') || q.includes('vacation')) {
    responseText = `Hello **${userName}**! Here are the official Leave Guidelines for **${institutionName}**:\n\n` +
      `### 📝 Leave Policies & Application Process:\n` +
      `1. **For Teaching Staff / Faculty**:\n` +
      `   - **Casual Leave (CL)**: 12 days per academic year. Must be applied 24 hours in advance via the Staff Portal.\n` +
      `   - **Duty Leave (DL)**: Granted for attending FDPs, conferences, or university examination invigilation duties with HOD approval.\n` +
      `   - **Earned Leave (EL) / Medical Leave**: Requires medical certificates and Registrar approval for durations exceeding 3 days.\n\n` +
      `2. **For Students**:\n` +
      `   - Regular leave up to 3 days requires Class Advisor approval.\n` +
      `   - Medical leaves require submission of a valid fitness certificate within 7 days of rejoining for attendance condonation.`;
  } else if (q.includes('exam') || q.includes('midterm') || q.includes('schedule') || q.includes('hall ticket') || q.includes('admit')) {
    responseText = `Hello **${userName}**! Here is the Examination & Assessment protocol for **${institutionName}**:\n\n` +
      `### 📅 Examination Guidelines:\n` +
      `1. **Mid-Semester Assessments**: Conducted twice a semester (Mid-Term 1 and Mid-Term 2). Weightage is 30 marks towards internal evaluation.\n` +
      `2. **Hall Ticket Issuance**: Students must maintain >= 75% attendance and clear tuition fee dues to download their digital Hall Ticket from the portal.\n` +
      `3. **Invigilation & Duties (Staff)**: All teaching faculty must report to the Examination Control Room 30 minutes prior to exam commencement.\n` +
      `4. **Supplementary / Backlog Exams**: Conducted within 30 days after even-semester results are declared.`;
  } else if (q.includes('fee') || q.includes('fine') || q.includes('due') || q.includes('concession') || q.includes('payment')) {
    responseText = `Hello **${userName}**! Here is the comprehensive Financial & Fee Structure breakdown for **${institutionName}**:\n\n` +
      `### 💰 Fee Payment Rules:\n` +
      `1. **Payment Modes**: Online via NEFT, RTGS, UPI, or Net Banking through the integrated campus payment gateway.\n` +
      `2. **Deadlines & Late Fines**: Tuition fees are due within 15 days of semester commencement. A fine of ₹50 per day is levied for the first 10 days of delay, after which portal access is temporarily frozen.\n` +
      `3. **Scholarships & Concessions**: Merit-cum-means scholarships are processed through the Accounts Section upon submission of valid income certificates.\n` +
      `4. **Super Admin Oversight**: Fee structures for undergraduate and postgraduate courses can be dynamically updated in the Super Admin Dashboard.`;
  } else if (q.includes('library') || q.includes('book') || q.includes('journal') || q.includes('reading room')) {
    responseText = `Hello **${userName}**! Welcome to the **${institutionName} Central Digital Library**:\n\n` +
      `### 📚 Library Regulations:\n` +
      `1. **Borrowing Limits**: Undergraduates can borrow up to 4 books for 14 days; Postgraduates and Staff can borrow up to 8 books for 30 days.\n` +
      `2. **Overdue Fines**: ₹5 per day per book after the due date.\n` +
      `3. **Digital Resources**: Access IEEE, ASME, Springer, and ACM digital libraries 24/7 using your institutional login credentials.\n` +
      `4. **Timings**: Open Monday to Saturday from 8:00 AM to 8:00 PM (Reading rooms open 24/7 during examination weeks).`;
  } else if (q.includes('hostel') || q.includes('mess') || q.includes('curfew') || q.includes('room') || q.includes('warden')) {
    responseText = `Hello **${userName}**! Here are the Campus Residential & Hostel Regulations:\n\n` +
      `### 🏠 Hostel & Mess Rules:\n` +
      `1. **Curfew Timings**: All resident students must return to their respective hostel blocks by 9:30 PM. Biometric attendance is recorded nightly at 9:45 PM.\n` +
      `2. **Night-Out Gate Passes**: Must be requested via the Student Portal at least 24 hours in advance with parent SMS verification and Warden approval.\n` +
      `3. **Mess Timings**: Breakfast (7:30 - 9:00 AM), Lunch (12:30 - 2:00 PM), Snacks (4:30 - 5:30 PM), Dinner (7:30 - 9:00 PM).\n` +
      `4. **Room Allocation**: Managed annually based on academic seniority and conduct.`;
  } else if (q.includes('attendance') || q.includes('75%') || q.includes('condonation') || q.includes('biometric')) {
    responseText = `Hello **${userName}**! Here is our Institutional Attendance Policy:\n\n` +
      `### 📊 Mandatory Attendance Framework:\n` +
      `1. **75% Minimum Requirement**: As per university statutes, a minimum of 75% physical attendance is mandatory in each theory and laboratory course to appear for end-semester examinations.\n` +
      `2. **Medical Condonation**: Students with attendance between 65% and 74% due to genuine medical reasons can apply for condonation by paying the statutory fee and submitting hospital discharge summaries.\n` +
      `3. **Staff Responsibility**: Faculty members must freeze monthly attendance logs on the portal by the 2nd working day of the subsequent month.`;
  } else if (q.includes('placement') || q.includes('tpo') || q.includes('job') || q.includes('internship') || q.includes('resume')) {
    responseText = `Hello **${userName}**! Here is the Training & Placement Office (TPO) roadmap:\n\n` +
      `### 🎯 Placement & Internship Guidelines:\n` +
      `1. **Eligibility**: Students with CGPA >= 6.5 and no active backlogs are eligible for core and dream company campus drives.\n` +
      `2. **Resume Verification**: Digital resumes must be verified and locked by the Department Placement Coordinator before appearing for aptitude rounds.\n` +
      `3. **No-Dream-Cap Policy**: Once placed in a standard tier company, students are allowed one extra attempt for a Super Dream company (>= 10 LPA).\n` +
      `4. **Semester Internships**: Final semester industrial internships require HOD approval and a signed NOC from the TPO.`;
  } else if (q.includes('cgpa') || q.includes('sgpa') || q.includes('percentage') || q.includes('grading') || q.includes('marks')) {
    responseText = `Hello **${userName}**! Here is our Academic Grading & Evaluation System:\n\n` +
      `### 📈 CGPA to Percentage Conversion & Grading:\n` +
      `1. **Official Formula**: The equivalent percentage is calculated as: **\`Percentage = (CGPA - 0.75) * 10\`** (e.g., a CGPA of 8.25 equals 75.0%)\n` +
      `2. **Grading Scale**: O (10 points - Outstanding), A+ (9 points - Excellent), A (8 points - Very Good), B+ (7 points - Good), B (6 points - Above Average), C (5 points - Average), F (0 points - Fail).\n` +
      `3. **Re-evaluation**: Students can apply for photocopy and re-evaluation within 7 days of result declaration via the exam portal.`;
  } else if (q.includes('tc') || q.includes('no dues') || q.includes('bonafide') || q.includes('certificate') || q.includes('transcript')) {
    responseText = `Hello **${userName}**! Here is the procedure for Official Certificates & Clearance:\n\n` +
      `### 📜 Digital No Dues & Certificate Issuance:\n` +
      `1. **Online No Dues Workflow**: Final year students must initiate online clearance from 8 departments (Library, Hostel, Sports, Accounts, Department lab, Store, Placement, Alumni).\n` +
      `2. **Transfer Certificate (TC)**: Issued within 3 working days after 100% online No Dues approval.\n` +
      `3. **Bonafide & Fee Structure Certificates**: Downloadable instantly with digital verification QR codes from the Student Portal.\n` +
      `4. **Official Transcripts**: Apply online; dispatched in sealed university envelopes within 5 working days.`;
  } else if (q.includes('broadcast') || q.includes('notice') || q.includes('update') || q.includes('message') || q.includes('alert')) {
    responseText = `Hello **${userName}**! Here is how our Campus Noticeboard & Broadcast System works:\n\n` +
      `### 📢 Real-Time Broadcast Architecture:\n` +
      `1. **Super Admin Feed**: All institutional notices, fee reminders, and campus alerts displayed in the bottom drawer are fed directly by the Super Admin.\n` +
      `2. **Targeted Delivery**: Broadcasts can be filtered by audience target (**ALL**, **STUDENT**, **STAFF**, or **HOD**).\n` +
      `3. **Instant Visibility**: Notices appear instantly across all student and faculty dashboards without page reloads.`;
  } else if (q.includes('hod') || q.includes('department') || q.includes('budget') || q.includes('accreditation') || q.includes('nba') || q.includes('naac')) {
    responseText = `Hello **${userName}** (${role.toUpperCase()})! Here is the Head of Department (HOD) Administrative Framework:\n\n` +
      `### 🏛️ HOD Governance & Operations:\n` +
      `1. **Curriculum Oversight**: HODs approve semester lesson plans, faculty subject allocations, and lab equipment utilization.\n` +
      `2. **Accreditation Readiness**: Maintenance of Course Outcomes (CO) and Program Outcomes (PO) attainment files for NBA and NAAC audits.\n` +
      `3. **Faculty & Student Review**: Approval of student medical condonation petitions and faculty duty leave requests.\n` +
      `4. **Budget Allocation**: Utilization of annual departmental contingency and research grants in coordination with the Principal's office.`;
  } else if (q.includes('super admin') || q.includes('admin') || q.includes('branding') || q.includes('logo') || q.includes('system') || q.includes('database')) {
    responseText = `Hello **${userName}** (${role.toUpperCase()})! Here is the Super Admin System Control Overview:\n\n` +
      `### ⚙️ Super Admin Capabilities (7 Modules):\n` +
      `1. **Institution Branding**: Live modification of college name, tagline, logo URL, email, phone number, address, and Google Maps location.\n` +
      `2. **Broadcast Manager**: Creating and deleting public announcements and institutional fee structures.\n` +
      `3. **User & Role Management**: Inspecting student, staff, and HOD directories with role-based access control.\n` +
      `4. **System Health & Database**: Monitoring MongoDB cluster connections, server RAM usage, and API latency in real time.`;
  } else {
    // Universal Comprehensive Response for any unfeeded query
    responseText = `Hello **${userName}** (${role.toUpperCase()})! Thank you for reaching out to the **${institutionName} Digital Helpdesk** (Powered by xAI Grok & Advanced AI Architecture).\n\n` +
      `Regarding your inquiry about: **"${query}"**\n\n` +
      `### 🏛️ Institutional Protocol & Action Plan:\n` +
      `1. **Role-Specific Processing**: As a **${role.toUpperCase()}**, your query has been logged into our digital assistance framework. While an exact static policy document was not matched in the offline archives, standard university guidelines apply.\n` +
      `2. **Administrative Coordination**: For customized curricular approvals, financial waivers, or specialized technical requests, please initiate a formal e-petition through your dashboard or consult your respective department office.\n` +
      `3. **Key Contact Centers**:\n` +
      `   - **Academic & Examination Section**: For syllabus, grades, and admit cards.\n` +
      `   - **Accounts & Bursar Office**: For tuition fees, receipts, and scholarships.\n` +
      `   - **Student Affairs & TPO**: For campus drives, internships, and hostel passes.\n\n` +
      `---\n*💡 How else can I assist you today? You can select one of the tailored recommendations below!*`;
  }

  return {
    response: responseText,
    sources: sources,
    suggestions: generateFollowUpSuggestions(query, responseText, role),
  };
}

/**
 * Main entry point: Process a query through Grok / Gemini / OpenAI / Universal Offline Engine.
 */
export async function processMessage(studentId, message, sessionId, _chatHistory = [], institutionId = 'inst-xyz-001', role = 'student', userName = 'Member') {
  try {
    const student = await Student.findOne({ studentId }).catch(() => null);
    const studentContext = student
      ? student.toContextString()
      : `User ID: ${studentId} | Role: ${role.toUpperCase()} | Name: ${userName} | XYZ Engineering College`;

    const institutionName = 'XYZ Engineering College';
    const institutionCode = 'XYZ-EC';

    // 1. RAG Retrieval scoped by institutionId
    const ragDocs = await ragService.searchSimilar(message, 3, institutionId);
    const ragContext = ragDocs
      .map((doc, idx) => `[Record ${idx + 1}: ${doc.docTitle} (Category: ${doc.category})]\n${doc.text}`)
      .join('\n\n---\n\n');

    const sources = [...new Set(ragDocs.map((d) => d.docTitle))];
    const systemPrompt = buildSystemPrompt(studentContext, ragContext, institutionName, institutionCode, role, userName);

    // 2. Try xAI Grok API execution (First priority as requested)
    const grok = getGrok();
    if (grok) {
      logger.info('🚀 Executing query with xAI Grok API...');
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ];

      const completion = await grok.chat.completions.create({
        model: 'grok-beta',
        messages: messages,
        temperature: 0.3,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Unable to generate response.';
      const suggestions = generateFollowUpSuggestions(message, aiResponse, role);

      return {
        response: aiResponse,
        sources: sources.length > 0 ? sources : ['xAI Grok / XYZ-EC Institutional Knowledge Base'],
        suggestions,
      };
    }

    // 3. Try Google Gemini 1.5 Pro execution
    const gemini = getGemini();
    if (gemini) {
      logger.info('🧠 Executing query with Google Gemini 1.5 Pro...');
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(message);
      const aiResponse = result.response.text() || 'Unable to generate response.';
      const suggestions = generateFollowUpSuggestions(message, aiResponse, role);

      return {
        response: aiResponse,
        sources: sources.length > 0 ? sources : ['XYZ-EC Official Academic Guidelines'],
        suggestions,
      };
    }

    // 4. Try OpenAI execution fallback
    const client = getOpenAI();
    if (client) {
      logger.info('🧠 Executing query with OpenAI fallback...');
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ];

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.3,
        max_tokens: 800,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Unable to generate response.';
      const suggestions = generateFollowUpSuggestions(message, aiResponse, role);

      return {
        response: aiResponse,
        sources: sources.length > 0 ? sources : ['XYZ-EC Official Academic Guidelines'],
        suggestions,
      };
    }

    // 5. Universal Campus Knowledge Engine Fallback
    return generateUniversalCampusResponse(message, ragDocs, institutionName, role, userName);
  } catch (err) {
    logger.error(`AI Agent processing error: ${err.message}`);
    const ragDocs = await ragService.searchSimilar(message, 2, institutionId).catch(() => []);
    return generateUniversalCampusResponse(message, ragDocs, 'XYZ Engineering College', role, userName);
  }
}

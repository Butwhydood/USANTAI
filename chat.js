const ChatLogger = {
    logs: [],
    isEnabled: true,
    
    init() {
        console.log('Chat Logger initialized');
        this.loadSavedLogs();
        
        setTimeout(() => {
            this.createUIElements();
            this.setupEventListeners();
        }, 100);
    },
    
    setupEventListeners() {
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && 
                            (node.classList.contains('user-message') || 
                             node.classList.contains('ai-message'))) {
                            this.logMessage(node);
                        }
                    });
                });
            });
            
            observer.observe(chatHistory, { childList: true });
        }
    },
    
    logMessage(messageElement) {
        if (!this.isEnabled) return;
        
        const role = messageElement.classList.contains('user-message') ? 'user' : 'ai';
        const content = messageElement.textContent
            .replace(/^(You:|AI:)\s*/, '')
            .trim();
        
        const timestamp = new Date().toISOString();
        this.logs.push({ timestamp, role, content });
        this.saveLogs();
        this.updateLogIndicator();
    },
    
    saveLogs() {
        localStorage.setItem('chatLogs', JSON.stringify(this.logs));
    },
    
    loadSavedLogs() {
        const savedLogs = localStorage.getItem('chatLogs');
        if (savedLogs) {
            try {
                this.logs = JSON.parse(savedLogs);
                console.log(`Loaded ${this.logs.length} existing log entries`);
            } catch (e) {
                console.error('Error loading saved logs:', e);
            }
        }
    },
    
    exportLogs() {
        if (this.logs.length === 0) {
            alert('No logs to export');
            return;
        }
        
        const exportData = JSON.stringify(this.logs, null, 2);
        const now = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
        const filename = `chat-logs-${now}.json`;
        
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },
    
    createUIElements() {
        // 1. First try the standard location
        let chatActions = document.querySelector('.flex.justify-between.items-center.mt-2');
        
        // 2. If not found, try alternative selectors
        if (!chatActions) {
            chatActions = document.querySelector('.chat-actions') || 
                          document.querySelector('.message-actions') ||
                          document.getElementById('chat-controls');
        }
        
        // 3. As last resort, create our own container
        if (!chatActions) {
            chatActions = document.createElement('div');
            chatActions.className = 'chat-logger-actions flex justify-between items-center mt-2';
            const inputArea = document.querySelector('.p-4.border-t.border-gray-200');
            if (inputArea) {
                inputArea.appendChild(chatActions);
            } else {
                document.body.appendChild(chatActions);
            }
        }
        
        // Remove existing button if it exists
        const existingBtn = document.getElementById('export-logs-btn');
        if (existingBtn) existingBtn.remove();
        
        // Create new export button
        const exportButton = document.createElement('button');
        exportButton.id = 'export-logs-btn';
        exportButton.className = 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300';
        exportButton.textContent = 'Export Chat Logs';
        exportButton.addEventListener('click', () => this.exportLogs());
        
        // Add button to container
        chatActions.appendChild(exportButton);
        
        // Add floating log indicator
        this.createLogIndicator();
    },
    
    createLogIndicator() {
        // Remove existing indicator if it exists
        const existingIndicator = document.getElementById('chat-log-indicator');
        if (existingIndicator) existingIndicator.remove();
        
        // Create new indicator
        const logIndicator = document.createElement('div');
        logIndicator.id = 'chat-log-indicator';
        logIndicator.innerHTML = '📋';
        logIndicator.title = `${this.logs.length} messages logged`;
        logIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #6b21a8;
            color: white;
            font-size: 24px;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        logIndicator.addEventListener('click', () => {
            alert(`${this.logs.length} chat messages logged. Click "Export Chat Logs" to download.`);
        });
        
        document.body.appendChild(logIndicator);
    },
    
    updateLogIndicator() {
        const indicator = document.getElementById('chat-log-indicator');
        if (indicator) {
            indicator.title = `${this.logs.length} messages logged`;
        }
    }
};

// ===== INITIALIZATION =====
function initializeChatLogger() {
    // Wait for everything to be ready
    const checkReady = setInterval(() => {
        const chatContainer = document.getElementById('chat-page');
        if (chatContainer && !chatContainer.classList.contains('hidden')) {
            clearInterval(checkReady);
            ChatLogger.init();
            window.ChatLogger = ChatLogger;
        }
    }, 100);
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChatLogger);

// Also initialize if DOM is already loaded
if (document.readyState === 'complete') {
    initializeChatLogger();
}
    
    const themeToggle = document.getElementById('theme-toggle');
    let isDarkMode = localStorage.getItem('darkMode') === 'true';

    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        applyTheme();
    }

    function applyTheme() {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDarkMode);
    }

    applyTheme();
    themeToggle.addEventListener('click', toggleDarkMode);

    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const chatPage = document.getElementById('chat-page');
    // const logoutButton = document.getElementById('logout-button');

    loginModal.style.display = 'flex';

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            loginModal.style.display = 'none';
            chatPage.classList.remove('hidden');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
        }
    });

    // logoutButton.addEventListener('click', () => {
    //     localStorage.removeItem('isLoggedIn');
    //     localStorage.removeItem('username');
    //     loginModal.style.display = 'flex';
    //     chatPage.classList.add('hidden');
    //     loginForm.reset();
    // });

    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginModal.style.display = 'none';
        chatPage.classList.remove('hidden');
    }

    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const exportButton = document.getElementById('export-button');
    const debugOutput = document.getElementById('debug-output');
    const modelSelect = document.getElementById('model-select');

    let conversationHistory = "You are a helpful, creative, and friendly AI assistant. Please provide engaging and varied responses.";
    let lastRequestTime = 0;
    const RATE_LIMIT = 1000; 

    const customResponses = {
        "scholarships and financial assistance": [
            "USANT offers various scholarships and financial assistance based on academic performance, financial need, and extracurricular involvement.",
            "Scholarships at USANT include the Doña Felisa D. Ortega Academic Excellence Award, Amulfo Fajardo Scholarship, and LAW Scholar programs.",
            "Students at USANT can avail scholarships like the Academic Excellence Award, the Amulfo Fajardo Scholarship, and discounts for group enrollment.",
            "USANT provides scholarships based on academic merit, such as the Amulfo Fajardo Scholarship and the Doña Felisa D. Ortega Academic Excellence Award.",
            "Scholarships and discounts at USANT include options for top academic achievers, performing arts group members, and siblings enrolling together."
        ],
        "Doña Felisa D. Ortega Academic Excellence Award": [
            "The Doña Felisa D. Ortega Academic Excellence Award is given to the top 10 Grade 10 completers with significant tuition fee discounts.",
            "Top 10 students in Grade 10 can earn tuition fee discounts under the Doña Felisa D. Ortega Academic Excellence Award.",
            "Students ranking in the top 10 of Grade 10 receive varying levels of tuition fee discounts under the Doña Felisa D. Ortega Academic Excellence Award.",
            "The top 10 completers of Grade 10 are eligible for discounts on tuition fees under the Doña Felisa D. Ortega Academic Excellence Award.",
            "Ranked students in Grade 10 can enjoy up to 100% tuition fee discounts under the Doña Felisa D. Ortega Academic Excellence Award."
        ],
        "Amulfo Fajardo Scholarship": [
            "The Amulfo Fajardo Scholarship is open to incoming Grade 11 students with a 90 average in Grade 10 and offers free tuition fees.",
            "The Amulfo Fajardo Scholarship is awarded to high-achieving Grade 11 students, providing full tuition coverage and other fees.",
            "To qualify for the Amulfo Fajardo Scholarship, students must achieve a 90% average in Grade 10 and pass a selection process.",
            "The Amulfo Fajardo Scholarship offers full tuition and other fees to Grade 11 students who excel academically.",
            "Students must maintain a 92 average and pass all subjects to retain the Amulfo Fajardo Scholarship."
        ],
        "group enrollment discount": [
            "Siblings enrolling together at USANT can avail a group discount, with the lowest tuition assessment getting a 100% discount.",
            "USANT offers group discounts to siblings, with one receiving 100% tuition coverage and others receiving additional discounts based on their assessments.",
            "In groups of four or five legitimate siblings, discounts are provided, including a 100% tuition fee discount for the lowest assessment student.",
            "Siblings enrolling together can benefit from group enrollment discounts, with one student receiving a 100% discount and another a 10% discount in groups of five.",
            "Group enrollment discounts apply to siblings, with tuition fee benefits provided based on the lowest assessments among the group."
        ],
        "special scholarship for performing arts": [
            "Members of the USANT Performing Arts Group, such as Majorettes, Band members, Dance Troupe, and Chorale, receive tuition fee discounts.",
            "Students involved in USANT's Performing Arts Groups can enjoy tuition fee discounts as part of the Special Scholarship program.",
            "The Special Scholarship for Performing Arts offers tuition fee discounts to students in USANT’s Majorettes, Band, Dance Troupe, and Chorale.",
            "Members of the Performing Arts Group at USANT, including Majorettes and Band members, can benefit from tuition fee discounts.",
            "USANT’s Performing Arts students, such as those in the Dance Troupe or Chorale, are eligible for Special Scholarships with tuition fee reductions."
        ],
        "faculty adviser responsibilities": [
        "A faculty adviser is required for each student organization and must be a full-time faculty member of the university.",
        "The faculty adviser for each student organization must be appointed by the Principal and is responsible for guiding the organization’s activities.",
        "Faculty advisers are responsible for attending student organization meetings, assisting with planning activities, and ensuring that activities align with the organization’s goals.",
        "A faculty adviser must be available for consultation with organization members, sign forms for the organization, and ensure the safety of participants in off-campus events.",
        "If a faculty adviser withdraws before their term ends, a new one must be appointed to continue serving the remaining term."
    ],
    "student officer requirements": [
        "To become a student officer, one must not be under academic or disciplinary probation.",
        "Members of student organizations are encouraged to become officers, but they must maintain an average grade of 80 or 2.5.",
        "If a student officer fails to maintain the required grade average, they must vacate the position.",
        "Student officers are expected to have good academic standing and meet the grade requirements to retain their posts.",
        "Maintaining an average of 80 or 2.5 is crucial for students holding officer positions in organizations."
    ],
    "student-related activity rules": [
        "All co-curricular and extra-curricular activities must be reflected in the semester action plan and submitted for approval one week before the event.",
        "For on-campus events, requests should be submitted to the President’s office at least three working days before the event.",
        "Off-campus activities require at least seven working days' notice before submission to the President's office.",
        "Activities must be approved by the Principal, Department Head, or Adviser, and validated by the Dean of Student Affairs and the VPAA.",
        "Misconduct by students in off-campus activities that affects the university’s reputation or academic processes will be dealt with accordingly."
    ],
    "activity proposal details": [
        "An activity proposal must include the title, time, date, and venue of the activity, rationale, objectives, participants, materials needed, budget, and parent consent for off-campus activities.",
        "For off-campus events, additional documents such as the tour operator’s accreditation and vehicle registration may be required.",
        "Activity proposals should be endorsed by the faculty adviser and principal before submission for approval.",
        "Proposals for on-campus events should be submitted at least three working days before the event, while off-campus events need seven working days.",
        "Consent and waiver forms are required for both on-campus and off-campus activities involving contributions above Php 100."
    ],
    "prohibited activity times": [
        "On and off-campus activities are prohibited one week before the scheduled examination period and during the week of the examination.",
        "Off-campus activities are not allowed one month before the final examinations.",
        "Student-related activities are discouraged on Mondays and Sundays, and also during regular and special holidays.",
        "Activities are restricted during the final exams and one week prior, to avoid interference with academic schedules.",
        "Conducting activities during holidays or peak exam periods is strictly prohibited to maintain academic focus."
    ],
    "medical services": [
        "The Medical clinic at USANT provides free consultation and minor ailment treatment for students, faculty, and staff.",
        "The university's Medical clinic offers free consultations, medicine for minor ailments, and online consultations.",
        "USANT's Medical clinic provides free family planning counseling and first aid for minor injuries.",
        "The Medical clinic also offers free medical exams, blood pressure checks, and referrals to nearby hospitals for emergencies.",
        "Free consultation and minor medical care are available to the USANT community through the Medical clinic."
    ],
    "dental services": [
        "The Dental clinic provides free treatment for oral diseases and conditions to all bona fide members of the USANT community.",
        "USANT offers prompt dental services, including treatment for toothaches, temporary fillings, and tooth extractions.",
        "The Dental clinic addresses oral health needs, including pain management, prescriptions, and referrals to specialists.",
        "The Dental clinic provides temporary care for tooth problems and referrals to private practitioners when necessary.",
        "The USANT Dental clinic offers free diagnosis, treatment for toothaches, and referrals for complex cases."
    ],
    "auxiliary services": [
        "USANT offers food services with multiple cafeterias across different campuses, including grade school, high school, and college.",
        "The University has a store for school supplies, a food service in various cafeterias, and student accident insurance.",
        "Students at USANT can avail of the accident insurance, which covers accidents worldwide, and claim for medical expenses.",
        "The university provides various auxiliary services like school supply stores, cafeterias, and a public safety office.",
        "USANT’s auxiliary services include food outlets, a school supply store, and 24-hour student accident insurance."
    ],
    "facilities": [
        "USANT offers instructional, recreational, residential, and general purpose facilities to support student life and learning.",
        "The University has a range of instructional facilities, including classrooms, laboratories, and multimedia rooms.",
        "Recreational facilities at USANT include tennis courts, swimming pools, football fields, and sports pavilions.",
        "Residential facilities like the dormitory provide convenient accommodations for students, with a strict house rule system.",
        "USANT's general-purpose facilities include cafeterias, clinics, lounges, and ample parking spaces for students and staff."
    ],
        "ABM activities": [
            "The Monthly Accounting Quiz helps ABM students strengthen their understanding of accountancy and business management.",
            "Business Pitch and Business Fair allow ABM students to hone their entrepreneurial skills in presenting and marketing business ideas.",
            "ABM Day fosters camaraderie and provides a reminder of the challenges and goals within the ABM strand.",
            "TV Commercial Making is part of the ABM activities to help students develop skills in creativity, editing, and videography."
        ],
        "STEM activities": [
            "The Basic Disaster Preparedness activity aims to educate students on rescue and first aid techniques during disasters.",
            "The Bahagian community extension program spreads hope and instills the value of giving back to marginalized areas.",
            "The Local Mathematics and Science Fair brings together science and math students to showcase projects and compete in Olympiads.",
            "The Conics Miniature Contest challenges students to apply conic sections creatively in miniature models.",
            "Monthly quizzes in Math and Science assess students' knowledge and select the best participants for future competitions."
        ],
        "HUMSS activities": [
            "HUMSS Primer is a three-day event to foster strong relationships among HUMSS students and help them appreciate the value of the strand.",
            "Hatid Kalinga is a literacy program conducted every Saturday to help children in a marginalized area improve their reading and writing skills.",
            "Hear Her! is a film viewing event in celebration of Women's Month, focusing on gender equality and women's empowerment.",
            "Bugso is an event focused on love, relationships, and personal growth, promoting inclusivity and knowledge among participants.",
            "Wind Up and Pagpupugay bridges the end of the school year with recognition and awards for dedication and hard work."
        ],
        "GAS activities": [
            "Book Week is a celebration in November to encourage reading and enhance students' creativity and critical thinking.",
            "SHS Battle of the Words is a monthly spelling contest held as part of the University-wide enhancement program."
        ],
        "TVL activities": [
            "Team Building is an event for TVL students to collaborate and apply TVL-related skills in a team-building activity.",
            "Food and Travel Expo showcases TVL students' food plating, photography, and other related skills.",
            "Agape is a seminar to help students learn how to generate income through TVL-related crafts.",
            "Bartending and Cocktail Mixing is an event where Grade 12 TVL students demonstrate their skills to Grade 11 students in preparation for assessments.",
            "Food and Beverage Day teaches TVL students essential skills in table setup, mixology, food plating, and restaurant operations."
        ],
        "work immersion": [
            "The Work Immersion requires a total of 80 hours, divided into pre-immersion, actual immersion, and post-immersion phases.",
            "Students must complete 80 hours of Work Immersion, including 10 hours of pre-immersion, 60 hours of actual immersion, and 10 hours for post-immersion.",
            "Work Immersion consists of 80 hours: 10 hours for pre-immersion, 60 hours for immersion, and 10 hours for post-immersion tasks.",
            "For Work Immersion, students are required to complete 80 hours, which includes pre-immersion, immersion, and post-immersion activities.",
            "The total Work Immersion time is 80 hours, with specific time allocated for pre-immersion, immersion, and post-immersion documentation."
        ],
        "kahoy mo diploma mo": [
            "The 'Kahoy Mo, Diploma Mo' program requires each graduating student to plant a tree and document the process in a portfolio.",
            "Every graduating student must plant a tree as part of the 'Kahoy Mo, Diploma Mo' program, with proper documentation and photos.",
            "In the 'Kahoy Mo, Diploma Mo' program, students must plant a tree and compile documentation of the planting process in a portfolio.",
            "The 'Kahoy Mo, Diploma Mo' program involves students planting a tree and submitting documentation including a photo and details of the plant.",
            "As part of the 'Kahoy Mo, Diploma Mo' initiative, graduating students are required to plant a tree and document the event for their portfolio."
        ],
        "graduation requirements": [
            "Graduating students must clear their records and submit documentation for the 'Kahoy Mo, Diploma Mo' program.",
            "To graduate, students must complete their clearance and submit the 'Kahoy Mo, Diploma Mo' documentation.",
            "For graduation, students are required to secure their clearance and complete the 'Kahoy Mo, Diploma Mo' documentation.",
            "The graduation requirements include clearance and submission of the 'Kahoy Mo, Diploma Mo' documentation.",
            "Students must meet clearance requirements and provide documentation for the 'Kahoy Mo, Diploma Mo' program to graduate."
        ],
        "parents meeting": [
            "Parents' meetings are held every quarter to strengthen the relationship between parents and the school.",
            "Quarterly parents' meetings aim to update parents on their child's performance and release grades.",
            "Parents' meetings take place each quarter to provide updates on student performance and release grades.",
            "The goal of parents' meetings is to foster communication with parents and release students' grades each quarter.",
            "Parents' meetings are conducted quarterly to strengthen school-parent ties and provide updates on student progress."
        ],
        "no smoking policy": [
            "The campus is smoke-free, and any student caught smoking will face disciplinary action.",
            "USANT upholds a no-smoking policy; students found smoking on campus will face consequences.",
            "Smoking is prohibited on campus, and violators will be subject to disciplinary action according to the policy.",
            "Students must adhere to the no-smoking policy, or they will face disciplinary measures for violations.",
            "The campus maintains a strict no-smoking policy, with penalties for students who are caught smoking."
        ],
        "posting policy": [
            "Any posting on campus must be approved by the OSAA to ensure it follows university guidelines.",
            "All materials posted on campus must be cleared with the OSAA and should be marked with an official stamp.",
            "The OSAA must approve any announcements or postings on university premises to ensure proper coordination.",
            "All postings within the university must be authorized by the OSAA and removed after the event or activity.",
            "For an announcement to be posted on campus, it must be cleared with the OSAA and carry the official stamp."
        ],
        "uniform and id policy": [
            "Students are required to wear the prescribed school uniform, including their ID, at all times while on campus.",
            "The uniform policy mandates that students wear their school uniform properly, including the display of their ID.",
            "Students must wear the proper uniform and display their ID as part of the school’s security system.",
            "Proper school uniform and ID display are mandatory for all students on campus, as outlined in the university policy.",
            "Uniform and ID policies ensure a secure and orderly environment for all students at the university."
        ],
        "anti-bullying policy": [
        "The University of Saint Anthony Senior High School Department has a comprehensive Anti-Bullying Policy in place to ensure a safe and conducive learning environment.",
        "The Anti-Bullying Policy at the University of Saint Anthony is designed to protect students from all forms of bullying and promote a healthy school environment.",
        "In line with the Philippine Constitution, the University of Saint Anthony’s Anti-Bullying Policy aims to prevent all forms of bullying and foster respect among students.",
        "The University of Saint Anthony strictly enforces an Anti-Bullying Policy to uphold the rights of students and prevent any form of abuse or harassment.",
        "The University of Saint Anthony’s Anti-Bullying Guidelines ensure a safe educational environment free from bullying for all students."
    ],
    "definition of bullying": [
        "Bullying is any repeated and pervasive act, verbal or physical, intended to cause distress or harm to one or more students within the school environment.",
        "Any repeated verbal, physical, or electronic expression or action aimed at causing distress is considered bullying under the policy.",
        "Bullying includes any repeated act or pattern of behavior that causes harm to a student, either emotionally, physically, or through online platforms.",
        "Bullying can take many forms, such as physical contact, verbal abuse, or cyberbullying, all of which are prohibited by this policy.",
        "Under the policy, bullying encompasses verbal, physical, and cyber bullying, all aimed at causing emotional or physical harm."
    ],
    "forms of bullying": [
        "Bullying may include unwanted physical contact, verbal abuse, name-calling, social exclusion, or cyberbullying.",
        "Forms of bullying include physical aggression, emotional harm, social exclusion, and online harassment.",
        "The various forms of bullying include physical bullying (e.g., pushing, slapping), verbal bullying (e.g., name-calling), and cyberbullying (e.g., harassment through social media).",
        "Bullying can occur physically (pushing, shoving), verbally (name-calling), or online (through social media and messaging).",
        "Social bullying and gender-based bullying are also recognized as forms of bullying, which the policy aims to prevent."
    ],
    "prevention program": [
        "The SHS department will implement awareness campaigns, seminars, and activities to promote understanding and prevention of bullying.",
        "The prevention program includes school-wide initiatives to foster a positive school environment and regular activities to raise awareness about bullying.",
        "Regular seminars and activities will be conducted to teach students about recognizing bullying and responding appropriately.",
        "The SHS department aims to create a positive school climate and engage parents and stakeholders in anti-bullying efforts.",
        "The prevention program will involve all stakeholders, including parents, teachers, and students, to create a comprehensive approach to stopping bullying."
    ],
    "intervention program": [
        "Intervention programs will focus on counseling and life skills training for both victims and bullies to promote emotional well-being.",
        "The SHS department will offer counseling and other supportive programs for both the victims and perpetrators of bullying.",
        "Interventions may include counseling, life skills development, and other activities aimed at resolving the issues caused by bullying.",
        "The intervention program addresses both the causes and consequences of bullying, providing counseling and skills development for all involved.",
        "Counseling, conflict resolution, and skills training are integral components of the SHS department’s intervention program."
    ],
    "disciplinary measures": [
        "Disciplinary actions for bullying include written reprimands, community service, suspension, or expulsion, depending on the severity of the incident.",
        "The SHS department enforces strict disciplinary measures against bullying, ranging from verbal warnings to expulsion for repeated offenses.",
        "Bullying incidents will be met with appropriate disciplinary actions, including suspension or expulsion, in line with the school's rules.",
        "Depending on the severity of the bullying, penalties may range from a verbal warning to expulsion, with due process ensured.",
        "Disciplinary measures are designed to be proportional to the nature and severity of the bullying incident, ensuring fair treatment for all parties involved."
    ],
    "due process": [
        "Due process ensures that both the victim and the alleged bully are given a fair opportunity to present their side of the case before any disciplinary actions are taken.",
        "In the case of bullying, the students and their guardians will be informed in writing and given the opportunity to appeal the decision.",
        "The school ensures that due process is followed for both the accused bully and the victim, ensuring fairness in all disciplinary proceedings.",
        "The SHS department adheres to the principles of due process, providing students the right to respond to complaints and appeal decisions.",
        "The bullying complaint process guarantees that all parties involved, including victims and perpetrators, are treated fairly and equitably."
    ],
    "confidentiality": [
        "All personal information related to the bullying incident, including the identities of victims, bullies, and bystanders, will be kept confidential.",
        "Confidentiality is strictly maintained during the investigation of bullying cases, ensuring that sensitive information is protected.",
        "The identities of individuals involved in bullying cases will be protected, with details shared only with authorized personnel.",
        "All information related to bullying incidents will be treated with the utmost confidentiality by the school administration and staff.",
        "School personnel are required to maintain confidentiality regarding bullying cases, ensuring the privacy of those involved."
    ],
        "shs subject classification": [
            "Subjects in Senior High School are grouped into Core, Applied, and Specialized subjects.",
            "SHS subjects fall under three types: Core (15), Applied (7), and Specialized (9).",
            "There are 3 types of SHS subjects: 15 Core, 7 Applied, and 9 Specialized.",
            "SHS classes are categorized into Core, Applied, and Specialized subjects.",
            "Senior High subjects include Core, Applied, and Specialized areas."
        ],
    
        "grade 11 subjects first sem": [
            "Grade 11 first semester core subjects include Oral Communication, Komunikasyon sa Wika, General Math, Earth and Life Science, Philosophy, Personal Development, and PE & Health.",
            "In the first semester of Grade 11, students take core subjects like English, Filipino, Math, Science, Philosophy, Personal Development, and PE.",
            "For Grade 11 first sem, expect subjects such as Oral Communication, Earth & Life Science, General Math, and PE & Health.",
            "The first sem subjects for Grade 11 include: English 101, Filipino 101, Math 101, Science 101, Philosophy, Personal Development, and PE.",
            "SHS Grade 11 first sem includes core subjects like Oral Communication, General Math, Earth and Life Sciences, and PE."
        ],
    
        "grade 11 core subjects": [
            "Core subjects for Grade 11 include: Oral Communication, General Math, Earth and Life Science, and more.",
            "Grade 11 students take core subjects like English, Filipino, Math, Science, Philosophy, and PE.",
            "Subjects like Oral Communication, Komunikasyon at Pananaliksik, General Mathematics, and Earth & Life Science are part of the core curriculum in Grade 11.",
            "Some examples of core subjects in Grade 11 are: English 101, Filipino 101, and Math 101.",
            "The core curriculum for Grade 11 includes subjects in English, Filipino, Math, Science, and PE."
        ],
    
        "what are the subjects in shs": [
            "SHS subjects include Core, Applied, and Specialized ones depending on your track.",
            "In Senior High School, students study Core, Applied, and Specialized subjects.",
            "SHS curriculum is made up of Core, Applied, and Specialized subjects across different tracks.",
            "There are three types of subjects in SHS: Core, Applied, and Specialized.",
            "Senior High School offers different sets of subjects for each track, including core subjects like Math and English."
        ],
        "applied subjects grade 11": [
            "Grade 11 Applied Subjects include English for Academic & Professional Purposes and Empowerment Technologies.",
            "For Grade 11, Applied Subjects offered are English 110 and Empowerment Technologies.",
            "Applied classes in Grade 11 cover academic English and tech skills like Empowerment Technologies."
        ],
    
        // Grade 11 Second Semester - Core Subjects
        "grade 11 second sem core subjects": [
            "Core subjects for Grade 11 second semester include Reading and Writing, Pagbasa at Pagsusuri, Statistics and Probability, Understanding Culture, and PE & Health.",
            "In Grade 11's second semester, students take core subjects like Reading & Writing, Filipino, Stats, Social Science, and PE.",
            "Grade 11 second sem core subjects: English 102, Filipino 102, Math 102, Social Science, and PE & Health 102."
        ],
    
        // Grade 11 Second Semester - Applied Subjects
        "grade 11 second sem applied subjects": [
            "Applied subjects in the second semester of Grade 11 include Filipino sa Piling Larang and Practical Research 1.",
            "Grade 11 Applied subjects for second sem: Practical Research, Filipino 110, and either Physical Science or Disaster Readiness depending on your track.",
            "In Grade 11 second sem, applied offerings include Filipino, Practical Research, and either Physical Science or DRRR based on your strand."
        ],
    
        // Grade 11 Specialized Subjects
        "grade 11 specialized subjects": [
            "Grade 11 Specialized subjects include Pre-Calculus for STEM, ABM 1 for ABM, Creative Writing for GAS, World Religions for HUMSS, and F&B Services for TVL.",
            "Specialized Grade 11 subjects: STEM gets Pre-Calculus, ABM has Fundamentals 1, HUMSS studies World Religions, GAS takes Creative Writing, and TVL has Food & Beverage Services.",
            "Depending on the strand, Grade 11 specialized subjects include advanced Math, Business, Writing, Philosophy, or Technical-Vocational skills."
        ],
    
        // Grade 12 First Semester - Core Subjects
        "grade 12 first sem core subjects": [
            "Core subjects for Grade 12 first sem include 21st Century Literature, Contemporary Philippine Arts, and PE & Health.",
            "Grade 12 first sem core offerings: Humanities 101, Arts from the Region, and PE.",
            "In Grade 12, the first semester core subjects are Literature, Philippine Arts, and PE."
        ],
    
        // Grade 12 First Semester - Applied Subjects
        "grade 12 first sem applied subjects": [
            "Applied subjects for Grade 12 first sem are Entrepreneurship and Practical Research.",
            "Grade 12 Applied courses include Practical Research and Entrepreneurship.",
            "In Grade 12 first sem, Applied classes are Entrepreneurship and Research."
        ],
    
        // Grade 12 First Semester - Specialized Subjects
        "grade 12 first sem specialized subjects": [
            "Specialized subjects for Grade 12 first sem vary by strand, including Biology, Chemistry, and Calculus for STEM; Accounting and Business Math for ABM; and Creative Writing and DIASS for HUMSS.",
            "Depending on the track, Grade 12 first sem specialized subjects include STEM sciences, ABM business topics, or HUMSS social sciences and writing.",
            "Specialized offerings in Grade 12 include advanced topics in science, business, writing, or tech, depending on your strand."
        ],
    
        // Grade 12 Second Semester - Core Subjects
        "grade 12 second sem core subjects": [
            "Core subjects in Grade 12 second semester include Media and Information Literacy and PE & Health.",
            "Grade 12 second sem core subjects: Media Literacy and PE.",
            "The second sem core classes for Grade 12 include MIL and PE & Health."
        ],
    
        // Grade 12 Second Semester - Applied & Immersion
        "grade 12 second sem applied subjects": [
            "Applied track subject in Grade 12 second sem is Inquiries, Investigation, and Immersion.",
            "For the last semester, students take Inquiries, Investigation, and Immersion as an applied subject.",
            "Grade 12 second semester applied requirement is the Immersion subject."
        ],
    
        // Grade 12 Second Semester - Specialized Subjects
        "grade 12 second sem specialized subjects": [
            "Specialized subjects in Grade 12 second sem include advanced science for STEM, finance for ABM, politics and citizenship for HUMSS and GAS, and immersion or NC II for TECHVOC.",
            "In the second sem, specialized classes include Work Immersion and strand-specific subjects like General Physics 2, Business Finance, or Community Engagement.",
            "Grade 12 final sem includes Work Immersion and specialization topics based on your strand — like advanced sciences, business, or governance."
        ],
        "shs grading system": [
            "USANT SHS follows the DepEd grading policy where a final grade of 75 or above is required to pass.",
            "The grading system follows DepEd Orders 12, 31 (2020), and 8 (2015), with a passing grade of 75 or higher.",
            "To pass at USANT SHS, students need at least 75 in each subject, based on DepEd guidelines.",
            "SHS grading is based on DepEd policies, with at least 75 as the passing grade in all subjects."
        ],
    
        // How students are assessed
        "how are shs students graded": [
            "Students are graded through at least 4 written works and 4 performance tasks per quarter.",
            "SHS grading includes summative assessments like quizzes, tests, and performance-based tasks.",
            "Written works and performance tasks are used to measure student learning, along with quarterly exams.",
            "Assessments include quizzes, long tests, skill demos, projects, and presentations."
        ],
    
        // What are performance tasks
        "what are performance tasks": [
            "Performance tasks include projects, presentations, demos, and other activities showing skills or knowledge.",
            "Performance tasks let students show what they learned through group work, oral presentations, or creative output.",
            "Examples of performance tasks are: skill demos, multimedia presentations, and research projects.",
            "Performance tasks may also include written outputs, depending on the rubric used."
        ],
    
        // Core subjects grading weights
        "grading weights core subjects": [
            "For core subjects, grades are based on: 25% written works, 50% performance tasks, and 25% quarterly exams.",
            "Core subjects use this grading formula: Written Works 25%, Performance Tasks 50%, and Exams 25%.",
            "In core subjects, performance tasks weigh the most at 50%, followed by written works and exams at 25% each."
        ],
    
        // Other academic subjects grading weights
        "grading weights academic subjects": [
            "Academic track subjects are graded: 25% written works, 45% performance tasks, 30% exams.",
            "The grading breakdown for academic subjects (non-core) is: Written Works 25%, Tasks 45%, Exams 30%.",
            "Subjects like specialized or applied classes use: 25% written works, 45% tasks, and 30% quarterly tests."
        ],
    
        // Work Immersion/Research grading weights
        "grading weights work immersion": [
            "For Work Immersion, Research, and similar subjects: 35% written works, 40% performance tasks, and 25% exams.",
            "Grades in Work Immersion or research-based subjects are based on: Written 35%, Tasks 40%, Exams 25%.",
            "Subjects like Work Immersion, Business Simulation, or Research follow: 35% written, 40% tasks, 25% quarterly assessment."
        ],
        "how to be an honor student in shs": [
        "To qualify for honors in SHS, you must not have a grade lower than 87 in any subject.",
        "SHS students must maintain at least 87 in all subjects to be eligible for academic honors.",
        "Even one subject below 87 disqualifies a student from receiving honors, based on DepEd Order No. 36 s. 2016."
    ],

    // Honor categories
    "academic excellence award shs": [
        "With Highest Honors is awarded to students with final grades of 98 to 100.",
        "To receive With High Honors, a student must have final grades between 95 and 97.",
        "Students with grades from 90 to 94 qualify for With Honors recognition.",
        "SHS honor awards: 98-100 is Highest Honors, 95-97 is High Honors, and 90-94 is Honors."
    ],
    "leadership award requirements": [
        "To qualify for the Leadership Award in Grade 12, a student must: have no failing grades, no major offenses, and be an active class or club officer.",
        "Leadership Award is given to graduating students with good conduct, no failing grades, and active involvement in school leadership roles.",
        "You need to be a class or club officer, have clean disciplinary records, and no failing grades to get the Leadership Award."
    ],

    // Discipline awards
    "outstanding performance award disciplines": [
        "Awards for outstanding performance can be given in Athletics, Arts, Communication Arts, Math, Science, Social Science, and Tech-Voc.",
        "Grade 12 students can receive awards in specific disciplines like Math, Science, Communication, or Tech-Voc if they show excellence and impact.",
        "Students who excel and contribute in areas like Arts, Athletics, Math, or Science can qualify for special discipline awards."
    ],

    // Work Immersion award
    "work immersion award requirements": [
        "To get the Work Immersion Award, students must have at least 90% in the subject and show outstanding performance based on their supervisor's evaluation.",
        "Work Immersion Award is for Grade 12 students with high ratings (90%+) and excellent performance during immersion.",
        "You must perform well and get at least a 90% final grade in Work Immersion to receive this award."
    ],

    // Research/Innovation award
    "research or innovation award shs": [
        "SHS students who led a research or innovation project that benefits the school or community may receive this award.",
        "Grade 12 students can earn the Research/Innovation Award if their work has practical value and was well executed.",
        "The Research/Innovation Award is given to small groups or individuals in SHS who completed impactful research or tech projects."
    ],

    // Club/Organization award
    "club or organization award shs": [
        "Clubs that completed their projects, supported school events, and positively impacted the community can be given this award.",
        "The Organization Award goes to clubs that have helped the school, achieved their goals, and developed their members' potential.",
        "SHS clubs with strong contributions and complete project implementation can qualify for the Club/Organization Award."
    ],

    // Special Recognition
    "special recognition student award": [
        "Students who win or represent the school in district to international competitions may receive Special Recognition.",
        "Special Recognition is for students who bring honor to the school through academic, artistic, or athletic excellence in competitions.",
        "Winners or representatives in recognized contests are acknowledged in ceremonies with medals, certificates, or plaques."
    ],
        "admission requirements grade 11": [
            "For Grade 11 admission, you'll need: 1) Certificate of Grade 10 Completion, 2) Certificate of Moral Character, 3) Report Card or Form 138, 4) Recent 1x1 picture (2 copies), 5) PSA Birth Certificate, and 6) Qualified Voucher Recipient (QVR) Certificate if applicable.",
            "Grade 11 applicants must submit: Grade 10 completion certificate, moral character certificate, Form 138, two 1x1 photos, PSA birth certificate, and QVR certificate for voucher recipients.",
            "To enroll in Grade 11, prepare these documents: completion certificate from Grade 10, moral character certification, official report card, ID pictures, birth certificate, and voucher certificate if qualified."
        ],
        "admission requirements grade 12": [
            "For Grade 12 enrollment, you only need to present your 1st and 2nd semester grades to the principal.",
            "Continuing to Grade 12? Just submit your semester grades from Grade 11 to the principal.",
            "Grade 12 admission requires presentation of both semester grades from your previous year."
        ],
        "online enrollment procedure": [
            "Enrollment process: 1) Access enroll.usant.edu.ph, 2) Fill out the form for your department/level, 3) New students get encoded in the system while continuing students retrieve their numbers, 4) Payment at cashier or off-site, 5) MIS generates enrollment report.",
            "Online enrollment steps: Visit the registration link, complete personal information, receive student number (new via encoding/continuing via retrieval), make payment onsite or offsite, then wait for enrollment confirmation.",
            "How to enroll online: Access the portal, submit required information, get your student number, complete payment, and await confirmation via SMS/email."
        ],
        "purchase of textbook": [
            "Textbooks must be purchased each semester (cash or installment). Bonus: 10 additional exam points per quarter when you have the required books.",
            "Buy your textbooks every semester for a 10-point bonus in exam components each quarter. Payment options include cash or installment.",
            "Required textbook purchase gives you an edge - 10 extra points in quarterly exams when you have all required books."
        ],
        "sectioning": [
            "Class sections are assigned on a first-come, first-served basis without grade qualifications.",
            "Section assignments follow enrollment order - no academic requirements affect placement.",
            "First to enroll gets first choice of sections - no grade-based sectioning at USANT."
        ],
        "senior high school voucher program": [
            "The SHS Voucher Program provides Php 14,000-17,500 annual subsidy. Public JHS completers (Category A) and ESC grantees (Category B) qualify automatically. Others may apply at ovap.peac.org.ph.",
            "Voucher Program offers tuition assistance: automatic for public/ESC students (Categories A/B), application required for others (Categories C/D) through PEAC's portal.",
            "Get up to Php 17,500 yearly subsidy: automatic for public school/ESC graduates, application needed for non-ESC private school/ALS students."
        ],
        "school policies": [
            "Key policies: 1) Max 20 absences before being dropped, 2) Required textbooks earn bonus points, 3) Only one promissory note allowed, 4) Strict exam permit requirements, 5) Fail 3 subjects = transfer required, 6) No computer shops during class, 7) Cyberbullying prohibited, 8) No sleeping in class.",
            "Important rules: Attendance limits, textbook requirements, exam procedures, retention standards, and prohibitions against truancy, cyberbullying and sleeping in class.",
            "Policy highlights: Attendance monitoring, academic requirements, behavior expectations, and consequences for violations including removal for excessive absences or failing grades."
        ],
        "attendance policy": [
            "Students must attend regularly. 20+ absences (20% of contact hours) means automatic removal. Planned absences require advance notice with parent-signed excuse.",
            "Attendance rules: Medical/parent notes required for absences. More than 20 days absent = dropped from roster. Pre-arranged absences need prior approval.",
            "Max 20 absences per semester allowed. Beyond this leads to automatic removal. All absences require documentation."
        ],
        "examination policies": [
            "Exam rules: 1) Get permit before exam date, 2) Principal must sign permits in advance, 3) Special exams only for ill students with medical certificates submitted within a week.",
            "For exams: Secure signed permits early. Only medical absences qualify for special exams with proper documentation.",
            "Exam requirements: Plan ahead for permits. No make-ups except for illness with immediate medical proof."
        ],
        "retention policy": [
            "Academic retention: Fail 3 subjects = must transfer. Fail 1-2 subjects = summer class with 80+ grade to continue.",
            "Failing 3 courses means leaving USANT. 1-2 failures require summer remediation with minimum 80 grade.",
            "Continue at USANT by: Passing all subjects, or with maximum 2 failures (summer class required with 80+ grade)."
        ],
        "behavior policies": [
            "Conduct rules: No computer shops during class (2 violations = no re-enrollment), no cyberbullying, no sleeping in class (parents will be called).",
            "Behavior expectations: Avoid truancy (computer shops), cyber harassment, and sleeping in class - all carry serious consequences.",
            "Discipline policies prohibit: Daytime computer café visits, online bullying, and sleeping during lectures - with escalating penalties."
        ],
        "core values": [
            "USANT upholds the core values: Maka-Diyos (God-loving), Maka-tao (People-oriented), Makakalikasan (Environment-friendly), and Makabansa (Nation-loving).",
            "The university's guiding principles are rooted in faith, service, environmental care, and patriotism.",
            "Maka-Diyos, Maka-tao, Makakalikasan, Makabansa - these four values define USANT's character.",
            "USANT instills values of spirituality, humanity, ecological awareness, and national pride in its students."
        ],
        "department vision": [
            "The department aims to produce graduates who are academically strong, tech-savvy, and equipped with skills for work, business, or higher education.",
            "Our vision: creating well-rounded students ready for college, entrepreneurship, or professional careers.",
            "We envision graduates excelling in academics, technology, and practical life skills for the modern world.",
            "The goal is to shape students who are knowledge-ready, tech-prepared, and career-equipped."
        ],
        "department mission": [
            "Our mission is to provide holistic education that develops knowledge, technological skills, and lifelong learning abilities.",
            "We create an educational environment that nurtures both technical competencies and enduring life skills.",
            "The department is committed to comprehensive learning experiences that prepare students for future challenges.",
            "Through balanced curriculum, we equip learners with both academic knowledge and practical capabilities."
        ],
        "department goals": [
            "Our goals include providing equal opportunities, guiding career paths, maintaining global standards, fostering national pride, and developing 21st century skills.",
            "We aim to: 1) Offer accessible education 2) Guide career interests 3) Meet global standards 4) Encourage nation-building 5) Develop critical thinking skills.",
            "Six key goals drive us: educational access, career guidance, global competence, civic engagement, holistic growth, and skill development.",
            "From classroom to community, our goals focus on student success in all aspects of life."
        ],
        "academic tracks": [
            "USANT offers four Academic Strands: ABM (Business), STEM (Science/Tech), HUMSS (Social Sciences), and GAS (General Academics).",
            "Choose from ABM for business, STEM for sciences, HUMSS for social studies, or GAS for flexible options.",
            "Academic tracks include: ABM (Accounting/Business), STEM (Engineering/Science), HUMSS (Humanities), and GAS (Undecided).",
            "The Academic Track has specialized strands catering to different career paths and college preparations."
        ],
        "abm strand": [
            "ABM Strand prepares students for business careers like accounting, management, marketing, and entrepreneurship.",
            "The Accountancy & Business Management strand covers financial concepts for future business leaders and accountants.",
            "Future CEOs and entrepreneurs start here! ABM teaches business operations, management, and financial skills.",
            "ABM students learn accounting principles and business strategies vital for the economy's growth."
        ],
        "stem strand": [
            "STEM Strand is for math/science enthusiasts pursuing careers in engineering, medicine, or technology fields.",
            "Science, Technology, Engineering & Math strand focuses on advanced concepts for future scientists and engineers.",
            "STEM prepares students for tech-driven careers in our digital world, from robotics to medical sciences.",
            "If you love solving complex problems, STEM offers training in calculus, physics, chemistry, and biology."
        ],
        "humss strand": [
            "HUMSS Strand develops communication and critical thinking skills for future teachers, lawyers, and social scientists.",
            "Humanities & Social Sciences strand explores culture, politics, and human behavior for liberal arts majors.",
            "HUMSS is perfect for aspiring journalists, psychologists, and educators who want to understand society.",
            "This strand builds strong writers and speakers through studies in philosophy, arts, and social phenomena."
        ],
        "gas strand": [
            "GAS Strand offers flexible subjects for undecided students, combining elements from all academic strands.",
            "General Academic Strand lets students explore different fields before choosing a college specialization.",
            "Can't decide? GAS allows you to sample humanities, business, and science subjects in one track.",
            "The most versatile strand, GAS prepares students for various college programs through diverse electives."
        ],
        "tvl track": [
            "TVL Track provides technical-vocational training in Home Economics with TESDA-certified specializations.",
            "The Technical-Vocational-Livelihood track develops practical skills for immediate employment after graduation.",
            "TVL-Home Economics strand teaches valuable life skills and service industry competencies.",
            "This hands-on track prepares students for careers in tourism, health, food service, and community development."
        ],
        "university mace": [  
            "The University Mace symbolizes authority in all USANT ceremonies. Its hardwood shaft has three rings marking the institution's growth from academy to college to university, crowned by the university seal.",  
            "USANT's ceremonial mace features Mt. Iriga and Bicol's lakes on its seal, with three rings representing its evolution from St. Anthony's Academy to a full university.",  
            "The University Mace's design tells USANT's story: the shaft's three rings show its growth, while the seal highlights Mt. Iriga, local lakes, and the flame of knowledge.",  
            "A symbol of authority, the USANT mace bears the university seal with Bicol landmarks and its PIETAS, INTEGRITAS, SAPIENTIA philosophy illuminated by a flame."  
        ],  
        "university colors": [  
            "USANT's official colors are maroon, white, and gold.",  
            "The university proudly uses maroon, white, and gold as its signature colors.",  
            "Look for maroon, white, and gold—these are USANT's official colors.",  
            "Maroon paired with white and gold represents the University of Saint Anthony."  
        ],  
        "usant vision": [  
            "USANT aims to be a distinguished leader in providing quality yet affordable education.",  
            "The university's vision is to excel as a top provider of accessible, high-quality education.",  
            "USANT strives to lead in affordable, excellent education for all.",  
            "A future where USANT is recognized for outstanding, budget-friendly education—that's the vision."  
        ],  
        "usant mission": [  
            "USANT's mission is to drive individual and societal growth through academic excellence, research, and community service.",  
            "The university commits to outstanding programs, research, and outreach for personal and community development.",  
            "Through education and service, USANT empowers individuals and uplifts society.",  
            "Academic innovation + research + community impact = USANT's mission in action."  
        ],  
        "usant goals": [  
            "USANT's goals include affordable schemes, excellent faculty, program accreditation, student competitiveness, modern facilities, impactful research, and strong alumni ties.",  
            "From financial accessibility to top-notch facilities, USANT works to achieve holistic student and institutional growth.",  
            "The university focuses on 8 key goals: affordability, faculty excellence, accreditation, skills development, campus upgrades, research grants, community aid, and alumni partnerships.",  
            "USANT's roadmap includes student support, faculty development, and community engagement to fulfill its mission."  
        ],  
        "deped vision": [  
            "DepEd envisions nation-loving Filipinos reaching their full potential to help build the country.",  
            "A Philippines where every citizen's skills and values contribute to national progress—that's DepEd's dream.",  
            "DepEd aims to cultivate competent, patriotic learners who shape the nation's future.",  
            "Love of country + lifelong learning = DepEd's vision for Filipino students."  
        ],  
        "deped mission": [  
            "DepEd ensures every Filipino's right to quality, inclusive education in safe, motivating environments with engaged stakeholders.",  
            "The department's mission: equitable education where students, teachers, parents, and communities work together for lifelong learning.",  
            "DepEd commits to child-friendly schools where teachers nurture, administrators support, and families actively participate in education.",  
            "Quality education for all, powered by collaborative effort—that's DepEd's mission."  
        ],  
        "deped core values": [  
            "DepEd emphasizes love of country, learner-centered service, and continuous improvement to better serve Filipinos.",  
            "Patriotism, student-focused education, and institutional growth define DepEd's core values.",  
            "DepEd operates on values of national pride, equitable learning, and constant progress.",  
            "Maka-Diyos, Makatao, Makabayan—DepEd instills these in every Filipino learner."  
        ],
        "history": [
            "The University of Saint Anthony was founded on August 18, 1947 as St. Anthony's Academy, a night high school for working students. It became a university in 1973, making it the first in Iriga City and the first established under Martial Law in the Philippines.",
            "USANT started in 1947 as St. Anthony's Academy, founded by the Rinconada Educators' Association. Dr. Santiago G. Ortega was its first President. It became a university in 1973.",
            "From a night high school in 1947 to the first university in Iriga City by 1973 - that's the remarkable journey of USANT!",
            "USANT's history began in 1947 and has grown from an academy to a full university offering education from nursery to post-graduate studies."
        ],
        "philosophy": [
            "The University of Saint Anthony operates under the triune philosophy of PIETAS (Piety), INTEGRITAS (Integrity), and SAPIENTIA (Wisdom).",
            "USANT's guiding principles are PIETAS, INTEGRITAS, and SAPIENTIA - representing piety, integrity, and wisdom.",
            "The university's foundation rests on three ideals: piety, integrity, and wisdom (PIETAS, INTEGRITAS, SAPIENTIA).",
            "PIETAS, INTEGRITAS, SAPIENTIA - these three values form the core philosophy of USANT."
        ],
        "founder": [
            "The University of Saint Anthony was founded by the Rinconada Educators' Association, with Dr. Santiago G. Ortega as its first President and Director.",
            "USANT was established by the Rinconada Educators' Association in 1947, with Dr. Santiago G. Ortega leading as President.",
            "The founders of USANT were the Rinconada Educators' Association, who created St. Anthony's Academy which later became the university.",
            "Dr. Santiago G. Ortega and the Rinconada Educators' Association founded what would become the University of Saint Anthony."
        ],
        "senior high history": [
            "USANT's Senior High School program began in 2016, initially led by Mrs. Remelita G. Fraginal. It became independent in 2017-2018 under Principal Mrs. Nenita T. Andalis.",
            "The Senior High School Department started in 2016 and now operates in its own building - the Gloria Daisy Fajardo Hall, named after a long-serving principal.",
            "USANT Senior High School has grown since 2016, producing quality graduates who excel in both academic and technical-vocational fields.",
            "From its first graduation in 2018 to its current achievements, USANT's Senior High School continues to reach new heights in education."
        ],
        "mission": [
            "USANT aims to provide students the opportunity to live morally, spiritually, socially, intellectually, and productively in a democratic society.",
            "The university strives to recognize each student's intrinsic worth and dignity while providing quality, affordable education.",
            "USANT's mission focuses on holistic development - moral, spiritual, social, intellectual, and productive growth of its students.",
            "With social responsibility at its core, USANT is committed to providing accessible, quality education to its community."
        ],
        "senior high achievements": [
            "USANT Senior High School graduates excel in both academic and technical fields, with many gaining admission to prestigious universities or passing TESDA competency exams.",
            "The Senior High School Department has earned recognition in local and national competitions, producing quality graduates year after year.",
            "From academic track students entering top universities to TVL graduates passing TESDA exams, USANT Senior High delivers excellent results.",
            "USANT's Senior High program continues to achieve milestones, with plans for accreditation and expanded offerings in the future."
        ],

"president": [
        "The current president of the University of Saint Anthony is Atty. Emmanuel SD. Ortega, LLM.",
        "Atty. Emmanuel SD. Ortega, LLM is the president of USANT.",
        "USANT's president? That's Atty. Emmanuel SD. Ortega.",
        "The university is led by President Atty. Emmanuel SD. Ortega, LLM."
    ],
    "who leads usant": "Dr. Emmanuel SD. Ortega, LLM serves as the president of USANT.",
    "current usant president": "As of now, the president is Dr. Emmanuel SD. Ortega, LLM.",

    "founded": [
        "USANT was founded by Dr. Santiago G. Ortega Sr.",
        "The founder of USANT is Dr. Santiago G. Ortega Sr.",
        "Dr. Santiago G. Ortega Sr. established USANT in 1947."
    ],
    "founder": [
        "USANT was founded by Dr. Santiago G. Ortega Sr.",
        "The university's founder is Dr. Santiago G. Ortega Sr."
    ],


"student assistantship": [
    `Eligibility:\n- Age 18-30\n- No failing grades\n- Submit application to OSA\n\nDeadline: Usually 2 weeks before semester starts.`,
    `Want to be a student assistant? Requirements:\n1. Good grades\n2. Full-time enrollment\n3. Submit documents to Dean Judavar.`
],

"how to apply for assistantship": [
    "Steps:\n1. Get forms from OSA\n2. Submit:\n   - Application letter\n   - Grades\n   - Parent consent\n3. Interview if needed.",
    "Process:\n- Collect requirements\n- Submit to Office of Student Affairs\n- Wait for approval\n\nTakes ~2 weeks."
],

"assistantship benefits": [
    "Benefits include:\n- Monthly stipend\n- Work experience\n- Priority in some programs",
    "You'll receive:\n- Financial support\n- Skill development\n- Networking opportunities"
],

"assistant pay": "Student assistants receive a stipend, but amounts vary. Ask OSAA for details.", // Informal
"how much do assistants make": "Stipend amounts depend on hours/department. Check with OSAA.", // Very casual
"can freshmen apply": "No, you must complete at least one semester first.", // Follow-up

"enrollment": [
    "Options:\n1. Online: enroll.usant.edu.ph\n2. On-site: SGO Lounge or ACG Room 101",
    "Register at:\n- Gregoria Sanches Hall (Room 207)\n- OR online portal"
],

"how to enrol": "Note: It's 'enroll', but you can register at enroll.usant.edu.ph", // UK spelling
"paano mag enroll": "Pwede online (enroll.usant.edu.ph) o sa SGO Lounge.", // Tagalog mix
"registration": "Same as enrollment! Visit enroll.usant.edu.ph or campus offices.", // Synonym
"sign up for classes": "You mean enrollment? Go to enroll.usant.edu.ph or ACG Room 101.", // Casual

"late enrollment": [
    "Late registrants pay a penalty fee. Contact Registrar (ext. 113).",
    "Possible with approval and late fee. Hurry to ACG Room 101!"
],

"requirements for enrollment": [
    "Bring:\n- ID photos\n- Previous grades\n- Payment\n\nFirst-years need additional docs.",
    "Needed:\n1. Form 137/138\n2. Birth certificate\n3. Medical clearance"
],
"requirements for enrolling": [
    "Bring:\n- ID photos\n- Previous grades\n- Payment\n\nFirst-years need additional docs.",
    "Needed:\n1. Form 137/138\n2. Birth certificate\n3. Medical clearance"
],
"degree programs": [
    "Full list:\n- Nursing\n- Marine Engineering\n- CompSci\n- Business Admin\n\nSee usant.edu.ph/programs",
    "Undergrad options:\n• Accountancy\n• Tourism\n• Education\n• Psychology"
],

"what courses are available": "Over 20 programs! Top picks:\n1. Nursing\n2. Criminology\n3. Engineering", // Casual
"best program in usant": "Nursing and Marine Engineering are most competitive.", // Opinion-based
"courses offered": "From Architecture to Zoology—check the registrar's list!", // Playful

"humss strand": [
    "HUMSS covers:\n- Sociology\n- Literature\n- Political Science\nGreat for law/politics careers!",
    "Humanities & Social Sciences:\n- Focus on critical thinking\n- Prepares you for liberal arts degrees"
],

"stem subjects": [
    "STEM includes:\n- Advanced Math\n- Physics\n- Engineering basics\n- Programming",
    "Science/Tech/Engineering/Math:\n- Heavy on calculus & labs\n- Prep for med/engineering schools"
],
"anti bullying": [
    "USANT has zero tolerance. Report to Guidance Office (ext. 126) or use anonymous forms.",
    "Policy details:\n- RA 10627 applies\n- Consequences up to expulsion\n- Counseling available"
],

"how to report a bully": [
    "1. Document incidents\n2. Submit written report to Guidance\n3. Investigation follows",
    "Options:\n- Tell a teacher\n- Email OSA\n- Call Guidance (ext. 126)\nAll reports confidential."
],

"what happens to bullies": [
    "Depending on severity:\n1. Warning\n2. Suspension\n3. Expulsion\n+ Mandatory counseling",
    "Consequences:\n- Parent conference\n- Probation\n- Possible legal action"
],

"verbal bullying": "Even non-physical harassment violates policy. Report it!", // Specific case
"cyberbullying": "Online harassment is also prohibited. Save screenshots as evidence.", // Modern issue
"hub": [
    "The Hub is near Gate 3. It has:\n- Study pods\n- Charging stations\n- Event spaces",
    "USANT's newest building! Features:\n• 24/7 study areas\n• Café\n• Tech labs"
],

"where is the hub": "From Gate 1:\n1. Walk past oval\n2. Turn left after SHS building\n3. Glass building ahead", // Directions
"how to go to hub": "Easiest from Gate 3—it's the modern glass structure on your right.", // Casual
"hub facilities": "Includes:\n- Free WiFi zones\n- Bookable meeting rooms\n- Printing stations",

"forum": [
    "The Forum is an open events space in front of Senior High School.",
    "Where graduations are held! Central outdoor area near admin buildings."
],

"where is the forum": "Landmark:\n- Beside flagpole\n- Between SHS and College Library", // Visual cues
"forum events": "Hosts:\n- Orientation\n- Concerts\n- University-wide announcements", // Usage
"dona felisa scholarship": [
    "For top 10 Grade 10 completers:\n- 1st: 100% free tuition\n- 2nd: 75%\n- 3rd: 50%\n- 4th-10th: 25%",
    "Academic excellence award:\n• Requires maintaining grades\n• Automatic consideration"
],
"dona felisa": [
    "For top 10 Grade 10 completers:\n- 1st: 100% free tuition\n- 2nd: 75%\n- 3rd: 50%\n- 4th-10th: 25%",
    "Academic excellence award:\n• Requires maintaining grades\n• Automatic consideration"
],
"what is usant?": [
    "The University of Saint Anthony is a private, non-sectarian and non-profit educational institution in the Philippines. It was founded in 1947 by Dr. Santiago G. Ortega. USANT is located at Iriga City, Camarines Sur province, Philippines.",
],
"how to get doña felisa": "Be top 10 in Grade 10 at USANT. No separate application!", // Accent handled
"felisa ortega scholarship": "Assuming you mean *Doña Felisa*—it's for top-performing Grade 10 students.", // Misremembered name

"arnulfo fajardo": [
    "Requirements:\n- G10 average ≥90\n- Must maintain ≥92\nCovers full tuition + fees.",
    "Competitive scholarship:\n- Renewable each term\n- Stricter grade requirements"
],

"special scholarship": [
    "For performing arts members (majorettes, band, etc.). Discounts vary by participation level.",
    "Talent-based aid:\n- Dance/chorale/music\n- Requires audition\n- Partial tuition coverage"
],
"motto": [
    "USANT's motto: 'Pietas, Integritas, Sapientia' (Piety, Integrity, Wisdom).",
    "Our guiding principles: Pietas (faith), Integritas (honesty), Sapientia (knowledge)."
],

"school hymn": [
    `All the USANT voices sing
    In accents loud and clear
    All the USANT echoes ring
    For the school we love so dear
    
    Here we march in search of a song
    Pass all barriers and all hills
    Here to start and here to stay long
    At the end of winding rill
    
    We are here, yes with delight
    And we shall serve where we stand
    We are proud of our USANT
    Leading school of Bicol Land
    
    Dear USANT oh our dear USANT
    We sing in praise of thee
    For we know your future's bright
    It's the school for you and me
    
    For you know that you'll never die
    And you'll live in every heart
    And the world will cheer Mabuhay
    Let us join and make a start.`
],

"usant colors": [
    "Official colors:\n- Maroon (primary)\n- Gold\n- White\n\nGo Mighty Maroons!",
    "Rep your school with maroon & gold—the university's traditional colors."
],

"old name of usant": [
    "Originally 'St. Anthony Academy' (1947), then 'Saint Anthony College' (1959).",
    "Name evolution:\n1. St. Anthony Academy\n2. Saint Anthony College\n3. USANT (1973)"
],

"uniform": [
        {
            text: "**SHS Uniform Policy**:\n- Official uniform required\n- PE uniform must be worn depending on your schedule\n- ID must be visible",
            image: "uniform.jpg",
            imageAlt: "uniform.jpg"
        },

    ],
    "dress code": {
        text: "Same as uniform policy! Requirements:\n- No jeans\n- Plain shoes\n- Neat appearance",
        image: "uniform copy.jpg", 
        imageAlt: "USANT Dress Code Guide"
    },
    
    "MIS Logo": [
        {
            text: "**MIS Logo**:",
            image: "MIS-removebg-preview.png",
            imageAlt: ""
        },
    ],
    "ssl": [
        {
            text: "The SSL or Senior Students League Office is located on the first floor of the Senior Highschool Building on the rightmost side of the building.",
            image: "rZzmwsAR.jpg",
            imageAlt: ""
        },
    ],
    "Principals Office": [
        {
            text: "The Principals Office is located at the rightmost side of the building on the second floor right next to the teachers lounge",
            image: "MC_qt2UU.jpg",
            imageAlt: ""
        },
    ],
    "Principal Office": [
        {
            text: "The SSL or Senior Students League Office is located on the first floor of the Senior Highschool Building on the rightmost side of the building.",
            image: "MC_qt2UU.jpg",
            imageAlt: ""
        },
    ],
    "Principal": [
        "The Current Principal of the Senior Highschool Department of USANT is Mrs. Nenita T. Andalis.",
    ],
    "vice Principal": [
        "The Current Vice Principal of the Senior Highschool Department of USANT is Mr. Carlito B. Gascon.",
    ],
    "Adviser of Rizal": [
        "The Class Adviser for Section Rizal is Ms. Liezel B. Praxides",
    ],
"history": [
        "USANT was founded on August 18, 1947 as St. Anthony's Academy, a night high school for working students. It became Saint Anthony College in 1959 and achieved university status in 1973.",
        "The University of Saint Anthony started as St. Anthony's Academy in 1947, founded by the Rinconada Educators' Association. Dr. Santiago G. Ortega was the first President."
    ],
    "when was usant founded": "USANT was founded on August 18, 1947 as St. Anthony's Academy.",
    "founder": "USANT was founded by Dr. Santiago G. Ortega Sr. and the Rinconada Educators' Association.",
    "old name": [
        "USANT was originally called St. Anthony Academy (1947), then Saint Anthony College (1959) before becoming University of Saint Anthony in 1973.",
        "Name evolution:\n1. St. Anthony Academy (1947)\n2. Saint Anthony College (1959)\n3. USANT (1973)"
    ],

    // University Identity
    "motto": [
        "USANT's motto: 'Pietas, Integritas, Sapientia' (Piety, Integrity, Wisdom).",
        "Our guiding principles: Pietas (faith), Integritas (honesty), Sapientia (knowledge)."
    ],
    "colors": [
        "Official colors:\n- Maroon (primary)\n- Gold\n- White\n\nGo Mighty Maroons!",
        "Rep your school with maroon & gold—the university's traditional colors."
    ],
    "hymn": [
        `All the USANT voices sing
        In accents loud and clear
        All the USANT echoes ring
        For the school we love so dear
        
        Here we march in search of a song
        Pass all barriers and all hills
        Here to start and here to stay long
        At the end of winding rill
        
        We are here, yes with delight
        And we shall serve where we stand
        We are proud of our USANT
        Leading school of Bicol Land
        
        Dear USANT oh our dear USANT
        We sing in praise of thee
        For we know your future's bright
        It's the school for you and me
        
        For you know that you'll never die
        And you'll live in every heart
        And the world will cheer Mabuhay
        Let us join and make a start.`
    ],
    "mace": "The University Mace symbolizes authority in ceremonies. Its shaft has three rings marking the institution's growth from academy to college to university. The seal features Mt. Iriga, Lakes Buhi and Bato, and the flame of knowledge representing Pietas, Integritas, Sapientia.",

    // Vision, Mission, and Goals
    "vision": "USANT will be a distinguished leader in the provision of quality, yet affordable education.",
    "mission": "The mission of USANT is to contribute to individual and societal development through outstanding academic programs, research, and community service.",
    "goals": [
        "USANT's goals include:\n- Adapting administrative schemes emphasizing social responsibility\n- Nurturing excellent professionals\n- Achieving program accreditation\n- Developing student competence in academics and skills\n- Enhancing campus experience with modern facilities\n- Generating research knowledge\n- Providing community extension services\n- Building alumni alliances",
        "Key goals:\n1. Corporate social responsibility\n2. Workplace excellence\n3. Program accreditation\n4. Holistic student development\n5. State-of-the-art facilities\n6. Research grants\n7. Community problem-solving\n8. Alumni engagement"
    ],

    // Senior High School Information
    "shs history": "The Senior High School program started in 2016. The first batch occupied the SGO building. In 2018, it moved to the Gloria Daisy Fajardo Hall, a three-story building with classrooms, labs, library, and canteen.",
    "shs tracks": [
        "SHS offers:\n1. Academic Track (ABM, STEM, HUMSS, GAS)\n2. Technical-Vocational-Livelihood Track (Home Economics)",
        "Tracks available:\n• ABM - Accountancy/Business\n• STEM - Science/Technology\n• HUMSS - Humanities\n• GAS - General Academics\n• TVL - Technical-Vocational"
    ],
    "shs strands": [
        "SHS offers:\n1. Academic Track (ABM, STEM, HUMSS, GAS)\n2. Technical-Vocational-Livelihood Track (Home Economics)",
        "Tracks available:\n• ABM - Accountancy/Business\n• STEM - Science/Technology\n• HUMSS - Humanities\n• GAS - General Academics\n• TVL - Technical-Vocational"
    ],
    "senior highschool strands": [
        "SHS offers:\n1. Academic Track (ABM, STEM, HUMSS, GAS)\n2. Technical-Vocational-Livelihood Track (Home Economics)",
        "Tracks available:\n• ABM - Accountancy/Business\n• STEM - Science/Technology\n• HUMSS - Humanities\n• GAS - General Academics\n• TVL - Technical-Vocational"
    ],
    "senior highschool tracks": [
        "SHS offers:\n1. Academic Track (ABM, STEM, HUMSS, GAS)\n2. Technical-Vocational-Livelihood Track (Home Economics)",
        "Tracks available:\n• ABM - Accountancy/Business\n• STEM - Science/Technology\n• HUMSS - Humanities\n• GAS - General Academics\n• TVL - Technical-Vocational"
    ],
    "abm strand": [
        "ABM Strand prepares students for business-related college courses. It covers financial management, business concepts, and corporate operations. Career paths include accounting, management, marketing, and entrepreneurship.",
        "Accountancy & Business Management focuses on:\n- Financial basics\n- Business concepts\n- Logical thinking\nPrepares students for careers as accountants, managers, or business leaders."
    ],
    "stem strand": [
        "STEM Strand focuses on advanced Math, Science, and Engineering concepts. It prepares students for careers in medicine, engineering, technology, and sciences through subjects like Calculus, Physics, and Chemistry.",
        "Science/Tech/Engineering/Math:\n- Heavy on calculus & labs\n- Prep for med/engineering schools\nCareer options: pilot, architect, engineer, doctor, nurse, marine engineer"
    ],
    "humss strand": [
        "HUMSS covers Sociology, Literature, Political Science and develops communication skills. It's ideal for students interested in law, education, journalism, or social sciences.",
        "Humanities & Social Sciences:\n- Focus on critical thinking\n- Prepares you for liberal arts degrees\nCareer paths: teacher, lawyer, psychologist, writer, reporter"
    ],
    "gas strand": "GAS is the most flexible strand, allowing students to sample subjects from other strands. It's ideal for undecided students and includes humanities, social sciences, management, and disaster preparedness.",
    "tvl strand": "TVL offers Home Economics specializations aligned with TESDA qualifications. Students learn skills for tourism, health, food services, and community development sectors.",

    "id policy": [
        "ID must be worn properly at all times on campus. Prohibited:\n- Wearing under clothing\n- Pinning on bags\n- Tampering\n- Sharing IDs\nLost IDs require an Affidavit of Loss.",
        "ID Rules:\n1. Visible at all times\n2. No alterations\n3. Non-transferable\n4. Report losses immediately\nViolations may lead to disciplinary action."
    ],
    "attendance policy": [
        "Attendance Rules:\n- Max 20 days absence per semester\n- Excuse letter required for absences\n- Medical certificate needed for exam absences\n- 20% absence = automatic dropping",
        "Important:\n• Planned absences need prior approval\n• Medical cert required for sick leave during exams\n• Truancy (skipping class) is a major offense"
    ],
    "examination policy": [
        "Exam Procedures:\n1. Secure exam permit beforehand\n2. Permits signed by Principal\n3. No special exams without medical certificate\n4. Cheating = major offense",
        "Key Points:\n• Exam permits required\n• No phones during tests\n• Cheating penalties include suspension\n• Special exams only with valid reason"
    ],
    "grading system": [
        "Grading Components:\nCore Subjects:\n- Written Works 25%\n- Performance Tasks 50%\n- Quarterly Assessment 25%\n\nAcademic Track:\n- Written Works 25%\n- Performance Tasks 45%\n- Quarterly Assessment 30%",
        "Promotion requires final grade ≥75 in all subjects. Retention:\n- Fail 3 subjects = advised to transfer\n- Fail 1-2 subjects = summer class required"
    ],
    "honors": [
        "Honor Awards:\nWith Highest Honors: 98-100\nWith High Honors: 95-97\nWith Honors: 90-94\nDisqualification: Any grade below 87",
        "Additional Awards:\n- Leadership Award\n- Outstanding in specific disciplines\n- Work Immersion Award\n- Research/Innovation Award"
    ],

    // Scholarships
    "scholarships": [
        "Available Scholarships:\n1. Doña Felisa Ortega Award (Top 10 Grade 10 completers)\n2. Arnulfo Fajardo Scholarship (90+ average)\n3. LAW Scholars\n4. Performing Arts Discount\n5. Sibling Discount (4+ siblings)",
        "Scholarship Options:\n• Doña Felisa: 100%-25% tuition (top 10)\n• Arnulfo Fajardo: Full tuition (92+ maintain)\n• Grade 11 Honors: 20%-40% off\n• Performing Arts: Varies"
    ],
    "doña felisa scholarship": [
        "For top 10 Grade 10 completers:\n- 1st: 100% free tuition\n- 2nd: 75%\n- 3rd: 50%\n- 4th-10th: 25%\nMust maintain grades to keep scholarship.",
        "Academic excellence award:\n• Automatic for top 10\n• No separate application\n• If transfer, must repay benefits"
    ],
    "arnulfo fajardo scholarship": [
        "Requirements:\n- G10 average ≥90\n- Must maintain ≥92\n- No grade below 87\nCovers full tuition + fees.\nSelection includes exam (60%) and interview (40%).",
        "Competitive scholarship:\n- Renewable each term\n- Stricter grade requirements\n- Must finish SHS or repay tuition"
    ],
    "special scholarship": [
        "For performing arts members (majorettes, band, etc.). Discounts vary by participation level.",
        "Talent-based aid for:\n- Majorettes\n- Band\n- Chorale\n- Dance Troupe\n- Rondalla\nPartial tuition coverage based on participation."
    ],

    // Facilities
    "buildings": [
        "Main Buildings:\n1. Doña Felisa Hall (Grade School)\n2. SAP Hall (High School)\n3. Gloria Daisy Fajardo Hall (SHS)\n4. SGO Hall (College)\n5. ACG Hall (Science)\n6. Perpetua Socorro Hall (Admin)",
        "Key Facilities:\n- Forum (events space)\n- 6 computer labs\n- Science labs\n- Library per department\n- Cafeterias\n- Medical/Dental clinics"
    ],
    "hub": [
        "The Hub is near Gate 3. It has:\n- Study pods\n- Charging stations\n- Event spaces\n- Café\n- Tech labs",
        "USANT's newest building! Features 24/7 study areas and collaborative spaces."
    ],
    "forum": [
        "The Forum is an open events space in front of Senior High School, used for graduations, concerts, and university-wide announcements.",
        "Where major events are held! Central outdoor area between SHS and College Library."
    ],
    "library": [
        "Libraries available:\n1. Grade School\n2. Junior High School\n3. Senior High School\n4. College\n5. Graduate School\nEach has books, resources, and study spaces.",
        "Library hours:\nWeekdays: 7AM-5PM\nSaturdays: 8AM-4PM\nBring your ID for access."
    ],
    "laboratories": [
        "Available Labs:\n- Biology/Chemistry\n- Computer Labs (6)\n- Maritime Simulator\n- Crime Scene\n- Health Care Skills\n- Speech Lab\n- Engineering Labs",
        "Specialized labs for:\n1. Sciences\n2. Engineering\n3. Criminology\n4. Maritime\n5. Nursing\n6. IT/Computer Science"
    ],

    // Student Services
    "osaa": [
        "Office of Student Affairs handles:\n- Student organizations\n- Activities approval\n- Discipline cases\n- ID/uniform matters\n- Leadership training\n- Student welfare",
        "OSA Services:\n1. Club accreditation\n2. Event coordination\n3. Discipline management\n4. ID processing\n5. Campus safety\n6. Parent communications"
    ],
    "guidance": [
        "Guidance Office provides:\n- Counseling\n- Career guidance\n- Testing services\n- Peer facilitation\n- Mental health programs\n- Orientation for new students",
        "Need help? Guidance offers:\n• Personal counseling\n• Academic advising\n• Career testing\n• Crisis intervention\n• Referral services"
    ],
    "medical": [
        "Clinic Services:\n- Free consultation\n- First aid\n- BP monitoring\n- Referrals\nHours:\nWeekdays: 7AM-12NN, 1PM-5PM\nSaturdays: 8AM-12NN, 1PM-4PM",
        "Medical offers:\n1. Basic healthcare\n2. Emergency care\n3. Online consultation\n4. Family planning advice\nBring your ID for service."
    ],
    "dental": [
        "Dental Clinic provides:\n- Diagnosis\n- Tooth extraction\n- Temporary fillings\n- Pain relief\n- Referrals to specialists\nSame hours as Medical Clinic.",
        "Dental services:\n• Emergency care\n• Tooth extraction\n• Oral health advice\n• Referrals for advanced care"
    ],

    // Activities and Organizations
    "shs activities": [
        "Department Activities:\n- Recollection (spiritual)\n- Au Revoir (promenade)\n- ABM: Business fairs\n- STEM: Science fairs\n- HUMSS: Social advocacy\n- TVL: Skills competitions",
        "Track-specific events:\nABM: Accounting quiz, business pitch\nSTEM: Disaster prep, science olympiad\nHUMSS: Hear Her!, Bugso\nTVL: Food expo, bartending"
    ],
    "student organizations": [
        "To form an org:\n1. 10+ members\n2. Submit constitution\n3. List officers\n4. Faculty adviser\n5. Approved activities\nMust renew recognition yearly.",
        "Organization Rules:\n• Only bona fide students\n• No academic probation\n• Officer GPA ≥80\n• Adviser required\n• Activities need approval"
    ],

    // Important Policies
    "anti bullying": [
        "USANT has zero tolerance. Report to Guidance Office (ext. 126) or use anonymous forms.",
        "Policy details:\n- RA 10627 applies\n- Consequences up to expulsion\n- Counseling available\nIncludes cyberbullying and social bullying."
    ],
    "how to report bullying": [
        "1. Document incidents\n2. Submit written report to Guidance\n3. Investigation follows\nAll reports confidential.",
        "Options:\n- Tell a teacher\n- Email OSA\n- Call Guidance (ext. 126)\nSave evidence for cyberbullying."
    ],
    "bullying consequences": [
        "Depending on severity:\n1. Warning\n2. Suspension\n3. Expulsion\n+ Mandatory counseling",
        "Progressive sanctions:\n• 1st offense: Warning\n• 2nd offense: Suspension\n• 3rd offense: Expulsion\nPlus intervention programs"
    ],
    "cyberbullying": "Online harassment is prohibited. Save screenshots as evidence. Report to Guidance Office with details of incidents.",

    // Work Immersion
    "work immersion": [
        "Required for all Grade 12 students:\n- 80 hours total\n- 10h orientation\n- 60h actual work\n- 10h documentation\nNeeded for graduation.",
        "Work Immersion:\n• Career preparation\n• Real workplace experience\n• School coordinates placements\n• Evaluation by supervisors"
    ],

    // Graduation Requirements
    "graduation requirements": [
        "To graduate:\n1. Complete all subjects\n2. Finish Work Immersion\n3. Clear all accounts\n4. Kahoy Mo, Diploma Mo (tree planting)\n5. Submit clearance",
        "Needed for diploma:\n• Academic completion\n• Immersion hours\n• Clearance form\n• Tree planting documentation"
    ],
    "kahoy mo diploma mo": [
        "Every graduate must plant a tree with:\n1. Proper fencing\n2. Label (name, section, plant type, date)\n3. Documentation\nAdvisers and VPAA verify.",
        "Tree Planting Program:\n• Environmental project\n• Required for graduation\n• Must maintain until final inspection\n• Part of USANT's green advocacy"
    ],

    // Miscellaneous
    "voucher program": [
        "SHS Voucher provides Php 14,000-17,500 yearly subsidy. Automatic for:\n1. Public JHS completers\n2. ESC grantees\nOthers apply via PEAC portal.",
        "Voucher Requirements:\n• Public JHS: LRN + PSA birth cert\n• ESC grantees: ESC cert\n• Private non-ESC: Apply via ovap.peac.org.ph\n• ALS: A&E/PEPT results"
    ],
    "online enrollment": [
        "Steps:\n1. Access enroll.usant.edu.ph\n2. Fill form\n3. Get student number\n4. Pay at cashier\nNew students get number via SMS/email.",
        "Online Enrollment:\n• Available for all levels\n• Continuing students use old number\n• Payment options: onsite/offsite\n• MIS monitors applications"
    ],
    "ptsa": [
        "Parent-Teacher Association:\n- Builds school-home connection\n- Discusses student progress\n- Supports school activities\n- Addresses common concerns",
        "PTA Roles:\n1. Communication bridge\n2. Activity support\n3. Issue resolution\n4. School improvement\n5. Student welfare advocacy"
    ]
    };
    function addMessage(sender, message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        if (isError) messageDiv.classList.add('error-message');
        
        console.log("Adding message:", message, "Type:", typeof message);
        
        let displayContent = '';
        
        // Add sender name
        displayContent += `<strong>${sender === 'user' ? 'You' : 'AI'}:</strong> `;

        if (typeof message === 'object' && message !== null) {
            if (message.text) {
                displayContent += marked.parse(message.text);
            }
            

            if (message.image) {
                const imagePath = message.isDataUrl ? message.image : `${message.image}`;
                console.log("Image path:", imagePath);
                
                displayContent += `
                    <div class="image-container" style="margin-top: 10px; max-width: 100%;">
                        <img 
                            src="${message.image}" 
                            alt="${message.imageAlt || 'Image'}" 
                            style="max-width: 100%; height: auto; display: block; border: 1px solid #ddd; border-radius: 4px;"
                            onerror="console.error('Failed to load image:', this.src); this.style.display='none'; this.insertAdjacentHTML('afterend', '<p style=\'color:red;\'>Image failed to load: ' + this.alt + '</p>');"
                        />
                    </div>
                `;
            }
        } else {
            displayContent += marked.parse(message.toString());
        }
        
        messageDiv.innerHTML = displayContent;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function updateDebugInfo(info) {
        debugOutput.textContent += info + '\n';
    }

    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.textContent = 'AI is thinking...';
        loadingDiv.className = 'message ai-message animate-pulse';
        chatHistory.appendChild(loadingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function hideLoadingIndicator() {
        const loadingDiv = document.getElementById('loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    function checkCustomResponses(message) {
        const lowerMsg = message.toLowerCase().trim();
        
        for (const [keyword, response] of Object.entries(customResponses)) {
            if (lowerMsg === keyword.toLowerCase()) {
                if (Array.isArray(response)) {
                    const selectedResponse = response[0]; 
                    if (typeof selectedResponse === 'object' && selectedResponse !== null && 'text' in selectedResponse) {
                        return selectedResponse; 
                    }
                    return selectedResponse; 
                }
                if (typeof response === 'object' && response !== null && 'text' in response) {
                    return response; 
                }
                return response; 
            }
        }
        
        for (const [keyword, response] of Object.entries(customResponses)) {
            if (lowerMsg.includes(keyword.toLowerCase())) {
                if (Array.isArray(response)) {
                    const selectedResponse = response[0];
                    if (typeof selectedResponse === 'object' && selectedResponse !== null && 'text' in selectedResponse) {
                        return selectedResponse; 
                    }
                    return selectedResponse; 
                }
                if (typeof response === 'object' && response !== null && 'text' in response) {
                    return response; 
                }
                return response; 
            }
        }
        
        return null;


    const contextResponses = {
    "Hub": {
        "what": {
            test: (msg) => msg.includes("what") && msg.includes("hub"),
            response: "The Hub is a newly built facility located near Gate 3, designed to create a central gathering and collaborative space for USANT students and staff. It represents the university's commitment to providing modern infrastructure to support student life and academic interactions."
        },
        "why": {
            test: (msg) => msg.includes("why") && msg.includes("hub"),
            response: "The Hub was created to promote collaboration, provide innovative study spaces, and enhance community interaction on campus. It reflects USANT's mission of contributing to individual and societal development through outstanding academic support."
        },
        "where": {
            test: (msg) => msg.includes("where") && msg.includes("hub"),
            response: "The Hub is located near the entrance of Gate 3. If you enter from Gate 1, walk through the covered walkway, pass the forum, cross the oval, and you'll find the newly constructed Hub building."
        }
    },
    "Forum": {
        "what": {
            test: (msg) => msg.includes("what") && msg.includes("forum"),
            response: "The Forum is a multipurpose space located in front of the Senior High School Building, serving as a central area for campus events, gatherings, and community interactions at USANT. It's a key space that supports the university's commitment to comprehensive student development."
        },
        "where": {
            test: (msg) => msg.includes("where") && msg.includes("forum"),
            response: "The Forum is situated directly in front of the Senior High School Building. If entering from Gate 1, go straight into the covered walkway until you reach the end. If entering from Gate 3, follow the path, and you'll quickly see the USANT Forum."
        }
    },
    "University": {
        "what": {
            test: (msg) => msg.includes("what") && msg.includes("university"),
            response: "USANT (University of Saint Anthony) is a private, non-sectarian, and non-profit educational institution founded in 1947 by Dr. Santiago G. Ortega. Located in Iriga City, Camarines Sur, Philippines, it offers a wide range of undergraduate and graduate programs across various disciplines."
        },
        "when": {
            test: (msg) => msg.includes("when") && msg.includes("university"),
            response: "USANT was established on August 18, 1947, originally known as St. Anthony Academy. It was elevated to university status in 1973 and has since grown to become a distinguished educational institution with campuses in the Philippines and Indonesia."
        },
        "why": {
            test: (msg) => msg.includes("why") && msg.includes("university"),
            response: "USANT was founded with the mission of contributing to individual and societal development through quality education. Its vision is to be a distinguished leader in providing affordable, high-quality education that produces globally competitive and well-rounded individuals."
        }
    },
    "Enrollment": {
        "how": {
            test: (msg) => msg.includes("how") && msg.includes("enroll"),
            response: "USANT offers both on-site and online enrollment. On-site enrollment takes place at designated areas like the SGO Student Lounge, ACG Room 101, and Gregoria Sanches Hall Room 207. Online enrollment is available for first-year students and transfer students at enroll.usant.edu.ph."
        },
        "where": {
            test: (msg) => msg.includes("where") && msg.includes("enroll"),
            response: "Enrollment locations include the SGO Student Lounge, ACG Room 101, and Gregoria Sanches Hall Room 207 for on-site registration. Online enrollment is available at enroll.usant.edu.ph for eligible students."
        }
    }
    
};

    for (const [context, questionTypes] of Object.entries(contextResponses)) { 
        for (const [questionType, responseObj] of Object.entries(questionTypes)) { 
            if (responseObj.test(lowerMessage)) { 
                return responseObj.response; 
            } 
        } 
    } 

    for (const [keyword, response] of Object.entries(customResponses)) { 
        if (lowerMessage === keyword.toLowerCase()) { 
            return response; 
        } 
    } 

    for (const [keyword, response] of Object.entries(customResponses)) { 
        if (lowerMessage.includes(keyword.toLowerCase())) { 
            return response; 
        } 
    } 

    return null; 
}

const customResponsesDB = {
    name: 'usant-responses',
    version: 1,
    store: 'responses'
};


function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(customResponsesDB.name, customResponsesDB.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(customResponsesDB.store)) {
                db.createObjectStore(customResponsesDB.store, { keyPath: 'keyword' });
            }
        };
    });
}

async function storeResponses() {
    const db = await initDB();
    const transaction = db.transaction(customResponsesDB.store, 'readwrite');
    const store = transaction.objectStore(customResponsesDB.store);
    
    Object.entries(customResponses).forEach(([keyword, response]) => {
        store.put({ keyword, response });
    });
}

async function getAIResponse(prompt, retries = 3) {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    try {
        const db = await initDB();
        const transaction = db.transaction(customResponsesDB.store, 'readonly');
        const store = transaction.objectStore(customResponsesDB.store);
        const cachedResponse = await new Promise((resolve) => {
            store.getAllKeys().onsuccess = (event) => {
                const keys = event.target.result;
                const matchingKey = keys.find(key => lowerPrompt.includes(key.toLowerCase()));
                if (matchingKey) {
                    store.get(matchingKey).onsuccess = (e) => resolve(e.target.result.response);
                } else {
                    resolve(null);
                }
            };
        });

        if (cachedResponse) {
            return cachedResponse;
        }

        if (navigator.onLine) {
            const model = modelSelect.value;
            
            if (!isModelAvailable(model)) {
                addMessage('system', 'Selected model is currently unavailable. Falling back to Mistral-7B.', true);
                modelSelect.value = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
            }

            const formattedPrompt = `<|system|>You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and engaging responses.

<|user|>${prompt}

<|assistant|>`;

            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: formattedPrompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        top_p: 0.9,
                        repetition_penalty: 1.2,
                        do_sample: true,
                        top_k: 50,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            let aiResponse;
            
            if (model.includes('mistral')) {
                aiResponse = data[0]?.generated_text;
            } else if (model.includes('Mixtral')) {
                aiResponse = data[0]?.generation || data[0]?.generated_text;
            } else {
                aiResponse = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
            }

            if (!aiResponse || isGenericResponse(aiResponse)) {
                throw new Error('Low quality or empty response received');
            }

            return aiResponse.replace(/<\|assistant\|>/g, '')
                           .replace(/<\|user\|>/g, '')
                           .replace(/<\|system\|>/g, '')
                           .trim();
        }
        
        return handleLocalResponse(prompt);
        
    } catch (error) {
        console.error('Error in getAIResponse:', error);
        
        if (retries > 0 && navigator.onLine) {
            const waitTime = Math.min(1000 * Math.pow(2, 3 - retries), 8000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return getAIResponse(prompt, retries - 1);
        }
        
        return handleLocalResponse(prompt);
    }
}
window.addEventListener('load', () => {
    // Other initialization code...
    setupImageUpload();
});


window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.error('ServiceWorker registration failed:', err));
    }
    
    storeResponses().catch(console.error);
    
    window.addEventListener('online', () => {
        document.getElementById('chat-container').classList.remove('offline-mode');
        addMessage('system', 'You are now online. Full chat capabilities restored.');
    });
    
    window.addEventListener('offline', () => {
        document.getElementById('chat-container').classList.add('offline-mode');
        addMessage('system', 'You are offline. Using cached responses only.');
    });
});

function isGenericResponse(response) {
    const genericPhrases = [
        "I want to give you the best possible answer",
        "I'm having trouble processing",
        "Could you elaborate",
        "I apologize, but I'm having trouble",
        "I encountered an issue"
    ];
    return genericPhrases.some(phrase => response.includes(phrase));
}

function handleLocalResponse(prompt) {
    // Extract key topics from the prompt
    const keywords = extractKeywords(prompt);

    const responses = {
        default: [
            "Based on your question about {topic}, I can help with {context}. What specific aspects would you like to explore?",
            "I understand you're interested in {topic}. Let's discuss {context} in more detail.",
            "Your question about {topic} is interesting. I can provide information about {context}.",
            "I'd be happy to explain about {topic}, particularly regarding {context}."
        ],
        coding: [
            "I see you're working with {topic}. Let me help you understand the {context}.",
            "For your {topic} question, I can explain how {context} works."
        ],
        technical: [
            "Regarding your {topic} inquiry, I can explain the {context} aspects.",
            "Let's explore how {topic} relates to {context}."
        ]
    };

    let responseType = 'default';
    if (keywords.some(k => ['code', 'programming', 'function', 'error'].includes(k))) {
        responseType = 'coding';
    } else if (keywords.some(k => ['technical', 'system', 'database', 'network'].includes(k))) {
        responseType = 'technical';
    }

    const templates = responses[responseType];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template
        .replace('{topic}', keywords[0] || 'your question')
        .replace('{context}', getContextFromKeywords(keywords) || 'relevant aspects');
}

function extractKeywords(prompt) {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an', 'is', 'are']);
    return prompt
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .slice(0, 3);
}

function getContextFromKeywords(keywords) {
    if (keywords.length === 0) return 'this topic';
    if (keywords.length === 1) return `${keywords[0]}-related concepts`;
    return `how ${keywords[0]} relates to ${keywords[1]}`;
}

function isModelAvailable(model) {
    const availableModels = [
        'mistralai/Mistral-7B-Instruct-v0.2',
        'meta-llama/Llama-2-70b-chat-hf',
        'meta-llama/Llama-2-13b-chat-hf',
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'google/gemma-7b-it'
    ];
    return availableModels.includes(model);
}

    async function handleUserInput() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;
    
        addMessage('user', userMessage);
        userInput.value = '';
    
        showLoadingIndicator();
        try {
            console.log("Checking for custom response for:", userMessage);
            console.log("Custom responses available:", Object.keys(customResponses));
            
            const customResponse = checkCustomResponses(userMessage);
            console.log("Custom response result:", customResponse);
            
            if (customResponse) {
                addMessage('ai', customResponse);
            } else {
                const aiResponse = await getAIResponse(userMessage);
                addMessage('ai', aiResponse);
            }
        } catch (error) {
            console.error("Error handling user input:", error);
            addMessage('ai', "Sorry, I encountered an error. Please try again.");
        } finally {
            hideLoadingIndicator();
        }
    }
    function setupImageUpload() {
        const sendButtonContainer = document.querySelector('.flex.justify-between.items-center.mt-2');
        const uploadButton = document.createElement('button');
        uploadButton.id = 'image-upload-btn';
        uploadButton.className = 'upload-btn';
        uploadButton.innerHTML = '📷 Add Image';
        
        sendButtonContainer.insertBefore(uploadButton, document.getElementById('export-button'));
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'image-file-input';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageObj = {
                    text: "I've uploaded this image:",
                    image: event.target.result,
                    imageAlt: file.name,
                    isDataUrl: true
                };
                addMessage('user', imageObj);
            };
            reader.readAsDataURL(file);
            
            fileInput.value = '';
        });
    }
    function debugImagePaths() {
        // Current script location
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1].src;
        console.log("Current script path:", currentScript);
        
        // Test different relative paths
        
        console.log("Testing image paths:");
        testPaths.forEach(path => {
            // Create a test image to see if it loads
            const img = new Image();
            img.onload = () => console.log(`SUCCESS: Image loaded from path: ${path}`);
            img.onerror = () => console.log(`FAILED: Image not found at path: ${path}`);
            img.src = path;
        });
    }
    
    window.addEventListener('load', debugImagePaths);
    
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
    exportButton.addEventListener('click', exportChat);


        updateDebugInfo('Enhanced chat interface initialized');
        function showSubmissionPage() {
            document.getElementById('chat-page').classList.add('hidden');
            document.getElementById('submission-page').classList.remove('hidden');
        }

        function showChatPage() {
            document.getElementById('submission-page').classList.add('hidden');
            document.getElementById('chat-page').classList.remove('hidden');
        }

        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const fileList = document.getElementById('file-list');
        const submissionForm = document.getElementById('submission-form');

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        function handleFiles(files) {
            fileList.innerHTML = '';
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                    return;
                }

                const fileItem = document.createElement('div');
                fileItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
                fileItem.innerHTML = `
                    <span class="text-sm">${file.name} (${(file.size / 1024).toFixed(1)}KB)</span>
                    <button type="button" class="text-red-500 hover:text-red-700">Remove</button>
                `;
                fileList.appendChild(fileItem);
            });
        }

        submissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('submission-title').value;
            const description = document.getElementById('submission-description').value;
            const files = fileInput.files;

            alert('Submission received! It will be reviewed by our team.');
            
            submissionForm.reset();
            fileList.innerHTML = '';
            showChatPage();
        });
        

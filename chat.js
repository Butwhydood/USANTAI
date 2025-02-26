// Theme toggle functionality remains the same

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

    // Login functionality remains the same
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const chatPage = document.getElementById('chat-page');
    const logoutButton = document.getElementById('logout-button');

    // Show login modal on page load
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

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        loginModal.style.display = 'flex';
        chatPage.classList.add('hidden');
        loginForm.reset();
    });

    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginModal.style.display = 'none';
        chatPage.classList.remove('hidden');
    }

    // Chat functionality
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const exportButton = document.getElementById('export-button');
    const debugOutput = document.getElementById('debug-output');
    const modelSelect = document.getElementById('model-select');

    let conversationHistory = "You are a helpful, creative, and friendly AI assistant. Please provide engaging and varied responses.";
    let lastRequestTime = 0;
    const RATE_LIMIT = 1000; // 1 second

    // Custom responses mapping
    const customResponses = {
        // Greetings
        "president": "The current president of the University of Saint Anthony is Dr. Emmanuel SD. Ortega, LLM.",

// Other specific queries
        "founded": "USANT was founded by Dr. Santiago G. Ortega Sr.",
        "founder": "USANT was founded by Dr. Santiago G. Ortega Sr.",
        // Help commands
        "help": "Here are some things I can help you with:\n- General questions and discussion\n- Code explanations\n- Math problems\n- Writing assistance\n- Data analysis\nJust ask away!",
        "commands": "Available commands:\n/help - Show this help message\n/clear - Clear chat history\n/export - Export chat\n/theme - Toggle dark mode",
        
        // Technical keywords
        "code": "I'd be happy to help you with coding! What programming language are you working with?",
        "debug": "Let's debug this together. Can you share the specific issue you're encountering?",
        "error": "I'll help you troubleshoot this error. Could you provide more details about when it occurs?",
        
        // Fun responses
        "joke": "Here's a programming joke: Why do programmers prefer dark mode? Because light attracts bugs! 😄",
        "secret": "🤫 Shhh... Here's a secret: I'm actually powered by coffee and algorithms!",
        
        // Administrative
        "admin_override": "Admin mode activated. How may I assist you?",
        "system_status": "All systems operational. Running latest version.",
        "weather": "I apologize, but I can't provide real-time weather information. Try checking a weather app or website for the most current forecast!",
        "football": "Are you a sports fan? I'd be happy to discuss football strategy, teams, or players!",
        "startup": "Interested in startups? Innovation and entrepreneurship are fascinating topics!",
        "music": "Music is a wonderful form of expression. What genre or artist are you passionate about?",
    
    // More specific or playful responses
        "machine learning": "Machine learning is an exciting field! Would you like to discuss neural networks, deep learning, or AI algorithms?",
        "python": "Python is a versatile and powerful programming language. What Python project are you working on?",
        "coffee": "☕ Ah, coffee - the fuel of programmers and creative minds everywhere!",
        "about": "USANT (University of Saint Anthony) is a private, non-sectarian university founded in 1947 by Dr. Santiago G. Ortega. Located in Iriga City, Camarines Sur, Philippines, it offers various undergraduate and graduate programs.",
        "mission": "USANT's mission is to contribute to individual and societal development through outstanding academic programs, research, and community service.",
        "vision": "USANT aims to be a distinguished leader in providing quality, yet affordable education.",
        "motto": "Pietas, Integritas, Sapientia - Piety, Integrity, Wisdom",
        "colors": "The university colors are Maroon, Gold, and White. We are known as the Mighty Maroons!",
        "programs": "USANT offers diverse programs including Nursing, Marine Transportation, Business Administration, Engineering, Education, Psychology, and more. We have undergraduate, graduate, and doctoral programs.",
        "contact": "Need to reach a specific department? Our trunkline number is (054) 205-1234. You can find local numbers for various offices in our directory.",
        "campus": "Our main campus is in Iriga City, Camarines Sur, Philippines. We also have two campuses in Indonesia.",
        "student assistantship": "USANT Student Assistantship Program Details:\n\n" +
        "Eligibility Criteria:\n" +
        "- Age: 18-30 years old\n" +
        "- Student Level: Incoming 2nd, 3rd, 4th, or 5th-year college students\n" +
        "- Academic Requirements:\n" +
        "  * Completed at least one semester at USANT\n" +
        "  * Currently enrolled in tertiary education\n" +
        "  * No failing grades in previous semester\n" +
        "  * Enrolled in curriculum-prescribed units\n" +
        "- Character: No disciplinary actions, good moral standing\n" +
        "- Scholarship Preference: Not a recipient of TES, CHED, or other government scholarships\n\n" +
        "Application Requirements:\n" +
        "- Application letter to Office of Student Affairs (OSA)\n" +
        "- Updated resume or Student Assistant Information Sheet\n" +
        "- Parent Consent and Undertaking Form\n" +
        "- Student Assistantship Contract\n" +
        "- Current registration form with class schedule\n" +
        "- Previous semester's grade copy\n\n" +
        "Submit applications to: Mrs. Daisy S. Judavar, Dean of Student Affairs\n" +
        "Note: Incomplete applications will not be accepted.",

    "degree programs": "USANT Degree Programs:\n\n" +
        "Undergraduate Programs:\n" +
        "- Nursing/Midwifery\n" +
        "- Marine Transportation\n" +
        "- Marine Engineering\n" +
        "- Business Administration\n" +
        "- Office Administration\n" +
        "- Hospitality Management\n" +
        "- Tourism Management\n" +
        "- Computer Science\n" +
        "- Accountancy\n" +
        "- Civil Engineering\n" +
        "- Architecture\n" +
        "- Technology\n" +
        "- Secondary Education\n" +
        "- Elementary Education\n" +
        "- Criminology\n" +
        "- Psychology\n" +
        "- Communication Arts\n" +
        "- Political Science\n" +
        "- English Language\n" +
        "- Library Information Science\n\n" +
        "Graduate Programs:\n" +
        "- PhD in Education\n" +
        "- MA in Education\n" +
        "- MA in Nursing\n" +
        "- MBA\n" +
        "- Masters in Police Administration",
        "enrollment": "You can enroll on-site at SGO Student Lounge, ACG Room 101, and Gregoria Sanches Hall Room 207. Online enrollment is available at enroll.usant.edu.ph for first-year and transfer students.",
    
    // Enhanced existing responses
        "Forum": "The USANT Forum is located in front of the Senior High School Building. If entering from Gate 1, go straight through the covered walkway to reach it. From Gate 3, follow the path and you'll soon see the forum.",
        "Hub": "The Hub is a newly built USANT building located near Gate 3's entrance. If coming from Gate 1, walk through the covered walkway past the forum and the oval to reach it.",

    // Department-specific responses
        "departments": "USANT has multiple colleges including Accountancy, Architecture, Engineering & Technology, Criminal Justice, Health Care Education, Information and Business Management, Liberal Arts, Maritime Education, and Teacher Education.",
        "library": "We have multiple libraries: College Library, Graduate School Library, Junior High School Library, Senior High School Library, and Montessori Grade School Library.",
        "sports": "Check with our Sports Development office for athletic programs and activities.",
        "guidance": "Our Guidance Center is available to support students' personal and academic development.",
        "contact": "USANT Trunkline Number: (054) 205-1234\n\nFull Telephone Directory:\n" +
        "- President's Office: 101\n" +
        "- Vice President for Admin & Finance: 103\n" +
        "- Vice President for Academic Affairs: 104\n" +
        "- University Auditor's Office: 106\n" +
        "- Accountant's Office: 108\n" +
        "- Credit and Collection (CCO): 110\n" +
        "- Registrar's Office: 113\n" +
        "- University Research Center: 115\n" +
        "- Human Resource Management & Development Office: 117\n" +
        "- Office of Student & Alumni Affairs: 120\n" +
        "- Management Information System Department (MIS): 123\n" +
        "- Community Extension Services Office: 124\n" +
        "- Guidance Center: 126\n" +
        "- Junior High School Principal: 128\n" +
        "- Quality Assurance Office: 130\n" +
        "- College of Criminal Justice: 132\n" +
        "- Montessori Grade School Principal: 134\n" +
        "- Clinic: 136\n" +
        "- Graduate School: 137\n" +
        "- Mini-Hotel Lobby: 139\n" +
        "- College of Architecture, Engineering & Technology: 140\n" +
        "- Senior High School Principal: 142\n" +
        "- Facilities and Property Management Office: 144\n" +
        "- Sports Development: 145\n" +
        "- University Events Office: 146\n" +
        "- Supplies & Inventory Office: 147\n" +
        "- College Library: 148\n" +
        "- College of Information and Business Management: 149\n" +
        "- College of Accountacy: 151\n" +
        "- College of Health Care Education: 153\n" +
        "- College of Teacher Education: 155\n" +
        "- Landship: 157\n" +
        "- College of Liberal Arts: 159\n" +
        "- College of Maritime Education: 161\n" +
        "- Gate 1: 163\n" +
        "- Public Safety Office: 164\n" +
        "- Junior High School Library: 166\n" +
        "- Senior High School Library: 167\n" +
        "- Graduate School Library: 168\n" +
        "- Parents Waiting Area (PWA): 170\n" +
        "- Junior High School Cafeteria: 171\n" +
        "- SGO Cafeteria: 172\n" +  
        "- Senior High School Cafeteria: 173\n" +
        "- GSH Cafeteria: 174\n" +
        "- Cooperative: 178\n" +
        "- University Budget Office: 180\n" +
        "- Gate 3: 183",
        // University History and Expansion
    "history": "The University of Saint Anthony (USANT) was founded on August 18, 1947, by Dr. Santiago G. Ortega Sr. It started as St. Anthony's Academy, a night high school for working students, and later became Saint Anthony College in 1959. On December 18, 1973, it became the first University in Iriga City and the first University established under Martial Law, to serve the educational needs of Iriga City and the Bicol Region. USANT offers education from nursery to post-graduate studies.",
    "mace": "The University Mace is the symbol of authority in all ceremonial occasions. The shaft is made of hardwood from the lush timberlands of Bikol. It features three ascending rings to represent the institution’s growth from an academy to a college, and finally to a university. The seal on the mace shows Mt. Iriga, representing the Rinconada District, and two scenic lakes: Lake Buhi and Lake Bato. The flame of knowledge on the mace illuminates the university’s philosophy: Pietas, Integritas, Sapientia.",

    // University Basics
    "goals": "The goals of USANT are to achieve accreditation for all programs, enhance students' academic and professional skills, build strategic partnerships with stakeholders, provide sustainable solutions to community problems, and improve research capabilities.",
    "hymn": `All the USANT voices sing
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
    Let us join and make a start.`,
    "university motto": "The USANT motto is 'Pietas, Integritas, Sapientia', which means Piety, Integrity, and Wisdom. These values guide the educational and moral principles upheld by the university.",
    "university vision": "USANT envisions itself as a distinguished leader in providing quality, yet affordable education, producing competent graduates equipped for success in their respective careers.",
    "university mission": "USANT's mission is to contribute to individual and societal development through outstanding academic programs, research, and community service, while minimizing financial burdens on students and parents.",
    "university core values": "The core values of USANT are Piety, Integrity, and Wisdom. These values serve as the foundation for the institution's educational and ethical teachings.",
    
    // Senior High School Department
    "senior high": "The Senior High School (SHS) program at USANT began in 2016 to improve the academic foundation of Grade 10 completers. Initially overseen by the High School Department, the SHS department became independent in the 2017-2018 academic year. Mrs. Nenita T. Andalis serves as principal of the department.",
    "gloria": "Gloria Daisy Fajardo Hall, named after a former high school principal, was completed in 2018. It houses classrooms, science labs, a library, an audio-visual room, a canteen, a faculty room, and administrative offices for the Senior High School Department.",
    
    // Senior High School Tracks and Strands
    "academic track": "The Academic Track offers four strands: Accountancy, Business, and Management (ABM), Science, Technology, Engineering and Mathematics (STEM), Humanities and Social Sciences (HUMSS), and General Academic Strand (GAS).",
    "abm strand": "The ABM Strand is for students pursuing business-related fields. It covers financial management, business operations, and entrepreneurship, preparing students for careers in management, accounting, or business.",
    "stem strand": "The STEM Strand is designed for students interested in science, technology, engineering, and mathematics. It covers advanced topics in these fields, preparing students for further studies or careers in technology or healthcare.",
    "humss strand": "The HUMSS Strand prepares students for professions in law, journalism, or social sciences. It focuses on critical thinking, communication, and understanding societal issues.",
    "gas strand": "The GAS Strand is a flexible strand allowing students to explore various academic fields. It’s ideal for students who want a broader range of knowledge before deciding on a specific career path or higher education program.",

    // Scholarship Programs
    "dona felisa": "The Doña Felisa D. Ortega Academic Excellence Award is given to the top 10 Grade 10 completers at USANT, with discounts on tuition based on ranking. Top 1 receives 100% free tuition, Top 2 receives 75%, Top 3 receives 50%, and ranks 4-10 receive 25%.",
    "arnulfo": "The Arnulfo B. Fajardo Scholarship is available to incoming Grade 11 students with a Grade 10 average of 90 or above. The scholarship covers full tuition and other fees but requires maintaining an average of 92.00 and no grade below 87.",
    "special": "Members of USANT’s Performing Arts Group (e.g., Majorettes, Band members, Dance Troupe, and Chorale) receive tuition fee discounts based on their participation in the university’s artistic activities.",
    "group enrollment": "USANT offers a group enrollment discount for legitimate siblings. In a group of four students, the sibling with the lowest tuition assessment receives 100% free tuition. For five students, the second-lowest tuition assessment receives a 10% discount. If any sibling drops out or transfers, the group must reimburse the school for the discount.",

    // Anti-Bullying Policy
    "anti bullying": "USANT adheres to RA No. 10627, the Anti-Bullying Act of 2023, to create a safe learning environment. The policy applies to all forms of bullying, including physical, verbal, and cyberbullying. The university promotes respect, discipline, and holistic development for all students.",
    "bullying prevention": "The SHS department offers seminars, discussions, and activities to raise awareness about bullying. Students, teachers, and parents are encouraged to participate in these prevention initiatives.",
    "disciplinary actions for bullying": "Disciplinary actions for bullying range from verbal warnings and community service to suspension or expulsion, depending on the severity of the offense. The university follows due process in all cases.",

    // Work Immersion Program
    "work immersion program": "USANT requires all Senior High School students to complete 80 hours of professional experience. This includes 10 hours of orientation, 60 hours of hands-on immersion, and 10 hours of documentation.",

    // General Policies
    "admission policy": "Admission to USANT is a contractual relationship between the student and the university. Students must adhere to the institution’s rules and regulations upon admission. Requirements for Grade 11 admission include a Certificate of Grade 10 Completion, Report Card, and Birth Certificate.",
    "attendance policy": "Students are expected to attend classes regularly. Absences must be supported by an excuse letter or medical certificate. Students who miss 20 or more class hours may be dropped from the roster.",
    "no smoking policy": "USANT maintains a smoke-free campus. Smoking is prohibited, and violators are subject to disciplinary action.",

    // Parent-Teacher Association (PTA)
    "pta role": "The Parent-Teacher Association (PTA) helps build stronger communication between parents and the school, provides a platform for discussions on student progress, and helps organize school activities.",
    "pta meetings": "PTA meetings are held quarterly to keep parents informed about their child’s academic performance and upcoming events. Parents are encouraged to participate and collaborate with the school to improve the learning environment.",

    // Graduation Requirements and Policies
    "graduation requirements": "To graduate, students must complete the required coursework, maintain the required academic performance, and meet all financial and procedural requirements, including obtaining clearance from various departments.",
    "kahoy mo diploma mo program": "Graduating students are required to plant a tree as part of USANT’s environmental initiative, creating a lasting legacy while promoting sustainability.",

    // School Admission and Enrollment
    "online enrollment procedure": "The online enrollment procedure can be accessed at enroll.usant.edu.ph. Students can fill out their personal information, select their subjects, and make payments either online or on-site.",
    "admission requirements": "Grade 11 applicants must submit a Certificate of Grade 10 Completion, Report Card, and Birth Certificate. Grade 12 students must submit both their 1st and 2nd-semester grades.",

    // Department-Specific Information
    "contact details": "USANT provides a comprehensive directory of contact numbers for various departments. Key contacts include the President's Office (101), Registrar's Office (113), and the College of Engineering (140).",
    "library facilities": "USANT has multiple libraries for student use, including the College Library, Graduate School Library, Junior and Senior High School Libraries, and the Montessori Grade School Library. These libraries are equipped with academic resources for research and study.",

    // University Events and Activities
    "university events office": "The University Events Office organizes academic seminars, cultural events, and outreach activities. Students are encouraged to participate to enhance their academic experience and contribute to the university community."
    };

    function addMessage(sender, message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        if (isError) messageDiv.classList.add('error-message');
        messageDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'AI'}:</strong> ${marked.parse(message)}`;
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
    const lowerMessage = message.toLowerCase().trim(); 
    
    // Context-aware response handling
    const contextResponses = {
    "Hub": {
        // Responses based on question words
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

    // Check context-specific responses first
    for (const [context, questionTypes] of Object.entries(contextResponses)) { 
        for (const [questionType, responseObj] of Object.entries(questionTypes)) { 
            if (responseObj.test(lowerMessage)) { 
                return responseObj.response; 
            } 
        } 
    } 

    // First, check for exact matches
    for (const [keyword, response] of Object.entries(customResponses)) { 
        if (lowerMessage === keyword.toLowerCase()) { 
            return response; 
        } 
    } 

    // Then check for partial matches
    for (const [keyword, response] of Object.entries(customResponses)) { 
        if (lowerMessage.includes(keyword.toLowerCase())) { 
            return response; 
        } 
    } 

    return null; 
}
    // Enhanced AI response function
// Initialize IndexedDB configuration
const customResponsesDB = {
    name: 'usant-responses',
    version: 1,
    store: 'responses'
};

// Add these functions right after the existing custom responses mapping
// Initialize IndexedDB
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

// Store responses in IndexedDB
async function storeResponses() {
    const db = await initDB();
    const transaction = db.transaction(customResponsesDB.store, 'readwrite');
    const store = transaction.objectStore(customResponsesDB.store);
    
    Object.entries(customResponses).forEach(([keyword, response]) => {
        store.put({ keyword, response });
    });
}

// Replace the existing getAIResponse function with this updated version
async function getAIResponse(prompt, retries = 3) {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    try {
        // First check IndexedDB for cached responses
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

        // If online, try API
        if (navigator.onLine) {
            const model = modelSelect.value;
            
            // Model check and validation
            if (!isModelAvailable(model)) {
                addMessage('system', 'Selected model is currently unavailable. Falling back to Mistral-7B.', true);
                modelSelect.value = 'mistralai/Mistral-7B-Instruct-v0.2';
            }

            const formattedPrompt = `<|system|>You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and engaging responses.

<|user|>${prompt}

<|assistant|>`;

            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer API_KEY',
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
            } else if (model.includes('llama')) {
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
        
        // If offline, use local response handler
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

// Add this at the end of the file, after all other event listeners
// Initialize offline support
window.addEventListener('load', () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.error('ServiceWorker registration failed:', err));
    }
    
    // Store responses in IndexedDB
    storeResponses().catch(console.error);
    
    // Add offline/online handlers
    window.addEventListener('online', () => {
        document.getElementById('chat-container').classList.remove('offline-mode');
        addMessage('system', 'You are now online. Full chat capabilities restored.');
    });
    
    window.addEventListener('offline', () => {
        document.getElementById('chat-container').classList.add('offline-mode');
        addMessage('system', 'You are offline. Using cached responses only.');
    });
});

// Helper function to check if a response is too generic
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

// Enhanced local response handler
function handleLocalResponse(prompt) {
    // Extract key topics from the prompt
    const keywords = extractKeywords(prompt);
    
    // Use GPT-style response generation locally
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

    // Select appropriate response template based on content
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

// Helper function to extract meaningful keywords
function extractKeywords(prompt) {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an', 'is', 'are']);
    return prompt
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .slice(0, 3);
}

// Helper function to generate context from keywords
function getContextFromKeywords(keywords) {
    if (keywords.length === 0) return 'this topic';
    if (keywords.length === 1) return `${keywords[0]}-related concepts`;
    return `how ${keywords[0]} relates to ${keywords[1]}`;
}

// Helper function to check model availability
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

    // Enhanced user input handler
    async function handleUserInput() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        const now = Date.now();
        if (now - lastRequestTime < RATE_LIMIT) {
            addMessage('system', 'Please wait a moment before sending another message.', true);
            return;
        }
        lastRequestTime = now;

        addMessage('user', userMessage);
        userInput.value = '';

        showLoadingIndicator();
        const aiResponse = await getAIResponse(userMessage);
        hideLoadingIndicator();
        addMessage('ai', aiResponse);

        conversationHistory += `\nHuman: ${userMessage}\nAI: ${aiResponse}`;
        conversationHistory = conversationHistory.split('\n').slice(-20).join('\n');
    }

    function exportChat() {
        const chatContent = chatHistory.innerText;
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat_export.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event listeners
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
    exportButton.addEventListener('click', exportChat);


        updateDebugInfo('Enhanced chat interface initialized');
        // Add new functions for submission handling
        function showSubmissionPage() {
            document.getElementById('chat-page').classList.add('hidden');
            document.getElementById('submission-page').classList.remove('hidden');
        }

        function showChatPage() {
            document.getElementById('submission-page').classList.add('hidden');
            document.getElementById('chat-page').classList.remove('hidden');
        }

        // File handling
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

            // Here you would typically send the data to your server
            // For demonstration, we'll just show an alert
            alert('Submission received! It will be reviewed by our team.');
            
            // Reset form
            submissionForm.reset();
            fileList.innerHTML = '';
            showChatPage();
        });
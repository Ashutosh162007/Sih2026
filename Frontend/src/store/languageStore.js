import { create } from "zustand";

export const TRANSLATIONS = {
  en: {
    // TopBar & Header
    searchPlaceholder: "Search issues, research projects, universities, CSR partners...",
    liveNotifications: "Live Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No new notifications.",
    viewProgressTracker: "View Progress Tracker →",
    signOut: "Sign out",
    language: "Language",
    
    // Roles
    citizen: "Citizen",
    university: "University / HEI",
    industry: "Industry Partner",
    admin: "Admin / State Oversight",

    // Navigation & Sidebar
    navReportIssue: "Report Challenge",
    navMyIssues: "My Challenges",
    navCampusQueue: "Campus Triage Queue",
    navProjects: "Research Projects",
    navCsrQueue: "CSR Proposals Queue",
    navFundedProjects: "Funded Projects",
    navAdminAnalytics: "Statewide Analytics",
    navVerifyAccounts: "Verify Accounts",

    // Report Issue Wizard
    reportTitle: "Report a Civic Challenge",
    reportSubtitle: "Tell us the problem briefly with a photo. Our AI Engine formulates the research problem statement & severity for nearest universities.",
    stepBasic: "Basic Info",
    stepDesc: "Short Description",
    stepPhoto: "Photo Evidence",
    stepLocation: "Location",
    stepReview: "AI Formulation & Review",
    issueTitleLabel: "Short Issue Title",
    issueTitlePlaceholder: "e.g. Broken storm drain flooding Albert Ekka Chowk",
    categoryLabel: "Initial Category",
    selectCategory: "Select Domain Category",
    descLabel: "Brief Problem Description",
    descPlaceholder: "e.g. During monsoon, the drain overflows onto the main commercial stretch for over 300 meters...",
    photoLabel: "Upload Photo / Evidence",
    photoSubtitle: "Visual evidence feeds the AI severity analysis to compute flooding risk, structural hazard, and urgency score.",
    districtLabel: "District (Jharkhand)",
    blockLabel: "Block / Municipality",
    blockPlaceholder: "e.g. Kanke / Tamar / Jamshedpur Urban",
    landmarkLabel: "Landmark / Street Address",
    landmarkPlaceholder: "e.g. Near Albert Ekka Chowk",
    pinLocationMap: "Pin Location on Map (For Nearest University Distance Calculation)",
    useGps: "Use current GPS location",
    aiSynthesizing: "Synthesizing AI problem statement...",
    aiFormulatedTitle: "AI-Formulated Problem Statement & Severity",
    regenerateAi: "Regenerate AI",
    publicRisk: "Public Risk",
    urgencyLevel: "Urgency Level",
    compositeScore: "Composite Score",
    backBtn: "Back",
    continueBtn: "Continue",
    submitBtn: "Submit to Nearest Universities",
    submittingBtn: "Publishing to Sahayog Network...",

    // Progress Tracker
    trackerTitle: "Live Ticket Progress Tracker",
    trackerSubtitle: "Real-time Amazon-style delivery tracker for citizen resolution",
    stageReported: "Reported & AI Assessed",
    stageAssigned: "University Team Formed",
    stageFunded: "Proposal & CSR Funded",
    stageExecution: "Field Execution & Milestones",
    stageResolved: "Resolved & Verified",
    stageCompleted: "Completed",
    stageInProgress: "In Progress",
    stageUpcoming: "Upcoming",
    liveActivityFeed: "Live Activity Stream & Milestone Audit Feed",
    overallResolution: "Overall Resolution",

    // Citizen Feedback & Verification
    feedbackTitle: "Citizen Resolution Verification & Rating",
    feedbackSubtitle: "Please verify on-ground satisfaction and rate the innovation team's solution.",
    rateSolution: "Rate the Quality & Speed of Resolution:",
    feedbackPlaceholder: "Tell the community and state innovation council about the impact (e.g. Water is clean and flowing now!)...",
    verifyGroundCheck: "I verify that this civic challenge has been physically resolved on the ground.",
    submitFeedbackBtn: "Submit Citizen Verification & Rating",
    verifiedByCitizenBadge: "Verified by Citizen Reporter",
    citizenRatingLabel: "Citizen Satisfaction Score",
    thankYouFeedback: "Thank you for verifying and rating this civic innovation project!",

    // Vernacular Voice Dictation
    voiceInput: "Voice Input",
    speakNow: "Speak Now (Voice-to-Text)",
    listening: "Listening... Speak in Hindi or English",
    stopListening: "Stop Recording",
    voiceLangHi: "Hindi (हिंदी)",
    voiceLangEn: "English",
    voiceHelper: "Click the mic button to dictate your issue in Hindi or English. Text will be transcribed automatically.",
    voiceNotSupported: "Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
  },

  hi: {
    // TopBar & Header
    searchPlaceholder: "नागरिक समस्याएं, अनुसंधान परियोजनाएं, विश्वविद्यालय, सीएसआर भागीदार खोजें...",
    liveNotifications: "ताज़ा सूचनाएं",
    markAllRead: "सभी पढ़ी गई चिह्नित करें",
    noNotifications: "कोई नई सूचना नहीं।",
    viewProgressTracker: "प्रगति ट्रैकर देखें →",
    signOut: "लॉग आउट करें",
    language: "भाषा",

    // Roles
    citizen: "नागरिक",
    university: "विश्वविद्यालय / संस्थान",
    industry: "उद्योग / CSR भागीदार",
    admin: "राज्य प्रशासन / इनोवेशन काउंसिल",

    // Navigation & Sidebar
    navReportIssue: "समस्या दर्ज करें",
    navMyIssues: "मेरी समस्याएं",
    navCampusQueue: "विश्वविद्यालय कतार",
    navProjects: "शोध परियोजनाएं",
    navCsrQueue: "CSR अनुदान प्रस्ताव",
    navFundedProjects: "स्वीकृत परियोजनाएं",
    navAdminAnalytics: "राज्य स्तरीय विश्लेषण",
    navVerifyAccounts: "खाता सत्यापन",

    // Report Issue Wizard
    reportTitle: "नागरिक समस्या दर्ज करें",
    reportSubtitle: "फोटो और संक्षिप्त विवरण दें। हमारा AI इंजन समस्या का शोध विवरण तैयार कर नजदीकी विश्वविद्यालय को भेजेगा।",
    stepBasic: "मूल जानकारी",
    stepDesc: "समस्या विवरण",
    stepPhoto: "फोटो प्रमाण",
    stepLocation: "स्थान",
    stepReview: "AI विश्लेषण और समीक्षा",
    issueTitleLabel: "समस्या का शीर्षक",
    issueTitlePlaceholder: "उदा. अल्बर्ट एक्का चौक पर जलभराव और नाली जाम",
    categoryLabel: "समस्या की श्रेणी",
    selectCategory: "श्रेणी चुनें",
    descLabel: "समस्या का संक्षिप्त विवरण",
    descPlaceholder: "उदा. बारिश में नाला सड़क पर बहने लगता है, जिससे 300 मीटर तक आवागमन बंद हो जाता है...",
    photoLabel: "फोटो / प्रमाण अपलोड करें",
    photoSubtitle: "फोटो से AI बाढ़ जोखिम, सुरक्षा खतरा और तात्कालिकता स्कोर की गणना करता है।",
    districtLabel: "जिला (झारखंड)",
    blockLabel: "प्रखंड / नगर निकाय",
    blockPlaceholder: "उदा. कांके / तमाड़ / जमशेदपुर",
    landmarkLabel: "लैंडमार्क / सड़क का नाम",
    landmarkPlaceholder: "उदा. अल्बर्ट एक्का चौक के पास",
    pinLocationMap: "नक्शे पर सटीक स्थान चुनें (विश्वविद्यालय दूरी गणना हेतु)",
    useGps: "वर्तमान GPS स्थान का उपयोग करें",
    aiSynthesizing: "AI शोध विवरण तैयार किया जा रहा है...",
    aiFormulatedTitle: "AI-द्वारा तैयार औपचारिक शोध समस्या और गंभीरता",
    regenerateAi: "पुनः AI बनाएं",
    publicRisk: "सार्वजनिक जोखिम",
    urgencyLevel: "तात्कालिकता",
    compositeScore: "कुल गंभीरता स्कोर",
    backBtn: "पीछे",
    continueBtn: "आगे बढ़ें",
    submitBtn: "नजदीकी विश्वविद्यालयों को भेजें",
    submittingBtn: "सहयोग नेटवर्क पर प्रकाशित हो रहा है...",

    // Progress Tracker
    trackerTitle: "लाइव समस्या प्रगति ट्रैकर",
    trackerSubtitle: "नागरिक समाधान के लिए रीयल-टाइम अमेज़न-स्टाइल डिलीवरी ट्रैकर",
    stageReported: "दर्ज व AI मूल्यांकित",
    stageAssigned: "विश्वविद्यालय टीम गठित",
    stageFunded: "प्रस्ताव व CSR अनुदान स्वीकृत",
    stageExecution: "मैदानी क्रियान्वयन व माइलस्टोन",
    stageResolved: "समाधान संपन्न व सत्यापित",
    stageCompleted: "पूर्ण",
    stageInProgress: "प्रगति पर",
    stageUpcoming: "आगामी",
    liveActivityFeed: "लाइव गतिविधि व माइलस्टोन ऑडिट फ़ीड",
    overallResolution: "कुल समाधान प्रगति",

    // Citizen Feedback & Verification
    feedbackTitle: "नागरिक समाधान सत्यापन और रेटिंग",
    feedbackSubtitle: "कृपया जमीनी समाधान की पुष्टि करें और विश्वविद्यालय टीम के कार्य को रेट करें।",
    rateSolution: "समाधान की गुणवत्ता और गति को स्टार दें:",
    feedbackPlaceholder: "समुदाय और राज्य परिषद को जमीनी प्रभाव बताएं (उदा. पानी अब पूरी तरह साफ और उपलब्ध है!)...",
    verifyGroundCheck: "मैं पुष्टि करता हूँ कि यह नागरिक समस्या जमीन पर सफलतापूर्वक हल हो चुकी है।",
    submitFeedbackBtn: "नागरिक सत्यापन और रेटिंग जमा करें",
    verifiedByCitizenBadge: "नागरिक द्वारा सत्यापित",
    citizenRatingLabel: "नागरिक संतुष्टि स्कोर",
    thankYouFeedback: "सत्यापन और रेटिंग देने के लिए धन्यवाद!",

    // Vernacular Voice Dictation
    voiceInput: "आवाज से लिखें (Voice Input)",
    speakNow: "बोलकर दर्ज करें (Voice-to-Text)",
    listening: "सुन रहे हैं... हिंदी या अंग्रेजी में बोलें",
    stopListening: "रिकॉर्डिंग रोकें",
    voiceLangHi: "हिंदी",
    voiceLangEn: "English",
    voiceHelper: "माइक बटन दबाकर अपनी समस्या बोलें। आपकी आवाज तुरंत टेक्स्ट में बदल जाएगी।",
    voiceNotSupported: "इस ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।",
  },
};

export const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem("sahayog_lang") || "en",
  setLanguage: (lang) => {
    localStorage.setItem("sahayog_lang", lang);
    set({ language: lang });
  },
  t: (key) => {
    const lang = get().language;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  },
}));

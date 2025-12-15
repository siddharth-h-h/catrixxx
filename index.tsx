import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Brain, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Play, 
  Award,
  BarChart3,
  History,
  AlertCircle,
  Sparkles,
  X,
  LogOut,
  User as UserIcon,
  Mail,
  Shield,
  Loader2,
  Grid,
  AlertTriangle
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Section = "dashboard" | "mocks" | "pyq" | "practice" | "progress";

interface User {
  name: string;
  email: string;
  password?: string;
  joinedDate: string;
}

interface Question {
  id: string;
  text: string;
  passage?: string; // Support for RC/DILR sets
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category: "Quant" | "VARC" | "DILR";
  isPremium?: boolean;
  year?: string;
  slot?: string;
}

interface Test {
  id: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
  completed?: boolean;
  score?: number;
  type?: "MOCK" | "PYQ" | "PRACTICE";
}

interface UserStats {
  testsTaken: number;
  questionsAttempted: number;
  correctAnswers: number;
  history: { date: string; testId: string; score: number; total: number }[];
}

// --- AI Helper ---
const generateAIQuestion = async (topic: string): Promise<Question | null> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a single multiple-choice question for CAT exam preparation about ${topic}. 
      Return JSON format with fields: text, options (array of 4 strings), correctAnswer (index 0-3), explanation. 
      Do not wrap in markdown code blocks.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const data = JSON.parse(response.text);
    return {
      id: `ai-${Date.now()}`,
      text: data.text,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      category: "Quant", 
      isPremium: false
    };
  } catch (e) {
    console.error("AI Generation failed", e);
    return null;
  }
};

// --- Components ---

const AuthPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (isRegister && !name)) {
      setError("Please fill all fields");
      return;
    }

    const usersStr = localStorage.getItem("catrix_users");
    const users: Record<string, User> = usersStr ? JSON.parse(usersStr) : {};

    if (isRegister) {
      if (users[email]) {
        setError("User already exists with this email");
        return;
      }
      const newUser: User = { name, email, password, joinedDate: new Date().toISOString() };
      users[email] = newUser;
      localStorage.setItem("catrix_users", JSON.stringify(users));
      onLogin(newUser);
    } else {
      const user = users[email];
      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError("Invalid credentials");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Brain className="w-8 h-8" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Catrix</h1>
          <p className="text-slate-500 mt-2">Your gateway to IIMs</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all mt-4"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-indigo-600 text-sm font-medium hover:underline"
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ current, onChange, user, onLogout }: { current: Section; onChange: (s: Section) => void; user: User; onLogout: () => void }) => {
  const items: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "mocks", label: "Mock Tests", icon: Clock },
    { id: "practice", label: "Practice", icon: BookOpen },
    { id: "pyq", label: "Prev. Year Qs", icon: History },
    { id: "progress", label: "Tracker", icon: TrendingUp },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20 hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
          <Brain className="w-8 h-8 text-indigo-500" />
          Catrix
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              current === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 px-4 py-2 rounded-lg transition text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};

const MobileNav = ({ current, onChange }: { current: Section; onChange: (s: Section) => void }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-lg">
    {[
      { id: "dashboard", icon: LayoutDashboard },
      { id: "mocks", icon: Clock },
      { id: "practice", icon: BookOpen },
      { id: "progress", icon: TrendingUp },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id as Section)}
        className={`p-2 rounded-full ${
          current === item.id ? "bg-indigo-100 text-indigo-700" : "text-slate-400"
        }`}
      >
        <item.icon className="w-6 h-6" />
      </button>
    ))}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const TestRunner = ({ test, onFinish, onCancel }: { test: Test; onFinish: (score: number, total: number) => void; onCancel: () => void }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(test.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [showPalette, setShowPalette] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Use ref for answers to access current state in timer closure safely
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);
    
    try {
        // Calculate Score using fresh answers from Ref
        let score = 0;
        const finalAnswers = answersRef.current;
        test.questions.forEach((q, idx) => {
          if (finalAnswers[idx] === q.correctAnswer) score++;
        });

        // Simulate Network Request / UX Delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Ensure onFinish is called
        if (typeof onFinish === 'function') {
            onFinish(score, test.questions.length);
        } else {
            console.error("onFinish prop missing");
            setIsSubmitting(false);
        }
    } catch (error) {
        console.error("Submission failed", error);
        alert("Submission failed. Please try again.");
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
        // Time over - auto submit
        handleSubmit();
        return;
    }
    const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const currentQuestion = test.questions[currentQ];

  if (!currentQuestion) return <div>Error loading question</div>;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col md:flex-row">
      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center border border-indigo-100">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Submitting Test...</h2>
                <p className="text-slate-500 mt-2">Calculating your score. Please wait.</p>
            </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {showConfirmModal && (
         <div className="absolute inset-0 bg-black/50 z-[90] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Finish Test?</h3>
                </div>
                <p className="text-slate-600 mb-6">
                    You have answered <span className="font-bold text-slate-900">{answers.filter(a => a !== -1).length}</span> out of <span className="font-bold text-slate-900">{test.questions.length}</span> questions. 
                    Are you sure you want to submit?
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => handleSubmit()}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition"
                    >
                        Submit Now
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Sidebar / Palette (Desktop) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform z-50 md:relative md:transform-none md:w-80 md:shadow-none border-l border-slate-200 flex flex-col ${showPalette ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
         <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center md:hidden">
            <span className="font-bold text-slate-700">Question Palette</span>
            <button onClick={() => setShowPalette(false)}><X className="w-5 h-5 text-slate-500"/></button>
         </div>
         <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-4 hidden md:block">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
                {test.questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentQ(idx); setShowPalette(false); }}
                      className={`h-10 w-10 rounded-lg font-bold text-sm flex items-center justify-center transition ${
                          currentQ === idx ? "bg-indigo-600 text-white ring-2 ring-indigo-300" :
                          answers[idx] !== -1 ? "bg-green-100 text-green-700 border border-green-300" :
                          "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
            <div className="mt-8 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div> Answered
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-600 rounded"></div> Current
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 rounded"></div> Not Visited
                </div>
            </div>
         </div>
         <div className="p-4 border-t border-slate-200">
            <button 
             disabled={isSubmitting}
             onClick={() => setShowConfirmModal(true)}
             className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-green-100 transition flex items-center justify-center gap-2"
           >
             Submit Test
           </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{test.title}</h2>
            </div>
            <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${timeLeft < 300 ? "bg-red-900 border-red-700 text-red-200" : "bg-slate-800 border-slate-700"}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => setShowPalette(true)} className="md:hidden text-indigo-300"><Grid className="w-6 h-6"/></button>
            <button onClick={onCancel} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto w-full h-full flex flex-col md:flex-row gap-6">
                
                {/* Passage/Context Column - Only if passage exists */}
                {currentQuestion.passage && (
                  <div className="md:w-1/2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
                        Passage / Data Set
                      </div>
                      <div className="prose prose-slate text-slate-700 leading-relaxed">
                        {currentQuestion.passage.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                      </div>
                  </div>
                )}

                {/* Question Column */}
                <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col ${currentQuestion.passage ? "md:w-1/2" : "w-full max-w-3xl mx-auto"}`}>
                    <div className="mb-6 flex justify-between items-start">
                        <span className="text-indigo-600 font-bold tracking-wide text-sm">QUESTION {currentQ + 1} OF {test.questions.length}</span>
                        <div className="flex gap-2">
                            <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-1 rounded uppercase">{currentQuestion.category}</span>
                            <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded">Single Choice</span>
                        </div>
                    </div>
                    
                    <p className="text-xl text-slate-800 font-medium leading-relaxed mb-8">{currentQuestion.text}</p>
                    
                    <div className="space-y-3 mt-auto">
                        {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            answers[currentQ] === idx
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                                : "border-slate-100 hover:border-indigo-200 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            answers[currentQ] === idx ? "border-indigo-600" : "border-slate-300"
                            }`}>
                            {answers[currentQ] === idx && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                            </div>
                            <span className="text-lg">{opt}</span>
                        </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white border-t border-slate-200 p-4 shrink-0">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button 
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(prev => prev - 1)}
                className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 font-medium border border-slate-200"
            >
                Previous
            </button>
            
            <button 
                onClick={() => {
                    if (currentQ < test.questions.length - 1) {
                        setCurrentQ(prev => prev + 1);
                    } else {
                         setShowConfirmModal(true);
                    }
                }}
                disabled={isSubmitting}
                className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2"
            >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin"/>}
                {currentQ === test.questions.length - 1 ? "Save & Submit" : "Save & Next"}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<Section>("dashboard");
  const [userStats, setUserStats] = useState<UserStats>({ testsTaken: 0, questionsAttempted: 0, correctAnswers: 0, history: [] });
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<Question | null>(null);
  
  // New State for API Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mockTests, setMockTests] = useState<Test[]>([]);
  const [pyqPapers, setPyqPapers] = useState<{ id: string; year: string; slot: string; count: number }[]>([]);

  // Initialize: Check if a user is already logged in
  useEffect(() => {
    const loggedInEmail = localStorage.getItem("catrix_current_user_email");
    if (loggedInEmail) {
      const usersStr = localStorage.getItem("catrix_users");
      const users = usersStr ? JSON.parse(usersStr) : {};
      if (users[loggedInEmail]) {
        setUser(users[loggedInEmail]);
        loadStats(loggedInEmail);
      }
    }
    // Fetch Questions
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/questions.json');
      const data: Question[] = await response.json();
      setQuestions(data);
      processQuestions(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch questions", error);
      setIsLoading(false);
    }
  };

  const processQuestions = (allQuestions: Question[]) => {
    // 1. Generate PYQ List
    const pyqMap = new Map<string, { year: string, slot: string, count: number }>();
    allQuestions.forEach(q => {
      // Ensure we have valid year and slot, default if missing
      const year = q.year || "Unknown";
      const slot = q.slot || "Slot 1";
      
      const key = `${year}-${slot}`;
      if (!pyqMap.has(key)) {
        pyqMap.set(key, { year: year, slot: slot, count: 0 });
      }
      pyqMap.get(key)!.count++;
    });
    
    // Convert map to array and sort by year desc
    const papers = Array.from(pyqMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.year.localeCompare(a.year) || a.slot.localeCompare(b.slot));
        
    setPyqPapers(papers);

    // 2. Generate Mocks
    // Full Mock - Attempt to create a balanced paper
    // Shuffle helper
    const shuffle = (array: Question[]) => array.sort(() => Math.random() - 0.5);
    
    const quantQs = allQuestions.filter(q => q.category === "Quant");
    const varcQs = allQuestions.filter(q => q.category === "VARC");
    const dilrQs = allQuestions.filter(q => q.category === "DILR");

    // Combine for full mock (take all if limited, or subset if abundant)
    const fullMockQuestions = [
        ...shuffle([...varcQs]).slice(0, 24),
        ...shuffle([...dilrQs]).slice(0, 20),
        ...shuffle([...quantQs]).slice(0, 22)
    ];

    // If we don't have enough questions for a full mock, use what we have
    const finalQuestions = fullMockQuestions.length > 5 ? fullMockQuestions : allQuestions;

    const fullMock: Test = {
      id: "mock-full-1",
      title: "All India Open Mock (Full)",
      durationMinutes: 120,
      questions: finalQuestions,
      type: "MOCK"
    };

    const quantMock: Test = {
      id: "mock-quant-1",
      title: "Quant Sectional Test 01",
      durationMinutes: 40,
      questions: quantQs, 
      type: "MOCK"
    };

    const varcMock: Test = {
      id: "mock-varc-1",
      title: "VARC Sectional Test 01",
      durationMinutes: 40,
      questions: varcQs,
      type: "MOCK"
    };

    const dilrMock: Test = {
        id: "mock-dilr-1",
        title: "DILR Sectional Test 01",
        durationMinutes: 40,
        questions: dilrQs,
        type: "MOCK"
    };

    setMockTests([fullMock, quantMock, varcMock, dilrMock].filter(t => t.questions.length > 0));
  };

  const loadStats = (email: string) => {
    const saved = localStorage.getItem(`catrix_stats_${email}`);
    if (saved) {
      setUserStats(JSON.parse(saved));
    } else {
      setUserStats({ testsTaken: 0, questionsAttempted: 0, correctAnswers: 0, history: [] });
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("catrix_current_user_email", loggedInUser.email);
    loadStats(loggedInUser.email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("catrix_current_user_email");
    setUserStats({ testsTaken: 0, questionsAttempted: 0, correctAnswers: 0, history: [] });
  };

  const saveStats = (newStats: UserStats) => {
    setUserStats(newStats);
    if (user) {
      localStorage.setItem(`catrix_stats_${user.email}`, JSON.stringify(newStats));
    }
  };

  const handleTestComplete = (score: number, total: number) => {
    const newStats = {
      ...userStats,
      testsTaken: userStats.testsTaken + 1,
      questionsAttempted: userStats.questionsAttempted + total,
      correctAnswers: userStats.correctAnswers + score,
      history: [...userStats.history, { 
        date: new Date().toISOString(), 
        testId: activeTest?.id || "unknown", 
        score, 
        total 
      }]
    };
    saveStats(newStats);
    setActiveTest(null);
    setView("progress");
  };

  const startPyqTest = (year: string, slot: string) => {
    // Robust filtering including fallback
    const paperQuestions = questions.filter(q => (q.year || "Unknown") === year && (q.slot || "Slot 1") === slot);
    
    if (paperQuestions.length === 0) {
        alert("No questions found for this slot.");
        return;
    }

    const test: Test = {
      id: `pyq-${year}-${slot}`,
      title: `CAT ${year} ${slot} (Official)`,
      durationMinutes: 60, // Standard assumption
      questions: paperQuestions,
      type: "PYQ"
    };
    setActiveTest(test);
  };

  const handlePracticeQuestion = (q: Question) => {
    const test: Test = {
        id: `practice-${q.id}`,
        title: "Practice Question",
        durationMinutes: 5,
        questions: [q],
        type: "PRACTICE"
    };
    setActiveTest(test);
  };

  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    const q = await generateAIQuestion("quantitative aptitude suitable for CAT exam");
    setIsGenerating(false);
    if (q) setGeneratedQuestion(q);
  };

  // View Renders
  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Hello, {user?.name.split(" ")[0]}!</h2>
          <p className="text-slate-500 mt-1">Let's continue your journey to 99%ile.</p>
        </div>
        <button onClick={() => setView("mocks")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2 font-medium">
          <Play className="w-5 h-5 fill-current" />
          Resume Prep
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Tests Completed" 
          value={userStats.testsTaken} 
          icon={CheckCircle2} 
          color="text-emerald-600 bg-emerald-600" 
        />
        <StatCard 
          label="Questions Solved" 
          value={userStats.questionsAttempted} 
          icon={BookOpen} 
          color="text-blue-600 bg-blue-600" 
        />
        <StatCard 
          label="Avg. Accuracy" 
          value={userStats.questionsAttempted ? Math.round((userStats.correctAnswers / userStats.questionsAttempted) * 100) + "%" : "-"} 
          icon={Award} 
          color="text-amber-600 bg-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h3>
          {userStats.history.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No activity yet. Start a test!
            </div>
          ) : (
            <div className="space-y-4">
              {userStats.history.slice(-3).reverse().map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition">
                  <div>
                    <p className="font-medium text-slate-800">
                      {mockTests.find(t => t.id === h.testId)?.title || (h.testId.includes('pyq') ? "Past Year Paper" : h.testId.includes('practice') ? "Practice Question" : "Test Result")}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{h.score}/{h.total}</span>
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(h.score/h.total)*100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMocks = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-slate-800">Available Mock Tests</h2>
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin"/> Loading tests from API...</div>
      ) : (
        <div className="grid gap-4">
          {mockTests.map((test) => (
            <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{test.title}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {test.durationMinutes} Mins</span>
                    <span className="flex items-center gap-1"><Award className="w-4 h-4"/> {test.questions.length * 3} Marks</span>
                    <span className="flex items-center gap-1"><Brain className="w-4 h-4"/> {test.questions.length} Qs</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveTest(test)}
                className="px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap"
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPractice = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Practice Zone</h2>
        <div className="flex gap-2">
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase">Free</span>
            <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded uppercase">Premium</span>
        </div>
      </div>

      {/* AI Generator Feature */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Question Generator
        </h3>
        <p className="text-sm text-indigo-700 mb-4">Never run out of questions. Generate infinite practice problems instantly.</p>
        
        {!generatedQuestion ? (
           <button 
            onClick={handleGenerateQuestion}
            disabled={isGenerating}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? "Thinking..." : "Generate New Question"}
          </button>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 mt-4">
             <div className="flex justify-between mb-4">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">AI Generated</span>
                <button onClick={() => setGeneratedQuestion(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
             </div>
             <p className="text-lg font-medium text-slate-800 mb-4">{generatedQuestion.text}</p>
             <div className="space-y-2">
               {generatedQuestion.options.map((opt, i) => (
                 <div key={i} className={`p-3 rounded border ${i === generatedQuestion.correctAnswer ? "border-green-500 bg-green-50" : "border-slate-200"}`}>
                   {opt} {i === generatedQuestion.correctAnswer && <CheckCircle2 className="w-4 h-4 text-green-600 inline ml-2"/>}
                 </div>
               ))}
             </div>
             {generatedQuestion.explanation && (
               <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-600">
                 <strong>Explanation:</strong> {generatedQuestion.explanation}
               </div>
             )}
              <button 
                onClick={handleGenerateQuestion}
                disabled={isGenerating}
                className="mt-6 text-indigo-600 text-sm font-bold hover:underline"
              >
                Generate Another
              </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.slice(0, 10).map((q, idx) => (
          <div key={idx} className={`p-6 rounded-xl border ${q.isPremium ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white shadow-sm"} relative overflow-hidden group flex flex-col justify-between`}>
            {q.isPremium && (
              <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Premium
              </div>
            )}
            <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{q.category}</span>
                <p className={`font-medium ${q.isPremium ? "blur-sm select-none" : "text-slate-800"}`}>
                    {q.isPremium ? "This question is available for premium members only. Upgrade to access." : q.text}
                </p>
            </div>
            
            <button 
                onClick={() => !q.isPremium && handlePracticeQuestion(q)}
                disabled={!!q.isPremium}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${
                q.isPremium 
                ? "bg-amber-400 text-amber-900 hover:bg-amber-500 cursor-not-allowed" 
                : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}>
                {q.isPremium ? "Unlock Premium" : "Solve Now"}
            </button>
          </div>
        ))}
        {questions.length === 0 && !isLoading && <p className="text-slate-500">No practice questions available right now.</p>}
      </div>
    </div>
  );

  const renderPYQ = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-slate-800">Previous Year Papers</h2>
      {isLoading ? <p>Loading papers...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {pyqPapers.map((paper, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600">
                          {paper.year}
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-800">CAT {paper.year} - {paper.slot}</h4>
                          <p className="text-xs text-slate-500">Official Paper • {paper.count} Questions Available</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => startPyqTest(paper.year, paper.slot)}
                    className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition text-sm border border-indigo-200"
                  >
                      Attempt Now
                  </button>
              </div>
          ))}
          {pyqPapers.length === 0 && <p className="p-4 text-slate-500">No PYQ data found.</p>}
        </div>
      )}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Performance Tracker</h2>
        <div className="text-sm text-slate-500">
          User: <span className="font-semibold text-slate-800">{user?.name}</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-700">Detailed History</span>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">Date</th>
                        <th className="px-4 py-3">Test Name</th>
                        <th className="px-4 py-3 text-center">Score</th>
                        <th className="px-4 py-3 text-center">Accuracy</th>
                        <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {userStats.history.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-500">{new Date(h.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                                {mockTests.find(t => t.id === h.testId)?.title || (h.testId.includes('pyq') ? "Past Year Paper" : h.testId.includes('practice') ? "Practice Question" : "Custom Test")}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-indigo-600">{h.score}/{h.total}</td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    (h.score/h.total) > 0.8 ? "bg-green-100 text-green-700" :
                                    (h.score/h.total) > 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                }`}>
                                    {Math.round((h.score/h.total)*100)}%
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right text-green-600 text-xs font-bold uppercase">Completed</td>
                        </tr>
                    ))}
                    {userStats.history.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                No test history available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (activeTest) {
    // Force re-mount of TestRunner when activeTest changes to reset state (answers, currentQ)
    return <TestRunner key={activeTest.id} test={activeTest} onFinish={handleTestComplete} onCancel={() => setActiveTest(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar current={view} onChange={setView} user={user} onLogout={handleLogout} />
      <div className="flex-1 md:ml-64 pb-20 md:pb-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center md:hidden">
             <div className="font-bold text-indigo-900 flex items-center gap-2">
                <Brain className="w-6 h-6" /> Catrix
             </div>
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          {view === "dashboard" && renderDashboard()}
          {view === "mocks" && renderMocks()}
          {view === "practice" && renderPractice()}
          {view === "pyq" && renderPYQ()}
          {view === "progress" && renderProgress()}
        </main>
      </div>
      <MobileNav current={view} onChange={setView} />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
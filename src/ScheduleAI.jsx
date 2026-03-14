import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Clock, Users, Globe, CheckCircle2,
    AlertCircle, ChevronRight, Check, X, Loader2, CalendarPlus,
    Info, UserPlus, Target, Send, CalendarCheck, CalendarX, Zap, ListFilter, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ----------------------------------------------------------------------
// Mock Data
// ----------------------------------------------------------------------
const MEETING_TYPES = [
    { id: 'client', name: 'Client Meeting', hours: '9:00 - 17:00 (Client Time)', duration: '30-60 min', priority: 'High', rule: 'Prioritize client business hours, ignore internal blocks.', color: 'bg-blue-500' },
    { id: 'steering', name: 'Steering Committee / Decision Meeting', hours: '10:00 - 15:00', duration: '60-90 min', priority: 'Critical', rule: 'Requires 100% attendance from mandatory stakeholders.', color: 'bg-red-600' },
    { id: 'kickoff', name: 'Project Kick-off', hours: 'Morning preferred', duration: '60-120 min', priority: 'High', rule: 'Must find contiguous slots across all time zones.', color: 'bg-indigo-500' },
    { id: 'retro', name: 'Project Closing / Retrospective', hours: 'Late afternoon', duration: '60-90 min', priority: 'Medium', rule: 'Avoid Mondays.', color: 'bg-purple-500' },
    { id: 'update', name: 'Regular Project Update', hours: 'Any', duration: '15-30 min', priority: 'Low', rule: 'Flexible, low impact if rescheduled.', color: 'bg-emerald-500' },
    { id: 'internal', name: 'Internal Working Session', hours: 'Afternoon', duration: '45-90 min', priority: 'Medium', rule: 'Allow overlaps with focus time.', color: 'bg-teal-500' },
    { id: 'workshop', name: 'Workshop / Brainstorming', hours: 'Morning (09:00 - 12:00)', duration: '90-120 min', priority: 'Medium', rule: 'Requires high mental energy, prefer early week.', color: 'bg-orange-500' },
    { id: '1to1', name: 'One-to-One', hours: 'Any', duration: '15-30 min', priority: 'Low', rule: 'Fit into gaps.', color: 'bg-slate-400' },
    { id: 'sales', name: 'Sales / Business Development', hours: '10:00 - 16:00', duration: '45-60 min', priority: 'High', rule: 'Optimize for prospect convenience.', color: 'bg-sky-500' },
    { id: 'emergency', name: 'Emergency / Escalation', hours: 'ASAP', duration: '30 min', priority: 'Max', rule: 'Max priority — override comfort rules and non-critical meetings.', color: 'bg-red-700 animate-pulse' },
];

const MOCK_PARTICIPANTS = [
    { id: 1, name: 'Alex Johnson', email: 'alex.j@consulting.com', tz: 'GMT-5 (New York)', role: 'Organizer', defaultMandatory: true, avatar: 'AL' },
    { id: 2, name: 'Marie Dubois', email: 'm.dubois@client.fr', tz: 'GMT+1 (Paris)', role: 'Client', defaultMandatory: true, avatar: 'MD' },
    { id: 3, name: 'David Smith', email: 'd.smith@consulting.com', tz: 'GMT+0 (London)', role: 'Expert', defaultMandatory: false, avatar: 'DS' },
];

const MOCK_SLOTS = [
    { id: 1, date: 'Oct 12', day: 'Thursday', time: '14:30 - 15:30', tz: 'GMT+0', score: 95, tags: ['✅ Within client hours', '✅ All participants available', '✅ High importance meeting'] },
    { id: 2, date: 'Oct 13', day: 'Friday', time: '10:00 - 11:00', tz: 'GMT+0', score: 82, tags: ['✅ Within client hours', '⚠️ Close to weekend', '✅ All participants available'] },
    { id: 3, date: 'Oct 11', day: 'Wednesday', time: '16:00 - 17:00', tz: 'GMT+0', score: 68, tags: ['⚠️ End of day for Paris', '✅ All participants available'] },
];

// ----------------------------------------------------------------------
// Main Application Component
// ----------------------------------------------------------------------
export default function ScheduleAIDemo() {
    const [activeTab, setActiveTab] = useState('demo'); // 'landing', 'demo', 'types', 'no-slots'
    const [wizardStep, setWizardStep] = useState(1);

    // State for Step 1
    const [meetingTitle, setMeetingTitle] = useState('Quarterly Strategy Alignment');
    const [meetingType, setMeetingType] = useState('client');
    const [duration, setDuration] = useState('60');

    // State for Step 2
    const [accessStatus, setAccessStatus] = useState({}); // { id: 'loading' | 'granted' }

    // State for Step 3
    const [calendarLoadingStage, setCalendarLoadingStage] = useState(0);

    // State for Step 5
    const [proposalState, setProposalState] = useState('initial'); // 'initial' | 'declining' | 'conflicted' | 'resolving' | 'proposed_new'

    // Wizard Step Tracker
    const nextStep = () => setWizardStep(prev => Math.min(prev + 1, 6));
    const prevStep = () => setWizardStep(prev => Math.max(prev - 1, 1));
    const goToDemo = () => {
        setActiveTab('demo');
        setWizardStep(1);
    };

    // Mock async behavior for Step 2
    const requestAccess = (id) => {
        setAccessStatus(prev => ({ ...prev, [id]: 'loading' }));
        setTimeout(() => {
            setAccessStatus(prev => ({ ...prev, [id]: 'granted' }));
        }, 1500);
    };

    // Mock async behavior for Step 3
    useEffect(() => {
        if (wizardStep === 3 && activeTab === 'demo') {
            setCalendarLoadingStage(1);
            const timer1 = setTimeout(() => setCalendarLoadingStage(2), 1500);
            const timer2 = setTimeout(() => setCalendarLoadingStage(3), 3000);
            const timer3 = setTimeout(() => setCalendarLoadingStage(4), 4500);
            return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
        }
    }, [wizardStep, activeTab]);

    // Mock async behavior for Step 5
    useEffect(() => {
        if (wizardStep === 5 && activeTab === 'demo' && proposalState === 'initial') {
            const timer1 = setTimeout(() => setProposalState('declining'), 2000);
            const timer2 = setTimeout(() => setProposalState('conflicted'), 3500);
            const timer3 = setTimeout(() => setProposalState('resolving'), 5500);
            const timer4 = setTimeout(() => setProposalState('proposed_new'), 7500);
            return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
        }
        if (wizardStep !== 5) {
            setProposalState('initial');
        }
    }, [wizardStep, activeTab, proposalState]);

    // ----------------------------------------------------------------------
    // Render Helpers
    // ----------------------------------------------------------------------
    const getProgressWidth = () => `${((wizardStep - 1) / 5) * 100}%`;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col transition-colors duration-500">

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/95 border-b border-slate-800 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white cursor-pointer" onClick={() => setActiveTab('landing')}>
                        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-lg">
                            <CalendarCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">ScheduleAI<span className="text-indigo-400">.</span></span>
                    </div>

                    <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
                        <Button variant={activeTab === 'landing' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('landing')} className={activeTab === 'landing' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800'}>Home</Button>
                        <Button variant={activeTab === 'demo' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('demo')} className={activeTab === 'demo' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'text-slate-300 hover:text-white hover:bg-indigo-900/50'}>Wizard Demo</Button>
                        <Button variant={activeTab === 'types' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('types')} className={activeTab === 'types' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800'}>Meeting Types</Button>
                        <Button variant={activeTab === 'no-slots' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('no-slots')} className={activeTab === 'no-slots' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800'}>No Slots Scenario</Button>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">

                {/* ==========================================
            VIEW 1: LANDING / HERO
           ========================================== */}
                {activeTab === 'landing' && (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-4 max-w-3xl">
                            <Badge variant="outline" className="px-3 py-1 text-indigo-600 border-indigo-200 bg-indigo-50 rounded-full text-sm mb-4">
                                <SparklesIcon className="w-4 h-4 mr-2 inline" /> Next-Gen AI Scheduling
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
                                Scheduling that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">thinks for you</span>.
                            </h1>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                Automate complex cross-organization scheduling. Our AI considers time zones, working hours, priorities, and meeting specifics to find the absolute perfect time, instantly.
                            </p>
                        </div>

                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-indigo-500/25 transition-all w-full md:w-auto group" onClick={goToDemo}>
                            Try a Demo Scheduling
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-16 w-full">
                            {[
                                { icon: Globe, title: "Cross-platform", desc: "Syncs Google, Outlook & Apple across orgs seamlessly." },
                                { icon: Clock, title: "Smart Time Zones", desc: "Automatically translates complex global time zones for you." },
                                { icon: Target, title: "AI Slot Scoring", desc: "Ranks availabilities based on custom meeting rules." },
                                { icon: Zap, title: "Auto Negotiation", desc: "Handles conflicts and proposes new times without emails." },
                            ].map((ft, i) => (
                                <Card key={i} className="border-0 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
                                    <CardHeader className="pb-2">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-2">
                                            <ft.icon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <CardTitle className="text-lg">{ft.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-slate-600">
                                        {ft.desc}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* ==========================================
            VIEW 2: WIZARD / MAIN DEMO
           ========================================== */}
                {activeTab === 'demo' && (
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                        {/* Stepper Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-medium text-slate-500 mb-2 px-2">
                                <span>Setup</span>
                                <span>Participants</span>
                                <span>Availability</span>
                                <span>Scoring</span>
                                <span>Proposal</span>
                                <span>Confirmed</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out"
                                    style={{ width: getProgressWidth() }}
                                />
                            </div>
                        </div>

                        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white overflow-hidden relative">

                            {/* Decorative top gradient */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

                            <CardContent className="p-8">
                                {/* STEP 1: Setup */}
                                {wizardStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="border-b pb-4 mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                                <CalendarPlus className="text-indigo-600" /> Meeting Setup
                                            </h2>
                                            <p className="text-slate-500">Define the core parameters of your meeting.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 col-span-1 md:col-span-2">
                                                <Label htmlFor="title">Meeting Title</Label>
                                                <Input id="title" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} className="h-12 bg-slate-50 border-slate-200 text-lg" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Meeting Type</Label>
                                                <Select value={meetingType} onValueChange={setMeetingType}>
                                                    <SelectTrigger className="h-12 bg-slate-50">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MEETING_TYPES.map(type => (
                                                            <SelectItem key={type.id} value={type.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${type.color}`} />
                                                                    {type.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Duration</Label>
                                                <Select value={duration} onValueChange={setDuration}>
                                                    <SelectTrigger className="h-12 bg-slate-50">
                                                        <SelectValue placeholder="Duration" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['15', '30', '45', '60', '90', '120'].map(min => (
                                                            <SelectItem key={min} value={min}>{min} minutes</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2 col-span-1 md:col-span-2">
                                                <Label>Time Window (Date Range)</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input value="Oct 9 - Oct 13, 2026" readOnly className="h-12 bg-slate-50 font-medium text-slate-600" />
                                                    <Button variant="outline" className="h-12 px-4 shadow-sm border-slate-200">
                                                        <CalendarIcon className="w-5 h-5 text-slate-400" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: Participants */}
                                {wizardStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="border-b pb-4 mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                                <Users className="text-indigo-600" /> Participants
                                            </h2>
                                            <p className="text-slate-500">Add attendees and request calendar access across organizations.</p>
                                        </div>

                                        <div className="flex gap-2 mb-6">
                                            <Input placeholder="name@company.com" className="bg-slate-50 h-12" />
                                            <Button className="h-12 bg-slate-800 hover:bg-slate-700"><UserPlus className="w-4 h-4 mr-2" /> Add</Button>
                                        </div>

                                        <div className="space-y-3">
                                            {MOCK_PARTICIPANTS.map((p) => {
                                                const status = accessStatus[p.id];
                                                return (
                                                    <div key={p.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow gap-4">
                                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                                                                {p.avatar}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-800">{p.name} <span className="text-xs font-normal text-slate-400 ml-1">({p.role})</span></h4>
                                                                <div className="flex items-center text-xs text-slate-500 mt-1 gap-2">
                                                                    <Globe className="w-3 h-3" /> {p.tz}
                                                                    <span className="text-slate-300">|</span>
                                                                    {p.email}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-0 pt-3 md:pt-0">
                                                            <div className="flex items-center gap-2">
                                                                <Switch id={`mandatory-${p.id}`} defaultChecked={p.defaultMandatory} />
                                                                <Label htmlFor={`mandatory-${p.id}`} className="text-xs">Mandatory</Label>
                                                            </div>

                                                            <div className="min-w-[140px] flex justify-end">
                                                                {!status && (
                                                                    <Button variant="outline" size="sm" onClick={() => requestAccess(p.id)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 w-full md:w-auto">
                                                                        Request Access
                                                                    </Button>
                                                                )}
                                                                {status === 'loading' && (
                                                                    <Badge className="bg-slate-100 text-slate-600 border-0 h-8 font-normal shadow-none px-3 w-full justify-center md:w-auto">
                                                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Waiting...
                                                                    </Badge>
                                                                )}
                                                                {status === 'granted' && (
                                                                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 h-8 shadow-none px-3 w-full justify-center md:w-auto">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Access Granted
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Availability Check */}
                                {wizardStep === 3 && (
                                    <div className="space-y-6 animate-in zoom-in-95 duration-500 min-h-[400px] flex flex-col justify-center">

                                        {calendarLoadingStage < 4 ? (
                                            <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
                                                <div className="relative">
                                                    <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse mx-auto"></div>
                                                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                </div>
                                                <div className="h-8">
                                                    {calendarLoadingStage === 1 && <p className="text-lg font-medium text-slate-600 animate-in fade-in slide-in-from-bottom-2">Fetching calendars securely...</p>}
                                                    {calendarLoadingStage === 2 && <p className="text-lg font-medium text-indigo-600 animate-in fade-in slide-in-from-bottom-2">Normalizing time zones...</p>}
                                                    {calendarLoadingStage === 3 && <p className="text-lg font-medium text-emerald-600 animate-in fade-in slide-in-from-bottom-2">Detecting free/busy permutations...</p>}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-xl font-bold flex items-center gap-2"><ListFilter className="text-indigo-600" /> Availability Grid</h2>
                                                    <div className="flex gap-4 text-xs font-medium">
                                                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div> Free</div>
                                                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div> Non-working</div>
                                                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div> Busy</div>
                                                    </div>
                                                </div>

                                                {/* Mock Weekly Grid */}
                                                <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[350px] overflow-y-auto no-scrollbar shadow-inner bg-slate-50/50">
                                                    <div className="min-w-[600px] p-4 text-sm relative">
                                                        {/* Header */}
                                                        <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-2 mb-2 sticky top-0 bg-slate-50/90 backdrop-blur z-10 pb-2 border-b">
                                                            <div className="font-semibold text-slate-500">Oct 12</div>
                                                            {MOCK_PARTICIPANTS.map(p => <div key={p.id} className="font-semibold text-center truncate">{p.name.split(' ')[0]}</div>)}
                                                        </div>
                                                        {/* Rows */}
                                                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                                                            <div key={time} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-2 mb-1 items-center">
                                                                <div className="text-slate-400 text-xs font-medium">{time}</div>
                                                                <div className={`h-8 rounded-md ${idx < 1 ? 'bg-amber-100 border-amber-200' : idx === 4 ? 'bg-red-100 border-red-200' : 'bg-emerald-100 border-emerald-200'} border`}></div>
                                                                <div className={`h-8 rounded-md ${idx > 7 ? 'bg-amber-100 border-amber-200' : idx === 3 || idx === 4 ? 'bg-red-100 border-red-200' : 'bg-emerald-100 border-emerald-200'} border`}></div>
                                                                <div className={`h-8 rounded-md ${idx < 2 ? 'bg-red-100 border-red-200' : 'bg-emerald-100 border-emerald-200'} border`}></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: Smart Slot Scoring */}
                                {wizardStep === 4 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                        <div className="border-b pb-4 mb-4">
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                <Target className="text-indigo-600" /> AI Ranked Proposals
                                            </h2>
                                            <p className="text-slate-500 text-sm mt-1">Found 3 viable overlap slots aligned with "<span className="font-medium text-slate-700">{MEETING_TYPES.find(t => t.id === meetingType)?.name}</span>" rules.</p>
                                        </div>

                                        <div className="space-y-4">
                                            {MOCK_SLOTS.map((slot, idx) => (
                                                <div key={slot.id} className={`p-5 rounded-xl border-2 transition-all ${idx === 0 ? 'border-indigo-500 bg-indigo-50/30 shadow-md transform scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>

                                                    {idx === 0 && <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Top Match</div>}

                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-white border shadow-sm rounded-lg p-2 text-center w-14">
                                                                    <div className="text-[10px] uppercase font-bold text-slate-400">{slot.day.substring(0, 3)}</div>
                                                                    <div className="text-lg font-bold text-slate-800 leading-none mt-0.5">{slot.date.split(' ')[1]}</div>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-lg text-slate-900">{slot.time} <span className="text-sm font-normal text-slate-500">{slot.tz}</span></h3>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {slot.tags.map(tag => (
                                                                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${tag.includes('✅') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end shrink-0 w-full md:w-32">
                                                            <div className="flex items-end gap-1 mb-1">
                                                                <span className="text-2xl font-black text-slate-800 leading-none">{slot.score}</span>
                                                                <span className="text-xs text-slate-400 font-medium mb-0.5">/100</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                                <div className={`h-full rounded-full ${slot.score > 90 ? 'bg-emerald-500' : slot.score > 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${slot.score}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 5: Proposal Sent / Conflict Handler */}
                                {wizardStep === 5 && (
                                    <div className="space-y-6 animate-in fade-in duration-500 min-h-[400px] flex flex-col justify-center max-w-lg mx-auto text-center">

                                        {proposalState === 'initial' && (
                                            <div className="animate-in zoom-in space-y-4">
                                                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Send className="w-10 h-10 ml-1" />
                                                </div>
                                                <h2 className="text-3xl font-bold">Proposals Sent!</h2>
                                                <p className="text-slate-500">Awaiting responses from participants...</p>
                                            </div>
                                        )}

                                        {proposalState === 'declining' && (
                                            <div className="space-y-6 animate-in fade-in">
                                                <h3 className="text-xl font-bold">Gathering Responses...</h3>
                                                <div className="flex justify-center gap-6">
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border-2 border-emerald-500 mx-auto relative shadow-sm">
                                                            <Check className="w-8 h-8" />
                                                            <span className="absolute -bottom-2 bg-emerald-500 text-white text-[10px] px-2 rounded-full font-bold">Alex</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center animate-in zoom-in">
                                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 border-2 border-red-500 mx-auto relative shadow-sm">
                                                            <X className="w-8 h-8" />
                                                            <span className="absolute -bottom-2 bg-red-500 text-white text-[10px] px-2 rounded-full font-bold">Marie</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {proposalState === 'conflicted' && (
                                            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex flex-col items-center">
                                                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                                                    <h3 className="font-bold text-lg mb-1">Conflict Detected</h3>
                                                    <p className="text-sm">Marie Dubois declined the top slot (Unexpected out of office).</p>
                                                </div>
                                            </div>
                                        )}

                                        {proposalState === 'resolving' && (
                                            <div className="space-y-4 animate-in fade-in py-8">
                                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                                                <h3 className="font-bold text-lg">AI is negotiating...</h3>
                                                <p className="text-sm text-slate-500">Falling back to Slot #2 and checking real-time availability...</p>
                                            </div>
                                        )}

                                        {proposalState === 'proposed_new' && (
                                            <div className="space-y-4 animate-in zoom-in">
                                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl flex flex-col items-center">
                                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                                                    <h3 className="font-bold text-lg mb-1">Conflict Resolved!</h3>
                                                    <p className="text-sm">Slot #2 automatically proposed and accepted by all mandatory participants.</p>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}

                                {/* STEP 6: Confirmed */}
                                {wizardStep === 6 && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 text-center py-6">
                                        <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
                                            <Check className="w-12 h-12 text-white" />
                                        </div>

                                        <div>
                                            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Meeting Confirmed</h2>
                                            <p className="text-slate-500">Invitations and calendar links have been distributed.</p>
                                        </div>

                                        <Card className="max-w-md mx-auto border-slate-200 bg-slate-50/50 shadow-sm text-left relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                                            <CardContent className="p-6">
                                                <h3 className="font-bold text-xl text-slate-900 mb-1">{meetingTitle}</h3>
                                                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm mb-4">
                                                    <Clock className="w-4 h-4" /> Friday, Oct 13 • 10:00 - 11:00 (GMT)
                                                </div>
                                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attendees</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {MOCK_PARTICIPANTS.map(p => (
                                                            <Badge key={p.id} variant="secondary" className="bg-white border-slate-200">{p.name}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="flex justify-center gap-4">
                                            <Button variant="outline" className="h-12 border-slate-300 font-medium group">
                                                <CalendarIcon className="mr-2 w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" /> View in Calendar
                                            </Button>
                                            <Button className="h-12 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                                <Send className="mr-2 w-4 h-4" /> Send Reminder
                                            </Button>
                                        </div>
                                    </div>
                                )}

                            </CardContent>

                            {/* Wizard Footer Controls */}
                            {wizardStep < 6 && (
                                <CardFooter className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-xl">
                                    <Button
                                        variant="ghost"
                                        onClick={prevStep}
                                        disabled={wizardStep === 1 || (wizardStep === 5 && proposalState !== 'proposed_new')}
                                        className="text-slate-500 hover:text-slate-900"
                                    >
                                        Back
                                    </Button>

                                    <Button
                                        onClick={nextStep}
                                        className="bg-slate-900 text-white hover:bg-slate-800 px-8 shadow-md"
                                        disabled={wizardStep === 3 && calendarLoadingStage < 4}
                                    >
                                        {wizardStep === 5 ? 'Finish & Book' : 'Continue'}
                                        {wizardStep !== 5 && <ArrowRight className="w-4 h-4 ml-2" />}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                )}

                {/* ==========================================
            VIEW 3: MEETING TYPES REFERENCE
           ========================================== */}
                {activeTab === 'types' && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-6">
                        <div className="mb-8 border-b pb-4">
                            <h2 className="text-3xl font-bold flex items-center gap-3"><Settings className="text-indigo-600" /> Meeting Types Logic Hub</h2>
                            <p className="text-slate-500 mt-2 text-lg">AI scheduling rules and priorities mapped by meeting category.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MEETING_TYPES.map(type => (
                                <Card key={type.id} className="border-slate-200 hover:border-indigo-300 transition-colors shadow-sm bg-white overflow-hidden group">
                                    <div className={`h-1.5 w-full ${type.color}`} />
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-lg leading-tight group-hover:text-indigo-700 transition-colors">{type.name}</CardTitle>
                                            <Badge variant="outline" className={`shrink-0 ${type.priority === 'Max' || type.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200 font-bold' : type.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                                                {type.priority} Priority
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-3 pb-4">
                                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {type.duration}</div>
                                            <div className="flex items-center gap-1.5 truncate"><Activity className="w-3.5 h-3.5 text-slate-400" /> {type.hours}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-2 items-start mt-2">
                                            <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                            <span className="text-slate-700 font-medium text-xs leading-relaxed">{type.rule}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* ==========================================
            VIEW 4: NO SLOTS SCENARIO
           ========================================== */}
                {activeTab === 'no-slots' && (
                    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto py-12">
                        <Card className="border-red-200 shadow-xl shadow-red-100/50 bg-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                            <CardHeader className="text-center pt-8 pb-4">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                    <CalendarX className="w-8 h-8 text-red-500" />
                                </div>
                                <CardTitle className="text-2xl text-slate-900">No Common Slots Found</CardTitle>
                                <CardDescription className="text-base text-slate-500 max-w-sm mx-auto mt-2">
                                    We scanned the next 14 days and could not find an overlap that meets all constraints.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 px-8 pb-8">
                                <p className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2">AI Suggested Alternatives</p>

                                <div className="group cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">Expand Time Window</h4>
                                        <p className="text-xs text-slate-500 mt-1">Check the following week (Oct 20 - Oct 25)</p>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
                                </div>

                                <div className="group cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">Reduce Participants</h4>
                                        <p className="text-xs text-slate-500 mt-1">Make <span className="font-medium text-slate-700">David Smith</span> optional. Finds 4 slots.</p>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
                                </div>

                                <div className="group cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">Shorten Meeting</h4>
                                        <p className="text-xs text-slate-500 mt-1">Reduce from 60 min to 30 min. Finds 2 slots.</p>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </main>
        </div>
    );
}

function SparklesIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

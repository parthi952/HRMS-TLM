import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../../Context/UserData";
import { useTheme } from "../../ThemeContext";
import { getGlassmorphicStyle } from "../../Themes/PageThemes/SideMenu";
import {
    User,
    BookOpen,
    Briefcase,
    Users,
    CreditCard,
    ShieldCheck,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    Building,
    DollarSign
} from "lucide-react";
import { InfoCard, StatutoryCard } from "./ProfileCards";

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { employeeData, loading, error } = useUserData();
    const { currentPreset } = useTheme();
    const [activeTab, setActiveTab] = useState<"personal" | "edu_exp" | "family" | "payroll" | "statutory">("personal");

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-sm font-bold text-slate-500">Loading your corporate profile...</p>
            </div>
        );
    }

    if (error || !employeeData || !employeeData.profile) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4 p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl max-w-md text-center shadow-sm">
                    <h3 className="text-base font-black mb-1.5">Failed to load profile</h3>
                    <p className="text-xs font-semibold leading-relaxed">{error || "No employee record matches this user session."}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-all cursor-pointer"
                >
                    <ArrowLeft size={14} /> Go Back
                </button>
            </div>
        );
    }

    const { profile, base_salary, total_earnings, total_deductions, net_salary, earnings_breakdown, deductions_breakdown, education, family, experience } = employeeData;

    const bioFields = [
        { label: "Gender", value: profile.gender },
        { label: "Date of Birth", value: profile.dob, icon: <Calendar size={12} className="text-slate-400" /> },
        { label: "Nationality", value: "Indian" },
    ];

    const contactFields = [
        { 
            label: "Corporate Email", 
            value: profile.email, 
            icon: <Mail size={14} className="text-indigo-600" />, 
            iconBg: "bg-indigo-50" 
        },
        { 
            label: "Phone Number", 
            value: profile.phone, 
            icon: <Phone size={14} className="text-emerald-600" />, 
            iconBg: "bg-emerald-50" 
        },
    ];

    const addressFields = [
        { 
            label: "Current Residence", 
            value: `${profile.Street}, ${profile.City}, ${profile.State} - ${profile.Pin_Code}`, 
            icon: <MapPin size={14} className="text-amber-600" />, 
            iconBg: "bg-amber-50" 
        },
        { 
            label: "Permanent Residence", 
            value: `${profile.p_Street || profile.Street}, ${profile.p_City || profile.City}, ${profile.p_State || profile.State} - ${profile.p_Pin_Code || profile.Pin_Code}`, 
            icon: <MapPin size={14} className="text-teal-650" />, 
            iconBg: "bg-teal-50" 
        },
    ];

    const bankFields = [
        { label: "Bank Name", value: profile.bankName || "HDFC Bank Ltd" },
        { label: "Account Number", value: profile.accountNumber || "•••• •••• •••• 9210" },
        { label: "IFSC Code", value: profile.ifscCode || "HDFC0000210" },
    ];

    const statutoryFields = [
        { label: "PAN Number", value: profile.panNumber || "ABCDE1234F" },
        { label: "Aadhar Number", value: profile.aadhar_no || "•••• •••• 4120" },
        { label: "UAN Number", value: profile.uan_number || "101234567890" },
        { label: "Provident Fund (PF) ID", value: profile.pf_id || "DL/CPM/1012345" },
        { label: "ESI Number", value: profile.esi_no || "11-22-334455-667" },
        { label: "Corporate Health Insurance No", value: profile.insurance_no || "POL-98765432" },
    ];

    const tabItems = [
        { id: "personal", label: "Personal & Contact", icon: User },
        { id: "edu_exp", label: "Education & Career", icon: BookOpen },
        { id: "family", label: "Family & Nominees", icon: Users },
        { id: "payroll", label: "Payroll Breakdown", icon: DollarSign },
        { id: "statutory", label: "Statutory & Bank", icon: ShieldCheck },
    ] as const;

    return (
        <div 
            className="p-6 bg-bg min-h-[calc(100vh-3.5rem)] flex flex-col overflow-y-auto no-scrollbar"
            style={{ 
                fontFamily: currentPreset.titleFont,
                color: `hsl(${currentPreset.textColor})`
            }}
        >

            {/* Back button & Title */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <button
                    onClick={() => navigate("/EmployeeManagement")}
                    className="p-2.5 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={16} className="text-slate-650" />
                </button>
                <div>
                    <h2 
                        className="text-xl font-black tracking-tight leading-none"
                        style={{ color: currentPreset.primaryHex }}
                    >
                        Corporate Profile
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Employee Directory Profile Overview</p>
                </div>
            </div>

            {/* Top Graphic Header Card */}
            <div
                className="rounded-[32px] p-6 mb-6 border border-slate-200/50 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0"
                style={getGlassmorphicStyle(currentPreset.primaryHex, "14", 16)}
            >
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg"
                            style={{ backgroundColor: currentPreset.primaryHex }}
                        >
                            {profile.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="w-4.5 h-4.5 bg-[#00ff00] rounded-full absolute -bottom-1.5 -right-1.5 border-3 border-white shadow-md animate-pulse" />
                    </div>
                    <div>
                        <h1 
                            className="text-2xl font-black leading-tight tracking-tight mb-1"
                            style={{ color: `hsl(${currentPreset.textColor})` }}
                        >
                            {profile.name}
                        </h1>
                        <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                            <Building size={12} style={{ color: currentPreset.primaryHex }} />
                            {profile.designation} <span className="text-slate-300">|</span> {profile.Department}
                        </p>
                        <span
                            className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white mt-1 shadow-sm"
                            style={{ backgroundColor: currentPreset.primaryHex }}
                        >
                            {profile.emp_type}
                        </span>
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/40 flex gap-6 shadow-sm self-start md:self-auto">
                    <div className="text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Employee ID</span>
                        <span className="text-sm font-black text-slate-700 tracking-tight block mt-0.5">{profile.Emp_id}</span>
                    </div>
                    <div className="w-px bg-slate-200/60" />
                    <div className="text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Date of Joining</span>
                        <span className="text-sm font-black text-slate-700 tracking-tight block mt-0.5">{profile.DateOfJoining || "May 15, 2026"}</span>
                    </div>
                </div>
            </div>

            {/* Tabs Menu Grid */}
            <div className="flex gap-2.5 border-b border-slate-200/60 pb-3 mb-6 overflow-x-auto no-scrollbar shrink-0">
                {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-sm border ${isActive
                                    ? "text-white border-transparent"
                                    : "bg-white border-slate-200/60 text-slate-500 hover:text-slate-800"
                                }`}
                            style={{ backgroundColor: isActive ? currentPreset.primaryHex : undefined }}
                        >
                            <Icon size={13} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Dynamic Tabs Content Body */}
            <div className="flex-1 min-h-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-y-auto no-scrollbar">

                {/* TAB 1: PERSONAL & CONTACT */}
                {activeTab === "personal" && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4" style={{ color: `hsl(${currentPreset.textColor})` }}>Basic Bio Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {bioFields.map((field, idx) => (
                                    <InfoCard
                                        key={idx}
                                        label={field.label}
                                        value={field.value}
                                        icon={field.icon}
                                        primaryColor={currentPreset.primaryHex}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4" style={{ color: `hsl(${currentPreset.textColor})` }}>Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {contactFields.map((field, idx) => (
                                    <InfoCard
                                        key={idx}
                                        label={field.label}
                                        value={field.value}
                                        icon={field.icon}
                                        iconBg={field.iconBg}
                                        primaryColor={currentPreset.primaryHex}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4" style={{ color: `hsl(${currentPreset.textColor})` }}>Address Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {addressFields.map((field, idx) => (
                                    <InfoCard
                                        key={idx}
                                        label={field.label}
                                        value={field.value}
                                        icon={field.icon}
                                        iconBg={field.iconBg}
                                        primaryColor={currentPreset.primaryHex}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* TAB 2: EDUCATION & EXPERIENCE */}
                {activeTab === "edu_exp" && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Professional Work Experience */}
                        <div>
                            <h3 
                                className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-1.5"
                                style={{ color: `hsl(${currentPreset.textColor})` }}
                            >
                                <Briefcase size={14} style={{ color: currentPreset.primaryHex }} />
                                Professional Work Experience
                            </h3>
                            {experience.length > 0 ? (
                                <div className="relative border-l border-slate-100 pl-6 ml-4 space-y-6 py-2">
                                    {experience.map((work) => (
                                        <div key={work.id} className="relative">
                                            {/* Timeline dot */}
                                            <span className="w-3.5 h-3.5 rounded-full bg-white border-2 absolute -left-[33px] top-1 flex items-center justify-center" style={{ borderColor: currentPreset.primaryHex }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPreset.primaryHex }} />
                                            </span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 leading-tight">{work.position}</h4>
                                                <p className="text-[11px] font-bold text-slate-500 mt-1">{work.company_name}</p>
                                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-400 mt-2 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                    <Calendar size={9} />
                                                    {work.FromDate} - {work.ToDate || "Present"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200/80 rounded-2xl">
                                    No work experience records currently attached.
                                </div>
                            )}
                        </div>

                        {/* Educational Qualifications */}
                        <div>
                            <h3 
                                className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-1.5"
                                style={{ color: `hsl(${currentPreset.textColor})` }}
                            >
                                <Award size={14} style={{ color: currentPreset.primaryHex }} />
                                Educational Credentials
                            </h3>
                            {education.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {education.map((edu) => (
                                        <div key={edu.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5 shrink-0">
                                                <BookOpen size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 leading-tight">{edu.degree}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">{edu.institution}</p>
                                                <p className="text-[9px] font-black tracking-wider uppercase text-slate-400 mt-2">Graduation Year: {edu.graduationYear}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200/80 rounded-2xl">
                                    No educational credentials currently on file.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* TAB 3: FAMILY & NOMINEES */}
                {activeTab === "family" && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div>
                            <h3 
                                className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-1.5"
                                style={{ color: `hsl(${currentPreset.textColor})` }}
                            >
                                <Users size={14} style={{ color: currentPreset.primaryHex }} />
                                Emergency Family Dependents & Nominees
                            </h3>
                            {family.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {family.map((member) => (
                                        <div key={member.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-slate-200/40 flex items-center justify-center text-slate-700 text-sm font-bold shrink-0 mt-0.5">
                                                {member.person_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 leading-tight">{member.person_name}</h4>
                                                <span
                                                    className="inline-block text-[8px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded mt-1.5"
                                                    style={{ backgroundColor: currentPreset.primaryHex }}
                                                >
                                                    {member.relationship_type}
                                                </span>
                                                <div className="space-y-1 mt-2.5 border-t border-slate-200/40 pt-2 text-[10px] font-semibold text-slate-550">
                                                    <p className="flex items-center gap-1.5">
                                                        <Phone size={10} className="text-slate-400" />
                                                        {member.contact}
                                                    </p>
                                                    <p className="flex items-center gap-1.5">
                                                        <Calendar size={10} className="text-slate-400" />
                                                        DOB: {member.person_dob}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200/80 rounded-2xl">
                                    No family or nominee records currently attached.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* TAB 4: PAYROLL BREAKDOWN */}
                {activeTab === "payroll" && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Total Net Salary Box */}
                        <div
                            className="rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border"
                            style={{ backgroundColor: currentPreset.primaryHex, borderColor: `${currentPreset.primaryHex}20` }}
                        >
                            <div>
                                <span className="text-[10px] font-black tracking-widest uppercase text-white/70 block">Calculated Net Take-Home Salary</span>
                                <span className="text-3xl font-black tracking-tight block mt-1">₹{net_salary.toLocaleString('en-IN')}/mo</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 text-xs font-bold leading-normal">
                                Base Salary: ₹{base_salary.toLocaleString('en-IN')}/mo
                            </div>
                        </div>

                        {/* Breakdown Split grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Earnings (Allowances) */}
                            <div className="bg-emerald-50/15 border border-emerald-500/10 p-5 rounded-3xl">
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 pb-2 border-b border-emerald-500/10 mb-4 flex justify-between items-center">
                                    <span>Allowance Earnings</span>
                                    <span className="text-emerald-600">+ ₹{total_earnings.toLocaleString('en-IN')}</span>
                                </h3>
                                {earnings_breakdown.length > 0 ? (
                                    <div className="space-y-3">
                                        {earnings_breakdown.map((earn, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs font-bold bg-white border border-emerald-500/5 p-3 rounded-xl shadow-inner">
                                                <span className="text-slate-650">{earn.name} ({earn.percentage || earn.type})</span>
                                                <span className="text-emerald-600">+ ₹{earn.value.toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] font-bold text-emerald-600/70 text-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/5 border-dashed">
                                        No custom allowance earnings added.
                                    </p>
                                )}
                            </div>

                            {/* Deductions */}
                            <div className="bg-red-50/15 border border-red-500/10 p-5 rounded-3xl">
                                <h3 className="text-xs font-black uppercase tracking-wider text-red-800 pb-2 border-b border-red-500/10 mb-4 flex justify-between items-center">
                                    <span>Standard Deductions</span>
                                    <span className="text-red-650">- ₹{total_deductions.toLocaleString('en-IN')}</span>
                                </h3>
                                {deductions_breakdown.length > 0 ? (
                                    <div className="space-y-3">
                                        {deductions_breakdown.map((ded, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs font-bold bg-white border border-red-500/5 p-3 rounded-xl shadow-inner">
                                                <span className="text-slate-650">{ded.name} ({ded.percentage || ded.type})</span>
                                                <span className="text-red-550">- ₹{ded.value.toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] font-bold text-red-600/70 text-center py-4 bg-red-500/5 rounded-xl border border-red-500/5 border-dashed">
                                        No deductions applied.
                                    </p>
                                )}
                            </div>

                        </div>
                    </motion.div>
                )}

                {/* TAB 5: STATUTORY & BANK INFO */}
                {activeTab === "statutory" && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Bank Info */}
                        <div>
                            <h3 
                                className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-1.5"
                                style={{ color: `hsl(${currentPreset.textColor})` }}
                            >
                                <CreditCard size={14} style={{ color: currentPreset.primaryHex }} />
                                Salary Bank Account Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {bankFields.map((field, idx) => (
                                    <InfoCard
                                        key={idx}
                                        label={field.label}
                                        value={field.value}
                                        primaryColor={currentPreset.primaryHex}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Statutory IDs */}
                        <div>
                            <h3 
                                className="text-sm font-black uppercase tracking-wider pb-2 border-b border-slate-100 mb-4 flex items-center gap-1.5"
                                style={{ color: `hsl(${currentPreset.textColor})` }}
                            >
                                <ShieldCheck size={14} style={{ color: currentPreset.primaryHex }} />
                                Government Statutory Identifiers
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {statutoryFields.map((field, idx) => (
                                    <StatutoryCard
                                        key={idx}
                                        label={field.label}
                                        value={field.value}
                                        primaryColor={currentPreset.primaryHex}
                                    />
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}

            </div>
        </div>
    );
};

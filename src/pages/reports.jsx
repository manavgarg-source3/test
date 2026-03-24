import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, FileText, Battery, 
  AlertCircle, CheckCircle2, BarChart3, Activity,
  ChevronDown, ChevronUp, Phone, Mail, User, Info, Wrench, FileDown,
  ShieldAlert, ShieldCheck, BellRing, Gauge, Plus, MessageSquare, Sparkles, Cpu
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports({ records = [] }) {
  const [localRecords, setLocalRecords] = useState([]);
  
  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");
  const [quickFilter, setQuickFilter] = useState("All"); 
  const [expandedRow, setExpandedRow] = useState(null);
  const [lastSynced, setLastSynced] = useState("Just now");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setLastSynced(`${Math.floor(Math.random() * 5) + 1} min ago`), 60000);
    return () => clearInterval(timer);
  }, []);

  const getBatteryStatus = (val) => {
    const n = parseInt(val);
    if (isNaN(n)) return { label: "Not Measured", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" };
    if (n >= 75) return { label: "Optimal Health", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (n >= 40) return { label: "Needs Maintenance", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Critical - Replace", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
  };

  const getDamageAnalysis = (condition) => {
    if (!condition) return { reason: "Unknown", action: "Pending Visual Inspection", color: "text-slate-500", bg: "bg-slate-100" };
    if (condition.includes("Major")) return { reason: "Probable Collision", action: "Requires Structural Check", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
    if (condition.includes("Minor")) return { reason: "Parking Scrapes", action: "Cosmetic Touch-up", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { reason: "Normal Wear", action: "Standard Wash", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  };

  const getTyreStatus = (psi) => {
    const val = parseInt(psi);
    if (isNaN(val)) return { text: "Not Checked", color: "text-slate-500" };
    if (val < 30) return { text: `${val} PSI (Low)`, color: "text-amber-600 font-bold" };
    if (val > 40) return { text: `${val} PSI (High)`, color: "text-amber-600 font-bold" };
    return { text: `${val} PSI (Optimal)`, color: "text-emerald-600 font-medium" };
  };

  const getStatusRowBorder = (r) => {
    const batVal = Number(r.batteryHealth);
    if (r.exteriorCondition?.includes("Major") || (batVal > 0 && batVal < 40)) return "border-l-4 border-l-red-500";
    if (r.exteriorCondition?.includes("Minor") || (batVal >= 40 && batVal <= 75)) return "border-l-4 border-l-amber-400";
    return "border-l-4 border-l-emerald-500";
  };

  const handleAddRemark = (id) => {
    if (!newNote.trim()) { toast.error("Please enter a remark first."); return; }
    const updatedRecords = localRecords.map(r => {
      if (r.id === id) {
        const notes = r.extraNotes ? [...r.extraNotes, newNote] : [newNote];
        return { ...r, extraNotes: notes };
      }
      return r;
    });
    setLocalRecords(updatedRecords);
    localStorage.setItem("fleetRecords", JSON.stringify(updatedRecords)); 
    setNewNote(""); 
    toast.success("Mechanic remark added to official record!");
  };

  const toggleRow = (id) => {
    if (expandedRow !== id) { setExpandedRow(id); setNewNote(""); } 
    else { setExpandedRow(null); }
  };

  const analytics = useMemo(() => {
    let criticalCount = 0; let totalBattery = 0; let batteryReadings = 0; let generalJobs = 0;
    localRecords.forEach(r => {
      const batVal = Number(r.batteryHealth);
      if (r.exteriorCondition?.includes("Major") || (batVal > 0 && batVal < 40)) criticalCount++;
      if (batVal > 0) { totalBattery += batVal; batteryReadings++; }
      if (r.jobType === "General Service") generalJobs++;
    });

    const total = localRecords.length;
    const rawScore = total > 0 ? 100 - ((criticalCount / total) * 100 * 1.5) : 100;
    return {
      total, critical: criticalCount,
      avgBattery: batteryReadings > 0 ? Math.round(totalBattery / batteryReadings) : 0,
      fleetScore: Math.max(0, Math.round(rawScore)),
      generalPercentage: total > 0 ? Math.round((generalJobs / total) * 100) : 0
    };
  }, [localRecords]);

  const activeAlerts = useMemo(() => {
    return localRecords.filter(r => r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) < 40))
      .map(r => ({
        id: r.id, vehicle: r.vehicleNumber,
        issue: Number(r.batteryHealth) < 40 ? `Critical Battery (${r.batteryHealth}%)` : `Major Body Damage`,
        date: r.date.split(',')[0], type: Number(r.batteryHealth) < 40 ? 'battery' : 'damage'
      }));
  }, [localRecords]);

  const filteredRecords = useMemo(() => {
    return localRecords.filter((r) => {
      const matchesSearch = r.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompany = filterCompany === "All" || r.companyName === filterCompany;
      let matchesQuick = true;
      const isCritical = r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) < 40);
      if (quickFilter === "Critical") matchesQuick = isCritical;
      if (quickFilter === "Healthy") matchesQuick = !isCritical;
      return matchesSearch && matchesCompany && matchesQuick;
    });
  }, [localRecords, searchTerm, filterCompany, quickFilter]);

  const companies = ["All", ...new Set(localRecords.map(r => r.companyName).filter(Boolean))];

  const jobTypeData = useMemo(() => {
    const counts = { "Quick Service": 0, "General Service": 0 };
    filteredRecords.forEach(r => { if (counts[r.jobType] !== undefined) counts[r.jobType]++; });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [filteredRecords]);

  const conditionData = useMemo(() => {
    const counts = { "Good": 0, "Minor": 0, "Major": 0 };
    filteredRecords.forEach(r => { 
      if (r.exteriorCondition?.includes("Good")) counts["Good"]++;
      if (r.exteriorCondition?.includes("Minor")) counts["Minor"]++;
      if (r.exteriorCondition?.includes("Major")) counts["Major"]++;
    });
    return [
      { name: "Good", value: counts["Good"], color: "#10b981" },
      { name: "Minor", value: counts["Minor"], color: "#f59e0b" },
      { name: "Major", value: counts["Major"], color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [filteredRecords]);

  // --- ENTERPRISE PDF GENERATION ---
  const downloadMasterPDF = () => {
    if (filteredRecords.length === 0) { toast.error("No data available to export."); return; }
    toast.success("Compiling Enterprise Master Report...");
    const doc = new jsPDF(); const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(30, 58, 138); doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold'); doc.text("FLEET PRO INTELLIGENCE", 14, 17);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139); doc.setFont(undefined, 'normal');
    doc.text(`Report Type: Comprehensive Master Audit`, 14, 35);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 41);

    doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 50, pageWidth - 28, 25, 3, 3, 'FD');
    doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.setFont(undefined, 'bold'); doc.text("EXECUTIVE SUMMARY", 20, 58);
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text(`Total Vehicles Audited: ${filteredRecords.length}`, 20, 67);
    
    const criticalVechs = filteredRecords.filter(r => r.exteriorCondition?.includes("Major") || Number(r.batteryHealth) < 40);
    doc.setTextColor(criticalVechs.length > 0 ? 220 : 15, criticalVechs.length > 0 ? 38 : 23, criticalVechs.length > 0 ? 38 : 42);
    doc.text(`Critical Interventions Required: ${criticalVechs.length} Vehicles`, 100, 67);

    const tableColumn = ["ID", "Vehicle No.", "Battery Status", "Body Assessment", "Remarks"];
    const tableRows = filteredRecords.map(r => [
      `#${r.id.toString().slice(-5)}`, 
      r.vehicleNumber, 
      r.batteryHealth ? `${r.batteryHealth}% (${getBatteryStatus(r.batteryHealth).label})` : "N/A", 
      getDamageAnalysis(r.exteriorCondition).reason,
      r.extraNotes ? `${r.extraNotes.length} notes` : "None"
    ]);

    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 82, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235] }, alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("Enterprise_Fleet_Audit.pdf");
  };

  // NEW & IMPROVED INDUSTRY-STANDARD INDIVIDUAL PDF
  const downloadIndividualPDF = (record) => {
    toast.success(`Generating colorful invoice for ${record.vehicleNumber}...`);
    const doc = new jsPDF(); 
    const pageWidth = doc.internal.pageSize.width;

    // Helper to convert Tailwind text colors to RGB for JS PDF
    const getRGB = (colorStr) => {
        if(colorStr.includes('red')) return [220, 38, 38];
        if(colorStr.includes('amber')) return [217, 119, 6];
        if(colorStr.includes('emerald')) return [16, 185, 129];
        return [71, 85, 105]; // Default Slate
    };

    // 1. BRANDED HEADER (Full Bleed Indigo)
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text("SERVICE INVOICE & DIAGNOSTIC REPORT", 14, 22);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`REF: #${record.id.toString().slice(-8).toUpperCase()}   |   DATE: ${record.date}`, 14, 30);

    // 2. CLIENT & VEHICLE BOXES
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 45, 88, 35, 3, 3, 'FD'); // Client Box
    doc.roundedRect(108, 45, 88, 35, 3, 3, 'FD'); // Vehicle Box

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont(undefined, 'bold');
    doc.text("CLIENT DETAILS", 18, 53);
    doc.text("VEHICLE IDENTIFICATION", 112, 53);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${record.fleetOwnerName}`, 18, 60);
    doc.text(`Company: ${record.companyName || 'N/A'}`, 18, 66);
    doc.text(`Phone: ${record.fleetOwnerContact}`, 18, 72);

    doc.text(`Reg No: ${record.vehicleNumber}`, 112, 60);
    doc.text(`Job Type: ${record.jobType}`, 112, 66);
    doc.text(`Status: Logged for Service`, 112, 72);

    // 3. COLOR-CODED DIAGNOSTIC ENGINE RESULTS
    const batteryStat = getBatteryStatus(record.batteryHealth);
    const damageStat = getDamageAnalysis(record.exteriorCondition);
    
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 85, pageWidth - 28, 22, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text("SYSTEM AUTOMATED DIAGNOSTICS", 18, 92);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text(`Battery Health:`, 18, 100);
    const batColor = getRGB(batteryStat.color);
    doc.setTextColor(batColor[0], batColor[1], batColor[2]);
    doc.text(`${batteryStat.label} (${record.batteryHealth || 'N/A'}%)`, 45, 100);

    doc.setTextColor(15, 23, 42);
    doc.text(`Body Assessment:`, 108, 100);
    const damColor = getRGB(damageStat.color);
    doc.setTextColor(damColor[0], damColor[1], damColor[2]);
    doc.text(`${damageStat.reason}`, 138, 100);

    // 4. TECHNICAL SPECS TABLE
    autoTable(doc, {
      startY: 115,
      theme: 'grid',
      head: [['Physical Inspection Checkpoint', 'Recorded Status']],
      body: [
        ['Exterior Body Shell', record.exteriorCondition || 'Standard'],
        ['Paint Deterioration', record.paintCondition || 'Standard'],
        ['Battery Cell Health', record.batteryHealth ? `${record.batteryHealth}%` : 'Not Measured'],
        ['Tyre Pressure Reading', record.tyrePressure || 'Not Measured'],
      ],
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 5, fontSize: 10 }
    });

    let finalY = doc.lastAutoTable.finalY + 12;

    // PAGE BREAK CHECK
    const checkPageBreak = (requiredSpace) => {
        if (finalY + requiredSpace > 280) {
            doc.addPage();
            finalY = 20;
        }
    };
    
    // 5. CLIENT REPORTED ISSUES
    checkPageBreak(40);
    doc.setFont(undefined, 'bold'); 
    doc.setTextColor(15, 23, 42); 
    doc.text("CLIENT REPORTED ISSUES", 14, finalY);
    doc.setDrawColor(203, 213, 225); 
    doc.setFillColor(248, 250, 252); 
    doc.rect(14, finalY + 4, 182, 25, 'FD');
    doc.setFont(undefined, 'normal'); 
    doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(record.issueDescription || "No specific issues detailed prior to inspection.", 175);
    doc.text(splitText, 18, finalY + 11);

    finalY += 38;

    // 6. HIGHLIGHTED MECHANIC REMARKS (THE INDUSTRY TOUCH)
    checkPageBreak(50);
    if (record.extraNotes && record.extraNotes.length > 0) {
      doc.setFont(undefined, 'bold'); 
      doc.setTextColor(15, 23, 42); 
      doc.text("POST-INSPECTION MECHANIC REMARKS", 14, finalY);
      
      // Warning Amber Box
      doc.setDrawColor(253, 224, 71); // yellow-300
      doc.setFillColor(254, 252, 232); // yellow-50
      const boxHeight = 10 + (record.extraNotes.length * 6);
      doc.roundedRect(14, finalY + 4, 182, boxHeight, 3, 3, 'FD');
      
      // Red Text for High Visibility
      doc.setFont(undefined, 'bold'); 
      doc.setTextColor(220, 38, 38);
      record.extraNotes.forEach((note, idx) => { 
          doc.text(`[ATTENTION] ${note}`, 18, finalY + 11 + (idx * 6)); 
      });
      finalY += boxHeight + 15;
    } else { 
        finalY += 10; 
    }

    // 7. SIGNATURES & TERMS
    checkPageBreak(40);
    doc.setFontSize(8); 
    doc.setTextColor(100, 116, 139); 
    doc.setFont(undefined, 'normal');
    doc.text("Terms: The client authorizes the diagnostic work detailed above.", 14, finalY);
    
    finalY += 15;
    doc.setDrawColor(148, 163, 184); 
    doc.line(14, finalY, 70, finalY); 
    doc.line(140, finalY, 196, finalY);
    doc.setFontSize(9); 
    doc.setTextColor(15, 23, 42); 
    doc.text("Service Advisor Signature", 14, finalY + 5); 
    doc.text("Client Authorization", 140, finalY + 5);

    doc.save(`Invoice_${record.vehicleNumber}.pdf`);
  };

  if (localRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500 animate-in fade-in px-4">
        <FileText size={48} className="text-indigo-400 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">System Awaiting Data</h2>
        <p className="text-sm max-w-md text-center">Log vehicles in the Service Form to populate your intelligence dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto space-y-8 animate-in fade-in duration-500 pb-12 px-4 sm:px-6 xl:px-8 font-sans">
      
      {/* 1. DECISION LAYER */}
      {analytics.critical > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 sm:p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={24} />
            <div>
              <p className="text-sm sm:text-base font-bold text-red-700">⚠ {analytics.critical} vehicles require immediate operational attention</p>
              <p className="text-xs sm:text-sm text-red-600/80 mt-1 font-medium">Prioritize battery replacement and major body repairs to avoid long-term fleet downtime.</p>
            </div>
          </div>
          <button onClick={() => setQuickFilter("Critical")} className="w-full md:w-auto shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">Review Critical List</button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Fleet Intelligence Hub</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-semibold text-slate-400">Live Sync Active • Last updated: {lastSynced}</p>
          </div>
        </div>
        <button onClick={downloadMasterPDF} className="w-full md:w-auto flex justify-center items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ease-out shadow-lg hover:-translate-y-0.5 active:scale-95">
          <FileDown size={18} /> Export Master Audit
        </button>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><BarChart3 size={18} className="text-indigo-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Total Audited</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1 sm:mt-2">{analytics.total}</h4>
        </div>
        <div className="bg-gradient-to-br from-white to-red-50/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-100 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><AlertCircle size={18} className="text-red-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest">Critical Alerts</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-red-600 mt-1 sm:mt-2">{analytics.critical}</h4>
        </div>
        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><Battery size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Battery</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1 sm:mt-2">{analytics.avgBattery}%</h4>
        </div>
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-800 shadow-xl flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute -right-4 -top-4 sm:-right-6 sm:-top-6 text-white/5 group-hover:scale-110 transition-transform duration-500"><Gauge size={100} className="sm:w-32 sm:h-32"/></div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 z-10"><Gauge size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-widest">Fleet Score</p></div>
          <div className="flex items-end gap-1.5 sm:gap-2 mt-1 sm:mt-2 z-10">
            <h4 className={`text-3xl sm:text-4xl font-black ${analytics.fleetScore > 80 ? 'text-emerald-400' : analytics.fleetScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>{analytics.fleetScore}</h4>
            <span className="text-indigo-300 font-bold mb-1 text-sm">/ 100</span>
          </div>
        </div>
      </div>

      {/* CHARTS & LIVE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><Wrench size={16} className="text-indigo-500"/> Service Demand</h3>
          <div className="h-48 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2">
            <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-indigo-900 font-medium">General Services make up <span className="font-bold">{analytics.generalPercentage}%</span> of total workload.</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={16} className="text-emerald-500"/> Exterior Condition</h3>
          <div className="h-48 flex items-center justify-center">
            {conditionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={conditionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {conditionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-slate-400 italic">Require General Service data.</p>}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
             {conditionData.map(d => (
               <div key={d.name} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div><span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">{d.name}</span></div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><BellRing size={16} className="text-amber-400"/> Live Alerts</span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeAlerts.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {activeAlerts.length > 0 ? activeAlerts.map(alert => (
              <div key={alert.id} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex flex-col gap-2 transition-all hover:border-slate-500">
                <div className="flex items-start gap-3">
                  {alert.type === 'battery' ? <Battery size={16} className="text-red-400 mt-0.5 shrink-0"/> : <ShieldAlert size={16} className="text-amber-400 mt-0.5 shrink-0"/>}
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-200">{alert.vehicle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alert.issue}</p>
                  </div>
                </div>
                <button onClick={() => toast.success(`Technician assigned to ${alert.vehicle}`)} className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">Assign Technician</button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <ShieldCheck size={32} className="text-emerald-500/50 mb-2"/>
                <p className="text-xs">No active alerts. Fleet is healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER & TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Sticky Filters */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center shadow-sm">
           <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto hide-scrollbar pb-2 md:pb-0">
             <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">Views:</span>
             {[{ id: 'All', icon: <Filter size={14}/>, label: 'All Fleet' }, { id: 'Critical', icon: <ShieldAlert size={14}/>, label: 'Action Needed' }, { id: 'Healthy', icon: <ShieldCheck size={14}/>, label: 'Healthy' }].map(view => (
               <button key={view.id} onClick={() => setQuickFilter(view.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${quickFilter === view.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                 {view.icon} {view.label}
               </button>
             ))}
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
              <div className="w-full sm:w-64 lg:w-72 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search Vehicle No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 sm:pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 mt-1 absolute right-2 -bottom-4">Showing {filteredRecords.length} results</p>
              </div>
              <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full sm:w-40 lg:w-48 p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-500">
                {companies.map(c => <option key={c} value={c}>{c === "All" ? "All Companies" : c}</option>)}
              </select>
           </div>
        </div>

        {/* MOBILE TABLE CARDS (Displays < 1024px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden p-4 bg-slate-50">
          {filteredRecords.length > 0 ? filteredRecords.map((r) => {
            const batteryUI = getBatteryStatus(r.batteryHealth);
            const damageUI = getDamageAnalysis(r.exteriorCondition);
            const isCrit = r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) < 40);
            return (
            <div key={r.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${isCrit ? 'border-red-200 shadow-red-100' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{r.vehicleNumber}</h3>
                    {r.extraNotes?.length > 0 && <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><MessageSquare size={10}/> {r.extraNotes.length}</span>}
                  </div>
                  <p className="text-xs text-slate-500">{r.companyName || "Personal"}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${r.jobType === 'Quick Service' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 text-indigo-700'}`}>{r.jobType}</span>
              </div>
              
              <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Battery Diagnostics</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${batteryUI.bg} ${batteryUI.color} ${batteryUI.border}`}>
                      {r.batteryHealth ? `${r.batteryHealth}% - ${batteryUI.label}` : 'N/A'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Damage Probable Cause</p>
                    <span className="text-[10px] font-bold text-slate-700 max-w-[120px] truncate text-right">{damageUI.reason}</span>
                 </div>
              </div>

              <button onClick={() => toggleRow(r.id)} className="w-full mb-2 bg-indigo-50 text-indigo-700 text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2">View Diagnostics {expandedRow === r.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>
              
              {expandedRow === r.id && (
                <div className="mb-4 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                   <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <h4 className="text-[10px] font-bold text-indigo-800 uppercase mb-2">Add Mechanic Note</h4>
                      <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add note..." className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 mb-2 focus:outline-none focus:border-indigo-500" />
                      <button onClick={() => handleAddRemark(r.id)} className="w-full bg-indigo-600 text-white text-xs font-bold py-1.5 rounded transition-all">Save Note</button>
                      {r.extraNotes && r.extraNotes.map((note, idx) => (
                        <p key={idx} className="text-[10px] text-slate-600 mt-2 bg-slate-50 p-1.5 rounded border border-slate-100">✔ {note}</p>
                      ))}
                   </div>
                </div>
              )}

              <button onClick={() => downloadIndividualPDF(r)} className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2"><FileDown size={14}/> PDF Invoice</button>
            </div>
          )}) : (<div className="col-span-1 md:col-span-2 p-8 text-center text-slate-500 text-sm">No vehicles match filters.</div>)}
        </div>

        {/* DESKTOP TABLE (Displays >= 1024px) */}
        <div className="hidden lg:block overflow-x-auto pb-10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">Vehicle Details</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Diagnosis</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? filteredRecords.map((r) => {
                const batteryUI = getBatteryStatus(r.batteryHealth);
                const damageUI = getDamageAnalysis(r.exteriorCondition);
                return (
                  <React.Fragment key={r.id}>
                    <tr className={`transition-all duration-300 ease-out cursor-pointer group ${getStatusRowBorder(r)} ${expandedRow === r.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`} onClick={() => toggleRow(r.id)}>
                      <td className="p-5 pl-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{r.vehicleNumber}</p>
                          {r.extraNotes?.length > 0 && <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><MessageSquare size={10}/> {r.extraNotes.length}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{r.companyName || "Personal Vehicle"}</p>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${r.jobType === 'Quick Service' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {r.jobType === 'Quick Service' ? <Info size={14}/> : <Wrench size={14}/>} {r.jobType}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                             <Battery size={14} className="text-slate-400 shrink-0"/>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${batteryUI.bg} ${batteryUI.color} ${batteryUI.border}`}>
                               {r.batteryHealth ? `${r.batteryHealth}% - ${batteryUI.label}` : 'N/A'}
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Activity size={14} className="text-slate-400 shrink-0"/>
                             <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{damageUI.reason}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-right pr-6">
                        <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold group-hover:scale-105">
                          {expandedRow === r.id ? <>Close <ChevronUp size={16}/></> : <>Audit <ChevronDown size={16}/></>}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW LOGIC WITH AI & REMARKS */}
                    {expandedRow === r.id && (
                      <tr>
                        <td colSpan="4" className="p-0 border-b border-indigo-100">
                          <div className="bg-indigo-50/40 p-6 lg:p-8 animate-in slide-in-from-top-2 duration-200 shadow-inner">
                            
                            <div className="flex justify-between items-center mb-6">
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200">Record #{r.id.toString().slice(-6)}</span>
                               <button onClick={() => downloadIndividualPDF(r)} className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm">
                                 <FileDown size={14} /> Official Invoice
                               </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                              
                              <div className="space-y-4 lg:col-span-2">
                                
                                {/* AUTOMATED DIAGNOSTIC ENGINE PANEL */}
                                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-xl border border-indigo-800 shadow-lg text-white">
                                   <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2"><Cpu size={14}/> Automated Diagnostic Engine Assessment</h4>
                                   <div className="space-y-2">
                                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-start gap-3">
                                        <Battery size={16} className={`mt-0.5 ${batteryUI.color.replace('text-', 'text-').replace('700','400')}`} />
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Power System Analysis</p>
                                          <p className="text-sm text-white">Calculated state: <span className="font-bold text-indigo-300">{batteryUI.label}</span>. {r.batteryHealth && Number(r.batteryHealth) < 40 ? 'Immediate replacement recommended.' : 'No immediate action required on cells.'}</p>
                                        </div>
                                      </div>
                                      {r.jobType === "General Service" && (
                                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-start gap-3">
                                          <Sparkles size={16} className="text-amber-400 mt-0.5" />
                                          <div>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Structural Body Analysis</p>
                                            <p className="text-sm text-white">Inferred Reason: <span className="font-bold text-amber-300">{damageUI.reason}</span>.</p>
                                            <p className="text-xs text-slate-400 mt-1">Required Action: {damageUI.action}</p>
                                          </div>
                                        </div>
                                      )}
                                   </div>
                                </div>

                                {/* MECHANIC REMARKS LOG */}
                                <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Wrench size={16}/> Mechanic Remarks Log</h4>
                                  {r.extraNotes && r.extraNotes.length > 0 ? (
                                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                      {r.extraNotes.map((note, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-start gap-2">
                                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                          <p className="text-sm text-slate-700 leading-relaxed">{note}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-400 italic mb-4">No post-inspection remarks added yet.</p>
                                  )}
                                  <div className="flex gap-2">
                                    <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add required part, finding, or status update..." className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"/>
                                    <button onClick={() => handleAddRemark(r.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shrink-0">
                                      <Plus size={16}/> Save Remark
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Client Contact</h4>
                                  <div className="flex items-center gap-3 text-sm text-slate-700 mb-2"><User size={16} className="text-slate-400 shrink-0"/> <span className="truncate font-medium">{r.fleetOwnerName}</span></div>
                                  <div className="flex items-center gap-3 text-sm text-slate-700 mb-2"><Phone size={16} className="text-slate-400 shrink-0"/> {r.fleetOwnerContact}</div>
                                  <div className="flex items-center gap-3 text-sm text-slate-700"><Mail size={16} className="text-slate-400 shrink-0"/> <span className="truncate">{r.fleetOwnerEmail}</span></div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Initial Client Notes</h4>
                                  <p className="text-sm text-slate-600 italic leading-relaxed">{r.issueDescription || "No specific issues detailed prior to inspection."}</p>
                                </div>
                              </div>
                              
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr><td colSpan="4" className="p-12 text-center text-slate-500 text-sm"><Search className="mx-auto text-slate-300 mb-3" size={32} />No vehicles match filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

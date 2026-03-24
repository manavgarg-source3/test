import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, FileText, Battery, 
  AlertCircle, CheckCircle2, BarChart3, Activity,
  ChevronDown, ChevronUp, Phone, Mail, User, Info, Wrench, FileDown,
  ShieldAlert, ShieldCheck, BellRing, Gauge
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from "recharts";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports({ records = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");
  const [quickFilter, setQuickFilter] = useState("All"); 
  const [expandedRow, setExpandedRow] = useState(null);
  const [lastSynced, setLastSynced] = useState("Just now");

  // --- LAST UPDATED SIMULATION ---
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSynced(`${Math.floor(Math.random() * 5) + 1} min ago`);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- CORE ANALYTICS & FLEET SCORE ---
  const analytics = useMemo(() => {
    let criticalCount = 0; let totalBattery = 0; let batteryReadings = 0; let generalJobs = 0;
    
    records.forEach(r => {
      const batVal = Number(r.batteryHealth);
      if (r.exteriorCondition?.includes("Major") || (batVal > 0 && batVal <= 30)) criticalCount++;
      if (batVal > 0) { totalBattery += batVal; batteryReadings++; }
      if (r.jobType === "General Service") generalJobs++;
    });

    const total = records.length;
    const rawScore = total > 0 ? 100 - ((criticalCount / total) * 100 * 1.5) : 100;

    return {
      total,
      critical: criticalCount,
      avgBattery: batteryReadings > 0 ? Math.round(totalBattery / batteryReadings) : 0,
      fleetScore: Math.max(0, Math.round(rawScore)),
      generalPercentage: total > 0 ? Math.round((generalJobs / total) * 100) : 0
    };
  }, [records]);

  // --- LIVE ALERTS GENERATOR ---
  const activeAlerts = useMemo(() => {
    return records.filter(r => r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) <= 30))
      .map(r => ({
        id: r.id,
        vehicle: r.vehicleNumber,
        issue: Number(r.batteryHealth) <= 30 ? `Critical Battery (${r.batteryHealth}%)` : `Major Body Damage`,
        date: r.date.split(',')[0],
        type: Number(r.batteryHealth) <= 30 ? 'battery' : 'damage'
      }));
  }, [records]);

  // --- MULTI-LAYER FILTERING ---
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompany = filterCompany === "All" || r.companyName === filterCompany;
      let matchesQuick = true;
      const isCritical = r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) <= 30);
      if (quickFilter === "Critical") matchesQuick = isCritical;
      if (quickFilter === "Healthy") matchesQuick = !isCritical;
      return matchesSearch && matchesCompany && matchesQuick;
    });
  }, [records, searchTerm, filterCompany, quickFilter]);

  const companies = ["All", ...new Set(records.map(r => r.companyName).filter(Boolean))];

  // --- CHART DATA ---
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

  const batteryData = useMemo(() => {
    const bins = { "0-20%": 0, "21-50%": 0, "51-80%": 0, "81-100%": 0 };
    filteredRecords.forEach(r => {
      const b = Number(r.batteryHealth);
      if (b > 0 && b <= 20) bins["0-20%"]++;
      else if (b > 20 && b <= 50) bins["21-50%"]++;
      else if (b > 50 && b <= 80) bins["51-80%"]++;
      else if (b > 80) bins["81-100%"]++;
    });
    return Object.keys(bins).map(key => ({ name: key, count: bins[key] }));
  }, [filteredRecords]);


  // --- ENTERPRISE PDF GENERATION ---
  
  const downloadMasterPDF = () => {
    if (filteredRecords.length === 0) {
      toast.error("No data available to export."); return;
    }
    toast.success("Compiling Enterprise Master Report...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header & Branding
    doc.setFillColor(30, 58, 138); 
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text("FLEET PRO INTELLIGENCE", 14, 17);
    
    // Report Meta Data
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont(undefined, 'normal');
    doc.text(`Report Type: Comprehensive Master Audit`, 14, 35);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 41);
    doc.text(`Filtered By: Company (${filterCompany}) | Status (${quickFilter})`, 14, 47);

    // Executive Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 55, pageWidth - 28, 25, 3, 3, 'FD');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text("EXECUTIVE SUMMARY", 20, 63);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Vehicles Audited: ${filteredRecords.length}`, 20, 72);
    
    const criticalVechs = filteredRecords.filter(r => r.exteriorCondition?.includes("Major") || Number(r.batteryHealth) <= 30);
    doc.setTextColor(criticalVechs.length > 0 ? 220 : 15, criticalVechs.length > 0 ? 38 : 23, criticalVechs.length > 0 ? 38 : 42);
    doc.text(`Critical Interventions Required: ${criticalVechs.length} Vehicles`, 100, 72);

    // Main Data Table
    const tableColumn = ["ID", "Vehicle No.", "Company", "Service Type", "Battery", "Condition"];
    const tableRows = filteredRecords.map(r => [
      `#${r.id.toString().slice(-5)}`, r.vehicleNumber, r.companyName || "Personal", r.jobType,
      r.batteryHealth ? `${r.batteryHealth}%` : "N/A", r.exteriorCondition ? r.exteriorCondition.split(' (')[0] : "N/A"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 88,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 30 }
    });

    // Action Items Section (Dynamic)
    let finalY = doc.lastAutoTable.finalY + 15;
    if (criticalVechs.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; } 
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.setFont(undefined, 'bold');
      doc.text("IMMEDIATE ACTION REQUIRED", 14, finalY);
      
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont(undefined, 'normal');
      criticalVechs.slice(0, 5).forEach((v, idx) => { 
        const issue = Number(v.batteryHealth) <= 30 ? "Critical Battery Level" : "Major Body Damage";
        doc.text(`- Vehicle ${v.vehicleNumber} (${v.companyName || 'Personal'}): ${issue}`, 14, finalY + 8 + (idx * 6));
      });
      if (criticalVechs.length > 5) doc.text(`...and ${criticalVechs.length - 5} more.`, 14, finalY + 8 + (5 * 6));
    }

    // Footer & Pagination
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("STRICTLY CONFIDENTIAL - INTERNAL FLEET USE ONLY", 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, 290);
    }

    doc.save("Enterprise_Fleet_Audit.pdf");
  };

  const downloadIndividualPDF = (record) => {
    toast.success(`Generating official invoice for ${record.vehicleNumber}...`);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header Branding
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, 'bold');
    doc.text("OFFICIAL SERVICE INTAKE", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont(undefined, 'normal');
    doc.text(`Document Ref: #${record.id.toString().slice(-8).toUpperCase()}`, 14, 28);
    doc.text(`Timestamp: ${record.date}`, 14, 34);

    // Client Block
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text("BILL TO / OWNER DETAILS", 14, 55);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${record.fleetOwnerName}`, 14, 63);
    doc.text(`Company: ${record.companyName || 'N/A'}`, 14, 69);
    doc.text(`Phone: ${record.fleetOwnerContact}`, 14, 75);

    // Vehicle Block
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text("VEHICLE IDENTIFICATION", 110, 55);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Registration: ${record.vehicleNumber}`, 110, 63);
    doc.text(`Requested Job: ${record.jobType}`, 110, 69);

    autoTable(doc, {
      startY: 90,
      theme: 'grid',
      head: [['Diagnostic Check', 'Recorded Status']],
      body: [
        ['Exterior Body Shell', record.exteriorCondition || 'Standard'],
        ['Paint Deterioration', record.paintCondition || 'Standard'],
        ['Battery Cell Health', record.batteryHealth ? `${record.batteryHealth}%` : 'Not Measured'],
        ['Tyre Pressure Reading', record.tyrePressure || 'Not Measured'],
      ],
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { cellPadding: 6, fontSize: 10 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("MECHANIC NOTES & REPORTED ISSUES", 14, finalY);
    
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY + 5, 182, 35, 'FD');
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(record.issueDescription || "No specific issues detailed by the client prior to inspection.", 175);
    doc.text(splitText, 18, finalY + 12);

    // Terms and Signatures
    const sigY = finalY + 60;
    doc.setFontSize(8);
    doc.text("Terms: By signing below, the client authorizes the diagnostic work detailed above.", 14, sigY - 15);
    
    doc.setDrawColor(148, 163, 184);
    doc.line(14, sigY, 70, sigY);
    doc.line(140, sigY, 196, sigY);
    doc.setFontSize(9);
    doc.text("Service Advisor Signature", 14, sigY + 5);
    doc.text("Client Authorization", 140, sigY + 5);

    doc.save(`Intake_${record.vehicleNumber}.pdf`);
  };

  // --- HELPER UI FUNCTIONS ---
  const getBatteryColor = (health) => {
    const num = parseInt(health);
    if (isNaN(num)) return "bg-slate-200";
    if (num <= 30) return "bg-red-500";
    if (num <= 60) return "bg-amber-400";
    return "bg-emerald-500";
  };

  const getTyreStatus = (psi) => {
    const val = parseInt(psi);
    if (isNaN(val)) return { text: "Not Checked", color: "text-slate-400" };
    if (val < 30) return { text: `${val} PSI (Low)`, color: "text-amber-600 font-bold" };
    if (val > 40) return { text: `${val} PSI (High)`, color: "text-amber-600 font-bold" };
    return { text: `${val} PSI (Optimal)`, color: "text-emerald-600 font-medium" };
  };

  const getStatusRowBorder = (r) => {
    const batVal = Number(r.batteryHealth);
    if (r.exteriorCondition?.includes("Major") || (batVal > 0 && batVal <= 30)) return "border-l-4 border-l-red-500";
    if (r.exteriorCondition?.includes("Minor") || (batVal > 30 && batVal <= 60)) return "border-l-4 border-l-amber-400";
    return "border-l-4 border-l-emerald-500";
  };

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500 animate-in fade-in px-4">
        <FileText size={48} className="text-indigo-400 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">System Awaiting Data</h2>
        <p className="text-sm max-w-md text-center">Log vehicles in the Service Form to populate your intelligence dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto space-y-8 animate-in fade-in duration-500 pb-12 px-4 sm:px-6 xl:px-8 font-sans">
      
      {/* 1. DECISION LAYER (The CEO View) */}
      {analytics.critical > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 sm:p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={24} />
            <div>
              <p className="text-sm sm:text-base font-bold text-red-700">
                ⚠ {analytics.critical} vehicles require immediate operational attention
              </p>
              <p className="text-xs sm:text-sm text-red-600/80 mt-1 font-medium">
                Prioritize battery replacement and major body repairs to avoid long-term fleet downtime.
              </p>
            </div>
          </div>
          <button onClick={() => setQuickFilter("Critical")} className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-red-200 active:scale-95">
            Review Critical List
          </button>
        </div>
      )}

      {/* HEADER + LAST SYNCED */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <button onClick={downloadMasterPDF} className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ease-out shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95">
          <FileDown size={18} /> Export Master Audit
        </button>
      </div>

      {/* KPI DASHBOARD with Glow & Hover Effects */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-3 mb-2"><BarChart3 size={20} className="text-indigo-500 group-hover:scale-110 transition-transform"/><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Audited</p></div>
          <h4 className="text-4xl font-black text-slate-800 mt-2">{analytics.total}</h4>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50/30 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-3 mb-2"><AlertCircle size={20} className="text-red-500 group-hover:scale-110 transition-transform"/><p className="text-xs font-bold text-red-600 uppercase tracking-widest">Critical Alerts</p></div>
          <h4 className="text-4xl font-black text-red-600 mt-2">{analytics.critical}</h4>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-3 mb-2"><Battery size={20} className="text-emerald-500 group-hover:scale-110 transition-transform"/><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Battery</p></div>
          <h4 className="text-4xl font-black text-slate-800 mt-2">{analytics.avgBattery}%</h4>
        </div>

        {/* The Fleet Score Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-800 shadow-xl flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/30 hover:-translate-y-1 group">
          <div className="absolute -right-6 -top-6 text-white/5 group-hover:scale-110 transition-transform duration-500"><Gauge size={120} /></div>
          <div className="flex items-center gap-3 mb-2 z-10"><Gauge size={20} className="text-indigo-400 group-hover:rotate-12 transition-transform"/><p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Fleet Score</p></div>
          <div className="flex items-end gap-2 mt-2 z-10">
            <h4 className={`text-4xl font-black ${analytics.fleetScore > 80 ? 'text-emerald-400' : analytics.fleetScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>{analytics.fleetScore}</h4>
            <span className="text-indigo-300 font-bold mb-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* VISUAL ANALYTICS WITH INSIGHT LABELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Job Types */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><Wrench size={16} className="text-indigo-500"/> Service Demand</h3>
          <div className="h-48 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2">
            <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-900 font-medium">General Services currently make up <span className="font-bold">{analytics.generalPercentage}%</span> of total operational workload.</p>
          </div>
        </div>

        {/* Chart 2: Condition Matrix */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={16} className="text-emerald-500"/> Exterior Condition</h3>
          <div className="h-48 flex items-center justify-center">
            {conditionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={conditionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {conditionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-slate-400 italic">Require General Service data.</p>}
          </div>
          <div className="mt-4 flex justify-center gap-4">
             {conditionData.map(d => (
               <div key={d.name} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div><span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span></div>
             ))}
          </div>
        </div>

        {/* ACTIONABLE ALERTS FEED */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[350px]">
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
                <button onClick={() => toast.success(`Technician assigned to ${alert.vehicle}`)} className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                  Assign Technician
                </button>
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

      {/* STICKY QUICK FILTERS & TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Sticky Control Bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center shadow-sm">
           
           <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto hide-scrollbar pb-1 lg:pb-0">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">Views:</span>
             {[
               { id: 'All', icon: <Filter size={14}/>, label: 'All Fleet' },
               { id: 'Critical', icon: <ShieldAlert size={14}/>, label: 'Action Needed' },
               { id: 'Healthy', icon: <ShieldCheck size={14}/>, label: 'Healthy' }
             ].map(view => (
               <button key={view.id} onClick={() => setQuickFilter(view.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${quickFilter === view.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                 {view.icon} {view.label}
               </button>
             ))}
           </div>

           <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
              <div className="w-full sm:w-72">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search Vehicle No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-1.5 ml-1 absolute">Showing {filteredRecords.length} results</p>
              </div>
              <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full sm:w-48 p-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 bg-slate-50">
                {companies.map(c => <option key={c} value={c}>{c === "All" ? "All Companies" : c}</option>)}
              </select>
           </div>
        </div>

        {/* MOBILE UX CARDS */}
        <div className="block sm:hidden p-4 space-y-4 bg-slate-50">
          {filteredRecords.length > 0 ? filteredRecords.map((r) => {
            const isCrit = r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) <= 30);
            return (
            <div key={r.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${isCrit ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{r.vehicleNumber}</h3>
                  <p className="text-xs text-slate-500">{r.companyName || "Personal"}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${r.jobType === 'Quick Service' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 text-indigo-700'}`}>
                  {r.jobType}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Battery</p>
                  <p className={`text-sm font-bold ${getBatteryColor(r.batteryHealth).replace('bg-', 'text-')}`}>{r.batteryHealth ? `${r.batteryHealth}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Condition</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{r.exteriorCondition?.split(' (')[0] || 'Standard'}</p>
                </div>
              </div>

              <button onClick={() => downloadIndividualPDF(r)} className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2">
                <FileDown size={14}/> Download Report
              </button>
            </div>
          )}) : (
            <div className="p-8 text-center text-slate-500 text-sm">No vehicles match filters.</div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto pb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">Vehicle Details</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Metrics</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? filteredRecords.map((r) => (
                <React.Fragment key={r.id}>
                  {/* PRIORITY INDICATOR STRIP */}
                  <tr className={`transition-all duration-300 ease-out cursor-pointer group ${getStatusRowBorder(r)} ${expandedRow === r.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`} onClick={() => toggleRow(r.id)}>
                    <td className="p-5 pl-5">
                      <p className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{r.vehicleNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.companyName || "Personal Vehicle"}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${r.jobType === 'Quick Service' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {r.jobType === 'Quick Service' ? <Info size={14}/> : <Wrench size={14}/>} {r.jobType}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex gap-4 items-center">
                        <div className="w-24">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Battery</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full ${getBatteryColor(r.batteryHealth)}`} style={{ width: `${Math.min(100, Math.max(0, r.batteryHealth))}%` }}></div></div>
                            <span className="text-[10px] font-bold text-slate-600">{r.batteryHealth ? `${r.batteryHealth}%` : 'N/A'}</span>
                          </div>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Body</p>
                           <p className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{r.exteriorCondition?.split(' (')[0] || 'Standard'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right pr-6">
                      <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold group-hover:scale-105">
                        {expandedRow === r.id ? <>Close <ChevronUp size={16}/></> : <>Audit <ChevronDown size={16}/></>}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED ROW */}
                  {expandedRow === r.id && (
                    <tr>
                      <td colSpan="4" className="p-0 border-b border-indigo-100">
                        <div className="bg-indigo-50/40 p-4 sm:p-6 md:p-8 animate-in slide-in-from-top-2 duration-200 shadow-inner">
                          
                          <div className="flex justify-between items-center mb-4 sm:mb-6">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200">Record #{r.id.toString().slice(-6)}</span>
                             <button onClick={() => downloadIndividualPDF(r)} className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm">
                               <FileDown size={14} /> Official Invoice
                             </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                            <div className="space-y-2 lg:col-span-2">
                              <h4 className="text-[10px] sm:text-xs font-bold text-indigo-800 uppercase tracking-widest border-b border-indigo-200 pb-2">Diagnostic Notes</h4>
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap">
                                {r.issueDescription || <span className="italic text-slate-400">Standard checkup required. No specific issues noted.</span>}
                              </p>
                            </div>

                            <div className="space-y-2 sm:space-y-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm h-fit">
                              <h4 className="text-[10px] sm:text-xs font-bold text-indigo-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2 sm:mb-3">Client Contact</h4>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700"><User size={14} className="text-slate-400 shrink-0"/> <span className="truncate font-medium">{r.fleetOwnerName}</span></div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700"><Phone size={14} className="text-slate-400 shrink-0"/> {r.fleetOwnerContact}</div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700"><Mail size={14} className="text-slate-400 shrink-0"/> <span className="truncate">{r.fleetOwnerEmail}</span></div>
                            </div>

                            {r.jobType === "General Service" && (
                              <div className="space-y-2 lg:col-span-3">
                                <h4 className="text-[10px] sm:text-xs font-bold text-indigo-800 uppercase tracking-widest border-b border-indigo-200 pb-2">Technical Telemetry</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200">
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Paint Status</p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-800 mt-0.5 sm:mt-1 truncate">{r.paintCondition}</p>
                                  </div>
                                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200">
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Tyre Pressure</p>
                                    <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 truncate ${getTyreStatus(r.tyrePressure).color}`}>{getTyreStatus(r.tyrePressure).text}</p>
                                  </div>
                                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200">
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Logged Date</p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-800 mt-0.5 sm:mt-1 truncate">{r.date.split(',')[0]}</p>
                                  </div>
                                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">System Check</p>
                                      <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5 sm:mt-1 truncate flex items-center gap-1"><CheckCircle2 size={12}/> Verified</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr><td colSpan="4" className="p-12 text-center text-slate-500 text-sm"><Search className="mx-auto text-slate-300 mb-3" size={32} />No vehicles match filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
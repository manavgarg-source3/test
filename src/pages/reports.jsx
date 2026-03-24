import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, FileText, Battery, 
  AlertCircle, CheckCircle2, BarChart3, Activity,
  ChevronDown, ChevronUp, Phone, Mail, User, Info, Wrench, FileDown,
  ShieldAlert, ShieldCheck, BellRing, Gauge, Plus, MessageSquare, Sparkles, Cpu, Coffee
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
  const [greeting, setGreeting] = useState("Hello");

  // --- WARM GREETING & SYNC LOGIC ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const timer = setInterval(() => setLastSynced(`${Math.floor(Math.random() * 5) + 1} min ago`), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- FRIENDLY DIAGNOSTIC ENGINE ---
  const getBatteryStatus = (val) => {
    const n = parseInt(val);
    if (isNaN(n)) return { label: "Not Measured", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" };
    if (n >= 75) return { label: "Looking Great", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (n >= 40) return { label: "Needs a Checkup", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Needs Replacement", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
  };

  const getDamageAnalysis = (condition) => {
    if (!condition) return { reason: "Unknown", action: "We'll need to take a look.", color: "text-slate-500", bg: "bg-slate-100" };
    if (condition.includes("Major")) return { 
      reason: "Looks like a collision", 
      action: "Let's get this to the body shop.", 
      color: "text-red-700", bg: "bg-red-50", border: "border-red-200" 
    };
    if (condition.includes("Minor")) return { 
      reason: "Probably a parking scrape", 
      action: "A quick buff should help.", 
      color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" 
    };
    return { 
      reason: "Normal wear & tear", 
      action: "A standard wash is fine.", 
      color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" 
    };
  };

  const getTyreStatus = (psi) => {
    const val = parseInt(psi);
    if (isNaN(val)) return { text: "Not Checked", color: "text-slate-500" };
    if (val < 30) return { text: `${val} PSI (A bit low)`, color: "text-amber-600 font-bold" };
    if (val > 40) return { text: `${val} PSI (A bit high)`, color: "text-amber-600 font-bold" };
    return { text: `${val} PSI (Perfect)`, color: "text-emerald-600 font-medium" };
  };

  const getStatusRowBorder = (r) => {
    const batVal = Number(r.batteryHealth);
    if (r.exteriorCondition?.includes("Major") || (batVal > 0 && batVal < 40)) return "border-l-4 border-l-red-500";
    if (r.exteriorCondition?.includes("Minor") || (batVal >= 40 && batVal <= 75)) return "border-l-4 border-l-amber-400";
    return "border-l-4 border-l-emerald-500";
  };

  // --- MECHANIC REMARK LOGIC ---
  const handleAddRemark = (id) => {
    if (!newNote.trim()) { toast("Oops! Don't forget to type a note.", { icon: '✍️' }); return; }
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
    toast.success("Got it! Note saved. 🛠️");
  };

  const toggleRow = (id) => {
    if (expandedRow !== id) { setExpandedRow(id); setNewNote(""); } 
    else { setExpandedRow(null); }
  };

  // --- CORE ANALYTICS ---
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

  // --- LIVE ALERTS GENERATOR ---
  const activeAlerts = useMemo(() => {
    return localRecords.filter(r => r.exteriorCondition?.includes("Major") || (Number(r.batteryHealth) > 0 && Number(r.batteryHealth) < 40))
      .map(r => ({
        id: r.id, vehicle: r.vehicleNumber,
        issue: Number(r.batteryHealth) < 40 ? `Battery is critically low (${r.batteryHealth}%)` : `Significant body damage reported`,
        date: r.date.split(',')[0], type: Number(r.batteryHealth) < 40 ? 'battery' : 'damage'
      }));
  }, [localRecords]);

  // --- MULTI-LAYER FILTERING ---
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

  // --- PDF GENERATION ---
  const downloadMasterPDF = () => {
    if (filteredRecords.length === 0) { toast("Nothing to print right now!", { icon: '🖨️' }); return; }
    toast.success("Packing up your fleet report... 📄");
    const doc = new jsPDF(); const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(30, 58, 138); doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold'); doc.text("FLEET HEALTH SUMMARY", 14, 17);
    
    doc.setFontSize(10); doc.setTextColor(100, 116, 139); doc.setFont(undefined, 'normal');
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 35);

    doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 45, pageWidth - 28, 25, 3, 3, 'FD');
    doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.setFont(undefined, 'bold'); doc.text("AT A GLANCE", 20, 53);
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text(`Vehicles checked: ${filteredRecords.length}`, 20, 62);
    
    const criticalVechs = filteredRecords.filter(r => r.exteriorCondition?.includes("Major") || Number(r.batteryHealth) < 40);
    doc.setTextColor(criticalVechs.length > 0 ? 220 : 15, criticalVechs.length > 0 ? 38 : 23, criticalVechs.length > 0 ? 38 : 42);
    doc.text(`Vehicles needing attention: ${criticalVechs.length}`, 100, 62);

    const tableColumn = ["Ref", "Vehicle", "Battery", "Body Assessment", "Mechanic Notes"];
    const tableRows = filteredRecords.map(r => [
      `#${r.id.toString().slice(-5)}`, 
      r.vehicleNumber, 
      r.batteryHealth ? `${r.batteryHealth}% (${getBatteryStatus(r.batteryHealth).label})` : "N/A", 
      getDamageAnalysis(r.exteriorCondition).reason,
      r.extraNotes ? `${r.extraNotes.length} notes added` : "None yet"
    ]);

    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 77, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235] }, alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("Fleet_Summary.pdf");
  };

  const downloadIndividualPDF = (record) => {
    toast.success(`Generating invoice for ${record.vehicleNumber}... 🚘`);
    const doc = new jsPDF(); const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(248, 250, 252); doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(24); doc.setTextColor(30, 58, 138); doc.setFont(undefined, 'bold'); doc.text("SERVICE INVOICE", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139); doc.setFont(undefined, 'normal');
    doc.text(`Ref: #${record.id.toString().slice(-8).toUpperCase()} | Date: ${record.date}`, 14, 28);

    doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.setFont(undefined, 'bold');
    doc.text("CLIENT INFO", 14, 50); doc.text("VEHICLE INFO", 110, 50);
    doc.setFont(undefined, 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
    doc.text(`${record.fleetOwnerName}\n${record.companyName || 'Personal'}\n${record.fleetOwnerContact}`, 14, 58);
    doc.text(`${record.vehicleNumber}\nJob: ${record.jobType}`, 110, 58);

    const batteryStat = getBatteryStatus(record.batteryHealth);
    const damageStat = getDamageAnalysis(record.exteriorCondition);
    
    doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 75, pageWidth - 28, 25, 3, 3, 'FD');
    doc.setFontSize(10); doc.setTextColor(15, 23, 42); doc.setFont(undefined, 'bold');
    doc.text("QUICK SYSTEM CHECKUP", 18, 83);
    doc.setFont(undefined, 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
    doc.text(`Battery: ${batteryStat.label}`, 18, 90);
    doc.text(`Body: ${damageStat.action}`, 18, 96);

    autoTable(doc, {
      startY: 110, theme: 'grid', head: [['Physical Inspection', 'Status']],
      body: [
        ['Exterior Shell', record.exteriorCondition || 'Looks good'],
        ['Paint', record.paintCondition || 'Looks good'],
        ['Battery Health', record.batteryHealth ? `${record.batteryHealth}%` : 'Not Measured'],
        ['Tyre Pressure', record.tyrePressure || 'Not Measured'],
      ],
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { cellPadding: 6, fontSize: 10 }
    });

    let finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42); doc.text("WHAT THE CLIENT TOLD US", 14, finalY);
    doc.setDrawColor(203, 213, 225); doc.setFillColor(248, 250, 252); doc.rect(14, finalY + 5, 182, 25, 'FD');
    doc.setFont(undefined, 'normal'); doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(record.issueDescription || "No specific issues mentioned.", 175);
    doc.text(splitText, 18, finalY + 12);

    finalY += 40;
    if (record.extraNotes && record.extraNotes.length > 0) {
      doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42); doc.text("OUR MECHANIC NOTES", 14, finalY);
      doc.setFont(undefined, 'normal'); doc.setTextColor(220, 38, 38);
      record.extraNotes.forEach((note, idx) => { doc.text(`• ${note}`, 14, finalY + 8 + (idx * 6)); });
      finalY += 15 + (record.extraNotes.length * 6);
    } else { finalY += 10; }

    const sigY = finalY + 30;
    doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text("Terms: The client authorizes the work detailed above.", 14, sigY - 10);
    doc.setDrawColor(148, 163, 184); doc.line(14, sigY, 70, sigY); doc.line(140, sigY, 196, sigY);
    doc.setFontSize(9); doc.setTextColor(15, 23, 42); doc.text("Service Advisor", 14, sigY + 5); doc.text("Client Signature", 140, sigY + 5);

    doc.save(`Invoice_${record.vehicleNumber}.pdf`);
  };

  // --- FRIENDLY EMPTY STATE ---
  if (localRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in px-4">
        <span className="text-6xl mb-6 block animate-bounce">👋</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">Looks like things are quiet here!</h2>
        <p className="text-sm max-w-md text-center text-slate-500 leading-relaxed">
          Whenever you're ready, log your first vehicle in the intake form. Your fleet data will magically appear right here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto space-y-8 animate-in fade-in duration-500 pb-12 px-4 sm:px-6 xl:px-8 font-sans">
      
      {/* DECISION LAYER */}
      {analytics.critical > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 sm:p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={24} />
            <div>
              <p className="text-sm sm:text-base font-bold text-red-700">Heads up! {analytics.critical} vehicles need some love.</p>
              <p className="text-xs sm:text-sm text-red-600/80 mt-1 font-medium">Let's check the battery levels and any major damage to get them back on the road.</p>
            </div>
          </div>
          <button onClick={() => setQuickFilter("Critical")} className="w-full md:w-auto shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">See who needs help</button>
        </div>
      )}

      {/* HEADER WITH GREETING */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{greeting}, team! ☕</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-semibold text-slate-400">Data looks fresh • Updated {lastSynced}</p>
          </div>
        </div>
        <button onClick={downloadMasterPDF} className="w-full md:w-auto flex justify-center items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ease-out shadow-lg hover:-translate-y-0.5 active:scale-95">
          <FileDown size={18} /> Print Today's Summary
        </button>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><BarChart3 size={18} className="text-indigo-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicles In Shop</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1 sm:mt-2">{analytics.total}</h4>
        </div>
        <div className="bg-gradient-to-br from-white to-red-50/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-100 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><AlertCircle size={18} className="text-red-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest">Needs Attention</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-red-600 mt-1 sm:mt-2">{analytics.critical}</h4>
        </div>
        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><Battery size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Battery</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1 sm:mt-2">{analytics.avgBattery}%</h4>
        </div>
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-800 shadow-xl flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute -right-4 -top-4 sm:-right-6 sm:-top-6 text-white/5 group-hover:scale-110 transition-transform duration-500"><Gauge size={100} className="sm:w-32 sm:h-32"/></div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 z-10"><Gauge size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-widest">Overall Fleet Health</p></div>
          <div className="flex items-end gap-1.5 sm:gap-2 mt-1 sm:mt-2 z-10">
            <h4 className={`text-3xl sm:text-4xl font-black ${analytics.fleetScore > 80 ? 'text-emerald-400' : analytics.fleetScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>{analytics.fleetScore}</h4>
            <span className="text-indigo-300 font-bold mb-1 text-sm">/ 100</span>
          </div>
        </div>
      </div>

      {/* CHARTS & LIVE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><Wrench size={16} className="text-indigo-500"/> What are we fixing?</h3>
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
            <p className="text-[11px] sm:text-xs text-indigo-900 font-medium">Just a heads up, <span className="font-bold">{analytics.generalPercentage}%</span> of the workload right now is big General Service jobs.</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={16} className="text-emerald-500"/> How do they look?</h3>
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
            ) : <p className="text-xs text-slate-400 italic">No body condition data yet.</p>}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
             {conditionData.map(d => (
               <div key={d.name} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div><span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">{d.name}</span></div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><BellRing size={16} className="text-amber-400"/> Action Items</span>
            {activeAlerts.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeAlerts.length}</span>}
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
                <button onClick={() => toast.success(`Awesome! Tech dispatched to ${alert.vehicle} 🔧`)} className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">Assign Technician</button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="text-4xl mb-3">🎉</span>
                <p className="text-xs text-center font-medium text-slate-300">Woohoo! No major issues right now.</p>
                <p className="text-[10px] text-center mt-1">The fleet is running smoothly.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center shadow-sm">
           <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto hide-scrollbar pb-2 md:pb-0">
             <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">Filter:</span>
             {[{ id: 'All', icon: <Filter size={14}/>, label: 'Everything' }, { id: 'Critical', icon: <ShieldAlert size={14}/>, label: 'Needs Help' }, { id: 'Healthy', icon: <ShieldCheck size={14}/>, label: 'Good to Go' }].map(view => (
               <button key={view.id} onClick={() => setQuickFilter(view.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${quickFilter === view.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                 {view.icon} {view.label}
               </button>
             ))}
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
              <div className="w-full sm:w-64 lg:w-72 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Find a vehicle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 sm:pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 mt-1 absolute right-2 -bottom-4">Found {filteredRecords.length} matches</p>
              </div>
           </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto pb-10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">Vehicle Details</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Type</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Checkup</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">Action</th>
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
                          {expandedRow === r.id ? <>Close <ChevronUp size={16}/></> : <>Open File <ChevronDown size={16}/></>}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expandedRow === r.id && (
                      <tr>
                        <td colSpan="4" className="p-0 border-b border-indigo-100">
                          <div className="bg-indigo-50/40 p-6 lg:p-8 animate-in slide-in-from-top-2 duration-200 shadow-inner">
                            
                            <div className="flex justify-between items-center mb-6">
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200">Record #{r.id.toString().slice(-6)}</span>
                               <button onClick={() => downloadIndividualPDF(r)} className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm">
                                 <FileDown size={14} /> Download Invoice
                               </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                              
                              <div className="space-y-4 lg:col-span-2">
                                
                                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-xl border border-indigo-800 shadow-lg text-white">
                                   <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2"><Cpu size={14}/> What we noticed</h4>
                                   <div className="space-y-2">
                                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-start gap-3">
                                        <Battery size={16} className={`mt-0.5 ${batteryUI.color.replace('text-', 'text-').replace('700','400')}`} />
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Battery Check</p>
                                          <p className="text-sm text-white">It's <span className="font-bold text-indigo-300">{batteryUI.label.toLowerCase()}</span>. {r.batteryHealth && Number(r.batteryHealth) < 40 ? 'We should probably replace this soon.' : 'No need to worry right now.'}</p>
                                        </div>
                                      </div>
                                      {r.jobType === "General Service" && (
                                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-start gap-3">
                                          <Sparkles size={16} className="text-amber-400 mt-0.5" />
                                          <div>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Body Check</p>
                                            <p className="text-sm text-white">Looks like: <span className="font-bold text-amber-300">{damageUI.reason.toLowerCase()}</span>.</p>
                                            <p className="text-xs text-slate-400 mt-1">Our suggestion: {damageUI.action}</p>
                                          </div>
                                        </div>
                                      )}
                                   </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Wrench size={16}/> Mechanic Notes</h4>
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
                                    <p className="text-sm text-slate-400 italic mb-4">Nobody has added any notes yet. Be the first!</p>
                                  )}
                                  <div className="flex gap-2">
                                    <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Type a finding, or status update here..." className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"/>
                                    <button onClick={() => handleAddRemark(r.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shrink-0">
                                      <Plus size={16}/> Save
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Who to contact</h4>
                                  <div className="flex items-center gap-3 text-sm text-slate-700 mb-2"><User size={16} className="text-slate-400 shrink-0"/> <span className="truncate font-medium">{r.fleetOwnerName}</span></div>
                                  <div className="flex items-center gap-3 text-sm text-slate-700 mb-2"><Phone size={16} className="text-slate-400 shrink-0"/> {r.fleetOwnerContact}</div>
                                  <div className="flex items-center gap-3 text-sm text-slate-700"><Mail size={16} className="text-slate-400 shrink-0"/> <span className="truncate">{r.fleetOwnerEmail}</span></div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">What they told us</h4>
                                  <p className="text-sm text-slate-600 italic leading-relaxed">"{r.issueDescription || "Just need a standard checkup today."}"</p>
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
                <tr><td colSpan="4" className="p-12 text-center text-slate-500 text-sm"><Search className="mx-auto text-slate-300 mb-3" size={32} />Couldn't find any vehicles matching that.</td></tr>
              )}
            </tbody>
          </table>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Battery</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${batteryUI.bg} ${batteryUI.color} ${batteryUI.border}`}>
                      {r.batteryHealth ? `${r.batteryHealth}% - ${batteryUI.label}` : 'N/A'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Body Status</p>
                    <span className="text-[10px] font-bold text-slate-700 max-w-[120px] truncate text-right">{damageUI.reason}</span>
                 </div>
              </div>

              <button onClick={() => toggleRow(r.id)} className="w-full mb-2 bg-indigo-50 text-indigo-700 text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2">Open File {expandedRow === r.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>
              
              {expandedRow === r.id && (
                <div className="mb-4 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                   <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <h4 className="text-[10px] font-bold text-indigo-800 uppercase mb-2">Add Note</h4>
                      <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Type a note..." className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 mb-2 focus:outline-none focus:border-indigo-500" />
                      <button onClick={() => handleAddRemark(r.id)} className="w-full bg-indigo-600 text-white text-xs font-bold py-1.5 rounded transition-all">Save Note</button>
                      {r.extraNotes && r.extraNotes.map((note, idx) => (
                        <p key={idx} className="text-[10px] text-slate-600 mt-2 bg-slate-50 p-1.5 rounded border border-slate-100">✔ {note}</p>
                      ))}
                   </div>
                </div>
              )}

              <button onClick={() => downloadIndividualPDF(r)} className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2"><FileDown size={14}/> Download Invoice</button>
            </div>
          )}) : (<div className="col-span-1 md:col-span-2 p-8 text-center text-slate-500 text-sm">Couldn't find any vehicles.</div>)}
        </div>

      </div>
    </div>
  );
}
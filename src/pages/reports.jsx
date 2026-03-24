import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, FileText, Battery, 
  AlertCircle, CheckCircle2, BarChart3, Activity,
  ChevronDown, ChevronUp, Phone, Mail, User, Info, Wrench, FileDown,
  ShieldAlert, ShieldCheck, BellRing, Gauge, Plus, MessageSquare, Sparkles, Cpu,
  Eye, X
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- PREVIEW PANEL COMPONENT ---
function ReportPreviewPanel({ report, onDownload, onClose }) {
  if (!report) return null;

  return (
    <div className="bg-white rounded-3xl border border-red-200 shadow-xl overflow-hidden mb-8 animate-in slide-in-from-top-4">
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-[#22212f] px-6 py-5 text-white relative">
        <button onClick={onClose} className="absolute top-5 right-6 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold bg-white/10 px-3 py-1.5 rounded-lg">
          <X size={16}/> Close
        </button>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-2 md:mt-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">TT XPRESS</p>
            <h3 className="text-2xl font-extrabold mt-1">Vehicle Inspection Report</h3>
            <p className="text-sm text-white/80 mt-1">Workshop intake preview with service summary and generated details</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-4 py-3 text-sm md:mr-24">
            <p><span className="text-white/70">Vehicle:</span> <span className="font-semibold">{report.vehicleNumber}</span></p>
            <p><span className="text-white/70">Job Type:</span> <span className="font-semibold">{report.jobType}</span></p>
            <p><span className="text-white/70">Date:</span> <span className="font-semibold">{report.date}</span></p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-3">Owner & Vehicle Details</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Fleet Owner:</span> {report.fleetOwnerName}</p>
              <p><span className="font-semibold text-slate-900">Contact:</span> {report.fleetOwnerContact}</p>
              <p><span className="font-semibold text-slate-900">Email:</span> {report.fleetOwnerEmail || "N/A"}</p>
              <p><span className="font-semibold text-slate-900">Company:</span> {report.companyName || "N/A"}</p>
              <p><span className="font-semibold text-slate-900">Vehicle Number:</span> {report.vehicleNumber}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Generated Details</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Priority:</span> {report.priority}</p>
              <p><span className="font-semibold text-slate-900">Recommended Bay:</span> {report.recommendedBay}</p>
              <p><span className="font-semibold text-slate-900">Category:</span> {report.intakeCategory}</p>
              <p><span className="font-semibold text-slate-900">Status:</span> {report.reportStatus}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Reported Issue</h4>
          <p className="text-sm leading-7 text-slate-700">{report.issueDescription || "No specific issue reported."}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Inspection Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Battery Health</p>
              <p className="text-base font-bold text-slate-900 mt-2">{report.batteryHealth ? `${report.batteryHealth}%` : "N/A"}</p>
              <p className="text-sm text-slate-600 mt-1">{report.batteryLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Body Analysis</p>
              <p className="text-base font-bold text-slate-900 mt-2">{report.damageReason}</p>
              <p className="text-sm text-slate-600 mt-1">{report.damageAction}</p>
            </div>
          </div>
        </div>

        {report.jobType === "General Service" && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-700 mb-4">General Service Additional Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white border border-red-100 p-4">
                <p className="font-semibold text-slate-900">Exterior Body Condition</p>
                <p className="text-slate-700 mt-1">{report.exteriorCondition || "Not available"}</p>
              </div>
              <div className="rounded-xl bg-white border border-red-100 p-4">
                <p className="font-semibold text-slate-900">Paint Condition</p>
                <p className="text-slate-700 mt-1">{report.paintCondition || "Not available"}</p>
              </div>
              <div className="rounded-xl bg-white border border-red-100 p-4">
                <p className="font-semibold text-slate-900">Battery Observation</p>
                <p className="text-slate-700 mt-1">{report.batteryHealth ? `Battery looks ${Number(report.batteryHealth) >= 75 ? "good" : Number(report.batteryHealth) >= 40 ? "average" : "weak"} with ${report.batteryHealth}% health.` : "Not measured"}</p>
              </div>
              <div className="rounded-xl bg-white border border-red-100 p-4">
                <p className="font-semibold text-slate-900">Tyre Pressure Observation</p>
                <p className="text-slate-700 mt-1">{report.tyreLabel}</p>
              </div>
            </div>
          </div>
        )}

        {report.extraNotes?.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">Mechanic Remarks</h4>
            <div className="space-y-2">
              {report.extraNotes.map((note, idx) => (
                <div key={idx} className="text-sm text-slate-700 bg-white border border-amber-100 rounded-xl p-3">{note}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={() => onDownload(report)} className="inline-flex items-center gap-2 bg-[#22212f] hover:bg-black text-white px-5 py-3 rounded-xl text-sm font-bold transition-all">
            <FileDown size={16} /> Download TT Xpress PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN REPORTS COMPONENT ---
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

  // NEW STATES
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const timer = setInterval(() => setLastSynced(`${Math.floor(Math.random() * 5) + 1} min ago`), 60000);
    return () => clearInterval(timer);
  }, []);

  const getBatteryStatus = (val) => {
    const n = parseInt(val);
    if (isNaN(n)) return { label: "Not Measured", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" };
    if (n >= 75) return { label: "Looking Great", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (n >= 40) return { label: "Needs a Checkup", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Needs Replacement", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
  };

  const getDamageAnalysis = (condition) => {
    if (!condition) return { reason: "Unknown", action: "We'll need to take a look.", color: "text-slate-500", bg: "bg-slate-100" };
    if (condition.includes("Major")) return { reason: "Looks like a collision", action: "Let's get this to the body shop.", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
    if (condition.includes("Minor")) return { reason: "Probably a parking scrape", action: "A quick buff should help.", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { reason: "Normal wear & tear", action: "A standard wash is fine.", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
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

  // TT XPRESS METADATA HELPERS
  const getServiceMeta = (record) => {
    if (record.jobType === "General Service") {
      return { priority: "Detailed Inspection", recommendedBay: "Full Diagnostic Bay", intakeCategory: "Inspection / Repair-Oriented", reportStatus: "Requires Technical Evaluation" };
    }
    return { priority: "Fast Turnaround", recommendedBay: "Express Service Bay", intakeCategory: "Routine / Minor Issue", reportStatus: "Ready for Quick Processing" };
  };

  const buildPreviewData = (record) => {
    const batteryUI = getBatteryStatus(record.batteryHealth);
    const damageUI = getDamageAnalysis(record.exteriorCondition);
    const tyreUI = getTyreStatus(record.tyrePressure);
    const serviceMeta = getServiceMeta(record);
    return { ...record, batteryLabel: batteryUI.label, damageReason: damageUI.reason, damageAction: damageUI.action, tyreLabel: tyreUI.text, ...serviceMeta };
  };

  const handlePreviewReport = (record) => {
    setSelectedReport(buildPreviewData(record));
    setPreviewOpen(true);
    // Scroll to top to see preview
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        issue: Number(r.batteryHealth) < 40 ? `Battery is critically low (${r.batteryHealth}%)` : `Significant body damage reported`,
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

  // --- PDF EXPORTS ---
  const downloadMasterPDF = () => {
    if (filteredRecords.length === 0) { toast("Nothing to print right now!", { icon: '🖨️' }); return; }
    toast.success("Packing up your fleet report... 📄");
    const doc = new jsPDF(); const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(220, 38, 38); doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold'); doc.text("TT XPRESS FLEET SUMMARY", 14, 17);
    
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
      `#${r.id.toString().slice(-5)}`, r.vehicleNumber, 
      r.batteryHealth ? `${r.batteryHealth}% (${getBatteryStatus(r.batteryHealth).label})` : "N/A", 
      getDamageAnalysis(r.exteriorCondition).reason,
      r.extraNotes ? `${r.extraNotes.length} notes added` : "None yet"
    ]);

    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 77, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [220, 38, 38] }, alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save("TT_Xpress_Fleet_Summary.pdf");
  };

  const downloadIndividualPDF = (record) => {
    const report = buildPreviewData(record);
    toast.success(`Generating TT Xpress report for ${record.vehicleNumber}...`);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    const sectionTitle = (text, y) => {
      doc.setFontSize(11);
      doc.setTextColor(220, 38, 38);
      doc.setFont(undefined, "bold");
      doc.text(text, 14, y);
    };

    const labelValue = (label, value, x, y) => {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont(undefined, "normal");
      doc.text(label, x, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont(undefined, "bold");
      doc.text(String(value || "N/A"), x, y + 5);
    };

    // Header
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("TT XPRESS", 14, 13);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("Vehicle Inspection Report", 14, 21);

    doc.setFillColor(34, 33, 47);
    doc.rect(0, 28, pageWidth, 8, "F");
    doc.setFontSize(8);
    doc.text("Workshop Service Workflow Report", 14, 33);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 42, pageWidth - 28, 30, 3, 3, "FD");

    labelValue("Report Ref", `TTX-${record.id.toString().slice(-6)}`, 18, 50);
    labelValue("Vehicle No.", report.vehicleNumber, 70, 50);
    labelValue("Job Type", report.jobType, 120, 50);
    labelValue("Date", report.date.split(',')[0], 165, 50);

    let y = 82;

    sectionTitle("Owner & Vehicle Details", y);
    doc.roundedRect(14, y + 4, pageWidth - 28, 28, 3, 3, "S");
    labelValue("Fleet Owner", report.fleetOwnerName, 18, y + 12);
    labelValue("Contact", report.fleetOwnerContact, 70, y + 12);
    labelValue("Email", report.fleetOwnerEmail || "N/A", 120, y + 12);
    labelValue("Company", report.companyName || "N/A", 18, y + 24);
    y += 42;

    sectionTitle("Generated Service Details", y);
    doc.roundedRect(14, y + 4, pageWidth - 28, 30, 3, 3, "S");
    labelValue("Priority", report.priority, 18, y + 12);
    labelValue("Recommended Bay", report.recommendedBay, 70, y + 12);
    labelValue("Category", report.intakeCategory, 140, y + 12);
    labelValue("Status", report.reportStatus, 18, y + 24);
    y += 44;

    sectionTitle("Inspection Summary", y);
    doc.roundedRect(14, y + 4, pageWidth - 28, 34, 3, 3, "S");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, "normal");
    const issueText = doc.splitTextToSize(report.issueDescription || "No issue description provided.", 176);
    doc.text(issueText, 18, y + 12);
    y += 48;

    sectionTitle("Diagnostic Summary", y);
    autoTable(doc, {
      startY: y + 4,
      theme: "grid",
      head: [["Checkpoint", "Result"]],
      body: [
        ["Battery Health", report.batteryHealth ? `${report.batteryHealth}% - ${report.batteryLabel}` : "Not measured"],
        ["Body Analysis", `${report.damageReason} (${report.damageAction})`],
        ["Paint Condition", report.paintCondition || "Not available"],
        ["Tyre Pressure", report.tyreLabel || "Not available"],
      ],
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    y = doc.lastAutoTable.finalY + 10;

    if (report.jobType === "General Service") {
      sectionTitle("General Service Additional Details", y);
      autoTable(doc, {
        startY: y + 4,
        theme: "grid",
        head: [["Field", "Observation"]],
        body: [
          ["Exterior Body Condition", report.exteriorCondition || "Not available"],
          ["Paint Condition", report.paintCondition || "Not available"],
          ["Battery Observation", report.batteryHealth ? `Battery looks ${Number(report.batteryHealth) >= 75 ? "good" : Number(report.batteryHealth) >= 40 ? "average" : "weak"} with ${report.batteryHealth}% health` : "Not measured"],
          ["Tyre Pressure Observation", report.tyreLabel || "Not available"],
        ],
        headStyles: { fillColor: [34, 33, 47], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { fontSize: 9, cellPadding: 4 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    if (report.extraNotes?.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      sectionTitle("Mechanic Remarks", y);
      const notes = report.extraNotes.map((note) => [`• ${note}`]);
      autoTable(doc, {
        startY: y + 4,
        theme: "plain",
        body: notes,
        styles: { fontSize: 9, cellPadding: 3, textColor: [71, 85, 105] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    doc.setDrawColor(148, 163, 184);
    doc.line(14, 275, 70, 275);
    doc.line(140, 275, 196, 275);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Service Advisor Signature", 14, 281);
    doc.text("Customer Approval", 140, 281);

    doc.save(`TTX_Report_${record.vehicleNumber}.pdf`);
  };

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
            <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={24} />
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
        <button onClick={downloadMasterPDF} className="w-full md:w-auto flex justify-center items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ease-out shadow-lg hover:-translate-y-0.5 active:scale-95">
          <FileDown size={18} /> Print Today's Summary
        </button>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-red-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-100 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><BarChart3 size={18} className="text-red-600 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicles In Shop</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1 sm:mt-2">{analytics.total}</h4>
        </div>
        <div className="bg-gradient-to-br from-white to-red-100/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-200 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><AlertCircle size={18} className="text-red-600 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-widest">Needs Attention</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-red-600 mt-1 sm:mt-2">{analytics.critical}</h4>
        </div>
        <div className="bg-gradient-to-br from-white to-amber-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-sm flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-2 sm:gap-3 mb-2"><Battery size={18} className="text-amber-500 group-hover:scale-110 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Battery</p></div>
          <h4 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1 sm:mt-2">{analytics.avgBattery}%</h4>
        </div>
        <div className="bg-gradient-to-br from-[#22212f] to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute -right-4 -top-4 sm:-right-6 sm:-top-6 text-white/5 group-hover:scale-110 transition-transform duration-500"><Gauge size={100} className="sm:w-32 sm:h-32"/></div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 z-10"><Gauge size={18} className="text-red-500 group-hover:rotate-12 transition-transform"/><p className="text-[10px] sm:text-xs font-bold text-red-200 uppercase tracking-widest">Overall Fleet Health</p></div>
          <div className="flex items-end gap-1.5 sm:gap-2 mt-1 sm:mt-2 z-10">
            <h4 className={`text-3xl sm:text-4xl font-black ${analytics.fleetScore > 80 ? 'text-emerald-400' : analytics.fleetScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>{analytics.fleetScore}</h4>
            <span className="text-slate-400 font-bold mb-1 text-sm">/ 100</span>
          </div>
        </div>
      </div>

      {/* CHARTS & LIVE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><Wrench size={16} className="text-red-600"/> What are we fixing?</h3>
          <div className="h-48 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-start gap-2">
            <Info size={16} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-red-900 font-medium">General Services make up <span className="font-bold">{analytics.generalPercentage}%</span> of total workload.</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={16} className="text-amber-500"/> How do they look?</h3>
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

        <div className="bg-[#22212f] text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><BellRing size={16} className="text-amber-400"/> Action Items</span>
            {activeAlerts.length > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeAlerts.length}</span>}
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
                <button onClick={() => toast.success(`Awesome! Tech dispatched to ${alert.vehicle} 🔧`)} className="w-full mt-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">Assign Technician</button>
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

      {/* --- PREVIEW PANEL --- */}
      {previewOpen && (
        <ReportPreviewPanel 
          report={selectedReport} 
          onDownload={downloadIndividualPDF} 
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* FILTER & TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Sticky Filters */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center shadow-sm">
           <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto hide-scrollbar pb-2 md:pb-0">
             <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">Filter:</span>
             {[{ id: 'All', icon: <Filter size={14}/>, label: 'Everything' }, { id: 'Critical', icon: <ShieldAlert size={14}/>, label: 'Needs Help' }, { id: 'Healthy', icon: <ShieldCheck size={14}/>, label: 'Good to Go' }].map(view => (
               <button key={view.id} onClick={() => setQuickFilter(view.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${quickFilter === view.id ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-red-50'}`}>
                 {view.icon} {view.label}
               </button>
             ))}
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
              <div className="w-full sm:w-64 lg:w-72 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Find a vehicle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 sm:pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all bg-slate-50" />
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 mt-1 absolute right-2 -bottom-4">Found {filteredRecords.length} matches</p>
              </div>
              <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full sm:w-40 lg:w-48 p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:border-red-500">
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
            <div key={r.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${isCrit ? 'border-red-300 shadow-red-100' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{r.vehicleNumber}</h3>
                    {r.extraNotes?.length > 0 && <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><MessageSquare size={10}/> {r.extraNotes.length}</span>}
                  </div>
                  <p className="text-xs text-slate-500">{r.companyName || "Personal"}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${r.jobType === 'Quick Service' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'}`}>{r.jobType}</span>
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

              <button onClick={() => toggleRow(r.id)} className="w-full mb-2 bg-amber-50 text-amber-700 text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2">View Diagnostics {expandedRow === r.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>
              
              {expandedRow === r.id && (
                <div className="mb-4 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                   <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <h4 className="text-[10px] font-bold text-red-800 uppercase mb-2">Add Mechanic Note</h4>
                      <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add note..." className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 mb-2 focus:outline-none focus:border-red-500" />
                      <button onClick={() => handleAddRemark(r.id)} className="w-full bg-red-600 text-white text-xs font-bold py-1.5 rounded transition-all hover:bg-red-700">Save Note</button>
                      {r.extraNotes && r.extraNotes.map((note, idx) => (
                        <p key={idx} className="text-[10px] text-slate-600 mt-2 bg-slate-50 p-1.5 rounded border border-slate-100">✔ {note}</p>
                      ))}
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => handlePreviewReport(r)} className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2">
                  <Eye size={14} /> Preview
                </button>
                <button onClick={() => downloadIndividualPDF(r)} className="w-full bg-[#22212f] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2">
                  <FileDown size={14} /> PDF
                </button>
              </div>
            </div>
          )}) : (<div className="col-span-1 md:col-span-2 p-8 text-center text-slate-500 text-sm">Couldn't find any vehicles.</div>)}
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
                    <tr className={`transition-all duration-300 ease-out cursor-pointer group ${getStatusRowBorder(r)} ${expandedRow === r.id ? 'bg-red-50/30' : 'hover:bg-slate-50'}`} onClick={() => toggleRow(r.id)}>
                      <td className="p-5 pl-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-base group-hover:text-red-600 transition-colors">{r.vehicleNumber}</p>
                          {r.extraNotes?.length > 0 && <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><MessageSquare size={10}/> {r.extraNotes.length}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{r.companyName || "Personal Vehicle"}</p>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${r.jobType === 'Quick Service' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'}`}>
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
                        <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold group-hover:scale-105">
                          {expandedRow === r.id ? <>Close <ChevronUp size={16}/></> : <>Audit <ChevronDown size={16}/></>}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW LOGIC */}
                    {expandedRow === r.id && (
                      <tr>
                        <td colSpan="4" className="p-0 border-b border-red-100">
                          <div className="bg-red-50/20 p-6 lg:p-8 animate-in slide-in-from-top-2 duration-200 shadow-inner">
                            
                            <div className="flex justify-between items-center mb-6">
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200">Record #{r.id.toString().slice(-6)}</span>
                               
                               <div className="flex gap-2">
                                 <button onClick={() => handlePreviewReport(r)} className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm">
                                   <Eye size={14} /> Preview Report
                                 </button>
                                 <button onClick={() => downloadIndividualPDF(r)} className="bg-white border border-red-200 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm">
                                   <FileDown size={14} /> Official PDF
                                 </button>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                              
                              <div className="space-y-4 lg:col-span-2">
                                
                                {/* AUTOMATED DIAGNOSTIC ENGINE PANEL */}
                                <div className="bg-gradient-to-r from-[#22212f] to-slate-900 p-5 rounded-xl border border-slate-800 shadow-lg text-white">
                                   <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Cpu size={14}/> Automated Diagnostic Engine Assessment</h4>
                                   <div className="space-y-2">
                                      <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-start gap-3">
                                        <Battery size={16} className={`mt-0.5 ${batteryUI.color.replace('text-', 'text-').replace('700','400')}`} />
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Power System Analysis</p>
                                          <p className="text-sm text-white">Calculated state: <span className="font-bold text-red-300">{batteryUI.label}</span>. {r.batteryHealth && Number(r.batteryHealth) < 40 ? 'Immediate replacement recommended.' : 'No immediate action required on cells.'}</p>
                                        </div>
                                      </div>
                                      {r.jobType === "General Service" && (
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-start gap-3">
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
                                <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Wrench size={16}/> Mechanic Remarks Log</h4>
                                  {r.extraNotes && r.extraNotes.length > 0 ? (
                                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                      {r.extraNotes.map((note, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-start gap-2">
                                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                          <p className="text-sm text-slate-700 leading-relaxed">{note}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-400 italic mb-4">No post-inspection remarks added yet.</p>
                                  )}
                                  <div className="flex gap-2">
                                    <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add required part, finding, or status update..." className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"/>
                                    <button onClick={() => handleAddRemark(r.id)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shrink-0">
                                      <Plus size={16}/> Save Remark
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-red-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Client Contact</h4>
                                  <div className="flex items-center gap-3 text-sm text-slate-700 mb-2"><User size={16} className="text-slate-400 shrink-0"/> <span className="truncate font-medium">{r.fleetOwnerName}</span></div>
                                  <div className="flex items-center gap-3 text-sm text-slate-700 mb-2"><Phone size={16} className="text-slate-400 shrink-0"/> {r.fleetOwnerContact}</div>
                                  <div className="flex items-center gap-3 text-sm text-slate-700"><Mail size={16} className="text-slate-400 shrink-0"/> <span className="truncate">{r.fleetOwnerEmail}</span></div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-red-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Initial Client Notes</h4>
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

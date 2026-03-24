import { useState } from "react";
import toast from "react-hot-toast";
import { 
  Info, 
  ChevronRight,
  CheckCircle,
  Loader2,
  PlusCircle,
  AlertCircle
} from "lucide-react";

// Helper component for text inputs
const InputGroup = ({ label, name, value, onChange, error, placeholder, description, type = "text" }) => (
  <div className="flex flex-col gap-1.5 mb-5 sm:mb-6">
    <div className="flex items-center gap-2">
      <label className="text-sm font-bold text-slate-800">{label}</label>
      {error && <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertCircle size={14}/> {error}</span>}
    </div>
    <p className="text-xs text-slate-500 mb-1.5 leading-relaxed">{description}</p>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-slate-700 text-sm sm:text-base
          ${error ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                 : "border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50"}`}
      />
    </div>
  </div>
);

export default function ServiceForm({ addRecord }) {
  const [formData, setFormData] = useState({
    vehicleNumber: "", companyName: "", fleetOwnerName: "", 
    fleetOwnerContact: "", fleetOwnerEmail: "", issueDescription: "", 
    jobType: "", exteriorCondition: "", paintCondition: "", 
    batteryHealth: "", tyrePressure: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let err = {};
    if (!formData.vehicleNumber) err.vehicleNumber = "Vehicle registration number is required.";
    if (!formData.jobType) err.jobType = "Please select a service type before submitting.";
    if (!formData.fleetOwnerContact || !/^\d{10}$/.test(formData.fleetOwnerContact)) 
      err.fleetOwnerContact = "Please enter a valid 10-digit mobile number without country codes.";
    
    if (formData.jobType === "General Service") {
      if (!formData.exteriorCondition) err.exteriorCondition = "Please assess the vehicle's body condition.";
      if (!formData.paintCondition) err.paintCondition = "Please select the current paint status.";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);

      setTimeout(() => {
        const newRecord = { ...formData, id: Date.now(), date: new Date().toLocaleString() };
        
        const existingRecords = JSON.parse(localStorage.getItem("fleetRecords") || "[]");
        localStorage.setItem("fleetRecords", JSON.stringify([newRecord, ...existingRecords]));

        if (addRecord) addRecord(newRecord);

        toast.success("Service Request Saved Successfully!");
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
    } else {
      toast.error("Please review the form. Some required fields are missing.");
    }
  };

  const handleReset = () => {
    setFormData({
      vehicleNumber: "", companyName: "", fleetOwnerName: "", 
      fleetOwnerContact: "", fleetOwnerEmail: "", issueDescription: "", 
      jobType: "", exteriorCondition: "", paintCondition: "", 
      batteryHealth: "", tyrePressure: "",
    });
    setErrors({});
    setIsSubmitted(false);
  };

  // ----------------------------------------------------------------------
  // SUCCESS SCREEN UI
  // ----------------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto mt-12 py-12 px-6 bg-white rounded-3xl border border-slate-200 shadow-xl text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Intake Successful!</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          The service request for vehicle <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{formData.vehicleNumber}</span> has been securely saved. You can now track its status in the Reports dashboard.
        </p>
        <button 
          onClick={handleReset}
          className="bg-[#22212f] hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
        >
          <PlusCircle size={20} /> Log Another Vehicle
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // MAIN FORM UI
  // ----------------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* TT Xpress Branded Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-[#22212f] rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-xl shadow-red-200">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-1">TT Xpress Intake</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">New Service Request</h1>
        <p className="opacity-90 text-red-50 text-sm sm:text-base leading-relaxed">
          Welcome to the intake portal. Please fill in the details below accurately. The helper text under each box will guide you.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
        
        {/* STEP 1: VEHICLE IDENTITY */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm sm:text-base mt-1">1</div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Vehicle & Owner Details</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                We need to know exactly which vehicle is being serviced and who to contact.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputGroup 
              label="Vehicle Registration No." name="vehicleNumber" 
              value={formData.vehicleNumber} onChange={handleChange} error={errors.vehicleNumber}
              placeholder="e.g. MH-12-AB-1234" 
              description="Enter the exact letters and numbers on the plate."
            />
            <InputGroup 
              label="Company/Agency Name" name="companyName" 
              value={formData.companyName} onChange={handleChange} error={errors.companyName}
              placeholder="e.g. Acme Logistics" 
              description="Leave blank if personal."
            />
            <InputGroup 
              label="Fleet Owner Name" name="fleetOwnerName" 
              value={formData.fleetOwnerName} onChange={handleChange} error={errors.fleetOwnerName}
              placeholder="e.g. Rajesh Kumar" 
              description="Person responsible for authorization."
            />
            <InputGroup 
              label="Primary Contact Number" name="fleetOwnerContact" 
              value={formData.fleetOwnerContact} onChange={handleChange} error={errors.fleetOwnerContact}
              placeholder="98XXXXXXXX" 
              description="Direct 10-digit mobile number." 
              type="tel"
            />
          </div>
          <InputGroup 
            label="Email Address for Invoices" name="fleetOwnerEmail" 
            value={formData.fleetOwnerEmail} onChange={handleChange} error={errors.fleetOwnerEmail}
            placeholder="manager@company.com" 
            description="We will send the digital PDF service report here." 
            type="email"
          />
        </div>

        {/* STEP 2: SERVICE DETAILS */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-100">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm sm:text-base mt-1">2</div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Service Requirements</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Tell us what kind of work needs to be done.
              </p>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-bold text-slate-800">Choose Service Category</label>
              {errors.jobType && <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertCircle size={14}/> {errors.jobType}</span>}
            </div>
            <p className="text-xs text-slate-500 mb-4">Select the option that best matches your needs today.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { id: "Quick Service", title: "Quick Service (Minor)", desc: "Oil changes, fluid top-ups, filter replacements. (~1-2 hours)" },
                { id: "General Service", title: "General Service (Major)", desc: "Deep diagnostics, part replacements, full body check. (~1-2 days)" }
              ].map(type => (
                <button
                  key={type.id} type="button"
                  onClick={() => handleChange({ target: { name: 'jobType', value: type.id } })}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${
                    formData.jobType === type.id 
                    ? "border-red-500 bg-red-50 shadow-md ring-1 ring-red-500" 
                    : "border-slate-200 hover:border-slate-300 bg-slate-50"
                  }`}
                >
                  <p className={`font-bold text-sm sm:text-base mb-1 ${formData.jobType === type.id ? "text-red-700" : "text-slate-700"}`}>{type.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 block">Detailed Issue Description</label>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Describe the problem. Mention any strange noises, leaks, or warning lights.
            </p>
            <textarea 
              name="issueDescription" rows="5" 
              value={formData.issueDescription} onChange={handleChange} 
              placeholder="e.g., Struggling to start, rattling sound from rear right..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm focus:border-red-500 focus:bg-white transition-all outline-none resize-y"
            />
          </div>
        </div>

        {/* STEP 3: CONDITIONAL CHECKLIST */}
        {formData.jobType === "General Service" && (
          <div className="bg-slate-50 p-5 sm:p-8 rounded-3xl border-2 border-dashed border-red-200 space-y-6 sm:space-y-8 animate-in slide-in-from-top-4 duration-300">
             
             <div className="text-center mb-2">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mandatory Section</span>
                <h3 className="text-lg font-bold text-slate-800 mt-4">Pre-Service Technical Checklist</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                  For a Major General Service, we require a baseline health check of the vehicle before it enters the garage.
                </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-slate-800">Body & Exterior Condition</label>
                      {errors.exteriorCondition && <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertCircle size={14}/> {errors.exteriorCondition}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Are there any visible physical damages?</p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { val: "Good (No Scratches)", label: "Good Condition", sub: "Normal wear and tear, no deep dents." },
                      { val: "Minor Damage", label: "Minor Damage", sub: "Small visible scratches or tiny dents." },
                      { val: "Major Damage/Dents", label: "Major Damage", sub: "Broken parts, cracked glass, or large dents." }
                    ].map(item => (
                      <label key={item.val} className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ${formData.exteriorCondition === item.val ? "bg-red-50 border-red-200" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                        <input type="radio" name="exteriorCondition" value={item.val} checked={formData.exteriorCondition === item.val} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-red-600 text-red-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{item.label}</span>
                          <span className="text-[10px] text-slate-500">{item.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-slate-800">Paint Status</label>
                      {errors.paintCondition && <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertCircle size={14}/> {errors.paintCondition}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Does it require polishing or repainting?</p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { val: "Original Shine", label: "Original Shine", sub: "Paint is intact and glossy." },
                      { val: "Faded/Dull", label: "Faded or Dull", sub: "Sun damage, lost its shine, needs polish." },
                      { val: "Scratched/Peeling", label: "Peeling/Scratched", sub: "Paint is actively chipping off." }
                    ].map(item => (
                      <label key={item.val} className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ${formData.paintCondition === item.val ? "bg-red-50 border-red-200" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                        <input type="radio" name="paintCondition" value={item.val} checked={formData.paintCondition === item.val} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-red-600 text-red-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{item.label}</span>
                          <span className="text-[10px] text-slate-500">{item.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                <InputGroup 
                  label="Battery Health Percentage" name="batteryHealth" 
                  value={formData.batteryHealth} onChange={handleChange} type="number" 
                  placeholder="e.g. 85"
                  description="Check the vehicle's dashboard or provide last known reading." 
                />
                <InputGroup 
                  label="Current Tyre Pressure (PSI)" name="tyrePressure" 
                  value={formData.tyrePressure} onChange={handleChange} 
                  placeholder="e.g. 32"
                  description="Note the current air pressure in the front tyres." 
                />
             </div>
          </div>
        )}

        {/* Dynamic Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-2xl transition-all flex items-center justify-center gap-3 mt-4 active:scale-[0.98]
            ${isSubmitting ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-[#22212f] hover:bg-black hover:-translate-y-1 hover:shadow-slate-400/50"}`}
        >
          {isSubmitting ? (
            <>Processing... <Loader2 size={20} className="animate-spin" /></>
          ) : (
            <>Confirm & Submit Intake Request <ChevronRight size={20} /></>
          )}
        </button>
      </form>
    </div>
  );
}


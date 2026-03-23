import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    companyName: "",
    fleetOwnerName: "",
    fleetOwnerContact: "",
    fleetOwnerEmail: "",
    issueDescription: "",
    jobType: "",
    exteriorCondition: "",
    paintCondition: "",
    batteryHealth: "",
    tyrePressure: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required";
    if (!formData.companyName) newErrors.companyName = "Company name is required";
    if (!formData.fleetOwnerName) newErrors.fleetOwnerName = "Owner name is required";

    if (!formData.fleetOwnerContact) {
      newErrors.fleetOwnerContact = "Contact is required";
    } else if (!/^[0-9]{10}$/.test(formData.fleetOwnerContact)) {
      newErrors.fleetOwnerContact = "Enter a valid 10-digit number";
    }

    if (!formData.fleetOwnerEmail) {
      newErrors.fleetOwnerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.fleetOwnerEmail)) {
      newErrors.fleetOwnerEmail = "Enter a valid email address";
    }

    if (!formData.issueDescription) newErrors.issueDescription = "Description is required";
    if (!formData.jobType) newErrors.jobType = "Please select a job type";

    if (formData.jobType === "General Service") {
      if (!formData.exteriorCondition) newErrors.exteriorCondition = "Required";
      if (!formData.paintCondition) newErrors.paintCondition = "Required";

      if (
        !formData.batteryHealth ||
        formData.batteryHealth < 0 ||
        formData.batteryHealth > 100
      ) {
        newErrors.batteryHealth = "Must be between 0 and 100";
      }

      if (!formData.tyrePressure) newErrors.tyrePressure = "Required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log("Form Data:", formData);
      toast.success("Service request submitted successfully.");
    }
  };

  // Helper component for standard inputs
  const InputField = ({ label, name, type = "text", placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none 
          ${
            errors[name]
              ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
              : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          } text-slate-900 placeholder-slate-400`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      <Toaster position="top-center" />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 w-full max-w-3xl"
      >
        <div className="mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Service Intake Form</h2>
          <p className="text-slate-500 text-sm mt-1">Enter the vehicle and fleet details for processing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Vehicle Number" name="vehicleNumber" placeholder="e.g. MH-12-AB-1234" />
          <InputField label="Company Name" name="companyName" placeholder="e.g. Acme Logistics" />
          <InputField label="Fleet Owner Name" name="fleetOwnerName" placeholder="John Doe" />
          <InputField label="Contact Number" name="fleetOwnerContact" placeholder="10-digit mobile number" />
          <div className="md:col-span-2">
            <InputField label="Email Address" name="fleetOwnerEmail" type="email" placeholder="john@example.com" />
          </div>

          {/* Issue Description */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1.5">Issue Description</label>
            <textarea
              name="issueDescription"
              rows="3"
              placeholder="Describe the vehicle's issues..."
              value={formData.issueDescription}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-sm transition-all outline-none resize-none
                ${
                  errors.issueDescription
                    ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                } text-slate-900`}
            />
            {errors.issueDescription && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.issueDescription}</p>
            )}
          </div>

          {/* Job Type */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none appearance-none bg-white
                ${
                  errors.jobType
                    ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                } text-slate-900`}
            >
              <option value="" disabled>Select a service type</option>
              <option value="Quick Service">Quick Service</option>
              <option value="General Service">General Service</option>
            </select>
            {errors.jobType && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.jobType}</p>}
          </div>

          {/* Conditional General Service Section */}
          {formData.jobType === "General Service" && (
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-6 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="md:col-span-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">General Service Checklist</h3>
              </div>

              {/* Exterior */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-2">Exterior Condition</label>
                <div className="space-y-2">
                  {["Good", "Minor Damage", "Major Damage"].map((val) => (
                    <label key={val} className="flex items-center text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="exteriorCondition"
                        value={val}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500 mr-2"
                      />
                      {val}
                    </label>
                  ))}
                </div>
                {errors.exteriorCondition && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.exteriorCondition}</p>}
              </div>

              {/* Paint */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-2">Paint Condition</label>
                <div className="space-y-2">
                  {["Good", "Faded", "Scratched"].map((val) => (
                    <label key={val} className="flex items-center text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="exteriorCondition" /* Note: Fixed name from original code to 'paintCondition' */
                        name="paintCondition" 
                        value={val}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500 mr-2"
                      />
                      {val}
                    </label>
                  ))}
                </div>
                {errors.paintCondition && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.paintCondition}</p>}
              </div>

              <InputField label="Battery Health (%)" name="batteryHealth" type="number" placeholder="0-100" />
              <InputField label="Tyre Pressure" name="tyrePressure" placeholder="e.g. 32 PSI" />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit Service Request
          </button>
        </div>
      </form>
    </div>
  );
}
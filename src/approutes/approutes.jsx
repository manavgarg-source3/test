import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout";
import ServiceForm from "../pages/serviceForm";
import Reports from "../pages/reports";

const AppRoutes = () => {
  // 1. LIFTED STATE: Load records from localStorage when the app boots up
  const [records, setRecords] = useState(() => {
    try {
      const savedData = localStorage.getItem("fleetRecords");
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Error reading from local storage:", error);
      return [];
    }
  });

  // 2. STATE UPDATER: This function will be passed to the Form
  const addRecord = (newRecord) => {
    setRecords((prevRecords) => [newRecord, ...prevRecords]);
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Pass the addRecord function so the form can send data UP to this file */}
        <Route path="/" element={<ServiceForm addRecord={addRecord} />} />
        
        {/* Pass the records array DOWN to the reports page so it can render the table and charts */}
        <Route path="/reports" element={<Reports records={records} />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
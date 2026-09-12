//temporary for testing
// Dev-only page at /sample: bulk-loads sample_expenses.json through the API
// so there is data to look at. Not part of the normal app flow.

import React from "react";
import axios from "axios";
import sampleExpenses from "./sample_expenses.json";
import { AdminNavBar } from "./AdminNavbar";
// Single button that seeds the sample expenses.
export const AddSampleData = () => {

    // POST every expense from the JSON file, one request at a time.
    const addExpenses = async () => {
        try {
          for (const expense of sampleExpenses) {
            await axios.post("/expense", expense);
          }
          alert("Sample expenses added successfully!");
        } catch (error) {
          console.error("Error adding sample expenses:", error);
          alert("Failed to add sample expenses.");
        }
      };

    
  return (
    <div style={{textAlign:"center",marginTop:"10rem"}}>
        <AdminNavBar></AdminNavBar>
        <h3>AddSampleData</h3>
        <button onClick={()=>addExpenses()}>Add </button>
    </div>
  )
}

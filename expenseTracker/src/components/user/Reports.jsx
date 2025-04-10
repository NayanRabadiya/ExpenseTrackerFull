import React, { useState, useEffect } from "react";
import { Card, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/Reports.css";

export const Reports = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [expensesData, setExpensesData] = useState([]);
  const [budgetData, setBudgetData] = useState();
  const [totalBudget, setTotalBudget] = useState(0);
  const [allYears, setAllYears] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];


  // Load data from localStorage once
  useEffect(() => {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const budgets = JSON.parse(localStorage.getItem("budgets")) || [];
    const categories = JSON.parse(localStorage.getItem("categories")) || [];
    const totalBudget = parseInt(localStorage.getItem("total_Budget")) || 0;


    setExpensesData(expenses);
    setBudgetData(budgets);
    setAllCategories(categories);
    setTotalBudget(totalBudget);

    // Extract unique years from expenses
    const years = [...new Set(expenses.map(expense => expense.date.split("/")[2]))].sort((a, b) => b - a);
    setAllYears(years);

    setIsDataLoaded(true);
  }, []);



  // Process data immediately in render
  const filteredExpenses = expensesData.filter(({ date }) => {
    const [_, month, year] = date.split("/");
    return month == selectedMonth && year == selectedYear;
  });

  // Calculate spending per category
  const categorySpending = {};
  filteredExpenses.map(({ category, amount }) => {
    categorySpending[category.name] = (categorySpending[category.name] || 0) + amount;
  });

  // Map budgets per category
  const budgetMapping = {};
  budgetData?.map(({ categoryName, amount }) => {
    budgetMapping[categoryName] = amount;
  });


  // Prepare table data
  const tableData = allCategories.map(category => ({
    categoryName: category.name,
    spent: categorySpending[category.name] || 0,
    budget: budgetMapping[category.name] || "-",
  }));

  // Calculate total spending
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Prepare chart data
  const chartLabels = Object.keys(categorySpending);
  const chartDataValues = Object.values(categorySpending);

  const pieData = {
    labels: chartLabels,
    datasets: [{
      data: chartDataValues,
      backgroundColor: ["#00897b", "#ff9800", "#f44336", "#3f51b5", "#9c27b0", "#4caf50"]
    }],
  };

  const barData = {
    labels: chartLabels,
    datasets: [{
      label: "Amount Spent",
      data: chartDataValues,
      backgroundColor: "#00897b"
    }],
  };
  const chartOptions = {
    plugins: {
      legend: { position: "bottom" }
    },
    responsive: true
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="page-title">Reports for {months.find(m => m.value === selectedMonth)?.label}, {selectedYear}</h2>
        <div className="filters">
          <FormControl className=" filter">
            <InputLabel>Month</InputLabel>
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {months.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className=" filter">
            <InputLabel>Year</InputLabel>
            <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {allYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      {isDataLoaded ? (
        <div className="reports-grid">
          <Card className="report-card">
            <h3 className="chart-title">Category-wise Spending</h3>
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount Spent</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(({ categoryName, spent, budget }, index) => (
                  <tr key={index}>
                    <td>{categoryName}</td>
                    <td style={{ color: spent > budget ? "red" : "green" }}>₹{spent}</td>
                    <td>{budget === "-" ? "-" : `₹${budget}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="report-card">
            <h3 className="chart-title">Spending Distribution</h3>
            {chartLabels.length ? <Pie data={pieData} options={chartOptions}/> : <p className="no-data">No data available</p>}
          </Card>

          <Card className="report-card">
            <h3 className="chart-title">Spending Breakdown</h3>
            {chartLabels.length ? <Bar data={barData} options={chartOptions}/> : <p className="no-data">No data available</p>}
          </Card>

          <Card className="report-card summary-card">
            <h3 className="chart-title">Summary</h3>
            <p>Total Budget: <strong>₹{totalBudget}</strong></p>
            <p>Total Spent: <strong>₹{totalSpent}</strong></p>

            {totalBudget - totalSpent >= 0 ? <p>Remaining: <strong style={{ color: "green" }}>₹{totalBudget - totalSpent}</strong></p> : <p style={{ color: "red" }}>Over Spent: <strong >₹{totalSpent - totalBudget}</strong></p>}
          </Card>
        </div>) : "Loading.."
      }
    </div >
  );
};

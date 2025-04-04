import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../styles/AdminDashboard.css"; // Import CSS file for styling

export const AdminDashboard = () => {
  // Dummy data for statistics
  const stats = {
    totalUsers: 1245,
    totalExpenses: "$15,320",
    totalBudgets: 850,
    highestCategory: "Shopping",
    avgMonthlyExpense: "$450",
  };

  // Dummy data for Bar Chart (Monthly Expenses)
  const monthlyExpensesData = [
    { month: "Jan", expenses: 500 },
    { month: "Feb", expenses: 700 },
    { month: "Mar", expenses: 450 },
    { month: "Apr", expenses: 900 },
    { month: "May", expenses: 650 },
    { month: "Jun", expenses: 800 },
  ];

  // Dummy data for Pie Chart (Category Breakdown)
  const categoryData = [
    { name: "Food", value: 1200 },
    { name: "Transport", value: 800 },
    { name: "Shopping", value: 500 },
    { name: "Rent", value: 2000 },
    { name: "Utilities", value: 600 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

  return (
    <div className="dashboard-container">
      {/* Dashboard Title */}
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Registered Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Expenses This Month</h3>
          <p>{stats.totalExpenses}</p>
        </div>
        <div className="stat-card">
          <h3>Total Budgets Created</h3>
          <p>{stats.totalBudgets}</p>
        </div>
        <div className="stat-card">
          <h3>Highest Expense Category</h3>
          <p>{stats.highestCategory}</p>
        </div>
        <div className="stat-card">
          <h3>Average Monthly Expense/User</h3>
          <p>{stats.avgMonthlyExpense}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Bar Chart - Monthly Expenses */}
        <div className="chart-card">
          <h3>Monthly Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpensesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expenses" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Expense Breakdown by Category */}
        <div className="chart-card">
          <h3>Expense Breakdown by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};



import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import "../styles/AdminDashboard.css";
import { Card } from "@mui/material";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "chart.js";
Chart.register(ChartDataLabels);


import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export const AdminDashboard = () => {
  const [adminData, setAdminData] = useState({
    noOfUsers: 0,
    totalAmount: 0,
    highestSpendingCategory: "-",
    averageExpensePerUser: 0,
    categoryAmount: {},
  });

  const getAdminData = async () => {
    try {
      const res = await axios.get("/admindata");
      console.log(res.data);
      setAdminData(res.data || {});
    } catch (e) {
      console.error("Error fetching admin data", e);
    }
  };

  useEffect(() => {
    getAdminData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];
  const chartLabels = Object.keys(adminData.categoryAmount || {});
  const chartDataValues = Object.values(adminData.categoryAmount || {});

  const pieData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartDataValues,
        backgroundColor: COLORS,
      },
    ],
  };

  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Categorywise Expenses",
        data: chartDataValues,
        backgroundColor: COLORS,
      },

    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      datalabels: {
        color: "#333",
        anchor: "end",
        align: "end",
        offset: 6,
        font: {
          weight: "bold",
          size: 10,
        },
        formatter: (value) => `₹${value}`,
      },
    },
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        color: "#333",
        font: {
          size: 10,
        },
        formatter: (value) => `₹${value}`,
      },
    },
  };
  

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Registered Users</h3>
          <p>{adminData.noOfUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Expenses This Month</h3>
          <p>{adminData.totalAmount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Highest Expense Category</h3>
          <p>{adminData.highestSpendingCategory || "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Average Monthly Expense/User</h3>
          <p>{Number(adminData.averageExpensePerUser || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="charts-container">
        <Card className="chart-card">
          <h3 className="chart-title">Spending Distribution by Category</h3>
          <div className="chart-wrapper">

          {chartLabels.length ? (
            <Pie data={pieData} options={pieOptions} plugins={ChartDataLabels} />
          ) : (
            <p className="no-data">No data available</p>
          )}
          </div>
        </Card>

        <Card className="chart-card">
          <h3 className="chart-title">Categorywise Spending Trend</h3>
          <div className="chart-wrapper">

          {chartLabels.length ? (
            <Bar data={barData} options={barOptions} plugins={ChartDataLabels} />) : (
              <p className="no-data">No data available</p>
            )}
            </div>
        </Card>
      </div>
    </div>
  );
};

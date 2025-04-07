import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

export const Dashboard = () => {
  const navigate = useNavigate(); 
  const [expenses, setexpenses] = useState([]);
  const [budgets, setbudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState();

  useEffect(() => {
    fetchAllCategories();
    fetchExpenses();
    fetchAllBudgets();
  }, []);


  const fetchAllBudgets = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const response = await axios.get(`/budget/user/${userId}`);
      // Formatting API data
      const formattedBudgets = response.data?.Budget?.map(({ id, category, amount, categoryId }) => ({
        id,
        categoryId,
        categoryName: category.name,
        amount
      }));

      localStorage.setItem("budgets", JSON.stringify(formattedBudgets));
      localStorage.setItem("total_Budget",response.data?.total_Budget );
      
      setbudgets(formattedBudgets);
      setTotalBudget(response.data?.total_Budget);
    } catch (error) {
      console.error("Error fetching budgets:", error.response?.data || error.message);
    }
  }
  const fetchAllCategories = async () => {
    try {
      const res = await axios.get("/categories");
      localStorage.setItem("categories", JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
    }
  }
  const fetchExpenses = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const response = await axios.get(`/expenses/${userId}`);
      localStorage.setItem("expenses", JSON.stringify(response.data));
      setexpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error.response?.data || error.message);
    }
  }



  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter(exp => {
    const [day, month, year] = exp.date.split("/").map(Number);
    return month  == currentMonth && year == currentYear;
  });

  // console.log("Current month Expenses:",currentMonthExpenses);

  currentMonthExpenses.sort((a, b) => {
    const dateA = a.date.split("/").reverse().join("-"); // Convert dd/mm/yyyy → yyyy-mm-dd
    const dateB = b.date.split("/").reverse().join("-");
    return new Date(dateB) - new Date(dateA); // Descending order (latest first)
  });


  // Calculate total budget, expense, and remaining
  const totalExpense = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = totalBudget - totalExpense;


  //  Calculate total spending per category
  const categoryTotals = {};

  currentMonthExpenses.forEach(expense => {
    const categoryName = expense.category.name;
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
  });

  //  Sort categories by total spending (highest first)
  const sortedCategories = Object.entries(categoryTotals).sort(([, amountA], [, amountB]) => amountB - amountA); 

  //  Get the top spending category
  const topCategories = sortedCategories.slice(0, 3); // Get first 3 categories

  // console.log("Sorted Categories:", sortedCategories);
  // console.log("Top 3 Categories:", topCategories);


  const overspendingCategories = budgets
    ?.map(({ categoryName, amount }) => {
      const spent = categoryTotals[categoryName] || 0; // Get total spent for this category
      return spent > amount ? [categoryName, spent, amount] : null; // Store only overspending
    })
    .filter(Boolean);

  // console.log("Overspending Categories:", overspendingCategories);

  return (
    <div className="dashboard-container">
      {/* Dashboard Title */}
      <h1 className="dashboard-title"> Expense Tracker Dashboard</h1>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-card remaining">
          <h3>💰 Remaining Balance</h3>
          {
            remaining ?(remaining >= 0 ? <p>₹{remaining?.toFixed(2)}</p> : <p style={{ color: "red" }}>Over Spend: ₹{Math.abs(remaining)?.toFixed(2)}</p>): <p>₹0.00</p>
          }
        </div>
        <div className="summary-card budget">
          <h3>📈 Total budget</h3>
          <p>₹{totalBudget? totalBudget.toFixed(2): "0.00"}</p>
        </div>
        <div className="summary-card expense">
          <h3>📉 Total Expenses</h3>
          <p>₹{totalExpense? totalExpense.toFixed(2):"0.00"}</p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">

        {/* Overspending Categories */}
        {overspendingCategories?.length > 0 && (
          <div className="overspending-section">
            <h3>⚠️ Overspending Categories</h3>
            
            <table className="trendig-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Spent Amount</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {overspendingCategories.map(([categoryName, spent, budget], index) => (
                  <tr key={index} >
                    <td>{categoryName}</td>
                    <td>₹{spent}</td>
                    <td>₹{budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

        {/* Top Spending Categories */}
        <div className="top-spending-section">
          <h3>📊 Top Spending Categories This Month</h3>
          
          <table className="trendig-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Spent Amount</th>
              </tr>
            </thead>
            <tbody>
            {topCategories?.map(([category, amount], index) => (
              <tr key={index} >
              <td>{category}</td>
              <td>₹{amount}</td>
            </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button onClick={() => navigate("/user/expenses")} className="btn-nav">📜 View All Expenses</button>
        <button onClick={() => navigate("/user/add-expense")} className="btn-nav">➕ Add Expense</button>
        <button onClick={() => navigate("/user/reports")} className="btn-nav">📊 View Reports</button>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>📃 Recent Expenses</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentMonthExpenses.slice(0, 4).map((exp, index) => (
              <tr key={index}>
                <td>{exp.title}</td>
                <td>{exp.amount}</td>
                <td>{exp.category.name}</td>
                <td>{exp.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

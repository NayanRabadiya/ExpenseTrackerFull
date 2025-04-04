import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton,
  Select,
  MenuItem
} from "@mui/material";
import { Edit, Save, Delete } from "@mui/icons-material";
import "../styles/BudgetForm.css";
import axios from "axios";

export const BudgetForm = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();

  const [localBudgets, setLocalBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const [pendingBudgetCategories, setPendingBudgetCategories] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);



  useEffect(() => {
    fetchAllCategories();
    fetchAllBudgets();
  }, []);


  const fetchAllCategories = async () => {
    const categories = localStorage.getItem("categories")
    setAllCategories(categories ? JSON.parse(categories) : []);
  };

  const fetchAllBudgets = async () => {
    const formattedBudgets = localStorage.getItem("budgets")
    setLocalBudgets(formattedBudgets ? JSON.parse(formattedBudgets) : []);
    const totalBudget = localStorage.getItem("total_Budget")
    setTotalBudget(totalBudget ? parseInt(totalBudget) : 0);
  }

  const handleCategorySelection = (categoryId) => {
    const category = allCategories.find(cat => cat._id === categoryId);
    if (category) {
      setPendingBudgetCategories(prev => [...prev, { categoryId: category._id, categoryName: category.name }]);
    }
  };

  const handleBudgetSubmit = async (data) => {

    const userId = localStorage.getItem("userid");
    const newBudgets = pendingBudgetCategories.map(({ categoryId, categoryName }) => ({
      categoryId,
      categoryName,
      userId: userId,
      amount: data[`amount_${categoryId}`],
    }));

    // console.log(localBudgets);

    toast.promise(
      (async () => {
        const savedBudgets = [];

        for (const budget of newBudgets) {
          try {
            const response = await axios.post("/budget", budget);
            budget.id = response.data.id;
            savedBudgets.push(budget);
          } catch (error) {
            throw new Error(`Failed to save budget for ${budget.categoryName}`);
          }
        }

        localStorage.setItem("budgets", JSON.stringify([...localBudgets, ...savedBudgets]));
        setLocalBudgets((prev) => [...prev, ...savedBudgets]);

        const addedAmount = parseInt(savedBudgets.reduce((total, budget) => total + budget.amount, 0));
        localStorage.setItem("total_Budget", totalBudget + addedAmount);
        setTotalBudget(totalBudget + addedAmount);
        setPendingBudgetCategories([]);
      })(),
      {
        pending: "Saving budget... ",
        success: "Budget saved successfully! ",
        error: "Failed to save budget. ",
      }
    );
  };



  //still not ready
  const handleSaveEdit = (id) => {
    // if (editingBudget == null) return;
    setLocalBudgets(localBudgets.map(budget =>
      budget.categoryId == editingBudget.categoryId ? { ...budget, amount: editingBudget.amount } : budget
    ));


    //api logic for edit in database here


    setEditingBudget(null);
    toast.success("Budget updated!");
  };

  const handleDelete = async (id, categoryName, categoryId, amount) => {
    try {
      const response = await axios.delete(`/budget/${id}`);
      if (response.status == 200) {

        const afterDelete = localBudgets.filter(budget => budget.categoryId !== categoryId);
        setLocalBudgets(afterDelete);
        localStorage.setItem("budgets", JSON.stringify(afterDelete));

        const newTotalBudget = totalBudget - amount;
        setTotalBudget(newTotalBudget);
        localStorage.setItem("total_Budget", newTotalBudget);
        toast.error(`Deleted budget for category: ${categoryName}`)
      }
    } catch (error) {
      toast.warn("Failed to delete budget. Please try again.");
    }
  };

  return (
    <div className="budget-container">
      <div className="budget-card">
        <h2 className="title">📊 Set Your Monthly Budget</h2>

        {localBudgets.length == 0 ? (
          <div className="empty-state">
            <div className="empty-title">No Budgets Set Yet</div>
            <div className="empty-message">
              Start by selecting a category and entering an amount to track your spending effectively.
            </div>
          </div>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Amount </strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {localBudgets?.map(({ id, categoryId, categoryName, amount }) => (
                    <TableRow key={id}>
                      <TableCell style={{ fontWeight: "bold" }}>{categoryName}</TableCell>
                      <TableCell style={{ width: "10rem", fontWeight: "bold" }}>
                        {editingBudget?.categoryId == categoryId ? (
                          <input className="edit-input" type="number" value={editingBudget.amount}
                            onChange={(e) => setEditingBudget(prev => ({ ...prev, amount: e.target.value }))} />
                        ) : (
                          `₹${amount}`
                        )}
                      </TableCell>
                      {editingBudget?.categoryId === categoryId ? (
                        <TableCell>
                          <IconButton onClick={() => { handleSaveEdit(id) }} color="success">
                            <Save />
                          </IconButton>
                        </TableCell>
                      ) : (
                        <TableCell>

                          <IconButton onClick={() => setEditingBudget({ id, categoryId, amount })} color="primary">
                            <Edit />
                            <IconButton onClick={() => handleDelete(id, categoryName, categoryId, amount)} color="error"><Delete /></IconButton>
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}


                </TableBody>
              </Table>
            </TableContainer>
            <div className="total-budget-card">
              <h3>Total Budget</h3>
              <p>₹{totalBudget}</p>
            </div>
          </>
        )}

        <div className="info-card">
          <div className="info-title">How to Set a Budget?</div>
          <p className="info-text">
            Start by selecting a category and entering your budget amount. Click "Save Budget" to add it to your list. You can always edit or delete a budget when needed.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleBudgetSubmit)} className="budget-form">
          <div className="budget-inputs">
            {pendingBudgetCategories.map(({ categoryId, categoryName }) => (
              <div key={categoryId} className="budget-input-row">
                <span className="category-label">{categoryName}:</span>
                <input type="number" className={errors[`amount_${categoryId}`] ? "input-error" : ""}
                  placeholder="₹ Budget Amount" {...register(`amount_${categoryId}`, { required: "Amount is required", min: 0 })} />
                <span className="error-message">{errors[`amount_${categoryId}`]?.message}</span>
              </div>
            ))}
          </div>

          {localBudgets.length + pendingBudgetCategories.length < allCategories?.length && (
            <div className="category-selector">
              <label htmlFor="category">Select Category:</label>
              <Select value="" onChange={(e) => handleCategorySelection(e.target.value)} displayEmpty>
                <MenuItem value="" disabled>Choose a category</MenuItem>
                {allCategories
                  .filter(cat => {
                    const isNotInLocalBudgets = !localBudgets.some(budget => budget.categoryId === cat._id);
                    const isNotInPendingBudgets = !pendingBudgetCategories.some(sel => sel.categoryId === cat._id);
                    return isNotInLocalBudgets && isNotInPendingBudgets;
                  })
                  .map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
              </Select>
            </div>
          )}

          {pendingBudgetCategories.length > 0 && (
            <button type="submit" className="submit-btn">
              Save Budget
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

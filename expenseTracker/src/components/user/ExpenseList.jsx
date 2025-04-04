import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, MenuItem, Select, InputLabel, FormControl, IconButton, TablePagination,
  Input,
  TextareaAutosize,
  Pagination
} from "@mui/material";
import "../styles/ExpenseList.css";
import axios from "axios";
import { toast } from "react-toastify";
import { ConfirmToast } from "../common/ConfirmToast";
import { useNavigate } from "react-router-dom";
import { Edit, Save, Delete, TextFields, Numbers, Label } from "@mui/icons-material";
import { set } from "react-hook-form";


export const ExpenseList = () => {

  const navigate = useNavigate();
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingExpense, setEditingExpense] = useState(null);


  const [categories, setCategories] = useState([]);
  const [expensesData, setExpensesData] = useState([]);

  useEffect(() => {
    getCategories();
    fetchExpenses();
  }, []);

  const ddmmyyyyToDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };


  const toDDMMYYYY = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const toYYYYMMDD = (date) => {
    if (!(date instanceof Date)) return "";

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    let filtered = [...expensesData];
    if (dateRange.start) filtered = filtered.filter(expense => ddmmyyyyToDate(expense.date) >= ddmmyyyyToDate(dateRange.start));
    if (dateRange.end) filtered = filtered.filter(expense => ddmmyyyyToDate(expense.date) <= ddmmyyyyToDate(dateRange.end));
    if (amountRange.min) filtered = filtered.filter(expense => expense.amount >= amountRange.min);
    if (amountRange.max) filtered = filtered.filter(expense => expense.amount <= amountRange.max);
    if (selectedCategories.length > 0) filtered = filtered.filter(expense => selectedCategories.includes(expense.category.name));

    filtered.sort((a, b) => ddmmyyyyToDate(b.date) - ddmmyyyyToDate(a.date));
    setFilteredExpenses(filtered);

    if ((page - 1) * rowsPerPage >= filtered.length) {
      setPage(1);
    }

  }, [dateRange, amountRange, selectedCategories, expensesData]);

  useEffect(() => {
    setPage(prev => Math.min(prev, Math.max(1, Math.ceil(filteredExpenses.length / rowsPerPage))));
  }, [filteredExpenses, rowsPerPage]);

  const getCategories = async () => {
    const categoriesData = localStorage.getItem("categories");
    setCategories(categoriesData ? JSON.parse(categoriesData) : []);
  }

  const fetchExpenses = async () => {
    try {
      const cachedExpenses = localStorage.getItem("expenses");
      setExpensesData(cachedExpenses ? JSON.parse(cachedExpenses) : []);

      const userId = localStorage.getItem("userid");
      const response = await axios.get(`/expenses/${userId}`);
      if (response.status == 200) {
        localStorage.setItem("expenses", JSON.stringify(response.data));
        setExpensesData(response.data);
      }

    } catch (error) {
      setExpensesData([]);
      localStorage.removeItem("expenses");
      console.log("Error fetching expenses:", error.response?.data || error.message);
    }
  };




  // const handleDeleteExpense = async (expenseId) => {
  //   ConfirmToast("Are you sure you want to delete this expense?", async () => {
  //     const backupExpenses = [...filteredExpenses];
  //     const updatedExpenses = filteredExpenses.filter(expense => expense._id !== expenseId);
  //     setFilteredExpenses(updatedExpenses);
  //     setExpensesData(prev => prev.filter(expense => expense._id !== expenseId));

  //     const totalPages = Math.ceil(updatedExpenses.length / rowsPerPage);
  //     setPage(prevPage => (prevPage >= totalPages ? Math.max(0, totalPages - 1) : prevPage));

  //     toast.promise(
  //       axios.delete(`/expense/${expenseId}`).then((res) => {
  //         if (res.status === 200) {
  //           return "Expense deleted successfully! 🗑️";
  //         } else {
  //           throw new Error("Unexpected response status");
  //         }
  //       }),
  //       {
  //         pending: "Deleting expense...",
  //         success: "Expense deleted successfully! 🗑️",
  //         error: {
  //           render({ data }) {
  //             return data.response?.data?.message || "Failed to delete expense. Please try again.";
  //           },
  //         },
  //       }
  //     ).catch((error) => {
  //       console.error("Error deleting expense:", error.response?.data || error.message);
  //       setFilteredExpenses(backupExpenses);
  //       setExpensesData(backupExpenses);
  //     });
  //   });
  // };
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    const backupExpenses = [...filteredExpenses];
    const updatedExpenses = filteredExpenses.filter(expense => expense._id !== expenseId);
    setFilteredExpenses(updatedExpenses);
    setExpensesData(prev => prev.filter(expense => expense._id !== expenseId));

    const totalPages = Math.ceil(updatedExpenses.length / rowsPerPage);
    setPage(prevPage => (prevPage >= totalPages ? Math.max(1, totalPages) : prevPage));

    try {
      await axios.delete(`/expense/${expenseId}`);
    } catch (error) {
      console.log("Error deleting expense:", error.response?.data || error.message);
      setFilteredExpenses(backupExpenses);
      setExpensesData(prev => [...prev, backupExpenses.find(expense => expense._id === expenseId)]);
    }
  };

  const handleSaveEdit = async (expenseId) => {
    if (editingExpense == null) return

    console.log("editingExpense", editingExpense);

    //api logic for edit in database here
    setEditingExpense(null);
  }


  return (
    <div className="expense-list-wrapper">
      <div className="expense-list-container">
        <h2 className="page-title">Expense List</h2>

        <div className="filter-container">
          <TextField label="Start Date" type="date" className="filter-input" InputLabelProps={{ shrink: true }}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
          <TextField label="End Date" type="date" className="filter-input" InputLabelProps={{ shrink: true }}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
          <TextField label="Min Amount" type="number" className="filter-input"
            onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })} />
          <TextField label="Max Amount" type="number" className="filter-input"
            onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })} />
          <FormControl className="filter-input">
            <InputLabel>Category</InputLabel>
            <Select multiple value={selectedCategories} onChange={(e) => setSelectedCategories(e.target.value)}>
              {categories?.map((category) => (
                <MenuItem key={category._id} value={category.name}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <button className="add-expense-btn" onClick={() => navigate("/user/add-expense")}>
            + Add Expense
          </button>
        </div>

        {filteredExpenses.length == 0 ? (
          <div className="no-expense-message">
            <h3>No expenses found for Your selection or no expenses added yet</h3>
            <p>Start tracking your expenses by adding a new one!</p>
          </div>) :
          (<div className="expenseData">
            <TableContainer component={Paper} className="table-container">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date (dd/mm/yyyy)</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses?.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage).map((expense) => (
                    editingExpense?._id == expense._id ? (
                      <TableRow key={expense._id} className={editingExpense?._id === expense._id ? "editing-row" : ""}>
                        <TableCell>
                          <TextField label="Date" type="date" value={toYYYYMMDD(ddmmyyyyToDate(editingExpense.date))} className="editing-input"
                            onChange={(e) => setEditingExpense({ ...editingExpense, date: toDDMMYYYY(e.target.value) })} />
                        </TableCell>

                        <TableCell>
                          <TextareaAutosize type="text" value={editingExpense.title} className="editing-input textarea"
                            onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })} />
                        </TableCell>

                        <TableCell>
                          <TextField label="Amount" type="number" value={editingExpense.amount} className="editing-input"
                            onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })} />
                        </TableCell>

                        <TableCell>
                          <FormControl>

                            <InputLabel>Category</InputLabel>
                            <Select
                              className="editing-select"
                              value={editingExpense.categoryId}
                              onChange={(e) =>
                                setEditingExpense((prev) => ({
                                  ...prev, categoryId: e.target.value,
                                  category: { name: categories.find(cat => cat._id == e.target.value)?.name },
                                }))
                              }
                            >
                              {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                  {category.name}
                                </MenuItem>
                              ))}

                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell style={{ maxWidth: "1rem" }}>
                          <TextareaAutosize type="text" value={editingExpense.description} className="editing-input textarea"
                            onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })} />
                        </TableCell>

                        <TableCell>
                          <IconButton onClick={() => { handleSaveEdit(expense._id) }} color="success">
                            <Save />
                          </IconButton>
                          {/* <IconButton onClick={() => handleDeleteExpense(expense._id)}><Delete color="error" /></IconButton> */}
                        </TableCell>

                      </TableRow>
                    ) : (
                      <TableRow key={expense._id}>
                        <TableCell style={{ width: "10%" }}>{expense.date}</TableCell>
                        <TableCell style={{ width: "20%" }}>{expense.title}</TableCell>
                        <TableCell style={{ width: "10%" }}>{expense.amount}</TableCell>
                        <TableCell style={{ width: "10%" }}>{expense.category.name}</TableCell>
                        <TableCell style={{ width: "35%" }}>{expense.description}</TableCell>
                        <TableCell style={{ width: "15%" }}>
                          <IconButton onClick={() => setEditingExpense(expense)} color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteExpense(expense._id)}><Delete color="error" /></IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* <TablePagination component="div" count={filteredExpenses.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(event, newPage) => { setPage(newPage) }} rowsPerPageOptions={[4, 5, 7, 8, 10, 12, 15]} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} /> */}
            <div style={{ display: "flex", justifyContent: "right", alignItems:"center" , margin:"1rem"}} className = "pagination">
              {/* <TextField type="number" label="rows per page" value={rowsPerPage}  ></TextField> */}
              <FormControl style={{width:"10%"}}>

                <InputLabel>rows per page</InputLabel>
                <Select value={rowsPerPage} onChange={(event) => { setRowsPerPage(parseInt(event.target.value)) }} InputLabelProps={{ shrink: true }}>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="6">6</MenuItem>
                  <MenuItem value="8">8</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="12">12</MenuItem>
                </Select>
              </FormControl>
              <Pagination count={Math.ceil(filteredExpenses.length / rowsPerPage)} page={page} onChange={(event, newPage) => { setPage(newPage) }} rowsPerPageOptions={[4, 5, 7, 8, 10, 12, 15]} color="primary" />
            </div>
          </div>
          )}

      </div>
    </div>
  );
};
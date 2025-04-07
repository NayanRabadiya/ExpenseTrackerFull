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
import { Edit, Save, Delete, TextFields, Numbers, Label, Cancel } from "@mui/icons-material";
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
  const [editingId, setEditingId] = useState(null);


  const [categories, setCategories] = useState([]);
  const [expensesData, setExpensesData] = useState([]);

  useEffect(() => {
    getCategories();
    fetchExpenses();
  }, []);

  const toDate = (date) => {
    if (date instanceof Date) return date;

    if (typeof date !== "string") return null;

    // Normalize delimiters
    const parts = date.includes("/") ? date.split("/") : date.includes("-") ? date.split("-") : [];

    if (parts.length == 3) {
      let day, month, year;

      if (date.includes("/")) {
        [day, month, year] = parts;
      } else if (date.includes("-")) {
        // If format is yyyy-mm-dd
        if (parts[0].length == 4) {
          [year, month, day] = parts;
        } else {
          [day, month, year] = parts;
        }
      }

      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return null;
  };


  const toDDMMYYYY = (date) => {

    const parsed = toDate(date);
    if (!(parsed instanceof Date) || isNaN(parsed)) return "";
    return `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${parsed.getFullYear()}`;
  };

  const toYYYYMMDD = (date) => {
    const parsed = toDate(date);
    if (!(parsed instanceof Date) || isNaN(parsed)) return "";

    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  };


  useEffect(() => {
    let filtered = [...expensesData];
    if (dateRange.start) filtered = filtered.filter(expense => toDate(expense.date) >= toDate(dateRange.start));
    if (dateRange.end) filtered = filtered.filter(expense => toDate(expense.date) <= toDate(dateRange.end));
    if (amountRange.min) filtered = filtered.filter(expense => expense.amount >= parseFloat(amountRange.min));
    if (amountRange.max) filtered = filtered.filter(expense => expense.amount <= parseFloat(amountRange.max));
    if (selectedCategories.length > 0) filtered = filtered.filter(expense => selectedCategories.includes(expense.category.name));

    filtered.sort((a, b) => toDate(b.date) - toDate(a.date));
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

  const handleEditing = (expense) => {
    setEditingExpense(expense);
    setEditingId(expense._id);
  }

  const handleClose = ()=>{
    setEditingExpense(null);
    setEditingId(null);
  }



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


    const updated = {
      amount: editingExpense.amount,
      date: editingExpense.date,
      description: editingExpense.description,
      title: editingExpense.title,
      categoryId: editingExpense.categoryId,
      userId: editingExpense.userId
    }

    console.log("updated", updated);



    try {
      // console.log("....data",data);
      const response = await toast.promise(
        axios.put(`/expense/${expenseId}`, updated),
        {
          pending: "Updating expense...",
          success: "Expense updated successfully! 🎉",
          error: "Failed to update expense! Please try again.",
        }
      )

      // console.log("res",response.data);



      setExpensesData(prev =>
        prev.map(exp =>
          exp._id === expenseId
            ? { ...exp, ...response.data } // Merge carefully
            : exp
        )
      );


      const updatedList = expensesData.map(exp =>
        exp._id == expenseId ? response.data : exp
      )

      localStorage.setItem("expenses", JSON.stringify(updatedList));
      setEditingExpense(null);
      setEditingId(null);

    } catch (error) {
      console.error("Error saving expense:", error);
      setEditingExpense(null);
      setEditingId(null);

    }
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
                  {filteredExpenses?.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage).map((expense) => {

                    return editingId === expense._id ? (
                      <TableRow key={expense._id} className="editing-row">
                        <TableCell>
                          <TextField
                            label="Date"
                            type="date"
                            value={toYYYYMMDD(editingExpense?.date)}
                            className="editing-input"
                            onChange={(e) =>
                              setEditingExpense({
                                ...editingExpense,
                                date: toDDMMYYYY(e.target.value),
                              })
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <TextareaAutosize
                            value={editingExpense?.title}
                            className="editing-input textarea"
                            onChange={(e) =>
                              setEditingExpense({ ...editingExpense, title: e.target.value })
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            label="Amount"
                            type="number"
                            value={editingExpense?.amount}
                            className="editing-input"
                            onChange={(e) =>
                              setEditingExpense({ ...editingExpense, amount: e.target.value })
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <FormControl>
                            <InputLabel>Category</InputLabel>
                            <Select
                              className="editing-select"
                              value={editingExpense?.categoryId}
                              onChange={(e) =>
                                setEditingExpense((prev) => ({
                                  ...prev,
                                  categoryId: e.target.value,
                                  category: {
                                    name: categories.find((cat) => cat._id === e.target.value)
                                      ?.name,
                                  },
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
                          <TextareaAutosize
                            value={editingExpense?.description}
                            className="editing-input textarea"
                            onChange={(e) =>
                              setEditingExpense({
                                ...editingExpense,
                                description: e.target.value,
                              })
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <IconButton onClick={() => handleSaveEdit(expense._id)} color="success">
                            <Save />
                          </IconButton>
                          <IconButton onClick={() => handleClose()} color="warning">
                            <Cancel />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={expense._id}>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>{expense.title}</TableCell>
                        <TableCell>{expense.amount}</TableCell>
                        <TableCell>{expense.category.name}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditing(expense)} color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteExpense(expense._id)}>
                            <Delete color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                </TableBody>
              </Table>
            </TableContainer>

            {/* <TablePagination component="div" count={filteredExpenses.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(event, newPage) => { setPage(newPage) }} rowsPerPageOptions={[4, 5, 7, 8, 10, 12, 15]} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} /> */}
            <div style={{ display: "flex", justifyContent: "right", alignItems: "center", margin: "1rem" }} className="pagination">
              {/* <TextField type="number" label="rows per page" value={rowsPerPage}  ></TextField> */}
              <FormControl style={{ width: "10%" }}>

                <InputLabel>rows per page</InputLabel>
                <Select value={rowsPerPage} onChange={(event) => { setRowsPerPage(parseInt(event.target.value)) }} >
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="6">6</MenuItem>
                  <MenuItem value="8">8</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="12">12</MenuItem>
                </Select>
              </FormControl>
              <Pagination count={Math.ceil(filteredExpenses.length / rowsPerPage)} page={page} onChange={(event, newPage) => { setPage(newPage) }} color="primary" />
            </div>
          </div>
          )}

      </div>
    </div>
  );
};
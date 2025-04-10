import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, useScrollTrigger, } from "@mui/material";
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";
import "../styles/categorymanager.css";
import axios from "axios";
import { toast } from "react-toastify";
import { ConfirmToast } from "../common/ConfirmToast";

export const CategoryManager = () => {

  const [categories, setcategories] = useState()
  const [newCategory, setnewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState(null);


  useEffect(() => {
    fetchCategories();
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/categories");
      console.log(response.data);
      setcategories(response.data);
    }
    catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  const handleAddCategory = async () => {
    console.log(newCategory)

    if (newCategory == "") return

    try {
      const res = await toast.promise(
        axios.post("/category", { name: newCategory }), {
        pending: "Adding category... ",
        success: "Category added successfully! ",
        error: "Failed to add category! Please try again.",
      }
      )
      fetchCategories();
    } catch (e) {
      console.error(e);
    } finally {
      setnewCategory("");
    }

  }

  const handleSaveEditingCategory = async () => {
    try {
      await toast.promise(
        axios.put(`/category/${editingCategory._id}`, editingCategory), {
        pending: "Updating category... ",
        success: "Category Updated Successfully",
        error: "failed to update category! please try again"
      }
      )
      fetchCategories();

    } catch (e) {
      console.error(e);
    } finally {
      setEditingCategory(null);
    }
  }


  const handleDeleteCategory = async (id) => {
    if(! await ConfirmToast("Are you sure you want to delete this Category?")) return

    try {
      await toast.promise(
        axios.delete(`/category/${id}`), {
        pending: "Deleting category... ",
        success: "Category added successfully! 🎉",
        error: "Failed to add category! Please try again.",
      }
      )
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="category-wrapper">

      <div className="category-container">
        <h2 className="page-title">
          Category Management
        </h2>

        {/* Add New Category (UI Only) */}
        <div className="add-category-container">
          <TextField
            value={newCategory}
            label="New Category"
            variant="outlined"
            fullWidth
            className="category-input"
            onChange={(e) => { setnewCategory(e.target.value) }} />

          <button className="add-category-btn" onClick={handleAddCategory}>+ Add Category</button>
        </div>
        {!categories || categories.length == 0 ? (
          <div style={{ textAlign: "center" }}>
            <h3>No categories found </h3>
          </div>)
          : <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow className="table-header">
                  <TableCell>Category Name</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {categories && categories.length == 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => {
                    return editingCategory?._id == category._id ? (
                      <TableRow key={category._id} className="editing-row">
                        {/* <TableCell>{category.name}</TableCell>
                         */}

                        <TableCell>
                          <TextField
                            label="Name"
                            type="text"
                            value={editingCategory.name}
                            className="editing-input"
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, name: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell align="center" className="actions">
                          <IconButton color="success" onClick={handleSaveEditingCategory} >
                            <Save />
                          </IconButton>
                          <IconButton color="warning" onClick={() => setEditingCategory(null)}>
                            <Cancel />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={category._id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell align="center" className="actions">
                          <IconButton color="primary" onClick={() => { setEditingCategory(category) }}>
                            <Edit />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteCategory(category._id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )

                  }
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>}

      </div>
    </div>

  );
};

import React from "react";
import { Container, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import "../styles/categorymanager.css";

export const CategoryManager = () => {
  // Dummy Categories Data (Static for UI)
  const categories = [
    { _id: 1, name: "Food & Dining" },
    { _id: 2, name: "Transportation" },
    { _id: 3, name: "Utilities" },
    { _id: 4, name: "Entertainment" },
    { _id: 5, name: "Health & Fitness" },
  ];

  return (
    <div className="category-wrapper">

      <div className="category-container">
        <h2 className="page-title">
          Category Management
        </h2>

        {/* Add New Category (UI Only) */}
        <div className="add-category-container">
          <TextField
            label="New Category"
            variant="outlined"
            fullWidth
            className="category-input"
          // Disabled since functionality isn't implemented
          />

          <button className="add-category-btn">+ Add Category</button>
        </div>

        {/* Categories Table */}
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell>Category Name</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="center" className="actions">
                    <IconButton color="primary" >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length == 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>

  );
};

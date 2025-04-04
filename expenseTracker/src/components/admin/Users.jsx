import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination";
import "../styles/users.css"
export const Users = () => {
  // Dummy User Data
  const dummyUsers = [
    { _id: 1, name: "John Doe", email: "john@example.com", role: { name: "Admin" }, },
    { _id: 2, name: "Jane Smith", email: "jane@example.com", role: { name: "User" }, },
    { _id: 3, name: "Alice Johnson", email: "alice@example.com", role: { name: "User" }, },
    { _id: 4, name: "Robert Brown", email: "robert@example.com", role: { name: "User" }, },
    { _id: 5, name: "David Wilson", email: "david@example.com", role: { name: "Admin" }, },
    { _id: 6, name: "John Doe", email: "john@example.com", role: { name: "Admin" }, },
    { _id: 7, name: "Jane Smith", email: "jane@example.com", role: { name: "User" }, },
    { _id: 8, name: "Alice Johnson", email: "alice@example.com", role: { name: "User" }, },
    { _id: 9, name: "Robert Brown", email: "robert@example.com", role: { name: "User" }, },
    { _id: 10, name: "David Wilson", email: "david@example.com", role: { name: "Admin" }, },
  ];

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 3;

  // Filter users based on search and role
  const filteredUsers = dummyUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) &&
      (role === "" || user.role.name === role)
  );

  // Pagination Logic
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div className="users-wrapper">
      <div maxWidth="md" className="users-container">

        <h2 className="page-title">
          User Management
        </h2>

        {/* Search & Filter Section */}
        <div className="filter-container">
          <TextField
            label="Search User"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
          <FormControl fullWidth className="filter-input">
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Users Table */}
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell align="center" className="actions">
                    <IconButton color="primary">
                      <Edit />
                    </IconButton>

                    <IconButton color="error" >
                      
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length == 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <div className="pagination-container">
          <Pagination count={Math.ceil(filteredUsers.length / rowsPerPage)} page={page} onChange={handleChangePage} color="primary" />
        </div>
      </div>
    </div>

  );
};



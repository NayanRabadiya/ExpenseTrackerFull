import React, { useEffect, useState } from "react";
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
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination";
import "../styles/users.css"
import axios from "axios";
import { set } from "react-hook-form";
import { toast } from "react-toastify";
import { ConfirmToast } from "../common/ConfirmToast";
export const Users = () => {
  // Dummy User Data
  const usersk = [
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
  const [roles, setroles] = useState([]);
  const [users, setusers] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [editingUser, seteditingUser] = useState(null);
  const [filteredUsers, setfilteredUsers] = useState([]);
  
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  
  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);
  const fetchRoles = async () => {
    try {
      const response = await axios.get("/roles");
      console.log(response.data);
      setroles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users");
      console.log(response.data);
      setusers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }






  const handleSaveEditingUser = async () => {
    try {
      console.log("editingUser", editingUser);

      const res = await toast.promise(
        axios.put(`/user/role/${editingUser._id}`, editingUser), {
        pending: "Updating user... ",
        success: "User updated successfully! 🎉",
        error: "Failed to update user! Please try again.",
      }
      )

      console.log("res", res.data);

      const updatedUser = { ...res.data };
      console.log("updatedUser", updatedUser);

      setusers((prevUsers) =>
        prevUsers.map((user) =>
          user._id == updatedUser.id ? { ...user, "roleId": updatedUser.roleId, "role": updatedUser.role } : user
        )
      );

    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      seteditingUser(null);
    }

  };

  const handleDeleteUser = async (userId) => {
    if(! await ConfirmToast("Are you sure you want to delete this user?")) return
      try {
        await toast.promise(
          axios.delete(`/user/${userId}`), {
          pending: "Deleting user... ",
          success: "User deleted successfully! 🎉",
        })
        setusers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      }
      catch (error) {
        console.error("Error deleting user:", error);
      }
  }

  useEffect(() => {
    const loggedInUserId = localStorage.getItem("userid");
    // Filter users based on search and role
    setfilteredUsers(
      users.filter(
        (user) =>
          user._id != loggedInUserId &&
          (user.name.toLowerCase().includes(search.toLowerCase())
            || user.email.toLowerCase().includes(search.toLowerCase())
            || user.contact.toLowerCase().includes(search.toLowerCase())) &&
          (selectedRoleId == "" || user.roleId == selectedRoleId)
      ))

      setPage(1);
  }, [users, search, selectedRoleId]);
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
            <Select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
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
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((user) => {

                return editingUser?._id === user._id ? (
                  <TableRow key={user._id} className="editing-row">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contact}</TableCell>
                    <TableCell>
                      <Select
                        value={editingUser.roleId}
                        onChange={(e) => seteditingUser(
                          {
                            ...editingUser,
                            roleId: e.target.value,
                            role: { "name": roles.find((role) => role._id === e.target.value).name }
                          })}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="center" className="actions">

                      <IconButton color="success" onClick={handleSaveEditingUser}>
                        <Save />
                      </IconButton>

                      <IconButton color="warning" onClick={() => seteditingUser(null)}>
                        <Cancel />
                      </IconButton>

                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contact}</TableCell>
                    <TableCell>{user.role.name}</TableCell>
                    <TableCell align="center" className="actions">

                      <IconButton color="primary" onClick={() => seteditingUser(user)}>
                        <Edit />
                      </IconButton>

                      <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>)



              })}
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
    </div >

  );
};



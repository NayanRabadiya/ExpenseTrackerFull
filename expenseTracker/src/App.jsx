import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"
import { TestForm } from "./components/common/TestForm";
import { Reports } from "./components/user/Reports";
import { Dashboard } from "./components/user/Dashboard";
import { Profile } from "./components/user/Profile";
import { ExpenseForm } from "./components/user/ExpenseForm";
import { ExpenseList } from "./components/user/ExpenseList";
import { Home } from "./components/user/Home";
import axios from "axios";
import { Bounce, ToastContainer } from "react-toastify";
import { BudgetForm } from "./components/user/BudgetForm";
import { AddSampleData } from "./components/admin/AddSampleData";
import { ResetPassword } from "./components/common/ResetPassword";
import { ForgotPassword } from "./components/common/ForgotPassword";
import { Login } from "./components/user/Login";
import { Register } from "./components/user/Register";
import { PrivateUserRoutes } from "./components/hooks/PrivateUserRoutes";
import { PrivateAdminRoutes } from "./components/hooks/PrivateAdminRoutes";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminProfile } from "./components/admin/AdminProfile";
import { CategoryManager } from "./components/admin/CategoryManager";
import { Users } from "./components/admin/Users";
import { AdminNavBar } from "./components/admin/AdminNavbar";
import { UserNavbar } from "./components/user/UserNavbar";
import { AdminLogin } from "./components/admin/AdminLogin";
function App() {

  axios.defaults.baseURL = "http://localhost:8000";
  return (
    <div className="main">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <Routes>
        {/* <Route path="/login/admin" element={<Login></Login>} /> */}
        <Route path="/" element={<Home></Home>} />
        <Route path="/login/user" element={<Login></Login>} />
        <Route path="/login/admin" element={<AdminLogin></AdminLogin>} />
        <Route path="/register" element={<Register></Register>} />
        <Route path="/sample" element={<AddSampleData></AddSampleData>} />
        <Route path="/resetpassword/:token" element={<ResetPassword></ResetPassword>}></Route>
        <Route path="/forgotpassword" element={<ForgotPassword></ForgotPassword>}></Route>

        {/* <Route></Route> */}
        <Route element={<PrivateAdminRoutes></PrivateAdminRoutes>}>
          <Route path="/admin" element={<AdminNavBar></AdminNavBar>} >
            <Route path="dashboard" element={<AdminDashboard></AdminDashboard>}></Route>
            <Route path="profile" element={<AdminProfile></AdminProfile>}></Route>
            <Route path="categories" element={<CategoryManager></CategoryManager>}></Route>
            <Route path="users" element={<Users></Users>}></Route>
            <Route path="" element={<AdminDashboard></AdminDashboard>}></Route>
          </Route>
        </Route>


        <Route element={<PrivateUserRoutes></PrivateUserRoutes>}>
          <Route path="/user" element={<UserNavbar></UserNavbar>} >
            <Route path="dashboard" element={<Dashboard></Dashboard>}></Route>
            <Route path="testForm" element={<TestForm></TestForm>}></Route>
            <Route path="profile" element={<Profile />} />
            <Route path="add-expense" element={<ExpenseForm />} />
            <Route path="expenses" element={<ExpenseList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="budget-form" element={<BudgetForm />} />
            <Route path="" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>

    </div>
  );
}

export default App;

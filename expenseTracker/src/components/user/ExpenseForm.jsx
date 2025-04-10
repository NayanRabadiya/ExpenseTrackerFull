import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/expenseForm.css";

export const ExpenseForm = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [categories, setcategories] = useState([]);

  const getCategories = async () => {
    const categoriesData = localStorage.getItem("categories");
    setcategories(categoriesData?JSON.parse(categoriesData):[]);
  }

  useEffect(() => {
    getCategories();
  }, [])


  const onSubmit = async (data) => {

    const [year, month, day] = data.date.split("-");
    

    data.date = `${day}/${month}/${year}`;
    data.userId = localStorage.getItem("userid");

    try {
      // console.log("....data",data);
      const response = await toast.promise(
        axios.post("/expense", data),
        {
          pending: "Saving expense...",
          success: "Expense saved successfully! 🎉",
          error: "Failed to save expense! Please try again.",
        }
      );
      // console.log(response.data);
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const Validators = {
    titleValidator: {
      required: {
        value: true,
        message: "Title is required",
      },
    },
    amountValidator: {
      required: {
        value: true,
        message: "Amount is required",
      },
      min: {
        value: 1,
        message: "Amount must be greater than ₹0",
      },
      pattern: {
        value: /^[0-9]+$/, // Allows only whole numbers
        message: "Amount must be a whole number",
      }
    },
    categoryValidator: {
      required: {
        value: true,
        message: "Category is required",
      },
    },
    dateValidator: {
      required: {
        value: true,
        message: "Date is required",
      },
    },
  };

  return (
    <div className="expense-container">
      <div className="expense-card">
        <h2 className="title">Add New Expense</h2>
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Title */}
          <label>Title</label>
          <div className="input-wrapper">
            <input type="text" placeholder="Expense title" className={errors.title ? "input-error" : ""} {...register("title", Validators.titleValidator)} />
            <span className="expense-error-message">{errors.title?.message}</span>
          </div>

          {/* Amount */}
          <label>Amount</label>
          <div className="input-wrapper">
            <input type="numeric" placeholder="Amount (₹)" className={errors.amount ? "input-error" : ""} {...register("amount", Validators.amountValidator)} />
            <span className="expense-error-message">{errors.amount?.message}</span>
          </div>

          {/* Category */}
          <label>Category</label>
          <div className="input-wrapper">
            <select className={errors.category ? "input-error" : ""} {...register("categoryId", Validators.categoryValidator)}>
              <option value="">Select Category</option>
              {
                categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))
              }
            </select>
            <span className="expense-error-message">{errors.category?.message}</span>
          </div>


          {/* Date */}
          <label>Date</label>
          <div className="input-wrapper">
            <input type="date" className={errors.date ? "input-error" : ""} {...register("date", Validators.dateValidator)} />
            <span className="expense-error-message">{errors.date?.message}</span>
          </div>

          {/* Notes (Optional) */}
          <label>Description (Optional)</label>
          <textarea {...register("description")} placeholder="Add description..." rows="2"></textarea>

          {/* Submit Button */}
          <button type="submit" className="btn-submit">Save</button>
        </form>
      </div>
    </div>
  );
};

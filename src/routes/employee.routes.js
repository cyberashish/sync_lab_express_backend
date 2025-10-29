import express from "express";
import { addEmployee, addEmployeesOvertimeRequest, addEmployeesRequest, addLeaveChangeLog, createAdminNotification, createEmployeeNotification, deleteEmployee, editEmployee, employeeProfile, getAllAdminNotifications, getAllEmployeeNotifications, getAllEmployees, getAllEmployeesOvertimeRequest, getAllEmployeesRequest, getEmployeeByEmail, getEmployeeDetails, getEmployeeOvertimeRequestInfo, getEmployeeRequestInfo, resetEmployeeLeaves, updateAdminNotification, updateEmployeeLeave, updateEmployeeNotification, updateEmployeeOvertime, updateEmployeeOvertimeRequest, updateEmployeeRequest } from "../controllers/employee.controller.js";

const employeeRouter = express.Router();

employeeRouter
.post("/add-employee" , addEmployee)
.put("/edit-employee" , editEmployee)
.get("/profile/:id" , employeeProfile)
.get("/all", getAllEmployees)
.post("/get-employee", getEmployeeByEmail)
.delete("/delete-employee/:id" , deleteEmployee)
.get("/employee-detail/:id" , getEmployeeDetails)
.post("/add-request" , addEmployeesRequest)
.post("/get-employee/requests" , getEmployeeRequestInfo)
.get("/all-requests" , getAllEmployeesRequest)
.put("/update-request" , updateEmployeeRequest)
.put("/update-employee-leave" , updateEmployeeLeave)
.post("/add-notification/admin" , createAdminNotification)
.put("/update-notification/admin" , updateAdminNotification)
.get("/all-notifications/admin" , getAllAdminNotifications)
.post("/add-notification" , createEmployeeNotification)
.put("/update-notification" , updateEmployeeNotification)
.get("/all-notifications" , getAllEmployeeNotifications)
.post("/add-overtime-request" , addEmployeesOvertimeRequest)
.post("/get-employee/overtime-requests" , getEmployeeOvertimeRequestInfo)
.get("/all-overtime-requests" , getAllEmployeesOvertimeRequest)
.put("/update-overtime-request" , updateEmployeeOvertimeRequest)
.put("/update-employee-overtime" , updateEmployeeOvertime)
.post("/add-leave-changelog" , addLeaveChangeLog)
.get("/reset-leaves" , resetEmployeeLeaves)

export {employeeRouter}
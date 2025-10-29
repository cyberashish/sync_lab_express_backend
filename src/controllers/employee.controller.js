
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../utils/client.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateSimplePassword } from "../utils/generatePassword.js";
import bcrypt, { genSalt } from "bcryptjs";
import { generateEmployeeId } from "../utils/generateEmployeeId.js";

export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      mobile_number,
      aadhaar_number,
      account_number,
      department,
      designation,
      previous_company,
      pf_number,
      salary,
      active,
      current_address,
      permanent_address,
      employeeDOBDate,
      employeeJoiningDate,
      allottedLeaves,
      bondType,
      imageUrl
    } = req.body;

    if (
      name &&
      email &&
      gender &&
      active &&
      mobile_number &&
      aadhaar_number &&
      account_number &&
      department &&
      designation &&
      salary &&
      current_address &&
      permanent_address &&
      employeeDOBDate &&
      employeeJoiningDate &&
      allottedLeaves&&
      bondType&&
      imageUrl
    ) {
      const password = generateSimplePassword(name, email);
      const salt = await genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const employeeId = generateEmployeeId();

      const employee = await prisma.employee.create({
        data: {
          employeeId,
          name,
          active,
          email,
          gender,
          mobile_number,
          aadhaar_number,
          account_number,
          department,
          designation,
          previous_company,
          pf_number,
          salary,
          current_address,
          permanent_address,
          employeeDOBDate,
          employeeJoiningDate,
          employeePassword: password,
          bondType,
          imageUrl
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(200, employee, "Employee created successfully !")
        );
    } else {
      res
        .status(422)
        .json(new ApiError(401, "Please provide all valid field!"));
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(new ApiError(401, error.message));
  }
};

export const editEmployee = async (req, res) => {
  try {
    const { id, ...toEditData } = req.body;
    if (id && toEditData) {
      const currentAllottedLeaves = toEditData["allottedLeaves"];
      const currentEmployee = await prisma.employee.findUnique({
        where:{
          id:id
        }
      });
      if(currentEmployee.allottedLeaves !== currentAllottedLeaves){
        console.log(currentAllottedLeaves);
        await prisma.leaveChangeLog.create({
          data: {
            employeeId:id,
            oldLeaves: currentEmployee.allottedLeaves,
            newLeaves: currentAllottedLeaves,
          },
        });
      }
      const updatedEmployee = await prisma.employee.update({
        where: {
          id: id,
        },
        data: { ...toEditData },
      });
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedEmployee,
            "Successfully updated employee!"
          )
        );
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide all valid field data !"));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const employeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: {
          id: employeeId,
        },
      });
      res
        .status(200)
        .json(new ApiResponse(200, employee, "Successfully fetched employee"));
    } else {
      res.status(422).json(new ApiError(422, "Please provide employee id"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const allEmployees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allEmployees,
          "Successfully fetched all employess!"
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    console.log(req.params.id, "data");
    if (req.params.id) {
      const deletedEmployee = await prisma.employee.delete({
        where: {
          id: req.params.id,
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            deletedEmployee,
            "Successfully deleted employee!"
          )
        );
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide all valid field data !"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const addEmployeesRequest = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      leaveDates,
      designation,
      description,
      leave,
      requestStatus,
      isRequestApproved,
      leaveType,
    } = req.body;
    if (
      employeeId &&
      name &&
      designation &&
      description &&
      leave &&
      leaveType &&
      email &&
      leaveDates
    ) {
      const request = await prisma.request.create({
        data: {
          employeeId,
          name,
          designation,
          date: new Date(),
          description,
          leave,
          requestStatus,
          isRequestApproved,
          leaveType,
          email,
          leaveDates,
        },
      });
      res
        .status(200)
        .json(new ApiResponse(200, request, "Successfully created request!"));
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide all valid fields!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getAllEmployeesRequest = async (req, res) => {
  try {
    const allRequests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, allRequests, "Successfully fetched all requests!")
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const updateEmployeeRequest = async (req, res) => {
  try {
    const { id, ...toUpdateData } = req.body;
    console.log(req.body, "mera body");
    if (id) {
      try {
        const updatedRequest = await prisma.request.update({
          where: {
            id: id,
          },
          data: { ...toUpdateData },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedRequest,
              "Successfully updated request !"
            )
          );
      } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
      }
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide valid requestId!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};
export const getEmployeeByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      try {
        const employee = await prisma.employee.findUnique({
          where: {
            email: email,
          },
        });
        res
          .status(200)
          .json(
            new ApiResponse(200, employee, "Successfully updated request !")
          );
      } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
      }
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide valid requestId!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const updateEmployeeLeave = async (req, res) => {
  try {
    const { email, leave, leaveType } = req.body;
    if (email && leave && leaveType) {
      if (leaveType === "Casual") {
        const updatedEmployeeLeave = await prisma.employee.update({
          where: {
            email: email,
          },
          data: {
            totalLeaves: { increment: leave },
            casualLeaves: { increment: leave },
          },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedEmployeeLeave,
              "Successfully updated employee!"
            )
          );
      } else if (leaveType === "Vacation") {
        const updatedEmployeeLeave = await prisma.employee.update({
          where: {
            email: email,
          },
          data: {
            totalLeaves: { increment: leave },
            vacationLeaves: { increment: leave },
          },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedEmployeeLeave,
              "Successfully updated employee!"
            )
          );
      } else {
        const updatedEmployeeLeave = await prisma.employee.update({
          where: {
            email: email,
          },
          data: {
            totalLeaves: { increment: leave },
            sickLeaves: { increment: leave },
          },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedEmployeeLeave,
              "Successfully updated employee!"
            )
          );
      }
    } else {
      res.status(422).json(new ApiError(422, "Please provide valid details!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getEmployeeRequestInfo = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const employeeRequests = await prisma.employee.findUnique({
      where: {
        email,
      },
      include: {
        requests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          employeeRequests,
          "Successfully fetched employee requests!"
        )
      );
  } else {
    res.status(422).json(new ApiError(422, "Please provide valid fields!"));
  }
};

export const createAdminNotification = async (req, res) => {
  const { title, message, type } = req.body;
  if (title && message && type) {
    const admin = await prisma.user.findFirst({
      where: {
        role: "admin",
      },
    });
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: admin.id,
          title,
          message,
          type,
          isRead: false,
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(200, notification, "Successfully fetch all admins !")
        );
    } catch (error) {
      res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  } else {
    res.status(422).json(new ApiError(422, "Please provide all valid fields!"));
  }
};

export const updateAdminNotification = async (req, res) => {
  const { notificationId } = req.body;
  if (notificationId) {
    try {
      const updatedNotificatiion = await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedNotificatiion,
            "Successfully updated notification!"
          )
        );
    } catch (error) {
      res.status(500).json(new ApiError(500, "Internal Server Error!"));
    }
  } else {
    res.status(422).json(new ApiError(422, "Please provide all valid fields!"));
  }
};

export const getAllAdminNotifications = async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        role: "admin",
      },
    });
    const allNotifications = await prisma.notification.findMany({
      where: {
        userId: admin.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allNotifications,
          "Successfully fetched all notifications!"
        )
      );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!"));
  }
};

export const createEmployeeNotification = async (
  req,
  res
) => {
  const { title, message, type, email } = req.body;
  if (title && message && type && email) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type,
          isRead: false,
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(200, notification, "Successfully fetch all admins !")
        );
    } catch (error) {
      res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  } else {
    res.status(422).json(new ApiError(422, "Please provide all valid fields!"));
  }
};

export const updateEmployeeNotification = async (
  req,
  res
) => {
  const { notificationId } = req.body;
  if (notificationId) {
    try {
      const updatedNotificatiion = await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedNotificatiion,
            "Successfully updated notification!"
          )
        );
    } catch (error) {
      res.status(500).json(new ApiError(500, "Internal Server Error!"));
    }
  } else {
    res.status(422).json(new ApiError(422, "Please provide all valid fields!"));
  }
};

export const getAllEmployeeNotifications = async (
  req,
  res
) => {
  const emailQuery = req.query.email;
  const email = typeof emailQuery === "string" ? emailQuery : undefined;
  console.log(email);
  if (email) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      const allNotifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            allNotifications,
            "Successfully fetched all notifications!"
          )
        );
    } catch (error) {
      console.log(error);
      res.status(500).json(new ApiError(500, "Internal server error!"));
    }
  } else {
    res.status(422).json(new ApiResponse(422, "All fields are required!"));
  }
};
// Overtime request

export const getAllEmployeesOvertimeRequest = async (
  req,
  res
) => {
  try {
    const allRequests = await prisma.overtime.findMany({
      orderBy: { createdAt: "desc" },
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allRequests,
          "Successfully fetched all overtime requests!"
        )
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const addEmployeesOvertimeRequest = async (
  req,
  res
) => {
  try {
    const {
      employeeId,
      name,
      email,
      overtimeDates,
      overtimeDays,
      designation,
      description,
      requestStatus,
      isRequestApproved,
    } = req.body;
    if (
      employeeId &&
      name &&
      designation &&
      description &&
      email &&
      overtimeDates
    ) {
      const request = await prisma.overtime.create({
        data: {
          employeeId,
          name,
          designation,
          date: new Date(),
          description,
          requestStatus,
          isRequestApproved,
          email,
          overtimeDates,
          overtimeDays,
        },
      });
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            request,
            "Successfully created overtime request!"
          )
        );
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide all valid fields!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const updateEmployeeOvertimeRequest = async (
  req,
  res
) => {
  try {
    const { id, ...toUpdateData } = req.body;
    if (id) {
      try {
        const updatedRequest = await prisma.overtime.update({
          where: {
            id: id,
          },
          data: { ...toUpdateData },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedRequest,
              "Successfully updated overtime request !"
            )
          );
      } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
      }
    } else {
      res
        .status(422)
        .json(new ApiError(422, "Please provide valid requestId!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getEmployeeOvertimeRequestInfo = async (
  req,
  res
) => {
  const { email } = req.body;
  if (email) {
    const employeeRequests = await prisma.employee.findUnique({
      where: {
        email,
      },
      include: {
        overtimes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    console.log(email, employeeRequests);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          employeeRequests,
          "Successfully fetched employee overtime requests!"
        )
      );
  } else {
    res.status(422).json(new ApiError(422, "Please provide valid fields!"));
  }
};

export const updateEmployeeOvertime = async (req, res) => {
  try {
    const { email, overtime } = req.body;
    if (email && overtime) {
      try {
        const updatedEmployeeOvertime = await prisma.employee.update({
          where: {
            email: email,
          },
          data: {
            overtimeDays: { increment: overtime },
          },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedEmployeeOvertime,
              "Successfully updated employee overtime!"
            )
          );
      } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError(422, "Failed to update employee!"));
      }
    } else {
      res.status(422).json(new ApiError(422, "Please provide valid details!"));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};
// Create Leave ChangeLog

export const addLeaveChangeLog = async (req, res) => {
  try {
    const { employeeId, newLeaves } = req.body;
    if (employeeId) {
      try {
        const employee = await prisma.employee.findUnique({
          where: {
            id: employeeId,
          },
        });
        const leaveChangeLog = await prisma.leaveChangeLog.create({
          data: {
            employeeId,
            oldLeaves: employee.allottedLeaves,
            newLeaves,
          },
        });
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              leaveChangeLog,
              "Successfully created leave changelog!"
            )
          );
      } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error!"));
      }
    } else {
      res
        .status(422)
        .json(new ApiResponse(422, "Please provide valid details!"));
    }
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getEmployeeDetails = async (req , res) => {
      try{
        const employeeId = req.params.id;
        if(employeeId){
        const employee = await prisma.employee.findUnique({
          where:{
            id:employeeId
          },
          select:{
            requests:true,
            overtimes:true,
            leaveChangeLogs:true
          }
        });
        res.status(200).json(new ApiResponse(200 , employee , "Successfully fetched employee!"));
        }else{
          res.status(422).json(new ApiResponse(422 , "Failed to get employee Id!"))
        }
      }catch(error){
        res.status(500).json(new ApiResponse(500 , "Internal Server error!"));
      }
}

export const resetEmployeeLeaves = async () => {
  console.log("Running Yearly rest leaves of ems");

  try{
   const result =  await prisma.employee.updateMany({
      data:{
          totalLeaves:0,
          casualLeaves:0,
          sickLeaves:0,
          overtimeDays:0,
          allottedLeaves:18
      }
     });

     console.log(`Leave balances reset for ${result.count} employees.`)
  }catch(error){
      console.log("Failed to resest Leaves" , error);
  }
}
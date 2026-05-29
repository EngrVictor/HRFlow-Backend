// commented out 3 imports to be imported later
import Employee from "../models/Employee.js";
// import LeaveRequest from "../models/LeaveRequest.js";
import JobPosting from "../models/JobPosting.js";
// import Application from "../models/Application.js";
// import PerformanceReview from "../models/PerfomanceReview.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();

    const activeEmployees = await Employee.countDocuments({
      status: "active",
    });

    const employeesOnLeave = await LeaveRequest.countDocuments({
      status: "approved",
    });

    const openJobs = await JobPosting.countDocuments({
      status: "open",
    });

    const totalApplications = await Application.countDocuments();

    const performanceData = await PerformanceReview.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
        },
      },
    ]);

    const averagePerformanceScore =
      performanceData.length > 0 ? performanceData[0].averageScore : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        employeesOnLeave,
        openJobs,
        totalApplications,
        averagePerformanceScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//   } catch (error) {
//     console.error("Error fetching dashboard analytics:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch dashboard analytics",
//     });
//   }

import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import JobPosting from "../models/JobPosting.js";
import Application from "../models/Application.js";
import PerformanceReview from "../models/PerfomanceReview.js";
import AuditLog from "../models/AuditLog.js";

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

export const getLeaveSummary = async (req, res) => {
  try {
    const [statusCounts, typeCounts, currentlyOnLeave] = await Promise.all([
      LeaveRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      LeaveRequest.aggregate([
        {
          $group: {
            _id: "$leaveType",
            count: { $sum: 1 },
          },
        },
      ]),
      LeaveRequest.countDocuments({
        status: "approved",
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
    ]);

    const totalRequests = statusCounts.reduce((sum, item) => sum + item.count, 0);
    const leaveCountsByStatus = statusCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      { pending: 0, approved: 0, rejected: 0 },
    );
    const leaveCountsByType = typeCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      { annual: 0, sick: 0, casual: 0 },
    );

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        leaveCountsByStatus,
        leaveCountsByType,
        currentlyOnLeave,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecruitmentMetrics = async (req, res) => {
  try {
    const [openJobs, totalApplications, applicationsByStatus, applicationsByJob] =
      await Promise.all([
        JobPosting.countDocuments({ status: "open" }),
        Application.countDocuments(),
        Application.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        Application.aggregate([
          {
            $group: {
              _id: "$jobPosting",
              totalApplications: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "jobpostings",
              localField: "_id",
              foreignField: "_id",
              as: "job",
            },
          },
          {
            $unwind: {
              path: "$job",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              jobPosting: "$_id",
              jobTitle: "$job.title",
              totalApplications: 1,
            },
          },
        ]),
      ]);

    const statusBreakdown = applicationsByStatus.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {},
    );

    res.status(200).json({
      success: true,
      data: {
        openJobs,
        totalApplications,
        statusBreakdown,
        applicationsByJob,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPerformanceDistribution = async (req, res) => {
  try {
    const [distribution, averageData] = await Promise.all([
      PerformanceReview.aggregate([
        {
          $group: {
            _id: "$score",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      PerformanceReview.aggregate([
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$score" },
          },
        },
      ]),
    ]);

    const averageScore =
      averageData.length > 0 ? averageData[0].averageScore : 0;
    const distributionMap = distribution.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {},
    );

    res.status(200).json({
      success: true,
      data: {
        averageScore,
        distribution: {
          1: distributionMap[1] || 0,
          2: distributionMap[2] || 0,
          3: distributionMap[3] || 0,
          4: distributionMap[4] || 0,
          5: distributionMap[5] || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHeadcount = async (req, res) => {
  try {
    const [statusCounts, departmentCounts] = await Promise.all([
      Employee.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Employee.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const headcountByStatus = statusCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {},
    );
    const headcountByDepartment = departmentCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {},
    );

    const totalEmployees = await Employee.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        headcountByStatus,
        headcountByDepartment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("performedBy", "firstName lastName employeeCode")
      .lean();

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

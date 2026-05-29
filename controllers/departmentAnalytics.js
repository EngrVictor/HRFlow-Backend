import Employee from "../models/Employee.js";

export const getDepartmentAnalytics = async (req, res) => {
  try {
    const departments = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          totalEmployees: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

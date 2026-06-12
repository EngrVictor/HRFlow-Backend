import {
  getLeaveSummaryData,
  getRecruitmentMetricsData,
  getPerformanceDistributionData,
  getHeadcountData,
  getAuditLogsData,
} from "../services/analyticsServices.js";

// Individual endpoints (unchanged logic, but now use service)
export const getLeaveSummary = async (req, res) => {
  try {
    const data = await getLeaveSummaryData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruitmentMetrics = async (req, res) => {
  try {
    const data = await getRecruitmentMetricsData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPerformanceDistribution = async (req, res) => {
  try {
    const data = await getPerformanceDistributionData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeadcount = async (req, res) => {
  try {
    const data = await getHeadcountData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const data = await getAuditLogsData(100);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Combined dashboard endpoint
export const getDashboardAnalytics = async (req, res) => {
  try {
    const [leaveSummary, recruitmentMetrics, performanceDistribution, headcount, auditLogs] = await Promise.all([
      getLeaveSummaryData(),
      getRecruitmentMetricsData(),
      getPerformanceDistributionData(),
      getHeadcountData(),
      getAuditLogsData(20), // limit to 20 most recent for dashboard
    ]);

    res.status(200).json({
      success: true,
      data: {
        leaveSummary,
        recruitmentMetrics,
        performanceDistribution,
        headcount,
        recentAuditLogs: auditLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

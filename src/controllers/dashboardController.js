const dashboardService = require("../services/dashboardService");

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getOverallSummary();
    res.status(200).json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

const getCategoryTotals = async (req, res, next) => {
  try {
    const categories = await dashboardService.getCategoryTotals();
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const records = await dashboardService.getRecentActivity(limit);
    res.status(200).json({ success: true, data: { records } });
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const { year } = req.query;
    const trends = await dashboardService.getMonthlyTrends(year);
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getWeeklyTrends();
    res.status(200).json({ success: true, data: { weekly: trends } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoryTotals, getRecentActivity, getMonthlyTrends, getWeeklyTrends };

const { FinancialRecord } = require("../models/FinancialRecord");

const getOverallSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };

  result.forEach((item) => {
    if (item._id === "income") {
      summary.totalIncome = item.total;
      summary.incomeCount = item.count;
    } else if (item._id === "expense") {
      summary.totalExpenses = item.total;
      summary.expenseCount = item.count;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  summary.totalRecords = summary.incomeCount + summary.expenseCount;

  return summary;
};

const getCategoryTotals = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Reshape for a clean response
  const categories = {};
  result.forEach(({ _id, total, count }) => {
    if (!categories[_id.category]) {
      categories[_id.category] = { category: _id.category, income: 0, expense: 0, count: 0 };
    }
    categories[_id.category][_id.type] += total;
    categories[_id.category].count += count;
  });

  return Object.values(categories).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
};

const getRecentActivity = async (limit = 10) => {
  return FinancialRecord.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getMonthlyTrends = async (year) => {
  const matchYear = year ? Number(year) : new Date().getFullYear();

  const result = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        $expr: { $eq: [{ $year: "$date" }, matchYear] },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Build a full 12-month structure
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(2000, i, 1).toLocaleString("en", { month: "short" }),
    income: 0,
    expense: 0,
    net: 0,
  }));

  result.forEach(({ _id, total }) => {
    const monthData = months[_id.month - 1];
    if (_id.type === "income") monthData.income = total;
    else if (_id.type === "expense") monthData.expense = total;
  });

  months.forEach((m) => { m.net = m.income - m.expense; });

  return { year: matchYear, months };
};

const getWeeklyTrends = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  // Build 7-day structure
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days[key] = { date: key, income: 0, expense: 0, net: 0 };
  }

  result.forEach(({ _id, total }) => {
    if (days[_id.date]) {
      days[_id.date][_id.type] = total;
    }
  });

  const weekly = Object.values(days);
  weekly.forEach((d) => { d.net = d.income - d.expense; });

  return weekly;
};

module.exports = { getOverallSummary, getCategoryTotals, getRecentActivity, getMonthlyTrends, getWeeklyTrends };

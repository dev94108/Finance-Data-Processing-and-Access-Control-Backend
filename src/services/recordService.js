const { FinancialRecord } = require("../models/FinancialRecord");

const buildFilterQuery = (filters) => {
  const query = { isDeleted: false };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = Number(filters.minAmount);
    if (filters.maxAmount) query.amount.$lte = Number(filters.maxAmount);
  }

  return query;
};

const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, createdBy: userId });
  return record.populate("createdBy", "name email");
};

const getAllRecords = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const query = buildFilterQuery(filters);

  const [records, total] = await Promise.all([
    FinancialRecord.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FinancialRecord.countDocuments(query),
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findOne({ _id: id, isDeleted: false }).populate("createdBy", "name email");
  if (!record) {
    const error = new Error("Financial record not found.");
    error.statusCode = 404;
    throw error;
  }
  return record;
};

const updateRecord = async (id, updateData) => {
  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true, runValidators: true }
  ).populate("createdBy", "name email");

  if (!record) {
    const error = new Error("Financial record not found.");
    error.statusCode = 404;
    throw error;
  }
  return record;
};

// Soft delete
const deleteRecord = async (id) => {
  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!record) {
    const error = new Error("Financial record not found.");
    error.statusCode = 404;
    throw error;
  }
  return record;
};

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord };

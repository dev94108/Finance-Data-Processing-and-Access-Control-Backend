const recordService = require("../services/recordService");

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: "Financial record created successfully.",
      data: { record },
    });
  } catch (error) {
    next(error);
  }
};

const getAllRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate, minAmount, maxAmount } = req.query;

    const filters = { type, category, startDate, endDate, minAmount, maxAmount };
    const pagination = { page, limit };

    const result = await recordService.getAllRecords(filters, pagination);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    res.status(200).json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Financial record updated successfully.",
      data: { record },
    });
  } catch (error) {
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    res.status(200).json({
      success: true,
      message: "Financial record deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord };

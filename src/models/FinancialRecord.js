const mongoose = require("mongoose");

const RECORD_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

const CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "rent",
  "utilities",
  "groceries",
  "transport",
  "entertainment",
  "healthcare",
  "education",
  "other",
];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: Object.values(RECORD_TYPES),
      required: [true, "Type is required (income or expense)"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for common query patterns
financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ type: 1, category: 1 });
financialRecordSchema.index({ createdBy: 1 });
financialRecordSchema.index({ isDeleted: 1 });

const FinancialRecord = mongoose.model("FinancialRecord", financialRecordSchema);

module.exports = { FinancialRecord, RECORD_TYPES, CATEGORIES };

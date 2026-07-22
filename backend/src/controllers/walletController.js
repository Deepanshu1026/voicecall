const User = require('../models/User');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('walletBalance username displayName');
  if (!user) throw new AppError('User not found', 404);

  const transactions = await Transaction.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  ApiResponse.success(res, {
    balance: user.walletBalance,
    user: {
      username: user.username,
      displayName: user.displayName,
    },
    transactions,
  }, 'Wallet retrieved');
});

const addMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new AppError('Valid positive amount is required', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $inc: { walletBalance: amount } },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);

  // TODO: integrate real payment gateway (Razorpay/Stripe) here before crediting wallet
  const transaction = await Transaction.create({
    user: req.userId,
    amount,
    type: 'credit',
    description: 'Wallet recharge',
    status: 'completed',
  });

  ApiResponse.success(res, {
    balance: user.walletBalance,
    transaction,
  }, 'Money added to wallet');
});

const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const transactions = await Transaction.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Transaction.countDocuments({ user: req.userId });

  ApiResponse.paginated(res, transactions, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  });
});

module.exports = {
  getWallet,
  addMoney,
  getTransactions,
};

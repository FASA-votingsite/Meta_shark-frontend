import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/apiService';
import { getPackageFeatures, getUserPackageTier } from '../utils/packageFeatures';
import '../styles/Withdrawal.css';

const Withdrawal = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    password: ''  // Make sure this field exists
  });
  const [loading, setLoading] = useState(true);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Nigerian banks list
  const nigerianBanks = [
    "Access Bank", "Zenith Bank", "First Bank of Nigeria", "Guaranty Trust Bank",
    "United Bank for Africa", "Ecobank Nigeria", "Union Bank of Nigeria",
    "Stanbic IBTC Bank", "First City Monument Bank", "Sterling Bank",
    "Wema Bank", "Unity Bank", "Heritage Bank", "Keystone Bank", "Polaris Bank",
    "Jaiz Bank", "Standard Chartered Bank", "Citibank Nigeria", "Suntrust Bank",
    "Providus Bank", "Titan Trust Bank", "Globus Bank", "Parallex Bank",
    "PremiumTrust Bank", "Fidelity Bank", "Kuda Bank", "Moniepoint Microfinance Bank",
    "Opay", "Palmpay"
  ];

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const fetchWithdrawalData = async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getWithdrawalHistory ? walletAPI.getWithdrawalHistory() : Promise.resolve([])
      ]);
      
      setTotalBalance(balanceData.total_earnings || balanceData.total_balance || 0);
      setWalletBalance(balanceData.wallet_balance || balanceData.balance || 0);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      setError('Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalLoading(true);
    setError('');
    setSuccess('');

    // Validation
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      setWithdrawalLoading(false);
      return;
    }

    if (amount > walletBalance) {
      setError(`Amount exceeds your available balance of ₦${walletBalance.toLocaleString()}`);
      setWithdrawalLoading(false);
      return;
    }

    if (amount < 1000) {
      setError('Minimum withdrawal: ₦1,000');
      setWithdrawalLoading(false);
      return;
    }

    if (!formData.account_number || formData.account_number.length < 10) {
      setError('Please enter a valid 10-digit account number');
      setWithdrawalLoading(false);
      return;
    }

    if (!formData.bank_name) {
      setError('Please select a bank');
      setWithdrawalLoading(false);
      return;
    }

    if (!formData.account_name) {
      setError('Please enter account name');
      setWithdrawalLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Please enter your password to confirm withdrawal');
      setWithdrawalLoading(false);
      return;
    }

    try {
      const withdrawalData = {
        amount: amount,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_name: formData.account_name,
        password: formData.password  // Include password
      };

      console.log('Sending withdrawal data:', withdrawalData);
      
      const response = await walletAPI.requestWithdrawal(withdrawalData);
      setSuccess(`Withdrawal request of ₦${amount.toLocaleString()} submitted successfully! It will be processed within 24-48 hours.`);
      
      // Reset form
      setFormData({
        amount: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        password: ''
      });
      
      // Refresh data
      await fetchWithdrawalData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      // More specific error handling
      if (error.message.includes('Invalid password')) {
        setError('Invalid password. Please check your password and try again.');
      } else if (error.message.includes('Insufficient balance')) {
        setError('Insufficient balance for this withdrawal.');
      } else {
        setError(error.message || 'Withdrawal request failed. Please try again.');
      }
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat({
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const userFeatures = getPackageFeatures(user?.package_tier || 'silver');

  if (loading) {
    return (
      <div className="withdrawal-loading">
        <div className="loading-spinner"></div>
        <p>Loading withdrawal data...</p>
      </div>
    );
  }

  return (
    <div className="withdrawal">
      <div className="withdrawal-header">
        <h1>Withdraw Your Earnings</h1>
        <p>Transfer your earnings to your bank account</p>
        <div className="withdrawal-priority">
          <i className="fas fa-info-circle"></i>
          <span>
            {userFeatures.withdrawalSpeed === 'fast' 
              ? 'Pro Priority: Withdrawals processed within 1-2 hours' 
              : 'Standard Processing: Withdrawals processed within 12-24 hours'
            }
          </span>
        </div>
      </div>

      <div className="balance-section">
        <h2>Total Balance</h2>
        <div className="balance-amount">{formatCurrency(totalBalance)}</div>
        <p>Available for Withdrawal</p>
      </div>

      <div className="withdrawal-form-section">
        <h2>Request Withdrawal</h2>
        <form onSubmit={handleSubmit} className="withdrawal-form">
          {error && (
            <div className="withdrawal-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="withdrawal-success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                list="bankOptions"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="Select or type your bank name"
                required
              />
              <datalist id="bankOptions">
                {nigerianBanks.map((bank, index) => (
                  <option key={index} value={bank} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Enter 10-digit account number"
                maxLength="10"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Name *</label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="Name as it appears on your bank account"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount to Withdraw (₦) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount in Naira"
                min="1000"
                max={totalBalance}
                step="100"
                required
              />
              <small>Available: ₦{formatCurrency(totalBalance)}</small>
            </div>
          </div>

          <div className="form-group">
            <label>Your Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password to confirm withdrawal"
              required
            />
            <small>For security purposes, please enter your password</small>
          </div>

          <div className="withdrawal-info">
            <h4>Withdrawal Information:</h4>
            <ul>
              <li>Minimum withdrawal amount: ₦1,000</li>
              <li>Processing time: {userFeatures.withdrawalSpeed === 'fast' ? '1-2 hours' : '24-48 hours'}</li>
              <li>No withdrawal fees</li>
              <li>Ensure your account details are correct</li>
              <li>Withdrawals are processed on business days</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={withdrawalLoading || totalBalance < 1000} 
            className="withdrawal-button"
          >
            {withdrawalLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : totalBalance < 1000 ? (
              <>
                <i className="fas fa-exclamation-circle"></i> Minimum ₦1,000 Required
              </>
            ) : (
              <>
                <i className="fas fa-money-bill-wave"></i> Request Withdrawal
              </>
            )}
          </button>
        </form>
      </div>

      <div className="transaction-history">
        <h2>Transaction History</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <div className="transaction-list">
            {transactions.slice(0, 10).map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{transaction.description}</h4>
                  <span>
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Date unavailable'}
                  </span>
                </div>
                <div className={`transaction-amount ${transaction.amount > 0 ? 'credit' : 'debit'}`}>
                  {transaction.amount > 0 ? '-' : ''}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawal;
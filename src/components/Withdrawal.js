import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Withdrawal.css';

const Withdrawal = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    userPassword: '',
    amount: ''
  });
  const [loading, setLoading] = useState(true);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Nigerian banks list for suggestions
  const nigerianBanks = [
    "Access Bank",
    "Zenith Bank",
    "First Bank of Nigeria",
    "Guaranty Trust Bank",
    "United Bank for Africa",
    "Ecobank Nigeria",
    "Union Bank of Nigeria",
    "Stanbic IBTC Bank",
    "First City Monument Bank",
    "Sterling Bank",
    "Wema Bank",
    "Unity Bank",
    "Heritage Bank",
    "Keystone Bank",
    "Polaris Bank",
    "Jaiz Bank",
    "Standard Chartered Bank",
    "Citibank Nigeria",
    "Suntrust Bank",
    "Providus Bank",
    "Titan Trust Bank",
    "Globus Bank",
    "Parallex Bank",
    "PremiumTrust Bank",
    "Fidelity Bank",
    "Kuda Bank",
    "Moniepoint Microfinance Bank",
    "Opay",
    "Palmpay"
  ];

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const fetchWithdrawalData = async () => {
    try {
      // Replace with actual API calls
      const token = localStorage.getItem('token');
      const [balanceResponse, transactionsResponse] = await Promise.all([
        axios.get('/api/dashboard/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/transactions/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBalance(balanceResponse.data.balance || 0);
      setTransactions(transactionsResponse.data || []);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      // Fallback to empty data if API fails
      setBalance(0);
      setTransactions([]);
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
    if (parseFloat(formData.amount) > balance) {
      setError('Amount exceeds your balance');
      setWithdrawalLoading(false);
      return;
    }

    if (parseFloat(formData.amount) < 1000) {
      setError('Minimum withdrawal: ₦1,000');
      setWithdrawalLoading(false);
      return;
    }

    if (formData.accountNumber.length < 10) {
      setError('Please enter a valid account number');
      setWithdrawalLoading(false);
      return;
    }

    if (formData.userPassword.length < 4) {
      setError('Please enter your password');
      setWithdrawalLoading(false);
      return;
    }

    if (!formData.bankName.trim()) {
      setError('Please enter your bank name');
      setWithdrawalLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/withdrawals/', {
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
        amount: parseFloat(formData.amount),
        password: formData.userPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state with the response data
      const newTransaction = response.data;
      setTransactions([newTransaction, ...transactions]);
      setBalance(balance - parseFloat(formData.amount));
      setSuccess(`Withdrawal request of ₦${parseFloat(formData.amount).toLocaleString()} 
      submitted successfully! It will be processed within 24 hours.`);
      
      // Reset form
      setFormData({
        bankName: '',
        accountNumber: '',
        accountName: '',
        userPassword: '',
        amount: ''
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError(error.response?.data?.message || 'Withdrawal request failed. Please try again.');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="withdrawal-loading">Loading withdrawal data...</div>;
  }

  return (
    <div className="withdrawal">
      <div className="withdrawal-header">
        <h1>Withdraw Your Earnings</h1>
        <p>Transfer your earnings to your bank account</p>
      </div>

      <div className="balance-section">
        <h2>Current Balance</h2>
        <div className="balance-amount">{formatCurrency(balance)}</div>
        <p>Available for withdrawal</p>
      </div>

      <div className="withdrawal-form-section">
        <h2>Request Withdrawal</h2>
        <form onSubmit={handleSubmit} className="withdrawal-form">
          {error && <div className="withdrawal-error">{error}</div>}
          {success && <div className="withdrawal-success">{success}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                list="bankOptions"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Select or type your bank name"
                required
              />
              <datalist id="bankOptions">
                {nigerianBanks.map((bank, index) => (
                  <option key={index} value={bank} />
                ))}
              </datalist>
              <small>Select from the list or type your bank name</small>
            </div>

            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
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
                name="accountName"
                value={formData.accountName}
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
                max={balance}
                step="100"
                required
              />
              <small>Minimum: ₦1,000 | Maximum: {formatCurrency(balance)}</small>
            </div>
          </div>

          <div className="form-group">
            <label>Your Password *</label>
            <input
              type="password"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleChange}
              placeholder="Enter your META_SHARK password"
              required
            />
          </div>

          <div className="withdrawal-info">
            <h4>Withdrawal Information:</h4>
            <ul>
              <li>Minimum withdrawal amount: ₦1,000</li>
              <li>Processing time: 24-48 hours</li>
              <li>No withdrawal fees</li>
              <li>Ensure your account details are correct</li>
              <li>Withdrawals are processed on business days only</li>
            </ul>
          </div>

          <button type="submit" disabled={withdrawalLoading} className="withdrawal-button">
            {withdrawalLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
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
        {transactions.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <div className="transaction-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{transaction.description || `Withdrawal to ${transaction.bank_name}`}</h4>
                  <span className="transaction-date">{formatDate(transaction.date || transaction.created_at)}</span>
                  <span className={`transaction-status ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className={`transaction-amount ${transaction.transaction_type === 'payout' ? 'debit' : 'credit'}`}>
                  {transaction.transaction_type === 'payout' ? '-' : '+'}{formatCurrency(transaction.amount)}
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
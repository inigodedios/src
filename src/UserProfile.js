import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * UserProfile
 * This component fetches and displays the portfolio details of a user including their stock holdings and individual stock details.
 * Utilizes useParams hook from react-router-dom to extract the userId parameter from the URL.
 * Manages state for the user's portfolio, individual stock details, selected stock, and loading states.
 */
const UserProfile = () => {
  const { userId } = useParams(); // For next implementations
  const [portfolio, setPortfolio] = useState(null); // State for storing user portfolio data
  const [stockDetails, setStockDetails] = useState({}); // State for storing details of selected stock
  const [selectedStock, setSelectedStock] = useState(null); // State for tracking the currently selected stock
  const [loading, setLoading] = useState(true); // State for tracking loading state of the portfolio fetch
  const [loadingDetails, setLoadingDetails] = useState(false); // State for tracking loading state of the stock details fetch
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [isAdding, setIsAdding] = useState(true);

  useEffect(() => {
    // Fetches the user's portfolio
    const fetchPortfolio = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(`https://concise-honor-416313.ew.r.appspot.com/user1`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPortfolio(data); // Update state with fetched portfolio data
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchPortfolio();
  }, [userId]); // Add [userId] as a dependency for fetching user-specific data in future implementations

  

  /**
   * Fetches details for a specific stock symbol.
   * Checks if details are already loaded to avoid unnecessary fetches.
   * Updates the stockDetails state with the new data or existing data if already fetched.
   */
  const fetchStockDetails = async (symbol) => {
    setLoadingDetails(true); // Start loading details
    if (stockDetails[symbol]) {
      setSelectedStock(symbol); // Use existing data if available
      setLoadingDetails(false); // End loading details
    } else {
      try {
        const response = await fetch(`https://concise-honor-416313.ew.r.appspot.com/stockinfo/${symbol}`);
        if (!response.ok) {
          throw new Error(`Network response was not ok for symbol: ${symbol}`);
        }
        const data = await response.json();
        setStockDetails(prevDetails => ({
          ...prevDetails,
          [symbol]: data // Add new stock details to state
        }));
        setSelectedStock(symbol); // Update selected stock
      } catch (error) {
        console.error(`Error fetching details for ${symbol}:`, error);
      } finally {
        setLoadingDetails(false); // End loading details
      }
    }
  };
  
  const handleStockModification = async (e) => {
    e.preventDefault();
    const action = isAdding ? 'add' : 'remove';
    try {
      const response = await fetch(`https://concise-honor-416313.ew.r.appspot.com/modify_portfolio/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stockSymbol.toUpperCase(),
          quantity: Number(quantity),
          action: action,
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const updatedPortfolio = await response.json();
      setPortfolio(updatedPortfolio);
      setStockSymbol('');
      setQuantity('');
    } catch (error) {
      console.error('Error modifying portfolio:', error);
    }
  };
  
  // Function to add a stock to the user's portfolio
  const addStock = async () => {
    setModifyLoading(true);
    try {
      const response = await fetch(`https://concise-honor-416313.ew.r.appspot.com/modify_portfolio/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          symbol: stockSymbol,
          quantity: stockQuantity,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPortfolio(data); // Update the portfolio with the new data
      } else {
        throw new Error(data.error || 'Error adding stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    } finally {
      setModifyLoading(false);
    }
  };

  // Function to remove a stock from the user's portfolio
  const removeStock = async () => {
    setModifyLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/modify_portfolio/${userId}`, { // https://concise-honor-416313.ew.r.appspot.com/modify_portfolio/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          symbol: stockSymbol,
          quantity: stockQuantity,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPortfolio(data); // Update the portfolio with the new data
      } else {
        throw new Error(data.error || 'Error removing stock');
      }
    } catch (error) {
      console.error('Error removing stock:', error);
    } finally {
      setModifyLoading(false);
    }
  };

  return (
    <>
    <div className="portfolio-container" style={{ margin: '20px', fontFamily: 'Arial, sans-serif' }}>
      {loading ? (
        <p>Loading...</p>
      ) : portfolio ? (
        <>
          <h1>DEBUGGING DOLLARS</h1>
          <h2>PORTFOLIO OVERVIEW</h2>
          <p>Total portfolio value: ${portfolio.total_value.toFixed(2)}</p>
          <div className="modify-portfolio-section" style={{ marginBottom: '10px', backgroundColor: '#f2f2f2', padding: '5px' }}>
            <h3>Do you want to modify your portfolio?</h3>
            <form onSubmit={handleStockModification} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
                <label htmlFor="stockSymbol" style={{ marginBottom: '5px' }}>Stock symbol</label>
                <input
                  id="stockSymbol"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value)}
                  required
                  style={{ padding: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
                <label htmlFor="quantity" style={{ marginBottom: '5px' }}>Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  style={{ padding: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
              <span>What do you want to do?</span>
                <label style={{ marginBottom: '5px' }}>
                  <input
                    type="radio"
                    name="action"
                    value="add"
                    checked={isAdding}
                    onChange={() => setIsAdding(true)}
                  />
                  Add
                </label>
                <label>
                  <input
                    type="radio"
                    name="action"
                    value="remove"
                    checked={!isAdding}
                    onChange={() => setIsAdding(false)}
                  />
                  Remove
                </label>
              </div>
              <button type="submit" style={{ padding: '20px', fontSize: '19px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                MODIFY PORTFOLIO
              </button>
            </form>
          </div>
            <div>
              {Object.entries(portfolio.symbols).map(([symbol, details]) => (
                <div
                  key={symbol}
                  className="stock-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'left',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'white',
                    marginBottom: '16px',
                    border: '1px solid black',
                    cursor: 'pointer',
                  }}
                  onClick={() => fetchStockDetails(symbol)}
                >
                  <span className="font-medium text-lg">{symbol}</span>
                  <span style={{ marginLeft: 'auto' }}>{details.quantity} stocks</span>
                </div>
              ))}
            </div>
            {selectedStock && stockDetails[selectedStock] && (
              <div className="stock-details" style={{ marginTop: '32px' }}>
              <h3 className="text-xl font-bold mb-4">Stock Details for {selectedStock}</h3>
              {loadingDetails ? (
                <p>Loading details...</p>
              ) : (
                <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].map((header) => (
                        <th key={header} style={{ border: '1px solid black', padding: '8px', textAlign: 'left', backgroundColor: 'white', color: 'black' }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stockDetails[selectedStock].map(([date, data], index) => (
                      <tr key={index} style={{ backgroundColor:'white'}}>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{date}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{data['1. open']}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{data['2. high']}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{data['3. low']}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{data['4. close']}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{data['5. volume']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            )}
          </>
        ) : (
          <p>No portfolio data available.</p>
        )}
      </div>
    </>
  );
        };  
export default UserProfile;

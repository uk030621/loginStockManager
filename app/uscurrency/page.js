"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
    const [stocks, setStocks] = useState([]);
    const [previousPrices, setPreviousPrices] = useState({}); // Store previous prices
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
    const [DjiValue, setDjiValue] = useState(null); // Initialize DjiValue using useState
    const [newStock, setNewStock] = useState({ symbol: '', sharesHeld: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingSymbol, setEditingSymbol] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [baselinePortfolioValue, setBaselinePortfolioValue] = useState(0);
    const [newBaselineValue, setNewBaselineValue] = useState('');
    const [deviation, setDeviation] = useState({
        absoluteDeviation: 0,
        percentageChange: 0,
    });

    useEffect(() => {
        fetchData();
        fetchBaselineValue();
        fetchDjiValue(); // Fetch FTSE value
    }, []);


    useEffect(() => {
        // Fetch the initial stock data on component mount
        fetchData();
        fetchDjiValue(); 
    
        // Set an interval to fetch data every 60 seconds
        const intervalId = setInterval(fetchData, 60000); 
    
        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []);

    
    useEffect(() => {
        fetchDjiValue();  // Initial fetch
    
        const intervalId = setInterval(fetchDjiValue, 60000);  // Set interval to fetch FTSE every 60 seconds
        return () => clearInterval(intervalId);  // Cleanup the interval on component unmount
    }, []);
  
    
    useEffect(() => {
        console.log("DjiValue state:", DjiValue);  // Log DjiValue state on every change
    }, [DjiValue]);


    // Function to fetch FTSE index value
    const fetchDjiValue = async () => {
        try {
            console.log("Fetching DJ index value...");  // For debugging
            const response = await fetch('/api/usstock?symbol=DJI^');  // Try changing to 'DJI'
            if (!response.ok) {
                throw new Error('Failed to fetch DJ Index value');
            }
            const data = await response.json();
            console.log("DJ Index data:", data);  // For debugging
    
            if (data.pricePerShare) {
                setDjiValue(data.pricePerShare);
            } else {
                console.error('Price per share not found in data', data);
            }
        } catch (error) {
            console.error('Error fetching DJ index value:', error);
        }
    };
    


    // Fetch baseline value
    const fetchBaselineValue = async () => {
        try {
            const response = await fetch('/api/usbaseline');
            const data = await response.json();
            setBaselinePortfolioValue(data.baselinePortfolioValue);
        } catch (error) {
            console.error('Error fetching baseline portfolio value:', error);
        }
    };

    const updateBaselineValue = async () => {
        try {
            const response = await fetch('/api/usbaseline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baselinePortfolioValue: parseFloat(newBaselineValue) })
            });

            if (response.ok) {
                fetchBaselineValue();
                setNewBaselineValue('');
            } else {
                console.error('Failed to update baseline portfolio value');
            }
        } catch (error) {
            console.error('Error updating baseline portfolio value:', error);
        }
    };

    useEffect(() => {
        const absoluteDeviation = totalPortfolioValue - baselinePortfolioValue;
        const percentageChange = ((totalPortfolioValue - baselinePortfolioValue) / baselinePortfolioValue) * 100;

        setDeviation({
            absoluteDeviation,
            percentageChange,
        });
    }, [totalPortfolioValue, baselinePortfolioValue]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/usstock');
            const data = await response.json();

            const updatedStocks = await Promise.all(
                data.map(async (stock) => {
                    const priceResponse = await fetch(`/api/usstock?symbol=${stock.symbol}`);
                    const priceData = await priceResponse.json();

                    const pricePerShare = parseFloat(priceData.pricePerShare);
                    const totalValue = pricePerShare * stock.sharesHeld;

                    return {
                        ...stock,
                        pricePerShare: pricePerShare.toLocaleString('en-GB', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        totalValue: isNaN(totalValue)
                            ? '0.00'
                            : totalValue.toLocaleString('en-GB', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })
                    };
                })
            );

            // Sort the updatedStocks array by totalValue from high to low
            updatedStocks.sort((a, b) => {
                const totalValueA = parseFloat(a.totalValue.replace(/,/g, ''));
                const totalValueB = parseFloat(b.totalValue.replace(/,/g, ''));
                return totalValueB - totalValueA;
            });

            setStocks(updatedStocks);
            calculateTotalPortfolioValue(updatedStocks);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    

    const calculateTotalPortfolioValue = (stocks) => {
        const totalValue = stocks.reduce((acc, stock) => acc + parseFloat(stock.totalValue.replace(/,/g, '')), 0);
        setTotalPortfolioValue(totalValue);
    };

    const addOrUpdateStock = async () => {
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const endpoint = isEditing ? `/api/usstock?symbol=${editingSymbol}` : '/api/usstock';

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newStock, sharesHeld: parseFloat(newStock.sharesHeld) }) // Ensure sharesHeld is a number
            });

            if (response.ok) {
                setNewStock({ symbol: '', sharesHeld: '' });
                setIsEditing(false);
                setEditingSymbol('');
                fetchData();
            } else {
                console.error(`Failed to ${isEditing ? 'update' : 'add'} stock`);
            }
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} stock:`, error);
        }
    };

    const deleteStock = async (symbol) => {
        try {
            const response = await fetch('/api/usstock', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol })
            });

            if (response.ok) {
                fetchData();
            } else {
                console.error(`Failed to delete stock with symbol: ${symbol}`);
            }
        } catch (error) {
            console.error('Error deleting stock:', error);
        }
    };

    
    const getPriceChangeColor = (symbol, currentPrice) => {
        const previousPrice = previousPrices[symbol];
    
        if (previousPrice === undefined) return ''; // Neutral if no previous price
    
        if (currentPrice > previousPrice) return 'green'; // Price increased
        console.log('Current Price:', currentPrice);
        console.log('Previous Price:', previousPrice);
        if (currentPrice < previousPrice) return 'red'; // Price decreased
        return ''; // No change, neutral
    };

    const startEditing = (stock) => {
        setIsEditing(true);
        setNewStock({ symbol: stock.symbol, sharesHeld: stock.sharesHeld });
        setEditingSymbol(stock.symbol);
    };
    
    
    const getColorClass = (value) => {
        if (value > 0) return 'positive';
        if (value < 0) return 'negative';
        return 'neutral';
    };

    const refreshAllData = () => {
        fetchData();      // Fetch stock data
        fetchDjiValue(); // Fetch FTSE index value
    };

    
    return (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
            {/* Title and Baseline Value */}
            <h1 className='heading'>
                US
                <span>
                    <Image className='uk-pic'
                        src="/USFLAG.jpg" 
                        alt="Portfolio Image" 
                        width={50}  
                        height={50} 
                        style={{ marginLeft: '5px' }}  
                    />
                </span> 
                Stock Portfolio  
            </h1>
            <h2 className="sub-heading" style={{ marginTop: '10px' }}>Indicative Value: <span className='total-value'>${totalPortfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></h2>
            <h4 className='baseline-value'>Baseline: ${baselinePortfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h4>
            
            <input
                className="inputs"
                type="number"
                placeholder="Enter Baseline Value"
                value={newBaselineValue}
                onChange={(e) => setNewBaselineValue(e.target.value)}
            />
            <button className='submit-baseline-button' onClick={updateBaselineValue}>Submit</button>
            
            <p style={{fontSize:'0.8rem', marginBottom:'2px', color:'grey'}}>Change from baseline:</p>
                <h4 className="statistics">
                    <span className={getColorClass(deviation.absoluteDeviation)} style={{ marginRight: '20px' }}>
                        ${deviation.absoluteDeviation.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>

                    <span className={getColorClass(deviation.percentageChange)}>
                        {deviation.percentageChange.toFixed(2)}%
                    </span>
                </h4>
        

            {/*<a className='hyperlink1' href="https://uk.finance.yahoo.com/lookup" target="_blank" rel="noopener noreferrer" >Link - <span className='symbol-lookup'>symbol lookup</span> </a>*/}
            <Link className='stock-symbol-search' href = "/symbolsearch">Symbol Search</Link>
            <Link className='currency-link' href="/currency">Currency Converter</Link>
            <Link className='usstock-link' href="/">UK Portfolio</Link>
            
            {/* Add or Update Stock Form */}
            <div>
                <input className='inputs'
                    type="text"
                    placeholder="Enter Stock Symbol"
                    value={newStock.symbol}
                    onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                    disabled={isEditing}
                />
                <input
                    className="inputs"
                    type="number"
                    placeholder="Shares Held"
                    value={newStock.sharesHeld}
                    onChange={(e) => setNewStock({ ...newStock, sharesHeld: e.target.value })} // Allow string values, but convert to number when submitting
                />
            </div>

            {/* Buttons */}
            <div style={{ margin: '20px' }}>
                <button className='input-stock-button' onClick={addOrUpdateStock}>{isEditing ? 'Update Stock' : 'Add Stock'}</button>
                {isEditing && <button className='input-stock-button' onClick={() => {
                    setIsEditing(false);
                    setNewStock({ symbol: '', sharesHeld: '' });
                }}>Cancel</button>}
                <button className="input-stock-button" onClick={refreshAllData}>Refresh</button>
                <Link className='logout-confirm-link' href="/logout-confirmation">Logout</Link>
            </div>

            <div>
                <h2 className="ftse-index" style={{ marginBottom: '20px', color:'grey', fontSize:'0.9rem' }}>
                    DJ Index: {typeof DjiValue === 'number' ? DjiValue.toLocaleString('en-GB') : 'Loading...'}
                </h2>

            </div>

            

            {/* FTSE Index Display */}
        {/*{DjiValue !== null && (
            <h2 className="ftse-index" style={{ marginBottom: '20px', color:'grey', fontSize:'0.9rem' }}>
                FTSE 100 Index: <span>{DjiValue.toLocaleString('en-GB')}</span>
            </h2>
        )}*/}

            {/* Stock Table */}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
                    <thead className='table-heading'>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Stock Symbol</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Share price ($)</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Shares held</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Total value ($)</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => (
                            <tr key={stock.symbol}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{stock.symbol}</td>
                                <td
                                    className={`price-cell ${getPriceChangeColor(stock.symbol, parseFloat(stock.pricePerShare.replace(/,/g, '')))}`}
                                    style={{ border: '1px solid black', padding: '8px' }}
                                >
                                    £{stock.pricePerShare}
                                </td>

                                <td style={{ border: '1px solid black', padding: '8px' }}>{stock.sharesHeld}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>£{stock.totalValue}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    <button className="edit-button" onClick={() => startEditing(stock)}>Edit</button>
                                    <button className="delete-button" onClick={() => deleteStock(stock.symbol)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

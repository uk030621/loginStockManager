'use client'; // Required for client-side code

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function StockSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const inputRef = useRef(null);
  


  // Fetch stock suggestions from API when the search term changes
  useEffect(() => {
    if (searchTerm.length > 1) {
      fetch(`/api/yahoosymbol?query=${searchTerm}`)
        .then((response) => response.json())
        .then((data) => setSuggestions(data))
        .catch((error) => console.error('Error fetching stock suggestions:', error));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      setCopySuccess('Copied!');
      // Clear the message after 2 seconds
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px' }}>
      
        <Image
          className='uk-pic'
          src="/search.jpg"
          alt="Portfolio Image"
          width={290} // Adjust the width
          height={260} // Adjust the height
          style={{ marginLeft: '5px' }} // Add margin for spacing
        />
  
        <h1 className='stock-label'>Stock Symbol Lookup</h1>
  
        <input className='inputs'
          type="text"
          placeholder="Enter stock name or symbol"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px', padding: '10px', marginBottom: '10px', fontSize:'17px', borderRadius:'7px' }}
        />
  
        <ul style={{ border: '1px solid #ccc', width: '300px', padding: '0', listStyleType: 'none' }}>
          {suggestions.map((stock) => (
            <li
              key={stock.symbol}
              onClick={() => handleSelectStock(stock.symbol)}
              style={{ padding: '5px', cursor: 'pointer', textAlign: 'left' }} // Align items left
            >
              {stock.name} ({stock.symbol})
            </li>
          ))}
        </ul>
  
        {/* Display the selected stock in an additional input box */}
        <div style={{ marginTop: '20px', marginRight:'10px' }}>
          <label>Selected Stock Symbol:</label>
        </div>
  
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            className='selected-symbol'
            ref={inputRef}
            type="text"
            defaultValue={selectedStock}
            readOnly
            style={{ marginRight: '10px', marginLeft:'40px', marginTop: '10px', padding: '8px', width: '200px', backgroundColor:'yellow' }}
          />
          <button onClick={handleCopy} style={{ padding: '8px' }}>
            Copy
          </button>
          {copySuccess && <span style={{ marginLeft: '10px' }}>{copySuccess}</span>}
        </div>
  
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p className='return-to-stock'>Return to Stock: </p>
          <Link className='stock-symbol-search' href="/">
            <span>
              <Image
                className='uk-pic'
                src="/UKFlag.jpg"
                alt="Portfolio Image"
                width={50} // Adjust the width
                height={50} // Adjust the height
                style={{ marginLeft: '5px' }} // Add margin for spacing
              />
            </span>
            UK
          </Link>
          <Link className='stock-symbol-search' href="/uscurrency">
            <span>
              <Image
                className='uk-pic'
                src="/USFLAG.jpg"
                alt="Portfolio Image"
                width={50} // Adjust the width
                height={50} // Adjust the height
                style={{ marginLeft: '5px' }} // Add margin for spacing
              />
            </span>
            US
          </Link>
        </div>
      
    </div>
  );
  
}


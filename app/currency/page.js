// app/page.js
'use client'; // This is a client component since we are using form and state
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('GBP');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);

  const handleConvert = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/convert', {
        amount,
        fromCurrency,
        toCurrency,
      });
      setResult(response.data.result);
    } catch (error) {
      console.error("Error fetching the conversion rate:", error);
      setResult("Error occurred.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px'}}>
      <Link className="home-link" href = "/">Home page</Link>
      
      <h1 className='currency-converter-heading'>convert
        <span>
        <Image className='uk-pic'
                    src="/moneyexchange.jpg" 
                    alt="Money Exchange Image" 
                    width={100}  // Adjust the width
                    height={100} // Adjust the height
                    style={{ marginLeft: '5px' }}  // Add margin for spacing
                />
        </span> Currency</h1>

      <form onSubmit={handleConvert}>
        <input className='currency-input'
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount" 
          required 
        />
        <select className='selector'
          value={fromCurrency} 
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          {/* Add more currencies if needed */}
        </select>
        <select className='selector'
          value={toCurrency} 
          onChange={(e) => setToCurrency(e.target.value)}
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          {/* Add more currencies if needed */}
        </select>
        <button className='convert-button' type="submit">Convert</button>
      </form>

      {result && (
        <h2 className='result'>{amount} {fromCurrency} = {result} {toCurrency}</h2>
      )}

<Link className="home-link" href = "/">Home page</Link>
    </div>
    
  );
}

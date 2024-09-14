"use client"


import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setError('');
      } else {
        setError(data.error);
        setMessage('');
      }
    } catch (error) {
      setError('An error occurred during signup');
    }
  };

  return (
    <div style={{textAlign:'center', padding: '20px', maxWidth: '100%', boxSizing: 'border-box'}}>
      <div
        style={{
          backgroundColor: 'black',
          border: '1px solid black',
          borderRadius:'8px',
          padding: '20px',
          margin: 'auto',
          maxWidth: '400px',
          boxSizing: 'border-box',
        }}
      >
        <Image className='login-pic'
                        src="/bull_bear.jpg" 
                        alt="Portfolio Image" 
                        width={150}  
                        height={150}
                        priority={true}
                        style={{marginLeft: '5px', borderRadius:'50px' }}  
                    />
        <h1 style={{ textAlign: 'center', marginBottom: '15px', color:'#c8f3c8' }}>Stock Portfolio</h1>             
        <h1 style={{ textAlign: 'center', marginBottom: '15px', color:'white' }}>Register</h1>
        <form onSubmit={handleSignup} style={{ width: '100%' }}>
          {/*<label style={{ display: 'block', marginBottom: '5px', color:'white' }}>Email:</label>*/}
          <div style={{ width: '100%', marginBottom: '10px' }}>
            <input
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#c8f3c8',
                border:'none',
                borderRadius: '5px',
                fontSize:'17px',
                color:'black',
                
                boxSizing: 'border-box',
              }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/*<label style={{ display: 'block', marginBottom: '5px', color:'white' }}>Password:</label>*/}
          <div style={{ width: '100%', marginBottom: '10px' }}>
            <input
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#c8f3c8',
                border:'none',
                borderRadius: '5px',
                color:'black',
                fontSize:'17px',
                boxSizing: 'border-box',
              }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="reg-button"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
              marginBottom: '10px',
            }}
            type="submit"
          >
            Sign Up
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link className='login-link' href="/login">Login</Link>
          </div>
        </form>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {message && <p style={{ color: 'white', marginTop: '30px' }}>{message}</p>}
      </div>
    </div>
  );
}

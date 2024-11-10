// app/login/page.js

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      router.push('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    
    <div style={{height:'100vh', backgroundColor:'black', margin:'none', textAlign:'center', padding: '0px', maxWidth: '100%', boxSizing: 'border-box', border:'none'}}>
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
                        src="/bear.jpg" 
                        alt="Portfolio Image" 
                        width={150}  
                        height={150}
                        priority={true} 
                        style={{ marginLeft: '5px', marginTop:'20px' }}  
                    />
        <h1 style={{ textAlign: 'center', marginBottom: '15px', color:'#c8f3c8' }}>Stock Portfolio</h1>           
        <h1 style={{ textAlign: 'center', marginBottom: '15px', color:'white' }}>Login</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ width: '100%', marginBottom: '10px' }}>
              <input
                style={{
                  width: '100%',
                  border:'none',
                  padding: '10px',
                  backgroundColor: '#c8f3c8',
                  borderRadius: '5px',
                  fontSize:'17px',
                  
                  color:'black',
                  boxSizing: 'border-box',
                }}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div style={{ width: '100%', marginBottom: '10px' }}>
              <input
                style={{
                  width: '100%',
                  border:'none',
                  padding: '10px',
                  backgroundColor: '#c8f3c8',
                  borderRadius: '5px',
                  fontSize:'17px',
                  color:'black',
                  
                  boxSizing: 'border-box',
                }}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              className="login-button"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              type="submit"
            >
              Login
            </button>
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <Link className="register-link" href="/signup">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
    
  );
}

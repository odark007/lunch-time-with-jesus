"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    method: "Email",
    frequency: "Weekly"
  });
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const scriptUrl = "https://script.google.com/macros/s/AKfycbz6Yfs_71_W2arw0z-KyWKZBZykhpV_eDKELPRSU4hShPGyXQueqxmm8axMAjnTAzqIEQ/exec";

    try {
      // Using no-cors is often necessary for Apps Script if you don't need to read the response body,
      // but standard fetch with POST usually works if the script returns a proper JSON response.
      const response = await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors", // Apps Script redirects can sometimes cause CORS issues with fetch
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Since we use 'no-cors', we can't check response.ok, 
      // but we assume success if no error was thrown.
      setStatus("success");
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="subscribe-page">
        <div className="container">
          <Link href="/" className="back">&larr; Home</Link>
          <div className="success-message">
            <h1>Thank you!</h1>
            <p>Form submitted successfully. You're now on our list.</p>
            <Link href="/" className="btn-home">Back to Home</Link>
          </div>
        </div>
        <style jsx>{`
          .subscribe-page {
            background: var(--color-green-deep);
            color: var(--color-white);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            width: 100%;
          }
          .back {
            color: var(--color-white);
            opacity: 0.8;
            text-decoration: none;
            font-size: 0.9rem;
          }
          .success-message {
            margin-top: 100px;
            text-align: center;
          }
          h1 {
            font-family: var(--font-display);
            font-size: 2.5rem;
            margin-bottom: 20px;
          }
          p {
            font-size: 1.1rem;
            margin-bottom: 40px;
          }
          .btn-home {
            background: var(--color-white);
            color: var(--color-green-deep);
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="subscribe-page">
      <div className="container">
        <Link href="/" className="back">&larr; Home</Link>
        
        <header>
          <h1>Subscribe</h1>
          <p>Stay updated with Lunchtime with Jesus</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="firstName">First Name</label>
            <input 
              id="firstName"
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="hello@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input 
              id="phone"
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="e.g. +233..."
            />
          </div>

          <div className="field">
            <label>How would you like to receive it?</label>
            <div className="options">
              {["Email", "WhatsApp", "SMS"].map((m) => (
                <button 
                  key={m}
                  type="button"
                  className={formData.method === m ? "active" : ""}
                  onClick={() => setFormData({...formData, method: m})}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Frequency</label>
            <div className="options">
              {["Weekly", "Once a month"].map((f) => (
                <button 
                  key={f}
                  type="button"
                  className={formData.frequency === f ? "active" : ""}
                  onClick={() => setFormData({...formData, frequency: f})}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Subscribe Now"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .subscribe-page {
          background: var(--color-green-deep);
          color: var(--color-white);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
        }
        .back {
          color: var(--color-white);
          opacity: 0.8;
          text-decoration: none;
          font-size: 0.9rem;
        }
        header {
          margin: 40px 0;
          text-align: center;
        }
        h1 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          margin-bottom: 8px;
        }
        p {
          opacity: 0.8;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        label {
          font-size: 0.9rem;
          font-weight: 500;
        }
        input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus {
          border-color: var(--color-white);
        }
        .options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .options button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 8px 16px;
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .options button.active {
          background: var(--color-white);
          color: var(--color-green-deep);
          border-color: var(--color-white);
        }
        .submit-btn {
          margin-top: 20px;
          background: var(--color-white);
          color: var(--color-green-deep);
          border: none;
          border-radius: 8px;
          padding: 16px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        }
        .submit-btn:active {
          transform: scale(0.98);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

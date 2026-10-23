'use client';

import { useState } from 'react';
import LandingLayout from '../LandingLayout';
import { API_BASE_URL } from '../../lib/api';
import '../../styles/contact.css';

const PHONE_PRIMARY = '+91 120-4502750';
const PHONE_SECONDARY = '+91 9711000022';
const EMAIL = 'info@avisaexperts.com';

const offices = [
  {
    city: 'Noida',
    country: 'India',
    address: 'B Block, Sector 2, Noida, Uttar Pradesh 201301',
    phone: PHONE_PRIMARY,
  },
  {
    city: 'Ahmedabad',
    country: 'India',
    address:
      'A-1, First Floor, Valmik Complex, opposite Kalupur Bank, near Parimal Cross Road, Ambawadi, Ahmedabad, Gujarat 380006',
    phone: PHONE_PRIMARY,
  },
  {
    city: 'New York',
    country: 'USA',
    address: '300 International Dr, Suite 100, Williamsville, NY 14221, United States',
  },
  {
    city: 'Florida',
    country: 'USA',
    address: '2012 Hollywood Blvd, Hollywood, FL 33020, USA',
  },
  {
    city: 'Seattle',
    country: 'USA',
    address: '3614 California Ave SW, Seattle, WA 98116, USA',
  },
  {
    city: 'London',
    country: 'UK',
    address: '128 City Rd, London EC1V 2NX, UK',
  },
];

const mapsQuery = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const mapsEmbed = (address) => `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/settings/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, page: 'contact' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || 'Something went wrong');
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (e) {
      setStatus('error');
      setError(e.message || 'Something went wrong. Please try again or call us.');
    }
  };

  return (
    <LandingLayout>
      <div className="contact-page">
        <section className="contact-hero">
          <div className="contact-container">
            <h1>Contact A Visa Experts</h1>
            <p>
              Talk to a visa consultant about your application — tourist, transit, business or permanent residency.
              Call us, message us, or visit one of our offices.
            </p>
            <div className="contact-hero-actions">
              <a className="contact-btn primary" href={`tel:${PHONE_PRIMARY.replace(/[^\d+]/g, '')}`}>
                Call {PHONE_PRIMARY}
              </a>
              <a className="contact-btn ghost" href="#contact-form">
                Send a message
              </a>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-container contact-top">
            <div className="contact-card">
              <h2>Talk to us</h2>
              <ul className="contact-details">
                <li>
                  <strong>Phone</strong>
                  <a href={`tel:${PHONE_PRIMARY.replace(/[^\d+]/g, '')}`}>{PHONE_PRIMARY}</a>
                </li>
                <li>
                  <strong>Phone</strong>
                  <a href={`tel:${PHONE_SECONDARY.replace(/[^\d+]/g, '')}`}>{PHONE_SECONDARY}</a>
                </li>
                <li>
                  <strong>Email</strong>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </li>
                <li>
                  <strong>Hours</strong>
                  <span>Monday to Saturday, 10:00 – 18:00 IST</span>
                </li>
              </ul>
            </div>

            <form className="contact-card contact-form" id="contact-form" onSubmit={submit}>
              <h2>Send us a message</h2>
              <div className="contact-field">
                <label htmlFor="cf-name">Full name</label>
                <input id="cf-name" type="text" value={form.name} onChange={update('name')} required />
              </div>
              <div className="contact-field">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" type="email" value={form.email} onChange={update('email')} required />
              </div>
              <div className="contact-field">
                <label htmlFor="cf-phone">Phone</label>
                <input id="cf-phone" type="tel" value={form.phone} onChange={update('phone')} required />
              </div>
              <div className="contact-field">
                <label htmlFor="cf-message">How can we help?</label>
                <textarea id="cf-message" rows={5} value={form.message} onChange={update('message')} required />
              </div>
              <button className="contact-btn primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              {status === 'sent' && (
                <p className="contact-note success">Thank you — your message has been sent. We will get back to you soon.</p>
              )}
              {status === 'error' && <p className="contact-note error">{error}</p>}
            </form>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-container">
            <h2 className="contact-h2">Our offices</h2>
            <div className="contact-offices">
              {offices.map((office) => (
                <div className="contact-office" key={`${office.city}-${office.country}`}>
                  <h3>
                    {office.city} <span>{office.country}</span>
                  </h3>
                  <p>{office.address}</p>
                  <div className="contact-office-actions">
                    {office.phone && (
                      <a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`}>{office.phone}</a>
                    )}
                    <a href={mapsQuery(office.address)} target="_blank" rel="noopener noreferrer">
                      Get directions →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-container">
            <h2 className="contact-h2">Find us in Noida</h2>
            <div className="contact-map">
              <iframe
                title="A Visa Experts — Noida office map"
                src={mapsEmbed(offices[0].address)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default Contact;

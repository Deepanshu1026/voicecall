import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import '../styles/appointmentPayment.css';

const UPI_ID = 'vyapar.167726728627@hdfcbank';
const PAYEE_NAME = 'A Visa Experts';
const WHATSAPP_NUMBER = '919711000022';

const AppointmentPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentData = location.state?.appointmentData;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);

  const planAmount = useMemo(() => {
    if (!appointment) return 0;
    const plan = appointment.plan?.toLowerCase();
    if (plan === 'premium') return 1770;
    if (plan === 'advance') return 1180;
    return 0;
  }, [appointment]);

  const upiUrl = useMemo(() => {
    if (!appointment || !planAmount) return '';
    const note = `Appointment ${appointment.reference_id || ''}`.trim();
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&tn=${encodeURIComponent(note)}&am=${planAmount}&cu=INR`;
  }, [appointment, planAmount]);

  const qrCodeUrl = useMemo(() => {
    if (!upiUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUrl)}`;
  }, [upiUrl]);

  const whatsappLink = useMemo(() => {
    if (!appointment) return `https://wa.me/${WHATSAPP_NUMBER}`;
    const message = `Hi, I have paid ₹${planAmount} for my ${appointment.plan?.toUpperCase()} appointment (Ref: ${appointment.reference_id}). Please verify my payment and confirm the meeting.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [appointment, planAmount]);

  useEffect(() => {
    if (!appointmentData) {
      navigate('/appointment', { replace: true });
      return;
    }

    const createAppointment = async () => {
      try {
        setLoading(true);
        const res = await appointmentAPI.book(appointmentData);
        const data = res.data;
        setAppointment({
          reference_id: data.reference_id,
          plan: data.appointment?.plan || appointmentData.selected_plan,
          name: data.appointment?.name || appointmentData.name,
          datetime: data.appointment?.datetime,
          time: data.appointment?.time,
          mode: data.appointment?.mode,
          address: data.appointment?.address,
          price: data.current_prices?.[data.appointment?.plan?.toLowerCase()] || String(planAmount),
        });
      } catch (err) {
        console.error('Appointment booking failed:', err);
        setError(err.response?.data?.message || err.message || 'Failed to create appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createAppointment();
  }, [appointmentData, navigate, planAmount]);

  const handlePaid = () => {
    setBooking(true);
    setTimeout(() => {
      setPaid(true);
      setBooking(false);
    }, 800);
  };

  const handleBack = () => {
    navigate('/appointment');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  if (!appointmentData) return null;

  return (
    <div className="appointment-payment-page">
      <div className="payment-container">
        {/* Receipt Section */}
        <div className="payment-receipt">
          <div className="receipt-header">
            <div className="receipt-icon">🧾</div>
            <h1>Appointment Payment</h1>
            <p>Complete your booking by paying the consultation fee</p>
          </div>

          {loading ? (
            <div className="payment-loading">
              <div className="payment-spinner" />
              <p>Creating your appointment...</p>
            </div>
          ) : error ? (
            <div className="payment-error">
              <div className="payment-error-icon">⚠️</div>
              <p>{error}</p>
              <button onClick={handleBack}>Back to Appointment</button>
            </div>
          ) : paid ? (
            <div className="payment-success">
              <div className="payment-success-icon">✅</div>
              <h2>Payment Confirmation Requested</h2>
              <p>
                Thank you! We have received your payment request. Our team will verify your
                transaction and confirm your meeting shortly.
              </p>
              {appointment?.reference_id && (
                <div className="reference-box">
                  <span>Reference ID</span>
                  <strong>{appointment.reference_id}</strong>
                </div>
              )}
              <div className="payment-actions">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  Share Screenshot on WhatsApp
                </a>
                <button onClick={handleGoHome} className="btn-secondary">
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="receipt-details">
                <div className="receipt-row">
                  <span>Plan</span>
                  <strong>{appointment?.plan?.toUpperCase() || '—'}</strong>
                </div>
                <div className="receipt-row">
                  <span>Consultant</span>
                  <strong>{appointment?.plan?.toLowerCase() === 'premium' ? 'Mr. Kaveesh Kapoor' : 'Senior Manager'}</strong>
                </div>
                <div className="receipt-row">
                  <span>Name</span>
                  <strong>{appointment?.name || '—'}</strong>
                </div>
                <div className="receipt-row">
                  <span>Date & Time</span>
                  <strong>{appointment?.datetime ? new Date(appointment.datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</strong>
                </div>
                <div className="receipt-row">
                  <span>Mode</span>
                  <strong>{appointment?.mode ? appointment.mode.charAt(0).toUpperCase() + appointment.mode.slice(1) : '—'}</strong>
                </div>
                {appointment?.address && (
                  <div className="receipt-row">
                    <span>Location</span>
                    <strong>{appointment.address}</strong>
                  </div>
                )}
                {appointment?.reference_id && (
                  <div className="receipt-row">
                    <span>Reference ID</span>
                    <strong className="reference-id">{appointment.reference_id}</strong>
                  </div>
                )}
              </div>

              <div className="amount-box">
                <span>Total Amount</span>
                <div className="amount">₹{planAmount}</div>
                <small>Includes GST</small>
              </div>

              <div className="payment-note">
                <p>
                  Scan the QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.) and complete the payment.
                </p>
              </div>

              <div className="payment-actions">
                <button onClick={handlePaid} disabled={booking} className="btn-primary">
                  {booking ? 'Processing...' : 'I have completed the payment'}
                </button>
                <button onClick={handleBack} className="btn-secondary">
                  Back to Appointment
                </button>
              </div>
            </>
          )}

          <div className="secure-badge">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            </svg>
            Secured by A Visa Experts
          </div>
        </div>

        {/* QR Section */}
        <div className="payment-qr">
          {!loading && !error && !paid && appointment && (
            <>
              <div className="qr-card">
                <div className="qr-wrapper">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="UPI QR Code" className="qr-image" />
                  ) : (
                    <div className="qr-placeholder">Generating QR...</div>
                  )}
                  <img src="/images/user/tmlogo 1.webp" alt="A Visa Experts" className="qr-logo" />
                </div>
                <p className="qr-instruction">Scan with any UPI app</p>
              </div>

              <div className="upi-details">
                <div className="upi-row">
                  <span>UPI ID</span>
                  <strong>{UPI_ID}</strong>
                </div>
                <div className="upi-row">
                  <span>Payee Name</span>
                  <strong>{PAYEE_NAME}</strong>
                </div>
                <div className="upi-row">
                  <span>Amount</span>
                  <strong>₹{planAmount}</strong>
                </div>
              </div>

              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-help">
                <span>Need help? Share screenshot on WhatsApp</span>
                <strong>+91 9711000022</strong>
              </a>
            </>
          )}

          {(loading || error || paid) && (
            <div className="qr-empty">
              <div className="qr-empty-icon">💳</div>
              <p>{loading ? 'Preparing payment details...' : error ? 'Unable to load payment details' : 'Payment confirmation pending'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentPayment;

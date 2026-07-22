import { useState, useEffect, useRef, useCallback } from 'react';
import LandingLayout from '../components/user/LandingLayout';
import '../styles/appointment.css';

const timeSlots = {
  Basic: [
    '11:00:00', '11:30:00', '12:00:00', '12:30:00',
    '13:00:00', '13:30:00', '14:00:00', '16:00:00',
    '16:30:00', '17:00:00', '17:30:00', '18:00:00', '18:30:00',
  ],
  Advance: [
    '11:00:00', '11:30:00', '12:00:00', '12:30:00',
    '13:00:00', '13:30:00', '14:00:00', '16:00:00',
    '16:30:00', '17:00:00', '17:30:00', '18:00:00', '18:30:00',
  ],
  Premium: ['14:00:00', '15:00:00', '18:00:00', '19:00:00'],
};

const getNextAvailableDate = (date) => {
  const d = new Date(date);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const todayStr = getNextAvailableDate(new Date());
const tomorrowStr = getNextAvailableDate(new Date(Date.now() + 86400000));
const maxDateStr = getNextAvailableDate(new Date(Date.now() + 7 * 86400000));

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getAvailableSlots = (plan, selectedDate) => {
  if (!selectedDate) return [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(selectedDate);
  if (selected.getDay() === 0) return [];
  if (selected < today) return [];
  const isToday = selected.toDateString() === today.toDateString();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  return timeSlots[plan].filter((slot) => {
    const [hours, minutes] = slot.split(':').map(Number);
    if (!isToday) return true;
    if (hours > currentHour + 1) return true;
    if (hours === currentHour + 1 && minutes >= currentMinutes) return true;
    return false;
  });
};

const Appointment = () => {
  const [selectedPlan, setSelectedPlan] = useState('Advance');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    query: '',
    mode: 'online',
    address: 'Delhi',
    date: todayStr,
  });
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [floatingAlert, setFloatingAlert] = useState({
    show: false,
    title: '',
    message: '',
    success: false,
  });
  const [premiumPopup, setPremiumPopup] = useState({ show: false, message: '' });
  const scheduleRef = useRef(null);

  const refreshSlots = useCallback(() => {
    const slots = getAvailableSlots(selectedPlan, formData.date);
    setAvailableSlots(slots);
    if (selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedPlan, formData.date, selectedTime]);

  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  const showFloatingAlert = (title, message, success = false) => {
    setFloatingAlert({ show: true, title, message, success });
    setTimeout(() => {
      setFloatingAlert((prev) => ({ ...prev, show: false }));
    }, 6000);
  };

  const hideFloatingAlert = () => {
    setFloatingAlert((prev) => ({ ...prev, show: false }));
  };

  const showPremiumPopup = (message) => {
    setPremiumPopup({ show: true, message });
    setTimeout(() => {
      setPremiumPopup({ show: false, message: '' });
    }, 2000);
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    setSelectedTime('');
    if (plan === 'Premium') {
      if (formData.date === todayStr) {
        setFormData((prev) => ({ ...prev, date: tomorrowStr }));
        showPremiumPopup('Premium meetings start from tomorrow. Date updated automatically.');
      }
    } else {
      setFormData((prev) => ({ ...prev, date: todayStr }));
    }
    scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDateChange = (e) => {
    let value = e.target.value;
    const selected = new Date(value);
    if (selected.getDay() === 0) {
      selected.setDate(selected.getDate() + 1);
      value = selected.toISOString().split('T')[0];
      showPremiumPopup('Our office is closed on Sundays. Next available date selected automatically.');
    }
    if (selectedPlan === 'Premium' && value === todayStr) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      value = getNextAvailableDate(tomorrow);
      showPremiumPopup('Premium meetings are only available from tomorrow. Date updated automatically.');
    }
    setFormData((prev) => ({ ...prev, date: value }));
    setSelectedTime('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContactInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, contact: raw }));
    if (formErrors.contact) {
      setFormErrors((prev) => ({ ...prev, contact: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || !/^[A-Za-z\s]+$/.test(formData.name)) {
      errors.name = 'Please enter a valid name (letters only).';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      errors.contact = 'Please enter a valid 10-digit contact number.';
    }
    if (!formData.query.trim()) {
      errors.query = 'Please enter your query.';
    }
    if (!formData.mode) {
      errors.mode = 'Please select a meeting mode.';
    }
    if (formData.mode === 'offline' && !formData.address) {
      errors.address = 'Please select an office address.';
    }
    if (!formData.date) {
      errors.date = 'Please select a preferred date.';
    }
    if (!selectedPlan) {
      errors.plan = 'Please select a plan.';
    }
    if (!selectedTime) {
      errors.time = 'Please select a time slot.';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.plan) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const selectedDate = new Date(formData.date);
  const isSunday = selectedDate.getDay() === 0;
  const isPremiumBlocked = selectedPlan === 'Premium' && formData.date === todayStr;

  return (
    <LandingLayout>
      <div className="appointment-page">
        {/* Offer banner */}
        <div className="offer-screen-container">
          <img
            className="offer_screen"
            src="/images/user/25-off-offer.png"
            alt="25% off offer"
          />
        </div>

        {/* Pricing cards */}
        <div className="pricing-section">
          <div className="pricing-container">
            {/* Basic Plan */}
            <div
              className="card basic"
              onClick={() => handlePlanChange('Basic')}
              role="button"
              tabIndex={0}
              aria-pressed={selectedPlan === 'Basic'}
              onKeyDown={(e) => e.key === 'Enter' && handlePlanChange('Basic')}
            >
              <div className={`circle-checkbox ${selectedPlan === 'Basic' ? 'checked' : ''}`} />
              <div className="card-content">
                <h3>Customer Support</h3>
                <div className="price">
                  Free <del>₹599</del>
                </div>
                <ul>
                  <li>10-minute team meeting</li>
                  <li>Free of charge</li>
                  <li>Introduction to visa types & offers</li>
                  <li>General Q&A session</li>
                  <li>Bring your passport</li>
                  <li>Ideal for quick visa info</li>
                </ul>
                <button type="button">Select Plan</button>
              </div>
            </div>

            {/* Advanced Plan */}
            <div
              className="card popular"
              onClick={() => handlePlanChange('Advance')}
              role="button"
              tabIndex={0}
              aria-pressed={selectedPlan === 'Advance'}
              onKeyDown={(e) => e.key === 'Enter' && handlePlanChange('Advance')}
            >
              <div className={`circle-checkbox ${selectedPlan === 'Advance' ? 'checked' : ''}`} />
              <div className="card-content">
                <span className="badge">Most Popular</span>
                <h3>Senior Manager</h3>
                <div className="price">
                  ₹1180 <span className="gst-note">(GST Included)</span>
                </div>
                <ul>
                  <li>15-minute Manager Meeting</li>
                  <li>In-depth consultation on specific visa types</li>
                  <li>Detailed explanations of eligibility requirements</li>
                  <li>Bring your passport</li>
                  <li>Ideal for clients who need personalized advice</li>
                </ul>
                <button type="button">Select Plan</button>
              </div>
            </div>

            {/* Premium Plan */}
            <div
              className="card premium"
              onClick={() => handlePlanChange('Premium')}
              role="button"
              tabIndex={0}
              aria-pressed={selectedPlan === 'Premium'}
              onKeyDown={(e) => e.key === 'Enter' && handlePlanChange('Premium')}
            >
              <div className={`circle-checkbox ${selectedPlan === 'Premium' ? 'checked' : ''}`} />
              <div className="card-content">
                <h3>Chairman</h3>
                <div className="price">
                  ₹1770 <span className="gst-note">(GST Included)</span>
                </div>
                <ul>
                  <li>20-minute meeting with Chairman Mr. Kaveesh Kapoor</li>
                  <li>Customized visa strategy</li>
                  <li>Case Manager support throughout the process</li>
                  <li>Bring your passport</li>
                  <li>Ideal for full visa assistance</li>
                </ul>
                <button type="button">Select Plan</button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="section-divider" id="schedule-section" ref={scheduleRef}>
          <span>Schedule Your Meeting</span>
        </div>

        {/* Meeting Form Section */}
        <div className="form-container">
          <form id="meeting-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
              />
              {formErrors.name && <p className="error-text">{formErrors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span style={{ fontSize: 'x-small', color: 'gray' }}>(Optional*)</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
              {formErrors.email && <p className="error-text">{formErrors.email}</p>}
            </div>

            <div className="form-group contact-state-group">
              <div className="contact-field">
                <label htmlFor="contact">Contact Number</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleContactInput}
                  placeholder="Enter your contact number"
                  required
                  maxLength={10}
                />
                <div id="contact-error" className="contact-error">
                  This number has already booked a Basic plan.
                </div>
                {formErrors.contact && <p className="error-text">{formErrors.contact}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="querry">Querry Related Visa</label>
              <textarea
                id="querry"
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                placeholder="Enter your Querry"
                required
              />
              {formErrors.query && <p className="error-text">{formErrors.query}</p>}
            </div>

            <input type="hidden" name="time_slot" value={selectedTime} />
            <input type="hidden" name="datetime" value={`${formData.date} ${selectedTime}`} />

            <div className="form-group">
              <h3>Select Mode of Meeting</h3>
              <div className="mode-selection">
                {/* Online Meeting Option */}
                <label
                  className={`mode-option ${formData.mode === 'online' ? 'selected' : ''}`}
                  id="online-meeting-option"
                  onClick={() => setFormData((prev) => ({ ...prev, mode: 'online' }))}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="online"
                    checked={formData.mode === 'online'}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="mode-radio" />
                  <div className="mode-content">
                    <span className="mode-badge">Recommended</span>
                    <div className="mode-header">
                      <h4 className="mode-title">Online Meeting</h4>
                    </div>
                    <p className="mode-description">
                      Connect with our expert from anywhere through secure video conferencing.
                    </p>
                    <ul className="mode-features">
                      <li>HD Video Quality</li>
                      <li>Screen Sharing</li>
                      <li>No Travel Required</li>
                    </ul>
                  </div>
                </label>

                {/* Office Visit Option */}
                <label
                  className={`mode-option ${formData.mode === 'offline' ? 'selected' : ''}`}
                  id="offline-meeting-option"
                  onClick={() => setFormData((prev) => ({ ...prev, mode: 'offline' }))}
                >
                  <span className="passport-badge">Bring Your Passport while visiting office</span>
                  <input
                    type="radio"
                    name="mode"
                    value="offline"
                    checked={formData.mode === 'offline'}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="mode-radio" />
                  <div className="mode-content">
                    <div className="mode-header">
                      <h4 className="mode-title">Office Visit Meeting</h4>
                    </div>
                    <p className="mode-description">
                      Visit our office for an in-person consultation.
                    </p>
                    <div className="address-box">
                      <label className="address-line">
                        <input
                          type="radio"
                          id="delhicheak"
                          name="address"
                          value="Delhi"
                          checked={formData.address === 'Delhi'}
                          onChange={handleInputChange}
                        />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4338CA" strokeWidth="2" />
                          <path d="M12 8V12L15 15" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span> Sector 2, Noida, Uttar Pradesh 201301</span>
                      </label>
                      <label className="address-line">
                        <input
                          type="radio"
                          name="address"
                          value="Gujarat"
                          checked={formData.address === 'Gujarat'}
                          onChange={handleInputChange}
                        />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4338CA" strokeWidth="2" />
                          <path d="M12 8V12L15 15" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span> Valmik Complex, Shanti Sadan Society, Ahmedabad, Gujarat 380006</span>
                      </label>
                    </div>
                  </div>
                </label>
              </div>
              {formErrors.mode && <p className="error-text">{formErrors.mode}</p>}
              {formErrors.address && <p className="error-text">{formErrors.address}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="date">Preferred Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                min={todayStr}
                max={maxDateStr}
                onChange={handleDateChange}
                required
              />
              {formErrors.date && <p className="error-text">{formErrors.date}</p>}
            </div>

            <input type="hidden" id="selected-plan" name="selected-plan" value={selectedPlan} />

            <div className="form-group">
              <label className="form_lable" htmlFor="time-slots">Available Time Slots</label>
              <div className="timing-grid" id="time-slots">
                {isSunday ? (
                  <div className="sunday-notice">
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                    <h4>Sunday Appointments Not Available</h4>
                    <p>Please select a weekday (Monday-Saturday) for your appointment.</p>
                  </div>
                ) : isPremiumBlocked ? (
                  <div className="premium-notice">
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                    <h4>Premium Meetings Notice</h4>
                    <p>Premium meetings can only be scheduled starting tomorrow. Please select a future date.</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <div
                      key={slot}
                      className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedTime === slot}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedTime(slot)}
                    >
                      <label className="label-slot">
                        <input
                          type="radio"
                          name="time_slot"
                          value={slot}
                          checked={selectedTime === slot}
                          onChange={() => setSelectedTime(slot)}
                          required
                        />
                        {formatTime(slot)}
                        <div className="slot-count" title="1 slot available">
                          1<br />Slot
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="no-slots">
                    <h4>No Available Slots</h4>
                    <p>No available slots for the selected date and plan.</p>
                  </div>
                )}
              </div>
              {formErrors.time && <p className="error-text">{formErrors.time}</p>}
            </div>

            <button type="submit">Schedule Meeting</button>
          </form>
        </div>

        {/* Success Modal */}
        {showModal && (
          <div id="successModal" className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">✓</div>
              <h3 className="modal-title">Success!</h3>
              <p className="modal-message">Your appointment has been scheduled successfully.</p>
              <button className="modal-button" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        )}

        {/* Floating Alert */}
        {floatingAlert.show && (
          <div id="floating-alert" className={`floating-alert ${floatingAlert.success ? 'success' : ''} show`}>
            <div className="icon">!</div>
            <div className="content">
              <div className="title">{floatingAlert.title}</div>
              <div className="message">{floatingAlert.message}</div>
            </div>
            <div className="close" onClick={hideFloatingAlert}>
              ×
            </div>
          </div>
        )}

        {/* Premium Popup */}
        {premiumPopup.show && (
          <div className="premium-popup show">
            <div className="premium-popup-content">
              <div className="premium-popup-icon">⚠️</div>
              <p className="premium-popup-message">{premiumPopup.message}</p>
            </div>
          </div>
        )}
      </div>
    </LandingLayout>
  );
};

export default Appointment;

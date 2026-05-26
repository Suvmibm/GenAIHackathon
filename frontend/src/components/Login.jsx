import React, { useState } from 'react';

// Static registered user table from the provided screenshot
const REGISTERED_USERS = [
  { name: 'Hitesh TK', mobile: '9702003880', password: '3880' },
  { name: 'Aneesh Kumar', mobile: '9945469202', password: '9202' },
  { name: 'Kurup Prasad', mobile: '9820607626', password: '7626' },
  { name: 'Nirupmay Kumar', mobile: '9923006644', password: '6644' },
  { name: 'Sanjeev Vadera', mobile: '9823006888', password: '6888' },
  { name: 'Himanshu Jain', mobile: '9823006786', password: '6786' },
  { name: 'Kapil Singhal', mobile: '9819818523', password: '8523' },
  { name: 'Gautam Sehdev', mobile: '9823006327', password: '6327' },
  { name: 'Tejasvi Bishnoi', mobile: '9702003805', password: '3805' },
  { name: 'Rishi Aurora', mobile: '9820193819', password: '3819' },
  { name: 'Shamindra Basu', mobile: '9819845117', password: '5117' },
  { name: 'Harish Pani', mobile: '9880416595', password: '6595' },
  { name: 'Abhishek Mathur', mobile: '9767894595', password: '4595' },
  { name: 'Jignesh Karia', mobile: '8104661139', password: '1139' },
  { name: 'Surendra Kaipa', mobile: '9958111239', password: '1239' },
  { name: 'Mayank Mathur', mobile: '8447754185', password: '4185' },
];

export default function Login({ onLoginSuccess }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    if (!trimmedMobile || !trimmedPassword) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);

    // Simulate network delay for a rich interaction feel
    setTimeout(() => {
      // 1. Check Superadmin
      if (trimmedMobile.toLowerCase() === 'superadmin' && trimmedPassword === 'superadmin@123') {
        setLoading(false);
        onLoginSuccess({
          name: 'Superadmin',
          mobile: 'superadmin',
          role: 'superadmin'
        });
        return;
      }

      // 2. Check Standard Juries
      const matchedUser = REGISTERED_USERS.find(
        (user) => user.mobile === trimmedMobile && user.password === trimmedPassword
      );

      if (matchedUser) {
        setLoading(false);
        onLoginSuccess({
          name: matchedUser.name,
          mobile: matchedUser.mobile,
          role: 'jury'
        });
      } else {
        setLoading(false);
        setError('Invalid Mobile Number or Password. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="login-screen-overlay">
      
      {/* Full Screen Cyber Graphic Background */}
      <div className="login-fullscreen-bg-container">
        <img 
          src="/ai_hand_bg.png" 
          alt="Futuristic Neural Network Background" 
          className="login-fullscreen-bg"
        />
        {/* Dark Tech overlay for readability */}
        <div className="login-fullscreen-overlay-shader"></div>
      </div>

      {/* Centered Login Card Panel */}
      <div className="login-card-container">
        {/* Triple Brand Row: VI | GenAIHackathon | IBM */}
        <div className="login-logo-row">
          <img 
            src="/vi.ico" 
            alt="Vi" 
            className="login-vi-logo"
          />
          <img 
            src="/icons/logo 1.png" 
            alt="GenAI Hackathon" 
            className="login-brand-logo"
          />
          <div className="login-ibm-logo-wrapper">
            <svg width="60" height="22" viewBox="0 7.5 24 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.544 15.993c.038 0 .06-.017.06-.053v-.036c0-.035-.022-.052-.06-.052h-.09v.14zm-.09.262h-.121v-.498h.225c.112 0 .169.066.169.157 0 .079-.036.129-.09.15l.111.19h-.133l-.092-.17h-.07zm.434-.222v-.062c0-.2-.157-.357-.363-.357a.355.355 0 00-.363.357v.062c0 .2.156.358.363.358a.355.355 0 00.363-.358zm-.838-.03c0-.28.212-.492.475-.492.264 0 .475.213.475.491 0 .279-.211.491-.475.491a.477.477 0 01-.475-.49zM16.21 8.13l-.216-.624h-3.56v.624zm.413 1.19l-.216-.623h-3.973v.624zm2.65 7.147h3.107v-.624h-3.108zm0-1.192h3.107v-.623h-3.108zm0-1.19h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-3.555l-.175.504-.175-.504h-3.555v.624h1.865v-.574l.2.574h3.33l.2-.574zm1.864-1.815h-3.142l-.217.624h3.359zm-7.46 3.006h1.865v-.624h-1.865zm0 1.19h1.865v-.623h-1.865zm-1.243 1.191h3.108v-.623h-3.108zm0 1.192h3.108v-.624h-3.108zm6.386-8.961l-.216.624h3.776v-.624zm-.629 1.815h4.19v-.624h-3.974zm-4.514 1.19h3.359l-.216-.623h-3.143zm2.482 2.383h2.496l.218-.624h-2.932zm.417 1.19h1.662l.218-.623h-2.098zm.416 1.191h.83l.218-.623h-1.266zm.414 1.192l.217-.624h-.432zm-12.433-.006l4.578.006c.622 0 1.18-.237 1.602-.624h-6.18zm4.86-3v.624h2.092c0-.216-.03-.425-.083-.624zm-3.616.624h1.865v-.624H6.217zm3.617-3.573h2.008c.053-.199.083-.408.083-.624H9.834zm-3.617 0h1.865v-.624H6.217zM9.55 7.507H4.973v.624h6.18a2.36 2.36 0 00-1.602-.624zm2.056 1.191H4.973v.624h6.884a2.382 2.382 0 00-.25-.624zm-5.39 2.382v.624h4.87c.207-.176.382-.387.519-.624zm4.87 1.191h-4.87v.624h5.389a2.39 2.39 0 00-.519-.624zm-6.114 3.006h6.634c.11-.193.196-.402.25-.624H4.973zM0 8.13h4.352v-.624H0zm0 1.191h4.352v-.624H0zm1.243 1.191h1.865v-.624H1.243zm0 1.191h1.865v-.624H1.243zm0 1.19h1.865v-.623H1.243zm0 1.192h1.865v-.624H1.243zM0 15.276h4.352v-.623H0zm0 1.192h4.352v-.624H0Z" fill="#0F62FE" />
            </svg>
          </div>
        </div>

        <h2 className="login-card-heading">
          Sign in with Registered Mobile Number
        </h2>

        {error && (
          <div className="login-error-alert animate-shake">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <input
              type="text"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={loading}
              className="login-input-field"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="login-input-field"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? (
              <div className="login-spinner"></div>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

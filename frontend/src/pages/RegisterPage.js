
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ✅ Field moved OUTSIDE to prevent re-render focus issue */
const Field = ({ label, name, type='text', placeholder, form, setForm, getFieldError }) => (
  <div>
    <label style={{
      display:'block',
      marginBottom:6,
      fontSize:13,
      color:'var(--text2)'
    }}>
      {label}
    </label>

    <input
      type={type}
      value={form[name]}
      onChange={(e) => setForm(prev => ({
        ...prev,
        [name]: e.target.value
      }))}
      required
      placeholder={placeholder}
      style={getFieldError(name) ? { borderColor:'var(--accent2)' } : {}}
    />

    {getFieldError(name) && (
      <p style={{
        fontSize:12,
        color:'var(--accent2)',
        marginTop:4
      }}>
        {getFieldError(name)}
      </p>
    )}
  </div>
);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:'',
    email:'',
    password:'',
    confirmPassword:''
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ✅ Get error for specific field */
  const getFieldError = (field) =>
    fieldErrors.find(e => e.field === field)?.message;

  /* ✅ Basic client validation (important for assignment) */
  const validateForm = () => {
    const errors = [];

    if (form.password.length < 8) {
      errors.push({ field: 'password', message: 'Minimum 8 characters required' });
    }

    if (form.password !== form.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    /* ✅ Client-side validation */
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:16,
      background:'radial-gradient(ellipse at 40% 60%, rgba(255,101,132,0.06) 0%, transparent 60%)'
    }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>⬡</div>
          <h1 style={{
            fontFamily:'var(--font-display)',
            fontWeight:800,
            fontSize:28
          }}>
            Join TaskFlow
          </h1>
          <p style={{ color:'var(--text2)', marginTop:6 }}>
            Create your free account
          </p>
        </div>

        {/* Card */}
        <div className="card">

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display:'flex',
              flexDirection:'column',
              gap:16
            }}
          >
            <Field
              label="Full Name"
              name="name"
              placeholder="John Doe"
              form={form}
              setForm={setForm}
              getFieldError={getFieldError}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              form={form}
              setForm={setForm}
              getFieldError={getFieldError}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Min 8 chars"
              form={form}
              setForm={setForm}
              getFieldError={getFieldError}
            />

            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              form={form}
              setForm={setForm}
              getFieldError={getFieldError}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                marginTop:8,
                padding:'12px',
                fontSize:15
              }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{
            textAlign:'center',
            marginTop:20,
            color:'var(--text2)',
            fontSize:14
          }}>
            Already have an account?{' '}
            <Link to="/login">Sign in →</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


/**
 * @module RegisterPage
 * @description 
 * User registration page with:
 * - Form validation
 * - Password confirmation
 * - Error handling
 * - Success redirection
 * 
 * @features
 * - Client-side validation
 * - Secure password handling
 * - Loading states
 * - Accessibility compliance
 * 
 * @dependencies
 * - react-router-dom: Navigation
 * - axios (optional): API calls
 * 
 * @author Kelanzy
 * @created 2023-11-20
 * @version 1.2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Optional for real API calls

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * @interface RegisterForm
 * @description Registration form data structure
 * 
 * @property {string} name - User's full name
 * @property {string} email - Valid email address
 * @property {string} password - Secure password
 * @property {string} confirmPassword - Password confirmation
 */
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * @interface ValidationError
 * @description Structure for field-specific validation errors
 * 
 * @property {string} field - The form field name
 * @property {string} message - Error message
 */
interface ValidationError {
  field: string;
  message: string;
}

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

/**
 * @function RegisterPage
 * @description User registration interface
 * 
 * @state
 * - form: Registration form data
 * - errors: Validation errors
 * - isLoading: API request status
 * - serverError: General error message
 * 
 * @returns {React.ReactElement} The registration page component
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  /**
   * @function validateForm
   * @description Performs client-side form validation
   * 
   * @returns {boolean} True if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    // Name validation
    if (!form.name.trim()) {
      newErrors.push({ field: 'name', message: 'Name is required' });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Password validation
    if (form.password.length < 8) {
      newErrors.push({ 
        field: 'password', 
        message: 'Password must be at least 8 characters' 
      });
    }

    // Password match validation
    if (form.password !== form.confirmPassword) {
      newErrors.push({ 
        field: 'confirmPassword', 
        message: 'Passwords do not match' 
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /**
   * @function handleChange
   * @description Handles form input changes and clears related errors
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    setErrors(prev => prev.filter(error => error.field !== name));
  };

  /**
   * @function handleRegister
   * @description Handles form submission and registration process
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 🔧 Replace with actual API call
      const response = await axios.post('/api/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });

      // On successful registration
      if (response.data.success) {
        navigate('/login', { 
          state: { 
            registrationSuccess: true,
            email: form.email 
          } 
        });
      } else {
        setServerError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Network error'
        : 'Registration failed';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function getFieldError
   * @description Retrieves error message for a specific field
   * 
   * @param {string} fieldName - The form field name
   * @returns {string | undefined} Error message if exists
   */
  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(e => e.field === fieldName)?.message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        {/* Header Section */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join our community today
          </p>
        </header>

        {/* Error Display */}
        {serverError && (
          <div 
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
            role="alert"
          >
            <p className="font-medium">Registration Error</p>
            <p>{serverError}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                getFieldError('name') ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="John Doe"
              aria-describedby={getFieldError('name') ? "name-error" : undefined}
            />
            {getFieldError('name') && (
              <p id="name-error" className="mt-1 text-sm text-red-600">
                {getFieldError('name')}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                getFieldError('email') ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="you@example.com"
              aria-describedby={getFieldError('email') ? "email-error" : undefined}
            />
            {getFieldError('email') && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {getFieldError('email')}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className={`w-full px-4 py-3 rounded-lg border ${
                getFieldError('password') ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="At least 8 characters"
              aria-describedby={getFieldError('password') ? "password-error" : undefined}
            />
            {getFieldError('password') && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {getFieldError('password')}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                getFieldError('confirmPassword') ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="Re-enter your password"
              aria-describedby={getFieldError('confirmPassword') ? "confirm-error" : undefined}
            />
            {getFieldError('confirmPassword') && (
              <p id="confirm-error" className="mt-1 text-sm text-red-600">
                {getFieldError('confirmPassword')}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">↻</span>
                Registering...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-green-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
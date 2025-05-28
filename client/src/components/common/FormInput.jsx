// FormInput.jsx - Reusable form input component
import React from 'react';

const FormInput = ({ 
  id, 
  label, 
  type = "text", 
  placeholder, 
  name, 
  value, 
  onChange, 
  required = false, 
  error,
  className = "",
  autoComplete = "on"
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
      id={id}
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
    />
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
  </div>
);

export default FormInput;
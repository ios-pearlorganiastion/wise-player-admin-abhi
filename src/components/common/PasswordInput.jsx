import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ label, value, onChange, placeholder, required, minLength, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      {label ? <label className="block text-subtle text-xs font-medium mb-1.5">{label}</label> : null}
      <div className="relative flex items-center">
        <FiLock className="absolute left-3 z-10 text-subtle text-sm pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          disabled={disabled}
          className="w-full bg-surface2 border border-line rounded-lg pl-10 pr-11 h-11 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 text-ink/70 hover:text-maroon-light transition-colors z-10"
        >
          {show ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
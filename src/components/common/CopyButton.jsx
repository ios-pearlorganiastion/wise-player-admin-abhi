import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="text-subtle hover:text-maroon-light transition-colors shrink-0"
    >
      {copied ? <FiCheck className="text-emerald-400 text-xs" /> : <FiCopy className="text-xs" />}
    </button>
  );
};

export default CopyButton;
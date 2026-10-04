import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, Check } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError(null);
      setShake(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric
    const clean = val.replace(/\D/g, '');
    setError(null);

    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // If pasted multiple digits
    if (clean.length > 1) {
      const pasted = clean.slice(0, 4).split('');
      const next = ['', '', '', ''];
      pasted.forEach((ch, i) => {
        if (i < 4) next[i] = ch;
      });
      setDigits(next);
      const targetFocus = Math.min(pasted.length, 3);
      inputRefs[targetFocus].current?.focus();
      if (pasted.length === 4) {
        validatePin(next.join(''));
      }
      return;
    }

    const next = [...digits];
    next[index] = clean[clean.length - 1];
    setDigits(next);

    // Auto-focus next input
    if (index < 3) {
      inputRefs[index + 1].current?.focus();
    } else {
      // Last digit filled, auto validate
      const completePin = [...next.slice(0, 3), clean[clean.length - 1]].join('');
      validatePin(completePin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    } else if (e.key === 'Enter') {
      const pinStr = digits.join('');
      if (pinStr.length === 4) {
        validatePin(pinStr);
      }
    }
  };

  const validatePin = (pinToTest: string) => {
    if (pinToTest === currentPin) {
      setError(null);
      onSuccess();
    } else {
      setError('PIN incorreto. Tente novamente.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setDigits(['', '', '', '']);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    }
  };

  const handleNumpadClick = (num: string) => {
    setError(null);
    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const next = [...digits];
      next[firstEmptyIndex] = num;
      setDigits(next);
      if (firstEmptyIndex === 3) {
        validatePin(next.join(''));
      } else {
        inputRefs[firstEmptyIndex + 1].current?.focus();
      }
    }
  };

  const handleNumpadBackspace = () => {
    setError(null);
    for (let i = 3; i >= 0; i--) {
      if (digits[i] !== '') {
        const next = [...digits];
        next[i] = '';
        setDigits(next);
        inputRefs[i].current?.focus();
        break;
      }
    }
  };

  const handleClear = () => {
    setDigits(['', '', '', '']);
    setError(null);
    inputRefs[0].current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Controle de Administrador</h3>
              <p className="text-xs text-slate-400">PIN de Segurança de 4 Dígitos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              A edição de equipamentos, tarefas e status é restrita. Digite seu PIN de 4 dígitos para autorizar.
            </p>
          </div>

          {/* 4 Digit Boxes */}
          <div className="flex justify-center gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl border-2 transition-all outline-hidden ${
                  error
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : digit
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 shadow-xs'
                    : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 py-2 px-3 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Numeric Keypad for convenience */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleNumpadClick(n)}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-base transition-all flex items-center justify-center font-mono shadow-2xs"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-semibold text-xs transition-all flex items-center justify-center"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => handleNumpadClick('0')}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-base transition-all flex items-center justify-center font-mono shadow-2xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleNumpadBackspace}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-medium text-xs transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* Factory Default PIN info */}
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="inline-block text-[11px] text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              PIN de fábrica padrão: <strong className="text-slate-700 font-mono">1234</strong>
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => validatePin(digits.join(''))}
            disabled={digits.join('').length !== 4}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all"
          >
            Confirmar PIN
          </button>
        </div>
      </div>
    </div>
  );
};

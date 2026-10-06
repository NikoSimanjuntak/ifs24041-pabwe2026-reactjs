import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useInput from '../../../hooks/useInput';
import { asyncAuthRegister } from '../states/action';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = ({ name, email, password, confirm }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Nama wajib diisi.';
  if (!email.trim()) errors.email = 'Email wajib diisi.';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Format email tidak valid.';
  if (!password) errors.password = 'Kata sandi wajib diisi.';
  else if (password.length < 6) errors.password = 'Kata sandi minimal 6 karakter.';
  if (confirm !== password) errors.confirm = 'Konfirmasi kata sandi tidak sama.';
  return errors;
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirm, onConfirmChange] = useInput('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateRegister({ name, email, password, confirm });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    const ok = await dispatch(asyncAuthRegister({ name: name.trim(), email: email.trim(), password }));
    setSubmitting(false);
    if (ok) navigate('/auth/login', { replace: true });
  };

  const fields = [
    { id: 'name', label: 'Nama lengkap', type: 'text', value: name, onChange: onNameChange, autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', value: email, onChange: onEmailChange, autoComplete: 'email' },
    { id: 'password', label: 'Kata sandi', type: 'password', value: password, onChange: onPasswordChange, autoComplete: 'new-password' },
    { id: 'confirm', label: 'Ulangi kata sandi', type: 'password', value: confirm, onChange: onConfirmChange, autoComplete: 'new-password' },
  ];

  return (
    <>
      <h1 className="text-3xl font-extrabold">Buat akun baru</h1>
      <p className="mt-2 text-sm text-ink-soft">Daftar untuk mulai melaporkan barang.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        {fields.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="label">{f.label}</label>
            <input id={f.id} type={f.type} autoComplete={f.autoComplete} className="field"
              value={f.value} onChange={f.onChange} aria-invalid={Boolean(errors[f.id])} />
            {errors[f.id] && <p className="field-error">{errors[f.id]}</p>}
          </div>
        ))}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? 'Memproses…' : 'Daftar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Sudah punya akun?{' '}
        <Link to="/auth/login" className="font-bold text-ink underline underline-offset-4">Masuk</Link>
      </p>
    </>
  );
}
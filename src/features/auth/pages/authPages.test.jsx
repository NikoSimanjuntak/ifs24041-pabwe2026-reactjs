import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { getAccessToken } from '../../../helpers/apiHelper';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import { postLogin, postRegister } from '../api/authApi';
import LoginPage, { validateLogin } from './LoginPage';
import RegisterPage, { validateRegister } from './RegisterPage';

vi.mock('../api/authApi');
vi.mock('../../../helpers/toolsHelper');

const withRoutes = (el, path) => (
  <Routes>
    <Route path={path} element={el} />
    <Route path="/" element={<p>Beranda</p>} />
    <Route path="/auth/login" element={<p>Halaman login</p>} />
    <Route path="/auth/register" element={<p>Halaman register</p>} />
  </Routes>
);

describe('validator', () => {
  it('validateLogin', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({ email: 'Email atau username wajib diisi.', password: 'Kata sandi wajib diisi.' });
    expect(validateLogin({ email: 'a@b.co', password: '123' })).toEqual({ password: 'Kata sandi minimal 6 karakter.' });
    expect(validateLogin({ email: 'ifs24041', password: 'Mahasiswa@2024' })).toEqual({});
  });
  it('validateRegister', () => {
    expect(Object.keys(validateRegister({ name: '', email: '', password: '', confirm: 'x' }))).toEqual(['name', 'email', 'password', 'confirm']);
    expect(validateRegister({ name: 'N', email: 'a@b.co', password: '123456', confirm: '123456' })).toEqual({});
    expect(validateRegister({ name: 'N', email: 'x', password: '123', confirm: '123' })).toEqual({ email: 'Format email tidak valid.', password: 'Kata sandi minimal 6 karakter.' });
  });
});

describe('LoginPage', () => {
  it('menampilkan error validasi dan tidak memanggil API', async () => {
    renderWithProviders(withRoutes(<LoginPage />, '/auth/login'), { route: '/auth/login' });
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(screen.getByText('Email atau username wajib diisi.')).toBeInTheDocument();
    expect(postLogin).not.toHaveBeenCalled();
  });
  it('login berhasil → simpan token dan menuju beranda', async () => {
    postLogin.mockResolvedValue({ token: 'tkn-1' });
    renderWithProviders(withRoutes(<LoginPage />, '/auth/login'), { route: '/auth/login' });
    await userEvent.type(screen.getByLabelText('Email atau username'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('Kata sandi'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Beranda')).toBeInTheDocument();
    expect(getAccessToken()).toBe('tkn-1');
  });
  it('login gagal → dialog error dan tetap di halaman', async () => {
    postLogin.mockRejectedValue(new Error('Email atau kata sandi salah'));
    renderWithProviders(withRoutes(<LoginPage />, '/auth/login'), { route: '/auth/login' });
    await userEvent.type(screen.getByLabelText('Email atau username'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('Kata sandi'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Email atau kata sandi salah', 'Gagal masuk'));
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeEnabled();
  });
  it('tautan ke halaman registrasi', async () => {
    renderWithProviders(withRoutes(<LoginPage />, '/auth/login'), { route: '/auth/login' });
    await userEvent.click(screen.getByRole('link', { name: 'Daftar sekarang' }));
    expect(screen.getByText('Halaman register')).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  const fill = async (confirm = '123456') => {
    await userEvent.type(screen.getByLabelText('Nama lengkap'), 'Budi');
    await userEvent.type(screen.getByLabelText('Email'), 'budi@del.ac.id');
    await userEvent.type(screen.getByLabelText('Kata sandi'), '123456');
    await userEvent.type(screen.getByLabelText('Ulangi kata sandi'), confirm);
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }));
  };
  it('menolak konfirmasi sandi yang berbeda', async () => {
    renderWithProviders(withRoutes(<RegisterPage />, '/auth/register'), { route: '/auth/register' });
    await fill('654321');
    expect(screen.getByText('Konfirmasi kata sandi tidak sama.')).toBeInTheDocument();
    expect(postRegister).not.toHaveBeenCalled();
  });
  it('registrasi berhasil → menuju login', async () => {
    postRegister.mockResolvedValue({});
    renderWithProviders(withRoutes(<RegisterPage />, '/auth/register'), { route: '/auth/register' });
    await fill();
    expect(await screen.findByText('Halaman login')).toBeInTheDocument();
    expect(postRegister).toHaveBeenCalledWith({ name: 'Budi', email: 'budi@del.ac.id', password: '123456' });
  });
  it('registrasi gagal → tetap di halaman', async () => {
    postRegister.mockRejectedValue(new Error('Email sudah terdaftar'));
    renderWithProviders(withRoutes(<RegisterPage />, '/auth/register'), { route: '/auth/register' });
    await fill();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Email sudah terdaftar', 'Gagal mendaftar'));
    expect(screen.getByRole('heading', { name: 'Buat akun baru' })).toBeInTheDocument();
  });
  it('tautan kembali ke login', async () => {
    renderWithProviders(withRoutes(<RegisterPage />, '/auth/register'), { route: '/auth/register' });
    await userEvent.click(screen.getByRole('link', { name: 'Masuk' }));
    expect(screen.getByText('Halaman login')).toBeInTheDocument();
  });
});

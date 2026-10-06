import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import AuthLayout from './AuthLayout';

const tree = (
  <Routes>
    <Route path="/auth" element={<AuthLayout />}><Route path="login" element={<p>Form login</p>} /></Route>
    <Route path="/" element={<p>Beranda</p>} />
  </Routes>
);

describe('AuthLayout', () => {
  it('menampilkan banner dan konten anak untuk pengguna tamu', () => {
    renderWithProviders(tree, { route: '/auth/login', preloadedState: { isAuthLogin: false } });
    expect(screen.getByText('Form login')).toBeInTheDocument();
    expect(screen.getByText(/Barangmu hilang/)).toBeInTheDocument();
  });
  it('mengalihkan ke beranda bila sudah terautentikasi', () => {
    renderWithProviders(tree, { route: '/auth/login', preloadedState: { isAuthLogin: true } });
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.queryByText('Form login')).not.toBeInTheDocument();
  });
});
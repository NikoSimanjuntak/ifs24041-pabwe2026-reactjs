import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import NavbarComponent from './NavbarComponent';

const profile = { id: 1, name: 'Budi Santoso', photo: null };

describe('NavbarComponent', () => {
  it('menampilkan logo, status sesi, dan memicu toggle sidebar', () => {
    const onToggle = vi.fn();
    renderWithProviders(<NavbarComponent profile={profile} onToggleSidebar={onToggle} onLogout={vi.fn()} />);
    expect(screen.getByText(/Lost/)).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Buka menu'));
    expect(onToggle).toHaveBeenCalled();
  });
  it('dropdown profil: buka, logout, dan tutup saat klik di luar', () => {
    const onLogout = vi.fn();
    renderWithProviders(<NavbarComponent profile={profile} onToggleSidebar={vi.fn()} onLogout={onLogout} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Menu profil'));
    expect(screen.getByRole('menuitem', { name: /Profil saya/ })).toHaveAttribute('href', '/profile');
    fireEvent.click(screen.getByRole('menuitem', { name: /Keluar/ }));
    expect(onLogout).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Menu profil'));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  it('menutup dropdown ketika menu profil dipilih & aman tanpa profil', () => {
    renderWithProviders(<NavbarComponent profile={null} onToggleSidebar={vi.fn()} onLogout={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Menu profil'));
    fireEvent.click(screen.getByRole('menuitem', { name: /Profil saya/ }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

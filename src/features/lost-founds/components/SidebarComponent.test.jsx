import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import SidebarComponent, { MENU } from './SidebarComponent';

describe('SidebarComponent', () => {
  it('menampilkan seluruh menu utama', () => {
    renderWithProviders(<SidebarComponent open={false} onClose={vi.fn()} />);
    MENU.forEach((m) => expect(screen.getByRole('link', { name: m.label })).toBeInTheDocument());
  });
  it.each([
    ['/', 'Laporan'],
    ['/#statistik', 'Statistik'],
    ['/lost-founds/3', 'Laporan'],
    ['/users', 'Pengguna'],
    ['/profile', 'Profil saya'],
  ])('menandai menu aktif untuk rute %s', (route, label) => {
    renderWithProviders(<SidebarComponent open onClose={vi.fn()} />, { route });
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link').filter((l) => l.getAttribute('aria-current'))).toHaveLength(1);
  });
  it('drawer mobile: backdrop & tombol tutup memanggil onClose', () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />);
    fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    fireEvent.click(screen.getByLabelText('Tutup menu'));
    fireEvent.click(screen.getByRole('link', { name: 'Pengguna' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
  it('tidak merender backdrop saat tertutup', () => {
    renderWithProviders(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });
});

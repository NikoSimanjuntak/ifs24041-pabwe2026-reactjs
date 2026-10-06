import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar';
import Logo from './Logo';
import Spinner from './Spinner';
import StatusBadge from './StatusBadge';

describe('shared components', () => {
  it('Avatar menampilkan inisial bila tanpa foto atau foto default', () => {
    const { rerender } = render(<Avatar name="Delcom Testing" photo={null} />);
    expect(screen.getByLabelText('Delcom Testing')).toHaveTextContent('DT');
    rerender(<Avatar name="Delcom Testing" photo="http://127.0.0.1:8000/default/img/user.png" />);
    expect(screen.getByLabelText('Delcom Testing')).toHaveTextContent('DT');
    rerender(<Avatar name="" photo={null} />);
    expect(screen.getByLabelText('')).toHaveTextContent('?');
  });
  it('Avatar menampilkan gambar dan fallback saat gagal dimuat', () => {
    render(<Avatar name="Budi" photo="img/profile/1.png" />);
    const img = screen.getByAltText('Budi');
    expect(img).toHaveAttribute('src', 'https://open-api.delcom.org/img/profile/1.png');
    fireEvent.error(img);
    expect(screen.getByLabelText('Budi')).toHaveTextContent('B');
  });
  it('Spinner & Logo', () => {
    render(<><Spinner label="Tunggu" /><Logo light /></>);
    expect(screen.getByRole('status')).toHaveTextContent('Tunggu');
    expect(screen.getByText(/Lost/)).toBeInTheDocument();
  });
  it('StatusBadge untuk hilang, ditemukan, selesai, dan status tak dikenal', () => {
    const { rerender } = render(<StatusBadge status="lost" />);
    expect(screen.getByText('Hilang')).toBeInTheDocument();
    rerender(<StatusBadge status="found" completed />);
    expect(screen.getByText('Ditemukan')).toBeInTheDocument();
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    rerender(<StatusBadge status="lain" />);
    expect(screen.getByText('lain')).toBeInTheDocument();
  });
});

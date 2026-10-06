import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../../components/Avatar';
import useInput from '../../../hooks/useInput';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { asyncChangeProfile, asyncChangeProfilePassword, asyncChangeProfilePhoto } from '../states/action';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTO = 2 * 1024 * 1024;

export default function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.profile);
  const saving = useSelector((s) => s.isChangeProfile);
  const savingPhoto = useSelector((s) => s.isChangeProfilePhoto);
  const savingPassword = useSelector((s) => s.isChangeProfilePassword);

  const [name, onName, setName] = useInput(profile?.name ?? '');
  const [email, onEmail, setEmail] = useInput(profile?.email ?? '');
  const [password, onPassword, setPassword] = useInput('');
  const [newPassword, onNewPassword, setNewPassword] = useInput('');
  const [confirm, onConfirm, setConfirm] = useInput('');
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setName(profile?.name ?? '');
    setEmail(profile?.email ?? '');
  }, [profile, setName, setEmail]);

  useEffect(() => {
    if (!photo) return undefined;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const submitProfile = (e) => {
    e.preventDefault();
    const found = {};
    if (!name.trim()) found.name = 'Nama wajib diisi.';
    if (!EMAIL_REGEX.test(email)) found.email = 'Format email tidak valid.';
    setErrors((prev) => ({ ...prev, name: found.name, email: found.email }));
    if (Object.keys(found).length) return;
    dispatch(asyncChangeProfile({ name: name.trim(), email: email.trim() }));
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showErrorDialog('File harus berupa gambar.');
    if (file.size > MAX_PHOTO) return showErrorDialog('Ukuran foto maksimal 2 MB.');
    setPhoto(file);
  };

  const submitPhoto = async (e) => {
    e.preventDefault();
    if (!photo) return setErrors((p) => ({ ...p, photo: 'Pilih foto terlebih dahulu.' }));
    setErrors((p) => ({ ...p, photo: undefined }));
    if (await dispatch(asyncChangeProfilePhoto(photo))) {
      setPhoto(null);
      setPreview(null);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    const found = {};
    if (!password) found.password = 'Kata sandi saat ini wajib diisi.';
    if (newPassword.length < 6) found.newPassword = 'Kata sandi baru minimal 6 karakter.';
    if (confirm !== newPassword) found.confirm = 'Konfirmasi tidak sama.';
    setErrors((p) => ({ ...p, password: found.password, newPassword: found.newPassword, confirm: found.confirm }));
    if (Object.keys(found).length) return;
    const ok = await dispatch(asyncChangeProfilePassword({
      password, new_password: newPassword, new_password_confirmation: confirm,
    }));
    if (ok) { setPassword(''); setNewPassword(''); setConfirm(''); }
  };

  const Err = ({ k }) => (errors[k] ? <p className="field-error">{errors[k]}</p> : null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold">Profil saya</h1>

      <section className="panel p-6" aria-labelledby="sec-photo">
        <h2 id="sec-photo" className="text-lg font-bold">Foto profil</h2>
        <form onSubmit={submitPhoto} className="mt-4 flex flex-wrap items-center gap-5">
          {preview
            ? <img src={preview} alt="Pratinjau foto" className="h-20 w-20 rounded-full object-cover" />
            : <Avatar name={profile?.name ?? ''} photo={profile?.photo} size="h-20 w-20" className="text-xl" />}
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="photo" className="label">Pilih foto (maks. 2 MB)</label>
            <input id="photo" type="file" accept="image/*" onChange={pickPhoto} className="field" />
            <Err k="photo" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPhoto}>{savingPhoto ? 'Mengunggah…' : 'Unggah foto'}</button>
        </form>
      </section>

      <section className="panel p-6" aria-labelledby="sec-info">
        <h2 id="sec-info" className="text-lg font-bold">Informasi akun</h2>
        <form onSubmit={submitProfile} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="label">Nama</label>
            <input id="name" className="field" value={name} onChange={onName} /><Err k="name" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" className="field" value={email} onChange={onEmail} /><Err k="email" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan perubahan'}</button>
        </form>
      </section>

      <section className="panel p-6" aria-labelledby="sec-pass">
        <h2 id="sec-pass" className="text-lg font-bold">Ganti kata sandi</h2>
        <form onSubmit={submitPassword} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="current-password" className="label">Kata sandi saat ini</label>
            <input id="current-password" type="password" autoComplete="current-password" className="field" value={password} onChange={onPassword} /><Err k="password" />
          </div>
          <div>
            <label htmlFor="new-password" className="label">Kata sandi baru</label>
            <input id="new-password" type="password" autoComplete="new-password" className="field" value={newPassword} onChange={onNewPassword} /><Err k="newPassword" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Ulangi kata sandi baru</label>
            <input id="confirm-password" type="password" autoComplete="new-password" className="field" value={confirm} onChange={onConfirm} /><Err k="confirm" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPassword}>{savingPassword ? 'Menyimpan…' : 'Ubah kata sandi'}</button>
        </form>
      </section>
    </div>
  );
}

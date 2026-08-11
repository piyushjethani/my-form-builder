import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await register(values);
      toast.success('Account created');
      navigate(user.role === 'admin' ? '/admin/forms' : '/f/contact-us');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="app-frame w-full max-w-5xl p-4 sm:p-8">
      <form className="mx-auto w-full max-w-md rounded-[28px] bg-white/75 p-6 shadow-soft backdrop-blur-xl sm:p-8" onSubmit={submit}>
        <p className="text-center text-sm font-bold text-ocean-700">Calm Forms</p>
        <h1 className="display-title mt-4 text-center text-5xl font-bold leading-tight text-slate-950">Create Account</h1>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm text-slate-500">Start with an admin account and build polished forms without code.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input className="input" id="name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} minLength={8} required />
          </div>
          <div>
            <label className="label" htmlFor="role">Role</label>
            <select className="input" id="role" value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled={loading} type="submit">Register</button>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">Have an account? <Link className="font-semibold text-ocean-700" to="/login">Login</Link></p>
      </form>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [values, setValues] = useState({ email: 'admin@example.com', password: 'Admin@123' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(values);
      toast.success('Welcome back');
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
        <h1 className="display-title mt-4 text-center text-5xl font-bold leading-tight text-slate-950">Welcome Back</h1>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm text-slate-500">Sign in to create, publish, and analyze forms from your calm workspace.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required />
          </div>
          <button className="btn-primary w-full" disabled={loading} type="submit">Login</button>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">No account? <Link className="font-semibold text-ocean-700" to="/register">Register</Link></p>
      </form>
      </div>
    </main>
  );
}

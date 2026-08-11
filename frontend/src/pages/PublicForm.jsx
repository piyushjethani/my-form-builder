import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import DynamicForm from '../components/DynamicForm.jsx';
import Loading from '../components/Loading.jsx';

export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get(`/public/forms/${slug}`)
      .then((response) => setForm(response.data))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const submit = async (answers) => {
    try {
      await api.post(`/public/forms/${slug}/responses`, { answers });
      setSubmitted(true);
      toast.success('Response submitted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loading label="Loading form" />;
  if (!form) return <div className="p-8 text-center text-slate-600">Form not found.</div>;

  const background = form.theme_config?.colors?.background || '#f8fafc';

  return (
    <main className="min-h-screen px-4 py-8" style={{ background }}>
      <div className="mx-auto max-w-3xl">
        {submitted ? (
          <section className="panel p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-2xl font-bold text-mint-700">✓</div>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Thanks for your response</h1>
            <p className="mt-2 text-slate-600">Your submission has been saved successfully.</p>
            <Link className="btn-primary mt-6" to={`/f/${slug}`} onClick={() => setSubmitted(false)}>Submit another response</Link>
          </section>
        ) : (
          <DynamicForm form={form} onSubmit={submit} />
        )}
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { API_BASE_URL } from '../lib/api.js';
import Loading from '../components/Loading.jsx';

const colors = ['#2563eb', '#10b981', '#38bdf8', '#22c55e', '#1d4ed8', '#059669'];

export default function ResponsesDashboard() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, sort: 'submitted_at', order: 'desc', fieldId: '', fieldValue: '', startDate: '', endDate: '' });
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => value && params.set(key, value));
      const [formResponse, responsesResponse, analyticsResponse] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/forms/${id}/responses?${params.toString()}`),
        api.get(`/forms/${id}/analytics`)
      ]);
      setForm(formResponse.data);
      setResponses(responsesResponse.data.responses);
      setTotal(responsesResponse.data.total);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, query.page, query.sort, query.order]);

  const fields = useMemo(() => form?.fields || [], [form]);

  const answerValue = (response, fieldId) => {
    const answer = response.answers.find((item) => item.field_id === fieldId);
    if (!answer) return '';
    if (answer.value && typeof answer.value === 'object' && answer.value.dataUrl) {
      return (
        <a
          href={answer.value.dataUrl}
          download={answer.value.name}
          className="text-indigo-600 hover:text-indigo-800 underline font-semibold text-xs"
        >
          {answer.value.name} ({Math.round(answer.value.size / 1024)} KB)
        </a>
      );
    }
    return Array.isArray(answer.value) ? answer.value.join(', ') : answer.value;
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    if (query.fieldId) params.set('fieldId', query.fieldId);
    if (query.fieldValue) params.set('fieldValue', query.fieldValue);
    try {
      const blob = await api.get(`/forms/${id}/responses/export?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form?.slug || 'form'}-responses.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading && !form) return <Loading label="Loading responses" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link className="text-sm font-semibold text-ocean-700" to="/admin/forms">Back to forms</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{form?.title} responses</h1>
          <p className="text-sm text-slate-500">{total} total submissions</p>
        </div>
        <button className="btn-success" type="button" onClick={exportCsv}><Download size={18} /> Export CSV</button>
      </div>

      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input className="input" type="date" value={query.startDate} onChange={(e) => setQuery({ ...query, startDate: e.target.value })} aria-label="Start date" />
          <input className="input" type="date" value={query.endDate} onChange={(e) => setQuery({ ...query, endDate: e.target.value })} aria-label="End date" />
          <select className="input" value={query.fieldId} onChange={(e) => setQuery({ ...query, fieldId: e.target.value })} aria-label="Field filter">
            <option value="">Any field</option>
            {fields.map((field) => <option key={field.id} value={field.id}>{field.label}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="input pl-10" placeholder="Field value" value={query.fieldValue} onChange={(e) => setQuery({ ...query, fieldValue: e.target.value })} />
          </div>
          <button className="btn-primary" type="button" onClick={() => setQuery({ ...query, page: 1 }) || load()}>Apply filters</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Responses over time</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={Object.entries(analytics?.countByDate || {}).map(([date, count]) => ({ date, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Choice distribution</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.values(analytics?.optionDistribution || {}).map((item) => {
              const data = Object.entries(item.counts).map(([name, value]) => ({ name, value }));
              return (
                <div className="rounded-md border border-slate-200 p-3" key={item.label}>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <div className="h-44">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" outerRadius={55}>
                          {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-700">
                  <button type="button" onClick={() => setQuery({ ...query, sort: 'submitted_at', order: query.order === 'asc' ? 'desc' : 'asc' })}>Submitted</button>
                </th>
                {fields.map((field) => <th className="px-4 py-3 text-left font-bold text-slate-700" key={field.id}>{field.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {responses.map((response) => (
                <tr key={response.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(response.submitted_at).toLocaleString()}</td>
                  {fields.map((field) => <td className="px-4 py-3 text-slate-700" key={field.id}>{answerValue(response, field.id)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <button className="btn-secondary" disabled={query.page <= 1} type="button" onClick={() => setQuery({ ...query, page: query.page - 1 })}>Previous</button>
          <span className="text-sm text-slate-500">Page {query.page}</span>
          <button className="btn-secondary" disabled={query.page * query.limit >= total} type="button" onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</button>
        </div>
      </section>
    </div>
  );
}

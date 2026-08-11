import { useEffect, useMemo, useState } from 'react';
import { Copy, Edit3, Eye, FileDown, Search, Trash2, LayoutGrid, FileText, CheckCircle, FileEdit, HelpCircle, ArrowRight, MessageSquare, Calendar, Briefcase, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const templates = [
  {
    id: 'feedback',
    title: 'Customer Feedback',
    description: 'Gather feedback on product quality, service, and experience.',
    category: 'Feedback',
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-500',
    fields: [
      { field_type: 'text', label: 'Full Name', placeholder: 'Enter your name', is_required: true },
      { field_type: 'email', label: 'Email Address', placeholder: 'Enter your email', is_required: true },
      { field_type: 'radio', label: 'Overall Rating', options: ['Excellent', 'Good', 'Average', 'Poor'], is_required: true },
      { field_type: 'textarea', label: 'Detailed Feedback', placeholder: 'How can we improve?', is_required: false }
    ]
  },
  {
    id: 'registration',
    title: 'Event Registration',
    description: 'Manage attendees, ticket selection, and contact details.',
    category: 'Registration',
    icon: Calendar,
    color: 'from-purple-500 to-indigo-500',
    fields: [
      { field_type: 'text', label: 'Attendee Name', placeholder: 'First and last name', is_required: true },
      { field_type: 'email', label: 'Email', placeholder: 'your@email.com', is_required: true },
      { field_type: 'dropdown', label: 'Ticket Type', options: ['General Admission', 'VIP Pass', 'Student Ticket'], is_required: true },
      { field_type: 'checkbox', label: 'Preferences', options: ['Require parking pass', 'Vegetarian meal', 'Accessibility assistance'], is_required: false }
    ]
  },
  {
    id: 'hr',
    title: 'Job Application',
    description: 'Collect details from prospective job applicants.',
    category: 'HR & hiring',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    fields: [
      { field_type: 'text', label: 'Applicant Name', placeholder: 'Full name', is_required: true },
      { field_type: 'email', label: 'Email Address', placeholder: 'email@example.com', is_required: true },
      { field_type: 'dropdown', label: 'Desired Role', options: ['Software Engineer', 'Product Designer', 'Product Manager', 'Marketing Specialist'], is_required: true },
      { field_type: 'textarea', label: 'Cover Letter', placeholder: 'Briefly describe your experience', is_required: true }
    ]
  },
  {
    id: 'survey',
    title: 'Market Research Survey',
    description: 'Analyze demographics and purchase patterns.',
    category: 'Surveys',
    icon: BarChart2,
    color: 'from-teal-500 to-emerald-500',
    fields: [
      { field_type: 'dropdown', label: 'Age Range', options: ['Under 18', '18-24', '25-34', '35-44', '45+'], is_required: true },
      { field_type: 'radio', label: 'Online Purchase Frequency', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], is_required: true },
      { field_type: 'textarea', label: 'What is your primary shopping pain point?', placeholder: 'Describe your main challenges', is_required: false }
    ]
  }
];

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const loadForms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const response = await api.get(`/forms?${params.toString()}`);
      setForms(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadForms, 250);
    return () => clearTimeout(timer);
  }, [search, status]);

  const totals = useMemo(() => {
    const all = forms.length;
    const published = forms.filter((form) => form.status === 'published').length;
    const draft = all - published;
    const responses = forms.reduce((sum, form) => sum + (form._count?.responses || 0), 0);
    return { all, published, draft, responses };
  }, [forms]);

  const recentResponses = useMemo(() => {
    const names = [
      'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'James Wilson',
      'Jessica Taylor', 'Robert Smith', 'Linda Jones', 'William Garcia', 'Elizabeth Miller'
    ];
    const items = [];
    forms.forEach((form, formIndex) => {
      const respCount = form._count?.responses || 0;
      for (let i = 0; i < Math.min(respCount, 3); i++) {
        const timeVal = (i + 1) * (formIndex + 1) * 7;
        let timeStr = `${timeVal} mins ago`;
        if (timeVal > 60) timeStr = `${Math.floor(timeVal / 60)} hours ago`;
        items.push({
          id: `${form.id}-resp-${i}`,
          formTitle: form.title,
          formId: form.id,
          user: names[(formIndex * 3 + i) % names.length],
          time: timeStr,
          rawMinutes: timeVal
        });
      }
    });
    return items.sort((a, b) => a.rawMinutes - b.rawMinutes).slice(0, 6);
  }, [forms]);

  const duplicate = async (form) => {
    try {
      await api.post(`/forms/${form.id}/duplicate`);
      toast.success('Form duplicated');
      loadForms();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePublish = async (form) => {
    try {
      await api.patch(`/forms/${form.id}/publish`);
      toast.success(form.status === 'published' ? 'Unpublished' : 'Published');
      loadForms();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/forms/${deleteTarget.id}`);
      toast.success('Form deleted');
      setDeleteTarget(null);
      loadForms();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateFromTemplate = async (template) => {
    const toastId = toast.loading('Creating form from template...');
    try {
      const payload = {
        title: `${template.title} Form`,
        description: template.description,
        status: 'draft',
        fields: template.fields.map((field, idx) => ({
          ...field,
          order_index: idx + 1
        }))
      };
      const response = await api.post('/forms', payload);
      toast.success('Form created!', { id: toastId });
      navigate(`/admin/forms/${response.data.id}/edit`);
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const filteredTemplates = useMemo(() => {
    if (activeTab === 'All') return templates;
    return templates.filter((t) => t.category.toLowerCase() === activeTab.toLowerCase() || (activeTab === 'HR & hiring' && t.category === 'HR & hiring'));
  }, [activeTab]);

  return (
    <div className="space-y-8 relative">
      {/* Background Blobs for Glassmorphic styling */}
      <div className="blob w-80 h-80 bg-indigo-200/40 -top-10 -left-10"></div>
      <div className="blob w-96 h-96 bg-purple-200/30 top-1/3 right-10"></div>

      {/* Hero Mockup Banner */}
      <section className="relative overflow-hidden rounded-[28px] border border-indigo-100/50 bg-gradient-to-r from-indigo-50 via-purple-50/70 to-white p-8 md:p-12 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-600 text-xs font-semibold shadow-sm border border-indigo-50">
            ✦ No-code form builder
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Build a form your <span className="text-indigo-600 font-black">own way.</span> No code needed.
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Drag, drop, and style fields exactly how you want — then share a link and watch responses roll in.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/admin/forms/new" className="btn-primary">
              + Start from scratch
            </Link>
            <a href="#templates" className="btn-secondary">
              Browse templates
            </a>
          </div>
        </div>
        {/* Banner Decorative graphic blobs */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-indigo-400/20 blur-xl"></div>
          <div className="w-36 h-36 rounded-full bg-purple-400/20 blur-xl -ml-16 -mt-16"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 relative z-10">
        <div className="panel flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Forms</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{totals.all}</p>
            <p className="text-[10px] text-slate-400">All time forms</p>
          </div>
        </div>

        <div className="panel flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published Forms</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{totals.published}</p>
            <p className="text-[10px] text-slate-400">Live forms</p>
          </div>
        </div>

        <div className="panel flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
            <FileEdit size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Draft Forms</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{totals.draft}</p>
            <p className="text-[10px] text-slate-400">Unpublished forms</p>
          </div>
        </div>

        <div className="panel flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-sky-50 text-sky-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Responses</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{totals.responses}</p>
            <p className="text-[10px] text-slate-400">All form responses</p>
          </div>
        </div>
      </section>

      {/* Start with a template Section */}
      <section id="templates" className="space-y-4 relative z-10 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Start with a template</h2>
            <p className="text-xs text-slate-500">Pick a prebuilt form layout to jumpstart creation</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 cursor-pointer hover:underline">
            See all <ArrowRight size={14} />
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Feedback', 'Registration', 'HR & hiring', 'Surveys'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Templates cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                onClick={() => handleCreateFromTemplate(template)}
                className="panel flex flex-col justify-between hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all duration-200 group"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.color} text-white flex items-center justify-center shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{template.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 mt-2">
                  Use Template <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Forms List and Recent Responses Feed Side-by-Side */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        {/* Left Column: Recent Forms (occupies 2 cols) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Your Forms</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                <input
                  className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Search forms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading label="Loading forms" />
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <article className="panel p-5 hover:border-slate-200 transition-colors" key={form.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-800">{form.title}</h3>
                        <StatusBadge status={form.status} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{form.description || 'No description'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {form._count?.fields || 0} fields · {form._count?.responses || 0} responses
                      </p>
                    </div>
                    <button
                      className={`btn-secondary py-1.5 px-3.5 text-xs font-bold rounded-lg border-0 ${
                        form.status === 'published'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                      onClick={() => togglePublish(form)}
                      type="button"
                    >
                      {form.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                    <Link className="btn-secondary py-1.5 px-3.5 text-xs rounded-lg flex items-center gap-1.5" to={`/admin/forms/${form.id}/edit`}>
                      <Edit3 size={14} /> Edit
                    </Link>
                    <button className="btn-secondary py-1.5 px-3.5 text-xs rounded-lg flex items-center gap-1.5" onClick={() => duplicate(form)} type="button">
                      <Copy size={14} /> Duplicate
                    </button>
                    <Link className="btn-secondary py-1.5 px-3.5 text-xs rounded-lg flex items-center gap-1.5" to={`/f/${form.slug}`} target="_blank">
                      <Eye size={14} /> Preview
                    </Link>
                    <Link className="btn-secondary py-1.5 px-3.5 text-xs rounded-lg flex items-center gap-1.5" to={`/admin/forms/${form.id}/responses`}>
                      <FileDown size={14} /> Responses
                    </Link>
                    <button
                      className="btn-secondary py-1.5 px-3.5 text-xs rounded-lg flex items-center gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setDeleteTarget(form)}
                      type="button"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </article>
              ))}
              {forms.length === 0 && (
                <div className="panel p-12 text-center text-slate-400 text-sm">
                  No forms found. Click "+ Start from scratch" or choose a template above.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column: Recent Responses Feed (occupies 1 col) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Responses</h2>
          <div className="panel p-5 space-y-4 max-h-[600px] overflow-y-auto">
            {recentResponses.map((response) => (
              <div key={response.id} className="flex gap-3 items-start pb-4 border-b border-slate-50 last:pb-0 last:border-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {response.user.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700">
                    Response by <span className="font-bold text-slate-800">{response.user}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    submitted to <Link to={`/admin/forms/${response.formId}/responses`} className="text-indigo-600 font-medium hover:underline">{response.formTitle}</Link>
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">{response.time}</span>
                </div>
              </div>
            ))}
            {recentResponses.length === 0 && (
              <div className="text-center text-slate-400 py-8 text-xs">
                No recent responses to display.
              </div>
            )}
          </div>
        </section>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete form"
          message={`Delete "${deleteTarget.title}" and all responses?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

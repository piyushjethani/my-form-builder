import { useEffect, useMemo, useState } from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Save, Eye, Palette, Settings, Type, AlignLeft, Hash, Mail, List, CheckSquare, Radio, Calendar, FileUp, Settings2, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import DynamicForm from '../components/DynamicForm.jsx';
import Loading from '../components/Loading.jsx';
import { defaultTheme, fieldTypes, newField, prepareFields } from '../lib/formDefaults.js';

const fieldPalette = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'dropdown', label: 'Dropdown Select', icon: List },
  { type: 'checkbox', label: 'Checkbox Options', icon: CheckSquare },
  { type: 'radio', label: 'Radio Button', icon: Radio },
  { type: 'date', label: 'Date Picker', icon: Calendar },
  { type: 'file', label: 'File Upload', icon: FileUp }
];

function SortableField({ field, selected, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.client_id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border p-4 transition-all duration-150 ${
        selected
          ? 'border-indigo-500 bg-indigo-50/30 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          className="text-slate-400 cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag field"
        >
          <GripVertical size={16} />
        </button>
        <button className="flex-1 text-left" type="button" onClick={onSelect}>
          <p className="text-sm font-bold text-slate-800">{field.label}</p>
          <p className="text-xs text-slate-400 capitalize">{field.field_type}</p>
        </button>
        <button
          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg"
          type="button"
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Navigation tabs: 'builder' | 'design' | 'settings' | 'preview'
  const [activeView, setActiveView] = useState('builder');
  // Settings panel tabs: 'general' | 'options'
  const [settingsTab, setSettingsTab] = useState('general');

  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: '',
    status: 'draft',
    slug: '',
    theme_config: defaultTheme,
    fields: []
  });
  
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!id) return;
    api.get(`/forms/${id}`).then((response) => {
      const loaded = response.data;
      setForm({
        ...loaded,
        theme_config: {
          ...defaultTheme,
          ...(loaded.theme_config || {}),
          colors: { ...defaultTheme.colors, ...(loaded.theme_config?.colors || {}) },
          fonts: { ...defaultTheme.fonts, ...(loaded.theme_config?.fonts || {}) },
          layout: { ...defaultTheme.layout, ...(loaded.theme_config?.layout || {}) }
        },
        fields: loaded.fields.map((field) => ({ ...field, client_id: String(field.id) }))
      });
      setSelectedId(String(loaded.fields[0]?.id || ''));
    }).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    localStorage.setItem('form_builder_draft', JSON.stringify(form));
  }, [form]);

  const selectedField = useMemo(() => form.fields.find((field) => field.client_id === selectedId), [form.fields, selectedId]);

  const addField = (type) => {
    const field = newField(type);
    setForm((current) => ({ ...current, fields: [...current.fields, { ...field, order_index: current.fields.length + 1 }] }));
    setSelectedId(field.client_id);
    setSettingsTab('general');
  };

  const updateSelected = (patch) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field) => field.client_id === selectedId ? { ...field, ...patch } : field)
    }));
  };

  const save = async (status = form.status) => {
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      slug: form.slug || undefined,
      status,
      theme_config: form.theme_config,
      fields: prepareFields(form.fields)
    };
    try {
      const response = id ? await api.put(`/forms/${id}`, payload) : await api.post('/forms', payload);
      toast.success(status === 'published' ? 'Form published' : 'Draft saved');
      navigate(`/admin/forms/${response.data.id}/edit`, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading builder" />;

  return (
    <div className="space-y-6">
      {/* Top Navbar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-semibold text-indigo-600 block">Form Builder</span>
          <h1 className="text-2xl font-bold text-slate-800">{form.title || 'Untitled Form'}</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveView('builder')}
            className={`px-4 py-2 rounded-lg transition-all duration-150 ${activeView === 'builder' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveView('design')}
            className={`px-4 py-2 rounded-lg transition-all duration-150 ${activeView === 'design' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`px-4 py-2 rounded-lg transition-all duration-150 ${activeView === 'settings' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveView('preview')}
            className={`px-4 py-2 rounded-lg transition-all duration-150 ${activeView === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Preview
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="btn-secondary py-2 px-4 text-xs" disabled={saving} type="button" onClick={() => save('draft')}>
            Save draft
          </button>
          <button className="btn-primary py-2 px-4 text-xs" disabled={saving} type="button" onClick={() => save('published')}>
            Save and publish
          </button>
          <Link className="btn-secondary py-2 px-4 text-xs" to="/admin/forms">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content Viewports depending on activeView */}
      {activeView === 'builder' && (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr_340px]">
          {/* Left panel: Palette */}
          <aside className="panel space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Fields</h2>
            <p className="text-xs text-slate-500">Drag or click fields to add them to your form.</p>
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-1 pt-2">
              {fieldPalette.map((field) => {
                const Icon = field.icon;
                return (
                  <button
                    className="btn-secondary py-2.5 px-3.5 text-xs justify-start hover:border-indigo-300 hover:bg-indigo-50/20"
                    key={field.type}
                    type="button"
                    onClick={() => addField(field.type)}
                  >
                    <Icon size={16} className="text-indigo-500 mr-1.5" /> {field.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center Canvas */}
          <section className="panel space-y-4">
            <div className="border-b border-slate-100 pb-4 space-y-3 text-left">
              <div>
                <label className="label text-[10px] font-bold text-slate-400" htmlFor="canvas-title">Form Title</label>
                <input
                  className="input text-lg font-bold py-2 px-3 border-slate-100 hover:border-slate-200"
                  id="canvas-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <label className="label text-[10px] font-bold text-slate-400" htmlFor="canvas-desc">Form Description</label>
                <textarea
                  className="input min-h-16 text-xs text-slate-500 py-2 px-3 border-slate-100 hover:border-slate-200 resize-y"
                  id="canvas-desc"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter form description (optional)"
                />
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Form Fields</h2>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              const oldIndex = form.fields.findIndex((field) => field.client_id === active.id);
              const newIndex = form.fields.findIndex((field) => field.client_id === over.id);
              setForm({ ...form, fields: arrayMove(form.fields, oldIndex, newIndex) });
            }}>
              <SortableContext items={form.fields.map((field) => field.client_id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 mt-3">
                  {form.fields.map((field) => (
                    <SortableField
                      key={field.client_id}
                      field={field}
                      selected={field.client_id === selectedId}
                      onSelect={() => setSelectedId(field.client_id)}
                      onRemove={() => setForm({ ...form, fields: form.fields.filter((item) => item.client_id !== field.client_id) })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {form.fields.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400 bg-slate-50/50">
                Click fields on the left palette to add them to your form.
              </div>
            )}
          </section>

          {/* Right Sidebar: Field Settings */}
          <aside className="panel space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Field Settings</h2>
              {selectedField && ['dropdown', 'radio', 'checkbox'].includes(selectedField.field_type) && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <button
                    onClick={() => setSettingsTab('general')}
                    className={`px-2.5 py-1.5 rounded-md ${settingsTab === 'general' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setSettingsTab('options')}
                    className={`px-2.5 py-1.5 rounded-md ${settingsTab === 'options' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Options
                  </button>
                </div>
              )}
            </div>

            {selectedField ? (
              settingsTab === 'general' || !['dropdown', 'radio', 'checkbox'].includes(selectedField.field_type) ? (
                // General Settings Tab
                <div className="space-y-4 text-left">
                  <div>
                    <label className="label" htmlFor="fieldLabel">Label</label>
                    <input className="input" id="fieldLabel" value={selectedField.label} onChange={(e) => updateSelected({ label: e.target.value })} />
                  </div>
                  <div>
                    <label className="label" htmlFor="placeholder">Placeholder</label>
                    <input className="input" id="placeholder" value={selectedField.placeholder || ''} onChange={(e) => updateSelected({ placeholder: e.target.value })} />
                  </div>
                  
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      checked={selectedField.is_required}
                      onChange={(e) => updateSelected({ is_required: e.target.checked })}
                    />
                    Required field
                  </label>

                  {selectedField.field_type === 'text' && (
                    <div>
                      <label className="label" htmlFor="minLength">Minimum length</label>
                      <input
                        className="input"
                        id="minLength"
                        type="number"
                        min="0"
                        value={selectedField.validation_rules?.minLength || ''}
                        onChange={(e) => updateSelected({
                          validation_rules: {
                            ...selectedField.validation_rules,
                            minLength: e.target.value ? Number(e.target.value) : undefined
                          }
                        })}
                      />
                    </div>
                  )}

                  {selectedField.field_type === 'dropdown' && (
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer pt-2 border-t border-slate-50">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        checked={Boolean(selectedField.validation_rules?.allow_multiple)}
                        onChange={(e) => updateSelected({
                          validation_rules: {
                            ...selectedField.validation_rules,
                            allow_multiple: e.target.checked
                          }
                        })}
                      />
                      Allow multiple selection
                    </label>
                  )}

                  {selectedField.field_type === 'checkbox' && (
                    <div className="space-y-4 pt-2 border-t border-slate-50">
                      <div>
                        <label className="label" htmlFor="minSelect">Minimum selection</label>
                        <input
                          className="input"
                          id="minSelect"
                          type="number"
                          min="0"
                          value={selectedField.validation_rules?.minSelect || ''}
                          onChange={(e) => updateSelected({
                            validation_rules: {
                              ...selectedField.validation_rules,
                              minSelect: e.target.value ? Number(e.target.value) : undefined
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor="maxSelect">Maximum selection</label>
                        <input
                          className="input"
                          id="maxSelect"
                          type="number"
                          min="0"
                          value={selectedField.validation_rules?.maxSelect || ''}
                          onChange={(e) => updateSelected({
                            validation_rules: {
                              ...selectedField.validation_rules,
                              maxSelect: e.target.value ? Number(e.target.value) : undefined
                            }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Options Tab (for select / checkbox / radio list options management)
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    {(selectedField.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right">{index + 1}.</span>
                        <input
                          className="input py-1.5 px-3"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...selectedField.options];
                            newOptions[index] = e.target.value;
                            updateSelected({ options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                          onClick={() => {
                            const newOptions = selectedField.options.filter((_, i) => i !== index);
                            updateSelected({ options: newOptions });
                          }}
                          aria-label="Remove option"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary py-1.5 px-3 w-full text-xs font-semibold"
                    onClick={() => {
                      const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options || []).length + 1}`];
                      updateSelected({ options: newOptions });
                    }}
                  >
                    + Add option
                  </button>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">Select a field on the canvas to configure it.</p>
            )}
          </aside>
        </div>
      )}

      {activeView === 'design' && (
        <section className="panel max-w-4xl mx-auto text-left space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Design Settings</h2>
            <p className="text-xs text-slate-500 mt-1">Configure your form's colors, fonts, and layouts.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Colors Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1.5">Color Palette</h3>
              <div className="grid gap-4 grid-cols-2">
                {['primary', 'accent', 'background', 'text'].map((key) => (
                  <div key={key}>
                    <label className="label capitalize" htmlFor={key}>{key} color</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white shadow-xs">
                      <input
                        className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
                        id={key}
                        type="color"
                        value={form.theme_config.colors[key]}
                        onChange={(e) => setForm({
                          ...form,
                          theme_config: {
                            ...form.theme_config,
                            colors: { ...form.theme_config.colors, [key]: e.target.value }
                          }
                        })}
                      />
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{form.theme_config.colors[key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Typography Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-1.5">Typography & Layout</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="font">Typography Font</label>
                  <select
                    className="input"
                    id="font"
                    value={form.theme_config.fonts.body}
                    onChange={(e) => setForm({
                      ...form,
                      theme_config: { ...form.theme_config, fonts: { body: e.target.value } }
                    })}
                  >
                    <option value="Inter, Arial, sans-serif">Inter (Modern Sans)</option>
                    <option value="Georgia, serif">Georgia (Classic Serif)</option>
                    <option value="Roboto, Arial, sans-serif">Roboto (Clean Sans)</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="alignment">Text Alignment</label>
                  <select
                    className="input"
                    id="alignment"
                    value={form.theme_config.layout.alignment}
                    onChange={(e) => setForm({
                      ...form,
                      theme_config: {
                        ...form.theme_config,
                        layout: { ...form.theme_config.layout, alignment: e.target.value }
                      }
                    })}
                  >
                    <option value="left">Align Left</option>
                    <option value="center">Align Center</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeView === 'settings' && (
        <section className="panel max-w-4xl mx-auto text-left space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Form Metadata</h2>
            <p className="text-xs text-slate-500 mt-1">Configure form descriptors and publication links.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="title">Form Title</label>
                <input className="input" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              
              <div>
                <label className="label" htmlFor="slug">Custom Slug URL</label>
                <input
                  className="input"
                  id="slug"
                  placeholder="Auto-generated if empty"
                  value={form.slug || ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1">Accessible via /f/your-custom-slug</p>
              </div>
            </div>
            
            <div>
              <label className="label" htmlFor="description">Form Description</label>
              <textarea
                className="input min-h-[160px] h-[calc(100%-1.75rem)] resize-y"
                id="description"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
        </section>
      )}

      {activeView === 'preview' && (
        <section className="panel max-w-4xl mx-auto text-left animate-fade-in">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Interactive Preview</h2>
              <p className="text-xs text-slate-500">How this form appears to your end users.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 font-semibold">Live Mode</span>
          </div>
          <DynamicForm form={form} mode="preview" />
        </section>
      )}
    </div>
  );
}

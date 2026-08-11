import { useMemo, useState } from 'react';

function valueIsEmpty(value) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

export function validateAnswers(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    const value = values[field.id || field.client_id];
    
    // Check required fields
    if (field.is_required && valueIsEmpty(value)) {
      errors[field.id || field.client_id] = `${field.label} is required`;
      return;
    }
    
    // Validate text minLength
    if (field.field_type === 'text' && value && field.validation_rules?.minLength) {
      if (String(value).length < Number(field.validation_rules.minLength)) {
        errors[field.id || field.client_id] = `Minimum ${field.validation_rules.minLength} characters required`;
        return;
      }
    }
    
    // Validate email formatting
    if (field.field_type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.id || field.client_id] = 'Enter a valid email address';
      return;
    }

    // Validate checkbox selection limits
    if (field.field_type === 'checkbox' && value && Array.isArray(value)) {
      if (field.validation_rules?.minSelect && value.length < Number(field.validation_rules.minSelect)) {
        errors[field.id || field.client_id] = `Please select at least ${field.validation_rules.minSelect} option(s)`;
        return;
      }
      if (field.validation_rules?.maxSelect && value.length > Number(field.validation_rules.maxSelect)) {
        errors[field.id || field.client_id] = `Please select at most ${field.validation_rules.maxSelect} option(s)`;
        return;
      }
    }
  });
  return errors;
}

export default function DynamicForm({ form, mode = 'submit', onSubmit }) {
  const fields = useMemo(() => [...(form.fields || [])].sort((a, b) => a.order_index - b.order_index), [form.fields]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const theme = form.theme_config || {};
  
  const primary = theme.colors?.primary || '#4f46e5';
  const accent = theme.colors?.accent || '#10b981';

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field.id || field.client_id]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (mode === 'preview') return;
    const nextErrors = validateAnswers(fields, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    
    const answers = fields.map((field) => {
      const fieldKey = field.id || field.client_id;
      return {
        field_id: field.id,
        value: values[fieldKey]
      };
    }).filter((answer) => answer.value !== undefined);
    
    onSubmit?.(answers);
  };

  return (
    <form
      className="space-y-5 rounded-2xl border border-slate-100 p-6 md:p-8 bg-white shadow-sm text-left"
      onSubmit={submit}
      style={{
        background: theme.colors?.background || '#ffffff',
        color: theme.colors?.text || '#0f172a',
        fontFamily: theme.fonts?.body || 'Inter, Arial, sans-serif'
      }}
    >
      <div className={theme.layout?.alignment === 'center' ? 'text-center' : 'text-left'}>
        <h1 className="text-2xl font-bold tracking-tight">{form.title || 'Untitled Form'}</h1>
        {form.description && <p className="mt-2 text-sm opacity-70 leading-relaxed">{form.description}</p>}
      </div>
      
      {fields.map((field) => {
        const key = field.id || field.client_id;
        const describedBy = errors[key] ? `${key}-error` : undefined;
        return (
          <div key={key} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700" htmlFor={`field-${key}`}>
              {field.label} {field.is_required && <span style={{ color: accent }}>*</span>}
            </label>
            
            {/* Text input, Email, Number, Date */}
            {['text', 'number', 'email', 'date'].includes(field.field_type) && (
              <input
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors[key])}
                className="input"
                id={`field-${key}`}
                type={field.field_type}
                placeholder={field.placeholder || ''}
                value={values[key] || ''}
                onChange={(event) => updateValue(field, event.target.value)}
              />
            )}
            
            {/* Long Text / Textarea */}
            {field.field_type === 'textarea' && (
              <textarea
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors[key])}
                className="input min-h-24 resize-y"
                id={`field-${key}`}
                placeholder={field.placeholder || ''}
                value={values[key] || ''}
                onChange={(event) => updateValue(field, event.target.value)}
              />
            )}
            
            {/* Dropdown Select (Multi-select or Single) */}
            {field.field_type === 'dropdown' && (
              field.validation_rules?.allow_multiple ? (
                <div className="space-y-1">
                  <select
                    multiple
                    className="input min-h-28"
                    id={`field-${key}`}
                    value={values[key] || []}
                    onChange={(event) => {
                      const options = event.target.options;
                      const selected = [];
                      for (let i = 0; i < options.length; i++) {
                        if (options[i].selected) {
                          selected.push(options[i].value);
                        }
                      }
                      updateValue(field, selected);
                    }}
                  >
                    {(field.options || []).map((option) => (
                      <option key={option} value={option} className="py-1 px-2">{option}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Hold Ctrl (or Cmd) to select multiple options.</p>
                </div>
              ) : (
                <select
                  className="input"
                  id={`field-${key}`}
                  value={values[key] || ''}
                  onChange={(event) => updateValue(field, event.target.value)}
                >
                  <option value="">{field.placeholder || 'Select an option'}</option>
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )
            )}
            
            {/* Radio options */}
            {field.field_type === 'radio' && (
              <div className="space-y-2 pt-1.5">
                {(field.options || []).map((option) => (
                  <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer" key={option}>
                    <input
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      type="radio"
                      name={`field-${key}`}
                      value={option}
                      checked={values[key] === option}
                      onChange={() => updateValue(field, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            
            {/* Checkbox Options */}
            {field.field_type === 'checkbox' && (
              <div className="space-y-2 pt-1.5">
                {(field.options || []).map((option) => {
                  const selected = values[key] || [];
                  return (
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer" key={option}>
                      <input
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={(event) => {
                          updateValue(
                            field,
                            event.target.checked
                              ? [...selected, option]
                              : selected.filter((item) => item !== option)
                          );
                        }}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Native File Upload Picker */}
            {field.field_type === 'file' && (
              <div className="space-y-2">
                <input
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(errors[key])}
                  className="input file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  id={`field-${key}`}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateValue(field, {
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          dataUrl: reader.result
                        });
                      };
                      reader.readAsDataURL(file);
                    } else {
                      updateValue(field, null);
                    }
                  }}
                  disabled={mode === 'preview'}
                />
                {values[key]?.name && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded-lg inline-block">
                    Selected file: <span className="font-semibold text-slate-700">{values[key].name}</span> ({Math.round(values[key].size / 1024)} KB)
                  </p>
                )}
              </div>
            )}
            
            {errors[key] && (
              <p className="text-xs text-red-500 font-medium" id={`${key}-error`}>
                {errors[key]}
              </p>
            )}
          </div>
        );
      })}
      
      <button
        className="btn-primary w-full sm:w-auto mt-4"
        style={{ backgroundColor: primary }}
        type="submit"
      >
        {mode === 'preview' ? 'Preview submit' : 'Submit response'}
      </button>
    </form>
  );
}

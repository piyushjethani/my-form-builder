export const fieldTypes = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Textarea' },
  { type: 'number', label: 'Number' },
  { type: 'email', label: 'Email' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkboxes' },
  { type: 'radio', label: 'Radio' },
  { type: 'date', label: 'Date' },
  { type: 'file', label: 'File' }
];

export const defaultTheme = {
  colors: {
    primary: '#2563eb',
    accent: '#10b981',
    background: '#ffffff',
    text: '#0f172a'
  },
  fonts: { body: 'Inter, Arial, sans-serif' },
  layout: { alignment: 'left', width: 'standard', spacing: 'comfortable', buttonStyle: 'solid' }
};

export function newField(type) {
  const needsOptions = ['dropdown', 'checkbox', 'radio'].includes(type);
  return {
    client_id: crypto.randomUUID(),
    field_type: type,
    label: `${fieldTypes.find((field) => field.type === type)?.label || 'Field'} field`,
    placeholder: '',
    options: needsOptions ? ['Option 1', 'Option 2'] : null,
    validation_rules: {},
    order_index: 0,
    is_required: false
  };
}

export function prepareFields(fields) {
  return fields.map((field, index) => ({
    field_type: field.field_type,
    label: field.label,
    placeholder: field.placeholder || null,
    options: field.options || null,
    validation_rules: field.validation_rules || {},
    order_index: index + 1,
    is_required: Boolean(field.is_required)
  }));
}

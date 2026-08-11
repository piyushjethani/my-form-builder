const { PrismaClient, Role, FormStatus, FieldType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  await prisma.responseAnswer.deleteMany();
  await prisma.response.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.form.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: await bcrypt.hash('Admin@123', 10),
      role: Role.admin
    }
  });

  const contactForm = await prisma.form.create({
    data: {
      admin_id: admin.id,
      title: 'Contact Us',
      description: 'Collect visitor questions and contact preferences.',
      slug: 'contact-us',
      status: FormStatus.published,
      theme_config: {
        colors: { primary: '#2563eb', background: '#ffffff', text: '#111827' },
        fonts: { body: 'Inter, Arial, sans-serif' },
        layout: { alignment: 'left', width: 'standard' }
      },
      fields: {
        create: [
          { field_type: FieldType.text, label: 'Full Name', placeholder: 'Enter your name', order_index: 1, is_required: true },
          { field_type: FieldType.email, label: 'Email Address', placeholder: 'you@example.com', order_index: 2, is_required: true, validation_rules: { email: true } },
          { field_type: FieldType.dropdown, label: 'Topic', options: ['Support', 'Sales', 'Partnership'], order_index: 3, is_required: true },
          { field_type: FieldType.textarea, label: 'Message', placeholder: 'How can we help?', order_index: 4, is_required: true, validation_rules: { minLength: 10 } }
        ]
      }
    },
    include: { fields: true }
  });

  const eventForm = await prisma.form.create({
    data: {
      admin_id: admin.id,
      title: 'Event Registration',
      description: 'Register attendees for an upcoming workshop.',
      slug: 'event-registration',
      status: FormStatus.published,
      theme_config: {
        colors: { primary: '#16a34a', background: '#f8fafc', text: '#0f172a' },
        fonts: { body: 'Roboto, Arial, sans-serif' },
        layout: { alignment: 'center', width: 'wide' }
      },
      fields: {
        create: [
          { field_type: FieldType.text, label: 'Attendee Name', order_index: 1, is_required: true },
          { field_type: FieldType.radio, label: 'Ticket Type', options: ['General', 'VIP'], order_index: 2, is_required: true },
          { field_type: FieldType.checkbox, label: 'Interests', options: ['Design', 'Development', 'Marketing'], order_index: 3 },
          { field_type: FieldType.date, label: 'Preferred Date', order_index: 4, is_required: true }
        ]
      }
    },
    include: { fields: true }
  });

  const findField = (form, label) => form.fields.find((field) => field.label === label);

  await prisma.response.create({
    data: {
      form_id: contactForm.id,
      answers: {
        create: [
          { field_id: findField(contactForm, 'Full Name').id, value: 'Maya Patel' },
          { field_id: findField(contactForm, 'Email Address').id, value: 'maya@example.com' },
          { field_id: findField(contactForm, 'Topic').id, value: 'Support' },
          { field_id: findField(contactForm, 'Message').id, value: 'I need help setting up my workspace.' }
        ]
      }
    }
  });

  await prisma.response.create({
    data: {
      form_id: contactForm.id,
      answers: {
        create: [
          { field_id: findField(contactForm, 'Full Name').id, value: 'Rahul Verma' },
          { field_id: findField(contactForm, 'Email Address').id, value: 'rahul@example.com' },
          { field_id: findField(contactForm, 'Topic').id, value: 'Sales' },
          { field_id: findField(contactForm, 'Message').id, value: 'Please share pricing for a team plan.' }
        ]
      }
    }
  });

  await prisma.response.create({
    data: {
      form_id: eventForm.id,
      answers: {
        create: [
          { field_id: findField(eventForm, 'Attendee Name').id, value: 'Priya Shah' },
          { field_id: findField(eventForm, 'Ticket Type').id, value: 'VIP' },
          { field_id: findField(eventForm, 'Interests').id, value: ['Design', 'Development'] },
          { field_id: findField(eventForm, 'Preferred Date').id, value: '2026-09-15' }
        ]
      }
    }
  });

  console.log('Seed data created. Admin login: admin@example.com / Admin@123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

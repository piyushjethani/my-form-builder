# Form Builder API

Backend for a no-code form builder using Node.js, Express, Prisma, and MySQL.

## Setup

1. Copy `.env.example` to `.env`.
2. Confirm the database exists and matches:

```env
DATABASE_URL="mysql://root:root123@localhost:3307/form_builders"
```

3. Install dependencies:

```bash
npm install
```

4. Create the database schema with one command:

```bash
npm run db:migrate -- --name init
```

5. Add sample data:

```bash
npm run db:seed
```

6. Start the API:

```bash
npm run dev
```

Seeded admin login:

```text
admin@example.com
Admin@123
```

## Response Format

All JSON endpoints return:

```json
{ "success": true, "data": {}, "error": null }
```

Errors return:

```json
{ "success": false, "data": null, "error": { "message": "..." } }
```

## Auth

### POST `/api/auth/register`

```json
{
  "name": "Admin",
  "email": "admin2@example.com",
  "password": "Password123",
  "role": "admin"
}
```

### POST `/api/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Use the returned token as:

```text
Authorization: Bearer <token>
```

## Admin Forms API

All routes below require an admin JWT.

### POST `/api/forms`

Create a form with nested fields.

```json
{
  "title": "Customer Feedback",
  "description": "Collect customer satisfaction feedback.",
  "status": "draft",
  "theme_config": {
    "colors": { "primary": "#2563eb", "background": "#ffffff" },
    "fonts": { "body": "Inter" },
    "layout": { "alignment": "left" }
  },
  "fields": [
    {
      "field_type": "text",
      "label": "Name",
      "placeholder": "Your name",
      "order_index": 1,
      "is_required": true
    },
    {
      "field_type": "radio",
      "label": "Rating",
      "options": ["Great", "Good", "Needs work"],
      "order_index": 2,
      "is_required": true
    }
  ]
}
```

### GET `/api/forms`

Query params: `status=draft|published`, `search=feedback`

### GET `/api/forms/:id`

Fetch one form for editing.

### PUT `/api/forms/:id`

Update form and replace its field list.

### DELETE `/api/forms/:id`

Delete a form and its related fields/responses.

### POST `/api/forms/:id/duplicate`

Duplicate a form as a draft.

### PATCH `/api/forms/:id/publish`

Toggle between `draft` and `published`.

## Public Form API

### GET `/api/public/forms/:slug`

Fetch a published form for rendering.

### POST `/api/public/forms/:slug/responses`

Submit a public response. Rate limited to 30 submissions per 15 minutes per IP.

```json
{
  "answers": [
    { "field_id": 1, "value": "Maya Patel" },
    { "field_id": 2, "value": "maya@example.com" },
    { "field_id": 3, "value": ["Design", "Development"] }
  ]
}
```

## Admin Responses API

All routes require an admin JWT and only expose responses for that admin's forms.

### GET `/api/forms/:id/responses`

Query params:

```text
page=1
limit=20
sort=submitted_at|id
order=asc|desc
startDate=2026-01-01
endDate=2026-12-31
fieldId=3
fieldValue=Support
```

### GET `/api/forms/:id/responses/export`

Streams a CSV download.

### GET `/api/forms/:id/analytics`

Returns total responses, response count by date, and option distribution for dropdown/radio/checkbox fields.

## Project Structure

```text
prisma/
  schema.prisma
  seed.js
src/
  config/
  controllers/
  middleware/
  routes/
  utils/
  validators/
```

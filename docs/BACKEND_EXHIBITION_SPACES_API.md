# Backend: Exhibition spaces API (fix "Cannot POST")

The frontend calls your backend at `NEXT_PUBLIC_API_URL`. Add these routes to your **Express backend** so `POST /api/events/:eventId/exhibition-spaces` (and GET/PUT) work.

Your `exhibition_spaces` table (neondb) has: `id`, `eventId`, `spaceType`, `name`, `description`, `dimensions`, `area`. Add columns `basePrice`, `minArea`, `unit`, `pricePerSqm` if you want to store them; otherwise you can use defaults.

---

## 1. GET `/api/events/:eventId/exhibition-spaces`

List exhibition spaces for an event.

**Response:** `{ "exhibitionSpaces": [ { "id", "eventId", "name", "spaceType", "description", "dimensions", "area", "basePrice", ... } ] }`

**Example (Express + Prisma):**

```js
// GET /api/events/:eventId/exhibition-spaces
router.get('/api/events/:eventId/exhibition-spaces', async (req, res) => {
  try {
    const { eventId } = req.params;
    const spaces = await prisma.exhibitionSpace.findMany({
      where: { eventId },
      orderBy: { name: 'asc' },
    });
    res.json({ exhibitionSpaces: spaces });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch exhibition spaces' });
  }
});
```

**Example (Express + raw pg):**

```js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/api/events/:eventId/exhibition-spaces', async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      'SELECT id, "eventId", name, "spaceType", description, dimensions, area FROM exhibition_spaces WHERE "eventId" = $1 ORDER BY name',
      [eventId]
    );
    res.json({ exhibitionSpaces: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch exhibition spaces' });
  }
});
```

---

## 2. POST `/api/events/:eventId/exhibition-spaces`

Create an exhibition space. **This is the route that is currently missing and causes "Cannot POST".**

**Request body (from frontend):**
- `name` (string, required)
- `spaceType` (string, e.g. `"RAW_SPACE"`)
- `description` (string)
- `dimensions` (string, e.g. `"3m*3m"`)
- `area` (number)
- `basePrice` (number)
- `minArea` (number, optional)
- `unit` (string, optional, e.g. `"sqm"`)
- `pricePerSqm` (number, optional)

**Response:** The created row (with `id`), e.g. `201` + body.

**Example (Express + Prisma):**

```js
// POST /api/events/:eventId/exhibition-spaces
router.post('/api/events/:eventId/exhibition-spaces', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, spaceType, description, dimensions, area, basePrice, minArea, unit, pricePerSqm } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const space = await prisma.exhibitionSpace.create({
      data: {
        eventId,
        name: name.trim(),
        spaceType: spaceType || 'RAW_SPACE',
        description: description || name,
        dimensions: dimensions || null,
        area: Number(area) || 100,
        basePrice: Number(basePrice) ?? 0,
        minArea: minArea != null ? Number(minArea) : null,
        unit: unit || 'sqm',
        pricePerSqm: pricePerSqm != null ? Number(pricePerSqm) : null,
      },
    });
    res.status(201).json(space);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create exhibition space' });
  }
});
```

**Example (Express + raw pg) – minimal columns (id, eventId, spaceType, name, description, dimensions, area):**

```js
const { v4: uuidv4 } = require('uuid');

router.post('/api/events/:eventId/exhibition-spaces', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, spaceType, description, dimensions, area } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const id = uuidv4();
    await pool.query(
      `INSERT INTO exhibition_spaces (id, "eventId", "spaceType", name, description, dimensions, area)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        eventId,
        (spaceType || 'RAW_SPACE').trim(),
        name.trim(),
        (description || name).trim() || null,
        dimensions || null,
        Number(area) || 100,
      ]
    );
    const result = await pool.query('SELECT * FROM exhibition_spaces WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create exhibition space' });
  }
});
```

If your table has more columns (`base_price`, `min_area`, `unit`, `price_per_sqm`), add them to the `INSERT` and `SELECT`.

---

## 3. PUT `/api/events/:eventId/exhibition-spaces/:spaceId`

Update an exhibition space (e.g. price).

**Request body:** `{ "basePrice", "pricePerSqm", "pricePerUnit" }` (or whatever your schema has).

**Response:** Updated row.

**Example (Express + Prisma):**

```js
router.put('/api/events/:eventId/exhibition-spaces/:spaceId', async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { basePrice, pricePerSqm, pricePerUnit } = req.body;
    const space = await prisma.exhibitionSpace.update({
      where: { id: spaceId },
      data: {
        ...(basePrice != null && { basePrice: Number(basePrice) }),
        ...(pricePerSqm != null && { pricePerSqm: Number(pricePerSqm) }),
        ...(pricePerUnit != null && { pricePerUnit: Number(pricePerUnit) }),
      },
    });
    res.json(space);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update exhibition space' });
  }
});
```

---

## Route registration

Ensure your Express app uses the router that defines these routes, and that the path is exactly:

- `GET  /api/events/:eventId/exhibition-spaces`
- `POST /api/events/:eventId/exhibition-spaces`
- `PUT  /api/events/:eventId/exhibition-spaces/:spaceId`

Example:

```js
const express = require('express');
const router = express.Router();
// ... add the routes above ...
app.use(router);  // or app.use('/api', router) and then use router.get('/events/:eventId/exhibition-spaces', ...)
```

After adding **POST** (and optionally GET/PUT), "Cannot POST /api/events/.../exhibition-spaces" will be resolved.

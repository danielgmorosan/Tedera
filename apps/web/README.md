# Web App + Integrated API

This Next.js app now includes the REST-like API previously implemented in the separate `apps/api` service. The dedicated Express service can be removed once you confirm everything needed lives here.

## Environment

Set the following in a root or app-level `.env.local`:

```
MONGO_URI=mongodb://localhost:27017/hedera_asset_dev
JWT_SECRET=replace-me
```

## API Routes (App Router)

| Route                           | Method | Description                                                      |
| ------------------------------- | ------ | ---------------------------------------------------------------- |
| /api/auth/signup                | POST   | Create user (username, password, optional email/hederaAccountId) |
| /api/auth/login                 | POST   | Login via { username,password } or { hederaAccountId }           |
| /api/properties                 | GET    | List properties (supports pagination & sorting)                  |
| /api/properties                 | POST   | Create property (auth)                                           |
| /api/properties/:id             | GET    | Property detail                                                  |
| /api/investments                | GET    | Current user investments (auth, paginated & sortable)            |
| /api/investments                | POST   | Invest in property (auth)                                        |
| /api/distributions              | POST   | Create distribution (auth property creator)                      |
| /api/distributions/property/:id | GET    | List distributions for property                                  |
| /api/distributions/my-earnings  | GET    | Earnings per distribution (auth, share-adjusted)                 |

Auth: Supply `Authorization: Bearer <token>` returned from signup/login.

## Models (Mongoose)

Defined under `models/` (User, Property, Investment, Distribution).
Database connection caching logic is in `lib/db.ts`.

## Frontend Auth Integration

`context/auth-context.tsx` now calls the internal API instead of mock logic.

## Pagination

Endpoints supporting pagination accept the following query parameters:

`page` (number, default 1) – 1-based page index
`pageSize` (number, default 10, max 100) – results per page
`sort` (string, optional) – field:direction, e.g. `createdAt:desc` or `totalAmount:asc`

Responses include a metadata envelope:

```
{
	"items": [...], // properties or investments
	"page": 1,
	"pageSize": 10,
	"total": 42,
	"totalPages": 5
}
```

## Next Steps / Hardening

- (Planned) Add OpenAPI spec generation (e.g., zod-to-openapi) at `/api/openapi`
- (Planned) Unit tests (auth utils, pagination, earnings)
- (Planned) Input sanitization & stricter validation
- (Optional, excluded per request) Rate limiting

## Removing Old Service

If satisfied:

1. Delete `apps/api` directory
2. Remove associated scripts from root `package.json` (ats:api:\*)
3. Update docs referencing separate API.

## License

Apache-2.0

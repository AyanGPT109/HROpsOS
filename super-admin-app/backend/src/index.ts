import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { requireSuperAdmin, requireTenantAdmin, requireWorker } from './middleware/auth.js'
import { adminRouter } from './routes/admins.js'
import { plantRouter } from './routes/plants.js'
import { tenantWorkerRouter } from './routes/tenantWorkers.js'
import { employeeRouter } from './routes/employee.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const localOrigins = [
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
]
const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const allowedOrigins = new Set([...localOrigins, ...configuredOrigins])

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Origin=${req.headers.origin ?? 'none'} User-Agent=${req.headers['user-agent'] ?? 'unknown'}`
  );
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      console.log("Incoming Origin:", origin);
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      console.warn("Blocked Origin:", origin);
      return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hropsos-cloud-platform-api' })
})

app.use('/api/super-admin', requireSuperAdmin, adminRouter)
app.use('/api/super-admin', requireSuperAdmin, plantRouter)
app.use('/api/tenant', requireTenantAdmin, tenantWorkerRouter)
app.use('/api/employee', requireWorker, employeeRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected error'
  res.status(500).json({ error: 'ServerError', message })
})

app.listen(port, () => {
  console.log(`HROpsOS Cloud Platform API listening on http://localhost:${port}`)
})

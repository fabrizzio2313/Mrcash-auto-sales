# Mr. Cash Auto Sales — Sitio Web de Dealership

Sitio web para un dealership de autos usados: catálogo público bilingüe
(inglés/español) y panel de administración protegido para gestionar el
inventario.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL** (vía driver adapter `@prisma/adapter-pg`).
  En producción se usa [Neon](https://neon.tech) (Postgres serverless, plan
  gratis); en local, apuntá `DATABASE_URL` a una branch de Neon o a un
  Postgres local.
- **next-intl** para el soporte bilingüe (rutas `/en/...` y `/es/...`)
- Autenticación de admin **propia** (sin proveedor externo): sesión firmada
  con JWT (`jose`) en una cookie httpOnly, contraseñas con `bcryptjs`.

## Primeros pasos

```bash
cp .env.example .env   # y completá DATABASE_URL (Postgres) + SESSION_SECRET
npm install            # también corre `prisma generate` (postinstall)
npm run db:deploy      # aplica las migraciones a la base apuntada por DATABASE_URL
npm run db:seed        # crea un usuario admin y algunos vehículos de ejemplo
npm run dev            # http://localhost:3000 (redirige a /en)
```

Generá un `SESSION_SECRET` real:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deploy a Vercel

1. **Base de datos:** en el proyecto de Vercel → **Storage → Create Database
   → Neon**. Vercel agrega `DATABASE_URL` a las variables de entorno solo.
2. **Variables de entorno** (Project → Settings → Environment Variables):
   - `DATABASE_URL` — la pone Neon/Vercel automáticamente.
   - `SESSION_SECRET` — 32 bytes aleatorios en base64 (comando de arriba).
   - `RESEND_API_KEY` — clave de Resend, o vacía (los avisos por email se
     omiten, los prospectos igual se guardan).
   - `EMAIL_FROM` — `onboarding@resend.dev` para empezar.
3. **Build:** el script `vercel-build` corre `prisma migrate deploy` antes de
   `next build`, así que cada deploy aplica las migraciones pendientes.
4. **Primer deploy:** después de que termine, sembrá el usuario admin
   corriendo `npm run db:seed` localmente con el `DATABASE_URL` de Neon en tu
   `.env`. Cambiá la contraseña del admin enseguida.

> La subida de fotos *desde el dispositivo* (`/api/upload`) escribe a disco y
> **no funciona en Vercel** — el admin puede pegar URLs de imágenes. Para
> uploads reales hace falta un servicio de storage (Cloudinary/S3/R2).

### Credenciales de admin (solo para desarrollo)

El seed crea:

- **Email:** `admin@example.com`
- **Password:** `ChangeMe123!`

Panel: `http://localhost:3000/en/admin/login` (o `/es/admin/login`).
Cambia esta contraseña (o crea otro `AdminUser` y borra este) antes de
usar el sitio en producción.

## Estructura del proyecto

```
app/[locale]/
  (public)/          páginas públicas (Navbar + Footer): home, inventory,
                      inventory/[id], about, contact
  admin/login/        login del panel (público)
  admin/(protected)/  dashboard, vehicles, vehicles/new,
                      vehicles/[id]/edit, messages — requieren sesión

components/           componentes públicos reutilizables
components/admin/     componentes del panel de administración

lib/
  actions/            Server Actions (auth, vehicles, contact)
  prisma.ts           cliente Prisma (con el driver adapter de SQLite)
  session.ts          firmar/verificar el JWT de sesión
  auth.ts             leer/crear/borrar la cookie de sesión
  dal.ts              verifySession() — chequeo de autorización real,
                      usado en Server Actions y en el layout del admin
  definitions.ts       esquemas de validación (zod)
  vehicles.ts          queries de lectura del inventario

i18n/                 configuración de next-intl (rutas, mensajes)
messages/{en,es}.json  textos de la interfaz en ambos idiomas
prisma/schema.prisma   modelos: Vehicle, VehicleImage, AdminUser,
                       ContactMessage
proxy.ts               enrutamiento de idioma + protección optimista de
                        /admin/* (Next.js 16 renombró middleware.ts a
                        proxy.ts)
```

## Notas sobre la autenticación

Hay dos capas, como recomienda la documentación de Next.js:

1. **Optimista** (`proxy.ts`): redirige a `/admin/login` si no hay cookie
   de sesión válida, antes de que la página se renderice. Rápido, pero
   solo mira la cookie.
2. **Real** (`lib/dal.ts` → `verifySession()`): se llama en el layout
   protegido del admin y en cada Server Action de escritura
   (`createVehicle`, `updateVehicle`, `deleteVehicle`, etc.). Esta es la
   que realmente protege los datos — la de `proxy.ts` es solo una mejora
   de experiencia, no un sustituto.

## Añadir fotos a un vehículo

El formulario del admin acepta URLs de imágenes (una por línea) en vez de
subir archivos — así el scaffold no depende de un servicio de storage.
Para producción, lo natural es reemplazar ese campo por un upload real
(p. ej. a S3/R2/Cloudinary) y guardar la URL resultante en
`VehicleImage.url`.

## Configuración del negocio (sin tocar código)

En **Admin → Configuración del Negocio** (`/en/admin/settings`) se editan
los datos que aparecen en el header, el footer y las páginas de contacto y
ubicación: nombre, teléfono (visible y para enlaces `tel:`/`sms:`), número
de WhatsApp, email, dirección, horarios y URL de Facebook.

Los valores viven en la tabla `Settings` (una sola fila, `id = "singleton"`).
Cualquier campo que se deje vacío usa el valor por defecto compilado en
`lib/site.ts`. `lib/settings.ts` (`getSite()`) fusiona lo guardado sobre esos
defaults y calcula los enlaces derivados (`wa.me`, Google Maps, etc.); al
guardar, la Server Action llama a `revalidatePath("/", "layout")` para que
el sitio público se actualice de inmediato.

## Notificaciones por email de nuevos prospectos

Cada nuevo lead (prueba de manejo, financiamiento o contacto general) dispara
un correo de aviso. El envío usa **Resend** (`lib/email.ts`, vía `fetch` — sin
dependencias) y corre con `after()` para no retrasar el envío del formulario;
si algo falla, se registra en consola y el lead se guarda igual.

**Para activarlo:**

1. Crea una cuenta gratuita en <https://resend.com> (plan Free: 3.000
   correos/mes, 100/día — de sobra para los prospectos de un dealership).
2. En el dashboard de Resend → **API Keys** → *Create API Key* (permiso
   *Sending access*). Copia la clave (empieza con `re_`).
3. Pégala en `.env` como `RESEND_API_KEY="re_..."` y reinicia `npm run dev`
   (en producción, ponla como variable de entorno del hosting).
4. Remitente (`EMAIL_FROM` en `.env`):
   - **Rápido para probar:** deja `onboarding@resend.dev`. Solo entrega al
     correo con el que registraste Resend — sirve para verificar que todo
     funciona.
   - **Para uso real:** en Resend → **Domains** → verifica tu dominio
     (agregas unos registros DNS). Luego usa
     `EMAIL_FROM="Mr. Cash Auto Sales <leads@tudominio.com>"`.
5. En el panel: **Admin → Configuración del Negocio → Notificaciones de
   prospectos**, escribe el correo donde quieres recibir los avisos y guarda.
   Si lo dejas vacío, no se envía nada (los leads se siguen guardando y se ven
   en Admin → Mensajes).

El correo destino se guarda en `Settings.notificationEmail`; la API key y el
remitente son de infraestructura y van en variables de entorno, no en el panel.

## Comandos útiles de Prisma

```bash
npm run db:studio    # explorador visual de la base de datos
npx prisma migrate dev --name <descripcion>   # nueva migración
```

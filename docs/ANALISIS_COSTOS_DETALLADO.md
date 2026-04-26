# Analisis de Costos Detallado - Catalog Aljaba

Fecha de elaboracion: 08 de marzo de 2026
Version: 1.0

---

## Nota Metodologica: Como se calcularon estos numeros

Antes de presentar cualquier cifra, es necesario explicar de donde proviene cada numero. Este analisis no es especulativo; cada dato se basa en una fuente verificable.

**Fuentes utilizadas:**

- Paginas oficiales de precios de DigitalOcean (digitalocean.com/pricing), consultadas en marzo 2026.
- Pagina oficial de precios de Cloudflare (cloudflare.com/plans), consultada en marzo 2026.
- Calculadora de precios de AWS (calculator.aws), usada para comparacion.
- Pagina de precios de Neon (neon.tech/pricing), consultada en marzo 2026.
- Pagina de precios de GitHub (github.com/pricing), consultada en marzo 2026.
- Mercado laboral guatemalteco: datos de portales de empleo locales (Encuentra24, CompuTrabajo Guatemala) y referencias del Ministerio de Trabajo de Guatemala para estimar el valor de las horas de desarrollo.
- Precios de registro de dominios: Namecheap (namecheap.com) y GoDaddy (godaddy.com), consultados en marzo 2026.
- Documentacion oficial de todas las librerias de software libre mencionadas, que confirman su licencia sin costo.

Todos los precios estan en dolares estadounidenses (USD) porque los servicios de nube se cobran en esa moneda. El tipo de cambio referencial al momento de este documento es Q7.70 por dolar.

---

## Parte 1: Costo de Desarrollo

### 1.1 Por que el costo de desarrollo es diferente al costo de software

El costo de desarrollo no es lo que se paga por las herramientas, sino el valor del tiempo humano invertido en construir el sistema. En un proyecto comercial normal, una empresa de software cobraria por ese tiempo. En este caso, el sistema es desarrollado por un estudiante de graduacion, lo que cambia el modelo de costos, pero no elimina el costo real; simplemente lo convierte en una inversion del estudiante (tiempo) en lugar de un pago en efectivo de la empresa.

Se presentan dos perspectivas:
- **Perspectiva de Aljaba S.A.:** cuanto le cuesta a la empresa.
- **Perspectiva de costo real de mercado:** cuanto costaria si se contratara externamente.

---

### 1.2 Herramientas de Desarrollo: Costo Real Cero

Todas las herramientas que se usaran para construir el sistema son de uso libre (open source o free tier suficiente para desarrollo). Se listan aqui con sus licencias verificadas:

| Herramienta | Licencia / Plan | Costo | Fuente de Verificacion |
|-------------|----------------|-------|----------------------|
| Visual Studio Code | MIT License | $0 | code.visualstudio.com/license |
| Node.js 20 LTS | MIT License | $0 | nodejs.org/en/about/previous-releases |
| React 18 | MIT License | $0 | github.com/facebook/react/blob/main/LICENSE |
| TypeScript | Apache 2.0 | $0 | github.com/microsoft/TypeScript/blob/main/LICENSE.txt |
| Vite | MIT License | $0 | github.com/vitejs/vite/blob/main/LICENSE |
| Express.js | MIT License | $0 | github.com/expressjs/express/blob/master/LICENSE |
| Prisma ORM | Apache 2.0 | $0 | github.com/prisma/prisma/blob/main/LICENSE |
| PostgreSQL | PostgreSQL License | $0 | postgresql.org/about/licence |
| Sharp (procesamiento imagenes) | Apache 2.0 | $0 | github.com/lovell/sharp/blob/main/LICENSE |
| Puppeteer | Apache 2.0 | $0 | github.com/puppeteer/puppeteer/blob/main/LICENSE |
| Fabric.js (editor canvas) | MIT License | $0 | github.com/fabricjs/fabric.js/blob/master/LICENSE |
| Material-UI (MUI) | MIT License | $0 | github.com/mui/material-ui/blob/master/LICENSE |
| TailwindCSS | MIT License | $0 | github.com/tailwindlabs/tailwindcss/blob/master/LICENSE |
| Zod (validacion) | MIT License | $0 | github.com/colinhacks/zod/blob/master/LICENSE |
| React Query (TanStack) | MIT License | $0 | github.com/TanStack/query/blob/main/LICENSE |
| Zustand | MIT License | $0 | github.com/pmndrs/zustand/blob/main/LICENSE |
| Jest (testing) | MIT License | $0 | github.com/jestjs/jest/blob/main/LICENSE |
| Git | GPL v2 | $0 | git-scm.com/about/free-and-open-source |
| GitHub (repositorio privado) | Free plan | $0 | github.com/pricing (1 desarrollador, repositorios privados gratis) |
| GitHub Actions (CI/CD) | Free plan | $0 | docs.github.com/en/billing/managing-billing-for-github-actions (2,000 min/mes gratis) |
| Docker Desktop | Free para uso personal/educativo | $0 | docs.docker.com/subscription/desktop-license |
| Postman (pruebas de API) | Free plan | $0 | postman.com/pricing |

**Conclusion:** El costo en licencias de software para el desarrollo es $0.

---

### 1.3 Costo de Entorno de Desarrollo Local

Durante el desarrollo, el programador necesita ejecutar una base de datos PostgreSQL y el servidor de aplicaciones en su propia computadora. Esto no requiere pagar ningun servicio en la nube; se hace localmente con Docker.

| Concepto | Costo | Justificacion |
|----------|-------|---------------|
| Docker Desktop (PostgreSQL local) | $0 | Uso educativo, licencia gratuita |
| Servidor local Node.js | $0 | Corre en la computadora del desarrollador |
| Electricity (computadora durante 5 meses) | Costo personal del desarrollador | No es un costo de la empresa |

---

### 1.4 Unico Costo Real de Desarrollo: El Dominio

El unico desembolso de dinero necesario ANTES de que el sistema este en produccion es el registro del nombre de dominio web.

**Por que se necesita un dominio:**
El dominio es la direccion web del sistema (por ejemplo, `catalogo.aljaba.com.gt` o `catalog-aljaba.com`). Sin un dominio registrado, el sistema solo seria accesible mediante una direccion IP numerica, lo cual es inaceptable para uso empresarial.

**Como se calculo el costo:**

Se consultaron tres registradores de dominios el 08 de marzo de 2026:

| Registrador | Dominio .com | Dominio .com.gt | Fuente |
|-------------|-------------|-----------------|--------|
| Namecheap | $9.98/año (primer año $6.98) | No disponible | namecheap.com/domains |
| GoDaddy | $11.99/año (primer año $0.99-$2.99) | No disponible | godaddy.com/domains |
| Registro.gt (oficial Guatemala) | No aplica | Q150/año ≈ $19.50 | registro.gt |

**Recomendacion:** Usar dominio `.com` en Namecheap al precio de renovacion de $9.98/año, ya que es la opcion mas economica y reconocida internacionalmente. El dominio `.com.gt` es mas costoso y tiene burocracia adicional para empresas guatemaltecas.

**Costo adoptado para este analisis:** $12/año (precio conservador, incluye margen sobre el precio de Namecheap).

---

### 1.5 Costo de Desarrollo en Terminos de Mercado (Referencia)

Aunque Aljaba S.A. no pagara directamente el desarrollo porque es un proyecto de graduacion, es importante documentar cuanto costaria contratar esto en el mercado para que la empresa valore lo que esta recibiendo.

**Base del calculo:**

Se consultaron ofertas de trabajo activas en Encuentra24.com y CompuTrabajo Guatemala en marzo 2026 para "desarrollador web full-stack" con experiencia en React y Node.js:

- Salario junior (0-2 años experiencia): Q6,000 - Q8,000/mes
- Salario semi-senior (2-4 años): Q10,000 - Q15,000/mes
- Salario senior (4+ años): Q18,000 - Q25,000/mes

Para un desarrollador con el perfil de este proyecto (estudiante de ultimo año con conocimiento del stack), el valor de mercado conservador seria Q8,000/mes, equivalente a $1,039/mes al tipo de cambio de Q7.70.

**Duracion del proyecto:** 5 meses (20 semanas)

**Calculo:**
```
Costo de mercado del desarrollo = Q8,000/mes x 5 meses = Q40,000
En dolares: Q40,000 / 7.70 = $5,195
```

Si se contratara una empresa de software local con overhead administrativo (tipicamente 2x el costo del desarrollador), el precio seria:
```
Costo de empresa de software = $5,195 x 2 = $10,390
```

Empresas de software guatemaltecas consultadas como referencia de precios de mercado:
- Proyectos web similares en Guatemala se cotizan entre $8,000 y $15,000 USD para sistemas con estas caracteristicas.
- Fuente: solicitudes de cotizacion anonimas a 2 empresas guatemaltecas de desarrollo web (febrero 2026).

**Valor que recibe Aljaba S.A. sin pago directo:** entre $5,000 y $15,000 USD.

---

### 1.6 Costo de Testing (Pruebas)

Las pruebas del sistema tampoco tienen costo monetario adicional. Se justifica a continuacion:

| Tipo de Prueba | Herramienta | Costo | Quien la ejecuta |
|----------------|-------------|-------|-----------------|
| Pruebas unitarias | Jest (open source) | $0 | Desarrollador |
| Pruebas de integracion | Supertest (open source) | $0 | Desarrollador |
| Pruebas de componentes UI | React Testing Library (open source) | $0 | Desarrollador |
| Pruebas manuales funcionales | Navegador web + Postman | $0 | Desarrollador + Personal Aljaba |
| Pruebas de aceptacion | Personal de Aljaba en horario laboral | $0 extra | Empleados ya contratados por Aljaba |

Las pruebas de aceptacion con usuarios reales de Aljaba se realizaran dentro del horario laboral normal del personal; no es necesario pagar tiempo extra porque son parte del proceso de aprobacion del sistema que la empresa misma solicito.

---

### 1.7 Costo de Despliegue Inicial (Primera Puesta en Produccion)

El despliegue inicial consiste en configurar los servicios en la nube por primera vez. No tiene costo adicional mas alla del primer mes de infraestructura.

| Actividad | Tiempo estimado | Costo |
|-----------|----------------|-------|
| Crear cuenta DigitalOcean | 15 minutos | $0 |
| Configurar App Platform | 1 hora | Incluido en tarifa mensual |
| Configurar base de datos | 30 minutos | Incluido en tarifa mensual |
| Configurar Spaces (storage) | 30 minutos | Incluido en tarifa mensual |
| Configurar Cloudflare | 1 hora | $0 (plan gratuito) |
| Configurar GitHub Actions | 2 horas | $0 |
| Configurar dominio y DNS | 30 minutos | Incluido en costo del dominio |
| Migrar datos iniciales | 2-4 horas | $0 |

**Costo de despliegue inicial:** $0 adicionales. Solo se paga el primer mes de infraestructura ($32) que ya se cuenta en los costos operativos.

---

### 1.8 Resumen del Costo de Desarrollo

| Concepto | Costo para Aljaba S.A. | Valor de Mercado Real |
|----------|----------------------|----------------------|
| Licencias de software | $0 | $0 (open source) |
| Horas de desarrollo (5 meses) | $0 (proyecto graduacion) | $5,195 - $10,390 |
| Testing | $0 | Incluido arriba |
| Despliegue inicial | $0 | Incluido arriba |
| **TOTAL COSTO PARA ALJABA** | **$0** | - |

---

## Parte 2: Costos Operativos Mensuales (Infraestructura en Produccion)

### 2.1 Como se eligio DigitalOcean sobre AWS u otras opciones

Se evaluaron cuatro proveedores de nube antes de seleccionar DigitalOcean. La decision no fue arbitraria.

**Criterios de evaluacion:**
1. Costo mensual total por debajo de $90 (presupuesto de Aljaba).
2. Facilidad de administracion (el desarrollador es una persona, no un equipo de DevOps).
3. Confiabilidad (SLA de al menos 99%).
4. Soporte en espanol o ingles accesible.
5. Backups automaticos incluidos o a bajo costo.

**Tabla comparativa de proveedores (precios consultados en marzo 2026):**

| Proveedor | Hosting App | Base de Datos | Almacenamiento 50GB | Total/mes | Evaluacion |
|-----------|-------------|---------------|---------------------|-----------|------------|
| **DigitalOcean** | $12 (App Platform Basic) | $15 (Managed PG, 1GB) | $5 (Spaces 50GB+CDN) | **$32** | Recomendado |
| AWS | $15 (EC2 t3.small) | $15 (RDS t3.micro) | $2 (S3) + $8 (CloudFront) | **$40** | Viable pero mas complejo |
| Google Cloud | $13 (Cloud Run) | $18 (Cloud SQL pg-micro) | $3 (Cloud Storage) | **$34** | Similar a DO, menos familiar |
| Render.com | $7 (Starter) | $19 (Neon Scale) | $1 (Cloudflare R2) | **$27** | Mas barato pero menor control |
| Azure | $20 (App Service B1) | $25 (Azure DB PG) | $2 (Blob Storage) | **$47** | Mas caro sin ventaja clara |

**Por que NO se eligio AWS a pesar de ser mas conocido:**
AWS es mas flexible y potente, pero requiere mayor conocimiento de configuracion (IAM, VPC, Security Groups, etc.). Para un sistema mantenido por una o dos personas, DigitalOcean es significativamente mas simple de operar con precios muy similares. La diferencia de $8/mes entre DigitalOcean ($32) y AWS ($40) no justifica la complejidad adicional de AWS para este caso.

**Por que NO se eligio Render.com a pesar de ser mas barato:**
Render.com tiene un costo menor ($27/mes), pero su plan Starter del servidor web tiene limitaciones de RAM (512MB) que pueden ser insuficientes para generar PDFs de catalogos con muchas imagenes. DigitalOcean App Platform Basic incluye 1GB RAM, que es el minimo recomendado para Puppeteer (el generador de PDFs).

---

### 2.2 Desglose Detallado de Cada Servicio

#### Servicio 1: Aplicacion Web (DigitalOcean App Platform)

**Que es:** El servidor donde corre el codigo del sistema. Tanto el frontend (la interfaz web) como el backend (la logica y la API) se despliegan aqui.

**Plan seleccionado:** Basic ($12/mes)

**Que incluye el plan Basic segun digitalocean.com/pricing (marzo 2026):**
- 1 vCPU (procesador virtual)
- 1 GB de RAM
- 1 GB de almacenamiento para el codigo
- 1 TB de transferencia de datos incluida por mes
- Deploy automatico desde GitHub
- SSL/HTTPS incluido sin costo adicional

**Por que 1GB de RAM es suficiente:**
- El servidor Node.js en reposo consume aproximadamente 50-100 MB de RAM.
- Puppeteer (generador de PDF) consume picos de 200-400 MB al generar un PDF.
- Con usuarios concurrentes bajos (menos de 50 simultaneous), 1GB es adecuado.
- El limite proyectado de usuarios Guest simultaneos es 100 empleados ruteros. Sin embargo, en la practica no todos descargarian PDFs al mismo tiempo. 10-20 usuarios concurrentes es el escenario realista para Aljaba.

**Fuente:** digitalocean.com/pricing/app-platform, consultado 08 de marzo de 2026.

---

#### Servicio 2: Base de Datos PostgreSQL (DigitalOcean Managed Database)

**Que es:** El servidor dedicado que almacena todos los datos del sistema: productos, categorias, catalogos, usuarios, imagenes (metadata), etc.

**Plan seleccionado:** Basic PostgreSQL ($15/mes)

**Que incluye segun digitalocean.com/pricing/managed-databases (marzo 2026):**
- 1 GB de RAM para el motor de base de datos
- 10 GB de almacenamiento SSD
- 1 nodo (sin replica de alta disponibilidad, adecuado para MVP)
- Backups automaticos diarios con retencion de 7 dias
- SSL para conexiones cifradas incluido
- Monitoreo basico incluido

**Por que 10 GB es suficiente para la base de datos:**
Los datos que se almacenan en la base de datos son texto y numeros, NO las imagenes en si. Las imagenes se guardan en Spaces (servicio separado). Estimado de uso:

```
10,000 productos x 2 KB promedio por fila = 20 MB de datos de productos
50,000 imagenes (solo metadata, no el archivo) x 0.5 KB = 25 MB
Catalogos, categorias, usuarios: estimado 5 MB
Indices de base de datos: estimado 50 MB
Total estimado: ~100 MB

10 GB de espacio disponible / 100 MB de uso estimado = 100x de margen
```

Incluso con 10,000 productos y crecimiento sostenido por 5 años, la base de datos no superaria los 500 MB. Los 10 GB son mas que suficientes.

**Por que se elige Managed Database en lugar de instalar PostgreSQL en el mismo servidor de la aplicacion:**
Podria ahorrarse el costo de la base de datos instalando PostgreSQL directamente en el mismo servidor de la aplicacion. Sin embargo, esto se descarto por dos razones:
1. Si el servidor de la aplicacion tiene problemas, tambien se pierden los datos.
2. Gestionar backups manuales es trabajo adicional que puede olvidarse. Los backups automaticos del Managed Database son una garantia critica.

**Fuente:** digitalocean.com/pricing/managed-databases, consultado 08 de marzo de 2026.

---

#### Servicio 3: Almacenamiento de Imagenes (DigitalOcean Spaces)

**Que es:** El equivalente a un disco duro en la nube donde se guardan todos los archivos de imagen y los PDFs generados. Es compatible con el protocolo S3 de AWS.

**Plan seleccionado:** Spaces ($5/mes)

**Que incluye segun digitalocean.com/pricing/spaces (marzo 2026):**
- 250 GB de almacenamiento incluidos
- 1 TB de transferencia de datos (descarga) incluida
- CDN (red de distribucion de contenido) incluida sin costo adicional
- Precio adicional si se supera: $0.02/GB de almacenamiento extra, $0.01/GB de transferencia extra

**Calculo del almacenamiento necesario:**

Aljaba proyecta tener 10,000 productos para fin de 2026. Cada producto tiene una imagen.

```
Estimado de tamano de imagen optimizada: 200-500 KB por imagen
(Sharp comprime las imagenes al subirlas al sistema)

10,000 imagenes x 500 KB = 5,000 MB = 5 GB de imagenes
Thumbnails generados: 10,000 x 50 KB = 500 MB = 0.5 GB
PDFs generados y almacenados: estimado 50 catalogos x 10 MB = 500 MB = 0.5 GB
Total estimado maximo: 6 GB

250 GB incluidos / 6 GB de uso estimado = 41x de margen
```

El plan de $5/mes cubre el uso proyectado con muchisimo margen. No se preveen costos adicionales por almacenamiento durante al menos 3-5 años de crecimiento.

**Por que se usa CDN:**
La CDN distribuye las imagenes desde servidores ubicados cerca del usuario final. Esto significa que cuando un empleado rutero en Guatemala descarga el catalogo, las imagenes se sirven desde el servidor de CDN mas cercano (probablemente Miami o Dallas, no Amsterdam o Singapore). Esto reduce el tiempo de carga y mejora la experiencia. La CDN de DigitalOcean Spaces esta incluida en el precio base de $5/mes; no es un costo adicional.

**Fuente:** digitalocean.com/pricing/spaces, consultado 08 de marzo de 2026.

---

#### Servicio 4: SSL / HTTPS y CDN para la Aplicacion (Cloudflare)

**Que es:** Cloudflare actua como intermediario entre los usuarios y el servidor de la aplicacion. Provee el certificado SSL (el candado verde en el navegador que indica conexion segura HTTPS), proteccion contra ataques, y cache de archivos estaticos.

**Plan seleccionado:** Free Plan

**Que incluye el plan gratuito segun cloudflare.com/plans (marzo 2026):**
- Certificado SSL gratuito (Let's Encrypt gestionado por Cloudflare)
- Proteccion basica contra DDoS
- Cache de archivos estaticos del frontend
- DNS gestionado
- Sin limite de bandwidth en el plan gratuito para proteccion basica

**Por que Cloudflare es gratuito y no hay trampa:**
Cloudflare ofrece este plan gratuito porque su negocio principal son los planes empresariales (Pro, Business, Enterprise). El plan gratuito es suficiente para la gran mayoria de sitios web con menos de millones de visitas diarias. Aljaba S.A. tiene aproximadamente 20-50 empleados ruteros; el trafico es minimo. El plan gratuito sera suficiente indefinidamente.

**Por que el certificado SSL no tiene costo aunque HTTPS es "obligatorio":**
Originalmente los certificados SSL costaban $50-$200/año. Desde 2016, Let's Encrypt ofrece certificados gratuitos, y Cloudflare los gestiona automaticamente. DigitalOcean App Platform tambien incluye SSL gratuito en todos sus planes. Por tanto, HTTPS es gratuito en esta arquitectura.

**Fuente:** cloudflare.com/plans, consultado 08 de marzo de 2026.

---

#### Servicio 5: Dominio Web

**Costo:** $12/año = $1/mes (prorrateado)

**Como se calculo este costo:**
Ver seccion 1.4 de este documento. El costo de $12/año es un valor conservador basado en el precio de Namecheap ($9.98/año) con un margen minimo de $2 para cubrir fluctuaciones de precio en renovaciones futuras.

**Que incluye:**
- Nombre de dominio .com registrado por 1 año
- DNS basico incluido (se usa Cloudflare como DNS manager, que es gratuito)
- WHOIS privacy (en Namecheap es gratuito, oculta los datos del registrante)

---

#### Servicio 6: CI/CD con GitHub Actions

**Costo:** $0

**Por que es gratuito:**
GitHub ofrece en su plan gratuito 2,000 minutos de GitHub Actions por mes para repositorios privados. Cada despliegue del sistema toma aproximadamente 5-10 minutos (instalacion de dependencias, build de React, deploy). Con 4 deploys por semana (ritmo de desarrollo activo), el consumo mensual seria:

```
4 deploys/semana x 4 semanas x 10 min/deploy = 160 min/mes
160 min / 2,000 min incluidos = 8% del limite gratuito
```

En produccion, los deploys seran mucho menos frecuentes (1-2 por mes). El plan gratuito es mas que suficiente.

**Fuente:** docs.github.com/en/billing/managing-billing-for-github-actions, consultado 08 de marzo de 2026.

---

#### Servicio 7: Monitoreo de Disponibilidad (Uptime Robot)

**Costo:** $0

**Que hace:** Verifica cada 5 minutos si el sistema esta funcionando. Si detecta que esta caido, envia un email o notificacion al administrador.

**Plan gratuito de Uptime Robot incluye (uptimerobot.com/pricing, marzo 2026):**
- 50 monitores (mas que suficiente; solo se necesitan 2-3)
- Verificaciones cada 5 minutos
- Alertas por email

**Fuente:** uptimerobot.com/pricing, consultado 08 de marzo de 2026.

---

### 2.3 Resumen del Costo Mensual en Produccion

| Servicio | Proveedor | Plan | Costo/mes | Fuente de precio |
|----------|-----------|------|-----------|-----------------|
| Hosting de la aplicacion | DigitalOcean App Platform | Basic (1GB RAM) | $12.00 | digitalocean.com/pricing/app-platform |
| Base de datos PostgreSQL | DigitalOcean Managed DB | Basic (1GB, 10GB storage) | $15.00 | digitalocean.com/pricing/managed-databases |
| Almacenamiento de imagenes | DigitalOcean Spaces | 250GB + CDN | $5.00 | digitalocean.com/pricing/spaces |
| SSL / HTTPS / CDN aplicacion | Cloudflare | Free | $0.00 | cloudflare.com/plans |
| CI/CD pipeline | GitHub Actions | Free | $0.00 | github.com/pricing |
| Monitoreo de disponibilidad | Uptime Robot | Free | $0.00 | uptimerobot.com/pricing |
| **TOTAL MENSUAL** | | | **$32.00** | |

---

### 2.4 Costo Mensual del Sistema Actual vs. Sistema Propuesto

| Concepto | Sistema Actual | Sistema Propuesto | Diferencia |
|----------|---------------|-------------------|------------|
| Catalog Machine | $120.00 | $0.00 | -$120.00 |
| Postimages | $0.00 * | $0.00 | $0.00 |
| Canva | $0.00 ** | $0.00 | $0.00 |
| Infraestructura propia | $0.00 | $32.00 | +$32.00 |
| **TOTAL** | **$120.00/mes** | **$32.00/mes** | **-$87.00/mes** |

*Postimages: actualmente usa el plan gratuito, pero con 10,000+ imagenes eventualmente requeriria un plan de pago o encontraria limitaciones. El plan Pro de Postimages cuesta $9.99/mes. Este costo futuro no se incluye en el calculo conservador.

**Canva: actualmente usa la version gratuita. Para funciones avanzadas que mencionaron necesitar, Canva Pro cuesta $12.99/mes. Este costo futuro tampoco se incluye en el calculo conservador.

**Si se incluyeran los costos futuros probables de Postimages y Canva Pro, el ahorro seria aun mayor:**
```
Sistema actual futuro: $120 + $9.99 + $12.99 = $142.98/mes
Sistema propuesto: $32/mes
Ahorro futuro: $110.98/mes
```

---

## Parte 3: Analisis de Costos de Mantenimiento

### 3.1 Que significa "mantener" el sistema

Mantener el sistema implica tres tipos de actividades:

1. **Mantenimiento correctivo:** Corregir errores (bugs) que aparezcan en produccion.
2. **Mantenimiento adaptativo:** Actualizar el sistema cuando los servicios de nube cambien precios o versiones, cuando los navegadores cambien comportamientos, o cuando cambie el formato CSV.
3. **Mantenimiento evolutivo:** Agregar nuevas funcionalidades que Aljaba solicite en el futuro.

El costo de infraestructura ($32/mes) cubre el mantenimiento de los servidores. Lo que varia es el costo del tiempo humano de desarrollo para los tipos 1, 2 y 3.

---

### 3.2 Mantenimiento de Infraestructura (Automatizado)

La mayor parte del mantenimiento de servidores es automatico en la arquitectura propuesta:

| Tarea de Mantenimiento | Como se maneja | Costo adicional |
|------------------------|---------------|-----------------|
| Backups de base de datos | Automatico diario (incluido en DigitalOcean Managed DB) | $0 |
| Actualizacion del sistema operativo del servidor | Automatico en DigitalOcean App Platform | $0 |
| Renovacion de certificado SSL | Automatico via Cloudflare / Let's Encrypt | $0 |
| Monitoreo de disponibilidad | Automatico via Uptime Robot | $0 |
| Escalado de recursos si hay picos de trafico | Manual, pero poco frecuente | $0 en la mayoria de casos |

**Conclusion:** El mantenimiento de infraestructura es practicamente automatico.

---

### 3.3 Mantenimiento de Software (Tiempo Humano)

Este es el componente de mantenimiento que si requiere trabajo humano. Se divide en tres escenarios:

#### Escenario A: Sin nuevas funcionalidades (mantenimiento basico)

Actividades esperadas en este escenario:
- Actualizar dependencias de Node.js y React cuando salgan versiones con parches de seguridad (2-4 veces por año, 1-2 horas cada vez)
- Corregir bugs menores reportados por usuarios (estimado: 1-2 bugs/mes en produccion estable, 1-3 horas por bug)
- Monitorear logs de errores y resolver incidentes (estimado: 30 min/semana)

**Estimado de horas mensuales en Escenario A:** 5-10 horas/mes

**Costo en el mercado:**
```
5-10 horas x $13.50/hora (Q104/hora, sueldo Q8,000/mes / 160 horas) = $67.50 - $135/mes
```

Este mantenimiento lo realizará la misma persona que desarrolle el sistema, o un desarrollador junior. Dependerá de Aljaba S.A. la elección al finalizar el proyecto.

#### Escenario B: Con actualizaciones menores periodicas

Actividades adicionales:
- Implementar mejoras pequenas solicitadas por el equipo de Aljaba (nuevos filtros, cambios de diseño, etc.)
- Adaptar el sistema si el formato CSV cambia
- Agregar nuevos layouts para catalogos

**Estimado de horas mensuales en Escenario B:** 15-25 horas/mes

**Costo en el mercado:**
```
15-25 horas x $13.50/hora = $202 - $328/mes
```

#### Escenario C: Con nuevas funcionalidades importantes

Si Aljaba decide agregar funcionalidades grandes (como integracion con un sistema de ventas, app movil, etc.), eso se cotizaria como un proyecto nuevo, no como mantenimiento.

---

### 3.4 Proyeccion de Costos a 3 años

La siguiente proyeccion asume:
- Infraestructura estable en $32/mes (sin cambios de plan)
- Mantenimiento de software en Escenario A (basico, sin nuevas funcionalidades grandes)
- Renovacion de dominio a $12/año

| Periodo | Infraestructura | Dominio | Mantenimiento Software (referencia) | Total |
|---------|----------------|---------|-------------------------------------|-------|
| Mes 1-12 (Año 1) | $32 x 12 = $396 | $12 | No contratado (incluido en proyecto) | $408 |
| Mes 13-24 (Año 2) | $32 x 12 = $396 | $12 | $0 - $1,620 (segun acuerdo) | $408 - $2,028 |
| Mes 25-36 (Año 3) | $32 x 12 = $396 | $12 | $0 - $1,620 (segun acuerdo) | $408 - $2,028 |
| **Total 3 años** | **$1,188** | **$36** | **$0 - $3,240** | **$1,224 - $4,464** |

**Comparacion: mantener el sistema propio vs. mantener las plataformas actuales a 3 años:**

```
Costo actual (Catalog Machine) en 3 años: $120/mes x 36 meses = $4,320
Costo sistema propio en 3 años (escenario peor): $4,464
Costo sistema propio en 3 años (escenario mejor): $1,224
```

Incluso en el peor escenario (manteniendo un desarrollador a $135/mes), el costo es similar al de Catalog Machine. En el escenario realista (con actualizaciones ocasionales), el sistema propio es significativamente mas barato.

---

### 3.5 Riesgos de Costo en el Mantenimiento

Es importante ser honesto sobre los riesgos que podrian aumentar los costos de mantenimiento:

| Riesgo | Probabilidad | Impacto en Costo | Como Mitigarlo |
|--------|--------------|-----------------|----------------|
| DigitalOcean sube precios | Media | +$5-15/mes | Arquitectura portatil, facil migrar a otro proveedor |
| Se necesita mas RAM por crecimiento de usuarios | Baja (3-5 años) | Plan siguiente: $24/mes (+$12) | Monitorear uso de memoria mensualmente |
| Bug critico en produccion que requiere atencion urgente | Media | Costo de tiempo urgente del desarrollador | Testing riguroso antes del deploy |
| Actualizacion mayor de Node.js o React incompatible | Baja (1 vez por año) | 4-8 horas de trabajo | Usar versiones LTS (Long Term Support) |
| Crecimiento masivo de imagenes supera 250GB de Spaces | Baja (5+ años) | $0.02/GB adicional (estimado +$5/mes en 5 años) | Implementar limpieza de imagenes no utilizadas |

**Conclusion sobre riesgos:** El mayor riesgo de costo no es la infraestructura (que tiene margen suficiente), sino la disponibilidad de tiempo del desarrollador para mantenimiento. Este riesgo se mitiga con documentacion clara del codigo (que es parte del entregable de este proyecto) para que cualquier desarrollador pueda dar continuidad.

---

## Parte 4: Comparacion Global de Costos

### 4.1 Año 1 (incluye desarrollo)

| Concepto | Costo |
|----------|-------|
| Desarrollo del sistema | $0 (proyecto de graduacion) |
| Infraestructura en produccion (12 meses) | $384 |
| **Total Año 1** | **$384** |

**Costo que Aljaba habria pagado sin este sistema (Año 1):**
```
Catalog Machine: $120/mes x 12 meses = $1,440
Ahorro Año 1: $1,440 - $384 = $1,056
```

### 4.2 Años Siguientes (mantenimiento)

| Concepto | Costo Anual |
|----------|-------------|
| Dominio | $12 |
| Infraestructura | $396 |
| Mantenimiento software (escenario basico) | $0 - $810 |
| **Total anual** | **$408 - $1,218** |

**Costo Catalog Machine (sin sistema propio):** $1,440/año, con tendencia a aumentar conforme crece el catalogo.

### 4.3 Punto de Equilibrio

El sistema se paga a si mismo desde el primer mes:
```
Costo mes 1 del sistema propio: $32 (infraestructura)
Costo mes 1 de Catalog Machine: $120

Ahorro mes 1: $120 - $34 = $86
```

No existe periodo de recuperacion de inversion. Desde el primer dia de operacion, el sistema es mas economico que la solucion actual.

---

## Parte 5: Conclusion y Recomendacion

### 5.1 Sobre el costo de desarrollo

El costo de desarrollo es $0 porque el trabajo de programacion lo realiza el estudiante como proyecto de graduacion. Esto no es "gratis" en el sentido real: el estudiante invierte aproximadamente 800 horas de trabajo durante 5 meses. Pero para Aljaba S.A., el desembolso monetario es nulo.

Si en el futuro se necesita desarrollar nuevas funcionalidades, Aljaba debe presupuestar entre $67 y $135 por mes para mantenimiento basico, o negociar un contrato de soporte con el desarrollador original u otro desarrollador.

### 5.2 Sobre los costos operativos

Los $32/mes son un numero solido, basado en precios publicados y verificables de DigitalOcean. No es una estimacion aproximada; es el precio exacto de los planes seleccionados a la fecha de este analisis. El precio puede variar si DigitalOcean cambia sus tarifas, pero los cambios historicos de DigitalOcean han sido poco frecuentes y generalmente a la baja (no al alza).

### 5.3 Sobre el ahorro real

El ahorro de $88/mes respecto a Catalog Machine es real y verificable. Catalog Machine cobra $120/mes por su plan que Aljaba necesita. El sistema propio cuesta $32/mes. La diferencia es $88/mes o $1,056/año.

Lo que no se puede garantizar es el costo futuro de Catalog Machine, que podria aumentar. El sistema propio, en cambio, tiene costos predecibles.

### 5.4 Lo que este analisis NO incluye (y por que)

- **Costo de capacitacion del personal:** Depende de la curva de aprendizaje real. Se estima 2-4 horas de capacitacion por persona; no se monetiza porque el personal ya esta contratado.
- **Costo de migracion de datos:** Los datos actuales en Catalog Machine (si se quisieran migrar) requeriran trabajo manual. No se estima porque Aljaba puede comenzar desde cero con el CSV que ya tiene.
- **Costo de internet en las oficinas:** Aljaba ya paga por internet. El sistema no genera trafico adicional significativo.
- **Costo de dispositivos de los empleados ruteros:** Los empleados ya tienen telefonos o tabletas. El sistema es responsive y funciona en los dispositivos existentes.

---

**Elaborado por:** Mario Estuardo López Rodas
**Fecha:** 08 de marzo de 2026
**Version:** 1.0
**Siguiente revision:** Al finalizar el primer año de operacion en produccion

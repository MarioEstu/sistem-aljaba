# Resumen Ejecutivo - Sistema Catalog Aljaba

## Para: Aljaba S.A.
## Fecha: 12 de febrero de 2026

---

## 1. RESUMEN DEL PROYECTO

### ¿Qué proponemos?
Desarrollar un **sistema web integral propio** que reemplace las 3 plataformas externas que Aljaba actualmente utiliza:
- **Catalog Machine** ($120/mes) → Generación de catálogos
- **Canva** → Edición de imágenes
- **Postimages** → Almacenamiento de imágenes

### ¿Por qué?
1. **Ahorro de costos:** Reducir de $120/mes a ~$33/mes (**72% de ahorro**)
2. **Control total:** Sistema propietario sin dependencias externas
3. **Eficiencia:** Flujo unificado sin cambiar entre plataformas
4. **Escalabilidad:** Preparado para crecer de 4,000 a 10,000+ productos

---

## 2. PROBLEMAS QUE RESUELVE

| Problema Actual | Solución Propuesta |
|-----------------|-------------------|
| Dependencia de 3 plataformas diferentes | Una sola plataforma integrada |
| Costo mensual de $120 en Catalog Machine | Costo reducido a $33/mes |
| Riesgo de fallo de servicios externos | Sistema propio con control total |
| Proceso manual de 6 pasos | Flujo simplificado de 3 pasos |
| Migración manual entre plataformas | Trabajo dentro del mismo sistema |
| Sin control sobre datos e imágenes | Almacenamiento propio en la nube |

---

## 3. COMPARACIÓN: FLUJO ACTUAL vs. FLUJO PROPUESTO

### Flujo Actual (6 pasos)
```
1. Recibir Excel del proveedor
   ↓
2. Editar imágenes en Canva
   ↓
3. Subir imágenes a Postimages
   ↓
4. Crear Excel mejorado con enlaces
   ↓
5. Exportar a CSV
   ↓
6. Subir CSV a Catalog Machine → Generar PDF
```
**Tiempo estimado: 2-3 horas** (para 50 productos)  
**Plataformas involucradas: 3**  
**Costo mensual: $120**

---

### Flujo Propuesto (3 pasos)
```
1. Importar CSV al sistema
   ↓
2. Editar imágenes dentro del sistema
   ↓
3. Crear catálogo y generar PDF
```
**Tiempo estimado: 45-60 minutos** (para 50 productos)  
**Plataformas involucradas: 1**  
**Costo mensual: $33**

**Mejora: 50%+ de reducción de tiempo**

---

## 4. FUNCIONALIDADES PRINCIPALES

### 4.1 Gestión de Productos
Importación masiva de productos desde CSV  
Búsqueda y filtros avanzados  
Organización por categorías jerárquicas  
Edición masiva de múltiples productos  
Validación automática de datos  

### 4.2 Editor de Imágenes Avanzado
Edición con capas y efectos  
Ajustes de color, brillo, contraste  
Recorte, rotación, redimensionamiento  
Texto sobre imágenes  
Filtros profesionales  

### 4.3 Diseñador de Catálogos
Múltiples layouts (grid, lista, fichas detalladas)  
Personalización completa de diseño  
Vista previa en tiempo real  
Plantillas reutilizables  
Edición visual drag & drop  

### 4.4 Generación de PDF
PDFs de alta calidad  
Múltiples configuraciones de página  
Generación rápida (< 10 segundos para 100 productos)  
Descarga inmediata  

### 4.5 Sistema de Acceso para Empleados Ruteros (Guest Access)
Cuentas de acceso individuales para cada empleado rutero (usuario y contraseña)  
El Admin activa o desactiva qué catálogos son visibles para todos los Guests  
Los empleados ven únicamente los catálogos habilitados por el Admin  
Descarga de PDF de catálogos habilitados  
Interfaz simple y responsive, optimizada para uso en campo desde celular o tablet  

---

## 5. BENEFICIOS CUANTIFICABLES

### Ahorro Económico
| Concepto | Actual | Propuesto | Ahorro |
|----------|--------|-----------|--------|
| **Mensual** | $120 | $33 | **$87/mes** |
| **Anual** | $1,440 | $396 | **$1,044/año** |
| **2 años** | $2,880 | $792 | **$2,088** |

### Ahorro de Tiempo
| Tarea | Tiempo Actual | Tiempo Propuesto | Mejora |
|-------|---------------|------------------|--------|
| Editar 10 imágenes | 30 min | 15 min | **50%** |
| Crear catálogo 50 productos | 2 horas | 45 min | **62%** |
| Compartir catálogo con cliente | 10 min | 2 min | **80%** |

### Escalabilidad
- **Actual:** Catalog Machine cobra más por mayor uso
- **Propuesto:** Costo fijo hasta 10,000 productos

---

## 6. TECNOLOGÍA Y SEGURIDAD

### Stack Tecnológico Moderno
- **Frontend:** React + TypeScript (tecnología utilizada por Facebook, Netflix, Airbnb)
- **Backend:** Node.js + PostgreSQL (robusto y escalable)
- **Almacenamiento:** Cloud storage profesional (tipo AWS S3)
- **Hosting:** DigitalOcean (empresa reconocida globalmente)

### Seguridad Implementada
Comunicación encriptada (HTTPS)  
Autenticación segura (JWT)  
Contraseñas encriptadas  
Backups automáticos diarios  
Protección contra ataques comunes  

### Disponibilidad
Accesible 24/7 desde cualquier navegador  
Responsive (funciona en computadora, tablet, móvil)  
Uptime garantizado del 99%  

---

## 7. TIPOS DE USUARIOS

### Administrador (Admin)
**¿Quién?** Administradores de Aljaba  
**¿Qué puede hacer?**
- Gestionar todos los productos
- Editar imágenes
- Crear catálogos
- Generar PDFs
- Compartir con clientes
- Control total del sistema

### Invitado (Guest)
**¿Quién?** Empleados ruteros de Aljaba  
**¿Qué puede hacer?**
- Iniciar sesión con usuario y contraseña propios
- Ver los catálogos que el Admin ha habilitado para Guests
- Descargar PDFs de los catálogos habilitados

---

## 8. PLAN DE DESARROLLO

### Cronograma: 5 meses
| Fase | Duración | Entregable |
|------|----------|------------|
| **1. Setup y Autenticación** | 2 semanas | Login funcional |
| **2. Gestión de Productos** | 3 semanas | CRUD + Importación CSV |
| **3. Gestión de Imágenes** | 3 semanas | Carga + Galería + Editor básico |
| **4. Editor Visual Avanzado** | 3 semanas | Editor completo con capas |
| **5. Catálogos** | 4 semanas | Diseño y selección de productos |
| **6. Generación PDF** | 2 semanas | PDFs de alta calidad |
| **7. Sistema Guest** | 1 semana | Vista de empleados ruteros |
| **8. Testing y Deploy** | 2 semanas | Sistema en producción |

**Total: 20 semanas (5 meses)**

### Hitos Importantes
- **Mes 1:** Login + Productos básicos
- **Mes 2:** Imágenes + CSV completo
- **Mes 3:** Editor visual funcional
- **Mes 4:** Catálogos + PDF
- **Mes 5:** Testing y lanzamiento

---

## 9. ANÁLISIS DE COSTOS

### Inversión Inicial
| Concepto | Costo |
|----------|-------|
| Dominio web | $12/año |
| Licencias software | $0 (todo open source) |
| **TOTAL** | **$12** |

### Costos Mensuales
| Servicio | Costo |
|----------|-------|
| Hosting aplicación | $12/mes |
| Base de datos | $15/mes |
| Almacenamiento imágenes (50GB) | $5/mes |
| Dominio (prorrateado) | $1/mes |
| **TOTAL** | **$33/mes** |

### ROI (Return on Investment)
- **Ahorro mensual:** $87
- **Inversión inicial:** $12
- **Recuperación de inversión:** Inmediata (mes 1)
- **Ahorro neto año 1:** $1,032

---

## 10. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Retraso en desarrollo | Media | Cronograma con buffer de 2 semanas |
| Costos de hosting mayores | Baja | Monitoreo mensual + alertas |
| Curva de aprendizaje usuarios | Media | Interfaz intuitiva + manual de usuario |
| Fallo técnico en producción | Baja | Backups automáticos + soporte técnico |

---

## 11. ¿POR QUÉ AHORA?

1. **Crecimiento proyectado:** De 4,000 a 10,000 productos para fin de 2026
   - Catalog Machine cobrará MÁS conforme crezcan
   - Sistema propio mantiene costo fijo

2. **Ventana de oportunidad:** Proyecto de graduación disponible
   - Desarrollo rápido
   - Compromiso académico garantiza entrega

3. **Momentum:** Flujo actual ya funciona
   - Transición gradual posible
   - Sin apuros operativos

---

## 12. PRÓXIMOS PASOS

### Si aprueban el proyecto:

1. **Semana 1:** 
   - Firma de acuerdo de desarrollo
   - Provisión de acceso a datos de ejemplo
   - Setup de infraestructura cloud

2. **Semana 2-3:**
   - Desarrollo del módulo de autenticación
   - Primera demo funcional

3. **Mes 1:**
   - Reunión de avance
   - Validación de interfaz

4. **Mes 3:**
   - Demo de funcionalidades core
   - Feedback y ajustes

5. **Mes 5:**
   - Capacitación de usuarios
   - Migración de datos
   - Lanzamiento en producción

---

## 13. PREGUNTAS FRECUENTES

**¿Qué pasa si el desarrollador ya no puede mantener el sistema?**
- El código es propiedad de Aljaba
- Documentación completa incluida
- Cualquier desarrollador puede continuar

**¿El sistema funcionará offline?**
- No, requiere internet
- Pero los PDFs descargados sí pueden verse offline

**¿Se pueden agregar funcionalidades después?**
- Sí, el sistema es extensible
- Se puede contratar mantenimiento/mejoras

**¿Qué pasa con los catálogos actuales?**
- Se pueden migrar manualmente
- O mantener ambos sistemas temporalmente

**¿Cuántos usuarios Admin puede haber?**
- Sin límite técnico
- Plan actual soporta hasta 10 usuarios Admin

---

## 14. CONCLUSIÓN 

1. Ahorro comprobable de **$1,044/año**
2. Reducción de tiempo operativo del **50%**
3. Control total sobre datos e infraestructura
4. Escalabilidad hasta 10,000+ productos sin costo adicional
5. Timeline realista de 5 meses
6. Bajo riesgo operativo (backup y soporte incluido)

### Inversión vs. Retorno
- **Inversión inicial:** $12
- **Ahorro año 1:** $1,032

---

## 15. CONTACTO Y SOPORTE

**Desarrollador:** Mario E López R  
**Email:** estuardopez2004@gmail.com  
**Teléfono:** +502 55685491  
**Universidad:** Universidad Mariano Gálves de Guatemala  
**Proyecto de Graduación:** Ingeniería en Sistemas

**Disponibilidad:**
- Desarrollo: Lunes a Viernes, 5 horas/día

---

## APÉNDICES

### A. Glosario de Términos
- **CSV:** Comma-Separated Values (archivo de valores separados por comas)
- **PDF:** Portable Document Format
- **Cloud:** Almacenamiento en la nube
- **API:** Interfaz de programación de aplicaciones
- **JWT:** JSON Web Token (sistema de autenticación)
- **HTTPS:** Protocolo seguro de transferencia

### B. Referencias Técnicas
- Documentación completa en carpeta `/docs`
- Diagramas UML en `/docs/diagramas`
- Arquitectura técnica en `ARQUITECTURA_SISTEMA.md`

**Preparado por:** Mario E López R  
**Versión:** 1.0  
**Confidencialidad:** Documento interno de Aljaba S.A.

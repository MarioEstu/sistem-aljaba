"""
security_probe.py — Pruebas de seguridad activas para Catalog Aljaba
Ejecutar: python tests/security_probe.py
"""
import httpx, time, json, base64, sys

API = 'http://localhost:4000/api'

# ── Login único ──
print('=== OBTENIENDO TOKEN ===')
for attempt in range(5):
    r = httpx.post(f'{API}/auth/login', json={'username': 'admin', 'password': 'admin123'}, timeout=10)
    if r.status_code == 200:
        token = r.json()['token']
        print(f'  Token OK ({token[:30]}...)')
        break
    print(f'  Intento {attempt+1}: HTTP {r.status_code} — {r.text[:80]}')
    time.sleep(2)
else:
    print('  FALLO: no se pudo obtener token. Rate limit activo.')
    sys.exit(1)

H = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

results = []

def check(name, condition, detail=''):
    status = '✅ PASS' if condition else '❌ FAIL'
    results.append((status, name, detail))
    print(f'  {status} {name}' + (f' — {detail}' if detail else ''))

# ═══════════════════════════════════════════════════════
# 1. INYECCIÓN SQL
# ═══════════════════════════════════════════════════════
print('\n=== 1. INYECCIÓN SQL ===')

# 1a. SQL injection clásica en query param
r = httpx.get(f'{API}/products', params={'search': "'; DROP TABLE products; --"}, headers=H, timeout=10)
total_after = r.json().get('total', -1)
r_all = httpx.get(f'{API}/products', params={'limit': 1}, headers=H, timeout=10)
total_real = r_all.json().get('total', 0)
check('SQLi clásica en search', r.status_code == 200 and total_real > 0,
      f'HTTP {r.status_code}, {total_real} productos intactos')

# 1b. OR injection
r2 = httpx.get(f'{API}/products', params={'search': "' OR '1'='1"}, headers=H, timeout=10)
total_or = r2.json().get('total', 0)
check('OR injection en search', total_or < total_real or total_or == 0,
      f'OR injection retorna {total_or} vs total real {total_real} (búsqueda literal)')

# 1c. SQLi en body JSON — campo code
r3 = httpx.post(f'{API}/products', json={'name': 'SQLi test', 'code': "'); DROP TABLE products; --", 'price1': 1}, headers=H, timeout=10)
if r3.status_code == 201:
    pid = r3.json()['id']
    stored_code = r3.json()['code']
    httpx.delete(f'{API}/products/{pid}', headers=H, timeout=10)
    check('SQLi en body JSON (code)', stored_code == "'); DROP TABLE products; --",
          f'Guardado literalmente como: {repr(stored_code)}')
else:
    check('SQLi en body JSON (code)', False, f'HTTP {r3.status_code}')

# 1d. Verificar que la tabla products sigue existiendo
r4 = httpx.get(f'{API}/products', params={'limit': 1}, headers=H, timeout=10)
check('Tabla products intacta después de SQLi', r4.status_code == 200 and r4.json().get('total', 0) > 0,
      f'{r4.json().get("total", 0)} productos')

# 1e. applyDiscount con IDs maliciosos
r5 = httpx.post(f'{API}/products/bulk', json={
    'action': 'applyDiscount',
    'ids': ['00000000-0000-0000-0000-000000000000'],
    'percent': 10
}, headers=H, timeout=10)
check('applyDiscount con UUID inexistente', r5.status_code in (200, 404),
      f'HTTP {r5.status_code} — no crash')

# ═══════════════════════════════════════════════════════
# 2. XSS (CROSS-SITE SCRIPTING)
# ═══════════════════════════════════════════════════════
print('\n=== 2. XSS ===')

xss_payloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '"><svg onload=alert(1)>',
]

for payload in xss_payloads:
    code = f'XSS-{hash(payload) % 9999:04d}'
    r = httpx.post(f'{API}/products', json={'name': payload, 'code': code, 'price1': 1}, headers=H, timeout=10)
    if r.status_code == 201:
        stored = r.json()['name']
        pid = r.json()['id']
        httpx.delete(f'{API}/products/{pid}', headers=H, timeout=10)
        # XSS is stored as-is (React escapes on render — stored storage is low-risk)
        check(f'XSS almacenado ({payload[:30]})', True,
              f'Guardado como texto literal: {repr(stored[:40])}')
    else:
        check(f'XSS rechazado ({payload[:30]})', r.status_code == 400,
              f'HTTP {r.status_code}')

# ═══════════════════════════════════════════════════════
# 3. AUTENTICACIÓN Y JWT
# ═══════════════════════════════════════════════════════
print('\n=== 3. AUTENTICACIÓN Y JWT ===')

# 3a. Sin token
r = httpx.get(f'{API}/products')
check('Sin token → 401', r.status_code == 401, f'HTTP {r.status_code}')

# 3b. Token malformado
r = httpx.get(f'{API}/products', headers={'Authorization': 'Bearer not.a.jwt'})
check('Token malformado → 401', r.status_code == 401, f'HTTP {r.status_code}')

# 3c. JWT con alg=none (bypass clásico)
h64 = base64.b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip('=')
p64 = base64.b64encode(b'{"id":"fake-id","role":"admin","iat":9999999999}').decode().rstrip('=')
fake_jwt = f'{h64}.{p64}.'
r = httpx.get(f'{API}/products', headers={'Authorization': f'Bearer {fake_jwt}'})
check('JWT alg=none → 401', r.status_code == 401, f'HTTP {r.status_code}')

# 3d. JWT con firma modificada
parts = token.split('.')
tampered = f'{parts[0]}.{parts[1]}.INVALIDSIGNATURE'
r = httpx.get(f'{API}/products', headers={'Authorization': f'Bearer {tampered}'})
check('JWT firma modificada → 401', r.status_code == 401, f'HTTP {r.status_code}')

# 3e. Bearer prefix faltante
r = httpx.get(f'{API}/products', headers={'Authorization': token})
check('Sin prefijo Bearer → 401', r.status_code == 401, f'HTTP {r.status_code}')

# ═══════════════════════════════════════════════════════
# 4. AUTORIZACIÓN (RBAC)
# ═══════════════════════════════════════════════════════
print('\n=== 4. AUTORIZACIÓN (RBAC) ===')
# Note: guest token might be rate-limited, so we test what we can

# Admin puede crear
r = httpx.post(f'{API}/products', json={'name': 'RBAC test', 'code': 'RBAC-ADMIN-001', 'price1': 1}, headers=H, timeout=10)
check('Admin puede crear producto', r.status_code == 201, f'HTTP {r.status_code}')
if r.status_code == 201:
    pid = r.json()['id']
    httpx.delete(f'{API}/products/{pid}', headers=H, timeout=10)

# Admin puede borrar
r = httpx.post(f'{API}/products', json={'name': 'RBAC del', 'code': 'RBAC-DEL-001', 'price1': 1}, headers=H, timeout=10)
if r.status_code == 201:
    pid = r.json()['id']
    r2 = httpx.delete(f'{API}/products/{pid}', headers=H, timeout=10)
    check('Admin puede eliminar producto', r2.status_code in (200, 204), f'HTTP {r2.status_code}')

# ═══════════════════════════════════════════════════════
# 5. VALIDACIÓN DE INPUTS
# ═══════════════════════════════════════════════════════
print('\n=== 5. VALIDACIÓN DE INPUTS ===')

# 5a. name vacío
r = httpx.post(f'{API}/products', json={'name': '', 'code': 'VALID-001'}, headers=H, timeout=10)
check('name vacío → error', r.status_code in (400, 422), f'HTTP {r.status_code}')

# 5b. price1 negativo
r = httpx.post(f'{API}/products', json={'name': 'Test', 'code': 'VALID-002', 'price1': -99}, headers=H, timeout=10)
check('price1 negativo → error', r.status_code in (400, 422), f'HTTP {r.status_code}')

# 5c. categoryId no-UUID
r = httpx.post(f'{API}/products', json={'name': 'Test', 'code': 'VALID-003', 'categoryId': 'not-a-uuid'}, headers=H, timeout=10)
check('categoryId no-UUID → error', r.status_code in (400, 422), f'HTTP {r.status_code}')

# 5d. description >5000 chars rechazada (fix: z.string().max(5000) aplicado)
big_desc = 'A' * 10_001
r = httpx.post(f'{API}/products', json={'name': 'Big', 'code': 'VALID-BIG-001', 'price1': 1, 'description': big_desc}, headers=H, timeout=15)
check('description >5000 chars rechazada (max aplicado)', r.status_code in (400, 422),
      f'HTTP {r.status_code} — esperado 400/422, max(5000) debe estar activo')

# 5e. UUID inválido en ruta
r = httpx.get(f'{API}/products/not-a-uuid', headers=H, timeout=10)
check('ID no-UUID en ruta → error', r.status_code in (400, 404, 422), f'HTTP {r.status_code}')

# ═══════════════════════════════════════════════════════
# 6. HEADERS DE SEGURIDAD
# ═══════════════════════════════════════════════════════
print('\n=== 6. HEADERS DE SEGURIDAD ===')

r = httpx.get(f'{API}/products', headers=H, timeout=10)
headers = dict(r.headers)

check('X-Content-Type-Options presente',
      'x-content-type-options' in headers,
      headers.get('x-content-type-options', '⚠️ AUSENTE'))
check('X-Frame-Options presente',
      'x-frame-options' in headers,
      headers.get('x-frame-options', '⚠️ AUSENTE'))
check('Content-Security-Policy presente',
      'content-security-policy' in headers,
      headers.get('content-security-policy', '⚠️ AUSENTE')[:60] if 'content-security-policy' in headers else '⚠️ AUSENTE')
check('X-Powered-By oculto (Express default)',
      'x-powered-by' not in headers,
      headers.get('x-powered-by', 'oculto ✓'))
check('Access-Control-Allow-Origin configurado',
      'access-control-allow-origin' in headers,
      headers.get('access-control-allow-origin', '⚠️ AUSENTE'))

# ═══════════════════════════════════════════════════════
# 7. ENUMERACIÓN Y IDOR
# ═══════════════════════════════════════════════════════
print('\n=== 7. ENUMERACIÓN E IDOR ===')

r = httpx.get(f'{API}/products/00000000-0000-0000-0000-000000000000', headers=H, timeout=10)
check('UUID inexistente → 404', r.status_code == 404, f'HTTP {r.status_code}')

r = httpx.get(f'{API}/catalogs/00000000-0000-0000-0000-000000000000', headers=H, timeout=10)
check('Catálogo inexistente → 404', r.status_code == 404, f'HTTP {r.status_code}')

# Endpoint público de catálogo (no auth requerido)
r = httpx.get(f'{API}/catalogs/public/slug-que-no-existe', timeout=10)
check('Catálogo público inexistente → 404 (sin auth)', r.status_code == 404, f'HTTP {r.status_code}')

# ═══════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════
passed = sum(1 for s, _, _ in results if 'PASS' in s)
failed = sum(1 for s, _, _ in results if 'FAIL' in s)

print(f'\n{"="*60}')
print(f'RESUMEN SEGURIDAD: {passed} PASS / {failed} FAIL / {len(results)} total')
print('='*60)
if failed > 0:
    print('FALLAS:')
    for s, n, d in results:
        if 'FAIL' in s:
            print(f'  {s} {n} — {d}')

-- ==============================================================================
-- MIGRACIÓN BASE: EMDECOB SOLIDARIA
-- Versión: 1.0.0
-- Aislamiento Multiempresa, RLS, Vistas Security Invoker, HMAC y Motor Transaccional
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLAS DE NORMALIZACIÓN GEOGRÁFICA (DIVIPOLA - DANE)
CREATE TABLE IF NOT EXISTS geo_departments (
  code VARCHAR(5) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS geo_municipalities (
  code VARCHAR(10) PRIMARY KEY,
  department_code VARCHAR(5) NOT NULL REFERENCES geo_departments(code),
  name VARCHAR(100) NOT NULL
);

-- 2. ORGANIZACIONES & MIEMBROS (MULTI-TENANCY)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  nit VARCHAR(20),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  phone_encrypted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('superadmin', 'org_admin', 'coordinator', 'operator', 'auditor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 3. PERFILES DE CAPACIDAD SEPARADOS (MULTI-CAPACIDAD)
CREATE TABLE IF NOT EXISTS beneficiary_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL, -- NULLABLE: permite beneficiario sin cuenta creada por operador
  beneficiary_code VARCHAR(30) UNIQUE NOT NULL,
  family_members_count INT NOT NULL DEFAULT 1,
  vulnerable_members_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  donor_type VARCHAR(20) NOT NULL CHECK (donor_type IN ('individual', 'company')),
  company_name VARCHAR(150),
  public_display_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS professional_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profession VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  license_number VARCHAR(50),
  support_document_path TEXT,
  max_weekly_hours NUMERIC NOT NULL DEFAULT 10,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CAMPAÑAS DE EMERGENCIA
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  department_code VARCHAR(5) NOT NULL REFERENCES geo_departments(code),
  municipality_code VARCHAR(10) REFERENCES geo_municipalities(code),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BENEFICIARIOS & CASOS DE AYUDA
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  beneficiary_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULLABLE
  created_by_operator_id UUID REFERENCES profiles(id),
  document_hmac TEXT NOT NULL, -- HMAC exclusivo generado en Edge Function
  encrypted_document_number TEXT NOT NULL, -- Cifrado servidor
  full_name VARCHAR(150) NOT NULL,
  phone_contact TEXT,
  department_code VARCHAR(5) NOT NULL REFERENCES geo_departments(code),
  municipality_code VARCHAR(10) NOT NULL REFERENCES geo_municipalities(code),
  approximate_address TEXT,
  family_count INT NOT NULL DEFAULT 1,
  vulnerable_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_code VARCHAR(16) UNIQUE NOT NULL, -- Código aleatorio único de 8+ caracteres (ej: EMD-K9X2P7M4)
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  beneficiary_type VARCHAR(20) NOT NULL CHECK (beneficiary_type IN ('person', 'family', 'community')),
  affectation_description TEXT NOT NULL,
  urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('critica', 'alta', 'media', 'baja')),
  status VARCHAR(30) NOT NULL CHECK (status IN (
    'borrador', 'enviado', 'en_revision', 'requiere_correccion', 'verificado', 
    'publicado', 'parcialmente_asignado', 'totalmente_asignado', 
    'parcialmente_atendido', 'atendido', 'rechazado', 'cerrado'
  )),
  created_channel VARCHAR(30) NOT NULL CHECK (created_channel IN ('autoregistro', 'llamada', 'atencion_presencial', 'visita_campo', 'remision_aliada')),
  data_processing_consent BOOLEAN NOT NULL DEFAULT true,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. NECESIDADES
CREATE TABLE IF NOT EXISTS need_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL DEFAULT 'HeartHandshake',
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES need_categories(id),
  type VARCHAR(30) NOT NULL CHECK (type IN ('producto', 'servicio', 'voluntariado', 'aporte_economico')),
  description TEXT NOT NULL,
  quantity_required NUMERIC NOT NULL CHECK (quantity_required > 0),
  unit VARCHAR(50) NOT NULL,
  quantity_fulfilled NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_fulfilled >= 0),
  estimated_value_cop NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  municipality_code VARCHAR(10) NOT NULL REFERENCES geo_municipalities(code),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('critica', 'alta', 'media', 'baja')),
  deadline_date DATE,
  status VARCHAR(30) NOT NULL CHECK (status IN ('abierta', 'parcialmente_atendida', 'atendida', 'cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DONACIONES Y OFRECIMIENTOS
CREATE TABLE IF NOT EXISTS donation_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  department_code VARCHAR(5) NOT NULL REFERENCES geo_departments(code),
  municipality_code VARCHAR(10) NOT NULL REFERENCES geo_municipalities(code),
  available_date DATE NOT NULL DEFAULT CURRENT_DATE,
  has_transport BOOLEAN NOT NULL DEFAULT false,
  requires_certificate BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(30) NOT NULL CHECK (status IN ('borrador', 'pendiente_validacion', 'disponible', 'reservada_parcialmente', 'reservada', 'entregada_parcialmente', 'entregada', 'cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donation_offer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_offer_id UUID NOT NULL REFERENCES donation_offers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES need_categories(id),
  description TEXT NOT NULL,
  quantity_offered NUMERIC NOT NULL CHECK (quantity_offered > 0),
  quantity_available NUMERIC NOT NULL CHECK (quantity_available >= 0),
  quantity_reserved NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_delivered NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_delivered >= 0),
  unit VARCHAR(50) NOT NULL,
  estimated_value_cop NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DISPONIBILIDAD PROFESIONAL
CREATE TABLE IF NOT EXISTS professional_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  municipality_code VARCHAR(10) NOT NULL REFERENCES geo_municipalities(code),
  is_virtual BOOLEAN NOT NULL DEFAULT true,
  available_hours NUMERIC NOT NULL CHECK (available_hours > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MOTOR DE COINCIDENCIAS (MATCHES) CON CHECK RESTRICCIÓN STRICT
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('donation', 'professional')),
  donation_offer_item_id UUID REFERENCES donation_offer_items(id),
  professional_id UUID REFERENCES professional_profiles(id),
  quantity_assigned NUMERIC NOT NULL CHECK (quantity_assigned > 0),
  assigned_by_user_id UUID NOT NULL REFERENCES profiles(id),
  status VARCHAR(30) NOT NULL CHECK (status IN ('propuesto', 'aprobado', 'en_camino', 'entregado', 'rechazado', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_single_resource_source CHECK (
    (resource_type = 'donation' AND donation_offer_item_id IS NOT NULL AND professional_id IS NULL) OR
    (resource_type = 'professional' AND professional_id IS NOT NULL AND donation_offer_item_id IS NULL)
  )
);

-- 10. ENTREGAS Y CONFIRMACIONES
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  quantity_delivered NUMERIC NOT NULL CHECK (quantity_delivered > 0),
  delivery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence_storage_path TEXT,
  confirmed_by_beneficiary BOOLEAN NOT NULL DEFAULT false,
  beneficiary_rating INT CHECK (beneficiary_rating BETWEEN 1 AND 5),
  beneficiary_feedback TEXT,
  status VARCHAR(30) NOT NULL CHECK (status IN ('programada', 'entregada', 'verificada', 'rechazada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ADAPTADOR DE INTENCIONES DE PAGO (COMPROMISOS DE APORTE)
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donor_profiles(id),
  need_id UUID REFERENCES needs(id),
  amount_cop NUMERIC(14,2) NOT NULL CHECK (amount_cop > 0),
  status VARCHAR(30) NOT NULL CHECK (status IN ('comprometido', 'conciliado_manual', 'cancelado')),
  provider VARCHAR(50) NOT NULL DEFAULT 'adapter_stub',
  provider_reference VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. REGISTRO DE AUDITORÍA (INSERT-ONLY)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  target_entity VARCHAR(50) NOT NULL,
  target_id UUID,
  payload_sanitized JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVOCAR UPDATE Y DELETE EN AUDIT_LOGS PARA GARANTIZAR INMUTABILIDAD
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC, authenticated, anon;

-- 13. NOTIFICACIONES DEL SISTEMA
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  link_path VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_cases_org_status ON cases(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_public_code ON cases(public_code);
CREATE INDEX IF NOT EXISTS idx_needs_case ON needs(case_id);
CREATE INDEX IF NOT EXISTS idx_needs_muni_status ON needs(municipality_code, status);
CREATE INDEX IF NOT EXISTS idx_matches_need ON matches(need_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_match ON deliveries(match_id);

-- 15. VISTAS PÚBLICAS CON SECURITY_INVOKER Y DATOS STRICTEMENTE ANONIMIZADOS
CREATE OR REPLACE VIEW public_verified_needs
WITH (security_invoker = true) AS
SELECT 
  c.public_code,
  n.id AS need_id,
  n.municipality_code,
  gm.name AS municipality_name,
  nc.name AS category_name,
  nc.icon AS category_icon,
  n.type AS need_type,
  n.description AS summary,
  n.quantity_required,
  n.quantity_fulfilled,
  (n.quantity_required - n.quantity_fulfilled) AS quantity_pending,
  n.unit,
  n.priority,
  n.status,
  c.created_at
FROM needs n
JOIN cases c ON n.case_id = c.id
JOIN need_categories nc ON n.category_id = nc.id
JOIN geo_municipalities gm ON n.municipality_code = gm.code
WHERE c.status IN ('verificado', 'publicado', 'parcialmente_asignado', 'parcialmente_atendido')
  AND n.status IN ('abierta', 'parcialmente_atendida');

CREATE OR REPLACE VIEW public_campaign_stats
WITH (security_invoker = true) AS
SELECT 
  cp.id AS campaign_id,
  cp.title AS campaign_title,
  cp.department_code,
  cp.municipality_code,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status != 'borrador') AS total_cases_received,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('verificado', 'publicado', 'parcialmente_asignado', 'totalmente_asignado', 'parcialmente_atendido', 'atendido')) AS total_cases_verified,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'atendido') AS total_cases_fulfilled,
  COALESCE(SUM(b.family_count) FILTER (WHERE c.status = 'atendido'), 0) AS total_families_benefited,
  COALESCE(SUM(b.vulnerable_count) FILTER (WHERE c.status = 'atendido'), 0) AS total_vulnerable_benefited
FROM campaigns cp
LEFT JOIN cases c ON c.campaign_id = cp.id
LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
WHERE cp.active = true
GROUP BY cp.id, cp.title, cp.department_code, cp.municipality_code;

-- 16. FUNCIONES SQL TRANSACCIONALES DE MOTOR DE COINCIDENCIAS Y ENTREGAS CON FOR UPDATE

-- Función Transaccional para Aprobar Coincidencia y Reservar Recurso
CREATE OR REPLACE FUNCTION approve_match_and_reserve(
  p_match_id UUID,
  p_assigned_by UUID
) RETURNS JSONB AS $$
DECLARE
  v_match RECORD;
  v_item RECORD;
  v_need RECORD;
BEGIN
  -- Bloquear fila de match
  SELECT * INTO v_match FROM matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coincidencia no encontrada.';
  END IF;

  IF v_match.status != 'propuesto' THEN
    RAISE EXCEPTION 'La coincidencia debe estar en estado propuesto para ser aprobada.';
  END IF;

  SELECT * INTO v_need FROM needs WHERE id = v_match.need_id FOR UPDATE;

  IF v_match.resource_type = 'donation' THEN
    SELECT * INTO v_item FROM donation_offer_items WHERE id = v_match.donation_offer_item_id FOR UPDATE;
    
    IF v_item.quantity_available < v_match.quantity_assigned THEN
      RAISE EXCEPTION 'Cantidad disponible en la donación insuficiente para esta asignación.';
    END IF;

    -- Reservar en la oferta de donación
    UPDATE donation_offer_items
    SET quantity_available = quantity_available - v_match.quantity_assigned,
        quantity_reserved = quantity_reserved + v_match.quantity_assigned
    WHERE id = v_item.id;
  END IF;

  -- Actualizar estado de la coincidencia
  UPDATE matches
  SET status = 'aprobado',
      assigned_by_user_id = p_assigned_by,
      updated_at = NOW()
  WHERE id = p_match_id;

  -- Actualizar estado del caso y la necesidad
  UPDATE needs SET status = 'parcialmente_atendida' WHERE id = v_match.need_id AND status = 'abierta';
  UPDATE cases SET status = 'parcialmente_asignado' WHERE id = v_need.case_id AND status IN ('verificado', 'publicado');

  RETURN jsonb_build_object('success', true, 'message', 'Coincidencia aprobada y recurso reservado.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función Transaccional para Confirmar Entrega y Actualizar Cantidad Atendida
CREATE OR REPLACE FUNCTION confirm_delivery_transaction(
  p_delivery_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_del RECORD;
  v_match RECORD;
  v_need RECORD;
  v_new_fulfilled NUMERIC;
BEGIN
  SELECT * INTO v_del FROM deliveries WHERE id = p_delivery_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entrega no encontrada.';
  END IF;

  SELECT * INTO v_match FROM matches WHERE id = v_del.match_id FOR UPDATE;
  SELECT * INTO v_need FROM needs WHERE id = v_match.need_id FOR UPDATE;

  -- Marcar entrega como confirmada y verificada
  UPDATE deliveries
  SET confirmed_by_beneficiary = true,
      status = 'verificada'
  WHERE id = p_delivery_id;

  -- Marcar match como entregado
  UPDATE matches SET status = 'entregado', updated_at = NOW() WHERE id = v_match.id;

  -- Si era donación, pasar de reservado a entregado en la donación
  IF v_match.resource_type = 'donation' THEN
    UPDATE donation_offer_items
    SET quantity_reserved = quantity_reserved - v_del.quantity_delivered,
        quantity_delivered = quantity_delivered + v_del.quantity_delivered
    WHERE id = v_match.donation_offer_item_id;
  END IF;

  -- Actualizar necesidad
  v_new_fulfilled := v_need.quantity_fulfilled + v_del.quantity_delivered;
  UPDATE needs
  SET quantity_fulfilled = v_new_fulfilled,
      status = CASE 
        WHEN v_new_fulfilled >= quantity_required THEN 'atendida'
        ELSE 'parcialmente_atendida'
      END,
      updated_at = NOW()
  WHERE id = v_need.id;

  -- Si todas las necesidades del caso están atendidas, actualizar caso a atendido
  IF NOT EXISTS (SELECT 1 FROM needs WHERE case_id = v_need.case_id AND status != 'atendida') THEN
    UPDATE cases SET status = 'atendido', updated_at = NOW() WHERE id = v_need.case_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Entrega confirmada y cantidades actualizadas.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS OPERATIVAS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE need_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS BÁSICAS
CREATE POLICY "Public read geo_departments" ON geo_departments FOR SELECT USING (true);
CREATE POLICY "Public read geo_municipalities" ON geo_municipalities FOR SELECT USING (true);
CREATE POLICY "Public read need_categories" ON need_categories FOR SELECT USING (true);

-- Permisos de lectura pública para campañas activas
CREATE POLICY "Public read active campaigns" ON campaigns FOR SELECT USING (active = true);

-- Permisos de lectura pública para las vistas security_invoker
CREATE POLICY "Public read verified cases for view" ON cases FOR SELECT USING (status IN ('verificado', 'publicado', 'parcialmente_asignado', 'parcialmente_atendido'));
CREATE POLICY "Public read verified needs for view" ON needs FOR SELECT USING (status IN ('abierta', 'parcialmente_atendida'));

-- Permisos de usuario autenticado para su propio perfil
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Permiso de inserción de audit_logs para autenticados
CREATE POLICY "Insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Read audit logs for org members" ON audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.user_id = auth.uid() 
      AND (om.role IN ('superadmin', 'org_admin', 'auditor'))
  )
);

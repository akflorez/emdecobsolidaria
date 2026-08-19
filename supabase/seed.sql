-- ==============================================================================
-- SEED DATA: EMDECOB SOLIDARIA (DEPARTAMENTO DEL QUINDÍO Y DATOS DEMO)
-- ==============================================================================

-- 1. DEPARTAMENTOS Y MUNICIPIOS (DANE DIVIPOLA)
INSERT INTO geo_departments (code, name) VALUES 
  ('63', 'Quindío'),
  ('66', 'Risaralda'),
  ('17', 'Caldas'),
  ('76', 'Valle del Cauca')
ON CONFLICT DO NOTHING;

INSERT INTO geo_municipalities (code, department_code, name) VALUES
  -- Quindío
  ('63001', '63', 'Armenia'),
  ('63111', '63', 'Buenavista'),
  ('63130', '63', 'Calarcá'),
  ('63190', '63', 'Circasia'),
  ('63212', '63', 'Córdoba'),
  ('63272', '63', 'Filandia'),
  ('63302', '63', 'Génova'),
  ('63401', '63', 'La Tebaida'),
  ('63470', '63', 'Montenegro'),
  ('63548', '63', 'Pijao'),
  ('63594', '63', 'Quimbaya'),
  ('63690', '63', 'Salento'),
  
  -- Risaralda
  ('66001', '66', 'Pereira'),
  ('66170', '66', 'Dosquebradas'),
  ('66682', '66', 'Santa Rosa de Cabal'),

  -- Caldas
  ('17001', '17', 'Manizales'),
  ('17873', '17', 'Villamaría'),

  -- Valle del Cauca
  ('76001', '76', 'Cali'),
  ('76364', '76', 'Jamundí'),
  ('76520', '76', 'Palmira')
ON CONFLICT DO NOTHING;

-- 2. CATEGORÍAS DE NECESIDADES
INSERT INTO need_categories (id, name, icon, active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Materiales de Construcción', 'Hammer', true),
  ('a0000000-0000-0000-0000-000000000002', 'Alimentación y Mercados', 'Apple', true),
  ('a0000000-0000-0000-0000-000000000003', 'Ropa y Elementos de Primera Necesidad', 'Shirt', true),
  ('a0000000-0000-0000-0000-000000000004', 'Reparaciones Locativas', 'Wrench', true),
  ('a0000000-0000-0000-0000-000000000005', 'Alojamiento Temporal', 'Home', true),
  ('a0000000-0000-0000-0000-000000000006', 'Transporte y Logística', 'Truck', true),
  ('a0000000-0000-0000-0000-000000000007', 'Apoyo Psicológico', 'HeartPulse', true),
  ('a0000000-0000-0000-0000-000000000008', 'Orientación Jurídica', 'Scale', true),
  ('a0000000-0000-0000-0000-000000000009', 'Voluntariado y Servicios', 'Users', true),
  ('a0000000-0000-0000-0000-000000000010', 'Aporte Económico Directo', 'DollarSign', true)
ON CONFLICT DO NOTHING;

-- 3. ORGANIZACIÓN Y CAMPAÑA DEMO
INSERT INTO organizations (id, name, nit, active) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'EMDECOB Solidaria Quindío (DEMO)', '900123456-7', true)
ON CONFLICT DO NOTHING;

INSERT INTO campaigns (id, organization_id, title, description, department_code, municipality_code, active) VALUES
  ('c2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Emergencia Invierno Quindío 2026', 'Campaña de ayuda solidaria para familias afectadas por deslizamientos e inundaciones en municipios del Quindío.', '63', '63001', true)
ON CONFLICT DO NOTHING;

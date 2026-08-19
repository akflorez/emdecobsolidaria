// Tipos e Interfaces de Dominio para EMDECOB Solidaria

export type OrgRole = 'superadmin' | 'org_admin' | 'coordinator' | 'operator' | 'auditor';

export type BeneficiaryType = 'person' | 'family' | 'community';

export type UrgencyLevel = 'critica' | 'alta' | 'media' | 'baja';

export type CaseStatus = 
  | 'borrador' 
  | 'enviado' 
  | 'en_revision' 
  | 'requiere_correccion' 
  | 'verificado' 
  | 'publicado' 
  | 'parcialmente_asignado' 
  | 'totalmente_asignado' 
  | 'parcialmente_atendido' 
  | 'atendido' 
  | 'rechazado' 
  | 'cerrado';

export type NeedType = 'producto' | 'servicio' | 'voluntariado' | 'aporte_economico';

export type NeedStatus = 'abierta' | 'parcialmente_atendida' | 'atendida' | 'cancelada';

export type DonationStatus = 
  | 'borrador' 
  | 'pendiente_validacion' 
  | 'disponible' 
  | 'reservada_parcialmente' 
  | 'reservada' 
  | 'entregada_parcialmente' 
  | 'entregada' 
  | 'cancelada';

export type ResourceType = 'donation' | 'professional';

export type MatchStatus = 'propuesto' | 'aprobado' | 'en_camino' | 'entregado' | 'rechazado' | 'cancelado';

export type DeliveryStatus = 'programada' | 'entregada' | 'verificada' | 'rechazada';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_encrypted?: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
}

export interface GeoDepartment {
  code: string;
  name: string;
}

export interface GeoMunicipality {
  code: string;
  department_code: string;
  name: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  department_code: string;
  municipality_code?: string;
  active: boolean;
  created_at: string;
}

export interface NeedCategory {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface Need {
  id: string;
  case_id: string;
  organization_id: string;
  category_id: string;
  type: NeedType;
  description: string;
  quantity_required: number;
  unit: string;
  quantity_fulfilled: number;
  estimated_value_cop: number;
  municipality_code: string;
  priority: UrgencyLevel;
  deadline_date?: string;
  status: NeedStatus;
  created_at: string;
  updated_at?: string;
}

export interface PublicVerifiedNeed {
  public_code: string;
  need_id: string;
  municipality_code: string;
  municipality_name: string;
  category_name: string;
  category_icon: string;
  need_type: NeedType;
  summary: string;
  quantity_required: number;
  quantity_fulfilled: number;
  quantity_pending: number;
  unit: string;
  priority: UrgencyLevel;
  status: NeedStatus;
  created_at: string;
}

export interface Case {
  id: string;
  public_code: string; // Mínimo 8 caracteres aleatorios únicos
  organization_id: string;
  campaign_id: string;
  beneficiary_id: string;
  beneficiary_type: BeneficiaryType;
  affectation_description: string;
  urgency_level: UrgencyLevel;
  status: CaseStatus;
  created_channel: 'autoregistro' | 'llamada' | 'atencion_presencial' | 'visita_campo' | 'remision_aliada';
  data_processing_consent: boolean;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  needs?: Need[];
}

export interface DonationOfferItem {
  id: string;
  donation_offer_id: string;
  category_id: string;
  description: string;
  quantity_offered: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_delivered: number;
  unit: string;
  estimated_value_cop: number;
}

export interface DonationOffer {
  id: string;
  organization_id: string;
  donor_id: string;
  title: string;
  department_code: string;
  municipality_code: string;
  available_date: string;
  has_transport: boolean;
  requires_certificate: boolean;
  status: DonationStatus;
  items?: DonationOfferItem[];
  created_at: string;
  updated_at?: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  profession: string;
  specialty?: string;
  license_number?: string;
  max_weekly_hours: number;
  verified: boolean;
}

export interface Match {
  id: string;
  organization_id: string;
  need_id: string;
  resource_type: ResourceType;
  donation_offer_item_id?: string;
  professional_id?: string;
  quantity_assigned: number;
  assigned_by_user_id: string;
  status: MatchStatus;
  notes?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  organization_id: string;
  match_id: string;
  quantity_delivered: number;
  delivery_date: string;
  evidence_storage_path?: string;
  confirmed_by_beneficiary: boolean;
  beneficiary_rating?: number;
  beneficiary_feedback?: string;
  status: DeliveryStatus;
  created_at: string;
}

export interface PublicCampaignStats {
  campaign_id: string;
  campaign_title: string;
  department_code: string;
  municipality_code?: string;
  total_cases_received: number;
  total_cases_verified: number;
  total_cases_fulfilled: number;
  total_families_benefited: number;
  total_vulnerable_benefited: number;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  organization_id?: string;
  action: string;
  target_entity: string;
  target_id?: string;
  payload_sanitized: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

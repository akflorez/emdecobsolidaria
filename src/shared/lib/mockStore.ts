import {
  Campaign,
  Case,
  Need,
  DonationOffer,
  DonationOfferItem,
  Match,
  Delivery,
  PublicVerifiedNeed,
  PublicCampaignStats,
  AuditLog,
  NeedCategory,
  GeoDepartment,
  GeoMunicipality,
  OrgRole
} from '../types';
import { generatePublicCode } from './formatters';
import { generateDocumentHmac, sanitizeAuditPayload } from './cryptoUtils';

const STORAGE_KEY = 'emdecob_solidaria_state_v1';

export interface UserSession {
  user_id: string;
  email: string;
  full_name: string;
  role: OrgRole;
  organization_id: string;
  is_beneficiary?: boolean;
  is_donor?: boolean;
  is_professional?: boolean;
}

export interface AppState {
  currentUser: UserSession;
  departments: GeoDepartment[];
  municipalities: GeoMunicipality[];
  needCategories: NeedCategory[];
  campaigns: Campaign[];
  cases: Case[];
  needs: Need[];
  donationOffers: DonationOffer[];
  donationOfferItems: DonationOfferItem[];
  matches: Match[];
  deliveries: Delivery[];
  auditLogs: AuditLog[];
}

const DEFAULT_ORG_ID = 'e1111111-1111-1111-1111-111111111111';

const INITIAL_DEPARTMENTS: GeoDepartment[] = [
  { code: '63', name: 'Quindío' },
  { code: '66', name: 'Risaralda' },
  { code: '17', name: 'Caldas' },
  { code: '76', name: 'Valle del Cauca' }
];

const INITIAL_MUNICIPALITIES: GeoMunicipality[] = [
  // Quindío
  { code: '63001', department_code: '63', name: 'Armenia' },
  { code: '63111', department_code: '63', name: 'Buenavista' },
  { code: '63130', department_code: '63', name: 'Calarcá' },
  { code: '63190', department_code: '63', name: 'Circasia' },
  { code: '63212', department_code: '63', name: 'Córdoba' },
  { code: '63272', department_code: '63', name: 'Filandia' },
  { code: '63302', department_code: '63', name: 'Génova' },
  { code: '63401', department_code: '63', name: 'La Tebaida' },
  { code: '63470', department_code: '63', name: 'Montenegro' },
  { code: '63548', department_code: '63', name: 'Pijao' },
  { code: '63594', department_code: '63', name: 'Quimbaya' },
  { code: '63690', department_code: '63', name: 'Salento' },
  
  // Risaralda
  { code: '66001', department_code: '66', name: 'Pereira' },
  { code: '66170', department_code: '66', name: 'Dosquebradas' },
  { code: '66682', department_code: '66', name: 'Santa Rosa de Cabal' },

  // Caldas
  { code: '17001', department_code: '17', name: 'Manizales' },
  { code: '17873', department_code: '17', name: 'Villamaría' },

  // Valle del Cauca
  { code: '76001', department_code: '76', name: 'Cali' },
  { code: '76364', department_code: '76', name: 'Jamundí' },
  { code: '76520', department_code: '76', name: 'Palmira' }
];

const INITIAL_CATEGORIES: NeedCategory[] = [
  { id: 'cat-1', name: 'Materiales de Construcción', icon: 'Hammer', active: true },
  { id: 'cat-2', name: 'Alimentación y Mercados', icon: 'Apple', active: true },
  { id: 'cat-3', name: 'Ropa y Elementos de Primera Necesidad', icon: 'Shirt', active: true },
  { id: 'cat-4', name: 'Reparaciones Locativas', icon: 'Wrench', active: true },
  { id: 'cat-5', name: 'Alojamiento Temporal', icon: 'Home', active: true },
  { id: 'cat-6', name: 'Transporte y Logística', icon: 'Truck', active: true },
  { id: 'cat-7', name: 'Apoyo Psicológico', icon: 'HeartPulse', active: true },
  { id: 'cat-8', name: 'Orientación Jurídica', icon: 'Scale', active: true },
  { id: 'cat-9', name: 'Voluntariado y Servicios', icon: 'Users', active: true },
  { id: 'cat-10', name: 'Aporte Económico Directo', icon: 'DollarSign', active: true }
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    organization_id: DEFAULT_ORG_ID,
    title: 'Campaña Nacional de Respuesta a Emergencias 2026',
    description: 'Atención humanitaria integral para familias vulnerables en el Eje Cafetero (Quindío, Risaralda, Caldas) y Valle del Cauca (Cali).',
    department_code: '63',
    municipality_code: '63001',
    active: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  }
];

class MockStore {
  private listeners: (() => void)[] = [];
  private state: AppState;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch {
        this.state = this.getInitialState();
      }
    } else {
      this.state = this.getInitialState();
    }
  }

  private getInitialState(): AppState {
    return {
      currentUser: {
        user_id: 'usr-coord-1',
        email: 'coordinador@emdecob.org',
        full_name: 'Carlos Mendoza (Coordinador)',
        role: 'coordinator',
        organization_id: DEFAULT_ORG_ID,
        is_beneficiary: true,
        is_donor: true,
        is_professional: true
      },
      departments: INITIAL_DEPARTMENTS,
      municipalities: INITIAL_MUNICIPALITIES,
      needCategories: INITIAL_CATEGORIES,
      campaigns: INITIAL_CAMPAIGNS,
      cases: [],
      needs: [],
      donationOffers: [],
      donationOfferItems: [],
      matches: [],
      deliveries: [],
      auditLogs: [
        {
          id: 'log-init',
          actor_id: 'usr-admin-1',
          organization_id: DEFAULT_ORG_ID,
          action: 'SYSTEM_INITIALIZATION',
          target_entity: 'system',
          payload_sanitized: { version: '1.0.0', mode: 'PRODUCTION_READY_MVP' },
          created_at: new Date().toISOString()
        }
      ]
    };
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  getState(): AppState {
    return this.state;
  }

  setCurrentUserRole(role: OrgRole) {
    const roleNames: Record<OrgRole, string> = {
      superadmin: 'Superadministrador Sistema',
      org_admin: 'Administrador de Organización',
      coordinator: 'Carlos Mendoza (Coordinador)',
      operator: 'Laura Restrepo (Operadora de Campo)',
      auditor: 'Mariana Gómez (Auditora Externa)'
    };
    this.state.currentUser.role = role;
    this.state.currentUser.full_name = roleNames[role] || 'Usuario EMDECOB';
    this.save();
  }

  // --- REGISTRO DE AUDITORÍA (INSERT-ONLY) ---
  addAuditLog(action: string, target_entity: string, target_id?: string, rawPayload: Record<string, any> = {}) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor_id: this.state.currentUser.user_id,
      organization_id: this.state.currentUser.organization_id,
      action,
      target_entity,
      target_id,
      payload_sanitized: sanitizeAuditPayload(rawPayload),
      created_at: new Date().toISOString()
    };
    // INMUTABILIDAD EN MEMORIA (Sólo append)
    this.state.auditLogs.unshift(log);
    this.save();
  }

  // --- PASO 1: CREAR CAMPAÑA ---
  createCampaign(title: string, description: string, municipality_code: string): Campaign {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      organization_id: this.state.currentUser.organization_id,
      title,
      description,
      department_code: '63',
      municipality_code,
      active: true,
      created_at: new Date().toISOString()
    };
    this.state.campaigns.unshift(newCamp);
    this.addAuditLog('CAMPAIGN_CREATED', 'campaigns', newCamp.id, { title, municipality_code });
    return newCamp;
  }

  // --- PASO 2: REGISTRO DE SOLICITUD DE CASO MULTI-PASO ---
  async createCaseRequest(data: {
    campaign_id: string;
    beneficiary_type: 'person' | 'family' | 'community';
    full_name: string;
    document_number: string;
    phone_contact: string;
    municipality_code: string;
    approximate_address: string;
    affectation_description: string;
    urgency_level: 'critica' | 'alta' | 'media' | 'baja';
    family_count: number;
    vulnerable_count: number;
    created_channel: 'autoregistro' | 'llamada' | 'atencion_presencial' | 'visita_campo' | 'remision_aliada';
    needs: Array<{
      category_id: string;
      type: 'producto' | 'servicio' | 'voluntariado' | 'aporte_economico';
      description: string;
      quantity_required: number;
      unit: string;
      estimated_value_cop: number;
    }>;
  }): Promise<Case> {
    const publicCode = generatePublicCode();
    const documentHmac = await generateDocumentHmac(data.document_number);
    const beneficiaryId = `ben-${Date.now()}`;
    const caseId = `case-${Date.now()}`;

    const newCase: Case = {
      id: caseId,
      public_code: publicCode,
      organization_id: this.state.currentUser.organization_id,
      campaign_id: data.campaign_id,
      beneficiary_id: beneficiaryId,
      beneficiary_type: data.beneficiary_type,
      affectation_description: data.affectation_description,
      urgency_level: data.urgency_level,
      status: 'enviado',
      created_channel: data.created_channel,
      data_processing_consent: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newNeeds: Need[] = data.needs.map((n, idx) => ({
      id: `need-${Date.now()}-${idx}`,
      case_id: caseId,
      organization_id: this.state.currentUser.organization_id,
      category_id: n.category_id,
      type: n.type,
      description: n.description,
      quantity_required: n.quantity_required,
      unit: n.unit,
      quantity_fulfilled: 0,
      estimated_value_cop: n.estimated_value_cop,
      municipality_code: data.municipality_code,
      priority: data.urgency_level,
      status: 'abierta',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    this.state.cases.unshift(newCase);
    this.state.needs.unshift(...newNeeds);

    this.addAuditLog('CASE_CREATED', 'cases', caseId, {
      public_code: publicCode,
      channel: data.created_channel,
      document_hmac: documentHmac,
      needs_count: newNeeds.length
    });

    return newCase;
  }

  // --- PASO 3 Y 4: VERIFICACIÓN DE CASO Y PUBLICACIÓN ---
  verifyCase(caseId: string, internalNotes?: string): Case {
    const caseObj = this.state.cases.find(c => c.id === caseId);
    if (!caseObj) throw new Error('Caso no encontrado');

    caseObj.status = 'verificado';
    caseObj.internal_notes = internalNotes;
    caseObj.updated_at = new Date().toISOString();

    this.addAuditLog('CASE_VERIFIED', 'cases', caseId, { public_code: caseObj.public_code });
    this.save();
    return caseObj;
  }

  publishCase(caseId: string): Case {
    const caseObj = this.state.cases.find(c => c.id === caseId);
    if (!caseObj) throw new Error('Caso no encontrado');

    caseObj.status = 'publicado';
    caseObj.updated_at = new Date().toISOString();

    this.addAuditLog('CASE_PUBLISHED_ANONYMOUSLY', 'cases', caseId, { public_code: caseObj.public_code });
    this.save();
    return caseObj;
  }

  // --- PASO 6: REGISTRAR OFRECIMIENTO DE DONACIÓN ---
  createDonationOffer(data: {
    title: string;
    municipality_code: string;
    has_transport: boolean;
    requires_certificate: boolean;
    items: Array<{
      category_id: string;
      description: string;
      quantity_offered: number;
      unit: string;
      estimated_value_cop: number;
    }>;
  }): DonationOffer {
    const offerId = `don-${Date.now()}`;
    const newOffer: DonationOffer = {
      id: offerId,
      organization_id: this.state.currentUser.organization_id,
      donor_id: 'donor-profile-1',
      title: data.title,
      department_code: '63',
      municipality_code: data.municipality_code,
      available_date: new Date().toISOString().split('T')[0],
      has_transport: data.has_transport,
      requires_certificate: data.requires_certificate,
      status: 'disponible',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newItems: DonationOfferItem[] = data.items.map((it, idx) => ({
      id: `don-item-${Date.now()}-${idx}`,
      donation_offer_id: offerId,
      category_id: it.category_id,
      description: it.description,
      quantity_offered: it.quantity_offered,
      quantity_available: it.quantity_offered,
      quantity_reserved: 0,
      quantity_delivered: 0,
      unit: it.unit,
      estimated_value_cop: it.estimated_value_cop
    }));

    this.state.donationOffers.unshift(newOffer);
    this.state.donationOfferItems.unshift(...newItems);

    this.addAuditLog('DONATION_OFFER_CREATED', 'donation_offers', offerId, {
      title: data.title,
      items_count: newItems.length
    });

    return newOffer;
  }

  // --- PASO 7 Y 8: ASIGNACIÓN Y RESERVA TRANSACCIONAL (FOR UPDATE SIMULADO) ---
  approveMatchAndReserve(data: {
    need_id: string;
    resource_type: 'donation' | 'professional';
    donation_offer_item_id?: string;
    professional_id?: string;
    quantity_assigned: number;
    notes?: string;
  }): Match {
    const need = this.state.needs.find(n => n.id === data.need_id);
    if (!need) throw new Error('Necesidad no encontrada');

    // CHECK CONSTRAINT VALIDATION
    if (data.resource_type === 'donation') {
      if (!data.donation_offer_item_id || data.professional_id) {
        throw new Error('Restricción CHECK violada: Recurso de donación exige donation_offer_item_id y professional_id nulo.');
      }
      const item = this.state.donationOfferItems.find(i => i.id === data.donation_offer_item_id);
      if (!item) throw new Error('Ítem de donación no encontrado');

      // BLOQUEO TRANSACCIONAL Y VALIDACIÓN DE CANTIDAD DISPONIBLE
      if (item.quantity_available < data.quantity_assigned) {
        throw new Error(`Cantidad insuficiente. Disponible: ${item.quantity_available}, Requerido: ${data.quantity_assigned}`);
      }

      item.quantity_available -= data.quantity_assigned;
      item.quantity_reserved += data.quantity_assigned;
    } else {
      if (!data.professional_id || data.donation_offer_item_id) {
        throw new Error('Restricción CHECK violada: Recurso profesional exige professional_id y donation_offer_item_id nulo.');
      }
    }

    const matchId = `match-${Date.now()}`;
    const newMatch: Match = {
      id: matchId,
      organization_id: this.state.currentUser.organization_id,
      need_id: data.need_id,
      resource_type: data.resource_type,
      donation_offer_item_id: data.donation_offer_item_id,
      professional_id: data.professional_id,
      quantity_assigned: data.quantity_assigned,
      assigned_by_user_id: this.state.currentUser.user_id,
      status: 'aprobado',
      notes: data.notes,
      created_at: new Date().toISOString()
    };

    this.state.matches.unshift(newMatch);

    need.status = 'parcialmente_atendida';
    need.updated_at = new Date().toISOString();

    const caseObj = this.state.cases.find(c => c.id === need.case_id);
    if (caseObj && caseObj.status === 'publicado') {
      caseObj.status = 'parcialmente_asignado';
      caseObj.updated_at = new Date().toISOString();
    }

    this.addAuditLog('MATCH_APPROVED_AND_RESERVED', 'matches', matchId, {
      need_id: data.need_id,
      quantity_assigned: data.quantity_assigned,
      resource_type: data.resource_type
    });

    return newMatch;
  }

  // --- PASO 9 Y 10: REGISTRO DE ENTREGA Y CONFIRMACIÓN BENEFICIARIO ---
  createAndConfirmDelivery(data: {
    match_id: string;
    quantity_delivered: number;
    evidence_storage_path?: string;
    beneficiary_rating?: number;
    beneficiary_feedback?: string;
  }): Delivery {
    const match = this.state.matches.find(m => m.id === data.match_id);
    if (!match) throw new Error('Coincidencia no encontrada');

    const need = this.state.needs.find(n => n.id === match.need_id);
    if (!need) throw new Error('Necesidad no encontrada');

    const deliveryId = `del-${Date.now()}`;
    const newDelivery: Delivery = {
      id: deliveryId,
      organization_id: this.state.currentUser.organization_id,
      match_id: data.match_id,
      quantity_delivered: data.quantity_delivered,
      delivery_date: new Date().toISOString(),
      evidence_storage_path: data.evidence_storage_path || 'evidences/delivery_proof_01.jpg',
      confirmed_by_beneficiary: true,
      beneficiary_rating: data.beneficiary_rating || 5,
      beneficiary_feedback: data.beneficiary_feedback || 'Ayuda recibida en perfecto estado. ¡Muchas gracias!',
      status: 'verificada',
      created_at: new Date().toISOString()
    };

    this.state.deliveries.unshift(newDelivery);
    match.status = 'entregado';

    if (match.resource_type === 'donation' && match.donation_offer_item_id) {
      const item = this.state.donationOfferItems.find(i => i.id === match.donation_offer_item_id);
      if (item) {
        item.quantity_reserved -= data.quantity_delivered;
        item.quantity_delivered += data.quantity_delivered;
      }
    }

    // ACTUALIZACIÓN DE SALDOS PENDIENTES DE LA NECESIDAD
    need.quantity_fulfilled += data.quantity_delivered;
    if (need.quantity_fulfilled >= need.quantity_required) {
      need.status = 'atendida';
    } else {
      need.status = 'parcialmente_atendida';
    }
    need.updated_at = new Date().toISOString();

    // EVALUACIÓN DE CIERRE DEL CASO COMPLETO
    const caseObj = this.state.cases.find(c => c.id === need.case_id);
    if (caseObj) {
      const allNeeds = this.state.needs.filter(n => n.case_id === caseObj.id);
      if (allNeeds.every(n => n.status === 'atendida')) {
        caseObj.status = 'atendido';
        caseObj.updated_at = new Date().toISOString();
      }
    }

    this.addAuditLog('DELIVERY_CONFIRMED_BY_BENEFICIARY', 'deliveries', deliveryId, {
      match_id: data.match_id,
      quantity_delivered: data.quantity_delivered,
      rating: data.beneficiary_rating
    });

    return newDelivery;
  }

  // --- VISTAS PÚBLICAS Y CALCULADORAS DE INDICADORES EN TIEMPO REAL ---
  getPublicVerifiedNeeds(): PublicVerifiedNeed[] {
    const verifiedCases = this.state.cases.filter(c => 
      ['verificado', 'publicado', 'parcialmente_asignado', 'parcialmente_atendido'].includes(c.status)
    );
    const verifiedCaseIds = new Set(verifiedCases.map(c => c.id));
    
    return this.state.needs
      .filter(n => verifiedCaseIds.has(n.case_id) && ['abierta', 'parcialmente_atendida'].includes(n.status))
      .map(n => {
        const caseObj = this.state.cases.find(c => c.id === n.case_id);
        const cat = this.state.needCategories.find(c => c.id === n.category_id);
        const muni = this.state.municipalities.find(m => m.code === n.municipality_code);

        return {
          public_code: caseObj?.public_code || 'EMD-ANONIMO',
          need_id: n.id,
          municipality_code: n.municipality_code,
          municipality_name: muni?.name || 'Municipio Quindío',
          category_name: cat?.name || 'Categoría',
          category_icon: cat?.icon || 'HeartHandshake',
          need_type: n.type,
          summary: n.description,
          quantity_required: n.quantity_required,
          quantity_fulfilled: n.quantity_fulfilled,
          quantity_pending: n.quantity_required - n.quantity_fulfilled,
          unit: n.unit,
          priority: n.priority,
          status: n.status,
          created_at: n.created_at
        };
      });
  }

  getPublicCampaignStats(): PublicCampaignStats {
    const totalCasesReceived = this.state.cases.length;
    const totalCasesVerified = this.state.cases.filter(c => 
      ['verificado', 'publicado', 'parcialmente_asignado', 'totalmente_asignado', 'parcialmente_atendido', 'atendido'].includes(c.status)
    ).length;
    const totalCasesFulfilled = this.state.cases.filter(c => c.status === 'atendido').length;
    const totalFamiliesBenefited = totalCasesFulfilled * 4; // Promedio 4 personas por familia beneficiada
    const totalVulnerableBenefited = totalCasesFulfilled * 2;

    return {
      campaign_id: 'camp-1',
      campaign_title: 'Campaña Nacional de Respuesta a Emergencias 2026',
      department_code: '63',
      total_cases_received: totalCasesReceived,
      total_cases_verified: totalCasesVerified,
      total_cases_fulfilled: totalCasesFulfilled,
      total_families_benefited: totalFamiliesBenefited,
      total_vulnerable_benefited: totalVulnerableBenefited
    };
  }

  resetDemoState() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.getInitialState();
    this.notify();
  }
}

export const mockStore = new MockStore();

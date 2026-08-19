import { describe, it, expect, beforeEach } from 'vitest';
import { formatCOP, generatePublicCode } from '../shared/lib/formatters';
import { sanitizeAuditPayload } from '../shared/lib/cryptoUtils';
import { mockStore } from '../shared/lib/mockStore';

describe('Dominio EMDECOB Solidaria - Pruebas Unitarias', () => {
  
  beforeEach(() => {
    mockStore.resetDemoState();
  });

  it('Generación de Código Público Aleatorio de Mínimo 8 Caracteres Único', () => {
    const code1 = generatePublicCode();
    const code2 = generatePublicCode();

    expect(code1).toMatch(/^EMD-[A-Z2-9]{8}$/);
    expect(code2).toMatch(/^EMD-[A-Z2-9]{8}$/);
    expect(code1).not.toEqual(code2);
  });

  it('Formateador de Pesos Colombianos (COP)', () => {
    const formatted = formatCOP(700000);
    expect(formatted).toContain('700');
    expect(formatted).toContain('$');
  });

  it('Sanitización de PII en Registro de Auditoría', () => {
    const rawPayload = {
      user: 'Ana Flórez',
      document_number: '1094123456',
      phone_contact: '3123456789',
      case_id: 'case-123'
    };

    const sanitized = sanitizeAuditPayload(rawPayload);

    expect(sanitized.document_number).toBe('[REDACTED_PII]');
    expect(sanitized.phone_contact).toBe('[REDACTED_PII]');
    expect(sanitized.case_id).toBe('case-123');
  });

  it('Validación Transaccional: No permitir asignación mayor a la cantidad disponible', async () => {
    const createdCase = await mockStore.createCaseRequest({
      campaign_id: 'camp-1',
      beneficiary_type: 'family',
      full_name: 'Familia Test',
      document_number: '1094111222',
      phone_contact: '3101112222',
      municipality_code: '63001',
      approximate_address: 'Barrio Centro',
      affectation_description: 'Daños en techo',
      urgency_level: 'alta',
      family_count: 3,
      vulnerable_count: 1,
      created_channel: 'autoregistro',
      needs: [
        {
          category_id: 'cat-1',
          type: 'producto',
          description: 'Tejas de zinc',
          quantity_required: 10,
          unit: 'Unidades',
          estimated_value_cop: 500000
        }
      ]
    });

    const need = mockStore.getState().needs.find(n => n.case_id === createdCase.id)!;

    const offer = mockStore.createDonationOffer({
      title: 'Tejas de zinc',
      municipality_code: '63001',
      has_transport: true,
      requires_certificate: false,
      items: [
        {
          category_id: 'cat-1',
          description: 'Tejas de zinc 3m',
          quantity_offered: 5,
          unit: 'Unidades',
          estimated_value_cop: 250000
        }
      ]
    });

    const item = mockStore.getState().donationOfferItems.find(i => i.donation_offer_id === offer.id)!;

    // Intentar asignar 10 cuando solo hay 5 disponibles debe lanzar error transaccional
    expect(() => {
      mockStore.approveMatchAndReserve({
        need_id: need.id,
        resource_type: 'donation',
        donation_offer_item_id: item.id,
        quantity_assigned: 10
      });
    }).toThrow(/insuficiente/i);
  });

  it('Restricción CHECK de Matches: Exige exactamente una fuente de recurso', async () => {
    const createdCase = await mockStore.createCaseRequest({
      campaign_id: 'camp-1',
      beneficiary_type: 'family',
      full_name: 'Familia Test',
      document_number: '1094111222',
      phone_contact: '3101112222',
      municipality_code: '63001',
      approximate_address: 'Barrio Centro',
      affectation_description: 'Daños en techo',
      urgency_level: 'alta',
      family_count: 3,
      vulnerable_count: 1,
      created_channel: 'autoregistro',
      needs: [
        {
          category_id: 'cat-1',
          type: 'producto',
          description: 'Tejas de zinc',
          quantity_required: 10,
          unit: 'Unidades',
          estimated_value_cop: 500000
        }
      ]
    });

    const need = mockStore.getState().needs.find(n => n.case_id === createdCase.id)!;

    expect(() => {
      mockStore.approveMatchAndReserve({
        need_id: need.id,
        resource_type: 'donation',
        donation_offer_item_id: undefined, // Faltante
        quantity_assigned: 1
      });
    }).toThrow(/Restricción CHECK/i);
  });

});

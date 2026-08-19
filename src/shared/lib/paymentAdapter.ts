// Adaptador de Pagos Desacoplado para EMDECOB Solidaria
// Mantiene los pagos reales deshabilitados por defecto en el MVP.

export interface PaymentIntentPayload {
  organization_id: string;
  donor_id: string;
  need_id?: string;
  amount_cop: number;
}

export interface PaymentIntentResult {
  success: boolean;
  intent_id: string;
  status: 'comprometido' | 'conciliado_manual' | 'cancelado';
  provider: string;
  reference: string;
  message: string;
}

export class PaymentAdapter {
  private isRealPaymentEnabled: boolean;

  constructor() {
    this.isRealPaymentEnabled = import.meta.env.VITE_ENABLE_REAL_PAYMENTS === 'true';
  }

  async createPledgeOrIntent(_payload: PaymentIntentPayload): Promise<PaymentIntentResult> {
    if (this.isRealPaymentEnabled) {
      throw new Error("Transacciones bancarias en vivo no disponibles sin credenciales legales configuradas.");
    }

    // Registro de compromiso de aporte en el MVP
    const reference = `PLEDGE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      intent_id: `pi_${Date.now()}`,
      status: 'comprometido',
      provider: 'adapter_stub_pledge',
      reference,
      message: 'Compromiso de aporte registrado exitosamente. Se gestionará conciliación administrativa.'
    };
  }
}

export const paymentAdapter = new PaymentAdapter();

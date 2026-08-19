// Utilidades de HMAC y sanitización de registros de auditoría (sin datos personales sensibles)

export async function generateDocumentHmac(documentNumber: string): Promise<string> {
  const cleanDoc = documentNumber.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(`EMDECOB_SALT_${cleanDoc}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function sanitizeAuditPayload(payload: Record<string, any>): Record<string, any> {
  const sanitized = { ...payload };
  const sensitiveKeys = ['document', 'document_number', 'phone', 'email', 'address', 'password', 'credit_card'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED_PII]';
    }
  }
  
  return sanitized;
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockStore } from '../../shared/lib/mockStore';
import { useCamera } from '../../shared/hooks/useCamera';
import { formatCOP } from '../../shared/lib/formatters';
import { Shield, Camera, Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const DRAFT_KEY = 'emdecob_case_form_draft';

export const CaseFormMultiStep: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { photo, takePhoto } = useCamera();

  const campaigns = mockStore.getState().campaigns;
  const municipalities = mockStore.getState().municipalities;
  const categories = mockStore.getState().needCategories;

  // Estado del formulario por pasos
  const [step, setStep] = useState(1);
  const [campaignId, setCampaignId] = useState(searchParams.get('campaign') || campaigns[0]?.id || '');
  const [createdChannel, setCreatedChannel] = useState<'autoregistro' | 'llamada' | 'atencion_presencial' | 'visita_campo' | 'remision_aliada'>('autoregistro');
  const [beneficiaryType, setBeneficiaryType] = useState<'person' | 'family' | 'community'>('family');
  
  // Datos Beneficiario (Serán anonimizados del catálogo público y cifrados con HMAC)
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [muniCode, setMuniCode] = useState('63001'); // Armenia
  const [approxAddress, setApproxAddress] = useState('');

  // Afectación y Vulnerabilidad
  const [affectation, setAffectation] = useState('');
  const [urgency, setUrgency] = useState<'critica' | 'alta' | 'media' | 'baja'>('alta');
  const [familyCount, setFamilyCount] = useState(4);
  const [vulnerableCount, setVulnerableCount] = useState(2);

  // Lista de Necesidades Desglosadas
  const [needs, setNeeds] = useState<Array<{
    category_id: string;
    type: 'producto' | 'servicio' | 'voluntariado' | 'aporte_economico';
    description: string;
    quantity_required: number;
    unit: string;
    estimated_value_cop: number;
  }>>([
    {
      category_id: categories[0]?.id || 'cat-1',
      type: 'producto',
      description: 'Sacos de cemento tipo 1 para reparación de muro colapsado',
      quantity_required: 20,
      unit: 'Sacos',
      estimated_value_cop: 700000
    }
  ]);

  const [dataConsent, setDataConsent] = useState(true);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  // Recuperar borrador si existe
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.affectation) setAffectation(parsed.affectation);
        if (parsed.needs && parsed.needs.length) setNeeds(parsed.needs);
      } catch {
        // Ignorar error de draft
      }
    }
  }, []);

  // Autoguardado de borrador
  const handleSaveDraft = () => {
    const draft = { fullName, affectation, needs, muniCode, urgency };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftSavedAlert(true);
    setTimeout(() => setDraftSavedAlert(false), 3000);
  };

  const addNeed = () => {
    setNeeds([
      ...needs,
      {
        category_id: categories[1]?.id || 'cat-2',
        type: 'producto',
        description: '',
        quantity_required: 1,
        unit: 'Unidades',
        estimated_value_cop: 100000
      }
    ]);
  };

  const removeNeed = (idx: number) => {
    if (needs.length === 1) return;
    setNeeds(needs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const createdCase = await mockStore.createCaseRequest({
        campaign_id: campaignId,
        beneficiary_type: beneficiaryType,
        full_name: fullName || 'Persona Damnificada',
        document_number: documentNumber || '1094000111',
        phone_contact: phoneContact || '3100000000',
        municipality_code: muniCode,
        approximate_address: approxAddress,
        affectation_description: affectation,
        urgency_level: urgency,
        family_count: Number(familyCount),
        vulnerable_count: Number(vulnerableCount),
        created_channel: createdChannel,
        needs
      });

      localStorage.removeItem(DRAFT_KEY);
      setSubmittedCode(createdCase.public_code);
    } catch (err: any) {
      alert(`Error al registrar el caso: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Solicitud Registrada Exitosamente</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Código Anónimo Asignado</h2>
          <div className="inline-block bg-slate-900 text-brand-400 font-mono text-2xl font-bold px-6 py-3 rounded-xl border border-slate-700 shadow-md my-4 tracking-wider">
            {submittedCode}
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Conserve este código para consultar el avance. Su nombre y documento han sido totalmente protegidos y anonimizados para la vista pública.
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/necesidades-publicas')}
            className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow hover:bg-brand-700"
          >
            Ver en Catálogo Público
          </button>
          <button
            onClick={() => {
              setSubmittedCode(null);
              setStep(1);
            }}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
          >
            Registrar Otra Solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Encabezado y Barra de Progreso */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Registro de Solicitud de Ayuda</h1>
            <p className="text-xs text-slate-500">Paso {step} de 7 - Formulario móvil con guardado de borrador</p>
          </div>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Guardar Borrador</span>
          </button>
        </div>

        {/* Indicador de Progreso por Pasos */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-brand-600 h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {draftSavedAlert && (
          <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Borrador guardado en la memoria segura de tu dispositivo.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* PASO 1: Selección de Campaña */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">1</span>
              Selección de Campaña o Emergencia
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campaña de la Emergencia</label>
              <select
                value={campaignId}
                onChange={e => setCampaignId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* PASO 2: Canal y Tipo Beneficiario */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">2</span>
              Canal de Origen y Tipo de Beneficiario
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Canal de Registro de la Solicitud</label>
              <select
                value={createdChannel}
                onChange={e => setCreatedChannel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="autoregistro">Autoregistro (Beneficiario desde celular/PWA)</option>
                <option value="llamada">Llamada Telefónica (Registrado por Operador)</option>
                <option value="atencion_presencial">Atención Presencial en Sede</option>
                <option value="visita_campo">Visita de Campo / Censo Directo</option>
                <option value="remision_aliada">Remisión de Organización Aliada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Beneficiario</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'person', label: 'Persona Individual' },
                  { id: 'family', label: 'Grupo Familiar' },
                  { id: 'community', label: 'Comunidad / Barrio' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBeneficiaryType(item.id as any)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      beneficiaryType === item.id 
                        ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: Información de Contacto y Ubicación DANE */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">3</span>
              Información de Contacto y Ubicación (DANE)
            </h3>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Los nombres, cédulas y direcciones son cifrados y NUNCA se publicarán.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo del Responsable</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ej: Ana Karina Flórez"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento de Identidad</label>
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={e => setDocumentNumber(e.target.value)}
                  placeholder="Ej: 1094123456"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  required
                  value={phoneContact}
                  onChange={e => setPhoneContact(e.target.value)}
                  placeholder="Ej: 3123456789"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Municipio de Afectación (Código DANE)</label>
                <select
                  value={muniCode}
                  onChange={e => setMuniCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {municipalities.map(m => (
                    <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ubicación / Dirección Aproximada</label>
              <input
                type="text"
                value={approxAddress}
                onChange={e => setApproxAddress(e.target.value)}
                placeholder="Ej: Barrio Las Colinas, Manzana B Casa 12"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* PASO 4: Afectación y Nivel de Urgencia */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">4</span>
              Descripción de la Afectación y Urgencia
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detalle de los daños o pérdida sufrida</label>
              <textarea
                required
                rows={4}
                value={affectation}
                onChange={e => setAffectation(e.target.value)}
                placeholder="Describa la situación sufrida (colapso de techo, pérdida de enseres, inundación...)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nivel de Urgencia Declarado</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="critica">Crítica (Riesgo inminente / Alojamiento)</option>
                  <option value="alta">Alta (Necesidades básicas no cubiertas)</option>
                  <option value="media">Media (Reparaciones medianas)</option>
                  <option value="baja">Baja (Apoyo posterior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Integrantes de la Familia</label>
                <input
                  type="number"
                  min={1}
                  value={familyCount}
                  onChange={e => setFamilyCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personas Vulnerables (Niños/Adulto Mayor)</label>
                <input
                  type="number"
                  min={0}
                  value={vulnerableCount}
                  onChange={e => setVulnerableCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: Desglose de Necesidades Específicas */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">5</span>
                Necesidades Específicas (Desglose Independiente)
              </h3>
              <button
                type="button"
                onClick={addNeed}
                className="bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Otra Necesidad</span>
              </button>
            </div>

            <div className="space-y-4">
              {needs.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 relative">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-700">Necesidad #{idx + 1}</span>
                    {needs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNeed(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Categoría</label>
                      <select
                        value={item.category_id}
                        onChange={e => {
                          const updated = [...needs];
                          updated[idx].category_id = e.target.value;
                          setNeeds(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Ayuda Requerida</label>
                      <select
                        value={item.type}
                        onChange={e => {
                          const updated = [...needs];
                          updated[idx].type = e.target.value as any;
                          setNeeds(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="producto">Producto / Material</option>
                        <option value="servicio">Reparación / Servicio</option>
                        <option value="voluntariado">Voluntariado Profesional</option>
                        <option value="aporte_economico">Aporte Económico Directo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Descripción del Ítem Necesitado</label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={e => {
                        const updated = [...needs];
                        updated[idx].description = e.target.value;
                        setNeeds(updated);
                      }}
                      placeholder="Ej: Tejas de zinc de 3 metros"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cantidad Requerida</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity_required}
                        onChange={e => {
                          const updated = [...needs];
                          updated[idx].quantity_required = Number(e.target.value);
                          setNeeds(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unidad de Medida</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={e => {
                          const updated = [...needs];
                          updated[idx].unit = e.target.value;
                          setNeeds(updated);
                        }}
                        placeholder="Sacos, Metros, Mercados..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor Estimado COP</label>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={item.estimated_value_cop}
                        onChange={e => {
                          const updated = [...needs];
                          updated[idx].estimated_value_cop = Number(e.target.value);
                          setNeeds(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 6: Evidencias y Captura de Cámara */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">6</span>
              Fotografías o Evidencias de Soporte
            </h3>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3 bg-slate-50">
              {photo ? (
                <div className="space-y-3">
                  <img src={photo} alt="Evidencia tomada" className="max-h-48 mx-auto rounded-lg shadow-sm border" />
                  <button
                    type="button"
                    onClick={takePhoto}
                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Tomar Otra Foto
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Captura de Evidencia Fotográfica</h4>
                    <p className="text-xs text-slate-500">Tome una fotografía directa con la cámara de su celular o adjunte un archivo.</p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={takePhoto}
                      className="px-4 py-2 bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-brand-700 flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Abrir Cámara</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PASO 7: Consentimiento, Revisión y Envío */}
        {step === 7 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">7</span>
              Consentimiento de Datos y Envío
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Resumen de la Solicitud:</div>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>Responsable:</strong> {fullName || 'Persona Damnificada'}</li>
                <li>• <strong>Ubicación:</strong> Quindío (Código DANE: {muniCode})</li>
                <li>• <strong>Urgencia:</strong> <span className="uppercase font-bold text-amber-700">{urgency}</span></li>
                <li>• <strong>Total Necesidades:</strong> {needs.length} ítems especificados</li>
                <li>• <strong>Valor Total Estimado:</strong> {formatCOP(needs.reduce((acc, curr) => acc + (curr.estimated_value_cop || 0), 0))}</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <input
                type="checkbox"
                id="consentCheck"
                checked={dataConsent}
                onChange={e => setDataConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <label htmlFor="consentCheck" className="text-xs text-slate-700 leading-relaxed">
                Autorizo el tratamiento seguro de mis datos bajo la Ley 1581 de Protección de Datos Personales en Colombia. Entiendo que la plataforma anonimizará mi identidad antes de publicar mis necesidades en el catálogo público.
              </label>
            </div>
          </div>
        )}

        {/* Botones de Navegación del Formulario */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : <div />}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!dataConsent || submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'Enviando y Anonimizando...' : 'Finalizar y Registrar Solicitud'}</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

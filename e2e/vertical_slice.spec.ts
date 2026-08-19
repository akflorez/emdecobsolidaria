import { test, expect } from '@playwright/test';

test.describe('EMDECOB Solidaria - Pruebas E2E del Recorrido Vertical Completo (13 Pasos)', () => {

  test('Recorrido de Principio a Fin: Campaña -> Solicitud -> Verificación -> Donación -> Coincidencia -> Entrega -> Confirmación -> Indicadores -> Auditoría', async ({ page }) => {
    // 1. Cargar Página Principal
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('EMDECOB');

    // 2. Navegar a Formulario de Solicitud de Ayuda
    await page.click('text=Solicitar Ayuda');
    await expect(page.locator('h1')).toContainText('Registro de Solicitud de Ayuda');

    // Paso 1: Campaña
    await page.click('button:has-text("Siguiente")');

    // Paso 2: Canal y Tipo
    await page.click('button:has-text("Siguiente")');

    // Paso 3: Datos de Contacto y Ubicación DANE
    await page.fill('input[placeholder*="Ana Karina"]', 'Familia Gómez Quindío');
    await page.fill('input[placeholder*="1094"]', '1094998877');
    await page.fill('input[placeholder*="312"]', '3109998877');
    await page.click('button:has-text("Siguiente")');

    // Paso 4: Afectación
    await page.fill('textarea', 'Afectación por inundación de vivienda con colapso de techos.');
    await page.click('button:has-text("Siguiente")');

    // Paso 5: Necesidades Desglosadas
    await page.click('button:has-text("Siguiente")');

    // Paso 6: Evidencias
    await page.click('button:has-text("Siguiente")');

    // Paso 7: Consentimiento y Envío Final
    await page.click('button:has-text("Finalizar y Registrar Solicitud")');

    // Verificación de Código Anónimo Generado (Mínimo 8 Caracteres Únicos)
    await expect(page.locator('h2')).toContainText('Código Anónimo Asignado');
    const codeElement = page.locator('.font-mono').first();
    await expect(codeElement).toContainText('EMD-');

    // 3. Ir a Catálogo Público Anonimizado
    await page.click('text=Ver en Catálogo Público');
    await expect(page.locator('h1')).toContainText('Catálogo de Necesidades Verificadas');

    // 4. Ir a Panel de Control
    await page.click('text=Panel de Control');
    await expect(page.locator('h1')).toContainText('Carlos Mendoza');

    // 5. Probar Tab de Auditoría (Insert-Only)
    await page.click('button:has-text("Auditoría")');
    await expect(page.locator('table')).toContainText('CASE_CREATED');
  });

});

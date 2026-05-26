import { describe, expect, it } from 'vitest';
import { getDepartmentDisplayName } from './department-display';

const trLabels = {
    technical_support: 'Teknik Destek',
    billing_payments: 'Fatura ve Ödemeler',
    sales_pre_sales: 'Satış ve Ön Satış',
    general_support: 'Genel Destek',
    licensing: 'Lisanslama',
    customer_success: 'Müşteri Başarısı',
    general_inquiries: 'Genel Başvurular',
    security_compliance: 'Güvenlik ve Uyumluluk',
};

describe('getDepartmentDisplayName', () => {
    it('localizes live ticket department names in Turkish UI', () => {
        expect(getDepartmentDisplayName({ name: 'Customer Success' }, trLabels)).toBe('Müşteri Başarısı');
        expect(getDepartmentDisplayName({ name: 'General Inquiries' }, trLabels)).toBe('Genel Başvurular');
        expect(getDepartmentDisplayName({ name: 'Security & Compliance' }, trLabels)).toBe('Güvenlik ve Uyumluluk');
    });

    it('prefers slug aliases over raw backend names', () => {
        expect(getDepartmentDisplayName({ name: 'Customer Success', slug: 'security-compliance' }, trLabels)).toBe('Güvenlik ve Uyumluluk');
    });

    it('falls back to raw name for unknown department names', () => {
        expect(getDepartmentDisplayName({ name: 'Partner Engineering' }, trLabels)).toBe('Partner Engineering');
    });
});

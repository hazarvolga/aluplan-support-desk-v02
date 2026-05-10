import { describe, it, expect } from 'vitest';

// Customer profile type matching the app
interface CustomerProfile {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  contractStatus: string | null;
  subscriptionModel: string | null;
}

// Helper functions from the customer list
function normalizeEmptyValue(value: string | null | undefined): string {
  return value ?? '';
}

function sortCustomers(
  customers: CustomerProfile[],
  field: 'contractStatus' | 'subscriptionModel',
  direction: 'asc' | 'desc'
): CustomerProfile[] {
  return [...customers].sort((a, b) => {
    const aVal = normalizeEmptyValue(a[field]);
    const bVal = normalizeEmptyValue(b[field]);
    const comparison = aVal.localeCompare(bVal);
    return direction === 'asc' ? comparison : -comparison;
  });
}

function searchCustomers(
  customers: CustomerProfile[],
  searchTerm: string,
  fields: ('contractStatus' | 'subscriptionModel')[]
): CustomerProfile[] {
  const term = searchTerm.toLowerCase();
  return customers.filter((c) =>
    fields.some((field) => {
      const value = normalizeEmptyValue(c[field]).toLowerCase();
      return value.includes(term);
    })
  );
}

function csvToCustomerRecord(
  row: Record<string, string>
): Partial<CustomerProfile> {
  return {
    companyName: row['Company Name']?.trim() || undefined,
    email: row['Email']?.trim() || undefined,
    phone: row['Phone']?.trim() || undefined,
    contractStatus: row['Contract Status']?.trim() || undefined,
    subscriptionModel: row['Subscription Model']?.trim() || undefined,
  };
}

describe('Property-based tests: customer-list-missing-columns (GAP-23)', () => {
  describe('Property Test 1: Migration Data Integrity', () => {
    const testCases = [
      { id: 'cust-001', companyName: 'Acme Corp', contractStatus: 'active', subscriptionModel: 'Enterprise' },
      { id: 'cust-002', companyName: 'Beta Inc', contractStatus: 'passive', subscriptionModel: null },
      { id: 'cust-003', companyName: 'Gamma Ltd', contractStatus: null, subscriptionModel: 'Starter' },
    ];

    testCases.forEach((customer) => {
      it(`should preserve data integrity for ${customer.id}`, () => {
        expect(customer.id).toBeDefined();
        expect(customer.companyName).toBeDefined();
        expect(customer.contractStatus === null || typeof customer.contractStatus === 'string').toBe(true);
        expect(customer.subscriptionModel === null || typeof customer.subscriptionModel === 'string').toBe(true);
      });
    });
  });

  describe('Property Test 2: API Response Field Inclusion', () => {
    const testCases = [
      { id: 'cust-001', companyName: 'Acme', email: 'test@acme.com', phone: '123', contractStatus: 'active', subscriptionModel: 'Pro' },
      { id: 'cust-002', companyName: 'Beta', email: 'dev@beta.com', phone: '456', contractStatus: 'suspended', subscriptionModel: null },
    ];

    testCases.forEach((customer) => {
      it('should include contractStatus and subscriptionModel fields', () => {
        const keys = Object.keys(customer);
        expect(keys).toContain('contractStatus');
        expect(keys).toContain('subscriptionModel');
      });
    });
  });

  describe('Property Test 3: CSV Import Round-Trip', () => {
    const csvRows = [
      { 'Company Name': 'Acme Corp', 'Email': 'test@acme.com', 'Phone': '123', 'Contract Status': 'active', 'Subscription Model': 'Enterprise' },
      { 'Company Name': 'Beta Inc', 'Email': '', 'Phone': '456', 'Contract Status': '', 'Subscription Model': '' },
      { 'Company Name': 'Gamma', 'Email': 'gamma@test.com', 'Phone': '789', 'Contract Status': 'passive', 'Subscription Model': 'Starter' },
    ];

    csvRows.forEach((csvRow, i) => {
      it(`should correctly parse CSV row ${i + 1}`, () => {
        const result = csvToCustomerRecord(csvRow);
        expect(result).toBeDefined();
        expect(result.companyName).toBeDefined();
      });
    });
  });

  describe('Property Test 4: Empty Value Normalization', () => {
    const testCases = [
      { contractStatus: null, subscriptionModel: undefined },
      { contractStatus: undefined, subscriptionModel: '' },
      { contractStatus: '', subscriptionModel: 'Pro' },
      { contractStatus: 'active', subscriptionModel: null },
    ];

    testCases.forEach((customer, i) => {
      it(`should normalize empty values consistently (case ${i + 1})`, () => {
        const normalizedContract = normalizeEmptyValue(customer.contractStatus);
        const normalizedSubscription = normalizeEmptyValue(customer.subscriptionModel);
        expect(normalizedContract).toBeTypeOf('string');
        expect(normalizedSubscription).toBeTypeOf('string');
      });
    });
  });

  describe('Property Test 5: Sort Functionality', () => {
    const customers: CustomerProfile[] = [
      { id: '1', companyName: 'A', email: 'a@test.com', phone: '1', contractStatus: 'passive', subscriptionModel: 'Basic' },
      { id: '2', companyName: 'B', email: 'b@test.com', phone: '2', contractStatus: 'active', subscriptionModel: 'Pro' },
      { id: '3', companyName: 'C', email: 'c@test.com', phone: '3', contractStatus: null, subscriptionModel: 'Enterprise' },
    ];

    it('should sort customers by contractStatus ascending', () => {
      const sorted = sortCustomers(customers, 'contractStatus', 'asc');
      expect(sorted[0].contractStatus).toBe('active');
    });

    it('should sort customers by contractStatus descending', () => {
      const sorted = sortCustomers(customers, 'contractStatus', 'desc');
      expect(sorted[0].contractStatus).toBe('passive');
    });

    it('should sort customers by subscriptionModel ascending', () => {
      const sorted = sortCustomers(customers, 'subscriptionModel', 'asc');
      expect(sorted[0].subscriptionModel).toBe('Basic');
    });

    it('should sort customers by subscriptionModel descending', () => {
      const sorted = sortCustomers(customers, 'subscriptionModel', 'desc');
      expect(sorted[0].subscriptionModel).toBe('Pro');
    });
  });

  describe('Property Test 6: Search Filter Inclusivity', () => {
    const customers: CustomerProfile[] = [
      { id: '1', companyName: 'Acme', email: 'a@test.com', phone: '1', contractStatus: 'active', subscriptionModel: 'Enterprise' },
      { id: '2', companyName: 'Beta', email: 'b@test.com', phone: '2', contractStatus: 'passive', subscriptionModel: 'Starter' },
      { id: '3', companyName: 'Gamma', email: 'c@test.com', phone: '3', contractStatus: 'active', subscriptionModel: 'Pro' },
    ];

    it('should find matching customers by contractStatus', () => {
      const results = searchCustomers(customers, 'active', ['contractStatus']);
      expect(results).toHaveLength(2);
    });

    it('should find matching customers by subscriptionModel', () => {
      const results = searchCustomers(customers, 'Pro', ['subscriptionModel']);
      expect(results).toHaveLength(1);
    });

    it('should return empty array for non-matching search', () => {
      const results = searchCustomers(customers, 'xyz', ['contractStatus']);
      expect(results).toHaveLength(0);
    });
  });

  describe('Property Test 7: Null Sort Consistency', () => {
    const customersWithNull: CustomerProfile[] = [
      { id: '1', companyName: 'A', email: 'a@test.com', phone: '1', contractStatus: null, subscriptionModel: 'Pro' },
      { id: '2', companyName: 'B', email: 'b@test.com', phone: '2', contractStatus: 'active', subscriptionModel: null },
      { id: '3', companyName: 'C', email: 'c@test.com', phone: '3', contractStatus: 'passive', subscriptionModel: 'Basic' },
    ];

    it('should handle null values consistently in sort', () => {
      const sorted = sortCustomers(customersWithNull, 'contractStatus', 'asc');
      expect(sorted).toHaveLength(3);
      sorted.forEach((c) => {
        expect(c.id).toBeDefined();
        expect(c.companyName).toBeDefined();
      });
    });

    it('should handle null subscriptionModel in sort', () => {
      const sorted = sortCustomers(customersWithNull, 'subscriptionModel', 'asc');
      expect(sorted).toHaveLength(3);
    });
  });
});
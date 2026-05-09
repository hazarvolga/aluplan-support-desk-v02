# Implementation Tasks: Customer List Missing Columns

## Phase 1: Database Layer

### 1.1 Update Prisma Schema
- [ ] Add `subscriptionModel` field to `CustomerProfile` model in `packages/database/prisma/schema.prisma`
- [ ] Set field as optional with `@map("subscription_model")` and `@db.VarChar(100)`

### 1.2 Create and Apply Migration
- [ ] Generate Prisma migration: `npx prisma migrate dev --name add_subscription_model`
- [ ] Verify migration SQL adds column correctly
- [ ] Apply migration to development database
- [ ] Verify column exists in database schema

## Phase 2: Backend Layer

### 2.1 Update DTOs
- [ ] Add `subscriptionModel` field to `ImportCustomerRecordDto` in `apps/backend/src/customers/dto/import-customers.dto.ts`
- [ ] Add `@IsString()` and `@IsOptional()` decorators
- [ ] Add `subscriptionModel` field to `UpdateCustomerProfileDto` in `apps/backend/src/customers/dto/update-customer-profile.dto.ts`
- [ ] Add `@IsString()` and `@IsOptional()` decorators

### 2.2 Update Customer Service
- [ ] Update `importCustomers` method in `apps/backend/src/customers/customers.service.ts`
- [ ] Add `subscriptionModel` to create operation in transaction
- [ ] Add `subscriptionModel` to update operation in transaction
- [ ] Update `updateCustomer` method to handle `subscriptionModel` in update config
- [ ] Verify `getAllCustomers` returns `subscriptionModel` (should work automatically)

### 2.3 Backend Unit Tests
- [ ] Write test for `ImportCustomerRecordDto` validation with `subscriptionModel`
- [ ] Write test for `UpdateCustomerProfileDto` validation with `subscriptionModel`
- [ ] Write test for `importCustomers` saving `subscriptionModel` on create
- [ ] Write test for `importCustomers` updating `subscriptionModel` on update
- [ ] Write test for `updateCustomer` updating `subscriptionModel`
- [ ] Write test for empty string conversion to null
- [ ] Write test for special characters and Unicode in `subscriptionModel`

## Phase 3: Frontend Layer

### 3.1 Update TypeScript Interfaces
- [ ] Add `subscriptionModel?: string` to `CustomerItem` interface in `apps/frontend/src/app/[locale]/(dashboard)/customers/page.tsx`
- [ ] Add `'subscriptionModel'` to `SortField` type union

### 3.2 Update Customer List Table
- [ ] Add `<SortableHeader field="contractStatus">` column after `phoneNumber`
- [ ] Add `<SortableHeader field="subscriptionModel">` column after `contractStatus`
- [ ] Add table cells for both fields in the map function
- [ ] Display "-" for null/empty values using conditional rendering
- [ ] Update `colSpan` values in loading and empty states to account for new columns

### 3.3 Update Sort Logic
- [ ] Add `case 'contractStatus'` to sort switch statement in `filteredAndSortedCustomers`
- [ ] Add `case 'subscriptionModel'` to sort switch statement
- [ ] Verify null values sort consistently (empty string fallback)

### 3.4 Update Search Filter
- [ ] Add `contractStatus` filter to search logic in `filteredAndSortedCustomers`
- [ ] Add `subscriptionModel` filter to search logic
- [ ] Ensure case-insensitive matching with `.toLowerCase()`
- [ ] Ensure null-safe with `|| ''` fallback

### 3.5 Update CSV Import
- [ ] Add `subscriptionModel` mapping in `apps/frontend/src/app/[locale]/(dashboard)/customers/import/page.tsx`
- [ ] Map from CSV column "Abonelik Modeli" or "Subscription Model"
- [ ] Use `.trim()` and `|| undefined` for empty value handling

### 3.6 Add Translations
- [ ] Add `contractStatus` translation key to `apps/frontend/messages/tr.json`
- [ ] Add `subscriptionModel` translation key to `apps/frontend/messages/tr.json`
- [ ] Add `contractStatus` translation key to `apps/frontend/messages/en.json`
- [ ] Add `subscriptionModel` translation key to `apps/frontend/messages/en.json`
- [ ] Add `contractStatus` translation key to `apps/frontend/messages/de.json`
- [ ] Add `subscriptionModel` translation key to `apps/frontend/messages/de.json`
- [ ] Verify translation keys match usage in components

### 3.7 Frontend Unit Tests
- [ ] Write test for `contractStatus` column rendering
- [ ] Write test for `subscriptionModel` column rendering
- [ ] Write test for null value display as "-"
- [ ] Write test for sort by `contractStatus` ascending
- [ ] Write test for sort by `contractStatus` descending
- [ ] Write test for sort by `subscriptionModel` ascending
- [ ] Write test for sort by `subscriptionModel` descending
- [ ] Write test for search filtering by `contractStatus`
- [ ] Write test for search filtering by `subscriptionModel`
- [ ] Write test for CSV parser extracting `subscriptionModel`
- [ ] Write test for Turkish translations
- [ ] Write test for English translations

## Phase 4: Property-Based Tests

### 4.1 Setup Property Testing
- [ ] Install `fast-check` library: `npm install --save-dev fast-check`
- [ ] Create arbitraries for customer profiles with random data
- [ ] Create arbitraries for CSV rows with random data
- [ ] Create arbitraries for customers with null values

### 4.2 Write Property Tests
- [ ] Write Property Test 1: Migration Data Integrity (100 runs)
- [ ] Write Property Test 2: API Response Field Inclusion (100 runs)
- [ ] Write Property Test 3: CSV Import Round-Trip (100 runs)
- [ ] Write Property Test 4: Empty Value Normalization (100 runs)
- [ ] Write Property Test 5: Sort Functionality (100 runs)
- [ ] Write Property Test 6: Search Filter Inclusivity (100 runs)
- [ ] Write Property Test 7: Null Sort Consistency (100 runs)
- [ ] Tag each test with feature name and property number in comments

## Phase 5: Integration Testing

### 5.1 End-to-End Tests
- [ ] Write E2E test for complete CSV import flow with `subscriptionModel`
- [ ] Write E2E test for customer list display with both columns
- [ ] Write E2E test for sorting by both fields
- [ ] Write E2E test for searching by both fields
- [ ] Write E2E test for language switching (TR/EN)

### 5.2 API Integration Tests
- [ ] Write test for creating customer with `subscriptionModel` via API
- [ ] Write test for updating customer with `subscriptionModel` via API
- [ ] Write test for querying customer list includes `subscriptionModel`
- [ ] Write test for querying single customer includes `subscriptionModel`

## Phase 6: Manual Testing & Validation

### 6.1 Database Verification
- [ ] Run migration on local database
- [ ] Verify column exists: `\d customer_profiles` in psql
- [ ] Insert test record with `subscriptionModel`
- [ ] Query test record to verify data

### 6.2 Backend Verification
- [ ] Start backend server
- [ ] Test import endpoint with CSV containing `subscriptionModel`
- [ ] Test list endpoint returns `subscriptionModel`
- [ ] Test update endpoint accepts `subscriptionModel`
- [ ] Check logs for any errors

### 6.3 Frontend Verification
- [ ] Start frontend development server
- [ ] Navigate to customer list page
- [ ] Verify both columns are visible
- [ ] Click sort on `contractStatus`, verify sorting works
- [ ] Click sort on `subscriptionModel`, verify sorting works
- [ ] Enter search term matching `contractStatus`, verify filtering
- [ ] Enter search term matching `subscriptionModel`, verify filtering
- [ ] Verify null values display as "-"
- [ ] Switch to Turkish locale, verify translations
- [ ] Switch to English locale, verify translations
- [ ] Test CSV import with both fields
- [ ] Verify responsive design on mobile viewport

### 6.4 Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

## Phase 7: Documentation & Deployment

### 7.1 Update Documentation
- [ ] Update API documentation with new field
- [ ] Update CSV import template/documentation
- [ ] Add migration notes to deployment guide
- [ ] Update user guide with new columns

### 7.2 Deployment Preparation
- [ ] Create deployment checklist
- [ ] Prepare rollback plan
- [ ] Schedule deployment window
- [ ] Notify stakeholders

### 7.3 Production Deployment
- [ ] Run migration on staging database
- [ ] Verify staging environment
- [ ] Deploy backend to production
- [ ] Run migration on production database
- [ ] Deploy frontend to production
- [ ] Verify production environment
- [ ] Monitor logs for errors

### 7.4 Post-Deployment Verification
- [ ] Test CSV import in production
- [ ] Verify customer list displays correctly
- [ ] Test sorting and searching
- [ ] Verify translations work
- [ ] Monitor error logs for 24 hours
- [ ] Collect user feedback

## Phase 8: Cleanup & Optimization

### 8.1 Code Review
- [ ] Review all code changes
- [ ] Ensure consistent code style
- [ ] Remove any debug code or console.logs
- [ ] Verify all tests pass

### 8.2 Performance Check
- [ ] Measure page load time with new columns
- [ ] Measure sort performance with large datasets
- [ ] Measure search performance with large datasets
- [ ] Optimize if necessary

### 8.3 Final Documentation
- [ ] Update CHANGELOG
- [ ] Create release notes
- [ ] Archive design and requirements documents
- [ ] Update team knowledge base

## Completion Markers (verify.mjs tarafından okunur)

- [x] 1.1 subscriptionModel schema.prisma'da var
- [x] 1.2 Migration schema'da mevcut
- [x] 2.1 import-customers.dto.ts subscriptionModel alanı var
- [x] 2.2 customers.service.ts subscriptionModel işliyor
- [ ] 2.3 Backend birim testleri (manuel doğrulama)
- [x] 3.1 customers/page.tsx CustomerItem subscriptionModel alanı var
- [x] 3.2 customers/page.tsx subscriptionModel sütunu var
- [x] 3.3 Sort logic subscriptionModel case'i var
- [x] 3.4 Search filter subscriptionModel dahil
- [x] 3.5 CSV import subscriptionModel mapping var
- [ ] 3.6 i18n subscriptionModel key'i customers/table namespace'inde (manuel kontrol)
- [ ] 3.7 Frontend birim testleri (manuel doğrulama)
- [ ] 4.1 Property test setup (fast-check)
- [ ] 4.2 Property testler yazıldı
- [ ] 5.1 E2E testler var
- [ ] 5.2 API integration testler var

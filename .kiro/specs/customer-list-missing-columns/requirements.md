# Feature Requirements: Customer List Missing Columns

## Overview

This feature adds missing `subscriptionModel` field to the customer management system and ensures both `contractStatus` and `subscriptionModel` columns are properly displayed in the frontend customer list with full sorting, searching, and CSV import capabilities.

## Background

The customer management system currently has `contractStatus` field implemented in the backend but not displayed in the frontend. The `subscriptionModel` field is completely missing from both backend and frontend. This feature completes the implementation by:

1. Adding `subscriptionModel` to the database schema and backend
2. Displaying both fields as columns in the frontend customer list
3. Supporting CSV import for both fields
4. Enabling sorting and searching on both fields
5. Providing multi-language support (TR/EN)

## Technical Context

- **Backend**: NestJS + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Database**: PostgreSQL 16
- **Existing Implementation**: `contractStatus` exists in schema and backend but not in frontend UI

## Requirements

### Requirement 1

**User Story**: As a system administrator, I want to add the `subscriptionModel` field to the customer profile, so that I can track which subscription model each customer uses.

#### Acceptance Criteria

1. WHEN the database schema is updated THEN the system SHALL add a `subscriptionModel` field to the `CustomerProfile` model as an optional string field
2. WHEN a database migration is created THEN the system SHALL generate a Prisma migration that adds the `subscription_model` column to the `customer_profiles` table
3. WHEN the migration is applied THEN the system SHALL successfully add the column without data loss
4. WHEN querying customer profiles THEN the system SHALL include the `subscriptionModel` field in the response

### Requirement 2

**User Story**: As a system administrator, I want to import customer data with `subscriptionModel` values from CSV files, so that I can bulk update customer subscription information.

#### Acceptance Criteria

1. WHEN importing a CSV file THEN the system SHALL parse the `subscriptionModel` column from the CSV data
2. WHEN a CSV row contains a `subscriptionModel` value THEN the system SHALL save it to the customer profile
3. WHEN a CSV row has an empty `subscriptionModel` value THEN the system SHALL store it as null
4. WHEN updating an existing customer profile during import THEN the system SHALL update the `subscriptionModel` field if provided
5. WHEN creating a new customer profile during import THEN the system SHALL include the `subscriptionModel` field if provided

### Requirement 3

**User Story**: As a system administrator, I want to see `contractStatus` and `subscriptionModel` columns in the customer list, so that I can quickly view customer contract and subscription information.

#### Acceptance Criteria

1. WHEN viewing the customer list THEN the system SHALL display a `contractStatus` column showing the contract status for each customer
2. WHEN viewing the customer list THEN the system SHALL display a `subscriptionModel` column showing the subscription model for each customer
3. WHEN a customer has no `contractStatus` value THEN the system SHALL display a dash (-) or empty indicator
4. WHEN a customer has no `subscriptionModel` value THEN the system SHALL display a dash (-) or empty indicator
5. WHEN the columns are displayed THEN the system SHALL use appropriate styling consistent with other columns

### Requirement 4

**User Story**: As a system administrator, I want to sort the customer list by `contractStatus` or `subscriptionModel`, so that I can organize customers by their contract or subscription type.

#### Acceptance Criteria

1. WHEN clicking the `contractStatus` column header THEN the system SHALL sort the customer list by contract status in ascending order
2. WHEN clicking the `contractStatus` column header again THEN the system SHALL toggle the sort order to descending
3. WHEN clicking the `subscriptionModel` column header THEN the system SHALL sort the customer list by subscription model in ascending order
4. WHEN clicking the `subscriptionModel` column header again THEN the system SHALL toggle the sort order to descending
5. WHEN sorting by these fields THEN the system SHALL treat null/empty values consistently (e.g., always at the end or beginning)

### Requirement 5

**User Story**: As a system administrator, I want to search customers by `contractStatus` or `subscriptionModel`, so that I can quickly find customers with specific contract or subscription types.

#### Acceptance Criteria

1. WHEN entering a search term THEN the system SHALL filter customers whose `contractStatus` contains the search term (case-insensitive)
2. WHEN entering a search term THEN the system SHALL filter customers whose `subscriptionModel` contains the search term (case-insensitive)
3. WHEN a customer matches the search term in either field THEN the system SHALL include that customer in the filtered results
4. WHEN the search term is cleared THEN the system SHALL display all customers again

### Requirement 6

**User Story**: As a Turkish-speaking administrator, I want to see column headers and labels in Turkish, so that I can use the system in my native language.

#### Acceptance Criteria

1. WHEN the interface language is set to Turkish THEN the system SHALL display "Sözleşme Durumu" for the `contractStatus` column header
2. WHEN the interface language is set to Turkish THEN the system SHALL display "Abonelik Modeli" for the `subscriptionModel` column header
3. WHEN the interface language is set to English THEN the system SHALL display "Contract Status" for the `contractStatus` column header
4. WHEN the interface language is set to English THEN the system SHALL display "Subscription Model" for the `subscriptionModel` column header

### Requirement 7

**User Story**: As a system administrator, I want the backend API to include `subscriptionModel` in customer data responses, so that the frontend can display this information.

#### Acceptance Criteria

1. WHEN the backend returns customer list data THEN the system SHALL include the `subscriptionModel` field in each customer profile object
2. WHEN the backend returns a single customer's data THEN the system SHALL include the `subscriptionModel` field in the customer profile object
3. WHEN the `subscriptionModel` field is null THEN the system SHALL return null (not omit the field)
4. WHEN updating a customer profile THEN the system SHALL accept and save the `subscriptionModel` field if provided in the request

## Non-Functional Requirements

### Performance

- CSV import with `subscriptionModel` field should not significantly impact import performance
- Sorting by `contractStatus` or `subscriptionModel` should complete within 100ms for up to 10,000 customers
- Search filtering should update results within 50ms

### Compatibility

- The migration must be backward compatible and not break existing customer data
- Existing API consumers should continue to work (new field is optional)

### Usability

- Column headers should be clearly labeled and consistent with existing UI patterns
- Empty values should be visually distinct from populated values
- Sorting indicators should be visible and intuitive

## Out of Scope

- Validation of specific `contractStatus` or `subscriptionModel` values (free-text fields)
- Bulk editing of `contractStatus` or `subscriptionModel` from the UI
- Historical tracking of changes to these fields
- Export functionality for these fields (existing export should automatically include them)

## Success Criteria

1. Database migration successfully adds `subscriptionModel` field
2. CSV import correctly processes and saves `subscriptionModel` values
3. Both columns are visible in the customer list UI
4. Sorting works correctly for both columns
5. Search filters customers by both fields
6. Multi-language support works for both column headers
7. No existing functionality is broken

-- CreateSequence: ticket_number_seq
-- This sequence powers the SUP-00001 format ticket numbering.
-- Must be run after the initial Prisma migration creates all tables.

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,type]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Integration_organizationId_type_key" ON "Integration"("organizationId", "type");

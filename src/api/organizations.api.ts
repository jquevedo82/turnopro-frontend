/**
 * organizations.api.ts
 * Cliente HTTP para el módulo de organizaciones.
 * Solo usado por el superadmin.
 */
import { api } from "@/config/api";

export interface OrgSummary {
  id:                number;
  name:              string;
  slug:              string | null;
  address:           string | null;
  phone:             string | null;
  email:             string | null;
  isActive:          boolean;
  createdAt:         string;
  professionalsCount: number;
  secretariesCount:  number;
}

export interface OrgDetail extends OrgSummary {
  professionals: {
    id: number; name: string; email: string;
    slug: string; profession: string; isActive: boolean;
  }[];
  secretaries: {
    id: number; name: string; email: string;
    phone: string | null; isActive: boolean; createdAt: string;
  }[];
}

export interface UnassignedProfessional {
  id: number; name: string; email: string; slug: string; profession: string; isActive: boolean;
}

export const organizationsApi = {
  getAll:       () => api.get<OrgSummary[]>("/organizations").then((r) => r.data),
  getOne:       (id: number) => api.get<OrgDetail>(`/organizations/${id}`).then((r) => r.data),
  getUnassigned:() => api.get<UnassignedProfessional[]>("/organizations/unassigned-professionals").then((r) => r.data),

  create: (data: { name: string; slug?: string; address?: string; phone?: string; email?: string }) =>
    api.post<OrgSummary>("/organizations", data).then((r) => r.data),

  update: (id: number, data: Partial<{ name: string; slug: string; address: string; phone: string; email: string; isActive: boolean }>) =>
    api.patch<OrgSummary>(`/organizations/${id}`, data).then((r) => r.data),

  assignProfessional:  (orgId: number, profId: number) =>
    api.post(`/organizations/${orgId}/assign/${profId}`).then((r) => r.data),

  removeProfessional:  (orgId: number, profId: number) =>
    api.delete(`/organizations/${orgId}/remove/${profId}`).then((r) => r.data),

  // Secretarias
  getSecretaries:  (orgId: number) =>
    api.get(`/organizations/${orgId}/secretaries`).then((r) => r.data),

  createSecretary: (orgId: number, data: { name: string; email: string; phone?: string }) =>
    api.post(`/organizations/${orgId}/secretaries`, data).then((r) => r.data),

  updateSecretary: (orgId: number, secId: number, data: { name?: string; phone?: string }) =>
    api.patch(`/organizations/${orgId}/secretaries/${secId}`, data).then((r) => r.data),

  activateSecretary:   (orgId: number, secId: number) =>
    api.post(`/organizations/${orgId}/secretaries/${secId}/activate`).then((r) => r.data),

  deactivateSecretary: (orgId: number, secId: number) =>
    api.post(`/organizations/${orgId}/secretaries/${secId}/deactivate`).then((r) => r.data),

  resendSecretaryCredentials: (orgId: number, secId: number) =>
    api.post(`/organizations/${orgId}/secretaries/${secId}/resend`).then((r) => r.data),
};

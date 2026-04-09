import { salesFetchJson } from "@/lib/http";

export type InstallationTechnicianBaseInfo = {
  id: number;
  nom?: string | null;
  tel?: string | null;
  photo?: string | null;
};

export async function getInstallationTechniciansBaseInfos(): Promise<InstallationTechnicianBaseInfo[]> {
  return await salesFetchJson<InstallationTechnicianBaseInfo[]>(`/installation-technicians/base-infos`);
}


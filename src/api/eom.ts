import { frappeRequest } from 'src/utils/csrf';

export interface EmployeeMonthlyAward {
  name: string;
  employee: string;
  employee_name?: string;
  month: string;
  attendance_score: number;
  personality_score: number;
  login_score: number;
  leave_penalty: number;
  total_score: number;
  rank: number;
  published: number;
  designation?: string;
  profile_picture?: string;
  display_days?: number;
}

export async function fetchLatestPublishedEom() {
  const res = await frappeRequest(
    `/api/method/company.company.doctype.employee_monthly_award.employee_monthly_award.get_latest_published_eom`
  );
  if (!res.ok) throw new Error('Failed to fetch latest EOM');
  const json = await res.json();
  return json.message as EmployeeMonthlyAward | undefined;
}

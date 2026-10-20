export function canAdminManageChat(row: { recipient_id: string | null } | null): boolean {
  return row !== null && row.recipient_id === null;
}
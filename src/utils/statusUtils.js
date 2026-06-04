export function statusTone(status) {
  if (status === "resolved") return "success";
  if (status === "in_progress") return "info";
  return "danger";
}

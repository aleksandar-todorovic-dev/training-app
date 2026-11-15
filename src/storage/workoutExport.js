/** Request a download; browsers cannot confirm that the user saved the file. */
export function requestWorkoutDownload(raw, filename) {
  if (typeof raw !== "string") return false;
  let url;
  let link;
  try {
    url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
    link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    return true;
  } catch {
    return false;
  } finally {
    link?.remove();
    if (url) setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

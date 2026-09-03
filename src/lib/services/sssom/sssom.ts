export async function parseSssomInServer(file: File) {
  let content = await file.text();
  content = normalizeSssom(content);

  const response = await fetch("/api/sssom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error("SSSOM parsing failed");
  }

  return await response.json();
}

function normalizeSssom(content: string): string {
  return content
    .replace(/^\uFEFF/, "")       // remove optional UTF-8 BOM
    .replace(/\r\n/g, "\n")       // normalize Windows line endings
    .replace(/\n+$/, "");         // remove one or more final newlines
}
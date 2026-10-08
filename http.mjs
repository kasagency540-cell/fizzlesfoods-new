export function json(data, status = 200, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    },
    body: JSON.stringify(data)
  };
}

export function method(event) {
  return (event.httpMethod || "GET").toUpperCase();
}

export function body(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
}

export function cookie(event, name) {
  const raw = event.headers?.cookie || event.headers?.Cookie || "";
  const found = raw.split(";").map(x => x.trim()).find(x => x.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : "";
}

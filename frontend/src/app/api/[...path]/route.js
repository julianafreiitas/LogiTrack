export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_INTERNA_PADRAO = "http://backend:8080/api";
const CABECALHOS_PULAR = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "transfer-encoding",
]);

async function encaminhar(request, contexto) {
  const { path = [] } = await contexto.params;
  const segmentos = path.map((segmento) => encodeURIComponent(segmento)).join("/");
  const bases = [...new Set([
    process.env.API_INTERNAL_URL,
    `http://backend:${process.env.BACKEND_PORT || "8080"}/api`,
    API_INTERNA_PADRAO,
  ].filter(Boolean).map((base) => base.replace(/\/+$/, "")))];
  const headers = new Headers(request.headers);
  for (const header of CABECALHOS_PULAR) headers.delete(header);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();

  for (const base of bases) {
    const destino = `${base}/${segmentos}${new URL(request.url).search}`;
    try {
      const resposta = await fetch(destino, {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      });
      const cabecalhos = new Headers();
      const tipoConteudo = resposta.headers.get("content-type");
      if (tipoConteudo) cabecalhos.set("content-type", tipoConteudo);
      cabecalhos.set("cache-control", "no-store");
      return new Response(resposta.body, {
        status: resposta.status,
        headers: cabecalhos,
      });
    } catch (erro) {
      console.error(`Falha ao encaminhar /api/${segmentos} para ${destino}:`, erro);
    }
  }

  return Response.json(
    { message: "Não foi possível conectar ao backend. Confira se a API está ativa e na mesma rede Docker do frontend." },
    { status: 502 },
  );
}

export const GET = encaminhar;
export const POST = encaminhar;
export const PUT = encaminhar;
export const PATCH = encaminhar;
export const DELETE = encaminhar;

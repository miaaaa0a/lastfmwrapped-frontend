import type { APIRoute } from "astro";
import axios from 'axios';

const getProxyUrl = (request: Request) => {
  const proxyUrl = new URL("http://127.0.0.1:8000/");
  const requestUrl = new URL(request.url);

  return new URL(requestUrl.pathname, proxyUrl);
};

export const ALL: APIRoute = async ({ request }) => {
  const proxyUrl = getProxyUrl(request);
  const response = await axios.get(proxyUrl.href, {params: request, responseType: 'text'});
  return new Response(response.data);
};
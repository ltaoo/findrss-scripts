export function request_authenticated(request, access_token) {
  const authorization = request.headers.get("Authorization");
  return Boolean(access_token) && (authorization !== null
    ? authorization === "Bearer " + access_token
    : new URL(request.url).searchParams.get("token") === access_token);
}

export async function getResults(params) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(params),
  });
  
  return await response.json();
}
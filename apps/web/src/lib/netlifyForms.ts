export type NetlifyFormPayload = Record<string, string | number | boolean | undefined | null>;

export const encodeNetlifyForm = (data: NetlifyFormPayload): string => {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    params.append(key, value == null ? '' : String(value));
  });

  return params.toString();
};

export const submitNetlifyForm = async (
  formName: string,
  data: NetlifyFormPayload
): Promise<void> => {
  const response = await fetch('/__forms.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeNetlifyForm({ 'form-name': formName, ...data }),
  });

  if (!response.ok) {
    throw new Error('We could not submit the form. Please try again or contact dispatch directly.');
  }
};

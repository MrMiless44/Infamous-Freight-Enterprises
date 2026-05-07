export type NetlifyFormPayload = Record<string, string | number | boolean | File | undefined | null>;

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
  const hasFile = Object.values(data).some((value) => typeof File !== 'undefined' && value instanceof File && value.size > 0);

  if (hasFile) {
    const formData = new FormData();
    formData.append('form-name', formName);

    Object.entries(data).forEach(([key, value]) => {
      if (value == null) {
        formData.append(key, '');
        return;
      }

      if (typeof File !== 'undefined' && value instanceof File) {
        if (value.size > 0) {
          formData.append(key, value);
        }
        return;
      }

      formData.append(key, String(value));
    });

    const response = await fetch('/__forms.html', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('We could not submit the form. Please try again or contact dispatch directly.');
    }

    return;
  }

  const response = await fetch('/__forms.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeNetlifyForm({ 'form-name': formName, ...data }),
  });

  if (!response.ok) {
    throw new Error('We could not submit the form. Please try again or contact dispatch directly.');
  }
};

export type NetlifyFormPayload = Record<string, string | number | boolean | File | undefined | null>;

const SUBMISSION_THROTTLE_MS = 30_000;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt']);
const lastSubmissionBySignature = new Map<string, number>();

const getPageUrl = () => (typeof window === 'undefined' ? '' : window.location.href);

const createClientToken = (formName: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${formName}-${crypto.randomUUID()}`;
  }

  return `${formName}-${Date.now().toString(36)}`;
};

const getStringValue = (value: NetlifyFormPayload[string]) => (value == null ? '' : String(value).trim());

const validateEmail = (value: string) => {
  if (!value) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Enter a valid email address.');
  }
};

const validatePhone = (value: string) => {
  if (!value) return;
  if (!/^[+()\-\s.\d]{7,40}$/.test(value)) {
    throw new Error('Enter a valid phone number.');
  }
};

const validateNonNegativeNumber = (label: string, value: string) => {
  if (!value) return;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${label} must be zero or greater.`);
  }
};

const validateDateOrder = (pickupDate: string, deliveryDate: string) => {
  if (!pickupDate || !deliveryDate) return;
  if (new Date(deliveryDate).getTime() < new Date(pickupDate).getTime()) {
    throw new Error('Delivery date must be on or after the pickup date.');
  }
};

const validateFile = (file: File) => {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Attachments must be 8 MB or smaller.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_FILE_EXTENSIONS.has(extension)) {
    throw new Error('Use a PDF, image, document, spreadsheet, CSV, or text attachment.');
  }
};

const validatePayload = (data: NetlifyFormPayload) => {
  validateEmail(getStringValue(data.email));
  validatePhone(getStringValue(data.phone));
  validateNonNegativeNumber('Weight', getStringValue(data.weight));
  validateNonNegativeNumber('Miles', getStringValue(data.miles));
  validateNonNegativeNumber('Estimate low', getStringValue(data.estimateLow));
  validateNonNegativeNumber('Estimate mid', getStringValue(data.estimateMid));
  validateNonNegativeNumber('Estimate high', getStringValue(data.estimateHigh));
  validateDateOrder(getStringValue(data.pickupDate), getStringValue(data.deliveryDate));

  Object.values(data).forEach((value) => {
    if (typeof File !== 'undefined' && value instanceof File && value.size > 0) {
      validateFile(value);
    }
  });
};

const getSubmissionSignature = (formName: string, data: NetlifyFormPayload) =>
  `${formName}:${getStringValue(data.email)}:${getStringValue(data.phone)}:${getStringValue(data.message)}:${getStringValue(data.instructions)}`;

const assertNotDuplicate = (signature: string) => {
  const now = Date.now();
  const previous = lastSubmissionBySignature.get(signature);

  if (previous && now - previous < SUBMISSION_THROTTLE_MS) {
    throw new Error('This form was just submitted. Please wait a moment before trying again.');
  }
};

const preparePayload = (formName: string, data: NetlifyFormPayload): NetlifyFormPayload => ({
  'form-name': formName,
  'csrf-token': getStringValue(data['csrf-token']) || createClientToken(formName),
  clientSubmittedAt: new Date().toISOString(),
  pageUrl: getPageUrl(),
  'bot-field': data['bot-field'] ?? '',
  ...data,
});

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
  validatePayload(data);
  const submissionSignature = getSubmissionSignature(formName, data);
  assertNotDuplicate(submissionSignature);

  const payload = preparePayload(formName, data);
  const hasFile = Object.values(payload).some((value) => typeof File !== 'undefined' && value instanceof File && value.size > 0);

  if (hasFile) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
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

    lastSubmissionBySignature.set(submissionSignature, Date.now());
    return;
  }

  const response = await fetch('/__forms.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeNetlifyForm(payload),
  });

  if (!response.ok) {
    throw new Error('We could not submit the form. Please try again or contact dispatch directly.');
  }

  lastSubmissionBySignature.set(submissionSignature, Date.now());
};

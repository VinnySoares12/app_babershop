const ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";

type AsaasErrorResponse = {
  errors?: Array<{
    code?: string;
    description?: string;
  }>;
};

export type AsaasCustomerPayload = {
  name: string;
  cpfCnpj: string;
  email?: string;
  mobilePhone?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
};

export type AsaasCustomerResponse = {
  id: string;
  name: string;
  cpfCnpj: string;
};

export type AsaasPaymentPayload = {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
};

export type AsaasPaymentResponse = {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  status: string;
  dueDate: string;
  invoiceUrl?: string | null;
};

export type AsaasPixQrCodeResponse = {
  success: boolean;
  payload: string | null;
  encodedImage: string | null;
  expirationDate: string | null;
};

export type AsaasWebhookPayload = {
  event: string;
  payment?: {
    id?: string;
    customer?: string;
    billingType?: string;
    value?: number;
    netValue?: number;
    status?: string;
    dueDate?: string;
    description?: string;
    externalReference?: string;
    invoiceUrl?: string;
    dateCreated?: string;
    paymentDate?: string;
  };
};

export async function asaasRequest<TResponse>(
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      access_token: apiKey,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as AsaasErrorResponse | null;
    const description = errorBody?.errors?.map((item) => item.description).filter(Boolean).join("; ");
    throw new Error(description || `Asaas request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function normalizeDocument(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function toAsaasCurrency(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

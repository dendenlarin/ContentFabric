// === Create ===
export interface CreateParameterDto {
  name: string;       // regex: /^[a-z][a-z0-9_]*$/
  values: string[];   // min 1
}

// === Update ===
export interface UpdateParameterDto {
  name?: string;
  values?: string[];
}

// === Response ===
export interface ParameterResponseDto {
  id: string;
  name: string;
  values: string[];
  createdAt: Date;
  updatedAt: Date;
}

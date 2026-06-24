import { toQR } from "toqr";

export type QrMatrix = {
  modules: boolean[];
  size: number;
};

export function createQrMatrix(content: string): QrMatrix {
  const encoded = toQR(content);
  const size = Math.sqrt(encoded.length);

  if (!Number.isInteger(size)) {
    throw new Error("invalid_qr_matrix");
  }

  return {
    size,
    modules: Array.from(encoded, (value) => value === 1)
  };
}

export function getQrModule(matrix: QrMatrix, x: number, y: number) {
  return matrix.modules[y * matrix.size + x] ?? false;
}

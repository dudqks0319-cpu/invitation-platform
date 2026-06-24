import { createQrMatrix, getQrModule } from "@/lib/qr-code";

describe("QR code matrix", () => {
  it("creates a square matrix for public invitation URLs", () => {
    const matrix = createQrMatrix("https://invitehub.test/invitations/kim-lee-demo");

    expect(matrix.size).toBeGreaterThan(20);
    expect(matrix.modules).toHaveLength(matrix.size * matrix.size);
    expect(getQrModule(matrix, 0, 0)).toBe(true);
    expect(getQrModule(matrix, matrix.size + 1, matrix.size + 1)).toBe(false);
  });
});

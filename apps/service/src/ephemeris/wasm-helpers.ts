/**
 * Reads a null-terminated C string from WASM linear memory.
 * Cap of 256 bytes matches swisseph's fixed `serr` buffer size.
 */
export function readCString(memory: WebAssembly.Memory, ptr: number): string {
  const bytes = new Uint8Array(memory.buffer, ptr);
  let end = 0;
  while (bytes[end] !== 0 && end < 256) end++;
  return new TextDecoder().decode(bytes.subarray(0, end));
}

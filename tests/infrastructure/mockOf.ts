function partialMockOf<T>(partialMock: Partial<T>): T {
  return partialMock as T;
}

export default partialMockOf;

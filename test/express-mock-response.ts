export function MockExpressResponse() {
  const jsonMock = jest.fn().mockReturnValue(undefined);
  const cookieMock = jest.fn().mockReturnValue({
    json: jsonMock,
  });
  const statusMock = jest.fn().mockReturnValue({
    cookie: cookieMock,
  });
  const mockResponseObj: any = {
    status: statusMock,
  };
  return {
    jsonMock,
    cookieMock,
    statusMock,
    mockResponseObj,
  };
}

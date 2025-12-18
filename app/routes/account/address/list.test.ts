import { describe, expect, it, vi } from "vitest";
import { action } from "./list";

/**
 * Mock customerAccount with configurable mutation responses
 */
function createMockCustomerAccount(mutationResult: unknown) {
    return {
        isLoggedIn: vi.fn().mockResolvedValue(true),
        mutate: vi.fn().mockResolvedValue(mutationResult),
    };
}

/**
 * Creates a mock Request object with FormData
 */
function createMockRequest(
    method: string,
    formData: Record<string, string>,
): Request {
    const fd = new FormData();
    for (const [key, value] of Object.entries(formData)) {
        fd.append(key, value);
    }
    return {
        method,
        formData: () => Promise.resolve(fd),
    } as unknown as Request;
}

/**
 * Helper to check if result is an error response (DataWithResponseInit)
 */
function isErrorResponse(result: unknown): boolean {
    return (
        typeof result === "object" &&
        result !== null &&
        "init" in result &&
        typeof (result as { init?: { status?: number } }).init?.status ===
            "number"
    );
}

/**
 * Gets status from DataWithResponseInit
 */
function getErrorStatus(result: unknown): number | undefined {
    if (typeof result === "object" && result !== null && "init" in result) {
        return (result as { init?: { status?: number } }).init?.status;
    }
    return undefined;
}

describe("Address List Action", () => {
    describe("PUT - Update Address", () => {
        it("should successfully update an address when mutation succeeds", async () => {
            const mockCustomerAccount = createMockCustomerAccount({
                data: {
                    customerAddressUpdate: {
                        userErrors: [],
                    },
                },
                errors: null,
            });

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("PUT", {
                addressId: "gid://shopify/CustomerAddress/123",
                firstName: "John",
                lastName: "Doe",
                address1: "123 Main St",
                city: "Berlin",
                zip: "10115",
                territoryCode: "DE",
                zoneCode: "",
            });

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            expect(mockCustomerAccount.mutate).toHaveBeenCalled();
            expect(result).toEqual({
                error: null,
                updatedAddress: expect.objectContaining({
                    firstName: "John",
                    lastName: "Doe",
                }),
                defaultAddress: false,
            });
        });

        it("should return error when mutation has userErrors", async () => {
            const mockCustomerAccount = createMockCustomerAccount({
                data: {
                    customerAddressUpdate: {
                        userErrors: [{ message: "Invalid address" }],
                    },
                },
                errors: null,
            });

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("PUT", {
                addressId: "gid://shopify/CustomerAddress/123",
                firstName: "John",
                lastName: "Doe",
                address1: "123 Main St",
                city: "Berlin",
                zip: "10115",
                territoryCode: "DE",
            });

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            // The action should return a data response with error
            expect(isErrorResponse(result)).toBe(true);
            expect(getErrorStatus(result)).toBe(400);
        });
    });

    describe("POST - Create Address", () => {
        it("should successfully create a new address", async () => {
            const mockCustomerAccount = createMockCustomerAccount({
                data: {
                    customerAddressCreate: {
                        customerAddress: {
                            id: "gid://shopify/CustomerAddress/new",
                        },
                        userErrors: [],
                    },
                },
                errors: null,
            });

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("POST", {
                addressId: "NEW_ADDRESS_ID",
                firstName: "Jane",
                lastName: "Doe",
                address1: "456 Oak Ave",
                city: "Munich",
                zip: "80331",
                territoryCode: "DE",
            });

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            expect(mockCustomerAccount.mutate).toHaveBeenCalled();
            expect(result).toEqual({
                error: null,
                createdAddress: { id: "gid://shopify/CustomerAddress/new" },
                defaultAddress: false,
            });
        });
    });

    describe("DELETE - Delete Address", () => {
        it("should successfully delete an address", async () => {
            const mockCustomerAccount = createMockCustomerAccount({
                data: {
                    customerAddressDelete: {
                        deletedAddressId: "gid://shopify/CustomerAddress/123",
                        userErrors: [],
                    },
                },
                errors: null,
            });

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("DELETE", {
                addressId: "gid://shopify/CustomerAddress/123",
            });

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            expect(mockCustomerAccount.mutate).toHaveBeenCalled();
            expect(result).toEqual({
                error: null,
                deletedAddress: "gid://shopify/CustomerAddress/123",
            });
        });
    });

    describe("Edge Cases", () => {
        it("should return 401 when user is not logged in", async () => {
            const mockCustomerAccount = {
                isLoggedIn: vi.fn().mockResolvedValue(false),
                mutate: vi.fn(),
            };

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("PUT", {
                addressId: "gid://shopify/CustomerAddress/123",
            });

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            expect(isErrorResponse(result)).toBe(true);
            expect(getErrorStatus(result)).toBe(401);
        });

        it("should return 400 when addressId is missing", async () => {
            const mockCustomerAccount = createMockCustomerAccount({});

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("PUT", {});

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            expect(isErrorResponse(result)).toBe(true);
            expect(getErrorStatus(result)).toBe(400);
        });

        it("should return 405 for unsupported methods", async () => {
            const mockCustomerAccount = createMockCustomerAccount({});

            const mockContext = { customerAccount: mockCustomerAccount };
            const mockRequest = createMockRequest("PATCH", {
                addressId: "gid://shopify/CustomerAddress/123",
            });

            const result = await action({
                request: mockRequest,
                context: mockContext as never,
                params: {},
            });

            expect(isErrorResponse(result)).toBe(true);
            expect(getErrorStatus(result)).toBe(405);
        });
    });
});

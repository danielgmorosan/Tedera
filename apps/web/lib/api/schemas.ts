import { z } from "zod";
import { OpenAPIRegistry, OpenApiGeneratorV31 } from "zod-to-openapi";

export const registry = new OpenAPIRegistry();

// Shared schemas
export const AuthTokenSchema = registry.register(
  "AuthToken",
  z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      isKYCVerified: z.boolean(),
    }),
  })
);

export const SignupRequestSchema = registry.register(
  "SignupRequest",
  z.object({
    username: z.string().min(3),
    email: z.string().email().optional(),
    password: z.string().min(6),
    hederaAccountId: z
      .string()
      .regex(/^[0-9]+\.[0-9]+\.[0-9]+$/)
      .optional(),
  })
);

export const LoginRequestSchema = registry.register(
  "LoginRequest",
  z.object({
    username: z.string().optional(),
    password: z.string().min(6).optional(),
    hederaAccountId: z
      .string()
      .regex(/^[0-9]+\.[0-9]+\.[0-9]+$/)
      .optional(),
  })
);

export const PropertyCreateSchema = registry.register(
  "PropertyCreateRequest",
  z.object({
    name: z.string().min(2),
    location: z.string().optional(),
    totalShares: z.number().positive(),
    pricePerShare: z.number().positive(),
    description: z.string().optional(),
  })
);

export const PropertySchema = registry.register(
  "Property",
  z.object({
    _id: z.any(),
    name: z.string(),
    location: z.string().optional(),
    totalShares: z.number(),
    availableShares: z.number(),
    pricePerShare: z.number(),
    description: z.string().optional(),
    createdBy: z.any(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
);

export const PaginationMetaSchema = registry.register(
  "PaginationMeta",
  z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  })
);

export const PropertyListResponseSchema = registry.register(
  "PropertyListResponse",
  z.object({
    properties: z.array(PropertySchema),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  })
);

export const InvestmentCreateSchema = registry.register(
  "InvestmentCreateRequest",
  z.object({
    propertyId: z.string(),
    shares: z.number().positive(),
  })
);

export const InvestmentSchema = registry.register(
  "Investment",
  z.object({
    _id: z.any(),
    user: z.any(),
    property: z.any(),
    shares: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
);

export const InvestmentListResponseSchema = registry.register(
  "InvestmentListResponse",
  z.object({
    investments: z.array(InvestmentSchema),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  })
);

export const DistributionCreateSchema = registry.register(
  "DistributionCreateRequest",
  z.object({
    propertyId: z.string(),
    totalAmount: z.number().positive(),
    description: z.string().optional(),
  })
);

export const DistributionSchema = registry.register(
  "Distribution",
  z.object({
    _id: z.any(),
    property: z.any(),
    totalAmount: z.number(),
    description: z.string().optional(),
    executedAt: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
);

export const EarningsSchema = registry.register(
  "EarningsResponse",
  z.object({
    earnings: z.array(
      z.object({
        distributionId: z.any(),
        property: z.any(),
        userAmount: z.number(),
      })
    ),
  })
);

export function buildOpenAPIDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: { title: "Integrated API", version: "0.1.0" },
    servers: [{ url: "/" }],
  });
}

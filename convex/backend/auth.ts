import { ConvexError } from "convex/values";

async function validateToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader) {
    throw new ConvexError("Authorization header is required");
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer") {
    throw new ConvexError("Authorization header must be Bearer token");
  }

  if (!token) {
    throw new ConvexError("Token is required");
  }

  return token;
}

export async function validateFullAccessKey(request: Request) {
  const token = await validateToken(request);
  const fullAccessKey = process.env.FULL_ACCESS_API_KEY;

  if (!fullAccessKey) {
    throw new ConvexError("FULL_ACCESS_API_KEY is not configured");
  }

  if (token !== fullAccessKey) {
    throw new ConvexError("Invalid API key");
  }
}

export async function validateSmartSocialsAccess(request: Request) {
  const token = await validateToken(request);
  const fullAccessKey = process.env.FULL_ACCESS_API_KEY;
  const smartSocialsKey = process.env.SMART_SOCIALS_API_KEY;

  if (!fullAccessKey || !smartSocialsKey) {
    throw new ConvexError("API keys are not properly configured");
  }

  if (token !== fullAccessKey && token !== smartSocialsKey) {
    throw new ConvexError("Invalid API key");
  }
} 
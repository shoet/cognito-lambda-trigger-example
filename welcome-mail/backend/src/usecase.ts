import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { z } from "zod";
import * as dotenv from "dotenv";

const envSchema = z.object({
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_USER_POOL_CLIENT_ID: z.string().min(1),
});

export type ENV = z.infer<typeof envSchema>;

function getEnv(): ENV {
  try {
    dotenv.config();
  } catch (e) {
    throw new Error("failed to load .env", { cause: e });
  }

  const { success, error, data } = envSchema.safeParse(process.env);
  if (!success) {
    console.error("failed to parse env", error);
    throw new Error("failed to parse env");
  }
  return data;
}

export async function signUp(email: string, password: string) {
  const client = getCognitoClient();

  try {
    const env = getEnv();
    const command = new SignUpCommand({
      ClientId: env.COGNITO_USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    });
    await client.send(command);
  } catch (e) {
    throw new Error("failed to AdminCreateUserCommand", { cause: e });
  }
}

function getCognitoClient() {
  return new CognitoIdentityProviderClient();
}

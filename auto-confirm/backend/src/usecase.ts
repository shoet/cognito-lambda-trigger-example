import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
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

export async function signUp(email: string) {
  const client = getCognitoClient();

  try {
    const env = getEnv();
    const command = new AdminCreateUserCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: email,
      UserAttributes: [{ Name: "email", Value: email }],
      MessageAction: "SUPPRESS",
      ValidationData: [
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    /**
     * UserAttributes.email_verifiedにtrueを設定するか、
     * AdminUpdateUserAttributesCommandでユーザー作成後にemail_verifiedをtrueにするか、
     * いずれかの方法で検証済みにできる
     */
    if (getDomain(email) === "company.com") {
      command.input.UserAttributes?.push({
        Name: "email_verified",
        Value: "true",
      });
    }

    const response = await client.send(command);
  } catch (e) {
    throw new Error("failed to AdminCreateUserCommand", { cause: e });
  }
}

function getCognitoClient() {
  return new CognitoIdentityProviderClient();
}

function getDomain(email: string) {
  return email.split("@").pop();
}

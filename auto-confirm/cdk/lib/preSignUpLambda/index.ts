import { PreSignUpTriggerEvent, PreSignUpTriggerHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.validationData?.["email"];
  if (email && getEmailDomain(email) === "company.com") {
    // このタイミングではまだユーザーが作成されていないのでUserNotFoundExceptionになる
    // await verifyEmail(event);
  }

  // event.request.userAttributes["email_verified"] = "true";
  console.log("event", event);

  return event;
};

function getEmailDomain(email: string) {
  return email.split("@").pop();
}

async function verifyEmail(event: PreSignUpTriggerEvent) {
  const client = new CognitoIdentityProviderClient();

  try {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      UserAttributes: [
        {
          Name: "email_verified",
          Value: "true",
        },
      ],
    });
    await client.send(command);
  } catch (e) {
    console.error("failed to update user attributes", e);
  }
}

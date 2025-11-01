import { PostConfirmationTriggerHandler } from "aws-lambda";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log("event", event);
  const email = event.request.userAttributes["email"];
  if (email) {
    await sendWelcomeMail(email);
  }
  return event;
};

async function sendWelcomeMail(email: string) {
  const client = new SESClient();

  try {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Welcome",
          Charset: "utf-8",
        },
        Body: {
          Text: {
            Data: "Welcome",
            Charset: "utf-8",
          },
        },
      },
      Source: "cognito-example@shoet.team",
    });
    await client.send(command);
  } catch (e) {
    throw new Error("failed to send email", { cause: e });
  }
}

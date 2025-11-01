import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stack = cdk.Stack.of(this);
    const cdkRoot = process.cwd();

    const cognitoTriggerLambdaRole = new cdk.aws_iam.Role(
      this,
      "PostConfirmationLambdaRole",
      {
        roleName: `${stack.stackName}-PostConfirmationLambdaRole`,
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        inlinePolicies: {
          cloudwatch: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                actions: [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                ],
                resources: ["*"],
              }),
            ],
          }),
          ses: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                actions: ["ses:SendEmail"],
                resources: ["*"],
              }),
            ],
          }),
        },
      },
    );

    const postConfirmationLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "PostConfirmationLambda",
      {
        functionName: `${this.stackName}-PostConfirmationLambda`,
        entry: `${cdkRoot}/lib/cognitoTriggerLambda/postConfirmation.ts`,
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
        bundling: {
          forceDockerBundling: false,
        },
        logGroup: new cdk.aws_logs.LogGroup(
          this,
          "PostConfirmationLambdaLogGroup",
          {
            logGroupName: `${stack.stackName}-PostConfirmationLambdaLogGroup`,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          },
        ),
        role: cognitoTriggerLambdaRole,
      },
    );

    const userPool = new cdk.aws_cognito.UserPool(this, "UserPool", {
      userPoolName: `${stack.stackName}-UserPool`,
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      autoVerify: {
        email: true,
      },
      lambdaTriggers: {
        postConfirmation: postConfirmationLambda,
      },
      selfSignUpEnabled: true,
      email: cdk.aws_cognito.UserPoolEmail.withSES({
        fromEmail: "cognito-example@shoet.team",
        fromName: "Myサービス",
        sesRegion: "ap-northeast-1",
        sesVerifiedDomain: "shoet.team",
      }),
      userVerification: {
        emailStyle: cdk.aws_cognito.VerificationEmailStyle.LINK,
        emailBody: "{##この##}リンクをクリックして登録を完了してください。",
        emailSubject: "確認リンク",
      },
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    userPool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: `my-example-domain`,
      },
    });

    const userPoolClient = new cdk.aws_cognito.UserPoolClient(
      this,
      "UserPoolClient",
      {
        userPoolClientName: `${stack.stackName}-UserPoolClient`,
        userPool: userPool,
      },
    );

    new cdk.CfnOutput(this, "PostConfirmationLambdaLogGroupName", {
      value: postConfirmationLambda.logGroup.logGroupName,
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
}

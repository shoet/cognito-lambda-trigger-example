import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stack = cdk.Stack.of(this);
    const cdkRoot = process.cwd();

    const preSignUpLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "preSignUpLambda",
      {
        functionName: `${this.stackName}-PreSignUp`,
        entry: `${cdkRoot}/lib/preSignUpLambda/index.ts`,
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
        bundling: {
          forceDockerBundling: false,
        },
        logGroup: new cdk.aws_logs.LogGroup(this, "PreSignUpLambdaLogGroup", {
          logGroupName: `${stack.stackName}-PreSignUpLambdaLogGroup`,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
        role: new cdk.aws_iam.Role(this, "PreSignUpLambdaRole", {
          roleName: `${stack.stackName}-PreSignUpLambdaRole`,
          assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
          inlinePolicies: {
            cognito: new cdk.aws_iam.PolicyDocument({
              statements: [
                new cdk.aws_iam.PolicyStatement({
                  actions: ["cognito-idp:AdminUpdateUserAttributes"],
                  resources: ["*"],
                }),
              ],
            }),
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
          },
        }),
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
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lambdaTriggers: {
        preSignUp: preSignUpLambda,
      },
    });

    new cdk.CfnOutput(this, "PreSignUpLambdaLogGroupName", {
      value: preSignUpLambda.logGroup.logGroupName,
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
  }
}
